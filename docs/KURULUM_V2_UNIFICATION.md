# ESTİ BİRAZ v2-clean — Bütünlük Paketi

Bu paket üç eksiği kapatır:

1. Hakkında sayfasını v2 tasarımına taşır.
2. Ana sayfayı daha editoryal / Guardian esintili hale getirir.
3. Kenar boşluğu düzeltmesini yalnızca Akademi değil, tüm v2 sayfalara yayar.

## Dosyalar

```text
js/pages/about-page-v2.js
js/pages/home-page-v2.js
css/about-v2.css
css/home-editorial-v2.css
css/v2-layout-unifier.css
```

`js/pages/home-page-v2.js` mevcut dosyanın yerine geçer.

## index.html CSS

Tüm v2 CSS dosyalarından sonra ekle:

```html
<link rel="stylesheet" href="css/about-v2.css">
<link rel="stylesheet" href="css/home-editorial-v2.css">
<link rel="stylesheet" href="css/v2-layout-unifier.css">
```

## index.html JS

`router.js` dosyasından önce ekle:

```html
<script src="js/pages/about-page-v2.js"></script>
```

`home-page-v2.js` zaten varsa, bu paketteki dosya onun üzerine yazılır.

## router.js

`renderHakkinda()` fonksiyonunu şu hale getir:

```js
function renderHakkinda() {
  if (typeof renderAboutPageV2 === 'function') {
    renderAboutPageV2();
  } else {
    appContainer.innerHTML = '<main class="container"><h1>Hakkında</h1><p>ESTİ BİRAZ hakkında.</p></main>';
  }
}
```

## Test

```text
#/
#/hakkinda
#/makaleler
#/akademi
#/kurs/halk-sagligina-giris
#/ders/halk-sagligina-giris/1
```
