import {STATIONS,createRadioPlayer} from './radio-player.js';
import './radio.css';
import {mountAmbient} from './ambient.js';
let apiPromise;
function youtubeAPI(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';
  const timeout=setTimeout(()=>{apiPromise=null;script.remove();reject(new Error('timeout'))},15000);
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timeout);resolve(window.YT)};
  script.onerror=()=>{clearTimeout(timeout);apiPromise=null;script.remove();reject(new Error('network'))};
  document.head.append(script);
 });return apiPromise;
}
export function mountRadio(){
 const $=id=>document.getElementById(id);
 const panel=document.createElement('aside');panel.id='radio';panel.setAttribute('aria-label','Bestie radio');
 panel.innerHTML=`<div class="radio-top"><strong>bestie radio</strong><span class="radio-grille" aria-hidden="true"></span><button id="radio-close" aria-label="Close radio">×</button></div>
 <div class="radio-dial"><div class="radio-frequency"><span id="radio-frequency">101</span><span class="radio-led" aria-hidden="true"></span></div><h2 id="radio-name">boo</h2><p id="radio-status" role="status">A little soundtrack for your day.</p></div>
 <div class="radio-deck"><div id="radio-screen"><div id="radio-player-slot"><div class="radio-idle"><span>♪</span>Your little soundtrack<small>Pick a station, then Play.</small></div></div></div>
 <div class="radio-presets" role="group" aria-label="Radio stations">${STATIONS.map((s,i)=>`<button data-station="${i}" aria-label="Station ${s.number}: ${s.name}" aria-pressed="${i===0}" title="Music ${s.number}: ${s.name}"><b>${s.number}</b><span>${['boo','Meh','Hug me','Lima','Rainy days'][i]}</span></button>`).join('')}</div></div>
 <div class="radio-controls"><button id="radio-play" aria-label="Play radio">▶ <span>Play</span></button><button id="radio-next" aria-label="Next track" disabled>Next ›</button><label>Vol<input id="radio-volume" aria-label="Radio volume" type="range" min="0" max="100" value="45"></label></div>
 <a id="radio-link" href="https://music.youtube.com/playlist?list=${STATIONS[0].id}" target="_blank" rel="noopener noreferrer">Open in YouTube Music ↗</a><section id="ambient-mixer" aria-label="Ambient sound mixer"></section>`;
 document.body.append(panel);
 mountAmbient($('ambient-mixer'));
 let selected=0,request=0;
 try{const saved=Number(localStorage.getItem('bestie-radio-station'));if(STATIONS[saved])selected=saved;$('radio-volume').value=localStorage.getItem('bestie-radio-volume')??45}catch{}
 const controller=createRadioPlayer({
  onStatus:text=>{$('radio-status').textContent=text;syncPlayControl()},
  onPlaying:playing=>{panel.classList.toggle('on-air',playing);syncPlayControl()},
  createPlayer:events=>{
   $('radio-player-slot').replaceChildren();const slot=document.createElement('div');$('radio-player-slot').append(slot);
   return new window.YT.Player(slot,{width:'200',height:'200',playerVars:{listType:'playlist',list:STATIONS[selected].id,origin:location.origin,playsinline:1,controls:1},events:{...events,onReady:event=>{events.onReady(event);$('radio-next').disabled=false}}});
  },
 });
 function syncPlayControl(){
  const playing=controller.playing,pending=controller.pending;
  $('radio-play').innerHTML=playing?'Ⅱ <span>Pause</span>':pending?'■ <span>Stop</span>':'▶ <span>Play</span>';
  $('radio-play').setAttribute('aria-label',playing?'Pause radio':pending?'Stop tuning':'Play radio');
 }
 controller.volume($('radio-volume').value);
 function select(i){selected=i;controller.select(i);const s=STATIONS[i];$('radio-name').textContent=s.name;$('radio-frequency').textContent=s.number;$('radio-link').href=`https://music.youtube.com/playlist?list=${s.id}`;panel.querySelectorAll('[data-station]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.station)===i)));try{localStorage.setItem('bestie-radio-station',i)}catch{}}
 select(selected);
 panel.querySelectorAll('[data-station]').forEach(b=>b.onclick=()=>select(Number(b.dataset.station)));
 $('radio-play').onclick=async()=>{
  if(controller.playing||controller.pending){controller.pause();return}
  const token=++request;$('radio-play').disabled=true;$('radio-status').textContent='Tuning in…';
  try{await youtubeAPI();if(token!==request)return;$('radio-screen').hidden=false;panel.classList.add('expanded');controller.play()}
  catch{if(token===request)$('radio-status').textContent='YouTube couldn’t connect. Try again or open the playlist.'}
  finally{$('radio-play').disabled=false}
 };
 $('radio-next').onclick=()=>controller.next();
 $('radio-volume').oninput=()=>{controller.volume($('radio-volume').value);try{localStorage.setItem('bestie-radio-volume',$('radio-volume').value)}catch{}};
 // Closing controls is presentation only: keep the iframe, queue, and sound
 // layers alive. Playback stops only through their explicit audio controls.
 function close(){panel.hidden=true;$('radio-button').setAttribute('aria-expanded','false')}
 $('radio-close').onclick=()=>{close();$('radio-button').focus()};
 $('radio-button').onclick=()=>{if(!panel.hidden){close();return}$('settings').hidden=true;$('settings-button').setAttribute('aria-expanded','false');panel.hidden=false;$('radio-button').setAttribute('aria-expanded','true')};
 return {close};
}
