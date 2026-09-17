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
    const m = /^(\d{2}):(\d{2})$/.exec(String(value || '').trim());
    if (!m) return null;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h > 23 || min > 59) return null;
    return h * 60 + min;
  }

  function argentinaNowParts(date) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const parts = formatter.formatToParts(date);
    const get = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
    return {
      year: get('year'), month: get('month'), day: get('day'),
      hour: get('hour') === 24 ? 0 : get('hour'), minute: get('minute'), second: get('second')
    };
  }

  // Argentina uses UTC-3 year-round. This converts a calendar time in Argentina
  // into the corresponding UTC timestamp without depending on the visitor's timezone.
  function argentinaTimestamp(year, month, day, minutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return Date.UTC(year, month - 1, day, hour + 3, minute, 0, 0);
  }

  function updateDamageTimer() {
    if (!damageCountdown) return;

    const start = parseMinutes(damageConfig.disabledStart);
    const end = parseMinutes(damageConfig.disabledEnd);
    if (start === null || end === null || start === end) {
      damageCountdown.textContent = '--:--:--';
      if (damageDescription) damageDescription.textContent = 'Configura disabledStart y disabledEnd en assets/config.js.';
      return;
    }

    const now = new Date();
    const p = argentinaNowParts(now);
    const nowSeconds = (p.hour * 60 + p.minute) * 60 + p.second;
    const startSeconds = start * 60;
    const endSeconds = end * 60;
    const overnight = start > end;

    let disabledNow;
    let target;

    if (!overnight) {
      disabledNow = nowSeconds >= startSeconds && nowSeconds < endSeconds;
      if (disabledNow) {
        target = argentinaTimestamp(p.year, p.month, p.day, end);
      } else if (nowSeconds < startSeconds) {
        target = argentinaTimestamp(p.year, p.month, p.day, start);
      } else {
        target = argentinaTimestamp(p.year, p.month, p.day + 1, start);
      }
    } else {
      disabledNow = nowSeconds >= startSeconds || nowSeconds < endSeconds;
      if (disabledNow) {
        if (nowSeconds >= startSeconds) {
          target = argentinaTimestamp(p.year, p.month, p.day + 1, end);
        } else {
          target = argentinaTimestamp(p.year, p.month, p.day, end);
        }
      } else {
        target = argentinaTimestamp(p.year, p.month, p.day, start);
      }
    }

    if (damageIndicator && damageStatusText && damageCountdownLabel && damageDescription) {
      if (disabledNow) {
        damageIndicator.classList.add('is-disabled');
        damageIndicator.classList.remove('is-active');
        damageStatusText.textContent = 'DAÑO DESACTIVADO';
        damageCountdownLabel.textContent = 'SE ACTIVA EN';
        damageDescription.textContent = 'El daño a estructuras está desactivado durante este periodo. El raideo sigue permitido según las reglas del servidor.';
      } else {
        damageIndicator.classList.add('is-active');
        damageIndicator.classList.remove('is-disabled');
        damageStatusText.textContent = 'DAÑO ACTIVADO';
        damageCountdownLabel.textContent = 'SE DESACTIVA EN';
        damageDescription.textContent = 'El daño a estructuras está activo. El raideo sigue permitido 24/7.';
      }
    }

    if (damageDisabledStart) damageDisabledStart.textContent = damageConfig.disabledStart;
    if (damageDisabledEnd) damageDisabledEnd.textContent = damageConfig.disabledEnd;

    let diff = Math.max(0, target - now.getTime());
    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;
    const minutes = Math.floor(diff / 60000);
    diff %= 60000;
    const seconds = Math.floor(diff / 1000);
    damageCountdown.textContent = [hours, minutes, seconds]
      .map((v) => String(v).padStart(2, '0'))
      .join(':');
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
