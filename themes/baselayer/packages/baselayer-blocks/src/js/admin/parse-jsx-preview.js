/**
 * ACF-style: turn server-rendered PHP HTML into React, mounting live InnerBlocks
 * where `<InnerBlocks … />` appeared in the template.
 */

const ATTR_MAP = {
  class: 'className',
  classname: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  usemap: 'useMap',
  frameborder: 'frameBorder',
  allowfullscreen: 'allowFullScreen',
  autocomplete: 'autoComplete',
  crossorigin: 'crossOrigin',
};

const INNER_MARKER = 'data-bl-innerblocks';
const INNER_PROPS = 'data-bl-innerblocks-props';

/**
 * Replace InnerBlocks tags with a safe HTML placeholder before DOMParser.
 * HTML5 does not treat <InnerBlocks /> as void, which would break nesting.
 *
 * @param {string} html
 * @returns {string}
 */
export function prepareInnerBlocksMarkers(html) {
  if (!html || typeof html !== 'string' || !/innerblocks/i.test(html)) {
    return html || '';
  }

  let out = html.replace(/<InnerBlocks\b([^>]*)>([\s\S]*?)<\/InnerBlocks>/gi, (_, attrs) =>
    markerFromAttrs(attrs)
  );
  out = out.replace(/<InnerBlocks\b([^>]*)\/?\s*>/gi, (_, attrs) => markerFromAttrs(attrs));
  return out;
}

/**
 * @param {string} attrs
 * @returns {string}
 */
function markerFromAttrs(attrs) {
  const props = {};
  const re = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  const raw = String(attrs || '');
  while ((match = re.exec(raw)) !== null) {
    const name = String(match[1] || '').trim();
    if (!name || name === '/') continue;
    const value = match[2] !== undefined ? match[2] : match[3] !== undefined ? match[3] : match[4] !== undefined ? match[4] : true;
    const key = name.toLowerCase();
    if (key === 'allowedblocks') {
      props.allowedBlocks = parseJsonAttr(value);
    } else if (key === 'template') {
      props.template = parseJsonAttr(value);
    } else if (key === 'templatelock') {
      props.templateLock = value === true ? 'all' : value;
    } else {
      props[name] = value === true ? true : value;
    }
  }
  let encoded = '';
  try {
    encoded = encodeURIComponent(JSON.stringify(props));
  } catch (err) {
    encoded = encodeURIComponent('{}');
  }
  return `<div ${INNER_MARKER}="1" ${INNER_PROPS}="${encoded}"></div>`;
}

/**
 * Decode common HTML entities used in esc_attr()'d JSON attribute values.
 *
 * @param {string} value
 * @returns {string}
 */
function decodeHtmlAttr(value) {
  const s = String(value);
  if (!/[&]/.test(s)) {
    return s;
  }
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * @param {unknown} value
 * @returns {unknown}
 */
function parseJsonAttr(value) {
  if (value === true || value == null || value === '') return undefined;
  try {
    return JSON.parse(decodeHtmlAttr(String(value)));
  } catch (err) {
    return undefined;
  }
}

/**
 * @param {string} styleText
 * @returns {Record<string, string>}
 */
function parseStyle(styleText) {
  const out = {};
  String(styleText || '')
    .split(';')
    .forEach((part) => {
      const idx = part.indexOf(':');
      if (idx === -1) return;
      const prop = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (!prop) return;
      // React style objects keep custom properties in kebab-case.
      if (prop.startsWith('--')) {
        out[prop] = val;
        return;
      }
      const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      out[camel] = val;
    });
  return out;
}

/**
 * @param {Element} el
 * @returns {Record<string, unknown>}
 */
function elementProps(el) {
  const props = {};
  Array.from(el.attributes || []).forEach((attr) => {
    const rawName = attr.name;
    const lower = rawName.toLowerCase();
    if (lower === INNER_MARKER || lower === INNER_PROPS) return;
    let name = ATTR_MAP[lower] || rawName;
    if (lower.startsWith('data-') || lower.startsWith('aria-')) {
      name = lower;
    }
    let value = attr.value;
    if (lower === 'style') {
      props.style = parseStyle(value);
      return;
    }
    if (value === '' && el.hasAttribute(rawName)) {
      // Boolean-ish empty attributes (e.g. checked without value).
      if (!['value', 'id', 'class', 'className', 'name', 'type', 'role'].includes(name)) {
        props[name] = true;
        return;
      }
    }
    props[name] = value;
  });
  return props;
}

/**
 * @param {Element} el
 * @returns {boolean}
 */
function isIconHost(el) {
  if (!el || !el.classList) return false;
  return (
    el.classList.contains('icon__icon') ||
    el.classList.contains('icon-text__icon') ||
    (el.classList.contains('icon__icon') && el.classList.contains('icon-text__icon'))
  );
}

/**
 * @param {Element} el
 * @returns {boolean}
 */
function isAccordionWrapper(el) {
  return !!(el && el.classList && el.classList.contains('accordion__wrapper'));
}

/**
 * @param {Element} el
 * @returns {boolean}
 */
function isSliderWrapper(el) {
  return !!(el && el.classList && el.classList.contains('slider__wrapper'));
}

/**
 * @param {Record<string, unknown>} props
 * @param {string} blockAlign
 * @returns {Record<string, unknown>}
 */
function applyBlockAlignClass(props, blockAlign) {
  const align = String(blockAlign || '').trim();
  if (!['wide', 'full', 'left', 'center', 'right'].includes(align)) {
    return props;
  }
  const alignClass = 'align' + align;
  const className = String(props.className || '');
  const classes = className
    .split(/\s+/)
    .filter((c) => c && !/^align(wide|full|left|center|right)$/.test(c));
  if (!classes.includes(alignClass)) {
    classes.push(alignClass);
  }
  return { ...props, className: classes.join(' ') };
}

/**
 * @param {Node} node
 * @param {object} ctx
 * @returns {unknown}
 */
function walkNode(node, ctx) {
  const { createElement, InnerBlocks, Fragment } = ctx;

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    return text == null || text === '' ? null : text;
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return null;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const el = /** @type {Element} */ (node);

  if (el.getAttribute(INNER_MARKER) === '1') {
    let fromTag = {};
    try {
      fromTag = JSON.parse(decodeURIComponent(el.getAttribute(INNER_PROPS) || '') || '{}') || {};
    } catch (err) {
      fromTag = {};
    }
    if (!InnerBlocks) {
      return null;
    }
    const props = {
      ...(ctx.defaultInnerBlocksProps || {}),
      ...fromTag,
    };
    if (!props.renderAppender && InnerBlocks.ButtonBlockAppender) {
      props.renderAppender = InnerBlocks.ButtonBlockAppender;
    }
    return createElement(InnerBlocks, props);
  }

  const tag = el.tagName.toLowerCase();
  let props = elementProps(el);

  if (ctx.accordionEditorOpen && isAccordionWrapper(el)) {
    const className = String(props.className || '');
    const classes = className.split(/\s+/).filter(Boolean);
    if (!classes.includes('accordion-open')) {
      classes.push('accordion-open');
    }
    props = {
      ...props,
      className: classes.join(' '),
      'data-accordion-is-open': 'true',
    };
  }

  if (ctx.sliderEditorExpanded && isSliderWrapper(el)) {
    props = {
      ...props,
      'data-slider-editor-expanded': 'true',
    };
  }

  if (ctx.blockAlign && isSliderWrapper(el)) {
    props = applyBlockAlignClass(props, ctx.blockAlign);
  }

  if (ctx.iconControl && isIconHost(el)) {
    const className = String(props.className || '');
    const hasIcon = !!(ctx.iconControl.value);
    let nextClass = className
      .split(/\s+/)
      .filter((c) => c && c !== '-has-icon')
      .join(' ');
    if (hasIcon) {
      nextClass = (nextClass + ' -has-icon').trim();
    }
    props = { ...props, className: nextClass };
    return createElement(tag, props, createElement(ctx.iconControl.type, ctx.iconControl.props));
  }

  const childNodes = Array.from(el.childNodes || []);
  const children = [];
  childNodes.forEach((child) => {
    const rendered = walkNode(child, ctx);
    if (rendered == null || rendered === false) return;
    if (Array.isArray(rendered)) {
      rendered.forEach((item) => {
        if (item != null && item !== false) children.push(item);
      });
    } else {
      children.push(rendered);
    }
  });

  if (tag === 'svg' || el.namespaceURI === 'http://www.w3.org/2000/svg') {
    // Ensure SVG children use correct tag casing from localName when available.
  }

  if (children.length === 0) {
    return createElement(tag, props);
  }
  if (children.length === 1) {
    return createElement(tag, props, children[0]);
  }
  return createElement(tag, props, ...children);
}

/**
 * Parse PHP preview HTML into a React node tree.
 *
 * @param {string} html
 * @param {{
 *   createElement: Function,
 *   Fragment?: Function,
 *   InnerBlocks?: object,
 *   defaultInnerBlocksProps?: object,
 *   iconControl?: { type: Function, props: object, value?: string }|null,
 *   accordionEditorOpen?: boolean,
 *   sliderEditorExpanded?: boolean,
 *   blockAlign?: string,
 * }} options
 * @returns {unknown}
 */
export function parseJsxPreview(html, options) {
  const createElement = options && options.createElement;
  if (typeof createElement !== 'function') {
    return null;
  }
  const prepared = prepareInnerBlocksMarkers(html);
  if (!prepared) {
    return null;
  }

  let doc;
  try {
    doc = new DOMParser().parseFromString(
      `<div id="bl-blocks-jsx-root">${prepared}</div>`,
      'text/html'
    );
  } catch (err) {
    return null;
  }
  const root = doc.getElementById('bl-blocks-jsx-root');
  if (!root) {
    return null;
  }

  const ctx = {
    createElement,
    Fragment: options.Fragment,
    InnerBlocks: options.InnerBlocks,
    defaultInnerBlocksProps: options.defaultInnerBlocksProps || {},
    iconControl: options.iconControl || null,
    accordionEditorOpen: !!options.accordionEditorOpen,
    sliderEditorExpanded: !!options.sliderEditorExpanded,
    blockAlign: typeof options.blockAlign === 'string' ? options.blockAlign : '',
  };

  const children = [];
  Array.from(root.childNodes).forEach((child) => {
    const rendered = walkNode(child, ctx);
    if (rendered == null || rendered === false) return;
    children.push(rendered);
  });

  if (children.length === 0) {
    return null;
  }
  if (children.length === 1) {
    return children[0];
  }
  if (options.Fragment) {
    return createElement(options.Fragment, null, ...children);
  }
  return createElement('div', { className: 'bl-blocks-jsx-preview' }, ...children);
}
