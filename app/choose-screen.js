/* SWC2026 APAC — CHOOSE YOUR SCROLL (OAP v8).
   Background: AE-rendered intro (2 s, once) then loop (4 s). Only the 12 cards and the
   two buttons are app elements; their entrance timing comes from docs/oap-spec/choose-v8.
   Card entrance CSS starts on the intro's first presented frame so both stay in sync. */
// Centred stage message: visible 1.5 s or until the next tap anywhere (the tap still reaches
// what is underneath). Shared by the choose and open screens.
class StageHint {
  constructor(el) {
    this.el = el;
    this.timer = null;
    document.addEventListener('pointerdown', () => this.hide(), true);
  }

  show(html) {
    clearTimeout(this.timer);
    this.el.innerHTML = html;
    this.el.classList.add('is-visible');
    this.timer = setTimeout(() => this.hide(), 1500);
  }

  hide() {
    clearTimeout(this.timer);
    this.el.classList.remove('is-visible');
  }
}

class ChooseScreen {
  constructor(stage) {
    this.stage = stage;
    this.intro = stage.querySelector('#choose-bg-intro');
    this.loop = stage.querySelector('#choose-bg-loop');
    this.epoch = 0;
    this.inputTimer = null;
    this.fallbackTimer = null;
    this.diagnostics = { entries: 0, synced: 0, fallback: 0, loopSwaps: 0 };
    this.intro.addEventListener('ended', () => this.swapToLoop(this.epoch));
    this.hint = new StageHint(stage.querySelector('#choose-hint'));
  }

  showHint(html) { this.hint.show(html); }

  hideHint() { this.hint.hide(); }

  // Muted inline playback is allowed without a gesture; decode the first frames early
  // so the first entry does not wait on the decoder, then park both at frame 0.
  prime() {
    const epoch = this.epoch;
    for (const v of [this.intro, this.loop]) {
      // Skip if the screen was entered meanwhile; enter() owns playback then.
      const done = () => { if (epoch !== this.epoch) return; v.pause(); this.rewind(v); };
      Promise.resolve().then(() => v.play()).then(done, done);
    }
  }

  rewind(v) {
    try { if (v.currentTime !== 0) v.currentTime = 0; } catch (e) { /* not seekable yet */ }
  }

  onFirstFrame(v, epoch, fn) {
    const run = () => { if (epoch === this.epoch) fn(); };
    if (typeof v.requestVideoFrameCallback === 'function') v.requestVideoFrameCallback(run);
    else v.addEventListener('playing', run, { once: true });
  }

  enter() {
    const epoch = ++this.epoch;
    this.diagnostics.entries++;
    this.resetState();
    this.loop.pause();
    this.rewind(this.loop);
    this.rewind(this.intro);
    this.onFirstFrame(this.intro, epoch, () => this.startEntrance(epoch, true));
    // Never leave the controls hidden if the video cannot start.
    this.fallbackTimer = setTimeout(() => this.startEntrance(epoch, false), 700);
    Promise.resolve().then(() => this.intro.play()).catch(() => {});
  }

  startEntrance(epoch, synced) {
    if (epoch !== this.epoch || this.stage.classList.contains('is-playing')) return;
    clearTimeout(this.fallbackTimer);
    this.diagnostics[synced ? 'synced' : 'fallback']++;
    // The frame callback can arrive late under load; shift the CSS timeline back by however far
    // the intro has already played so the cards stay on the video clock.
    const lag = synced ? Math.max(0, Math.min(this.intro.currentTime || 0, 1)) : 0;
    this.stage.style.setProperty('--sync', (-lag).toFixed(3) + 's');
    this.diagnostics.lastLag = lag;
    this.stage.classList.add('is-playing');
    // Input opens when the last entrance (scroll 12) finishes: 0.985 + 0.45 s.
    this.inputTimer = setTimeout(() => { if (epoch === this.epoch) this.stage.classList.add('is-interactive'); }, Math.max(0, 1435 - lag * 1000));
  }

  swapToLoop(epoch) {
    if (epoch !== this.epoch) return;
    // The intro holds its last frame until the loop has presented its first one.
    this.onFirstFrame(this.loop, epoch, () => { this.stage.classList.add('loop-front'); this.diagnostics.loopSwaps++; });
    Promise.resolve().then(() => this.loop.play()).catch(() => {});
  }

  leave() {
    this.epoch++;
    this.hideHint();
    this.resetState();
    for (const v of [this.intro, this.loop]) { v.pause(); this.rewind(v); }
  }

  resetState() {
    clearTimeout(this.inputTimer);
    clearTimeout(this.fallbackTimer);
    this.stage.classList.remove('is-playing', 'is-interactive', 'loop-front');
  }
}

const CHOOSE_CARD_LAYOUT = (() => {
  // From docs/oap-spec/choose-v8/layout.json (master 2048x2732, final top-left).
  const cols = [125.02, 589.02, 1053.02, 1517.02], rows = [562.4, 1147.4, 1732.4];
  return Array.from({ length: 12 }, (_, i) => ({
    left: cols[i % 4],
    top: rows[Math.floor(i / 4)],
    delay: 0.38 + 0.055 * i
  }));
})();

// Selected-card glitter: sparkles sit on the card edge (x/y in % of the card, size in % of its width).
const CHOOSE_SPARKLES = [
  [-3, 9, 16, 0], [101, 24, 12, .45], [86, -3, 17, .9], [6, 97, 14, .3],
  [102, 80, 17, 1.15], [44, -4, 11, .6], [-4, 58, 12, 1.3], [62, 102, 15, .15]
];
const CHOOSE_GLITTER = CHOOSE_SPARKLES.map(([x, y, s, d]) => `<i style="left:${x}%;top:${y}%;width:${s}%;--d:${d}s"></i>`).join('');

// 부하 시험용 주소 옵션(swc-wf-v3): ?glass=a 는 유리 카드 시안 A(맑은 유리),
// ?glass=b 는 시안 B(짙은 유리, 고른 카드만 A의 맑은 유리), ?perf=1 은 선택 화면 측정 표시. 옵션이 없으면 원래 카드 그대로다.
const CHOOSE_QUERY = new URLSearchParams(location.search);
const CHOOSE_GLASS_MODE = ['a', 'b'].includes(CHOOSE_QUERY.get('glass')) ? CHOOSE_QUERY.get('glass') : '';
const CHOOSE_GLASS = CHOOSE_GLASS_MODE !== '';

function buildChooseGrid(grid, onChoose) {
  const stage = grid.closest('.choose-stage');
  stage.classList.toggle('glass', CHOOSE_GLASS);
  stage.classList.toggle('glass-b', CHOOSE_GLASS_MODE === 'b');
  grid.innerHTML = CHOOSE_CARD_LAYOUT.map((c, i) => {
    const n = String(i + 1).padStart(2, '0');
    // 유리 카드: 뒤 배경을 흐리게 비추는 판 + 소환서 그림 + 번호·이름 글자. 어둡게 하기는 filter 대신 막(glass-dim)으로 한다(filter가 있으면 유리 흐림이 끊긴다).
    const face = CHOOSE_GLASS
      ? `<span class="glass-pane"></span><span class="glass-no">${n}</span><img class="glass-art" src="assets/oap/choose/scroll-art.webp" alt="" draggable="false"><span class="glass-name">SCROLL ${n}</span><span class="glass-dim"></span>`
      : `<img src="assets/oap/choose/scroll-${n}.webp" alt="" draggable="false">`;
    // Glow, shine and glitter layers only animate while the card is selected (display:none otherwise).
    return `<button class="scroll-choice choose-anim choose-rise" style="left:calc(100%*${c.left}/2048);top:calc(100%*${c.top}/2732);--delay:${c.delay.toFixed(3)}s" aria-label="${i + 1}번 소환서 선택" aria-pressed="false" data-index="${i}"><span class="card-lift">${face}<span class="card-shine"></span></span><span class="card-glow"></span><span class="card-glitter">${CHOOSE_GLITTER}</span></button>`;
  }).join('');
  grid.querySelectorAll('.scroll-choice').forEach(b => b.addEventListener('click', () => onChoose(Number(b.dataset.index))));
  if (CHOOSE_QUERY.has('perf')) new ChoosePerf(grid.closest('.choose-stage'));
}

// 선택 화면 부하 측정(?perf=1): 카드를 누를 수 있게 된 순간부터 10초 동안
// 화면 프레임 간격(rAF)과 배경 영상이 실제로 그린 프레임(requestVideoFrameCallback)을 잰다.
class ChoosePerf {
  constructor(stage) {
    this.stage = stage;
    this.runs = [];
    this.box = document.createElement('div');
    this.box.className = 'choose-perf';
    stage.appendChild(this.box);
    this.render('측정 대기: 선택 화면이 열리면 10초 잽니다');
    new MutationObserver(() => {
      if (stage.classList.contains('is-interactive') && !this.active) this.measure();
    }).observe(stage, { attributes: true, attributeFilter: ['class'] });
    window.__choosePerf = this.runs;
  }

  render(now) {
    const mode = CHOOSE_GLASS ? '유리 ' + CHOOSE_GLASS_MODE.toUpperCase() : '기본 카드';
    this.box.innerHTML = `<b>${mode}</b> ${now}` + this.runs.map((r, i) => r.aborted
      ? `<div>${i + 1}회: 중단 — ${r.aborted}(결과에서 뺌)</div>`
      : `<div>${i + 1}회${r.selected ? '(선택)' : ''}: 화면 ${r.fps}fps(기기 ${r.hz}Hz) · 느린 프레임 ${r.slow}/${r.frames} · 최장 ${r.worst}ms · 영상 ${r.videoFps}fps · 영상 누락 ${r.dropped}</div>`).join('');
  }

  measure() {
    // 측정 도중 탭이 가려지거나 선택 화면을 벗어나면 그 회차는 중단한다(멈춘 영상·멈춘 화면이 부하로 잘못 잡히지 않게).
    const run = this.runId = (this.runId || 0) + 1;
    this.active = true;
    const SEC = 10, t0 = performance.now(), gaps = [];
    const videos = [...this.stage.querySelectorAll('video')];
    const dropped = () => videos.reduce((s, v) => s + (v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality().droppedVideoFrames : 0), 0);
    const d0 = dropped();
    let last = t0, vFrames = 0;
    const watched = new Set();
    // 반복 영상이 앞으로 오면 그 영상도 센다(시작 직후는 인트로가 재생 중일 수 있다).
    const onVideo = v => { if (watched.has(v) || !v.requestVideoFrameCallback) return; watched.add(v);
      const tick = () => { if (!this.active || this.runId !== run) return; if (!v.paused) vFrames++; v.requestVideoFrameCallback(tick); }; v.requestVideoFrameCallback(tick); };
    videos.forEach(onVideo);
    this.render('측정 중…');
    // 탭이 가려지면 rAF 자체가 멈추므로 visibilitychange로 기억해 두었다가 다음 프레임에서 중단한다.
    let hidden = document.hidden;
    const onVis = () => { if (document.hidden) hidden = true; };
    document.addEventListener('visibilitychange', onVis);
    const selected = this.stage.classList.contains('has-selection');
    const abort = reason => { this.active = false; document.removeEventListener('visibilitychange', onVis); this.runs.push({ aborted: reason }); this.render('다시 재려면 HOME → 다시 들어오거나 카드를 고르세요'); };
    const step = now => {
      if (this.runId !== run) return;
      if (hidden) { abort('탭이 가려짐'); return; }
      if (!this.stage.classList.contains('is-interactive')) { abort('선택 화면을 벗어남'); return; }
      gaps.push(now - last); last = now;
      if (now - t0 < SEC * 1000) { requestAnimationFrame(step); return; }
      this.active = false;
      document.removeEventListener('visibilitychange', onVis);
      const sorted = [...gaps].sort((a, b) => a - b), median = sorted[sorted.length >> 1];
      this.runs.push({
        mode: CHOOSE_GLASS ? 'glass-' + CHOOSE_GLASS_MODE : 'default',
        selected,
        frames: gaps.length,
        fps: Math.round(gaps.length / SEC * 10) / 10,
        hz: Math.round(1000 / median),
        slow: gaps.filter(g => g > median * 1.8).length,
        worst: Math.round(sorted[sorted.length - 1]),
        videoFps: Math.round(vFrames / SEC * 10) / 10,
        dropped: dropped() - d0
      });
      this.render('완료(카드를 고르면 선택 상태로 다시 10초 잽니다)');
    };
    requestAnimationFrame(now => { last = now; requestAnimationFrame(step); });
  }
}

// OPEN YOUR SCROLL (OAP v3) backdrop: the AE frame loop only plays while the screen is shown.
class OpenBackdrop {
  constructor(stage) {
    this.video = stage.querySelector('#open-frame-video');
    this.hint = new StageHint(stage.querySelector('#open-hint'));
    this.active = false;
  }

  prime() {
    const v = this.video;
    const done = () => { if (!this.active) v.pause(); };
    Promise.resolve().then(() => v.play()).then(done, done);
  }

  enter() {
    this.active = true;
    Promise.resolve().then(() => this.video.play()).catch(() => {});
  }

  leave() {
    this.active = false;
    this.hint.hide();
    this.video.pause();
  }
}

// WIN PRIZE (OAP v5): each winning prize has its own AE pre-render (admin 당첨 영상, IndexedDB).
// prepare() loads it as soon as the draw commits; play() starts it from frame 0 when the result shows.
class WinScreen {
  constructor(stage, onHome) {
    this.video = stage.querySelector('#win-video');
    this.active = false;
    this.key = null;
    this.url = null;
    // Taps return home only once the AE entrance is complete (last entrance key: frame opacity at 2.5 s),
    // measured on the video clock so a stalled video never exits early.
    this.entranceEnd = 2.5;
    stage.addEventListener('click', () => { if (this.active && this.video.currentTime >= this.entranceEnd) onHome(); });
  }

  hasVideo(key) { return !!key && key === this.key && !!this.url; }

  rewind() {
    try { if (this.video.currentTime !== 0) this.video.currentTime = 0; } catch (e) { /* not seekable yet */ }
  }

  // Resolves true once the first frame is decodable (or false: missing/unplayable, 4 s cap).
  prepare(key) {
    if (this.hasVideo(key)) { this.rewind(); return Promise.resolve(this.video.readyState >= 2); }
    return (async () => {
      const data = await idbGet(key);
      const blob = data && mediaBlob(data);
      if (!blob) return false;
      if (this.url) URL.revokeObjectURL(this.url);
      this.key = key;
      this.url = URL.createObjectURL(blob);
      const v = this.video;
      v.src = this.url;
      v.load();
      return new Promise(resolve => {
        const timer = setTimeout(() => resolve(v.readyState >= 2), 4000);
        v.addEventListener('loadeddata', () => { clearTimeout(timer); resolve(true); }, { once: true });
        v.addEventListener('error', () => { clearTimeout(timer); resolve(false); }, { once: true });
      });
    })();
  }

  play() {
    this.active = true;
    this.rewind();
    // Start in the same task as the result swap so the first frame is ready when the white lifts.
    try { const p = this.video.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* no media support */ }
  }

  stop() {
    this.active = false;
    this.video.pause();
    this.rewind();
  }
}
