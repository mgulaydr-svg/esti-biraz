/* ESTİ BİRAZ — Course Detail Service v2 */

async function ebGetCourseBySlug(slug) {
  if (!slug) return null;

  const snapshot = await db.collection('courses')
    .where('status', '==', 'published')
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function ebGetCourseLessons(course) {
  if (!course || !course.id) return [];

  let lessons = [];

  // 1. courses/{courseId}/lessons alt koleksiyonu
  try {
    const subSnapshot = await db.collection('courses')
      .doc(course.id)
      .collection('lessons')
      .limit(80)
      .get();

    lessons = subSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn('Alt koleksiyon ders sorgusu başarısız:', error);
  }

  // 2. Top-level lessons: courseId
  if (!lessons.length) {
    try {
      const byCourseId = await db.collection('lessons')
        .where('courseId', '==', course.id)
        .limit(80)
        .get();

      lessons = byCourseId.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('courseId ile ders sorgusu başarısız:', error);
    }
  }

  // 3. Top-level lessons: courseSlug
  if (!lessons.length && course.slug) {
    try {
      const bySlug = await db.collection('lessons')
        .where('courseSlug', '==', course.slug)
        .limit(80)
        .get();

      lessons = bySlug.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('courseSlug ile ders sorgusu başarısız:', error);
    }
  }

  return lessons
    .filter(lesson => lesson && lesson.title)
    .sort((a, b) => ebGetLessonOrder(a) - ebGetLessonOrder(b));
}

function ebGetLessonOrder(lesson) {
  const value =
    lesson?.order ??
    lesson?.lessonOrder ??
    lesson?.lessonNo ??
    lesson?.sira ??
    9999;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 9999;
}

function ebGetLessonDurationLabel(lesson) {
  const duration =
    lesson?.durationMin ??
    lesson?.duration ??
    lesson?.estimatedDurationMin;

  if (!duration) return '';

  return `${duration} dk`;
}
