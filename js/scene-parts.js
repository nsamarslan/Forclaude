/* Sahne parçaları: SVG çizim yardımcıları.
   Hepsi 800x450'lik bir sahne koordinatında, verilen noktaya göre çizer.
   Tek seferlik hareketler CSS sınıflarıyla (style.css > Sahne çizimleri),
   sonsuz dönüşler SMIL (<animateTransform>, <animateMotion>) ile yapılır. */
(function () {
  'use strict';
  const P = (window.ScenePart = {});
  let uidN = 0;
  P.uid = (p = 'u') => `${p}${++uidN}`;

  // Tekrarlanabilir rastgelelik (her açılışta aynı yıldız dizilimi)
  P.rng = function (seed) {
    let s = (seed >>> 0) || 1;
    return () => {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) % 1000003) / 1000003;
    };
  };
  // style="--d:..;--dur:.." üretir
  P.sv = (o) => Object.entries(o).map(([k, v]) => `--${k}:${typeof v === 'number' && !/^(s|lo|hi|from)$/.test(k) ? v + 'px' : v}`).join(';');
  P.t = (x, y, s, cls = '', extra = '') => `<text x="${x}" y="${y}" class="${cls}" ${extra}>${s}</text>`;
  P.spin = (cx, cy, dur, rev) => `<animateTransform attributeName="transform" type="rotate" from="${rev ? 360 : 0} ${cx} ${cy}" to="${rev ? 0 : 360} ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/>`;
  P.orbitPath = (cx, cy, rx, ry) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0`;
  P.motion = (path, dur, begin = 0, extra = '') => `<animateMotion path="${path}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" ${extra}/>`;

  P.DEFS = `<defs>
  <radialGradient id="g-sun" cx="45%" cy="42%" r="60%"><stop offset="0" stop-color="#fffbe6"/><stop offset=".35" stop-color="#ffe08a"/><stop offset=".75" stop-color="#ffa53d"/><stop offset="1" stop-color="#f06a24"/></radialGradient>
  <radialGradient id="g-glow"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="#ffe7a8" stop-opacity=".45"/><stop offset="1" stop-color="#ff9d3a" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-bglow"><stop offset="0" stop-color="#bfe6ff" stop-opacity=".9"/><stop offset=".4" stop-color="#6aa8ff" stop-opacity=".3"/><stop offset="1" stop-color="#3a5bff" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-wglow"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".25" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-earth" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#4f9bff"/><stop offset=".6" stop-color="#2156c4"/><stop offset="1" stop-color="#0d2a74"/></radialGradient>
  <radialGradient id="g-young" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#ffb35c"/><stop offset=".6" stop-color="#c2461c"/><stop offset="1" stop-color="#5a1608"/></radialGradient>
  <radialGradient id="g-moon" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#f1efe6"/><stop offset=".7" stop-color="#b5b3aa"/><stop offset="1" stop-color="#7d7b74"/></radialGradient>
  <radialGradient id="g-mars" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#f4a070"/><stop offset=".65" stop-color="#c85a2e"/><stop offset="1" stop-color="#7a2a12"/></radialGradient>
  <radialGradient id="g-venus" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#fff0c8"/><stop offset=".6" stop-color="#e4bf78"/><stop offset="1" stop-color="#a77a3a"/></radialGradient>
  <radialGradient id="g-mercury" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#d9d3cc"/><stop offset=".7" stop-color="#8f877f"/><stop offset="1" stop-color="#57514b"/></radialGradient>
  <radialGradient id="g-jupiter" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#f6e2c2"/><stop offset="1" stop-color="#b98050"/></radialGradient>
  <radialGradient id="g-saturn" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#fbeec4"/><stop offset=".7" stop-color="#dcc083"/><stop offset="1" stop-color="#9c7e45"/></radialGradient>
  <radialGradient id="g-uranus" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#d8fbff"/><stop offset=".6" stop-color="#8fd8e0"/><stop offset="1" stop-color="#3f8c9c"/></radialGradient>
  <radialGradient id="g-neptune" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#8fb4ff"/><stop offset=".6" stop-color="#3d63e0"/><stop offset="1" stop-color="#1a2a8a"/></radialGradient>
  <radialGradient id="g-pluto" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#f1dfc6"/><stop offset=".7" stop-color="#c49c78"/><stop offset="1" stop-color="#6b4a33"/></radialGradient>
  <radialGradient id="g-rock" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#b7ab9c"/><stop offset="1" stop-color="#4f463e"/></radialGradient>
  <radialGradient id="g-shade" cx="30%" cy="30%" r="80%"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></radialGradient>
  <linearGradient id="g-flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d0"/><stop offset=".3" stop-color="#ffd166"/><stop offset=".7" stop-color="#ff7a2e"/><stop offset="1" stop-color="#ff3d1f" stop-opacity="0"/></linearGradient>
  <linearGradient id="g-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7f8898"/><stop offset=".35" stop-color="#e8edf5"/><stop offset=".6" stop-color="#c3cad6"/><stop offset="1" stop-color="#6d7585"/></linearGradient>
  <linearGradient id="g-white" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9c0cc"/><stop offset=".4" stop-color="#ffffff"/><stop offset="1" stop-color="#aab1bd"/></linearGradient>
  <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#e8b45a"/><stop offset="1" stop-color="#9c6b1f"/></linearGradient>
  <linearGradient id="g-panel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c4fa3"/><stop offset="1" stop-color="#172a63"/></linearGradient>
  <linearGradient id="g-orange" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a8521c"/><stop offset=".45" stop-color="#f09a4a"/><stop offset="1" stop-color="#9a4a18"/></linearGradient>
  <linearGradient id="g-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050818" stop-opacity="0"/><stop offset=".55" stop-color="#101a48" stop-opacity=".55"/><stop offset="1" stop-color="#26306a" stop-opacity=".85"/></linearGradient>
  <linearGradient id="g-dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1236" stop-opacity="0"/><stop offset=".5" stop-color="#553a7a" stop-opacity=".6"/><stop offset=".85" stop-color="#ff9a5a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd28a"/></linearGradient>
  <linearGradient id="g-marssky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1410" stop-opacity=".1"/><stop offset=".6" stop-color="#8a4a30" stop-opacity=".55"/><stop offset="1" stop-color="#d69a70" stop-opacity=".9"/></linearGradient>
  <linearGradient id="g-venussky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4a1a"/><stop offset=".6" stop-color="#c98a3a"/><stop offset="1" stop-color="#f3c36e"/></linearGradient>
  <linearGradient id="g-titansky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a10"/><stop offset="1" stop-color="#d9993a"/></linearGradient>
  <linearGradient id="g-ground-moon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c9a94"/><stop offset="1" stop-color="#3d3c39"/></linearGradient>
  <linearGradient id="g-ground-mars" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c2663a"/><stop offset="1" stop-color="#5a2410"/></linearGradient>
  <linearGradient id="g-ground-venus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8843e"/><stop offset="1" stop-color="#4a2e10"/></linearGradient>
  <linearGradient id="g-ground-titan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5712e"/><stop offset="1" stop-color="#3e2608"/></linearGradient>
  <linearGradient id="g-ground-earth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2550"/><stop offset="1" stop-color="#080b1c"/></linearGradient>
  <linearGradient id="g-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18204a"/><stop offset="1" stop-color="#070a1a"/></linearGradient>
  <linearGradient id="g-rainbow" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a3cff"/><stop offset=".17" stop-color="#3c5bff"/><stop offset=".33" stop-color="#2fc0ff"/><stop offset=".5" stop-color="#3fe07a"/><stop offset=".67" stop-color="#ffe14a"/><stop offset=".83" stop-color="#ff9a2e"/><stop offset="1" stop-color="#ff3b3b"/></linearGradient>
  <radialGradient id="g-vision"><stop offset="0" stop-color="#15204f" stop-opacity=".92"/><stop offset=".85" stop-color="#0a1030" stop-opacity=".92"/><stop offset="1" stop-color="#060a20" stop-opacity=".95"/></radialGradient>
  <radialGradient id="g-atmo"><stop offset=".86" stop-color="#6ab0ff" stop-opacity="0"/><stop offset=".93" stop-color="#6ab0ff" stop-opacity=".45"/><stop offset="1" stop-color="#6ab0ff" stop-opacity="0"/></radialGradient>
  <linearGradient id="g-mx" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".06" stop-color="#fff"/><stop offset=".94" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
  <linearGradient id="g-my" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000"/></linearGradient>
  <mask id="m-edge" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="450"><rect width="800" height="450" fill="url(#g-mx)"/><rect y="405" width="800" height="45" fill="url(#g-my)"/><rect width="800" height="16" fill="url(#g-my)" transform="rotate(180 400 8)"/></mask>
  <filter id="f-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="f-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="f-big" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>
</defs>`;

  P.svg = (inner, cls = '') => `<svg viewBox="0 0 800 450" class="scn ${cls}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${P.DEFS}<g mask="url(#m-edge)">${inner}</g></svg>`;

  // Sahneye özel küçük yıldızlar (arka plan tuvali zaten yıldızlı)
  P.stars = function (n, seed = 7, box = [0, 0, 800, 450], big = false) {
    const R = P.rng(seed);
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = box[0] + R() * (box[2] - box[0]);
      const y = box[1] + R() * (box[3] - box[1]);
      const r = (big ? 1.4 : 0.8) + R() * (big ? 1.6 : 1.1);
      const tw = R() < 0.35 ? ` class="twinkle" style="--d:${(R() * 3).toFixed(2)}s;--dur:${(2 + R() * 3).toFixed(1)}s"` : '';
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${(0.4 + R() * 0.6).toFixed(2)}"${tw}/>`;
    }
    return s;
  };

  // ─── Gök cisimleri
  const CONT = [
    'M-150,-40 C-130,-70 -95,-66 -86,-40 C-78,-18 -104,-2 -98,22 C-92,46 -120,58 -134,36 C-146,16 -166,-12 -150,-40Z',
    'M-52,-72 C-20,-86 12,-70 8,-48 C4,-30 -24,-32 -30,-12 C-36,6 -12,18 -18,40 C-24,62 -50,66 -56,40 C-62,16 -80,-10 -70,-36 C-66,-52 -64,-64 -52,-72Z',
    'M40,-60 C72,-78 118,-66 130,-40 C142,-14 116,-6 102,12 C88,30 60,20 48,0 C36,-20 20,-44 40,-60Z',
    'M60,30 C80,24 104,36 100,58 C96,78 70,80 62,62 C56,50 48,36 60,30Z',
    'M-10,70 C8,64 30,72 26,84 C22,96 -2,96 -12,86Z',
  ];
  function earthSurface(r, spin) {
    const k = r > 200 ? r / 300 : r / 100;
    const R = r / k; // birim uzayda yarıçap
    const conts = CONT.map((d) => `<path d="${d}" fill="#3f9e63"/>`).join('');
    const clouds = '<path d="M-140,-10 q20,-8 40,0 q20,8 40,0" stroke="#fff" stroke-opacity=".55" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M20,30 q24,-8 48,0" stroke="#fff" stroke-opacity=".5" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M-60,-80 q30,-6 60,2" stroke="#fff" stroke-opacity=".45" stroke-width="6" fill="none" stroke-linecap="round"/>';
    const m = Math.ceil(R / 320) + 1;
    let strip = '';
    for (let j = -m; j <= m + 1; j++) {
      const band = R > 150 ? [-R * 0.9, -R * 0.62, -R * 0.3, R * 0.1] : [0];
      band.forEach((dy, bi) => { strip += `<g transform="translate(${j * 320 + bi * 110},${dy.toFixed(0)})">${conts}${clouds}</g>`; });
    }
    const anim = spin ? `<animateTransform attributeName="transform" type="translate" from="0 0" to="-320 0" dur="${spin}s" repeatCount="indefinite"/>` : '';
    const caps = R > 150 ? '' : `<ellipse cx="0" cy="${(-R * 0.94).toFixed(0)}" rx="${(R * 0.6).toFixed(0)}" ry="${(R * 0.14).toFixed(0)}" fill="#eef6ff" opacity=".85"/><ellipse cx="0" cy="${(R * 0.95).toFixed(0)}" rx="${(R * 0.7).toFixed(0)}" ry="${(R * 0.12).toFixed(0)}" fill="#eef6ff" opacity=".85"/>`;
    return `<g transform="scale(${k})"><g>${anim}${strip}</g>${caps}</g>`;
  }
  function craters(r, n, seed, col = '#000') {
    const R = P.rng(seed);
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = R() * 6.283, d = Math.sqrt(R()) * r * 0.85, cr = r * (0.05 + R() * 0.12);
      s += `<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" r="${cr.toFixed(1)}" fill="${col}" opacity=".16"/>`;
    }
    return s;
  }
  function bands(r, cols) {
    let s = '';
    const h = (2 * r) / cols.length;
    cols.forEach((c, i) => {
      s += `<rect x="${-r}" y="${(-r + i * h).toFixed(1)}" width="${2 * r}" height="${(h + 0.6).toFixed(1)}" fill="${c}" opacity=".55"/>`;
    });
    return s;
  }
  P.planet = function (kind, x, y, r, o = {}) {
    const id = P.uid('pc');
    let feat = '';
    switch (kind) {
      case 'earth': feat = earthSurface(r, o.spin === undefined ? 30 : o.spin); break;
      case 'young': feat = `<g opacity=".7" stroke="#ffd27a" stroke-width="${Math.max(1, r / 40)}" fill="none"><path d="M${-r * 0.6},${-r * 0.2} l${r * 0.3},${r * 0.1} l${r * 0.2},${r * 0.3}"/><path d="M${r * 0.1},${-r * 0.6} l${r * 0.2},${r * 0.3} l${r * 0.3},0"/><path d="M${-r * 0.2},${r * 0.4} l${r * 0.4},${r * 0.1}"/></g>`; break;
      case 'moon': case 'mercury': feat = craters(r, 14, kind === 'moon' ? 3 : 11); break;
      case 'rock': feat = craters(r, 8, 5); break;
      case 'mars': feat = `<path d="M${-r},${-r * 0.1} q${r * 0.5},${-r * 0.3} ${r},${-r * 0.05} t${r},${r * 0.1}" stroke="#5a1d0c" stroke-opacity=".35" stroke-width="${r * 0.18}" fill="none"/><path d="M${-r * 0.5},${r * 0.35} q${r * 0.4},${-r * 0.1} ${r * 0.9},${r * 0.05}" stroke="#5a1d0c" stroke-opacity=".28" stroke-width="${r * 0.12}" fill="none"/><ellipse cx="0" cy="${-r * 0.93}" rx="${r * 0.42}" ry="${r * 0.14}" fill="#fff" opacity=".85"/>`; break;
      case 'venus': feat = `<g fill="none" stroke="#fff8e0" stroke-opacity=".35" stroke-width="${r * 0.12}"><path d="M${-r},${-r * 0.3} q${r},${-r * 0.4} ${2 * r},0"/><path d="M${-r},${r * 0.25} q${r},${-r * 0.3} ${2 * r},${r * 0.1}"/></g>`; break;
      case 'jupiter': feat = bands(r, ['#e9d2ae', '#c28a5a', '#f3e3c8', '#b97a4a', '#efdcc0', '#c99466', '#f2e2c6', '#b98252', '#e7cfa9']) + `<ellipse cx="${r * 0.3}" cy="${r * 0.3}" rx="${r * 0.22}" ry="${r * 0.12}" fill="#c4502e" opacity=".85"/>`; break;
      case 'saturn': feat = bands(r, ['#f3e2b0', '#d9bd7c', '#f6e8bf', '#cfae68', '#f2e0ae', '#d8bb7a']); break;
      case 'uranus': feat = bands(r, ['#c9f3f5', '#a9e5ea', '#bfeff2', '#9fdde4']); break;
      case 'neptune': feat = bands(r, ['#5a82ff', '#3e64e6', '#5f86ff', '#3a5ad8']) + `<ellipse cx="${-r * 0.2}" cy="${r * 0.15}" rx="${r * 0.2}" ry="${r * 0.11}" fill="#101a60" opacity=".7"/><path d="M${-r * 0.1},${-r * 0.05} q${r * 0.2},-4 ${r * 0.4},0" stroke="#fff" stroke-opacity=".7" stroke-width="${r * 0.05}" fill="none"/>`; break;
      case 'pluto': feat = `<path d="M${r * 0.05},${r * 0.55} C${-r * 0.45},${r * 0.2} ${-r * 0.45},${-r * 0.35} ${-r * 0.12},${-r * 0.3} C${r * 0.02},${-r * 0.28} ${r * 0.05},${-r * 0.15} ${r * 0.08},${-r * 0.08} C${r * 0.12},${-r * 0.2} ${r * 0.25},${-r * 0.3} ${r * 0.42},${-r * 0.15} C${r * 0.6},${r * 0.05} ${r * 0.35},${r * 0.35} ${r * 0.05},${r * 0.55}Z" fill="#fbf1e2" opacity=".95"/><path d="M${-r},${-r * 0.05} q${r * 0.3},${r * 0.35} ${r * 0.6},${r * 0.45}" stroke="#4a2c1c" stroke-width="${r * 0.2}" fill="none" opacity=".45"/>`; break;
      default: break;
    }
    const grad = kind === 'young' ? 'g-young' : kind === 'rock' ? 'g-rock' : `g-${kind}`;
    let s = `<g transform="translate(${x},${y})${o.tilt ? ` rotate(${o.tilt})` : ''}">`;
    if (o.glow) s += `<circle r="${r * 1.25}" fill="url(#g-atmo)"/>`;
    if (kind === 'saturn' && o.rings !== false) s += P.rings(r, 'back');
    if (kind === 'uranus' && o.rings) s += `<ellipse rx="${r * 0.35}" ry="${r * 1.6}" fill="none" stroke="#bfe9ee" stroke-opacity=".35" stroke-width="2"/>`;
    s += `<clipPath id="${id}"><circle r="${r}"/></clipPath><g clip-path="url(#${id})"><circle r="${r}" fill="url(#${grad})"/>${feat}${o.noShade ? '' : '<circle r="' + r + '" fill="url(#g-shade)"/>'}</g>`;
    if (kind === 'saturn' && o.rings !== false) s += P.rings(r, 'front');
    return s + '</g>';
  };
  P.rings = function (r, half) {
    const rx = r * 2.25, ry = r * 0.55;
    const arcs = (rr, w, col, op) => {
      const a = `M${-rr},0 A${rr},${rr * ry / rx} 0 0,1 ${rr},0`;
      const b = `M${-rr},0 A${rr},${rr * ry / rx} 0 0,0 ${rr},0`;
      return `<path d="${half === 'back' ? a : b}" fill="none" stroke="${col}" stroke-width="${w}" stroke-opacity="${op}"/>`;
    };
    return `<g transform="rotate(-12)">${arcs(rx, r * 0.18, '#e9d6a4', 0.9)}${arcs(rx * 0.86, r * 0.1, '#bfa36c', 0.8)}${arcs(rx * 0.74, r * 0.08, '#e6d4a6', 0.6)}</g>`;
  };
  P.sun = function (x, y, r, o = {}) {
    let s = `<g transform="translate(${x},${y})">`;
    s += `<circle r="${r * (r > 80 ? 1.3 : 2.4)}" fill="url(#g-glow)" class="pulse" style="--dur:4s;--s:1.06"/>`;
    s += `<circle r="${r}" fill="url(#g-sun)"/>`;
    if (o.spots) s += `<circle cx="${r * 0.3}" cy="${-r * 0.2}" r="${r * 0.06}" fill="#b34a14" opacity=".6"/><circle cx="${-r * 0.25}" cy="${r * 0.35}" r="${r * 0.045}" fill="#b34a14" opacity=".55"/>`;
    return s + '</g>';
  };
  P.glowDot = (x, y, r, col = '#fff', cls = '', style = '') => `<g transform="translate(${x},${y})"><g class="${cls}" style="${style}"><circle r="${r * 4}" fill="url(#g-wglow)" opacity=".5"/><circle r="${r}" fill="${col}"/></g></g>`;

  // ─── Roketler (0,0 = taban ortası, yukarı bakar)
  P.flame = (w, len, x = 0, y = 0) => `<g transform="translate(${x},${y})"><ellipse cx="0" cy="${len * 0.35}" rx="${w * 1.6}" ry="${len * 0.55}" fill="#ffb347" opacity=".35" filter="url(#f-soft)"/><path class="flicker" d="M${-w / 2},0 C${-w / 2},${len * 0.4} ${-w / 5},${len * 0.75} 0,${len} C${w / 5},${len * 0.75} ${w / 2},${len * 0.4} ${w / 2},0Z" fill="url(#g-flame)"/></g>`;
  P.smoke = function (x, y, n = 9, seed = 4, spread = 120) {
    const R = P.rng(seed);
    let s = '';
    for (let i = 0; i < n; i++) {
      const cx = x + (R() - 0.5) * spread, cy = y - R() * 20, r = 18 + R() * 26;
      s += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="#dfe3ee" opacity=".75" class="grow" style="--d:${(1.2 + R() * 0.8).toFixed(2)}s;--dur:2.4s"/>`;
    }
    return s;
  };
  P.rocket = function (v, o = {}) {
    const f = o.flame !== false;
    switch (v) {
      case 'goddard':
        return `<g><rect x="-3" y="-80" width="6" height="30" rx="2" fill="#c7cdd8"/><path d="M-3,-80 L0,-90 L3,-80Z" fill="#e05a3a"/><line x1="-2" y1="-50" x2="-4" y2="-24" stroke="#8d95a8" stroke-width="1.5"/><line x1="2" y1="-50" x2="4" y2="-24" stroke="#8d95a8" stroke-width="1.5"/><rect x="-5" y="-40" width="10" height="16" rx="2" fill="#8d95a8"/>${f ? P.flame(6, 26, 0, -24) : ''}</g>`;
      case 'saturn5':
        return `<g><rect x="-15" y="-190" width="30" height="190" fill="url(#g-white)"/><rect x="-15" y="-70" width="30" height="12" fill="#1b1f2a"/><rect x="-15" y="-150" width="30" height="6" fill="#1b1f2a"/><rect x="-7" y="-150" width="7" height="70" fill="#1b1f2a" opacity=".85"/><path d="M-15,-190 L-8,-212 L8,-212 L15,-190Z" fill="url(#g-white)"/><path d="M-8,-212 L0,-236 L8,-212Z" fill="#dfe3ea"/><line x1="0" y1="-236" x2="0" y2="-250" stroke="#dfe3ea" stroke-width="2"/><path d="M-15,-30 L-26,0 L-15,0Z M15,-30 L26,0 L15,0Z" fill="#1b1f2a"/>${f ? P.flame(26, 90) : ''}</g>`;
      case 'falcon9': case 'falconLand':
        return `<g><rect x="-9" y="-200" width="18" height="200" fill="url(#g-white)"/><rect x="-9" y="-128" width="18" height="10" fill="#1b1f2a"/><path d="M-9,-200 Q0,-230 9,-200Z" fill="url(#g-white)"/><rect x="-12" y="-122" width="4" height="7" fill="#444c5c"/><rect x="8" y="-122" width="4" height="7" fill="#444c5c"/>${o.legs ? '<path d="M-9,-12 L-30,6 M9,-12 L30,6" stroke="#1b1f2a" stroke-width="4"/>' : ''}${f ? P.flame(14, o.short ? 40 : 80) : ''}</g>`;
      case 'starship':
        return `<g><rect x="-17" y="-270" width="34" height="270" fill="url(#g-metal)"/><rect x="-17" y="-130" width="34" height="3" fill="#6d7585"/><path d="M-17,-270 Q0,-320 17,-270Z" fill="url(#g-metal)"/><path d="M-17,-285 l-10,14 l10,4Z M17,-285 l10,14 l-10,4Z M-17,-150 l-12,18 l12,4Z M17,-150 l12,18 l-12,4Z" fill="#5a6272"/>${f ? P.flame(30, 110) : ''}</g>`;
      case 'sls':
        return `<g><rect x="-12" y="-210" width="24" height="210" fill="url(#g-orange)"/><rect x="-10" y="-250" width="20" height="40" fill="url(#g-white)"/><path d="M-10,-250 L0,-282 L10,-250Z" fill="url(#g-white)"/><g fill="url(#g-white)"><rect x="-27" y="-190" width="12" height="190"/><rect x="15" y="-190" width="12" height="190"/><path d="M-27,-190 L-21,-205 L-15,-190Z M15,-190 L21,-205 L27,-190Z"/></g>${f ? P.flame(18, 90, -21, 0) + P.flame(18, 90, 21, 0) + P.flame(14, 70) : ''}</g>`;
      case 'newshepard':
        return `<g><rect x="-11" y="-110" width="22" height="110" rx="3" fill="url(#g-white)"/><path d="M-11,-110 Q0,-146 11,-110Z" fill="url(#g-white)"/><rect x="-13" y="-104" width="26" height="4" fill="#3d4a7a"/><path d="M-11,-10 L-22,4 L-11,4Z M11,-10 L22,4 L11,4Z" fill="#3d4a7a"/>${f ? P.flame(16, 60) : ''}</g>`;
      case 'r7':
        return `<g><rect x="-9" y="-190" width="18" height="190" fill="url(#g-white)"/><path d="M-9,-190 L-6,-214 L6,-214 L9,-190Z" fill="#b8c0cc"/><path d="M-6,-214 Q0,-232 6,-214Z" fill="#8a93a5"/><path d="M-9,-90 L-24,0 L-9,0Z M9,-90 L24,0 L9,0Z" fill="#dfe4ec"/><path d="M-9,-90 L-24,0 M9,-90 L24,0" stroke="#8a93a5"/>${f ? P.flame(34, 80) : ''}</g>`;
      case 'energia':
        return `<g><rect x="-13" y="-200" width="26" height="200" fill="url(#g-orange)"/><path d="M-13,-200 Q0,-228 13,-200Z" fill="url(#g-orange)"/><g transform="translate(19,-40)">${P.orbiter(0.9, true)}</g>${f ? P.flame(24, 90) : ''}</g>`;
      default:
        return `<g><rect x="-10" y="-150" width="20" height="150" fill="url(#g-white)"/><path d="M-10,-150 Q0,-180 10,-150Z" fill="#e05a3a"/><path d="M-10,-24 L-22,0 L-10,0Z M10,-24 L22,0 L10,0Z" fill="#e05a3a"/>${f ? P.flame(16, 60) : ''}</g>`;
    }
  };
  // Mekik (uzay aracı gövdesi). up=true dikey (kalkış), değilse sağa bakar
  P.orbiter = function (k = 1, up = false) {
    const body = `<g transform="scale(${k})"><path d="M-60,-6 L40,-8 Q62,-6 70,0 Q62,6 40,8 L-60,8 Z" fill="url(#g-white)"/><path d="M-50,8 L-10,8 L-40,34 L-58,34Z" fill="#e8ecf2"/><path d="M-58,-6 L-44,-6 L-60,-30 L-66,-30Z" fill="#e8ecf2"/><path d="M40,8 Q62,6 70,0 L56,6Z" fill="#1c212c"/><path d="M-50,8 L-10,8 L-40,34 L-58,34Z" fill="#1c212c" opacity=".25"/><rect x="-68" y="-5" width="8" height="10" fill="#6d7585"/><path d="M50,-5 l6,1 l0,3 l-7,0z" fill="#1c212c"/></g>`;
    return up ? `<g transform="rotate(-90)">${body}</g>` : body;
  };

  // ─── Uydular ve sondalar (0,0 merkez)
  P.sat = function (v, k = 1) {
    const w = (s) => `<g transform="scale(${k})">${s}</g>`;
    switch (v) {
      case 'sputnik':
        return w('<g stroke="#cfd6e4" stroke-width="1.5"><line x1="-6" y1="3" x2="-40" y2="16"/><line x1="-6" y1="6" x2="-38" y2="26"/><line x1="-4" y1="-3" x2="-42" y2="4"/><line x1="-4" y1="7" x2="-30" y2="34"/></g><circle r="11" fill="url(#g-metal)"/><circle cx="-3" cy="-4" r="4" fill="#fff" opacity=".7"/>');
      case 'explorer':
        return w('<rect x="-30" y="-4" width="60" height="8" rx="3" fill="url(#g-metal)"/><rect x="-10" y="-5" width="10" height="10" fill="#1b1f2a"/><path d="M30,-4 L40,0 L30,4Z" fill="#cfd6e4"/><g stroke="#cfd6e4"><line x1="-6" y1="-4" x2="-10" y2="-26"/><line x1="-6" y1="4" x2="-10" y2="26"/></g>');
      case 'telstar':
        return w('<circle r="15" fill="url(#g-metal)"/><g fill="#1f2a4a" opacity=".85"><polygon points="0,-6 6,-2 4,5 -4,5 -6,-2"/><polygon points="-10,-12 -5,-14 -3,-9 -8,-7"/><polygon points="10,-12 5,-14 3,-9 8,-7"/><polygon points="-13,4 -9,9 -12,12 -15,8"/><polygon points="13,4 9,9 12,12 15,8"/></g><line x1="0" y1="-15" x2="0" y2="-24" stroke="#cfd6e4"/>');
      case 'landsat':
        return w('<rect x="-10" y="-10" width="20" height="20" fill="url(#g-gold)"/><rect x="10" y="-6" width="46" height="12" fill="url(#g-panel)" stroke="#6f86c9" stroke-width=".6"/><path d="M-4,10 L-40,110 L40,110 L4,10Z" fill="#86d5ff" opacity=".12" class="glowp"/>');
      case 'starlink':
        return w('<rect x="-12" y="-3" width="24" height="6" fill="url(#g-metal)"/><rect x="12" y="-2" width="42" height="4" fill="url(#g-panel)"/>');
      case 'turksat': case 'geo': default:
        return w(`<rect x="-44" y="-9" width="32" height="18" fill="url(#g-panel)" stroke="#6f86c9" stroke-width=".6"/><rect x="12" y="-9" width="32" height="18" fill="url(#g-panel)" stroke="#6f86c9" stroke-width=".6"/><path d="M-44,0 H44" stroke="#6f86c9" stroke-width=".6"/><rect x="-12" y="-12" width="24" height="24" fill="url(#g-gold)"/><path d="M-4,12 q4,10 12,10 q-2,-8 -8,-10" fill="#e8edf5"/>${v === 'turksat' ? '<circle cx="0" cy="0" r="7" fill="#e30a17"/><circle cx="-1" cy="0" r="4.3" fill="#fff"/><circle cx="0.2" cy="0" r="3.5" fill="#e30a17"/><circle cx="3.4" cy="0" r="1.2" fill="#fff"/>' : ''}`);
    }
  };
  P.probe = function (v, k = 1) {
    const w = (s) => `<g transform="scale(${k})">${s}</g>`;
    switch (v) {
      case 'voyager':
        return w('<ellipse cx="0" cy="-10" rx="22" ry="8" fill="#e8edf5"/><path d="M-22,-10 Q0,4 22,-10" fill="#c3cad6"/><rect x="-7" y="-4" width="14" height="10" fill="url(#g-gold)"/><line x1="7" y1="2" x2="46" y2="10" stroke="#cfd6e4" stroke-width="1.5"/><line x1="-7" y1="2" x2="-34" y2="18" stroke="#cfd6e4" stroke-width="1.5"/><circle cx="-36" cy="19" r="3" fill="#8a93a5"/><circle cx="4" cy="12" r="3" fill="#e8b45a"/>');
      case 'pioneer':
        return w('<ellipse cx="0" cy="-8" rx="20" ry="7" fill="#e8edf5"/><rect x="-6" y="-2" width="12" height="9" fill="url(#g-gold)"/><line x1="-6" y1="4" x2="-30" y2="14" stroke="#cfd6e4" stroke-width="1.5"/><line x1="6" y1="4" x2="30" y2="14" stroke="#cfd6e4" stroke-width="1.5"/>');
      case 'juno':
        return w('<rect x="-7" y="-7" width="14" height="14" fill="url(#g-gold)"/><g fill="url(#g-panel)" stroke="#6f86c9" stroke-width=".6"><rect x="7" y="-4" width="48" height="8"/><rect x="-55" y="-4" width="48" height="8"/><rect x="-4" y="7" width="8" height="42"/></g>');
      case 'cassini':
        return w('<ellipse cx="0" cy="-22" rx="16" ry="6" fill="#e8edf5"/><rect x="-8" y="-18" width="16" height="36" fill="url(#g-gold)"/><circle cx="-11" cy="10" r="5" fill="#b8c0cc"/><line x1="8" y1="-10" x2="40" y2="-16" stroke="#cfd6e4"/>');
      case 'newhorizons':
        return w('<path d="M-14,8 L0,-14 L14,8Z" fill="url(#g-gold)"/><ellipse cx="0" cy="-16" rx="12" ry="4.5" fill="#e8edf5"/><rect x="10" y="4" width="16" height="4" fill="#8a93a5"/>');
      case 'parker':
        return w('<rect x="-4" y="-14" width="8" height="26" fill="#cfd6e4"/><path d="M-18,-16 L18,-16 L14,-22 L-14,-22Z" fill="#f4f4f0"/><g fill="url(#g-panel)"><rect x="4" y="-6" width="14" height="4"/><rect x="-18" y="-6" width="14" height="4"/></g>');
      case 'radar':
        return w('<rect x="-8" y="-8" width="16" height="16" fill="url(#g-gold)"/><ellipse cx="0" cy="-16" rx="18" ry="6" fill="#e8edf5"/><g fill="url(#g-panel)"><rect x="8" y="-3" width="30" height="7"/><rect x="-38" y="-3" width="30" height="7"/></g>');
      case 'bepi':
        return w('<rect x="-8" y="-12" width="16" height="24" fill="#cfd6e4"/><rect x="-7" y="-20" width="14" height="8" fill="url(#g-gold)"/><g fill="url(#g-panel)"><rect x="8" y="-2" width="46" height="6"/><rect x="-54" y="-2" width="46" height="6"/></g>');
      default:
        return w('<rect x="-9" y="-9" width="18" height="18" fill="url(#g-gold)"/><ellipse cx="0" cy="-16" rx="14" ry="5" fill="#e8edf5"/><g fill="url(#g-panel)"><rect x="9" y="-4" width="34" height="8"/><rect x="-43" y="-4" width="34" height="8"/></g>');
    }
  };

  // ─── İnsanlar
  P.astronaut = function (k = 1, o = {}) {
    const suit = o.suit || '#f2f4f8';
    const patch = o.flag ? `<rect x="4" y="-26" width="8" height="5" fill="${o.flag}"/>` : '';
    return `<g transform="scale(${k})"><rect x="-13" y="-30" width="10" height="26" rx="3" fill="#c9ced9"/><rect x="-6" y="-32" width="20" height="30" rx="7" fill="${suit}"/>${patch}<rect x="-4" y="-4" width="7" height="22" rx="3" fill="${suit}"/><rect x="5" y="-4" width="7" height="22" rx="3" fill="${suit}"/><rect x="-4" y="14" width="8" height="6" rx="2" fill="#9aa3b5"/><rect x="5" y="14" width="8" height="6" rx="2" fill="#9aa3b5"/><rect x="11" y="-28" width="6" height="18" rx="3" fill="${suit}" transform="rotate(-20 14 -28)"/><rect x="-8" y="-28" width="6" height="18" rx="3" fill="${suit}" transform="rotate(25 -5 -28)"/><circle cx="4" cy="-42" r="12" fill="${suit}"/><ellipse cx="7" cy="-42" rx="8" ry="7" fill="url(#g-gold)"/><ellipse cx="5" cy="-45" rx="3" ry="2" fill="#fff" opacity=".6"/></g>`;
  };

  const LOOK = {
    babylon: { robe: '#7a3b2a', trim: '#e8b45a', skin: '#b98760', hair: '#1c1410', beard: 'long', hat: 'cone' },
    greek: { robe: '#e9e2d0', trim: '#9b7a3c', skin: '#caa07a', hair: '#6b6258', beard: 'full', hat: 'none' },
    roman: { robe: '#efe7d6', trim: '#9e2a2a', skin: '#caa07a', hair: '#3a2c20', beard: 'none', hat: 'wreath' },
    islamic: { robe: '#2f6f5f', trim: '#e8b45a', skin: '#b98a62', hair: '#2a2420', beard: 'full', hat: 'turban' },
    ottoman: { robe: '#8e2430', trim: '#e8b45a', skin: '#c49670', hair: '#3a3028', beard: 'full', hat: 'kavuk' },
    renaissance: { robe: '#2a2440', trim: '#f2efe6', skin: '#d0a482', hair: '#5a4632', beard: 'short', hat: 'cap', ruff: true },
    baroque: { robe: '#2c3f7a', trim: '#e8b45a', skin: '#d6ad8c', hair: '#8a7a6a', beard: 'none', hat: 'wig' },
    victorian: { robe: '#1f2230', trim: '#f2efe6', skin: '#d6ad8c', hair: '#4a3a2c', beard: 'whiskers', hat: 'none' },
    modern: { robe: '#2b3550', trim: '#f2efe6', skin: '#d6ad8c', hair: '#3a2e24', beard: 'none', hat: 'none', tie: true },
    woman: { robe: '#4a2c5a', trim: '#f2efe6', skin: '#d8b08e', hair: '#3a2a1e', beard: 'none', hat: 'bun', dress: true },
  };
  P.figure = function (look, tool) {
    const L = LOOK[look] || LOOK.greek;
    const body = L.dress
      ? `<path d="M-30,0 C-26,-40 -18,-70 -14,-96 Q0,-104 16,-96 C20,-70 28,-40 34,0Z" fill="${L.robe}"/><path d="M-12,-96 Q0,-90 14,-96 L12,-80 Q0,-76 -10,-80Z" fill="${L.trim}" opacity=".9"/>`
      : `<path d="M-26,0 L-18,-98 Q0,-108 18,-98 L28,0Z" fill="${L.robe}"/><path d="M-2,-100 L2,0" stroke="${L.trim}" stroke-width="3" opacity=".8"/>${L.tie ? '<path d="M-6,-98 L0,-86 L6,-98Z" fill="#f2efe6"/><path d="M-1.5,-92 L1.5,-92 L2.5,-70 L0,-66 L-2.5,-70Z" fill="#9e2a2a"/>' : ''}${look === 'roman' ? '<path d="M-20,-96 Q10,-60 26,-2" stroke="#9e2a2a" stroke-width="6" fill="none" opacity=".85"/>' : ''}`;
    const ruff = L.ruff ? '<ellipse cx="2" cy="-102" rx="15" ry="5" fill="#f2efe6"/>' : '';
    let head = `<circle cx="4" cy="-120" r="14" fill="${L.skin}"/><circle cx="12" cy="-122" r="1.6" fill="#1a1410"/>`;
    const beard = {
      long: `<path d="M-2,-116 Q6,-84 18,-112 L14,-106 Q8,-96 0,-104Z" fill="${L.hair}"/><path d="M0,-110 h14 M1,-104 h12 M3,-98 h8" stroke="#000" stroke-opacity=".25"/>`,
      full: `<path d="M-4,-118 Q4,-94 18,-114 Q14,-104 4,-104 Q-2,-106 -4,-118Z" fill="${L.hair === '#6b6258' ? '#8f877c' : L.hair}"/>`,
      short: `<path d="M0,-114 Q8,-102 16,-114 Q12,-108 6,-108Z" fill="${L.hair}"/>`,
      whiskers: `<path d="M-6,-122 Q-8,-106 0,-108" stroke="${L.hair}" stroke-width="5" fill="none"/>`,
      none: '',
    }[L.beard];
    const hat = {
      cone: `<path d="M-10,-130 L-6,-156 L14,-156 L18,-130Z" fill="#3a2a5a"/><rect x="-11" y="-133" width="30" height="5" fill="${L.trim}"/>`,
      turban: `<ellipse cx="3" cy="-133" rx="16" ry="10" fill="#f2efe6"/><path d="M-12,-134 Q4,-126 18,-136" stroke="#d9d3c3" stroke-width="2" fill="none"/>`,
      kavuk: `<ellipse cx="3" cy="-138" rx="19" ry="15" fill="#f5f1e6"/><rect x="-3" y="-155" width="12" height="10" rx="3" fill="#8e2430"/><path d="M-14,-136 Q4,-128 22,-138" stroke="#d9d3c3" stroke-width="2" fill="none"/>`,
      cap: `<path d="M-12,-128 Q4,-142 20,-128 Z" fill="#161222"/><rect x="-12" y="-130" width="32" height="4" rx="2" fill="#161222"/>`,
      wig: `<path d="M-12,-122 Q-14,-142 4,-138 Q22,-142 20,-124 L22,-100 Q14,-104 14,-116 L-8,-116 Q-6,-104 -14,-100Z" fill="${L.hair}"/>`,
      wreath: `<path d="M-10,-126 Q4,-138 18,-126" stroke="#6b9a3a" stroke-width="4" fill="none" stroke-dasharray="3 2"/>`,
      bun: `<circle cx="-8" cy="-132" r="7" fill="${L.hair}"/><path d="M-10,-122 Q4,-140 18,-124 Q10,-130 -4,-126Z" fill="${L.hair}"/>`,
      none: `<path d="M-10,-124 Q4,-140 18,-126 Q10,-132 -2,-128Z" fill="${L.hair}"/>`,
    }[L.hat];
    head = `<g class="head">${head}${beard}${hat}</g>`;
    // kol ve alet
    let arm = `<path d="M8,-94 Q30,-86 34,-74" stroke="${L.robe}" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="35" cy="-72" r="5" fill="${L.skin}"/>`;
    let front = '', back = '';
    switch (tool) {
      case 'telescope':
        arm = `<path d="M8,-94 Q24,-104 30,-116" stroke="${L.robe}" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="31" cy="-118" r="5" fill="${L.skin}"/>`;
        front = `<g transform="translate(14,-124) rotate(-32)"><rect x="0" y="-5" width="96" height="10" rx="2" fill="url(#g-gold)"/><rect x="-6" y="-3.5" width="10" height="7" fill="#6b4a1a"/><rect x="86" y="-7" width="12" height="14" rx="2" fill="#9c6b1f"/></g>`;
        break;
      case 'bigscope':
        back = `<g transform="translate(70,0)"><path d="M0,0 L20,-70 L40,0 M20,-70 L20,0" stroke="#8a7a5a" stroke-width="3" fill="none"/><g transform="translate(20,-74) rotate(-40)"><rect x="-30" y="-12" width="140" height="24" rx="3" fill="#caa05a"/><rect x="100" y="-14" width="14" height="28" fill="#9c6b1f"/><rect x="-24" y="-16" width="8" height="8" fill="#6b4a1a"/></g></g>`;
        arm = `<path d="M8,-94 Q34,-100 50,-92" stroke="${L.robe}" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="52" cy="-91" r="5" fill="${L.skin}"/>`;
        break;
      case 'astrolabe':
        front = `<g transform="translate(40,-80)"><circle r="16" fill="url(#g-gold)"/><circle r="12" fill="none" stroke="#6b4a1a"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite"/><path d="M0,-11 L0,11 M-11,0 L11,0" stroke="#6b4a1a"/><circle cx="4" cy="-3" r="5" fill="none" stroke="#6b4a1a"/></g><circle cy="-19" r="3" fill="none" stroke="#e8b45a" stroke-width="2"/></g>`;
        break;
      case 'quadrant':
        front = `<g transform="translate(34,-76) rotate(-20)"><path d="M0,0 L60,0 A60,60 0 0,0 0,-60Z" fill="#caa05a" opacity=".85"/><path d="M0,0 L60,0 A60,60 0 0,0 0,-60Z" fill="none" stroke="#6b4a1a" stroke-width="2"/><line x1="0" y1="0" x2="36" y2="-44" stroke="#6b4a1a"/></g>`;
        break;
      case 'scroll':
        front = `<g transform="translate(30,-78) rotate(-8)"><rect x="-4" y="-18" width="40" height="36" fill="#efe2bf"/><rect x="-7" y="-20" width="6" height="40" rx="3" fill="#b89a60"/><rect x="33" y="-20" width="6" height="40" rx="3" fill="#b89a60"/><path d="M4,-8 h22 M4,-2 h18 M4,4 h24 M4,10 h14" stroke="#6b5a3a"/></g>`;
        break;
      case 'tablet':
        front = `<g transform="translate(32,-80) rotate(-10)"><rect x="-4" y="-22" width="30" height="40" rx="4" fill="#b98c5a"/><path d="M2,-14 l4,3 l4,-3 M12,-14 l4,3 l4,-3 M2,-4 l4,3 l4,-3 M14,-2 l4,3 M2,6 l4,3 l4,-3 l4,3" stroke="#6b4a2a" stroke-width="1.5" fill="none"/></g>`;
        break;
      case 'quill':
        back = `<g transform="translate(58,0)"><rect x="0" y="-62" width="70" height="6" fill="#6b4a2a"/><rect x="6" y="-56" width="6" height="56" fill="#4a3220"/><rect x="58" y="-56" width="6" height="56" fill="#4a3220"/><rect x="10" y="-70" width="48" height="10" fill="#efe2bf" transform="skewX(-20)"/></g>`;
        arm = `<path d="M8,-94 Q36,-86 52,-72" stroke="${L.robe}" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="54" cy="-70" r="5" fill="${L.skin}"/><path d="M56,-72 L74,-100" stroke="#f2efe6" stroke-width="3"/>`;
        break;
      case 'globe':
        back = `<g transform="translate(76,-40)"><line x1="0" y1="10" x2="0" y2="40" stroke="#8a7a5a" stroke-width="4"/><rect x="-14" y="38" width="28" height="4" fill="#8a7a5a"/><circle r="26" fill="none" stroke="#e8b45a" stroke-width="2"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite"/><ellipse rx="26" ry="9" fill="none" stroke="#e8b45a" stroke-width="1.5"/><ellipse rx="9" ry="26" fill="none" stroke="#caa05a" stroke-width="1.5"/></g><circle r="5" fill="#4f9bff"/></g>`;
        break;
      case 'lens':
        front = `<g transform="translate(38,-80) rotate(-30)"><line x1="0" y1="0" x2="0" y2="16" stroke="#6b4a2a" stroke-width="4"/><circle cy="-10" r="12" fill="#bfe6ff" fill-opacity=".25" stroke="#e8b45a" stroke-width="3"/></g>`;
        break;
      case 'prism':
        arm = `<path d="M8,-94 Q26,-108 34,-116" stroke="${L.robe}" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="35" cy="-118" r="5" fill="${L.skin}"/>`;
        front = `<g transform="translate(46,-130)"><path d="M-40,-60 L-4,-6" stroke="#fff" stroke-width="3" opacity=".9" class="draw" style="--len:70;--dur:1s"/><path d="M-10,0 L10,-20 L14,8Z" fill="#cfefff" fill-opacity=".45" stroke="#fff"/><g class="fade" style="--d:1s"><path d="M12,-4 L120,-40" stroke="#ff3b3b" stroke-width="2"/><path d="M12,-3 L120,-30" stroke="#ff9a2e" stroke-width="2"/><path d="M12,-2 L120,-20" stroke="#ffe14a" stroke-width="2"/><path d="M12,-1 L120,-10" stroke="#3fe07a" stroke-width="2"/><path d="M12,0 L120,0" stroke="#2fc0ff" stroke-width="2"/><path d="M12,1 L120,10" stroke="#3c5bff" stroke-width="2"/><path d="M12,2 L120,20" stroke="#7a3cff" stroke-width="2"/></g></g>`;
        break;
      case 'plate':
        front = `<g transform="translate(34,-96)"><rect x="-4" y="-26" width="34" height="40" rx="2" fill="#9fb8d8" fill-opacity=".35" stroke="#cfe0f5"/><g fill="#0a1030"><circle cx="6" cy="-16" r="1.4"/><circle cx="18" cy="-8" r="1"/><circle cx="10" cy="2" r="1.6"/><circle cx="22" cy="6" r="1.1"/></g></g>`;
        break;
      case 'chalk':
        back = `<g transform="translate(-150,-190)"><rect width="120" height="80" fill="#1d3a2e" stroke="#6b4a2a" stroke-width="5"/><text x="12" y="32" style="fill:#eef5e8;font-size:13px">Gμν = 8πG Tμν</text><text x="12" y="58" style="fill:#eef5e8;font-size:13px">E = mc²</text></g>`;
        break;
      case 'podium':
        front = `<g transform="translate(44,0)"><path d="M-22,-70 L22,-70 L16,0 L-16,0Z" fill="#5a3a24"/><rect x="-26" y="-76" width="52" height="8" fill="#6b4a2a"/><circle cx="-2" cy="-84" r="4" fill="#1b1f2a"/><line x1="-2" y1="-80" x2="-2" y2="-76" stroke="#1b1f2a" stroke-width="2"/></g>`;
        break;
      default: break;
    }
    return `<g class="figure">${back}<ellipse cx="0" cy="2" rx="40" ry="6" fill="#000" opacity=".35"/>${body}${ruff}${arm}${head}${front}</g>`;
  };
  P.setting = function (look) {
    const c = '#101840';
    switch (look) {
      case 'babylon': return `<path d="M-10,450 L-10,330 L40,330 L40,300 L90,300 L90,270 L150,270 L150,300 L200,300 L200,330 L250,330 L250,450Z" fill="${c}"/>`;
      case 'greek': case 'roman': return `<g fill="${c}"><rect x="20" y="300" width="200" height="12"/><path d="M14,300 L120,262 L226,300Z"/><rect x="34" y="312" width="16" height="140"/><rect x="84" y="312" width="16" height="140"/><rect x="134" y="312" width="16" height="140"/><rect x="184" y="312" width="16" height="100"/></g>`;
      case 'islamic': case 'ottoman': return `<g fill="${c}"><path d="M40,450 L40,330 Q110,250 180,330 L180,450Z"/><rect x="200" y="230" width="16" height="220"/><path d="M200,230 L208,196 L216,230Z"/>${look === 'ottoman' ? '<rect x="12" y="250" width="14" height="200"/><path d="M12,250 L19,218 L26,250Z"/>' : ''}</g>`;
      case 'renaissance': return `<g fill="${c}"><rect x="30" y="250" width="70" height="200"/><path d="M26,250 L65,214 L104,250Z"/><rect x="110" y="320" width="140" height="130"/><path d="M104,320 L180,286 L256,320Z"/></g>`;
      case 'baroque': return `<g fill="${c}"><rect x="20" y="300" width="220" height="150"/><path d="M10,300 L130,252 L250,300Z"/><rect x="60" y="232" width="14" height="40"/></g>`;
      default: return `<g fill="${c}"><rect x="20" y="330" width="120" height="120"/><path d="M20,330 A60,60 0 0,1 140,330Z"/><rect x="74" y="270" width="10" height="60" fill="#1a2458"/></g>`;
    }
  };

  // ─── Kapsüller, istasyonlar, araçlar
  P.faces = {
      human: '<circle cx="0" cy="0" r="6" fill="#d6ad8c"/><path d="M-6,-2 Q0,-10 6,-2" fill="#3a2e24"/><circle cx="-2" cy="1" r=".9"/><circle cx="2" cy="1" r=".9"/>',
      woman: '<circle cx="0" cy="0" r="6" fill="#d8b08e"/><path d="M-7,2 Q-6,-10 0,-8 Q6,-10 7,2 Q4,-4 0,-5 Q-4,-4 -7,2Z" fill="#3a2a1e"/><circle cx="-2" cy="1" r=".9"/><circle cx="2" cy="1" r=".9"/>',
      taikonaut: '<circle cx="0" cy="0" r="6.5" fill="#f2f4f8"/><ellipse cx="1" cy="0" rx="4.5" ry="4" fill="url(#g-gold)"/>',
      dog: '<ellipse cx="0" cy="1" rx="6" ry="5" fill="#f1e8dc"/><path d="M-6,-2 L-8,-8 L-3,-4Z M6,-2 L8,-8 L3,-4Z" fill="#6b4a2a"/><circle cx="-2" cy="0" r=".9"/><circle cx="2" cy="0" r=".9"/><circle cx="0" cy="3" r="1.1" fill="#1a1410"/>',
      fly: '<g fill="#6b3a1a"><ellipse cx="-3" cy="0" rx="2" ry="1.2"/><ellipse cx="3" cy="-2" rx="2" ry="1.2"/><ellipse cx="0" cy="3" rx="2" ry="1.2"/></g><g fill="#cfe0f5" opacity=".7"><ellipse cx="-3" cy="-1.4" rx="1.4" ry=".8"/><ellipse cx="3" cy="-3.4" rx="1.4" ry=".8"/></g>',
  };
  P.capsule = function (v, who) {
    const face = P.faces[who] || '';
    const win = (x, y, r = 9) => `<g transform="translate(${x},${y})"><circle r="${r}" fill="#0a1030" stroke="#cfd6e4" stroke-width="2"/><g transform="scale(${r / 9})">${face}</g><circle cx="-3" cy="-4" r="2" fill="#fff" opacity=".35"/></g>`;
    switch (v) {
      case 'vostok':
        return `<g><path d="M18,-14 L60,-20 L60,20 L18,14Z" fill="#b8c0cc"/><rect x="58" y="-24" width="8" height="48" fill="#8a93a5"/><circle r="26" fill="url(#g-metal)"/>${win(-4, -4, 10)}<g stroke="#cfd6e4"><line x1="-14" y1="-20" x2="-34" y2="-40"/><line x1="-6" y1="-25" x2="-12" y2="-50"/></g></g>`;
      case 'soyuz': case 'shenzhou':
        return `<g><circle cx="-38" r="14" fill="url(#g-metal)"/><path d="M-24,-14 L6,-20 L6,20 L-24,14Z" fill="#9aa3b5"/>${win(-10, 0, 7)}<rect x="6" y="-16" width="30" height="32" fill="#5a6a4a"/><g fill="url(#g-panel)"><rect x="18" y="-60" width="10" height="44"/><rect x="18" y="16" width="10" height="44"/></g></g>`;
      case 'dragon':
        return `<g><path d="M-26,-18 L10,-24 Q22,-20 24,0 Q22,20 10,24 L-26,18Z" fill="url(#g-white)"/><rect x="-44" y="-20" width="18" height="40" fill="#1b1f2a"/>${win(0, 0, 6)}</g>`;
      default: // gemini / genel
        return `<g><path d="M-30,-18 L20,-8 L20,8 L-30,18Z" fill="#1d2230"/><rect x="20" y="-20" width="24" height="40" fill="#e8ecf2"/>${win(-6, 0, 7)}</g>`;
    }
  };
  P.station = function (v) {
    const panel = (x, y, w, h, c = 'url(#g-panel)') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="#6f86c9" stroke-width=".6"/>`;
    const goldPanel = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#b8762e" stroke="#e8b45a" stroke-width=".6"/>`;
    switch (v) {
      case 'salyut':
        return `<g class="fade"><rect x="-70" y="-14" width="60" height="28" rx="4" fill="url(#g-metal)"/><rect x="-10" y="-18" width="70" height="36" rx="4" fill="url(#g-metal)"/><rect x="60" y="-10" width="16" height="20" fill="#8a93a5"/>${panel(-50, -60, 14, 46)}${panel(-50, 14, 14, 46)}${panel(20, -64, 14, 46)}${panel(20, 18, 14, 46)}</g>`;
      case 'skylab':
        return `<g class="fade"><rect x="-80" y="-22" width="120" height="44" rx="4" fill="url(#g-gold)"/><rect x="40" y="-12" width="40" height="24" fill="url(#g-metal)"/><g transform="translate(96,0)">${panel(-6, -70, 12, 60)}${panel(-6, 10, 12, 60)}${panel(-70, -6, 60, 12)}${panel(10, -6, 60, 12)}<circle r="8" fill="#cfd6e4"/></g>${panel(-60, 22, 70, 20)}</g>`;
      case 'mir':
        return `<g><rect x="-60" y="-14" width="120" height="28" rx="6" fill="url(#g-metal)"/>${panel(-40, -64, 16, 50)}${panel(-40, 14, 16, 50)}<g class="move" style="--fx:0px;--fy:-200px;--d:.5s"><rect x="-8" y="-110" width="16" height="96" fill="url(#g-metal)"/>${panel(-40, -100, 32, 12)}</g><g class="move" style="--fx:0px;--fy:200px;--d:.9s"><rect x="-8" y="14" width="16" height="96" fill="url(#g-metal)"/>${panel(8, 70, 32, 12)}</g><g class="move" style="--fx:300px;--fy:0px;--d:1.3s"><rect x="60" y="-10" width="80" height="20" fill="url(#g-metal)"/>${panel(90, -50, 12, 40)}</g></g>`;
      case 'iss':
      default:
        return `<g><rect x="-230" y="-5" width="460" height="10" fill="#9aa3b5"/>${[-200, -140, 140, 200].map((x, i) => `<g class="grow" style="--d:${0.4 + i * 0.25}s;--o:50% 50%">${goldPanel(x - 16, -120, 32, 112)}${goldPanel(x - 16, 8, 32, 112)}</g>`).join('')}<g class="move" style="--fy:220px;--d:.2s"><rect x="-60" y="-18" width="120" height="36" rx="6" fill="url(#g-white)"/><rect x="-12" y="-60" width="24" height="44" rx="4" fill="url(#g-white)"/><rect x="-12" y="18" width="24" height="54" rx="4" fill="url(#g-white)"/></g><g class="move" style="--fx:-260px;--d:.7s"><rect x="-120" y="-14" width="62" height="28" rx="5" fill="url(#g-white)"/></g><g class="move" style="--fx:260px;--d:1s"><rect x="58" y="-14" width="70" height="28" rx="5" fill="url(#g-white)"/></g><g fill="#eef1f6" opacity=".9"><rect x="-90" y="16" width="10" height="40"/><rect x="80" y="16" width="10" height="40"/></g></g>`;
    }
  };
  P.rover = function (v) {
    const wheel = (x, r = 9) => `<g transform="translate(${x},0)"><circle r="${r}" fill="#2a2e38"/><circle r="${r * 0.45}" fill="#6d7585"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite"/><line x1="${-r}" y1="0" x2="${r}" y2="0" stroke="#6d7585" stroke-width="1.5"/><line x1="0" y1="${-r}" x2="0" y2="${r}" stroke="#6d7585" stroke-width="1.5"/></g></g>`;
    switch (v) {
      case 'lunokhod':
        return `<g><g transform="translate(0,-9)">${[-42, -28, -14, 0, 14, 28, 42].slice(0, 4).map((x) => wheel(x * 1.2 - 8, 9)).join('')}</g><path d="M-58,-22 L58,-22 L50,-50 L-50,-50Z" fill="url(#g-metal)"/><path d="M-56,-50 Q0,-80 56,-50" fill="url(#g-panel)" stroke="#6f86c9"/><circle cx="54" cy="-36" r="5" fill="#1b1f2a"/><line x1="-40" y1="-50" x2="-50" y2="-80" stroke="#cfd6e4"/></g>`;
      case 'lrv':
        return `<g><g transform="translate(0,-9)">${wheel(-50, 10)}${wheel(50, 10)}</g><rect x="-66" y="-30" width="132" height="10" fill="#8a93a5"/><path d="M-66,-30 L-60,-40 M66,-30 L60,-40" stroke="#cfd6e4" stroke-width="3"/><g transform="translate(-22,-26)">${P.astronaut(0.8)}</g><g transform="translate(18,-26)">${P.astronaut(0.8, { flag: '#3a5bd9' })}</g><line x1="54" y1="-30" x2="58" y2="-80" stroke="#cfd6e4" stroke-width="2"/><path d="M44,-84 Q58,-96 72,-84Z" fill="#e8edf5"/></g>`;
      case 'sojourner':
        return `<g transform="scale(.8)"><g transform="translate(0,-7)">${wheel(-22, 7)}${wheel(0, 7)}${wheel(22, 7)}</g><rect x="-28" y="-26" width="56" height="12" fill="#cfd6e4"/><rect x="-30" y="-30" width="60" height="4" fill="url(#g-panel)"/><line x1="18" y1="-30" x2="20" y2="-50" stroke="#cfd6e4"/></g>`;
      case 'pragyan':
        return `<g transform="scale(.7)"><g transform="translate(0,-7)">${wheel(-22, 7)}${wheel(0, 7)}${wheel(22, 7)}</g><rect x="-26" y="-28" width="52" height="16" fill="url(#g-gold)"/><rect x="-24" y="-52" width="44" height="22" fill="url(#g-panel)" transform="skewX(-12)"/></g>`;
      case 'zhurong':
        return `<g><g transform="translate(0,-10)">${wheel(-40, 10)}${wheel(0, 10)}${wheel(40, 10)}</g><rect x="-48" y="-40" width="96" height="24" rx="4" fill="#e8edf5"/><g fill="#3a6fd9" stroke="#8fb4ff" stroke-width=".8"><path d="M-40,-40 L-86,-76 L-60,-40Z"/><path d="M40,-40 L86,-76 L60,-40Z"/><path d="M-30,-40 L-40,-80 L-10,-40Z"/><path d="M30,-40 L40,-80 L10,-40Z"/></g><rect x="-4" y="-86" width="6" height="46" fill="#cfd6e4"/><rect x="-10" y="-96" width="18" height="12" fill="#e8edf5"/></g>`;
      case 'opportunity':
        return `<g><g transform="translate(0,-9)">${wheel(-38, 9)}${wheel(0, 9)}${wheel(38, 9)}</g><rect x="-40" y="-36" width="80" height="18" fill="url(#g-gold)"/><path d="M-70,-40 L70,-40 L60,-34 L-60,-34Z" fill="url(#g-panel)" stroke="#6f86c9"/><rect x="18" y="-92" width="5" height="52" fill="#cfd6e4"/><rect x="12" y="-100" width="18" height="10" fill="#e8edf5"/></g>`;
      case 'rosalind':
        return `<g opacity=".8"><g transform="translate(0,-10)">${wheel(-40, 10)}${wheel(0, 10)}${wheel(40, 10)}</g><rect x="-46" y="-42" width="92" height="26" rx="3" fill="#e8edf5"/><g fill="url(#g-panel)"><rect x="-86" y="-46" width="38" height="8"/><rect x="48" y="-46" width="38" height="8"/></g><rect x="-30" y="-100" width="6" height="58" fill="#cfd6e4"/><rect x="-38" y="-110" width="22" height="12" fill="#e8edf5"/></g>`;
      case 'curiosity': case 'perseverance': default:
        return `<g><g transform="translate(0,-11)">${wheel(-46, 11)}${wheel(0, 11)}${wheel(46, 11)}</g><path d="M-46,-11 L-24,-30 L24,-30 L46,-11" stroke="#8a93a5" stroke-width="3" fill="none"/><rect x="-44" y="-50" width="88" height="24" rx="3" fill="#e8edf5"/><rect x="-60" y="-48" width="18" height="18" fill="#6d7585" transform="rotate(-20 -51 -39)"/><rect x="24" y="-112" width="7" height="64" fill="#cfd6e4"/><rect x="16" y="-124" width="24" height="14" rx="2" fill="#e8edf5"/><circle cx="36" cy="-117" r="3" fill="#1b1f2a"/><path d="M44,-40 L70,-30 L78,-12" stroke="#cfd6e4" stroke-width="4" fill="none"/></g>`;
    }
  };
  P.heli = () => `<g><rect x="-3" y="-4" width="6" height="30" fill="#cfd6e4"/><rect x="-10" y="18" width="20" height="12" rx="2" fill="#e8edf5"/><path d="M-10,30 L-18,44 M10,30 L18,44" stroke="#cfd6e4" stroke-width="2"/><rect x="-12" y="30" width="24" height="3" fill="url(#g-panel)"/><g><ellipse cx="0" cy="-4" rx="36" ry="3" fill="#dfe3ea" opacity=".75"><animate attributeName="rx" values="36;8;36" dur=".25s" repeatCount="indefinite"/></ellipse><ellipse cx="0" cy="4" rx="36" ry="3" fill="#dfe3ea" opacity=".75"><animate attributeName="rx" values="8;36;8" dur=".25s" repeatCount="indefinite"/></ellipse></g></g>`;
  P.lander = function (v) {
    switch (v) {
      case 'apollo':
        return `<g><path d="M-30,-10 L-44,26 M30,-10 L44,26 M-10,-8 L-14,26 M10,-8 L14,26" stroke="#cfd6e4" stroke-width="3"/><rect x="-44" y="23" width="12" height="4" fill="#cfd6e4"/><rect x="32" y="23" width="12" height="4" fill="#cfd6e4"/><path d="M-34,-40 L34,-40 L30,-8 L-30,-8Z" fill="url(#g-gold)"/><path d="M-26,-40 L-18,-76 L22,-76 L28,-54 L26,-40Z" fill="#b8c0cc"/><path d="M-4,-70 L8,-70 L8,-58 L-4,-58Z" fill="#1b1f2a"/><line x1="16" y1="-76" x2="22" y2="-92" stroke="#cfd6e4"/></g>`;
      case 'luna':
        return `<g><g class="fade" style="--d:2.4s" fill="#b8c0cc"><path d="M-6,-2 L-40,6 L-36,-6Z"/><path d="M6,-2 L40,6 L36,-6Z"/><path d="M-2,-6 L-18,-32 L-8,-30Z"/><path d="M2,-6 L18,-32 L8,-30Z"/></g><circle cy="-14" r="16" fill="url(#g-metal)"/><circle cx="-4" cy="-18" r="4" fill="#1b1f2a"/></g>`;
      case 'vikram':
        return `<g><path d="M-30,-10 L-40,20 M30,-10 L40,20" stroke="#cfd6e4" stroke-width="3"/><rect x="-32" y="-44" width="64" height="36" fill="url(#g-gold)"/><rect x="-30" y="-58" width="60" height="14" fill="url(#g-panel)"/><path d="M28,-12 L60,18" stroke="#cfd6e4" stroke-width="4"/></g>`;
      case 'change':
        return `<g><path d="M-34,-8 L-46,22 M34,-8 L46,22" stroke="#cfd6e4" stroke-width="3"/><rect x="-36" y="-34" width="72" height="28" fill="url(#g-gold)"/><g fill="url(#g-panel)"><rect x="-80" y="-30" width="44" height="10"/><rect x="36" y="-30" width="44" height="10"/></g><g class="go" style="--d:3.2s;--dur:3s;--ty:-420px"><rect x="-14" y="-56" width="28" height="22" fill="#b8c0cc"/>${P.flame(10, 26, 0, -34)}</g></g>`;
      case 'viking': case 'phoenix':
        return `<g><path d="M-30,-6 L-44,22 M30,-6 L44,22 M0,-6 L0,24" stroke="#cfd6e4" stroke-width="3"/><path d="M-36,-30 L36,-30 L30,-6 L-30,-6Z" fill="#cfd6e4"/>${v === 'phoenix' ? '<g fill="url(#g-panel)" stroke="#6f86c9"><circle cx="-62" cy="-26" r="22"/><circle cx="62" cy="-26" r="22"/></g><path d="M20,-30 L50,-60 L70,-30" stroke="#cfd6e4" stroke-width="3" fill="none"/>' : '<ellipse cx="18" cy="-46" rx="16" ry="6" fill="#e8edf5"/><line x1="18" y1="-40" x2="18" y2="-30" stroke="#cfd6e4" stroke-width="2"/><rect x="-24" y="-56" width="6" height="26" fill="#cfd6e4"/>'}</g>`;
      case 'venera':
        return `<g><circle cy="-30" r="26" fill="url(#g-metal)"/><rect x="-30" y="-6" width="60" height="10" rx="4" fill="#8a93a5"/><circle cx="-8" cy="-36" r="5" fill="#1b1f2a"/><ellipse cy="-58" rx="18" ry="5" fill="#b8c0cc"/></g>`;
      case 'beagle':
        return `<g><ellipse cy="-8" rx="30" ry="10" fill="#cfd6e4"/><g fill="url(#g-panel)" stroke="#6f86c9"><path d="M-30,-10 L-56,-26 L-30,-26Z"/><path d="M30,-10 L44,-34 L20,-24Z" opacity=".6"/></g></g>`;
      default:
        return `<g><rect x="-20" y="-30" width="40" height="30" fill="url(#g-gold)"/></g>`;
    }
  };
  P.telescopeCraft = function (v) {
    const panel = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#g-panel)" stroke="#6f86c9" stroke-width=".6"/>`;
    switch (v) {
      case 'jwst': {
        let hexes = '';
        const pts = [[0, 0], [0, -30], [0, 30], [26, -15], [26, 15], [-26, -15], [-26, 15], [0, -60], [0, 60], [26, -45], [26, 45], [-26, -45], [-26, 45], [52, 0], [-52, 0], [52, -30], [-52, 30], [52, 30]];
        const hex = (x, y) => `<polygon points="${[0, 60, 120, 180, 240, 300].map((a) => `${(x + 15 * Math.cos(a * Math.PI / 180)).toFixed(1)},${(y + 15 * Math.sin(a * Math.PI / 180)).toFixed(1)}`).join(' ')}" fill="url(#g-gold)" stroke="#7a5212" stroke-width="1"/>`;
        pts.forEach(([x, y], i) => { if (!(x === 0 && y === 0)) hexes += `<g class="pop" style="--d:${(0.8 + i * 0.08).toFixed(2)}s">${hex(x, y)}</g>`; });
        const shield = [0, 1, 2, 3, 4].map((i) => `<path d="M${-150 + i * 4},${70 + i * 6} L0,${40 + i * 6} L${150 - i * 4},${70 + i * 6} L0,${110 + i * 6}Z" fill="${i % 2 ? '#c9b8e6' : '#b19ad8'}" opacity=".9"/>`).join('');
        return `<g><g class="grow" style="--d:.2s;--o:50% 50%">${shield}</g><line x1="0" y1="40" x2="0" y2="-30" stroke="#8a93a5" stroke-width="4"/>${hexes}<line x1="-40" y1="-70" x2="0" y2="-110" stroke="#8a93a5" stroke-width="2"/><line x1="40" y1="-70" x2="0" y2="-110" stroke="#8a93a5" stroke-width="2"/><circle cy="-110" r="5" fill="#8a93a5"/></g>`;
      }
      case 'kepler':
        return `<g transform="rotate(-20)"><rect x="-22" y="-60" width="44" height="100" fill="url(#g-metal)"/><path d="M-22,-60 L22,-80 L22,-60Z" fill="#cfd6e4"/>${panel(22, -40, 16, 80)}<rect x="-24" y="40" width="48" height="16" fill="url(#g-gold)"/></g>`;
      case 'tess':
        return `<g><rect x="-30" y="0" width="60" height="30" fill="url(#g-gold)"/>${panel(-90, 8, 58, 14)}${panel(32, 8, 58, 14)}${[-18, -6, 6, 18].map((x) => `<rect x="${x - 5}" y="-40" width="10" height="40" fill="#1b1f2a" stroke="#6d7585"/>`).join('')}</g>`;
      case 'gaia':
        return `<g><ellipse cy="20" rx="110" ry="22" fill="url(#g-panel)" stroke="#6f86c9"/><ellipse cy="14" rx="110" ry="20" fill="#cfd6e4" opacity=".25"/><rect x="-30" y="-40" width="60" height="54" fill="url(#g-gold)"/><rect x="-30" y="-48" width="60" height="8" fill="#e8edf5"/></g>`;
      case 'hubble': default:
        return `<g transform="rotate(-18)"><rect x="-90" y="-20" width="160" height="40" rx="6" fill="url(#g-metal)"/><rect x="-60" y="-21" width="4" height="42" fill="#6d7585"/><rect x="10" y="-21" width="4" height="42" fill="#6d7585"/><path d="M70,-20 L96,-30 L96,-24 L74,-16Z" fill="#cfd6e4"/><circle cx="72" cy="0" r="18" fill="#0a1030" opacity=".6"/>${panel(-40, -84, 22, 64)}${panel(-40, 20, 22, 64)}</g>`;
    }
  };
  P.dome = (x, y, s = 1, open = true) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-40" y="-40" width="80" height="40" fill="#cfd6e4"/><path d="M-44,-40 A44,44 0 0,1 44,-40Z" fill="#e8edf5"/>${open ? '<path d="M-6,-83 L6,-83 L6,-40 L-6,-40Z" fill="#0a1030"/><rect x="-3" y="-78" width="6" height="30" fill="#8a93a5" transform="rotate(20 0 -48)"/>' : ''}<rect x="-10" y="-20" width="20" height="20" fill="#8a93a5"/></g>`;

  // Zemin (yüzey) çizimi
  P.ground = function (world, y = 360, seed = 2) {
    const R = P.rng(seed);
    let hill = `M0,${y}`;
    for (let x = 0; x <= 800; x += 50) hill += ` L${x},${(y + (R() - 0.5) * 16).toFixed(0)}`;
    hill += ' L800,450 L0,450Z';
    let deco = '';
    for (let i = 0; i < 14; i++) {
      const x = R() * 800, yy = y + 14 + R() * 70, rx = 6 + R() * 26;
      deco += world === 'moon' || world === 'mercury'
        ? `<ellipse cx="${x.toFixed(0)}" cy="${yy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${(rx * 0.25).toFixed(1)}" fill="#000" opacity=".22"/>`
        : `<ellipse cx="${x.toFixed(0)}" cy="${yy.toFixed(0)}" rx="${(rx * 0.4).toFixed(0)}" ry="${(rx * 0.22).toFixed(1)}" fill="#000" opacity=".25"/>`;
    }
    const grad = { moon: 'g-ground-moon', mars: 'g-ground-mars', venus: 'g-ground-venus', titan: 'g-ground-titan', earth: 'g-ground-earth' }[world] || 'g-hill';
    return `<path d="${hill}" fill="url(#${grad})"/>${deco}`;
  };
})();
