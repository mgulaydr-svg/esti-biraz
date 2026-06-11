# ESTİ BİRAZ v2-clean — Admin Veri Tutarlılığı Paketi

Bu paket admin panelinin görünümünü değil, veri kaydetme tarafındaki küçük tutarsızlıkları düzeltir.

## Ne düzeltir?

```text
1. Yeni makalelere status: "published" ekler.
2. Makale güncellerken status yoksa published olarak tamamlar.
3. deleteArticle fonksiyonunu tek ve güvenli hale getirir.
4. Yeni kurslarda lessonCount / totalLessons / LessonCount alanlarını aynı anda oluşturur.
5. Ders sayısı güncellenirken üç alanı da senkron tutar.
6. Admin paneline küçük "Veri Bakımı" kutusu ekler.
```

## Kurulum

`index.html` içinde `admin.js` dosyasından SONRA ekle:

```html
<script src="js/admin.js"></script>
<script src="js/shared/admin-data-fixes-v2.js"></script>
```

Önemli: Bu dosya `admin.js`den sonra gelmeli. Çünkü bazı admin fonksiyonlarını güvenli sürümleriyle yeniden tanımlar.

## Kullanım

Admin panelinde küçük bir "Veri Bakımı" kutusu görünür.

Oradaki butonlarla:

```text
- Makale durumlarını tamamlayabilirsin.
- Kurs ders sayılarını senkronlayabilirsin.
```

## Geri alma

Sorun olursa sadece şu satırı kaldır:

```html
<script src="js/shared/admin-data-fixes-v2.js"></script>
```
