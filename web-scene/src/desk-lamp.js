import {BufferGeometry,Float32BufferAttribute,Mesh,Vector3,Quaternion} from 'three';
import {FOREGROUND} from './scene-layers.js';

export const LAMP_HEAD_OFFSET=-.58;
export const LAMP_BOOK_TARGET=new Vector3(-2.35,1.34,2.24);
const hinge=new Vector3(-2.83+LAMP_HEAD_OFFSET,2.425,2.10);
const beam=LAMP_BOOK_TARGET.clone().sub(hinge).normalize();
const tilt=new Quaternion().setFromUnitVectors(new Vector3(0,-1,0),beam);
export const LAMP_LIGHT_POSITION=new Vector3(-2.76+LAMP_HEAD_OFFSET,2.1475,2.14).sub(hinge).applyQuaternion(tilt).add(hinge).addScaledVector(beam,.04);
export const LAMP_LIGHT_TARGET=LAMP_LIGHT_POSITION.clone().add(beam);
// The asset batches the lamp into the room. Extract only its dark housing and
// emissive underside; keep the foot planted and fold the upper arm inward.
export function repositionDeskLamp(scene){
 scene.updateMatrixWorld(true);const fixtures=[],v=new Vector3(),center=new Vector3();
 const sources=[];scene.traverse(o=>{if(/^Web_Room(?:_Glow)?_Foreground$/.test(o.name))sources.push(o)});
 for(const source of sources){
  const g=source.geometry,index=g.index,p=g.attributes.position,color=g.attributes.color;
  const remaining=[],picked=[],shadeVertices=new Set(),glow=source.name.includes('_Glow');
  for(let i=0;i<index.count;i+=3){
   center.set(0,0,0);let minX=Infinity,maxY=-Infinity;for(let k=0;k<3;k++){v.fromBufferAttribute(p,index.getX(i+k)).applyMatrix4(source.matrixWorld);center.add(v);minX=Math.min(minX,v.x);maxY=Math.max(maxY,v.y)}center.multiplyScalar(1/3);
   const j=index.getX(i),dark=color.getX(j)>.018&&color.getX(j)<.022&&color.getY(j)>.033&&color.getY(j)<.037&&color.getZ(j)>.037&&color.getZ(j)<.042;
   const lamp=center.x>-3.7&&center.x<-2.4&&center.y>1.24&&center.y<2.6&&center.z>1.8&&center.z<2.5&&(glow||dark);
   (lamp?picked:remaining).push(index.getX(i),index.getX(i+1),index.getX(i+2));
   if(lamp&&(glow||(minX>-3.08&&maxY<2.435&&center.y>2.13)))for(let k=0;k<3;k++)shadeVertices.add(index.getX(i+k));
  }
  if(!picked.length)continue;
  const geometry=new BufferGeometry(),positions=[],colors=[];
  for(const j of picked){
   v.fromBufferAttribute(p,j).applyMatrix4(source.matrixWorld);
   const weight=v.y>2.1?Math.max(0,Math.min(1,(v.x+3.38)/.28)):0;
   v.x+=LAMP_HEAD_OFFSET*weight;
   if(shadeVertices.has(j))v.sub(hinge).applyQuaternion(tilt).add(hinge);
   positions.push(v.x,v.y,v.z);colors.push(color.getX(j),color.getY(j),color.getZ(j));
  }
  geometry.setAttribute('position',new Float32BufferAttribute(positions,3));geometry.setAttribute('color',new Float32BufferAttribute(colors,3));geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
  g.setIndex(remaining);
  const fixture=new Mesh(geometry,source.material);fixture.name=glow?'Desk lamp underside':'Desk lamp housing';fixture.layers.set(FOREGROUND);fixture.castShadow=source.castShadow;fixture.receiveShadow=source.receiveShadow;scene.add(fixture);fixtures.push(fixture);
 }
 return fixtures;
}
