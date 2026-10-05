// Frequencies in Hz. Keep the original C5/E5/G5 chime and its exact reversal.
const C=523.25,E=659.25,G=783.99;
export const SOUNDS=[
 {id:'ascending',name:'Upward · original',notes:[C,E,G],step:.22,tail:.7,type:'sine'},
 {id:'descending',name:'Downward',notes:[G,E,C],step:.22,tail:.7,type:'sine'},
 {id:'bells',name:'Tiny bells',notes:[G,1046.5,E,1046.5],step:.28,tail:.85,type:'sine',overtone:2},
 {id:'drops',name:'Raindrops',notes:[880,E,587.33],step:.32,tail:.22,type:'sine',slide:1.12},
 {id:'keys',name:'Soft keys',notes:[C,E,G,E],step:.3,tail:.5,type:'triangle'},
 {id:'embrace',name:'Warm hug',notes:[261.63,329.63,392],step:.08,tail:1.25,type:'sine',attack:.18},
 {id:'stars',name:'Stardust',notes:[E,G,1046.5,1318.51,1046.5],step:.17,tail:.5,type:'sine'},
];
export const DEFAULT_SOUNDS={start:'ascending',rest:'descending',end:'bells'};
export function sanitizeSounds(value){return Object.fromEntries(Object.entries(DEFAULT_SOUNDS).map(([event,fallback])=>[event,SOUNDS.some(s=>s.id===value?.[event])?value[event]:fallback]))}
export function soundEvent(state){return state.complete?'end':state.phase==='rest'?'rest':'start'}
export function playSound(audio,id){
 const sound=SOUNDS.find(s=>s.id===id)||SOUNDS[0],nodes=[],at=audio.currentTime+.015;
 sound.notes.forEach((frequency,i)=>{
  const voices=sound.overtone?[[1,1],[sound.overtone,.16]]:[[1,1]];
  for(const [ratio,level] of voices){
   const osc=audio.createOscillator(),gain=audio.createGain(),start=at+i*sound.step,end=start+sound.tail+.05;
   osc.type=sound.type;osc.frequency.setValueAtTime(frequency*ratio*(sound.slide||1),start);
   if(sound.slide)osc.frequency.exponentialRampToValueAtTime(frequency*ratio,start+.1);
   gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.12*level,start+(sound.attack||.025));gain.gain.exponentialRampToValueAtTime(.001,start+sound.tail);
   osc.connect(gain);gain.connect(audio.destination);osc.start(start);osc.stop(end);
   osc.onended=()=>{osc.disconnect();gain.disconnect()};nodes.push({osc,gain});
  }
 });
 // Selecting another preview replaces the previous one; muting also stops it.
 return ()=>{for(const {osc,gain} of nodes){try{gain.gain.cancelScheduledValues(audio.currentTime);gain.gain.setTargetAtTime(0,audio.currentTime,.01);osc.stop(audio.currentTime+.04)}catch{}}};
}
