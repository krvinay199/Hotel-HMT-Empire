/**
 * banquet.js — Hotel HMT Empire
 * Banquet layout selector + SVG seating visualizer.
 */

import { Config }          from '../constants/config.js';
import { Strings }         from '../constants/strings.js';
import { BanquetLayouts }  from '../constants/amenities.js';
import { sanitize }        from './security.js';
import { getWhatsAppUrl }  from './whatsapp.js';
import { scrollTo }        from './lenis-scroll.js';

let currentLayout = BanquetLayouts[0];

export function initBanquet() {
  renderLayoutButtons();
  renderSVGLayout(currentLayout);
  initCTAs();
}

function renderLayoutButtons() {
  const container = document.getElementById('banquet-layouts');
  if (!container) return;

  BanquetLayouts.forEach((layout, i) => {
    const btn = document.createElement('button');
    btn.type       = 'button';
    btn.className  = `banquet__layout-btn${i === 0 ? ' is-active' : ''}`;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(i === 0));
    btn.innerHTML  = `${layout.icon} ${sanitize(layout.label)}`;
    btn.addEventListener('click', () => selectLayout(layout, btn));
    container.appendChild(btn);
  });

  // Set initial description
  updateDescription(BanquetLayouts[0]);
}

function selectLayout(layout, clickedBtn) {
  currentLayout = layout;

  // Update button states
  document.querySelectorAll('.banquet__layout-btn').forEach(b => {
    b.classList.remove('is-active');
    b.setAttribute('aria-checked', 'false');
  });
  clickedBtn.classList.add('is-active');
  clickedBtn.setAttribute('aria-checked', 'true');

  // Update capacity displays
  const capEl    = document.getElementById('banquet-capacity');
  const vizCapEl = document.getElementById('banquet-viz-cap');
  if (capEl)    capEl.textContent = layout.capacity;
  if (vizCapEl) vizCapEl.textContent = layout.capacity;

  updateDescription(layout);
  renderSVGLayout(layout);
  updateBanquetWhatsAppBtn();
}

function updateDescription(layout) {
  const el = document.getElementById('banquet-description');
  if (el) el.textContent = layout.description;
}

/** SVG layout renderer — draws a simplified 2D seating diagram */
function renderSVGLayout(layout) {
  const svg = document.getElementById('banquet-svg');
  if (!svg) return;

  svg.innerHTML = '';

  const W = 400, H = 300;
  const ns = 'http://www.w3.org/2000/svg';

  const addEl = (tag, attrs) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    svg.appendChild(el);
    return el;
  };

  // Background
  addEl('rect', { x: 0, y: 0, width: W, height: H, fill: 'var(--clr-bg-secondary)', rx: 8 });

  // Label
  const label = addEl('text', { x: W / 2, y: 20, class: 'svg-label', style: 'font-size:10px; fill:var(--clr-gold); text-anchor:middle; font-family:var(--font-body)' });
  label.textContent = layout.label.toUpperCase();

  switch (layout.svgLayout) {
    case 'theatre':   drawTheatre(addEl, W, H);   break;
    case 'classroom': drawClassroom(addEl, W, H); break;
    case 'banquet':   drawBanquet(addEl, W, H);   break;
    case 'ushape':    drawUShape(addEl, W, H);    break;
    case 'cocktail':  drawCocktail(addEl, W, H);  break;
    default:          drawTheatre(addEl, W, H);
  }

  // Animate: fade-in
  if (window.gsap) {
    window.gsap.fromTo(svg, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
  }
}

// ── SVG Layout Renderers ───────────────────────────────────────────────

function drawTheatre(addEl, W, H) {
  // Stage
  addEl('rect', { x: W * 0.3, y: H - 50, width: W * 0.4, height: 28, rx: 4, class: 'svg-stage' });
  const stageLabel = addEl('text', { x: W / 2, y: H - 32, class: 'svg-label' });
  stageLabel.textContent = 'STAGE';

  // Rows of chairs
  const rows = 6, seatsPerRow = 10, seatW = 18, seatH = 12, rowGap = 26;
  for (let r = 0; r < rows; r++) {
    const y = 38 + r * rowGap;
    for (let s = 0; s < seatsPerRow; s++) {
      const x = (W - seatsPerRow * seatW - (seatsPerRow - 1) * 3) / 2 + s * (seatW + 3);
      addEl('rect', { x, y, width: seatW, height: seatH, rx: 2, fill: 'var(--clr-gold-dim)', stroke: 'var(--clr-gold-border)', 'stroke-width': 0.5 });
    }
  }
}

function drawClassroom(addEl, W, H) {
  // Stage at front
  addEl('rect', { x: W * 0.2, y: H - 40, width: W * 0.6, height: 20, rx: 3, class: 'svg-stage' });
  const sl = addEl('text', { x: W / 2, y: H - 26, class: 'svg-label' });
  sl.textContent = 'STAGE / BOARD';

  // Tables with chairs (4 columns x 4 rows)
  const rows = 4, tablesPerRow = 4;
  const tableW = 68, tableH = 18, rowGap = 48, tableGap = 16;
  const startX = (W - (tablesPerRow * tableW + (tablesPerRow - 1) * tableGap)) / 2;

  for (let r = 0; r < rows; r++) {
    const y = 35 + r * rowGap;
    for (let t = 0; t < tablesPerRow; t++) {
      const x = startX + t * (tableW + tableGap);
      addEl('rect', { x, y, width: tableW, height: tableH, rx: 2, fill: 'var(--clr-bg-glass)', stroke: 'var(--clr-border-subtle)', 'stroke-width': 0.8 });
      // Three chairs in front of each desk
      addEl('rect', { x: x + 6,  y: y - 10, width: 12, height: 8, rx: 2, class: 'svg-chair' });
      addEl('rect', { x: x + 28, y: y - 10, width: 12, height: 8, rx: 2, class: 'svg-chair' });
      addEl('rect', { x: x + 50, y: y - 10, width: 12, height: 8, rx: 2, class: 'svg-chair' });
    }
  }
}

function drawBanquet(addEl, W, H) {
  const circles = [
    { cx: 85, cy: 85 }, { cx: 200, cy: 80 }, { cx: 315, cy: 85 },
    { cx: 85, cy: 200 }, { cx: 200, cy: 200 }, { cx: 315, cy: 200 },
  ];
  circles.forEach(({ cx, cy }) => {
    addEl('circle', { cx, cy, r: 30, class: 'svg-table-round' });
    // 8 chairs around table
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const sx = cx + Math.cos(angle) * 40;
      const sy = cy + Math.sin(angle) * 40;
      addEl('circle', { cx: sx, cy: sy, r: 5, class: 'svg-chair' });
    }
    // Table number label
    const lbl = addEl('text', { x: cx, y: cy + 4, class: 'svg-label', style: 'font-size:7px' });
    lbl.textContent = '10';
  });
}

function drawUShape(addEl, W, H) {
  const tableW = 30, tableH = 180, gap = 30;
  // Left arm
  addEl('rect', { x: 80, y: 60, width: tableW, height: tableH, rx: 2, fill: 'var(--clr-bg-glass)', stroke: 'var(--clr-gold-border)', 'stroke-width': 1 });
  // Right arm
  addEl('rect', { x: W - 80 - tableW, y: 60, width: tableW, height: tableH, rx: 2, fill: 'var(--clr-bg-glass)', stroke: 'var(--clr-gold-border)', 'stroke-width': 1 });
  // Bottom
  addEl('rect', { x: 80, y: 60 + tableH - tableW, width: W - 160, height: tableW, rx: 2, fill: 'var(--clr-bg-glass)', stroke: 'var(--clr-gold-border)', 'stroke-width': 1 });
  const lbl = addEl('text', { x: W / 2, y: 145, class: 'svg-label', style: 'font-size:8px' });
  lbl.textContent = 'PRESENTER';
}

function drawCocktail(addEl, W, H) {
  // High tables (circles) scattered
  const tables = [
    { cx: 80, cy: 80 }, { cx: 180, cy: 60 }, { cx: 300, cy: 90 }, { cx: 340, cy: 190 },
    { cx: 220, cy: 180 }, { cx: 100, cy: 200 }, { cx: 160, cy: 250 }, { cx: 300, cy: 250 },
  ];
  tables.forEach(({ cx, cy }) => {
    addEl('circle', { cx, cy, r: 16, fill: 'var(--clr-gold-dim)', stroke: 'var(--clr-gold-border)', 'stroke-width': 1 });
  });
  const lbl = addEl('text', { x: W / 2, y: H / 2 + 4, class: 'svg-label' });
  lbl.textContent = 'OPEN FLOOR';
}

function updateBanquetWhatsAppBtn() {
  const wabtn = document.getElementById('banquet-whatsapp-btn');
  if (wabtn) {
    const layoutLabel = currentLayout?.label || 'Theatre Style';
    const msg = `Hi, I'm interested in booking the Banquet Hall with ${layoutLabel} layout (Capacity: ${currentLayout?.capacity || '250'} guests).`;
    const url = getWhatsAppUrl('event', msg);
    wabtn.href   = url;
    wabtn.target = '_blank';
    wabtn.rel    = 'noopener noreferrer';
  }
}

function initCTAs() {
  // Enquire button scrolls to RFQ section
  document.getElementById('banquet-rfq-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    scrollTo('#rfq', -80);
  });

  // WhatsApp button
  const wabtn = document.getElementById('banquet-whatsapp-btn');
  if (wabtn) {
    updateBanquetWhatsAppBtn();
    wabtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateBanquetWhatsAppBtn();
    });
  }
}
