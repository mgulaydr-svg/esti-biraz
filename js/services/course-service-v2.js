/* ESTİ BİRAZ — Course Service v2
   Ana sayfa için güvenli kurs servisi.
*/

async function ebGetFeaturedCourses(limit = 3) {
  const snapshot = await db.collection('courses')
    .where('status', '==', 'published')
    .limit(40)
    .get();

  const courses = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(course => course && course.title)
    .sort((a, b) => ebGetCourseDateValue(b) - ebGetCourseDateValue(a));

  const featuredCourses = courses.filter(course => course.featured === true);

  if (featuredCourses.length > 0) {
    return featuredCourses.slice(0, limit);
  }

  return courses.slice(0, limit);
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
