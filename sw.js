/* TGAT1 English Studio v22 offline shell. Caches static app files; learner data remains in browser storage. */
const CACHE_NAME='tgat1-studio-v22-static';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./home-cover.jpg'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);await cache.addAll(CORE);/* Wait for the learner to accept the update. */})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith('tgat1-studio-')&&n!==CACHE_NAME).map(n=>caches.delete(n)));await self.clients.claim()})())});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  const cachePromise=caches.open(CACHE_NAME);
  const networkPromise=fetch(req).then(async res=>{
    if(res&&res.ok){try{const cache=await cachePromise;await cache.put(req,res.clone())}catch(e){/* Network response remains usable if cache storage is unavailable. */}}
    return res;
  }).catch(()=>null);
  // Call waitUntil during event dispatch; do not call it after an awaited cache lookup.
  event.waitUntil(networkPromise.then(()=>undefined));
  event.respondWith((async()=>{
    const cache=await cachePromise;
    const cached=await cache.match(req);
    if(cached)return cached;
    const res=await networkPromise;
    if(res)return res;
    if(req.mode==='navigate')return (await cache.match('./index.html'))||Response.error();
    return Response.error();
  })());
});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting()});
