/* @Bethesda Residential — swipe photo galleries on IDX search result cards.
   Turns each result card's single cover photo into a native swipe gallery,
   pulling each listing's photos from its detail page (client-side, lazily). */
(function () {
  if (window.__atbGalleryLoaded) return;
  window.__atbGalleryLoaded = true;
  var MAXP = 12, RATIO = 56.4;

  var st = document.createElement('style');
  st.textContent =
    '.idx-listing-card__image-overlay{pointer-events:none!important;}' +
    '.atb-gal{position:relative;width:100%;height:0;padding-bottom:' + RATIO + '%;overflow:hidden;background:#e9e9ee;}' +
    '.atb-gal__track{position:absolute;inset:0;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;}' +
    '.atb-gal__track::-webkit-scrollbar{display:none;height:0;width:0;}' +
    '.atb-gal__slide{flex:0 0 100%;width:100%;height:100%;scroll-snap-align:start;}' +
    '.atb-gal__slide img{width:100%;height:100%;object-fit:cover;display:block;}' +
    '.atb-gal__dots{position:absolute;left:0;right:0;bottom:7px;display:flex;justify-content:center;gap:5px;z-index:4;pointer-events:none;}' +
    '.atb-gal__dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.5);box-shadow:0 0 2px rgba(0,0,0,.6);}' +
    '.atb-gal__dots i.on{background:#fff;}' +
    '.atb-gal__count{position:absolute;right:8px;top:8px;background:rgba(0,0,0,.55);color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:11px;z-index:4;pointer-events:none;}';
  (document.head || document.documentElement).appendChild(st);

  function extract(html) {
    var m = html.match(/https:\/\/bright-media\d*\.prd\.brightmls\.com\/bright\/images\/[^"'\s\\)]+_(?:2048_1536|1024_768)[^"'\s\\)]+\.jpg/gi) || [];
    var seen = {}, out = [];
    m.forEach(function (u) { var id = (u.match(/\/(\d{6,})_/) || [])[1] || u; if (!seen[id]) { seen[id] = 1; out.push(u); } });
    return out.slice(0, MAXP);
  }

  function build(card) {
    if (card.__galDone) return;
    card.__galDone = true;
    var link = card.querySelector('.idx-listing-card__link');
    var cover = card.querySelector('.idx-listing-card__image');
    if (!link || !cover) return;
    cover.loading = 'eager';
    var gal = document.createElement('div'); gal.className = 'atb-gal';
    var track = document.createElement('div'); track.className = 'atb-gal__track';
    var s0 = document.createElement('div'); s0.className = 'atb-gal__slide';
    cover.parentNode.insertBefore(gal, cover); s0.appendChild(cover); track.appendChild(s0); gal.appendChild(track);
    var count = document.createElement('div'); count.className = 'atb-gal__count'; count.textContent = ''; gal.appendChild(count);
    var dots = document.createElement('div'); dots.className = 'atb-gal__dots'; gal.appendChild(dots);

    fetch(link.href, { credentials: 'include' }).then(function (r) { return r.text(); }).then(function (html) {
      var photos = extract(html);
      if (photos.length < 2) return;
      for (var i = 1; i < photos.length; i++) {
        var sl = document.createElement('div'); sl.className = 'atb-gal__slide';
        var im = document.createElement('img');
        if (i <= 2) { im.src = photos[i]; } else { im.setAttribute('data-src', photos[i]); }
        sl.appendChild(im); track.appendChild(sl);
      }
      var N = photos.length;
      count.textContent = '1 / ' + N;
      var dotN = Math.min(N, 8);
      for (var d = 0; d < dotN; d++) { var di = document.createElement('i'); if (d === 0) di.className = 'on'; dots.appendChild(di); }
      var imgs = track.querySelectorAll('img');
      track.addEventListener('scroll', function () {
        requestAnimationFrame(function () {
          var idx = Math.round(track.scrollLeft / track.clientWidth);
          if (idx < 0) idx = 0; if (idx > N - 1) idx = N - 1;
          count.textContent = (idx + 1) + ' / ' + N;
          var act = Math.round(idx / (N - 1) * (dotN - 1));
          for (var k = 0; k < dots.children.length; k++) dots.children[k].className = (k === act ? 'on' : '');
          [idx, idx + 1, idx + 2].forEach(function (j) { var im = imgs[j]; if (im && im.getAttribute('data-src')) { im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); } });
        });
      }, { passive: true });
    }).catch(function () {});
  }

  function tick() {
    var cards = document.querySelectorAll('.idx-listing-card');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (c.__galDone) continue;
      var r = c.getBoundingClientRect();
      if (r.bottom > -200 && r.top < (window.innerHeight || 800) + 800) build(c);
    }
  }

  function start() {
    tick();
    var sc = null;
    window.addEventListener('scroll', function () { if (sc) return; sc = setTimeout(function () { sc = null; tick(); }, 120); }, { passive: true });
    var mo = new MutationObserver(function () { if (sc) return; sc = setTimeout(function () { sc = null; tick(); }, 150); });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
