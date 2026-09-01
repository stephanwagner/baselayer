/**
 * Hover copy for Columns “Breakpoint” / Umbruch tokens.
 * Reads theme CSS vars (child overrides) with Sass `_config.scss` fallbacks.
 *
 * Early → L, Medium → M, Late → S, unset → WordPress 782px. Never has no pixel.
 */

const STACK_BREAKPOINT_SPEC = {
  '-columns-stack-unset': { prop: null, fallback: 782 },
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
 * @return {string}
 */
export function columnsStackBreakpointTitle(value) {
  const spec = STACK_BREAKPOINT_SPEC[value];
  if (!spec) {
    return '';
  }
  return cssPx(spec.prop, spec.fallback);
}
