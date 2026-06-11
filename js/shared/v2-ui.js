/* ESTİ BİRAZ — v2 UI helpers
   Küçük, güvenli kullanıcı deneyimi iyileştirmeleri.
*/

(function () {
  function getCurrentPath() {
    const hash = window.location.hash || '#/';
    const path = hash.replace(/^#/, '') || '/';
    return path.startsWith('/') ? path : `/${path}`;
  }

  function getRouteClass(path) {
    if (path === '/') return 'route-home';
    if (path.startsWith('/makale/')) return 'route-article-detail';
    if (path.startsWith('/makaleler') || path.startsWith('/magazin')) return 'route-articles';
    if (path.startsWith('/akademi')) return 'route-academy';
    if (path.startsWith('/kurs/')) return 'route-course-detail';
    if (path.startsWith('/ders/')) return 'route-lesson-detail';
    if (path.startsWith('/admin')) return 'route-admin';
    if (path.startsWith('/profil')) return 'route-profile';
    return 'route-other';
  }

  function updateBodyRouteClass() {
    const path = getCurrentPath();
    const routeClass = getRouteClass(path);

    document.body.classList.remove(
      'route-home',
      'route-articles',
      'route-article-detail',
      'route-academy',
      'route-course-detail',
      'route-lesson-detail',
      'route-admin',
      'route-profile',
      'route-other'
    );

    document.body.classList.add(routeClass);
  }

  function updateActiveNavLink() {
    const path = getCurrentPath();
    const links = document.querySelectorAll(
      '.header__nav-link, .nav-link, .header a[href^="#/"]'
    );

    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPath = href.replace(/^#/, '') || '/';

      const isActive =
        (path === '/' && linkPath === '/') ||
        (path.startsWith('/makaleler') && linkPath.startsWith('/makaleler')) ||
        (path.startsWith('/magazin') && linkPath.startsWith('/makaleler')) ||
        (path.startsWith('/akademi') && linkPath.startsWith('/akademi')) ||
        (path.startsWith('/hakkinda') && linkPath.startsWith('/hakkinda')) ||
        (path.startsWith('/admin') && linkPath.startsWith('/admin')) ||
        (path.startsWith('/profil') && linkPath.startsWith('/profil'));

      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function enhanceExternalLinks() {
    const links = document.querySelectorAll('#app a[href^="http"]');

    links.forEach(link => {
      try {
        const url = new URL(link.href);
        if (url.origin !== window.location.origin) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      } catch (_) {}
    });
  }

  function runV2UI() {
    updateBodyRouteClass();
    updateActiveNavLink();
    enhanceExternalLinks();
  }

  document.addEventListener('DOMContentLoaded', runV2UI);
  window.addEventListener('hashchange', () => {
    window.setTimeout(runV2UI, 0);
  });

  const observer = new MutationObserver(() => {
    window.clearTimeout(window.__ebV2UiTimer);
    window.__ebV2UiTimer = window.setTimeout(runV2UI, 50);
  });

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (app) {
      observer.observe(app, { childList: true, subtree: true });
    }
  });
})();
