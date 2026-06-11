# ESTİ BİRAZ v2-clean — Admin Panel Görsel Cila Paketi

Bu paket mevcut admin işlevlerini değiştirmez; `admin.js` içindeki mevcut sınıfları kullanarak görünümü daha ferah ve okunur hale getirir.

## Dosyalar

```text
css/admin-v2-polish.css
js/shared/admin-v2-ui.js
```

## index.html

Mevcut admin CSS dosyasından sonra ekle:

```html
<link rel="stylesheet" href="css/admin.css?v=1.8">
<link rel="stylesheet" href="css/admin-v2-polish.css">
```

Mevcut `admin.js` dosyasından sonra ekle:

```html
<script src="js/admin.js"></script>
<script src="js/shared/admin-v2-ui.js"></script>
```

## Geri alma

Sorun olursa bu iki satırı kaldırman yeterlidir:

```html
<link rel="stylesheet" href="css/admin-v2-polish.css">
<script src="js/shared/admin-v2-ui.js"></script>
```

## Not

Bu paket sadece görünüm katmanıdır. Makale, kurs ve ders kaydetme/silme mantığını değiştirmez.
