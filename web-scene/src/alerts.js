import {SOUNDS,sanitizeSounds,soundEvent,playSound} from './sounds.js';
const KEY='bestie-alerts-v1';
const BASE_URL=import.meta.env?.BASE_URL||'/';
export function phaseSignature(s){return `${s.phase}:${s.round}:${s.complete}`}
export function turnNotice(s){return s.complete?{title:'Lo lograste, bestie',body:'Terminaste tus rondas. Una pausita para tomar awita.'}:s.phase==='rest'?{title:'Hora de una pausa',body:`Ronda ${s.round} lista. Tienes ${s.config.rest} minutos para descansar.`}:{title:'Volvemos con calma',body:`Empieza la ronda ${s.round} de ${s.config.rounds}. ${s.config.study} minutos para ti.`}}
export function mountAlerts(){
 const $=id=>document.getElementById(id);let prefs={sound:true,notifications:false},audio,registration,stopSound,playRequest=0;
 try{prefs={...prefs,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{}
 prefs.sounds=sanitizeSounds(prefs.sounds);
 const supported='Notification' in window&&isSecureContext;
 if('serviceWorker' in navigator&&isSecureContext)navigator.serviceWorker.register(`${BASE_URL}notifications-sw.js`).then(r=>{registration=r}).catch(()=>{});
 function save(){try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch{}}
 function sync(){
  $('alarm-sound').checked=prefs.sound;
  const granted=supported&&Notification.permission==='granted';
  $('notifications').textContent=granted&&prefs.notifications?'Desactivar avisos del sistema':'Activar avisos del sistema';$('notifications').setAttribute('aria-pressed',String(granted&&prefs.notifications));$('notifications').disabled=!supported;
  $('notification-status').textContent=!supported?'Este navegador no ofrece avisos del sistema. Puedes usar el sonido y el aviso en pantalla.':Notification.permission==='denied'?'Avisos bloqueados. Puedes permitirlos en los ajustes de este sitio en tu navegador.':granted&&prefs.notifications?'Avisos del sistema activados.':'Los avisos del sistema están desactivados.';
 }
 function ensureAudio(){try{audio??=new (window.AudioContext||window.webkitAudioContext)();return audio}catch{return null}}
 function unlock(){$('turn-notice').hidden=true;if(prefs.sound){const context=ensureAudio();if(context?.state==='suspended')context.resume().catch(()=>{})}}
 async function chime(event='start',preview=false){
  if(!preview&&!prefs.sound)return;
  const request=++playRequest;stopSound?.();const context=ensureAudio();if(!context)return;
  if(context.state==='suspended')try{await context.resume()}catch{return}
  if(request!==playRequest||context.state!=='running')return;
  stopSound=playSound(context,prefs.sounds[event]);
 }
 for(const event of ['start','rest','end']){
  const select=$(`sound-${event}`);
  select.innerHTML=SOUNDS.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');select.value=prefs.sounds[event];
  select.onchange=()=>{prefs.sounds=sanitizeSounds({...prefs.sounds,[event]:select.value});save()};
  $(`preview-${event}`).onclick=()=>chime(event,true);
 }
 async function showSystem(notice){
  if(!prefs.notifications||!supported||Notification.permission!=='granted')return;
  try{const options={body:notice.body,tag:'bestie-turn',data:{url:new URL(BASE_URL,location.href).href}};
   if(registration?.active)await registration.showNotification(notice.title,options);else{const n=new Notification(notice.title,options);n.onclick=()=>{window.focus();n.close()};}
  }catch{$('notification-status').textContent='El sistema no pudo mostrar el aviso. El sonido y el aviso en pantalla siguen disponibles.'}
 }
 function announce(notice,event){$('turn-notice-title').textContent=notice.title;$('turn-notice-body').textContent=notice.body;$('turn-notice').hidden=false;void chime(event);void showSystem(notice)}
 $('dismiss-notice').onclick=()=>{$('turn-notice').hidden=true};
 $('alarm-sound').onchange=()=>{prefs.sound=$('alarm-sound').checked;save();if(!prefs.sound){playRequest++;stopSound?.()}else unlock()};
 $('notifications').onclick=async()=>{if(prefs.notifications&&Notification.permission==='granted'){prefs.notifications=false;save();sync();return}try{const permission=await Notification.requestPermission();prefs.notifications=permission==='granted';save();sync()}catch{$('notification-status').textContent='No se pudo pedir permiso. Revisa los permisos de este sitio.'}};
 $('test-alarm').onclick=async()=>{unlock();if(audio?.state==='suspended')try{await audio.resume()}catch{}announce({title:'Así suena tu cambio de turno',body:'Este es un aviso de prueba. Tu pomodoro sigue igual.'})};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});sync();
 return {unlock,onActivate(state){void chime(soundEvent(state))},onTurn(state){
  // Coalesce missed turns after sleep; do not replay a burst of obsolete alarms.
  const id=`${state.sessionId||'legacy'}:${phaseSignature(state)}`;
  try{if(localStorage.getItem('bestie-last-alert')===id)return;localStorage.setItem('bestie-last-alert',id)}catch{}
  announce(turnNotice(state),soundEvent(state));
 }};
}
