/* Libreria Carte: copia offline dell'app. Online scarica sempre la versione più recente. */
const C='libreria-v2';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(C);
    const net=fetch(r,{cache:'no-cache'}).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res});
    e.waitUntil(net.catch(()=>{}));
    try{
      return await Promise.race([net,new Promise((_,no)=>setTimeout(no,6000))]);
    }catch(_){
      return (await c.match(r))||(r.mode==='navigate'?await c.match('./index.html'):Response.error());
    }
  })());
});
