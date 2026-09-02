(function () {
  const links = window.U9_LINKS || {};

  // Asigna los enlaces definidos en config.js a cualquier elemento data-link.
  // Si el destino es válido, se abre en una pestaña nueva.

  document.querySelectorAll('[data-link]').forEach((el) => {
    const key = el.getAttribute('data-link');
    const url = typeof links[key] === 'string' ? links[key].trim() : '';
    if (!url || url === '#') return;

    // El href queda escrito directamente desde config.js.
    el.setAttribute('href', url);

    // Los enlaces externos se abren en una pestaña nueva.
    if (/^https?:\/\//i.test(url)) {
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
      el.addEventListener('click', (event) => {
        event.preventDefault();
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    }
  });

  document.querySelectorAll('.accordion-item').forEach((button) => {
    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.accordion-item').forEach((b) => b.setAttribute('aria-expanded', 'false'));
      document.querySelectorAll('.accordion-panel').forEach((p) => p.style.maxHeight = null);
      if (!isOpen) {
        button.setAttribute('aria-expanded', 'true');
        const panel = button.nextElementSibling;
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  const toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', () => {
      toTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


// Acordeones de beneficios (la información completa se muestra al tocar "VER DETALLES").
document.querySelectorAll('.benefit-more').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.benefit-card');
    card.classList.toggle('expanded');
    btn.querySelector('span').textContent = card.classList.contains('expanded') ? '−' : '+';
  });
});
