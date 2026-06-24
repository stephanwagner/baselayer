import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipe from 'photoswipe';

document.addEventListener('DOMContentLoaded', () => {
  // Wrap gallery images
  document
    .querySelectorAll('.wp-block-gallery.-has-lightbox img')
    .forEach(wrapImage);

  // Wrap standalone images
  document
    .querySelectorAll('.wp-block-image.-has-lightbox img')
    .forEach((img) => {
      // Gallery setting takes precedence
      if (img.closest('.wp-block-gallery')) {
        return;
      }

      wrapImage(img);
    });

  new PhotoSwipeLightbox({
    gallery: '.wp-block-gallery.-has-lightbox',
    children: 'a',
    pswpModule: PhotoSwipe,
    bgOpacity: 1
  }).init();

  new PhotoSwipeLightbox({
    gallery:
      '.wp-block-image.-has-lightbox:not(.wp-block-gallery .wp-block-image)',
    children: 'a',
    pswpModule: PhotoSwipe,
    bgOpacity: 1
  }).init();
});

function wrapImage(img) {
  if (img.closest('a')) {
    return;
  }

  const link = document.createElement('a');

  link.href = img.src;
  link.dataset.pswpWidth = img.getAttribute('width');
  link.dataset.pswpHeight = img.getAttribute('height');

  img.parentNode.insertBefore(link, img);
  link.appendChild(img);
}
