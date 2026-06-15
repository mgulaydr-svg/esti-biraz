/* ============================================
   ESTİ BİRAZ — Yeni Tasarım Editör (editor.js)
   ============================================ */

function setupEditor() {
  const toolbar = document.getElementById('editorToolbar');
  const editor = document.getElementById('articleContent');
  if (!toolbar || !editor) return;

  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
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
        if(typeof insertImageToEditor === 'function') {
           insertImageToEditor(); 
        }
        break;

      case 'formatBlock':
        document.execCommand('formatBlock', false, value);
        break;

      case 'insertBlockquote':
        const text = prompt('Alıntıyı girin:');
        const author = prompt('Kaynak/Yazar (opsiyonel):');
        if (!text) return;
        let html = `<blockquote class="content-quote">${escapeHTML(text)}`;
        if (author) html += `<cite>— ${escapeHTML(author)}</cite>`;
        html += `</blockquote><p><br></p>`;
        document.execCommand('insertHTML', false, html);
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

  editor.addEventListener('keyup', updateToolbarState);
  editor.addEventListener('mouseup', updateToolbarState);

  editor.addEventListener('paste', (e) => {
    const html = e.clipboardData.getData('text/html');
    if (html) {
      e.preventDefault();
      const clean = sanitizeHTML(html);
      document.execCommand('insertHTML', false, clean);
    }
  });
}

function updateToolbarState() {
  const toolbar = document.getElementById('editorToolbar');
  if (!toolbar) return;

  toolbar.querySelectorAll('button').forEach(btn => {
    const command = btn.dataset.command;
    if (['bold', 'italic', 'underline', 'strikeThrough'].includes(command)) {
      if(document.queryCommandState(command)) {
        btn.style.background = 'var(--paper-soft)';
      } else {
        btn.style.background = 'transparent';
      }
    }
  });
}

function insertCodeBlock() {
  const code = prompt('Kodu yapıştırın:');
  if (!code) return;

  const html = `
    <figure class="content-code">
      <figcaption>Kod Bloğu</figcaption>
      <pre><code>${escapeHTML(code)}</code></pre>
    </figure><p><br></p>
  `;
  document.execCommand('insertHTML', false, html);
}

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

  let tableHTML = `
    <figure class="content-table">
      <figcaption>Tablo Başlığı</figcaption>
      <div class="content-table__scroll">
        <table>
  `;

  tableHTML += '<thead><tr>';
  for (let j = 0; j < c; j++) tableHTML += `<th>Başlık ${j + 1}</th>`;
  tableHTML += '</tr></thead><tbody>';

  for (let i = 1; i < r; i++) {
    tableHTML += '<tr>';
    for (let j = 0; j < c; j++) tableHTML += '<td>Veri</td>';
    tableHTML += '</tr>';
  }
  tableHTML += '</tbody></table></div></figure><p><br></p>';

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

function setupSlugGenerator() {
  const titleInput = document.getElementById('articleTitle');
  const slugInput = document.getElementById('articleSlug');
  if (!titleInput || !slugInput) return;

  let slugManuallyEdited = false;
  slugInput.addEventListener('input', () => slugManuallyEdited = true);

  titleInput.addEventListener('input', () => {
    if (slugManuallyEdited) return;
    slugInput.value = titleInput.value
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  });
}