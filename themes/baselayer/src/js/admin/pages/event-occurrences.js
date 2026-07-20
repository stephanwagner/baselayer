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
  let currentMasterId = 0;

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
        return;
      }
      const restoreBtn = t && t.closest ? t.closest('[data-bl-occ-restore]') : null;
      if (restoreBtn) {
        e.preventDefault();
        restoreOccurrence(restoreBtn);
        return;
      }
      const deleteBtn = t && t.closest ? t.closest('[data-bl-occ-delete]') : null;
      if (deleteBtn) {
        e.preventDefault();
        deleteOccurrence(deleteBtn);
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

  function activeOccurrenceCount(items) {
    return (items || []).filter(function (item) {
      return !item.deleted;
    }).length;
  }

  function updateListButtonCount(masterId, items) {
    const btn = document.querySelector(
      '.bl-event-edit-occurrences[data-master-id="' + String(masterId) + '"]'
    );
    if (!btn) {
      return;
    }
    const base = L.editOccurrencesLabel || 'Edit occurrences';
    const count = activeOccurrenceCount(items);
    btn.textContent = count > 0 ? base + ' (' + count + ')' : base;
  }

  function showBodyError(bodyEl, message) {
    bodyEl.innerHTML =
      '<p class="bl-event-occurrences-modal__empty">' +
      escapeHtml(message || L.errorLabel || 'Could not load occurrences.') +
      '</p>';
  }

  function showActionError(bodyEl, message) {
    if (!bodyEl) {
      return;
    }
    const existing = bodyEl.querySelector('.bl-event-occurrences-modal__error');
    if (existing) {
      existing.remove();
    }
    const p = document.createElement('p');
    p.className = 'bl-event-occurrences-modal__error notice notice-error';
    p.textContent = message || L.actionErrorLabel || 'Something went wrong. Please try again.';
    bodyEl.insertBefore(p, bodyEl.firstChild);
  }

  function renderList(bodyEl, items) {
    if (!items.length) {
      bodyEl.innerHTML =
        '<p class="bl-event-occurrences-modal__empty">' + escapeHtml(L.empty || 'No upcoming occurrences.') + '</p>';
      return;
    }
    let html = '<ul class="bl-event-occurrences-modal__list">';
    items.forEach(function (item) {
      const range = item.range_text || item.start_date || '';
      const edit = item.edit_link || '';
      const deleted = !!item.deleted;
      html +=
        '<li class="bl-event-occurrences-modal__item' +
        (deleted ? ' is-deleted' : '') +
        '">';
      html += '<div class="bl-event-occurrences-modal__item-main">';
      html += '<span class="bl-event-occurrences-modal__date">' + escapeHtml(range) + '</span>';
      if (deleted) {
        html +=
          ' <span class="bl-event-occurrences-modal__badge bl-event-occurrences-modal__badge--deleted">' +
          escapeHtml(L.deletedLabel || 'Deleted') +
          '</span>';
      } else if (item.detached) {
        html +=
          ' <span class="bl-event-occurrences-modal__badge">' +
          escapeHtml(L.customContent || 'Custom content') +
          '</span>';
      }
      if (!deleted && item.status_key && item.status_key !== 'active' && item.status_label) {
        html +=
          ' <span class="bl-event-occurrences-modal__badge bl-event-occurrences-modal__badge--status" style="--bl-status-color:' +
          escapeAttr(item.status_color || '') +
          '">' +
          escapeHtml(item.status_label) +
          '</span>';
      }
      html += '</div>';
      html += '<div class="bl-event-occurrences-modal__actions">';
      if (deleted && item.start_date) {
        html +=
          '<button type="button" class="button-link bl-event-occurrences-modal__restore" data-bl-occ-restore data-start-date="' +
          escapeAttr(item.start_date) +
          '">' +
          escapeHtml(L.restoreLabel || 'Restore') +
          '</button>';
      } else if (!deleted) {
        if (edit) {
          html +=
            '<a class="bl-event-occurrences-modal__edit" href="' +
            escapeAttr(edit) +
            '">' +
            escapeHtml(L.editLabel || 'Edit') +
            '</a>';
        }
        if (item.id) {
          html +=
            '<button type="button" class="button-link bl-event-occurrences-modal__delete" data-bl-occ-delete data-occurrence-id="' +
            escapeAttr(String(item.id)) +
            '" data-detached="' +
            (item.detached ? '1' : '0') +
            '">' +
            escapeHtml(L.deleteLabel || 'Delete') +
            '</button>';
        }
      }
      html += '</div>';
      html += '</li>';
    });
    html += '</ul>';
    bodyEl.innerHTML = html;
  }

  function parseErrorMessage(res, data) {
    if (data && data.message) {
      return String(data.message);
    }
    if (data && data.code) {
      return String(data.code);
    }
    return L.actionErrorLabel || L.errorLabel || 'Something went wrong. Please try again.';
  }

  function postJson(url, body) {
    return window.fetch(url, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': L.restNonce || '',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then(function (res) {
      return res.json().catch(function () {
        return null;
      }).then(function (data) {
        if (!res.ok) {
          const err = new Error(parseErrorMessage(res, data));
          err.response = data;
          throw err;
        }
        return data;
      });
    });
  }

  function refreshFromResponse(data) {
    const items = (data && data.occurrences) || [];
    const bodyEl = overlay && overlay.querySelector('.bl-event-occurrences-modal__body');
    if (bodyEl) {
      renderList(bodyEl, items);
    }
    if (currentMasterId) {
      updateListButtonCount(currentMasterId, items);
    }
  }

  function restoreOccurrence(btn) {
    if (!L.restoreUrl || !currentMasterId || btn.disabled) {
      return;
    }
    const startDate = btn.getAttribute('data-start-date') || '';
    if (!startDate) {
      return;
    }
    btn.disabled = true;
    postJson(L.restoreUrl, {
      master_id: currentMasterId,
      start_date: startDate,
    })
      .then(refreshFromResponse)
      .catch(function (err) {
        btn.disabled = false;
        const bodyEl = overlay && overlay.querySelector('.bl-event-occurrences-modal__body');
        showActionError(bodyEl, err && err.message);
      });
  }

  function deleteOccurrence(btn) {
    if (!L.softDeleteUrl || !currentMasterId || btn.disabled) {
      return;
    }
    const occurrenceId = parseInt(btn.getAttribute('data-occurrence-id') || '0', 10);
    if (!occurrenceId) {
      return;
    }
    const detached = btn.getAttribute('data-detached') === '1';
    const msg = detached
      ? L.deleteDetachedConfirm || L.deleteConfirm || 'Delete this occurrence?'
      : L.deleteConfirm || 'Delete this occurrence?';
    if (!window.confirm(msg)) {
      return;
    }
    btn.disabled = true;
    postJson(L.softDeleteUrl, {
      master_id: currentMasterId,
      occurrence_id: occurrenceId,
    })
      .then(refreshFromResponse)
      .catch(function (err) {
        btn.disabled = false;
        const bodyEl = overlay && overlay.querySelector('.bl-event-occurrences-modal__body');
        showActionError(bodyEl, err && err.message);
      });
  }

  function openModal(masterId, masterTitle) {
    const modal = ensureModal();
    const titleEl = modal.querySelector('.bl-event-occurrences-modal__title');
    const bodyEl = modal.querySelector('.bl-event-occurrences-modal__body');
    currentMasterId = masterId;
    const heading = (L.modalTitle || 'Occurrences') + (masterTitle ? ' – ' + masterTitle : '');
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
        return res.json().catch(function () {
          return null;
        }).then(function (data) {
          if (!res.ok) {
            throw new Error(parseErrorMessage(res, data));
          }
          return data;
        });
      })
      .then(function (data) {
        const items = (data && data.occurrences) || [];
        renderList(bodyEl, items);
        updateListButtonCount(masterId, items);
      })
      .catch(function (err) {
        showBodyError(bodyEl, err && err.message);
      });
  }

  function closeModal() {
    if (!overlay) {
      return;
    }
    overlay.setAttribute('hidden', 'hidden');
    document.body.classList.remove('bl-event-occurrences-modal-open');
    currentMasterId = 0;
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
