# Admin Panel Temizlik Notları

## 1. `deleteArticle` iki kez tanımlanmış olabilir

`admin.js` içinde `deleteArticle` fonksiyonu iki ayrı yerde tanımlıysa JavaScript son tanımı geçerli sayar. İleride bunu tek fonksiyonda birleştirmek iyi olur.

## 2. Ders sayısı alanları

Kodda şu alanlar karışabiliyor:

```text
lessonCount
LessonCount
totalLessons
```

Önerilen uzun vadeli standart:

```text
totalLessons
```

## 3. Sonraki refactor önerisi

Admin kodu daha sonra şu şekilde parçalanabilir:

```text
js/admin/admin-articles.js
js/admin/admin-courses.js
js/admin/admin-lessons.js
js/admin/admin-utils.js
```
