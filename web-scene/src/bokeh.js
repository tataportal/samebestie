// Golden-angle disk sampling avoids the visible rings of the stock sparse kernel.
// The depth rejection prevents background highlights bleeding over the face.
export const bokehFragment = `
#include <common>
#include <packing>
varying vec2 vUv;
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform float focus, aperture, maxblur, nearClip, farClip, aspect;
uniform float backgroundBrightness;
float depthAt(vec2 uv){return -perspectiveDepthToViewZ(unpackRGBAToDepth(texture2D(tDepth,uv)),nearClip,farClip);}
void main(){
 float z=depthAt(vUv);
 if(z<focus+.65){gl_FragColor=texture2D(tColor,vUv);return;}
 // Depth isolates the room from Chatito and the foreground desk. Fade the
 // boundary so nearby props never get a hard brightness cut across them.
 float backgroundLight=mix(1.,backgroundBrightness,smoothstep(focus+.65,focus+1.5,z));
 float radius=min(max(0.,abs(z-focus)-.13)*aperture,maxblur);
 if(radius<.0003){gl_FragColor=vec4(texture2D(tColor,vUv).rgb*backgroundLight,1.);return;}
 vec3 sum=vec3(0.);float weights=0.;
 float angle=0.;
 for(int i=0;i<96;i++){
  float r=sqrt((float(i)+.5)/96.)*radius;
  float a=float(i)*2.399963+angle;
  vec2 uv=clamp(vUv+vec2(cos(a),sin(a)*aspect)*r,vec2(.001),vec2(.999));
  float d=depthAt(uv);
  float accept=(z>focus+.3&&d<focus+.15)?0.:1.;
  vec3 c=texture2D(tColor,uv,clamp(log2(max(radius*200.,1.)),0.,3.)).rgb;
  float weight=(1.+min(dot(c,vec3(.2126,.7152,.0722)),3.)*.6)*accept;
  sum+=c*weight;weights+=weight;
 }
 gl_FragColor=vec4(sum/max(weights,.001)*backgroundLight,1.);
}`;
