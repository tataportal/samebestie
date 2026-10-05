import assert from 'node:assert/strict';
import {AMBIENT_TRACKS,createAmbientMixer} from '../src/ambient.js';
let contexts=0,sources=[],events=[],fetches=0,requests=[];
function context(){contexts++;return {currentTime:1,destination:{},resume:async()=>{},decodeAudioData:async()=>({duration:30}),createDynamicsCompressor:()=>({threshold:{},ratio:{},connect(){}}),createGain:()=>({gain:{value:0,setTargetAtTime(v){this.value=v},cancelScheduledValues(){}},connect(){},disconnect(){}}),createBufferSource:()=>{const source={connect(){},disconnect(){},start(){this.started=true},stop(){this.stopped=true}};sources.push(source);return source}}}
const mixer=createAmbientMixer({createContext:context,fetchAudio:()=>{fetches++;return new Promise(resolve=>requests.push(resolve))},onChange:e=>events.push(e)});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const response={ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};
assert.equal(contexts,0,'no AudioContext until user starts a layer');assert.equal(AMBIENT_TRACKS.length,10);
const canceled=mixer.setActive('rain',true);await flush();mixer.setActive('rain',false);requests.shift()(response);await canceled;assert.equal(sources.length,0,'late download cannot start disabled sound');
await mixer.setActive('rain',true);assert.equal(fetches,1,'decoded buffers reused');assert.equal(sources.length,1);assert.ok(sources[0].loop);assert.ok(sources[0].started);
const crickets=mixer.setActive('crickets',true);await flush();requests.shift()(response);await crickets;assert.equal(sources.length,2);assert.equal(contexts,1,'layers share one audio context');assert.ok(!sources[0].stopped,'second layer does not interrupt first');
mixer.setVolume('rain',.6);assert.equal(events.at(-1).volume,.6);mixer.setVolume('rain',10);assert.equal(events.at(-1).volume,1);mixer.setVolume('rain',NaN);assert.equal(events.at(-1).volume,1);
mixer.stopAll();assert.ok(sources.every(s=>s.stopped));assert.ok(events.slice(-10).every(e=>!e.active));
const failed=mixer.setActive('forest',true);await flush();requests.shift()({ok:false});await failed;assert.equal(events.at(-1).status,'error');assert.equal(events.at(-1).active,false);
const retry=mixer.setActive('forest',true);await flush();requests.shift()(response);await retry;assert.equal(events.at(-1).status,'on');
const one=mixer.setActive('cafe',true);await flush();mixer.setActive('cafe',false);const two=mixer.setActive('cafe',true);await flush();const before=sources.length;requests.shift()(response);await Promise.all([one,two]);assert.equal(sources.length,before+1,'rapid off/on creates one loop only');
mixer.stopAll();
console.log('PASS: ambient mixing, lazy loading, shared context, cached decode, independent volume, late-load cancellation, rapid toggles, stop all and error retry.');
