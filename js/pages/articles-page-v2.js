/* ESTİ BİRAZ — Articles Page v2
   Editoryal makaleler sayfası.
*/

let ebArticlesPageState = {
  articles: [],
  activeCategory: 'tum'
};

async function renderArticlesPageV2() {
  const container = document.getElementById('app');
  if (!container) return;

  container.innerHTML = `
    <section class="editorial-hero">
      <div class="container editorial-hero__inner">
        <div>
          <span class="editorial-kicker">MAKALELER</span>
          <h1>Bilgiye editoryal bir pencere.</h1>
          <p>
            Sağlık, eğitim, bilim, veri ve teknoloji alanlarında seçilmiş,
            anlaşılır ve güvenilir yazılar.
          </p>
        </div>

        <aside class="editorial-hero__note">
          <strong>ESTİ BİRAZ seçkisi</strong>
          <span>Okumak, öğrenmek ve düşünmek için sadeleştirilmiş içerikler.</span>
        </aside>
      </div>
    </section>

    <section class="container editorial-filter-wrap">
      <div class="editorial-filter" id="articlesCategoryFilter">
        ${ebRenderArticleFilterButtons('tum')}
      </div>
    </section>

    <section class="container editorial-layout" id="articlesEditorialLayout">
      ${ebArticlesLoadingTemplate()}
    </section>
  `;

  await ebLoadAndRenderArticlesPage();
}

async function ebLoadAndRenderArticlesPage() {
  const layout = document.getElementById('articlesEditorialLayout');
  if (!layout) return;

  try {
    ebArticlesPageState.articles = await ebGetPublishedArticles(40);
    ebRenderArticlesEditorialLayout();
  } catch (error) {
    console.error('❌ Makaleler sayfası yüklenemedi:', error);
    layout.innerHTML = ebArticlesEmptyTemplate('Makaleler yüklenirken bir hata oluştu.');
  }
}

function ebRenderArticlesEditorialLayout() {
  const layout = document.getElementById('articlesEditorialLayout');
  const filter = document.getElementById('articlesCategoryFilter');
  if (!layout) return;

  const activeCategory = ebArticlesPageState.activeCategory;
  const articles = ebFilterArticlesByCategory(ebArticlesPageState.articles, activeCategory);

  if (filter) {
    filter.innerHTML = ebRenderArticleFilterButtons(activeCategory);
    ebBindArticleFilterEvents();
  }

  if (!articles.length) {
    layout.innerHTML = ebArticlesEmptyTemplate('Bu kategoride henüz yayınlanmış makale yok.');
    return;
  }

  const lead = articles[0];
  const sideArticles = articles.slice(1, 3);
  const remaining = articles.slice(3);

  layout.innerHTML = `
    <div class="editorial-top-grid">
      ${ebCreateEditorialLeadCard(lead)}

      <div class="editorial-side-stack">
        ${sideArticles.map(article => ebCreateEditorialSmallCard(article)).join('')}
      </div>
    </div>

    ${remaining.length ? `
      <div class="editorial-section-title">
        <span>DAHA FAZLA YAZI</span>
      </div>

      <div class="editorial-card-grid">
        ${remaining.map(article => ebCreateEditorialListCard(article)).join('')}
      </div>
    ` : ''}
  `;
}

function ebRenderArticleFilterButtons(activeCategory) {
  return ebGetArticleCategoriesForFilter().map(category => `
    <button
      type="button"
      class="editorial-filter__btn ${category.key === activeCategory ? 'is-active' : ''}"
      data-category="${category.key}"
    >
      ${category.label}
    </button>
  `).join('');
}

function ebBindArticleFilterEvents() {
  const buttons = document.querySelectorAll('.editorial-filter__btn');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      ebArticlesPageState.activeCategory = button.dataset.category || 'tum';
      ebRenderArticlesEditorialLayout();
    });
  });
}

function ebCreateEditorialLeadCard(article) {
  const title = ebEscapeHtml(article.title || 'Başlıksız Makale');
  const summary = ebEscapeHtml(article.summary || '');
  const slug = ebEscapeHtml(article.slug || article.id || '');
  const category = ebEscapeHtml(article.category || 'diger');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(article.category));
  const date = ebFormatDate(article);
  const readingTime = ebCalculateReadingTime(article.content || article.summary || '');

  const imageHtml = article.coverImage
    ? `<img src="${ebEscapeHtml(article.coverImage)}" alt="${title}" loading="lazy">`
    : `<div class="editorial-placeholder">📝</div>`;

  return `
    <a href="#/makale/${slug}" class="editorial-lead-card category-line--${category}">
      <div class="editorial-lead-card__image">
        ${imageHtml}
      </div>

      <div class="editorial-lead-card__body">
        <div class="editorial-meta">
          <span>${categoryLabel}</span>
          ${date ? `<span>${date}</span>` : ''}
          <span>${readingTime} dk okuma</span>
        </div>

        <h2>${title}</h2>

        ${summary ? `<p>${summary}</p>` : ''}

        <strong>Oku →</strong>
      </div>
    </a>
  `;
}

function ebCreateEditorialSmallCard(article) {
  const title = ebEscapeHtml(article.title || 'Başlıksız Makale');
  const summary = ebEscapeHtml(article.summary || '');
  const slug = ebEscapeHtml(article.slug || article.id || '');
  const category = ebEscapeHtml(article.category || 'diger');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(article.category));
  const readingTime = ebCalculateReadingTime(article.content || article.summary || '');

  return `
    <a href="#/makale/${slug}" class="editorial-small-card category-line--${category}">
      <div class="editorial-meta">
        <span>${categoryLabel}</span>
        <span>${readingTime} dk</span>
      </div>

      <h3>${title}</h3>

      ${summary ? `<p>${summary}</p>` : ''}

      <strong>Oku →</strong>
    </a>
  `;
}

function ebCreateEditorialListCard(article) {
  const title = ebEscapeHtml(article.title || 'Başlıksız Makale');
  const summary = ebEscapeHtml(article.summary || '');
  const slug = ebEscapeHtml(article.slug || article.id || '');
  const category = ebEscapeHtml(article.category || 'diger');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(article.category));
  const date = ebFormatDate(article);
  const readingTime = ebCalculateReadingTime(article.content || article.summary || '');

  const imageHtml = article.coverImage
    ? `<img src="${ebEscapeHtml(article.coverImage)}" alt="${title}" loading="lazy">`
    : `<div class="editorial-list-placeholder">📝</div>`;

  return `
    <a href="#/makale/${slug}" class="editorial-list-card category-line--${category}">
      <div class="editorial-list-card__image">
        ${imageHtml}
      </div>

      <div class="editorial-list-card__body">
        <div class="editorial-meta">
          <span>${categoryLabel}</span>
          ${date ? `<span>${date}</span>` : ''}
          <span>${readingTime} dk</span>
        </div>

        <h3>${title}</h3>

        ${summary ? `<p>${summary}</p>` : ''}

        <strong>Oku →</strong>
      </div>
    </a>
  `;
}

function ebArticlesLoadingTemplate() {
  return `
    <div class="editorial-state">
      <div class="loading-state__spinner"></div>
      <span>Makaleler yükleniyor...</span>
    </div>
  `;
}

function ebArticlesEmptyTemplate(message) {
  return `
    <div class="editorial-state editorial-state--empty">
      <strong>Bilgi</strong>
      <span>${ebEscapeHtml(message)}</span>
    </div>
  `;
}
