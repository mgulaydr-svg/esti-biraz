/* ============================================
   ESTİ BİRAZ — Makale Kaydetme (article-submit.js)
   ============================================ */

/**
 * Form submit olaylarını başlatır
 */
function setupArticleForm() {
  const form = document.getElementById('articleForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitArticle');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Kaydediliyor...';
    submitBtn.disabled = true;

    try {
      // Form verilerini topla
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

      // Validasyon
      if (!articleData.title || !articleData.slug || !articleData.category ||
          !articleData.summary || !articleData.author) {
        throw new Error('Lütfen tüm zorunlu alanları doldurun.');
      }

      if (!articleData.content || articleData.content === '<br>') {
        throw new Error('Makale içeriği boş olamaz.');
      }

      // Düzenleme mi yoksa yeni makale mi?
      const articleId = form.dataset.articleId;

      if (articleId) {
        // Mevcut makaleyi güncelle
        await db.collection('articles').doc(articleId).update({
          ...articleData,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Makale güncellendi:', articleId);
        alert('Makale başarıyla güncellendi!');
      } else {
        // Yeni makale oluştur
        const docRef = await db.collection('articles').add({
          ...articleData,
          publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Yeni makale oluşturuldu:', docRef.id);
        alert('Makale başarıyla yayınlandı!');
      }

      // Admin paneline yönlendir
      window.location.hash = '#/admin';

    } catch (error) {
      console.error('❌ Makale kaydedilemedi:', error);
      alert('Hata: ' + error.message);
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}