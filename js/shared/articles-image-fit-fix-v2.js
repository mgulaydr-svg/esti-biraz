/* ESTİ BİRAZ — Articles Image Fit + Safe Top Layout Fix v2 */

(function () {
  function isArticlesPage() {
    const path = (window.location.hash || '#/').replace(/^#/, '') || '/';

    return (
      path.startsWith('/makaleler') ||
      path.startsWith('/magazin') ||
      path.startsWith('/makaleler-test')
    );
  }

  function fixArticleImages() {
    if (!isArticlesPage()) return;

    const articleLinks = document.querySelectorAll('#app a[href^="#/makale/"]');

    articleLinks.forEach(link => {
      const img = link.querySelector('img');
      if (!img) return;

      const imageBox = img.parentElement;
      if (!imageBox) return;

      link.classList.add('article-image-top-fixed');

      /*
        Eski grid/flex yapısını güvenli biçimde tek sütuna alıyoruz.
        Ama metin gövdesini kaybetmemek için çocuk elemanları ayrıca düzenliyoruz.
      */
      link.style.setProperty('display', 'flex', 'important');
      link.style.setProperty('flex-direction', 'column', 'important');
      link.style.setProperty('grid-template-columns', '1fr', 'important');
      link.style.setProperty('height', 'auto', 'important');
      link.style.setProperty('min-height', 'auto', 'important');
      link.style.setProperty('overflow', 'hidden', 'important');

      imageBox.style.setProperty('order', '0', 'important');
      imageBox.style.setProperty('width', '100%', 'important');
      imageBox.style.setProperty('height', 'auto', 'important');
      imageBox.style.setProperty('min-height', '0', 'important');
      imageBox.style.setProperty('aspect-ratio', '16 / 9', 'important');
      imageBox.style.setProperty('overflow', 'hidden', 'important');
      imageBox.style.setProperty('background', '#f7fbfa', 'important');
      imageBox.style.setProperty('flex', '0 0 auto', 'important');

      img.style.setProperty('width', '100%', 'important');
      img.style.setProperty('height', '100%', 'important');
      img.style.setProperty('object-fit', 'contain', 'important');
      img.style.setProperty('object-position', 'center', 'important');
      img.style.setProperty('background', '#f7fbfa', 'important');
      img.style.setProperty('display', 'block', 'important');

      Array.from(link.children).forEach(child => {
        if (child === imageBox) return;

        child.style.setProperty('order', '1', 'important');
        child.style.setProperty('display', 'block', 'important');
        child.style.setProperty('width', '100%', 'important');
        child.style.setProperty('height', 'auto', 'important');
        child.style.setProperty('min-height', '0', 'important');
        child.style.setProperty('opacity', '1', 'important');
        child.style.setProperty('visibility', 'visible', 'important');
        child.style.setProperty('position', 'relative', 'important');
        child.style.setProperty('flex', '0 0 auto', 'important');
      });
    });
  }

  function run() {
    clearTimeout(window.__ebArticleImageFixTimer);
    window.__ebArticleImageFixTimer = setTimeout(fixArticleImages, 150);
  }

  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('hashchange', run);

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (!app) return;

    const observer = new MutationObserver(run);
    observer.observe(app, { childList: true, subtree: true });
  });
})();
