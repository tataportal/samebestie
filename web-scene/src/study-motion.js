import * as THREE from 'three';
import {createHourglass} from './hourglass.js';

const clamp=THREE.MathUtils.clamp;
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const v=(x,y,z)=>new THREE.Vector3(x,y,z);
const CYCLE=30;
export function studyBeat(time){
 const cycle=Math.floor(time/CYCLE),t=time%CYCLE;
 const turn=ease((t-4)/4);
 return {cycle,t,turn:cycle%2?1-turn:turn,
  action:t<4?'reading':t<8?'page-turn':t<10?'reading':t<12?'pick-up':t<16?'pencil-play':t<24?'writing':t<26?'put-down':'reading',
  reach:ease((t-3.3)/.7)*(1-ease((t-5.0)/.8)),
  hold:ease((t-10)/2)*(1-ease((t-24)/2)),
  write:ease((t-16)/1)*(1-ease((t-23.4)/.6))};
}
export class StudyClock{
 time=0;
 revision;
 update(dt,{focusing,running,motion,revision}){
  if(this.revision!==revision){this.time=0;this.revision=revision;}
  if(!focusing)this.time=0;
  else if(running&&motion)this.time+=Math.min(Math.max(dt,0),.1);
  return studyBeat(this.time);
 }
}

function pencil(){
 const group=new THREE.Group();group.name='Chatito study pencil';
 const box=(name,y,w,h,color)=>{
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),new THREE.MeshStandardMaterial({color,roughness:.8}));
  m.name=name;m.position.y=y;group.add(m);
 };
 // The grip is the origin, so rolling the pencil never detaches it from the paw.
 box('Graphite point',-.133,.012,.028,'#343139');
 box('Sharpened wood',-.107,.023,.027,'#ead1a2');
 box('Ochre barrel',.077,.032,.346,'#d69b45');
 box('Ferrule',.264,.036,.028,'#c9bd9f');
 box('Coral eraser',.294,.037,.033,'#b56148');
 return group;
}

function waterCup(){
 const group=new THREE.Group();group.name='Chatito water cup';
 const ceramic=new THREE.MeshStandardMaterial({color:'#89a99a',roughness:.72});
 const water=new THREE.MeshStandardMaterial({color:'#8bbfc4',roughness:.25,metalness:.05});
 const block=(size,position,material=ceramic)=>{
  const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);
  m.position.set(...position);m.castShadow=true;group.add(m);
 };
 block([.14,.016,.14],[0,-.077,0]);
 block([.015,.16,.14],[-.0625,0,0]);block([.015,.16,.14],[.0625,0,0]);
 block([.11,.16,.015],[0,0,-.0625]);block([.11,.16,.015],[0,0,.0625]);
 block([.109,.004,.109],[0,.042,0],water);
 // The paw holds the side handle, leaving the mug and water visible.
 block([.018,.10,.018],[-.113,-.006,0]);
 for(const y of [-.05,.04])block([.045,.018,.018],[-.091,y,0]);
 return group;
}

// A rigid flipper aims at its contact point; stretch only along its length.
// This keeps the shoulder attached and preserves the thickness of the voxels.
export function aimFlipper(pivot,restGrip,target,shoulder,thickness=1){
 const direction=target.clone().sub(shoulder),length=direction.length();
 const axis=restGrip.clone().normalize();
 const q=new THREE.Quaternion().setFromUnitVectors(axis,direction.normalize());
 const stretch=length/restGrip.length()-thickness;
 const s=new THREE.Matrix4().set(
  thickness+stretch*axis.x*axis.x,stretch*axis.x*axis.y,stretch*axis.x*axis.z,0,
  stretch*axis.y*axis.x,thickness+stretch*axis.y*axis.y,stretch*axis.y*axis.z,0,
  stretch*axis.z*axis.x,stretch*axis.z*axis.y,thickness+stretch*axis.z*axis.z,0,
  0,0,0,1);
 pivot.matrix.makeRotationFromQuaternion(q).multiply(s).setPosition(shoulder);
 pivot.matrixWorldNeedsUpdate=true;
}

export function createStudyMotion(scene,hero,pageMeshes){
 const clock=new StudyClock();
 const hourglass=createHourglass(scene);let flipping=false;
 let preview=null,previewTime=0,breakTime=0,cupLift=0,cupReach=0,restEngagement=0;
 const arms=[];
 for(const {o} of hero){
  if(!o.name.includes('Arm'))continue;
  // GLTFLoader removes dots: ArmL is the character's left, screen right.
  const side=o.name.includes('ArmL')?1:-1;
  const shoulder=v(-1.85+side*.408,1.48,1.84);
  const pivot=new THREE.Group();pivot.name=`Study flipper ${side}`;scene.add(pivot);pivot.position.copy(shoulder);pivot.attach(o);
  pivot.matrixAutoUpdate=false;
  arms.push({side,pivot,shoulder,restGrip:v(side*.0633,-.0236,.3738)});
 }
 const pen=pencil();scene.add(pen);
 const home=v(-2.31,1.385,2.39);
 const homeAxis=v(.20,0,.98).normalize();
 const homeQ=new THREE.Quaternion().setFromUnitVectors(v(0,1,0),homeAxis);
 pen.position.copy(home);pen.quaternion.copy(homeQ);
 const cup=waterCup();cup.scale.setScalar(1.2);scene.add(cup);
 const cupHome=v(-2.535,1.3695,2.26);cup.position.copy(cupHome);
 const restRight=v(-2.18,1.415,2.34),restLeft=v(-1.48,1.415,2.34);

 // Keep the exported paper and handwriting together. Deforming its actual
 // vertices avoids a floating replacement card and preserves both page sides.
 const pages=pageMeshes.map(o=>{
  o.updateWorldMatrix(true,false);
  const geometry=o.geometry.clone(),attribute=geometry.getAttribute('position');
  const base=new Float32Array(attribute.count*3),point=new THREE.Vector3();
  for(let i=0;i<attribute.count;i++){
   point.fromBufferAttribute(attribute,i).applyMatrix4(o.matrixWorld);point.toArray(base,i*3);
  }
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(base.slice(),3).setUsage(THREE.DynamicDrawUsage));
  // Decoder-backed normal buffers can be normalized integers. Recompute into floats.
  geometry.deleteAttribute('normal');geometry.computeVertexNormals();
  o.geometry=geometry;o.removeFromParent();scene.add(o);o.position.set(0,0,0);o.quaternion.identity();o.scale.set(1,1,1);
  o.frustumCulled=false;o.castShadow=false;
  return {o,base};
 });
 const spine=v(-1.85,1.366,2.43);
 const pagePoint=(x,y,z,progress)=>{
  const a=progress*Math.PI,u=x-spine.x,front=clamp((z-2.08)/.7,0,1);
  // A flexible leaf curls most at its near edge while its spine stays on the book.
  return v(spine.x+u*Math.cos(a),spine.y+(y-spine.y)*Math.cos(a)+u*Math.sin(a)*(.23+.42*front),z+.035*Math.sin(a)*u/.562);
 };
 let pageProgress=0,lastPage=-1,engagement=0;
 const ink=new THREE.Group();ink.name='Fresh pencil notes';scene.add(ink);
 const inkMaterial=new THREE.MeshStandardMaterial({color:'#55504b',roughness:1});
 // Short staggered strokes are revealed underneath the pencil, on the existing page.
 const marks=[];
 for(let line=0;line<3;line++)for(let word=0;word<5;word++){
  const m=new THREE.Mesh(new THREE.BoxGeometry(.029,.0015,.004),inkMaterial);
  m.position.set(-2.25+word*.037,1.378,2.52+line*.028);ink.add(m);marks.push(m);
 }
 ink.visible=false;
 const writingTip=t=>{
  const p=clamp((t-17)/6.1,0,.9999),line=Math.floor(p*3),along=(p*3)%1;
  return v(-2.265+along*.185,1.381+.003*Math.max(0,Math.sin(t*22)),2.52+line*.028+.003*Math.sin(t*25));
 };
 return {
  get action(){return preview||(flipping?'hourglass':studyBeat(clock.time).action)},
  preview(action){preview=action;previewTime=0;breakTime=0;hourglass.restartPreview();},
  clearPreview(){preview=null;previewTime=0;},
  update(dt,session,motion){
   const state=session.state||{};
   const timer=hourglass.update(dt,state,motion&&(!preview||preview==='hourglass'),preview==='hourglass');flipping=timer.flipping&&!preview||preview==='hourglass';
   let beat=clock.update(dt,{focusing:session.focusing,running:session.reading&&!flipping,motion,revision:session.revision});
   if(preview&&motion)previewTime+=dt;
   if(preview==='reading')beat=studyBeat(previewTime%3.5);
   if(preview==='page-turn')beat=studyBeat(3.3+Math.min(previewTime,4.7));
   if(preview==='pencil-play')beat=studyBeat(previewTime<2?10+previewTime:12+(previewTime-2)%3.5);
   if(preview==='writing')beat=studyBeat(16+Math.min(previewTime,7.3));
   const restActive=preview==='water'||(!preview&&!flipping&&(state.complete||(state.started&&state.phase==='rest')));
   const studying=!flipping&&(preview?preview!=='water':session.focusing);
   const restRunning=preview==='water'||state.complete||state.running;
   if(!restActive)breakTime=0;
   else if(motion&&restRunning)breakTime+=dt;
   restEngagement=THREE.MathUtils.damp(restEngagement,restActive?1:0,5,dt);
   const lift=ease((breakTime-1.5)/1.5)*(1-ease((breakTime-6)/1.5));
   const reach=ease((breakTime-.7)/.7)*(1-ease((breakTime-7.6)/.7));
   cupLift=THREE.MathUtils.damp(cupLift,restActive?lift:0,12,dt);
   cupReach=THREE.MathUtils.damp(cupReach,restActive?reach:0,12,dt);
   cup.position.copy(cupHome).lerp(v(-2.015,1.655,2.48),cupLift);
   cup.rotation.z=-.35*cupLift;
   cup.rotation.x=-.12*cupLift;
   cup.updateMatrixWorld(true);
   // Pausing the timer freezes the action. Break/reset brings the props home.
   engagement=THREE.MathUtils.damp(engagement,studying?1:0,5,dt);
   const e=engagement,t=beat.t;
   pageProgress=THREE.MathUtils.damp(pageProgress,studying?beat.turn:0,18,dt);
   if(Math.abs(pageProgress-lastPage)>.00001){
    for(const {o,base} of pages){
     const p=o.geometry.getAttribute('position');
     for(let i=0;i<p.count;i++){const point=pagePoint(base[i*3],base[i*3+1],base[i*3+2],pageProgress);p.setXYZ(i,point.x,point.y,point.z)}
     p.needsUpdate=true;o.geometry.computeVertexNormals();
    }
    lastPage=pageProgress;
   }
   const play=ease((t-12)/.4)*(1-ease((t-15.5)/.5));
   const air=v(-2.28+.02*Math.sin(t*2)*play,1.61+.025*Math.sin(t*3)*play,2.51);
   const airQ=new THREE.Quaternion().setFromEuler(new THREE.Euler(.14*Math.sin(t*4)*play,0,.42+.65*Math.sin(t*4.8)*play));
   const writeAxis=v(-.24,.95,-.20).normalize();
   const tip=writingTip(t),writeGrip=tip.clone().addScaledVector(writeAxis,.147);
   const writeQ=new THREE.Quaternion().setFromUnitVectors(v(0,1,0),writeAxis);
   const hold=beat.hold*e;
   const grip=air.clone().lerp(writeGrip,beat.write);
   const gripQ=airQ.clone().slerp(writeQ,beat.write);
   pen.position.copy(home).lerp(grip,hold);pen.quaternion.copy(homeQ).slerp(gripQ,hold);
   const pickReach=ease((t-9.1)/.9)*(1-ease((t-26)/.8))*e;
   const right=restRight.clone().lerp(pen.position,pickReach);
   const edge=pagePoint(-1.32,1.37,2.43,pageProgress);
   edge.y+=.012;
   const left=restLeft.clone();
   (beat.cycle%2?right:left).lerp(edge,beat.reach*e);
   right.lerp(cup.localToWorld(v(-.113,0,0)),cupReach);
   const timerReach=(!preview||preview==='hourglass')?timer.reach:0;left.lerp(timer.grip,timerReach);
   for(const arm of arms){
    const engaged=Math.max(e,restEngagement,timerReach);
    const shoulder=arm.shoulder.clone();shoulder.z+=.16*engaged;
    const rest=shoulder.clone().add(arm.restGrip);
    const target=rest.lerp(arm.side>0?left:right,engaged);
    const gripAmount=arm.side<0?Math.max(hold,cupReach):Math.max(beat.reach*e,timerReach);
    aimFlipper(arm.pivot,arm.restGrip,target,shoulder,1-.27*gripAmount);
   }
   // Leave completed annotations on the paper until the next page turn.
   const visibleMarks=t>=17?Math.min(15,Math.floor(clamp((t-17)/6.1,0,1)*15)):(beat.cycle>0&&t<4?15:0);
   ink.visible=e>.95&&visibleMarks>0;
   for(let i=0;i<marks.length;i++)marks[i].visible=i<visibleMarks;
   return {time:clock.time,engagement:e,turning:beat.reach*e,writing:beat.write*e,drinking:cupLift,flipping:timerReach,
    headYaw:e*(.045*Math.sin(beat.t*.8)+.07*beat.write)-.18*cupLift+timer.headYaw*(preview&&preview!=='hourglass'?0:1),
    active:motion&&(!!preview||flipping||session.reading||(restActive&&restRunning&&breakTime<9))};
  }
 };
}
