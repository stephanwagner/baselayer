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

// Delay initial animations
setTimeout(function () {
  document.body.classList.add('-transition-init');
}, 128);

// Init modals
initModals();
