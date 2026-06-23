const STORAGE_CONSENT = 'fs_google_translate_consent';
const STORAGE_LANG = 'fs_google_translate_lang';

export let PAGE_LANG = 'de';
export let INCLUDED_LANGUAGES = [];

/**
 * @param {{ pageLang?: string, languages?: string[] }} config
 */
export function configureGoogleTranslate(config = {}) {
  PAGE_LANG = config.pageLang || 'de';
  INCLUDED_LANGUAGES = Array.isArray(config.languages) ? config.languages : [];
}

export function isGoogleTranslateAccepted() {
  try {
    return localStorage.getItem(STORAGE_CONSENT) === '1';
  } catch (e) {
    return false;
  }
}

export function setGoogleTranslateAccepted() {
  try {
    localStorage.setItem(STORAGE_CONSENT, '1');
  } catch (e) {
    // ignore
  }
}

export function getActiveLanguage() {
  if (!isGoogleTranslateAccepted()) {
    return PAGE_LANG;
  }

  try {
    const stored = localStorage.getItem(STORAGE_LANG);
    return stored && stored !== '' ? stored : PAGE_LANG;
  } catch (e) {
    return PAGE_LANG;
  }
}

function getLanguageSwitcherRoot() {
  return document.querySelector('.fs-language-switcher[data-google-translate-toggler]');
}

function updateLanguageSwitcherTrigger(lang) {
  const switcher = getLanguageSwitcherRoot();
  if (!switcher) {
    return;
  }

  const trigger = switcher.querySelector('.fs-language-switcher__trigger');
  const activeItem = switcher.querySelector(
    `.sub-menu [data-language="${CSS.escape(lang)}"]`
  );
  if (!trigger || !activeItem) {
    return;
  }

  const activeFlag = activeItem.querySelector('.fs-lang-item__flag');
  const triggerFlag = trigger.querySelector('.fs-language-switcher__current-flag');
  if (activeFlag && triggerFlag) {
    if (activeFlag.src) {
      triggerFlag.src = activeFlag.src;
    }
    triggerFlag.alt = activeFlag.alt || '';
  }

  trigger.setAttribute('data-language', lang);

  const label = activeItem.querySelector('.fs-lang-item__label')?.textContent?.trim() || '';
  const config = window.fsGoogleTranslate || {};
  const labelTemplate =
    typeof config.triggerLabel === 'string' ? config.triggerLabel : 'Select language, current: %s';
  const labelEmpty =
    typeof config.triggerLabelEmpty === 'string' ? config.triggerLabelEmpty : 'Select language';

  trigger.setAttribute(
    'aria-label',
    label !== '' ? labelTemplate.replace('%s', label) : labelEmpty
  );
}

export function syncLanguageTogglerUI(lang) {
  const switcher = getLanguageSwitcherRoot();
  if (!switcher) {
    return;
  }

  switcher.querySelectorAll('.sub-menu [data-language]').forEach((el) => {
    const itemLang = el.getAttribute('data-language');
    const isActive = itemLang === lang;
    el.classList.toggle('active', isActive);
    el.setAttribute('aria-current', isActive ? 'true' : 'false');
  });

  updateLanguageSwitcherTrigger(lang);
}

function loadGoogleTranslateScript() {
  return new Promise((resolve) => {
    if (window.google && window.google.translate) {
      resolve();
      return;
    }

    window.googleTranslateElementInit = () => resolve();

    const script = document.createElement('script');
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  });
}

let widgetReady = false;

async function ensureWidget() {
  if (widgetReady) {
    return;
  }

  await loadGoogleTranslateScript();

  if (!document.getElementById('google_translate_element')) {
    return;
  }

  const layout =
    window.google?.translate?.TranslateElement?.InlineLayout?.SIMPLE ?? 0;

  new window.google.translate.TranslateElement(
    {
      pageLanguage: PAGE_LANG,
      includedLanguages: INCLUDED_LANGUAGES.join(','),
      autoDisplay: false,
      layout,
    },
    'google_translate_element'
  );

  widgetReady = true;
}

function setGoogTransCookie(lang) {
  const value = lang === PAGE_LANG ? '' : `/${PAGE_LANG}/${lang}`;
  const hostname = window.location.hostname;

  document.cookie = `googtrans=${value};path=/`;

  if (hostname && hostname.indexOf('.') > -1) {
    document.cookie = `googtrans=${value};path=/;domain=${hostname}`;
    document.cookie = `googtrans=${value};path=/;domain=.${hostname}`;
  }
}

function triggerTranslateSelect(lang) {
  const select = document.querySelector('.goog-te-combo');
  if (!select) {
    return false;
  }

  select.value = lang;
  select.dispatchEvent(new Event('change'));
  return true;
}

export async function applyGoogleTranslate(lang) {
  if (!lang || lang === PAGE_LANG) {
    resetToOriginal();
    return;
  }

  await ensureWidget();
  try {
    localStorage.setItem(STORAGE_LANG, lang);
  } catch (e) {
    // ignore
  }
  setGoogTransCookie(lang);

  if (!triggerTranslateSelect(lang)) {
    window.location.reload();
    return;
  }

  syncLanguageTogglerUI(lang);
}

export async function resetToOriginal() {
  try {
    localStorage.removeItem(STORAGE_LANG);
  } catch (e) {
    // ignore
  }

  setGoogTransCookie('');

  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = PAGE_LANG;
    select.dispatchEvent(new Event('change'));
    syncLanguageTogglerUI(PAGE_LANG);
    return;
  }

  if (isGoogleTranslateAccepted()) {
    window.location.reload();
    return;
  }

  syncLanguageTogglerUI(PAGE_LANG);
}

export async function initGoogleTranslateOnLoad() {
  const config = window.fsGoogleTranslate;
  if (config) {
    configureGoogleTranslate(config);
  }

  if (!isGoogleTranslateAccepted()) {
    syncLanguageTogglerUI(PAGE_LANG);
    return;
  }

  const lang = getActiveLanguage();
  if (lang === PAGE_LANG) {
    syncLanguageTogglerUI(PAGE_LANG);
    return;
  }

  await ensureWidget();
  setGoogTransCookie(lang);
  syncLanguageTogglerUI(lang);
}
