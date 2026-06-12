/* ESTİ BİRAZ — Articles Image Fit + Compact Layout Fix v2 */

(function () {
  function isArticlesPage() {
    const path = (window.location.hash || '#/').replace(/^#/, '') || '/';

    return (
      path.startsWith('/makaleler') ||
      path.startsWith('/magazin') ||
      path.startsWith('/makaleler-test')
    );
  }

  function applyImportantStyle(element, property, value) {
    if (!element) return;
    element.style.setProperty(property, value, 'important');
  }

  function compactArticleContainers(articleLinks) {
    const containers = new Set();

    articleLinks.forEach(link => {
      if (link.parentElement) containers.add(link.parentElement);
      if (link.parentElement?.parentElement) containers.add(link.parentElement.parentElement);
    });

    containers.forEach(container => {
      if (!container || container.id === 'app') return;

      const articleCount = container.querySelectorAll('a[href^="#/makale/"]').length;
      if (articleCount < 1) return;

      applyImportantStyle(container, 'align-items', 'start');
      applyImportantStyle(container, 'align-content', 'start');
      applyImportantStyle(container, 'justify-content', 'start');
      applyImportantStyle(container, 'gap', '22px');
      applyImportantStyle(container, 'row-gap', '22px');
    });
  }

  function fixArticleImages() {
    if (!isArticlesPage()) return;

    const articleLinks = Array.from(
      document.querySelectorAll('#app a[href^="#/makale/"]')
    );

    compactArticleContainers(articleLinks);

    articleLinks.forEach(link => {
      applyImportantStyle(link, 'height', 'auto');
      applyImportantStyle(link, 'min-height', '0');
      applyImportantStyle(link, 'align-self', 'start');
      applyImportantStyle(link, 'justify-content', 'flex-start');
      applyImportantStyle(link, 'margin-bottom', '0');

      const img = link.querySelector('img');

      if (!img) {
        applyImportantStyle(link, 'padding-top', '18px');
        applyImportantStyle(link, 'padding-bottom', '18px');
        return;
      }

      const imageBox = img.parentElement;
      if (!imageBox) return;

      link.classList.add('article-image-top-fixed');

      applyImportantStyle(link, 'display', 'flex');
      applyImportantStyle(link, 'flex-direction', 'column');
      applyImportantStyle(link, 'grid-template-columns', '1fr');
      applyImportantStyle(link, 'gap', '0');
      applyImportantStyle(link, 'height', 'auto');
      applyImportantStyle(link, 'min-height', '0');
      applyImportantStyle(link, 'overflow', 'hidden');

      applyImportantStyle(imageBox, 'order', '0');
      applyImportantStyle(imageBox, 'width', '100%');
      applyImportantStyle(imageBox, 'height', 'auto');
      applyImportantStyle(imageBox, 'min-height', '0');
      applyImportantStyle(imageBox, 'max-height', '220px');
      applyImportantStyle(imageBox, 'aspect-ratio', '16 / 9');
      applyImportantStyle(imageBox, 'overflow', 'hidden');
      applyImportantStyle(imageBox, 'background', '#f7fbfa');
      applyImportantStyle(imageBox, 'flex', '0 0 auto');
      applyImportantStyle(imageBox, 'margin', '0');

      applyImportantStyle(img, 'width', '100%');
      applyImportantStyle(img, 'height', '100%');
      applyImportantStyle(img, 'max-height', '220px');
      applyImportantStyle(img, 'object-fit', 'contain');
      applyImportantStyle(img, 'object-position', 'center');
      applyImportantStyle(img, 'background', '#f7fbfa');
      applyImportantStyle(img, 'display', 'block');

      Array.from(link.children).forEach(child => {
        if (child === imageBox) return;

        applyImportantStyle(child, 'order', '1');
        applyImportantStyle(child, 'display', 'block');
        applyImportantStyle(child, 'width', '100%');
        applyImportantStyle(child, 'height', 'auto');
        applyImportantStyle(child, 'min-height', '0');
        applyImportantStyle(child, 'margin-top', '0');
        applyImportantStyle(child, 'padding-top', '18px');
        applyImportantStyle(child, 'padding-bottom', '18px');
        applyImportantStyle(child, 'opacity', '1');
        applyImportantStyle(child, 'visibility', 'visible');
        applyImportantStyle(child, 'position', 'relative');
        applyImportantStyle(child, 'flex', '0 0 auto');
      });

      const textBlocks = link.querySelectorAll('h1, h2, h3, p, span, strong');
      textBlocks.forEach(el => {
        applyImportantStyle(el, 'opacity', '1');
        applyImportantStyle(el, 'visibility', 'visible');
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
