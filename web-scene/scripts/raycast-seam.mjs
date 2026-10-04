// Regression: front-facing grid seams must hit Chatito, never the room behind him.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import fs from 'node:fs';

const bytes=fs.readFileSync(new URL('../public/models/cozy-room.glb',import.meta.url));
const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(
  bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
gltf.scene.updateMatrixWorld(true);
const head=gltf.scene.getObjectByName('Web_Chatito_Head');
assert.ok(head,'Published GLB has a head');
const pivot=new THREE.Group();
pivot.position.set(-1.85,1.48,1.84);
gltf.scene.add(pivot);
pivot.attach(head);
const ray=new THREE.Raycaster();
const camera=new THREE.Vector3(-1.85,1.95,5.6);
let checks=0;
for(const [tilt,turn,breath] of [[0,0,0],[0,0,.004],[.22,-.035,-.004],[.238,.035,.004]]){
  pivot.rotation.set(tilt,turn,0);
  pivot.position.y=1.48+breath;
  pivot.position.z=1.84+(tilt?.045:0);
  gltf.scene.updateMatrixWorld(true);
  for(const y of [1.60,1.78,1.96,2.23,2.38]){
    for(const dx of [-.002,-.0005,0,.0005,.002]){
      const point=new THREE.Vector3(dx,y-1.48,2.26-1.84).applyMatrix4(pivot.matrixWorld);
      for(const perspective of [false,true]){
        const origin=perspective?camera:new THREE.Vector3(point.x,point.y,5.6);
        const direction=point.clone().sub(origin).normalize();
        ray.set(origin,direction);
        const hit=ray.intersectObject(head)[0];
        assert.ok(hit&&hit.distance<4.2,`Open seam at y=${y}, dx=${dx}, tilt=${tilt}, perspective=${perspective}`);
        checks++;
      }
    }
  }
}
console.log(`Voxel seam regression: ${checks} rays blocked in frontal, breathing and reading poses.`);
