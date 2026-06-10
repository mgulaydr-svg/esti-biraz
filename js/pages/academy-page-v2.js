/* ESTİ BİRAZ — Academy Page v2 */

let ebAcademyPageState = {
  courses: [],
  category: 'tum',
  level: 'tum'
};

async function renderAcademyPageV2() {
  const container = document.getElementById('app');
  if (!container) return;

  container.innerHTML = `
    <section class="academy-hero-v2">
      <div class="container academy-hero-v2__inner">
        <div>
          <span class="academy-kicker">AKADEMİ</span>
          <h1>Okumayı öğrenmeye dönüştürün.</h1>
          <p>
            ESTİ BİRAZ Akademi; sağlık, eğitim, bilim, veri ve teknoloji alanlarında
            yapılandırılmış dersler ve kurslarla öğrenmeyi kolaylaştırır.
          </p>
        </div>

        <aside class="academy-hero-card">
          <strong>Öğrenme rotaları</strong>
          <span>Kısa dersler, anlaşılır içerikler ve adım adım ilerleyen kurs yapısı.</span>
        </aside>
      </div>
    </section>

    <section class="container academy-filter-wrap">
      <div class="academy-filter-panel">
        <div>
          <span class="academy-filter-label">Konu</span>
          <div class="academy-filter" id="academyCategoryFilter">
            ${ebRenderCourseCategoryButtons('tum')}
          </div>
        </div>

        <div>
          <span class="academy-filter-label">Seviye</span>
          <div class="academy-filter" id="academyLevelFilter">
            ${ebRenderCourseLevelButtons('tum')}
          </div>
        </div>
      </div>
    </section>

    <section class="container academy-layout-v2" id="academyLayoutV2">
      ${ebAcademyLoadingTemplate()}
    </section>
  `;

  await ebLoadAndRenderAcademyPage();
}

async function ebLoadAndRenderAcademyPage() {
  const layout = document.getElementById('academyLayoutV2');
  if (!layout) return;

  try {
    ebAcademyPageState.courses = await ebGetPublishedCourses(60);
    ebRenderAcademyLayout();
  } catch (error) {
    console.error('❌ Akademi sayfası yüklenemedi:', error);
    layout.innerHTML = ebAcademyEmptyTemplate('Kurslar yüklenirken bir hata oluştu.');
  }
}

function ebRenderAcademyLayout() {
  const layout = document.getElementById('academyLayoutV2');
  const categoryFilter = document.getElementById('academyCategoryFilter');
  const levelFilter = document.getElementById('academyLevelFilter');
  if (!layout) return;

  if (categoryFilter) {
    categoryFilter.innerHTML = ebRenderCourseCategoryButtons(ebAcademyPageState.category);
  }

  if (levelFilter) {
    levelFilter.innerHTML = ebRenderCourseLevelButtons(ebAcademyPageState.level);
  }

  ebBindAcademyFilterEvents();

  const filteredCourses = ebFilterCourses(ebAcademyPageState.courses, {
    category: ebAcademyPageState.category,
    level: ebAcademyPageState.level
  });

  if (!filteredCourses.length) {
    layout.innerHTML = ebAcademyEmptyTemplate('Bu filtrelerde yayınlanmış kurs bulunamadı.');
    return;
  }

  const featured = filteredCourses.find(course => course.featured === true) || filteredCourses[0];
  const remaining = filteredCourses.filter(course => course.id !== featured.id);

  layout.innerHTML = `
    <div class="academy-featured-course">
      ${ebCreateAcademyFeaturedCourse(featured)}
    </div>

    ${remaining.length ? `
      <div class="academy-section-title">
        <span>TÜM KURSLAR</span>
      </div>

      <div class="academy-course-grid">
        ${remaining.map(course => ebCreateAcademyCourseCard(course)).join('')}
      </div>
    ` : ''}
  `;
}

function ebRenderCourseCategoryButtons(activeCategory) {
  return ebGetCourseCategoriesForFilter().map(category => `
    <button
      type="button"
      class="academy-filter__btn ${category.key === activeCategory ? 'is-active' : ''}"
      data-filter-type="category"
      data-value="${category.key}"
    >
      ${category.label}
    </button>
  `).join('');
}

function ebRenderCourseLevelButtons(activeLevel) {
  return ebGetCourseLevelsForFilter().map(level => `
    <button
      type="button"
      class="academy-filter__btn ${level.key === activeLevel ? 'is-active' : ''}"
      data-filter-type="level"
      data-value="${level.key}"
    >
      ${level.label}
    </button>
  `).join('');
}

function ebBindAcademyFilterEvents() {
  const buttons = document.querySelectorAll('.academy-filter__btn');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.filterType;
      const value = button.dataset.value || 'tum';

      if (type === 'category') {
        ebAcademyPageState.category = value;
      }

      if (type === 'level') {
        ebAcademyPageState.level = value;
      }

      ebRenderAcademyLayout();
    });
  });
}

function ebCreateAcademyFeaturedCourse(course) {
  const title = ebEscapeHtml(course.title || 'Başlıksız Kurs');
  const summary = ebEscapeHtml(course.summary || course.description || '');
  const slug = ebEscapeHtml(course.slug || course.id || '');
  const instructor = ebEscapeHtml(course.instructor || 'Esti Biraz');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(course.category));
  const level = ebEscapeHtml(ebGetLevelLabel(course.level));
  const lessonTotal = course.totalLessons || course.lessonCount || course.lessonsCount || '';

  const imageHtml = course.coverImage
    ? `<img src="${ebEscapeHtml(course.coverImage)}" alt="${title}" loading="lazy">`
    : `<div class="academy-featured-placeholder">🎓</div>`;

  return `
    <a href="#/kurs/${slug}" class="academy-featured-card">
      <div class="academy-featured-card__image">
        ${imageHtml}
      </div>

      <div class="academy-featured-card__body">
        <div class="academy-course-meta">
          <span>${categoryLabel}</span>
          <span>${level}</span>
          ${lessonTotal ? `<span>${lessonTotal} ders</span>` : ''}
        </div>

        <h2>${title}</h2>

        ${summary ? `<p>${summary}</p>` : ''}

        <div class="academy-course-instructor">
          <span>Eğitmen</span>
          <strong>${instructor}</strong>
        </div>

        <strong class="academy-course-cta">Kursa Git →</strong>
      </div>
    </a>
  `;
}

function ebCreateAcademyCourseCard(course) {
  const title = ebEscapeHtml(course.title || 'Başlıksız Kurs');
  const summary = ebEscapeHtml(course.summary || course.description || '');
  const slug = ebEscapeHtml(course.slug || course.id || '');
  const instructor = ebEscapeHtml(course.instructor || 'Esti Biraz');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(course.category));
  const level = ebEscapeHtml(ebGetLevelLabel(course.level));
  const lessonTotal = course.totalLessons || course.lessonCount || course.lessonsCount || '';

  return `
    <a href="#/kurs/${slug}" class="academy-course-card">
      <div class="academy-course-card__top">
        <span>${categoryLabel}</span>
        <span>${level}</span>
      </div>

      <h3>${title}</h3>

      ${summary ? `<p>${summary}</p>` : ''}

      <div class="academy-course-card__meta">
        <span>👤 ${instructor}</span>
        ${lessonTotal ? `<span>📚 ${lessonTotal} ders</span>` : ''}
      </div>

      <strong>Kursa Git →</strong>
    </a>
  `;
}

function ebAcademyLoadingTemplate() {
  return `
    <div class="academy-state">
      <div class="loading-state__spinner"></div>
      <span>Kurslar yükleniyor...</span>
    </div>
  `;
}

function ebAcademyEmptyTemplate(message) {
  return `
    <div class="academy-state academy-state--empty">
      <strong>Bilgi</strong>
      <span>${ebEscapeHtml(message)}</span>
    </div>
  `;
}
