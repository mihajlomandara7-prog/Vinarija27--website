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
  '#about, #offerings .offer-card, #location, #contact, .stat-card'
).forEach(el => el.classList.add('reveal'));
document.getElementById('estatesHeading')?.classList.add('reveal-drop');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .reveal-scale, .reveal-drop').forEach(el => revealObserver.observe(el));

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
  const text = document.getElementById('heroText');
  const cue = document.querySelector('#home .scroll-cue');
  if (!wrapper || !layer1 || !layer2) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function update() {
    const rect = wrapper.getBoundingClientRect();
    const total = Math.max(wrapper.offsetHeight - window.innerHeight, 1);
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const progress = scrolled / total;

    if (reduceMotion) return;

    const textP = Math.min(progress / 0.28, 1);
    text.style.opacity = String(1 - textP);
    text.style.transform = `translateY(${(-textP * 50).toFixed(1)}px) scale(${(1 - textP * 0.04).toFixed(3)})`;
    if (cue) cue.style.opacity = String(1 - Math.min(progress / 0.12, 1));

    const l1p = Math.min(progress / 0.65, 1);
    layer1.style.opacity = String(1 - l1p);
    layer1.style.transform = `scale(${(1 + l1p * 0.16).toFixed(3)})`;

    const l2p = Math.min(Math.max((progress - 0.2) / 0.7, 0), 1);
    layer2.style.opacity = String(l2p);
    layer2.style.transform = `scale(${(1.12 - l2p * 0.12).toFixed(3)})`;
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* =====================================================
   STATEMENT — the hero's photo keeps scrolling straight
   into this pinned section. As soon as the user has scrolled
   about a third of the way into the green "DISCOVER STAR BENE"
   band above it (well before reaching its ABOUT US button), a
   CSS transition eases the photo into a half-width panel
   docked against the left edge as the dark green panel and
   the heading/button take over the right half — a slow,
   soft ease-in-out glide, not a value scrubbed 1:1 with scroll.
===================================================== */
(function statementPin() {
  const band = document.getElementById('discover-band');
  const box = document.getElementById('statementBox');
  const text = document.getElementById('statementText');
  if (!band || !box || !text) return;

  function update() {
    const rect = band.getBoundingClientRect();
    const enteredPastTop = Math.max(-rect.top, 0);
    const bandProgress = enteredPastTop / band.offsetHeight;
    const shouldSplit = bandProgress >= 0.35;
    box.classList.toggle('is-split', shouldSplit);
    text.classList.toggle('is-split', shouldSplit);
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

/* =====================================================
   Small bottle canvas next to the About section
===================================================== */
(function aboutBottle() {
  const canvas = document.getElementById('bottle-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
  camera.position.set(0, 0.2, 7.2);

  const frame = canvas.parentElement;
  function resize() {
    const size = frame.clientWidth;
    const h = frame.clientHeight;
    renderer.setSize(size, h);
    camera.aspect = size / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  scene.add(new THREE.AmbientLight(0x8a5a3a, 0.6));
  const l1 = new THREE.PointLight(0xd9b26a, 2.2, 20);
  l1.position.set(2, 3, 3);
  scene.add(l1);
  const l2 = new THREE.PointLight(0xb32a45, 1.4, 20);
  l2.position.set(-3, -1, 2);
  scene.add(l2);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1c3d1f, roughness: 0.15, transmission: 0.55, transparent: true,
    opacity: 0.92, thickness: 0.6, clearcoat: 0.6,
  });
  const group = new THREE.Group();

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.0, 32), glassMat);
  group.add(body);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.62, 0.55, 32), glassMat);
  shoulder.position.y = 1.27;
  group.add(shoulder);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.1, 32), glassMat);
  neck.position.y = 2.1;
  group.add(neck);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.18, 32),
    new THREE.MeshStandardMaterial({ color: 0xd9b26a, roughness: 0.35, metalness: 0.6 })
  );
  cap.position.y = 2.74;
  group.add(cap);

  group.position.y = -0.55;
  scene.add(group);

  let hover = false;
  frame.addEventListener('mouseenter', () => hover = true);
  frame.addEventListener('mouseleave', () => hover = false);

  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.35 + (hover ? Math.sin(t * 2) * 0.05 : 0);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (!e.isIntersecting) return; });
  });
  io.observe(canvas);
})();
