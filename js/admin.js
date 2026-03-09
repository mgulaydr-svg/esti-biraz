/* ============================================
   ESTİ BİRAZ — Admin Fonksiyonları (admin.js)
   ============================================ */

// ══════════════════════════════════════════════
//  ADMIN MAKALE LİSTESİ
// ══════════════════════════════════════════════

/**
 * Admin panelindeki makale listesini yükler
 */
async function loadAdminArticles() {
  const container = document.getElementById('adminArticleList');
  if (!container) return;

  try {
    const snapshot = await db.collection('articles')
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="empty-state">Henüz makale yok.</p>';
      return;
    }

    container.innerHTML = snapshot.docs.map(doc => {
      const d = doc.data();
      const date = d.createdAt?.toDate
        ? d.createdAt.toDate().toLocaleDateString('tr-TR')
        : '';
      return `
        <div class="admin-list-item">
          <div class="admin-list-item__info">
            <strong>${d.title}</strong>
            <span class="admin-list-item__meta">${getCategoryLabel(d.category)} · ${date}</span>
          </div>
          <div class="admin-list-item__actions">
            <a href="#/admin/makale-duzenle/${doc.id}" class="btn btn--sm btn--outline">✏️ Düzenle</a>
            <button class="btn btn--sm btn--danger" onclick="deleteArticle('${doc.id}')">🗑️ Sil</button>
          </div>
        </div>
      `;
    }).join('');

    console.log(`📰 Admin: ${snapshot.size} makale listelendi.`);
  } catch (error) {
    console.error('❌ Admin makale listesi yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Yüklenirken hata oluştu.</p>';
  }
}

/**
 * Admin panelindeki kurs listesini yükler
 */
async function loadAdminCourses() {
  const container = document.getElementById('adminCourseList');
  if (!container) return;

  try {
    const snapshot = await db.collection('courses')
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="empty-state">Henüz kurs yok.</p>';
      return;
    }

    container.innerHTML = snapshot.docs.map(doc => {
      const d = doc.data();
      return `
        <div class="admin-list-item">
          <div class="admin-list-item__info">
            <strong>${d.title}</strong>
            <span class="admin-list-item__meta">${d.level ? getLevelLabel(d.level) : ''}</span>
          </div>
          <div class="admin-list-item__actions">
            <button class="btn btn--sm btn--outline" onclick="alert('Kurs düzenleme Faz 2\'de!')">✏️</button>
          </div>
        </div>
      `;
    }).join('');

    console.log(`🎓 Admin: ${snapshot.size} kurs listelendi.`);
  } catch (error) {
    console.error('❌ Admin kurs listesi yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Yüklenirken hata oluştu.</p>';
  }
}

// ══════════════════════════════════════════════
//  MAKALE SİLME
// ══════════════════════════════════════════════

/**
 * Makaleyi Firestore'dan siler
 * @param {string} articleId - Silinecek makale ID'si
 */
async function deleteArticle(articleId) {
  if (!confirm('Bu makaleyi silmek istediğinize emin misiniz?')) return;

  try {
    await db.collection('articles').doc(articleId).delete();
    console.log('🗑️ Makale silindi:', articleId);
    alert('Makale başarıyla silindi!');
    // Listeyi yenile
    loadAdminArticles();
  } catch (error) {
    console.error('❌ Makale silinemedi:', error);
    alert('Silme işlemi başarısız: ' + error.message);
  }
}

// ══════════════════════════════════════════════
//  MAKALE EKLEME / DÜZENLEME FORMU
// ══════════════════════════════════════════════

/**
 * Makale ekleme sayfasını render eder
 */
async function renderMakaleEkle() {
  const admin = await isAdminUser();
  if (!admin) {
    appContainer.innerHTML = `
      <section class="section">
        <div class="container text-center">
          <div class="error-page">
            <span class="error-page__icon">🔒</span>
            <h1 class="error-page__title">Yetkisiz Erişim</h1>
            <a href="#/" class="btn btn--primary">Ana Sayfaya Dön</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  appContainer.innerHTML = `
    <section class="section">
      <div class="container container--narrow">
        <a href="#/admin" class="back-link">← Admin Panel'e Dön</a>
        <h1 class="page-header__title">📝 Yeni Makale Oluştur</h1>

        <form id="articleForm" class="admin-form">
          <!-- Başlık -->
          <div class="form-group">
            <label for="articleTitle" class="form-label">Makale Başlığı *</label>
            <input type="text" id="articleTitle" class="form-input" placeholder="Örn: Sağlıklı Beslenme Rehberi" required>
          </div>

          <!-- Slug -->
          <div class="form-group">
            <label for="articleSlug" class="form-label">URL Slug *</label>
            <input type="text" id="articleSlug" class="form-input" placeholder="saglikli-beslenme-rehberi" required>
            <span class="form-hint">Otomatik oluşturulur, istersen düzenleyebilirsin.</span>
          </div>

          <!-- Kategori + Öne Çıkan -->
          <div class="form-row">
            <div class="form-group">
              <label for="articleCategory" class="form-label">Kategori *</label>
              <select id="articleCategory" class="form-select" required>
                <option value="">Seçiniz</option>
                <option value="saglik">🏥 Sağlık</option>
                <option value="bilim">🔬 Bilim</option>
                <option value="egitim">📖 Eğitim</option>
                <option value="teknoloji">💻 Teknoloji</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Öne Çıkan</label>
              <label class="form-checkbox">
                <input type="checkbox" id="articleFeatured">
                <span>Ana sayfada göster</span>
              </label>
            </div>
          </div>

          <!-- Özet -->
          <div class="form-group">
            <label for="articleSummary" class="form-label">Kısa Özet *</label>
            <textarea id="articleSummary" class="form-textarea" rows="3" 
              placeholder="Kart üzerinde görünecek kısa açıklama..." required></textarea>
          </div>

          <!-- Yazar -->
          <div class="form-group">
            <label for="articleAuthor" class="form-label">Yazar *</label>
            <input type="text" id="articleAuthor" class="form-input" placeholder="Dr. Ayşe Yılmaz" required>
          </div>

          <!-- Kapak Görseli -->
          <div class="form-group">
            <label class="form-label">Kapak Görseli</label>
            <div class="image-upload" id="imageUploadArea">
              <div class="image-upload__preview" id="imagePreview">
                <span class="image-upload__placeholder">📷 Görsel yüklemek için tıklayın veya URL girin</span>
              </div>
              <div class="image-upload__controls">
                <input type="text" id="articleCoverImage" class="form-input" placeholder="Görsel URL'si yapıştırın...">
                <button type="button" class="btn btn--outline btn--sm" onclick="previewCoverImage()">Önizle</button>
              </div>
            </div>
          </div>

          <!-- Zengin Metin Editörü -->
          <div class="form-group">
            <label class="form-label">Makale İçeriği *</label>
            <div class="editor-toolbar" id="editorToolbar">
	      <button type="button" class="toolbar-btn" data-command="bold" title="Kalın"><b>B</b></button>
  	      <button type="button" class="toolbar-btn" data-command="italic" title="İtalik"><i>I</i></button>
  	      <button type="button" class="toolbar-btn" data-command="underline" title="Altı Çizili"><u>U</u></button>
  	      <button type="button" class="toolbar-btn" data-command="strikeThrough" title="Üstü Çizili"><s>S</s></button>
  	      <span class="toolbar-divider"></span>
  	      <button type="button" class="toolbar-btn" data-command="formatBlock" data-value="H2" title="Başlık 2">H2</button>
  	      <button type="button" class="toolbar-btn" data-command="formatBlock" data-value="H3" title="Başlık 3">H3</button>
  	      <button type="button" class="toolbar-btn" data-command="formatBlock" data-value="P" title="Paragraf">¶</button>
  	      <span class="toolbar-divider"></span>
  	      <button type="button" class="toolbar-btn" data-command="insertUnorderedList" title="Madde İşareti">• Liste</button>
  	      <button type="button" class="toolbar-btn" data-command="insertOrderedList" title="Numaralı Liste">1. Liste</button>
  	      <button type="button" class="toolbar-btn" data-command="insertBlockquote" title="Alıntı">❝</button>
  	      <span class="toolbar-divider"></span>
  	      <button type="button" class="toolbar-btn" data-command="createLink" title="Link Ekle">🔗</button>
  	      <button type="button" class="toolbar-btn" data-command="insertImage" title="Görsel Ekle">🖼️</button>
  	      <button type="button" class="toolbar-btn" data-command="insertTable" title="Tablo Ekle">📊</button>
  	      <button type="button" class="toolbar-btn" data-command="insertCode" title="Kod Bloğu">&lt;/&gt;</button>
  	      <button type="button" class="toolbar-btn" data-command="insertHR" title="Ayırıcı Çizgi">―</button>
 	      <span class="toolbar-divider"></span>
  	      <button type="button" class="toolbar-btn" data-command="removeFormat" title="Formatı Temizle">✖</button>
	    </div>
            <div class="editor-content" id="articleContent" contenteditable="true"
              data-placeholder="Makale içeriğinizi buraya yazın..."></div>
          </div>

          <!-- Gönder -->
          <div class="form-actions">
            <button type="submit" class="btn btn--primary btn--lg" id="submitArticle">
              📤 Makaleyi Yayınla
            </button>
            <button type="button" class="btn btn--outline btn--lg" onclick="window.location.hash='#/admin'">
              İptal
            </button>
          </div>
        </form>
      </div>
    </section>
  `;

  // Editör ve form olaylarını başlat
  setupEditor();
  setupArticleForm();
  setupSlugGenerator();
  setupCoverImageUpload(); // ← Yeni: Cloudinary yükleme
}

/**
 * Makale düzenleme sayfasını render eder
 * @param {string} articleId - Düzenlenecek makale ID'si
 */
async function renderMakaleDuzenle(articleId) {
  const admin = await isAdminUser();
  if (!admin) {
    appContainer.innerHTML = `
      <section class="section">
        <div class="container text-center">
          <div class="error-page">
            <span class="error-page__icon">🔒</span>
            <h1 class="error-page__title">Yetkisiz Erişim</h1>
            <a href="#/" class="btn btn--primary">Ana Sayfaya Dön</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  // Önce yükleniyor ekranı
  appContainer.innerHTML = `
    <section class="section">
      <div class="container container--narrow">
        <div class="article-loading">
          <div class="spinner"></div>
          <p>Makale yükleniyor...</p>
        </div>
      </div>
    </section>
  `;

  try {
    const doc = await db.collection('articles').doc(articleId).get();

    if (!doc.exists) {
      render404();
      return;
    }

    const article = doc.data();

    // Aynı formu render et ama verilerle doldur
    appContainer.innerHTML = `
      <section class="section">
        <div class="container container--narrow">
          <a href="#/admin" class="back-link">← Admin Panel'e Dön</a>
          <h1 class="page-header__title">✏️ Makale Düzenle</h1>

          <form id="articleForm" class="admin-form" data-article-id="${articleId}">
            <div class="form-group">
              <label for="articleTitle" class="form-label">Makale Başlığı *</label>
              <input type="text" id="articleTitle" class="form-input" value="${article.title || ''}" required>
            </div>

            <div class="form-group">
              <label for="articleSlug" class="form-label">URL Slug *</label>
              <input type="text" id="articleSlug" class="form-input" value="${article.slug || ''}" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="articleCategory" class="form-label">Kategori *</label>
                <select id="articleCategory" class="form-select" required>
                  <option value="saglik" ${article.category === 'saglik' ? 'selected' : ''}>🏥 Sağlık</option>
                  <option value="bilim" ${article.category === 'bilim' ? 'selected' : ''}>🔬 Bilim</option>
                  <option value="egitim" ${article.category === 'egitim' ? 'selected' : ''}>📖 Eğitim</option>
                  <option value="teknoloji" ${article.category === 'teknoloji' ? 'selected' : ''}>💻 Teknoloji</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Öne Çıkan</label>
                <label class="form-checkbox">
                  <input type="checkbox" id="articleFeatured" ${article.featured ? 'checked' : ''}>
                  <span>Ana sayfada göster</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="articleSummary" class="form-label">Kısa Özet *</label>
              <textarea id="articleSummary" class="form-textarea" rows="3" required>${article.summary || ''}</textarea>
            </div>

            <div class="form-group">
              <label for="articleAuthor" class="form-label">Yazar *</label>
              <input type="text" id="articleAuthor" class="form-input" value="${article.author || ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Kapak Görseli</label>
              <div class="image-upload" id="imageUploadArea">
                <div class="image-upload__preview" id="imagePreview">
                  ${article.coverImage
                    ? '<img src="' + article.coverImage + '" alt="Kapak">'
                    : '<span class="image-upload__placeholder">📷 Görsel URL\'si girin</span>'}
                </div>
                <div class="image-upload__controls">
                  <input type="text" id="articleCoverImage" class="form-input" value="${article.coverImage || ''}">
                  <button type="button" class="btn btn--outline btn--sm" onclick="previewCoverImage()">Önizle</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Makale İçeriği *</label>
            <div class="editor-toolbar" id="editorToolbar">
	      <button type="button" class="toolbar-btn" data-command="bold" title="Kalın"><b>B</b></button>
  	      <button type="button" class="toolbar-btn" data-command="italic" title="İtalik"><i>I</i></button>
  	      <button type="button" class="toolbar-btn" data-command="underline" title="Altı Çizili"><u>U</u></button>
  	      <button type="button" class="toolbar-btn" data-command="strikeThrough" title="Üstü Çizili"><s>S</s></button>
  	      <span class="toolbar-divider"></span>
  	      <button type="button" class="toolbar-btn" data-command="formatBlock" data-value="H2" title="Başlık 2">H2</button>
  	      <button type="button" class="toolbar-btn" data-command="formatBlock" data-value="H3" title="Başlık 3">H3</button>
  	      <button type="button" class="toolbar-btn" data-command="formatBlock" data-value="P" title="Paragraf">¶</button>
  	      <span class="toolbar-divider"></span>
  	      <button type="button" class="toolbar-btn" data-command="insertUnorderedList" title="Madde İşareti">• Liste</button>
  	      <button type="button" class="toolbar-btn" data-command="insertOrderedList" title="Numaralı Liste">1. Liste</button>
  	      <button type="button" class="toolbar-btn" data-command="insertBlockquote" title="Alıntı">❝</button>
  	      <span class="toolbar-divider"></span>
  	      <button type="button" class="toolbar-btn" data-command="createLink" title="Link Ekle">🔗</button>
  	      <button type="button" class="toolbar-btn" data-command="insertImage" title="Görsel Ekle">🖼️</button>
  	      <button type="button" class="toolbar-btn" data-command="insertTable" title="Tablo Ekle">📊</button>
  	      <button type="button" class="toolbar-btn" data-command="insertCode" title="Kod Bloğu">&lt;/&gt;</button>
  	      <button type="button" class="toolbar-btn" data-command="insertHR" title="Ayırıcı Çizgi">―</button>
 	      <span class="toolbar-divider"></span>
  	      <button type="button" class="toolbar-btn" data-command="removeFormat" title="Formatı Temizle">✖</button>
	    </div>
              <div class="editor-content" id="articleContent" contenteditable="true">${article.content || ''}</div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn--primary btn--lg" id="submitArticle">
                💾 Değişiklikleri Kaydet
              </button>
              <button type="button" class="btn btn--outline btn--lg" onclick="window.location.hash='#/admin'">
                İptal
              </button>
            </div>
          </form>
        </div>
      </section>
    `;

    setupEditor();
    setupArticleForm();
    setupCoverImageUpload(); // ← Yeni: Cloudinary yükleme
    console.log('✏️ Makale düzenleme yüklendi:', article.title);
  } catch (error) {
    console.error('❌ Makale düzenleme yüklenemedi:', error);
    appContainer.innerHTML = '<p class="error-state">Makale yüklenirken hata oluştu.</p>';
  }
}