# router.js — Makale Detay Route Değişikliği

Router içinde şu mantıkta bir bölüm ara:

```js
if (path.startsWith('/makale/')) {
  const slug = path.split('/')[2];
  loadArticle(slug);
  return;
}
```

Bunu şu güvenli yedekli yapıya çevir:

```js
if (path.startsWith('/makale/')) {
  const slug = decodeURIComponent(path.split('/')[2] || '');

  if (typeof renderArticleDetailPageV2 === 'function') {
    renderArticleDetailPageV2(slug);
  } else if (typeof loadArticle === 'function') {
    loadArticle(slug);
  } else {
    appContainer.innerHTML = '<p>Makale yüklenemedi.</p>';
  }

  return;
}
```
