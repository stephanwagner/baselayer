/**
 * Left palette: type chips grouped into accordion sections.
 */
import { el, makeT } from './dom.js';
import { createSortable, dragStart, dragEnd } from './sortable.js';

/**
 * @param {object} options
 * @param {Array<{id: string, headingKey?: string, headingFallback?: string, heading?: string, types: string[]}>} options.sections
 * @param {(type: string) => void} options.onAdd
 * @param {(key: string, fallback?: string) => string} [options.t]
 * @param {(type: string) => string} [options.typeLabel]
 * @param {(type: string) => HTMLElement} [options.renderIcon]
 * @param {Record<string, string>} [options.icons]
 * @param {string} [options.ns='bl-builder']
 * @param {string} [options.groupName='bl-builder-items']
 */
export function createPalette(options = {}) {
  const ns = options.ns || 'bl-builder';
  const t = makeT(options.t);
  const typeLabel = options.typeLabel || ((type) => type);
  const icons = options.icons || {};
  const sectionsConfig = options.sections || [];
  const groupName = options.groupName || 'bl-builder-items';
  const onAdd = options.onAdd || (() => {});

  const wrap = el('aside', { className: `${ns}__palette` });
  const bodyId = `${ns}-palette-body`;

  const search = el('input', {
    type: 'search',
    className: `${ns}__palette-search`,
    placeholder: t('paletteSearch', 'Search…'),
    'aria-label': t('paletteSearch', 'Search…'),
    autocomplete: 'off',
  });

  wrap.appendChild(el('div', { className: `${ns}__palette-toolbar` }, [search]));

  const body = el('div', { id: bodyId, className: `${ns}__palette-body` });
  wrap.appendChild(body);

  const empty = el('p', {
    className: `description ${ns}__palette-empty`,
    text: t('paletteSearchEmpty', 'No items match your search.'),
    hidden: true,
  });
  body.appendChild(empty);

  const sections = [];
  let openId = sectionsConfig[0]?.id || '';

  const defaultIcon = (type) => {
    if (typeof options.renderIcon === 'function') {
      return options.renderIcon(type);
    }
    const wrapIcon = el('span', {
      className: `${ns}__template-icon`,
      'aria-hidden': 'true',
    });
    if (icons[type]) {
      wrapIcon.innerHTML = icons[type];
    }
    return wrapIcon;
  };

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
      if (searching && id === 'popular') {
        sectionEl.hidden = true;
        sectionEl.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
        list.querySelectorAll(`.${ns}__template`).forEach((item) => {
          item.hidden = true;
        });
        return;
      }

      let sectionVisible = 0;
      list.querySelectorAll(`.${ns}__template`).forEach((item) => {
        const type = item.dataset.itemType || item.dataset.fieldType || '';
        const label = (
          item.querySelector(`.${ns}__template-label`)?.textContent || ''
        ).toLowerCase();
        const match = !searching || label.includes(query) || type.toLowerCase().includes(query);
        item.hidden = !match;
        if (match) sectionVisible += 1;
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

  sectionsConfig.forEach((section, index) => {
    const panelId = `${ns}-palette-${section.id}`;
    const sectionEl = el('div', {
      className: `${ns}__palette-section` + (index === 0 ? ' is-open' : ''),
      dataset: { blBuilderPaletteSection: section.id },
    });

    const toggle = el('button', {
      type: 'button',
      className: `${ns}__palette-section-toggle`,
      'aria-expanded': index === 0 ? 'true' : 'false',
      'aria-controls': panelId,
      onClick: () => {
        if (search.value.trim() !== '') return;
        const isOpen = sectionEl.classList.contains('is-open');
        setOpen(isOpen ? '' : section.id);
      },
    });

    const chevron = el('span', {
      className: `${ns}__palette-section-chevron`,
      'aria-hidden': 'true',
    });
    if (icons.caret) {
      chevron.innerHTML = icons.caret;
    } else {
      chevron.textContent = '▾';
    }

    toggle.append(
      el('span', {
        className: `${ns}__palette-section-title`,
        text: section.heading || t(section.headingKey || '', section.headingFallback || section.id),
      }),
      chevron
    );

    const panel = el('div', {
      id: panelId,
      className: `${ns}__palette-panel`,
      role: 'region',
    });
    panel.hidden = index !== 0;

    const list = el('div', {
      className: `${ns}__palette-list`,
      dataset: { blBuilderPalette: section.id },
    });

    (section.types || []).forEach((type) => {
      list.appendChild(
        el(
          'div',
          {
            className: `${ns}__template`,
            // fieldType kept for Forms Sortable drop compatibility.
            dataset: { itemType: type, fieldType: type },
            onClick: () => onAdd(type),
          },
          [
            defaultIcon(type),
            el('span', { className: `${ns}__template-label`, text: typeLabel(type) }),
          ]
        )
      );
    });

    panel.appendChild(list);
    sectionEl.append(toggle, panel);
    body.appendChild(sectionEl);
    sections.push({ id: section.id, sectionEl, toggle, panel, list });

    createSortable(list, {
      group: { name: groupName, pull: 'clone', put: false },
      sort: false,
      animation: 150,
      draggable: `.${ns}__template`,
      onStart: dragStart,
      onEnd: dragEnd,
    });
  });

  return wrap;
}
