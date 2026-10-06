import './minimal-mode.css';
export function mountMinimalMode(){
 const $=id=>document.getElementById(id),body=document.body;
 const enter=document.createElement('button');enter.id='minimal-mode';enter.textContent='Minimal';enter.setAttribute('aria-label','Enter ultra minimal mode');enter.setAttribute('aria-pressed','false');document.querySelector('.header-controls').prepend(enter);
 const exit=document.createElement('button');exit.id='minimal-exit';exit.textContent='↗';exit.setAttribute('aria-label','Exit ultra minimal mode');exit.title='Show controls · Esc';exit.hidden=true;body.append(exit);
 const clock=document.createElement('time');clock.id='minimal-clock';clock.hidden=true;clock.setAttribute('aria-label','Local time');body.append(clock);
 const timer=$('time');let enabled=false;
 function tick(){clock.textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date())}
 function set(value){
  enabled=value;body.classList.toggle('ultra-minimal',enabled);exit.hidden=clock.hidden=!enabled;enter.setAttribute('aria-pressed',String(enabled));
  timer.tabIndex=enabled?0:-1;
  if(enabled){timer.setAttribute('role','button');timer.title='Start / pause · Enter or Space';timer.focus()}else{timer.removeAttribute('role');timer.removeAttribute('title');enter.focus()}
  try{localStorage.setItem('bestie-minimal',enabled?'on':'off')}catch{}
  tick();
 }
 enter.onclick=()=>set(true);exit.onclick=()=>set(false);
 timer.addEventListener('click',()=>{if(enabled)$('start').click()});
 timer.addEventListener('keydown',event=>{if(enabled&&['Enter',' '].includes(event.key)){event.preventDefault();$('start').click()}});
 document.addEventListener('keydown',event=>{if(enabled&&event.key==='Escape'){event.preventDefault();set(false)}});
 setInterval(tick,1000);document.addEventListener('visibilitychange',tick);
 try{if(localStorage.getItem('bestie-minimal')==='on')set(true)}catch{}
 return {get enabled(){return enabled}};
}
