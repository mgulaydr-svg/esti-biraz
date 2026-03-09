/* ============================================
   ESTİ BİRAZ — Makale Detay Sayfası (article-detail.js)
   ============================================ */

// ══════════════════════════════════════════════
//  OKUMA SÜRESİ HESAPLAMA
// ══════════════════════════════════════════════

/**
 * HTML içeriğinden okuma süresini hesaplar
 * @param {string} htmlContent - Makale HTML içeriği
 * @returns {number} Dakika cinsinden okuma süresi
 */
function calculateReadingTime(htmlContent) {
  if (!htmlContent) return 1;

  // HTML etiketlerini temizle
  const temp = document.createElement('div');
  temp.innerHTML = htmlContent;
  const text = temp.textContent || temp.innerText || '';

  // Kelime sayısını hesapla
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Ortalama okuma hızı: 200 kelime/dakika (Türkçe için uygun)
  const readingTime = Math.ceil(wordCount / 200);

  return Math.max(1, readingTime); // Minimum 1 dakika
}

/**
 * Okuma süresi badge'ini oluşturur
 * @param {number} minutes - Dakika
 * @returns {string} HTML string
 */
function createReadingTimeBadge(minutes) {
  return `<span class="reading-time">⏱️ ${minutes} dk okuma</span>`;
}

// ══════════════════════════════════════════════
//  SOSYAL PAYLAŞIM BUTONLARI
// ══════════════════════════════════════════════

/**
 * Sosyal paylaşım butonlarını oluşturur
 * @param {string} title - Makale başlığı
 * @param {string} url - Makale URL'si
 * @returns {string} HTML string
 */
function createShareButtons(title, url) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return `
    <div class="share-buttons">
      <span class="share-buttons__label">Paylaş:</span>

      <a href="https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}"
         target="_blank" rel="noopener noreferrer"
         class="share-btn share-btn--twitter" title="X'te Paylaş">
        𝕏
      </a>

      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}"
         target="_blank" rel="noopener noreferrer"
         class="share-btn share-btn--linkedin" title="LinkedIn'de Paylaş">
        in
      </a>

      <a href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}"
         target="_blank" rel="noopener noreferrer"
         class="share-btn share-btn--whatsapp" title="WhatsApp'ta Paylaş">
        💬
      </a>

      <button class="share-btn share-btn--copy" title="Linki Kopyala"
              onclick="copyArticleLink('${url}')">
        🔗
      </button>
    </div>
  `;
}

/**
 * Makale linkini panoya kopyalar
 * @param {string} url - Kopyalanacak URL
 */
async function copyArticleLink(url) {
  try {
    await navigator.clipboard.writeText(url);

    // Kopyalandı geri bildirimi
    const btn = document.querySelector('.share-btn--copy');
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = '✅';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove('copied');
      }, 2000);
    }

    console.log('📋 Link kopyalandı:', url);
  } catch (error) {
    // Fallback: eski yöntem
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    console.log('📋 Link kopyalandı (fallback):', url);
  }
}

// ══════════════════════════════════════════════
//  İLGİLİ MAKALELER
// ══════════════════════════════════════════════

/**
 * Aynı kategoriden ilgili makaleleri getirir
 * @param {string} currentSlug - Mevcut makalenin slug'ı
 * @param {string} category - Makale kategorisi
 * @param {number} limit - Gösterilecek makale sayısı
 * @returns {Promise<Array>} İlgili makaleler
 */
async function getRelatedArticles(currentSlug, category, limit = 3) {
  try {
    const { collection, query, where, orderBy, limit: fbLimit, getDocs } = await import('https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js');
    const db = window.estiFirestore;
    if (!db) return [];

    // Aynı kategoriden, yayınlanmış makaleleri getir
    let q;
    if (category && category !== 'genel') {
      q = query(
        collection(db, 'articles'),
        where('status', '==', 'published'),
        where('category', '==', category),
        orderBy('publishedAt', 'desc'),
        fbLimit(limit + 1) // +1 çünkü mevcut makaleyi filtreleyeceğiz
      );
    } else {
      q = query(
        collection(db, 'articles'),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        fbLimit(limit + 1)
      );
    }

    const snapshot = await getDocs(q);
    const articles = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.slug !== currentSlug) {
        articles.push({ id: doc.id, ...data });
      }
    });

    return articles.slice(0, limit);
  } catch (error) {
    console.error('İlgili makaleler yüklenemedi:', error);
    return [];
  }
}

/**
 * İlgili makaleler bölümünün HTML'ini oluşturur
 * @param {Array} articles - İlgili makale listesi
 * @returns {string} HTML string
 */
function createRelatedArticlesHTML(articles) {
  if (!articles || articles.length === 0) return '';

  const cards = articles.map(article => {
    const coverImage = article.coverImage
      ? `<img src="${article.coverImage}" alt="${article.title}" class="related-card__image">`
      : `<div class="related-card__image related-card__image--placeholder">📰</div>`;

    const date = article.publishedAt
      ? new Date(article.publishedAt.seconds * 1000).toLocaleDateString('tr-TR', {
          day: 'numeric', month: 'long', year: 'numeric'
        })
      : '';

    return `
      <a href="/#/makale/${article.slug}" class="related-card">
        ${coverImage}
        <div class="related-card__body">
          <h4 class="related-card__title">${article.title}</h4>
          ${date ? `<span class="related-card__date">${date}</span>` : ''}
        </div>
      </a>
    `;
  }).join('');

  return `
    <section class="related-articles">
      <h3 class="related-articles__title">📚 İlgili Makaleler</h3>
      <div class="related-articles__grid">
        ${cards}
      </div>
    </section>
  `;
}

/**
 * İlgili makaleleri asenkron olarak yükler
 */
async function loadRelatedArticles(currentSlug, category) {
  const container = document.getElementById('relatedArticles');
  if (!container) return;

  const related = await getRelatedArticles(currentSlug, category, 3);
  container.innerHTML = createRelatedArticlesHTML(related);
}