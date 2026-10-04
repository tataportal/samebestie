import assert from 'node:assert/strict';import {newSession,advance,sanitizeConfig} from '../src/focus.js';
assert.deepEqual(sanitizeConfig({study:17,rest:9,rounds:3}),{study:15,rest:10,rounds:3});
let s=newSession({study:5,rest:5,rounds:2});s.running=true;s.started=true;s.end=300000;
advance(s,300000);assert.equal(s.phase,'rest');assert.equal(s.round,1);assert.equal(s.remaining,300);
advance(s,600000);assert.equal(s.phase,'study');assert.equal(s.round,2);assert.equal(s.remaining,300);
advance(s,900000);assert.equal(s.complete,true);assert.equal(s.running,false);assert.equal(s.remaining,0);
s=newSession({study:5,rest:5,rounds:4});s.running=true;s.started=true;s.end=300000;advance(s,1500000);assert.equal(s.phase,'rest');assert.equal(s.round,3);assert.equal(s.remaining,300);advance(s,2100000);assert.equal(s.complete,true);
s=newSession({study:5,rest:5,rounds:1});s.running=true;s.started=true;s.end=300000;advance(s,300000);assert.equal(s.complete,true);assert.equal(s.phase,'study');
console.log('PASS: 5-minute steps, study/break boundaries, round count, final completion, suspended-tab catch-up.');
