/* Sahneler (1/2): Kozmik başlangıç, antik gökyüzü ve bilim insanları. */
(function () {
  'use strict';
  const P = window.ScenePart;
  const S = (window.SCENES = window.SCENES || {});
  const { svg, t, spin, stars, planet, fx } = P;
  const fxOn = () => !!(window.FX && window.FX.enabled);
  const cos = Math.cos, sin = Math.sin, PI = Math.PI;

  // ─── Kozmik
  S.bigbang = function () {
    const R = P.rng(21);
    let parts = '';
    const cols = ['#fff', '#ffe7a8', '#9fd0ff', '#ffb38a', '#c9b6ff'];
    for (let i = 0; i < (fxOn() ? 40 : 110); i++) {
      const a = R() * 2 * PI, d = 120 + R() * 360;
      parts += `<g transform="translate(400,225)"><circle r="${(1 + R() * 2.4).toFixed(1)}" fill="${cols[i % 5]}" class="move" style="--fx:0px;--fy:0px;--tx:${(cos(a) * d).toFixed(0)}px;--ty:${(sin(a) * d * 0.7).toFixed(0)}px;--fo:1;--to:${(0.3 + R() * 0.7).toFixed(2)};--dur:${(2.4 + R() * 2).toFixed(1)}s;--d:.35s"/></g>`;
    }
    let gal = '';
    for (let i = 0; i < 7; i++) {
      const x = 80 + R() * 640, y = 50 + R() * 350, r = 10 + R() * 16;
      gal += `<g transform="translate(${x.toFixed(0)},${y.toFixed(0)}) rotate(${(R() * 180).toFixed(0)})"><g class="fade" style="--d:${(2.6 + R() * 1.5).toFixed(1)}s"><ellipse rx="${r}" ry="${(r * 0.38).toFixed(1)}" fill="#c9b6ff" opacity=".35" filter="url(#f-soft)"/><ellipse rx="${(r * 0.3).toFixed(1)}" ry="${(r * 0.15).toFixed(1)}" fill="#fff" opacity=".85"/></g></g>`;
    }
    return svg(`<g transform="translate(400,225)"><circle r="160" fill="url(#g-glow)" class="flash" style="--dur:2.6s"/><circle r="40" fill="#fff" class="flash" style="--dur:1.2s"/>${[0, 1, 2].map((i) => `<circle r="60" fill="none" stroke="#fff4d8" stroke-width="${3 - i}" class="ripple" style="--s:${6 + i * 2};--dur:${2.2 + i * 0.6}s;--d:${0.15 + i * 0.25}s;animation-iteration-count:1;animation-fill-mode:both"/>`).join('')}${fx('bigbang', { delay: 0.15 })}${fx('burst', { delay: 0.15, count: 60, speed: 520, pal: 'white', life: 0.9, streak: 0.05, size: 4, size1: 2, drag: 0.4 })}${fx('flash', { delay: 0.1, dur: 1.1, a: 0.7 })}${fx('shake', { delay: 0.1, dur: 1.4, amp: 6 })}</g>${parts}${gal}${t(400, 430, 'Uzay, zaman, madde ve enerji aynı anda doğdu', 'lbl-s', 'text-anchor="middle"')}`);
  };

  S.starlife = function () {
    const y = 200;
    const st = [
      { x: 70, n: 'Bulutsu', g: '<g filter="url(#f-soft)"><ellipse rx="44" ry="26" fill="#8f6cff" opacity=".35"/><ellipse cx="14" cy="-6" rx="26" ry="16" fill="#ff7ab8" opacity=".35"/><ellipse cx="-12" cy="8" rx="22" ry="12" fill="#6ac8ff" opacity=".3"/></g><circle r="3" fill="#fff" class="twinkle"/>' },
      { x: 210, n: 'Anakol yıldızı', g: '<circle r="44" fill="url(#g-glow)"/><circle r="18" fill="url(#g-sun)"/>' },
      { x: 360, n: 'Kırmızı dev', g: '<circle r="70" fill="#ff6a3d" opacity=".18" filter="url(#f-soft)"/><circle r="46" fill="#ff7a3d" opacity=".9" class="pulse" style="--s:1.05"/>' },
      { x: 520, n: 'Süpernova', g: '<circle r="60" fill="url(#g-wglow)" class="pulse" style="--dur:1.4s;--s:1.25"/><g stroke="#ffe7a8" stroke-width="2">' + Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="0" x2="${(cos(i * PI / 6) * 58).toFixed(0)}" y2="${(sin(i * PI / 6) * 58).toFixed(0)}"/>`).join('') + '</g>' },
    ];
    let s = stars(60, 3) + `<g transform="translate(520,${y})">${fx('burst', { delay: 2.6, every: 3.4, count: 70, speed: 150, pal: 'hot', life: 1.6, size: 7, drag: 1.4 })}</g>` + fx('drift', { area: [20, 150, 100, 100], rate: 6, pal: 'ion', size: 1.6, a: 0.4 });
    st.forEach((o, i) => {
      s += `<g transform="translate(${o.x},${y})"><g class="pop" style="--d:${0.3 + i * 0.7}s">${o.g}</g></g>`;
      s += `<g class="fade" style="--d:${0.5 + i * 0.7}s">${t(o.x, y + 96, o.n, '', 'text-anchor="middle"')}</g>`;
      if (i < 3) s += `<path d="M${o.x + 56},${y} L${st[i + 1].x - 60},${y}" stroke="#6d7699" stroke-width="1.5" stroke-dasharray="4 5" class="fade" style="--d:${0.6 + i * 0.7}s"/>`;
    });
    const ends = [
      { y: 110, n: 'Beyaz cüce', g: '<circle r="8" fill="#e8f4ff"/><circle r="20" fill="url(#g-bglow)"/>' },
      { y: 200, n: 'Nötron yıldızı', g: '<circle r="5" fill="#bfe6ff"/><circle r="16" fill="url(#g-bglow)"/><path d="M0,-30 L0,30" stroke="#86d5ff" stroke-width="2" opacity=".7"/>' },
      { y: 290, n: 'Kara delik', g: '<circle r="22" fill="#ff9a3d" opacity=".5" filter="url(#f-soft)"/><circle r="14" fill="#000"/>' },
    ];
    ends.forEach((o, i) => {
      s += `<path d="M580,${y} Q640,${y} 680,${o.y}" stroke="#6d7699" fill="none" stroke-dasharray="4 5" class="fade" style="--d:${3 + i * 0.3}s"/>`;
      s += `<g transform="translate(710,${o.y})"><g class="pop" style="--d:${3.1 + i * 0.3}s">${o.g}</g></g>`;
      s += `<g class="fade" style="--d:${3.2 + i * 0.3}s">${t(710, o.y + 38, o.n, 'lbl-s', 'text-anchor="middle"')}</g>`;
    });
    return svg(s);
  };

  S.galaxy = function (sc) {
    const R = P.rng(9);
    if (sc.mode === 'ring') {
      let dots = '';
      for (let i = 0; i < 260; i++) {
        const a = R() * 2 * PI, rr = (R() < 0.5 ? 70 : 118) + (R() - 0.5) * 16;
        dots += `<circle cx="${(cos(a) * rr).toFixed(1)}" cy="${(sin(a) * rr).toFixed(1)}" r="${(0.8 + R() * 1.6).toFixed(1)}" fill="${R() < 0.5 ? '#9fd0ff' : '#fff'}" opacity="${(0.4 + R() * 0.6).toFixed(2)}"/>`;
      }
      return svg(`${stars(60, 5)}<g transform="translate(400,215) scale(1,.8)"><g class="pop" style="--d:.2s"><g>${spin(0, 0, 90)}${dots}</g><circle r="24" fill="url(#g-glow)"/><circle r="10" fill="#ffe7c2"/></g></g>${t(400, 400, 'Çift halkalı gökada · Burçin Galaksisi (PGC 1000714)', '', 'text-anchor="middle"')}`);
    }
    const rings = ['', '', ''];
    for (let arm = 0; arm < 4; arm++) {
      for (let i = 0; i < 150; i++) {
        const k = i / 150, a = arm * PI / 2 + k * 4.2, rr = 16 + k * 190;
        const j = 14 + k * 26;
        const x = cos(a) * rr + (R() - 0.5) * j, y = sin(a) * rr + (R() - 0.5) * j;
        const c = R() < 0.3 ? '#ffd9a8' : R() < 0.6 ? '#9fd0ff' : '#fff';
        rings[k < 0.33 ? 0 : k < 0.66 ? 1 : 2] += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.7 + R() * 1.7).toFixed(1)}" fill="${c}" opacity="${(0.35 + R() * 0.65).toFixed(2)}"/>`;
        if (R() < 0.05) rings[k < 0.33 ? 0 : k < 0.66 ? 1 : 2] += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(4 + R() * 6).toFixed(1)}" fill="${R() < 0.5 ? '#ff7ab8' : '#8f6cff'}" opacity=".18"/>`;
      }
    }
    let dots = rings.map((g, i) => `<g>${spin(0, 0, [70, 120, 190][i])}${g}</g>`).join('');
    for (let i = 0; i < 160; i++) {
      const a = R() * 2 * PI, rr = Math.abs((R() + R() - 1)) * 70;
      dots += `<circle cx="${(cos(a) * rr).toFixed(1)}" cy="${(sin(a) * rr).toFixed(1)}" r="${(0.8 + R()).toFixed(1)}" fill="#ffe2b8" opacity=".8"/>`;
    }
    // "Buradasınız" işareti Avcı kolunda (merkezden ~2/3 uzaklıkta)
    return svg(`<g transform="translate(400,220) scale(1,.52) rotate(-10)"><g class="grow" style="--from:.3;--dur:2.4s"><circle r="210" fill="#6f7cff" opacity=".06"/>${dots}<circle r="60" fill="url(#g-glow)" opacity=".8" class="pulse" style="--dur:5s;--s:1.08"/><g>${spin(0, 0, 120)}<g transform="translate(-118,70)"><circle r="6" fill="none" stroke="#e8b45a" stroke-width="3" class="pulse" style="--s:1.5"/></g></g></g></g>
      <g class="fade" style="--d:2s">${t(56, 44, 'Samanyolu: 200-400 milyar yıldız', '')}${t(56, 64, 'Kalınlık ≈ 1000 ışık yılı', 'lbl-s')}${t(56, 82, 'Güneş: Avcı kolu, merkezden 25.000 ışık yılı', 'lbl-s lbl-gold')}</g>`);
  };

  S.solarsystem = function () {
    const cx = 400, cy = 235;
    const pl = [
      ['mercury', 52, 3.2, 3.5, 'Merkür'], ['venus', 72, 5, 6, 'Venüs'], ['earth', 94, 5.2, 9, 'Dünya'], ['mars', 116, 4, 14, 'Mars'],
      ['jupiter', 190, 13, 30, 'Jüpiter'], ['saturn', 240, 10, 44, 'Satürn'], ['uranus', 290, 7.5, 60, 'Uranüs'], ['neptune', 345, 7.2, 80, 'Neptün'],
    ];
    const k = 0.34;
    let orbits = '', back = '', front = '';
    pl.forEach(([kind, rx, r, dur, name], i) => {
      const ry = rx * k;
      orbits += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry.toFixed(1)}" fill="none" stroke="#8a95c8" stroke-opacity=".22" class="fade" style="--d:${1 + i * 0.15}s"/>`;
      const o = P.orbit3d({ cx, cy, rx, ry, dur, begin: -(i * 1.7), depth: 0.16, body: `${planet(kind, 0, 0, r, { spin: 0, rings: kind === 'saturn' })}<text x="0" y="${-r - 6}" class="lbl-s" text-anchor="middle">${name}</text>` });
      back += `<g class="fade" style="--d:${1.2 + i * 0.15}s">${o.back}</g>`;
      front += `<g class="fade" style="--d:${1.2 + i * 0.15}s">${o.front}</g>`;
    });
    const bodies = back;
    // asteroit kuşağı
    const R = P.rng(12);
    let belt = '';
    for (let i = 0; i < 90; i++) {
      const a = R() * 2 * PI, rr = 140 + R() * 26;
      belt += `<circle cx="${(cx + cos(a) * rr).toFixed(1)}" cy="${(cy + sin(a) * rr * k).toFixed(1)}" r="${(0.6 + R()).toFixed(1)}" fill="#b8ad9c" opacity=".7"/>`;
    }
    // başlangıçtaki toz diski
    let disk = '';
    for (let i = 0; i < 160; i++) {
      const a = R() * 2 * PI, rr = 30 + R() * 330;
      disk += `<circle cx="${(cos(a) * rr).toFixed(1)}" cy="${(sin(a) * rr).toFixed(1)}" r="${(0.8 + R() * 1.6).toFixed(1)}" fill="#d9b98a" opacity=".6"/>`;
    }
    return svg(`<g transform="translate(${cx},${cy}) scale(1,${k})"><g class="fade-out" style="--d:1.2s"><g>${spin(0, 0, 14)}${disk}</g></g></g>
      ${orbits}<g class="fade" style="--d:1.4s">${belt}<text x="${cx + 150}" y="${cy + 64}" class="lbl-s">asteroit kuşağı</text></g>
      ${bodies}<g class="grow" style="--d:.2s;--dur:1.6s">${P.sun(cx, cy, 20)}</g>${front}${fx('vortex', { cx, cy: cy, r0: 330, r1: 24, tilt: k, rate: 60, w: 0.5, shrink: 70, pal: 'gold', delay: 0, dur: 1.6 })}
      <g class="fade" style="--d:2.4s">${t(56, 36, 'Karasal: Merkür, Venüs, Dünya, Mars', 'lbl-s')}${t(56, 54, 'Gazsal: Jüpiter, Satürn, Uranüs, Neptün', 'lbl-s')}${t(56, 72, 'Neptün ötesi: Kuiper Kuşağı → Oort Bulutu', 'lbl-s lbl-gold')}</g>`);
  };

  S.sun = function (sc) {
    const cx = 170, cy = 225, r = 170;
    const layers = [
      [1, '#ffcf6b', 'Korona (taç küre)', -70], [0.98, '#ffb040', 'Kromosfer (renk küre)', -40], [0.94, '#ff9a2e', 'Fotosfer (ışık küre) ~5500 °C', -10],
      [0.72, '#ff7a1e', 'Konveksiyon bölgesi', 22], [0.46, '#ffcf5a', 'Işınım bölgesi', 52], [0.22, '#fffbe6', 'Çekirdek (en sıcak)', 82],
    ];
    let cut = '';
    layers.forEach(([f, col], i) => {
      const rr = r * f;
      cut += `<path d="M0,0 L${rr},0 A${rr},${rr} 0 0,0 ${(rr * cos(-PI / 3)).toFixed(1)},${(rr * sin(-PI / 3)).toFixed(1)}Z" fill="${col}" class="fade" style="--d:${0.6 + (5 - i) * 0.18}s"/>`;
    });
    let labels = '';
    layers.forEach(([f, , name, y], i) => {
      const ang = -PI / 6, rr = r * f - 8;
      const px = cx + cos(ang) * rr * (i < 3 ? 1 : 0.9), py = cy + sin(ang) * rr;
      labels += `<g class="fade" style="--d:${1.4 + i * 0.15}s"><path d="M${px.toFixed(0)},${py.toFixed(0)} L400,${cy + y - 4} L412,${cy + y - 4}" stroke="#e8b45a" stroke-opacity=".6" fill="none"/>${t(418, cy + y, name, i === 5 || i === 0 ? 'lbl-gold' : '')}</g>`;
    });
    let prom = '';
    for (let i = 0; i < 3; i++) {
      const a = -1.9 + i * 0.9;
      prom += `<path d="M${(cx + cos(a) * r).toFixed(0)},${(cy + sin(a) * r).toFixed(0)} q${(cos(a) * 60).toFixed(0)},${(sin(a) * 60 - 20).toFixed(0)} ${(cos(a + 0.25) * 10).toFixed(0)},${(sin(a + 0.25) * 30).toFixed(0)}" stroke="#ff9a3d" stroke-width="5" fill="none" opacity=".75" class="glowp" style="--d:${i * 0.6}s"/>`;
    }
    let wind = '';
    const R = P.rng(4);
    for (let i = 0; i < (fxOn() ? 0 : 26); i++) {
      const y = cy - 90 + R() * 180;
      wind += `<g transform="translate(${cx + r},${y.toFixed(0)})"><circle r="1.6" fill="#ffe7a8" class="move-lin" style="--tx:${(560 - r).toFixed(0)}px;--ty:${((cy - y) * 0.6).toFixed(0)}px;--to:0;--dur:${(2 + R() * 2).toFixed(1)}s;--d:${(R() * 3).toFixed(1)}s;animation-iteration-count:infinite"/></g>`;
    }
    const earth = `<g transform="translate(730,${cy})">${planet('earth', 0, 0, 16)}<g fill="none" stroke="#86d5ff" stroke-opacity=".45"><path d="M-22,-16 Q-50,0 -22,16"/><path d="M-26,-26 Q-70,0 -26,26"/></g>${sc.probe ? '<ellipse cx="0" cy="-17" rx="10" ry="4" fill="#5fd49a" opacity=".6" class="glowp"/>' : ''}</g>${t(730, cy + 40, 'Dünya', 'lbl-s', 'text-anchor="middle"')}`;
    const probe = sc.probe ? `<g><animateMotion path="M640,120 C480,40 330,120 ${cx + r + 30},${cy - 10} C480,280 620,300 680,200" dur="7s" repeatCount="indefinite" rotate="auto"/>${P.probe('parker', 1.2)}${fx('trail', { pal: 'ion', rate: 40, size: 0.6, life: 0.8 })}</g>${t(560, 60, 'Parker Güneş Sondası · 2021\'de koronaya girdi', 'lbl-gold')}` : '';
    const sparks = [-1.9, -1.0, -0.1].map((a, i) => `<g transform="translate(${(cx + cos(a) * r).toFixed(0)},${(cy + sin(a) * r).toFixed(0)})">${fx('burst', { delay: 0.8 + i * 1.1, every: 3.3, count: 26, speed: 70, dir: (a * 180) / PI, spread: 40, pal: 'ember', life: 1.3, size: 6, drag: 0.6, g: 30 })}</g>`).join('');
    return svg(`<g class="fade" style="--d:.1s">${wind}</g>${fx('stream', { from: [cx + r * 0.9, cy], to: [712, cy], width: 220, rate: 55, speed: 210, pal: 'gold', size: 1.3 })}${P.sun(cx, cy, r, { spots: true })}${prom}${sparks}<g transform="translate(${cx},${cy})">${cut}</g>${sc.probe ? '' : labels}${earth}${probe}
      ${sc.probe ? t(400, 425, 'Güneş rüzgârı → manyetik fırtına → aurora ve uydu arızaları', 'lbl-s', 'text-anchor="middle"') : t(560, 425, 'Işık Dünya\'ya ~8 dakikada ulaşır', 'lbl-s')}`);
  };

  S.earth = function () {
    const cx = 420, cy = 220, r = 130;
    return svg(`${P.sun(40, 220, 26)}<g stroke="#ffe7a8" stroke-opacity=".25">${[-60, -20, 20, 60].map((d) => `<line x1="80" y1="${220 + d}" x2="270" y2="${220 + d * 0.8}"/>`).join('')}</g>
      <g transform="translate(${cx},${cy}) rotate(23.5)"><g class="grow" style="--from:.6;--dur:1.6s"><circle r="${r * 1.12}" fill="url(#g-atmo)"/>${planet('earth', 0, 0, r, { spin: 24 })}<line x1="0" y1="${-r - 50}" x2="0" y2="${r + 50}" stroke="#e8b45a" stroke-width="2" stroke-dasharray="6 5"/><ellipse rx="${r}" ry="12" fill="none" stroke="#ffffff" stroke-opacity=".35"/><text x="6" y="${-r - 54}" class="lbl-gold">K</text><text x="6" y="${r + 66}" class="lbl-gold">G</text></g></g>
      <g class="fade" style="--d:1.2s"><path d="M${cx},${cy - r - 55} L${cx},${cy - r - 5}" stroke="#9aa4c8" stroke-dasharray="2 4"/><path d="M${cx},${cy - r - 30} A25,25 0 0,1 ${cx + 10},${cy - r - 28}" stroke="#e8b45a" fill="none"/>${t(cx + 16, cy - r - 36, '23,5°', 'lbl-gold')}</g>
      <g class="fade" style="--d:1.8s">${t(600, 90, 'Batıdan doğuya döner: gece ve gündüz', '')}${t(600, 110, 'Ekvatorda ~1670 km/sa', 'lbl-s')}${t(600, 128, 'Güneş çevresinde ~108.000 km/sa', 'lbl-s')}${t(600, 360, 'Demir çekirdek → manyetik alan', 'lbl-s')}${t(600, 378, 'Yaş: ~4,5 milyar yıl', 'lbl-s lbl-gold')}</g>`);
  };

  S.moonform = function () {
    const R = P.rng(8);
    let debris = '';
    for (let i = 0; i < 70; i++) {
      const a = R() * 2 * PI, rr = 110 + R() * 40;
      debris += `<circle cx="${(cos(a) * rr).toFixed(1)}" cy="${(sin(a) * rr * 0.4).toFixed(1)}" r="${(1 + R() * 2).toFixed(1)}" fill="#e0a070" opacity=".85"/>`;
    }
    return svg(`${stars(50, 13)}
      ${(() => { const o = P.orbit3d({ cx: 360, cy: 230, rx: 170, ry: 66, dur: 10, depth: 0.22, body: planet('moon', 0, 0, 18) }); return `<g class="fade" style="--d:4s">${o.back}</g>`; })()}
      <g transform="translate(360,230)">${planet('young', 0, 0, 80, { noShade: false })}</g>
      <g transform="translate(700,120)"><g class="move-in" style="--tx:-290px;--ty:80px;--dur:1.6s"><g class="fade-out" style="--d:1.5s;--dur:.2s">${planet('mars', 0, 0, 34)}</g></g></g>
      ${t(640, 70, 'Theia', 'lbl-s')}
      <g transform="translate(418,212)"><circle r="70" fill="url(#g-wglow)" class="flash" style="--d:1.5s;--dur:1.6s"/>${fx('burst', { delay: 1.5, count: 240, speed: 260, pal: 'fire', life: 2, size: 9, drag: 1.1, dir: -20, spread: 110 })}${fx('flash', { delay: 1.5, dur: 0.9, a: 0.6, color: '#ffe2b0' })}${fx('shake', { delay: 1.5, dur: 1.3, amp: 7 })}</g>
      ${fx('ring', { delay: 1.75, cx: 360, cy: 230, rx: 150, ry: 60, count: 170, life: 2.9, w: 1.1, pal: 'ember' })}
      <g transform="translate(360,230)"><g class="fade" style="--d:1.8s"><g class="fade-out" style="--d:4.5s">${fxOn() ? '' : debris}</g></g></g>
      ${(() => { const o = P.orbit3d({ cx: 360, cy: 230, rx: 170, ry: 66, dur: 10, depth: 0.22, body: planet('moon', 0, 0, 18) }); return `<g class="fade" style="--d:4s">${o.front}</g>`; })()}
      <g class="fade" style="--d:4.2s">${t(560, 400, 'Enkaz birleşti: Ay doğdu · 384.400 km · her yıl ~4 cm uzaklaşıyor', 'lbl-s', 'text-anchor="middle"')}</g>`);
  };

  S.impact = function () {
    return svg(`<rect width="800" height="450" fill="url(#g-dawn)" opacity=".55"/>${stars(30, 4, [0, 0, 800, 200])}${P.ground('earth', 360, 5)}
      <g transform="translate(400,352)"><g class="move-in" style="--fx:320px;--fy:-400px;--dur:1.5s;--d:.3s"><g class="fade-out" style="--d:1.75s;--dur:.1s"><path d="M0,0 L120,-150" stroke="#ffcf6b" stroke-width="10" stroke-linecap="round" opacity=".6" filter="url(#f-soft)"/><circle r="10" fill="#fff4d0"/>${fx('trail', { delay: 0.3, dur: 1.45, rate: 120, size: 1.4, pal: 'fire' })}</g></g></g>
      <g transform="translate(400,352)">${fx('burst', { delay: 1.75, count: 130, speed: 330, dir: -90, spread: 75, pal: 'ember', life: 1.4, streak: 0.04, size: 3.5, size1: 2, g: 420, drag: 0.3 })}${fx('burst', { delay: 1.8, count: 50, speed: 140, dir: -90, spread: 80, pal: 'earth', add: false, life: 3.2, size: 26, size1: 90, drag: 1.4, a: 0.5 })}${fx('billow', { delay: 1.85, dur: 1.4, rate: 26, size: 0.8 })}${fx('flash', { delay: 1.75, dur: 0.8, a: 0.65 })}${fx('shake', { delay: 1.75, dur: 1.1, amp: 8 })}</g>
      <g transform="translate(400,350)"><circle r="120" fill="url(#g-glow)" class="flash" style="--d:1.8s;--dur:1.8s"/></g>
      <g class="fade" style="--d:2s"><ellipse cx="400" cy="372" rx="120" ry="18" fill="#05070f" opacity=".85"/><ellipse cx="400" cy="368" rx="128" ry="22" fill="none" stroke="#3a4270" stroke-width="4"/></g>
      <g class="fade" style="--d:2.1s">${[0, 1, 2, 3, 4].map((i) => `<circle cx="${340 + i * 30}" cy="${340 - (i % 2) * 10}" r="${24 + i * 3}" fill="#8a7a6a" opacity=".45" class="grow" style="--d:${2 + i * 0.1}s;--dur:2.5s"/>`).join('')}</g>
      <g class="fade" style="--d:2.6s">${t(56, 60, 'Meteor = gök taşı', '')}${t(56, 80, 'Yere ulaşırsa: meteorit · En parlakları: ateş topu', 'lbl-s')}${t(56, 110, 'Hoba (Namibya): en büyük meteorit, ~80.000 yıl önce', 'lbl-s lbl-gold')}${t(56, 128, 'Meteor Krateri (Arizona, ABD): 1200 m çap', 'lbl-s lbl-gold')}</g>`);
  };

  S.stonehenge = function () {
    const stones = [[160, 70], [230, 90], [300, 96], [370, 100], [430, 100], [500, 96], [570, 90], [640, 70]];
    let s = '';
    stones.forEach(([x, h], i) => {
      s += `<rect x="${x - 16}" y="${370 - h}" width="32" height="${h}" fill="#141a3a"/>`;
      if (i % 2 === 0 && i < 7) s += `<rect x="${x - 20}" y="${360 - h}" width="${stones[i + 1][0] - x + 40}" height="12" fill="#141a3a"/>`;
    });
    return svg(`<rect width="800" height="450" fill="url(#g-dawn)"/>${stars(40, 2, [0, 0, 800, 160])}
      <g transform="translate(400,380)"><g class="move" style="--fy:120px;--dur:4s;--d:.3s">${P.sun(0, 0, 34)}</g></g>
      <path d="M400,330 L400,450" stroke="#fff4d0" stroke-width="30" opacity=".2" class="fade" style="--d:2.5s" filter="url(#f-soft)"/>
      <path d="M0,370 L800,370 L800,450 L0,450Z" fill="#0b1030"/>${s}
      <g class="fade" style="--d:1.5s">${t(400, 40, '21 Haziran: yaz gündönümü · en uzun gündüz (kuzey)', '', 'text-anchor="middle"')}${t(400, 60, '21 Aralık: en uzun gece · 21 Mart ve 23 Eylül: ekinoks (eşit gece)', 'lbl-s', 'text-anchor="middle"')}</g>`);
  };

  S.lunarcal = function () {
    const cx = 400, cy = 185;
    const phases = ['Yeni ay', 'Hilal', 'İlk dördün', 'Şişkin ay', 'Dolunay', 'Şişkin ay', 'Son dördün', 'Hilal'];
    // aydınlık kısım: k = 0 (yeni) → 1 (dolunay)
    const phaseIcon = (i, r) => {
      const f = i / 8;
      const lit = (1 - cos(f * 2 * PI)) / 2; // 0..1
      const waxing = f <= 0.5;
      const rx = Math.abs(1 - 2 * lit) * r;
      const sweepBig = lit > 0.5 ? 1 : 0;
      const side = waxing ? 1 : 0;
      const d = `M0,${-r} A${r},${r} 0 0,${side} 0,${r} A${rx.toFixed(1)},${r} 0 0,${side === 1 ? (sweepBig ? 1 : 0) : (sweepBig ? 0 : 1)} 0,${-r}Z`;
      return `<circle r="${r}" fill="#1c2244"/>${lit > 0.02 ? `<path d="${d}" fill="#f1efe6"/>` : ''}`;
    };
    let row = '';
    phases.forEach((n, i) => {
      const x = 90 + i * 88;
      row += `<g transform="translate(${x},375)"><g class="cycle" style="--dur:8s;--d:${i}s">${phaseIcon(i, 16)}${t(0, 34, n, 'lbl-s', 'text-anchor="middle"')}</g></g>`;
    });
    return svg(`${P.sun(-10, cy, 40)}<g stroke="#ffe7a8" stroke-opacity=".18">${[-80, -40, 0, 40, 80].map((d) => `<line x1="60" y1="${cy + d}" x2="760" y2="${cy + d}"/>`).join('')}</g>
      <ellipse cx="${cx}" cy="${cy}" rx="150" ry="110" fill="none" stroke="#8a95c8" stroke-opacity=".3" stroke-dasharray="4 5"/>
      ${planet('earth', cx, cy, 36, { spin: 20 })}
      <g><animateMotion path="M${cx - 150},${cy} a150,110 0 1,0 300,0 a150,110 0 1,0 -300,0" dur="8s" repeatCount="indefinite"/><circle r="15" fill="#2a2f4a"/><path d="M0,-15 A15,15 0 0,0 0,15Z" fill="#f1efe6"/></g>
      ${row}${t(56, 44, 'Evreler ~29,5 günde tekrarlar', '')}${t(56, 64, 'Dünya çevresinde tur: 27,3 gün', 'lbl-s')}${t(56, 82, 'Ay yılı: 12 dolanım = 354 gün', 'lbl-s lbl-gold')}`);
  };

  S.wanderers = function () {
    const arc = 'M-40,330 Q400,40 840,330';
    const pl = [['Utarit · Merkür', '#d9d3cc', 3, 9], ['Zühre · Venüs', '#fff6d8', 6, 14], ['Merih · Mars', '#ff8a5a', 4, 22], ['Erendiz · Jüpiter', '#f6e2c2', 5, 34], ['Zuhal · Satürn', '#fbeec4', 4.5, 48]];
    let s = '';
    pl.forEach(([n, c, r, dur], i) => {
      s += `<g>${P.motion(arc, dur, -(i * 5 + 2))}<circle r="${r * 3}" fill="url(#g-wglow)" opacity=".5"/><circle r="${r}" fill="${c}"/><text x="${r + 6}" y="4" class="lbl-s">${n}</text></g>`;
    });
    return svg(`${stars(90, 17, [0, 0, 800, 330])}<path d="${arc}" fill="none" stroke="#e8b45a" stroke-opacity=".25" stroke-dasharray="3 6"/>${t(640, 120, 'tutulum (ekliptik)', 'lbl-s lbl-gold')}${s}
      <path d="M0,370 L60,370 L60,352 L110,352 L110,334 L170,334 L170,352 L220,352 L220,370 L800,372 L800,450 L0,450Z" fill="#0b1030"/>
      ${t(400, 420, 'Çıplak gözle 5 gezegen: Merkür, Venüs, Mars, Jüpiter, Satürn', '', 'text-anchor="middle"')}`);
  };

  S.constellations = function (sc) {
    if (sc.mode === 'iau') {
      const R = P.rng(31);
      let grid = '';
      for (let x = 40; x < 800; x += 110) grid += `<path d="M${x},20 L${x + (R() - 0.5) * 30},${120 + R() * 60} L${x + (R() - 0.5) * 40},430" stroke="#86d5ff" stroke-opacity=".18" fill="none" class="draw" style="--len:500;--d:${(x / 800).toFixed(2)}s"/>`;
      for (let y = 60; y < 450; y += 100) grid += `<path d="M20,${y} L400,${y + (R() - 0.5) * 30} L780,${y}" stroke="#86d5ff" stroke-opacity=".18" fill="none" class="draw" style="--len:900;--d:${(y / 450).toFixed(2)}s"/>`;
      const figs = [
        { n: 'Cassiopeia', p: [[90, 100], [125, 70], [160, 105], [195, 72], [230, 104]] },
        { n: 'Cygnus · Kuğu', p: [[420, 60], [420, 170], [360, 110], [480, 110], [420, 110]] },
        { n: 'Büyük Ayı', p: [[560, 300], [610, 290], [650, 310], [690, 300], [700, 350], [750, 355], [745, 305]] },
        { n: 'Kanatlı At', p: [[120, 300], [230, 300], [230, 390], [120, 390], [120, 300], [70, 250]] },
      ];
      let f = '';
      figs.forEach((o, i) => {
        const d = 'M' + o.p.map((q) => q.join(',')).join(' L');
        f += `<g class="fade" style="--d:${1 + i * 0.6}s"><path d="${d}" stroke="#e8b45a" stroke-opacity=".7" fill="none" class="draw" style="--len:600;--d:${1 + i * 0.6}s"/>${o.p.map((q) => `<circle cx="${q[0]}" cy="${q[1]}" r="3" fill="#fff"/>`).join('')}${t(o.p[0][0], o.p[0][1] - 14, o.n, 'lbl-s')}</g>`;
      });
      return svg(`${stars(120, 23)}${grid}${f}<g class="fade" style="--d:3.4s">${t(400, 245, '88 takımyıldız', 'lbl-b', 'text-anchor="middle"')}${t(400, 268, 'Uluslararası Astronomi Birliği · 1922', 'lbl-s lbl-gold', 'text-anchor="middle"')}</g>`);
    }
    // Kutup Yıldızı ve dönen gökyüzü
    const px = 420, py = 120;
    let trails = '';
    const R = P.rng(44);
    for (let i = 0; i < 26; i++) {
      const rr = 30 + i * 14, a0 = R() * 360, len = 40 + R() * 50;
      trails += `<path d="M${px + rr},${py}" stroke="none"/><circle cx="${px}" cy="${py}" r="${rr}" fill="none" stroke="#9fd0ff" stroke-opacity="${(0.12 + R() * 0.25).toFixed(2)}" stroke-width="1.4" stroke-dasharray="${len} ${(2 * PI * rr - len).toFixed(0)}" transform="rotate(${a0.toFixed(0)} ${px} ${py})"/>`;
    }
    const little = [[px, py], [px - 22, py + 30], [px - 36, py + 62], [px - 44, py + 96], [px - 12, py + 110], [px - 6, py + 142], [px - 40, py + 132]];
    const d = 'M' + little.map((q) => q.join(',')).join(' L') + ` L${px - 44},${py + 96}`;
    return svg(`<g>${spin(px, py, 60)}${trails}</g><g>${spin(px, py, 60)}<path d="${d}" stroke="#e8b45a" stroke-opacity=".6" fill="none"/>${little.slice(1).map((q) => `<circle cx="${q[0]}" cy="${q[1]}" r="2.4" fill="#fff"/>`).join('')}</g>
      ${P.glowDot(px, py, 4, '#fff', 'pulse', '--s:1.3')}${t(px + 14, py - 10, 'Kutup Yıldızı (Demirkazık)', 'lbl-gold')}${t(px + 14, py + 8, '3 yıldızlı sistem · Küçükayı', 'lbl-s')}
      <path d="M${px},${py + 12} L${px},330" stroke="#e8b45a" stroke-opacity=".5" stroke-dasharray="4 6"/>${t(px + 8, 320, 'KUZEY', 'lbl-gold')}
      <path d="M0,360 Q200,350 400,362 T800,358 L800,450 L0,450Z" fill="#0c1a3a"/>
      <g transform="translate(260,352)"><g class="bob" style="--by:-4px;--dur:4s"><path d="M-50,0 L50,0 L36,20 L-36,20Z" fill="#3a2a1e"/><path d="M0,0 L0,-70 L40,-12Z" fill="#e8dcc0"/><path d="M-4,-60 L-34,-10 L-4,-10Z" fill="#d6c8a8"/></g></g>`);
  };

  S.supernova = function () {
    const R = P.rng(54);
    let fil = '';
    for (let i = 0; i < 40; i++) {
      const a = R() * 2 * PI, r1 = 20 + R() * 40, r2 = 80 + R() * 70;
      fil += `<path d="M${(cos(a) * r1).toFixed(0)},${(sin(a) * r1 * 0.75).toFixed(0)} Q${(cos(a + 0.3) * r2 * 0.6).toFixed(0)},${(sin(a + 0.3) * r2 * 0.5).toFixed(0)} ${(cos(a) * r2).toFixed(0)},${(sin(a) * r2 * 0.72).toFixed(0)}" stroke="${['#ff7a5c', '#ffb86b', '#7fd4ff', '#c38bff'][i % 4]}" stroke-width="${(1 + R() * 2.5).toFixed(1)}" fill="none" opacity=".75"/>`;
    }
    return svg(`${stars(80, 2)}<g transform="translate(400,220)"><circle r="200" fill="url(#g-wglow)" class="flash" style="--dur:2.2s"/><circle r="30" fill="#fff" class="flash" style="--dur:1.6s"/><g class="grow" style="--d:1.4s;--dur:3s;--from:.2"><ellipse rx="150" ry="112" fill="#6f7cff" opacity=".12" filter="url(#f-blur)"/>${fil}</g><g class="fade" style="--d:2.8s"><circle r="4" fill="#fff" class="blink" style="--dur:.35s"/><circle r="10" fill="none" stroke="#bfe6ff" class="ripple" style="--s:5;--dur:1.4s"/></g>${fx('burst', { delay: 0.1, count: 320, speed: 280, pal: 'hot', life: 3.2, size: 7, size1: 3, drag: 0.5 })}${fx('burst', { delay: 0.12, count: 70, speed: 520, pal: 'white', life: 0.9, streak: 0.05, size: 3, size1: 2, drag: 0.4 })}${fx('flash', { delay: 0.05, dur: 1.2, a: 0.75 })}${fx('shake', { delay: 0.05, dur: 1, amp: 5 })}</g>
      <g class="fade" style="--d:2.6s">${t(56, 60, '4 Temmuz 1054: Çinli gökbilimcilerin "misafir yıldızı"', '')}${t(56, 80, 'Bugün: Yengeç Bulutsusu (M1) · merkezde pulsar', 'lbl-s lbl-gold')}</g>`);
  };

  S.observatory = function (sc) {
    const m = sc.mode;
    const base = `${stars(90, 6, [0, 0, 800, 300])}`;
    if (m === 'maragha' || m === 'ulugbey') {
      const label = m === 'maragha' ? ['Merâga Rasathanesi · 1259', 'Nasîrüddin Tûsî · 400 bin ciltlik kütüphane'] : ['Semerkant Gözlemevi · 1420', 'Uluğ Bey · dev mermer kadran · 1018 yıldız'];
      const arcR = m === 'ulugbey' ? 200 : 150;
      return svg(`${base}<path d="M0,380 Q400,330 800,380 L800,450 L0,450Z" fill="url(#g-hill)"/>
        <g transform="translate(400,380)"><path d="M${-arcR},0 A${arcR},${arcR} 0 0,1 0,${-arcR}" fill="none" stroke="#e8b45a" stroke-width="10" class="draw" style="--len:400;--dur:2s"/><path d="M${-arcR - 14},0 A${arcR + 14},${arcR + 14} 0 0,1 0,${-arcR - 14}" fill="none" stroke="#caa05a" stroke-width="2" stroke-dasharray="2 6" class="fade" style="--d:1.4s"/><rect x="-10" y="${-arcR - 20}" width="${arcR * 0.8}" height="${arcR + 20}" fill="#141c48"/><path d="M-10,${-arcR - 20} Q${arcR * 0.3},${-arcR - 70} ${arcR * 0.8 - 10},${-arcR - 20}Z" fill="#1a2458"/><g stroke="#e8b45a" stroke-opacity=".7">${Array.from({ length: 9 }, (_, i) => { const a = PI + (i * PI) / 16; return `<line x1="${(cos(a) * arcR).toFixed(0)}" y1="${(sin(a) * arcR).toFixed(0)}" x2="${(cos(a) * (arcR - 16)).toFixed(0)}" y2="${(sin(a) * (arcR - 16)).toFixed(0)}"/>`; }).join('')}</g></g>
        <g transform="translate(300,382) scale(.55)">${P.figure(m === 'ulugbey' ? 'islamic' : 'islamic', 'astrolabe')}</g>
        <g class="fade" style="--d:1.2s">${t(56, 50, label[0], 'lbl-b')}${t(56, 74, label[1], 'lbl-s lbl-gold')}</g>`);
    }
    if (m === 'keck') {
      return svg(`${base}<path d="M0,330 L300,190 L520,200 L800,330 L800,450 L0,450Z" fill="#141a3a"/><path d="M0,360 Q200,330 400,370 T800,350 L800,450 L0,450Z" fill="#e6ecf8" opacity=".25"/>
        ${P.dome(360, 196, 1)}${P.dome(470, 200, 1)}<path d="M364,120 L520,-10" stroke="#ffb347" stroke-width="3" opacity=".8" class="draw" style="--len:220;--d:1s"/>${P.glowDot(520, -6, 3, '#ffcf6b')}
        <g class="fade" style="--d:1.4s">${t(56, 50, 'Keck · Mauna Kea, Hawaii · 1993', 'lbl-b')}${t(56, 74, 'İki teleskop, her biri ~300 ton · 10 m altıgen aynalar', 'lbl-s')}${t(56, 94, 'ESO\'nun VLT\'si (Çok Büyük Teleskop): Şili, Atacama', 'lbl-s lbl-gold')}</g>`);
    }
    if (m === 'turkey') {
      return svg(`${base}<path d="M0,380 L180,300 L300,340 L420,190 L560,330 L640,300 L800,380 L800,450 L0,450Z" fill="#141a3a"/><path d="M380,240 L420,190 L460,240 L440,236 L420,250 L400,236Z" fill="#e6ecf8" opacity=".8"/>
        ${P.dome(420, 200, 0.8)}${P.dome(180, 305, 0.7)}
        <g class="fade" style="--d:1s">${t(420, 110, 'DAG · Doğu Anadolu Gözlemevi', 'lbl-gold', 'text-anchor="middle"')}${t(420, 130, 'Erzurum · 3.170 m · Türkiye\'nin en büyük teleskobu', 'lbl-s', 'text-anchor="middle"')}${t(180, 240, 'TÜBİTAK Ulusal Gözlemevi', 'lbl-gold', 'text-anchor="middle"')}${t(180, 258, 'Antalya · 1997', 'lbl-s', 'text-anchor="middle"')}</g>`);
    }
    return svg(`${base}<path d="M0,380 Q400,340 800,380 L800,450 L0,450Z" fill="url(#g-hill)"/>${P.dome(260, 372, 1.4)}${P.dome(540, 372, 1.1)}
      <g class="fade" style="--d:1s">${t(260, 220, 'La Specola · Padova, İtalya · 1767', 'lbl-gold', 'text-anchor="middle"')}${t(540, 250, 'Pulkovo · Rusya · 1839', 'lbl-gold', 'text-anchor="middle"')}</g>`);
  };

  S.globe = function () {
    const cx = 400, cy = 220, r = 150;
    let lon = '';
    for (let i = 0; i < 12; i++) {
      lon += `<ellipse rx="${(r * Math.abs(cos((i * PI) / 12))).toFixed(1)}" ry="${r}" fill="none" stroke="#86d5ff" stroke-opacity=".25"/>`;
    }
    let lat = '';
    for (let i = -2; i <= 2; i++) lat += `<ellipse cy="${(i * 50).toFixed(0)}" rx="${(Math.sqrt(r * r - (i * 50) ** 2)).toFixed(1)}" ry="10" fill="none" stroke="#86d5ff" stroke-opacity="${i === 0 ? 0.6 : 0.25}"/>`;
    return svg(`${stars(40, 8)}<g transform="translate(${cx},${cy})">${planet('earth', 0, 0, r, { spin: 30 })}${lon}${lat}<path d="M-40,-${r - 6} Q-66,0 -40,${r - 6}" fill="none" stroke="#e8b45a" stroke-width="3" class="draw" style="--len:330;--d:.6s"/></g>
      <g class="fade" style="--d:1.4s">${t(cx - 150, 60, '0° · Greenwich meridyeni (1884)', 'lbl-gold')}${t(600, 380, 'Enlem + boylam = coğrafi koordinat', 'lbl-s')}${t(600, 398, 'Azimut: yatay yön açısı', 'lbl-s')}</g>`);
  };

  S.comet = {
    svg: () => svg(`<g id="cm-orbit"></g>${P.sun(180, 225, 34)}<ellipse cx="440" cy="225" rx="300" ry="120" fill="none" stroke="#8a95c8" stroke-opacity=".25" stroke-dasharray="4 6"/>
      <g class="cm-comet"><path class="cm-tail" d="M0,0 L-160,-22 L-160,22Z" fill="url(#g-bglow)" opacity="${fxOn() ? 0.35 : 0.8}"/><circle r="14" fill="url(#g-bglow)" opacity=".7"/><circle r="6" fill="#e8f6ff"/>${fx('tail', { away: [180, 225], rate: 110 })}</g>
      ${t(56, 50, 'Halley: ~76 yılda bir döner', '')}${t(56, 70, 'Son geçiş 1986 · Sıradaki 2061', 'lbl-s lbl-gold')}${t(56, 400, 'Kuyruk hep Güneş\'in tersini gösterir', 'lbl-s')}${t(744, 400, 'Çekirdek · koma · kuyruk', 'lbl-s', 'text-anchor="end"')}`),
    run(el) {
      const c = el.querySelector('.cm-comet');
      if (!c) return;
      const cx = 440, cy = 225, a = 300, b = 120, e = Math.sqrt(1 - (b * b) / (a * a));
      const sx = 180, sy = 225;
      let M = 2.4, raf, last = performance.now();
      const step = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        M += dt * 0.55;
        let E = M;
        for (let i = 0; i < 6; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        const x = cx - a * Math.cos(E), y = cy + b * Math.sin(E);
        const ang = (Math.atan2(y - sy, x - sx) * 180) / PI;
        const dist = Math.hypot(x - sx, y - sy);
        const scale = Math.max(0.3, Math.min(1.4, 220 / dist));
        c.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(ang + 180).toFixed(1)})`);
        c.querySelector('.cm-tail').setAttribute('transform', `scale(${scale.toFixed(2)},1)`);
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    },
  };

  // ─── Bilim insanı sahnesi: figür + "buluş" penceresi
  const V = {};
  S.scholar = function (sc, ev) {
    const vis = (V[sc.vision] || V.stars)();
    const clip = P.uid('vc');
    const yl = ev ? (ev.yearLabel || window.fmtYear(ev.year)) : '';
    return svg(`${stars(60, 19, [0, 0, 440, 330])}<rect width="800" height="450" fill="url(#g-night)" opacity=".6"/>${P.setting(sc.look)}
      <path d="M0,396 Q220,372 460,398 T800,392 L800,450 L0,450Z" fill="url(#g-hill)"/>
      <g transform="translate(250,400)"><g class="fade" style="--dur:.8s">${P.figure(sc.look, sc.tool)}</g></g>
      ${(() => { const path = 'M266,268 C320,250 360,190 446,196'; return `<path d="${path}" fill="none" stroke="#e8b45a" stroke-opacity=".14" stroke-dasharray="2 6"/>` + [0, 1, 2, 3, 4, 5].map((i) => `<circle r="${1.6 + (i % 3) * 0.8}" fill="#ffe2a0" opacity="0"><animateMotion path="${path}" dur="2.4s" begin="${(0.4 + i * 0.4).toFixed(1)}s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".4 0 .6 1"/><animate attributeName="opacity" values="0;.9;.9;0" keyTimes="0;.15;.8;1" dur="2.4s" begin="${(0.4 + i * 0.4).toFixed(1)}s" repeatCount="indefinite"/></circle>`).join(''); })()}
      <g transform="translate(590,188)"><circle r="190" fill="url(#g-glow)" opacity=".12" class="pulse" style="--dur:5s;--s:1.05"/><g class="pop" style="--d:.3s"><circle r="150" fill="url(#g-vision)"/>
        <g>${spin(0, 0, 70)}<circle r="157" fill="none" stroke="#e8b45a" stroke-opacity=".3" stroke-dasharray="1 7"/>${Array.from({ length: 24 }, (_, i) => { const a = (i * PI) / 12; return `<line x1="${(cos(a) * 162).toFixed(1)}" y1="${(sin(a) * 162).toFixed(1)}" x2="${(cos(a) * (i % 6 ? 166 : 172)).toFixed(1)}" y2="${(sin(a) * (i % 6 ? 166 : 172)).toFixed(1)}" stroke="#e8b45a" stroke-opacity=".45"/>`; }).join('')}</g>
        <g>${spin(0, 0, 18, true)}<path d="M${(cos(-0.4) * 150).toFixed(1)},${(sin(-0.4) * 150).toFixed(1)} A150,150 0 0,1 ${(cos(0.5) * 150).toFixed(1)},${(sin(0.5) * 150).toFixed(1)}" fill="none" stroke="#ffe2a0" stroke-width="2.5" stroke-linecap="round" opacity=".7"/><path d="M${(cos(2.7) * 150).toFixed(1)},${(sin(2.7) * 150).toFixed(1)} A150,150 0 0,1 ${(cos(3.3) * 150).toFixed(1)},${(sin(3.3) * 150).toFixed(1)}" fill="none" stroke="#ffe2a0" stroke-width="2" stroke-linecap="round" opacity=".5"/></g>
        <circle r="150" fill="none" stroke="#e8b45a" stroke-opacity=".75" stroke-width="1.5" class="draw" style="--len:943;--dur:1.1s;--d:.3s"/>
        <clipPath id="${clip}"><circle r="148"/></clipPath><mask id="${clip}m" maskUnits="userSpaceOnUse" x="-150" y="-150" width="300" height="300"><circle r="150" fill="#fff" class="reveal" style="--d:.55s"/></mask><g clip-path="url(#${clip})"><g mask="url(#${clip}m)">${vis}</g>${fx('drift', { area: [450, 50, 280, 280], rate: 4, pal: 'gold', size: 1.2, a: 0.45 })}</g></g></g>
      <g class="fade" style="--d:.9s"><text x="590" y="372" class="lbl-b" text-anchor="middle">${sc.name || ''}</text><text x="590" y="394" class="lbl-gold" text-anchor="middle">${yl}</text></g>`);
  };

  V.stars = () => stars(40, 3, [-140, -140, 140, 140]);
  V.zodiac = () => {
    const g = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    let s = stars(30, 5, [-140, -140, 140, 140]) + '<circle r="112" fill="none" stroke="#e8b45a" stroke-opacity=".6"/><circle r="84" fill="none" stroke="#e8b45a" stroke-opacity=".3"/>';
    g.forEach((c, i) => {
      const a = (i * PI) / 6 - PI / 2, a2 = a + PI / 12;
      s += `<line x1="${(cos(a) * 84).toFixed(1)}" y1="${(sin(a) * 84).toFixed(1)}" x2="${(cos(a) * 112).toFixed(1)}" y2="${(sin(a) * 112).toFixed(1)}" stroke="#e8b45a" stroke-opacity=".5"/>`;
      s += `<text x="${(cos(a2) * 98).toFixed(1)}" y="${(sin(a2) * 98 + 5).toFixed(1)}" text-anchor="middle" style="font-size:15px;fill:#f2e2b8">${c}︎</text>`;
    });
    s += `<g>${spin(0, 0, 12)}<g transform="translate(0,-126)">${P.sun(0, 0, 7)}</g></g>${planet('earth', 0, 0, 16, { spin: 0 })}`;
    return s + t(0, 60, '12 burç · Zodyak', 'lbl-s', 'text-anchor="middle"');
  };
  V.eclipse = () => `${stars(20, 7, [-140, -140, 140, 140])}<g class="fade" style="--d:2.7s"><circle r="80" fill="url(#g-wglow)" opacity=".7"/></g>${P.sun(0, 0, 50)}
    <g class="move" style="--fx:-170px;--dur:2.8s;--d:.2s"><circle r="51" fill="#0a0d1c"/></g><g transform="translate(34,-36)"><circle r="14" fill="url(#g-wglow)" class="flash" style="--d:2.9s;--dur:2s"/></g>
    ${t(0, 104, 'Güneş tutulması · MÖ 585', 'lbl-s', 'text-anchor="middle"')}`;
  V.geocentric = () => {
    const orb = [[30, 'moon', 4, 3], [44, 'mercury', 3, 5], [58, 'venus', 4.5, 7], [76, 'sun', 9, 10], [94, 'mars', 4, 14], [112, 'jupiter', 7, 20], [130, 'saturn', 6, 28]];
    let s = '<circle r="142" fill="none" stroke="#e8b45a" stroke-opacity=".35" stroke-dasharray="1 4"/>';
    orb.forEach(([r, k, pr, d], i) => {
      s += `<circle r="${r}" fill="none" stroke="#8a95c8" stroke-opacity=".25"/><g>${spin(0, 0, d)}<g transform="rotate(${i * 50}) translate(${r},0)">${k === 'sun' ? P.sun(0, 0, pr) : planet(k, 0, 0, pr, { spin: 0, rings: false })}</g></g>`;
    });
    return s + planet('earth', 0, 0, 14, { spin: 0 }) + t(0, 30, 'Dünya merkezde', 'lbl-s', 'text-anchor="middle"');
  };
  V.epicycle = () => {
    let d = '';
    for (let i = 0; i <= 400; i++) {
      const a = (i / 400) * 2 * PI;
      d += `${i ? 'L' : 'M'}${(90 * cos(a) + 34 * cos(5 * a)).toFixed(1)},${(90 * sin(a) + 34 * sin(5 * a)).toFixed(1)}`;
    }
    return `<circle r="90" fill="none" stroke="#8a95c8" stroke-opacity=".35"/><path d="${d}" fill="none" stroke="#e8b45a" stroke-opacity=".55" class="draw" style="--len:1800;--dur:16s"/>
      <g>${spin(0, 0, 16)}<g transform="translate(90,0)"><circle r="34" fill="none" stroke="#86d5ff" stroke-opacity=".5"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="1440" dur="16s" repeatCount="indefinite"/><circle cx="34" r="6" fill="#ff8a5a"/></g></g></g>
      ${planet('earth', 0, 0, 12, { spin: 0 })}${t(0, 128, 'Episikl: "geri gidiş" (retro) açıklaması', 'lbl-s', 'text-anchor="middle"')}`;
  };
  V.catalog = () => {
    const R = P.rng(77);
    let s = '<g stroke="#86d5ff" stroke-opacity=".15">' + [-100, -50, 0, 50, 100].map((v) => `<line x1="${v}" y1="-140" x2="${v}" y2="140"/><line x1="-140" y1="${v}" x2="140" y2="${v}"/>`).join('') + '</g>';
    for (let i = 0; i < 40; i++) {
      const m = 1 + Math.floor(R() * 6);
      s += `<circle cx="${(-120 + R() * 240).toFixed(0)}" cy="${(-110 + R() * 190).toFixed(0)}" r="${(4.4 - m * 0.6).toFixed(1)}" fill="#fff" class="pop" style="--d:${(0.4 + i * 0.05).toFixed(2)}s"/>`;
    }
    s += `<g class="fade" style="--d:2.4s"><rect x="-120" y="92" width="240" height="30" rx="6" fill="#0a1030" opacity=".85"/>${[1, 2, 3, 4, 5, 6].map((m, i) => `<circle cx="${-96 + i * 38}" cy="107" r="${(4.4 - m * 0.6).toFixed(1)}" fill="#fff"/><text x="${-88 + i * 38}" y="111" class="lbl-s">${m}</text>`).join('')}</g>`;
    return s + t(0, 138, 'kadir: 1 en parlak', 'lbl-s', 'text-anchor="middle"');
  };
  V.calendar = () => {
    const m = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const long = [0, 2, 4, 6, 7, 9, 11];
    let s = '';
    m.forEach((n, i) => {
      const a0 = (i * PI) / 6 - PI / 2, a1 = a0 + PI / 6 - 0.03;
      const big = long.includes(i);
      s += `<path d="M${(cos(a0) * 70).toFixed(1)},${(sin(a0) * 70).toFixed(1)} L${(cos(a0) * 118).toFixed(1)},${(sin(a0) * 118).toFixed(1)} A118,118 0 0,1 ${(cos(a1) * 118).toFixed(1)},${(sin(a1) * 118).toFixed(1)} L${(cos(a1) * 70).toFixed(1)},${(sin(a1) * 70).toFixed(1)} A70,70 0 0,0 ${(cos(a0) * 70).toFixed(1)},${(sin(a0) * 70).toFixed(1)}Z" fill="${big ? '#e8b45a' : '#2a3570'}" opacity="${big ? 0.75 : 0.9}" class="fade" style="--d:${0.3 + i * 0.1}s"/>`;
      const am = a0 + PI / 12;
      s += `<text x="${(cos(am) * 94).toFixed(1)}" y="${(sin(am) * 94 + 4).toFixed(1)}" text-anchor="middle" class="lbl-s" style="fill:#0a1030;font-weight:600">${n}</text>`;
    });
    return s + `<g>${spin(0, 0, 8)}<circle cx="0" cy="-130" r="6" fill="#4f9bff"/></g>${t(0, -4, '365 gün', 'lbl-b', 'text-anchor="middle"')}${t(0, 16, '7 ay 31 çeker', 'lbl-s lbl-gold', 'text-anchor="middle"')}`;
  };
  V.meridian = () => `<circle cx="0" cy="420" r="440" fill="#18306e"/><circle cx="0" cy="420" r="440" fill="none" stroke="#86d5ff" stroke-opacity=".4"/>
    <g stroke="#ffe7a8" stroke-opacity=".6">${[-60, -20, 20, 60].map((x) => `<line x1="${x}" y1="-140" x2="${x}" y2="-30"/>`).join('')}</g>
    <line x1="0" y1="420" x2="-40" y2="-22" stroke="#e8b45a" stroke-dasharray="4 4" class="draw" style="--len:450;--d:.6s"/><line x1="0" y1="420" x2="40" y2="-22" stroke="#e8b45a" stroke-dasharray="4 4" class="draw" style="--len:450;--d:.6s"/>
    <circle cx="-40" cy="-20" r="5" fill="#fff"/><circle cx="40" cy="-20" r="5" fill="#fff"/>${t(0, 30, '1° = ~111 km', 'lbl-b', 'text-anchor="middle"')}${t(0, 54, 'Meridyen yayı ölçümü', 'lbl-s', 'text-anchor="middle"')}`;
  V.astrolabe = () => {
    let ticks = '';
    for (let i = 0; i < 72; i++) {
      const a = (i * PI) / 36, l = i % 6 ? 8 : 16;
      ticks += `<line x1="${(cos(a) * 124).toFixed(1)}" y1="${(sin(a) * 124).toFixed(1)}" x2="${(cos(a) * (124 - l)).toFixed(1)}" y2="${(sin(a) * (124 - l)).toFixed(1)}" stroke="#6b4a1a" stroke-width="1.5"/>`;
    }
    return `<circle r="130" fill="url(#g-gold)"/><circle r="104" fill="#caa05a"/>${ticks}<circle r="104" fill="none" stroke="#6b4a1a" stroke-width="2"/><circle r="60" fill="none" stroke="#6b4a1a"/><circle r="30" fill="none" stroke="#6b4a1a"/>
      <g>${spin(0, 0, 24)}<g fill="none" stroke="#3a2a10" stroke-width="3"><circle cx="0" cy="-20" r="72"/><path d="M0,-100 L0,100 M-100,0 L100,0"/></g>${[[40, -60], [-60, -40], [70, 30], [-30, 70]].map(([x, y]) => `<path d="M${x},${y} l6,-12 l6,12Z" fill="#3a2a10"/>`).join('')}</g>
      <g>${spin(0, 0, 40, true)}<rect x="-120" y="-4" width="240" height="8" fill="#6b4a1a"/></g><circle r="6" fill="#3a2a10"/>`;
  };
  V.andromeda = () => {
    const R = P.rng(64);
    let d = '';
    for (let i = 0; i < 260; i++) {
      const k = R(), a = (i % 2) * PI + k * 5, rr = 8 + k * 110;
      d += `<circle cx="${(cos(a) * rr + (R() - 0.5) * 14).toFixed(1)}" cy="${(sin(a) * rr + (R() - 0.5) * 14).toFixed(1)}" r="${(0.6 + R() * 1.4).toFixed(1)}" fill="#fff" opacity="${(0.3 + R() * 0.6).toFixed(2)}"/>`;
    }
    return `${stars(40, 9, [-140, -140, 140, 140])}<g transform="rotate(-35) scale(1,.38)"><g class="fade-out" style="--d:1.6s"><ellipse rx="26" ry="26" fill="#dfe6ff" opacity=".5" filter="url(#f-soft)"/></g><g class="grow" style="--d:1.8s;--dur:2s;--from:.15">${d}<circle r="22" fill="url(#g-glow)"/></g></g>
      <g class="fade" style="--d:.4s"><text x="0" y="-60" class="lbl-s" text-anchor="middle">"küçük bir bulut"</text></g><g class="fade" style="--d:2.6s">${t(0, 110, 'Andromeda (M31)', 'lbl-gold', 'text-anchor="middle"')}</g>`;
  };
  V.moonorbit = () => {
    const pts = [];
    const a = 110, b = 80, e = Math.sqrt(1 - (b * b) / (a * a)), c = a * e;
    for (let i = 0; i <= 48; i++) {
      const M = (i / 48) * 2 * PI;
      let E = M;
      for (let k = 0; k < 6; k++) E = E - (E - e * sin(E) - M) / (1 - e * cos(E));
      pts.push(`${(a * cos(E) - c).toFixed(1)},${(b * sin(E)).toFixed(1)}`);
    }
    return `<ellipse cx="${-c}" rx="${a}" ry="${b}" fill="none" stroke="#8a95c8" stroke-opacity=".4"/>${planet('earth', 0, 0, 20, { spin: 12 })}<g><animateMotion values="${pts.join(';')}" dur="7s" repeatCount="indefinite"/>${planet('moon', 0, 0, 10)}</g>
      ${t(0, 120, 'Ay her evrede aynı hızda gitmez', 'lbl-s', 'text-anchor="middle"')}`;
  };
  V.moonsize = () => `<rect x="-150" y="70" width="300" height="80" fill="#10183e"/><line x1="-150" y1="70" x2="150" y2="70" stroke="#86d5ff" stroke-opacity=".4"/>
    ${planet('moon', -60, 44, 24)}${planet('moon', 60, -70, 24)}<g stroke="#e8b45a" fill="none"><path d="M-92,20 L-92,68 M-96,20 L-88,20 M-96,68 L-88,68"/><path d="M28,-94 L28,-46 M24,-94 L32,-94 M24,-46 L32,-46"/></g>
    ${t(0, 100, 'Ufukta büyük görünmesi bir yanılsama', 'lbl-s', 'text-anchor="middle"')}${t(0, 118, 'Ay\'ın boyutu değişmez', 'lbl-gold', 'text-anchor="middle"')}`;
  V.measure = () => `<circle cx="0" cy="560" r="520" fill="#18306e"/><path d="M-60,40 L-20,-50 L20,40Z" fill="#2a3a7a"/><circle cx="-20" cy="-54" r="4" fill="#fff"/>
    <line x1="-20" y1="-54" x2="150" y2="44" stroke="#e8b45a" stroke-dasharray="4 4" class="draw" style="--len:220;--d:.5s"/><line x1="-20" y1="-54" x2="150" y2="-54" stroke="#9aa4c8" stroke-dasharray="2 4"/><path d="M20,-54 A40,40 0 0,1 16,-34" fill="none" stroke="#e8b45a"/>${t(28, -38, 'α', 'lbl-gold')}
    ${t(0, 100, 'Dağ tepesinden ufuk açısı → Dünya yarıçapı', 'lbl-s', 'text-anchor="middle"')}`;
  V.crater = () => `${planet('moon', 0, 0, 118)}<g transform="translate(38,-30)"><circle r="12" fill="none" stroke="#e8b45a" stroke-width="3" class="pulse" style="--s:1.4"/></g><line x1="34" y1="-18" x2="10" y2="56" stroke="#e8b45a"/><rect x="-84" y="56" width="168" height="24" rx="12" fill="#0a1030" opacity=".85"/>${t(0, 73, 'Ali Kuşçu krateri', 'lbl-gold', 'text-anchor="middle"')}`;
  V.rocketman = () => `<rect x="-150" y="60" width="300" height="100" fill="#10204a"/><path d="M-150,60 L-100,40 L-80,50 L-60,30 L-40,40 L-40,60Z M40,60 L60,20 L64,60Z M80,60 L90,30 L100,60Z" fill="#0a1030"/><path d="M-150,78 q20,-6 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0" stroke="#86d5ff" stroke-opacity=".3" fill="none"/>
    <g transform="translate(0,40)"><g class="go" style="--ty:-150px;--tx:30px;--dur:3.4s;--d:.6s"><rect x="-4" y="-40" width="8" height="30" fill="#b8762e"/><path d="M-4,-40 L0,-50 L4,-40Z" fill="#8e2430"/><circle cx="0" cy="-8" r="5" fill="#c49670"/>${P.flame(8, 26, 0, -8)}</g></g>${t(0, 130, '1633 · Sarayburnu (Evliya Çelebi\'ye göre)', 'lbl-s', 'text-anchor="middle"')}`;
  V.heliocentric = () => {
    const orb = [[30, 'mercury', 3.5, 3], [46, 'venus', 5, 5], [66, 'earth', 6, 8], [86, 'mars', 4.5, 13], [108, 'jupiter', 9, 22], [130, 'saturn', 6, 34]];
    let s = '';
    orb.forEach(([r, k, pr, d], i) => {
      s += `<circle r="${r}" fill="none" stroke="#8a95c8" stroke-opacity=".3"/><g>${spin(0, 0, d)}<g transform="rotate(${i * 60}) translate(${r},0)">${planet(k, 0, 0, pr, { spin: 0, rings: false })}${k === 'earth' ? `<g>${spin(0, 0, 1.6)}<circle cx="11" r="2" fill="#e0ddd4"/></g>` : ''}</g></g>`;
    });
    return s + P.sun(0, 0, 14) + t(0, 34, 'Güneş merkezde', 'lbl-s lbl-gold', 'text-anchor="middle"');
  };
  V.ellipse = () => {
    const a = 120, b = 90, e = Math.sqrt(1 - (b * b) / (a * a)), c = a * e;
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const M = (i / 60) * 2 * PI;
      let E = M;
      for (let k = 0; k < 6; k++) E = E - (E - e * sin(E) - M) / (1 - e * cos(E));
      pts.push(`${(a * cos(E)).toFixed(1)},${(b * sin(E)).toFixed(1)}`);
    }
    return `<ellipse rx="${a}" ry="${b}" fill="none" stroke="#e8b45a" stroke-opacity=".7" class="draw" style="--len:700"/><path d="M${c},0 L${a},0 A${a},${b} 0 0,1 ${(a * cos(0.5)).toFixed(1)},${(b * sin(0.5)).toFixed(1)}Z" fill="#e8b45a" opacity=".22" class="fade" style="--d:1.6s"/><path d="M${c},0 L${-a},0 A${a},${b} 0 0,1 ${(-a * cos(0.18)).toFixed(1)},${(-b * sin(0.18)).toFixed(1)}Z" fill="#86d5ff" opacity=".22" class="fade" style="--d:1.8s"/>
      ${P.sun(c, 0, 10)}<g><animateMotion values="${pts.join(';')}" dur="8s" repeatCount="indefinite"/>${planet('earth', 0, 0, 8, { spin: 0 })}</g>
      <g class="fade" style="--d:1s">${t(a - 4, -12, 'Günberi', 'lbl-s lbl-gold', 'text-anchor="end"')}${t(a - 4, 4, '3 Ocak', 'lbl-s', 'text-anchor="end"')}${t(-a + 6, -12, 'Günöte', 'lbl-s lbl-gold')}${t(-a + 6, 4, '4 Temmuz', 'lbl-s')}</g>${t(0, 124, 'Eşit sürede eşit alan', 'lbl-s', 'text-anchor="middle"')}`;
  };
  V.jupiterMoons = () => {
    const moons = [['Io', 44, 1.8], ['Europa', 62, 3.6], ['Ganymede', 86, 7.2], ['Callisto', 118, 16.8]];
    let s = planet('jupiter', 0, 0, 26);
    moons.forEach(([n, A, T]) => {
      s += `<circle r="3.4" fill="#f4f0e4"><animate attributeName="cx" values="${A};0;${-A};0;${A}" keyTimes="0;.25;.5;.75;1" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1" dur="${T}s" repeatCount="indefinite"/></circle>`;
    });
    return `${stars(24, 41, [-140, -140, 140, 140])}${s}${t(0, 60, 'Io · Europa · Ganymede · Callisto', 'lbl-s', 'text-anchor="middle"')}${t(0, 80, 'Galileo Uyduları · 1610', 'lbl-gold', 'text-anchor="middle"')}`;
  };
  V.rings = () => { const o = P.orbit3d({ cx: 0, cy: 0, rx: 124, ry: 34, dur: 9, depth: 0.3, body: '<circle r="5" fill="#e3a54a"/><text x="8" y="-6" class="lbl-s">Titan</text>' }); return `${stars(20, 43, [-140, -140, 140, 140])}${o.back}${planet('saturn', 0, 0, 36)}${o.front}${t(0, 110, 'İnce, düz bir halka · 7 ana halka', 'lbl-s', 'text-anchor="middle"')}`; };

  V.gravity = () => `${(() => { const o = P.orbit3d({ cx: 0, cy: 30, rx: 112, ry: 44, dur: 9, depth: 0.25, body: planet('moon', 0, 0, 9) }); return `<ellipse cx="0" cy="30" rx="112" ry="44" fill="none" stroke="#8a95c8" stroke-opacity=".35"/>${o.back}${planet('earth', 0, 30, 34, { spin: 16 })}${o.front}`; })()}
    <g transform="translate(-70,-110)"><circle r="7" fill="#e0402e" class="move-in" style="--fy:0px;--ty:92px;--dur:1.4s;animation-iteration-count:infinite"/></g><path d="M-70,-122 q-6,-8 -2,-12" stroke="#3a8a3a" stroke-width="3" fill="none"/>
    ${t(0, -60, 'F = G·m₁·m₂ / r²', 'lbl-gold', 'text-anchor="middle"')}${t(0, 108, 'Elmayı ve Ay\'ı aynı kuvvet çeker', 'lbl-s', 'text-anchor="middle"')}`;
  V.nebulae = () => {
    const o = [[-70, -60, '#ff7a5c', 'M1 Yengeç'], [60, -70, '#c9b6ff', 'M31 Andromeda'], [-60, 50, '#7fd4ff', 'M42 Avcı'], [70, 40, '#9fd0ff', 'M45 Ülker']];
    return stars(30, 47, [-140, -140, 140, 140]) + o.map(([x, y, c, n], i) => `<g transform="translate(${x},${y})"><g class="pop" style="--d:${0.4 + i * 0.5}s"><ellipse rx="26" ry="16" fill="${c}" opacity=".5" filter="url(#f-soft)"/><circle r="3" fill="#fff"/></g></g><g class="fade" style="--d:${0.6 + i * 0.5}s">${t(x, y + 32, n, 'lbl-s', 'text-anchor="middle"')}</g>`).join('');
  };
  V.uranus = () => `<circle r="140" fill="#050817"/>${stars(40, 51, [-140, -140, 140, 140])}<g stroke="#86d5ff" stroke-opacity=".3"><line x1="-140" y1="0" x2="140" y2="0"/><line x1="0" y1="-140" x2="0" y2="140"/></g>${planet('uranus', 0, 0, 12, { rings: false })}
    <g class="fade" style="--d:.6s">${t(20, -20, 'kuyruklu yıldız mı?', 'lbl-s')}</g><g class="fade" style="--d:2.2s">${t(20, 30, 'Yeni gezegen: Uranüs', 'lbl-gold')}</g>`;
  V.nebulaDisk = () => {
    const R = P.rng(71);
    let d = '';
    for (let i = 0; i < 200; i++) {
      const a = R() * 2 * PI, rr = 14 + R() * 120;
      d += `<circle cx="${(cos(a) * rr).toFixed(1)}" cy="${(sin(a) * rr).toFixed(1)}" r="${(0.8 + R() * 1.5).toFixed(1)}" fill="#d9b98a" opacity=".7"/>`;
    }
    return `<g transform="scale(1,.4)"><g>${spin(0, 0, 10)}${d}</g></g><g class="grow" style="--d:1s;--dur:2s">${P.sun(0, 0, 14)}</g>${t(0, 90, 'Dönen bulutsu → Güneş ve gezegenler', 'lbl-s', 'text-anchor="middle"')}`;
  };
  V.parallax = () => `${stars(30, 61, [-140, -140, 140, -70])}<circle r="60" fill="none" stroke="#8a95c8" stroke-opacity=".4" transform="translate(0,60)"/>${P.sun(0, 60, 9)}
    ${planet('earth', -60, 60, 7, { spin: 0 })}${planet('earth', 60, 60, 7, { spin: 0 })}${t(-60, 86, 'Ocak', 'lbl-s', 'text-anchor="middle"')}${t(60, 86, 'Temmuz', 'lbl-s', 'text-anchor="middle"')}
    <line x1="-60" y1="60" x2="0" y2="-60" stroke="#e8b45a" stroke-dasharray="4 4"/><line x1="60" y1="60" x2="0" y2="-60" stroke="#e8b45a" stroke-dasharray="4 4"/>
    <circle cy="-60" r="4" fill="#fff"><animate attributeName="cx" values="-6;6;-6" dur="3s" repeatCount="indefinite"/></circle>${t(10, -70, 'yakın yıldız', 'lbl-s')}${t(0, -30, 'p', 'lbl-gold', 'text-anchor="middle"')}${t(0, 118, '1 parsek ≈ 3,26 ışık yılı', 'lbl-gold', 'text-anchor="middle"')}`;
  V.neptune = () => `<g transform="translate(-60,0) rotate(-6)"><rect x="-60" y="-80" width="110" height="140" fill="#efe2bf"/>${[-60, -44, -28, -12, 4, 20, 36].map((y, i) => `<path d="M-50,${y} h${60 + (i % 3) * 12}" stroke="#6b5a3a" class="draw" style="--len:90;--d:${0.2 + i * 0.2}s"/>`).join('')}<text x="-50" y="52" style="fill:#6b3a1a;font-size:12px">δ = 1° güneydoğu</text></g>
    <path d="M10,-10 Q60,-60 86,-30" stroke="#e8b45a" fill="none" stroke-dasharray="4 4" class="draw" style="--len:120;--d:1.6s"/><g class="pop" style="--d:2.2s">${planet('neptune', 92, -20, 10, { rings: false })}</g><g class="fade" style="--d:2.4s">${t(92, 6, 'Neptün', 'lbl-gold', 'text-anchor="middle"')}</g>`;
  V.spectrum = () => `${P.sun(0, -70, 24)}<rect x="-120" y="10" width="240" height="40" fill="url(#g-rainbow)" class="grow" style="--o:0% 50%"/>${[-92, -60, -8, 30, 64, 96].map((x, i) => `<rect x="${x}" y="10" width="3" height="40" fill="#050817" class="fade" style="--d:${1 + i * 0.2}s"/>`).join('')}
    <g class="fade" style="--d:2s">${t(-62, 70, 'H', 'lbl-gold', 'text-anchor="middle"')}${t(30, 70, 'He', 'lbl-gold', 'text-anchor="middle"')}${t(0, 100, 'Yıldızlar çoğunlukla hidrojen', 'lbl-s', 'text-anchor="middle"')}</g>`;
  V.cepheid = () => {
    let d = 'M-120,40';
    for (let x = -120; x <= 120; x += 4) d += ` L${x},${(40 - 26 * (0.5 + 0.5 * sin((x + 120) / 16)) - (((x + 120) % 100) < 30 ? 6 : 0)).toFixed(1)}`;
    return `<g transform="translate(0,-60)"><circle r="16" fill="url(#g-sun)" class="pulse" style="--s:1.35;--dur:1.6s"/><circle r="30" fill="url(#g-glow)" class="pulse" style="--s:1.35;--dur:1.6s"/></g><line x1="-120" y1="44" x2="120" y2="44" stroke="#8a95c8" stroke-opacity=".5"/><path d="${d}" fill="none" stroke="#e8b45a" stroke-width="2" class="draw" style="--len:500;--d:.6s"/>
      ${t(0, 76, 'Değişen yıldızın ışık eğrisi', 'lbl-s', 'text-anchor="middle"')}${t(0, 96, 'O · B · A · F · G · K · M', 'lbl-gold', 'text-anchor="middle"')}`;
  };
  V.spacetime = () => {
    let g = '';
    const warp = (x, y) => {
      const r = Math.hypot(x, y) || 1, f = 34 / (r + 22);
      return [x - x * f * 0.9, y - y * f * 0.9];
    };
    for (let v = -140; v <= 140; v += 20) {
      let a = '', b = '';
      for (let u = -140; u <= 140; u += 10) {
        const [x1, y1] = warp(u, v); const [x2, y2] = warp(v, u);
        a += `${u === -140 ? 'M' : 'L'}${x1.toFixed(1)},${y1.toFixed(1)}`;
        b += `${u === -140 ? 'M' : 'L'}${x2.toFixed(1)},${y2.toFixed(1)}`;
      }
      g += `<path d="${a}" fill="none" stroke="#86d5ff" stroke-opacity=".25"/><path d="${b}" fill="none" stroke="#86d5ff" stroke-opacity=".25"/>`;
    }
    return `${g}${P.sun(0, 0, 14)}<g>${spin(0, 0, 30)}<ellipse cx="12" rx="70" ry="48" fill="none" stroke="#e8b45a" stroke-opacity=".6"/><g>${P.motion(P.orbitPath(12, 0, 70, 48), 3)}${planet('mercury', 0, 0, 5, { spin: 0 })}</g></g>${t(0, 120, 'Merkür\'ün günberi kayması', 'lbl-s lbl-gold', 'text-anchor="middle"')}`;
  };
  V.expansion = () => {
    const R = P.rng(83);
    let s = '';
    for (let i = 0; i < 16; i++) {
      const x = (R() - 0.5) * 200, y = (R() - 0.5) * 200, k = Math.hypot(x, y) / 140;
      s += `<g transform="translate(${x.toFixed(0)},${y.toFixed(0)})"><g class="move" style="--tx:${(x * 0.5).toFixed(0)}px;--ty:${(y * 0.5).toFixed(0)}px;--dur:6s;--d:.4s"><ellipse rx="9" ry="4" fill="${k > 0.55 ? '#ff9a7a' : '#dfe6ff'}" opacity=".8" transform="rotate(${(R() * 180).toFixed(0)})"/></g></g>`;
    }
    return `${planet('earth', 0, 0, 0.1)}${s}<circle r="4" fill="#e8b45a"/>${t(0, 124, 'Uzaktaki gökada daha hızlı uzaklaşır', 'lbl-s', 'text-anchor="middle"')}`;
  };
  V.blink = () => {
    const R = P.rng(91);
    let st = '';
    for (let i = 0; i < 24; i++) st += `<circle cx="${(-100 + R() * 200).toFixed(0)}" cy="${(-90 + R() * 150).toFixed(0)}" r="${(1 + R() * 1.6).toFixed(1)}" fill="#fff"/>`;
    return `<rect x="-110" y="-100" width="220" height="170" fill="#0a1030" stroke="#86d5ff" stroke-opacity=".4"/>${st}<circle cx="-20" cy="10" r="2.6" fill="#ffe7a8" class="blink" style="--dur:1.2s"/><circle cx="-10" cy="12" r="2.6" fill="#ffe7a8" class="blink" style="--dur:1.2s;--d:.6s"/><circle cx="-15" cy="11" r="12" fill="none" stroke="#e8b45a" class="fade" style="--d:1.5s"/>
      ${t(0, 94, '23 Ocak ↔ 29 Ocak 1930 plakaları', 'lbl-s', 'text-anchor="middle"')}${t(0, 114, 'Plüton!', 'lbl-gold', 'text-anchor="middle"')}`;
  };
  V.moontarget = () => `${stars(30, 93, [-140, -140, 140, 140])}${planet('earth', -80, 70, 30, { spin: 12 })}${planet('moon', 80, -60, 22)}<circle cx="80" cy="-60" r="34" fill="none" stroke="#e8b45a" stroke-dasharray="3 5" class="spin" style="--dur:12s"/>
    <path d="M-60,50 Q-20,-80 60,-60" fill="none" stroke="#e8b45a" stroke-dasharray="4 5" class="draw" style="--len:220;--d:.6s"/>${t(0, 120, '"Bu on yıl bitmeden Ay\'a"', 'lbl-gold', 'text-anchor="middle"')}`;
  V.starmap = () => {
    const R = P.rng(97);
    let s = stars(50, 99, [-140, -140, 140, 140]);
    const p = [[-80, -40], [-40, -70], [0, -50], [30, -10], [70, -30], [90, 20]];
    s += `<path d="M${p.map((q) => q.join(',')).join(' L')}" stroke="#e8b45a" stroke-opacity=".7" fill="none" class="draw" style="--len:300"/>${p.map((q) => `<circle cx="${q[0]}" cy="${q[1]}" r="3" fill="#fff"/>`).join('')}`;
    s += `<path d="M30,-10 L50,30" stroke="#ff8075" stroke-width="2" stroke-dasharray="3 3" class="draw" style="--len:50;--d:1.6s"/><circle cx="50" cy="30" r="3" fill="#ff8075" class="fade" style="--d:1.8s"/>`;
    R();
    return s + t(0, 80, 'Düzeltilmiş gök haritası', 'lbl-s', 'text-anchor="middle"') + t(0, 100, 'Celâlî takvimi: 1079', 'lbl-gold', 'text-anchor="middle"');
  };
  V.tables = () => {
    let s = '<rect x="-110" y="-100" width="220" height="180" fill="#efe2bf"/>';
    for (let r = 0; r < 8; r++) {
      s += `<line x1="-100" y1="${-78 + r * 20}" x2="100" y2="${-78 + r * 20}" stroke="#b89a60"/>`;
      for (let c = 0; c < 4; c++) s += `<text x="${-92 + c * 50}" y="${-83 + r * 20}" class="fade" style="fill:#5a4020;font-size:11px;--d:${(r * 0.1 + c * 0.05).toFixed(2)}s">${((r * 7 + c * 13) % 60).toString().padStart(2, '0')}°${((r * 11 + c * 17) % 60).toString().padStart(2, '0')}'</text>`;
    }
    return s + t(0, 104, 'Gezegen konum tabloları (zîc)', 'lbl-s', 'text-anchor="middle"');
  };
})();
