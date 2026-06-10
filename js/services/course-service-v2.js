/* ESTİ BİRAZ — Course Service v2 */

async function ebGetFeaturedCourses(limit = 3) {
  const snapshot = await db.collection('courses')
    .where('featured', '==', true)
    .limit(limit)
    .get();

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(course => course && course.title);
}
