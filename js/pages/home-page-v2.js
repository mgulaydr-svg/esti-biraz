/* ESTİ BİRAZ — Home Page v2 Editorial */

async function renderHomePageV2() {
  const container = document.getElementById('app');
  if (!container) return;

  container.innerHTML = `
    <main class="home-page-v2-editorial">
      <section class="home-hero-v2-editorial">
        <div class="container home-hero-v2-editorial__inner">
          <div class="home-hero-v2-editorial__brand">
            <img src="assets/logo.png" alt="ESTİ BİRAZ" class="home-hero-v2-editorial__logo">
            <div class="home-hero-v2-editorial__actions">
              <a href="#/makaleler" class="home-hero-v2-editorial__primary">Makaleleri Keşfet</a>
              <a href="#/akademi" class="home-hero-v2-editorial__secondary">Akademiye Göz At</a>
            </div>
          </div>

          <div class="home-hero-v2-editorial__text">
            <span>Bir Yudum Bilgi, Biraz Merak.</span>
            <h1>Sağlık, eğitim, bilim, veri ve teknoloji için güvenilir bilgi alanı.</h1>
            <p>
              ESTİ BİRAZ; makaleler, öğrenme içerikleri ve dijital kaynaklarla
              bilgiyi sade, kaynaklı ve uygulanabilir hale getirir.
            </p>
          </div>
        </div>
      </section>

      <section class="container home-trust-v2">
        <div class="home-trust-v2__item">
          <strong>Kaynaklı İçerik</strong>
          <span>Bilgi, mümkün olduğunca güvenilir kaynaklarla desteklenir.</span>
        </div>
        <div class="home-trust-v2__item">
          <strong>Sade Anlatım</strong>
          <span>Karmaşık konular anlaşılır ve öğrenilebilir hale getirilir.</span>
        </div>
        <div class="home-trust-v2__item">
          <strong>Eğitim Odaklı</strong>
          <span>Makaleler, dersler ve öğrenme materyalleri birlikte düşünülür.</span>
        </div>
        <div class="home-trust-v2__item">
          <strong>Veri ve Bilim</strong>
          <span>Sağlık, teknoloji ve istatistik bakışı bir araya getirilir.</span>
        </div>
      </section>

      <section class="container home-editorial-latest">
        <div class="home-editorial-section-head">
          <span>SON YAZILAR</span>
          <h2>Editoryal seçki</h2>
          <a href="#/makaleler">Tüm Makaleler →</a>
        </div>
        <div id="homeLatestArticlesV2">${ebHomeLoadingTemplate('Yazılar yükleniyor...')}</div>
      </section>

      <section class="container home-academy-preview">
        <div class="home-editorial-section-head">
          <span>AKADEMİ</span>
          <h2>Öğrenme rotaları</h2>
          <a href="#/akademi">Tüm Kurslar →</a>
        </div>
        <div id="homeFeaturedCoursesV2">${ebHomeLoadingTemplate('Kurslar yükleniyor...')}</div>
      </section>
    </main>
  `;

  await Promise.all([
    ebRenderHomeLatestArticles(),
    ebRenderHomeFeaturedCourses()
  ]);
}

async function ebRenderHomeLatestArticles() {
  const target = document.getElementById('homeLatestArticlesV2');
  if (!target) return;

  try {
    const articles = typeof ebGetPublishedArticles === 'function'
      ? await ebGetPublishedArticles(6)
      : [];

    if (!articles.length) {
      target.innerHTML = ebHomeEmptyTemplate('Henüz yayınlanmış makale yok.');
      return;
    }

    const lead = articles[0];
    const side = articles.slice(1, 3);
    const rest = articles.slice(3, 6);

    target.innerHTML = `
      <div class="home-editorial-grid">
        ${ebCreateHomeLeadArticle(lead)}
        <div class="home-editorial-side">
          ${side.map(article => ebCreateHomeSmallArticle(article)).join('')}
        </div>
      </div>

      ${rest.length ? `
        <div class="home-editorial-more">
          ${rest.map(article => ebCreateHomeMiniArticle(article)).join('')}
        </div>
      ` : ''}
    `;
  } catch (error) {
    console.error('❌ Ana sayfa yazıları yüklenemedi:', error);
    target.innerHTML = ebHomeEmptyTemplate('Yazılar yüklenirken bir hata oluştu.');
  }
}

async function ebRenderHomeFeaturedCourses() {
  const target = document.getElementById('homeFeaturedCoursesV2');
  if (!target) return;

  try {
    const courses = typeof ebGetFeaturedCourses === 'function'
      ? await ebGetFeaturedCourses(3)
      : [];

    if (!courses.length) {
      target.innerHTML = ebHomeEmptyTemplate('Henüz yayınlanmış kurs yok.');
      return;
    }

    target.innerHTML = `
      <div class="home-course-preview-grid">
        ${courses.map(course => ebCreateHomeCourseCard(course)).join('')}
      </div>
    `;
  } catch (error) {
    console.error('❌ Ana sayfa kursları yüklenemedi:', error);
    target.innerHTML = ebHomeEmptyTemplate('Kurslar yüklenirken bir hata oluştu.');
  }
}

function ebCreateHomeLeadArticle(article) {
  const title = ebEscapeHtml(article.title || 'Başlıksız Makale');
  const summary = ebEscapeHtml(article.summary || '');
  const slug = ebEscapeHtml(article.slug || article.id || '');
  const category = ebEscapeHtml(article.category || 'diger');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(article.category));
  const image = article.coverImage
    ? `<img src="${ebEscapeHtml(article.coverImage)}" alt="${title}" loading="lazy">`
    : `<div class="home-article-placeholder">📝</div>`;

  return `
    <a href="#/makale/${slug}" class="home-lead-article category-line--${category}">
      <div class="home-lead-article__image">${image}</div>
      <div class="home-lead-article__body">
        <span>${categoryLabel}</span>
        <h3>${title}</h3>
        ${summary ? `<p>${summary}</p>` : ''}
        <strong>Oku →</strong>
      </div>
    </a>
  `;
}

function ebCreateHomeSmallArticle(article) {
  const title = ebEscapeHtml(article.title || 'Başlıksız Makale');
  const summary = ebEscapeHtml(article.summary || '');
  const slug = ebEscapeHtml(article.slug || article.id || '');
  const category = ebEscapeHtml(article.category || 'diger');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(article.category));

  return `
    <a href="#/makale/${slug}" class="home-small-article category-line--${category}">
      <span>${categoryLabel}</span>
      <h3>${title}</h3>
      ${summary ? `<p>${summary}</p>` : ''}
      <strong>Oku →</strong>
    </a>
  `;
}

function ebCreateHomeMiniArticle(article) {
  const title = ebEscapeHtml(article.title || 'Başlıksız Makale');
  const slug = ebEscapeHtml(article.slug || article.id || '');
  const category = ebEscapeHtml(article.category || 'diger');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(article.category));

  return `
    <a href="#/makale/${slug}" class="home-mini-article category-line--${category}">
      <span>${categoryLabel}</span>
      <strong>${title}</strong>
    </a>
  `;
}

function ebCreateHomeCourseFallback(course) {
  const title = ebEscapeHtml(course.title || 'Başlıksız Kurs');
  const slug = ebEscapeHtml(course.slug || course.id || '');
  const summary = ebEscapeHtml(course.description || course.summary || '');

  return `
    <a href="#/kurs/${slug}" class="home-course-fallback-card">
      <span>AKADEMİ</span>
      <h3>${title}</h3>
      ${summary ? `<p>${summary}</p>` : ''}
      <strong>Kursa Git →</strong>
    </a>
  `;
}

function ebCreateHomeCourseCard(course) {
  const title = ebEscapeHtml(course.title || 'Başlıksız Kurs');
  const slug = ebEscapeHtml(course.slug || course.id || '');
  const category = ebEscapeHtml(course.category || 'diger');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(course.category));
  const level = ebEscapeHtml(ebGetLevelLabel(course.level));
  const instructor = ebEscapeHtml(course.instructor || 'Esti Biraz');
  const lessonTotal = course.totalLessons || course.lessonCount || course.lessonsCount || '';

  const summary = ebEscapeHtml(
    ebTruncateText(course.description || course.summary || '', 125)
  );

  return `
    <a href="#/kurs/${slug}" class="home-course-card category-line--${category}">
      <div class="home-course-card__meta">
        <span>${categoryLabel}</span>
        ${level ? `<span>${level}</span>` : ''}
      </div>

      <h3>${title}</h3>

      ${summary ? `<p>${summary}</p>` : ''}

      <div class="home-course-card__footer">
        <span>👤 ${instructor}</span>
        ${lessonTotal ? `<span>📚 ${lessonTotal} ders</span>` : ''}
      </div>

      <strong>Kursa Git →</strong>
    </a>
  `;
}

function ebTruncateText(text, maxLength = 125) {
  if (!text) return '';

  const cleanText = String(text).trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  return cleanText.slice(0, maxLength).trim().replace(/[.,;:!?-]$/, '') + '…';
}

function ebHomeLoadingTemplate(message) {
  return `
    <div class="home-state-v2">
      <div class="loading-state__spinner"></div>
      <span>${ebEscapeHtml(message)}</span>
    </div>
  `;
}

function ebHomeEmptyTemplate(message) {
  return `
    <div class="home-state-v2 home-state-v2--empty">
      <strong>Bilgi</strong>
      <span>${ebEscapeHtml(message)}</span>
    </div>
  `;
}
