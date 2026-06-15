# ESTİ BİRAZ — Sağlık, Bilim ve Eğitim Platformu (v1.1-Final)

Bu proje, sağlık meslek liseleri, halk sağlığı eğitim modülleri, dijital sürveyans göstergeleri ve interaktif eğitim materyallerini (Örn: *Enfeksiyon Zincirini Kır!* kart oyunu dijital eşliği) barındıran, yüksek performanslı ve sadeleştirilmiş bir **Single Page Application (SPA)** platformudur.

Eski versiyondaki karmaşık yapı, 23 farklı CSS stil dosyası ve mükerrer JavaScript fonksiyonları tamamen ayıklanarak projenin performansı ve güvenliği maksimum düzeye ulaştırılmıştır.

---

## 🛠️ Teknolojik Altyapı & Mimari

- **Ön Yüz (Frontend):** Vanilla JavaScript (ES6+), Reaktif SPA Router, CSS3 Değişkenleri ile Güçlendirilmiş Modüler Tek Parça Tasarım Sistemi (`css/styles.css`).
- **Veri Tabanı & Kimlik Doğrulama:** Firebase Auth & Google Sign-In, Firebase Firestore (BIST piyasa takipleri, ders tamamlama metrikleri ve makale yapısı için optimize edilmiş NoSQL şeması).
- **Medya Yönetimi:** Cloudinary API (Görsel ve ses dosyası yüklemeleri için unsigned entegrasyon).

---

## 📂 Dosya Yapısı ve Görev Dağılımları

Kod çıkışı
Files written successfully.

```micro
├── index.html                  # Uygulamanın tek giriş noktası (Hafifletilmiş Masthead & Navigasyon)
├── css/
│   └── styles.css              # 23 dosyanın birleştirildiği tek parça merkezî tasarım sistemi
├── js/
│   ├── firebase-config.js      # Firebase projesi başlatma parametreleri
│   ├── cloudinary-config.js    # Cloudinary bulut ve preset ayarları
│   ├── auth.js                 # Kimlik doğrulama, kullanıcı profili ve rol tabanlı yetki yönetimi
│   ├── seo.js                  # Dinamik meta etiketleri ve SEO yapılandırılmış veri (Structured Data) motoru
│   ├── router.js               # İçiçe gömülü akıllı 404 mekanizmasına sahip SPA sayfa yönlendiricisi
│   ├── image-upload.js         # Cloudinary sürükle-bırak destekli kapak resmi yükleme yöneticisi
│   ├── editor.js               # Sağlık eğitim modüllerine özel callout/kutu destekli zengin metin editörü
│   ├── admin.js                # Makale, kurs ve müfredat hiyerarşisi için CRUD yönetim paneli
│   └── firestore-data.js       # Asimetrik ana sayfa yerleşimi ve reaktif ders oynatıcısı veri çekme motoru
└── firestore.rules             # Veri sızıntılarını ve yetki yükseltmelerini önleyen güvenlik kuralları