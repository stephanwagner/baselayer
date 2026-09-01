import { scrollToElement, getOffset } from '../../../src/js/utils/scroll-to-element';
import { closeMenu } from '../../../src/js/main/menu-state';

const ANCHOR = '[data-anchor-id]';
const ACCORDION = '.bl-wp-block.-acf-block.accordion__wrapper';

function getHashIdFromHref(href) {
  if (!href || typeof href !== 'string' || href.indexOf('#') === -1) {
    return '';
  }

  const hashId = href.split('#').pop();
  return hashId ? decodeURIComponent(hashId) : '';
}

function isSamePageHashLink(href) {
  if (!href || typeof href !== 'string') {
    return false;
  }

  if (href.charAt(0) === '#') {
    return true;
  }

  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin && url.pathname === window.location.pathname;
  } catch {
    return false;
  }
}

function isAccordionHash(hashId) {
  if (!hashId) {
    return false;
  }

  return !!document.querySelector(`${ACCORDION}[data-accordion-id="${CSS.escape(hashId)}"]`);
}

function scrollToAnchor(anchorEl) {
  let targetEl = anchorEl.nextElementSibling || anchorEl;
  if (!targetEl || !anchorEl) {
    return;
  }

  let offset = getOffset();
  const offsetAttr = anchorEl.getAttribute('data-anchor-offset');
  if (offsetAttr) {
    offset += parseInt(offsetAttr, 10);
  }

  scrollToElement(targetEl, offset);
}

function scrollToAnchorByHash(hash) {
  if (!hash) {
    return;
  }

  const hashId = hash.replace(/^#/, '');
  if (!hashId || isAccordionHash(hashId)) {
    return;
  }

  const anchorEl = document.querySelector(`[data-anchor-id="${CSS.escape(hashId)}"]`);
  if (anchorEl) {
    scrollToAnchor(anchorEl);
  }
}

if (document.querySelector(ANCHOR)) {
  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const hashId = getHashIdFromHref(href);

    if (!hashId || isAccordionHash(hashId)) {
      return;
    }

    const anchorEl = document.querySelector(`[data-anchor-id="${CSS.escape(hashId)}"]`);
    if (!anchorEl) {
      return;
    }

    link.addEventListener('click', (e) => {
      const currentHref = link.getAttribute('href') || '';
      const currentHashId = getHashIdFromHref(currentHref);

      if (!currentHashId || isAccordionHash(currentHashId) || !isSamePageHashLink(currentHref)) {
        return;
      }

      e.preventDefault();
      closeMenu();

      if (window.location.hash !== '#' + currentHashId) {
        history.pushState(null, '', '#' + currentHashId);
      }

      scrollToAnchor(anchorEl);
    });
  });
}

function checkActiveNav() {
  const anchors = Array.from(document.querySelectorAll(ANCHOR)).reverse();
  const windowTop = window.scrollY || document.documentElement.scrollTop;
  const menuItems = document.querySelectorAll('header .menu-item');

  menuItems.forEach((item) => item.classList.remove('-current-active'));

  for (const item of anchors) {
    const id = item.getAttribute('data-anchor-id');
    let itemTop = item.getBoundingClientRect().top + windowTop;
    if (item.nextElementSibling) {
      itemTop = item.nextElementSibling.getBoundingClientRect().top + windowTop;
    }

    const offset = getOffset() * -1 + 4;

    if (windowTop >= 16 && windowTop > itemTop - offset) {
      menuItems.forEach((menuItem) => {
        const link = menuItem.querySelector(`:scope > a[href*="#${CSS.escape(id)}"]`);
        if (link) {
          menuItem.classList.add('-current-active');
        }
      });
      break;
    }
  }
}

window.addEventListener('scroll', checkActiveNav, { passive: true });
window.addEventListener('resize', checkActiveNav);
checkActiveNav();

window.addEventListener('load', () => {
  scrollToAnchorByHash(window.location.hash);
});
