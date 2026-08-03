/**
 * jQuery-free height slide helpers (accordion content, etc.).
 * Interrupts in-flight animations on the same element.
 */

const active = new WeakMap();

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function cancelActive(el) {
  const prev = active.get(el);
  if (!prev) {
    return;
  }
  if (typeof prev.cancel === 'function') {
    prev.cancel();
  }
  active.delete(el);
}

function finishVisible(el) {
  el.style.height = '';
  el.style.overflow = '';
  el.style.display = '';
  if (getComputedStyle(el).display === 'none') {
    el.style.display = 'block';
  }
}

function finishHidden(el) {
  el.style.height = '';
  el.style.overflow = '';
  el.style.display = 'none';
}

/**
 * @param {HTMLElement|null|undefined} el
 * @param {{ duration?: number, complete?: () => void }} [options]
 */
export function slideDown(el, options = {}) {
  if (!el) {
    return;
  }

  const duration = typeof options.duration === 'number' ? options.duration : 240;
  const complete = typeof options.complete === 'function' ? options.complete : null;

  cancelActive(el);

  if (prefersReducedMotion() || duration <= 0) {
    finishVisible(el);
    if (complete) {
      complete();
    }
    return;
  }

  el.style.display = 'block';
  el.style.overflow = 'hidden';
  el.style.height = '0px';

  const targetHeight = el.scrollHeight;

  const animation = el.animate([{ height: '0px' }, { height: `${targetHeight}px` }], {
    duration,
    easing: 'ease',
    fill: 'forwards',
  });

  active.set(el, animation);

  animation.onfinish = () => {
    finishVisible(el);
    active.delete(el);
    if (complete) {
      complete();
    }
  };

  animation.oncancel = () => {
    active.delete(el);
  };
}

/**
 * @param {HTMLElement|null|undefined} el
 * @param {{ duration?: number, complete?: () => void }} [options]
 */
export function slideUp(el, options = {}) {
  if (!el) {
    return;
  }

  const duration = typeof options.duration === 'number' ? options.duration : 240;
  const complete = typeof options.complete === 'function' ? options.complete : null;

  cancelActive(el);

  if (prefersReducedMotion() || duration <= 0) {
    finishHidden(el);
    if (complete) {
      complete();
    }
    return;
  }

  const startHeight = el.getBoundingClientRect().height || el.scrollHeight;
  el.style.display = 'block';
  el.style.overflow = 'hidden';
  el.style.height = `${startHeight}px`;

  const animation = el.animate([{ height: `${startHeight}px` }, { height: '0px' }], {
    duration,
    easing: 'ease',
    fill: 'forwards',
  });

  active.set(el, animation);

  animation.onfinish = () => {
    finishHidden(el);
    active.delete(el);
    if (complete) {
      complete();
    }
  };

  animation.oncancel = () => {
    active.delete(el);
  };
}
