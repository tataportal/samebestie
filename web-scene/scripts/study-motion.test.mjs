import assert from 'node:assert/strict';
import * as THREE from 'three';
import {StudyClock,studyBeat,aimFlipper,createStudyMotion} from '../src/study-motion.js';

for(const [t,action] of [[0,'reading'],[5,'page-turn'],[11,'pick-up'],[14,'pencil-play'],[20,'writing'],[25,'put-down'],[29,'reading']]){
 assert.equal(studyBeat(t).action,action);
}
assert.equal(studyBeat(30).turn,1,'A turned page stays on the left into the next cycle');
assert.equal(studyBeat(38).turn,0,'The next page turn uses the opposite direction');
const clock=new StudyClock();
for(let i=0;i<140;i++)clock.update(.1,{focusing:true,running:true,motion:true});
const stopped=clock.time;
clock.update(.1,{focusing:true,running:false,motion:true});assert.equal(clock.time,stopped,'Timer pause freezes action');
clock.update(.1,{focusing:true,running:true,motion:false});assert.equal(clock.time,stopped,'Reduced motion freezes action');
clock.update(.1,{focusing:false,running:true,motion:true});assert.equal(clock.time,0,'Break or reset restarts the study cycle');
clock.time=20;clock.update(.1,{focusing:true,running:true,motion:true,revision:1});assert.equal(clock.time,.1,'A reset and immediate restart between frames starts a fresh action cycle');

const grip=new THREE.Vector3(-.0633,-.0236,.3738),shoulder=new THREE.Vector3(-2.258,1.48,2),target=new THREE.Vector3(-2.20,1.53,2.5),pivot=new THREE.Group();
aimFlipper(pivot,grip,target,shoulder);
assert.ok(grip.clone().applyMatrix4(pivot.matrix).distanceTo(target)<1e-10,'Flipper reaches the real grip');
const cross=new THREE.Vector3().crossVectors(grip,new THREE.Vector3(0,1,0)).normalize();
const a=new THREE.Vector3().applyMatrix4(pivot.matrix),b=cross.clone().applyMatrix4(pivot.matrix);
assert.ok(Math.abs(a.distanceTo(b)-1)<1e-10,'Stretch preserves thickness');

// Exercise the actual scene controller without a GPU: pause/reset must preserve
// contacts and restore a bent page instead of leaving props suspended in space.
const scene=new THREE.Scene(),hero=[];
for(const [suffix,x] of [['R',-2.32],['L',-1.38]]){
 const o=new THREE.Mesh(new THREE.BoxGeometry(.2,.3,.35),new THREE.MeshStandardMaterial());
 o.name=`Web_Chatito_Arm${suffix}`;o.position.set(x,1.46,2.01);scene.add(o);hero.push({o});
}
const page=new THREE.Mesh(new THREE.BoxGeometry(.562,.013,.7),new THREE.MeshStandardMaterial());
page.position.set(-1.569,1.366,2.43);scene.add(page);scene.updateMatrixWorld(true);
const controller=createStudyMotion(scene,hero,[page]);
const session={focusing:true,reading:true};
for(let i=0;i<200;i++)controller.update(.1,session,true);
scene.updateMatrixWorld(true);
const pen=scene.getObjectByName('Chatito study pencil');
const hand=scene.getObjectByName('Study flipper -1');
assert.ok(grip.clone().applyMatrix4(hand.matrixWorld).distanceTo(pen.position)<1e-6,'Writing hand holds the pencil');
const frozen=pen.position.clone(),orientation=pen.quaternion.clone();
for(let i=0;i<30;i++)controller.update(.1,{focusing:true,reading:false},true);
assert.ok(pen.position.distanceTo(frozen)<1e-8&&pen.quaternion.angleTo(orientation)<1e-7,'Paused pencil stays put');
for(let i=0;i<100;i++)controller.update(.1,{focusing:false,reading:false},true);
assert.ok(pen.position.distanceTo(new THREE.Vector3(-2.31,1.385,2.39))<1e-8,'Reset puts pencil on the notebook');
assert.equal(controller.action,'reading');
console.log('PASS: study sequence, alternating pages, grip contact, flipper thickness, pause, reduced motion and reset.');

// Previews run independently of a paused timer and can be exited cleanly.
controller.preview('writing');
for(let i=0;i<25;i++)controller.update(.1,{focusing:false,reading:false,state:{}},true);
assert.equal(controller.action,'writing');
assert.ok(pen.position.distanceTo(new THREE.Vector3(-2.31,1.385,2.39))>.1);
controller.preview('water');
for(let i=0;i<40;i++)controller.update(.1,{focusing:false,reading:false,state:{}},true);
const cup=scene.getObjectByName('Chatito water cup');
assert.ok(cup.position.y>1.6,'Water preview lifts the mug to the face');
controller.clearPreview();
for(let i=0;i<100;i++)controller.update(.1,{focusing:false,reading:false,state:{}},true);
assert.ok(Math.abs(cup.position.y-1.3695)<1e-6,'Leaving preview restores the mug to the desktop');
for(const state of [{started:true,phase:'rest',running:true,complete:false},{started:true,phase:'study',running:false,complete:true}]){
 for(let i=0;i<40;i++)controller.update(.1,{focusing:false,reading:false,state},true);
 assert.ok(cup.position.y>1.6,'Both a break and final completion trigger the water reminder');
 for(let i=0;i<70;i++)controller.update(.1,{focusing:false,reading:false,state},true);
 assert.ok(Math.abs(cup.position.y-1.3695)<1e-5,'Mug is put back after drinking');
 controller.update(.1,{focusing:false,reading:false,state:{}},true);
}
console.log('PASS: independent action previews, return to pomodoro, water on break and final completion.');
