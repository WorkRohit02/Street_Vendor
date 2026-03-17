// ================================================================
//  firebase-app.js  —  StreetLink Firebase Integration
//  ✅ Real Firebase config
//  ✅ FIXED: removed duplicate import that caused api-key-not-valid error
//  ✅ FIXED: vendor registration creates a real Auth account
// ================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteDoc, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// ── YOUR FIREBASE CONFIG ──────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAHAaqmBH73l-bwfsghYc2jaR_pdS7aFvg",
  authDomain: "street-vendor-5162e.firebaseapp.com",
  projectId: "street-vendor-5162e",
  storageBucket: "street-vendor-5162e.firebasestorage.app",
  messagingSenderId: "387560067719",
  appId: "1:387560067719:web:9280a2d12e8fbfbe411e22",
  measurementId: "G-K6RJJ0Z82D"
};

const app          = initializeApp(firebaseConfig);
const auth         = getAuth(app);
const db           = getFirestore(app);
const storage      = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// ── EXPORTS ───────────────────────────────────────────────────
export {
  auth, db, storage, googleProvider,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, signInWithPopup, sendPasswordResetEmail,
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, addDoc, getDocs, serverTimestamp,
  ref, uploadBytes, uploadBytesResumable, getDownloadURL
};

// ── SHARED HELPERS ────────────────────────────────────────────
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
    const d = snap.data();
    const initials = (d.stallName || d.vendorName || 'V').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const avatar = document.getElementById('userAvatar') || document.querySelector('.user-avatar');
    const name   = document.getElementById('userName')   || document.querySelector('.user-name');
    const email  = document.getElementById('userEmail')  || document.querySelector('.user-email');
    if (avatar) avatar.textContent = initials;
    if (name)   name.textContent   = d.vendorName || d.stallName || 'Vendor';
    if (email)  email.textContent  = d.email || '';
  } catch (err) { console.warn('loadSidebarUser:', err.message); }
}
function showToast() {
  const t = document.getElementById('toast');
  if (t) { t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
}

// ── PAGE DETECTOR ─────────────────────────────────────────────
const page = window.location.pathname.split('/').pop();
window.addEventListener('DOMContentLoaded', () => {
  if (page === 'login.html')             initLoginPage();
  if (page === 'vendor_register.html')   initVendorRegisterPage();
  if (page === 'vendors-dashboard.html') initDashboardPage();
  if (page === 'vendors_menu.html')      initMenuPage();
  if (page === 'vendors_add_item.html')  initAddItemPage();
  if (page === 'vendors_profile.html')   initProfilePage();
  // if (page === 'customer.html')          initCustomerPage();
  // if (page === 'customer_map.html')      initMapPage();

  // Sign out on all sidebar pages
  document.querySelectorAll('#signOutBtn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = 'login.html';
    });
  });
});


// ================================================================
//  1. LOGIN
// ================================================================
function initLoginPage() {
  window.currentRole = 'customer';
  window.setRole = function(role) {
    window.currentRole = role;
    document.getElementById('tabCustomer')?.classList.toggle('active', role === 'customer');
    document.getElementById('tabVendor')?.classList.toggle('active',   role === 'vendor');
    hideAlert();
  };

  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); hideAlert();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
      showAlert('Please enter a valid email and password (min 6 chars).'); return;
    }
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<div class="spinner"></div>'; btn.disabled = true;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid  = cred.user.uid;

      // Check /users/{uid} for role
      let role = 'customer';
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (userSnap.exists()) {
        role = userSnap.data().role || 'customer';
      } else {
        // Fallback: check if a vendor doc exists
        const vendorSnap = await getDoc(doc(db, 'vendors', uid));
        if (vendorSnap.exists()) {
          role = 'vendor';
          // Recreate missing /users doc
          await setDoc(doc(db, 'users', uid), { uid, email, role: 'vendor', createdAt: serverTimestamp() });
        }
      }

      showAlert('Logged in! Redirecting…', 'success');
      setTimeout(() => {
        window.location.href = role === 'vendor' ? 'vendors-dashboard.html' : 'customer.html';
      }, 900);

    } catch (err) {
      btn.disabled = false; btn.innerHTML = 'Sign In';
      showAlert(err.code === 'auth/invalid-credential' ? 'Invalid email or password.' : err.message);
    }
  });

  document.getElementById('googleBtn')?.addEventListener('click', async () => {
    try {
      const result   = await signInWithPopup(auth, googleProvider);
      const userRef  = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      const role     = window.currentRole || 'customer';
      if (!userSnap.exists()) {
        await setDoc(userRef, { uid: result.user.uid, email: result.user.email, name: result.user.displayName, role, createdAt: serverTimestamp() });
      }
      const savedRole = userSnap.exists() ? userSnap.data().role : role;
      window.location.href = savedRole === 'vendor' ? 'vendors-dashboard.html' : 'customer.html';
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') showAlert('Google sign-in failed: ' + err.message);
    }
  });

  window.forgotPassword = async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    if (!email) { showAlert('Enter your email first.'); return; }
    try { await sendPasswordResetEmail(auth, email); showAlert('Reset email sent!', 'success'); }
    catch (err) { showAlert('Error: ' + err.message); }
  };
}


// ================================================================
//  2. VENDOR REGISTER  ✅ FIXED
// ================================================================
function initVendorRegisterPage() {

  document.getElementById('imageInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img  = document.getElementById('previewImg');
      const prev = document.getElementById('uploadPreview');
      if (img)  img.src = ev.target.result;
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
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value.trim()) { markError(id); ok = false; }
    });
    const cat = document.getElementById('category');
    if (cat && !cat.value) { cat.classList.add('field-error'); ok = false; }
    if (!ok) { showAlert('Please fill in all required fields.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById('regEmail').value.trim())) {
      markError('regEmail'); showAlert('Please enter a valid email.'); return false;
    }
    if (document.getElementById('regPassword').value.length < 6) {
      markError('regPassword'); showAlert('Password must be at least 6 characters.'); return false;
    }
    return true;
  }

  function setLoading(loading) {
    const btn = document.getElementById('submitBtn'); if (!btn) return;
    btn.disabled  = loading;
    btn.innerHTML = loading
      ? '<div class="spinner"></div> Registering…'
      : '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Register Vendor';
  }

  // ✅ FIXED — creates real Firebase Auth account
  document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); hideAlert();
    if (!validate()) return;
    setLoading(true);

    const email      = document.getElementById('regEmail').value.trim();
    const password   = document.getElementById('regPassword').value;
    const vendorName = document.getElementById('vendorName').value.trim();
    const stallName  = document.getElementById('stallName').value.trim();
    const location   = document.getElementById('location').value.trim();
    const phone      = document.getElementById('phone').value.trim();
    const category   = document.getElementById('category').value;
    const foodType   = document.querySelector('input[name="foodType"]:checked')?.value || 'veg';
    const imageFile  = document.getElementById('imageInput')?.files[0];

    try {
      // Step 1: Create real Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid  = cred.user.uid;

      // Step 2: Upload image if provided
      let imageUrl = '';
      if (imageFile) imageUrl = await uploadImage(`vendors/${uid}/stall.jpg`, imageFile);

      // Step 3: Save role to /users/{uid}
      await setDoc(doc(db, 'users', uid), {
        uid, email, role: 'vendor', createdAt: serverTimestamp()
      });

      // Step 4: Save vendor profile to /vendors/{uid}
      await setDoc(doc(db, 'vendors', uid), {
        uid, vendorName, stallName, location, phone, email,
        category, foodType, imageUrl,
        upiId: document.getElementById('upiId')?.value.trim() || '',
        rating: 0, isOpen: true, createdAt: serverTimestamp()
      });

      // Step 5: Show success + redirect
      const form = document.getElementById('registerForm');
      const succ = document.getElementById('successMsg');
      if (form) form.style.display = 'none';
      if (succ) succ.style.display = 'block';
      setTimeout(() => { window.location.href = 'vendors-dashboard.html'; }, 1800);

    } catch (err) {
      setLoading(false);
      const msg =
        err.code === 'auth/email-already-in-use' ? 'This email is already registered. Try logging in.' :
        err.code === 'auth/invalid-email'         ? 'Please enter a valid email.' :
        err.code === 'auth/weak-password'         ? 'Password too weak. Use at least 6 characters.' :
        'Registration failed: ' + err.message;
      showAlert(msg);
    }
  });
}


// ================================================================
//  3. DASHBOARD
// ================================================================
async function initDashboardPage() {
  const user = await requireAuth();
  await loadSidebarUser(user.uid);
  let menuItems = [], editingId = null;
  const foodEmoji = { 'Chaat':'🥙','Main Course':'🍛','Snacks':'🍟','Rolls':'🌯','Beverages':'☕','Sweets':'🍮' };
  const catColors = { 'Chaat':'','Main Course':'orange','Snacks':'green','Rolls':'red','Beverages':'orange','Sweets':'green' };

  async function loadMenu() {
    const snap = await getDocs(collection(db, 'vendors', user.uid, 'menu'));
    menuItems  = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
    renderTable();
  }

  function renderTable() {
    const tbody = document.getElementById('menuBody');
    const empty = document.getElementById('emptyState');
    const count = document.getElementById('menuCount');
    if (count) count.textContent = menuItems.length;
    if (!menuItems.length) { if (tbody) tbody.innerHTML = ''; if (empty) empty.style.display = 'block'; return; }
    if (empty) empty.style.display = 'none';
    if (!tbody) return;
    tbody.innerHTML = menuItems.map(item => `
      <tr id="row-${item.firestoreId}">
        <td><div class="food-thumb">${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}"/>` : (foodEmoji[item.category] || '🍽')}</div></td>
        <td><span class="food-name">${item.name}</span></td>
        <td>Rs. ${item.price}</td>
        <td><span class="cat-badge ${catColors[item.category] || ''}">${item.category}</span></td>
        <td><div class="veg-dot"><span class="dot" style="background:${item.isVeg ? '#16A34A' : '#DC2626'}"></span>${item.isVeg ? 'Veg' : 'Non-Veg'}</div></td>
        <td><div class="rating-cell"><span class="star">★</span> ${Number(item.rating || 0).toFixed(1)}</div></td>
        <td><div class="action-btns" style="justify-content:flex-end;">
          <button class="icon-btn" data-id="${item.firestoreId}" data-action="edit">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn del" data-id="${item.firestoreId}" data-action="delete">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          </button>
        </div></td>
      </tr>`).join('');
  }

  document.getElementById('menuBody')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]'); if (!btn) return;
    if (btn.dataset.action === 'edit')   openEditModal(btn.dataset.id);
    if (btn.dataset.action === 'delete') deleteItem(btn.dataset.id);
  });

  async function deleteItem(id) {
    const row = document.getElementById(`row-${id}`);
    if (row) { row.style.opacity = '0'; row.style.transition = 'opacity 0.2s'; }
    setTimeout(async () => { await deleteDoc(doc(db, 'vendors', user.uid, 'menu', id)); await loadMenu(); }, 200);
  }

  function openEditModal(id) {
    const item = menuItems.find(i => i.firestoreId === id); if (!item) return;
    editingId = id;
    document.getElementById('newName').value     = item.name;
    document.getElementById('newPrice').value    = item.price;
    document.getElementById('newCategory').value = item.category;
    document.getElementById('newType').value     = item.isVeg ? 'Veg' : 'Non-Veg';
    document.getElementById('newRating').value   = item.rating;
    const title   = document.getElementById('modalTitle');   if (title)   title.textContent   = 'Edit Food Item';
    const saveBtn = document.getElementById('modalSaveBtn'); if (saveBtn) saveBtn.textContent = 'Save Changes';
    document.getElementById('modalOverlay')?.classList.add('open');
  }

  function closeModal() {
    editingId = null;
    const title   = document.getElementById('modalTitle');   if (title)   title.textContent   = 'Add Food Item';
    const saveBtn = document.getElementById('modalSaveBtn'); if (saveBtn) saveBtn.textContent = 'Add Item';
    document.getElementById('modalOverlay')?.classList.remove('open');
    ['newName', 'newPrice', 'newRating'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  }

  document.getElementById('openModalBtn')?.addEventListener('click',  () => { editingId = null; closeModal(); document.getElementById('modalOverlay')?.classList.add('open'); });
  document.getElementById('modalCancelBtn')?.addEventListener('click', closeModal);
  document.getElementById('modalOverlay')?.addEventListener('click',  e => { if (e.target === document.getElementById('modalOverlay')) closeModal(); });

  document.getElementById('modalSaveBtn')?.addEventListener('click', async () => {
    const name  = document.getElementById('newName').value.trim();
    const price = parseInt(document.getElementById('newPrice').value);
    if (!name || !price) return;
    const data = { name, price, category: document.getElementById('newCategory').value, isVeg: document.getElementById('newType').value === 'Veg', rating: parseFloat(document.getElementById('newRating').value) || 4.5 };
    const btn  = document.getElementById('modalSaveBtn');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
    try {
      if (editingId) await updateDoc(doc(db, 'vendors', user.uid, 'menu', editingId), data);
      else           await addDoc(collection(db, 'vendors', user.uid, 'menu'), { ...data, createdAt: serverTimestamp() });
      closeModal(); await loadMenu();
    } catch (err) { alert('Error: ' + err.message); }
    finally { btn.disabled = false; btn.textContent = editingId ? 'Save Changes' : 'Add Item'; }
  });

  const vSnap = await getDoc(doc(db, 'vendors', user.uid));
  if (vSnap.exists()) {
    const d   = vSnap.data();
    const rEl = document.getElementById('ratingVal');
    if (rEl) rEl.textContent = d.rating ? Number(d.rating).toFixed(1) : 'New';
    const toggle = document.getElementById('stallToggle');
    if (toggle) {
      toggle.checked = d.isOpen !== false;
      updateStatusLabel(toggle.checked);
      toggle.addEventListener('change', async () => { updateStatusLabel(toggle.checked); await updateDoc(doc(db, 'vendors', user.uid), { isOpen: toggle.checked }); });
    }
  }

  function updateStatusLabel(isOpen) {
    const el = document.getElementById('stallStatusLabel'); if (!el) return;
    el.textContent = isOpen ? 'Open' : 'Closed';
    el.className   = isOpen ? 'status-open' : 'status-closed';
  }

  await loadMenu();
}


// ================================================================
//  4. MY MENU
// ================================================================
async function initMenuPage() {
  const user = await requireAuth();
  await loadSidebarUser(user.uid);
  let menuItems = [], editingId = null, searchQuery = '';
  const foodEmoji    = { Chaat:'🥙', Momos:'🥟', Main:'🍛', Snacks:'🍟', Rolls:'🌯', Beverages:'☕' };
  const allergyClass = { Gluten:'gluten', Dairy:'dairy', Nuts:'nuts', Soy:'soy', Egg:'' };

  async function loadMenu() {
    const snap = await getDocs(collection(db, 'vendors', user.uid, 'menu'));
    menuItems  = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
    renderTable();
  }

  function renderTable() {
    const filtered = menuItems.filter(i =>
      (i.name        || '').toLowerCase().includes(searchQuery) ||
      (i.category    || '').toLowerCase().includes(searchQuery) ||
      (i.ingredients || '').toLowerCase().includes(searchQuery)
    );
    const title = document.getElementById('sectionTitle');
    if (title) title.textContent = `Menu Items (${filtered.length})`;
    const tbody = document.getElementById('menuBody');
    const empty = document.getElementById('emptyState');
    if (!filtered.length) { if (tbody) tbody.innerHTML = ''; if (empty) empty.style.display = 'block'; return; }
    if (empty) empty.style.display = 'none';
    if (tbody) tbody.innerHTML = filtered.map(item => `
      <tr id="row-${item.firestoreId}">
        <td><div class="food-thumb">${item.imageUrl ? `<img src="${item.imageUrl}"/>` : (foodEmoji[item.category] || '🍽')}</div></td>
        <td><span class="food-name">${item.name}</span></td>
        <td>Rs. ${item.price}</td>
        <td><span class="cat-badge">${item.category}</span></td>
        <td><div class="veg-dot"><span class="dot" style="background:${item.isVeg ? '#16A34A' : '#DC2626'}"></span>${item.isVeg ? 'Veg' : 'Non-Veg'}</div></td>
        <td><div class="ingredients-cell">${item.ingredients || '—'}</div></td>
        <td><div class="allergy-tags">${(item.allergies || []).map(a => `<span class="allergy-tag ${allergyClass[a] || ''}">${a}</span>`).join('')}</div></td>
        <td><div class="rating-cell"><span class="star">★</span> ${Number(item.rating || 0).toFixed(1)}</div></td>
        <td><div class="action-cell">
          <button class="action-btn btn-edit"    data-id="${item.firestoreId}" data-action="edit">Edit</button>
          <button class="action-btn btn-delete"  data-id="${item.firestoreId}" data-action="delete">Delete</button>
        </div></td>
      </tr>`).join('');
  }

  document.getElementById('searchInput')?.addEventListener('input', e => { searchQuery = e.target.value.toLowerCase(); renderTable(); });
  document.getElementById('menuBody')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]'); if (!btn) return;
    if (btn.dataset.action === 'edit')   openEditModal(btn.dataset.id);
    if (btn.dataset.action === 'delete') deleteItem(btn.dataset.id);
  });

  async function deleteItem(id) {
    const row = document.getElementById(`row-${id}`);
    if (row) { row.style.opacity = '0'; row.style.transition = 'opacity 0.2s'; }
    setTimeout(async () => { await deleteDoc(doc(db, 'vendors', user.uid, 'menu', id)); await loadMenu(); }, 200);
  }

  function openEditModal(id) {
    const item = menuItems.find(i => i.firestoreId === id); if (!item) return;
    editingId = id;
    document.getElementById('fName').value        = item.name;
    document.getElementById('fPrice').value       = item.price;
    document.getElementById('fCategory').value    = item.category;
    document.getElementById('fType').value        = item.isVeg ? 'Veg' : 'Non-Veg';
    document.getElementById('fRating').value      = item.rating;
    document.getElementById('fIngredients').value = item.ingredients || '';
    document.querySelectorAll('.allergy-checkboxes input').forEach(cb => { cb.checked = (item.allergies || []).includes(cb.value); });
    const t = document.getElementById('modalTitle');   if (t) t.textContent = 'Edit Food Item';
    const s = document.getElementById('modalSaveBtn'); if (s) s.textContent = 'Save Changes';
    document.getElementById('modalOverlay')?.classList.add('open');
  }

  function closeModal() {
    editingId = null;
    const t = document.getElementById('modalTitle');   if (t) t.textContent = 'Add Food Item';
    const s = document.getElementById('modalSaveBtn'); if (s) s.textContent = 'Add Item';
    document.getElementById('modalOverlay')?.classList.remove('open');
  }

  document.getElementById('openModalBtn')?.addEventListener('click',  () => { editingId = null; closeModal(); document.getElementById('modalOverlay')?.classList.add('open'); });
  document.getElementById('modalCancelBtn')?.addEventListener('click', closeModal);
  document.getElementById('modalOverlay')?.addEventListener('click',  e => { if (e.target === document.getElementById('modalOverlay')) closeModal(); });

  document.getElementById('modalSaveBtn')?.addEventListener('click', async () => {
    const name  = document.getElementById('fName').value.trim();
    const price = parseInt(document.getElementById('fPrice').value);
    if (!name || !price) return;
    const data = {
      name, price,
      category:    document.getElementById('fCategory').value,
      isVeg:       document.getElementById('fType').value === 'Veg',
      rating:      parseFloat(document.getElementById('fRating').value) || 4.5,
      ingredients: document.getElementById('fIngredients').value.trim(),
      allergies:   [...document.querySelectorAll('.allergy-checkboxes input:checked')].map(cb => cb.value)
    };
    const btn = document.getElementById('modalSaveBtn');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
    try {
      if (editingId) await updateDoc(doc(db, 'vendors', user.uid, 'menu', editingId), data);
      else           await addDoc(collection(db, 'vendors', user.uid, 'menu'), { ...data, createdAt: serverTimestamp() });
      closeModal(); await loadMenu();
    } catch (err) { alert('Error: ' + err.message); }
    finally { btn.disabled = false; btn.textContent = editingId ? 'Save Changes' : 'Add Item'; }
  });

  await loadMenu();
}


// ================================================================
//  5. ADD ITEM
// ================================================================
async function initAddItemPage() {
  const user = await requireAuth();
  await loadSidebarUser(user.uid);

  // Load stock for ingredient picker
try {
  const stockSnap = await getDocs(collection(db, 'vendors', user.uid, 'stock'));
  const stockItems = stockSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (typeof window.initStockIngredients === 'function') {
    window.initStockIngredients(stockItems);
  }
} catch (e) {
  console.warn('Could not load stock:', e.message);
}

  window.saveItem = async function() {
    const name        = document.getElementById('foodName').value.trim();
    const price       = document.getElementById('foodPrice').value;
    const category    = document.getElementById('foodCategory').value;
    const type        = document.querySelector('input[name="foodType"]:checked')?.value || 'Veg';
    const description       = document.getElementById('foodDescription')?.value.trim() || '';
    const pickedIngredients = window.getPickedIngredients ? window.getPickedIngredients() : [];
    const manualIngredients = document.getElementById('foodIngredients')?.value.trim() || '';
    const ingredients       = [...pickedIngredients, ...(manualIngredients ? [manualIngredients] : [])].join(', ');
    const allergies   = [...document.querySelectorAll('.allergy-chip.selected')].map(el => el.textContent.trim());
    const imageFile   = document.getElementById('photoInput')?.files[0];
    if (!name || !price) { if (!name) document.getElementById('foodName').focus(); return; }

    const btn = document.getElementById('saveBtn') || document.querySelector('.save-btn');
    btn.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;"></div>';
    btn.disabled  = true;

    try {
      let imageUrl = '';
      if (imageFile) imageUrl = await uploadImage(`vendors/${user.uid}/menu/${Date.now()}.jpg`, imageFile);
      await addDoc(collection(db, 'vendors', user.uid, 'menu'), {
        name, price: parseInt(price), category, description,
        isVeg: type === 'Veg' || type === 'Vegan',
        foodType: type, ingredients, allergies, imageUrl, description,
        rating: 4.5, createdAt: serverTimestamp()
      });
      btn.innerHTML = '<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Save Item';
      btn.disabled  = false;
      showToast();
      if (typeof resetForm === 'function') resetForm();
    } catch (err) {
      btn.innerHTML = 'Save Item'; btn.disabled = false;
      alert('Error: ' + err.message);
    }
  };
}


// ================================================================
//  6. PROFILE
// ================================================================
async function initProfilePage() {
  const user = await requireAuth();
  await loadSidebarUser(user.uid);

  function setDisp(key, val) {
    const el = document.getElementById(`disp-${key}`); if (!el) return;
    if (key === 'about') { el.textContent = val || '—'; return; }
    const span = el.querySelector('span'); if (span) span.textContent = val || '—';
  }
  function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
  function getVal(id)      { const el = document.getElementById(id); return el ? el.value.trim() : ''; }

  const snap = await getDoc(doc(db, 'vendors', user.uid));
  if (snap.exists()) {
    const d = snap.data();
    setDisp('phone', d.phone || ''); setDisp('email', d.email || ''); setDisp('address', d.location || ''); setDisp('insta', d.instagram || ''); setDisp('about', d.about || '');
    setVal('edit-phone', d.phone || ''); setVal('edit-email', d.email || ''); setVal('edit-address', d.location || ''); setVal('edit-insta', d.instagram || ''); setVal('edit-about', d.about || '');
    const initials = (d.stallName || d.vendorName || 'V').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const pAvatar  = document.getElementById('profileAvatar');  if (pAvatar)  pAvatar.textContent  = initials;
    const pName    = document.querySelector('.profile-name');    if (pName)    pName.textContent    = d.stallName || d.vendorName || 'Your Stall';
    const pTag     = document.querySelector('.profile-tagline'); if (pTag)     pTag.textContent     = d.category || '';
    const pRating  = document.getElementById('profileRating');  if (pRating)  pRating.textContent  = d.rating ? Number(d.rating).toFixed(1) : 'New';
    const pLoc     = document.getElementById('profileLocation'); if (pLoc)    pLoc.textContent     = d.location || '—';
  }

  const mSnap = await getDocs(collection(db, 'vendors', user.uid, 'menu'));
  const items  = mSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const grid   = document.getElementById('menuGrid');
  const emoji  = { Chaat:'🥙', Momos:'🥟', 'Main Course':'🍛', Snacks:'🍟', Rolls:'🌯', Beverages:'☕', Sweets:'🍮' };
  if (grid) grid.innerHTML = items.length
    ? items.map(item => `
        <div class="menu-card">
          <div class="menu-thumb">${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}"/>` : (emoji[item.category] || '🍽')}</div>
          <div class="menu-name">${item.name}</div>
          <div class="menu-price">Rs. ${item.price}</div>
          <div class="menu-meta">
            <span><span class="veg-dot-sm" style="background:${item.isVeg ? '#16A34A' : '#DC2626'};"></span>${item.isVeg ? 'Veg' : 'Non-Veg'}</span>
            <span style="color:var(--star);">★ ${Number(item.rating || 0).toFixed(1)}</span>
          </div>
        </div>`).join('')
    : '<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-secondary);">No menu items yet.</div>';

  window.saveProfile = async function() {
    const btn = document.getElementById('saveBtn'); if (btn) btn.disabled = true;
    try {
      const updates = {
        phone: getVal('edit-phone'), email: getVal('edit-email'),
        location: getVal('edit-address'), instagram: getVal('edit-insta'),
        about: getVal('edit-about'), updatedAt: serverTimestamp()
      };
      await updateDoc(doc(db, 'vendors', user.uid), updates);
      setDisp('phone', updates.phone); setDisp('email', updates.email); setDisp('address', updates.location); setDisp('insta', updates.instagram); setDisp('about', updates.about);
      const pLoc = document.getElementById('profileLocation'); if (pLoc) pLoc.textContent = updates.location || '—';
      window.editMode = true;
      if (typeof toggleEdit === 'function') toggleEdit();
      showToast();
    } catch (err) { alert('Error: ' + err.message); }
    finally { if (btn) btn.disabled = false; }
  };
}
