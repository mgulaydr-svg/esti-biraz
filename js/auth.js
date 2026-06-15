/* ============================================
   ESTİ BİRAZ — Yeni Tasarım Kimlik Doğrulama
   ============================================ */

let currentUser = null;

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    await saveUserProfile(user);
    updateHeaderAuth(user);
    
    if (window.location.hash === '#/profil') {
      if (typeof loadProfile === 'function') loadProfile();
    }
  } else {
    currentUser = null;
    updateHeaderAuth(null);
  }
});

async function login() {
  try {
    await auth.signInWithPopup(googleProvider);
  } catch (error) {
    if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') return;
    alert(`Hata: ${error.message}`);
  }
}

async function logout() {
  try {
    await auth.signOut();
    window.location.hash = '#/';
  } catch (error) {
    console.error('❌ Çıkış hatası:', error.message);
  }
}

async function saveUserProfile(user) {
  const userRef = db.collection('users').doc(user.uid);
  try {
    const doc = await userRef.get();
    if (!doc.exists) {
      await userRef.set({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'reader',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      await userRef.update({
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        displayName: user.displayName,
        photoURL: user.photoURL
      });
    }
  } catch (error) {
    console.error('❌ Profil kaydetme hatası:', error.message);
  }
}

// ══════════════════════════════════════════════
//  YENİ TASARIM: HEADER AUTH GÜNCELLEMESİ
// ══════════════════════════════════════════════
function updateHeaderAuth(user) {
  const authContainer = document.getElementById('headerAuth');
  if (!authContainer) return;

  if (user) {
    const displayName = user.displayName || 'Kullanıcı';
    const photoURL = user.photoURL || 'assets/logo.png'; // Fallback

    authContainer.innerHTML = `
      <a href="#/profil" class="ghost-button" style="display: flex; gap: 8px; align-items: center; padding: 6px 14px 6px 6px;">
        <img src="${photoURL}" alt="${displayName}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">
        <span>Profilim</span>
      </a>
      ${user.email === 'mgulaydr@gmail.com' ? '<a href="#/admin" class="ghost-button">Admin</a>' : ''}
    `;
  } else {
    authContainer.innerHTML = `
      <button class="ghost-button" onclick="login()">Giriş Yap</button>
    `;
  }
}