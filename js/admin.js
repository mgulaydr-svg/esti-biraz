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
  const container = document.getElementById('adminContent');
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

/* ============================================
   ADMIN PANELİ — KURS YÖNETİMİ (Parça 1.9)
   ============================================ */

async function loadAdminCourses() {
  const container = document.getElementById('adminContent');
  if (!container) return;

  container.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const snapshot = await db.collection('courses')
      .orderBy('createdAt', 'desc').get();

    const courses = snapshot.docs.map(doc => ({
      id: doc.id, ...doc.data()
    }));

    container.innerHTML = `
      <div class="admin-section">
        <div class="admin-section__header">
          <h2>🎓 Kurs Yönetimi</h2>
          <button class="btn btn--primary btn--sm" onclick="showCourseForm()">
            ➕ Yeni Kurs
          </button>
        </div>

        <div id="courseFormContainer"></div>

        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Kategori</th>
                <th>Durum</th>
                <th>Ders</th>
                <th>Öne Çıkan</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              ${courses.map(course => `
                <tr>
                  <td><strong>${course.title}</strong></td>
                  <td>${course.category || '—'}</td>
                  <td>
                    <span class="badge badge--${course.status === 'published' ? 'success' : 'warning'}">
                      ${course.status === 'published' ? '✅ Yayında' : '📝 Taslak'}
                    </span>
                  </td>
                  <td>${course.lessonCount || 0}</td>
                  <td>${course.featured ? '⭐' : '—'}</td>
                  <td class="admin-table__actions">
                    <button class="btn btn--sm btn--outline" onclick="editCourse('${course.id}')">
                      ✏️ Düzenle
                    </button>
                    <button class="btn btn--sm btn--outline" onclick="manageLessons('${course.id}', '${course.title}')">
                      📚 Dersler
                    </button>
                    <button class="btn btn--sm btn--danger" onclick="deleteCourse('${course.id}', '${course.title}')">
                      🗑️
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${courses.length === 0 ? '<p class="text-muted text-center">Henüz kurs eklenmemiş.</p>' : ''}
      </div>
    `;
  } catch (error) {
    console.error('❌ Kurslar yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Kurslar yüklenirken hata oluştu.</p>';
  }
}

async function showCourseForm(courseId = null) {
  const container = document.getElementById('courseFormContainer');
  let course = {};

  if (courseId) {
    const doc = await db.collection('courses').doc(courseId).get();
    course = doc.exists ? { id: doc.id, ...doc.data() } : {};
  }

  container.innerHTML = `
    <div class="admin-form">
      <h3>${courseId ? '✏️ Kursu Düzenle' : '➕ Yeni Kurs'}</h3>
      <form id="courseForm" onsubmit="event.preventDefault(); saveCourse('${courseId || ''}');">
        
        <div class="form-group">
          <label>Kurs Başlığı *</label>
          <input type="text" id="courseTitle" value="${course.title || ''}" required
                 class="form-input" placeholder="Örn: Temel Sağlık Eğitimi">
        </div>

        <div class="form-group">
          <label>Slug (URL) *</label>
          <input type="text" id="courseSlug" value="${course.slug || ''}" required
                 class="form-input" placeholder="Örn: temel-saglik-egitimi">
        </div>

        <div class="form-group">
          <label>Açıklama</label>
          <textarea id="courseDescription" class="form-input" rows="3"
                    placeholder="Kurs hakkında kısa açıklama...">${course.description || ''}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Kategori</label>
            <select id="courseCategory" class="form-input">
              <option value="">Seçiniz</option>
              <option value="saglik" ${course.category === 'saglik' ? 'selected' : ''}>Sağlık</option>
              <option value="bilim" ${course.category === 'bilim' ? 'selected' : ''}>Bilim</option>
              <option value="egitim" ${course.category === 'egitim' ? 'selected' : ''}>Eğitim</option>
              <option value="beslenme" ${course.category === 'beslenme' ? 'selected' : ''}>Beslenme</option>
              <option value="gebelik" ${course.category === 'gebelik' ? 'selected' : ''}>Gebelik</option>
            </select>
          </div>
          <div class="form-group">
            <label>Durum</label>
            <select id="courseStatus" class="form-input">
              <option value="draft" ${course.status === 'draft' ? 'selected' : ''}>📝 Taslak</option>
              <option value="published" ${course.status === 'published' ? 'selected' : ''}>✅ Yayında</option>
            </select>
          </div>
        </div>

        <div class="form-group">
  	  <label>Kapak Resmi</label>
  	  <input type="hidden" id="courseCoverImage" value="${course.coverImage || ''}">
  	  <button type="button" class="btn btn--outline btn--sm" onclick="uploadCourseCover()">
    	    📷 Görsel Yükle
  	  </button>
  	  <div id="courseCoverPreview">
    	    ${course.coverImage ? `<img src="${course.coverImage}" style="max-width:200px; margin-top:8px; border-radius:8px;">` : ''}
  	  </div>
	</div>

        <div class="form-group">
          <label class="form-checkbox">
            <input type="checkbox" id="courseFeatured" ${course.featured ? 'checked' : ''}>
            ⭐ Öne çıkan kurs olarak işaretle
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn--primary">
            ${courseId ? '💾 Güncelle' : '➕ Oluştur'}
          </button>
          <button type="button" class="btn btn--outline" onclick="hideCourseForm()">
            ❌ İptal
          </button>
        </div>
      </form>
    </div>
  `;

// Otomatik slug oluşturma
  if (!courseId) {
    document.getElementById('courseTitle').addEventListener('input', (e) => {
      const slug = e.target.value
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      document.getElementById('courseSlug').value = slug;
    });
  }
}


function uploadCourseCover() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = document.getElementById('courseCoverPreview');
    preview.innerHTML = '⏳ Yükleniyor...';

    try {
      const result = await uploadToCloudinary(file);
      document.getElementById('courseCoverImage').value = result.url;
      preview.innerHTML = `<img src="${result.url}" style="max-width:200px; margin-top:8px; border-radius:8px;">`;
    } catch (error) {
      preview.innerHTML = `<span style="color:red;">❌ ${error.message}</span>`;
    }
  });

  fileInput.click();
}

function hideCourseForm() {
  const container = document.getElementById('courseFormContainer');
  if (container) container.innerHTML = '';
}


async function saveCourse(courseId) {
  const title = document.getElementById('courseTitle').value.trim();
  const slug = document.getElementById('courseSlug').value.trim();
  const description = document.getElementById('courseDescription').value.trim();
  const category = document.getElementById('courseCategory').value;
  const status = document.getElementById('courseStatus').value;
  const coverImage = document.getElementById('courseCoverImage').value.trim();
  const featured = document.getElementById('courseFeatured').checked;

  if (!title || !slug) {
    alert('Başlık ve slug zorunludur.');
    return;
  }

  try {
    const courseData = {
      title,
      slug,
      description,
      category,
      status,
      coverImage,
      featured,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (courseId) {
      // Güncelle
      if (status === 'published') {
        courseData.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      await db.collection('courses').doc(courseId).update(courseData);
      console.log('✅ Kurs güncellendi:', title);
    } else {
      // Yeni oluştur
      courseData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      if (status === 'published') {
        courseData.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      courseData.createdBy = firebase.auth().currentUser.uid;
      courseData.lessonCount = 0;
      await db.collection('courses').add(courseData);
      console.log('✅ Yeni kurs oluşturuldu:', title);
    }

    hideCourseForm();
    loadAdminCourses();  // Listeyi yenile

  } catch (error) {
    console.error('❌ Kurs kaydedilemedi:', error);
    alert('Kurs kaydedilirken hata oluştu: ' + error.message);
  }
}


async function editCourse(courseId) {
  await showCourseForm(courseId);
  // Formu görünür alana kaydır
  document.getElementById('courseFormContainer').scrollIntoView({ behavior: 'smooth' });
}

async function deleteCourse(courseId, title) {
  const confirmed = confirm(
    `⚠️ "${title}" kursunu silmek istediğinize emin misiniz?\n\n` +
    'Bu işlem kursa ait tüm dersleri de silecektir!'
  );
  if (!confirmed) return;

  try {
    // Önce kursa ait dersleri sil
    const lessonsSnapshot = await db.collection('lessons')
      .where('courseId', '==', courseId).get();
    
    const batch = db.batch();
    lessonsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(db.collection('courses').doc(courseId));
    await batch.commit();

    console.log('✅ Kurs ve dersleri silindi:', title);
    loadAdminCourses();  // Listeyi yenile

  } catch (error) {
    console.error('❌ Kurs silinemedi:', error);
    alert('Kurs silinirken hata oluştu: ' + error.message);
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
  		<option value="yasam">🌿 Yaşam</option>
  		<option value="kultur">🎭 Kültür</option>
  		<option value="diger">📌 Diğer</option>
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


/* ============================================
   ADMIN PANELİ — DERS YÖNETİMİ (Parça 1.9)
   ============================================ */

async function manageLessons(courseId, courseTitle) {
  const container = document.getElementById('adminContent');
  container.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const snapshot = await db.collection('lessons')
      .where('courseId', '==', courseId)
      .orderBy('order', 'asc')
      .get();

    const lessons = snapshot.docs.map(doc => ({
      id: doc.id, ...doc.data()
    }));

    container.innerHTML = `
      <div class="admin-section">
        <div class="admin-section__header">
          <div>
            <button class="btn btn--sm btn--outline" onclick="loadAdminCourses()">
              ← Kurslara Dön
            </button>
            <h2 style="margin-top:var(--space-3)">📚 ${courseTitle} — Dersler</h2>
          </div>
          <button class="btn btn--primary btn--sm" onclick="showLessonForm('${courseId}')">
            ➕ Yeni Ders
          </button>
        </div>

        <div id="lessonFormContainer"></div>

        <div class="admin-lessons-list" id="lessonsList">
          ${lessons.length > 0 ? lessons.map((lesson, index) => `
            <div class="admin-lesson-item" data-id="${lesson.id}">
              <div class="admin-lesson-item__order">
                <span class="admin-lesson-item__number">${index + 1}</span>
                <div class="admin-lesson-item__arrows">
                  ${index > 0 ? `<button class="btn-icon" onclick="moveLessonUp('${courseId}', '${lesson.id}', ${lesson.order})">⬆️</button>` : ''}
                  ${index < lessons.length - 1 ? `<button class="btn-icon" onclick="moveLessonDown('${courseId}', '${lesson.id}', ${lesson.order})">⬇️</button>` : ''}
                </div>
              </div>
              <div class="admin-lesson-item__info">
                <strong>${lesson.title}</strong>
                <span class="text-muted">
                  ${lesson.type === 'audio' ? '🎧 Ses' : lesson.type === 'text' ? '📄 Metin' : '🎬 Video'}
                  ${lesson.duration ? ' · ' + formatDuration(lesson.duration) : ''}
                </span>
              </div>
              <div class="admin-lesson-item__actions">
                <button class="btn btn--sm btn--outline" onclick="editLesson('${courseId}', '${lesson.id}')">
                  ✏️
                </button>
                <button class="btn btn--sm btn--danger" onclick="deleteLesson('${courseId}', '${lesson.id}', '${lesson.title}')">
                  🗑️
                </button>
              </div>
            </div>
          `).join('') : '<p class="text-muted text-center">Henüz ders eklenmemiş.</p>'}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('❌ Dersler yüklenemedi:', error);
    container.innerHTML = '<p class="error-state">Dersler yüklenirken hata oluştu.</p>';
  }
}

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}


async function showLessonForm(courseId, lessonId = null) {
  const container = document.getElementById('lessonFormContainer');
  let lesson = {};

  if (lessonId) {
    const doc = await db.collection('lessons').doc(lessonId).get();
    lesson = doc.exists ? { id: doc.id, ...doc.data() } : {};
  } else {
    // Yeni ders için sıra numarasını belirle
    const snapshot = await db.collection('lessons')
      .where('courseId', '==', courseId)
      .orderBy('order', 'desc').limit(1).get();
    const lastOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;
    lesson.order = lastOrder + 1;
  }

  container.innerHTML = `
    <div class="admin-form">
      <h3>${lessonId ? '✏️ Dersi Düzenle' : '➕ Yeni Ders'}</h3>
      <form onsubmit="event.preventDefault(); saveLesson('${courseId}', '${lessonId || ''}');">

        <div class="form-group">
          <label>Ders Başlığı *</label>
          <input type="text" id="lessonTitle" value="${lesson.title || ''}" required
                 class="form-input" placeholder="Örn: Giriş — Kurs Tanıtımı">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Ders Tipi</label>
            <select id="lessonType" class="form-input" onchange="toggleLessonFields()">
              <option value="video" ${lesson.type === 'video' ? 'selected' : ''}>🎬 Video</option>
              <option value="audio" ${lesson.type === 'audio' ? 'selected' : ''}>🎧 Ses</option>
              <option value="text" ${lesson.type === 'text' ? 'selected' : ''}>📄 Metin</option>
            </select>
          </div>
          <div class="form-group">
            <label>Sıra No</label>
            <input type="number" id="lessonOrder" value="${lesson.order || 1}" min="1"
                   class="form-input">
          </div>
        </div>

        <div id="mediaFields">
          <div class="form-group">
            <label>Medya URL *</label>
            <input type="url" id="lessonMediaUrl" value="${lesson.mediaUrl || ''}"
                   class="form-input" placeholder="YouTube veya Cloudinary URL">
            <small class="form-hint">Video: YouTube linki · Ses: Cloudinary ses dosyası URL</small>
          </div>

          <div class="form-group">
            <label>Süre (saniye)</label>
            <input type="number" id="lessonDuration" value="${lesson.duration || ''}" min="0"
                   class="form-input" placeholder="Örn: 300 (5 dakika)">
          </div>
        </div>

        <div id="textFields" style="display:none;">
          <div class="form-group">
            <label>Ders İçeriği</label>
            <textarea id="lessonContent" class="form-input" rows="8"
                      placeholder="Metin ders içeriğini buraya yazın...">${lesson.content || ''}</textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn--primary">
            ${lessonId ? '💾 Güncelle' : '➕ Ekle'}
          </button>
          <button type="button" class="btn btn--outline" onclick="hideLessonForm()">
            ❌ İptal
          </button>
        </div>
      </form>
    </div>
  `;

  toggleLessonFields();  // İlk yüklemede doğru alanları göster
}

function toggleLessonFields() {
  const type = document.getElementById('lessonType').value;
  const mediaFields = document.getElementById('mediaFields');
  const textFields = document.getElementById('textFields');

  if (type === 'text') {
    mediaFields.style.display = 'none';
    textFields.style.display = 'block';
  } else {
    mediaFields.style.display = 'block';
    textFields.style.display = 'none';
  }
}

function hideLessonForm() {
  const container = document.getElementById('lessonFormContainer');
  if (container) container.innerHTML = '';
}


async function saveLesson(courseId, lessonId) {
  const title = document.getElementById('lessonTitle').value.trim();
  const type = document.getElementById('lessonType').value;
  const order = parseInt(document.getElementById('lessonOrder').value) || 1;

  if (!title) {
    alert('Ders başlığı zorunludur.');
    return;
  }

  try {
    const lessonData = {
      courseId,
      title,
      type,
      order,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (type === 'text') {
      lessonData.content = document.getElementById('lessonContent').value.trim();
      lessonData.mediaUrl = '';
      lessonData.duration = 0;
    } else {
      lessonData.mediaUrl = document.getElementById('lessonMediaUrl').value.trim();
      lessonData.duration = parseInt(document.getElementById('lessonDuration').value) || 0;
      lessonData.content = '';
    }

    if (lessonId) {
      await db.collection('lessons').doc(lessonId).update(lessonData);
      console.log('✅ Ders güncellendi:', title);
    } else {
      lessonData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('lessons').add(lessonData);
      console.log('✅ Yeni ders eklendi:', title);
    }

    // Kurs ders sayısını güncelle
    await updateCourseLessonCount(courseId);

    hideLessonForm();
    // Ders listesini yenile — kurs başlığını DOM'dan al
    const courseTitle = document.querySelector('.admin-section h2')?.textContent?.replace('📚 ', '').replace(' — Dersler', '') || '';
    manageLessons(courseId, courseTitle);

  } catch (error) {
    console.error('❌ Ders kaydedilemedi:', error);
    alert('Ders kaydedilirken hata oluştu: ' + error.message);
  }
}

async function updateCourseLessonCount(courseId) {
  const snapshot = await db.collection('lessons')
    .where('courseId', '==', courseId).get();
  await db.collection('courses').doc(courseId).update({
    lessonCount: snapshot.size
  });
}


async function editLesson(courseId, lessonId) {
  await showLessonForm(courseId, lessonId);
  document.getElementById('lessonFormContainer').scrollIntoView({ behavior: 'smooth' });
}

async function deleteLesson(courseId, lessonId, title) {
  if (!confirm(`"${title}" dersini silmek istediğinize emin misiniz?`)) return;

  try {
    await db.collection('lessons').doc(lessonId).delete();
    await updateCourseLessonCount(courseId);
    console.log('✅ Ders silindi:', title);

    const courseTitle = document.querySelector('.admin-section h2')?.textContent?.replace('📚 ', '').replace(' — Dersler', '') || '';
    manageLessons(courseId, courseTitle);
  } catch (error) {
    console.error('❌ Ders silinemedi:', error);
    alert('Ders silinirken hata oluştu: ' + error.message);
  }
}

async function moveLessonUp(courseId, lessonId, currentOrder) {
  await swapLessonOrder(courseId, lessonId, currentOrder, currentOrder - 1);
}

async function moveLessonDown(courseId, lessonId, currentOrder) {
  await swapLessonOrder(courseId, lessonId, currentOrder, currentOrder + 1);
}

async function swapLessonOrder(courseId, lessonId, fromOrder, toOrder) {
  try {
    // Hedef sıradaki dersi bul
    const targetSnapshot = await db.collection('lessons')
      .where('courseId', '==', courseId)
      .where('order', '==', toOrder)
      .limit(1)
      .get();

    const batch = db.batch();

    // Mevcut dersin sırasını değiştir
    batch.update(db.collection('lessons').doc(lessonId), { order: toOrder });

    // Hedef dersin sırasını değiştir
    if (!targetSnapshot.empty) {
      batch.update(targetSnapshot.docs[0].ref, { order: fromOrder });
    }

    await batch.commit();

    const courseTitle = document.querySelector('.admin-section h2')?.textContent?.replace('📚 ', '').replace(' — Dersler', '') || '';
    manageLessons(courseId, courseTitle);
  } catch (error) {
    console.error('❌ Sıralama hatası:', error);
  }
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
		  <option value="yasam" ${article.category === 'yasam' ? 'selected' : ''}>🌿 Yaşam</option>
		  <option value="kultur" ${article.category === 'kultur' ? 'selected' : ''}>🎭 Kültür</option>
		  <option value="diger" ${article.category === 'diger' ? 'selected' : ''}>📌 Diğer</option>
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