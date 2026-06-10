/* ESTİ BİRAZ — Course Detail Page v2 */

async function renderCourseDetailPageV2(slug) {
  const container = document.getElementById('app');
  if (!container) return;

  container.innerHTML = ebCourseDetailLoadingTemplate();

  try {
    const course = await ebGetCourseBySlug(slug);

    if (!course) {
      container.innerHTML = ebCourseDetailNotFoundTemplate();
      return;
    }

    const lessons = await ebGetCourseLessons(course);
    container.innerHTML = ebCourseDetailTemplate(course, lessons);

    if (typeof pageMeta === 'function') {
      pageMeta(
        course.title || 'Kurs',
        course.description || course.summary || 'ESTİ BİRAZ Akademi kursu.'
      );
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('❌ Kurs detay sayfası yüklenemedi:', error);
    container.innerHTML = ebCourseDetailErrorTemplate();
  }
}

function ebCourseDetailTemplate(course, lessons = []) {
  const title = ebEscapeHtml(course.title || 'Başlıksız Kurs');
  const description = ebEscapeHtml(course.description || course.summary || '');
  const instructor = ebEscapeHtml(course.instructor || 'Esti Biraz');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(course.category));
  const level = ebEscapeHtml(ebGetLevelLabel(course.level));
  const lessonTotal = course.totalLessons || course.lessonCount || course.lessonsCount || lessons.length || '';
  const date = ebFormatDate(course);

  const coverImageHtml = course.coverImage
    ? `<img src="${ebEscapeHtml(course.coverImage)}" alt="${title}" loading="eager">`
    : `<div class="course-detail-cover__placeholder">🎓</div>`;

  return `
    <article class="course-detail-v2">
      <header class="course-detail-hero">
        <div class="container course-detail-hero__inner">
          <a href="#/akademi" class="course-back-link">← Akademiye Dön</a>

          <div class="course-detail-meta">
            <span>${categoryLabel}</span>
            <span>${level}</span>
            ${lessonTotal ? `<span>${lessonTotal} ders</span>` : ''}
            ${date ? `<span>${date}</span>` : ''}
          </div>

          <div class="course-detail-hero__grid">
            <div>
              <h1>${title}</h1>

              ${description ? `<p>${description}</p>` : ''}

              <div class="course-detail-instructor">
                <span>Eğitmen</span>
                <strong>${instructor}</strong>
              </div>

              <div class="course-detail-actions">
                ${lessons.length
                  ? `<a href="${ebGetFirstLessonHref(course, lessons[0])}" class="course-primary-action">İlk Derse Başla</a>`
                  : `<a href="#/akademi" class="course-primary-action">Akademiye Dön</a>`}
                <a href="#course-lessons" class="course-secondary-action">Dersleri Gör</a>
              </div>
            </div>

            <figure class="course-detail-cover">
              ${coverImageHtml}
            </figure>
          </div>
        </div>
      </header>

      <div class="container course-detail-main">
        <aside class="course-detail-sidebar">
          <div class="course-detail-sidebar__box">
            <strong>Kurs özeti</strong>
            <ul>
              <li><span>Kategori</span><b>${categoryLabel}</b></li>
              <li><span>Seviye</span><b>${level}</b></li>
              ${lessonTotal ? `<li><span>Ders</span><b>${lessonTotal}</b></li>` : ''}
              <li><span>Eğitmen</span><b>${instructor}</b></li>
            </ul>
          </div>
        </aside>

        <main class="course-detail-content">
          <section class="course-detail-section">
            <span class="course-section-kicker">KURS HAKKINDA</span>
            <h2>Bu kursta ne öğreneceksiniz?</h2>
            <p>
              ${description || 'Bu kurs, konuyu adım adım öğrenmeniz için yapılandırılmış derslerden oluşur.'}
            </p>
          </section>

          <section class="course-detail-section" id="course-lessons">
            <span class="course-section-kicker">DERSLER</span>
            <h2>Kurs içeriği</h2>

            ${lessons.length
              ? ebCourseLessonsTemplate(course, lessons)
              : ebCourseNoLessonsTemplate()}
          </section>
        </main>
      </div>
    </article>
  `;
}

function ebCourseLessonsTemplate(course, lessons) {
  return `
    <div class="course-lessons-list">
      ${lessons.map((lesson, index) => ebCourseLessonItemTemplate(course, lesson, index)).join('')}
    </div>
  `;
}

function ebCourseLessonItemTemplate(course, lesson, index) {
  const title = ebEscapeHtml(lesson.title || `Ders ${index + 1}`);
  const summary = ebEscapeHtml(lesson.summary || lesson.description || '');
  const duration = ebGetLessonDurationLabel(lesson);
  const href = ebGetLessonHref(course, lesson, index);

  return `
    <a href="${href}" class="course-lesson-item">
      <div class="course-lesson-number">${String(index + 1).padStart(2, '0')}</div>

      <div class="course-lesson-body">
        <h3>${title}</h3>
        ${summary ? `<p>${summary}</p>` : ''}
      </div>

      <div class="course-lesson-meta">
        ${duration ? `<span>${duration}</span>` : ''}
        <strong>Derse Git →</strong>
      </div>
    </a>
  `;
}

function ebCourseNoLessonsTemplate() {
  return `
    <div class="course-no-lessons">
      <strong>Dersler yakında</strong>
      <span>Bu kurs için ders listesi henüz yayınlanmadı.</span>
    </div>
  `;
}

function ebGetFirstLessonHref(course, lesson) {
  return ebGetLessonHref(course, lesson, 0);
}

function ebGetLessonHref(course, lesson, index) {
  const courseSlug = ebEscapeHtml(course.slug || course.id || '');
  const order = lesson?.order ?? lesson?.lessonOrder ?? lesson?.lessonNo ?? index + 1;
  return `#/ders/${courseSlug}/${order}`;
}

function ebCourseDetailLoadingTemplate() {
  return `
    <div class="container course-detail-state">
      <div class="loading-state__spinner"></div>
      <span>Kurs yükleniyor...</span>
    </div>
  `;
}

function ebCourseDetailNotFoundTemplate() {
  return `
    <div class="container course-detail-state course-detail-state--empty">
      <strong>Kurs bulunamadı</strong>
      <span>Aradığınız kurs yayından kaldırılmış veya bağlantı değişmiş olabilir.</span>
      <a href="#/akademi">Akademiye Dön →</a>
    </div>
  `;
}

function ebCourseDetailErrorTemplate() {
  return `
    <div class="container course-detail-state course-detail-state--empty">
      <strong>Kurs yüklenemedi</strong>
      <span>Bir bağlantı veya izin sorunu oluşmuş olabilir.</span>
      <a href="#/akademi">Akademiye Dön →</a>
    </div>
  `;
}
