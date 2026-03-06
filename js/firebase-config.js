/* ============================================
   ESTİ BİRAZ — Firebase Yapılandırması
   ============================================ */

const firebaseConfig = {
    apiKey: "AIzaSyBL6Hco0wNAr67jMntcMYu_bg26Ck3vt6w",
    authDomain: "esti-biraz.firebaseapp.com",
    projectId: "esti-biraz",
    storageBucket: "esti-biraz.firebasestorage.app",
    messagingSenderId: "247737419785",
    appId: "1:247737419785:web:440242bd0d9738a43d10d8",
    measurementId: "G-2ZXKR573S8"
  };

// Firebase başlat
firebase.initializeApp(firebaseConfig);

// Global referanslar
const auth = firebase.auth();
const db   = firebase.firestore();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

console.log('✅ Firebase başarıyla başlatıldı.');