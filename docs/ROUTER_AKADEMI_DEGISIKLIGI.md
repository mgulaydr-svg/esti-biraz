# router.js — Akademi Route Değişikliği

`router.js` içinde `renderAkademi()` fonksiyonunu bul ve içeriğini şu hale getir:

```js
function renderAkademi() {
  pageMeta(
    'Akademi',
    'ESTİ BİRAZ Akademi; sağlık, eğitim, bilim, veri ve teknoloji alanlarında yapılandırılmış öğrenme içerikleri.'
  );

  if (typeof renderAcademyPageV2 === 'function') {
    renderAcademyPageV2();
  } else if (typeof loadCourses === 'function') {
    loadCourses();
  } else if (typeof loadAcademy === 'function') {
    loadAcademy();
  } else {
    appContainer.innerHTML = '<p>Akademi sayfası yüklenemedi.</p>';
  }
}
```
