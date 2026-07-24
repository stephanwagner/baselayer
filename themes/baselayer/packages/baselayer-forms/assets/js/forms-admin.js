(() => {
  // themes/baselayer/packages/baselayer-forms/src/js/admin/dom.js
  var formsDragDepth = 0;
  function formsDragStart() {
    formsDragDepth += 1;
    document.body.classList.add("is-dragging");
  }
  function formsDragEnd() {
    formsDragDepth = Math.max(0, formsDragDepth - 1);
    if (formsDragDepth === 0) {
      document.body.classList.remove("is-dragging");
    }
  }
  var PALETTE_SECTIONS = [
    {
      id: "popular",
      headingKey: "paletteSectionPopular",
      headingFallback: "Popular",
      types: ["text", "textarea", "email", "phone", "terms"]
    },
    {
      id: "input",
      headingKey: "paletteSectionInput",
      headingFallback: "Input",
      types: ["text", "textarea", "email", "phone", "url", "number", "terms"]
    },
    {
      id: "choice",
      headingKey: "paletteSectionChoice",
      headingFallback: "Choice",
      types: ["checkboxes", "radio", "select", "toggle", "button_group"]
    },
    {
      id: "datetime",
      headingKey: "paletteSectionDatetime",
      headingFallback: "Date & time",
      types: ["date", "time", "datetime"]
    },
    {
      id: "files",
      headingKey: "paletteSectionFiles",
      headingFallback: "Uploads",
      types: ["file", "image"]
    },
    {
      id: "content",
      headingKey: "paletteSectionContent",
      headingFallback: "Content",
      types: ["heading", "text_block", "html"]
    },
    {
      id: "layout",
      headingKey: "paletteSectionLayout",
      headingFallback: "Layout",
      types: ["section", "column", "divider", "spacer"]
    },
    {
      id: "advanced",
      headingKey: "paletteSectionAdvanced",
      headingFallback: "Advanced",
      types: ["hidden", "captcha"]
    }
  ];
  function uid() {
    return "f" + Math.random().toString(36).slice(2, 10);
  }
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "checked") node.checked = Boolean(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }
  function t(key, fallback = "") {
    const dict = window.blFormsAdmin && window.blFormsAdmin.i18n || {};
    return dict[key] || fallback || key;
  }
  function iconMarkup(key) {
    const icons = window.blFormsAdmin && window.blFormsAdmin.icons || {};
    return icons[key] || "";
  }
  function iconEl(key, className = "bl-forms-builder__icon") {
    const wrap = el("span", {
      className,
      "aria-hidden": "true"
    });
    const markup = iconMarkup(key);
    if (markup) {
      wrap.innerHTML = markup;
    }
    return wrap;
  }
  function typeLabel(type) {
    const dict = window.blFormsAdmin && window.blFormsAdmin.i18n || {};
    return dict.types && dict.types[type] || type;
  }
  function fieldIsActive(field) {
    return !field || field.active !== false;
  }
  function slugifyName(text) {
    const slug = String(text || "").trim().toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/_+/g, "_");
    return slug || "field";
  }
  function slugifyOption(text) {
    const slug = String(text || "").trim().toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
    return slug || "option";
  }
  function collectFieldNames(exceptId = "") {
    return Array.from(document.querySelectorAll("[data-bl-forms-field]")).filter((row) => !exceptId || row.dataset.fieldId !== exceptId).map((row) => {
      const input = row.querySelector("[data-bl-name]");
      const value = (input?.value || row.dataset.fieldName || "").trim();
      return value;
    }).filter(Boolean);
  }
  function uniqueFieldName(base, exceptId = "") {
    const root = slugifyName(base);
    const used = new Set(collectFieldNames(exceptId).map((n) => n.toLowerCase()));
    if (!used.has(root)) {
      return root;
    }
    let i = 2;
    while (used.has(`${root}_${i}`)) {
      i += 1;
    }
    return `${root}_${i}`;
  }
  function defaultField(type = "text") {
    const id = uid();
    if (type === "divider") {
      return { id, type, margin: "m", margin_custom: "", css_class: "" };
    }
    if (type === "spacer") {
      return {
        id,
        type,
        height: "m",
        height_custom: "",
        css_class: ""
      };
    }
    if (type === "captcha") {
      return {
        id,
        type,
        captcha_provider: "turnstile",
        captcha_site_key: "",
        captcha_secret_key: "",
        width: "100",
        width_custom: "",
        css_class: ""
      };
    }
    if (type === "heading") {
      return {
        id,
        type,
        content: typeLabel(type),
        level: "h2",
        width: "100",
        width_custom: "",
        css_class: ""
      };
    }
    if (type === "text_block" || type === "html") {
      return {
        id,
        type,
        content: "",
        width: "100",
        width_custom: "",
        css_class: ""
      };
    }
    if (type === "honeypot") {
      return {
        id,
        type,
        name: slugifyName(typeLabel(type)),
        name_manual: false,
        label: typeLabel(type),
        hide_label: false,
        width: "100",
        width_custom: "",
        css_class: ""
      };
    }
    if (type === "hidden") {
      return {
        id,
        type,
        name: slugifyName(typeLabel(type)),
        name_manual: false,
        label: typeLabel(type),
        hide_label: false,
        default_value: "",
        width: "100",
        width_custom: "",
        css_class: ""
      };
    }
    if (type === "column") {
      return {
        id,
        type,
        width: "100",
        width_custom: "",
        children: []
      };
    }
    if (type === "section") {
      return {
        id,
        type,
        label: typeLabel(type),
        width: "100",
        width_custom: "",
        design: "standard",
        children: []
      };
    }
    const base = {
      id,
      type,
      label: typeLabel(type),
      name: slugifyName(typeLabel(type)),
      name_manual: false,
      hide_label: false,
      active: true,
      required: type === "terms",
      placeholder: "",
      description: "",
      width: "100",
      width_custom: "",
      css_class: ""
    };
    if (["radio", "checkboxes", "select", "button_group"].includes(type)) {
      base.options = [
        { label: t("optionOne", "Option 1"), value: "option-1" },
        { label: t("optionTwo", "Option 2"), value: "option-2" }
      ];
    }
    if (["radio", "checkboxes"].includes(type)) {
      base.layout = "vertical";
    }
    if (["select", "button_group", "file", "image"].includes(type)) {
      base.multiple = false;
    }
    if (type === "file" || type === "image") {
      base.preview = true;
      base.upload_style = "modern";
      base.extensions = type === "image" ? "jpg, jpeg, png, webp, gif, heic" : "";
    }
    if (type === "terms") {
      base.label = t("termsDefaultFieldLabel", "Privacy Policy");
      base.name = slugifyName(base.label);
      base.hide_label = true;
      base.content = t("termsDefaultLabel", "I agree to the [Privacy Policy](page:privacy).");
      base.default_value = "";
    }
    if (type === "toggle") {
      base.label = typeLabel(type);
      base.default_value = "";
    }
    if (type === "textarea") {
      base.rows = 5;
    }
    return base;
  }
  function readConfig() {
    const input = document.getElementById("bl-forms-config-json");
    if (!input) return { fields: [], settings: {} };
    try {
      return JSON.parse(input.value || "{}") || { fields: [], settings: {} };
    } catch (e) {
      return { fields: [], settings: {} };
    }
  }
  function writeConfig(partial) {
    const input = document.getElementById("bl-forms-config-json");
    if (!input) return;
    const current = readConfig();
    input.value = JSON.stringify({
      fields: partial.fields !== void 0 ? partial.fields : current.fields || [],
      settings: partial.settings !== void 0 ? partial.settings : current.settings || {}
    });
  }
  function flattenFields(fields = []) {
    const out = [];
    const walk = (list) => {
      (list || []).forEach((field) => {
        if (!field) return;
        if (field.type === "column" || field.type === "section" || field.type === "group") {
          walk(field.children || []);
          return;
        }
        out.push(field);
      });
    };
    walk(fields);
    return out;
  }

  // node_modules/sortablejs/modular/sortable.esm.js
  function _defineProperty(e, r, t2) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t2,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t2, e;
  }
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t2 = arguments[e];
        for (var r in t2) ({}).hasOwnProperty.call(t2, r) && (n[r] = t2[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  function ownKeys(e, r) {
    var t2 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t2.push.apply(t2, o);
    }
    return t2;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t2 = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t2), true).forEach(function(r2) {
        _defineProperty(e, r2, t2[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)) : ownKeys(Object(t2)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t2, r2));
      });
    }
    return e;
  }
  function _objectWithoutProperties(e, t2) {
    if (null == e) return {};
    var o, r, i = _objectWithoutPropertiesLoose(e, t2);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r = 0; r < n.length; r++) o = n[r], -1 === t2.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t2 = {};
    for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t2[n] = r[n];
    }
    return t2;
  }
  function _toPrimitive(t2, r) {
    if ("object" != typeof t2 || !t2) return t2;
    var e = t2[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t2, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t2);
  }
  function _toPropertyKey(t2) {
    var i = _toPrimitive(t2, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof(o);
  }
  var version = "1.15.7";
  function userAgent(pattern) {
    if (typeof window !== "undefined" && window.navigator) {
      return !!/* @__PURE__ */ navigator.userAgent.match(pattern);
    }
  }
  var IE11OrLess = userAgent(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i);
  var Edge = userAgent(/Edge/i);
  var FireFox = userAgent(/firefox/i);
  var Safari = userAgent(/safari/i) && !userAgent(/chrome/i) && !userAgent(/android/i);
  var IOS = userAgent(/iP(ad|od|hone)/i);
  var ChromeForAndroid = userAgent(/chrome/i) && userAgent(/android/i);
  var captureMode = {
    capture: false,
    passive: false
  };
  function on(el2, event, fn) {
    el2.addEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function off(el2, event, fn) {
    el2.removeEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function matches(el2, selector) {
    if (!selector) return;
    selector[0] === ">" && (selector = selector.substring(1));
    if (el2) {
      try {
        if (el2.matches) {
          return el2.matches(selector);
        } else if (el2.msMatchesSelector) {
          return el2.msMatchesSelector(selector);
        } else if (el2.webkitMatchesSelector) {
          return el2.webkitMatchesSelector(selector);
        }
      } catch (_) {
        return false;
      }
    }
    return false;
  }
  function getParentOrHost(el2) {
    return el2.host && el2 !== document && el2.host.nodeType && el2.host !== el2 ? el2.host : el2.parentNode;
  }
  function closest(el2, selector, ctx, includeCTX) {
    if (el2) {
      ctx = ctx || document;
      do {
        if (selector != null && (selector[0] === ">" ? el2.parentNode === ctx && matches(el2, selector) : matches(el2, selector)) || includeCTX && el2 === ctx) {
          return el2;
        }
        if (el2 === ctx) break;
      } while (el2 = getParentOrHost(el2));
    }
    return null;
  }
  var R_SPACE = /\s+/g;
  function toggleClass(el2, name, state) {
    if (el2 && name) {
      if (el2.classList) {
        el2.classList[state ? "add" : "remove"](name);
      } else {
        var className = (" " + el2.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
        el2.className = (className + (state ? " " + name : "")).replace(R_SPACE, " ");
      }
    }
  }
  function css(el2, prop, val) {
    var style = el2 && el2.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el2, "");
        } else if (el2.currentStyle) {
          val = el2.currentStyle;
        }
        return prop === void 0 ? val : val[prop];
      } else {
        if (!(prop in style) && prop.indexOf("webkit") === -1) {
          prop = "-webkit-" + prop;
        }
        style[prop] = val + (typeof val === "string" ? "" : "px");
      }
    }
  }
  function matrix(el2, selfOnly) {
    var appliedTransforms = "";
    if (typeof el2 === "string") {
      appliedTransforms = el2;
    } else {
      do {
        var transform = css(el2, "transform");
        if (transform && transform !== "none") {
          appliedTransforms = transform + " " + appliedTransforms;
        }
      } while (!selfOnly && (el2 = el2.parentNode));
    }
    var matrixFn = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
    return matrixFn && new matrixFn(appliedTransforms);
  }
  function find(ctx, tagName, iterator) {
    if (ctx) {
      var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
      if (iterator) {
        for (; i < n; i++) {
          iterator(list[i], i);
        }
      }
      return list;
    }
    return [];
  }
  function getWindowScrollingElement() {
    var scrollingElement = document.scrollingElement;
    if (scrollingElement) {
      return scrollingElement;
    } else {
      return document.documentElement;
    }
  }
  function getRect(el2, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
    if (!el2.getBoundingClientRect && el2 !== window) return;
    var elRect, top, left, bottom, right, height, width;
    if (el2 !== window && el2.parentNode && el2 !== getWindowScrollingElement()) {
      elRect = el2.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width;
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth;
    }
    if ((relativeToContainingBlock || relativeToNonStaticParent) && el2 !== window) {
      container = container || el2.parentNode;
      if (!IE11OrLess) {
        do {
          if (container && container.getBoundingClientRect && (css(container, "transform") !== "none" || relativeToNonStaticParent && css(container, "position") !== "static")) {
            var containerRect = container.getBoundingClientRect();
            top -= containerRect.top + parseInt(css(container, "border-top-width"));
            left -= containerRect.left + parseInt(css(container, "border-left-width"));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break;
          }
        } while (container = container.parentNode);
      }
    }
    if (undoScale && el2 !== window) {
      var elMatrix = matrix(container || el2), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
      if (elMatrix) {
        top /= scaleY;
        left /= scaleX;
        width /= scaleX;
        height /= scaleY;
        bottom = top + height;
        right = left + width;
      }
    }
    return {
      top,
      left,
      bottom,
      right,
      width,
      height
    };
  }
  function isScrolledPast(el2, elSide, parentSide) {
    var parent = getParentAutoScrollElement(el2, true), elSideVal = getRect(el2)[elSide];
    while (parent) {
      var parentSideVal = getRect(parent)[parentSide], visible = void 0;
      if (parentSide === "top" || parentSide === "left") {
        visible = elSideVal >= parentSideVal;
      } else {
        visible = elSideVal <= parentSideVal;
      }
      if (!visible) return parent;
      if (parent === getWindowScrollingElement()) break;
      parent = getParentAutoScrollElement(parent, false);
    }
    return false;
  }
  function getChild(el2, childNum, options, includeDragEl) {
    var currentChild = 0, i = 0, children = el2.children;
    while (i < children.length) {
      if (children[i].style.display !== "none" && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el2, false)) {
        if (currentChild === childNum) {
          return children[i];
        }
        currentChild++;
      }
      i++;
    }
    return null;
  }
  function lastChild(el2, selector) {
    var last = el2.lastElementChild;
    while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
  }
  function index(el2, selector) {
    var index2 = 0;
    if (!el2 || !el2.parentNode) {
      return -1;
    }
    while (el2 = el2.previousElementSibling) {
      if (el2.nodeName.toUpperCase() !== "TEMPLATE" && el2 !== Sortable.clone && (!selector || matches(el2, selector))) {
        index2++;
      }
    }
    return index2;
  }
  function getRelativeScrollOffset(el2) {
    var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
    if (el2) {
      do {
        var elMatrix = matrix(el2), scaleX = elMatrix.a, scaleY = elMatrix.d;
        offsetLeft += el2.scrollLeft * scaleX;
        offsetTop += el2.scrollTop * scaleY;
      } while (el2 !== winScroller && (el2 = el2.parentNode));
    }
    return [offsetLeft, offsetTop];
  }
  function indexOfObject(arr, obj) {
    for (var i in arr) {
      if (!arr.hasOwnProperty(i)) continue;
      for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === arr[i][key]) return Number(i);
      }
    }
    return -1;
  }
  function getParentAutoScrollElement(el2, includeSelf) {
    if (!el2 || !el2.getBoundingClientRect) return getWindowScrollingElement();
    var elem = el2;
    var gotSelf = false;
    do {
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
          if (!elem.getBoundingClientRect || elem === document.body) return getWindowScrollingElement();
          if (gotSelf || includeSelf) return elem;
          gotSelf = true;
        }
      }
    } while (elem = elem.parentNode);
    return getWindowScrollingElement();
  }
  function extend(dst, src) {
    if (dst && src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key];
        }
      }
    }
    return dst;
  }
  function isRectEqual(rect1, rect2) {
    return Math.round(rect1.top) === Math.round(rect2.top) && Math.round(rect1.left) === Math.round(rect2.left) && Math.round(rect1.height) === Math.round(rect2.height) && Math.round(rect1.width) === Math.round(rect2.width);
  }
  var _throttleTimeout;
  function throttle(callback, ms) {
    return function() {
      if (!_throttleTimeout) {
        var args = arguments, _this = this;
        if (args.length === 1) {
          callback.call(_this, args[0]);
        } else {
          callback.apply(_this, args);
        }
        _throttleTimeout = setTimeout(function() {
          _throttleTimeout = void 0;
        }, ms);
      }
    };
  }
  function cancelThrottle() {
    clearTimeout(_throttleTimeout);
    _throttleTimeout = void 0;
  }
  function scrollBy(el2, x, y) {
    el2.scrollLeft += x;
    el2.scrollTop += y;
  }
  function clone(el2) {
    var Polymer = window.Polymer;
    var $ = window.jQuery || window.Zepto;
    if (Polymer && Polymer.dom) {
      return Polymer.dom(el2).cloneNode(true);
    } else if ($) {
      return $(el2).clone(true)[0];
    } else {
      return el2.cloneNode(true);
    }
  }
  function getChildContainingRectFromElement(container, options, ghostEl2) {
    var rect = {};
    Array.from(container.children).forEach(function(child) {
      var _rect$left, _rect$top, _rect$right, _rect$bottom;
      if (!closest(child, options.draggable, container, false) || child.animated || child === ghostEl2) return;
      var childRect = getRect(child);
      rect.left = Math.min((_rect$left = rect.left) !== null && _rect$left !== void 0 ? _rect$left : Infinity, childRect.left);
      rect.top = Math.min((_rect$top = rect.top) !== null && _rect$top !== void 0 ? _rect$top : Infinity, childRect.top);
      rect.right = Math.max((_rect$right = rect.right) !== null && _rect$right !== void 0 ? _rect$right : -Infinity, childRect.right);
      rect.bottom = Math.max((_rect$bottom = rect.bottom) !== null && _rect$bottom !== void 0 ? _rect$bottom : -Infinity, childRect.bottom);
    });
    rect.width = rect.right - rect.left;
    rect.height = rect.bottom - rect.top;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }
  var expando = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
  function AnimationStateManager() {
    var animationStates = [], animationCallbackId;
    return {
      captureAnimationState: function captureAnimationState() {
        animationStates = [];
        if (!this.options.animation) return;
        var children = [].slice.call(this.el.children);
        children.forEach(function(child) {
          if (css(child, "display") === "none" || child === Sortable.ghost) return;
          animationStates.push({
            target: child,
            rect: getRect(child)
          });
          var fromRect = _objectSpread2({}, animationStates[animationStates.length - 1].rect);
          if (child.thisAnimationDuration) {
            var childMatrix = matrix(child, true);
            if (childMatrix) {
              fromRect.top -= childMatrix.f;
              fromRect.left -= childMatrix.e;
            }
          }
          child.fromRect = fromRect;
        });
      },
      addAnimationState: function addAnimationState(state) {
        animationStates.push(state);
      },
      removeAnimationState: function removeAnimationState(target) {
        animationStates.splice(indexOfObject(animationStates, {
          target
        }), 1);
      },
      animateAll: function animateAll(callback) {
        var _this = this;
        if (!this.options.animation) {
          clearTimeout(animationCallbackId);
          if (typeof callback === "function") callback();
          return;
        }
        var animating = false, animationTime = 0;
        animationStates.forEach(function(state) {
          var time = 0, target = state.target, fromRect = target.fromRect, toRect = getRect(target), prevFromRect = target.prevFromRect, prevToRect = target.prevToRect, animatingRect = state.rect, targetMatrix = matrix(target, true);
          if (targetMatrix) {
            toRect.top -= targetMatrix.f;
            toRect.left -= targetMatrix.e;
          }
          target.toRect = toRect;
          if (target.thisAnimationDuration) {
            if (isRectEqual(prevFromRect, toRect) && !isRectEqual(fromRect, toRect) && // Make sure animatingRect is on line between toRect & fromRect
            (animatingRect.top - toRect.top) / (animatingRect.left - toRect.left) === (fromRect.top - toRect.top) / (fromRect.left - toRect.left)) {
              time = calculateRealTime(animatingRect, prevFromRect, prevToRect, _this.options);
            }
          }
          if (!isRectEqual(toRect, fromRect)) {
            target.prevFromRect = fromRect;
            target.prevToRect = toRect;
            if (!time) {
              time = _this.options.animation;
            }
            _this.animate(target, animatingRect, toRect, time);
          }
          if (time) {
            animating = true;
            animationTime = Math.max(animationTime, time);
            clearTimeout(target.animationResetTimer);
            target.animationResetTimer = setTimeout(function() {
              target.animationTime = 0;
              target.prevFromRect = null;
              target.fromRect = null;
              target.prevToRect = null;
              target.thisAnimationDuration = null;
            }, time);
            target.thisAnimationDuration = time;
          }
        });
        clearTimeout(animationCallbackId);
        if (!animating) {
          if (typeof callback === "function") callback();
        } else {
          animationCallbackId = setTimeout(function() {
            if (typeof callback === "function") callback();
          }, animationTime);
        }
        animationStates = [];
      },
      animate: function animate(target, currentRect, toRect, duration) {
        if (duration) {
          css(target, "transition", "");
          css(target, "transform", "");
          var elMatrix = matrix(this.el), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d, translateX = (currentRect.left - toRect.left) / (scaleX || 1), translateY = (currentRect.top - toRect.top) / (scaleY || 1);
          target.animatingX = !!translateX;
          target.animatingY = !!translateY;
          css(target, "transform", "translate3d(" + translateX + "px," + translateY + "px,0)");
          this.forRepaintDummy = repaint(target);
          css(target, "transition", "transform " + duration + "ms" + (this.options.easing ? " " + this.options.easing : ""));
          css(target, "transform", "translate3d(0,0,0)");
          typeof target.animated === "number" && clearTimeout(target.animated);
          target.animated = setTimeout(function() {
            css(target, "transition", "");
            css(target, "transform", "");
            target.animated = false;
            target.animatingX = false;
            target.animatingY = false;
          }, duration);
        }
      }
    };
  }
  function repaint(target) {
    return target.offsetWidth;
  }
  function calculateRealTime(animatingRect, fromRect, toRect, options) {
    return Math.sqrt(Math.pow(fromRect.top - animatingRect.top, 2) + Math.pow(fromRect.left - animatingRect.left, 2)) / Math.sqrt(Math.pow(fromRect.top - toRect.top, 2) + Math.pow(fromRect.left - toRect.left, 2)) * options.animation;
  }
  var plugins = [];
  var defaults = {
    initializeByDefault: true
  };
  var PluginManager = {
    mount: function mount(plugin) {
      for (var option2 in defaults) {
        if (defaults.hasOwnProperty(option2) && !(option2 in plugin)) {
          plugin[option2] = defaults[option2];
        }
      }
      plugins.forEach(function(p) {
        if (p.pluginName === plugin.pluginName) {
          throw "Sortable: Cannot mount plugin ".concat(plugin.pluginName, " more than once");
        }
      });
      plugins.push(plugin);
    },
    pluginEvent: function pluginEvent(eventName, sortable, evt) {
      var _this = this;
      this.eventCanceled = false;
      evt.cancel = function() {
        _this.eventCanceled = true;
      };
      var eventNameGlobal = eventName + "Global";
      plugins.forEach(function(plugin) {
        if (!sortable[plugin.pluginName]) return;
        if (sortable[plugin.pluginName][eventNameGlobal]) {
          sortable[plugin.pluginName][eventNameGlobal](_objectSpread2({
            sortable
          }, evt));
        }
        if (sortable.options[plugin.pluginName] && sortable[plugin.pluginName][eventName]) {
          sortable[plugin.pluginName][eventName](_objectSpread2({
            sortable
          }, evt));
        }
      });
    },
    initializePlugins: function initializePlugins(sortable, el2, defaults2, options) {
      plugins.forEach(function(plugin) {
        var pluginName = plugin.pluginName;
        if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
        var initialized = new plugin(sortable, el2, sortable.options);
        initialized.sortable = sortable;
        initialized.options = sortable.options;
        sortable[pluginName] = initialized;
        _extends(defaults2, initialized.defaults);
      });
      for (var option2 in sortable.options) {
        if (!sortable.options.hasOwnProperty(option2)) continue;
        var modified = this.modifyOption(sortable, option2, sortable.options[option2]);
        if (typeof modified !== "undefined") {
          sortable.options[option2] = modified;
        }
      }
    },
    getEventProperties: function getEventProperties(name, sortable) {
      var eventProperties = {};
      plugins.forEach(function(plugin) {
        if (typeof plugin.eventProperties !== "function") return;
        _extends(eventProperties, plugin.eventProperties.call(sortable[plugin.pluginName], name));
      });
      return eventProperties;
    },
    modifyOption: function modifyOption(sortable, name, value) {
      var modifiedValue;
      plugins.forEach(function(plugin) {
        if (!sortable[plugin.pluginName]) return;
        if (plugin.optionListeners && typeof plugin.optionListeners[name] === "function") {
          modifiedValue = plugin.optionListeners[name].call(sortable[plugin.pluginName], value);
        }
      });
      return modifiedValue;
    }
  };
  function dispatchEvent(_ref) {
    var sortable = _ref.sortable, rootEl2 = _ref.rootEl, name = _ref.name, targetEl = _ref.targetEl, cloneEl2 = _ref.cloneEl, toEl = _ref.toEl, fromEl = _ref.fromEl, oldIndex2 = _ref.oldIndex, newIndex2 = _ref.newIndex, oldDraggableIndex2 = _ref.oldDraggableIndex, newDraggableIndex2 = _ref.newDraggableIndex, originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, extraEventProperties = _ref.extraEventProperties;
    sortable = sortable || rootEl2 && rootEl2[expando];
    if (!sortable) return;
    var evt, options = sortable.options, onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent(name, {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent("Event");
      evt.initEvent(name, true, true);
    }
    evt.to = toEl || rootEl2;
    evt.from = fromEl || rootEl2;
    evt.item = targetEl || rootEl2;
    evt.clone = cloneEl2;
    evt.oldIndex = oldIndex2;
    evt.newIndex = newIndex2;
    evt.oldDraggableIndex = oldDraggableIndex2;
    evt.newDraggableIndex = newDraggableIndex2;
    evt.originalEvent = originalEvent;
    evt.pullMode = putSortable2 ? putSortable2.lastPutMode : void 0;
    var allEventProperties = _objectSpread2(_objectSpread2({}, extraEventProperties), PluginManager.getEventProperties(name, sortable));
    for (var option2 in allEventProperties) {
      evt[option2] = allEventProperties[option2];
    }
    if (rootEl2) {
      rootEl2.dispatchEvent(evt);
    }
    if (options[onName]) {
      options[onName].call(sortable, evt);
    }
  }
  var _excluded = ["evt"];
  var pluginEvent2 = function pluginEvent3(eventName, sortable) {
    var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, originalEvent = _ref.evt, data = _objectWithoutProperties(_ref, _excluded);
    PluginManager.pluginEvent.bind(Sortable)(eventName, sortable, _objectSpread2({
      dragEl,
      parentEl,
      ghostEl,
      rootEl,
      nextEl,
      lastDownEl,
      cloneEl,
      cloneHidden,
      dragStarted: moved,
      putSortable,
      activeSortable: Sortable.active,
      originalEvent,
      oldIndex,
      oldDraggableIndex,
      newIndex,
      newDraggableIndex,
      hideGhostForTarget: _hideGhostForTarget,
      unhideGhostForTarget: _unhideGhostForTarget,
      cloneNowHidden: function cloneNowHidden() {
        cloneHidden = true;
      },
      cloneNowShown: function cloneNowShown() {
        cloneHidden = false;
      },
      dispatchSortableEvent: function dispatchSortableEvent(name) {
        _dispatchEvent({
          sortable,
          name,
          originalEvent
        });
      }
    }, data));
  };
  function _dispatchEvent(info) {
    dispatchEvent(_objectSpread2({
      putSortable,
      cloneEl,
      targetEl: dragEl,
      rootEl,
      oldIndex,
      oldDraggableIndex,
      newIndex,
      newDraggableIndex
    }, info));
  }
  var dragEl;
  var parentEl;
  var ghostEl;
  var rootEl;
  var nextEl;
  var lastDownEl;
  var cloneEl;
  var cloneHidden;
  var oldIndex;
  var newIndex;
  var oldDraggableIndex;
  var newDraggableIndex;
  var activeGroup;
  var putSortable;
  var awaitingDragStarted = false;
  var ignoreNextClick = false;
  var sortables = [];
  var tapEvt;
  var touchEvt;
  var lastDx;
  var lastDy;
  var tapDistanceLeft;
  var tapDistanceTop;
  var moved;
  var lastTarget;
  var lastDirection;
  var pastFirstInvertThresh = false;
  var isCircumstantialInvert = false;
  var targetMoveDistance;
  var ghostRelativeParent;
  var ghostRelativeParentInitialScroll = [];
  var _silent = false;
  var savedInputChecked = [];
  var documentExists = typeof document !== "undefined";
  var PositionGhostAbsolutely = IOS;
  var CSSFloatProperty = Edge || IE11OrLess ? "cssFloat" : "float";
  var supportDraggable = documentExists && !ChromeForAndroid && !IOS && "draggable" in document.createElement("div");
  var supportCssPointerEvents = (function() {
    if (!documentExists) return;
    if (IE11OrLess) {
      return false;
    }
    var el2 = document.createElement("x");
    el2.style.cssText = "pointer-events:auto";
    return el2.style.pointerEvents === "auto";
  })();
  var _detectDirection = function _detectDirection2(el2, options) {
    var elCSS = css(el2), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el2, 0, options), child2 = getChild(el2, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
    if (elCSS.display === "flex") {
      return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical" : "horizontal";
    }
    if (elCSS.display === "grid") {
      return elCSS.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
    }
    if (child1 && firstChildCSS["float"] && firstChildCSS["float"] !== "none") {
      var touchingSideChild2 = firstChildCSS["float"] === "left" ? "left" : "right";
      return child2 && (secondChildCSS.clear === "both" || secondChildCSS.clear === touchingSideChild2) ? "vertical" : "horizontal";
    }
    return child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical" : "horizontal";
  };
  var _dragElInRowColumn = function _dragElInRowColumn2(dragRect, targetRect, vertical) {
    var dragElS1Opp = vertical ? dragRect.left : dragRect.top, dragElS2Opp = vertical ? dragRect.right : dragRect.bottom, dragElOppLength = vertical ? dragRect.width : dragRect.height, targetS1Opp = vertical ? targetRect.left : targetRect.top, targetS2Opp = vertical ? targetRect.right : targetRect.bottom, targetOppLength = vertical ? targetRect.width : targetRect.height;
    return dragElS1Opp === targetS1Opp || dragElS2Opp === targetS2Opp || dragElS1Opp + dragElOppLength / 2 === targetS1Opp + targetOppLength / 2;
  };
  var _detectNearestEmptySortable = function _detectNearestEmptySortable2(x, y) {
    var ret;
    sortables.some(function(sortable) {
      var threshold = sortable[expando].options.emptyInsertThreshold;
      if (!threshold || lastChild(sortable)) return;
      var rect = getRect(sortable), insideHorizontally = x >= rect.left - threshold && x <= rect.right + threshold, insideVertically = y >= rect.top - threshold && y <= rect.bottom + threshold;
      if (insideHorizontally && insideVertically) {
        return ret = sortable;
      }
    });
    return ret;
  };
  var _prepareGroup = function _prepareGroup2(options) {
    function toFn(value, pull) {
      return function(to, from, dragEl2, evt) {
        var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
        if (value == null && (pull || sameGroup)) {
          return true;
        } else if (value == null || value === false) {
          return false;
        } else if (pull && value === "clone") {
          return value;
        } else if (typeof value === "function") {
          return toFn(value(to, from, dragEl2, evt), pull)(to, from, dragEl2, evt);
        } else {
          var otherGroup = (pull ? to : from).options.group.name;
          return value === true || typeof value === "string" && value === otherGroup || value.join && value.indexOf(otherGroup) > -1;
        }
      };
    }
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || _typeof(originalGroup) != "object") {
      originalGroup = {
        name: originalGroup
      };
    }
    group.name = originalGroup.name;
    group.checkPull = toFn(originalGroup.pull, true);
    group.checkPut = toFn(originalGroup.put);
    group.revertClone = originalGroup.revertClone;
    options.group = group;
  };
  var _hideGhostForTarget = function _hideGhostForTarget2() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, "display", "none");
    }
  };
  var _unhideGhostForTarget = function _unhideGhostForTarget2() {
    if (!supportCssPointerEvents && ghostEl) {
      css(ghostEl, "display", "");
    }
  };
  if (documentExists && !ChromeForAndroid) {
    document.addEventListener("click", function(evt) {
      if (ignoreNextClick) {
        evt.preventDefault();
        evt.stopPropagation && evt.stopPropagation();
        evt.stopImmediatePropagation && evt.stopImmediatePropagation();
        ignoreNextClick = false;
        return false;
      }
    }, true);
  }
  var nearestEmptyInsertDetectEvent = function nearestEmptyInsertDetectEvent2(evt) {
    if (dragEl) {
      evt = evt.touches ? evt.touches[0] : evt;
      var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
      if (nearest) {
        var event = {};
        for (var i in evt) {
          if (evt.hasOwnProperty(i)) {
            event[i] = evt[i];
          }
        }
        event.target = event.rootEl = nearest;
        event.preventDefault = void 0;
        event.stopPropagation = void 0;
        nearest[expando]._onDragOver(event);
      }
    }
  };
  var _checkOutsideTargetEl = function _checkOutsideTargetEl2(evt) {
    if (dragEl) {
      dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
    }
  };
  function Sortable(el2, options) {
    if (!(el2 && el2.nodeType && el2.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el2));
    }
    this.el = el2;
    this.options = options = _extends({}, options);
    el2[expando] = this;
    var defaults2 = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      draggable: /^[uo]l$/i.test(el2.nodeName) ? ">li" : ">*",
      swapThreshold: 1,
      // percentage; 0 <= x <= 1
      invertSwap: false,
      // invert always
      invertedSwapThreshold: null,
      // will be set to same as swapThreshold if default
      removeCloneOnHide: true,
      direction: function direction() {
        return _detectDirection(el2, this.options);
      },
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      ignore: "a, img",
      filter: null,
      preventOnFilter: true,
      animation: 0,
      easing: null,
      setData: function setData(dataTransfer, dragEl2) {
        dataTransfer.setData("Text", dragEl2.textContent);
      },
      dropBubble: false,
      dragoverBubble: false,
      dataIdAttr: "data-id",
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
      forceFallback: false,
      fallbackClass: "sortable-fallback",
      fallbackOnBody: false,
      fallbackTolerance: 0,
      fallbackOffset: {
        x: 0,
        y: 0
      },
      // Disabled on Safari: #1571; Enabled on Safari IOS: #2244
      supportPointer: Sortable.supportPointer !== false && "PointerEvent" in window && (!Safari || IOS),
      emptyInsertThreshold: 5
    };
    PluginManager.initializePlugins(this, el2, defaults2);
    for (var name in defaults2) {
      !(name in options) && (options[name] = defaults2[name]);
    }
    _prepareGroup(options);
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this);
      }
    }
    this.nativeDraggable = options.forceFallback ? false : supportDraggable;
    if (this.nativeDraggable) {
      this.options.touchStartThreshold = 1;
    }
    if (options.supportPointer) {
      on(el2, "pointerdown", this._onTapStart);
    } else {
      on(el2, "mousedown", this._onTapStart);
      on(el2, "touchstart", this._onTapStart);
    }
    if (this.nativeDraggable) {
      on(el2, "dragover", this);
      on(el2, "dragenter", this);
    }
    sortables.push(this.el);
    options.store && options.store.get && this.sort(options.store.get(this) || []);
    _extends(this, AnimationStateManager());
  }
  Sortable.prototype = /** @lends Sortable.prototype */
  {
    constructor: Sortable,
    _isOutsideThisEl: function _isOutsideThisEl(target) {
      if (!this.el.contains(target) && target !== this.el) {
        lastTarget = null;
      }
    },
    _getDirection: function _getDirection(evt, target) {
      return typeof this.options.direction === "function" ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction;
    },
    _onTapStart: function _onTapStart(evt) {
      if (!evt.cancelable) return;
      var _this = this, el2 = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
      _saveInputCheckedState(el2);
      if (dragEl) {
        return;
      }
      if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
        return;
      }
      if (originalTarget.isContentEditable) {
        return;
      }
      if (!this.nativeDraggable && Safari && target && target.tagName.toUpperCase() === "SELECT") {
        return;
      }
      target = closest(target, options.draggable, el2, false);
      if (target && target.animated) {
        return;
      }
      if (lastDownEl === target) {
        return;
      }
      oldIndex = index(target);
      oldDraggableIndex = index(target, options.draggable);
      if (typeof filter === "function") {
        if (filter.call(this, evt, target, this)) {
          _dispatchEvent({
            sortable: _this,
            rootEl: originalTarget,
            name: "filter",
            targetEl: target,
            toEl: el2,
            fromEl: el2
          });
          pluginEvent2("filter", _this, {
            evt
          });
          preventOnFilter && evt.preventDefault();
          return;
        }
      } else if (filter) {
        filter = filter.split(",").some(function(criteria) {
          criteria = closest(originalTarget, criteria.trim(), el2, false);
          if (criteria) {
            _dispatchEvent({
              sortable: _this,
              rootEl: criteria,
              name: "filter",
              targetEl: target,
              fromEl: el2,
              toEl: el2
            });
            pluginEvent2("filter", _this, {
              evt
            });
            return true;
          }
        });
        if (filter) {
          preventOnFilter && evt.preventDefault();
          return;
        }
      }
      if (options.handle && !closest(originalTarget, options.handle, el2, false)) {
        return;
      }
      this._prepareDragStart(evt, touch, target);
    },
    _prepareDragStart: function _prepareDragStart(evt, touch, target) {
      var _this = this, el2 = _this.el, options = _this.options, ownerDocument = el2.ownerDocument, dragStartFn;
      if (target && !dragEl && target.parentNode === el2) {
        var dragRect = getRect(target);
        rootEl = el2;
        dragEl = target;
        parentEl = dragEl.parentNode;
        nextEl = dragEl.nextSibling;
        lastDownEl = target;
        activeGroup = options.group;
        Sortable.dragged = dragEl;
        tapEvt = {
          target: dragEl,
          clientX: (touch || evt).clientX,
          clientY: (touch || evt).clientY
        };
        tapDistanceLeft = tapEvt.clientX - dragRect.left;
        tapDistanceTop = tapEvt.clientY - dragRect.top;
        this._lastX = (touch || evt).clientX;
        this._lastY = (touch || evt).clientY;
        dragEl.style["will-change"] = "all";
        dragStartFn = function dragStartFn2() {
          pluginEvent2("delayEnded", _this, {
            evt
          });
          if (Sortable.eventCanceled) {
            _this._onDrop();
            return;
          }
          _this._disableDelayedDragEvents();
          if (!FireFox && _this.nativeDraggable) {
            dragEl.draggable = true;
          }
          _this._triggerDragStart(evt, touch);
          _dispatchEvent({
            sortable: _this,
            name: "choose",
            originalEvent: evt
          });
          toggleClass(dragEl, options.chosenClass, true);
        };
        options.ignore.split(",").forEach(function(criteria) {
          find(dragEl, criteria.trim(), _disableDraggable);
        });
        on(ownerDocument, "dragover", nearestEmptyInsertDetectEvent);
        on(ownerDocument, "mousemove", nearestEmptyInsertDetectEvent);
        on(ownerDocument, "touchmove", nearestEmptyInsertDetectEvent);
        if (options.supportPointer) {
          on(ownerDocument, "pointerup", _this._onDrop);
          !this.nativeDraggable && on(ownerDocument, "pointercancel", _this._onDrop);
        } else {
          on(ownerDocument, "mouseup", _this._onDrop);
          on(ownerDocument, "touchend", _this._onDrop);
          on(ownerDocument, "touchcancel", _this._onDrop);
        }
        if (FireFox && this.nativeDraggable) {
          this.options.touchStartThreshold = 4;
          dragEl.draggable = true;
        }
        pluginEvent2("delayStart", this, {
          evt
        });
        if (options.delay && (!options.delayOnTouchOnly || touch) && (!this.nativeDraggable || !(Edge || IE11OrLess))) {
          if (Sortable.eventCanceled) {
            this._onDrop();
            return;
          }
          if (options.supportPointer) {
            on(ownerDocument, "pointerup", _this._disableDelayedDrag);
            on(ownerDocument, "pointercancel", _this._disableDelayedDrag);
          } else {
            on(ownerDocument, "mouseup", _this._disableDelayedDrag);
            on(ownerDocument, "touchend", _this._disableDelayedDrag);
            on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
          }
          on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
          on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
          options.supportPointer && on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
          _this._dragStartTimer = setTimeout(dragStartFn, options.delay);
        } else {
          dragStartFn();
        }
      }
    },
    _delayedDragTouchMoveHandler: function _delayedDragTouchMoveHandler(e) {
      var touch = e.touches ? e.touches[0] : e;
      if (Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1))) {
        this._disableDelayedDrag();
      }
    },
    _disableDelayedDrag: function _disableDelayedDrag() {
      dragEl && _disableDraggable(dragEl);
      clearTimeout(this._dragStartTimer);
      this._disableDelayedDragEvents();
    },
    _disableDelayedDragEvents: function _disableDelayedDragEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, "mouseup", this._disableDelayedDrag);
      off(ownerDocument, "touchend", this._disableDelayedDrag);
      off(ownerDocument, "touchcancel", this._disableDelayedDrag);
      off(ownerDocument, "pointerup", this._disableDelayedDrag);
      off(ownerDocument, "pointercancel", this._disableDelayedDrag);
      off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
      off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
      off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler);
    },
    _triggerDragStart: function _triggerDragStart(evt, touch) {
      touch = touch || evt.pointerType == "touch" && evt;
      if (!this.nativeDraggable || touch) {
        if (this.options.supportPointer) {
          on(document, "pointermove", this._onTouchMove);
        } else if (touch) {
          on(document, "touchmove", this._onTouchMove);
        } else {
          on(document, "mousemove", this._onTouchMove);
        }
      } else {
        on(dragEl, "dragend", this);
        on(rootEl, "dragstart", this._onDragStart);
      }
      try {
        if (document.selection) {
          _nextTick(function() {
            document.selection.empty();
          });
        } else {
          window.getSelection().removeAllRanges();
        }
      } catch (err) {
      }
    },
    _dragStarted: function _dragStarted(fallback, evt) {
      awaitingDragStarted = false;
      if (rootEl && dragEl) {
        pluginEvent2("dragStarted", this, {
          evt
        });
        if (this.nativeDraggable) {
          on(document, "dragover", _checkOutsideTargetEl);
        }
        var options = this.options;
        !fallback && toggleClass(dragEl, options.dragClass, false);
        toggleClass(dragEl, options.ghostClass, true);
        Sortable.active = this;
        fallback && this._appendGhost();
        _dispatchEvent({
          sortable: this,
          name: "start",
          originalEvent: evt
        });
      } else {
        this._nulling();
      }
    },
    _emulateDragOver: function _emulateDragOver() {
      if (touchEvt) {
        this._lastX = touchEvt.clientX;
        this._lastY = touchEvt.clientY;
        _hideGhostForTarget();
        var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        var parent = target;
        while (target && target.shadowRoot) {
          target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          if (target === parent) break;
          parent = target;
        }
        dragEl.parentNode[expando]._isOutsideThisEl(target);
        if (parent) {
          do {
            if (parent[expando]) {
              var inserted = void 0;
              inserted = parent[expando]._onDragOver({
                clientX: touchEvt.clientX,
                clientY: touchEvt.clientY,
                target,
                rootEl: parent
              });
              if (inserted && !this.options.dragoverBubble) {
                break;
              }
            }
            target = parent;
          } while (parent = getParentOrHost(parent));
        }
        _unhideGhostForTarget();
      }
    },
    _onTouchMove: function _onTouchMove(evt) {
      if (tapEvt) {
        var options = this.options, fallbackTolerance = options.fallbackTolerance, fallbackOffset = options.fallbackOffset, touch = evt.touches ? evt.touches[0] : evt, ghostMatrix = ghostEl && matrix(ghostEl, true), scaleX = ghostEl && ghostMatrix && ghostMatrix.a, scaleY = ghostEl && ghostMatrix && ghostMatrix.d, relativeScrollOffset = PositionGhostAbsolutely && ghostRelativeParent && getRelativeScrollOffset(ghostRelativeParent), dx = (touch.clientX - tapEvt.clientX + fallbackOffset.x) / (scaleX || 1) + (relativeScrollOffset ? relativeScrollOffset[0] - ghostRelativeParentInitialScroll[0] : 0) / (scaleX || 1), dy = (touch.clientY - tapEvt.clientY + fallbackOffset.y) / (scaleY || 1) + (relativeScrollOffset ? relativeScrollOffset[1] - ghostRelativeParentInitialScroll[1] : 0) / (scaleY || 1);
        if (!Sortable.active && !awaitingDragStarted) {
          if (fallbackTolerance && Math.max(Math.abs(touch.clientX - this._lastX), Math.abs(touch.clientY - this._lastY)) < fallbackTolerance) {
            return;
          }
          this._onDragStart(evt, true);
        }
        if (ghostEl) {
          if (ghostMatrix) {
            ghostMatrix.e += dx - (lastDx || 0);
            ghostMatrix.f += dy - (lastDy || 0);
          } else {
            ghostMatrix = {
              a: 1,
              b: 0,
              c: 0,
              d: 1,
              e: dx,
              f: dy
            };
          }
          var cssMatrix = "matrix(".concat(ghostMatrix.a, ",").concat(ghostMatrix.b, ",").concat(ghostMatrix.c, ",").concat(ghostMatrix.d, ",").concat(ghostMatrix.e, ",").concat(ghostMatrix.f, ")");
          css(ghostEl, "webkitTransform", cssMatrix);
          css(ghostEl, "mozTransform", cssMatrix);
          css(ghostEl, "msTransform", cssMatrix);
          css(ghostEl, "transform", cssMatrix);
          lastDx = dx;
          lastDy = dy;
          touchEvt = touch;
        }
        evt.cancelable && evt.preventDefault();
      }
    },
    _appendGhost: function _appendGhost() {
      if (!ghostEl) {
        var container = this.options.fallbackOnBody ? document.body : rootEl, rect = getRect(dragEl, true, PositionGhostAbsolutely, true, container), options = this.options;
        if (PositionGhostAbsolutely) {
          ghostRelativeParent = container;
          while (css(ghostRelativeParent, "position") === "static" && css(ghostRelativeParent, "transform") === "none" && ghostRelativeParent !== document) {
            ghostRelativeParent = ghostRelativeParent.parentNode;
          }
          if (ghostRelativeParent !== document.body && ghostRelativeParent !== document.documentElement) {
            if (ghostRelativeParent === document) ghostRelativeParent = getWindowScrollingElement();
            rect.top += ghostRelativeParent.scrollTop;
            rect.left += ghostRelativeParent.scrollLeft;
          } else {
            ghostRelativeParent = getWindowScrollingElement();
          }
          ghostRelativeParentInitialScroll = getRelativeScrollOffset(ghostRelativeParent);
        }
        ghostEl = dragEl.cloneNode(true);
        toggleClass(ghostEl, options.ghostClass, false);
        toggleClass(ghostEl, options.fallbackClass, true);
        toggleClass(ghostEl, options.dragClass, true);
        css(ghostEl, "transition", "");
        css(ghostEl, "transform", "");
        css(ghostEl, "box-sizing", "border-box");
        css(ghostEl, "margin", 0);
        css(ghostEl, "top", rect.top);
        css(ghostEl, "left", rect.left);
        css(ghostEl, "width", rect.width);
        css(ghostEl, "height", rect.height);
        css(ghostEl, "opacity", "0.8");
        css(ghostEl, "position", PositionGhostAbsolutely ? "absolute" : "fixed");
        css(ghostEl, "zIndex", "100000");
        css(ghostEl, "pointerEvents", "none");
        Sortable.ghost = ghostEl;
        container.appendChild(ghostEl);
        css(ghostEl, "transform-origin", tapDistanceLeft / parseInt(ghostEl.style.width) * 100 + "% " + tapDistanceTop / parseInt(ghostEl.style.height) * 100 + "%");
      }
    },
    _onDragStart: function _onDragStart(evt, fallback) {
      var _this = this;
      var dataTransfer = evt.dataTransfer;
      var options = _this.options;
      pluginEvent2("dragStart", this, {
        evt
      });
      if (Sortable.eventCanceled) {
        this._onDrop();
        return;
      }
      pluginEvent2("setupClone", this);
      if (!Sortable.eventCanceled) {
        cloneEl = clone(dragEl);
        cloneEl.removeAttribute("id");
        cloneEl.draggable = false;
        cloneEl.style["will-change"] = "";
        this._hideClone();
        toggleClass(cloneEl, this.options.chosenClass, false);
        Sortable.clone = cloneEl;
      }
      _this.cloneId = _nextTick(function() {
        pluginEvent2("clone", _this);
        if (Sortable.eventCanceled) return;
        if (!_this.options.removeCloneOnHide) {
          rootEl.insertBefore(cloneEl, dragEl);
        }
        _this._hideClone();
        _dispatchEvent({
          sortable: _this,
          name: "clone"
        });
      });
      !fallback && toggleClass(dragEl, options.dragClass, true);
      if (fallback) {
        ignoreNextClick = true;
        _this._loopId = setInterval(_this._emulateDragOver, 50);
      } else {
        off(document, "mouseup", _this._onDrop);
        off(document, "touchend", _this._onDrop);
        off(document, "touchcancel", _this._onDrop);
        if (dataTransfer) {
          dataTransfer.effectAllowed = "move";
          options.setData && options.setData.call(_this, dataTransfer, dragEl);
        }
        on(document, "drop", _this);
        css(dragEl, "transform", "translateZ(0)");
      }
      awaitingDragStarted = true;
      _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback, evt));
      on(document, "selectstart", _this);
      moved = true;
      window.getSelection().removeAllRanges();
      if (Safari) {
        css(document.body, "user-select", "none");
      }
    },
    // Returns true - if no further action is needed (either inserted or another condition)
    _onDragOver: function _onDragOver(evt) {
      var el2 = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
      if (_silent) return;
      function dragOverEvent(name, extra) {
        pluginEvent2(name, _this, _objectSpread2({
          evt,
          isOwner,
          axis: vertical ? "vertical" : "horizontal",
          revert,
          dragRect,
          targetRect,
          canSort,
          fromSortable,
          target,
          completed,
          onMove: function onMove(target2, after2) {
            return _onMove(rootEl, el2, dragEl, dragRect, target2, getRect(target2), evt, after2);
          },
          changed
        }, extra));
      }
      function capture() {
        dragOverEvent("dragOverAnimationCapture");
        _this.captureAnimationState();
        if (_this !== fromSortable) {
          fromSortable.captureAnimationState();
        }
      }
      function completed(insertion) {
        dragOverEvent("dragOverCompleted", {
          insertion
        });
        if (insertion) {
          if (isOwner) {
            activeSortable._hideClone();
          } else {
            activeSortable._showClone(_this);
          }
          if (_this !== fromSortable) {
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : activeSortable.options.ghostClass, false);
            toggleClass(dragEl, options.ghostClass, true);
          }
          if (putSortable !== _this && _this !== Sortable.active) {
            putSortable = _this;
          } else if (_this === Sortable.active && putSortable) {
            putSortable = null;
          }
          if (fromSortable === _this) {
            _this._ignoreWhileAnimating = target;
          }
          _this.animateAll(function() {
            dragOverEvent("dragOverAnimationComplete");
            _this._ignoreWhileAnimating = null;
          });
          if (_this !== fromSortable) {
            fromSortable.animateAll();
            fromSortable._ignoreWhileAnimating = null;
          }
        }
        if (target === dragEl && !dragEl.animated || target === el2 && !target.animated) {
          lastTarget = null;
        }
        if (!options.dragoverBubble && !evt.rootEl && target !== document) {
          dragEl.parentNode[expando]._isOutsideThisEl(evt.target);
          !insertion && nearestEmptyInsertDetectEvent(evt);
        }
        !options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
        return completedFired = true;
      }
      function changed() {
        newIndex = index(dragEl);
        newDraggableIndex = index(dragEl, options.draggable);
        _dispatchEvent({
          sortable: _this,
          name: "change",
          toEl: el2,
          newIndex,
          newDraggableIndex,
          originalEvent: evt
        });
      }
      if (evt.preventDefault !== void 0) {
        evt.cancelable && evt.preventDefault();
      }
      target = closest(target, options.draggable, el2, true);
      dragOverEvent("dragOver");
      if (Sortable.eventCanceled) return completedFired;
      if (dragEl.contains(evt.target) || target.animated && target.animatingX && target.animatingY || _this._ignoreWhileAnimating === target) {
        return completed(false);
      }
      ignoreNextClick = false;
      if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = parentEl !== rootEl) : putSortable === this || (this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))) {
        vertical = this._getDirection(evt, target) === "vertical";
        dragRect = getRect(dragEl);
        dragOverEvent("dragOverValid");
        if (Sortable.eventCanceled) return completedFired;
        if (revert) {
          parentEl = rootEl;
          capture();
          this._hideClone();
          dragOverEvent("revert");
          if (!Sortable.eventCanceled) {
            if (nextEl) {
              rootEl.insertBefore(dragEl, nextEl);
            } else {
              rootEl.appendChild(dragEl);
            }
          }
          return completed(true);
        }
        var elLastChild = lastChild(el2, options.draggable);
        if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
          if (elLastChild === dragEl) {
            return completed(false);
          }
          if (elLastChild && el2 === evt.target) {
            target = elLastChild;
          }
          if (target) {
            targetRect = getRect(target);
          }
          if (_onMove(rootEl, el2, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
            capture();
            if (elLastChild && elLastChild.nextSibling) {
              el2.insertBefore(dragEl, elLastChild.nextSibling);
            } else {
              el2.appendChild(dragEl);
            }
            parentEl = el2;
            changed();
            return completed(true);
          }
        } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
          var firstChild = getChild(el2, 0, options, true);
          if (firstChild === dragEl) {
            return completed(false);
          }
          target = firstChild;
          targetRect = getRect(target);
          if (_onMove(rootEl, el2, dragEl, dragRect, target, targetRect, evt, false) !== false) {
            capture();
            el2.insertBefore(dragEl, firstChild);
            parentEl = el2;
            changed();
            return completed(true);
          }
        } else if (target.parentNode === el2) {
          targetRect = getRect(target);
          var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el2, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
          if (lastTarget !== target) {
            targetBeforeFirstSwap = targetRect[side1];
            pastFirstInvertThresh = false;
            isCircumstantialInvert = !differentRowCol && options.invertSwap || differentLevel;
          }
          direction = _getSwapDirection(evt, target, targetRect, vertical, differentRowCol ? 1 : options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold : options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
          var sibling;
          if (direction !== 0) {
            var dragIndex = index(dragEl);
            do {
              dragIndex -= direction;
              sibling = parentEl.children[dragIndex];
            } while (sibling && (css(sibling, "display") === "none" || sibling === ghostEl));
          }
          if (direction === 0 || sibling === target) {
            return completed(false);
          }
          lastTarget = target;
          lastDirection = direction;
          var nextSibling = target.nextElementSibling, after = false;
          after = direction === 1;
          var moveVector = _onMove(rootEl, el2, dragEl, dragRect, target, targetRect, evt, after);
          if (moveVector !== false) {
            if (moveVector === 1 || moveVector === -1) {
              after = moveVector === 1;
            }
            _silent = true;
            setTimeout(_unsilent, 30);
            capture();
            if (after && !nextSibling) {
              el2.appendChild(dragEl);
            } else {
              target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
            }
            if (scrolledPastTop) {
              scrollBy(scrolledPastTop, 0, scrollBefore - scrolledPastTop.scrollTop);
            }
            parentEl = dragEl.parentNode;
            if (targetBeforeFirstSwap !== void 0 && !isCircumstantialInvert) {
              targetMoveDistance = Math.abs(targetBeforeFirstSwap - getRect(target)[side1]);
            }
            changed();
            return completed(true);
          }
        }
        if (el2.contains(dragEl)) {
          return completed(false);
        }
      }
      return false;
    },
    _ignoreWhileAnimating: null,
    _offMoveEvents: function _offMoveEvents() {
      off(document, "mousemove", this._onTouchMove);
      off(document, "touchmove", this._onTouchMove);
      off(document, "pointermove", this._onTouchMove);
      off(document, "dragover", nearestEmptyInsertDetectEvent);
      off(document, "mousemove", nearestEmptyInsertDetectEvent);
      off(document, "touchmove", nearestEmptyInsertDetectEvent);
    },
    _offUpEvents: function _offUpEvents() {
      var ownerDocument = this.el.ownerDocument;
      off(ownerDocument, "mouseup", this._onDrop);
      off(ownerDocument, "touchend", this._onDrop);
      off(ownerDocument, "pointerup", this._onDrop);
      off(ownerDocument, "pointercancel", this._onDrop);
      off(ownerDocument, "touchcancel", this._onDrop);
      off(document, "selectstart", this);
    },
    _onDrop: function _onDrop(evt) {
      var el2 = this.el, options = this.options;
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      pluginEvent2("drop", this, {
        evt
      });
      parentEl = dragEl && dragEl.parentNode;
      newIndex = index(dragEl);
      newDraggableIndex = index(dragEl, options.draggable);
      if (Sortable.eventCanceled) {
        this._nulling();
        return;
      }
      awaitingDragStarted = false;
      isCircumstantialInvert = false;
      pastFirstInvertThresh = false;
      clearInterval(this._loopId);
      clearTimeout(this._dragStartTimer);
      _cancelNextTick(this.cloneId);
      _cancelNextTick(this._dragStartId);
      if (this.nativeDraggable) {
        off(document, "drop", this);
        off(el2, "dragstart", this._onDragStart);
      }
      this._offMoveEvents();
      this._offUpEvents();
      if (Safari) {
        css(document.body, "user-select", "");
      }
      css(dragEl, "transform", "");
      if (evt) {
        if (moved) {
          evt.cancelable && evt.preventDefault();
          !options.dropBubble && evt.stopPropagation();
        }
        ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
        if (rootEl === parentEl || putSortable && putSortable.lastPutMode !== "clone") {
          cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl);
        }
        if (dragEl) {
          if (this.nativeDraggable) {
            off(dragEl, "dragend", this);
          }
          _disableDraggable(dragEl);
          dragEl.style["will-change"] = "";
          if (moved && !awaitingDragStarted) {
            toggleClass(dragEl, putSortable ? putSortable.options.ghostClass : this.options.ghostClass, false);
          }
          toggleClass(dragEl, this.options.chosenClass, false);
          _dispatchEvent({
            sortable: this,
            name: "unchoose",
            toEl: parentEl,
            newIndex: null,
            newDraggableIndex: null,
            originalEvent: evt
          });
          if (rootEl !== parentEl) {
            if (newIndex >= 0) {
              _dispatchEvent({
                rootEl: parentEl,
                name: "add",
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "remove",
                toEl: parentEl,
                originalEvent: evt
              });
              _dispatchEvent({
                rootEl: parentEl,
                name: "sort",
                toEl: parentEl,
                fromEl: rootEl,
                originalEvent: evt
              });
              _dispatchEvent({
                sortable: this,
                name: "sort",
                toEl: parentEl,
                originalEvent: evt
              });
            }
            putSortable && putSortable.save();
          } else {
            if (newIndex !== oldIndex) {
              if (newIndex >= 0) {
                _dispatchEvent({
                  sortable: this,
                  name: "update",
                  toEl: parentEl,
                  originalEvent: evt
                });
                _dispatchEvent({
                  sortable: this,
                  name: "sort",
                  toEl: parentEl,
                  originalEvent: evt
                });
              }
            }
          }
          if (Sortable.active) {
            if (newIndex == null || newIndex === -1) {
              newIndex = oldIndex;
              newDraggableIndex = oldDraggableIndex;
            }
            _dispatchEvent({
              sortable: this,
              name: "end",
              toEl: parentEl,
              originalEvent: evt
            });
            this.save();
          }
        }
      }
      this._nulling();
    },
    _nulling: function _nulling() {
      pluginEvent2("nulling", this);
      rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = cloneHidden = tapEvt = touchEvt = moved = newIndex = newDraggableIndex = oldIndex = oldDraggableIndex = lastTarget = lastDirection = putSortable = activeGroup = Sortable.dragged = Sortable.ghost = Sortable.clone = Sortable.active = null;
      var el2 = this.el;
      savedInputChecked.forEach(function(checkEl) {
        if (el2.contains(checkEl)) {
          checkEl.checked = true;
        }
      });
      savedInputChecked.length = lastDx = lastDy = 0;
    },
    handleEvent: function handleEvent(evt) {
      switch (evt.type) {
        case "drop":
        case "dragend":
          this._onDrop(evt);
          break;
        case "dragenter":
        case "dragover":
          if (dragEl) {
            this._onDragOver(evt);
            _globalDragOver(evt);
          }
          break;
        case "selectstart":
          evt.preventDefault();
          break;
      }
    },
    /**
     * Serializes the item into an array of string.
     * @returns {String[]}
     */
    toArray: function toArray() {
      var order = [], el2, children = this.el.children, i = 0, n = children.length, options = this.options;
      for (; i < n; i++) {
        el2 = children[i];
        if (closest(el2, options.draggable, this.el, false)) {
          order.push(el2.getAttribute(options.dataIdAttr) || _generateId(el2));
        }
      }
      return order;
    },
    /**
     * Sorts the elements according to the array.
     * @param  {String[]}  order  order of the items
     */
    sort: function sort(order, useAnimation) {
      var items = {}, rootEl2 = this.el;
      this.toArray().forEach(function(id, i) {
        var el2 = rootEl2.children[i];
        if (closest(el2, this.options.draggable, rootEl2, false)) {
          items[id] = el2;
        }
      }, this);
      useAnimation && this.captureAnimationState();
      order.forEach(function(id) {
        if (items[id]) {
          rootEl2.removeChild(items[id]);
          rootEl2.appendChild(items[id]);
        }
      });
      useAnimation && this.animateAll();
    },
    /**
     * Save the current sorting
     */
    save: function save() {
      var store = this.options.store;
      store && store.set && store.set(this);
    },
    /**
     * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
     * @param   {HTMLElement}  el
     * @param   {String}       [selector]  default: `options.draggable`
     * @returns {HTMLElement|null}
     */
    closest: function closest$1(el2, selector) {
      return closest(el2, selector || this.options.draggable, this.el, false);
    },
    /**
     * Set/get option
     * @param   {string} name
     * @param   {*}      [value]
     * @returns {*}
     */
    option: function option(name, value) {
      var options = this.options;
      if (value === void 0) {
        return options[name];
      } else {
        var modifiedValue = PluginManager.modifyOption(this, name, value);
        if (typeof modifiedValue !== "undefined") {
          options[name] = modifiedValue;
        } else {
          options[name] = value;
        }
        if (name === "group") {
          _prepareGroup(options);
        }
      }
    },
    /**
     * Destroy
     */
    destroy: function destroy() {
      pluginEvent2("destroy", this);
      var el2 = this.el;
      el2[expando] = null;
      off(el2, "mousedown", this._onTapStart);
      off(el2, "touchstart", this._onTapStart);
      off(el2, "pointerdown", this._onTapStart);
      if (this.nativeDraggable) {
        off(el2, "dragover", this);
        off(el2, "dragenter", this);
      }
      Array.prototype.forEach.call(el2.querySelectorAll("[draggable]"), function(el3) {
        el3.removeAttribute("draggable");
      });
      this._onDrop();
      this._disableDelayedDragEvents();
      sortables.splice(sortables.indexOf(this.el), 1);
      this.el = el2 = null;
    },
    _hideClone: function _hideClone() {
      if (!cloneHidden) {
        pluginEvent2("hideClone", this);
        if (Sortable.eventCanceled) return;
        css(cloneEl, "display", "none");
        if (this.options.removeCloneOnHide && cloneEl.parentNode) {
          cloneEl.parentNode.removeChild(cloneEl);
        }
        cloneHidden = true;
      }
    },
    _showClone: function _showClone(putSortable2) {
      if (putSortable2.lastPutMode !== "clone") {
        this._hideClone();
        return;
      }
      if (cloneHidden) {
        pluginEvent2("showClone", this);
        if (Sortable.eventCanceled) return;
        if (dragEl.parentNode == rootEl && !this.options.group.revertClone) {
          rootEl.insertBefore(cloneEl, dragEl);
        } else if (nextEl) {
          rootEl.insertBefore(cloneEl, nextEl);
        } else {
          rootEl.appendChild(cloneEl);
        }
        if (this.options.group.revertClone) {
          this.animate(dragEl, cloneEl);
        }
        css(cloneEl, "display", "");
        cloneHidden = false;
      }
    }
  };
  function _globalDragOver(evt) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = "move";
    }
    evt.cancelable && evt.preventDefault();
  }
  function _onMove(fromEl, toEl, dragEl2, dragRect, targetEl, targetRect, originalEvent, willInsertAfter) {
    var evt, sortable = fromEl[expando], onMoveFn = sortable.options.onMove, retVal;
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent("move", {
        bubbles: true,
        cancelable: true
      });
    } else {
      evt = document.createEvent("Event");
      evt.initEvent("move", true, true);
    }
    evt.to = toEl;
    evt.from = fromEl;
    evt.dragged = dragEl2;
    evt.draggedRect = dragRect;
    evt.related = targetEl || toEl;
    evt.relatedRect = targetRect || getRect(toEl);
    evt.willInsertAfter = willInsertAfter;
    evt.originalEvent = originalEvent;
    fromEl.dispatchEvent(evt);
    if (onMoveFn) {
      retVal = onMoveFn.call(sortable, evt, originalEvent);
    }
    return retVal;
  }
  function _disableDraggable(el2) {
    el2.draggable = false;
  }
  function _unsilent() {
    _silent = false;
  }
  function _ghostIsFirst(evt, vertical, sortable) {
    var firstElRect = getRect(getChild(sortable.el, 0, sortable.options, true));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX < childContainingRect.left - spacer || evt.clientY < firstElRect.top && evt.clientX < firstElRect.right : evt.clientY < childContainingRect.top - spacer || evt.clientY < firstElRect.bottom && evt.clientX < firstElRect.left;
  }
  function _ghostIsLast(evt, vertical, sortable) {
    var lastElRect = getRect(lastChild(sortable.el, sortable.options.draggable));
    var childContainingRect = getChildContainingRectFromElement(sortable.el, sortable.options, ghostEl);
    var spacer = 10;
    return vertical ? evt.clientX > childContainingRect.right + spacer || evt.clientY > lastElRect.bottom && evt.clientX > lastElRect.left : evt.clientY > childContainingRect.bottom + spacer || evt.clientX > lastElRect.right && evt.clientY > lastElRect.top;
  }
  function _getSwapDirection(evt, target, targetRect, vertical, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
    var mouseOnAxis = vertical ? evt.clientY : evt.clientX, targetLength = vertical ? targetRect.height : targetRect.width, targetS1 = vertical ? targetRect.top : targetRect.left, targetS2 = vertical ? targetRect.bottom : targetRect.right, invert = false;
    if (!invertSwap) {
      if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
        if (!pastFirstInvertThresh && (lastDirection === 1 ? mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2 : mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2)) {
          pastFirstInvertThresh = true;
        }
        if (!pastFirstInvertThresh) {
          if (lastDirection === 1 ? mouseOnAxis < targetS1 + targetMoveDistance : mouseOnAxis > targetS2 - targetMoveDistance) {
            return -lastDirection;
          }
        } else {
          invert = true;
        }
      } else {
        if (mouseOnAxis > targetS1 + targetLength * (1 - swapThreshold) / 2 && mouseOnAxis < targetS2 - targetLength * (1 - swapThreshold) / 2) {
          return _getInsertDirection(target);
        }
      }
    }
    invert = invert || invertSwap;
    if (invert) {
      if (mouseOnAxis < targetS1 + targetLength * invertedSwapThreshold / 2 || mouseOnAxis > targetS2 - targetLength * invertedSwapThreshold / 2) {
        return mouseOnAxis > targetS1 + targetLength / 2 ? 1 : -1;
      }
    }
    return 0;
  }
  function _getInsertDirection(target) {
    if (index(dragEl) < index(target)) {
      return 1;
    } else {
      return -1;
    }
  }
  function _generateId(el2) {
    var str = el2.tagName + el2.className + el2.src + el2.href + el2.textContent, i = str.length, sum = 0;
    while (i--) {
      sum += str.charCodeAt(i);
    }
    return sum.toString(36);
  }
  function _saveInputCheckedState(root) {
    savedInputChecked.length = 0;
    var inputs = root.getElementsByTagName("input");
    var idx = inputs.length;
    while (idx--) {
      var el2 = inputs[idx];
      el2.checked && savedInputChecked.push(el2);
    }
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0);
  }
  function _cancelNextTick(id) {
    return clearTimeout(id);
  }
  if (documentExists) {
    on(document, "touchmove", function(evt) {
      if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
        evt.preventDefault();
      }
    });
  }
  Sortable.utils = {
    on,
    off,
    css,
    find,
    is: function is(el2, selector) {
      return !!closest(el2, selector, el2, false);
    },
    extend,
    throttle,
    closest,
    toggleClass,
    clone,
    index,
    nextTick: _nextTick,
    cancelNextTick: _cancelNextTick,
    detectDirection: _detectDirection,
    getChild,
    expando
  };
  Sortable.get = function(element) {
    return element[expando];
  };
  Sortable.mount = function() {
    for (var _len = arguments.length, plugins2 = new Array(_len), _key = 0; _key < _len; _key++) {
      plugins2[_key] = arguments[_key];
    }
    if (plugins2[0].constructor === Array) plugins2 = plugins2[0];
    plugins2.forEach(function(plugin) {
      if (!plugin.prototype || !plugin.prototype.constructor) {
        throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(plugin));
      }
      if (plugin.utils) Sortable.utils = _objectSpread2(_objectSpread2({}, Sortable.utils), plugin.utils);
      PluginManager.mount(plugin);
    });
  };
  Sortable.create = function(el2, options) {
    return new Sortable(el2, options);
  };
  Sortable.version = version;
  var autoScrolls = [];
  var scrollEl;
  var scrollRootEl;
  var scrolling = false;
  var lastAutoScrollX;
  var lastAutoScrollY;
  var touchEvt$1;
  var pointerElemChangedInterval;
  function AutoScrollPlugin() {
    function AutoScroll() {
      this.defaults = {
        scroll: true,
        forceAutoScrollFallback: false,
        scrollSensitivity: 30,
        scrollSpeed: 10,
        bubbleScroll: true
      };
      for (var fn in this) {
        if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
          this[fn] = this[fn].bind(this);
        }
      }
    }
    AutoScroll.prototype = {
      dragStarted: function dragStarted(_ref) {
        var originalEvent = _ref.originalEvent;
        if (this.sortable.nativeDraggable) {
          on(document, "dragover", this._handleAutoScroll);
        } else {
          if (this.options.supportPointer) {
            on(document, "pointermove", this._handleFallbackAutoScroll);
          } else if (originalEvent.touches) {
            on(document, "touchmove", this._handleFallbackAutoScroll);
          } else {
            on(document, "mousemove", this._handleFallbackAutoScroll);
          }
        }
      },
      dragOverCompleted: function dragOverCompleted(_ref2) {
        var originalEvent = _ref2.originalEvent;
        if (!this.options.dragOverBubble && !originalEvent.rootEl) {
          this._handleAutoScroll(originalEvent);
        }
      },
      drop: function drop3() {
        if (this.sortable.nativeDraggable) {
          off(document, "dragover", this._handleAutoScroll);
        } else {
          off(document, "pointermove", this._handleFallbackAutoScroll);
          off(document, "touchmove", this._handleFallbackAutoScroll);
          off(document, "mousemove", this._handleFallbackAutoScroll);
        }
        clearPointerElemChangedInterval();
        clearAutoScrolls();
        cancelThrottle();
      },
      nulling: function nulling() {
        touchEvt$1 = scrollRootEl = scrollEl = scrolling = pointerElemChangedInterval = lastAutoScrollX = lastAutoScrollY = null;
        autoScrolls.length = 0;
      },
      _handleFallbackAutoScroll: function _handleFallbackAutoScroll(evt) {
        this._handleAutoScroll(evt, true);
      },
      _handleAutoScroll: function _handleAutoScroll(evt, fallback) {
        var _this = this;
        var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, elem = document.elementFromPoint(x, y);
        touchEvt$1 = evt;
        if (fallback || this.options.forceAutoScrollFallback || Edge || IE11OrLess || Safari) {
          autoScroll(evt, this.options, elem, fallback);
          var ogElemScroller = getParentAutoScrollElement(elem, true);
          if (scrolling && (!pointerElemChangedInterval || x !== lastAutoScrollX || y !== lastAutoScrollY)) {
            pointerElemChangedInterval && clearPointerElemChangedInterval();
            pointerElemChangedInterval = setInterval(function() {
              var newElem = getParentAutoScrollElement(document.elementFromPoint(x, y), true);
              if (newElem !== ogElemScroller) {
                ogElemScroller = newElem;
                clearAutoScrolls();
              }
              autoScroll(evt, _this.options, newElem, fallback);
            }, 10);
            lastAutoScrollX = x;
            lastAutoScrollY = y;
          }
        } else {
          if (!this.options.bubbleScroll || getParentAutoScrollElement(elem, true) === getWindowScrollingElement()) {
            clearAutoScrolls();
            return;
          }
          autoScroll(evt, this.options, getParentAutoScrollElement(elem, false), false);
        }
      }
    };
    return _extends(AutoScroll, {
      pluginName: "scroll",
      initializeByDefault: true
    });
  }
  function clearAutoScrolls() {
    autoScrolls.forEach(function(autoScroll2) {
      clearInterval(autoScroll2.pid);
    });
    autoScrolls = [];
  }
  function clearPointerElemChangedInterval() {
    clearInterval(pointerElemChangedInterval);
  }
  var autoScroll = throttle(function(evt, options, rootEl2, isFallback) {
    if (!options.scroll) return;
    var x = (evt.touches ? evt.touches[0] : evt).clientX, y = (evt.touches ? evt.touches[0] : evt).clientY, sens = options.scrollSensitivity, speed = options.scrollSpeed, winScroller = getWindowScrollingElement();
    var scrollThisInstance = false, scrollCustomFn;
    if (scrollRootEl !== rootEl2) {
      scrollRootEl = rootEl2;
      clearAutoScrolls();
      scrollEl = options.scroll;
      scrollCustomFn = options.scrollFn;
      if (scrollEl === true) {
        scrollEl = getParentAutoScrollElement(rootEl2, true);
      }
    }
    var layersOut = 0;
    var currentParent = scrollEl;
    do {
      var el2 = currentParent, rect = getRect(el2), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el2.scrollWidth, scrollHeight = el2.scrollHeight, elCSS = css(el2), scrollPosX = el2.scrollLeft, scrollPosY = el2.scrollTop;
      if (el2 === winScroller) {
        canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll" || elCSS.overflowX === "visible");
        canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll" || elCSS.overflowY === "visible");
      } else {
        canScrollX = width < scrollWidth && (elCSS.overflowX === "auto" || elCSS.overflowX === "scroll");
        canScrollY = height < scrollHeight && (elCSS.overflowY === "auto" || elCSS.overflowY === "scroll");
      }
      var vx = canScrollX && (Math.abs(right - x) <= sens && scrollPosX + width < scrollWidth) - (Math.abs(left - x) <= sens && !!scrollPosX);
      var vy = canScrollY && (Math.abs(bottom - y) <= sens && scrollPosY + height < scrollHeight) - (Math.abs(top - y) <= sens && !!scrollPosY);
      if (!autoScrolls[layersOut]) {
        for (var i = 0; i <= layersOut; i++) {
          if (!autoScrolls[i]) {
            autoScrolls[i] = {};
          }
        }
      }
      if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el2) {
        autoScrolls[layersOut].el = el2;
        autoScrolls[layersOut].vx = vx;
        autoScrolls[layersOut].vy = vy;
        clearInterval(autoScrolls[layersOut].pid);
        if (vx != 0 || vy != 0) {
          scrollThisInstance = true;
          autoScrolls[layersOut].pid = setInterval(function() {
            if (isFallback && this.layer === 0) {
              Sortable.active._onTouchMove(touchEvt$1);
            }
            var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed : 0;
            var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed : 0;
            if (typeof scrollCustomFn === "function") {
              if (scrollCustomFn.call(Sortable.dragged.parentNode[expando], scrollOffsetX, scrollOffsetY, evt, touchEvt$1, autoScrolls[this.layer].el) !== "continue") {
                return;
              }
            }
            scrollBy(autoScrolls[this.layer].el, scrollOffsetX, scrollOffsetY);
          }.bind({
            layer: layersOut
          }), 24);
        }
      }
      layersOut++;
    } while (options.bubbleScroll && currentParent !== winScroller && (currentParent = getParentAutoScrollElement(currentParent, false)));
    scrolling = scrollThisInstance;
  }, 30);
  var drop = function drop2(_ref) {
    var originalEvent = _ref.originalEvent, putSortable2 = _ref.putSortable, dragEl2 = _ref.dragEl, activeSortable = _ref.activeSortable, dispatchSortableEvent = _ref.dispatchSortableEvent, hideGhostForTarget = _ref.hideGhostForTarget, unhideGhostForTarget = _ref.unhideGhostForTarget;
    if (!originalEvent) return;
    var toSortable = putSortable2 || activeSortable;
    hideGhostForTarget();
    var touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
    var target = document.elementFromPoint(touch.clientX, touch.clientY);
    unhideGhostForTarget();
    if (toSortable && !toSortable.el.contains(target)) {
      dispatchSortableEvent("spill");
      this.onSpill({
        dragEl: dragEl2,
        putSortable: putSortable2
      });
    }
  };
  function Revert() {
  }
  Revert.prototype = {
    startIndex: null,
    dragStart: function dragStart(_ref2) {
      var oldDraggableIndex2 = _ref2.oldDraggableIndex;
      this.startIndex = oldDraggableIndex2;
    },
    onSpill: function onSpill(_ref3) {
      var dragEl2 = _ref3.dragEl, putSortable2 = _ref3.putSortable;
      this.sortable.captureAnimationState();
      if (putSortable2) {
        putSortable2.captureAnimationState();
      }
      var nextSibling = getChild(this.sortable.el, this.startIndex, this.options);
      if (nextSibling) {
        this.sortable.el.insertBefore(dragEl2, nextSibling);
      } else {
        this.sortable.el.appendChild(dragEl2);
      }
      this.sortable.animateAll();
      if (putSortable2) {
        putSortable2.animateAll();
      }
    },
    drop
  };
  _extends(Revert, {
    pluginName: "revertOnSpill"
  });
  function Remove() {
  }
  Remove.prototype = {
    onSpill: function onSpill2(_ref4) {
      var dragEl2 = _ref4.dragEl, putSortable2 = _ref4.putSortable;
      var parentSortable = putSortable2 || this.sortable;
      parentSortable.captureAnimationState();
      dragEl2.parentNode && dragEl2.parentNode.removeChild(dragEl2);
      parentSortable.animateAll();
    },
    drop
  };
  _extends(Remove, {
    pluginName: "removeOnSpill"
  });
  Sortable.mount(new AutoScrollPlugin());
  Sortable.mount(Remove, Revert);
  var sortable_esm_default = Sortable;

  // themes/baselayer/packages/baselayer-forms/src/js/admin/palette.js
  function paletteIcon(type) {
    const icons = window.blFormsAdmin && window.blFormsAdmin.icons || {};
    const markup = icons[type] || "";
    const wrap = el("span", {
      className: "bl-forms-builder__template-icon",
      "aria-hidden": "true"
    });
    if (markup) {
      wrap.innerHTML = markup;
    }
    return wrap;
  }
  function paletteAddButton(type, onAdd) {
    const icons = window.blFormsAdmin && window.blFormsAdmin.icons || {};
    const markup = icons.add || "";
    const btn = el("button", {
      type: "button",
      className: "bl-forms-builder__template-add",
      title: t("paletteAdd", "Add field"),
      "aria-label": t("paletteAdd", "Add field"),
      onClick: (event) => {
        event.preventDefault();
        event.stopPropagation();
        onAdd(type);
      }
    });
    const stopSortable = (event) => {
      event.stopPropagation();
    };
    btn.addEventListener("pointerdown", stopSortable);
    btn.addEventListener("mousedown", stopSortable);
    if (markup) {
      btn.innerHTML = markup;
    } else {
      btn.textContent = "\u203A";
    }
    return btn;
  }
  function createPalette(onAdd) {
    const wrap = el("aside", { className: "bl-forms-builder__palette" });
    const bodyId = "bl-forms-palette-body";
    const search = el("input", {
      type: "search",
      className: "bl-forms-builder__palette-search",
      placeholder: t("paletteSearch", "Search fields\u2026"),
      "aria-label": t("paletteSearch", "Search fields\u2026"),
      autocomplete: "off"
    });
    const collapseBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__palette-collapse",
      "aria-expanded": "true",
      "aria-controls": bodyId,
      title: t("paletteHide", "Hide field templates"),
      "aria-label": t("paletteHide", "Hide field templates")
    });
    const collapseIcon = el("span", {
      className: "bl-forms-builder__palette-collapse-icon",
      "aria-hidden": "true"
    });
    collapseBtn.appendChild(collapseIcon);
    const toolbar = el("div", { className: "bl-forms-builder__palette-toolbar" }, [
      search,
      collapseBtn
    ]);
    wrap.appendChild(toolbar);
    const body = el("div", {
      id: bodyId,
      className: "bl-forms-builder__palette-body"
    });
    wrap.appendChild(body);
    const empty = el("p", {
      className: "description bl-forms-builder__palette-empty",
      text: t("paletteSearchEmpty", "No fields match your search."),
      hidden: true
    });
    body.appendChild(empty);
    const sections = [];
    let openId = PALETTE_SECTIONS[0]?.id || "";
    let collapsed = false;
    const syncCollapseUi = () => {
      wrap.classList.toggle("is-collapsed", collapsed);
      collapseBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      const label = collapsed ? t("paletteShow", "Show field templates") : t("paletteHide", "Hide field templates");
      collapseBtn.title = label;
      collapseBtn.setAttribute("aria-label", label);
      const icons = window.blFormsAdmin && window.blFormsAdmin.icons || {};
      const markup = collapsed ? icons.panelExpand || icons.panelCollapse || "" : icons.panelCollapse || icons.panelExpand || "";
      if (markup) {
        collapseIcon.innerHTML = markup;
      } else {
        collapseIcon.textContent = collapsed ? "\u203A" : "\u2039";
      }
    };
    collapseBtn.addEventListener("click", () => {
      collapsed = !collapsed;
      syncCollapseUi();
    });
    syncCollapseUi();
    const setOpen = (nextId) => {
      openId = nextId;
      sections.forEach(({ sectionEl, toggle, panel, id }) => {
        const open = openId !== "" && id === openId;
        sectionEl.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        panel.hidden = !open;
      });
    };
    const applySearch = () => {
      const query = search.value.trim().toLowerCase();
      const searching = query !== "";
      let totalVisible = 0;
      if (searching && collapsed) {
        collapsed = false;
        syncCollapseUi();
      }
      sections.forEach(({ sectionEl, toggle, panel, list, id }) => {
        let sectionVisible = 0;
        list.querySelectorAll(".bl-forms-builder__template").forEach((item) => {
          const type = item.dataset.fieldType || "";
          const label = (item.querySelector(".bl-forms-builder__template-label")?.textContent || "").toLowerCase();
          const match = !searching || label.includes(query) || type.toLowerCase().includes(query);
          item.hidden = !match;
          if (match) {
            sectionVisible += 1;
          }
        });
        const showSection = !searching || sectionVisible > 0;
        sectionEl.hidden = !showSection;
        totalVisible += sectionVisible;
        if (searching) {
          const open = sectionVisible > 0;
          sectionEl.classList.toggle("is-open", open);
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
          panel.hidden = !open;
        }
      });
      if (!searching) {
        setOpen(openId);
      }
      empty.hidden = !searching || totalVisible > 0;
    };
    search.addEventListener("input", applySearch);
    PALETTE_SECTIONS.forEach((section, index2) => {
      const panelId = "bl-forms-palette-" + section.id;
      const sectionEl = el("div", {
        className: "bl-forms-builder__palette-section" + (index2 === 0 ? " is-open" : ""),
        dataset: { blFormsPaletteSection: section.id }
      });
      const toggle = el("button", {
        type: "button",
        className: "bl-forms-builder__palette-section-toggle",
        "aria-expanded": index2 === 0 ? "true" : "false",
        "aria-controls": panelId,
        onClick: () => {
          if (search.value.trim() !== "") {
            return;
          }
          const isOpen = sectionEl.classList.contains("is-open");
          setOpen(isOpen ? "" : section.id);
        }
      });
      const chevron = iconEl("caret", "bl-forms-builder__palette-section-chevron");
      if (!chevron.innerHTML) {
        chevron.textContent = "\u25BE";
      }
      toggle.append(
        el("span", {
          className: "bl-forms-builder__palette-section-title",
          text: t(section.headingKey, section.headingFallback)
        }),
        chevron
      );
      const panel = el("div", {
        id: panelId,
        className: "bl-forms-builder__palette-panel",
        role: "region"
      });
      panel.hidden = index2 !== 0;
      const list = el("div", {
        className: "bl-forms-builder__palette-list",
        dataset: { blFormsPalette: section.id }
      });
      section.types.forEach((type) => {
        list.appendChild(
          el(
            "div",
            {
              className: "bl-forms-builder__template",
              dataset: { fieldType: type },
              onClick: () => onAdd(type)
            },
            [
              paletteIcon(type),
              el("span", { className: "bl-forms-builder__template-label", text: typeLabel(type) }),
              paletteAddButton(type, onAdd)
            ]
          )
        );
      });
      panel.appendChild(list);
      sectionEl.append(toggle, panel);
      body.appendChild(sectionEl);
      sections.push({ id: section.id, sectionEl, toggle, panel, list });
      sortable_esm_default.create(list, {
        group: { name: "bl-forms-fields", pull: "clone", put: false },
        sort: false,
        animation: 150,
        draggable: ".bl-forms-builder__template",
        filter: ".bl-forms-builder__template-add",
        // false: allow the › button click; drag is blocked via filter + stopPropagation.
        preventOnFilter: false,
        onStart() {
          formsDragStart();
        },
        onEnd() {
          formsDragEnd();
        }
      });
    });
    return wrap;
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/layout.js
  var NESTED_BLOCKED = ["column", "section", "hidden", "honeypot", "captcha"];
  var columnFieldByEl = /* @__PURE__ */ new WeakMap();
  var sectionFieldByEl = /* @__PURE__ */ new WeakMap();
  function prepareNestedField(typeOrData) {
    const data = typeof typeOrData === "string" ? defaultField(typeOrData) : { ...typeOrData };
    if (NESTED_BLOCKED.includes(data.type)) {
      return null;
    }
    if (data.name != null && data.name_manual === false) {
      data.name = uniqueFieldName(data.label || data.name || data.type || "field", data.id || "");
    } else if (data.name) {
      data.name = uniqueFieldName(data.name, data.id || "");
    }
    return data;
  }
  function bindFieldListSortable(list, onChange) {
    sortable_esm_default.create(list, {
      group: {
        name: "bl-forms-fields",
        put(to, from, dragEl2) {
          const type = dragEl2.dataset.fieldType || "";
          return !NESTED_BLOCKED.includes(type);
        }
      },
      handle: ".bl-forms-builder__handle",
      animation: 150,
      draggable: ".bl-forms-builder__field, .bl-forms-builder__template",
      onStart: formsDragStart,
      onEnd: formsDragEnd,
      onAdd(evt) {
        const item = evt.item;
        const type = item.dataset.fieldType || "text";
        if (item.classList.contains("bl-forms-builder__template")) {
          const prepared = prepareNestedField(type);
          if (!prepared) {
            item.remove();
            return;
          }
          item.replaceWith(createFieldCard(prepared, true));
        } else if (NESTED_BLOCKED.includes(type)) {
          if (evt.from && evt.from !== list) {
            evt.from.insertBefore(item, evt.from.children[evt.oldIndex] || null);
          } else {
            item.remove();
          }
          return;
        }
        onChange();
      },
      onUpdate: onChange,
      onSort: onChange
    });
  }
  function widthBadgeText(width, widthCustom = "") {
    if (width === "auto") {
      return t("widthAuto", "Auto");
    }
    if (width === "custom") {
      return (widthCustom || "").trim();
    }
    return `${width}%`;
  }
  function equalWidthForCount(count) {
    if (count <= 1) {
      return "100";
    }
    if (count === 2) {
      return "50";
    }
    if (count === 3) {
      return "33";
    }
    return "25";
  }
  function applyColumnWidthToCard(el2, width, widthCustom = "") {
    el2.dataset.fieldWidth = width;
    if (width === "custom") {
      el2.dataset.fieldWidthCustom = widthCustom || "";
    } else {
      delete el2.dataset.fieldWidthCustom;
    }
    const field = columnFieldByEl.get(el2);
    if (field) {
      field.width = width;
      field.width_custom = width === "custom" ? widthCustom || "" : "";
    }
    const badge = el2.querySelector(":scope > .bl-forms-builder__field-header .bl-forms-builder__width-badge");
    if (badge) {
      const text = widthBadgeText(width, widthCustom);
      badge.textContent = text;
      badge.hidden = text === "";
    }
  }
  function equalizeColumnRun(list, columnEl) {
    const all = Array.from(list.children).filter((el2) => el2.matches?.("[data-bl-forms-field]"));
    const pos = all.indexOf(columnEl);
    if (pos < 0) {
      return;
    }
    let start = pos;
    let end = pos;
    while (start > 0 && all[start - 1].dataset.fieldType === "column") {
      start -= 1;
    }
    while (end < all.length - 1 && all[end + 1].dataset.fieldType === "column") {
      end += 1;
    }
    const run = all.slice(start, end + 1);
    const width = equalWidthForCount(run.length);
    run.forEach((el2) => applyColumnWidthToCard(el2, width));
  }
  function createContainerActions(onDelete) {
    const deleteBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger",
      title: t("delete", "Delete"),
      "aria-label": t("delete", "Delete"),
      onClick: onDelete
    });
    const trashIcon = iconEl("trash");
    if (trashIcon.innerHTML) {
      deleteBtn.appendChild(trashIcon);
    } else {
      deleteBtn.textContent = "\xD7";
    }
    const handle = el("span", {
      className: "bl-forms-builder__handle",
      title: t("dragField", "Drag to reorder"),
      "aria-hidden": "true"
    });
    const dragIcon = iconEl("drag");
    if (dragIcon.innerHTML) {
      handle.appendChild(dragIcon);
    } else {
      handle.textContent = "\u22EE\u22EE";
    }
    return el("div", { className: "bl-forms-builder__field-actions" }, [deleteBtn, handle]);
  }
  function createColumnCard(initial = {}) {
    let field = {
      width: "100",
      width_custom: "",
      children: [],
      ...initial,
      id: initial.id || uid(),
      type: "column"
    };
    const row = el("div", {
      className: "bl-forms-builder__field bl-forms-builder__column-card",
      dataset: {
        blFormsField: "1",
        fieldId: field.id,
        fieldType: "column",
        fieldWidth: field.width || "100",
        ...field.width === "custom" && field.width_custom ? { fieldWidthCustom: field.width_custom } : {}
      }
    });
    columnFieldByEl.set(row, field);
    const preview = el("span", {
      className: "bl-forms-builder__preview",
      text: window.blFormsAdmin?.i18n?.types?.column || t("columnType", "Columns")
    });
    const widthBadge = el("span", { className: "bl-forms-builder__width-badge" });
    const typeChip = el("span", { className: "bl-forms-builder__field-type bl-forms-builder__field-type--column" }, [
      iconEl("column", "bl-forms-builder__field-type-icon"),
      el("span", {
        className: "bl-forms-builder__field-type-label",
        text: window.blFormsAdmin?.i18n?.types?.column || t("columnType", "Columns")
      })
    ]);
    const fieldsList = el("div", {
      className: "bl-forms-builder__column-fields",
      dataset: { blColumnFields: "1" }
    });
    const emptyHint = el("p", {
      className: "description bl-forms-builder__column-empty",
      text: t("columnEmpty", "Drop fields here")
    });
    const syncEmpty = () => {
      emptyHint.hidden = fieldsList.querySelector("[data-bl-forms-field]") != null;
    };
    const updatePreview = () => {
      const width = field.width || "100";
      const widthCustom = field.width_custom || "";
      row.dataset.fieldWidth = width;
      if (width === "custom") {
        row.dataset.fieldWidthCustom = widthCustom || "";
      } else {
        delete row.dataset.fieldWidthCustom;
      }
      const text = widthBadgeText(width, widthCustom);
      widthBadge.textContent = text;
      widthBadge.hidden = text === "";
    };
    const notify = () => document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    const openWidthModal = () => {
      openFieldWidthModal(field, () => {
        updatePreview();
        notify();
      });
    };
    (field.children || []).forEach((child) => {
      fieldsList.appendChild(createFieldCard(child, false));
    });
    bindFieldListSortable(fieldsList, () => {
      syncEmpty();
      notify();
    });
    const fieldsWrap = el("div", { className: "bl-forms-builder__column-fields-wrap" }, [
      fieldsList,
      emptyHint
    ]);
    syncEmpty();
    widthBadge.classList.add("is-interactive");
    widthBadge.title = t("columnWidthTitle", "Column width");
    widthBadge.addEventListener("click", openWidthModal);
    const header = el("div", { className: "bl-forms-builder__field-header" }, [
      preview,
      el("div", { className: "bl-forms-builder__field-meta" }, [widthBadge, typeChip]),
      createContainerActions(() => {
        row.remove();
        notify();
      })
    ]);
    row.append(header, fieldsWrap);
    updatePreview();
    return row;
  }
  function createSectionCard(initial = {}) {
    let field = {
      label: "",
      children: [],
      width: "100",
      width_custom: "",
      design: "standard",
      ...initial,
      id: initial.id || uid(),
      type: "section"
    };
    if (!field.label) {
      field.label = window.blFormsAdmin?.i18n?.types?.section || t("sectionType", "Section");
    }
    if (!["standard", "outline", "card"].includes(field.design)) {
      field.design = "standard";
    }
    const row = el("div", {
      className: "bl-forms-builder__field bl-forms-builder__section-card",
      dataset: {
        blFormsField: "1",
        fieldId: field.id,
        fieldType: "section",
        fieldWidth: field.width || "100",
        fieldDesign: field.design || "standard",
        ...field.width === "custom" && field.width_custom ? { fieldWidthCustom: field.width_custom } : {}
      }
    });
    sectionFieldByEl.set(row, field);
    const labelInput = el("input", {
      type: "text",
      className: "bl-forms-builder__section-label-input",
      value: field.label || "",
      placeholder: t("sectionLabelPlaceholder", "Section title"),
      "aria-label": t("sectionLabel", "Section title")
    });
    labelInput.addEventListener("input", () => {
      field.label = labelInput.value;
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    const widthBadge = el("span", { className: "bl-forms-builder__width-badge" });
    const designBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__design-btn",
      title: t("sectionDesignTitle", "Section design"),
      "aria-label": t("sectionDesignTitle", "Section design")
    });
    designBtn.appendChild(iconEl("design", "bl-forms-builder__design-btn-icon"));
    const typeChip = el("span", { className: "bl-forms-builder__field-type bl-forms-builder__field-type--section" }, [
      iconEl("section", "bl-forms-builder__field-type-icon"),
      el("span", {
        className: "bl-forms-builder__field-type-label",
        text: window.blFormsAdmin?.i18n?.types?.section || t("sectionType", "Section")
      })
    ]);
    const fieldsList = el("div", {
      className: "bl-forms-builder__section-fields",
      dataset: { blSectionFields: "1" }
    });
    const emptyHint = el("p", {
      className: "description bl-forms-builder__section-empty",
      text: t("sectionEmpty", "Drop fields here")
    });
    const syncEmpty = () => {
      emptyHint.hidden = fieldsList.querySelector("[data-bl-forms-field]") != null;
    };
    const updatePreview = () => {
      const width = field.width || "100";
      const widthCustom = field.width_custom || "";
      const design = field.design || "standard";
      row.dataset.fieldWidth = width;
      row.dataset.fieldDesign = design;
      if (width === "custom") {
        row.dataset.fieldWidthCustom = widthCustom || "";
      } else {
        delete row.dataset.fieldWidthCustom;
      }
      const text = widthBadgeText(width, widthCustom);
      widthBadge.textContent = text;
      widthBadge.hidden = text === "";
    };
    const notify = () => document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    const openWidthModal = () => {
      openFieldWidthModal(field, () => {
        updatePreview();
        notify();
      });
    };
    const openDesignModal = () => {
      openSectionDesignModal(field, () => {
        updatePreview();
        notify();
      });
    };
    (field.children || []).forEach((child) => {
      fieldsList.appendChild(createFieldCard(child, false));
    });
    bindFieldListSortable(fieldsList, () => {
      syncEmpty();
      notify();
    });
    const fieldsWrap = el("div", { className: "bl-forms-builder__section-fields-wrap" }, [
      fieldsList,
      emptyHint
    ]);
    syncEmpty();
    widthBadge.classList.add("is-interactive");
    widthBadge.title = t("sectionWidthTitle", "Section width");
    widthBadge.addEventListener("click", openWidthModal);
    designBtn.addEventListener("click", openDesignModal);
    const header = el("div", { className: "bl-forms-builder__field-header" }, [
      labelInput,
      el("div", { className: "bl-forms-builder__field-meta" }, [widthBadge, designBtn, typeChip]),
      createContainerActions(() => {
        row.remove();
        notify();
      })
    ]);
    row.append(header, fieldsWrap);
    updatePreview();
    return row;
  }
  function serializeLayoutRow(row) {
    const type = row.dataset.fieldType || "";
    const id = row.dataset.fieldId || uid();
    if (type === "column") {
      const fields = row.querySelector("[data-bl-column-fields]");
      const width = row.dataset.fieldWidth || "100";
      const widthCustom = row.dataset.fieldWidthCustom || "";
      return {
        id,
        type: "column",
        width,
        width_custom: width === "custom" ? widthCustom : "",
        children: Array.from(fields?.children || []).filter((el2) => el2.matches("[data-bl-forms-field]") && !NESTED_BLOCKED.includes(el2.dataset.fieldType)).map((child) => serializeRow(child))
      };
    }
    if (type === "section") {
      const fields = row.querySelector("[data-bl-section-fields]");
      const live = sectionFieldByEl.get(row);
      const labelInput = row.querySelector(".bl-forms-builder__section-label-input");
      const label = labelInput?.value ?? live?.label ?? "";
      const width = row.dataset.fieldWidth || live?.width || "100";
      const widthCustom = row.dataset.fieldWidthCustom || live?.width_custom || "";
      const design = row.dataset.fieldDesign || live?.design || "standard";
      return {
        id,
        type: "section",
        label,
        width,
        width_custom: width === "custom" ? widthCustom : "",
        design,
        children: Array.from(fields?.children || []).filter((el2) => el2.matches("[data-bl-forms-field]") && !NESTED_BLOCKED.includes(el2.dataset.fieldType)).map((child) => serializeRow(child))
      };
    }
    return null;
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/field-card.js
  var WIDTH_PRESETS = [
    { value: "100", label: "100%" },
    { value: "75", label: "75%" },
    { value: "66", label: "66%" },
    { value: "50", label: "50%" },
    { value: "33", label: "33%" },
    { value: "25", label: "25%" },
    { value: "auto", labelKey: "widthAuto" },
    { value: "custom", labelKey: "widthCustom", icon: "edit" }
  ];
  var SPACER_HEIGHT_PRESETS = [
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" },
    { value: "custom", labelKey: "widthCustom", icon: "edit" }
  ];
  var SPACER_HEIGHT_VALUES = SPACER_HEIGHT_PRESETS.map((preset) => preset.value);
  var DIVIDER_MARGIN_PRESETS = [
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" },
    { value: "custom", labelKey: "widthCustom", icon: "edit" }
  ];
  var DIVIDER_MARGIN_VALUES = DIVIDER_MARGIN_PRESETS.map((preset) => preset.value);
  var CSS_LENGTH_RE = /^(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw|vmin|vmax|ch|ex)$/i;
  function normalizeSpacerHeight(field) {
    const raw = String(field.height ?? "m").trim();
    const key = raw.toLowerCase();
    if (SPACER_HEIGHT_VALUES.includes(key)) {
      field.height = key;
      if (key !== "custom") {
        field.height_custom = "";
      } else if (field.height_custom == null) {
        field.height_custom = "";
      }
      return;
    }
    if (CSS_LENGTH_RE.test(raw)) {
      field.height_custom = raw;
      field.height = "custom";
      return;
    }
    field.height = "m";
    field.height_custom = "";
  }
  function normalizeDividerMargin(field) {
    const raw = String(field.margin ?? "m").trim();
    const key = raw.toLowerCase();
    if (DIVIDER_MARGIN_VALUES.includes(key)) {
      field.margin = key;
      if (key !== "custom") {
        field.margin_custom = "";
      } else if (field.margin_custom == null) {
        field.margin_custom = "";
      }
      return;
    }
    if (CSS_LENGTH_RE.test(raw)) {
      field.margin_custom = raw;
      field.margin = "custom";
      return;
    }
    field.margin = "m";
    field.margin_custom = "";
  }
  var OPTION_TYPES = ["radio", "checkboxes", "select", "button_group"];
  var MULTIPLE_TYPES = ["select", "button_group", "file", "image"];
  var CAPTCHA_PROVIDERS = [
    {
      id: "turnstile",
      labelKey: "captchaTurnstile",
      labelFallback: "Cloudflare Turnstile",
      helpKey: "captchaTurnstileHelp",
      helpFallback: "Mostly invisible. Excellent privacy and very easy to set up.",
      secretKey: "captchaSecretKey",
      secretFallback: "Secret key"
    },
    {
      id: "hcaptcha",
      labelKey: "captchaHcaptcha",
      labelFallback: "hCaptcha",
      helpKey: "captchaHcaptchaHelp",
      helpFallback: "Good privacy and UX. Very easy to set up.",
      secretKey: "captchaSecretKey",
      secretFallback: "Secret key"
    },
    {
      id: "friendly",
      labelKey: "captchaFriendly",
      labelFallback: "Friendly Captcha",
      helpKey: "captchaFriendlyHelp",
      helpFallback: "Excellent privacy and accessibility. Easy to set up.",
      secretKey: "captchaApiKey",
      secretFallback: "API key"
    },
    {
      id: "recaptcha_v2",
      labelKey: "captchaRecaptcha",
      labelFallback: "Google reCAPTCHA v2",
      helpKey: "captchaRecaptchaHelp",
      helpFallback: "Familiar checkbox challenge. Weaker privacy. Very easy to set up.",
      secretKey: "captchaSecretKey",
      secretFallback: "Secret key"
    }
  ];
  function captchaProviderMeta(id) {
    return CAPTCHA_PROVIDERS.find((p) => p.id === id) || CAPTCHA_PROVIDERS[0];
  }
  function captchaProviderLabel(id) {
    const meta = captchaProviderMeta(id);
    return t(meta.labelKey, meta.labelFallback);
  }
  function createCaptchaSettings(field, onChange) {
    if (!field.captcha_provider || !CAPTCHA_PROVIDERS.some((p) => p.id === field.captcha_provider)) {
      field.captcha_provider = "turnstile";
    }
    field.captcha_site_key = field.captcha_site_key || "";
    field.captcha_secret_key = field.captcha_secret_key || "";
    const root = el("div", { className: "bl-forms-builder__captcha" });
    const provider = el("select", {
      className: "widefat",
      dataset: { blCaptchaProvider: "1" }
    });
    CAPTCHA_PROVIDERS.forEach((meta) => {
      const opt = document.createElement("option");
      opt.value = meta.id;
      opt.textContent = t(meta.labelKey, meta.labelFallback);
      if (meta.id === field.captcha_provider) {
        opt.selected = true;
      }
      provider.appendChild(opt);
    });
    const help = el("p", { className: "description" });
    const siteKey = el("input", {
      type: "text",
      className: "widefat code",
      dataset: { blCaptchaSiteKey: "1" },
      value: field.captcha_site_key,
      autocomplete: "off"
    });
    const secretKey = el("input", {
      type: "password",
      className: "widefat code",
      dataset: { blCaptchaSecretKey: "1" },
      value: field.captcha_secret_key,
      autocomplete: "new-password"
    });
    const secretLabel = el("strong", { text: "" });
    const syncLabels = () => {
      const meta = captchaProviderMeta(field.captcha_provider);
      help.textContent = t(meta.helpKey, meta.helpFallback);
      secretLabel.textContent = t(meta.secretKey, meta.secretFallback);
    };
    provider.addEventListener("change", () => {
      field.captcha_provider = provider.value;
      syncLabels();
      onChange();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    siteKey.addEventListener("input", () => {
      field.captcha_site_key = siteKey.value;
      onChange();
    });
    secretKey.addEventListener("input", () => {
      field.captcha_secret_key = secretKey.value;
      onChange();
    });
    syncLabels();
    root.append(
      el("p", {}, [
        el("label", {}, [el("strong", { text: t("captchaService", "CAPTCHA service") })]),
        provider
      ]),
      help,
      el("p", {}, [el("label", {}, [el("strong", { text: t("captchaSiteKey", "Site key") })]), siteKey]),
      el("p", {}, [el("label", {}, [secretLabel]), secretKey])
    );
    return root;
  }
  var TYPE_CONVERT_GROUPS = [
    ["text", "textarea", "email", "phone", "url", "number"],
    ["date", "time", "datetime"],
    ["radio", "checkboxes", "select", "button_group"],
    ["toggle", "terms"],
    ["file", "image"],
    ["heading", "text_block", "html"]
  ];
  function convertibleTypes(type) {
    const group = TYPE_CONVERT_GROUPS.find((list) => list.includes(type));
    return group ? [...group] : [];
  }
  function canConvertType(from, to) {
    if (!from || !to || from === to) {
      return from === to;
    }
    const group = TYPE_CONVERT_GROUPS.find((list) => list.includes(from));
    return Boolean(group && group.includes(to));
  }
  function hydrateFieldFromCard(row, field) {
    const data = serializeRow(row);
    if (!data || data.type === "column" || data.type === "section") {
      return;
    }
    const keepId = field.id;
    const keepType = field.type;
    Object.keys(field).forEach((key) => {
      if (key === "id" || key === "type") {
        return;
      }
      if (!(key in data)) {
        delete field[key];
      }
    });
    Object.assign(field, data, { id: keepId, type: keepType });
  }
  function convertFieldType(field, nextType) {
    if (!canConvertType(field.type, nextType) || field.type === nextType) {
      return;
    }
    field.type = nextType;
    if (OPTION_TYPES.includes(nextType)) {
      if (!Array.isArray(field.options) || field.options.length === 0) {
        field.options = [
          { label: t("optionOne", "Option 1"), value: "option-1" },
          { label: t("optionTwo", "Option 2"), value: "option-2" }
        ];
      }
    } else {
      delete field.options;
    }
    if (nextType === "radio" || nextType === "checkboxes") {
      if (field.layout !== "horizontal") {
        field.layout = "vertical";
      }
    } else {
      delete field.layout;
    }
    if (MULTIPLE_TYPES.includes(nextType)) {
      field.multiple = Boolean(field.multiple);
    } else {
      delete field.multiple;
    }
    if (nextType === "file" || nextType === "image") {
      if (field.preview === void 0) {
        field.preview = true;
      }
      if (field.upload_style === void 0) {
        field.upload_style = "modern";
      }
      if (nextType === "image" && !String(field.extensions || "").trim()) {
        field.extensions = "jpg, jpeg, png, webp, gif, heic";
      }
      if (field.extensions === void 0) {
        field.extensions = "";
      }
    } else {
      delete field.extensions;
      delete field.preview;
      delete field.max_files;
      delete field.upload_style;
      delete field.button_text;
    }
    if (nextType === "terms") {
      if (field.content == null || String(field.content).trim() === "") {
        field.content = t("termsDefaultLabel", "I agree to the [Privacy Policy](page:privacy).");
      }
      if (!String(field.label || "").trim()) {
        field.label = t("termsDefaultFieldLabel", "Privacy Policy");
      }
      field.hide_label = true;
      field.required = true;
    }
    if (["heading", "text_block", "html"].includes(nextType) && field.content == null) {
      field.content = "";
    }
    if (nextType === "heading") {
      const level = String(field.level || "h2").toLowerCase();
      field.level = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(level) ? level : "h2";
    } else {
      delete field.level;
    }
    if (NO_DEFAULT.includes(nextType)) {
      delete field.default_value;
    }
    if (NO_PLACEHOLDER.includes(nextType)) {
      field.placeholder = "";
    }
    if (!AUTOCOMPLETE_TYPES.includes(nextType)) {
      delete field.autocomplete;
    }
    if (!AFFIX_TYPES.includes(nextType)) {
      delete field.prefix;
      delete field.suffix;
    }
    if (!["text", "textarea"].includes(nextType)) {
      delete field.max_length;
      delete field.show_char_count;
      delete field.char_count_text;
    }
    if (nextType === "textarea") {
      const rows = parseInt(field.rows, 10);
      field.rows = Number.isFinite(rows) && rows >= 2 ? Math.min(50, rows) : 5;
    } else {
      delete field.rows;
    }
    if (nextType === "number") {
      delete field.min_mode;
      delete field.max_mode;
      delete field.min_offset;
      delete field.max_offset;
      delete field.default_mode;
      delete field.default_offset;
    } else if (!["date", "time", "datetime"].includes(nextType)) {
      delete field.min;
      delete field.max;
      delete field.min_mode;
      delete field.max_mode;
      delete field.min_offset;
      delete field.max_offset;
      delete field.default_mode;
      delete field.default_offset;
      delete field.relation;
      delete field.relation_field;
    } else {
      if (!field.default_mode && field.default_value != null && String(field.default_value).trim() !== "") {
        field.default_mode = "fixed";
      }
      delete field.relation;
      delete field.relation_field;
    }
  }
  function createTypeSelect(field, row, onConvert) {
    const types = convertibleTypes(field.type);
    if (types.length < 2) {
      return null;
    }
    const select = el("select", {
      className: "widefat",
      dataset: { blType: "1" }
    });
    types.forEach((type) => {
      const opt = el("option", {
        value: type,
        text: typeLabel(type)
      });
      if (type === field.type) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
    select.addEventListener("change", () => {
      const next = select.value;
      if (!canConvertType(field.type, next)) {
        select.value = field.type;
        return;
      }
      hydrateFieldFromCard(row, field);
      convertFieldType(field, next);
      onConvert(next);
    });
    return el("p", { className: "bl-forms-builder__type-select" }, [
      el("label", { text: t("type", "Type") }),
      select
    ]);
  }
  var DESCRIPTION_TYPES = [
    "text",
    "email",
    "url",
    "number",
    "phone",
    "textarea",
    "date",
    "time",
    "datetime",
    "file",
    "image",
    "toggle"
  ];
  var NO_PLACEHOLDER = [
    "terms",
    "radio",
    "checkboxes",
    "button_group",
    "toggle",
    "file",
    "image",
    "hidden",
    "honeypot",
    "captcha",
    "divider",
    "spacer",
    "heading",
    "text_block",
    "html",
    "column",
    "section",
    "date",
    "time",
    "datetime"
  ];
  var NO_REQUIRED = [
    "hidden",
    "honeypot",
    "captcha",
    "divider",
    "spacer",
    "heading",
    "text_block",
    "html",
    "column",
    "section"
  ];
  var NO_READONLY = [
    ...NO_REQUIRED,
    "radio",
    "checkboxes",
    "button_group",
    "toggle",
    "terms",
    "file",
    "image"
  ];
  var NO_DISABLED = [...NO_REQUIRED];
  var AUTOCOMPLETE_TYPES = [
    "text",
    "email",
    "url",
    "number",
    "phone",
    "textarea",
    "select"
  ];
  var AFFIX_TYPES = [
    "text",
    "email",
    "phone",
    "url",
    "number",
    "date",
    "time",
    "datetime"
  ];
  var NO_DEFAULT = [
    "file",
    "image",
    "honeypot",
    "captcha",
    "divider",
    "spacer",
    "heading",
    "text_block",
    "html"
  ];
  var CHECKED_DEFAULT_TYPES = ["terms", "toggle"];
  var NAMED_TYPES = [
    "text",
    "textarea",
    "email",
    "phone",
    "url",
    "number",
    "checkboxes",
    "radio",
    "select",
    "toggle",
    "button_group",
    "date",
    "time",
    "datetime",
    "file",
    "image",
    "terms",
    "hidden",
    "honeypot"
  ];
  var HIDE_LABEL_TYPES = NAMED_TYPES.filter((type) => type !== "hidden" && type !== "honeypot");
  function createOptionsEditor(options) {
    const wrap = el("div", { className: "bl-forms-builder__options" });
    const list = el("div", { className: "bl-forms-builder__options-list" });
    list.appendChild(
      el("div", { className: "bl-forms-builder__option bl-forms-builder__option--head" }, [
        el("span", {
          className: "bl-forms-builder__option-heading",
          text: t("optionLabel", "Label")
        }),
        el("span", {
          className: "bl-forms-builder__option-heading",
          text: t("optionSlug", "Slug")
        }),
        el("span", {
          className: "bl-forms-builder__option-heading-spacer",
          "aria-hidden": "true"
        })
      ])
    );
    const addOption = (opt = { label: "", value: "" }) => {
      const labelText = opt.label || "";
      const valueText = opt.value || "";
      const autoSlug = labelText ? slugifyOption(labelText) : "";
      let slugManual = valueText !== "" && valueText !== autoSlug;
      const labelInput = el("input", {
        type: "text",
        className: "widefat",
        dataset: { blOptLabel: "1" },
        value: labelText,
        placeholder: t("optionLabel", "Label"),
        "aria-label": t("optionLabel", "Label")
      });
      const slugInput = el("input", {
        type: "text",
        className: "widefat",
        dataset: { blOptValue: "1" },
        value: valueText || autoSlug,
        placeholder: t("optionSlug", "Slug"),
        "aria-label": t("optionSlug", "Slug")
      });
      const syncSlugFromLabel = () => {
        if (slugManual) {
          return;
        }
        slugInput.value = slugifyOption(labelInput.value);
      };
      labelInput.addEventListener("input", () => {
        syncSlugFromLabel();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      });
      slugInput.addEventListener("input", () => {
        slugManual = true;
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      });
      slugInput.addEventListener("blur", () => {
        const next = slugifyOption(slugInput.value || labelInput.value);
        slugInput.value = next;
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      });
      const deleteBtn = el("button", {
        type: "button",
        className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger",
        title: t("delete", "Delete"),
        "aria-label": t("delete", "Delete"),
        onClick: () => {
          row.remove();
          document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
        }
      });
      const trashIcon = iconEl("trash");
      if (trashIcon.innerHTML) {
        deleteBtn.appendChild(trashIcon);
      } else {
        deleteBtn.textContent = "\xD7";
      }
      const row = el("div", { className: "bl-forms-builder__option", dataset: { blOption: "1" } }, [
        labelInput,
        slugInput,
        deleteBtn
      ]);
      list.appendChild(row);
    };
    (options || []).forEach((opt) => addOption(opt));
    wrap.appendChild(list);
    wrap.appendChild(
      el("button", {
        type: "button",
        className: "button button-small",
        text: t("addOption", "Add option"),
        onClick: () => addOption()
      })
    );
    return wrap;
  }
  function createSegmentedControl(options, active, datasetKey, onSelect) {
    const group = el("div", {
      className: "bl-forms-builder__segmented",
      role: "group"
    });
    if (datasetKey) {
      group.dataset[datasetKey] = "1";
    }
    const sync = (value) => {
      group.querySelectorAll("button").forEach((btn) => {
        const on2 = btn.dataset.value === value;
        btn.classList.toggle("is-active", on2);
        btn.setAttribute("aria-pressed", on2 ? "true" : "false");
      });
    };
    options.forEach((opt) => {
      const label = opt.label || "";
      const btn = el("button", {
        type: "button",
        className: "bl-forms-builder__segmented-btn" + (opt.icon ? " bl-forms-builder__segmented-btn--icon" : ""),
        dataset: { value: opt.value, ...opt.dataset || {} },
        title: opt.title || label,
        "aria-label": label,
        onClick: () => {
          sync(opt.value);
          onSelect(opt.value);
        }
      });
      if (opt.icon) {
        const icon = iconEl(opt.icon);
        if (icon.innerHTML) {
          btn.appendChild(icon);
        } else {
          btn.textContent = "\u270E";
        }
      } else {
        btn.textContent = label;
      }
      group.appendChild(btn);
    });
    sync(active);
    return group;
  }
  function createWidthControl(field, onChange = () => {
  }, { showLabel = true } = {}) {
    const wrap = el("div", { className: "bl-forms-builder__width" });
    const customInput = el("input", {
      type: "text",
      className: "widefat bl-forms-builder__width-custom",
      dataset: { blWidthCustom: "1" },
      placeholder: t("widthCustomPlaceholder", "e.g. 40% or 280px"),
      value: field.width_custom || ""
    });
    customInput.hidden = (field.width || "100") !== "custom";
    const group = createSegmentedControl(
      WIDTH_PRESETS.map((preset) => ({
        value: preset.value,
        label: preset.label || t(preset.labelKey, "Custom"),
        icon: preset.icon || "",
        dataset: { blWidth: preset.value }
      })),
      field.width || "100",
      "blWidthGroup",
      (value) => {
        field.width = value;
        customInput.hidden = value !== "custom";
        onChange();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    group.querySelectorAll("button").forEach((btn) => {
      if (btn.dataset.value) {
        btn.dataset.blWidth = btn.dataset.value;
      }
    });
    customInput.addEventListener("input", () => {
      field.width_custom = customInput.value;
      field.width = "custom";
      group.querySelectorAll("button").forEach((btn) => {
        const on2 = btn.dataset.blWidth === "custom";
        btn.classList.toggle("is-active", on2);
        btn.setAttribute("aria-pressed", on2 ? "true" : "false");
      });
      customInput.hidden = false;
      onChange();
    });
    if (showLabel) {
      wrap.appendChild(el("label", { text: t("width", "Width") }));
    }
    wrap.append(group, customInput);
    return wrap;
  }
  function createHeightControl(field, onChange = () => {
  }, { showLabel = true } = {}) {
    normalizeSpacerHeight(field);
    const wrap = el("div", { className: "bl-forms-builder__height" });
    const customInput = el("input", {
      type: "text",
      className: "widefat bl-forms-builder__height-custom",
      dataset: { blHeightCustom: "1" },
      placeholder: t("spacerHeightCustomPlaceholder", "e.g. 24px or 2rem"),
      value: field.height_custom || ""
    });
    customInput.hidden = (field.height || "m") !== "custom";
    const group = createSegmentedControl(
      SPACER_HEIGHT_PRESETS.map((preset) => ({
        value: preset.value,
        label: preset.label || t(preset.labelKey, "Custom"),
        icon: preset.icon || "",
        dataset: { blHeight: preset.value }
      })),
      field.height || "m",
      "blHeightGroup",
      (value) => {
        field.height = value;
        if (value !== "custom") {
          field.height_custom = "";
        }
        customInput.hidden = value !== "custom";
        onChange();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    group.querySelectorAll("button").forEach((btn) => {
      if (btn.dataset.value) {
        btn.dataset.blHeight = btn.dataset.value;
      }
    });
    customInput.addEventListener("input", () => {
      field.height_custom = customInput.value;
      field.height = "custom";
      group.querySelectorAll("button").forEach((btn) => {
        const on2 = btn.dataset.blHeight === "custom";
        btn.classList.toggle("is-active", on2);
        btn.setAttribute("aria-pressed", on2 ? "true" : "false");
      });
      customInput.hidden = false;
      onChange();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    if (showLabel) {
      wrap.appendChild(el("label", { text: t("spacerHeight", "Height") }));
    }
    wrap.append(group, customInput);
    return wrap;
  }
  function createMarginControl(field, onChange = () => {
  }, { showLabel = true } = {}) {
    normalizeDividerMargin(field);
    const wrap = el("div", { className: "bl-forms-builder__margin" });
    const customInput = el("input", {
      type: "text",
      className: "widefat bl-forms-builder__margin-custom",
      dataset: { blMarginCustom: "1" },
      placeholder: t("dividerMarginCustomPlaceholder", "e.g. 24px or 2rem"),
      value: field.margin_custom || ""
    });
    customInput.hidden = (field.margin || "m") !== "custom";
    const group = createSegmentedControl(
      DIVIDER_MARGIN_PRESETS.map((preset) => ({
        value: preset.value,
        label: preset.label || t(preset.labelKey, "Custom"),
        icon: preset.icon || "",
        dataset: { blMargin: preset.value }
      })),
      field.margin || "m",
      "blMarginGroup",
      (value) => {
        field.margin = value;
        if (value !== "custom") {
          field.margin_custom = "";
        }
        customInput.hidden = value !== "custom";
        onChange();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    group.querySelectorAll("button").forEach((btn) => {
      if (btn.dataset.value) {
        btn.dataset.blMargin = btn.dataset.value;
      }
    });
    customInput.addEventListener("input", () => {
      field.margin_custom = customInput.value;
      field.margin = "custom";
      group.querySelectorAll("button").forEach((btn) => {
        const on2 = btn.dataset.blMargin === "custom";
        btn.classList.toggle("is-active", on2);
        btn.setAttribute("aria-pressed", on2 ? "true" : "false");
      });
      customInput.hidden = false;
      onChange();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    if (showLabel) {
      wrap.appendChild(el("label", { text: t("dividerMargin", "Margin") }));
    }
    wrap.append(group, customInput);
    return wrap;
  }
  function openFieldWidthModal(field, onApply) {
    document.querySelectorAll(".bl-forms-builder__modal").forEach((node) => node.remove());
    const draft = {
      width: field.width || "100",
      width_custom: field.width_custom || ""
    };
    const title = field.type === "column" ? t("columnWidthTitle", "Column width") : field.type === "section" ? t("sectionWidthTitle", "Section width") : t("width", "Width");
    const backdrop = el("div", {
      className: "bl-forms-builder__modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title
    });
    const close = () => {
      document.removeEventListener("keydown", onKey);
      backdrop.remove();
    };
    const apply = () => {
      field.width = draft.width;
      field.width_custom = draft.width === "custom" ? draft.width_custom : "";
      onApply(field);
      close();
    };
    const onKey = (evt) => {
      if (evt.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    backdrop.addEventListener("click", (evt) => {
      if (evt.target === backdrop) {
        close();
      }
    });
    const dialog = el("div", { className: "bl-forms-builder__modal-dialog" });
    const header = el("div", { className: "bl-forms-builder__modal-header" }, [
      el("h2", {
        className: "bl-forms-builder__modal-title",
        text: title
      })
    ]);
    const body = el("div", { className: "bl-forms-builder__modal-body" });
    body.appendChild(createWidthControl(draft, () => {
    }, { showLabel: false }));
    const footer = el("div", { className: "bl-forms-builder__modal-footer" }, [
      el("button", {
        type: "button",
        className: "button",
        text: t("cancel", "Cancel"),
        onClick: close
      }),
      el("button", {
        type: "button",
        className: "button button-primary",
        text: t("apply", "Apply"),
        onClick: apply
      })
    ]);
    dialog.append(header, body, footer);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
  }
  function openSectionDesignModal(field, onApply) {
    document.querySelectorAll(".bl-forms-builder__modal").forEach((node) => node.remove());
    const designs = [
      { value: "standard", label: t("sectionDesignStandard", "Standard") },
      { value: "outline", label: t("sectionDesignOutline", "Outline") },
      { value: "card", label: t("sectionDesignCard", "Card") }
    ];
    const allowed = designs.map((item) => item.value);
    let draft = allowed.includes(field.design) ? field.design : "standard";
    const title = t("sectionDesignTitle", "Section design");
    const backdrop = el("div", {
      className: "bl-forms-builder__modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title
    });
    const close = () => {
      document.removeEventListener("keydown", onKey);
      backdrop.remove();
    };
    const apply = () => {
      field.design = draft;
      onApply(field);
      close();
    };
    const onKey = (evt) => {
      if (evt.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    backdrop.addEventListener("click", (evt) => {
      if (evt.target === backdrop) {
        close();
      }
    });
    const dialog = el("div", { className: "bl-forms-builder__modal-dialog" });
    const header = el("div", { className: "bl-forms-builder__modal-header" }, [
      el("h2", {
        className: "bl-forms-builder__modal-title",
        text: title
      })
    ]);
    const body = el("div", { className: "bl-forms-builder__modal-body" });
    body.appendChild(
      createSegmentedControl(designs, draft, "blDesignGroup", (value) => {
        draft = value;
      })
    );
    const footer = el("div", { className: "bl-forms-builder__modal-footer" }, [
      el("button", {
        type: "button",
        className: "button",
        text: t("cancel", "Cancel"),
        onClick: close
      }),
      el("button", {
        type: "button",
        className: "button button-primary",
        text: t("apply", "Apply"),
        onClick: apply
      })
    ]);
    dialog.append(header, body, footer);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
  }
  function syncWidthControlUi(scope, field) {
    const group = scope?.querySelector("[data-bl-width-group]");
    if (!group) {
      return;
    }
    const width = field.width || "100";
    group.querySelectorAll("[data-bl-width]").forEach((btn) => {
      const on2 = btn.dataset.blWidth === width;
      btn.classList.toggle("is-active", on2);
      btn.setAttribute("aria-pressed", on2 ? "true" : "false");
    });
    const custom = scope.querySelector("[data-bl-width-custom]");
    if (custom) {
      custom.hidden = width !== "custom";
      if (width === "custom") {
        custom.value = field.width_custom || "";
      }
    }
  }
  function createLayoutControl(field) {
    const wrap = el("div", { className: "bl-forms-builder__layout" });
    const active = field.layout === "horizontal" ? "horizontal" : "vertical";
    const group = createSegmentedControl(
      [
        { value: "vertical", label: t("layoutVertical", "Vertical") },
        { value: "horizontal", label: t("layoutHorizontal", "Horizontal") }
      ],
      active,
      "blLayoutGroup",
      (value) => {
        field.layout = value;
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    group.querySelectorAll("button").forEach((btn) => {
      btn.dataset.blLayout = btn.dataset.value;
    });
    wrap.append(el("label", { text: t("layout", "Layout") }), group);
    return wrap;
  }
  var HEADING_LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"];
  function normalizeHeadingLevel(field) {
    const level = String(field.level || "h2").toLowerCase();
    field.level = HEADING_LEVELS.includes(level) ? level : "h2";
  }
  function createHeadingLevelControl(field, onChange = () => {
  }) {
    normalizeHeadingLevel(field);
    const wrap = el("div", { className: "bl-forms-builder__heading-level" });
    const group = createSegmentedControl(
      HEADING_LEVELS.map((level) => ({
        value: level,
        label: level.toUpperCase(),
        dataset: { blHeadingLevel: level }
      })),
      field.level || "h2",
      "blHeadingLevelGroup",
      (value) => {
        field.level = value;
        onChange();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    group.querySelectorAll("button").forEach((btn) => {
      if (btn.dataset.value) {
        btn.dataset.blHeadingLevel = btn.dataset.value;
      }
    });
    wrap.append(el("label", { text: t("headingLevel", "Level") }), group);
    return wrap;
  }
  function createAutocompleteControl(field) {
    const select = el("select", {
      className: "widefat",
      dataset: { blAutocomplete: "1" }
    });
    const active = field.autocomplete === "off" ? "off" : "auto";
    [
      { value: "auto", label: t("autocompleteAutomatic", "Automatic") },
      { value: "off", label: t("autocompleteOff", "Off") }
    ].forEach((opt) => {
      const option2 = el("option", { value: opt.value, text: opt.label });
      if (opt.value === active) {
        option2.selected = true;
      }
      select.appendChild(option2);
    });
    select.addEventListener("change", () => {
      field.autocomplete = select.value === "off" ? "off" : "auto";
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    return el("p", { className: "bl-forms-builder__autocomplete bl-forms-builder__type-select" }, [
      el("label", { text: t("autocomplete", "Autocomplete") }),
      select
    ]);
  }
  function createNumberBoundsControl(field) {
    const minInput = el("input", {
      type: "number",
      className: "widefat",
      dataset: { blMin: "1" },
      value: field.min != null && field.min !== "" ? String(field.min) : "",
      step: "any"
    });
    const maxInput = el("input", {
      type: "number",
      className: "widefat",
      dataset: { blMax: "1" },
      value: field.max != null && field.max !== "" ? String(field.max) : "",
      step: "any"
    });
    const sync = () => {
      field.min = minInput.value.trim();
      field.max = maxInput.value.trim();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    minInput.addEventListener("change", sync);
    maxInput.addEventListener("change", sync);
    minInput.addEventListener("blur", sync);
    maxInput.addEventListener("blur", sync);
    return el("div", { className: "bl-forms-builder__number-bounds" }, [
      el("p", {}, [el("label", { text: t("minValue", "Minimum") }), minInput]),
      el("p", {}, [el("label", { text: t("maxValue", "Maximum") }), maxInput])
    ]);
  }
  function createPrefixSuffixControl(field) {
    const prefixInput = el("input", {
      type: "text",
      className: "widefat",
      dataset: { blPrefix: "1" },
      value: field.prefix != null ? String(field.prefix) : ""
    });
    const suffixInput = el("input", {
      type: "text",
      className: "widefat",
      dataset: { blSuffix: "1" },
      value: field.suffix != null ? String(field.suffix) : ""
    });
    const sync = () => {
      field.prefix = prefixInput.value;
      field.suffix = suffixInput.value;
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    prefixInput.addEventListener("input", sync);
    suffixInput.addEventListener("input", sync);
    prefixInput.addEventListener("change", sync);
    suffixInput.addEventListener("change", sync);
    return el("div", { className: "bl-forms-builder__affix-bounds" }, [
      el("p", {}, [el("label", { text: t("prefix", "Prefix") }), prefixInput]),
      el("p", {}, [el("label", { text: t("suffix", "Suffix") }), suffixInput])
    ]);
  }
  function createMaxLengthControl(field) {
    const maxInput = el("input", {
      type: "number",
      className: "widefat",
      min: "1",
      step: "1",
      dataset: { blMaxLength: "1" },
      value: field.max_length != null && field.max_length !== "" ? String(field.max_length) : ""
    });
    const syncShow = (checked) => {
      field.show_char_count = !!checked;
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    const showSwitch = createSwitchSetting(
      "blShowCharCount",
      t("showCharCount", "Show remaining characters"),
      !!field.show_char_count,
      syncShow
    );
    const syncMax = () => {
      field.max_length = maxInput.value.trim();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    maxInput.addEventListener("change", syncMax);
    maxInput.addEventListener("blur", syncMax);
    maxInput.addEventListener("input", syncMax);
    return el("div", { className: "bl-forms-builder__max-length" }, [
      el("p", {}, [el("label", { text: t("maxLength", "Maximum length") }), maxInput]),
      showSwitch
    ]);
  }
  function createTextareaRowsControl(field) {
    const rows = parseInt(field.rows, 10);
    const value = Number.isFinite(rows) && rows >= 2 ? String(Math.min(50, rows)) : "5";
    const input = el("input", {
      type: "number",
      className: "widefat",
      min: "2",
      max: "50",
      step: "1",
      dataset: { blRows: "1" },
      value
    });
    const sync = () => {
      const next = parseInt(input.value, 10);
      field.rows = Number.isFinite(next) && next >= 2 ? Math.min(50, next) : 5;
      input.value = String(field.rows);
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    input.addEventListener("change", sync);
    input.addEventListener("blur", sync);
    return el("p", {}, [el("label", { text: t("textareaRows", "Rows") }), input]);
  }
  function createExtensionsControl(field) {
    const placeholder = field.type === "image" ? "jpg, jpeg, png, webp, gif, heic" : "pdf, docx, xlsx, zip";
    const input = el("input", {
      type: "text",
      className: "widefat",
      dataset: { blExtensions: "1" },
      value: field.extensions != null ? String(field.extensions) : field.type === "image" ? "jpg, jpeg, png, webp, gif, heic" : "",
      placeholder
    });
    const sync = () => {
      field.extensions = input.value.trim();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    input.addEventListener("input", sync);
    input.addEventListener("change", sync);
    input.addEventListener("blur", sync);
    return el("div", { className: "bl-forms-builder__extensions" }, [
      el("p", {}, [el("label", { text: t("allowedExtensions", "Allowed extensions") }), input]),
      el("p", {
        className: "description",
        text: t(
          "allowedExtensionsHelp",
          "Comma-separated list without dots, e.g. pdf, docx, xlsx. Leave empty to allow all WordPress-permitted types."
        )
      })
    ]);
  }
  function createMaxFilesControl(field) {
    const raw = parseInt(field.max_files, 10);
    const value = Number.isFinite(raw) && raw >= 1 ? String(Math.min(50, raw)) : "10";
    const input = el("input", {
      type: "number",
      className: "widefat",
      min: "1",
      max: "50",
      step: "1",
      dataset: { blMaxFiles: "1" },
      value
    });
    const sync = () => {
      const next = parseInt(input.value, 10);
      field.max_files = Number.isFinite(next) && next >= 1 ? Math.min(50, next) : 10;
      input.value = String(field.max_files);
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    input.addEventListener("change", sync);
    input.addEventListener("blur", sync);
    return el("div", { className: "bl-forms-builder__max-files" }, [
      el("p", {}, [el("label", { text: t("maxFiles", "Maximum files") }), input]),
      el("p", {
        className: "description",
        text: t("maxFilesHelp", "Maximum number of files visitors can upload.")
      })
    ]);
  }
  function createUploadButtonControl(field) {
    const fallbacks = window.blFormsAdmin && window.blFormsAdmin.messageFallbacks || {};
    const placeholder = fallbacks.upload_button || t("uploadButtonDefault", "Choose file");
    const input = el("input", {
      type: "text",
      className: "widefat",
      value: field.button_text || "",
      placeholder,
      dataset: { blUploadButton: "1" }
    });
    input.addEventListener("input", () => {
      field.button_text = input.value;
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    return el("p", {}, [
      el("label", { text: t("uploadButtonText", "Button label") }),
      input
    ]);
  }
  function createUploadAppearanceControls(field) {
    if (field.upload_style !== "classic" && field.upload_style !== "modern") {
      field.upload_style = "modern";
    }
    if (field.preview === void 0) {
      field.preview = true;
    }
    const styleSelect = el("select", {
      className: "widefat",
      dataset: { blUploadStyle: "1" },
      "aria-label": t("uploadStyle", "Style")
    });
    [
      { id: "modern", label: t("uploadStyleModern", "Modern") },
      { id: "classic", label: t("uploadStyleClassic", "Classic") }
    ].forEach((opt) => {
      const option2 = el("option", { value: opt.id, text: opt.label });
      if (field.upload_style === opt.id) {
        option2.selected = true;
      }
      styleSelect.appendChild(option2);
    });
    const previewWrap = el("div", { className: "bl-forms-builder__upload-preview-setting" });
    const syncPreviewVisibility = () => {
      previewWrap.hidden = field.upload_style !== "modern";
    };
    const previewSwitch = createSwitchSetting(
      "blPreview",
      t("showUploadPreview", "Show file preview"),
      field.preview !== false,
      (checked) => {
        field.preview = checked;
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    );
    previewWrap.appendChild(previewSwitch);
    styleSelect.addEventListener("change", () => {
      field.upload_style = styleSelect.value === "classic" ? "classic" : "modern";
      if (field.upload_style === "modern" && field.preview === void 0) {
        field.preview = true;
      }
      syncPreviewVisibility();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    syncPreviewVisibility();
    return el("div", { className: "bl-forms-builder__upload-appearance" }, [
      el("p", { className: "bl-forms-builder__type-select" }, [
        el("label", { text: t("uploadStyle", "Style") }),
        styleSelect
      ]),
      previewWrap
    ]);
  }
  function temporalInputType(type) {
    if (type === "time") {
      return "time";
    }
    if (type === "datetime") {
      return "datetime-local";
    }
    return "date";
  }
  function temporalBoundModes(type, { emptyLabel } = {}) {
    const none = {
      id: "",
      label: emptyLabel || t("boundNone", "No limit")
    };
    if (type === "time") {
      return [
        none,
        { id: "fixed", label: t("boundFixedTime", "Fixed time") },
        { id: "today", label: t("boundNow", "Now") },
        { id: "hour", label: t("boundCurrentHour", "Current hour") },
        { id: "offset", label: t("boundNowOffset", "Minutes relative to now") }
      ];
    }
    if (type === "datetime") {
      return [
        none,
        { id: "fixed", label: t("boundFixedDatetime", "Fixed date & time") },
        { id: "today", label: t("boundNow", "Now") },
        { id: "offset", label: t("boundTodayOffset", "Days relative to today") }
      ];
    }
    return [
      none,
      { id: "fixed", label: t("boundFixedDate", "Fixed date") },
      { id: "today", label: t("boundToday", "Today") },
      { id: "offset", label: t("boundTodayOffset", "Days relative to today") }
    ];
  }
  function createTemporalModeControl(field, which, options = {}) {
    const type = field.type;
    const modeKey = `${which}_mode`;
    const offsetKey = `${which}_offset`;
    const valueKey = which === "default" ? "default_value" : which;
    const datasetMode = which === "min" ? "blMinMode" : which === "max" ? "blMaxMode" : "blDefaultMode";
    const datasetValue = which === "min" ? "blMin" : which === "max" ? "blMax" : "blDefault";
    const datasetOffset = which === "min" ? "blMinOffset" : which === "max" ? "blMaxOffset" : "blDefaultOffset";
    if (which === "default" && !field[modeKey] && field[valueKey] != null && String(field[valueKey]).trim() !== "") {
      field[modeKey] = "fixed";
    }
    if (field[modeKey] == null) {
      field[modeKey] = "";
    }
    if (field[offsetKey] == null || field[offsetKey] === "") {
      field[offsetKey] = 0;
    }
    const modeSelect = el("select", {
      className: "widefat",
      dataset: { [datasetMode]: "1" }
    });
    temporalBoundModes(type, { emptyLabel: options.emptyLabel }).forEach((mode) => {
      const option2 = el("option", { value: mode.id, text: mode.label });
      if ((field[modeKey] || "") === mode.id) {
        option2.selected = true;
      }
      modeSelect.appendChild(option2);
    });
    const fixedInput = el("input", {
      type: temporalInputType(type),
      className: "widefat bl-forms-builder__temporal-fixed",
      dataset: { [datasetValue]: "1" },
      value: field[valueKey] != null && field[valueKey] !== "" ? String(field[valueKey]) : ""
    });
    const offsetInput = el("input", {
      type: "number",
      className: "small-text bl-forms-builder__temporal-offset",
      dataset: { [datasetOffset]: "1" },
      step: "1",
      value: String(field[offsetKey] ?? 0)
    });
    const extras = el("div", { className: "bl-forms-builder__temporal-extras" });
    const emit = () => {
      if (typeof options.onChange === "function") {
        options.onChange();
      }
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    const syncExtras = () => {
      const mode = field[modeKey] || "";
      extras.replaceChildren();
      if (mode === "fixed") {
        extras.appendChild(fixedInput);
      } else if (mode === "offset") {
        const unit = type === "time" ? t("boundMinutes", "minutes") : t("boundDays", "days");
        const prefix = type === "time" ? t("boundNowPlus", "Now \xB1") : t("boundTodayPlus", "Today \xB1");
        extras.appendChild(
          el("div", { className: "bl-forms-builder__temporal-offset-row" }, [
            el("span", { text: prefix }),
            offsetInput,
            el("span", { text: unit })
          ])
        );
      }
    };
    modeSelect.addEventListener("change", () => {
      field[modeKey] = modeSelect.value || "";
      if (!field[modeKey]) {
        field[valueKey] = "";
      }
      syncExtras();
      emit();
    });
    fixedInput.addEventListener("change", () => {
      field[valueKey] = fixedInput.value;
      emit();
    });
    fixedInput.addEventListener("input", () => {
      field[valueKey] = fixedInput.value;
    });
    offsetInput.addEventListener("input", () => {
      const n = parseInt(offsetInput.value, 10);
      field[offsetKey] = Number.isFinite(n) ? n : 0;
      emit();
    });
    syncExtras();
    const nodes = [modeSelect, extras];
    if (options.label) {
      nodes.unshift(el("label", { text: options.label }));
    }
    return el("p", { className: "bl-forms-builder__temporal-side" }, nodes);
  }
  function createTemporalBoundsControl(field) {
    return el("div", { className: "bl-forms-builder__temporal-bounds" }, [
      createTemporalModeControl(field, "min", { label: t("minValue", "Minimum") }),
      createTemporalModeControl(field, "max", { label: t("maxValue", "Maximum") })
    ]);
  }
  function siblingTemporalFields(field) {
    const config = readConfig();
    return flattenFields(config.fields || []).filter(
      (item) => item && item.type === field.type && item.id !== field.id && String(item.name || "").trim() !== ""
    );
  }
  function createTemporalRelationControl(field) {
    const siblings = siblingTemporalFields(field);
    if (siblings.length === 0) {
      return null;
    }
    let relation = String(field.relation || "none");
    if (!["none", "before", "after"].includes(relation)) {
      relation = "none";
    }
    field.relation = relation;
    const wrap = el("div", { className: "bl-forms-builder__date-relation" });
    const modeSelect = el("select", {
      className: "widefat",
      dataset: { blRelation: "1" },
      "aria-label": t("dateRelation", "Relation")
    });
    [
      { value: "none", label: t("dateRelationNone", "No relation") },
      { value: "before", label: t("dateRelationBefore", "Must be before") },
      { value: "after", label: t("dateRelationAfter", "Must be after") }
    ].forEach((item) => {
      const option2 = el("option", { value: item.value, text: item.label });
      if (item.value === relation) {
        option2.selected = true;
      }
      modeSelect.appendChild(option2);
    });
    const fieldSelect = el("select", {
      className: "widefat",
      dataset: { blRelationField: "1" },
      "aria-label": t("dateRelationSelect", "Select field")
    });
    fieldSelect.appendChild(
      el("option", { value: "", text: t("dateRelationSelect", "Select field") })
    );
    const currentRelated = String(field.relation_field || "");
    siblings.forEach((item) => {
      const value = String(item.name || "");
      const label = String(item.label || item.name || value).trim() || value;
      const option2 = el("option", { value, text: label });
      if (value === currentRelated) {
        option2.selected = true;
      }
      fieldSelect.appendChild(option2);
    });
    if (currentRelated && !siblings.some((item) => String(item.name || "") === currentRelated)) {
      field.relation_field = "";
      fieldSelect.value = "";
    }
    const fieldWrap = el("div", { className: "bl-forms-builder__date-relation-field" }, [fieldSelect]);
    const syncUi = () => {
      fieldWrap.hidden = (field.relation || "none") === "none";
    };
    const notify = () => document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    modeSelect.addEventListener("change", () => {
      field.relation = modeSelect.value || "none";
      if (field.relation === "none") {
        field.relation_field = "";
        fieldSelect.value = "";
      }
      syncUi();
      notify();
    });
    fieldSelect.addEventListener("change", () => {
      field.relation_field = fieldSelect.value || "";
      notify();
    });
    wrap.append(
      el("p", {}, [el("label", { text: t("dateRelation", "Relation") }), modeSelect]),
      fieldWrap
    );
    syncUi();
    return wrap;
  }
  function createCssClassControl(field) {
    const input = el("input", {
      type: "text",
      className: "widefat",
      dataset: { blCssClass: "1" },
      value: field.css_class || "",
      placeholder: t("cssClassPlaceholder", "e.g. my-field")
    });
    input.addEventListener("input", () => {
      field.css_class = input.value;
    });
    const wrap = el("div", { className: "bl-forms-builder__css-class" });
    wrap.appendChild(el("p", {}, [el("label", { text: t("cssClass", "CSS class") }), input]));
    wrap.appendChild(
      el("p", {
        className: "description",
        text: t("cssClassHelp", "Optional class names added to this field\u2019s wrapper.")
      })
    );
    return wrap;
  }
  function widthBadgeLabel(field) {
    const width = field.width || "100";
    if (width === "100") {
      return "";
    }
    if (width === "auto") {
      return t("widthAuto", "Auto");
    }
    if (width === "custom") {
      return (field.width_custom || "").trim();
    }
    return `${width}%`;
  }
  function settingHeading(text) {
    return el("p", { className: "bl-forms-builder__setting-heading", text });
  }
  function createCheckboxSetting(key, label, checked, onChange) {
    const input = el("input", {
      type: "checkbox",
      dataset: { [key]: "1" },
      checked: !!checked
    });
    input.addEventListener("change", () => onChange(input.checked));
    return el("p", { className: "bl-forms-builder__check-setting" }, [
      el("label", {}, [input, " " + label])
    ]);
  }
  function createSwitchSetting(key, label, checked, onChange) {
    const input = el("input", {
      type: "checkbox",
      dataset: { [key]: "1" },
      checked: !!checked
    });
    input.addEventListener("change", () => onChange(input.checked));
    return el("div", { className: "bl-forms-builder__switch-setting" }, [
      el("label", { className: "bl-forms-builder__switch" }, [
        input,
        el("span", { className: "bl-forms-builder__switch-ui", "aria-hidden": "true" }),
        el("span", { className: "bl-forms-builder__switch-label", text: label })
      ])
    ]);
  }
  function isDefaultChecked(value) {
    return value === true || value === 1 || value === "1" || value === "true" || value === "yes";
  }
  function defaultInputType(type) {
    switch (type) {
      case "number":
        return "number";
      case "email":
        return "email";
      case "url":
        return "url";
      case "phone":
        return "tel";
      case "date":
        return "date";
      case "time":
        return "time";
      case "datetime":
        return "datetime-local";
      default:
        return "text";
    }
  }
  function isValidDefaultValue(type, value) {
    const v = String(value || "").trim();
    if (v === "") {
      return true;
    }
    if (type === "number") {
      return v !== "" && !Number.isNaN(Number(v)) && /^-?\d+(\.\d+)?$/.test(v);
    }
    if (type === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }
    if (type === "url") {
      try {
        const parsed = new URL(v, window.location.origin);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch (err) {
        return false;
      }
    }
    if (type === "phone") {
      if (!/^\+?[\d\s.\-()]{6,}$/.test(v)) {
        return false;
      }
      const digits = v.replace(/\D+/g, "");
      return digits.length >= 6 && digits.length <= 20;
    }
    if (type === "date") {
      return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
    }
    if (type === "time") {
      return /^\d{2}:\d{2}(:\d{2})?$/.test(v);
    }
    if (type === "datetime") {
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v);
    }
    return true;
  }
  function normalizeDefaultValue(type, value) {
    const v = String(value || "").trim();
    if (v === "" || isValidDefaultValue(type, v)) {
      return v;
    }
    return "";
  }
  function createDefaultValueControl(field, updatePreview) {
    if (NO_DEFAULT.includes(field.type) || field.type === "hidden") {
      return null;
    }
    if (CHECKED_DEFAULT_TYPES.includes(field.type)) {
      return [
        createCheckboxSetting(
          "blDefault",
          t("defaultChecked", "Checked by default"),
          isDefaultChecked(field.default_value),
          (checked) => {
            field.default_value = checked ? "1" : "";
            document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
          }
        )
      ];
    }
    if (["date", "time", "datetime"].includes(field.type)) {
      return [
        createTemporalModeControl(field, "default", {
          label: t("defaultValue", "Default value"),
          emptyLabel: t("defaultNone", "None"),
          onChange: updatePreview
        })
      ];
    }
    field.default_value = normalizeDefaultValue(field.type, field.default_value || "");
    const def = field.type === "textarea" ? el("textarea", {
      className: "widefat",
      rows: "2",
      dataset: { blDefault: "1" }
    }) : el("input", {
      type: defaultInputType(field.type),
      className: "widefat",
      dataset: { blDefault: "1" },
      value: field.default_value || ""
    });
    if (field.type === "textarea") {
      def.value = field.default_value || "";
    }
    if (field.type === "number") {
      def.setAttribute("step", "any");
      def.setAttribute("inputmode", "decimal");
    }
    const commit = () => {
      const next = normalizeDefaultValue(field.type, def.value);
      if (next !== def.value) {
        def.value = next;
      }
      field.default_value = next;
      updatePreview();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    def.addEventListener("input", () => {
      if (["text", "textarea", "phone"].includes(field.type) || OPTION_TYPES.includes(field.type)) {
        field.default_value = def.value;
        updatePreview();
        return;
      }
      field.default_value = def.value;
      updatePreview();
    });
    def.addEventListener("change", commit);
    def.addEventListener("blur", commit);
    const nodes = [el("p", {}, [el("label", { text: t("defaultValue", "Default value") }), def])];
    if (OPTION_TYPES.includes(field.type)) {
      nodes.push(
        el("p", {
          className: "description",
          text: t(
            "defaultValueOptionsHelp",
            "Use option slugs from the list above. For multiple values, separate with commas (e.g. option-1, option-2)."
          )
        })
      );
    }
    return nodes;
  }
  function appearancePayload(scope, width, widthCustom) {
    return {
      width,
      width_custom: width === "custom" ? widthCustom : "",
      css_class: scope.querySelector("[data-bl-css-class]")?.value || ""
    };
  }
  function createFieldEditorTabs(activeId = "general") {
    const tabBar = el("nav", {
      className: "bl-forms-builder__field-tabs",
      role: "tablist"
    });
    const panelsWrap = el("div", { className: "bl-forms-builder__field-panels" });
    const tabDefs = [
      { id: "general", label: t("fieldTabGeneral", "General") },
      { id: "advanced", label: t("fieldTabAdvanced", "Advanced") },
      { id: "appearance", label: t("fieldTabAppearance", "Appearance") }
    ];
    const initialId = tabDefs.some((tab) => tab.id === activeId) ? activeId : "general";
    const tabs = tabDefs.map((tab) => {
      const active = tab.id === initialId;
      const panel = el("div", {
        className: "bl-forms-builder__field-panel" + (active ? " is-active" : ""),
        dataset: { blFieldPanel: tab.id },
        role: "tabpanel"
      });
      if (!active) {
        panel.hidden = true;
      }
      panelsWrap.appendChild(panel);
      const button = el("button", {
        type: "button",
        className: "bl-forms-builder__field-tab" + (active ? " is-active" : ""),
        role: "tab",
        text: tab.label,
        dataset: { blFieldTab: tab.id },
        onClick: () => activate(tab.id)
      });
      button.setAttribute("aria-selected", active ? "true" : "false");
      tabBar.appendChild(button);
      return { ...tab, button, panel };
    });
    const activate = (id) => {
      tabs.forEach((tab) => {
        if (tab.button.hidden) {
          tab.panel.hidden = true;
          tab.panel.classList.remove("is-active");
          tab.button.classList.remove("is-active");
          tab.button.setAttribute("aria-selected", "false");
          return;
        }
        const active = tab.id === id;
        tab.button.classList.toggle("is-active", active);
        tab.button.setAttribute("aria-selected", active ? "true" : "false");
        tab.panel.hidden = !active;
        tab.panel.classList.toggle("is-active", active);
      });
    };
    const wrap = el("div", { className: "bl-forms-builder__field-editor" }, [tabBar, panelsWrap]);
    return {
      wrap,
      general: tabs[0].panel,
      advanced: tabs[1].panel,
      appearance: tabs[2].panel,
      /**
       * Hide tabs whose panels have no sections, and activate a visible tab if needed.
       */
      syncVisibility(preferredId = initialId) {
        tabs.forEach((tab) => {
          const empty = tab.panel.childElementCount === 0;
          tab.button.hidden = empty;
          if (empty) {
            tab.panel.hidden = true;
            tab.panel.classList.remove("is-active");
            tab.button.classList.remove("is-active");
            tab.button.setAttribute("aria-selected", "false");
          }
        });
        const visible = tabs.filter((tab) => !tab.button.hidden);
        tabBar.hidden = visible.length <= 1;
        if (visible.length === 0) {
          return;
        }
        const preferred = visible.find((tab) => tab.id === preferredId) || visible[0];
        activate(preferred.id);
      }
    };
  }
  function createSectionAppender(panel) {
    let count = 0;
    return {
      get count() {
        return count;
      },
      add(...nodes) {
        const list = nodes.flat().filter(Boolean);
        if (!list.length) {
          return;
        }
        panel.appendChild(el("div", { className: "bl-forms-builder__field-section" }, list));
        count += 1;
      }
    };
  }
  function serializeRow(row) {
    const layoutData = serializeLayoutRow(row);
    if (layoutData) {
      return layoutData;
    }
    const type = row.dataset.fieldType || "text";
    const id = row.dataset.fieldId || uid();
    const body = row.querySelector(":scope > .bl-forms-builder__field-body") || row;
    const q = (sel) => body.querySelector(sel);
    const widthBtn = q("[data-bl-width].is-active");
    const width = widthBtn?.dataset.blWidth || row.dataset.fieldWidth || "100";
    const widthCustom = q("[data-bl-width-custom]")?.value || "";
    const nameManual = row.dataset.nameManual === "1";
    const hideLabel = Boolean(q("[data-bl-hide-label]")?.checked);
    const activeInput = q("[data-bl-active]");
    const active = activeInput ? Boolean(activeInput.checked) : true;
    if (type === "divider") {
      const marginBtn = q("[data-bl-margin].is-active");
      const margin = marginBtn?.dataset.blMargin || row.dataset.fieldMargin || "m";
      const marginCustom = q("[data-bl-margin-custom]")?.value || "";
      return {
        id,
        type,
        active,
        margin,
        margin_custom: margin === "custom" ? marginCustom : "",
        css_class: q("[data-bl-css-class]")?.value || ""
      };
    }
    if (type === "captcha") {
      return {
        id,
        type,
        active,
        captcha_provider: q("[data-bl-captcha-provider]")?.value || "turnstile",
        captcha_site_key: q("[data-bl-captcha-site-key]")?.value || "",
        captcha_secret_key: q("[data-bl-captcha-secret-key]")?.value || "",
        ...appearancePayload(body, width, widthCustom)
      };
    }
    if (type === "spacer") {
      const heightBtn = q("[data-bl-height].is-active");
      const height = heightBtn?.dataset.blHeight || row.dataset.fieldHeight || "m";
      const heightCustom = q("[data-bl-height-custom]")?.value || "";
      return {
        id,
        type,
        active,
        height,
        height_custom: height === "custom" ? heightCustom : "",
        css_class: q("[data-bl-css-class]")?.value || ""
      };
    }
    if (type === "heading") {
      const levelBtn = q("[data-bl-heading-level].is-active");
      const level = levelBtn?.dataset.blHeadingLevel || "h2";
      return {
        id,
        type,
        active,
        content: q("[data-bl-content]")?.value || "",
        level: HEADING_LEVELS.includes(level) ? level : "h2",
        ...appearancePayload(body, width, widthCustom)
      };
    }
    if (type === "text_block" || type === "html") {
      return {
        id,
        type,
        active,
        content: q("[data-bl-content]")?.value || "",
        ...appearancePayload(body, width, widthCustom)
      };
    }
    if (type === "honeypot") {
      return {
        id,
        type,
        active,
        label: q("[data-bl-label]")?.value || "",
        name: q("[data-bl-name]")?.value || id,
        name_manual: nameManual,
        hide_label: hideLabel,
        ...appearancePayload(body, width, widthCustom)
      };
    }
    if (type === "hidden") {
      return {
        id,
        type,
        active,
        label: q("[data-bl-label]")?.value || "",
        name: q("[data-bl-name]")?.value || id,
        name_manual: nameManual,
        hide_label: hideLabel,
        default_value: q("[data-bl-default]")?.value || "",
        ...appearancePayload(body, "100", "")
      };
    }
    const data = {
      id,
      type,
      active,
      label: q("[data-bl-label]")?.value || "",
      name: q("[data-bl-name]")?.value || id,
      name_manual: nameManual,
      hide_label: hideLabel,
      required: Boolean(q("[data-bl-required]")?.checked),
      readonly: Boolean(q("[data-bl-readonly]")?.checked),
      disabled: Boolean(q("[data-bl-disabled]")?.checked),
      placeholder: q("[data-bl-placeholder]")?.value || "",
      ...appearancePayload(body, width, widthCustom)
    };
    if (DESCRIPTION_TYPES.includes(type)) {
      data.description = q("[data-bl-description]")?.value || "";
    }
    if (type === "terms") {
      data.content = q("[data-bl-content]")?.value || "";
    }
    if (OPTION_TYPES.includes(type)) {
      data.options = Array.from(body.querySelectorAll("[data-bl-option]")).map((opt) => ({
        label: opt.querySelector("[data-bl-opt-label]")?.value || "",
        value: opt.querySelector("[data-bl-opt-value]")?.value || ""
      }));
    }
    if (type === "radio" || type === "checkboxes") {
      const layoutBtn = q("[data-bl-layout].is-active");
      data.layout = layoutBtn?.dataset.blLayout === "horizontal" ? "horizontal" : "vertical";
    }
    if (MULTIPLE_TYPES.includes(type)) {
      data.multiple = Boolean(q("[data-bl-multiple]")?.checked);
    }
    if (type === "file" || type === "image") {
      data.extensions = q("[data-bl-extensions]")?.value?.trim() || "";
      data.upload_style = q("[data-bl-upload-style]")?.value === "classic" ? "classic" : "modern";
      data.preview = data.upload_style === "modern" ? Boolean(q("[data-bl-preview]")?.checked) : false;
      data.button_text = q("[data-bl-upload-button]")?.value?.trim() || "";
      if (data.multiple) {
        const rawMax = q("[data-bl-max-files]")?.value?.trim();
        const parsed = parseInt(rawMax, 10);
        data.max_files = Number.isFinite(parsed) && parsed >= 1 ? Math.min(50, parsed) : 10;
      }
    }
    if (AUTOCOMPLETE_TYPES.includes(type)) {
      const ac = q("[data-bl-autocomplete]");
      data.autocomplete = ac?.value === "off" ? "off" : "auto";
    }
    if (AFFIX_TYPES.includes(type)) {
      data.prefix = q("[data-bl-prefix]")?.value ?? "";
      data.suffix = q("[data-bl-suffix]")?.value ?? "";
    }
    if (type === "number") {
      data.min = q("[data-bl-min]")?.value?.trim() || "";
      data.max = q("[data-bl-max]")?.value?.trim() || "";
    }
    if (type === "text" || type === "textarea") {
      data.max_length = q("[data-bl-max-length]")?.value?.trim() || "";
      data.show_char_count = Boolean(q("[data-bl-show-char-count]")?.checked);
    }
    if (type === "textarea") {
      const rawRows = parseInt(q("[data-bl-rows]")?.value, 10);
      data.rows = Number.isFinite(rawRows) && rawRows >= 2 ? Math.min(50, rawRows) : 5;
    }
    if (type === "date" || type === "time" || type === "datetime") {
      data.placeholder = "";
      const readSide = (which) => {
        const modeSel = which === "min" ? "[data-bl-min-mode]" : which === "max" ? "[data-bl-max-mode]" : "[data-bl-default-mode]";
        const valueSel = which === "min" ? "[data-bl-min]" : which === "max" ? "[data-bl-max]" : "[data-bl-default]";
        const offsetSel = which === "min" ? "[data-bl-min-offset]" : which === "max" ? "[data-bl-max-offset]" : "[data-bl-default-offset]";
        const valueKey = which === "default" ? "default_value" : which;
        const mode = q(modeSel)?.value || "";
        if (!mode) {
          if (which === "default") {
            data.default_value = "";
          }
          return;
        }
        data[`${which}_mode`] = mode;
        if (mode === "fixed") {
          data[valueKey] = q(valueSel)?.value?.trim() || "";
        }
        if (mode === "offset") {
          const raw = q(offsetSel)?.value;
          const n = parseInt(raw, 10);
          data[`${which}_offset`] = Number.isFinite(n) ? n : 0;
        }
      };
      readSide("min");
      readSide("max");
      readSide("default");
      const relation = q("[data-bl-relation]")?.value || "none";
      if (relation === "before" || relation === "after") {
        data.relation = relation;
        data.relation_field = q("[data-bl-relation-field]")?.value || "";
        if (!data.relation_field) {
          data.relation = "none";
          data.relation_field = "";
        }
      } else {
        data.relation = "none";
        data.relation_field = "";
      }
    }
    if (NO_READONLY.includes(type)) {
      delete data.readonly;
    }
    if (NO_DISABLED.includes(type)) {
      delete data.disabled;
    }
    if (NO_REQUIRED.includes(type)) {
      delete data.required;
    }
    if (!NO_DEFAULT.includes(type) && type !== "date" && type !== "time" && type !== "datetime") {
      const defEl = q("[data-bl-default]");
      if (defEl) {
        data.default_value = defEl.type === "checkbox" ? defEl.checked ? "1" : "" : defEl.value || "";
      }
    }
    return data;
  }
  function createFieldCard(initial, open = false) {
    if ((initial?.type || "") === "column") {
      return createColumnCard(initial, open);
    }
    if ((initial?.type || "") === "section") {
      return createSectionCard(initial, open);
    }
    let field = {
      width: "100",
      width_custom: "",
      hide_label: false,
      active: true,
      ...initial,
      id: initial.id || uid(),
      name_manual: initial.name_manual != null ? !!initial.name_manual : true
    };
    if (field.active === void 0) {
      field.active = true;
    }
    if (field.type === "terms" && field.content == null && field.label) {
      field = { ...field, content: field.label, label: "" };
    }
    if (field.type === "spacer") {
      normalizeSpacerHeight(field);
    }
    if (field.type === "divider") {
      normalizeDividerMargin(field);
    }
    if (field.type === "heading") {
      normalizeHeadingLevel(field);
    }
    if (NAMED_TYPES.includes(field.type) && !field.name) {
      field.name = uniqueFieldName(field.label || field.type, field.id);
    }
    const row = el("div", {
      className: "bl-forms-builder__field" + (open ? " is-open" : ""),
      dataset: {
        blFormsField: "1",
        fieldId: field.id,
        fieldType: field.type,
        fieldWidth: field.width || "100",
        fieldHeight: field.type === "spacer" ? field.height || "m" : "",
        fieldMargin: field.type === "divider" ? field.margin || "m" : "",
        fieldName: field.name || "",
        nameManual: field.name_manual ? "1" : "0"
      }
    });
    const preview = el("span", { className: "bl-forms-builder__preview" });
    const widthBadge = el("span", { className: "bl-forms-builder__width-badge" });
    const activateBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__activate-btn",
      title: t("fieldActivateTitle", "Show on the frontend"),
      "aria-label": t("fieldActivateTitle", "Show on the frontend"),
      hidden: fieldIsActive(field),
      onClick: (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        field.active = true;
        const activeInput = body.querySelector("[data-bl-active]");
        if (activeInput) {
          activeInput.checked = true;
        }
        updatePreview();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    });
    activateBtn.appendChild(iconEl("inactive", "bl-forms-builder__activate-btn-icon"));
    const typeChip = el("span", { className: "bl-forms-builder__field-type" });
    const body = el("div", { className: "bl-forms-builder__field-body" });
    const updatePreview = () => {
      let title = (field.label || field.placeholder || "").trim();
      if (field.type === "captcha") {
        title = captchaProviderLabel(field.captcha_provider || "turnstile");
      } else if (field.type === "spacer") {
        const height = field.height || "m";
        title = height === "custom" ? (field.height_custom || t("widthCustom", "Custom")).trim() : height.toUpperCase();
      } else if (field.type === "divider") {
        const margin = field.margin || "m";
        if (margin === "custom") {
          title = (field.margin_custom || t("widthCustom", "Custom")).trim();
        } else {
          const preset = DIVIDER_MARGIN_PRESETS.find((item) => item.value === margin);
          title = preset?.label || margin.toUpperCase();
        }
      } else if (field.type === "heading" || field.type === "text_block" || field.type === "html") {
        title = (field.content || "").trim();
      }
      preview.textContent = title;
      preview.hidden = title === "";
      const widthText = field.type === "hidden" || field.type === "divider" || field.type === "spacer" ? "" : widthBadgeLabel(field);
      widthBadge.textContent = widthText;
      widthBadge.hidden = widthText === "";
      widthBadge.classList.toggle("is-interactive", widthText !== "");
      if (widthText !== "") {
        widthBadge.title = t("width", "Width");
      } else {
        widthBadge.removeAttribute("title");
      }
      const active = fieldIsActive(field);
      row.classList.toggle("is-inactive", !active);
      activateBtn.hidden = active;
      const typeChildren = [
        iconEl(field.type, "bl-forms-builder__field-type-icon"),
        el("span", { className: "bl-forms-builder__field-type-label", text: typeLabel(field.type) })
      ];
      if (field.required && !NO_REQUIRED.includes(field.type)) {
        typeChildren.push(
          el("span", {
            className: "bl-forms-builder__field-required-dot",
            title: t("required", "Required"),
            "aria-label": t("required", "Required")
          })
        );
      }
      typeChip.replaceChildren(...typeChildren);
      row.dataset.fieldType = field.type;
      row.dataset.fieldWidth = field.width || "100";
      row.dataset.fieldHeight = field.type === "spacer" ? field.height || "m" : "";
      row.dataset.fieldMargin = field.type === "divider" ? field.margin || "m" : "";
      row.dataset.fieldName = field.name || "";
      row.dataset.nameManual = field.name_manual ? "1" : "0";
    };
    const setOpen = (nextOpen) => {
      if (nextOpen) {
        document.querySelectorAll(".bl-forms-builder__field.is-open").forEach((other) => {
          if (other === row) {
            return;
          }
          other.classList.remove("is-open");
          const otherToggle = other.querySelector(".bl-forms-builder__field-toggle");
          if (otherToggle) {
            otherToggle.setAttribute("aria-expanded", "false");
            otherToggle.setAttribute("aria-label", t("expandField", "Expand field"));
          }
        });
      }
      row.classList.toggle("is-open", nextOpen);
      toggle.setAttribute("aria-expanded", nextOpen ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        nextOpen ? t("collapseField", "Collapse field") : t("expandField", "Expand field")
      );
    };
    const toggle = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__field-toggle",
      "aria-expanded": open ? "true" : "false",
      "aria-label": open ? t("collapseField", "Collapse field") : t("expandField", "Expand field"),
      onClick: () => setOpen(!row.classList.contains("is-open"))
    });
    const caretIcon = iconEl("caret", "bl-forms-builder__field-toggle-icon");
    if (caretIcon.innerHTML) {
      toggle.appendChild(caretIcon);
    } else {
      toggle.textContent = "\u25BE";
    }
    const deleteBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger",
      title: t("delete", "Delete"),
      "aria-label": t("delete", "Delete"),
      onClick: () => {
        row.remove();
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    });
    const trashIcon = iconEl("trash");
    if (trashIcon.innerHTML) {
      deleteBtn.appendChild(trashIcon);
    } else {
      deleteBtn.textContent = "\xD7";
    }
    const syncNameFromLabel = (nameInput) => {
      if (field.name_manual || !nameInput) {
        return;
      }
      const next = uniqueFieldName(field.label || field.type, field.id);
      field.name = next;
      nameInput.value = next;
      row.dataset.fieldName = next;
    };
    const renderBody = (activeTab = "general") => {
      body.replaceChildren();
      const tabs = createFieldEditorTabs(activeTab);
      const { general, advanced, appearance } = tabs;
      const generalSections = createSectionAppender(general);
      const advancedSections = createSectionAppender(advanced);
      const appearanceSections = createSectionAppender(appearance);
      generalSections.add(
        el("div", { className: "bl-forms-builder__field-status" }, [
          settingHeading(t("fieldStatus", "Status")),
          createSwitchSetting("blActive", t("fieldActive", "Active"), fieldIsActive(field), (checked) => {
            field.active = checked;
            updatePreview();
            document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
          })
        ])
      );
      const onTypeConvert = () => {
        updatePreview();
        const stayOn = ["heading", "text_block", "html"].includes(field.type) ? "general" : "advanced";
        renderBody(stayOn);
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      };
      const typeSelect = createTypeSelect(field, row, onTypeConvert);
      const contentTypes = ["heading", "text_block", "html"];
      if (typeSelect && contentTypes.includes(field.type)) {
        generalSections.add(typeSelect);
      } else if (typeSelect) {
        advancedSections.add(typeSelect);
      }
      if (field.type === "heading") {
        appearanceSections.add(createHeadingLevelControl(field, updatePreview));
      }
      if (field.type === "spacer") {
        appearanceSections.add(createHeightControl(field, updatePreview));
      }
      if (field.type === "divider") {
        appearanceSections.add(createMarginControl(field, updatePreview));
      }
      if (field.type !== "hidden" && field.type !== "divider" && field.type !== "spacer") {
        appearanceSections.add(createWidthControl(field, updatePreview));
      }
      if (field.type === "file" || field.type === "image") {
        appearanceSections.add(createUploadAppearanceControls(field));
      }
      if (field.type === "radio" || field.type === "checkboxes") {
        appearanceSections.add(createLayoutControl(field));
      }
      appearanceSections.add(createCssClassControl(field));
      if (field.type === "divider" || field.type === "spacer") {
      } else if (field.type === "captcha") {
        generalSections.add(
          createCaptchaSettings(field, () => {
            updatePreview();
          })
        );
      } else if (["heading", "text_block", "html"].includes(field.type)) {
        const ta = el("textarea", {
          className: "widefat",
          rows: field.type === "html" ? "6" : "3",
          dataset: { blContent: "1" }
        });
        ta.value = field.content || "";
        ta.addEventListener("input", () => {
          field.content = ta.value;
          updatePreview();
        });
        const contentLabel = field.type === "html" ? t("htmlContent", "HTML") : t("content", "Content");
        generalSections.add(el("p", {}, [el("label", { text: contentLabel }), ta]));
      } else {
        const labelInput = el("input", {
          type: "text",
          className: "widefat",
          dataset: { blLabel: "1" }
        });
        labelInput.value = field.label || "";
        let nameInput = null;
        if (NAMED_TYPES.includes(field.type)) {
          nameInput = el("input", {
            type: "text",
            className: "widefat",
            dataset: { blName: "1" },
            value: field.name || uniqueFieldName(field.label || field.type, field.id)
          });
          nameInput.addEventListener("input", () => {
            field.name_manual = true;
            field.name = nameInput.value;
            row.dataset.nameManual = "1";
            row.dataset.fieldName = field.name;
          });
          nameInput.addEventListener("blur", () => {
            const next = uniqueFieldName(nameInput.value || field.label || field.type, field.id);
            field.name = next;
            nameInput.value = next;
            row.dataset.fieldName = next;
            document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
          });
        }
        labelInput.addEventListener("input", () => {
          field.label = labelInput.value;
          syncNameFromLabel(nameInput);
          updatePreview();
        });
        const labelControls = el("div", { className: "bl-forms-builder__label-controls" }, [labelInput]);
        if (HIDE_LABEL_TYPES.includes(field.type)) {
          labelControls.appendChild(
            el("div", { className: "bl-forms-builder__hide-label" }, [
              createSwitchSetting("blHideLabel", t("hideLabel", "Hide label"), !!field.hide_label, (checked) => {
                field.hide_label = checked;
                document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
              })
            ])
          );
        }
        generalSections.add(
          el("div", { className: "bl-forms-builder__label-row" }, [
            el("label", { text: t("label", "Label") }),
            labelControls
          ])
        );
        if (nameInput) {
          advancedSections.add(
            el("p", {}, [el("label", { text: t("name", "Field name") }), nameInput]),
            el("p", {
              className: "description",
              text: t(
                "nameHelp",
                "Internal field key used in submissions, emails, and entry data."
              )
            })
          );
        }
        if (AFFIX_TYPES.includes(field.type)) {
          advancedSections.add(createPrefixSuffixControl(field));
        }
        if (field.type === "textarea") {
          advancedSections.add(createTextareaRowsControl(field));
        }
        if (field.type === "text" || field.type === "textarea") {
          advancedSections.add(createMaxLengthControl(field));
        }
        if (field.type === "file" || field.type === "image") {
          advancedSections.add(createExtensionsControl(field));
          advancedSections.add(createUploadButtonControl(field));
          if (field.multiple) {
            advancedSections.add(createMaxFilesControl(field));
          }
        }
        if (field.type === "number") {
          advancedSections.add(createNumberBoundsControl(field));
        }
        if (["date", "time", "datetime"].includes(field.type)) {
          advancedSections.add(createTemporalBoundsControl(field));
          const relationControl = createTemporalRelationControl(field);
          if (relationControl) {
            advancedSections.add(relationControl);
          }
        }
        if (AUTOCOMPLETE_TYPES.includes(field.type)) {
          advancedSections.add(createAutocompleteControl(field));
        }
        if (field.type === "terms") {
          const consentText = el("textarea", {
            className: "widefat",
            rows: "3",
            dataset: { blContent: "1" }
          });
          consentText.value = field.content || "";
          consentText.addEventListener("input", () => {
            field.content = consentText.value;
            updatePreview();
          });
          generalSections.add(
            el("p", {}, [el("label", { text: t("checkboxText", "Checkbox text") }), consentText]),
            el("p", {
              className: "description bl-forms-builder__help-lines",
              text: t(
                "checkboxTextHelp",
                "You can insert links using Markdown:\n[Privacy Policy](page:privacy)\n[Imprint](page:123)\n[AGB](/abg)"
              )
            })
          );
        }
        if (field.type === "hidden") {
          const def = el("input", {
            type: "text",
            className: "widefat",
            dataset: { blDefault: "1" },
            value: field.default_value || ""
          });
          def.addEventListener("input", () => {
            field.default_value = def.value;
            document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
          });
          generalSections.add(
            el("p", {}, [el("label", { text: t("defaultValue", "Default value") }), def])
          );
        }
        if (field.type === "honeypot") {
          generalSections.add(
            el("p", {
              className: "description",
              text: t(
                "honeypotHelp",
                "Hidden from visitors. If filled, the submission is treated as spam."
              )
            })
          );
        }
        if (!NO_PLACEHOLDER.includes(field.type)) {
          const ph = el("input", {
            type: "text",
            className: "widefat",
            dataset: { blPlaceholder: "1" }
          });
          ph.value = field.placeholder || "";
          ph.addEventListener("input", () => {
            field.placeholder = ph.value;
            updatePreview();
          });
          generalSections.add(
            el("p", {}, [el("label", { text: t("placeholder", "Placeholder") }), ph])
          );
        }
        if (DESCRIPTION_TYPES.includes(field.type)) {
          const desc = el("textarea", {
            className: "widefat",
            rows: "2",
            dataset: { blDescription: "1" }
          });
          desc.value = field.description || "";
          desc.addEventListener("input", () => {
            field.description = desc.value;
          });
          generalSections.add(
            el("p", {}, [el("label", { text: t("description", "Description") }), desc])
          );
        }
        if (OPTION_TYPES.includes(field.type)) {
          generalSections.add(
            settingHeading(t("choices", "Choices")),
            createOptionsEditor(field.options || [])
          );
        }
        if (field.type !== "hidden") {
          const defaults2 = createDefaultValueControl(field, updatePreview);
          if (defaults2) {
            if (CHECKED_DEFAULT_TYPES.includes(field.type)) {
              generalSections.add(settingHeading(t("defaultValue", "Default value")), ...defaults2);
            } else {
              generalSections.add(...defaults2);
            }
          }
        }
        const optionToggles = [];
        if (!NO_REQUIRED.includes(field.type)) {
          optionToggles.push(
            createSwitchSetting("blRequired", t("required", "Required"), !!field.required, (checked) => {
              field.required = checked;
              updatePreview();
              document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
            })
          );
        }
        if (MULTIPLE_TYPES.includes(field.type)) {
          let multipleLabel = t("allowMultiple", "Allow multiple");
          if (field.type === "button_group") {
            multipleLabel = t("buttonGroupMultiple", "Allow multiple selection");
          } else if (field.type === "select") {
            multipleLabel = t("selectMultiple", "Allow multiple selection");
          } else if (field.type === "file" || field.type === "image") {
            multipleLabel = t("allowMultipleFiles", "Allow multiple files");
          }
          optionToggles.push(
            createSwitchSetting("blMultiple", multipleLabel, !!field.multiple, (checked) => {
              field.multiple = checked;
              if (field.type === "file" || field.type === "image") {
                if (checked && (field.max_files == null || field.max_files === "")) {
                  field.max_files = 10;
                }
                renderBody("general");
              }
              document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
            })
          );
        }
        if (!NO_READONLY.includes(field.type)) {
          optionToggles.push(
            createSwitchSetting("blReadonly", t("readOnly", "Read only"), !!field.readonly, (checked) => {
              field.readonly = checked;
              document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
            })
          );
        }
        if (!NO_DISABLED.includes(field.type)) {
          optionToggles.push(
            createSwitchSetting("blDisabled", t("disabled", "Disabled"), !!field.disabled, (checked) => {
              field.disabled = checked;
              document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
            })
          );
        }
        if (optionToggles.length) {
          generalSections.add(
            settingHeading(t("options", "Options")),
            el("div", { className: "bl-forms-builder__options-toggles" }, optionToggles)
          );
        }
      }
      tabs.syncVisibility(activeTab);
      body.appendChild(tabs.wrap);
    };
    const handle = el("span", {
      className: "bl-forms-builder__handle",
      title: t("dragField", "Drag to reorder"),
      "aria-hidden": "true"
    });
    const dragIcon = iconEl("drag");
    if (dragIcon.innerHTML) {
      handle.appendChild(dragIcon);
    } else {
      handle.textContent = "\u22EE\u22EE";
    }
    const headerMeta = el("div", { className: "bl-forms-builder__field-meta" }, [
      widthBadge,
      typeChip
    ]);
    widthBadge.addEventListener("click", (evt) => {
      if (widthBadge.hidden || field.type === "hidden" || field.type === "divider" || field.type === "spacer") {
        return;
      }
      evt.preventDefault();
      evt.stopPropagation();
      openFieldWidthModal(field, () => {
        updatePreview();
        syncWidthControlUi(body, field);
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      });
    });
    const header = el("div", { className: "bl-forms-builder__field-header" }, [
      toggle,
      preview,
      headerMeta,
      el("div", { className: "bl-forms-builder__field-actions" }, [activateBtn, deleteBtn, handle])
    ]);
    updatePreview();
    renderBody();
    row.appendChild(header);
    row.appendChild(body);
    if (open) {
      setOpen(true);
    }
    return row;
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/canvas.js
  function expandLegacyGroups(fields) {
    const out = [];
    (fields || []).forEach((field) => {
      if ((field?.type || "") === "group") {
        (field.children || []).forEach((child) => {
          if ((child?.type || "") === "column") {
            out.push(child);
          }
        });
        return;
      }
      out.push(field);
    });
    return out;
  }
  function createCanvas({ fields = [], onChange }) {
    const wrap = el("section", { className: "bl-forms-builder__canvas" });
    wrap.appendChild(el("h3", { className: "bl-forms-builder__col-title", text: t("canvasHeading", "Form") }));
    const list = el("div", {
      className: "bl-forms-builder__list",
      dataset: { blFormsCanvas: "1" }
    });
    const empty = el("div", {
      className: "description bl-forms-builder__empty",
      text: t("empty", "Drag a field here, or click a template to add it.")
    });
    const syncEmpty = () => {
      empty.hidden = list.querySelector(":scope > [data-bl-forms-field]") != null;
    };
    const prepareField = (typeOrData) => {
      const data = typeof typeOrData === "string" ? defaultField(typeOrData) : { ...typeOrData };
      if (data.name != null && data.name_manual === false) {
        data.name = uniqueFieldName(data.label || data.name || data.type || "field", data.id || "");
      } else if (data.name) {
        data.name = uniqueFieldName(data.name, data.id || "");
      }
      return data;
    };
    const addField = (typeOrData, open = true) => {
      const card = createFieldCard(prepareField(typeOrData), open);
      list.appendChild(card);
      if ((card.dataset.fieldType || "") === "column") {
        equalizeColumnRun(list, card);
      }
      syncEmpty();
      onChange();
      return card;
    };
    expandLegacyGroups(fields || []).forEach((field) => {
      list.appendChild(createFieldCard(field, false));
    });
    syncEmpty();
    wrap.append(list, empty);
    sortable_esm_default.create(list, {
      group: {
        name: "bl-forms-fields",
        put(to, from, dragEl2) {
          return true;
        }
      },
      handle: ".bl-forms-builder__handle",
      animation: 150,
      draggable: ".bl-forms-builder__field, .bl-forms-builder__template",
      onStart: formsDragStart,
      onEnd: formsDragEnd,
      onAdd(evt) {
        const item = evt.item;
        const type = item.dataset.fieldType || "text";
        let card = item;
        if (item.classList.contains("bl-forms-builder__template")) {
          card = createFieldCard(prepareField(type), true);
          item.replaceWith(card);
        }
        if ((card.dataset.fieldType || "") === "column") {
          equalizeColumnRun(list, card);
        }
        syncEmpty();
        onChange();
      },
      onUpdate() {
        onChange();
      },
      onSort() {
        onChange();
      }
    });
    return {
      root: wrap,
      addField,
      syncEmpty,
      getFields() {
        return Array.from(list.children).filter((el2) => el2.matches?.("[data-bl-forms-field]")).map(serializeRow);
      }
    };
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/page-picker.js
  function openPagePicker(options = {}) {
    const opts = {
      selectedId: 0,
      title: "Select a page",
      searchPlaceholder: "Search pages\u2026",
      empty: "No pages found.",
      loading: "Loading\u2026",
      cancelLabel: "Cancel",
      selectLabel: "Select",
      restUrl: "",
      restNonce: "",
      ...options
    };
    const api = window.wpApiSettings || {};
    const restUrl = opts.restUrl || (api.root ? String(api.root).replace(/\/?$/, "/") + "wp/v2/pages" : "");
    const restNonce = opts.restNonce || api.nonce || "";
    return new Promise((resolve) => {
      let settled = false;
      let selected = {
        id: Number(opts.selectedId) || 0,
        title: "",
        url: ""
      };
      let debounceTimer = 0;
      let abort = null;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };
      const onKey = (evt) => {
        if (evt.key === "Escape") {
          finish(null);
        }
      };
      const cleanup = () => {
        document.removeEventListener("keydown", onKey);
        document.body.classList.remove("bl-page-picker-open");
        if (abort) {
          abort.abort();
          abort = null;
        }
        if (debounceTimer) {
          window.clearTimeout(debounceTimer);
        }
        backdrop.remove();
      };
      const backdrop = document.createElement("div");
      backdrop.className = "bl-page-picker";
      backdrop.setAttribute("role", "dialog");
      backdrop.setAttribute("aria-modal", "true");
      backdrop.setAttribute("aria-label", opts.title);
      const dialog = document.createElement("div");
      dialog.className = "bl-page-picker__dialog";
      const header = document.createElement("div");
      header.className = "bl-page-picker__header";
      const titleEl = document.createElement("h2");
      titleEl.className = "bl-page-picker__title";
      titleEl.textContent = opts.title;
      header.appendChild(titleEl);
      const searchWrap = document.createElement("div");
      searchWrap.className = "bl-page-picker__search-wrap";
      const search = document.createElement("input");
      search.type = "search";
      search.className = "bl-page-picker__search";
      search.placeholder = opts.searchPlaceholder;
      search.setAttribute("autocomplete", "off");
      searchWrap.appendChild(search);
      const list = document.createElement("div");
      list.className = "bl-page-picker__list";
      list.setAttribute("role", "listbox");
      const status = document.createElement("p");
      status.className = "bl-page-picker__status description";
      status.hidden = true;
      const body = document.createElement("div");
      body.className = "bl-page-picker__body";
      body.append(searchWrap, status, list);
      const footer = document.createElement("div");
      footer.className = "bl-page-picker__footer";
      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "button -small";
      cancelBtn.textContent = opts.cancelLabel;
      cancelBtn.addEventListener("click", () => finish(null));
      const selectBtn = document.createElement("button");
      selectBtn.type = "button";
      selectBtn.className = "button button-primary -small";
      selectBtn.textContent = opts.selectLabel;
      selectBtn.disabled = !selected.id;
      selectBtn.addEventListener("click", () => {
        if (selected.id) {
          finish({ ...selected });
        }
      });
      footer.append(cancelBtn, selectBtn);
      dialog.append(header, body, footer);
      backdrop.appendChild(dialog);
      backdrop.addEventListener("click", (evt) => {
        if (evt.target === backdrop) {
          finish(null);
        }
      });
      document.addEventListener("keydown", onKey);
      const setStatus = (text) => {
        status.textContent = text || "";
        status.hidden = !text;
      };
      const renderRows = (pages) => {
        list.replaceChildren();
        if (!pages.length) {
          setStatus(opts.empty);
          return;
        }
        setStatus("");
        pages.forEach((page) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "bl-page-picker__item";
          btn.setAttribute("role", "option");
          const active = Number(page.id) === selected.id;
          btn.classList.toggle("is-selected", active);
          btn.setAttribute("aria-selected", active ? "true" : "false");
          const title = document.createElement("span");
          title.className = "bl-page-picker__item-title";
          title.textContent = page.title || `#${page.id}`;
          const meta = document.createElement("span");
          meta.className = "bl-page-picker__item-meta";
          meta.textContent = page.url || "";
          btn.append(title, meta);
          btn.addEventListener("click", () => {
            selected = {
              id: Number(page.id) || 0,
              title: page.title || "",
              url: page.url || ""
            };
            list.querySelectorAll(".bl-page-picker__item").forEach((node) => {
              const on2 = Number(node.dataset.pageId) === selected.id;
              node.classList.toggle("is-selected", on2);
              node.setAttribute("aria-selected", on2 ? "true" : "false");
            });
            selectBtn.disabled = !selected.id;
          });
          btn.dataset.pageId = String(page.id);
          list.appendChild(btn);
        });
      };
      const fetchPages = async (query = "") => {
        if (!restUrl) {
          setStatus(opts.empty);
          return;
        }
        if (abort) {
          abort.abort();
        }
        abort = new AbortController();
        setStatus(opts.loading);
        list.replaceChildren();
        const url = new URL(restUrl, window.location.origin);
        url.searchParams.set("status", "publish");
        url.searchParams.set("per_page", "20");
        url.searchParams.set("orderby", "title");
        url.searchParams.set("order", "asc");
        url.searchParams.set("_fields", "id,title,link");
        if (query) {
          url.searchParams.set("search", query);
        }
        try {
          const res = await fetch(url.toString(), {
            credentials: "same-origin",
            signal: abort.signal,
            headers: restNonce ? {
              "X-WP-Nonce": restNonce
            } : {}
          });
          if (!res.ok) {
            setStatus(opts.empty);
            return;
          }
          const data = await res.json();
          const pages = (Array.isArray(data) ? data : []).map((row) => ({
            id: Number(row.id) || 0,
            title: row.title && typeof row.title.rendered === "string" ? row.title.rendered.replace(/<[^>]+>/g, "") : String(row.title || ""),
            url: typeof row.link === "string" ? row.link : ""
          }));
          renderRows(pages);
        } catch (err) {
          if (err && err.name === "AbortError") {
            return;
          }
          setStatus(opts.empty);
        }
      };
      search.addEventListener("input", () => {
        window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => {
          fetchPages(search.value.trim());
        }, 220);
      });
      document.body.classList.add("bl-page-picker-open");
      document.body.appendChild(backdrop);
      search.focus();
      fetchPages("");
    });
  }
  window.baselayerOpenPagePicker = openPagePicker;

  // themes/baselayer/packages/baselayer-forms/src/js/admin/panels.js
  function fieldRow(label, control, help = "") {
    const children = [
      el("label", {}, [el("strong", { text: label })]),
      control
    ];
    if (help) {
      children.push(el("span", { className: "description", text: help }));
    }
    return el("p", { className: "bl-forms-builder__setting" }, children);
  }
  function errorSection(title, children) {
    return el("div", { className: "bl-forms-builder__field-errors" }, [
      el("h3", {
        className: "bl-forms-builder__section-title",
        text: title
      }),
      el("div", { className: "bl-forms-builder__field-errors-box" }, children)
    ]);
  }
  function emailFieldsFromList(fields) {
    return flattenFields(fields || []).filter(
      (field) => field && field.type === "email" && field.name && field.active !== false
    );
  }
  function emailFieldLabel(field) {
    const label = (field.label || "").trim();
    const name = field.name || "";
    if (label && label !== name) {
      return `${label} (${name})`;
    }
    return label || name;
  }
  function randomHoneypotName() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let out = "hp_";
    for (let i = 0; i < 10; i += 1) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }
  function securityBadge(kind) {
    if (kind !== "required" && kind !== "always") {
      return null;
    }
    const badge = el("span", {
      className: "bl-forms-builder__security-badge bl-forms-builder__security-badge--always"
    });
    const icon = iconEl("lock", "bl-forms-builder__security-badge-icon");
    if (icon.innerHTML) {
      badge.appendChild(icon);
    }
    badge.appendChild(
      el("span", {
        className: "bl-forms-builder__security-badge-text",
        text: t("securityAlwaysOn", "Always on")
      })
    );
    return badge;
  }
  function securitySwitch(label, kind, { checked = false, disabled = false, onChange = null } = {}) {
    const input = el("input", {
      type: "checkbox",
      checked: !!checked,
      disabled: !!disabled
    });
    if (onChange && !disabled) {
      input.addEventListener("change", () => onChange(input.checked));
    }
    const labelChildren = [
      input,
      el("span", { className: "bl-forms-builder__switch-ui", "aria-hidden": "true" }),
      el("span", { className: "bl-forms-builder__switch-label", text: label })
    ];
    const badge = securityBadge(kind);
    if (badge) {
      labelChildren.push(badge);
    }
    const root = el(
      "div",
      {
        className: "bl-forms-builder__switch-setting bl-forms-builder__security-heading" + (disabled ? " is-disabled" : "")
      },
      [el("label", { className: "bl-forms-builder__switch" }, labelChildren)]
    );
    return { root, input };
  }
  function plainSwitch(label, { checked = false, onChange = null } = {}) {
    const input = el("input", {
      type: "checkbox",
      checked: !!checked
    });
    if (onChange) {
      input.addEventListener("change", () => onChange(input.checked));
    }
    const root = el("div", { className: "bl-forms-builder__switch-setting" }, [
      el("label", { className: "bl-forms-builder__switch" }, [
        input,
        el("span", { className: "bl-forms-builder__switch-ui", "aria-hidden": "true" }),
        el("span", { className: "bl-forms-builder__switch-label", text: label })
      ])
    ]);
    return { root, input };
  }
  function securityOption(heading, help, extra = null) {
    const bodyChildren = [el("span", { className: "description", text: help })];
    if (extra) {
      bodyChildren.push(extra);
    }
    return el("div", { className: "bl-forms-builder__setting bl-forms-builder__security-option" }, [
      heading,
      el("div", { className: "bl-forms-builder__security-body" }, bodyChildren)
    ]);
  }
  function lockedOption(label, help) {
    const { root } = securitySwitch(label, "always", { checked: true, disabled: true });
    return securityOption(root, help);
  }
  function createPanels(settings, builderRoot, onChange) {
    const state = { ...settings || {} };
    let emailFields = [];
    if (!state.honeypot_name || state.honeypot_name === "bl_forms_hp") {
      state.honeypot_name = randomHoneypotName();
    }
    if (state.min_fill_time_enabled === void 0) {
      state.min_fill_time_enabled = true;
    }
    if (state.min_fill_time === void 0 || state.min_fill_time === "") {
      state.min_fill_time = 2;
    }
    if (state.rate_limit_enabled === void 0) {
      state.rate_limit_enabled = true;
    }
    if (state.rate_limit_max === void 0 || state.rate_limit_max === "") {
      state.rate_limit_max = 3;
    }
    if (state.rate_limit_window === void 0 || state.rate_limit_window === "") {
      state.rate_limit_window = 5;
    }
    if (!state.after_submit || !["message", "redirect"].includes(state.after_submit)) {
      state.after_submit = "message";
    }
    state.redirect_page_id = Number(state.redirect_page_id) || 0;
    const emit = () => onChange({ ...state });
    const bindText = (input, key) => {
      input.value = state[key] || "";
      input.addEventListener("input", () => {
        state[key] = input.value;
        emit();
      });
      return input;
    };
    const adminEmail = builderRoot.dataset.adminEmail || "";
    const fbAdminSubject = builderRoot.dataset.fallbackAdminSubject || "";
    const fbSubmit = builderRoot.dataset.fallbackSubmit || "";
    const fbSuccess = builderRoot.dataset.fallbackSuccess || "";
    const fbError = builderRoot.dataset.fallbackError || "";
    const fbValidation = builderRoot.dataset.fallbackValidation || "";
    const fbRequired = builderRoot.dataset.fallbackRequired || "";
    const notifications = el("div", {
      className: "bl-forms-builder__panel",
      dataset: { blFormsPanel: "notifications" },
      hidden: true
    });
    const recipientRows = (value) => Math.max(2, String(value || "").split(/\r?\n/).length);
    const recipient = bindText(
      el("textarea", {
        className: "widefat",
        rows: String(recipientRows(state.recipient)),
        placeholder: adminEmail
      }),
      "recipient"
    );
    const syncRecipientRows = () => {
      recipient.rows = recipientRows(recipient.value);
    };
    recipient.addEventListener("input", syncRecipientRows);
    recipient.addEventListener("change", syncRecipientRows);
    const adminSubject = bindText(
      el("input", {
        type: "text",
        className: "widefat",
        placeholder: fbAdminSubject
      }),
      "admin_email_subject"
    );
    const userOptions = el("div", { className: "bl-forms-builder__notify-user-options" });
    const sendToWrap = el("div", { className: "bl-forms-builder__setting bl-forms-builder__send-to" });
    const sendToControl = el("div", { className: "bl-forms-builder__send-to-control" });
    sendToWrap.append(
      el("label", {}, [el("strong", { text: t("emailField", "Email field") })]),
      sendToControl
    );
    const userSubject = bindText(el("input", { type: "text", className: "widefat" }), "user_email_subject");
    const userIntro = bindText(el("textarea", { className: "widefat", rows: "3" }), "user_email_intro");
    const userSubjectRow = fieldRow(t("subject", "Subject"), userSubject);
    const userIntroRow = fieldRow(
      t("introText", "Intro text"),
      userIntro,
      t(
        "introTextHelp",
        "This text appears above the submitted form data in the email. Placeholders can be used [field-id]."
      )
    );
    userOptions.append(sendToWrap, userSubjectRow, userIntroRow);
    const ensureSelectedEmailField = () => {
      const names = emailFields.map((field) => field.name);
      if (names.length === 0) {
        state.user_email_field = "";
        return;
      }
      if (!names.includes(state.user_email_field)) {
        state.user_email_field = names[0];
      }
    };
    const renderSendTo = () => {
      sendToControl.replaceChildren();
      ensureSelectedEmailField();
      if (emailFields.length === 0) {
        sendToControl.appendChild(
          el("div", {
            className: "bl-forms-builder__notice bl-forms-builder__notice--warning",
            role: "status",
            text: t("notifyUserHelp", "Requires an Email field on the form.")
          })
        );
        return;
      }
      if (emailFields.length === 1) {
        const only = emailFields[0];
        state.user_email_field = only.name;
        sendToControl.appendChild(
          el("span", {
            className: "bl-forms-builder__send-to-value",
            text: emailFieldLabel(only)
          })
        );
        return;
      }
      const select = el("select", { className: "widefat" });
      emailFields.forEach((field) => {
        const opt = document.createElement("option");
        opt.value = field.name;
        opt.textContent = emailFieldLabel(field);
        if (field.name === state.user_email_field) {
          opt.selected = true;
        }
        select.appendChild(opt);
      });
      select.addEventListener("change", () => {
        state.user_email_field = select.value;
        emit();
      });
      sendToControl.appendChild(select);
    };
    const notifySwitch = plainSwitch(t("notifyUser", "Enable"), {
      checked: !!state.notify_user,
      onChange: (checked) => {
        state.notify_user = checked;
        syncNotifyOptions();
        emit();
      }
    });
    const notify = notifySwitch.input;
    const syncNotifyOptions = () => {
      userOptions.hidden = !notify.checked;
      if (notify.checked) {
        renderSendTo();
      }
    };
    notifications.append(
      fieldRow(
        t("recipient", "Recipient"),
        recipient,
        t(
          "recipientHelp",
          "One email per line. Leave empty to use the site administrator email."
        )
      ),
      fieldRow(t("subject", "Subject"), adminSubject),
      el("hr", { className: "bl-forms-builder__separator" }),
      el("div", { className: "bl-forms-builder__section" }, [
        el("h3", {
          className: "bl-forms-builder__section-title",
          text: t("confirmationEmail", "Confirmation email")
        }),
        notifySwitch.root,
        userOptions
      ])
    );
    syncNotifyOptions();
    const settingsPanel = el("div", {
      className: "bl-forms-builder__panel",
      dataset: { blFormsPanel: "settings" },
      hidden: true
    });
    const submitLabel = bindText(
      el("input", { type: "text", className: "widefat", placeholder: fbSubmit }),
      "submit_label"
    );
    const success = bindText(
      el("textarea", { className: "widefat", rows: "2", placeholder: fbSuccess }),
      "success_message"
    );
    const error = bindText(
      el("textarea", { className: "widefat", rows: "2", placeholder: fbError }),
      "error_message"
    );
    const validation = bindText(
      el("textarea", { className: "widefat", rows: "2", placeholder: fbValidation }),
      "validation_message"
    );
    const requiredMsg = bindText(
      el("input", { type: "text", className: "widefat", placeholder: fbRequired }),
      "required_message"
    );
    const msgFallbacks = window.blFormsAdmin && window.blFormsAdmin.messageFallbacks || {};
    const charCountText = bindText(
      el("input", {
        type: "text",
        className: "widefat",
        placeholder: msgFallbacks.char_count || t("charCountTextDefault", "%remaining% characters remaining")
      }),
      "char_count_text"
    );
    const charCountEmptyText = bindText(
      el("input", {
        type: "text",
        className: "widefat",
        placeholder: msgFallbacks.char_count_empty || t("charCountEmptyDefault", "No characters remaining")
      }),
      "char_count_empty_text"
    );
    const bindErrorMsg = (key, fallbackKey) => bindText(
      el("input", {
        type: "text",
        className: "widefat",
        placeholder: msgFallbacks[fallbackKey] || ""
      }),
      key
    );
    const numberMsg = bindErrorMsg("number_message", "number");
    const minMsg = bindErrorMsg("min_message", "min");
    const maxMsg = bindErrorMsg("max_message", "max");
    const emailMsg = bindErrorMsg("email_message", "email");
    const urlMsg = bindErrorMsg("url_message", "url");
    const phoneMsg = bindErrorMsg("phone_message", "phone");
    const dateMsg = bindErrorMsg("date_message", "date");
    const dateMinMsg = bindErrorMsg("date_min_message", "date_min");
    const dateMaxMsg = bindErrorMsg("date_max_message", "date_max");
    const dateBeforeMsg = bindErrorMsg("date_before_message", "date_before");
    const dateAfterMsg = bindErrorMsg("date_after_message", "date_after");
    const timeMsg = bindErrorMsg("time_message", "time");
    const timeMinMsg = bindErrorMsg("time_min_message", "time_min");
    const timeMaxMsg = bindErrorMsg("time_max_message", "time_max");
    const datetimeMsg = bindErrorMsg("datetime_message", "datetime");
    const datetimeMinMsg = bindErrorMsg("datetime_min_message", "datetime_min");
    const datetimeMaxMsg = bindErrorMsg("datetime_max_message", "datetime_max");
    const fileMsg = bindErrorMsg("file_message", "file");
    const fileTypeMsg = bindErrorMsg("file_type_message", "file_type");
    const fileSizeMsg = bindErrorMsg("file_size_message", "file_size");
    const fileMaxMsg = bindErrorMsg("file_max_message", "file_max");
    const optionMsg = bindErrorMsg("option_message", "option");
    const rangeHelp = () => el("span", {
      className: "description bl-forms-builder__field-errors-help",
      text: t("minMaxMessageHelp", "The placeholder %s is replaced by the limit.")
    });
    const successRow = fieldRow(t("successMessage", "Success message"), success);
    const successPanel = el("div", {
      className: "bl-forms-builder__after-submit-message",
      hidden: state.after_submit === "redirect"
    }, [successRow]);
    const wpMaxUploadLabel = window.blFormsAdmin && window.blFormsAdmin.wpMaxUploadSize || "";
    const uploadMaxSize = el("input", {
      type: "number",
      className: "small-text bl-forms-builder__security-input",
      min: "0.1",
      step: "0.1",
      value: state.upload_max_size_mb != null && state.upload_max_size_mb !== "" ? String(state.upload_max_size_mb) : ""
    });
    uploadMaxSize.addEventListener("input", () => {
      state.upload_max_size_mb = uploadMaxSize.value.trim();
      emit();
    });
    uploadMaxSize.addEventListener("change", () => {
      state.upload_max_size_mb = uploadMaxSize.value.trim();
      emit();
    });
    const uploadMaxSizeRow = el("div", { className: "bl-forms-builder__security-inline" }, [
      uploadMaxSize,
      el("span", { text: t("uploadMaxSizeUnit", "MB") })
    ]);
    const fileSettingsBlock = el("div", { className: "bl-forms-builder__field-errors" }, [
      el("h3", {
        className: "bl-forms-builder__section-title",
        text: t("fileSettings", "File settings")
      }),
      el("div", { className: "bl-forms-builder__field-errors-box" }, [
        fieldRow(
          t("uploadMaxSize", "Maximum file size"),
          uploadMaxSizeRow,
          wpMaxUploadLabel ? t(
            "uploadMaxSizeHelp",
            "Leave empty to use the server limit (%s)."
          ).replace("%s", wpMaxUploadLabel) : t(
            "uploadMaxSizeHelpEmpty",
            "Leave empty to use the server limit."
          )
        )
      ])
    ]);
    const afterOptions = el("div", { className: "bl-forms-builder__after-submit" });
    const afterSelect = el("select", {
      className: "widefat",
      "aria-label": t("afterSubmit", "After submission")
    });
    [
      { id: "message", label: t("afterSubmitMessage", "Show success message") },
      { id: "redirect", label: t("afterSubmitRedirect", "Go to page") }
    ].forEach((mode) => {
      const option2 = el("option", { value: mode.id, text: mode.label });
      if (state.after_submit === mode.id) {
        option2.selected = true;
      }
      afterSelect.appendChild(option2);
    });
    const redirectPanel = el("div", {
      className: "bl-forms-builder__after-submit-redirect",
      hidden: state.after_submit !== "redirect"
    });
    const redirectSummary = el("div", { className: "bl-forms-builder__page-picker-summary" });
    const redirectPickBtn = el("button", {
      type: "button",
      className: "button -small",
      text: t("choosePage", "Choose page")
    });
    const redirectClearBtn = el("button", {
      type: "button",
      className: "button-link",
      text: t("clearPage", "Clear"),
      hidden: !state.redirect_page_id
    });
    const redirectActions = el("div", { className: "bl-forms-builder__page-picker-actions" }, [
      redirectPickBtn,
      redirectClearBtn
    ]);
    const redirectRow = el("div", { className: "bl-forms-builder__page-picker-row" }, [
      redirectSummary,
      redirectActions
    ]);
    const syncAfterSubmitUi = () => {
      const isRedirect = state.after_submit === "redirect";
      redirectPanel.hidden = !isRedirect;
      successPanel.hidden = isRedirect;
      afterSelect.value = state.after_submit === "redirect" ? "redirect" : "message";
      redirectSummary.replaceChildren();
      if (state.redirect_page_id) {
        const title = state.redirect_page_title || t("selectedPage", "Selected page") + " #" + state.redirect_page_id;
        redirectSummary.appendChild(
          el("span", {
            className: "bl-forms-builder__page-picker-value",
            text: title
          })
        );
        if (state.redirect_page_url) {
          redirectSummary.appendChild(
            el("span", {
              className: "description bl-forms-builder__page-picker-url",
              text: state.redirect_page_url,
              title: state.redirect_page_url
            })
          );
        }
      } else {
        redirectSummary.appendChild(
          el("span", {
            className: "description",
            text: t("choosePageHelp", "Select the page visitors should land on.")
          })
        );
      }
      redirectClearBtn.hidden = !state.redirect_page_id;
      redirectPickBtn.textContent = state.redirect_page_id ? t("changePage", "Change page") : t("choosePage", "Choose page");
    };
    afterSelect.addEventListener("change", () => {
      state.after_submit = afterSelect.value === "redirect" ? "redirect" : "message";
      syncAfterSubmitUi();
      emit();
    });
    redirectPickBtn.addEventListener("click", async () => {
      const cfg = window.blFormsAdmin || {};
      const page = await openPagePicker({
        selectedId: state.redirect_page_id || 0,
        title: t("pagePickerTitle", "Select a page"),
        searchPlaceholder: t("pagePickerSearch", "Search pages\u2026"),
        empty: t("pagePickerEmpty", "No pages found."),
        loading: t("pagePickerLoading", "Loading\u2026"),
        cancelLabel: t("cancel", "Cancel"),
        selectLabel: t("selectPage", "Select"),
        restUrl: cfg.pagesRestUrl || "",
        restNonce: cfg.restNonce || ""
      });
      if (!page) {
        return;
      }
      state.redirect_page_id = page.id;
      state.redirect_page_title = page.title;
      state.redirect_page_url = page.url;
      syncAfterSubmitUi();
      emit();
    });
    redirectClearBtn.addEventListener("click", () => {
      state.redirect_page_id = 0;
      state.redirect_page_title = "";
      state.redirect_page_url = "";
      syncAfterSubmitUi();
      emit();
    });
    redirectPanel.append(redirectRow);
    afterOptions.append(
      fieldRow(t("afterSubmit", "After submission"), afterSelect),
      redirectPanel
    );
    const boot = window.blFormsAdmin || {};
    if (state.redirect_page_id && boot.redirectPage && Number(boot.redirectPage.id) === state.redirect_page_id) {
      state.redirect_page_title = boot.redirectPage.title || "";
      state.redirect_page_url = boot.redirectPage.url || "";
    }
    syncAfterSubmitUi();
    settingsPanel.append(
      fieldRow(t("submitLabel", "Submit button label"), submitLabel),
      afterOptions,
      successPanel,
      fieldRow(t("errorMessage", "Error message"), error),
      fieldRow(t("validationMessage", "Validation message"), validation),
      fileSettingsBlock
    );
    const validationPanel = el("div", {
      className: "bl-forms-builder__panel",
      dataset: { blFormsPanel: "validation" },
      hidden: true
    });
    validationPanel.append(
      errorSection(t("requiredError", "Required"), [requiredMsg]),
      errorSection(t("charCountSection", "Character count"), [
        fieldRow(
          t("charCountText", "Character count text"),
          charCountText,
          t("charCountTextHelp", "The placeholders %remaining%, %count%, and %max% are replaced by the remaining count, current count, and maximum.")
        ),
        fieldRow(t("charCountEmptyText", "When limit is reached"), charCountEmptyText)
      ]),
      errorSection(t("numberError", "Number"), [
        fieldRow(t("invalidError", "Invalid"), numberMsg),
        fieldRow(t("minError", "Minimum"), minMsg),
        fieldRow(t("maxError", "Maximum"), maxMsg),
        rangeHelp()
      ]),
      errorSection(t("emailError", "Email"), [emailMsg]),
      errorSection(t("urlError", "URL"), [urlMsg]),
      errorSection(t("phoneError", "Phone"), [phoneMsg]),
      errorSection(t("dateError", "Date"), [
        fieldRow(t("invalidError", "Invalid"), dateMsg),
        fieldRow(t("minError", "Minimum"), dateMinMsg),
        fieldRow(t("maxError", "Maximum"), dateMaxMsg),
        rangeHelp(),
        fieldRow(t("dateBeforeError", "Before related field"), dateBeforeMsg),
        fieldRow(t("dateAfterError", "After related field"), dateAfterMsg),
        el("span", {
          className: "description bl-forms-builder__field-errors-help",
          text: t(
            "dateRelationMessageHelp",
            "The placeholder %s is replaced by the related field label."
          )
        })
      ]),
      errorSection(t("timeError", "Time"), [
        fieldRow(t("invalidError", "Invalid"), timeMsg),
        fieldRow(t("minError", "Minimum"), timeMinMsg),
        fieldRow(t("maxError", "Maximum"), timeMaxMsg),
        rangeHelp()
      ]),
      errorSection(t("datetimeError", "Date & time"), [
        fieldRow(t("invalidError", "Invalid"), datetimeMsg),
        fieldRow(t("minError", "Minimum"), datetimeMinMsg),
        fieldRow(t("maxError", "Maximum"), datetimeMaxMsg),
        rangeHelp()
      ]),
      errorSection(t("fileError", "File"), [
        fieldRow(t("invalidError", "Invalid"), fileMsg),
        fieldRow(
          t("fileTypeError", "Wrong file type"),
          fileTypeMsg,
          t("fileTypeErrorHelp", "The placeholder %s is replaced by the allowed file types.")
        ),
        fieldRow(
          t("fileSizeError", "File too large"),
          fileSizeMsg,
          t("fileSizeErrorHelp", "The placeholder %s is replaced by the maximum size.")
        ),
        fieldRow(
          t("fileMaxError", "Too many files"),
          fileMaxMsg,
          t("fileMaxErrorHelp", "The placeholder %s is replaced by the maximum number of files.")
        )
      ]),
      errorSection(t("optionError", "Choice"), [optionMsg])
    );
    const securityPanel = el("div", {
      className: "bl-forms-builder__panel",
      dataset: { blFormsPanel: "security" },
      hidden: true
    });
    const minFillSeconds = el("input", {
      type: "number",
      className: "small-text bl-forms-builder__security-input",
      min: "1",
      max: "300",
      step: "1",
      value: String(state.min_fill_time || 2)
    });
    const minFillOptions = el("div", {
      className: "bl-forms-builder__security-controls",
      hidden: !state.min_fill_time_enabled
    }, [
      el("div", { className: "bl-forms-builder__security-inline" }, [
        el("span", { text: t("securityMinFillTimeAtLeast", "At least") }),
        minFillSeconds,
        el("span", { text: t("securityMinFillTimeSeconds", "seconds") })
      ])
    ]);
    const rateMax = el("input", {
      type: "number",
      className: "small-text bl-forms-builder__security-input",
      min: "1",
      max: "100",
      step: "1",
      value: String(state.rate_limit_max || 3)
    });
    const rateWindow = el("input", {
      type: "number",
      className: "small-text bl-forms-builder__security-input",
      min: "1",
      max: "1440",
      step: "1",
      value: String(state.rate_limit_window || 5)
    });
    const rateOptions = el("div", {
      className: "bl-forms-builder__security-controls",
      hidden: !state.rate_limit_enabled
    }, [
      el("div", { className: "bl-forms-builder__security-inline" }, [
        el("span", { text: t("securityRateLimitMax", "Max") }),
        rateMax,
        el("span", { text: t("securityRateLimitIn", "submissions in") }),
        rateWindow,
        el("span", { text: t("securityRateLimitMinutes", "minutes") })
      ])
    ]);
    const minFillSwitch = securitySwitch(
      t("securityMinFillTime", "Minimum fill time"),
      "recommended",
      {
        checked: !!state.min_fill_time_enabled,
        onChange: (checked) => {
          state.min_fill_time_enabled = checked;
          minFillOptions.hidden = !checked;
          emit();
        }
      }
    );
    const rateSwitch = securitySwitch(
      t("securityRateLimit", "Submission limit"),
      "recommended",
      {
        checked: !!state.rate_limit_enabled,
        onChange: (checked) => {
          state.rate_limit_enabled = checked;
          rateOptions.hidden = !checked;
          emit();
        }
      }
    );
    minFillSeconds.addEventListener("input", () => {
      const n = parseInt(minFillSeconds.value, 10);
      state.min_fill_time = Number.isFinite(n) && n > 0 ? n : 2;
      emit();
    });
    rateMax.addEventListener("input", () => {
      const n = parseInt(rateMax.value, 10);
      state.rate_limit_max = Number.isFinite(n) && n > 0 ? n : 3;
      emit();
    });
    rateWindow.addEventListener("input", () => {
      const n = parseInt(rateWindow.value, 10);
      state.rate_limit_window = Number.isFinite(n) && n > 0 ? n : 5;
      emit();
    });
    securityPanel.append(
      lockedOption(
        t("securityCsrf", "CSRF protection"),
        t(
          "securityCsrfHelp",
          "A WordPress nonce is verified on every submission to block forged requests."
        )
      ),
      lockedOption(
        t("securityJsCheck", "JavaScript check"),
        t(
          "securityJsCheckHelp",
          "A hidden field is set by JavaScript. If the expected value is missing, the submission is discarded."
        )
      ),
      lockedOption(
        t("securityHoneypot", "Honeypot field"),
        t(
          "securityHoneypotHelp",
          "A field hidden from visitors detects simple bots. If it is filled, the submission is discarded."
        )
      ),
      securityOption(
        minFillSwitch.root,
        t(
          "securityMinFillTimeHelp",
          "Submissions are rejected when the form is sent unusually quickly."
        ),
        minFillOptions
      ),
      securityOption(
        rateSwitch.root,
        t(
          "securityRateLimitHelp",
          "Limits how often the same visitor can submit the form within a time period."
        ),
        rateOptions
      )
    );
    return {
      notifications,
      settings: settingsPanel,
      validation: validationPanel,
      security: securityPanel,
      getSettings: () => {
        const next = { ...state };
        delete next.redirect_page_title;
        delete next.redirect_page_url;
        return next;
      },
      syncFields(fields) {
        emailFields = emailFieldsFromList(fields);
        if (notify.checked) {
          const before = state.user_email_field || "";
          renderSendTo();
          if ((state.user_email_field || "") !== before) {
            emit();
          }
        } else {
          ensureSelectedEmailField();
        }
      }
    };
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/app.js
  function mountApp(root, initial) {
    root.replaceChildren();
    root.classList.add("bl-forms-builder", "bl-forms-builder--tabs");
    let settingsState = { ...initial.settings || {} };
    const syncAll = () => {
      const fields = canvas.getFields();
      panels.syncFields(fields);
      writeConfig({
        fields,
        settings: panels.getSettings()
      });
      canvas.syncEmpty();
    };
    const canvas = createCanvas({
      fields: initial.fields || [],
      onChange: syncAll
    });
    const palette = createPalette((type) => {
      canvas.addField(type, true);
    });
    const panels = createPanels(settingsState, root, (next) => {
      settingsState = next;
      syncAll();
    });
    const fieldsPanel = el("div", {
      className: "bl-forms-builder__panel is-active",
      dataset: { blFormsPanel: "fields" }
    });
    const fieldsLayout = el("div", { className: "bl-forms-builder__fields-layout" }, [
      palette,
      canvas.root
    ]);
    fieldsPanel.appendChild(fieldsLayout);
    const tabBar = el("nav", { className: "bl-forms-builder__tabs", role: "tablist" });
    const tabs = [
      { id: "fields", label: t("tabFields", "Fields"), panel: fieldsPanel },
      { id: "notifications", label: t("tabNotifications", "Notifications"), panel: panels.notifications },
      { id: "settings", label: t("tabSettings", "Settings"), panel: panels.settings },
      { id: "validation", label: t("tabValidation", "Validation"), panel: panels.validation },
      { id: "security", label: t("tabSecurity", "Security"), panel: panels.security }
    ];
    const activate = (id) => {
      tabs.forEach((tab) => {
        const active = tab.id === id;
        tab.button.classList.toggle("is-active", active);
        tab.button.setAttribute("aria-selected", active ? "true" : "false");
        tab.panel.hidden = !active;
        tab.panel.classList.toggle("is-active", active);
      });
    };
    tabs.forEach((tab, index2) => {
      tab.button = el("button", {
        type: "button",
        className: "bl-forms-builder__tab" + (index2 === 0 ? " is-active" : ""),
        role: "tab",
        text: tab.label,
        dataset: { blFormsTab: tab.id },
        onClick: () => activate(tab.id)
      });
      tab.button.setAttribute("aria-selected", index2 === 0 ? "true" : "false");
      tabBar.appendChild(tab.button);
    });
    const panelsWrap = el("div", { className: "bl-forms-builder__panels" }, [
      fieldsPanel,
      panels.notifications,
      panels.settings,
      panels.validation,
      panels.security
    ]);
    root.append(tabBar, panelsWrap);
    const form = root.closest("form");
    if (form) {
      form.addEventListener("submit", syncAll);
    }
    root.addEventListener("input", syncAll);
    root.addEventListener("change", syncAll);
    document.addEventListener("bl-forms-builder-changed", syncAll);
    syncAll();
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin.js
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-bl-forms-builder]");
    const input = document.getElementById("bl-forms-config-json");
    if (!root || !input) return;
    let initial = { fields: [], settings: {} };
    try {
      initial = JSON.parse(input.value || "{}") || initial;
    } catch (e) {
    }
    mountApp(root, initial);
  });
})();
/*! Bundled license information:

sortablejs/modular/sortable.esm.js:
  (**!
   * Sortable 1.15.7
   * @author	RubaXa   <trash@rubaxa.org>
   * @author	owenm    <owen23355@gmail.com>
   * @license MIT
   *)
*/
//# sourceMappingURL=forms-admin.js.map
