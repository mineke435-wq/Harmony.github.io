const V='harmony-v1';
const ASSETS=['./','index.html','manifest.json','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const put=(r,res)=>{const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));return res};
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    // 同一オリジンはネット優先（更新がすぐ反映）、オフライン時はキャッシュ
    e.respondWith(fetch(r).then(res=>put(r,res)).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
  }else if(/(^|\.)(googleapis|gstatic)\.com$/.test(u.hostname)){
    // Googleフォントはキャッシュ優先
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>put(r,res)).catch(()=>m)));
  }
});
