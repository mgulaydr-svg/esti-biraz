/* ESTİ BİRAZ — Lesson Completion v2
   Geçici çözüm: localStorage.
   Nihai çözüm: Firestore + users/{uid}/lessonProgress.
*/

(function () {
  function getCurrentPath() {
    const raw = window.location.hash || '#/';
    const path = raw.replace(/^#/, '') || '/';
    return path.startsWith('/') ? path : `/${path}`;
  }

  function getLessonRouteParts() {
    const path = getCurrentPath();
    if (!path.startsWith('/ders/')) return null;

    const parts = path.split('/');
    return {
      courseSlug: decodeURIComponent(parts[2] || ''),
      lessonKey: decodeURIComponent(parts[3] || '')
    };
  }

  function getStorageKey(courseSlug, lessonKey) {
    return `eb_lesson_completed_${courseSlug}_${lessonKey}`;
  }

  function isLessonCompleted(courseSlug, lessonKey) {
    return localStorage.getItem(getStorageKey(courseSlug, lessonKey)) === 'true';
  }

  function setLessonCompleted(courseSlug, lessonKey, completed) {
    localStorage.setItem(getStorageKey(courseSlug, lessonKey), String(completed));
  }

  function getLessonProgressLabel() {
    const metaItems = Array.from(document.querySelectorAll('.lesson-detail-meta span'));
    const lessonMeta = metaItems.find(item => (item.textContent || '').trim().startsWith('Ders '));
    return lessonMeta ? lessonMeta.textContent.trim() : 'Ders ilerlemesi';
  }

  function injectCompletionPanel() {
    const route = getLessonRouteParts();
    if (!route || !route.courseSlug || !route.lessonKey) return;

    const lessonContent = document.querySelector('.lesson-content');
    const lessonNavigation = document.querySelector('.lesson-navigation');
    if (!lessonContent || !lessonNavigation) return;

    if (document.getElementById('lessonCompletionPanelV2')) return;

    const completed = isLessonCompleted(route.courseSlug, route.lessonKey);
    const progressLabel = getLessonProgressLabel();

    const panel = document.createElement('section');
    panel.id = 'lessonCompletionPanelV2';
    panel.className = `lesson-completion-panel-v2 ${completed ? 'is-completed' : ''}`;
    panel.dataset.courseSlug = route.courseSlug;
    panel.dataset.lessonKey = route.lessonKey;

    panel.innerHTML = `
      <div class="lesson-completion-panel-v2__text">
        <span>Ders ilerlemesi</span>
        <strong>${completed ? 'Bu ders tamamlandı' : 'Dersi tamamladınız mı?'}</strong>
        <small>${progressLabel}</small>
      </div>

      <button type="button" class="lesson-completion-panel-v2__button">
        ${completed ? '✓ Tamamlandı' : 'Dersi Tamamla'}
      </button>
    `;

    lessonNavigation.insertAdjacentElement('beforebegin', panel);
  }

  function parseLessonHref(href) {
    if (!href) return null;

    const hashIndex = href.indexOf('#/ders/');
    if (hashIndex === -1) return null;

    const route = href.slice(hashIndex + 1);
    const parts = route.split('/');

    return {
      courseSlug: decodeURIComponent(parts[2] || ''),
      lessonKey: decodeURIComponent(parts[3] || '')
    };
  }

  function decorateSidebarCompletion() {
    const sidebarItems = document.querySelectorAll('.lesson-sidebar__item');

    sidebarItems.forEach(item => {
      const href = item.getAttribute('href') || '';
      const parsed = parseLessonHref(href);

      if (!parsed || !parsed.courseSlug || !parsed.lessonKey) return;

      const completed = isLessonCompleted(parsed.courseSlug, parsed.lessonKey);

      item.classList.toggle('is-completed', completed);

      let badge = item.querySelector('.lesson-sidebar__completion');

      if (completed && !badge) {
        badge = document.createElement('small');
        badge.className = 'lesson-sidebar__completion';
        badge.textContent = '✓ Tamamlandı';
        item.appendChild(badge);
      }

      if (!completed && badge) {
        badge.remove();
      }
    });
  }

  function updatePanelState(panel, completed) {
    panel.classList.toggle('is-completed', completed);

    const title = panel.querySelector('strong');
    const button = panel.querySelector('button');

    if (title) {
      title.textContent = completed ? 'Bu ders tamamlandı' : 'Dersi tamamladınız mı?';
    }

    if (button) {
      button.textContent = completed ? '✓ Tamamlandı' : 'Dersi Tamamla';
    }
  }

  function toggleCompletion(panel) {
    const courseSlug = panel.dataset.courseSlug;
    const lessonKey = panel.dataset.lessonKey;

    if (!courseSlug || !lessonKey) return;

    const completed = !isLessonCompleted(courseSlug, lessonKey);

    setLessonCompleted(courseSlug, lessonKey, completed);
    updatePanelState(panel, completed);
    decorateSidebarCompletion();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('.lesson-completion-panel-v2__button');
    if (!button) return;

    const panel = button.closest('.lesson-completion-panel-v2');
    if (!panel) return;

    toggleCompletion(panel);
  });

  function run() {
    clearTimeout(window.__ebLessonCompletionTimer);

    window.__ebLessonCompletionTimer = setTimeout(() => {
      injectCompletionPanel();
      decorateSidebarCompletion();
    }, 120);
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
