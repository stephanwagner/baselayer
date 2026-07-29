import { openModal, closeModal, disableClosingModal, enableClosingModal } from '../components/modal';

const MODAL_ID = 'site-notice';
const STORAGE_PREFIX = 'bl_site_notice_';

function storageKey(id) {
  return STORAGE_PREFIX + id;
}

function shouldSuppressNotice(id, showAgain, showAgainAfterDays) {
  try {
    const key = storageKey(id);

    if (showAgain === 'always') {
      return false;
    }

    if (showAgain === 'never') {
      return window.localStorage.getItem(key) !== null;
    }

    if (showAgain === 'session') {
      return window.sessionStorage.getItem(key) !== null;
    }

    // showAgain === 'after'
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return false;
    }
    const shownAt = Date.parse(raw);
    if (Number.isNaN(shownAt)) {
      return false;
    }

    const days = Math.max(0, Number(showAgainAfterDays) || 0);
    const expiresAt = shownAt + days * 24 * 60 * 60 * 1000;
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
}

function rememberNoticeShown(id, showAgain) {
  try {
    const key = storageKey(id);

    if (showAgain === 'always') {
      return;
    }

    // "After" and "never" are persisted in localStorage; "session" uses sessionStorage.
    if (showAgain === 'session') {
      window.sessionStorage.setItem(key, new Date().toISOString());
      return;
    }

    window.localStorage.setItem(key, new Date().toISOString());
  } catch {
    // Ignore quota / private mode errors.
  }
}

function closeSiteNotice() {
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

  const showCloseButton = source.dataset.siteNoticeShowClose === '1';
  const showAgain = source.dataset.siteNoticeShowAgain || 'session';
  const showAgainAfter = source.dataset.siteNoticeShowAgainAfter || '7';

  if (shouldSuppressNotice(id, showAgain, showAgainAfter)) {
    return;
  }

  openModal(MODAL_ID, (modalEl) => {
    modalEl.classList.add('site-notice-modal');
    rememberNoticeShown(id, showAgain);

    const builtInClose = modalEl.querySelector('.modal__close-button');
    if (builtInClose instanceof HTMLElement) {
      builtInClose.hidden = true;
    }

    if (!showCloseButton) {
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
              closeSiteNotice();
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
            closeSiteNotice();
          }
        });
      }
    }

    modalEl.querySelectorAll('[data-site-notice-close]').forEach((btn) => {
      if (!(btn instanceof HTMLElement) || btn.dataset.siteNoticeBound) {
        return;
      }
      btn.dataset.siteNoticeBound = '1';
      btn.addEventListener('click', () => closeSiteNotice());
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteNotice);
} else {
  initSiteNotice();
}
