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


  // ===== CONTADOR DE DAÑO A ESTRUCTURAS =====
  const damageConfig = window.U9_DAMAGE_SCHEDULE || { disabledStart: '02:30', disabledEnd: '16:00' };
  const damageIndicator = document.getElementById('damageIndicator');
  const damageStatusText = document.getElementById('damageStatusText');
  const damageCountdownLabel = document.getElementById('damageCountdownLabel');
  const damageCountdown = document.getElementById('damageCountdown');
  const damageDescription = document.getElementById('damageDescription');
  const damageDisabledStart = document.getElementById('damageDisabledStart');
  const damageDisabledEnd = document.getElementById('damageDisabledEnd');

  function parseMinutes(value) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(value || '').trim());
    if (!m) return null;
    const h = Number(m[1]), min = Number(m[2]);
    if (h > 23 || min > 59) return null;
    return h * 60 + min;
  }

  function argNowParts(date) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }).formatToParts(date);
    const get = (t) => Number(parts.find(p => p.type === t)?.value || 0);
    return { year:get('year'), month:get('month'), day:get('day'), hour:get('hour') === 24 ? 0 : get('hour'), minute:get('minute'), second:get('second') };
  }

  function argentinaTimestamp(p) {
    return Date.UTC(p.year, p.month - 1, p.day, p.hour + 3, p.minute, p.second);
  }

  function updateDamageTimer() {
    if (!damageCountdown) return;
    const start = parseMinutes(damageConfig.disabledStart);
    const end = parseMinutes(damageConfig.disabledEnd);
    if (start === null || end === null || start === end) {
      damageCountdown.textContent = '--:--:--';
      damageDescription.textContent = 'Configura disabledStart y disabledEnd en assets/config.js.';
      return;
    }
    const now = new Date();
    const p = argNowParts(now);
    const nowMin = p.hour * 60 + p.minute + p.second / 60;
    const overnight = start > end;
    const disabledNow = overnight ? (nowMin >= start || nowMin < end) : (nowMin >= start && nowMin < end);

    let target;
    if (disabledNow) {
      const targetDay = (!overnight && nowMin < start) ? p.day : p.day + 1;
      const tp = { ...p, day: targetDay, hour: Math.floor(end / 60), minute: end % 60, second: 0 };
      if (overnight && nowMin < end) tp.day = p.day;
      target = argentinaTimestamp(tp);
      damageIndicator.classList.add('is-disabled');
      damageIndicator.classList.remove('is-active');
      damageStatusText.textContent = 'DAÑO DESACTIVADO';
      damageCountdownLabel.textContent = 'SE ACTIVA EN';
      damageDescription.textContent = 'El daño a estructuras está desactivado durante este periodo. El raideo sigue permitido según las reglas del servidor.';
    } else {
      const targetDay = (!overnight && nowMin < start) ? p.day : p.day + 1;
      const tp = { ...p, day: targetDay, hour: Math.floor(start / 60), minute: start % 60, second: 0 };
      if (overnight && nowMin < start && nowMin >= end) tp.day = p.day;
      target = argentinaTimestamp(tp);
      damageIndicator.classList.add('is-active');
      damageIndicator.classList.remove('is-disabled');
      damageStatusText.textContent = 'DAÑO ACTIVADO';
      damageCountdownLabel.textContent = 'SE DESACTIVA EN';
      damageDescription.textContent = 'El daño a estructuras está activo. El raideo sigue permitido 24/7.';
    }

    let diff = Math.max(0, target - now.getTime());
    const h = Math.floor(diff / 3600000); diff %= 3600000;
    const m = Math.floor(diff / 60000); diff %= 60000;
    const sec = Math.floor(diff / 1000);
    damageCountdown.textContent = [h,m,sec].map(v => String(v).padStart(2,'0')).join(':');
    damageDisabledStart.textContent = damageConfig.disabledStart;
    damageDisabledEnd.textContent = damageConfig.disabledEnd;
  }

  updateDamageTimer();
  setInterval(updateDamageTimer, 1000);

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
