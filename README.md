# ESTİ BİRAZ

**ESTİ BİRAZ**, sağlık, bilim, eğitim ve kültür alanlarında güvenilir makaleler ile çevrim içi öğrenme içeriklerini bir araya getiren Türkçe bir dijital yayın ve akademi platformudur.

## Amaç

Bu proje, yalnızca bir blog değil; makale, kurs, ders, kullanıcı profili, yorum, beğeni ve içerik yönetimi özellikleriyle geliştirilen küçük ölçekli bir öğrenme platformudur.

## Ana Bölümler

- **Ana Sayfa:** Platform tanıtımı, son makaleler ve öne çıkan kurslar
- **Makaleler:** Sağlık, bilim, eğitim, teknoloji, yaşam ve kültür yazıları
- **Akademi:** Kurslar, dersler ve öğrenme içerikleri
- **Profil:** Kullanıcı kayıtları ve öğrenme ilerlemesi
- **Admin Paneli:** Makale ve kurs yönetimi

## Kullanılan Teknolojiler

- HTML5
- CSS3
- Vanilla JavaScript
- Firebase Authentication
- Cloud Firestore
- GitHub Pages

## Önerilen İçerik Modeli

### Makale

```js
articles/{articleId} = {
  title: string,
  slug: string,
  summary: string,
  content: string,
  category: string,
  tags: string[],
  author: string,
  coverImage: string,
  status: "draft" | "published",
  createdAt: timestamp,
  updatedAt: timestamp,
  publishedAt: timestamp
}
```

### Kurs

```js
courses/{courseId} = {
  title: string,
  slug: string,
  summary: string,
  description: string,
  category: string,
  level: "baslangic" | "orta" | "ileri",
  instructor: string,
  targetAudience: string,
  learningOutcomes: string[],
  prerequisites: string[],
  featured: boolean,
  status: "draft" | "published",
  coverImage: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  publishedAt: timestamp
}
```

### Ders

```js
courses/{courseId}/lessons/{lessonId} = {
  title: string,
  order: number,
  type: "text" | "video" | "audio" | "quiz",
  content: string,
  mediaUrl: string,
  durationMin: number,
  isFree: boolean,
  learningObjective: string,
  resources: []
}
```

## Güvenlik Notu

Admin panelini yalnızca arayüzde gizlemek yeterli değildir. Firestore erişim yetkileri mutlaka `firestore.rules` dosyasındaki gibi güvenlik kurallarıyla sınırlandırılmalıdır.

## Repo Bilgisi İçin Öneri

**Description:**

> Sağlık, bilim, eğitim ve kültür alanlarında makale ve çevrim içi öğrenme içerikleri sunan Firebase tabanlı web platformu.

**Topics:**

```text
education, health, science, articles, academy, firebase, firestore, github-pages, turkish, learning-platform
```
