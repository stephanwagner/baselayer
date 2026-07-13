/**
 * Developer cheatsheet — icon demos (standalone + buttons) with shared modal picker.
 */
import {
  iconCategories,
  resolveIconName,
  iconMatchesQuery,
} from '../../editor/icons/icon-catalog';
import { readStoredVariant, writeStoredVariant, resolvePickerVariant } from '../../editor/icons/icon-variant';

const iconL10n = () => (typeof window !== 'undefined' && window.baselayerIcons) || {};

const iconLabels = () => iconL10n().labels || {};

const categoryLabels = () => iconL10n().categories || {};

const parseUiStrings = (root) => {
  let fromDom = {};

  try {
    fromDom = JSON.parse(root.getAttribute('data-bl-icons-ui') || '{}');
  } catch {
    fromDom = {};
  }

  return { ...(iconL10n().ui || {}), ...fromDom };
};

const humanize = (slug) => slug.replace(/-/g, ' ').replace(/^\w/, (char) => char.toUpperCase());

const iconName = (icon, labels) => icon.label || labels[icon.filename] || humanize(icon.filename);

const categoryName = (category, labels) => category.label || labels[category.slug] || humanize(category.slug);

const buildIconCode = (value) => `<div class="bl-icon -icon-${value}"></div>`;

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
    return `../icons-theme/${name.slice('theme-'.length)}.svg`;
  }

  return `${name}.svg`;
};

const iconSvgAssetPath = (name) => {
  if (name.startsWith('theme-')) {
    const base = name.slice('theme-'.length);
    const themeBase = iconL10n().themeIconsBase || '';

    if (themeBase.includes('/assets/icons/') && !themeBase.includes('/assets/icons-theme/')) {
      return `/icons/${base}.svg`;
    }

    return `/icons-theme/${base}.svg`;
  }

  return `/icons/${name}.svg`;
};

const themeIconFetchUrl = (name, iconsBaseUrl) => {
  if (name.startsWith('theme-')) {
    const themeBase = iconL10n().themeIconsBase;
    if (themeBase) {
      return `${themeBase}${name.slice('theme-'.length)}.svg`;
    }
  }

  return `${iconsBaseUrl}${iconSvgFile(name)}`;
};

const buildSvgPhpCode = (value) => `bl_svg_code('${iconSvgAssetPath(value)}', ['class' => 'my-class']);`;

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
  modal.className = 'bl-dev-icon-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'bl-dev-icon-modal-title');

  modal.innerHTML = `
    <div class="bl-dev-icon-modal__backdrop" data-bl-dev-icon-modal-close tabindex="-1"></div>
    <div class="bl-dev-icon-modal__panel">
      <header class="bl-dev-icon-modal__header">
        <h2 id="bl-dev-icon-modal-title" class="bl-dev-icon-modal__title">${t('choose', 'Choose icon')}</h2>
        <button type="button" class="bl-dev-icon-modal__close" data-bl-dev-icon-modal-close aria-label="${t('close', 'Close')}">
          <span class="dashicons dashicons-no-alt" aria-hidden="true"></span>
        </button>
      </header>
      <div class="bl-dev-icon-modal__body bl-icon-picker__panel">
        <div class="bl-icon-picker__toolbar">
          <input type="search" class="bl-dev-icon-modal__search" data-bl-dev-icon-modal-search placeholder="${t('search', 'Search icons…')}" autocomplete="off">
          <div class="bl-icon-picker__variant bl-dev-icon-modal__variant" role="group" aria-label="${t('style', 'Style')}">
            <button type="button" class="button button-secondary" data-bl-dev-icon-modal-variant="outline">${t('outline', 'Outline')}</button>
            <button type="button" class="button button-secondary" data-bl-dev-icon-modal-variant="fill">${t('filled', 'Filled')}</button>
          </div>
        </div>
        <div class="bl-icon-picker__categories" data-bl-dev-icon-modal-categories></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

function createIconPickerModal() {
  let modal = document.querySelector('.bl-dev-icon-modal');
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
    modal.querySelectorAll('[data-bl-dev-icon-modal-variant]').forEach((button) => {
      const isActive = button.getAttribute('data-bl-dev-icon-modal-variant') === variant;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const renderCategories = () => {
    const labels = iconLabels();
    const categories = categoryLabels();
    const query = search.trim().toLowerCase();
    const categoriesEl = modal.querySelector('[data-bl-dev-icon-modal-categories]');

    categoriesEl.innerHTML = '';

    iconCategories.forEach((category) => {
      const icons = category.icons.filter((icon) => iconMatchesQuery(icon, query, iconName(icon, labels)));

      if (!icons.length) {
        return;
      }

      const section = document.createElement('div');
      section.className = 'bl-icon-picker__category';

      const title = document.createElement('h3');
      title.className = 'bl-icon-picker__category-title';
      title.textContent = categoryName(category, categories);
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'bl-icon-picker__grid';

      icons.forEach((icon) => {
        const resolved = resolveIconName(icon, variant);
        const name = iconName(icon, labels);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'bl-icon-picker__item';
        button.title = name;
        button.setAttribute('aria-label', name);

        if (resolved === value) {
          button.classList.add('is-selected');
        }

        button.innerHTML = `<span class="bl-icon -icon-${resolved}" aria-hidden="true"></span>`;

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
    document.body.classList.remove('bl-dev-icon-modal-open');

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

    modal.querySelector('[data-bl-dev-icon-modal-search]').value = '';
    syncVariantButtons();
    renderCategories();

    modal.hidden = false;
    document.body.classList.add('bl-dev-icon-modal-open');
    modal.querySelector('[data-bl-dev-icon-modal-search]').focus();
  };

  const bindModalEvents = () => {
    modal.querySelectorAll('[data-bl-dev-icon-modal-close]').forEach((trigger) => {
      trigger.addEventListener('click', close);
    });

    modal.querySelector('[data-bl-dev-icon-modal-search]').addEventListener('input', (event) => {
      search = event.target.value;
      renderCategories();
    });

    modal.querySelectorAll('[data-bl-dev-icon-modal-variant]').forEach((button) => {
      button.addEventListener('click', () => {
        variant = button.getAttribute('data-bl-dev-icon-modal-variant') || 'outline';
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
  const chooseBtn = root.querySelector('[data-bl-icons-demo-choose]');

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
  const demo = root.querySelector('[data-bl-icons-demo]');

  if (!demo) {
    return;
  }

  const preview = demo.querySelector('[data-bl-icons-demo-preview]');
  const codeEl = demo.querySelector('[data-bl-icons-demo-code]');

  if (!preview || !codeEl) {
    return;
  }

  let value = demo.getAttribute('data-bl-icons-demo-value') || '';

  const updateDemo = (nextValue) => {
    value = nextValue;
    preview.className = `bl-icon -icon-${value}`;
    codeEl.textContent = buildIconCode(value);
    demo.setAttribute('data-bl-icons-demo-value', value);
  };

  bindChooseIcon(demo, {
    getValue: () => value,
    setValue: updateDemo,
  });

  updateDemo(value);
}

function initInlineIconsDemo(root = document) {
  root.querySelectorAll('[data-bl-icons-inline-demo]').forEach((demo) => {
    const preview = demo.querySelector('[data-bl-icons-inline-preview]');
    const codeEl = demo.querySelector('[data-bl-icons-inline-code]');

    if (!preview || !codeEl) {
      return;
    }

    let value = demo.getAttribute('data-bl-icons-demo-value') || '';
    const placement = demo.getAttribute('data-bl-icons-inline-placement') || 'before';
    const label = preview.textContent.trim();

    const updateDemo = () => {
      demo.setAttribute('data-bl-icons-demo-value', value);
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
  const demo = root.querySelector('[data-bl-icons-buttons-demo]');

  if (!demo) {
    return;
  }

  const preview = demo.querySelector('[data-bl-icons-button-preview]');
  const codeEl = demo.querySelector('[data-bl-icons-button-code]');
  const positionButtons = demo.querySelectorAll('[data-bl-icons-position-toggle]');
  const elementButtons = demo.querySelectorAll('[data-bl-icons-element-toggle]');

  if (!preview || !codeEl) {
    return;
  }

  let value = demo.getAttribute('data-bl-icons-demo-value') || '';
  let position = demo.getAttribute('data-bl-icons-button-position') || 'left';
  let element = demo.getAttribute('data-bl-icons-button-element') || 'button';

  const syncToggleGroup = (buttons, activeValue, attr) => {
    buttons.forEach((button) => {
      const isActive = button.getAttribute(attr) === activeValue;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const updateDemo = () => {
    demo.setAttribute('data-bl-icons-demo-value', value);
    demo.setAttribute('data-bl-icons-button-position', position);
    demo.setAttribute('data-bl-icons-button-element', element);
    preview.className = buttonPreviewClasses(value, position);
    codeEl.textContent = buildButtonCode(value, position, element);
    syncToggleGroup(positionButtons, position, 'data-bl-icons-position-toggle');
    syncToggleGroup(elementButtons, element, 'data-bl-icons-element-toggle');
  };

  positionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      position = button.getAttribute('data-bl-icons-position-toggle') || 'left';
      updateDemo();
    });
  });

  elementButtons.forEach((button) => {
    button.addEventListener('click', () => {
      element = button.getAttribute('data-bl-icons-element-toggle') || 'button';
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
  const demo = root.querySelector('[data-bl-icons-svg-demo]');

  if (!demo) {
    return;
  }

  const preview = demo.querySelector('[data-bl-icons-svg-preview]');
  const phpCodeEl = demo.querySelector('[data-bl-icons-svg-php-code]');
  const markupCodeEl = demo.querySelector('[data-bl-icons-svg-markup-code]');
  const baseUrl = demo.getAttribute('data-bl-icons-svg-base') || '';

  if (!preview || !phpCodeEl || !markupCodeEl) {
    return;
  }

  let value = demo.getAttribute('data-bl-icons-demo-value') || '';

  const updateDemo = async (nextValue) => {
    value = nextValue;
    demo.setAttribute('data-bl-icons-demo-value', value);
    phpCodeEl.textContent = buildSvgPhpCode(value);

    let rawSvg = '';

    try {
      const response = await fetch(themeIconFetchUrl(value, baseUrl));

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

window.baselayerInitDeveloperIcons = initDeveloperIcons;
window.baselayerInitIconsDemo = initIconsDemo;
