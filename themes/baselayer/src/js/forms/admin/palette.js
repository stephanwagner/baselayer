import Sortable from 'sortablejs';
import { PALETTE_SECTIONS, el, t, typeLabel, iconEl, formsDragStart, formsDragEnd } from './dom.js';

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
  // Keep Sortable from swallowing the click / starting a drag from this control.
  const stopSortable = (event) => {
    event.stopPropagation();
  };
  btn.addEventListener('pointerdown', stopSortable);
  btn.addEventListener('mousedown', stopSortable);
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

  const search = el('input', {
    type: 'search',
    className: 'bl-forms-builder__palette-search',
    placeholder: t('paletteSearch', 'Search fields…'),
    'aria-label': t('paletteSearch', 'Search fields…'),
    autocomplete: 'off',
  });
  wrap.appendChild(search);

  const empty = el('p', {
    className: 'description bl-forms-builder__palette-empty',
    text: t('paletteSearchEmpty', 'No fields match your search.'),
    hidden: true,
  });
  wrap.appendChild(empty);

  const sections = [];
  let openId = PALETTE_SECTIONS[0]?.id || '';

  const setOpen = (nextId) => {
    openId = nextId;
    sections.forEach(({ sectionEl, toggle, panel, id }) => {
      const open = openId !== '' && id === openId;
      sectionEl.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
    });
  };

  const applySearch = () => {
    const query = search.value.trim().toLowerCase();
    const searching = query !== '';
    let totalVisible = 0;

    sections.forEach(({ sectionEl, toggle, panel, list, id }) => {
      let sectionVisible = 0;
      list.querySelectorAll('.bl-forms-builder__template').forEach((item) => {
        const type = item.dataset.fieldType || '';
        const label = (item.querySelector('.bl-forms-builder__template-label')?.textContent || '').toLowerCase();
        const match = !searching || label.includes(query) || type.toLowerCase().includes(query);
        item.hidden = !match;
        if (match) {
          sectionVisible += 1;
        }
      });

      const showSection = !searching || sectionVisible > 0;
      sectionEl.hidden = !showSection;
      totalVisible += sectionVisible;

      if (searching) {
        const open = sectionVisible > 0;
        sectionEl.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.hidden = !open;
      }
    });

    if (!searching) {
      setOpen(openId);
    }

    empty.hidden = !searching || totalVisible > 0;
  };

  search.addEventListener('input', applySearch);

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
        if (search.value.trim() !== '') {
          return;
        }
        const isOpen = sectionEl.classList.contains('is-open');
        setOpen(isOpen ? '' : section.id);
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
    sections.push({ id: section.id, sectionEl, toggle, panel, list });

    Sortable.create(list, {
      group: { name: 'bl-forms-fields', pull: 'clone', put: false },
      sort: false,
      animation: 150,
      draggable: '.bl-forms-builder__template',
      filter: '.bl-forms-builder__template-add',
      // false: allow the › button click; drag is blocked via filter + stopPropagation.
      preventOnFilter: false,
      onStart() {
        formsDragStart();
      },
      onEnd() {
        formsDragEnd();
      },
    });
  });

  return wrap;
}
