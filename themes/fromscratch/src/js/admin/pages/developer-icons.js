/**
 * Developer cheatsheet — icon demos (standalone + buttons) with shared modal picker.
 */
import {
  iconCategories,
  resolveIconName,
  iconMatchesQuery,
  findIconByValue,
} from '../../editor/icons/icon-catalog';

const iconL10n = () => (typeof window !== 'undefined' && window.fromscratchIcons) || {};

const iconLabels = () => iconL10n().labels || {};

const categoryLabels = () => iconL10n().categories || {};

const parseUiStrings = (root) => {
  let fromDom = {};

  try {
    fromDom = JSON.parse(root.getAttribute('data-fs-icons-ui') || '{}');
  } catch {
    fromDom = {};
  }

  return { ...(iconL10n().ui || {}), ...fromDom };
};

const humanize = (slug) => slug.replace(/-/g, ' ').replace(/^\w/, (char) => char.toUpperCase());

const iconName = (icon, labels) => icon.label || labels[icon.filename] || humanize(icon.filename);

const categoryName = (category, labels) => category.label || labels[category.slug] || humanize(category.slug);

const VARIANT_STORAGE_KEY = 'fromscratchIconVariant';

const readStoredVariant = () => {
  try {
    return window.localStorage.getItem(VARIANT_STORAGE_KEY) === 'fill' ? 'fill' : 'outline';
  } catch {
    return 'outline';
  }
};

const writeStoredVariant = (variant) => {
  try {
    window.localStorage.setItem(VARIANT_STORAGE_KEY, variant);
  } catch {
    // Storage may be unavailable — ignore.
  }
};

const buildIconCode = (value) => `<div class="fs-icon -icon-${value}" style="font-size: 64px;"></div>`;

const buildButtonCode = (value, position) => {
  const iconClass = `-icon-${value}`;
  const classes =
    position === 'right'
      ? `button -has-icon ${iconClass} -icon-right`
      : `button -has-icon ${iconClass}`;

  return `<a href="/" class="${classes}">Button</a>`;
};

const buttonPreviewClasses = (value, position) => {
  const iconClass = `-icon-${value}`;

  if (position === 'right') {
    return `button -has-icon ${iconClass} -icon-right`;
  }

  return `button -has-icon ${iconClass}`;
};

function createModal(uiStrings) {
  const t = (key, fallback) => uiStrings[key] || fallback;

  const modal = document.createElement('div');
  modal.className = 'fs-dev-icon-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'fs-dev-icon-modal-title');

  modal.innerHTML = `
    <div class="fs-dev-icon-modal__backdrop" data-fs-dev-icon-modal-close tabindex="-1"></div>
    <div class="fs-dev-icon-modal__panel">
      <header class="fs-dev-icon-modal__header">
        <h2 id="fs-dev-icon-modal-title" class="fs-dev-icon-modal__title">${t('choose', 'Choose icon')}</h2>
        <button type="button" class="fs-dev-icon-modal__close" data-fs-dev-icon-modal-close aria-label="${t('close', 'Close')}">
          <span class="dashicons dashicons-no-alt" aria-hidden="true"></span>
        </button>
      </header>
      <div class="fs-dev-icon-modal__body">
        <div class="fs-icon-picker__toolbar">
          <input type="search" class="fs-dev-icon-modal__search" data-fs-dev-icon-modal-search placeholder="${t('search', 'Search icons…')}" autocomplete="off">
          <div class="fs-icon-picker__variant fs-dev-icon-modal__variant" role="group" aria-label="${t('style', 'Style')}">
            <button type="button" class="button button-secondary" data-fs-dev-icon-modal-variant="outline">${t('outline', 'Outline')}</button>
            <button type="button" class="button button-secondary" data-fs-dev-icon-modal-variant="fill">${t('filled', 'Filled')}</button>
          </div>
        </div>
        <div class="fs-icon-picker__categories" data-fs-dev-icon-modal-categories></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

function createIconPickerModal() {
  let modal = document.querySelector('.fs-dev-icon-modal');
  let uiStrings = {};
  let value = '';
  let variant = readStoredVariant();
  let search = '';
  let onSelect = null;
  let focusTarget = null;

  const ensureModal = (strings) => {
    uiStrings = strings;

    if (!modal) {
      modal = createModal(uiStrings);
      bindModalEvents();
    }
  };

  const syncVariantButtons = () => {
    modal.querySelectorAll('[data-fs-dev-icon-modal-variant]').forEach((button) => {
      const isActive = button.getAttribute('data-fs-dev-icon-modal-variant') === variant;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const renderCategories = () => {
    const labels = iconLabels();
    const categories = categoryLabels();
    const query = search.trim().toLowerCase();
    const categoriesEl = modal.querySelector('[data-fs-dev-icon-modal-categories]');

    categoriesEl.innerHTML = '';

    iconCategories.forEach((category) => {
      const icons = category.icons.filter((icon) => iconMatchesQuery(icon, query, iconName(icon, labels)));

      if (!icons.length) {
        return;
      }

      const section = document.createElement('div');
      section.className = 'fs-icon-picker__category';

      const title = document.createElement('h3');
      title.className = 'fs-icon-picker__category-title';
      title.textContent = categoryName(category, categories);
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'fs-icon-picker__grid';

      icons.forEach((icon) => {
        const resolved = resolveIconName(icon, variant);
        const name = iconName(icon, labels);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'fs-icon-picker__item';
        button.title = name;
        button.setAttribute('aria-label', name);

        if (resolved === value) {
          button.classList.add('is-selected');
        }

        button.innerHTML = `<span class="fs-icon -icon-${resolved}" aria-hidden="true"></span>`;

        button.addEventListener('click', () => {
          value = resolved;

          if (typeof onSelect === 'function') {
            onSelect(value);
          }

          close();
        });

        grid.appendChild(button);
      });

      section.appendChild(grid);
      categoriesEl.appendChild(section);
    });
  };

  const close = () => {
    modal.hidden = true;
    document.body.classList.remove('fs-dev-icon-modal-open');

    if (focusTarget) {
      focusTarget.focus();
    }
  };

  const open = ({ strings, currentValue, onSelect: selectHandler, returnFocus }) => {
    ensureModal(strings);

    value = currentValue || '';
    onSelect = selectHandler;
    focusTarget = returnFocus || null;

    const selected = findIconByValue(value);
    variant = selected ? selected.variant : readStoredVariant();
    search = '';

    modal.querySelector('[data-fs-dev-icon-modal-search]').value = '';
    syncVariantButtons();
    renderCategories();

    modal.hidden = false;
    document.body.classList.add('fs-dev-icon-modal-open');
    modal.querySelector('[data-fs-dev-icon-modal-search]').focus();
  };

  const bindModalEvents = () => {
    modal.querySelectorAll('[data-fs-dev-icon-modal-close]').forEach((trigger) => {
      trigger.addEventListener('click', close);
    });

    modal.querySelector('[data-fs-dev-icon-modal-search]').addEventListener('input', (event) => {
      search = event.target.value;
      renderCategories();
    });

    modal.querySelectorAll('[data-fs-dev-icon-modal-variant]').forEach((button) => {
      button.addEventListener('click', () => {
        variant = button.getAttribute('data-fs-dev-icon-modal-variant') || 'outline';
        writeStoredVariant(variant);
        syncVariantButtons();
        renderCategories();
      });
    });

    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    });
  };

  return { open };
}

const iconPickerModal = createIconPickerModal();

function bindChooseIcon(root, { getValue, setValue }) {
  const chooseBtn = root.querySelector('[data-fs-icons-demo-choose]');

  if (!chooseBtn) {
    return;
  }

  const uiStrings = parseUiStrings(root);

  chooseBtn.addEventListener('click', () => {
    iconPickerModal.open({
      strings: uiStrings,
      currentValue: getValue(),
      onSelect: setValue,
      returnFocus: chooseBtn,
    });
  });
}

function initIconsDemo(root = document) {
  const demo = root.querySelector('[data-fs-icons-demo]');

  if (!demo) {
    return;
  }

  const preview = demo.querySelector('[data-fs-icons-demo-preview]');
  const codeEl = demo.querySelector('[data-fs-icons-demo-code]');

  if (!preview || !codeEl) {
    return;
  }

  let value = demo.getAttribute('data-fs-icons-demo-value') || '';

  const updateDemo = (nextValue) => {
    value = nextValue;
    preview.className = `fs-icon -icon-${value}`;
    preview.style.fontSize = '64px';
    codeEl.value = buildIconCode(value);
    demo.setAttribute('data-fs-icons-demo-value', value);
  };

  bindChooseIcon(demo, {
    getValue: () => value,
    setValue: updateDemo,
  });

  updateDemo(value);
}

function initButtonIconsDemo(root = document) {
  const demo = root.querySelector('[data-fs-icons-buttons-demo]');

  if (!demo) {
    return;
  }

  const previews = demo.querySelectorAll('[data-fs-icons-button-preview]');
  const codeEls = demo.querySelectorAll('[data-fs-icons-button-code]');

  if (!previews.length || !codeEls.length) {
    return;
  }

  let value = demo.getAttribute('data-fs-icons-demo-value') || '';

  const updateDemo = (nextValue) => {
    value = nextValue;
    demo.setAttribute('data-fs-icons-demo-value', value);

    previews.forEach((preview) => {
      const position = preview.getAttribute('data-fs-icons-button-position') || 'left';
      preview.className = buttonPreviewClasses(value, position);
    });

    codeEls.forEach((codeEl) => {
      const position = codeEl.getAttribute('data-fs-icons-button-code') || 'left';
      codeEl.value = buildButtonCode(value, position);
    });
  };

  bindChooseIcon(demo, {
    getValue: () => value,
    setValue: updateDemo,
  });

  updateDemo(value);
}

function initDeveloperIcons(root = document) {
  initButtonIconsDemo(root);
  initIconsDemo(root);
}

document.addEventListener('DOMContentLoaded', () => {
  initDeveloperIcons();
});

window.fromscratchInitDeveloperIcons = initDeveloperIcons;
window.fromscratchInitIconsDemo = initIconsDemo;
