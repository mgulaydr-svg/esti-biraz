# router.js — Kurs Detay Route Değişikliği

`router.js` içinde kurs detayını açan fonksiyonu bul. Büyük ihtimalle şuna benzer:

```js
function renderKurs(slug) {
  appContainer.innerHTML = '<main class="container"><p>Kurs yükleniyor...</p></main>';
  if (typeof loadCourse === 'function') loadCourse(slug);
}
```

Bunu şu güvenli yedekli yapıya çevir:

```js
function renderKurs(slug) {
  appContainer.innerHTML = '<main class="container"><p>Kurs yükleniyor...</p></main>';

  if (typeof renderCourseDetailPageV2 === 'function') {
    renderCourseDetailPageV2(slug);
  } else if (typeof loadCourse === 'function') {
    loadCourse(slug);
  } else {
    appContainer.innerHTML = '<main class="container"><p>Kurs yüklenemedi.</p></main>';
  }
}
```
