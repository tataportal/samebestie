import {SOUNDS,sanitizeSounds,soundEvent,playSound} from './sounds.js';
const KEY='bestie-alerts-v1';
const BASE_URL=import.meta.env?.BASE_URL||'/';
export function phaseSignature(s){return `${s.phase}:${s.round}:${s.complete}`}
export function turnNotice(s){return s.complete?{title:'we did that, bestie',body:'All rounds done. Look at us showing up. Water break?'}:s.phase==='rest'?{title:'break era, bestie',body:`We wrapped round ${s.round}. ${s.config.rest} minutes to just exist.`}:{title:'tiny comeback?',body:`We’re on round ${s.round} of ${s.config.rounds}. ${s.config.study} minutes, one thing at a time.`}}
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
  $('notifications').textContent=granted&&prefs.notifications?'Turn off notifications':'Turn on notifications';$('notifications').setAttribute('aria-pressed',String(granted&&prefs.notifications));$('notifications').disabled=!supported;
  $('notification-status').textContent=!supported?'This browser doesn’t support system notifications. Sound and in-page alerts still work.':Notification.permission==='denied'?'Notifications are blocked. Allow them in this site’s browser settings.':granted&&prefs.notifications?'Notifications are on.':'Notifications are off.';
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
  }catch{$('notification-status').textContent='The notification couldn’t pop up. Sound and in-page alerts still work.'}
 }
 function announce(notice,event){$('turn-notice-title').textContent=notice.title;$('turn-notice-body').textContent=notice.body;$('turn-notice').hidden=false;void chime(event);void showSystem(notice)}
 $('dismiss-notice').onclick=()=>{$('turn-notice').hidden=true};
 $('alarm-sound').onchange=()=>{prefs.sound=$('alarm-sound').checked;save();if(!prefs.sound){playRequest++;stopSound?.()}else unlock()};
 $('notifications').onclick=async()=>{if(prefs.notifications&&Notification.permission==='granted'){prefs.notifications=false;save();sync();return}try{const permission=await Notification.requestPermission();prefs.notifications=permission==='granted';save();sync()}catch{$('notification-status').textContent='Couldn’t request permission. Check this site’s browser settings.'}};
 $('test-alarm').onclick=async()=>{unlock();if(audio?.state==='suspended')try{await audio.resume()}catch{}announce({title:'mic check, bestie',body:'Just a test. Our pomodoro is doing its thing.'})};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});sync();
 return {unlock,onActivate(state){void chime(soundEvent(state))},onTurn(state){
  // Coalesce missed turns after sleep; do not replay a burst of obsolete alarms.
  const id=`${state.sessionId||'legacy'}:${phaseSignature(state)}`;
  try{if(localStorage.getItem('bestie-last-alert')===id)return;localStorage.setItem('bestie-last-alert',id)}catch{}
  announce(turnNotice(state),soundEvent(state));
 }};
}
