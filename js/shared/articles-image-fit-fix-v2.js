/* ESTİ BİRAZ — Articles Image Fit Fix v2 */

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

      imageBox.style.setProperty('width', '100%', 'important');
      imageBox.style.setProperty('aspect-ratio', '16 / 9', 'important');
      imageBox.style.setProperty('overflow', 'hidden', 'important');
      imageBox.style.setProperty('background', '#f7fbfa', 'important');

      img.style.setProperty('width', '100%', 'important');
      img.style.setProperty('height', '100%', 'important');
      img.style.setProperty('object-fit', 'contain', 'important');
      img.style.setProperty('object-position', 'center', 'important');
      img.style.setProperty('background', '#f7fbfa', 'important');
      img.style.setProperty('display', 'block', 'important');
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
