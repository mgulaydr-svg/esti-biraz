/* ============================================
   ESTİ BİRAZ — Yönetim Paneli (admin.js) - TAM SÜRÜM
   ============================================ */

// ══════════════════════════════════════════════
//  1. MAKALE YÖNETİMİ
// ══════════════════════════════════════════════

async function loadAdminArticles() {
  const container = document.getElementById('adminContent');
  if (!container) return;

  container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--brand-teal); font-weight: 800;">Yükleniyor...</div>';

  try {
    const snapshot = await db.collection('articles').orderBy('createdAt', 'desc').get();
    const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    container.innerHTML = `
      <div class="admin-panel">
        <div class="admin-panel__head">
          <div>
            <h3>Makale Yönetimi</h3>
            <p>Platformdaki tüm makaleleri yönetin.</p>
          </div>
          <button class="primary-button" onclick="showArticleForm()">+ Yeni Makale</button>
        </div>

        <div id="articleFormContainer"></div>

        <div class="content-table" style="margin-top: 16px;">
          <div class="content-table__scroll">
            <table>
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Kategori</th>
                  <th>Yazar</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                ${articles.map(article => `
                  <tr>
                    <td><strong>${article.title}</strong></td>
                    <td><span class="badge">${article.category || '—'}</span></td>
                    <td>${article.author || '—'}</td>
                    <td>${article.featured ? '⭐ Öne Çıkan' : '—'}</td>
                    <td style="display: flex; gap: 8px;">
                      <button class="ghost-button" style="padding: 6px 10px; font-size: 0.85rem;" onclick="editArticle('${article.id}')">Düzenle</button>
                      <button class="ghost-button danger-button" style="padding: 6px 10px; font-size: 0.85rem;" onclick="deleteArticle('${article.id}', '${article.title.replace(/'/g, "\\'")}')">Sil</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ${articles.length === 0 ? '<p style="color: var(--muted); text-align: center; padding: 20px;">Henüz makale eklenmemiş.</p>' : ''}
      </div>
    `;
  } catch (error) {
    console.error('❌ Makaleler yüklenemedi:', error);
    container.innerHTML = '<p style="color: var(--brand-red);">Makaleler yüklenirken hata oluştu.</p>';
  }
}

async function showArticleForm(articleId = null) {
  const container = document.getElementById('articleFormContainer');
  let article = {};

  if (articleId) {
    const doc = await db.collection('articles').doc(articleId).get();
    article = doc.exists ? { id: doc.id, ...doc.data() } : {};
  }

  container.innerHTML = `
    <div class="admin-panel" style="margin-bottom: 24px; border-color: var(--brand-teal);">
      <div class="admin-panel__head">
        <h3 style="margin:0;">${articleId ? 'Makaleyi Düzenle' : 'Yeni Makale'}</h3>
      </div>
      <form class="admin-form" onsubmit="event.preventDefault(); saveArticleInline('${articleId || ''}');">
        
        <div class="admin-form-grid">
          <label>Makale Başlığı *
            <input type="text" id="articleTitle" value="${article.title || ''}" required placeholder="Örn: Sağlıklı Beslenme Rehberi">
          </label>
          <label>Slug (URL) *
            <input type="text" id="articleSlug" value="${article.slug || ''}" required placeholder="Örn: saglikli-beslenme-rehberi">
          </label>
        </div>

        <div class="admin-form-grid">
          <label>Kategori *
            <select id="articleCategory" required>
              <option value="">Seçiniz</option>
              <option value="saglik" ${article.category === 'saglik' ? 'selected' : ''}>Sağlık</option>
              <option value="bilim" ${article.category === 'bilim' ? 'selected' : ''}>Bilim</option>
              <option value="egitim" ${article.category === 'egitim' ? 'selected' : ''}>Eğitim</option>
              <option value="teknoloji" ${article.category === 'teknoloji' ? 'selected' : ''}>Teknoloji</option>
            </select>
          </label>
          <label>Yazar *
            <input type="text" id="articleAuthor" value="${article.author || ''}" required>
          </label>
        </div>

        <label>Kısa Özet *
          <textarea id="articleSummary" required placeholder="Kart üzerinde görünecek kısa açıklama...">${article.summary || ''}</textarea>
        </label>

        <label>Kapak Görseli URL
          <input type="url" id="articleCoverImage" value="${article.coverImage || ''}" placeholder="https://...">
        </label>

        <label>Makale İçeriği *
          <div class="block-editor">
            <div class="block-editor__tools" id="editorToolbar">
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="bold" title="Kalın"><b>B</b></button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="italic" title="İtalik"><i>I</i></button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="underline" title="Altı Çizili"><u>U</u></button>
              <span class="toolbar-divider" style="width: 1px; background: var(--line); margin: 0 4px;"></span>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="formatBlock" data-value="H2">H2</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="formatBlock" data-value="H3">H3</button>
              <span class="toolbar-divider" style="width: 1px; background: var(--line); margin: 0 4px;"></span>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="createLink" title="Bağlantı Ekle">🔗</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertImage" title="Görsel Ekle">🖼️</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertTable" title="Tablo Ekle">📊</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertCode" title="Kod Bloğu">&lt;/&gt;</button>
              <span class="toolbar-divider" style="width: 1px; background: var(--line); margin: 0 4px;"></span>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertCallout" title="Vurgu Kutusu (Uyarı/Bilgi)">💡 Kutu</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertQuiz" title="Çoktan Seçmeli Soru">❓ Soru</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertMatching" title="Eşleştirme Modülü">🔄 Eşleştir</button>
            </div>
            <div class="editor-content" id="articleContent" contenteditable="true" style="min-height: 250px; padding: 14px; background: var(--paper); border: 1px solid var(--line); border-radius: 12px; outline: none;">${article.content || ''}</div>
          </div>
        </label>

        <label class="checkbox-label" style="display: flex; gap: 8px; align-items: center; margin-top: 12px; font-weight: 700;">
          <input type="checkbox" id="articleFeatured" ${article.featured ? 'checked' : ''} style="width: auto;">
          Öne çıkan makale olarak işaretle
        </label>

        <div class="admin-inline-actions" style="margin-top: 14px; display: flex; gap: 12px;">
          <button type="submit" class="primary-button">${articleId ? 'Güncelle' : 'Yayınla'}</button>
          <button type="button" class="ghost-button" onclick="document.getElementById('articleFormContainer').innerHTML=''">İptal</button>
        </div>
      </form>
    </div>
  `;

  if (typeof setupEditor === 'function') setupEditor();
}

async function saveArticleInline(articleId) {
  const title = document.getElementById('articleTitle').value.trim();
  const slug = document.getElementById('articleSlug').value.trim();
  const category = document.getElementById('articleCategory').value;
  const author = document.getElementById('articleAuthor').value.trim();
  const summary = document.getElementById('articleSummary').value.trim();
  const coverImage = document.getElementById('articleCoverImage').value.trim();
  const content = document.getElementById('articleContent').innerHTML;
  const featured = document.getElementById('articleFeatured').checked;

  if (!title || !slug || !category || !content) {
    alert("Lütfen zorunlu alanları doldurun.");
    return;
  }

  const articleData = { title, slug, category, author, summary, coverImage, content, featured, status: 'published', updatedAt: firebase.firestore.FieldValue.serverTimestamp() };

  try {
    if (articleId) {
      await db.collection('articles').doc(articleId).update(articleData);
    } else {
      articleData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      articleData.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('articles').add(articleData);
    }
    document.getElementById('articleFormContainer').innerHTML = '';
    loadAdminArticles();
  } catch (err) {
    alert("Kaydedilirken hata oluştu: " + err.message);
  }
}

async function editArticle(articleId) {
  await showArticleForm(articleId);
  document.getElementById('articleFormContainer').scrollIntoView({ behavior: 'smooth' });
}

async function deleteArticle(articleId, title) {
  if (!confirm(`"${title}" makalesini silmek istediğinize emin misiniz?`)) return;
  try {
    await db.collection('articles').doc(articleId).delete();
    loadAdminArticles();
  } catch (error) {
    alert('Makale silinirken hata oluştu: ' + error.message);
  }
}

// ══════════════════════════════════════════════
//  2. KURS YÖNETİMİ
// ══════════════════════════════════════════════

async function loadAdminCourses() {
  const container = document.getElementById('adminContent');
  if (!container) return;

  container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--brand-teal); font-weight: 800;">Yükleniyor...</div>';

  try {
    const snapshot = await db.collection('courses').orderBy('createdAt', 'desc').get();
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    container.innerHTML = `
      <div class="admin-panel">
        <div class="admin-panel__head">
          <div>
            <h3>Kurs Yönetimi</h3>
            <p>Eğitim modüllerini ve dersleri yönetin.</p>
          </div>
          <button class="primary-button" onclick="showCourseForm()">+ Yeni Kurs</button>
        </div>

        <div id="courseFormContainer"></div>

        <div class="content-table" style="margin-top: 16px;">
          <div class="content-table__scroll">
            <table>
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Kategori</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                ${courses.map(course => `
                  <tr>
                    <td><strong>${course.title}</strong></td>
                    <td><span class="badge">${course.category || '—'}</span></td>
                    <td>${course.status === 'published' ? '✅ Yayında' : '📝 Taslak'}</td>
                    <td style="display: flex; gap: 8px;">
                      <button class="ghost-button" style="padding: 6px 10px; font-size: 0.85rem;" onclick="editCourse('${course.id}')">Düzenle</button>
                      <button class="ghost-button" style="padding: 6px 10px; font-size: 0.85rem;" onclick="manageLessons('${course.id}', '${course.title.replace(/'/g, "\\'")}')">Dersler</button>
                      <button class="ghost-button danger-button" style="padding: 6px 10px; font-size: 0.85rem;" onclick="deleteCourse('${course.id}', '${course.title.replace(/'/g, "\\'")}')">Sil</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('❌ Kurslar yüklenemedi:', error);
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
    <div class="admin-panel" style="margin-bottom: 24px; border-color: var(--brand-teal);">
      <div class="admin-panel__head">
        <h3 style="margin:0;">${courseId ? 'Kursu Düzenle' : 'Yeni Kurs'}</h3>
      </div>
      <form class="admin-form" onsubmit="event.preventDefault(); saveCourse('${courseId || ''}');">
        
        <div class="admin-form-grid">
          <label>Kurs Başlığı *
            <input type="text" id="courseTitle" value="${course.title || ''}" required>
          </label>
          <label>Slug (URL) *
            <input type="text" id="courseSlug" value="${course.slug || ''}" required>
          </label>
        </div>

        <label>Açıklama
          <textarea id="courseDescription" rows="2">${course.description || ''}</textarea>
        </label>

        <div class="admin-form-grid">
          <label>Kategori
            <select id="courseCategory">
              <option value="">Seçiniz</option>
              <option value="saglik" ${course.category === 'saglik' ? 'selected' : ''}>Sağlık</option>
              <option value="bilim" ${course.category === 'bilim' ? 'selected' : ''}>Bilim</option>
              <option value="egitim" ${course.category === 'egitim' ? 'selected' : ''}>Eğitim</option>
            </select>
          </label>
          <label>Durum
            <select id="courseStatus">
              <option value="draft" ${course.status === 'draft' ? 'selected' : ''}>Taslak</option>
              <option value="published" ${course.status === 'published' ? 'selected' : ''}>Yayında</option>
            </select>
          </label>
        </div>

        <div class="admin-form-grid">
          <label>Seviye
            <select id="courseLevel">
              <option value="baslangic" ${course.level === 'baslangic' ? 'selected' : ''}>Başlangıç</option>
              <option value="orta" ${course.level === 'orta' ? 'selected' : ''}>Orta</option>
              <option value="ileri" ${course.level === 'ileri' ? 'selected' : ''}>İleri</option>
            </select>
          </label>
          <label>Eğitmen
            <input type="text" id="courseInstructor" value="${course.instructor || ''}">
          </label>
        </div>

        <label>Kapak Resmi URL
          <input type="url" id="courseCoverImage" value="${course.coverImage || ''}">
        </label>

        <label class="checkbox-label" style="display: flex; gap: 8px; align-items: center; margin-top: 12px; font-weight: 700;">
          <input type="checkbox" id="courseFeatured" ${course.featured ? 'checked' : ''} style="width: auto;">
          Öne çıkan kurs olarak işaretle
        </label>

        <div class="admin-inline-actions" style="margin-top: 14px; display: flex; gap: 12px;">
          <button type="submit" class="primary-button">${courseId ? 'Güncelle' : 'Oluştur'}</button>
          <button type="button" class="ghost-button" onclick="document.getElementById('courseFormContainer').innerHTML=''">İptal</button>
        </div>
      </form>
    </div>
  `;
}

async function saveCourse(courseId) {
  const title = document.getElementById('courseTitle').value.trim();
  const slug = document.getElementById('courseSlug').value.trim();
  
  if (!title || !slug) {
    alert("Başlık ve slug zorunludur.");
    return;
  }

  const courseData = {
    title, slug,
    description: document.getElementById('courseDescription').value.trim(),
    category: document.getElementById('courseCategory').value,
    status: document.getElementById('courseStatus').value,
    level: document.getElementById('courseLevel').value,
    instructor: document.getElementById('courseInstructor').value.trim(),
    coverImage: document.getElementById('courseCoverImage').value.trim(),
    featured: document.getElementById('courseFeatured').checked,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    if (courseId) {
      if (courseData.status === 'published') courseData.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('courses').doc(courseId).update(courseData);
    } else {
      courseData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      if (courseData.status === 'published') courseData.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
      courseData.lessonCount = 0;
      await db.collection('courses').add(courseData);
    }
    document.getElementById('courseFormContainer').innerHTML = '';
    loadAdminCourses();
  } catch (err) {
    alert("Kurs kaydedilirken hata oluştu: " + err.message);
  }
}

async function editCourse(courseId) {
  await showCourseForm(courseId);
  document.getElementById('courseFormContainer').scrollIntoView({ behavior: 'smooth' });
}

async function deleteCourse(courseId, title) {
  if (!confirm(`"${title}" kursunu silmek istediğinize emin misiniz? Bu işlem kursa ait tüm
