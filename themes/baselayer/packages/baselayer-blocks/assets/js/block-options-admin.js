(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // themes/baselayer/src/js/editor/icons/icons.generated.js
  var themeIconCategory;
  var init_icons_generated = __esm({
    "themes/baselayer/src/js/editor/icons/icons.generated.js"() {
      themeIconCategory = {
        slug: "theme",
        label: "Theme",
        icons: [
          { filename: "theme-logo", label: "Logo", keywords: ["brand", "marke", "signet"], alternatives: [] }
        ]
      };
    }
  });

  // themes/baselayer/src/js/editor/icons/icon-catalog.js
  var builtInCategories, iconL10n, runtimeThemeCategory, resolvedThemeCategory, iconCategories, allIcons, hasVariant, resolveIconName, iconMatchesQuery, findIconByValue;
  var init_icon_catalog = __esm({
    "themes/baselayer/src/js/editor/icons/icon-catalog.js"() {
      init_icons_generated();
      builtInCategories = [
        {
          slug: "navigation",
          icons: [
            { filename: "home", alternatives: ["fill"], keywords: ["house", "main", "start"] },
            { filename: "menu", alternatives: [], keywords: ["hamburger", "navigation", "lines"] },
            { filename: "more", alternatives: [], keywords: ["ellipsis", "options", "dots", "horizontal"] },
            { filename: "more-vertical", alternatives: [], keywords: ["ellipsis", "options", "kebab", "dots"] },
            { filename: "arrow-left-alt", alternatives: [], keywords: ["back", "previous", "left", "alt"] },
            { filename: "arrow-right-alt", alternatives: [], keywords: ["next", "forward", "right", "alt"] },
            { filename: "arrow-up-alt", alternatives: [], keywords: ["up", "upward", "alt"] },
            { filename: "arrow-down-alt", alternatives: [], keywords: ["down", "arrow", "downward", "alt", "scroll"] },
            { filename: "arrow-left", alternatives: [], keywords: ["back", "previous", "left"] },
            { filename: "arrow-right", alternatives: [], keywords: ["next", "forward", "right"] },
            { filename: "arrow-up", alternatives: [], keywords: ["up", "upward", "top", "north"] },
            { filename: "arrow-down", alternatives: [], keywords: ["down", "downward", "bottom", "south"] },
            { filename: "arrow-line-start", alternatives: [], keywords: ["start", "line", "arrow", "first"] },
            { filename: "arrow-line-end", alternatives: [], keywords: ["end", "line", "arrow", "last"] },
            { filename: "line-start-arrow", alternatives: [], keywords: ["line", "start", "arrow", "first", "direction"] },
            { filename: "line-end-arrow", alternatives: [], keywords: ["line", "end", "arrow", "last", "direction"] },
            { filename: "chevron-left-large", alternatives: [], keywords: ["back", "previous", "left", "big", "bold"] },
            { filename: "chevron-right-large", alternatives: [], keywords: ["next", "forward", "right", "big", "bold"] },
            { filename: "chevron-left", alternatives: [], keywords: ["back", "previous", "left"] },
            { filename: "chevron-right", alternatives: [], keywords: ["next", "forward", "right"] },
            { filename: "chevron-up", alternatives: [], keywords: ["up", "collapse", "less"] },
            { filename: "chevron-down", alternatives: [], keywords: ["down", "expand", "dropdown", "more"] },
            { filename: "first-page", alternatives: [], keywords: ["first", "page", "start", "beginning", "pagination"] },
            { filename: "last-page", alternatives: [], keywords: ["last", "page", "end", "pagination"] },
            { filename: "drop-left", alternatives: [], keywords: ["caret", "left", "collapse"] },
            { filename: "drop-right", alternatives: [], keywords: ["caret", "right", "expand"] },
            { filename: "drop-up", alternatives: [], keywords: ["caret", "up", "collapse"] },
            { filename: "drop-down", alternatives: [], keywords: ["caret", "down", "dropdown"] },
            { filename: "switch-left", alternatives: [], keywords: ["switch", "left", "arrow", "direction", "toggle"] },
            { filename: "switch-right", alternatives: [], keywords: ["switch", "right", "arrow", "direction", "toggle"] },
            { filename: "subdirectory-arrow", alternatives: [], keywords: ["return", "nested", "enter", "branch"] },
            { filename: "arrow-up-down", alternatives: [], keywords: ["line", "height", "leading", "vertical", "spacing", "arrow"] },
            { filename: "arrow-range", alternatives: [], keywords: ["range", "width", "distance", "measure", "horizontal", "span"] },
            { filename: "arrows-outward", alternatives: [], keywords: ["arrows", "outward", "external", "expand", "diagonal"] },
            { filename: "arrow-split", alternatives: [], keywords: ["split", "fork", "branch", "arrow", "direction"] },
            { filename: "arrow-split-up", alternatives: [], keywords: ["split", "fork", "branch", "arrow", "up", "direction"] },
            { filename: "compare", alternatives: [], keywords: ["versus", "difference", "split"] },
            { filename: "swap-horizontal", alternatives: [], keywords: ["exchange", "switch", "transfer", "arrows"] },
            { filename: "swap-vertical", alternatives: [], keywords: ["exchange", "switch", "reorder", "arrows"] },
            { filename: "collapse", alternatives: [], keywords: ["minimize", "shrink", "close", "inward", "arrows"] },
            { filename: "expand-content", alternatives: [], keywords: ["unfold", "more", "enlarge", "open", "arrows"] },
            { filename: "collapse-content", alternatives: [], keywords: ["fold", "less", "hide", "minimize", "arrows"] },
            { filename: "arrow-up-right", alternatives: [], keywords: ["external", "outward", "diagonal", "northeast", "go to"] },
            { filename: "arrow-down-right", alternatives: [], keywords: ["arrow", "down", "downward", "direction"] },
            { filename: "open-in-new", alternatives: [], keywords: ["external", "link", "window", "tab"] },
            { filename: "open-in-new-down", alternatives: [], keywords: ["external", "link", "open", "download", "down"] },
            { filename: "hide", alternatives: [], keywords: ["hide", "invisible", "concealed", "off"] },
            { filename: "pan-zoom", alternatives: [], keywords: ["pan", "zoom", "move", "view", "map"] },
            { filename: "arrow-menu-close", alternatives: [], keywords: ["menu", "close", "sidebar", "drawer", "collapse"] },
            { filename: "arrow-menu-open", alternatives: [], keywords: ["menu", "open", "sidebar", "drawer", "expand"] },
            { filename: "grad-pan", alternatives: [], keywords: ["pan", "move", "map", "drag", "hand"] },
            { filename: "arrows-input", alternatives: [], keywords: ["arrows", "input", "import", "enter", "inward"] },
            { filename: "arrows-output", alternatives: [], keywords: ["arrows", "output", "export", "exit", "outward"] },
            { filename: "menu-open", alternatives: [], keywords: ["menu", "open", "hamburger", "sidebar", "navigation"] },
            { filename: "read-more", alternatives: [], keywords: ["read more", "menu", "list", "lines", "arrow", "continue"] },
            { filename: "step", alternatives: [], keywords: ["step", "stairs", "level", "progress", "stage"] },
            { filename: "shape-up", alternatives: ["fill"], keywords: ["up", "arrow", "shape", "shift", "arrow-up-thick"] },
            { filename: "shape-up-stack", alternatives: ["fill"], keywords: ["up", "arrow", "shape", "stack", "shift"] }
          ]
        },
        {
          slug: "actions",
          icons: [
            { filename: "add", alternatives: [], keywords: ["plus", "new", "create"] },
            { filename: "add-circle", alternatives: ["fill"], keywords: ["plus", "new", "create"] },
            { filename: "minus", alternatives: [], keywords: ["remove", "subtract", "less"] },
            { filename: "minus-circle", alternatives: ["fill"], keywords: ["remove", "subtract", "delete", "do not disturb"] },
            { filename: "checkmark", alternatives: [], keywords: ["check", "done", "ok", "tick", "confirm"] },
            { filename: "check-circle", alternatives: ["fill"], keywords: ["done", "ok", "success", "confirm"] },
            { filename: "close", alternatives: [], keywords: ["x", "cancel", "dismiss", "remove"] },
            { filename: "cancel", alternatives: ["fill"], keywords: ["close", "x", "dismiss", "stop"] },
            { filename: "block", alternatives: ["fill"], keywords: ["forbidden", "ban", "disable", "no"] },
            { filename: "search", alternatives: [], keywords: ["find", "magnifier", "lookup"] },
            { filename: "zoom-in", alternatives: [], keywords: ["magnify", "plus", "enlarge"] },
            { filename: "zoom-out", alternatives: [], keywords: ["magnify", "minus", "shrink"] },
            { filename: "delete", alternatives: ["fill"], keywords: ["trash", "remove", "bin"] },
            { filename: "delete-forever", alternatives: ["fill"], keywords: ["delete", "trash", "permanent", "remove forever"] },
            { filename: "restore", alternatives: ["fill"], keywords: ["restore", "recover", "undelete", "reset"] },
            { filename: "save", alternatives: ["fill"], keywords: ["disk", "store"] },
            { filename: "save-as", alternatives: ["fill"], keywords: ["save", "export", "copy", "duplicate", "document"] },
            { filename: "scanner", alternatives: ["fill"], keywords: ["scanner", "scan", "document", "copy", "device"] },
            { filename: "print", alternatives: ["fill"], keywords: ["printer"] },
            { filename: "upload", alternatives: [], keywords: ["import", "send", "arrow"] },
            { filename: "upload-alt", alternatives: ["fill"], keywords: ["import", "send", "arrow"] },
            { filename: "upgrade", alternatives: [], keywords: ["improve", "level up", "arrow"] },
            { filename: "download", alternatives: [], keywords: ["save", "export", "arrow"] },
            { filename: "download-alt", alternatives: ["fill"], keywords: ["save", "export", "arrow"] },
            { filename: "archive", alternatives: ["fill"], keywords: ["archive", "storage", "box", "save"] },
            { filename: "signature", alternatives: [], keywords: ["signature", "sign", "autograph", "handwriting"] },
            { filename: "crop", alternatives: [], keywords: ["trim", "resize", "image"] },
            { filename: "resize", alternatives: [], keywords: ["resize", "scale", "dimensions", "transform"] },
            { filename: "select", alternatives: [], keywords: ["select", "selection", "cursor", "pointer", "area"] },
            { filename: "select-all", alternatives: [], keywords: ["select all", "selection", "full", "entire", "area"] },
            { filename: "refresh", alternatives: [], keywords: ["reload", "update", "renew"] },
            { filename: "sync", alternatives: [], keywords: ["refresh", "update", "reload", "arrows"] },
            { filename: "undo", alternatives: [], keywords: ["back", "revert", "arrow"] },
            { filename: "redo", alternatives: [], keywords: ["forward", "repeat", "arrow"] },
            { filename: "fullscreen", alternatives: [], keywords: ["enlarge", "maximize", "expand"] },
            { filename: "fullscreen-exit", alternatives: [], keywords: ["minimize", "shrink", "collapse"] },
            { filename: "zoom-in-map", alternatives: [], keywords: ["zoom", "map", "enlarge", "magnify"] },
            { filename: "zoom-out-map", alternatives: [], keywords: ["zoom", "map", "shrink", "overview"] },
            { filename: "drag", alternatives: [], keywords: ["move", "reorder", "handle", "grab"] },
            { filename: "drag-handle", alternatives: [], keywords: ["move", "reorder", "handle", "grab"] },
            { filename: "mobile-rotate", alternatives: ["fill"], keywords: ["mobile", "rotate", "orientation", "phone"] },
            { filename: "button", alternatives: ["fill"], keywords: ["button", "cta", "click", "action", "ui"] },
            { filename: "button-group", alternatives: ["fill"], keywords: ["button", "group", "segmented", "toggle", "options", "ui"] },
            { filename: "pinch-zoom-in", alternatives: ["fill"], keywords: ["pinch", "zoom", "in", "magnify", "gesture"] },
            { filename: "pinch-zoom-out", alternatives: ["fill"], keywords: ["pinch", "zoom", "out", "shrink", "gesture"] },
            { filename: "swipe-left-right", alternatives: ["fill"], keywords: ["swipe", "gesture", "horizontal", "touch"] },
            { filename: "swipe-up-down", alternatives: ["fill"], keywords: ["swipe", "gesture", "vertical", "touch"] },
            { filename: "touch", alternatives: ["fill"], keywords: ["tap", "finger", "gesture"] },
            { filename: "click-circles", alternatives: [], keywords: ["tap", "cursor", "select"] },
            { filename: "click", alternatives: [], keywords: ["click", "cursor", "action", "mouse"] },
            { filename: "click-left", alternatives: [], keywords: ["click", "left", "mouse", "button"] },
            { filename: "click-right", alternatives: [], keywords: ["click", "right", "mouse", "button"] },
            { filename: "pin", alternatives: ["fill"], keywords: ["pin", "location", "marker", "place"] },
            { filename: "pin-off", alternatives: ["fill"], keywords: ["pin", "remove", "unpin", "location"] },
            { filename: "compress", alternatives: [], keywords: ["compress", "shrink", "minimize", "collapse"] },
            { filename: "expand", alternatives: [], keywords: ["expand", "enlarge", "maximize", "height", "fit"] }
          ]
        },
        {
          slug: "editing",
          icons: [
            { filename: "edit", alternatives: ["fill"], keywords: ["pencil", "pen", "modify", "change"] },
            { filename: "edit-off", alternatives: ["fill"], keywords: ["edit", "off", "disabled", "pencil", "no edit"] },
            { filename: "edit-square", alternatives: ["fill"], keywords: ["edit", "pencil", "square", "modify"] },
            { filename: "edit-text", alternatives: ["fill"], keywords: ["pencil", "write", "modify"] },
            { filename: "edit-document", alternatives: ["fill"], keywords: ["pencil", "write", "file"] },
            { filename: "document", alternatives: ["fill"], keywords: ["file", "page", "paper"] },
            { filename: "document-text", alternatives: ["fill"], keywords: ["file", "page", "text"] },
            { filename: "document-person", alternatives: ["fill"], keywords: ["file", "person", "profile", "resume", "cv"] },
            { filename: "document-scan", alternatives: ["fill"], keywords: ["scan", "document", "ocr", "capture"] },
            { filename: "text-snippet", alternatives: ["fill"], keywords: ["text", "snippet", "excerpt", "quote", "block"] },
            { filename: "article", alternatives: ["fill"], keywords: ["post", "document", "news", "text"] },
            { filename: "compare-text", alternatives: ["fill"], keywords: ["compare", "text", "diff", "versus"] },
            { filename: "news-article", alternatives: ["fill"], keywords: ["news", "article", "document", "post", "story"] },
            { filename: "note", alternatives: ["fill"], keywords: ["note", "memo", "document", "text", "sticky"] },
            { filename: "note-stack", alternatives: ["fill"], keywords: ["notes", "stack", "documents", "memo", "files"] },
            { filename: "palette", alternatives: ["fill"], keywords: ["color", "design", "art", "theme", "paint"] },
            { filename: "colorize", alternatives: ["fill"], keywords: ["color", "paint", "eyedropper", "design", "palette"] },
            { filename: "copy", alternatives: ["fill"], keywords: ["duplicate", "clipboard"] },
            { filename: "clipboard", alternatives: [], keywords: ["paste", "copy", "board"] },
            { filename: "content-cut", alternatives: [], keywords: ["cut", "scissors", "trim", "clip"] },
            { filename: "text", alternatives: [], keywords: ["text", "typography", "letter", "font", "content"] },
            { filename: "text-short", alternatives: [], keywords: ["text", "short", "collapse", "truncate"] },
            { filename: "list", alternatives: [], keywords: ["lines", "items", "menu"] },
            { filename: "list-alt", alternatives: [], keywords: ["lists", "toc", "index", "outline"] },
            { filename: "abc", alternatives: [], keywords: ["letters", "alphabet", "text", "characters", "spelling"] },
            { filename: "123", alternatives: [], keywords: ["numbers", "digits", "numeric", "count"] },
            { filename: "brand-family", alternatives: [], keywords: ["brand", "family", "google", "marketing", "logo"] },
            { filename: "symbols", alternatives: [], keywords: ["symbols", "special characters", "typography", "glyph"] },
            { filename: "symbol-sum", alternatives: [], keywords: ["sum", "sigma", "math", "symbol", "addition"] },
            { filename: "asterix", alternatives: [], keywords: ["asterisk", "star", "wildcard", "required", "symbol"] },
            { filename: "language", alternatives: [], keywords: ["globe", "locale", "translate", "international"] },
            { filename: "translate", alternatives: [], keywords: ["language", "localize", "translation"] },
            { filename: "code", alternatives: [], keywords: ["code", "developer", "markup"] },
            { filename: "code-slash", alternatives: [], keywords: ["code", "developer", "slash", "programming"] },
            { filename: "book", alternatives: ["fill"], keywords: ["read", "library", "publication"] },
            { filename: "book-open", alternatives: ["fill"], keywords: ["read", "open", "library", "publication"] },
            { filename: "fact-check", alternatives: ["fill"], keywords: ["fact", "check", "verify", "review", "checklist", "approved", "document"] }
          ]
        },
        {
          slug: "rich-text",
          icons: [
            { filename: "wysiwyg", alternatives: [], keywords: ["wysiwyg", "rich text", "editor", "format", "tinymce"] },
            { filename: "text-format", alternatives: [], keywords: ["text", "format", "typography", "font"] },
            { filename: "bold", alternatives: [], keywords: ["bold", "strong", "weight", "typography"] },
            { filename: "italic", alternatives: [], keywords: ["italic", "emphasis", "slant", "typography"] },
            { filename: "underlined", alternatives: [], keywords: ["underline", "typography", "text"] },
            { filename: "strikethrough", alternatives: ["fill"], keywords: ["strikethrough", "strike", "cross out", "typography"] },
            { filename: "text-decrease", alternatives: [], keywords: ["text", "decrease", "smaller", "font", "size"] },
            { filename: "text-increase", alternatives: [], keywords: ["text", "increase", "larger", "font", "size"] },
            { filename: "align-left", alternatives: [], keywords: ["align", "left", "text", "paragraph"] },
            { filename: "align-center", alternatives: [], keywords: ["align", "center", "text", "paragraph"] },
            { filename: "align-right", alternatives: [], keywords: ["align", "right", "text", "paragraph"] },
            { filename: "align-justify", alternatives: [], keywords: ["align", "justify", "text", "paragraph"] },
            { filename: "align-horizontal-left", alternatives: [], keywords: ["align", "horizontal", "left", "distribute"] },
            { filename: "align-horizontal-center", alternatives: [], keywords: ["align", "horizontal", "center", "distribute"] },
            { filename: "align-horizontal-right", alternatives: [], keywords: ["align", "horizontal", "right", "distribute"] },
            { filename: "horizontal-align-left", alternatives: [], keywords: ["align", "horizontal", "left"] },
            { filename: "horizontal-align-right", alternatives: [], keywords: ["align", "horizontal", "right"] },
            { filename: "vertical-align-top", alternatives: [], keywords: ["align", "vertical", "top", "up"] },
            { filename: "vertical-align-bottom", alternatives: [], keywords: ["align", "vertical", "bottom", "down"] },
            { filename: "horizontal-align-center", alternatives: [], keywords: ["align", "horizontal", "center", "middle"] },
            { filename: "vertical-align-center", alternatives: [], keywords: ["align", "vertical", "center", "middle"] },
            { filename: "list-bulleted", alternatives: [], keywords: ["list", "bulleted", "unordered", "ul", "list-bullet"] },
            { filename: "list-numbered", alternatives: [], keywords: ["list", "numbered", "ordered", "ol", "list-number"] },
            { filename: "list-numbered-rtl", alternatives: [], keywords: ["list", "numbered", "ordered", "ol", "rtl", "right-to-left"] },
            { filename: "checklist", alternatives: [], keywords: ["checklist", "todo", "tasks", "list"] },
            { filename: "checklist-rtl", alternatives: [], keywords: ["checklist", "todo", "rtl", "right-to-left", "tasks"] },
            { filename: "horizontal-rule", alternatives: [], keywords: ["horizontal", "rule", "divider", "separator", "line", "hr"] },
            { filename: "special-character", alternatives: [], keywords: ["special character", "symbol", "typography", "glyph", "insert"] },
            { filename: "indent-decrease", alternatives: [], keywords: ["indent", "decrease", "outdent", "margin"] },
            { filename: "indent-increase", alternatives: [], keywords: ["indent", "increase", "margin"] },
            { filename: "line-spacing", alternatives: [], keywords: ["line", "spacing", "leading", "paragraph"] },
            { filename: "letter-spacing", alternatives: ["fill"], keywords: ["letter", "spacing", "tracking", "typography"] },
            { filename: "colors", alternatives: [], keywords: ["colors", "palette", "swatches", "design"] },
            { filename: "color-fill", alternatives: [], keywords: ["highlight", "fill", "background", "color"] },
            { filename: "paintbrush", alternatives: ["fill"], keywords: ["paint", "brush", "draw", "color", "style"] },
            { filename: "paintbrush-off", alternatives: ["fill"], keywords: ["paint", "brush", "clear", "remove", "style"] },
            { filename: "color-text", alternatives: [], keywords: ["text", "color", "font", "typography"] },
            { filename: "border-color", alternatives: ["fill"], keywords: ["border", "color", "outline", "pen", "edit"] },
            { filename: "color-reset", alternatives: ["fill"], keywords: ["reset", "clear", "color", "formatting"] },
            { filename: "format-clear", alternatives: [], keywords: ["clear", "format", "remove", "formatting", "style"] },
            { filename: "link", alternatives: [], keywords: ["url", "chain", "hyperlink", "anchor"] },
            { filename: "link-off", alternatives: [], keywords: ["unlink", "broken", "remove", "hyperlink"] },
            { filename: "format-size", alternatives: ["fill"], keywords: ["font", "size", "text", "typography"] },
            { filename: "titlecase", alternatives: [], keywords: ["title case", "capitalization", "text", "typography", "format"] },
            { filename: "image-left", alternatives: ["fill"], keywords: ["image", "left", "align", "position"] },
            { filename: "image-center", alternatives: ["fill"], keywords: ["image", "center", "align", "position"] },
            { filename: "image-right", alternatives: ["fill"], keywords: ["image", "right", "align", "position"] },
            { filename: "image-left-text", alternatives: ["fill"], keywords: ["align", "wrap", "float", "text", "image", "left"] },
            { filename: "image-right-text", alternatives: ["fill"], keywords: ["align", "wrap", "float", "text", "image", "right"] },
            { filename: "image-center-text", alternatives: ["fill"], keywords: ["align", "inline", "image", "text", "wrap", "center"] },
            { filename: "paragraph", alternatives: [], keywords: ["text", "block", "typography", "content"] },
            { filename: "quote", alternatives: ["fill"], keywords: ["blockquote", "citation", "testimonial"] },
            { filename: "code-block", alternatives: ["fill"], keywords: ["code", "block", "snippet", "gutenberg"] },
            { filename: "slab-serif", alternatives: ["fill"], keywords: ["slab", "serif", "font", "typography", "text"] },
            { filename: "highlight", alternatives: ["fill"], keywords: ["highlight", "marker", "mark", "text", "color"] },
            { filename: "clear-all", alternatives: [], keywords: ["clear", "reset", "formatting", "remove"] }
          ]
        },
        {
          slug: "communication",
          icons: [
            { filename: "mail", alternatives: ["fill"], keywords: ["envelope", "message", "email", "contact"] },
            { filename: "email-open", alternatives: ["fill"], keywords: ["envelope", "read", "message"] },
            { filename: "email-stacked", alternatives: ["fill"], keywords: ["email", "stacked", "messages", "mail", "inbox"] },
            { filename: "email-unread", alternatives: ["fill"], keywords: ["email", "unread", "mail", "message", "badge"] },
            { filename: "inbox", alternatives: ["fill"], keywords: ["inbox", "mail", "email", "messages"] },
            { filename: "inbox-text", alternatives: ["fill"], keywords: ["inbox", "mail", "text", "messages"] },
            { filename: "chat", alternatives: ["fill"], keywords: ["message", "bubble", "comment", "talk"] },
            { filename: "chat-dashed", alternatives: [], keywords: ["chat", "message", "bubble", "dashed"] },
            { filename: "chat-dots", alternatives: ["fill"], keywords: ["message", "typing", "bubble"] },
            { filename: "chat-text", alternatives: ["fill"], keywords: ["message", "comment", "bubble"] },
            { filename: "chat-edit", alternatives: ["fill"], keywords: ["chat", "edit", "review", "feedback", "comment", "rate", "message"] },
            { filename: "forum", alternatives: ["fill"], keywords: ["discussion", "comments", "community", "chat"] },
            { filename: "send", alternatives: ["fill"], keywords: ["paper plane", "submit", "message"] },
            { filename: "phone", alternatives: ["fill"], keywords: ["call", "contact", "telephone"] },
            { filename: "headset", alternatives: ["fill"], keywords: ["headset", "audio", "call", "support"] },
            { filename: "mic", alternatives: ["fill"], keywords: ["microphone", "audio", "record", "voice", "speak"] },
            { filename: "mic-off", alternatives: ["fill"], keywords: ["microphone", "off", "mute", "audio", "disabled"] },
            { filename: "voicemail", alternatives: [], keywords: ["voicemail", "phone", "message", "audio"] },
            { filename: "attachment", alternatives: [], keywords: ["paperclip", "attach", "file"] },
            { filename: "attachment-alt", alternatives: [], keywords: ["attachment", "paperclip", "attach", "file", "alt"] },
            { filename: "at-character", alternatives: [], keywords: ["envelope", "message", "contact"] },
            { filename: "wifi", alternatives: [], keywords: ["wifi", "wireless", "network", "internet"] },
            { filename: "wifi-off", alternatives: [], keywords: ["wifi", "off", "wireless", "network", "disconnected", "no internet", "offline"] }
          ]
        },
        {
          slug: "social",
          icons: [
            { filename: "heart", alternatives: ["fill"], keywords: ["like", "love", "favorite"] },
            { filename: "thumb-up-down", alternatives: ["fill"], keywords: ["vote", "rating", "feedback"] },
            { filename: "thumb-up", alternatives: ["fill"], keywords: ["like", "approve", "good", "vote"] },
            { filename: "thumb-down", alternatives: ["fill"], keywords: ["dislike", "disapprove", "bad", "vote"] },
            { filename: "star", alternatives: [], keywords: ["favorite", "rating", "bookmark"] },
            { filename: "star-half", alternatives: [], keywords: ["rating", "half", "review"] },
            { filename: "star-filled", alternatives: [], keywords: ["rating", "filled", "review"] },
            { filename: "stars", alternatives: ["fill"], keywords: ["stars", "rating", "hotel", "class", "quality", "review", "hotel-class"] },
            { filename: "stars-sparkle", alternatives: ["fill"], keywords: ["rating", "favorite", "sparkle", "review", "stars"] },
            { filename: "star-kid", alternatives: ["fill"], keywords: ["kids", "child", "favorite", "rating", "fun"] },
            { filename: "star-family", alternatives: ["fill"], keywords: ["family", "star", "favorite", "household", "rating"] },
            { filename: "star-award", alternatives: ["fill"], keywords: ["award", "prize", "achievement", "badge", "quality", "rating"] },
            { filename: "bookmark", alternatives: ["fill"], keywords: ["save", "favorite", "mark"] },
            { filename: "bookmark-heart", alternatives: ["fill"], keywords: ["save", "favorite", "love", "bookmark"] },
            { filename: "bookmark-stacks", alternatives: ["fill"], keywords: ["bookmarks", "saved", "collection", "stack"] },
            { filename: "smiley", alternatives: [], keywords: ["smiley", "emoji", "face", "mood"] },
            { filename: "smiley-happy", alternatives: ["fill"], keywords: ["emoji", "smile", "positive", "mood"] },
            { filename: "smiley-neutral", alternatives: ["fill"], keywords: ["emoji", "meh", "mood"] },
            { filename: "smiley-sad", alternatives: ["fill"], keywords: ["emoji", "frown", "negative", "mood"] },
            { filename: "share", alternatives: [], keywords: ["network", "nodes", "send"] },
            { filename: "share-social", alternatives: ["fill"], keywords: ["social", "network", "send"] },
            { filename: "rss", alternatives: [], keywords: ["feed", "subscribe", "syndication", "blog"] },
            { filename: "flag-waving", alternatives: ["fill"], keywords: ["report", "mark", "banner"] },
            { filename: "flag", alternatives: ["fill"], keywords: ["flag", "report", "banner", "alt"] },
            { filename: "editor-choice", alternatives: ["fill"], keywords: ["editor", "choice", "recommended", "featured", "badge"] },
            { filename: "megaphone", alternatives: ["fill"], keywords: ["announcement", "marketing", "promote", "loud"] },
            { filename: "celebration", alternatives: ["fill"], keywords: ["party", "confetti", "congrats", "event", "success", "festive"] },
            { filename: "cheer", alternatives: ["fill"], keywords: ["cheer", "high five", "celebrate", "hands", "teamwork"] }
          ]
        },
        {
          slug: "media",
          icons: [
            { filename: "image", alternatives: ["fill"], keywords: ["photo", "picture", "graphic"] },
            { filename: "image-broken", alternatives: ["fill"], keywords: ["image", "broken", "missing", "error", "photo"] },
            { filename: "images", alternatives: ["fill"], keywords: ["photos", "gallery", "pictures"] },
            { filename: "camera", alternatives: ["fill"], keywords: ["photo", "capture", "picture"] },
            { filename: "videocam", alternatives: ["fill"], keywords: ["video", "record", "film"] },
            { filename: "movie", alternatives: ["fill"], keywords: ["movie", "film", "cinema", "video"] },
            { filename: "split-scene", alternatives: ["fill"], keywords: ["split", "scene", "compare", "before after"] },
            { filename: "split-scene-top", alternatives: ["fill"], keywords: ["split", "scene", "top", "compare", "before after"] },
            { filename: "volume-mute", alternatives: ["fill"], keywords: ["sound", "silent", "off", "speaker"] },
            { filename: "volume-down", alternatives: ["fill"], keywords: ["sound", "audio", "quieter", "speaker"] },
            { filename: "volume-up", alternatives: ["fill"], keywords: ["sound", "audio", "louder", "speaker"] },
            { filename: "volume-off", alternatives: ["fill"], keywords: ["mute", "silent", "sound", "speaker"] },
            { filename: "subtitles", alternatives: [], keywords: ["subtitles", "captions", "cc", "video", "accessibility"] },
            { filename: "play-box", alternatives: ["fill"], keywords: ["video", "media", "start"] },
            { filename: "play-circle", alternatives: ["fill"], keywords: ["video", "media", "start"] },
            { filename: "pause-circle", alternatives: ["fill"], keywords: ["pause", "media", "player", "controls", "circle"] },
            { filename: "stop-circle", alternatives: ["fill"], keywords: ["stop", "media", "player", "controls", "circle"] },
            { filename: "play", alternatives: ["fill"], keywords: ["start", "video", "media"] },
            { filename: "pause", alternatives: ["fill"], keywords: ["media", "player", "controls", "stop"] },
            { filename: "stop", alternatives: ["fill"], keywords: ["media", "player", "controls", "square", "end"] },
            { filename: "skip-prev", alternatives: ["fill"], keywords: ["previous", "back", "rewind", "media", "player", "track", "controls"] },
            { filename: "skip-next", alternatives: ["fill"], keywords: ["next", "forward", "media", "player", "track", "controls"] },
            { filename: "fast-rewind", alternatives: ["fill"], keywords: ["rewind", "back", "media", "player", "previous"] },
            { filename: "fast-forward", alternatives: ["fill"], keywords: ["fast forward", "skip", "media", "player", "next"] },
            { filename: "repeat", alternatives: [], keywords: ["repeat", "loop", "media", "player", "cycle"] },
            { filename: "replay", alternatives: [], keywords: ["replay", "restart", "media", "player", "again"] },
            { filename: "shuffle", alternatives: [], keywords: ["shuffle", "random", "media", "player", "music"] },
            { filename: "headphones", alternatives: ["fill"], keywords: ["audio", "listen", "sound", "music"] },
            { filename: "music", alternatives: [], keywords: ["note", "audio", "song", "sound"] },
            { filename: "music-note", alternatives: [], keywords: ["music", "note", "audio", "song"] }
          ]
        },
        {
          slug: "files",
          icons: [
            { filename: "folder", alternatives: ["fill"], keywords: ["directory", "files"] },
            { filename: "folder-edit", alternatives: ["fill"], keywords: ["folder", "edit", "rename", "directory", "files"] },
            { filename: "folder-open", alternatives: ["fill"], keywords: ["directory", "files", "open"] },
            { filename: "folder-stacked", alternatives: ["fill"], keywords: ["folder", "copy", "duplicate", "files"] },
            { filename: "folder-zip", alternatives: ["fill"], keywords: ["archive", "compressed", "zip"] },
            { filename: "file-audio", alternatives: ["fill"], keywords: ["sound", "music", "mp3"] },
            { filename: "file-video", alternatives: ["fill"], keywords: ["movie", "film", "mp4"] },
            { filename: "file-attachment", alternatives: ["fill"], keywords: ["attachment", "attach", "clip", "upload", "document"] },
            { filename: "file-pdf", alternatives: ["fill"], keywords: ["pdf", "document", "acrobat", "export"] },
            { filename: "database", alternatives: ["fill"], keywords: ["storage", "server", "data", "sql"] },
            { filename: "cloud", alternatives: ["fill"], keywords: ["storage", "upload", "server"] },
            { filename: "backup", alternatives: ["fill"], keywords: ["restore", "cloud", "save", "copy"] }
          ]
        },
        {
          slug: "analytics",
          icons: [
            { filename: "chart-pie", alternatives: ["fill"], keywords: ["graph", "statistics", "analytics"] },
            { filename: "chart-area", alternatives: ["fill"], keywords: ["chart", "area", "graph", "analytics"] },
            { filename: "chart-stacked", alternatives: [], keywords: ["chart", "stacked", "graph", "analytics", "bars"] },
            { filename: "chart-bubble", alternatives: ["fill"], keywords: ["chart", "bubble", "graph", "analytics"] },
            { filename: "chart-bar", alternatives: [], keywords: ["graph", "statistics", "analytics", "columns"] },
            { filename: "chart-bar-alt", alternatives: [], keywords: ["graph", "statistics", "analytics", "columns", "bars"] },
            { filename: "chart-line-bar", alternatives: [], keywords: ["monitoring", "line", "analytics", "graph", "trend", "activity"] },
            { filename: "chart-line", alternatives: [], keywords: ["chart", "line", "graph", "trend"] },
            { filename: "chart-line-alt", alternatives: [], keywords: ["chart", "line", "graph", "trend", "alt"] },
            { filename: "chart-data", alternatives: ["fill"], keywords: ["graph", "analytics", "statistics", "report", "insights"] },
            { filename: "trending-up", alternatives: [], keywords: ["growth", "increase", "arrow", "analytics", "rise", "up"] },
            { filename: "trending-down", alternatives: [], keywords: ["decrease", "decline", "arrow", "analytics", "fall", "down"] },
            { filename: "timeline", alternatives: [], keywords: ["process", "steps", "history", "milestones", "sequence", "progress"] },
            { filename: "dashboard", alternatives: ["fill"], keywords: ["gauge", "overview", "panel", "speedometer"] },
            { filename: "dashboard-alt", alternatives: ["fill"], keywords: ["overview", "panel", "widgets"] },
            { filename: "data-table", alternatives: ["fill"], keywords: ["grid", "rows", "spreadsheet"] },
            { filename: "dns", alternatives: ["fill"], keywords: ["dns", "domain", "network", "server"] },
            { filename: "table", alternatives: ["fill"], keywords: ["grid", "rows", "columns", "spreadsheet"] },
            { filename: "table-chart", alternatives: ["fill"], keywords: ["table", "chart", "grid", "columns"] },
            { filename: "table-edit", alternatives: ["fill"], keywords: ["table", "edit", "grid", "modify"] },
            { filename: "analytics", alternatives: ["fill"], keywords: ["analytics", "statistics", "metrics", "insights"] },
            { filename: "list-box", alternatives: ["fill"], keywords: ["list", "panel", "items"] },
            { filename: "odometer", alternatives: ["fill"], keywords: ["odometer", "mileage", "counter", "distance", "gauge"] },
            { filename: "infinity", alternatives: [], keywords: ["infinity", "unlimited", "forever", "infinite", "loop", "endless"] }
          ]
        },
        {
          slug: "layout",
          icons: [
            { filename: "content-grid", alternatives: ["fill"], keywords: ["content", "grid", "catalog", "library", "layout", "panels", "view"] },
            { filename: "widgets", alternatives: ["fill"], keywords: ["widget", "blocks", "layout", "components", "plugins", "extensions"] },
            { filename: "category", alternatives: ["fill"], keywords: ["category", "folder", "taxonomy", "group", "icons"] },
            { filename: "interests", alternatives: ["fill"], keywords: ["interests", "hobbies", "heart", "topics", "icons"] },
            { filename: "grid", alternatives: ["fill"], keywords: ["layout", "tiles", "gallery"] },
            { filename: "grid-3x3", alternatives: [], keywords: ["layout", "tiles", "gallery"] },
            { filename: "grid-4x4", alternatives: [], keywords: ["layout", "tiles", "gallery"] },
            { filename: "view-column", alternatives: ["fill"], keywords: ["layout", "columns"] },
            { filename: "view-comfy", alternatives: ["fill"], keywords: ["layout", "grid", "tiles"] },
            { filename: "view-list", alternatives: ["fill"], keywords: ["layout", "rows", "list"] },
            { filename: "view-grid", alternatives: ["fill"], keywords: ["layout", "tiles", "gallery"] },
            { filename: "view-grid-alt", alternatives: ["fill"], keywords: ["layout", "tiles"] },
            { filename: "cards", alternatives: ["fill"], keywords: ["cards", "layout", "grid", "blocks"] },
            { filename: "two-pager", alternatives: ["fill"], keywords: ["document", "pages", "spread", "brochure"] },
            { filename: "layers", alternatives: ["fill"], keywords: ["stack", "layout", "overlay", "levels", "z-index"] },
            { filename: "stacks", alternatives: ["fill"], keywords: ["stack", "layers", "collection"] },
            { filename: "aspect-ratio", alternatives: ["fill"], keywords: ["aspect", "ratio", "dimensions", "layout"] },
            { filename: "toolbar", alternatives: ["fill"], keywords: ["toolbar", "bar", "controls", "layout"] },
            { filename: "preview", alternatives: ["fill"], keywords: ["preview", "eye", "view", "look", "visibility", "show"] },
            { filename: "tab", alternatives: ["fill"], keywords: ["tab", "tabs", "panel", "layout", "navigation"] },
            { filename: "layout-section", alternatives: ["fill"], keywords: ["section", "layout", "content", "area", "region", "container", "block", "group", "spacing", "margin", "page section"] },
            { filename: "web-stories", alternatives: ["fill"], keywords: ["web", "stories", "story", "reels", "vertical", "social"] },
            { filename: "web-stories-stack", alternatives: ["fill"], keywords: ["web", "stories", "stack", "vertical", "social", "google"] },
            { filename: "carousel", alternatives: ["fill"], keywords: ["slider", "gallery", "slideshow"] },
            { filename: "call-to-action", alternatives: ["fill"], keywords: ["cta", "call to action", "button", "promote"] },
            { filename: "fit-page", alternatives: ["fill"], keywords: ["fit", "page", "document", "layout", "scale"] },
            { filename: "combine-columns", alternatives: ["fill"], keywords: ["table", "columns", "merge", "combine"] },
            { filename: "combine-rows", alternatives: ["fill"], keywords: ["table", "rows", "merge", "combine"] },
            { filename: "add-column-left", alternatives: ["fill"], keywords: ["table", "column", "add", "insert", "left"] },
            { filename: "add-column-right", alternatives: ["fill"], keywords: ["table", "column", "add", "insert", "right"] },
            { filename: "add-row-above", alternatives: ["fill"], keywords: ["table", "row", "add", "insert", "above"] },
            { filename: "add-row-below", alternatives: ["fill"], keywords: ["table", "row", "add", "insert", "below"] },
            { filename: "move-selection-left", alternatives: ["fill"], keywords: ["move", "selection", "left", "arrow", "shift", "reorder"] },
            { filename: "move-selection-right", alternatives: ["fill"], keywords: ["move", "selection", "right", "arrow", "shift", "reorder"] },
            { filename: "move-selection-up", alternatives: ["fill"], keywords: ["move", "selection", "up", "arrow", "shift", "reorder"] },
            { filename: "move-selection-down", alternatives: ["fill"], keywords: ["move", "selection", "down", "arrow", "shift", "reorder"] },
            { filename: "brick", alternatives: ["fill"], keywords: ["block", "gutenberg", "layout", "section"] }
          ]
        },
        {
          slug: "commerce",
          icons: [
            { filename: "shopping-cart", alternatives: ["fill"], keywords: ["cart", "buy", "ecommerce", "checkout"] },
            { filename: "shopping-cart-off", alternatives: ["fill"], keywords: ["cart", "disabled", "removed", "empty", "unavailable", "no"] },
            { filename: "shopping-cart-add", alternatives: [], keywords: ["cart", "buy", "plus"] },
            { filename: "shopping-cart-remove", alternatives: [], keywords: ["cart", "minus", "remove"] },
            { filename: "shopping-basket", alternatives: ["fill"], keywords: ["basket", "buy", "cart"] },
            { filename: "shopping-bag", alternatives: ["fill"], keywords: ["shopping", "bag", "retail", "buy"] },
            { filename: "package", alternatives: ["fill"], keywords: ["box", "parcel", "delivery", "shipping", "order"] },
            { filename: "sell-tag", alternatives: ["fill"], keywords: ["sell", "tag", "price", "offer", "sale"] },
            { filename: "contactless", alternatives: ["fill"], keywords: ["payment", "tap", "nfc", "wireless", "pay"] },
            { filename: "credit-card", alternatives: ["fill"], keywords: ["payment", "card", "pay"] },
            { filename: "payment-card", alternatives: ["fill"], keywords: ["payment", "card", "credit card", "debit", "pay"] },
            { filename: "payments", alternatives: ["fill"], keywords: ["money", "pay", "cash", "finance"] },
            { filename: "finance-chip", alternatives: ["fill"], keywords: ["finance", "chip", "payment", "money", "dollar"] },
            { filename: "atm", alternatives: ["fill"], keywords: ["atm", "cash", "bank", "withdraw", "dollar"] },
            { filename: "receipt", alternatives: ["fill"], keywords: ["receipt", "invoice", "bill", "purchase", "order"] },
            { filename: "checkbook", alternatives: ["fill"], keywords: ["checkbook", "check", "cheque", "payment", "finance", "bank"] },
            { filename: "wallet", alternatives: ["fill"], keywords: ["wallet", "money", "payment", "finance", "purse"] },
            { filename: "wallet-alt", alternatives: ["fill"], keywords: ["wallet", "money", "payment", "alt"] },
            { filename: "money-bag", alternatives: ["fill"], keywords: ["money", "bag", "cash", "savings"] },
            { filename: "savings", alternatives: ["fill"], keywords: ["savings", "money", "bank", "piggy"] },
            { filename: "bank", alternatives: ["fill"], keywords: ["bank", "finance", "building", "money", "institution"] },
            { filename: "universal-currency", alternatives: ["fill"], keywords: ["currency", "money", "exchange", "global", "bill", "banknote"] },
            { filename: "dollar-circle", alternatives: ["fill"], keywords: ["dollar", "money", "currency", "price"] },
            { filename: "currency-exchange", alternatives: [], keywords: ["money", "exchange", "convert", "forex", "rates"] },
            { filename: "currency-dollar", alternatives: [], keywords: ["money", "usd", "price"] },
            { filename: "currency-euro", alternatives: [], keywords: ["money", "eur", "price"] },
            { filename: "currency-pound", alternatives: [], keywords: ["money", "gbp", "price"] },
            { filename: "currency-yen", alternatives: [], keywords: ["money", "jpy", "price"] },
            { filename: "currency-franc", alternatives: [], keywords: ["money", "chf", "franc", "swiss", "price"] },
            { filename: "currency-lira", alternatives: [], keywords: ["money", "try", "lira", "turkish", "price"] },
            { filename: "currency-ruble", alternatives: [], keywords: ["money", "rub", "ruble", "russian", "price"] },
            { filename: "currency-rupee", alternatives: [], keywords: ["money", "inr", "rupee", "indian", "price"] },
            { filename: "currency-yuan", alternatives: [], keywords: ["money", "cny", "yuan", "renminbi", "chinese", "price"] },
            { filename: "currency-bitcoin", alternatives: [], keywords: ["money", "btc", "bitcoin", "crypto", "cryptocurrency"] },
            { filename: "copyright", alternatives: ["fill"], keywords: ["copyright", "legal", "ip", "symbol"] },
            { filename: "handshake", alternatives: ["fill"], keywords: ["handshake", "deal", "partnership", "agreement"] },
            { filename: "contract", alternatives: ["fill"], keywords: ["contract", "document", "agreement", "legal"] },
            { filename: "contract-sign", alternatives: ["fill"], keywords: ["contract", "sign", "signature", "agreement"] },
            { filename: "gavel", alternatives: [], keywords: ["gavel", "law", "court", "legal", "auction"] },
            { filename: "balance", alternatives: [], keywords: ["balance", "scale", "justice", "law", "weight"] },
            { filename: "license", alternatives: ["fill"], keywords: ["license", "certificate", "permit", "badge"] },
            { filename: "license-off", alternatives: ["fill"], keywords: ["unlicense", "unlicensed", "no license", "blocked", "legal", "permit"] },
            { filename: "visa", alternatives: [], keywords: ["payment", "card", "credit card", "brand"] },
            { filename: "mastercard", alternatives: [], keywords: ["payment", "card", "credit card", "brand"] },
            { filename: "paypal", alternatives: [], keywords: ["payment", "pay", "wallet", "brand"] },
            { filename: "apple-pay", alternatives: [], keywords: ["payment", "apple", "pay", "wallet", "brand"] },
            { filename: "googlepay", alternatives: [], keywords: ["payment", "google", "pay", "wallet", "brand"] },
            { filename: "klarna", alternatives: [], keywords: ["payment", "pay", "bnpl", "buy now pay later", "brand"] }
          ]
        },
        {
          slug: "people",
          icons: [
            { filename: "account-circle", alternatives: ["fill"], keywords: ["user", "profile", "person"] },
            { filename: "account-box", alternatives: ["fill"], keywords: ["account", "user", "profile", "box"] },
            { filename: "account", alternatives: ["fill"], keywords: ["user", "profile", "account"] },
            { filename: "group", alternatives: ["fill"], keywords: ["team", "people", "users"] },
            { filename: "groups", alternatives: ["fill"], keywords: ["groups", "people", "team", "users", "community"] },
            { filename: "face", alternatives: ["fill"], keywords: ["user", "avatar", "profile"] },
            { filename: "face-male", alternatives: ["fill"], keywords: ["face", "avatar", "profile", "user", "alt"] },
            { filename: "face-female", alternatives: ["fill"], keywords: ["face", "female", "woman", "avatar", "profile", "user"] },
            { filename: "id-card", alternatives: ["fill"], keywords: ["identity", "badge", "profile"] },
            { filename: "badge", alternatives: ["fill"], keywords: ["badge", "id", "name tag", "employee", "lanyard", "credential"] },
            { filename: "login", alternatives: [], keywords: ["sign in", "enter", "access"] },
            { filename: "logout", alternatives: [], keywords: ["sign out", "exit", "leave"] },
            { filename: "gender-male", alternatives: [], keywords: ["man", "sex", "symbol"] },
            { filename: "gender-female", alternatives: [], keywords: ["woman", "sex", "symbol"] },
            { filename: "agender", alternatives: [], keywords: ["agender", "gender", "identity", "symbol"] },
            { filename: "wc", alternatives: [], keywords: ["toilet", "restroom", "bathroom", "wc", "lavatory"] },
            { filename: "man", alternatives: [], keywords: ["male", "person", "user"] },
            { filename: "woman", alternatives: [], keywords: ["female", "person", "user"] },
            { filename: "pregnant-woman", alternatives: [], keywords: ["pregnant", "woman", "maternity", "mother", "expecting"] },
            { filename: "accessibility", alternatives: [], keywords: ["a11y", "wheelchair", "disability", "access"] },
            { filename: "wheelchair", alternatives: [], keywords: ["accessibility", "a11y", "universal", "access"] },
            { filename: "sign-language", alternatives: ["fill"], keywords: ["sign language", "accessibility", "hands", "deaf"] }
          ]
        },
        {
          slug: "places",
          icons: [
            { filename: "map", alternatives: ["fill"], keywords: ["location", "navigation", "directions"] },
            { filename: "map-search", alternatives: ["fill"], keywords: ["map", "search", "location", "find"] },
            { filename: "my-location", alternatives: ["fill"], keywords: ["my location", "gps", "me", "position", "current"] },
            { filename: "location", alternatives: [], keywords: ["gps", "crosshair", "locate", "position", "tracking", "map"] },
            { filename: "location-off", alternatives: [], keywords: ["gps", "off", "disabled", "location", "privacy", "map"] },
            { filename: "map-pin", alternatives: ["fill"], keywords: ["pin", "map", "marker", "place", "gps"] },
            { filename: "map-pin-drop", alternatives: ["fill"], keywords: ["location", "marker", "map", "place"] },
            { filename: "map-pin-circle", alternatives: ["fill"], keywords: ["pin", "location", "circle", "marker"] },
            { filename: "map-pin-add", alternatives: ["fill"], keywords: ["add", "location", "pin", "place", "map"] },
            { filename: "map-pin-heart", alternatives: ["fill"], keywords: ["favorite", "location", "place", "saved"] },
            { filename: "navigation", alternatives: ["fill"], keywords: ["navigation", "direction", "gps", "arrow", "maps"] },
            { filename: "navigation-rotated", alternatives: ["fill"], keywords: ["my location", "gps", "me", "position"] },
            { filename: "navigation-circle", alternatives: ["fill"], keywords: ["direction", "gps", "near me", "explore", "arrow", "maps"] },
            { filename: "compass", alternatives: ["fill"], keywords: ["navigation", "direction", "explore"] },
            { filename: "passport", alternatives: ["fill"], keywords: ["passport", "travel", "identity", "document"] },
            { filename: "globe", alternatives: [], keywords: ["world", "earth", "international", "web"] },
            { filename: "globe-america", alternatives: [], keywords: ["globe", "america", "world", "international"] },
            { filename: "globe-asia", alternatives: [], keywords: ["globe", "asia", "world", "international"] },
            { filename: "signpost", alternatives: ["fill"], keywords: ["direction", "guide", "wayfinding", "route"] },
            { filename: "footprint", alternatives: ["fill"], keywords: ["footprint", "track", "trail", "walk", "steps"] },
            { filename: "walk", alternatives: [], keywords: ["pedestrian", "walking", "steps", "directions"] },
            { filename: "bicycle", alternatives: [], keywords: ["bike", "cycle", "transport", "ride"] },
            { filename: "moped", alternatives: ["fill"], keywords: ["moped", "scooter", "motorbike", "motorcycle", "transport", "bike"] },
            { filename: "motorbike", alternatives: ["fill"], keywords: ["motorbike", "motorcycle", "scooter", "moped", "transport", "bike"] },
            { filename: "car", alternatives: ["fill"], keywords: ["vehicle", "drive", "transport", "auto"] },
            { filename: "parking", alternatives: [], keywords: ["parking", "car", "lot", "park", "p"] },
            { filename: "traffic-light", alternatives: ["fill"], keywords: ["traffic", "lights", "signal", "road", "transport"] },
            { filename: "bus", alternatives: [], keywords: ["bus", "transport", "public transit", "travel"] },
            { filename: "train", alternatives: ["fill"], keywords: ["transport", "rail", "metro", "subway", "travel"] },
            { filename: "ship", alternatives: ["fill"], keywords: ["boat", "transport", "cruise", "sea", "ferry", "travel"] },
            { filename: "sailing", alternatives: ["fill"], keywords: ["sailing", "sailboat", "boat", "sea", "sport", "travel"] },
            { filename: "anchor", alternatives: [], keywords: ["anchor", "harbor", "maritime", "port"] },
            { filename: "plane", alternatives: [], keywords: ["airplane", "flight", "travel", "fly", "airport"] },
            { filename: "airlines", alternatives: ["fill"], keywords: ["airline", "flight", "plane", "travel", "airport"] },
            { filename: "hotel", alternatives: ["fill"], keywords: ["hotel", "lodging", "accommodation", "bed", "stay", "travel"] },
            { filename: "suitcase", alternatives: ["fill"], keywords: ["suitcase", "travel", "luggage", "trip"] },
            { filename: "nearby", alternatives: [], keywords: ["near me", "local", "around", "location"] },
            { filename: "recenter", alternatives: [], keywords: ["recenter", "map", "center", "refocus", "location"] }
          ]
        },
        {
          slug: "devices",
          icons: [
            { filename: "devices", alternatives: ["fill"], keywords: ["devices", "laptop", "phone", "mobile", "computer", "screen"] },
            { filename: "laptop", alternatives: ["fill"], keywords: ["computer", "notebook", "device"] },
            { filename: "laptop-alt", alternatives: ["fill"], keywords: ["computer", "notebook"] },
            { filename: "monitor", alternatives: ["fill"], keywords: ["monitor", "screen", "display", "desktop"] },
            { filename: "tv", alternatives: ["fill"], keywords: ["television", "screen", "monitor", "display"] },
            { filename: "tv-remote", alternatives: ["fill"], keywords: ["tv", "remote", "control", "television", "device"] },
            { filename: "tablet", alternatives: ["fill"], keywords: ["tablet", "ipad", "device", "screen"] },
            { filename: "wearables", alternatives: ["fill"], keywords: ["devices", "wearables", "watch", "band", "smartwatch"] },
            { filename: "mobile", alternatives: ["fill"], keywords: ["phone", "smartphone", "device"] },
            { filename: "mobile-alt", alternatives: ["fill"], keywords: ["phone", "smartphone"] },
            { filename: "mobile-vibrate", alternatives: ["fill"], keywords: ["mobile", "vibrate", "phone", "haptic", "notification"] },
            { filename: "device-fold", alternatives: ["fill"], keywords: ["devices", "fold", "foldable", "phone", "tablet"] },
            { filename: "battery-full", alternatives: [], keywords: ["battery", "full", "charge", "power", "energy"] },
            { filename: "battery-half", alternatives: [], keywords: ["battery", "half", "charge", "power", "energy"] },
            { filename: "battery-low", alternatives: [], keywords: ["battery", "low", "empty", "charge", "power", "energy"] },
            { filename: "vr-headset", alternatives: ["fill"], keywords: ["vr", "headset", "ar", "wearable"] },
            { filename: "power", alternatives: ["fill"], keywords: ["power", "on", "energy", "electricity", "plug"] },
            { filename: "power-unplugged", alternatives: ["fill"], keywords: ["power", "off", "unplugged", "disconnect", "energy", "plug"] },
            { filename: "power-off", alternatives: [], keywords: ["shutdown", "standby", "on", "off"] },
            { filename: "power-off-circle", alternatives: ["fill"], keywords: ["power", "off", "shutdown", "circle"] },
            { filename: "keyboard", alternatives: ["fill"], keywords: ["keyboard", "type", "input", "keys"] },
            { filename: "keyboard-capslock", alternatives: ["fill"], keywords: ["caps lock", "keyboard", "uppercase", "keys"] },
            { filename: "mouse", alternatives: ["fill"], keywords: ["click", "cursor", "device"] },
            { filename: "pointer", alternatives: ["fill"], keywords: ["cursor", "click", "select", "arrow", "mouse"] },
            { filename: "barcode", alternatives: [], keywords: ["scan", "product", "code"] },
            { filename: "barcode-scan", alternatives: [], keywords: ["scan", "product", "code"] },
            { filename: "qr-code", alternatives: [], keywords: ["qr", "code", "scan", "barcode", "link"] },
            { filename: "qr-code-alt", alternatives: [], keywords: ["qr", "code", "scan", "barcode"] },
            { filename: "qr-code-scan", alternatives: [], keywords: ["qr", "code", "scan", "camera", "barcode"] },
            { filename: "radio", alternatives: ["fill"], keywords: ["radio", "audio", "broadcast", "fm", "am", "music"] },
            { filename: "trackpad-input", alternatives: ["fill"], keywords: ["trackpad", "touchpad", "input", "gesture"] },
            { filename: "videogame", alternatives: ["fill"], keywords: ["videogame", "gaming", "controller", "play"] },
            { filename: "game-controller", alternatives: ["fill"], keywords: ["esports", "gaming", "controller", "competitive"] },
            { filename: "joystick", alternatives: ["fill"], keywords: ["joystick", "gaming", "controller", "game"] }
          ]
        },
        {
          slug: "security",
          icons: [
            { filename: "lock", alternatives: ["fill"], keywords: ["secure", "locked", "private", "password"] },
            { filename: "lock-open", alternatives: ["fill"], keywords: ["unlocked", "open", "access"] },
            { filename: "key", alternatives: ["fill"], keywords: ["password", "access", "login", "unlock"] },
            { filename: "password", alternatives: [], keywords: ["password", "lock", "secure", "login"] },
            { filename: "cookie", alternatives: ["fill"], keywords: ["consent", "privacy", "gdpr"] },
            { filename: "cookie-off", alternatives: ["fill"], keywords: ["cookie", "off", "privacy", "consent", "block"] },
            { filename: "shield", alternatives: ["fill"], keywords: ["security", "protection", "guard"] },
            { filename: "shield-check", alternatives: ["fill"], keywords: ["security", "verified", "protected", "safe"] },
            { filename: "shield-lock", alternatives: ["fill"], keywords: ["security", "protected", "private"] },
            { filename: "shield-security", alternatives: [], keywords: ["protection", "guard", "safe"] },
            { filename: "shield-info", alternatives: ["fill"], keywords: ["shield", "info", "security", "protection"] },
            { filename: "shield-star", alternatives: ["fill"], keywords: ["security", "protection", "badge", "star", "shield"] },
            { filename: "verified", alternatives: ["fill"], keywords: ["check", "badge", "trusted", "approved"] },
            { filename: "cctv", alternatives: ["fill"], keywords: ["surveillance", "camera", "security", "monitor", "cctv"] },
            { filename: "siren", alternatives: ["fill"], keywords: ["emergency", "alert", "warning", "alarm", "siren"] },
            { filename: "emergency", alternatives: ["fill"], keywords: ["emergency", "sos", "crisis", "help", "alert"] },
            { filename: "fingerprint", alternatives: [], keywords: ["fingerprint", "biometric", "auth", "identity"] }
          ]
        },
        {
          slug: "controls",
          icons: [
            { filename: "settings", alternatives: ["fill"], keywords: ["gear", "cog", "preferences", "options"] },
            { filename: "cogwheels", alternatives: ["fill"], keywords: ["manufacturing", "production", "industrial", "factory", "assembly"] },
            { filename: "wrench", alternatives: ["fill"], keywords: ["build", "wrench", "tools", "construct", "configure"] },
            { filename: "tune", alternatives: [], keywords: ["sliders", "adjust", "options"] },
            { filename: "tune-alt", alternatives: [], keywords: ["sliders", "adjust", "options", "vertical", "tune"] },
            { filename: "sort", alternatives: [], keywords: ["order", "arrange", "filter"] },
            { filename: "sort-by-alpha", alternatives: [], keywords: ["order", "alphabetical", "az"] },
            { filename: "filter", alternatives: [], keywords: ["funnel", "sort", "refine"] },
            { filename: "filter-off", alternatives: [], keywords: ["funnel", "clear", "reset"] },
            { filename: "filter-alt", alternatives: ["fill"], keywords: ["funnel", "sort", "refine"] },
            { filename: "filter-alt-off", alternatives: ["fill"], keywords: ["funnel", "clear", "reset"] },
            { filename: "dropdown", alternatives: ["fill"], keywords: ["caret", "down", "menu", "select"] },
            { filename: "toggle-off", alternatives: ["fill"], keywords: ["switch", "off", "disabled"] },
            { filename: "toggle-on", alternatives: ["fill"], keywords: ["switch", "on", "enabled"] },
            { filename: "checkbox", alternatives: [], keywords: ["check", "box", "unchecked", "form"] },
            { filename: "checkbox-checked", alternatives: ["fill"], keywords: ["check", "form", "selected"] },
            { filename: "checkbox-indeterminate", alternatives: ["fill"], keywords: ["check", "partial", "form"] },
            { filename: "radio-button", alternatives: [], keywords: ["option", "form", "circle"] },
            { filename: "radio-button-checked", alternatives: [], keywords: ["option", "form", "selected"] },
            { filename: "radio-button-partial", alternatives: [], keywords: ["option", "form", "partial"] },
            { filename: "visibility", alternatives: ["fill"], keywords: ["eye", "show", "view", "visible"] },
            { filename: "visibility-off", alternatives: ["fill"], keywords: ["eye", "hide", "hidden", "invisible", "private", "password"] },
            { filename: "mode-light", alternatives: ["fill"], keywords: ["day", "theme", "sun", "brightness"] },
            { filename: "mode-dark", alternatives: ["fill"], keywords: ["night", "theme", "moon"] }
          ]
        },
        {
          slug: "status",
          icons: [
            { filename: "info", alternatives: ["fill"], keywords: ["information", "help", "details", "about"] },
            { filename: "info-alt", alternatives: [], keywords: ["information", "help", "details", "alt"] },
            { filename: "help", alternatives: ["fill"], keywords: ["question", "support", "faq"] },
            { filename: "warning", alternatives: ["fill"], keywords: ["alert", "caution", "attention", "error"] },
            { filename: "error", alternatives: ["fill"], keywords: ["alert", "exclamation", "danger", "problem", "fail", "warning"] },
            { filename: "notifications", alternatives: ["fill"], keywords: ["bell", "alert", "alarm"] },
            { filename: "notification-unread", alternatives: ["fill"], keywords: ["notification", "unread", "badge", "alert"] },
            { filename: "clock", alternatives: ["fill"], keywords: ["time", "schedule", "hour"] },
            { filename: "clock-alt", alternatives: ["fill"], keywords: ["time", "schedule", "clock", "alt"] },
            { filename: "history", alternatives: [], keywords: ["history", "past", "time", "archive", "recent"] },
            { filename: "alarm", alternatives: ["fill"], keywords: ["alarm", "alert", "clock", "wake", "timer"] },
            { filename: "timer", alternatives: ["fill"], keywords: ["timer", "countdown", "stopwatch", "time"] },
            { filename: "watch", alternatives: ["fill"], keywords: ["watch", "time", "wristwatch", "schedule", "wearable"] },
            { filename: "watch-text", alternatives: ["fill"], keywords: ["watch", "time", "wristwatch", "schedule", "wearable", "alt"] },
            { filename: "hourglass", alternatives: ["fill"], keywords: ["time", "wait", "loading", "timer"] },
            { filename: "calendar", alternatives: ["fill"], keywords: ["date", "schedule", "event", "day", "blank"] },
            { filename: "calendar-month", alternatives: ["fill"], keywords: ["date", "month", "schedule", "event"] },
            { filename: "calendar-text", alternatives: ["fill"], keywords: ["date", "event", "schedule", "agenda"] },
            { filename: "calendar-x", alternatives: ["fill"], keywords: ["date", "event", "schedule", "cancel", "busy", "unavailable"] },
            { filename: "speed-low", alternatives: ["fill"], keywords: ["speed", "slow", "performance", "low"] },
            { filename: "speed-high", alternatives: ["fill"], keywords: ["speed", "fast", "performance", "high"] },
            { filename: "label", alternatives: ["fill"], keywords: ["tag", "badge", "category"] },
            { filename: "tooltip", alternatives: ["fill"], keywords: ["tooltip", "hint", "help", "info", "popup", "alt"] },
            { filename: "tooltip-text", alternatives: ["fill"], keywords: ["tooltip", "hint", "help", "info", "popup"] }
          ]
        },
        {
          slug: "weather",
          icons: [
            { filename: "sunny", alternatives: ["fill"], keywords: ["sun", "weather", "clear", "bright", "sunny"] },
            { filename: "partly-cloudy", alternatives: ["fill"], keywords: ["weather", "cloud", "sun", "partly cloudy", "forecast"] },
            { filename: "mixed-weather", alternatives: ["fill"], keywords: ["weather", "partly cloudy", "forecast", "cloud", "sun"] },
            { filename: "rain", alternatives: ["fill"], keywords: ["rain", "weather", "precipitation", "storm", "water"] },
            { filename: "thunderstorm", alternatives: ["fill"], keywords: ["storm", "lightning", "weather", "thunder", "rain"] },
            { filename: "snowy", alternatives: ["fill"], keywords: ["snow", "snowy", "weather", "winter", "cloud", "cold"] },
            { filename: "foggy", alternatives: ["fill"], keywords: ["fog", "foggy", "weather", "mist"] },
            { filename: "partly-cloudy-night", alternatives: ["fill"], keywords: ["weather", "cloud", "moon", "night", "partly cloudy", "forecast"] },
            { filename: "moon", alternatives: ["fill"], keywords: ["moon", "night", "dark", "theme", "sleep"] },
            { filename: "moon-stars", alternatives: ["fill"], keywords: ["moon", "stars", "night", "sky", "sleep"] },
            { filename: "wind", alternatives: [], keywords: ["wind", "weather", "breeze", "air"] },
            { filename: "fan", alternatives: ["fill"], keywords: ["fan", "ventilator", "cooling", "air", "appliance"] },
            { filename: "heat", alternatives: ["fill"], keywords: ["hot", "temperature", "heat", "weather", "summer"] },
            { filename: "cold", alternatives: [], keywords: ["cold", "temperature", "freeze", "weather", "winter"] },
            { filename: "snowflake", alternatives: [], keywords: ["snow", "winter", "weather", "cold", "flake"] },
            { filename: "thermometer", alternatives: ["fill"], keywords: ["thermometer", "temperature", "weather", "heat"] },
            { filename: "thermometer-alt", alternatives: [], keywords: ["thermometer", "temperature", "weather", "alt"] }
          ]
        },
        {
          slug: "food-drink",
          icons: [
            { filename: "dining", alternatives: [], keywords: ["dining", "restaurant", "food", "eat", "meal"] },
            { filename: "fork-knife", alternatives: [], keywords: ["fork", "knife", "dining", "restaurant"] },
            { filename: "fork-spoon", alternatives: [], keywords: ["fork", "spoon", "dining", "restaurant", "eat"] },
            { filename: "chef-hat", alternatives: ["fill"], keywords: ["chef", "cook", "kitchen", "restaurant", "hat"] },
            { filename: "menu-book", alternatives: ["fill"], keywords: ["menu", "book", "reading", "restaurant"] },
            { filename: "burger", alternatives: ["fill"], keywords: ["burger", "food", "fast food", "hamburger", "meal"] },
            { filename: "fast-food", alternatives: ["fill"], keywords: ["fast food", "meal", "takeaway", "restaurant"] },
            { filename: "pizza", alternatives: ["fill"], keywords: ["pizza", "food", "slice", "italian"] },
            { filename: "bakery", alternatives: ["fill"], keywords: ["bakery", "bread", "pastry", "food", "croissant"] },
            { filename: "cake", alternatives: ["fill"], keywords: ["cake", "dessert", "birthday", "sweet"] },
            { filename: "icecream", alternatives: ["fill"], keywords: ["ice cream", "dessert", "sweet", "food"] },
            { filename: "nutrition", alternatives: ["fill"], keywords: ["nutrition", "food", "diet", "health", "apple"] },
            { filename: "coffee", alternatives: ["fill"], keywords: ["coffee", "drink", "cafe", "cup", "espresso"] },
            { filename: "tea", alternatives: ["fill"], keywords: ["tea", "drink", "cup", "hot", "cafe"] },
            { filename: "glass", alternatives: ["fill"], keywords: ["glass", "drink", "cup", "beverage"] },
            { filename: "glass-full", alternatives: ["fill"], keywords: ["water", "glass", "drink", "hydration", "cup"] },
            { filename: "water-bottle", alternatives: ["fill"], keywords: ["water", "bottle", "drink", "hydration"] },
            { filename: "beer", alternatives: ["fill"], keywords: ["beer", "drink", "alcohol", "bar", "pub"] },
            { filename: "wine", alternatives: ["fill"], keywords: ["wine", "drink", "alcohol", "glass", "bar"] },
            { filename: "liquor", alternatives: ["fill"], keywords: ["liquor", "alcohol", "bottle", "drink", "spirits"] },
            { filename: "cocktail", alternatives: ["fill"], keywords: ["cocktail", "drink", "alcohol", "glass", "bar"] },
            { filename: "no-drinks", alternatives: ["fill"], keywords: ["no drinks", "alcohol free", "dry", "prohibited", "bar"] }
          ]
        },
        {
          slug: "sports-fitness",
          icons: [
            { filename: "stadium", alternatives: ["fill"], keywords: ["stadium", "arena", "sport", "event", "venue"] },
            { filename: "football", alternatives: [], keywords: ["football", "soccer", "sport", "ball", "game"] },
            { filename: "basketball", alternatives: ["fill"], keywords: ["basketball", "sport", "ball", "hoop"] },
            { filename: "volleyball", alternatives: [], keywords: ["volleyball", "sport", "ball", "net", "game"] },
            { filename: "baseball", alternatives: ["fill"], keywords: ["baseball", "sport", "bat", "ball"] },
            { filename: "american-football", alternatives: ["fill"], keywords: ["american football", "nfl", "sport", "ball"] },
            { filename: "rugby", alternatives: ["fill"], keywords: ["rugby", "sport", "ball", "game"] },
            { filename: "badminton", alternatives: ["fill"], keywords: ["badminton", "sport", "racket", "shuttlecock"] },
            { filename: "tennis", alternatives: ["fill"], keywords: ["tennis", "sport", "ball", "racket", "court"] },
            { filename: "cricket", alternatives: ["fill"], keywords: ["cricket", "sport", "bat", "ball"] },
            { filename: "golf", alternatives: ["fill"], keywords: ["golf", "sport", "club", "course"] },
            { filename: "hockey", alternatives: [], keywords: ["hockey", "sport", "ice", "stick"] },
            { filename: "exercise", alternatives: ["fill"], keywords: ["exercise", "fitness", "workout", "training", "gym"] },
            { filename: "motorsports", alternatives: ["fill"], keywords: ["motorsports", "racing", "car", "speed", "sport"] },
            { filename: "whistle", alternatives: ["fill"], keywords: ["whistle", "referee", "sport", "coach"] },
            { filename: "sports-flag", alternatives: [], keywords: ["sports", "flag", "finish", "race", "goal"] },
            { filename: "scoreboard", alternatives: ["fill"], keywords: ["scoreboard", "score", "sports", "results"] },
            { filename: "leaderboard", alternatives: ["fill"], keywords: ["leaderboard", "ranking", "score", "top", "podium", "chart"] },
            { filename: "trophy", alternatives: ["fill"], keywords: ["award", "win", "prize", "achievement", "cup", "winner"] },
            { filename: "medal", alternatives: ["fill"], keywords: ["medal", "award", "prize", "achievement", "winner", "sport"] },
            { filename: "medals", alternatives: ["fill"], keywords: ["medals", "award", "prize", "winner", "podium", "ranking", "achievement"] },
            { filename: "target", alternatives: [], keywords: ["target", "goal", "aim", "bullseye", "focus"] }
          ]
        },
        {
          slug: "health-medical",
          icons: [
            { filename: "health-cross", alternatives: ["fill"], keywords: ["health", "medical", "wellness", "care", "heart"] },
            { filename: "shield-health", alternatives: ["fill"], keywords: ["shield", "health", "protection", "medical"] },
            { filename: "medical-services", alternatives: ["fill"], keywords: ["medical", "health", "hospital", "services", "care"] },
            { filename: "healing", alternatives: ["fill"], keywords: ["healing", "health", "recovery", "medical"] },
            { filename: "monitor-heart", alternatives: ["fill"], keywords: ["monitor", "heart", "health", "vitals", "medical"] },
            { filename: "cardiology", alternatives: ["fill"], keywords: ["cardiology", "heart", "medical", "health"] },
            { filename: "vital-signs", alternatives: [], keywords: ["vital signs", "health", "medical", "monitor"] },
            { filename: "medical-mask", alternatives: ["fill"], keywords: ["medical", "mask", "face", "health", "protection"] },
            { filename: "mask", alternatives: ["fill"], keywords: ["medical", "mask", "health", "protection", "alt"] },
            { filename: "pill", alternatives: ["fill"], keywords: ["pill", "medicine", "drug", "pharmacy"] },
            { filename: "allergies", alternatives: ["fill"], keywords: ["allergies", "medical", "health", "reaction"] },
            { filename: "sick", alternatives: ["fill"], keywords: ["sick", "ill", "unwell", "health", "face"] },
            { filename: "fluid", alternatives: ["fill"], keywords: ["fluid", "liquid", "medical", "iv"] },
            { filename: "syringe", alternatives: ["fill"], keywords: ["syringe", "injection", "vaccine", "medical", "needle"] },
            { filename: "fluid-syringe", alternatives: ["fill"], keywords: ["syringe", "injection", "medical", "vaccine"] },
            { filename: "vaccines", alternatives: ["fill"], keywords: ["vaccine", "vaccination", "immunization", "medical", "health"] },
            { filename: "labs", alternatives: ["fill"], keywords: ["lab", "science", "experiment", "test tube", "research"] },
            { filename: "science", alternatives: ["fill"], keywords: ["science", "lab", "research", "flask"] },
            { filename: "virus", alternatives: ["fill"], keywords: ["virus", "infection", "medical", "health"] },
            { filename: "dna", alternatives: [], keywords: ["dna", "genetics", "science", "biology"] }
          ]
        },
        {
          slug: "nature",
          icons: [
            { filename: "forest", alternatives: ["fill"], keywords: ["forest", "trees", "nature", "woods", "park"] },
            { filename: "pine-tree", alternatives: ["fill"], keywords: ["pine", "tree", "forest", "nature", "evergreen"] },
            { filename: "nature", alternatives: ["fill"], keywords: ["nature", "outdoors", "landscape", "environment"] },
            { filename: "nature-people", alternatives: ["fill"], keywords: ["nature", "people", "outdoors", "hiking", "park"] },
            { filename: "camping", alternatives: ["fill"], keywords: ["camp", "tent", "outdoors", "nature", "hiking"] },
            { filename: "flower-tulip", alternatives: ["fill"], keywords: ["flower", "nature", "plant", "garden"] },
            { filename: "flower", alternatives: ["fill"], keywords: ["flower", "nature", "plant", "alt"] },
            { filename: "eco", alternatives: ["fill"], keywords: ["eco", "leaf", "green", "environment", "sustainability"] },
            { filename: "drop", alternatives: ["fill"], keywords: ["drop", "water", "liquid", "drip"] },
            { filename: "water", alternatives: [], keywords: ["water", "liquid", "drop", "nature", "sea"] },
            { filename: "swimming", alternatives: [], keywords: ["swimming", "pool", "sport", "water", "swim"] },
            { filename: "umbrella", alternatives: ["fill"], keywords: ["umbrella", "beach", "rain", "sun", "vacation"] },
            { filename: "recycling", alternatives: [], keywords: ["recycle", "eco", "environment", "sustainability", "green"] },
            { filename: "paw", alternatives: [], keywords: ["paw", "animal", "dog", "cat", "pet"] },
            { filename: "dog", alternatives: ["fill"], keywords: ["dog", "pet", "animal", "puppy"] },
            { filename: "bone", alternatives: ["fill"], keywords: ["pet", "supplies", "food", "animal", "bowl"] },
            { filename: "owl", alternatives: ["fill"], keywords: ["owl", "bird", "animal", "night"] },
            { filename: "bird", alternatives: ["fill"], keywords: ["bird", "animal", "nature", "wildlife"] },
            { filename: "bug", alternatives: ["fill"], keywords: ["bug", "insect", "beetle", "animal", "nature"] },
            { filename: "landscape", alternatives: ["fill"], keywords: ["landscape", "photo", "scenery", "nature", "image"] },
            { filename: "mountain-flag", alternatives: ["fill"], keywords: ["mountain", "hiking", "nature", "peak", "outdoors", "flag"] },
            { filename: "mountain", alternatives: ["fill"], keywords: ["landscape", "scenery", "mountains", "nature", "outdoors"] }
          ]
        },
        {
          slug: "misc",
          icons: [
            { filename: "rocket", alternatives: ["fill"], keywords: ["launch", "startup", "fast", "boost"] },
            { filename: "rocket-launch", alternatives: ["fill"], keywords: ["launch", "startup", "boost", "space"] },
            { filename: "planet", alternatives: ["fill"], keywords: ["space", "world", "astronomy", "orbit", "saturn", "galaxy"] },
            { filename: "lightbulb", alternatives: ["fill"], keywords: ["idea", "tip", "hint", "bright"] },
            { filename: "wand-shine", alternatives: [], keywords: ["magic", "wand", "shine", "sparkle", "enhance", "auto"] },
            { filename: "wand-stars", alternatives: ["fill"], keywords: ["magic", "wand", "auto", "enhance", "sparkle", "wizard"] },
            { filename: "star-shine", alternatives: ["fill"], keywords: ["star", "shine", "sparkle", "featured", "favorite", "quality"] },
            { filename: "military-medal", alternatives: ["fill"], keywords: ["medal", "military", "award", "honor", "badge"] },
            { filename: "sticker", alternatives: ["fill"], keywords: ["sticker", "label", "badge", "emoji", "decoration"] },
            { filename: "diamond", alternatives: ["fill"], keywords: ["gem", "premium", "jewel", "quality"] },
            { filename: "school", alternatives: ["fill"], keywords: ["school", "education", "university", "learning"] },
            { filename: "box", alternatives: ["fill"], keywords: ["box", "package", "shipping", "container", "delivery", "parcel"] },
            { filename: "extensions", alternatives: ["fill"], keywords: ["extension", "plugin", "addon", "integration", "piece"] },
            { filename: "puzzle", alternatives: ["fill"], keywords: ["puzzle", "piece", "extension", "plugin", "addon"] },
            { filename: "bolt", alternatives: ["fill"], keywords: ["flash", "energy", "power", "fast", "lightning"] },
            { filename: "factory", alternatives: ["fill"], keywords: ["factory", "industrial", "plant", "manufacturing", "building"] },
            { filename: "engineering", alternatives: ["fill"], keywords: ["engineering", "engineer", "hard hat", "construction", "technical"] },
            { filename: "construction", alternatives: [], keywords: ["maintenance", "work", "build", "tools"] },
            { filename: "chess", alternatives: ["fill"], keywords: ["chess", "game", "strategy", "board", "piece"] },
            { filename: "toy", alternatives: ["fill"], keywords: ["toys", "toy", "car", "play", "children", "kids"] },
            { filename: "smart-toy", alternatives: ["fill"], keywords: ["smart toy", "robot", "toy", "ai", "play"] },
            { filename: "toy-fan", alternatives: ["fill"], keywords: ["toy", "fan", "pinwheel", "play", "children", "kids"] },
            { filename: "ticket", alternatives: ["fill"], keywords: ["ticket", "event", "admission", "pass"] },
            { filename: "ticket-alt", alternatives: ["fill"], keywords: ["ticket", "event", "admission", "pass", "alt"] },
            { filename: "crown", alternatives: ["fill"], keywords: ["king", "queen", "premium", "royal", "vip", "winner", "best"] },
            { filename: "castle", alternatives: ["fill"], keywords: ["castle", "landmark", "building", "fort"] },
            { filename: "swords", alternatives: ["fill"], keywords: ["swords", "fight", "duel", "sport", "crossed"] },
            { filename: "shirt", alternatives: ["fill"], keywords: ["shirt", "clothing", "apparel", "fashion", "wear"] },
            { filename: "glasses", alternatives: [], keywords: ["glasses", "vision", "read", "optical", "eyewear"] },
            { filename: "theater", alternatives: ["fill"], keywords: ["mask", "disguise", "carnival", "theater", "face"] },
            { filename: "fire-extinguisher", alternatives: ["fill"], keywords: ["fire", "extinguisher", "safety", "emergency"] },
            { filename: "fire-hydrant", alternatives: ["fill"], keywords: ["fire", "hydrant", "emergency", "water"] },
            { filename: "bomb", alternatives: ["fill"], keywords: ["bomb", "explosive", "danger", "blast"] },
            { filename: "skull", alternatives: ["fill"], keywords: ["skull", "danger", "death", "pirate", "halloween"] },
            { filename: "present", alternatives: [], keywords: ["present", "gift", "box", "celebration", "reward"] },
            { filename: "strategy", alternatives: ["fill"], keywords: ["strategy", "plan", "chess", "path", "route"] },
            { filename: "style", alternatives: ["fill"], keywords: ["design", "format", "appearance", "paint"] },
            { filename: "comic-bubble", alternatives: ["fill"], keywords: ["comic", "speech bubble", "chat", "message", "manga"] }
          ]
        },
        {
          slug: "brands",
          icons: [
            { filename: "wordpress", alternatives: [], keywords: ["blog", "cms", "wp", "website"] },
            { filename: "facebook", alternatives: [], keywords: ["social", "meta", "fb"] },
            { filename: "instagram", alternatives: [], keywords: ["social", "meta", "ig", "photos"] },
            { filename: "x", alternatives: [], keywords: ["twitter", "tweet", "social"] },
            { filename: "youtube", alternatives: [], keywords: ["video", "streaming", "google", "social"] },
            { filename: "linkedin", alternatives: [], keywords: ["social", "jobs", "network", "professional", "business", "career"] },
            { filename: "tiktok", alternatives: [], keywords: ["social", "video", "short"] },
            { filename: "pinterest", alternatives: [], keywords: ["social", "pin", "board"] },
            { filename: "threads", alternatives: [], keywords: ["social", "meta", "instagram"] },
            { filename: "snapchat", alternatives: [], keywords: ["social", "snap", "ghost"] },
            { filename: "reddit", alternatives: [], keywords: ["social", "forum", "community"] },
            { filename: "tumblr", alternatives: [], keywords: ["social", "blog"] },
            { filename: "mastodon", alternatives: [], keywords: ["social", "fediverse", "toot"] },
            { filename: "bluesky", alternatives: [], keywords: ["social", "bsky", "butterfly"] },
            { filename: "xing", alternatives: [], keywords: ["social", "jobs", "network", "professional", "business"] },
            { filename: "weibo", alternatives: [], keywords: ["social", "china", "microblog"] },
            { filename: "medium", alternatives: [], keywords: ["blog", "publishing", "articles", "writing"] },
            { filename: "whatsapp", alternatives: [], keywords: ["messaging", "chat", "meta", "message"] },
            { filename: "telegram", alternatives: [], keywords: ["messaging", "chat", "message"] },
            { filename: "messenger", alternatives: [], keywords: ["messaging", "facebook", "meta", "chat", "message"] },
            { filename: "signal", alternatives: [], keywords: ["messaging", "chat", "private", "message"] },
            { filename: "imessage", alternatives: [], keywords: ["messaging", "messages", "apple", "chat"] },
            { filename: "wechat", alternatives: [], keywords: ["messaging", "weixin", "chat", "china"] },
            { filename: "line", alternatives: [], keywords: ["messaging", "chat", "japan"] },
            { filename: "discord", alternatives: [], keywords: ["chat", "gaming", "community", "voice"] },
            { filename: "slack", alternatives: [], keywords: ["messaging", "team", "work", "chat", "collaboration"] },
            { filename: "youtube-shorts", alternatives: [], keywords: ["video", "youtube", "shorts", "short"] },
            { filename: "vimeo", alternatives: [], keywords: ["video", "streaming"] },
            { filename: "twitch", alternatives: [], keywords: ["video", "streaming", "gaming", "live"] },
            { filename: "spotify", alternatives: [], keywords: ["music", "audio", "streaming"] },
            { filename: "soundcloud", alternatives: [], keywords: ["music", "audio", "streaming"] },
            { filename: "apple-music", alternatives: [], keywords: ["music", "audio", "streaming", "apple"] },
            { filename: "behance", alternatives: [], keywords: ["portfolio", "design", "creative", "adobe"] },
            { filename: "dribbble", alternatives: [], keywords: ["portfolio", "design", "creative", "shots"] },
            { filename: "github", alternatives: [], keywords: ["code", "git", "repository", "developer", "octocat"] },
            { filename: "gitlab", alternatives: [], keywords: ["code", "git", "repository", "developer"] },
            { filename: "trello", alternatives: [], keywords: ["board", "kanban", "project", "tasks", "atlassian"] },
            { filename: "patreon", alternatives: [], keywords: ["membership", "support", "creator", "donate"] },
            { filename: "yelp", alternatives: [], keywords: ["reviews", "business", "local", "ratings"] },
            { filename: "google", alternatives: [], keywords: ["search", "brand", "g"] },
            { filename: "microsoft", alternatives: [], keywords: ["windows", "office", "tech"] },
            { filename: "apple", alternatives: [], keywords: ["mac", "ios", "iphone", "tech", "logo"] }
          ]
        }
      ];
      iconL10n = typeof window !== "undefined" && window.baselayerIcons || {};
      runtimeThemeCategory = Object.prototype.hasOwnProperty.call(iconL10n, "themeCategory") ? iconL10n.themeCategory : null;
      resolvedThemeCategory = runtimeThemeCategory && typeof runtimeThemeCategory === "object" ? runtimeThemeCategory : themeIconCategory;
      iconCategories = resolvedThemeCategory && Array.isArray(resolvedThemeCategory.icons) && resolvedThemeCategory.icons.length ? [resolvedThemeCategory, ...builtInCategories] : builtInCategories;
      allIcons = iconCategories.reduce((icons, category) => icons.concat(category.icons), []);
      hasVariant = (icon, variant) => !!icon && !!variant && icon.alternatives.indexOf(variant) !== -1;
      resolveIconName = (icon, variant) => variant && variant !== "outline" && hasVariant(icon, variant) ? `${icon.filename}-${variant}` : icon.filename;
      iconMatchesQuery = (icon, query, displayName = "") => {
        if (!query) {
          return true;
        }
        const haystack = [icon.filename, displayName].concat(icon.keywords).join(" ").toLowerCase();
        return haystack.indexOf(query) !== -1;
      };
      findIconByValue = (value) => {
        if (!value) {
          return null;
        }
        for (const icon of allIcons) {
          if (icon.filename === value) {
            return { icon, variant: "outline" };
          }
          for (const variant of icon.alternatives) {
            if (value === `${icon.filename}-${variant}`) {
              return { icon, variant };
            }
          }
        }
        return null;
      };
    }
  });

  // themes/baselayer/src/js/editor/icons/icon-variant.js
  var VARIANT_STORAGE_KEY, readStoredVariant, writeStoredVariant, resolvePickerVariant;
  var init_icon_variant = __esm({
    "themes/baselayer/src/js/editor/icons/icon-variant.js"() {
      init_icon_catalog();
      VARIANT_STORAGE_KEY = "baselayerIconVariant";
      readStoredVariant = () => {
        try {
          return window.localStorage.getItem(VARIANT_STORAGE_KEY) === "fill" ? "fill" : "outline";
        } catch {
          return "outline";
        }
      };
      writeStoredVariant = (variant) => {
        try {
          window.localStorage.setItem(VARIANT_STORAGE_KEY, variant);
        } catch {
        }
      };
      resolvePickerVariant = (value) => {
        const stored = readStoredVariant();
        const selected = findIconByValue(value);
        if (!selected) {
          return stored;
        }
        if (selected.variant !== "outline") {
          return selected.variant;
        }
        if (hasVariant(selected.icon, "fill")) {
          return "outline";
        }
        return stored;
      };
    }
  });

  // themes/baselayer/src/js/editor/icons/icon-picker-service.js
  var icon_picker_service_exports = {};
  __export(icon_picker_service_exports, {
    closeIconPicker: () => closeIconPicker,
    openIconPicker: () => openIconPicker
  });
  function createModal() {
    const modal = document.createElement("div");
    modal.className = "bl-icon-picker-modal";
    modal.hidden = true;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "bl-icon-picker-modal-title");
    modal.innerHTML = `
    <div class="bl-icon-picker-modal__backdrop" data-bl-icon-picker-close tabindex="-1"></div>
    <div class="bl-icon-picker-modal__panel">
      <header class="bl-icon-picker-modal__header">
        <h2 id="bl-icon-picker-modal-title" class="bl-icon-picker-modal__title">${t("choose", "Choose icon")}</h2>
        <button type="button" class="bl-icon-picker-modal__close" data-bl-icon-picker-close aria-label="${t("close", "Close")}">
          <span class="dashicons dashicons-no-alt" aria-hidden="true"></span>
        </button>
      </header>
      <div class="bl-icon-picker-modal__body bl-icon-picker__panel">
        <div class="bl-icon-picker__toolbar">
          <input type="search" class="bl-icon-picker-modal__search" data-bl-icon-picker-search placeholder="${t("search", "Search icons\u2026")}" autocomplete="off">
          <div class="bl-icon-picker__variant bl-icon-picker-modal__variant" role="group" aria-label="${t("style", "Style")}">
            <button type="button" class="bl-icon-picker__variant-btn" data-bl-icon-picker-variant="outline">${t("outline", "Outline")}</button>
            <button type="button" class="bl-icon-picker__variant-btn" data-bl-icon-picker-variant="fill">${t("filled", "Filled")}</button>
          </div>
        </div>
        <div class="bl-icon-picker__categories" data-bl-icon-picker-categories></div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
    return modal;
  }
  function createIconPickerService() {
    let modal = null;
    let value = "";
    let variant = readStoredVariant();
    let search = "";
    let onSelect = null;
    let focusTarget = null;
    let eventsBound = false;
    const ensureModal = () => {
      if (!modal) {
        modal = createModal();
        bindModalEvents();
      }
    };
    const syncVariantButtons = () => {
      modal.querySelectorAll("[data-bl-icon-picker-variant]").forEach((button) => {
        const isActive = button.getAttribute("data-bl-icon-picker-variant") === variant;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };
    const renderCategories = () => {
      const labels = iconLabels();
      const categories = categoryLabels();
      const query = search.trim().toLowerCase();
      const categoriesEl = modal.querySelector("[data-bl-icon-picker-categories]");
      categoriesEl.innerHTML = "";
      iconCategories.forEach((category) => {
        const icons = category.icons.filter((icon) => iconMatchesQuery(icon, query, iconName(icon, labels)));
        if (!icons.length) {
          return;
        }
        const section = document.createElement("div");
        section.className = "bl-icon-picker__category";
        const title = document.createElement("h3");
        title.className = "bl-icon-picker__category-title";
        title.textContent = categoryName(category, categories);
        section.appendChild(title);
        const grid = document.createElement("div");
        grid.className = "bl-icon-picker__grid";
        icons.forEach((icon) => {
          const resolved = resolveIconName(icon, variant);
          const name = iconName(icon, labels);
          const button = document.createElement("button");
          button.type = "button";
          button.className = "bl-icon-picker__item";
          button.title = name;
          button.setAttribute("aria-label", name);
          if (resolved === value) {
            button.classList.add("is-selected");
          }
          button.innerHTML = `<span class="bl-icon -icon-${resolved}" aria-hidden="true"></span>`;
          button.addEventListener("click", () => {
            value = resolved;
            if (typeof onSelect === "function") {
              onSelect(value);
            }
            close();
          });
          grid.appendChild(button);
        });
        section.appendChild(grid);
        categoriesEl.appendChild(section);
      });
    };
    const close = () => {
      if (!modal) {
        return;
      }
      modal.hidden = true;
      document.body.classList.remove("bl-icon-picker-modal-open");
      if (focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus();
      }
      focusTarget = null;
      onSelect = null;
    };
    const open = ({ currentValue = "", onSelect: selectHandler, returnFocus = null }) => {
      ensureModal();
      value = currentValue || "";
      onSelect = selectHandler;
      focusTarget = returnFocus;
      variant = resolvePickerVariant(value);
      search = "";
      modal.querySelector("[data-bl-icon-picker-search]").value = "";
      syncVariantButtons();
      renderCategories();
      document.body.appendChild(modal);
      modal.hidden = false;
      document.body.classList.add("bl-icon-picker-modal-open");
      modal.querySelector("[data-bl-icon-picker-search]").focus();
    };
    const bindModalEvents = () => {
      if (eventsBound) {
        return;
      }
      eventsBound = true;
      modal.querySelectorAll("[data-bl-icon-picker-close]").forEach((trigger) => {
        trigger.addEventListener("click", close);
      });
      modal.querySelector("[data-bl-icon-picker-search]").addEventListener("input", (event) => {
        search = event.target.value;
        renderCategories();
      });
      modal.querySelectorAll("[data-bl-icon-picker-variant]").forEach((button) => {
        button.addEventListener("click", () => {
          variant = button.getAttribute("data-bl-icon-picker-variant") || "outline";
          writeStoredVariant(variant);
          syncVariantButtons();
          renderCategories();
        });
      });
      modal.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
      });
    };
    return { open, close };
  }
  function openIconPicker({ currentValue = "", onSelect, returnFocus = null }) {
    iconPickerService.open({ currentValue, onSelect, returnFocus });
  }
  function closeIconPicker() {
    iconPickerService.close();
  }
  var iconL10n2, iconLabels, categoryLabels, uiStrings, t, humanize, iconName, categoryName, iconPickerService;
  var init_icon_picker_service = __esm({
    "themes/baselayer/src/js/editor/icons/icon-picker-service.js"() {
      init_icon_catalog();
      init_icon_variant();
      iconL10n2 = () => typeof window !== "undefined" && window.baselayerIcons || {};
      iconLabels = () => iconL10n2().labels || {};
      categoryLabels = () => iconL10n2().categories || {};
      uiStrings = () => iconL10n2().ui || {};
      t = (key, fallback) => uiStrings()[key] || fallback;
      humanize = (slug) => slug.replace(/-/g, " ").replace(/^\w/, (char) => char.toUpperCase());
      iconName = (icon, labels) => icon.label || labels[icon.filename] || humanize(icon.filename);
      categoryName = (category, labels) => category.label || labels[category.slug] || humanize(category.slug);
      iconPickerService = createIconPickerService();
    }
  });

  // themes/baselayer/packages/baselayer-blocks/src/js/block-options/shared/options-items-panel.js
  function fb() {
    return window.BlFormBuilder || {};
  }
  function canvasApi() {
    return window.BlCanvasBuilder || {};
  }
  function el(...args) {
    return fb().el(...args);
  }
  function t2(key, fallback) {
    return typeof fb().t === "function" ? fb().t(key, fallback) : fallback || key;
  }
  function iconEl(...args) {
    return typeof fb().iconEl === "function" ? fb().iconEl(...args) : el("span");
  }
  var GENERIC_TYPES = [
    { id: "boolean", labelKey: "optionTypeToggle", labelFallback: "Toggle" },
    { id: "select", labelKey: "optionTypeSelect", labelFallback: "Select" },
    { id: "button-group", labelKey: "optionTypeButtonGroup", labelFallback: "Button group" },
    { id: "icon", labelKey: "optionTypeIcon", labelFallback: "Icon" }
  ];
  var SIZE_TOKENS = [
    { value: "", label: "\u2014" },
    { value: "none", label: "0" },
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" }
  ];
  var ALIGN_TOKENS = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" }
  ];
  function sizeTokensFromParam(paramDef) {
    const choices = paramDef?.choices;
    if (choices && typeof choices === "object" && !Array.isArray(choices)) {
      return Object.entries(choices).map(([value, label]) => ({
        value,
        label: String(label)
      }));
    }
    return SIZE_TOKENS;
  }
  function newId(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }
  function slugifyAttr(text) {
    const base = String(text || "").trim().toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").replace(/_+/g, "_");
    if (!base) {
      return "blockOption";
    }
    const parts = base.split("_").filter(Boolean);
    return parts[0] + parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
  }
  var panelOptions = {
    allowCustoms: false,
    allowPresetRefs: true,
    customs: null,
    presets: null,
    helpText: void 0,
    emptyText: null
  };
  function customsCatalog() {
    const raw = typeof panelOptions.customs === "function" ? panelOptions.customs() : panelOptions.customs;
    if (raw && typeof raw === "object") {
      return raw;
    }
    return window.blBlocksAdmin?.blockOptionCustoms || {};
  }
  function presetsCatalog() {
    const raw = typeof panelOptions.presets === "function" ? panelOptions.presets() : panelOptions.presets;
    if (Array.isArray(raw)) {
      return raw;
    }
    return Array.isArray(window.blBlocksAdmin?.blockOptionPresets) ? window.blBlocksAdmin.blockOptionPresets : [];
  }
  function isCustomType(type) {
    return !!customsCatalog()[type];
  }
  function defaultCustom(type) {
    const def = customsCatalog()[type] || {};
    return {
      id: newId("c"),
      kind: "control",
      type,
      ...def.defaults ? JSON.parse(JSON.stringify(def.defaults)) : {}
    };
  }
  function canOverridePresetParam(controlType, key) {
    if (key === "label") {
      return false;
    }
    return true;
  }
  function optionIconKey(item) {
    if (item?.kind === "preset") {
      return "box";
    }
    const type = item?.type || "";
    if (isCustomType(type)) {
      return "extensions";
    }
    if (type === "boolean") {
      return "toggle";
    }
    if (type === "button-group") {
      return "button_group";
    }
    return type || "text";
  }
  function optionPreviewTitle(item) {
    if (item?.kind === "preset") {
      const preset = presetsCatalog().find((p) => p.slug === item.slug);
      return (preset?.label || item.slug || "").trim();
    }
    return String(item?.label || "").trim();
  }
  function defaultGeneric(type) {
    if (type === "boolean") {
      return {
        id: newId("c"),
        kind: "control",
        type: "boolean",
        label: "Option",
        toggleLabel: "Enable",
        attributeName: "customOption",
        className: "",
        default: false
      };
    }
    if (type === "icon") {
      return {
        id: newId("c"),
        kind: "control",
        type: "icon",
        label: "Icon",
        attributeName: "customIcon",
        default: ""
      };
    }
    return {
      id: newId("c"),
      kind: "control",
      type,
      label: type === "button-group" ? "Choice" : "Select",
      attributeName: type === "button-group" ? "customChoice" : "customSelect",
      default: "",
      options: type === "button-group" ? [
        { label: "A", value: "", icon: "" },
        { label: "B", value: "-option-b", icon: "" }
      ] : [
        { label: "A", value: "" },
        { label: "B", value: "-option-b" }
      ]
    };
  }
  function defaultPresetRef(slug) {
    return {
      id: newId("p"),
      kind: "preset",
      slug: slug || "",
      defaults: {}
    };
  }
  function typeLabel(item) {
    if (item?.kind === "preset") {
      return t2("optionTypePreset", "Preset");
    }
    if (isCustomType(item?.type)) {
      return customsCatalog()[item.type]?.label || item.type;
    }
    const row = GENERIC_TYPES.find((o) => o.id === item?.type);
    return row ? t2(row.labelKey, row.labelFallback) : item?.type || "";
  }
  function createOptionsPanel(initial, onChange, options = {}) {
    panelOptions = {
      allowCustoms: !!options.allowCustoms,
      allowPresetRefs: options.allowPresetRefs !== false,
      customs: options.customs ?? null,
      presets: options.presets ?? null,
      helpText: options.helpText,
      emptyText: options.emptyText || null
    };
    let items = Array.isArray(initial?.items) ? JSON.parse(JSON.stringify(initial.items)) : [];
    const manualAttr = /* @__PURE__ */ new Set();
    items.forEach((item) => {
      if (item && item.kind === "control" && item.attributeName && !isCustomType(item.type)) {
        manualAttr.add(item.id);
      }
    });
    const panel = el("div", {
      className: "bl-blocks-options-panel",
      dataset: { blFormsPanel: "options" }
    });
    const canvas = el("div", { className: "bl-forms-builder__canvas bl-bo-canvas" });
    const list = el("div", { className: "bl-forms-builder__list bl-bo-stack" });
    const emptyMessage = panelOptions.emptyText || (panelOptions.allowPresetRefs ? t2("blockOptionsEmpty", "No options yet. Add a control or attach a preset.") : t2("presetItemsEmpty", "No options yet. Add a control."));
    const empty = el("p", {
      className: "bl-forms-builder__empty bl-bo-stack__empty",
      text: emptyMessage
    });
    canvas.append(list, empty);
    let openItemId = null;
    let sortable = null;
    const sync = () => {
      onChange({ items: JSON.parse(JSON.stringify(items)) });
    };
    const indexOf = (id) => items.findIndex((row) => row.id === id);
    const removeById = (id) => {
      const index = indexOf(id);
      if (index < 0) {
        return;
      }
      items.splice(index, 1);
      if (openItemId === id) {
        openItemId = null;
      }
      sync();
      render();
    };
    const patchById = (id, next) => {
      const index = indexOf(id);
      if (index < 0) {
        return;
      }
      items[index] = next;
      sync();
    };
    const replaceById = (id, next) => {
      const index = indexOf(id);
      if (index < 0) {
        return;
      }
      items[index] = next;
      openItemId = next.id || id;
      sync();
      render();
    };
    function renderParamField(paramKey, paramDef, value, onUpdate) {
      const ptype = paramDef?.type || "text";
      const label = paramDef?.label || paramKey;
      if (ptype === "boolean") {
        const check = el("input", { type: "checkbox", checked: !!value });
        check.addEventListener("change", () => onUpdate(check.checked));
        return el("label", { className: "bl-bo-check" }, [
          check,
          document.createTextNode(" " + label)
        ]);
      }
      if (ptype === "size" || ptype === "align") {
        const tokens = ptype === "size" ? sizeTokensFromParam(paramDef) : ALIGN_TOKENS;
        const select = el("select");
        tokens.forEach((tok) => {
          select.appendChild(
            el("option", {
              value: tok.value,
              text: tok.label,
              selected: value === tok.value ? true : void 0
            })
          );
        });
        select.value = value ?? (ptype === "align" ? "center" : "");
        select.addEventListener("change", () => onUpdate(select.value));
        return el("div", { className: "bl-bo-field" }, [el("label", { text: label }), select]);
      }
      return el("div", { className: "bl-bo-field" }, [
        el("label", { text: label }),
        el("input", {
          type: "text",
          value: value ?? "",
          onInput: (e) => onUpdate(e.target.value)
        })
      ]);
    }
    function renderDescriptionField(value, onUpdate) {
      const textarea = el("textarea", {
        className: "widefat",
        rows: 2,
        text: value || ""
      });
      textarea.addEventListener("input", () => onUpdate(textarea.value));
      return el("div", { className: "bl-bo-field" }, [
        el("label", { text: t2("optionDescription", "Description") }),
        textarea
      ]);
    }
    function patchPresetDefault(item, controlId, patch) {
      const defaults = { ...item.defaults || {} };
      defaults[controlId] = { ...defaults[controlId] || {}, ...patch };
      const next = { ...item, defaults };
      patchById(item.id, next);
      Object.assign(item, next);
    }
    function renderCustomParams(item) {
      const wrap = el("div", { className: "bl-bo-custom-params" });
      const def = customsCatalog()[item.type];
      if (!def?.params) {
        return wrap;
      }
      Object.entries(def.params).forEach(([key, paramDef]) => {
        wrap.appendChild(
          renderParamField(key, paramDef, item[key], (nextVal) => {
            const next = { ...item, [key]: nextVal };
            patchById(item.id, next);
            Object.assign(item, next);
            if (key === "label") {
              list.querySelector(`[data-option-id="${CSS.escape(item.id)}"]`)?._blUpdatePreview?.();
            }
          })
        );
      });
      return wrap;
    }
    function renderChoices(item) {
      const wrap = el("div", { className: "bl-bo-choices bl-admin-form" });
      const showIconPicker = item.type === "button-group";
      (item.options || []).forEach((opt, oi) => {
        const children = [
          el("input", {
            type: "text",
            className: "bl-bo-choice__label",
            value: opt.label || "",
            placeholder: t2("choiceLabel", "Label"),
            onInput: (e) => {
              const options2 = JSON.parse(JSON.stringify(item.options || []));
              options2[oi] = { ...options2[oi], label: e.target.value };
              patchById(item.id, { ...item, options: options2 });
              item.options = options2;
            }
          }),
          el("input", {
            type: "text",
            className: "bl-bo-choice__value",
            value: opt.value || "",
            placeholder: t2("choiceValue", "Value / class"),
            onInput: (e) => {
              const options2 = JSON.parse(JSON.stringify(item.options || []));
              options2[oi] = { ...options2[oi], value: e.target.value };
              patchById(item.id, { ...item, options: options2 });
              item.options = options2;
            }
          })
        ];
        if (showIconPicker) {
          let currentIcon = String(opt.icon || "");
          const pickBtn = el("button", {
            type: "button",
            className: "bl-bo-choice__icon-btn",
            title: t2("chooseIcon", "Choose icon"),
            "aria-label": t2("chooseIcon", "Choose icon")
          });
          const clearBtn = el("button", {
            type: "button",
            className: "bl-bo-choice__icon-clear",
            title: t2("clearIcon", "Clear icon"),
            "aria-label": t2("clearIcon", "Clear icon")
          });
          const clearIcon = typeof iconEl === "function" ? iconEl("close") : null;
          if (clearIcon?.innerHTML) {
            clearBtn.appendChild(clearIcon);
          } else {
            clearBtn.textContent = "\xD7";
          }
          const iconUnit = el("div", { className: "bl-bo-choice__icon" }, [pickBtn, clearBtn]);
          const syncIconPreview = (slug) => {
            currentIcon = slug || "";
            iconUnit.classList.toggle("has-icon", !!currentIcon);
            pickBtn.replaceChildren();
            if (currentIcon) {
              pickBtn.appendChild(
                el("span", { className: "bl-icon -icon-" + currentIcon, "aria-hidden": "true" })
              );
            } else {
              pickBtn.appendChild(
                el("span", {
                  className: "bl-bo-choice__icon-label",
                  text: t2("icon", "Icon")
                })
              );
            }
          };
          const commitIcon = (slug) => {
            syncIconPreview(slug);
            const options2 = JSON.parse(JSON.stringify(item.options || []));
            options2[oi] = { ...options2[oi], icon: slug || "" };
            patchById(item.id, { ...item, options: options2 });
            item.options = options2;
          };
          syncIconPreview(currentIcon);
          pickBtn.addEventListener("click", async (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            try {
              const { openIconPicker: openIconPicker2 } = await Promise.resolve().then(() => (init_icon_picker_service(), icon_picker_service_exports));
              openIconPicker2({
                currentValue: currentIcon || "",
                returnFocus: pickBtn,
                onSelect: (iconName2) => commitIcon(iconName2 || "")
              });
            } catch (err) {
            }
          });
          clearBtn.addEventListener("click", (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            commitIcon("");
          });
          children.push(iconUnit);
        }
        const deleteBtn = el("button", {
          type: "button",
          className: "bl-bo-choice__remove",
          title: t2("delete", "Delete"),
          "aria-label": t2("delete", "Delete"),
          onClick: () => {
            const options2 = JSON.parse(JSON.stringify(item.options || []));
            options2.splice(oi, 1);
            replaceById(item.id, { ...item, options: options2 });
          }
        });
        const removeIcon = typeof iconEl === "function" ? iconEl("close") : null;
        if (removeIcon?.innerHTML) {
          deleteBtn.appendChild(removeIcon);
        } else {
          deleteBtn.textContent = "\xD7";
        }
        children.push(deleteBtn);
        wrap.appendChild(el("div", { className: "bl-bo-choice" }, children));
      });
      wrap.appendChild(
        el("button", {
          type: "button",
          className: "button button-small bl-bo-choices__add",
          text: t2("addChoice", "Add choice"),
          onClick: () => {
            const options2 = JSON.parse(JSON.stringify(item.options || []));
            const next = item.type === "button-group" ? { label: "Option", value: "", icon: "" } : { label: "Option", value: "" };
            options2.push(next);
            replaceById(item.id, { ...item, options: options2 });
          }
        })
      );
      return wrap;
    }
    function setOpen(row, header, nextOpen) {
      if (nextOpen) {
        list.querySelectorAll(":scope > .bl-forms-builder__field.is-open").forEach((other) => {
          if (other === row) {
            return;
          }
          other.classList.remove("is-open");
          const otherHeader = other.querySelector(":scope > .bl-forms-builder__field-header");
          if (otherHeader) {
            otherHeader.setAttribute("aria-expanded", "false");
            otherHeader.setAttribute("aria-label", t2("expandField", "Expand field"));
          }
        });
        openItemId = row.dataset.optionId || null;
      } else if (openItemId === row.dataset.optionId) {
        openItemId = null;
      }
      row.classList.toggle("is-open", nextOpen);
      header.setAttribute("aria-expanded", nextOpen ? "true" : "false");
      header.setAttribute(
        "aria-label",
        nextOpen ? t2("collapseField", "Collapse field") : t2("expandField", "Expand field")
      );
    }
    function wrapOptionCard(item, editor) {
      const open = openItemId === item.id;
      const row = el("div", {
        className: "bl-forms-builder__field bl-bo-option" + (item.kind === "preset" ? " bl-bo-option--preset" : "") + (open ? " is-open" : ""),
        dataset: { optionId: item.id }
      });
      const preview = el("span", { className: "bl-forms-builder__preview" });
      const updatePreview = () => {
        const title = optionPreviewTitle(item);
        preview.textContent = title;
        preview.hidden = title === "";
      };
      updatePreview();
      row._blUpdatePreview = updatePreview;
      const typeChip = el("span", { className: "bl-forms-builder__field-type" }, [
        iconEl(optionIconKey(item), "bl-forms-builder__field-type-icon"),
        el("span", {
          className: "bl-forms-builder__field-type-label",
          text: typeLabel(item)
        })
      ]);
      const deleteBtn = el("button", {
        type: "button",
        className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger",
        title: t2("delete", "Delete"),
        "aria-label": t2("delete", "Delete"),
        onClick: (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          removeById(item.id);
        }
      });
      const trashIcon = typeof iconEl === "function" ? iconEl("trash") : el("span");
      if (trashIcon.innerHTML) {
        deleteBtn.appendChild(trashIcon);
      } else {
        deleteBtn.textContent = "\xD7";
      }
      const handle = el("span", {
        className: "bl-forms-builder__handle",
        title: t2("dragField", "Drag to reorder"),
        "aria-hidden": "true"
      });
      const dragIcon = typeof iconEl === "function" ? iconEl("drag") : el("span");
      if (dragIcon.innerHTML) {
        handle.appendChild(dragIcon);
      } else {
        handle.textContent = "\u22EE\u22EE";
      }
      handle.addEventListener("click", (evt) => {
        evt.stopPropagation();
      });
      const header = el(
        "div",
        {
          className: "bl-forms-builder__field-header bl-forms-builder__field-header--expandable",
          role: "button",
          tabindex: "0",
          "aria-expanded": open ? "true" : "false",
          "aria-label": open ? t2("collapseField", "Collapse field") : t2("expandField", "Expand field")
        },
        [
          handle,
          preview,
          el("div", { className: "bl-forms-builder__field-meta" }, [typeChip]),
          el("div", { className: "bl-forms-builder__field-actions" }, [deleteBtn])
        ]
      );
      header.addEventListener("click", (evt) => {
        if (evt.target.closest(".bl-forms-builder__icon-btn, .bl-forms-builder__handle")) {
          return;
        }
        setOpen(row, header, !row.classList.contains("is-open"));
      });
      header.addEventListener("keydown", (evt) => {
        if (evt.target !== header || evt.key !== "Enter" && evt.key !== " ") {
          return;
        }
        evt.preventDefault();
        setOpen(row, header, !row.classList.contains("is-open"));
      });
      const body = el("div", { className: "bl-forms-builder__field-body" }, [
        el("div", { className: "bl-bo-option__editor" }, [editor])
      ]);
      row.append(header, body);
      return row;
    }
    function renderPresetEditor(item) {
      const editor = el("div", { className: "bl-bo-option__fields" });
      const presets = presetsCatalog();
      const slugSelect = el("select", { className: "bl-bo-card__type" });
      if (presets.length === 0) {
        slugSelect.appendChild(
          el("option", {
            value: "",
            text: t2("noPresetsYet", "No presets yet \u2014 create some under Block Options \u2192 Presets")
          })
        );
      } else {
        presets.forEach((preset) => {
          slugSelect.appendChild(
            el("option", {
              value: preset.slug,
              text: preset.label || preset.slug,
              selected: item.slug === preset.slug ? true : void 0
            })
          );
        });
        if (item.slug && !presets.some((p) => p.slug === item.slug)) {
          slugSelect.appendChild(
            el("option", { value: item.slug, text: item.slug + " (missing)", selected: true })
          );
        }
        slugSelect.value = item.slug || presets[0].slug;
      }
      slugSelect.addEventListener("change", () => {
        replaceById(item.id, { ...item, slug: slugSelect.value, defaults: {} });
      });
      editor.appendChild(
        el("div", { className: "bl-bo-field" }, [
          el("label", { text: t2("choosePreset", "Preset") }),
          slugSelect
        ])
      );
      const selected = presets.find((p) => p.slug === (slugSelect.value || item.slug));
      const controls = Array.isArray(selected?.items) ? selected.items.filter((c) => c && c.kind === "control") : [];
      if (controls.length > 0) {
        editor.appendChild(
          el("p", {
            className: "description",
            text: t2("presetDefaultsHelp", "Optional default overrides for this block:")
          })
        );
        controls.forEach((control) => {
          const section = el("div", { className: "bl-bo-preset-defaults" });
          const title = control.label || customsCatalog()[control.type]?.label || control.type || control.id;
          section.appendChild(el("strong", { text: title }));
          const controlId = control.id;
          const overrideLabel = item.defaults?.[controlId]?.label !== void 0 ? item.defaults[controlId].label : control.label || "";
          const overrideDescription = item.defaults?.[controlId]?.description !== void 0 ? item.defaults[controlId].description : control.description || "";
          section.appendChild(
            el("div", { className: "bl-bo-field" }, [
              el("label", { text: t2("optionLabel", "Label") }),
              el("input", {
                type: "text",
                value: overrideLabel,
                onInput: (e) => patchPresetDefault(item, controlId, { label: e.target.value })
              })
            ])
          );
          section.appendChild(
            renderDescriptionField(
              overrideDescription,
              (nextVal) => patchPresetDefault(item, controlId, { description: nextVal })
            )
          );
          if (isCustomType(control.type)) {
            const def = customsCatalog()[control.type];
            Object.entries(def?.params || {}).forEach(([key, paramDef]) => {
              if (!canOverridePresetParam(control.type, key)) {
                return;
              }
              const current = item.defaults?.[control.id]?.[key] !== void 0 ? item.defaults[control.id][key] : control[key];
              section.appendChild(
                renderParamField(key, paramDef, current, (nextVal) => {
                  patchPresetDefault(item, control.id, { [key]: nextVal });
                })
              );
            });
          } else if (control.type === "boolean") {
            const check = el("input", {
              type: "checkbox",
              checked: !!(item.defaults?.[control.id]?.default ?? control.default)
            });
            check.addEventListener("change", () => {
              patchPresetDefault(item, control.id, { default: check.checked });
            });
            section.appendChild(
              el("label", { className: "bl-bo-check" }, [
                check,
                document.createTextNode(" " + t2("defaultOn", "On by default"))
              ])
            );
          } else if (control.type === "select" || control.type === "button-group") {
            const select = el("select");
            (control.options || []).forEach((opt) => {
              select.appendChild(
                el("option", {
                  value: opt.value ?? "",
                  text: opt.label || opt.value || "\u2014"
                })
              );
            });
            select.value = item.defaults?.[control.id]?.default ?? control.default ?? "";
            select.addEventListener("change", () => {
              patchPresetDefault(item, control.id, { default: select.value });
            });
            section.appendChild(
              el("div", { className: "bl-bo-field" }, [
                el("label", { text: t2("defaultValue", "Default") }),
                select
              ])
            );
          }
          editor.appendChild(section);
        });
      }
      return editor;
    }
    function buildTypeSelect(item) {
      if (!panelOptions.allowCustoms && isCustomType(item.type)) {
        return el("input", {
          type: "text",
          value: customsCatalog()[item.type]?.label || item.type,
          readOnly: true,
          disabled: true
        });
      }
      const typeSelect = el("select", { className: "bl-bo-card__type" });
      if (panelOptions.allowCustoms) {
        const defaultGroup = el("optgroup", {
          label: t2("optionGroupDefault", "Default")
        });
        GENERIC_TYPES.forEach((row) => {
          defaultGroup.appendChild(
            el("option", {
              value: row.id,
              text: t2(row.labelKey, row.labelFallback),
              selected: item.type === row.id ? true : void 0
            })
          );
        });
        typeSelect.appendChild(defaultGroup);
        const customEntries = Object.entries(customsCatalog());
        if (customEntries.length > 0) {
          const customGroup = el("optgroup", {
            label: t2("optionGroupCustom", "Custom")
          });
          customEntries.forEach(([type, def]) => {
            customGroup.appendChild(
              el("option", {
                value: type,
                text: def.label || type,
                selected: item.type === type ? true : void 0
              })
            );
          });
          typeSelect.appendChild(customGroup);
        }
      } else {
        GENERIC_TYPES.forEach((row) => {
          typeSelect.appendChild(
            el("option", {
              value: row.id,
              text: t2(row.labelKey, row.labelFallback),
              selected: item.type === row.id ? true : void 0
            })
          );
        });
      }
      typeSelect.value = item.type;
      typeSelect.addEventListener("change", () => {
        const type = typeSelect.value;
        const next = panelOptions.allowCustoms && isCustomType(type) ? defaultCustom(type) : defaultGeneric(type);
        next.id = item.id;
        replaceById(item.id, next);
      });
      return typeSelect;
    }
    function renderControlEditor(item) {
      const editor = el("div", { className: "bl-bo-option__fields" });
      const custom = isCustomType(item.type);
      editor.appendChild(
        el("div", { className: "bl-bo-field" }, [
          el("label", { text: t2("optionType", "Type") }),
          buildTypeSelect(item)
        ])
      );
      if (custom) {
        editor.appendChild(renderCustomParams(item));
        editor.appendChild(
          renderDescriptionField(item.description || "", (nextVal) => {
            const next = { ...item, description: nextVal };
            patchById(item.id, next);
            Object.assign(item, next);
          })
        );
        return editor;
      }
      const attrInput = el("input", {
        type: "text",
        value: item.attributeName || "",
        onInput: (e) => {
          manualAttr.add(item.id);
          const next = { ...item, attributeName: e.target.value };
          patchById(item.id, next);
          Object.assign(item, next);
        }
      });
      editor.appendChild(
        el("div", { className: "bl-bo-field" }, [
          el("label", { text: t2("optionLabel", "Label") }),
          el("input", {
            type: "text",
            value: item.label || "",
            onInput: (e) => {
              const label = e.target.value;
              const next = { ...item, label };
              if (!manualAttr.has(item.id)) {
                next.attributeName = slugifyAttr(label);
              }
              patchById(item.id, next);
              Object.assign(item, next);
              if (!manualAttr.has(item.id)) {
                attrInput.value = next.attributeName;
              }
              const row = list.querySelector(`[data-option-id="${item.id}"]`);
              row?._blUpdatePreview?.();
            }
          })
        ])
      );
      editor.appendChild(
        renderDescriptionField(item.description || "", (nextVal) => {
          const next = { ...item, description: nextVal };
          patchById(item.id, next);
          Object.assign(item, next);
        })
      );
      editor.appendChild(
        el("div", { className: "bl-bo-field" }, [
          el("label", { text: t2("attributeName", "Attribute name") }),
          attrInput
        ])
      );
      if (item.type === "boolean") {
        editor.appendChild(
          el("div", { className: "bl-bo-field" }, [
            el("label", { text: t2("toggleLabel", "Toggle label") }),
            el("input", {
              type: "text",
              value: item.toggleLabel || "",
              onInput: (e) => {
                const next = { ...item, toggleLabel: e.target.value };
                patchById(item.id, next);
                Object.assign(item, next);
              }
            })
          ])
        );
        editor.appendChild(
          el("div", { className: "bl-bo-field" }, [
            el("label", { text: t2("classWhenOn", "CSS class when on") }),
            el("input", {
              type: "text",
              value: item.className || "",
              onInput: (e) => {
                const next = { ...item, className: e.target.value };
                patchById(item.id, next);
                Object.assign(item, next);
              }
            })
          ])
        );
        const defCheck = el("input", { type: "checkbox", checked: !!item.default });
        defCheck.addEventListener("change", () => {
          const next = { ...item, default: defCheck.checked };
          patchById(item.id, next);
          Object.assign(item, next);
        });
        editor.appendChild(
          el("label", { className: "bl-bo-check" }, [
            defCheck,
            document.createTextNode(" " + t2("defaultOn", "On by default"))
          ])
        );
      }
      if (item.type === "select" || item.type === "button-group") {
        editor.appendChild(
          el("div", { className: "bl-bo-field" }, [
            el("label", { text: t2("choices", "Choices") }),
            renderChoices(item)
          ])
        );
      }
      return editor;
    }
    function renderCard(item) {
      if (item?.kind === "preset") {
        return wrapOptionCard(item, renderPresetEditor(item));
      }
      return wrapOptionCard(item, renderControlEditor(item));
    }
    function bindSortable() {
      const Canvas = canvasApi();
      if (sortable && typeof sortable.destroy === "function") {
        sortable.destroy();
        sortable = null;
      }
      if (typeof Canvas.createSortable !== "function" || items.length === 0) {
        return;
      }
      sortable = Canvas.createSortable(list, {
        handle: ".bl-forms-builder__handle",
        draggable: ".bl-forms-builder__field",
        animation: 150,
        onStart: () => {
          if (typeof Canvas.dragStart === "function") {
            Canvas.dragStart();
          }
        },
        onEnd: () => {
          if (typeof Canvas.dragEnd === "function") {
            Canvas.dragEnd();
          }
          const ordered = [];
          list.querySelectorAll(":scope > [data-option-id]").forEach((row) => {
            const found = items.find((i) => i.id === row.dataset.optionId);
            if (found) {
              ordered.push(found);
            }
          });
          if (ordered.length === items.length) {
            items = ordered;
            sync();
          }
        }
      });
    }
    function render() {
      list.replaceChildren();
      empty.hidden = items.length > 0;
      items.forEach((item) => {
        list.appendChild(renderCard(item));
      });
      bindSortable();
    }
    const addRow = el("div", { className: "bl-bo-add" });
    const makeAddButton = (label, onClick) => el("button", {
      type: "button",
      className: "button button-secondary bl-button -has-icon -icon-add bl-bo-add__btn",
      onClick
    }, [label]);
    addRow.appendChild(
      makeAddButton(t2("addOption", "Add option"), () => {
        const next = defaultGeneric("boolean");
        items.push(next);
        openItemId = next.id;
        sync();
        render();
      })
    );
    if (panelOptions.allowPresetRefs) {
      addRow.appendChild(
        makeAddButton(t2("addPresetRef", t2("addPreset", "Preset")), () => {
          const presets = presetsCatalog();
          if (presets.length === 0) {
            window.alert(
              t2("noPresetsYet", "No presets yet \u2014 create some under Block Options \u2192 Presets")
            );
            return;
          }
          const next = defaultPresetRef(presets[0].slug);
          items.push(next);
          openItemId = next.id;
          sync();
          render();
        })
      );
    }
    const helpText = panelOptions.helpText === false || panelOptions.helpText === null ? null : panelOptions.helpText !== void 0 ? panelOptions.helpText : t2(
      "blockOptionsHelp",
      "These controls appear in the block sidebar in the editor."
    );
    if (helpText) {
      panel.appendChild(el("p", { className: "description", text: helpText }));
    }
    panel.append(canvas, addRow);
    render();
    return {
      panel,
      getBlockOptions: () => ({ items: JSON.parse(JSON.stringify(items)) }),
      setBlockOptions: (next) => {
        items = Array.isArray(next?.items) ? JSON.parse(JSON.stringify(next.items)) : [];
        openItemId = null;
        sync();
        render();
      }
    };
  }

  // themes/baselayer/src/js/admin/utils/block-type-icon.js
  function fallbackDashicon() {
    const span = document.createElement("span");
    span.className = "dashicons dashicons-block-default";
    return span;
  }
  function appendStringIcon(host, icon) {
    if (typeof icon !== "string" || icon.trim() === "") {
      return false;
    }
    if (icon.trim().startsWith("<svg")) {
      host.innerHTML = icon;
      return true;
    }
    const slug = icon.startsWith("dashicons-") ? icon : `dashicons-${icon}`;
    const span = document.createElement("span");
    span.className = `dashicons ${slug}`;
    host.appendChild(span);
    return true;
  }
  function mountReactIcon(host, icon) {
    const BlockIcon = window.wp?.blockEditor?.BlockIcon;
    const createElement = window.wp?.element?.createElement;
    if (!BlockIcon || !createElement || !icon) {
      host.appendChild(fallbackDashicon());
      return;
    }
    const reactEl = createElement(BlockIcon, { icon, showColors: false });
    if (typeof window.wp.element.createRoot === "function") {
      window.wp.element.createRoot(host).render(reactEl);
      return;
    }
    if (typeof window.wp.element.render === "function") {
      window.wp.element.render(reactEl, host);
      return;
    }
    host.appendChild(fallbackDashicon());
  }
  function paintBlockTypeIcon(host, blockName, serverIcon = null) {
    host.replaceChildren();
    if (typeof serverIcon === "string" && serverIcon.trim().startsWith("<svg")) {
      appendStringIcon(host, serverIcon);
      return;
    }
    const clientIcon = window.wp?.blocks?.getBlockType?.(blockName)?.icon;
    if (clientIcon) {
      if (typeof clientIcon === "string") {
        if (!appendStringIcon(host, clientIcon)) {
          host.appendChild(fallbackDashicon());
        }
        return;
      }
      const mount = document.createElement("span");
      mount.className = "bl-block-type-icon__react";
      host.appendChild(mount);
      mountReactIcon(mount, clientIcon);
      return;
    }
    if (appendStringIcon(host, serverIcon)) {
      return;
    }
    host.appendChild(fallbackDashicon());
  }
  function createBlockTypeIconEl(blockName, serverIcon = null, className = "bl-bo-block-icon") {
    const wrap = document.createElement("span");
    wrap.className = className;
    wrap.setAttribute("aria-hidden", "true");
    paintBlockTypeIcon(wrap, blockName, serverIcon);
    return wrap;
  }
  function whenBlockTypesReady(callback) {
    let done = false;
    const ready = () => {
      const type = window.wp?.blocks?.getBlockType?.("core/paragraph");
      return !!(type && type.icon);
    };
    const run = () => {
      if (done) {
        return;
      }
      done = true;
      callback();
    };
    if (ready()) {
      run();
      return;
    }
    const start = () => {
      if (ready()) {
        run();
        return;
      }
      if (!window.wp?.data?.subscribe) {
        run();
        return;
      }
      const unsub = window.wp.data.subscribe(() => {
        if (ready()) {
          unsub();
          run();
        }
      });
      window.setTimeout(() => {
        try {
          unsub();
        } catch (e) {
        }
        run();
      }, 4e3);
    };
    if (window.wp?.domReady) {
      window.wp.domReady(start);
    } else if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/block-options/admin.js
  function boot() {
    const root = document.getElementById("bl-block-options-app");
    if (!root) {
      return;
    }
    const cfg = window.blBlockOptionsAdmin || {};
    const i18n = cfg.i18n || {};
    const t3 = (key, fallback) => i18n[key] || fallback;
    const customs = cfg.customs || {};
    const iconEl2 = typeof window.BlFormBuilder?.iconEl === "function" ? window.BlFormBuilder.iconEl : null;
    let presets = Array.isArray(cfg.presets) ? JSON.parse(JSON.stringify(cfg.presets)) : [];
    let blocks = Array.isArray(cfg.blocks) ? JSON.parse(JSON.stringify(cfg.blocks)) : [];
    let availableBlocks = Array.isArray(cfg.availableBlocks) ? JSON.parse(JSON.stringify(cfg.availableBlocks)) : [];
    let activeMain = "blocks";
    let activeBlockSource = "all";
    let editingPreset = null;
    const slugManual = new Set(presets.map((p) => p.slug).filter(Boolean));
    let editingBlockName = null;
    let savingBlock = false;
    let savingPreset = false;
    let addingBlock = false;
    let selectedAddBlock = "";
    let blockListQuery = "";
    let blocksDirty = false;
    let statusMessage = null;
    const blockSources = [
      {
        id: "all",
        label: t3("tabAll", "All"),
        empty: t3(
          "emptyAll",
          "No blocks with options yet. Add a block below."
        ),
        prefix: null
      }
    ];
    if (cfg.hasBaselayer) {
      blockSources.push({
        id: "baselayer",
        label: t3("tabBaselayer", "BaseLayer"),
        empty: t3("emptyBaselayer", ""),
        prefix: "baselayer/"
      });
    }
    if (cfg.hasAcf) {
      blockSources.push({
        id: "acf",
        label: t3("tabAcf", "ACF"),
        empty: t3("emptyAcf", ""),
        prefix: "acf/"
      });
    }
    blockSources.push({
      id: "core",
      label: t3("tabCore", "Core"),
      empty: t3("emptySystem", ""),
      prefix: "core/"
    });
    const mainTabs = [
      { id: "blocks", label: t3("tabBlocks", "Blocks") },
      { id: "presets", label: t3("tabPresets", "Presets") }
    ];
    function currentBlockSource() {
      return blockSources.find((s) => s.id === activeBlockSource) || blockSources[0];
    }
    function el2(tag, attrs = {}, children = []) {
      const node = document.createElement(tag);
      Object.entries(attrs || {}).forEach(([key, value]) => {
        if (value == null || value === false) {
          return;
        }
        if (key === "className") {
          node.className = value;
        } else if (key === "text") {
          node.textContent = value;
        } else if (key === "style" && typeof value === "string") {
          node.setAttribute("style", value);
        } else if (key === "dataset" && value && typeof value === "object") {
          Object.entries(value).forEach(([dataKey, dataValue]) => {
            if (dataValue != null && dataValue !== false) {
              node.dataset[dataKey] = String(dataValue);
            }
          });
        } else if (key.startsWith("on") && typeof value === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
          node.setAttribute(key, value === true ? "" : String(value));
        }
      });
      (Array.isArray(children) ? children : [children]).forEach((child) => {
        if (child == null || child === false) {
          return;
        }
        node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
      });
      return node;
    }
    function slugify(text) {
      return String(text || "").trim().toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
    }
    function uniqueSlug(base, excludeSlug = null) {
      let slug = slugify(base) || "preset";
      const used = new Set(
        presets.map((p) => p.slug).filter((s) => s && s !== excludeSlug)
      );
      if (!used.has(slug)) {
        return slug;
      }
      let i = 2;
      while (used.has(`${slug}-${i}`)) {
        i += 1;
      }
      return `${slug}-${i}`;
    }
    function findPreset(slug) {
      return presets.find((p) => p.slug === slug);
    }
    function findBlock(name) {
      return blocks.find((b) => b.name === name);
    }
    function matchesSource(name, tab) {
      const blockName = String(name || "");
      if (!tab) {
        return false;
      }
      if (!tab.prefix) {
        const prefixes = blockSources.map((s) => s.prefix).filter(Boolean);
        return prefixes.some((prefix) => blockName.startsWith(prefix));
      }
      return blockName.startsWith(tab.prefix);
    }
    function blocksForTab(tab) {
      return blocks.filter((b) => matchesSource(b.name, tab));
    }
    function availableBlocksForTab(tab) {
      return availableBlocks.filter((b) => matchesSource(b.name, tab));
    }
    function blockTitle(block) {
      return block && block.title || block && block.name || "";
    }
    function matchesBlockSearch(block, query) {
      const needle = String(query || "").trim().toLowerCase();
      if (!needle) {
        return true;
      }
      const title = blockTitle(block).toLowerCase();
      const name = String(block && block.name || "").toLowerCase();
      return title.includes(needle) || name.includes(needle);
    }
    function formatCount(n, oneKey, manyKey, oneFallback, manyFallback) {
      const label = n === 1 ? t3(oneKey, oneFallback) : t3(manyKey, manyFallback);
      return `${n} ${label}`;
    }
    function summarizeItems(items) {
      const list = Array.isArray(items) ? items : [];
      const presetCount = list.filter((i) => i?.kind === "preset").length;
      const controlCount = list.filter((i) => i?.kind === "control").length;
      const parts = [];
      if (presetCount) {
        parts.push(
          formatCount(
            presetCount,
            "summaryPresetOne",
            "summaryPresetMany",
            "preset",
            "presets"
          )
        );
      }
      if (controlCount) {
        parts.push(
          formatCount(
            controlCount,
            "summaryControlOne",
            "summaryControlMany",
            "control",
            "controls"
          )
        );
      }
      if (!parts.length) {
        parts.push(`0 ${t3("items", "items")}`);
      }
      return { counts: parts.join(" \xB7 ") };
    }
    function setStatus(type, text) {
      statusMessage = text ? { type, text } : null;
    }
    function renderStatus() {
      if (!statusMessage) {
        return null;
      }
      return el2("span", {
        className: "bl-bo-status bl-bo-status--" + statusMessage.type,
        text: statusMessage.text,
        role: "status",
        dataset: { blBoStatus: "1" }
      });
    }
    function paintStatus() {
      root.querySelectorAll("[data-bl-bo-status-host]").forEach((host) => {
        host.replaceChildren();
        const node = renderStatus();
        if (node) {
          host.appendChild(node);
        }
      });
    }
    function statusHost() {
      return el2("div", { className: "bl-bo-status-host", dataset: { blBoStatusHost: "1" } }, [
        renderStatus()
      ]);
    }
    function makeBackButton(label, onClick) {
      return el2("button", {
        type: "button",
        className: "button button-secondary bl-button -has-icon -icon-arrow-left bl-bo-back",
        onClick
      }, [label]);
    }
    function openConfirmModal({ title, message, confirmLabel, onConfirm }) {
      const overlay = el2("div", {
        className: "bl-blocks-modal-overlay",
        role: "presentation"
      });
      const dialog = el2("div", {
        className: "bl-blocks-modal bl-bo-confirm-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": title || ""
      });
      const close = () => {
        document.removeEventListener("keydown", onKey);
        overlay.remove();
      };
      const onKey = (evt) => {
        if (evt.key === "Escape") {
          evt.preventDefault();
          close();
        }
      };
      const confirmBtn = el2("button", {
        type: "button",
        className: "button button-primary",
        text: confirmLabel || t3("delete", "Delete"),
        onClick: () => {
          close();
          if (typeof onConfirm === "function") {
            onConfirm();
          }
        }
      });
      dialog.append(
        el2("div", { className: "bl-blocks-modal__header" }, [
          el2("h2", { className: "bl-blocks-modal__title", text: title || "" }),
          el2("button", {
            type: "button",
            className: "bl-blocks-modal__close",
            text: "\xD7",
            "aria-label": t3("close", "Close"),
            onClick: close
          })
        ]),
        el2("div", { className: "bl-blocks-modal__body" }, [
          el2("p", { className: "bl-bo-confirm-modal__message", text: message || "" })
        ]),
        el2("div", { className: "bl-blocks-modal__footer" }, [
          el2("button", {
            type: "button",
            className: "button",
            text: t3("cancel", "Cancel"),
            onClick: close
          }),
          confirmBtn
        ])
      );
      overlay.appendChild(dialog);
      overlay.addEventListener("click", (evt) => {
        if (evt.target === overlay) {
          close();
        }
      });
      document.body.appendChild(overlay);
      document.addEventListener("keydown", onKey);
      setTimeout(() => confirmBtn.focus(), 0);
    }
    function deletePreset(preset) {
      if (!preset || savingPreset) {
        return;
      }
      if (preset.slug) {
        slugManual.delete(preset.slug);
      }
      presets = presets.filter((p) => p !== preset);
      if (editingPreset === preset) {
        editingPreset = null;
      }
      setStatus(null, null);
      render();
      void persistPresets({ keepEditing: false });
    }
    function confirmDeletePreset(preset) {
      const name = preset && (preset.label || preset.slug) || t3("untitledPreset", "Untitled");
      openConfirmModal({
        title: t3("deletePresetTitle", "Delete preset?"),
        message: t3(
          "deletePresetConfirm",
          "Delete \u201C%s\u201D? This cannot be undone."
        ).replace("%s", name),
        confirmLabel: t3("deletePreset", "Delete"),
        onConfirm: () => deletePreset(preset)
      });
    }
    async function deleteBlock(block) {
      if (!block?.name || savingBlock) {
        return;
      }
      const name = block.name;
      blocks = blocks.filter((row) => row.name !== name);
      if (editingBlockName === name) {
        editingBlockName = null;
      }
      savingBlock = true;
      setStatus(null, null);
      render();
      try {
        const data = await postAjax("bl_block_options_save_blocks", {
          blocks: JSON.stringify(blocks)
        });
        if (!data?.success) {
          setStatus("error", data?.data?.message || t3("saveFailed", "Could not save."));
          return;
        }
        if (Array.isArray(data.data?.blocks)) {
          blocks = data.data.blocks;
        }
        if (Array.isArray(data.data?.availableBlocks)) {
          availableBlocks = data.data.availableBlocks;
        }
        setStatus("success", t3("saved", "Saved."));
      } catch (e) {
        setStatus("error", t3("saveFailed", "Could not save."));
      } finally {
        savingBlock = false;
        render();
      }
    }
    function confirmDeleteBlock(block) {
      const name = blockTitle(block);
      openConfirmModal({
        title: t3("deleteBlockTitle", "Remove block options?"),
        message: t3(
          "deleteBlockConfirm",
          "Remove options for \u201C%s\u201D? This cannot be undone."
        ).replace("%s", name),
        confirmLabel: t3("delete", "Delete"),
        onConfirm: () => deleteBlock(block)
      });
    }
    function makeRowDeleteButton({ title, onClick }) {
      const deleteBtn = el2("button", {
        type: "button",
        className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger bl-bo-row-delete",
        title,
        "aria-label": title,
        onClick: (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          onClick();
        }
      });
      const trashIcon = typeof iconEl2 === "function" ? iconEl2("trash") : null;
      if (trashIcon?.innerHTML) {
        deleteBtn.appendChild(trashIcon);
      } else {
        deleteBtn.textContent = "\xD7";
      }
      return deleteBtn;
    }
    async function postAjax(action, fields) {
      const body = new URLSearchParams();
      body.set("action", action);
      body.set("nonce", cfg.nonce || "");
      Object.entries(fields || {}).forEach(([key, value]) => {
        body.set(key, value);
      });
      const res = await fetch(cfg.ajaxUrl || ajaxurl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: body.toString(),
        credentials: "same-origin"
      });
      return res.json();
    }
    function retargetPresetSlug(fromSlug, toSlug) {
      if (!fromSlug || !toSlug || fromSlug === toSlug) {
        return;
      }
      blocks.forEach((block) => {
        (block.items || []).forEach((item) => {
          if (item?.kind === "preset" && item.slug === fromSlug) {
            item.slug = toSlug;
            blocksDirty = true;
          }
        });
      });
    }
    async function persistPresets({ keepEditing = true } = {}) {
      if (savingPreset) {
        return false;
      }
      savingPreset = true;
      const presetsPayload = JSON.stringify(presets);
      const saveBlocksToo = blocksDirty;
      const blocksPayload = saveBlocksToo ? JSON.stringify(blocks) : null;
      const openPreset = keepEditing ? editingPreset : null;
      setStatus("muted", t3("saving", "Saving\u2026"));
      if (keepEditing) {
        render();
      } else {
        paintStatus();
      }
      try {
        const data = await postAjax("bl_block_options_save_presets", {
          presets: presetsPayload
        });
        if (!data?.success) {
          setStatus("error", data?.data?.message || t3("saveFailed", "Could not save."));
          return false;
        }
        if (saveBlocksToo && blocksPayload) {
          const blockData = await postAjax("bl_block_options_save_blocks", {
            blocks: blocksPayload
          });
          if (!blockData?.success) {
            setStatus("error", blockData?.data?.message || t3("saveFailed", "Could not save."));
            return false;
          }
          if (JSON.stringify(blocks) === blocksPayload) {
            blocksDirty = false;
          }
        } else {
          blocksDirty = false;
        }
        if (openPreset && presets.includes(openPreset)) {
          editingPreset = openPreset;
        }
        setStatus("success", t3("saved", "Saved."));
        return true;
      } catch (e) {
        setStatus("error", t3("saveFailed", "Could not save."));
        return false;
      } finally {
        savingPreset = false;
        render();
      }
    }
    async function savePreset(preset) {
      if (savingPreset || !preset) {
        return;
      }
      const slug = String(preset.slug || "").trim();
      if (!slug) {
        setStatus("error", t3("presetSlugRequired", "Add a slug before saving."));
        render();
        return;
      }
      await persistPresets({ keepEditing: true });
    }
    async function saveBlock(block) {
      if (savingBlock || !block?.name) {
        return;
      }
      savingBlock = true;
      setStatus(null, null);
      render();
      try {
        const data = await postAjax("bl_block_options_save_blocks", {
          block: block.name,
          items: JSON.stringify(block.items || [])
        });
        if (!data?.success) {
          setStatus("error", data?.data?.message || t3("saveFailed", "Could not save."));
          return;
        }
        if (Array.isArray(data.data?.blocks)) {
          blocks = data.data.blocks;
        }
        if (Array.isArray(data.data?.availableBlocks)) {
          availableBlocks = data.data.availableBlocks;
        }
        if (Array.isArray(data.data?.presets)) {
          presets = data.data.presets;
        }
        setStatus("success", t3("saved", "Saved."));
      } catch (e) {
        setStatus("error", t3("saveFailed", "Could not save."));
      } finally {
        savingBlock = false;
        render();
      }
    }
    function applyPresetSlug(preset, nextSlug, { manual = false } = {}) {
      const prev = preset.slug || "";
      const cleaned = slugify(nextSlug);
      const unique = cleaned === "" ? "" : uniqueSlug(cleaned, prev || null);
      if (prev) {
        slugManual.delete(prev);
      }
      if (manual) {
        if (unique) {
          slugManual.add(unique);
        }
      } else if (unique) {
        slugManual.delete(unique);
      }
      preset.slug = unique;
      if (prev !== unique) {
        retargetPresetSlug(prev, unique);
      }
      return unique;
    }
    function isSlugAuto(preset) {
      const slug = preset?.slug || "";
      return !slug || !slugManual.has(slug);
    }
    function discardEmptyDraft(preset) {
      if (!preset) {
        return;
      }
      const empty = !String(preset.label || "").trim() && !String(preset.slug || "").trim() && (!Array.isArray(preset.items) || preset.items.length === 0);
      if (empty) {
        presets = presets.filter((p) => p !== preset);
      }
    }
    function renderPresetEditor(preset) {
      const panel = el2("div", { className: "bl-bo-preset-editor" });
      const header = el2("div", { className: "bl-bo-editor-header" });
      header.appendChild(
        makeBackButton(t3("backToPresets", "All presets"), () => {
          discardEmptyDraft(preset);
          editingPreset = null;
          setStatus(null, null);
          render();
        })
      );
      panel.appendChild(header);
      const meta = el2("div", { className: "bl-bo-preset-meta" });
      const slugInput = el2("input", {
        type: "text",
        className: "widefat",
        value: preset.slug || "",
        pattern: "[a-z0-9\\-]*",
        spellcheck: "false",
        autocomplete: "off",
        disabled: savingPreset ? true : void 0
      });
      slugInput.addEventListener("input", () => {
        const next = applyPresetSlug(preset, slugInput.value, { manual: true });
        slugInput.value = next;
      });
      meta.appendChild(
        el2("div", { className: "bl-bo-field" }, [
          el2("label", { text: t3("presetLabel", "Label") }),
          el2("input", {
            type: "text",
            className: "widefat",
            value: preset.label || "",
            disabled: savingPreset ? true : void 0,
            onInput: (e) => {
              preset.label = e.target.value;
              if (isSlugAuto(preset)) {
                const next = applyPresetSlug(preset, preset.label, { manual: false });
                slugInput.value = next;
              }
            }
          })
        ])
      );
      meta.appendChild(
        el2("div", { className: "bl-bo-field" }, [
          el2("label", { text: t3("presetSlug", "Slug") }),
          slugInput
        ])
      );
      panel.appendChild(meta);
      if (!Array.isArray(preset.items)) {
        preset.items = [];
      }
      const { panel: optionsPanel } = createOptionsPanel(
        { items: preset.items },
        (next) => {
          preset.items = next.items;
        },
        {
          allowCustoms: true,
          allowPresetRefs: false,
          customs: () => customs,
          presets: () => presets,
          helpText: false,
          emptyText: t3("presetItemsEmpty", "No options yet. Add a control.")
        }
      );
      panel.appendChild(optionsPanel);
      const toolbar = el2("div", { className: "bl-bo-toolbar bl-bo-toolbar--save" });
      toolbar.appendChild(
        el2("button", {
          type: "button",
          className: "button button-primary",
          text: savingPreset ? t3("saving", "Saving\u2026") : t3("savePreset", "Save preset"),
          disabled: savingPreset ? true : void 0,
          onClick: () => savePreset(preset)
        })
      );
      const status = renderStatus();
      if (status) {
        toolbar.appendChild(status);
      }
      panel.appendChild(toolbar);
      return panel;
    }
    function renderPresetsList() {
      const panel = el2("div");
      const toolbar = el2("div", { className: "bl-bo-toolbar bl-bo-toolbar--presets" });
      toolbar.appendChild(statusHost());
      toolbar.appendChild(
        el2("button", {
          type: "button",
          className: "button button-primary bl-button",
          text: t3("addPreset", "Add preset"),
          onClick: () => {
            const preset = { slug: "", label: "", items: [] };
            presets.push(preset);
            editingPreset = preset;
            setStatus(null, null);
            render();
          }
        })
      );
      panel.appendChild(toolbar);
      if (presets.length === 0) {
        panel.appendChild(el2("p", { className: "bl-bo-empty", text: t3("emptyPresets", "") }));
        return panel;
      }
      const list = el2("ul", { className: "bl-bo-preset-list bl-bo-block-list" });
      presets.forEach((preset) => {
        const summary = summarizeItems(preset.items);
        list.appendChild(
          el2("li", { className: "bl-bo-block-row" }, [
            el2("div", { className: "bl-bo-block-row__lead" }, [
              el2("button", {
                type: "button",
                className: "linkish bl-bo-block-open",
                text: preset.label || preset.slug || t3("untitledPreset", "Untitled"),
                onClick: () => {
                  editingPreset = preset;
                  setStatus(null, null);
                  render();
                }
              })
            ]),
            el2("span", { className: "bl-bo-block-row__meta", text: summary.counts }),
            el2("code", {
              className: "bl-bo-block-row__code",
              text: preset.slug || "\u2014"
            }),
            makeRowDeleteButton({
              title: t3("deletePreset", "Delete"),
              onClick: () => confirmDeletePreset(preset)
            })
          ])
        );
      });
      panel.appendChild(list);
      return panel;
    }
    async function addBlock(name) {
      if (addingBlock || !name) {
        return;
      }
      addingBlock = true;
      setStatus(null, null);
      render();
      try {
        const data = await postAjax("bl_block_options_add_block", { block: name });
        if (!data?.success) {
          setStatus("error", data?.data?.message || t3("addBlockFailed", "Could not add block."));
          return;
        }
        if (Array.isArray(data.data?.blocks)) {
          blocks = data.data.blocks;
        }
        if (Array.isArray(data.data?.availableBlocks)) {
          availableBlocks = data.data.availableBlocks;
        }
        selectedAddBlock = "";
        editingBlockName = name;
        setStatus("success", t3("saved", "Saved."));
      } catch (e) {
        setStatus("error", t3("addBlockFailed", "Could not add block."));
      } finally {
        addingBlock = false;
        render();
      }
    }
    function renderBlockEditor(block) {
      const panel = el2("div", { className: "bl-bo-block-editor" });
      panel.appendChild(
        makeBackButton(t3("backToList", "All blocks"), () => {
          editingBlockName = null;
          setStatus(null, null);
          render();
        })
      );
      const heading = el2("h2", { className: "bl-bo-block-heading" });
      heading.appendChild(
        createBlockTypeIconEl(block.name, block.icon || null, "bl-blocks-list-icon")
      );
      heading.appendChild(
        el2("span", { className: "bl-bo-block-heading__title", text: blockTitle(block) })
      );
      heading.appendChild(el2("code", { className: "bl-bo-block-heading__code", text: block.name }));
      panel.appendChild(heading);
      if (!Array.isArray(block.items)) {
        block.items = [];
      }
      const { panel: optionsPanel } = createOptionsPanel(
        { items: block.items },
        (next) => {
          block.items = next.items;
        },
        {
          allowCustoms: false,
          allowPresetRefs: true,
          customs: () => customs,
          presets: () => presets,
          helpText: false,
          emptyText: t3(
            "blockOptionsEmpty",
            "No options yet. Add a control or attach a preset."
          )
        }
      );
      panel.appendChild(optionsPanel);
      const toolbar = el2("div", { className: "bl-bo-toolbar bl-bo-toolbar--save" });
      toolbar.appendChild(
        el2("button", {
          type: "button",
          className: "button button-primary",
          text: savingBlock ? t3("saving", "Saving\u2026") : t3("saveBlocks", "Save block"),
          disabled: savingBlock ? true : void 0,
          onClick: () => saveBlock(block)
        })
      );
      const status = renderStatus();
      if (status) {
        toolbar.appendChild(status);
      }
      panel.appendChild(toolbar);
      return panel;
    }
    function blockOptionLabel(block) {
      return block.title && block.title !== block.name ? `${block.title} (${block.name})` : block.name;
    }
    function appendBlockSelectOptions(select, choices) {
      const groups = blockSources.filter((source) => source.prefix);
      const assigned = /* @__PURE__ */ new Set();
      groups.forEach((group) => {
        const rows = choices.filter(
          (block) => String(block.name || "").startsWith(group.prefix)
        );
        if (!rows.length) {
          return;
        }
        const optgroup2 = el2("optgroup", { label: group.label });
        rows.forEach((block) => {
          assigned.add(block.name);
          optgroup2.appendChild(
            el2("option", { value: block.name, text: blockOptionLabel(block) })
          );
        });
        select.appendChild(optgroup2);
      });
      const other = choices.filter((block) => !assigned.has(block.name));
      if (!other.length) {
        return;
      }
      if (groups.length === 0) {
        other.forEach((block) => {
          select.appendChild(
            el2("option", { value: block.name, text: blockOptionLabel(block) })
          );
        });
        return;
      }
      const optgroup = el2("optgroup", { label: t3("tabOther", "Other") });
      other.forEach((block) => {
        optgroup.appendChild(
          el2("option", { value: block.name, text: blockOptionLabel(block) })
        );
      });
      select.appendChild(optgroup);
    }
    function renderAddBlockBar(tab) {
      const choices = availableBlocksForTab(tab);
      const bar = el2("div", { className: "bl-bo-add-block bl-admin-form" });
      const row = el2("div", { className: "bl-bo-add-block__row" });
      const search = el2("input", {
        type: "search",
        className: "bl-bo-add-block__search",
        placeholder: t3("searchBlocks", "Search blocks\u2026"),
        value: blockListQuery,
        "aria-label": t3("searchBlocks", "Search blocks\u2026"),
        "data-bl-bo-block-search": "1",
        onInput: (event) => {
          const input = event.target;
          const start = input.selectionStart;
          const end = input.selectionEnd;
          blockListQuery = input.value || "";
          render();
          const next = root.querySelector("[data-bl-bo-block-search]");
          if (next) {
            next.focus();
            if (typeof start === "number" && typeof end === "number") {
              try {
                next.setSelectionRange(start, end);
              } catch (err) {
              }
            }
          }
        }
      });
      row.appendChild(search);
      const select = el2("select", {
        className: "bl-bo-add-block__select",
        disabled: addingBlock || choices.length === 0 ? true : void 0,
        onChange: (event) => {
          selectedAddBlock = event.target.value || "";
        }
      });
      select.appendChild(
        el2("option", {
          value: "",
          text: t3("chooseBlock", "Select a block\u2026")
        })
      );
      appendBlockSelectOptions(select, choices);
      if (selectedAddBlock && choices.some((b) => b.name === selectedAddBlock)) {
        select.value = selectedAddBlock;
      } else {
        selectedAddBlock = "";
        select.value = "";
      }
      const fields = el2("div", { className: "bl-bo-add-block__fields" });
      fields.appendChild(select);
      fields.appendChild(
        el2("button", {
          type: "button",
          className: "button button-primary bl-button",
          text: addingBlock ? t3("addingBlock", "Adding\u2026") : t3("addBlock", "Add block"),
          disabled: addingBlock || choices.length === 0 ? true : void 0,
          onClick: () => {
            const name = select.value || selectedAddBlock;
            if (name) {
              void addBlock(name);
            }
          }
        })
      );
      row.appendChild(fields);
      bar.appendChild(row);
      if (choices.length === 0) {
        bar.appendChild(
          el2("p", {
            className: "description bl-bo-add-block__hint",
            text: t3("noBlocksToAdd", "No more blocks available in this filter.")
          })
        );
      } else if (statusMessage?.text && statusMessage.type === "error") {
        bar.appendChild(
          el2("p", {
            className: "description bl-bo-add-block__hint bl-bo-status bl-bo-status--error",
            text: statusMessage.text,
            role: "status"
          })
        );
      }
      return bar;
    }
    function renderBlockSourceTabs() {
      if (blockSources.length <= 1) {
        return null;
      }
      const subNav = el2("nav", {
        className: "bl-bo-subtabs",
        role: "tablist",
        "aria-label": t3("tabBlocks", "Blocks")
      });
      blockSources.forEach((source) => {
        subNav.appendChild(
          el2("button", {
            type: "button",
            role: "tab",
            className: "bl-bo-subtabs__tab" + (source.id === activeBlockSource ? " is-active" : ""),
            text: source.label,
            "aria-selected": source.id === activeBlockSource ? "true" : "false",
            onClick: () => {
              activeBlockSource = source.id;
              editingBlockName = null;
              selectedAddBlock = "";
              setStatus(null, null);
              render();
            }
          })
        );
      });
      return subNav;
    }
    function renderBlocksList(tab) {
      const panel = el2("div");
      const rows = blocksForTab(tab);
      if (rows.length === 0) {
        panel.appendChild(el2("p", { className: "bl-bo-empty", text: tab.empty || "" }));
        return panel;
      }
      const filtered = rows.filter((block) => matchesBlockSearch(block, blockListQuery));
      if (filtered.length === 0) {
        panel.appendChild(
          el2("p", {
            className: "bl-bo-empty",
            text: t3("noSearchResults", "No blocks match your search.")
          })
        );
        return panel;
      }
      const list = el2("ul", { className: "bl-bo-preset-list bl-bo-block-list" });
      filtered.forEach((block) => {
        const summary = summarizeItems(block.items);
        list.appendChild(
          el2("li", { className: "bl-bo-block-row" }, [
            el2("div", { className: "bl-bo-block-row__lead" }, [
              createBlockTypeIconEl(block.name, block.icon || null, "bl-blocks-list-icon"),
              el2("button", {
                type: "button",
                className: "linkish bl-bo-block-open",
                text: blockTitle(block),
                onClick: () => {
                  editingBlockName = block.name;
                  setStatus(null, null);
                  render();
                }
              })
            ]),
            el2("span", { className: "bl-bo-block-row__meta", text: summary.counts }),
            el2("code", { className: "bl-bo-block-row__code", text: block.name }),
            makeRowDeleteButton({
              title: t3("delete", "Delete"),
              onClick: () => confirmDeleteBlock(block)
            })
          ])
        );
      });
      panel.appendChild(list);
      return panel;
    }
    function render() {
      root.replaceChildren();
      const shell = el2("div", { className: "bl-forms-builder bl-block-options-shell" });
      const tabBar = el2("nav", { className: "bl-forms-builder__tabs", role: "tablist" });
      mainTabs.forEach((tab) => {
        tabBar.appendChild(
          el2("button", {
            type: "button",
            role: "tab",
            className: "bl-forms-builder__tab" + (tab.id === activeMain ? " is-active" : ""),
            text: tab.label,
            "aria-selected": tab.id === activeMain ? "true" : "false",
            onClick: () => {
              activeMain = tab.id;
              if (editingPreset) {
                discardEmptyDraft(editingPreset);
              }
              editingPreset = null;
              editingBlockName = null;
              setStatus(null, null);
              render();
            }
          })
        );
      });
      shell.appendChild(tabBar);
      const panels = el2("div", { className: "bl-forms-builder__panels" });
      const panel = el2("div", { className: "bl-forms-builder__panel bl-bo-panel", role: "tabpanel" });
      if (activeMain === "presets") {
        const preset = editingPreset && presets.includes(editingPreset) ? editingPreset : null;
        if (preset) {
          panel.appendChild(renderPresetEditor(preset));
        } else {
          editingPreset = null;
          panel.appendChild(renderPresetsList());
        }
      } else {
        const block = editingBlockName ? findBlock(editingBlockName) : null;
        if (block) {
          panel.appendChild(renderBlockEditor(block));
        } else {
          const source = currentBlockSource();
          panel.appendChild(renderAddBlockBar(source));
          const subNav = renderBlockSourceTabs();
          if (subNav) {
            panel.appendChild(subNav);
          }
          panel.appendChild(renderBlocksList(source));
        }
      }
      panels.appendChild(panel);
      shell.appendChild(panels);
      root.appendChild(shell);
    }
    render();
  }
  whenBlockTypesReady(boot);
})();
//# sourceMappingURL=block-options-admin.js.map
