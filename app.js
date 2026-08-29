/* ============================================================
   app.js — thecontainermarket.ng
   All interactive behaviour. Vanilla JS, no frameworks.
   ============================================================ */

'use strict';

/* ── UPDATE THIS BEFORE GOING LIVE ───────────────────────── */
const CONFIG = {
whatsappNumber: '2349052352101',// ← your number, no + or spaces
  siteName: 'thecontainermarket.ng',
};

/* ── HELPERS ─────────────────────────────────────────────── */
function waLink(message) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
function $(id) { return document.getElementById(id); }

function toast(msg, type = 'info') {
  const old = document.querySelector('.tcm-toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'tcm-toast';
  el.setAttribute('role', 'status');
  el.textContent = msg;
  const bg = { info: '#2A4033', success: '#2A6B3A', error: '#B03A1A' }[type] || '#2A4033';
  Object.assign(el.style, {
    position: 'fixed', bottom: '5.5rem', left: '50%',
    transform: 'translateX(-50%) translateY(10px)',
    background: bg, color: '#F5EFE0',
    padding: '10px 20px', borderRadius: '20px',
    fontSize: '13px', fontFamily: 'DM Mono, monospace',
    zIndex: '10000', opacity: '0', transition: 'opacity .25s, transform .25s',
    whiteSpace: 'nowrap', maxWidth: '90vw', textAlign: 'center',
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3200);
}

/* ── WISHLIST ─────────────────────────────────────────────── */
const Wishlist = {
  key: 'tcm_wishlist',
  get() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  save(l) { try { localStorage.setItem(this.key, JSON.stringify(l)); } catch {} },
  toggle(name) {
    let l = this.get(); const i = l.indexOf(name);
    if (i === -1) { l.push(name); this.save(l); return true; }
    l.splice(i, 1); this.save(l); return false;
  },
  has(name) { return this.get().includes(name); },
  count() { return this.get().length; },
};

function syncWishlistUI() {
  document.querySelectorAll('.card-wishlist').forEach(btn => {
    const name = btn.closest('.product-card').querySelector('.card-name').textContent.trim();
    btn.textContent = Wishlist.has(name) ? '❤️' : '🤍';
    btn.setAttribute('aria-pressed', Wishlist.has(name) ? 'true' : 'false');
  });
  const tb = $('btn-wishlist');
  if (tb) {
    const n = Wishlist.count();
    tb.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ${n > 0 ? `Saved (${n})` : 'Saved'}`;
  }
}

/* ── FILTER CHIPS ─────────────────────────────────────────── */
function initFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('#list-root .product-card');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      const f = chip.dataset.filter;
      cards.forEach(card => { card.style.display = (f === 'all' || card.dataset.category === f) ? '' : 'none'; });
    });
  });
}

/* ── SEARCH ───────────────────────────────────────────────── */
function initSearch() {
  const input = $('input-search');
  const btn = document.querySelector('.hero-search button');
  const cards = document.querySelectorAll('#list-root .product-card');
  function run() {
    const q = input.value.trim().toLowerCase();
    if (!q) { cards.forEach(c => c.style.display = ''); return; }
    let found = 0;
    cards.forEach(card => { const show = card.textContent.toLowerCase().includes(q); card.style.display = show ? '' : 'none'; if (show) found++; });
    if (!found) toast(`No results for "${input.value}". Try "chair" or "ceramic".`);
    else $('main').scrollIntoView({ behavior: 'smooth' });
  }
  if (btn) btn.addEventListener('click', run);
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
}

/* ── WA ENQUIRE ───────────────────────────────────────────── */
function initEnquire() {
  document.querySelectorAll('.btn-enquire').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const name = card.querySelector('.card-name').textContent.trim();
      const price = card.querySelector('.card-price').textContent.trim();
      window.open(waLink(`Hi! I'm interested in the *${name}* (${price}) on ${CONFIG.siteName}. Is it still available?`), '_blank', 'noopener');
    });
  });
}

/* ── MAKE AN OFFER ────────────────────────────────────────── */
function initOffer() {
  const strip = $('offer-strip');
  const itemIn = $('input-offer-item');
  document.querySelectorAll('.btn-offer').forEach(btn => {
    btn.addEventListener('click', () => {
      itemIn.value = btn.dataset.product;
      strip.classList.add('open');
      strip.scrollIntoView({ behavior: 'smooth', block: 'start' });
      $('input-offer-amount').focus();
    });
  });
  const sendBtn = $('btn-primary');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const item = itemIn.value.trim();
      const amount = $('input-offer-amount').value.trim();
      const name = $('input-offer-name').value.trim();
      const wa = $('input-offer-wa').value.trim();
      if (!amount || !name || !wa) { toast('Please fill in all fields.', 'error'); return; }
      const fmt = Number(amount).toLocaleString('en-NG');
      window.open(waLink(`Hi! I'm *${name}* and I'd like to offer *₦${fmt}* for the *${item}* on ${CONFIG.siteName}.\n\nMy WhatsApp: ${wa}`), '_blank', 'noopener');
      $('input-offer-amount').value = ''; $('input-offer-name').value = ''; $('input-offer-wa').value = '';
      strip.classList.remove('open');
      toast('Opening WhatsApp…', 'success');
    });
  }
}

/* ── WISHLIST BUTTONS ─────────────────────────────────────── */
function initWishlistButtons() {
  document.querySelectorAll('.card-wishlist').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const name = btn.closest('.product-card').querySelector('.card-name').textContent.trim();
      const added = Wishlist.toggle(name);
      syncWishlistUI();
      toast(added ? `❤️ "${name}" saved` : `Removed "${name}" from wishlist`);
    });
  });
  const tb = $('btn-wishlist');
  if (tb) {
    tb.addEventListener('click', () => {
      const list = Wishlist.get();
      if (!list.length) { toast('Wishlist is empty. Tap 🤍 on any piece to save it.'); return; }
      window.open(waLink(`Hi! My wishlist from ${CONFIG.siteName}:\n\n${list.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\nCan you confirm availability?`), '_blank', 'noopener');
    });
  }
}

/* ── FLOATING WA ──────────────────────────────────────────── */
function initFloatingWA() {
  const btn = $('wa-float');
  if (btn) btn.addEventListener('click', () => {
    window.open(waLink(`Hi! I found you on ${CONFIG.siteName} and I'd love to know more about your pieces.`), '_blank', 'noopener');
  });
}

/* ── INSIGHTS REFRESH ─────────────────────────────────────── */
const INSIGHTS = [
  '<strong>Rattan &amp; wicker</strong> trending in Lagos — 12 new listings this week.',
  '<strong>Terracotta ceramics</strong> from Benin City selling fast — 3 pieces left.',
  'Interior decorators building wishlists — <strong>Art &amp; Prints</strong> up 40% in enquiries.',
  '<strong>Brass lighting</strong> most-offered category. Sellers responding within 2 hrs.',
  'New Abuja vendor just uploaded 8 mid-century pieces — check Furniture.',
];
let insightIdx = 0;
function initInsights() {
  const btn = $('insights-refresh');
  const msg = document.querySelector('#insights-panel .insights-msg');
  if (!btn || !msg) return;
  btn.addEventListener('click', () => {
    insightIdx = (insightIdx + 1) % INSIGHTS.length;
    msg.style.opacity = '0';
    setTimeout(() => { msg.innerHTML = INSIGHTS[insightIdx] + ' Check the filter above.'; msg.style.opacity = '1'; }, 200);
    msg.style.transition = 'opacity .2s';
  });
}

/* ── NEWSLETTER ───────────────────────────────────────────── */
function initNewsletter() {
  const btn = document.querySelector('.nl-btn');
  const input = $('input-email');
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    if (!input.value.trim() || !input.value.includes('@')) { toast('Enter a valid email address.', 'error'); return; }
    toast('✓ Subscribed! Welcome to thecontainermarket.ng', 'success');
    input.value = '';
  });
}

/* ── VENDOR UPLOAD ────────────────────────────────────────── */
function initVendor() {
  const btn = $('btn-vendor-upload');
  if (btn) btn.addEventListener('click', () => {
    window.open(waLink(`Hi! I'd like to list an item on ${CONFIG.siteName}. Sending photos now.`), '_blank', 'noopener');
  });
}

/* ── BOOT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  syncWishlistUI();
  initFilters();
  initSearch();
  initEnquire();
  initOffer();
  initWishlistButtons();
  initFloatingWA();
  initInsights();
  initNewsletter();
  initVendor();
});
