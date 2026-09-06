import { db }          from '../firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Config }      from '../constants/config.js';
import { Strings }     from '../constants/strings.js';
import { Amenities, RoomTypes } from '../constants/amenities.js';
import { sanitize }    from './security.js';
import { logger }      from '../utils/logger.js';
const FALLBACK_ROOMS = [
{
id:          'std-01',
type:        'standard',
name:        'Standard Room',
description: 'Comfortable and well-appointed room for relaxed stays.',
price:       1800,
maxGuests:   2,
amenities:   ['ac', 'wifi', 'tv', 'hot-water'],
image:       'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
available:   true,
},
{
id:          'del-01',
type:        'deluxe',
name:        'Deluxe Room',
description: 'Spacious room with premium furnishings and a stunning hill view.',
price:       2800,
maxGuests:   2,
amenities:   ['ac', 'wifi', 'tv', 'hot-water', 'king-bed', 'mountain-view'],
image:       'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
available:   true,
},
{
id:          'suite-01',
type:        'suite',
name:        'Executive Suite',
description: 'Flagship suite with private sitting area, balcony, and luxury amenities.',
price:       4500,
maxGuests:   3,
amenities:   ['ac', 'wifi', 'tv', 'hot-water', 'king-bed', 'mountain-view', 'balcony', 'bathtub', 'mini-bar', 'safe'],
image:       'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
available:   true,
},
{
id:          'prem-01',
type:        'premium',
name:        'Premium Suite',
description: 'Ultimate indulgence with panoramic mountain views and exclusive butler service.',
price:       7000,
maxGuests:   4,
amenities:   ['ac', 'wifi', 'tv', 'hot-water', 'king-bed', 'mountain-view', 'balcony', 'bathtub', 'mini-bar', 'safe', 'room-service'],
image:       'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
available:   true,
},
];
let activeFilters = new Set(['all']);
let allRooms      = [];
export async function initRooms() {
renderFilterPills();
allRooms = await fetchRooms();
renderRoomCards(allRooms);
initCarouselArrows();
}
async function fetchRooms() {
if (!Config.FIREBASE.PROJECT_ID || Config.FIREBASE.PROJECT_ID === 'YOUR_PROJECT_ID') {
logger.info('[rooms] Firebase project ID is placeholder. Loaded local rooms catalog.');
return FALLBACK_ROOMS;
}
try {
const snap = await getDocs(
query(collection(db, Config.COLLECTIONS.ROOMS), orderBy('price', 'asc'))
);
if (snap.empty) {
logger.info('[rooms] Firestore rooms collection empty. Loaded fallback rooms.');
return FALLBACK_ROOMS;
}
return snap.docs.map(d => ({ id: d.id, ...d.data() }));
} catch (err) {
logger.warn('[rooms] Firestore unavailable, using local rooms catalog:', err.message);
return FALLBACK_ROOMS;
}
}
function renderFilterPills() {
const container = document.getElementById('rooms-filters');
if (!container) return;
const allPill = createPill('all', Strings.ROOMS_FILTER_ALL, '🛏️');
allPill.classList.add('is-active');
container.appendChild(allPill);
Amenities.forEach(({ id, filterLabel, icon }) => {
container.appendChild(createPill(id, filterLabel, icon));
});
}
function createPill(id, label, icon) {
const btn = document.createElement('button');
btn.type        = 'button';
btn.className   = 'rooms__filter-pill';
btn.dataset.filterId = id;
btn.setAttribute('aria-pressed', id === 'all' ? 'true' : 'false');
btn.innerHTML   = `${icon} ${sanitize(label)}`;
btn.addEventListener('click', () => onFilterClick(id));
return btn;
}
function onFilterClick(filterId) {
if (filterId === 'all') {
activeFilters = new Set(['all']);
} else {
activeFilters.delete('all');
if (activeFilters.has(filterId)) {
activeFilters.delete(filterId);
if (activeFilters.size === 0) activeFilters.add('all');
} else {
activeFilters.add(filterId);
}
}
document.querySelectorAll('.rooms__filter-pill').forEach((pill) => {
const fid     = pill.dataset.filterId;
const pressed = activeFilters.has(fid);
pill.classList.toggle('is-active', pressed);
pill.setAttribute('aria-pressed', String(pressed));
});
filterRooms();
}
function filterRooms() {
let filtered = allRooms;
if (!activeFilters.has('all')) {
filtered = allRooms.filter(room =>
[...activeFilters].every(f => room.amenities?.includes(f))
);
}
renderRoomCards(filtered);
}
function renderRoomCards(rooms) {
const track = document.getElementById('rooms-track');
if (!track) return;
track.innerHTML = '';
if (rooms.length === 0) {
track.innerHTML = `<div class="rooms__empty" role="status" aria-live="polite">${Strings.ROOMS_EMPTY}</div>`;
return;
}
rooms.forEach(room => track.appendChild(buildRoomCard(room)));
if (window.ScrollTrigger) {
window.ScrollTrigger.refresh();
}
}
function buildRoomCard(room) {
const amenityMeta = Amenities.filter(a => room.amenities?.includes(a.id)).slice(0, 4);
const card = document.createElement('article');
card.className = `room-card${room.available === false ? ' is-unavailable' : ''}`;
card.setAttribute('aria-label', `${room.name} — ₹${room.price} per night`);
card.innerHTML = `
<img class="room-card__image" src="${sanitize(room.image)}" alt="${sanitize(room.name)} room interior" loading="lazy" />
<div class="room-card__overlay" aria-hidden="true"></div>
${room.available !== false ? '<div class="room-card__available-badge">Available</div>' : ''}
<div class="room-card__content">
<div class="room-card__type">${sanitize(room.type?.toUpperCase() || 'ROOM')}</div>
<div class="room-card__name">${sanitize(room.name)}</div>
<div class="room-card__amenities">
${amenityMeta.map(a => `<span class="room-card__badge">${a.icon} ${sanitize(a.label)}</span>`).join('')}
</div>
<div class="room-card__footer">
<div class="room-card__price">
<div class="room-card__price-amount">₹${room.price?.toLocaleString('en-IN') || '—'}</div>
<div class="room-card__price-label">per night</div>
</div>
<button class="btn btn--primary room-card__book-btn"
data-room-id="${sanitize(room.id)}"
data-room-name="${sanitize(room.name)}"
data-room-price="${room.price}"
${room.available === false ? 'disabled' : ''}
aria-label="${room.available === false ? `${sanitize(room.name)} is sold out` : `Book ${sanitize(room.name)} for ₹${room.price} per night`}">
${room.available === false ? 'Sold Out' : 'Book'}
</button>
</div>
</div>
`;
const bookBtn = card.querySelector('.room-card__book-btn');
bookBtn?.addEventListener('click', () => {
import('./booking.js').then(m => m.openBookingModal(room));
});
if (window.gsap && window.ScrollTrigger) {
window.gsap.fromTo(card,
{ opacity: 0, y: 40 },
{
opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
scrollTrigger: { trigger: card, start: 'top 90%', once: true },
}
);
}
return card;
}
function initCarouselArrows() {
const prevBtn = document.getElementById('rooms-prev-btn');
const nextBtn = document.getElementById('rooms-next-btn');
const wrapper = document.getElementById('rooms-track-wrapper');
if (!prevBtn || !nextBtn || !wrapper) return;
const updateArrowVisibility = () => {
const scrollLeft = wrapper.scrollLeft;
const maxScroll  = wrapper.scrollWidth - wrapper.clientWidth;
prevBtn.style.opacity = scrollLeft > 10 ? '1' : '0';
prevBtn.style.pointerEvents = scrollLeft > 10 ? 'auto' : 'none';
nextBtn.style.opacity = scrollLeft < maxScroll - 10 ? '1' : '0';
nextBtn.style.pointerEvents = scrollLeft < maxScroll - 10 ? 'auto' : 'none';
};
const getScrollAmount = () => {
const card = wrapper.querySelector('.room-card');
return card ? card.offsetWidth + 24 : 400;
};
prevBtn.onclick = () => {
wrapper.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
};
nextBtn.onclick = () => {
wrapper.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
};
wrapper.addEventListener('scroll', updateArrowVisibility, { passive: true });
requestAnimationFrame(updateArrowVisibility);
}