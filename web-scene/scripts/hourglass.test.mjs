import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import fs from 'node:fs';
import {createHourglass,hourglassTiming,removeStaticHourglass,HOURGLASS_HOME} from '../src/hourglass.js';
import {createStudyMotion} from '../src/study-motion.js';
const base={started:true,running:false,complete:false,sessionId:'one',phase:'study',round:1,config:{study:25,rest:5,rounds:4},remaining:750};
assert.equal(hourglassTiming(base).progress,.5);
assert.equal(hourglassTiming({...base,phase:'rest',remaining:150}).progress,.5);
assert.equal(hourglassTiming({...base,running:true,end:900000},150000).progress,.5);
assert.equal(hourglassTiming({...base,complete:true}).progress,1);
assert.equal(hourglassTiming({...base,started:false}).started,false);
const scene=new THREE.Scene(),clock=createHourglass(scene);
function volumes(){scene.updateMatrixWorld(true);let upper=0,lower=0;clock.root.traverse(m=>{if(m.name!=='Hourglass sand'||!m.visible)return;const p=m.geometry.parameters,volume=p.width*p.height*p.depth*m.scale.y;if(m.getWorldPosition(new THREE.Vector3()).y>clock.root.position.y)upper+=volume;else lower+=volume;});return {upper,lower};}
for(const phase of ['study','rest'])for(const p of [0,.25,.5,.75,1]){
 const duration=base.config[phase]*60;clock.update(.1,{...base,phase,remaining:duration*(1-p)},false);
 const {upper,lower}=volumes();assert.ok(Math.abs(upper+lower-clock.totalSandVolume)<1e-10,'sand volume conserved');assert.ok(Math.abs(upper/clock.totalSandVolume-(1-p))<1e-8,'visible upper sand matches actual remaining time in either orientation');
}
clock.restartPreview();clock.update(2.4,{},true,true);const rotated=clock.root.rotation.z;assert.ok(rotated>.1&&rotated<Math.PI);assert.ok(clock.root.position.y>HOURGLASS_HOME.y+.1);
clock.restartPreview();clock.update(.1,{},true,true);assert.ok(clock.root.rotation.z<rotated,'clicking preview again replays the flip');
clock.update(.1,{...base,started:false},true);assert.ok(clock.root.position.distanceTo(HOURGLASS_HOME)<1e-8,'reset seats the clock on the mat');
// Source replacement removes only timer geometry, retaining desktop and mat.
const bytes=fs.readFileSync(new URL('../public/models/cozy-room.glb',import.meta.url));const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const removed=removeStaticHourglass(gltf.scene);assert.ok(removed>100&&removed<2000,`bounded clock replacement: ${removed} triangles`);
const ray=new THREE.Raycaster(new THREE.Vector3(-.97,1.52,5.6),new THREE.Vector3(0,0,-1));gltf.scene.updateMatrixWorld(true);const hit=ray.intersectObject(gltf.scene)[0];assert.ok(!hit||hit.point.z<2.14,'old clock cannot remain underneath the animated one');
const controller=createStudyMotion(new THREE.Scene(),[],[]),originalNow=Date.now;let now=0;Date.now=()=>now;
try{
 const state={...base,running:true,remaining:1500,end:1500000};const session={state,focusing:true,reading:true,revision:0};
 controller.update(.1,session,true);assert.equal(controller.action,'hourglass');
 now=2500;controller.update(.1,session,true);assert.equal(controller.action,'hourglass');
 const h=controller.update(.1,{...session,reading:false,state:{...state,running:false,remaining:1497.5}},true);now=20000;const h2=controller.update(.1,{...session,reading:false,state:{...state,running:false,remaining:1497.5}},true);assert.equal(h.flipping,h2.flipping,'paused flip stays still');
 now=6000;controller.update(.1,session,true);assert.equal(controller.action,'reading','reading begins only after the clock is put down');
 const resumed=createStudyMotion(new THREE.Scene(),[],[]);now=600000;resumed.update(.1,session,true);assert.equal(resumed.action,'reading','reload midway does not replay the opening flip');
 const continuing={...state,remaining:900,end:1500000,activation:2,actionStartedAt:now,actionElapsed:0};
 resumed.update(.1,{...session,state:continuing},true);assert.equal(resumed.action,'hourglass','Continuar always starts a new flip');
 assert.ok(Math.abs(hourglassTiming(continuing,now).progress-.4)<1e-10,'resume preserves remaining time');
 now+=6000;resumed.update(.1,{...session,state:continuing},true);assert.equal(resumed.action,'reading');
}finally{Date.now=originalNow;}
console.log(`PASS: real study/break progress, both orientations, constant sand volume, preview replay, pause, reset, resume and ${removed} static timer triangles replaced.`);
