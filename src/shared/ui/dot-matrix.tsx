"use client";
import { useEffect, useRef } from "react";

/**
 * Fondo de matriz de puntos animada (WebGL). Los puntos aparecen desde el centro
 * y parpadean en ámbar y gris terminal. Usa el Three.js del proyecto (sin CDN).
 * Con movimiento reducido se dibuja un solo fotograma estático.
 */
export function DotMatrix() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let disposed = false, frame = 0;
    let cleanup: (() => void) | undefined;
    import("three").then(THREE => {
      if (disposed || !canvas.current) return;
      const el = canvas.current;
      const renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: false });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr) },
        u_opacities: { value: [0.15, 0.15, 0.2, 0.3, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0] },
        u_colors: { value: [
          new THREE.Vector3(1.0, 0.63, 0.16), new THREE.Vector3(1.0, 0.63, 0.16),
          new THREE.Vector3(0.55, 0.6, 0.64), new THREE.Vector3(0.55, 0.6, 0.64),
          new THREE.Vector3(0.35, 0.39, 0.42), new THREE.Vector3(0.3, 0.77, 0.9),
        ] },
        u_total_size: { value: 20.0 * dpr },
        u_dot_size: { value: 4.0 * dpr },
      };
      const material = new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        transparent: true,
        blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor,
        uniforms,
        vertexShader: `
          precision mediump float;
          uniform vec2 u_resolution;
          out vec2 fragCoord;
          void main() {
            gl_Position = vec4(position, 1.0);
            fragCoord = (position.xy + 1.0) * 0.5 * u_resolution;
            fragCoord.y = u_resolution.y - fragCoord.y;
          }`,
        fragmentShader: `
          precision mediump float;
          in vec2 fragCoord;
          uniform float u_time;
          uniform float u_opacities[10];
          uniform vec3 u_colors[6];
          uniform float u_total_size;
          uniform float u_dot_size;
          uniform vec2 u_resolution;
          out vec4 fragColor;
          float PHI = 1.61803398874989484820459;
          float random(vec2 xy) { return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x); }
          void main() {
            vec2 st = fragCoord.xy;
            st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
            st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));
            float opacity = step(0.0, st.x) * step(0.0, st.y);
            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
            vec3 color = u_colors[int(show_offset * 6.0)];
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float intro = distance(center_grid, st2) * 0.01 + random(st2) * 0.15;
            opacity *= step(intro, u_time * 3.0);
            opacity *= clamp((1.0 - step(intro + 0.1, u_time * 3.0)) * 1.25, 1.0, 1.25);
            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
          }`,
      });
      const geometry = new THREE.PlaneGeometry(2, 2);
      scene.add(new THREE.Mesh(geometry, material));

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = performance.now();
      const draw = () => {
        uniforms.u_time.value = reduced ? 30 : (performance.now() - start) / 1000;
        renderer.render(scene, camera);
        if (!reduced && !disposed) frame = requestAnimationFrame(draw);
      };
      draw();
      const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        uniforms.u_resolution.value.set(window.innerWidth * dpr, window.innerHeight * dpr);
        if (reduced) draw();
      };
      window.addEventListener("resize", resize);
      cleanup = () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(frame);
        geometry.dispose(); material.dispose(); renderer.dispose();
      };
    }).catch(() => { /* sin WebGL: queda el fondo negro */ });
    return () => { disposed = true; cleanup?.(); };
  }, []);

  return <canvas ref={canvas} className="term-dots" aria-hidden="true" />;
}
