/* 카드 연출 자리 — 지금은 단순판. 나중에 레퍼런스 수준 연출로 이 파일만 통째로 바꾼다.
   약속(바꿔도 지킬 것):
   - Reveal.enter(slotEls) → Promise : 뒷면 카드들 등장
   - Reveal.flip(slotEl, type) → Promise : 한 장 공개 (끝나면 slotEl에 .flipped)
   - Reveal.show(slotEl, type) : 연출 없이 공개 상태로 그리기 (새로 고침 복구용)
   slotEl 안에는 index.html이 만든 .card > .face.back / .face.front 가 있다. */
(function (root) {
  const ART = {
    A: { img: 'assets/lb/card-front-a.png', sd: 'assets/lb/sd-yeonhong.png' },
    B: { img: 'assets/lb/card-front-b.png', sd: 'assets/lb/sd-ragdoll.png' },
    C: { img: 'assets/lb/card-front-c.png', sd: 'assets/lb/sd-oracle.png' },
  };
  const reduced = () => root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 애니메이션이 화면 꺼짐·백그라운드 등으로 멈춰도 앱이 잠기지 않게 시간 제한을 둔다.
  function settle(anim, ms) {
    return Promise.race([anim.finished.catch(() => {}), new Promise((r) => setTimeout(r, ms))])
      .then(() => { try { anim.finish(); } catch (e) { /* 이미 끝남 */ } });
  }

  function fillFront(slot, type) {
    const a = ART[type];
    slot.dataset.type = type;
    slot.style.setProperty('--acc', `var(--${type})`);
    const f = slot.querySelector('.face.front');
    f.innerHTML = `<img class="frameimg" src="${a.img}" alt=""><div class="win"><img src="${a.sd}" alt=""></div>` +
      `<div class="letter">${type}</div><div class="name">LUCKY BAG ${type}</div>`;
  }

  function enter(slots) {
    if (reduced()) return Promise.resolve();
    return Promise.all(slots.map((s, i) => settle(s.animate(
      [{ transform: 'translateY(220px) scale(.55)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 520, delay: i * 140, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }), 520 + i * 140 + 400)));
  }

  function flip(slot, type) {
    fillFront(slot, type);
    const card = slot.querySelector('.card');
    if (reduced()) { slot.classList.add('flipped'); return Promise.resolve(); }
    const dur = 620;
    setTimeout(() => slot.classList.add('flipped'), dur / 2);
    return settle(card.animate(
      [{ transform: 'rotateY(0deg) scale(1)' }, { transform: 'rotateY(90deg) scale(1.06)', offset: 0.5 }, { transform: 'rotateY(180deg) scale(1)' }],
      { duration: dur, easing: 'ease-in-out' }), dur + 400).then(() => slot.classList.add('flipped'));
  }

  function show(slot, type) { fillFront(slot, type); slot.classList.add('flipped'); }

  root.Reveal = { enter, flip, show };
})(globalThis);
