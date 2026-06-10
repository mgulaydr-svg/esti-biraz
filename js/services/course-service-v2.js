/* ESTİ BİRAZ — Course Service v2
   Ana sayfa ve Akademi sayfası için güvenli kurs servisi.
*/

async function ebGetFeaturedCourses(limit = 3) {
  const courses = await ebGetPublishedCourses(40);
  const featuredCourses = courses.filter(course => course.featured === true);

  if (featuredCourses.length > 0) {
    return featuredCourses.slice(0, limit);
  }

  return courses.slice(0, limit);
}

async function ebGetPublishedCourses(limit = 60) {
  const snapshot = await db.collection('courses')
    .where('status', '==', 'published')
    .limit(limit)
    .get();

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(course => course && course.title)
    .sort((a, b) => ebGetCourseDateValue(b) - ebGetCourseDateValue(a));
}

function ebFilterCourses(courses, filters = {}) {
  const category = filters.category || 'tum';
  const level = filters.level || 'tum';

  return courses.filter(course => {
    const categoryOk = category === 'tum' || course.category === category;
    const levelOk = level === 'tum' || course.level === level;
    return categoryOk && levelOk;
  });
}

function ebGetCourseDateValue(course) {
  const value = course?.publishedAt || course?.createdAt || course?.updatedAt;

  if (value && typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }

  if (typeof value === 'string' || value instanceof Date) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  return 0;
}

function ebGetCourseCategoriesForFilter() {
  return [
    { key: 'tum', label: 'Tümü' },
    { key: 'saglik', label: 'Sağlık' },
    { key: 'egitim', label: 'Eğitim' },
    { key: 'bilim', label: 'Bilim' },
    { key: 'veri', label: 'Veri' },
    { key: 'teknoloji', label: 'Teknoloji' },
    { key: 'kultur', label: 'Kültür' }
  ];
}

function ebGetCourseLevelsForFilter() {
  return [
    { key: 'tum', label: 'Tüm Seviyeler' },
    { key: 'baslangic', label: 'Başlangıç' },
    { key: 'orta', label: 'Orta' },
    { key: 'ileri', label: 'İleri' }
  ];
}
