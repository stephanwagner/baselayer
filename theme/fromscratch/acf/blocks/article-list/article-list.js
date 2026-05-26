document.querySelectorAll('[data-article-list-filter]').forEach((form) => {
  const select = form.querySelector('.article-list__filter-select');
  if (!select) {
    return;
  }

  select.addEventListener('change', () => {
    form.submit();
  });
});
