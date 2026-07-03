// Utils
import '../utils/animations';

// Service worker
import './service-worker';

// Main
import './menu';
import './scrolled';
import './search';
import './article-list';

// Components
import '../components/modal';
import '../components/lightbox';
import '../components/google-translate';

// Blocks
import '../../../acf/blocks/blocks.js';

// Delay initial animations
setTimeout(function () {
  document.body.classList.add('-transition-init');
}, 128);
