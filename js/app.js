/* Uzay Kronolojisi: uygulama mantığı.
   Zaman yolculuğu geçişi, sürüklenebilir zaman çizgisi, konu turu,
   arama ve sınav. Veriler data/*.js, sahneler js/scenes-*.js içinde. */
(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── Veri
  const ERAS = window.ERAS;
  const TOPICS = window.TOPICS;
  const QS = window.QUESTIONS;
  const eraOrder = Object.fromEntries(ERAS.map((e, i) => [e.id, i]));
  const eraById = Object.fromEntries(ERAS.map((e) => [e.id, e]));
  const topicById = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
  const qByEvent = {};
  QS.forEach((q) => (qByEvent[q.e] = qByEvent[q.e] || []).push(q));
  Object.values(qByEvent).forEach((arr) => arr.sort((a, b) => b.k - a.k));
  const EVENTS = window.EVENTS
    .filter((e) => (qByEvent[e.id] || []).length)
    .sort((a, b) => eraOrder[a.era] - eraOrder[b.era] || a.year - b.year);
  const evIndex = Object.fromEntries(EVENTS.map((e, i) => [e.id, i]));
  const N = EVENTS.length;

  // ─── Yıl biçimi
  const nf = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 });
  function fmtYear(y) {
    if (y <= -1e9) return `${nf.format(-y / 1e9)} milyar yıl önce`;
    if (y <= -1e6) return `${nf.format(Math.round(-y / 1e6))} milyon yıl önce`;
    if (y <= -10000) return `${nf.format(Math.round(-y / 1000))} bin yıl önce`;
    if (y < 0) return `MÖ ${Math.round(-y)}`;
    return String(Math.floor(y));
  }
  window.fmtYear = fmtYear;
  const yearOf = (ev) => ev.yearLabel || fmtYear(ev.year);
  // Geniş zaman aralıklarında akıcı sayaç: log ölçekte ara değer
  const toT = (y) => -Math.log10(2200 - y);
  const fromT = (t) => 2200 - Math.pow(10, -t);

  // ─── Kişisel ilerleme (yalnızca bu tarayıcıda)
  const KEY = 'uzayKronolojisi.v1';
  let store = { p: {}, seen: {}, last: null, hide: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) store = Object.assign(store, JSON.parse(raw));
  } catch (e) { /* depolama yoksa da çalışır */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* yok say */ } };
  const mine = (q) => store.p[q.id];
  const mastered = (q) => (store.p[q.id] || [])[2] === 1;
  function record(q, ok) {
    const r = store.p[q.id] || [0, 0, 0];
    if (ok) r[0]++; else r[1]++;
    r[2] = ok ? 1 : 0;
    store.p[q.id] = r;
    save();
    updateMastery();
    updateTicks();
  }

  // ─── Arka plan: yıldız tarlası ve zaman bükülmesi
  const sky = (function () {
    const c = $('#sky');
    const ctx = c.getContext('2d');
    let W = 0, H = 0, stars = [], v = 0.0009, target = 0.0009, dir = 1, raf = 0, warpHue = null;
    let shoot = null, nextShoot = 4000;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = c.clientWidth; H = c.clientHeight;
      c.width = W * dpr; c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function reset(s, far) {
      s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1;
      s.z = far ? 1 : 0.02 + Math.random() * 0.98;
      s.pz = s.z; s.h = Math.random() < 0.2 ? 32 + Math.random() * 20 : Math.random() < 0.3 ? 210 : 230;
      s.c = Math.random() < 0.55;
    }
    function init() {
      const n = Math.round(clamp((W * H) / 2600, 180, 520));
      stars = Array.from({ length: n }, () => { const s = {}; reset(s); return s; });
    }
    function draw(ts) {
      ts = ts || 0;
      v += (target - v) * 0.06;
      const warp = v > 0.004;
      ctx.fillStyle = warp ? 'rgba(6,9,21,0.32)' : '#060915';
      ctx.fillRect(0, 0, W, H);
      if (!warp) {
        const g1 = ctx.createRadialGradient(W * 0.2, H * 0.25, 0, W * 0.2, H * 0.25, W * 0.5);
        g1.addColorStop(0, 'rgba(90,70,190,0.14)'); g1.addColorStop(1, 'rgba(90,70,190,0)');
        ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
        const g2 = ctx.createRadialGradient(W * 0.85, H * 0.8, 0, W * 0.85, H * 0.8, W * 0.45);
        g2.addColorStop(0, 'rgba(40,150,170,0.10)'); g2.addColorStop(1, 'rgba(40,150,170,0)');
        ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
      }
      const cx = W / 2, cy = H * 0.42, f = Math.max(W, H) * 0.55;
      for (const s of stars) {
        s.pz = s.z;
        s.z -= v * dir;
        if (s.z < 0.02) { reset(s, true); s.pz = s.z; }
        if (s.z > 1) { reset(s); s.z = 0.03; s.pz = s.z; }
        const x = cx + (s.x / s.z) * f * 0.35, y = cy + (s.y / s.z) * f * 0.35;
        if (x < -40 || x > W + 40 || y < -40 || y > H + 40) { reset(s, dir > 0); continue; }
        const r = (1 - s.z) * 1.9 + 0.2;
        const a = Math.min(1, (1 - s.z) * 1.3);
        if (warp) {
          const px = cx + (s.x / s.pz) * f * 0.35, py = cy + (s.y / s.pz) * f * 0.35;
          const hue = s.c && warpHue !== null ? warpHue : s.h;
          ctx.strokeStyle = `hsla(${hue},${s.c ? 90 : 70}%,${s.c ? 72 : 88}%,${a})`;
          ctx.lineWidth = r * 1.15;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
        } else {
          ctx.fillStyle = `hsla(${s.h},70%,90%,${a * 0.9})`;
          ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, 6.283); ctx.fill();
        }
      }
      // Kayan yıldız
      if (!warp && !reduced) {
        if (!shoot && ts > nextShoot) {
          const l = Math.random() < 0.5;
          shoot = { x: W * (0.15 + Math.random() * 0.7), y: H * (0.04 + Math.random() * 0.3), a: (l ? 155 : 25) * Math.PI / 180 + (Math.random() - 0.5) * 0.3, t: ts, d: 650 + Math.random() * 300 };
          nextShoot = ts + 7000 + Math.random() * 9000;
        }
        if (shoot) {
          const k = (ts - shoot.t) / shoot.d;
          if (k >= 1) shoot = null;
          else {
            const dist = k * Math.min(W, 900) * 0.5, len = 110 * Math.sin(Math.PI * k);
            const hx = shoot.x + Math.cos(shoot.a) * dist, hy = shoot.y + Math.sin(shoot.a) * dist;
            const gr = ctx.createLinearGradient(hx, hy, hx - Math.cos(shoot.a) * len, hy - Math.sin(shoot.a) * len);
            gr.addColorStop(0, `rgba(255,250,235,${0.9 * Math.sin(Math.PI * k)})`); gr.addColorStop(1, 'rgba(255,250,235,0)');
            ctx.strokeStyle = gr; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - Math.cos(shoot.a) * len, hy - Math.sin(shoot.a) * len); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    function start() { if (!raf) raf = requestAnimationFrame(draw); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    resize(); init();
    window.addEventListener('resize', () => { resize(); init(); });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    if (reduced) { target = v = 0; draw(); stop(); } else start();
    return {
      warp(d, ms = 1100, hue = null) {
        if (reduced) return;
        dir = d; target = 0.034; warpHue = hue;
        clearTimeout(this.t);
        this.t = setTimeout(() => { target = 0.0009; }, ms);
      },
    };
  })();

  const rootStyle = getComputedStyle(document.documentElement);
  function eraHue(id) {
    const hex = rootStyle.getPropertyValue(`--era-${id}`).trim().replace('#', '');
    if (hex.length !== 6) return null;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (!d) return 0;
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return Math.round(h * 60 + 360) % 360;
  }

  // ─── DOM
  const el = {
    stage: $('#stage'), viewport: $('#viewport'), scene: $('#scene'), info: $('#info'),
    year: $('#year'), eraName: $('#eraName'), title: $('#evTitle'), tint: $('#warpTint'),
    prev: $('#prevBtn'), next: $('#nextBtn'), play: $('#playBtn'),
    eraRow: $('#eraRow'), track: $('#track'), trackLeft: $('#trackLeft'), trackRight: $('#trackRight'),
    mastery: $('#mastery'), brandSub: $('#brandSub'),
    banner: $('#topicBanner'), topicName: $('#topicName'), topicCount: $('#topicCount'),
    search: $('#searchOverlay'), searchInput: $('#searchInput'), searchBody: $('#searchBody'),
    quiz: $('#quizOverlay'), quizBody: $('#quizBody'),
  };
  el.brandSub.textContent = `${QS.length} soru · ${N} durak`;

  let cur = -1;
  let topic = null; // etiket kimliği ya da 'custom'
  let custom = null; // { label, ids: Set }
  const inTopic = (ev) => (topic === 'custom' ? custom.ids.has(ev.id) : ev.tags.includes(topic));
  const topicLabel = () => (topic === 'custom' ? custom.label : topicById[topic].label);
  let sceneCleanup = null;
  let yearAnim = 0;
  let autoTimer = 0;

  // ─── Sahne
  function renderScene(ev, d = 1) {
    if (sceneCleanup) { try { sceneCleanup(); } catch (e) { /* yok say */ } sceneCleanup = null; }
    if (window.FX) window.FX.detach();
    const def = window.SCENES[ev.scene.type];
    let html = '';
    try {
      html = typeof def === 'function' ? def(ev.scene, ev) : def ? def.svg(ev.scene, ev) : '';
    } catch (e) {
      console.error('Sahne çizilemedi:', ev.id, e);
    }
    // Gökyüzü dolu sahnelerde rengi sahnenin çevresine hafifçe taşır, sahne kutu gibi durmaz
    const amb = ev.scene.type === 'atmosphere' ? '#2a4bb0' : { mars: '#b8532c', venus: '#c98d3a' }[ev.scene.world] || '';
    if (amb) el.viewport.style.setProperty('--amb', amb);
    el.viewport.classList.toggle('amb', !!amb);
    el.scene.innerHTML = `<div class="shot ${reduced ? '' : d > 0 ? 'enter-f' : 'enter-b'}"><div class="cam">${html}</div></div>`;
    const shot = el.scene.firstElementChild;
    if (def && def.run && !reduced) sceneCleanup = def.run(shot);
    if (window.FX) window.FX.attach(shot);
    const s = el.scene.querySelector('svg');
    if (s && reduced && s.pauseAnimations) s.pauseAnimations();
  }

  function setStamp(ev) {
    const era = eraById[ev.era];
    el.viewport.style.setProperty('--era-color', `var(--era-${ev.era})`);
    el.eraName.textContent = era.name;
    el.title.textContent = ev.title;
    el.year.textContent = yearOf(ev);
    el.year.classList.remove('travelling');
    document.title = `${ev.title} · Uzay Kronolojisi`;
  }

  function tweenYear(from, to, ms) {
    cancelAnimationFrame(yearAnim);
    const t0 = performance.now(), a = toT(from.year), b = toT(to.year);
    el.year.classList.add('travelling');
    const step = (now) => {
      const k = clamp((now - t0) / ms, 0, 1);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      el.year.textContent = fmtYear(fromT(a + (b - a) * e));
      if (k < 1) yearAnim = requestAnimationFrame(step);
      else {
        el.year.textContent = yearOf(to);
        el.year.classList.remove('travelling', 'lock');
        void el.year.offsetWidth;
        el.year.classList.add('lock');
      }
    };
    yearAnim = requestAnimationFrame(step);
  }

  // ─── Bilgi paneli
  function qItemHTML(q) {
    const hide = store.hide;
    const r = mine(q);
    const opts = q.o.map((o, i) => {
      const cls = `opt${i === q.a ? ' correct' : ''}`;
      return hide ? `<button class="${cls}" type="button" data-i="${i}">${esc(o)}</button>` : `<span class="${cls}">${esc(o)}</span>`;
    }).join('');
    const meta = [];
    if (q.k) meta.push(`<span${q.k >= 10 ? ' class="hot"' : ''}>oyunda ${q.k} kez çıktı${q.k >= 10 ? ' · sık' : ''}</span>`);
    if (q.b !== null && q.b !== undefined) meta.push(`<span>oyundaki başarın %${q.b}</span>`);
    if (r) meta.push(`<span class="${r[2] ? 'mine-ok' : 'mine-bad'}">burada: ${r[0]} doğru, ${r[1]} yanlış</span>`);
    return `<li class="qitem" id="q-${q.id}" data-q="${q.id}"><p class="qtext">${esc(q.q)}</p><div class="opts">${opts}</div>${meta.length ? `<div class="qmeta">${meta.join('')}</div>` : ''}${q.n ? `<div class="qnote">${esc(q.n)}</div>` : ''}</li>`;
  }

  function neighbour(i, d) {
    if (!topic) return clamp(i + d, 0, N - 1);
    for (let j = i + d; j >= 0 && j < N; j += d) if (inTopic(EVENTS[j])) return j;
    return i;
  }

  function renderInfo(ev, animate) {
    const i = evIndex[ev.id];
    const qs = qByEvent[ev.id] || [];
    const era = eraById[ev.era];
    const nxt = neighbour(i, 1);
    const tags = ev.tags.map((t) => `<button class="chip" type="button" data-topic="${t}" aria-pressed="${topic === t}">${esc(topicById[t].label)}</button>`).join('');
    let n = 0;
    const part = (html) => html.replace(/^<(\w+)/, `<$1 style="--i:${n++}"`);
    el.info.style.setProperty('--era-color', `var(--era-${ev.era})`);
    el.info.innerHTML = [
      part(`<div class="info-meta"><span class="dot"></span><span>${esc(era.name)}</span><span>·</span><span>Durak ${i + 1} / ${N}</span><span>·</span><span>${esc(yearOf(ev))}</span></div>`),
      part(`<p class="story">${esc(ev.story)}</p>`),
      ev.facts.length ? part('<h3>Bilmen gerekenler</h3>') : '',
      ev.facts.length ? part(`<ul class="facts">${ev.facts.map((f) => `<li>${md(f)}</li>`).join('')}</ul>`) : '',
      tags ? part(`<div class="chips" aria-label="Bu durağın konuları">${tags}</div>`) : '',
      part(`<h3>Bu duraktaki sorular · ${qs.length}</h3>`),
      part(`<div class="q-tools"><button class="btn" type="button" id="toggleAns">${store.hide ? 'Cevapları göster' : 'Cevapları gizle, kendimi deneyeyim'}</button><button class="btn btn-accent" type="button" id="quizHere">Bu durağı sına</button></div>`),
      part(`<ul class="qlist${store.hide ? ' hide-answers' : ''}" id="qlist">${qs.map(qItemHTML).join('')}</ul>`),
      nxt !== i ? part(`<button class="next-card" type="button" id="nextCard"><span class="k">Sıradaki durak${topic ? ' · ' + esc(topicLabel()) : ''}</span><span class="t">${esc(yearOf(EVENTS[nxt]))} · ${esc(EVENTS[nxt].title)}</span></button>`) : '',
    ].join('');
    el.info.classList.remove('arriving');
    if (animate && !reduced) { void el.info.offsetWidth; el.info.classList.add('arriving'); }
    el.info.scrollTop = 0;
  }

  el.info.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-topic]');
    if (chip) { setTopic(topic === chip.dataset.topic ? null : chip.dataset.topic); return; }
    if (e.target.closest('#toggleAns')) {
      store.hide = !store.hide; save();
      renderInfo(EVENTS[cur], false);
      return;
    }
    if (e.target.closest('#quizHere')) { openQuiz('here'); return; }
    if (e.target.closest('#nextCard')) { stopAuto(); go(neighbour(cur, 1)); return; }
    const opt = e.target.closest('button.opt');
    if (opt && store.hide) {
      const li = opt.closest('.qitem');
      if (li.dataset.done) return;
      const q = QS[+li.dataset.q];
      const ok = +opt.dataset.i === q.a;
      li.dataset.done = '1';
      if (!ok) opt.classList.add('wrong');
      li.querySelector('.opt.correct').classList.add('revealed');
      record(q, ok);
    }
  });

  // ─── Yolculuk
  function go(i, opts = {}) {
    i = clamp(i, 0, N - 1);
    if (i === cur && !opts.force) return;
    const from = cur >= 0 ? EVENTS[cur] : null;
    const to = EVENTS[i];
    const d = cur < 0 ? 1 : i >= cur ? 1 : -1;
    cur = i;
    store.last = to.id; store.seen[to.id] = 1; save();
    try { history.replaceState(null, '', '#' + to.id); } catch (e) { /* yok say */ }
    updateThumb();
    updateTicks();
    updateBanner();
    if (window.matchMedia('(max-width: 900px)').matches && el.stage.scrollTop > 40) el.stage.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });

    if (!from || opts.instant || reduced) {
      renderScene(to); setStamp(to); renderInfo(to, false);
      return;
    }
    const far = Math.abs(evIndex[from.id] - i) > 1 || eraOrder[from.era] !== eraOrder[to.era];
    const ms = far ? 1300 : 900;
    sky.warp(d, ms, eraHue(to.era));
    el.tint.classList.remove('on'); void el.tint.offsetWidth; el.tint.classList.add('on');
    el.eraName.textContent = eraById[to.era].name;
    el.viewport.style.setProperty('--era-color', `var(--era-${to.era})`);
    el.title.textContent = to.title;
    tweenYear(from, to, ms);
    const old = el.scene.querySelector('.shot');
    if (old) { old.classList.remove('enter-f', 'enter-b'); old.classList.add(d > 0 ? 'exit-f' : 'exit-b'); }
    clearTimeout(go.t);
    go.t = setTimeout(() => { renderScene(to, d); setStamp(to); }, Math.min(430, ms * 0.42));
    renderInfo(to, true);
  }

  el.prev.addEventListener('click', () => { stopAuto(); go(neighbour(cur, -1)); });
  el.next.addEventListener('click', () => { stopAuto(); go(neighbour(cur, 1)); });
  $('#homeBtn').addEventListener('click', () => { stopAuto(); setTopic(null); go(0); });

  // Kaydırma hareketi (sahnede sağa/sola)
  (function swipe() {
    let x0 = null, y0 = 0;
    el.scene.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; });
    el.scene.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) { stopAuto(); go(neighbour(cur, dx < 0 ? 1 : -1)); }
    });
  })();

  // Otomatik yolculuk
  function stopAuto() {
    clearInterval(autoTimer); autoTimer = 0;
    el.play.setAttribute('aria-pressed', 'false');
  }
  el.play.addEventListener('click', () => {
    if (autoTimer) { stopAuto(); return; }
    el.play.setAttribute('aria-pressed', 'true');
    autoTimer = setInterval(() => {
      const n = neighbour(cur, 1);
      if (n === cur) { stopAuto(); return; }
      go(n);
    }, 12000);
  });

  // ─── Zaman çizgisi
  const pos = (i) => ((i + 0.5) / N) * 100;
  function buildTimeline() {
    const eras = ERAS.filter((e) => EVENTS.some((v) => v.era === e.id));
    el.eraRow.innerHTML = eras.map((e) => `<button class="era-chip" type="button" data-era="${e.id}" style="--c:var(--era-${e.id})" title="${esc(e.span)}"><i></i>${esc(e.name)}</button>`).join('');
    let segs = '', ticks = '';
    eras.forEach((e) => {
      const idx = EVENTS.map((v, i) => (v.era === e.id ? i : -1)).filter((i) => i >= 0);
      const a = idx[0], b = idx[idx.length - 1];
      segs += `<div class="seg" style="--c:var(--era-${e.id});left:${(a / N) * 100}%;width:${((b - a + 1) / N) * 100}%"></div>`;
    });
    EVENTS.forEach((v, i) => { ticks += `<div class="tick" data-i="${i}" style="--c:var(--era-${v.era});left:${pos(i)}%"></div>`; });
    el.track.innerHTML = `${segs}${ticks}<div class="thumb" id="thumb"></div><div class="tip" id="tip" hidden></div>`;
    el.track.setAttribute('aria-valuemax', String(N));
    el.trackLeft.textContent = yearOf(EVENTS[0]);
    el.trackRight.textContent = yearOf([...EVENTS].reverse().find((v) => v.era !== 'yarin' || v.id === 'future') || EVENTS[N - 1]);
  }
  function updateThumb() {
    const th = $('#thumb');
    if (th) th.style.left = pos(cur) + '%';
    el.track.setAttribute('aria-valuenow', String(cur + 1));
    el.track.setAttribute('aria-valuetext', `${yearOf(EVENTS[cur])}: ${EVENTS[cur].title}`);
    $$('.era-chip', el.eraRow).forEach((b) => b.setAttribute('aria-current', String(b.dataset.era === EVENTS[cur].era)));
    const active = $(`.era-chip[data-era="${EVENTS[cur].era}"]`, el.eraRow);
    if (active && el.eraRow.scrollWidth > el.eraRow.clientWidth) {
      el.eraRow.scrollTo({ left: active.offsetLeft - el.eraRow.clientWidth / 2 + active.offsetWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
    }
  }
  function updateTicks() {
    $$('.tick', el.track).forEach((tk) => {
      const ev = EVENTS[+tk.dataset.i];
      const qs = qByEvent[ev.id];
      tk.classList.toggle('seen', !!store.seen[ev.id]);
      tk.classList.toggle('done', qs.every(mastered));
      tk.classList.toggle('topic', !!topic && inTopic(ev));
      tk.classList.toggle('dim', !!topic && !inTopic(ev));
    });
  }
  el.eraRow.addEventListener('click', (e) => {
    const b = e.target.closest('[data-era]');
    if (!b) return;
    stopAuto();
    let i = EVENTS.findIndex((v) => v.era === b.dataset.era && (!topic || inTopic(v)));
    if (i < 0) i = EVENTS.findIndex((v) => v.era === b.dataset.era);
    go(i);
  });
  (function drag() {
    const tip = () => $('#tip');
    let dragging = false, pending = -1;
    const idxAt = (clientX) => {
      const r = el.track.getBoundingClientRect();
      let i = clamp(Math.floor(((clientX - r.left) / r.width) * N), 0, N - 1);
      if (topic && !inTopic(EVENTS[i])) {
        let best = i, bd = Infinity;
        EVENTS.forEach((v, j) => { if (inTopic(v) && Math.abs(j - i) < bd) { bd = Math.abs(j - i); best = j; } });
        i = best;
      }
      return i;
    };
    const show = (i) => {
      const t = tip(), ev = EVENTS[i];
      t.hidden = false;
      t.innerHTML = `<span class="y">${esc(yearOf(ev))}</span>${esc(ev.title)}`;
      const r = el.track.getBoundingClientRect();
      const half = t.offsetWidth / 2;
      const x = clamp((pos(i) / 100) * r.width, half - 8, r.width - half + 8);
      t.style.left = x + 'px';
      $('#thumb').style.left = pos(i) + '%';
    };
    el.track.addEventListener('pointerdown', (e) => {
      dragging = true; stopAuto();
      el.track.setPointerCapture(e.pointerId);
      el.track.classList.add('dragging');
      pending = idxAt(e.clientX); show(pending);
    });
    el.track.addEventListener('pointermove', (e) => {
      if (dragging) { pending = idxAt(e.clientX); show(pending); return; }
      if (e.pointerType === 'mouse') show(idxAt(e.clientX));
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      el.track.classList.remove('dragging');
      tip().hidden = true;
      if (pending >= 0) go(pending, { force: pending !== cur });
      else updateThumb();
    };
    el.track.addEventListener('pointerup', end);
    el.track.addEventListener('pointercancel', end);
    el.track.addEventListener('pointerleave', () => { if (!dragging) { tip().hidden = true; updateThumb(); } });
    el.track.addEventListener('keydown', (e) => {
      const m = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1, PageDown: -10, PageUp: 10 };
      if (e.key in m) { e.preventDefault(); stopAuto(); go(topic ? neighbour(cur, Math.sign(m[e.key])) : cur + m[e.key]); }
      if (e.key === 'Home') { e.preventDefault(); go(0); }
      if (e.key === 'End') { e.preventDefault(); go(N - 1); }
    });
  })();

  function updateMastery() {
    const done = QS.filter(mastered).length;
    el.mastery.innerHTML = `öğrenilen <b>${done}</b> / ${QS.length}`;
  }

  // ─── Konu turu
  function setTopic(id, customDef) {
    if (id === 'custom' && customDef) { custom = customDef; topic = 'custom'; }
    else topic = id && topicById[id] ? id : null;
    updateBanner();
    updateTicks();
    if (topic && !inTopic(EVENTS[cur])) {
      const first = EVENTS.findIndex((v) => inTopic(v));
      if (first >= 0) { go(first); return; }
    }
    renderInfo(EVENTS[cur], false);
  }
  function updateBanner() {
    if (!topic) { el.banner.hidden = true; return; }
    const list = EVENTS.map((v, i) => (inTopic(v) ? i : -1)).filter((i) => i >= 0);
    const k = list.indexOf(cur);
    el.banner.hidden = false;
    el.topicName.textContent = topicLabel();
    el.topicCount.textContent = `${k >= 0 ? k + 1 : '–'} / ${list.length} durak · ${list.reduce((s, i) => s + qByEvent[EVENTS[i].id].length, 0)} soru`;
  }
  $('#topicClose').addEventListener('click', () => setTopic(null));

  // ─── Arama
  const FOLD = { ı: 'i', i: 'i', ş: 's', ğ: 'g', ü: 'u', ö: 'o', ç: 'c', â: 'a', î: 'i', û: 'u' };
  const norm = (s) => String(s).replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase().replace(/[ışğüöçâîû]/g, (c) => FOLD[c]).replace(/[^a-z0-9]+/g, ' ').trim();
  const SYN = { rover: ['gezgin'], gezgin: ['rover'], mekik: ['shuttle'], istasyon: ['iss', 'mir', 'salyut', 'skylab'], uydu: ['sputnik', 'turksat', 'starlink'], teleskop: ['teleskob', 'gozlemevi'], astronot: ['kozmonot', 'taykonot'], kaza: ['facia', 'patla', 'infilak', 'kayb'], ay: ['luna'], gunes: ['gunes'] };
  const index = {
    ev: EVENTS.map((e) => ({
      e, title: ' ' + norm(e.title), tags: ' ' + norm(e.tags.map((t) => topicById[t].label).join(' ')),
      body: ' ' + norm([e.story, e.facts.join(' '), yearOf(e), e.scene.name || ''].join(' ')),
    })),
    q: QS.map((q) => ({ q, text: ' ' + norm(q.q), ans: ' ' + norm(q.o[q.a]), opts: ' ' + norm(q.o.join(' ')) })),
    t: TOPICS.map((t) => ({ t, text: ' ' + norm(t.label + ' ' + t.id.replace(/-/g, ' ')) })),
  };
  const hit = (hay, tok) => (hay.includes(' ' + tok) ? 1 : (SYN[tok] || []).some((w) => hay.includes(' ' + w)) ? 0.5 : 0);
  function tokens(qs) { return norm(qs).split(' ').filter((w) => w.length > 1 || /\d/.test(w)); }
  function hlRegex(toks) {
    const cls = { i: '[iıİI]', s: '[sşSŞ]', g: '[gğGĞ]', u: '[uüUÜ]', o: '[oöOÖ]', c: '[cçCÇ]', a: '[aâAÂ]' };
    const parts = toks.map((w) => w.split('').map((ch) => cls[ch] || ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join(''));
    try { return new RegExp(`(?<![\\p{L}\\p{N}])(${parts.join('|')})`, 'giu'); } catch (e) { return null; }
  }
  const hl = (s, re) => (re ? esc(s).replace(re, '<mark>$1</mark>') : esc(s));

  function renderSearch() {
    const qv = el.searchInput.value;
    const toks = tokens(qv);
    if (!toks.length) {
      const counts = Object.fromEntries(TOPICS.map((t) => [t.id, EVENTS.filter((e) => e.tags.includes(t.id)).length]));
      el.searchBody.innerHTML = `<div class="res-group"><h4>Konuya göre gez</h4><div class="topic-grid">${TOPICS.filter((t) => counts[t.id]).map((t) => `<button class="chip" type="button" data-topic="${t.id}">${esc(t.label)}<span class="n">${counts[t.id]}</span></button>`).join('')}</div></div>
        <p class="empty">Bir konu seçince zaman çizgisi yalnızca o konunun duraklarını gösterir ve oklar o duraklar arasında gezdirir. Oyunda çıkan bir soruyu hızlıca bulmak için sorudan birkaç kelime yaz.</p>`;
      return;
    }
    const re = hlRegex(toks);
    const topics = index.t.filter((x) => toks.some((w) => hit(x.text, w) === 1));
    const evs = index.ev.map((x) => {
      let s = 0;
      for (const w of toks) {
        const a = hit(x.title, w) * 6, b = hit(x.tags, w) * 4, c = hit(x.body, w);
        if (!a && !b && !c) return null;
        s += a + b + c;
      }
      return { x, s };
    }).filter(Boolean).sort((a, b) => b.s - a.s || evIndex[a.x.e.id] - evIndex[b.x.e.id]);
    const top = evs.length ? evs[0].s : 0;
    const evShown = evs.filter((r) => r.s >= Math.max(2, top * 0.5)).slice(0, 14);
    const qs = index.q.map((x) => {
      let s = 0;
      for (const w of toks) {
        const a = hit(x.text, w) * 2, b = hit(x.ans, w) * 3, c = hit(x.opts, w);
        if (!a && !b && !c) return null;
        s += a + b + c;
      }
      return { x, s };
    }).filter(Boolean).sort((a, b) => b.s - a.s || b.x.q.k - a.x.q.k).slice(0, 40);
    let html = '';
    if (topics.length) html += `<div class="res-group"><h4>Konu turu başlat</h4><div class="topic-grid">${topics.map((x) => `<button class="chip" type="button" data-topic="${x.t.id}">${esc(x.t.label)}<span class="n">${EVENTS.filter((e) => e.tags.includes(x.t.id)).length} durak</span></button>`).join('')}</div></div>`;
    if (evShown.length) {
      const inOrder = evShown.slice().sort((a, b) => evIndex[a.x.e.id] - evIndex[b.x.e.id]);
      lastCustom = { label: `"${qv.trim()}" araması`, ids: new Set(inOrder.map((r) => r.x.e.id)) };
      html += `<div class="res-group"><h4>Duraklar · zaman sırasıyla${inOrder.length > 1 ? ` <button class="chip" type="button" data-custom style="margin-left:8px">Bu ${inOrder.length} durakla tur yap</button>` : ''}</h4><ul class="res-list">${inOrder.map(({ x }) => `<li><button class="res" type="button" data-ev="${x.e.id}"><span class="y">${esc(yearOf(x.e))} · ${esc(eraById[x.e.era].name)}</span><span class="t">${hl(x.e.title, re)}</span><span class="s">${hl(x.e.story.slice(0, 150), re)}${x.e.story.length > 150 ? '…' : ''}</span></button></li>`).join('')}</ul></div>`;
    }
    if (qs.length) html += `<div class="res-group"><h4>Sorular ve cevapları · ${qs.length}${qs.length === 40 ? '+' : ''}</h4><ul class="res-list">${qs.map(({ x }) => `<li><button class="res" type="button" data-q="${x.q.id}"><span class="s">${hl(x.q.q, re)}</span><span class="a">→ ${hl(x.q.o[x.q.a], re)}</span><span class="y">${esc(yearOf(EVENTS[evIndex[x.q.e]]))} · ${esc(EVENTS[evIndex[x.q.e]].title)}</span></button></li>`).join('')}</ul></div>`;
    el.searchBody.innerHTML = html || `<p class="empty">"${esc(qv)}" için bir şey bulunamadı. Daha kısa bir kelime dene (örneğin "venera" yerine "vener").</p>`;
  }
  let lastCustom = null;
  el.searchInput.addEventListener('input', renderSearch);
  el.searchBody.addEventListener('click', (e) => {
    const t = e.target.closest('[data-topic]');
    if (t) { closeOverlay(el.search); stopAuto(); setTopic(t.dataset.topic); return; }
    if (e.target.closest('[data-custom]') && lastCustom) { closeOverlay(el.search); stopAuto(); setTopic('custom', lastCustom); return; }
    const ev = e.target.closest('[data-ev]');
    if (ev) { closeOverlay(el.search); stopAuto(); go(evIndex[ev.dataset.ev]); return; }
    const q = e.target.closest('[data-q]');
    if (q) {
      const qq = QS[+q.dataset.q];
      closeOverlay(el.search); stopAuto();
      if (topic && !inTopic(EVENTS[evIndex[qq.e]])) setTopic(null);
      go(evIndex[qq.e]);
      setTimeout(() => {
        const li = document.getElementById('q-' + qq.id);
        if (!li) return;
        li.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        li.classList.remove('hl'); void li.offsetWidth; li.classList.add('hl');
      }, reduced ? 0 : 700);
    }
  });

  // ─── Katman aç/kapa
  let lastFocus = null;
  function openOverlay(ov) {
    lastFocus = document.activeElement;
    ov.hidden = false;
    stopAuto();
  }
  function closeOverlay(ov) {
    ov.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  [el.search, el.quiz].forEach((ov) => {
    ov.addEventListener('click', (e) => { if (e.target === ov || e.target.closest('[data-close]')) closeOverlay(ov); });
  });
  $('#searchBtn').addEventListener('click', () => { openOverlay(el.search); renderSearch(); el.searchInput.focus(); el.searchInput.select(); });
  $('#quizBtn').addEventListener('click', () => openQuiz(null));

  // ─── Sınav
  const quiz = { scope: 'here', list: [], i: 0, right: 0, answered: false };
  const SCOPES = [
    { id: 'here', label: 'Bu durak' },
    { id: 'era', label: 'Bu dönem' },
    { id: 'topic', label: 'Konu turu' },
    { id: 'hot', label: 'Oyunda sık çıkanlar' },
    { id: 'new', label: 'Hiç çözmediklerim' },
    { id: 'wrong', label: 'Yanlışlarım' },
    { id: 'all', label: 'Tüm sorular' },
  ];
  function pool(scope) {
    const ev = EVENTS[cur];
    switch (scope) {
      case 'here': return qByEvent[ev.id].slice();
      case 'era': return QS.filter((q) => EVENTS[evIndex[q.e]] && EVENTS[evIndex[q.e]].era === ev.era);
      case 'topic': return topic ? QS.filter((q) => EVENTS[evIndex[q.e]] && inTopic(EVENTS[evIndex[q.e]])) : [];
      case 'hot': return QS.filter((q) => q.k >= 7);
      case 'new': return QS.filter((q) => !mine(q));
      case 'wrong': return QS.filter((q) => mine(q) && mine(q)[2] === 0);
      default: return QS.slice();
    }
  }
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function openQuiz(scope) {
    if (!el.quiz.hidden && !scope) return;
    if (el.quiz.hidden) openOverlay(el.quiz);
    startQuiz(scope || (topic ? 'topic' : 'here'));
  }
  function startQuiz(scope) {
    quiz.scope = scope;
    const p = shuffle(pool(scope));
    // Önce yanlışlar ve hiç görülmeyenler
    p.sort((a, b) => ((mine(a) ? (mine(a)[2] ? 2 : 0) : 1) - (mine(b) ? (mine(b)[2] ? 2 : 0) : 1)));
    quiz.list = p.slice(0, scope === 'here' ? 30 : 20).map((q) => ({ q, order: shuffle(q.o.map((_, i) => i)) }));
    quiz.i = 0; quiz.right = 0; quiz.answered = false;
    renderQuiz();
  }
  function scopeChips() {
    return `<div class="quiz-scopes" role="group" aria-label="Soru kapsamı">${SCOPES.filter((s) => s.id !== 'topic' || topic).map((s) => {
      const n = pool(s.id).length;
      const label = s.id === 'topic' ? `Konu: ${topicLabel()}` : s.id === 'era' ? `Dönem: ${eraById[EVENTS[cur].era].name}` : s.label;
      return `<button class="chip" type="button" data-scope="${s.id}" aria-pressed="${quiz.scope === s.id}" ${n ? '' : 'disabled'}>${esc(label)}<span class="n">${n}</span></button>`;
    }).join('')}</div>`;
  }
  function renderQuiz() {
    const L = quiz.list;
    if (!L.length) {
      el.quizBody.innerHTML = `${scopeChips()}<p class="empty">Bu kapsamda soru yok. Başka bir kapsam seç.</p>`;
      return;
    }
    if (quiz.i >= L.length) {
      const pct = Math.round((quiz.right / L.length) * 100);
      el.quizBody.innerHTML = `${scopeChips()}<div class="quiz-done"><div class="big">${quiz.right} / ${L.length}</div><p class="empty">%${pct} doğru. Yanlışların "Yanlışlarım" kapsamında seni bekliyor.</p><div class="quiz-actions"><button class="btn btn-accent" type="button" data-again>Yeni tur</button></div></div>`;
      return;
    }
    const { q, order } = L[quiz.i];
    const ev = EVENTS[evIndex[q.e]];
    el.quizBody.innerHTML = `${scopeChips()}<div class="quiz-card">
      <div class="quiz-progress"><span>Soru ${quiz.i + 1} / ${L.length}</span><span>${quiz.right} doğru</span></div>
      <div class="quiz-bar"><i style="width:${(quiz.i / L.length) * 100}%"></i></div>
      <p class="quiz-q">${esc(q.q)}</p>
      <div class="quiz-opts">${order.map((oi, k) => `<button class="quiz-opt" type="button" data-oi="${oi}"><span class="k">${k + 1}</span><span>${esc(q.o[oi])}</span></button>`).join('')}</div>
      <div class="quiz-feedback" id="quizFb" aria-live="polite"></div>
      <div class="quiz-actions" id="quizAct" hidden><button class="btn btn-accent" type="button" data-next>Sonraki</button><button class="btn" type="button" data-goto="${ev.id}">Durağa git: ${esc(yearOf(ev))} · ${esc(ev.title)}</button></div>
    </div>`;
    quiz.answered = false;
  }
  function answer(oi) {
    if (quiz.answered) return;
    quiz.answered = true;
    const { q } = quiz.list[quiz.i];
    const ok = oi === q.a;
    if (ok) quiz.right++;
    record(q, ok);
    $$('.quiz-opt', el.quizBody).forEach((b) => {
      const v = +b.dataset.oi;
      b.disabled = true;
      if (v === q.a) b.classList.add('correct');
      else if (v === oi) b.classList.add('wrong');
    });
    $('#quizFb').innerHTML = `${ok ? '<span class="ok">Doğru.</span>' : `<span class="bad">Yanlış.</span> Cevap: <b>${esc(q.o[q.a])}</b>`}${q.n ? `<div class="qnote">${esc(q.n)}</div>` : ''}`;
    $('#quizAct').hidden = false;
    $('[data-next]', el.quizBody).focus();
  }
  el.quizBody.addEventListener('click', (e) => {
    const s = e.target.closest('[data-scope]');
    if (s) { startQuiz(s.dataset.scope); return; }
    const o = e.target.closest('[data-oi]');
    if (o) { answer(+o.dataset.oi); return; }
    if (e.target.closest('[data-next]')) { quiz.i++; renderQuiz(); return; }
    if (e.target.closest('[data-again]')) { startQuiz(quiz.scope); return; }
    const g = e.target.closest('[data-goto]');
    if (g) {
      closeOverlay(el.quiz);
      if (topic && !inTopic(EVENTS[evIndex[g.dataset.goto]])) setTopic(null);
      go(evIndex[g.dataset.goto]);
    }
  });

  // ─── Klavye
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (e.key === 'Escape') {
      if (!el.quiz.hidden) closeOverlay(el.quiz);
      else if (!el.search.hidden) closeOverlay(el.search);
      return;
    }
    if (!el.quiz.hidden) {
      if (/^[1-4]$/.test(e.key) && !quiz.answered) {
        const b = $$('.quiz-opt', el.quizBody)[+e.key - 1];
        if (b) answer(+b.dataset.oi);
      } else if (e.key === 'Enter' && quiz.answered && !e.target.closest('button[data-goto]')) {
        e.preventDefault(); quiz.i++; renderQuiz();
      }
      return;
    }
    if (!el.search.hidden || typing) return;
    if (e.key === '/') { e.preventDefault(); $('#searchBtn').click(); }
    if (document.activeElement === el.track) return;
    if (e.key === 'ArrowRight') { stopAuto(); go(neighbour(cur, 1)); }
    if (e.key === 'ArrowLeft') { stopAuto(); go(neighbour(cur, -1)); }
  });

  // Hata ayıklama ve bağlantı için küçük bir kapı
  window.UzayKronolojisi = { go: (id) => go(evIndex[id]), events: EVENTS, questions: QS };

  // ─── Başlat
  buildTimeline();
  updateMastery();
  const fromHash = location.hash.replace('#', '');
  const start = evIndex[fromHash] !== undefined ? evIndex[fromHash] : store.last && evIndex[store.last] !== undefined ? evIndex[store.last] : 0;
  go(start, { instant: true });
})();
