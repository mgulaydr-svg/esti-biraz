/* ESTİ BİRAZ — Ortak Yardımcılar */

function ebFormatDate(item) {
  const value = item?.publishedAt || item?.createdAt || item?.updatedAt;

  if (value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  if (typeof value === 'string' || value instanceof Date) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  }

  return '';
}

function ebCalculateReadingTime(content = '') {
  const plainText = String(content).replace(/<[^>]+>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / 180));
}

function ebEscapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function ebGetCategoryLabel(category = 'diger') {
  if (typeof getCategoryLabel === 'function') {
    return getCategoryLabel(category);
  }

  const labels = {
    saglik: 'Sağlık',
    bilim: 'Bilim',
    egitim: 'Eğitim',
    teknoloji: 'Teknoloji',
    yasam: 'Yaşam',
    kultur: 'Kültür',
    veri: 'Veri',
    diger: 'Diğer'
  };

  return labels[category] || 'Diğer';
}
