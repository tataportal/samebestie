import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {GESTURES,storyAt,gesturePose,createFaceRig,createBookRig} from '../src/personality.js';
import {createStudyMotion} from '../src/study-motion.js';
import {partitionScene,FOREGROUND} from '../src/scene-layers.js';
assert.equal(storyAt(15),null,'quiet time remains quiet');
assert.equal(storyAt(36).id,'reread');assert.equal(storyAt(44).id,'thinking');assert.equal(storyAt(52).id,'aha');
assert.notDeepEqual(storyAt(36),storyAt(296),'next lap varies the sequence');
assert.equal(gesturePose('reread',1.5).bubble.kind,'question');assert.equal(gesturePose('reread',4).bubble.kind,'questions');
assert.equal(gesturePose('breathe',3.9).bubble.kind,'inhale');assert.equal(gesturePose('breathe',4).bubble.kind,'exhale');assert.equal(gesturePose('breathe',10).bubble.kind,'inhale');
const scene=new THREE.Scene(),motion=createStudyMotion(scene,[],[]),idle={focusing:false,reading:false,state:{}};
for(const id of Object.keys(GESTURES)){
 motion.preview(id);for(let i=0;i<20;i++)motion.update(.1,idle,true);assert.equal(motion.action,id);
 const a=motion.update(0,idle,false);for(let i=0;i<10;i++)motion.update(.1,idle,false);const b=motion.update(0,idle,false);assert.deepEqual(b.personality,a.personality,'motion switch freezes each gesture');
 motion.clearPreview();for(let i=0;i<100;i++)motion.update(.1,idle,true);assert.equal(scene.getObjectByName('Closing book cover').rotation.z<.0001,true);assert.equal(scene.getObjectByName('Chatito bookmark').visible,false);
}
// Exercise natural choreography and a paused session without previews.
const auto=createStudyMotion(new THREE.Scene(),[],[]);const s={focusing:true,reading:true,state:{started:true,running:true,phase:'study'},revision:0};
for(let i=0;i<400;i++)auto.update(.1,s,true);assert.equal(auto.action,'reread');const before=auto.update(0,s,true).personality;
for(let i=0;i<50;i++)auto.update(.1,{...s,reading:false,state:{...s.state,running:false}},true);
assert.deepEqual(auto.update(0,{...s,reading:false,state:{...s.state,running:false}},true).personality,before,'manual pause freezes the reaction story');
// Verify separation against actual shipped triangles, including face sockets.
const bytes=fs.readFileSync(new URL('../public/models/cozy-room.glb',import.meta.url));const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const root=gltf.scene;partitionScene(root);root.updateMatrixWorld(true);const head=root.getObjectByName('Web_Chatito_Head'),oldCount=head.geometry.index.count,face=createFaceRig(head);
const count=head.geometry.index.count+face.glasses.geometry.index.count+face.eyes.reduce((n,e)=>n+e.pivot.children[0].geometry.index.count,0);
assert.equal(count,oldCount,'separating face parts preserves every original triangle');
assert.ok(face.glasses.geometry.index.count>100);assert.equal(face.glasses.layers.mask,1<<FOREGROUND);
face.update(gesturePose('breathe',2));root.updateMatrixWorld(true);assert.ok(face.eyes.every(e=>e.pivot.scale.y<.1));
const ray=new THREE.Raycaster(new THREE.Vector3(-2.10,2.00,3),new THREE.Vector3(0,0,-1));ray.layers.set(FOREGROUND);
assert.equal(ray.intersectObject(head)[0].object.name,'Eye socket backing','closing eyes exposes cream backing, not dark sockets');
const book=createBookRig(root);assert.ok(book.pivot.children.length>0,'actual book half is articulated');book.update(1,7);root.updateMatrixWorld(true);
const bounds=new THREE.Box3().setFromObject(book.pivot);assert.ok(bounds.max.x<-1.84&&bounds.min.y>1.35,'closed half rests on the other half of the book');
book.update(0,null);assert.equal(book.marker.visible,false);assert.equal(book.pivot.rotation.z,0);
console.log('PASS: 12 gesture previews, varying quiet sequences, 4/6 breathing, pause/reduced-motion, original face triangles, closed-eye backing and real book closing.');
