import { closeMenu } from '../main/menu';
import { closeModal, openModal } from './modal';
import {
  PAGE_LANG,
  applyGoogleTranslate,
  getActiveLanguage,
  initGoogleTranslateOnLoad,
  isGoogleTranslateAccepted,
  resetToOriginal,
  setGoogleTranslateAccepted,
  syncLanguageTogglerUI,
} from '../google-translate/google-translate';

const MODAL_ID = 'google-translate-consent';
let pendingLang = null;

function initGoogleTranslateConsentModal() {
  document
    .querySelector('[data-google-translate-accept]')
    ?.addEventListener('click', () => {
      setGoogleTranslateAccepted();
      closeModal(MODAL_ID);
      const lang = pendingLang;
      pendingLang = null;
      if (lang) {
        applyGoogleTranslate(lang);
      }
    });

  document
    .querySelectorAll(
      '[data-google-translate-decline], [data-modal-close="google-translate-consent"]'
    )
    .forEach((el) => {
      el.addEventListener('click', () => {
        pendingLang = null;
        closeModal(MODAL_ID);
      });
    });
}

function initLanguageToggler() {
  const items = document.querySelectorAll(
    '.fs-language-toggler [data-language]'
  );

  if (!items.length) {
    return;
  }

  items.forEach((item) => {
    item.addEventListener('click', (ev) => {
      ev.preventDefault();
      const lang = item.getAttribute('data-language');
      if (!lang) {
        return;
      }

      if (lang === PAGE_LANG) {
        if (getActiveLanguage() !== PAGE_LANG) {
          resetToOriginal();
        } else {
          syncLanguageTogglerUI(PAGE_LANG);
        }
        closeMenu();
        return;
      }

      if (!isGoogleTranslateAccepted()) {
        pendingLang = lang;
        openModal(MODAL_ID);
        closeMenu();
        return;
      }

      applyGoogleTranslate(lang);
      closeMenu();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('[data-google-translate-toggler]')) {
    return;
  }

  initGoogleTranslateOnLoad();
  initGoogleTranslateConsentModal();
  initLanguageToggler();
});
