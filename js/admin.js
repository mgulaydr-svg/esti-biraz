/* ============================================
   ESTİ BİRAZ — Yönetim Paneli (admin.js) - TAM SÜRÜM
   ============================================ */

// Doğrudan Input'a Cloudinary Yüklemesi Yapar
function uploadDirectCoverImage(inputId, previewId) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    document.getElementById(previewId).innerHTML = '⏳ Yükleniyor...';
    try {
      const res = await uploadToCloudinary(file);
      document.getElementById(inputId).value = res.url;
      document.getElementById(previewId).innerHTML = `<img src="${res.url}" style="max-height:140px; border-radius:12px; margin-top:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">`;
    } catch(err) {
      document.getElementById(previewId).innerHTML = '❌ Hata: ' + err.message;
    }
  };
  fileInput.click();
}

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
                      < class="ghost-" style="padding: 6px 10px; font-size: 0.85rem;" onclick="editArticle('${article.id}')">Düzenle</>
                      < class="ghost- danger-" style="padding: 6px 10px; font-size: 0.85rem;" onclick="deleteArticle('${article.id}', '${article.title.replace(/'/g, "\\'")}')">Sil</button>
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

   function addLink() {
  const url = prompt('Bağlantı adresini girin (Örn: https://...):', 'https://');
  if (url) {
    document.execCommand('createLink', false, url);
  }
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
           <label>Kategori (Seçebilir veya yeni yazabilirsiniz) *
             <input type="text" id="articleCategory" list="categoryList" value="${article.category || ''}" required placeholder="Örn: saglik, yapay-zeka...">
             <datalist id="categoryList">
               <option value="saglik">Sağlık</option>
               <option value="bilim">Bilim</option>
               <option value="egitim">Eğitim</option>
               <option value="teknoloji">Teknoloji</option>
             </datalist>
           </label>
           <label>Yazar *
             <input type="text" id="articleAuthor" value="${article.author || ''}" required>
           </label>
         </div>

        <label>Kısa Özet *
          <textarea id="articleSummary" required placeholder="Kart üzerinde görünecek kısa açıklama...">${article.summary || ''}</textarea>
        </label>

       <div class="form-group">
          <label>Kapak Görseli</label>
          <div style="display:flex; gap:12px;">
            <input type="url" id="articleCoverImage" value="${article.coverImage || ''}" class="form-input" placeholder="https://...">
            <button type="button" class="btn btn--outline" onclick="uploadDirectCoverImage('articleCoverImage', 'articleCoverPreview')">📁 Bilgisayardan Seç</button>
          </div>
          <div id="articleCoverPreview">
            ${article.coverImage ? `<img src="${article.coverImage}" style="max-height:140px; border-radius:12px; margin-top:12px;">` : ''}
          </div>
        </div>

        <div class="form-group" style="margin-top: 24px; margin-bottom: 24px;">
  <!-- Zıplamayı çözen kısım: Label artık editörü sarmıyor, sadece başlık olarak duruyor -->
  <label style="display: block; margin-bottom: 8px; font-weight: 700;">Makale İçeriği *</label>
  
  <div class="block-editor">
    <div class="block-editor__tools" id="editorToolbar">
     <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="bold" title="Kalın" onmousedown="event.preventDefault();"><b>B</b></button>
     <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="italic" title="İtalik" onmousedown="event.preventDefault();"><i>I</i></button>
     <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="underline" title="Altı Çizili" onmousedown="event.preventDefault();"><u>U</u></button>
     
     <span class="toolbar-divider" style="width: 1px; background: var(--line); margin: 0 4px;"></span>
     <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertUnorderedList" title="Madde İşaretli Liste" onmousedown="event.preventDefault();">📝 Madde</button>
     <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertOrderedList" title="Numaralı Liste" onmousedown="event.preventDefault();">🔢 Sayı</button>
     
     <span class="toolbar-divider" style="width: 1px; background: var(--line); margin: 0 4px;"></span>
     <button type="button" class="toolbar-btn" title="Normal Düz Metin" onmousedown="event.preventDefault(); document.execCommand('removeFormat', false, null); document.execCommand('formatBlock', false, 'p');">P</button>

     <button type="button" class="toolbar-btn" title="Ana Başlık" onmousedown="event.preventDefault(); document.execCommand('removeFormat', false, null); document.execCommand('formatBlock', false, 'h2');">H2</button>
      
     <button type="button" class="toolbar-btn" title="Alt Başlık" onmousedown="event.preventDefault(); document.execCommand('removeFormat', false, null); document.execCommand('formatBlock', false, 'h3');">H3</button>
     
     <span class="toolbar-divider" style="width: 1px; background: var(--line); margin: 0 4px;"></span>
     <button type="button" class="ghost-button" style="padding: 4px 8px;" title="Bağlantı Ekle" onmousedown="event.preventDefault(); addLink();">🔗 Link</button>
     <button type="button" class="ghost-button" style="padding: 4px 8px;" title="Görsel Ekle (Cloudinary)" onmousedown="event.preventDefault(); insertImageWithCloudinary(document.getElementById('articleContent'));">🖼️ Görsel</button>
     <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertTable" title="Tablo Ekle" onmousedown="event.preventDefault();">📊</button>
     <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertCode" title="Kod Bloğu" onmousedown="event.preventDefault();">&lt;/&gt;</button>
     
     <span class="toolbar-divider" style="width: 1px; background: var(--line); margin: 0 4px;"></span>
     <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertCallout" title="Vurgu Kutusu (Uyarı/Bilgi)" onmousedown="event.preventDefault();">💡 Kutu</button>
     <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertQuiz" title="Çoktan Seçmeli Soru" onmousedown="event.preventDefault();">❓ Soru</button>
     <button type="button" class="ghost-button" style="padding: 4px 8px;" data-command="insertMatching" title="Eşleştirme Modülü" onmousedown="event.preventDefault();">🔄 Eşleştir</button>
   </div>
    
    <div class="editor-content" id="articleContent" contenteditable="true" style="min-height: 250px; padding: 14px; background: var(--paper); border: 1px solid var(--line); border-radius: 12px; outline: none;">${article.content || ''}</div>
  </div>
</div>

        <label class="checkbox-label" style="display: flex; gap: 8px; align-items: center; margin-top: 12px; font-weight: 700;">
          <input type="checkbox" id="articleFeatured" ${article.featured ? 'checked' : ''} style="width: auto;">
          Öne çıkan makale olarak işaretle
        </label>

        <div class="admin-inline-actions" style="margin-top: 14px; display: flex; gap: 12px;">
          <button type="submit" class="primary-button">${articleId ? 'Güncelle' : 'Yayınla'}</button>
          <button type="button" class="ghost-button" onclick="if(confirm('Kaydetmediğiniz tüm değişiklikler silinecek. Çıkmak istediğinize emin misiniz?')) { document.getElementById('articleFormContainer').innerHTML=''; }">İptal</button>
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
  // Editördeki ham HTML'i al
  const rawContent = document.getElementById('articleContent').innerHTML;

  // DOMPurify ile içindeki tüm zararlı scriptleri ve bozuk kodları temizle
  const safeContent = DOMPurify.sanitize(rawContent, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src']
  });

  // Firebase'e safeContent değişkenini gönder (content yerine)
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
      
      <form class="admin-form" onsubmit="event.preventDefault(); saveCourse('${courseId ? courseId : ''}');">
        
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
           <label>Kategori (Seçebilir veya yeni yazabilirsiniz)
             <input type="text" id="courseCategory" list="courseCategoryList" value="${course.category || ''}" placeholder="Örn: saglik, beslenme...">
             <datalist id="courseCategoryList">
               <option value="saglik">Sağlık</option>
               <option value="bilim">Bilim</option>
               <option value="egitim">Eğitim</option>
               <option value="beslenme">Beslenme</option>
               <option value="gebelik">Gebelik</option>
             </datalist>
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

        <div class="form-group">
          <label>Kapak Görseli</label>
          <div style="display:flex; gap:12px;">
            <input type="url" id="courseCoverImage" value="${course.coverImage || ''}" class="form-input" placeholder="https://...">
            <button type="button" class="btn btn--outline" onclick="uploadDirectCoverImage('courseCoverImage', 'courseCoverPreview')">📁 Bilgisayardan Seç</button>
          </div>
          <div id="courseCoverPreview">
            ${course.coverImage ? `<img src="${course.coverImage}" style="max-height:140px; border-radius:12px; margin-top:12px;">` : ''}
          </div>
        </div>

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
  if (!confirm(`"${title}" kursunu silmek istediğinize emin misiniz? Bu işlem kursa ait tüm dersleri de silecektir!`)) return;
  try {
    const lessonsSnapshot = await db.collection('courses').doc(courseId).collection('lessons').get();
    const batch = db.batch();
    lessonsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    batch.delete(db.collection('courses').doc(courseId));
    await batch.commit();
    loadAdminCourses();
  } catch (error) {
    alert('Kurs silinirken hata oluştu: ' + error.message);
  }
}

// ══════════════════════════════════════════════
//  3. DERS YÖNETİMİ (KURS İÇİ)
// ══════════════════════════════════════════════

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
            <h3 style="margin:0;">${courseTitle} — Dersler</h3>
          </div>
          <button class="primary-button" onclick="showLessonForm('${courseId}')">+ Yeni Ders</button>
        </div>

        <div id="lessonFormContainer"></div>

        <ul class="lesson-list">
          ${lessons.length > 0 ? lessons.map((lesson, index) => `
            <li class="lesson-item">
              <div><strong>${index + 1}.</strong></div>
              <div class="lesson-item__main">
                <label>${lesson.title}</label>
                <small>${lesson.type === 'audio' ? '🎧 Ses' : lesson.type === 'text' ? '📄 Metin' : '🎬 Video'}</small>
              </div>
              <div class="lesson-item__actions" style="display: flex; gap: 6px;">
                <button class="ghost-button" style="padding: 4px 8px;" onclick="editLesson('${courseId}', '${lesson.id}')">✏️</button>
                <button class="ghost-button danger-button" style="padding: 4px 8px;" onclick="deleteLesson('${courseId}', '${lesson.id}', '${lesson.title.replace(/'/g, "\\'")}')">🗑️</button>
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

async function showLessonForm(courseId, lessonId = null) {
  const container = document.getElementById('lessonFormContainer');
  if (!container) return;

  const lessonsRef = db.collection('courses').doc(courseId).collection('lessons');
  let lesson = {};

  if (lessonId) {
    const doc = await lessonsRef.doc(lessonId).get();
    lesson = doc.exists ? { id: doc.id, ...doc.data() } : {};
  } else {
    const snapshot = await lessonsRef.orderBy('order', 'desc').limit(1).get();
    lesson.order = snapshot.empty ? 1 : (snapshot.docs[0].data().order || 0) + 1;
    lesson.type = 'video';
  }

  container.innerHTML = `
    <div class="admin-panel" style="margin-bottom: 24px; border-color: var(--brand-teal);">
      <div class="admin-panel__head"><h3 style="margin:0;">${lessonId ? 'Dersi Düzenle' : 'Yeni Ders'}</h3></div>
      <form class="admin-form" onsubmit="event.preventDefault(); saveLesson('${courseId}', '${lessonId || ''}');">
        
        <div class="admin-form-grid">
          <label>Ders Başlığı *
            <input type="text" id="lessonTitle" value="${lesson.title || ''}" required>
          </label>
          <label>Sıra No
            <input type="number" id="lessonOrder" value="${lesson.order || 1}" min="1">
          </label>
        </div>

        <div class="admin-form-grid">
          <label>Ders Tipi
            <select id="lessonType" onchange="toggleLessonFields()">
              <option value="video" ${lesson.type === 'video' ? 'selected' : ''}>Video</option>
              <option value="text" ${lesson.type === 'text' ? 'selected' : ''}>Metin</option>
              <option value="audio" ${lesson.type === 'audio' ? 'selected' : ''}>Ses</option>
            </select>
          </label>
          <label>Süre (Dakika)
            <input type="number" id="lessonDuration" value="${lesson.durationMin || ''}" placeholder="Örn: 5">
          </label>
        </div>

        <div id="mediaFields">
          <label>Medya URL (YouTube vb.)
            <input type="url" id="lessonMediaUrl" value="${lesson.videoUrl || lesson.mediaUrl || ''}">
          </label>
        </div>

        <div id="textFields" style="display:none;">
          <div class="form-group">
            <label>Ders İçeriği (Zengin Metin Editörü) *</label>
            <div class="block-editor" style="margin-top: 8px;">
              <div class="block-editor__tools" id="lessonEditorToolbar">
                <button type="button" class="toolbar-btn" data-command="bold" title="Kalın"><b>B</b></button>
                <button type="button" class="toolbar-btn" data-command="italic" title="İtalik"><i>I</i></button>
                <button type="button" class="toolbar-btn" data-command="underline" title="Altı Çizili"><u>U</u></button>
                <span class="toolbar-divider" style="width: 1px; background: var(--line); margin: 0 4px;"></span>
                <button type="button" class="toolbar-btn" data-command="formatBlock" data-value="P" title="Normal Düz Metin">P</button>
                <button type="button" class="toolbar-btn" data-command="formatBlock" data-value="H2" title="Ana Başlık">H2</button>
                <button type="button" class="toolbar-btn" data-command="formatBlock" data-value="H3" title="Alt Başlık">H3</button>
                <span class="toolbar-divider" style="width: 1px; background: var(--line); margin: 0 4px;"></span>
                <button type="button" class="toolbar-btn" data-command="createLink" title="Link Ekle">🔗</button>
                <button type="button" class="toolbar-btn" data-command="insertImage" title="Görsel Ekle">🖼️</button>
                <button type="button" class="toolbar-btn" data-command="insertTable" title="Tablo Ekle">📊</button>
                <button type="button" class="toolbar-btn" data-command="insertCode" title="Kod Bloğu">&lt;/&gt;</button>
                <span class="toolbar-divider" style="width: 1px; background: var(--line); margin: 0 4px;"></span>
                <button type="button" class="toolbar-btn" data-command="insertCallout" title="Vurgu Kutusu">💡 Kutu</button>
                <button type="button" class="toolbar-btn" data-command="insertQuiz" title="Çoktan Seçmeli Soru">❓ Soru</button>
                <button type="button" class="toolbar-btn" data-command="insertMatching" title="Eşleştirme Modülü">🔄 Eşleştir</button>
                <button type="button" class="toolbar-btn" data-command="insertEmbed" title="PDF veya YouTube Embed">🎥 Embed</button>
              </div>
              <div class="editor-content" id="lessonContent" contenteditable="true" style="min-height: 300px; padding: 14px; background: var(--paper); border: 1px solid var(--line); border-radius: 12px; outline: none; margin-top: 8px;">${lesson.content || ''}</div>
            </div>
          </div>
        </div>

        <label class="checkbox-label" style="display: flex; gap: 8px; align-items: center; font-weight: 700;">
          <input type="checkbox" id="lessonIsFree" ${lesson.isFree ? 'checked' : ''} style="width: auto;">
          Bu ders ücretsiz önizlemeye açık olsun
        </label>

        <div class="admin-inline-actions" style="margin-top: 14px; display: flex; gap: 12px;">
          <button type="submit" class="primary-button">${lessonId ? 'Güncelle' : 'Ekle'}</button>
          <button type="button" class="ghost-button" onclick="document.getElementById('lessonFormContainer').innerHTML=''">İptal</button>
        </div>
      </form>
    </div>
  `;
  toggleLessonFields();
  
  // Ders formu için zengin metin editörünü özel ID'lerle tetikliyoruz
  setTimeout(() => {
    if (typeof setupEditor === 'function') {
      setupEditor('lessonEditorToolbar', 'lessonContent');
    }
  }, 150);
}

function toggleLessonFields() {
  const type = document.getElementById('lessonType')?.value;
  const mediaFields = document.getElementById('mediaFields');
  const textFields = document.getElementById('textFields');
  if (type === 'text') {
    if(mediaFields) mediaFields.style.display = 'none';
    if(textFields) textFields.style.display = 'block';
  } else {
    if(mediaFields) mediaFields.style.display = 'block';
    if(textFields) textFields.style.display = 'none';
  }
}

async function saveLesson(courseId, lessonId) {
  const title = document.getElementById('lessonTitle').value.trim();
  const type = document.getElementById('lessonType').value;
  
  if (!title) { alert('Ders başlığı zorunludur.'); return; }

  const lessonData = {
    courseId, title, type,
    order: parseInt(document.getElementById('lessonOrder').value) || 1,
    durationMin: parseInt(document.getElementById('lessonDuration').value) || 0,
    isFree: document.getElementById('lessonIsFree').checked,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  // saveLesson içindeki type === 'text' bloğunu bununla değiştir:
  if (type === 'text') {
    lessonData.content = document.getElementById('lessonContent').innerHTML; // .value.trim() olan kısım .innerHTML yapıldı
    lessonData.mediaUrl = '';
    lessonData.duration = 0;
  } else {
    lessonData.videoUrl = document.getElementById('lessonMediaUrl').value.trim();
    lessonData.content = '';
  }

  try {
    const lessonsRef = db.collection('courses').doc(courseId).collection('lessons');
    if (lessonId) {
      await lessonsRef.doc(lessonId).update(lessonData);
    } else {
      lessonData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await lessonsRef.add(lessonData);
    }
    
    // Toplam ders sayısını güncelle
    const snapshot = await lessonsRef.get();
    await db.collection('courses').doc(courseId).update({ lessonCount: snapshot.size });

    const courseTitle = document.querySelector('.admin-panel__head h3')?.textContent?.replace(' — Dersler', '') || 'Kurs';
    manageLessons(courseId, courseTitle);
  } catch (err) {
    alert("Ders kaydedilirken hata oluştu: " + err.message);
  }
}

async function editLesson(courseId, lessonId) {
  await showLessonForm(courseId, lessonId);
  document.getElementById('lessonFormContainer').scrollIntoView({ behavior: 'smooth' });
}

async function deleteLesson(courseId, lessonId, title) {
  if (!confirm(`"${title}" dersini silmek istediğinize emin misiniz?`)) return;
  try {
    await db.collection('courses').doc(courseId).collection('lessons').doc(lessonId).delete();
    const snapshot = await db.collection('courses').doc(courseId).collection('lessons').get();
    await db.collection('courses').doc(courseId).update({ lessonCount: snapshot.size });
    
    const courseTitle = document.querySelector('.admin-panel__head h3')?.textContent?.replace(' — Dersler', '') || 'Kurs';
    manageLessons(courseId, courseTitle);
  } catch (error) {
    alert('Ders silinirken hata: ' + error.message);
  }
}

// Görseli Cloudinary'ye yükleyip editöre URL olarak basan fonksiyon
function insertImageWithCloudinary(editor) {
  // Gizli bir dosya seçme penceresi oluştur
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', CLOUDINARY_CONFIG.allowedTypes.join(','));
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB limiti)
    if (file.size > CLOUDINARY_CONFIG.maxFileSize) {
      alert('Seçtiğiniz görsel 5MB\'dan büyük olamaz!');
      return;
    }

    // Yükleme sırasında kullanıcıya bilgi ver
    const loadingText = prompt('Görsel Cloudinary\'ye yükleniyor, lütfen bekleyin...', 'Yükleniyor...');
    if (loadingText === null) return; // İptal edilirse çık

    try {
      // Cloudinary API'sinin beklediği FormData yapısını hazırlıyoruz
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', CLOUDINARY_CONFIG.folder);

      // Cloudinary API'sine doğrudan tarayıcıdan istek atıyoruz
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Cloudinary yükleme işlemi başarısız oldu.');
      }

      const data = await response.json();
      
      // Cloudinary'den gelen güvenli, optimize edilmiş görsel linkini alıyoruz
      const downloadURL = data.secure_url;
      
      // Linki editörün içine tertemiz bir <img> etiketi olarak basıyoruz
      document.execCommand('insertImage', false, downloadURL);
      
      console.log('✅ Görsel başarıyla Cloudinary\'ye yüklendi:', downloadURL);
    } catch (error) {
      console.error('❌ Cloudinary yükleme hatası:', error);
      alert('Görsel yüklenirken bir hata oluştu.');
    }
  };
}
