/* Zor Shor — first draft interactions */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

/* ---------- stop-motion "boil" on hand-drawn bits ---------- */
const boilT = $('#boilT');
let boilOn = !RM, boilSeed = 1, boilLast = 0;
function boil(t) {
  if (!boilOn || !boilT || t - boilLast < 110) return;
  boilSeed = (boilSeed % 9) + 1; boilT.setAttribute('seed', boilSeed); boilLast = t;
}

/* ---------- brush bands (ragged green strokes) ---------- */
function brushPath(seed) {
  const r = rng(seed), W = 1200, H = 140;
  let d = `M-12 ${(16 + r() * 10).toFixed(1)}`;
  for (let x = 0; x <= W; x += 12) {
    const y = 13 + Math.sin(x / 150 + seed) * 6 + (r() - .5) * 9 + (r() < .07 ? r() * 12 : 0);
    d += `L${x} ${y.toFixed(1)}`;
  }
  d += `L${W + 16} ${H * .28}L${W + 6} ${H * .5}L${W + 20} ${H * .74}`;
  for (let x = W; x >= 0; x -= 12) {
    const y = H - 13 + Math.sin(x / 170 + seed * 2) * 6 + (r() - .5) * 9 - (r() < .07 ? r() * 12 : 0);
    d += `L${x} ${y.toFixed(1)}`;
  }
  d += `L-18 ${H * .72}L-6 ${H * .46}L-20 ${H * .24}Z`;
  let s = '';
  for (let i = 0; i < 28; i++) {
    const y = 22 + r() * (H - 44), x = r() * W, len = 60 + r() * 280;
    s += `M${x.toFixed(0)} ${y.toFixed(1)}C${(x + len * .3).toFixed(0)} ${(y + (r() - .5) * 4).toFixed(1)} ${(x + len * .7).toFixed(0)} ${(y + (r() - .5) * 4).toFixed(1)} ${(x + len).toFixed(0)} ${(y + (r() - .5) * 3).toFixed(1)}`;
  }
  return { d, s };
}
$$('svg.brush').forEach(svg => {
  const { d, s } = brushPath(+svg.dataset.seed || 1);
  svg.innerHTML = `<path d="${d}" fill="#379F62"/><path d="${s}" fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="1.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/><path d="${s}" transform="translate(46 7)" fill="none" stroke="#FFFDC7" stroke-opacity=".45" stroke-width="2.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
});
(() => {
  const r = rng(5); let d = 'M70 -20';
  for (let y = 0; y <= 1000; y += 40) d += `L${(40 + r() * 70).toFixed(0)} ${y}`;
  d += 'L60 1020L940 1020';
  for (let y = 1000; y >= 0; y -= 40) d += `L${(890 + r() * 70).toFixed(0)} ${y}`;
  $('#wipePath').setAttribute('d', d + 'Z');
})();

/* ---------- cinematic video placeholders (canvas) ---------- */
const NOISE = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 192;
  const x = c.getContext('2d'), im = x.createImageData(192, 192);
  for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255 | 0; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 34; }
  x.putImageData(im, 0, 0); return c;
})();

class Reel {
  constructor(cv) {
    this.cv = cv; this.ctx = cv.getContext('2d');
    this.scene = cv.dataset.scene || 'forest'; this.seed = +cv.dataset.seed || 1; this.tint = cv.dataset.tint || '';
    this.vis = false; this.w = 0; this.h = 0; this.last = 0; this.t = 0;
    new ResizeObserver(() => this.resize()).observe(cv);
  }
  setSeed(s) { this.seed = s; this.build(); this.draw(this.t); }
  resize() {
    const r = this.cv.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.w = r.width; this.h = r.height;
    this.cv.width = Math.round(r.width * dpr); this.cv.height = Math.round(r.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.build(); this.draw(this.t || performance.now());
  }
  build() {
    const { w, h, ctx } = this; if (!w) return;
    const r = rng(this.seed * 97 + 3);
    this.vig = ctx.createRadialGradient(w / 2, h * .55, Math.min(w, h) * .25, w / 2, h / 2, Math.max(w, h) * .78);
    this.vig.addColorStop(0, 'rgba(0,0,0,0)'); this.vig.addColorStop(1, 'rgba(0,0,0,.62)');
    this.grain = ctx.createPattern(NOISE, 'repeat');
    if (this.scene === 'forest') this.layers = [0, 1, 2].map(i => this.treeLayer(i, r));
    else {
      const n = Math.round(clamp(w * h / 20000, 14, 48));
      const pal = this.tint === 'warm' ? [[255, 186, 112], [84, 214, 104], [255, 240, 222]] : [[84, 214, 104], [236, 255, 240], [150, 232, 168], [255, 212, 150]];
      this.orbs = Array.from({ length: n }, () => ({ x: r(), y: r(), rr: .02 + r() * .08, sp: .3 + r(), a: .1 + r() * .32, ph: r() * 6.28, c: pal[(r() * pal.length) | 0] }));
    }
  }
  treeLayer(i, r) {
    const { w, h } = this, W = Math.ceil(w);
    const c = document.createElement('canvas'); c.width = W; c.height = Math.ceil(h);
    const x = c.getContext('2d');
    const conf = [
      { n: Math.round(w / 24), tw: [3, 9], col: 'rgba(72,88,80,.55)', ground: .8 },
      { n: Math.round(w / 70), tw: [10, 22], col: 'rgba(24,31,27,.93)', ground: .88 },
      { n: Math.max(3, Math.round(w / 260)), tw: [34, 78], col: '#050706', ground: 1.05 }
    ][i];
    x.fillStyle = x.strokeStyle = conf.col; x.lineCap = 'round';
    for (let k = 0; k < conf.n; k++) {
      const cx = r() * W, tw = lerp(conf.tw[0], conf.tw[1], r()), lean = (r() - .5) * tw * .8, gy = h * conf.ground + (r() - .5) * h * .04;
      const br = i > 0 ? Array.from({ length: 2 + (r() * 4 | 0) }, () => ({ y: h * (.08 + r() * .5), dir: r() < .5 ? -1 : 1, l: tw * (1.5 + r() * 3) })) : [];
      const tree = ox => {
        x.beginPath();
        x.moveTo(ox + cx - tw * .35 + lean, -10); x.lineTo(ox + cx + tw * .35 + lean, -10);
        x.lineTo(ox + cx + tw * .55, gy); x.lineTo(ox + cx - tw * .55, gy); x.closePath(); x.fill();
        x.lineWidth = Math.max(1.2, tw * .12);
        for (const b of br) {
          const bx = ox + cx + lean * (1 - b.y / gy);
          x.beginPath(); x.moveTo(bx, b.y); x.quadraticCurveTo(bx + b.dir * b.l * .5, b.y - b.l * .25, bx + b.dir * b.l, b.y - b.l * .55); x.stroke();
        }
      };
      tree(0); if (cx < tw * 4) tree(W); if (cx > W - tw * 4) tree(-W);
    }
    return { c, W, speed: [5, 12, 30][i] };
  }
  drawForest(t) {
    const { ctx, w, h } = this, s = t / 1000;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, this.tint === 'cool' ? '#28343a' : '#2c3630'); sky.addColorStop(.6, '#19201c'); sky.addColorStop(1, '#0b0e0c');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    const gx = w * (.63 + Math.sin(s * .05) * .03), gy = h * .3;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * .55);
    g.addColorStop(0, 'rgba(228,242,232,.58)'); g.addColorStop(.35, 'rgba(170,200,182,.18)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    this.layers.forEach((L, i) => {
      const off = (s * L.speed) % L.W;
      ctx.drawImage(L.c, -off, 0); ctx.drawImage(L.c, L.W - off, 0);
      if (i < 2) {
        const fy = h * (i ? .72 : .56) + Math.sin(s * .3 + i) * h * .02;
        const fg = ctx.createLinearGradient(0, fy - h * .25, 0, fy + h * .2);
        fg.addColorStop(0, 'rgba(200,216,206,0)'); fg.addColorStop(.5, `rgba(200,216,206,${i ? .13 : .22})`); fg.addColorStop(1, 'rgba(200,216,206,0)');
        ctx.fillStyle = fg; ctx.fillRect(0, fy - h * .25, w, h * .45);
      }
    });
    const gr = ctx.createLinearGradient(0, h * .8, 0, h);
    gr.addColorStop(0, 'rgba(8,10,9,0)'); gr.addColorStop(1, 'rgba(8,10,9,.9)');
    ctx.fillStyle = gr; ctx.fillRect(0, h * .8, w, h * .2);
    const lk = ctx.createRadialGradient(-w * .05, h * .2, 0, -w * .05, h * .2, w * .55), a = .16 + .08 * Math.sin(s * .7);
    lk.addColorStop(0, `rgba(84,214,104,${a})`); lk.addColorStop(1, 'rgba(84,214,104,0)');
    ctx.fillStyle = lk; ctx.fillRect(0, 0, w, h);
  }
  drawBokeh(t) {
    const { ctx, w, h } = this, s = t / 1000, M = Math.max(w, h);
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, this.tint === 'warm' ? '#211b14' : '#111913'); bg.addColorStop(1, '#060807');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const o of this.orbs) {
      const x = ((((o.x + s * .012 * o.sp) % 1.2) + 1.2) % 1.2 - .1) * w;
      const y = (o.y + Math.sin(s * .4 * o.sp + o.ph) * .04) * h, R = o.rr * M;
      const a = o.a * (.75 + .25 * Math.sin(s * 1.3 + o.ph)), [cr, cg, cb] = o.c;
      const g = ctx.createRadialGradient(x, y, R * .5, x, y, R);
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${a * .7})`); g.addColorStop(.86, `rgba(${cr},${cg},${cb},${a})`); g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, 6.2832); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  draw(t) {
    if (!this.w) return;
    this.t = t;
    if (this.scene === 'forest') this.drawForest(t); else this.drawBokeh(t);
    const { ctx, w, h } = this;
    ctx.fillStyle = this.vig; ctx.fillRect(0, 0, w, h);
    ctx.save(); const ox = Math.random() * 192 | 0, oy = Math.random() * 192 | 0;
    ctx.translate(ox, oy); ctx.fillStyle = this.grain; ctx.fillRect(-ox, -oy, w, h); ctx.restore();
    ctx.fillStyle = `rgba(255,255,255,${(Math.random() * .018).toFixed(3)})`; ctx.fillRect(0, 0, w, h);
  }
}
const reels = $$('canvas.reel').map(cv => new Reel(cv));
const reelIO = new IntersectionObserver(es => es.forEach(e => { const R = reels.find(r => r.cv === e.target); if (R) R.vis = e.isIntersecting; }), { rootMargin: '120px' });
reels.forEach(r => reelIO.observe(r.cv));

/* timecodes + fake progress on the placeholders */
const tcs = $$('[data-tc]'), progs = $$('[data-prog]'), T0 = performance.now();
let tcLast = 0;
function timecode(t) {
  if (t - tcLast < 80) return; tcLast = t;
  const el = (t - T0) / 1000;
  const str = [Math.floor(el / 3600), Math.floor(el / 60) % 60, Math.floor(el) % 60, Math.floor(el * 25) % 25].map(n => String(n).padStart(2, '0')).join(':');
  tcs.forEach(e => { if (e.offsetParent !== null) e.textContent = str; });
  progs.forEach(p => p.style.setProperty('--p', ((el % 30) / 30).toFixed(3)));
}

/* ---------- loader: polaroid develops, then opens into the hero ---------- */
const loader = $('#loader');
function finishLoad() {
  document.body.classList.remove('is-loading');
  document.body.classList.add('loaded');
  boilOn = false;
  onScroll();
}
function openPolaroid() {
  const pol = $('#ldPol'), photo = $('#ldPhoto');
  pol.style.animation = 'none';
  pol.style.transition = 'transform .45s cubic-bezier(.34,1.56,.64,1)';
  pol.style.transform = 'rotate(0deg)';
  setTimeout(() => {
    loader.classList.add('opening');
    setTimeout(() => {
      const pr = pol.getBoundingClientRect(), r = photo.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const s = Math.max(innerWidth / r.width, innerHeight / r.height) * 1.3;
      pol.style.transformOrigin = `${cx - pr.left}px ${cy - pr.top}px`;
      pol.style.transition = 'transform 1.05s cubic-bezier(.7,0,.2,1)';
      pol.style.transform = `translate(${innerWidth / 2 - cx}px,${innerHeight / 2 - cy}px) scale(${s})`;
      setTimeout(finishLoad, 520);
      setTimeout(() => loader.remove(), 1100);
    }, 560);
  }, 480);
}
if (loader) {
  document.body.classList.add('is-loading');
  if (RM) setTimeout(() => { loader.remove(); finishLoad(); }, 250);
  else {
    const cnt = $('#ldCount'), bar = $('#ldBar'), cap = $('#ldCap'), D = 2400, t0 = performance.now();
    const caps = [[0, 'rolling camera…'], [.34, 'finding the light…'], [.7, 'one more take…']];
    const tick = t => {
      const p = clamp((t - t0) / D, 0, 1), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      cnt.textContent = String(Math.round(e * 100)).padStart(3, '0');
      bar.style.setProperty('--p', e.toFixed(3));
      const c = caps.filter(c => p >= c[0]).pop()[1];
      if (cap.textContent !== c) cap.textContent = c;
      if (p < 1) requestAnimationFrame(tick);
      else { cap.textContent = 'action!'; setTimeout(openPolaroid, 380); }
    };
    requestAnimationFrame(tick);
  }
}

/* ---------- router (Home / Films / Socials) + brush wipe ---------- */
const nav = $('#nav'), wipe = $('#wipe'), pages = $$('.page'), names = pages.map(p => p.dataset.page);
const homeAnchors = ['plans', 'faq', 'process', 'brands', 'expertise'], filmAnchors = ['polaroids'];
let current = null;
function parseHash() {
  const h = (location.hash || '#home').slice(1) || 'home';
  if (names.includes(h)) return { page: h, anchor: null };
  if (homeAnchors.includes(h)) return { page: 'home', anchor: h };
  if (filmAnchors.includes(h)) return { page: 'films', anchor: h };
  if (h === 'footer') return { page: current || 'home', anchor: 'footer' };
  return { page: 'home', anchor: null };
}
function scrollToAnchor(id, smooth) {
  const el = document.getElementById(id); if (!el) return;
  const y = el.getBoundingClientRect().top + scrollY - (id === 'footer' ? 0 : 20);
  scrollTo({ top: y, behavior: smooth && !RM ? 'smooth' : 'auto' });
}
function show(name, anchor, animate) {
  const go = () => {
    pages.forEach(p => { p.hidden = p.dataset.page !== name; });
    current = name; document.body.dataset.page = name;
    $$('.nav-links a').forEach(a => a.dataset.link === name ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    closeMenu();
    requestAnimationFrame(() => {
      layout();
      if (anchor) scrollToAnchor(anchor, false); else scrollTo(0, 0);
      onScroll();
    });
  };
  if (animate && !RM) {
    wipe.classList.remove('out'); wipe.classList.add('in');
    setTimeout(() => {
      go(); wipe.classList.remove('in'); wipe.classList.add('out');
      setTimeout(() => wipe.classList.remove('out'), 620);
    }, 520);
  } else go();
}
function navigate() {
  const { page, anchor } = parseHash();
  if (page !== current) show(page, anchor, true);
  else if (anchor) { closeMenu(); scrollToAnchor(anchor, true); }
  else scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
}
addEventListener('hashchange', navigate);
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const href = a.getAttribute('href'); if (href.length < 2) return;
  e.preventDefault();
  if (location.hash === href) navigate(); else location.hash = href;
});

/* nav: dark over the hero, solid elsewhere, hides on scroll down */
const menuBtn = $('#menuBtn');
function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Menu'; }
menuBtn.addEventListener('click', () => {
  const o = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(o)); menuBtn.textContent = o ? 'Close' : 'Menu';
});
let lastY = 0;
function navState() {
  const y = scrollY, hero = $('#hero');
  const dark = false; void hero;
  nav.classList.toggle('on-dark', dark); nav.classList.toggle('solid', !dark);
  const dy = y - lastY;
  if (!nav.classList.contains('open')) {
    if (y > 320 && dy > 6) nav.classList.add('hide'); else if (dy < -6 || y < 320) nav.classList.remove('hide');
  }
  lastY = y;
}

/* ---------- reveals, doodle drawing, count-ups ---------- */
const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
$$('.rv,.mark,.draw').forEach(el => rio.observe(el));
const counters = $$('[data-count]');
if (!RM) counters.forEach(el => { el.textContent = '0'; });
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; cio.unobserve(e.target);
  const el = e.target, to = +el.dataset.count;
  if (RM) { el.textContent = to; return; }
  const t0 = performance.now();
  const f = t => { const p = clamp((t - t0) / 1300, 0, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}), { threshold: .6 });
counters.forEach(el => cio.observe(el));

/* ---------- home: hero + cascade parallax ---------- */
const heroInner = $('#heroInner'), casEls = $$('.cas[data-par]'), wide = matchMedia('(min-width: 981px)');
function parallax() {
  if (current !== 'home' || RM) return;
  const y = scrollY;
  const hf = $('#heroFilm');
  if (hf) { const r = hf.getBoundingClientRect(); hf.style.setProperty('--hp', clamp(1 - (r.top - innerHeight * .12) / (innerHeight * .75), 0, 1).toFixed(3)); }
  if (y < innerHeight * 1.3) heroInner.style.transform = `translate3d(0,${(y * .12).toFixed(1)}px,0)`;
  casEls.forEach(el => {
    if (!wide.matches) { el.style.transform = ''; return; }
    const r = el.getBoundingClientRect(), c = r.top + r.height / 2 - innerHeight / 2;
    el.style.transform = `translate3d(0,${(c * +el.dataset.par).toFixed(1)}px,0)`;
  });
}

/* ---------- home: process — dashed line draws as you scroll ---------- */
const steps = $('#steps');
let P = null;
function buildProcess() {
  if (!steps || !steps.offsetParent) return;
  const svg = $('.steps-path', steps), b = steps.getBoundingClientRect(), W = b.width, H = b.height;
  svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const pols = $$('.step-pol', steps);
  const pts = pols.map(el => {
    const r = el.getBoundingClientRect();
    const at = s => { const [fx, fy] = s.split(',').map(Number); return [r.left - b.left + r.width * fx, r.top - b.top + r.height * fy]; };
    return { in: at(el.dataset.in), out: at(el.dataset.out), dir: el.dataset.dir || 'r' };
  });
  const f = p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  let d = `M${f(pts[0].out)}`;
  const upto = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1].out, z = pts[i].in, dx = z[0] - a[0], dy = z[1] - a[1];
    const k = clamp(Math.abs(dx) * .8 + 60, 40, W * .2) * (pts[i - 1].dir === 'l' ? -1 : 1);
    const c1 = [a[0] + k, a[1] + dy * .08], c2 = [z[0], z[1] - Math.max(60, dy * .6)];
    d += ` C${f(c1)} ${f(c2)} ${f(z)}`;
    upto.push(d);
    if (i < pts.length - 1) d += ` L${f(pts[i].out)}`;
  }
  const pd = $('.pd', svg), pm = $('.pm', svg), ghost = $('.ghost', svg);
  [pd, pm, ghost].forEach(p => p.setAttribute('d', d));
  const total = pd.getTotalLength();
  const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path'); svg.appendChild(tmp);
  const marks = [0, ...upto.map(u => { tmp.setAttribute('d', u); return tmp.getTotalLength(); })];
  tmp.remove();
  pm.style.strokeDasharray = total;
  const d0 = $('.d0', svg); d0.setAttribute('cx', pts[0].out[0]); d0.setAttribute('cy', pts[0].out[1]);
  P = { pd, pm, head: $('.phead', svg), total, marks, stepEls: $$('.step', steps) };
}
function updProcess() {
  if (!P || current !== 'home') return;
  const b = steps.getBoundingClientRect();
  const p = RM ? 1 : clamp((innerHeight * .62 - b.top) / (b.height * .9), 0, 1);
  const L = P.total * p;
  P.pm.style.strokeDashoffset = (P.total - L).toFixed(1);
  const pt = P.pd.getPointAtLength(Math.max(.01, L));
  P.head.setAttribute('transform', `translate(${pt.x.toFixed(1)},${pt.y.toFixed(1)})`);
  P.head.style.opacity = p > 0 ? 1 : 0;
  P.stepEls.forEach((s, i) => s.classList.toggle('on', p > 0 && L >= P.marks[i] - 6));
}
if (steps) new ResizeObserver(() => { buildProcess(); updProcess(); }).observe(steps);

/* ---------- plans form (draft: nothing is sent) ---------- */
const form = $('#planForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#pf-name').value.trim(), contact = $('#pf-contact').value.trim(), st = $('#planStatus');
  const need = (form.querySelector('input[name="need"]:checked') || {}).value || 'project';
  if (!name) { st.textContent = 'Add your name so we know who to call.'; $('#pf-name').focus(); return; }
  if (!contact) { st.textContent = 'Add an email or phone number so we can reach you.'; $('#pf-contact').focus(); return; }
  st.textContent = `Got it, ${name.split(' ')[0]}! We'll call you within a day about your ${need === 'Not sure yet' ? 'project' : need.toLowerCase()}. (Draft form — nothing is sent yet.)`;
  form.reset();
});

/* ---------- films: the project box opens ---------- */
const stage = $('#pbStage');
const cats = {
  ad: [['Monsoon Letters', 'v1'], ['Chai at 5', 'v3'], ['Night Drive', 'v5']],
  motion: [['Orbit/Pay explainer', 'v4'], ['Kiro type loop', 'v2'], ['Lumen UI film', 'v6']],
  ai: [['Tidal AI spot', 'v5'], ['Dream kitchen', 'v3'], ['100 faces', 'v1']],
  vfx: [['Rain on cue', 'v2'], ['City fold', 'v6'], ['Glass sky', 'v4']],
  '3d': [['Haathi toy spin', 'v3'], ['Bottle hero', 'v1'], ['Sneaker drop', 'v5']]
};
const catLabel = { ad: 'ad films', motion: 'motion graphics', ai: 'AI ads', vfx: 'VFX', '3d': '3D' };
new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) stage.classList.add('open'); }), { threshold: .45 }).observe(stage);
const chips = $$('#catChips button');
chips.forEach(b => b.addEventListener('click', () => {
  if (b.getAttribute('aria-pressed') === 'true') return;
  chips.forEach(c => c.setAttribute('aria-pressed', String(c === b)));
  stage.classList.remove('open');
  setTimeout(() => {
    const set = cats[b.dataset.cat];
    $$('.pb-card', stage).forEach((c, i) => { $('.cap', c).textContent = set[i][0]; $('.ph', c).className = 'ph ' + set[i][1]; });
    $('#pbLabel').textContent = catLabel[b.dataset.cat];
    stage.classList.add('open');
  }, RM ? 0 : 560);
}));

/* ---------- films: polaroid board (drag + open) ---------- */
const board = $('#board'), lb = $('#lightbox');
let zTop = 10, lastFocus = null;
function openLB(el) {
  const [h, body] = (el.dataset.note || '|').split('|');
  $('#lbHead').textContent = h; $('#lbBody').textContent = body;
  lb.hidden = false; lastFocus = el;
  requestAnimationFrame(() => lb.classList.add('show'));
  lb.tabIndex = -1; lb.focus();
}
function closeLB() {
  lb.classList.remove('show');
  setTimeout(() => { lb.hidden = true; if (lastFocus) lastFocus.focus(); }, 340);
}
lb.addEventListener('click', closeLB);
addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLB(); });
$$('.bp', board).forEach(el => {
  let sx = 0, sy = 0, ox = 0, oy = 0, moved = false, id = null;
  el.tabIndex = 0; el.setAttribute('role', 'button'); el.setAttribute('aria-label', 'Open ' + ($('.cap', el).textContent || 'polaroid'));
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    id = e.pointerId; el.setPointerCapture(id); moved = false;
    sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop;
  });
  el.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.hypot(dx, dy) < 6) return;
    if (!moved) { moved = true; el.classList.add('drag'); el.style.zIndex = ++zTop; }
    el.style.left = clamp(ox + dx, -24, board.clientWidth - el.offsetWidth + 24) + 'px';
    el.style.top = clamp(oy + dy, -24, board.clientHeight - el.offsetHeight + 24) + 'px';
  });
  el.addEventListener('pointerup', e => {
    if (e.pointerId !== id) return; id = null; el.classList.remove('drag');
    if (!moved) openLB(el); else el.style.setProperty('--r', ((Math.random() - .5) * 14).toFixed(1) + 'deg');
  });
  el.addEventListener('pointercancel', () => { id = null; el.classList.remove('drag'); });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(el); } });
});

/* ---------- socials: Shoot / Edit / Deliver / Repeat ---------- */
const sed = $('#sed'), sws = $$('.sw', sed), sedBars = $$('.sed-prog i', sed);
function updSED() {
  if (current !== 'socials') return;
  const r = sed.getBoundingClientRect();
  const p = clamp(-r.top / (r.height - innerHeight), 0, .9999), idx = Math.floor(p * sws.length);
  sws.forEach((w, i) => { w.classList.toggle('on', i === idx); w.classList.toggle('done', i < idx); });
  sedBars.forEach((b, i) => b.classList.toggle('on', i <= idx));
}

/* ---------- socials: offer tree grows ---------- */
const tree = $('#tree'), tns = $$('.tn', tree);
function updTree() {
  if (current !== 'socials') return;
  const r = tree.getBoundingClientRect();
  const p = RM ? 1 : clamp((innerHeight * .72 - r.top) / r.height, 0, 1);
  tree.style.setProperty('--tl', (1 - p).toFixed(3));
  tns.forEach(n => n.classList.toggle('grow', p >= +n.dataset.t));
}

/* ---------- socials: reel list ---------- */
const vlBtns = $$('#vl .vl-list button'), vlReel = reels.find(r => r.cv.id === 'vlReel');
let vlIdx = 0, vlT0 = performance.now();
const VL_DUR = 6500;
function vlSelect(i) {
  vlIdx = i; vlT0 = performance.now();
  vlBtns.forEach((b, j) => { b.setAttribute('aria-pressed', String(j === i)); $('.bar i', b).style.transform = 'scaleX(0)'; });
  $('#vlTitle').textContent = vlBtns[i].dataset.title;
  if (vlReel) vlReel.setSeed(+vlBtns[i].dataset.seed);
}
vlBtns.forEach((b, i) => b.addEventListener('click', () => vlSelect(i)));
function vlTick(t) {
  if (current !== 'socials' || RM || !vlReel || !vlReel.vis) { vlT0 = t; return; }
  const p = (t - vlT0) / VL_DUR;
  if (p >= 1) vlSelect((vlIdx + 1) % vlBtns.length);
  else $('.bar i', vlBtns[vlIdx]).style.transform = `scaleX(${p.toFixed(3)})`;
}

/* ---------- custom cursor (fine pointers only) ---------- */
let cursorTick = () => {};
if (matchMedia('(pointer: fine)').matches && !RM) {
  const c = $('#cursor'), lab = $('span', c);
  let x = -100, y = -100, tx = x, ty = y;
  addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY; c.classList.add('show');
    const t = e.target.closest && e.target.closest('[data-cursor]');
    if (t) { c.classList.add('lab'); lab.textContent = t.dataset.cursor; } else c.classList.remove('lab');
  }, { passive: true });
  document.addEventListener('pointerleave', () => c.classList.remove('show'));
  cursorTick = () => { x += (tx - x) * .22; y += (ty - y) * .22; c.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; };
}

/* ---------- hero stickers: drag them around ---------- */
$$('.sticker').forEach(el => {
  let sx = 0, sy = 0, bx = 0, by = 0, id = null;
  el.addEventListener('pointerdown', e => { id = e.pointerId; el.setPointerCapture(id); sx = e.clientX; sy = e.clientY; bx = +el.dataset.x || 0; by = +el.dataset.y || 0; el.classList.add('drag'); });
  el.addEventListener('pointermove', e => { if (e.pointerId !== id) return; const x = bx + e.clientX - sx, y = by + e.clientY - sy; el.dataset.x = x; el.dataset.y = y; el.style.translate = `${x}px ${y}px`; });
  const end = () => { id = null; el.classList.remove('drag'); };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
});

/* ---------- main loops ---------- */
function layout() { buildProcess(); }
let ticking = false;
function onScroll() {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => { ticking = false; navState(); parallax(); updProcess(); updSED(); updTree(); });
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { layout(); onScroll(); });
if (document.fonts) document.fonts.ready.then(() => { layout(); onScroll(); });

function loop(t) {
  boil(t);
  for (const R of reels) if (R.vis && !RM && t - R.last >= 40) { R.last = t; R.draw(t); }
  timecode(t); vlTick(t); cursorTick();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

const start = parseHash();
show(start.page, start.anchor, false);
})();
