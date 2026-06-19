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
    "body.ab-detail .ab-price{font-family:'Montserrat',sans-serif;font-weight:800;font-size:2.6rem;color:var(--abd-red);line-height:1;margin:.3rem 0;}",
    "body.ab-detail .ab-status{display:inline-block;background:var(--abd-red);color:#fff;font-family:'Montserrat',sans-serif;font-weight:700;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;padding:5px 12px;border-radius:4px;margin-bottom:8px;}",
    "body.ab-detail .ab-mls{color:var(--abd-muted);font-size:.72rem;letter-spacing:.05em;text-transform:uppercase;margin-top:4px;}",
    "body.ab-detail a.ab-schedule{background:var(--abd-red)!important;color:#fff!important;border:0;border-radius:4px;font-family:'Montserrat',sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.04em;text-transform:uppercase;padding:13px 26px;cursor:pointer;text-decoration:none!important;display:inline-block;}",
    "body.ab-detail a.ab-schedule:hover{background:var(--abd-red-dark)!important;}",
    "body.ab-detail .ab-about{display:grid;grid-template-columns:1fr 320px;gap:40px;align-items:start;margin:36px auto;max-width:1200px;}",
    "body.ab-detail #IDX-detailsDescription{font-size:.92rem;line-height:1.8;color:#333;border:0!important;}",
    "body.ab-detail .ab-stats{background:#f7f7f7;border-top:3px solid var(--abd-red);padding:8px 22px;}",
    "body.ab-detail .ab-stat{display:flex;justify-content:space-between;align-items:baseline;padding:14px 0;border-bottom:1px solid #e9e9e9;}",
    "body.ab-detail .ab-stat:last-child{border-bottom:0;}",
    "body.ab-detail .ab-stat b{font-family:'Montserrat',sans-serif;font-weight:800;font-size:1.15rem;color:var(--abd-ink);}",
    "body.ab-detail .ab-stat span{font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--abd-muted);}",
    "body.ab-detail .ab-feat-title,body.ab-detail .ab-section-title{text-align:center;font-family:'Montserrat',sans-serif;font-weight:800;text-transform:uppercase;font-size:1.6rem;margin:34px 0 6px;}",
    "body.ab-detail .ab-feat-title{margin-bottom:24px;}",
    "body.ab-detail [id^='IDX-panel-heading-']{font-family:'Montserrat',sans-serif!important;font-weight:800!important;text-transform:uppercase;font-size:1rem!important;color:var(--abd-ink)!important;border-bottom:2px solid var(--abd-red)!important;padding-bottom:8px;margin-bottom:10px;background:none!important;}",
    "body.ab-detail #IDX-fieldsWrapper{column-count:3;column-gap:40px;}",
    "body.ab-detail .ab-section{max-width:1200px;margin:40px auto;padding:0 20px;}",
    "body.ab-detail .ab-section-sub{text-align:center;color:var(--abd-muted);font-size:.88rem;margin-bottom:24px;}",
    "body.ab-detail .ab-mc{display:grid;grid-template-columns:1fr 320px;gap:24px;border:1px solid var(--abd-line);border-radius:10px;padding:28px;}",
    "body.ab-detail .ab-mc-row{margin-bottom:18px;}",
    "body.ab-detail .ab-mc-row label{display:flex;justify-content:space-between;font-size:.78rem;font-weight:700;font-family:'Montserrat',sans-serif;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px;color:var(--abd-ink);}",
    "body.ab-detail .ab-mc-row label span{color:var(--abd-red);}",
    "body.ab-detail .ab-mc input[type=range]{width:100%;accent-color:var(--abd-red);}",
    "body.ab-detail .ab-mc-out{background:#111;border-radius:10px;color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:24px;text-align:center;}",
    "body.ab-detail .ab-mc-out small{font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:#bbb;}",
    "body.ab-detail .ab-mc-out b{font-family:'Montserrat',sans-serif;font-weight:800;font-size:2.4rem;color:var(--abd-red);}",
    "body.ab-detail .ab-disclaimer{text-align:center;color:var(--abd-muted);font-size:.72rem;max-width:760px;margin:14px auto 0;line-height:1.6;}",
    "body.ab-detail .ab-map{width:100%;height:420px;border:0;border-radius:10px;}",
    "body.ab-detail #ab-connect{background:#0e0e0e;color:#fff;padding:56px 0;margin-top:48px;}",
    "body.ab-detail #ab-connect .ab-connect-inner{max-width:1200px;margin:0 auto;padding:0 20px;}",
    "body.ab-detail .ab-inquiry{border-left:4px solid var(--abd-red);background:rgba(183,37,69,.16);padding:16px 20px;border-radius:4px;margin-bottom:28px;}",
    "body.ab-detail .ab-inquiry small{display:block;color:#bbb;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px;}",
    "body.ab-detail .ab-inquiry b{font-family:'Montserrat',sans-serif;font-size:1rem;color:#fff;}",
    "body.ab-detail .ab-cc-grid{display:grid;grid-template-columns:1fr 1fr;gap:44px;}",
    "body.ab-detail #ab-connect h2{font-family:'Montserrat',sans-serif;font-weight:800;text-transform:uppercase;font-size:2rem;color:#fff;margin-bottom:12px;}",
    "body.ab-detail #ab-connect p,body.ab-detail #ab-connect label,body.ab-detail #ab-connect .IDX-detailsAgentText,body.ab-detail #ab-connect *{color:#ddd;}",
    "body.ab-detail #ab-connect input,body.ab-detail #ab-connect textarea,body.ab-detail #ab-connect select{color:#111!important;background:#fff!important;}",
    "body.ab-detail #ab-connect button,body.ab-detail #ab-connect input[type=submit]{background:var(--abd-red)!important;color:#fff!important;border:0!important;}",
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

  function build() {
    if (document.getElementById('ab-headerbox')) return;
    injectCSS();
    document.body.classList.add('ab-detail');

    var addr = (val('address') + ', ' + val('cityName') + ', ' + val('state') + ' ' + val('zipcode')).replace(/\s+/g, ' ').trim();
    var lid = val('listingID');
    var priceNum = parseInt(String(val('listingPrice')).replace(/[^0-9]/g, ''), 10) || 0;
    var region = (document.querySelector('#IDX-detailsAddressRegion') || {}).textContent || '';
    var beds = (region.match(/(\d+)\s*BD/i) || [])[1] || '';
    var baths = (region.match(/(\d+)\s*BTH/i) || [])[1] || '';
    var sqft = fieldNum('totalSqft');
    var year = fieldNum('yearBuilt');
    var ppsfRaw = fieldNum('pricePerSqFt');
    var ppsf = ppsfRaw ? ('$' + Math.round(parseFloat(ppsfRaw.replace(/,/g, ''))).toLocaleString()) : '';

    /* 1) price header */
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
    }

    /* 2) About + stats */
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

    /* 3) Features title */
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

    /* 4) Mortgage calculator */
    if (priceNum && !document.getElementById('ab-mc-sec')) {
      var mc = document.createElement('div'); mc.id = 'ab-mc-sec'; mc.className = 'ab-section';
      mc.innerHTML = '<div class="ab-section-title">Mortgage Calculator</div>' +
        '<div class="ab-section-sub">Estimate your monthly payment</div>' +
        '<div class="ab-mc"><div>' +
        '<div class="ab-mc-row"><label>Home Price <span id="mc-hp">' + money(priceNum) + '</span></label><input id="mc-price" type="range" min="' + Math.round(priceNum * 0.3) + '" max="' + Math.round(priceNum * 1.5) + '" value="' + priceNum + '" step="1000"></div>' +
        '<div class="ab-mc-row"><label>Down Payment <span id="mc-dpl">20% &middot; ' + money(Math.round(priceNum * 0.2)) + '</span></label><input id="mc-dp" type="range" min="0" max="50" value="20" step="1"></div>' +
        '<div class="ab-mc-row"><label>Loan Term <span id="mc-tl">30 years</span></label><input id="mc-term" type="range" min="10" max="30" value="30" step="5"></div>' +
        '<div class="ab-mc-row"><label>Interest Rate <span id="mc-rl">6.5%</span></label><input id="mc-rate" type="range" min="3" max="9" value="6.5" step="0.1"></div>' +
        '</div><div class="ab-mc-out"><small>Estimated Monthly Payment</small><b id="mc-pay"></b></div></div>' +
        '<p class="ab-disclaimer">Estimates only. Taxes and insurance vary by county and provider; figures here are a planning placeholder. For an accurate quote, confirm rates with your lender and a licensed insurance agent.</p>';
      appendAfterWrapper(mc);
      var calc = function () {
        var P = +document.getElementById('mc-price').value,
          dp = +document.getElementById('mc-dp').value,
          term = +document.getElementById('mc-term').value,
          rate = +document.getElementById('mc-rate').value / 100 / 12;
        var loan = P * (1 - dp / 100), n = term * 12,
          pi = rate > 0 ? loan * rate / (1 - Math.pow(1 + rate, -n)) : loan / n,
          tax = P * 0.011 / 12, ins = 1400 / 12;
        document.getElementById('mc-hp').textContent = money(P);
        document.getElementById('mc-dpl').innerHTML = dp + '% &middot; ' + money(Math.round(P * dp / 100));
        document.getElementById('mc-tl').textContent = term + ' years';
        document.getElementById('mc-rl').textContent = (+document.getElementById('mc-rate').value).toFixed(1) + '%';
        document.getElementById('mc-pay').textContent = money(Math.round(pi + tax + ins));
      };
      ['mc-price', 'mc-dp', 'mc-term', 'mc-rate'].forEach(function (id) { document.getElementById(id).addEventListener('input', calc); });
      calc();
    }

    /* 5) Location map */
    if (!document.getElementById('ab-map-sec')) {
      var ms = document.createElement('div'); ms.id = 'ab-map-sec'; ms.className = 'ab-section';
      ms.innerHTML = '<div class="ab-section-title">Location</div><div class="ab-section-sub">' + addr + '</div>' +
        '<iframe class="ab-map" loading="lazy" src="https://maps.google.com/maps?q=' + encodeURIComponent(addr) + '&z=14&output=embed"></iframe>';
      appendAfterWrapper(ms);
    }

    /* 6) Let's Connect (move IDX contact form + agent info) */
    if (!document.getElementById('ab-connect')) {
      var conn = document.createElement('div'); conn.id = 'ab-connect'; appendAfterWrapper(conn);
      var inner = document.createElement('div'); inner.className = 'ab-connect-inner'; conn.appendChild(inner);
      var banner = document.createElement('div'); banner.className = 'ab-inquiry';
      banner.innerHTML = "<small>You're inquiring about</small><b>" + addr + " (MLS# " + lid + ")</b>";
      inner.appendChild(banner);
      var grid = document.createElement('div'); grid.className = 'ab-cc-grid'; inner.appendChild(grid);
      var lcol = document.createElement('div');
      lcol.innerHTML = "<h2>Let's Connect</h2><p style='line-height:1.7;font-size:.9rem;'>Whether you have a quick question or you're ready to tour this home, I'm here to help. Fill out the form and I'll get right back to you.</p>";
      var agent = document.querySelector('#IDX-detailsAgentInfo');
      if (agent) lcol.appendChild(agent);
      grid.appendChild(lcol);
      var rcol = document.createElement('div');
      var contact = document.querySelector('#IDX-detailsContact');
      if (contact) rcol.appendChild(contact);
      grid.appendChild(rcol);
    }

    /* prefill message */
    var msg = document.querySelector('#IDX-detailscontactContactForm textarea');
    if (msg && !msg.value) {
      msg.value = "I'm interested in " + addr + " (MLS# " + lid + "). Please send me more information or help me schedule a showing.";
    }
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
