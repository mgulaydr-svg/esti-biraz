# router.js — Makaleler route değişikliği

`router.js` içinde makaleler sayfasını açan fonksiyonu bul. Büyük ihtimalle şu adlardan biridir:

```js
renderMagazin()
renderArticles()
renderMakaleler()
```

Fonksiyonun içeriğini şu mantığa getir:

```js
function renderMagazin() {
  pageMeta(
    'Makaleler',
    'ESTİ BİRAZ makaleleri; sağlık, eğitim, bilim, veri ve teknoloji alanlarında güvenilir ve anlaşılır yazılar.'
  );

  if (typeof renderArticlesPageV2 === 'function') {
    renderArticlesPageV2();
  } else if (typeof loadAllArticles === 'function') {
    loadAllArticles();
  } else {
    appContainer.innerHTML = '<p>Makaleler yüklenemedi.</p>';
  }
}
```

`#/magazin` route’u silinmemeli. Eski bağlantılar için alias olarak kalmalı.
