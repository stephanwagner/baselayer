/**
 * Menu icon field: theme catalog picker + SVG, or SVG-only (standalone plugin).
 */

function isSvgValue(value) {
  return typeof value === 'string' && value.trim().toLowerCase().includes('<svg');
}

function syncPreview(root, value) {
  const preview = root.querySelector('[data-bl-events-menu-icon-preview]');
  const empty = root.querySelector('[data-bl-events-menu-icon-empty]');
  if (!preview) {
    return;
  }

  const trimmed = (value || '').trim();
  preview.replaceChildren();
  preview.hidden = trimmed === '';
  if (empty) {
    empty.hidden = trimmed !== '';
  }

  if (trimmed === '') {
    return;
  }

  if (isSvgValue(trimmed)) {
    const wrap = document.createElement('span');
    wrap.className = 'bl-events-menu-icon-field__svg';
    wrap.innerHTML = trimmed;
    preview.appendChild(wrap);
    return;
  }

  const icon = document.createElement('span');
  icon.className = 'bl-icon -icon-' + trimmed.replace(/[^a-z0-9_-]/gi, '');
  icon.setAttribute('aria-hidden', 'true');
  preview.appendChild(icon);
}

function setSvgOpen(root, open) {
  const panel = root.querySelector('[data-bl-events-menu-icon-svg-panel]');
  const toggle = root.querySelector('[data-bl-events-menu-icon-svg-toggle]');
  if (panel) {
    panel.hidden = !open;
  }
  if (toggle) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.classList.toggle('is-active', open);
  }
}

export function bootMenuIconField() {
  const root = document.querySelector('[data-bl-events-menu-icon-field]');
  if (!root) {
    return;
  }

  const mode = root.getAttribute('data-bl-events-menu-icon-mode') || 'picker';
  const svgOnly = mode === 'svg';
  const input = root.querySelector('[data-bl-events-menu-icon-value]');
  const textarea = root.querySelector('[data-bl-events-menu-icon-svg]');
  const chooseBtn = root.querySelector('[data-bl-events-menu-icon-choose]');
  const svgToggle = root.querySelector('[data-bl-events-menu-icon-svg-toggle]');
  const clearBtn = root.querySelector('[data-bl-events-menu-icon-clear]');

  if (!input && !textarea) {
    return;
  }

  let value = (input && input.value) || (textarea && textarea.value) || '';
  // Always start with the SVG panel closed; open only via the button.
  setSvgOpen(root, false);
  if (textarea && isSvgValue(value)) {
    textarea.value = value;
  }
  // Don't wipe a PHP-rendered default preview when the saved value is empty (svg-only).
  if (value !== '' || !svgOnly) {
    syncPreview(root, value);
  }

  const commit = (next, { openSvg = false } = {}) => {
    value = next == null ? '' : String(next);
    if (input) {
      input.value = value;
    }
    if (textarea && (isSvgValue(value) || (svgOnly && openSvg))) {
      textarea.value = value;
    } else if (textarea && !openSvg && !isSvgValue(value)) {
      textarea.value = '';
    }
    syncPreview(root, value);
    if (openSvg) {
      setSvgOpen(root, true);
    }
  };

  if (chooseBtn && !svgOnly) {
    chooseBtn.addEventListener('click', async () => {
      try {
        const { openIconPicker } = await import(
          '../../../../src/js/editor/icons/icon-picker-service.js'
        );
        openIconPicker({
          currentValue: isSvgValue(value) ? '' : value,
          returnFocus: chooseBtn,
          onSelect: (iconName) => {
            commit(iconName);
            setSvgOpen(root, false);
          },
        });
      } catch (err) {
        // Theme picker unavailable (e.g. incomplete admin assets).
        setSvgOpen(root, true);
        if (textarea) {
          textarea.focus();
        }
      }
    });
  }

  if (svgToggle) {
    svgToggle.addEventListener('click', () => {
      const panel = root.querySelector('[data-bl-events-menu-icon-svg-panel]');
      const willOpen = panel ? panel.hidden : true;
      setSvgOpen(root, willOpen);
      if (willOpen && textarea) {
        textarea.focus();
      }
    });
  }

  if (textarea) {
    textarea.addEventListener('input', () => {
      commit(textarea.value, { openSvg: true });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      commit('');
      setSvgOpen(root, false);
      if (textarea) {
        textarea.value = '';
      }
    });
  }
}
