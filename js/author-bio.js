(function () {
  // Remove any existing plain-text "About Pey Behin" paragraph
  document.querySelectorAll('.post-body p, article p').forEach(function (p) {
    if (p.textContent.trim().startsWith('About Pey Behin')) {
      var next = p.nextElementSibling;
      if (next && next.tagName === 'P') next.remove();
      p.remove();
    }
  });

  // Build author bio card
  var card = document.createElement('div');
  card.className = 'author-bio-card';
  card.innerHTML = [
    '<img class="author-bio-photo" src="/images/pey-behin-headshot-square.jpg" alt="Pey Behin, Realtor — Bethesda MD" />',
    '<div class="author-bio-content">',
      '<div class="author-bio-name">Pey Behin</div>',
      '<div class="author-bio-title">REALTOR® · Licensed in MD, DC &amp; VA · RLAH @properties</div>',
      '<p class="author-bio-text">',
        'Pey Behin has been a licensed real estate agent in the DC Metro area since 2014. ',
        'He specializes in Bethesda, Chevy Chase, Potomac, and Northern Virginia — helping buyers ',
        'navigate school districts and competitive offers, and helping sellers price and position ',
        'their homes for the best possible outcome.',
      '</p>',
      '<div class="author-bio-licenses">',
        '<span>MD #0653490</span>',
        '<span>VA #0225218564</span>',
        '<span>DC #SP98375053</span>',
      '</div>',
      '<div class="author-bio-links">',
        '<a href="/about/">About Pey</a>',
        '<a href="/contact/">Work With Pey</a>',
      '</div>',
    '</div>'
  ].join('');

  // Inject styles
  var style = document.createElement('style');
  style.textContent = [
    '.author-bio-card{display:flex;gap:24px;align-items:flex-start;background:#f7f7f5;border-left:4px solid #d60717;padding:28px 28px 24px;margin:48px 0 32px;border-radius:2px;max-width:860px;}',
    '.author-bio-photo{width:96px;height:96px;border-radius:50%;object-fit:cover;object-position:top;flex-shrink:0;}',
    '.author-bio-content{flex:1;min-width:0;}',
    '.author-bio-name{font-family:"Montserrat",sans-serif;font-weight:900;font-size:1rem;color:#0a0a0a;margin-bottom:3px;}',
    '.author-bio-title{font-family:"Montserrat",sans-serif;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#d60717;margin-bottom:10px;}',
    '.author-bio-text{font-family:"Montserrat",sans-serif;font-size:.85rem;color:#444;line-height:1.7;margin:0 0 12px;}',
    '.author-bio-licenses{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}',
    '.author-bio-licenses span{font-family:"Montserrat",sans-serif;font-size:.68rem;font-weight:700;color:#666;background:#e8e8e8;padding:3px 8px;border-radius:2px;}',
    '.author-bio-links{display:flex;gap:12px;}',
    '.author-bio-links a{font-family:"Montserrat",sans-serif;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#d60717;text-decoration:none;border-bottom:1px solid #d60717;padding-bottom:1px;}',
    '.author-bio-links a:hover{opacity:.75;}',
    '@media(max-width:600px){.author-bio-card{flex-direction:column;}.author-bio-photo{width:72px;height:72px;}}'
  ].join('');
  document.head.appendChild(style);

  // Find insertion point — after post body, before CTA section
  var target = document.querySelector('.post-body') || document.querySelector('article .entry-content') || document.querySelector('article');
  if (target) {
    target.parentNode.insertBefore(card, target.nextSibling);
  }
})();
