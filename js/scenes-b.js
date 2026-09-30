/* Sahneler (2/2): Roket çağından bugüne. */
(function () {
  'use strict';
  const P = window.ScenePart;
  const S = (window.SCENES = window.SCENES || {});
  const { svg, t, spin, stars, planet } = P;
  const cos = Math.cos, sin = Math.sin, PI = Math.PI;

  const earthArc = (cy = 900, r = 560, spinS = 70) => `<g>${planet('earth', 400, cy, r, { spin: spinS, glow: true })}</g>`;
  const lines = (arr, x = 56, y = 44, anchor = 'start', d0 = 0.8) => `<g class="fade" style="--d:${d0}s">${arr.map((s, i) => t(x, y + i * 20, s, i === 0 ? '' : i === arr.length - 1 ? 'lbl-s lbl-gold' : 'lbl-s', `text-anchor="${anchor}"`)).join('')}</g>`;
  const pad = (x = 400, y = 380) => `<rect x="${x - 70}" y="${y}" width="140" height="10" fill="#3a4270"/><rect x="${x - 110}" y="${y + 10}" width="220" height="70" fill="#1a2046"/>`;
  const tower = (x, y, h) => `<g stroke="#5a6488" stroke-width="2" fill="none"><rect x="${x}" y="${y - h}" width="24" height="${h}"/>${Array.from({ length: Math.floor(h / 24) }, (_, i) => `<path d="M${x},${y - i * 24} L${x + 24},${y - (i + 1) * 24} M${x + 24},${y - i * 24} L${x},${y - (i + 1) * 24}"/>`).join('')}</g>`;
  const football = (r = 14) => `<g><circle r="${r}" fill="#f5f5f5"/><g fill="#1b1f2a"><polygon points="0,${-r * 0.35} ${r * 0.33},${-r * 0.1} ${r * 0.2},${r * 0.3} ${-r * 0.2},${r * 0.3} ${-r * 0.33},${-r * 0.1}"/><path d="M${-r * 0.95},${-r * 0.2} l${r * 0.3},${-r * 0.2} l${r * 0.05},${r * 0.4}Z M${r * 0.95},${-r * 0.2} l${-r * 0.3},${-r * 0.2} l${-r * 0.05},${r * 0.4}Z M${-r * 0.3},${r * 0.9} l${r * 0.1},${-r * 0.3} l${r * 0.4},0 l${r * 0.1},${r * 0.3}Z"/></g></g>`;

  // ─── Roketler
  const ROCKET_INFO = {
    goddard: ['16 Mart 1926 · Auburn, Massachusetts', 'Robert Goddard · ilk sıvı yakıtlı roket', 'Uçuş: 2,5 saniye · 12 metre'],
    newshepard: ['Temmuz 2021 · uzay turizmi', 'New Shepard (Blue Origin) · 20 Temmuz', 'Virgin Galactic (Branson) · 11 Temmuz'],
    sls: ['16 Kasım 2022 · Artemis I', 'SLS roketi + Orion kapsülü', 'Apollo\'dan 50 yıl sonra Ay\'a dönüş'],
    starship: ['20 Nisan 2023 · Starbase, Teksas', 'Starship: tarihin en büyük roketi', '120 metreyi aşkın · tamamen yeniden kullanım hedefi'],
  };
  S.rocket = function (sc) {
    const v = sc.v;
    if (v === 'falconLand') {
      return svg(`${stars(40, 3, [0, 0, 800, 250])}${pad()}<ellipse cx="400" cy="382" rx="60" ry="8" fill="none" stroke="#e8b45a" stroke-width="2"/>${t(392, 386, 'X', 'lbl-gold')}
        <g transform="translate(400,378)"><g class="move" style="--fy:-420px;--dur:3.6s;--d:.2s">${P.rocket('falcon9', { legs: true, flame: false })}<g class="fade-out" style="--d:3.6s"><g transform="translate(0,0)">${P.flame(14, 50)}</g></g></g></g>
        <g class="fade" style="--d:3.6s">${P.smoke(400, 382, 6, 9, 160)}</g>${lines(['21 Aralık 2015 · Cape Canaveral', 'Falcon 9 ilk kademesi geri dönüp dikey kondu', 'Rekor: tek fırlatışta 143 uydu (2021)'])}`);
    }
    const r = { goddard: 'goddard', newshepard: 'newshepard', sls: 'sls', starship: 'starship' }[v] || v;
    const k = v === 'starship' ? 1 : v === 'goddard' ? 1.6 : 1.1;
    const ty = v === 'goddard' ? -110 : -720;
    const extra = v === 'starship' ? tower(470, 380, 300) : v === 'goddard' ? '<path d="M0,386 L800,386 L800,450 L0,450Z" fill="#dfe6f4" opacity=".22"/><g transform="translate(400,380) scale(1.6)"><path d="M-22,0 L0,-96 L22,0" stroke="#8a93b0" stroke-width="2" fill="none"/><line x1="-14" y1="-30" x2="14" y2="-30" stroke="#8a93b0" stroke-width="2"/></g>' : tower(445, 380, 240);
    return svg(`${stars(50, 5, [0, 0, 800, 300])}${pad()}${extra}
      <g class="fade-out" style="--d:1.2s">${t(400, 140, '3 · 2 · 1', 'lbl-b', 'text-anchor="middle"')}</g>
      <g transform="translate(400,380) scale(${k})"><g class="go" style="--d:1.5s;--dur:${v === 'goddard' ? 2.5 : 5}s;--ty:${ty}px"><g class="shake" style="--d:.9s">${P.rocket(r)}</g></g></g>
      ${v === 'goddard' ? P.smoke(400, 384, 4, 7, 50).replace(/r="(\d+)"/g, (m, r) => `r="${Math.round(r / 2.5)}"`) : P.smoke(400, 384, 12, 7, 220)}${lines(ROCKET_INFO[v] || [])}`);
  };

  // ─── Yörüngede uydular
  S.orbit = function (sc, ev) {
    const v = sc.v;
    if (v === 'geo') {
      return svg(`${stars(60, 21)}<g transform="translate(400,225)">${planet('earth', 0, 0, 62, { spin: 20 })}<circle r="170" fill="none" stroke="#8a95c8" stroke-opacity=".35" stroke-dasharray="4 6"/>
        <g>${spin(0, 0, 24)}${[0, 120, 240].map((a) => `<g transform="rotate(${a}) translate(170,0)"><path d="M0,0 L-108,-50 L-108,50Z" fill="#86d5ff" opacity=".16"/><g transform="rotate(90)">${P.sat('geo', 0.6)}</g></g>`).join('')}</g></g>
        ${lines(['1945 · Arthur C. Clarke\'ın makalesi', '3 uydu = bütün Dünya\'ya yayın', 'Yükseklik ~36.000 km · günde 1 tur: gökte sabit'])}`);
    }
    if (v === 'explorer') {
      return svg(`${stars(60, 22)}<g transform="translate(400,225)"><g fill="none" stroke-width="22" opacity=".25"><ellipse rx="120" ry="60" stroke="#ff9a5a"/><ellipse rx="200" ry="100" stroke="#86d5ff"/></g>${planet('earth', 0, 0, 56, { spin: 20 })}
        <ellipse rx="230" ry="80" fill="none" stroke="#8a95c8" stroke-opacity=".35" stroke-dasharray="4 6" transform="rotate(-18)"/><g transform="rotate(-18)"><g>${P.motion(P.orbitPath(0, 0, 230, 80), 7)}${P.sat('explorer', 0.8)}</g></g></g>
        ${lines(['31 Ocak 1958 · Explorer 1', 'ABD\'nin ilk başarılı uydusu', 'Van Allen radyasyon kuşaklarını buldu · NASA: Ekim 1958'])}`);
    }
    if (v === 'debris') {
      const R = P.rng(66);
      let junk = '';
      for (let i = 0; i < 70; i++) {
        const rr = 90 + R() * 150, dur = 6 + R() * 18, a0 = R() * 360, s = 1.5 + R() * 3;
        junk += `<g>${spin(0, 0, dur, R() < 0.3)}<rect x="${(cos(a0) * rr).toFixed(0)}" y="${(sin(a0) * rr * 0.55).toFixed(0)}" width="${s.toFixed(1)}" height="${(s * 0.6).toFixed(1)}" fill="#b8c0cc" opacity=".8"/></g>`;
      }
      return svg(`${stars(40, 24)}<g transform="translate(400,225)">${planet('earth', 0, 0, 70, { spin: 20 })}${junk}
        <g transform="translate(-140,-110)"><g class="move" style="--tx:140px;--ty:0px;--dur:2.6s;--d:.4s"><g class="fade-out" style="--d:3s;--dur:.2s">${P.sat('geo', 0.5)}</g></g></g>
        <g transform="translate(140,-110)"><g class="move" style="--tx:-140px;--dur:2.6s;--d:.4s"><g class="fade-out" style="--d:3s;--dur:.2s">${P.sat('sputnik', 0.7)}</g></g></g>
        <g transform="translate(0,-110)"><circle r="40" fill="url(#g-wglow)" class="flash" style="--d:3s"/>${Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * 2 * PI; return `<rect width="3" height="2" fill="#dfe3ea" class="move" style="--tx:${(cos(a) * 90).toFixed(0)}px;--ty:${(sin(a) * 60).toFixed(0)}px;--fo:0;--dur:3s;--d:3s"/>`; }).join('')}</g></g>
        ${lines(['10 Şubat 2009 · Sibirya üzerinde', 'Iridium 33 ile ölü Kosmos 2251 çarpıştı', 'En çok uzay çöpü: ABD · ClearSpace çöp toplayacak'])}`);
    }
    if (v === 'starlink') {
      let train = '';
      for (let i = 0; i < 22; i++) train += `<circle cx="${-i * 22}" cy="${i * 9}" r="2" fill="#fff"/>`;
      return svg(`${stars(120, 25, [0, 0, 800, 330])}<g transform="translate(120,40)"><g class="go-lin" style="--tx:760px;--ty:220px;--dur:12s">${train}</g></g>
        <path d="M0,360 L60,350 L90,360 L140,330 L150,360 L220,356 L260,340 L300,358 L800,352 L800,450 L0,450Z" fill="#070a1a"/>${[180, 260, 520, 610].map((x) => `<rect x="${x}" y="336" width="6" height="16" fill="#ffd27a" opacity=".6"/>`).join('')}
        ${lines(['Mayıs 2019\'dan beri · SpaceX', 'Starlink "treni": gökte sıra hâlinde ışıklar', 'Vaat: her yerde yüksek hızlı internet · rakip: Project Kuiper'], 56, 380)}`);
    }
    if (v === 'turksat' || v === 'rasat') {
      const big = v === 'turksat';
      return svg(`${stars(60, 26, [0, 0, 800, 330])}${earthArc(900, 570, 90)}
        <g transform="translate(470,150)"><g class="bob" style="--dur:6s">${P.sat(big ? 'turksat' : 'landsat', big ? 1.4 : 1)}</g></g>
        ${big ? '<path d="M470,170 L360,352 L440,356Z" fill="#86d5ff" opacity=".12" class="glowp"/><circle cx="400" cy="352" r="6" fill="#e30a17" class="pulse" style="--s:1.6"/>' + t(412, 348, 'Türkiye', 'lbl-s') : ''}
        ${big ? lines(['Türksat · yer sabit yörünge (~35.786 km)', 'Türksat 1B (1994) → 3A (2008) → 5A, 5B (2021) → 6A (2024)', 'Türksat 5B yörünge konumu: 42° Doğu']) : lines(['RASAT · 17 Ağustos 2011', 'Türkiye\'de tasarlanan ilk yer gözlem uydusu', 'Göktürk-2: Aralık 2012'])}`);
    }
    if (v === 'landsat') {
      return svg(`${stars(40, 27, [0, 0, 800, 300])}${earthArc(920, 590, 30)}<g>${P.motion('M-80,120 L880,120', 10)}${P.sat('landsat', 1.2)}</g>${lines(['Temmuz 1972 · Landsat 1', 'İlk uzaktan algılama uydusu', 'Ormanlar, tarlalar, şehirler uzaydan izleniyor'])}`);
    }
    if (v === 'telstar') {
      return svg(`${stars(50, 28, [0, 0, 800, 300])}${earthArc(920, 590, 0)}
        <circle cx="180" cy="372" r="5" fill="#e8b45a"/><circle cx="620" cy="372" r="5" fill="#e8b45a"/>${t(180, 362, 'Andover (ABD)', 'lbl-s', 'text-anchor="middle"')}${t(620, 362, 'Pleumeur-Bodou (Fransa)', 'lbl-s', 'text-anchor="middle"')}
        <path d="M180,372 L400,110 L620,372" fill="none" stroke="#86d5ff" stroke-width="2" stroke-dasharray="6 6" class="draw" style="--len:600;--d:1s"/>
        <g transform="translate(400,110)"><g class="pop" style="--d:.3s">${P.sat('telstar', 1.6)}</g></g><g transform="translate(560,120)"><g class="fade" style="--d:1.8s">${football(16)}${t(56, 5, '= ilham', 'lbl-s')}</g></g>
        ${lines(['Telstar 1 · Temmuz 1962', 'Atlantik aşırı ilk canlı TV yayını', 'Syncom 3 (1964): ilk jeostatik haberleşme uydusu'])}`);
    }
    // sputnik (varsayılan)
    const arc = 'M-60,300 Q400,20 860,300';
    return svg(`${stars(70, 29, [0, 0, 800, 330])}${earthArc(920, 580, 60)}<path d="${arc}" fill="none" stroke="#8a95c8" stroke-opacity=".3" stroke-dasharray="4 6"/>
      <g>${P.motion(arc, 9)}<g><circle r="20" fill="none" stroke="#ffe7a8" class="ripple" style="--dur:1.8s"/><circle r="20" fill="none" stroke="#ffe7a8" class="ripple" style="--dur:1.8s;--d:.9s"/></g>${P.sat('sputnik', 1.4)}<text x="18" y="-18" class="lbl-gold blink" style="--dur:.9s">bip</text></g>
      ${lines(['4 Ekim 1957 · Baykonur Kozmodromu', 'Sputnik 1: ilk yapay uydu (SSCB)', '58 cm çap · 96 dakikada bir tur · uzay yarışı başladı'])}`);
  };

  // ─── Kapsül ve içindekiler
  const CAP_INFO = {
    fly: ['vostok', ['1947 · V-2 roketi', 'Uzaya çıkan ilk canlılar: meyve sinekleri', '1948 · Albert (maymun) · 2007 · tardigradlar vakumda']],
    dog: ['vostok', ['3 Kasım 1957 · Sputnik 2', 'Laika: yörüngeye çıkan ilk canlı', 'Moskova sokaklarından bir köpek']],
    human: ['vostok', ['12 Nisan 1961 · Vostok-1', 'Yuri Gagarin: uzaydaki ilk insan', '108 dakikada Dünya\'nın çevresinde bir tur']],
    woman: ['vostok', ['16 Haziran 1963 · Vostok 6', 'Valentina Tereşkova: uzaydaki ilk kadın', '3 gün, 48 tur · sonra Nikolayev ile evlendi']],
    taikonaut: ['shenzhou', ['15 Ekim 2003 · Shenzhou 5', 'Yang Liwei: Çin\'in ilk taykonotu', 'Kendi imkânıyla insan gönderen 3. ülke']],
  };
  S.capsule = function (sc) {
    const [shape, info] = CAP_INFO[sc.who] || CAP_INFO.human;
    const clip = P.uid('cw');
    const faceInset = P.faces[sc.who] || '';
    return svg(`${stars(80, 31, [0, 0, 800, 330])}${earthArc(920, 580, 50)}
      <g transform="translate(330,190)"><g class="bob" style="--dur:6s;--by:-10px"><g transform="scale(1.6)">${P.capsule(shape, sc.who)}</g></g></g>
      <g transform="translate(620,170)"><g class="pop" style="--d:1s"><circle r="70" fill="#0a1030" stroke="#cfd6e4" stroke-width="5"/><clipPath id="${clip}"><circle r="66"/></clipPath><g clip-path="url(#${clip})"><g transform="scale(8.5)">${faceInset}</g></g><circle cx="-24" cy="-28" r="12" fill="#fff" opacity=".18"/></g></g>
      ${lines(info)}`);
  };

  // ─── Uzay yürüyüşü
  S.spacewalk = function (sc) {
    const info = {
      leonov: ['18 Mart 1965 · Voshod 2', 'Aleksey Leonov: ilk uzay yürüyüşü (12 dk)', 'Şişen giysiyle kapsüle zor döndü'],
      gemini: ['3 Haziran 1965 · Gemini 4', 'Ed White: Amerikalıların ilk uzay yürüyüşü', 'Uzayda tükenmez kalem çalışmaz → Fisher uzay kalemi'],
      duo: ['18 Ekim 2019 · ISS', 'Christina Koch ve Jessica Meir: ilk kadın ekip yürüyüşü', 'Koch: 328 gün · Whitson: 665 gün · S. Kelly: 340 gün'],
    }[sc.v] || [];
    const craft = sc.v === 'duo'
      ? `<g transform="translate(160,110)"><rect x="-200" y="-6" width="380" height="12" fill="#9aa3b5"/><rect x="60" y="-110" width="36" height="104" fill="#b8762e" stroke="#e8b45a"/><rect x="60" y="6" width="36" height="104" fill="#b8762e" stroke="#e8b45a"/></g>`
      : `<g transform="translate(200,170) scale(1.8)">${P.capsule(sc.v === 'gemini' ? 'gemini' : 'vostok', 'human')}</g>`;
    const tether = sc.v === 'duo' ? '' : '<path d="M230,160 C300,120 360,250 440,196" fill="none" stroke="#e8edf5" stroke-width="2"/>';
    const astro = sc.v === 'duo'
      ? `<g transform="translate(380,170)"><g class="bob" style="--dur:7s"><g transform="rotate(-20) scale(1.8)">${P.astronaut(1)}</g></g></g><g transform="translate(520,210)"><g class="bob" style="--dur:8s;--d:1s"><g transform="rotate(15) scale(1.8)">${P.astronaut(1)}</g></g></g>`
      : `<g transform="translate(460,200)"><g class="bob" style="--dur:7s;--bx:6px"><g transform="rotate(-30) scale(2)">${P.astronaut(1, { flag: sc.v === 'leonov' ? '#c8102e' : '#3a5bd9' })}</g></g></g>`;
    return svg(`${stars(70, 33, [0, 0, 800, 330])}${earthArc(920, 600, 80)}${craft}${tether}${astro}${lines(info)}`);
  };

  S.escape = function () {
    const path = 'M150,300 C240,180 330,150 420,190 C520,240 620,200 700,120';
    return svg(`${stars(80, 35)}${planet('earth', 150, 310, 44, { spin: 20 })}${planet('moon', 360, 180, 12)}<g transform="translate(820,60)">${P.sun(0, 0, 60)}</g>
      <path d="${path}" fill="none" stroke="#e8b45a" stroke-dasharray="4 6" class="draw" style="--len:700;--dur:3s"/><g>${P.motion(path, 6)}${P.probe('pioneer', 0.8)}</g>
      ${lines(['1959 · Luna 1 ve Pioneer 4', 'Dünya\'nın çekiminden kurtulan ilk sondalar', 'Uzay sondası: gezegenler arası robotik araç'], 56, 380)}`);
  };

  S.seti = function () {
    let waves = '';
    for (let i = 0; i < 6; i++) waves += `<path d="M${640 - i * 50},${60 + i * 36} q14,-10 28,0 t28,0" stroke="#86d5ff" fill="none" opacity=".6" class="fade" style="--d:${0.3 + i * 0.3}s"/>`;
    return svg(`${stars(90, 37, [0, 0, 800, 320])}<path d="M0,370 Q400,350 800,372 L800,450 L0,450Z" fill="url(#g-hill)"/>
      <g transform="translate(300,360)"><rect x="-6" y="-60" width="12" height="60" fill="#8a93a5"/><g transform="rotate(-35 0 -70)"><path d="M-90,-70 Q0,-10 90,-70" fill="#dfe3ea" stroke="#8a93a5"/><line x1="0" y1="-40" x2="0" y2="-120" stroke="#8a93a5" stroke-width="2"/></g></g>
      ${waves}${P.glowDot(700, 50, 3, '#ffe7a8', 'twinkle')}
      <g transform="translate(-80,110)"><g class="go-lin" style="--tx:980px;--ty:-40px;--dur:7s;--d:1.2s"><ellipse rx="30" ry="8" fill="#b8c0cc"/><ellipse cy="-6" rx="12" ry="8" fill="#86d5ff" opacity=".6"/></g></g>
      ${lines(['1960 · Project Ozma · Frank Drake', 'SETI: Dünya dışı zeki yaşam arayışı', 'UFO = Unidentified Flying Object (Tanımlanamayan Uçan Cisim)'], 56, 400)}`);
  };

  S.cmb = function () {
    const R = P.rng(39);
    let blobs = '';
    const cols = ['#2a5bd0', '#3fbfa6', '#e2c15c', '#ff7d5c', '#8b7bff'];
    for (let i = 0; i < 140; i++) blobs += `<circle cx="${(-320 + R() * 640).toFixed(0)}" cy="${(-130 + R() * 260).toFixed(0)}" r="${(8 + R() * 16).toFixed(0)}" fill="${cols[Math.floor(R() * 5)]}" opacity=".5"/>`;
    const clip = P.uid('cmb');
    return svg(`<g transform="translate(400,170)"><clipPath id="${clip}"><ellipse rx="330" ry="130"/></clipPath><g class="fade" style="--d:1.2s;--dur:2s"><g clip-path="url(#${clip})" filter="url(#f-soft)">${blobs}</g></g><ellipse rx="330" ry="130" fill="none" stroke="#86d5ff" stroke-opacity=".4"/></g>
      <path d="M0,380 Q400,360 800,382 L800,450 L0,450Z" fill="url(#g-hill)"/><g transform="translate(200,380)"><path d="M-10,0 L10,0 L40,-60 L100,-110 L100,-40 L40,-30Z" fill="#cfd6e4"/><rect x="-14" y="-10" width="28" height="10" fill="#8a93a5"/></g>
      ${lines(['1965 · Penzias ve Wilson, Bell Laboratuvarları', 'Her yönden gelen cızırtı: kozmik mikrodalga ışıması', 'COBE uydusu (1989) bu ışımayı ölçtü'], 440, 350)}`);
  };

  S.quasar = function () {
    return svg(`${stars(80, 41)}<g transform="translate(400,220) rotate(-25)"><ellipse rx="160" ry="60" fill="#8b7bff" opacity=".12" filter="url(#f-blur)"/><g class="glowp" style="--dur:1.6s;--lo:.4"><path d="M0,0 L320,-6 L320,6Z" fill="#86d5ff" opacity=".6"/><path d="M0,0 L-320,-6 L-320,6Z" fill="#86d5ff" opacity=".6"/></g><circle r="50" fill="url(#g-wglow)" class="pulse" style="--s:1.2"/><circle r="8" fill="#fff"/></g>
      ${lines(['1963 · Maarten Schmidt', '3C 273: ilk kuasar', 'Dev kara deliğe düşen madde, bütün bir gökadadan parlak'])}`);
  };

  // ─── Gezegen ziyareti
  const PLANET_INFO = {
    mars: ['Mars · Kızıl Gezegen (demir oksit)', 'Olympus Mons 24 km · Valles Marineris 4000 km', 'Uydular: Phobos ve Deimos · gün 24,6 saat'],
    jupiter: ['Jüpiter · en büyük gezegen', 'İçine ~1300 Dünya sığar · gün ~10 saat', 'Büyük Kırmızı Leke · Galileo uyduları'],
    saturn: ['Satürn · sudan hafif, en basık gezegen', '274 uydu · 7 ana halka · yıl 30', 'Titan\'a iniş: Huygens (2005)'],
    uranus: ['Uranüs · yan yatmış buz devi', '28 uydu · 13 halka · yıl 84 · rüzgâr 900 km/sa', 'Uydular: Shakespeare karakterleri (Titania...)'],
    neptune: ['Neptün · metan gazı onu maviye boyar', 'Rüzgâr 2.520 km/sa · yıl 165 · gün 16 saat', '16 uydu · 6 halka (Galle, Le Verrier, Lassell...)'],
    pluto: ['Plüton · 2006\'dan beri cüce gezegen', 'Kalp biçimli ova · yıl ~248 Dünya yılı', 'New Horizons: 9 yıllık yolculuk'],
    mercury: ['Merkür · Güneş\'e en yakın (58 milyon km)', 'Atmosfer yok, uydu yok · 47 km/sn', 'Gündüz ~430 °C, gece -180 °C'],
    venus: ['Venüs · en sıcak gezegen (~460 °C)', 'Basınç Dünya\'nın 90 katı · sülfürik asit bulutları', 'Ters döner: Güneş batıdan doğar'],
    moon: ['Ay · 384.400 km', 'Yer çekimi 1/6 · hep aynı yüzü bize dönük', 'Danuri: Güney Kore\'nin ilk Ay aracı (2022)'],
  };
  S.flyby = function (sc) {
    const pk = sc.planet;
    const r = { jupiter: 150, saturn: 92, mars: 118, venus: 120 }[pk] || 110;
    const cx = 520, cy = 225;
    let extra = '';
    if (pk === 'mars' && sc.orbit) extra = `<g>${P.motion(P.orbitPath(cx, cy, r + 70, 40), 7)}${planet('rock', 0, 0, 6)}<text x="8" y="-6" class="lbl-s">Phobos</text></g><g>${P.motion(P.orbitPath(cx, cy, r + 120, 60), 16, -4)}${planet('rock', 0, 0, 4)}<text x="8" y="-6" class="lbl-s">Deimos</text></g>`;
    if (pk === 'jupiter') extra = [[190, 5], [220, 12], [260, 7], [300, 20]].map(([a, d], i) => `<g>${P.motion(P.orbitPath(cx, cy, a, a * 0.18), d, -i * 2)}<circle r="${3 + (i === 2 ? 2 : 0)}" fill="#f4f0e4"/></g>`).join('');
    const probeKind = sc.probe || 'generic';
    const probeSvg = sc.probe === 'voyager' || sc.probe === 'pioneer' || sc.probe === 'cassini' || sc.probe === 'juno' || sc.probe === 'newhorizons' || sc.probe === 'radar' || sc.probe === 'bepi' ? P.probe(probeKind, 1.1) : P.probe('generic', 1);
    const path = sc.orbit ? P.orbitPath(cx, cy, r + 40, (r + 40) * 0.42) : `M-40,120 C200,110 ${cx - r - 60},${cy - r - 40} ${cx},${cy - r - 50} S780,${cy - 40} 860,${cy + 60}`;
    return svg(`${stars(90, 43)}${planet(pk, cx, cy, r, { spin: pk === 'jupiter' || pk === 'saturn' ? 0 : 40, rings: pk === 'saturn' || pk === 'uranus' })}${extra}
      <path d="${path}" fill="none" stroke="#e8b45a" stroke-opacity=".5" stroke-dasharray="4 7"/><g>${P.motion(path, sc.orbit ? 9 : 8)}${probeSvg}</g>
      ${lines(PLANET_INFO[pk] || [], 56, 44)}`);
  };

  // ─── Ay'a iniş
  const LANDING_INFO = {
    luna: ['3 Şubat 1966 · Luna 9 (SSCB)', 'Ay\'a ilk yumuşak iniş', 'İlk panoramik fotoğraflar'],
    apollo: ['20 Temmuz 1969 · Apollo 11', '"Kartal indi." · Sükûnet Denizi', 'Saturn V · 3 kişi · 4 günde Ay\'a · 14 gün karantina'],
    change: ['Aralık 2020 · Chang\'e 5 (Çin)', 'Ay\'dan 1,7 kg örnek toplayıp döndü', '1976\'dan beri ilk Ay örneği'],
    vikram: ['23 Ağustos 2023 · Chandrayaan-3', 'Vikram iniş modülü + Pragyan roverı', 'Ay\'ın güney kutbu yakınına ilk iniş'],
  };
  S.moonLanding = function (sc) {
    const v = sc.v;
    const lander = P.lander(v === 'change' ? 'change' : v).replace('--d:3.2s', '--d:4.4s').replace('--d:2.4s', '--d:3.6s');
    let after = '';
    if (v === 'apollo') {
      after = `<g transform="translate(470,372)"><g class="fade" style="--d:3.8s"><g transform="scale(1.3)">${P.astronaut(1)}</g></g></g>
        <g transform="translate(530,372)"><g class="grow" style="--d:4.4s;--o:50% 100%"><line x1="0" y1="0" x2="0" y2="-80" stroke="#cfd6e4" stroke-width="2"/><rect x="0" y="-80" width="40" height="24" fill="#e8edf5"/><rect x="0" y="-80" width="16" height="12" fill="#3a5bd9"/>${[0, 1, 2, 3].map((i) => `<rect x="16" y="${-80 + i * 6}" width="24" height="3" fill="#c8102e"/>`).join('')}</g></g>
        ${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${440 + i * 16}" cy="${396 + (i % 2) * 6}" rx="4" ry="2" fill="#000" opacity=".4" class="fade" style="--d:${4 + i * 0.2}s"/>`).join('')}`;
    }
    if (v === 'vikram') after = `<g transform="translate(470,374)"><g class="move" style="--fx:-60px;--dur:2.5s;--d:4.2s">${P.rover('pragyan')}</g></g>`;
    return svg(`${stars(90, 45, [0, 0, 800, 300])}<g transform="translate(660,90)">${planet('earth', 0, 0, 30, { spin: 20 })}</g>${P.ground('moon', 360, 8)}
      <g transform="translate(400,352)"><g class="move" style="--fy:-330px;--dur:3.2s;--d:.2s">${lander}<g class="fade-out" style="--d:3.3s">${P.flame(14, 40, 0, 0)}</g></g></g>
      <g class="fade" style="--d:3.3s">${[0, 1, 2].map((i) => `<ellipse cx="400" cy="378" rx="${60 + i * 30}" ry="${10 + i * 4}" fill="#b5b3aa" opacity=".25" class="grow" style="--d:${3.3 + i * 0.1}s"/>`).join('')}</g>
      ${after}${lines(LANDING_INFO[v] || [])}`);
  };

  S.apollo13 = function () {
    const path = 'M190,250 C330,160 540,120 640,150 C720,176 716,244 660,244 C600,244 520,310 360,320 C270,326 212,300 196,276';
    return svg(`${stars(90, 47)}${planet('earth', 140, 270, 60, { spin: 20 })}${planet('moon', 660, 196, 34)}
      <path d="${path}" fill="none" stroke="#e8b45a" stroke-opacity=".55" stroke-dasharray="4 6" class="draw" style="--len:1200;--dur:4s"/><g>${P.motion(path, 10)}<circle r="4" fill="#fff"/></g>
      <g transform="translate(430,152)"><circle r="30" fill="url(#g-glow)" class="flash" style="--d:2.4s;--dur:2s"/></g><g class="fade" style="--d:2.6s">${t(430, 130, '"Houston, bir sorunumuz var"', 'lbl-gold', 'text-anchor="middle"')}</g>
      ${lines(['11 Nisan 1970 · Apollo 13', 'Oksijen tankı patladı, iniş iptal', 'Ay\'ın arkasından dolanıp sağ döndüler'], 56, 390)}`);
  };

  // ─── Gezegen yüzeyine iniş
  const LANDER_INFO = {
    'venus-chute': ['Ekim 1967 · Venera 4 (SSCB)', 'Başka bir gezegenin atmosferinden ilk veri', 'Venüs: Dünya\'nın ikizi · kütlesi 0,8 Dünya'],
    'venus-land': ['15 Aralık 1970 · Venera 7', 'Venüs yüzeyine ilk iniş · 23 dakika dayandı', '~460-471 °C · basınç 90 kat · sülfürik asit'],
    'venus-camera': ['Ekim 1975 · Venera 9', 'Venüs yüzeyinden ilk fotoğraf', 'Lavlarla kaplı kayalık yüzey · demir çekirdek'],
    'mars-land': ['20 Temmuz 1976 · Viking 1', 'Mars yüzeyine ilk başarılı iniş', 'Atmosfer %95 CO₂ · gün batımı mavi'],
    'mars-skycrane': ['6 Ağustos 2012 · Curiosity', 'Gök vinci roverı iplerle yere indirdi', 'Gale Krateri · saatte ~30 m · sinyal 5-20 dk'],
    'mars-fail': ['25 Aralık 2003 · Beagle 2 (İngiltere)', 'İndi ama hiç sinyal gönderemedi', '2015\'te NASA uydusu onu yüzeyde buldu'],
    'mars-burn': ['23 Eylül 1999 · Mars Climate Orbiter', 'Çok alçaktan girdi, atmosferde yok oldu', 'NASA metrik, Lockheed Martin İngiliz birimi kullandı'],
    'mars-polar': ['25 Mayıs 2008 · Phoenix', 'Mars\'ın kuzey kutbuna yakın iniş', 'Toprağın hemen altında su buzu buldu'],
  };
  S.lander = function (sc) {
    const w = sc.world, v = sc.v;
    const sky = w === 'venus' ? '<rect width="800" height="450" fill="url(#g-venussky)"/>' : '<rect width="800" height="450" fill="url(#g-marssky)"/>';
    const info = LANDER_INFO[`${w}-${v}`] || [];
    const ground = P.ground(w, 360, w === 'venus' ? 12 : 14);
    let body = '';
    const chute = (col = '#f3f3f0') => `<path d="M-40,-80 Q0,-130 40,-80Z" fill="${col}"/><g stroke="#cfd6e4" stroke-width="1"><line x1="-40" y1="-80" x2="0" y2="-30"/><line x1="40" y1="-80" x2="0" y2="-30"/><line x1="0" y1="-112" x2="0" y2="-30"/></g>`;
    if (v === 'chute') {
      body = `<g transform="translate(400,120)"><g class="move" style="--fy:-200px;--ty:120px;--dur:8s">${chute()}${P.lander('venera')}</g></g>`;
      body += `<g class="fade" style="--d:1s">${[0, 1, 2].map((i) => `<path d="M420,${150 + i * 10} q30,-40 60,-80" fill="none" stroke="#fff" stroke-opacity=".5" class="blink" style="--d:${i * 0.3}s"/>`).join('')}</g>`;
    } else if (v === 'land' || v === 'polar') {
      const L = w === 'venus' ? 'venera' : v === 'polar' ? 'phoenix' : 'viking';
      body = `<g transform="translate(400,366)"><g class="move" style="--fy:-360px;--dur:3.4s;--d:.2s"><g class="fade-out" style="--d:2.2s;--dur:.4s"><g transform="translate(0,-60)">${chute()}</g></g>${P.lander(L)}</g></g>`;
      if (v === 'polar') body = `<g fill="#f4f7ff" opacity=".8">${[120, 260, 560, 680].map((x, i) => `<ellipse cx="${x}" cy="${390 + (i % 2) * 20}" rx="${40 + i * 6}" ry="8"/>`).join('')}</g>` + body + '<g class="fade" style="--d:4s"><ellipse cx="460" cy="392" rx="18" ry="5" fill="#fff"/></g>';
    } else if (v === 'camera') {
      body = `<g transform="translate(400,366)">${P.lander('venera')}</g><g class="grow" style="--d:1s;--o:50% 0%"><rect x="120" y="40" width="560" height="110" fill="#3a2410" stroke="#e8b45a"/><path d="M120,150 L200,120 L280,130 L360,110 L440,126 L520,112 L600,130 L680,120 L680,150Z" fill="#a8743a"/>${[160, 250, 330, 420, 520, 610].map((x, i) => `<ellipse cx="${x}" cy="${134 - (i % 2) * 6}" rx="${18 + (i % 3) * 6}" ry="7" fill="#6b4418"/>`).join('')}<path d="M120,40 Q400,120 680,40" fill="none" stroke="#e8b45a" stroke-opacity=".4"/></g>`;
    } else if (v === 'skycrane') {
      body = `<g transform="translate(400,160)"><g class="go" style="--d:3.8s;--dur:2s;--tx:-520px;--ty:-260px"><rect x="-50" y="-16" width="100" height="22" fill="#cfd6e4"/>${[-44, 44].map((x) => P.flame(8, 26, x, 6)).join('')}</g></g>
        <g transform="translate(400,372)"><g class="move" style="--fy:-150px;--dur:3.2s;--d:.2s">${P.rover('curiosity')}</g></g>
        <g class="fade-out" style="--d:3.6s;--dur:.3s"><line x1="380" y1="170" x2="380" y2="330" stroke="#fff" stroke-width="1"/><line x1="420" y1="170" x2="420" y2="330" stroke="#fff" stroke-width="1"/></g>`;
    } else if (v === 'fail') {
      body = `<g transform="translate(400,370)">${P.lander('beagle')}</g><g class="blink" style="--dur:1s">${t(400, 300, 'SİNYAL YOK', 'lbl-bad', 'text-anchor="middle"')}</g>`;
    } else if (v === 'burn') {
      body = `<g transform="translate(900,60)"><g class="go-lin" style="--tx:-700px;--ty:180px;--dur:3.5s"><g transform="rotate(-15)">${P.probe('generic', 1)}</g><path d="M10,-4 L140,-40 L140,30Z" fill="#ff9a3d" opacity=".5" class="fade" style="--d:1.8s"/></g></g><g transform="translate(200,240)"><circle r="40" fill="url(#g-glow)" class="flash" style="--d:3.4s"/></g>`;
    }
    const haze = w === 'venus' ? '<rect y="0" width="800" height="200" fill="#f3c36e" opacity=".15" filter="url(#f-blur)"/><path d="M600,20 L585,70 L600,70 L580,130" stroke="#fff4c0" stroke-width="2" fill="none" class="blink" style="--dur:2.6s"/>' : '';
    return svg(`${sky}${haze}${ground}${body}${lines(info, 56, 40)}`);
  };

  // ─── Roverlar
  const ROVER_INFO = {
    lunokhod: ['Kasım 1970 · Luna 17 → Lunokhod 1', 'Başka bir gök cisminde gezen ilk robot', 'Dünya\'dan uzaktan kumanda · 8 tekerlek'],
    lrv: ['Aralık 1972 · Apollo 17', 'Taurus-Littrow vadisi (Toros Dağları adı)', 'Ay\'daki son insan adımları'],
    sojourner: ['4 Temmuz 1997 · Mars Pathfinder', 'Sojourner: Mars\'taki ilk rover', 'Hava yastıklarıyla zıplayarak iniş'],
    opportunity: ['25 Ocak 2004 · Opportunity', '90 gün planlandı, 15 yıl çalıştı', '45 km\'den uzun yolculuk · ikizi Spirit'],
    perseverance: ['18 Şubat 2021 · Jezero Krateri', 'Perseverance örnek topluyor (ABD)', 'Ingenuity: başka gezegende ilk motorlu uçuş'],
    zhurong: ['Mayıs 2021 · Tianwen-1', 'Zhurong: Çin\'in ilk Mars roverı', 'Yörünge + iniş + rover ilk denemede'],
    rosalind: ['ExoMars · ESA ve Rusya', 'Rosalind Franklin roverı fırlatılamadı', '2022\'de Ukrayna işgali sonrası askıya alındı'],
  };
  S.rover = function (sc) {
    const w = sc.world, v = sc.v;
    const sky = w === 'mars' ? '<rect width="800" height="450" fill="url(#g-marssky)"/>' : stars(90, 49, [0, 0, 800, 320]) + `<g transform="translate(640,90)">${planet('earth', 0, 0, 30, { spin: 20 })}</g>`;
    const move = v === 'rosalind' ? '' : 'class="move" style="--fx:-540px;--dur:4.8s;--d:.2s"';
    let extra = '';
    if (v === 'sojourner') extra = `<g transform="translate(250,372)"><path d="M-40,0 L-20,-26 L20,-26 L40,0Z" fill="#b8c0cc"/><g fill="#f3efe4" opacity=".7"><circle cx="-34" cy="-6" r="10"/><circle cx="34" cy="-6" r="10"/></g><rect x="-10" y="-40" width="20" height="14" fill="url(#g-panel)"/></g>`;
    if (sc.heli) extra += `<g transform="translate(560,220)"><g class="bob" style="--dur:3s;--by:-18px">${P.heli()}</g></g><ellipse cx="560" cy="392" rx="30" ry="5" fill="#000" opacity=".3"/>`;
    return svg(`${sky}${P.ground(w, 362, 15)}<path d="M-20,388 L${v === 'rosalind' ? 0 : 360},388" stroke="#000" stroke-opacity=".25" stroke-width="3" stroke-dasharray="6 4" class="draw" style="--len:400;--dur:4.8s"/>${extra}
      <g transform="translate(${v === 'lrv' ? 420 : 400},380)"><g ${move}><g transform="scale(${v === 'sojourner' ? 1.4 : 1.25})">${P.rover(v)}</g></g></g>
      ${v === 'rosalind' ? t(400, 250, 'beklemede', 'lbl-gold', 'text-anchor="middle"') : ''}${lines(ROVER_INFO[v] || [], 56, 40)}`);
  };

  // ─── İstasyonlar
  const STATION_INFO = {
    salyut1: ['19 Nisan 1971 · Salyut 1 (SSCB)', 'Dünyanın ilk uzay istasyonu', 'Modül: kendi başına hareket edebilen bağımsız bölüm'],
    soyuz21: ['Temmuz 1976 · Soyuz 21 → Salyut 5', 'Boris Volinov ve Vitali Jolobov', 'Görev 49 gün sonra erken bitti'],
    skylab: ['14 Mayıs 1973 · Skylab', 'ABD\'nin ilk uzay istasyonu', '1979\'da düştü · "Türkiye\'ye düşecek" söylentisi'],
    mir: ['Şubat 1986 · Mir çekirdek modülü', 'Modüllerle büyüyen Sovyet/Rus istasyonu', 'Amerikalılar da kaldı · 2001\'de indirildi'],
    krikalev: ['Mayıs 1991 - Mart 1992 · Mir', 'Sergey Krikalev: Sovyet gitti, Rus döndü', 'Uzayda 311 gün · 1992: Roscosmos kuruldu'],
    iss: ['20 Kasım 1998 · Zarya modülü', 'ISS: 15 ülke · 420 ton · 109 m · ~420 km', '28.000 km/sa · 92 dakikada tur · günde 16 tur'],
    isslife: ['2 Kasım 2000\'den beri sürekli mürettebat', 'Çöp atmosferde yakılır · her ürüne koku testi', 'Kas zayıflar, boy ~5 cm uzar, görme bozulabilir'],
    crewdragon: ['30 Mayıs 2020 · Crew Dragon (SpaceX)', 'Özel şirketin ilk insanlı yörünge uçuşu', 'Kargo: Dragon ve Cygnus · mürettebat: Starliner da'],
    gezeravci: ['18 Ocak 2024 · Axiom-3', 'Alper Gezeravcı: ilk Türk astronot', 'ISS\'te 2 hafta · 13 bilimsel deney'],
  };
  S.station = function (sc, ev) {
    const v = sc.v;
    const k = v === 'iss' ? 0.78 : 1.2;
    let dock = '';
    if (sc.dock) {
      const cap = sc.dock === 'dragon' ? `<g transform="scale(-1.2,1.2)">${P.capsule('dragon', 'human')}</g>` : `<g transform="scale(1.1)">${P.capsule('soyuz', 'human')}</g>`;
      const x = v === 'iss' ? 590 : 560;
      dock = `<g transform="translate(${x},190)"><g class="move" style="--fx:220px;--dur:3.6s;--d:.6s">${cap}</g></g>`;
    }
    const astro = sc.astronaut || sc.flag ? `<g transform="translate(560,110)"><g class="bob" style="--dur:7s"><g transform="rotate(20) scale(1.5)">${P.astronaut(1, { flag: sc.flag ? '#e30a17' : v === 'mir' ? '#c8102e' : '#3a5bd9' })}</g></g></g>` : '';
    return svg(`${stars(90, 51, [0, 0, 800, 330])}${earthArc(920, 600, 90)}<g transform="translate(400,190)"><g class="bob" style="--dur:9s;--by:-6px"><g transform="scale(${k})">${P.station(v)}</g></g></g>${dock}${astro}${lines(STATION_INFO[ev && ev.id] || STATION_INFO[v] || [])}`);
  };

  // ─── Mekik
  S.shuttle = function (sc) {
    if (sc.v === 'landing') {
      return svg(`${stars(40, 53, [0, 0, 800, 220])}<rect y="300" width="800" height="150" fill="#10183a"/><path d="M340,450 L390,300 L410,300 L460,450Z" fill="#2a3060"/><path d="M398,300 L398,450" stroke="#e8edf5" stroke-dasharray="10 12"/>
        <g transform="translate(400,318)"><g class="move" style="--fx:-420px;--fy:-240px;--dur:4s;--d:.2s"><g transform="rotate(4) scale(1.3)">${P.orbiter(1)}</g></g></g>
        <g transform="translate(300,316)"><g class="grow" style="--d:4.2s;--o:100% 50%"><path d="M0,0 L-80,-18 L-80,18Z" fill="#f3efe4" opacity=".85"/></g></g>
        ${lines(['21 Temmuz 2011 · Atlantis', 'Space Shuttle programının son inişi', '30 yıl · 135 görev · en çok uçan: Discovery (39)'])}`);
    }
    const stack = sc.v === 'buran'
      ? P.rocket('energia')
      : `<g><rect x="-14" y="-230" width="28" height="230" fill="url(#g-orange)"/><path d="M-14,-230 Q0,-258 14,-230Z" fill="url(#g-orange)"/><g fill="url(#g-white)"><rect x="-30" y="-200" width="12" height="200"/><rect x="18" y="-200" width="12" height="200"/><path d="M-30,-200 L-24,-218 L-18,-200Z M18,-200 L24,-218 L30,-200Z"/></g><g transform="translate(46,-110)">${P.orbiter(1, true)}</g>${P.flame(16, 90, -24, 0)}${P.flame(16, 90, 24, 0)}${P.flame(12, 60, 46, -40)}</g>`;
    const info = sc.v === 'buran' ? ['15 Kasım 1988 · Baykonur', 'Buran ("kar fırtınası"): SSCB\'nin mekiği', 'İnsansız uçtu, piste otomatik indi · tek uçuş'] : ['12 Nisan 1981 · Columbia', 'Tekrar kullanılabilen ilk uzay aracı', 'Roket gibi kalkar, uçak gibi iner'];
    return svg(`${stars(50, 55, [0, 0, 800, 300])}${pad()}${tower(460, 380, 250)}<g transform="translate(400,380)"><g class="go" style="--d:1.4s;--dur:5.5s;--ty:-760px"><g class="shake" style="--d:.8s">${stack}</g></g></g>${P.smoke(400, 384, 12, 11, 240)}${lines(info)}`);
  };

  // ─── Anma
  S.memorial = function (sc) {
    if (sc.v === 'plaque') {
      return svg(`${stars(110, 57, [0, 0, 800, 320])}<g transform="translate(660,90)">${planet('earth', 0, 0, 26, { spin: 20 })}</g>${P.ground('moon', 350, 3)}
        <g transform="translate(400,392)"><rect x="-70" y="-6" width="140" height="44" fill="#cfd6e4" transform="skewX(-20)"/>${[0, 1, 2, 3].map((i) => `<rect x="${-56 - i * 2}" y="${2 + i * 8}" width="110" height="3" fill="#5a6272" transform="skewX(-20)"/>`).join('')}<g transform="translate(-100,0) rotate(-80) scale(.7)">${P.astronaut(1, { suit: '#d9dde6' })}</g></g>
        ${lines(['1971 · Apollo 15 mürettebatı bıraktı', 'Plaket ve "Düşen Astronot" heykelciği Ay\'da', 'Vladimir Komarov (Soyuz 1, 1967): uzay uçuşunda ilk kayıp'])}`);
    }
    const crew = sc.v === 'shuttle'
      ? ['Dick Scobee', 'Michael Smith', 'Judith Resnik', 'Ellison Onizuka', 'Ronald McNair', 'Gregory Jarvis', 'Christa McAuliffe']
      : ['Rick Husband', 'William McCool', 'Michael Anderson', 'Kalpana Chawla', 'David Brown', 'Laurel Clark', 'Ilan Ramon'];
    const head = sc.v === 'shuttle' ? ['28 Ocak 1986 · Challenger', 'Kalkıştan 73 saniye sonra · O-ring contası'] : ['1 Şubat 2003 · Columbia', 'Sol kanattaki hasar · atmosfere dönüşte'];
    let s = '';
    crew.forEach((n, i) => {
      const x = 130 + i * 90, y = 170 + (i % 2) * 40;
      s += `<g transform="translate(${x},${y})"><g class="pop" style="--d:${0.6 + i * 0.35}s"><circle r="12" fill="url(#g-wglow)"/><circle r="2.6" fill="#fff" class="twinkle" style="--dur:4s;--d:${i * 0.4}s"/></g></g><g class="fade" style="--d:${0.8 + i * 0.35}s">${t(x, y + 32, n, 'lbl-s', 'text-anchor="middle"')}</g>`;
    });
    return svg(`${stars(60, 59)}${s}${lines(head, 400, 330, 'middle', 3)}`);
  };

  // ─── Uzay teleskopları
  const TEL_INFO = {
    hubble: ['24 Nisan 1990 · Discovery mekiği bıraktı', 'Hubble: ilk ve en ünlü uzay teleskobu', '1993: astronotlar aynayı düzeltti'],
    jwst: ['25 Aralık 2021 · L2 noktası (1,5 milyon km)', 'James Webb: en büyük uzay teleskobu', '18 altıgen ayna: arı kovanı ilhamı'],
    kepler: ['Mart 2009 · Kepler (NASA)', 'Yıldızın önünden geçen gezegeni ışık düşüşünden yakalar', '2.600\'den fazla ötegezegen · Kepler-90: 8 gezegen'],
    tess: ['Nisan 2018 · TESS (NASA)', 'Yakın, parlak yıldızlarda ötegezegen arar', 'CHEOPS (ESA, 2019) · Ariel (ESA, 2028 planı)'],
    gaia: ['Aralık 2013 · Gaia (ESA)', '1 milyardan fazla yıldızın konumu ve hareketi', 'Samanyolu\'nun 3 boyutlu haritası'],
  };
  S.telescope = function (sc) {
    const v = sc.v;
    const R = P.rng(61);
    let img = '';
    if (v === 'kepler' || v === 'tess') {
      let d = 'M0,40';
      for (let x = 0; x <= 200; x += 5) d += ` L${x},${(x > 90 && x < 120 ? 58 : 40) + (R() - 0.5) * 4}`;
      img = `<rect width="200" height="120" fill="#060a20" stroke="#86d5ff" stroke-opacity=".4"/><circle cx="100" cy="-50" r="26" fill="url(#g-sun)"/><circle cx="100" cy="-50" r="6" fill="#050817"><animate attributeName="cx" values="60;140" dur="4s" repeatCount="indefinite"/></circle><path d="${d}" fill="none" stroke="#e8b45a" stroke-width="2" class="draw" style="--len:260;--d:.6s"/>${t(100, 106, 'ışık eğrisi: gezegen geçişi', 'lbl-s', 'text-anchor="middle"')}`;
    } else if (v === 'gaia') {
      for (let i = 0; i < 40; i++) {
        const x = R() * 200, y = R() * 120;
        img += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="1.4" fill="#fff"/><line x1="${x.toFixed(0)}" y1="${y.toFixed(0)}" x2="${(x + (R() - 0.5) * 16).toFixed(0)}" y2="${(y + (R() - 0.5) * 16).toFixed(0)}" stroke="#86d5ff" stroke-opacity=".6" class="draw" style="--len:20;--d:${(1 + R()).toFixed(1)}s"/>`;
      }
      img = `<rect width="200" height="120" fill="#060a20" stroke="#86d5ff" stroke-opacity=".4"/>${img}`;
    } else {
      for (let i = 0; i < 18; i++) {
        const x = R() * 200, y = R() * 120, r = 2 + R() * 8;
        img += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r.toFixed(1)}" ry="${(r * 0.45).toFixed(1)}" fill="${['#ffd9a8', '#9fd0ff', '#ff9a7a', '#fff'][i % 4]}" opacity=".8" transform="rotate(${(R() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
      }
      img = `<rect width="200" height="120" fill="#060a20" stroke="#86d5ff" stroke-opacity=".4"/>${img}`;
    }
    const nearEarth = v === 'hubble' || v === 'kepler' || v === 'tess';
    return svg(`${stars(90, 63)}${nearEarth ? earthArc(960, 600, 80) : ''}${v === 'jwst' ? P.sun(-40, 380, 30) : ''}
      <g transform="translate(300,${v === 'jwst' ? 200 : 190})"><g class="bob" style="--dur:8s">${P.telescopeCraft(v)}</g></g>
      <g transform="translate(520,${v === 'gaia' ? 250 : 260})"><g class="fade" style="--d:1.8s">${img}</g></g>${lines(TEL_INFO[v] || [])}`);
  };

  S.exoplanet = function () {
    return svg(`${stars(90, 65)}<g transform="translate(400,190)"><g>${spin(0, 0, 6)}<g transform="translate(-10,0)"><g transform="rotate(0)">${P.sun(0, 0, 34)}</g></g><g transform="translate(130,0)">${planet('jupiter', 0, 0, 14, { spin: 0 })}</g></g></g>
      <g transform="translate(200,340)"><rect width="400" height="30" fill="url(#g-rainbow)" opacity=".9"/>${[60, 150, 250, 330].map((x) => `<rect x="${x}" y="0" width="3" height="30" fill="#050817"><animate attributeName="x" values="${x - 6};${x + 6};${x - 6}" dur="6s" repeatCount="indefinite"/></rect>`).join('')}</g>
      ${lines(['Ekim 1995 · Mayor ve Queloz', '51 Pegasi b: Güneş benzeri yıldızın ilk ötegezegeni', 'Yıldız yalpalıyor → tayf çizgileri kayıyor'])}`);
  };

  S.potato = function () {
    return svg(`<rect x="160" y="60" width="480" height="320" rx="18" fill="#1a2250" stroke="#3a4270"/>${[0, 1, 2, 3].map((i) => `<rect x="${180 + i * 115}" y="80" width="100" height="60" rx="4" fill="#232c64"/>`).join('')}
      <rect x="290" y="170" width="220" height="180" rx="8" fill="#0d1436" stroke="#86d5ff" stroke-opacity=".5"/><rect x="290" y="320" width="220" height="30" fill="#5a3a1e"/>
      ${[[340, 310], [400, 300], [460, 312]].map(([x, y], i) => `<g transform="translate(${x},${y})"><g class="grow" style="--d:${0.4 + i * 0.3}s;--o:50% 100%;--dur:2s"><path d="M0,0 Q-4,-40 0,-80" stroke="#3f9e63" stroke-width="4" fill="none"/><ellipse cx="-14" cy="-50" rx="14" ry="7" fill="#4fb070"/><ellipse cx="14" cy="-66" rx="14" ry="7" fill="#4fb070"/><ellipse cx="-10" cy="-86" rx="12" ry="6" fill="#4fb070"/></g></g><g transform="translate(${x + 10},${y + 22})"><g class="pop" style="--d:${2.4 + i * 0.3}s"><ellipse rx="10" ry="7" fill="#c9a064"/></g></g>`).join('')}
      ${lines(['Ekim 1995 · Columbia mekiği (STS-73)', 'Uzayda yetiştirilen ilk sebze: patates', 'Uzun yolculuklarda besin üretiminin ilk adımı'], 400, 410, 'middle')}`);
  };

  S.transit = function () {
    return svg(`${P.sun(400, 225, 170, { spots: true })}<g transform="translate(400,190)"><g class="move-lin" style="--fx:-260px;--tx:260px;--dur:9s;animation-iteration-count:infinite"><circle r="10" fill="#050817"/></g></g>
      ${lines(['8 Haziran 2004 ve 6 Haziran 2012', 'Venüs Güneş\'in önünden küçük siyah bir nokta gibi geçti', 'Sıradaki Venüs geçişi: 2117 · Merkür: 13 Kasım 2032'], 400, 418, 'middle')}`);
  };

  S.dwarf = function () {
    const row = [['mercury', 6], ['venus', 9], ['earth', 10], ['mars', 7], ['jupiter', 22], ['saturn', 18], ['uranus', 14], ['neptune', 14]];
    let s = '';
    row.forEach(([k, r], i) => { s += planet(k, 70 + i * 82, 110, r, { spin: 0, rings: k === 'saturn' }); });
    return svg(`${stars(70, 67)}${s}${t(360, 60, '8 gezegen', 'lbl-s', 'text-anchor="middle"')}
      <g transform="translate(730,110)"><g class="move" style="--tx:-430px;--ty:190px;--dur:2.6s;--d:1s">${planet('pluto', 0, 0, 10)}<text x="0" y="26" class="lbl-s" text-anchor="middle">Plüton</text></g></g>
      <g class="fade" style="--d:2.6s"><rect x="150" y="250" width="500" height="120" rx="14" fill="none" stroke="#e8b45a" stroke-opacity=".5" stroke-dasharray="4 6"/>${t(170, 272, 'Cüce gezegenler', 'lbl-gold')}
        ${planet('moon', 220, 320, 11)}${t(220, 350, 'Ceres', 'lbl-s', 'text-anchor="middle"')}${planet('mercury', 400, 320, 12)}${t(400, 350, 'Eris', 'lbl-s', 'text-anchor="middle"')}
        <g transform="translate(480,320)"><g class="spin" style="--dur:1.2s"><ellipse rx="18" ry="8" fill="#d9d3cc"/></g></g>${t(480, 350, 'Haumea (4 saat)', 'lbl-s', 'text-anchor="middle"')}${planet('mars', 580, 320, 9)}${t(580, 350, 'Makemake', 'lbl-s', 'text-anchor="middle"')}</g>
      ${lines(['Ağustos 2006 · IAU kararı', 'Yörüngesini temizlememiş cisim = cüce gezegen'], 56, 410)}`);
  };

  S.spaceplane = function () {
    return svg(`${stars(80, 69, [0, 0, 800, 250])}${earthArc(1000, 640, 80)}<g>${P.motion('M-100,110 Q400,40 900,110', 9)}<g transform="scale(.8)">${P.orbiter(1)}</g></g>${t(560, 70, 'X-37B · insansız, gizli görevler', 'lbl-s lbl-gold')}
      <g transform="translate(-100,330)"><g class="go-lin" style="--tx:1000px;--ty:0px;--dur:12s"><path d="M-60,0 L60,-4 Q74,0 60,4 L-60,6Z" fill="#e8edf5"/><path d="M-10,0 L-30,24 L-16,24 L10,2Z M-50,0 L-64,-16 L-56,-16 L-44,0Z" fill="#cfd6e4"/><rect x="-30" y="-6" width="10" height="6" fill="#1b1f2a"/></g></g>
      <path d="M0,380 Q200,360 400,380 T800,376 L800,450 L0,450Z" fill="#dfe6f4" opacity=".18"/>${lines(['2010 · iki gizemli uçak', 'X-37B: ABD ordusunun mini mekiği', 'SOFIA: teleskoplu Boeing 747SP (kızılötesi)'], 56, 40)}`);
  };

  S.gwaves = function () {
    return svg(`${stars(80, 71)}<g transform="translate(300,225)">${[0, 1, 2, 3].map((i) => `<circle r="40" fill="none" stroke="#86d5ff" stroke-opacity=".6" class="ripple" style="--s:5;--dur:4s;--d:${i}s"/>`).join('')}<g>${spin(0, 0, 1.4)}<circle cx="-18" r="10" fill="#000" stroke="#ff9a3d"/><circle cx="18" r="8" fill="#000" stroke="#ff9a3d"/></g></g>
      <g transform="translate(610,200)"><path d="M0,-70 L60,40 L-60,40Z" fill="none" stroke="#ff8075" stroke-opacity=".7" stroke-dasharray="3 5"/>${[[0, -70], [60, 40], [-60, 40]].map(([x, y]) => `<g transform="translate(${x},${y})">${P.probe('generic', 0.5)}</g>`).join('')}</g>
      ${lines(['Aralık 2015 · LISA Pathfinder (ESA)', 'Uzayda serbest düşen altın küplerle test', 'Hedef: yer çekimi (kütleçekim) dalgaları · LIGO 2016'], 56, 380)}`);
  };

  S.sail = function () {
    return svg(`${stars(110, 73)}${planet('earth', 90, 300, 60, { spin: 20 })}<g stroke="#ff8075" stroke-opacity=".5" stroke-width="2">${[0, 1, 2].map((i) => `<line x1="${120 + i * 6}" y1="${250 - i * 4}" x2="480" y2="180" class="draw" style="--len:400;--d:${i * 0.2}s"/>`).join('')}</g>
      <g transform="translate(480,180)"><g class="move" style="--tx:180px;--ty:-40px;--dur:6s;--d:1.2s"><rect x="-30" y="-30" width="60" height="60" fill="#dfe6ff" fill-opacity=".35" stroke="#dfe6ff" transform="rotate(20)"/><circle r="3" fill="#fff"/></g></g>${P.glowDot(740, 90, 4, '#ffe7a8', 'twinkle')}${t(740, 120, 'Alfa Centauri · 4,37 ışık yılı', 'lbl-s', 'text-anchor="middle"')}
      ${lines(['2016 · iki cesur fikir', 'Asgardia: kendini "uzay ülkesi" ilan eden topluluk', 'Uzay yelkenlisi: lazerle itilen ışık yelkeni'], 56, 40)}`);
  };

  S.asteroid = function (sc, ev) {
    const R = P.rng(ev && ev.id === 'osirisrex' ? 75 : 77);
    const poly = (r, n) => { let p = ''; for (let i = 0; i < n; i++) { const a = (i / n) * 2 * PI, rr = r * (0.75 + R() * 0.35); p += `${(cos(a) * rr).toFixed(1)},${(sin(a) * rr).toFixed(1)} `; } return p; };
    if (sc.v === 'impact') {
      return svg(`${stars(100, 79)}<g transform="translate(560,220)"><g class="spin" style="--dur:30s"><polygon points="${poly(80, 16)}" fill="url(#g-rock)"/></g></g>
        <g><animateMotion path="${P.orbitPath(560, 220, 150, 50)}" dur="14s" begin="-9s" repeatCount="indefinite"/><polygon points="${poly(16, 10)}" fill="#8a7f72"/></g>
        <g transform="translate(-40,150)"><g class="move-in" style="--tx:480px;--ty:30px;--dur:3s;--d:.2s"><g class="fade-out" style="--d:3.1s;--dur:.1s">${P.probe('generic', 0.7)}</g></g></g>
        <g transform="translate(440,180)"><circle r="40" fill="url(#g-glow)" class="flash" style="--d:3.1s"/>${Array.from({ length: 14 }, (_, i) => `<circle r="2" fill="#dcd2c4" class="move" style="--tx:${(-60 - i * 6).toFixed(0)}px;--ty:${((i - 7) * 8).toFixed(0)}px;--fo:0;--dur:2.4s;--d:3.2s"/>`).join('')}</g>
        ${lines(['26 Eylül 2022 · NASA DART', 'Didymos\'un uydusu Dimorphos\'a 22.000 km/sa çarptı', 'Yörünge 32 dakika kısaldı · ESA Hera inceleyecek'], 56, 380)}`);
    }
    const info = ev && ev.id === 'osirisrex' ? ['2016\'da fırlatıldı · Bennu (NASA)', 'OSIRIS-REx yüzeye dokunup örnek aldı (2020)', 'Örnek kapsülü Eylül 2023\'te Utah\'a indi'] : ['2014\'te fırlatıldı · Ryugu (JAXA)', 'Hayabusa 2 yüzeye mermi atıp krater açtı', 'Örnekler Aralık 2020\'de Avustralya\'ya indi'];
    return svg(`${stars(100, 81)}<g transform="translate(540,240)"><g class="spin" style="--dur:40s"><polygon points="${poly(120, 18)}" fill="url(#g-rock)"/>${[0, 1, 2, 3].map((i) => `<circle cx="${(R() - 0.5) * 120}" cy="${(R() - 0.5) * 120}" r="${6 + R() * 10}" fill="#000" opacity=".2"/>`).join('')}</g></g>
      <g transform="translate(400,110)"><g class="move" style="--tx:40px;--ty:30px;--dur:2s;--d:.4s;animation-direction:alternate;animation-iteration-count:2">${P.probe('generic', 0.9)}<line x1="0" y1="10" x2="0" y2="40" stroke="#cfd6e4" stroke-width="2"/></g></g>
      ${planet('earth', 90, 360, 22, { spin: 20 })}<path d="M380,140 Q220,200 100,340" fill="none" stroke="#e8b45a" stroke-dasharray="3 6" class="draw" style="--len:400;--d:3s"/>${lines(info)}`);
  };

  S.blackhole = function () {
    const R = P.rng(83);
    let parts = '';
    for (let i = 0; i < 80; i++) {
      const a = R() * 2 * PI, rr = 90 + R() * 70;
      parts += `<circle cx="${(cos(a) * rr).toFixed(1)}" cy="${(sin(a) * rr).toFixed(1)}" r="${(0.8 + R() * 1.5).toFixed(1)}" fill="#ffc98a" opacity=".6"/>`;
    }
    return svg(`${stars(90, 85)}<g transform="translate(400,215)"><g>${spin(0, 0, 18)}${parts}</g><g filter="url(#f-blur)"><circle r="100" fill="none" stroke="#ff9a3d" stroke-width="36" opacity=".75"/><path d="M-90,40 A100,100 0 0,0 90,40" fill="none" stroke="#ffe1a8" stroke-width="30" opacity=".85"/></g><circle r="78" fill="#000"/><circle r="84" fill="none" stroke="#fff4d8" stroke-width="1.5" opacity=".6"/></g>
      ${lines(['10 Nisan 2019 · Olay Ufku Teleskobu', 'M87 gökadasındaki kara deliğin gölgesi', 'Mimarlarından: Feryal Özel · ışık bile kaçamaz'], 56, 380)}`);
  };

  S.atmosphere = function () {
    const L = [
      ['Ekzosfer', 20, 120, '#0d1236', '600+ km · en üst'],
      ['Termosfer', 120, 250, '#1a2060', '85-600 km · ISS, aurora'],
      ['Mezosfer', 250, 320, '#2a3380', '50-85 km · göktaşları yanar'],
      ['Stratosfer', 320, 392, '#3a4fb0', '12-50 km · ozon tabakası'],
      ['Troposfer', 392, 430, '#2a5bd0', '0-12 km · hava, uçaklar'],
    ];
    let s = '';
    L.forEach(([n, y0, y1, c, d], i) => {
      s += `<rect x="0" y="${y0}" width="800" height="${y1 - y0}" fill="${c}" opacity="${0.35 + i * 0.1}" class="fade" style="--d:${i * 0.15}s"/>${t(540, (y0 + y1) / 2 - 2, n, 'lbl-gold')}${t(540, (y0 + y1) / 2 + 15, d, 'lbl-s')}`;
    });
    return svg(`${s}<rect x="0" y="344" width="800" height="10" fill="#7fd4ff" opacity=".25" class="glowp"/><line x1="0" y1="225" x2="800" y2="225" stroke="#e8b45a" stroke-width="2" stroke-dasharray="8 6"/>${t(20, 218, 'Kármán hattı · 100 km: uzayın başlangıcı', 'lbl-gold')}
      <path d="M300,180 q30,-40 60,0 t60,0 t60,0" stroke="#5fd49a" stroke-width="6" fill="none" opacity=".4" class="glowp"/><g>${P.motion('M60,150 L760,150', 8)}<circle r="3" fill="#fff"/><text x="8" y="-6" class="lbl-s">ISS ~420 km</text></g>
      <path d="M300,262 l40,26" stroke="#ffcf6b" stroke-width="2" class="blink" style="--dur:2s"/><g transform="translate(160,410)"><path d="M-16,0 L16,-2 L20,0 L16,2Z M-4,0 L-10,8 L-4,8 L2,0Z" fill="#e8edf5"/></g><g transform="translate(240,330)"><circle r="9" fill="#f3efe4"/><line x1="0" y1="9" x2="0" y2="22" stroke="#f3efe4"/></g>
      <g transform="translate(420,430)"><g class="go" style="--d:.8s;--dur:5s;--ty:-470px"><g transform="scale(.35)">${P.rocket('falcon9')}</g></g></g>`);
  };

  S.emblem = function (sc) {
    const v = sc.v;
    if (v === 'mup') {
      return svg(`${stars(110, 87, [0, 0, 800, 330])}<g transform="translate(640,90)">${planet('moon', 0, 0, 34)}</g><path d="M160,330 Q380,40 610,100" fill="none" stroke="#e8b45a" stroke-dasharray="4 7" class="draw" style="--len:600;--d:.6s"/>
        <path d="M0,380 Q300,350 800,386 L800,450 L0,450Z" fill="url(#g-hill)"/><g transform="translate(300,368)"><g class="grow" style="--d:.3s;--o:50% 100%"><path d="M-14,0 L-10,-110 L14,-116 L16,0Z" fill="url(#g-metal)"/></g></g>
        ${lines(['9 Şubat 2021 · Milli Uzay Programı', 'Hedef: Ay · yerli roket (ŞİMŞEK) · astronot', 'Öncesinde: gizemli metal monolitler'], 56, 40)}`);
    }
    const info = {
      esa: ['1975 · Avrupa Uzay Ajansı (ESA)', 'Merkez: Paris · fırlatma: Kourou, Fransız Guyanası', 'ESO ayrı bir kurum: Avrupa Güney Gözlemevi'],
      tua: ['12 Aralık 2018 · Türkiye Uzay Ajansı (TUA)', 'Genel merkez: Ankara', 'Milli Uzay Programı\'nı koordine ediyor'],
      spaceforce: ['20 Aralık 2019 · ABD Uzay Kuvvetleri', 'ABD ordusunun 6. kolu', 'Uzay artık askerî bir alan da'],
    }[v] || [];
    const dots = Array.from({ length: 22 }, (_, i) => { const a = (i / 22) * 2 * PI; return `<circle cx="${(cos(a) * 150).toFixed(1)}" cy="${(sin(a) * 150).toFixed(1)}" r="4" fill="#e8b45a"/>`; }).join('');
    const center = v === 'tua'
      ? `${planet('earth', 0, 0, 70, { spin: 20 })}<g>${spin(0, 0, 12)}<g transform="translate(120,0)">${P.sat('turksat', 0.8)}</g></g>`
      : v === 'spaceforce'
        ? `${planet('earth', 0, 0, 70, { spin: 20 })}<g fill="none" stroke="#86d5ff" stroke-opacity=".5"><ellipse rx="120" ry="40"/><ellipse rx="120" ry="40" transform="rotate(60)"/><ellipse rx="120" ry="40" transform="rotate(-60)"/></g>`
        : `<g>${spin(0, 0, 30)}${dots}</g>${t(0, 10, 'ESA', 'lbl-b', 'text-anchor="middle" style="font-size:40px"')}`;
    return svg(`${stars(90, 89)}<g transform="translate(470,215)"><g class="pop" style="--d:.2s">${center}</g></g>${lines(info, 56, 380)}`);
  };

  S.future = function () {
    const gmt = [[0, 0], [0, -30], [26, -15], [26, 15], [0, 30], [-26, 15], [-26, -15]].map(([x, y], i) => `<g transform="translate(${x},${y})"><g class="pop" style="--d:${0.3 + i * 0.1}s"><circle r="13" fill="url(#g-metal)"/></g></g>`).join('');
    return svg(`${stars(110, 91)}<g transform="translate(160,200)">${gmt}</g>${t(160, 266, 'Dev Macellan Teleskobu (GMT)', 'lbl-s', 'text-anchor="middle"')}${t(160, 284, '7 ayna · 24,5 m', 'lbl-s lbl-gold', 'text-anchor="middle"')}
      <g transform="translate(430,150)"><g class="bob">${P.sat('geo', 1.2)}</g></g><path d="M430,170 L410,345 L450,345Z" fill="#ffcf6b" opacity=".18" class="glowp"/>${t(430, 118, 'Uzaydan güneş enerjisi (ESA Solaris)', 'lbl-s', 'text-anchor="middle"')}
      ${earthArc(980, 620, 80)}<g transform="translate(650,320)"><g class="go" style="--d:1.4s;--dur:4s;--ty:-420px"><g transform="scale(.45)">${P.rocket('default')}</g></g></g>${t(650, 350, 'ŞİMŞEK · ASELSAN · 2027', 'lbl-s', 'text-anchor="middle"')}
      <g transform="translate(700,90)"><g class="spin" style="--dur:20s"><polygon points="-20,-8 -6,-20 14,-16 22,2 10,18 -12,16" fill="url(#g-rock)"/></g></g>${t(700, 130, 'uzay madenciliği', 'lbl-s', 'text-anchor="middle"')}
      ${lines(['2025 ve sonrası', 'Roman (WFIRST) uzay teleskobu · Ariel (ESA, 2028)', 'Çin\'in "yapay Ay" planı · Türkiye: Ay hedefi'])}`);
  };

  S.football = function () {
    return svg(`${stars(80, 93)}${planet('earth', 400, 230, 90, { spin: 20 })}<ellipse cx="400" cy="230" rx="200" ry="70" fill="none" stroke="#8a95c8" stroke-opacity=".3" stroke-dasharray="4 6"/><g>${P.motion(P.orbitPath(400, 230, 200, 70), 6)}${football(16)}</g>
      ${lines(['Kategori dışı soru', 'Uzay arşivine karışmış bir futbol sorusu'], 400, 400, 'middle')}`);
  };
})();
