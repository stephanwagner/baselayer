import {
  iconCategories,
  resolveIconName,
  iconMatchesQuery,
} from './icon-catalog';
import { readStoredVariant, writeStoredVariant, resolvePickerVariant } from './icon-variant';

const iconL10n = () => (typeof window !== 'undefined' && window.fromscratchIcons) || {};
const iconLabels = () => iconL10n().labels || {};
const categoryLabels = () => iconL10n().categories || {};
const uiStrings = () => iconL10n().ui || {};

const t = (key, fallback) => uiStrings()[key] || fallback;
const humanize = (slug) => slug.replace(/-/g, ' ').replace(/^\w/, (char) => char.toUpperCase());
const iconName = (icon, labels) => icon.label || labels[icon.filename] || humanize(icon.filename);
const categoryName = (category, labels) => category.label || labels[category.slug] || humanize(category.slug);

function createModal() {
  const modal = document.createElement('div');
  modal.className = 'fs-icon-picker-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'fs-icon-picker-modal-title');

  modal.innerHTML = `
    <div class="fs-icon-picker-modal__backdrop" data-fs-icon-picker-close tabindex="-1"></div>
    <div class="fs-icon-picker-modal__panel">
      <header class="fs-icon-picker-modal__header">
        <h2 id="fs-icon-picker-modal-title" class="fs-icon-picker-modal__title">${t('choose', 'Choose icon')}</h2>
        <button type="button" class="fs-icon-picker-modal__close" data-fs-icon-picker-close aria-label="${t('close', 'Close')}">
          <span class="dashicons dashicons-no-alt" aria-hidden="true"></span>
        </button>
      </header>
      <div class="fs-icon-picker-modal__body fs-icon-picker__panel">
        <div class="fs-icon-picker__toolbar">
          <input type="search" class="fs-icon-picker-modal__search" data-fs-icon-picker-search placeholder="${t('search', 'Search icons…')}" autocomplete="off">
          <div class="fs-icon-picker__variant fs-icon-picker-modal__variant" role="group" aria-label="${t('style', 'Style')}">
            <button type="button" class="button button-secondary" data-fs-icon-picker-variant="outline">${t('outline', 'Outline')}</button>
            <button type="button" class="button button-secondary" data-fs-icon-picker-variant="fill">${t('filled', 'Filled')}</button>
          </div>
        </div>
        <div class="fs-icon-picker__categories" data-fs-icon-picker-categories></div>
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
    modal.querySelectorAll('[data-fs-icon-picker-variant]').forEach((button) => {
      const isActive = button.getAttribute('data-fs-icon-picker-variant') === variant;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const renderCategories = () => {
    const labels = iconLabels();
    const categories = categoryLabels();
    const query = search.trim().toLowerCase();
    const categoriesEl = modal.querySelector('[data-fs-icon-picker-categories]');

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
    if (!modal) {
      return;
    }

    modal.hidden = true;
    document.body.classList.remove('fs-icon-picker-modal-open');

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

    modal.querySelector('[data-fs-icon-picker-search]').value = '';
    syncVariantButtons();
    renderCategories();

    modal.hidden = false;
    document.body.classList.add('fs-icon-picker-modal-open');
    modal.querySelector('[data-fs-icon-picker-search]').focus();
  };

  const bindModalEvents = () => {
    if (eventsBound) {
      return;
    }

    eventsBound = true;

    modal.querySelectorAll('[data-fs-icon-picker-close]').forEach((trigger) => {
      trigger.addEventListener('click', close);
    });

    modal.querySelector('[data-fs-icon-picker-search]').addEventListener('input', (event) => {
      search = event.target.value;
      renderCategories();
    });

    modal.querySelectorAll('[data-fs-icon-picker-variant]').forEach((button) => {
      button.addEventListener('click', () => {
        variant = button.getAttribute('data-fs-icon-picker-variant') || 'outline';
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
