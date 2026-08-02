/**
 * Child theme scripts — compiled to assets/js/main.js (loads after parent).
 *
 * Install assets from the theme folder:
 *   npm install
 *
 * Build the minified version:
 *   npm run build
 *
 * Watch for changes and build automatically:
 *   npm run watch
 */

// Optional ACF drop-in (copy repo acf/ into this child, then uncomment):
// import '../../acf/blocks/blocks.js';

// BaseLayer custom blocks
import '../../blocks/blocks.js';

// Test log message
console.log('BaseLayer Child Theme JavaScript loaded.');
