/**
 * map.js — Hotel HMT Empire
 * Google Maps iframe embed + nearby places sidebar with scroll-reveal animations.
 * No API key required — uses the standard Google Maps embed URL.
 */

import { Config }  from '../constants/config.js';
import { sanitize } from './security.js';

export function initMap() {
  if (!Config.FEATURES.ENABLE_MAP) return;

  // Set initial iframe src from config (satellite by default)
  const iframe = document.getElementById('google-map');
  if (iframe) iframe.src = Config.MAP.EMBED_SATELLITE;

  renderNearbyPlaces(Config.MAP.NEARBY_PLACES);
  initMapViewToggle();
}

/** Satellite / Roadmap view toggle pill */
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
      // Swap iframe src
      iframe.src = MAP_TYPES[type];
      // Update active state
      btns.forEach(b => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
    });
  });
}

/** Render nearby place cards in sidebar */
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

    // Click/Enter: open Google Maps directions to that place
    const openDirections = () => {
      const url = `https://www.google.com/maps/dir/${Config.HOTEL.LAT},${Config.HOTEL.LNG}/${place.lat},${place.lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    };
    card.addEventListener('click', openDirections);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openDirections();
    });

    container.appendChild(card);

    // Scroll reveal animation
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
