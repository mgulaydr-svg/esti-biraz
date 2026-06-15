/* ============================================
   ESTİ BİRAZ — Yeni Tasarım SPA Router
   Not: /magazin eski bağlantılar için alias olarak korunur.
============================================ */

const appContainer = document.getElementById('app');

function pageMeta(title, description, extra = {}) {
  if (typeof setPageMeta === 'function') {
    setPageMeta({ title, description, ...extra });
  } else {
    document.title = `${title} — ESTİ BİRAZ`;
  }
}

// ── Menü Aktiflik Durumunu Güncelleme ──
function updateActiveNav() {
  const hash = window.location.hash || '#/';
  const navLinks = document.querySelectorAll('.section-nav a');
  
  navLinks.forEach(link => {
    // Tüm linklerin alt çizgisini temizle
    link.style.borderBottomColor = 'transparent';
    link.style.color = 'var(--guardian-blue-soft)';
    
    const href = link.getAttribute('href');
    // Eğer anasayfadaysak tam eşleşme, alt sayfalardaysak başlangıç eşleşmesi
    if ((href === '#/' && hash === '#/') || (href !== '#/' && hash.startsWith(href))) {
      link.style.borderBottomColor = 'var(--guardian-yellow)';
      link.style.color = 'var(--ink)';
    }
  });
}

function renderHome() {
  pageMeta('Ana Sayfa', 'ESTİ BİRAZ; sağlık, eğitim, bilim, veri ve teknoloji alanlarında makaleler ve öğrenme içerikleri sunar.');
  if (typeof loadLatestArticles === 'function') {
    loadLatestArticles();
  } else {
    appContainer.innerHTML = '<div class="container" style="padding: 40px; text-align: center;">Ana sayfa yüklenemedi.</div>';
  }
}

function renderMakaleler() {
  pageMeta('Makaleler', 'ESTİ BİRAZ makaleleri; sağlık, eğitim, bilim, veri ve teknoloji alanlarında güvenilir ve anlaşılır yazılar.');
  if (typeof loadAllArticles === 'function') {
    loadAllArticles();
  } else {
    appContainer.innerHTML = '<div class="container" style="padding: 40px; text-align: center;">Makaleler yüklenemedi.</div>';
  }
}

function renderAkademi() {
  pageMeta('Akademi', 'ESTİ BİRAZ Akademi; sağlık, eğitim, bilim, veri ve teknoloji alanlarında yapılandırılmış öğrenme içerikleri.');
  if (typeof loadAllCourses === 'function') {
    loadAllCourses();
  } else {
    appContainer.innerHTML = '<div class="container" style="padding: 40px; text-align: center;">Akademi sayfası yüklenemedi.</div>';
  }
}

function renderHakkinda() {
  pageMeta('Hakkında', 'ESTİ BİRAZ hakkında detaylı bilgi.');
  appContainer.innerHTML = `
    <div class="container" style="padding: 60px 0; max-width: 800px;">
      <div class="admin-panel">
        <h1 style="font-family: var(--serif); margin-top: 0; color: var(--guardian-blue);">Hakkında</h1>
        <div class="rich-content">
          <p>ESTİ BİRAZ, sağlık meslek lisesi öğrencileri, eğitimciler ve meraklı bireyler için tasarlanmış bağımsız bir bilgi platformudur.</p>
          <p>Amacımız; sağlık, bilim ve teknoloji alanındaki verileri herkesin anlayabileceği sade bir dille sunmaktır.</p>
        </div>
      </div>
    </div>
  `;
}

async function renderProfile() {
  pageMeta('Profilim', 'Kullanıcı profili ve öğrenme ilerlemesi.');
  if (typeof loadProfile === 'function') loadProfile();
}

function renderMakale(slug) {
  appContainer.innerHTML = '<div class="container" style="padding: 60px 0; text-align: center; font-weight: 800; color: var(--muted);">Makale yükleniyor...</div>';
  if (typeof loadArticle === 'function') loadArticle(slug);
}

function renderKurs(slug) {
  appContainer.innerHTML = '<div class="container" style="padding: 60px 0; text-align: center; font-weight: 800; color: var(--muted);">Kurs yükleniyor...</div>';
  if (typeof loadCourse === 'function') loadCourse(slug);
}

function renderDers(courseSlug, lessonOrder) {
  appContainer.innerHTML = '<div class="container" style="padding: 60px 0; text-align: center; font-weight: 800; color: var(--muted);">Ders yükleniyor...</div>';
  if (typeof loadLesson === 'function') loadLesson(courseSlug, parseInt(lessonOrder, 10));
}

function renderLegalPage(type) {
  const isPrivacy = type === 'gizlilik';
  pageMeta(
    isPrivacy ? 'Gizlilik Politikası' : 'Kullanım Şartları',
    isPrivacy ? 'ESTİ BİRAZ gizlilik politikası.' : 'ESTİ BİRAZ kullanım şartları.'
  );
  appContainer.innerHTML = `
    <div class="container" style="padding: 60px 0; max-width: 800px;">
      <div class="admin-panel">
        <h1 style="font-family: var(--serif); margin-top: 0;">${isPrivacy ? 'Gizlilik Politikası' : 'Kullanım Şartları'}</h1>
        <p style="color: var(--muted);">Bu bölüm yayın öncesinde ayrıntılı olarak düzenlenmelidir.</p>
      </div>
    </div>
  `;
}

function render404() {
  pageMeta('Sayfa Bulunamadı', 'Aradığınız sayfa bulunamadı.');
  appContainer.innerHTML = `
    <div class="container" style="padding: 80px 0; text-align: center;">
      <h1 style="font-family: var(--serif); font-size: 5rem; margin: 0; color: var(--brand-teal);">404</h1>
      <p style="font-size: 1.2rem; color: var(--muted); margin-bottom: 24px;">Görünüşe göre rüzgar sizi yanlış bir sayfaya savurdu.</p>
      <button class="primary-button" onclick="window.location.hash='#/'">Ana Sayfaya Dön</button>
    </div>
  `;
}

async function renderAdmin() {
  const user = await new Promise((resolve) => {
    const unsubscribe = firebase.auth().onAuthStateChanged((u) => {
      unsubscribe();
      resolve(u);
    });
  });

  if (!user) {
    pageMeta('Yetki Gerekli', 'Admin paneli için giriş yapılmalıdır.');
    appContainer.innerHTML = `
      <div class="container" style="padding: 60px 0; text-align: center; max-width: 480px;">
        <div class="admin-panel">
          <h2 style="margin-top: 0;">Yetki Gerekli</h2>
          <p style="color: var(--muted); margin-bottom: 24px;">Admin paneline erişmek için giriş yapmalısınız.</p>
          <button class="ghost-button" onclick="login()">Giriş Yap</button>
        </div>
      </div>
    `;
    return;
  }

  const allowed = typeof isAdminUser === 'function' ? await isAdminUser() : false;
  // Manuel admin kontrolü (Yedek)
  const isSuperAdmin = user.email === 'mgulaydr@gmail.com'; 

  if (!allowed && !isSuperAdmin) {
    pageMeta('Erişim Engellendi', 'Bu sayfaya erişim yetkiniz bulunmuyor.');
    appContainer.innerHTML = `
      <div class="container" style="padding: 60px 0; text-align: center; max-width: 480px;">
        <div class="content-callout content-callout--warning">
          <strong>⛔ Erişim Engellendi</strong>
          <p>Bu sayfaya erişim yetkiniz bulunmuyor.</p>
        </div>
        <button class="primary-button" style="margin-top: 24px;" onclick="window.location.hash='#/'">Ana Sayfaya Dön</button>
      </div>
    `;
    return;
  }

  pageMeta('Yönetim Paneli', 'Makale ve kurs yönetimi.');
  appContainer.innerHTML = `
    <div class="container" style="padding: 40px 0;">
      <h1 style="font-family: var(--serif); margin-bottom: 24px; letter-spacing: -0.04em;">⚙️ Yönetim Paneli</h1>
      <div class="admin-tabs">
        <button aria-pressed="true" class="admin-tab" onclick="switchAdminTab(this, 'articles')">Makaleler</button>
        <button aria-pressed="false" class="admin-tab" onclick="switchAdminTab(this, 'courses')">Kurslar</button>
      </div>
      <div id="adminContent" style="margin-top: 24px;"></div>
    </div>
  `;
  if (typeof loadAdminArticles === 'function') loadAdminArticles();
}

function switchAdminTab(btn, tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.setAttribute('aria-pressed', 'false'));
  btn.setAttribute('aria-pressed', 'true');
  if (tab === 'articles' && typeof loadAdminArticles === 'function') loadAdminArticles();
  if (tab === 'courses' && typeof loadAdminCourses === 'function') loadAdminCourses();
}

const routes = {
  '/': renderHome,
  '/makaleler': renderMakaleler,
  '/magazin': renderMakaleler,
  '/akademi': renderAkademi,
  '/hakkinda': renderHakkinda,
  '/profil': renderProfile,
  '/admin': renderAdmin,
  '/gizlilik': () => renderLegalPage('gizlilik'),
  '/kullanim-sartlari': () => renderLegalPage('kullanim')
};

const dynamicRoutes = [
  { pattern: /^\/makale\/(.+)$/, render: renderMakale },
  { pattern: /^\/kurs\/(.+)$/, render: renderKurs },
  { pattern: /^\/ders\/(.+)\/(.+)$/, render: renderDers }
];

function normalizePath(path) {
  if (!path || path === '#') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function router() {
  const hash = window.location.hash || '#/';
  const path = normalizePath(hash.slice(1));

  if (routes[path]) {
    routes[path]();
    updateActiveNav();
    window.scrollTo(0, 0);
    return;
  }

  for (const route of dynamicRoutes) {
    const match = path.match(route.pattern);
    if (match) {
      route.render(match[1], match[2]);
      updateActiveNav();
      window.scrollTo(0, 0);
      return;
    }
  }

  render404();
}

window.switchAdminTab = switchAdminTab;
window.router = router;
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);