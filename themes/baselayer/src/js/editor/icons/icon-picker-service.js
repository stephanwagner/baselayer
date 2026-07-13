import {
  iconCategories,
  resolveIconName,
  iconMatchesQuery,
} from './icon-catalog';
import { readStoredVariant, writeStoredVariant, resolvePickerVariant } from './icon-variant';

const iconL10n = () => (typeof window !== 'undefined' && window.baselayerIcons) || {};
const iconLabels = () => iconL10n().labels || {};
const categoryLabels = () => iconL10n().categories || {};
const uiStrings = () => iconL10n().ui || {};

const t = (key, fallback) => uiStrings()[key] || fallback;
const humanize = (slug) => slug.replace(/-/g, ' ').replace(/^\w/, (char) => char.toUpperCase());
const iconName = (icon, labels) => icon.label || labels[icon.filename] || humanize(icon.filename);
const categoryName = (category, labels) => category.label || labels[category.slug] || humanize(category.slug);

function createModal() {
  const modal = document.createElement('div');
  modal.className = 'bl-icon-picker-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'bl-icon-picker-modal-title');

  modal.innerHTML = `
    <div class="bl-icon-picker-modal__backdrop" data-bl-icon-picker-close tabindex="-1"></div>
    <div class="bl-icon-picker-modal__panel">
      <header class="bl-icon-picker-modal__header">
        <h2 id="bl-icon-picker-modal-title" class="bl-icon-picker-modal__title">${t('choose', 'Choose icon')}</h2>
        <button type="button" class="bl-icon-picker-modal__close" data-bl-icon-picker-close aria-label="${t('close', 'Close')}">
          <span class="dashicons dashicons-no-alt" aria-hidden="true"></span>
        </button>
      </header>
      <div class="bl-icon-picker-modal__body bl-icon-picker__panel">
        <div class="bl-icon-picker__toolbar">
          <input type="search" class="bl-icon-picker-modal__search" data-bl-icon-picker-search placeholder="${t('search', 'Search icons…')}" autocomplete="off">
          <div class="bl-icon-picker__variant bl-icon-picker-modal__variant" role="group" aria-label="${t('style', 'Style')}">
            <button type="button" class="button button-secondary" data-bl-icon-picker-variant="outline">${t('outline', 'Outline')}</button>
            <button type="button" class="button button-secondary" data-bl-icon-picker-variant="fill">${t('filled', 'Filled')}</button>
          </div>
        </div>
        <div class="bl-icon-picker__categories" data-bl-icon-picker-categories></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

function createIconPickerService() {
  let modal = null;
  let value = '';
  let variant = readStoredVariant();
  let search = '';
  let onSelect = null;
  let focusTarget = null;
  let eventsBound = false;

  const ensureModal = () => {
    if (!modal) {
      modal = createModal();
      bindModalEvents();
    }
  };

  const syncVariantButtons = () => {
    modal.querySelectorAll('[data-bl-icon-picker-variant]').forEach((button) => {
      const isActive = button.getAttribute('data-bl-icon-picker-variant') === variant;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const renderCategories = () => {
    const labels = iconLabels();
    const categories = categoryLabels();
    const query = search.trim().toLowerCase();
    const categoriesEl = modal.querySelector('[data-bl-icon-picker-categories]');

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
    if (!modal) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove('bl-icon-picker-modal-open');

    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus();
    }

    focusTarget = null;
    onSelect = null;
  };

  const open = ({ currentValue = '', onSelect: selectHandler, returnFocus = null }) => {
    ensureModal();

    value = currentValue || '';
    onSelect = selectHandler;
    focusTarget = returnFocus;

    variant = resolvePickerVariant(value);
    search = '';

    modal.querySelector('[data-bl-icon-picker-search]').value = '';
    syncVariantButtons();
    renderCategories();

    modal.hidden = false;
    document.body.classList.add('bl-icon-picker-modal-open');
    modal.querySelector('[data-bl-icon-picker-search]').focus();
  };

  const bindModalEvents = () => {
    if (eventsBound) {
      return;
    }

    eventsBound = true;

    modal.querySelectorAll('[data-bl-icon-picker-close]').forEach((trigger) => {
      trigger.addEventListener('click', close);
    });

    modal.querySelector('[data-bl-icon-picker-search]').addEventListener('input', (event) => {
      search = event.target.value;
      renderCategories();
    });

    modal.querySelectorAll('[data-bl-icon-picker-variant]').forEach((button) => {
      button.addEventListener('click', () => {
        variant = button.getAttribute('data-bl-icon-picker-variant') || 'outline';
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

  return { open, close };
}

const iconPickerService = createIconPickerService();

/**
 * Open the shared icon picker modal.
 *
 * @param {Object}   options
 * @param {string}   [options.currentValue]
 * @param {Function} options.onSelect
 * @param {Element}  [options.returnFocus]
 */
export function openIconPicker({ currentValue = '', onSelect, returnFocus = null }) {
  iconPickerService.open({ currentValue, onSelect, returnFocus });
}

export function closeIconPicker() {
  iconPickerService.close();
}
