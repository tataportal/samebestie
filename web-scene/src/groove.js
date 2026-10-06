// Quarter-note pulse in 4/4. The first beat is accented; the sway spans a bar.
// Tempo changes preserve phase; Sync beat deliberately restarts on beat one.
export function createGroove(){
 let bpm=80,beats=0,elapsed=0;
 return {
  get tempo(){return bpm},
  setTempo(value){const n=Number(value);bpm=Number.isFinite(n)&&n>0?Math.max(1,Math.round(n)):80;},
  reset(){beats=0;elapsed=0;},
  update(dt){beats+=dt*bpm/60;elapsed+=dt;const phase=beats*Math.PI*2,bar=phase/4;
   const fade=Math.min(1,elapsed/.6),w=fade*fade*(3-2*fade);
   const accent=Math.pow((1+Math.cos(bar))/2,8),nod=Math.cos(phase)*(.047+.018*accent)*w;
   return {id:'bop',w,beat:Math.floor(beats+1e-9)%4,beats,pitch:nod,roll:Math.sin(bar)*.035*w,y:-nod*.15,bodyY:-nod*.05,eye:1-.14*w};
  }
 };
}
