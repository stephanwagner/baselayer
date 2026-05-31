import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipe from 'photoswipe';

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelectorAll('.wp-block-gallery.-has-lightbox img')
    .forEach((img) => {
      if (img.closest('a')) {
        return;
      }

      const link = document.createElement('a');

      link.href = img.src;
      link.dataset.pswpWidth = img.getAttribute('width');
      link.dataset.pswpHeight = img.getAttribute('height');

      img.parentNode.insertBefore(link, img);
      link.appendChild(img);
    });

  const lightbox = new PhotoSwipeLightbox({
    gallery: '.wp-block-gallery.-has-lightbox',
    children: 'a',
    pswpModule: PhotoSwipe
  });

  lightbox.init();
});
