// Notification display/click support only. No offline cache or fake background scheduler.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const url=new URL(event.notification.data?.url||self.registration.scope,self.registration.scope);
 if(url.origin!==self.location.origin)return;
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
  const client=clients.find(c=>c.url.startsWith(self.registration.scope));if(client)return client.focus();return self.clients.openWindow(url.href);
 }));
});
