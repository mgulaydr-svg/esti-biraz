# ESTİ BİRAZ v2-clean — Ana Sayfa Modülü Kurulumu

Bu paket mevcut projeyi tamamen silmez. Sadece ana sayfa tarafını daha temiz bir yapıya taşımak için hazırlanmıştır.

## 1. Dosyaları ekle

Paket içindeki şu klasörleri mevcut projenin kök dizinine kopyala:

```text
js/components/
js/pages/
js/services/
js/utils/
css/home-v2.css
```

Mevcut dosyaları silmeden ekle.

## 2. index.html içine CSS bağlantısı ekle

`css/main.css` satırından sonra şunu ekle:

```html
<link rel="stylesheet" href="css/home-v2.css">
```

## 3. index.html içinde script sırasını kontrol et

Aşağıdaki dosyalar `router.js` dosyasından ÖNCE yüklenmeli:

```html
<script src="js/utils/formatters.js"></script>
<script src="js/components/article-card-v2.js"></script>
<script src="js/components/course-card-v2.js"></script>
<script src="js/services/article-service-v2.js"></script>
<script src="js/services/course-service-v2.js"></script>
<script src="js/pages/home-page-v2.js"></script>
```

Örnek sıra:

```html
<script src="js/firebase-config.js"></script>
<script src="js/auth.js"></script>
<script src="js/seo.js"></script>

<script src="js/utils/formatters.js"></script>
<script src="js/components/article-card-v2.js"></script>
<script src="js/components/course-card-v2.js"></script>
<script src="js/services/article-service-v2.js"></script>
<script src="js/services/course-service-v2.js"></script>
<script src="js/pages/home-page-v2.js"></script>

<script src="js/firestore-data.js"></script>
<script src="js/router.js"></script>
```

`firestore-data.js` şimdilik kalabilir. Makaleler, makale detayı, akademi ve admin tarafı hâlâ oradan çalışmaya devam eder.

## 4. router.js içinde ana sayfa route'unu değiştir

`router.js` içinde `renderHome()` fonksiyonunu bul. İçeriğini aşağıdaki hale getir:

```js
function renderHome() {
  pageMeta(
    'Ana Sayfa',
    'ESTİ BİRAZ; sağlık, eğitim, bilim, veri ve teknoloji alanlarında makaleler ve öğrenme içerikleri sunar.'
  );

  if (typeof renderHomePageV2 === 'function') {
    renderHomePageV2();
  } else if (typeof loadLatestArticles === 'function') {
    loadLatestArticles();
  } else {
    appContainer.innerHTML = '<p>Ana sayfa yüklenemedi.</p>';
  }
}
```

Bu değişiklikten sonra ana sayfa yeni modülden çalışır. Diğer sayfalar eski sistemle çalışmaya devam eder.

## 5. Test et

```text
#/              → yeni ana sayfa
#/makaleler     → mevcut makaleler sayfası
#/makale/...    → mevcut makale detayı
#/akademi       → mevcut akademi sayfası
#/admin         → mevcut admin paneli
```

## 6. Sorun olursa geri alma

Sadece `router.js` içindeki `renderHome()` fonksiyonunu eski haline döndürmen yeterlidir. Eklenen dosyalar diğer sayfaları bozmaz.
