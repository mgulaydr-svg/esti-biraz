/* ============================================
   ESTİ BİRAZ — Kimlik Doğrulama (auth.js)
   ============================================ */

// ── DOM Elemanları ──
const btnLogin   = document.getElementById('btnLogin');
const userMenu   = document.getElementById('userMenu');
const userAvatar = document.getElementById('userAvatar');
const userName   = document.getElementById('userName');

// ── Mevcut Kullanıcı Durumu ──
let currentUser = null;

// ══════════════════════════════════════════════
//  AUTH STATE OBSERVER
// ══════════════════════════════════════════════
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    console.log('🟢 Kullanıcı giriş yaptı:', user.displayName);

    // Firestore'da kullanıcı profili oluştur/güncelle
    await saveUserProfile(user);

    // UI güncelle
    updateUIForLoggedInUser(user);
    updateHeaderAuth(user);

  } else {
    currentUser = null;
    console.log('🔴 Kullanıcı çıkış yaptı.');

    // UI güncelle
    updateUIForLoggedOutUser();
    updateHeaderAuth(null);
  }
});

// ══════════════════════════════════════════════
//  GİRİŞ FONKSİYONU
// ══════════════════════════════════════════════
async function login() {
  try {
    await auth.signInWithRedirect(googleProvider);
  } catch (error) {
    console.error('❌ Giriş hatası:', error.message);
    handleAuthError(error);
  }
}

/* ============================================
   E-POSTA İLE GİRİŞ / KAYIT (Parça 1.8)
   ============================================ */

async function emailRegister(email, password, displayName) {
  try {
    const result = await firebase.auth()
      .createUserWithEmailAndPassword(email, password);
    await result.user.updateProfile({ displayName: displayName });
    await db.collection('users').doc(result.user.uid).set({
      displayName: displayName,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ Kayıt başarılı:', displayName);
  } catch (error) {
    console.error('❌ Kayıt hatası:', error);
    alert(error.message);
  }
}

async function emailLogin(email, password) {
  try {
    await firebase.auth()
      .signInWithEmailAndPassword(email, password);
    console.log('✅ E-posta ile giriş başarılı');
  } catch (error) {
    console.error('❌ Giriş hatası:', error);
    alert(error.message);
  }
}

// ══════════════════════════════════════════════
//  ÇIKIŞ FONKSİYONU
// ══════════════════════════════════════════════
async function logout() {
  try {
    await auth.signOut();
    console.log('✅ Çıkış başarılı.');
    // Ana sayfaya yönlendir
    window.location.hash = '#/';
  } catch (error) {
    console.error('❌ Çıkış hatası:', error.message);
  }
}

// ══════════════════════════════════════════════
//  KULLANICI PROFİLİ KAYDETME (Firestore)
// ══════════════════════════════════════════════
async function saveUserProfile(user) {
  const userRef = db.collection('users').doc(user.uid);

  try {
    const doc = await userRef.get();

    if (!doc.exists) {
      // Yeni kullanıcı — profil oluştur
      await userRef.set({
        uid:         user.uid,
        displayName: user.displayName,
        email:       user.email,
        photoURL:    user.photoURL,
        role:        'reader',       // Varsayılan rol
        createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('📝 Yeni kullanıcı profili oluşturuldu.');
    } else {
      // Mevcut kullanıcı — son giriş zamanını güncelle
      await userRef.update({
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        displayName: user.displayName,
        photoURL:    user.photoURL
      });
      console.log('🔄 Kullanıcı profili güncellendi.');
    }
  } catch (error) {
    console.error('❌ Profil kaydetme hatası:', error.message);
  }
}

// ══════════════════════════════════════════════
//  KULLANICI ROLÜ KONTROLÜ
// ══════════════════════════════════════════════
async function getUserRole(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      return doc.data().role || 'reader';
    }
    return 'reader';
  } catch (error) {
    console.error('❌ Rol kontrolü hatası:', error.message);
    return 'reader';
  }
}

// Rol sabitleri
const ROLES = {
  ADMIN:  'admin',
  EDITOR: 'editor',
  READER: 'reader'
};

// Rol kontrol yardımcıları
function isAdmin()  { return currentUser && getUserRole(currentUser.uid).then(r => r === ROLES.ADMIN); }
function isEditor() { return currentUser && getUserRole(currentUser.uid).then(r => r === ROLES.EDITOR || r === ROLES.ADMIN); }
function isLoggedIn() { return currentUser !== null; }

// ══════════════════════════════════════════════
//  UI GÜNCELLEME FONKSİYONLARI
// ══════════════════════════════════════════════
function updateUIForLoggedInUser(user) {
  // Giriş butonunu gizle
  if (btnLogin) btnLogin.classList.add('hidden');

  // Kullanıcı menüsünü göster
  if (userMenu) {
    userMenu.classList.remove('hidden');
  }
  if (userAvatar) {
    userAvatar.src = user.photoURL || 'assets/images/default-avatar.png';
    userAvatar.alt = user.displayName || 'Profil';
  }
  if (userName) {
    userName.textContent = user.displayName || 'Kullanıcı';
  }
}

function updateUIForLoggedOutUser() {
  // Giriş butonunu göster
  if (btnLogin) btnLogin.classList.remove('hidden');

  // Kullanıcı menüsünü gizle
  if (userMenu) {
    userMenu.classList.add('hidden');
  }
  if (userAvatar) {
    userAvatar.src = '';
  }
  if (userName) {
    userName.textContent = '';
  }
}

// ══════════════════════════════════════════════
//  HATA YÖNETİMİ
// ══════════════════════════════════════════════
function handleAuthError(error) {
  let message = 'Bir hata oluştu. Lütfen tekrar deneyin.';

  switch (error.code) {
    case 'auth/popup-closed-by-user':
      message = 'Giriş penceresi kapatıldı.';
      break;
    case 'auth/network-request-failed':
      message = 'İnternet bağlantınızı kontrol edin.';
      break;
    case 'auth/too-many-requests':
      message = 'Çok fazla deneme. Lütfen biraz bekleyin.';
      break;
    case 'auth/popup-blocked':
      message = 'Pop-up penceresi engellendi. Lütfen tarayıcı ayarlarınızı kontrol edin.';
      break;
    case 'auth/cancelled-popup-request':
      // Sessizce geç — birden fazla popup açılmaya çalışıldığında olur
      return;
    default:
      message = `Hata: ${error.message}`;
  }

  // Basit bildirim (ileride toast/snackbar ile değiştirilebilir)
  alert(message);
}

/**
 * Kullanıcının admin/editor olup olmadığını kontrol eder
 * @returns {Promise<boolean>}
 */
async function isAdminUser() {
  const user = firebase.auth().currentUser;
  if (!user) return false;

  try {
    const doc = await db.collection('users').doc(user.uid).get();
    if (!doc.exists) return false;
    const role = doc.data().role;
    return role === 'admin' || role === 'editor';
  } catch (error) {
    console.error('❌ Yetki kontrolü başarısız:', error);
    return false;
  }
}

/* ============================================
   HEADER PROFİL ALANI GÜNCELLEMESİ (Parça 1.8)
   ============================================ */

function updateHeaderAuth(user) {
  const authContainer = document.getElementById('headerAuth');
  if (!authContainer) return;

  if (user) {
    // Kullanıcı giriş yapmış
    const displayName = user.displayName || 'Kullanıcı';
    const photoURL = user.photoURL || 'assets/default-avatar.png';

    authContainer.innerHTML = `
      <a href="#/profil" class="header__user" title="Profilim">
        <img src="${photoURL}" alt="${displayName}" class="header__avatar"
             onerror="this.src='assets/default-avatar.png'">
        <span class="header__username">${displayName}</span>
      </a>
    `;
  } else {
    // Giriş yapılmamış
    authContainer.innerHTML = `
      <a href="#/profil" class="header__login-btn">
        🔑 Giriş Yap
      </a>
`    ;
  }
}