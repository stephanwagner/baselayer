/**
 * Developer cheatsheet — icon demos (standalone + buttons) with shared modal picker.
 */
import {
  iconCategories,
  resolveIconName,
  iconMatchesQuery,
} from '../../editor/icons/icon-catalog';
import { readStoredVariant, writeStoredVariant, resolvePickerVariant } from '../../editor/icons/icon-variant';

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

const buildIconCode = (value) => `<div class="fs-icon -icon-${value}"></div>`;

const buildInlineCode = (value, placement, label) => {
  const carrier = placement === 'after' ? '-icon-after' : '-icon-before';

  return `<span class="${carrier} -icon-${value}">${label}</span>`;
};

const inlinePreviewClasses = (value, placement) => {
  const carrier = placement === 'after' ? '-icon-after' : '-icon-before';

  return `${carrier} -icon-${value}`;
};

const iconSvgFile = (name) => {
  if (name.startsWith('theme-')) {
    return `theme/${name.slice('theme-'.length)}.svg`;
  }

  return `${name}.svg`;
};

const iconSvgAssetPath = (name) => {
  if (name.startsWith('theme-')) {
    return `/icons-theme/${name.slice('theme-'.length)}.svg`;
  }

  return `/icons/${name}.svg`;
};

const buildSvgPhpCode = (value) => `fs_svg_code('${iconSvgAssetPath(value)}', ['class' => 'my-class']);`;

const buildButtonCode = (value, position, element = 'button') => {
  const iconClass = `-icon-${value}`;
  let classes = `button -has-icon ${iconClass}`;

  if (position === 'right') {
    classes += ' -icon-right';
  }

  if (element === 'link') {
    return `<a href="/" class="${classes}">Link</a>`;
  }

  return `<button type="button" class="${classes}">Button</button>`;
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
      <div class="fs-dev-icon-modal__body fs-icon-picker__panel">
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

    variant = resolvePickerVariant(value);
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
    codeEl.textContent = buildIconCode(value);
    demo.setAttribute('data-fs-icons-demo-value', value);
  };

  bindChooseIcon(demo, {
    getValue: () => value,
    setValue: updateDemo,
  });

  updateDemo(value);
}

function initInlineIconsDemo(root = document) {
  root.querySelectorAll('[data-fs-icons-inline-demo]').forEach((demo) => {
    const preview = demo.querySelector('[data-fs-icons-inline-preview]');
    const codeEl = demo.querySelector('[data-fs-icons-inline-code]');

    if (!preview || !codeEl) {
      return;
    }

    let value = demo.getAttribute('data-fs-icons-demo-value') || '';
    const placement = demo.getAttribute('data-fs-icons-inline-placement') || 'before';
    const label = preview.textContent.trim();

    const updateDemo = () => {
      demo.setAttribute('data-fs-icons-demo-value', value);
      preview.className = inlinePreviewClasses(value, placement);
      codeEl.textContent = buildInlineCode(value, placement, label);
    };

    bindChooseIcon(demo, {
      getValue: () => value,
      setValue: (nextValue) => {
        value = nextValue;
        updateDemo();
      },
    });

    updateDemo();
  });
}

function initButtonIconsDemo(root = document) {
  const demo = root.querySelector('[data-fs-icons-buttons-demo]');

  if (!demo) {
    return;
  }

  const preview = demo.querySelector('[data-fs-icons-button-preview]');
  const codeEl = demo.querySelector('[data-fs-icons-button-code]');
  const positionButtons = demo.querySelectorAll('[data-fs-icons-position-toggle]');
  const elementButtons = demo.querySelectorAll('[data-fs-icons-element-toggle]');

  if (!preview || !codeEl) {
    return;
  }

  let value = demo.getAttribute('data-fs-icons-demo-value') || '';
  let position = demo.getAttribute('data-fs-icons-button-position') || 'left';
  let element = demo.getAttribute('data-fs-icons-button-element') || 'button';

  const syncToggleGroup = (buttons, activeValue, attr) => {
    buttons.forEach((button) => {
      const isActive = button.getAttribute(attr) === activeValue;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const updateDemo = () => {
    demo.setAttribute('data-fs-icons-demo-value', value);
    demo.setAttribute('data-fs-icons-button-position', position);
    demo.setAttribute('data-fs-icons-button-element', element);
    preview.className = buttonPreviewClasses(value, position);
    codeEl.textContent = buildButtonCode(value, position, element);
    syncToggleGroup(positionButtons, position, 'data-fs-icons-position-toggle');
    syncToggleGroup(elementButtons, element, 'data-fs-icons-element-toggle');
  };

  positionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      position = button.getAttribute('data-fs-icons-position-toggle') || 'left';
      updateDemo();
    });
  });

  elementButtons.forEach((button) => {
    button.addEventListener('click', () => {
      element = button.getAttribute('data-fs-icons-element-toggle') || 'button';
      updateDemo();
    });
  });

  bindChooseIcon(demo, {
    getValue: () => value,
    setValue: (nextValue) => {
      value = nextValue;
      updateDemo();
    },
  });

  updateDemo();
}

function initSvgIconsDemo(root = document) {
  const demo = root.querySelector('[data-fs-icons-svg-demo]');

  if (!demo) {
    return;
  }

  const preview = demo.querySelector('[data-fs-icons-svg-preview]');
  const phpCodeEl = demo.querySelector('[data-fs-icons-svg-php-code]');
  const markupCodeEl = demo.querySelector('[data-fs-icons-svg-markup-code]');
  const baseUrl = demo.getAttribute('data-fs-icons-svg-base') || '';

  if (!preview || !phpCodeEl || !markupCodeEl) {
    return;
  }

  let value = demo.getAttribute('data-fs-icons-demo-value') || '';

  const updateDemo = async (nextValue) => {
    value = nextValue;
    demo.setAttribute('data-fs-icons-demo-value', value);
    phpCodeEl.textContent = buildSvgPhpCode(value);

    let rawSvg = '';

    try {
      const response = await fetch(`${baseUrl}${iconSvgFile(value)}`);

      if (response.ok) {
        rawSvg = await response.text();
      }
    } catch {
      rawSvg = '';
    }

    if (!rawSvg) {
      return;
    }

    preview.innerHTML = rawSvg;
    markupCodeEl.textContent = rawSvg;
  };

  bindChooseIcon(demo, {
    getValue: () => value,
    setValue: updateDemo,
  });
}

function initDeveloperIcons(root = document) {
  initButtonIconsDemo(root);
  initInlineIconsDemo(root);
  initIconsDemo(root);
  initSvgIconsDemo(root);
}

document.addEventListener('DOMContentLoaded', () => {
  initDeveloperIcons();
});

window.fromscratchInitDeveloperIcons = initDeveloperIcons;
window.fromscratchInitIconsDemo = initIconsDemo;
