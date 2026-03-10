/* ============================================
   ESTİ BİRAZ — Firestore Veri Çekme (firestore-data.js)
   ============================================ */

//const db = firebase.firestore();

// ══════════════════════════════════════════════
//  MAKALE FONKSİYONLARI
// ══════════════════════════════════════════════

/**
 * Son makaleleri çeker (ana sayfa için)
 * @param {number} limit - Kaç makale çekilecek (varsayılan: 3)
 */


/* ============================================
   ANA SAYFA — Hero Section + Son Makaleler
   ============================================ */

async function loadLatestArticles() {
  const container = document.getElementById('app');

  try {
    const snapshot = await db.collection('articles')
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .limit(3)
      .get();

    const articles = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(a => a && a.title);

    console.log('📦 Bulunan makale sayısı:', articles.length);

    const heroArticle = articles.length > 0 ? articles[0] : null;
    const otherArticles = articles.length > 1 ? articles.slice(1) : [];

    // Tarih formatlama yardımcısı
    function formatDate(item) {
      if (item && item.publishedAt && typeof item.publishedAt.toDate === 'function') {
        return item.publishedAt.toDate().toLocaleDateString('tr-TR', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
      }
      return '';
    }

    // Öne çıkan makale HTML
    let featuredHtml = '';
    if (heroArticle) {
      featuredHtml = `
        <section class="featured-article">
          <div class="container">
            <a href="#/makale/${heroArticle.slug}" class="featured-article__inner">
              <div class="featured-article__image">
                ${heroArticle.coverImage
                  ? '<img src="' + heroArticle.coverImage + '" alt="' + heroArticle.title + '" loading="lazy">'
                  : '<div class="featured-article__placeholder">📝</div>'}
              </div>
              <div class="featured-article__content">
                <span class="badge badge--${heroArticle.category} badge--lg">${getCategoryLabel(heroArticle.category)}</span>
                <h2 class="featured-article__title">${heroArticle.title}</h2>
                <p class="featured-article__summary">${heroArticle.summary || ''}</p>
                <div class="featured-article__meta">
                  <span>✍️ ${heroArticle.author || ''}</span>
                  <span>📅 ${formatDate(heroArticle)}</span>
                </div>
              </div>
            </a>
          </div>
        </section>
      `;
    }

    // Diğer makaleler HTML
    let otherHtml = '';
    for (let i = 0; i < otherArticles.length; i++) {
      const a = otherArticles[i];
      if (!a || !a.title) continue;
      const rt = calculateReadingTime(a.content || '');
      otherHtml += `
        <a href="#/makale/${a.slug}" class="article-card">
          <div class="article-card__image">
            ${a.coverImage
              ? '<img src="' + a.coverImage + '" alt="' + a.title + '" loading="lazy">'
              : '<div class="article-card__placeholder">📝</div>'}
          </div>
          <div class="article-card__body">
            <span class="badge badge--${a.category}">${getCategoryLabel(a.category)}</span>
            <h3 class="article-card__title">${a.title}</h3>
            <p class="article-card__summary">${a.summary || ''}</p>
            <div class="article-card__meta">
              <span>✍️ ${a.author || ''}</span>
              <span>📅 ${formatDate(a)}</span>
              <span>⏱️ ${rt} dk</span>
            </div>
          </div>
        </a>
      `;
    }

    container.innerHTML = `
      <section class="hero">
        <div class="container">
          <div class="hero__content">
            <span class="hero__badge">☕ ESTİ BİRAZ</span>
            <h1 class="hero__title">Bir Yudum Bilgi,<br>Bir Tas Kültür.</h1>
            <p class="hero__desc">
              Teknolojiden sanata, bilimden yaşama — merakını besle, ufkunu genişlet.
            </p>
            <div class="hero__actions">
              <a href="#/magazin" class="btn btn--primary btn--lg">📰 Magazin'e Gözat</a>
              <a href="#/akademi" class="btn btn--outline btn--lg">🎓 Kursları Keşfet</a>
            </div>
          </div>
          <div class="hero__visual">
            <div class="hero__card-stack">
              <div class="hero__card hero__card--1">☕</div>
              <div class="hero__card hero__card--2">📚</div>
              <div class="hero__card hero__card--3">💡</div>
            </div>
          </div>
        </div>
      </section>

      ${featuredHtml}

      <section class="latest-articles">
        <div class="container">
          <div class="section-header">
            <h2 class="section-header__title">📰 Son Makaleler</h2>
            <a href="#/magazin" class="section-header__link">Tümünü Gör →</a>
          </div>
          <div class="articles-grid articles-grid--home">
            ${otherHtml || '<p style="text-align:center;color:gray;">Henüz başka makale yok.</p>'}
          </div>
        </div>
      </section>

      <div id="featuredCourses"></div>
    `;

    loadFeaturedCourses();
    console.log('🏠 Ana sayfa yüklendi.');
  } catch (error) {
    console.error('❌ Ana sayfa yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Sayfa yüklenirken hata oluştu.</p>';
  }
}

/**
 * Makale kartı oluşturur (tekrar kullanılabilir)
 */
function createArticleCard(article) {
  if (!article) return '';

  const date = article.publishedAt && article.publishedAt.toDate
    ? article.publishedAt.toDate().toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : '';

  const readingTime = calculateReadingTime(article.content || '');

  return `
    <a href="#/makale/${article.slug}" class="article-card">
      <div class="article-card__image">
        ${article.coverImage
          ? '<img src="' + article.coverImage + '" alt="' + article.title + '" loading="lazy">'
          : '<div class="article-card__placeholder">📝</div>'}
      </div>
      <div class="article-card__body">
        <span class="badge badge--${article.category}">${getCategoryLabel(article.category)}</span>
        <h3 class="article-card__title">${article.title}</h3>
        <p class="article-card__summary">${article.summary || ''}</p>
        <div class="article-card__meta">
          <span>✍️ ${article.author || ''}</span>
          <span>📅 ${date}</span>
          <span>⏱️ ${readingTime} dk</span>
        </div>
      </div>
    </a>
  `;
}


/**
 * Tüm makaleleri çeker (magazin sayfası için)
 * @param {string} category - Kategori filtresi ('all' = tümü)
 */

/* ============================================
   MAGAZİN — Tüm Makaleleri Yükle (Filtreleme + Sayfalama)
   ============================================ */

const ARTICLES_PER_PAGE = 6;
let currentPage = 1;
let currentCategory = 'all';
let currentSearchQuery = '';
let allArticlesCache = [];

/**
 * Tüm makaleleri Firestore'dan çeker ve önbelleğe alır
 */
async function fetchAllArticles() {
  try {
    const snapshot = await db.collection('articles')
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .get();

    allArticlesCache = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return allArticlesCache;
  } catch (error) {
    console.error('❌ Makaleler çekilemedi:', error);
    return [];
  }
}

/**
 * Makaleleri filtreler (kategori + arama)
 */
function filterArticles(articles) {
  let filtered = [...articles];

  // Kategori filtresi
  if (currentCategory !== 'all') {
    filtered = filtered.filter(a => a.category === currentCategory);
  }

  // Arama filtresi
  if (currentSearchQuery) {
    const query = currentSearchQuery.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.summary?.toLowerCase().includes(query) ||
      a.author?.toLowerCase().includes(query) ||
      a.tags?.some(t => t.toLowerCase().includes(query))
    );
  }

  return filtered;
}

/**
 * Sayfalama ile makaleleri dilimler
 */
function paginateArticles(articles, page) {
  const start = (page - 1) * ARTICLES_PER_PAGE;
  const end = start + ARTICLES_PER_PAGE;
  return articles.slice(start, end);
}

/**
 * Magazin sayfasını render eder
 */
async function loadAllArticles() {
  const container = document.getElementById('app');

  container.innerHTML = `
    <section class="magazin-page">
      <div class="container">
        <div class="magazin-header">
          <h1 class="magazin-header__title">📰 Magazin</h1>
          <p class="magazin-header__desc">Tüm makaleler, tek bir yerde.</p>
        </div>

        <!-- Arama Barı -->
        <div class="magazin-search">
          <input type="text" id="articleSearchInput" class="magazin-search__input"
                 placeholder="🔍 Makale ara... (başlık, yazar, etiket)"
                 value="${currentSearchQuery}">
        </div>

        <!-- Kategori Filtreleri -->
        <div class="magazin-filters" id="categoryFilters">
  	  <button class="filter-btn ${currentCategory === 'all' ? 'active' : ''}" data-category="all">Tümü</button>
  	  <button class="filter-btn ${currentCategory === 'saglik' ? 'active' : ''}" data-category="saglik">🏥 Sağlık</button>
  	  <button class="filter-btn ${currentCategory === 'bilim' ? 'active' : ''}" data-category="bilim">🔬 Bilim</button>
  	  <button class="filter-btn ${currentCategory === 'egitim' ? 'active' : ''}" data-category="egitim">📖 Eğitim</button>
  	  <button class="filter-btn ${currentCategory === 'teknoloji' ? 'active' : ''}" data-category="teknoloji">💻 Teknoloji</button>
  	  <button class="filter-btn ${currentCategory === 'yasam' ? 'active' : ''}" data-category="yasam">🌿 Yaşam</button>
  	  <button class="filter-btn ${currentCategory === 'kultur' ? 'active' : ''}" data-category="kultur">🎭 Kültür</button>
  	  <button class="filter-btn ${currentCategory === 'diger' ? 'active' : ''}" data-category="diger">📌 Diğer</button>
	</div>

        <!-- Makale Listesi -->
        <div class="articles-grid" id="articlesGrid">
          <div class="loading-state">Makaleler yükleniyor...</div>
        </div>

        <!-- Sayfalama -->
        <div class="pagination" id="pagination"></div>
      </div>
    </section>
  `;

  // Event listener'ları bağla
  setupMagazinEvents();

  // Makaleleri yükle
  if (allArticlesCache.length === 0) {
    await fetchAllArticles();
  }

  renderArticles();
}

/**
 * Magazin event listener'larını kurar
 */
function setupMagazinEvents() {
  // Kategori filtreleri
  const filtersContainer = document.getElementById('categoryFilters');
  if (filtersContainer) {
    filtersContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      currentCategory = btn.dataset.category;
      currentPage = 1;

      // Aktif butonu güncelle
      filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      renderArticles();
    });
  }

  // Arama input'u (debounce ile)
  const searchInput = document.getElementById('articleSearchInput');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearchQuery = e.target.value.trim();
        currentPage = 1;
        renderArticles();
      }, 300);
    });
  }
}

/**
 * Filtrelenmiş ve sayfalanmış makaleleri render eder
 */
function renderArticles() {
  const grid = document.getElementById('articlesGrid');
  const paginationContainer = document.getElementById('pagination');
  if (!grid) return;

  const filtered = filterArticles(allArticlesCache);
  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
  const paginated = paginateArticles(filtered, currentPage);

  if (paginated.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>🔍 Aramanızla eşleşen makale bulunamadı.</p>
        <button class="btn btn--secondary btn--sm" onclick="resetFilters()">Filtreleri Temizle</button>
      </div>
    `;
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  // Aktif filtre göstergesi
  const filterInfo = document.querySelector('.magazin-filter-info');
  if (currentCategory !== 'all' || currentSearchQuery) {
    if (!filterInfo) {
      const info = document.createElement('div');
      info.className = 'magazin-filter-info';
      grid.parentNode.insertBefore(info, grid);
    }
    const infoEl = document.querySelector('.magazin-filter-info');
    if (infoEl) {
      infoEl.innerHTML = `
        <span>${filtered.length} makale bulundu</span>
        <button class="btn btn--secondary btn--sm" onclick="resetFilters()">✕ Filtreleri Temizle</button>
    `  ;
    }
  } else if (filterInfo) {
    filterInfo.remove();
  }
  grid.innerHTML = paginated.map(article => {
    const date = article.publishedAt?.toDate
      ? article.publishedAt.toDate().toLocaleDateString('tr-TR', {
          day: 'numeric', month: 'long', year: 'numeric'
        })
      : '';

    const readingTime = calculateReadingTime(article.content || '');

    return `
      <a href="#/makale/${article.slug}" class="article-card">
        <div class="article-card__image">
          ${article.coverImage
            ? `<img src="${article.coverImage}" alt="${article.title}" loading="lazy">`
            : '<div class="article-card__placeholder">📝</div>'}
        </div>
        <div class="article-card__body">
          <span class="badge badge--${article.category}">${getCategoryLabel(article.category)}</span>
          <h3 class="article-card__title">${article.title}</h3>
          <p class="article-card__summary">${article.summary || ''}</p>
          <div class="article-card__meta">
            <span>✍️ ${article.author}</span>
            <span>📅 ${date}</span>
            <span>⏱️ ${readingTime} dk</span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  // Sayfalama
  if (paginationContainer && totalPages > 1) {
    paginationContainer.innerHTML = createPagination(currentPage, totalPages);
  } else if (paginationContainer) {
    paginationContainer.innerHTML = '';
  }

  console.log(`📰 ${paginated.length}/${filtered.length} makale gösteriliyor (Sayfa ${currentPage}/${totalPages})`);
}

/**
 * Filtreleri sıfırlar
 */
function resetFilters() {
  currentCategory = 'all';
  currentSearchQuery = '';
  currentPage = 1;

  const searchInput = document.getElementById('articleSearchInput');
  if (searchInput) searchInput.value = '';

  const filtersContainer = document.getElementById('categoryFilters');
  if (filtersContainer) {
    filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = filtersContainer.querySelector('[data-category="all"]');
    if (allBtn) allBtn.classList.add('active');
  }

  renderArticles();
}

/**
 * Sayfalama HTML'i oluşturur
 */
function createPagination(current, total) {
  let html = '<div class="pagination__inner">';

  // Önceki
  html += `<button class="pagination__btn ${current === 1 ? 'disabled' : ''}"
           onclick="goToPage(${current - 1})" ${current === 1 ? 'disabled' : ''}>
           ← Önceki
           </button>`;

  // Sayfa numaraları
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
      html += `<button class="pagination__num ${i === current ? 'active' : ''}"
               onclick="goToPage(${i})">${i}</button>`;
    } else if (i === current - 2 || i === current + 2) {
      html += '<span class="pagination__dots">...</span>';
    }
  }

  // Sonraki
  html += `<button class="pagination__btn ${current === total ? 'disabled' : ''}"
           onclick="goToPage(${current + 1})" ${current === total ? 'disabled' : ''}>
           Sonraki →
           </button>`;

  html += '</div>';
  return html;
}

/**
 * Belirtilen sayfaya gider
 */
function goToPage(page) {
  const filtered = filterArticles(allArticlesCache);
  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);

  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderArticles();

  // Sayfanın üstüne scroll
  document.querySelector('.magazin-filters')?.scrollIntoView({ behavior: 'smooth' });
}


/**
 * Tekil makale yükler (slug'a göre)
 * @param {string} slug - Makale slug'ı
 */
async function loadArticle(slug) {
  const container = document.getElementById('app');

  try {
    const snapshot = await db.collection('articles')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      render404();
      return;
    }

    const article = snapshot.docs[0].data();
    const date = article.publishedAt?.toDate
      ? article.publishedAt.toDate().toLocaleDateString('tr-TR', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      : '';

    // Okuma süresi hesapla
    const readingTime = calculateReadingTime(article.content);

    // Makale URL'si
    const articleUrl = window.location.origin + '/#/makale/' + slug;

    // İstatistikleri ve beğeni durumunu al
    const [stats, isLiked] = await Promise.all([
      getArticleStats(slug),
      hasUserLiked(slug)
    ]);

    container.innerHTML = `
      <article class="article-detail">
        <div class="container container--narrow">
          <a href="#/magazin" class="back-link">← Magazin'e Dön</a>

          ${article.coverImage
            ? `<div class="article-detail__cover">
                 <img src="${article.coverImage}" alt="${article.title}">
               </div>`
            : ''}

          <div class="article-detail__meta">
            <span class="article-detail__category badge badge--${article.category}">${getCategoryLabel(article.category)}</span>
            <span class="article-detail__date">${date}</span>
            ${createReadingTimeBadge(readingTime)}
            <span class="article-detail__views">👁️ ${stats.views} görüntülenme</span>
          </div>

          <h1 class="article-detail__title">${article.title}</h1>
          <p class="article-author">✍️ ${article.author}</p>

          <div class="article-detail__content">
            ${article.content}
          </div>

          <div class="article-detail__actions">
            ${createLikeButton(slug, stats.likes, isLiked)}
            ${createShareButtons(article.title, articleUrl)}
          </div>
        </div>
      </article>

      ${createCommentForm(slug)}
      <div id="relatedArticles"></div>
    `;

    // Görüntülenme sayacını artır
    incrementViewCount(slug);

    // Yorumları yükle
    loadComments(slug);

    // İlgili makaleleri yükle
    loadRelatedArticles(slug, article.category);

    document.title = `${article.title} — ESTİ BİRAZ`;
    window.scrollTo(0, 0);
    console.log('📄 Makale yüklendi:', article.title);
  } catch (error) {
    console.error('❌ Makale yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Makale yüklenirken hata oluştu.</p>';
  }
}
// ══════════════════════════════════════════════
//  KURS FONKSİYONLARI
// ══════════════════════════════════════════════

/**
 * Öne çıkan kursları çeker (ana sayfa için)
 * @param {number} limit - Kaç kurs çekilecek (varsayılan: 3)
 */
async function loadFeaturedCourses(limit = 3) {
  const container = document.getElementById('featuredCourses');
  if (!container) return;

  try {
    const snapshot = await db.collection('courses')
      .where('featured', '==', true)
      .limit(limit)
      .get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="empty-state">Henüz kurs yok.</p>';
      return;
    }

    const coursesHtml = snapshot.docs
      .map(doc => createCourseCard(doc.id, doc.data()))
      .join('');

    container.innerHTML = `
      <section class="featured-courses">
        <div class="container">
          <div class="section-header">
            <h2 class="section-header__title">🎓 Öne Çıkan Kurslar</h2>
            <a href="#/akademi" class="section-header__link">Tümünü Gör →</a>
          </div>
          <div class="courses-grid">
            ${coursesHtml}
          </div>
        </div>
      </section>
`    ;

    console.log(`🎓 ${snapshot.size} öne çıkan kurs yüklendi.`);
  } catch (error) {
    console.error('❌ Kurslar yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Kurslar yüklenirken hata oluştu.</p>';
  }
}

/**
 * Tüm kursları çeker (akademi sayfası için)
 */
/* ============================================
   AKADEMİ — Tüm Kurslar Sayfası
   ============================================ */

async function loadAllCourses() {
  const container = document.getElementById('app');

  container.innerHTML = `
    <section class="akademi-page">
      <div class="container">
        <div class="akademi-header">
          <h1 class="akademi-header__title">🎓 Akademi</h1>
          <p class="akademi-header__desc">Bilgiyi keşfet, kendini geliştir.</p>
        </div>

        <div class="courses-grid" id="coursesGrid">
          <div class="loading-state">Kurslar yükleniyor...</div>
        </div>
      </div>
    </section>
  `;

  try {
    const snapshot = await db.collection('courses')
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .get();

    const grid = document.getElementById('coursesGrid');
    if (!grid) return;

    if (snapshot.empty) {
      grid.innerHTML = '<p class="empty-state">Henüz kurs eklenmemiş. Yakında burada olacak! 🚀</p>';
      return;
    }

    grid.innerHTML = snapshot.docs
      .map(doc => createCourseCard(doc.id, doc.data()))
      .join('');

    console.log(`🎓 ${snapshot.size} kurs yüklendi.`);
  } catch (error) {
    console.error('❌ Kurslar yüklenemedi:', error);
    const grid = document.getElementById('coursesGrid');
    if (grid) {
      grid.innerHTML = '<p class="error-state">Kurslar yüklenirken hata oluştu.</p>';
    }
  }
}

/**
 * Tekil kurs yükler (slug'a göre)
 * @param {string} slug - Kurs slug'ı
 */
async function loadCourse(slug) {
  const container = document.getElementById('app');

  try {
    const snapshot = await db.collection('courses')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      render404();
      return;
    }

    const course = snapshot.docs[0].data();

    container.innerHTML = `
      <section class="section">
        <div class="container container--narrow">
          <a href="#/akademi" class="back-link">← Akademi'ye Dön</a>

          ${course.coverImage
            ? `<img src="${course.coverImage}" alt="${course.title}" class="article-cover">`
            : ''}

          <h1 class="article-title">${course.title}</h1>

          <div class="course-info">
            <div class="course-info__item">
              <span class="course-info__label">👨‍🏫 Eğitmen</span>
              <span class="course-info__value">${course.instructor}</span>
            </div>
            <div class="course-info__item">
              <span class="course-info__label">⏱️ Süre</span>
              <span class="course-info__value">${course.duration}</span>
            </div>
            <div class="course-info__item">
              <span class="course-info__label">📚 Ders Sayısı</span>
              <span class="course-info__value">${course.lessonCount} ders</span>
            </div>
            <div class="course-info__item">
              <span class="course-info__label">📊 Seviye</span>
              <span class="course-info__value">${getLevelLabel(course.level)}</span>
            </div>
          </div>

          <div class="article-body">
            <h2>Kurs Hakkında</h2>
            <p>${course.description}</p>
          </div>

          <div class="course-cta">
            <button class="btn btn--primary btn--lg" onclick="alert('Kayıt sistemi yakında!')">
              🎓 Kursa Kayıt Ol
            </button>
          </div>
        </div>
      </section>
    `;

    document.title = `${course.title} — ESTİ BİRAZ`;
    console.log('🎓 Kurs yüklendi:', course.title);
  } catch (error) {
    console.error('❌ Kurs yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Kurs yüklenirken hata oluştu.</p>';
  }
}

// ══════════════════════════════════════════════
//  KART OLUŞTURMA (HTML TEMPLATE'LERİ)
// ══════════════════════════════════════════════

/**
 * Makale kartı HTML'i oluşturur
 */
function createArticleCard(id, article) {
  const date = article.publishedAt?.toDate
    ? article.publishedAt.toDate().toLocaleDateString('tr-TR', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    : '';

  return `
    <a href="#/makale/${article.slug}" class="card">
      <div class="card__image">
        <img src="${article.coverImage || 'https://placehold.co/400x200?text=ESTİ+BİRAZ'}" 
             alt="${article.title}" loading="lazy">
        <span class="card__badge badge--${article.category}">${getCategoryLabel(article.category)}</span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${article.title}</h3>
        <p class="card__desc">${article.summary}</p>
        <div class="card__footer">
          <span class="card__author">✍️ ${article.author}</span>
          <span class="card__date">${date}</span>
        </div>
      </div>
    </a>
  `;
}

/**
 * Kurs kartı HTML'i oluşturur
 */
function createCourseCard(id, course) {
  return `
    <a href="#/kurs/${course.slug}" class="card">
      <div class="card__image">
        <img src="${course.coverImage || 'https://placehold.co/400x200?text=ESTİ+BİRAZ'}" 
             alt="${course.title}" loading="lazy">
        <span class="card__badge badge--course">${getLevelLabel(course.level)}</span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${course.title}</h3>
        <p class="card__desc">${course.description}</p>
        <div class="card__footer">
          <span class="card__meta">📚 ${course.lessonCount} ders</span>
          <span class="card__meta">⏱️ ${course.duration}</span>
        </div>
      </div>
    </a>
  `;
}

// ══════════════════════════════════════════════
//  YARDIMCI FONKSİYONLAR
// ══════════════════════════════════════════════

/**
 * Kategori kodunu Türkçe etikete çevirir
 */
function getCategoryLabel(category) {
  const labels = {
    saglik: '🏥 Sağlık',
    bilim: '🔬 Bilim',
    egitim: '📖 Eğitim',
    teknoloji: '💻 Teknoloji',
    yasam: '🌿 Yaşam',
    kultur: '🎭 Kültür',
    diger: '📌 Diğer'
  };
  return labels[category] || category || '';
}

/**
 * Seviye kodunu Türkçe etikete çevirir
 */
function getLevelLabel(level) {
  const labels = {
    baslangic: '🟢 Başlangıç',
    orta: '🟡 Orta',
    ileri: '🔴 İleri'
  };
  return labels[level] || level;
}

/* ============================================
   EĞİTİM AKADEMİSİ — Kurs Fonksiyonları
   ============================================ */

/**
 * Seviye etiketini döndürür
 */
function getLevelLabel(level) {
  const labels = {
    baslangic: '🟢 Başlangıç',
    orta: '🟡 Orta',
    ileri: '🔴 İleri'
  };
  return labels[level] || level || '';
}

/**
 * Kurs detay sayfasını yükler
 */
async function loadCourse(slug) {
  const container = document.getElementById('app');

  try {
    // Kursu slug ile bul
    const snapshot = await db.collection('courses')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      render404();
      return;
    }

    const courseDoc = snapshot.docs[0];
    const course = courseDoc.data();
    const courseId = courseDoc.id;

    // Dersleri yükle (sıralı)
    const lessonsSnapshot = await db.collection('courses')
      .doc(courseId)
      .collection('lessons')
      .orderBy('order', 'asc')
      .get();

    const lessons = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Kullanıcı kayıt durumunu kontrol et
    let enrollment = null;
    const user = firebase.auth().currentUser;
    if (user) {
      const enrollSnapshot = await db.collection('enrollments')
        .where('userId', '==', user.uid)
        .where('courseId', '==', courseId)
        .limit(1)
        .get();

      if (!enrollSnapshot.empty) {
        enrollment = {
          id: enrollSnapshot.docs[0].id,
          ...enrollSnapshot.docs[0].data()
        };
      }
    }

    // Tarihi formatla
    const date = course.publishedAt && course.publishedAt.toDate
      ? course.publishedAt.toDate().toLocaleDateString('tr-TR', {
          day: 'numeric', month: 'long', year: 'numeric'
        })
      : '';

    // Toplam süreyi hesapla
    const totalDuration = lessons.reduce((sum, l) => sum + (l.durationMin || 0), 0);
    const hours = Math.floor(totalDuration / 60);
    const mins = totalDuration % 60;
    const durationText = hours > 0 ? `${hours} saat ${mins} dk` : `${mins} dk`;

    // İlerleme hesapla
    const completedLessons = enrollment ? (enrollment.completedLessons || []) : [];
    const progressPercent = lessons.length > 0
      ? Math.round((completedLessons.length / lessons.length) * 100)
      : 0;

    container.innerHTML = `
      <div class="course-detail">
        <div class="container">
          <a href="#/akademi" class="back-link">← Akademi'ye Dön</a>

          <!-- KURS HEADER -->
          <div class="course-detail__header">
            <div class="course-detail__info">
              <div class="course-detail__badges">
                <span class="badge badge--${course.category}">${getCategoryLabel(course.category)}</span>
                <span class="badge badge--level">${getLevelLabel(course.level)}</span>
              </div>
              <h1 class="course-detail__title">${course.title}</h1>
              <p class="course-detail__desc">${course.description || ''}</p>
              <div class="course-detail__meta">
                <span>👨‍🏫 ${course.instructor || ''}</span>
                <span>📅 ${date}</span>
                <span>📚 ${lessons.length} Ders</span>
                <span>⏱️ ${durationText}</span>
              </div>

              ${enrollment
                ? `<div class="course-detail__progress">
                     <div class="progress-bar">
                       <div class="progress-bar__fill" style="width: ${progressPercent}%"></div>
                     </div>
                     <span class="progress-bar__text">%${progressPercent} tamamlandı (${completedLessons.length}/${lessons.length} ders)</span>
                   </div>
                   <a href="#/ders/${course.slug}/1" class="btn btn--primary btn--lg">
                     ▶️ Devam Et
                   </a>`
                : `<button class="btn btn--primary btn--lg" onclick="enrollCourse('${courseId}', '${course.slug}')">
                     🎓 Kursa Kayıt Ol (Ücretsiz)
                   </button>`
              }
            </div>
            <div class="course-detail__cover">
              ${course.coverImage
                ? '<img src="' + course.coverImage + '" alt="' + course.title + '" loading="lazy">'
                : '<div class="course-detail__cover-placeholder">🎓</div>'}
            </div>
          </div>

          <!-- DERS LİSTESİ -->
          <section class="course-lessons">
            <h2 class="course-lessons__title">📋 Müfredat</h2>
            <div class="course-lessons__list">
              ${lessons.map((lesson, index) => {
                const isCompleted = completedLessons.includes(lesson.order);
                const isLocked = !enrollment && !lesson.isFree;
                const lessonIcon = isCompleted ? '✅' : isLocked ? '🔒' : getTypeIcon(lesson.type);

                return `
                  <div class="lesson-item ${isCompleted ? 'lesson-item--completed' : ''} ${isLocked ? 'lesson-item--locked' : ''}">
                    <div class="lesson-item__number">${lessonIcon}</div>
                    <div class="lesson-item__info">
                      <h4 class="lesson-item__title">${lesson.title}</h4>
                      <div class="lesson-item__meta">
                        <span>${getTypeLabel(lesson.type)}</span>
                        ${lesson.durationMin ? '<span>⏱️ ' + lesson.durationMin + ' dk</span>' : ''}
                        ${lesson.isFree ? '<span class="lesson-item__free">Ücretsiz</span>' : ''}
                      </div>
                    </div>
                    <div class="lesson-item__action">
                      ${isLocked
                        ? '<span class="lesson-item__lock-text">Kayıt gerekli</span>'
                        : '<a href="#/ders/' + course.slug + '/' + lesson.order + '" class="btn btn--sm btn--outline">Başla →</a>'
                      }
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </section>
        </div>
      </div>
    `;

    document.title = `${course.title} — ESTİ BİRAZ Akademi`;
    window.scrollTo(0, 0);
    console.log('🎓 Kurs yüklendi:', course.title);
  } catch (error) {
    console.error('❌ Kurs yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Kurs yüklenirken hata oluştu.</p>';
  }
}

/**
 * Ders tipi ikonunu döndürür
 */
function getTypeIcon(type) {
  const icons = { video: '🎬', text: '📖', quiz: '❓' };
  return icons[type] || '📄';
}

/**
 * Ders tipi etiketini döndürür
 */
function getTypeLabel(type) {
  const labels = { video: '🎬 Video', text: '📖 Metin', quiz: '❓ Quiz' };
  return labels[type] || '📄 Ders';
}

/**
 * Kursa kayıt olma
 */
async function enrollCourse(courseId, courseSlug) {
  const user = firebase.auth().currentUser;

  if (!user) {
    alert('Kursa kayıt olmak için giriş yapmalısınız.');
    return;
  }

  try {
    // Zaten kayıtlı mı kontrol et
    const existing = await db.collection('enrollments')
      .where('userId', '==', user.uid)
      .where('courseId', '==', courseId)
      .limit(1)
      .get();

    if (!existing.empty) {
      alert('Bu kursa zaten kayıtlısınız!');
      return;
    }

    // Yeni kayıt oluştur
    await db.collection('enrollments').add({
      userId: user.uid,
      courseId: courseId,
      completedLessons: [],
      progressPercent: 0,
      enrolledAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastAccessedAt: firebase.firestore.FieldValue.serverTimestamp(),
      certificateIssued: false
    });

    console.log('✅ Kursa kayıt olundu:', courseId);
    alert('Kursa başarıyla kayıt oldunuz! 🎉');

    // Sayfayı yenile
    loadCourse(courseSlug);
  } catch (error) {
    console.error('❌ Kayıt başarısız:', error);
    alert('Kayıt sırasında hata oluştu: ' + error.message);
  }
}

/**
 * Kurs kartı oluşturur (tekrar kullanılabilir)
 */
function createCourseCard(courseId, course) {
  if (!course || !course.title) return '';

  const totalLessons = course.totalLessons || 0;
  const level = getLevelLabel(course.level);

  return `
    <a href="#/kurs/${course.slug}" class="course-card">
      <div class="course-card__image">
        ${course.coverImage
          ? '<img src="' + course.coverImage + '" alt="' + course.title + '" loading="lazy">'
          : '<div class="course-card__placeholder">🎓</div>'}
        <span class="course-card__level">${level}</span>
      </div>
      <div class="course-card__body">
        <span class="badge badge--${course.category} badge--sm">${getCategoryLabel(course.category)}</span>
        <h3 class="course-card__title">${course.title}</h3>
        <p class="course-card__desc">${course.description || ''}</p>
        <div class="course-card__footer">
          <span>👨‍🏫 ${course.instructor || ''}</span>
          <span>📚 ${totalLessons} Ders</span>
        </div>
      </div>
    </a>
  `;
}


/* ============================================
   DERS OYNATICI — Ders Yükleme ve Görüntüleme
   ============================================ */

async function loadLesson(courseSlug, lessonOrder) {
  const container = document.getElementById('app');

  try {
    // 1) Kursu slug ile bul
    const courseSnapshot = await db.collection('courses')
      .where('slug', '==', courseSlug)
      .limit(1)
      .get();

    if (courseSnapshot.empty) {
      render404();
      return;
    }

    const courseDoc = courseSnapshot.docs[0];
    const course = courseDoc.data();
    const courseId = courseDoc.id;

    // 2) Tüm dersleri çek (sidebar + navigasyon için)
    const lessonsSnapshot = await db.collection('courses')
      .doc(courseId)
      .collection('lessons')
      .orderBy('order', 'asc')
      .get();

    const lessons = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 3) Mevcut dersi bul
    const currentLesson = lessons.find(l => l.order === lessonOrder);
    if (!currentLesson) {
      container.innerHTML = `
        <section class="section">
          <div class="container text-center">
            <h1>❌ Ders Bulunamadı</h1>
            <p>Bu ders mevcut değil.</p>
            <a href="#/kurs/${courseSlug}" class="btn btn--primary">← Kursa Dön</a>
          </div>
        </section>
      `;
      return;
    }

    // 4) Kullanıcı enrollment bilgisini çek
    let enrollment = null;
    const user = firebase.auth().currentUser;
    if (user) {
      const enrollSnapshot = await db.collection('enrollments')
        .where('userId', '==', user.uid)
        .where('courseId', '==', courseId)
        .limit(1)
        .get();

      if (!enrollSnapshot.empty) {
        enrollment = {
          id: enrollSnapshot.docs[0].id,
          ...enrollSnapshot.docs[0].data()
        };
      }
    }

    // 5) Erişim kontrolü — kayıtlı değilse ve ders ücretsiz değilse
    if (!enrollment && !currentLesson.isFree) {
      container.innerHTML = `
        <section class="section">
          <div class="container text-center">
            <h1>🔒 Bu Ders Kilitli</h1>
            <p>Bu derse erişmek için kursa kayıt olmanız gerekiyor.</p>
            <a href="#/kurs/${courseSlug}" class="btn btn--primary btn--lg">🎓 Kursa Git ve Kayıt Ol</a>
          </div>
        </section>
      `;
      return;
    }

    const completedLessons = enrollment ? (enrollment.completedLessons || []) : [];
    const isCompleted = completedLessons.includes(currentLesson.order);

    // 6) Önceki / Sonraki ders
    const currentIndex = lessons.findIndex(l => l.order === lessonOrder);
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    const isLastLesson = !nextLesson;

    // 7) lastAccessedAt güncelle
    if (enrollment) {
      db.collection('enrollments').doc(enrollment.id).update({
        lastAccessedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(err => console.warn('lastAccessedAt güncellenemedi:', err));
    }

    // 8) Ders içeriğini oluştur
    const lessonContent = renderLessonContent(currentLesson);

    // 9) İlerleme yüzdesi
    const progressPercent = lessons.length > 0
      ? Math.round((completedLessons.length / lessons.length) * 100)
      : 0;

    container.innerHTML = `
      <div class="lesson-player">
        <div class="container">

          <!-- ÜST BAR -->
          <div class="lesson-player__topbar">
            <a href="#/kurs/${courseSlug}" class="lesson-player__back">← ${course.title}</a>
            ${enrollment ? `
              <div class="lesson-player__progress-mini">
                <div class="progress-bar progress-bar--sm">
                  <div class="progress-bar__fill" style="width: ${progressPercent}%"></div>
                </div>
                <span>%${progressPercent}</span>
              </div>
            ` : ''}
          </div>

          <!-- ANA İÇERİK -->
          <div class="lesson-player__layout">

            <!-- SOL: DERS İÇERİĞİ -->
            <main class="lesson-player__main">
              <div class="lesson-player__header">
                <span class="lesson-player__type">${getTypeLabel(currentLesson.type)}</span>
                <h1 class="lesson-player__title">${currentLesson.title}</h1>
                ${currentLesson.durationMin ? '<span class="lesson-player__duration">⏱️ ' + currentLesson.durationMin + ' dk</span>' : ''}
              </div>

              <div class="lesson-player__content">
                ${lessonContent}
              </div>

              <!-- TAMAMLA + NAVİGASYON -->
              <div class="lesson-player__actions">
                ${enrollment ? `
                  <button
                    class="btn btn--success btn--lg lesson-complete-btn ${isCompleted ? 'btn--completed' : ''}"
                    id="completeLessonBtn"
                    onclick="toggleLessonComplete('${enrollment.id}', ${currentLesson.order}, ${lessons.length}, '${courseSlug}', ${isLastLesson})"
                  >
                    ${isCompleted ? '✅ Tamamlandı' : '☐ Dersi Tamamla'}
                  </button>
                ` : ''}

                <div class="lesson-player__nav">
                  ${prevLesson
                    ? '<a href="#/ders/' + courseSlug + '/' + prevLesson.order + '" class="btn btn--outline">← Önceki Ders</a>'
                    : '<span></span>'
                  }
                  ${nextLesson
                    ? '<a href="#/ders/' + courseSlug + '/' + nextLesson.order + '" class="btn btn--primary">Sonraki Ders →</a>'
                    : '<a href="#/kurs/' + courseSlug + '" class="btn btn--outline">📋 Müfredata Dön</a>'
                  }
                </div>
              </div>
            </main>

            <!-- SAĞ: MÜFREDAT SİDEBAR -->
            <aside class="lesson-player__sidebar">
              <h3 class="lesson-sidebar__title">📋 Müfredat</h3>
              <div class="lesson-sidebar__list">
                ${lessons.map(lesson => {
                  const done = completedLessons.includes(lesson.order);
                  const active = lesson.order === lessonOrder;
                  const locked = !enrollment && !lesson.isFree;
                  const icon = done ? '✅' : active ? '▶️' : locked ? '🔒' : getTypeIcon(lesson.type);

                  return `
                    <a href="${locked ? '#' : '#/ders/' + courseSlug + '/' + lesson.order}"
                       class="lesson-sidebar__item ${active ? 'lesson-sidebar__item--active' : ''} ${done ? 'lesson-sidebar__item--done' : ''} ${locked ? 'lesson-sidebar__item--locked' : ''}">
                      <span class="lesson-sidebar__icon">${icon}</span>
                      <span class="lesson-sidebar__name">${lesson.title}</span>
                    </a>
                  `;
                }).join('')}
              </div>
            </aside>

          </div>
        </div>
      </div>
    `;

    document.title = `${currentLesson.title} — ${course.title} — ESTİ BİRAZ`;
    window.scrollTo(0, 0);
    console.log('▶️ Ders yüklendi:', currentLesson.title);

  } catch (error) {
    console.error('❌ Ders yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Ders yüklenirken hata oluştu.</p>';
  }
}