import Swiper from 'swiper';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';

document.querySelectorAll('.bl-wp-block.-acf-block.slider__wrapper').forEach((slider) => {
  const sliderWrapper = slider;
  const id = sliderWrapper.getAttribute('data-slider-id');
  const slideCount = sliderWrapper.querySelectorAll('.slider-slide__wrapper').length;

  if (slideCount <= 1) {
    sliderWrapper.setAttribute('data-slider-navigation', 'false');
    sliderWrapper.setAttribute('data-slider-pagination', 'false');
    sliderWrapper.setAttribute('data-slider-loop', 'false');
    sliderWrapper.setAttribute('data-slider-autoplay', 'false');
  }

  const paginationEl = sliderWrapper.querySelector('.slider__pagination');
  const nextEl = sliderWrapper.querySelector('.slider__button-next');
  const prevEl = sliderWrapper.querySelector('.slider__button-prev');

  const modules = [Autoplay, Pagination, Navigation];

  const sliderConfig = {
    wrapperClass: 'acf-innerblocks-container',
    effect: sliderWrapper.getAttribute('data-slider-animation') || 'slide',
    speed: 800,
  };

  switch (sliderWrapper.getAttribute('data-slider-animation')) {
    case 'fade':
      modules.push(EffectFade);
      sliderConfig.fadeEffect = {
        crossFade: true,
      };
      break;
  }

  sliderConfig.loop = sliderWrapper.getAttribute('data-slider-loop') === 'true';

  let spaceBetween = parseInt(sliderWrapper.getAttribute('data-slider-space-between'), 10);
  sliderConfig.spaceBetween = spaceBetween || spaceBetween === 0 ? spaceBetween : 16;

  sliderConfig.slidesPerView = parseInt(sliderWrapper.getAttribute('data-slider-slides-per-view'), 10) || 1;
  sliderConfig.slidesPerGroup = parseInt(sliderWrapper.getAttribute('data-slider-slides-per-group'), 10) || 1;

  if (sliderConfig.slidesPerView == 2) {
    sliderConfig.breakpoints = {
      600: {
        slidesPerView: 2,
        slidesPerGroup: Math.min(sliderConfig.slidesPerGroup, 2),
      },
      0: {
        slidesPerView: 1,
        slidesPerGroup: 1,
      },
    };
  }
  if (sliderConfig.slidesPerView == 3) {
    sliderConfig.breakpoints = {
      900: {
        slidesPerView: 3,
        slidesPerGroup: Math.min(sliderConfig.slidesPerGroup, 3),
      },
      600: {
        slidesPerView: 2,
        slidesPerGroup: Math.min(sliderConfig.slidesPerGroup, 2),
      },
      0: {
        slidesPerView: 1,
        slidesPerGroup: 1,
      },
    };
  }
  if (sliderConfig.slidesPerView == 4) {
    sliderConfig.breakpoints = {
      1200: {
        slidesPerView: 4,
        slidesPerGroup: Math.min(sliderConfig.slidesPerGroup, 4),
      },
      900: {
        slidesPerView: 3,
        slidesPerGroup: Math.min(sliderConfig.slidesPerGroup, 3),
      },
      600: {
        slidesPerView: 2,
        slidesPerGroup: Math.min(sliderConfig.slidesPerGroup, 2),
      },
      0: {
        slidesPerView: 1,
        slidesPerGroup: 1,
      },
    };
  }
  if (sliderConfig.slidesPerView >= 5) {
    sliderConfig.breakpoints = {
      1200: {
        slidesPerView: sliderConfig.slidesPerView,
        slidesPerGroup: Math.min(sliderConfig.slidesPerGroup, sliderConfig.slidesPerView),
      },
      900: {
        slidesPerView: 4,
        slidesPerGroup: Math.min(sliderConfig.slidesPerGroup, 4),
      },
      600: {
        slidesPerView: 2,
        slidesPerGroup: Math.min(sliderConfig.slidesPerGroup, 2),
      },
      0: {
        slidesPerView: 1,
        slidesPerGroup: 1,
      },
    };
  }

  const hasDynamicBullets = sliderWrapper.getAttribute('data-slider-dynamic-bullets') === 'true';
  if (slideCount > 1 && sliderWrapper.getAttribute('data-slider-pagination') === 'true' && paginationEl) {
    sliderConfig.pagination = {
      el: paginationEl,
      clickable: true,
      dynamicBullets: hasDynamicBullets,
      dynamicMainBullets: 3,
    };
  }

  if (slideCount > 1 && sliderWrapper.getAttribute('data-slider-navigation') === 'true' && nextEl && prevEl) {
    sliderConfig.navigation = {
      nextEl,
      prevEl,
    };
  }

  if (sliderWrapper.getAttribute('data-slider-autoplay') === 'true') {
    let autoplayDelay = parseFloat(sliderWrapper.getAttribute('data-slider-autoplay-delay'));
    if (!autoplayDelay) {
      autoplayDelay = 6000;
    } else {
      autoplayDelay *= 1000;
    }

    sliderConfig.autoplay = {
      delay: autoplayDelay,
      disableOnInteraction: true,
      pauseOnMouseEnter: false,
    };
  }

  sliderConfig.modules = modules;

  const swiperEl = sliderWrapper.querySelector('.swiper');
  if (!swiperEl) {
    return;
  }

  const swiper = new Swiper(swiperEl, sliderConfig);

  sliderWrapper.querySelectorAll('.slider-slide__wrapper').forEach((slide) => {
    slide.addEventListener('click', () => {
      if (swiper.autoplay && typeof swiper.autoplay.stop === 'function') {
        swiper.autoplay.stop();
      }
    });
  });

  sliderWrapper.querySelectorAll('video').forEach((video) => {
    video.addEventListener('play', () => {
      if (swiper.autoplay && typeof swiper.autoplay.stop === 'function') {
        swiper.autoplay.stop();
      }
    });
  });
});
