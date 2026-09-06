import { Config }  from '../constants/config.js';
import { sanitize } from './security.js';
export function initMap() {
if (!Config.FEATURES.ENABLE_MAP) return;
const iframe = document.getElementById('google-map');
if (iframe) iframe.src = Config.MAP.EMBED_SATELLITE;
renderNearbyPlaces(Config.MAP.NEARBY_PLACES);
initMapViewToggle();
}
function initMapViewToggle() {
const iframe = document.getElementById('google-map');
const btns   = document.querySelectorAll('.map__view-btn');
if (!iframe || !btns.length) return;
const MAP_TYPES = {
satellite: Config.MAP.EMBED_SATELLITE,
roadmap:   Config.MAP.EMBED_ROADMAP,
};
btns.forEach(btn => {
btn.addEventListener('click', () => {
const type = btn.dataset.type;
iframe.src = MAP_TYPES[type];
btns.forEach(b => {
b.classList.toggle('is-active', b === btn);
b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
});
});
});
}
function renderNearbyPlaces(places) {
const container = document.getElementById('map-places');
if (!container) return;
places.forEach(place => {
const card = document.createElement('div');
card.className = 'map__place-card';
card.setAttribute('role', 'link');
card.setAttribute('tabindex', '0');
card.setAttribute('aria-label', `${place.label} — ${place.distance}`);
card.innerHTML = `
<div class="map__place-icon">${place.icon}</div>
<div class="map__place-info">
<div class="map__place-name">${sanitize(place.label)}</div>
<div class="map__place-meta">
<span class="map__place-distance">${sanitize(place.distance)}</span> · ${sanitize(place.time)}
</div>
</div>
`;
const openDirections = () => {
const url = `https://www.google.com/maps/dir/${Config.HOTEL.LAT},${Config.HOTEL.LNG}/${place.lat},${place.lng}`;
window.open(url, '_blank', 'noopener,noreferrer');
};
card.addEventListener('click', openDirections);
card.addEventListener('keydown', (e) => {
if (e.key === 'Enter' || e.key === ' ') openDirections();
});
container.appendChild(card);
if (window.gsap && window.ScrollTrigger) {
window.gsap.fromTo(card,
{ opacity: 0, x: 30 },
{
opacity: 1, x: 0, duration: 0.5, ease: 'power3.out',
scrollTrigger: { trigger: card, start: 'top 92%', once: true },
}
);
}
});
}