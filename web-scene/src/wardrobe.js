import * as T from 'three';
import {edit} from './character-look.js';

// Reusable outfit geometry; the approved face and prop grips stay independent.
export function createWardrobe(hero,face,look){
 let scene=face.head;while(scene.parent)scene=scene.parent;
 const body=hero.find(({o})=>o.name.includes('Body')).o;
 // Retain the animated attachment for the cords, but render no scarf.
 look.scarf.material.visible=false;
 const clothes=hero.filter(({o})=>o.name.includes('Body')||o.name.includes('Arm'));
 const scarfGeometry=clothes.map(({o})=>o.geometry);
 const fabric=new T.Color('#292c34'),cuff=new T.Color('#363a44');
 for(const {o}of hero){
  if(!o.name.includes('Body')&&!o.name.includes('Arm'))continue;
  edit(o,(p,c)=>{
   if(o.name.includes('Body')){c.copy(fabric);p.x=-1.85+(p.x+1.85)*1.065;}
   else{
    // Leave the flipper tip exposed; a narrow ribbed cuff marks the sleeve.
    const t=(p.z-1.878)/.34;
    if(t<.70){c.copy(fabric);const side=o.name.includes('ArmL')?1:-1,cx=-1.85+side*.408;const puff=.028*Math.sin(Math.PI*Math.max(0,t)/.84);p.x+=Math.sign(p.x-cx)*puff;p.y+=Math.sign(p.y-1.46)*puff;}
    else if(t<.84)c.copy(cuff).multiplyScalar(Math.floor(p.y/.018)%2===0?1:.82);
   }
  });
 }
 const attach=(mesh,parent)=>{mesh.layers.mask=parent.layers.mask;scene.add(mesh);mesh.updateMatrixWorld(true);parent.attach(mesh);return mesh;};
 const hood=voxelShell(.02,[-37,37,-38,40,-33,33],(x,y,z)=>{
  // A loose, slightly asymmetric crown with a soft fold toward the left.
  const fold=.021*Math.sin((y+.42)*17)*Math.max(0,1-Math.abs(y+.22)/.36);
  const xx=x+.035*Math.max(0,y/.72)-Math.sign(x)*fold,yy=y;
  const outer=(Math.abs(xx)/.70)**2.6+(Math.abs(yy)/.650)**2.6+(Math.abs(z)/.60)**2.6;
  const inner=(Math.abs(xx)/.624)**2.6+(Math.abs(yy)/.592)**2.6+(Math.abs(z)/.527)**2.6;
  const opening=y<-.06?(Math.abs(x)/.607)**2.9:(Math.abs(x)/.607)**2.9+(Math.abs(y+.018)/.563)**2.9;
  // Open the whole front. The lip rolls back toward the crown rather than
  // tracing a flat halo. Its lower ends meet the sweatshirt shoulders.
  if(outer>=1||inner<=1||y<-.65||z>.10&&opening<1)return null;
  const lip=z>.13&&opening<1.18;
  return lip?'#343842':inner<1.11?'#171b23':'#292d36';
 },[-1.85,2.025,1.86]);
 hood.name='Hoodie soft raised hood';attach(hood,face.head);
 // Short relaxed cords stay on the torso and do not cross the cheek or book.
 const cords=new T.Group();cords.name='Hoodie relaxed drawstrings';
 const cordMat=new T.MeshToonMaterial({color:'#535b68',gradientMap:body.material.gradientMap});
 const tipMat=new T.MeshToonMaterial({color:'#717b89',gradientMap:body.material.gradientMap});
 const segment=(a,b,width,mat)=>{const aa=new T.Vector3(...a),bb=new T.Vector3(...b);const m=new T.Mesh(new T.BoxGeometry(width,aa.distanceTo(bb),width),mat);m.position.copy(aa).add(bb).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bb.sub(aa).normalize());m.layers.mask=body.layers.mask;cords.add(m);};
 for(const side of [-1,1]){
  const x=-1.85+side*.14,h=side<0?1.405:1.43;
  segment([x,1.515,2.353],[x+side*.018,h+.035,2.378],.013,cordMat);
  segment([x+side*.018,h+.035,2.378],[x+side*.012,h,2.376],.017,tipMat);
 }
 scene.add(cords);cords.updateMatrixWorld(true);look.scarf.attach(cords);
 // A raised kangaroo pocket, with angled openings and restrained stitching.
 const pocket=voxelShell(.018,[-17,17,0,14,0,3],(x,y,z)=>{
  const half=.266-Math.max(0,y-.105)*.60;
  if(Math.abs(x)>half||y>.18||z>.038)return null;
  return y>.15||Math.abs(x)>half-.025?'#3b404a':'#30353f';
 },[-1.85,1.13,2.30]);pocket.name='Hoodie kangaroo pocket';attach(pocket,body);
 hood.material.gradientMap=body.material.gradientMap;pocket.material.gradientMap=body.material.gradientMap;
 const hoodieGeometry=clothes.map(({o})=>o.geometry);
 let selected='scarf';
 function set(outfit){
  selected=outfit==='hoodie'?'hoodie':'scarf';const wearing=selected==='hoodie';
  clothes.forEach(({o},i)=>{o.geometry=(wearing?hoodieGeometry:scarfGeometry)[i]});
  hood.visible=pocket.visible=cords.visible=wearing;look.scarf.material.visible=!wearing;
 }
 set('scarf');return {hood,pocket,cords,set,get selected(){return selected}};
}

function voxelShell(size,bounds,sample,offset){
 const cells=new Map(),key=(x,y,z)=>`${x},${y},${z}`;
 for(let x=bounds[0];x<=bounds[1];x++)for(let y=bounds[2];y<=bounds[3];y++)for(let z=bounds[4];z<=bounds[5];z++){
  const color=sample(x*size,y*size,z*size);if(color)cells.set(key(x,y,z),{v:[x,y,z],color});
 }
 const p=[],n=[],c=[],palette=new Map();
 for(const {v,color:hex} of cells.values())for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
  const q=[...v];q[axis]+=sign;if(cells.has(key(...q)))continue;
  if(!palette.has(hex))palette.set(hex,new T.Color(hex));const color=palette.get(hex);
  const u=(axis+1)%3,w=(axis+2)%3,vs=[];
  for(const [a,b]of [[-1,-1],[1,-1],[1,1],[-1,1]]){const point=v.map((v,i)=>v*size+offset[i]);point[axis]+=sign*size/2;point[u]+=a*size/2;point[w]+=b*size/2;vs.push(point);}
  for(const i of sign>0?[0,1,2,0,2,3]:[0,2,1,0,3,2]){p.push(...vs[i]);const normal=[0,0,0];normal[axis]=sign;n.push(...normal);c.push(color.r,color.g,color.b);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.computeBoundingBox();g.computeBoundingSphere();
 return new T.Mesh(g,new T.MeshToonMaterial({vertexColors:true,side:T.FrontSide}));
}
