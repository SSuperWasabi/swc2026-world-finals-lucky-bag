/* SWC2026 World Finals Lucky Bag — Service Worker
   앱 자산을 미리 캐시해 첫 실행 뒤에는 인터넷 없이 돈다.
   ※ 앱을 고쳐 다시 배포할 때는 CACHE 버전과 index.html의 APP_VER를 함께 올린다. */
const CACHE = 'swc2026-world-finals-lucky-bag-v29';
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
  './assets/main/main-intro-poster.jpg',
  './assets/main/main-loop-poster.jpg',
  './assets/main/select-loop-poster.jpg',
  './assets/main/draw-bg-poster.jpg',
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

const DEV_HOST = ['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname);

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
    // 개발용 PC(localhost)에서는 항상 최신 파일을 먼저 받는다(고치는 도중의 예전 화면이 캐시에 남아 섞여 보이지 않게).
    // 서버에 못 닿으면 아래 캐시로 넘어가므로 오프라인 동작은 그대로다. 실제 배포 주소(iPad)는 캐시 우선.
    if (DEV_HOST) {
      try { const fresh = await fetch(e.request, { cache: 'no-store' }); if (fresh.status === 200 && fresh.type === 'basic') e.waitUntil(cache.put(e.request, fresh.clone()).catch(() => {})); if (fresh.ok || fresh.status === 206) return fresh; } catch (err) { /* 오프라인 → 캐시 */ }
    }
    const hit = await cache.match(e.request, { ignoreSearch: e.request.mode === 'navigate' });
    if (hit) {
      const range = e.request.headers.get('range');
      if (!range) return hit;
      // 파일 전체를 메모리로 읽지 않고(blob) 필요한 구간만 잘라 준다 — iPad는 영상 하나에 구간 요청을 여러 번 보낸다
      const blob = await hit.blob(), size = blob.size, m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!m || (!m[1] && !m[2])) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
      const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
      const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
      if (start > end || start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
      const type = hit.headers.get('Content-Type') || 'video/mp4';
      return new Response(blob.slice(start, end + 1, type), { status: 206, headers: { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
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
