(() => {
  // themes/baselayer/src/js/editor/icons/icons.generated.js
  var themeIconCategory = {
    slug: "theme",
    label: "Theme",
    icons: [
      { filename: "theme-logo", label: "Logo", keywords: ["brand", "marke", "signet"], alternatives: [] }
    ]
  };

  // themes/baselayer/src/js/editor/icons/icon-catalog.js
  var builtInCategories = [
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
        { filename: "book-open", alternatives: ["fill"], keywords: ["read", "open", "library", "publication"] }
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
        { filename: "odometer", alternatives: ["fill"], keywords: ["odometer", "mileage", "counter", "distance", "gauge"] }
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
  var iconL10n = typeof window !== "undefined" && window.baselayerIcons || {};
  var runtimeThemeCategory = Object.prototype.hasOwnProperty.call(iconL10n, "themeCategory") ? iconL10n.themeCategory : null;
  var resolvedThemeCategory = runtimeThemeCategory && typeof runtimeThemeCategory === "object" ? runtimeThemeCategory : themeIconCategory;
  var iconCategories = resolvedThemeCategory && Array.isArray(resolvedThemeCategory.icons) && resolvedThemeCategory.icons.length ? [resolvedThemeCategory, ...builtInCategories] : builtInCategories;
  var allIcons = iconCategories.reduce((icons, category) => icons.concat(category.icons), []);
  var hasVariant = (icon, variant) => !!icon && !!variant && icon.alternatives.indexOf(variant) !== -1;
  var resolveIconName = (icon, variant) => variant && variant !== "outline" && hasVariant(icon, variant) ? `${icon.filename}-${variant}` : icon.filename;
  var iconMatchesQuery = (icon, query, displayName = "") => {
    if (!query) {
      return true;
    }
    const haystack = [icon.filename, displayName].concat(icon.keywords).join(" ").toLowerCase();
    return haystack.indexOf(query) !== -1;
  };
  var findIconByValue = (value) => {
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

  // themes/baselayer/src/js/editor/icons/icon-variant.js
  var VARIANT_STORAGE_KEY = "baselayerIconVariant";
  var readStoredVariant = () => {
    try {
      return window.localStorage.getItem(VARIANT_STORAGE_KEY) === "fill" ? "fill" : "outline";
    } catch {
      return "outline";
    }
  };
  var writeStoredVariant = (variant) => {
    try {
      window.localStorage.setItem(VARIANT_STORAGE_KEY, variant);
    } catch {
    }
  };
  var resolvePickerVariant = (value) => {
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

  // themes/baselayer/src/js/editor/icons/icon-picker-service.js
  var iconL10n2 = () => typeof window !== "undefined" && window.baselayerIcons || {};
  var iconLabels = () => iconL10n2().labels || {};
  var categoryLabels = () => iconL10n2().categories || {};
  var uiStrings = () => iconL10n2().ui || {};
  var t = (key, fallback) => uiStrings()[key] || fallback;
  var humanize = (slug) => slug.replace(/-/g, " ").replace(/^\w/, (char) => char.toUpperCase());
  var iconName = (icon, labels) => icon.label || labels[icon.filename] || humanize(icon.filename);
  var categoryName = (category, labels) => category.label || labels[category.slug] || humanize(category.slug);
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
  var iconPickerService = createIconPickerService();
  function openIconPicker({ currentValue = "", onSelect, returnFocus = null }) {
    iconPickerService.open({ currentValue, onSelect, returnFocus });
  }

  // themes/baselayer/packages/baselayer-events/src/js/menu-icon-field.js
  function isSvgValue(value) {
    return typeof value === "string" && value.trim().toLowerCase().includes("<svg");
  }
  function syncPreview(root, value) {
    const preview = root.querySelector("[data-bl-events-menu-icon-preview]");
    const empty = root.querySelector("[data-bl-events-menu-icon-empty]");
    if (!preview) {
      return;
    }
    const trimmed = (value || "").trim();
    preview.replaceChildren();
    preview.hidden = trimmed === "";
    if (empty) {
      empty.hidden = trimmed !== "";
    }
    if (trimmed === "") {
      return;
    }
    if (isSvgValue(trimmed)) {
      const wrap = document.createElement("span");
      wrap.className = "bl-events-menu-icon-field__svg";
      wrap.innerHTML = trimmed;
      preview.appendChild(wrap);
      return;
    }
    const icon = document.createElement("span");
    icon.className = "bl-icon -icon-" + trimmed.replace(/[^a-z0-9_-]/gi, "");
    icon.setAttribute("aria-hidden", "true");
    preview.appendChild(icon);
  }
  function setSvgOpen(root, open) {
    const panel = root.querySelector("[data-bl-events-menu-icon-svg-panel]");
    const toggle = root.querySelector("[data-bl-events-menu-icon-svg-toggle]");
    if (panel) {
      panel.hidden = !open;
    }
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.classList.toggle("is-active", open);
    }
  }
  function bootMenuIconField() {
    const root = document.querySelector("[data-bl-events-menu-icon-field]");
    if (!root) {
      return;
    }
    const input = root.querySelector("[data-bl-events-menu-icon-value]");
    const textarea = root.querySelector("[data-bl-events-menu-icon-svg]");
    const chooseBtn = root.querySelector("[data-bl-events-menu-icon-choose]");
    const svgToggle = root.querySelector("[data-bl-events-menu-icon-svg-toggle]");
    const clearBtn = root.querySelector("[data-bl-events-menu-icon-clear]");
    if (!input) {
      return;
    }
    let value = input.value || "";
    const startWithSvg = isSvgValue(value);
    setSvgOpen(root, startWithSvg);
    if (textarea && startWithSvg) {
      textarea.value = value;
    }
    syncPreview(root, value);
    const commit = (next, { openSvg = false } = {}) => {
      value = next == null ? "" : String(next);
      input.value = value;
      if (textarea && isSvgValue(value)) {
        textarea.value = value;
      } else if (textarea && !openSvg) {
        if (!isSvgValue(value)) {
          textarea.value = "";
        }
      }
      syncPreview(root, value);
      if (openSvg) {
        setSvgOpen(root, true);
      }
    };
    if (chooseBtn) {
      chooseBtn.addEventListener("click", () => {
        openIconPicker({
          currentValue: isSvgValue(value) ? "" : value,
          returnFocus: chooseBtn,
          onSelect: (iconName2) => {
            commit(iconName2);
            setSvgOpen(root, false);
          }
        });
      });
    }
    if (svgToggle) {
      svgToggle.addEventListener("click", () => {
        const panel = root.querySelector("[data-bl-events-menu-icon-svg-panel]");
        const willOpen = panel ? panel.hidden : true;
        setSvgOpen(root, willOpen);
        if (willOpen && textarea) {
          textarea.focus();
        }
      });
    }
    if (textarea) {
      textarea.addEventListener("input", () => {
        commit(textarea.value, { openSvg: true });
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        commit("");
        setSvgOpen(root, false);
        if (textarea) {
          textarea.value = "";
        }
      });
    }
  }

  // themes/baselayer/packages/baselayer-events/src/js/settings.js
  function bootMetaBuilder() {
    const cfg = window.blEventsMetaBuilder || {};
    const root = document.querySelector("[data-bl-events-meta-builder]");
    const jsonInput = document.getElementById("bl-events-meta-config-json");
    const FB = window.BlFieldBuilder;
    if (!root || !jsonInput || !FB) {
      return;
    }
    FB.ensureTypes();
    const {
      el,
      empty,
      slugify,
      createFieldRow,
      serializeFieldRow,
      createSortable,
      createListRow
    } = FB;
    const i18n = cfg.i18n || {};
    const MODE = "event-meta";
    const ROW_OPTS = {
      tabs: ["general"],
      labels: {
        title: i18n.fieldLabel || "Label",
        slug: i18n.fieldId || "Field ID"
      },
      showRequired: false,
      showHelp: true
    };
    let initial = { title: "", groups: {} };
    try {
      initial = jsonInput.value ? JSON.parse(jsonInput.value) : initial;
    } catch (e) {
      initial = cfg.initial || initial;
    }
    if (!initial || typeof initial !== "object") {
      initial = { title: "", groups: {} };
    }
    empty(root);
    root.classList.add("bl-events-meta-builder", "bl-field-builder");
    const titleInputEl = el("input", {
      type: "text",
      className: "regular-text",
      dataset: { blEventsMetaTitle: "1" },
      value: initial.title || ""
    });
    const titleRow = el("div", { className: "bl-events-meta-builder__title-row" }, [
      el("label", {
        className: "bl-events-meta-builder__title-label",
        text: i18n.panelTitle || "Panel title"
      }),
      titleInputEl
    ]);
    const groupsList = el("div", {
      className: "bl-events-meta-builder__groups bl-field-builder__list",
      dataset: { blEventsMetaGroups: "1" }
    });
    const emptyState = el("p", {
      className: "bl-field-builder__empty description",
      text: i18n.emptyGroups || "No metadata groups yet. Add a group to get started."
    });
    const addGroupBtn = el("button", {
      type: "button",
      className: "button bl-button-small",
      text: i18n.addGroup || "Add group"
    });
    root.appendChild(titleRow);
    root.appendChild(groupsList);
    root.appendChild(emptyState);
    root.appendChild(addGroupBtn);
    const syncEmpty = () => {
      const has = groupsList.querySelector("[data-bl-events-meta-group]") != null;
      emptyState.hidden = has;
    };
    const syncJson = () => {
      const titleInput = root.querySelector("[data-bl-events-meta-title]");
      const groups = {};
      groupsList.querySelectorAll(":scope > [data-bl-events-meta-group]").forEach((groupEl) => {
        const idInput = groupEl.querySelector("[data-bl-events-meta-group-id]");
        const titleG = groupEl.querySelector("[data-bl-events-meta-group-title]");
        let gid = idInput ? slugify(idInput.value) : "";
        if (gid === "") {
          gid = slugify(titleG ? titleG.value : "") || "group";
        }
        let base = gid;
        let n = 2;
        while (groups[gid]) {
          gid = base + "_" + n;
          n += 1;
        }
        if (idInput) {
          idInput.value = gid;
        }
        const fields = {};
        const fieldsList = groupEl.querySelector("[data-bl-events-meta-fields]");
        if (fieldsList) {
          fieldsList.querySelectorAll(":scope > [data-bl-fb-field]").forEach((row) => {
            const serialized = serializeFieldRow(row);
            let fid = slugify(serialized.slug || serialized.title || "");
            if (fid === "") {
              fid = "field";
            }
            let fbase = fid;
            let fn = 2;
            while (fields[fid]) {
              fid = fbase + "_" + fn;
              fn += 1;
            }
            const field = {
              type: serialized.type || "text",
              label: serialized.title || fid
            };
            if (serialized.help) {
              field.help = serialized.help;
            }
            if (serialized.placeholder) {
              field.placeholder = serialized.placeholder;
            }
            if (Array.isArray(serialized.options) && serialized.options.length) {
              field.options = serialized.options;
            }
            if (serialized.default_value != null && serialized.default_value !== "" && serialized.default_value !== false) {
              field.default_value = serialized.default_value;
            }
            fields[fid] = field;
          });
        }
        groups[gid] = {
          title: titleG ? titleG.value.trim() || gid : gid,
          fields
        };
      });
      jsonInput.value = JSON.stringify({
        title: titleInput ? titleInput.value.trim() : "",
        groups
      });
    };
    const createGroupCard = (groupId, groupData, open) => {
      const data = groupData && typeof groupData === "object" ? groupData : { title: "", fields: {} };
      const listRow = createListRow({
        title: data.title || groupId || "",
        open,
        className: "bl-events-meta-builder__group",
        dataset: { blEventsMetaGroup: "1" },
        untitled: "(untitled group)",
        dragTitle: i18n.dragGroup || "Drag to reorder",
        deleteTitle: i18n.deleteGroup || "Delete",
        onDelete: () => {
          listRow.root.remove();
          syncEmpty();
          syncJson();
        }
      });
      const { root: card, body, setTitle } = listRow;
      body.classList.add("bl-events-meta-builder__group-body");
      const idInput = el("input", {
        type: "text",
        className: "regular-text",
        dataset: { blEventsMetaGroupId: "1" },
        value: groupId || ""
      });
      const gTitleInput = el("input", {
        type: "text",
        className: "regular-text",
        dataset: { blEventsMetaGroupTitle: "1" },
        value: data.title || ""
      });
      body.appendChild(
        el("div", { className: "bl-field-builder__form-row" }, [
          el("div", { className: "bl-field-builder__form-label", text: i18n.groupId || "Group ID" }),
          idInput
        ])
      );
      body.appendChild(
        el("div", { className: "bl-field-builder__form-row" }, [
          el("div", { className: "bl-field-builder__form-label", text: i18n.groupTitle || "Group title" }),
          gTitleInput
        ])
      );
      const fieldsList = el("div", {
        className: "bl-events-meta-builder__fields bl-field-builder__list",
        dataset: { blEventsMetaFields: "1" }
      });
      const fieldsEmpty = el("p", {
        className: "description bl-events-meta-builder__fields-empty",
        text: i18n.emptyFields || "No fields in this group."
      });
      const addFieldBtn = el("button", {
        type: "button",
        className: "button bl-button-small",
        text: i18n.addField || "Add field"
      });
      body.appendChild(
        el("h4", { className: "bl-events-meta-builder__fields-heading", text: i18n.fields || "Fields" })
      );
      body.appendChild(fieldsList);
      body.appendChild(fieldsEmpty);
      body.appendChild(addFieldBtn);
      const syncFieldsEmpty = () => {
        fieldsEmpty.hidden = fieldsList.querySelector("[data-bl-fb-field]") != null;
      };
      const addField = (fieldId, fieldCfg, fieldOpen) => {
        const f = fieldCfg && typeof fieldCfg === "object" ? fieldCfg : {};
        const row = createFieldRow({
          mode: MODE,
          open: !!fieldOpen,
          ...ROW_OPTS,
          data: {
            type: f.type || "text",
            title: f.label || "",
            slug: fieldId || "",
            help: f.help || "",
            placeholder: f.placeholder || "",
            options: f.options || [],
            default_value: f.default_value
          }
        });
        fieldsList.appendChild(row);
        syncFieldsEmpty();
        return row;
      };
      Object.keys(data.fields || {}).forEach((fid) => {
        addField(fid, data.fields[fid], false);
      });
      syncFieldsEmpty();
      createSortable(fieldsList, {
        handle: ".bl-field-builder__item-handle",
        draggable: "[data-bl-fb-field]",
        group: { name: "bl-events-meta-fields", pull: true, put: true },
        onSort: syncJson
      });
      fieldsList.addEventListener("bl-fb-delete", (event) => {
        const row = event.target.closest("[data-bl-fb-field]");
        if (row && fieldsList.contains(row)) {
          row.remove();
          syncFieldsEmpty();
          syncJson();
        }
      });
      fieldsList.addEventListener("input", syncJson);
      fieldsList.addEventListener("change", syncJson);
      addFieldBtn.addEventListener("click", () => {
        addField("", { type: "text", label: "" }, true);
        syncJson();
      });
      gTitleInput.addEventListener("input", () => {
        setTitle(gTitleInput.value);
        if (!idInput.dataset.touched) {
          idInput.value = slugify(gTitleInput.value);
        }
        syncJson();
      });
      idInput.addEventListener("input", () => {
        idInput.dataset.touched = "1";
        syncJson();
      });
      return card;
    };
    Object.keys(initial.groups || {}).forEach((gid) => {
      groupsList.appendChild(createGroupCard(gid, initial.groups[gid], false));
    });
    syncEmpty();
    createSortable(groupsList, {
      handle: ".bl-field-builder__item-handle",
      draggable: "[data-bl-events-meta-group]",
      onSort: syncJson
    });
    addGroupBtn.addEventListener("click", () => {
      groupsList.appendChild(createGroupCard("", { title: "", fields: {} }, true));
      syncEmpty();
      syncJson();
    });
    titleInputEl.addEventListener("input", syncJson);
    const form = root.closest("form");
    if (form) {
      form.addEventListener("submit", syncJson);
    }
    syncJson();
  }
  function bootStatusesBuilder() {
    const cfg = window.blEventsStatusesBuilder || {};
    const root = document.querySelector("[data-bl-events-statuses-builder]");
    const jsonInput = document.getElementById("bl-events-statuses-config-json");
    const FB = window.BlFieldBuilder;
    if (!root || !jsonInput || !FB) {
      return;
    }
    const { el, empty, slugify, createSortable, createListRow } = FB;
    const i18n = cfg.i18n || {};
    const presets = Array.isArray(cfg.colorPresets) ? cfg.colorPresets : [];
    const defaultToken = cfg.defaultColor || "info";
    const CUSTOM = "__custom__";
    let initial = {};
    try {
      initial = jsonInput.value ? JSON.parse(jsonInput.value) : {};
    } catch (e) {
      initial = cfg.initial || {};
    }
    if (!initial || typeof initial !== "object" || Array.isArray(initial)) {
      initial = {};
    }
    empty(root);
    root.classList.add("bl-events-statuses-builder", "bl-field-builder");
    const list = el("div", {
      className: "bl-events-statuses-builder__list bl-field-builder__list",
      dataset: { blEventsStatusesList: "1" }
    });
    const emptyState = el("p", {
      className: "bl-field-builder__empty description",
      text: i18n.empty || "No custom statuses yet. Add a status to get started."
    });
    const addBtn = el("button", {
      type: "button",
      className: "button bl-button-small",
      text: i18n.addStatus || "Add status"
    });
    root.appendChild(list);
    root.appendChild(emptyState);
    root.appendChild(addBtn);
    const isHex = (value) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value || "").trim());
    const normalizeHex = (value) => {
      const v = String(value || "").trim();
      if (!isHex(v)) {
        return "#2271b1";
      }
      if (v.length === 4) {
        return "#" + v.slice(1).split("").map((c) => c + c).join("").toLowerCase();
      }
      return v.toLowerCase();
    };
    const parseStoredColor = (raw) => {
      const color = String(raw || "").trim();
      if (isHex(color)) {
        return { mode: CUSTOM, token: defaultToken, hex: normalizeHex(color) };
      }
      const token = color || defaultToken;
      const known = presets.some((p) => p.key === token);
      return {
        mode: known ? token : defaultToken,
        token: known ? token : defaultToken,
        hex: "#2271b1"
      };
    };
    const syncEmpty = () => {
      emptyState.hidden = list.querySelector("[data-bl-events-status]") != null;
    };
    const syncJson = () => {
      const statuses = {};
      list.querySelectorAll(":scope > [data-bl-events-status]").forEach((row) => {
        const idInput = row.querySelector("[data-bl-events-status-id]");
        const labelInput = row.querySelector("[data-bl-events-status-label]");
        const colorSelect = row.querySelector("[data-bl-events-status-color-mode]");
        const hexInput = row.querySelector("[data-bl-events-status-color-hex]");
        let id = idInput ? slugify(idInput.value) : "";
        if (id === "") {
          id = slugify(labelInput ? labelInput.value : "") || "status";
        }
        let base = id;
        let n = 2;
        while (statuses[id]) {
          id = base + "_" + n;
          n += 1;
        }
        if (idInput) {
          idInput.value = id;
        }
        const mode = colorSelect ? colorSelect.value : defaultToken;
        let color = defaultToken;
        if (mode === CUSTOM) {
          color = normalizeHex(hexInput ? hexInput.value : "#2271b1");
        } else if (mode) {
          color = mode;
        }
        statuses[id] = {
          label: labelInput ? labelInput.value.trim() || id : id,
          color
        };
      });
      jsonInput.value = JSON.stringify(statuses);
    };
    const createStatusRow = (statusId, data, open) => {
      const rowData = data && typeof data === "object" ? data : { label: "", color: defaultToken };
      const parsed = parseStoredColor(rowData.color);
      const colorPreview = el("span", {
        className: "bl-events-statuses-builder__swatch",
        title: parsed.mode === CUSTOM ? parsed.hex : parsed.mode,
        "aria-hidden": "true"
      });
      if (parsed.mode === CUSTOM) {
        colorPreview.style.backgroundColor = parsed.hex;
      } else {
        colorPreview.dataset.token = parsed.mode;
        colorPreview.classList.add("bl-events-statuses-builder__swatch--token");
        colorPreview.style.setProperty("--bl-status-swatch", "var(--bl-color-" + parsed.mode + ", #2271b1)");
        colorPreview.style.backgroundColor = "var(--bl-status-swatch)";
      }
      const listRow = createListRow({
        title: rowData.label || statusId || "",
        open,
        meta: colorPreview,
        className: "bl-events-statuses-builder__row",
        dataset: { blEventsStatus: "1" },
        dragTitle: i18n.drag || "Drag to reorder",
        deleteTitle: i18n.delete || "Delete",
        onDelete: () => {
          listRow.root.remove();
          syncEmpty();
          syncJson();
        }
      });
      const { root: card, body, setTitle, setMeta } = listRow;
      body.classList.add("bl-events-statuses-builder__body");
      const idInput = el("input", {
        type: "text",
        className: "regular-text",
        dataset: { blEventsStatusId: "1" },
        value: statusId || ""
      });
      const labelInput = el("input", {
        type: "text",
        className: "regular-text",
        dataset: { blEventsStatusLabel: "1" },
        value: rowData.label || ""
      });
      const colorSelect = el("select", {
        className: "bl-events-statuses-builder__color-select",
        dataset: { blEventsStatusColorMode: "1" }
      });
      presets.forEach((preset) => {
        colorSelect.appendChild(
          el("option", {
            value: preset.key,
            text: preset.label || preset.key,
            selected: parsed.mode === preset.key ? true : void 0
          })
        );
      });
      colorSelect.appendChild(
        el("option", {
          value: CUSTOM,
          text: i18n.customColor || "Custom\u2026",
          selected: parsed.mode === CUSTOM ? true : void 0
        })
      );
      const hexInput = el("input", {
        type: "color",
        className: "bl-events-statuses-builder__color-picker",
        dataset: { blEventsStatusColorHex: "1" },
        value: parsed.hex
      });
      const hexText = el("input", {
        type: "text",
        className: "regular-text bl-events-statuses-builder__color-hex",
        value: parsed.hex,
        placeholder: "#2271b1"
      });
      const customWrap = el(
        "div",
        {
          className: "bl-events-statuses-builder__custom-color",
          hidden: parsed.mode === CUSTOM ? void 0 : true
        },
        [
          el("div", {
            className: "bl-field-builder__form-label",
            text: i18n.customColorLabel || "Custom color"
          }),
          el("div", { className: "bl-events-statuses-builder__custom-color-row" }, [hexInput, hexText])
        ]
      );
      body.appendChild(
        el("div", { className: "bl-field-builder__form-row" }, [
          el("div", { className: "bl-field-builder__form-label", text: i18n.statusId || "Status ID" }),
          idInput
        ])
      );
      body.appendChild(
        el("div", { className: "bl-field-builder__form-row" }, [
          el("div", { className: "bl-field-builder__form-label", text: i18n.statusLabel || "Label" }),
          labelInput
        ])
      );
      body.appendChild(
        el("div", { className: "bl-field-builder__form-row" }, [
          el("div", { className: "bl-field-builder__form-label", text: i18n.color || "Color" }),
          colorSelect
        ])
      );
      body.appendChild(customWrap);
      const updateSwatch = () => {
        const mode = colorSelect.value;
        if (mode === CUSTOM) {
          const hex = normalizeHex(hexInput.value);
          colorPreview.classList.remove("bl-events-statuses-builder__swatch--token");
          colorPreview.style.backgroundColor = hex;
          colorPreview.title = hex;
          delete colorPreview.dataset.token;
        } else {
          colorPreview.classList.add("bl-events-statuses-builder__swatch--token");
          colorPreview.style.setProperty("--bl-status-swatch", "var(--bl-color-" + mode + ", #2271b1)");
          colorPreview.style.backgroundColor = "var(--bl-status-swatch)";
          colorPreview.title = mode;
          colorPreview.dataset.token = mode;
        }
        setMeta(colorPreview);
      };
      const syncCustomVisibility = () => {
        const isCustom = colorSelect.value === CUSTOM;
        customWrap.hidden = !isCustom;
        updateSwatch();
        syncJson();
      };
      labelInput.addEventListener("input", () => {
        setTitle(labelInput.value);
        if (!idInput.dataset.touched) {
          idInput.value = slugify(labelInput.value);
        }
        syncJson();
      });
      idInput.addEventListener("input", () => {
        idInput.dataset.touched = "1";
        syncJson();
      });
      colorSelect.addEventListener("change", syncCustomVisibility);
      hexInput.addEventListener("input", () => {
        hexText.value = hexInput.value;
        updateSwatch();
        syncJson();
      });
      hexText.addEventListener("input", () => {
        const v = hexText.value.trim();
        if (isHex(v)) {
          hexInput.value = normalizeHex(v);
          updateSwatch();
        }
        syncJson();
      });
      hexText.addEventListener("change", () => {
        if (isHex(hexText.value)) {
          hexText.value = normalizeHex(hexText.value);
          hexInput.value = hexText.value;
        } else {
          hexText.value = normalizeHex(hexInput.value);
        }
        updateSwatch();
        syncJson();
      });
      return card;
    };
    Object.keys(initial).forEach((id) => {
      list.appendChild(createStatusRow(id, initial[id], false));
    });
    syncEmpty();
    createSortable(list, {
      handle: ".bl-field-builder__item-handle",
      draggable: "[data-bl-events-status]",
      onSort: syncJson
    });
    addBtn.addEventListener("click", () => {
      list.appendChild(createStatusRow("", { label: "", color: defaultToken }, true));
      syncEmpty();
      syncJson();
    });
    const form = root.closest("form");
    if (form) {
      form.addEventListener("submit", syncJson);
    }
    syncJson();
  }
  function boot() {
    bootMenuIconField();
    bootMetaBuilder();
    bootStatusesBuilder();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
//# sourceMappingURL=events-settings.js.map
