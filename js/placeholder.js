(function () {
  const el = document.getElementById('pageTransition');
  if (!el) return;

  /* Page loads already fully covered (class="pt-cover" in the HTML);
     slide the panel off to the right to reveal the (empty) content. */
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      el.classList.add('pt-animate');
      requestAnimationFrame(() => {
        el.classList.remove('pt-cover');
        el.classList.add('pt-reveal');
      });
      el.addEventListener('transitionend', function revealDone(e) {
        if (e.propertyName !== 'transform') return;
        el.removeEventListener('transitionend', revealDone);
        el.classList.remove('pt-animate', 'pt-reveal');
      }, { once: true });
    });
  });

  /* Back arrow: cover from the opposite side (right), then navigate home. */
  const backArrow = document.querySelector('.back-arrow');
  if (!backArrow) return;
  let running = false;

  backArrow.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (running) return;
    running = true;
    e.preventDefault();
    const url = backArrow.getAttribute('href');

    el.style.transform = 'translateX(100%)';
    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.classList.add('pt-animate');
      requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; });
      el.addEventListener('transitionend', function coverDone(ev) {
        if (ev.propertyName !== 'transform') return;
        el.removeEventListener('transitionend', coverDone);
        window.location.href = url;
      }, { once: true });
    });
  });
})();
