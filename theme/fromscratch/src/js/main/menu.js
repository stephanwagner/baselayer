// Menu toggler
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-toggle-menu]').forEach((el) => {
    el.addEventListener('click', toggleMenu);
  });
});

// Toggle menu
export function toggleMenu() {
  if (menuIsOpen()) {
    closeMenu();
  } else {
    openMenu();
  }

  const overlay = document.querySelector('.header__menu-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeMenu, { once: true });
  }
}

// Open menu
export function openMenu() {
  document.body.classList.add('-menu-open', '-menu-block-scroll');
}

// Close menu
export function closeMenu() {
  document.body.classList.remove('-menu-open', '-menu-block-scroll');
}

// Check if menu is open
export function menuIsOpen() {
  return document.body.classList.contains('-menu-open');
}

// Submenu togglers
function initSubmenuTogglers() {
  var toggles = document.querySelectorAll('.sub-menu-toggle[aria-controls]');

  if (!toggles.length) {
    return;
  }

  function setExpanded(btn, expanded) {
    var submenuId = btn.getAttribute('aria-controls');
    if (!submenuId) {
      return;
    }

    var submenu = document.getElementById(submenuId);
    if (!submenu) {
      return;
    }

    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');

    var li = btn.closest('li');
    if (li) {
      li.classList.toggle('is-submenu-open', !!expanded);
    }
  }

  toggles.forEach(function (btn) {
    setExpanded(btn, false);
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      setExpanded(btn, !expanded);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    toggles.forEach(function (btn) {
      if (btn.getAttribute('aria-expanded') === 'true') {
        setExpanded(btn, false);
      }
    });
  });
}

initSubmenuTogglers();
