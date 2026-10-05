import * as THREE from 'three';
import {DESK_BLUE} from './desk-colors.js';
import {createGroove} from './groove.js';
import {createHourglass} from './hourglass.js';
import {BOOK_BODY_RETRACTION} from './character-look.js';
import {GESTURES,storyAt,gesturePose,createBookRig} from './personality.js';

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
 const ceramic=new THREE.MeshStandardMaterial({color:DESK_BLUE,roughness:.72});
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
 const book=createBookRig(scene);let storyTime=0,phaseElapsed=0,phaseKey,gesture=null,bookClose=0,bookClearance=0,clockDelay=0,clockActivation,queuedFinish=false;
 const hourglass=createHourglass(scene);let flipping=false;
 const groove=createGroove();
 let preview=null,previewTime=0,breakTime=0,cupLift=0,cupReach=0,restEngagement=0;
 const arms=[];
 for(const {o} of hero){
  if(!o.name.includes('Arm'))continue;
  // GLTFLoader removes dots: ArmL is the character's left, screen right.
  const side=o.name.includes('ArmL')?1:-1;
  const shoulder=v(-1.85+side*.408,1.48,1.84);
  const pivot=new THREE.Group();pivot.name=`Study flipper ${side}`;scene.add(pivot);pivot.position.copy(shoulder);pivot.attach(o);
  pivot.matrixAutoUpdate=false;
  arms.push({side,pivot,shoulder,restGrip:o.userData.studyGrip?v(...o.userData.studyGrip):v(side*.0633,-.0236,.3738)});
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
  get tempo(){return groove.tempo},
  setTempo(value){groove.setTempo(value)},
  get action(){return preview||(flipping?'hourglass':gesture?.id||studyBeat(clock.time).action)},
  preview(action){groove.reset();queuedFinish=action==='finish'&&bookClose>0;preview=action;previewTime=0;breakTime=0;hourglass.restartPreview();},
  clearPreview(){queuedFinish=false;preview=null;previewTime=0;},
  update(dt,session,motion,elapsed=dt){
   const state=session.state||{};
   if(queuedFinish&&bookClose===0&&bookClearance===0)queuedFinish=false;
   const bookBusy=bookClose>0||bookClearance>0;
   const clockBlocked=(bookClose>0&&bookClose<1)||bookClearance>0;
   const activationKey=`${state.sessionId}:${state.actionStartedAt}`;
   if(activationKey!==clockActivation){clockActivation=activationKey;clockDelay=0;}
   if(clockBlocked&&motion&&state.running)clockDelay+=dt;
   const clockState=Number.isFinite(state.actionStartedAt)?{...state,actionStartedAt:state.actionStartedAt+clockDelay*1000,actionElapsed:Math.max(0,(state.actionElapsed||0)-clockDelay)}:state;
   const timer=hourglass.update(clockBlocked?0:dt,clockState,motion&&(!preview||preview==='hourglass'),preview==='hourglass');flipping=timer.flipping&&!preview||preview==='hourglass';
   const nextKey=`${session.revision}:${state.sessionId}:${state.started}:${state.phase}:${state.round}:${state.complete}`;
   if(nextKey!==phaseKey){phaseElapsed=0;phaseKey=nextKey;if(!session.focusing)storyTime=0;}
   if(preview&&motion&&!queuedFinish&&(!bookBusy||preview==='finish'))previewTime+=dt;
   if(!preview&&motion&&!flipping&&(!bookBusy||state.complete)&&(state.running||state.complete)){phaseElapsed+=dt;if(session.reading){const next=storyAt(storyTime+dt);if(!next||gesture||studyBeat(clock.time).action==='reading')storyTime+=dt;}}
   const priorGesture=gesture;gesture=null;
   if(preview==='bop')gesture={id:'bop',time:previewTime};
   else if(preview&&!queuedFinish&&GESTURES[preview])gesture={id:preview,time:Math.min(previewTime,GESTURES[preview])};
   else if(!preview&&!flipping&&state.started){
    if(state.complete&&phaseElapsed<11)gesture={id:'finish',time:phaseElapsed};
    else if(state.phase==='rest'&&phaseElapsed<8)gesture={id:'stretch',time:phaseElapsed};
    else if(state.phase==='rest'&&phaseElapsed>=20&&phaseElapsed<40)gesture={id:'breathe',time:phaseElapsed-20};
    else if(session.focusing)gesture=storyAt(storyTime);
   }
   if(priorGesture&&!gesture&&!preview&&session.reading)clock.time=Math.floor(clock.time/30)*30+27;
   let personality=gesturePose(gesture?.id,gesture?.time||0);
   if(gesture?.id==='bop')Object.assign(personality,groove.update(motion&&!bookBusy?elapsed:0));
   let beat=clock.update(dt,{focusing:session.focusing,running:session.reading&&!flipping&&!gesture&&!bookBusy,motion,revision:session.revision});
   if(preview==='reading')beat=studyBeat(previewTime%3.5);
   if(preview==='page-turn')beat=studyBeat(3.3+Math.min(previewTime,4.7));
   if(preview==='pencil-play')beat=studyBeat(previewTime<2?10+previewTime:12+(previewTime-2)%3.5);
   if(preview==='writing')beat=studyBeat(16+Math.min(previewTime,7.3));
   const finishing=gesture?.id==='finish'||(!preview&&state.complete);
   const deferReopen=flipping&&bookClose===1;
   const reopening=!finishing&&!deferReopen&&bookClose>.0001;
   const clearing=(finishing&&bookClose<.9999)||reopening;
   const canAdvance=motion&&(!!preview||state.running||state.complete||reopening||bookClearance>.0001);
   // Retract first. Never start either sweep with the head still over the book.
   if(canAdvance)bookClearance=THREE.MathUtils.damp(bookClearance,clearing?1:0,8,dt);
   if(bookClearance>.9999)bookClearance=1;
   if(bookClearance<.0001)bookClearance=0;
   const targetClose=deferReopen?1:finishing?personality.close||(!gesture?1:0):0;
   if(canAdvance&&(bookClearance>.999||Math.abs(targetClose-bookClose)<.0001))bookClose=THREE.MathUtils.damp(bookClose,targetClose,12,dt);
   if(bookClose>.9999)bookClose=1;
   if(bookClose<.0001)bookClose=0;
   const returning=!finishing&&!deferReopen&&(bookClose>0||bookClearance>0);
   if(returning){gesture=null;personality=gesturePose(null,0);}
   // A single action owns the props. Water/clock gestures cannot inherit a
   // partly turned page or the writing track from a previous preview.
   const propsIdle=returning||preview==='water'||flipping;
   if(gesture||propsIdle||finishing){beat={...beat,t:0,turn:finishing||propsIdle?0:pageProgress,reach:0,hold:0,write:0};
    if(!propsIdle&&(gesture?.id==='thinking'||gesture?.id==='blank')){beat.hold=personality.w;beat.t=13;}
    if(!propsIdle&&gesture?.id==='aha'&&gesture.time>1.5){beat={...beat,t:17+(gesture.time-1.5)*1.6,hold:ease((gesture.time-1.5)/.65)*personality.w,write:ease((gesture.time-2)/.5)*personality.w};}
   }
   book.update(bookClose,finishing?(gesture?.time??11):null);
   for(const {o} of pages)o.visible=bookClose<.01;
   const restActive=!returning&&(preview==='water'||(!preview&&!flipping&&!gesture&&(state.complete||(state.started&&state.phase==='rest'))));
   const studying=!returning&&!flipping&&(preview?preview!=='water':session.focusing)||!!gesture;
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
   if(gesture?.id==='thinking'){air.set(-2.03,1.78,2.56);airQ.setFromEuler(new THREE.Euler(0,0,-.4));}
   if(gesture?.id==='blank'){air.set(-2.2,1.53,2.48);airQ.setFromEuler(new THREE.Euler(0,0,.25));}
   const grip=air.clone().lerp(writeGrip,beat.write);
   const gripQ=airQ.clone().slerp(writeQ,beat.write);
   pen.position.copy(home).lerp(grip,hold);pen.quaternion.copy(homeQ).slerp(gripQ,hold);
   const pickReach=(gesture?beat.hold:ease((t-9.1)/.9)*(1-ease((t-26)/.8)))*e;
   const right=restRight.clone().lerp(pen.position,pickReach);
   if(finishing){const park=ease(((gesture?.time??11)-.15)/1.0);pen.position.lerp(v(-2.55,1.325,2.65),park);if(gesture&&gesture.time<1.4)right.lerp(pen.position,ease(gesture.time/.25)*(1-ease((gesture.time-1.1)/.3)));}
   const edge=pagePoint(-1.32,1.37,2.43,pageProgress);
   edge.y+=.012;
   const left=restLeft.clone();
   (beat.cycle%2?right:left).lerp(edge,beat.reach*e);
   right.lerp(cup.localToWorld(v(-.113,0,0)),cupReach);
   const timerReach=!returning&&(!preview||preview==='hourglass')?timer.reach:0;left.lerp(timer.grip,timerReach);
   if(gesture){
    const {id,time:g}=gesture,w=personality.w;
    if(id==='glasses')left.lerp(v(-1.47,2.02+personality.glasses,2.46),ease((g-.7)/.6)*(1-ease((g-2.7)/.7)));
    if(id==='cheek')right.lerp(v(-2.26,1.66,2.41),w);
    if(id==='stretch'){left.lerp(v(-1.27,2.20,2.18),w);right.lerp(v(-2.43,2.20,2.18),w);}
    if(id==='frustrated'){left.lerp(v(-1.48,1.39,2.47),w);right.lerp(v(-2.22,1.39,2.47),w);}
    if(id==='aha'){left.y+=.08*w*Math.max(0,1-g/1.5);}
    if(id==='breathe'){left.lerp(v(-1.53,1.48+personality.bodyY,2.36),w);right.lerp(v(-2.17,1.48+personality.bodyY,2.36),w);}
    if(id==='finish'){
     if(g<2.3)left.lerp(book.marker.position,ease(g/.6));
     else if(g<5.1){const edge=v(.51,.01,0).applyAxisAngle(v(0,0,1),bookClose*Math.PI).add(book.pivot.position);left.lerp(edge,1-ease((g-4.6)/.5));}
     else{left.y+=personality.y;right.y+=personality.y;}
    }
   }
   for(const arm of arms){
    const engaged=Math.max(e,restEngagement,timerReach);
    const shoulder=arm.shoulder.clone();shoulder.z+=.16*engaged-BOOK_BODY_RETRACTION*bookClearance;shoulder.y+=personality.bodyY;
    const rest=shoulder.clone().add(arm.restGrip);
    const target=rest.lerp(arm.side>0?left:right,engaged);
    const gripAmount=arm.side<0?Math.max(hold,cupReach):Math.max(beat.reach*e,timerReach);
    aimFlipper(arm.pivot,arm.restGrip,target,shoulder,1-.27*gripAmount);
   }
   // Leave completed annotations on the paper until the next page turn.
   const visibleMarks=t>=17?Math.min(15,Math.floor(clamp((t-17)/6.1,0,1)*15)):(beat.cycle>0&&t<4?15:0);
   ink.visible=!finishing&&!returning&&e>.95&&visibleMarks>0&&bookClose<.05;
   for(let i=0;i<marks.length;i++)marks[i].visible=i<visibleMarks;
   return {personality,bookClearance,time:clock.time,engagement:e,turning:beat.reach*e,writing:beat.write*e,drinking:cupLift,flipping:timerReach,
    headYaw:personality.yaw+e*(.045*Math.sin(beat.t*.8)+.07*beat.write)-.18*cupLift+timer.headYaw*(preview&&preview!=='hourglass'?0:1),
    active:motion&&(returning||!!preview||!!gesture||flipping||session.reading||(restActive&&restRunning&&breakTime<9))};
  }
 };
}
