import assert from 'node:assert/strict';
import {clockValue,sanitizeZones,validZone,zoneLabel} from '../src/world-clocks.js';
import {turnNotice,phaseSignature} from '../src/alerts.js';
import {mountFocus,newSession} from '../src/focus.js';
assert.equal(validZone('made/up'),false);
assert.deepEqual(sanitizeZones(['America/Lima','made/up','America/Lima','America/Los_Angeles','Asia/Tokyo','Europe/Madrid']),['America/Lima','America/Los_Angeles','Asia/Tokyo']);
assert.deepEqual(sanitizeZones([], 'invalid'),['America/Lima']);
assert.match(zoneLabel('America/Los_Angeles'),/Berkeley/);
const before=new Date('2026-03-08T09:59:00Z'),after=new Date('2026-03-08T10:00:00Z');
assert.equal(clockValue('America/Los_Angeles',before).time,'01:59');
assert.equal(clockValue('America/Los_Angeles',after).time,'03:00');
assert.equal(clockValue('America/Lima',after).time,'05:00');
assert.equal(clockValue('America/Los_Angeles',new Date('2026-11-01T09:00:00Z')).time,'01:00');
assert.notEqual(clockValue('Asia/Tokyo',new Date('2026-10-04T23:00Z')).date,clockValue('America/Lima',new Date('2026-10-04T23:00Z')).date);
// Mount the real timer with a controlled wall clock: catch missed rounds even
// when the tab wakes in the same phase, exactly one current alarm, none on load/reset.
const originalNow=Date.now,originalInterval=globalThis.setInterval;let now=0,tick,saved=null,alerts=[],starts=0,activations=[];
const elements=new Map(['study','rest','rounds','time','phase','start','reset','message'].map(id=>[id,{value:'',disabled:false,hidden:false,textContent:''}]));
globalThis.document={getElementById:id=>elements.get(id),addEventListener(){}};
globalThis.localStorage={getItem:()=>saved,setItem:(key,value)=>{saved=value}};
globalThis.setInterval=callback=>{tick=callback};Date.now=()=>now;
try{
 const focus=mountFocus({onTurn:s=>alerts.push(structuredClone(s)),onStart:()=>starts++,onActivate:s=>activations.push(structuredClone(s))});
 elements.get('study').value=5;elements.get('rest').value=5;elements.get('rounds').value=3;elements.get('study').onchange();elements.get('start').onclick();assert.equal(starts,1);assert.equal(activations.length,1);assert.equal(activations[0].phase,'study');
 now=300000;tick();assert.equal(alerts.length,1);assert.equal(alerts[0].phase,'rest');assert.match(turnNotice(alerts[0]).title,/pausa/);
 tick();assert.equal(alerts.length,1);
 now=600000;tick();assert.equal(alerts.length,2);assert.equal(alerts[1].round,2);
 now=1200000;tick();assert.equal(alerts.length,3);assert.equal(alerts[2].round,3);assert.equal(alerts[2].phase,'study');
 now=1500000;tick();assert.equal(alerts.length,4);assert.equal(alerts[3].complete,true);assert.match(turnNotice(alerts[3]).title,/lograste/);
 elements.get('reset').onclick();tick();assert.equal(alerts.length,4);
 elements.get('start').onclick();now+=10000;elements.get('start').onclick();assert.equal(activations.length,2,'manual pause is silent');const remaining=focus.state.remaining;now+=500000;tick();assert.equal(focus.state.remaining,remaining);assert.equal(alerts.length,4);
 const activation=focus.state.activation;elements.get('start').onclick();assert.equal(focus.state.activation,activation+1);assert.equal(focus.state.actionStartedAt,now);assert.equal(focus.state.remaining,remaining,'Continuar does not reset minutes');assert.equal(activations.length,3,'resume sounds again');
 const old=newSession({study:5,rest:5,rounds:1});Object.assign(old,{started:true,running:true,end:300000});saved=JSON.stringify(old);mountFocus({onTurn:()=>assert.fail('stale alarm on reload')});tick();
 assert.notEqual(phaseSignature({phase:'study',round:1,complete:false}),phaseSignature({phase:'study',round:2,complete:false}));
}finally{Date.now=originalNow;globalThis.setInterval=originalInterval;delete globalThis.document;delete globalThis.localStorage;}
console.log('PASS: city validation, three-clock limit, Berkeley DST, date crossings, turn alarms, catch-up, pause, reset and silent reload.');
