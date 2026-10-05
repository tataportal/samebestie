import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const clamp=THREE.MathUtils.clamp;
export const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
export const GESTURES={reread:7,glasses:5,thinking:7,aha:5,window:8,frustrated:9,cheek:9,stretch:8,breathe:20,finish:11,blank:6,nervous:6};
// Unequal quiet gaps, then a different ordering on the next lap. No reaction spam.
const stories=[
 [[35,'reread'],[43,'thinking'],[51,'aha'],[74,'glasses'],[101,'window'],[132,'cheek'],[157,'blank'],[170,'reread'],[178,'frustrated'],[189,'thinking'],[197,'aha'],[223,'nervous']],
 [[29,'glasses'],[61,'cheek'],[89,'reread'],[97,'thinking'],[105,'aha'],[139,'window'],[169,'blank'],[190,'nervous'],[213,'reread'],[221,'frustrated'],[232,'aha']],
];
export function storyAt(time){
 const lap=Math.floor(time/260),t=time%260;
 for(const [start,id] of stories[lap%2])if(t>=start&&t<start+GESTURES[id])return {id,time:t-start};
 return null;
}
export function gesturePose(id,t){
 const duration=GESTURES[id]||1,w=ease(t/.6)*(1-ease((t-duration+.8)/.8));
 const p={id,t,w,pitch:0,yaw:0,roll:0,x:0,y:0,z:0,bodyY:0,bodyRoll:0,eye:1,gazeX:0,gazeY:0,glasses:0,close:0,bubble:null};
 const bubble=(kind,start,length=1.65)=>{if(t>=start&&t<start+length)p.bubble={kind,age:t-start,duration:length}};
 switch(id){
  case 'reread':p.pitch=.13*w;p.yaw=Math.sin(t*2.3)*.09*w;p.roll=.06*w;p.z=.065*w;p.gazeX=Math.sin(t*2.3)*.014*w;bubble('question',.8);bubble('questions',3.3,2);break;
  case 'glasses':p.glasses=-.036*ease(t/.8)*(1-ease((t-1.6)/.7));p.pitch=.045*w;p.eye=1-.4*w;break;
  case 'thinking':p.pitch=-.18*w;p.yaw=-.09*w;p.gazeY=.014*w;bubble('dots',1.2);break;
  case 'aha':{const pop=ease(t/.45)*(1-ease((t-1)/.5));p.pitch=-.15*pop;p.eye=1+.12*pop;p.y=.047*pop;p.bodyY=.025*pop;p.yaw=.02*Math.sin(t*14)*w;bubble('idea',.25);break;}
  case 'window':p.yaw=-.34*w;p.pitch=-.07*w;p.gazeX=-.025*w;p.eye=1-.25*ease((t-6)/.3)*(1-ease((t-6.3)/.3));break;
  case 'frustrated':{const slump=ease((t-1.8)/1.4)*(1-ease((t-6)/1.6));p.pitch=.055*w;p.roll=.04*Math.sin(t*4)*w*(1-slump);p.y=-.045*slump;p.z=.015*slump;p.bodyY=-.035*slump;p.eye=1-.68*slump;bubble('scribble',2,2.2);break;}
  case 'cheek':p.roll=.16*w;p.x=-.033*w;p.y=-.035*w;p.eye=1-.4*w-.5*ease((t-3)/.5)*(1-ease((t-3.6)/.6));p.pitch=.02*w;break;
  case 'stretch':p.bodyY=.06*w;p.y=.065*w;p.roll=.09*Math.sin(t*1.2)*w;p.bodyRoll=.025*Math.sin(t*1.2)*w;p.pitch=-.08*w;p.eye=1-.9*w;break;
  case 'breathe':{const phase=t%10,breath=phase<4?ease(phase/4):1-ease((phase-4)/6);p.bodyY=.03*breath*w;p.y=.03*breath*w;p.eye=1-.93*w;p.pitch=-.035*w;p.bubble={kind:phase<4?'inhale':'exhale',age:phase<4?phase:phase-4,duration:phase<4?4:6,breath};break;}
  case 'finish':{p.close=ease((t-2.3)/2.4);const dance=ease((t-5)/.6)*(1-ease((t-9.5)/1));p.y=Math.abs(Math.sin((t-5)*5))*.045*dance;p.roll=Math.sin((t-5)*5)*.07*dance;p.bodyRoll=p.roll*.55;p.eye=1-.35*dance;bubble('sparkles',5.3,2);break;}
  case 'blank':p.eye=1-.2*w;p.pitch=.03*w;bubble('dots',1,2);break;
  case 'nervous':p.yaw=.065*Math.sin(t*3)*w;p.eye=1-.15*w;p.y=-.014*w;bubble('sweat',1.1,2);break;
 }
 return p;
}

// Shared by the renderer and swept-collision tests. Closing/reopening the book
// owns the head pose until its whole cover has cleared the face.
export function headTransform(a,breath=0){
 const p=a.personality,c=a.bookClearance||0;
 const position=new THREE.Vector3(-1.85+p.x-a.drinking*.05,1.48+breath+p.y+a.turning*.018,1.84+a.engagement*.045-a.turning*.10+p.z);
 const rotation=new THREE.Euler(a.engagement*.18+a.writing*.04-a.turning*.08-a.drinking*.10+a.flipping*.04+p.pitch,a.headYaw,p.roll);
 position.lerp(new THREE.Vector3(-1.85,1.65+breath,1.52),c);
 rotation.x+=.012;rotation.z+=.052;
 rotation.x=THREE.MathUtils.lerp(rotation.x,-.18,c);rotation.y*=1-c;rotation.z*=1-c;
 return {position,rotation};
}

// Separate existing colored triangles rather than drawing a new face over it.
export function createFaceRig(head,{eyeWidth=1,eyeHeight=1,gazeY=0}={}){
 if(!head)return {update(){}};
 const g=head.geometry,c=g.attributes.color,p=g.attributes.position,idx=g.index;
 if(!c)return {update(){}};
 const buckets={face:[],glasses:[],left:[],right:[]},world=new THREE.Vector3();head.updateWorldMatrix(true,false);
 const count=idx?idx.count:p.count;
 for(let i=0;i<count;i+=3){const tri=[0,1,2].map(k=>idx?idx.getX(i+k):i+k),j=tri[0];world.fromBufferAttribute(p,j).applyMatrix4(head.matrixWorld);
  const r=c.getX(j),gg=c.getY(j),b=c.getZ(j);
  const glasses=r>.04&&r<.055&&gg>.03&&gg<.044&&b>.035&&b<.052;
  const pupil=r<.016&&gg<.016&&b<.02;
  const glint=r>.96&&gg>.91&&b>.70;
  buckets[glasses?'glasses':pupil||glint?(world.x<-1.85?'left':'right'):'face'].push(...tri);
 }
 function geometry(indices){const geo=new THREE.BufferGeometry();for(const [key,attr] of Object.entries(g.attributes))geo.setAttribute(key,attr);geo.setIndex(indices);geo.boundingBox=new THREE.Box3();const point=new THREE.Vector3();for(const i of indices)geo.boundingBox.expandByPoint(point.fromBufferAttribute(geo.attributes.position,i));geo.boundingSphere=geo.boundingBox.getBoundingSphere(new THREE.Sphere());return geo}
 head.geometry=geometry(buckets.face);
 const glasses=new THREE.Mesh(geometry(buckets.glasses),head.material);glasses.name='Chatito movable glasses';glasses.layers.mask=head.layers.mask;head.add(glasses);
 const delta=head.worldToLocal(new THREE.Vector3(-1.85,1.49,1.84)).sub(head.worldToLocal(new THREE.Vector3(-1.85,1.48,1.84))).multiplyScalar(100);
 const eyes=[];
 for(const side of ['left','right']){
  const geo=geometry(buckets[side]),center=geo.boundingBox.getCenter(new THREE.Vector3()),pivot=new THREE.Group(),mesh=new THREE.Mesh(geo,head.material);
  // The source mask has sockets behind the pupils. Fill those with matching
  // cream voxels so a blink reveals the face rather than a dark hole.
  const wc=center.clone().applyMatrix4(head.matrixWorld),inverse=head.matrixWorld.clone().invert();
  const cream=new THREE.MeshStandardMaterial({color:new THREE.Color(1,.875,.655),roughness:.88});
  const cells=[];
  for(let x=0;x<4;x++)for(let y=0;y<6;y++){
   const cell=new THREE.BoxGeometry(.028,.028,.012);cell.translate(wc.x+(x-1.5)*.028,1.948+(y-2.5)*.028,2.295);cell.applyMatrix4(inverse);
   cells.push(cell);
  }
  const backing=new THREE.Mesh(mergeGeometries(cells),cream);backing.name='Eye socket backing';backing.layers.mask=head.layers.mask;head.add(backing);for(const cell of cells)cell.dispose();
  pivot.position.copy(center);mesh.position.copy(center).negate();mesh.layers.mask=head.layers.mask;mesh.name=`Chatito ${side} pupil`;pivot.add(mesh);head.add(pivot);eyes.push({pivot,center});
 }
 return {head,glasses,eyes,update(pose,blink=0){glasses.position.copy(delta).multiplyScalar(pose?.glasses||0);for(const {pivot,center} of eyes){pivot.scale.x=eyeWidth;pivot.scale.y=eyeHeight*Math.max(.07,(pose?.eye??1)*(1-blink*.93));pivot.position.copy(center);pivot.position.x+=(pose?.gazeX||0)/head.scale.x;pivot.position.y+=((pose?.gazeY||0)+gazeY)/head.scale.y;}}};
}

export function createBookRig(scene){
 const pivot=new THREE.Group();pivot.name='Closing book cover';pivot.position.set(-1.85,1.355,2.43);scene.add(pivot);
 const meshes=[];scene.traverse(o=>{if(o.isMesh&&/^Web_Room(?:_Foreground)?$/.test(o.name))meshes.push(o)});
 for(const o of meshes){
  o.updateWorldMatrix(true,false);const g=o.geometry,pos=g.attributes.position,idx=g.index,keep=[],take=[],point=new THREE.Vector3(),count=idx?idx.count:pos.count;
  for(let i=0;i<count;i+=3){const tri=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);const inside=tri.every(j=>{point.fromBufferAttribute(pos,j).applyMatrix4(o.matrixWorld);return point.x>-1.85&&point.x<-1.25&&point.y>1.29&&point.y<1.379&&point.z>2.05&&point.z<2.81});const oldMarker=tri.every(j=>{point.fromBufferAttribute(pos,j).applyMatrix4(o.matrixWorld);return point.x>-1.735&&point.x<-1.685&&point.y>1.314&&point.y<1.326&&point.z>2.713&&point.z<2.927});if(!oldMarker)(inside?take:keep).push(...tri)}
  if(!take.length)continue;
  const geo=new THREE.BufferGeometry();for(const [key,attr] of Object.entries(g.attributes))geo.setAttribute(key,attr);geo.setIndex(take);geo.boundingBox=new THREE.Box3();for(const j of take)geo.boundingBox.expandByPoint(point.fromBufferAttribute(pos,j));geo.boundingSphere=geo.boundingBox.getBoundingSphere(new THREE.Sphere());
  const part=new THREE.Mesh(geo,o.material);part.name='Moving book half';part.castShadow=true;part.applyMatrix4(o.matrixWorld);part.position.sub(pivot.position);part.layers.mask=o.layers.mask;pivot.add(part);
  g.setIndex(keep); // Keep the shared room vertex buffers; only the index list changes.
 }
 const marker=new THREE.Mesh(new THREE.BoxGeometry(.04,.004,.22),new THREE.MeshStandardMaterial({color:'#b99f67',roughness:1}));marker.name='Chatito bookmark';marker.visible=false;scene.add(marker);
 return {pivot,marker,update(close,t){pivot.rotation.z=close*Math.PI;marker.visible=t!==null&&t>.7;marker.position.set(-1.68,1.382,2.72);if(t!==null&&t<2.3){const lift=1-ease((t-.7)/1.6);marker.position.y+=.22*lift;marker.position.x+=.19*lift;}if(close>.01){const point=new THREE.Vector3(.17,.027,.29).applyAxisAngle(new THREE.Vector3(0,0,1),close*Math.PI).add(pivot.position);marker.position.copy(point);marker.rotation.z=close*Math.PI}else marker.rotation.z=0;}};
}
