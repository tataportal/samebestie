import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {FXAAShader} from 'three/addons/shaders/FXAAShader.js';
import './style.css';
import {mountFocus} from './focus.js';
import {createStudyMotion} from './study-motion.js';
import {CozyBokehPass,bokehFragment} from './bokeh.js';
const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color('#463327');
const camera=new THREE.PerspectiveCamera(39.6,1,.1,40);camera.position.set(-1.85,1.95,5.6);camera.lookAt(-1.85,1.95,2.34);
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(1);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;renderer.shadowMap.autoUpdate=false;
$('room').appendChild(renderer.domElement);
const hemi=new THREE.HemisphereLight('#ffdeb0','#544035',1.05);scene.add(hemi);
const key=new THREE.DirectionalLight('#ffc38b',2.5);key.position.set(-3.5,4,4);key.target.position.set(-1.85,1.6,2);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-4,right:4,top:5,bottom:-3,near:.1,far:18});key.shadow.radius=4;key.shadow.blurSamples=8;key.shadow.normalBias=.002;key.shadow.bias=-.00015;scene.add(key,key.target);
const fill=new THREE.DirectionalLight('#c8dce0',.28);fill.position.set(1,2.5,5);scene.add(fill);
const lamp=new THREE.PointLight('#ffa34f',26,5,2);lamp.position.set(-2.76,2.10,2.14);scene.add(lamp);
const roomLight=new THREE.PointLight('#ff9d51',5,14,2);roomLight.position.set(0,3,0);scene.add(roomLight);
const backLight=new THREE.PointLight('#ffad5c',6,10,2);backLight.position.set(1.5,3,-2);scene.add(backLight);
const hdrTarget=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:Math.min(4,renderer.capabilities.maxSamples)});
const composer=new EffectComposer(renderer,hdrTarget);
for(const rt of [composer.renderTarget1,composer.renderTarget2]){rt.texture.generateMipmaps=true;rt.texture.minFilter=THREE.LinearMipmapLinearFilter;}
const renderPass=new RenderPass(scene,camera);composer.addPass(renderPass);
// Dense voxel grooves already provide relief. Screen-space AO darkens the face
// independently of receiveShadow and produces unstable bands during breathing.
// Keep the room's real light shadows; quality changes resolution only.
const dof=new CozyBokehPass(scene,camera,{focus:3.26,aperture:.006,maxblur:.026});dof.uniforms.backgroundBrightness={value:.75};dof.materialBokeh.fragmentShader=bokehFragment;dof.materialBokeh.needsUpdate=true;composer.addPass(dof);
const bloom=new UnrealBloomPass(new THREE.Vector2(800,800),.28,.45,1.05);composer.addPass(bloom);
composer.addPass(new OutputPass());
const antialias=new ShaderPass(FXAAShader);composer.addPass(antialias);
const grain=new ShaderPass({uniforms:{tDiffuse:{value:null},time:{value:0},amount:{value:.012}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float time;uniform float amount;varying vec2 vUv;float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+time*37.61)*43758.5453);}void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.2126,.7152,.0722));float n=(hash(gl_FragCoord.xy)+hash(gl_FragCoord.xy+17.3)-1.)*amount;float gate=.3+.7*sin(clamp(l,0.,1.)*3.14159);c.rgb+=n*gate;float vig=1.-.12*pow(length((vUv-.5)*1.3),2.);gl_FragColor=vec4(c.rgb*vig,c.a);}`});composer.addPass(grain);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let motion=!reduced.matches,ready=false,hero=[],fps=0,frames=0,lastMeasure=performance.now(),lastDraw=0,lastFrameTime=0,phaseTime=0;
const approvedLook={warmth:1.05,background:.75,bokeh:.013,bloom:.3,grain:.01,quality:'low'};
let settings={...approvedLook};
try{if(localStorage.getItem('bestie-look-version')==='2')settings={...settings,...JSON.parse(localStorage.getItem('bestie-look')||'{}')};else{localStorage.setItem('bestie-look',JSON.stringify(settings));localStorage.setItem('bestie-look-version','2')}}catch{}
function resize(){const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(.36/Math.max(.76,Math.min(1,w/h))));camera.updateProjectionMatrix();const scale=Math.min(1,({low:1050,balanced:1400,high:1800}[settings.quality]||1050)/Math.max(w,h));renderer.setSize(w,h);composer.setSize(Math.round(w*scale),Math.round(h*scale));antialias.uniforms.resolution.value.set(1/Math.round(w*scale),1/Math.round(h*scale));renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';}
function applyLook(save=true){key.intensity=1.05*Number(settings.warmth);lamp.intensity=1.4*Number(settings.warmth);dof.uniforms.maxblur.value=Number(settings.bokeh);dof.uniforms.backgroundBrightness.value=Number(settings.background);dof.enabled=Number(settings.bokeh)>.0001||Number(settings.background)!==1;bloom.strength=Number(settings.bloom);grain.uniforms.amount.value=Number(settings.grain);for(const id of ['warmth','background','bokeh','bloom','grain','quality'])$(id).value=settings[id];resize();if(save)try{localStorage.setItem('bestie-look',JSON.stringify(settings))}catch{}}
for(const id of ['warmth','background','bokeh','bloom','grain','quality'])$(id).addEventListener('input',()=>{settings[id]=$(id).value;applyLook()});
$('settings-button').onclick=()=>{const open=$('settings').hidden;$('settings').hidden=!open;$('settings-button').setAttribute('aria-expanded',String(open))};
$('reset-look').onclick=()=>{settings={...approvedLook};applyLook()};
function syncMotion(){$('motion').textContent=motion?'Pausar movimiento':'Activar movimiento';$('motion').setAttribute('aria-pressed',String(motion))}
$('motion').onclick=()=>{motion=!motion;syncMotion()};reduced.addEventListener('change',e=>{motion=!e.matches;syncMotion()});syncMotion();
window.addEventListener('resize',resize);applyLook(false);
const pageMeshes=[];let pose=[],studyMotion;
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
try{
 const gltf=await loader.loadAsync(`${import.meta.env.BASE_URL}models/cozy-room.glb?v=sealed-3`);
 gltf.scene.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;const m=o.material;m.side=THREE.DoubleSide;m.roughness=.88;m.metalness=0;if(o.name.includes('Glow')){m.emissive.set('#ff9a38');m.emissiveIntensity=2;m.color.set('#ffb760')}if(o.name.includes('Bao'))o.visible=false;if(o.name.includes('ReadingPage'))pageMeshes.push(o);if(o.name.includes('Chatito')){o.receiveShadow=false;if(!o.name.includes('Leg'))hero.push({o,y:o.position.y});}});
 scene.add(gltf.scene);
 for(const {o} of hero){if(o.name.includes('Arm'))continue;const p=new THREE.Group();p.position.set(-1.85,1.48,1.84);if(o.name.includes('Arm'))p.position.x+=o.name.includes('L')?-.41:.41;scene.add(p);p.attach(o);pose.push({p,name:o.name,y:p.position.y});}
 studyMotion=createStudyMotion(scene,hero,pageMeshes);
 renderer.shadowMap.needsUpdate=true;ready=true;$('loading').classList.add('ready');
}catch(e){console.error(e);$('loading').textContent='No se pudo cargar el cuarto. Recarga para intentarlo de nuevo.'}
const focusSession=mountFocus();
const previewButtons=[...document.querySelectorAll('[data-study-action]')];
for(const button of previewButtons){
 button.disabled=!ready;
 button.onclick=()=>{studyMotion.preview(button.dataset.studyAction);for(const other of previewButtons)other.setAttribute('aria-pressed',String(other===button));$('resume-actions').hidden=false;};
}
$('resume-actions').onclick=()=>{studyMotion.clearPreview();for(const button of previewButtons)button.setAttribute('aria-pressed','false');$('resume-actions').hidden=true;};
document.addEventListener('visibilitychange',()=>{lastDraw=0;lastFrameTime=0});
// Pause hidden tabs and cap animated rendering at 30 fps for a study companion.
renderer.info.autoReset=false;
let readBlend=0,previousFocus=false,lastShadow=0;
function frame(now){
 requestAnimationFrame(frame);if(document.hidden||!ready)return;
 const interval=1000/30,elapsed=now-lastDraw;if(elapsed<interval)return;
 const dt=lastFrameTime?Math.min((now-lastFrameTime)/1000,.1):0;lastFrameTime=now;lastDraw=now-(elapsed%interval);
 if(motion)phaseTime+=dt;
 const activity=studyMotion.update(dt,focusSession,motion);readBlend=activity.engagement;
 for(const {p,name,y} of pose){
  const breath=motion?Math.sin(phaseTime*1.2)*.004:0;p.position.y=y+breath;
  p.rotation.x=0;p.rotation.y=0;p.position.x=-1.85;p.position.z=1.84;
  if(name.includes('Head')){p.rotation.x=readBlend*.18+activity.writing*.04-activity.turning*.08-activity.drinking*.10;p.rotation.y=activity.headYaw;p.position.y+=activity.turning*.018;p.position.x-=activity.drinking*.05;p.position.z+=readBlend*.045-activity.turning*.10;}
 }
 // This camera is always the intimate focus view; Bao stays hidden.
 if(previousFocus!==focusSession.focusing){renderer.shadowMap.needsUpdate=true;previousFocus=focusSession.focusing;}
 if(activity.active&&now-lastShadow>200){renderer.shadowMap.needsUpdate=true;lastShadow=now;}
 grain.uniforms.time.value=motion?Math.floor(phaseTime*24):0;
 renderer.info.reset();composer.render();frames++;if(now-lastMeasure>=1000){fps=frames*1000/(now-lastMeasure);frames=0;lastMeasure=now;}
}
requestAnimationFrame(frame);
// Read-only local verification hook. The experience itself has no engineering HUD.
window.__bestie={get ready(){return ready},get metrics(){return {fps:Math.round(fps),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,renderSize:[composer.readBuffer.width,composer.readBuffer.height],webgl:renderer.capabilities.isWebGL2}},get settings(){return {...settings}},get timer(){return focusSession.state},get camera(){return {position:camera.position.toArray(),fov:camera.fov}},setLook(v){settings={...settings,...v};applyLook(false)}};
