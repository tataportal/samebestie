import {BufferGeometry,Mesh,MeshBasicMaterial,Vector3} from 'three';
import {Pass} from 'three/addons/postprocessing/Pass.js';
export const BACKGROUND=1,FOREGROUND=2;
// The GLB batches static props into Room/Room_Glow. Partition the desk zone
// once in world space, keeping every original triangle and shared attributes.
export function isDeskPoint(x,y,z){return x>-3.8&&x<-.25&&y>.12&&z>1.15;}
export function splitRoomMesh(mesh){
 const g=mesh.geometry,p=g.getAttribute('position'),idx=g.index;
 const front=[],back=[],v=new Vector3();const count=idx?idx.count:p.count;
 for(let i=0;i<count;i+=3){
  const tri=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);let x=0,y=0,z=0;
  for(const j of tri){v.fromBufferAttribute(p,j).applyMatrix4(mesh.matrixWorld);x+=v.x;y+=v.y;z+=v.z;}
  (isDeskPoint(x/3,y/3,z/3)?front:back).push(...tri);
 }
 function part(indices,layer,name){if(!indices.length)return null;const geometry=new BufferGeometry();for(const [key,attr] of Object.entries(g.attributes))geometry.setAttribute(key,attr);geometry.setIndex(indices);geometry.computeBoundingBox();geometry.computeBoundingSphere();const result=new Mesh(geometry,mesh.material);result.name=mesh.name+name;result.position.copy(mesh.position);result.quaternion.copy(mesh.quaternion);result.scale.copy(mesh.scale);result.castShadow=mesh.castShadow;result.receiveShadow=mesh.receiveShadow;result.layers.set(layer);return result;}
 return [part(back,BACKGROUND,'_Background'),part(front,FOREGROUND,'_Foreground')].filter(Boolean);
}
export function partitionScene(scene){
 scene.updateMatrixWorld(true);const room=[];
 scene.traverse(o=>{if(o.isLight)o.layers.enableAll();if(!o.isMesh)return;if(/^Web_Room(?:_Glow)?$/.test(o.name))room.push(o);else o.layers.set(o.name.includes('Chatito')||o.name.includes('ReadingPage')?FOREGROUND:BACKGROUND);});
 for(const mesh of room){const parts=splitRoomMesh(mesh),parent=mesh.parent;for(const part of parts)parent.add(part);parent.remove(mesh);}
}
export function markForeground(root){root.traverse(o=>{if(o.isMesh)o.layers.set(FOREGROUND)});}
// Layered draws share one lighting/shadow setup. Refresh shadows with both
// layers present before drawing background only; never cache a partial map.
export class LayerRenderPass extends Pass {
 constructor(scene,camera,layer){super();this.scene=scene;this.camera=camera;this.layer=layer;this.needsSwap=false;this.shadowOnly=new MeshBasicMaterial({colorWrite:false,depthWrite:false,depthTest:false});}
 dispose(){this.shadowOnly.dispose();}
 render(renderer,writeBuffer,readBuffer){
  const {scene,camera}=this,mask=camera.layers.mask,background=scene.background,autoClear=renderer.autoClear;
  try{
   if(this.layer===BACKGROUND&&renderer.shadowMap.needsUpdate){camera.layers.enableAll();renderer.setRenderTarget(readBuffer);const override=scene.overrideMaterial;
    scene.overrideMaterial=this.shadowOnly;
    try{renderer.render(scene,camera);}finally{scene.overrideMaterial=override;}}
   camera.layers.set(this.layer);renderer.autoClear=false;renderer.setRenderTarget(this.renderToScreen?null:readBuffer);
   if(this.layer===FOREGROUND){scene.background=null;renderer.clearDepth();}else renderer.clear();
   renderer.render(scene,camera);
  }finally{camera.layers.mask=mask;scene.background=background;renderer.autoClear=autoClear;}
 }
}
