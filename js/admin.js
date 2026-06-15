/* ============================================
   ESTİ BİRAZ — Yeni Tasarım Admin Fonksiyonları
   ============================================ */

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
                    <td><span class="eyebrow">${article.category || '—'}</span></td>
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
        <h3>${articleId ? 'Makaleyi Düzenle' : 'Yeni Makale'}</h3>
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
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="bold">B</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="italic">I</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="underline">U</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="formatBlock" data-value="H2">H2</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="formatBlock" data-value="H3">H3</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="createLink">🔗</button>
              <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertImage">🖼️</button>
            </div>
            <div class="editor-content" id="articleContent" contenteditable="true" style="min-height: 250px; padding: 14px; background: var(--paper); border: 1px solid var(--line); border-radius: 12px; outline: none;">${article.content || ''}</div>
          </div>
        </label>

        <label class="checkbox-label">
          <input type="checkbox" id="articleFeatured" ${article.featured ? 'checked' : ''}>
          Öne çıkan makale olarak işaretle
        </label>

        <div class="admin-inline-actions" style="margin-top: 14px;">
          <button type="button" class="ghost-button" onclick="document.getElementById('articleFormContainer').innerHTML=''">İptal</button>
          <button type="submit" class="primary-button">${articleId ? 'Güncelle' : 'Yayınla'}</button>
        </div>
      </form>
    </div>
  `;

  if (typeof setupEditor === 'function') setupEditor();
}

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
                    <td><span class="eyebrow">${course.category || '—'}</span></td>
                    <td>${course.status === 'published' ? '✅ Yayında' : '📝 Taslak'}</td>
                    <td style="display: flex; gap: 8px;">
                      <button class="ghost-button" style="padding: 6px 10px; font-size: 0.85rem;" onclick="editCourse('${course.id}')">Düzenle</button>
                      <button class="ghost-button" style="padding: 6px 10px; font-size: 0.85rem;" onclick="manageLessons('${course.id}', '${course.title}')">Dersler</button>
                      <button class="ghost-button danger-button" style="padding: 6px 10px; font-size: 0.85rem;" onclick="deleteCourse('${course.id}', '${course.title}')">Sil</button>
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

async function manageLessons(courseId, courseTitle) {
  const container = document.getElementById('adminContent');
  if (!container) return;

  container.innerHTML = '<div style="padding: 40px; text-align: center;">Yükleniyor...</div>';

  try {
    const lessonsRef = db.collection('courses').doc(courseId).collection('lessons');
    const snapshot = await lessonsRef.orderBy('order', 'asc').get();
    const lessons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    container.innerHTML = `
      <div class="admin-panel">
        <div class="admin-panel__head">
          <div>
            <button class="ghost-button" style="padding: 4px 10px; margin-bottom: 12px;" onclick="loadAdminCourses()">← Kurslara Dön</button>
            <h3>${courseTitle} — Dersler</h3>
          </div>
          <button class="primary-button" onclick="showLessonForm('${courseId}')">+ Yeni Ders</button>
        </div>

        <div id="lessonFormContainer"></div>

        <ul class="lesson-list">
          ${lessons.length > 0 ? lessons.map((lesson, index) => `
            <li class="lesson-item">
              <div>
                <strong>${index + 1}.</strong>
              </div>
              <div class="lesson-item__main">
                <label>${lesson.title}</label>
                <small>${lesson.type === 'audio' ? '🎧 Ses' : lesson.type === 'text' ? '📄 Metin' : '🎬 Video'}</small>
              </div>
              <div class="lesson-item__actions" style="display: flex; flex-direction: row; gap: 6px;">
                <button class="ghost-button" style="padding: 4px 8px;" onclick="editLesson('${courseId}', '${lesson.id}')">✏️</button>
                <button class="ghost-button danger-button" style="padding: 4px 8px;" onclick="deleteLesson('${courseId}', '${lesson.id}', '${lesson.title}')">🗑️</button>
              </div>
            </li>
          `).join('') : '<p style="color: var(--muted);">Henüz ders eklenmemiş.</p>'}
        </ul>
      </div>
    `;
  } catch (error) {
    console.error('❌ Dersler yüklenemedi:', error);
  }
}

// Ortak Kayıt Fonksiyonları (Orijinal mantık tamamen korundu)
async function saveArticleInline(articleId) {
  const title = document.getElementById('articleTitle').value.trim();
  const slug = document.getElementById('articleSlug').value.trim();
  const category = document.getElementById('articleCategory').value;
  const author = document.getElementById('articleAuthor').value.trim();
  const summary = document.getElementById('articleSummary').value.trim();
  const coverImage = document.getElementById('articleCoverImage').value.trim();
  const content = document.getElementById('articleContent').innerHTML;
  const featured = document.getElementById('articleFeatured').checked;

  const articleData = { title, slug, category, author, summary, coverImage, content, featured, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };

  if (articleId) {
    await db.collection('articles').doc(articleId).update(articleData);
  } else {
    articleData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    articleData.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
    await db.collection('articles').add(articleData);
  }
  document.getElementById('articleFormContainer').innerHTML = '';
  loadAdminArticles();
}

// Diğer deleteArticle, editCourse, saveLesson gibi tüm CRUD işlemleri orijinal formunda tutulup UI tetikleyicileri bu yeni tasarıma entegre edildi.