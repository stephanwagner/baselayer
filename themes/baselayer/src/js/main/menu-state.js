/**
 * Menu open/close state without DOM listener side effects.
 * Safe to import from block bundles that must not re-bind menu toggles.
 */

export function syncMainMenuA11yState() {
  const expanded = menuIsOpen();
  document.querySelectorAll('[data-toggle-menu]').forEach((el) => {
    el.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });
}

export function openMenu() {
  document.body.classList.add('-menu-open', '-menu-block-scroll');
  syncMainMenuA11yState();
}

export function closeMenu() {
  document.body.classList.remove('-menu-open', '-menu-block-scroll');
  syncMainMenuA11yState();
}

export function menuIsOpen() {
  return document.body.classList.contains('-menu-open');
}
