import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import fs from 'node:fs';
import {partitionScene,markForeground,BACKGROUND,FOREGROUND} from '../src/scene-layers.js';
import {createStudyMotion} from '../src/study-motion.js';
const bytes=fs.readFileSync(new URL('../public/models/cozy-room.glb',import.meta.url));
const {scene}=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
scene.updateMatrixWorld(true);let triangles=0;const hero=[],pages=[];
scene.traverse(o=>{if(o.isMesh){triangles+=o.geometry.index.count/3;o.material.side=THREE.DoubleSide;if(o.name.includes('Chatito'))hero.push({o,y:o.position.y});if(o.name.includes('ReadingPage'))pages.push(o);}});
const ray=new THREE.Raycaster(),probes=[];
// Cover lamp shade + stalk + desktop. Foreground geometry must retain its exact
// surface position while disappearing completely from the background plate.
for(const x of [-3.3,-3.1,-2.9,-2.7])for(const y of [1.3,1.7,2.15,2.3,2.4]){
 ray.set(new THREE.Vector3(x,y,5.6),new THREE.Vector3(0,0,-1));const hit=ray.intersectObject(scene)[0];
 if(hit?.object.name.startsWith('Web_Room')&&hit.point.z>1.15)probes.push({x,y,z:hit.point.z});
}
assert.ok(probes.length>=8,'lamp/desk probes hit the source asset');
partitionScene(scene);scene.updateMatrixWorld(true);let splitTriangles=0;
scene.traverse(o=>{if(o.isMesh)splitTriangles+=o.geometry.index.count/3});assert.equal(splitTriangles,triangles,'no missing or duplicated triangles');
for(const {x,y,z} of probes){
 ray.set(new THREE.Vector3(x,y,5.6),new THREE.Vector3(0,0,-1));ray.layers.set(FOREGROUND);const fg=ray.intersectObject(scene)[0];assert.ok(fg);assert.ok(Math.abs(fg.point.z-z)<1e-6,'foreground surface unchanged');
 ray.layers.set(BACKGROUND);const bg=ray.intersectObject(scene)[0];assert.ok(!bg||bg.point.z<z-.01,'lamp/desk cannot leak into background sampling');
}
const existing=new Set(scene.children);const motion=createStudyMotion(scene,hero,pages);for(const child of scene.children)if(!existing.has(child))markForeground(child);
for(const action of ['reading','page-turn','pencil-play','writing','water']){
 motion.preview(action);for(let i=0;i<45;i++)motion.update(.1,{state:{started:false,complete:false,phase:'study'},focusing:false,revision:0},true);
 scene.traverse(o=>{if(o.isMesh&&(o.name.includes('Chatito')||o.name.includes('ReadingPage')))assert.equal(o.layers.mask,1<<FOREGROUND);});
 for(const name of ['Chatito study pencil','Chatito water cup','Chatito working hourglass'])scene.getObjectByName(name).traverse(o=>{if(o.isMesh)assert.equal(o.layers.mask,1<<FOREGROUND)});
}
console.log(`PASS: ${probes.length} lamp/desk rays isolated from background, ${triangles} triangles preserved, animated foreground retained.`);
