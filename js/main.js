(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const sideNav = document.querySelector('.side-nav');
  const overlay = document.querySelector('.nav-overlay');
  const navLinks = document.querySelectorAll('.nav-links .tab');
  const focusableSelector = 'a[href], button:not([disabled])';
  let trapFocus = false;

  const getFocusable = () => sideNav ? sideNav.querySelectorAll(focusableSelector) : [];

  const openNav = () => {
    if (!sideNav) return;
    sideNav.classList.add('open');
    overlay?.classList.add('visible');
    navToggle?.setAttribute('aria-expanded', 'true');
    const focusable = getFocusable();
    focusable.length && focusable[0].focus();
    trapFocus = true;
  };

  const closeNav = () => {
    if (!sideNav) return;
    sideNav.classList.remove('open');
    overlay?.classList.remove('visible');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.focus();
    trapFocus = false;
  };

  navToggle?.addEventListener('click', () => {
    sideNav?.classList.contains('open') ? closeNav() : openNav();
  });

  navToggle?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      sideNav?.classList.contains('open') ? closeNav() : openNav();
    }
  });

  overlay?.addEventListener('click', closeNav);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sideNav?.classList.contains('open')) {
      closeNav();
    }
    if (trapFocus && event.key === 'Tab') {
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (sideNav?.classList.contains('open')) {
        closeNav();
      }
    });
  });

  const slides = Array.from(document.querySelectorAll('.hero-carousel .hero-slide'));
  if (slides.length) {
    const dotsContainer = document.querySelector('.hero-dots');
    const prevBtn = document.querySelector('.hero-btn.prev');
    const nextBtn = document.querySelector('.hero-btn.next');
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    let timer;

    const update = () => {
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === current);
      });
      dotsContainer?.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === current);
      });
    };

    const goTo = (index) => {
      current = (index + slides.length) % slides.length;
      update();
      restart();
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    const restart = () => {
      clearInterval(timer);
      if (!prefersReduce) {
        timer = setInterval(next, 6000);
      }
    };

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `dot${index === 0 ? ' active' : ''}`;
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
      dot.addEventListener('click', () => goTo(index));
      dotsContainer?.appendChild(dot);
    });

    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);
    update();
    restart();
  }

  const newsletter = document.querySelector('[data-newsletter]');
  if (newsletter) {
    const status = newsletter.querySelector('[data-newsletter-status]');
    newsletter.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = newsletter.email.value.trim();
      if (!email) {
        status.textContent = 'Ingresa un correo válido.';
        return;
      }
      status.textContent = '¡Gracias! Te enviaremos noticias muy pronto.';
      newsletter.reset();
      setTimeout(() => {
        status.textContent = '';
      }, 4000);
    });
  }
})();
