/**
 * config.js — Hotel HMT Empire
 * App-wide configuration constants.
 *
 * ⚠️  NEVER put secret API keys here. Firebase public keys are safe by design
 *     (protected entirely by Firestore Security Rules, not by key secrecy).
 *
 * To configure the live site, replace placeholder values marked with 👈
 * ─────────────────────────────────────────────────────────────────────
 */

export const Config = {

  // ── Hotel Details ─────────────────────────────────────────────────
  HOTEL: {
    NAME: 'Hotel HMT Empire',
    TAGLINE: 'Where Comfort Meets Elegance',
    PHONE: '+91 8340434516',        // 👈 Replace with real phone
    WHATSAPP: '918340434516',          // 👈 country code + number, no +
    EMAIL: 'krvinay199.ai@gmail.com', // 👈 Replace with real email
    ADDRESS_LINE1: 'Main Road, Domchanch',
    ADDRESS_LINE2: 'Koderma District, Jharkhand – 825418',
    GSTIN: '',                      // 👈 GST number if applicable

    // GPS coordinates for the hotel pin on the map
    LAT: 24.4734,
    LNG: 85.6837,
  },

  // ── Firebase (Public Config — safe to commit) ─────────────────────
  FIREBASE: {
    API_KEY: 'YOUR_API_KEY',               // 👈 Replace
    AUTH_DOMAIN: 'YOUR_PROJECT.firebaseapp.com', // 👈 Replace
    PROJECT_ID: 'YOUR_PROJECT_ID',            // 👈 Replace
    STORAGE_BUCKET: 'YOUR_PROJECT.appspot.com',   // 👈 Replace
    MESSAGING_SENDER_ID: 'YOUR_SENDER_ID',             // 👈 Replace
    APP_ID: 'YOUR_APP_ID',                // 👈 Replace
    MEASUREMENT_ID: 'YOUR_MEASUREMENT_ID',        // 👈 Replace (optional GA4)
  },

  // ── EmailJS (Browser-based email — no backend needed) ─────────────
  EMAILJS: {
    SERVICE_ID: 'YOUR_SERVICE_ID',    // 👈 From emailjs.com dashboard
    TEMPLATE_BOOKING: 'template_booking',   // 👈 Template for booking confirm
    TEMPLATE_RFQ: 'template_rfq',       // 👈 Template for RFQ enquiry
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY',    // 👈 EmailJS public key
  },

  // ── Booking Engine ────────────────────────────────────────────────
  BOOKING: {
    CURRENCY_SYMBOL: '₹',
    CURRENCY_CODE: 'INR',
    MAX_GUESTS_PER_ROOM: 4,
    MIN_ADVANCE_DAYS: 0,     // 0 = same-day booking allowed
    MAX_ADVANCE_DAYS: 365,   // 1 year ahead
    CHECK_IN_TIME: '12:00 PM',
    CHECK_OUT_TIME: '11:00 AM',
    BOOKING_ID_PREFIX: 'HMT',
  },

  // ── Map Configuration ──────────────────────────────────────────────
  MAP: {
    DEFAULT_ZOOM: 14,
    MAX_ZOOM: 18,
    MIN_ZOOM: 5,
    TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

    // Nearby places shown as map markers
    NEARBY_PLACES: [
      {
        id: 'railway',
        label: 'Koderma Railway Station',
        lat: 24.4641,
        lng: 85.5997,
        distance: '12 km',
        time: '20 min',
        icon: '🚂',
      },
      {
        id: 'bus',
        label: 'Domchanch Bus Stand',
        lat: 24.4712,
        lng: 85.6810,
        distance: '1 km',
        time: '5 min walk',
        icon: '🚌',
      },
      {
        id: 'highway',
        label: 'NH-2 Highway Entry',
        lat: 24.4580,
        lng: 85.6600,
        distance: '3 km',
        time: '8 min',
        icon: '🛣️',
      },
      {
        id: 'airport',
        label: 'Birsa Munda Airport, Ranchi',
        lat: 23.3143,
        lng: 85.3217,
        distance: '145 km',
        time: '2.5 hrs',
        icon: '✈️',
      },
    ],
    // Google Maps embed URLs (satellite = default, roadmap = street view)
    EMBED_SATELLITE: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3631.2671062952913!2d85.66448877502643!3d24.476200378182114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f3a10051803919%3A0x41f1313be7b9ff8f!2sHOTEL%20HMT%20EMPIRE!5e1!3m2!1sen!2sin!4v1788101041231!5m2!1sen!2sin',
    EMBED_ROADMAP:   'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3631.2671062952913!2d85.66448877502643!3d24.476200378182114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f3a10051803919%3A0x41f1313be7b9ff8f!2sHOTEL%20HMT%20EMPIRE!5e0!3m2!1sen!2sin!4v1788101041231!5m2!1sen!2sin',
  },

  // ── Security ───────────────────────────────────────────────────────
  SECURITY: {
    MAX_RFQ_PER_SESSION: 3,         // max enquiry submissions per session
    RFQ_RATE_LIMIT_KEY: 'hmt_rfq_count',  // localStorage key
    HONEYPOT_FIELD: 'website', // hidden bot-trap field name
    MAX_INPUT_LENGTH: 1000,      // max chars in any text input
    MAX_NAME_LENGTH: 100,
    MAX_NOTES_LENGTH: 2000,
    ALLOWED_PHONE_REGEX: /^[6-9]\d{9}$/,       // Indian mobile
    ALLOWED_EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  // ── Feature Flags ──────────────────────────────────────────────────
  FEATURES: {
    DARK_MODE_DEFAULT: true,      // site loads in dark mode unless user saved preference
    SHOW_PRELOADER: true,      // show cinematic intro on first load
    PRELOADER_SKIP_KEY: 'hmt_preloader_seen', // localStorage key
    ENABLE_ANIMATIONS: true,      // GSAP animations master switch
    ENABLE_MAP: true,      // Leaflet transit map
    ENABLE_BOOKING: true,      // booking modal
    ENABLE_EMAILJS: false,     // 👈 set true after EmailJS is configured
    ENABLE_ANALYTICS: false,     // 👈 set true after Firebase Analytics configured
    ENABLE_DEBUG_LOGS: false,    // 👈 disable console output in production
  },

  // ── Social Media ───────────────────────────────────────────────────
  SOCIAL: {
    FACEBOOK: '',  // 👈 Add URL
    INSTAGRAM: '',  // 👈 Add URL
    TWITTER: '',  // 👈 Add URL
    YOUTUBE: '',  // 👈 Add URL
    TRIPADVISOR: '',  // 👈 Add URL
    GOOGLE_MAP: `https://maps.google.com/?q=24.4734,85.6837`,
  },

  // ── Content Stats (displayed on About section) ────────────────────
  STATS: [
    { value: 40, suffix: '+', label: 'Rooms' },
    { value: 15, suffix: '+', label: 'Years of Excellence' },
    { value: 5000, suffix: '+', label: 'Events Hosted' },
    { value: 50, suffix: 'K+', label: 'Happy Guests' },
  ],

  // ── Firestore Collection Names ────────────────────────────────────
  // ⚠️  If you rename a collection in Firestore, update it HERE ONLY.
  COLLECTIONS: {
    ROOMS: 'rooms',
    BOOKINGS: 'bookings',
    MENU_ITEMS: 'menu_items',
    RFQ_ENQUIRIES: 'rfq_enquiries',
    BANQUET_REQ: 'banquet_requests',
    SUBSCRIBERS: 'newsletter_subscribers',
  },
};
