import assert from 'node:assert/strict';
import {mountAlerts} from '../src/alerts.js';
const ids=['alarm-sound','notifications','notification-status','turn-notice','turn-notice-title','turn-notice-body','dismiss-notice','test-alarm'];
const elements=new Map(ids.map(id=>[id,{checked:false,hidden:true,textContent:'',setAttribute(){}}]));
const storage=new Map();let prompts=0,delivered=[];
class FakeNotification {static permission='default';static async requestPermission(){prompts++;return this.permission='granted'}constructor(title,options){delivered.push({title,...options})}}
globalThis.window={Notification:FakeNotification};globalThis.Notification=FakeNotification;globalThis.isSecureContext=true;globalThis.location={href:'https://example.org/samebestie/'};
globalThis.document={getElementById:id=>elements.get(id),addEventListener(){}};globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
const originalNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
try{
 const alerts=mountAlerts();assert.equal(prompts,0);assert.equal(delivered.length,0);
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
