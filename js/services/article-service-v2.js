/* ESTİ BİRAZ — Article Service v2
   Ana sayfa ve Makaleler sayfası için ortak servis.
*/

async function ebGetLatestArticles(limit = 3) {
  const articles = await ebGetPublishedArticles(limit);
  return articles.slice(0, limit);
}

async function ebGetPublishedArticles(limit = 40) {
  const snapshot = await db.collection('articles')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(article => article && article.title);
}

function ebFilterArticlesByCategory(articles, category = 'tum') {
  if (!category || category === 'tum') return articles;
  return articles.filter(article => article.category === category);
}

function ebGetArticleCategoriesForFilter() {
  return [
    { key: 'tum', label: 'Tümü' },
    { key: 'saglik', label: 'Sağlık' },
    { key: 'egitim', label: 'Eğitim' },
    { key: 'bilim', label: 'Bilim' },
    { key: 'veri', label: 'Veri' },
    { key: 'teknoloji', label: 'Teknoloji' },
    { key: 'kultur', label: 'Kültür' },
    { key: 'yasam', label: 'Yaşam' }
  ];
}
