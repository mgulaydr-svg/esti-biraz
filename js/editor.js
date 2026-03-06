/* ============================================
   ESTİ BİRAZ — Zengin Metin Editörü (editor.js)
   ============================================ */

/**
 * Editör araç çubuğunu başlatır
 */
function setupEditor() {
  const toolbar = document.getElementById('editorToolbar');
  const editor = document.getElementById('articleContent');
  if (!toolbar || !editor) return;

  // Araç çubuğu buton tıklamaları
  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.toolbar-btn');
    if (!btn) return;

    e.preventDefault();
    const command = btn.dataset.command;
    const value = btn.dataset.value || null;

    switch (command) {
      case 'createLink':
        const url = prompt('Link URL\'si girin:', 'https://');
        if (url) document.execCommand('createLink', false, url);
        break;

      case 'insertImage':
        const imgUrl = prompt('Görsel URL\'si girin:', 'https://');
        if (imgUrl) document.execCommand('insertImage', false, imgUrl);
        break;

      case 'formatBlock':
        document.execCommand('formatBlock', false, value);
        break;

      default:
        document.execCommand(command, false, value);
    }

    // Editöre odaklan
    editor.focus();
    updateToolbarState();
  });

  // Editör içinde seçim değiştiğinde toolbar durumunu güncelle
  editor.addEventListener('keyup', updateToolbarState);
  editor.addEventListener('mouseup', updateToolbarState);

  console.log('📝 Editör başlatıldı.');
}

/**
 * Toolbar butonlarının aktif durumunu günceller
 */
function updateToolbarState() {
  const toolbar = document.getElementById('editorToolbar');
  if (!toolbar) return;

  toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
    const command = btn.dataset.command;
    if (['bold', 'italic', 'underline'].includes(command)) {
      btn.classList.toggle('active', document.queryCommandState(command));
    }
  });
}

/**
 * Kapak görseli önizlemesi
 */
function previewCoverImage() {
  const input = document.getElementById('articleCoverImage');
  const preview = document.getElementById('imagePreview');
  if (!input || !preview) return;

  const url = input.value.trim();
  if (url) {
    preview.innerHTML = `<img src="${url}" alt="Kapak önizleme" onerror="this.parentElement.innerHTML='<span class=image-upload__placeholder>❌ Görsel yüklenemedi</span>'">`;
  } else {
    preview.innerHTML = '<span class="image-upload__placeholder">📷 Görsel URL\'si girin</span>';
  }
}

/**
 * Başlıktan otomatik slug oluşturur
 */
function setupSlugGenerator() {
  const titleInput = document.getElementById('articleTitle');
  const slugInput = document.getElementById('articleSlug');
  if (!titleInput || !slugInput) return;

  let slugManuallyEdited = false;

  slugInput.addEventListener('input', () => {
    slugManuallyEdited = true;
  });

  titleInput.addEventListener('input', () => {
    if (slugManuallyEdited) return;

    const slug = titleInput.value
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    slugInput.value = slug;
  });
}