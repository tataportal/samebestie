import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
// Only the background layer enters this texture. There are no foreground
// silhouettes, depth rejections or bright lamp pixels in its mip chain.
export const bokehFragment=`
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float maxblur,aspect,backgroundBrightness;
void main(){
 if(maxblur<.0003){gl_FragColor=vec4(textureLod(tDiffuse,vUv,0.).rgb*backgroundBrightness,1.);return;}
 vec3 sum=vec3(0.);float weights=0.;
 float lod=clamp(log2(max(maxblur*200.,1.)),0.,3.);
 for(int i=0;i<96;i++){
  float r=sqrt((float(i)+.5)/96.)*maxblur;
  float angle=float(i)*2.399963;
  vec2 uv=clamp(vUv+vec2(cos(angle),sin(angle)*aspect)*r,vec2(.001),vec2(.999));
  vec3 color=textureLod(tDiffuse,uv,lod).rgb;
  float weight=1.+min(dot(color,vec3(.2126,.7152,.0722)),3.)*.6;
  sum+=color*weight;weights+=weight;
 }
 gl_FragColor=vec4(sum/weights*backgroundBrightness,1.);
}`;
export class CozyBokehPass extends ShaderPass {
 constructor(){super({uniforms:{tDiffuse:{value:null},maxblur:{value:.013},aspect:{value:1},backgroundBrightness:{value:.75}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:bokehFragment});}
 setSize(width,height){this.uniforms.aspect.value=width/height;}
}
