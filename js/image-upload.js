/* ============================================
   ESTİ BİRAZ — Yeni Tasarım Görsel Yükleme
   ============================================ */

async function uploadToCloudinary(file, onProgress = null) {
  if (!CLOUDINARY_CONFIG.allowedTypes.includes(file.type)) {
    throw new Error(`Desteklenmeyen dosya tipi: ${file.type}. İzin verilenler: JPEG, PNG, WebP, GIF`);
  }

  if (file.size > CLOUDINARY_CONFIG.maxFileSize) {
    const maxMB = CLOUDINARY_CONFIG.maxFileSize / (1024 * 1024);
    throw new Error(`Dosya çok büyük. Maksimum: ${maxMB}MB`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', CLOUDINARY_CONFIG.folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.secure_url,
          publicId: response.public_id,
          width: response.width,
          height: response.height,
          format: response.format,
          size: response.bytes
        });
      } else {
        reject(new Error('Yükleme başarısız: ' + xhr.statusText));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Ağ hatası')));
    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
}

function setupCoverImageUpload() {
  const uploadArea = document.getElementById('imageUploadArea');
  const preview = document.getElementById('imagePreview');
  const urlInput = document.getElementById('articleCoverImage');
  if (!uploadArea || !preview || !urlInput) return;

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  uploadArea.appendChild(fileInput);

  preview.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await handleCoverImageUpload(file, preview, urlInput);
  });

  preview.addEventListener('dragover', (e) => {
    e.preventDefault();
    preview.style.borderColor = 'var(--brand-teal)';
    preview.style.background = 'var(--paper-soft)';
  });

  preview.addEventListener('dragleave', () => {
    preview.style.borderColor = 'var(--line)';
    preview.style.background = 'transparent';
  });

  preview.addEventListener('drop', async (e) => {
    e.preventDefault();
    preview.style.borderColor = 'var(--line)';
    preview.style.background = 'transparent';
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    await handleCoverImageUpload(file, preview, urlInput);
  });
}

async function handleCoverImageUpload(file, preview, urlInput) {
  preview.innerHTML = `
    <div style="width: 100%; text-align: center;">
      <div style="height: 6px; background: var(--line); border-radius: 999px; overflow: hidden; margin-bottom: 8px;">
        <div id="uploadProgressBar" style="height: 100%; width: 0%; background: var(--brand-green); transition: width 0.3s ease;"></div>
      </div>
      <span id="uploadProgressText" style="font-weight: 600; font-size: 0.85rem; color: var(--muted);">Yükleniyor... 0%</span>
    </div>
  `;

  try {
    const result = await uploadToCloudinary(file, (percent) => {
      const bar = document.getElementById('uploadProgressBar');
      const text = document.getElementById('uploadProgressText');
      if (bar) bar.style.width = percent + '%';
      if (text) text.textContent = `Yükleniyor... ${percent}%`;
    });

    preview.innerHTML = `<img src="${result.url}" alt="Kapak görseli" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
    urlInput.value = result.url;

  } catch (error) {
    preview.innerHTML = `<span style="color: var(--brand-red); font-weight: 800;">❌ ${error.message}</span>`;
  }
}

async function insertImageToEditor() {
  const editor = document.getElementById('articleContent');
  if (!editor) return;

  const choice = confirm('Bilgisayarınızdan görsel yüklemek için OK,\nURL yapıştırmak için İptal\'e basın.');

  if (choice) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const placeholder = document.createElement('div');
      placeholder.innerHTML = '<span style="color: var(--brand-teal); font-weight: 800;">⏳ Görsel yükleniyor...</span>';
      editor.appendChild(placeholder);

      try {
        const result = await uploadToCloudinary(file);
        placeholder.outerHTML = `
          <figure class="content-image" style="margin: 16px 0;">
            <img src="${result.url}" alt="" style="width: 100%; border-radius: 18px; object-fit: cover;">
          </figure><p><br></p>
        `;
      } catch (error) {
        placeholder.outerHTML = `<p style="color: var(--brand-red);">❌ Yükleme hatası: ${error.message}</p>`;
      }
    });

    fileInput.click();
  } else {
    const imgUrl = prompt('Görsel URL\'si girin:', 'https://');
    if (imgUrl) {
      document.execCommand('insertHTML', false, `
        <figure class="content-image" style="margin: 16px 0;">
          <img src="${imgUrl}" alt="" style="width: 100%; border-radius: 18px; object-fit: cover;">
        </figure><p><br></p>
      `);
    }
  }
}