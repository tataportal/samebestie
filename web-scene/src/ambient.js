export const AMBIENT_TRACKS = [
 {id:'rain',name:'Rain',url:new URL('./audio/rain-recorded.mp3',import.meta.url).href},
 {id:'crickets',name:'Crickets',url:new URL('./audio/crickets-recorded.mp3',import.meta.url).href},
 {id:'forest',name:'Forest',url:new URL('./audio/forest-recorded.mp3',import.meta.url).href},
 {id:'fireplace',name:'Fireplace',url:new URL('./audio/fireplace-recorded.mp3',import.meta.url).href},
 {id:'cafe',name:'Café',url:new URL('./audio/cafe-recorded.mp3',import.meta.url).href},
 {id:'brown',name:'Brown noise',url:new URL('./audio/brown-noise.mp3',import.meta.url).href},
 {id:'pink',name:'Pink noise',url:new URL('./audio/pink-noise.mp3',import.meta.url).href},
 {id:'white',name:'White noise',url:new URL('./audio/white-noise.mp3',import.meta.url).href},
 {id:'calm10',name:'10 Hz binaural',url:new URL('./audio/calm-10hz.mp3',import.meta.url).href},
 {id:'focus40',name:'40 Hz binaural',url:new URL('./audio/focus-40hz.mp3',import.meta.url).href},
];
export function createAmbientMixer({createContext=()=>new (window.AudioContext||window.webkitAudioContext)(),fetchAudio=url=>fetch(url),onChange=()=>{}}={}){
 let context,output;
 const tracks=new Map(AMBIENT_TRACKS.map(t=>[t.id,{...t,volume:.3,active:false,status:'off',generation:0,buffer:null,pending:null,source:null,gain:null}]));
 function emit(t){onChange({id:t.id,active:t.active,status:t.status,volume:t.volume})}
 function setup(){if(context)return;context=createContext();const compressor=context.createDynamicsCompressor();compressor.threshold.value=-16;compressor.ratio.value=4;output=context.createGain();output.gain.value=.7;compressor.connect(output);output.connect(context.destination);output=compressor}
 function stop(t){if(t.source){const source=t.source,gain=t.gain;gain.gain.cancelScheduledValues(context.currentTime);gain.gain.setTargetAtTime(0,context.currentTime,.025);source.onended=()=>{source.disconnect();gain.disconnect()};source.stop(context.currentTime+.15);t.source=null;t.gain=null}}
 async function setActive(id,active){
  const t=tracks.get(id);if(!t)return;
  const token=++t.generation;t.active=active;stop(t);
  if(!active){t.status='off';emit(t);return}
  t.status='loading';emit(t);
  try{
   setup();await context.resume();
   if(!t.buffer){
    if(!t.pending)t.pending=(async()=>{const response=await fetchAudio(t.url);if(!response.ok)throw new Error('audio load');return context.decodeAudioData(await response.arrayBuffer())})().then(buffer=>{t.buffer=buffer;return buffer}).finally(()=>{t.pending=null});
    await t.pending;
   }
   if(token!==t.generation||!t.active)return;
   const source=context.createBufferSource(),gain=context.createGain();source.buffer=t.buffer;source.loop=true;gain.gain.value=0;source.connect(gain);gain.connect(output);gain.gain.setTargetAtTime(t.volume,context.currentTime,.08);source.start();t.source=source;t.gain=gain;t.status='on';emit(t);
  }catch{if(token!==t.generation)return;t.active=false;t.status='error';emit(t)}
 }
 return {
  setActive,
  toggle:id=>{const t=tracks.get(id);if(t)return setActive(id,!t.active)},
  setVolume(id,value,{activate=false}={}){const t=tracks.get(id);if(!t)return;const n=Number(value);if(!Number.isFinite(n))return;t.volume=Math.max(0,Math.min(1,n));if(t.gain)t.gain.gain.setTargetAtTime(t.volume,context.currentTime,.04);emit(t);if(activate&&t.active!==(t.volume>0))return setActive(id,t.volume>0)},
  stopAll(){for(const t of tracks.values())setActive(t.id,false)},
 };
}
function atmosphereCaption(playing){
 const captions=[
  'quiet era. add a little atmosphere.',
  'a little ambience, as a treat.',
  'okay, the vibes are layering.',
  'your room has lore now.',
  'the vibes have side quests.',
  'bestie, you opened a whole ecosystem.',
  'your ambience has ambience.',
  'this room needs its own postcode.',
  'we’re worldbuilding at this point.',
  'one more and we have a cinematic universe.',
  'executive producer of the atmosphere.',
 ];
 if(playing.size===1){
  const solo={rain:'a little rain, as a treat.',crickets:'the crickets have entered the chat.',forest:'forest era. no hiking required.',fireplace:'cozy has entered the chat.',cafe:'café energy. zero dress code.',brown:'brain, meet your weighted blanket.',pink:'soft static. soft life.',white:'a little shhh for the plot.',calm10:'headphones on. tiny brain spa.',focus40:'headphones on. entering the zone.'};
  return solo[[...playing][0]]||captions[1];
 }
 return captions[Math.min(playing.size,captions.length-1)];
}
export function mountAmbient(container){
 container.innerHTML=`<div class="ambient-heading"><strong>Sound layers</strong><button id="ambient-stop" disabled>All off</button></div><div class="ambient-tracks">${AMBIENT_TRACKS.map(t=>`<div class="ambient-track"><button data-ambient="${t.id}" aria-pressed="false"><i aria-hidden="true"></i>${t.name}</button><input type="range" min="0" max="100" value="30" aria-label="${t.name} volume" data-ambient-volume="${t.id}"></div>`).join('')}</div><p class="ambient-help" id="ambient-status" role="status">${atmosphereCaption(new Set())}</p><details class="audio-credits"><summary>Audio credits</summary><p>Field recordings, edited into loops via <a href="https://github.com/rafaelmardojai/blanket/blob/775f2a767230a9681850d1b1e085be58656f1382/SOUNDS_LICENSING.md" target="_blank" rel="noopener">Blanket</a>.</p><p>Rain: <a href="https://freesound.org/people/alex36917/sounds/524605/" target="_blank" rel="noopener">alex36917</a>, edited by Porrumentzio, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Excerpted, level matched and crossfaded.</p><p>Forest: <a href="https://freesound.org/people/kvgarlic/sounds/156826/" target="_blank" rel="noopener">kvgarlic</a> / Porrumentzio, CC0. Crickets: <a href="https://soundbible.com/2083-Crickets-Chirping-At-Night.html" target="_blank" rel="noopener">Lisa Redfern</a>. Fireplace: <a href="https://soundbible.com/1543-Fireplace.html" target="_blank" rel="noopener">ezwa</a>. Café: <a href="https://soundbible.com/1664-Restaurant-Ambiance.html" target="_blank" rel="noopener">stephan</a>. The latter three are public domain.</p><p>Noise colors and binaural tones are generated signals. Binaurals work in stereo with headphones.</p></details>`;
 const active=new Set(),playing=new Set(),errors=new Set(),loading=new Set();let saved={};try{saved=JSON.parse(localStorage.getItem('bestie-ambient-volumes')||'{}')||{}}catch{}
 const mixer=createAmbientMixer({onChange:t=>{
  const button=container.querySelector(`[data-ambient="${t.id}"]`);button.setAttribute('aria-pressed',String(t.active));button.setAttribute('aria-busy',String(t.status==='loading'));button.classList.toggle('loading',t.status==='loading');
  t.status==='loading'?loading.add(t.id):loading.delete(t.id);t.active?active.add(t.id):active.delete(t.id);t.status==='error'?errors.add(t.id):errors.delete(t.id);
  t.status==='on'&&t.volume>0?playing.add(t.id):playing.delete(t.id);
  container.querySelector('#ambient-stop').disabled=active.size===0;
  container.querySelector('#ambient-status').textContent=errors.size?'A sound couldn’t load. Tap its name to retry.':loading.size?'Loading your sound layers…':atmosphereCaption(playing);
 }});
 for(const t of AMBIENT_TRACKS){const button=container.querySelector(`[data-ambient="${t.id}"]`),slider=container.querySelector(`[data-ambient-volume="${t.id}"]`);button.onclick=()=>mixer.toggle(t.id);const volume=Number(saved[t.id]);if(Number.isFinite(volume)&&saved[t.id]!=null)slider.value=Math.round(Math.max(0,Math.min(1,volume))*100);mixer.setVolume(t.id,Number(slider.value)/100);slider.oninput=()=>{saved[t.id]=Number(slider.value)/100;mixer.setVolume(t.id,saved[t.id],{activate:true});try{localStorage.setItem('bestie-ambient-volumes',JSON.stringify(saved))}catch{}}}
 container.querySelector('#ambient-stop').onclick=()=>mixer.stopAll();return mixer;
}
