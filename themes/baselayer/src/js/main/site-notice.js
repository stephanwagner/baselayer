import { openModal, closeModal, disableClosingModal, enableClosingModal } from '../components/modal';

const MODAL_ID = 'site-notice';
const STORAGE_PREFIX = 'bl_site_notice_';

function storageKey(id) {
  return STORAGE_PREFIX + id;
}

function isDismissed(id, showAgainAfterDays) {
  try {
    const raw = window.localStorage.getItem(storageKey(id));
    if (!raw) {
      return false;
    }
    const dismissedAt = Date.parse(raw);
    if (Number.isNaN(dismissedAt)) {
      return false;
    }
    const days = Math.max(0, Number(showAgainAfterDays) || 0);
    const expiresAt = dismissedAt + days * 24 * 60 * 60 * 1000;
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
}

function rememberDismissal(id) {
  try {
    window.localStorage.setItem(storageKey(id), new Date().toISOString());
  } catch {
    // Ignore quota / private mode errors.
  }
}

function dismissAndClose(id, dismissible) {
  if (dismissible) {
    rememberDismissal(id);
  }
  closeModal(MODAL_ID);
}

function initSiteNotice() {
  const source = document.querySelector('[data-site-notice]');
  if (!(source instanceof HTMLElement)) {
    return;
  }

  const id = source.dataset.siteNoticeId || '';
  if (!id) {
    return;
  }

  const dismissible = source.dataset.siteNoticeDismissible === '1';
  const showAgainAfter = source.dataset.siteNoticeShowAgainAfter || '7';

  if (dismissible && isDismissed(id, showAgainAfter)) {
    return;
  }

  openModal(MODAL_ID, (modalEl) => {
    modalEl.classList.add('site-notice-modal');

    const builtInClose = modalEl.querySelector('.modal__close-button');
    if (builtInClose instanceof HTMLElement) {
      builtInClose.hidden = true;
    }

    if (!dismissible) {
      disableClosingModal(MODAL_ID);
    } else {
      enableClosingModal(MODAL_ID);

      // Overlay click (modal listens on wrapper).
      if (!modalEl.dataset.siteNoticeOverlayBound) {
        modalEl.dataset.siteNoticeOverlayBound = '1';
        modalEl.addEventListener(
          'click',
          (ev) => {
            if (!(ev.target instanceof Element)) {
              return;
            }
            if (!ev.target.closest('.modal__content-container') && modalEl.classList.contains('-open')) {
              rememberDismissal(id);
            }
          },
          true
        );
      }

      // Escape.
      if (!modalEl.dataset.siteNoticeEscBound) {
        modalEl.dataset.siteNoticeEscBound = '1';
        document.addEventListener('keyup', (ev) => {
          if (ev.key === 'Escape' && modalEl.classList.contains('-open')) {
            rememberDismissal(id);
          }
        });
      }
    }

    modalEl.querySelectorAll('[data-site-notice-close]').forEach((btn) => {
      if (!(btn instanceof HTMLElement) || btn.dataset.siteNoticeBound) {
        return;
      }
      btn.dataset.siteNoticeBound = '1';
      btn.addEventListener('click', () => dismissAndClose(id, dismissible));
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteNotice);
} else {
  initSiteNotice();
}
