/* ============================================
   ESTİ BİRAZ — Yeni Tasarım Makale Kaydetme
   ============================================ */

function setupArticleForm() {
  const form = document.getElementById('articleForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitArticle');
    if (!submitBtn) return;
    
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Kaydediliyor...';
    submitBtn.disabled = true;

    try {
      const articleData = {
        title: document.getElementById('articleTitle').value.trim(),
        slug: document.getElementById('articleSlug').value.trim(),
        category: document.getElementById('articleCategory').value,
        summary: document.getElementById('articleSummary').value.trim(),
        author: document.getElementById('articleAuthor').value.trim(),
        coverImage: document.getElementById('articleCoverImage').value.trim(),
        content: document.getElementById('articleContent').innerHTML,
        featured: document.getElementById('articleFeatured').checked,
      };

      if (!articleData.title || !articleData.slug || !articleData.category || !articleData.summary || !articleData.author) {
        throw new Error('Lütfen tüm zorunlu alanları doldurun.');
      }
      if (!articleData.content || articleData.content === '<br>') {
        throw new Error('Makale içeriği boş olamaz.');
      }

      const articleId = form.dataset.articleId;

      if (articleId) {
        await db.collection('articles').doc(articleId).update({
          ...articleData,
          status: 'published',
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else {
        await db.collection('articles').add({
          ...articleData,
          status: 'published',
          publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      window.location.hash = '#/admin';

    } catch (error) {
      alert('Hata: ' + error.message);
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}