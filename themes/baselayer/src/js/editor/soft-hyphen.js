/**
 * Soft hyphen (­ / \u00AD) toolbar insert + editor-only markers.
 * Saved content stays a bare soft hyphen — no wrapper HTML.
 *
 * Soft hyphens are zero-width when not breaking, so we highlight the
 * next character via the CSS Custom Highlight API (scrolls with text).
 */
const SOFT_HYPHEN = '\u00AD';
const HIGHLIGHT_NAME = 'bl-soft-hyphen';
const STYLE_ID = 'bl-soft-hyphen-highlight-style';
const HIGHLIGHT_CSS = `::highlight(${HIGHLIGHT_NAME}) {
  background-color: rgba(255, 193, 7, 0.55);
  color: inherit;
}`;

const { registerFormatType, insert } = wp.richText;
const { RichTextToolbarButton } = wp.blockEditor;
const { __ } = wp.i18n;
const { createElement: el } = wp.element;

function getCanvasDocuments() {
  const docs = [];
  const iframe = document.querySelector('iframe[name="editor-canvas"]');
  try {
    if (iframe?.contentDocument?.body) {
      docs.push(iframe.contentDocument);
    }
  } catch (e) {
    // Cross-origin or not ready.
  }
  if (document.querySelector('.editor-styles-wrapper .block-editor-rich-text__editable')) {
    docs.push(document);
  }
  if (docs.length === 0) {
    docs.push(document);
  }
  return docs;
}

function ensureHighlightStyle(doc) {
  if (!doc?.head) {
    return;
  }
  let style = doc.getElementById(STYLE_ID);
  if (!style) {
    style = doc.createElement('style');
    style.id = STYLE_ID;
    doc.head.appendChild(style);
  }
  style.textContent = HIGHLIGHT_CSS;
}

/**
 * Highlight the character after each soft hyphen (visible width for ::highlight).
 * Falls back to the character before if shy is at the end of the text node.
 */
function collectSoftHyphenRanges(doc) {
  const ranges = [];
  const root =
    doc.querySelector('.editor-styles-wrapper') ||
    doc.querySelector('.block-editor-writing-flow') ||
    doc.body;
  if (!root) {
    return ranges;
  }

  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue || '';
    let from = 0;
    let idx;
    while ((idx = text.indexOf(SOFT_HYPHEN, from)) !== -1) {
      const range = doc.createRange();
      if (idx + 1 < text.length) {
        range.setStart(node, idx + 1);
        range.setEnd(node, idx + 2);
      } else if (idx > 0) {
        range.setStart(node, idx - 1);
        range.setEnd(node, idx);
      } else {
        from = idx + 1;
        continue;
      }
      ranges.push(range);
      from = idx + 1;
    }
  }
  return ranges;
}

function refreshSoftHyphenHighlights() {
  getCanvasDocuments().forEach((doc) => {
    const win = doc.defaultView;
    if (!win?.CSS?.highlights || typeof win.Highlight !== 'function') {
      return;
    }

    ensureHighlightStyle(doc);

    const ranges = collectSoftHyphenRanges(doc);
    if (ranges.length === 0) {
      win.CSS.highlights.delete(HIGHLIGHT_NAME);
      return;
    }

    win.CSS.highlights.set(HIGHLIGHT_NAME, new win.Highlight(...ranges));
  });
}

let refreshQueued = false;
function scheduleHighlightRefresh() {
  if (refreshQueued) {
    return;
  }
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    refreshSoftHyphenHighlights();
  });
}

function SoftHyphenEdit({ value, onChange }) {
  return el(RichTextToolbarButton, {
    icon: 'editor-break',
    title: __('Insert soft hyphen', 'baselayer'),
    onClick: () => {
      onChange(insert(value, SOFT_HYPHEN));
      scheduleHighlightRefresh();
      setTimeout(scheduleHighlightRefresh, 50);
      setTimeout(scheduleHighlightRefresh, 200);
    },
  });
}

registerFormatType('baselayer/soft-hyphen', {
  title: __('Soft hyphen', 'baselayer'),
  tagName: 'span',
  className: 'bl-soft-hyphen',
  edit: SoftHyphenEdit,
});

wp.domReady(() => {
  scheduleHighlightRefresh();

  const observed = new WeakSet();
  const observeDoc = (doc) => {
    if (!doc?.body || observed.has(doc)) {
      return;
    }
    observed.add(doc);
    const observer = new MutationObserver(scheduleHighlightRefresh);
    observer.observe(doc.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  };

  observeDoc(document);

  const bindIframe = () => {
    const iframe = document.querySelector('iframe[name="editor-canvas"]');
    if (!iframe) {
      return;
    }
    const onReady = () => {
      try {
        if (iframe.contentDocument) {
          observeDoc(iframe.contentDocument);
          scheduleHighlightRefresh();
        }
      } catch (e) {
        // Ignore.
      }
    };
    onReady();
    iframe.addEventListener('load', onReady);
  };

  bindIframe();
  new MutationObserver(bindIframe).observe(document.body, {
    childList: true,
    subtree: true,
  });

  if (wp.data?.subscribe) {
    wp.data.subscribe(scheduleHighlightRefresh);
  }
});
