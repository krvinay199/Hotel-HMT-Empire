# Hotel HMT Empire — Full Website Implementation Plan

## Overview

A **cinematic, multi-section luxury hotel website** for **Hotel HMT Empire, Domchanch**. Built with pure HTML5, CSS3, JavaScript, GSAP (animations), and Lenis (smooth scrolling). Fully modular, mobile-first, and security-hardened.

**No PMS. Everything built from scratch.** Custom booking engine powered by **Firebase Firestore**, hosted on **Google Cloud Storage** with global CDN. **Zero Cloud Functions — 100% free tier.**

---

## ☁️ Google Cloud Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                  Google Cloud Project                    │
│                                                         │
│  ┌──────────────────┐    ┌──────────────────────────┐  │
│  │  Cloud Storage   │    │   Firebase (Spark/Free)  │  │
│  │  ─────────────   │    │   ─────────────────────  │  │
│  │  • index.html    │    │   • Firestore DB         │  │
│  │  • CSS/JS/assets │    │     - rooms             │  │
│  │  • Drone video   │    │     - bookings          │  │
│  │  • WebP images   │    │     - menu_items        │  │
│  │  Static hosting  │    │     - rfq_enquiries     │  │
│  │  + Cloud CDN     │    │   • Firebase Auth        │  │
│  └──────────────────┘    │     (Admin panel only)   │  │
│                          │   NO Cloud Functions!   │  │
│  ┌──────────────────┐    │   ✔ EmailJS (browser)    │  │
│  │   Cloud DNS      │    │   ✔ WhatsApp wa.me      │  │
│  │   Custom domain  │    │   (both 100% free)      │  │
│  └──────────────────┘    └──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Why This Stack?
| Decision | Reason |
|---|---|
| **Cloud Storage** static hosting | Cheapest, fastest, globally CDN-backed |
| **Firebase Firestore** (Spark/free) | Real-time DB, 50K reads/20K writes per day free |
| **EmailJS** (browser SDK) | Sends emails from JS — no backend, 200 emails/month free |
| **WhatsApp `wa.me` links** | Instant staff notification — completely free |
| **Firebase Auth** | Secure admin panel with zero backend code |
| **No Cloud Functions** | Eliminated entirely — saves money and complexity |
| **No PMS** | Built custom — full control, no licensing fees |

---

## Architecture: Modular File Structure

> [!IMPORTANT]
> **Android `res/values/` pattern applied to web.** Every color, size, string, shadow, and z-index lives in its own dedicated token file. Component files **never** contain hardcoded values — they only reference tokens.

```
Hotel HMT Empire/
├── index.html                        ← Main entry point (public site)
├── admin/
│   └── index.html                    ← Admin dashboard (Firebase Auth protected)
├── css/
│   ├── reset.css                     ← Modern CSS reset (no values here)
│   ├── tokens/                       ← 🎯 ALL DESIGN TOKENS (like Android res/values/)
│   │   ├── colors.css                ← colors.xml equivalent
│   │   ├── typography.css            ← dimens.xml (font sizes, weights, families)
│   │   ├── spacing.css               ← dimens.xml (margins, paddings, gaps)
│   │   ├── shadows.css               ← elevation levels
│   │   ├── z-index.css               ← layer stacking order
│   │   └── motion.css                ← animation durations & easing curves
│   ├── base.css                      ← @import all tokens + global styles
│   ├── layout.css                    ← Grid / Flexbox containers
│   └── components/                   ← Component styles (reference tokens only)
│       ├── preloader.css
│       ├── navbar.css
│       ├── hero.css
│       ├── rooms.css
│       ├── booking.css
│       ├── banquet.css
│       ├── restaurant.css
│       ├── rfq.css
│       ├── map.css
│       ├── whatsapp.css
│       ├── admin.css
│       └── footer.css
├── js/
│   ├── constants/                    ← 🎯 ALL JS CONSTANTS (like Android res/values/)
│   │   ├── strings.js                ← strings.xml equivalent
│   │   ├── config.js                 ← app config (Firebase, WhatsApp, map coords)
│   │   ├── amenities.js              ← room amenities, menu categories, banquet layouts
│   │   └── routes.js                 ← page anchor IDs & nav link definitions
│   ├── firebase-config.js            ← Firebase SDK init (reads from constants/config.js)
│   ├── main.js                       ← App bootstrap & module orchestrator
│   ├── modules/
│   │   ├── preloader.js
│   │   ├── lenis-scroll.js
│   │   ├── navbar.js
│   │   ├── theme.js
│   │   ├── hero.js
│   │   ├── rooms.js
│   │   ├── booking.js                ← Firestore write + EmailJS + WhatsApp link
│   │   ├── banquet.js
│   │   ├── restaurant.js
│   │   ├── rfq.js                    ← Firestore write + EmailJS notification
│   │   ├── map.js
│   │   ├── whatsapp.js
│   │   └── security.js
│   └── admin/
│       ├── admin-auth.js
│       ├── admin-bookings.js
│       ├── admin-rooms.js
│       ├── admin-menu.js
│       └── admin-rfq.js
├── firestore.rules               ← Firestore security rules
├── firebase.json                 ← Firebase hosting config (NO functions)
└── assets/
    ├── images/
    ├── videos/
    └── fonts/
```

---

## 🎯 Token System (res/values Pattern)

### CSS Tokens — `css/tokens/`

#### `colors.css` — Every color in the app
```css
/* Dark theme (default) */
[data-theme="dark"] {
  --clr-bg-primary:       #0D0D0D;
  --clr-bg-secondary:     #1A1A1A;
  --clr-bg-card:          #1F1F1F;
  --clr-bg-glass:         rgba(255,255,255,0.06);
  --clr-bg-overlay:       rgba(0,0,0,0.72);
  --clr-text-primary:     #F5F0E8;
  --clr-text-secondary:   #C8BFB0;
  --clr-text-muted:       #9A9082;
  --clr-text-inverse:     #0D0D0D;
  --clr-accent-gold:      #C9A84C;
  --clr-accent-gold-dim:  rgba(201,168,76,0.15);
  --clr-accent-emerald:   #2D6A4F;
  --clr-border:           rgba(201,168,76,0.2);
  --clr-border-subtle:    rgba(255,255,255,0.06);
  --clr-success:          #4CAF7C;
  --clr-warning:          #E6A817;
  --clr-error:            #E05C5C;
  --clr-whatsapp:         #25D366;
}

/* Light theme */
[data-theme="light"] {
  --clr-bg-primary:       #FAF7F2;
  --clr-bg-secondary:     #FFFFFF;
  --clr-bg-card:          #F2EDE5;
  --clr-bg-glass:         rgba(0,0,0,0.04);
  --clr-bg-overlay:       rgba(0,0,0,0.5);
  --clr-text-primary:     #1A1A1A;
  --clr-text-secondary:   #3D3530;
  --clr-text-muted:       #6B6259;
  --clr-text-inverse:     #FAF7F2;
  --clr-accent-gold:      #A8872E;
  --clr-accent-gold-dim:  rgba(168,135,46,0.12);
  --clr-accent-emerald:   #1E4D38;
  --clr-border:           rgba(168,135,46,0.25);
  --clr-border-subtle:    rgba(0,0,0,0.08);
  --clr-success:          #276843;
  --clr-warning:          #B07C0A;
  --clr-error:            #B83232;
  --clr-whatsapp:         #128C50;
}
```

#### `typography.css` — Font families, sizes, weights, line-heights
```css
:root {
  /* Font families */
  --font-display:     'Cormorant Garamond', Georgia, serif;
  --font-body:        'Inter', system-ui, sans-serif;
  --font-accent:      'Playfair Display', Georgia, serif;
  --font-mono:        'JetBrains Mono', monospace;

  /* Font sizes (fluid scale) */
  --fs-2xs:   clamp(0.625rem, 1vw, 0.75rem);    /* 10–12px */
  --fs-xs:    clamp(0.75rem, 1.2vw, 0.875rem);  /* 12–14px */
  --fs-sm:    clamp(0.875rem, 1.5vw, 1rem);     /* 14–16px */
  --fs-md:    clamp(1rem, 1.8vw, 1.125rem);     /* 16–18px */
  --fs-lg:    clamp(1.125rem, 2vw, 1.25rem);    /* 18–20px */
  --fs-xl:    clamp(1.25rem, 2.5vw, 1.5rem);    /* 20–24px */
  --fs-2xl:   clamp(1.5rem, 3vw, 2rem);         /* 24–32px */
  --fs-3xl:   clamp(2rem, 4vw, 3rem);           /* 32–48px */
  --fs-4xl:   clamp(3rem, 6vw, 4.5rem);         /* 48–72px */
  --fs-hero:  clamp(4rem, 10vw, 8rem);          /* 64–128px hero title */

  /* Font weights */
  --fw-light:     300;
  --fw-regular:   400;
  --fw-medium:    500;
  --fw-semibold:  600;
  --fw-bold:      700;

  /* Line heights */
  --lh-tight:   1.1;
  --lh-snug:    1.3;
  --lh-normal:  1.5;
  --lh-relaxed: 1.75;

  /* Letter spacing */
  --ls-tight:   -0.02em;
  --ls-normal:   0;
  --ls-wide:     0.05em;
  --ls-widest:   0.15em;   /* used for eyebrow labels */
}
```

#### `spacing.css` — All margins, paddings, gaps (dimens)
```css
:root {
  /* Base spacing scale (multiples of 4px) */
  --sp-1:    0.25rem;   /* 4px  */
  --sp-2:    0.5rem;    /* 8px  */
  --sp-3:    0.75rem;   /* 12px */
  --sp-4:    1rem;      /* 16px */
  --sp-5:    1.25rem;   /* 20px */
  --sp-6:    1.5rem;    /* 24px */
  --sp-8:    2rem;      /* 32px */
  --sp-10:   2.5rem;    /* 40px */
  --sp-12:   3rem;      /* 48px */
  --sp-16:   4rem;      /* 64px */
  --sp-20:   5rem;      /* 80px */
  --sp-24:   6rem;      /* 96px */
  --sp-32:   8rem;      /* 128px */

  /* Semantic spacing */
  --sp-section-y:     clamp(4rem, 8vw, 8rem);  /* section top/bottom padding */
  --sp-container-x:   clamp(1rem, 5vw, 6rem);  /* page side padding */
  --sp-card-pad:      clamp(1.25rem, 3vw, 2rem);
  --sp-nav-h:         4.5rem;                  /* navbar height */
  --sp-gap-grid:      clamp(1rem, 2.5vw, 2rem);

  /* Border radius */
  --radius-sm:    0.25rem;
  --radius-md:    0.5rem;
  --radius-lg:    1rem;
  --radius-xl:    1.5rem;
  --radius-pill:  999px;
  --radius-circle: 50%;
}
```

#### `shadows.css` — Elevation system
```css
[data-theme="dark"] {
  --shadow-sm:   0 1px 3px rgba(0,0,0,0.4);
  --shadow-md:   0 4px 16px rgba(0,0,0,0.5);
  --shadow-lg:   0 8px 32px rgba(0,0,0,0.6);
  --shadow-xl:   0 16px 64px rgba(0,0,0,0.7);
  --shadow-gold: 0 0 24px rgba(201,168,76,0.25);
}
[data-theme="light"] {
  --shadow-sm:   0 1px 3px rgba(0,0,0,0.08);
  --shadow-md:   0 4px 16px rgba(0,0,0,0.1);
  --shadow-lg:   0 8px 32px rgba(0,0,0,0.12);
  --shadow-xl:   0 16px 64px rgba(0,0,0,0.15);
  --shadow-gold: 0 0 24px rgba(168,135,46,0.2);
}
```

#### `z-index.css` — Layer stacking order
```css
:root {
  --z-below:      -1;
  --z-base:        0;
  --z-raised:     10;
  --z-dropdown:   100;
  --z-sticky:     200;   /* navbar */
  --z-overlay:    300;   /* modal backdrops */
  --z-modal:      400;   /* booking modal, lightbox */
  --z-toast:      500;   /* notifications */
  --z-preloader: 1000;   /* cinematic intro */
}
```

#### `motion.css` — Animation durations & easing
```css
:root {
  /* Durations */
  --dur-instant:    100ms;
  --dur-fast:       200ms;
  --dur-normal:     350ms;
  --dur-slow:       600ms;
  --dur-xslow:     1000ms;
  --dur-cinematic: 1800ms;  /* preloader, hero reveals */

  /* Easing curves */
  --ease-out:       cubic-bezier(0.0, 0, 0.2, 1);
  --ease-in:        cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);  /* bouncy */
  --ease-luxury:    cubic-bezier(0.25, 0.1, 0.0, 1.0);  /* editorial slow ease */

  /* Theme transition (applied globally) */
  --theme-transition: background-color var(--dur-normal) var(--ease-in-out),
                      color var(--dur-normal) var(--ease-in-out),
                      border-color var(--dur-normal) var(--ease-in-out),
                      box-shadow var(--dur-normal) var(--ease-in-out);
}
```

---

### JS Constants — `js/constants/`

#### `strings.js` — All user-visible text (strings.xml equivalent)
```js
// strings.js — Every UI string in ONE place.
// To change any label/heading/message, edit ONLY this file.
export const Strings = {
  // Brand
  HOTEL_NAME:          'Hotel HMT Empire',
  HOTEL_TAGLINE:       'Where Comfort Meets Elegance',
  HOTEL_LOCATION:      'Domchanch, Jharkhand, India',

  // Nav labels
  NAV_HOME:            'Home',
  NAV_ROOMS:           'Rooms',
  NAV_DINING:          'Dining',
  NAV_BANQUET:         'Banquet',
  NAV_EVENTS:          'Events',
  NAV_CONTACT:         'Contact',
  NAV_BOOK_NOW:        'Book Now',

  // Hero section
  HERO_HEADLINE:       'Experience Timeless Luxury',
  HERO_SUBTEXT:        'Nestled in the heart of Domchanch — your perfect retreat',
  HERO_CTA_PRIMARY:    'Reserve Your Stay',
  HERO_CTA_SECONDARY:  'Explore Rooms',

  // Booking
  BOOKING_CHECKIN:     'Check-in Date',
  BOOKING_CHECKOUT:    'Check-out Date',
  BOOKING_GUESTS:      'Number of Guests',
  BOOKING_SELECT_ROOM: 'Select Room Type',
  BOOKING_SUBMIT:      'Confirm Booking',
  BOOKING_SUCCESS:     'Booking Confirmed! Your ID: ',
  BOOKING_ERROR:       'Something went wrong. Please try again.',
  BOOKING_AVAILABLE:   'Available',
  BOOKING_UNAVAILABLE: 'Not Available',

  // Rooms section
  ROOMS_HEADING:       'Our Rooms & Suites',
  ROOMS_SUBHEADING:    'Carefully curated spaces for your comfort',
  ROOMS_FROM:          'From ₹',
  ROOMS_PER_NIGHT:     '/ night',
  ROOMS_FILTER_ALL:    'All Rooms',
  ROOMS_BOOK_BTN:      'Book This Room',
  ROOMS_DETAILS_BTN:   'View Details',

  // Restaurant
  DINING_HEADING:      'Restaurant & Dining',
  DINING_SUBHEADING:   'Savour authentic flavours every day',
  DINING_ORDER_BTN:    'Order via WhatsApp',
  DINING_TAB_BREAKFAST:'Breakfast',
  DINING_TAB_LUNCH:    'Lunch',
  DINING_TAB_DINNER:   'Dinner',
  DINING_TAB_SPECIALS: "Chef's Specials",

  // Banquet
  BANQUET_HEADING:     'Banquet & Events',
  BANQUET_SUBHEADING:  'Your perfect venue for every occasion',
  BANQUET_CAPACITY:    'Capacity',
  BANQUET_LAYOUTS:     'Seating Arrangements',
  BANQUET_ENQUIRE:     'Enquire Now',

  // RFQ
  RFQ_HEADING:         'Request for Quote',
  RFQ_SUBHEADING:      'Get custom pricing for your event',
  RFQ_STEP_EVENT:      'Event Type',
  RFQ_STEP_DATES:      'Dates',
  RFQ_STEP_GUESTS:     'Guest Count',
  RFQ_STEP_NOTES:      'Requirements',
  RFQ_STEP_CONTACT:    'Your Details',
  RFQ_SUBMIT:          'Submit Enquiry',
  RFQ_SUCCESS:         'Enquiry received! We will contact you within 24 hours.',
  RFQ_RATE_LIMIT:      'You have already submitted 3 enquiries. Please call us directly.',

  // Map / Transit
  MAP_HEADING:         'Find Us',
  MAP_SUBHEADING:      'Easily accessible from major transit points',
  MAP_HOTEL_POPUP:     'Hotel HMT Empire',
  MAP_STATION_POPUP:   'Koderma Railway Station (~12 km)',
  MAP_BUS_POPUP:       'Domchanch Bus Stand (~1 km)',
  MAP_HIGHWAY_POPUP:   'NH-2 Highway Entry (~3 km)',

  // WhatsApp
  WA_GENERAL:          'Hello! I would like more information about Hotel HMT Empire.',
  WA_BOOKING:          'Hello! I would like to book a room at Hotel HMT Empire.',
  WA_ROOM_SERVICE:     'Hello! I would like to place a room service order.',
  WA_EVENT:            'Hello! I would like to enquire about event/banquet facilities.',

  // Footer
  FOOTER_TAGLINE:      'A legacy of hospitality in Domchanch.',
  FOOTER_RIGHTS:       '\u00a9 2025 Hotel HMT Empire. All rights reserved.',
  FOOTER_PRIVACY:      'Privacy Policy',
  FOOTER_NEWSLETTER_PLACEHOLDER: 'Enter your email',
  FOOTER_NEWSLETTER_BTN: 'Subscribe',

  // Form validation messages
  ERR_REQUIRED:        'This field is required.',
  ERR_EMAIL:           'Please enter a valid email address.',
  ERR_PHONE:           'Please enter a valid 10-digit phone number.',
  ERR_DATE_PAST:       'Date cannot be in the past.',
  ERR_DATE_ORDER:      'Check-out must be after check-in.',
};
```

#### `config.js` — App configuration (no secrets)
```js
// config.js — All runtime configuration in one place.
// NEVER put secret keys here. Firebase public config is safe by design.
export const Config = {
  HOTEL: {
    NAME:          'Hotel HMT Empire',
    PHONE:         '+91XXXXXXXXXX',       // replace with real number
    WHATSAPP:      '91XXXXXXXXXX',        // country code + number, no +
    EMAIL:         'info@hotelhmtempire.com',
    ADDRESS:       'Main Road, Domchanch, Jharkhand – 825418',
    LAT:            24.4734,              // hotel GPS lat
    LNG:            85.6837,              // hotel GPS lng
  },

  FIREBASE: {
    API_KEY:        'YOUR_API_KEY',
    AUTH_DOMAIN:    'YOUR_PROJECT.firebaseapp.com',
    PROJECT_ID:     'YOUR_PROJECT_ID',
    STORAGE_BUCKET: 'YOUR_PROJECT.appspot.com',
    MESSAGING_SENDER_ID: 'YOUR_SENDER_ID',
    APP_ID:         'YOUR_APP_ID',
  },

  BOOKING: {
    MAX_GUESTS:          10,
    MIN_ADVANCE_DAYS:     0,   // can book same-day
    MAX_ADVANCE_DAYS:   365,
    CURRENCY_SYMBOL:    '\u20b9',
    CURRENCY_CODE:      'INR',
  },

  MAP: {
    DEFAULT_ZOOM:  14,
    TILE_URL:      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ATTRIBUTION:   '\u00a9 OpenStreetMap contributors',
    NEARBY_PLACES: [
      { label: 'Koderma Railway Station', lat: 24.4641, lng: 85.5997, distance: '12 km' },
      { label: 'Domchanch Bus Stand',     lat: 24.4712, lng: 85.6810, distance: '1 km'  },
      { label: 'NH-2 Highway Entry',      lat: 24.4580, lng: 85.6600, distance: '3 km'  },
    ],
  },

  SECURITY: {
    MAX_RFQ_PER_SESSION: 3,
    HONEYPOT_FIELD_NAME: 'website',   // bots fill this, humans don't see it
    RATE_LIMIT_KEY:      'hmt_rfq_count',
  },

  FEATURES: {
    DARK_MODE_DEFAULT: true,
    SHOW_PRELOADER:    true,
    ENABLE_ANIMATIONS: true,
  },
};
```

#### `amenities.js` — Room/menu/banquet data constants
```js
// amenities.js — All enum-like constants for filters & display
export const Amenities = [
  { id: 'ac',          label: 'Air Conditioning', icon: '\u2744\ufe0f' },
  { id: 'wifi',        label: 'Free Wi-Fi',        icon: '\ud83d\udcf6' },
  { id: 'king-bed',    label: 'King Bed',          icon: '\ud83d\udecc' },
  { id: 'twin-bed',    label: 'Twin Beds',         icon: '\ud83d\udecc' },
  { id: 'mountain-view', label: 'Mountain View',   icon: '\ud83c�\ufe0f' },
  { id: 'hot-water',   label: 'Hot Water',         icon: '\ud83d�' },
  { id: 'tv',          label: 'Smart TV',          icon: '\ud83d�' },
  { id: 'room-service', label: 'Room Service',     icon: '\ud83c�\ufe0f' },
];

export const MenuCategories = [
  { id: 'breakfast', label: 'Breakfast', icon: '\u2600\ufe0f' },
  { id: 'lunch',     label: 'Lunch',     icon: '\ud83c�' },
  { id: 'dinner',    label: 'Dinner',    icon: '\ud83c�' },
  { id: 'specials',  label: "Chef's Specials", icon: '\u2b50' },
];

export const BanquetLayouts = [
  { id: 'theatre',   label: 'Theatre',   capacity: 200, icon: '\ud83c�' },
  { id: 'classroom', label: 'Classroom', capacity: 120, icon: '\ud83c�' },
  { id: 'u-shape',   label: 'U-Shape',   capacity:  60, icon: '\ud83d�' },
  { id: 'banquet',   label: 'Banquet',   capacity: 150, icon: '\ud83c�' },
  { id: 'cocktail',  label: 'Cocktail',  capacity: 250, icon: '\ud83c�' },
];

export const RoomTypes = [
  { id: 'standard', label: 'Standard Room' },
  { id: 'deluxe',   label: 'Deluxe Room' },
  { id: 'suite',    label: 'Executive Suite' },
  { id: 'premium',  label: 'Premium Suite' },
];

export const BookingStatus = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const RFQStatus = {
  NEW:       'new',
  CONTACTED: 'contacted',
  CLOSED:    'closed',
};
```

#### `routes.js` — Navigation structure
```js
// routes.js — All anchor IDs and nav structure in one place
export const Routes = [
  { id: 'hero',       label: 'Home',    href: '#hero'     },
  { id: 'rooms',      label: 'Rooms',   href: '#rooms'    },
  { id: 'dining',     label: 'Dining',  href: '#dining'   },
  { id: 'banquet',    label: 'Banquet', href: '#banquet'  },
  { id: 'events',     label: 'Events',  href: '#rfq'      },
  { id: 'map',        label: 'Find Us', href: '#map'      },
  { id: 'contact',    label: 'Contact', href: '#footer'   },
];
```

### How Tokens Flow

```
colors.css ─────────┐
typography.css ─────┤
spacing.css ─────── ► base.css @imports all tokens
shadows.css ─────── ► components/*.css use var(--token) only
z-index.css ─────── ► ZERO hardcoded values in component files
motion.css ─────────┘

strings.js ─────────┐
config.js ─────────► imported by modules/*.js
amenities.js ───────► ZERO magic strings/numbers in module files
routes.js ──────────┘
```

---

## Section-by-Section Feature Plan

### 1. Cinematic Preloader
- Full-screen overlay with hotel logo reveal
- Counter (0–100%) with staggered text fade-in
- GSAP Timeline: logo scale → line sweep → curtain split exit
- Locks scroll during load; removes on complete

### 2. Sticky Smart Navbar
- Transparent on hero → frosted glass on scroll
- Animated scroll-progress bar (top edge)
- Mobile hamburger with GSAP stagger menu reveal
- Active section highlighting via IntersectionObserver

### 3. Drone Video Hero
- Fullscreen `<video>` (autoplay, muted, loop, playsinline)
- WebM + MP4 fallback for cross-browser
- GSAP text parallax: hotel name + tagline animate on scroll
- CTA buttons: "Book Now" (WhatsApp) + "Explore"
- Overlay gradient for text legibility

### 4. Horizontal Room Slider
- CSS Scroll Snap + GSAP ScrollTrigger for pinned horizontal scroll
- Room cards: image, name, amenity badges, price/night, "Book" CTA
- Live amenity filters (King Bed, AC, WiFi, Mountain View, etc.)
- Filter logic: pure JS array filtering → DOM update with GSAP fade

### 5. Banquet Planner
- Seating layout SVG visualizer (Theatre, Classroom, U-Shape, Banquet)
- GSAP-animated seat/table arrangement toggle
- Capacity counters with animated number tickers
- Image gallery of banquet hall

### 6. Restaurant & Menu
- Animated card grid: Breakfast, Lunch, Dinner, Specials tabs
- WhatsApp One-Click Order button on each dish card
- Dish details: name, description, price, allergens
- Scroll-reveal card entrance animations

### 7. Custom Booking Engine *(built from scratch)*
- Date range picker (check-in / check-out)
- Room type selector (dynamically loaded from Firestore `rooms` collection)
- Guest count selector
- Real-time availability check via Cloud Function `checkAvailability`
- Booking form → saved to Firestore `bookings` collection
- Instant confirmation modal + booking ID
- Cloud Function triggers: guest confirmation email + staff WhatsApp alert
- **No payment gateway in v1** — bookings are enquiry-based (pay at property)

### 8. RFQ (Request for Quote) Tool
- Clean multi-step form: Event Type → Dates → Guests → Requirements → Contact
- Client-side validation + XSS sanitization on all inputs
- Rate limiting (max 3 submissions/session via localStorage)
- Honeypot field for bot detection
- Saved to Firestore `rfq_enquiries` collection
- Staff notified via Cloud Function → WhatsApp/email alert

### 9. Transit Tracker Map
- Leaflet.js interactive map (no Google Maps API key needed)
- Markers: hotel location + key nearby places (railway station, airport, market)
- Popups with travel time estimates
- OpenStreetMap tiles (free, no API key)

### 10. WhatsApp Integration
- Floating WhatsApp button (bottom-right, pulsing animation)
- Pre-filled message templates for: Room booking, Room service, Event enquiry
- Uses `https://wa.me/` deep link (official WhatsApp Business API pattern)
- One-click from restaurant menu cards

### 11. 🔐 Admin Dashboard *(new — staff-only)*
- Protected by Firebase Authentication (email/password)
- **Bookings tab**: View all bookings, filter by date/status, mark as confirmed/cancelled
- **Rooms tab**: Add rooms, set prices, toggle availability on/off per date
- **Menu tab**: Add/edit/delete restaurant menu items + upload images to Cloud Storage
- **RFQ tab**: View event enquiries, one-click WhatsApp reply to enquirer
- All data in Firestore — updates reflect on the public site in real-time

### 12. Footer
- Hotel info, quick links, social links
- Newsletter signup form (sanitized, saved to Firestore)
- Embedded map
- Legal: Privacy Policy modal

---

## Security Hardened Features

| Threat | Mitigation |
|---|---|
| XSS via form inputs | DOMPurify sanitization on all user inputs |
| CSRF on forms | Honeypot fields + SameSite cookies |
| Clickjacking | `X-Frame-Options` meta + CSP headers |
| Bot spam on RFQ/booking | Rate limiting (localStorage) + honeypot field |
| Firebase key exposure | Firebase Security Rules enforce all access control — public keys are safe by design |
| Unauthorised admin access | Firebase Auth — only approved staff emails can log in |
| Direct Firestore write abuse | Firestore Security Rules: guests can only INSERT bookings, never read others' |
| Video/asset hotlinking | Cloud Storage signed URLs + CORS policy |
| Mixed content | All assets on HTTPS (Cloud Storage + Firebase CDN) |
| Admin route access | `/admin` returns 403 without valid Firebase Auth session token |

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Markup | HTML5 (semantic) | SEO + accessibility |
| Styling | CSS3 (Custom Properties, Grid, Flexbox) | No dependency overhead |
| Animation | GSAP 3.x + ScrollTrigger (CDN) | Industry-standard for cinematic UX |
| Smooth Scroll | Lenis (CDN) | Lightweight, GSAP-compatible |
| Database | Firebase Firestore (Spark/free) | 50K reads, 20K writes/day free |
| Auth | Firebase Authentication (free) | Secure admin panel, zero backend code |
| Email | EmailJS (browser SDK, free) | Guest + staff emails, no server needed |
| Notifications | WhatsApp `wa.me` deep links (free) | Instant staff alert on every booking |
| Hosting | Google Cloud Storage + Cloud CDN | Fast, cheap, globally distributed |
| Map | Leaflet.js (CDN) | Free, no API key required |
| Sanitization | DOMPurify (CDN) | XSS protection |
| Fonts | Google Fonts (Cormorant Garamond + Inter) | Luxury + readability |

### Firestore Data Model

```
firestore/
├── rooms/                      (managed by admin dashboard)
│   └── {roomId}/
│       ├── name: string
│       ├── type: string        (Deluxe / Suite / Executive)
│       ├── price: number       (per night, INR)
│       ├── amenities: string[] (AC, WiFi, King Bed, ...)
│       ├── images: string[]    (Cloud Storage URLs)
│       ├── available: boolean
│       └── blockedDates: string[]
│
├── bookings/
│   └── {bookingId}/
│       ├── guestName: string
│       ├── guestPhone: string
│       ├── guestEmail: string
│       ├── roomId: string      (ref to rooms)
│       ├── checkIn: timestamp
│       ├── checkOut: timestamp
│       ├── guests: number
│       ├── status: string      (pending / confirmed / cancelled)
│       └── createdAt: timestamp
│
├── menu_items/
│   └── {itemId}/
│       ├── name: string
│       ├── category: string    (Breakfast / Lunch / Dinner / Specials)
│       ├── price: number
│       ├── description: string
│       ├── image: string       (Cloud Storage URL)
│       └── available: boolean
│
├── rfq_enquiries/
│   └── {rfqId}/
│       ├── eventType: string
│       ├── dates: string
│       ├── guestCount: number
│       ├── requirements: string
│       ├── contactName: string
│       ├── contactPhone: string
│       ├── status: string      (new / contacted / closed)
│       └── createdAt: timestamp
│
└── banquet_requests/
    └── {id}/
        ├── name, phone, date, layout, guestCount
        └── createdAt: timestamp
```

---

## Design System

### 🌗 Dark / Light Theme System

The entire theme is driven by **CSS Custom Properties** scoped to `[data-theme]` attribute on `<html>`. JavaScript reads `localStorage` for persisted preference, then falls back to `prefers-color-scheme` OS setting. A smooth animated toggle button (sun/moon icon) sits in the navbar.

**Theme switching flow:**
```
OS prefers-color-scheme  →  localStorage override  →  [data-theme="dark|light"] on <html>
         (auto-detect)          (user preference)          (CSS applies tokens)
```

**No flash of wrong theme** — the theme is applied via an inline `<script>` snippet in `<head>` *before* any paint, using the classic FOUC-prevention pattern.

#### Dark Theme Tokens
| Token | Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#0D0D0D` | Page background |
| `--color-bg-secondary` | `#1A1A1A` | Card / section bg |
| `--color-bg-glass` | `rgba(255,255,255,0.06)` | Glassmorphism |
| `--color-text-primary` | `#F5F0E8` | Body text |
| `--color-text-muted` | `#9A9082` | Captions, labels |
| `--color-accent-gold` | `#C9A84C` | CTA, highlights |
| `--color-accent-emerald` | `#2D6A4F` | Nature accent |
| `--color-border` | `rgba(201,168,76,0.2)` | Subtle borders |

#### Light Theme Tokens
| Token | Value | Usage |
|---|---|---|
| `--color-bg-primary` | `#FAF7F2` | Page background |
| `--color-bg-secondary` | `#FFFFFF` | Card / section bg |
| `--color-bg-glass` | `rgba(0,0,0,0.04)` | Glassmorphism |
| `--color-text-primary` | `#1A1A1A` | Body text |
| `--color-text-muted` | `#6B6259` | Captions, labels |
| `--color-accent-gold` | `#A8872E` | CTA, highlights (darker for contrast) |
| `--color-accent-emerald` | `#1E4D38` | Nature accent |
| `--color-border` | `rgba(168,135,46,0.25)` | Subtle borders |

#### Transition
All theme switches animate smoothly:
```css
*, *::before, *::after {
  transition: background-color 0.35s ease, color 0.35s ease,
              border-color 0.35s ease, box-shadow 0.35s ease;
}
```

### Color Palette
- **Primary Gold**: `#C9A84C` / `#A8872E` (dark/light)
- **Deep Charcoal**: `#0D0D0D` / `#FAF7F2` (backgrounds)
- **Warm Ivory**: `#F5F0E8` / `#1A1A1A` (text)
- **Glass**: `rgba(255,255,255,0.06)` / `rgba(0,0,0,0.04)` (cards)
- **Emerald Accent**: `#2D6A4F` / `#1E4D38`

### Typography
- **Display**: Cormorant Garamond (serif, luxury feel)
- **Body**: Inter (clean, readable)
- **Accent Numbers**: Playfair Display

---

## Proposed Files to Create

### Core Files
#### [NEW] [index.html](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/index.html)
Main HTML entry — all sections in one page (SPA-style)

#### [NEW] [css/variables.css](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/css/variables.css)
Design tokens

#### [NEW] [css/reset.css](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/css/reset.css)
Modern CSS reset

#### [NEW] [css/main.css](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/css/main.css)
Compiled styles (imports all partials via @import)

#### [NEW] [js/main.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/main.js)
App bootstrap

#### [NEW] [js/modules/preloader.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/preloader.js)
Cinematic preloader

#### [NEW] [js/modules/lenis-scroll.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/lenis-scroll.js)
Lenis + GSAP ticker sync

#### [NEW] [js/modules/navbar.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/navbar.js)
Smart sticky navbar

#### [NEW] [js/modules/hero.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/hero.js)
Video hero + parallax

#### [NEW] [js/modules/rooms.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/rooms.js)
Horizontal room slider + filters

#### [NEW] [js/modules/banquet.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/banquet.js)
Banquet planner

#### [NEW] [js/modules/restaurant.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/restaurant.js)
Menu + WhatsApp orders

#### [NEW] [js/modules/rfq.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/rfq.js)
RFQ multi-step form

#### [NEW] [js/modules/map.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/map.js)
Transit tracker (Leaflet)

#### [NEW] [js/modules/whatsapp.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/whatsapp.js)
WhatsApp deep-link helpers

#### [NEW] [js/modules/security.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/security.js)
Input sanitization + rate limiting

#### [NEW] [js/modules/theme.js](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/js/modules/theme.js)
Dark/light theme toggle — reads `localStorage`, respects `prefers-color-scheme`, applies `[data-theme]` on `<html>`, animates sun/moon toggle icon with GSAP

#### [NEW] [.htaccess](file:///Users/spartan/AndroidStudioProjects/Hotel%20HMT%20Empire/.htaccess)
Security headers + performance optimization

---

## Open Questions for Client

> [!IMPORTANT]
> **These items need your input before/after initial build:**

1. **WhatsApp Number**: What is the hotel's WhatsApp Business number? (Format: country code + number, e.g., `919876543210`)
2. **Drone Video**: Do you have existing drone footage? If not, placeholder video will be used initially.
3. **Room Data**: How many room types/categories? (e.g., Deluxe, Suite, Executive, etc.)
4. **Restaurant Menu**: Approximate number of menu items and categories?
5. **Banquet Capacity**: What are the different seating configurations and their max capacities?
6. **Contact Email**: For RFQ form submissions and EmailJS setup (the hotel's Gmail/email).

> [!NOTE]
> The initial build will use placeholder content that you can replace. The website structure is fully data-driven via JS objects — updating content is as simple as editing a config object.

---

## Verification Plan

### Automated
- Browser DevTools Lighthouse audit (Performance, Accessibility, SEO ≥ 90)
- CSS validation via W3C
- HTML validation via W3C

### Manual
- Test on Chrome, Firefox, Safari, Edge
- Test on iOS Safari + Android Chrome
- Validate all form security measures
- Test WhatsApp deep links on mobile
- Verify GSAP animations at 60fps
- Check map loads without API key issues
