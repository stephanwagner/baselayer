// Utils
import '../utils/animations';

// Service worker
import './service-worker';

// Main
import './menu';
import './scrolled';
import './search';
import './article-list';
import './hero';
import './site-notice';

// Components
import '../components/modal';
import '../components/lightbox';
import '../components/google-translate';

// Blocks (BaseLayer). Optional ACF: import '../../../acf/blocks/blocks.js' after copying repo acf/ into the theme.
import '../../../blocks/blocks.js';

// Delay initial animations
setTimeout(function () {
  document.body.classList.add('-transition-init');
}, 128);
