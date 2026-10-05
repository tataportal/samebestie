import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {createFaceRig,headTransform,gesturePose} from '../src/personality.js';
import {applyCharacterLook,CHATITO_FACE,BOOK_BODY_RETRACTION} from '../src/character-look.js';
import {partitionScene,markForeground,FOREGROUND} from '../src/scene-layers.js';
import {prepareCharacterSurface} from '../src/render-depth.js';
import {createStudyMotion} from '../src/study-motion.js';
import {createWardrobe} from '../src/wardrobe.js';
import {repositionDeskLamp,LAMP_LIGHT_POSITION,LAMP_LIGHT_TARGET,LAMP_BOOK_TARGET} from '../src/desk-lamp.js';
const bytes=fs.readFileSync(new URL('../public/models/cozy-room.glb',import.meta.url));
const {scene:root}=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const scene=new T.Scene();scene.add(root);const hero=[],pages=[];
root.traverse(o=>{if(!o.isMesh)return;if(o.name.includes('Chatito')){prepareCharacterSurface(o);if(!o.name.includes('Leg'))hero.push({o});}if(o.name.includes('ReadingPage'))pages.push(o);});
partitionScene(scene);
const triangleCount=()=>{let n=0;scene.traverse(o=>{if(o.isMesh)n+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3});return n};
const originalTriangles=triangleCount(),fixedFoot=[];scene.updateMatrixWorld(true);const originalRoom=scene.getObjectByName('Web_Room_Foreground'),originalPositions=originalRoom.geometry.attributes.position,footPoint=new T.Vector3();
for(let i=0;i<originalRoom.geometry.index.count;i++){footPoint.fromBufferAttribute(originalPositions,originalRoom.geometry.index.getX(i)).applyMatrix4(originalRoom.matrixWorld);if(footPoint.y<1.4&&footPoint.x<-2.4&&footPoint.z>1.8)fixedFoot.push(footPoint.clone())}
const fixtures=repositionDeskLamp(scene);assert.equal(fixtures.length,2,'lamp housing and emitter are extracted together');assert.equal(triangleCount(),originalTriangles,'moving the lamp preserves every triangle');
let footVertices=0;for(const fixture of fixtures){const positions=fixture.geometry.attributes.position;for(let i=0;i<positions.count;i++){footPoint.fromBufferAttribute(positions,i);if(footPoint.y<1.4){footVertices++;assert.ok(fixedFoot.some(p=>p.distanceTo(footPoint)<1e-5),'lamp base stays planted at its original position')}}}assert.ok(footVertices>0);
const beamDirection=LAMP_LIGHT_TARGET.clone().sub(LAMP_LIGHT_POSITION).normalize(),beamHit=new T.Vector3();
new T.Ray(LAMP_LIGHT_POSITION,beamDirection).intersectPlane(new T.Plane(new T.Vector3(0,1,0),-LAMP_BOOK_TARGET.y),beamHit);
assert.ok(beamHit.x>-2.48&&beamHit.x<-1.25&&beamHit.z>2.10&&beamHit.z<2.98,'lamp beam lands on the open book');
const panelNormals=fixtures.find(f=>f.name==='Desk lamp underside').geometry.attributes.normal;let aligned=false;for(let i=0;i<panelNormals.count;i++)if(new T.Vector3().fromBufferAttribute(panelNormals,i).dot(beamDirection)>.999)aligned=true;assert.ok(aligned,'the physical luminous panel points along the light beam');
const lampBox=new T.Box3();for(const fixture of fixtures)lampBox.union(new T.Box3().setFromObject(fixture));
const head=root.getObjectByName('Web_Chatito_Head');const face=createFaceRig(head,CHATITO_FACE);
const pupilAttribute=face.eyes[0].pivot.children[0].geometry.attributes.position;
const oldPupil=pupilAttribute.array.slice(),oldHeadColor=head.geometry.attributes.color.array.slice();
const room=scene.getObjectByName('Web_Room_Background'),roomMaterial=room.material;
const art=applyCharacterLook(hero,face);
assert.deepEqual(pupilAttribute.array,oldPupil,'editing the beak and glasses does not mutate shared pupil vertices');
assert.deepEqual(face.eyes[0].pivot.children[0].geometry.attributes.color.array,oldHeadColor,'warm feathers do not repaint the pupils');
assert.equal(room.material,roomMaterial,'room shading is untouched');assert.equal(room.material.isMeshToonMaterial,undefined);
assert.equal(head.material.isMeshToonMaterial,true);assert.equal(root.getObjectByName('Web_Chatito_Scarf').visible,false);
assert.ok(!scene.getObjectByName('Black hoodie raised hood'),'unapproved hoodie is absent');
face.update(gesturePose(null,0));assert.equal(face.eyes[0].pivot.scale.x,1.16);assert.equal(face.eyes[0].pivot.scale.y,1.08);
const openY=face.eyes[0].pivot.position.y;face.update(gesturePose('thinking',2));assert.ok(face.eyes[0].pivot.position.y>openY,'expressive gaze remains active');face.update(gesturePose('breathe',2));assert.ok(face.eyes[0].pivot.scale.y<.1,'larger pupils still close for breathing');
scene.updateMatrixWorld(true);
const ray=new T.Raycaster();ray.layers.set(FOREGROUND);
for(const x of [-1.984,-1.975,-1.725,-1.716]){ray.set(new T.Vector3(x,1.78,3),new T.Vector3(0,0,-1));const hit=ray.intersectObjects([head,art.billBacking],false)[0];assert.equal(hit?.object.name,'Bill socket backing','old bill corners are cream, not dark holes');}
const body=hero.find(({o})=>o.name.includes('Body')).o,baseBody=body.geometry;
const wardrobe=createWardrobe(hero,face,art),countBefore=scene.children.length;
assert.equal(wardrobe.selected,'scarf');assert.equal(body.geometry,baseBody);assert.equal(art.scarf.material.visible,true);assert.equal(wardrobe.hood.visible,false);
wardrobe.set('hoodie');const hoodieBody=body.geometry;assert.notEqual(hoodieBody,baseBody);assert.equal(art.scarf.material.visible,false);assert.ok(wardrobe.hood.visible&&wardrobe.cords.visible);
for(let i=0;i<20;i++){wardrobe.set('scarf');assert.equal(body.geometry,baseBody);assert.equal(wardrobe.cords.visible,false);wardrobe.set('hoodie');assert.equal(body.geometry,hoodieBody);}
assert.equal(scene.children.length,countBefore,'outfit switching reuses geometry and attachments');
const poses=[];for(const {o} of hero){if(o.name.includes('Arm'))continue;const p=new T.Group();p.position.set(-1.85,1.48,1.84);scene.add(p);p.attach(o);poses.push({p,name:o.name});}
const existing=new Set(scene.children),motion=createStudyMotion(scene,hero,pages);for(const o of scene.children)if(!existing.has(o))markForeground(o);
const idle={focusing:false,reading:false,state:{}};
function frame(){const a=motion.update(1/30,idle,true);art.update(a);for(const {p,name}of poses){p.position.set(-1.85,1.48+a.personality.bodyY,1.84-BOOK_BODY_RETRACTION*a.bookClearance);p.rotation.set(0,0,a.personality.bodyRoll);if(name.includes('Head')){const h=headTransform(a);p.position.copy(h.position);p.rotation.copy(h.rotation);}}face.update(a.personality);scene.updateMatrixWorld(true);return a;}
motion.preview('writing');for(let i=0;i<100;i++)frame();const grip=new T.Vector3(...hero.find(({o})=>o.name.includes('ArmR')).o.userData.studyGrip);
assert.ok(grip.clone().applyMatrix4(scene.getObjectByName('Study flipper -1').matrixWorld).distanceTo(scene.getObjectByName('Chatito study pencil').position)<1e-5,'shortened flipper holds the pencil');
motion.preview('water');for(let i=0;i<105;i++)frame();const cup=scene.getObjectByName('Chatito water cup'),contact=cup.localToWorld(new T.Vector3(-.113,0,0));
assert.ok(grip.clone().applyMatrix4(scene.getObjectByName('Study flipper -1').matrixWorld).distanceTo(contact)<.003,'shortened flipper holds the mug handle');
assert.equal(cup.children[0].material.color.getHexString(),'478ecc');
const cover=scene.getObjectByName('Closing book cover'),half=cover.children[0],box=half.geometry.boundingBox.clone().applyMatrix4(half.matrix),tri=new T.Triangle(),m=new T.Matrix4(),scarfPosition=art.scarf.geometry.attributes.position;let sweeps=0;
function checkCover(a){if(cover.rotation.z<.05||cover.rotation.z>Math.PI-.05)return;sweeps++;m.copy(cover.matrixWorld).invert().multiply(art.scarf.matrixWorld);for(let j=0;j<scarfPosition.count;j+=3){tri.a.fromBufferAttribute(scarfPosition,j).applyMatrix4(m);tri.b.fromBufferAttribute(scarfPosition,j+1).applyMatrix4(m);tri.c.fromBufferAttribute(scarfPosition,j+2).applyMatrix4(m);assert.equal(box.intersectsTriangle(tri),false,'scarf clears the moving book');}}
const hoodieMeshes=[wardrobe.hood,wardrobe.pocket,...wardrobe.cords.children];
function checkHoodieCover(){if(cover.rotation.z<.05||cover.rotation.z>Math.PI-.05)return;for(const mesh of hoodieMeshes){const geometry=mesh.geometry,position=geometry.attributes.position,index=geometry.index;m.copy(cover.matrixWorld).invert().multiply(mesh.matrixWorld);for(let j=0;j<(index?.count??position.count);j+=3){tri.a.fromBufferAttribute(position,index?index.getX(j):j).applyMatrix4(m);tri.b.fromBufferAttribute(position,index?index.getX(j+1):j+1).applyMatrix4(m);tri.c.fromBufferAttribute(position,index?index.getX(j+2):j+2).applyMatrix4(m);assert.equal(box.intersectsTriangle(tri),false,`${mesh.name} clears the moving book`);}}}
motion.preview('bop');motion.setTempo(80);for(let i=0;i<100;i++)frame();assert.equal(motion.action,'bop');
motion.preview('finish');for(let i=0;i<240;i++){const a=frame();if(i%2===0){checkCover(a);checkHoodieCover();}}
motion.preview('writing');for(let i=0;i<240;i++){const a=frame();if(i%2===0){checkCover(a);checkHoodieCover();}}assert.ok(sweeps>20);
let closestLampGap=Infinity;for(const action of ['reading','page-turn','pencil-play','writing','water','hourglass','bop','reread','glasses','thinking','aha','window','frustrated','cheek','stretch','breathe','finish','blank','nervous']){motion.preview(action);for(let i=0;i<620;i++){frame();const hoodBox=new T.Box3().setFromObject(wardrobe.hood),gap=hoodBox.min.x-lampBox.max.x;closestLampGap=Math.min(closestLampGap,gap);assert.ok(gap>.04,`${action} keeps lamp clear of hood: ${gap}`)}}
console.log(`PASS: lamp clears all 19 action sweeps; minimum horizontal gap ${closestLampGap.toFixed(3)}.`);
wardrobe.set('scarf');assert.equal(art.scarf.material.visible,true);assert.equal(wardrobe.hood.visible,false);assert.equal(body.geometry,baseBody);
assert.equal(art.scarf.layers.mask,1<<FOREGROUND);assert.equal(art.billBacking.layers.mask,1<<FOREGROUND);
console.log('PASS: approved toon look, independent attributes, expressive pupils, filled bill socket, blue mug, recalibrated grips and scarf/book sweep.');
