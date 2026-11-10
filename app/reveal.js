/* 카드 공개 연출 v3 — 레퍼런스(card flipping animation reference.mp4)를 0.1초 단위로 분석해 반영
   레퍼런스 완성본(22.9~25.6초) 타임라인:
   ① 빌드업 0.6초: 카드는 받침대 위 제자리, 금빛 테두리 빛이 점점 두껍고 밝게(블룸), 끝에 미세한 떨림 + 럼블
   ② 느린 뒤집기: 0.2초 만에 옆면까지 → 옆면(가는 빛기둥)으로 0.5초 버팀. 받침대에서 카드 위까지 솟는 빛기둥, 바닥 빛 웅덩이 + 휙 소리
   ③ 휙 넘어감(0.1초) → 빛 터짐: 화면 섬광 + 앞면 과노출 → 카드 둘레 굵은 방사 광선 + 사방 불꽃 + 받침대 위로 퍼지는 고리 + 쾅
   ④ 광택: 무지개빛이 앞면을 훑으며 카드가 기울었다 돌아옴
   배경은 어둡게(조명) — 공개가 시작되면 화면을 어둡게 눌러 금빛이 살아나게 한다.
   빛 효과는 캔버스에 더하기 합성(lighter)으로 그린다(겹칠수록 밝아지는 진짜 빛처럼).
   약속(index.html이 쓰는 것): Reveal.enter(slots) / Reveal.flip(slot, type, {delay}) / Reveal.show(slot, type)
   / Reveal.finish(slot, type)(다시 눌러 바로 완료) / Reveal.prime()(누른 순간 소리 준비)  */
(function (root) {
  const ART = {
    A: { vid: 'assets/lb/card-front-a-loop.mp4', poster: 'assets/lb/card-front-a-poster.jpg' },
    B: { vid: 'assets/lb/card-front-b-loop.mp4', poster: 'assets/lb/card-front-b-poster.jpg' },
    C: { vid: 'assets/lb/card-front-c-loop.mp4', poster: 'assets/lb/card-front-c-poster.jpg' },
  };
  const reduced = () => root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function settle(anim, ms) {
    return Promise.race([anim.finished.catch(() => {}), wait(ms)]).then(() => { try { if (anim.playState !== 'idle') anim.finish(); } catch (e) { } });
  }

  /* ── 소리 ──
     넣어 주신 효과음(assets/lb/reveal-sfx.mp3 = "Magical Lucky Bag Reveal") 한 파일을 쓴다.
     파일 구조(실측): 0~2.35초 잔잔한 깔림 → 2.35~2.94초 올라가는 휙 → 2.94초 쾅 → 약 3초 반짝이는 잔향.
     빛이 터지는 순간에 '쾅'(BOOM_AT)이 정확히 오도록 재생 시작 위치를 맞추고,
     타격감을 위해 저음(우르릉 → 쿵)을 한 겹 더 얹는다. 파일을 못 읽었으면 합성음으로 대신한다. */
  const SFX_URL = 'assets/lb/reveal-sfx.mp3', BOOM_AT = 2.94;
  let ac = null, master = null, sfxRaw = null, sfxBuf = null, decoding = false;
  try { fetch(SFX_URL).then((r) => (r.ok ? r.arrayBuffer() : null)).then((b) => { sfxRaw = b; }).catch(() => { }); } catch (e) { }
  function ctx() {
    try {
      if (!ac) {
        ac = new (root.AudioContext || root.webkitAudioContext)();
        master = ac.createDynamicsCompressor();   // 카드 여러 장이 겹쳐 터져도 소리가 깨지지 않게
        master.threshold.value = -9; master.knee.value = 10; master.ratio.value = 5; master.attack.value = 0.002; master.release.value = 0.22;
        master.connect(ac.destination);
      }
      if (ac.state === 'suspended') ac.resume();
      if (sfxRaw && !sfxBuf && !decoding) {
        decoding = true; const ok = (b) => { if (b) sfxBuf = b; }, bad = () => { decoding = false; };
        const pr = ac.decodeAudioData(sfxRaw.slice(0), ok, bad); if (pr && pr.then) pr.then(ok).catch(bad);
      }
    } catch (e) { ac = null; }
    return ac;
  }
  function noiseBuf(a, sec) { const b = a.createBuffer(1, Math.max(1, Math.floor(a.sampleRate * sec)), a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  // 저음 타격: 사인파가 150→34Hz로 떨어지는 '쿵' + 짧은 저역 잡음
  function subBoom(a, at, nodes) {
    const o = a.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(150, at); o.frequency.exponentialRampToValueAtTime(34, at + 0.55);
    const g = a.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(1.15, at + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.95);
    o.connect(g).connect(master); o.start(at); o.stop(at + 1);
    const n = a.createBufferSource(); n.buffer = noiseBuf(a, 0.3); const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(1400, at); f.frequency.exponentialRampToValueAtTime(140, at + 0.25);
    const ng = a.createGain(); ng.gain.setValueAtTime(0.9, at); ng.gain.exponentialRampToValueAtTime(0.0001, at + 0.28); n.connect(f).connect(ng).connect(master); n.start(at);
    nodes.push(o, n);
  }
  function playFile(a, when, offset, nodes) {
    const s = a.createBufferSource(); s.buffer = sfxBuf; const g = a.createGain(); g.gain.value = 0.92; s.connect(g).connect(master);
    if (offset >= 0) s.start(when, offset); else s.start(when - offset, 0);
    nodes.push(s);
  }
  function stopNodes(slot) { (slot._snd || []).forEach((n) => { try { n.stop(); } catch (e) { } }); slot._snd = []; }
  const SFX = {
    prime() { ctx(); },   // 사용자가 누른 순간에 불러 두면(소리 허용 + 파일 해독) 첫 카드부터 소리가 난다
    // 뒤집기 한 번의 소리 전체를 예약: lead초 뒤에 빛이 터진다
    start(slot, lead) {
      const a = ctx(); if (!a) return; stopNodes(slot);
      const t = a.currentTime, tb = t + lead, nodes = [];
      // 우르릉: 저역 잡음 + 낮은 음이 터지는 순간까지 차오르다 뚝 끊김(직전의 정적이 '쾅'을 키운다)
      const n = a.createBufferSource(); n.buffer = noiseBuf(a, lead + 0.1); const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(110, t); f.frequency.exponentialRampToValueAtTime(320, tb);
      const g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(1.0, tb - 0.06); g.gain.exponentialRampToValueAtTime(0.0001, tb - 0.01);
      n.connect(f).connect(g).connect(master); n.start(t); n.stop(tb + 0.05);
      const o = a.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(34, t); o.frequency.exponentialRampToValueAtTime(70, tb);
      const og = a.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.55, tb - 0.06); og.gain.exponentialRampToValueAtTime(0.0001, tb - 0.01);
      o.connect(og).connect(master); o.start(t); o.stop(tb + 0.05);
      nodes.push(n, o);
      if (sfxBuf) playFile(a, t, BOOM_AT - lead, nodes);      // 파일의 휙 → 쾅 → 잔향
      else {                                                    // 대신 쓰는 합성 휙
        const w = a.createBufferSource(); w.buffer = noiseBuf(a, 0.6); const wf = a.createBiquadFilter(); wf.type = 'bandpass'; wf.Q.value = 1.2;
        const ws = Math.max(t, tb - 0.6); wf.frequency.setValueAtTime(400, ws); wf.frequency.exponentialRampToValueAtTime(5200, tb);
        const wg = a.createGain(); wg.gain.setValueAtTime(0.0001, ws); wg.gain.exponentialRampToValueAtTime(0.7, tb - 0.05); wg.gain.exponentialRampToValueAtTime(0.0001, tb + 0.02);
        w.connect(wf).connect(wg).connect(master); w.start(ws); nodes.push(w);
      }
      subBoom(a, tb, nodes);
      slot._snd = nodes;
    },
    // 다시 눌러 바로 완료할 때: 예약된 소리를 끊고 '쾅'만 즉시
    boomNow(slot) {
      const a = ctx(); if (!a) return; stopNodes(slot);
      const t = a.currentTime + 0.01, nodes = [];
      if (sfxBuf) playFile(a, t, BOOM_AT - 0.03, nodes);
      subBoom(a, t + 0.03, nodes);
      slot._snd = nodes;
    },
    stop(slot) { stopNodes(slot); },
  };

  /* ── 빛 효과 캔버스(무대 전체, 반 해상도) ── */
  const CW = 1024, CH = 1366;
  let cv = null, cx = null, fxs = [], parts = [], raf = 0;
  function canvas() {
    if (cv) return cv;
    cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; cv.className = 'fx-sparks';
    document.getElementById('stage').appendChild(cv); cx = cv.getContext('2d'); return cv;
  }
  // 미리 그린 빛 점(금·흰): drawImage로 늘려 써서 iPad에서도 가볍게
  const sprites = {};
  function sprite(kind) {
    if (sprites[kind]) return sprites[kind];
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    if (kind === 'white') { r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,250,235,.8)'); r.addColorStop(0.6, 'rgba(255,220,150,.22)'); r.addColorStop(1, 'rgba(255,200,120,0)'); }
    else { r.addColorStop(0, 'rgba(255,236,170,1)'); r.addColorStop(0.3, 'rgba(255,196,80,.55)'); r.addColorStop(0.7, 'rgba(255,160,40,.12)'); r.addColorStop(1, 'rgba(255,150,30,0)'); }
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return (sprites[kind] = c);
  }
  function glow(kind, x, y, w, h, a) { if (a <= 0) return; cx.globalAlpha = Math.min(1, a); cx.drawImage(sprite(kind), x - w / 2, y - h / 2, w, h); cx.globalAlpha = 1; }
  function addFx(slot, dur, draw) { canvas(); fxs.push({ slot, t0: performance.now(), dur, draw }); run(); }
  function run() { canvas(); if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0; cx.clearRect(0, 0, CW, CH); cx.globalCompositeOperation = 'lighter';
    fxs = fxs.filter((f) => !(f.slot && f.slot._stop) && now - f.t0 < f.dur);
    for (const f of fxs) { cx.save(); f.draw(Math.max(0, (now - f.t0) / f.dur), now); cx.restore(); }
    parts = parts.filter((p) => p.life < p.max);
    for (const p of parts) {
      p.life++; p.x += p.vx; p.y += p.vy; p.vx *= p.drag; p.vy = p.vy * p.drag + p.g;
      const k = 1 - p.life / p.max;
      if (p.streak) { cx.strokeStyle = `rgba(${p.c},${k})`; cx.lineWidth = p.w; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x - p.vx * p.len, p.y - p.vy * p.len); cx.stroke(); }
      else glow(p.k, p.x, p.y, p.w * 6, p.w * 6, k * (0.6 + 0.4 * Math.sin(p.life * 0.5 + p.ph)));
    }
    cx.globalCompositeOperation = 'source-over';
    if (fxs.length || parts.length) raf = requestAnimationFrame(frame); else cx.clearRect(0, 0, CW, CH);
  }
  // 슬롯(카드 자리) 사각형을 캔버스 좌표로: 카드 자체는 돌고 있으니 슬롯 기준
  function rectOf(slot) {
    const s = document.getElementById('stage').getBoundingClientRect(), r = slot.getBoundingClientRect(), k = CW / s.width;
    return { x: (r.left - s.left) * k, y: (r.top - s.top) * k, w: r.width * k, h: r.height * k, cx: (r.left - s.left + r.width / 2) * k, cy: (r.top - s.top + r.height / 2) * k };
  }
  function roundRect(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  const ease = { in: (t) => t * t * t, out: (t) => 1 - Math.pow(1 - t, 3) };

  /* ① 테두리 빛(빌드업): 점점 두껍고 밝게, 끝에서 깜빡임 */
  function fxCharge(slot, R, ms) {
    const tail = 140; // 돌기 시작하면 빠르게 꺼짐(테두리 빛이 허공에 남지 않게)
    addFx(slot, ms + tail, (p, now) => {
      const tt = p * (ms + tail), off = tt > ms ? 1 - (tt - ms) / tail : 1;
      const e = Math.min(1, ease.in(Math.min(1, tt / ms)) * 1.15) * off, fl = 0.85 + 0.15 * Math.sin(now / 23);
      const pad = 2 + e * 3;
      for (const [lw, a, col] of [[64 * e + 10, 0.07 * e, '255,170,50'], [40 * e + 8, 0.12 * e, '255,180,60'], [22 * e + 6, 0.25 * e, '255,200,90'], [10 + e * 6, 0.6 * e * fl, '255,226,150'], [2.5 + e * 2, e * fl, '255,255,240']]) {
        cx.strokeStyle = `rgba(${col},${a})`; cx.lineWidth = lw; roundRect(R.x - pad, R.y - pad, R.w + pad * 2, R.h + pad * 2, R.w * 0.07); cx.stroke();
      }
      glow('gold', R.cx, R.cy, R.w * 2.2, R.h * 1.7, 0.45 * e);             // 카드 뒤 은은한 후광
      glow('gold', R.cx, R.y + R.h * 1.15, R.w * 1.6, R.h * 0.22, 0.7 * e); // 받침대 위 빛
    });
  }
  /* ② 옆면 빛기둥: 받침대에서 카드 위까지 솟는 세로 빛 + 바닥 빛 웅덩이 */
  function fxPillar(slot, R, ms) {
    addFx(slot, ms, (p, now) => {
      const a = Math.min(1, p / 0.12) * (p > 0.9 ? (1 - p) / 0.1 : 1) * (0.88 + 0.12 * Math.sin(now / 17));
      const top = R.y - R.h * 0.14, bot = R.y + R.h * 1.15, h = bot - top;
      glow('gold', R.cx, (top + bot) / 2, R.w * 0.9, h * 1.15, 0.55 * a);     // 넓은 금빛 번짐
      const g = cx.createLinearGradient(R.cx - 30, 0, R.cx + 30, 0);
      g.addColorStop(0, 'rgba(255,190,70,0)'); g.addColorStop(0.5, `rgba(255,224,150,${0.9 * a})`); g.addColorStop(1, 'rgba(255,190,70,0)');
      cx.fillStyle = g; cx.fillRect(R.cx - 30, top, 60, h);                   // 중간 빛
      cx.fillStyle = `rgba(255,236,190,${0.5 * a})`; cx.fillRect(R.cx - 9, top + h * 0.01, 18, h * 0.98);
      cx.fillStyle = `rgba(255,255,245,${a})`; cx.fillRect(R.cx - 3.5, top + h * 0.02, 7, h * 0.96);   // 하얀 심
      glow('white', R.cx, top, 60, 120, 0.8 * a);                               // 위 끝 반짝
      glow('gold', R.cx, bot, R.w * 1.3, R.h * 0.2, 0.9 * a);                   // 바닥 빛 웅덩이
      glow('white', R.cx, bot, R.w * 0.5, R.h * 0.07, a);
    });
  }
  /* ③ 빛 터짐 */
  function fxBurst(slot, R, rgb) {
    addFx(null, 380, (p) => { cx.fillStyle = `rgba(255,236,200,${0.42 * Math.pow(1 - p, 2)})`; cx.fillRect(0, 0, CW, CH); });       // 화면 섬광
    addFx(slot, 480, (p) => {                                                                                                          // 카드 모양 과노출
      const a = 1 - ease.out(p); cx.fillStyle = `rgba(255,250,232,${0.55 * a})`;
      roundRect(R.x - 6, R.y - 6, R.w + 12, R.h + 12, R.w * 0.07); cx.fill();
      glow('white', R.cx, R.cy, R.w * 1.35, R.h * 1.15, 0.7 * a);
    });
    addFx(slot, 1500, (p) => glow('gold', R.cx, R.cy, R.w * (2.4 + p), R.h * (1.9 + p * 0.6), 0.85 * (1 - p)));                    // 큰 후광
    // 받침대 위로 퍼지는 고리 2겹
    for (const [d, w] of [[0, 1], [170, 0.7]]) setTimeout(() => { if (!slot._stop) addFx(slot, 950, (p) => {
      const e = ease.out(p), rx = R.w * (0.18 + 0.75 * e), ry = rx * 0.2, y = R.y + R.h * 1.15;
      for (const [lk, ak] of [[4, 0.18], [1, 1]]) { cx.strokeStyle = `rgba(255,${lk > 1 ? 210 : 246},${lk > 1 ? 130 : 220},${ak * w * (1 - p)})`; cx.lineWidth = (7 * (1 - p) + 1.5) * lk;
        cx.beginPath(); cx.ellipse(R.cx, y, rx, ry, 0, 0, Math.PI * 2); cx.stroke(); }
    }); }, d);
    // 카드 둘레에서 바깥으로 뻗는 굵은 금빛 광선(속도선)
    const rays = [];
    for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2 + Math.random() * 0.12; rays.push({ a, l: 26 + Math.random() * 70, w: 3 + Math.random() * 5, sp: 0.6 + Math.random() * 0.8, d: Math.random() * 0.15 }); }
    addFx(slot, 750, (p) => {
      cx.lineCap = 'round';
      for (const r of rays) {
        const q = Math.max(0, (p - r.d) / (1 - r.d)); if (q <= 0) continue;
        const ex = Math.cos(r.a), ey = Math.sin(r.a);
        const base = Math.min(R.w * 0.55 / Math.max(Math.abs(ex), 1e-6), R.h * 0.55 / Math.max(Math.abs(ey), 1e-6)); // 카드 가장자리에서 출발
        const d0 = base + 8 + ease.out(q) * 150 * r.sp, d1 = d0 + r.l * (1 - q * 0.6);
        cx.strokeStyle = `rgba(255,${200 + Math.round(40 * (1 - q))},120,${(1 - q) * 0.95})`; cx.lineWidth = r.w * (1 - q * 0.5);
        cx.beginPath(); cx.moveTo(R.cx + ex * d0, R.cy + ey * d0); cx.lineTo(R.cx + ex * d1, R.cy + ey * d1); cx.stroke();
      }
      cx.shadowBlur = 0;
    });
    // 불꽃: 빠른 줄불꽃 + 천천히 떠오르는 금가루
    for (let i = 0; i < 90; i++) {
      const a = Math.random() * Math.PI * 2, sp = 5 + Math.random() * 15;
      const sx = R.cx + Math.cos(a) * R.w * 0.45, sy = R.cy + Math.sin(a) * R.h * 0.45;
      parts.push({ x: sx, y: sy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, life: 0, max: 22 + Math.random() * 26, w: 1.5 + Math.random() * 2.5, drag: 0.93, g: 0.22, streak: true, len: 2.4, c: Math.random() < 0.65 ? '255,236,170' : rgb });
    }
    for (let i = 0; i < 46; i++) {
      parts.push({ x: R.x + Math.random() * R.w, y: R.y + R.h * (0.2 + Math.random() * 0.8), vx: (Math.random() - 0.5) * 1.6, vy: -0.6 - Math.random() * 1.8, life: 0, max: 50 + Math.random() * 60, w: 1 + Math.random() * 2, drag: 0.985, g: -0.01, k: Math.random() < 0.5 ? 'white' : 'gold', ph: Math.random() * 6 });
    }
    run();
  }

  /* ── 카드 뒤에서 퍼지는 큰 금빛 광선(레퍼런스 STEP 3 LIGHT BURST) ──
     부드러운 넓은 빛줄기 14~16가닥 + 가운데 안개빛. 한 번 그려 이미지로 만들어 두고 매번 재사용.
     카드 '뒤'에 깔려야 하므로 #slots 맨 앞(모든 카드보다 뒤)에 넣는다. */
  let raysURL = null;
  function raysCanvas() {
    const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); const m = S / 2;
    g.globalCompositeOperation = 'lighter';
    const n = 13;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const len = m * (0.78 + Math.random() * 0.22), half = 0.07 + Math.random() * 0.08;    // 굵고 긴 빛줄기, 굵기·길이 제각각
      for (const [wk, al] of [[2.2, 0.07], [1.6, 0.12], [1.1, 0.2], [0.6, 0.32], [0.25, 0.4]]) { // 겹겹이 → 가장자리가 부드러움
        const h = half * wk, grd = g.createRadialGradient(m, m, 0, m, m, len);
        grd.addColorStop(0, `rgba(255,244,210,${al})`); grd.addColorStop(0.3, `rgba(255,220,140,${al})`);
        grd.addColorStop(0.7, `rgba(255,186,80,${al * 0.55})`); grd.addColorStop(1, 'rgba(255,170,60,0)');
        g.fillStyle = grd; g.beginPath(); g.moveTo(m, m);
        g.lineTo(m + Math.cos(a - h) * len, m + Math.sin(a - h) * len); g.lineTo(m + Math.cos(a + h) * len, m + Math.sin(a + h) * len); g.closePath(); g.fill();
      }
    }
    const haze = g.createRadialGradient(m, m, 0, m, m, m * 0.7);   // 카드 뒤 안개빛
    haze.addColorStop(0, 'rgba(255,240,190,1)'); haze.addColorStop(0.25, 'rgba(255,206,110,.6)'); haze.addColorStop(1, 'rgba(255,170,60,0)');
    g.fillStyle = haze; g.fillRect(0, 0, S, S);
    return c;
  }
  // 미리 만들어 둠(공개 순간에 만들면 그 사이 화면이 멈칫함)
  function prepRays() {
    if (raysURL) return;
    try { const c = raysCanvas(); if (c.toBlob) c.toBlob((b) => { if (b && !raysURL) raysURL = URL.createObjectURL(b); }); else raysURL = c.toDataURL(); } catch (e) { }
  }
  setTimeout(prepRays, 1200);
  function raysImage() { if (!raysURL) raysURL = raysCanvas().toDataURL(); return raysURL; }
  function godRays(slot) {
    const host = slot.parentNode; if (!host) return;
    const w = slot.offsetWidth * 3.6, x = slot.offsetLeft + slot.offsetWidth / 2, y = slot.offsetTop + slot.offsetHeight * 0.48;
    const url = raysImage();
    [['r1', 2800], ['r2', 2800]].forEach(([k, ms]) => {
      const d = document.createElement('div'); d.className = `godrays ${k}`;
      d.style.cssText = `left:${x - w / 2}px;top:${y - w / 2}px;width:${w}px;height:${w}px;background-image:url(${url})`;
      host.insertBefore(d, host.firstChild);
      setTimeout(() => d.remove(), ms);
    });
  }

  /* ── 앞면 채우기 ── */
  function fillFront(slot, type) {
    const a = ART[type];
    slot.dataset.type = type;
    slot.style.setProperty('--acc', `var(--${type})`);
    const f = slot.querySelector('.face.front');
    if (f.dataset.type === type) return f.querySelector('video');
    f.dataset.type = type;
    f.innerHTML = `<video class="cf-vid" src="${a.vid}" poster="${a.poster}" muted loop playsinline preload="auto" disablepictureinpicture></video>` +
      `<div class="cf-badge">${type}</div><div class="cf-name">LUCKY BAG ${type}</div><div class="cf-foil"></div>`;
    return f.querySelector('video');
  }
  function playVid(v) { if (v) { try { v.currentTime = 0; } catch (e) { } v.play().catch(() => { }); } }

  /* ── 등장: 가운데 → 왼쪽 → 오른쪽 순서로 회전하며 날아와 앉음 ── */
  function enter(slots) {
    if (reduced()) return Promise.resolve();
    const order = slots.length === 3 ? [1, 0, 2] : slots.map((_, i) => i);
    return Promise.all(order.map((idx, n) => settle(slots[idx].animate(
      [{ transform: 'translate3d(0,-260px,0) rotateY(-540deg) scale(.55)', opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: 'none', opacity: 1 }],
      { duration: 900, delay: n * 200, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }), 900 + n * 200 + 400)));
  }

  /* ── 공개 ── */
  const BURST_RGB = { A: '255,140,210', B: '255,214,120', C: '210,170,255' };
  // 레퍼런스 30fps 실측: 회전 5프레임(0.17초) · 옆면 빛기둥 14프레임(0.47초) · 휙 2프레임(0.07초) = 0.70초
  const T = { charge: 700, turn: 190, hang: 300, snap: 70 };   // 빛기둥 유지 0.30초(요청으로 레퍼런스 0.47초보다 짧게)
  async function flip(slot, type, opts) {
    const delay = (opts && opts.delay) || 0;
    slot._stop = false;
    const vid = fillFront(slot, type);
    const card = slot.querySelector('.card');
    if (reduced()) { slot.classList.add('flipped'); playVid(vid); return; }
    if (delay) await wait(delay);
    if (slot._stop) return;
    const scr = slot.closest('.scr'); if (scr) scr.classList.add('spot');   // 배경을 어둡게 눌러 금빛이 살게
    slot.classList.add('revealing', 'charging');
    const R = rectOf(slot);
    // ① 빌드업: 제자리에서 테두리 빛이 차오르고 끝에 미세하게 떨림
    SFX.start(slot, (T.charge + T.turn + T.hang + T.snap * 0.55) / 1000);   // 우르릉 → 휙 → 쾅 전체 예약
    fxCharge(slot, R, T.charge);
    const shake = [];
    // 떨림은 마지막에 반드시 제자리(0)로 돌아와야 다음 회전이 튀지 않음
    for (let i = 0; i <= 14; i++) { const k = i === 14 ? 0 : Math.pow(i / 14, 2.2) * 7; shake.push({ transform: `translate(${(i % 2 ? 1 : -1) * k}px,${(i % 3 - 1) * k * 0.5}px) rotateZ(${(i % 2 ? -1 : 1) * k * 0.08}deg) rotateY(0deg) scale(${1 + 0.03 * i / 14})` }); }
    await settle(card.animate(shake, { duration: T.charge, easing: 'linear', fill: 'forwards' }), T.charge + 400);
    if (slot._stop) return;
    // ② 옆면까지 부드럽게 가속·감속 → 빛기둥으로 버팀 → 휙
    slot.classList.add('edge');
    // 테두리 빛(CSS)은 카드가 거의 옆면이 됐을 때 끈다 → 회전 도중 빛이 '툭' 바뀌지 않음
    setTimeout(() => { if (!slot._stop) slot.classList.remove('charging'); }, T.turn * 0.8);
    setTimeout(() => { if (!slot._stop) fxPillar(slot, R, T.turn * 0.4 + T.hang + T.snap * 0.5); }, T.turn * 0.6);
    const total = T.turn + T.hang + T.snap;
    setTimeout(() => { if (!slot._stop) slot.classList.add('flipped'); }, T.turn + T.hang * 0.6);
    // ③ 빛 터짐: 휙 넘어가는 마지막 순간에 맞춰 터뜨림(다 넘어간 뒤 기다리면 맨 앞면이 잠깐 보임)
    let burstDone = false;
    const burstNow = () => {
      if (burstDone || slot._stop) return; burstDone = true;
      slot.classList.remove('edge');
      playVid(vid);
      godRays(slot);
      slot.classList.add('burst');
      fxBurst(slot, R, BURST_RGB[type] || '255,255,255');
      setTimeout(() => slot.classList.remove('burst'), 900);
    };
    setTimeout(burstNow, T.turn + T.hang + T.snap * 0.55);
    await settle(card.animate([
      { transform: 'translate(0px,0px) rotateZ(0deg) rotateY(0deg) scale(1.03)', easing: 'cubic-bezier(.32,0,.67,1)' },
      { transform: 'translate(0px,0px) rotateZ(0deg) rotateY(86deg) scale(1.03)', offset: T.turn / total, easing: 'linear' },
      { transform: 'translate(0px,0px) rotateZ(0deg) rotateY(94deg) scale(1.03)', offset: (T.turn + T.hang) / total, easing: 'cubic-bezier(.2,.6,.3,1)' },
      { transform: 'translate(0px,0px) rotateZ(0deg) rotateY(180deg) scale(1.09)' }], { duration: total, fill: 'forwards' }), total + 400);
    if (slot._stop) return;
    burstNow();   // 타이머가 밀렸을 때 대비(이미 터졌으면 아무것도 안 함)
    await settle(card.animate([
      { transform: 'rotateY(180deg) scale(1.09)' }, { transform: 'rotateY(180deg) scale(.985)', offset: 0.55 },
      { transform: 'rotateY(180deg) scale(1)' }], { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }), 900);
    if (slot._stop) return;
    // ④ 무지개 광택 + 기울기
    slot.classList.add('foil');
    await settle(card.animate([
      { transform: 'rotateY(180deg) rotateX(0deg)' }, { transform: 'rotateY(196deg) rotateX(7deg)', offset: 0.38 },
      { transform: 'rotateY(168deg) rotateX(-4deg)', offset: 0.74 }, { transform: 'rotateY(180deg) rotateX(0deg)' }],
      { duration: 1050, easing: 'ease-in-out', fill: 'forwards' }), 1500);
    if (slot._stop) return;
    slot.classList.remove('foil', 'revealing');
    card.getAnimations().forEach((a) => a.cancel());
    slot.classList.add('flipped');
  }

  /* 즉시 앞면 확정(복구·시간 초과용): 진행 중 연출을 멈추고 남은 효과를 지운다 */
  function show(slot, type) {
    slot._stop = true;
    const card = slot.querySelector('.card'); if (card) card.getAnimations().forEach((a) => a.cancel());
    slot.classList.remove('revealing', 'charging', 'edge', 'burst', 'foil');
    const scr = slot.closest('.scr'); if (scr) scr.classList.add('spot');
    const v = fillFront(slot, type); slot.classList.add('flipped'); playVid(v);
  }

  /* 다시 눌러 바로 완료: 남은 연출을 건너뛰고 앞면 + 짧은 빛 터짐 + '쾅' */
  function finish(slot, type) {
    const done = slot.classList.contains('flipped') && !slot.classList.contains('revealing');
    show(slot, type);
    if (done || reduced()) return;
    SFX.boomNow(slot);
    const R = rectOf(slot); godRays(slot);
    slot.classList.add('burst'); setTimeout(() => slot.classList.remove('burst'), 900);
    fxBurst({}, R, BURST_RGB[type] || '255,255,255');   // {}: show()가 세운 멈춤 표시에 걸리지 않게
    const card = slot.querySelector('.card');
    if (card) card.animate([{ transform: 'rotateY(180deg) scale(1.1)' }, { transform: 'rotateY(180deg) scale(.985)', offset: 0.55 }, { transform: 'rotateY(180deg) scale(1)' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }

  root.Reveal = { enter, flip, show, finish, prime: SFX.prime, sfx: SFX };
})(globalThis);
