/* ESTİ BİRAZ — Article Card v2 */

function ebCreateArticleCard(article, options = {}) {
  const { featured = false } = options;

  const title = ebEscapeHtml(article.title || 'Başlıksız Makale');
  const summary = ebEscapeHtml(article.summary || '');
  const author = ebEscapeHtml(article.author || 'Esti Biraz');
  const slug = ebEscapeHtml(article.slug || article.id || '');
  const category = ebEscapeHtml(article.category || 'diger');
  const categoryLabel = ebEscapeHtml(ebGetCategoryLabel(article.category));
  const date = ebFormatDate(article);
  const readingTime = ebCalculateReadingTime(article.content || article.summary || '');

  const imageHtml = article.coverImage
    ? `<img src="${ebEscapeHtml(article.coverImage)}" alt="${title}" loading="lazy">`
    : `<div class="article-card__placeholder">📝</div>`;

  return `
    <a href="#/makale/${slug}" class="article-card ${featured ? 'article-card--featured' : ''}">
      <div class="article-card__image">
        ${imageHtml}
      </div>

      <div class="article-card__body">
        <div class="article-card__top">
          <span class="badge badge--${category}">${categoryLabel}</span>
          <span class="article-card__reading">${readingTime} dk okuma</span>
        </div>

        <h3 class="article-card__title">${title}</h3>

        ${summary ? `<p class="article-card__summary">${summary}</p>` : ''}

        <div class="article-card__meta">
          <span>✍️ ${author}</span>
          ${date ? `<span>📅 ${date}</span>` : ''}
        </div>

        <div class="article-card__read">Devamını Oku →</div>
      </div>
    </a>
  `;
}
