import {Vector3} from 'three';
const labels={question:'Huh?',questions:'Still confused',idea:'Oh, got it!',dots:'Thinking…',scribble:'A little frustrated with the book',sweat:'A little nervous',sparkles:'We did that!',inhale:'Breathe in · 4 seconds',exhale:'Breathe out · 6 seconds'};
const art={
 question:'?',questions:'???',idea:'! ✦',dots:'…',sparkles:'✦ ✧',
 scribble:'<svg viewBox="0 0 90 48" aria-hidden="true"><path d="M9 27 62 9 25 40 75 16 13 12 65 40 34 5 48 43 80 30 16 35 60 21" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="square" stroke-linejoin="bevel"/></svg>',
 sweat:'<svg viewBox="0 0 50 55" aria-hidden="true"><path d="M27 3 11 26 8 37 13 48 24 52 36 47 41 37 38 26Z" fill="#9dc6cc" stroke="currentColor" stroke-width="3"/><path d="M17 30 15 39 20 43" fill="none" stroke="#fff5dd" stroke-width="4"/></svg>',
};
export function mountReactions(){
 const el=document.createElement('div');el.className='reaction';el.hidden=true;el.setAttribute('role','img');el.innerHTML='<div class="reaction-paper"><span class="reaction-symbol"></span><span class="reaction-caption"></span></div>';document.body.append(el);
 const symbol=el.querySelector('.reaction-symbol'),caption=el.querySelector('.reaction-caption');let last='';const anchor=new Vector3();
 return {update(p,headPivot,camera,motion){
  const b=p?.bubble;if(!b||!motion||!headPivot){el.hidden=true;last='';return}el.hidden=false;
  if(last!==b.kind){symbol.innerHTML=art[b.kind]||'◯';caption.textContent=b.kind==='inhale'?'breathe in · 4s':b.kind==='exhale'?'breathe out · 6s':'';el.setAttribute('aria-label',labels[b.kind]);last=b.kind;}
  if(b.kind==='questions')symbol.textContent='?'.repeat(Math.min(3,1+Math.floor(b.age/.38)));
  const breath=b.kind==='inhale'||b.kind==='exhale';el.classList.toggle('breathing',breath);
  headPivot.updateWorldMatrix(true,false);anchor.set(.57,1.0,.6);headPivot.localToWorld(anchor);anchor.project(camera);
  let x=(anchor.x*.5+.5)*innerWidth,y=(-anchor.y*.5+.5)*innerHeight;
  const settings=document.getElementById('settings');if(settings&&!settings.hidden){const r=settings.getBoundingClientRect();if(x+60>r.left&&y+80>r.top)x=r.left-68;}
  x=Math.max(70,Math.min(innerWidth-70,x));y=Math.max(85,Math.min(innerHeight-180,y));
  const enter=Math.min(1,b.age/.2),leave=Math.min(1,(b.duration-b.age)/.25),pop=enter<1?.6+.4*Math.sin(enter*Math.PI/2):1+.06*Math.sin((b.age-.2)*14)*Math.exp(-(b.age-.2)*9);
  el.style.left=`${x}px`;el.style.top=`${y}px`;el.style.opacity=String(Math.min(enter,leave));el.style.transform=`translate(-50%,-100%) scale(${pop})`;
  symbol.style.transform=breath?`scale(${.72+.28*b.breath})`:b.kind==='scribble'?`rotate(${Math.sin(b.age*18)*5}deg) scale(${.8+.2*Math.min(1,b.age)})`:'none';
 }};
}
