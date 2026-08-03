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
 *
 * Parent enqueues exclusive block scripts (blocks-baselayer / blocks-acf) based on
 * Developer → Features → Custom blocks. Add child-only block behaviour under
 * blocks/ and import it here if needed.
 */

// Child BaseLayer custom block overrides (optional)
import '../../blocks/blocks.js';

// Test log message
console.log('BaseLayer Child Theme JavaScript loaded.');
