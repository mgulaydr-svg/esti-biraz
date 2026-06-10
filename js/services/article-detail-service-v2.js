/* ESTİ BİRAZ — Article Detail Service v2 */

async function ebGetArticleBySlug(slug) {
  if (!slug) return null;

  const snapshot = await db.collection('articles')
    .where('status', '==', 'published')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
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
        .filter(article =>
          article.title &&
          article.slug !== currentArticle.slug
        );
    }
  } catch (error) {
    console.warn('İlgili makaleler kategori sorgusu başarısız:', error);
  }

  if (articles.length < limit && typeof ebGetPublishedArticles === 'function') {
    try {
      const fallback = await ebGetPublishedArticles(12);

      const fallbackFiltered = fallback.filter(article =>
        article.title &&
        article.slug !== currentArticle.slug &&
        !articles.some(existing => existing.id === article.id)
      );

      articles = articles.concat(fallbackFiltered);
    } catch (error) {
      console.warn('İlgili makaleler genel sorgusu başarısız:', error);
    }
  }

  return articles.slice(0, limit);
}
