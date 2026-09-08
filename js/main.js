document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- Loader ---------------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 500);
});

/* ---------------- Navbar ---------------- */
const navbar = document.getElementById('navbar');
const heroWrapperForNav = document.getElementById('heroPinWrapper');
function navScrolledThreshold() {
  if (!heroWrapperForNav) return 40;
  return Math.max(heroWrapperForNav.offsetHeight - window.innerHeight, 40);
}
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > navScrolledThreshold());
});

const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mobileMenu.classList.remove('open'))
);

/* ---------------- Scroll reveal ---------------- */
document.querySelectorAll(
  '#about, #location, #contact'
).forEach(el => el.classList.add('reveal'));

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

// REVIEWS heading/button: same reveal, triggered a bit earlier (see
// reveal-up-early in checkRevealUp below) so it doesn't feel like it
// lags at the bottom edge of the viewport.
document.querySelectorAll(
  '#about .reviews-heading, #about .testimonials-sub, #about .testimonials-rating'
).forEach(el => el.classList.add('reveal-up', 'reveal-up-early'));

document.querySelectorAll('#about .reviews-viewall').forEach(el =>
  el.classList.add('reveal-up', 'reveal-up-delay', 'reveal-up-early')
);

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

/* =====================================================
   HERO — pinned scroll image sequence
   Layer 1 stays put while the page scrolls through it,
   fading/zooming out as layer 2 rises in behind it.
===================================================== */
(function heroPin() {
  const wrapper = document.getElementById('heroPinWrapper');
  const layer1 = document.getElementById('heroLayer1');
  const layer2 = document.getElementById('heroLayer2');
  const cue = document.querySelector('#home .scroll-cue');
  const video = document.getElementById('heroVideo');
  if (!wrapper || !layer1 || !layer2) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (video) {
    video.addEventListener('error', () => { video.style.display = 'none'; });
    if (reduceMotion) {
      video.pause();
    }
  }

  function update() {
    const rect = wrapper.getBoundingClientRect();
    const total = Math.max(wrapper.offsetHeight - window.innerHeight, 1);
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const progress = scrolled / total;

    if (reduceMotion) return;

    if (cue) cue.style.opacity = String(1 - Math.min(progress / 0.12, 1));

    const l1p = Math.min(progress / 0.65, 1);
    layer1.style.opacity = String(1 - l1p);
    layer1.style.transform = `scale(${(1.08 + l1p * 0.16).toFixed(3)})`;

    if (video && !reduceMotion) {
      if (progress > 0.02) {
        if (!video.paused) video.pause();
      } else if (video.paused) {
        video.play().catch(() => {});
      }
    }

    const l2p = Math.min(Math.max((progress - 0.2) / 0.7, 0), 1);
    layer2.style.opacity = String(l2p);
    layer2.style.transform = `scale(${(1.12 - l2p * 0.12).toFixed(3)})`;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
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

  if (hoverCapable) {
    panels.forEach((panel) => {
      panel.addEventListener('pointerenter', () => setActive(panel));
    });
    container.addEventListener('pointerleave', reset);
  } else {
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
