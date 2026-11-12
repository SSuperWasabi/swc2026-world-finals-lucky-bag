/* 화면 전환 (AE 01_Transition, TRANS_ASIA 알파 시퀀스) — 화면이 완전히 가려진 순간 다음 화면으로 바꾼다.

   iPad Safari는 H.264 영상에 투명도(알파)가 없어서, 전환 그림을 두 장으로 나눠 쓴다:
     색   = 검은 바탕 위의 전환 그림(이미 투명도가 곱해진 색)
     가림 = 1 - 투명도 (흰 곳 = 뒤 화면이 보이는 곳)
   화면에 나와야 하는 결과는  뒤 화면 × 가림 + 색  이다.

   방식 2가지:
   · 'gl'(기본): 색·가림을 위아래로 붙인 영상 1개(transition-stack.mp4)를 틀고, 프레임마다 WebGL로 "색 + 투명도"를 계산해
     투명한 캔버스에 그린다. 브라우저의 겹침 합성(mix-blend-mode)을 쓰지 않는다.
     → v37까지의 'css' 방식은 iPad에서 색 영상이 합성되지 않고 검은 바탕째 덮여, 전환 시작·끝에 화면이 검게 보였다(11-11 실기기 녹화).
   · 'css'(예비): 영상 2개를 곱하기(multiply)·더하기(plus-lighter)로 겹친다. WebGL을 못 쓰거나 관리자에서 끄면 이쪽으로 돈다.

   관리자 스위치가 꺼져 있으면 동작을 바로 실행한다. */
class ScreenTransition {
  constructor(matte, colour, shield, opts) {
    opts = opts || {};
    this.matte = matte;
    this.colour = colour;
    this.shield = shield;
    this.stack = opts.stack || null;
    this.canvas = opts.canvas || null;
    this.onMark = null;
    // 1.8배속(사용자 결정)은 파일에 들어 있다: 61프레임 전부, 초당 54장.
    // 11~48프레임 동안 화면이 완전히 가려진다(알파 >= 254).
    this.coverAt = 13 / 54;
    this.revealAt = 48 / 54;
    this.busy = false;
    this.revealed = [];
    this.warmed = false;
    this.mode = 'css';
    this.glError = '';
    if (opts.mode !== 'css' && this.stack && this.canvas && this.initGL()) this.mode = 'gl';
    this.useMode();
  }

  // 지금 방식에서 쓰는 영상만 올린다(안 쓰는 쪽 영상은 내려서 메모리를 잡지 않는다)
  useMode() {
    this.videos = this.mode === 'gl' ? [this.stack] : [this.matte, this.colour].filter(Boolean);
    this.clock = this.mode === 'gl' ? this.stack : this.colour;
    for (const v of [this.matte, this.colour, this.stack]) {
      if (!v) continue;
      if (this.videos.includes(v)) { if (!v.getAttribute('src') && v.dataset.src) { v.src = v.dataset.src; v.load(); } }
      else if (v.getAttribute('src')) { v.pause(); v.classList.remove('is-active'); v.removeAttribute('src'); v.load(); }
    }
    this.available = this.mode === 'gl' ? true : !!(this.matte && this.colour);
  }

  // 관리자 화면에서 방식을 바꾼다('gl' = 직접 합성, 'css' = 예비). 바꾸지 못하면 false.
  setMode(mode) {
    if (this.busy) return false;
    this.rewind();
    if (mode === 'gl') {
      if (!(this.stack && this.canvas && (this.gl || this.initGL()))) return false;
      this.mode = 'gl';
    } else {
      this.mode = 'css';
      if (this.canvas) this.canvas.classList.remove('is-active');
    }
    this.useMode();
    this.warm();
    return true;
  }

  mark(label) { if (this.onMark) { try { this.onMark(label); } catch (e) { /* 진단은 실패해도 무시 */ } } }

  /* ── WebGL: 영상 한 장(위 = 색, 아래 = 가림)을 읽어 "색 + 투명도"로 그린다 ── */
  initGL() {
    try {
      const gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false });
      if (!gl) { this.glError = 'WebGL 없음'; return false; }
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || '셰이더 오류'); return s; };
      const prog = gl.createProgram();
      // 화면 좌표 → 영상 좌표(위가 0). 꼭짓점 4개로 화면 전체를 덮는다.
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 p;varying vec2 uv;void main(){uv=vec2((p.x+1.0)*0.5,(1.0-p.y)*0.5);gl_Position=vec4(p,0.0,1.0);}'));
      // 위 절반 = 색, 아래 절반 = 가림. 두 절반의 경계가 섞이지 않게 반 픽셀(e) 안쪽에서만 읽는다.
      // 가림은 양 끝을 살짝 잘라(0.03~0.97) "완전히 투명"과 "완전히 가림"이 정확히 나오게 한다.
      // 내보내는 색은 투명도가 곱해진 색이어야 하므로 투명도보다 밝지 않게 누른다(투명한 곳에 색이 남지 않는다).
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, 'precision mediump float;varying vec2 uv;uniform sampler2D t;uniform float e;void main(){' +
        'vec3 c=texture2D(t,vec2(uv.x,clamp(uv.y*0.5,e,0.5-e))).rgb;' +
        'float m=smoothstep(0.03,0.97,texture2D(t,vec2(uv.x,clamp(0.5+uv.y*0.5,0.5+e,1.0-e))).g);' +
        'float a=1.0-m;gl_FragColor=vec4(min(c,vec3(a)),a);}'));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || '프로그램 오류');
      gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(gl.getUniformLocation(prog, 't'), 0);
      gl.uniform1f(gl.getUniformLocation(prog, 'e'), 0.5 / 2048);
      gl.disable(gl.BLEND); gl.clearColor(0, 0, 0, 0);
      this.gl = gl;
      if (!this.glListening) {
        this.glListening = true;
        this.canvas.addEventListener('webglcontextlost', (ev) => { ev.preventDefault(); this.fallback('WebGL이 끊김'); });
        // 앱이 뒤로 갔다 오면 WebGL이 끊겼다가 돌아올 수 있다 → 돌아오면 다시 직접 합성으로
        this.canvas.addEventListener('webglcontextrestored', () => { if (this.setMode('gl')) this.mark('전환: 직접 합성으로 돌아옴'); });
      }
      return true;
    } catch (e) { this.glError = String((e && e.message) || e); return false; }
  }

  // 지금 영상 프레임을 캔버스에 그린다. 그리지 못하면 false.
  draw() {
    const gl = this.gl, v = this.stack;
    if (!gl || v.readyState < 2) return false;
    try {
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v);
      gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return true;
    } catch (e) { this.fallback('그리기 실패: ' + (e && e.message)); return false; }
  }
  wipe() { if (this.gl) { try { this.gl.clear(this.gl.COLOR_BUFFER_BIT); } catch (e) { /* 무시 */ } } }

  // WebGL을 못 쓰게 되면 예전 방식으로 내려간다(전환이 아예 안 나오는 일은 없게)
  fallback(why) {
    if (this.mode !== 'gl') return;
    this.mode = 'css'; this.gl = null; this.glError = why;
    if (this.canvas) this.canvas.classList.remove('is-active');
    this.mark('전환: 예비 방식으로 바꿈 (' + why + ')');
    this.useMode();
  }

  // 영상을 메모리에 올리고 해독기를 한 번 돌려 둔다 → 첫 전환이 이미 해독된 프레임에서 시작한다.
  async warm() {
    const mode = this.mode;
    await Promise.all(this.videos.map(async v => {
      try {
        const response = await fetch(v.dataset.src || v.getAttribute('src'));
        if (response.ok) { const url = URL.createObjectURL(await response.blob()); if (!this.busy && this.mode === mode) { v.src = url; v.load(); } }
      } catch (e) { /* 원래 주소로 재생 */ }
    }));
    if (this.busy || this.mode !== mode) return;
    try { await Promise.all(this.videos.map(v => v.play())); } catch (e) { /* 자동 재생이 막힘: 첫 전환 때 시작 */ }
    if (this.mode === 'gl' && !this.busy) { const ok = this.draw(); this.wipe(); this.mark('전환 준비: 직접 합성 ' + (ok ? '그리기 확인' : '아직 프레임 없음')); }
    if (!this.busy) this.rewind();
    this.warmed = true;
  }

  rewind() {
    for (const v of this.videos) { v.pause(); try { if (v.currentTime !== 0) v.currentTime = 0; } catch (e) { /* 아직 되감을 수 없음 */ } }
  }

  show(on) {
    if (this.mode === 'gl') { this.canvas.classList.toggle('is-active', on); if (!on) this.wipe(); }
    else for (const v of this.videos) v.classList.toggle('is-active', on);
    if (this.shield) this.shield.classList.toggle('is-active', on);
  }

  // 화면이 완전히 가려졌을 때 fn을 실행한다. afterReveal()로 맡긴 일은 가림이 걷히기 시작할 때 실행된다.
  run(fn) {
    if (!this.available || this.busy) { fn(); return; }
    this.busy = true;
    const clock = this.clock, mode = this.mode;
    let covered = false, revealed = false, done = false, drawn = 0, lastT = -1;
    const cover = () => { if (covered) return; covered = true; try { fn(); } catch (e) { console.warn('전환 중 동작 실패', e); } };
    const reveal = () => { if (revealed) return; revealed = true; this.revealed.splice(0).forEach(cb => { try { cb(); } catch (e) { /* 다음 */ } }); };
    const finish = () => {
      if (done) return; done = true;
      cover(); reveal();
      clearTimeout(watchdog);
      const t1 = performance.now();
      this.show(false);
      const t2 = performance.now();
      // 지금 되감아 둔다 → 다음 전환이 되감기 없이 바로 시작한다.
      this.rewind();
      const t3 = performance.now();
      this.busy = false;
      this.mark(`전환 정리(${mode === 'gl' ? `직접 합성 · 그림 ${drawn}장` : '예비'}): 숨김 ${Math.round(t2 - t1)}ms · 되감기 ${Math.round(t3 - t2)}ms`);
    };
    // 영상이 멈춰도 화면 이동은 반드시 끝낸다(행사장에서 앱이 갇히지 않게).
    const watchdog = setTimeout(finish, 4000);
    // 화면을 바꾸는 시점은 영상 시각으로 정한다. 직접 합성 방식은 프레임마다 그리기도 여기서 한다.
    const tick = (now, meta) => {
      if (done) return;
      if (this.mode !== mode) { finish(); return; }   // 도중에 예비 방식으로 내려갔으면 이번 전환은 바로 끝낸다
      const t = meta ? meta.mediaTime : clock.currentTime;
      if (mode === 'gl' && t !== lastT) { lastT = t; if (this.draw()) drawn++; }   // 영상이 다음 장으로 넘어갔을 때만 다시 그린다
      if (t >= this.coverAt) cover();
      if (t >= this.revealAt) reveal();
      if (!clock.ended) this.nextFrame(mode, clock, tick);
    };
    clock.onended = finish;
    if (this.videos.some(v => v.currentTime !== 0)) this.rewind();
    if (mode === 'gl') this.draw();   // 첫 프레임(전부 투명)을 먼저 그려 둔 뒤 보이게 한다
    this.show(true);
    Promise.resolve().then(() => Promise.all(this.videos.map(v => v.play()))).then(() => this.nextFrame(mode, clock, tick), finish);
  }

  // 직접 합성: 화면을 그릴 차례마다(rAF) 부른다 — 영상이 화면에 보이지 않아도 반드시 불린다.
  // 예비: 영상의 새 프레임마다 부른다(지원하지 않으면 rAF).
  nextFrame(mode, video, cb) {
    if (mode !== 'gl' && typeof video.requestVideoFrameCallback === 'function') video.requestVideoFrameCallback(cb);
    else requestAnimationFrame(() => cb(performance.now(), null));
  }

  // 다음 화면의 등장 동작을 가림이 걷힐 때로 미룬다(전환 중이 아니면 바로 실행).
  afterReveal(cb) { if (this.busy) this.revealed.push(cb); else cb(); }
}
