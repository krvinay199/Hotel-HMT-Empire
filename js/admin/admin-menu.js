/**
 * admin-menu.js — Hotel HMT Empire
 * Manage restaurant menu items from admin panel.
 * Supports Firebase Storage image upload and full editing (CRUD).
 */

import { db, storage }  from '../firebase-config.js';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL,
} from 'firebase/storage';
import { Config }      from '../constants/config.js';
import { MenuCategories } from '../constants/amenities.js';
import { sanitize }    from '../modules/security.js';

let menuLoaded = false;
let editingMenuId = null; // Stores document ID when editing

export async function initAdminMenu() {
  if (menuLoaded) return;
  menuLoaded = true;
  editingMenuId = null;
  await loadMenu();
  document.getElementById('add-menu-btn')?.addEventListener('click', () => {
    editingMenuId = null;
    showAddMenuForm();
  });
}

// ── Load & Render ─────────────────────────────────────────────────────────

async function loadMenu() {
  const wrap = document.getElementById('menu-table-wrap');
  if (!wrap) return;

  wrap.innerHTML = '<div style="display:flex;align-items:center;gap:1rem;color:var(--clr-text-muted)"><div class="spinner"></div> Loading menu…</div>';

  try {
    const snap  = await getDocs(collection(db, Config.COLLECTIONS.MENU_ITEMS));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (items.length === 0) {
      wrap.innerHTML = '<p style="color:var(--clr-text-muted)">No menu items yet. Click "+ Add Item" to get started.</p>';
      return;
    }

    renderMenuTable(wrap, items);
  } catch (err) {
    wrap.innerHTML = `<p style="color:var(--clr-error)">Failed to load menu: ${sanitize(err.message)}</p>`;
  }
}

function renderMenuTable(wrap, items) {
  const table = document.createElement('table');
  table.className = 'admin-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Veg</th><th>Chef's Pick</th><th>Actions</th>
      </tr>
    </thead>
    <tbody id="menu-tbody"></tbody>
  `;

  const tbody = table.querySelector('#menu-tbody');
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        ${item.image
          ? `<img src="${sanitize(item.image)}" alt="${sanitize(item.name || '')}"
                  style="width:64px;height:48px;object-fit:cover;border-radius:6px;border:1px solid var(--clr-border-subtle)">`
          : `<div style="width:64px;height:48px;background:var(--clr-bg-subtle);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.5rem">🍽️</div>`}
      </td>
      <td>${sanitize(item.name || '—')}</td>
      <td style="text-transform:capitalize">${sanitize(item.category || '—')}</td>
      <td>₹${item.price?.toLocaleString('en-IN') || '—'}</td>
      <td>${item.isVeg ? '🌿 Yes' : '🍖 No'}</td>
      <td>${item.isChefPick ? '⭐ Yes' : '—'}</td>
      <td>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn--sm btn--primary" data-id="${item.id}" data-action="edit">Edit</button>
          <button class="btn btn--sm" style="background:var(--clr-error-bg);color:var(--clr-error);border:1px solid var(--clr-error)"
                  data-id="${item.id}" data-action="delete">Delete</button>
        </div>
      </td>
    `;

    tr.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'delete') deleteMenuItem(item.id, item.name);
        else if (action === 'edit') {
          editingMenuId = item.id;
          showAddMenuForm(item);
        }
      });
    });

    tbody.appendChild(tr);
  });

  wrap.innerHTML = '';
  wrap.appendChild(table);
}

// ── Delete ───────────────────────────────────────────────────────────────

async function deleteMenuItem(docId, name) {
  if (!confirm(`Delete menu item "${name}"? This cannot be undone.`)) return;
  await deleteDoc(doc(db, Config.COLLECTIONS.MENU_ITEMS, docId));
  menuLoaded = false;
  await loadMenu();
}

// ── Add/Edit Menu Form ─────────────────────────────────────────────────────────

function showAddMenuForm(item = null) {
  const wrap = document.getElementById('menu-table-wrap');

  const container = document.createElement('div');
  container.style.cssText = 'background:var(--clr-bg-card);border:1px solid var(--clr-border-subtle);border-radius:var(--radius-xl);padding:var(--sp-8);max-width:640px;display:flex;flex-direction:column;gap:var(--sp-5);';

  const isEdit = item !== null;

  container.innerHTML = `
    <h3 style="font-family:var(--font-display);font-size:var(--fs-2xl);color:var(--clr-text-primary)">
      ${isEdit ? 'Edit Menu Item' : 'Add Menu Item'}
    </h3>

    <!-- Dish Name -->
    <div class="form-field">
      <label class="form-label">Dish Name *</label>
      <input class="form-input" id="nm-name" required placeholder="e.g. Kadhai Paneer" value="${isEdit ? sanitize(item.name || '') : ''}" />
    </div>

    <!-- Category -->
    <div class="form-field">
      <label class="form-label">Category *</label>
      <select class="form-select" id="nm-category">
        ${MenuCategories.map(c => `<option value="${c.id}" ${isEdit && item.category === c.id ? 'selected' : ''}>${sanitize(c.label)}</option>`).join('')}
      </select>
    </div>

    <!-- Price -->
    <div class="form-field">
      <label class="form-label">Price (₹) *</label>
      <input class="form-input" type="number" id="nm-price" min="0" placeholder="280" required value="${isEdit ? item.price : ''}" />
    </div>

    <!-- Checkboxes row -->
    <div style="display:flex;gap:var(--sp-8);margin-top:var(--sp-1)">
      <label style="display:flex;align-items:center;gap:var(--sp-2);cursor:pointer;font-size:var(--fs-sm);color:var(--clr-text-primary)">
        <input type="checkbox" id="nm-veg" ${!isEdit || item.isVeg ? 'checked' : ''} /> 🌿 Vegetarian
      </label>
      <label style="display:flex;align-items:center;gap:var(--sp-2);cursor:pointer;font-size:var(--fs-sm);color:var(--clr-text-primary)">
        <input type="checkbox" id="nm-chef" ${isEdit && item.isChefPick ? 'checked' : ''} /> ⭐ Chef's Pick
      </label>
    </div>

    <!-- Image Upload -->
    <div class="form-field">
      <label class="form-label">Dish Photo</label>

      <!-- Drop zone -->
      <div id="nm-dropzone"
           style="border:2px dashed var(--clr-border-subtle);border-radius:var(--radius-lg);padding:var(--sp-6);
                  text-align:center;cursor:pointer;transition:border-color 0.2s;position:relative;overflow:hidden;
                  background:var(--clr-bg-subtle)">
        <div id="nm-drop-content">
          ${isEdit && item.image
            ? `<img src="${sanitize(item.image)}" alt="Preview" style="max-height:160px;border-radius:var(--radius-md);object-fit:cover;margin-bottom:var(--sp-2)" />
               <div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">Current photo displayed above</div>`
            : `<div style="font-size:2.5rem;margin-bottom:var(--sp-2)">📷</div>
               <div style="color:var(--clr-text-primary);font-weight:var(--fw-medium);margin-bottom:var(--sp-1)">
                 Click to upload or drag & drop
               </div>
               <div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">JPG, PNG, WEBP · Max 5 MB</div>`
          }
        </div>
        <input type="file" id="nm-file" accept="image/jpeg,image/png,image/webp"
               style="position:absolute;inset:0;opacity:0;cursor:pointer;" />
      </div>

      <!-- Upload progress (hidden by default) -->
      <div id="nm-upload-progress" style="display:none;margin-top:var(--sp-2)">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--clr-text-muted);margin-bottom:4px">
          <span id="nm-upload-filename"></span>
          <span id="nm-upload-pct">0%</span>
        </div>
        <div style="background:var(--clr-bg-subtle);border-radius:999px;height:6px;overflow:hidden">
          <div id="nm-upload-bar"
               style="height:100%;width:0%;background:var(--gradient-gold);border-radius:999px;transition:width 0.2s"></div>
        </div>
      </div>

      <!-- OR manual URL -->
      <div style="display:flex;align-items:center;gap:var(--sp-3);margin-top:var(--sp-3)">
        <div style="flex:1;height:1px;background:var(--clr-border-subtle)"></div>
        <span style="font-size:var(--fs-xs);color:var(--clr-text-muted)">or paste URL</span>
        <div style="flex:1;height:1px;background:var(--clr-border-subtle)"></div>
      </div>
      <input class="form-input" type="url" id="nm-image" placeholder="https://…"
             style="margin-top:var(--sp-2)" value="${isEdit ? sanitize(item.image || '') : ''}" />
    </div>

    <!-- Description -->
    <div class="form-field">
      <label class="form-label">Description</label>
      <textarea class="form-textarea" id="nm-desc" rows="2"
                placeholder="List ingredients or taste highlights…">${isEdit ? sanitize(item.description || '') : ''}</textarea>
    </div>

    <!-- Error -->
    <div id="nm-error" style="color:var(--clr-error);font-size:var(--fs-sm);display:none"></div>

    <!-- Buttons -->
    <div style="display:flex;gap:var(--sp-4)">
      <button type="button" class="btn btn--primary" id="nm-save-btn">${isEdit ? 'Save Changes' : 'Save Item'}</button>
      <button type="button" class="btn btn--ghost" id="nm-cancel-btn">Cancel</button>
    </div>
  `;

  wrap.innerHTML = '';
  wrap.appendChild(container);

  // ── Dropzone highlight on hover ──
  const dropzone = container.querySelector('#nm-dropzone');
  const fileInput = container.querySelector('#nm-file');

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--clr-gold)';
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'var(--clr-border-subtle)';
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--clr-border-subtle)';
    const file = e.dataTransfer?.files?.[0];
    if (file) handleImageFile(file, container);
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) handleImageFile(file, container);
  });

  // ── Save button ──
  container.querySelector('#nm-save-btn').addEventListener('click', () => saveMenu(container));
  container.querySelector('#nm-cancel-btn').addEventListener('click', () => {
    editingMenuId = null;
    menuLoaded = false;
    loadMenu();
  });
}

// ── Image Upload Logic ────────────────────────────────────────────────────

function handleImageFile(file, container) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  const errorEl  = container.querySelector('#nm-error');

  if (!file.type.startsWith('image/')) {
    showError(errorEl, 'Please select a valid image file (JPG, PNG, WEBP).');
    return;
  }
  if (file.size > MAX_SIZE) {
    showError(errorEl, 'Image is too large. Maximum size is 5 MB.');
    return;
  }
  hideError(errorEl);

  // Show image preview inside dropzone
  const dropContent = container.querySelector('#nm-drop-content');
  const reader = new FileReader();
  reader.onload = (e) => {
    dropContent.innerHTML = `
      <img src="${e.target.result}" alt="Preview"
           style="max-height:160px;border-radius:var(--radius-md);object-fit:cover;margin-bottom:var(--sp-2)" />
      <div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">${sanitize(file.name)}</div>
    `;
  };
  reader.readAsDataURL(file);

  // Upload to Firebase Storage
  uploadMenuImage(file, container);
}

function uploadMenuImage(file, container) {
  const progressWrap = container.querySelector('#nm-upload-progress');
  const bar          = container.querySelector('#nm-upload-bar');
  const pctEl        = container.querySelector('#nm-upload-pct');
  const filenameEl   = container.querySelector('#nm-upload-filename');
  const imageInput   = container.querySelector('#nm-image');
  const saveBtn      = container.querySelector('#nm-save-btn');
  const errorEl      = container.querySelector('#nm-error');

  const path      = `menu/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const storageRef = ref(storage, path);
  const task       = uploadBytesResumable(storageRef, file);

  progressWrap.style.display = 'block';
  filenameEl.textContent = file.name;
  saveBtn.disabled = true;
  saveBtn.textContent = 'Uploading…';

  task.on('state_changed',
    (snapshot) => {
      const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      bar.style.width  = `${pct}%`;
      pctEl.textContent = `${pct}%`;
    },
    (err) => {
      progressWrap.style.display = 'none';
      saveBtn.disabled = false;
      saveBtn.textContent = editingMenuId ? 'Save Changes' : 'Save Item';
      showError(errorEl, `Upload failed: ${sanitize(err.message)}`);
    },
    async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      imageInput.value = url; // auto-fill URL field
      bar.style.width  = '100%';
      pctEl.textContent = '✅ Done';
      saveBtn.disabled = false;
      saveBtn.textContent = editingMenuId ? 'Save Changes' : 'Save Item';
    }
  );
}

// ── Save to Firestore (Add/Update) ────────────────────────────────────────

async function saveMenu(container) {
  const name       = sanitize(container.querySelector('#nm-name')?.value?.trim() || '');
  const category   = container.querySelector('#nm-category')?.value;
  const price      = parseInt(container.querySelector('#nm-price')?.value || '0', 10);
  const isVeg      = container.querySelector('#nm-veg')?.checked === true;
  const isChefPick = container.querySelector('#nm-chef')?.checked === true;
  const image      = sanitize(container.querySelector('#nm-image')?.value?.trim() || '');
  const desc       = sanitize(container.querySelector('#nm-desc')?.value?.trim() || '');
  const errorEl    = container.querySelector('#nm-error');
  const saveBtn    = container.querySelector('#nm-save-btn');

  if (!name)  { showError(errorEl, 'Dish name is required.'); return; }
  if (!price) { showError(errorEl, 'Price is required.'); return; }
  hideError(errorEl);

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    const itemData = {
      name, category, price, isVeg, isChefPick, image, description: desc,
    };

    if (editingMenuId) {
      // UPDATE existing document
      await updateDoc(doc(db, Config.COLLECTIONS.MENU_ITEMS, editingMenuId), itemData);
      editingMenuId = null;
    } else {
      // CREATE new document
      await addDoc(collection(db, Config.COLLECTIONS.MENU_ITEMS), {
        ...itemData,
        createdAt: serverTimestamp(),
      });
    }

    menuLoaded = false;
    await loadMenu();
  } catch (err) {
    showError(errorEl, `Failed to save menu item: ${sanitize(err.message)}`);
    saveBtn.disabled = false;
    saveBtn.textContent = editingMenuId ? 'Save Changes' : 'Save Item';
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError(el) {
  if (!el) return;
  el.style.display = 'none';
}
