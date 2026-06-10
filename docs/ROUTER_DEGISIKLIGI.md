# router.js değişikliği

`router.js` içinde mevcut `renderHome()` fonksiyonunu şu kodla değiştir:

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
