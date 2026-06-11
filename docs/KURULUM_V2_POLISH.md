# ESTİ BİRAZ v2-clean — Genel Cila ve Erişilebilirlik Paketi

Bu paket yeni v2 sayfalarını bozmadan genel görünüm, erişilebilirlik ve küçük kullanıcı deneyimi iyileştirmeleri ekler.

Bu paket zorunlu değildir; ama ana sayfa, makaleler, makale detay, akademi, kurs detay ve ders detay sayfaları tamamlandıktan sonra genel kaliteyi artırır.

## 1. Dosyaları ekle

Paket içindeki dosyaları mevcut projenin kök dizinine kopyala:

```text
css/v2-polish.css
js/shared/v2-ui.js
js/pages/not-found-page-v2.js
```

## 2. index.html içine CSS bağlantısı ekle

Tüm v2 CSS dosyalarından sonra şunu ekle:

```html
<link rel="stylesheet" href="css/v2-polish.css">
```

Önerilen sıra:

```html
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/home-v2.css">
<link rel="stylesheet" href="css/articles-v2.css">
<link rel="stylesheet" href="css/article-detail-v2.css">
<link rel="stylesheet" href="css/academy-v2.css">
<link rel="stylesheet" href="css/course-detail-v2.css">
<link rel="stylesheet" href="css/lesson-detail-v2.css">
<link rel="stylesheet" href="css/v2-polish.css">
```

## 3. index.html içine script bağlantıları ekle

`router.js` dosyasından ÖNCE:

```html
<script src="js/pages/not-found-page-v2.js"></script>
```

`router.js` ve `js/shared/ui.js` dosyalarından SONRA:

```html
<script src="js/shared/v2-ui.js"></script>
```

Önerilen en alt sıra:

```html
<script src="js/firestore-data.js"></script>
<script src="js/router.js"></script>
<script src="js/shared/ui.js"></script>
<script src="js/shared/v2-ui.js"></script>
```

## 4. router.js içinde 404 sayfasını istersen yeni görünüme bağla

Router'da bilinmeyen sayfa için şuna benzer bir kod varsa:

```js
appContainer.innerHTML = '<main class="container"><h1>404</h1><p>Sayfa bulunamadı.</p></main>';
```

Bunu şu güvenli yapıya çevirebilirsin:

```js
if (typeof renderNotFoundPageV2 === 'function') {
  renderNotFoundPageV2();
} else {
  appContainer.innerHTML = '<main class="container"><h1>404</h1><p>Sayfa bulunamadı.</p></main>';
}
```

## 5. Bu paket neyi iyileştirir?

```text
- Klavye odak görünümü
- Seçili metin rengi
- Mobil taşma sorunları
- Düğme ve link geçişleri
- Route’a göre body class ekleme
- Aktif menü bağlantısını belirginleştirme
- Kurs içindeki sayfa içi kaydırma offset’i
- Print / yazdırma görünümü
- Daha şık 404 sayfası
```
