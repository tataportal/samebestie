import assert from 'node:assert/strict';
import {createReactionGate,playReactionCue,REACTION_CUES} from '../src/reaction-audio.js';
import {smooth,poseTrack} from '../src/motion-curves.js';
import {gesturePose,GESTURES} from '../src/personality.js';
const played=[],gate=createReactionGate(kind=>played.push(kind));
for(let i=0;i<60;i++)gate.update({kind:'question',age:i/30});
assert.deepEqual(played,['question'],'one cue per bubble, not per frame');
gate.update({kind:'question',age:0});assert.equal(played.length,2,'replaying a preview produces one fresh cue');
gate.update(null);gate.update({kind:'idea',age:0},false);gate.update({kind:'idea',age:.1},true);assert.equal(played.length,2,'unpausing an existing bubble does not replay it');
gate.update(null);gate.update({kind:'sparkles',age:1.2});assert.equal(played.length,2,'late tab return does not play old cues');
gate.update({kind:'inhale',age:0});gate.update({kind:'exhale',age:0});assert.deepEqual(played.slice(-2),['inhale','exhale']);
for(const kind of Object.keys(REACTION_CUES)){
 const oscillators=[],gains=[];
 const param=()=>({values:[],setValueAtTime(v,t){this.values.push([v,t])},linearRampToValueAtTime(v,t){this.values.push([v,t])},exponentialRampToValueAtTime(v,t){this.values.push([v,t])}});
 const context={currentTime:12,destination:{},createOscillator(){const o={frequency:param(),connect(){},disconnect(){this.disconnected=true},start(t){this.startAt=t},stop(t){this.stopAt=t}};oscillators.push(o);return o},createGain(){const g={gain:param(),connect(){},disconnect(){this.disconnected=true}};gains.push(g);return g}};
 const stop=playReactionCue(context,kind);assert.equal(oscillators.length,REACTION_CUES[kind].length);
 for(const [i,o] of oscillators.entries()){assert.ok(o.stopAt>o.startAt&&o.stopAt<=12.6,'short bounded sound');assert.equal(gains[i].gain.values[0][0],0,'no click at onset');assert.ok(Math.max(...gains[i].gain.values.map(v=>v[0]))<=.055,'soft gain');o.onended();assert.ok(o.disconnected&&gains[i].disconnected,'finished voices release nodes')}
 stop();assert.ok(oscillators.every(o=>o.stopAt===undefined),'mute stops every scheduled voice');
}
assert.equal(smooth(0),0);assert.equal(smooth(1),1);assert.ok(smooth(.05)<.002&&smooth(.5)===.5,'slow ends and faster mid movement');
assert.equal(poseTrack(.7,[[0,0],[.5,1],[1,1],[2,0]]),1,'hold is still, not a constant-speed drift');
assert.ok(gesturePose('aha',.16).y<0&&gesturePose('aha',.4).y>0,'anticipation precedes the upward pop');
for(const id of Object.keys(GESTURES))for(let t=0;t<=GESTURES[id];t+=1/60){const p=gesturePose(id,t);for(const key of ['w','pitch','yaw','roll','x','y','z','bodyY','bodyRoll','eye'])assert.ok(Number.isFinite(p[key]),`${id} ${key} is finite`)}
console.log('PASS: one-shot reaction cues, replay/mute/late-event behavior, quiet bounded voices, node cleanup, anticipation and eased holds.');
