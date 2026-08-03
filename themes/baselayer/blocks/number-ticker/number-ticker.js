import { CountUp } from 'countup.js';
import { onEnterViewport } from '../../src/js/utils/viewport.js';

const containerSelector = '.bl-wp-block.-baselayer-block.number-ticker__wrapper';

if (document.querySelector(containerSelector)) {
  onEnterViewport(containerSelector, function () {
    document.querySelectorAll(`${containerSelector} [data-countup]`).forEach((el) => {
      const startNumber = el.innerHTML;
      const targetNumber = el.getAttribute('data-countup');
      const numAnim = new CountUp(el, targetNumber, {
        startVal: startNumber,
        separator: '',
        decimalPlaces: 0,
        duration: 3,
      });
      numAnim.start();
    });
  });
}
