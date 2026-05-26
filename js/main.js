(function () {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const keepAnchored = new Set(['#contacto', '#newsletter', '#beneficios', '#experiencias', '#facial', '#corporal']);
  const scrollPageTop = () => {
    if (!location.hash || location.hash === '#inicio' || location.hash === '#contenido' || !keepAnchored.has(location.hash)) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  };

  window.addEventListener('pageshow', scrollPageTop);

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

  const cartKey = 'rosares-cart';
  const cartParam = 'rr_cart';
  const money = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });
  const readCart = () => {
    try {
      return JSON.parse(localStorage.getItem(cartKey)) || [];
    } catch (error) {
      return [];
    }
  };

  const readSessionCart = () => {
    try {
      return JSON.parse(sessionStorage.getItem(cartKey)) || [];
    } catch (error) {
      return [];
    }
  };

  const readUrlCart = () => {
    try {
      const value = new URLSearchParams(location.search).get(cartParam);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      return [];
    }
  };

  const cleanUrlCart = () => {
    if (!location.search.includes(cartParam)) return;
    try {
      const url = new URL(location.href);
      url.searchParams.delete(cartParam);
      history.replaceState(null, '', `${url.pathname.split('/').pop()}${url.search}${url.hash}`);
    } catch (error) {
      return;
    }
  };

  const readWindowCart = () => {
    try {
      const state = JSON.parse(window.name || '{}');
      return Array.isArray(state.rosaResCart) ? state.rosaResCart : [];
    } catch (error) {
      return [];
    }
  };

  const saveWindowCart = (items) => {
    let state = {};
    try {
      state = JSON.parse(window.name || '{}') || {};
    } catch (error) {
      state = {};
    }
    state.rosaResCart = items;
    window.name = JSON.stringify(state);
  };

  const normalizeCart = (items) => items
    .filter((item) => item && item.id && item.name && Number(item.price) > 0 && Number(item.quantity) > 0)
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

  const mergeCarts = (...sources) => {
    const merged = new Map();
    sources.flat().forEach((item) => {
      if (!item?.id) return;
      const current = merged.get(item.id);
      if (!current || item.quantity > current.quantity) {
        merged.set(item.id, item);
      }
    });
    return Array.from(merged.values());
  };

  const saveCart = (items) => {
    const normalized = normalizeCart(items);
    try {
      localStorage.setItem(cartKey, JSON.stringify(normalized));
    } catch (error) {
    }
    try {
      sessionStorage.setItem(cartKey, JSON.stringify(normalized));
    } catch (error) {
    }
    saveWindowCart(normalized);
  };

  const loadCart = () => mergeCarts(
    normalizeCart(readCart()),
    normalizeCart(readSessionCart()),
    normalizeCart(readWindowCart()),
    normalizeCart(readUrlCart())
  );
  let cart = loadCart();
  cleanUrlCart();

  const cartModal = document.createElement('div');
  cartModal.className = 'cart-modal';
  cartModal.setAttribute('aria-hidden', 'true');
  cartModal.innerHTML = `
    <div class="cart-backdrop" data-cart-close></div>
    <aside class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div class="cart-head">
        <div>
          <p class="eyebrow">Carrito simulado</p>
          <h2 id="cart-title">Tu pedido Rosa Res</h2>
        </div>
        <button class="cart-close" type="button" data-cart-close aria-label="Cerrar carrito">&times;</button>
      </div>
      <div class="cart-items" data-cart-items></div>
      <div class="cart-summary">
        <div><span>Subtotal</span><strong data-cart-total>$0</strong></div>
        <p>Pago real no activo. Este carrito prepara el pedido para validarlo por WhatsApp.</p>
        <a class="pill-btn cart-checkout" href="#" target="_blank" rel="noopener">Enviar pedido</a>
        <button class="ghost-btn cart-clear" type="button">Vaciar carrito</button>
      </div>
    </aside>
  `;
  document.body.appendChild(cartModal);

  const cartItems = cartModal.querySelector('[data-cart-items]');
  const cartTotal = cartModal.querySelector('[data-cart-total]');
  const checkout = cartModal.querySelector('.cart-checkout');
  const clearCart = cartModal.querySelector('.cart-clear');

  document.querySelectorAll('.cart-btn').forEach((button) => {
    const count = document.createElement('span');
    count.className = 'cart-count';
    count.textContent = '0';
    button.appendChild(count);
  });

  const cartQuantity = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkoutHref = () => {
    const lines = cart.map((item) => `${item.quantity} x ${item.name} - ${money.format(item.price * item.quantity)}`);
    const message = [
      'Hola, quiero validar este pedido Rosa Res:',
      ...lines,
      `Total estimado: ${money.format(cartSubtotal())}`
    ].join('\n');
    return `https://wa.me/573209051329?text=${encodeURIComponent(message)}`;
  };

  const isInternalPage = (url) => {
    const page = url.pathname.split('/').pop();
    return ['index.html', 'presentaciones.html', 'ofertas.html', 'club.html'].includes(page);
  };

  const updateInternalCartLinks = () => {
    const normalized = normalizeCart(cart);
    document.querySelectorAll('a[href]').forEach((link) => {
      try {
        const url = new URL(link.getAttribute('href'), location.href);
        if (!isInternalPage(url)) return;
        if (normalized.length) {
          url.searchParams.set(cartParam, JSON.stringify(normalized));
        } else {
          url.searchParams.delete(cartParam);
        }
        link.setAttribute('href', `${url.pathname.split('/').pop()}${url.search}${url.hash}`);
      } catch (error) {
        return;
      }
    });
  };

  const getCartUrl = (href) => {
    const url = new URL(href, location.href);
    if (!isInternalPage(url)) return null;
    const normalized = normalizeCart(cart);
    if (normalized.length) {
      url.searchParams.set(cartParam, JSON.stringify(normalized));
    } else {
      url.searchParams.delete(cartParam);
    }
    return `${url.pathname.split('/').pop()}${url.search}${url.hash}`;
  };

  const renderCart = () => {
    document.querySelectorAll('.cart-count').forEach((count) => {
      count.textContent = cartQuantity();
      count.hidden = cartQuantity() === 0;
    });
    updateInternalCartLinks();

    if (!cart.length) {
      cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
      cartTotal.textContent = money.format(0);
      checkout.href = '#';
      checkout.setAttribute('aria-disabled', 'true');
      return;
    }

    cartItems.innerHTML = cart.map((item) => `
      <article class="cart-line">
        <div>
          <h3>${item.name}</h3>
          <p>${money.format(item.price)} c/u</p>
        </div>
        <div class="cart-line-actions">
          <button type="button" data-cart-dec="${item.id}" aria-label="Restar ${item.name}">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-cart-inc="${item.id}" aria-label="Sumar ${item.name}">+</button>
          <button type="button" data-cart-remove="${item.id}" aria-label="Eliminar ${item.name}">&times;</button>
        </div>
      </article>
    `).join('');
    cartTotal.textContent = money.format(cartSubtotal());
    checkout.href = checkoutHref();
    checkout.removeAttribute('aria-disabled');
  };

  const openCart = () => {
    renderCart();
    cartModal.classList.add('open');
    cartModal.setAttribute('aria-hidden', 'false');
    cartModal.querySelector('.cart-close')?.focus();
  };

  const closeCart = () => {
    cartModal.classList.remove('open');
    cartModal.setAttribute('aria-hidden', 'true');
  };

  const refreshCartState = () => {
    cart = loadCart();
    saveCart(cart);
    renderCart();
    closeCart();
  };

  window.addEventListener('pageshow', refreshCartState);
  window.addEventListener('focus', refreshCartState);

  const syncCart = () => {
    saveCart(cart);
    renderCart();
  };

  document.addEventListener('click', (event) => {
    const internalLink = event.target.closest('a[href]');
    if (internalLink && !internalLink.hasAttribute('target')) {
      const nextHref = getCartUrl(internalLink.getAttribute('href'));
      if (nextHref) {
        event.preventDefault();
        saveCart(cart);
        location.href = nextHref;
        return;
      }
    }

    const addButton = event.target.closest('.add-to-cart');
    if (addButton) {
      const name = addButton.dataset.cartName;
      const price = Number(addButton.dataset.cartPrice || 0);
      if (!name || !price) return;
      const id = name.toLowerCase().replace(/\s+/g, '-');
      const existing = cart.find((item) => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id, name, price, quantity: 1 });
      }
      syncCart();
      openCart();
    }

    if (event.target.closest('.cart-btn')) {
      openCart();
    }

    if (event.target.closest('[data-cart-close]')) {
      closeCart();
    }

    const inc = event.target.closest('[data-cart-inc]');
    const dec = event.target.closest('[data-cart-dec]');
    const remove = event.target.closest('[data-cart-remove]');

    if (inc) {
      const item = cart.find((entry) => entry.id === inc.dataset.cartInc);
      if (item) item.quantity += 1;
      syncCart();
    }

    if (dec) {
      const item = cart.find((entry) => entry.id === dec.dataset.cartDec);
      if (item) item.quantity -= 1;
      cart = cart.filter((entry) => entry.quantity > 0);
      syncCart();
    }

    if (remove) {
      cart = cart.filter((entry) => entry.id !== remove.dataset.cartRemove);
      syncCart();
    }
  });

  document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach((link) => {
    link.addEventListener('click', () => {
      updateInternalCartLinks();
      saveCart(cart);
    });
  });

  clearCart?.addEventListener('click', () => {
    cart = [];
    syncCart();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && cartModal.classList.contains('open')) {
      closeCart();
    }
  });

  renderCart();

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
