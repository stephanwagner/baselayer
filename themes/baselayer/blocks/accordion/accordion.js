import { scrollToElement, getOffset } from '../../src/js/utils/scroll-to-element';
import { slideDown, slideUp } from '../../src/js/utils/slide';
import { closeMenu } from '../../src/js/main/menu-state';
import config from '../../src/js/config';

const SCOPE = '.bl-wp-block.-baselayer-block';
const WRAPPER = `${SCOPE}.accordion__wrapper`;

/**
 * Toggle an accordion
 */
document.querySelectorAll(`${SCOPE} .accordion__header`).forEach((header) => {
  header.addEventListener('click', onHeaderActivate);
  header.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') {
      return;
    }
    onHeaderActivate(e);
  });
});

function onHeaderActivate(e) {
  const header = e.currentTarget;
  const wrapper = header.closest('.accordion__wrapper');
  if (!wrapper) {
    return;
  }
  if (wrapper.classList.contains('accordion-open')) {
    closeAccordion(wrapper);
    return;
  }
  openAccordionWithNeighbours(wrapper);
}

/**
 * @param {Element|null} accordionWrapper
 */
function navigateToAccordion(accordionWrapper) {
  if (!accordionWrapper) {
    return;
  }
  openAccordionWithNeighbours(accordionWrapper, { scrollAfterOpen: true });
}

/**
 * @param {string} hash
 */
function scrollToAccordionByHash(hash) {
  if (!hash) {
    return;
  }
  const hashId = hash.replace('#', '');
  const accordionWrapper = document.querySelector(`${WRAPPER}[data-accordion-id="${CSS.escape(hashId)}"]`);
  navigateToAccordion(accordionWrapper);
}

if (document.querySelector(`${WRAPPER}[data-accordion-id]`)) {
  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const hrefSplit = href.split('#');
    const hashId = hrefSplit[hrefSplit.length - 1];
    if (!hashId) {
      return;
    }
    const accordionWrapper = document.querySelector(`${WRAPPER}[data-accordion-id="${CSS.escape(hashId)}"]`);
    if (!accordionWrapper) {
      return;
    }
    link.addEventListener('click', () => {
      closeMenu();
      navigateToAccordion(accordionWrapper);
    });
  });
}

window.addEventListener('load', () => {
  scrollToAccordionByHash(window.location.hash);
});

/**
 * @param {Element} wrapper
 * @returns {Element[]}
 */
function neighbouringAccordionWrappers(wrapper) {
  const matches = (el) => el && el.matches && el.matches(WRAPPER);
  const siblings = [];
  let prev = wrapper.previousElementSibling;
  while (matches(prev)) {
    siblings.push(prev);
    prev = prev.previousElementSibling;
  }
  let next = wrapper.nextElementSibling;
  while (matches(next)) {
    siblings.push(next);
    next = next.nextElementSibling;
  }
  return siblings;
}

/**
 * @param {Element} wrapper
 * @param {object} [options]
 */
function openAccordionWithNeighbours(wrapper, options = {}) {
  if (wrapper.getAttribute('data-close-neighbouring-accordions') === 'true') {
    neighbouringAccordionWrappers(wrapper).forEach((item) => {
      if (item.classList.contains('accordion-open')) {
        closeAccordion(item);
      }
    });
  }
  openAccordion(wrapper, options);
}

/**
 * @param {Element} wrapper
 * @param {object} [options]
 */
function openAccordion(wrapper, options = {}) {
  const scrollAfterOpen = options.scrollAfterOpen === true;
  const content = wrapper.querySelector('.accordion__content');

  if (wrapper.classList.contains('accordion-open')) {
    if (scrollAfterOpen || wrapper.getAttribute('data-scroll-to-accordion-top') === 'true') {
      scrollToElement(wrapper, getOffset());
    }
    return;
  }

  wrapper.classList.add('accordion-open');
  wrapper.setAttribute('aria-expanded', 'true');
  const header = wrapper.querySelector('.accordion__header');
  if (header) {
    header.setAttribute('aria-expanded', 'true');
  }

  slideDown(content, {
    duration: config.transitionDuration,
    complete: () => {
      if (scrollAfterOpen) {
        scrollToElement(wrapper, getOffset());
      } else if (wrapper.getAttribute('data-scroll-to-accordion-top') === 'true') {
        scrollToElement(wrapper, getOffset());
      }
    },
  });
}

/**
 * @param {Element} wrapper
 */
function closeAccordion(wrapper) {
  wrapper.classList.remove('accordion-open');
  wrapper.setAttribute('aria-expanded', 'false');
  const header = wrapper.querySelector('.accordion__header');
  if (header) {
    header.setAttribute('aria-expanded', 'false');
  }
  slideUp(wrapper.querySelector('.accordion__content'), {
    duration: config.transitionDuration,
  });
}
