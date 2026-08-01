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
            { filename: "text-format", alternatives: [], keywords: ["text", "format", "typography", "font", "wysiwyg"] },
            { filename: "bold", alternatives: [], keywords: ["bold", "strong", "weight", "typography"] },
            { filename: "italic", alternatives: [], keywords: ["italic", "emphasis", "slant", "typography"] },
            { filename: "underlined", alternatives: [], keywords: ["underline", "typography", "text"] },
            { filename: "strikethrough", alternatives: ["fill"], keywords: ["strikethrough", "strike", "cross out", "typography"] },
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
            { filename: "text-decrease", alternatives: [], keywords: ["text", "decrease", "smaller", "font", "size"] },
            { filename: "text-increase", alternatives: [], keywords: ["text", "increase", "larger", "font", "size"] },
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
            { filename: "layout-section", alternatives: ["fill"], keywords: ["section", "layout", "content", "area", "region", "container", "block", "group", "spacing", "margin", "page section"] },
            { filename: "web-stories", alternatives: ["fill"], keywords: ["web", "stories", "story", "reels", "vertical", "social"] },
            { filename: "web-stories-stack", alternatives: ["fill"], keywords: ["web", "stories", "stack", "vertical", "social", "google"] },
            { filename: "carousel", alternatives: ["fill"], keywords: ["slider", "gallery", "slideshow"] },
            { filename: "call-to-action", alternatives: ["fill"], keywords: ["cta", "call to action", "button", "promote"] },
            { filename: "fit-page", alternatives: ["fill"], keywords: ["fit", "page", "document", "layout", "scale"] },
            { filename: "brick", alternatives: ["fill"], keywords: ["block", "gutenberg", "layout", "section"] },
            { filename: "combine-columns", alternatives: ["fill"], keywords: ["table", "columns", "merge", "combine"] },
            { filename: "combine-rows", alternatives: ["fill"], keywords: ["table", "rows", "merge", "combine"] },
            { filename: "add-column-left", alternatives: ["fill"], keywords: ["table", "column", "add", "insert", "left"] },
            { filename: "add-column-right", alternatives: ["fill"], keywords: ["table", "column", "add", "insert", "right"] },
            { filename: "add-row-above", alternatives: ["fill"], keywords: ["table", "row", "add", "insert", "above"] },
            { filename: "add-row-below", alternatives: ["fill"], keywords: ["table", "row", "add", "insert", "below"] },
            { filename: "move-selection-left", alternatives: ["fill"], keywords: ["move", "selection", "left", "arrow", "shift", "reorder"] },
            { filename: "move-selection-right", alternatives: ["fill"], keywords: ["move", "selection", "right", "arrow", "shift", "reorder"] },
            { filename: "move-selection-up", alternatives: ["fill"], keywords: ["move", "selection", "up", "arrow", "shift", "reorder"] },
            { filename: "move-selection-down", alternatives: ["fill"], keywords: ["move", "selection", "down", "arrow", "shift", "reorder"] }
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
            <button type="button" class="button button-secondary" data-bl-icon-picker-variant="outline">${t("outline", "Outline")}</button>
            <button type="button" class="button button-secondary" data-bl-icon-picker-variant="fill">${t("filled", "Filled")}</button>
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

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/settings-panel.js
  var { el, t: t2, writeConfig } = window.BlFormBuilder || {};
  var MATERIAL_ICONS_URL = "https://fonts.google.com/icons?icon.style=Rounded";
  function fieldRow(label, control, help = "") {
    const children = [el("p", {}, [el("label", { text: label }), control])];
    if (help) {
      children.push(el("p", { className: "description", text: help }));
    }
    return el("div", { className: "bl-forms-builder__setting" }, children);
  }
  function plainSwitch(label, { checked = false, onChange = null } = {}) {
    const input = el("input", { type: "checkbox", checked: !!checked });
    if (onChange) {
      input.addEventListener("change", () => onChange(input.checked));
    }
    return {
      root: el(
        "div",
        { className: "bl-forms-builder__switch-setting" },
        [
          el("label", { className: "bl-forms-builder__switch" }, [
            input,
            el("span", { className: "bl-forms-builder__switch-ui", "aria-hidden": "true" }),
            el("span", { className: "bl-forms-builder__switch-label", text: label })
          ])
        ]
      ),
      input
    };
  }
  function isSvgValue(value) {
    return typeof value === "string" && value.trim().toLowerCase().includes("<svg");
  }
  function hasThemeIconPicker() {
    return !!(window.baselayerIcons && window.blBlocksAdmin && window.blBlocksAdmin.hasIconPicker);
  }
  function slugifyFromTitle(text) {
    return String(text || "").trim().toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  }
  function createBlockIconField(initial, onChange) {
    let value = initial || "block-default";
    const usePicker = hasThemeIconPicker();
    const preview = el("div", {
      className: "bl-blocks-icon-field__preview",
      dataset: { blBlocksIconPreview: "" }
    });
    const empty = el("span", {
      className: "bl-blocks-icon-field__empty description",
      text: t2("blockIconEmpty", "No icon selected"),
      dataset: { blBlocksIconEmpty: "" }
    });
    const hidden = el("input", {
      type: "hidden",
      value,
      dataset: { blBlocksIconValue: "" }
    });
    const textarea = el("textarea", {
      className: "large-text code",
      rows: 4,
      placeholder: "<svg \u2026>",
      dataset: { blBlocksIconSvg: "" }
    });
    if (isSvgValue(value)) {
      textarea.value = value;
    }
    const svgPanel = el(
      "div",
      {
        className: "bl-blocks-icon-field__svg-panel",
        dataset: { blBlocksIconSvgPanel: "" },
        hidden: true
      },
      [
        el("label", {}, [
          el("strong", { text: t2("blockIconSvg", "SVG code") })
        ]),
        textarea,
        el("p", { className: "description" }, [
          document.createTextNode(t2("blockIconMaterialHelp", "Browse Material Icons, copy SVG, and paste here: ")),
          el("a", {
            href: MATERIAL_ICONS_URL,
            target: "_blank",
            rel: "noopener noreferrer",
            text: t2("blockIconMaterialLink", "fonts.google.com/icons")
          })
        ])
      ]
    );
    const chooseBtn = usePicker ? el("button", {
      type: "button",
      className: "button",
      text: t2("blockIconChoose", "Choose icon"),
      dataset: { blBlocksIconChoose: "" }
    }) : null;
    const svgToggle = el("button", {
      type: "button",
      className: "button",
      text: t2("blockIconSvgToggle", "SVG code"),
      "aria-expanded": "false",
      dataset: { blBlocksIconSvgToggle: "" }
    });
    const clearBtn = el("button", {
      type: "button",
      className: "button button-link-delete",
      text: t2("blockIconClear", "Clear"),
      dataset: { blBlocksIconClear: "" }
    });
    const actions = el("div", { className: "bl-blocks-icon-field__actions" }, [
      chooseBtn,
      svgToggle,
      clearBtn
    ].filter(Boolean));
    const root = el("div", { className: "bl-blocks-icon-field", dataset: { blBlocksIconField: "" } }, [
      el("div", { className: "bl-blocks-icon-field__row" }, [preview, empty, actions]),
      hidden,
      svgPanel
    ]);
    const setSvgOpen = (open) => {
      svgPanel.hidden = !open;
      svgToggle.setAttribute("aria-expanded", open ? "true" : "false");
      svgToggle.classList.toggle("is-active", open);
    };
    const syncPreview = () => {
      const trimmed = (value || "").trim();
      preview.replaceChildren();
      preview.hidden = trimmed === "";
      empty.hidden = trimmed !== "";
      if (trimmed === "") {
        return;
      }
      if (isSvgValue(trimmed)) {
        const wrap = el("span", { className: "bl-blocks-icon-field__svg" });
        wrap.innerHTML = trimmed;
        preview.appendChild(wrap);
        return;
      }
      if (trimmed.indexOf("dashicons-") === 0 || trimmed === "block-default") {
        const dash = trimmed.indexOf("dashicons-") === 0 ? trimmed : "dashicons-" + trimmed;
        preview.appendChild(el("span", { className: "dashicons " + dash, "aria-hidden": "true" }));
        return;
      }
      preview.appendChild(
        el("span", {
          className: "bl-icon -icon-" + trimmed.replace(/[^a-z0-9_-]/gi, ""),
          "aria-hidden": "true"
        })
      );
    };
    const commit = (next, { openSvg = false } = {}) => {
      value = next == null ? "" : String(next);
      hidden.value = value;
      if (isSvgValue(value) || openSvg) {
        textarea.value = isSvgValue(value) ? value : textarea.value;
      } else if (!openSvg) {
        textarea.value = "";
      }
      syncPreview();
      onChange(value || "block-default");
      if (openSvg) {
        setSvgOpen(true);
      }
    };
    if (chooseBtn) {
      chooseBtn.addEventListener("click", async () => {
        try {
          const { openIconPicker: openIconPicker2 } = await Promise.resolve().then(() => (init_icon_picker_service(), icon_picker_service_exports));
          openIconPicker2({
            currentValue: isSvgValue(value) ? "" : value,
            returnFocus: chooseBtn,
            onSelect: (iconName2) => {
              commit(iconName2);
              setSvgOpen(false);
            }
          });
        } catch (err) {
          setSvgOpen(true);
          textarea.focus();
        }
      });
    }
    svgToggle.addEventListener("click", () => {
      const willOpen = svgPanel.hidden;
      setSvgOpen(willOpen);
      if (willOpen) {
        textarea.focus();
      }
    });
    textarea.addEventListener("input", () => {
      commit(textarea.value, { openSvg: true });
    });
    clearBtn.addEventListener("click", () => {
      commit("block-default");
      setSvgOpen(false);
      textarea.value = "";
    });
    syncPreview();
    return root;
  }
  function createSettingsPanel(initial, definitionType, onChange) {
    let state = { ...initial || {} };
    const notify = () => {
      onChange({ ...state });
      writeConfig({ settings: { ...state } });
    };
    const panel = el("div", {
      className: "bl-forms-builder__panel bl-blocks-settings-panel",
      dataset: { blFormsPanel: "settings" },
      hidden: true
    });
    const { root: activeRow, input: activeInput } = plainSwitch(t2("settingsActive", "Active"), {
      checked: state.active !== false,
      onChange: (checked) => {
        state.active = checked;
        notify();
      }
    });
    const slugInput = el("input", {
      type: "text",
      className: "widefat",
      value: state.slug || "",
      pattern: "[a-z0-9\\-]*"
    });
    const allowAutoSlug = document.body.classList.contains("post-new-php") && !(state.slug || "").trim();
    let slugManual = !allowAutoSlug;
    const applySlug = (next, { manual = false } = {}) => {
      const cleaned = String(next || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (manual) {
        slugManual = true;
      }
      state.slug = cleaned;
      slugInput.value = cleaned;
      notify();
    };
    slugInput.addEventListener("input", () => {
      applySlug(slugInput.value, { manual: true });
    });
    if (allowAutoSlug) {
      const titleInput = document.getElementById("title");
      if (titleInput) {
        const syncFromTitle = () => {
          if (slugManual) {
            return;
          }
          applySlug(slugifyFromTitle(titleInput.value));
        };
        titleInput.addEventListener("input", syncFromTitle);
        titleInput.addEventListener("change", syncFromTitle);
        if (titleInput.value.trim()) {
          syncFromTitle();
        }
      }
    }
    const descInput = el("textarea", {
      className: "widefat",
      rows: 3,
      text: state.description || ""
    });
    descInput.addEventListener("input", () => {
      state.description = descInput.value;
      notify();
    });
    const children = [
      el("h3", { className: "bl-forms-builder__section-title", text: t2("tabSettings", "Settings") }),
      activeRow,
      fieldRow(t2("settingsSlug", "Slug"), slugInput, t2("settingsSlugHelp", "")),
      fieldRow(t2("settingsDescription", "Description"), descInput)
    ];
    if (definitionType === "block") {
      const iconField = createBlockIconField(state.block_icon || "block-default", (next) => {
        state.block_icon = next;
        notify();
      });
      const categories = window.blBlocksAdmin && window.blBlocksAdmin.blockCategories || [];
      const categorySelect = el("select", { className: "widefat" });
      const currentCat = state.block_category || "widgets";
      let hasCurrent = false;
      categories.forEach((cat) => {
        const opt = el("option", {
          value: cat.slug,
          text: cat.title || cat.slug
        });
        if (cat.slug === currentCat) {
          opt.selected = true;
          hasCurrent = true;
        }
        categorySelect.appendChild(opt);
      });
      if (!hasCurrent && currentCat) {
        categorySelect.appendChild(
          el("option", { value: currentCat, text: currentCat, selected: true })
        );
      }
      if (categories.length === 0) {
        ["text", "media", "design", "widgets", "theme", "embed"].forEach((slug) => {
          const opt = el("option", { value: slug, text: slug });
          if (slug === currentCat) opt.selected = true;
          categorySelect.appendChild(opt);
        });
      }
      categorySelect.addEventListener("change", () => {
        state.block_category = categorySelect.value || "widgets";
        notify();
      });
      const keywordsInput = el("input", {
        type: "text",
        className: "widefat",
        value: state.block_keywords || ""
      });
      keywordsInput.addEventListener("input", () => {
        state.block_keywords = keywordsInput.value;
        notify();
      });
      delete state.block_title;
      children.push(
        fieldRow(t2("blockIcon", "Block icon"), iconField),
        fieldRow(t2("blockCategory", "Block category"), categorySelect),
        fieldRow(t2("blockKeywords", "Keywords"), keywordsInput, t2("blockKeywordsHelp", ""))
      );
    }
    if (definitionType === "page_settings") {
      const postTypes = window.blBlocksAdmin && window.blBlocksAdmin.postTypes || [];
      const selected = Array.isArray(state.post_types) ? state.post_types.map(String) : [];
      const box = el("div", { className: "bl-blocks-settings-post-types" });
      postTypes.forEach((pt) => {
        const checked = selected.includes(pt.value);
        const input = el("input", { type: "checkbox", value: pt.value, checked });
        input.addEventListener("change", () => {
          const next = [];
          box.querySelectorAll('input[type="checkbox"]').forEach((elInput) => {
            if (elInput.checked) next.push(elInput.value);
          });
          state.post_types = next;
          notify();
        });
        box.appendChild(
          el("label", { className: "bl-blocks-settings-post-types__item" }, [
            input,
            document.createTextNode(" " + (pt.label || pt.value))
          ])
        );
      });
      children.push(fieldRow(t2("postTypes", "Post types"), box, t2("postTypesHelp", "")));
    }
    if (definitionType === "site_settings") {
      const labelInput = el("input", {
        type: "text",
        className: "widefat",
        value: state.menu_label || ""
      });
      labelInput.addEventListener("input", () => {
        state.menu_label = labelInput.value;
        notify();
      });
      const orderInput = el("input", {
        type: "number",
        className: "small-text",
        value: String(state.menu_order != null ? state.menu_order : 1)
      });
      orderInput.addEventListener("input", () => {
        state.menu_order = parseInt(orderInput.value, 10) || 0;
        notify();
      });
      children.push(
        fieldRow(t2("menuLabel", "Tab label"), labelInput, t2("menuLabelHelp", "")),
        fieldRow(t2("menuOrder", "Order"), orderInput)
      );
    }
    panel.append(...children);
    return {
      panel,
      getSettings: () => ({ ...state }),
      setSettings: (next) => {
        state = { ...state, ...next || {} };
        activeInput.checked = state.active !== false;
      },
      syncFields: () => {
      }
    };
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/repeater-card.js
  var {
    el: el2,
    t: t3,
    uid,
    iconEl,
    defaultField,
    uniqueFieldName,
    cloneFieldData,
    createFieldCard,
    serializeRow,
    openLayoutSettingsModal,
    normalizeConditionalLogic
  } = window.BlFormBuilder || {};
  var REPEATER_MAX_DEPTH = 3;
  var LAYOUT_BLOCKED = ["column", "section", "group"];
  var repeaterFieldByEl = /* @__PURE__ */ new WeakMap();
  function createNestedSortable(list, options) {
    const Builder = window.BlCanvasBuilder;
    if (!Builder || typeof Builder.createSortable !== "function") {
      console.error("BlCanvasBuilder.createSortable is required for repeater field lists");
      return null;
    }
    return Builder.createSortable(list, options);
  }
  function notifyChanged() {
    document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
  }
  function typeLabel(type) {
    const dict = window.blFormsAdmin && window.blFormsAdmin.i18n || {};
    if (dict.types && dict.types[type]) {
      return dict.types[type];
    }
    if (type === "repeater") {
      return t3("repeaterType", "Repeater");
    }
    return type;
  }
  function prepareChildField(typeOrData, depth) {
    const data = typeof typeOrData === "string" ? defaultFieldForBlocks(typeOrData) : { ...typeOrData };
    if (LAYOUT_BLOCKED.includes(data.type)) {
      return null;
    }
    if (data.type === "repeater" && depth >= REPEATER_MAX_DEPTH) {
      return null;
    }
    if (data.name != null && data.name_manual === false) {
      data.name = uniqueFieldName(data.label || data.name || data.type || "field", data.id || "");
    } else if (data.name) {
      data.name = uniqueFieldName(data.name, data.id || "");
    }
    return data;
  }
  function defaultRepeater(partial = {}) {
    const id = partial.id || uid();
    return {
      id,
      type: "repeater",
      label: partial.label || typeLabel("repeater"),
      name: partial.name || "items",
      name_manual: partial.name_manual != null ? !!partial.name_manual : false,
      hide_label: !!partial.hide_label,
      show_title: partial.show_title !== false && partial.show_title !== 0 && partial.show_title !== "0",
      active: partial.active !== false,
      required: !!partial.required,
      description: partial.description || "",
      css_class: partial.css_class || "",
      design: ["standard", "outline", "card"].includes(partial.design) ? partial.design : "standard",
      width: partial.width || "100",
      width_custom: partial.width_custom || "",
      min_rows: Math.max(0, parseInt(partial.min_rows, 10) || 0),
      max_rows: Math.max(0, parseInt(partial.max_rows, 10) || 0),
      button_label: partial.button_label || "",
      collapsed: partial.collapsed === true || partial.collapsed === 1 || partial.collapsed === "1" || partial.collapsed === "true",
      conditional_logic: normalizeConditionalLogic(partial.conditional_logic),
      children: Array.isArray(partial.children) ? partial.children : []
    };
  }
  function defaultFieldForBlocks(type) {
    if (type === "repeater") {
      return defaultRepeater();
    }
    return defaultField(type);
  }
  function serializeChildCard(row) {
    if ((row.dataset.fieldType || "") === "repeater") {
      return serializeRepeaterRow(row);
    }
    return serializeRow(row);
  }
  function bindRepeaterChildList(list, depth, onChange) {
    const Builder = window.BlCanvasBuilder;
    const onStart = Builder?.dragStart || (() => {
    });
    const onEnd = Builder?.dragEnd || (() => {
    });
    createNestedSortable(list, {
      group: {
        name: "bl-blocks-fields",
        put(to, from, dragEl) {
          const type = dragEl.dataset.fieldType || "";
          if (LAYOUT_BLOCKED.includes(type)) {
            return false;
          }
          if (type === "repeater" && depth >= REPEATER_MAX_DEPTH) {
            return false;
          }
          return true;
        }
      },
      handle: ".bl-forms-builder__handle",
      animation: 150,
      draggable: ".bl-forms-builder__field, .bl-forms-builder__template",
      onStart,
      onEnd,
      onAdd(evt) {
        const item = evt.item;
        const type = item.dataset.fieldType || "text";
        if (item.classList.contains("bl-forms-builder__template")) {
          const prepared = prepareChildField(type, depth);
          if (!prepared) {
            item.remove();
            return;
          }
          const card = prepared.type === "repeater" ? createRepeaterCard(prepared, true, depth + 1) : createFieldCard(prepared, true);
          item.replaceWith(card);
          onChange();
          return;
        }
        if (LAYOUT_BLOCKED.includes(type)) {
          if (evt.from && evt.from !== list) {
            evt.from.insertBefore(item, evt.from.children[evt.oldIndex] || null);
          } else {
            item.remove();
          }
          return;
        }
        if (type === "repeater") {
          const itemDepth = parseInt(item.dataset.repeaterDepth || "1", 10);
          if (depth >= REPEATER_MAX_DEPTH || itemDepth > REPEATER_MAX_DEPTH) {
            if (evt.from && evt.from !== list) {
              evt.from.insertBefore(item, evt.from.children[evt.oldIndex] || null);
            } else {
              item.remove();
            }
            return;
          }
          const data = serializeRepeaterRow(item);
          if (depth + 1 > REPEATER_MAX_DEPTH) {
            if (evt.from && evt.from !== list) {
              evt.from.insertBefore(item, evt.from.children[evt.oldIndex] || null);
            } else {
              item.remove();
            }
            return;
          }
          item.replaceWith(createRepeaterCard(data, false, depth + 1));
        }
        onChange();
      },
      onUpdate: onChange,
      onSort: onChange
    });
  }
  function createRepeaterCard(initial = {}, open = false, depth = 1) {
    if (depth > REPEATER_MAX_DEPTH) {
      depth = REPEATER_MAX_DEPTH;
    }
    let field = defaultRepeater(initial);
    field = {
      ...field,
      ...initial,
      id: initial.id || field.id,
      type: "repeater",
      children: Array.isArray(initial.children) ? initial.children : field.children
    };
    field = defaultRepeater(field);
    const row = el2("div", {
      className: "bl-forms-builder__field bl-forms-builder__repeater-card",
      dataset: {
        blFormsField: "1",
        fieldId: field.id,
        fieldType: "repeater",
        repeaterDepth: String(depth),
        fieldWidth: field.width || "100",
        fieldDesign: field.design || "standard",
        fieldShowTitle: field.show_title ? "1" : "0"
      }
    });
    repeaterFieldByEl.set(row, field);
    const preview = el2("span", { className: "bl-forms-builder__preview" });
    const typeLabelText = () => typeLabel("repeater") + (depth > 1 ? ` (${depth})` : "");
    const typeChip = el2("span", { className: "bl-forms-builder__field-type" });
    const settingsBtn = el2("button", {
      type: "button",
      className: "bl-forms-builder__design-btn",
      title: t3("layoutSettingsTitle", "Settings"),
      "aria-label": t3("layoutSettingsTitle", "Settings")
    });
    settingsBtn.appendChild(iconEl("tune", "bl-forms-builder__design-btn-icon"));
    const fieldsList = el2("div", {
      className: "bl-forms-builder__repeater-fields",
      dataset: { blRepeaterFields: "1", repeaterDepth: String(depth) }
    });
    const emptyHint = el2("p", {
      className: "description bl-forms-builder__section-empty",
      text: depth >= REPEATER_MAX_DEPTH ? t3("repeaterEmptyMaxDepth", "Drop fields here (nested repeater not allowed at this depth)") : t3("repeaterEmpty", "Drop fields or a nested repeater here")
    });
    const syncEmpty = () => {
      emptyHint.hidden = fieldsList.querySelector("[data-bl-forms-field]") != null;
    };
    const onListChange = () => {
      syncEmpty();
      notifyChanged();
    };
    (field.children || []).forEach((child) => {
      if ((child?.type || "") === "repeater") {
        if (depth >= REPEATER_MAX_DEPTH) {
          return;
        }
        fieldsList.appendChild(createRepeaterCard(child, false, depth + 1));
        return;
      }
      fieldsList.appendChild(createFieldCard(child, false));
    });
    bindRepeaterChildList(fieldsList, depth, onListChange);
    const fieldsWrap = el2("div", { className: "bl-forms-builder__repeater-fields-wrap" }, [
      fieldsList,
      emptyHint
    ]);
    syncEmpty();
    const updatePreview = () => {
      row.dataset.fieldWidth = field.width || "100";
      row.dataset.fieldDesign = field.design || "standard";
      row.dataset.fieldShowTitle = field.show_title ? "1" : "0";
      const title = (field.label || "").trim();
      preview.textContent = title;
      preview.hidden = title === "";
      const typeChildren = [
        iconEl("repeater", "bl-forms-builder__field-type-icon"),
        el2("span", {
          className: "bl-forms-builder__field-type-label",
          text: typeLabelText()
        })
      ];
      const logic = field.conditional_logic;
      if (logic && logic.enabled && Array.isArray(logic.groups) && logic.groups.length > 0) {
        typeChildren.push(
          el2("span", {
            className: "bl-forms-builder__field-logic-dot",
            title: t3("logicEnable", "Conditional logic"),
            "aria-label": t3("logicEnable", "Conditional logic")
          })
        );
      }
      typeChip.replaceChildren(...typeChildren);
    };
    settingsBtn.addEventListener("click", () => {
      openLayoutSettingsModal(
        field,
        () => {
          updatePreview();
          notifyChanged();
        },
        {
          tabs: ["settings", "advanced", "design", "logic"],
          withLabel: true,
          withHideTitle: true,
          withWidth: true,
          onLiveUpdate: () => {
            updatePreview();
            notifyChanged();
          },
          logicHelp: t3(
            "logicHelpRepeater",
            "Show this repeater only when the conditions below are met."
          )
        }
      );
    });
    const duplicateBtn = el2("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn",
      title: t3("duplicate", "Duplicate"),
      "aria-label": t3("duplicate", "Duplicate"),
      onClick: () => {
        const data = serializeRepeaterRow(row);
        const clone = cloneFieldData(data);
        const copy = createRepeaterCard(clone, false, depth);
        row.after(copy);
        notifyChanged();
      }
    });
    const dupIcon = iconEl("duplicate");
    if (dupIcon.innerHTML) duplicateBtn.appendChild(dupIcon);
    else duplicateBtn.textContent = "\u29C9";
    const deleteBtn = el2("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger",
      title: t3("delete", "Delete"),
      "aria-label": t3("delete", "Delete"),
      onClick: () => {
        row.remove();
        notifyChanged();
      }
    });
    const trashIcon = iconEl("trash");
    if (trashIcon.innerHTML) deleteBtn.appendChild(trashIcon);
    else deleteBtn.textContent = "\xD7";
    const handle = el2("span", {
      className: "bl-forms-builder__handle",
      title: t3("dragField", "Drag to reorder"),
      "aria-hidden": "true"
    });
    const dragIcon = iconEl("drag");
    if (dragIcon.innerHTML) handle.appendChild(dragIcon);
    else handle.textContent = "\u22EE\u22EE";
    const collapseBtn = el2("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__container-collapse"
    });
    const syncCollapse = () => {
      const collapsed = !!field.collapsed;
      row.classList.toggle("is-collapsed", collapsed);
      collapseBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      const label = collapsed ? t3("expandGroup", "Expand") : t3("collapseGroup", "Collapse");
      collapseBtn.title = label;
      collapseBtn.setAttribute("aria-label", label);
      const icon = iconEl(
        collapsed ? "expandContent" : "collapseContent",
        "bl-forms-builder__container-collapse-icon"
      );
      collapseBtn.replaceChildren();
      if (icon.innerHTML) collapseBtn.appendChild(icon);
      else collapseBtn.textContent = collapsed ? "\u203A" : "\u25BE";
    };
    collapseBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      field.collapsed = !field.collapsed;
      syncCollapse();
      notifyChanged();
    });
    syncCollapse();
    const header = el2("div", { className: "bl-forms-builder__field-header" }, [
      handle,
      preview,
      el2("div", { className: "bl-forms-builder__field-meta" }, [settingsBtn, typeChip]),
      el2("div", { className: "bl-forms-builder__field-actions" }, [
        collapseBtn,
        duplicateBtn,
        deleteBtn
      ])
    ]);
    row.append(header, fieldsWrap);
    updatePreview();
    return row;
  }
  function serializeRepeaterRow(row) {
    const live = repeaterFieldByEl.get(row);
    const id = row.dataset.fieldId || live?.id || uid();
    const fields = row.querySelector(
      ":scope > .bl-forms-builder__repeater-fields-wrap [data-bl-repeater-fields]"
    );
    const children = Array.from(fields?.children || []).filter((node) => node.matches("[data-bl-forms-field]")).filter((node) => !LAYOUT_BLOCKED.includes(node.dataset.fieldType || "")).map((child) => serializeChildCard(child));
    const design = row.dataset.fieldDesign || live?.design || "standard";
    const showTitle = row.dataset.fieldShowTitle !== void 0 ? row.dataset.fieldShowTitle !== "0" : live?.show_title !== false;
    return {
      id,
      type: "repeater",
      label: live?.label ?? "",
      name: (live?.name || "items").trim() || "items",
      name_manual: live?.name_manual !== false,
      hide_label: !!live?.hide_label,
      show_title: showTitle,
      active: live?.active !== false,
      required: !!live?.required,
      description: live?.description || "",
      css_class: live?.css_class || "",
      design: ["standard", "outline", "card"].includes(design) ? design : "standard",
      width: row.dataset.fieldWidth || live?.width || "100",
      width_custom: live?.width === "custom" || row.dataset.fieldWidth === "custom" ? live?.width_custom || "" : "",
      min_rows: Math.max(0, parseInt(live?.min_rows ?? 0, 10) || 0),
      max_rows: Math.max(0, parseInt(live?.max_rows ?? 0, 10) || 0),
      button_label: live?.button_label ?? "",
      collapsed: !!live?.collapsed,
      conditional_logic: normalizeConditionalLogic(live?.conditional_logic),
      children
    };
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/app.js
  var {
    el: el3,
    t: t4,
    writeConfig: writeConfig2,
    PALETTE_SECTIONS,
    defaultField: defaultField2,
    uniqueFieldName: uniqueFieldName2,
    iconEl: iconEl2,
    createFieldCard: createFieldCard2,
    serializeRow: serializeRow2,
    equalizeColumnRun
  } = window.BlFormBuilder || {};
  var EXCLUDED_TYPES = /* @__PURE__ */ new Set(["honeypot", "captcha", "terms"]);
  var BLOCKS_POPULAR_TYPES = ["text", "textarea", "select", "toggle"];
  var BLOCKS_PALETTE = PALETTE_SECTIONS.map((section) => {
    let types = section.id === "popular" ? BLOCKS_POPULAR_TYPES : (section.types || []).filter((type) => !EXCLUDED_TYPES.has(type));
    if (section.id === "advanced") {
      types = [...types.filter((type) => type !== "repeater"), "repeater"];
    }
    return { ...section, types };
  }).filter((section) => (section.types || []).length > 0);
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
  function createBlocksItem(data, open) {
    if ((data?.type || "") === "repeater") {
      return createRepeaterCard(data, open, 1);
    }
    return createFieldCard2(data, open);
  }
  function serializeBlocksItem(row) {
    if ((row?.dataset?.fieldType || "") === "repeater") {
      return serializeRepeaterRow(row);
    }
    return serializeRow2(row);
  }
  function mountApp(root, initial, definitionType = "block") {
    const Builder = window.BlCanvasBuilder;
    const FormBuilder = window.BlFormBuilder;
    if (!Builder || typeof Builder.mount !== "function") {
      root.textContent = "Canvas builder failed to load.";
      return;
    }
    if (!FormBuilder || typeof FormBuilder.createFieldCard !== "function") {
      root.textContent = "Form builder failed to load.";
      return;
    }
    root.replaceChildren();
    root.classList.add("bl-forms-builder--tabs");
    let settingsState = { ...initial.settings || {} };
    let builderApi = null;
    const panels = createSettingsPanel(settingsState, definitionType, (next) => {
      settingsState = next;
      syncAll();
    });
    const syncAll = () => {
      const fields = builderApi ? builderApi.getFields() : [];
      writeConfig2({
        fields,
        settings: panels.getSettings()
      });
      builderApi?.canvas?.syncEmpty?.();
    };
    const fieldsPanel = el3("div", {
      className: "bl-forms-builder__panel is-active",
      dataset: { blFormsPanel: "fields" }
    });
    const prepareField = (typeOrData) => {
      if (typeOrData === "repeater" || typeOrData && typeOrData.type === "repeater") {
        const data2 = typeof typeOrData === "string" ? defaultRepeater() : defaultRepeater(typeOrData);
        if (data2.name != null && data2.name_manual === false) {
          data2.name = uniqueFieldName2(data2.label || data2.name || "items", data2.id || "");
        } else if (data2.name) {
          data2.name = uniqueFieldName2(data2.name, data2.id || "");
        }
        return data2;
      }
      const data = typeof typeOrData === "string" ? defaultField2(typeOrData) : { ...typeOrData };
      if (data.name != null && data.name_manual === false) {
        data.name = uniqueFieldName2(data.label || data.name || data.type || "field", data.id || "");
      } else if (data.name) {
        data.name = uniqueFieldName2(data.name, data.id || "");
      }
      return data;
    };
    builderApi = Builder.mount(fieldsPanel, {
      replaceRoot: false,
      addRootClass: false,
      ns: "bl-forms-builder",
      groupName: "bl-blocks-fields",
      items: initial.fields || [],
      sections: BLOCKS_PALETTE,
      heading: t4("canvasHeading", "Fields"),
      emptyText: t4("empty", "Drag a field here."),
      handleSelector: ".bl-forms-builder__handle",
      draggableSelector: ".bl-forms-builder__field, .bl-forms-builder__template",
      templateClass: "bl-forms-builder__template",
      itemAttr: "data-bl-forms-field",
      icons: window.blFormsAdmin && window.blFormsAdmin.icons || {},
      t: t4,
      typeLabel: (type) => {
        const dict = window.blFormsAdmin && window.blFormsAdmin.i18n || {};
        if (type === "repeater") {
          return dict.types && dict.types.repeater || t4("repeaterType", "Repeater");
        }
        return dict.types && dict.types[type] || type;
      },
      normalizeItems: expandLegacyGroups,
      prepareItem: prepareField,
      createItem: createBlocksItem,
      serializeItem: serializeBlocksItem,
      onItemMounted: (card, list) => {
        if ((card.dataset.fieldType || "") === "column") {
          equalizeColumnRun(list, card);
        }
      },
      onChange: () => {
        syncAll();
      }
    });
    const tabBar = el3("nav", { className: "bl-forms-builder__tabs", role: "tablist" });
    const tabs = [
      { id: "fields", label: t4("tabFields", "Fields"), panel: fieldsPanel },
      { id: "settings", label: t4("tabSettings", "Settings"), panel: panels.panel }
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
    tabs.forEach((tab, index) => {
      tab.button = el3("button", {
        type: "button",
        className: "bl-forms-builder__tab" + (index === 0 ? " is-active" : ""),
        role: "tab",
        text: tab.label,
        dataset: { blFormsTab: tab.id },
        onClick: () => activate(tab.id)
      });
      tab.button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      tabBar.appendChild(tab.button);
    });
    let fullscreen = false;
    const setFullscreen = (next) => {
      fullscreen = !!next;
      root.classList.toggle("is-fullscreen", fullscreen);
      document.body.classList.toggle("bl-forms-builder-fullscreen", fullscreen);
      const label = fullscreen ? t4("fullscreenExit", "Exit fullscreen") : t4("fullscreenEnter", "Fullscreen");
      fullscreenBtn.title = label;
      fullscreenBtn.setAttribute("aria-label", label);
      fullscreenBtn.setAttribute("aria-pressed", fullscreen ? "true" : "false");
      fullscreenBtn.replaceChildren();
      const icon = iconEl2(fullscreen ? "fullscreenExit" : "fullscreen");
      if (icon.innerHTML) {
        fullscreenBtn.appendChild(icon);
      } else {
        fullscreenBtn.textContent = fullscreen ? "\u2715" : "\u26F6";
      }
      if (fullscreen) {
        document.addEventListener("keydown", onFullscreenKey);
      } else {
        document.removeEventListener("keydown", onFullscreenKey);
      }
    };
    const onFullscreenKey = (evt) => {
      if (evt.key === "Escape" && fullscreen) {
        evt.preventDefault();
        setFullscreen(false);
      }
    };
    const fullscreenBtn = el3("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__fullscreen-btn",
      title: t4("fullscreenEnter", "Fullscreen"),
      "aria-label": t4("fullscreenEnter", "Fullscreen"),
      "aria-pressed": "false",
      onClick: () => setFullscreen(!fullscreen)
    });
    const enterIcon = iconEl2("fullscreen");
    if (enterIcon.innerHTML) {
      fullscreenBtn.appendChild(enterIcon);
    } else {
      fullscreenBtn.textContent = "\u26F6";
    }
    tabBar.appendChild(fullscreenBtn);
    const panelsWrap = el3("div", { className: "bl-forms-builder__panels" }, [
      fieldsPanel,
      panels.panel
    ]);
    root.append(
      el3("div", { className: "bl-forms-builder__scroll" }, [
        el3("div", { className: "bl-forms-builder__scroll-inner" }, [tabBar, panelsWrap])
      ])
    );
    const form = root.closest("form");
    if (form) {
      form.addEventListener("submit", syncAll);
    }
    root.addEventListener("input", syncAll);
    root.addEventListener("change", syncAll);
    document.addEventListener("bl-forms-builder-changed", syncAll);
    syncAll();
  }

  // themes/baselayer/src/js/admin/utils/page-picker.js
  function openPagePicker(options = {}) {
    const opts = {
      multi: false,
      selectedId: 0,
      selectedIds: [],
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
      const selectedMap = /* @__PURE__ */ new Map();
      if (opts.multi) {
        const ids = Array.isArray(opts.selectedIds) ? opts.selectedIds : [];
        ids.forEach((id) => {
          const n = Number(id) || 0;
          if (n > 0) {
            selectedMap.set(n, { id: n, title: "", url: "" });
          }
        });
      } else {
        const id = Number(opts.selectedId) || 0;
        if (id > 0) {
          selectedMap.set(id, { id, title: "", url: "" });
        }
      }
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
      if (opts.multi) {
        list.setAttribute("aria-multiselectable", "true");
      }
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
      cancelBtn.className = "button bl-button-small";
      cancelBtn.textContent = opts.cancelLabel;
      cancelBtn.addEventListener("click", () => finish(null));
      const selectBtn = document.createElement("button");
      selectBtn.type = "button";
      selectBtn.className = "button button-primary bl-button-small";
      selectBtn.textContent = opts.selectLabel;
      const syncSelectEnabled = () => {
        selectBtn.disabled = selectedMap.size === 0;
      };
      syncSelectEnabled();
      selectBtn.addEventListener("click", () => {
        if (selectedMap.size === 0) return;
        if (opts.multi) {
          finish(Array.from(selectedMap.values()));
          return;
        }
        finish({ ...selectedMap.values().next().value });
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
          const id = Number(page.id) || 0;
          const active = selectedMap.has(id);
          btn.classList.toggle("is-selected", active);
          btn.setAttribute("aria-selected", active ? "true" : "false");
          btn.dataset.pageId = String(id);
          const title = document.createElement("span");
          title.className = "bl-page-picker__item-title";
          title.textContent = page.title || `#${id}`;
          const meta = document.createElement("span");
          meta.className = "bl-page-picker__item-meta";
          meta.textContent = page.url || "";
          btn.append(title, meta);
          btn.addEventListener("click", () => {
            const item = {
              id,
              title: page.title || "",
              url: page.url || ""
            };
            if (opts.multi) {
              if (selectedMap.has(id)) {
                selectedMap.delete(id);
              } else {
                selectedMap.set(id, item);
              }
            } else {
              selectedMap.clear();
              selectedMap.set(id, item);
            }
            list.querySelectorAll(".bl-page-picker__item").forEach((node) => {
              const on = selectedMap.has(Number(node.dataset.pageId) || 0);
              node.classList.toggle("is-selected", on);
              node.setAttribute("aria-selected", on ? "true" : "false");
            });
            syncSelectEnabled();
          });
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
          pages.forEach((page) => {
            if (selectedMap.has(page.id)) {
              selectedMap.set(page.id, page);
            }
          });
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

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/page-field.js
  function el4(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "checked") node.checked = Boolean(value);
      else if (key === "value") node.value = value === true ? "" : String(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }
  function i18n(key, fallback) {
    const dict = window.blBlocksFieldUi && window.blBlocksFieldUi.i18n || window.blBlocksEditor && window.blBlocksEditor.i18n || window.blBlocksPage && window.blBlocksPage.i18n || window.blBlocksAdmin && window.blBlocksAdmin.i18n || {};
    return dict[key] || fallback || key;
  }
  function pickerConfig() {
    const sources = [
      window.blBlocksFieldUi,
      window.blBlocksEditor,
      window.blBlocksPage,
      window.blBlocksAdmin
    ];
    let restUrl = "";
    let restNonce = "";
    sources.forEach((src) => {
      if (!src) return;
      if (!restUrl && src.pagesRestUrl) restUrl = src.pagesRestUrl;
      if (!restNonce && src.restNonce) restNonce = src.restNonce;
    });
    return { restUrl, restNonce };
  }
  function normalizePageIds(current, multiple) {
    if (multiple) {
      const list = Array.isArray(current) ? current : current != null && current !== "" ? [current] : [];
      return list.map((id) => Number(id) || 0).filter((id) => id > 0);
    }
    const one = Number(Array.isArray(current) ? current[0] : current) || 0;
    return one > 0 ? [one] : [];
  }
  function createPagePickerControl(field, current) {
    const multiple = !!field.multiple;
    let selected = normalizePageIds(current, multiple).map((id) => ({
      id,
      title: "",
      url: ""
    }));
    const summary = el4("div", { className: "bl-blocks-fields__page-picker-summary" });
    const pickBtn = el4("button", {
      type: "button",
      className: "button bl-button-small",
      text: i18n("choosePage", "Choose page")
    });
    const clearBtn = el4("button", {
      type: "button",
      className: "button-link",
      text: i18n("clearPage", "Clear")
    });
    const actions = el4("div", { className: "bl-blocks-fields__page-picker-actions" }, [
      pickBtn,
      clearBtn
    ]);
    const control = el4("div", {
      className: "bl-blocks-fields__page-picker",
      dataset: { blBlocksPagePicker: "1" }
    });
    control.append(
      el4("div", { className: "bl-blocks-fields__page-picker-row" }, [summary, actions])
    );
    const syncUi = () => {
      summary.replaceChildren();
      if (selected.length === 0) {
        summary.appendChild(
          el4("span", {
            className: "description",
            text: multiple ? i18n("choosePagesHelp", "Select one or more pages.") : i18n("choosePageHelp", "Select a page.")
          })
        );
      } else if (multiple) {
        selected.forEach((page) => {
          summary.appendChild(
            el4("span", {
              className: "bl-blocks-fields__page-picker-value",
              text: page.title || i18n("selectedPage", "Selected page") + " #" + page.id
            })
          );
        });
      } else {
        const page = selected[0];
        summary.appendChild(
          el4("span", {
            className: "bl-blocks-fields__page-picker-value",
            text: page.title || i18n("selectedPage", "Selected page") + " #" + page.id
          })
        );
        if (page.url) {
          summary.appendChild(
            el4("span", {
              className: "description bl-blocks-fields__page-picker-url",
              text: page.url,
              title: page.url
            })
          );
        }
      }
      clearBtn.hidden = selected.length === 0;
      pickBtn.textContent = selected.length > 0 ? multiple ? i18n("changePages", "Change pages") : i18n("changePage", "Change page") : multiple ? i18n("choosePages", "Choose pages") : i18n("choosePage", "Choose page");
    };
    const hydrateTitles = async () => {
      const missing = selected.filter((p) => !p.title);
      if (missing.length === 0) return;
      const { restUrl, restNonce } = pickerConfig();
      if (!restUrl) return;
      try {
        const include = missing.map((p) => p.id).join(",");
        const url = String(restUrl).replace(/\/?$/, "/") + "?include=" + encodeURIComponent(include) + "&per_page=" + missing.length + "&_fields=id,title,link";
        const res = await fetch(url, {
          headers: restNonce ? { "X-WP-Nonce": restNonce } : {}
        });
        if (!res.ok) return;
        const rows = await res.json();
        if (!Array.isArray(rows)) return;
        const byId = new Map(
          rows.map((row) => [
            Number(row.id) || 0,
            {
              id: Number(row.id) || 0,
              title: row.title && row.title.rendered || "",
              url: row.link || ""
            }
          ])
        );
        selected = selected.map((page) => {
          const hit = byId.get(page.id);
          return hit ? { ...page, ...hit } : page;
        });
        syncUi();
      } catch (err) {
      }
    };
    pickBtn.addEventListener("click", async () => {
      let open;
      try {
        open = openPagePicker;
      } catch (err) {
        console.error("Page picker failed to load.", err);
        return;
      }
      if (typeof open !== "function") {
        console.error("Page picker is unavailable.");
        return;
      }
      const { restUrl, restNonce } = pickerConfig();
      const result = await open({
        multi: multiple,
        selectedId: !multiple && selected[0] ? selected[0].id : 0,
        selectedIds: multiple ? selected.map((p) => p.id) : [],
        title: multiple ? i18n("pagePickerTitleMulti", "Select pages") : i18n("pagePickerTitle", "Select a page"),
        searchPlaceholder: i18n("pagePickerSearch", "Search pages\u2026"),
        empty: i18n("pagePickerEmpty", "No pages found."),
        loading: i18n("pagePickerLoading", "Loading\u2026"),
        cancelLabel: i18n("cancel", "Cancel"),
        selectLabel: i18n("selectPage", "Select"),
        restUrl,
        restNonce
      });
      if (!result) return;
      if (multiple) {
        selected = (Array.isArray(result) ? result : [result]).map((page) => ({
          id: Number(page.id) || 0,
          title: page.title || "",
          url: page.url || ""
        })).filter((p) => p.id > 0);
      } else {
        selected = [
          {
            id: Number(result.id) || 0,
            title: result.title || "",
            url: result.url || ""
          }
        ].filter((p) => p.id > 0);
      }
      syncUi();
    });
    clearBtn.addEventListener("click", () => {
      selected = [];
      syncUi();
    });
    control.getPageValue = () => {
      const ids = selected.map((p) => p.id).filter((id) => id > 0);
      if (multiple) return ids;
      return ids[0] || "";
    };
    syncUi();
    hydrateTitles();
    return control;
  }
  function bindPagePickers(root = document) {
    root.querySelectorAll("[data-bl-blocks-page-picker]").forEach((wrap) => {
      if (wrap.dataset.blPagePickerBound === "1") return;
      wrap.dataset.blPagePickerBound = "1";
      const multiple = wrap.dataset.multiple === "1";
      const inputName = wrap.dataset.inputName || "";
      const summary = wrap.querySelector("[data-bl-page-summary]");
      const pickBtn = wrap.querySelector("[data-bl-page-choose]");
      const clearBtn = wrap.querySelector("[data-bl-page-clear]");
      const inputsHost = wrap.querySelector("[data-bl-page-inputs]");
      if (!summary || !pickBtn || !clearBtn || !inputsHost || !inputName) return;
      let selected = Array.from(inputsHost.querySelectorAll('input[type="hidden"]')).map((input) => ({
        id: Number(input.value) || 0,
        title: input.dataset.title || "",
        url: input.dataset.url || ""
      })).filter((p) => p.id > 0);
      const writeInputs = () => {
        inputsHost.replaceChildren();
        if (selected.length === 0) {
          if (multiple) {
            inputsHost.appendChild(
              el4("input", { type: "hidden", name: inputName + "[]", value: "" })
            );
          } else {
            inputsHost.appendChild(el4("input", { type: "hidden", name: inputName, value: "" }));
          }
          return;
        }
        selected.forEach((page) => {
          const name = multiple ? inputName + "[]" : inputName;
          const input = el4("input", {
            type: "hidden",
            name,
            value: String(page.id)
          });
          if (page.title) input.dataset.title = page.title;
          if (page.url) input.dataset.url = page.url;
          inputsHost.appendChild(input);
        });
      };
      const syncUi = () => {
        summary.replaceChildren();
        if (selected.length === 0) {
          summary.appendChild(
            el4("span", {
              className: "description",
              text: multiple ? i18n("choosePagesHelp", "Select one or more pages.") : i18n("choosePageHelp", "Select a page.")
            })
          );
        } else {
          selected.forEach((page) => {
            summary.appendChild(
              el4("span", {
                className: "bl-blocks-fields__page-picker-value",
                text: page.title || i18n("selectedPage", "Selected page") + " #" + page.id
              })
            );
          });
        }
        clearBtn.hidden = selected.length === 0;
        pickBtn.textContent = selected.length > 0 ? multiple ? i18n("changePages", "Change pages") : i18n("changePage", "Change page") : multiple ? i18n("choosePages", "Choose pages") : i18n("choosePage", "Choose page");
        writeInputs();
      };
      pickBtn.addEventListener("click", async () => {
        if (typeof openPagePicker !== "function") {
          console.error("Page picker is unavailable.");
          return;
        }
        const { restUrl, restNonce } = pickerConfig();
        const result = await openPagePicker({
          multi: multiple,
          selectedId: !multiple && selected[0] ? selected[0].id : 0,
          selectedIds: multiple ? selected.map((p) => p.id) : [],
          title: multiple ? i18n("pagePickerTitleMulti", "Select pages") : i18n("pagePickerTitle", "Select a page"),
          searchPlaceholder: i18n("pagePickerSearch", "Search pages\u2026"),
          empty: i18n("pagePickerEmpty", "No pages found."),
          loading: i18n("pagePickerLoading", "Loading\u2026"),
          cancelLabel: i18n("cancel", "Cancel"),
          selectLabel: i18n("selectPage", "Select"),
          restUrl,
          restNonce
        });
        if (!result) return;
        if (multiple) {
          selected = (Array.isArray(result) ? result : [result]).map((page) => ({
            id: Number(page.id) || 0,
            title: page.title || "",
            url: page.url || ""
          })).filter((p) => p.id > 0);
        } else {
          selected = [
            {
              id: Number(result.id) || 0,
              title: result.title || "",
              url: result.url || ""
            }
          ].filter((p) => p.id > 0);
        }
        syncUi();
      });
      clearBtn.addEventListener("click", () => {
        selected = [];
        syncUi();
      });
      syncUi();
    });
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/link-field.js
  var LINK_TYPES = ["page", "url", "email", "phone"];
  function el5(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "checked") node.checked = Boolean(value);
      else if (key === "value") node.value = value === true ? "" : String(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }
  function i18n2(key, fallback) {
    const dict = window.blBlocksFieldUi && window.blBlocksFieldUi.i18n || window.blBlocksEditor && window.blBlocksEditor.i18n || window.blBlocksPage && window.blBlocksPage.i18n || window.blBlocksAdmin && window.blBlocksAdmin.i18n || {};
    return dict[key] || fallback || key;
  }
  function pickerConfig2() {
    const sources = [
      window.blBlocksFieldUi,
      window.blBlocksEditor,
      window.blBlocksPage,
      window.blBlocksAdmin
    ];
    let restUrl = "";
    let restNonce = "";
    sources.forEach((src) => {
      if (!src) return;
      if (!restUrl && src.pagesRestUrl) restUrl = src.pagesRestUrl;
      if (!restNonce && src.restNonce) restNonce = src.restNonce;
    });
    return { restUrl, restNonce };
  }
  function allowedLinkTypes(field) {
    const raw = Array.isArray(field.link_types) ? field.link_types : LINK_TYPES;
    const list = raw.map(String).filter((t5) => LINK_TYPES.includes(t5));
    return list.length ? list : [...LINK_TYPES];
  }
  function normalizeLinkValue(current, allowed) {
    const empty = {
      type: allowed[0] || "url",
      url: "",
      title: "",
      page_id: 0,
      target: ""
    };
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return empty;
    }
    let type = String(current.type || "");
    if (!allowed.includes(type)) {
      type = allowed[0] || "url";
    }
    return {
      type,
      url: current.url != null ? String(current.url) : "",
      title: current.title != null ? String(current.title) : "",
      page_id: Number(current.page_id) || 0,
      target: current.target === "_blank" ? "_blank" : ""
    };
  }
  function displayDestination(state) {
    if (state.type === "email") {
      return String(state.url || "").replace(/^mailto:/i, "");
    }
    if (state.type === "phone") {
      return String(state.url || "").replace(/^tel:/i, "");
    }
    return String(state.url || "");
  }
  function createLinkControl(field, current) {
    const allowed = allowedLinkTypes(field);
    const allowTarget = field.allow_target !== false;
    let state = normalizeLinkValue(current, allowed);
    let pageMeta = state.type === "page" && state.page_id > 0 ? { id: state.page_id, title: state.title || "", url: state.url || "" } : null;
    const root = el5("div", {
      className: "bl-blocks-fields__link",
      dataset: { blBlocksLinkField: "1" }
    });
    const typeRow = el5("div", { className: "bl-blocks-fields__link-types" });
    const destWrap = el5("div", { className: "bl-blocks-fields__link-destination" });
    const titleInput = el5("input", {
      type: "text",
      className: "widefat",
      value: state.title,
      placeholder: i18n2("linkTextPlaceholder", "Link text")
    });
    const titleRow = el5("p", { className: "bl-blocks-fields__link-title" }, [
      el5("label", { text: i18n2("linkText", "Link text") }),
      titleInput
    ]);
    const targetInput = el5("input", { type: "checkbox" });
    const targetRow = el5("label", { className: "bl-blocks-fields__toggle bl-blocks-fields__link-target" }, [
      targetInput,
      document.createTextNode(" " + i18n2("linkOpenNewTab", "Open in new tab"))
    ]);
    const syncTargetVisibility = () => {
      const show = allowTarget && (state.type === "page" || state.type === "url");
      targetRow.hidden = !show;
      if (!show) {
        targetInput.checked = false;
        state.target = "";
      }
    };
    const renderDestination = () => {
      destWrap.replaceChildren();
      if (state.type === "page") {
        const summary = el5("div", { className: "bl-blocks-fields__page-picker-summary" });
        const pickBtn = el5("button", {
          type: "button",
          className: "button bl-button-small",
          text: pageMeta ? i18n2("changePage", "Change page") : i18n2("choosePage", "Choose page")
        });
        const clearBtn = el5("button", {
          type: "button",
          className: "button-link",
          text: i18n2("clearPage", "Clear"),
          hidden: !pageMeta
        });
        if (pageMeta) {
          summary.appendChild(
            el5("span", {
              className: "bl-blocks-fields__page-picker-value",
              text: pageMeta.title || i18n2("selectedPage", "Selected page") + " #" + pageMeta.id
            })
          );
          if (pageMeta.url) {
            summary.appendChild(
              el5("span", {
                className: "description bl-blocks-fields__page-picker-url",
                text: pageMeta.url,
                title: pageMeta.url
              })
            );
          }
        } else {
          summary.appendChild(
            el5("span", {
              className: "description",
              text: i18n2("choosePageHelp", "Select a page.")
            })
          );
        }
        pickBtn.addEventListener("click", async () => {
          if (typeof openPagePicker !== "function") {
            console.error("Page picker is unavailable.");
            return;
          }
          const { restUrl, restNonce } = pickerConfig2();
          const page = await openPagePicker({
            selectedId: pageMeta ? pageMeta.id : 0,
            title: i18n2("pagePickerTitle", "Select a page"),
            searchPlaceholder: i18n2("pagePickerSearch", "Search pages\u2026"),
            empty: i18n2("pagePickerEmpty", "No pages found."),
            loading: i18n2("pagePickerLoading", "Loading\u2026"),
            cancelLabel: i18n2("cancel", "Cancel"),
            selectLabel: i18n2("selectPage", "Select"),
            restUrl,
            restNonce
          });
          if (!page) return;
          pageMeta = {
            id: Number(page.id) || 0,
            title: page.title || "",
            url: page.url || ""
          };
          state.page_id = pageMeta.id;
          state.url = pageMeta.url;
          if (!String(titleInput.value || "").trim() && pageMeta.title) {
            titleInput.value = pageMeta.title;
            state.title = pageMeta.title;
          }
          renderDestination();
        });
        clearBtn.addEventListener("click", () => {
          pageMeta = null;
          state.page_id = 0;
          state.url = "";
          renderDestination();
        });
        destWrap.appendChild(
          el5("div", { className: "bl-blocks-fields__page-picker-row" }, [
            summary,
            el5("div", { className: "bl-blocks-fields__page-picker-actions" }, [pickBtn, clearBtn])
          ])
        );
        return;
      }
      let inputType = "url";
      let placeholder = i18n2("linkUrlPlaceholder", "https://");
      let value = displayDestination(state);
      if (state.type === "email") {
        inputType = "email";
        placeholder = i18n2("linkEmailPlaceholder", "name@example.com");
      } else if (state.type === "phone") {
        inputType = "tel";
        placeholder = i18n2("linkPhonePlaceholder", "+41 \u2026");
      }
      const input = el5("input", {
        type: inputType,
        className: "widefat",
        value,
        placeholder
      });
      input.addEventListener("input", () => {
        state.url = input.value;
      });
      destWrap.appendChild(input);
    };
    if (allowed.length > 1) {
      const labels = {
        page: i18n2("linkTypePage", "Page"),
        url: i18n2("linkTypeUrl", "URL"),
        email: i18n2("linkTypeEmail", "Email"),
        phone: i18n2("linkTypePhone", "Phone")
      };
      allowed.forEach((type) => {
        const btn = el5("button", {
          type: "button",
          className: "button bl-button-small bl-blocks-fields__link-type" + (state.type === type ? " is-active" : ""),
          text: labels[type] || type,
          dataset: { linkType: type }
        });
        btn.addEventListener("click", () => {
          if (state.type === type) return;
          state.type = type;
          state.url = "";
          state.page_id = 0;
          state.target = "";
          pageMeta = null;
          targetInput.checked = false;
          typeRow.querySelectorAll("[data-link-type]").forEach((node) => {
            node.classList.toggle("is-active", node.dataset.linkType === type);
          });
          syncTargetVisibility();
          renderDestination();
        });
        typeRow.appendChild(btn);
      });
      root.appendChild(typeRow);
    }
    titleInput.addEventListener("input", () => {
      state.title = titleInput.value;
    });
    targetInput.checked = state.target === "_blank";
    targetInput.addEventListener("change", () => {
      state.target = targetInput.checked ? "_blank" : "";
    });
    root.append(destWrap, titleRow, targetRow);
    syncTargetVisibility();
    renderDestination();
    if (state.type === "page" && state.page_id > 0 && (!pageMeta || !pageMeta.title)) {
      const { restUrl, restNonce } = pickerConfig2();
      if (restUrl) {
        fetch(String(restUrl).replace(/\/?$/, "/") + state.page_id + "?_fields=id,title,link", {
          headers: restNonce ? { "X-WP-Nonce": restNonce } : {}
        }).then((res) => res.ok ? res.json() : null).then((row) => {
          if (!row || Number(row.id) !== state.page_id) return;
          pageMeta = {
            id: state.page_id,
            title: row.title && row.title.rendered || "",
            url: row.link || ""
          };
          state.url = pageMeta.url;
          if (!String(titleInput.value || "").trim() && pageMeta.title) {
            titleInput.value = pageMeta.title;
            state.title = pageMeta.title;
          }
          renderDestination();
        }).catch(() => {
        });
      }
    }
    root.getLinkValue = () => {
      const destInput = destWrap.querySelector('input:not([type="hidden"])');
      const title = String(titleInput.value || "").trim();
      const out = {
        type: state.type,
        url: "",
        title
      };
      if (state.type === "page") {
        out.page_id = state.page_id > 0 ? state.page_id : 0;
        out.url = pageMeta && pageMeta.url || state.url || "";
      } else if (state.type === "email") {
        const email = String(destInput ? destInput.value : state.url || "").replace(/^mailto:/i, "").trim();
        out.url = email ? "mailto:" + email : "";
      } else if (state.type === "phone") {
        const phone = String(destInput ? destInput.value : state.url || "").replace(/^tel:/i, "").trim();
        out.url = phone ? "tel:" + phone : "";
      } else {
        out.url = String(destInput ? destInput.value : state.url || "").trim();
      }
      if (allowTarget && (state.type === "page" || state.type === "url") && targetInput.checked) {
        out.target = "_blank";
      }
      return out;
    };
    return root;
  }
  function bindLinkFields(root = document) {
    root.querySelectorAll("[data-bl-blocks-link-field]").forEach((wrap) => {
      if (wrap.dataset.blLinkBound === "1") return;
      if (wrap.querySelector("[data-bl-link-interactive]")) return;
      wrap.dataset.blLinkBound = "1";
      const inputName = wrap.dataset.inputName || "";
      if (!inputName) return;
      let allowed = String(wrap.dataset.linkTypes || "").split(",").map((s) => s.trim()).filter((t5) => LINK_TYPES.includes(t5));
      if (!allowed.length) allowed = [...LINK_TYPES];
      const allowTarget = wrap.dataset.allowTarget === "1";
      const readHidden = () => {
        const get = (key) => {
          const input = wrap.querySelector(`[data-bl-link-key="${key}"]`);
          return input ? input.value : "";
        };
        return normalizeLinkValue(
          {
            type: get("type"),
            url: get("url"),
            title: get("title"),
            page_id: get("page_id"),
            target: get("target")
          },
          allowed
        );
      };
      const field = { link_types: allowed, allow_target: allowTarget };
      const control = createLinkControl(field, readHidden());
      control.dataset.blLinkInteractive = "1";
      const host = wrap.querySelector("[data-bl-link-ui]");
      const inputsHost = wrap.querySelector("[data-bl-link-inputs]");
      if (host) {
        host.replaceChildren(control);
      } else {
        wrap.appendChild(control);
      }
      const writeInputs = () => {
        if (!inputsHost) return;
        const value = control.getLinkValue();
        inputsHost.replaceChildren();
        const keys = ["type", "url", "title", "page_id"];
        keys.forEach((key) => {
          const val = value[key] != null ? String(value[key]) : "";
          const input = el5("input", {
            type: "hidden",
            name: `${inputName}[${key}]`,
            value: val,
            dataset: { blLinkKey: key }
          });
          inputsHost.appendChild(input);
        });
        if (value.target === "_blank") {
          inputsHost.appendChild(
            el5("input", {
              type: "hidden",
              name: `${inputName}[target]`,
              value: "_blank",
              dataset: { blLinkKey: "target" }
            })
          );
        }
      };
      const form = wrap.closest("form");
      if (form) {
        form.addEventListener("submit", writeInputs);
      }
      wrap.addEventListener("change", writeInputs);
      wrap.addEventListener("click", () => setTimeout(writeInputs, 0));
      writeInputs();
    });
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/field-form.js
  function el6(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "html") node.innerHTML = value;
      else if (key === "dataset") Object.assign(node.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "checked") node.checked = Boolean(value);
      else if (key === "value") node.value = value === true ? "" : String(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }
  function i18n3(key, fallback) {
    const dict = window.blBlocksFieldUi && window.blBlocksFieldUi.i18n || window.blBlocksEditor && window.blBlocksEditor.i18n || window.blBlocksPage && window.blBlocksPage.i18n || {};
    return dict[key] || fallback || key;
  }
  function isLayout(type) {
    return type === "column" || type === "section" || type === "group";
  }
  function isStatic(type) {
    return type === "divider" || type === "spacer" || type === "heading" || type === "text_block" || type === "html" || type === "honeypot" || type === "captcha";
  }
  function collectLeafValue(field, control, type) {
    const name = field.name;
    if (!name) return null;
    if (type === "page" && control && typeof control.getPageValue === "function") {
      return control.getPageValue();
    }
    if (type === "link" && control && typeof control.getLinkValue === "function") {
      return control.getLinkValue();
    }
    if (type === "select") {
      if (control.multiple) {
        return Array.from(control.selectedOptions).map((o) => o.value);
      }
      return control.value;
    }
    if (type === "checkboxes") {
      return Array.from(control.querySelectorAll('input[type="checkbox"]:checked')).map(
        (input) => input.value
      );
    }
    if (type === "radio" || type === "button_group") {
      const checked = control.querySelector('input[type="radio"]:checked');
      return checked ? checked.value : "";
    }
    if (type === "toggle" || type === "terms") {
      const input = control.tagName === "INPUT" ? control : control.querySelector("input");
      return input && input.checked ? "1" : "";
    }
    if (control && "value" in control) {
      return control.value;
    }
    return "";
  }
  function createLeafControl(field, values, controls) {
    const type = field.type || "text";
    const name = field.name || "";
    if (!name) return null;
    const current = values[name] !== void 0 && values[name] !== null ? values[name] : field.default_value != null ? field.default_value : "";
    const row = el6("div", {
      className: "bl-blocks-fields__row",
      dataset: { fieldName: name }
    });
    const id = "bl-blocks-ui-" + name.replace(/[^a-z0-9_-]/gi, "_") + "-" + Math.random().toString(36).slice(2, 7);
    if (!field.hide_label && type !== "toggle" && type !== "terms") {
      const label = el6("label", { className: "bl-blocks-fields__label", text: field.label || name });
      label.setAttribute("for", id);
      if (field.required) {
        label.appendChild(document.createTextNode(" "));
        label.appendChild(el6("span", { className: "required", text: "*" }));
      }
      row.appendChild(label);
    }
    let control = null;
    const options = Array.isArray(field.options) ? field.options : [];
    if (type === "textarea") {
      control = el6("textarea", {
        className: "widefat",
        id,
        rows: field.rows || 4,
        value: current == null ? "" : String(current)
      });
      if (field.placeholder) control.placeholder = field.placeholder;
    } else if (type === "select") {
      const multiple = !!field.multiple;
      control = el6("select", { className: "widefat", id });
      if (multiple) control.multiple = true;
      if (!multiple) {
        control.appendChild(el6("option", { value: "", text: "\u2014" }));
      }
      const selected = multiple ? (Array.isArray(current) ? current : []).map(String) : [String(current == null ? "" : current)];
      options.forEach((opt) => {
        const ov = String(opt.value ?? "");
        const option = el6("option", { value: ov, text: opt.label || ov });
        if (selected.includes(ov)) option.selected = true;
        control.appendChild(option);
      });
    } else if (type === "radio" || type === "button_group") {
      control = el6("div", { className: "bl-blocks-fields__choices" });
      options.forEach((opt, i) => {
        const ov = String(opt.value ?? "");
        const oid = id + "-" + i;
        const input = el6("input", {
          type: "radio",
          name: id,
          id: oid,
          value: ov,
          checked: String(current) === ov
        });
        control.appendChild(
          el6("label", { className: "bl-blocks-fields__choice" }, [
            input,
            document.createTextNode(" " + (opt.label || ov))
          ])
        );
      });
    } else if (type === "checkboxes") {
      control = el6("div", { className: "bl-blocks-fields__choices" });
      const list = Array.isArray(current) ? current.map(String) : [];
      options.forEach((opt, i) => {
        const ov = String(opt.value ?? "");
        const oid = id + "-" + i;
        const input = el6("input", {
          type: "checkbox",
          id: oid,
          value: ov,
          checked: list.includes(ov)
        });
        control.appendChild(
          el6("label", { className: "bl-blocks-fields__choice" }, [
            input,
            document.createTextNode(" " + (opt.label || ov))
          ])
        );
      });
    } else if (type === "toggle" || type === "terms") {
      const input = el6("input", {
        type: "checkbox",
        id,
        checked: !!current && current !== "0" && current !== ""
      });
      control = el6("label", { className: "bl-blocks-fields__toggle" }, [
        input,
        document.createTextNode(" " + (field.label || name))
      ]);
    } else if (type === "hidden") {
      control = el6("input", {
        type: "hidden",
        id,
        value: current == null ? "" : String(current)
      });
    } else if (type === "page") {
      control = createPagePickerControl(field, current);
      if (control) control.id = id;
    } else if (type === "link") {
      control = createLinkControl(field, current);
      if (control) control.id = id;
    } else {
      let inputType = "text";
      if (type === "email" || type === "url" || type === "number" || type === "date" || type === "time") {
        inputType = type;
      } else if (type === "phone") {
        inputType = "tel";
      } else if (type === "datetime") {
        inputType = "datetime-local";
      }
      control = el6("input", {
        className: "widefat",
        type: inputType,
        id,
        value: current == null ? "" : String(current)
      });
      if (field.placeholder) control.placeholder = field.placeholder;
    }
    if (control) {
      row.appendChild(control);
      controls.push({ field, control, type });
    }
    if (field.description) {
      row.appendChild(el6("p", { className: "description", text: field.description }));
    }
    return row;
  }
  function createFieldForm(fields, values = {}) {
    const root = el6("div", { className: "bl-blocks-fields", dataset: { blBlocksFields: "" } });
    const entries = [];
    const walk = (list, parent, valueMap) => {
      (list || []).forEach((field) => {
        if (!field || field.active === false) return;
        const type = field.type || "text";
        if (isLayout(type)) {
          const design = ["standard", "outline", "card"].includes(field.design) ? field.design : "standard";
          const layoutClass = [
            "bl-blocks-fields__layout",
            "bl-blocks-fields__layout--" + type,
            "bl-blocks-fields__layout--" + design
          ];
          if (field.css_class) {
            layoutClass.push(String(field.css_class).trim());
          }
          const wrap = el6("div", { className: layoutClass.filter(Boolean).join(" ") });
          const showTitle = type !== "section" || field.show_title !== false && field.show_title !== 0 && field.show_title !== "0";
          if (type === "section" && showTitle && field.label) {
            wrap.appendChild(el6("h3", { className: "bl-blocks-fields__section-title", text: field.label }));
          }
          parent.appendChild(wrap);
          walk(field.children || [], wrap, valueMap);
          return;
        }
        if (type === "heading") {
          if (field.label) {
            parent.appendChild(el6("h4", { className: "bl-blocks-fields__heading", text: field.label }));
          }
          return;
        }
        if (type === "text_block" || type === "html") {
          const content = field.default_value || field.content || field.label || "";
          if (content) {
            parent.appendChild(el6("div", { className: "bl-blocks-fields__static", html: content }));
          }
          return;
        }
        if (isStatic(type)) return;
        if (type === "repeater") {
          parent.appendChild(createRepeaterControl(field, valueMap, entries));
          return;
        }
        const leafControls = [];
        const row = createLeafControl(field, valueMap, leafControls);
        if (row) {
          parent.appendChild(row);
          leafControls.forEach((c) => entries.push({ kind: "leaf", ...c }));
        }
      });
    };
    walk(fields, root, values || {});
    const getValues = () => {
      const out = {};
      entries.forEach((entry) => {
        if (entry.kind === "repeater" && typeof entry.getRows === "function") {
          if (entry.field.name) {
            out[entry.field.name] = entry.getRows();
          }
          return;
        }
        if (entry.kind === "leaf") {
          const val = collectLeafValue(entry.field, entry.control, entry.type);
          if (entry.field.name) {
            out[entry.field.name] = val;
          }
        }
      });
      return out;
    };
    return { root, getValues };
  }
  function createRepeaterControl(field, valueMap, entries) {
    const name = field.name || "";
    const children = Array.isArray(field.children) ? field.children : [];
    const minRows = Math.max(0, parseInt(field.min_rows, 10) || 0);
    const maxRows = Math.max(0, parseInt(field.max_rows, 10) || 0);
    const buttonLabel = field.button_label || i18n3("addRow", "Add row");
    const design = ["standard", "outline", "card"].includes(field.design) ? field.design : "standard";
    const showTitle = field.show_title !== false && field.show_title !== 0 && field.show_title !== "0";
    let rows = Array.isArray(valueMap[name]) ? valueMap[name].slice() : [];
    while (rows.length < minRows) {
      rows.push({});
    }
    const classNames = ["bl-blocks-fields__repeater", "bl-blocks-fields__repeater--" + design];
    if (field.css_class) {
      classNames.push(String(field.css_class).trim());
    }
    const wrap = el6("div", {
      className: classNames.filter(Boolean).join(" "),
      dataset: { fieldName: name }
    });
    if (showTitle && !field.hide_label && field.label) {
      wrap.appendChild(el6("div", { className: "bl-blocks-fields__label", text: field.label }));
    }
    if (field.description) {
      wrap.appendChild(el6("p", { className: "description", text: field.description }));
    }
    const rowsEl = el6("div", { className: "bl-blocks-fields__repeater-rows" });
    const rowForms = [];
    const syncRowTitles = () => {
      Array.from(rowsEl.children).forEach((rowEl, i) => {
        const title = rowEl.querySelector(".bl-blocks-fields__repeater-row-title");
        if (title) {
          const template = i18n3("rowLabel", "Row %d");
          title.textContent = template.replace("%d", String(i + 1));
        }
      });
    };
    const canAdd = () => maxRows === 0 || rowForms.length < maxRows;
    const canRemove = () => rowForms.length > minRows;
    const addBtn = el6("button", {
      type: "button",
      className: "button bl-blocks-fields__repeater-add",
      text: buttonLabel
    });
    const refreshAddBtn = () => {
      addBtn.disabled = !canAdd();
    };
    const mountRow = (rowValues) => {
      const rowEl = el6("div", { className: "bl-blocks-fields__repeater-row" });
      const header = el6("div", { className: "bl-blocks-fields__repeater-row-header" }, [
        el6("span", { className: "bl-blocks-fields__repeater-row-title", text: "" })
      ]);
      const removeBtn = el6("button", {
        type: "button",
        className: "button-link-delete bl-blocks-fields__repeater-remove",
        text: i18n3("removeRow", "Remove row")
      });
      header.appendChild(removeBtn);
      rowEl.appendChild(header);
      const form = createFieldForm(children, rowValues || {});
      rowEl.appendChild(form.root);
      rowsEl.appendChild(rowEl);
      const entry = { getValues: form.getValues, rowEl, removeBtn };
      rowForms.push(entry);
      removeBtn.addEventListener("click", () => {
        if (!canRemove()) return;
        const idx = rowForms.indexOf(entry);
        if (idx >= 0) rowForms.splice(idx, 1);
        rowEl.remove();
        syncRowTitles();
        refreshAddBtn();
        rowForms.forEach((r) => {
          r.removeBtn.disabled = !canRemove();
        });
      });
      removeBtn.disabled = !canRemove();
      syncRowTitles();
      refreshAddBtn();
    };
    rows.forEach((rowValues) => mountRow(rowValues));
    if (rows.length === 0 && minRows === 0) {
    }
    addBtn.addEventListener("click", () => {
      if (!canAdd()) return;
      mountRow({});
      rowForms.forEach((r) => {
        r.removeBtn.disabled = !canRemove();
      });
    });
    wrap.appendChild(rowsEl);
    wrap.appendChild(addBtn);
    refreshAddBtn();
    entries.push({
      kind: "repeater",
      field,
      getRows: () => rowForms.map((r) => r.getValues())
    });
    return wrap;
  }
  function openFieldsModal(opts) {
    const title = opts.title || i18n3("edit", "Edit");
    const form = createFieldForm(opts.fields || [], opts.values || {});
    const overlay = el6("div", { className: "bl-blocks-modal-overlay", role: "presentation" });
    const dialog = el6("div", {
      className: "bl-blocks-modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title
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
    const header = el6("div", { className: "bl-blocks-modal__header" }, [
      el6("h2", { className: "bl-blocks-modal__title", text: title }),
      el6("button", {
        type: "button",
        className: "bl-blocks-modal__close",
        text: "\xD7",
        "aria-label": i18n3("close", "Close"),
        onClick: close
      })
    ]);
    const body = el6("div", { className: "bl-blocks-modal__body" }, [form.root]);
    const footer = el6("div", { className: "bl-blocks-modal__footer" }, [
      el6("button", {
        type: "button",
        className: "button",
        text: i18n3("cancel", "Cancel"),
        onClick: close
      }),
      el6("button", {
        type: "button",
        className: "button button-primary",
        text: i18n3("save", "Save"),
        onClick: () => {
          if (typeof opts.onSave === "function") {
            opts.onSave(form.getValues());
          }
          close();
        }
      })
    ]);
    dialog.append(header, body, footer);
    overlay.appendChild(dialog);
    overlay.addEventListener("click", (evt) => {
      if (evt.target === overlay) close();
    });
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKey);
    const first = dialog.querySelector("input, textarea, select, button");
    if (first && typeof first.focus === "function") {
      setTimeout(() => first.focus(), 0);
    }
    return { close, getValues: form.getValues };
  }
  window.blBlocksFieldUiApi = {
    createFieldForm,
    openFieldsModal,
    bindPagePickers,
    bindLinkFields
  };
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      bindPagePickers(document);
      bindLinkFields(document);
    });
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/admin.js
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-bl-blocks-builder]");
    const input = document.getElementById("bl-forms-config-json");
    if (!root || !input) return;
    let initial = { fields: [], settings: {} };
    try {
      initial = JSON.parse(input.value || "{}") || initial;
    } catch (e) {
    }
    const type = root.dataset.blBlockType || window.blBlocksAdmin && window.blBlocksAdmin.type || "block";
    mountApp(root, initial, type);
  });
})();
//# sourceMappingURL=blocks-admin.js.map
