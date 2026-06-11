/* ESTİ BİRAZ — Lesson Completion v2
   Geçici çözüm: localStorage. Nihai çözüm: Firestore + users/{uid}/lessonProgress.
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

    const storageKey = getStorageKey(route.courseSlug, route.lessonKey);
    const isCompleted = localStorage.getItem(storageKey) === 'true';
    const progressLabel = getLessonProgressLabel();

    const panel = document.createElement('section');
    panel.id = 'lessonCompletionPanelV2';
    panel.className = `lesson-completion-panel-v2 ${isCompleted ? 'is-completed' : ''}`;
    panel.dataset.courseSlug = route.courseSlug;
    panel.dataset.lessonKey = route.lessonKey;

    panel.innerHTML = `
      <div class="lesson-completion-panel-v2__text">
        <span>Ders ilerlemesi</span>
        <strong>${isCompleted ? 'Bu ders tamamlandı' : 'Dersi tamamladınız mı?'}</strong>
        <small>${progressLabel}</small>
      </div>

      <button type="button" class="lesson-completion-panel-v2__button">
        ${isCompleted ? '✓ Tamamlandı' : 'Dersi Tamamla'}
      </button>
    `;

    lessonNavigation.insertAdjacentElement('beforebegin', panel);
  }

  function toggleCompletion(panel) {
    const courseSlug = panel.dataset.courseSlug;
    const lessonKey = panel.dataset.lessonKey;
    if (!courseSlug || !lessonKey) return;

    const storageKey = getStorageKey(courseSlug, lessonKey);
    const isCompleted = localStorage.getItem(storageKey) === 'true';
    const nextState = !isCompleted;

    localStorage.setItem(storageKey, String(nextState));
    panel.classList.toggle('is-completed', nextState);

    const title = panel.querySelector('strong');
    const button = panel.querySelector('button');

    if (title) title.textContent = nextState ? 'Bu ders tamamlandı' : 'Dersi tamamladınız mı?';
    if (button) button.textContent = nextState ? '✓ Tamamlandı' : 'Dersi Tamamla';
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('.lesson-completion-panel-v2__button');
    if (!button) return;

    const panel = button.closest('.lesson-completion-panel-v2');
    if (panel) toggleCompletion(panel);
  });

  function run() {
    clearTimeout(window.__ebLessonCompletionTimer);
    window.__ebLessonCompletionTimer = setTimeout(injectCompletionPanel, 120);
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
