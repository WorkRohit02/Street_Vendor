import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
const firebaseConfig = {
  apiKey: "AIzaSyAHAaqmBH73l-bwfsghYc2jaR_pdS7aFvg",
  authDomain: "street-vendor-5162e.firebaseapp.com",
  projectId: "street-vendor-5162e",
  storageBucket: "street-vendor-5162e.firebasestorage.app",
  messagingSenderId: "387560067719",
  appId: "1:387560067719:web:9280a2d12e8fbfbe411e22",
  measurementId: "G-K6RJJ0Z82D"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth, db, storage, googleProvider,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, 
  onAuthStateChanged, signInWithPopup, sendPasswordResetEmail,
  doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, serverTimestamp,
  ref, uploadBytes, getDownloadURL
};
function showAlert(msg, type = 'error', boxId = 'alertBox') {
  const box = document.getElementById(boxId);
  if (!box) return;
  box.className = `alert ${type === 'success' ? 'success' : 'error'}`;
  const span = box.querySelector('span') || box;
  span.textContent = msg;
  box.style.display = 'flex';
}
function hideAlert(boxId = 'alertBox') {
  const box = document.getElementById(boxId);
  if (box) box.style.display = 'none';
}
function requireAuth(redirectTo = 'login.html') {
  return new Promise(resolve => {
    onAuthStateChanged(auth, user => {
      if (!user) window.location.href = redirectTo;
      else resolve(user);
    });
  });
}

async function uploadImage(path, file) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}
async function loadSidebarUser(uid) {
  try {
    const snap = await getDoc(doc(db, 'vendors', uid));
    if (!snap.exists()) return;
    const data = snap.data();
    const initials = (data.stallName || data.vendorName || 'V').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const avatar = document.getElementById('userAvatar') || document.querySelector('.user-avatar');
    const name = document.getElementById('userName') || document.querySelector('.user-name');
    const email = document.getElementById('userEmail') || document.querySelector('.user-email');
    if (avatar) avatar.textContent = initials;
    if (name) name.textContent = data.vendorName || data.stallName || 'Vendor';
    if (email) email.textContent = data.email || '';
  } catch (err) { console.warn('loadSidebarUser error:', err.message); }
}
function showToast() {
  const t = document.getElementById('toast');
  if (t) { t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
}
const page = window.location.pathname.split('/').pop();
window.addEventListener('DOMContentLoaded', () => {
  const pageMap = {
    'login.html': initLoginPage,
    'vendor_register.html': initVendorRegisterPage,
    'vendors-dashboard.html': initDashboardPage,
    'vendors_menu.html': initMenuPage,
    'vendors_add_item.html': initAddItemPage,
    'vendors_profile.html': initProfilePage
  };
  if (pageMap[page]) pageMap[page]();

  document.querySelectorAll('#signOutBtn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = 'login.html';
    });
  });
});
function initLoginPage() {
  window.currentRole = 'customer';
  window.setRole = role => {
    window.currentRole = role;
    document.getElementById('tabCustomer')?.classList.toggle('active', role === 'customer');
    document.getElementById('tabVendor')?.classList.toggle('active', role === 'vendor');
    hideAlert();
  };
  document.getElementById('loginForm')?.addEventListener('submit', async e => {
    e.preventDefault(); hideAlert();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
      showAlert('Enter valid email & password (min 6 chars).'); return;
    }
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<div class="spinner"></div>'; btn.disabled = true;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      let role = 'customer';
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (userSnap.exists()) role = userSnap.data().role || 'customer';
      else {
        const vendorSnap = await getDoc(doc(db, 'vendors', uid));
        if (vendorSnap.exists()) {
          role = 'vendor';
          await setDoc(doc(db, 'users', uid), { uid, email, role: 'vendor', createdAt: serverTimestamp() });
        }
      }

      showAlert('Logged in! Redirecting…', 'success');
      setTimeout(() => window.location.href = role === 'vendor' ? 'vendors-dashboard.html' : 'customer.html', 900);

    } catch (err) {
      btn.disabled = false; btn.innerHTML = 'Sign In';
      showAlert(err.code === 'auth/invalid-credential' ? 'Invalid email or password.' : err.message);
    }
  });

  document.getElementById('googleBtn')?.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      const role = window.currentRole || 'customer';
      if (!userSnap.exists()) {
        await setDoc(userRef, { uid: result.user.uid, email: result.user.email, name: result.user.displayName, role, createdAt: serverTimestamp() });
      }
      const savedRole = userSnap.exists() ? userSnap.data().role : role;
      window.location.href = savedRole === 'vendor' ? 'vendors-dashboard.html' : 'customer.html';
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') showAlert('Google sign-in failed: ' + err.message);
    }
  });
  window.forgotPassword = async e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    if (!email) { showAlert('Enter your email first.'); return; }
    try { await sendPasswordResetEmail(auth, email); showAlert('Reset email sent!', 'success'); }
    catch (err) { showAlert('Error: ' + err.message); }
  };
}

function initVendorRegisterPage() {
  const form = document.getElementById('registerForm');

  document.getElementById('imageInput')?.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.getElementById('previewImg');
      const prev = document.getElementById('uploadPreview');
      if (img) img.src = ev.target.result;
      if (prev) prev.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('togglePwd')?.addEventListener('click', () => {
    const input = document.getElementById('regPassword');
    if (input) input.type = input.type === 'text' ? 'password' : 'text';
  });

  function markError(id) {
    const el = document.getElementById(id); if (!el) return;
    el.classList.add('field-error');
    el.addEventListener('input', () => el.classList.remove('field-error'), { once: true });
  }

  function validate() {
    const fields = ['vendorName', 'stallName', 'location', 'phone', 'regEmail', 'regPassword'];
    let ok = true;
    fields.forEach(id => { if (!document.getElementById(id)?.value.trim()) { markError(id); ok = false; } });
    if (!document.getElementById('category')?.value) { markError('category'); ok = false; }
    if (!ok) { showAlert('Fill all required fields.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById('regEmail').value.trim())) { markError('regEmail'); showAlert('Enter valid email.'); return false; }
    if (document.getElementById('regPassword').value.length < 6) { markError('regPassword'); showAlert('Password min 6 chars.'); return false; }
    return true;
  }

  function setLoading(loading) {
    const btn = document.getElementById('submitBtn'); if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading ? '<div class="spinner"></div> Registering…' :
      '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Register Vendor';
  }

  form?.addEventListener('submit', async e => {
    e.preventDefault(); hideAlert(); if (!validate()) return; setLoading(true);

    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const vendorName = document.getElementById('vendorName').value.trim();
    const stallName = document.getElementById('stallName').value.trim();
    const location = document.getElementById('location').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const category = document.getElementById('category').value;
    const foodType = document.querySelector('input[name="foodType"]:checked')?.value || 'veg';
    const imageFile = document.getElementById('imageInput')?.files[0];

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      let imageUrl = '';
      if (imageFile) imageUrl = await uploadImage(`vendors/${uid}/stall.jpg`, imageFile);

      await setDoc(doc(db, 'users', uid), { uid, email, role: 'vendor', createdAt: serverTimestamp() });
      await setDoc(doc(db, 'vendors', uid), {
        uid, vendorName, stallName, location, phone, email,
        category, foodType, imageUrl, upiId: document.getElementById('upiId')?.value.trim() || '',
        rating: 0, isOpen: true, createdAt: serverTimestamp()
      });

      form.style.display = 'none';
      document.getElementById('successMsg')?.style.display = 'block';
      setTimeout(() => window.location.href = 'vendors-dashboard.html', 1800);

    } catch (err) {
      setLoading(false);
      const msg = err.code === 'auth/email-already-in-use' ? 'Email already registered.' :
                  err.code === 'auth/invalid-email' ? 'Enter valid email.' :
                  err.code === 'auth/weak-password' ? 'Weak password (min 6 chars).' :
                  'Registration failed: ' + err.message;
      showAlert(msg);
    }
  });
}
