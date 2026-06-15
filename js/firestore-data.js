/* ============================================
   ESTİ BİRAZ — Yeni Tasarım Veri Çekme (firestore-data.js)
   ============================================ */

// ══════════════════════════════════════════════
//  YARDIMCI FONKSİYONLAR VE KART ŞABLONLARI
// ══════════════════════════════════════════════

function getCategoryLabel(category) {
  const labels = { saglik: 'Sağlık', bilim: 'Bilim', egitim: 'Eğitim', teknoloji: 'Teknoloji', yasam: 'Yaşam', kultur: 'Kültür', diger: 'Diğer' };
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

function createCourseCard(course) {
  const level = getLevelLabel(course.level);
  return `
    <div class="course-card" onclick="window.location.hash='#/kurs/${course.slug}'" style="cursor: pointer;">
      ${level ? `<span class="course-card__topline">${level}</span>` : ''}
      <h3>${course.title}</h3>
      <p>${course.description || ''}</p>
      <div style="margin-top:auto; padding-top:16px; color:var(--muted); font-size:0.9rem;">
        <span>👨‍🏫 ${course.instructor || ''}</span> · <span>📚 ${course.lessonCount || 0} Ders</span>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════
//  ANA SAYFA YÜKLEME
// ══════════════════════════════════════════════

async function loadLatestArticles() {
  const container = document.getElementById('app');

  try {
    const snapshot = await db.collection('articles').where('status', '==', 'published').orderBy('publishedAt', 'desc').limit(4).get();
    const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(a => a && a.title);

    const heroArticle = articles.length > 0 ? articles[0] : null;
    const otherArticles = articles.length > 1 ? articles.slice(1) : [];

    container.innerHTML = `
      <div class="container" style="padding: 32px 0;">
        
        <div class="hero-grid">
          ${heroArticle ? `
            <div class="lead-story" style="cursor: pointer;" onclick="window.location.hash='#/makale/${heroArticle.slug}'">
              <span class="pill">${getCategoryLabel(heroArticle.category)}</span>
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
          <div class="section-heading" style="margin-top: 32px;">
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
      </div>
    `;

    loadFeaturedCourses();
  } catch (error) {
    console.error('❌ Ana sayfa yüklenemedi:', error);
    container.innerHTML = '<div class="container"><p>Sayfa yüklenirken hata oluştu.</p></div>';
  }
}

async function loadFeaturedCourses() {
  const container = document.getElementById('featuredCourses');
  if (!container) return;

  try {
    const snapshot = await db.collection('courses').where('featured', '==', true).limit(2).get();
    if (snapshot.empty) return;

    container.innerHTML = `
      <div class="data-panel">
        <div>
          <span class="eyebrow">AKADEMİ SEÇKİSİ</span>
          <h2>Öne Çıkan Kurslar</h2>
          <p style="color: var(--muted); margin-bottom: 20px;">Kendinizi geliştirebileceğiniz en popüler eğitim modüllerimiz.</p>
          <button class="primary-button" onclick="window.location.hash='#/akademi'">Tüm Kursları Gör</button>
        </div>
        <div class="course-grid">
          ${snapshot.docs.map(doc => createCourseCard(doc.data())).join('')}
        </div>
      </div>
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

async function loadAllArticles() {
  const container = document.getElementById('app');

  container.innerHTML = `
    <div class="container" style="padding: 40px 0;">
      <div class="section-heading">
        <div>
          <h2>Makaleler</h2>
          <p>Sağlık, eğitim, bilim ve teknoloji alanındaki yazıları tek bir yerde keşfedin.</p>
        </div>
        <div class="search" style="width: 100%; max-width: 300px;">
          <input type="text" id="articleSearchInput" placeholder="Makale ara..." style="color: var(--ink);">
        </div>
      </div>

      <div class="filter-row" id="categoryFilters" style="margin-bottom: 24px;">
        <button aria-pressed="${currentCategory === 'all'}" data-category="all">Tümü</button>
        <button aria-pressed="${currentCategory === 'saglik'}" data-category="saglik">Sağlık</button>
        <button aria-pressed="${currentCategory === 'bilim'}" data-category="bilim">Bilim</button>
        <button aria-pressed="${currentCategory === 'egitim'}" data-category="egitim">Eğitim</button>
        <button aria-pressed="${currentCategory === 'teknoloji'}" data-category="teknoloji">Teknoloji</button>
      </div>

      <div class="article-layout" id="articlesGrid">
        <p style="grid-column: 1/-1; text-align: center; color: var(--muted);">Yükleniyor...</p>
      </div>
    </div>
  `;

  if (allArticlesCache.length === 0) {
    const snapshot = await db.collection('articles').where('status', '==', 'published').orderBy('publishedAt', 'desc').get();
    allArticlesCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  setupMagazinEvents();
  renderArticles();
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

async function loadArticle(slug) {
  const container = document.getElementById('app');
  try {
    const snapshot = await db.collection('articles').where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) { container.innerHTML = '<div class="container"><p>Makale bulunamadı.</p></div>'; return; }
    
    const article = snapshot.docs[0].data();
    
    container.innerHTML = `
      <div class="container" style="max-width: 800px; padding: 40px 0;">
        <button class="ghost-button" style="margin-bottom: 24px;" onclick="window.history.back()">← Geri Dön</button>
        
        <span class="pill" style="margin-bottom: 16px;">${getCategoryLabel(article.category)}</span>
        <h1 style="font-family: var(--serif); font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1; margin-top: 0;">${article.title}</h1>
        <div style="display: flex; gap: 12px; color: var(--muted); margin-bottom: 32px; font-weight: 600;">
          <span>✍️ ${article.author}</span>
          <span>📅 ${formatDateStr(article.publishedAt)}</span>
        </div>

        ${article.coverImage ? `<img src="${article.coverImage}" alt="${article.title}" style="width: 100%; border-radius: 18px; margin-bottom: 32px; object-fit: cover; max-height: 400px;">` : ''}

        <div class="rich-content">
          ${article.content}
        </div>
      </div>
    `;
    window.scrollTo(0, 0);
  } catch (error) {
    container.innerHTML = '<div class="container"><p>Hata oluştu.</p></div>';
  }
}

// ══════════════════════════════════════════════
//  AKADEMİ VE KURSLAR
// ══════════════════════════════════════════════

async function loadAllCourses() {
  const container = document.getElementById('app');
  container.innerHTML = `
    <div class="container" style="padding: 40px 0;">
      <div class="section-heading">
        <div>
          <h2>Akademi</h2>
          <p>Bilgiyi keşfet, kendini geliştir.</p>
        </div>
      </div>
      <div class="course-grid" id="coursesGrid"><p style="color: var(--muted);">Yükleniyor...</p></div>
    </div>
  `;
  try {
    const snapshot = await db.collection('courses').where('status', '==', 'published').orderBy('publishedAt', 'desc').get();
    const grid = document.getElementById('coursesGrid');
    if (snapshot.empty) { grid.innerHTML = '<p>Henüz kurs eklenmemiş.</p>'; return; }
    grid.innerHTML = snapshot.docs.map(doc => createCourseCard(doc.data())).join('');
  } catch (error) {
    console.error(error);
  }
}

async function loadCourse(slug) {
  const container = document.getElementById('app');
  try {
    const snapshot = await db.collection('courses').where('slug', '==', slug).limit(1).get();
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

    if (!enrollment && !currentLesson.isFree) {
      container.innerHTML = `<div class="container" style="padding: 60px 0; text-align: center;"><h2>🔒 Kilitli Ders</h2><button class="primary-button" onclick="window.location.hash='#/kurs/${courseSlug}'">Kursa Git ve Kayıt Ol</button></div>`;
      return;
    }

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
  const btn = document.getElementById('completeLessonBtn');
  btn.disabled = true; btn.textContent = '⏳...';
  try {
    const enrollRef = db.collection('enrollments').doc(enrollmentId);
    const doc = await enrollRef.get();
    let completed = doc.data().completedLessons || [];
    
    if (completed.includes(lessonOrder)) completed = completed.filter(o => o !== lessonOrder);
    else completed.push(lessonOrder);
    
    const progress = Math.round((completed.length / totalLessons) * 100);
    await enrollRef.update({ completedLessons: completed, progressPercent: progress });
    
    if (!completed.includes(lessonOrder)) {
      btn.textContent = '☐ Dersi Tamamla'; btn.className = 'primary-button'; btn.disabled = false;
    } else {
      btn.textContent = '✅ Tamamlandı'; btn.className = 'ghost-button';
      if (!isLastLesson) setTimeout(() => window.location.hash = `#/ders/${courseSlug}/${lessonOrder + 1}`, 1000);
      else btn.disabled = false;
    }
  } catch (error) { console.error(error); btn.disabled = false; }
}

// ══════════════════════════════════════════════
//  KULLANICI PROFİLİ
// ══════════════════════════════════════════════

async function loadProfile() {
  const container = document.getElementById('app');
  const user = firebase.auth().currentUser;

  if (!user) {
    container.innerHTML = `
      <div class="container" style="max-width: 400px; padding: 60px 0;">
        <div class="admin-panel">
          <div class="admin-panel__head"><h3 style="margin:0;">Giriş Yap</h3></div>
          <button class="ghost-button" style="width: 100%; justify-content: center; margin-top: 16px;" onclick="login()">Google ile Giriş Yap</button>
        </div>
      </div>
    `;
    return;
  }

  try {
    const enrollSnapshot = await db.collection('enrollments').where('userId', '==', user.uid).get();
    const enrollments = enrollSnapshot.docs.map(d => d.data());
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progressPercent === 100).length;

    container.innerHTML = `
      <div class="container" style="padding: 40px 0;">
        <div class="data-panel" style="margin-bottom: 32px; align-items: center;">
          <img src="${user.photoURL || 'assets/logo.png'}" style="width: 80px; height: 80px; border-radius: 50%;">
          <div>
            <h2 style="margin: 0;">${user.displayName || 'Kullanıcı'}</h2>
            <p style="color: var(--muted); margin-bottom: 12px;">${user.email}</p>
            <button class="ghost-button danger-button" onclick="logout()">Çıkış Yap</button>
          </div>
        </div>

        <div class="metric-grid" style="margin-bottom: 40px;">
          <div class="metric-card">
            <strong>${totalCourses}</strong>
            <span>Kayıtlı Kurs</span>
          </div>
          <div class="metric-card">
            <strong>${completedCourses}</strong>
            <span>Tamamlanan Kurs</span>
          </div>
        </div>

        <h3>Kayıtlı Olduğum Kurslar</h3>
        <p style="color:var(--muted);">İlerlemenizi kurs detay sayfalarından takip edebilirsiniz.</p>
        <button class="primary-button" onclick="window.location.hash='#/akademi'">Yeni Kurs Keşfet</button>
      </div>
    `;
  } catch (error) {
    console.error(error);
  }
}