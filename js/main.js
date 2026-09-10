document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- Restore scroll position after returning from a
   placeholder page (see coverAndNavigate below). The browser's own
   scroll restoration is disabled so it can't fight this, and the
   actual scroll happens on 'load' once layout has settled. ---------------- */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const pendingScrollY = sessionStorage.getItem('vinarija27-scrollY');
if (pendingScrollY !== null) sessionStorage.removeItem('vinarija27-scrollY');

/* ---------------- Loader ---------------- */
window.addEventListener('load', () => {
  if (pendingScrollY !== null) {
    const y = parseInt(pendingScrollY, 10);
    window.scrollTo({ top: y, behavior: 'instant' });
    /* Some sections (e.g. the pinned statement/resort slider) still
       settle their layout height right after load, which can nudge
       this off by a bit — reapply once that's had time to happen. */
    setTimeout(() => window.scrollTo({ top: y, behavior: 'instant' }), 150);
  }
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 500);
});

/* ---------------- Page transition (two-panel wipe on internal nav) ---------------- */
(function pageTransitions() {
  const el = document.getElementById('pageTransition');
  if (!el) return;
  let running = false;

  function runTransition(target) {
    if (running) return;
    running = true;
    el.classList.add('pt-animate');
    requestAnimationFrame(() => el.classList.add('pt-cover'));
    el.addEventListener('transitionend', function coverDone(e) {
      if (e.propertyName !== 'transform') return;
      el.removeEventListener('transitionend', coverDone);
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      el.classList.remove('pt-cover');
      el.classList.add('pt-reveal');
      el.addEventListener('transitionend', function revealDone(e2) {
        if (e2.propertyName !== 'transform') return;
        el.removeEventListener('transitionend', revealDone);
        el.classList.remove('pt-animate', 'pt-reveal');
        running = false;
      }, { once: true });
    }, { once: true });
  }

  document.querySelectorAll('a[href^="#"]:not([target="_blank"])').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const targetId = a.getAttribute('href');
      const target = targetId && document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      runTransition(target);
    });
  });

  function coverAndNavigate(url) {
    if (running) return;
    running = true;
    sessionStorage.setItem('vinarija27-scrollY', String(window.scrollY));
    el.classList.add('pt-animate');
    requestAnimationFrame(() => el.classList.add('pt-cover'));
    el.addEventListener('transitionend', function coverDone(e) {
      if (e.propertyName !== 'transform') return;
      el.removeEventListener('transitionend', coverDone);
      window.location.href = url;
    }, { once: true });
  }

  document.querySelectorAll('a.page-transition-link:not([target="_blank"])').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = a.getAttribute('href');
      if (!url) return;
      e.preventDefault();
      coverAndNavigate(url);
    });
  });
})();

/* ---------------- Navbar ---------------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
});

const mobileNavLang = document.getElementById('mobileNavLang');
if (mobileNavLang) {
  const langLabel = mobileNavLang.querySelector('.nav-lang-label');
  const toggleLang = () => {
    langLabel.textContent = langLabel.textContent === 'EN' ? 'SR' : 'EN';
  };
  mobileNavLang.addEventListener('click', toggleLang);
  mobileNavLang.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleLang();
    }
  });
}

const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const menuClose = document.getElementById('menuClose');
function setMenuOpen(open) {
  mobileMenu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
}
navToggle.addEventListener('click', () => setMenuOpen(!mobileMenu.classList.contains('open')));
menuClose.addEventListener('click', () => setMenuOpen(false));
mobileMenu.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => setMenuOpen(false))
);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenuOpen(false);
});

/* ---------------- Scroll reveal ---------------- */
document.querySelectorAll(
  '#about, #location'
).forEach(el => el.classList.add('reveal'));

document.querySelector('footer .footer-brand-mark')?.classList.add('reveal');
document.querySelector('footer .footer-links')?.classList.add('reveal', 'reveal-stagger-1');
document.querySelector('footer .footer-contact')?.classList.add('reveal', 'reveal-stagger-2');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .reveal-scale').forEach(el => revealObserver.observe(el));

/* ---------------- Statement photo/text split (repeatable, no pin) ---------------- */
(function statementSplit() {
  const wrapper = document.getElementById('statementPinWrapper');
  const box = document.getElementById('statementBox');
  const text = document.getElementById('statementText');
  if (!wrapper || !box || !text) return;

  // Heading/button reveal synced to THIS section's own image-split
  // IntersectionObserver (below) instead of the generic scroll-position
  // checkRevealUp mechanism, so all three share one trigger — but the
  // sequence is strictly image-first: the heading/button's in-view
  // class flips at the same instant as is-split, yet their CSS
  // transition-delay (set in style.css, scoped to #statementText) is
  // tuned to just past the 1s it takes .statement-box/.statement-text
  // to finish their width/opacity animation, so the text only starts
  // moving once the photo has fully settled into its two-square
  // layout. The heading drifts gently down into place
  // (.reveal-down-sync), the button rises from below like the Wine
  // Estates / Food Experience reveal-up (.reveal-up-sync). Distinct
  // classes (identical-shaped CSS, different transform) keep both out
  // of the shared '.reveal-up, .reveal-line' NodeList so the two
  // triggers never fight over the same elements.
  const heading = text.querySelector('.statement-heading');
  const cta = text.querySelector('.btn-rect');
  if (heading) heading.classList.add('reveal-down-sync');
  if (cta) cta.classList.add('reveal-up-sync');
  const syncedReveals = [heading, cta].filter(Boolean);

  const splitObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      box.classList.toggle('is-split', entry.isIntersecting);
      text.classList.toggle('is-split', entry.isIntersecting);
      syncedReveals.forEach(el => el.classList.toggle('in-view', entry.isIntersecting));
    });
  }, { threshold: 0.3 });

  splitObserver.observe(wrapper);
})();

/* ---------------- Bottom-to-top heading/CTA reveal ---------------- */
document.querySelectorAll(
  '#discover-band .statement-heading, ' +
  '#estatesHeading, ' +
  '#food-experience .food-heading, ' +
  '#location .section-label, #location h2'
).forEach(el => el.classList.add('reveal-up'));

document.querySelectorAll(
  '#discover-band .btn-rect'
).forEach(el => el.classList.add('reveal-up', 'reveal-up-delay'));

// Food Experience: the label/subheading/lead text/VIEW button sit well
// below the "Food Experience" heading (a divider and photo grid come
// between them), so checking each one's own scroll position independently
// makes them trigger long after the heading already has. They instead
// all watch the heading's own position via data-reveal-trigger, so the
// whole block's in-view flips at one shared moment. The heading and the
// label/subheading/lead text reveal together (no extra delay between
// them), and the VIEW button follows right after that group finishes —
// timing is entirely transition-delay/duration, scoped in style.css
// under #food-experience.
const foodHeadingSelector = '#food-experience .food-heading';
document.querySelectorAll(
  '#food-experience .section-label, #food-experience .food-subheading'
).forEach(el => {
  el.classList.add('reveal-up');
  el.dataset.revealTrigger = foodHeadingSelector;
});
document.querySelectorAll('#food-experience .lead').forEach(el => {
  el.classList.add('reveal-up');
  el.dataset.revealTrigger = foodHeadingSelector;
});
document.querySelectorAll('#food-experience .food-copy .btn-rect').forEach(el => {
  el.classList.add('reveal-up');
  el.dataset.revealTrigger = foodHeadingSelector;
});

// Divider under the heading: draws in left-to-right (scaleX), triggered
// off the same heading position, starting shortly after the heading
// itself begins its own bottom-to-top reveal.
document.querySelectorAll('#food-experience .food-divider').forEach(el => {
  el.classList.add('reveal-line', 'reveal-up-delay');
  el.dataset.revealTrigger = foodHeadingSelector;
});

// Food photos: each one triggers off its own position (not the shared
// foodHeadingSelector above), so the left/right pair — which sit at
// roughly the same height — drop down together as they scroll into
// view, and the lower "below" photo naturally follows a bit after,
// once the user has scrolled further and it reaches that same point.
document.querySelectorAll('#food-experience .food-photo').forEach(el => {
  el.classList.add('reveal-up');
});

// REVIEWS heading/button: same reveal, triggered a bit earlier (see
// reveal-up-early in checkRevealUp below) so it doesn't feel like it
// lags at the bottom edge of the viewport.
document.querySelectorAll(
  '#about .reviews-heading, #about .testimonials-sub, #about .testimonials-rating'
).forEach(el => el.classList.add('reveal-up', 'reveal-up-early'));

document.querySelectorAll('#about .reviews-viewall').forEach(el =>
  el.classList.add('reveal-up', 'reveal-up-delay', 'reveal-up-early')
);

// Wine Estates panels: same rise-up reveal as the "WINE ESTATES" heading
// above them, triggered off the heading's own position (like the Food
// Experience block above) so the panels start rising the moment the
// heading itself starts, rather than lagging behind since they sit lower
// on the page. A small stagger still spaces the three panels apart.
// Applied to the photo AND its dark overlay together (so no bare overlay
// rectangle is visible before the photo arrives) — not the whole
// .estate-panel — so the title/DISCOVER button in .estate-panel-content
// stay visible throughout.
document.querySelectorAll('#estatesPanels .estate-panel').forEach((panel, i) => {
  const staggerClass = i === 1 ? 'reveal-up-stagger-1' : i === 2 ? 'reveal-up-stagger-2' : null;
  panel.querySelectorAll('.estate-panel-image, .estate-panel-overlay').forEach((el) => {
    el.classList.add('reveal-up');
    el.dataset.revealTrigger = '#estatesHeading';
    if (staggerClass) el.classList.add(staggerClass);
  });
});

// Not IntersectionObserver: clip-path on the observed element itself
// makes Chromium report intersectionRatio stuck at 0, so visibility is
// computed manually here instead. A short section (like the discover
// band) can be smaller than the viewport, so a visibility-ratio
// threshold (e.g. 25%) is satisfied within the first few px of the
// section peeking in — firing (and finishing) the reveal well before
// the user has actually scrolled to it. Trigger on position instead:
// once the element's top has scrolled up into the lower half of the
// viewport, i.e. the user has genuinely arrived at it. Toggled (not
// one-shot) so scrolling back to the top and back down replays it.
const revealUpEls = document.querySelectorAll('.reveal-up, .reveal-line');
function checkRevealUp() {
  revealUpEls.forEach((el) => {
    // data-reveal-trigger lets an element watch another element's
    // position instead of its own — used where a block sits well below
    // its heading in the layout, so it can still fire off the heading's
    // own trigger moment rather than lagging behind it.
    const triggerSelector = el.dataset.revealTrigger;
    const triggerEl = (triggerSelector && document.querySelector(triggerSelector)) || el;
    const rect = triggerEl.getBoundingClientRect();
    const triggerRatio = el.classList.contains('reveal-up-early') ? 0.75 : 0.6;
    el.classList.toggle('in-view', rect.top <= window.innerHeight * triggerRatio);
  });
}
window.addEventListener('scroll', checkRevealUp, { passive: true });
window.addEventListener('resize', checkRevealUp);
checkRevealUp();

/* ---------------- 3D tilt on cards ---------------- */
document.querySelectorAll('[data-tilt]').forEach(card => {
  const strength = 10;
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength).toFixed(2)}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
  });
});

/* ---------------- Hero video ---------------- */
(function heroVideoSetup() {
  const video = document.getElementById('heroVideo');
  if (!video) return;
  video.addEventListener('error', () => { video.style.display = 'none'; });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.pause();
  }
})();

/* ---------------- Statement image slider (pool / garden) ---------------- */
(function statementSlider() {
  const box = document.getElementById('statementBox');
  const dotsWrap = document.getElementById('statementSliderDots');
  const prevBtn = document.getElementById('statementPrev');
  const nextBtn = document.getElementById('statementNext');
  if (!box || !dotsWrap) return;

  const slides = box.querySelectorAll('.statement-slide');
  const dots = dotsWrap.querySelectorAll('.slider-dot');
  let current = 0;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
  });
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Drag / swipe support (mouse + touch, via Pointer Events)
  let startX = 0;
  let dragging = false;
  const dragThreshold = 40;

  box.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.slider-arrow, .slider-dot')) return;
    dragging = true;
    startX = e.clientX;
    box.classList.add('dragging');
    box.setPointerCapture(e.pointerId);
  });
  box.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    e.preventDefault();
  });
  box.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    box.classList.remove('dragging');
    const delta = e.clientX - startX;
    if (Math.abs(delta) > dragThreshold) {
      goTo(delta < 0 ? current + 1 : current - 1);
    }
  });
  box.addEventListener('pointercancel', () => {
    dragging = false;
    box.classList.remove('dragging');
  });
})();

/* ---------------- Testimonials carousel (infinite loop) ---------------- */
(function testimonialsCarousel() {
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('testimonialsPrev');
  const nextBtn = document.getElementById('testimonialsNext');
  if (!track) return;

  // Duplicate the whole set of cards before and after the real ones.
  // A browser clamps scrollLeft at its true content boundary, so it
  // can't scroll the last couple of cards flush to the left edge —
  // there just isn't enough trailing content to make room. With only
  // one clone card that clamp kicks in exactly where the loop needs to
  // land, snapping to the wrong card. Wrapping through a full spare
  // copy on each side means a "next" past the last real card only ever
  // steps one card into that copy (nowhere near the far end of the
  // whole strip), then silently re-centers by exactly one set's width —
  // always well inside safely scrollable territory.
  const realCards = Array.from(track.children);
  const realCount = realCards.length;
  if (realCount < 2) return;

  const firstReal = realCards[0];
  realCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.insertBefore(clone, firstReal);
  });
  realCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  // Card width is normally a CSS calc() against the track's own
  // percentage width, but nested percentage flex-basis (a flex item
  // sized by percentage, inside a flex item that's ALSO percentage/flex
  // sized) resolves inconsistently across viewport sizes in testing —
  // it can get stuck referencing a stale intrinsic width instead of the
  // track's actual final size. Compute the width in JS instead and pin
  // it as a plain pixel custom property, so exactly 4 cards fit with no
  // ambiguity. Skipped below the mobile breakpoint, where CSS fixes
  // cards at 260px regardless.
  function updateCardWidthVar() {
    if (window.innerWidth <= 640) return;
    const trackStyles = getComputedStyle(track);
    const gap = parseFloat(trackStyles.columnGap) || 0;
    const paddingX = parseFloat(trackStyles.paddingLeft) + parseFloat(trackStyles.paddingRight);
    const contentWidth = track.clientWidth - paddingX;
    const cardWidth = (contentWidth - gap * 3) / 4;
    if (cardWidth > 0) track.style.setProperty('--tcard-w', cardWidth + 'px');
  }

  function cardStep() {
    const card = track.querySelector('.testimonial-card');
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.offsetWidth + gap;
  }

  updateCardWidthVar();
  let step = cardStep();
  // Position index within the tripled strip: 0..realCount-1 = leading
  // clones, realCount..2*realCount-1 = real cards, rest = trailing clones.
  let index = realCount;
  track.scrollLeft = step * index;

  function jumpTo(i, smooth) {
    track.scrollTo({ left: step * i, behavior: smooth ? 'smooth' : 'auto' });
  }

  function settle() {
    const raw = Math.round(track.scrollLeft / step);
    if (raw >= realCount * 2) {
      index = raw - realCount;
      jumpTo(index, false);
    } else if (raw < realCount) {
      index = raw + realCount;
      jumpTo(index, false);
    } else {
      index = raw;
    }
  }

  let settleTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 120);
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateCardWidthVar();
    step = cardStep();
    track.scrollLeft = step * index;
  });

  if (prevBtn) prevBtn.addEventListener('click', () => { index--; jumpTo(index, true); });
  if (nextBtn) nextBtn.addEventListener('click', () => { index++; jumpTo(index, true); });
})();

/* =====================================================
   WINE ESTATES — accordion image panels.
   Hovering (mouse) or tapping (touch) a panel expands it
   while the other two shrink; a click outside collapses
   back to the equal-width default.
===================================================== */
(function estatesAccordion() {
  const panels = document.querySelectorAll('.estate-panel');
  const container = document.getElementById('estatesPanels');
  if (!panels.length || !container) return;

  function setActive(panel) {
    panels.forEach((p) => {
      p.classList.toggle('active', p === panel);
      p.classList.toggle('shrink', p !== panel);
    });
  }
  function reset() {
    panels.forEach((p) => p.classList.remove('active', 'shrink'));
  }

  const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const stackedOnMobile = window.matchMedia('(max-width: 700px)').matches;

  if (hoverCapable) {
    panels.forEach((panel) => {
      panel.addEventListener('pointerenter', () => setActive(panel));
    });
    container.addEventListener('pointerleave', reset);
  } else if (!stackedOnMobile) {
    panels.forEach((panel) => {
      panel.addEventListener('click', (e) => {
        if (!panel.classList.contains('active')) {
          e.preventDefault();
          setActive(panel);
        }
      });
    });
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) reset();
    });
  }
})();

/* =====================================================
   WINE SHOWCASE — alternating bottle rows that slide in
   horizontally from the edge they belong to as the row
   scrolls into view, and slide back out the same way when
   scrolling back up (continuous, scroll-position-linked,
   not a one-shot reveal).
===================================================== */
(function bottleRowsSlide() {
  const rows = document.querySelectorAll('.bottle-row');
  if (!rows.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const items = Array.from(rows).map((row) => ({
    img: row.querySelector('.bottle-img'),
    row,
    side: row.dataset.side === 'right' ? 1 : -1,
  })).filter((item) => item.img);

  function update() {
    const vh = window.innerHeight;
    const start = vh * 0.92;
    const end = vh * 0.4;
    items.forEach(({ img, row, side }) => {
      const rect = row.getBoundingClientRect();
      const raw = (start - rect.top) / (start - end);
      const progress = Math.min(Math.max(raw, 0), 1);
      const offset = (1 - progress) * 130;
      img.style.transform = `translateX(${(side * offset).toFixed(1)}%)`;
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
