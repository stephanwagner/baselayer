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
        <h2 id="bl-icon-picker-modal-title" class="bl-icon-picker-modal__title">${t2("choose", "Choose icon")}</h2>
        <button type="button" class="bl-icon-picker-modal__close" data-bl-icon-picker-close aria-label="${t2("close", "Close")}">
          <span class="dashicons dashicons-no-alt" aria-hidden="true"></span>
        </button>
      </header>
      <div class="bl-icon-picker-modal__body bl-icon-picker__panel">
        <div class="bl-icon-picker__toolbar">
          <input type="search" class="bl-icon-picker-modal__search" data-bl-icon-picker-search placeholder="${t2("search", "Search icons\u2026")}" autocomplete="off">
          <div class="bl-icon-picker__variant bl-icon-picker-modal__variant" role="group" aria-label="${t2("style", "Style")}">
            <button type="button" class="button button-secondary" data-bl-icon-picker-variant="outline">${t2("outline", "Outline")}</button>
            <button type="button" class="button button-secondary" data-bl-icon-picker-variant="fill">${t2("filled", "Filled")}</button>
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
  var iconL10n2, iconLabels, categoryLabels, uiStrings, t2, humanize, iconName, categoryName, iconPickerService;
  var init_icon_picker_service = __esm({
    "themes/baselayer/src/js/editor/icons/icon-picker-service.js"() {
      init_icon_catalog();
      init_icon_variant();
      iconL10n2 = () => typeof window !== "undefined" && window.baselayerIcons || {};
      iconLabels = () => iconL10n2().labels || {};
      categoryLabels = () => iconL10n2().categories || {};
      uiStrings = () => iconL10n2().ui || {};
      t2 = (key, fallback) => uiStrings()[key] || fallback;
      humanize = (slug) => slug.replace(/-/g, " ").replace(/^\w/, (char) => char.toUpperCase());
      iconName = (icon, labels) => icon.label || labels[icon.filename] || humanize(icon.filename);
      categoryName = (category, labels) => category.label || labels[category.slug] || humanize(category.slug);
      iconPickerService = createIconPickerService();
    }
  });

  // themes/baselayer/packages/baselayer-forms/src/js/admin/dom.js
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
      else if (key === "html") appendSafeHelpHtml(node, value);
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
  function appendSafeHelpHtml(node, html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    const appendFrom = (parent, target) => {
      parent.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          target.appendChild(document.createTextNode(child.textContent || ""));
          return;
        }
        if (child.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        const tag = child.tagName.toLowerCase();
        if (tag === "b" || tag === "i") {
          const elNode = document.createElement(tag);
          appendFrom(child, elNode);
          target.appendChild(elNode);
          return;
        }
        if (tag === "span") {
          const span = document.createElement("span");
          span.style.whiteSpace = "nowrap";
          appendFrom(child, span);
          target.appendChild(span);
          return;
        }
        appendFrom(child, target);
      });
    };
    appendFrom(template.content, node);
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
  function cloneFieldData(data) {
    const copy = JSON.parse(JSON.stringify(data || {}));
    const reserved = new Set(collectFieldNames().map((n) => n.toLowerCase()));
    const mintName = (base) => {
      const root = slugifyName(base);
      if (!reserved.has(root)) {
        reserved.add(root);
        return root;
      }
      let i = 2;
      while (reserved.has(`${root}_${i}`)) {
        i += 1;
      }
      const next = `${root}_${i}`;
      reserved.add(next);
      return next;
    };
    const walk = (node) => {
      if (!node || typeof node !== "object") {
        return;
      }
      node.id = uid();
      if (node.name != null && String(node.name).trim() !== "") {
        node.name = mintName(node.name);
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    };
    walk(copy);
    return copy;
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
      base.extensions = type === "image" ? "jpg, jpeg, png, webp, gif, heic, avif" : "";
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

  // themes/baselayer/packages/baselayer-forms/src/js/admin/conditional-logic.js
  var LOGIC_SOURCE_EXCLUDE = [
    "column",
    "section",
    "divider",
    "spacer",
    "heading",
    "text_block",
    "html",
    "captcha",
    "honeypot"
  ];
  var OPS_TOGGLE = ["checked", "not_checked"];
  var OPS_CHOICE = ["==", "!=", "==empty", "!=empty"];
  var OPS_MULTI = ["contains", "not_contains", "==empty", "!=empty"];
  var OPS_TEXT = ["==", "!=", "contains", "not_contains", "==empty", "!=empty"];
  var OPS_NUMBER = ["==", "!=", ">", "<", ">=", "<=", "==empty", "!=empty"];
  var OPS_TEMPORAL = ["==", "!=", ">", "<", "==empty", "!=empty"];
  var OPS_FILE = ["==empty", "!=empty"];
  var ALL_OPERATORS = [
    ...OPS_TOGGLE,
    ...OPS_CHOICE,
    ...OPS_MULTI,
    ...OPS_TEXT,
    ...OPS_NUMBER,
    ...OPS_TEMPORAL
  ];
  function operatorsForType(type) {
    switch (type) {
      case "toggle":
      case "terms":
        return [...OPS_TOGGLE];
      case "radio":
      case "select":
      case "button_group":
        return [...OPS_CHOICE];
      case "checkboxes":
        return [...OPS_MULTI];
      case "number":
        return [...OPS_NUMBER];
      case "date":
      case "time":
      case "datetime":
        return [...OPS_TEMPORAL];
      case "file":
      case "image":
        return [...OPS_FILE];
      case "text":
      case "textarea":
      case "email":
      case "url":
      case "phone":
      case "hidden":
        return [...OPS_TEXT];
      default:
        return [...OPS_TEXT];
    }
  }
  function operatorNeedsValue(operator) {
    return !["checked", "not_checked", "==empty", "!=empty"].includes(operator);
  }
  function operatorLabel(operator) {
    const map = {
      checked: t("logicOpChecked", "Checked"),
      not_checked: t("logicOpNotChecked", "Not checked"),
      "==": t("logicOpEquals", "Is equal to"),
      "!=": t("logicOpNotEquals", "Is not equal to"),
      contains: t("logicOpContains", "Contains"),
      not_contains: t("logicOpNotContains", "Does not contain"),
      "==empty": t("logicOpEmpty", "Has no value"),
      "!=empty": t("logicOpNotEmpty", "Has any value"),
      ">": t("logicOpGreater", "Greater than"),
      "<": t("logicOpLess", "Less than"),
      ">=": t("logicOpGreaterOrEqual", "Greater than or equal to"),
      "<=": t("logicOpLessOrEqual", "Less than or equal to")
    };
    return map[operator] || operator;
  }
  function normalizeConditionalLogic(raw) {
    const empty = { enabled: false, groups: [] };
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return empty;
    }
    const groupsIn = Array.isArray(raw.groups) ? raw.groups : [];
    const groups = [];
    groupsIn.forEach((group) => {
      if (!Array.isArray(group)) {
        return;
      }
      const rules = [];
      group.forEach((rule) => {
        if (!rule || typeof rule !== "object") {
          return;
        }
        const fieldId = String(rule.field || "").trim();
        const operator = String(rule.operator || "").trim();
        if (!fieldId || !ALL_OPERATORS.includes(operator)) {
          return;
        }
        rules.push({
          field: fieldId,
          operator,
          value: operatorNeedsValue(operator) ? String(rule.value ?? "") : ""
        });
      });
      if (rules.length) {
        groups.push(rules);
      }
    });
    return {
      enabled: !!raw.enabled && groups.length > 0,
      groups
    };
  }
  function readConditionalLogicFromDom(body) {
    if (!body) {
      return null;
    }
    const input = body.querySelector("[data-bl-conditional-logic]");
    if (!input) {
      return null;
    }
    try {
      const parsed = JSON.parse(input.value || "{}");
      const logic = normalizeConditionalLogic(parsed);
      return logic.enabled || logic.groups.length ? logic : { enabled: false, groups: [] };
    } catch (e) {
      return { enabled: false, groups: [] };
    }
  }
  function collectLogicSourceFields(exceptId = "", options = {}) {
    const includeSelf = !!options.includeSelf;
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    const push = (entry) => {
      if (!entry?.id || seen.has(entry.id)) {
        return;
      }
      const isSelf = !!entry.isSelf;
      if (isSelf && !includeSelf) {
        return;
      }
      if (!isSelf && LOGIC_SOURCE_EXCLUDE.includes(entry.type)) {
        return;
      }
      seen.add(entry.id);
      out.push(entry);
    };
    document.querySelectorAll(".bl-forms-builder__field[data-bl-forms-field]").forEach((row) => {
      const id = row.dataset.fieldId || "";
      const type = row.dataset.fieldType || "";
      if (!id) {
        return;
      }
      const labelInput = row.querySelector("[data-bl-label]");
      const sectionLabel = row.querySelector(".bl-forms-builder__section-label-input");
      const preview = row.querySelector(":scope > .bl-forms-builder__field-header .bl-forms-builder__preview");
      const label = (labelInput?.value || "").trim() || (sectionLabel?.value || "").trim() || (preview?.textContent || "").trim() || typeLabel(type);
      const fieldOptions = Array.from(row.querySelectorAll("[data-bl-option]")).map((opt) => ({
        label: opt.querySelector("[data-bl-opt-label]")?.value || "",
        value: opt.querySelector("[data-bl-opt-value]")?.value || ""
      }));
      push({ id, type, label, options: fieldOptions, isSelf: id === exceptId });
    });
    flattenFields(readConfig().fields || []).forEach((field) => {
      if (!field?.id || seen.has(field.id)) {
        return;
      }
      const type = field.type || "text";
      push({
        id: field.id,
        type,
        label: (field.label || "").trim() || typeLabel(type),
        options: Array.isArray(field.options) ? field.options : [],
        isSelf: field.id === exceptId
      });
    });
    return out;
  }
  function selectableSources(sources) {
    return (sources || []).filter((s) => !s.isSelf);
  }
  function emptyRule(sources) {
    const first = selectableSources(sources)[0];
    const ops = first ? operatorsForType(first.type) : ["=="];
    return {
      field: first?.id || "",
      operator: ops[0] || "==",
      value: ""
    };
  }
  function createConditionalLogicEditor(field, getSources = () => collectLogicSourceFields(field.id, { includeSelf: true }), onChange = null) {
    if (!field.conditional_logic || typeof field.conditional_logic !== "object") {
      field.conditional_logic = { enabled: false, groups: [] };
    } else {
      field.conditional_logic = normalizeConditionalLogic(field.conditional_logic);
    }
    const wrap = el("div", { className: "bl-forms-builder__logic" });
    const hidden = el("input", {
      type: "hidden",
      dataset: { blConditionalLogic: "1" }
    });
    const syncHidden = (notify = true) => {
      hidden.value = JSON.stringify(normalizeConditionalLogic(field.conditional_logic));
      if (typeof onChange === "function") {
        onChange();
      }
      if (notify) {
        document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
      }
    };
    const getGroup = (groupIndex) => field.conditional_logic.groups[groupIndex];
    const getRule = (groupIndex, ruleIndex) => getGroup(groupIndex)?.[ruleIndex];
    const groupsMount = el("div", { className: "bl-forms-builder__logic-groups" });
    const renderValueControl = (groupIndex, ruleIndex, source) => {
      const rule = getRule(groupIndex, ruleIndex);
      if (!rule) {
        return el("span", { className: "bl-forms-builder__logic-value-empty", "aria-hidden": "true" });
      }
      if (!operatorNeedsValue(rule.operator)) {
        return el("span", { className: "bl-forms-builder__logic-value-empty", "aria-hidden": "true" });
      }
      const options = Array.isArray(source?.options) ? source.options.filter((o) => (o.value || "").trim() !== "") : [];
      if (options.length && ["radio", "select", "button_group", "checkboxes"].includes(source?.type)) {
        const select = el("select", {
          className: "bl-forms-builder__logic-value",
          "aria-label": t("logicValue", "Value")
        });
        select.appendChild(el("option", { value: "", text: t("logicSelectValue", "\u2014 Select \u2014") }));
        options.forEach((opt) => {
          select.appendChild(
            el("option", {
              value: opt.value,
              text: opt.label || opt.value
            })
          );
        });
        select.value = rule.value || "";
        if (rule.value && select.value !== rule.value) {
          select.appendChild(el("option", { value: rule.value, text: rule.value }));
          select.value = rule.value;
        }
        select.addEventListener("change", () => {
          const live = getRule(groupIndex, ruleIndex);
          if (!live) {
            return;
          }
          live.value = select.value;
          syncHidden();
        });
        return select;
      }
      const input = el("input", {
        type: source?.type === "number" ? "number" : "text",
        className: "widefat bl-forms-builder__logic-value",
        value: rule.value || "",
        "aria-label": t("logicValue", "Value")
      });
      input.addEventListener("input", () => {
        const live = getRule(groupIndex, ruleIndex);
        if (!live) {
          return;
        }
        live.value = input.value;
        syncHidden();
      });
      return input;
    };
    const renderRuleRow = (groupIndex, ruleIndex, sources) => {
      const rule = getRule(groupIndex, ruleIndex);
      if (!rule) {
        return el("div", { className: "bl-forms-builder__logic-rule" });
      }
      const selectable = selectableSources(sources);
      let source = selectable.find((s) => s.id === rule.field) || null;
      if (!rule.field && selectable[0]) {
        rule.field = selectable[0].id;
        source = selectable[0];
      }
      const ops = source ? operatorsForType(source.type) : ["==", "!=", "==empty", "!=empty"];
      if (source && !ops.includes(rule.operator)) {
        rule.operator = ops[0];
        if (!operatorNeedsValue(rule.operator)) {
          rule.value = "";
        }
      } else if (!ops.includes(rule.operator) && rule.operator) {
        ops.unshift(rule.operator);
      }
      const fieldSelect = el("select", {
        className: "bl-forms-builder__logic-field",
        "aria-label": t("logicField", "Field")
      });
      if (!selectable.length && !rule.field) {
        fieldSelect.appendChild(
          el("option", { value: "", text: t("logicNoFields", "No fields available") })
        );
        fieldSelect.disabled = true;
      } else {
        sources.forEach((s) => {
          const opt = el("option", {
            value: s.id,
            text: s.isSelf ? `${s.label} (${typeLabel(s.type)}) \u2014 ${t("logicThisField", "This field")}` : `${s.label} (${typeLabel(s.type)})`
          });
          if (s.isSelf) {
            opt.disabled = true;
          }
          fieldSelect.appendChild(opt);
        });
        if (rule.field && !sources.some((s) => s.id === rule.field)) {
          fieldSelect.appendChild(
            el("option", {
              value: rule.field,
              text: t("logicMissingField", "Missing field")
            })
          );
        }
        fieldSelect.value = rule.field || selectable[0]?.id || "";
      }
      const opSelect = el("select", {
        className: "bl-forms-builder__logic-operator",
        "aria-label": t("logicOperator", "Operator")
      });
      ops.forEach((op) => {
        opSelect.appendChild(el("option", { value: op, text: operatorLabel(op) }));
      });
      opSelect.value = rule.operator;
      const valueSlot = el("div", { className: "bl-forms-builder__logic-value-slot" });
      const refreshValue = () => {
        const live = getRule(groupIndex, ruleIndex);
        const liveSource = selectable.find((s) => s.id === live?.field) || null;
        valueSlot.replaceChildren(renderValueControl(groupIndex, ruleIndex, liveSource));
      };
      refreshValue();
      fieldSelect.addEventListener("change", () => {
        const live = getRule(groupIndex, ruleIndex);
        if (!live) {
          return;
        }
        live.field = fieldSelect.value;
        source = selectable.find((s) => s.id === live.field) || null;
        const nextOps = source ? operatorsForType(source.type) : ["=="];
        live.operator = nextOps.includes(live.operator) ? live.operator : nextOps[0];
        if (!operatorNeedsValue(live.operator)) {
          live.value = "";
        }
        renderGroups();
        syncHidden();
      });
      opSelect.addEventListener("change", () => {
        const live = getRule(groupIndex, ruleIndex);
        if (!live) {
          return;
        }
        live.operator = opSelect.value;
        if (!operatorNeedsValue(live.operator)) {
          live.value = "";
        }
        refreshValue();
        syncHidden();
      });
      const deleteBtn = el("button", {
        type: "button",
        className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger",
        title: t("delete", "Delete"),
        "aria-label": t("delete", "Delete"),
        onClick: () => {
          const group = getGroup(groupIndex);
          if (!group) {
            return;
          }
          group.splice(ruleIndex, 1);
          if (!group.length) {
            field.conditional_logic.groups.splice(groupIndex, 1);
          }
          renderGroups();
          syncHidden();
        }
      });
      deleteBtn.textContent = "\xD7";
      return el("div", { className: "bl-forms-builder__logic-rule" }, [
        fieldSelect,
        opSelect,
        valueSlot,
        deleteBtn
      ]);
    };
    const renderGroup = (groupIndex, sources) => {
      const group = getGroup(groupIndex);
      if (!group) {
        return el("div", { className: "bl-forms-builder__logic-group" });
      }
      const box = el("div", { className: "bl-forms-builder__logic-group" });
      const label = groupIndex === 0 ? t("logicShowIf", "Show this field if") : t("logicOrIf", "or if");
      box.appendChild(el("p", { className: "bl-forms-builder__logic-group-label", text: label }));
      const rulesWrap = el("div", { className: "bl-forms-builder__logic-rules" });
      group.forEach((_, ruleIndex) => {
        if (ruleIndex > 0) {
          rulesWrap.appendChild(
            el("p", { className: "bl-forms-builder__logic-and", text: t("logicAnd", "and") })
          );
        }
        rulesWrap.appendChild(renderRuleRow(groupIndex, ruleIndex, sources));
      });
      box.appendChild(rulesWrap);
      box.appendChild(
        el("button", {
          type: "button",
          className: "button bl-button-small",
          text: t("logicAddRule", "Add rule"),
          onClick: () => {
            const liveGroup = getGroup(groupIndex);
            if (!liveGroup) {
              return;
            }
            liveGroup.push(emptyRule(getSources()));
            renderGroups();
            syncHidden();
          }
        })
      );
      return box;
    };
    const renderGroups = () => {
      const sources = getSources();
      groupsMount.replaceChildren();
      if (!field.conditional_logic.enabled) {
        return;
      }
      if (!field.conditional_logic.groups.length) {
        field.conditional_logic.groups.push([emptyRule(sources)]);
      }
      field.conditional_logic.groups.forEach((_, index) => {
        if (index > 0) {
          groupsMount.appendChild(
            el("p", { className: "bl-forms-builder__logic-or", text: t("logicOr", "or") })
          );
        }
        groupsMount.appendChild(renderGroup(index, sources));
      });
      groupsMount.appendChild(
        el("button", {
          type: "button",
          className: "button bl-button-small bl-forms-builder__logic-add-group",
          text: t("logicAddGroup", "Add rule group"),
          onClick: () => {
            field.conditional_logic.groups.push([emptyRule(getSources())]);
            renderGroups();
            syncHidden();
          }
        })
      );
    };
    const enableSwitch = (() => {
      const input = el("input", {
        type: "checkbox",
        checked: !!field.conditional_logic.enabled
      });
      input.addEventListener("change", () => {
        field.conditional_logic.enabled = input.checked;
        if (input.checked && !field.conditional_logic.groups.length) {
          field.conditional_logic.groups = [[emptyRule(getSources())]];
        }
        renderGroups();
        syncHidden();
      });
      return el("div", { className: "bl-forms-builder__switch-setting" }, [
        el("label", { className: "bl-forms-builder__switch" }, [
          input,
          el("span", { className: "bl-forms-builder__switch-ui", "aria-hidden": "true" }),
          el("span", {
            className: "bl-forms-builder__switch-label",
            text: t("logicEnable", "Conditional logic")
          })
        ])
      ]);
    })();
    wrap.append(
      enableSwitch,
      el("p", {
        className: "description bl-forms-builder__logic-help",
        text: t(
          "logicHelp",
          "Show this field only when the conditions below are met."
        )
      }),
      groupsMount,
      hidden
    );
    renderGroups();
    syncHidden(false);
    wrap.refreshLogicSources = () => {
      if (!wrap.isConnected) {
        return;
      }
      renderGroups();
      syncHidden(false);
    };
    return wrap;
  }

  // themes/baselayer/packages/baselayer-forms/src/js/admin/layout.js
  var NESTED_BLOCKED = ["column", "section", "hidden", "honeypot", "captcha"];
  var columnFieldByEl = /* @__PURE__ */ new WeakMap();
  var sectionFieldByEl = /* @__PURE__ */ new WeakMap();
  function createNestedSortable(list, options) {
    const Builder = window.BlCanvasBuilder;
    if (!Builder || typeof Builder.createSortable !== "function") {
      console.error("BlCanvasBuilder.createSortable is required for nested field lists");
      return null;
    }
    return Builder.createSortable(list, options);
  }
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
    const Builder = window.BlCanvasBuilder;
    const onStart = Builder?.dragStart || (() => {
    });
    const onEnd = Builder?.dragEnd || (() => {
    });
    createNestedSortable(list, {
      group: {
        name: "bl-forms-fields",
        put(to, from, dragEl) {
          const type = dragEl.dataset.fieldType || "";
          return !NESTED_BLOCKED.includes(type);
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
  function applyColumnWidthToCard(el3, width, widthCustom = "") {
    el3.dataset.fieldWidth = width;
    if (width === "custom") {
      el3.dataset.fieldWidthCustom = widthCustom || "";
    } else {
      delete el3.dataset.fieldWidthCustom;
    }
    const field = columnFieldByEl.get(el3);
    if (field) {
      field.width = width;
      field.width_custom = width === "custom" ? widthCustom || "" : "";
    }
    const badge = el3.querySelector(":scope > .bl-forms-builder__field-header .bl-forms-builder__width-badge");
    if (badge) {
      const text = widthBadgeText(width, widthCustom);
      badge.textContent = text;
      badge.hidden = text === "";
    }
  }
  function equalizeColumnRun(list, columnEl) {
    const all = Array.from(list.children).filter((el3) => el3.matches?.("[data-bl-forms-field]"));
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
    run.forEach((el3) => applyColumnWidthToCard(el3, width));
  }
  function createContainerActions(onDelete, onDuplicate) {
    const duplicateBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn",
      title: t("duplicate", "Duplicate"),
      "aria-label": t("duplicate", "Duplicate"),
      onClick: onDuplicate
    });
    const duplicateIcon = iconEl("duplicate");
    if (duplicateIcon.innerHTML) {
      duplicateBtn.appendChild(duplicateIcon);
    } else {
      duplicateBtn.textContent = "\u29C9";
    }
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
    return el("div", { className: "bl-forms-builder__field-actions" }, [duplicateBtn, deleteBtn, handle]);
  }
  function createColumnCard(initial = {}) {
    let field = {
      width: "100",
      width_custom: "",
      children: [],
      design: "standard",
      css_class: "",
      conditional_logic: { enabled: false, groups: [] },
      ...initial,
      id: initial.id || uid(),
      type: "column"
    };
    if (!["standard", "outline", "card"].includes(field.design)) {
      field.design = "standard";
    }
    if (typeof field.css_class !== "string") {
      field.css_class = "";
    }
    field.conditional_logic = normalizeConditionalLogic(field.conditional_logic);
    const row = el("div", {
      className: "bl-forms-builder__field bl-forms-builder__column-card",
      dataset: {
        blFormsField: "1",
        fieldId: field.id,
        fieldType: "column",
        fieldWidth: field.width || "100",
        fieldDesign: field.design || "standard",
        ...field.width === "custom" && field.width_custom ? { fieldWidthCustom: field.width_custom } : {}
      }
    });
    columnFieldByEl.set(row, field);
    const preview = el("span", {
      className: "bl-forms-builder__preview",
      text: window.blFormsAdmin?.i18n?.types?.column || t("columnType", "Columns")
    });
    const widthBadge = el("span", { className: "bl-forms-builder__width-badge" });
    const designBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__design-btn",
      title: t("layoutSettingsTitle", "Settings"),
      "aria-label": t("layoutSettingsTitle", "Settings")
    });
    designBtn.appendChild(iconEl("tune", "bl-forms-builder__design-btn-icon"));
    const typeChip = el("span", { className: "bl-forms-builder__field-type bl-forms-builder__field-type--column" });
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
      const typeChildren = [
        iconEl("column", "bl-forms-builder__field-type-icon"),
        el("span", {
          className: "bl-forms-builder__field-type-label",
          text: window.blFormsAdmin?.i18n?.types?.column || t("columnType", "Columns")
        })
      ];
      const logic = field.conditional_logic;
      if (logic && logic.enabled && Array.isArray(logic.groups) && logic.groups.length > 0) {
        typeChildren.push(
          el("span", {
            className: "bl-forms-builder__field-logic-dot",
            title: t("logicEnable", "Conditional logic"),
            "aria-label": t("logicEnable", "Conditional logic")
          })
        );
      }
      typeChip.replaceChildren(...typeChildren);
    };
    const notify = () => document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    const openWidthModal = () => {
      openFieldWidthModal(field, () => {
        updatePreview();
        notify();
      });
    };
    const openDesignModal = () => {
      openLayoutSettingsModal(
        field,
        () => {
          updatePreview();
          notify();
        },
        {
          tabs: ["design", "logic"],
          logicHelp: t(
            "logicHelpColumn",
            "Show this column only when the conditions below are met."
          )
        }
      );
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
    designBtn.addEventListener("click", openDesignModal);
    const header = el("div", { className: "bl-forms-builder__field-header" }, [
      preview,
      el("div", { className: "bl-forms-builder__field-meta" }, [widthBadge, designBtn, typeChip]),
      createContainerActions(
        () => {
          row.remove();
          notify();
        },
        () => duplicateFieldCard(row)
      )
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
      show_title: true,
      css_class: "",
      conditional_logic: { enabled: false, groups: [] },
      ...initial,
      id: initial.id || uid(),
      type: "section"
    };
    if (!["standard", "outline", "card"].includes(field.design)) {
      field.design = "standard";
    }
    if (field.show_title === false || field.show_title === 0 || field.show_title === "0") {
      field.show_title = false;
    } else {
      field.show_title = true;
    }
    if (typeof field.css_class !== "string") {
      field.css_class = "";
    }
    field.conditional_logic = normalizeConditionalLogic(field.conditional_logic);
    const row = el("div", {
      className: "bl-forms-builder__field bl-forms-builder__section-card",
      dataset: {
        blFormsField: "1",
        fieldId: field.id,
        fieldType: "section",
        fieldWidth: field.width || "100",
        fieldDesign: field.design || "standard",
        fieldShowTitle: field.show_title ? "1" : "0",
        ...field.width === "custom" && field.width_custom ? { fieldWidthCustom: field.width_custom } : {}
      }
    });
    sectionFieldByEl.set(row, field);
    const labelPlaceholder = () => field.show_title ? t("sectionLabelPlaceholder", "Title") : t("sectionLabelPlaceholderHidden", "Name");
    const labelInput = el("input", {
      type: "text",
      className: "bl-forms-builder__section-label-input",
      value: field.label || "",
      placeholder: labelPlaceholder(),
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
      title: t("layoutSettingsTitle", "Settings"),
      "aria-label": t("layoutSettingsTitle", "Settings")
    });
    designBtn.appendChild(iconEl("tune", "bl-forms-builder__design-btn-icon"));
    const typeChip = el("span", {
      className: "bl-forms-builder__field-type bl-forms-builder__field-type--section"
    });
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
      row.dataset.fieldShowTitle = field.show_title ? "1" : "0";
      if (width === "custom") {
        row.dataset.fieldWidthCustom = widthCustom || "";
      } else {
        delete row.dataset.fieldWidthCustom;
      }
      labelInput.placeholder = labelPlaceholder();
      const text = widthBadgeText(width, widthCustom);
      widthBadge.textContent = text;
      widthBadge.hidden = text === "";
      const typeChildren = [
        iconEl("section", "bl-forms-builder__field-type-icon"),
        el("span", {
          className: "bl-forms-builder__field-type-label",
          text: window.blFormsAdmin?.i18n?.types?.section || t("sectionType", "Section")
        })
      ];
      const logic = field.conditional_logic;
      if (logic && logic.enabled && Array.isArray(logic.groups) && logic.groups.length > 0) {
        typeChildren.push(
          el("span", {
            className: "bl-forms-builder__field-logic-dot",
            title: t("logicEnable", "Conditional logic"),
            "aria-label": t("logicEnable", "Conditional logic")
          })
        );
      }
      typeChip.replaceChildren(...typeChildren);
    };
    const notify = () => document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    const openWidthModal = () => {
      openFieldWidthModal(field, () => {
        updatePreview();
        notify();
      });
    };
    const openDesignModal = () => {
      openLayoutSettingsModal(
        field,
        () => {
          updatePreview();
          notify();
        },
        {
          tabs: ["design", "logic"],
          withHideTitle: true,
          logicHelp: t(
            "logicHelpSection",
            "Show this section only when the conditions below are met."
          )
        }
      );
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
      createContainerActions(
        () => {
          row.remove();
          notify();
        },
        () => duplicateFieldCard(row)
      )
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
      const live = columnFieldByEl.get(row);
      const width = row.dataset.fieldWidth || live?.width || "100";
      const widthCustom = row.dataset.fieldWidthCustom || live?.width_custom || "";
      const design = row.dataset.fieldDesign || live?.design || "standard";
      const cssClass = typeof live?.css_class === "string" ? live.css_class : "";
      return {
        id,
        type: "column",
        width,
        width_custom: width === "custom" ? widthCustom : "",
        design,
        css_class: cssClass,
        conditional_logic: normalizeConditionalLogic(live?.conditional_logic),
        children: Array.from(fields?.children || []).filter((el3) => el3.matches("[data-bl-forms-field]") && !NESTED_BLOCKED.includes(el3.dataset.fieldType)).map((child) => serializeRow(child))
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
      const showTitle = row.dataset.fieldShowTitle !== void 0 ? row.dataset.fieldShowTitle !== "0" : live?.show_title !== false;
      const cssClass = typeof live?.css_class === "string" ? live.css_class : "";
      return {
        id,
        type: "section",
        label,
        width,
        width_custom: width === "custom" ? widthCustom : "",
        design,
        show_title: showTitle,
        css_class: cssClass,
        conditional_logic: normalizeConditionalLogic(live?.conditional_logic),
        children: Array.from(fields?.children || []).filter((el3) => el3.matches("[data-bl-forms-field]") && !NESTED_BLOCKED.includes(el3.dataset.fieldType)).map((child) => serializeRow(child))
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
  function createCaptchaSettings(field, onChange) {
    unsetCaptchaFieldKeys(field);
    const configured = !!(window.blFormsAdmin && window.blFormsAdmin.captchaConfigured);
    const settingsUrl = window.blFormsAdmin && window.blFormsAdmin.captchaSettingsUrl || window.blFormsAdmin && window.blFormsAdmin.settingsUrl || "";
    const root = el("div", { className: "bl-forms-builder__captcha" });
    const settingsLink = settingsUrl ? el("a", {
      href: settingsUrl,
      className: "bl-forms-builder__notice-link",
      text: t("captchaOpenSettings", "Open settings")
    }) : null;
    root.append(
      el("p", {
        className: "description",
        text: t("captchaHelp", "Uses the CAPTCHA keys from Forms \u2192 Settings.")
      })
    );
    if (!configured) {
      root.append(
        el(
          "div",
          {
            className: "bl-forms-builder__notice bl-forms-builder__notice--warning",
            role: "status"
          },
          [
            el("span", {
              text: t(
                "captchaNotConfigured",
                "CAPTCHA keys are not configured yet. Add them under Forms \u2192 Settings."
              )
            }),
            settingsLink
          ]
        )
      );
    } else if (settingsLink) {
      root.append(settingsLink);
    }
    void onChange;
    return root;
  }
  function unsetCaptchaFieldKeys(field) {
    delete field.captcha_provider;
    delete field.captcha_site_key;
    delete field.captcha_secret_key;
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
    if (nextType === "checkboxes") {
      if (field.min_selections != null && field.min_selections !== "") {
        const min = parseInt(field.min_selections, 10);
        field.min_selections = Number.isFinite(min) && min >= 1 ? Math.min(50, min) : "";
      }
      if (field.max_selections != null && field.max_selections !== "") {
        const max = parseInt(field.max_selections, 10);
        field.max_selections = Number.isFinite(max) && max >= 1 ? Math.min(50, max) : "";
      }
    } else {
      delete field.min_selections;
      delete field.max_selections;
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
        field.extensions = "jpg, jpeg, png, webp, gif, heic, avif";
      }
      if (field.extensions === void 0) {
        field.extensions = "";
      }
    } else {
      delete field.extensions;
      delete field.preview;
      delete field.max_files;
      delete field.max_size_mb;
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
      delete field.min_length;
      delete field.max_length;
      delete field.show_char_count;
      delete field.char_count_text;
    }
    if (!["text", "email", "phone"].includes(nextType)) {
      delete field.show_in_list;
    } else if ((nextType === "text" || nextType === "email") && field.show_in_list === void 0) {
      field.show_in_list = defaultShowInListForNewField(nextType, field.id);
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
        className: "button bl-button-small",
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
        const on = btn.dataset.value === value;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
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
        const on = btn.dataset.blWidth === "custom";
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
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
        const on = btn.dataset.blHeight === "custom";
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
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
        const on = btn.dataset.blMargin === "custom";
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
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
  function openLayoutSettingsModal(field, onApply, options = {}) {
    document.querySelectorAll(".bl-forms-builder__modal").forEach((node) => node.remove());
    const tabIds = Array.isArray(options.tabs) && options.tabs.length ? options.tabs.filter((id) => ["settings", "design", "logic"].includes(id)) : ["design", "logic"];
    const withHideTitle = !!options.withHideTitle;
    const withWidth = !!options.withWidth;
    const logicHelp = options.logicHelp || t("logicHelpContainer", "Show this block only when the conditions below are met.");
    const designs = [
      { value: "standard", label: t("sectionDesignStandard", "Standard") },
      { value: "outline", label: t("sectionDesignOutline", "Outline") },
      { value: "card", label: t("sectionDesignCard", "Card") }
    ];
    const allowedDesigns = designs.map((item) => item.value);
    const showTitleOn = !withHideTitle || field.show_title !== false && field.show_title !== 0 && field.show_title !== "0";
    const draft = {
      id: field.id,
      type: field.type,
      design: allowedDesigns.includes(field.design) ? field.design : "standard",
      css_class: typeof field.css_class === "string" ? field.css_class : "",
      show_title: showTitleOn,
      width: field.width || "100",
      width_custom: field.width_custom || "",
      name: field.name || "",
      name_manual: field.name_manual !== false,
      min_rows: Math.max(0, parseInt(field.min_rows, 10) || 0),
      max_rows: Math.max(0, parseInt(field.max_rows, 10) || 0),
      button_label: field.button_label || "",
      conditional_logic: normalizeConditionalLogic(
        field.conditional_logic && typeof field.conditional_logic === "object" ? JSON.parse(JSON.stringify(field.conditional_logic)) : { enabled: false, groups: [] }
      )
    };
    let draftHideTitle = withHideTitle ? !draft.show_title : false;
    const tabLabels = {
      settings: t("fieldTabSettings", "Settings"),
      design: t("layoutDesignTitle", "Design"),
      logic: t("fieldTabLogic", "Logic")
    };
    const backdrop = el("div", {
      className: "bl-forms-builder__modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": t("layoutSettingsTitle", "Settings")
    });
    const close = () => {
      document.removeEventListener("keydown", onKey);
      backdrop.remove();
    };
    const apply = () => {
      field.design = draft.design;
      field.css_class = String(draft.css_class || "").trim();
      if (withHideTitle) {
        field.show_title = !draftHideTitle;
      }
      if (withWidth) {
        field.width = draft.width || "100";
        field.width_custom = field.width === "custom" ? draft.width_custom || "" : "";
      }
      if (tabIds.includes("settings")) {
        field.name = String(draft.name || "").trim() || field.name || "items";
        field.name_manual = draft.name_manual !== false;
        field.min_rows = Math.max(0, parseInt(draft.min_rows, 10) || 0);
        field.max_rows = Math.max(0, parseInt(draft.max_rows, 10) || 0);
        field.button_label = String(draft.button_label || "");
      }
      if (tabIds.includes("logic")) {
        field.conditional_logic = normalizeConditionalLogic(draft.conditional_logic);
      }
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
    const dialog = el("div", {
      className: "bl-forms-builder__modal-dialog bl-forms-builder__modal-dialog--settings"
    });
    const tabBar = el("nav", {
      className: "bl-forms-builder__modal-tabs",
      role: "tablist"
    });
    const panelsWrap = el("div", {
      className: "bl-forms-builder__modal-body bl-forms-builder__modal-body--settings"
    });
    const panels = {};
    const tabButtons = {};
    let activeTab = tabIds[0];
    const activate = (id) => {
      activeTab = id;
      tabIds.forEach((tabId) => {
        const on = tabId === id;
        tabButtons[tabId].classList.toggle("is-active", on);
        tabButtons[tabId].setAttribute("aria-selected", on ? "true" : "false");
        panels[tabId].hidden = !on;
        panels[tabId].classList.toggle("is-active", on);
      });
    };
    tabIds.forEach((tabId) => {
      const panel = el("div", {
        className: "bl-forms-builder__modal-panel" + (tabId === "design" ? " bl-forms-builder__modal-body--design" : ""),
        role: "tabpanel",
        dataset: { blModalPanel: tabId }
      });
      panels[tabId] = panel;
      panelsWrap.appendChild(panel);
      const btn = el("button", {
        type: "button",
        className: "bl-forms-builder__modal-tab",
        role: "tab",
        text: tabLabels[tabId] || tabId,
        dataset: { blModalTab: tabId },
        onClick: () => activate(tabId)
      });
      tabButtons[tabId] = btn;
      tabBar.appendChild(btn);
    });
    if (tabIds.includes("settings")) {
      const settingsPanel = panels.settings;
      const nameInput = el("input", {
        type: "text",
        className: "widefat",
        value: draft.name || "",
        placeholder: "items"
      });
      nameInput.addEventListener("input", () => {
        draft.name_manual = true;
        draft.name = nameInput.value;
      });
      const minInput = el("input", {
        type: "number",
        className: "widefat",
        min: "0",
        value: String(draft.min_rows || 0)
      });
      minInput.addEventListener("input", () => {
        draft.min_rows = Math.max(0, parseInt(minInput.value, 10) || 0);
      });
      const maxInput = el("input", {
        type: "number",
        className: "widefat",
        min: "0",
        value: String(draft.max_rows || 0)
      });
      maxInput.addEventListener("input", () => {
        draft.max_rows = Math.max(0, parseInt(maxInput.value, 10) || 0);
      });
      const buttonInput = el("input", {
        type: "text",
        className: "widefat",
        value: draft.button_label || "",
        placeholder: t("addRow", "Add row")
      });
      buttonInput.addEventListener("input", () => {
        draft.button_label = buttonInput.value;
      });
      settingsPanel.append(
        el("p", {}, [el("label", { text: t("name", "Field name") }), nameInput]),
        el("p", {
          className: "description",
          text: t(
            "nameHelp",
            "Internal field key used in submissions, emails, and entry data."
          )
        }),
        el("p", {}, [el("label", { text: t("repeaterMinRows", "Min rows") }), minInput]),
        el("p", {}, [
          el("label", { text: t("repeaterMaxRows", "Max rows (0 = unlimited)") }),
          maxInput
        ]),
        el("p", {}, [el("label", { text: t("repeaterButtonLabel", "Add button label") }), buttonInput])
      );
    }
    if (tabIds.includes("design")) {
      const designPanel = panels.design;
      if (withHideTitle) {
        designPanel.appendChild(
          createSwitchSetting("blHideTitle", t("sectionHideTitle", "Hide title"), draftHideTitle, (checked) => {
            draftHideTitle = checked;
          })
        );
      }
      const designWrap = el("div", { className: "bl-forms-builder__design-style" });
      designWrap.append(
        settingHeading(t("layoutDesignStyle", "Style")),
        createSegmentedControl(designs, draft.design, "blDesignGroup", (value) => {
          draft.design = value;
        })
      );
      designPanel.appendChild(designWrap);
      if (withWidth) {
        designPanel.appendChild(createWidthControl(draft, () => {
        }, { showLabel: true }));
      }
      const cssInput = el("input", {
        type: "text",
        className: "widefat",
        dataset: { blCssClass: "1" },
        value: draft.css_class,
        placeholder: t("cssClassPlaceholder", "e.g. my-field")
      });
      cssInput.addEventListener("input", () => {
        draft.css_class = cssInput.value;
      });
      const cssWrap = el("div", { className: "bl-forms-builder__css-class" });
      cssWrap.appendChild(el("p", {}, [el("label", { text: t("cssClass", "CSS class") }), cssInput]));
      cssWrap.appendChild(
        el("p", {
          className: "description",
          text: t("cssClassHelp", "Optional class names added to this field\u2019s wrapper.")
        })
      );
      designPanel.appendChild(cssWrap);
    }
    if (tabIds.includes("logic")) {
      const logicPanel = panels.logic;
      const editor = createConditionalLogicEditor(draft, void 0, null);
      const help = editor.querySelector(".bl-forms-builder__logic-help");
      if (help) {
        help.textContent = logicHelp;
      }
      logicPanel.appendChild(editor);
    }
    activate(activeTab);
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
    const header = el("div", { className: "bl-forms-builder__modal-header bl-forms-builder__modal-header--tabs" }, [
      tabBar
    ]);
    dialog.append(header, panelsWrap, footer);
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
      const on = btn.dataset.blWidth === width;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
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
      const option = el("option", { value: opt.value, text: opt.label });
      if (opt.value === active) {
        option.selected = true;
      }
      select.appendChild(option);
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
  function createSelectionBoundsControl(field) {
    const parseLimit = (raw) => {
      const next = parseInt(raw, 10);
      return Number.isFinite(next) && next >= 1 ? Math.min(50, next) : "";
    };
    const minInput = el("input", {
      type: "number",
      className: "widefat",
      min: "1",
      max: "50",
      step: "1",
      dataset: { blMinSelections: "1" },
      value: field.min_selections != null && field.min_selections !== "" ? String(parseLimit(field.min_selections) || "") : ""
    });
    const maxInput = el("input", {
      type: "number",
      className: "widefat",
      min: "1",
      max: "50",
      step: "1",
      dataset: { blMaxSelections: "1" },
      value: field.max_selections != null && field.max_selections !== "" ? String(parseLimit(field.max_selections) || "") : ""
    });
    const sync = () => {
      let min = parseLimit(minInput.value);
      let max = parseLimit(maxInput.value);
      if (min !== "" && max !== "" && min > max) {
        [min, max] = [max, min];
      }
      field.min_selections = min === "" ? "" : min;
      field.max_selections = max === "" ? "" : max;
      minInput.value = min === "" ? "" : String(min);
      maxInput.value = max === "" ? "" : String(max);
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    minInput.addEventListener("change", sync);
    maxInput.addEventListener("change", sync);
    minInput.addEventListener("blur", sync);
    maxInput.addEventListener("blur", sync);
    return el("div", { className: "bl-forms-builder__selection-bounds" }, [
      el("div", { className: "bl-forms-builder__number-bounds" }, [
        el("p", {}, [el("label", { text: t("minSelections", "Minimum selections") }), minInput]),
        el("p", {}, [el("label", { text: t("maxSelections", "Maximum selections") }), maxInput])
      ]),
      el("p", {
        className: "description",
        text: t(
          "selectionBoundsHelp",
          "Leave empty for no limit. When the maximum is reached, further options cannot be selected."
        )
      })
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
  function createLengthLimitsControl(field) {
    const minInput = el("input", {
      type: "number",
      className: "widefat",
      min: "1",
      step: "1",
      dataset: { blMinLength: "1" },
      value: field.min_length != null && field.min_length !== "" ? String(field.min_length) : ""
    });
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
      t("showCharCount", "Show character count"),
      !!field.show_char_count,
      syncShow
    );
    const showWrap = el("div", { className: "bl-forms-builder__char-count-toggle" }, [showSwitch]);
    const showInput = showSwitch.querySelector('input[type="checkbox"]');
    const syncVisibility = () => {
      const max = parseInt(maxInput.value, 10);
      const hasMax = Number.isFinite(max) && max > 0;
      showWrap.hidden = !hasMax;
      if (!hasMax) {
        field.show_char_count = false;
        if (showInput) {
          showInput.checked = false;
        }
      }
    };
    const syncMin = () => {
      field.min_length = minInput.value.trim();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    const syncMax = () => {
      field.max_length = maxInput.value.trim();
      syncVisibility();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    minInput.addEventListener("change", syncMin);
    minInput.addEventListener("blur", syncMin);
    minInput.addEventListener("input", syncMin);
    maxInput.addEventListener("change", syncMax);
    maxInput.addEventListener("blur", syncMax);
    maxInput.addEventListener("input", syncMax);
    syncVisibility();
    return el("div", { className: "bl-forms-builder__length-limits" }, [
      el("p", {}, [el("label", { text: t("minLength", "Minimum length") }), minInput]),
      el("div", { className: "bl-forms-builder__length-max" }, [
        el("p", {}, [el("label", { text: t("maxLength", "Maximum length") }), maxInput]),
        showWrap
      ])
    ]);
  }
  function countOtherListOverviewFields(exceptId) {
    let n = 0;
    document.querySelectorAll(".bl-forms-builder__field[data-bl-forms-field]").forEach((row) => {
      if (exceptId && row.dataset.fieldId === exceptId) {
        return;
      }
      const input = row.querySelector("[data-bl-show-in-list]");
      if (input && input.checked) {
        n += 1;
      }
    });
    return n;
  }
  function hasShowInListForType(type, exceptId = "") {
    let found = false;
    document.querySelectorAll(".bl-forms-builder__field[data-bl-forms-field]").forEach((row) => {
      if (found) {
        return;
      }
      if (exceptId && row.dataset.fieldId === exceptId) {
        return;
      }
      if ((row.dataset.fieldType || "") !== type) {
        return;
      }
      const input = row.querySelector("[data-bl-show-in-list]");
      if (input && input.checked) {
        found = true;
      }
    });
    return found;
  }
  function defaultShowInListForNewField(type, exceptId = "") {
    if (type !== "text" && type !== "email") {
      return false;
    }
    if (countOtherListOverviewFields(exceptId) >= 3) {
      return false;
    }
    return !hasShowInListForType(type, exceptId);
  }
  function createListOverviewControl(field) {
    const input = el("input", {
      type: "checkbox",
      dataset: { blShowInList: "1" },
      checked: !!field.show_in_list
    });
    input.addEventListener("change", () => {
      if (input.checked && countOtherListOverviewFields(field.id) >= 3) {
        input.checked = false;
        window.alert(
          t("showInListMax", "You can show at most 3 fields in the entries list.")
        );
        return;
      }
      field.show_in_list = !!input.checked;
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    });
    return el("div", { className: "bl-forms-builder__switch-setting" }, [
      el("label", { className: "bl-forms-builder__switch" }, [
        input,
        el("span", { className: "bl-forms-builder__switch-ui", "aria-hidden": "true" }),
        el("span", {
          className: "bl-forms-builder__switch-label",
          text: t("showInList", "Show in overview")
        })
      ])
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
    const placeholder = field.type === "image" ? "jpg, jpeg, png, webp, gif, heic, avif" : "pdf, docx, xlsx, zip";
    const input = el("input", {
      type: "text",
      className: "widefat",
      dataset: { blExtensions: "1" },
      value: field.extensions != null ? String(field.extensions) : field.type === "image" ? "jpg, jpeg, png, webp, gif, heic, avif" : "",
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
  function createMaxSizeControl(field) {
    const globalMb = window.blFormsAdmin && window.blFormsAdmin.uploadMaxSizeMb || "";
    const wpMaxLabel = window.blFormsAdmin && window.blFormsAdmin.wpMaxUploadSize || "";
    const placeholder = globalMb !== "" ? String(globalMb) : "";
    const help = globalMb !== "" || wpMaxLabel !== "" ? t("fieldMaxSizeHelp", "Leave empty to use the global default (%s).").replace(
      "%s",
      globalMb !== "" ? `${globalMb} ${t("uploadMaxSizeUnit", "MB")}` : wpMaxLabel
    ) : t("fieldMaxSizeHelpEmpty", "Leave empty to use the global default.");
    const input = el("input", {
      type: "number",
      className: "small-text",
      min: "0.1",
      step: "0.1",
      dataset: { blMaxSizeMb: "1" },
      value: field.max_size_mb != null && field.max_size_mb !== "" ? String(field.max_size_mb) : "",
      placeholder
    });
    const sync = () => {
      field.max_size_mb = input.value.trim();
      document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
    };
    input.addEventListener("input", sync);
    input.addEventListener("change", sync);
    return el("div", { className: "bl-forms-builder__max-size" }, [
      el("p", {}, [
        el("label", { text: t("fieldMaxSize", "Maximum file size") }),
        el("span", { className: "bl-forms-builder__security-inline" }, [
          input,
          el("span", { text: t("uploadMaxSizeUnit", "MB") })
        ])
      ]),
      el("p", { className: "description", text: help })
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
      const option = el("option", { value: opt.id, text: opt.label });
      if (field.upload_style === opt.id) {
        option.selected = true;
      }
      styleSelect.appendChild(option);
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
      const option = el("option", { value: mode.id, text: mode.label });
      if ((field[modeKey] || "") === mode.id) {
        option.selected = true;
      }
      modeSelect.appendChild(option);
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
      const option = el("option", { value: item.value, text: item.label });
      if (item.value === relation) {
        option.selected = true;
      }
      modeSelect.appendChild(option);
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
      const option = el("option", { value, text: label });
      if (value === currentRelated) {
        option.selected = true;
      }
      fieldSelect.appendChild(option);
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
  function withConditionalLogic(body, data) {
    const row = body?.closest?.("[data-bl-forms-field]") || body;
    const live = row && row._blFieldRef ? row._blFieldRef.conditional_logic : null;
    if (live && typeof live === "object") {
      const normalized = normalizeConditionalLogic(live);
      if (normalized.enabled || normalized.groups.length) {
        data.conditional_logic = normalized;
        return data;
      }
    }
    const logic = readConditionalLogicFromDom(body);
    if (logic) {
      const normalized = normalizeConditionalLogic(logic);
      if (normalized.enabled || normalized.groups.length) {
        data.conditional_logic = normalized;
      }
    }
    return data;
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
      { id: "appearance", label: t("fieldTabAppearance", "Appearance") },
      { id: "logic", label: t("fieldTabLogic", "Logic") }
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
      if (id === "logic") {
        tabs[3].panel.querySelectorAll(".bl-forms-builder__logic").forEach((node) => {
          if (typeof node.refreshLogicSources === "function") {
            node.refreshLogicSources();
          }
        });
      }
    };
    const wrap = el("div", { className: "bl-forms-builder__field-editor" }, [tabBar, panelsWrap]);
    return {
      wrap,
      general: tabs[0].panel,
      advanced: tabs[1].panel,
      appearance: tabs[2].panel,
      logic: tabs[3].panel,
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
      return withConditionalLogic(body, {
        id,
        type,
        active,
        margin,
        margin_custom: margin === "custom" ? marginCustom : "",
        css_class: q("[data-bl-css-class]")?.value || ""
      });
    }
    if (type === "captcha") {
      return withConditionalLogic(body, {
        id,
        type,
        active,
        ...appearancePayload(body, width, widthCustom)
      });
    }
    if (type === "spacer") {
      const heightBtn = q("[data-bl-height].is-active");
      const height = heightBtn?.dataset.blHeight || row.dataset.fieldHeight || "m";
      const heightCustom = q("[data-bl-height-custom]")?.value || "";
      return withConditionalLogic(body, {
        id,
        type,
        active,
        height,
        height_custom: height === "custom" ? heightCustom : "",
        css_class: q("[data-bl-css-class]")?.value || ""
      });
    }
    if (type === "heading") {
      const levelBtn = q("[data-bl-heading-level].is-active");
      const level = levelBtn?.dataset.blHeadingLevel || "h2";
      return withConditionalLogic(body, {
        id,
        type,
        active,
        content: q("[data-bl-content]")?.value || "",
        level: HEADING_LEVELS.includes(level) ? level : "h2",
        ...appearancePayload(body, width, widthCustom)
      });
    }
    if (type === "text_block" || type === "html") {
      return withConditionalLogic(body, {
        id,
        type,
        active,
        content: q("[data-bl-content]")?.value || "",
        ...appearancePayload(body, width, widthCustom)
      });
    }
    if (type === "honeypot") {
      return withConditionalLogic(body, {
        id,
        type,
        active,
        label: q("[data-bl-label]")?.value || "",
        name: q("[data-bl-name]")?.value || id,
        name_manual: nameManual,
        hide_label: hideLabel,
        ...appearancePayload(body, width, widthCustom)
      });
    }
    if (type === "hidden") {
      return withConditionalLogic(body, {
        id,
        type,
        active,
        label: q("[data-bl-label]")?.value || "",
        name: q("[data-bl-name]")?.value || id,
        name_manual: nameManual,
        hide_label: hideLabel,
        default_value: q("[data-bl-default]")?.value || "",
        ...appearancePayload(body, "100", "")
      });
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
    if (type === "checkboxes") {
      const parseLimit = (raw) => {
        const next = parseInt(raw, 10);
        return Number.isFinite(next) && next >= 1 ? Math.min(50, next) : "";
      };
      let min = parseLimit(q("[data-bl-min-selections]")?.value?.trim());
      let max = parseLimit(q("[data-bl-max-selections]")?.value?.trim());
      if (min !== "" && max !== "" && min > max) {
        [min, max] = [max, min];
      }
      data.min_selections = min;
      data.max_selections = max;
    }
    if (MULTIPLE_TYPES.includes(type)) {
      data.multiple = Boolean(q("[data-bl-multiple]")?.checked);
    }
    if (type === "file" || type === "image") {
      data.extensions = q("[data-bl-extensions]")?.value?.trim() || "";
      data.upload_style = q("[data-bl-upload-style]")?.value === "classic" ? "classic" : "modern";
      data.preview = data.upload_style === "modern" ? Boolean(q("[data-bl-preview]")?.checked) : false;
      data.button_text = q("[data-bl-upload-button]")?.value?.trim() || "";
      data.max_size_mb = q("[data-bl-max-size-mb]")?.value?.trim() || "";
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
      data.min_length = q("[data-bl-min-length]")?.value?.trim() || "";
      data.max_length = q("[data-bl-max-length]")?.value?.trim() || "";
      data.show_char_count = Boolean(q("[data-bl-show-char-count]")?.checked);
    }
    if (type === "text" || type === "email" || type === "phone") {
      data.show_in_list = Boolean(q("[data-bl-show-in-list]")?.checked);
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
    return withConditionalLogic(body, data);
  }
  function duplicateFieldCard(row) {
    if (!row) {
      return;
    }
    const data = serializeRow(row);
    if (!data) {
      return;
    }
    const clone = cloneFieldData(data);
    const copy = createFieldCard(clone, false);
    row.after(copy);
    if ((copy.dataset.fieldType || "") === "column") {
      const list = row.parentElement;
      if (list) {
        equalizeColumnRun(list, copy);
      }
    }
    document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
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
    if ((field.type === "text" || field.type === "email") && field.show_in_list === void 0) {
      field.show_in_list = defaultShowInListForNewField(field.type, field.id);
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
    row._blFieldRef = field;
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
        title = typeLabel("captcha");
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
      const logic = field.conditional_logic;
      if (logic && logic.enabled && Array.isArray(logic.groups) && logic.groups.length > 0) {
        typeChildren.push(
          el("span", {
            className: "bl-forms-builder__field-logic-dot",
            title: t("logicEnable", "Conditional logic"),
            "aria-label": t("logicEnable", "Conditional logic")
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
      if (nextOpen) {
        body.querySelectorAll(".bl-forms-builder__logic").forEach((node) => {
          if (typeof node.refreshLogicSources === "function") {
            node.refreshLogicSources();
          }
        });
      }
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
    const duplicateBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn",
      title: t("duplicate", "Duplicate"),
      "aria-label": t("duplicate", "Duplicate"),
      onClick: () => duplicateFieldCard(row)
    });
    const duplicateIcon = iconEl("duplicate");
    if (duplicateIcon.innerHTML) {
      duplicateBtn.appendChild(duplicateIcon);
    } else {
      duplicateBtn.textContent = "\u29C9";
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
      const { general, advanced, appearance, logic } = tabs;
      const generalSections = createSectionAppender(general);
      const advancedSections = createSectionAppender(advanced);
      const appearanceSections = createSectionAppender(appearance);
      const logicSections = createSectionAppender(logic);
      generalSections.add(
        (() => {
          const switches = [
            createSwitchSetting("blActive", t("fieldActive", "Active"), fieldIsActive(field), (checked) => {
              field.active = checked;
              updatePreview();
              document.dispatchEvent(new CustomEvent("bl-forms-builder-changed"));
            })
          ];
          if (field.type === "text" || field.type === "email" || field.type === "phone") {
            switches.push(createListOverviewControl(field));
          }
          return el("div", { className: "bl-forms-builder__field-status" }, switches);
        })()
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
      logicSections.add(createConditionalLogicEditor(field, void 0, updatePreview));
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
              createSwitchSetting("blHideLabel", t("hideLabel", "Hide"), !!field.hide_label, (checked) => {
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
          advancedSections.add(createLengthLimitsControl(field));
        }
        if (field.type === "file" || field.type === "image") {
          advancedSections.add(createExtensionsControl(field));
          advancedSections.add(createMaxSizeControl(field));
          advancedSections.add(createUploadButtonControl(field));
          if (field.multiple) {
            advancedSections.add(createMaxFilesControl(field));
          }
        }
        if (field.type === "number") {
          advancedSections.add(createNumberBoundsControl(field));
        }
        if (field.type === "checkboxes") {
          advancedSections.add(createSelectionBoundsControl(field));
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
              className: "description",
              html: t(
                "checkboxTextHelp",
                'Markdown is supported, e.g. <b>**Bold**</b>, <i>*Italic*</i>, and <span style="white-space: nowrap">[Link](...)</span>. For the target you can use a URL (/agb), a WordPress page (page:123), or a standard page such as page:privacy.'
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
          const defaults = createDefaultValueControl(field, updatePreview);
          if (defaults) {
            if (CHECKED_DEFAULT_TYPES.includes(field.type)) {
              generalSections.add(settingHeading(t("defaultValue", "Default value")), ...defaults);
            } else {
              generalSections.add(...defaults);
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
      el("div", { className: "bl-forms-builder__field-actions" }, [activateBtn, duplicateBtn, deleteBtn, handle])
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

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/settings-panel.js
  var MATERIAL_ICONS_URL = "https://fonts.google.com/icons?icon.style=Rounded";
  function fieldRow(label, control, help = "") {
    const children = [el("label", {}, [el("strong", { text: label })]), control];
    if (help) {
      children.push(el("span", { className: "description", text: help }));
    }
    return el("p", { className: "bl-forms-builder__setting" }, children);
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
      text: t("blockIconEmpty", "No icon selected"),
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
          el("strong", { text: t("blockIconSvg", "SVG code") })
        ]),
        textarea,
        el("p", { className: "description" }, [
          document.createTextNode(t("blockIconMaterialHelp", "Browse Material Icons (Rounded), copy SVG, and paste here: ")),
          el("a", {
            href: MATERIAL_ICONS_URL,
            target: "_blank",
            rel: "noopener noreferrer",
            text: t("blockIconMaterialLink", "fonts.google.com/icons")
          })
        ])
      ]
    );
    const chooseBtn = usePicker ? el("button", {
      type: "button",
      className: "button",
      text: t("blockIconChoose", "Choose icon"),
      dataset: { blBlocksIconChoose: "" }
    }) : null;
    const svgToggle = el("button", {
      type: "button",
      className: "button",
      text: t("blockIconSvgToggle", "SVG code"),
      "aria-expanded": "false",
      dataset: { blBlocksIconSvgToggle: "" }
    });
    const clearBtn = el("button", {
      type: "button",
      className: "button-link-delete",
      text: t("blockIconClear", "Clear"),
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
    const { root: activeRow, input: activeInput } = plainSwitch(t("settingsActive", "Active"), {
      checked: state.active !== false,
      onChange: (checked) => {
        state.active = checked;
        notify();
      }
    });
    const slugInput = el("input", {
      type: "text",
      className: "regular-text",
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
      className: "large-text",
      rows: 3,
      text: state.description || ""
    });
    descInput.addEventListener("input", () => {
      state.description = descInput.value;
      notify();
    });
    const children = [
      el("h3", { className: "bl-forms-builder__section-title", text: t("tabSettings", "Settings") }),
      activeRow,
      fieldRow(t("settingsSlug", "Slug"), slugInput, t("settingsSlugHelp", "")),
      fieldRow(t("settingsDescription", "Description"), descInput)
    ];
    if (definitionType === "block") {
      const iconField = createBlockIconField(state.block_icon || "block-default", (next) => {
        state.block_icon = next;
        notify();
      });
      const categories = window.blBlocksAdmin && window.blBlocksAdmin.blockCategories || [];
      const categorySelect = el("select", { className: "regular-text" });
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
        className: "regular-text",
        value: state.block_keywords || ""
      });
      keywordsInput.addEventListener("input", () => {
        state.block_keywords = keywordsInput.value;
        notify();
      });
      delete state.block_title;
      children.push(
        fieldRow(t("blockIcon", "Block icon"), iconField),
        fieldRow(t("blockCategory", "Block category"), categorySelect),
        fieldRow(t("blockKeywords", "Keywords"), keywordsInput, t("blockKeywordsHelp", ""))
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
      children.push(fieldRow(t("postTypes", "Post types"), box, t("postTypesHelp", "")));
    }
    if (definitionType === "site_settings") {
      const labelInput = el("input", {
        type: "text",
        className: "regular-text",
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
        fieldRow(t("menuLabel", "Tab label"), labelInput, t("menuLabelHelp", "")),
        fieldRow(t("menuOrder", "Order"), orderInput)
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
  var REPEATER_MAX_DEPTH = 3;
  var LAYOUT_BLOCKED = ["column", "section", "group"];
  var repeaterFieldByEl = /* @__PURE__ */ new WeakMap();
  function createNestedSortable2(list, options) {
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
  function typeLabel2(type) {
    const dict = window.blFormsAdmin && window.blFormsAdmin.i18n || {};
    if (dict.types && dict.types[type]) {
      return dict.types[type];
    }
    if (type === "repeater") {
      return t("repeaterType", "Repeater");
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
      label: partial.label || typeLabel2("repeater"),
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
    createNestedSortable2(list, {
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
    const row = el("div", {
      className: "bl-forms-builder__field bl-blocks-builder__repeater-card",
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
    const labelPlaceholder = () => field.show_title ? t("sectionLabelPlaceholder", "Title") : t("sectionLabelPlaceholderHidden", "Name");
    const labelInput = el("input", {
      type: "text",
      className: "bl-forms-builder__section-label-input",
      value: field.label || "",
      placeholder: labelPlaceholder(),
      "aria-label": t("repeaterLabel", "Repeater label")
    });
    labelInput.addEventListener("input", () => {
      field.label = labelInput.value;
      if (!field.name_manual) {
        field.name = uniqueFieldName(field.label || "items", field.id);
      }
      notifyChanged();
    });
    const typeLabelText = () => typeLabel2("repeater") + (depth > 1 ? ` (${depth})` : "");
    const typeChip = el("span", { className: "bl-forms-builder__field-type" });
    const settingsBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__design-btn",
      title: t("layoutSettingsTitle", "Settings"),
      "aria-label": t("layoutSettingsTitle", "Settings")
    });
    settingsBtn.appendChild(iconEl("tune", "bl-forms-builder__design-btn-icon"));
    const fieldsList = el("div", {
      className: "bl-blocks-builder__repeater-fields",
      dataset: { blRepeaterFields: "1", repeaterDepth: String(depth) }
    });
    const emptyHint = el("p", {
      className: "description bl-forms-builder__section-empty",
      text: depth >= REPEATER_MAX_DEPTH ? t("repeaterEmptyMaxDepth", "Drop fields here (nested repeater not allowed at this depth)") : t("repeaterEmpty", "Drop fields or a nested repeater here")
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
    const fieldsWrap = el("div", { className: "bl-blocks-builder__repeater-fields-wrap" }, [
      fieldsList,
      emptyHint
    ]);
    syncEmpty();
    const updatePreview = () => {
      row.dataset.fieldWidth = field.width || "100";
      row.dataset.fieldDesign = field.design || "standard";
      row.dataset.fieldShowTitle = field.show_title ? "1" : "0";
      labelInput.placeholder = labelPlaceholder();
      const typeChildren = [
        iconEl("repeater", "bl-forms-builder__field-type-icon"),
        el("span", {
          className: "bl-forms-builder__field-type-label",
          text: typeLabelText()
        })
      ];
      const logic = field.conditional_logic;
      if (logic && logic.enabled && Array.isArray(logic.groups) && logic.groups.length > 0) {
        typeChildren.push(
          el("span", {
            className: "bl-forms-builder__field-logic-dot",
            title: t("logicEnable", "Conditional logic"),
            "aria-label": t("logicEnable", "Conditional logic")
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
          tabs: ["settings", "design", "logic"],
          withHideTitle: true,
          withWidth: true,
          logicHelp: t(
            "logicHelpRepeater",
            "Show this repeater only when the conditions below are met."
          )
        }
      );
    });
    const duplicateBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn",
      title: t("duplicate", "Duplicate"),
      "aria-label": t("duplicate", "Duplicate"),
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
    const deleteBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger",
      title: t("delete", "Delete"),
      "aria-label": t("delete", "Delete"),
      onClick: () => {
        row.remove();
        notifyChanged();
      }
    });
    const trashIcon = iconEl("trash");
    if (trashIcon.innerHTML) deleteBtn.appendChild(trashIcon);
    else deleteBtn.textContent = "\xD7";
    const handle = el("span", {
      className: "bl-forms-builder__handle",
      title: t("dragField", "Drag to reorder"),
      "aria-hidden": "true"
    });
    const dragIcon = iconEl("drag");
    if (dragIcon.innerHTML) handle.appendChild(dragIcon);
    else handle.textContent = "\u22EE\u22EE";
    const header = el("div", { className: "bl-forms-builder__field-header" }, [
      labelInput,
      el("div", { className: "bl-forms-builder__field-meta" }, [settingsBtn, typeChip]),
      el("div", { className: "bl-forms-builder__field-actions" }, [duplicateBtn, deleteBtn, handle])
    ]);
    row.append(header, fieldsWrap);
    updatePreview();
    if (open) {
      labelInput.focus();
    }
    return row;
  }
  function serializeRepeaterRow(row) {
    const live = repeaterFieldByEl.get(row);
    const id = row.dataset.fieldId || live?.id || uid();
    const labelInput = row.querySelector(
      ":scope > .bl-forms-builder__field-header .bl-forms-builder__section-label-input"
    );
    const fields = row.querySelector(
      ":scope > .bl-blocks-builder__repeater-fields-wrap [data-bl-repeater-fields]"
    );
    const children = Array.from(fields?.children || []).filter((node) => node.matches("[data-bl-forms-field]")).filter((node) => !LAYOUT_BLOCKED.includes(node.dataset.fieldType || "")).map((child) => serializeChildCard(child));
    const design = row.dataset.fieldDesign || live?.design || "standard";
    const showTitle = row.dataset.fieldShowTitle !== void 0 ? row.dataset.fieldShowTitle !== "0" : live?.show_title !== false;
    return {
      id,
      type: "repeater",
      label: labelInput?.value ?? live?.label ?? "",
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
      conditional_logic: normalizeConditionalLogic(live?.conditional_logic),
      children
    };
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/app.js
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
    return createFieldCard(data, open);
  }
  function serializeBlocksItem(row) {
    if ((row?.dataset?.fieldType || "") === "repeater") {
      return serializeRepeaterRow(row);
    }
    return serializeRow(row);
  }
  function mountApp(root, initial, definitionType = "block") {
    const Builder = window.BlCanvasBuilder;
    if (!Builder || typeof Builder.mount !== "function") {
      root.textContent = "Canvas builder failed to load.";
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
      writeConfig({
        fields,
        settings: panels.getSettings()
      });
      builderApi?.canvas?.syncEmpty?.();
    };
    const fieldsPanel = el("div", {
      className: "bl-forms-builder__panel is-active",
      dataset: { blFormsPanel: "fields" }
    });
    const prepareField = (typeOrData) => {
      if (typeOrData === "repeater" || typeOrData && typeOrData.type === "repeater") {
        const data2 = typeof typeOrData === "string" ? defaultRepeater() : defaultRepeater(typeOrData);
        if (data2.name != null && data2.name_manual === false) {
          data2.name = uniqueFieldName(data2.label || data2.name || "items", data2.id || "");
        } else if (data2.name) {
          data2.name = uniqueFieldName(data2.name, data2.id || "");
        }
        return data2;
      }
      const data = typeof typeOrData === "string" ? defaultField(typeOrData) : { ...typeOrData };
      if (data.name != null && data.name_manual === false) {
        data.name = uniqueFieldName(data.label || data.name || data.type || "field", data.id || "");
      } else if (data.name) {
        data.name = uniqueFieldName(data.name, data.id || "");
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
      heading: t("canvasHeading", "Fields"),
      emptyText: t("empty", "Drag a field here."),
      handleSelector: ".bl-forms-builder__handle",
      draggableSelector: ".bl-forms-builder__field, .bl-forms-builder__template",
      templateClass: "bl-forms-builder__template",
      itemAttr: "data-bl-forms-field",
      icons: window.blFormsAdmin && window.blFormsAdmin.icons || {},
      t,
      typeLabel: (type) => {
        const dict = window.blFormsAdmin && window.blFormsAdmin.i18n || {};
        if (type === "repeater") {
          return dict.types && dict.types.repeater || t("repeaterType", "Repeater");
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
    const tabBar = el("nav", { className: "bl-forms-builder__tabs", role: "tablist" });
    const tabs = [
      { id: "fields", label: t("tabFields", "Fields"), panel: fieldsPanel },
      { id: "settings", label: t("tabSettings", "Settings"), panel: panels.panel }
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
      tab.button = el("button", {
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
      const label = fullscreen ? t("fullscreenExit", "Exit fullscreen") : t("fullscreenEnter", "Fullscreen");
      fullscreenBtn.title = label;
      fullscreenBtn.setAttribute("aria-label", label);
      fullscreenBtn.setAttribute("aria-pressed", fullscreen ? "true" : "false");
      fullscreenBtn.replaceChildren();
      const icon = iconEl(fullscreen ? "fullscreenExit" : "fullscreen");
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
    const fullscreenBtn = el("button", {
      type: "button",
      className: "bl-forms-builder__icon-btn bl-forms-builder__fullscreen-btn",
      title: t("fullscreenEnter", "Fullscreen"),
      "aria-label": t("fullscreenEnter", "Fullscreen"),
      "aria-pressed": "false",
      onClick: () => setFullscreen(!fullscreen)
    });
    const enterIcon = iconEl("fullscreen");
    if (enterIcon.innerHTML) {
      fullscreenBtn.appendChild(enterIcon);
    } else {
      fullscreenBtn.textContent = "\u26F6";
    }
    tabBar.appendChild(fullscreenBtn);
    const panelsWrap = el("div", { className: "bl-forms-builder__panels" }, [
      fieldsPanel,
      panels.panel
    ]);
    root.append(
      el("div", { className: "bl-forms-builder__scroll" }, [
        el("div", { className: "bl-forms-builder__scroll-inner" }, [tabBar, panelsWrap])
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

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/field-form.js
  function el2(tag, props = {}, children = []) {
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
  function i18n(key, fallback) {
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
    const row = el2("div", {
      className: "bl-blocks-fields__row",
      dataset: { fieldName: name }
    });
    const id = "bl-blocks-ui-" + name.replace(/[^a-z0-9_-]/gi, "_") + "-" + Math.random().toString(36).slice(2, 7);
    if (!field.hide_label && type !== "toggle" && type !== "terms") {
      const label = el2("label", { className: "bl-blocks-fields__label", text: field.label || name });
      label.setAttribute("for", id);
      if (field.required) {
        label.appendChild(document.createTextNode(" "));
        label.appendChild(el2("span", { className: "required", text: "*" }));
      }
      row.appendChild(label);
    }
    let control = null;
    const options = Array.isArray(field.options) ? field.options : [];
    if (type === "textarea") {
      control = el2("textarea", {
        className: "widefat",
        id,
        rows: field.rows || 4,
        value: current == null ? "" : String(current)
      });
      if (field.placeholder) control.placeholder = field.placeholder;
    } else if (type === "select") {
      const multiple = !!field.multiple;
      control = el2("select", { className: "widefat", id });
      if (multiple) control.multiple = true;
      if (!multiple) {
        control.appendChild(el2("option", { value: "", text: "\u2014" }));
      }
      const selected = multiple ? (Array.isArray(current) ? current : []).map(String) : [String(current == null ? "" : current)];
      options.forEach((opt) => {
        const ov = String(opt.value ?? "");
        const option = el2("option", { value: ov, text: opt.label || ov });
        if (selected.includes(ov)) option.selected = true;
        control.appendChild(option);
      });
    } else if (type === "radio" || type === "button_group") {
      control = el2("div", { className: "bl-blocks-fields__choices" });
      options.forEach((opt, i) => {
        const ov = String(opt.value ?? "");
        const oid = id + "-" + i;
        const input = el2("input", {
          type: "radio",
          name: id,
          id: oid,
          value: ov,
          checked: String(current) === ov
        });
        control.appendChild(
          el2("label", { className: "bl-blocks-fields__choice" }, [
            input,
            document.createTextNode(" " + (opt.label || ov))
          ])
        );
      });
    } else if (type === "checkboxes") {
      control = el2("div", { className: "bl-blocks-fields__choices" });
      const list = Array.isArray(current) ? current.map(String) : [];
      options.forEach((opt, i) => {
        const ov = String(opt.value ?? "");
        const oid = id + "-" + i;
        const input = el2("input", {
          type: "checkbox",
          id: oid,
          value: ov,
          checked: list.includes(ov)
        });
        control.appendChild(
          el2("label", { className: "bl-blocks-fields__choice" }, [
            input,
            document.createTextNode(" " + (opt.label || ov))
          ])
        );
      });
    } else if (type === "toggle" || type === "terms") {
      const input = el2("input", {
        type: "checkbox",
        id,
        checked: !!current && current !== "0" && current !== ""
      });
      control = el2("label", { className: "bl-blocks-fields__toggle" }, [
        input,
        document.createTextNode(" " + (field.label || name))
      ]);
    } else if (type === "hidden") {
      control = el2("input", {
        type: "hidden",
        id,
        value: current == null ? "" : String(current)
      });
    } else {
      let inputType = "text";
      if (type === "email" || type === "url" || type === "number" || type === "date" || type === "time") {
        inputType = type;
      } else if (type === "phone") {
        inputType = "tel";
      } else if (type === "datetime") {
        inputType = "datetime-local";
      }
      control = el2("input", {
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
      row.appendChild(el2("p", { className: "description", text: field.description }));
    }
    return row;
  }
  function createFieldForm(fields, values = {}) {
    const root = el2("div", { className: "bl-blocks-fields", dataset: { blBlocksFields: "" } });
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
          const wrap = el2("div", { className: layoutClass.filter(Boolean).join(" ") });
          const showTitle = type !== "section" || field.show_title !== false && field.show_title !== 0 && field.show_title !== "0";
          if (type === "section" && showTitle && field.label) {
            wrap.appendChild(el2("h3", { className: "bl-blocks-fields__section-title", text: field.label }));
          }
          parent.appendChild(wrap);
          walk(field.children || [], wrap, valueMap);
          return;
        }
        if (type === "heading") {
          if (field.label) {
            parent.appendChild(el2("h4", { className: "bl-blocks-fields__heading", text: field.label }));
          }
          return;
        }
        if (type === "text_block" || type === "html") {
          const content = field.default_value || field.content || field.label || "";
          if (content) {
            parent.appendChild(el2("div", { className: "bl-blocks-fields__static", html: content }));
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
    const buttonLabel = field.button_label || i18n("addRow", "Add row");
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
    const wrap = el2("div", {
      className: classNames.filter(Boolean).join(" "),
      dataset: { fieldName: name }
    });
    if (showTitle && !field.hide_label && field.label) {
      wrap.appendChild(el2("div", { className: "bl-blocks-fields__label", text: field.label }));
    }
    if (field.description) {
      wrap.appendChild(el2("p", { className: "description", text: field.description }));
    }
    const rowsEl = el2("div", { className: "bl-blocks-fields__repeater-rows" });
    const rowForms = [];
    const syncRowTitles = () => {
      Array.from(rowsEl.children).forEach((rowEl, i) => {
        const title = rowEl.querySelector(".bl-blocks-fields__repeater-row-title");
        if (title) {
          const template = i18n("rowLabel", "Row %d");
          title.textContent = template.replace("%d", String(i + 1));
        }
      });
    };
    const canAdd = () => maxRows === 0 || rowForms.length < maxRows;
    const canRemove = () => rowForms.length > minRows;
    const addBtn = el2("button", {
      type: "button",
      className: "button bl-blocks-fields__repeater-add",
      text: buttonLabel
    });
    const refreshAddBtn = () => {
      addBtn.disabled = !canAdd();
    };
    const mountRow = (rowValues) => {
      const rowEl = el2("div", { className: "bl-blocks-fields__repeater-row" });
      const header = el2("div", { className: "bl-blocks-fields__repeater-row-header" }, [
        el2("span", { className: "bl-blocks-fields__repeater-row-title", text: "" })
      ]);
      const removeBtn = el2("button", {
        type: "button",
        className: "button-link-delete bl-blocks-fields__repeater-remove",
        text: i18n("removeRow", "Remove row")
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
    const title = opts.title || i18n("edit", "Edit");
    const form = createFieldForm(opts.fields || [], opts.values || {});
    const overlay = el2("div", { className: "bl-blocks-modal-overlay", role: "presentation" });
    const dialog = el2("div", {
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
    const header = el2("div", { className: "bl-blocks-modal__header" }, [
      el2("h2", { className: "bl-blocks-modal__title", text: title }),
      el2("button", {
        type: "button",
        className: "bl-blocks-modal__close",
        text: "\xD7",
        "aria-label": i18n("close", "Close"),
        onClick: close
      })
    ]);
    const body = el2("div", { className: "bl-blocks-modal__body" }, [form.root]);
    const footer = el2("div", { className: "bl-blocks-modal__footer" }, [
      el2("button", {
        type: "button",
        className: "button",
        text: i18n("cancel", "Cancel"),
        onClick: close
      }),
      el2("button", {
        type: "button",
        className: "button button-primary",
        text: i18n("save", "Save"),
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
    openFieldsModal
  };

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
