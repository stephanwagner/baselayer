import Swiper from 'swiper';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';

document.querySelectorAll('[data-hero-slider]').forEach((el) => {
  if (!(el instanceof HTMLElement)) {
    return;
  }

  const root = el.closest('.hero__wrapper');
  const paginationEl = root?.querySelector('.hero__pagination');
  const nextEl = root?.querySelector('.hero__button-next');
  const prevEl = root?.querySelector('.hero__button-prev');

  const swiper = new Swiper(el, {
    modules: [Autoplay, EffectFade, Navigation, Pagination],
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    speed: 800,
    loop: true,
    autoplay: {
      delay: 6000,
      disableOnInteraction: true,
    },
    pagination:
      paginationEl instanceof HTMLElement
        ? {
            el: paginationEl,
            clickable: true,
          }
        : undefined,
    navigation:
      nextEl instanceof HTMLElement && prevEl instanceof HTMLElement
        ? {
            nextEl,
            prevEl,
          }
        : undefined,
  });

  el.querySelectorAll('video').forEach((video) => {
    video.addEventListener('play', () => {
      swiper.autoplay.stop();
    });
  });
});
