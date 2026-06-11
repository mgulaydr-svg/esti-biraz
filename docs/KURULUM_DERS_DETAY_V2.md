# ESTİ BİRAZ v2-clean — Ders Detay Sayfası

Bu paket `#/ders/:courseSlug/:lessonKey` sayfasını v2 tasarım diliyle uyumlu, okunabilir ve eğitim odaklı bir ders ekranına taşır.

Kurs detay sayfasındaki bağlantılar şu biçimde oluşturulmuştu:

```text
#/ders/halk-sagligina-giris/1
#/ders/halk-sagligina-giris/2
```

## 1. Dosyaları ekle

```text
js/services/lesson-detail-service-v2.js
js/pages/lesson-detail-page-v2.js
css/lesson-detail-v2.css
```

## 2. index.html içine CSS bağlantısı ekle

```html
<link rel="stylesheet" href="css/lesson-detail-v2.css">
```

Bu satırı `css/course-detail-v2.css` satırından sonra ekle.

## 3. index.html içine script bağlantısı ekle

Aşağıdaki scriptler `router.js` dosyasından ÖNCE yüklenmelidir:

```html
<script src="js/services/lesson-detail-service-v2.js"></script>
<script src="js/pages/lesson-detail-page-v2.js"></script>
```

Önerilen sıra:

```html
<script src="js/services/course-service-v2.js"></script>
<script src="js/services/course-detail-service-v2.js"></script>
<script src="js/services/lesson-detail-service-v2.js"></script>

<script src="js/pages/home-page-v2.js"></script>
<script src="js/pages/articles-page-v2.js"></script>
<script src="js/pages/article-detail-page-v2.js"></script>
<script src="js/pages/academy-page-v2.js"></script>
<script src="js/pages/course-detail-page-v2.js"></script>
<script src="js/pages/lesson-detail-page-v2.js"></script>

<script src="js/firestore-data.js"></script>
<script src="js/router.js"></script>
```

## 4. router.js içine ders route'u ekle

`renderKurs(slug)` fonksiyonunun yakınına şu fonksiyonu ekle:

```js
function renderDers(courseSlug, lessonKey) {
  appContainer.innerHTML = '<main class="container"><p>Ders yükleniyor...</p></main>';

  if (typeof renderLessonDetailPageV2 === 'function') {
    renderLessonDetailPageV2(courseSlug, lessonKey);
  } else if (typeof loadLesson === 'function') {
    loadLesson(courseSlug, lessonKey);
  } else {
    appContainer.innerHTML = '<main class="container"><p>Ders yüklenemedi.</p></main>';
  }
}
```

Route çözümleme bölümünde, genel `routes[path]` kontrolünden ÖNCE şunu ekle:

```js
if (path.startsWith('/ders/')) {
  const parts = path.split('/');
  const courseSlug = decodeURIComponent(parts[2] || '');
  const lessonKey = decodeURIComponent(parts[3] || '');

  renderDers(courseSlug, lessonKey);
  return;
}
```

## 5. Firestore ders yapısı

Bu paket dersleri şu kaynaklardan bulmayı dener:

```text
1. courses/{courseId}/lessons alt koleksiyonu
2. lessons koleksiyonunda courseId == course.id
3. lessons koleksiyonunda courseSlug == course.slug
```

Ders dokümanlarında şu alanlar önerilir:

```js
title: "Halk Sağlığı Nedir?"
slug: "halk-sagligi-nedir"
order: 1
summary: "Bu derste temel halk sağlığı kavramını öğrenirsiniz."
content: "<p>Ders içeriği...</p>"
durationMin: 12
status: "published"
```

## 6. Test

```text
#/akademi
#/kurs/halk-sagligina-giris
#/ders/halk-sagligina-giris/1
```
