import { db }            from '../firebase-config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Config }        from '../constants/config.js';
import { Strings }       from '../constants/strings.js';
import { MenuCategories } from '../constants/amenities.js';
import { sanitize }      from './security.js';
import { getWhatsAppUrl } from './whatsapp.js';
import { logger }         from '../utils/logger.js';
const FALLBACK_MENU = [
{ id: 'm1',  category: 'breakfast', name: 'Aloo Paratha',        price: 120, description: 'Whole wheat flatbread stuffed with spiced potatoes, served with curd and pickle.', isVeg: true,  isChefPick: false, image: 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=600' },
{ id: 'm2',  category: 'breakfast', name: 'Continental Breakfast',price: 250, description: 'Assorted bread, eggs, butter, jam, juice, and fresh fruit bowl.', isVeg: true, isChefPick: false, image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600' },
{ id: 'm3',  category: 'breakfast', name: 'Masala Omelette',      price: 130, description: 'Three-egg omelette with onions, tomatoes, chillies, and coriander.', isVeg: false, isChefPick: false, image: 'https://images.unsplash.com/photo-1612240498936-65f5101365d2?w=600' },
{ id: 'm4',  category: 'lunch',     name: 'Mutton Curry',         price: 380, description: 'Slow-cooked tender mutton in aromatic Jharkhand masala, served with rice.', isVeg: false, isChefPick: true, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600' },
{ id: 'm5',  category: 'lunch',     name: 'Dal Bati Churma',      price: 220, description: 'Traditional baked wheat balls with lentil curry and sweetened crushed wheat.', isVeg: true, isChefPick: true, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600' },
{ id: 'm6',  category: 'lunch',     name: 'Chicken Biryani',      price: 320, description: 'Fragrant basmati rice layered with marinated chicken and saffron.', isVeg: false, isChefPick: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600' },
{ id: 'm7',  category: 'dinner',    name: 'Litti Chokha',         price: 200, description: 'Roasted wheat balls stuffed with sattu, served with roasted brinjal mash.', isVeg: true, isChefPick: false, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600' },
{ id: 'm8',  category: 'dinner',    name: 'Grilled Fish Thali',   price: 450, description: 'Fresh-water grilled fish with steamed rice, dal, and seasonal vegetables.', isVeg: false, isChefPick: true, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600' },
{ id: 'm9',  category: 'dinner',    name: 'Paneer Butter Masala', price: 280, description: 'Cottage cheese in rich, creamy tomato-based gravy with warm naan.', isVeg: true, isChefPick: false, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600' },
{ id: 'm10', category: 'specials',  name: 'Chicken Handi',        price: 420, description: 'Hand-cooked chicken in a traditional clay pot with whole spices. Chef\'s signature.', isVeg: false, isChefPick: true, image: 'https://images.unsplash.com/photo-1611489142329-5f62cfa43e6e?w=600' },
{ id: 'm11', category: 'specials',  name: 'Jharkhand Thali',      price: 350, description: 'Complete Jharkhand feast: litti, chokha, dal, sabzi, rice, and dessert.', isVeg: true, isChefPick: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' },
];
let activeCategory = 'breakfast';
let allMenuItems   = [];
export async function initRestaurant() {
renderTabs();
allMenuItems = await fetchMenu();
renderMenuItems(activeCategory);
initDiningCarouselArrows();
}
async function fetchMenu() {
if (!Config.FIREBASE.PROJECT_ID || Config.FIREBASE.PROJECT_ID === 'YOUR_PROJECT_ID') {
return FALLBACK_MENU;
}
try {
const snap = await getDocs(
query(collection(db, Config.COLLECTIONS.MENU_ITEMS), orderBy('name', 'asc'))
);
if (snap.empty) return FALLBACK_MENU;
return snap.docs.map(d => ({ id: d.id, ...d.data() }));
} catch {
return FALLBACK_MENU;
}
}
function renderTabs() {
const container = document.getElementById('dining-tabs');
if (!container) return;
MenuCategories.forEach(({ id, label, icon, timeRange }) => {
const btn = document.createElement('button');
btn.type      = 'button';
btn.className = `dining__tab${id === activeCategory ? ' is-active' : ''}`;
btn.setAttribute('role', 'tab');
btn.setAttribute('aria-selected', String(id === activeCategory));
btn.setAttribute('aria-controls', 'dining-grid');
btn.setAttribute('data-time', timeRange);
btn.innerHTML = `<span class="dining__tab-icon">${icon}</span> ${sanitize(label)}`;
btn.addEventListener('click', () => {
activeCategory = id;
updateTimeBadge(timeRange);
container.querySelectorAll('.dining__tab').forEach(t => {
t.classList.remove('is-active');
t.setAttribute('aria-selected', 'false');
});
btn.classList.add('is-active');
btn.setAttribute('aria-selected', 'true');
renderMenuItems(id);
});
container.appendChild(btn);
});
}
function updateTimeBadge(timeRange) {
const el = document.getElementById('dining-time-text');
if (el) el.textContent = timeRange;
}
function renderMenuItems(category) {
const grid = document.getElementById('dining-grid');
if (!grid) return;
grid.innerHTML = '';
const wrapper = document.getElementById('dining-grid-wrapper');
if (wrapper) wrapper.scrollLeft = 0;
const items = allMenuItems.filter(item => item.category === category);
if (items.length === 0) {
grid.innerHTML = `<div class="rooms__empty" aria-live="polite">No items available yet.</div>`;
return;
}
items.forEach(item => {
const card = buildMenuCard(item);
grid.appendChild(card);
if (window.gsap && window.ScrollTrigger) {
window.gsap.fromTo(card,
{ opacity: 0, y: 30 },
{ opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
scrollTrigger: { trigger: card, start: 'top 90%', once: true } }
);
}
});
if (wrapper) {
wrapper.dispatchEvent(new Event('scroll'));
}
if (window.ScrollTrigger) {
window.ScrollTrigger.refresh();
}
}
function buildMenuCard(item) {
const waUrl = getWhatsAppUrl('room-service', `I'd like to order: ${sanitize(item.name)} (₹${item.price})`);
const card  = document.createElement('article');
card.className = 'menu-card';
card.setAttribute('aria-label', `${sanitize(item.name)} — ₹${item.price}`);
card.innerHTML = `
<div class="menu-card__image-wrap">
<img class="menu-card__image" src="${sanitize(item.image || '')}" alt="${sanitize(item.name)}" loading="lazy" />
<div class="menu-card__badges">
${item.isVeg    ? '<span class="menu-card__badge menu-card__badge--veg">🌿 Veg</span>'       : '<span class="menu-card__badge menu-card__badge--nonveg">🍖 Non-Veg</span>'}
${item.isChefPick ? '<span class="menu-card__badge menu-card__badge--chef">⭐ Chef\'s Pick</span>' : ''}
</div>
</div>
<div class="menu-card__body">
<div class="menu-card__name">${sanitize(item.name)}</div>
<p class="menu-card__description">${sanitize(item.description)}</p>
<div class="menu-card__footer">
<div class="menu-card__price">₹${item.price}</div>
<a class="menu-card__order-btn" href="${waUrl}" target="_blank" rel="noopener noreferrer"
aria-label="Order ${sanitize(item.name)} via WhatsApp">
💬 Order
</a>
</div>
</div>
`;
return card;
}
function initDiningCarouselArrows() {
const prevBtn = document.getElementById('dining-prev-btn');
const nextBtn = document.getElementById('dining-next-btn');
const wrapper = document.getElementById('dining-grid-wrapper');
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
const card = wrapper.querySelector('.menu-card');
return card ? card.offsetWidth + 24 : 320;
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