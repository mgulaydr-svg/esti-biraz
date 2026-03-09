/* ============================================
   ESTİ BİRAZ — Zengin Metin Editörü v2 (editor.js)
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
        insertImageToEditor(); // ← Cloudinary entegrasyonu
        break;

      case 'formatBlock':
        document.execCommand('formatBlock', false, value);
        break;

      case 'insertBlockquote':
        document.execCommand('formatBlock', false, 'BLOCKQUOTE');
        break;

      case 'insertCode':
        insertCodeBlock();
        break;

      case 'insertTable':
        insertTable();
        break;

      case 'insertHR':
        document.execCommand('insertHorizontalRule', false, null);
        break;

      default:
        document.execCommand(command, false, value);
    }

    editor.focus();
    updateToolbarState();
  });

  // Toolbar durumunu güncelle
  editor.addEventListener('keyup', updateToolbarState);
  editor.addEventListener('mouseup', updateToolbarState);

  // Editöre yapıştırma (paste) — düz metin olarak yapıştır
  editor.addEventListener('paste', (e) => {
    // HTML yapıştırmayı koru ama script temizle
    const html = e.clipboardData.getData('text/html');
    if (html) {
      e.preventDefault();
      const clean = sanitizeHTML(html);
      document.execCommand('insertHTML', false, clean);
    }
  });

  console.log('📝 Editör v2 başlatıldı.');
}

/**
 * Toolbar butonlarının aktif durumunu günceller
 */
function updateToolbarState() {
  const toolbar = document.getElementById('editorToolbar');
  if (!toolbar) return;

  toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
    const command = btn.dataset.command;
    if (['bold', 'italic', 'underline', 'strikeThrough'].includes(command)) {
      btn.classList.toggle('active', document.queryCommandState(command));
    }
  });
}

// ══════════════════════════════════════════════
//  YENİ EDİTÖR ARAÇLARI
// ══════════════════════════════════════════════

/**
 * Kod bloğu ekler
 */
function insertCodeBlock() {
  const code = prompt('Kodu yapıştırın:');
  if (!code) return;

  const html = `<pre class="editor-code-block"><code>${escapeHTML(code)}</code></pre><p><br></p>`;
  document.execCommand('insertHTML', false, html);
}

/**
 * Basit tablo ekler
 */
function insertTable() {
  const rows = prompt('Satır sayısı:', '3');
  const cols = prompt('Sütun sayısı:', '3');

  if (!rows || !cols) return;

  const r = parseInt(rows);
  const c = parseInt(cols);

  if (isNaN(r) || isNaN(c) || r < 1 || c < 1) {
    alert('Geçersiz değer.');
    return;
  }

  let tableHTML = '<table class="editor-table">';

  // Başlık satırı
  tableHTML += '<thead><tr>';
  for (let j = 0; j < c; j++) {
    tableHTML += `<th>Başlık ${j + 1}</th>`;
  }
  tableHTML += '</tr></thead>';

  // Veri satırları
  tableHTML += '<tbody>';
  for (let i = 1; i < r; i++) {
    tableHTML += '<tr>';
    for (let j = 0; j < c; j++) {
      tableHTML += '<td>Veri</td>';
    }
    tableHTML += '</tr>';
  }
  tableHTML += '</tbody></table><p><br></p>';

  document.execCommand('insertHTML', false, tableHTML);
}

// ══════════════════════════════════════════════
//  YARDIMCI FONKSİYONLAR
// ══════════════════════════════════════════════

/**
 * HTML'i temizler (güvenlik için)
 */
function sanitizeHTML(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Script etiketlerini kaldır
  temp.querySelectorAll('script, style, iframe, object, embed').forEach(el => el.remove());

  // on* event handler'ları kaldır
  temp.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return temp.innerHTML;
}

/**
 * HTML karakterlerini escape eder
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Kapak görseli önizlemesi (URL ile)
 */
function previewCoverImage() {
  const input = document.getElementById('articleCoverImage');
  const preview = document.getElementById('imagePreview');
  if (!input || !preview) return;

  const url = input.value.trim();
  if (url) {
    preview.innerHTML = `<img src="${url}" alt="Kapak önizleme" onerror="this.parentElement.innerHTML='<span class=image-upload__placeholder>❌ Görsel yüklenemedi</span>'">`;
  } else {
    preview.innerHTML = '<span class="image-upload__placeholder">📷 Tıklayın veya sürükleyin</span>';
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