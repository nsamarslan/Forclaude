/* Sahne efektleri: SVG sahnesinin üzerine çizilen parçacık katmanı ve kamera.
   Sahneler, SVG içine görünmez işaretçiler koyar:
     <circle data-fx="exhaust" data-fx-o='{"delay":1,"ground":384}'/>
   Motor her karede işaretçinin ekrandaki yerini okur (CSS/SMIL ile hareket
   etse bile), oradan parçacık üretir ve tuvale çizer. Koordinatlar ve hızlar
   sahne birimindedir (800x450 viewBox). */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FX = (window.FX = { enabled: !reduced });

  // ─── Paletler: parçacık ömrü boyunca soldan sağa geçilir
  const PAL = {
    fire: [[255, 255, 236], [255, 224, 132], [255, 158, 66], [224, 78, 36], [90, 54, 60]],
    thrust: [[255, 255, 255], [196, 224, 255], [255, 214, 156], [255, 140, 84]],
    smoke: [[252, 248, 242], [218, 218, 226], [176, 180, 196], [128, 134, 154]],
    moon: [[220, 218, 210], [176, 174, 166], [134, 132, 126]],
    mars: [[240, 166, 116], [204, 122, 76], [150, 82, 50]],
    venus: [[255, 222, 152], [226, 172, 92], [172, 112, 52]],
    earth: [[236, 230, 220], [196, 186, 176], [146, 136, 126]],
    hot: [[255, 255, 255], [214, 232, 255], [255, 222, 164], [255, 134, 92], [156, 74, 176], [64, 42, 116]],
    ion: [[244, 252, 255], [164, 218, 255], [104, 154, 255], [72, 92, 204]],
    gold: [[255, 250, 224], [255, 216, 124], [232, 160, 72]],
    ember: [[255, 242, 204], [255, 172, 84], [232, 92, 42]],
    white: [[255, 255, 255], [224, 234, 255], [180, 200, 255]],
    accretion: [[255, 252, 236], [255, 204, 124], [255, 134, 62], [204, 72, 42]],
    ice: [[255, 255, 255], [214, 236, 255], [170, 210, 255]],
    infall: [[150, 52, 36], [236, 112, 48], [255, 178, 92], [255, 232, 176], [255, 252, 240]],
  };
  const R = Math.random;
  const rn = (a, b) => a + R() * (b - a);
  const TAU = Math.PI * 2;

  // ─── Yumuşak nokta görüntüleri (renk başına bir kez çizilir)
  const sprites = new Map();
  function sprite(c) {
    const r = c[0] & 0xf0, g = c[1] & 0xf0, b = c[2] & 0xf0;
    const key = (r << 16) | (g << 8) | b;
    let s = sprites.get(key);
    if (s) return s;
    s = document.createElement('canvas');
    s.width = s.height = 64;
    const x = s.getContext('2d');
    const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${r | 15},${g | 15},${b | 15},1)`);
    gr.addColorStop(0.32, `rgba(${r | 15},${g | 15},${b | 15},0.6)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr;
    x.fillRect(0, 0, 64, 64);
    sprites.set(key, s);
    return s;
  }
  function palAt(p, f) {
    const n = p.length - 1;
    const x = Math.min(n - 1e-6, Math.max(0, f * n));
    const i = x | 0, t = x - i, a = p[i], b = p[i + 1];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  // ─── Durum
  let cam = null, cv = null, ctx = null, raf = 0, ro = null;
  let W = 0, H = 0, dpr = 1, k = 1, ox = 0, oy = 0, fadeX = null, fadeY = null;
  let t0 = 0, last = 0, parts = [], ems = [], shakes = [], flashes = [], max = 600;

  const vbx = (x) => ox + x * k;
  const vby = (y) => oy + y * k;

  function measure() {
    if (!cam || !cv) return;
    W = cam.clientWidth; H = cam.clientHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr));
    k = Math.min(W / 800, H / 450) || 1;
    ox = (W - 800 * k) / 2; oy = (H - 450 * k) / 2;
    fadeX = ctx.createLinearGradient(ox, 0, ox + 800 * k, 0);
    fadeX.addColorStop(0, 'rgba(0,0,0,0)'); fadeX.addColorStop(0.06, '#000'); fadeX.addColorStop(0.94, '#000'); fadeX.addColorStop(1, 'rgba(0,0,0,0)');
    fadeY = ctx.createLinearGradient(0, oy, 0, oy + 450 * k);
    fadeY.addColorStop(0, 'rgba(0,0,0,0)'); fadeY.addColorStop(0.04, '#000'); fadeY.addColorStop(0.9, '#000'); fadeY.addColorStop(1, 'rgba(0,0,0,0)');
  }

  function posOf(el) {
    const r = el.getBoundingClientRect(), c = cv.getBoundingClientRect();
    const s = c.width / W || 1;
    return [(r.left + r.width / 2 - c.left) / s, (r.top + r.height / 2 - c.top) / s];
  }

  function add(o) {
    if (parts.length >= max) return null;
    const p = Object.assign({ ax: 0, ay: 0, dr: 0, age: 0, a: 1, add: false, st: 0, fi: 0.12, ground: null }, o);
    parts.push(p);
    return p;
  }
  function dirv(deg, spread, sp) {
    const a = ((deg + rn(-spread, spread)) * Math.PI) / 180;
    return [Math.cos(a) * sp, Math.sin(a) * sp];
  }

  // ─── Yayıcı türleri: (e, x, y, t) → parçacık üretir
  const T = {
    exhaust(e, x, y) {
      const pw = e.power || 1, sz = e.size || 1, dir = e.dir == null ? 90 : e.dir;
      let [a, b] = dirv(dir, 6, rn(170, 280) * pw);
      add({ x: x + rn(-2, 2) * k, y, vx: a * k, vy: b * k, dr: 2.4, life: rn(0.16, 0.32), s0: 12 * k * sz, s1: 30 * k * sz, p: PAL.fire, a: 0.9, add: true });
      if (e.smoke === false) return;
      [a, b] = dirv(dir, 13, rn(80, 170) * pw);
      add({ x: x + rn(-4, 4) * k, y: y + 10 * k * sz, vx: a * k, vy: b * k, dr: 1.0, ay: -12 * k, life: rn(2.4, 4.4), s0: 16 * k * sz, s1: rn(70, 120) * k * sz, p: PAL.smoke, a: 0.42, fi: 0.04, ground: e.ground == null ? null : vby(e.ground) });
    },
    thrust(e, x, y) {
      const sz = e.size || 1, dir = e.dir == null ? 90 : e.dir;
      const [a, b] = dirv(dir, 10, rn(120, 220));
      add({ x, y, vx: a * k, vy: b * k, dr: 3, life: rn(0.1, 0.24), s0: 8 * k * sz, s1: 20 * k * sz, p: PAL.thrust, a: 0.85, add: true });
    },
    billow(e, x, y) {
      const sz = e.size || 1, side = R() < 0.5 ? -1 : 1;
      add({ x: x + rn(-20, 20) * k, y: y - rn(0, 8) * k, vx: side * rn(50, 160) * k * sz, vy: -rn(4, 26) * k, dr: 0.8, ay: -3 * k, life: rn(3, 5.5), s0: 28 * k * sz, s1: rn(110, 170) * k * sz, p: PAL.smoke, a: 0.45, fi: 0.05 });
    },
    dust(e, x, y) {
      const pw = e.power || 1, sz = e.size || 1, pal = PAL[e.world] || PAL.moon;
      const side = e.side || (R() < 0.5 ? -1 : 1);
      add({ x: x + rn(-10, 10) * k * sz, y: y - rn(0, 4) * k, vx: side * rn(40, 200) * pw * k, vy: -rn(8, 60) * pw * k, ay: (e.g || 70) * k, dr: 1.1, life: rn(0.9, 2.2), s0: 6 * k * sz, s1: rn(26, 50) * k * sz, p: pal, a: e.a || 0.4, fi: 0.06 });
    },
    trail(e, x, y) {
      const sz = e.size || 1;
      add({ x: x + rn(-2, 2) * k, y: y + rn(-2, 2) * k, vx: rn(-8, 8) * k, vy: rn(-8, 8) * k, dr: 1.5, life: rn(0.35, 0.9) * (e.life || 1), s0: 12 * k * sz, s1: 3 * k * sz, p: PAL[e.pal] || PAL.fire, a: e.a || 0.8, add: true });
    },
    stream(e) {
      const [fx, fy] = e.from, [tx, ty] = e.to;
      const dx = tx - fx, dy = ty - fy, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      const off = rn(-0.5, 0.5) * (e.width || 120), sp = (e.speed || 220) * rn(0.8, 1.2);
      add({ x: vbx(fx - uy * off), y: vby(fy + ux * off), vx: ux * sp * k, vy: uy * sp * k, life: (d / sp) * rn(0.75, 1.05), s0: 5 * k * (e.size || 1), s1: 3 * k * (e.size || 1), p: PAL[e.pal] || PAL.gold, a: e.a || 0.7, add: true, st: 0.035, fi: 0.08 });
    },
    drift(e) {
      const [x, y, w, h] = e.area || [0, 0, 800, 450];
      const sz = e.size || 1;
      add({ x: vbx(x + R() * w), y: vby(y + R() * h), vx: ((e.vx || 0) + rn(-6, 6)) * k, vy: ((e.vy || 0) + rn(-6, 6)) * k, life: rn(3, 6.5), s0: rn(2, 5) * k * sz, s1: rn(3, 8) * k * sz, p: PAL[e.pal] || PAL.white, a: e.a || 0.35, add: e.add !== false, fi: 0.3 });
    },
    vortex(e) {
      const th = R() * TAU, r = (e.r0 || 200) * rn(0.85, 1.05);
      add({ orb: { cx: e.cx, cy: e.cy, r, r0: r, th, w: (e.w || 0.9) * rn(0.8, 1.2), shrink: (e.shrink || 30) * rn(0.7, 1.3), tilt: e.tilt || 0.45, rmin: e.r1 || 70 }, heat: !!e.heat, hole: e.hole || null, x: 0, y: 0, vx: 0, vy: 0, life: 30, s0: rn(4, 9) * k * (e.size || 1), s1: rn(6, 12) * k * (e.size || 1), p: PAL[e.pal] || PAL.accretion, a: e.a || 0.75, add: true, fi: 0.04 });
    },
    tail(e, x, y) {
      const [sx, sy] = e.away || [400, 225];
      const ang = Math.atan2(y - vby(sy), x - vbx(sx));
      const sp = rn(28, 70);
      const ion = R() < 0.6;
      const a2 = ang + (ion ? rn(-0.05, 0.05) : rn(0.05, 0.35));
      add({ x: x + rn(-2, 2) * k, y: y + rn(-2, 2) * k, vx: Math.cos(a2) * sp * k, vy: Math.sin(a2) * sp * k, life: rn(1.2, 2.6), s0: 6 * k, s1: rn(16, 30) * k, p: ion ? PAL.ion : PAL.gold, a: ion ? 0.5 : 0.35, add: true, fi: 0.05 });
    },
  };

  // Tek seferlik (ya da e.every saniyede bir) patlamalar
  function burst(e, x, y) {
    const n = Math.min(e.count || 80, Math.max(20, max - parts.length));
    const pal = PAL[e.pal] || PAL.fire;
    for (let i = 0; i < n; i++) {
      const [a, b] = e.dir == null ? dirv(0, 180, rn(0.15, 1) * (e.speed || 200)) : dirv(e.dir, e.spread || 30, rn(0.3, 1) * (e.speed || 200));
      add({ x: x + rn(-3, 3) * k, y: y + rn(-3, 3) * k, vx: a * k, vy: b * k * (e.squash || 1), ay: (e.g || 0) * k, dr: e.drag == null ? 1.2 : e.drag, life: rn(0.5, 1) * (e.life || 1.4), s0: (e.size || 8) * k * rn(0.6, 1.3), s1: (e.size1 == null ? (e.size || 8) * 2.4 : e.size1) * k, p: pal, a: e.a || 0.85, add: e.add !== false, st: e.streak || 0, fi: 0.03 });
    }
  }
  function bigbang(e, x, y) {
    const n = Math.max(120, max - 60);
    for (let i = 0; i < n; i++) {
      const sp = Math.pow(R(), 0.6) * rn(60, 420);
      const [a, b] = dirv(0, 180, sp);
      add({ x, y, vx: a * k, vy: b * k * 0.72, dr: 0.55, life: rn(2.6, 6.5), s0: rn(4, 10) * k, s1: rn(1.5, 4) * k, p: PAL.hot, a: rn(0.6, 1), add: true, fi: 0.01 });
    }
  }
  function meteor(e) {
    const [x, y, w, h] = e.area || [0, 0, 800, 200];
    const left = R() < 0.5;
    const ang = left ? rn(140, 160) : rn(20, 40);
    const [a, b] = dirv(ang, 0, rn(380, 560));
    add({ x: vbx(x + rn(0.15, 0.85) * w), y: vby(y + rn(0, 0.4) * h), vx: a * k, vy: b * k, life: rn(0.35, 0.7), s0: 3.2 * k, s1: 2 * k, p: PAL.white, a: 0.95, add: true, st: 0.07, fi: 0.05 });
  }

  // ─── Döngü
  function loop(now) {
    if (!cv) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = (now - t0) / 1000;

    // Üretim
    for (const e of ems) {
      const on = t >= e.delay && t < e.delay + e.dur;
      if (e.type === 'light') { e.on = on; if (on) e.pos = posOf(e.el); continue; }
      if (!on) continue;
      if (e.type === 'burst' || e.type === 'bigbang') {
        if (!e.fired || (e.every && t >= e.next)) {
          e.fired = true; e.next = t + (e.every || 0);
          const [x, y] = posOf(e.el);
          (e.type === 'bigbang' ? bigbang : burst)(e, x, y);
        }
        continue;
      }
      if (e.type === 'meteors') {
        if (t >= (e.next || 0)) { meteor(e); e.next = t + rn(e.min || 0.8, e.max || 2.4); }
        continue;
      }
      if (e.type === 'ring' && !e.fired) {
        e.fired = true;
        for (let i = 0; i < (e.count || 140); i++) {
          add({ orb: { cx: e.cx, cy: e.cy, r: e.rx * rn(0.82, 1.12), th: R() * TAU, w: (e.w || 0.8) * rn(0.85, 1.15), shrink: 0, tilt: e.ry / e.rx, rmin: 0 }, x: 0, y: 0, vx: 0, vy: 0, life: e.life || 3, s0: rn(3, 7) * k, s1: rn(2, 5) * k, p: PAL[e.pal] || PAL.ember, a: 0.8, add: true, fi: 0.15 });
        }
        continue;
      }
      const fn = T[e.type];
      if (!fn) continue;
      e.acc += (e.rate || 50) * dt;
      if (e.acc < 1) continue;
      const needsPos = e.type !== 'stream' && e.type !== 'drift' && e.type !== 'vortex';
      const [x, y] = needsPos ? posOf(e.el) : [0, 0];
      while (e.acc >= 1) { e.acc -= 1; fn(e, x, y, t); }
    }

    // Güncelleme
    let j = 0;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.age += dt;
      if (p.age >= p.life) continue;
      if (p.orb) {
        const o = p.orb;
        o.th += o.w * dt * (o.shrink ? Math.pow(Math.max(1, (o.rmin * 2.2) / o.r), 0.9) : 1);
        o.r -= o.shrink * dt * (o.shrink ? Math.max(0.6, (o.rmin * 1.8) / o.r) : 1);
        if (o.shrink && o.r <= o.rmin) continue;
        if (p.heat) p.f = Math.min(1, Math.max(0, (o.r0 - o.r) / (o.r0 - o.rmin)));
        // Arka yarıdayken (yukarıda) gölgenin içine düşen parçacık görünmez
        if (p.hole) { const hx = Math.cos(o.th) * o.r + o.cx - p.hole[0], hy = Math.sin(o.th) * o.r * o.tilt + o.cy - p.hole[1]; p.hid = Math.sin(o.th) < 0 && hx * hx + hy * hy < p.hole[2] * p.hole[2]; }
        p.x = vbx(o.cx + Math.cos(o.th) * o.r);
        p.y = vby(o.cy + Math.sin(o.th) * o.r * o.tilt);
        p.vx = -Math.sin(o.th) * o.r * o.w * k; p.vy = Math.cos(o.th) * o.r * o.tilt * o.w * k;
      } else {
        if (p.dr) { const f = Math.max(0, 1 - p.dr * dt); p.vx *= f; p.vy *= f; }
        p.vx += p.ax * dt; p.vy += p.ay * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.ground !== null && p.y > p.ground && p.vy > 0) {
          const s = p.vx === 0 ? (R() < 0.5 ? -1 : 1) : Math.sign(p.vx);
          p.vx = s * (Math.abs(p.vx) + Math.abs(p.vy) * rn(0.7, 1.2));
          p.vy = -Math.abs(p.vy) * 0.06;
          p.y = p.ground;
        }
      }
      parts[j++] = p;
    }
    parts.length = j;

    // Çizim
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    drawPass(false);
    ctx.globalCompositeOperation = 'lighter';
    for (const e of ems) {
      if (e.type !== 'light' || !e.on || !e.pos) continue;
      const tt = t - e.delay, env = Math.min(1, tt / 0.25) * Math.min(1, (e.delay + e.dur - t) / 0.8);
      const sz = (e.size || 160) * k * (0.92 + Math.sin(t * 31) * 0.05 + Math.sin(t * 17) * 0.04);
      ctx.globalAlpha = Math.max(0, (e.a || 0.6) * env);
      ctx.drawImage(sprite(PAL[e.pal || 'ember'][1]), e.pos[0] - sz / 2, e.pos[1] - sz / 2 + (e.dy || 0) * k, sz, sz);
    }
    drawPass(true);
    for (const f of flashes) {
      const tt = t - f.delay;
      if (tt < 0 || tt > (f.dur || 0.7)) continue;
      const env = tt < 0.06 ? tt / 0.06 : 1 - (tt - 0.06) / ((f.dur || 0.7) - 0.06);
      ctx.globalAlpha = Math.max(0, env * (f.a || 0.55));
      ctx.fillStyle = f.color || '#fff6dc';
      ctx.fillRect(0, 0, W, H);
    }
    // Sahne kenarlarında yumuşak kaybolma
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = fadeX; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = fadeY; ctx.fillRect(0, 0, W, H);

    // Kamera: çok yavaş yaklaşma + sarsıntılar
    let sx = 0, sy = 0;
    for (const s of shakes) {
      const tt = t - s.delay;
      if (tt < 0 || tt > s.dur) continue;
      const env = Math.pow(1 - tt / s.dur, 1.6) * Math.min(1, tt / 0.08);
      const a = (s.amp || 3) * k * env;
      sx += (Math.sin(tt * 61) + Math.sin(tt * 37 + 1.3)) * 0.5 * a;
      sy += (Math.sin(tt * 53 + 0.7) + Math.sin(tt * 29 + 2.1)) * 0.5 * a;
    }
    const zoom = 1 + 0.022 * (0.5 - 0.5 * Math.cos((t * TAU) / 26));
    cam.style.transform = `translate3d(${sx.toFixed(2)}px,${sy.toFixed(2)}px,0) scale(${zoom.toFixed(4)})`;

    raf = requestAnimationFrame(loop);
  }

  function drawPass(additive) {
    for (const p of parts) {
      if (p.add !== additive || p.hid) continue;
      // heat: ilerleme yarıçaptan gelir; parçacık sona kadar parlak kalır, en içte söner
      const f = p.heat ? p.f || 0 : p.age / p.life;
      const a = p.a * (p.heat ? Math.min(1, f / 0.08, (1 - f) / 0.12) : f < p.fi ? f / p.fi : (1 - f) / (1 - p.fi));
      if (a <= 0.004) continue;
      const size = p.s0 + (p.s1 - p.s0) * f;
      const c = palAt(p.p, f);
      ctx.globalAlpha = Math.min(1, a);
      if (p.st) {
        ctx.strokeStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
        ctx.lineWidth = Math.max(0.6, size * 0.45);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * p.st, p.y - p.vy * p.st);
        ctx.stroke();
      } else {
        ctx.drawImage(sprite(c), p.x - size / 2, p.y - size / 2, size, size);
      }
    }
  }

  // ─── Dış arayüz
  FX.attach = function (shot) {
    FX.detach();
    if (!FX.enabled || !shot) return;
    cam = shot.querySelector('.cam');
    const svg = cam && cam.querySelector('svg');
    if (!svg) return;
    cv = document.createElement('canvas');
    cv.className = 'fx';
    cv.setAttribute('aria-hidden', 'true');
    cam.appendChild(cv);
    ctx = cv.getContext('2d');
    const small = Math.min(window.innerWidth, window.innerHeight) < 600 || (navigator.hardwareConcurrency || 8) <= 4;
    max = small ? 260 : 700;
    parts = []; ems = []; shakes = []; flashes = [];
    svg.querySelectorAll('[data-fx]').forEach((el) => {
      let o = {};
      try { o = JSON.parse(el.getAttribute('data-fx-o') || '{}'); } catch (e) { /* bozuk ayar */ }
      const ev = Object.assign({ type: el.getAttribute('data-fx'), el, delay: 0, dur: Infinity, acc: 0 }, o);
      if (ev.dur === null) ev.dur = Infinity;
      if (small && ev.rate) ev.rate *= 0.55;
      if (ev.type === 'shake') shakes.push(ev);
      else if (ev.type === 'flash') flashes.push(ev);
      else ems.push(ev);
    });
    measure();
    if (window.ResizeObserver) { ro = new ResizeObserver(measure); ro.observe(cam); }
    t0 = last = performance.now();
    raf = requestAnimationFrame(loop);
  };
  FX.detach = function () {
    cancelAnimationFrame(raf); raf = 0;
    if (ro) ro.disconnect();
    ro = null;
    if (cv) cv.remove();
    if (cam) cam.style.transform = '';
    cv = ctx = cam = null;
    parts = []; ems = []; shakes = []; flashes = [];
  };
  document.addEventListener('visibilitychange', () => {
    if (!cv) return;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
  });
})();
