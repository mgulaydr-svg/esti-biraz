/* ESTİ BİRAZ — Lesson Detail Page v2 */

async function renderLessonDetailPageV2(courseSlug, lessonKey) {
  const container = document.getElementById('app');
  if (!container) return;

  container.innerHTML = ebLessonDetailLoadingTemplate();

  try {
    const detail = await ebGetLessonDetail(courseSlug, lessonKey);

    if (!detail || !detail.course) {
      container.innerHTML = ebLessonDetailNotFoundTemplate('Kurs bulunamadı.');
      return;
    }

    if (!detail.lesson) {
      container.innerHTML = ebLessonDetailNoLessonTemplate(detail.course);
      return;
    }

    container.innerHTML = ebLessonDetailTemplate(detail);

    if (typeof pageMeta === 'function') {
      pageMeta(
        detail.lesson.title || 'Ders',
        detail.lesson.summary || detail.course.title || 'ESTİ BİRAZ Akademi dersi.'
      );
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('❌ Ders detay sayfası yüklenemedi:', error);
    container.innerHTML = ebLessonDetailErrorTemplate();
  }
}

function ebLessonDetailTemplate(detail) {
  const { course, lesson, lessons, currentIndex, previousLesson, nextLesson } = detail;

  const courseTitle = ebEscapeHtml(course.title || 'Kurs');
  const courseSlug = ebEscapeHtml(course.slug || course.id || '');
  const lessonTitle = ebEscapeHtml(lesson.title || `Ders ${currentIndex + 1}`);
  const summary = ebEscapeHtml(lesson.summary || lesson.description || '');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(course.category));
  const level = ebEscapeHtml(ebGetLevelLabel(course.level));
  const duration = ebGetLessonDurationLabelV2(lesson);
  const content = lesson.content || lesson.body || lesson.html || '';

  return `
    <article class="lesson-detail-v2">
      <header class="lesson-detail-hero">
        <div class="container lesson-detail-hero__inner">
          <a href="#/kurs/${courseSlug}" class="lesson-back-link">← Kursa Dön</a>

          <div class="lesson-detail-meta">
            <span>${categoryLabel}</span>
            <span>${level}</span>
            <span>Ders ${currentIndex + 1}/${lessons.length}</span>
            ${duration ? `<span>${duration}</span>` : ''}
          </div>

          <h1>${lessonTitle}</h1>

          ${summary ? `<p>${summary}</p>` : ''}

          <div class="lesson-course-label">
            <span>Kurs</span>
            <strong>${courseTitle}</strong>
          </div>
        </div>
      </header>

      <div class="container lesson-detail-layout">
        <aside class="lesson-sidebar">
          <div class="lesson-sidebar__box">
            <span class="lesson-sidebar__label">KURS MÜFREDATI</span>
            <strong>${courseTitle}</strong>
            <small>${lessons.length} derslik öğrenme akışı</small>
          </div>

          <nav class="lesson-sidebar__list" aria-label="Kurs dersleri">
            ${lessons.map((item, index) => ebLessonSidebarItemTemplate(course, item, index, lesson.id)).join('')}
          </nav>
        </aside>

        <main class="lesson-content">
          ${content ? content : ebLessonEmptyContentTemplate()}


          <nav class="lesson-navigation" aria-label="Ders gezinme">
          
            ${previousLesson
              ? ebLessonNavigationLink(course, previousLesson, '← Önceki Ders', 'previous')
              : `<span></span>`}

            ${nextLesson
              ? ebLessonNavigationLink(course, nextLesson, 'Sonraki Ders →', 'next')
              : `<a href="#/kurs/${courseSlug}" class="lesson-nav-link lesson-nav-link--next">Kursa Dön →</a>`}
          </nav>
        </main>
      </div>
    </article>
  `;
}

function ebLessonSidebarItemTemplate(course, lesson, index, activeLessonId) {
  const title = ebEscapeHtml(lesson.title || `Ders ${index + 1}`);
  const href = ebLessonHref(course, lesson, index);
  const isActive = lesson.id === activeLessonId;
  const duration = ebGetLessonDurationLabelV2(lesson);

  return `
    <a href="${href}" class="lesson-sidebar__item ${isActive ? 'is-active' : ''}">
      <span>${String(index + 1).padStart(2, '0')}</span>
      <strong>${title}</strong>
      ${duration ? `<em>${duration}</em>` : ''}
    </a>
  `;
}

function ebLessonNavigationLink(course, lesson, label, direction) {
  const href = ebLessonHref(course, lesson, 0);
  const title = ebEscapeHtml(lesson.title || 'Ders');

  return `
    <a href="${href}" class="lesson-nav-link lesson-nav-link--${direction}">
      <span>${label}</span>
      <strong>${title}</strong>
    </a>
  `;
}

function ebLessonHref(course, lesson, index) {
  const courseSlug = ebEscapeHtml(course.slug || course.id || '');
  const key = lesson.slug || ebGetLessonOrderValue(lesson) || index + 1;
  return `#/ders/${courseSlug}/${encodeURIComponent(key)}`;
}


function ebLessonEmptyContentTemplate() {
  return `
    <div class="lesson-empty-content">
      <strong>Ders içeriği yakında</strong>
      <span>Bu ders için içerik henüz yayınlanmadı.</span>
    </div>
  `;
}

function ebLessonDetailNoLessonTemplate(course) {
  const courseSlug = ebEscapeHtml(course.slug || course.id || '');
  const courseTitle = ebEscapeHtml(course.title || 'Kurs');

  return `
    <div class="container lesson-detail-state lesson-detail-state--empty">
      <strong>Ders bulunamadı</strong>
      <span>${courseTitle} kursu için yayınlanmış ders bulunamadı.</span>
      <a href="#/kurs/${courseSlug}">Kursa Dön →</a>
    </div>
  `;
}

function ebLessonDetailLoadingTemplate() {
  return `
    <div class="container lesson-detail-state">
      <div class="loading-state__spinner"></div>
      <span>Ders yükleniyor...</span>
    </div>
  `;
}

function ebLessonDetailNotFoundTemplate(message) {
  return `
    <div class="container lesson-detail-state lesson-detail-state--empty">
      <strong>Ders bulunamadı</strong>
      <span>${ebEscapeHtml(message || 'Aradığınız ders bulunamadı.')}</span>
      <a href="#/akademi">Akademiye Dön →</a>
    </div>
  `;
}

function ebLessonDetailErrorTemplate() {
  return `
    <div class="container lesson-detail-state lesson-detail-state--empty">
      <strong>Ders yüklenemedi</strong>
      <span>Bir bağlantı veya izin sorunu oluşmuş olabilir.</span>
      <a href="#/akademi">Akademiye Dön →</a>
    </div>
  `;
}
