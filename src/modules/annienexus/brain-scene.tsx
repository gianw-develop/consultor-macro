"use client";
import { useEffect, useRef, useState } from "react";
import { ECONOMIC_COLORS, type Tone } from "./economic-reading";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

type Actions = { reset: () => void; rotate: (direction: number) => void; invalidate: () => void };
type SurfacePaths = { nodes: number[][]; paths: { channel: number; major: boolean; points: number[][] }[] };

export function BrainScene({ channel, paused, resetToken, turn, visual }: { channel: number; paused: boolean; resetToken: number; turn: number; visual:{body:Tone;veins:Tone[]} }) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ channel, paused, visual });
  const actions = useRef<Actions | null>(null);
  const [status, setStatus] = useState("Cargando modelo tridimensional…");
  useEffect(() => { state.current = { channel, paused, visual }; actions.current?.invalidate(); }, [channel, paused, visual]);
  useEffect(() => { actions.current?.reset(); }, [resetToken]);
  useEffect(() => { if (turn) actions.current?.rotate(Math.sign(turn)); }, [turn]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const abort = new AbortController();
    let disposed = false, frame = 0, visible = true;
    let requestRender = () => {};
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const visibilityChange = () => { requestRender(); };
    document.addEventListener("visibilitychange", visibilityChange);
    media.addEventListener("change", visibilityChange);
    const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; if (visible) requestRender(); });
    intersection.observe(container);
    let renderer: THREE.WebGLRenderer | undefined, controls: OrbitControls | undefined;
    let composer: EffectComposer | undefined, bloom: UnrealBloomPass | undefined, output: OutputPass | undefined;
    let resize: ResizeObserver | undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .01, 50);
    const initial = new THREE.Vector3(5.1, .8, 2.1);
    camera.position.copy(initial);
    const group = new THREE.Group(); group.scale.set(1.05, 1.04, 1.3); scene.add(group);
    const cleanup = () => {
      cancelAnimationFrame(frame); resize?.disconnect(); intersection.disconnect(); controls?.dispose();
      document.removeEventListener("visibilitychange", visibilityChange); media.removeEventListener("change", visibilityChange);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(o => { if (o instanceof THREE.Mesh) { geometries.add(o.geometry); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m)); } });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
      bloom?.dispose(); output?.dispose(); composer?.dispose(); renderer?.dispose(); renderer?.domElement.remove(); actions.current = null;
    };
    async function start() {
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x001522, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
        renderer.domElement.setAttribute("aria-label", "Cerebro tridimensional. Arrastra para girar. También puedes usar los botones de giro.");
        renderer.domElement.setAttribute("role", "img"); container!.appendChild(renderer.domElement);
        scene.add(new THREE.HemisphereLight(0xc5e6e2, 0x00101a, .85));
        const key = new THREE.DirectionalLight(0xa9dcff, 2.2); key.position.set(2, 5, 4); scene.add(key);
        const rim = new THREE.DirectionalLight(0x1faee9, 3); rim.position.set(-4, 1, -3); scene.add(rim);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false; controls.enableDamping = true; controls.minDistance = 4.5; controls.maxDistance = 10; controls.autoRotateSpeed = .18;
        controls.update();
        composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
        bloom = new UnrealBloomPass(new THREE.Vector2(800, 500), .72, .62, .64); composer.addPass(bloom);
        output = new OutputPass(); composer.addPass(output);
        resize = new ResizeObserver(() => {
          const w = container!.clientWidth, h = container!.clientHeight;
          renderer?.setSize(w, h); composer?.setSize(w, h);
          camera.aspect = w / h; camera.zoom = Math.min(1, camera.aspect / 1.65); camera.updateProjectionMatrix(); requestRender();
        }); resize.observe(container!);
        const [modelResponse, pathResponse] = await Promise.all([
          fetch("/annienexus/brain-surface.bin.gz", { signal: abort.signal }), fetch("/annienexus/brain-paths.json", { signal: abort.signal }),
        ]);
        if (!modelResponse.ok || !pathResponse.ok) throw new Error("model");
        if (!modelResponse.body || typeof DecompressionStream === "undefined") throw new Error("decompression unavailable");
        const [data, network] = await Promise.all([new Response(modelResponse.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer(), pathResponse.json() as Promise<SurfacePaths>]);
        if (disposed) return;
        const header = new DataView(data);
        if (data.byteLength < 16 || new TextDecoder().decode(new Uint8Array(data, 0, 4)) !== "ANB1") throw new Error("surface format");
        const vertices = header.getUint32(4, true), indices = header.getUint32(8, true);
        if (data.byteLength !== 16 + vertices * 24 + indices * 4) throw new Error("surface length");
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(data, 16, vertices * 3), 3));
        geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(data, 16 + vertices * 12, vertices * 3), 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(data, 16 + vertices * 24, indices), 1));
        const surface=new THREE.MeshPhysicalMaterial({roughness:.78,metalness:.16,clearcoat:.05,emissiveIntensity:.5});
        group.add(new THREE.Mesh(geometry,surface));
        const fresnel = new THREE.ShaderMaterial({
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
          uniforms: { color: { value: new THREE.Color(0x268dc4) } },
          vertexShader: `varying vec3 vN; varying vec3 vEye; varying vec3 vPos; void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vEye=normalize(-p.xyz);vPos=position;gl_Position=projectionMatrix*p;}`,
          fragmentShader: `uniform vec3 color; varying vec3 vN; varying vec3 vEye; varying vec3 vPos; void main(){float edge=pow(1.-abs(dot(normalize(vN),normalize(vEye))),2.6);float vein=pow(abs(sin(vPos.x*39.+sin(vPos.y*21.)*2.+sin(vPos.z*27.))),45.);float fine=pow(abs(sin(vPos.y*51.+sin(vPos.z*36.)*2.+sin(vPos.x*31.))),60.);gl_FragColor=vec4(color*(edge*2.4+vein*.23+fine*.13),edge*.82+vein*.2+fine*.12);}`,
        });
        group.add(new THREE.Mesh(geometry, fresnel));
        const veinColor=(index:number)=>ECONOMIC_COLORS[state.current.visual.veins[index]??"neutral"];
        const tubes = new Map<number, THREE.BufferGeometry[]>();
        const flow: { curve: THREE.CatmullRomCurve3; dot: THREE.Mesh; channel: number; offset: number }[] = [];
        const particleGeometry = new THREE.SphereGeometry(.015, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 1.65, 1.8), toneMapped: false });
        network.paths.forEach((path, i) => {
          // Reuse every approved path. Three primary branches remain the early pillars;
          // a subset of existing paths carries the other five documented families.
          const family=path.channel<0?-1:i%5===0?3+(Math.floor(i/5)%5):path.channel;
          const curve = new THREE.CatmullRomCurve3(path.points.map(p => new THREE.Vector3(...p)));
          const list = tubes.get(family) ?? [];
          list.push(new THREE.TubeGeometry(curve, path.major ? 70 : 40, path.major ? .0055 : .0022, 4, false)); tubes.set(family, list);
          if (path.major && i % 3 === 0) { const dot = new THREE.Mesh(particleGeometry, particleMaterial); group.add(dot); flow.push({ curve, dot, channel: family, offset: i * .173 }); }
        });
        const vesselMaterials: { material: THREE.MeshBasicMaterial; channel: number }[] = [];
        for (const [channel, pieces] of tubes) {
          const geo = mergeGeometries(pieces); pieces.forEach(p => p.dispose()); if (!geo) continue;
          const material = new THREE.MeshBasicMaterial({ color: channel < 0 ? 0x52727b : veinColor(channel), transparent: true, opacity: channel < 0 ? .24 : .8, toneMapped: false });
          vesselMaterials.push({ material, channel }); group.add(new THREE.Mesh(geo, material));
        }
        const nodeMaterials:{material:THREE.MeshBasicMaterial;channel:number;halo:boolean}[]=[];
        network.nodes.forEach((p, i) => {
          const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(veinColor(i)).multiplyScalar(1.45), toneMapped: false });
          const node = new THREE.Mesh(new THREE.SphereGeometry(.045, 16, 16), material); node.position.set(...p as [number, number, number]); group.add(node);
          const haloMaterial=new THREE.MeshBasicMaterial({color:veinColor(i),transparent:true,opacity:.15,depthWrite:false,blending:THREE.AdditiveBlending});
          const halo=new THREE.Mesh(new THREE.SphereGeometry(.08,16,16),haloMaterial);halo.position.copy(node.position);group.add(halo);
          nodeMaterials.push({material,channel:i,halo:false},{material:haloMaterial,channel:i,halo:true});
        });
        actions.current = {
          invalidate() { requestRender(); },
          reset() { camera.position.copy(initial); controls?.target.set(0, 0, 0); controls?.update(); requestRender(); },
          rotate(direction) { camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), direction * .3); controls?.update(); requestRender(); },
        };
        function applyEconomicColors(){
          const bodyColor=ECONOMIC_COLORS[state.current.visual.body];
          const toneLabel={green:"verde",red:"rojo",mixed:"mixto",neutral:"sin confirmación"};
          surface.color.set(bodyColor).multiplyScalar(.13);surface.emissive.set(bodyColor).multiplyScalar(.08);
          fresnel.uniforms.color.value.set(bodyColor).multiplyScalar(.72);
          rim.color.set(bodyColor); key.color.set(0xc8e8e6);
          vesselMaterials.forEach(v=>{v.material.color.set(v.channel<0?"#52727b":veinColor(v.channel));v.material.opacity=v.channel<0?.22:v.channel===state.current.channel?1:.7;});
          nodeMaterials.forEach(n=>n.material.color.set(veinColor(n.channel)).multiplyScalar(n.halo?1:1.45));
          renderer?.domElement.setAttribute("aria-label",`Cerebro conectado. Cuerpo ${toneLabel[state.current.visual.body]}; familias ${state.current.visual.veins.map(t=>toneLabel[t]).join(", ")}. Arrastra para girar. La explicación textual detalla cada estado.`);
        }
        let last = performance.now(), time = 0;
        requestRender = () => { if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(render); };
        controls.addEventListener("change", requestRender);
        function render(now: number) {
          frame = 0;
          if (disposed || !visible || document.hidden) { last = now; return; }
          const motion = !state.current.paused && !media.matches;
          if (motion && now - last < 1000 / 30) { requestRender(); return; }
          const delta = Math.max(0, Math.min((now - last) / 1000, .1)); last = now;
          if (motion) time += delta;
          applyEconomicColors();
          flow.forEach(p => { p.dot.visible = p.channel === state.current.channel; p.dot.position.copy(p.curve.getPointAt((time * .075 + p.offset) % 1)); });
          if (controls) { controls.autoRotate = motion; controls.update(delta); }
          composer?.render();
          if (motion) requestRender();
        }
        // Keep a complete first frame even when loading finishes while Chrome
        // throttles animation callbacks in a background tab. "Ready" follows a draw.
        flow.forEach(p => { p.dot.visible = p.channel === state.current.channel; p.dot.position.copy(p.curve.getPointAt(p.offset % 1)); });
        applyEconomicColors();
        composer.render();
        setStatus("Modelo 3D listo");
        requestRender();
      } catch (error) {
        if (!disposed && !(error instanceof DOMException && error.name === "AbortError")) { setStatus("No se pudo cargar el visor 3D. La explicación sigue disponible."); cleanup(); }
      }
    }
    void start(); return () => { disposed = true; abort.abort(); cleanup(); };
  }, []);
  return <div className="brain-canvas-wrap"><div ref={host} className="brain-canvas" data-testid="brain-3d" /><p className="canvas-status" role="status">{status}</p><span className="canvas-hint">Arrastra para girar · Rueda o gesto para acercar</span></div>;
}
