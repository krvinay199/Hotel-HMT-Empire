/**
 * admin-rfq.js — Hotel HMT Empire
 * Manage RFQ enquiries from admin panel.
 */

import { db }       from '../firebase-config.js';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { Config }   from '../constants/config.js';
import { sanitize } from '../modules/security.js';
import { getWhatsAppUrl } from '../modules/whatsapp.js';
import { RFQStatus } from '../constants/amenities.js';

let rfqLoaded = false;

export async function initAdminRFQ() {
  if (rfqLoaded) return;
  rfqLoaded = true;
  await loadRFQs();
}

async function loadRFQs() {
  const wrap   = document.getElementById('rfq-table-wrap');
  const countEl = document.getElementById('rfq-count');
  if (!wrap) return;

  wrap.innerHTML = '<div style="display:flex;align-items:center;gap:1rem;color:var(--clr-text-muted)"><div class="spinner"></div> Loading enquiries…</div>';

  try {
    const snap = await getDocs(query(
      collection(db, Config.COLLECTIONS.RFQ_ENQUIRIES),
      orderBy('createdAt', 'desc')
    ));
    const rfqs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (countEl) countEl.textContent = `${rfqs.length} enquir${rfqs.length === 1 ? 'y' : 'ies'}`;

    if (rfqs.length === 0) {
      wrap.innerHTML = '<p style="color:var(--clr-text-muted)">No enquiries yet.</p>';
      return;
    }

    renderRFQTable(wrap, rfqs);
  } catch (err) {
    wrap.innerHTML = `<p style="color:var(--clr-error)">Failed to load: ${sanitize(err.message)}</p>`;
  }
}

function renderRFQTable(wrap, rfqs) {
  const table = document.createElement('table');
  table.className = 'admin-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Ref ID</th><th>Event</th><th>Dates</th><th>Guests</th><th>Contact</th><th>Status</th><th>Actions</th>
      </tr>
    </thead>
    <tbody id="rfq-tbody"></tbody>
  `;

  const tbody = table.querySelector('#rfq-tbody');
  const statusColors = {
    [RFQStatus.NEW]:       'status--warning',
    [RFQStatus.CONTACTED]: 'status--info',
    [RFQStatus.QUOTED]:    'status--success',
    [RFQStatus.CLOSED]:    'status--muted',
    [RFQStatus.LOST]:      'status--error',
  };

  rfqs.forEach(rfq => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code style="font-size:var(--fs-xs);color:var(--clr-gold)">${sanitize(rfq.refId || rfq.id)}</code></td>
      <td style="text-transform:capitalize">${sanitize(rfq.eventType || '—')}</td>
      <td style="font-size:var(--fs-xs)">${sanitize(rfq.dateFrom || '—')} → ${sanitize(rfq.dateTo || '—')}</td>
      <td>${sanitize(String(rfq.guests || '—'))}</td>
      <td>
        <div style="font-weight:600">${sanitize(rfq.name || '—')}</div>
        <div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">${sanitize(rfq.phone || '—')}</div>
      </td>
      <td>
        <select class="form-select" data-id="${rfq.id}" data-action="status"
                style="height:2rem;font-size:var(--fs-xs);width:120px">
          ${Object.values(RFQStatus).map(s => `
            <option value="${s}" ${rfq.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>
          `).join('')}
        </select>
      </td>
      <td>
        <div style="display:flex;gap:0.5rem">
          <a class="btn btn--sm" style="background:var(--clr-whatsapp-bg);color:var(--clr-whatsapp);border:1px solid var(--clr-whatsapp);text-decoration:none"
             href="${getWhatsAppUrl('event', `RFQ Ref: ${sanitize(rfq.refId || '')} | ${sanitize(rfq.name || '')} | ${sanitize(rfq.phone || '')} | Event: ${sanitize(rfq.eventType || '')}, ${sanitize(rfq.dateFrom || '')}`)}"
             target="_blank" rel="noopener">💬 Reply</a>
        </div>
      </td>
    `;

    // Status change
    tr.querySelector('select[data-action="status"]')?.addEventListener('change', async (e) => {
      await updateDoc(doc(db, Config.COLLECTIONS.RFQ_ENQUIRIES, rfq.id), { status: e.target.value });
    });

    tbody.appendChild(tr);
  });

  wrap.innerHTML = '';
  wrap.appendChild(table);
}
