/**
 * admin-rooms.js — Hotel HMT Empire
 * Manage room inventory from admin panel.
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
import { RoomTypes }   from '../constants/amenities.js';
import { sanitize }    from '../modules/security.js';

let roomsLoaded = false;
let editingRoomId = null; // Stores document ID when editing

export async function initAdminRooms() {
  if (roomsLoaded) return;
  roomsLoaded = true;
  editingRoomId = null;
  await loadRooms();
  document.getElementById('add-room-btn')?.addEventListener('click', () => {
    editingRoomId = null;
    showAddRoomForm();
  });
}

// ── Load & Render ─────────────────────────────────────────────────────────

async function loadRooms() {
  const wrap = document.getElementById('rooms-table-wrap');
  if (!wrap) return;

  wrap.innerHTML = '<div style="display:flex;align-items:center;gap:1rem;color:var(--clr-text-muted)"><div class="spinner"></div> Loading rooms…</div>';

  try {
    const snap  = await getDocs(collection(db, Config.COLLECTIONS.ROOMS));
    const rooms = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (rooms.length === 0) {
      wrap.innerHTML = '<p style="color:var(--clr-text-muted)">No rooms added yet. Click "+ Add Room" to get started.</p>';
      return;
    }

    renderRoomsTable(wrap, rooms);
  } catch (err) {
    wrap.innerHTML = `<p style="color:var(--clr-error)">Failed to load rooms: ${sanitize(err.message)}</p>`;
  }
}

function renderRoomsTable(wrap, rooms) {
  const table = document.createElement('table');
  table.className = 'admin-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Image</th><th>Name</th><th>Type</th><th>Price/Night</th><th>Max Guests</th><th>Available</th><th>Actions</th>
      </tr>
    </thead>
    <tbody id="rooms-tbody"></tbody>
  `;

  const tbody = table.querySelector('#rooms-tbody');
  rooms.forEach(room => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        ${room.image
          ? `<img src="${sanitize(room.image)}" alt="${sanitize(room.name || '')}"
                  style="width:64px;height:48px;object-fit:cover;border-radius:6px;border:1px solid var(--clr-border-subtle)">`
          : `<div style="width:64px;height:48px;background:var(--clr-bg-subtle);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.5rem">🛏️</div>`}
      </td>
      <td>${sanitize(room.name || '—')}</td>
      <td>${sanitize(room.type || '—')}</td>
      <td>₹${room.price?.toLocaleString('en-IN') || '—'}</td>
      <td>${sanitize(String(room.maxGuests || '—'))}</td>
      <td>
        <span class="status ${room.available !== false ? 'status--success' : 'status--error'}">
          ${room.available !== false ? 'Available' : 'Unavailable'}
        </span>
      </td>
      <td>
        <div style="display:flex;gap:0.5rem">
          <button class="btn btn--sm btn--primary" data-id="${room.id}" data-action="edit">Edit</button>
          <button class="btn btn--sm btn--secondary" data-id="${room.id}" data-action="toggle">
            ${room.available !== false ? 'Mark Unavailable' : 'Mark Available'}
          </button>
          <button class="btn btn--sm" style="background:var(--clr-error-bg);color:var(--clr-error);border:1px solid var(--clr-error)"
                  data-id="${room.id}" data-action="delete">Delete</button>
        </div>
      </td>
    `;

    tr.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'toggle') toggleRoomAvailability(room.id, room.available !== false);
        else if (action === 'delete') deleteRoom(room.id, room.name);
        else if (action === 'edit') {
          editingRoomId = room.id;
          showAddRoomForm(room);
        }
      });
    });

    tbody.appendChild(tr);
  });

  wrap.innerHTML = '';
  wrap.appendChild(table);
}

// ── Toggle / Delete ───────────────────────────────────────────────────────

async function toggleRoomAvailability(docId, currentAvailable) {
  await updateDoc(doc(db, Config.COLLECTIONS.ROOMS, docId), { available: !currentAvailable });
  roomsLoaded = false;
  await loadRooms();
}

async function deleteRoom(docId, name) {
  if (!confirm(`Delete room "${name}"? This cannot be undone.`)) return;
  await deleteDoc(doc(db, Config.COLLECTIONS.ROOMS, docId));
  roomsLoaded = false;
  await loadRooms();
}

// ── Add/Edit Room Form ─────────────────────────────────────────────────────────

function showAddRoomForm(room = null) {
  const wrap = document.getElementById('rooms-table-wrap');

  const container = document.createElement('div');
  container.style.cssText = 'background:var(--clr-bg-card);border:1px solid var(--clr-border-subtle);border-radius:var(--radius-xl);padding:var(--sp-8);max-width:640px;display:flex;flex-direction:column;gap:var(--sp-5);';

  const isEdit = room !== null;

  container.innerHTML = `
    <h3 style="font-family:var(--font-display);font-size:var(--fs-2xl);color:var(--clr-text-primary)">
      ${isEdit ? 'Edit Room Settings' : 'Add New Room'}
    </h3>

    <!-- Room Name -->
    <div class="form-field">
      <label class="form-label">Room Name *</label>
      <input class="form-input" id="nr-name" required placeholder="e.g. Deluxe King Room" value="${isEdit ? sanitize(room.name || '') : ''}" />
    </div>

    <!-- Room Type -->
    <div class="form-field">
      <label class="form-label">Room Type *</label>
      <select class="form-select" id="nr-type">
        ${RoomTypes.map(r => `<option value="${r.id}" ${isEdit && room.type === r.id ? 'selected' : ''}>${sanitize(r.label)}</option>`).join('')}
      </select>
    </div>

    <!-- Price / Guests row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4)">
      <div class="form-field">
        <label class="form-label">Price Per Night (₹) *</label>
        <input class="form-input" type="number" id="nr-price" min="0" placeholder="2500" required value="${isEdit ? room.price : ''}" />
      </div>
      <div class="form-field">
        <label class="form-label">Max Guests *</label>
        <input class="form-input" type="number" id="nr-guests" min="1" max="10" required value="${isEdit ? room.maxGuests : '2'}" />
      </div>
    </div>

    <!-- Image Upload -->
    <div class="form-field">
      <label class="form-label">Room Photo</label>

      <!-- Drop zone -->
      <div id="nr-dropzone"
           style="border:2px dashed var(--clr-border-subtle);border-radius:var(--radius-lg);padding:var(--sp-6);
                  text-align:center;cursor:pointer;transition:border-color 0.2s;position:relative;overflow:hidden;
                  background:var(--clr-bg-subtle)">
        <div id="nr-drop-content">
          ${isEdit && room.image
            ? `<img src="${sanitize(room.image)}" alt="Preview" style="max-height:160px;border-radius:var(--radius-md);object-fit:cover;margin-bottom:var(--sp-2)" />
               <div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">Current photo displayed above</div>`
            : `<div style="font-size:2.5rem;margin-bottom:var(--sp-2)">📷</div>
               <div style="color:var(--clr-text-primary);font-weight:var(--fw-medium);margin-bottom:var(--sp-1)">
                 Click to upload or drag & drop
               </div>
               <div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">JPG, PNG, WEBP · Max 5 MB</div>`
          }
        </div>
        <input type="file" id="nr-file" accept="image/jpeg,image/png,image/webp"
               style="position:absolute;inset:0;opacity:0;cursor:pointer;" />
      </div>

      <!-- Upload progress (hidden by default) -->
      <div id="nr-upload-progress" style="display:none;margin-top:var(--sp-2)">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);color:var(--clr-text-muted);margin-bottom:4px">
          <span id="nr-upload-filename"></span>
          <span id="nr-upload-pct">0%</span>
        </div>
        <div style="background:var(--clr-bg-subtle);border-radius:999px;height:6px;overflow:hidden">
          <div id="nr-upload-bar"
               style="height:100%;width:0%;background:var(--gradient-gold);border-radius:999px;transition:width 0.2s"></div>
        </div>
      </div>

      <!-- OR manual URL -->
      <div style="display:flex;align-items:center;gap:var(--sp-3);margin-top:var(--sp-3)">
        <div style="flex:1;height:1px;background:var(--clr-border-subtle)"></div>
        <span style="font-size:var(--fs-xs);color:var(--clr-text-muted)">or paste URL</span>
        <div style="flex:1;height:1px;background:var(--clr-border-subtle)"></div>
      </div>
      <input class="form-input" type="url" id="nr-image" placeholder="https://…"
             style="margin-top:var(--sp-2)" value="${isEdit ? sanitize(room.image || '') : ''}" />
    </div>

    <!-- Description -->
    <div class="form-field">
      <label class="form-label">Description</label>
      <textarea class="form-textarea" id="nr-desc" rows="3"
                placeholder="Briefly describe the room features…">${isEdit ? sanitize(room.description || '') : ''}</textarea>
    </div>

    <!-- Error -->
    <div id="nr-error" style="color:var(--clr-error);font-size:var(--fs-sm);display:none"></div>

    <!-- Buttons -->
    <div style="display:flex;gap:var(--sp-4)">
      <button type="button" class="btn btn--primary" id="nr-save-btn">${isEdit ? 'Save Changes' : 'Save Room'}</button>
      <button type="button" class="btn btn--ghost" id="nr-cancel-btn">Cancel</button>
    </div>
  `;

  wrap.innerHTML = '';
  wrap.appendChild(container);

  // ── Dropzone highlight on hover ──
  const dropzone = container.querySelector('#nr-dropzone');
  const fileInput = container.querySelector('#nr-file');

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
  container.querySelector('#nr-save-btn').addEventListener('click', () => saveRoom(container));
  container.querySelector('#nr-cancel-btn').addEventListener('click', () => {
    editingRoomId = null;
    roomsLoaded = false;
    loadRooms();
  });
}

// ── Image Upload Logic ────────────────────────────────────────────────────

function handleImageFile(file, container) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  const errorEl  = container.querySelector('#nr-error');

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
  const dropContent = container.querySelector('#nr-drop-content');
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
  uploadRoomImage(file, container);
}

function uploadRoomImage(file, container) {
  const progressWrap = container.querySelector('#nr-upload-progress');
  const bar          = container.querySelector('#nr-upload-bar');
  const pctEl        = container.querySelector('#nr-upload-pct');
  const filenameEl   = container.querySelector('#nr-upload-filename');
  const imageInput   = container.querySelector('#nr-image');
  const saveBtn      = container.querySelector('#nr-save-btn');
  const errorEl      = container.querySelector('#nr-error');

  const path      = `rooms/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
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
      saveBtn.textContent = editingRoomId ? 'Save Changes' : 'Save Room';
      showError(errorEl, `Upload failed: ${sanitize(err.message)}`);
    },
    async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      imageInput.value = url; // auto-fill URL field
      bar.style.width  = '100%';
      pctEl.textContent = '✅ Done';
      saveBtn.disabled = false;
      saveBtn.textContent = editingRoomId ? 'Save Changes' : 'Save Room';
    }
  );
}

// ── Save to Firestore (Add/Update) ────────────────────────────────────────

async function saveRoom(container) {
  const name   = sanitize(container.querySelector('#nr-name')?.value?.trim() || '');
  const type   = container.querySelector('#nr-type')?.value;
  const price  = parseInt(container.querySelector('#nr-price')?.value || '0', 10);
  const guests = parseInt(container.querySelector('#nr-guests')?.value || '2', 10);
  const image  = sanitize(container.querySelector('#nr-image')?.value?.trim() || '');
  const desc   = sanitize(container.querySelector('#nr-desc')?.value?.trim() || '');
  const errorEl = container.querySelector('#nr-error');
  const saveBtn = container.querySelector('#nr-save-btn');

  if (!name)  { showError(errorEl, 'Room name is required.'); return; }
  if (!price) { showError(errorEl, 'Price per night is required.'); return; }
  hideError(errorEl);

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    const roomData = {
      name, type, price, maxGuests: guests, image, description: desc,
    };

    if (editingRoomId) {
      // UPDATE existing document
      await updateDoc(doc(db, Config.COLLECTIONS.ROOMS, editingRoomId), roomData);
      editingRoomId = null;
    } else {
      // CREATE new document
      await addDoc(collection(db, Config.COLLECTIONS.ROOMS), {
        ...roomData,
        available: true,
        amenities: [],
        createdAt: serverTimestamp(),
      });
    }

    roomsLoaded = false;
    await loadRooms();
  } catch (err) {
    showError(errorEl, `Failed to save room: ${sanitize(err.message)}`);
    saveBtn.disabled = false;
    saveBtn.textContent = editingRoomId ? 'Save Changes' : 'Save Room';
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
