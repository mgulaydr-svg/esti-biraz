/* ESTİ BİRAZ — Admin v2 UI helpers */

(function () {
  function isAdminRoute() {
    const currentPath = (window.location.hash || '#/').replace(/^#/, '') || '/';
    return currentPath.startsWith('/admin');
  }

  function enhanceAdminPage() {
    const adminContent = document.getElementById('adminContent');

    if (!isAdminRoute() || !adminContent) {
      document.body.classList.remove('admin-v2-ready');
      return;
    }

    document.body.classList.add('admin-v2-ready');

    document.querySelectorAll('.admin-table-wrapper').forEach(wrapper => {
      wrapper.setAttribute('tabindex', '0');
      wrapper.setAttribute('aria-label', 'Yatay kaydırılabilir admin tablosu');
    });

    document.querySelectorAll('.admin-form').forEach(form => {
      if (!form.querySelector('.admin-form__hint')) {
        const hint = document.createElement('p');
        hint.className = 'admin-form__hint';
        hint.textContent = 'Zorunlu alanları doldurduktan sonra kaydetmeyi unutmayın.';
        const title = form.querySelector('h3');
        if (title) title.insertAdjacentElement('afterend', hint);
      }
    });

    document.querySelectorAll('.admin-lesson-item').forEach(item => {
      item.classList.add('admin-lesson-item-v2');
    });
  }

  document.addEventListener('DOMContentLoaded', enhanceAdminPage);

  window.addEventListener('hashchange', () => {
    setTimeout(enhanceAdminPage, 80);
  });

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (!app) return;

    const observer = new MutationObserver(() => {
      clearTimeout(window.__ebAdminV2Timer);
      window.__ebAdminV2Timer = setTimeout(enhanceAdminPage, 80);
    });

    observer.observe(app, { childList: true, subtree: true });
  });
})();
