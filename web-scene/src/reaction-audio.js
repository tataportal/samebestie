// Tiny, soft UI gestures. Pitch contours match the reaction; no looping audio.
export const REACTION_CUES={
 question:[[0,470,650,.16]],questions:[[0,470,620,.12],[.14,560,730,.15]],
 idea:[[0,660,790,.10],[.10,990,1120,.20]],dots:[[0,330,350,.09],[.16,330,350,.09]],
 scribble:[[0,220,170,.13],[.13,185,145,.15]],sweat:[[0,730,400,.22]],
 sparkles:[[0,660,660,.14],[.10,830,830,.15],[.20,990,1100,.24]],
 inhale:[[0,310,420,.35]],exhale:[[0,420,310,.4]],
};
export function createReactionGate(play){
 let kind='',age=-1;
 return {update(b,enabled=true){
  if(!b){kind='';age=-1;return}
  const onset=b.kind!==kind||b.age<age-.001;
  kind=b.kind;age=b.age;
  // Never replay an old bubble when resuming motion or returning to this tab.
  if(onset&&enabled&&b.age<=.3)play(b.kind);
 }};
}
export function playReactionCue(context,kind){
 const cue=REACTION_CUES[kind];if(!cue)return ()=>{};
 const nodes=[];
 for(const [delay,from,to,length] of cue){
  const start=context.currentTime+delay,osc=context.createOscillator(),gain=context.createGain();
  osc.type='sine';osc.frequency.setValueAtTime(from,start);osc.frequency.exponentialRampToValueAtTime(to,start+length);
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(kind==='inhale'||kind==='exhale'?.028:.055,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+length);
  osc.connect(gain);gain.connect(context.destination);osc.onended=()=>{osc.disconnect();gain.disconnect()};osc.start(start);osc.stop(start+length+.02);nodes.push(osc);
 }
 return ()=>nodes.forEach(osc=>{try{osc.stop()}catch{}});
}
export function mountReactionAudio(input){
 let context,stop,enabled=true;
 try{enabled=localStorage.getItem('bestie-reaction-sounds')!=='off'}catch{}
 input.checked=enabled;
 function unlock(){if(!enabled)return;try{context??=new (window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume().catch(()=>{})}catch{}}
 document.addEventListener('pointerdown',unlock);document.addEventListener('keydown',unlock);
 input.onchange=()=>{enabled=input.checked;try{localStorage.setItem('bestie-reaction-sounds',enabled?'on':'off')}catch{}if(!enabled)stop?.();else unlock()};
 return kind=>{if(!enabled||document.hidden||context?.state!=='running')return;stop?.();stop=playReactionCue(context,kind)};
}
