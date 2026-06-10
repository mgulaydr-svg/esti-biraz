# ESTİ BİRAZ v2-clean — Kurs Detay Sayfası

Bu paket `#/kurs/:slug` sayfasını daha düzenli, eğitim platformu hissi veren ve v2 tasarım diliyle uyumlu bir kurs detay görünümüne taşır.

## 1. Dosyaları ekle

Paket içindeki dosyaları mevcut projenin kök dizinine kopyala:

```text
js/services/course-detail-service-v2.js
js/pages/course-detail-page-v2.js
css/course-detail-v2.css
```

## 2. index.html içine CSS bağlantısı ekle

`css/academy-v2.css` satırından sonra şunu ekle:

```html
<link rel="stylesheet" href="css/course-detail-v2.css">
```

## 3. index.html içine script bağlantısı ekle

Aşağıdaki scriptler `router.js` dosyasından ÖNCE yüklenmelidir:

```html
<script src="js/services/course-detail-service-v2.js"></script>
<script src="js/pages/course-detail-page-v2.js"></script>
```

Önerilen sıra:

```html
<script src="js/services/course-service-v2.js"></script>
<script src="js/services/course-detail-service-v2.js"></script>

<script src="js/pages/home-page-v2.js"></script>
<script src="js/pages/articles-page-v2.js"></script>
<script src="js/pages/article-detail-page-v2.js"></script>
<script src="js/pages/academy-page-v2.js"></script>
<script src="js/pages/course-detail-page-v2.js"></script>

<script src="js/firestore-data.js"></script>
<script src="js/router.js"></script>
```

## 4. router.js içinde kurs detay fonksiyonunu değiştir

`router.js` içinde büyük ihtimalle şu fonksiyon var:

```js
function renderKurs(slug) {
  appContainer.innerHTML = '<main class="container"><p>Kurs yükleniyor...</p></main>';
  if (typeof loadCourse === 'function') loadCourse(slug);
}
```

Bunu şu hale getir:

```js
function renderKurs(slug) {
  appContainer.innerHTML = '<main class="container"><p>Kurs yükleniyor...</p></main>';

  if (typeof renderCourseDetailPageV2 === 'function') {
    renderCourseDetailPageV2(slug);
  } else if (typeof loadCourse === 'function') {
    loadCourse(slug);
  } else {
    appContainer.innerHTML = '<main class="container"><p>Kurs yüklenemedi.</p></main>';
  }
}
```

Fonksiyon adı sende `renderCourse`, `renderKursDetay` veya farklıysa aynı mantığı o fonksiyona uygula.

## 5. Test

```text
#/akademi
#/kurs/mevcut-kurs-slug
```

Örnek:

```text
#/kurs/halk-sagligina-giris
```

## 6. Dersler hakkında not

Bu paket dersleri bulmak için sırasıyla şunları dener:

```text
1. courses/{courseId}/lessons alt koleksiyonu
2. lessons koleksiyonunda courseId == course.id
3. lessons koleksiyonunda courseSlug == course.slug
```

Hiç ders bulunamazsa kurs detay sayfası yine açılır; ders listesi yerine "Bu kurs için dersler yakında eklenecek." mesajı gösterilir.
