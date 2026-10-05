import assert from 'node:assert/strict';
import {STATIONS,createRadioPlayer} from '../src/radio-player.js';
let events,player,visible=true,status,playing,timer,loads=[],destroyed=0;
const players=[];
const radio=createRadioPlayer({
 createPlayer:e=>{events=e;player={loadPlaylist:args=>loads.push(['load',args]),cuePlaylist:args=>loads.push(['cue',args]),setVolume:v=>player.volume=v,playVideo:()=>loads.push(['play']),pauseVideo:()=>loads.push(['pause']),destroy:()=>destroyed++,getPlaylistIndex:()=>-1,getPlaylist:()=>undefined};players.push({player,events});return player},
 onStatus:t=>status=t,onPlaying:v=>playing=v,canPlay:()=>visible,schedule:fn=>{timer=fn;return 1},cancel:()=>{timer=null},
});
assert.equal(STATIONS.length,5);assert.equal(new Set(STATIONS.map(s=>s.id)).size,5);
assert.equal(players.length,0,'no player or autoplay until user asks');
radio.volume(32);radio.play();events.onReady({target:player});assert.equal(player.volume,32);assert.equal(loads.at(-1)[1].list,STATIONS[0].id);
events.onError({data:150});assert.match(status,/next one/);timer();assert.equal(loads.at(-1)[1].index,1,'restricted first track skips even without a queue');
events.onError({data:150});radio.pause();assert.equal(timer,null,'pause cancels retry');assert.equal(radio.pending,false);
radio.play();events.onStateChange({data:1});assert.equal(playing,true);
const old=events;radio.select(4);old.onStateChange({data:1});assert.equal(playing,false,'stale station events ignored');
events.onReady({target:player});assert.equal(loads.at(-1)[1].list,STATIONS[4].id);assert.equal(loads.at(-1)[0],'load');
radio.close();old.onReady({target:players[0].player});assert.equal(playing,false);assert.ok(destroyed>=2);
radio.play();events.onReady({target:player});
for(let i=0;i<12;i++){events.onError({data:150});if(timer){const fn=timer;timer=null;fn()}}
assert.equal(radio.pending,false);assert.match(status,/Open the playlist/,'all unavailable stops after bounded retries');
radio.close();radio.play();events.onReady({target:player});events.onAutoplayBlocked();assert.equal(radio.pending,false);assert.match(status,/Tap Play/);
visible=false;events.onStateChange({data:1});assert.equal(playing,false,'background tab cannot start playing');
visible=true;radio.close();radio.play();events.onReady({target:player});events.onError({data:153});assert.equal(radio.pending,false);assert.match(status,/couldn’t load/);
radio.close();radio.play();events.onReady({target:player});radio.pause();radio.select(2);events.onReady({target:player});assert.equal(loads.at(-1)[0],'cue','paused station changes do not autoplay');
console.log('PASS: radio lazy start, station switching, restricted-track skips, retry bounds, pause/close cancellation, stale events, autoplay and background guards.');
// Some YouTube queues emit one error for several consecutive unavailable songs.
const scheduled=new Map();let task=0,recoveryEvents,recoveryIndex=-1;
const recoveryPlayer={loadPlaylist:a=>recoveryIndex=a.index,cuePlaylist(){},setVolume(){},pauseVideo(){},destroy(){},getPlaylistIndex:()=>-1,getPlaylist:()=>undefined};
const recovery=createRadioPlayer({createPlayer:e=>{recoveryEvents=e;return recoveryPlayer},onStatus(){},schedule:fn=>{scheduled.set(++task,fn);return task},cancel:id=>scheduled.delete(id)});
function tick(){const [id,fn]=scheduled.entries().next().value;scheduled.delete(id);fn()}
recovery.play();recoveryEvents.onReady({target:recoveryPlayer});recoveryEvents.onError({data:150});tick();assert.equal(recoveryIndex,1);
tick();tick();assert.equal(recoveryIndex,2,'silent second restriction recovers without an endless stall');
recoveryEvents.onStateChange({data:3});assert.equal(scheduled.size,1,'buffering alone can accompany an unavailable overlay');
recoveryEvents.onStateChange({data:1});recovery.close();assert.equal(scheduled.size,0);
console.log('PASS: consecutive silent YouTube restrictions recover; playback cancels recovery.');

// Pasted links use the same queue lifecycle, with single videos kept out of
// playlist skipping/retries. Invalid links never replace the current source.
const {parseYouTubeLink}=await import('../src/radio-player.js');
for(const url of ['https://www.youtube.com/watch?v=1m0fmAJEGCE','https://music.youtube.com/watch?v=1m0fmAJEGCE&si=share','https://youtu.be/1m0fmAJEGCE?si=share','youtube.com/shorts/1m0fmAJEGCE','https://www.youtube.com/live/1m0fmAJEGCE'])assert.equal(parseYouTubeLink(url)?.id,'1m0fmAJEGCE');
for(const host of ['www.youtube.com','music.youtube.com'])assert.deepEqual(parseYouTubeLink(`https://${host}/playlist?list=${STATIONS[0].id}`),{type:'playlist',id:STATIONS[0].id,url:`https://music.youtube.com/playlist?list=${STATIONS[0].id}`});
assert.equal(parseYouTubeLink(`https://music.youtube.com/watch?v=1m0fmAJEGCE&list=${STATIONS[0].id}`).type,'playlist');
for(const url of ['', 'hello','https://youtube.com.evil.test/watch?v=1m0fmAJEGCE','https://evil.test/?v=1m0fmAJEGCE','javascript:alert(1)','https://youtube.com/@channel','https://youtube.com/watch?v=bad','https://evil@youtube.com/watch?v=1m0fmAJEGCE'])assert.equal(parseYouTubeLink(url),null,url);
let customEvents,customStatus,customLoads=[],customRetries=0;
const customPlayer={loadVideoById:a=>customLoads.push(['video',a]),cueVideoById:a=>customLoads.push(['cueVideo',a]),loadPlaylist:a=>customLoads.push(['playlist',a]),cuePlaylist:a=>customLoads.push(['cuePlaylist',a]),setVolume(){},pauseVideo(){},playVideo(){},destroy(){},getPlaylistIndex:()=>-1,getPlaylist:()=>undefined};
const custom=createRadioPlayer({createPlayer:e=>{customEvents=e;return customPlayer},onStatus:s=>customStatus=s,schedule:()=>customRetries++});
assert.ok(custom.useLink('https://youtu.be/1m0fmAJEGCE'));assert.equal(custom.hasNext,false);assert.equal(customLoads.length,0,'pasting alone never autoplays');
custom.play();customEvents.onReady({target:customPlayer});assert.deepEqual(customLoads.at(-1),['video',{videoId:'1m0fmAJEGCE'}]);
custom.next();assert.equal(customLoads.length,1,'single video has no Next');
customEvents.onError({data:150});assert.equal(customRetries,0);assert.equal(custom.pending,false);assert.match(customStatus,/another link/);
assert.equal(custom.useLink('https://evil.test'),false);assert.equal(custom.hasNext,false);
custom.useLink(`https://music.youtube.com/playlist?list=${STATIONS[2].id}`);custom.play();customEvents.onReady({target:customPlayer});assert.equal(custom.hasNext,true);assert.equal(customLoads.at(-1)[1].list,STATIONS[2].id);
custom.pause();custom.select(1);customEvents.onReady({target:customPlayer});assert.equal(customLoads.at(-1)[0],'cuePlaylist');assert.equal(customLoads.at(-1)[1].list,STATIONS[1].id);
console.log('PASS: YouTube/Music links, short links, invalid URLs, single-video playback, playlist switching and return to presets.');
