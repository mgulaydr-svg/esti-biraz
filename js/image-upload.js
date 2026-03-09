/* ============================================
   ESTİ BİRAZ — Görsel Yükleme (image-upload.js)
   ============================================ */

// ══════════════════════════════════════════════
//  CLOUDINARY YÜKLEME
// ══════════════════════════════════════════════

/**
 * Görseli Cloudinary'ye yükler
 * @param {File} file - Yüklenecek dosya
 * @param {function} onProgress - İlerleme callback'i (0-100)
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadToCloudinary(file, onProgress = null) {
  // Dosya tipi kontrolü
  if (!CLOUDINARY_CONFIG.allowedTypes.includes(file.type)) {
    throw new Error(`Desteklenmeyen dosya tipi: ${file.type}. İzin verilenler: JPEG, PNG, WebP, GIF`);
  }

  // Dosya boyutu kontrolü
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

    // İlerleme takibi
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
        console.log('☁️ Görsel yüklendi:', response.secure_url);
      } else {
        reject(new Error('Yükleme başarısız: ' + xhr.statusText));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Ağ hatası')));
    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
}

// ══════════════════════════════════════════════
//  KAPAK GÖRSELİ YÜKLEME (Drag & Drop + Tıklama)
// ══════════════════════════════════════════════

/**
 * Kapak görseli yükleme alanını başlatır
 */
function setupCoverImageUpload() {
  const uploadArea = document.getElementById('imageUploadArea');
  const preview = document.getElementById('imagePreview');
  const urlInput = document.getElementById('articleCoverImage');
  if (!uploadArea || !preview || !urlInput) return;

  // Gizli file input oluştur
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  uploadArea.appendChild(fileInput);

  // Tıklama ile yükleme
  preview.addEventListener('click', () => {
    fileInput.click();
  });

  // Dosya seçildiğinde
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await handleCoverImageUpload(file, preview, urlInput);
  });

  // Drag & Drop
  preview.addEventListener('dragover', (e) => {
    e.preventDefault();
    preview.classList.add('drag-over');
  });

  preview.addEventListener('dragleave', () => {
    preview.classList.remove('drag-over');
  });

  preview.addEventListener('drop', async (e) => {
    e.preventDefault();
    preview.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    await handleCoverImageUpload(file, preview, urlInput);
  });

  console.log('📷 Görsel yükleme alanı hazır.');
}

/**
 * Kapak görseli yükleme işlemini yönetir
 */
async function handleCoverImageUpload(file, preview, urlInput) {
  // Yükleme durumunu göster
  preview.innerHTML = `
    <div class="upload-progress">
      <div class="upload-progress__bar" id="uploadProgressBar"></div>
      <span class="upload-progress__text" id="uploadProgressText">Yükleniyor... 0%</span>
    </div>
  `;

  try {
    const result = await uploadToCloudinary(file, (percent) => {
      const bar = document.getElementById('uploadProgressBar');
      const text = document.getElementById('uploadProgressText');
      if (bar) bar.style.width = percent + '%';
      if (text) text.textContent = `Yükleniyor... ${percent}%`;
    });

    // Başarılı — önizleme göster
    preview.innerHTML = `<img src="${result.url}" alt="Kapak görseli">`;
    urlInput.value = result.url;
    console.log('✅ Kapak görseli yüklendi.');

  } catch (error) {
    console.error('❌ Görsel yükleme hatası:', error);
    preview.innerHTML = `
      <span class="image-upload__placeholder">❌ ${error.message}</span>
    `;
  }
}

// ══════════════════════════════════════════════
//  EDİTÖR İÇİ GÖRSEL YÜKLEME
// ══════════════════════════════════════════════

/**
 * Editör içine görsel yükleme dialog'u açar
 */
async function insertImageToEditor() {
  const editor = document.getElementById('articleContent');
  if (!editor) return;

  // Seçenek sun: URL mi, dosya mı?
  const choice = confirm('Bilgisayarınızdan görsel yüklemek için OK,\nURL yapıştırmak için İptal\'e basın.');

  if (choice) {
    // Dosya seçici
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Geçici placeholder ekle
      const placeholder = document.createElement('div');
      placeholder.className = 'editor-image-loading';
      placeholder.innerHTML = '⏳ Görsel yükleniyor...';
      editor.appendChild(placeholder);

      try {
        const result = await uploadToCloudinary(file);
        // Placeholder'ı gerçek görselle değiştir
        placeholder.outerHTML = `<img src="${result.url}" alt="" style="max-width:100%; border-radius:8px; margin:8px 0;"><br>`;
        console.log('🖼️ Editöre görsel eklendi.');
      } catch (error) {
        placeholder.outerHTML = `<p style="color:red;">❌ Yükleme hatası: ${error.message}</p>`;
      }
    });

    fileInput.click();
  } else {
    // URL ile ekleme (mevcut davranış)
    const imgUrl = prompt('Görsel URL\'si girin:', 'https://');
    if (imgUrl) {
      document.execCommand('insertImage', false, imgUrl);
    }
  }
}