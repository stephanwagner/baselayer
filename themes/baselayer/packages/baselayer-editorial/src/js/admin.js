import { openPagePicker } from './admin/page-picker.js';

(function () {
  'use strict';

  const cfg = typeof window.blEditorialAdmin !== 'undefined' ? window.blEditorialAdmin : {};
  const i18n = cfg.i18n || {};

  function closestRightsRoot(node) {
    return node && node.closest ? node.closest('[data-bl-editorial-rights]') : null;
  }

  function syncPageAccess(root) {
    if (!root) return;
    const selected = root.querySelector('.bl-editorial-page-access[value="selected"]');
    const wrap = root.querySelector('.bl-editorial-page-picker-wrap');
    if (!wrap) return;
    wrap.hidden = !(selected && selected.checked);
  }

  function renderSelectedList(list, pages, inputName) {
    list.replaceChildren();
    if (!pages.length) {
      const empty = document.createElement('li');
      empty.className = 'bl-editorial-selected-pages__empty description';
      empty.textContent = list.dataset.empty || i18n.noPagesSelected || 'No pages selected.';
      list.appendChild(empty);
      return;
    }

    pages.forEach((page) => {
      const li = document.createElement('li');
      li.dataset.id = String(page.id);

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = inputName;
      input.value = String(page.id);

      const title = document.createElement('span');
      title.className = 'bl-editorial-selected-pages__title';
      title.textContent = page.title || `#${page.id}`;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'button-link bl-editorial-remove-page';
      remove.setAttribute('aria-label', i18n.remove || 'Remove');
      remove.textContent = '×';

      li.append(input, title, remove);
      list.appendChild(li);
    });
  }

  function currentSelectedPages(list) {
    return Array.from(list.querySelectorAll('li[data-id]')).map((li) => ({
      id: Number(li.dataset.id) || 0,
      title: (li.querySelector('.bl-editorial-selected-pages__title') || {}).textContent || '',
      url: '',
    })).filter((p) => p.id > 0);
  }

  function inputNameForList(list) {
    const existing = list.querySelector('input[type="hidden"][name]');
    if (existing) {
      return existing.name;
    }
    const root = closestRightsRoot(list);
    const sample = root && root.querySelector('input[name*="[post_types]"]');
    if (sample && sample.name) {
      return sample.name.replace('[post_types][]', '[allowed_page_ids][]');
    }
    return 'bl_editorial_rights[allowed_page_ids][]';
  }

  document.addEventListener('change', (evt) => {
    const target = evt.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.id === 'bl-editorial-enable-rights') {
      const fields = document.getElementById('bl-editorial-rights-fields');
      if (fields) {
        fields.hidden = !target.checked;
      }
      return;
    }

    if (target.classList.contains('bl-editorial-page-access')) {
      syncPageAccess(closestRightsRoot(target));
    }
  });

  document.addEventListener('click', async (evt) => {
    const target = evt.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.classList.contains('bl-editorial-remove-page')) {
      const li = target.closest('li');
      const list = target.closest('.bl-editorial-selected-pages');
      if (li) li.remove();
      if (list && !list.querySelector('li[data-id]')) {
        renderSelectedList(list, [], inputNameForList(list));
      }
      return;
    }

    if (target.classList.contains('bl-editorial-pick-pages')) {
      const root = closestRightsRoot(target);
      if (!root) return;
      const list = root.querySelector('.bl-editorial-selected-pages');
      if (!list) return;

      const current = currentSelectedPages(list);
      const result = await openPagePicker({
        multi: true,
        selectedIds: current.map((p) => p.id),
        title: i18n.selectPages || 'Select pages',
        searchPlaceholder: i18n.searchPages || 'Search pages…',
        empty: i18n.noPages || 'No pages found.',
        loading: i18n.loading || 'Loading…',
        cancelLabel: i18n.cancel || 'Cancel',
        selectLabel: i18n.select || 'Select',
        restUrl: cfg.pagesRestUrl || '',
        restNonce: cfg.restNonce || '',
      });

      if (!result) return;
      const pages = Array.isArray(result) ? result : [result];
      // Preserve titles from previous selection when picker returned empty titles.
      const merged = pages.map((page) => {
        const prev = current.find((c) => c.id === page.id);
        return {
          id: page.id,
          title: page.title || (prev && prev.title) || `#${page.id}`,
          url: page.url || '',
        };
      });
      renderSelectedList(list, merged, inputNameForList(list));
      return;
    }

    if (target.classList.contains('bl-editorial-apply-defaults')) {
      const json = document.getElementById('bl-editorial-site-defaults');
      if (!json) return;
      let defaults;
      try {
        defaults = JSON.parse(json.textContent || '{}');
      } catch (e) {
        return;
      }
      applyDefaultsToProfile(defaults);
    }
  });

  function applyDefaultsToProfile(defaults) {
    const root = document.getElementById('bl-editorial-rights-fields');
    if (!root) return;

    root.querySelectorAll('.bl-editorial-post-type').forEach((input) => {
      input.checked = Array.isArray(defaults.post_types) && defaults.post_types.includes(input.value);
    });

    const own = root.querySelector('#bl-editorial-user-own');
    if (own) own.checked = !!defaults.own_posts_only;

    const media = root.querySelector('#bl-editorial-user-media');
    if (media) media.checked = !!defaults.media_own_only;

    root.querySelectorAll('input[name="bl_editorial_rights[publish_mode]"]').forEach((input) => {
      input.checked = input.value === (defaults.publish_mode || 'direct');
    });

    root.querySelectorAll('.bl-editorial-page-access').forEach((input) => {
      input.checked = input.value === (defaults.page_access || 'all');
    });

    const list = root.querySelector('.bl-editorial-selected-pages');
    if (list) {
      const pages = (defaults.allowed_page_ids || []).map((id) => ({
        id: Number(id) || 0,
        title: `#${id}`,
        url: '',
      })).filter((p) => p.id > 0);
      renderSelectedList(list, pages, 'bl_editorial_rights[allowed_page_ids][]');
    }

    syncPageAccess(root.querySelector('[data-bl-editorial-rights]'));
    const enable = document.getElementById('bl-editorial-enable-rights');
    if (enable) {
      enable.checked = true;
      root.hidden = false;
    }
  }

  document.querySelectorAll('[data-bl-editorial-rights]').forEach((root) => {
    syncPageAccess(root);
    const list = root.querySelector('.bl-editorial-selected-pages');
    if (list && !list.querySelector('li[data-id]')) {
      renderSelectedList(list, [], inputNameForList(list));
    }
  });
})();
