import $ from 'jquery';

import {
  scrollToElement,
  getOffset
} from '../../../src/js/utils/scroll-to-element';
import { closeMenu } from '../../../src/js/main/menu';

$(function () {
  if ($('[data-anchor-id]').length) {
    $('a[href*="#"]').each(function (index, item) {
      const link = $(item);
      const href = link.attr('href');
      const hrefSplit = href.split('#');
      const anchorEl = $(
        '[data-anchor-id="' + hrefSplit[hrefSplit.length - 1] + '"]'
      );
      if (anchorEl.length) {
        link.on('click', function () {
          closeMenu();
          scrollToAnchor(anchorEl);
        });
      }
    });
  }

  // TODO active navigation
  // var checkActiveNav = function () {
  //   $($('[data-anchor-id]').get().reverse()).each(function (index, item) {
  //     var id = $(item).attr('data-anchor-id');
  //     var windowTop = $(document).scrollTop();
  //     let itemTop = $(item).offset().top;
  //     if ($(item).next().length) {
  //       itemTop = $(item).next().offset().top;
  //     }
  //     $('header .menu-item').removeClass('-current-active');

  //     let offset = getOffset() * -1 + 4;

  //     if (windowTop >= 16 && windowTop > itemTop - offset) {
  //       $('header .menu-item').each(function (index, item) {
  //         const link = $(item).find('> a[href*="#' + id + '"]');
  //         if (link.length) {
  //           $(item).addClass('-current-active');
  //         }
  //       });
  //       return false;
  //     }
  //   });
  // };
  // $(window).on('scroll resize', checkActiveNav);
  // checkActiveNav();
});

// Instant scroll to anchor fallback

function scrollToAnchor(anchorEl) {
  let targetEl = anchorEl;
  if (anchorEl.next().length) {
    targetEl = targetEl.next();
  }
  if (!targetEl.length || !anchorEl.length) {
    return;
  }
  let offset = getOffset();
  if (anchorEl.attr('data-anchor-offset')) {
    offset += parseInt(anchorEl.attr('data-anchor-offset'));
  }
  scrollToElement(targetEl[0], offset);
}

// Automatic scroll

$(function () {
  const windowHash = window.location.hash;
  if (windowHash) {
    const hashId = windowHash.replace('#', '');
    const anchorEl = $('[data-anchor-id="' + hashId + '"]');
    if (anchorEl.length) {
      scrollToAnchor(anchorEl);
    }
  }
});
