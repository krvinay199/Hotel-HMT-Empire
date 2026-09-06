/**
 * routes.js — Hotel HMT Empire
 * All navigation routes and section anchor IDs.
 *
 * To rename or reorder nav items → edit ONLY this file.
 * To add a new section → add its ID here first.
 * ─────────────────────────────────────────────────────────────────────
 */

// ── Main Navigation Links ─────────────────────────────────────────────
// Rendered by navbar.js. Order here = order in the navbar.
export const NavRoutes = [
  { id: 'nav-home',    label: 'Home',    href: '#hero',    sectionId: 'hero'    },
  { id: 'nav-rooms',   label: 'Rooms',   href: '#rooms',   sectionId: 'rooms'   },
  { id: 'nav-dining',  label: 'Dining',  href: '#dining',  sectionId: 'dining'  },
  { id: 'nav-banquet', label: 'Banquet', href: '#banquet', sectionId: 'banquet' },
  { id: 'nav-events',  label: 'Events',  href: '#rfq',     sectionId: 'rfq'     },
  { id: 'nav-find-us', label: 'Find Us', href: '#map-section',     sectionId: 'map-section'     },
];

// ── All Section IDs ───────────────────────────────────────────────────
// Every <section id="..."> in index.html must be listed here.
// Used by IntersectionObserver in navbar.js for active-link highlighting.
export const SectionIds = {
  HERO:    'hero',
  ABOUT:   'about',
  ROOMS:   'rooms',
  DINING:  'dining',
  BANQUET: 'banquet',
  RFQ:     'rfq',
  MAP:     'map-section',
  FOOTER:  'footer',
};

// ── Footer Quick Links ────────────────────────────────────────────────
export const FooterLinks = [
  { label: 'Home',          href: '#hero'    },
  { label: 'Rooms',         href: '#rooms'   },
  { label: 'Dining',        href: '#dining'  },
  { label: 'Banquet',       href: '#banquet' },
  { label: 'Events Quote',  href: '#rfq'     },
  { label: 'Find Us',       href: '#map-section'     },
  { label: 'Admin Panel',   href: '/admin/'  },
];

// ── External / Page Routes ────────────────────────────────────────────
export const PageRoutes = {
  ADMIN:   '/admin/',
  PRIVACY: '#privacy',
  TERMS:   '#terms',
};
