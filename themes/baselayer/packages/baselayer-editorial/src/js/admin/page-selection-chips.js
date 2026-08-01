/**
 * Render selected pages as wrapping chips inside a list container.
 *
 * @param {HTMLElement} container - Typically a `.bl-editorial-selected-pages` ul
 * @param {Array<{id:number,title?:string,url?:string}>} pages
 * @param {object} [options]
 * @param {string} [options.inputName='']
 * @param {string} [options.emptyLabel='No pages selected.']
 * @param {string} [options.removeLabel='Remove']
 * @param {(pages: Array<{id:number,title:string,url:string}>) => void} [options.onChange]
 */
export function renderPageSelectionChips(container, pages, options = {}) {
  if (!container) {
    return;
  }

  const opts = {
    inputName: '',
    emptyLabel: 'No pages selected.',
    removeLabel: 'Remove',
    onChange: null,
    ...options,
  };

  const list = Array.isArray(pages)
    ? pages
        .map((page) => ({
          id: Number(page && page.id) || 0,
          title: (page && page.title) || '',
          url: (page && page.url) || '',
        }))
        .filter((page) => page.id > 0)
    : [];

  container.replaceChildren();

  if (!list.length) {
    const empty = document.createElement('li');
    empty.className = 'bl-editorial-selected-pages__empty description';
    empty.textContent = opts.emptyLabel || container.dataset.empty || 'No pages selected.';
    container.appendChild(empty);
    if (typeof opts.onChange === 'function') {
      opts.onChange([]);
    }
    return;
  }

  list.forEach((page) => {
    const li = document.createElement('li');
    li.dataset.id = String(page.id);
    li.className = 'bl-editorial-selected-pages__chip';

    if (opts.inputName) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = opts.inputName;
      input.value = String(page.id);
      li.appendChild(input);
    }

    const title = document.createElement('span');
    title.className = 'bl-editorial-selected-pages__title';
    title.textContent = page.title || `#${page.id}`;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'button-link bl-editorial-remove-page';
    remove.setAttribute('aria-label', opts.removeLabel);
    remove.textContent = '×';

    li.append(title, remove);
    container.appendChild(li);
  });

  if (typeof opts.onChange === 'function') {
    opts.onChange(list);
  }
}

window.baselayerRenderPageSelectionChips = renderPageSelectionChips;
