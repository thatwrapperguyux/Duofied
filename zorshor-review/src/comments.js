/* zorshor — client review comments.
   Live link (claude.ai): hands off to the shared comment threads, so the team
   sees every comment on the same link.
   Offline file: numbered pins + a side panel, saved in this browser, shared as
   a link (#review=…), copied as text, or exported/imported as a .json file. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const KEY = 'zs-review-' + (document.documentElement.dataset.theme || 'site');
const NAME_KEY = 'zs-review-name';
const store = {
  get() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return mem; } },
  set(v) { mem = v; try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
};
let mem = [];
let items = store.get();
let mode = false, shell = null, draftAt = null;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- styles ---------- */
const css = document.createElement('style');
css.textContent = `
#zc-dock{position:fixed;right:18px;bottom:18px;z-index:200;display:flex;align-items:center;gap:6px;padding:6px;border-radius:999px;background:#111613;color:#fff;box-shadow:0 18px 40px -16px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.06);font:500 13px/1 "Inter Tight","Instrument Sans",system-ui,sans-serif}
#zc-dock button{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px;border-radius:999px;color:#fff;background:transparent;font:inherit;cursor:pointer;transition:background-color .2s}
#zc-dock button:hover{background:rgba(255,255,255,.1)}
#zc-dock button[aria-pressed="true"]{background:#379F62}
#zc-dock svg{width:16px;height:16px}
#zc-dock .n{min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:rgba(255,255,255,.14);display:grid;place-items:center;font-size:11px}
#zc-hint{position:fixed;left:50%;top:84px;transform:translateX(-50%);z-index:200;padding:10px 16px;border-radius:999px;background:#111613;color:#fff;font:500 13px/1 "Inter Tight",system-ui,sans-serif;box-shadow:0 12px 30px -12px rgba(0,0,0,.4);pointer-events:none;opacity:0;transition:opacity .2s}
html.zc-on #zc-hint{opacity:1}
html.zc-on body,html.zc-on body *{cursor:crosshair!important}
html.zc-on #zc-dock,html.zc-on #zc-dock *,html.zc-on #zc-panel,html.zc-on #zc-panel *,html.zc-on .zc-pop,html.zc-on .zc-pop *{cursor:auto!important}
.zc-hover{outline:2px dashed #379F62!important;outline-offset:4px!important}
#zc-layer{position:absolute;left:0;top:0;width:100%;height:0;z-index:150;pointer-events:none}
.zc-pin{position:absolute;width:28px;height:28px;margin:-28px 0 0 -2px;border-radius:14px 14px 14px 2px;background:#379F62;color:#fff;display:grid;place-items:center;font:600 12px/1 "Inter Tight",system-ui,sans-serif;box-shadow:0 0 0 2px #fff,0 8px 18px -6px rgba(0,0,0,.45);pointer-events:auto;cursor:pointer;transition:transform .2s}
.zc-pin:hover,.zc-pin.hl{transform:scale(1.15)}
.zc-pin.done{background:#9AA29D}
.zc-pop{position:absolute;z-index:210;width:300px;padding:14px;border-radius:14px;background:#fff;color:#16211E;box-shadow:0 24px 60px -20px rgba(0,0,0,.45),0 0 0 1px rgba(0,0,0,.06);font:400 14px/1.45 "Inter Tight",system-ui,sans-serif}
.zc-pop textarea,.zc-pop input,#zc-import textarea{width:100%;border:1px solid #E3DED5;border-radius:10px;padding:10px 12px;font:inherit;color:inherit;background:#FBFAF7;resize:vertical}
.zc-pop textarea{min-height:84px}
.zc-pop input{margin-top:8px;height:38px}
.zc-pop textarea:focus,.zc-pop input:focus,#zc-import textarea:focus{outline:2px solid #379F62;outline-offset:0;border-color:transparent}
.zc-row{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}
.zc-btn{height:34px;padding:0 14px;border-radius:999px;border:0;font:500 13px/1 "Inter Tight",system-ui,sans-serif;cursor:pointer;background:#16211E;color:#fff}
.zc-btn.ghost{background:transparent;color:#16211E;box-shadow:inset 0 0 0 1px #D9D3C8}
.zc-btn.g{background:#379F62}
#zc-panel{position:fixed;top:0;right:0;bottom:0;z-index:205;width:min(380px,92vw);background:#fff;color:#16211E;box-shadow:-30px 0 60px -30px rgba(0,0,0,.35),-1px 0 0 #ECE7DE;display:flex;flex-direction:column;transform:translateX(105%);transition:transform .4s cubic-bezier(.16,1,.3,1);font:400 14px/1.5 "Inter Tight",system-ui,sans-serif}
#zc-panel.open{transform:none}
.zc-head{display:flex;justify-content:space-between;align-items:center;padding:18px 18px 14px;border-bottom:1px solid #ECE7DE}
.zc-head b{font:600 16px/1 "Inter Tight",system-ui,sans-serif}
.zc-head small{display:block;margin-top:6px;color:#68716D;font-size:12.5px}
.zc-x{width:34px;height:34px;border-radius:50%;border:0;background:#F4F1EB;cursor:pointer;font-size:18px;line-height:1}
.zc-list{flex:1;overflow:auto;padding:8px 10px}
.zc-empty{padding:28px 12px;color:#68716D;text-align:center}
.zc-item{display:grid;grid-template-columns:28px 1fr;gap:10px;padding:12px 8px;border-radius:12px;cursor:pointer}
.zc-item:hover{background:#F7F5F0}
.zc-item .zc-num{width:24px;height:24px;border-radius:12px 12px 12px 2px;background:#379F62;color:#fff;display:grid;place-items:center;font:600 11px/1 "Inter Tight",system-ui,sans-serif}
.zc-item.done .zc-num{background:#9AA29D}
.zc-item.done p{text-decoration:line-through;color:#9AA29D}
.zc-meta{font-size:12px;color:#68716D}
.zc-item p{margin:4px 0 6px;white-space:pre-wrap;word-break:break-word}
.zc-acts{display:flex;gap:12px;font-size:12.5px}
.zc-acts button{border:0;background:none;padding:0;color:#22874F;cursor:pointer;font:inherit}
.zc-acts button.del{color:#B5483F}
.zc-foot{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 14px 18px;border-top:1px solid #ECE7DE}
.zc-foot .zc-btn{width:100%;height:40px}
.zc-foot .wide{grid-column:1/-1}
.zc-toast{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:220;padding:10px 16px;border-radius:999px;background:#16211E;color:#fff;font:500 13px/1.3 "Inter Tight",system-ui,sans-serif;box-shadow:0 12px 30px -12px rgba(0,0,0,.4);max-width:90vw;text-align:center}
#zc-import{position:fixed;inset:0;z-index:230;display:grid;place-items:center;background:rgba(10,16,14,.45);padding:20px}
#zc-import>div{width:min(460px,100%);background:#fff;border-radius:16px;padding:18px;font:400 14px/1.5 "Inter Tight",system-ui,sans-serif;color:#16211E}
#zc-import textarea{min-height:120px;margin-top:10px}
@media (max-width:640px){#zc-dock{right:10px;bottom:10px}#zc-dock .lbl{display:none}}
`;
document.head.appendChild(css);

/* ---------- dock, hint, layer, panel ---------- */
const I = {
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 5.5h16v11H9l-5 4z"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>'
};
const dock = document.createElement('div');
dock.id = 'zc-dock'; dock.setAttribute('role', 'toolbar'); dock.setAttribute('aria-label', 'Review tools');
dock.innerHTML = `<button type="button" id="zc-mode" aria-pressed="false">${I.chat}<span class="lbl">Comment</span></button><button type="button" id="zc-open" aria-label="All comments">${I.list}<span class="n" id="zc-count">0</span></button><button type="button" id="zc-share">${I.share}<span class="lbl">Share</span></button>`;
document.body.appendChild(dock);
const hint = document.createElement('div');
hint.id = 'zc-hint'; hint.textContent = 'Click anything to leave a comment · Esc to stop';
document.body.appendChild(hint);
const layer = document.createElement('div');
layer.id = 'zc-layer'; layer.setAttribute('aria-hidden', 'true');
document.body.appendChild(layer);
const panel = document.createElement('aside');
panel.id = 'zc-panel'; panel.setAttribute('aria-label', 'Review comments');
panel.innerHTML = `<div class="zc-head"><div><b>Review comments</b><small id="zc-sub">Saved in this browser</small></div><button class="zc-x" type="button" aria-label="Close">×</button></div><div class="zc-list" id="zc-list"></div><div class="zc-foot"><button class="zc-btn g wide" type="button" id="zc-link">Copy share link</button><button class="zc-btn ghost" type="button" id="zc-copy">Copy as text</button><button class="zc-btn ghost" type="button" id="zc-export">Export file</button><button class="zc-btn ghost wide" type="button" id="zc-imp">Import comments</button></div>`;
document.body.appendChild(panel);

function toast(msg) {
  const t = document.createElement('div'); t.className = 'zc-toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
}

/* ---------- where a comment lives ---------- */
function currentPage() { const p = $$('.page').find(p => !p.hidden); return p ? p.dataset.page : 'home'; }
function blocks(page) {
  const p = $(`.page[data-page="${page}"]`);
  const list = p ? $$(':scope > section, :scope > .band', p) : [];
  return list.concat([$('#footer')]);
}
function labelFor(el) {
  if (!el) return '';
  if (el.id === 'footer') return 'Footer';
  const h = el.querySelector('h1,h2,.eyebrow');
  const t = h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
  return t.length > 42 ? t.slice(0, 40) + '…' : t || 'Section';
}
function anchorAt(x, y, target) {
  const page = currentPage();
  const bl = blocks(page);
  let idx = bl.findIndex(b => b && b.contains(target));
  if (idx < 0) idx = bl.findIndex(b => { const r = b.getBoundingClientRect(); return y >= r.top && y <= r.bottom; });
  if (idx < 0) idx = 0;
  const r = bl[idx].getBoundingClientRect();
  return { page: bl[idx].id === 'footer' ? '*' : page, sec: idx === bl.length - 1 ? 'footer' : idx, rx: (x - r.left) / r.width, ry: (y - r.top) / r.height, where: labelFor(bl[idx]) };
}
function pointFor(it) {
  const page = it.page === '*' ? currentPage() : it.page;
  if (page !== currentPage()) return null;
  const bl = blocks(page);
  const el = it.sec === 'footer' ? $('#footer') : bl[it.sec];
  if (!el || el.offsetParent === null && el.id !== 'footer') return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + scrollX + it.rx * r.width, y: r.top + scrollY + it.ry * r.height };
}

/* ---------- render ---------- */
function save() { store.set(items); render(); }
function render() {
  $('#zc-count').textContent = items.filter(i => !i.done).length;
  layer.style.height = document.documentElement.scrollHeight + 'px';
  layer.innerHTML = '';
  items.forEach((it, i) => {
    const pt = pointFor(it); if (!pt) return;
    const pin = document.createElement('button');
    pin.type = 'button'; pin.className = 'zc-pin' + (it.done ? ' done' : ''); pin.textContent = i + 1;
    pin.style.left = pt.x + 'px'; pin.style.top = pt.y + 'px';
    pin.title = it.text; pin.setAttribute('aria-label', `Comment ${i + 1}: ${it.text}`);
    pin.addEventListener('click', e => { e.stopPropagation(); openPanel(); focusItem(it.id); });
    layer.appendChild(pin);
  });
  const list = $('#zc-list');
  if (!items.length) { list.innerHTML = '<p class="zc-empty">No comments yet. Press <b>Comment</b>, then click any part of the page.</p>'; return; }
  const pageName = { home: 'Home', films: 'Films', socials: 'Socials', '*': 'All pages' };
  list.innerHTML = items.map((it, i) => `<div class="zc-item${it.done ? ' done' : ''}" data-id="${it.id}"><span class="zc-num">${i + 1}</span><div><span class="zc-meta">${esc(pageName[it.page] || it.page)} · ${esc(it.where || '')}</span><p>${esc(it.text)}</p><span class="zc-meta">${esc(it.name || 'Guest')} · ${new Date(it.ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span><div class="zc-acts"><button type="button" data-a="go">Show on page</button><button type="button" data-a="done">${it.done ? 'Reopen' : 'Resolve'}</button><button type="button" class="del" data-a="del">Delete</button></div></div></div>`).join('');
}
function focusItem(id) { const el = $(`.zc-item[data-id="${id}"]`); if (el) { el.scrollIntoView({ block: 'nearest' }); el.style.background = '#EEF7F1'; setTimeout(() => el.style.background = '', 1200); } }
function goTo(it) {
  const page = it.page === '*' ? currentPage() : it.page;
  const after = () => setTimeout(() => { render(); const pt = pointFor(it); if (pt) scrollTo({ top: Math.max(0, pt.y - innerHeight / 2), behavior: 'smooth' }); const pin = [...layer.children].find(p => p.textContent === String(items.indexOf(it) + 1)); if (pin) { pin.classList.add('hl'); setTimeout(() => pin.classList.remove('hl'), 1600); } }, 60);
  if (page !== currentPage()) { location.hash = '#' + page; setTimeout(after, 1900); } else after();
}
$('#zc-list').addEventListener('click', e => {
  const row = e.target.closest('.zc-item'); if (!row) return;
  const it = items.find(i => i.id === row.dataset.id); if (!it) return;
  const a = e.target.dataset.a;
  if (a === 'del') { if (row.dataset.confirm) { items = items.filter(i => i !== it); save(); } else { row.dataset.confirm = '1'; e.target.textContent = 'Tap again to delete'; } return; }
  if (a === 'done') { it.done = !it.done; save(); return; }
  goTo(it);
});

/* ---------- comment mode ---------- */
let hoverEl = null;
const ui = el => el.closest('#zc-dock,#zc-panel,.zc-pop,#zc-import,.zc-pin');
function setMode(on) {
  mode = on; document.documentElement.classList.toggle('zc-on', on);
  $('#zc-mode').setAttribute('aria-pressed', String(on));
  if (!on && hoverEl) { hoverEl.classList.remove('zc-hover'); hoverEl = null; }
}
function pickTarget(el) { return el.closest('h1,h2,h3,p,li,figure,.btn,.card,.pol,.player,.idea-frame,.stat,.bx,.oc,.band,.sw,.ol-item,.hero-media,.ph,section,footer') || el; }
document.addEventListener('mousemove', e => {
  if (!mode || ui(e.target)) return;
  const t = pickTarget(e.target);
  if (t !== hoverEl) { if (hoverEl) hoverEl.classList.remove('zc-hover'); hoverEl = t; t.classList.add('zc-hover'); }
}, true);
document.addEventListener('click', async e => {
  if (!mode || ui(e.target)) return;
  e.preventDefault(); e.stopPropagation();
  const target = pickTarget(e.target);
  if (shell) {
    setMode(false);
    try { const r = await shell.openComposer({ element: target }); if (!r.opened) toast('Close the open comment first, then try again.'); }
    catch (err) { shell = null; toast('Shared comments are off here — saving in this browser instead.'); compose(e.clientX, e.clientY, target); }
    return;
  }
  compose(e.clientX, e.clientY, target);
}, true);
['mousedown', 'pointerdown', 'pointerup', 'touchstart'].forEach(ev => document.addEventListener(ev, e => { if (mode && !ui(e.target)) { e.stopPropagation(); } }, true));
addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('.zc-pop')) closePop(); else if (mode) setMode(false); else if (panel.classList.contains('open')) panel.classList.remove('open'); }
});

function closePop() { const p = $('.zc-pop'); if (p) p.remove(); draftAt = null; }
function compose(cx, cy, target) {
  closePop(); setMode(false);
  draftAt = anchorAt(cx, cy, target);
  const pop = document.createElement('div'); pop.className = 'zc-pop';
  const name = (() => { try { return localStorage.getItem(NAME_KEY) || ''; } catch (e) { return ''; } })();
  pop.innerHTML = `<label class="zc-meta" for="zc-text">Comment on: ${esc(draftAt.where)}</label><textarea id="zc-text" maxlength="2000" placeholder="What should change here?"></textarea><input id="zc-name" maxlength="60" placeholder="Your name" value="${esc(name)}" autocomplete="name"><div class="zc-row"><button class="zc-btn ghost" type="button" data-a="x">Cancel</button><button class="zc-btn g" type="button" data-a="ok">Post comment</button></div>`;
  const x = Math.min(cx + scrollX + 12, scrollX + innerWidth - 316), y = Math.min(cy + scrollY + 12, scrollY + innerHeight - 260);
  pop.style.left = Math.max(scrollX + 8, x) + 'px'; pop.style.top = y + 'px';
  document.body.appendChild(pop);
  const ta = $('#zc-text', pop); ta.focus();
  const post = () => {
    const text = ta.value.trim(); if (!text) { ta.focus(); return; }
    const nm = $('#zc-name', pop).value.trim();
    try { localStorage.setItem(NAME_KEY, nm); } catch (e) {}
    items.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...draftAt, text, name: nm || 'Guest', ts: Date.now(), done: false });
    save(); closePop(); toast('Comment saved. Use Share to send your comments.');
  };
  pop.addEventListener('click', e => { const a = e.target.dataset.a; if (a === 'x') closePop(); if (a === 'ok') post(); });
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) post(); });
}

/* ---------- sharing ---------- */
const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
function pack() { return JSON.stringify({ v: 1, theme: document.documentElement.dataset.theme, items: items.map(({ id, page, sec, rx, ry, where, text, name, ts, done }) => ({ id, page, sec, rx: +rx.toFixed(4), ry: +ry.toFixed(4), where, text, name, ts, done })) }); }
function asText() {
  const pageName = { home: 'Home', films: 'Films', socials: 'Socials', '*': 'All pages' };
  return `zorshor website — review comments (${document.documentElement.dataset.theme})\n\n` + items.map((it, i) => `${i + 1}. [${pageName[it.page] || it.page} · ${it.where}] ${it.text}\n   — ${it.name}, ${new Date(it.ts).toLocaleString()}${it.done ? ' (resolved)' : ''}`).join('\n\n');
}
async function copy(text, ok) {
  try { await navigator.clipboard.writeText(text); toast(ok); }
  catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast(ok); } catch (_) { toast('Copy failed — select and copy manually.'); } ta.remove(); }
}
function merge(list) {
  let added = 0;
  (list || []).forEach(n => { if (n && n.text && !items.some(i => i.id === n.id)) { items.push(n); added++; } });
  save(); return added;
}
function shareLink() {
  if (!items.length) { toast('Add a comment first.'); return; }
  const base = location.href.split('#')[0];
  copy(base + '#review=' + b64e(pack()), 'Share link copied — anyone who opens it sees these comments.');
}
$('#zc-link').addEventListener('click', shareLink);
$('#zc-share').addEventListener('click', () => { if (shell) { toast('Comments here are shared live — send this page’s link.'); return; } openPanel(); shareLink(); });
$('#zc-copy').addEventListener('click', () => items.length ? copy(asText(), 'Comments copied as text.') : toast('Add a comment first.'));
$('#zc-export').addEventListener('click', () => {
  if (!items.length) { toast('Add a comment first.'); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([pack()], { type: 'application/json' }));
  a.download = `zorshor-review-${document.documentElement.dataset.theme}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
});
$('#zc-imp').addEventListener('click', () => {
  const m = document.createElement('div'); m.id = 'zc-import';
  m.innerHTML = `<div role="dialog" aria-label="Import comments"><b>Import comments</b><p class="zc-meta">Paste a share link or the contents of an exported file — or choose the file.</p><textarea id="zc-imp-t" placeholder="https://…#review=…"></textarea><div class="zc-row" style="justify-content:space-between"><label class="zc-btn ghost" style="display:inline-flex;align-items:center">Choose file<input type="file" accept=".json,application/json" hidden id="zc-imp-f"></label><span><button class="zc-btn ghost" type="button" data-a="x">Cancel</button> <button class="zc-btn g" type="button" data-a="ok">Import</button></span></div></div>`;
  document.body.appendChild(m);
  const done = raw => {
    try {
      raw = raw.trim(); const h = raw.indexOf('#review=');
      const data = JSON.parse(h >= 0 ? b64d(raw.slice(h + 8)) : raw);
      const n = merge(data.items); m.remove(); openPanel(); toast(n ? `Imported ${n} comment${n > 1 ? 's' : ''}.` : 'Nothing new to import.');
    } catch (e) { toast('That doesn’t look like a review link or file.'); }
  };
  m.addEventListener('click', e => { if (e.target === m || e.target.dataset.a === 'x') m.remove(); if (e.target.dataset.a === 'ok') done($('#zc-imp-t', m).value); });
  $('#zc-imp-f', m).addEventListener('change', e => { const f = e.target.files[0]; if (f) f.text().then(done); });
});

/* ---------- panel + mode buttons ---------- */
function openPanel() { panel.classList.add('open'); render(); }
$('.zc-x', panel).addEventListener('click', () => panel.classList.remove('open'));
$('#zc-open').addEventListener('click', () => panel.classList.contains('open') ? panel.classList.remove('open') : openPanel());
$('#zc-mode').addEventListener('click', () => { closePop(); setMode(!mode); });

/* ---------- incoming share link ---------- */
(function readHash() {
  const h = location.hash;
  if (!h.startsWith('#review=')) return;
  try { const data = JSON.parse(b64d(h.slice(8))); const n = merge(data.items); history.replaceState(null, '', location.href.split('#')[0] + '#home'); setTimeout(() => { openPanel(); toast(`${n || 'No new'} comment${n === 1 ? '' : 's'} loaded from the link.`); }, 3800); }
  catch (e) {}
})();

/* ---------- live link: use the shared comment threads ---------- */
if (window.claude && typeof window.claude.use === 'function') {
  window.claude.use('comments').then(c => {
    if (!c) return;
    shell = c;
    $('#zc-sub').textContent = 'Shared comments live in the comments panel';
    $('#zc-open').hidden = true;
    $('#zc-share .lbl').textContent = 'Share';
    hint.textContent = 'Click the part you want to comment on · Esc to stop';
  }).catch(() => {});
}

/* keep pins in place */
const reRender = () => requestAnimationFrame(render);
addEventListener('resize', reRender);
new MutationObserver(reRender).observe($('#main'), { attributes: true, subtree: true, attributeFilter: ['hidden'] });
if (document.fonts) document.fonts.ready.then(reRender);
setTimeout(reRender, 4000);
render();
})();
