// @Bethesda Source Tracker — first-click attribution
// Captures UTM params + referrer on first visit, stores as ab_source in localStorage
(function() {
  const KEY = 'ab_source';
  if (localStorage.getItem(KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const utmSource   = params.get('utm_source')   || '';
  const utmMedium   = params.get('utm_medium')   || '';
  const utmCampaign = params.get('utm_campaign') || '';
  const referrer    = document.referrer || '';
  const landingPage = window.location.pathname;

  let label = 'Direct';
  if (utmSource) {
    label = utmSource + (utmMedium ? ' / ' + utmMedium : '');
  } else if (referrer) {
    try {
      const host = new URL(referrer).hostname.replace(/^www\./, '');
      if      (host.includes('google'))    label = 'Google Organic';
      else if (host.includes('bing'))      label = 'Bing Organic';
      else if (host.includes('yahoo'))     label = 'Yahoo Organic';
      else if (host.includes('facebook'))  label = 'Facebook';
      else if (host.includes('instagram')) label = 'Instagram';
      else if (host.includes('youtube'))   label = 'YouTube';
      else if (host.includes('linkedin'))  label = 'LinkedIn';
      else if (host.includes('tiktok'))    label = 'TikTok';
      else if (host.includes('twitter') || host.includes('x.com')) label = 'Twitter / X';
      else                                 label = host;
    } catch(e) { label = 'Direct'; }
  }

  localStorage.setItem(KEY, JSON.stringify({
    label, utmSource, utmMedium, utmCampaign,
    referrer, landingPage,
    capturedAt: new Date().toISOString()
  }));
})();

function getLeadSource() {
  try { return JSON.parse(localStorage.getItem('ab_source') || '{}'); }
  catch(e) { return {}; }
}
