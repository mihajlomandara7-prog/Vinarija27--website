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
   HERO 3D SCENE — vineyard-at-dusk with a rotating
   wine bottle, glass, and drifting grape clusters
===================================================== */
(function heroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const header = document.getElementById('home');

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1a0509, 0.05);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 1.1, 9.8);

  function resize() {
    const w = header.clientWidth, h = header.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Lights
  scene.add(new THREE.AmbientLight(0x8a5a3a, 0.55));
  const key = new THREE.PointLight(0xd9b26a, 2.4, 30, 2);
  key.position.set(3, 4, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0xb32a45, 1.8, 30, 2);
  rim.position.set(-4, 1, -3);
  scene.add(rim);
  const fill = new THREE.PointLight(0xf3e2c2, 0.6, 20, 2);
  fill.position.set(0, -2, 4);
  scene.add(fill);

  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  // ---- Wine bottle ----
  const bottleGroup = new THREE.Group();
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1c3d1f,
    roughness: 0.15,
    metalness: 0,
    transmission: 0.55,
    transparent: true,
    opacity: 0.92,
    thickness: 0.6,
    clearcoat: 0.6,
  });

  const bodyGeo = new THREE.CylinderGeometry(0.62, 0.62, 2.0, 32);
  const body = new THREE.Mesh(bodyGeo, glassMat);
  body.position.y = 0;
  bottleGroup.add(body);

  const shoulderGeo = new THREE.CylinderGeometry(0.24, 0.62, 0.55, 32);
  const shoulder = new THREE.Mesh(shoulderGeo, glassMat);
  shoulder.position.y = 1.27;
  bottleGroup.add(shoulder);

  const neckGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.1, 32);
  const neck = new THREE.Mesh(neckGeo, glassMat);
  neck.position.y = 2.1;
  bottleGroup.add(neck);

  const capGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.18, 32);
  const capMat = new THREE.MeshStandardMaterial({ color: 0xd9b26a, roughness: 0.35, metalness: 0.6 });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 2.74;
  bottleGroup.add(cap);

  bottleGroup.scale.setScalar(0.82);
  bottleGroup.position.set(-3.05, -1.55, -1.4);
  bottleGroup.rotation.y = 0.4;
  rootGroup.add(bottleGroup);

  // ---- Wine glass ----
  const glassGroup = new THREE.Group();
  const bowlPoints = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const r = Math.sin(t * Math.PI * 0.5) * 0.55 + 0.03;
    bowlPoints.push(new THREE.Vector2(r, t * 1.1));
  }
  const bowlGeo = new THREE.LatheGeometry(bowlPoints, 32);
  const bowl = new THREE.Mesh(bowlGeo, glassMat);
  bowl.position.y = 0.9;
  glassGroup.add(bowl);

  const wineGeo = new THREE.CylinderGeometry(0.4, 0.05, 0.5, 32);
  const wineMat = new THREE.MeshPhysicalMaterial({ color: 0x6b1626, roughness: 0.2, transmission: 0.3, transparent: true, opacity: 0.95 });
  const wine = new THREE.Mesh(wineGeo, wineMat);
  wine.position.y = 1.05;
  glassGroup.add(wine);

  const stemGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.9, 16);
  const stem = new THREE.Mesh(stemGeo, glassMat);
  stem.position.y = 0.45;
  glassGroup.add(stem);

  const baseGeo = new THREE.CylinderGeometry(0.34, 0.4, 0.06, 32);
  const base = new THREE.Mesh(baseGeo, glassMat);
  base.position.y = 0.03;
  glassGroup.add(base);

  glassGroup.scale.setScalar(0.82);
  glassGroup.position.set(3.1, -2.15, -1.1);
  rootGroup.add(glassGroup);

  // ---- Grape clusters (instanced) ----
  const grapeGeo = new THREE.IcosahedronGeometry(0.11, 1);
  const grapeMat = new THREE.MeshStandardMaterial({ color: 0x4a0f1c, roughness: 0.35, metalness: 0.1 });
  const grapeCount = 60;
  const grapes = new THREE.InstancedMesh(grapeGeo, grapeMat, grapeCount);
  const dummy = new THREE.Object3D();
  const grapeData = [];
  for (let i = 0; i < grapeCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3.4 + Math.random() * 2.6;
    const height = (Math.random() - 0.5) * 3.2;
    const speed = 0.15 + Math.random() * 0.25;
    grapeData.push({ angle, radius, height, speed, phase: Math.random() * Math.PI * 2 });
    dummy.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius - 2);
    dummy.scale.setScalar(0.6 + Math.random() * 0.8);
    dummy.updateMatrix();
    grapes.setMatrixAt(i, dummy.matrix);
  }
  scene.add(grapes);

  // ---- Ground disc (subtle reflection) ----
  const groundGeo = new THREE.CircleGeometry(9, 64);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x120306, roughness: 0.85, metalness: 0.1 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.9;
  scene.add(ground);

  // ---- Mouse parallax ----
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  let scrollFactor = 0;
  window.addEventListener('scroll', () => {
    scrollFactor = Math.min(window.scrollY / window.innerHeight, 1);
  });

  function animate() {
    const t = clock.getElapsedTime();

    bottleGroup.rotation.y += 0.0032;
    glassGroup.rotation.y -= 0.0026;
    bottleGroup.position.y = -1.55 + Math.sin(t * 0.6) * 0.06;
    glassGroup.position.y = -2.15 + Math.sin(t * 0.7 + 1.2) * 0.05;

    for (let i = 0; i < grapeCount; i++) {
      const d = grapeData[i];
      const a = d.angle + t * d.speed * 0.1;
      dummy.position.set(
        Math.cos(a) * d.radius,
        d.height + Math.sin(t * 0.5 + d.phase) * 0.15,
        Math.sin(a) * d.radius - 2
      );
      dummy.rotation.set(t * 0.2 + i, t * 0.15, 0);
      dummy.scale.setScalar(0.6 + (i % 5) * 0.16);
      dummy.updateMatrix();
      grapes.setMatrixAt(i, dummy.matrix);
    }
    grapes.instanceMatrix.needsUpdate = true;

    rootGroup.rotation.y += (mouseX * 0.15 - rootGroup.rotation.y) * 0.03;
    camera.position.y = 1.1 + mouseY * -0.15 - scrollFactor * 0.6;
    camera.position.z = 8.5 + scrollFactor * 2.2;
    camera.lookAt(0, 0.3, 0);

    key.position.x = 3 + Math.sin(t * 0.3) * 1.2;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
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
