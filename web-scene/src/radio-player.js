export const STATIONS = [
 {id:'PL_6eZZ6BqSfc8fEccwSC33I_hB9Dhf7hp',name:'boo',number:'101'},
 {id:'PL_6eZZ6BqSffdNsURQpH3-8aiazrMkN_0',name:'Meh',number:'102'},
 {id:'PL_6eZZ6BqSfeRBXh7UDoICa5MNrfWE1PG',name:'Hug me',number:'103'},
 {id:'PL_6eZZ6BqSfecqEegg4efVaP6WrHW5kx8',name:'Lima',number:'104'},
 {id:'PL_6eZZ6BqSfe8phG8GBzM1h8ofzAw42zJ',name:'Canciones para cuando llueva',number:'105'},
];

export function parseYouTubeLink(value){
 try{
  const url=new URL(value.trim().replace(/^(?=(?:www\.|music\.|m\.)?youtube\.com\/|youtu\.be\/)/i,'https://'));
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.port)return null;
  const host=url.hostname.toLowerCase();
  if(!['youtube.com','www.youtube.com','music.youtube.com','m.youtube.com','youtu.be'].includes(host))return null;
  const path=url.pathname.split('/').filter(Boolean);
  if(host!=='youtu.be'&&!['watch','playlist','shorts','live','embed'].includes(path[0]))return null;
  const list=url.searchParams.get('list');
  if(list&&/^[A-Za-z0-9_-]{10,150}$/.test(list))return {type:'playlist',id:list,url:`https://music.youtube.com/playlist?list=${list}`};
  const id=host==='youtu.be'?path[0]:['shorts','live','embed'].includes(path[0])?path[1]:url.searchParams.get('v');
  if(id&&/^[A-Za-z0-9_-]{11}$/.test(id))return {type:'video',id,url:`https://www.youtube.com/watch?v=${id}`};
 }catch{}
 return null;
}

// Own the async player lifecycle separately from the scene and Pomodoro.
export function createRadioPlayer({createPlayer,onStatus,onPlaying=()=>{},canPlay=()=>true,schedule=setTimeout,cancel=clearTimeout}) {
 let player=null,ready=false,generation=0,source={type:'playlist',id:STATIONS[0].id},index=0,wanted=false,playing=false,volume=45,retry=null,watchdog=null,failed=false,handleError=null;
 const tried=new Set();
 const status=text=>onStatus(text);
 function active(value){playing=value;onPlaying(value)}
 function clearRetry(){if(retry!==null)cancel(retry);if(watchdog!==null)cancel(watchdog);retry=null;watchdog=null}
 function stop(){wanted=false;clearRetry();player?.pauseVideo?.();active(false)}
 function close(){stop();generation++;player?.destroy();player=null;ready=false;failed=false}
 function load(){
  if(!ready)return;
  if(source.type==='video'){const args={videoId:source.id};if(wanted&&canPlay())player.loadVideoById(args);else player.cueVideoById(args);return}
  const args={list:source.id,listType:'playlist',index};
  if(wanted&&canPlay())player.loadPlaylist(args);else player.cuePlaylist(args);
 }
 function boot(){
  const token=++generation;ready=false;failed=false;player?.destroy();player=null;clearRetry();
  status('Tuning in…');
  const events={
   onReady(event){if(token!==generation)return;player=event.target;ready=true;player.setVolume(volume);load()},
   onStateChange(event){
    if(token!==generation)return;
    if(event.data===1){
     if(!canPlay()){stop();return}
     wanted=true;failed=false;clearRetry();tried.clear();active(true);
     const current=player.getPlaylistIndex();if(current>=0)index=current;
     status(player.getVideoData?.().title || 'On air · make yourself comfy');
    }else if(event.data===2){active(false);if(retry===null){wanted=false;status('Paused · no rush')}}
    else if(event.data===3){active(false);status('Tuning in…')}
    else if(event.data===0){active(false);wanted=false;status('Station finished · play it again?')}
    else if(event.data===5){active(false);status('Ready when you are')}
   },
   onAutoplayBlocked(){if(token!==generation)return;stop();status('Tap Play in the YouTube player to start.')},
   onError(event){
    if(token!==generation||retry!==null)return;
    active(false);failed=true;
    if(source.type==='video'){stop();status('This video can’t play here. Try another link or open YouTube.');return}
    if(![100,101,150].includes(event.data)){stop();status('YouTube couldn’t load. Try Play again or open the playlist.');return}
    const current=player.getPlaylistIndex();if(current>=0)index=current;
    tried.add(index);
    const length=player.getPlaylist()?.length;
    const next=length?(index+1)%length:index+1;
    if(!wanted||!canPlay()){stop();status('This track can’t play here. Try Next or open YouTube Music.');return}
    // A restricted first track may not expose a queue at all. Indexed playlist
    // loading still works; bound the search so an unavailable list cannot loop.
    if(tried.has(next)||tried.size>=12){stop();status('These tracks can’t play here. Open the playlist in YouTube Music.');return}
    status('Track unavailable here · trying the next one…');
    retry=schedule(()=>{
     retry=null;if(token!==generation||!wanted||!canPlay())return;index=next;load();
     // YouTube can suppress a repeated 150 event on adjacent blocked tracks.
     // Allow a short recovery window; an error overlay can report buffering too.
     watchdog=schedule(()=>{watchdog=null;if(token===generation&&wanted&&canPlay()&&!playing)events.onError({data:150})},8000);
    },900);
   },
  };
  handleError=events.onError;player=createPlayer(events,source);
 }
 return {
  select(value){if(!Number.isInteger(value)||!STATIONS[value])return;source={type:'playlist',id:STATIONS[value].id};index=0;tried.clear();active(false);if(player)boot()},
  useLink(value){const parsed=parseYouTubeLink(value);if(!parsed)return false;source=parsed;index=0;tried.clear();active(false);if(player)boot();return true},
  get hasNext(){return source.type==='playlist'},
  play(){wanted=true;tried.clear();if(!player||(failed&&source.type==='video'))boot();else if(ready){if(failed){handleError({data:150})}else player.playVideo()}},
  pause(){stop();status('Paused · no rush')},
  next(){if(!ready||source.type!=='playlist')return;clearRetry();tried.clear();wanted=true;failed=false;const current=player.getPlaylistIndex();const length=player.getPlaylist()?.length;index=length?((current>=0?current:index)+1)%length:index+1;load()},
  volume(value){volume=Math.max(0,Math.min(100,Number(value)||0));if(ready)player.setVolume(volume)},
  close,
  get playing(){return playing},
  get pending(){return wanted&&!playing},
 };
}
