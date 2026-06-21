/* ============================================================
   @Bethesda Real Estate — Shared JavaScript
   ============================================================ */

// Nav scroll effect
(function () {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  });
})();

// Mobile menu toggle
(function () {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', menu.classList.contains('open'));
  });
})();

// Contact form handler (replace with real form endpoint)
function handleContactForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  // TODO: replace with Netlify Forms, Formspree, or EmailJS
  // For now show success state
  form.innerHTML = `
    <div style="text-align:center;padding:60px 20px;">
      <div style="font-size:2.5rem;margin-bottom:16px;">✓</div>
      <h3 style="font-size:1.3rem;margin-bottom:10px;">Thanks — got it!</h3>
      <p style="color:#555;line-height:1.6;">I'll be in touch shortly. If you need to reach me right away,
        call <a href="tel:+13016520643" style="color:#b72545;">(301) 652-0643</a>.</p>
    </div>`;
}

// Testimonials carousel
function initCarousel(trackId, totalSlides, autoMs) {
  const track = document.getElementById(trackId);
  if (!track) return;
  let current = 0;
  const dots = document.querySelectorAll('[data-carousel="' + trackId + '"]');

  function update() {
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  window['carousel_next_' + trackId] = () => { current = (current + 1) % totalSlides; update(); };
  window['carousel_prev_' + trackId] = () => { current = (current - 1 + totalSlides) % totalSlides; update(); };
  window['carousel_go_' + trackId] = (i) => { current = i; update(); };

  if (autoMs) setInterval(() => { current = (current + 1) % totalSlides; update(); }, autoMs);
}

// Mortgage calculator
function initMortgageCalc() {
  const form = document.getElementById('mortgage-form');
  if (!form) return;
  form.addEventListener('input', calcMortgage);
  calcMortgage();
}

function calcMortgage() {
  const price    = parseFloat(document.getElementById('mc-price')?.value || 0);
  const down     = parseFloat(document.getElementById('mc-down')?.value || 20);
  const rate     = parseFloat(document.getElementById('mc-rate')?.value || 6.5);
  const years    = parseInt(document.getElementById('mc-years')?.value || 30);
  const tax      = parseFloat(document.getElementById('mc-tax')?.value || 0);
  const ins      = parseFloat(document.getElementById('mc-ins')?.value || 0);

  const principal = price * (1 - down / 100);
  const r = rate / 100 / 12;
  const n = years * 12;
  const monthly = r === 0 ? principal / n : principal * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1);
  const total = monthly + tax / 12 + ins / 12;

  const fmt = (v) => '$' + Math.round(v).toLocaleString();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('mc-result-pi',    fmt(monthly));
  set('mc-result-tax',   fmt(tax / 12));
  set('mc-result-ins',   fmt(ins / 12));
  set('mc-result-total', fmt(total));
  set('mc-result-loan',  fmt(principal));
  set('mc-result-down-amt', fmt(price * down / 100));
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});
