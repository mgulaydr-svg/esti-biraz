# ESTİ BİRAZ v2-clean — Guardian Esintili Makaleler Sayfası

Bu paket `#/makaleler` sayfasını daha editoryal, güçlü başlıklı ve kategori filtreli bir yapıya taşır.

## 1. Dosyaları ekle / değiştir

Paket içindeki dosyaları mevcut projenin kök dizinine kopyala:

```text
js/services/article-service-v2.js
js/pages/articles-page-v2.js
css/articles-v2.css
```

`article-service-v2.js` önceki sürümün genişletilmiş halidir. Eski dosyanın üzerine yazabilirsin.

## 2. index.html içine CSS bağlantısı ekle

`css/home-v2.css` satırından sonra şunu ekle:

```html
<link rel="stylesheet" href="css/articles-v2.css">
```

## 3. index.html içine script bağlantısı ekle

Aşağıdaki script, `router.js` dosyasından ÖNCE yüklenmelidir:

```html
<script src="js/pages/articles-page-v2.js"></script>
```

Önerilen sıra:

```html
<script src="js/utils/formatters.js"></script>
<script src="js/components/article-card-v2.js"></script>
<script src="js/components/course-card-v2.js"></script>
<script src="js/services/article-service-v2.js"></script>
<script src="js/services/course-service-v2.js"></script>
<script src="js/pages/home-page-v2.js"></script>
<script src="js/pages/articles-page-v2.js"></script>

<script src="js/firestore-data.js"></script>
<script src="js/router.js"></script>
```

## 4. router.js içinde Makaleler route'unu yönlendir

`router.js` içinde `#/makaleler` veya eski `#/magazin` için çalışan fonksiyonu bul.

Örneğin `renderMagazin()` varsa içeriğini şu mantığa getir:

```js
function renderMagazin() {
  pageMeta(
    'Makaleler',
    'ESTİ BİRAZ makaleleri; sağlık, eğitim, bilim, veri ve teknoloji alanlarında güvenilir ve anlaşılır yazılar.'
  );

  if (typeof renderArticlesPageV2 === 'function') {
    renderArticlesPageV2();
  } else if (typeof loadAllArticles === 'function') {
    loadAllArticles();
  } else {
    appContainer.innerHTML = '<p>Makaleler yüklenemedi.</p>';
  }
}
```

Fonksiyonun adı farklıysa aynı mantığı kendi fonksiyonunun içine uygula.

`#/magazin` route’u silinmemeli. Eski bağlantılar için alias olarak kalmalı.

## 5. Test et

```text
#/makaleler
#/magazin
#/makale/bir-makale-slug
#/
```
