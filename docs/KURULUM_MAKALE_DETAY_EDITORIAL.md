# ESTİ BİRAZ v2-clean — Editoryal Makale Detay Sayfası

Bu paket `#/makale/:slug` sayfasını daha okunabilir, editoryal ve Guardian esintili bir makale detay görünümüne taşır.

## 1. Dosyaları ekle

```text
js/services/article-detail-service-v2.js
js/pages/article-detail-page-v2.js
css/article-detail-v2.css
```

## 2. index.html içine CSS bağlantısı ekle

```html
<link rel="stylesheet" href="css/article-detail-v2.css">
```

Bunu `css/articles-v2.css` satırından sonra ekle.

## 3. index.html içine script bağlantısı ekle

Aşağıdaki scriptler `router.js` dosyasından ÖNCE yüklenmelidir:

```html
<script src="js/services/article-detail-service-v2.js"></script>
<script src="js/pages/article-detail-page-v2.js"></script>
```

Önerilen sıra:

```html
<script src="js/utils/formatters.js"></script>
<script src="js/components/article-card-v2.js"></script>
<script src="js/components/course-card-v2.js"></script>
<script src="js/services/article-service-v2.js"></script>
<script src="js/services/course-service-v2.js"></script>
<script src="js/services/article-detail-service-v2.js"></script>
<script src="js/pages/home-page-v2.js"></script>
<script src="js/pages/articles-page-v2.js"></script>
<script src="js/pages/article-detail-page-v2.js"></script>

<script src="js/firestore-data.js"></script>
<script src="js/router.js"></script>
```

## 4. router.js içinde makale detay route'unu yönlendir

Router dosyasında `#/makale/:slug` yakalayan bölümü bul. Şuna benzer olabilir:

```js
if (path.startsWith('/makale/')) {
  const slug = path.split('/')[2];
  loadArticle(slug);
  return;
}
```

Bunu şu hale getir:

```js
if (path.startsWith('/makale/')) {
  const slug = decodeURIComponent(path.split('/')[2] || '');

  if (typeof renderArticleDetailPageV2 === 'function') {
    renderArticleDetailPageV2(slug);
  } else if (typeof loadArticle === 'function') {
    loadArticle(slug);
  } else {
    appContainer.innerHTML = '<p>Makale yüklenemedi.</p>';
  }

  return;
}
```

## 5. Test

```text
#/makaleler
#/makale/mevcut-bir-slug
```
