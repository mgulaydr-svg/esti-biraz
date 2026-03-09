/* ============================================
   ESTİ BİRAZ — SPA Router (router.js)
   ============================================ */

// ── Route Tanımları ──
const routes = {
  '/':         { title: 'Ana Sayfa',  render: renderHome },
  '/magazin':  { title: 'Magazin',    render: renderMagazin },
  '/akademi':  { title: 'Akademi',    render: renderAkademi },
  '/hakkinda': { title: 'Hakkında',   render: renderHakkinda },
  '/admin':     { title: 'Admin Panel',     render: renderAdmin },
  '/admin/makale-ekle': { title: 'Makale Ekle', render: renderMakaleEkle },
};

// Dinamik route'lar (parametre içerenler)
const dynamicRoutes = [
  { pattern: /^\/makale\/(.+)$/, title: 'Makale',  render: renderMakale },
  { pattern: /^\/kurs\/(.+)$/,   title: 'Kurs',    render: renderKurs },
  { pattern: /^\/admin\/makale-duzenle\/(.+)$/, title: 'Makale Düzenle', render: renderMakaleDuzenle },
];

// ── Ana Uygulama Alanı ──
const appContainer = document.getElementById('app');

// ══════════════════════════════════════════════
//  ROUTER FONKSİYONU
// ══════════════════════════════════════════════
function router() {
  const hash = window.location.hash || '#/';
  const path = hash.slice(1); // # işaretini kaldır

  console.log('🧭 Route:', path);

  // 1. Statik route kontrolü
  if (routes[path]) {
    document.title = `${routes[path].title} — ESTİ BİRAZ`;
    routes[path].render();
    updateActiveNav();
    window.scrollTo(0, 0);
    return;
  }

  // 2. Dinamik route kontrolü
  for (const route of dynamicRoutes) {
    const match = path.match(route.pattern);
    if (match) {
      document.title = `${route.title} — ESTİ BİRAZ`;
      route.render(match[1]); // İlk yakalama grubunu parametre olarak gönder
      updateActiveNav();
      window.scrollTo(0, 0);
      return;
    }
  }

  // 3. Eşleşme yoksa → 404
  render404();
}

// ══════════════════════════════════════════════
//  SAYFA RENDER FONKSİYONLARI
// ══════════════════════════════════════════════

// ── Ana Sayfa ──
function renderHome() {
  appContainer.innerHTML = `
    <!-- HERO BÖLÜMÜ -->
    <section class="hero">
      <div class="container">
        <h1 class="hero__title">Sağlık, Bilim ve<br>Eğitimin Buluşma Noktası</h1>
        <p class="hero__subtitle">
          Kanıta dayalı makaleler okuyun, interaktif kurslarla öğrenin,
          sertifikanızı alın.
        </p>
        <div class="hero__actions">
          <a href="#/magazin" class="btn btn--primary btn--lg">Makaleleri Keşfet</a>
          <a href="#/akademi" class="btn btn--outline btn--lg">🎓 Kursları Keşfet</a>
        </div>
      </div>
    </section>

    <!-- SON MAKALELER -->
    <section class="section">
      <div class="container">
        <div class="section__header">
          <h2 class="section__title">📰 Son Makaleler</h2>
          <a href="#/magazin" class="section__link">Tümünü gör →</a>
        </div>
        <div class="grid grid--3" id="latestArticles">
          <div class="card card--skeleton"></div>
          <div class="card card--skeleton"></div>
          <div class="card card--skeleton"></div>
        </div>
      </div>
    </section>

    <!-- ÖNE ÇIKAN KURSLAR -->
    <section class="section section--alt">
      <div class="container">
        <div class="section__header">
          <h2 class="section__title">🎓 Öne Çıkan Kurslar</h2>
          <a href="#/akademi" class="section__link">Tümünü gör →</a>
        </div>
        <div class="grid grid--3" id="featuredCourses">
          <div class="card card--skeleton"></div>
          <div class="card card--skeleton"></div>
          <div class="card card--skeleton"></div>
        </div>
      </div>
    </section>
  `;

  // Firestore'dan veri çekme
  loadLatestArticles();
  loadFeaturedCourses();
}

// ── Magazin Sayfası ──
function renderMagazin() {
  appContainer.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="page-header">
          <h1 class="page-header__title">📰 Magazin</h1>
          <p class="page-header__desc">Sağlık, bilim ve eğitim alanında kanıta dayalı makaleler.</p>
        </div>

        <!-- Kategori Filtreleri -->
        <div class="filter-bar" id="categoryFilters">
          <button class="filter-btn active" data-category="all">Tümü</button>
          <button class="filter-btn" data-category="saglik">Sağlık</button>
          <button class="filter-btn" data-category="bilim">Bilim</button>
          <button class="filter-btn" data-category="egitim">Eğitim</button>
          <button class="filter-btn" data-category="teknoloji">Teknoloji</button>
        </div>

        <!-- Makale Listesi -->
        <div class="grid grid--3" id="articleList">
          <div class="card card--skeleton"></div>
          <div class="card card--skeleton"></div>
          <div class="card card--skeleton"></div>
          <div class="card card--skeleton"></div>
          <div class="card card--skeleton"></div>
          <div class="card card--skeleton"></div>
        </div>
      </div>
    </section>
  `;

  // Kategori filtresi olay dinleyicileri
  setupCategoryFilters();
  loadAllArticles();
}

// ── Akademi Sayfası ──
function renderAkademi() {
  appContainer.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="page-header">
          <h1 class="page-header__title">🎓 Akademi</h1>
          <p class="page-header__desc">İnteraktif kurslarla öğrenin, sertifikanızı alın.</p>
        </div>

        <!-- Kurs Listesi -->
        <div class="grid grid--3" id="courseList">
          <div class="card card--skeleton"></div>
          <div class="card card--skeleton"></div>
          <div class="card card--skeleton"></div>
        </div>
      </div>
    </section>
  `;
  loadAllCourses();
}

// ── Hakkında Sayfası ──
function renderHakkinda() {
  appContainer.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="page-header">
          <h1 class="page-header__title">Hakkında</h1>
        </div>

        <div class="about-content">
          <div class="about-card">
            <h2>🚀 ESTİ BİRAZ Nedir?</h2>
            <p>
              ESTİ BİRAZ, sağlık, bilim ve eğitim alanında kanıta dayalı,
              güvenilir ve erişilebilir içerikler sunan bir platformdur.
            </p>
            <p>
              Amacımız, karmaşık bilimsel konuları herkesin anlayabileceği
              bir dille aktarmak ve interaktif eğitim araçlarıyla
              öğrenmeyi kolaylaştırmaktır.
            </p>
          </div>

          <div class="about-card">
            <h2>🎯 Misyonumuz</h2>
            <ul class="about-list">
              <li>Kanıta dayalı, güvenilir sağlık bilgisi sunmak</li>
              <li>Bilimi herkes için erişilebilir kılmak</li>
              <li>İnteraktif eğitim deneyimleri oluşturmak</li>
              <li>Toplum sağlığını geliştirmeye katkıda bulunmak</li>
            </ul>
          </div>

          <div class="about-card">
            <h2>👤 İletişim</h2>
            <p>Sorularınız, önerileriniz veya iş birliği teklifleriniz için bize ulaşabilirsiniz.</p>
            <p>📧 <a href="mailto:iletisim@estibiraz.com">iletisim@estibiraz.com</a></p>
          </div>
        </div>
      </div>
    </section>
  `;
}

// ── Tekil Makale Sayfası ──
function renderMakale(slug) {
  appContainer.innerHTML = `
    <section class="section">
      <div class="container container--narrow">
        <div class="article-loading">
          <div class="spinner"></div>
          <p>Makale yükleniyor...</p>
        </div>
      </div>
    </section>
  `;

  loadArticle(slug);
}

// ── Tekil Kurs Sayfası ──
function renderKurs(id) {
  appContainer.innerHTML = `
    <section class="section">
      <div class="container container--narrow">
        <div class="article-loading">
          <div class="spinner"></div>
          <p>Kurs yükleniyor...</p>
        </div>
      </div>
    </section>
  `;

  loadCourse(id);
}

// ── 404 Sayfası ──
function render404() {
  document.title = 'Sayfa Bulunamadı — ESTİ BİRAZ';
  appContainer.innerHTML = `
    <section class="section">
      <div class="container text-center">
        <div class="error-page">
          <span class="error-page__icon">🔍</span>
          <h1 class="error-page__title">404</h1>
          <p class="error-page__text">Aradığınız sayfa bulunamadı.</p>
          <a href="#/" class="btn btn--primary">Ana Sayfaya Dön</a>
        </div>
      </div>
    </section>
  `;
}

// ── Admin Panel ──
async function renderAdmin() {
  const admin = await isAdminUser();
  if (!admin) {
    appContainer.innerHTML = `
      <section class="section">
        <div class="container text-center">
          <div class="error-page">
            <span class="error-page__icon">🔒</span>
            <h1 class="error-page__title">Yetkisiz Erişim</h1>
            <p class="error-page__text">Bu sayfayı görüntülemek için admin veya editör yetkisi gerekiyor.</p>
            <a href="#/" class="btn btn--primary">Ana Sayfaya Dön</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  appContainer.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="page-header">
          <h1 class="page-header__title">🛠️ Admin Panel</h1>
          <p class="page-header__desc">İçerik yönetimi ve site ayarları.</p>
        </div>

        <div class="admin-grid">
          <!-- Makale Yönetimi -->
          <div class="admin-card">
            <div class="admin-card__icon">📰</div>
            <h3 class="admin-card__title">Makale Yönetimi</h3>
            <p class="admin-card__desc">Makale ekle, düzenle veya sil.</p>
            <div class="admin-card__actions">
              <a href="#/admin/makale-ekle" class="btn btn--primary">+ Yeni Makale</a>
            </div>
            <div class="admin-card__list" id="adminArticleList">
              <p class="loading-text">Makaleler yükleniyor...</p>
            </div>
          </div>

          <!-- Kurs Yönetimi -->
          <div class="admin-card">
            <div class="admin-card__icon">🎓</div>
            <h3 class="admin-card__title">Kurs Yönetimi</h3>
            <p class="admin-card__desc">Kurs ekle, düzenle veya sil.</p>
            <div class="admin-card__actions">
              <button class="btn btn--outline" onclick="alert('Kurs ekleme Faz 2\'de gelecek!')">+ Yeni Kurs</button>
            </div>
            <div class="admin-card__list" id="adminCourseList">
              <p class="loading-text">Kurslar yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Admin listelerini yükle
  loadAdminArticles();
  loadAdminCourses();
}

// ══════════════════════════════════════════════
//  KATEGORİ FİLTRE SİSTEMİ
// ══════════════════════════════════════════════
function setupCategoryFilters() {
  const filterBar = document.getElementById('categoryFilters');
  if (!filterBar) return;

  filterBar.addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-btn')) return;

    // Aktif butonu güncelle
    filterBar.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    const category = e.target.dataset.category;
    console.log('🏷️ Kategori filtresi:', category);
    loadAllArticles(category);
  });
}

// ══════════════════════════════════════════════
//  ROUTER BAŞLATMA
// ══════════════════════════════════════════════

// Hash değiştiğinde router'ı çalıştır
window.addEventListener('hashchange', router);

// Sayfa ilk yüklendiğinde router'ı çalıştır
window.addEventListener('DOMContentLoaded', () => {
  console.log('🧭 Router başlatıldı.');
  router();
});