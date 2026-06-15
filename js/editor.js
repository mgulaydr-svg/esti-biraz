/* ============================================
   ESTİ BİRAZ — Zengin Metin Editörü v2 (editor.js)
   ============================================ */

function setupEditor() {
  const toolbar = document.getElementById('editorToolbar');
  const editor = document.getElementById('articleContent');
  if (!toolbar || !editor) return;

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
        if(typeof insertImageToEditor === 'function') insertImageToEditor();
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
      
      // 🎓 YENİ: EĞİTİM BLOKLARI
      case 'insertCallout':
        const type = prompt('Kutu Tipi (warning=kırmızı, success=yeşil, data=teal, exam=sarı):', 'warning') || 'warning';
        const title = prompt('Kutu Başlığı:');
        const text = prompt('Açıklama:');
        if(title && text) {
          document.execCommand('insertHTML', false, `<div class="content-callout content-callout--${type}"><strong>${escapeHTML(title)}</strong><p>${escapeHTML(text)}</p></div><p><br></p>`);
        }
        break;
      case 'insertQuiz':
        const q = prompt('Soru Metni:');
        const a1 = prompt('Yanlış Seçenek:');
        const a2 = prompt('Doğru Seçenek:');
        if(q && a1 && a2) {
          const html = `<div class="content-quiz"><strong>${escapeHTML(q)}</strong><div class="content-quiz__options"><button data-result="wrong">${escapeHTML(a1)}</button><button data-result="correct">${escapeHTML(a2)}</button></div></div><p><br></p>`;
          document.execCommand('insertHTML', false, html);
        }
        break;
      case 'insertMatching':
        const term1 = prompt('Terim 1:'); const desc1 = prompt('Açıklama 1:');
        const term2 = prompt('Terim 2:'); const desc2 = prompt('Açıklama 2:');
        if(term1 && term2) {
          const html = `<div class="content-matching"><h4>Eşleştirme Tablosu</h4><div class="content-matching__grid"><span>${escapeHTML(term1)}</span><strong>${escapeHTML(desc1)}</strong><span>${escapeHTML(term2)}</span><strong>${escapeHTML(desc2)}</strong></div></div><p><br></p>`;
          document.execCommand('insertHTML', false, html);
        }
        break;

      default:
        document.execCommand(command, false, value);
    }
    editor.focus();
    updateToolbarState();
  });

  editor.addEventListener('keyup', updateToolbarState);
  editor.addEventListener('mouseup', updateToolbarState);

  // 🖼️ YENİ: SÜRÜKLE BIRAK İLE OTOMATİK CLOUDINARY YÜKLEME
  editor.addEventListener('drop', async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleEditorImageUpload(file);
    }
  });

  // 🖼️ YENİ: CTRL+V İLE OTOMATİK CLOUDINARY YÜKLEME
  editor.addEventListener('paste', async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let hasImage = false;
    
    for (let item of items) {
      if (item.type.indexOf('image/') === 0) {
        e.preventDefault();
        hasImage = true;
        const file = item.getAsFile();
        await handleEditorImageUpload(file);
        break; 
      }
    }
    
    // Eğer resim yoksa normal metni temizleyerek yapıştır
    if (!hasImage) {
      const html = e.clipboardData.getData('text/html');
      if (html) {
        e.preventDefault();
        const clean = sanitizeHTML(html);
        document.execCommand('insertHTML', false, clean);
      }
    }
  });
}

/**
 * Editör içine resim yükleme ana fonksiyonu
 */
async function handleEditorImageUpload(file) {
  const placeholderId = 'img-load-' + Date.now();
  document.execCommand('insertHTML', false, `<div id="${placeholderId}" style="color:var(--brand-teal); font-weight:800; padding:10px; border:1px dashed var(--brand-teal); background:var(--paper-soft);">⏳ Görsel yükleniyor... Lütfen bekleyin.</div><p><br></p>`);
  
  try {
    const result = await uploadToCloudinary(file);
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) {
      placeholder.outerHTML = `<figure class="content-image"><img src="${result.url}" alt="Yüklenen Görsel" style="border-radius:14px; width:100%;"></figure>`;
    }
  } catch (err) {
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) placeholder.outerHTML = `<p style="color:red;">❌ Görsel yüklenemedi: ${err.message}</p>`;
  }
}

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

function insertCodeBlock() {
  const code = prompt('Kodu yapıştırın:');
  if (!code) return;
  const html = `<div class="content-code"><pre><code>${escapeHTML(code)}</code></pre></div><p><br></p>`;
  document.execCommand('insertHTML', false, html);
}

function insertTable() {
  const rows = parseInt(prompt('Satır sayısı:', '3'));
  const cols = parseInt(prompt('Sütun sayısı:', '3'));
  if (!rows || !cols) return;

  let tableHTML = '<div class="content-table"><div class="content-table__scroll"><table><thead><tr>';
  for (let j = 0; j < cols; j++) tableHTML += `<th>Başlık ${j + 1}</th>`;
  tableHTML += '</tr></thead><tbody>';
  for (let i = 1; i < rows; i++) {
    tableHTML += '<tr>';
    for (let j = 0; j < cols; j++) tableHTML += '<td>Veri</td>';
    tableHTML += '</tr>';
  }
  tableHTML += '</tbody></table></div></div><p><br></p>';
  document.execCommand('insertHTML', false, tableHTML);
}

function sanitizeHTML(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  temp.querySelectorAll('script, style, iframe, object, embed').forEach(el => el.remove());
  temp.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
    });
  });
  return temp.innerHTML;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

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

function setupSlugGenerator() {
  const titleInput = document.getElementById('articleTitle');
  const slugInput = document.getElementById('articleSlug');
  if (!titleInput || !slugInput) return;
  let slugManuallyEdited = false;
  slugInput.addEventListener('input', () => slugManuallyEdited = true);
  titleInput.addEventListener('input', () => {
    if (slugManuallyEdited) return;
    slugInput.value = titleInput.value.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  });
}
