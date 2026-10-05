import * as T from 'three';
// Approved character look. Keep decoded source attributes isolated from edits
// because the face, glasses and pupils initially share the same vertex buffers.
export function edit(mesh,fn){
 mesh.updateWorldMatrix(true,false);
 const src=mesh.geometry,g=new T.BufferGeometry(),p=src.attributes.position,c=src.attributes.color;
 for(const [name,attribute] of Object.entries(src.attributes))g.setAttribute(name,attribute);g.setIndex(src.index);
 const pos=new Float32Array(p.count*3),colors=c?new Float32Array(c.count*3):null;
 for(let i=0;i<p.count;i++){pos.set([p.getX(i),p.getY(i),p.getZ(i)],i*3);if(c)colors.set([c.getX(i),c.getY(i),c.getZ(i)],i*3);}
 const inv=mesh.matrixWorld.clone().invert(),point=new T.Vector3();
 const used=new Set(src.index?src.index.array:Array.from({length:p.count},(_,i)=>i));
 for(const i of used){point.fromArray(pos,i*3).applyMatrix4(mesh.matrixWorld);const color=colors?new T.Color().fromArray(colors,i*3):null;fn(point,color);point.applyMatrix4(inv).toArray(pos,i*3);if(color)color.toArray(colors,i*3);}
 g.setAttribute('position',new T.BufferAttribute(pos,3));if(colors)g.setAttribute('color',new T.BufferAttribute(colors,3));g.boundingBox=new T.Box3();for(const i of used)g.boundingBox.expandByPoint(point.fromArray(pos,i*3));g.boundingSphere=g.boundingBox.getBoundingSphere(new T.Sphere());mesh.geometry=g;
}
export const CHATITO_FACE={eyeWidth:1.16,eyeHeight:1.08,gazeY:-.011};
export const BOOK_BODY_RETRACTION=.44;
export function applyCharacterLook(hero,face){
 face.glasses.visible=true;
 for(const {o} of hero){
  if(o.name.includes('Scarf')){o.visible=false;continue;}
  if(o.name.includes('Arm')){const side=o.name.includes('ArmL')?1:-1;o.userData.studyGrip=[side*(.0633*.82-.038),-.0236*.8-.014,.3738*.8+.038];}
  edit(o,(p,c)=>{
   if(o.name.includes('Head')&&c.r>.8&&c.g<.5){
    // Shorter bill, with the broad square corners pulled into a rounded tip.
    const x=(p.x+1.85)/.14,y=(p.y-1.78)/.056;
    p.x=-1.85+(p.x+1.85)*.79;
    p.y=1.78+(p.y-1.78)*(.88-.18*Math.min(1,x*x));
    p.z=2.286+(p.z-2.286)*.55-.016*Math.min(1,x*x+y*y*.3);
   }
   if(o.name.includes('Body')&&c.r>.3&&c.g<.25&&c.b<.1){c.setRGB(.02,.012,.008);}
   if(o.name.includes('Arm')){
    const side=o.name.includes('ArmL')?1:-1,cx=-1.85+side*.408;
    p.x=cx+(p.x-cx)*.82-side*.038;
    p.y=1.48+(p.y-1.48)*.80-.014;
    p.z=1.84+(p.z-1.84)*.80+.038;
   }
   if(c&&c.r<.12&&c.g<.12&&c.b<.12){c.setRGB(c.r*.85+.014,c.g*.78+.006,c.b*.65+.003);}
  });
 }
 edit(face.glasses,(p,c)=>{
  const cx=-1.85+(p.x<-1.85?-.252:.252),dx=p.x-cx,dy=p.y-1.948;
  if(p.z>2.37&&(Math.abs(dx)>.08||Math.abs(dy)>.07)){
   const r=Math.pow(Math.pow(Math.abs(dx)/.205,2.5)+Math.pow(Math.abs(dy)/.196,2.5),1/2.5);
   if(r>.55){const k=(1.16+(r-1.16)*.64)/r;p.x=cx+dx*k;p.y=1.948+dy*k;}
  }
  p.z-=.045;
  c?.setRGB(.059,.034,.023);
 });
 // Fill the original bill socket before the smaller bill sits in front of it.
 let scene=face.head;while(scene.parent)scene=scene.parent;
 const cream=new T.Mesh(new T.BoxGeometry(.292,.13,.014),new T.MeshStandardMaterial({color:new T.Color(1,.875,.655),roughness:.9}));
 cream.name='Bill socket backing';cream.position.set(-1.85,1.78,2.292);cream.layers.mask=face.head.layers.mask;scene.add(cream);cream.updateMatrixWorld(true);face.head.attach(cream);
 const body=hero.find(({o})=>o.name.includes('Body')).o;
 const scarf=makeScarf();scarf.position.z=.055;scarf.layers.mask=body.layers.mask;scene.add(scarf);scarf.updateMatrixWorld(true);body.attach(scarf);
 const ramp=new T.DataTexture(new Uint8Array([100,185,255]),3,1,T.RedFormat,T.UnsignedByteType);
 ramp.minFilter=ramp.magFilter=T.NearestFilter;ramp.generateMipmaps=false;ramp.needsUpdate=true;
 const materials=new Map();
 for(const {o} of hero)o.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const source=mesh.material;
  if(!materials.has(source))materials.set(source,new T.MeshToonMaterial({color:source.color,vertexColors:source.vertexColors,gradientMap:ramp,side:T.FrontSide}));
  mesh.material=materials.get(source);mesh.receiveShadow=false;
 });
 const scarfRest=scarf.position.clone();
 const localBack=body.worldToLocal(new T.Vector3(0,-.85,-1)).sub(body.worldToLocal(new T.Vector3(0,0,0)));
 return {scarf,billBacking:cream,update(activity){
  // Let the soft collar fold toward the chest as the head bends over the book.
  const tuck=.12*activity.engagement+(activity.personality.id==='frustrated'?.16*activity.personality.w:0);
  scarf.position.copy(scarfRest).addScaledVector(localBack,tuck);
 }};
}

function makeScarf(){
 const size=.024,cells=new Map(),key=(x,y,z)=>`${x},${y},${z}`;
 for(let ix=-23;ix<=23;ix++)for(let iy=52;iy<=70;iy++)for(let iz=66;iz<=103;iz++){
  const x=ix*size,y=iy*size,z=iz*size,front=(z-1.97)/.40;
  const radial=Math.sqrt((x/.45)**2+((z-1.97)/.40)**2),cy=1.60-.020*front;
  const collar=radial>.84&&radial<1.055&&Math.abs(y-cy)<.050;
  const knot=((x-.31)/.075)**2+((y-1.545)/.067)**2+((z-2.31)/.10)**2<1;
  const longTail=y<1.55&&y>1.408&&Math.abs(x-(.31+.10*(1.55-y)))<.059&&Math.abs(z-(2.36+.06*(1.55-y)))<.028;
  const shortTail=y<1.545&&y>1.455&&Math.abs(x-(.26-1.0*(1.545-y)))<.050&&Math.abs(z-2.375)<.027;
  if(collar||knot||longTail||shortTail)cells.set(key(ix,iy,iz),[ix,iy,iz,knot?1:0]);
 }
 const positions=[],normals=[],colors=[];
 const shades=[new T.Color('#387fc0'),new T.Color('#2c67a0'),new T.Color('#559bd8')];
 for(const [ix,iy,iz,knot] of cells.values())for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
  const q=[ix,iy,iz];q[axis]+=sign;if(cells.has(key(...q)))continue;
  const u=(axis+1)%3,v=(axis+2)%3,vs=[];
  for(const [a,b]of [[-1,-1],[1,-1],[1,1],[-1,1]]){const p=[ix*size-1.85,iy*size,iz*size];p[axis]+=sign*size/2;p[u]+=a*size/2;p[v]+=b*size/2;vs.push(p);}
  const order=sign>0?[0,1,2,0,2,3]:[0,2,1,0,3,2],color=shades[knot?1:iy%4===0?2:0];
  for(const n of order){positions.push(...vs[n]);const normal=[0,0,0];normal[axis]=sign;normals.push(...normal);colors.push(color.r,color.g,color.b);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));
 const mesh=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));mesh.name='Wrapped scarf with side knot and two ends';return mesh;
}
