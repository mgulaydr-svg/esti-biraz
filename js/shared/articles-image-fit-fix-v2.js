/* ESTİ BİRAZ — Articles Image Fit + Compact Layout Final v2 */

(function () {
  function isArticlesPage() {
    const path = (window.location.hash || '#/').replace(/^#/, '') || '/';

    return (
      path.startsWith('/makaleler') ||
      path.startsWith('/magazin') ||
      path.startsWith('/makaleler-test')
    );
  }

  function setStyle(element, property, value) {
    if (!element) return;
    element.style.setProperty(property, value, 'important');
  }

  function getArticleLinks() {
    return Array.from(document.querySelectorAll('#app a[href^="#/makale/"]'));
  }

  function findSharedParent(a, b) {
    if (!a || !b) return null;

    let parent = a.parentElement;

    while (parent && parent !== document.body) {
      if (parent.contains(b)) return parent;
      parent = parent.parentElement;
    }

    return null;
  }

  function fixMainArticlesLayout(articleLinks) {
    if (articleLinks.length < 2) return;

    const first = articleLinks[0];
    const second = articleLinks[1];
    const third = articleLinks[2];

    const mainGrid = findSharedParent(first, second);

    if (mainGrid && mainGrid.id !== 'app') {
      setStyle(mainGrid, 'display', 'grid');
      setStyle(mainGrid, 'grid-template-columns', 'minmax(0, 1.55fr) minmax(280px, 0.85fr)');
      setStyle(mainGrid, 'gap', '22px');
      setStyle(mainGrid, 'align-items', 'start');
    }

    if (second && third && second.parentElement === third.parentElement) {
      const rightColumn = second.parentElement;

      setStyle(rightColumn, 'display', 'grid');
      setStyle(rightColumn, 'grid-template-columns', '1fr');
      setStyle(rightColumn, 'grid-template-rows', 'auto auto');
      setStyle(rightColumn, 'gap', '22px');
      setStyle(rightColumn, 'align-content', 'start');
      setStyle(rightColumn, 'align-items', 'start');
    }
  }

  function fixArticleCard(link, index) {
    const img = link.querySelector('img');

    setStyle(link, 'display', 'flex');
    setStyle(link, 'flex-direction', 'column');
    setStyle(link, 'height', 'auto');
    setStyle(link, 'min-height', '0');
    setStyle(link, 'align-self', 'start');
    setStyle(link, 'justify-content', 'flex-start');
    setStyle(link, 'margin', '0');
    setStyle(link, 'overflow', 'hidden');

    if (!img) {
      setStyle(link, 'padding-top', '18px');
      setStyle(link, 'padding-bottom', '18px');
    }

    if (img) {
      const imageBox = img.parentElement;

      link.classList.add('article-image-top-fixed');

      setStyle(link, 'grid-template-columns', '1fr');
      setStyle(link, 'gap', '0');

      setStyle(imageBox, 'order', '0');
      setStyle(imageBox, 'width', '100%');
      setStyle(imageBox, 'height', 'auto');
      setStyle(imageBox, 'min-height', '0');
      setStyle(imageBox, 'max-height', index === 0 ? '210px' : '170px');
      setStyle(imageBox, 'aspect-ratio', '16 / 9');
      setStyle(imageBox, 'overflow', 'hidden');
      setStyle(imageBox, 'background', '#f7fbfa');
      setStyle(imageBox, 'display', 'flex');
      setStyle(imageBox, 'align-items', 'center');
      setStyle(imageBox, 'justify-content', 'center');
      setStyle(imageBox, 'flex', '0 0 auto');
      setStyle(imageBox, 'margin', '0');

      setStyle(img, 'width', '100%');
      setStyle(img, 'height', '100%');
      setStyle(img, 'max-height', index === 0 ? '210px' : '170px');
      setStyle(img, 'object-fit', 'contain');
      setStyle(img, 'object-position', 'center center');
      setStyle(img, 'background', '#f7fbfa');
      setStyle(img, 'display', 'block');
    }

    Array.from(link.children).forEach(child => {
      if (img && child === img.parentElement) return;

      setStyle(child, 'order', '1');
      setStyle(child, 'display', 'flex');
      setStyle(child, 'flex-direction', 'column');
      setStyle(child, 'width', '100%');
      setStyle(child, 'height', 'auto');
      setStyle(child, 'min-height', '0');
      setStyle(child, 'padding-top', '16px');
      setStyle(child, 'padding-bottom', '16px');
      setStyle(child, 'opacity', '1');
      setStyle(child, 'visibility', 'visible');
      setStyle(child, 'position', 'relative');
      setStyle(child, 'flex', '0 0 auto');
    });

    const readLinks = Array.from(link.querySelectorAll('strong')).filter(strong => {
      const text = (strong.textContent || '').trim().toLowerCase();
      return text.includes('oku');
    });

    readLinks.forEach(strong => {
      strong.textContent = 'Oku →';
      setStyle(strong, 'margin-top', '8px');
      setStyle(strong, 'padding-top', '0');
    });
  }

  function fixArticleImagesAndLayout() {
    if (!isArticlesPage()) return;

    const articleLinks = getArticleLinks();
    if (!articleLinks.length) return;

    fixMainArticlesLayout(articleLinks);

    articleLinks.forEach((link, index) => {
      fixArticleCard(link, index);
    });

    if (window.innerWidth <= 760) {
      const possibleGrids = new Set();

      articleLinks.forEach(link => {
        if (link.parentElement) possibleGrids.add(link.parentElement);
        if (link.parentElement?.parentElement) possibleGrids.add(link.parentElement.parentElement);
      });

      possibleGrids.forEach(grid => {
        if (!grid || grid.id === 'app') return;

        setStyle(grid, 'grid-template-columns', '1fr');
        setStyle(grid, 'grid-template-rows', 'auto');
        setStyle(grid, 'align-items', 'start');
      });

      articleLinks.forEach(link => {
        setStyle(link, 'height', 'auto');
      });
    }
  }

  function run() {
    clearTimeout(window.__ebArticleImageFixTimer);
    window.__ebArticleImageFixTimer = setTimeout(fixArticleImagesAndLayout, 180);
  }

  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('hashchange', run);
  window.addEventListener('resize', run);

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (!app) return;

    const observer = new MutationObserver(run);
    observer.observe(app, { childList: true, subtree: true });
  });
})();
