/* ESTİ BİRAZ — Article Service v2 */

async function ebGetLatestArticles(limit = 3) {
  const snapshot = await db.collection('articles')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(article => article && article.title);
}
