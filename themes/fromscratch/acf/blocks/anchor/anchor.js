import $ from 'jquery';

import { scrollToElement, getOffset } from '../../../src/js/utils/scroll-to-element';
import { closeMenu } from '../../../src/js/main/menu';

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

  return $('.accordion__wrapper[data-accordion-id="' + hashId + '"]').length > 0;
}

function scrollToAnchor(anchorEl) {
  let targetEl = anchorEl;
  if (anchorEl.next().length) {
    targetEl = anchorEl.next();
  }
  if (!targetEl.length || !anchorEl.length) {
    return;
  }

  let offset = getOffset();
  if (anchorEl.attr('data-anchor-offset')) {
    offset += parseInt(anchorEl.attr('data-anchor-offset'), 10);
  }

  scrollToElement(targetEl[0], offset);
}

function scrollToAnchorByHash(hash) {
  if (!hash) {
    return;
  }

  const hashId = hash.replace(/^#/, '');
  if (!hashId || isAccordionHash(hashId)) {
    return;
  }

  const anchorEl = $('[data-anchor-id="' + hashId + '"]').first();
  if (anchorEl.length) {
    scrollToAnchor(anchorEl);
  }
}

if ($('[data-anchor-id]').length) {
  $('a[href*="#"]').each(function (index, item) {
    const link = $(item);
    const href = link.attr('href');
    const hashId = getHashIdFromHref(href);

    if (!hashId || isAccordionHash(hashId)) {
      return;
    }

    const anchorEl = $('[data-anchor-id="' + hashId + '"]').first();
    if (!anchorEl.length) {
      return;
    }

    link.on('click', function (e) {
      const currentHref = link.attr('href');
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

var checkActiveNav = function () {
  $($('[data-anchor-id]').get().reverse()).each(function (index, item) {
    var id = $(item).attr('data-anchor-id');
    var windowTop = $(document).scrollTop();
    let itemTop = $(item).offset().top;
    if ($(item).next().length) {
      itemTop = $(item).next().offset().top;
    }
    $('header .menu-item').removeClass('-current-active');

    let offset = getOffset() * -1 + 4;

    if (windowTop >= 16 && windowTop > itemTop - offset) {
      $('header .menu-item').each(function (index, item) {
        const link = $(item).find('> a[href*="#' + id + '"]');
        if (link.length) {
          $(item).addClass('-current-active');
        }
      });
      return false;
    }
  });
};
$(window).on('scroll resize', checkActiveNav);
checkActiveNav();

window.addEventListener('load', () => {
  scrollToAnchorByHash(window.location.hash);
});
