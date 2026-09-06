/**
 * navbar.js — Hotel HMT Empire
 * Sticky nav: scroll detection, progress bar, active links,
 * mobile hamburger menu, smooth anchor scroll.
 */

import { NavRoutes, SectionIds } from '../constants/routes.js';
import { Strings } from '../constants/strings.js';
import { scrollTo, stopScroll, startScroll } from './lenis-scroll.js';

const SCROLL_THRESHOLD = 60; // px before navbar gains glass background

let mobileMenuOpen = false;

export function initNavbar() {
  renderNavLinks();
  initScrollBehavior();
  initMobileMenu();
  initBookNowCTA();
  observeActiveSections();
  handleAnchorClicks();
}

/** Render desktop and mobile nav links from routes.js */
function renderNavLinks() {
  const desktopContainer = document.getElementById('navbar-links');
  const mobileContainer  = document.getElementById('mobile-menu-links');

  NavRoutes.forEach(({ id, label, href }) => {
    // Desktop link
    const a = document.createElement('a');
    a.href      = href;
    a.className = 'navbar__link';
    a.id        = `desktop-${id}`;
    a.textContent = label;
    a.setAttribute('role', 'listitem');
    a.addEventListener('click', (e) => {
      e.preventDefault();
      scrollTo(href, -80);
    });
    desktopContainer?.appendChild(a);

    // Mobile link
    const ma = document.createElement('a');
    ma.href        = href;
    ma.className   = 'mobile-menu__link';
    ma.id          = `mobile-${id}`;
    ma.textContent = label;
    ma.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
      setTimeout(() => scrollTo(href, -80), 300);
    });
    mobileContainer?.appendChild(ma);
  });

  // Mobile menu Admin Login link
  if (mobileContainer) {
    const adminLink = document.createElement('a');
    adminLink.href = 'admin/';
    adminLink.className = 'mobile-menu__link';
    adminLink.id = 'mobile-nav-admin';
    adminLink.innerHTML = '🔒 Admin Login';
    adminLink.style.color = 'var(--clr-gold)';
    mobileContainer.appendChild(adminLink);
  }
}

/** Sticky glass effect + scroll progress bar */
function initScrollBehavior() {
  const navbar   = document.getElementById('navbar');
  const progress = document.getElementById('navbar__progress');
  if (!navbar) return;

  const update = () => {
    const scrollY = window.scrollY;
    const docH    = document.documentElement.scrollHeight - window.innerHeight;
    const pct     = docH > 0 ? (scrollY / docH) * 100 : 0;

    // Toggle glass class
    navbar.classList.toggle('is-scrolled', scrollY > SCROLL_THRESHOLD);

    // Update scroll progress bar
    if (progress) progress.style.width = `${pct}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  update(); // run once on load
}

/** Hamburger + mobile menu overlay */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    mobileMenuOpen ? closeMobileMenu() : openMobileMenu();
  });

  // Close on backdrop click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMobileMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen) closeMobileMenu();
  });
}

function openMobileMenu() {
  const hamburger  = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const links      = mobileMenu?.querySelectorAll('.mobile-menu__link');
  const footer     = mobileMenu?.querySelector('.mobile-menu__footer');

  mobileMenuOpen = true;
  hamburger?.classList.add('is-open');
  mobileMenu?.classList.add('is-open');
  hamburger?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('drawer-open');
  stopScroll();

  if (window.gsap && links) {
    window.gsap.to(mobileMenu, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    window.gsap.fromTo(
      links,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power3.out', delay: 0.15 }
    );
    if (footer) {
      window.gsap.fromTo(footer, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.45 });
    }
  } else {
    // Fallback if GSAP is not loaded
    if (mobileMenu) mobileMenu.style.opacity = '1';
    if (links) links.forEach(l => {
      l.style.opacity = '1';
      l.style.transform = 'none';
    });
    if (footer) footer.style.opacity = '1';
  }
}

function closeMobileMenu() {
  const hamburger  = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const links      = mobileMenu?.querySelectorAll('.mobile-menu__link');
  const footer     = mobileMenu?.querySelector('.mobile-menu__footer');

  mobileMenuOpen = false;
  hamburger?.classList.remove('is-open');
  hamburger?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('drawer-open');
  startScroll();

  if (window.gsap && mobileMenu) {
    // Reset links state on close
    window.gsap.to([links, footer], { opacity: 0, y: 15, duration: 0.15, overwrite: 'auto' });
    window.gsap.to(mobileMenu, {
      opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        mobileMenu.classList.remove('is-open');
        // Reset styles for next open
        if (links) links.forEach(l => {
          l.style.opacity = '';
          l.style.transform = '';
        });
        if (footer) footer.style.opacity = '';
      }
    });
  } else {
    mobileMenu?.classList.remove('is-open');
  }
}

/** Book Now CTA in navbar scrolls to rooms */
function initBookNowCTA() {
  const btn = document.getElementById('navbar-book-btn');
  btn?.addEventListener('click', () => {
    import('./booking.js').then(m => m.openBookingModal());
  });
}

/** IntersectionObserver for active nav link highlighting */
function observeActiveSections() {
  const sectionIds = Object.values(SectionIds);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Find matching nav link
          const id = entry.target.id;
          const route = NavRoutes.find(r => r.sectionId === id);
          if (!route) return;

          // Remove active from all
          document.querySelectorAll('.navbar__link').forEach(l => l.classList.remove('is-active'));
          // Add active to matching
          document.getElementById(`desktop-${route.id}`)?.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

/** Handle all anchor links throughout the page for smooth scroll */
function handleAnchorClicks() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    if (anchor.classList.contains('navbar__link') || anchor.classList.contains('mobile-menu__link')) {
      return; // already handled above
    }
    const href = anchor.getAttribute('href');
    if (href && href.startsWith('#') && href.length > 1 && !href.startsWith('#/')) {
      try {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          scrollTo(href, -80);
        }
      } catch {
        // Not a valid CSS selector, let standard behavior handle it
      }
    }
  });
}

