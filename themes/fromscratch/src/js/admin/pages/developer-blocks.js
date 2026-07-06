/**
 * Theme settings → Blocks: icons, card interactions, search, system list.
 */

const blockSettingsAdmin = () => (typeof window !== 'undefined' && window.fromscratchBlockSettingsAdmin) || {};

const iconSlugForBlock = (blockName) => {
  const config = blockSettingsAdmin();
  const map = config.iconMap || {};

  if (map[blockName]) {
    return map[blockName];
  }

  if (blockName.startsWith('core/')) {
    return blockName.slice(5);
  }

  return null;
};

const renderBlockSettingsIcons = () => {
  const config = blockSettingsAdmin();
  const iconsUrl = config.iconsUrl || '';
  const fallback = config.fallbackIcon || 'block-default';

  if (!iconsUrl) {
    return;
  }

  document.querySelectorAll('[data-fs-block-settings-icon]').forEach((el) => {
    const blockName = el.getAttribute('data-block-name');
    if (!blockName || el.dataset.fsBlockIconRendered === '1') {
      return;
    }

    const slug = iconSlugForBlock(blockName);
    if (!slug) {
      return;
    }

    const img = document.createElement('img');
    img.width = 20;
    img.height = 20;
    img.alt = '';
    img.decoding = 'async';
    img.src = `${iconsUrl}${slug}.svg`;
    img.addEventListener('error', () => {
      if (img.dataset.fsFallbackTried === '1') {
        return;
      }
      img.dataset.fsFallbackTried = '1';
      img.src = `${iconsUrl}${fallback}.svg`;
    }, { once: true });

    el.replaceChildren(img);
    el.dataset.fsBlockIconRendered = '1';
  });
};

function initBlockSettingsPage() {
  const form = document.getElementById('fs-block-settings-form');
  if (!form) {
    return;
  }

  renderBlockSettingsIcons();

  const searchInput = form.querySelector('[data-fs-block-settings-search]');
  const cards = [...form.querySelectorAll('[data-fs-block-settings-card]')];
  const groups = [...form.querySelectorAll('[data-fs-block-settings-group]')];
  const systemToggle = form.querySelector('[data-fs-block-settings-system-toggle]');
  const systemPanel = form.querySelector('[data-fs-block-settings-system-panel]');

  const getHiddenInput = (card, selector) => card.querySelector(selector);
  const getAllowedInput = (card) => card.querySelector('[data-fs-block-settings-allowed]');

  const setMode = (card, mode) => {
    const hiddenInput = getHiddenInput(card, '[data-fs-block-settings-hidden]');
    const favoriteInput = getHiddenInput(card, '[data-fs-block-settings-favorite]');
    const modeButtons = [...card.querySelectorAll('[data-fs-block-settings-mode]')];

    if (!(hiddenInput instanceof HTMLInputElement) || !(favoriteInput instanceof HTMLInputElement)) {
      return;
    }

    hiddenInput.value = mode === 'hidden' ? '1' : '0';
    favoriteInput.value = mode === 'favorite' ? '1' : '0';

    modeButtons.forEach((button) => {
      const buttonMode = button.getAttribute('data-fs-block-settings-mode');
      const isActive = buttonMode === mode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const getMode = (card) => {
    const hiddenInput = getHiddenInput(card, '[data-fs-block-settings-hidden]');
    const favoriteInput = getHiddenInput(card, '[data-fs-block-settings-favorite]');

    if (hiddenInput instanceof HTMLInputElement && hiddenInput.value === '1') {
      return 'hidden';
    }
    if (favoriteInput instanceof HTMLInputElement && favoriteInput.value === '1') {
      return 'favorite';
    }
    return '';
  };

  const syncCardState = (card) => {
    const allowed = getAllowedInput(card);
    const modes = card.querySelector('[data-fs-block-settings-modes]');

    if (!(allowed instanceof HTMLInputElement)) {
      return;
    }

    const isAllowed = allowed.checked;
    card.classList.toggle('is-allowed', isAllowed);
    card.classList.toggle('is-disallowed', !isAllowed);

    if (modes instanceof HTMLElement) {
      modes.classList.toggle('is-disabled', !isAllowed);
      modes.querySelectorAll('button').forEach((button) => {
        button.disabled = !isAllowed;
      });
    }

    if (!isAllowed) {
      setMode(card, '');
    }
  };

  cards.forEach((card) => {
    syncCardState(card);

    const allowed = getAllowedInput(card);
    if (allowed instanceof HTMLInputElement) {
      allowed.addEventListener('change', () => syncCardState(card));
    }

    card.querySelectorAll('[data-fs-block-settings-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!(button instanceof HTMLButtonElement) || button.disabled) {
          return;
        }

        const mode = button.getAttribute('data-fs-block-settings-mode') || '';
        const current = getMode(card);
        setMode(card, current === mode ? '' : mode);
      });
    });
  });

  const filterCards = (query) => {
    const needle = query.trim().toLowerCase();

    cards.forEach((card) => {
      const haystack = card.getAttribute('data-search') || '';
      const match = needle === '' || haystack.includes(needle);
      card.hidden = !match;
    });

    groups.forEach((group) => {
      const visibleCards = group.querySelectorAll('[data-fs-block-settings-card]:not([hidden])');
      group.hidden = visibleCards.length === 0;
    });
  };

  if (searchInput instanceof HTMLInputElement) {
    searchInput.addEventListener('input', () => filterCards(searchInput.value));
  }

  if (systemToggle instanceof HTMLButtonElement && systemPanel instanceof HTMLElement) {
    systemToggle.addEventListener('click', () => {
      const isOpen = !systemPanel.hidden;
      systemPanel.hidden = isOpen;
      systemToggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      systemToggle.classList.toggle('is-open', !isOpen);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlockSettingsPage);
} else {
  initBlockSettingsPage();
}
