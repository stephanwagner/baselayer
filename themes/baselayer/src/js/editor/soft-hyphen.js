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
const { SVG, Path } = wp.primitives;

const softHyphenIcon = el(
  SVG,
  {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 -960 960 960',
    width: 24,
    height: 24,
  },
  el(Path, {
    d: 'M529.81-182.96q.19-11.96 9.11-20.89L665.08-330H292.31q-29.92 0-51.12-21.19Q220-372.39 220-402.31V-750q0-12.77 8.62-21.38Q237.23-780 250-780t21.38 8.62Q280-762.77 280-750v347.69q0 5.39 3.46 8.85t8.85 3.46h372.77L538.31-516.77q-9.31-9.31-9-21.08.31-11.76 9-21.07 9.31-9.31 21.27-9.42 11.96-.12 20.88 8.8l174.23 174.23q5.62 5.62 7.92 11.85 2.31 6.23 2.31 13.46t-2.31 13.46q-2.3 6.23-7.92 11.85l-173 173q-9.31 9.3-21.38 9.3-12.08 0-21.39-9.3-9.3-9.31-9.11-21.27Z',
    fill: 'currentColor',
  })
);

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

const softHyphenI18n =
  (typeof baselayerSoftHyphen !== 'undefined' && baselayerSoftHyphen) || {};

function SoftHyphenEdit({ value, onChange }) {
  return el(RichTextToolbarButton, {
    icon: softHyphenIcon,
    title: softHyphenI18n.insertLabel || __('Insert soft hyphen', 'baselayer'),
    onClick: () => {
      onChange(insert(value, SOFT_HYPHEN));
      scheduleHighlightRefresh();
      setTimeout(scheduleHighlightRefresh, 50);
      setTimeout(scheduleHighlightRefresh, 200);
    },
  });
}

registerFormatType('baselayer/soft-hyphen', {
  title: softHyphenI18n.title || __('Soft hyphen', 'baselayer'),
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
