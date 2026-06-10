/* ESTİ BİRAZ — Home Page v2 */

async function renderHomePageV2() {
  const container = document.getElementById('app');
  if (!container) return;

  container.innerHTML = `
    ${ebHomeHeroTemplate()}
    ${ebTrustStripTemplate()}

    <section class="home-section container">
      <div class="section-header">
        <div>
          <span class="section-kicker">MAKALELER</span>
          <h2>Son Yazılar</h2>
          <p>Sağlık, eğitim, bilim, veri ve teknoloji alanlarında güncel ve anlaşılır içerikler.</p>
        </div>

        <a href="#/makaleler" class="section-link">Tüm Makaleler →</a>
      </div>

      <div id="latestArticlesGrid" class="articles-grid">
        ${ebLoadingTemplate('Makaleler yükleniyor...')}
      </div>
    </section>

    <section class="home-section home-section--soft">
      <div class="container">
        <div class="section-header">
          <div>
            <span class="section-kicker">AKADEMİ</span>
            <h2>Öne Çıkan Kurslar</h2>
            <p>Bilgiyi yalnızca okumakla bırakmayın; dersler ve kurslarla yapılandırılmış öğrenmeye dönüştürün.</p>
          </div>

          <a href="#/akademi" class="section-link">Tüm Kurslar →</a>
        </div>

        <div id="featuredCoursesGrid" class="courses-grid">
          ${ebLoadingTemplate('Kurslar yükleniyor...')}
        </div>
      </div>
    </section>
  `;

  await Promise.all([
    ebRenderLatestArticles(),
    ebRenderFeaturedCourses()
  ]);
}

function ebHomeHeroTemplate() {
  return `
    <section class="hero hero-modern">
      <div class="container hero-modern__inner">

        <div class="hero-brand-side">
          <img
            src="assets/logo.png"
            alt="Esti Biraz logosu"
            class="hero-logo-large"
          >

          <div class="hero-actions">
            <a href="#/makaleler" class="btn btn-primary hero-btn">Makaleleri Keşfet</a>
            <a href="#/akademi" class="btn btn-secondary hero-btn">Akademiye Göz At</a>
          </div>
        </div>

        <div class="hero-text-side">
          <h1>Bir Yudum Bilgi,<br>Biraz Merak.</h1>

          <p>
            Sağlık, eğitim, bilim, veri ve teknoloji alanlarında
            güvenilir makaleler, öğrenme içerikleri ve dijital kaynaklar.
          </p>
        </div>

      </div>
    </section>
  `;
}

function ebTrustStripTemplate() {
  return `
    <section class="trust-strip container">
      <div class="trust-card">
        <div class="trust-icon">📚</div>
        <div>
          <strong>Kaynaklı İçerik</strong>
          <span>Güvenilir bilgiye dayalı yazılar.</span>
        </div>
      </div>

      <div class="trust-card">
        <div class="trust-icon">✨</div>
        <div>
          <strong>Sade Anlatım</strong>
          <span>Karmaşık konular anlaşılır hale gelir.</span>
        </div>
      </div>

      <div class="trust-card">
        <div class="trust-icon">🎓</div>
        <div>
          <strong>Eğitim Odaklı</strong>
          <span>Makaleler, dersler ve öğrenme notları.</span>
        </div>
      </div>

      <div class="trust-card">
        <div class="trust-icon">📊</div>
        <div>
          <strong>Veri ve Bilim</strong>
          <span>Sağlık, teknoloji ve istatistik bakışı.</span>
        </div>
      </div>
    </section>
  `;
}

async function ebRenderLatestArticles() {
  const grid = document.getElementById('latestArticlesGrid');
  if (!grid) return;

  try {
    const articles = await ebGetLatestArticles(3);

    if (!articles.length) {
      grid.innerHTML = ebEmptyStateTemplate('Henüz yayınlanmış makale yok.');
      return;
    }

    grid.innerHTML = articles
      .map((article, index) => ebCreateArticleCard(article, { featured: index === 0 }))
      .join('');
  } catch (error) {
    console.error('❌ Ana sayfa makaleleri yüklenemedi:', error);
    grid.innerHTML = ebEmptyStateTemplate('Makaleler yüklenirken bir hata oluştu.');
  }
}

async function ebRenderFeaturedCourses() {
  const grid = document.getElementById('featuredCoursesGrid');
  if (!grid) return;

  try {
    const courses = await ebGetFeaturedCourses(3);

    if (!courses.length) {
      grid.innerHTML = ebEmptyStateTemplate('Henüz öne çıkan kurs yok.');
      return;
    }

    grid.innerHTML = courses
      .map(course => ebCreateCourseCard(course))
      .join('');
  } catch (error) {
    console.error('❌ Ana sayfa kursları yüklenemedi:', error);
    grid.innerHTML = ebEmptyStateTemplate('Kurslar yüklenirken bir hata oluştu.');
  }
}

function ebLoadingTemplate(message) {
  return `
    <div class="loading-state">
      <div class="loading-state__spinner"></div>
      <span>${ebEscapeHtml(message)}</span>
    </div>
  `;
}

function ebEmptyStateTemplate(message) {
  return `
    <div class="empty-state">
      <strong>Bilgi</strong>
      <span>${ebEscapeHtml(message)}</span>
    </div>
  `;
}
