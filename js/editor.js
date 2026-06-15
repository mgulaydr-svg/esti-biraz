/* ============================================
   ESTİ BİRAZ — Zengin Metin Editörü v2 (editor.js)
   ============================================ */

function setupEditor(toolbarId = 'editorToolbar', contentId = 'articleContent') {
  const toolbar = document.getElementById(toolbarId);
  const editor = document.getElementById(contentId);
  if (!toolbar || !editor) return;

  // Tüm buton dinleyicileri
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
        if(typeof insertImageToEditor === 'function') insertImageToEditor(editor); 
        break;
      case 'insertEmbed':
        const embedUrl = prompt('YouTube Video veya PDF linki girin:');
        if (embedUrl) {
          let html = '';
          if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
             const ytMatch = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
             if (ytMatch) html = `<figure class="content-embed content-embed--video"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" allowfullscreen></iframe><figcaption>Video</figcaption></figure><p><br></p>`;
          } else if (embedUrl.endsWith('.pdf')) {
             html = `<figure class="content-embed content-embed--pdf"><iframe src="${embedUrl}" width="100%" height="600px"></iframe><figcaption>PDF Dokümanı</figcaption></figure><p><br></p>`;
          }
          if(html) document.execCommand('insertHTML', false, html);
        }
        break;
      case 'formatBlock':
        document.execCommand('formatBlock', false, value);
        break;
      default:
        document.execCommand(command, false, value);
    }
    editor.focus();
  });

  // Resim/Obje silme desteği (Backspace & Delete)
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // Eğer imleç bir figure (resim/video) içindeyse onu tamamen sil
        const figure = range.commonAncestorContainer.nodeType === 1 
          ? range.commonAncestorContainer.closest('figure') 
          : range.commonAncestorContainer.parentElement.closest('figure');
        
        if (figure) {
          figure.remove();
          e.preventDefault();
        }
      }
    }
  });

  // Sürükle Bırak (Resimler İçin)
  editor.addEventListener('drop', async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleEditorImageUpload(file, editor);
    }
  });
}

// Editöre resim yükleme ana fonksiyonu
async function handleEditorImageUpload(file, editor) {
  const placeholderId = 'img-load-' + Date.now();
  document.execCommand('insertHTML', false, `<div id="${placeholderId}" style="color:var(--brand-teal); font-weight:800; padding:10px; border:1px dashed var(--brand-teal);">⏳ Görsel yükleniyor...</div><p><br></p>`);
  
  try {
    const result = await uploadToCloudinary(file);
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) {
      placeholder.outerHTML = `<figure class="content-image"><img src="${result.url}" alt="Yüklenen Görsel" style="border-radius:14px; width:100%;"><figcaption>Görsel Açıklaması</figcaption></figure>`;
    }
  } catch (err) {
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) placeholder.outerHTML = `<p style="color:red;">❌ Görsel yüklenemedi.</p>`;
  }
}

// Cloudinary Insert
async function insertImageToEditor(editor) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) await handleEditorImageUpload(file, editor);
  });
  fileInput.click();
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
