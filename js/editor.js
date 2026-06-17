/* ============================================
   ESTİ BİRAZ — Çok Amaçlı Dinamik Editör (editor.js)
   ============================================ */

/**
 * Editör araç çubuğunu parametrik olarak başlatır
 */
function setupEditor(toolbarId = 'editorToolbar', contentId = 'articleContent') {
  const toolbar = document.getElementById(toolbarId);
  const editor = document.getElementById(contentId);
  if (!toolbar || !editor) return;

  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.toolbar-btn') || e.target.closest('button');
    if (!btn || !btn.dataset.command) return;

    e.preventDefault();
    const command = btn.dataset.command;
    const value = btn.dataset.value || null;

    switch (command) {
      case 'createLink':
        const url = prompt('Link URL\'si girin:', 'https://');
        if (url) document.execCommand('createLink', false, url);
        break;

      case 'insertImage':
        insertImageToEditor(editor);
        break;

      case 'insertCode':
        insertCodeBlock(editor);
        break;

      case 'insertTable':
        insertTable(editor);
        break;

      // 🎓 EĞİTİM VE ZENGİN BLOKLAR
      case 'insertCallout':
        insertCalloutBlock(editor);
        break;

      case 'insertQuiz':
        insertQuizBlock(editor);
        break;

      case 'insertMatching':
        insertMatchingBlock(editor);
        break;

      case 'insertEmbed':
        insertEmbedBlock(editor);
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
        const figure = range.commonAncestorContainer.nodeType === 1 
          ? range.commonAncestorContainer.closest('figure, .content-callout, .content-quiz, .content-matching') 
          : range.commonAncestorContainer.parentElement.closest('figure, .content-callout, .content-quiz, .content-matching');
        
        if (figure) {
          figure.remove();
          e.preventDefault();
        }
      }
    }
  });

  // Sürükle & Bırak ile Otomatik Görsel Yükleme
  editor.addEventListener('drop', async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleEditorImageUpload(file, editor);
    }
  });

  // Görsel Kopyala + Yapıştır (Ctrl+V) Filtresi
  editor.addEventListener('paste', async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let hasImage = false;
    
    for (let item of items) {
      if (item.type.indexOf('image/') === 0) {
        e.preventDefault();
        hasImage = true;
        const file = item.getAsFile();
        await handleEditorImageUpload(file, editor);
        break; 
      }
    }
    
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

// ══════════════════════════════════════════════
//  BLOK OLUŞTURUCU FONKSİYONLAR
// ══════════════════════════════════════════════

async function handleEditorImageUpload(file, editor) {
  const placeholderId = 'img-load-' + Date.now();
  editor.focus();
  document.execCommand('insertHTML', false, `<div id="${placeholderId}" style="color:var(--brand-teal); font-weight:800; padding:10px; border:1px dashed var(--brand-teal);">⏳ Görsel yükleniyor...</div><p><br></p>`);
  
  try {
    const result = await uploadToCloudinary(file);
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) {
      placeholder.outerHTML = `<figure class="content-image"><img src="${result.url}" alt="Yüklenen Görsel" style="border-radius:14px; width:100%;"><figcaption>Görsel Açıklaması</figcaption></figure>`;
    }
  } catch (err) {
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) placeholder.outerHTML = `<p style="color:red;">❌ Görsel yüklenemedi: ${err.message}</p>`;
  }
}

function insertImageToEditor(editor) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) await handleEditorImageUpload(file, editor);
  });
  fileInput.click();
}

function insertCodeBlock(editor) {
  const code = prompt('Kodu yapıştırın:');
  if (!code) return;
  const html = `<figure class="content-code"><figcaption>Kod Bloğu</figcaption><pre><code>${escapeHTML(code)}</code></pre></figure><p><br></p>`;
  document.execCommand('insertHTML', false, html);
}

function insertTable(editor) {
  const rows = parseInt(prompt('Satır sayısı:', '3'), 10);
  const cols = parseInt(prompt('Sütun sayısı:', '3'), 10);
  if (!rows || !cols || isNaN(rows) || isNaN(cols)) return;

  // Kilitleri (contenteditable="false") kaldırdık. 
  // Sadece mobil taşkınlık koruması için content-table-wrapper div'i içine aldık.
  let tableHTML = `
    <div class="content-table-wrapper">
      <table>
        <tbody>
  `;
  for (let i = 0; i < rows; i++) {
    tableHTML += `<tr>`;
    for (let j = 0; j < cols; j++) {
      // Başlık satırı için <th>, diğerleri için <td>
      if (i === 0) {
        tableHTML += `<th>Başlık</th>`;
      } else {
        tableHTML += `<td>Veri</td>`;
      }
    }
    tableHTML += `</tr>`;
  }
  tableHTML += `</tbody></table></div><p><br></p>`;
  
  document.execCommand('insertHTML', false, tableHTML);
}
function insertCalloutBlock(editor) {
  const type = prompt('Kutu Tipi (warning = kırmızı, success = yeşil, data = petrol, exam = kehribar):', 'warning') || 'warning';
  const title = prompt('Kutu Başlığı:');
  const text = prompt('Kutu İçeriği:');
  if (!title || !text) return;

  // ALTIN KURAL UYGULANDI: Dış div'e contenteditable="false", içerideki div'e "true" verildi.
  const html = `
    <div class="content-callout content-callout--${type}" contenteditable="false" style="margin: 20px 0; display: block;">
      <strong style="display: block; margin-bottom: 8px; user-select: none;">💡 ${escapeHTML(title)}</strong>
      <div class="callout-content" contenteditable="true" style="outline: none; display: block;">
        <p style="margin: 0; padding: 0; text-indent: 0;">${escapeHTML(text)}</p>
      </div>
    </div>
    <p><br></p>
  `;
  
  document.execCommand('insertHTML', false, html.replace(/\n\s+/g, '')); // Boşlukları temizleyerek basar
}

function insertQuizBlock(editor) {
  const q = prompt('Soru Metni:');
  const a1 = prompt('A Seçeneği (Yanlış):');
  const a2 = prompt('B Seçeneği (Doğru):');
  if (!q || !a1 || !a2) return;

  const html = `<div class="content-quiz"><strong>❓ Soru: ${escapeHTML(q)}</strong><div class="content-quiz__options"><button type="button" data-result="wrong">A) ${escapeHTML(a1)}</button><button type="button" data-result="correct">B) ${escapeHTML(a2)}</button></div></div><p><br></p>`;
  document.execCommand('insertHTML', false, html);
}

function insertMatchingBlock(editor) {
  const t1 = prompt('1. Terim:'); const d1 = prompt('1. Karşılığı:');
  const t2 = prompt('2. Terim:'); const d2 = prompt('2. Karşılığı:');
  if (!t1 || !d1) return;

  const html = `<div class="content-matching"><h4>🔄 Terim Eşleştirme</h4><div class="content-matching__grid"><span>${escapeHTML(t1)}</span><strong>${escapeHTML(d1)}</strong><span>${escapeHTML(t2 || '')}</span><strong>${escapeHTML(d2 || '')}</strong></div></div><p><br></p>`;
  document.execCommand('insertHTML', false, html);
}

function insertEmbedBlock(editor) {
  const url = prompt('YouTube Video veya PDF linki girin:');
  if (!url) return;

  let html = '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) {
      html = `<figure class="content-embed content-embed--video"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" allowfullscreen></iframe><figcaption>Ders Videosu</figcaption></figure><p><br></p>`;
    }
  } else if (url.endsWith('.pdf')) {
    html = `<figure class="content-embed content-embed--pdf"><iframe src="${url}" width="100%" height="600px"></iframe><figcaption>Ders Dokümanı (PDF)</figcaption></figure><p><br></p>`;
  } else {
    alert('Geçersiz format. Sadece YouTube veya doğrudan .pdf uzantılı linkleri destekler.');
    return;
  }

  document.execCommand('insertHTML', false, html);
}

function sanitizeHTML(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  temp.querySelectorAll('script, style, iframe, object, embed').forEach(el => el.remove());
  return temp.innerHTML;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
