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
      className: "button-link",
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
    const { root: sidebarEditingRow } = plainSwitch(
      t2("settingsSidebarEditing", "Allow editing directly in sidebar"),
      {
        checked: !!state.sidebar_editing,
        onChange: (checked) => {
          state.sidebar_editing = checked;
          notify();
        }
      }
    );
    const { root: innerBlocksRow } = plainSwitch(
      t2("settingsSupportsInnerBlocks", "Allow nested blocks (InnerBlocks)"),
      {
        checked: !!state.supports_inner_blocks,
        onChange: (checked) => {
          state.supports_inner_blocks = checked;
          notify();
        }
      }
    );
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
      activeRow
    ];
    if (definitionType === "block") {
      children.push(sidebarEditingRow);
      children.push(innerBlocksRow);
    }
    children.push(
      fieldRow(t2("settingsSlug", "Slug"), slugInput, t2("settingsSlugHelp", "")),
      fieldRow(t2("settingsDescription", "Description"), descInput)
    );
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
  var LAYOUT_BLOCKED = ["column", "section", "tab", "group"];
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
        put(to, from, dragEl2) {
          const type = dragEl2.dataset.fieldType || "";
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
        const clone2 = cloneFieldData(data);
        const copy = createRepeaterCard(clone2, false, depth);
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
  var EXCLUDED_TYPES = /* @__PURE__ */ new Set(["honeypot", "captcha", "terms"]);
  var BLOCKS_POPULAR_TYPES = ["text", "textarea", "select", "toggle"];
  function blocksPalette() {
    const { PALETTE_SECTIONS = [] } = window.BlFormBuilder || {};
    return PALETTE_SECTIONS.map((section) => {
      if (section.id === "files") {
        return {
          id: "media",
          headingKey: "paletteSectionMedia",
          headingFallback: "Media",
          types: ["image", "file"]
        };
      }
      let types = section.id === "popular" ? BLOCKS_POPULAR_TYPES : (section.types || []).filter((type) => !EXCLUDED_TYPES.has(type));
      if (section.id === "advanced") {
        types = [...types.filter((type) => type !== "repeater"), "repeater"];
      }
      return { ...section, types };
    }).filter((section) => (section.types || []).length > 0);
  }
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
    return window.BlFormBuilder.createFieldCard(data, open);
  }
  function serializeBlocksItem(row) {
    if ((row?.dataset?.fieldType || "") === "repeater") {
      return serializeRepeaterRow(row);
    }
    return window.BlFormBuilder.serializeRow(row);
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
    const {
      el: el7,
      t: t4,
      writeConfig: writeConfig2,
      defaultField: defaultField2,
      uniqueFieldName: uniqueFieldName2,
      iconEl: iconEl2,
      createFieldCard: createFieldCard2,
      serializeRow: serializeRow2,
      equalizeColumnRun
    } = FormBuilder;
    if (typeof FormBuilder.configure === "function") {
      FormBuilder.configure({ mediaLibraryFields: true });
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
    const fieldsPanel = el7("div", {
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
      if (data.type === "file" || data.type === "image") {
        delete data.upload_style;
        delete data.preview;
        delete data.extensions;
        delete data.max_size_mb;
        delete data.button_text;
      }
      return data;
    };
    builderApi = Builder.mount(fieldsPanel, {
      replaceRoot: false,
      addRootClass: false,
      ns: "bl-forms-builder",
      groupName: "bl-blocks-fields",
      items: initial.fields || [],
      sections: blocksPalette(),
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
    const tabBar = el7("nav", { className: "bl-forms-builder__tabs", role: "tablist" });
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
    tabs.forEach((tab, index2) => {
      tab.button = el7("button", {
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
    const fullscreenBtn = el7("button", {
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
    const panelsWrap = el7("div", { className: "bl-forms-builder__panels" }, [
      fieldsPanel,
      panels.panel
    ]);
    root.append(
      el7("div", { className: "bl-forms-builder__scroll" }, [
        el7("div", { className: "bl-forms-builder__scroll-inner" }, [tabBar, panelsWrap])
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
              const on2 = selectedMap.has(Number(node.dataset.pageId) || 0);
              node.classList.toggle("is-selected", on2);
              node.setAttribute("aria-selected", on2 ? "true" : "false");
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
  function el3(tag, props = {}, children = []) {
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
    const summary = el3("div", { className: "bl-blocks-fields__page-picker-summary" });
    const pickBtn = el3("button", {
      type: "button",
      className: "button bl-button-small",
      text: i18n("choosePage", "Choose page")
    });
    const clearBtn = el3("button", {
      type: "button",
      className: "button-link",
      text: i18n("clearPage", "Clear")
    });
    const actions = el3("div", { className: "bl-blocks-fields__page-picker-actions" }, [
      pickBtn,
      clearBtn
    ]);
    const control = el3("div", {
      className: "bl-blocks-fields__page-picker",
      dataset: { blBlocksPagePicker: "1" }
    });
    control.append(
      el3("div", { className: "bl-blocks-fields__page-picker-row" }, [summary, actions])
    );
    const syncUi = () => {
      summary.replaceChildren();
      if (selected.length === 0) {
        summary.appendChild(
          el3("span", {
            className: "description",
            text: multiple ? i18n("choosePagesHelp", "Select one or more pages.") : i18n("choosePageHelp", "Select a page.")
          })
        );
      } else if (multiple) {
        selected.forEach((page) => {
          summary.appendChild(
            el3("span", {
              className: "bl-blocks-fields__page-picker-value",
              text: page.title || i18n("selectedPage", "Selected page") + " #" + page.id
            })
          );
        });
      } else {
        const page = selected[0];
        summary.appendChild(
          el3("span", {
            className: "bl-blocks-fields__page-picker-value",
            text: page.title || i18n("selectedPage", "Selected page") + " #" + page.id
          })
        );
        if (page.url) {
          summary.appendChild(
            el3("span", {
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
              el3("input", { type: "hidden", name: inputName + "[]", value: "" })
            );
          } else {
            inputsHost.appendChild(el3("input", { type: "hidden", name: inputName, value: "" }));
          }
          return;
        }
        selected.forEach((page) => {
          const name = multiple ? inputName + "[]" : inputName;
          const input = el3("input", {
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
            el3("span", {
              className: "description",
              text: multiple ? i18n("choosePagesHelp", "Select one or more pages.") : i18n("choosePageHelp", "Select a page.")
            })
          );
        } else {
          selected.forEach((page) => {
            summary.appendChild(
              el3("span", {
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
    const list = raw.map(String).filter((t4) => LINK_TYPES.includes(t4));
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
  function normalizeLinkHref(raw) {
    const v = String(raw || "").trim();
    if (!v) return "";
    if (/^([/#?]|\/\/|[a-z][a-z0-9+.\-]*:)/i.test(v)) {
      return v;
    }
    return "https://" + v;
  }
  function destinationFieldLabel(type) {
    if (type === "page") return i18n2("linkDestPage", "Page");
    if (type === "email") return i18n2("linkDestEmail", "Email address");
    if (type === "phone") return i18n2("linkDestPhone", "Phone number");
    return i18n2("linkDestUrl", "URL");
  }
  function createLinkControl(field, current) {
    const allowed = allowedLinkTypes(field);
    const allowTarget = field.allow_target !== false;
    let state = normalizeLinkValue(current, allowed);
    let pageMeta = state.type === "page" && state.page_id > 0 ? { id: state.page_id, title: state.title || "", url: state.url || "" } : null;
    const root = el4("div", {
      className: "bl-blocks-fields__link",
      dataset: { blBlocksLinkField: "1" }
    });
    const typeRow = el4("div", { className: "bl-blocks-fields__link-types" });
    const destLabel = el4("label", { text: destinationFieldLabel(state.type) });
    const destWrap = el4("div", { className: "bl-blocks-fields__link-destination" });
    const destRow = el4("div", { className: "bl-blocks-fields__link-dest" }, [destLabel, destWrap]);
    const titleInput = el4("input", {
      type: "text",
      className: "widefat",
      value: state.title
    });
    const titleRow = el4("p", { className: "bl-blocks-fields__link-title" }, [
      el4("label", { text: i18n2("linkText", "Link text") }),
      titleInput
    ]);
    const targetInput = el4("input", { type: "checkbox" });
    const targetRow = el4("label", { className: "bl-blocks-fields__toggle bl-blocks-fields__link-target" }, [
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
      destLabel.textContent = destinationFieldLabel(state.type);
      destWrap.replaceChildren();
      if (state.type === "page") {
        const summary = el4("div", { className: "bl-blocks-fields__page-picker-summary" });
        const pickBtn = el4("button", {
          type: "button",
          className: "button bl-button-small",
          text: pageMeta ? i18n2("changePage", "Change page") : i18n2("choosePage", "Choose page")
        });
        const clearBtn = el4("button", {
          type: "button",
          className: "button-link",
          text: i18n2("clearPage", "Clear"),
          hidden: !pageMeta
        });
        if (pageMeta) {
          summary.appendChild(
            el4("span", {
              className: "bl-blocks-fields__page-picker-value",
              text: pageMeta.title || i18n2("selectedPage", "Selected page") + " #" + pageMeta.id
            })
          );
          if (pageMeta.url) {
            summary.appendChild(
              el4("span", {
                className: "description bl-blocks-fields__page-picker-url",
                text: pageMeta.url,
                title: pageMeta.url
              })
            );
          }
        } else {
          summary.appendChild(
            el4("span", {
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
          el4("div", { className: "bl-blocks-fields__page-picker-row" }, [
            summary,
            el4("div", { className: "bl-blocks-fields__page-picker-actions" }, [pickBtn, clearBtn])
          ])
        );
        return;
      }
      let inputType = "text";
      let value = displayDestination(state);
      if (state.type === "email") {
        inputType = "email";
      } else if (state.type === "phone") {
        inputType = "tel";
      } else if (state.type === "url") {
        value = normalizeLinkHref(value);
        state.url = value;
      }
      const input = el4("input", {
        type: inputType,
        className: "widefat",
        value
      });
      input.addEventListener("input", () => {
        state.url = input.value;
      });
      if (state.type === "url") {
        input.addEventListener("blur", () => {
          const next = normalizeLinkHref(input.value);
          if (next !== input.value) {
            input.value = next;
          }
          state.url = next;
        });
      }
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
        const btn = el4("button", {
          type: "button",
          className: "button bl-button-tiny bl-blocks-fields__link-type" + (state.type === type ? " is-active" : ""),
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
      root.appendChild(
        el4("div", { className: "bl-blocks-fields__link-type-block" }, [
          el4("label", { text: i18n2("linkTypeLabel", "Type") }),
          typeRow
        ])
      );
    }
    titleInput.addEventListener("input", () => {
      state.title = titleInput.value;
    });
    targetInput.checked = state.target === "_blank";
    targetInput.addEventListener("change", () => {
      state.target = targetInput.checked ? "_blank" : "";
    });
    root.append(destRow, titleRow, targetRow);
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
        const href = normalizeLinkHref(destInput ? destInput.value : state.url || "");
        out.url = href;
        if (destInput && destInput.value !== href) {
          destInput.value = href;
        }
        state.url = href;
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
      let allowed = String(wrap.dataset.linkTypes || "").split(",").map((s) => s.trim()).filter((t4) => LINK_TYPES.includes(t4));
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
          const input = el4("input", {
            type: "hidden",
            name: `${inputName}[${key}]`,
            value: val,
            dataset: { blLinkKey: key }
          });
          inputsHost.appendChild(input);
        });
        if (value.target === "_blank") {
          inputsHost.appendChild(
            el4("input", {
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

  // node_modules/sortablejs/modular/sortable.esm.js
  function _defineProperty(e, r, t4) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t4,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e[r] = t4, e;
  }
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t4 = arguments[e];
        for (var r in t4) ({}).hasOwnProperty.call(t4, r) && (n[r] = t4[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  function ownKeys(e, r) {
    var t4 = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t4.push.apply(t4, o);
    }
    return t4;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t4 = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t4), true).forEach(function(r2) {
        _defineProperty(e, r2, t4[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t4)) : ownKeys(Object(t4)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t4, r2));
      });
    }
    return e;
  }
  function _objectWithoutProperties(e, t4) {
    if (null == e) return {};
    var o, r, i = _objectWithoutPropertiesLoose(e, t4);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r = 0; r < n.length; r++) o = n[r], -1 === t4.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t4 = {};
    for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t4[n] = r[n];
    }
    return t4;
  }
  function _toPrimitive(t4, r) {
    if ("object" != typeof t4 || !t4) return t4;
    var e = t4[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t4, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t4);
  }
  function _toPropertyKey(t4) {
    var i = _toPrimitive(t4, "string");
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
  function on(el7, event, fn) {
    el7.addEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function off(el7, event, fn) {
    el7.removeEventListener(event, fn, !IE11OrLess && captureMode);
  }
  function matches(el7, selector) {
    if (!selector) return;
    selector[0] === ">" && (selector = selector.substring(1));
    if (el7) {
      try {
        if (el7.matches) {
          return el7.matches(selector);
        } else if (el7.msMatchesSelector) {
          return el7.msMatchesSelector(selector);
        } else if (el7.webkitMatchesSelector) {
          return el7.webkitMatchesSelector(selector);
        }
      } catch (_) {
        return false;
      }
    }
    return false;
  }
  function getParentOrHost(el7) {
    return el7.host && el7 !== document && el7.host.nodeType && el7.host !== el7 ? el7.host : el7.parentNode;
  }
  function closest(el7, selector, ctx, includeCTX) {
    if (el7) {
      ctx = ctx || document;
      do {
        if (selector != null && (selector[0] === ">" ? el7.parentNode === ctx && matches(el7, selector) : matches(el7, selector)) || includeCTX && el7 === ctx) {
          return el7;
        }
        if (el7 === ctx) break;
      } while (el7 = getParentOrHost(el7));
    }
    return null;
  }
  var R_SPACE = /\s+/g;
  function toggleClass(el7, name, state) {
    if (el7 && name) {
      if (el7.classList) {
        el7.classList[state ? "add" : "remove"](name);
      } else {
        var className = (" " + el7.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
        el7.className = (className + (state ? " " + name : "")).replace(R_SPACE, " ");
      }
    }
  }
  function css(el7, prop, val) {
    var style = el7 && el7.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el7, "");
        } else if (el7.currentStyle) {
          val = el7.currentStyle;
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
  function matrix(el7, selfOnly) {
    var appliedTransforms = "";
    if (typeof el7 === "string") {
      appliedTransforms = el7;
    } else {
      do {
        var transform = css(el7, "transform");
        if (transform && transform !== "none") {
          appliedTransforms = transform + " " + appliedTransforms;
        }
      } while (!selfOnly && (el7 = el7.parentNode));
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
  function getRect(el7, relativeToContainingBlock, relativeToNonStaticParent, undoScale, container) {
    if (!el7.getBoundingClientRect && el7 !== window) return;
    var elRect, top, left, bottom, right, height, width;
    if (el7 !== window && el7.parentNode && el7 !== getWindowScrollingElement()) {
      elRect = el7.getBoundingClientRect();
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
    if ((relativeToContainingBlock || relativeToNonStaticParent) && el7 !== window) {
      container = container || el7.parentNode;
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
    if (undoScale && el7 !== window) {
      var elMatrix = matrix(container || el7), scaleX = elMatrix && elMatrix.a, scaleY = elMatrix && elMatrix.d;
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
  function isScrolledPast(el7, elSide, parentSide) {
    var parent = getParentAutoScrollElement(el7, true), elSideVal = getRect(el7)[elSide];
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
  function getChild(el7, childNum, options, includeDragEl) {
    var currentChild = 0, i = 0, children = el7.children;
    while (i < children.length) {
      if (children[i].style.display !== "none" && children[i] !== Sortable.ghost && (includeDragEl || children[i] !== Sortable.dragged) && closest(children[i], options.draggable, el7, false)) {
        if (currentChild === childNum) {
          return children[i];
        }
        currentChild++;
      }
      i++;
    }
    return null;
  }
  function lastChild(el7, selector) {
    var last = el7.lastElementChild;
    while (last && (last === Sortable.ghost || css(last, "display") === "none" || selector && !matches(last, selector))) {
      last = last.previousElementSibling;
    }
    return last || null;
  }
  function index(el7, selector) {
    var index2 = 0;
    if (!el7 || !el7.parentNode) {
      return -1;
    }
    while (el7 = el7.previousElementSibling) {
      if (el7.nodeName.toUpperCase() !== "TEMPLATE" && el7 !== Sortable.clone && (!selector || matches(el7, selector))) {
        index2++;
      }
    }
    return index2;
  }
  function getRelativeScrollOffset(el7) {
    var offsetLeft = 0, offsetTop = 0, winScroller = getWindowScrollingElement();
    if (el7) {
      do {
        var elMatrix = matrix(el7), scaleX = elMatrix.a, scaleY = elMatrix.d;
        offsetLeft += el7.scrollLeft * scaleX;
        offsetTop += el7.scrollTop * scaleY;
      } while (el7 !== winScroller && (el7 = el7.parentNode));
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
  function getParentAutoScrollElement(el7, includeSelf) {
    if (!el7 || !el7.getBoundingClientRect) return getWindowScrollingElement();
    var elem = el7;
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
  function scrollBy(el7, x, y) {
    el7.scrollLeft += x;
    el7.scrollTop += y;
  }
  function clone(el7) {
    var Polymer = window.Polymer;
    var $ = window.jQuery || window.Zepto;
    if (Polymer && Polymer.dom) {
      return Polymer.dom(el7).cloneNode(true);
    } else if ($) {
      return $(el7).clone(true)[0];
    } else {
      return el7.cloneNode(true);
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
    initializePlugins: function initializePlugins(sortable, el7, defaults2, options) {
      plugins.forEach(function(plugin) {
        var pluginName = plugin.pluginName;
        if (!sortable.options[pluginName] && !plugin.initializeByDefault) return;
        var initialized = new plugin(sortable, el7, sortable.options);
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
    var el7 = document.createElement("x");
    el7.style.cssText = "pointer-events:auto";
    return el7.style.pointerEvents === "auto";
  })();
  var _detectDirection = function _detectDirection2(el7, options) {
    var elCSS = css(el7), elWidth = parseInt(elCSS.width) - parseInt(elCSS.paddingLeft) - parseInt(elCSS.paddingRight) - parseInt(elCSS.borderLeftWidth) - parseInt(elCSS.borderRightWidth), child1 = getChild(el7, 0, options), child2 = getChild(el7, 1, options), firstChildCSS = child1 && css(child1), secondChildCSS = child2 && css(child2), firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + getRect(child1).width, secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + getRect(child2).width;
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
  function Sortable(el7, options) {
    if (!(el7 && el7.nodeType && el7.nodeType === 1)) {
      throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(el7));
    }
    this.el = el7;
    this.options = options = _extends({}, options);
    el7[expando] = this;
    var defaults2 = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      draggable: /^[uo]l$/i.test(el7.nodeName) ? ">li" : ">*",
      swapThreshold: 1,
      // percentage; 0 <= x <= 1
      invertSwap: false,
      // invert always
      invertedSwapThreshold: null,
      // will be set to same as swapThreshold if default
      removeCloneOnHide: true,
      direction: function direction() {
        return _detectDirection(el7, this.options);
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
    PluginManager.initializePlugins(this, el7, defaults2);
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
      on(el7, "pointerdown", this._onTapStart);
    } else {
      on(el7, "mousedown", this._onTapStart);
      on(el7, "touchstart", this._onTapStart);
    }
    if (this.nativeDraggable) {
      on(el7, "dragover", this);
      on(el7, "dragenter", this);
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
      var _this = this, el7 = this.el, options = this.options, preventOnFilter = options.preventOnFilter, type = evt.type, touch = evt.touches && evt.touches[0] || evt.pointerType && evt.pointerType === "touch" && evt, target = (touch || evt).target, originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0] || evt.composedPath && evt.composedPath()[0]) || target, filter = options.filter;
      _saveInputCheckedState(el7);
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
      target = closest(target, options.draggable, el7, false);
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
            toEl: el7,
            fromEl: el7
          });
          pluginEvent2("filter", _this, {
            evt
          });
          preventOnFilter && evt.preventDefault();
          return;
        }
      } else if (filter) {
        filter = filter.split(",").some(function(criteria) {
          criteria = closest(originalTarget, criteria.trim(), el7, false);
          if (criteria) {
            _dispatchEvent({
              sortable: _this,
              rootEl: criteria,
              name: "filter",
              targetEl: target,
              fromEl: el7,
              toEl: el7
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
      if (options.handle && !closest(originalTarget, options.handle, el7, false)) {
        return;
      }
      this._prepareDragStart(evt, touch, target);
    },
    _prepareDragStart: function _prepareDragStart(evt, touch, target) {
      var _this = this, el7 = _this.el, options = _this.options, ownerDocument = el7.ownerDocument, dragStartFn;
      if (target && !dragEl && target.parentNode === el7) {
        var dragRect = getRect(target);
        rootEl = el7;
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
      var el7 = this.el, target = evt.target, dragRect, targetRect, revert, options = this.options, group = options.group, activeSortable = Sortable.active, isOwner = activeGroup === group, canSort = options.sort, fromSortable = putSortable || activeSortable, vertical, _this = this, completedFired = false;
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
            return _onMove(rootEl, el7, dragEl, dragRect, target2, getRect(target2), evt, after2);
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
        if (target === dragEl && !dragEl.animated || target === el7 && !target.animated) {
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
          toEl: el7,
          newIndex,
          newDraggableIndex,
          originalEvent: evt
        });
      }
      if (evt.preventDefault !== void 0) {
        evt.cancelable && evt.preventDefault();
      }
      target = closest(target, options.draggable, el7, true);
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
        var elLastChild = lastChild(el7, options.draggable);
        if (!elLastChild || _ghostIsLast(evt, vertical, this) && !elLastChild.animated) {
          if (elLastChild === dragEl) {
            return completed(false);
          }
          if (elLastChild && el7 === evt.target) {
            target = elLastChild;
          }
          if (target) {
            targetRect = getRect(target);
          }
          if (_onMove(rootEl, el7, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
            capture();
            if (elLastChild && elLastChild.nextSibling) {
              el7.insertBefore(dragEl, elLastChild.nextSibling);
            } else {
              el7.appendChild(dragEl);
            }
            parentEl = el7;
            changed();
            return completed(true);
          }
        } else if (elLastChild && _ghostIsFirst(evt, vertical, this)) {
          var firstChild = getChild(el7, 0, options, true);
          if (firstChild === dragEl) {
            return completed(false);
          }
          target = firstChild;
          targetRect = getRect(target);
          if (_onMove(rootEl, el7, dragEl, dragRect, target, targetRect, evt, false) !== false) {
            capture();
            el7.insertBefore(dragEl, firstChild);
            parentEl = el7;
            changed();
            return completed(true);
          }
        } else if (target.parentNode === el7) {
          targetRect = getRect(target);
          var direction = 0, targetBeforeFirstSwap, differentLevel = dragEl.parentNode !== el7, differentRowCol = !_dragElInRowColumn(dragEl.animated && dragEl.toRect || dragRect, target.animated && target.toRect || targetRect, vertical), side1 = vertical ? "top" : "left", scrolledPastTop = isScrolledPast(target, "top", "top") || isScrolledPast(dragEl, "top", "top"), scrollBefore = scrolledPastTop ? scrolledPastTop.scrollTop : void 0;
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
          var moveVector = _onMove(rootEl, el7, dragEl, dragRect, target, targetRect, evt, after);
          if (moveVector !== false) {
            if (moveVector === 1 || moveVector === -1) {
              after = moveVector === 1;
            }
            _silent = true;
            setTimeout(_unsilent, 30);
            capture();
            if (after && !nextSibling) {
              el7.appendChild(dragEl);
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
        if (el7.contains(dragEl)) {
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
      var el7 = this.el, options = this.options;
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
        off(el7, "dragstart", this._onDragStart);
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
      var el7 = this.el;
      savedInputChecked.forEach(function(checkEl) {
        if (el7.contains(checkEl)) {
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
      var order = [], el7, children = this.el.children, i = 0, n = children.length, options = this.options;
      for (; i < n; i++) {
        el7 = children[i];
        if (closest(el7, options.draggable, this.el, false)) {
          order.push(el7.getAttribute(options.dataIdAttr) || _generateId(el7));
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
        var el7 = rootEl2.children[i];
        if (closest(el7, this.options.draggable, rootEl2, false)) {
          items[id] = el7;
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
    closest: function closest$1(el7, selector) {
      return closest(el7, selector || this.options.draggable, this.el, false);
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
      var el7 = this.el;
      el7[expando] = null;
      off(el7, "mousedown", this._onTapStart);
      off(el7, "touchstart", this._onTapStart);
      off(el7, "pointerdown", this._onTapStart);
      if (this.nativeDraggable) {
        off(el7, "dragover", this);
        off(el7, "dragenter", this);
      }
      Array.prototype.forEach.call(el7.querySelectorAll("[draggable]"), function(el8) {
        el8.removeAttribute("draggable");
      });
      this._onDrop();
      this._disableDelayedDragEvents();
      sortables.splice(sortables.indexOf(this.el), 1);
      this.el = el7 = null;
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
  function _disableDraggable(el7) {
    el7.draggable = false;
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
  function _generateId(el7) {
    var str = el7.tagName + el7.className + el7.src + el7.href + el7.textContent, i = str.length, sum = 0;
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
      var el7 = inputs[idx];
      el7.checked && savedInputChecked.push(el7);
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
    is: function is(el7, selector) {
      return !!closest(el7, selector, el7, false);
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
  Sortable.create = function(el7, options) {
    return new Sortable(el7, options);
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
      var el7 = currentParent, rect = getRect(el7), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, canScrollX = void 0, canScrollY = void 0, scrollWidth = el7.scrollWidth, scrollHeight = el7.scrollHeight, elCSS = css(el7), scrollPosX = el7.scrollLeft, scrollPosY = el7.scrollTop;
      if (el7 === winScroller) {
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
      if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el7) {
        autoScrolls[layersOut].el = el7;
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

  // themes/baselayer/src/js/admin/canvas-builder/sortable.js
  function createSortable(el7, options = {}) {
    return sortable_esm_default.create(el7, options);
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/media-field.js
  function el5(tag, props = {}, children = []) {
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
    const dict = window.blBlocksFieldUi && window.blBlocksFieldUi.i18n || window.blBlocksEditor && window.blBlocksEditor.i18n || window.blBlocksPage && window.blBlocksPage.i18n || window.blBlocksAdmin && window.blBlocksAdmin.i18n || {};
    return dict[key] || fallback || key;
  }
  function normalizeAttachmentIds(current, multiple) {
    if (multiple) {
      const list = Array.isArray(current) ? current : current != null && current !== "" ? [current] : [];
      return list.map((id) => Number(id) || 0).filter((id) => id > 0);
    }
    const one = Number(Array.isArray(current) ? current[0] : current) || 0;
    return one > 0 ? [one] : [];
  }
  function attachmentFromJson(json) {
    const sizes = json.sizes || {};
    const url = sizes.thumbnail && sizes.thumbnail.url || sizes.medium && sizes.medium.url || json.url || json.icon || "";
    return {
      id: Number(json.id) || 0,
      url: String(url || ""),
      filename: String(json.filename || json.title || "#" + (json.id || "")),
      mime: String(json.mime || json.mime_type || ""),
      type: String(json.type || ""),
      alt: String(json.alt || json.alt_text || json.title || "")
    };
  }
  function fetchAttachment(id) {
    return new Promise((resolve) => {
      if (!id || typeof wp === "undefined" || !wp.media || !wp.media.attachment) {
        resolve({ id, url: "", filename: "#" + id, mime: "", type: "", alt: "" });
        return;
      }
      const att = wp.media.attachment(id);
      const done = () => {
        try {
          resolve(attachmentFromJson(att.toJSON()));
        } catch (e) {
          resolve({ id, url: "", filename: "#" + id, mime: "", type: "", alt: "" });
        }
      };
      if (att.get("url")) {
        done();
        return;
      }
      att.fetch().done(done).fail(() => {
        resolve({ id, url: "", filename: "#" + id, mime: "", type: "", alt: "" });
      });
    });
  }
  function extensionBadge(filename) {
    const parts = String(filename || "").split(".");
    const ext = parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
    return ext.slice(0, 4);
  }
  function buildMediaCard(item, kind, onRemove) {
    const isImage = item.type === "image" || kind === "image";
    const card = el5("div", {
      className: "bl-blocks-fields__media-card" + (isImage ? " is-image" : " is-file"),
      dataset: { mediaId: String(item.id) }
    });
    if (isImage && item.url) {
      card.appendChild(
        el5("img", {
          className: "bl-blocks-fields__media-thumb",
          src: item.url,
          alt: item.alt || ""
        })
      );
    } else if (isImage) {
      card.appendChild(
        el5("span", {
          className: "bl-blocks-fields__media-badge",
          text: "IMG",
          "aria-hidden": "true"
        })
      );
    } else {
      card.appendChild(
        el5("span", {
          className: "bl-blocks-fields__media-badge",
          text: extensionBadge(item.filename),
          "aria-hidden": "true"
        })
      );
    }
    card.appendChild(
      el5("span", {
        className: "bl-blocks-fields__media-name",
        text: item.filename,
        title: item.filename
      })
    );
    const removeBtn = el5("button", {
      type: "button",
      className: "button-link bl-blocks-fields__media-remove",
      text: "\xD7",
      title: i18n3("removeMedia", "Remove"),
      "aria-label": i18n3("removeMedia", "Remove"),
      dataset: { blMediaRemove: String(item.id) }
    });
    removeBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      onRemove(item.id);
    });
    card.appendChild(removeBtn);
    return card;
  }
  function bindMediaSortable(preview, api) {
    if (!preview) return null;
    preview.classList.add("is-sortable");
    return createSortable(preview, {
      animation: 150,
      draggable: ".bl-blocks-fields__media-card",
      filter: ".bl-blocks-fields__media-remove",
      preventOnFilter: true,
      ghostClass: "is-dragging-ghost",
      chosenClass: "is-dragging-chosen",
      onEnd: () => {
        const ids = Array.from(preview.querySelectorAll(".bl-blocks-fields__media-card[data-media-id]")).map((node) => Number(node.getAttribute("data-media-id")) || 0).filter((id) => id > 0);
        const byId = new Map(api.getSelected().map((item) => [item.id, item]));
        const next = [];
        ids.forEach((id) => {
          const item = byId.get(id);
          if (item) next.push(item);
        });
        api.setSelected(next);
        if (typeof api.onChange === "function") {
          api.onChange();
        }
      }
    });
  }
  function createMediaPickerControl(field, current) {
    const kind = field.type === "image" ? "image" : "file";
    const multiple = !!field.multiple;
    const maxFiles = Math.max(1, Math.min(50, parseInt(field.max_files, 10) || 10));
    let selected = normalizeAttachmentIds(current, multiple).map((id) => ({
      id,
      url: "",
      filename: "#" + id,
      mime: "",
      type: kind === "image" ? "image" : "",
      alt: ""
    }));
    const preview = el5("div", {
      className: "bl-blocks-fields__media-preview" + (multiple ? " is-sortable" : ""),
      dataset: { blMediaPreview: "" }
    });
    const empty = el5("span", {
      className: "description bl-blocks-fields__media-empty",
      text: kind === "image" ? multiple ? i18n3("chooseImagesHelp", "Select one or more images.") : i18n3("chooseImageHelp", "Select an image.") : multiple ? i18n3("chooseFilesHelp", "Select one or more files.") : i18n3("chooseFileHelp", "Select a file."),
      dataset: { blMediaEmpty: "" }
    });
    const chooseBtn = el5("button", {
      type: "button",
      className: "button bl-button-small",
      text: "",
      dataset: { blMediaChoose: "" }
    });
    const clearBtn = el5("button", {
      type: "button",
      className: "button-link",
      text: i18n3("clearMedia", "Clear"),
      dataset: { blMediaClear: "" }
    });
    const actions = el5("div", { className: "bl-blocks-fields__media-actions" }, [
      chooseBtn,
      clearBtn
    ]);
    const wrap = el5(
      "div",
      {
        className: "bl-blocks-fields__media-picker",
        dataset: {
          blBlocksMediaPicker: "",
          mediaKind: kind,
          multiple: multiple ? "1" : "0"
        }
      },
      [preview, empty, actions]
    );
    let frame = null;
    let sortable = null;
    const syncChrome = () => {
      const has = selected.length > 0;
      empty.hidden = has;
      clearBtn.hidden = !has;
      if (kind === "image") {
        chooseBtn.textContent = has ? multiple ? i18n3("changeImages", "Change images") : i18n3("changeImage", "Change image") : multiple ? i18n3("chooseImages", "Choose images") : i18n3("chooseImage", "Choose image");
      } else {
        chooseBtn.textContent = has ? multiple ? i18n3("changeFiles", "Change files") : i18n3("changeFile", "Change file") : multiple ? i18n3("chooseFiles", "Choose files") : i18n3("chooseFile", "Choose file");
      }
    };
    const renderPreview = () => {
      preview.replaceChildren();
      selected.forEach((item) => {
        preview.appendChild(
          buildMediaCard(item, kind, (id) => {
            selected = selected.filter((s) => s.id !== id);
            renderPreview();
            wrap.dispatchEvent(new Event("change", { bubbles: true }));
          })
        );
      });
      syncChrome();
    };
    if (multiple) {
      sortable = bindMediaSortable(preview, {
        getSelected: () => selected,
        setSelected: (next) => {
          selected = next;
        },
        onChange: () => {
          wrap.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }
    const hydrate = () => {
      const ids = selected.map((s) => s.id);
      if (ids.length === 0) {
        renderPreview();
        return;
      }
      Promise.all(ids.map((id) => fetchAttachment(id))).then((items) => {
        selected = items.filter((item) => item.id > 0);
        renderPreview();
      });
    };
    const openFrame = () => {
      if (typeof wp === "undefined" || !wp.media) {
        return;
      }
      if (frame) {
        frame.open();
        return;
      }
      const opts = {
        title: kind === "image" ? multiple ? i18n3("mediaPickerTitleImages", "Select images") : i18n3("mediaPickerTitleImage", "Select image") : multiple ? i18n3("mediaPickerTitleFiles", "Select files") : i18n3("mediaPickerTitleFile", "Select file"),
        button: {
          text: i18n3("selectMedia", "Select")
        },
        multiple
      };
      if (kind === "image") {
        opts.library = { type: "image" };
      }
      frame = wp.media(opts);
      frame.on("select", () => {
        const selection = frame.state().get("selection");
        if (!selection) return;
        let items = selection.map((model) => attachmentFromJson(model.toJSON()));
        if (multiple) {
          items = items.slice(0, maxFiles);
        } else {
          items = items.slice(0, 1);
        }
        selected = items.filter((item) => item.id > 0);
        renderPreview();
        wrap.dispatchEvent(new Event("change", { bubbles: true }));
      });
      frame.on("open", () => {
        const selection = frame.state().get("selection");
        if (!selection) return;
        selection.reset();
        selected.forEach((item) => {
          const att = wp.media.attachment(item.id);
          selection.add(att);
          att.fetch();
        });
      });
      frame.open();
    };
    chooseBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      openFrame();
    });
    clearBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      selected = [];
      renderPreview();
      wrap.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const control = (
      /** @type {any} */
      wrap
    );
    control.getMediaValue = () => {
      const ids = selected.map((s) => s.id).filter((id) => id > 0);
      if (multiple) return ids;
      return ids[0] || 0;
    };
    hydrate();
    return control;
  }
  function bindMediaPickers(root = document) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("[data-bl-blocks-media-picker]").forEach((wrap) => {
      if (!(wrap instanceof HTMLElement) || wrap.dataset.blMediaBound === "1") return;
      wrap.dataset.blMediaBound = "1";
      const kind = wrap.dataset.mediaKind === "image" ? "image" : "file";
      const multiple = wrap.dataset.multiple === "1";
      const inputName = wrap.dataset.inputName || "";
      const maxFiles = Math.max(1, Math.min(50, parseInt(wrap.dataset.maxFiles || "10", 10) || 10));
      const preview = wrap.querySelector("[data-bl-media-preview]");
      const empty = wrap.querySelector("[data-bl-media-empty]");
      const chooseBtn = wrap.querySelector("[data-bl-media-choose]");
      const clearBtn = wrap.querySelector("[data-bl-media-clear]");
      const inputsHost = wrap.querySelector("[data-bl-media-inputs]");
      if (!preview || !chooseBtn || !inputsHost || !inputName) return;
      let selected = [];
      inputsHost.querySelectorAll('input[type="hidden"]').forEach((input) => {
        const id = Number(input.value) || 0;
        if (id <= 0) return;
        selected.push({
          id,
          url: input.getAttribute("data-url") || "",
          filename: input.getAttribute("data-filename") || "#" + id,
          mime: input.getAttribute("data-mime") || "",
          type: input.getAttribute("data-type") || (kind === "image" ? "image" : ""),
          alt: input.getAttribute("data-alt") || ""
        });
      });
      let frame = null;
      const syncInputs = () => {
        inputsHost.replaceChildren();
        if (selected.length === 0) {
          if (multiple) {
            inputsHost.appendChild(el5("input", { type: "hidden", name: inputName + "[]", value: "" }));
          } else {
            inputsHost.appendChild(el5("input", { type: "hidden", name: inputName, value: "" }));
          }
          return;
        }
        selected.forEach((item) => {
          const name = multiple ? inputName + "[]" : inputName;
          const input = el5("input", {
            type: "hidden",
            name,
            value: String(item.id)
          });
          input.setAttribute("data-url", item.url || "");
          input.setAttribute("data-filename", item.filename || "");
          input.setAttribute("data-mime", item.mime || "");
          input.setAttribute("data-type", item.type || "");
          input.setAttribute("data-alt", item.alt || "");
          inputsHost.appendChild(input);
        });
      };
      const syncChrome = () => {
        const has = selected.length > 0;
        if (empty) empty.hidden = has;
        if (clearBtn) clearBtn.hidden = !has;
        if (kind === "image") {
          chooseBtn.textContent = has ? multiple ? i18n3("changeImages", "Change images") : i18n3("changeImage", "Change image") : multiple ? i18n3("chooseImages", "Choose images") : i18n3("chooseImage", "Choose image");
        } else {
          chooseBtn.textContent = has ? multiple ? i18n3("changeFiles", "Change files") : i18n3("changeFile", "Change file") : multiple ? i18n3("chooseFiles", "Choose files") : i18n3("chooseFile", "Choose file");
        }
      };
      const renderPreview = () => {
        preview.replaceChildren();
        selected.forEach((item) => {
          preview.appendChild(
            buildMediaCard(item, kind, (id) => {
              selected = selected.filter((s) => s.id !== id);
              renderPreview();
            })
          );
        });
        syncChrome();
        syncInputs();
      };
      if (multiple) {
        preview.classList.add("is-sortable");
        bindMediaSortable(preview, {
          getSelected: () => selected,
          setSelected: (next) => {
            selected = next;
          },
          onChange: () => {
            syncInputs();
          }
        });
      }
      const openFrame = () => {
        if (typeof wp === "undefined" || !wp.media) return;
        if (frame) {
          frame.open();
          return;
        }
        const opts = {
          title: kind === "image" ? multiple ? i18n3("mediaPickerTitleImages", "Select images") : i18n3("mediaPickerTitleImage", "Select image") : multiple ? i18n3("mediaPickerTitleFiles", "Select files") : i18n3("mediaPickerTitleFile", "Select file"),
          button: { text: i18n3("selectMedia", "Select") },
          multiple
        };
        if (kind === "image") {
          opts.library = { type: "image" };
        }
        frame = wp.media(opts);
        frame.on("select", () => {
          const selection = frame.state().get("selection");
          if (!selection) return;
          let items = selection.map((model) => attachmentFromJson(model.toJSON()));
          items = multiple ? items.slice(0, maxFiles) : items.slice(0, 1);
          selected = items.filter((item) => item.id > 0);
          renderPreview();
        });
        frame.on("open", () => {
          const selection = frame.state().get("selection");
          if (!selection) return;
          selection.reset();
          selected.forEach((item) => {
            const att = wp.media.attachment(item.id);
            selection.add(att);
            att.fetch();
          });
        });
        frame.open();
      };
      chooseBtn.addEventListener("click", (evt) => {
        evt.preventDefault();
        openFrame();
      });
      if (clearBtn) {
        clearBtn.addEventListener("click", (evt) => {
          evt.preventDefault();
          selected = [];
          renderPreview();
        });
      }
      const needsHydrate = selected.some((s) => !s.url);
      if (needsHydrate) {
        Promise.all(selected.map((s) => fetchAttachment(s.id))).then((items) => {
          selected = items.filter((item) => item.id > 0);
          renderPreview();
        });
      } else {
        renderPreview();
      }
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
  function i18n4(key, fallback) {
    const dict = window.blBlocksFieldUi && window.blBlocksFieldUi.i18n || window.blBlocksEditor && window.blBlocksEditor.i18n || window.blBlocksPage && window.blBlocksPage.i18n || {};
    return dict[key] || fallback || key;
  }
  function isLayout(type) {
    return type === "column" || type === "section" || type === "tab" || type === "group";
  }
  function isStatic(type) {
    return type === "divider" || type === "spacer" || type === "heading" || type === "text_block" || type === "html" || type === "honeypot" || type === "captcha";
  }
  function normalizeHttpsUrl(raw) {
    let v = String(raw || "").replace(
      /^[\s\u00A0\u2000-\u200B\uFEFF]+|[\s\u00A0\u2000-\u200B\uFEFF]+$/g,
      ""
    );
    if (!v) return "";
    v = v.replace(/^[a-z][a-z0-9+.\-]*:/i, "").replace(/^\/\//, "");
    v = v.replace(/^[\s\u00A0\u2000-\u200B\uFEFF]+|[\s\u00A0\u2000-\u200B\uFEFF]+$/g, "");
    if (!v || v.startsWith("/") || v.startsWith("#") || v.startsWith("?")) {
      return "";
    }
    if (/\s/.test(v)) {
      return "";
    }
    const host = v.split(/[/?#]/)[0].split(":")[0];
    if (!host || !/[a-z0-9]/i.test(host)) {
      return "";
    }
    return "https://" + v;
  }
  function bindHttpsUrlInput(input) {
    if (!(input instanceof HTMLInputElement) || input.dataset.blHttpsUrlBound === "1") {
      return;
    }
    input.dataset.blHttpsUrlBound = "1";
    input.addEventListener("blur", () => {
      const next = normalizeHttpsUrl(input.value);
      if (next !== "") {
        input.value = next;
      }
    });
  }
  function bindHttpsUrlFields(root = document) {
    root.querySelectorAll("input[data-bl-blocks-https-url]").forEach((input) => {
      bindHttpsUrlInput(input);
    });
  }
  function collectLeafValue(field, control, type) {
    const name = field.name;
    if (!name) return null;
    if (type === "page" && control && typeof control.getPageValue === "function") {
      return control.getPageValue();
    }
    if ((type === "image" || type === "file") && control && typeof control.getMediaValue === "function") {
      return control.getMediaValue();
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
    if (type === "url" && control && "value" in control) {
      const next = normalizeHttpsUrl(control.value);
      if (next !== "" && next !== control.value) {
        control.value = next;
      }
      return next !== "" ? next : String(control.value || "").trim();
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
        const option2 = el6("option", { value: ov, text: opt.label || ov });
        if (selected.includes(ov)) option2.selected = true;
        control.appendChild(option2);
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
    } else if (type === "image" || type === "file") {
      control = createMediaPickerControl(field, current);
      if (control) control.id = id;
    } else if (type === "link") {
      control = createLinkControl(field, current);
      if (control) control.id = id;
    } else {
      let inputType = "text";
      if (type === "email" || type === "number" || type === "date" || type === "time") {
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
      if (type === "url") {
        if (!control.placeholder) control.placeholder = "https://";
        bindHttpsUrlInput(control);
      }
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
  function createFieldForm(fields, values = {}, options = {}) {
    const compact = options && options.layout === "compact";
    const rootAttrs = {
      className: "bl-blocks-fields" + (compact ? " bl-blocks-fields--compact" : ""),
      dataset: { blBlocksFields: "" }
    };
    if (compact) {
      rootAttrs.dataset.layout = "compact";
    }
    const root = el6("div", rootAttrs);
    const entries = [];
    const appendLayoutWrap = (field, type, parent, valueMap) => {
      const design = compact ? "standard" : ["standard", "outline", "card"].includes(field.design) ? field.design : "standard";
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
    };
    const appendTabGroup = (tabs, parent, valueMap) => {
      const activeTabs = (tabs || []).filter((tab) => tab && tab.active !== false);
      if (!activeTabs.length) return;
      const group = el6("div", {
        className: "bl-blocks-fields__tabs",
        dataset: { blBlocksTabs: "1" }
      });
      const tablist = el6("div", {
        className: "bl-blocks-fields__tablist",
        role: "tablist"
      });
      const panels = [];
      activeTabs.forEach((tab, index2) => {
        const tabId = String(tab.id || "tab" + index2);
        const panelId = "bl-blocks-tab-panel-" + tabId;
        const btnId = "bl-blocks-tab-" + tabId;
        const label = String(tab.label || "").trim() || i18n4("tabType", "Tab") + " " + (index2 + 1);
        const btn = el6("button", {
          type: "button",
          className: "bl-blocks-fields__tab" + (index2 === 0 ? " is-active" : ""),
          role: "tab",
          id: btnId,
          "aria-controls": panelId,
          "aria-selected": index2 === 0 ? "true" : "false",
          tabindex: index2 === 0 ? "0" : "-1",
          text: label,
          dataset: { blBlocksTab: "1" }
        });
        tablist.appendChild(btn);
        const design = compact ? "standard" : ["standard", "outline", "card"].includes(tab.design) ? tab.design : "standard";
        const panelClass = [
          "bl-blocks-fields__tab-panel",
          "bl-blocks-fields__tab-panel--" + design
        ];
        if (tab.css_class) {
          panelClass.push(String(tab.css_class).trim());
        }
        const panel = el6("div", {
          className: panelClass.filter(Boolean).join(" "),
          role: "tabpanel",
          id: panelId,
          "aria-labelledby": btnId,
          hidden: index2 !== 0
        });
        walk(tab.children || [], panel, valueMap);
        panels.push(panel);
      });
      const activate = (index2) => {
        Array.from(tablist.children).forEach((btn, i) => {
          const on2 = i === index2;
          btn.classList.toggle("is-active", on2);
          btn.setAttribute("aria-selected", on2 ? "true" : "false");
          btn.tabIndex = on2 ? 0 : -1;
          if (panels[i]) {
            panels[i].hidden = !on2;
          }
        });
      };
      tablist.addEventListener("click", (evt) => {
        const btn = evt.target.closest("[data-bl-blocks-tab]");
        if (!btn || !tablist.contains(btn)) return;
        const index2 = Array.from(tablist.children).indexOf(btn);
        if (index2 >= 0) activate(index2);
      });
      group.appendChild(tablist);
      panels.forEach((panel) => group.appendChild(panel));
      parent.appendChild(group);
    };
    const walk = (list, parent, valueMap) => {
      const fields2 = list || [];
      let i = 0;
      while (i < fields2.length) {
        const field = fields2[i];
        if (!field || field.active === false) {
          i += 1;
          continue;
        }
        const type = field.type || "text";
        if (type === "tab") {
          const run = [];
          while (i < fields2.length && fields2[i] && fields2[i].type === "tab") {
            run.push(fields2[i]);
            i += 1;
          }
          appendTabGroup(run, parent, valueMap);
          continue;
        }
        if (isLayout(type)) {
          appendLayoutWrap(field, type, parent, valueMap);
          i += 1;
          continue;
        }
        if (type === "heading") {
          if (field.label) {
            parent.appendChild(el6("h4", { className: "bl-blocks-fields__heading", text: field.label }));
          }
          i += 1;
          continue;
        }
        if (type === "text_block" || type === "html") {
          const content = field.default_value || field.content || field.label || "";
          if (content) {
            parent.appendChild(el6("div", { className: "bl-blocks-fields__static", html: content }));
          }
          i += 1;
          continue;
        }
        if (isStatic(type)) {
          i += 1;
          continue;
        }
        if (type === "repeater") {
          parent.appendChild(createRepeaterControl(field, valueMap, entries, options));
          i += 1;
          continue;
        }
        const leafControls = [];
        const row = createLeafControl(field, valueMap, leafControls);
        if (row) {
          parent.appendChild(row);
          leafControls.forEach((c) => entries.push({ kind: "leaf", ...c }));
        }
        i += 1;
      }
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
  function createRepeaterControl(field, valueMap, entries, options = {}) {
    const compact = options && options.layout === "compact";
    const name = field.name || "";
    const children = Array.isArray(field.children) ? field.children : [];
    const minRows = Math.max(0, parseInt(field.min_rows, 10) || 0);
    const maxRows = Math.max(0, parseInt(field.max_rows, 10) || 0);
    const buttonLabel = field.button_label || i18n4("addRow", "Add row");
    const design = compact ? "standard" : ["standard", "outline", "card"].includes(field.design) ? field.design : "standard";
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
          const template = i18n4("rowLabel", "Row %d");
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
        text: i18n4("removeRow", "Remove row")
      });
      header.appendChild(removeBtn);
      rowEl.appendChild(header);
      const form = createFieldForm(children, rowValues || {}, options);
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
    const title = opts.title || i18n4("edit", "Edit");
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
        "aria-label": i18n4("close", "Close"),
        onClick: close
      })
    ]);
    const body = el6("div", { className: "bl-blocks-modal__body" }, [form.root]);
    const footer = el6("div", { className: "bl-blocks-modal__footer" }, [
      el6("button", {
        type: "button",
        className: "button",
        text: i18n4("cancel", "Cancel"),
        onClick: close
      }),
      el6("button", {
        type: "button",
        className: "button button-primary",
        text: i18n4("save", "Save"),
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
  function bindFieldTabs(root = document) {
    root.querySelectorAll("[data-bl-blocks-tabs]").forEach((group) => {
      if (group.dataset.blBlocksTabsBound === "1") return;
      group.dataset.blBlocksTabsBound = "1";
      const tablist = group.querySelector(".bl-blocks-fields__tablist");
      if (!tablist) return;
      const buttons = Array.from(tablist.querySelectorAll("[data-bl-blocks-tab]"));
      const panels = buttons.map((btn) => {
        const id = btn.getAttribute("aria-controls");
        return id ? group.querySelector("#" + CSS.escape(id)) : null;
      });
      const activate = (index2) => {
        buttons.forEach((btn, i) => {
          const on2 = i === index2;
          btn.classList.toggle("is-active", on2);
          btn.setAttribute("aria-selected", on2 ? "true" : "false");
          btn.tabIndex = on2 ? 0 : -1;
          if (panels[i]) {
            panels[i].hidden = !on2;
          }
        });
      };
      tablist.addEventListener("click", (evt) => {
        const btn = evt.target.closest("[data-bl-blocks-tab]");
        if (!btn || !tablist.contains(btn)) return;
        const index2 = buttons.indexOf(btn);
        if (index2 >= 0) activate(index2);
      });
    });
  }
  window.blBlocksFieldUiApi = {
    createFieldForm,
    openFieldsModal,
    bindPagePickers,
    bindLinkFields,
    bindMediaPickers,
    bindHttpsUrlFields,
    bindFieldTabs
  };
  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      bindPagePickers(document);
      bindLinkFields(document);
      bindMediaPickers(document);
      bindHttpsUrlFields(document);
      bindFieldTabs(document);
    });
  }

  // themes/baselayer/packages/baselayer-blocks/src/js/admin/template-metabox.js
  function i18n5(key, fallback) {
    const dict = window.blBlocksAdmin && window.blBlocksAdmin.i18n || {};
    return dict[key] || fallback || key;
  }
  function currentConfig() {
    const input = document.getElementById("bl-forms-config-json");
    if (!input) {
      return { fields: [], settings: {} };
    }
    try {
      return JSON.parse(input.value || "{}") || { fields: [], settings: {} };
    } catch (e) {
      return { fields: [], settings: {} };
    }
  }
  function currentTitle() {
    const titleInput = document.getElementById("title");
    return titleInput ? String(titleInput.value || "").trim() : "";
  }
  async function requestStarter({ postId, write }) {
    const admin = window.blBlocksAdmin || {};
    const path = admin.starterPath || "baselayer-blocks/v1/starter-template";
    const config = currentConfig();
    const body = {
      postId,
      write: !!write,
      fields: Array.isArray(config.fields) ? config.fields : [],
      title: currentTitle()
    };
    if (window.wp && wp.apiFetch) {
      return wp.apiFetch({ path, method: "POST", data: body });
    }
    const root = window.wpApiSettings && window.wpApiSettings.root || (admin.restUrl || "/wp-json/");
    const url = String(root).replace(/\/?$/, "/") + path.replace(/^\//, "");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WP-Nonce": admin.restNonce || ""
      },
      body: JSON.stringify(body),
      credentials: "same-origin"
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data && data.message || i18n5("starterGenerateFailed", "Could not generate the starter template.");
      throw new Error(message);
    }
    return data;
  }
  function closeModal(overlay) {
    overlay.remove();
    document.removeEventListener("keydown", overlay._onKey);
  }
  function openCodeModal(code) {
    document.querySelectorAll("[data-bl-blocks-starter-modal]").forEach((node) => node.remove());
    const sourceId = "bl-blocks-starter-code-" + String(Date.now());
    const overlay = document.createElement("div");
    overlay.className = "bl-blocks-modal-overlay";
    overlay.setAttribute("data-bl-blocks-starter-modal", "1");
    overlay.setAttribute("role", "presentation");
    const dialog = document.createElement("div");
    dialog.className = "bl-blocks-modal bl-blocks-modal--starter";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", i18n5("starterPreviewTitle", "Starter template"));
    const header = document.createElement("div");
    header.className = "bl-blocks-modal__header";
    const title = document.createElement("h2");
    title.className = "bl-blocks-modal__title";
    title.textContent = i18n5("starterPreviewTitle", "Starter template");
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "bl-blocks-modal__close";
    closeBtn.setAttribute("aria-label", i18n5("starterClose", "Close"));
    closeBtn.textContent = "\xD7";
    header.append(title, closeBtn);
    const body = document.createElement("div");
    body.className = "bl-blocks-modal__body";
    const pre = document.createElement("pre");
    pre.className = "bl-blocks-template-metabox__code";
    const codeEl = document.createElement("code");
    codeEl.id = sourceId;
    codeEl.textContent = code;
    pre.appendChild(codeEl);
    body.appendChild(pre);
    const footer = document.createElement("div");
    footer.className = "bl-blocks-modal__footer";
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "button button-primary";
    copyBtn.setAttribute("data-bl-copy-from-source", sourceId);
    copyBtn.setAttribute(
      "data-bl-copy-feedback-text",
      i18n5("starterCopied", "Copied")
    );
    copyBtn.textContent = i18n5("starterCopyCode", "Copy code");
    const closeFooter = document.createElement("button");
    closeFooter.type = "button";
    closeFooter.className = "button";
    closeFooter.textContent = i18n5("starterClose", "Close");
    footer.append(copyBtn, closeFooter);
    dialog.append(header, body, footer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    const onClose = () => closeModal(overlay);
    closeBtn.addEventListener("click", onClose);
    closeFooter.addEventListener("click", onClose);
    overlay.addEventListener("click", (evt) => {
      if (evt.target === overlay) onClose();
    });
    overlay._onKey = (evt) => {
      if (evt.key === "Escape") onClose();
    };
    document.addEventListener("keydown", overlay._onKey);
    if (typeof window.baselayerInitCopyFromSource === "function") {
      window.baselayerInitCopyFromSource(overlay);
    }
  }
  function setBusy(button, busy) {
    if (!button) return;
    button.disabled = !!busy;
    if (!button.hasAttribute("data-bl-blocks-generate-starter")) {
      return;
    }
    if (busy) {
      button.dataset.blBusyLabel = button.textContent;
      button.textContent = i18n5("starterGenerating", "Generating\u2026");
    } else if (button.dataset.blBusyLabel) {
      button.textContent = button.dataset.blBusyLabel;
      delete button.dataset.blBusyLabel;
    }
  }
  async function onPreview(postId, trigger) {
    setBusy(trigger, true);
    try {
      const data = await requestStarter({ postId, write: false });
      openCodeModal(String(data && data.code || ""));
    } catch (err) {
      window.alert(
        err && (err.message || err.error) || i18n5("starterGenerateFailed", "Could not generate the starter template.")
      );
    } finally {
      setBusy(trigger, false);
    }
  }
  async function onGenerate(postId, trigger) {
    setBusy(trigger, true);
    try {
      await requestStarter({ postId, write: true });
      window.location.reload();
    } catch (err) {
      window.alert(
        err && (err.message || err.error) || i18n5("starterWriteFailed", "Could not create the template file.")
      );
      setBusy(trigger, false);
    }
  }
  function bindTemplateMetabox() {
    const root = document.querySelector("[data-bl-blocks-template-metabox]");
    if (!root) return;
    const postId = Number(root.getAttribute("data-post-id") || 0);
    if (!postId) return;
    root.querySelectorAll("[data-bl-blocks-preview-starter]").forEach((btn) => {
      btn.addEventListener("click", () => onPreview(postId, btn));
    });
    const generateBtn = root.querySelector("[data-bl-blocks-generate-starter]");
    if (generateBtn) {
      generateBtn.addEventListener("click", () => onGenerate(postId, generateBtn));
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    bindTemplateMetabox();
  });

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
/*! Bundled license information:

sortablejs/modular/sortable.esm.js:
  (**!
   * Sortable 1.15.7
   * @author	RubaXa   <trash@rubaxa.org>
   * @author	owenm    <owen23355@gmail.com>
   * @license MIT
   *)
*/
//# sourceMappingURL=blocks-admin.js.map
