/**
 * admin-bookings.js — Hotel HMT Empire
 * Firestore bookings table for admin panel.
 */

import { db }          from '../firebase-config.js';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { Config }      from '../constants/config.js';
import { sanitize }    from '../modules/security.js';
import { getWhatsAppUrl } from '../modules/whatsapp.js';
import { BookingStatus, BookingStatusMeta } from '../constants/amenities.js';

let bookingsLoaded = false;

export async function initAdminBookings() {
  if (bookingsLoaded) return;
  bookingsLoaded = true;
  await loadBookings();
}

async function loadBookings() {
  const wrap = document.getElementById('bookings-table-wrap');
  const countEl = document.getElementById('bookings-count');
  if (!wrap) return;

  wrap.innerHTML = '<div style="display:flex;align-items:center;gap:1rem;color:var(--clr-text-muted)"><div class="spinner"></div> Loading bookings…</div>';

  try {
    const snap = await getDocs(query(
      collection(db, Config.COLLECTIONS.BOOKINGS),
      orderBy('createdAt', 'desc')
    ));

    const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (countEl) countEl.textContent = `${bookings.length} booking(s)`;

    if (bookings.length === 0) {
      wrap.innerHTML = '<p style="color:var(--clr-text-muted)">No bookings yet.</p>';
      return;
    }

    renderBookingsTable(wrap, bookings);

  } catch (err) {
    wrap.innerHTML = `<p style="color:var(--clr-error)">Failed to load bookings: ${sanitize(err.message)}</p>`;
  }
}

function renderBookingsTable(wrap, bookings) {
  const table = document.createElement('table');
  table.className = 'admin-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Booking ID</th>
        <th>Guest</th>
        <th>Phone</th>
        <th>Room</th>
        <th>Check-in</th>
        <th>Check-out</th>
        <th>Guests</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="bookings-tbody"></tbody>
  `;

  const tbody = table.querySelector('#bookings-tbody');

  bookings.forEach(booking => {
    const meta = BookingStatusMeta[booking.status] || BookingStatusMeta[BookingStatus.PENDING];
    const tr   = document.createElement('tr');

    tr.innerHTML = `
      <td><code style="font-size:var(--fs-xs);color:var(--clr-gold)">${sanitize(booking.bookingId || booking.id)}</code></td>
      <td>${sanitize(booking.guestName || '—')}</td>
      <td><a href="tel:${sanitize(booking.guestPhone)}" style="color:var(--clr-gold)">${sanitize(booking.guestPhone || '—')}</a></td>
      <td>${sanitize(booking.roomName || booking.roomType || '—')}</td>
      <td>${sanitize(booking.checkIn || '—')}</td>
      <td>${sanitize(booking.checkOut || '—')}</td>
      <td>${sanitize(String(booking.guests || '—'))}</td>
      <td><span class="status ${meta.colorClass}">${meta.label}</span></td>
      <td>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button class="btn btn--sm" style="background:var(--clr-success-bg);color:var(--clr-success);border:1px solid var(--clr-success)"
                  data-id="${booking.id}" data-action="confirm">✓ Confirm</button>
          <button class="btn btn--sm" style="background:var(--clr-error-bg);color:var(--clr-error);border:1px solid var(--clr-error)"
                  data-id="${booking.id}" data-action="cancel">✕ Cancel</button>
          <a class="btn btn--sm" style="background:var(--clr-whatsapp-bg);color:var(--clr-whatsapp);border:1px solid var(--clr-whatsapp);text-decoration:none"
             href="${getWhatsAppUrl('booking', `Booking ${sanitize(booking.bookingId || '')}: ${sanitize(booking.guestName || '')}, ${sanitize(booking.checkIn || '')} to ${sanitize(booking.checkOut || '')}`)}"
             target="_blank" rel="noopener">💬</a>
        </div>
      </td>
    `;

    // Action buttons
    tr.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => updateBookingStatus(booking.id, btn.dataset.action));
    });

    tbody.appendChild(tr);
  });

  wrap.innerHTML = '';
  wrap.appendChild(table);
}

async function updateBookingStatus(docId, action) {
  const newStatus = action === 'confirm' ? BookingStatus.CONFIRMED : BookingStatus.CANCELLED;
  try {
    await updateDoc(doc(db, Config.COLLECTIONS.BOOKINGS, docId), { status: newStatus });
    bookingsLoaded = false;
    await loadBookings(); // Refresh
  } catch {
    // Fail silently in production
  }
}
