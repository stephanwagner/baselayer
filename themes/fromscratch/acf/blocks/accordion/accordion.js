import $ from 'jquery';
import { scrollToElement, getOffset } from '../../../src/js/utils/scroll-to-element';
import { closeMenu } from '../../../src/js/main/menu';
import config from '../../../src/js/config';

/**
 * Toggle an accordion
 */
$('.accordion__header').on('click keydown', function (e) {
  if (e.type === 'keydown' && e.key !== 'Enter') {
    return;
  }
  var wrapper = $(this).parents('.accordion__wrapper');
  var accordionIsOpen = wrapper.hasClass('accordion-open');
  if (accordionIsOpen) {
    closeAccordion(wrapper);
    return;
  }
  openAccordionWithNeighbours(wrapper);
});

/**
 * Open accordion via hash/link navigation, then scroll once
 * @param {jQuery} accordionWrapper
 */
function navigateToAccordion(accordionWrapper) {
  if (!accordionWrapper.length) {
    return;
  }
  openAccordionWithNeighbours($(accordionWrapper), { scrollAfterOpen: true });
}

/**
 * Scroll to accordion by hash
 * @param {string} hash
 */
function scrollToAccordionByHash(hash) {
  if (!hash) {
    return;
  }
  const hashId = hash.replace('#', '');
  const accordionWrapper = $('.accordion__wrapper[data-accordion-id="' + hashId + '"]').first();
  navigateToAccordion(accordionWrapper);
}

if ($('.accordion__wrapper[data-accordion-id]').length) {
  $('a[href*="#"]').each(function (index, item) {
    const link = $(item);
    const href = link.attr('href');
    const hrefSplit = href.split('#');
    const accordionWrapper = $('.accordion__wrapper[data-accordion-id="' + hrefSplit[hrefSplit.length - 1] + '"]').first();
    if (accordionWrapper.length) {
      link.on('click', function () {
        closeMenu();
        navigateToAccordion(accordionWrapper);
      });
    }
  });
}

window.addEventListener('load', () => {
  scrollToAccordionByHash(window.location.hash);
});

/**
 * Open an accordion and close neighbouring accordions when configured
 * @param {jQuery} wrapper
 * @param {object} options
 */
function openAccordionWithNeighbours(wrapper, options = {}) {
  if (wrapper.attr('data-close-neighbouring-accordions') === 'true') {
    let wrapperSiblings = $();
    wrapperSiblings = wrapperSiblings.add(wrapper.prevUntil(':not(.accordion__wrapper)'));
    wrapperSiblings = wrapperSiblings.add(wrapper.nextUntil(':not(.accordion__wrapper)'));
    wrapperSiblings.filter('.accordion__wrapper.accordion-open').each(function (index, item) {
      closeAccordion($(item));
    });
  }
  openAccordion(wrapper, options);
}

/**
 * Open an accordion
 * @param {jQuery} wrapper
 * @param {object} options
 */
function openAccordion(wrapper, options = {}) {
  const scrollAfterOpen = options.scrollAfterOpen === true;

  if (wrapper.hasClass('accordion-open')) {
    if (scrollAfterOpen || wrapper.attr('data-scroll-to-accordion-top') === 'true') {
      scrollToElement($(wrapper)[0], getOffset());
    }
    return;
  }

  wrapper.addClass('accordion-open');
  wrapper.attr('aria-expanded', 'true');
  wrapper.find('.accordion__content').slideDown({
    duration: config.transitionSpeed,
    queue: false,
    complete: function () {
      if (scrollAfterOpen) {
        scrollToElement($(wrapper)[0], getOffset());
      } else if (wrapper.attr('data-scroll-to-accordion-top') === 'true') {
        scrollToElement($(wrapper)[0], getOffset());
      }
    },
  });
}

/**
 * Close an accordion
 * @param {jQuery} wrapper
 */
function closeAccordion(wrapper) {
  wrapper.removeClass('accordion-open');
  wrapper.attr('aria-expanded', 'false');
  wrapper.find('.accordion__content').slideUp({
    duration: config.transitionSpeed,
    queue: false,
  });
}
