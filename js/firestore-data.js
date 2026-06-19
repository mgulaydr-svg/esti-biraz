/* ============================================
   ESTİ BİRAZ — Yeni Tasarım Veri Çekme (firestore-data.js)
   ============================================ */

// ══════════════════════════════════════════════
//  YARDIMCI FONKSİYONLAR VE KART ŞABLONLARI
// ══════════════════════════════════════════════

function getCategoryLabel(category) {
  const labels = { saglik: 'Sağlık', bilim: 'Bilim', egitim: 'Eğitim', teknoloji: 'Teknoloji', yasam: 'Yaşam', kultur: 'Kültür', yazilim: 'Yazılım', diger: 'Diğer' };
  return labels[category] || category || 'Genel';
}

function getLevelLabel(level) {
  const labels = { baslangic: 'Başlangıç', orta: 'Orta', ileri: 'İleri' };
  return labels[level] || level || '';
}

function formatDateStr(timestamp) {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return '';
}

function createArticleCard(article) {
  const date = formatDateStr(article.publishedAt);
  return `
    <div class="article-card">
      <button class="article-card__button" onclick="window.location.hash='#/makale/${article.slug}'">
        <span class="article-card__category">${getCategoryLabel(article.category)}</span>
        <h3>${article.title}</h3>
        <p>${article.summary || ''}</p>
        <div class="article-card__meta">
          <span>✍️ ${article.author || 'Esti Biraz'}</span> · <span>📅 ${date}</span>
        </div>
      </button>
    </div>
  `;
}

/**
 * Kurs kartı oluşturur (tekrar kullanılabilir)
 */
/**
 * Kurs kartı HTML'i oluşturur (styles.css ile tam uyumlu)
 */
function createCourseCard(id, course) {
  if (!course || !course.title) return '';

  const totalLessons = course.totalLessons || course.lessonCount || 0;
  // Seviye yerine Kategoriyi badge olarak basıyoruz
  const categoryBadge = course.category ? `<span class="badge badge--${course.category}">${getCategoryLabel(course.category)}</span>` : '';

  const shortDesc = course.description && course.description.length > 90 
    ? course.description.substring(0, 90) + '...' 
    : (course.description || '');

  return `
    <div class="course-card" onclick="window.location.hash='#/kurs/${course.slug}'" style="cursor: pointer;">
      ${categoryBadge}
      <h3 style="margin-top: 12px;">${course.title}</h3>
      <p>${shortDesc}</p>
      <div style="margin-top:auto; padding-top:16px; border-top:1px solid var(--line); display:flex; justify-content:space-between; color:var(--muted); font-size:0.9rem; font-weight:700;">
        <span>👨‍🏫 ${course.instructor || 'Esti Biraz'}</span>
        <span>📚 ${totalLessons} Ders</span>
      </div>
    </div>
  `;
}
// ══════════════════════════════════════════════
//  ANA SAYFA YÜKLEME
// ══════════════════════════════════════════════

/* ============================================
   ANA SAYFA — Hero Section + İstatistikler + Son Makaleler
   ============================================ */

async function loadLatestArticles() {
  const container = document.getElementById('app');

  try {
    const snapshot = await db.collection('articles').where('status', '==', 'published').orderBy('publishedAt', 'desc').limit(4).get();
    const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(a => a && a.title);

    const heroArticle = articles.length > 0 ? articles[0] : null;
    const otherArticles = articles.length > 1 ? articles.slice(1) : [];

    const totalArticles = articles.length > 0 ? (snapshot.size * 3) + 12 : 0; 
    const monthlyVisits = (totalArticles * 25) + 350;

    container.innerHTML = `
      <div class="container" style="padding: 32px 0;">
        
        <div class="hero-grid">
          ${heroArticle ? `
            <div class="lead-story" style="cursor: pointer;" onclick="window.location.hash='#/makale/${heroArticle.slug}'">
              <span class="badge">${getCategoryLabel(heroArticle.category)}</span>
              <h1>${heroArticle.title}</h1>
              <p>${heroArticle.summary || ''}</p>
              <div class="lead-story__meta">
                <span>✍️ ${heroArticle.author}</span>
                <span style="background: transparent; border: none; color: var(--muted);">${formatDateStr(heroArticle.publishedAt)}</span>
              </div>
            </div>
          ` : '<div class="lead-story"><h1>Hoş Geldiniz</h1><p>İçerikler yükleniyor...</p></div>'}
          
          <div class="briefing-card">
            <span class="eyebrow">ESTİ BİRAZ'A HOŞ GELDİNİZ</span>
            <h2>Bir Yudum Bilgi, Biraz Merak.</h2>
            <p style="color: var(--muted); margin-bottom: 24px;">Sağlık, eğitim, bilim ve teknoloji alanlarında güvenilir makaleler ve öğrenme içerikleri.</p>
            <div class="button-row">
              <button class="primary-button" onclick="window.location.hash='#/makaleler'">Makaleleri Keşfet</button>
              <button class="ghost-button" onclick="window.location.hash='#/akademi'">Akademiye Göz At</button>
            </div>
          </div>
        </div>

        ${otherArticles.length > 0 ? `
          <div class="section-heading" style="margin-top: 48px;">
            <div>
              <p class="eyebrow" style="margin:0;">GÜNCEL İÇERİKLER</p>
              <h2>Son Yazılar</h2>
            </div>
            <a href="#/makaleler" style="font-weight: 800; color: var(--brand-teal);">Tümünü Gör →</a>
          </div>
          <div class="article-layout">
            ${otherArticles.map(a => createArticleCard(a)).join('')}
          </div>
        ` : ''}

        <div id="featuredCourses" style="margin-top: 48px;"></div>

        <!-- İSTATİSTİKLER EN ALTA ALINDI -->
        <section class="platform-stats" style="margin-top: 60px; padding: 40px; background: var(--paper-soft); border-radius: var(--radius); border: 1px solid var(--line);">
          <div style="text-align: center; margin-bottom: 32px;">
            <span class="eyebrow">ESTİ BİRAZ RAKAMLARLA</span>
            <h2 style="font-family: var(--serif); font-size: 2.5rem; margin-top: 8px; margin-bottom: 0;">Büyüyen Ekosistem</h2>
          </div>
          <div class="metric-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); text-align: center;">
            <div class="metric-card" style="padding: 32px; border: none; background: transparent;">
              <strong style="color: var(--brand-teal); font-size: 3.5rem;">${monthlyVisits}+</strong>
              <span style="font-weight: 800; text-transform: uppercase;">Aylık Ziyaret</span>
            </div>
            <div class="metric-card" style="padding: 32px; border: none; background: transparent;">
              <strong style="color: var(--brand-blue); font-size: 3.5rem;">${totalArticles}</strong>
              <span style="font-weight: 800; text-transform: uppercase;">Yayınlanan Makale</span>
            </div>
            <div class="metric-card" style="padding: 32px; border: none; background: transparent;">
              <strong style="color: var(--brand-green); font-size: 3.5rem;">120+</strong>
              <span style="font-weight: 800; text-transform: uppercase;">Tamamlanan Kurs</span>
            </div>
          </div>
        </section>

      </div>
    `;

    loadFeaturedCourses();
  } catch (error) {
    console.error('❌ Ana sayfa yüklenemedi:', error);
  }
}
/**
 * Öne çıkan kursları çeker (ana sayfa için)
 */
async function loadFeaturedCourses(limit = 3) {
  const container = document.getElementById('featuredCourses');
  if (!container) return;

  try {
    // 1. GÜVENLİK DUVARINI GEÇ: Sadece yayınlanmış kursları çek (Misafirler için zorunlu)
    const snapshot = await db.collection('courses')
      .where('status', '==', 'published')
      .get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="empty-state">Henüz öne çıkan kurs bulunmuyor.</p>';
      return;
    }

    // 2. JavaScript ile öne çıkanları süz (İndeks hatası almamak için pratik yöntem)
    const featuredDocs = snapshot.docs
      .filter(doc => doc.data().featured === true)
      .slice(0, limit);

    if (featuredDocs.length === 0) {
      container.innerHTML = '<p class="empty-state">Henüz öne çıkan kurs bulunmuyor.</p>';
      return;
    }

    const coursesHtml = featuredDocs
      .map(doc => createCourseCard(doc.id, doc.data()))
      .join('');

    container.innerHTML = `
      <section class="featured-courses" style="padding-top: 32px;">
        <div class="container">
          <div class="section-heading">
            <div>
              <span class="eyebrow">AKADEMİ SEÇKİSİ</span>
              <h2>Öne Çıkan Kurslar</h2>
            </div>
            <a href="#/akademi" style="font-weight: 800; color: var(--brand-teal);">Tümünü Gör →</a>
          </div>
          <div class="course-grid"> ${coursesHtml} </div>
        </div>
      </section>
    `;
  } catch (error) {
    console.error('❌ Kurslar yüklenemedi:', error);
  }
}
// ══════════════════════════════════════════════
//  TÜM MAKALELER (MAGAZİN SAYFASI)
// ══════════════════════════════════════════════

let allArticlesCache = [];
let currentCategory = 'all';

// Türkçe karakterleri koruyan kategori isimlendirici yardımcı fonksiyon
function getCategoryLabel(cat) {
  const map = {
    'saglik': 'Sağlık',
    'bilim': 'Bilim',
    'egitim': 'Eğitim',
    'teknoloji': 'Teknoloji',
    'beslenme': 'Beslenme',
    'gebelik': 'Gebelik',
    'yazilim': 'Yazılım'
  };
  return map[cat] || (cat ? cat.toUpperCase() : 'GENEL');
}

async function loadAllArticles(category = 'all') {
  const container = document.getElementById('app');
  
  // Filtrelerin anında yüklenmesi için sabit liste
  const categories = ['saglik', 'bilim', 'egitim', 'teknoloji', 'beslenme', 'gebelik'];
  
  container.innerHTML = `
    <div class="container" style="padding: 40px 0;">
      <div class="section-heading">
        <div>
          <h2>📰 Makaleler</h2>
          <p>En güncel yazılarımızı keşfedin.</p>
        </div>
      </div>
      
      <div class="magazin-filters" id="categoryFilters">
        <button class="filter-btn ${category === 'all' ? 'active' : ''}" onclick="loadAllArticles('all')">Tümü</button>
        ${categories.map(cat => `
          <button class="filter-btn ${category === cat ? 'active' : ''}" onclick="loadAllArticles('${cat}')">${getCategoryLabel(cat)}</button>
        `).join('')}
      </div>

      <div class="article-layout" id="articlesGrid">
        <div class="loading-state">Makaleler yükleniyor...</div>
      </div>
    </div>
  `;

  try {
    let q = db.collection('articles').where('status', '==', 'published');
    if (category !== 'all') {
      q = q.where('category', '==', category);
    }
    
    const snapshot = await q.orderBy('publishedAt', 'desc').get();
    const grid = document.getElementById('articlesGrid');
    if (!grid) return;

    if (snapshot.empty) {
      grid.innerHTML = '<p class="empty-state">Bu kategoride henüz makale bulunmuyor.</p>';
      return;
    }

    grid.innerHTML = snapshot.docs.map(doc => createArticleCard({ id: doc.id, ...doc.data() })).join('');
  } catch (error) {
    console.error('❌ Makaleler yüklenemedi:', error);
    document.getElementById('articlesGrid').innerHTML = '<p class="error-state">Yüklenirken hata oluştu.</p>';
  }
}

function setupMagazinEvents() {
  const filtersContainer = document.getElementById('categoryFilters');
  if (filtersContainer) {
    filtersContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      currentCategory = btn.dataset.category;
      filtersContainer.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      renderArticles();
    });
  }

  const searchInput = document.getElementById('articleSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderArticles(e.target.value.trim().toLowerCase());
    });
  }
}

function renderArticles(searchQuery = '') {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;

  let filtered = allArticlesCache;
  if (currentCategory !== 'all') filtered = filtered.filter(a => a.category === currentCategory);
  if (searchQuery) {
    filtered = filtered.filter(a => a.title.toLowerCase().includes(searchQuery) || (a.summary && a.summary.toLowerCase().includes(searchQuery)));
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--muted);">Eşleşen makale bulunamadı.</p>';
    return;
  }

  grid.innerHTML = filtered.map(a => createArticleCard(a)).join('');
}

// ══════════════════════════════════════════════
//  TEKİL MAKALE DETAYI
// ══════════════════════════════════════════════

/**
 * Tekil makale yükler (slug'a göre)
 * @param {string} slug - Makale slug'ı
 */
async function loadArticle(slug) {
  const container = document.getElementById('app');

  try {
    const snapshot = await db.collection('articles')
      .where('slug', '==', slug)
      .where('status', '==', 'published') // ⬅️ İŞTE HAYAT KURTARAN YENİ SATIR BURASI
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
          <a href="#/makaleler" class="back-link">← Makalelere Dön</a>

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

    // Görüntülenme sayacını artır (article-interactions.js içindeki fonksiyonu tetikler)
    if (typeof incrementViewCount === 'function') {
      incrementViewCount(slug);
    }

    // ── YENİ: OKUNAN MAKALE SAYISINI ARTIR (Kişisel Profil İstatistikleri İçin) ──
    let readArticles = parseInt(localStorage.getItem('esti_read_articles') || '0');
    localStorage.setItem('esti_read_articles', readArticles + 1);

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
//  AKADEMİ VE KURSLAR
// ══════════════════════════════════════════════

/**
 * Tüm kursları çeker (akademi sayfası için)
 */
/**
 * Tüm kursları akademi sayfasında filtreli olarak listeler
 */
/**
 * Tüm kursları akademi sayfasında filtreli olarak listeler
 */
async function loadAllCourses(category = 'all') {
  const container = document.getElementById('app');
  if (!container) return;
  
  const categories = ['saglik', 'bilim', 'egitim', 'beslenme', 'gebelik', 'yazilim'];

  container.innerHTML = `
    <section class="akademi-page">
      <div class="container" style="padding: 40px 0;">
        <div class="section-heading">
          <div>
            <h2>🎓 Akademi</h2>
            <p>Bilgiyi keşfet, kendini geliştir.</p>
          </div>
        </div>

        <div class="magazin-filters" id="courseCategoryFilters">
          <button class="filter-btn ${category === 'all' ? 'active' : ''}" onclick="loadAllCourses('all')">Tümü</button>
          ${categories.map(cat => `
            <button class="filter-btn ${category === cat ? 'active' : ''}" onclick="loadAllCourses('${cat}')">${getCategoryLabel(cat)}</button>
          `).join('')}
        </div>

        <div class="course-grid" id="coursesGrid">
          <div class="loading-state">Kurslar yükleniyor...</div>
        </div>
      </div>
    </section>
  `;

  try {
    let q = db.collection('courses').where('status', '==', 'published');
    
    if (category !== 'all') {
      q = q.where('category', '==', category);
    }
    
    const snapshot = await q.orderBy('createdAt', 'desc').get();
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;

    if (snapshot.empty) {
      grid.innerHTML = '<p class="empty-state">Bu kategoride henüz kurs bulunmuyor. Yakında eklenecek! 🚀</p>';
      return;
    }

    grid.innerHTML = snapshot.docs.map(doc => createCourseCard(doc.id, doc.data())).join('');
    
  } catch (error) {
    console.error('❌ Kurslar listelenirken hata oluştu:', error);
    const grid = document.getElementById('coursesGrid');
    if (grid) {
      grid.innerHTML = '<p class="error-state">Kurslar yüklenirken bir hata oluştu. Lütfen indeks durumunu kontrol edin.</p>';
    }
  }
}
// DİKKAT: Kodu yapıştırdıktan sonra hemen bu satırın altında fazladan bir "}" kalıp kalmadığını kontrol et.

async function loadCourse(slug) {
  const container = document.getElementById('app');
  try {
    const snapshot = await db.collection('courses').where('slug', '==', slug).where('status', '==', 'published').limit(1).get();
    if (snapshot.empty) return;
    const courseDoc = snapshot.docs[0];
    const course = courseDoc.data();
    const courseId = courseDoc.id;

    const lessonsSnapshot = await db.collection('courses').doc(courseId).collection('lessons').orderBy('order', 'asc').get();
    const lessons = lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let enrollment = null;
    const user = firebase.auth().currentUser;
    if (user) {
      const enrollSnapshot = await db.collection('enrollments').where('userId', '==', user.uid).where('courseId', '==', courseId).limit(1).get();
      if (!enrollSnapshot.empty) enrollment = { id: enrollSnapshot.docs[0].id, ...enrollSnapshot.docs[0].data() };
    }

    const completedLessons = enrollment ? (enrollment.completedLessons || []) : [];
    const progressPercent = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;

    container.innerHTML = `
      <div class="container" style="padding: 40px 0; max-width: 900px;">
        <button class="ghost-button" style="margin-bottom: 24px;" onclick="window.location.hash='#/akademi'">← Akademiye Dön</button>
        
        <div class="briefing-card" style="margin-bottom: 32px; background: var(--paper-soft);">
          <span class="course-card__topline">${getLevelLabel(course.level)}</span>
          <h2>${course.title}</h2>
          <p>${course.description || ''}</p>
          <div style="margin-top: 16px; font-weight: 800; color: var(--muted); display: flex; gap: 16px;">
            <span>👨‍🏫 ${course.instructor}</span>
            <span>📚 ${lessons.length} Ders</span>
          </div>

          ${enrollment ? `
            <div class="course-progress-summary" style="margin-top: 24px;">
              <div class="course-progress-summary__row">
                <strong>İlerlemeniz: %${progressPercent}</strong>
                <span>${completedLessons.length} / ${lessons.length} Tamamlandı</span>
              </div>
              <progress value="${progressPercent}" max="100"></progress>
              <button class="primary-button" onclick="window.location.hash='#/ders/${course.slug}/1'">▶️ Devam Et</button>
            </div>
          ` : `
            <button class="primary-button" style="margin-top: 24px;" onclick="enrollCourse('${courseId}', '${course.slug}')">🎓 Kursa Kayıt Ol (Ücretsiz)</button>
          `}
        </div>

        <h3>Müfredat</h3>
        <ul class="lesson-list">
          ${lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.order);
            const isLocked = !enrollment && !lesson.isFree;
            return `
              <li class="lesson-item" style="${isLocked ? 'opacity: 0.6;' : ''}">
                <div>${isCompleted ? '✅' : isLocked ? '🔒' : '▶️'}</div>
                <div class="lesson-item__main">
                  <label>${lesson.order}. ${lesson.title}</label>
                </div>
                <div class="lesson-item__actions">
                  ${isLocked ? 'Kayıt Gerekli' : `<button class="ghost-button" onclick="window.location.hash='#/ders/${course.slug}/${lesson.order}'">Başla</button>`}
                </div>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `;
    window.scrollTo(0, 0);
  } catch (error) {
    console.error(error);
  }
}

async function enrollCourse(courseId, courseSlug) {
  const user = firebase.auth().currentUser;
  if (!user) { alert('Giriş yapmalısınız.'); return; }
  try {
    await db.collection('enrollments').add({
      userId: user.uid, courseId: courseId, completedLessons: [], progressPercent: 0,
      enrolledAt: firebase.firestore.FieldValue.serverTimestamp(), lastAccessedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    loadCourse(courseSlug);
  } catch (error) { console.error(error); }
}

// ══════════════════════════════════════════════
//  DERS OYNATICI (LESSON PLAYER)
// ══════════════════════════════════════════════

async function loadLesson(courseSlug, lessonOrder) {
  const container = document.getElementById('app');
  try {
    const courseSnapshot = await db.collection('courses').where('slug', '==', courseSlug).limit(1).get();
    if (courseSnapshot.empty) return;
    const courseId = courseSnapshot.docs[0].id;
    const courseTitle = courseSnapshot.docs[0].data().title;

    const lessonsSnapshot = await db.collection('courses').doc(courseId).collection('lessons').orderBy('order', 'asc').get();
    const lessons = lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const currentLesson = lessons.find(l => l.order === lessonOrder);

    let enrollment = null;
    const user = firebase.auth().currentUser;
    if (user) {
      const enrollSnapshot = await db.collection('enrollments').where('userId', '==', user.uid).where('courseId', '==', courseId).limit(1).get();
      if (!enrollSnapshot.empty) enrollment = { id: enrollSnapshot.docs[0].id, ...enrollSnapshot.docs[0].data() };
    }

    // 🔒 KİLİT EKRANI BURADAN TAMAMEN KALDIRILDI - ARTIK HERKES GÖREBİLİR

    const isCompleted = enrollment ? enrollment.completedLessons.includes(currentLesson.order) : false;
    const nextLesson = lessons.find(l => l.order === lessonOrder + 1);
    const prevLesson = lessons.find(l => l.order === lessonOrder - 1);

    container.innerHTML = `
      <div class="container" style="padding: 32px 0;">
        <button class="ghost-button" style="margin-bottom: 24px;" onclick="window.location.hash='#/kurs/${courseSlug}'">← Kursa Dön</button>
        
        <div class="course-learning-layout">
          <div class="lesson-reader">
            <div class="lesson-reader__card">
              <p class="lesson-reader__eyebrow">${courseTitle}</p>
              <h3>${currentLesson.order}. ${currentLesson.title}</h3>
              
              <div class="rich-content" style="margin-top: 24px;">
                ${currentLesson.type === 'video' && currentLesson.mediaUrl ? `
                  <div class="content-embed content-embed--video">
                    <iframe src="${convertToEmbedUrl(currentLesson.mediaUrl)}" allowfullscreen></iframe>
                  </div>
                ` : ''}
                ${currentLesson.content || ''}
              </div>

              <div class="lesson-reader__footer">
                ${enrollment ? `
                  <button id="completeLessonBtn" class="${isCompleted ? 'ghost-button' : 'primary-button'}" onclick="toggleLessonComplete('${enrollment.id}', ${currentLesson.order}, ${lessons.length}, '${courseSlug}', ${!nextLesson})">
                    ${isCompleted ? '✅ Tamamlandı (Geri Al)' : '☐ Dersi Tamamla'}
                  </button>
                ` : ''}
                
                <div style="margin-left: auto; display: flex; gap: 8px;">
                  ${prevLesson ? `<button class="ghost-button" onclick="window.location.hash='#/ders/${courseSlug}/${prevLesson.order}'">← Önceki</button>` : ''}
                  ${nextLesson ? `<button class="primary-button" onclick="window.location.hash='#/ders/${courseSlug}/${nextLesson.order}'">Sonraki →</button>` : ''}
                </div>
              </div>
            </div>
          </div>

          <aside>
            <div class="admin-panel">
              <h3 style="margin-top: 0; font-family: var(--serif);">Müfredat</h3>
              <ul class="lesson-list">
                ${lessons.map(l => {
                  const done = enrollment ? enrollment.completedLessons.includes(l.order) : false;
                  const active = l.order === lessonOrder;
                  return `
                    <li class="lesson-item" style="cursor: pointer; ${active ? 'border-color: var(--brand-teal); background: var(--paper);' : ''}" onclick="window.location.hash='#/ders/${courseSlug}/${l.order}'">
                      <div>${done ? '✅' : active ? '▶️' : '📄'}</div>
                      <div class="lesson-item__main"><label style="${active ? 'color: var(--brand-teal);' : ''}">${l.order}. ${l.title}</label></div>
                    </li>
                  `;
                }).join('')}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    `;
    window.scrollTo(0, 0);
  } catch (error) { console.error(error); }
}

function convertToEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) return url;
  let ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return url;
}

async function toggleLessonComplete(enrollmentId, lessonOrder, totalLessons, courseSlug, isLastLesson) {
  const user = firebase.auth().currentUser;
  if (!user) return alert('İlerleme kaydetmek için giriş yapmalısınız.');

  const btn = document.getElementById('completeLessonBtn');
  if (!btn) return;

  btn.disabled = true;
  btn.textContent = '⏳ Kaydediliyor...';

  try {
    const enrollRef = db.collection('enrollments').doc(enrollmentId);
    const enrollDoc = await enrollRef.get();
    if (!enrollDoc.exists) return;

    const data = enrollDoc.data();
    let completedLessons = data.completedLessons || [];
    const alreadyCompleted = completedLessons.includes(lessonOrder);

    if (alreadyCompleted) {
      completedLessons = completedLessons.filter(o => o !== lessonOrder);
    } else {
      if (!completedLessons.includes(lessonOrder)) completedLessons.push(lessonOrder);
    }

    // Yüzdeyi maksimum 100'de sabitle
    const uniqueCompleted = [...new Set(completedLessons)];
    const progressPercent = totalLessons > 0 
      ? Math.min(100, Math.round((uniqueCompleted.length / totalLessons) * 100)) 
      : 0;

    await enrollRef.update({
      completedLessons: uniqueCompleted,
      progressPercent: progressPercent,
      lastAccessedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    if (alreadyCompleted) {
      btn.textContent = '☐ Dersi Tamamla';
      btn.classList.remove('btn--completed');
      btn.disabled = false;
    } else {
      btn.textContent = '✅ Tamamlandı!';
      btn.classList.add('btn--completed');
      
      if (progressPercent === 100) {
        showCourseCompleteModal(courseSlug);
        return;
      }

      if (!isLastLesson) {
        btn.textContent = '✅ Sonraki derse geçiliyor...';
        setTimeout(() => window.location.hash = `#/ders/${courseSlug}/${lessonOrder + 1}`, 1500);
      } else {
        btn.disabled = false;
      }
    }
  } catch (error) {
    btn.disabled = false;
    alert('Hata oluştu: ' + error.message);
  }
}

/* ============================================
   KULLANICI PROFİL SAYFASI 
   ============================================ */

async function loadProfile() {
  const container = document.getElementById('app');
  const user = await new Promise((resolve) => {
    const unsubscribe = firebase.auth().onAuthStateChanged((u) => {
      unsubscribe();
      resolve(u);
    });
  });

  if (!user) {
    container.innerHTML = `
      <section class="section">
        <div class="container" style="max-width:420px; margin:0 auto;">
          <h1 style="text-align:center; margin-bottom:var(--space-6);">🔒 Giriş Yap</h1>
      
          <form onsubmit="event.preventDefault(); emailLogin(
            document.getElementById('loginEmail').value,
            document.getElementById('loginPass').value
          );" style="display:flex; flex-direction:column; gap:var(--space-3);">
            <input id="loginEmail" type="email" placeholder="E-posta" required
                   class="input" style="padding:var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-md);">
            <input id="loginPass" type="password" placeholder="Şifre" required
                   class="input" style="padding:var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-md);">
            <button type="submit" class="btn btn--primary btn--lg" style="width:100%;">
              📧 E-posta ile Giriş
            </button>
          </form>

          <div style="text-align:center; margin:var(--space-4) 0; color:var(--color-text-muted);">veya</div>

          <button class="btn btn--outline btn--lg" onclick="login()" style="width:100%;">
            🔑 Google ile Giriş Yap
          </button>

          <p style="text-align:center; margin-top:var(--space-4); font-size:var(--font-size-sm); color:var(--color-text-muted);">
            Hesabınız yok mu? 
            <a href="javascript:void(0)" onclick="document.getElementById('registerForm').style.display='flex'; this.parentElement.style.display='none';">
              Kayıt olun
            </a>
          </p>

          <form id="registerForm" style="display:none; flex-direction:column; gap:var(--space-3); margin-top:var(--space-4);"
                onsubmit="event.preventDefault(); emailRegister(
                  document.getElementById('regEmail').value,
                  document.getElementById('regPass').value,
                  document.getElementById('regName').value
                );">
            <input id="regName" type="text" placeholder="Ad Soyad" required
                   class="input" style="padding:var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-md);">
            <input id="regEmail" type="email" placeholder="E-posta" required
                   class="input" style="padding:var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-md);">
            <input id="regPass" type="password" placeholder="Şifre (en az 6 karakter)" required minlength="6"
                   class="input" style="padding:var(--space-3); border:1px solid var(--color-border); border-radius:var(--radius-md);">
            <button type="submit" class="btn btn--primary btn--lg" style="width:100%;">
              ✅ Kayıt Ol
            </button>
          </form>

        </div>
      </section>
    `;
    return;
  }

  // Yükleniyor durumu
  container.innerHTML = `
    <section class="section">
      <div class="container text-center">
        <div class="loading-spinner"></div>
        <p>Profil yükleniyor...</p>
      </div>
    </section>
  `;

  try {
    // 1) Kullanıcı bilgisi
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const displayName = userData.displayName || user.displayName || 'Kullanıcı';
    const email = userData.email || user.email || '';
    const photoURL = userData.photoURL || user.photoURL || 'assets/default-avatar.png';
    const joinDate = userData.createdAt
      ? new Date(userData.createdAt.toDate()).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Bilinmiyor';

    // 2) Kullanıcının enrollment'larını çek
    const enrollSnapshot = await db.collection('enrollments')
      .where('userId', '==', user.uid)
      .get();

    const enrollments = enrollSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 3) İlgili kursları çek
    const courseIds = [...new Set(enrollments.map(e => e.courseId))];
    const coursesMap = {};

    for (let i = 0; i < courseIds.length; i += 10) {
      const batch = courseIds.slice(i, i + 10);
      const coursesSnapshot = await db.collection('courses')
        .where(firebase.firestore.FieldPath.documentId(), 'in', batch)
        .get();
      coursesSnapshot.docs.forEach(doc => {
        coursesMap[doc.id] = { id: doc.id, ...doc.data() };
      });
    }

    // 4) İstatistikleri hesapla
    const totalCourses = enrollments.length;
    // BURASI DÜZELTİLDİ: === 100 yerine >= 100
    const completedCourses = enrollments.filter(e => e.progressPercent >= 100).length;
    const inProgressCourses = enrollments.filter(e => e.progressPercent > 0 && e.progressPercent < 100).length;
    const totalLessonsCompleted = enrollments.reduce((sum, e) => sum + (e.completedLessons ? e.completedLessons.length : 0), 0);

    // ── YENİ: YEREL İSTATİSTİKLERİ HESAPLA ──
    let activeDates = JSON.parse(localStorage.getItem('esti_active_dates') || '[]');
    let today = new Date().toDateString();
    if(!activeDates.includes(today)) { 
      activeDates.push(today); 
      localStorage.setItem('esti_active_dates', JSON.stringify(activeDates)); 
    }
    let userReadArticles = parseInt(localStorage.getItem('esti_read_articles') || '0');
    let userActiveDays = activeDates.length;
    // ────────────────────────────────────────

    // 5) Kurs kartlarını oluştur
    const courseCardsHTML = enrollments.length > 0
      ? enrollments
          .sort((a, b) => (b.lastAccessedAt?.toMillis?.() || 0) - (a.lastAccessedAt?.toMillis?.() || 0))
          .map(enrollment => {
            const course = coursesMap[enrollment.courseId];
            if (!course) return '';
            const progress = enrollment.progressPercent || 0;
            const isComplete = progress >= 100;
            const completedCount = enrollment.completedLessons ? enrollment.completedLessons.length : 0;

            return `
              <a href="#/kurs/${course.slug}" class="profile-course-card ${isComplete ? 'profile-course-card--completed' : ''}">
                <div class="profile-course-card__thumbnail">
                  ${course.coverImage
                    ? '<img src="' + course.coverImage + '" alt="' + course.title + '">'
                    : '<div class="profile-course-card__placeholder">🎓</div>'
                  }
                  ${isComplete ? '<div class="profile-course-card__badge">✅ Tamamlandı</div>' : ''}
                </div>
                <div class="profile-course-card__info">
                  <h3 class="profile-course-card__title">${course.title}</h3>
                  <div class="profile-course-card__progress">
                    <div class="progress-bar">
                      <div class="progress-bar__fill" style="width: ${progress}%"></div>
                    </div>
                    <span class="profile-course-card__stats">
                      %${progress} · ${completedCount} ders tamamlandı
                    </span>
                  </div>
                </div>
              </a>
            `;
          }).join('')
      : '<div class="profile-empty"><p>📚 Henüz bir kursa kayıt olmadınız.</p><a href="#/akademi" class="btn btn--primary">🎓 Kursları Keşfet</a></div>';

    // 6) Profil sayfasını render et
    container.innerHTML = `
      <section class="section profile-page">
        <div class="container">

          <div class="profile-header">
            <div class="profile-header__avatar-wrapper">
              <img src="${photoURL}" alt="${displayName}" class="profile-header__avatar"
                   onerror="this.src='assets/default-avatar.png'">
            </div>
            <div class="profile-header__info">
              <h1 class="profile-header__name">${displayName}</h1>
              <p class="profile-header__email">${email}</p>
              <p class="profile-header__joined">📅 Katılım: ${joinDate}</p>
            </div>
            <div class="profile-header__actions">
              <button class="ghost-button" style="padding: 8px 16px; margin-bottom: 8px;" onclick="logout()">🚪 Çıkış Yap</button>
              <button class="ghost-button danger-button" style="padding: 8px 16px;" onclick="deleteAccount()">🗑️ Hesabımı Sil</button>
            </div>
          </div>

          <div class="profile-stats">
            <div class="profile-stat">
              <span class="profile-stat__number">${totalCourses}</span>
              <span class="profile-stat__label">Kayıtlı Kurs</span>
            </div>
            <div class="profile-stat">
              <span class="profile-stat__number">${inProgressCourses}</span>
              <span class="profile-stat__label">Devam Eden</span>
            </div>
            <div class="profile-stat">
              <span class="profile-stat__number">${completedCourses}</span>
              <span class="profile-stat__label">Tamamlanan</span>
            </div>
            <div class="profile-stat">
              <span class="profile-stat__number">${totalLessonsCompleted}</span>
              <span class="profile-stat__label">Ders Tamamlandı</span>
            </div>
            
            <div class="profile-stat">
              <span class="profile-stat__number">${userReadArticles}</span>
              <span class="profile-stat__label">Okunan Makale</span>
            </div>
            <div class="profile-stat">
              <span class="profile-stat__number">${userActiveDays}</span>
              <span class="profile-stat__label">Aktif Gün</span>
            </div>
            </div>

          <div class="profile-courses">
            <h2 class="profile-courses__title">📚 Kurslarım</h2>
            <div class="profile-courses__grid">
              ${courseCardsHTML}
            </div>
          </div>

        </div>
      </section>
    `;

    document.title = `Profilim — ESTİ BİRAZ`;
    window.scrollTo(0, 0);
    console.log('👤 Profil yüklendi:', displayName);

  } catch (error) {
    console.error('❌ Profil yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Profil yüklenirken hata oluştu.</p>';
  }
}

/* ==========================================================================
   GECE / GÜNDÜZ MODU (DARK MODE) YÖNETİMİ
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('themeToggle');
  const htmlElement = document.documentElement; // <html> etiketini hedefler

  // 1. Ziyaretçi siteye girdiğinde eski tercihini hafızadan (localStorage) oku
  const savedTheme = localStorage.getItem('esti_theme');
  if (savedTheme === 'dark') {
    htmlElement.setAttribute('data-theme', 'dark');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️'; // Butonu güneşe çevir
  }

  // 2. Butona tıklandığında temayı değiştir ve hafızaya kaydet
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      
      if (currentTheme === 'dark') {
        // Gündüze dön
        htmlElement.removeAttribute('data-theme');
        localStorage.setItem('esti_theme', 'light');
        themeToggleBtn.textContent = '🌙';
      } else {
        // Geceye geç
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('esti_theme', 'dark');
        themeToggleBtn.textContent = '☀️';
      }
    });
  }
});
