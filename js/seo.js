/* ESTİ BİRAZ — SEO yardımcıları */
(function () {
  const SITE_NAME = 'ESTİ BİRAZ';
  const DEFAULT_DESCRIPTION = 'Sağlık, bilim, eğitim ve kültür alanlarında güvenilir makaleler ve çevrim içi öğrenme içerikleri.';
  const DEFAULT_IMAGE = 'https://mgulaydr-svg.github.io/esti-biraz/assets/images/og-cover.jpg';

  function ensureMeta(selector, attrs) {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
      document.head.appendChild(el);
    }
    return el;
  }

  function setMetaName(name, content) {
    const el = ensureMeta(`meta[name="${name}"]`, { name });
    el.setAttribute('content', content || '');
  }

  function setMetaProperty(property, content) {
    const el = ensureMeta(`meta[property="${property}"]`, { property });
    el.setAttribute('content', content || '');
  }

  function removeStructuredData() {
    document.querySelectorAll('script[data-dynamic-schema="true"]').forEach(el => el.remove());
  }

  function addStructuredData(data) {
    if (!data) return;
    removeStructuredData();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.dynamicSchema = 'true';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  window.setPageMeta = function setPageMeta(options = {}) {
    const title = options.title ? `${options.title} — ${SITE_NAME}` : SITE_NAME;
    const description = options.description || DEFAULT_DESCRIPTION;
    const image = options.image || DEFAULT_IMAGE;
    const url = options.url || window.location.href;
    const type = options.type || 'website';

    document.title = title;
    setMetaName('description', description);
    setMetaName('author', options.author || 'Mehmet Gülay');
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', description);
    setMetaProperty('og:type', type);
    setMetaProperty('og:image', image);
    setMetaProperty('og:url', url);
    setMetaProperty('og:site_name', SITE_NAME);
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', image);

    if (options.schema) addStructuredData(options.schema);
    else removeStructuredData();
  };

  window.escapeHtml = function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };
})();
