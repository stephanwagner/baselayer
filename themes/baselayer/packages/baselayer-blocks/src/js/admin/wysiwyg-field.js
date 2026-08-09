/**
 * Blocks WYSIWYG — TinyMCE toolbar presets + wp.editor mount helpers.
 */

/** TinyMCE will not shrink the edit area below this. */
export const WYSIWYG_MIN_HEIGHT_PX = 100;

const ALWAYS = ['undo', 'redo'];

const PRESETS = {
  basic: ['bold', 'italic', '|', 'link', 'unlink'],
  standard: ['bold', 'italic', '|', 'link', 'unlink', '|', 'bullist', 'numlist'],
  full: [
    'formatselect',
    '|',
    'bold',
    'italic',
    '|',
    'link',
    'unlink',
    '|',
    'bullist',
    'numlist',
    '|',
    'alignleft',
    'aligncenter',
    'alignright',
  ],
};

/**
 * @param {string} raw
 * @returns {string[]}
 */
export function parseCustomToolbar(raw) {
  return String(raw || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .flatMap((part) => {
      if (part === '|') return ['|'];
      const cleaned = part.replace(/[^a-z0-9_|-]/gi, '');
      return cleaned ? [cleaned] : [];
    });
}

/**
 * Resolve TinyMCE toolbar1 string for a field definition.
 *
 * @param {{ toolbar?: string, toolbar_custom?: string }} field
 * @returns {string}
 */
export function resolveWysiwygToolbar(field) {
  const preset = String(field?.toolbar || 'basic').toLowerCase();
  let buttons = [];
  if (preset === 'custom') {
    buttons = parseCustomToolbar(field?.toolbar_custom);
  } else if (preset === 'standard') {
    buttons = [...PRESETS.standard];
  } else if (preset === 'full') {
    buttons = [...PRESETS.full];
  } else {
    buttons = [...PRESETS.basic];
  }

  const seen = new Set();
  const out = [];
  [...ALWAYS, '|', ...buttons].forEach((btn) => {
    if (btn === '|') {
      if (out.length && out[out.length - 1] !== '|') {
        out.push('|');
      }
      return;
    }
    const key = String(btn).toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(key);
    // Pair remove-link with insert-link (presets + custom).
    if (key === 'link' && !seen.has('unlink')) {
      seen.add('unlink');
      out.push('unlink');
    }
  });
  while (out.length && out[out.length - 1] === '|') {
    out.pop();
  }
  return out.join(',');
}

/**
 * Resolved editor height in px, or null when unset / below TinyMCE’s floor.
 *
 * @param {{ height?: number|string }} field
 * @returns {number|null}
 */
export function resolveWysiwygHeight(field) {
  const heightPx = parseInt(field?.height, 10);
  if (Number.isFinite(heightPx) && heightPx >= WYSIWYG_MIN_HEIGHT_PX) {
    return heightPx;
  }
  return null;
}

/**
 * Classic editor API (wp.oldEditor in block editor, wp.editor elsewhere).
 * @returns {{ initialize?: Function, remove?: Function }|null}
 */
export function getWpEditorApi() {
  const wp = window.wp;
  if (!wp) return null;
  if (wp.oldEditor && typeof wp.oldEditor.initialize === 'function') {
    return wp.oldEditor;
  }
  if (wp.editor && typeof wp.editor.initialize === 'function') {
    return wp.editor;
  }
  return null;
}

/**
 * @param {string} editorId
 * @param {{ toolbar?: string, toolbar_custom?: string }} field
 * @param {{ onChange?: (html: string) => void }} [opts]
 */
export function initWysiwygEditor(editorId, field, opts = {}) {
  const api = getWpEditorApi();
  if (!api || typeof api.initialize !== 'function') {
    return false;
  }
  // Remove any previous instance for this id.
  if (typeof api.remove === 'function') {
    try {
      api.remove(editorId);
    } catch (err) {
      // Ignore missing editors.
    }
  }

  const toolbar1 = resolveWysiwygToolbar(field);
  const heightPx = resolveWysiwygHeight(field);
  const tinymce = {
    wpautop: true,
    toolbar1,
    toolbar2: '',
    toolbar3: '',
    toolbar4: '',
    setup(editor) {
      const emit = () => {
        if (typeof opts.onChange === 'function') {
          opts.onChange(editor.getContent());
        }
      };
      editor.on('change keyup NodeChange SetContent Undo Redo', emit);
    },
  };
  // Pass height to TinyMCE — CSS min-height fights the resize handle (adjusti).
  if (heightPx != null) {
    tinymce.height = heightPx;
  }
  api.initialize(editorId, {
    tinymce,
    quicktags: !!field?.allow_code_editing,
    mediaButtons: false,
  });
  return true;
}

/**
 * @param {string} editorId
 */
export function removeWysiwygEditor(editorId) {
  const api = getWpEditorApi();
  if (!api || typeof api.remove !== 'function') return;
  try {
    api.remove(editorId);
  } catch (err) {
    // Ignore.
  }
}

/**
 * Sync TinyMCE content into the backing textarea (if present).
 * @param {HTMLTextAreaElement} textarea
 */
export function syncWysiwygTextarea(textarea) {
  if (!textarea || !textarea.id) return;
  const api = getWpEditorApi();
  const editor =
    window.tinymce && typeof window.tinymce.get === 'function'
      ? window.tinymce.get(textarea.id)
      : null;
  if (editor && typeof editor.getContent === 'function') {
    textarea.value = editor.getContent();
  } else if (api && typeof api.getContent === 'function') {
    try {
      textarea.value = api.getContent(textarea.id) || textarea.value;
    } catch (err) {
      // Ignore.
    }
  }
}

/**
 * Remove all TinyMCE instances under a root (modal teardown).
 * @param {ParentNode} root
 */
export function destroyWysiwygEditors(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return;
  root.querySelectorAll('textarea[data-bl-wysiwyg]').forEach((ta) => {
    if (ta.id) removeWysiwygEditor(ta.id);
  });
}
