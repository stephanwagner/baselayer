/**
 * Developer → Blocks settings: search filter and dependent checkbox states.
 */
function initBlockSettingsPage() {
  const form = document.getElementById('fs-block-settings-form');
  if (!form) {
    return;
  }

  const searchInput = form.querySelector('[data-fs-block-settings-search]');
  const rows = [...form.querySelectorAll('[data-fs-block-settings-row]')];
  const groups = [...form.querySelectorAll('[data-fs-block-settings-group]')];

  const syncRowState = (row) => {
    const allowed = row.querySelector('[data-fs-block-settings-allowed]');
    const hiddenCell = row.querySelector('[data-fs-block-settings-hidden]');
    const favoriteCell = row.querySelector('[data-fs-block-settings-favorite]');

    if (!allowed) {
      return;
    }

    const isAllowed = allowed.checked;

    row.querySelectorAll('[data-fs-block-settings-hidden], [data-fs-block-settings-favorite]').forEach((input) => {
      const td = input.closest('td');
      if (!td) {
        return;
      }

      if (!isAllowed) {
        input.checked = false;
        input.disabled = true;
        td.classList.add('is-disabled');
      } else {
        input.disabled = false;
        td.classList.remove('is-disabled');
      }
    });

    if (hiddenCell && hiddenCell.checked && favoriteCell) {
      favoriteCell.checked = false;
      favoriteCell.disabled = true;
      favoriteCell.closest('td')?.classList.add('is-disabled');
    }
  };

  rows.forEach((row) => {
    syncRowState(row);

    row.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      if (target.matches('[data-fs-block-settings-allowed]')) {
        syncRowState(row);
      }

      if (target.matches('[data-fs-block-settings-hidden]') && target.checked) {
        const favorite = row.querySelector('[data-fs-block-settings-favorite]');
        if (favorite instanceof HTMLInputElement) {
          favorite.checked = false;
        }
      }

      syncRowState(row);
    });
  });

  const filterRows = (query) => {
    const needle = query.trim().toLowerCase();

    rows.forEach((row) => {
      const haystack = row.getAttribute('data-search') || '';
      const match = needle === '' || haystack.includes(needle);
      row.hidden = !match;
    });

    groups.forEach((group) => {
      const visibleRows = group.querySelectorAll('[data-fs-block-settings-row]:not([hidden])');
      group.hidden = visibleRows.length === 0;
    });
  };

  if (searchInput instanceof HTMLInputElement) {
    searchInput.addEventListener('input', () => filterRows(searchInput.value));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlockSettingsPage);
} else {
  initBlockSettingsPage();
}
