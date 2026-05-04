import config from '../config';

let isScrolled = false;

function checkScroll() {
  const shouldBeScrolled = window.scrollY >= config.startScrolled;

  if (shouldBeScrolled !== isScrolled) {
    document.body.classList.toggle('-scrolled', shouldBeScrolled);
    isScrolled = shouldBeScrolled;
  }
}

window.addEventListener('scroll', checkScroll, { passive: true });
window.addEventListener('resize', checkScroll, { passive: true });
checkScroll();
