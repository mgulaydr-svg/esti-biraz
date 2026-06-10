/* ESTİ BİRAZ — Course Card v2 */

function ebGetLevelLabel(level = '') {
  const labels = {
    baslangic: 'Başlangıç',
    orta: 'Orta',
    ileri: 'İleri'
  };

  if (typeof getLevelLabel === 'function') {
    return getLevelLabel(level);
  }

  return labels[level] || 'Genel';
}

function ebCreateCourseCard(course) {
  const title = ebEscapeHtml(course.title || 'Başlıksız Kurs');
  const summary = ebEscapeHtml(course.summary || course.description || '');
  const slug = ebEscapeHtml(course.slug || course.id || '');
  const instructor = ebEscapeHtml(course.instructor || 'Esti Biraz');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(course.category));
  const level = ebEscapeHtml(ebGetLevelLabel(course.level));
  const lessonTotal = course.totalLessons || course.lessonCount || course.lessonsCount || '';

  const imageHtml = course.coverImage
    ? `<img src="${ebEscapeHtml(course.coverImage)}" alt="${title}" loading="lazy">`
    : `<div class="course-card__placeholder">🎓</div>`;

  return `
    <a href="#/kurs/${slug}" class="course-card">
      <div class="course-card__image">
        ${imageHtml}
      </div>

      <div class="course-card__body">
        <div class="course-card__top">
          <span class="course-pill">${categoryLabel}</span>
          <span class="course-level">${level}</span>
        </div>

        <h3 class="course-card__title">${title}</h3>

        ${summary ? `<p class="course-card__summary">${summary}</p>` : ''}

        <div class="course-card__meta">
          <span>👤 ${instructor}</span>
          ${lessonTotal ? `<span>📚 ${lessonTotal} ders</span>` : ''}
        </div>

        <div class="course-card__read">Kursa Git →</div>
      </div>
    </a>
  `;
}
