/* ============================================
   ESTİ BİRAZ — Yeni Tasarım Makale Etkileşimleri
   ============================================ */

function getVisitorId() {
  let id = localStorage.getItem('esti_visitor_id');
  if (!id) {
    id = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('esti_visitor_id', id);
  }
  return id;
}

async function incrementViewCount(slug) {
  try {
    const statsRef = db.collection('articleStats').doc(slug);
    const doc = await statsRef.get();
    if (doc.exists) {
      await statsRef.update({ views: firebase.firestore.FieldValue.increment(1) });
    } else {
      await statsRef.set({ views: 1, likes: 0 });
    }
  } catch (error) {
    console.error('Görüntülenme sayacı hatası:', error);
  }
}

async function getArticleStats(slug) {
  try {
    const doc = await db.collection('articleStats').doc(slug).get();
    return doc.exists ? doc.data() : { views: 0, likes: 0 };
  } catch (error) {
    return { views: 0, likes: 0 };
  }
}

async function hasUserLiked(slug) {
  try {
    const doc = await db.collection('likes').doc(slug + '_' + getVisitorId()).get();
    return doc.exists;
  } catch (error) {
    return false;
  }
}

async function toggleLike(slug) {
  const visitorId = getVisitorId();
  const likeRef = db.collection('likes').doc(slug + '_' + visitorId);
  const statsRef = db.collection('articleStats').doc(slug);
  const likeBtn = document.getElementById('likeBtn');
  const likeCount = document.getElementById('likeCount');

  if (!likeBtn) return;

  try {
    const likeDoc = await likeRef.get();
    if (likeDoc.exists) {
      await likeRef.delete();
      await statsRef.update({ likes: firebase.firestore.FieldValue.increment(-1) });
      likeBtn.style.color = '';
      likeBtn.style.borderColor = '';
      likeBtn.innerHTML = '🤍 Beğen';
      if (likeCount) likeCount.textContent = Math.max(0, (parseInt(likeCount.textContent) || 0) - 1);
    } else {
      await likeRef.set({ articleSlug: slug, visitorId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      const statsDoc = await statsRef.get();
      if (statsDoc.exists) {
        await statsRef.update({ likes: firebase.firestore.FieldValue.increment(1) });
      } else {
        await statsRef.set({ views: 0, likes: 1 });
      }
      likeBtn.style.color = 'var(--brand-red)';
      likeBtn.style.borderColor = 'var(--brand-red)';
      likeBtn.innerHTML = '❤️ Beğenildi';
      if (likeCount) likeCount.textContent = (parseInt(likeCount.textContent) || 0) + 1;
    }
  } catch (error) {
    console.error('Beğeni hatası:', error);
  }
}

function createLikeButton(slug, likeCountNum, isLiked) {
  const activeStyle = isLiked ? 'color: var(--brand-red); border-color: var(--brand-red);' : '';
  return `
    <div style="display: inline-flex; align-items: center; gap: 12px;">
      <button class="ghost-button" id="likeBtn" onclick="toggleLike('${slug}')" style="${activeStyle}">
        ${isLiked ? '❤️ Beğenildi' : '🤍 Beğen'}
      </button>
      <span style="font-weight: 800; color: var(--muted);"><span id="likeCount">${likeCountNum}</span> Beğeni</span>
    </div>
  `;
}

function createCommentForm(slug) {
  return `
    <div class="admin-panel" style="margin-top: 40px; padding: 32px 24px; background: var(--paper-soft);">
      <h3 style="font-family: var(--serif); margin-top: 0;">💬 Yorumlar</h3>
      <form class="admin-form" id="commentForm" onsubmit="submitComment(event, '${slug}')">
        <div class="admin-form-grid">
          <label>Adınız *
            <input type="text" id="commentAuthor" placeholder="Örn: Ayşe Y." required maxlength="50">
          </label>
          <label>E-posta (Gizli kalır)
            <input type="email" id="commentEmail" placeholder="İsteğe bağlı" maxlength="100">
          </label>
        </div>
        <label>Yorumunuz *
          <textarea id="commentContent" placeholder="Düşüncelerinizi paylaşın..." required maxlength="1000" rows="3"></textarea>
        </label>
        <div class="admin-inline-actions" style="margin-top: 12px;">
          <span class="form-note">Maks. 1000 karakter</span>
          <button type="submit" class="primary-button" id="commentSubmitBtn">Gönder</button>
        </div>
      </form>

      <div id="commentsList" style="margin-top: 40px; display: grid; gap: 24px;">
        <p style="color: var(--muted);">Yorumlar yükleniyor...</p>
      </div>
    </div>
  `;
}

async function submitComment(event, slug) {
  event.preventDefault();
  const authorInput = document.getElementById('commentAuthor');
  const emailInput = document.getElementById('commentEmail');
  const contentInput = document.getElementById('commentContent');
  const submitBtn = document.getElementById('commentSubmitBtn');

  if (!authorInput.value.trim() || !contentInput.value.trim()) return alert('Ad ve yorum zorunludur.');

  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Gönderiliyor...';

  try {
    await db.collection('comments').add({
      articleSlug: slug,
      authorName: authorInput.value.trim(),
      authorEmail: emailInput.value.trim() || null,
      content: contentInput.value.trim(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      approved: true
    });

    authorInput.value = ''; emailInput.value = ''; contentInput.value = '';
    await loadComments(slug);
  } catch (error) {
    alert('Yorum gönderilemedi: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Gönder';
  }
}

async function loadComments(slug) {
  const container = document.getElementById('commentsList');
  if (!container) return;

  try {
    const snapshot = await db.collection('comments').where('articleSlug', '==', slug).where('approved', '==', true).orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      container.innerHTML = '<p style="color: var(--muted); margin: 0;">İlk yorumu siz yazın!</p>';
      return;
    }

    container.innerHTML = snapshot.docs.map(doc => {
      const c = doc.data();
      const date = c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Az önce';
      const initial = c.authorName.charAt(0).toUpperCase();

      return `
        <div style="display: flex; gap: 16px; padding-bottom: 24px; border-bottom: 1px solid var(--line);">
          <div style="width: 46px; height: 46px; border-radius: 50%; background: #fff; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--brand-teal); flex-shrink: 0; font-size: 1.2rem;">
            ${initial}
          </div>
          <div>
            <div style="margin-bottom: 6px;">
              <strong style="color: var(--ink); font-size: 1.05rem;">${escapeHTMLSafe(c.authorName)}</strong>
              <span style="color: var(--muted); font-size: 0.85rem; margin-left: 8px;">${date}</span>
            </div>
            <p style="margin: 0; color: var(--ink); line-height: 1.6;">${escapeHTMLSafe(c.content)}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    container.innerHTML = '<p style="color: var(--brand-red);">Yorumlar yüklenirken hata oluştu.</p>';
  }
}

function escapeHTMLSafe(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}