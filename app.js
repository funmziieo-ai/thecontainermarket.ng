'use strict';

/* ── CONFIG ── */
const CONFIG = {
  whatsappNumber: '2348000000000',  // ← your real number
  paystackKey:    'pk_live_23599f601df7f401fab266eb761ae168bc88dc43',
  siteName:       'thecontainermarket.ng',
  currency:       'NGN',
};

function waLink(msg){ return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`; }
function $(id){ return document.getElementById(id); }
function fmt(n){ return '₦'+parseInt(n).toLocaleString('en-NG'); }

/* ── TOAST ── */
function toast(msg, type='info'){
  document.querySelector('.tcm-toast')?.remove();
  const el=document.createElement('div');
  el.className='tcm-toast';
  el.setAttribute('role','status');
  el.textContent=msg;
  const bg={info:'#2A4033',success:'#2A6B3A',error:'#B03A1A'}[type]||'#2A4033';
  Object.assign(el.style,{
    position:'fixed',bottom:'5.5rem',left:'50%',
    transform:'translateX(-50%) translateY(10px)',
    background:bg,color:'#F5EFE0',padding:'10px 20px',borderRadius:'20px',
    fontSize:'13px',fontFamily:'DM Mono,monospace',zIndex:'9999',opacity:'0',
    transition:'opacity .25s,transform .25s',whiteSpace:'nowrap',
    maxWidth:'90vw',textAlign:'center',pointerEvents:'none',
  });
  document.body.appendChild(el);
  requestAnimationFrame(()=>{ el.style.opacity='1'; el.style.transform='translateX(-50%) translateY(0)'; });
  setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>el.remove(),300); },3000);
}

/* ══════════════════════════════════════════
   MENU
══════════════════════════════════════════ */
function openMenu(){
  $('side-menu').classList.add('open');
  $('menu-overlay').classList.add('show');
  document.body.style.overflow='hidden';
}
function closeMenu(){
  $('side-menu').classList.remove('open');
  $('menu-overlay').classList.remove('show');
  document.body.style.overflow='';
}
function filterFromMenu(cat){
  closeMenu();
  // Trigger the filter chip
  const chip=document.querySelector(`.filter-chip[data-filter="${cat}"]`);
  if(chip){ chip.click(); }
  $('main').scrollIntoView({behavior:'smooth'});
}

/* ══════════════════════════════════════════
   CART
══════════════════════════════════════════ */
let cart=[];
try{ cart=JSON.parse(localStorage.getItem('tcm_cart'))||[]; }catch{ cart=[]; }

function saveCart(){ try{ localStorage.setItem('tcm_cart',JSON.stringify(cart)); }catch{} }

function cartAdd(product, price, imgSrc){
  const existing=cart.find(i=>i.name===product);
  if(existing){ existing.qty++; }
  else{ cart.push({name:product, price:parseInt(price), qty:1, img:imgSrc}); }
  saveCart();
  renderCart();
  updateCartBadge();
  toast(`"${product}" added to cart`,'success');
}

function cartRemove(name){
  cart=cart.filter(i=>i.name!==name);
  saveCart();
  renderCart();
  updateCartBadge();
}

function cartQty(name, delta){
  const item=cart.find(i=>i.name===name);
  if(!item) return;
  item.qty=Math.max(1,item.qty+delta);
  saveCart();
  renderCart();
  updateCartBadge();
}

function cartTotal(){ return cart.reduce((s,i)=>s+i.price*i.qty,0); }

function updateCartBadge(){
  const total=cart.reduce((s,i)=>s+i.qty,0);
  const badge=$('cart-count');
  const menuBadge=$('menu-cart-count');
  if(badge){
    badge.textContent=total;
    badge.classList.toggle('show',total>0);
  }
  if(menuBadge){
    menuBadge.textContent=total;
    menuBadge.style.display=total>0?'inline':'none';
  }
}

function renderCart(){
  const list=$('cart-items-list');
  const footer=$('cart-footer');
  if(!list) return;

  if(!cart.length){
    list.innerHTML='<div class="cart-empty"><div class="cart-empty-icon">🛒</div>Your cart is empty.<br>Tap <strong>Add to Cart</strong> on any product.</div>';
    if(footer) footer.style.display='none';
    // Reset all cart buttons
    document.querySelectorAll('.btn-cart').forEach(btn=>{
      btn.textContent='🛒 Add to Cart';
      btn.classList.remove('in-cart');
    });
    return;
  }

  list.innerHTML=cart.map(item=>`
    <div class="cart-item">
      ${item.img ? `<img class="cart-item-img" src="${item.img}" alt="${item.name}"/>` : ''}
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="cartQty('${escAttr(item.name)}',-1)" aria-label="Decrease">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="cartQty('${escAttr(item.name)}',1)" aria-label="Increase">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="cartRemove('${escAttr(item.name)}')" aria-label="Remove">✕</button>
    </div>`).join('');

  const total=cartTotal();
  if($('cart-subtotal-val')) $('cart-subtotal-val').textContent=fmt(total);
  if($('cart-total-val'))    $('cart-total-val').textContent=fmt(total);
  if(footer) footer.style.display='block';

  // Update cart buttons state
  document.querySelectorAll('.btn-cart').forEach(btn=>{
    const name=btn.dataset.product;
    const inCart=cart.some(i=>i.name===name);
    btn.textContent=inCart?'✓ In Cart':'🛒 Add to Cart';
    btn.classList.toggle('in-cart',inCart);
  });
}

function openCart(){
  $('cart-drawer').classList.add('open');
  $('cart-overlay').classList.add('show');
  document.body.style.overflow='hidden';
}
function closeCart(){
  $('cart-drawer').classList.remove('open');
  $('cart-overlay').classList.remove('show');
  document.body.style.overflow='';
}

function checkoutWA(){
  if(!cart.length){ toast('Your cart is empty','error'); return; }
  const lines=cart.map(i=>`• ${i.name} x${i.qty} — ${fmt(i.price*i.qty)}`).join('\n');
  const total=cartTotal();
  const msg=`Hi! I'd like to order the following from ${CONFIG.siteName}:\n\n${lines}\n\nTotal: ${fmt(total)}\n\nPlease confirm availability and delivery details.`;
  window.open(waLink(msg),'_blank','noopener');
  closeCart();
}

function checkoutPaystack(){
  if(!cart.length){ toast('Your cart is empty','error'); return; }
  // For multi-item cart, open pay modal with total
  currentItem={
    name:`Cart (${cart.length} item${cart.length>1?'s':''})`,
    price:cartTotal(),
  };
  $('pay-item-name').textContent=currentItem.name;
  $('pay-item-price').textContent=fmt(currentItem.price);
  $('pay-email').value='';
  $('pay-phone').value='';
  $('pay-fullname').value='';
  closeCart();
  $('pay-modal').classList.add('open');
}

/* ══════════════════════════════════════════
   WISHLIST
══════════════════════════════════════════ */
const Wishlist={
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
    const saved=Wishlist.has(name);
    btn.textContent=saved?'❤️':'🤍';
    btn.classList.toggle('saved',saved);
    btn.setAttribute('aria-pressed',saved?'true':'false');
  });
  const wb=$('btn-wishlist');
  if(wb){ const n=Wishlist.count(); wb.textContent=n>0?`Saved (${n})`:'Saved'; }
}

function openWishlistWA(){
  const list=Wishlist.get();
  if(!list.length){ toast('Wishlist empty. Tap 🤍 on any item first.'); return; }
  window.open(waLink(`Hi! My wishlist from ${CONFIG.siteName}:\n\n${list.map((n,i)=>`${i+1}. ${n}`).join('\n')}\n\nPlease confirm availability.`),'_blank','noopener');
}

/* ══════════════════════════════════════════
   FILTERS
══════════════════════════════════════════ */
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
      const link=$('items-count-link');
      if(link) link.textContent=`${shown} items →`;
    });
  });
}

/* ══════════════════════════════════════════
   SEARCH
══════════════════════════════════════════ */
function initSearch(){
  const input=$('input-search');
  const btn=document.querySelector('.hero-search button');
  const cards=document.querySelectorAll('#list-root .product-card');
  function run(){
    const q=input.value.trim().toLowerCase();
    // Reset all filters
    document.querySelectorAll('.filter-chip').forEach(c=>{
      c.classList.remove('active'); c.setAttribute('aria-pressed','false');
    });
    document.querySelector('.filter-chip[data-filter="all"]')?.classList.add('active');
    if(!q){ cards.forEach(c=>c.style.display=''); return; }
    let found=0;
    cards.forEach(card=>{
      const show=card.textContent.toLowerCase().includes(q);
      card.style.display=show?'':'none';
      if(show) found++;
    });
    if(!found) toast(`No results for "${input.value}". Try "clock" or "vase".`);
    else $('main').scrollIntoView({behavior:'smooth'});
  }
  if(btn) btn.addEventListener('click',run);
  if(input) input.addEventListener('keydown',e=>{ if(e.key==='Enter') run(); });
}

/* ══════════════════════════════════════════
   WA ENQUIRE
══════════════════════════════════════════ */
function initEnquire(){
  document.querySelectorAll('.btn-enquire').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const card=btn.closest('.product-card');
      const name=card.querySelector('.card-name').textContent.trim();
      const price=card.querySelector('.card-price').textContent.trim();
      window.open(waLink(`Hi! I'm interested in the *${name}* (${price}) on ${CONFIG.siteName}. Is it still available?`),'_blank','noopener');
    });
  });
}

/* ══════════════════════════════════════════
   ADD TO CART BUTTONS
══════════════════════════════════════════ */
function initCartButtons(){
  document.querySelectorAll('.btn-cart').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const card=btn.closest('.product-card');
      const name=card.querySelector('.card-name').textContent.trim();
      const priceEl=card.querySelector('.card-price');
      const price=priceEl?priceEl.textContent.replace(/[₦,]/g,'').trim():'0';
      const img=card.querySelector('.card-img img');
      const imgSrc=img?img.src:'';

      if(cart.some(i=>i.name===name)){
        // Already in cart — open cart
        openCart();
      } else {
        cartAdd(name,price,imgSrc);
      }
    });
  });
}

/* ══════════════════════════════════════════
   PAYSTACK
══════════════════════════════════════════ */
let currentItem={};

function initBuyNow(){
  document.querySelectorAll('.btn-buy').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const card=btn.closest('.product-card');
      currentItem={
        name:card.querySelector('.card-name').textContent.trim(),
        price:parseInt(btn.dataset.price),
      };
      $('pay-item-name').textContent=currentItem.name;
      $('pay-item-price').textContent=fmt(currentItem.price);
      $('pay-email').value='';
      $('pay-phone').value='';
      $('pay-fullname').value='';
      $('pay-modal').classList.add('open');
    });
  });

  $('pay-cancel')?.addEventListener('click',()=>$('pay-modal').classList.remove('open'));
  $('pay-modal')?.addEventListener('click',e=>{ if(e.target===$('pay-modal')) $('pay-modal').classList.remove('open'); });

  $('pay-confirm')?.addEventListener('click',()=>{
    const email=$('pay-email').value.trim();
    const phone=$('pay-phone').value.trim();
    const name=$('pay-fullname').value.trim();
    if(!email||!email.includes('@')){ toast('Enter a valid email.','error'); return; }
    if(!name){ toast('Enter your full name.','error'); return; }
    const handler=PaystackPop.setup({
      key:CONFIG.paystackKey,
      email,
      amount:currentItem.price*100,
      currency:CONFIG.currency,
      ref:'TCM-'+Date.now(),
      metadata:{custom_fields:[
        {display_name:'Product',variable_name:'product',value:currentItem.name},
        {display_name:'Phone',variable_name:'phone',value:phone},
        {display_name:'Customer',variable_name:'customer_name',value:name},
      ]},
      callback(response){
        $('pay-modal').classList.remove('open');
        // Clear cart if this was a cart checkout
        if(currentItem.name.startsWith('Cart')){
          const summary=cart.map(i=>`• ${i.name} x${i.qty}`).join('\n');
          cart=[]; saveCart(); renderCart(); updateCartBadge();
          toast('Payment confirmed. We will contact you on WhatsApp.','success');
          setTimeout(()=>window.open(waLink(`Hi! I paid for my cart on ${CONFIG.siteName}.\nRef: ${response.reference}\nItems:\n${summary}\nName: ${name} | Phone: ${phone}`),'_blank','noopener'),1500);
        } else {
          toast('Payment confirmed. We will message you on WhatsApp.','success');
          setTimeout(()=>window.open(waLink(`Hi! I paid for *${currentItem.name}* on ${CONFIG.siteName}.\nRef: ${response.reference}\nName: ${name} | Phone: ${phone}`),'_blank','noopener'),1500);
        }
      },
      onClose(){ toast('Payment cancelled.'); }
    });
    handler.openIframe();
  });
}

/* ══════════════════════════════════════════
   WISHLIST BUTTONS
══════════════════════════════════════════ */
function initWishlistButtons(){
  document.querySelectorAll('.card-wishlist').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const name=btn.closest('.product-card').querySelector('.card-name').textContent.trim();
      const added=Wishlist.toggle(name);
      syncWishlistUI();
      toast(added?`❤️ "${name}" saved to wishlist`:`Removed from wishlist`);
    });
  });
  $('btn-wishlist')?.addEventListener('click', openWishlistWA);
}

/* ══════════════════════════════════════════
   SELLER FORM
══════════════════════════════════════════ */
function toggleSellerForm(){
  const form=$('seller-form');
  const icon=$('seller-toggle-icon');
  const header=document.querySelector('.seller-header');
  const open=form.classList.toggle('open');
  icon.classList.toggle('open',open);
  header.setAttribute('aria-expanded',open);
}

function openSellerForm(){
  const form=$('seller-form');
  if(!form.classList.contains('open')) toggleSellerForm();
  $('seller-section').scrollIntoView({behavior:'smooth',block:'start'});
}

function sfPhotoSelected(e){
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    const preview=$('sf-preview');
    preview.src=ev.target.result;
    preview.style.display='block';
    $('sf-photo-btn').textContent='✓ Photo ready — tap to change';
  };
  reader.readAsDataURL(file);
}

function submitSellerForm(){
  const name=$('sf-name').value.trim();
  const price=$('sf-price').value.trim();
  const wa=$('sf-wa').value.trim();
  const cat=$('sf-cat').value;
  const condition=$('sf-condition').value;
  const desc=$('sf-desc').value.trim();
  const sellerName=$('sf-seller-name').value.trim();

  if(!name){ toast('Please enter the item name.','error'); return; }
  if(!price){ toast('Please enter your asking price.','error'); return; }
  if(!wa){ toast('Please enter your WhatsApp number.','error'); return; }

  const msg=`Hi! I'd like to list an item on ${CONFIG.siteName}.\n\n`+
    `*Item:* ${name}\n`+
    `*Category:* ${cat}\n`+
    `*Price:* ₦${parseInt(price).toLocaleString('en-NG')}\n`+
    `*Condition:* ${condition}\n`+
    (desc?`*Description:* ${desc}\n`:'')+
    (sellerName?`*Seller:* ${sellerName}\n`:'')+
    `*My WhatsApp:* ${wa}\n\n`+
    `I'll send photos now.`;

  window.open(waLink(msg),'_blank','noopener');

  // Reset form
  $('sf-name').value=''; $('sf-price').value='';
  $('sf-wa').value=''; $('sf-desc').value='';
  $('sf-seller-name').value='';
  $('sf-preview').style.display='none';
  $('sf-photo-btn').textContent='📷 Tap to upload your photo';
  toast('Opening WhatsApp with your listing details.','success');
}

/* ══════════════════════════════════════════
   ORDER TRACKER
══════════════════════════════════════════ */
function openOrderTracker(){
  $('orders-modal').classList.add('open');
  $('track-input').value='';
  $('track-result').style.display='none';
}
function closeOrderTracker(){ $('orders-modal').classList.remove('open'); }

function submitTrack(){
  const val=$('track-input').value.trim();
  if(!val){ toast('Enter your phone number or email.','error'); return; }
  // Send to WA — you manually respond with order status
  const msg=`Hi! I'd like to track my order on ${CONFIG.siteName}.\nPhone/Email: ${val}`;
  window.open(waLink(msg),'_blank','noopener');
  $('track-result').textContent='Opening WhatsApp — we\'ll reply with your order status shortly.';
  $('track-result').style.display='block';
}

/* ══════════════════════════════════════════
   FLOATING WA
══════════════════════════════════════════ */
function initFloatingWA(){
  $('wa-float')?.addEventListener('click',()=>
    window.open(waLink(`Hi! I found you on ${CONFIG.siteName} and I'd love to know more.`),'_blank','noopener'));
}

/* ══════════════════════════════════════════
   INSIGHTS
══════════════════════════════════════════ */
const INSIGHTS=[
  '<strong>Clocks & lighting</strong> are most-enquired this week.',
  '<strong>Blue & white vase set</strong> — 5 enquiries this week, act fast!',
  'Tap 🤍 on any item to save to wishlist and share via WhatsApp.',
  '<strong>Stationery sets</strong> selling fast — staplers almost gone.',
  'New terracotta pots just added — perfect for indoor plants.',
  '<strong>Moroccan lantern</strong> is a customer favourite this month.',
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

/* ══════════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════════ */
function subscribeNewsletter(){
  const input=$('input-email');
  if(!input?.value.trim()||!input.value.includes('@')){toast('Enter a valid email.','error');return;}
  toast('Subscribed. Welcome to thecontainermarket.ng','success');
  input.value='';
}

/* ══════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════ */
let lbImages=[],lbIndex=0,lbTouchStartX=0;

function handleCardImgClick(event,el){
  if(event.target.classList.contains('card-wishlist')) return;
  if(event.target.closest('.card-wishlist')) return;
  const img=el.querySelector('img');
  if(!img?.src) return;
  const extraRaw=el.dataset.images||'';
  const extras=extraRaw?extraRaw.split('||').filter(Boolean):[];
  openLightbox([img.src,...extras],0);
}

let lbRotation=0, lbZoom=1;

function buildLightbox(){
  if($('tcm-lightbox')) return;
  const style=document.createElement('style');
  style.textContent=`
    #tcm-lightbox{display:none;position:fixed;inset:0;z-index:9000;
      background:rgba(0,0,0,.93);align-items:center;justify-content:center;flex-direction:column}
    #tcm-lightbox.open{display:flex}
    #lb-toolbar{position:fixed;top:0;left:0;right:0;display:flex;align-items:center;
      justify-content:space-between;padding:12px 16px;z-index:9002;}
    #lb-tools{display:flex;gap:8px}
    #lb-close,#lb-zoom-in,#lb-zoom-out,#lb-rotate{
      background:rgba(255,255,255,.15);border:none;color:#fff;
      font-size:18px;width:40px;height:40px;border-radius:50%;
      cursor:pointer;display:flex;align-items:center;justify-content:center;
      transition:background .2s;-webkit-tap-highlight-color:transparent;}
    #lb-close{font-size:20px}
    #lb-close:hover,#lb-zoom-in:hover,#lb-zoom-out:hover,#lb-rotate:hover{
      background:rgba(255,255,255,.28)}
    #lb-img-wrap{
      width:88vw;max-width:460px;aspect-ratio:3/4;position:relative;
      overflow:hidden;border-radius:10px;
    }
    #lb-img{width:100%;height:100%;object-fit:contain;display:block;
      transition:opacity .18s, transform .3s ease;
      user-select:none;-webkit-user-drag:none;
      -webkit-touch-callout:none;pointer-events:none;
      transform-origin:center center;}
    #lb-prev,#lb-next{position:fixed;top:50%;transform:translateY(-50%);
      background:rgba(255,255,255,.15);border:none;color:#fff;
      font-size:30px;width:44px;height:64px;border-radius:8px;
      cursor:pointer;z-index:9001;-webkit-tap-highlight-color:transparent;}
    #lb-prev{left:8px}#lb-next{right:8px}
    #lb-dots{display:flex;gap:8px;margin-top:14px;justify-content:center}
    .lb-dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.3);
      border:none;cursor:pointer;padding:0;transition:background .15s,transform .15s}
    .lb-dot.active{background:#fff;transform:scale(1.3)}
    #lb-counter{color:rgba(255,255,255,.55);font-size:12px;font-family:monospace;margin-top:8px}
    #lb-hint{color:rgba(255,255,255,.35);font-size:11px;font-family:monospace;margin-top:5px}
    #lb-zoom-level{color:rgba(255,255,255,.45);font-size:10px;font-family:monospace;margin-top:3px}`;
  document.head.appendChild(style);

  const lb=document.createElement('div');
  lb.id='tcm-lightbox';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
  lb.innerHTML=`
    <div id="lb-toolbar">
      <button id="lb-close" aria-label="Close">✕</button>
      <div id="lb-tools">
        <button id="lb-zoom-out" aria-label="Zoom out" title="Zoom out">－</button>
        <button id="lb-zoom-in"  aria-label="Zoom in"  title="Zoom in">＋</button>
        <button id="lb-rotate"   aria-label="Rotate"   title="Rotate image">↻</button>
      </div>
    </div>
    <button id="lb-prev" style="display:none" aria-label="Previous">‹</button>
    <div id="lb-img-wrap"><img id="lb-img" src="" alt="Product photo"/></div>
    <button id="lb-next" style="display:none" aria-label="Next">›</button>
    <div id="lb-dots"></div>
    <div id="lb-counter"></div>
    <div id="lb-zoom-level"></div>
    <div id="lb-hint"></div>`;
  document.body.appendChild(lb);

  lb.addEventListener('click',e=>{ if(e.target===lb) closeLightbox(); });
  $('lb-close').addEventListener('click',closeLightbox);
  $('lb-prev').addEventListener('click',e=>{ e.stopPropagation(); lbGo(lbIndex-1); });
  $('lb-next').addEventListener('click',e=>{ e.stopPropagation(); lbGo(lbIndex+1); });

  // Rotate
  $('lb-rotate').addEventListener('click',e=>{
    e.stopPropagation();
    lbRotation=(lbRotation+90)%360;
    lbApplyTransform();
  });

  // Zoom
  $('lb-zoom-in').addEventListener('click',e=>{
    e.stopPropagation();
    lbZoom=Math.min(3,parseFloat((lbZoom+0.25).toFixed(2)));
    lbApplyTransform();
  });
  $('lb-zoom-out').addEventListener('click',e=>{
    e.stopPropagation();
    lbZoom=Math.max(0.5,parseFloat((lbZoom-0.25).toFixed(2)));
    lbApplyTransform();
  });

  // Keyboard
  document.addEventListener('keydown',e=>{
    if(!$('tcm-lightbox').classList.contains('open')) return;
    if(e.key==='Escape') closeLightbox();
    if(e.key==='ArrowLeft') lbGo(lbIndex-1);
    if(e.key==='ArrowRight') lbGo(lbIndex+1);
    if(e.key==='+') { lbZoom=Math.min(3,lbZoom+0.25); lbApplyTransform(); }
    if(e.key==='-') { lbZoom=Math.max(0.5,lbZoom-0.25); lbApplyTransform(); }
    if(e.key==='r') { lbRotation=(lbRotation+90)%360; lbApplyTransform(); }
  });

  // Touch swipe
  const wrap=$('lb-img-wrap');
  wrap.addEventListener('touchstart',e=>{ lbTouchStartX=e.touches[0].clientX; },{passive:true});
  wrap.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-lbTouchStartX;
    if(Math.abs(dx)>40) lbGo(dx<0?lbIndex+1:lbIndex-1);
  });
}

function lbApplyTransform(){
  const img=$('lb-img');
  if(!img) return;
  img.style.transform=`rotate(${lbRotation}deg) scale(${lbZoom})`;
  const zl=$('lb-zoom-level');
  if(zl) zl.textContent=lbZoom!==1?`${Math.round(lbZoom*100)}%`:'';
}

function openLightbox(images,startIndex=0){
  buildLightbox();
  lbImages=Array.isArray(images)?images:[images];
  lbIndex=startIndex;
  lbRotation=0; lbZoom=1;
  $('tcm-lightbox').classList.add('open');
  document.body.style.overflow='hidden';
  lbRender();
}
function closeLightbox(){
  $('tcm-lightbox')?.classList.remove('open');
  document.body.style.overflow='';
}
function lbGo(idx){
  if(lbImages.length<2) return;
  lbIndex=(idx+lbImages.length)%lbImages.length;
  lbRotation=0; lbZoom=1;
  lbApplyTransform();
  lbRender();
}
function lbRender(){
  const img=$('lb-img'),multi=lbImages.length>1;
  img.style.opacity='0';
  const ni=new Image();
  ni.onload=()=>{ img.src=ni.src; img.style.opacity='1'; };
  ni.src=lbImages[lbIndex];
  $('lb-prev').style.display=$('lb-next').style.display=multi?'block':'none';
  $('lb-dots').innerHTML=multi?lbImages.map((_,i)=>`<button class="lb-dot${i===lbIndex?' active':''}" onclick="lbGo(${i})"></button>`).join(''):'';
  $('lb-counter').textContent=multi?`${lbIndex+1} / ${lbImages.length}`:'';
  $('lb-hint').textContent=multi?'← swipe for more →':'Tap outside to close';
}
function initLightbox(){
  document.querySelectorAll('.card-img').forEach(el=>{
    el.style.cursor='pointer';
    const img=el.querySelector('img');
    if(img) img.style.pointerEvents='none';
  });
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function escAttr(s){ return s.replace(/'/g,"\\'").replace(/"/g,'&quot;'); }

/* ══════════════════════════════════════════
   HERO SLIDESHOW
══════════════════════════════════════════ */
function initSlideshow(){
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.slide-dot');
  if(!slides.length) return;

  let current = 0;
  let timer   = null;

  function goTo(idx){
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function next(){ goTo(current + 1); }
  function prev(){ goTo(current - 1); }

  function startAuto(){
    clearInterval(timer);
    timer = setInterval(next, 4000);
  }
  function pauseAuto(){ clearInterval(timer); }

  $('slide-next')?.addEventListener('click', ()=>{ next(); startAuto(); });
  $('slide-prev')?.addEventListener('click', ()=>{ prev(); startAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', ()=>{ goTo(i); startAuto(); });
  });

  // Pause on hover
  const track = $('slides-track');
  track?.addEventListener('mouseenter', pauseAuto);
  track?.addEventListener('mouseleave', startAuto);

  // Touch swipe on slideshow
  let touchStartX = 0;
  track?.addEventListener('touchstart', e=>{ touchStartX=e.touches[0].clientX; },{passive:true});
  track?.addEventListener('touchend', e=>{
    const dx = e.changedTouches[0].clientX - touchStartX;
    if(Math.abs(dx)>40){ dx<0?next():prev(); startAuto(); }
  });

  startAuto();
}

/* ══════════════════════════════════════════
   BOOT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  syncWishlistUI();
  renderCart();
  updateCartBadge();
  initFilters();
  initSearch();
  initEnquire();
  initCartButtons();
  initBuyNow();
  initWishlistButtons();
  initFloatingWA();
  initInsights();
  initLightbox();
  initSlideshow();
});
