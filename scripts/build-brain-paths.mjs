import fs from 'node:fs/promises';
import * as THREE from 'three';
import {MeshBVH, acceleratedRaycast} from 'three-mesh-bvh';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const bytes=await fs.readFile('public/annienexus/brain-hra.glb');
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
gltf.scene.updateMatrixWorld(true);
const bounds=new THREE.Box3().setFromObject(gltf.scene),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
const scale=3.65/Math.max(size.x,size.y,size.z), parts=[];
gltf.scene.traverse(mesh=>{
 if(!mesh.isMesh)return;
 let geo=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
 if(geo.index)geo=geo.toNonIndexed();
 for(const key of Object.keys(geo.attributes))if(key!=='position')geo.deleteAttribute(key);
 geo.translate(-center.x,-center.y,-center.z).scale(scale,scale,scale);parts.push(geo);
});
const geometry=mergeGeometries(parts);geometry.boundsTree=new MeshBVH(geometry);
const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
mesh.raycast=acceleratedRaycast;mesh.updateMatrixWorld(true);
const ray=new THREE.Raycaster();ray.firstHitOnly=true;
function surface(az,lat){
 lat=Math.max(-1.45,Math.min(1.45,lat));
 const direction=new THREE.Vector3(Math.cos(lat)*Math.sin(az),Math.sin(lat),Math.cos(lat)*Math.cos(az));
 ray.set(direction.clone().multiplyScalar(5),direction.clone().negate());
 const hit=ray.intersectObject(mesh,false)[0];
 if(!hit)throw new Error('Surface ray missed; do not invent an off-surface path.');
 return hit.point.multiplyScalar(1.006).toArray().map(n=>+n.toFixed(5));
}
let seed=142;function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
const nodes=[[.6,.42],[1.12,.02],[1.5,-.46]];
const paths=[];
for(let channel=0;channel<3;channel++)for(let branch=0;branch<12;branch++){
 const [az,lat]=nodes[channel],direction=branch/12*Math.PI*2,reach=.28+random()*.62,twist=random()*6;
 const points=[];for(let j=0;j<40;j++){const t=j/39;points.push(surface(az+Math.cos(direction)*reach*t+Math.sin(t*8+twist)*.026*t,lat+Math.sin(direction)*reach*t+Math.sin(t*9+twist)*.018*t));}
 paths.push({channel,major:true,points});
 for(let fork=0;fork<2;fork++){
 const at=.3+fork*.25,aa=az+Math.cos(direction)*reach*at,ll=lat+Math.sin(direction)*reach*at,angle=direction+(fork?1:-1)*.85;
 const twig=[];for(let j=0;j<24;j++){const t=j/23;twig.push(surface(aa+Math.cos(angle)*.24*t+Math.sin(t*9)*.012,ll+Math.sin(angle)*.24*t));}
 paths.push({channel,major:false,points:twig});
 }
}
for(let p=0;p<96;p++){const az=random()*Math.PI*2,lat=-1.05+random()*2.1,angle=random()*6.28;const points=[];for(let j=0;j<24;j++){const t=j/23;points.push(surface(az+Math.cos(angle)*.34*t+Math.sin(t*12)*.018,lat+Math.sin(angle)*.34*t+Math.cos(t*9)*.012));}paths.push({channel:-1,major:false,points});}
await fs.writeFile('public/annienexus/brain-paths.json',JSON.stringify({description:'Illustrative surface-projected causal channels. No anatomical or financial measurement.',nodes:nodes.map(([a,l])=>surface(a,l)),paths}));
console.log(`Generated ${paths.length} illustrative 3D paths.`);
