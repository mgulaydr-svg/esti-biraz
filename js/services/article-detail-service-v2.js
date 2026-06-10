/* ESTİ BİRAZ — Article Detail Service v2 */

async function ebGetArticleBySlug(slug) {
  if (!slug) return null;

  const snapshot = await db.collection('articles')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const article = { id: doc.id, ...doc.data() };

  if (article.status && article.status !== 'published') {
    return null;
  }

  return article;
}

async function ebGetRelatedArticles(currentArticle, limit = 3) {
  if (!currentArticle) return [];

  let articles = [];

  try {
    if (currentArticle.category) {
      const snapshot = await db.collection('articles')
        .where('status', '==', 'published')
        .where('category', '==', currentArticle.category)
        .limit(8)
        .get();

      articles = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(article => article.slug !== currentArticle.slug && article.title);
    }
  } catch (error) {
    console.warn('İlgili makaleler kategori sorgusu başarısız, genel listeye düşülüyor:', error);
  }

  if (articles.length < limit && typeof ebGetPublishedArticles === 'function') {
    const fallback = await ebGetPublishedArticles(12);
    const fallbackFiltered = fallback.filter(article =>
      article.slug !== currentArticle.slug &&
      !articles.some(existing => existing.id === article.id)
    );

    articles = articles.concat(fallbackFiltered);
  }

  return articles.slice(0, limit);
}
