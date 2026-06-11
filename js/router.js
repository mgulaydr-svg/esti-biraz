/* ============================================
   ESTİ BİRAZ — SPA Router
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

function renderHome() {
  pageMeta(
    'Ana Sayfa',
    'ESTİ BİRAZ; sağlık, eğitim, bilim, veri ve teknoloji alanlarında makaleler ve öğrenme içerikleri sunar.'
  );

  if (typeof renderHomePageV2 === 'function') {
    renderHomePageV2();
  } else if (typeof loadLatestArticles === 'function') {
    loadLatestArticles();
  } else {
    appContainer.innerHTML = '<p>Ana sayfa yüklenemedi.</p>';
  }
}

function renderMakaleler() {
  pageMeta(
    'Makaleler',
    'ESTİ BİRAZ makaleleri; sağlık, eğitim, bilim, veri ve teknoloji alanlarında güvenilir ve anlaşılır yazılar.'
  );

  if (typeof renderArticlesPageV2 === 'function') {
    renderArticlesPageV2();
  } else if (typeof loadAllArticles === 'function') {
    loadAllArticles();
  } else {
    appContainer.innerHTML = '<p>Makaleler yüklenemedi.</p>';
  }
}

function renderMakalelerTest() {
  pageMeta(
    'Makaleler Test',
    'ESTİ BİRAZ makaleleri için editoryal test görünümü.'
  );

  if (typeof renderArticlesPageV2 === 'function') {
    renderArticlesPageV2();
  } else if (typeof loadAllArticles === 'function') {
    loadAllArticles();
  } else {
    appContainer.innerHTML = '<p>Makaleler test sayfası yüklenemedi.</p>';
  }
}

function renderAkademi() {
  pageMeta(
    'Akademi',
    'ESTİ BİRAZ Akademi; sağlık, eğitim, bilim, veri ve teknoloji alanlarında yapılandırılmış öğrenme içerikleri.'
  );

  if (typeof renderAcademyPageV2 === 'function') {
    renderAcademyPageV2();
  } else if (typeof loadCourses === 'function') {
    loadCourses();
  } else if (typeof loadAcademy === 'function') {
    loadAcademy();
  } else {
    appContainer.innerHTML = '<p>Akademi sayfası yüklenemedi.</p>';
  }
}

function renderHakkinda() {
  pageMeta(
    'Hakkında',
    'ESTİ BİRAZ platformunun amacı, kapsamı ve iletişim bilgileri.'
  );
  appContainer.innerHTML = `
    <section class="container page-section">
      <h1>Hakkında</h1>
      <h2>ESTİ BİRAZ Nedir?</h2>
      <p>ESTİ BİRAZ; sağlık, bilim, eğitim ve kültür alanlarında güvenilir, erişilebilir ve öğrenmeyi destekleyen içerikler sunan dijital bir platformdur.</p>
      <p>Amacımız, karmaşık konuları anlaşılır bir dille aktarmak; makale, kurs ve ders içerikleriyle kalıcı öğrenmeyi desteklemektir.</p>

      <h2>Misyonumuz</h2>
      <ul>
        <li>Kanıta dayalı ve anlaşılır içerik üretmek</li>
        <li>Bilimi ve eğitimi erişilebilir hale getirmek</li>
        <li>Öğrenmeyi makale, kurs ve etkinliklerle desteklemek</li>
        <li>Toplum sağlığı ve eğitim kültürüne katkı sunmak</li>
      </ul>

      <h2>İletişim</h2>
      <p>Sorularınız, önerileriniz veya iş birliği teklifleriniz için: <a href="mailto:iletisim@estibiraz.com">iletisim@estibiraz.com</a></p>
    </section>
  `;
}

async function renderProfile() {
  pageMeta('Profilim', 'Kullanıcı profili ve öğrenme ilerlemesi.');
  if (typeof loadProfile === 'function') loadProfile();
}

function renderMakale(slug) {
  appContainer.innerHTML = '<main class="container"><p>Makale yükleniyor...</p></main>';

  if (typeof renderArticleDetailPageV2 === 'function') {
    renderArticleDetailPageV2(slug);
  } else if (typeof loadArticle === 'function') {
    loadArticle(slug);
  } else {
    appContainer.innerHTML = '<main class="container"><p>Makale yüklenemedi.</p></main>';
  }
}

function renderKurs(slug) {
  appContainer.innerHTML = '<main class="container"><p>Kurs yükleniyor...</p></main>';

  if (typeof renderCourseDetailPageV2 === 'function') {
    renderCourseDetailPageV2(slug);
  } else if (typeof loadCourse === 'function') {
    loadCourse(slug);
  } else {
    appContainer.innerHTML = '<main class="container"><p>Kurs yüklenemedi.</p></main>';
  }
}

function renderDers(courseSlug, lessonKey) {
  appContainer.innerHTML = '<main class="container"><p>Ders yükleniyor...</p></main>';

  if (typeof renderLessonDetailPageV2 === 'function') {
    renderLessonDetailPageV2(courseSlug, lessonKey);
  } else if (typeof loadLesson === 'function') {
    loadLesson(courseSlug, lessonKey);
  } else {
    appContainer.innerHTML = '<main class="container"><p>Ders yüklenemedi.</p></main>';
  }
}

function renderDers(courseSlug, lessonOrder) {
  appContainer.innerHTML = '<main class="container"><p>Ders yükleniyor...</p></main>';
  if (typeof loadLesson === 'function') loadLesson(courseSlug, parseInt(lessonOrder, 10));
}

function renderLegalPage(type) {
  const isPrivacy = type === 'gizlilik';
  pageMeta(
    isPrivacy ? 'Gizlilik Politikası' : 'Kullanım Şartları',
    isPrivacy ? 'ESTİ BİRAZ gizlilik politikası.' : 'ESTİ BİRAZ kullanım şartları.'
  );
  appContainer.innerHTML = `
    <section class="container page-section">
      <h1>${isPrivacy ? 'Gizlilik Politikası' : 'Kullanım Şartları'}</h1>
      <p>Bu bölüm yayın öncesinde ayrıntılı olarak düzenlenmelidir.</p>
    </section>
  `;
}

function render404() {
  pageMeta('Sayfa Bulunamadı', 'Aradığınız sayfa bulunamadı.');
  appContainer.innerHTML = `
    <section class="container page-section text-center">
      <h1>404</h1>
      <p>Aradığınız sayfa bulunamadı.</p>
      <a href="#/" class="btn btn--primary">Ana Sayfaya Dön</a>
    </section>
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
      <section class="container page-section">
        <h1>Yetki Gerekli</h1>
        <p>Admin paneline erişmek için giriş yapmalısınız.</p>
      </section>
    `;
    return;
  }

  const allowed = typeof isAdminUser === 'function' ? await isAdminUser() : false;
  if (!allowed) {
    pageMeta('Erişim Engellendi', 'Bu sayfaya erişim yetkiniz bulunmuyor.');
    appContainer.innerHTML = `
      <section class="container page-section">
        <h1>⛔ Erişim Engellendi</h1>
        <p>Bu sayfaya erişim yetkiniz bulunmuyor.</p>
        <a href="#/" class="btn btn--primary">Ana Sayfaya Dön</a>
      </section>
    `;
    return;
  }

  pageMeta('Admin Paneli', 'Makale ve kurs yönetimi.');
  appContainer.innerHTML = `
    <section class="container admin-page">
      <h1>⚙️ Admin Paneli</h1>
      <div class="admin-tabs">
        <button class="admin-tab active" onclick="switchAdminTab(this, 'articles')">Makaleler</button>
        <button class="admin-tab" onclick="switchAdminTab(this, 'courses')">Kurslar</button>
      </div>
      <div id="adminContent"></div>
    </section>
  `;
  if (typeof loadAdminArticles === 'function') loadAdminArticles();
}

function switchAdminTab(btn, tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  if (tab === 'articles' && typeof loadAdminArticles === 'function') loadAdminArticles();
  if (tab === 'courses' && typeof loadAdminCourses === 'function') loadAdminCourses();
}

const routes = {
  '/': renderHome,
  '/makaleler': renderMakaleler,
  '/magazin': renderMakaleler,
  '/makaleler-test': renderMakalelerTest,
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

  if (path.startsWith('/ders/')) {
    const parts = path.split('/');
    const courseSlug = decodeURIComponent(parts[2] || '');
    const lessonKey = decodeURIComponent(parts[3] || '');
      
    renderDers(courseSlug, lessonKey);
    return;
  }

  if (routes[path]) {
    routes[path]();
    if (typeof updateActiveNav === 'function') updateActiveNav();
    window.scrollTo(0, 0);
    return;
  }

  for (const route of dynamicRoutes) {
    const match = path.match(route.pattern);
    if (match) {
      route.render(match[1], match[2]);
      if (typeof updateActiveNav === 'function') updateActiveNav();
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

window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (!header) return;
  header.classList.toggle('header--scrolled', window.scrollY > 20);
});
