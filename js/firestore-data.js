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
async function loadLatestArticles(limit = 3) {
  const container = document.getElementById('latestArticles');
  if (!container) return;

  try {
    const snapshot = await db.collection('articles')
      .orderBy('publishedAt', 'desc')
      .limit(limit)
      .get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="empty-state">Henüz makale yok.</p>';
      return;
    }

    container.innerHTML = snapshot.docs
      .map(doc => createArticleCard(doc.id, doc.data()))
      .join('');

    console.log(`📰 ${snapshot.size} makale yüklendi (son).`);
  } catch (error) {
    console.error('❌ Makaleler yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Makaleler yüklenirken hata oluştu.</p>';
  }
}

/**
 * Tüm makaleleri çeker (magazin sayfası için)
 * @param {string} category - Kategori filtresi ('all' = tümü)
 */
async function loadAllArticles(category = 'all') {
  const container = document.getElementById('articleList');
  if (!container) return;

  try {
    let query = db.collection('articles').orderBy('publishedAt', 'desc');

    if (category !== 'all') {
      query = db.collection('articles')
        .where('category', '==', category)
        .orderBy('publishedAt', 'desc');
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="empty-state">Bu kategoride makale bulunamadı.</p>';
      return;
    }

    container.innerHTML = snapshot.docs
      .map(doc => createArticleCard(doc.id, doc.data()))
      .join('');

    console.log(`📰 ${snapshot.size} makale yüklendi (kategori: ${category}).`);
  } catch (error) {
    console.error('❌ Makaleler yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Makaleler yüklenirken hata oluştu.</p>';
  }
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

          <div class="article-detail__content editor-content">
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

    container.innerHTML = snapshot.docs
      .map(doc => createCourseCard(doc.id, doc.data()))
      .join('');

    console.log(`🎓 ${snapshot.size} öne çıkan kurs yüklendi.`);
  } catch (error) {
    console.error('❌ Kurslar yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Kurslar yüklenirken hata oluştu.</p>';
  }
}

/**
 * Tüm kursları çeker (akademi sayfası için)
 */
async function loadAllCourses() {
  const container = document.getElementById('courseList');
  if (!container) return;

  try {
    const snapshot = await db.collection('courses')
      .orderBy('publishedAt', 'desc')
      .get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="empty-state">Henüz kurs yok.</p>';
      return;
    }

    container.innerHTML = snapshot.docs
      .map(doc => createCourseCard(doc.id, doc.data()))
      .join('');

    console.log(`🎓 ${snapshot.size} kurs yüklendi.`);
  } catch (error) {
    console.error('❌ Kurslar yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Kurslar yüklenirken hata oluştu.</p>';
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
    teknoloji: '💻 Teknoloji'
  };
  return labels[category] || category;
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