/**
 * Hover copy for Columns “Breakpoint” / Umbruch tokens.
 * Reads theme CSS vars (child overrides) with Sass `_config.scss` fallbacks.
 *
 * — / unset → WordPress 782px. Early → L, Medium → M, Late → S. Never stays blank.
 */

const WORDPRESS_STACK = { prop: '--bl-breakpoint-wordpress', fallback: 782 };

const STACK_BREAKPOINT_SPEC = {
  '': WORDPRESS_STACK,
  '-columns-stack-unset': WORDPRESS_STACK,
  '-columns-stack-early': { prop: '--bl-breakpoint-l', fallback: 1200 },
  '-columns-stack-medium': { prop: '--bl-breakpoint-m', fallback: 900 },
  '-columns-stack-late': { prop: '--bl-breakpoint-s', fallback: 600 },
};

function editorStylesRoot() {
  const iframe = document.querySelector('iframe[name="editor-canvas"]');
  const doc = iframe && iframe.contentDocument;
  if (doc) {
    return doc.querySelector('.editor-styles-wrapper') || doc.documentElement;
  }
  return document.querySelector('.editor-styles-wrapper') || document.documentElement;
}

function cssPx(prop, fallback) {
  if (!prop) {
    return `${fallback}px`;
  }
  try {
    const raw = getComputedStyle(editorStylesRoot()).getPropertyValue(prop).trim();
    const n = parseFloat(raw);
    if (Number.isFinite(n) && n > 0) {
      return `${Math.round(n)}px`;
    }
  } catch {
    // Canvas iframe may not be ready yet.
  }
  return `${fallback}px`;
}

/**
 * @param {string} value Class token stored on the columns block option.
 * @param {object} [option] Button-group option definition (scoped to columns stack).
 * @return {string}
 */
export function columnsStackBreakpointTitle(value, option) {
  if (option && option.attributeName !== 'columnsStackBreakpoint') {
    return '';
  }
  const spec = STACK_BREAKPOINT_SPEC[value || ''];
  if (!spec) {
    return '';
  }
  return cssPx(spec.prop, spec.fallback);
}
