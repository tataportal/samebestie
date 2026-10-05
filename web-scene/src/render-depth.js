import {DepthTexture,DepthFormat,FloatType,FrontSide} from 'three';

// The closest foreground surface stays more than two units from the camera.
// A 0.1 near plane wastes depth precision on empty space, making the inset
// voxel backing and bevel edges compete on different GPU depth implementations.
export const SCENE_NEAR=1;
export const SCENE_FAR=40;
export function createSceneDepth(){
 const depth=new DepthTexture(1,1,FloatType);
 depth.format=DepthFormat;
 return depth;
}
export function prepareCharacterSurface(mesh){
 // Closed voxel shells only need their outward faces. Do not render the
 // reverse side of internal cells through subpixel bevel gaps.
 mesh.material=mesh.material.clone();
 mesh.material.side=FrontSide;
 mesh.receiveShadow=false;
}
