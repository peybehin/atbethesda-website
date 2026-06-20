/* @Bethesda — IDX listing-detail template (mirrors Cody Posey layout, @Bethesda branding)
   Hosted on atbethesda.com, referenced from the IDX Broker global wrapper.
   Runs only on /idx/details/ pages. Safe to edit + redeploy independently. */
(function () {
  'use strict';
  if (!/\/idx\/details\//.test(location.pathname)) return;
  if (window.__abDetailInit) return;
  window.__abDetailInit = true;

  var CSS = [
    "body.ab-detail{--abd-red:#B72545;--abd-red-dark:#8f1c36;--abd-ink:#111;--abd-muted:#777;--abd-line:#e4e4e4;background:#fff;}",
    "body.ab-detail #IDX-detailsAside{display:none!important;}",
    "body.ab-detail #IDX-detailsMain{width:100%!important;max-width:100%!important;float:none!important;}",
    "body.ab-detail #IDX-detailsWrapper,body.ab-detail #IDX-detailsMain{max-width:1200px;margin:0 auto;}",
    "body.ab-detail #IDX-detailsAddressStreet{font-family:'Montserrat',sans-serif;font-weight:800;font-size:1.7rem;color:var(--abd-ink);text-transform:uppercase;}",
    "body.ab-detail #IDX-detailsAddressRegion{color:var(--abd-muted);font-size:.95rem;}",
    /* breadcrumb */
    "body.ab-detail .ab-crumb{max-width:1200px;margin:0 auto;padding:14px 20px 0;font-size:.72rem;letter-spacing:.04em;text-transform:uppercase;color:var(--abd-muted);font-family:'Montserrat',sans-serif;font-weight:600;}",
    "body.ab-detail .ab-crumb a{color:var(--abd-muted);text-decoration:none;}",
    "body.ab-detail .ab-crumb a:hover{color:var(--abd-red);}",
    "body.ab-detail .ab-crumb span{margin:0 8px;color:#ccc;}",
    /* swiper gallery */
    "body.ab-detail.ab-has-swiper #IDX-primaryPhoto,body.ab-detail.ab-has-swiper #IDX-detailsSlidesActions{display:none!important;}",
    "body.ab-detail #IDX-detailsShareThis{display:none!important;}",
    "body.ab-detail .ab-swiper{width:100%;max-width:1200px;margin:8px auto 14px;border-radius:8px;overflow:hidden;position:relative;}",
    "body.ab-detail .ab-swiper .swiper-wrapper{display:flex;}",
    "body.ab-detail .ab-swiper .swiper-slide{min-width:100%;}",
    "body.ab-detail .ab-swiper .swiper-slide img{width:100%;height:540px;object-fit:cover;display:block;}",
    "body.ab-detail .ab-swiper .swiper-button-prev,body.ab-detail .ab-swiper .swiper-button-next{color:#fff;}",
    "body.ab-detail .ab-swiper .swiper-pagination-bullet{background:#fff;opacity:.7;}",
    "body.ab-detail .ab-swiper .swiper-pagination-bullet-active{background:var(--abd-red);opacity:1;}",
    "@media(max-width:768px){body.ab-detail .ab-swiper .swiper-slide img{height:300px;}}",
    /* price header */
    "body.ab-detail .ab-price{font-family:'Montserrat',sans-serif;font-weight:800;font-size:2.6rem;color:var(--abd-red);line-height:1;margin:.3rem 0;}",
    "body.ab-detail .ab-status{display:inline-block;background:var(--abd-red);color:#fff;font-family:'Montserrat',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;padding:5px 12px;border-radius:4px;margin-bottom:8px;}",
    "body.ab-detail .ab-mls{color:var(--abd-muted);font-size:.72rem;letter-spacing:.05em;text-transform:uppercase;margin-top:4px;}",
    "body.ab-detail a.ab-schedule{background:var(--abd-red)!important;color:#fff!important;border:0;border-radius:4px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.04em;text-transform:uppercase;padding:13px 26px;cursor:pointer;text-decoration:none!important;display:inline-block;}",
    "body.ab-detail a.ab-schedule:hover{background:var(--abd-red-dark)!important;}",
    /* share button (in header actions) */
    "body.ab-detail .ab-share-btn{display:inline-flex;align-items:center;gap:7px;background:#fff;color:var(--abd-ink);border:1px solid var(--abd-line);border-radius:30px;padding:11px 20px;font-family:'Montserrat',sans-serif;font-weight:600;font-size:.72rem;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;margin-left:8px;}",
    "body.ab-detail .ab-share-btn:hover{border-color:var(--abd-red);color:var(--abd-red);}",
    "body.ab-detail .ab-share-btn svg{width:15px;height:15px;}",
    /* about + stats */
    "body.ab-detail #IDX-detailsDescription{font-size:.92rem;line-height:1.8;color:#333;border:0!important;}",
    "body.ab-detail .ab-about{display:grid;grid-template-columns:1fr 320px;gap:40px;align-items:start;margin:36px auto;max-width:1200px;}",
    "body.ab-detail .ab-stats{background:#f7f7f7;border-top:3px solid var(--abd-red);padding:8px 22px;}",
    "body.ab-detail .ab-stat{display:flex;justify-content:space-between;align-items:baseline;padding:14px 0;border-bottom:1px solid #e9e9e9;}",
    "body.ab-detail .ab-stat:last-child{border-bottom:0;}",
    "body.ab-detail .ab-stat b{font-family:'Montserrat',sans-serif;font-weight:800;font-size:1.15rem;color:var(--abd-ink);}",
    "body.ab-detail .ab-stat span{font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--abd-muted);}",
    /* features */
    "body.ab-detail .ab-feat-title,body.ab-detail .ab-section-title{text-align:center;font-family:'Montserrat',sans-serif;font-weight:800;text-transform:uppercase;font-size:1.6rem;margin:34px 0 6px;}",
    "body.ab-detail .ab-feat-title{margin-bottom:24px;}",
    "body.ab-detail [id^='IDX-panel-heading-']{font-family:'Montserrat',sans-serif!important;font-weight:800!important;text-transform:uppercase;font-size:1rem!important;color:var(--abd-ink)!important;border-bottom:2px solid var(--abd-red)!important;padding-bottom:8px;margin-bottom:10px;background:none!important;}",
    "body.ab-detail #IDX-fieldsWrapper{column-count:3;column-gap:40px;}",
    /* center Basic Information panel */
    "body.ab-detail #IDX-detailsBasicInfo{max-width:660px;margin:0 auto 26px;text-align:center;}",
    "body.ab-detail #IDX-detailsBasicInfo [id^='IDX-panel-heading-']{text-align:center;}",
    "body.ab-detail #IDX-detailsBasicInfo .IDX-field,body.ab-detail #IDX-detailsBasicInfo [class*='IDX-field-']{justify-content:center;gap:8px;}",
    /* injected sections */
    "body.ab-detail .ab-section{max-width:1200px;margin:40px auto;padding:0 20px;}",
    "body.ab-detail .ab-section-sub{text-align:center;color:var(--abd-muted);font-size:.88rem;margin-bottom:24px;}",
    "body.ab-detail .ab-mc{display:grid;grid-template-columns:1fr 320px;gap:24px;border:1px solid var(--abd-line);border-radius:10px;padding:28px;}",
    "body.ab-detail .ab-mc-row{margin-bottom:16px;}",
    "body.ab-detail .ab-mc-row label{display:flex;justify-content:space-between;font-size:.78rem;font-weight:700;font-family:'Montserrat',sans-serif;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;color:var(--abd-ink);}",
    "body.ab-detail .ab-mc-row label span{color:var(--abd-red);}",
    "body.ab-detail .ab-mc input[type=range]{width:100%;accent-color:var(--abd-red);}",
    "body.ab-detail .ab-mc-out{background:#111;border-radius:10px;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:24px;text-align:center;}",
    "body.ab-detail .ab-mc-out small{font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:#bbb;}",
    "body.ab-detail .ab-mc-out b{font-family:'Montserrat',sans-serif;font-weight:800;font-size:2.4rem;color:var(--abd-red);}",
    "body.ab-detail .ab-disclaimer{text-align:center;color:var(--abd-muted);font-size:.72rem;max-width:760px;margin:14px auto 0;line-height:1.6;}",
    "body.ab-detail .ab-map{display:block!important;width:100%!important;min-height:420px;height:420px!important;border:0;border-radius:10px;}",
    /* let's connect */
    "body.ab-detail #ab-connect{background:#0a0a0a;color:#fff;padding:56px 0;margin-top:48px;margin-bottom:0!important;}",
    "body.ab-detail .idx-content-area>img{display:none!important;}",
    "body.ab-detail #ab-connect .ab-connect-inner{max-width:1280px;margin:0 auto;padding:0 24px;}",
    "@media(max-width:1320px){body.ab-detail #ab-connect .ab-connect-inner{padding:0 22px;}}",
    "body.ab-detail .ab-inquiry{display:flex;align-items:center;gap:14px;border:1px solid var(--abd-red);border-left:4px solid var(--abd-red);background:rgba(183,37,69,.10);padding:16px 22px;border-radius:6px;margin-bottom:34px;}",
    "body.ab-detail .ab-inquiry .ab-pin{width:22px;height:22px;color:var(--abd-red);flex:0 0 auto;}",
    "body.ab-detail .ab-inquiry small{display:block;color:#bbb;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px;}",
    "body.ab-detail .ab-inquiry b{font-family:'Montserrat',sans-serif;font-size:1.05rem;color:#fff;}",
    "body.ab-detail .ab-cc-grid{display:grid;grid-template-columns:1fr 1fr;gap:44px;}",
    "body.ab-detail #ab-connect h2{font-family:'Montserrat',sans-serif;font-weight:800;text-transform:uppercase;font-size:clamp(2.6rem,4.6vw,4rem);line-height:1.02;color:#fff;margin-bottom:16px;}",
    "body.ab-detail #ab-connect p,body.ab-detail #ab-connect *{color:#ddd;}",
    "body.ab-detail #ab-connect label{display:block;text-transform:uppercase;font-family:'Montserrat',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.06em;color:#fff!important;margin-bottom:8px;}",
    "body.ab-detail #ab-connect label .ab-req,body.ab-detail #ab-connect label .IDX-required,body.ab-detail #ab-connect .IDX-required{color:var(--abd-red)!important;}",
    "body.ab-detail #ab-connect input,body.ab-detail #ab-connect textarea,body.ab-detail #ab-connect select{color:#fff!important;background:#1b1b1b!important;border:1px solid #333!important;border-radius:6px!important;padding:15px 17px!important;font-size:.96rem!important;height:auto!important;min-height:56px;width:100%;box-sizing:border-box;}",
    "body.ab-detail #ab-connect textarea{min-height:150px!important;resize:vertical;line-height:1.5;}",
    /* remove the white box border around the IDX form (item 2) */
    "body.ab-detail #ab-connect #IDX-detailscontactContactForm,body.ab-detail #ab-connect form.IDX-contactForm,body.ab-detail #ab-connect .IDX-contactForm{border:0!important;background:transparent!important;padding:0!important;box-shadow:none!important;}",
    /* force inquiry pin + contact icons red (override #ab-connect * grey) */
    "body.ab-detail #ab-connect .ab-pin,body.ab-detail #ab-connect .ab-contact-line svg{color:var(--abd-red)!important;stroke:var(--abd-red)!important;}",
    /* de-emphasized, compliant MLS / IDX fine print (item 5) */
    "body.ab-detail .ab-mls-fineprint{background:#0e0e0e!important;color:#5d5d5d!important;font-size:.62rem!important;line-height:1.6!important;text-align:center!important;padding:14px 22px!important;border:0!important;margin:0!important;}",
    "body.ab-detail .ab-mls-fineprint a{color:#7a7a7a!important;}",
    "body.ab-detail .ab-idx-credit,footer .ab-idx-credit{font-size:9px!important;line-height:1.4!important;color:#5a5a5a!important;text-align:center!important;background:transparent!important;border:0!important;padding:8px 12px 10px!important;margin:0!important;opacity:.8;}",
    "body.ab-detail .ab-idx-credit a,footer .ab-idx-credit a{color:#6a6a6a!important;text-decoration:none;}",
    "body.ab-detail #ab-connect input::placeholder,body.ab-detail #ab-connect textarea::placeholder{color:#7a7a7a;}",
    "body.ab-detail #ab-connect input:focus,body.ab-detail #ab-connect textarea:focus{border-color:var(--abd-red)!important;outline:none;}",
    "body.ab-detail #ab-connect .ab-ep-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;}",
    /* align + even spacing: kill IDX's 30px side margins, make every control full-width & flush */
    "body.ab-detail #ab-connect .IDX-customRegistrationFields{display:flex!important;flex-direction:column!important;gap:20px!important;margin:0!important;padding:0!important;}",
    "body.ab-detail #ab-connect .IDX-customRegistrationFields>div{margin-left:0!important;margin-right:0!important;width:100%!important;box-sizing:border-box!important;}",
    "body.ab-detail #ab-connect .IDX-form-group--PL{margin-left:0!important;margin-right:0!important;width:100%!important;}",
    "body.ab-detail #ab-connect .IDX-message-column{margin:0!important;padding:0!important;}",
    "body.ab-detail #ab-connect .IDX-message-column .IDX-form-group--PL{margin:0!important;width:100%!important;}",
    "body.ab-detail #ab-connect button,body.ab-detail #ab-connect input[type=submit]{background:var(--abd-red)!important;color:#fff!important;border:0!important;border-radius:4px!important;padding:14px 28px!important;width:auto!important;font-family:'Montserrat',sans-serif;font-weight:700;letter-spacing:.05em;text-transform:uppercase;cursor:pointer;}",
    "@media(max-width:600px){body.ab-detail #ab-connect .ab-ep-row{grid-template-columns:1fr;}}",
    "body.ab-detail #ab-connect .IDX-detailsPageTitle{display:none!important;}",
    "body.ab-detail #IDX-detailsAgentInfo{display:none!important;}",
    "body.ab-detail #ab-connect .IDX-contactInfo{display:none!important;}",
    "body.ab-detail #ab-connect .IDX-contact-form__title{display:none!important;}",
    "body.ab-detail .IDX-googleRecaptchaPolicy{display:none!important;}",
    "body.ab-detail .ab-contact-line{display:flex;align-items:center;gap:10px;margin:12px 0;font-size:.95rem;}",
    "body.ab-detail .ab-contact-line svg{width:16px;height:16px;color:var(--abd-red);flex:0 0 auto;}",
    "body.ab-detail .ab-contact-line a{color:#fff!important;text-decoration:none;}",
    "body.ab-detail .ab-contact-line a:hover{color:var(--abd-red)!important;}",
    "@media(max-width:900px){body.ab-detail #IDX-fieldsWrapper{column-count:1;}body.ab-detail .ab-about,body.ab-detail .ab-mc,body.ab-detail .ab-cc-grid{grid-template-columns:1fr;}}"
  ].join("\n");

  function injectCSS() {
    if (document.getElementById('ab-det-style')) return;
    var st = document.createElement('style');
    st.id = 'ab-det-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function val(name) {
    var f = document.querySelector('#IDX-detailscontactContactForm [name="' + name + '"]');
    return f ? f.value : '';
  }
  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
  function fieldNum(id) {
    var e = document.querySelector('#IDX-field-' + id);
    if (!e) return '';
    var m = e.textContent.replace(/\s+/g, ' ').trim().match(/([\d,\.]+)\s*$/);
    return m ? m[1] : '';
  }
  function hoaMonthly() {
    var els = document.querySelectorAll('[id^="IDX-field-"]');
    for (var i = 0; i < els.length; i++) {
      var t = els[i].textContent.replace(/\s+/g, ' ');
      if (/(condo\/?co-?op fee|hoa fee|association fee)/i.test(t) && /\d/.test(t)) {
        var m = t.match(/([\d,]+(?:\.\d+)?)/);
        if (!m) continue;
        var num = parseFloat(m[1].replace(/,/g, '')) || 0;
        if (/annual/i.test(t)) num = num / 12;
        if (num > 0) return Math.round(num);
      }
    }
    return 0;
  }

  function build() {
    if (document.getElementById('ab-headerbox')) return;
    injectCSS();
    document.body.classList.add('ab-detail');

    var street = val('address');
    var city = val('cityName');
    var addr = (street + ', ' + city + ', ' + val('state') + ' ' + val('zipcode')).replace(/\s+/g, ' ').trim();
    var lid = val('listingID');
    var priceNum = parseInt(String(val('listingPrice')).replace(/[^0-9]/g, ''), 10) || 0;
    var region = (document.querySelector('#IDX-detailsAddressRegion') || {}).textContent || '';
    function regCount(lbl) {
      var m = region.match(new RegExp('(\\d+)\\s*' + lbl, 'i'));
      if (!m) return '';
      var v = m[1];
      return v.length > 2 ? v.slice(5) : v;
    }
    var beds = regCount('BD');
    var baths = fieldNum('totalBaths') || regCount('BTH');
    var sqft = fieldNum('totalSqft');
    var year = fieldNum('yearBuilt');
    var ppsfRaw = fieldNum('pricePerSqFt');
    var ppsf = ppsfRaw ? ('$' + Math.round(parseFloat(ppsfRaw.replace(/,/g, ''))).toLocaleString()) : '';

    /* 0) breadcrumb */
    if (!document.querySelector('.ab-crumb')) {
      var crumb = document.createElement('div'); crumb.className = 'ab-crumb';
      crumb.innerHTML = '<a href="https://atbethesda.com/">Home</a><span>/</span>' +
        '<a href="https://search.atbethesda.com/idx/results/listings?city[]=' + encodeURIComponent(city) + '">' + (city || 'Listings') + '</a>' +
        '<span>/</span>' + (street || addr);
      var top = document.querySelector('#IDX-detailsHeader') || document.querySelector('#IDX-detailsAddress');
      if (top) top.parentNode.insertBefore(crumb, top);
    }

    /* 1) Swiper photo gallery */
    if (!document.querySelector('.ab-swiper')) {
      var seen = {}, photos = [];
      Array.prototype.forEach.call(document.querySelectorAll('#IDX-detailsPageContainer img'), function (im) {
        /* IDX runs its gallery as a loop-mode Swiper, which clones the LAST photo
           to the front (.swiper-slide-duplicate). Reading DOM order would then put
           that clone (often a floor plan) first. Skip the loop-clones (and our own
           gallery) so we keep IDX's real, server-rendered order. */
        if (im.closest('.swiper-slide-duplicate') || im.closest('.ab-swiper')) return;
        var s = (im.getAttribute('src') || im.getAttribute('data-src') || '').trim();
        if (!/brightmls/i.test(s)) return;
        var key = s.split('?')[0];
        if (seen[key]) return; seen[key] = 1; photos.push(s);
      });
      if (photos.length >= 2) {
        if (!document.getElementById('ab-swiper-css')) {
          var lk = document.createElement('link'); lk.id = 'ab-swiper-css'; lk.rel = 'stylesheet';
          lk.href = 'https://unpkg.com/swiper@11/swiper-bundle.min.css'; document.head.appendChild(lk);
        }
        var sw = document.createElement('div'); sw.className = 'ab-swiper swiper';
        sw.innerHTML = '<div class="swiper-wrapper">' +
          photos.map(function (u) { return '<div class="swiper-slide"><img src="' + u + '" alt="Listing photo"></div>'; }).join('') +
          '</div><div class="swiper-button-prev"></div><div class="swiper-button-next"></div><div class="swiper-pagination"></div>';
        var gal = document.querySelector('#IDX-primaryPhoto');
        if (gal) { gal.parentNode.insertBefore(sw, gal); document.body.classList.add('ab-has-swiper'); }
        var sj = document.createElement('script'); sj.src = 'https://unpkg.com/swiper@11/swiper-bundle.min.js';
        sj.onload = function () {
          try { new Swiper('.ab-swiper', { loop: true, pagination: { el: '.swiper-pagination', clickable: true }, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' } }); } catch (e) {}
        };
        document.body.appendChild(sj);
      }
    }

    /* 2) price header */
    var hdr = document.querySelector('#IDX-detailsAddress');
    if (hdr) {
      var box = document.createElement('div');
      box.id = 'ab-headerbox';
      box.style.margin = '14px 0 8px';
      box.innerHTML = '<div class="ab-status">Active</div>' +
        '<div class="ab-price">' + (priceNum ? money(priceNum) : '') + '</div>' +
        '<div class="ab-mls">MLS #' + lid + '</div>' +
        '<a href="#ab-connect" class="ab-schedule" style="margin-top:14px;">Schedule a Showing</a>';
      hdr.parentNode.insertBefore(box, hdr.nextSibling);
      var schedBtn = box.querySelector('.ab-schedule');
      if (schedBtn) schedBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var t = document.getElementById('ab-connect');
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      });
    }

    /* 2b) Share button next to Favorites / Print */
    var inlineBtns = document.querySelector('#IDX-detailsHeaderActions .IDX-inline-buttons') || document.querySelector('#IDX-detailsHeaderActions');
    if (inlineBtns && !document.querySelector('.ab-share-btn')) {
      var shb = document.createElement('button'); shb.type = 'button'; shb.className = 'ab-share-btn';
      shb.innerHTML = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 16V4'/><path d='M8 8l4-4 4 4'/><path d='M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4'/></svg> Share";
      shb.addEventListener('click', function () {
        if (navigator.share) { navigator.share({ title: street || addr, url: location.href }).catch(function () {}); }
        else if (navigator.clipboard) { navigator.clipboard.writeText(location.href); shb.lastChild.textContent = ' Link copied'; }
        else { window.prompt('Copy this link:', location.href); }
      });
      inlineBtns.appendChild(shb);
    }

    /* 3) About + stats */
    var desc = document.querySelector('#IDX-detailsDescription');
    if (desc && !document.querySelector('.ab-about')) {
      var wrap = document.createElement('div'); wrap.className = 'ab-about';
      var at = document.createElement('h2'); at.textContent = 'About This Property';
      at.style.cssText = "font-family:Montserrat;font-weight:800;text-transform:uppercase;font-size:1.4rem;margin-bottom:10px;";
      var left = document.createElement('div'); left.appendChild(at);
      desc.parentNode.insertBefore(wrap, desc); left.appendChild(desc); wrap.appendChild(left);
      var stats = [['Bedrooms', beds], ['Bathrooms', baths], ['Sq Ft', sqft], ['Year Built', year], ['Price / SqFt', ppsf]].filter(function (s) { return s[1]; });
      var sb = document.createElement('div'); sb.className = 'ab-stats';
      sb.innerHTML = stats.map(function (s) { return '<div class="ab-stat"><b>' + s[1] + '</b><span>' + s[0] + '</span></div>'; }).join('');
      wrap.appendChild(sb);
    }

    /* 4) Features title */
    var fields = document.querySelector('#IDX-detailsFields');
    if (fields && !document.querySelector('.ab-feat-title')) {
      var ft = document.createElement('div'); ft.className = 'ab-feat-title'; ft.textContent = 'Features & Amenities';
      fields.parentNode.insertBefore(ft, fields);
    }

    /* bottom full-width sections */
    var wrapper = document.querySelector('#IDX-detailsWrapper');
    var anchorParent = wrapper ? wrapper.parentNode : document.querySelector('#IDX-detailsPageContainer');
    function appendAfterWrapper(node) {
      if (wrapper && wrapper.nextSibling) anchorParent.insertBefore(node, wrapper.nextSibling);
      else anchorParent.appendChild(node);
      wrapper = node;
    }

    /* 5) Mortgage calculator (7 inputs) */
    if (priceNum && !document.getElementById('ab-mc-sec')) {
      var hoa0 = hoaMonthly();
      var mc = document.createElement('div'); mc.id = 'ab-mc-sec'; mc.className = 'ab-section';
      mc.innerHTML = '<div class="ab-section-title">Mortgage Calculator</div>' +
        '<div class="ab-section-sub">Estimate your monthly payment</div>' +
        '<div class="ab-mc"><div>' +
        '<div class="ab-mc-row"><label>Home Price <span id="mc-hp">' + money(priceNum) + '</span></label><input id="mc-price" type="range" min="' + Math.round(priceNum * 0.3) + '" max="' + Math.round(priceNum * 1.5) + '" value="' + priceNum + '" step="1000"></div>' +
        '<div class="ab-mc-row"><label>Down Payment <span id="mc-dpl">20% &middot; ' + money(Math.round(priceNum * 0.2)) + '</span></label><input id="mc-dp" type="range" min="0" max="50" value="20" step="1"></div>' +
        '<div class="ab-mc-row"><label>Loan Term <span id="mc-tl">30 years</span></label><input id="mc-term" type="range" min="10" max="30" value="30" step="5"></div>' +
        '<div class="ab-mc-row"><label>Interest Rate <span id="mc-rl">6.5%</span></label><input id="mc-rate" type="range" min="3" max="9" value="6.5" step="0.1"></div>' +
        '<div class="ab-mc-row"><label>Property Tax <span id="mc-txl">1.1% / yr</span></label><input id="mc-tax" type="range" min="0" max="3" value="1.1" step="0.05"></div>' +
        '<div class="ab-mc-row"><label>Homeowners Insurance <span id="mc-insl">$1,800 / yr</span></label><input id="mc-ins" type="range" min="0" max="6000" value="1800" step="100"></div>' +
        '<div class="ab-mc-row"><label>HOA / Condo Fee <span id="mc-hoal">' + money(hoa0) + ' / mo</span></label><input id="mc-hoa" type="range" min="0" max="2000" value="' + hoa0 + '" step="25"></div>' +
        '</div><div class="ab-mc-out"><small>Estimated Monthly Payment</small><b id="mc-pay"></b></div></div>' +
        '<p class="ab-disclaimer">Estimates only. Taxes, insurance, and fees vary by county, lender, and provider; figures here are a planning placeholder. For an accurate quote, confirm with your lender and a licensed insurance agent.</p>';
      appendAfterWrapper(mc);
      var calc = function () {
        var P = +document.getElementById('mc-price').value,
          dp = +document.getElementById('mc-dp').value,
          term = +document.getElementById('mc-term').value,
          ratePct = +document.getElementById('mc-rate').value,
          taxPct = +document.getElementById('mc-tax').value,
          insYr = +document.getElementById('mc-ins').value,
          hoaMo = +document.getElementById('mc-hoa').value;
        var rate = ratePct / 100 / 12, loan = P * (1 - dp / 100), n = term * 12;
        var pi = rate > 0 ? loan * rate / (1 - Math.pow(1 + rate, -n)) : loan / n;
        var tax = P * (taxPct / 100) / 12, ins = insYr / 12;
        document.getElementById('mc-hp').textContent = money(P);
        document.getElementById('mc-dpl').innerHTML = dp + '% &middot; ' + money(Math.round(P * dp / 100));
        document.getElementById('mc-tl').textContent = term + ' years';
        document.getElementById('mc-rl').textContent = ratePct.toFixed(1) + '%';
        document.getElementById('mc-txl').textContent = taxPct.toFixed(2) + '% / yr';
        document.getElementById('mc-insl').textContent = money(insYr) + ' / yr';
        document.getElementById('mc-hoal').textContent = money(hoaMo) + ' / mo';
        document.getElementById('mc-pay').textContent = money(Math.round(pi + tax + ins + hoaMo));
      };
      ['mc-price', 'mc-dp', 'mc-term', 'mc-rate', 'mc-tax', 'mc-ins', 'mc-hoa'].forEach(function (id) { document.getElementById(id).addEventListener('input', calc); });
      calc();
    }

    /* 6) Location map */
    if (!document.getElementById('ab-map-sec')) {
      var ms = document.createElement('div'); ms.id = 'ab-map-sec'; ms.className = 'ab-section';
      ms.innerHTML = '<div class="ab-section-title">Location</div><div class="ab-section-sub">' + addr + '</div>' +
        '<iframe class="ab-map" width="100%" height="420" loading="lazy" src="https://maps.google.com/maps?q=' + encodeURIComponent(addr) + '&t=&z=14&ie=UTF8&iwloc=&output=embed"></iframe>';
      appendAfterWrapper(ms);
    }

    /* 7) Let's Connect (move IDX contact form; custom phone/email on the left) */
    if (!document.getElementById('ab-connect')) {
      var conn = document.createElement('div'); conn.id = 'ab-connect'; appendAfterWrapper(conn);
      var inner = document.createElement('div'); inner.className = 'ab-connect-inner'; conn.appendChild(inner);
      var banner = document.createElement('div'); banner.className = 'ab-inquiry';
      banner.innerHTML = "<svg class='ab-pin' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>" +
        "<div><small>You're inquiring about:</small><b>" + addr + " (MLS# " + lid + ")</b></div>";
      inner.appendChild(banner);
      var grid = document.createElement('div'); grid.className = 'ab-cc-grid'; inner.appendChild(grid);
      var lcol = document.createElement('div');
      lcol.innerHTML = "<h2>Let's Connect</h2>" +
        "<p style='line-height:1.7;font-size:.9rem;'>Whether you have a quick question or you're ready to tour this home, I'm here to help. Fill out the form and I'll get right back to you.</p>" +
        "<div class='ab-contact-line'><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z'/></svg><a href='tel:+12026817454'>(202) 681-7454</a></div>" +
        "<div class='ab-contact-line'><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='4' width='20' height='16' rx='2'/><path d='m22 7-10 5L2 7'/></svg><a href='mailto:pey@peybehin.com'>pey@peybehin.com</a></div>";
      grid.appendChild(lcol);
      var rcol = document.createElement('div');
      var contact = document.querySelector('#IDX-detailsContact');
      if (contact) rcol.appendChild(contact);
      grid.appendChild(rcol);

      /* full-bleed: cancel the IDX container's side padding so the black spans edge-to-edge */
      var cont = document.getElementById('IDX-detailsPageContainer');
      if (cont) {
        var cs = getComputedStyle(cont);
        conn.style.marginLeft = '-' + (parseFloat(cs.paddingLeft) || 0) + 'px';
        conn.style.marginRight = '-' + (parseFloat(cs.paddingRight) || 0) + 'px';
      }
      conn.style.marginBottom = '0';
    }

    /* 8) Single-name form (match Cody): relabel First Name -> Name, hide all Last Name fields/labels
          (IDX renders the form more than once, so handle every instance) */
    Array.prototype.forEach.call(document.querySelectorAll('label'), function (l) {
      var t = (l.textContent || '').trim();
      if (/^first name/i.test(t)) l.innerHTML = 'Name <span class="ab-req">*</span>';
      else if (/^last name/i.test(t)) l.style.display = 'none';
    });
    Array.prototype.forEach.call(document.querySelectorAll('[name="firstName"]'), function (f) { f.placeholder = 'Your full name'; });
    Array.prototype.forEach.call(document.querySelectorAll('[name="lastName"]'), function (ln) {
      var g = ln.closest('.IDX-form-group--PL') || ln.parentElement;
      if (g) g.style.display = 'none';
    });
    var syncNames = function () {
      Array.prototype.forEach.call(document.querySelectorAll('#IDX-detailscontactContactForm'), function (form) {
        var f = form.querySelector('[name="firstName"]'), l = form.querySelector('[name="lastName"]');
        if (f && l) { var p = (f.value || '').trim().split(/\s+/); l.value = p.length > 1 ? p.slice(1).join(' ') : (p[0] || ''); }
      });
    };
    if (!document.__abSync) {
      document.__abSync = true;
      document.addEventListener('input', function (e) { if (e.target && e.target.name === 'firstName') syncNames(); });
      Array.prototype.forEach.call(document.querySelectorAll('#IDX-detailscontactContactForm'), function (form) { form.addEventListener('submit', syncNames); });
    }

    /* 9) Email + Phone on one row (match Cody) */
    var custom = document.querySelector('#ab-connect .IDX-customRegistrationFields');
    if (custom && !custom.querySelector('.ab-ep-row')) {
      var eInp = custom.querySelector('[name="email"]'), pInp = custom.querySelector('[name="phone"]');
      var eG = eInp ? eInp.closest('.IDX-form-group--PL') : null, pG = pInp ? pInp.closest('.IDX-form-group--PL') : null;
      var labs = Array.prototype.slice.call(custom.querySelectorAll('label'));
      var eL = labs.filter(function (l) { return /^email/i.test((l.textContent || '').trim()); })[0];
      var pL = labs.filter(function (l) { return /^phone/i.test((l.textContent || '').trim()); })[0];
      if (eG && pG) {
        var row = document.createElement('div'); row.className = 'ab-ep-row';
        var c1 = document.createElement('div'), c2 = document.createElement('div');
        if (eL) c1.appendChild(eL); c1.appendChild(eG);
        if (pL) c2.appendChild(pL); c2.appendChild(pG);
        row.appendChild(c1); row.appendChild(c2);
        custom.appendChild(row);
      }
      /* hide now-empty / hidden IDX field wrappers so vertical spacing stays even */
      Array.prototype.forEach.call(custom.children, function (ch) {
        if (ch.classList.contains('ab-ep-row')) return;
        var f = ch.querySelector('input:not([type=hidden]),textarea');
        if (!f || f.offsetParent === null) ch.style.display = 'none';
      });
    }

    /* prefill message */
    var msg = document.querySelector('#IDX-detailscontactContactForm textarea');
    if (msg && !msg.value) {
      msg.value = "I'd like to schedule a showing for " + addr + ". Please reach out with available times that work for me.";
    }

    /* 10) De-emphasize the required Bright MLS disclaimer + IDX Broker attribution so they
       read as subtle dark fine print (like Cody's footer) instead of a bright clashing block.
       These are kept for MLS / IDX compliance, just restyled. */
    styleFinePrint();
  }

  function styleFinePrint() {
    var footer = document.querySelector('footer') || document.querySelector('.IDX-footer, #IDX-footer');
    Array.prototype.forEach.call(document.querySelectorAll('body div'), function (d) {
      if (d.classList.contains('ab-fp-done')) return;
      if (d.closest('#ab-connect')) return;
      if (d.children.length > 4) return;
      var t = (d.innerText || '').replace(/\s+/g, ' ').trim();
      if (!t) return;
      // Bright MLS "deemed reliable" block: redundant (already in site footer) -> remove
      if (/information deemed reliable/i.test(t) && /bright mls/i.test(t) && t.length < 1000) {
        d.classList.add('ab-fp-done');
        d.style.display = 'none';
      }
      // IDX Broker attribution (required on the page) -> move tiny into the footer
      else if (/^data services provided by idx broker/i.test(t) && t.length < 70) {
        d.classList.add('ab-fp-done', 'ab-idx-credit');
        if (footer && d.parentNode !== footer) footer.appendChild(d);
      }
    });
  }

  /* IDX details content loads after the wrapper script; poll until ready */
  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    if ((document.querySelector('#IDX-detailscontactContactForm') && document.querySelector('#IDX-detailsAddress')) || tries > 50) {
      clearInterval(iv);
      try { build(); } catch (e) { if (window.console) console.warn('ab-detail build error', e); }
    }
  }, 250);
})();
