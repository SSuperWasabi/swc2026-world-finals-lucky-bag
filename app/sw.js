/* SWC2026 World Finals Lucky Bag — Service Worker
   앱 자산을 미리 캐시해 첫 실행 뒤에는 인터넷 없이 돈다.
   ※ 앱을 고쳐 다시 배포할 때는 CACHE 버전과 index.html의 APP_VER를 함께 올린다. */
const CACHE = 'swc2026-world-finals-lucky-bag-v24';
const PREFIX = 'swc2026-world-finals-lucky-bag-';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './bag-engine.js',
  './bag-store.js',
  './reveal.js',
  './transition.js',
  './assets/main/main-intro.mp4',
  './assets/main/main-loop.mp4',
  './assets/main/select-loop.mp4',
  './assets/main/draw-bg-loop.mp4',
  './assets/main/emblem-loop.mp4',
  './assets/com2us-store-h-white.png',
  './assets/transition/transition-matte.mp4',
  './assets/transition/transition-color.mp4',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/com2us-store-lockup-white.svg',
  './assets/fonts/Pretendard-Bold.otf',
  './assets/fonts/LINESeedSans-Bold.otf',
  './assets/fonts/Unbounded-Variable.ttf',
  './assets/lb/bg-streaks.jpg',
  './assets/lb/card-back.png',
  './assets/lb/card-front-a.png',
  './assets/lb/card-front-b.png',
  './assets/lb/card-front-c.png',
  './assets/lb/pedestal.webp',
  './assets/lb/reveal-sfx.mp3',
  './assets/lb/grade-A.png',
  './assets/lb/grade-B.png',
  './assets/lb/grade-C.png',
  './assets/lb/card-front-a-loop.mp4',
  './assets/lb/card-front-a-poster.jpg',
  './assets/lb/card-front-b-loop.mp4',
  './assets/lb/card-front-b-poster.jpg',
  './assets/lb/card-front-c-loop.mp4',
  './assets/lb/card-front-c-poster.jpg',
  './assets/lb/sd-yeonhong.png',
  './assets/lb/sd-ragdoll.png',
  './assets/lb/sd-oracle.png',
  './assets/lb/emblem-key.png',
  './assets/lb/emblem-x-white.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* 캐시 우선: 있으면 바로 주고, 없으면 네트워크에서 받아 캐시에 넣는다. 영상용 Range 요청도 캐시에서 잘라 준다. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request, { ignoreSearch: e.request.mode === 'navigate' });
    if (hit) {
      const range = e.request.headers.get('range');
      if (!range) return hit;
      const bytes = await hit.arrayBuffer(), m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!m) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${bytes.byteLength}` } });
      const start = m[1] ? Number(m[1]) : Math.max(0, bytes.byteLength - Number(m[2]));
      const end = m[1] && m[2] ? Math.min(Number(m[2]), bytes.byteLength - 1) : bytes.byteLength - 1;
      if (start > end || start >= bytes.byteLength) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${bytes.byteLength}` } });
      return new Response(bytes.slice(start, end + 1), { status: 206, headers: { 'Content-Type': hit.headers.get('Content-Type') || 'video/mp4', 'Content-Range': `bytes ${start}-${end}/${bytes.byteLength}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
    }
    try {
      const res = await fetch(e.request);
      if (res.status === 200 && res.type === 'basic') e.waitUntil(cache.put(e.request, res.clone()).catch(() => {}));
      return res;
    } catch {
      if (e.request.mode === 'navigate') { const page = await cache.match('./index.html'); if (page) return page; }
      return new Response('Offline resource unavailable', { status: 503, statusText: 'Offline' });
    }
  })());
});
