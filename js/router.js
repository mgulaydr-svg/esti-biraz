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
  pageMeta(
    'Akademi',
    'ESTİ BİRAZ Akademi; sağlık, eğitim, bilim, veri ve teknoloji alanlarında yapılandırılmış öğrenme içerikleri.'
  );

  // Doğru fonksiyon ismi olan loadAllCourses çağrılıyor
  if (typeof loadAllCourses === 'function') {
    loadAllCourses();
  } else {
    appContainer.innerHTML = '<p>Akademi sayfası yüklenemedi.</p>';
  }
}

function renderHakkinda() {
  pageMeta('Hakkında', 'ESTİ BİRAZ ve Ekosistem Uygulamaları');
  appContainer.innerHTML = `
    <div class="container" style="padding: 60px 0; max-width: 900px; text-align: center;">
      <div class="admin-panel" style="margin-bottom: 40px; border-color: var(--brand-teal);">
        <h1 style="font-family: var(--serif); color: var(--guardian-blue); margin-top:0;">Hakkımızda</h1>
        <p style="font-size: 1.1rem; color: var(--muted);">ESTİ BİRAZ, sağlık meslek lisesi öğrencileri, eğitimciler ve alanında uzmanlaşmak isteyen profesyoneller için tasarlanmış bağımsız bir eğitim platformudur.</p>
      </div>

      <h2 style="font-family: var(--serif); color: var(--brand-teal); margin-bottom: 24px;">🧩 Ekosistemdeki Diğer Uygulamalarımız</h2>

      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 24px;">

        <a href="https://mgulaydr-svg.github.io/akilli-kartlar" target="_blank" class="article-card" style="flex: 1 1 300px; max-width: 400px; text-align:center; padding: 32px; text-decoration:none; display:flex; flex-direction:column; align-items:center; box-sizing: border-box;">
          <img src="assets/akilli-kartlar.png" alt="Akıllı Kartlar" style="max-height: 140px; margin-bottom: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: auto;">
          <h3 style="color: var(--guardian-blue); margin: 0 0 12px; font-size: 1.5rem;">Akıllı Kartlar</h3>
          <p style="color: var(--muted); margin:0; font-size: 0.95rem;">Hızlı tekrarlar ve ezber gerektiren sağlık terimleri için interaktif çalışma kartları sistemi.</p>
        </a>

        <a href="https://mgulaydr-svg.github.io/sorularla-calisma" target="_blank" class="article-card" style="flex: 1 1 300px; max-width: 400px; text-align:center; padding: 32px; text-decoration:none; display:flex; flex-direction:column; align-items:center; box-sizing: border-box;">
          <img src="assets/sorularla-calisma.png" alt="Sorularla Çalışma" style="max-height: 140px; margin-bottom: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: auto;">
          <h3 style="color: var(--brand-blue); margin: 0 0 12px; font-size: 1.5rem;">Sorularla Çalışma</h3>
          <p style="color: var(--muted); margin:0; font-size: 0.95rem;">Sınavlara hazırlık ve konu pekiştirme için özel olarak tasarlanmış çoktan seçmeli test ekosistemi.</p>
        </a>

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
