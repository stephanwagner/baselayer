/**
 * Events list: Edit occurrences modal (upcoming only).
 */
(function () {
  'use strict';

  const L = typeof baselayerEventOccurrences !== 'undefined' ? baselayerEventOccurrences : null;
  if (!L || !L.restUrl) {
    return;
  }

  const list = document.querySelector('.wp-list-table');
  if (!list) {
    return;
  }

  let overlay = null;

  function ensureModal() {
    if (overlay) {
      return overlay;
    }
    overlay = document.createElement('div');
    overlay.className = 'bl-event-occurrences-modal';
    overlay.setAttribute('hidden', 'hidden');
    overlay.innerHTML =
      '<div class="bl-event-occurrences-modal__backdrop" data-bl-occ-close></div>' +
      '<div class="bl-event-occurrences-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="bl-event-occ-title">' +
      '<div class="bl-event-occurrences-modal__header">' +
      '<h2 id="bl-event-occ-title" class="bl-event-occurrences-modal__title"></h2>' +
      '<button type="button" class="bl-event-occurrences-modal__close" data-bl-occ-close aria-label="' +
      escapeAttr(L.closeLabel || 'Close') +
      '">&times;</button>' +
      '</div>' +
      '<div class="bl-event-occurrences-modal__body"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      const t = e.target;
      if (t && t.closest && t.closest('[data-bl-occ-close]')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && !overlay.hasAttribute('hidden')) {
        closeModal();
      }
    });

    return overlay;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openModal(masterId, masterTitle) {
    const modal = ensureModal();
    const titleEl = modal.querySelector('.bl-event-occurrences-modal__title');
    const bodyEl = modal.querySelector('.bl-event-occurrences-modal__body');
    const heading = (L.modalTitle || 'Occurrences') + (masterTitle ? ' — ' + masterTitle : '');
    titleEl.textContent = heading;
    bodyEl.innerHTML = '<p class="bl-event-occurrences-modal__loading">' + escapeHtml(L.loadingLabel || 'Loading…') + '</p>';
    modal.removeAttribute('hidden');
    document.body.classList.add('bl-event-occurrences-modal-open');

    window
      .fetch(L.restUrl + encodeURIComponent(String(masterId)), {
        method: 'GET',
        headers: {
          'X-WP-Nonce': L.restNonce || '',
          Accept: 'application/json',
        },
      })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('bad status');
        }
        return res.json();
      })
      .then(function (data) {
        const items = (data && data.occurrences) || [];
        if (!items.length) {
          bodyEl.innerHTML =
            '<p class="bl-event-occurrences-modal__empty">' + escapeHtml(L.empty || 'No upcoming occurrences.') + '</p>';
          return;
        }
        let html = '<ul class="bl-event-occurrences-modal__list">';
        items.forEach(function (item) {
          const range = item.range_text || item.start_date || '';
          const edit = item.edit_link || '';
          html += '<li class="bl-event-occurrences-modal__item">';
          html += '<div class="bl-event-occurrences-modal__item-main">';
          html += '<span class="bl-event-occurrences-modal__date">' + escapeHtml(range) + '</span>';
          if (item.detached) {
            html +=
              ' <span class="bl-event-occurrences-modal__badge">' +
              escapeHtml(L.customContent || 'Custom content') +
              '</span>';
          }
          html += '</div>';
          if (edit) {
            html +=
              '<a class="bl-event-occurrences-modal__edit" href="' +
              escapeAttr(edit) +
              '">' +
              escapeHtml(L.editLabel || 'Edit') +
              '</a>';
          }
          html += '</li>';
        });
        html += '</ul>';
        bodyEl.innerHTML = html;
      })
      .catch(function () {
        bodyEl.innerHTML =
          '<p class="bl-event-occurrences-modal__empty">' + escapeHtml(L.errorLabel || 'Could not load occurrences.') + '</p>';
      });
  }

  function closeModal() {
    if (!overlay) {
      return;
    }
    overlay.setAttribute('hidden', 'hidden');
    document.body.classList.remove('bl-event-occurrences-modal-open');
  }

  list.addEventListener('click', function (e) {
    const btn = e.target && e.target.closest ? e.target.closest('.bl-event-edit-occurrences') : null;
    if (!btn) {
      return;
    }
    e.preventDefault();
    const id = parseInt(btn.getAttribute('data-master-id') || '0', 10);
    if (!id) {
      return;
    }
    openModal(id, btn.getAttribute('data-master-title') || '');
  });
})();
