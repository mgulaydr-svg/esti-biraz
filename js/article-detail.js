/* ============================================
   ESTİ BİRAZ — Yeni Tasarım Makale Detay ve Araçları
   ============================================ */

function calculateReadingTime(htmlContent) {
  if (!htmlContent) return 1;
  const text = document.createElement('div');
  text.innerHTML = htmlContent;
  const wordCount = (text.textContent || text.innerText || '').trim().split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function createReadingTimeBadge(minutes) {
  return `<span>⏱️ ${minutes} dk okuma</span>`;
}

function createShareButtons(title, url) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return `
    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--line);">
      <span style="font-weight: 800; color: var(--muted); margin-right: 8px;">Paylaş:</span>
      <a href="https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}" target="_blank" class="ghost-button" style="padding: 6px 12px;">𝕏</a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" class="ghost-button" style="padding: 6px 12px;">in</a>
      <a href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}" target="_blank" class="ghost-button" style="padding: 6px 12px;">💬</a>
      <button class="ghost-button" id="copyLinkBtn" onclick="copyArticleLink('${url}')" style="padding: 6px 12px;">🔗 Kopyala</button>
    </div>
  `;
}

async function copyArticleLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    const btn = document.getElementById('copyLinkBtn');
    if (btn) {
      btn.innerHTML = '✅ Kopyalandı';
      setTimeout(() => btn.innerHTML = '🔗 Kopyala', 2000);
    }
  } catch (error) {
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }
}

async function loadRelatedArticles(currentSlug, category) {
  const container = document.getElementById('relatedArticles');
  if (!container) return;

  try {
    let query = db.collection('articles').where('status', '==', 'published');
    if (category && category !== 'genel') {
      query = query.where('category', '==', category);
    }
    
    const snapshot = await query.orderBy('publishedAt', 'desc').limit(4).get();
    const articles = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.slug !== currentSlug) articles.push({ id: doc.id, ...data });
    });

    const related = articles.slice(0, 3);
    
    if (related.length === 0) {
      container.innerHTML = '';
      return;
    }

    const cardsHtml = related.map(article => {
      const date = article.publishedAt ? article.publishedAt.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      return `
        <div class="article-card" onclick="window.location.hash='#/makale/${article.slug}'" style="cursor: pointer; grid-column: span 4;">
          <span class="article-card__category">${article.category || 'Genel'}</span>
          <h3 style="font-size: 1.4rem;">${article.title}</h3>
          <div class="article-card__meta">
            <span>📅 ${date}</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="margin-top: 60px; padding-top: 32px; border-top: 3px solid var(--ink);">
        <h3 style="font-family: var(--serif); font-size: 2rem; margin-top: 0; margin-bottom: 24px;">📚 İlgili Makaleler</h3>
        <div class="article-layout">
          ${cardsHtml}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('İlgili makaleler yüklenemedi:', error);
  }
}