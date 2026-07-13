import { closeModal } from '../components/modal';

const searchModalContent = document.querySelector('[data-modal-content="search"]');

if (searchModalContent) {
  searchModalContent.modalOnOpen = (modalEl, sourceEl) => {
    requestAnimationFrame(() => {
      const searchInput = modalEl.querySelector('.search-form__input');
      if (searchInput) {
        searchInput.focus();
      }
    });
  };
}

const searchModalCloseButton = document.querySelector('[data-modal-close="search"]');

if (searchModalCloseButton) {
  searchModalCloseButton.addEventListener('click', () => {
    closeModal('search');
  });
}
