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

// Sweep the actual beak triangles against the articulated book's volume.
// A final-frame screenshot misses the collision near the vertical midpoint.
const {headTransform}=await import('../src/personality.js');
const p=head.geometry.attributes.position,c=head.geometry.attributes.color,indices=head.geometry.index;
const beak=[];const originalPivot=new THREE.Vector3(-1.85,1.48,1.84);
for(let i=0;i<indices.count;i+=3){const j=indices.getX(i);if(c.getX(j)<.8||c.getY(j)>.5)continue;beak.push(new THREE.Triangle(...[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,indices.getX(i+k)).applyMatrix4(head.matrixWorld).sub(originalPivot))))}
const half=book.pivot.children[0],box=half.geometry.boundingBox.clone().applyMatrix4(half.matrix).expandByScalar(.008);
const rigScene=new THREE.Scene(),rig=createStudyMotion(rigScene,[],[]),cover=rigScene.getObjectByName('Closing book cover');
const transform=new THREE.Matrix4(),beakToCover=new THREE.Matrix4(),quat=new THREE.Quaternion(),tri=new THREE.Triangle();let oldCollision=false,samples=0;
function overlaps(activity){const h=headTransform(activity);transform.compose(h.position,quat.setFromEuler(h.rotation),new THREE.Vector3(1,1,1));cover.updateWorldMatrix(true,false);beakToCover.copy(cover.matrixWorld).invert().multiply(transform);return beak.some(t=>{tri.copy(t);tri.a.applyMatrix4(beakToCover);tri.b.applyMatrix4(beakToCover);tri.c.applyMatrix4(beakToCover);return box.intersectsTriangle(tri)})}
rig.preview('finish');
for(let i=0;i<240;i++){const a=rig.update(1/30,idle,true);if(i%2===0&&cover.rotation.z>.05&&cover.rotation.z<Math.PI-.05){samples++;assert.equal(overlaps(a),false,`beak clearance while closing at frame ${i}`);oldCollision ||= overlaps({...a,bookClearance:0});}}
assert.ok(samples>20);assert.ok(oldCollision,'regression reproduces the old beak intersection');
rig.preview('writing');let writesAfterOpen=false;
for(let i=0;i<240;i++){const a=rig.update(1/30,idle,true);if(cover.rotation.z>.001){assert.equal(a.writing,0,'writing waits until the book is open');assert.equal(overlaps(a),false,'beak clearance while reopening')}else if(a.writing>.8)writesAfterOpen=true;}
assert.ok(writesAfterOpen,'queued writing starts after the safe return');
rig.preview('water');const waterState=rig.update(.1,idle,true);assert.equal(waterState.writing,0);assert.equal(waterState.turning,0);
rig.preview('finish');for(let i=0;i<240;i++)rig.update(1/30,idle,true);rig.preview('finish');let reopened=false,reclosed=false;for(let i=0;i<450;i++){rig.update(1/30,idle,true);if(cover.rotation.z<.001)reopened=true;if(reopened&&cover.rotation.z>Math.PI-.001)reclosed=true;}assert.ok(reopened&&reclosed,'replaying finish first opens safely, then replays the full closure');
rig.clearPreview();const complete={focusing:false,reading:false,revision:1,state:{started:true,running:false,complete:true,phase:'study'}};
for(let i=0;i<360;i++){const a=rig.update(1/30,complete,true);if(cover.rotation.z>.05&&cover.rotation.z<Math.PI-.05)assert.equal(overlaps(a),false,'automatic completion also clears the face');}
assert.ok(cover.rotation.z>Math.PI-.001,'automatic completion reaches a fully closed book');
rig.preview('writing');rig.update(.1,idle,true);const frozen=rig.update(0,idle,false),frozenAngle=cover.rotation.z;for(let i=0;i<30;i++)rig.update(1/30,idle,false);assert.equal(cover.rotation.z,frozenAngle);assert.equal(rig.update(0,idle,false).bookClearance,frozen.bookClearance,'motion off freezes the safe return');
console.log('PASS: swept beak/book clearance, safe reopen, exclusive writing/water/page tracks and finish replay.');
