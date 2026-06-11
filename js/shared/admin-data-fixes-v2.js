/* ESTİ BİRAZ — Admin Data Fixes v2
   admin.js dosyasından sonra yüklenmelidir.
*/

(function () {
  function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function getChecked(id) {
    const el = document.getElementById(id);
    return !!(el && el.checked);
  }

  function serverTime() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  // Yeni ve güncellenen makalelerde status alanını garanti eder.
  window.saveArticleInline = async function saveArticleInlineV2(articleId) {
    const title = getValue('articleTitle');
    const slug = getValue('articleSlug');
    const category = getValue('articleCategory');
    const author = getValue('articleAuthor');
    const summary = getValue('articleSummary');
    const coverImage = getValue('articleCoverImage');
    const contentEl = document.getElementById('articleContent');
    const content = contentEl ? contentEl.innerHTML : '';
    const featured = getChecked('articleFeatured');

    if (!title || !slug || !category || !author || !summary) {
      alert('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (!content || content === '<br>') {
      alert('Makale içeriği boş olamaz.');
      return;
    }

    try {
      const articleData = {
        title,
        slug,
        category,
        author,
        summary,
        coverImage,
        content,
        featured,
        status: 'published',
        updatedAt: serverTime()
      };

      if (articleId) {
        await db.collection('articles').doc(articleId).update(articleData);
        console.log('✅ Makale güncellendi:', title);
      } else {
        articleData.createdAt = serverTime();
        articleData.publishedAt = serverTime();
        await db.collection('articles').add(articleData);
        console.log('✅ Yeni makale oluşturuldu:', title);
      }

      if (typeof hideArticleForm === 'function') hideArticleForm();
      if (typeof loadAdminArticles === 'function') loadAdminArticles();
    } catch (error) {
      console.error('❌ Makale kaydedilemedi:', error);
      alert('Makale kaydedilirken hata oluştu: ' + error.message);
    }
  };

  // Duplicate deleteArticle sorununu tek güvenli fonksiyonla bastırır.
  window.deleteArticle = async function deleteArticleV2(articleId, title = '') {
    const label = title ? `"${title}" makalesini` : 'Bu makaleyi';
    if (!confirm(`${label} silmek istediğinize emin misiniz?`)) return;

    try {
      const batch = db.batch();

      try {
        const commentsSnapshot = await db.collection('comments')
          .where('articleId', '==', articleId)
          .get();

        commentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      } catch (error) {
        console.warn('Yorumlar silinemedi veya bulunamadı:', error);
      }

      try {
        const likesSnapshot = await db.collection('likes')
          .where('articleId', '==', articleId)
          .get();

        likesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      } catch (error) {
        console.warn('Beğeniler silinemedi veya bulunamadı:', error);
      }

      batch.delete(db.collection('articles').doc(articleId));
      batch.delete(db.collection('articleStats').doc(articleId));

      await batch.commit();

      console.log('✅ Makale silindi:', articleId);
      if (typeof loadAdminArticles === 'function') loadAdminArticles();
    } catch (error) {
      console.error('❌ Makale silinemedi:', error);
      alert('Makale silinirken hata oluştu: ' + error.message);
    }
  };

  // Yeni kurslarda ders sayısı alanlarını senkron başlatır.
  window.saveCourse = async function saveCourseV2(courseId) {
    const title = getValue('courseTitle');
    const slug = getValue('courseSlug');
    const description = getValue('courseDescription');
    const category = getValue('courseCategory');
    const status = getValue('courseStatus') || 'draft';
    const coverImage = getValue('courseCoverImage');
    const featured = getChecked('courseFeatured');
    const level = getValue('courseLevel');
    const instructor = getValue('courseInstructor');

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
        level,
        instructor,
        updatedAt: serverTime()
      };

      if (status === 'published') {
        courseData.publishedAt = serverTime();
      }

      if (courseId) {
        await db.collection('courses').doc(courseId).update(courseData);
        console.log('✅ Kurs güncellendi:', title);
      } else {
        courseData.createdAt = serverTime();
        courseData.createdBy = firebase.auth().currentUser?.uid || null;
        courseData.lessonCount = 0;
        courseData.totalLessons = 0;
        courseData.LessonCount = 0;
        await db.collection('courses').add(courseData);
        console.log('✅ Yeni kurs oluşturuldu:', title);
      }

      if (typeof hideCourseForm === 'function') hideCourseForm();
      if (typeof loadAdminCourses === 'function') loadAdminCourses();
    } catch (error) {
      console.error('❌ Kurs kaydedilemedi:', error);
      alert('Kurs kaydedilirken hata oluştu: ' + error.message);
    }
  };

  // Ders sayısını tek noktadan üç alanla senkron tutar.
  window.updateCourseLessonCount = async function updateCourseLessonCountV2(courseId) {
    const snapshot = await db.collection('courses')
      .doc(courseId)
      .collection('lessons')
      .get();

    const count = snapshot.size;

    await db.collection('courses').doc(courseId).update({
      lessonCount: count,
      totalLessons: count,
      LessonCount: count,
      updatedAt: serverTime()
    });

    return count;
  };

  // Mevcut makalelerde status yoksa published olarak tamamlar.
  window.ebAdminBackfillArticleStatus = async function ebAdminBackfillArticleStatus() {
    if (!confirm('Status alanı eksik makaleler published olarak güncellensin mi?')) return;

    const snapshot = await db.collection('articles').get();
    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.status) {
        batch.update(doc.ref, {
          status: 'published',
          updatedAt: serverTime()
        });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }

    alert(`${count} makale güncellendi.`);
    if (typeof loadAdminArticles === 'function') loadAdminArticles();
  };

  // Mevcut kursların ders sayılarını alt koleksiyona göre senkronlar.
  window.ebAdminSyncCourseLessonCounts = async function ebAdminSyncCourseLessonCounts() {
    if (!confirm('Tüm kursların ders sayıları yeniden hesaplansın mı?')) return;

    const coursesSnapshot = await db.collection('courses').get();
    let updated = 0;

    for (const courseDoc of coursesSnapshot.docs) {
      const lessonsSnapshot = await db.collection('courses')
        .doc(courseDoc.id)
        .collection('lessons')
        .get();

      const count = lessonsSnapshot.size;

      await db.collection('courses').doc(courseDoc.id).update({
        lessonCount: count,
        totalLessons: count,
        LessonCount: count,
        updatedAt: serverTime()
      });

      updated++;
    }

    alert(`${updated} kurs için ders sayısı senkronlandı.`);
    if (typeof loadAdminCourses === 'function') loadAdminCourses();
  };

  function injectAdminDataTools() {
    if (!document.getElementById('adminContent')) return;
    if (document.getElementById('adminDataToolsV2')) return;

    const adminContent = document.getElementById('adminContent');
    const tools = document.createElement('div');
    tools.id = 'adminDataToolsV2';
    tools.className = 'admin-data-tools-v2';
    tools.innerHTML = `
      <strong>Veri Bakımı</strong>
      <span>Yeni v2 sayfaları için status ve ders sayısı alanlarını tutarlı tutar.</span>
      <div>
        <button type="button" class="btn btn--sm btn--outline" onclick="ebAdminBackfillArticleStatus()">
          Makale Status Alanlarını Tamamla
        </button>
        <button type="button" class="btn btn--sm btn--outline" onclick="ebAdminSyncCourseLessonCounts()">
          Kurs Ders Sayılarını Senkronla
        </button>
      </div>
    `;

    adminContent.insertAdjacentElement('beforebegin', tools);
  }

  function injectDataToolsStyle() {
    if (document.getElementById('adminDataToolsV2Style')) return;

    const style = document.createElement('style');
    style.id = 'adminDataToolsV2Style';
    style.textContent = `
      .admin-data-tools-v2 {
        max-width: 1180px;
        margin: 10px auto 18px;
        padding: 16px;
        border: 1px solid rgba(0, 63, 58, 0.12);
        border-left: 5px solid #006d9e;
        border-radius: 16px;
        background: #ffffff;
        box-shadow: 0 10px 24px rgba(0, 63, 58, 0.05);
      }

      .admin-data-tools-v2 strong {
        display: block;
        margin-bottom: 4px;
        color: #003f3a;
      }

      .admin-data-tools-v2 span {
        display: block;
        margin-bottom: 12px;
        color: #5f7471;
        font-size: 0.9rem;
      }

      .admin-data-tools-v2 div {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    `;

    document.head.appendChild(style);
  }

  function initAdminDataFixes() {
    injectDataToolsStyle();
    injectAdminDataTools();
  }

  document.addEventListener('DOMContentLoaded', initAdminDataFixes);
  window.addEventListener('hashchange', () => setTimeout(initAdminDataFixes, 120));

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (!app) return;

    const observer = new MutationObserver(() => {
      clearTimeout(window.__ebAdminDataFixTimer);
      window.__ebAdminDataFixTimer = setTimeout(initAdminDataFixes, 120);
    });

    observer.observe(app, { childList: true, subtree: true });
  });
})();
