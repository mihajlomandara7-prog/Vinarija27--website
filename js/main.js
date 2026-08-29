document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- Loader ---------------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 500);
});

/* ---------------- Navbar ---------------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mobileMenu.classList.remove('open'))
);

/* ---------------- Scroll reveal ---------------- */
document.querySelectorAll(
  '#about, #offerings .offer-card, #reviews .review-card, #location, #contact, .stat-card'
).forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

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
