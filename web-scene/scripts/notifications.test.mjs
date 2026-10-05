import assert from 'node:assert/strict';
import {SOUNDS,DEFAULT_SOUNDS,sanitizeSounds,soundEvent,playSound} from '../src/sounds.js';
import {mountAlerts} from '../src/alerts.js';
const ids=['alarm-sound','notifications','notification-status','turn-notice','turn-notice-title','turn-notice-body','dismiss-notice','test-alarm',...['start','rest','end'].flatMap(e=>[`sound-${e}`,`preview-${e}`])];
const elements=new Map(ids.map(id=>[id,{checked:false,hidden:true,textContent:'',setAttribute(){}}]));
const storage=new Map();let prompts=0,delivered=[],played=[],stopped=0;
class FakeAudio {
 state='running';currentTime=10;destination={};
 createOscillator(){return {frequency:{setValueAtTime:v=>played.push(v),exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(){},stop(){stopped++}}}
 createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){}},connect(){},disconnect(){}}}
}
assert.equal(SOUNDS.length,7);assert.equal(new Set(SOUNDS.map(s=>s.id)).size,7);
assert.deepEqual(SOUNDS[1].notes,[...SOUNDS[0].notes].reverse());
assert.deepEqual(sanitizeSounds({start:'broken',rest:'stars'}),{...DEFAULT_SOUNDS,rest:'stars'});
assert.equal(soundEvent({complete:true,phase:'study'}),'end');
assert.equal(soundEvent({phase:'rest'}),'rest');assert.equal(soundEvent({phase:'study'}),'start');
for(const s of SOUNDS){played=[];const stop=playSound(new FakeAudio(),s.id);assert.ok(played.length>=3);assert.ok(played.every(f=>f>0&&Number.isFinite(f)));const before=stopped;stop();assert.ok(stopped>before)}
played=[];
class FakeNotification {static permission='default';static async requestPermission(){prompts++;return this.permission='granted'}constructor(title,options){delivered.push({title,...options})}}
globalThis.window={Notification:FakeNotification,AudioContext:FakeAudio};globalThis.Notification=FakeNotification;globalThis.isSecureContext=true;globalThis.location={href:'https://example.org/samebestie/'};
globalThis.document={getElementById:id=>elements.get(id),addEventListener(){}};globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
const originalNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
try{
 let alerts=mountAlerts();assert.equal(prompts,0);assert.equal(delivered.length,0);
 assert.deepEqual(['start','rest','end'].map(e=>elements.get(`sound-${e}`).value),Object.values(DEFAULT_SOUNDS));
 for(const s of SOUNDS){const select=elements.get('sound-start');select.value=s.id;select.onchange();played=[];await elements.get('preview-start').onclick();assert.equal(played[0],s.notes[0]*(s.slide||1));assert.equal(delivered.length,0);assert.equal(prompts,0)}
 assert.equal(JSON.parse(storage.get('bestie-alerts-v1')).sounds.start,'stars');
 const reloaded=alerts=mountAlerts();assert.equal(elements.get('sound-start').value,'stars');
 played=[];reloaded.onActivate({phase:'study'});assert.equal(played[0],659.25);
 played=[];reloaded.onTurn({sessionId:'route',phase:'rest',round:1,config:{rest:5}});assert.deepEqual(played,[783.99,659.25,523.25]);
 played=[];reloaded.onTurn({sessionId:'route',complete:true,round:1});assert.equal(played[0],783.99);assert.equal(played.length,8);
 elements.get('alarm-sound').checked=false;elements.get('alarm-sound').onchange();played=[];reloaded.onActivate({phase:'study'});assert.equal(played.length,0);
 await elements.get('preview-rest').onclick();assert.equal(played.length,3,'explicit preview works when automatic sound is muted');
 elements.get('alarm-sound').checked=true;elements.get('alarm-sound').onchange();
 await elements.get('test-alarm').onclick();assert.equal(elements.get('turn-notice').hidden,false);assert.equal(delivered.length,0);assert.equal(prompts,0);
 await elements.get('notifications').onclick();assert.equal(prompts,1);assert.equal(elements.get('notifications').textContent,'Desactivar avisos del sistema');
 await elements.get('test-alarm').onclick();assert.equal(delivered.length,1);assert.match(delivered[0].body,/prueba/);
 const s={sessionId:'test',phase:'rest',round:1,complete:false,config:{rest:5,study:25,rounds:4}};
 alerts.onTurn(s);alerts.onTurn(s);assert.equal(delivered.length,2);assert.match(delivered[1].title,/pausa/);
 await elements.get('notifications').onclick();alerts.onTurn({...s,round:2});assert.equal(delivered.length,2);
 FakeNotification.permission='denied';mountAlerts();assert.match(elements.get('notification-status').textContent,/bloqueados/);
 delete window.Notification;mountAlerts();assert.equal(elements.get('notifications').disabled,true);assert.match(elements.get('notification-status').textContent,/no ofrece/);
}finally{for(const key of ['window','Notification','isSecureContext','location','document','localStorage'])delete globalThis[key];if(originalNavigator)Object.defineProperty(globalThis,'navigator',originalNavigator);else delete globalThis.navigator;}
console.log('PASS: notification opt-in, test alarm, denied/unsupported browsers, disable, duplicate suppression. OS delivery still requires browser permission.');
