/* ============================================
   ESTİ BİRAZ — Ortak UI Fonksiyonları (ui.js)
   ============================================ */

// ── Hamburger Menü Toggle ──
const hamburger = document.getElementById('hamburger');
const mainNav   = document.getElementById('mainNav');

if (hamburger && mainNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mainNav.classList.toggle('open');
  });

  // Menü linkine tıklanınca menüyü kapat
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mainNav.classList.remove('open');
    });
  });
}

// ── Aktif Sayfa Linki ──
function updateActiveNav() {
  const hash = window.location.hash || '#/';
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === hash);
  });
}
window.addEventListener('hashchange', updateActiveNav);
updateActiveNav();

// ── Zaman Formatlama ──
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'yıl',  seconds: 31536000 },
    { label: 'ay',   seconds: 2592000 },
    { label: 'hafta',seconds: 604800 },
    { label: 'gün',  seconds: 86400 },
    { label: 'saat', seconds: 3600 },
    { label: 'dk',   seconds: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) return `${count} ${i.label} önce`;
  }
  return 'Az önce';
}

// ── Okuma Süresi Hesaplama ──
function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} dk okuma`;
}

// ── Kart Oluşturucu (Makale) ──
function createArticleCard(article) {
  return `
    <a href="#/makale/${article.slug}" class="card">
      <img src="${article.coverImage || 'assets/images/placeholder.jpg'}"
           alt="${article.title}" class="card__image" loading="lazy">
      <div class="card__body">
        <span class="card__tag">${article.category || 'Genel'}</span>
        <h3 class="card__title">${article.title}</h3>
        <p class="card__excerpt">${article.summary || ''}</p>
        <div class="card__meta">
          <span>${timeAgo(article.publishedAt)}</span>
          <span>${readingTime(article.content || article.summary || '')}</span>
        </div>
      </div>
    </a>
  `;
}

// ── Kart Oluşturucu (Kurs) ──
function createCourseCard(course) {
  return `
    <a href="#/kurs/${course.id}" class="card">
      <img src="${course.coverImage || 'assets/images/placeholder.jpg'}"
           alt="${course.title}" class="card__image" loading="lazy">
      <div class="card__body">
        <span class="card__tag">${course.category || 'Eğitim'}</span>
        <h3 class="card__title">${course.title}</h3>
        <p class="card__excerpt">${course.description || ''}</p>
        <div class="card__meta">
          <span>${course.totalLessons || 0} ders</span>
          <span class="badge badge--success">Ücretsiz</span>
        </div>
      </div>
    </a>
  `;
}