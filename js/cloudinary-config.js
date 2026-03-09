/* ============================================
   ESTİ BİRAZ — Cloudinary Yapılandırma
   ============================================ */

const CLOUDINARY_CONFIG = {
  cloudName: 'dnz1jxdqm',       // ← Cloudinary dashboard'dan
  uploadPreset: 'esti_biraz_unsigned',   // ← Oluşturduğunuz preset adı
  folder: 'esti-biraz',
  maxFileSize: 5 * 1024 * 1024,          // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};