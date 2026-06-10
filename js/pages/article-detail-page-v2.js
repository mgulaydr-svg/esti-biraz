/* ESTİ BİRAZ — Article Detail Page v2 */

async function renderArticleDetailPageV2(slug) {
  const container = document.getElementById('app');
  if (!container) return;

  container.innerHTML = ebArticleDetailLoadingTemplate();

  try {
    const article = await ebGetArticleBySlug(slug);

    if (!article) {
      container.innerHTML = ebArticleDetailNotFoundTemplate();
      return;
    }

    const relatedArticles = await ebGetRelatedArticles(article, 3);
    container.innerHTML = ebArticleDetailTemplate(article, relatedArticles);

    if (typeof pageMeta === 'function') {
      pageMeta(article.title || 'Makale', article.summary || 'ESTİ BİRAZ makalesi.');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('❌ Makale detay sayfası yüklenemedi:', error);
    container.innerHTML = ebArticleDetailErrorTemplate();
  }
}

function ebArticleDetailTemplate(article, relatedArticles = []) {
  const title = ebEscapeHtml(article.title || 'Başlıksız Makale');
  const summary = ebEscapeHtml(article.summary || '');
  const author = ebEscapeHtml(article.author || 'Esti Biraz');
  const category = ebEscapeHtml(article.category || 'diger');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(article.category));
  const date = ebFormatDate(article);
  const readingTime = ebCalculateReadingTime(article.content || article.summary || '');
  const content = article.content || '';

  const coverImageHtml = article.coverImage
    ? `
      <figure class="article-detail-cover">
        <img src="${ebEscapeHtml(article.coverImage)}" alt="${title}" loading="eager">
      </figure>
    `
    : '';

  return `
    <article class="article-detail-v2">
      <header class="article-detail-hero category-line--${category}">
        <div class="container article-detail-hero__inner">
          <a href="#/makaleler" class="article-back-link">← Makalelere Dön</a>

          <div class="article-detail-meta">
            <span>${categoryLabel}</span>
            ${date ? `<span>${date}</span>` : ''}
            <span>${readingTime} dk okuma</span>
          </div>

          <h1>${title}</h1>

          ${summary ? `<p>${summary}</p>` : ''}

          <div class="article-detail-author">
            <span>Yazar</span>
            <strong>${author}</strong>
          </div>
        </div>
      </header>

      <div class="container">
        ${coverImageHtml}

        <div class="article-detail-layout">
          <aside class="article-detail-sidebar">
            <div class="article-detail-sidebar__box">
              <strong>Bu yazıda</strong>
              <span>${categoryLabel} alanında kısa, anlaşılır ve kaynaklı bir okuma.</span>
            </div>

            <a href="#/makaleler" class="article-detail-sidebar__link">
              Tüm Makaleler →
            </a>
          </aside>

          <main class="article-detail-content">
            ${content}
          </main>
        </div>

        ${relatedArticles.length ? ebRelatedArticlesTemplate(relatedArticles) : ''}
      </div>
    </article>
  `;
}

function ebRelatedArticlesTemplate(articles) {
  return `
    <section class="related-articles">
      <div class="related-articles__header">
        <span>İLGİLİ YAZILAR</span>
        <h2>Okumaya devam edin</h2>
      </div>

      <div class="related-articles__grid">
        ${articles.map(article => ebCreateArticleCard(article)).join('')}
      </div>
    </section>
  `;
}

function ebArticleDetailLoadingTemplate() {
  return `
    <div class="container article-detail-state">
      <div class="loading-state__spinner"></div>
      <span>Makale yükleniyor...</span>
    </div>
  `;
}

function ebArticleDetailNotFoundTemplate() {
  return `
    <div class="container article-detail-state article-detail-state--empty">
      <strong>Makale bulunamadı</strong>
      <span>Aradığınız makale yayından kaldırılmış veya bağlantı değişmiş olabilir.</span>
      <a href="#/makaleler">Makalelere Dön →</a>
    </div>
  `;
}

function ebArticleDetailErrorTemplate() {
  return `
    <div class="container article-detail-state article-detail-state--empty">
      <strong>Makale yüklenemedi</strong>
      <span>Bir bağlantı veya izin sorunu oluşmuş olabilir.</span>
      <a href="#/makaleler">Makalelere Dön →</a>
    </div>
  `;
}
