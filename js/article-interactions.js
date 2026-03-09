/* ============================================
   ESTİ BİRAZ — Makale Etkileşimleri (article-interactions.js)
   ============================================ */

// ══════════════════════════════════════════════
//  ZİYARETÇİ KİMLİĞİ (Anonim)
// ══════════════════════════════════════════════

/**
 * Tarayıcıya özgü anonim ziyaretçi ID'si oluşturur/getirir
 * @returns {string} Ziyaretçi ID
 */
function getVisitorId() {
  let id = localStorage.getItem('esti_visitor_id');
  if (!id) {
    id = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('esti_visitor_id', id);
  }
  return id;
}

// ══════════════════════════════════════════════
//  GÖRÜNTÜLENME SAYACI
// ══════════════════════════════════════════════

/**
 * Makale görüntülenme sayısını artırır
 * @param {string} slug - Makale slug'ı
 */
async function incrementViewCount(slug) {
  try {
    const statsRef = db.collection('articleStats').doc(slug);
    const doc = await statsRef.get();

    if (doc.exists) {
      await statsRef.update({
        views: firebase.firestore.FieldValue.increment(1)
      });
    } else {
      await statsRef.set({ views: 1, likes: 0 });
    }
  } catch (error) {
    console.error('Görüntülenme sayacı hatası:', error);
  }
}

/**
 * Makale istatistiklerini getirir
 * @param {string} slug - Makale slug'ı
 * @returns {Promise<{views: number, likes: number}>}
 */
async function getArticleStats(slug) {
  try {
    const doc = await db.collection('articleStats').doc(slug).get();
    if (doc.exists) {
      return doc.data();
    }
    return { views: 0, likes: 0 };
  } catch (error) {
    console.error('İstatistik yükleme hatası:', error);
    return { views: 0, likes: 0 };
  }
}

// ══════════════════════════════════════════════
//  BEĞENİ (KALP) SİSTEMİ
// ══════════════════════════════════════════════

/**
 * Kullanıcının bu makaleyi beğenip beğenmediğini kontrol eder
 * @param {string} slug - Makale slug'ı
 * @returns {Promise<boolean>}
 */
async function hasUserLiked(slug) {
  try {
    const visitorId = getVisitorId();
    const likeId = slug + '_' + visitorId;
    const doc = await db.collection('likes').doc(likeId).get();
    return doc.exists;
  } catch (error) {
    return false;
  }
}

/**
 * Makaleyi beğenir veya beğeniyi geri alır
 * @param {string} slug - Makale slug'ı
 */
async function toggleLike(slug) {
  const visitorId = getVisitorId();
  const likeId = slug + '_' + visitorId;
  const likeRef = db.collection('likes').doc(likeId);
  const statsRef = db.collection('articleStats').doc(slug);

  const likeBtn = document.getElementById('likeBtn');
  const likeCount = document.getElementById('likeCount');
  if (!likeBtn) return;

  try {
    const likeDoc = await likeRef.get();

    if (likeDoc.exists) {
      // Beğeniyi geri al
      await likeRef.delete();
      await statsRef.update({
        likes: firebase.firestore.FieldValue.increment(-1)
      });
      likeBtn.classList.remove('liked');
      likeBtn.innerHTML = '🤍';
      if (likeCount) {
        const current = parseInt(likeCount.textContent) || 0;
        likeCount.textContent = Math.max(0, current - 1);
      }
      console.log('💔 Beğeni geri alındı.');
    } else {
      // Beğen
      await likeRef.set({
        articleSlug: slug,
        visitorId: visitorId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Stats güncelle
      const statsDoc = await statsRef.get();
      if (statsDoc.exists) {
        await statsRef.update({
          likes: firebase.firestore.FieldValue.increment(1)
        });
      } else {
        await statsRef.set({ views: 0, likes: 1 });
      }

      likeBtn.classList.add('liked');
      likeBtn.innerHTML = '❤️';
      if (likeCount) {
        const current = parseInt(likeCount.textContent) || 0;
        likeCount.textContent = current + 1;
      }
      console.log('❤️ Makale beğenildi.');
    }
  } catch (error) {
    console.error('Beğeni hatası:', error);
  }
}

/**
 * Beğeni butonunu oluşturur
 * @param {string} slug - Makale slug'ı
 * @param {number} likeCountNum - Mevcut beğeni sayısı
 * @param {boolean} isLiked - Kullanıcı beğenmiş mi
 * @returns {string} HTML string
 */
function createLikeButton(slug, likeCountNum, isLiked) {
  return `
    <div class="like-section">
      <button class="like-btn ${isLiked ? 'liked' : ''}" id="likeBtn"
              onclick="toggleLike('${slug}')">
        ${isLiked ? '❤️' : '🤍'}
      </button>
      <span class="like-count" id="likeCount">${likeCountNum}</span>
    </div>
  `;
}

// ══════════════════════════════════════════════
//  YORUM SİSTEMİ
// ══════════════════════════════════════════════

/**
 * Yorum formunu oluşturur
 * @param {string} slug - Makale slug'ı
 * @returns {string} HTML string
 */
function createCommentForm(slug) {
  return `
    <section class="comments-section" id="commentsSection">
      <h3 class="comments-section__title">💬 Yorumlar</h3>

      <form class="comment-form" id="commentForm" onsubmit="submitComment(event, '${slug}')">
        <div class="comment-form__row">
          <input type="text" id="commentAuthor" class="comment-form__input"
                 placeholder="Adınız *" required maxlength="50">
          <input type="email" id="commentEmail" class="comment-form__input"
                 placeholder="E-posta (opsiyonel)" maxlength="100">
        </div>
        <textarea id="commentContent" class="comment-form__textarea"
                  placeholder="Yorumunuzu yazın... *" required
                  maxlength="1000" rows="4"></textarea>
        <div class="comment-form__footer">
          <span class="comment-form__hint">Maks. 1000 karakter</span>
          <button type="submit" class="btn btn--primary btn--sm" id="commentSubmitBtn">
            📤 Yorum Gönder
          </button>
        </div>
      </form>

      <div class="comments-list" id="commentsList">
        <div class="comments-loading">Yorumlar yükleniyor...</div>
      </div>
    </section>
  `;
}

/**
 * Yorum gönderir
 * @param {Event} event - Form submit event
 * @param {string} slug - Makale slug'ı
 */
async function submitComment(event, slug) {
  event.preventDefault();

  const authorInput = document.getElementById('commentAuthor');
  const emailInput = document.getElementById('commentEmail');
  const contentInput = document.getElementById('commentContent');
  const submitBtn = document.getElementById('commentSubmitBtn');

  const author = authorInput.value.trim();
  const email = emailInput.value.trim();
  const content = contentInput.value.trim();

  if (!author || !content) {
    alert('Ad ve yorum alanları zorunludur.');
    return;
  }

  // Butonu devre dışı bırak
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Gönderiliyor...';

  try {
    await db.collection('comments').add({
      articleSlug: slug,
      authorName: author,
      authorEmail: email || null,
      content: content,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      approved: true // Otomatik onay (ileride moderasyon eklenebilir)
    });

    // Formu temizle
    authorInput.value = '';
    emailInput.value = '';
    contentInput.value = '';

    console.log('💬 Yorum gönderildi.');

    // Yorumları yenile
    await loadComments(slug);

  } catch (error) {
    console.error('❌ Yorum gönderilemedi:', error);
    alert('Yorum gönderilemedi: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '📤 Yorum Gönder';
  }
}

/**
 * Makale yorumlarını yükler
 * @param {string} slug - Makale slug'ı
 */
async function loadComments(slug) {
  const container = document.getElementById('commentsList');
  if (!container) return;

  try {
    const snapshot = await db.collection('comments')
      .where('articleSlug', '==', slug)
      .where('approved', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="comments-empty">Henüz yorum yok. İlk yorumu siz yazın! ✍️</p>';
      return;
    }

    container.innerHTML = snapshot.docs.map(doc => {
      const c = doc.data();
      const date = c.createdAt?.toDate
        ? c.createdAt.toDate().toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        : 'Az önce';

      // İsmin baş harfini avatar olarak kullan
      const initial = c.authorName.charAt(0).toUpperCase();

      return `
        <div class="comment">
          <div class="comment__avatar">${initial}</div>
          <div class="comment__body">
            <div class="comment__header">
              <strong class="comment__author">${escapeHTMLSafe(c.authorName)}</strong>
              <span class="comment__date">${date}</span>
            </div>
            <p class="comment__content">${escapeHTMLSafe(c.content)}</p>
          </div>
        </div>
      `;
    }).join('');

    console.log(`💬 ${snapshot.size} yorum yüklendi.`);
  } catch (error) {
    console.error('❌ Yorumlar yüklenemedi:', error);
    container.innerHTML = '<p class="comments-empty">Yorumlar yüklenirken hata oluştu.</p>';
  }
}

/**
 * HTML karakterlerini güvenli şekilde escape eder
 * @param {string} str
 * @returns {string}
 */
function escapeHTMLSafe(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}