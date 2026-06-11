/* ESTİ BİRAZ — About Page v2 */

function renderAboutPageV2() {
  const container = document.getElementById('app');
  if (!container) return;

  if (typeof pageMeta === 'function') {
    pageMeta(
      'Hakkında',
      'ESTİ BİRAZ; sağlık, eğitim, bilim, veri ve teknoloji alanlarında güvenilir ve anlaşılır içerikler sunan bir bilgi platformudur.'
    );
  }

  container.innerHTML = `
    <main class="about-v2">
      <section class="about-hero-v2">
        <div class="container about-hero-v2__inner">
          <div>
            <span class="about-kicker">HAKKINDA</span>
            <h1>Bilgiyi sadeleştiren, öğrenmeyi ciddiye alan bir platform.</h1>
            <p>
              ESTİ BİRAZ; sağlık, eğitim, bilim, veri ve teknoloji alanlarında
              güvenilir, anlaşılır ve uygulanabilir içerikler üretmek için tasarlandı.
            </p>
          </div>

          <aside class="about-hero-v2__card">
            <strong>Bir Yudum Bilgi, Biraz Merak.</strong>
            <span>Okumak, öğrenmek ve üretmek için editoryal bir bilgi alanı.</span>
          </aside>
        </div>
      </section>

      <section class="container about-v2__layout">
        <article class="about-v2__main">
          <span class="about-section-kicker">NEDEN ESTİ BİRAZ?</span>
          <h2>Karmaşık bilgiyi ulaşılabilir hale getirmek için.</h2>
          <p>
            Sağlık, bilim ve teknoloji gibi alanlarda bilgi çoğu zaman dağınık,
            teknik ve yorucu olabilir. ESTİ BİRAZ, bu bilgiyi sadeleştirir;
            ama yüzeyselleştirmeden, kaynaklı ve öğrenilebilir bir yapıda sunmayı hedefler.
          </p>
          <p>
            Platformun temel yaklaşımı; makaleleri, kursları ve öğrenme materyallerini
            birbirinden kopuk değil, aynı bilgi ekosisteminin parçaları olarak düşünmektir.
          </p>
        </article>

        <aside class="about-v2__side">
          <div class="about-principle">
            <strong>Kaynaklı İçerik</strong>
            <span>Bilgi, mümkün olduğunca güvenilir kaynaklarla desteklenir.</span>
          </div>
          <div class="about-principle">
            <strong>Sade Anlatım</strong>
            <span>Karmaşık konular anlaşılır ve öğrenilebilir hale getirilir.</span>
          </div>
          <div class="about-principle">
            <strong>Veri ve Bilim</strong>
            <span>Sağlık, teknoloji ve istatistik bakışı birlikte değerlendirilir.</span>
          </div>
        </aside>
      </section>

      <section class="container about-values-v2">
        <div class="about-values-v2__header">
          <span class="about-section-kicker">PLATFORM ODAKLARI</span>
          <h2>ESTİ BİRAZ ne üretir?</h2>
        </div>

        <div class="about-values-v2__grid">
          <div class="about-value-card">
            <span>01</span>
            <h3>Makaleler</h3>
            <p>Sağlık, eğitim, bilim, veri ve teknoloji alanlarında anlaşılır yazılar.</p>
            <a href="#/makaleler">Makaleleri Keşfet →</a>
          </div>
          <div class="about-value-card">
            <span>02</span>
            <h3>Akademi</h3>
            <p>Konuları adım adım ele alan kurslar ve yapılandırılmış öğrenme içerikleri.</p>
            <a href="#/akademi">Akademiye Göz At →</a>
          </div>
          <div class="about-value-card">
            <span>03</span>
            <h3>Dijital Kaynaklar</h3>
            <p>Öğrenmeyi destekleyen tablolar, rehberler, görseller ve uygulama odaklı materyaller.</p>
            <a href="#/">Ana Sayfaya Dön →</a>
          </div>
        </div>
      </section>
    </main>
  `;
}
