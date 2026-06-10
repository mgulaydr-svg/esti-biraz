# ESTİ BİRAZ v2-clean — Akademi Sayfası

Bu paket `#/akademi` sayfasını daha düzenli, eğitim platformu hissi veren ve filtreli bir yapıya taşır.

## 1. Dosyaları ekle / değiştir

Paket içindeki dosyaları mevcut projenin kök dizinine kopyala:

```text
js/services/course-service-v2.js
js/pages/academy-page-v2.js
css/academy-v2.css
```

`course-service-v2.js` önceki sürümün genişletilmiş ve güvenli halidir. Eski dosyanın üzerine yazabilirsin.

## 2. index.html içine CSS bağlantısı ekle

`css/article-detail-v2.css` satırından sonra şunu ekle:

```html
<link rel="stylesheet" href="css/academy-v2.css">
```

## 3. index.html içine script bağlantısı ekle

Aşağıdaki script `router.js` dosyasından ÖNCE yüklenmelidir:

```html
<script src="js/pages/academy-page-v2.js"></script>
```

Önerilen sıra:

```html
<script src="js/services/course-service-v2.js"></script>
<script src="js/pages/home-page-v2.js"></script>
<script src="js/pages/articles-page-v2.js"></script>
<script src="js/pages/article-detail-page-v2.js"></script>
<script src="js/pages/academy-page-v2.js"></script>

<script src="js/firestore-data.js"></script>
<script src="js/router.js"></script>
```

## 4. router.js içinde Akademi route'unu yönlendir

`router.js` içinde `renderAkademi()` fonksiyonunu bul. Şuna benzer olabilir:

```js
function renderAkademi() {
  pageMeta('Akademi', '...');
  loadCourses();
}
```

Bunu şu güvenli yapıya çevir:

```js
function renderAkademi() {
  pageMeta(
    'Akademi',
    'ESTİ BİRAZ Akademi; sağlık, eğitim, bilim, veri ve teknoloji alanlarında yapılandırılmış öğrenme içerikleri.'
  );

  if (typeof renderAcademyPageV2 === 'function') {
    renderAcademyPageV2();
  } else if (typeof loadCourses === 'function') {
    loadCourses();
  } else if (typeof loadAcademy === 'function') {
    loadAcademy();
  } else {
    appContainer.innerHTML = '<p>Akademi sayfası yüklenemedi.</p>';
  }
}
```

## 5. Test

```text
#/akademi
#/
#/makaleler
```

## 6. Not

Bu paket kurs detay sayfasını değiştirmez. Kurs kartlarına tıklayınca mevcut `#/kurs/:slug` sistemi çalışmaya devam eder.
