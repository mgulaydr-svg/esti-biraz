# router.js — Ders Detay Route Değişikliği

## 1. Fonksiyon ekle

```js
function renderDers(courseSlug, lessonKey) {
  appContainer.innerHTML = '<main class="container"><p>Ders yükleniyor...</p></main>';

  if (typeof renderLessonDetailPageV2 === 'function') {
    renderLessonDetailPageV2(courseSlug, lessonKey);
  } else if (typeof loadLesson === 'function') {
    loadLesson(courseSlug, lessonKey);
  } else {
    appContainer.innerHTML = '<main class="container"><p>Ders yüklenemedi.</p></main>';
  }
}
```

## 2. Dynamic route kontrolü ekle

Route çözümleme fonksiyonunda, `routes[path]` kontrolünden ÖNCE şunu ekle:

```js
if (path.startsWith('/ders/')) {
  const parts = path.split('/');
  const courseSlug = decodeURIComponent(parts[2] || '');
  const lessonKey = decodeURIComponent(parts[3] || '');

  renderDers(courseSlug, lessonKey);
  return;
}
```
