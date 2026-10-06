import {phaseSignature} from './alerts.js';
const KEY='bestie-focus-v2';
export const defaults={study:25,rest:5,rounds:4};
export function sanitizeConfig(c={}){const step=(v,base,max)=>Math.max(5,Math.min(max,Math.round((Number(v)||base)/5)*5));return {study:step(c.study,25,120),rest:step(c.rest,5,60),rounds:Math.max(1,Math.min(12,Math.round(Number(c.rounds)||4)))}}
export function newSession(config=defaults){config=sanitizeConfig(config);return {sessionId:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,config,phase:'study',round:1,remaining:config.study*60,end:null,running:false,started:false,complete:false}}
export function advance(state,now){
 if(!state.running)return state;
 while(state.running&&now>=state.end){
  if(state.phase==='study'&&state.round>=state.config.rounds){state.running=false;state.remaining=0;state.end=null;state.complete=true;break;}
  state.actionStartedAt=state.end;state.actionElapsed=0;state.activation=(state.activation||0)+1;
  if(state.phase==='study'){state.phase='rest';state.end+=state.config.rest*60000;}else{state.phase='study';state.round++;state.end+=state.config.study*60000;}
 }
 if(state.running)state.remaining=Math.max(0,Math.ceil((state.end-now)/1000));return state;
}
export function mountFocus({onTurn=()=>{},onStart=()=>{},onActivate=()=>{}}={}){
 const $=id=>document.getElementById(id);let state=newSession(),revision=0;
 try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&['study','rest'].includes(saved.phase)&&Number.isFinite(saved.remaining)&&(!saved.running||Number.isFinite(saved.end)))state={...saved,config:sanitizeConfig(saved.config)}}catch{}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
 function syncFields(){for(const id of ['study','rest','rounds'])$(id).value=state.config[id]}
 function render(notify=true){const was=phaseSignature(state);advance(state,Date.now());if(was!==phaseSignature(state)){save();if(notify)onTurn(state);}
  $('time').textContent=`${String(Math.floor(state.remaining/60)).padStart(2,'0')}:${String(state.remaining%60).padStart(2,'0')}`;
  $('phase').textContent=state.complete?'All done':`${state.phase==='study'?'Focus':'Break'} · ${state.round}/${state.config.rounds}`;
  $('start').textContent=state.running?'Pause':state.complete?'Go again':state.started?'Resume':'Start';
  $('time').ariaLabel=`${$('start').textContent} · ${$('phase').textContent} · ${$('time').textContent}`;
  $('reset').hidden=!state.started&&!state.complete;
  $('message').textContent=state.complete?'wait, we actually did that. water break?':!state.started?'hi bestie. tiny start together?':!state.running?'we can take a sec. still here.':state.phase==='rest'?'we’re on a hydration side quest.':'lowkey, we’ve got this. one thing at a time.';
  for(const id of ['study','rest','rounds'])$(id).disabled=state.started&&!state.complete;
 }
 $('start').onclick=()=>{onStart();render();if(state.running){state.actionElapsed=Number.isFinite(state.actionStartedAt)?Math.max(0,(Date.now()-state.actionStartedAt)/1000):state.config[state.phase]*60-state.remaining;state.running=false;state.end=null;}else{if(state.complete){state=newSession(state.config);revision++;}state.running=true;state.started=true;state.actionStartedAt=Date.now();state.actionElapsed=0;state.activation=(state.activation||0)+1;state.end=Date.now()+state.remaining*1000;onActivate(state);}save();render()};
 $('reset').onclick=()=>{state=newSession(state.config);revision++;save();syncFields();render()};
 for(const id of ['study','rest','rounds'])$(id).onchange=()=>{if(state.started&&!state.complete)return;state=newSession({study:$('study').value,rest:$('rest').value,rounds:$('rounds').value});save();syncFields();render()};
 syncFields();render(false);setInterval(render,250);document.addEventListener('visibilitychange',render);
 return {get revision(){return revision},get state(){return {...state,config:{...state.config}}},get focusing(){return state.started&&!state.complete&&state.phase==='study'},get reading(){return state.running&&state.phase==='study'}};
}
