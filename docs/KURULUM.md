# Ders Tamamlama Paneli + Makale Görsel Düzeltmesi

## Dosyalar

```text
js/shared/lesson-completion-v2.js
css/lesson-completion-v2.css
css/articles-image-fix-v2.css
```

## index.html CSS

`articles-v2.css` ve `lesson-detail-v2.css` sonrasında ekle:

```html
<link rel="stylesheet" href="css/lesson-completion-v2.css">
<link rel="stylesheet" href="css/articles-image-fix-v2.css">
```

## index.html JS

`router.js`, `v2-ui.js` ve ders sayfası scriptlerinden sonra ekle:

```html
<script src="js/shared/lesson-completion-v2.js"></script>
```

## Not

Ders tamamlanma bilgisi bu geçiş paketinde localStorage ile tutulur. Sonraki adımda Firestore + kullanıcı hesabına bağlanacak.
