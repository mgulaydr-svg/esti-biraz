# router.js — 404 Sayfası v2

Router içinde bilinmeyen sayfa için çalışan bölümü bul.

Şuna benzer olabilir:

```js
renderNotFound();
```

veya:

```js
appContainer.innerHTML = '<main class="container"><h1>404</h1><p>Sayfa bulunamadı.</p></main>';
```

Güvenli kullanım:

```js
function renderNotFound() {
  if (typeof renderNotFoundPageV2 === 'function') {
    renderNotFoundPageV2();
  } else {
    appContainer.innerHTML = '<main class="container"><h1>404</h1><p>Sayfa bulunamadı.</p></main>';
  }
}
```

Eğer projede `renderNotFound()` fonksiyonu yoksa, bilinmeyen route yakalanan yere doğrudan şunu koyabilirsin:

```js
if (typeof renderNotFoundPageV2 === 'function') {
  renderNotFoundPageV2();
} else {
  appContainer.innerHTML = '<main class="container"><h1>404</h1><p>Sayfa bulunamadı.</p></main>';
}
```
