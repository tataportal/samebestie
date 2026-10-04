import * as THREE from 'three';
const clamp=THREE.MathUtils.clamp,ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
export const HOURGLASS_HOME=new THREE.Vector3(-.97,1.4744,2.24);
export const FLIP_DURATION=5.1;
// Exact bounds of the original Sand timer objects in the Blender source,
// expanded only for the GLB's quantization. This excludes the mat and copies.
export function removeStaticHourglass(root){
 root.updateMatrixWorld(true);let removed=0;const v=new THREE.Vector3();
 root.traverse(o=>{if(!o.isMesh||!/^Web_Room(?:_Glow)?$/.test(o.name))return;const g=o.geometry,p=g.getAttribute('position'),idx=g.index,keep=[];
  for(let i=0;i<idx.count;i+=3){let inside=true;for(let k=0;k<3;k++){v.fromBufferAttribute(p,idx.getX(i+k)).applyMatrix4(o.matrixWorld);if(v.x< -1.073||v.x>-.867||v.y<1.293||v.y>1.655||v.z<2.145||v.z>2.335)inside=false;}
   if(inside)removed++;else keep.push(idx.getX(i),idx.getX(i+1),idx.getX(i+2));
  }g.setIndex(keep);
 });return removed;
}
export function hourglassTiming(state={},now=Date.now()){
 const duration=Number(state.config?.[state.phase])*60;
 if(!state.started||!Number.isFinite(duration)||duration<=0)return {started:false,progress:0,elapsed:0,turn:0};
 const remaining=state.complete?0:state.running&&Number.isFinite(state.end)?(state.end-now)/1000:Number(state.remaining);
 const fraction=clamp((Number.isFinite(remaining)?remaining:duration)/duration,0,1);
 const elapsed=Number.isFinite(state.actionStartedAt)?(state.running?Math.max(0,(now-state.actionStartedAt)/1000):Number(state.actionElapsed)||0):duration*(1-fraction);
 return {started:true,progress:1-fraction,elapsed,turn:Number(state.activation)>0?state.activation-1:((state.round||1)-1)*2+(state.phase==='rest'?1:0)};
}
export function createHourglass(scene){
 const root=new THREE.Group();root.name='Chatito working hourglass';root.position.copy(HOURGLASS_HOME);scene.add(root);
 const wood=new THREE.MeshStandardMaterial({color:'#785139',roughness:.85});
 const brass=new THREE.MeshStandardMaterial({color:'#bf9755',roughness:.62});
 const sandMaterial=new THREE.MeshStandardMaterial({color:'#edb95c',roughness:1});
 const glassMaterial=new THREE.MeshStandardMaterial({color:'#ffe2a5',transparent:true,opacity:.10,depthWrite:false,roughness:.22});
 const box=(name,size,position,material)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.name=name;m.position.set(...position);m.castShadow=material!==glassMaterial;root.add(m);return m};
 for(const side of [-1,1]){
  box('Hourglass wooden cap',[.2028,.039,.1872],[0,side*.1599,0],wood);
  box('Hourglass cap inset',[.164,.008,.149],[0,side*.138,0],brass);
  box('Hourglass side post',[.0195,.296,.0195],[side*.0819,0,0],wood);
 }
 // Three stepped sections in each glass bulb preserve the voxel silhouette.
 const bands=[];
 for(const side of [-1,1])for(let j=0;j<3;j++){
  const width=.048+j*.035,cy=side*(.024+j*.044);
  box('Hourglass glass bulb',[width,.042,width],[0,cy,0],glassMaterial);
  const mesh=box('Hourglass sand',[width-.012,.038,width-.012],[0,cy,0],sandMaterial);
  bands.push({mesh,side,capacity:(width-.012)**2*.038,base:cy-.019});
 }
 const total=bands.filter(b=>b.side===1).reduce((n,b)=>n+b.capacity,0);
 function fill(side,fraction,inverted){let volume=total*clamp(fraction,0,1);for(const band of bands.filter(b=>b.side===side).sort((a,b)=>inverted?b.base-a.base:a.base-b.base)){
  const amount=Math.min(volume,band.capacity)/band.capacity;volume=Math.max(0,volume-band.capacity);band.mesh.visible=amount>.0001;band.mesh.scale.y=amount;band.mesh.position.y=inverted?band.base+.038-.038*amount/2:band.base+.038*amount/2;
 }}
 const stream=box('Falling sand',[.004,.1,.004],[0,-.048,0],sandMaterial);stream.castShadow=false;
 let key=null,lastElapsed=0,previewTime=0,wasPreview=false,currentTop=0,startTop=0;
 return {root,restartPreview(){wasPreview=false;},get totalSandVolume(){return total},update(dt,state,motion,preview=false){
  const timing=hourglassTiming(state),nextKey=`${state.sessionId}:${timing.turn}`;
  if(nextKey!==key||!timing.started){key=nextKey;lastElapsed=0;startTop=currentTop;}
  if(preview){if(!wasPreview){previewTime=0;startTop=currentTop;}if(motion)previewTime+=dt;}else previewTime=0;
  wasPreview=preview;
  const enabled=preview||timing.started;
  const elapsed=preview?previewTime:Math.max(lastElapsed,timing.elapsed);if(timing.started)lastElapsed=elapsed;
  const turn=preview?0:timing.turn;
  const flipping=enabled&&motion&&elapsed<FLIP_DURATION&&(!state.complete||preview);
  const lift=flipping?ease((elapsed-.85)/.75)*(1-ease((elapsed-3.6)/.8)):0;
  const reach=flipping?ease(elapsed/.8)*(1-ease((elapsed-4.4)/.7)):0;
  const rotation=enabled?(turn+(flipping?ease((elapsed-1.6)/1.7):1))*Math.PI:0;
  root.position.copy(HOURGLASS_HOME).add(new THREE.Vector3(-.16,.18,.09).multiplyScalar(lift));root.rotation.z=rotation;
  const progress=preview?clamp((elapsed-FLIP_DURATION)/15,0,1):timing.progress;
  const destinationOdd=(turn+1)%2===1;
  // During the flip, the old lower bulb becomes the new upper bulb. After it
  // settles, integrate volume (not height) so upper + lower sand stays constant.
  const destinationTop=enabled?(destinationOdd?progress:1-progress):0;
  currentTop=flipping?THREE.MathUtils.lerp(startTop,destinationTop,ease((elapsed-1.6)/1.7)):destinationTop;
  const inverted=Math.cos(rotation)<0;
  fill(1,currentTop,inverted);fill(-1,1-currentTop,inverted);
  stream.visible=enabled&&!flipping&&motion&&(preview||state.running)&&progress>0&&progress<1;
  stream.position.y=destinationOdd?.048:-.048;
  root.updateMatrixWorld(true);
  return {flipping,reach,lift,progress,grip:root.localToWorld(new THREE.Vector3(-.112,0,0)),headYaw:.14*reach};
 }};
}
