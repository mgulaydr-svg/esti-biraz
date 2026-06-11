/* ESTİ BİRAZ — Lesson Detail Service v2 */

async function ebGetLessonDetail(courseSlug, lessonKey) {
  const course = await ebGetLessonCourseBySlug(courseSlug);
  if (!course) return null;

  const lessons = await ebGetLessonsForCourse(course);
  const lesson = ebFindLessonByKey(lessons, lessonKey);

  if (!lesson) {
    return { course, lesson: null, lessons };
  }

  const currentIndex = lessons.findIndex(item => item.id === lesson.id);
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1
    ? lessons[currentIndex + 1]
    : null;

  return {
    course,
    lesson,
    lessons,
    currentIndex,
    previousLesson,
    nextLesson
  };
}

async function ebGetLessonCourseBySlug(courseSlug) {
  if (!courseSlug) return null;

  const snapshot = await db.collection('courses')
    .where('status', '==', 'published')
    .where('slug', '==', courseSlug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function ebGetLessonsForCourse(course) {
  if (!course || !course.id) return [];

  let lessons = [];

  try {
    const subSnapshot = await db.collection('courses')
      .doc(course.id)
      .collection('lessons')
      .limit(100)
      .get();

    lessons = subSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn('Alt koleksiyon ders sorgusu başarısız:', error);
  }

  if (!lessons.length) {
    try {
      const byCourseId = await db.collection('lessons')
        .where('status', '==', 'published')
        .where('courseId', '==', course.id)
        .limit(100)
        .get();

      lessons = byCourseId.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('courseId ile ders sorgusu başarısız:', error);
    }
  }

  if (!lessons.length && course.slug) {
    try {
      const bySlug = await db.collection('lessons')
        .where('status', '==', 'published')
        .where('courseSlug', '==', course.slug)
        .limit(100)
        .get();

      lessons = bySlug.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('courseSlug ile ders sorgusu başarısız:', error);
    }
  }

  return lessons
    .filter(lesson => lesson && lesson.title && (!lesson.status || lesson.status === 'published'))
    .sort((a, b) => ebGetLessonOrderValue(a) - ebGetLessonOrderValue(b));
}

function ebFindLessonByKey(lessons, lessonKey) {
  if (!lessons || !lessons.length) return null;
  if (!lessonKey) return lessons[0];

  const numericKey = Number(lessonKey);

  if (Number.isFinite(numericKey)) {
    const byOrder = lessons.find(lesson => ebGetLessonOrderValue(lesson) === numericKey);
    if (byOrder) return byOrder;

    const byIndex = lessons[numericKey - 1];
    if (byIndex) return byIndex;
  }

  return lessons.find(lesson =>
    String(lesson.slug || '') === String(lessonKey) ||
    String(lesson.id || '') === String(lessonKey)
  ) || null;
}

function ebGetLessonOrderValue(lesson) {
  const value =
    lesson?.order ??
    lesson?.lessonOrder ??
    lesson?.lessonNo ??
    lesson?.sira ??
    9999;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 9999;
}

function ebGetLessonDurationLabelV2(lesson) {
  const duration =
    lesson?.durationMin ??
    lesson?.duration ??
    lesson?.estimatedDurationMin;

  if (!duration) return '';

  return `${duration} dk`;
}
