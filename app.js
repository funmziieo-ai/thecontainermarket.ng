'use strict';

/* ── CONFIG ── update these before going live ── */
const CONFIG = {
  whatsappNumber: '2349052352101',        // 
  paystackKey:    'pk_live_23599f601df7f401fab266eb761ae168bc88dc43',   // 
  siteName:       'thecontainermarket.ng',
  currency:       'NGN',
};

/* ── HELPERS ── */
function waLink(msg){ return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`; }
function $(id){ return document.getElementById(id); }

/* ── TOAST ── */
function toast(msg, type='info'){
  const old = document.querySelector('.tcm-toast');
  if(old) old.remove();
  const el = document.createElement('div');
  el.className = 'tcm-toast';
  el.setAttribute('role','status');
  el.textContent = msg;
  const bg = {info:'#2A4033',success:'#2A6B3A',error:'#B03A1A'}[type]||'#2A4033';
  Object.assign(el.style,{
    position:'fixed',bottom:'5.5rem',left:'50%',
    transform:'translateX(-50%) translateY(10px)',
    background:bg,color:'#F5EFE0',padding:'10px 20px',
    borderRadius:'20px',fontSize:'13px',fontFamily:'DM Mono,monospace',
    zIndex:'10000',opacity:'0',transition:'opacity .25s,transform .25s',
    whiteSpace:'nowrap',maxWidth:'90vw',textAlign:'center',
  });
  document.body.appendChild(el);
  requestAnimationFrame(()=>{ el.style.opacity='1'; el.style.transform='translateX(-50%) translateY(0)'; });
  setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>el.remove(),300); },3200);
}

/* ════════════════════════════════════════════
   LIGHTBOX — tap photo to open, swipe between
   multiple images of the same product
   ════════════════════════════════════════════ */
let lbImages = [];   // array of src strings for current product
let lbIndex  = 0;    // which image is showing
let lbTouchStartX = 0;

function buildLightbox(){
  if($('tcm-lightbox')) return;
  const lb = document.createElement('div');
  lb.id = 'tcm-lightbox';
  lb.setAttribute('role','dialog');
  lb.setAttribute('aria-modal','true');
  lb.setAttribute('aria-label','Product image viewer');
  lb.innerHTML = `
    <div id="lb-backdrop"></div>
    <div id="lb-shell">
      <button id="lb-close" aria-label="Close">✕</button>
      <button id="lb-prev" aria-label="Previous image">‹</button>
      <div id="lb-img-wrap">
        <img id="lb-img" src="" alt="Product image"/>
        <div id="lb-loader">Loading…</div>
      </div>
      <button id="lb-next" aria-label="Next image">›</button>
      <div id="lb-dots"></div>
      <div id="lb-counter"></div>
    </div>`;

  // Inline styles so no external CSS needed
  lb.style.cssText = `
    display:none;position:fixed;inset:0;z-index:5000;
    align-items:center;justify-content:center;`;
  document.body.appendChild(lb);

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #tcm-lightbox{display:none}
    #tcm-lightbox.open{display:flex}
    #lb-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.88);cursor:pointer}
    #lb-shell{
      position:relative;z-index:1;display:flex;flex-direction:column;
      align-items:center;max-width:520px;width:94vw;
    }
    #lb-close{
      position:absolute;top:-44px;right:0;background:none;border:none;
      color:#fff;font-size:28px;cursor:pointer;padding:4px 10px;line-height:1;
    }
    #lb-img-wrap{
      width:100%;aspect-ratio:3/4;background:#111;border-radius:10px;
      overflow:hidden;position:relative;user-select:none;
    }
    #lb-img{
      width:100%;height:100%;object-fit:contain;display:block;
      transition:opacity .2s;
    }
    #lb-loader{
      position:absolute;inset:0;display:flex;align-items:center;
      justify-content:center;color:#888;font-size:13px;font-family:monospace;
      pointer-events:none;
    }
    #lb-prev,#lb-next{
      position:absolute;top:50%;transform:translateY(-50%);
      background:rgba(255,255,255,.15);border:none;color:#fff;
      font-size:28px;width:40px;height:60px;border-radius:6px;
      cursor:pointer;z-index:2;transition:background .2s;display:none;
    }
    #lb-prev{left:-48px} #lb-next{right:-48px}
    #lb-prev:hover,#lb-next:hover{background:rgba(255,255,255,.28)}
    @media(max-width:600px){
      #lb-prev{left:4px;top:auto;bottom:60px;transform:none}
      #lb-next{right:4px;top:auto;bottom:60px;transform:none}
    }
    #lb-dots{
      display:flex;gap:6px;margin-top:12px;align-items:center;
      justify-content:center;min-height:14px;
    }
    .lb-dot{
      width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.3);
      cursor:pointer;transition:background .2s;border:none;padding:0;
    }
    .lb-dot.active{background:#fff;transform:scale(1.3)}
    #lb-counter{
      color:rgba(255,255,255,.55);font-size:12px;font-family:monospace;
      margin-top:6px;min-height:16px;
    }
  `;
  document.head.appendChild(style);

  // Events
  $('lb-backdrop').addEventListener('click', closeLightbox);
  $('lb-close').addEventListener('click', closeLightbox);
  $('lb-prev').addEventListener('click', ()=>lbGo(lbIndex - 1));
  $('lb-next').addEventListener('click', ()=>lbGo(lbIndex + 1));
  document.addEventListener('keydown', e=>{
    if(!$('tcm-lightbox').classList.contains('open')) return;
    if(e.key==='Escape') closeLightbox();
    if(e.key==='ArrowLeft') lbGo(lbIndex - 1);
    if(e.key==='ArrowRight') lbGo(lbIndex + 1);
  });

  // Touch swipe
  const wrap = $('lb-img-wrap');
  wrap.addEventListener('touchstart', e=>{ lbTouchStartX = e.touches[0].clientX; }, {passive:true});
  wrap.addEventListener('touchend', e=>{
    const dx = e.changedTouches[0].clientX - lbTouchStartX;
    if(Math.abs(dx) > 40){ lbGo(dx < 0 ? lbIndex+1 : lbIndex-1); }
  });
}

function openLightbox(images, startIndex=0){
  buildLightbox();
  lbImages = Array.isArray(images) ? images : [images];
  lbIndex  = startIndex;
  $('tcm-lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  lbRender();
}

function closeLightbox(){
  $('tcm-lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lbGo(idx){
  if(lbImages.length < 2) return;
  lbIndex = (idx + lbImages.length) % lbImages.length;
  lbRender();
}

function lbRender(){
  const img    = $('lb-img');
  const loader = $('lb-loader');
  const prev   = $('lb-prev');
  const next   = $('lb-next');
  const dots   = $('lb-dots');
  const counter= $('lb-counter');
  const multi  = lbImages.length > 1;

  img.style.opacity = '0';
  loader.textContent = 'Loading…';

  img.onload = ()=>{ img.style.opacity='1'; loader.textContent=''; };
  img.src = lbImages[lbIndex];

  prev.style.display = next.style.display = multi ? 'block' : 'none';

  // Dots
  dots.innerHTML = multi
    ? lbImages.map((_,i)=>
        `<button class="lb-dot ${i===lbIndex?'active':''}" onclick="lbGo(${i})" aria-label="Image ${i+1}"></button>`
      ).join('') : '';

  counter.textContent = multi ? `${lbIndex+1} / ${lbImages.length}` : '';
}

/* Attach lightbox to all product cards */
function initLightbox(){
  document.querySelectorAll('.product-card').forEach(card=>{
    const img = card.querySelector('.card-img img');
    if(!img) return;

    // Gather all images for this product
    // Currently one per card — structure allows multiple via data-images attribute
    const extraRaw = card.querySelector('.card-img').dataset.images || '';
    const extras   = extraRaw ? extraRaw.split('||').filter(Boolean) : [];
    const all      = [img.src, ...extras];

    // Make image tappable
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', ()=> openLightbox(all, 0));

    // Also tap the card image div
    card.querySelector('.card-img').style.cursor = 'zoom-in';
  });
}

/* ════════════════════════════════════════════
   WISHLIST
   ════════════════════════════════════════════ */
const Wishlist = {
  key:'tcm_wishlist',
  get(){ try{ return JSON.parse(localStorage.getItem(this.key))||[]; }catch{ return []; } },
  save(l){ try{ localStorage.setItem(this.key,JSON.stringify(l)); }catch{} },
  toggle(name){ let l=this.get(),i=l.indexOf(name); if(i===-1){l.push(name);this.save(l);return true;} l.splice(i,1);this.save(l);return false; },
  has(name){ return this.get().includes(name); },
  count(){ return this.get().length; },
};

function syncWishlistUI(){
  document.querySelectorAll('.card-wishlist').forEach(btn=>{
    const name=btn.closest('.product-card').querySelector('.card-name').textContent.trim();
    btn.textContent=Wishlist.has(name)?'❤️':'🤍';
    btn.setAttribute('aria-pressed',Wishlist.has(name)?'true':'false');
  });
  const tb=$('btn-wishlist');
  if(tb){ const n=Wishlist.count(); tb.innerHTML=`🤍 ${n>0?`Saved (${n})`:'Saved'}`; }
}

/* ════════════════════════════════════════════
   FILTERS
   ════════════════════════════════════════════ */
function initFilters(){
  const chips=document.querySelectorAll('.filter-chip');
  const cards=document.querySelectorAll('#list-root .product-card');
  chips.forEach(chip=>{
    chip.addEventListener('click',()=>{
      chips.forEach(c=>{ c.setAttribute('aria-pressed','false'); c.classList.remove('active'); });
      chip.setAttribute('aria-pressed','true'); chip.classList.add('active');
      const f=chip.dataset.filter;
      let shown=0;
      cards.forEach(card=>{
        const show=f==='all'||card.dataset.category===f;
        card.style.display=show?'':'none';
        if(show) shown++;
      });
      // update section heading count
      const head=document.querySelector('.section-head a');
      if(head) head.textContent=`${shown} items →`;
    });
  });
}

/* ════════════════════════════════════════════
   SEARCH
   ════════════════════════════════════════════ */
function initSearch(){
  const input=$('input-search');
  const btn=document.querySelector('.hero-search button');
  const cards=document.querySelectorAll('#list-root .product-card');
  function run(){
    const q=input.value.trim().toLowerCase();
    if(!q){ cards.forEach(c=>c.style.display=''); return; }
    let found=0;
    cards.forEach(card=>{
      const show=card.textContent.toLowerCase().includes(q);
      card.style.display=show?'':'none';
      if(show) found++;
    });
    if(!found) toast(`No results for "${input.value}". Try "clock" or "lamp".`);
    else $('main').scrollIntoView({behavior:'smooth'});
  }
  if(btn) btn.addEventListener('click',run);
  if(input) input.addEventListener('keydown',e=>{ if(e.key==='Enter') run(); });
}

/* ════════════════════════════════════════════
   WHATSAPP ENQUIRE
   ════════════════════════════════════════════ */
function initEnquire(){
  document.querySelectorAll('.btn-enquire').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const card=btn.closest('.product-card');
      const name=card.querySelector('.card-name').textContent.trim();
      const price=card.querySelector('.card-price').textContent.trim();
      window.open(waLink(`Hi! I'm interested in the *${name}* (${price}) on ${CONFIG.siteName}. Is it still available?`),'_blank','noopener');
    });
  });
}

/* ════════════════════════════════════════════
   PAYSTACK — BUY NOW
   ════════════════════════════════════════════ */
let currentItem={};

function initBuyNow(){
  document.querySelectorAll('.btn-buy').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const card=btn.closest('.product-card');
      currentItem={
        name: card.querySelector('.card-name').textContent.trim(),
        price: parseInt(btn.dataset.price),
      };
      $('pay-item-name').textContent=currentItem.name;
      $('pay-item-price').textContent=`₦${currentItem.price.toLocaleString('en-NG')}`;
      $('pay-email').value='';
      $('pay-phone').value='';
      $('pay-fullname').value='';
      $('pay-modal').classList.add('open');
    });
  });

  $('pay-cancel').addEventListener('click',()=>$('pay-modal').classList.remove('open'));
  $('pay-modal').addEventListener('click',e=>{ if(e.target===$('pay-modal')) $('pay-modal').classList.remove('open'); });

  $('pay-confirm').addEventListener('click',()=>{
    const email=$('pay-email').value.trim();
    const phone=$('pay-phone').value.trim();
    const name=$('pay-fullname').value.trim();
    if(!email||!email.includes('@')){ toast('Enter a valid email address.','error'); return; }
    if(!name){ toast('Enter your full name.','error'); return; }

    if(!CONFIG.paystackKey||CONFIG.paystackKey.includes('REPLACE')){
      toast('Paystack not configured yet. Please enquire via WhatsApp.','error');
      setTimeout(()=>{
        const msg=`Hi! I'd like to buy the *${currentItem.name}* (₦${currentItem.price.toLocaleString('en-NG')}) on ${CONFIG.siteName}. Name: ${name}. Phone: ${phone}.`;
        window.open(waLink(msg),'_blank','noopener');
        $('pay-modal').classList.remove('open');
      },1500);
      return;
    }

    const handler=PaystackPop.setup({
      key: CONFIG.paystackKey,
      email,
      amount: currentItem.price * 100,
      currency: CONFIG.currency,
      ref: 'TCM-' + Date.now(),
      metadata:{
        custom_fields:[
          {display_name:'Product',   variable_name:'product',       value:currentItem.name},
          {display_name:'Phone',     variable_name:'phone',         value:phone},
          {display_name:'Customer',  variable_name:'customer_name', value:name},
        ]
      },
      callback(response){
        $('pay-modal').classList.remove('open');
        toast(`✓ Payment successful! Ref: ${response.reference}`,'success');
        const msg=`Hi! I just paid for *${currentItem.name}* on ${CONFIG.siteName}.\nRef: ${response.reference}\nName: ${name}\nPhone: ${phone}\nPlease confirm my order. Thank you!`;
        setTimeout(()=>window.open(waLink(msg),'_blank','noopener'),1500);
      },
      onClose(){ toast('Payment cancelled.'); }
    });
    handler.openIframe();
  });
}

/* ════════════════════════════════════════════
   WISHLIST BUTTONS
   ════════════════════════════════════════════ */
function initWishlistButtons(){
  document.querySelectorAll('.card-wishlist').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const name=btn.closest('.product-card').querySelector('.card-name').textContent.trim();
      const added=Wishlist.toggle(name);
      syncWishlistUI();
      toast(added?`❤️ "${name}" saved`:`Removed "${name}" from wishlist`);
    });
  });
  const tb=$('btn-wishlist');
  if(tb){
    tb.addEventListener('click',()=>{
      const list=Wishlist.get();
      if(!list.length){ toast('Wishlist empty. Tap 🤍 on any item to save it.'); return; }
      window.open(waLink(`Hi! My wishlist from ${CONFIG.siteName}:\n\n${list.map((n,i)=>`${i+1}. ${n}`).join('\n')}\n\nPlease confirm availability and prices.`),'_blank','noopener');
    });
  }
}

/* ════════════════════════════════════════════
   FLOATING WA
   ════════════════════════════════════════════ */
function initFloatingWA(){
  const btn=$('wa-float');
  if(btn) btn.addEventListener('click',()=>window.open(waLink(`Hi! I found you on ${CONFIG.siteName} and I'd love to know more about your pieces.`),'_blank','noopener'));
}

/* ════════════════════════════════════════════
   INSIGHTS
   ════════════════════════════════════════════ */
const INSIGHTS=[
  '<strong>Clocks & lighting</strong> are most-enquired this week — 8 unique pieces available.',
  '<strong>Blue & white vase set</strong> has had 5 enquiries this week — act fast!',
  'Tap 🤍 on any item to save to your wishlist and share with us on WhatsApp.',
  '<strong>Stationery sets</strong> selling fast — staplers and tape dispensers almost gone.',
  'New floor lamps available — scroll to Lighting to see all options.',
  '<strong>Terracotta pots</strong> just added — perfect for indoor plants.',
];
let insightIdx=0;
function initInsights(){
  const btn=$('insights-refresh'),msg=document.querySelector('#insights-panel .insights-msg');
  if(!btn||!msg) return;
  btn.addEventListener('click',()=>{
    insightIdx=(insightIdx+1)%INSIGHTS.length;
    msg.style.opacity='0';
    setTimeout(()=>{ msg.innerHTML=INSIGHTS[insightIdx]; msg.style.opacity='1'; },200);
    msg.style.transition='opacity .2s';
  });
}

/* ════════════════════════════════════════════
   NEWSLETTER
   ════════════════════════════════════════════ */
function initNewsletter(){
  const btn=document.querySelector('.nl-btn'),input=$('input-email');
  if(!btn||!input) return;
  btn.addEventListener('click',()=>{
    if(!input.value.trim()||!input.value.includes('@')){ toast('Enter a valid email.','error'); return; }
    toast('✓ Subscribed! Welcome to thecontainermarket.ng','success');
    input.value='';
  });
}

/* ════════════════════════════════════════════
   VENDOR
   ════════════════════════════════════════════ */
function initVendor(){
  const btn=$('btn-vendor-upload');
  if(btn) btn.addEventListener('click',()=>window.open(waLink(`Hi! I'd like to list an item on ${CONFIG.siteName}. Sending photos now.`),'_blank','noopener'));
}

/* ════════════════════════════════════════════
   BOOT
   ════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  syncWishlistUI();
  initFilters();
  initSearch();
  initEnquire();
  initBuyNow();
  initWishlistButtons();
  initFloatingWA();
  initInsights();
  initNewsletter();
  initVendor();
  initLightbox();
});
