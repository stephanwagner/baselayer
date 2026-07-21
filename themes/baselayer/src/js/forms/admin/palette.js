import Sortable from 'sortablejs';
import { PALETTE_SECTIONS, el, t, typeLabel, iconEl } from './dom.js';

function paletteIcon(type) {
  const icons = (window.blFormsAdmin && window.blFormsAdmin.icons) || {};
  const markup = icons[type] || '';
  const wrap = el('span', {
    className: 'bl-forms-builder__template-icon',
    'aria-hidden': 'true',
  });
  if (markup) {
    wrap.innerHTML = markup;
  }
  return wrap;
}

function paletteAddButton(type, onAdd) {
  const icons = (window.blFormsAdmin && window.blFormsAdmin.icons) || {};
  const markup = icons.add || '';
  const btn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__template-add',
    title: t('paletteAdd', 'Add field'),
    'aria-label': t('paletteAdd', 'Add field'),
    onClick: (event) => {
      event.preventDefault();
      event.stopPropagation();
      onAdd(type);
    },
  });
  if (markup) {
    btn.innerHTML = markup;
  } else {
    btn.textContent = '›';
  }
  return btn;
}

/**
 * Left column: field template chips grouped into accordion sections.
 *
 * @param {(type: string) => void} onAdd
 */
export function createPalette(onAdd) {
  const wrap = el('aside', { className: 'bl-forms-builder__palette' });
  wrap.appendChild(
    el('h3', { className: 'bl-forms-builder__col-title', text: t('paletteHeading', 'Field templates') })
  );

  const sections = [];

  const setOpen = (openId) => {
    sections.forEach(({ sectionEl, toggle, panel, id }) => {
      const open = id === openId;
      sectionEl.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
    });
  };

  PALETTE_SECTIONS.forEach((section, index) => {
    const panelId = 'bl-forms-palette-' + section.id;
    const sectionEl = el('div', {
      className: 'bl-forms-builder__palette-section' + (index === 0 ? ' is-open' : ''),
      dataset: { blFormsPaletteSection: section.id },
    });

    const toggle = el('button', {
      type: 'button',
      className: 'bl-forms-builder__palette-section-toggle',
      'aria-expanded': index === 0 ? 'true' : 'false',
      'aria-controls': panelId,
      onClick: () => {
        const isOpen = sectionEl.classList.contains('is-open');
        // Keep one open: clicking the open section does nothing; clicking another opens it.
        if (!isOpen) {
          setOpen(section.id);
        }
      },
    });
    const chevron = iconEl('caret', 'bl-forms-builder__palette-section-chevron');
    if (!chevron.innerHTML) {
      chevron.textContent = '▾';
    }
    toggle.append(
      el('span', {
        className: 'bl-forms-builder__palette-section-title',
        text: t(section.headingKey, section.headingFallback),
      }),
      chevron
    );

    const panel = el('div', {
      id: panelId,
      className: 'bl-forms-builder__palette-panel',
      role: 'region',
    });
    panel.hidden = index !== 0;

    const list = el('div', {
      className: 'bl-forms-builder__palette-list',
      dataset: { blFormsPalette: section.id },
    });

    section.types.forEach((type) => {
      list.appendChild(
        el(
          'div',
          {
            className: 'bl-forms-builder__template',
            dataset: { fieldType: type },
            onClick: () => onAdd(type),
          },
          [
            paletteIcon(type),
            el('span', { className: 'bl-forms-builder__template-label', text: typeLabel(type) }),
            paletteAddButton(type, onAdd),
          ]
        )
      );
    });

    panel.appendChild(list);
    sectionEl.append(toggle, panel);
    wrap.appendChild(sectionEl);
    sections.push({ id: section.id, sectionEl, toggle, panel });

    Sortable.create(list, {
      group: { name: 'bl-forms-fields', pull: 'clone', put: false },
      sort: false,
      animation: 150,
      draggable: '.bl-forms-builder__template',
      filter: '.bl-forms-builder__template-add',
      preventOnFilter: true,
    });
  });

  return wrap;
}
