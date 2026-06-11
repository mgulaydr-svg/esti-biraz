/* ESTİ BİRAZ — Not Found Page v2 */

function renderNotFoundPageV2() {
  const container = document.getElementById('app');
  if (!container) return;

  if (typeof pageMeta === 'function') {
    pageMeta(
      'Sayfa Bulunamadı',
      'Aradığınız sayfa bulunamadı. ESTİ BİRAZ ana sayfasına veya makaleler bölümüne dönebilirsiniz.'
    );
  }

  container.innerHTML = `
    <section class="not-found-v2">
      <div class="container not-found-v2__inner">
        <span class="not-found-v2__code">404</span>

        <h1>Bu sayfa yolunu kaybetmiş olabilir.</h1>

        <p>
          Aradığınız bağlantı değişmiş, kaldırılmış veya henüz yayına alınmamış olabilir.
          Ana sayfaya dönebilir ya da makaleler ve akademi bölümlerini keşfedebilirsiniz.
        </p>

        <div class="not-found-v2__actions">
          <a href="#/" class="not-found-v2__primary">Ana Sayfaya Dön</a>
          <a href="#/makaleler" class="not-found-v2__secondary">Makaleleri Keşfet</a>
          <a href="#/akademi" class="not-found-v2__secondary">Akademiye Göz At</a>
        </div>
      </div>
    </section>
  `;
}
