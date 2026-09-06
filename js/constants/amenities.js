/**
 * amenities.js — Hotel HMT Empire
 * Data constants for room amenities, menu categories,
 * banquet layouts, room types, and status enums.
 *
 * Add any new room feature, menu category, or layout HERE first.
 * ─────────────────────────────────────────────────────────────────────
 */

// ── Room Amenities ────────────────────────────────────────────────────
// Used for room filter pills and room card badge display
export const Amenities = [
  { id: 'ac',            label: 'Air Conditioning',  icon: '❄️',  filterLabel: 'AC'           },
  { id: 'wifi',          label: 'Free Wi-Fi',         icon: '📶',  filterLabel: 'Wi-Fi'        },
  { id: 'king-bed',      label: 'King Bed',           icon: '🛏️',  filterLabel: 'King Bed'     },
  { id: 'twin-bed',      label: 'Twin Beds',          icon: '🛏️',  filterLabel: 'Twin Beds'    },
  { id: 'mountain-view', label: 'Mountain View',      icon: '🏔️',  filterLabel: 'Mountain View'},
  { id: 'balcony',       label: 'Private Balcony',    icon: '🌿',  filterLabel: 'Balcony'      },
  { id: 'hot-water',     label: '24-hr Hot Water',    icon: '🚿',  filterLabel: 'Hot Water'    },
  { id: 'tv',            label: 'Smart TV (42")',      icon: '📺',  filterLabel: 'Smart TV'     },
  { id: 'room-service',  label: 'Room Service',       icon: '🍽️',  filterLabel: 'Room Service' },
  { id: 'mini-bar',      label: 'Mini Bar',           icon: '🍶',  filterLabel: 'Mini Bar'     },
  { id: 'bathtub',       label: 'Bathtub',            icon: '🛁',  filterLabel: 'Bathtub'      },
  { id: 'safe',          label: 'In-Room Safe',       icon: '🔒',  filterLabel: 'Safe'         },
  { id: 'heater',        label: 'Room Heater',        icon: '🔥',  filterLabel: 'Heater'       },
  { id: 'parking',       label: 'Free Parking',       icon: '🅿️',  filterLabel: 'Parking'      },
];

// ── Room Types ────────────────────────────────────────────────────────
// Used in booking modal room selector
export const RoomTypes = [
  {
    id:          'standard',
    label:       'Standard Room',
    description: 'Comfortable room with all essential amenities',
    basePrice:   1800,
    maxGuests:   2,
    amenities:   ['ac', 'wifi', 'tv', 'hot-water'],
  },
  {
    id:          'deluxe',
    label:       'Deluxe Room',
    description: 'Spacious room with premium furnishings and a stunning view',
    basePrice:   2800,
    maxGuests:   2,
    amenities:   ['ac', 'wifi', 'tv', 'hot-water', 'king-bed', 'mountain-view'],
  },
  {
    id:          'suite',
    label:       'Executive Suite',
    description: 'Our flagship suite featuring a private sitting area and luxury amenities',
    basePrice:   4500,
    maxGuests:   3,
    amenities:   ['ac', 'wifi', 'tv', 'hot-water', 'king-bed', 'mountain-view', 'balcony', 'bathtub', 'mini-bar', 'safe'],
  },
  {
    id:          'premium',
    label:       'Premium Suite',
    description: 'Ultimate indulgence with panoramic mountain views and exclusive perks',
    basePrice:   7000,
    maxGuests:   4,
    amenities:   ['ac', 'wifi', 'tv', 'hot-water', 'king-bed', 'mountain-view', 'balcony', 'bathtub', 'mini-bar', 'safe', 'room-service'],
  },
];

// ── Menu / Dining Categories ──────────────────────────────────────────
export const MenuCategories = [
  { id: 'breakfast', label: 'Breakfast',       icon: '☀️',  timeRange: '7:00 AM – 10:30 AM' },
  { id: 'lunch',     label: 'Lunch',           icon: '🍱',  timeRange: '12:00 PM – 3:00 PM'  },
  { id: 'dinner',    label: 'Dinner',          icon: '🌙',  timeRange: '7:00 PM – 10:30 PM'  },
  { id: 'specials',  label: "Chef's Specials", icon: '⭐',  timeRange: 'All Day'              },
];

// ── Banquet Seating Layouts ───────────────────────────────────────────
export const BanquetLayouts = [
  {
    id:          'theatre',
    label:       'Theatre Style',
    capacity:    250,
    icon:        '🎭',
    description: 'Rows of chairs facing a stage/screen. Best for presentations, seminars, conferences.',
    svgLayout:   'theatre', // key for SVG renderer in banquet.js
  },
  {
    id:          'classroom',
    label:       'Classroom Style',
    capacity:    150,
    icon:        '📚',
    description: 'Rows of tables with chairs. Ideal for workshops, training sessions, exams.',
    svgLayout:   'classroom',
  },
  {
    id:          'banquet',
    label:       'Banquet Round Tables',
    capacity:    200,
    icon:        '🎉',
    description: 'Round tables seating 8–10 each. Perfect for weddings, galas, and celebrations.',
    svgLayout:   'banquet',
  },
  {
    id:          'u-shape',
    label:       'U-Shape',
    capacity:    60,
    icon:        '🔷',
    description: 'Tables arranged in a U. Best for interactive meetings and board sessions.',
    svgLayout:   'ushape',
  },
  {
    id:          'cocktail',
    label:       'Cocktail / Standing',
    capacity:    350,
    icon:        '🥂',
    description: 'Open floor with high tables. Maximum capacity for receptions and networking.',
    svgLayout:   'cocktail',
  },
];

// ── Event Types (for RFQ form step 1) ────────────────────────────────
export const EventTypes = [
  { id: 'wedding',    label: 'Wedding',            icon: '💍' },
  { id: 'birthday',   label: 'Birthday Party',      icon: '🎂' },
  { id: 'conference', label: 'Conference / Meeting', icon: '💼' },
  { id: 'seminar',    label: 'Seminar / Workshop',   icon: '📊' },
  { id: 'reception',  label: 'Reception / Cocktail', icon: '🥂' },
  { id: 'corporate',  label: 'Corporate Event',      icon: '🏢' },
  { id: 'puja',       label: 'Puja / Religious',     icon: '🪔' },
  { id: 'other',      label: 'Other',                icon: '✨' },
];

// ── Booking Status Codes ──────────────────────────────────────────────
export const BookingStatus = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW:   'no_show',
};

// ── RFQ Enquiry Status Codes ──────────────────────────────────────────
export const RFQStatus = {
  NEW:       'new',
  CONTACTED: 'contacted',
  QUOTED:    'quoted',
  CLOSED:    'closed',
  LOST:      'lost',
};

// ── Booking Status Labels & Colors ───────────────────────────────────
export const BookingStatusMeta = {
  [BookingStatus.PENDING]:   { label: 'Pending',   colorClass: 'status--warning'  },
  [BookingStatus.CONFIRMED]: { label: 'Confirmed', colorClass: 'status--success'  },
  [BookingStatus.CANCELLED]: { label: 'Cancelled', colorClass: 'status--error'    },
  [BookingStatus.COMPLETED]: { label: 'Completed', colorClass: 'status--info'     },
  [BookingStatus.NO_SHOW]:   { label: 'No-show',   colorClass: 'status--muted'    },
};
