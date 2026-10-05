import {Color,Vector3} from 'three';

export const DESK_BLUE='#478ecc';

// The marker is baked into the room batch. Repaint only its sage barrel;
// preserve the charcoal cap, cream clip, and surrounding papers.
export function recolorHighlighter(scene){
 scene.updateMatrixWorld(true);
 const blue=new Color(DESK_BLUE),point=new Vector3();
 scene.traverse(mesh=>{
  if(mesh.name!=='Web_Room')return;
  const positions=mesh.geometry.attributes.position,colors=mesh.geometry.attributes.color;
  for(let i=0;i<positions.count;i++){
   point.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);
   if(point.x< -1.25||point.x>-.95||point.y<1.25||point.y>1.45||point.z<2.94||point.z>3.06)continue;
   if(Math.abs(colors.getX(i)-.4078)<.002&&Math.abs(colors.getY(i)-.4784)<.002&&Math.abs(colors.getZ(i)-.1451)<.002)
    colors.setXYZ(i,blue.r,blue.g,blue.b);
  }
  colors.needsUpdate=true;
 });
}
