// Utils
import '../utils/animations';

// Service worker
import './service-worker';

// Main
import './menu';
import './scrolled';

// Components
import { initModals, openModal } from '../components/modal';

// Blocks
// TODO find solution to sunc with blocks plugin
// import '../blocks/all-blocks';

// Domready
document.addEventListener('DOMContentLoaded', () => {

  // Delay initial animations
  setTimeout(function () {
    document.body.classList.add('-init');
  }, 64);

  // Init modals
  initModals();
});
