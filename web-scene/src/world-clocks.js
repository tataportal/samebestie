const KEY='bestie-clocks-v1';
const cities=[['America/Lima','Lima · Peru'],['America/Los_Angeles','Berkeley · California'],['America/New_York','New York · USA'],['America/Mexico_City','Mexico City · Mexico'],['America/Bogota','Bogotá · Colombia'],['America/Santiago','Santiago · Chile'],['America/Argentina/Buenos_Aires','Buenos Aires · Argentina'],['America/Sao_Paulo','São Paulo · Brazil'],['Europe/Madrid','Madrid · Spain'],['Europe/London','London · UK'],['Europe/Paris','Paris · France'],['Asia/Tokyo','Tokyo · Japan'],['Asia/Seoul','Seoul · South Korea'],['Asia/Shanghai','Shanghai · China'],['Asia/Kolkata','Kolkata · India'],['Australia/Sydney','Sydney · Australia']];
export function validZone(zone){try{new Intl.DateTimeFormat('en-US',{timeZone:zone}).format();return typeof zone==='string'&&zone.length>0}catch{return false}}
export function sanitizeZones(zones,fallback='America/Lima'){const valid=Array.isArray(zones)?[...new Set(zones.filter(validZone))].slice(0,3):[];return valid.length?valid:[validZone(fallback)?fallback:'America/Lima']}
export function zoneLabel(zone){return cities.find(c=>c[0]===zone)?.[1]||zone.split('/').at(-1).replaceAll('_',' ')}
export function clockValue(zone,now=new Date()){return {time:new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now),date:new Intl.DateTimeFormat('en-US',{timeZone:zone,weekday:'short',day:'numeric',month:'short'}).format(now)}}
export function mountClocks(){
 const $=id=>document.getElementById(id),device=Intl.DateTimeFormat().resolvedOptions().timeZone;
 let zones=sanitizeZones(null,device);try{zones=sanitizeZones(JSON.parse(localStorage.getItem(KEY)),device)}catch{}
 const all=[...cities];for(const zone of Intl.supportedValuesOf?.('timeZone')||[])if(!all.some(c=>c[0]===zone))all.push([zone,zone.replaceAll('_',' ')]);
 for(const zone of zones)if(!all.some(c=>c[0]===zone))all.push([zone,zoneLabel(zone)]);
 function save(){try{localStorage.setItem(KEY,JSON.stringify(zones))}catch{}}
 function tick(){const now=new Date();for(const row of $('world-clocks').children){const value=clockValue(row.dataset.zone,now);row.querySelector('time').textContent=value.time;row.querySelector('small').textContent=value.date;}}
 function render(){
  $('clock-editors').replaceChildren();$('world-clocks').replaceChildren();
  zones.forEach((zone,index)=>{
   const card=document.createElement('div');card.className='world-clock';card.dataset.zone=zone;
   const city=document.createElement('span');city.textContent=zoneLabel(zone).split(' · ')[0];const time=document.createElement('time');const date=document.createElement('small');card.append(city,time,date);$('world-clocks').append(card);
   const row=document.createElement('div');row.className='clock-editor';const label=document.createElement('label');label.textContent=`Clock ${index+1}`;const select=document.createElement('select');select.setAttribute('aria-label',`City for clock ${index+1}`);
   for(const [value,name] of all){const option=new Option(name,value,value===zone,value===zone);option.disabled=zones.includes(value)&&value!==zone;select.add(option)}
   select.onchange=()=>{zones[index]=select.value;save();render()};label.append(select);row.append(label);
   if(zones.length>1){const remove=document.createElement('button');remove.textContent='×';remove.setAttribute('aria-label',`Remove clock for ${zoneLabel(zone)}`);remove.onclick=()=>{zones.splice(index,1);save();render()};row.append(remove)}$('clock-editors').append(row);
  });$('add-clock').disabled=zones.length>=3;tick();
 }
 $('add-clock').onclick=()=>{if(zones.length>=3)return;zones.push(['America/Lima','America/Los_Angeles','Europe/Madrid'].find(z=>!zones.includes(z)));save();render()};
 $('device-clock').onclick=()=>{zones[0]=validZone(device)?device:'America/Lima';zones=sanitizeZones(zones);save();render()};
 render();setInterval(tick,1000);document.addEventListener('visibilitychange',tick);
}
