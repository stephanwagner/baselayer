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

  // themes/baselayer/src/js/editor/block-option-help.js
  function optionHelpProps(option) {
    return option.description ? { help: option.description } : {};
  }
  function BlockOptionDescription({ description }) {
    if (!description) {
      return null;
    }
    return /* @__PURE__ */ wp.element.createElement("p", { className: "components-base-control__help" }, description);
  }

  // themes/baselayer/src/js/editor/icons/icon-picker.js
  var { Button } = wp.components;
  var { useRef } = wp.element;
  var iconL10n3 = typeof window !== "undefined" && window.baselayerIcons || {};
  var iconLabels2 = iconL10n3.labels || {};
  var uiStrings2 = iconL10n3.ui || {};
  var t2 = (key, fallback) => uiStrings2[key] || fallback;
  var humanize2 = (slug) => slug.replace(/-/g, " ").replace(/^\w/, (char) => char.toUpperCase());
  var iconName2 = (icon) => icon.label || iconLabels2[icon.filename] || humanize2(icon.filename);
  function IconPicker({ label, description, value, onChange }) {
    const triggerRef = useRef(null);
    const selected = findIconByValue(value);
    const openPicker = () => {
      openIconPicker({
        currentValue: value,
        onSelect: onChange,
        returnFocus: triggerRef.current
      });
    };
    return /* @__PURE__ */ wp.element.createElement("div", { className: "bl-icon-picker" }, label ? /* @__PURE__ */ wp.element.createElement("span", { className: "bl-icon-picker__label" }, label) : null, selected ? /* @__PURE__ */ wp.element.createElement("div", { className: "bl-icon-picker__value" }, /* @__PURE__ */ wp.element.createElement("span", { className: "bl-icon -icon-" + value, "aria-hidden": "true" }), /* @__PURE__ */ wp.element.createElement("span", { className: "bl-icon-picker__value-name" }, iconName2(selected.icon))) : null, /* @__PURE__ */ wp.element.createElement("div", { className: "bl-icon-picker__control" }, /* @__PURE__ */ wp.element.createElement(Button, { ref: triggerRef, variant: "secondary", className: "bl-icon-picker__trigger", onClick: openPicker }, t2("choose", "Choose icon")), value ? /* @__PURE__ */ wp.element.createElement(Button, { variant: "tertiary", isDestructive: true, className: "bl-icon-picker__clear", onClick: () => onChange("") }, t2("remove", "Remove")) : null), /* @__PURE__ */ wp.element.createElement(BlockOptionDescription, { description }));
  }

  // themes/baselayer/src/js/editor/content-margin-utils.js
  var CONTENT_MARGIN_SIZES = [
    { value: "unset", label: "\u2014" },
    { value: "none", label: "0" },
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" }
  ];
  var contentMarginSizesForOption = (option) => {
    const allowUnset = option.allowUnset === true;
    return allowUnset ? CONTENT_MARGIN_SIZES : CONTENT_MARGIN_SIZES.filter((size) => size.value !== "unset");
  };
  var CONTENT_MARGIN_CLASS_TOKENS = ["none", "xs", "s", "m", "l", "xl"];
  var ALL_CONTENT_MARGIN_CLASSES = CONTENT_MARGIN_CLASS_TOKENS.flatMap((value) => [
    `-content-margin-${value}`,
    `-content-margin-top-${value}`,
    `-content-margin-bottom-${value}`
  ]);
  var parseCombinedMarginClass = (className) => {
    if (!className || typeof className !== "string") {
      return "";
    }
    const match = className.match(/^-content-margin-(none|xs|s|m|l|xl)$/);
    return match ? match[1] : "";
  };
  var parseSideMarginClass = (className) => {
    if (!className || typeof className !== "string") {
      return null;
    }
    const match = className.match(/^-content-margin-(top|bottom)-(none|xs|s|m|l|xl)$/);
    if (!match) {
      return null;
    }
    return { side: match[1], size: match[2] };
  };
  var parseMarginStateFromClassName = (className) => {
    const classes = (className || "").split(/\s+/).filter(Boolean);
    let top = "";
    let bottom = "";
    let linked = true;
    for (const name of classes) {
      const combined = parseCombinedMarginClass(name);
      if (combined) {
        top = combined;
        bottom = combined;
        linked = true;
        continue;
      }
      const side = parseSideMarginClass(name);
      if (side) {
        linked = false;
        if (side.side === "top") {
          top = side.size;
        } else {
          bottom = side.size;
        }
      }
    }
    return { top, bottom, linked };
  };
  var classForSize = (prefix, size) => size ? `${prefix}${size}` : "";
  var contentMarginClassesFromAttributes = (option, attributes) => {
    const { top, bottom, linked } = option.attributeNames;
    const isLinked = attributes[linked] !== false;
    const topSize = attributes[top] ?? "";
    const bottomSize = attributes[bottom] ?? "";
    if (isLinked) {
      return topSize ? [classForSize("-content-margin-", topSize)] : [];
    }
    const classes = [];
    if (topSize) {
      classes.push(classForSize("-content-margin-top-", topSize));
    }
    if (bottomSize) {
      classes.push(classForSize("-content-margin-bottom-", bottomSize));
    }
    return classes;
  };
  var displayMarginSize = (storedSize, allowUnset = false) => {
    if (storedSize === "") {
      return allowUnset ? "unset" : "";
    }
    return storedSize;
  };
  var storedMarginSize = (pickedSize) => pickedSize === "unset" ? "" : pickedSize;
  var resetMarginSize = (defaultSize) => defaultSize || "";
  var migrateLegacyContentMarginAttributes = (attributes, option) => {
    const { top, bottom, linked } = option.attributeNames;
    const hasNewState = attributes[top] !== void 0 || attributes[bottom] !== void 0 || attributes[linked] !== void 0;
    const updates = {};
    let nextTop = attributes[top] ?? "";
    let nextBottom = attributes[bottom] ?? "";
    let nextLinked = attributes[linked] !== false;
    if (attributes.contentMargin) {
      const size = parseCombinedMarginClass(attributes.contentMargin);
      if (size) {
        nextTop = size;
        nextBottom = size;
        nextLinked = true;
      }
      updates.contentMargin = "";
    }
    if (attributes.contentMarginAdjust) {
      const side = parseSideMarginClass(attributes.contentMarginAdjust);
      if (side) {
        nextLinked = false;
        if (side.side === "top") {
          nextTop = side.size;
        } else {
          nextBottom = side.size;
        }
      }
      updates.contentMarginAdjust = "";
    }
    if (!hasNewState && !attributes.contentMargin && !attributes.contentMarginAdjust) {
      const fromClass = parseMarginStateFromClassName(attributes.className);
      if (fromClass.top || fromClass.bottom) {
        nextTop = fromClass.top;
        nextBottom = fromClass.bottom;
        nextLinked = fromClass.linked;
      }
    }
    if (nextTop !== (attributes[top] ?? "") || nextBottom !== (attributes[bottom] ?? "") || nextLinked !== (attributes[linked] !== false)) {
      updates[top] = nextTop;
      updates[bottom] = nextBottom;
      updates[linked] = nextLinked;
    }
    return Object.keys(updates).length ? updates : null;
  };
  var contentMarginAttributeKeys = (option) => {
    const names = option.attributeNames;
    return [names.top, names.bottom, names.linked];
  };

  // themes/baselayer/src/js/editor/block-option-toggle-group-option.js
  var ToggleGroupControlOption = wp.components.__experimentalToggleGroupControlOption;
  var ToggleGroupControlOptionIcon = wp.components.__experimentalToggleGroupControlOptionIcon;
  var themeIconComponents = /* @__PURE__ */ new Map();
  function getThemeIconComponent(iconName3) {
    if (!themeIconComponents.has(iconName3)) {
      themeIconComponents.set(iconName3, function ThemeIcon() {
        return /* @__PURE__ */ wp.element.createElement("span", { className: "bl-icon -icon-" + iconName3, "aria-hidden": "true" });
      });
    }
    return themeIconComponents.get(iconName3);
  }
  function BlockOptionToggleGroupOption({
    value,
    label,
    icon,
    iconLabel,
    iconPosition = "before",
    title
  }) {
    const tooltip = title || label;
    if (icon && iconLabel && ToggleGroupControlOption) {
      const iconPlacement = iconPosition === "after" ? "-icon-after" : "-icon-before";
      return /* @__PURE__ */ wp.element.createElement(
        ToggleGroupControlOption,
        {
          value,
          label,
          showTooltip: true,
          "aria-label": tooltip,
          className: "bl-toggle-group-option--icon-label " + iconPlacement + " -icon-" + icon
        }
      );
    }
    if (icon && ToggleGroupControlOptionIcon) {
      return /* @__PURE__ */ wp.element.createElement(
        ToggleGroupControlOptionIcon,
        {
          value,
          label: tooltip,
          icon: getThemeIconComponent(icon)
        }
      );
    }
    if (!ToggleGroupControlOption) {
      return null;
    }
    return /* @__PURE__ */ wp.element.createElement(
      ToggleGroupControlOption,
      {
        value,
        label: icon ? "\u2014" : label,
        showTooltip: Boolean(icon || title),
        "aria-label": icon || title ? tooltip : void 0
      }
    );
  }

  // themes/baselayer/src/js/editor/content-margin-control.js
  var { Button: Button2 } = wp.components;
  var ToggleGroupControl = wp.components.__experimentalToggleGroupControl;
  function ContentMarginControl({ option, attributes, onChange }) {
    const { top, bottom, linked } = option.attributeNames;
    const defaultSize = option.defaultSize ?? "";
    const allowUnset = option.allowUnset === true;
    const sizes = contentMarginSizesForOption(option);
    const isLinked = attributes[linked] !== false;
    const topValue = attributes[top] ?? "";
    const bottomValue = attributes[bottom] ?? "";
    const displayTop = displayMarginSize(topValue, allowUnset);
    const displayBottom = displayMarginSize(bottomValue, allowUnset);
    const setTop = (pickedSize) => {
      const stored = storedMarginSize(pickedSize);
      if (isLinked) {
        onChange({
          [top]: stored,
          [bottom]: stored
        });
        return;
      }
      onChange({ [top]: stored });
    };
    const setBottom = (pickedSize) => {
      onChange({ [bottom]: storedMarginSize(pickedSize) });
    };
    const resetTop = () => {
      const stored = resetMarginSize(defaultSize);
      if (isLinked) {
        onChange({ [top]: stored, [bottom]: stored });
        return;
      }
      onChange({ [top]: stored });
    };
    const resetBottom = () => {
      onChange({ [bottom]: resetMarginSize(defaultSize) });
    };
    const revealBottom = () => {
      onChange({
        [linked]: false,
        [bottom]: bottomValue || topValue
      });
    };
    const relink = () => {
      onChange({
        [linked]: true,
        [bottom]: topValue
      });
    };
    const renderSizeControl = (sideLabel, value, onSelect, onReset) => {
      const control = ToggleGroupControl ? /* @__PURE__ */ wp.element.createElement(
        ToggleGroupControl,
        {
          className: "bl-content-margin__sizes bl-block-option-button-group",
          label: sideLabel,
          hideLabelFromVision: true,
          value,
          isBlock: true,
          onChange: onSelect,
          __nextHasNoMarginBottom: true
        },
        sizes.map((size) => /* @__PURE__ */ wp.element.createElement(
          BlockOptionToggleGroupOption,
          {
            key: size.value,
            value: size.value,
            label: size.label,
            icon: size.icon
          }
        ))
      ) : null;
      return /* @__PURE__ */ wp.element.createElement("div", { className: "bl-content-margin__field" }, /* @__PURE__ */ wp.element.createElement("div", { className: "bl-content-margin__header" }, /* @__PURE__ */ wp.element.createElement("span", { className: "bl-content-margin__side-label" }, sideLabel), /* @__PURE__ */ wp.element.createElement(Button2, { variant: "link", className: "bl-content-margin__reset", onClick: onReset }, "Reset")), control);
    };
    const renderActionButton = (icon, label, onClick, className) => /* @__PURE__ */ wp.element.createElement(Button2, { variant: "link", className: "bl-content-margin__action " + className, onClick }, /* @__PURE__ */ wp.element.createElement("span", { className: "bl-icon -icon-" + icon, "aria-hidden": "true" }), label);
    return /* @__PURE__ */ wp.element.createElement("div", { className: "bl-content-margin" }, option.label ? /* @__PURE__ */ wp.element.createElement("span", { className: "bl-content-margin__label" }, option.label) : null, renderSizeControl(isLinked ? "Oben und Unten" : "Oben", displayTop, setTop, resetTop), isLinked ? renderActionButton("link-off", "Unten", revealBottom, "bl-content-margin__action--reveal") : /* @__PURE__ */ wp.element.createElement(wp.element.Fragment, null, renderActionButton("link", "Verkn\xFCpfen", relink, "bl-content-margin__action--relink"), renderSizeControl("Unten", displayBottom, setBottom, resetBottom)), /* @__PURE__ */ wp.element.createElement(BlockOptionDescription, { description: option.description }));
  }

  // themes/baselayer/src/js/editor/content-padding-utils.js
  var contentPaddingSizesForOption = (option) => {
    const allowUnset = option.allowUnset === true;
    return allowUnset ? CONTENT_MARGIN_SIZES : CONTENT_MARGIN_SIZES.filter((size) => size.value !== "unset");
  };
  var CONTENT_PADDING_CLASS_TOKENS = ["none", "xs", "s", "m", "l", "xl"];
  var ALL_CONTENT_PADDING_CLASSES = CONTENT_PADDING_CLASS_TOKENS.flatMap((value) => [
    `-content-padding-${value}`,
    `-content-padding-top-${value}`,
    `-content-padding-bottom-${value}`
  ]);
  var parseCombinedPaddingClass = (className) => {
    if (!className || typeof className !== "string") {
      return "";
    }
    const match = className.match(/^-content-padding-(none|xs|s|m|l|xl)$/);
    return match ? match[1] : "";
  };
  var parsePaddingSizeFromClassName = (className) => {
    const classes = (className || "").split(/\s+/).filter(Boolean);
    for (const name of classes) {
      const combined = parseCombinedPaddingClass(name);
      if (combined) {
        return combined;
      }
    }
    for (const name of classes) {
      const match = name.match(/^-content-padding-(?:top|bottom)-(none|xs|s|m|l|xl)$/);
      if (match) {
        return match[1];
      }
    }
    return "";
  };
  var contentPaddingAttributeName = (option) => option.attributeName || "contentPadding";
  var contentPaddingClassesFromAttributes = (option, attributes) => {
    const attributeName = contentPaddingAttributeName(option);
    const size = attributes[attributeName] ?? "";
    return size ? [`-content-padding-${size}`] : [];
  };
  var displayPaddingSize = displayMarginSize;
  var storedPaddingSize = storedMarginSize;
  var resetPaddingSize = resetMarginSize;
  var migrateLegacyContentPaddingAttributes = (attributes, option) => {
    const attributeName = contentPaddingAttributeName(option);
    const current = attributes[attributeName];
    if (current !== void 0 && current !== null) {
      return null;
    }
    const legacyTop = typeof attributes.contentPaddingTop === "string" ? attributes.contentPaddingTop : "";
    const legacyBottom = typeof attributes.contentPaddingBottom === "string" ? attributes.contentPaddingBottom : "";
    const fromClass = parsePaddingSizeFromClassName(attributes.className);
    if (legacyTop || legacyBottom) {
      return { [attributeName]: legacyTop || legacyBottom };
    }
    if (fromClass) {
      return { [attributeName]: fromClass };
    }
    return null;
  };
  var contentPaddingAttributeKeys = (option) => [contentPaddingAttributeName(option)];

  // themes/baselayer/src/js/editor/content-padding-control.js
  var { Button: Button3 } = wp.components;
  var ToggleGroupControl2 = wp.components.__experimentalToggleGroupControl;
  function ContentPaddingControl({ option, attributes, onChange }) {
    const attributeName = contentPaddingAttributeName(option);
    const defaultSize = option.defaultSize ?? "m";
    const sizes = contentPaddingSizesForOption(option);
    const value = displayPaddingSize(attributes[attributeName] ?? "", false);
    const setSize = (pickedSize) => {
      onChange({ [attributeName]: storedPaddingSize(pickedSize) });
    };
    const reset = () => {
      onChange({ [attributeName]: resetPaddingSize(defaultSize) });
    };
    const control = ToggleGroupControl2 ? /* @__PURE__ */ wp.element.createElement(
      ToggleGroupControl2,
      {
        className: "bl-content-padding__sizes bl-block-option-button-group",
        label: option.label || "Innenabstand",
        hideLabelFromVision: true,
        value,
        isBlock: true,
        onChange: setSize,
        __nextHasNoMarginBottom: true
      },
      sizes.map((size) => /* @__PURE__ */ wp.element.createElement(
        BlockOptionToggleGroupOption,
        {
          key: size.value,
          value: size.value,
          label: size.label,
          icon: size.icon
        }
      ))
    ) : null;
    return /* @__PURE__ */ wp.element.createElement("div", { className: "bl-content-padding" }, /* @__PURE__ */ wp.element.createElement("div", { className: "bl-content-padding__header" }, option.label ? /* @__PURE__ */ wp.element.createElement("span", { className: "bl-content-padding__label" }, option.label) : /* @__PURE__ */ wp.element.createElement("span", null), /* @__PURE__ */ wp.element.createElement(Button3, { variant: "link", className: "bl-content-padding__reset", onClick: reset }, "Reset")), control, /* @__PURE__ */ wp.element.createElement(BlockOptionDescription, { description: option.description }));
  }

  // themes/baselayer/src/js/editor/limit-width-utils.js
  var LIMIT_WIDTH_SIZES = [
    { value: "unset", label: "\u2014" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" }
  ];
  var LIMIT_WIDTH_ALIGNS = [
    { value: "left", label: "Links", icon: "align-left" },
    { value: "center", label: "Zentriert", icon: "align-center" },
    { value: "right", label: "Rechts", icon: "align-right" }
  ];
  var WIDTH_CLASS_BY_SIZE = {
    s: "-extra-narrow",
    m: "-very-narrow",
    l: "-narrow"
  };
  var ALL_LIMIT_WIDTH_CLASSES = [
    ...Object.values(WIDTH_CLASS_BY_SIZE),
    ...Object.values(WIDTH_CLASS_BY_SIZE).flatMap((base) => [`${base}-left`, `${base}-right`])
  ];
  var LEGACY_LIMIT_WIDTH_BY_CLASS = {
    "-narrow": { size: "l", align: "center" },
    "-very-narrow": { size: "m", align: "center" },
    "-extra-narrow": { size: "s", align: "center" },
    "-narrow-left": { size: "l", align: "left" },
    "-very-narrow-left": { size: "m", align: "left" },
    "-extra-narrow-left": { size: "s", align: "left" }
  };
  var CLASS_BY_SIZE_AND_ALIGN = LIMIT_WIDTH_SIZES.reduce((map, { value: size }) => {
    if (size === "unset") {
      return map;
    }
    LIMIT_WIDTH_ALIGNS.forEach(({ value: align }) => {
      const base = WIDTH_CLASS_BY_SIZE[size];
      map[`${size}:${align}`] = align === "center" ? base : align === "left" ? `${base}-left` : `${base}-right`;
    });
    return map;
  }, {});
  var parseLimitWidthClass = (className) => {
    if (!className || typeof className !== "string") {
      return null;
    }
    if (LEGACY_LIMIT_WIDTH_BY_CLASS[className]) {
      return LEGACY_LIMIT_WIDTH_BY_CLASS[className];
    }
    for (const [size, base] of Object.entries(WIDTH_CLASS_BY_SIZE)) {
      if (className === base) {
        return { size, align: "center" };
      }
      if (className === `${base}-left`) {
        return { size, align: "left" };
      }
      if (className === `${base}-right`) {
        return { size, align: "right" };
      }
    }
    return null;
  };
  var parseLimitWidthStateFromClassName = (className) => {
    const classes = (className || "").split(/\s+/).filter(Boolean);
    for (const name of classes) {
      const parsed = parseLimitWidthClass(name);
      if (parsed) {
        return parsed;
      }
    }
    return { size: "", align: "center" };
  };
  var displayLimitWidthSize = (storedSize) => storedSize === "" ? "unset" : storedSize;
  var storedLimitWidthSize = (pickedSize) => pickedSize === "unset" ? "" : pickedSize;
  var limitWidthClassesFromAttributes = (option, attributes) => {
    const { size, align } = option.attributeNames;
    const storedSize = attributes[size] ?? "";
    const storedAlign = attributes[align] ?? option.defaultAlign ?? "center";
    if (!storedSize) {
      return [];
    }
    const className = CLASS_BY_SIZE_AND_ALIGN[`${storedSize}:${storedAlign}`];
    return className ? [className] : [];
  };
  var limitWidthAttributeKeys = (option) => {
    const { size, align } = option.attributeNames;
    return [size, align];
  };
  var migrateLegacyLimitWidthAttributes = (attributes, option) => {
    const { size, align } = option.attributeNames;
    if (attributes[size]) {
      return null;
    }
    const legacyValue = attributes.limitWidth;
    if (legacyValue && LEGACY_LIMIT_WIDTH_BY_CLASS[legacyValue]) {
      const migrated = LEGACY_LIMIT_WIDTH_BY_CLASS[legacyValue];
      return {
        [size]: migrated.size,
        [align]: migrated.align,
        limitWidth: ""
      };
    }
    const fromClassName = parseLimitWidthStateFromClassName(attributes.className);
    if (fromClassName.size) {
      return {
        [size]: fromClassName.size,
        [align]: fromClassName.align,
        limitWidth: ""
      };
    }
    return null;
  };

  // themes/baselayer/src/js/editor/limit-width-control.js
  var ToggleGroupControl3 = wp.components.__experimentalToggleGroupControl;
  function LimitWidthControl({ option, attributes, onChange }) {
    const { size, align } = option.attributeNames;
    const defaultAlign = option.defaultAlign ?? "center";
    const storedSize = attributes[size] ?? "";
    const storedAlign = attributes[align] ?? defaultAlign;
    const displaySize = displayLimitWidthSize(storedSize);
    const hasSize = Boolean(storedSize);
    const setSize = (pickedSize) => {
      onChange({ [size]: storedLimitWidthSize(pickedSize) });
    };
    const setAlign = (pickedAlign) => {
      if (!hasSize) {
        return;
      }
      onChange({ [align]: pickedAlign });
    };
    if (!ToggleGroupControl3) {
      return null;
    }
    return /* @__PURE__ */ wp.element.createElement("div", { className: "bl-limit-width" }, option.label ? /* @__PURE__ */ wp.element.createElement("span", { className: "bl-limit-width__label" }, option.label) : null, /* @__PURE__ */ wp.element.createElement("div", { className: "bl-limit-width__row bl-block-option-button-group" }, /* @__PURE__ */ wp.element.createElement(
      ToggleGroupControl3,
      {
        className: "bl-limit-width__sizes",
        label: option.label ? option.label + " Gr\xF6\xDFe" : "Gr\xF6\xDFe",
        hideLabelFromVision: true,
        value: displaySize,
        isBlock: true,
        onChange: setSize,
        __nextHasNoMarginBottom: true
      },
      LIMIT_WIDTH_SIZES.map((item) => /* @__PURE__ */ wp.element.createElement(
        BlockOptionToggleGroupOption,
        {
          key: item.value,
          value: item.value,
          label: item.label,
          icon: item.icon
        }
      ))
    ), /* @__PURE__ */ wp.element.createElement(
      "div",
      {
        className: "bl-limit-width__align-wrap" + (hasSize ? "" : " bl-limit-width__align-wrap--is-disabled")
      },
      /* @__PURE__ */ wp.element.createElement(
        ToggleGroupControl3,
        {
          className: "bl-limit-width__align",
          label: option.label ? option.label + " Ausrichtung" : "Ausrichtung",
          hideLabelFromVision: true,
          value: storedAlign,
          isBlock: true,
          onChange: setAlign,
          __nextHasNoMarginBottom: true
        },
        LIMIT_WIDTH_ALIGNS.map((item) => /* @__PURE__ */ wp.element.createElement(
          BlockOptionToggleGroupOption,
          {
            key: item.value,
            value: item.value,
            label: item.label,
            icon: item.icon
          }
        ))
      )
    )), /* @__PURE__ */ wp.element.createElement(BlockOptionDescription, { description: option.description }));
  }

  // themes/baselayer/src/js/editor/spacer-responsive-height-utils.js
  var SPACER_RESPONSIVE_HEIGHT_SIZES = [
    { value: "unset", label: "\u2014" },
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" }
  ];
  var CLASS_PREFIX = "-spacer-height-";
  var ALL_SPACER_RESPONSIVE_HEIGHT_CLASSES = SPACER_RESPONSIVE_HEIGHT_SIZES.filter(
    (size) => size.value !== "unset"
  ).map((size) => `${CLASS_PREFIX}${size.value}`);
  var displaySpacerResponsiveHeight = (storedValue) => storedValue === "" ? "unset" : storedValue.replace(CLASS_PREFIX, "");
  var storedSpacerResponsiveHeight = (pickedSize) => {
    if (pickedSize === "unset" || pickedSize === "") {
      return "";
    }
    if (pickedSize.indexOf(CLASS_PREFIX) === 0) {
      return pickedSize;
    }
    return `${CLASS_PREFIX}${pickedSize}`;
  };
  var spacerResponsiveHeightClassesFromAttributes = (option, attributes) => {
    const stored = attributes[option.attributeName] ?? "";
    return stored ? [stored] : [];
  };
  var spacerResponsiveHeightAttributeKey = (option) => option.attributeName;

  // themes/baselayer/src/js/editor/spacer-responsive-height-control.js
  var ToggleGroupControl4 = wp.components.__experimentalToggleGroupControl;
  function SpacerResponsiveHeightControl({ option, attributes, onChange }) {
    const stored = attributes[option.attributeName] ?? "";
    const displayValue = displaySpacerResponsiveHeight(stored);
    const setSize = (pickedSize) => {
      const className = storedSpacerResponsiveHeight(pickedSize);
      if (!className) {
        onChange({ [option.attributeName]: "" });
        return;
      }
      onChange({ [option.attributeName]: className });
    };
    if (!ToggleGroupControl4) {
      return null;
    }
    return /* @__PURE__ */ wp.element.createElement("div", { className: "bl-spacer-responsive-height" }, option.label ? /* @__PURE__ */ wp.element.createElement("span", { className: "bl-spacer-responsive-height__label" }, option.label) : null, /* @__PURE__ */ wp.element.createElement(
      ToggleGroupControl4,
      {
        className: "bl-spacer-responsive-height__sizes bl-block-option-button-group",
        label: option.label ? option.label : "Responsive H\xF6he",
        hideLabelFromVision: true,
        value: displayValue,
        isBlock: true,
        onChange: setSize,
        __nextHasNoMarginBottom: true
      },
      SPACER_RESPONSIVE_HEIGHT_SIZES.map((size) => /* @__PURE__ */ wp.element.createElement(
        BlockOptionToggleGroupOption,
        {
          key: size.value,
          value: size.value,
          label: size.label
        }
      ))
    ), /* @__PURE__ */ wp.element.createElement(BlockOptionDescription, { description: option.description }));
  }

  // themes/baselayer/src/js/editor/block-options.js
  var { InspectorControls } = wp.blockEditor;
  var { PanelBody, ToggleControl, SelectControl } = wp.components;
  var ToggleGroupControl5 = wp.components.__experimentalToggleGroupControl;
  var { createHigherOrderComponent } = wp.compose;
  var { Fragment, useEffect, useRef: useRef2 } = wp.element;
  var blockOptions = Array.isArray(window.baselayerBlockOptions) ? window.baselayerBlockOptions : [];
  var HIDE_BLOCK_OPTION = {
    type: "boolean",
    label: "Sichtbarkeit",
    toggleLabel: "Ausblenden",
    default: false,
    attributeName: "hideBlock",
    className: "-block-is-hidden"
  };
  var HIDE_BLOCK_CLASS = HIDE_BLOCK_OPTION.className;
  var HIDE_BLOCK_ATTRIBUTE = HIDE_BLOCK_OPTION.attributeName;
  var ALIGN_WIDE_CONTAINER_CLASS = "container-wide";
  var effectiveBlockConfig = (name, blockConfig) => ({
    name: blockConfig?.name || name,
    options: [HIDE_BLOCK_OPTION, ...blockConfig?.options || []]
  });
  var ICON_CLASS_PREFIX = "-icon-";
  var HAS_ICON_CLASS = "-has-icon";
  var ICON_ONLY_CLASS = "-icon-only";
  var LEGACY_IMAGE_TEXT_LAYOUT_CLASSES = [
    "-image-left-text-right",
    "-image-right-text-left",
    "-image-text-layout"
  ];
  var iconPrefix = (option) => option.classPrefix || ICON_CLASS_PREFIX;
  var iconNameFromClass = (value, option) => {
    const prefix = iconPrefix(option);
    return value && value.indexOf(prefix) === 0 ? value.slice(prefix.length) : "";
  };
  var getBooleanOptionLabels = (option) => {
    const hasToggleLabel = Object.prototype.hasOwnProperty.call(option, "toggleLabel");
    if (hasToggleLabel) {
      return {
        rowLabel: option.label || "",
        toggleLabel: option.toggleLabel || ""
      };
    }
    return {
      rowLabel: "",
      toggleLabel: option.label || ""
    };
  };
  var getBlockOptionKey = (option, index) => {
    if (option.type === "content-margin") {
      return "content-margin-" + index;
    }
    if (option.type === "content-padding") {
      return "content-padding-" + index;
    }
    if (option.type === "limit-width") {
      return "limit-width-" + index;
    }
    return option.attributeName || "block-option-" + index;
  };
  var getBlockOptionWrapperClass = (option, index) => {
    const classes = ["bl-block-option"];
    if (option.type === "boolean") {
      classes.push("bl-block-option-boolean");
    }
    if (index > 0 && !option.noSeparator) {
      classes.push("bl-block-option--separated");
    }
    return classes.join(" ");
  };
  var BlockOptionWrapper = ({ option, index, children }) => wp.element.createElement(
    "div",
    { className: getBlockOptionWrapperClass(option, index) },
    children
  );
  var iconPositionClasses = (blockConfig) => {
    const classes = /* @__PURE__ */ new Set();
    blockConfig.options.forEach((option) => {
      if (option.type !== "button-group") {
        return;
      }
      option.options.forEach((item) => {
        if (item.value) {
          classes.add(item.value);
        }
      });
    });
    return classes;
  };
  var isIconGlyphClass = (className, blockConfig) => {
    if (!className || className.indexOf(ICON_CLASS_PREFIX) !== 0) {
      return false;
    }
    return !iconPositionClasses(blockConfig).has(className);
  };
  var contentMarginOptions = (blockConfig) => blockConfig.options.filter((option) => option.type === "content-margin");
  var contentPaddingOptions = (blockConfig) => blockConfig.options.filter((option) => option.type === "content-padding");
  var limitWidthOptions = (blockConfig) => blockConfig.options.filter((option) => option.type === "limit-width");
  var migrateLegacyImageTextLayoutAttributes = (attributes) => {
    const classNames = (attributes.className || "").split(/\s+/).filter(Boolean);
    const hasLegacyClass = LEGACY_IMAGE_TEXT_LAYOUT_CLASSES.some(
      (legacyClass) => classNames.includes(legacyClass)
    );
    const hasLegacyAttribute = Boolean(attributes.imageTextLayout);
    if (!hasLegacyClass && !hasLegacyAttribute) {
      return null;
    }
    return {
      harmonizeImageText: true,
      imageTextLayout: ""
    };
  };
  var FONT_SIZE_TO_BUTTON_SIZE = {
    s: "-small",
    small: "-small",
    m: "",
    medium: "",
    l: "-large",
    large: "-large",
    xl: "-extra-large",
    "x-large": "-extra-large"
  };
  var BUTTON_ICON_ONLY_PLACEHOLDER = "\u200B";
  var stripButtonPlaceholderText = (text) => (text || "").replace(/\u200B/g, "").trim();
  var isButtonIconOnly = (attributes) => Boolean(attributes.buttonIcon) && stripButtonPlaceholderText(attributes.text) === "";
  var syncButtonIconOnlyPlaceholderText = (attributes) => {
    const hasIcon = Boolean(attributes.buttonIcon);
    const text = attributes.text ?? "";
    const stripped = stripButtonPlaceholderText(text);
    if (hasIcon && stripped === "") {
      return text === BUTTON_ICON_ONLY_PLACEHOLDER ? null : { text: BUTTON_ICON_ONLY_PLACEHOLDER };
    }
    if (!hasIcon && text.includes("\u200B") && stripped === "") {
      return { text: "" };
    }
    return null;
  };
  var migrateLegacyButtonFontSizeAttributes = (attributes) => {
    const updates = {};
    const hasButtonSize = Boolean(attributes.buttonSize);
    if (!hasButtonSize && attributes.fontSize) {
      updates.buttonSize = FONT_SIZE_TO_BUTTON_SIZE[attributes.fontSize] ?? "";
    }
    if (attributes.fontSize !== void 0 && attributes.fontSize !== null && attributes.fontSize !== "") {
      updates.fontSize = void 0;
    }
    const typography = attributes.style?.typography;
    if (typography?.fontSize !== void 0) {
      updates.style = {
        ...attributes.style,
        typography: {
          ...typography,
          fontSize: void 0
        }
      };
    }
    return Object.keys(updates).length ? updates : null;
  };
  var managedStaticClasses = (blockConfig) => {
    const classes = /* @__PURE__ */ new Set([
      HAS_ICON_CLASS,
      ICON_ONLY_CLASS,
      HIDE_BLOCK_CLASS,
      ALIGN_WIDE_CONTAINER_CLASS,
      ...ALL_CONTENT_MARGIN_CLASSES,
      ...ALL_CONTENT_PADDING_CLASSES,
      ...ALL_LIMIT_WIDTH_CLASSES,
      ...ALL_SPACER_RESPONSIVE_HEIGHT_CLASSES,
      ...LEGACY_IMAGE_TEXT_LAYOUT_CLASSES
    ]);
    blockConfig.options.forEach((option) => {
      if (option.type === "boolean" && option.className) {
        classes.add(option.className);
      }
      if (option.type === "select" || option.type === "button-group") {
        option.options.forEach((item) => {
          if (item.value) {
            classes.add(item.value);
          }
        });
      }
      if (option.type === "icon" && option.hasIconClass) {
        classes.add(option.hasIconClass);
      }
    });
    return classes;
  };
  var collectOptionClasses = (blockConfig, attributes) => {
    const classes = [];
    blockConfig.options.forEach((option) => {
      if (option.type === "content-margin") {
        classes.push(...contentMarginClassesFromAttributes(option, attributes));
      } else if (option.type === "content-padding") {
        classes.push(...contentPaddingClassesFromAttributes(option, attributes));
      } else if (option.type === "limit-width") {
        classes.push(...limitWidthClassesFromAttributes(option, attributes));
      } else if (option.type === "spacer-responsive-height") {
        classes.push(...spacerResponsiveHeightClassesFromAttributes(option, attributes));
      } else if (option.type === "boolean" && attributes[option.attributeName]) {
        classes.push(option.className);
      } else if (option.type === "icon" && attributes[option.attributeName]) {
        classes.push(attributes[option.attributeName]);
        classes.push(option.hasIconClass || HAS_ICON_CLASS);
      } else if ((option.type === "select" || option.type === "button-group") && attributes[option.attributeName]) {
        if (blockConfig.name === "core/button" && option.attributeName === "buttonIconPosition" && isButtonIconOnly(attributes)) {
          return;
        }
        classes.push(attributes[option.attributeName]);
      }
    });
    return classes;
  };
  var dedupeClasses = (classNames) => [...new Set((classNames || "").split(/\s+/).filter(Boolean))].join(" ");
  var syncClassNameFromOptions = (attributes, blockConfig) => {
    const staticClasses = managedStaticClasses(blockConfig);
    const base = (attributes.className || "").split(/\s+/).filter(Boolean).filter((className) => {
      if (staticClasses.has(className) || isIconGlyphClass(className, blockConfig)) {
        return false;
      }
      return true;
    }).join(" ");
    const optionClasses = collectOptionClasses(blockConfig, attributes);
    return dedupeClasses([base, ...optionClasses].filter(Boolean).join(" "));
  };
  var blockOptionAttributeKeys = (blockConfig) => blockConfig.options.flatMap((option) => {
    if (option.type === "content-margin") {
      return [...contentMarginAttributeKeys(option), "contentMargin", "contentMarginAdjust"];
    }
    if (option.type === "content-padding") {
      return contentPaddingAttributeKeys(option);
    }
    if (option.type === "limit-width") {
      return [...limitWidthAttributeKeys(option), "limitWidth"];
    }
    if (option.type === "spacer-responsive-height") {
      return [spacerResponsiveHeightAttributeKey(option), "height"];
    }
    return [option.attributeName];
  });
  var blockOptionSyncDeps = (blockConfig, attributes) => {
    const keys = blockOptionAttributeKeys(blockConfig);
    if (blockConfig.name === "core/button") {
      keys.push("text");
    }
    return keys.map((key) => attributes[key]);
  };
  wp.hooks.addFilter("blocks.registerBlockType", "baselayer/global-block-options/attributes", (settings) => {
    settings.attributes = {
      ...settings.attributes,
      [HIDE_BLOCK_ATTRIBUTE]: {
        type: "boolean",
        default: HIDE_BLOCK_OPTION.default
      }
    };
    return settings;
  });
  blockOptions.forEach((block) => {
    const blockSlug = getBlockSlug(block.name);
    wp.hooks.addFilter("blocks.registerBlockType", "custom-block-options/block-" + blockSlug, (settings, name) => {
      if (name === block.name) {
        block.options.forEach((option) => {
          if (option.type === "content-margin") {
            const { top, bottom, linked } = option.attributeNames;
            const defaultSize = option.defaultSize ?? "";
            settings.attributes = {
              ...settings.attributes,
              [top]: { type: "string", default: defaultSize },
              [bottom]: { type: "string", default: defaultSize },
              [linked]: { type: "boolean", default: true },
              contentMargin: { type: "string", default: "" },
              contentMarginAdjust: { type: "string", default: "" }
            };
            return;
          }
          if (option.type === "content-padding") {
            const attributeName = option.attributeName || "contentPadding";
            settings.attributes = {
              ...settings.attributes,
              [attributeName]: { type: "string", default: option.defaultSize ?? "m" }
            };
            return;
          }
          if (option.type === "limit-width") {
            const { size, align } = option.attributeNames;
            settings.attributes = {
              ...settings.attributes,
              [size]: { type: "string", default: "" },
              [align]: { type: "string", default: option.defaultAlign ?? "center" },
              limitWidth: { type: "string", default: "" }
            };
            return;
          }
          if (option.type === "spacer-responsive-height") {
            settings.attributes = {
              ...settings.attributes,
              [option.attributeName]: { type: "string", default: option.default ?? "" }
            };
            return;
          }
          settings.attributes = {
            ...settings.attributes,
            [option.attributeName]: {
              type: option.type === "boolean" ? "boolean" : "string",
              default: option.default
            }
          };
        });
      }
      return settings;
    });
  });
  var addControl = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
      const { attributes, setAttributes, isSelected } = props;
      const listedConfig = blockOptions.find((block) => block.name === props.name);
      const blockConfig = effectiveBlockConfig(props.name, listedConfig);
      const skipHeightResetRef = useRef2(false);
      const prevHeightRef = useRef2(attributes.height);
      const setOptionAttributes = (updates) => {
        const nextAttributes = { ...attributes, ...updates };
        const className = syncClassNameFromOptions(nextAttributes, blockConfig);
        setAttributes({
          ...updates,
          className
        });
      };
      useEffect(() => {
        if (!listedConfig) {
          return;
        }
        const marginOptions = contentMarginOptions(blockConfig);
        if (!marginOptions.length) {
          return;
        }
        let updates = {};
        marginOptions.forEach((option) => {
          const migrated = migrateLegacyContentMarginAttributes(
            { ...attributes, ...updates },
            option
          );
          if (migrated) {
            updates = { ...updates, ...migrated };
          }
        });
        if (Object.keys(updates).length) {
          setOptionAttributes(updates);
        }
      }, [
        listedConfig?.name,
        props.clientId,
        attributes.contentMargin,
        attributes.contentMarginAdjust,
        attributes.className
      ]);
      useEffect(() => {
        if (!listedConfig) {
          return;
        }
        const paddingOptions = contentPaddingOptions(blockConfig);
        if (!paddingOptions.length) {
          return;
        }
        let updates = {};
        paddingOptions.forEach((option) => {
          const migrated = migrateLegacyContentPaddingAttributes(
            { ...attributes, ...updates },
            option
          );
          if (migrated) {
            updates = { ...updates, ...migrated };
          }
        });
        if (Object.keys(updates).length) {
          setOptionAttributes(updates);
        }
      }, [listedConfig?.name, props.clientId, attributes.contentPadding, attributes.className]);
      useEffect(() => {
        if (!listedConfig) {
          return;
        }
        const widthOptions = limitWidthOptions(blockConfig);
        if (!widthOptions.length) {
          return;
        }
        let updates = {};
        widthOptions.forEach((option) => {
          const migrated = migrateLegacyLimitWidthAttributes(
            { ...attributes, ...updates },
            option
          );
          if (migrated) {
            updates = { ...updates, ...migrated };
          }
        });
        if (Object.keys(updates).length) {
          setOptionAttributes(updates);
        }
      }, [
        listedConfig?.name,
        props.clientId,
        attributes.limitWidth,
        attributes.className
      ]);
      useEffect(() => {
        if (!listedConfig || listedConfig.name !== "core/columns") {
          return;
        }
        const migrated = migrateLegacyImageTextLayoutAttributes(attributes);
        if (migrated) {
          setOptionAttributes(migrated);
        }
      }, [
        listedConfig?.name,
        props.clientId,
        attributes.imageTextLayout,
        attributes.className,
        attributes.harmonizeImageText
      ]);
      useEffect(() => {
        if (listedConfig?.name !== "core/button") {
          return;
        }
        const migrated = migrateLegacyButtonFontSizeAttributes(attributes);
        if (migrated) {
          setOptionAttributes(migrated);
        }
      }, [
        listedConfig?.name,
        props.clientId,
        attributes.fontSize,
        attributes.buttonSize,
        attributes.style
      ]);
      useEffect(() => {
        if (listedConfig?.name !== "core/button") {
          return;
        }
        const synced = syncButtonIconOnlyPlaceholderText(attributes);
        if (synced) {
          setAttributes(synced);
        }
      }, [listedConfig?.name, props.clientId, attributes.buttonIcon, attributes.text]);
      useEffect(() => {
        if (props.name !== "core/spacer" || !listedConfig) {
          return;
        }
        const responsive = attributes.spacerResponsiveHeight;
        const currentHeight = attributes.height;
        if (skipHeightResetRef.current) {
          skipHeightResetRef.current = false;
          prevHeightRef.current = currentHeight;
          return;
        }
        if (currentHeight === prevHeightRef.current) {
          return;
        }
        prevHeightRef.current = currentHeight;
        if (responsive && currentHeight) {
          setOptionAttributes({ spacerResponsiveHeight: "" });
        }
      }, [props.name, attributes.height, attributes.spacerResponsiveHeight]);
      useEffect(() => {
        const className = syncClassNameFromOptions(attributes, blockConfig);
        if (className !== (attributes.className || "")) {
          setAttributes({ className });
        }
      }, blockOptionSyncDeps(blockConfig, attributes));
      const buttonIconOnly = blockConfig.name === "core/button" && isButtonIconOnly(attributes);
      return /* @__PURE__ */ wp.element.createElement(Fragment, null, /* @__PURE__ */ wp.element.createElement(BlockEdit, { ...props }), isSelected && /* @__PURE__ */ wp.element.createElement(InspectorControls, null, /* @__PURE__ */ wp.element.createElement(PanelBody, { title: "Block Einstellungen" }, blockConfig.options.map((option, index) => {
        if (buttonIconOnly && option.type === "button-group" && option.attributeName === "buttonIconPosition") {
          return null;
        }
        if (option.type === "content-margin") {
          return /* @__PURE__ */ wp.element.createElement(BlockOptionWrapper, { key: getBlockOptionKey(option, index), option, index }, /* @__PURE__ */ wp.element.createElement(
            ContentMarginControl,
            {
              option,
              attributes,
              onChange: setOptionAttributes
            }
          ));
        }
        if (option.type === "content-padding") {
          return /* @__PURE__ */ wp.element.createElement(BlockOptionWrapper, { key: getBlockOptionKey(option, index), option, index }, /* @__PURE__ */ wp.element.createElement(
            ContentPaddingControl,
            {
              option,
              attributes,
              onChange: setOptionAttributes
            }
          ));
        }
        if (option.type === "limit-width") {
          return /* @__PURE__ */ wp.element.createElement(BlockOptionWrapper, { key: getBlockOptionKey(option, index), option, index }, /* @__PURE__ */ wp.element.createElement(
            LimitWidthControl,
            {
              option,
              attributes,
              onChange: setOptionAttributes
            }
          ));
        }
        if (option.type === "spacer-responsive-height") {
          return /* @__PURE__ */ wp.element.createElement(BlockOptionWrapper, { key: getBlockOptionKey(option, index), option, index }, /* @__PURE__ */ wp.element.createElement(
            SpacerResponsiveHeightControl,
            {
              option,
              attributes,
              onChange: (updates) => {
                if (updates.height === void 0 && updates[option.attributeName]) {
                  skipHeightResetRef.current = true;
                }
                setOptionAttributes(updates);
              }
            }
          ));
        }
        if (option.type === "boolean") {
          const { rowLabel, toggleLabel } = getBooleanOptionLabels(option);
          return /* @__PURE__ */ wp.element.createElement(BlockOptionWrapper, { key: getBlockOptionKey(option, index), option, index }, rowLabel ? /* @__PURE__ */ wp.element.createElement("span", { className: "bl-block-option__label" }, rowLabel) : null, /* @__PURE__ */ wp.element.createElement(
            ToggleControl,
            {
              label: toggleLabel,
              checked: attributes[option.attributeName],
              onChange: (newValue) => setOptionAttributes({ [option.attributeName]: newValue }),
              __nextHasNoMarginBottom: true,
              ...optionHelpProps(option)
            }
          ));
        } else if (option.type === "select") {
          return /* @__PURE__ */ wp.element.createElement(BlockOptionWrapper, { key: getBlockOptionKey(option, index), option, index }, /* @__PURE__ */ wp.element.createElement(
            SelectControl,
            {
              label: option.label,
              value: attributes[option.attributeName],
              options: option.options,
              onChange: (newValue) => setOptionAttributes({ [option.attributeName]: newValue }),
              ...optionHelpProps(option)
            }
          ));
        } else if (option.type === "icon") {
          const prefix = iconPrefix(option);
          return /* @__PURE__ */ wp.element.createElement(BlockOptionWrapper, { key: getBlockOptionKey(option, index), option, index }, /* @__PURE__ */ wp.element.createElement(
            IconPicker,
            {
              label: option.label,
              description: option.description,
              value: iconNameFromClass(attributes[option.attributeName], option),
              onChange: (name) => setOptionAttributes({
                [option.attributeName]: name ? prefix + name : ""
              })
            }
          ));
        } else if (option.type === "button-group") {
          if (ToggleGroupControl5) {
            return /* @__PURE__ */ wp.element.createElement(BlockOptionWrapper, { key: getBlockOptionKey(option, index), option, index }, /* @__PURE__ */ wp.element.createElement(
              ToggleGroupControl5,
              {
                className: "bl-block-option-button-group",
                label: option.label,
                value: attributes[option.attributeName] ?? option.default ?? "",
                isBlock: true,
                onChange: (newValue) => setOptionAttributes({ [option.attributeName]: newValue }),
                __nextHasNoMarginBottom: true,
                ...optionHelpProps(option)
              },
              option.options.map((opt) => /* @__PURE__ */ wp.element.createElement(
                BlockOptionToggleGroupOption,
                {
                  key: opt.value || "default",
                  value: opt.value,
                  label: opt.label,
                  icon: opt.icon,
                  iconLabel: option.iconLabel,
                  iconPosition: opt.iconPosition,
                  title: opt.title
                }
              ))
            ));
          }
          return /* @__PURE__ */ wp.element.createElement(BlockOptionWrapper, { key: getBlockOptionKey(option, index), option, index }, /* @__PURE__ */ wp.element.createElement(
            SelectControl,
            {
              label: option.label,
              value: attributes[option.attributeName],
              options: option.options,
              onChange: (newValue) => setOptionAttributes({ [option.attributeName]: newValue }),
              ...optionHelpProps(option)
            }
          ));
        }
        return null;
      }))));
    };
  }, "addControl");
  wp.hooks.addFilter("editor.BlockEdit", "custom-block-options/add-control", addControl);
  function getBlockSlug(blockName) {
    return blockName.replace("/", "-");
  }

  // themes/baselayer/src/js/editor/block-layout.js
  var DEFAULT_LAYOUT = { type: "default" };
  wp.domReady(() => {
    if (!wp.blocks?.registerBlockVariation) {
      return;
    }
    wp.blocks.registerBlockVariation("core/group", {
      name: "group",
      title: wp.i18n.__("Group"),
      description: wp.i18n.__("Gather blocks in a container."),
      attributes: { layout: DEFAULT_LAYOUT },
      isDefault: true,
      scope: ["block", "inserter", "transform"]
    });
    wp.blocks.registerBlockVariation("core/cover", {
      name: "cover",
      title: wp.i18n.__("Cover"),
      description: wp.i18n.__("Add an image or video with a text overlay."),
      attributes: { layout: DEFAULT_LAYOUT },
      isDefault: true,
      scope: ["block", "inserter", "transform"]
    });
  });

  // themes/baselayer/src/js/editor/block-inserter-settings.js
  var { Button: Button4 } = wp.components;
  var { useSelect, useDispatch } = wp.data;
  var { createElement: el, useEffect: useEffect2, render, createRoot } = wp.element;
  function getBlockInserterConfig() {
    return window.baselayerBlockSettings || {};
  }
  function getHiddenBlocks() {
    const hidden = getBlockInserterConfig().hidden;
    return Array.isArray(hidden) ? hidden : [];
  }
  function getFavoriteBlocks() {
    const favorites = getBlockInserterConfig().favorites;
    return Array.isArray(favorites) ? favorites : [];
  }
  function getPreferencesScope() {
    return getBlockInserterConfig().preferencesScope || "baselayer";
  }
  function getPreferencesKey() {
    return getBlockInserterConfig().preferencesKey || "showHiddenBlocks";
  }
  function getI18n() {
    return getBlockInserterConfig().i18n || {};
  }
  function initEditorPreferenceDefaults() {
    const preferences = wp.data?.dispatch?.("core/preferences");
    if (!preferences || typeof preferences.setDefaults !== "function") {
      return;
    }
    preferences.setDefaults("core", {
      mostUsedBlocks: true
    });
  }
  var hiddenBlockSnapshots = /* @__PURE__ */ new Map();
  var showHiddenInserterBlocks = false;
  var toggleRoot = null;
  var toggleHost = null;
  var toggleMountPoint = null;
  function cloneBlockType(blockType) {
    return {
      ...blockType,
      attributes: blockType.attributes ? { ...blockType.attributes } : blockType.attributes,
      supports: blockType.supports ? { ...blockType.supports } : blockType.supports,
      keywords: Array.isArray(blockType.keywords) ? [...blockType.keywords] : blockType.keywords
    };
  }
  function cacheHiddenBlockSnapshots(hiddenBlocks) {
    hiddenBlocks.forEach((name) => {
      if (hiddenBlockSnapshots.has(name)) {
        return;
      }
      const blockType = wp.blocks.getBlockType(name);
      if (blockType) {
        hiddenBlockSnapshots.set(name, cloneBlockType(blockType));
      }
    });
  }
  function applyHiddenInserterState(show) {
    showHiddenInserterBlocks = Boolean(show);
    getHiddenBlocks().forEach((name) => {
      let source = hiddenBlockSnapshots.get(name) || wp.blocks.getBlockType(name);
      if (!source) {
        return;
      }
      if (!hiddenBlockSnapshots.has(name)) {
        hiddenBlockSnapshots.set(name, cloneBlockType(source));
        source = hiddenBlockSnapshots.get(name);
      }
      wp.blocks.unregisterBlockType(name);
      wp.blocks.registerBlockType(name, {
        ...source,
        supports: {
          ...source.supports,
          inserter: showHiddenInserterBlocks
        }
      });
    });
  }
  function isInserterOpenedFromStore(select) {
    const editorStore = select("core/editor");
    if (editorStore && typeof editorStore.isInserterOpened === "function") {
      return editorStore.isInserterOpened();
    }
    const editPostStore = select("core/edit-post");
    if (editPostStore && typeof editPostStore.isInserterOpened === "function") {
      return editPostStore.isInserterOpened();
    }
    return false;
  }
  var TOGGLE_MOUNT_CLASS = "bl-inserter-has-toggle";
  function findInserterSearchRoot() {
    const inserterRoot = document.querySelector(
      ".editor-inserter-sidebar, .block-editor-inserter__menu"
    );
    if (!inserterRoot || !isBlocksInserterTabActive(inserterRoot)) {
      return null;
    }
    const selectors = [
      ".block-editor-inserter__search",
      ".editor-inserter-sidebar .block-editor-inserter__search"
    ];
    for (let i = 0; i < selectors.length; i += 1) {
      const node = inserterRoot.querySelector(selectors[i]);
      if (node) {
        return node;
      }
    }
    return null;
  }
  function isBlocksInserterTabActive(inserterRoot) {
    const selectedTab = inserterRoot.querySelector('[role="tab"][aria-selected="true"]');
    if (!selectedTab) {
      return true;
    }
    const tabId = selectedTab.getAttribute("id") || "";
    const tabLabel = (selectedTab.textContent || "").trim().toLowerCase();
    return tabId.includes("blocks") || tabLabel === "blocks" || tabLabel === "bl\xF6cke";
  }
  function findInserterSearchControl(searchRoot) {
    if (!searchRoot) {
      return null;
    }
    for (let i = 0; i < searchRoot.children.length; i += 1) {
      const child = searchRoot.children[i];
      if (child.classList.contains("bl-inserter-toggle-host")) {
        continue;
      }
      if (child.querySelector('input[type="search"], input[type="text"]')) {
        return child;
      }
    }
    return searchRoot.querySelector(".components-base-control.components-input-control") || searchRoot.querySelector(".components-search-control") || searchRoot.querySelector(".components-base-control");
  }
  function destroyToggleUi() {
    if (toggleRoot && typeof toggleRoot.unmount === "function") {
      toggleRoot.unmount();
    }
    toggleRoot = null;
    if (toggleHost) {
      render(null, toggleHost);
      toggleHost.remove();
      toggleHost = null;
    }
    if (toggleMountPoint) {
      toggleMountPoint.classList.remove(TOGGLE_MOUNT_CLASS);
      toggleMountPoint.classList.remove("bl-inserter-search-row");
      toggleMountPoint = null;
    }
  }
  function ensureToggleHost(searchRoot) {
    const searchControl = findInserterSearchControl(searchRoot);
    if (!searchControl) {
      return null;
    }
    searchRoot.classList.add(TOGGLE_MOUNT_CLASS);
    if (toggleHost && toggleMountPoint === searchRoot && toggleHost.parentElement === searchRoot) {
      if (searchControl.nextElementSibling !== toggleHost) {
        searchControl.insertAdjacentElement("afterend", toggleHost);
      }
      return toggleHost;
    }
    destroyToggleUi();
    toggleMountPoint = searchRoot;
    toggleHost = document.createElement("div");
    toggleHost.className = "bl-inserter-toggle-host";
    searchControl.insertAdjacentElement("afterend", toggleHost);
    return toggleHost;
  }
  function InserterToggleControl() {
    const preferencesScope = getPreferencesScope();
    const preferencesKey = getPreferencesKey();
    const i18n = getI18n();
    const label = i18n.showAllBlocks || "All blocks";
    const showHidden = useSelect(
      (select) => select("core/preferences").get(preferencesScope, preferencesKey) ?? false,
      [preferencesScope, preferencesKey]
    );
    const { set } = useDispatch("core/preferences");
    useEffect2(() => {
      applyHiddenInserterState(Boolean(showHidden));
    }, [showHidden]);
    return el(
      "div",
      { className: "bl-inserter-toggle" },
      el(
        Button4,
        {
          variant: showHidden ? "primary" : "secondary",
          size: "compact",
          onClick: () => {
            const next = !showHidden;
            set(preferencesScope, preferencesKey, next);
            applyHiddenInserterState(next);
          },
          className: "bl-inserter-toggle__button",
          "aria-pressed": showHidden
        },
        el("span", {
          className: "bl-icon -icon-" + (showHidden ? "checkbox-checked" : "checkbox"),
          "aria-hidden": "true"
        }),
        el("span", { className: "bl-inserter-toggle__label" }, label)
      )
    );
  }
  function renderToggleUi() {
    if (!toggleHost) {
      return;
    }
    const tree = el(InserterToggleControl);
    if (typeof createRoot === "function") {
      if (!toggleRoot) {
        toggleRoot = createRoot(toggleHost);
      }
      toggleRoot.render(tree);
      return;
    }
    render(tree, toggleHost);
  }
  function syncToggleUi() {
    const hiddenBlocks = getHiddenBlocks();
    if (!hiddenBlocks.length) {
      destroyToggleUi();
      return;
    }
    const isOpen = isInserterOpenedFromStore(wp.data.select);
    if (!isOpen) {
      destroyToggleUi();
      return;
    }
    const searchRoot = findInserterSearchRoot();
    if (!searchRoot) {
      destroyToggleUi();
      return;
    }
    const host = ensureToggleHost(searchRoot);
    if (!host) {
      destroyToggleUi();
      return;
    }
    renderToggleUi();
  }
  function applyFavoriteCategories() {
    const favoritesCategory = getBlockInserterConfig().favoritesCategory || "baselayer-favorites";
    getFavoriteBlocks().forEach((name) => {
      const blockType = wp.blocks.getBlockType(name);
      if (!blockType || blockType.category === favoritesCategory) {
        return;
      }
      wp.blocks.unregisterBlockType(name);
      wp.blocks.registerBlockType(name, {
        ...blockType,
        category: favoritesCategory
      });
    });
  }
  wp.hooks.addFilter("blocks.registerBlockType", "baselayer/block-favorites", (settings, name) => {
    if (!getFavoriteBlocks().includes(name)) {
      return settings;
    }
    return {
      ...settings,
      category: getBlockInserterConfig().favoritesCategory || "baselayer-favorites"
    };
  });
  wp.hooks.addFilter("blocks.registerBlockType", "baselayer/block-hidden-default", (settings, name) => {
    if (!getHiddenBlocks().includes(name) || showHiddenInserterBlocks) {
      return settings;
    }
    return {
      ...settings,
      supports: {
        ...settings.supports,
        inserter: false
      }
    };
  });
  function initBlockInserterSettings() {
    initEditorPreferenceDefaults();
    applyFavoriteCategories();
    const hiddenBlocks = getHiddenBlocks();
    if (hiddenBlocks.length) {
      cacheHiddenBlockSnapshots(hiddenBlocks);
      if (hiddenBlockSnapshots.size < hiddenBlocks.length) {
        window.setTimeout(() => {
          cacheHiddenBlockSnapshots(hiddenBlocks);
          const preferencesScope2 = getPreferencesScope();
          const preferencesKey2 = getPreferencesKey();
          const show = wp.data.select("core/preferences").get(preferencesScope2, preferencesKey2);
          applyHiddenInserterState(Boolean(show));
        }, 500);
      }
      const preferencesScope = getPreferencesScope();
      const preferencesKey = getPreferencesKey();
      const initialShow = wp.data.select("core/preferences").get(preferencesScope, preferencesKey);
      applyHiddenInserterState(Boolean(initialShow));
      let frame = 0;
      const scheduleSync = () => {
        if (frame) {
          cancelAnimationFrame(frame);
        }
        frame = requestAnimationFrame(() => {
          frame = 0;
          syncToggleUi();
        });
      };
      wp.data.subscribe(scheduleSync);
      const observer = new MutationObserver(scheduleSync);
      observer.observe(document.body, { childList: true, subtree: true });
      scheduleSync();
    }
  }
  if (typeof wp.domReady === "function") {
    wp.domReady(initBlockInserterSettings);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlockInserterSettings);
  } else {
    initBlockInserterSettings();
  }

  // themes/baselayer/src/js/editor/embed-variations.js
  function getBlockInserterConfig2() {
    return window.baselayerBlockSettings || {};
  }
  function isVariationAllowed(blockName, slug, settings, defaultAllowed) {
    const blockSettings = settings[blockName] || {};
    if (Object.prototype.hasOwnProperty.call(blockSettings, slug)) {
      return Boolean(blockSettings[slug]);
    }
    return Boolean(defaultAllowed);
  }
  function applyBlockVariationSettings() {
    const config = getBlockInserterConfig2();
    if (!wp.blocks || typeof wp.blocks.getBlockVariations !== "function") {
      return;
    }
    const blocks = Array.isArray(config.blockVariationBlocks) ? config.blockVariationBlocks : [];
    const settings = config.blockVariationSettings || {};
    const defaultAllowed = config.blockVariationDefaultAllowed || {};
    const blockAllowed = config.blockVariationBlockAllowed || {};
    const hardDisallowed = config.blockVariationHardDisallowed || {};
    blocks.forEach((blockName) => {
      if (!blockAllowed[blockName]) {
        return;
      }
      const blockHardDisallowed = Array.isArray(hardDisallowed[blockName]) ? hardDisallowed[blockName] : [];
      blockHardDisallowed.forEach((slug) => {
        if (slug) {
          wp.blocks.unregisterBlockVariation(blockName, slug);
        }
      });
      const blockDefaultAllowed = defaultAllowed[blockName] !== void 0 ? defaultAllowed[blockName] : true;
      wp.blocks.getBlockVariations(blockName).forEach((variation) => {
        const slug = variation.name;
        if (!slug || blockHardDisallowed.includes(slug)) {
          return;
        }
        if (!isVariationAllowed(blockName, slug, settings, blockDefaultAllowed)) {
          wp.blocks.unregisterBlockVariation(blockName, slug);
        }
      });
    });
  }
  function initBlockVariations() {
    applyBlockVariationSettings();
    const config = getBlockInserterConfig2();
    const blocks = Array.isArray(config.blockVariationBlocks) ? config.blockVariationBlocks : [];
    const needsRetry = blocks.some((blockName) => {
      const variations = wp.blocks.getBlockVariations(blockName);
      return !variations || variations.length === 0;
    });
    if (needsRetry) {
      window.setTimeout(applyBlockVariationSettings, 500);
    }
  }
  if (typeof wp.domReady === "function") {
    wp.domReady(initBlockVariations);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlockVariations);
  } else {
    initBlockVariations();
  }

  // themes/baselayer/src/js/editor/acf-inner-blocks-toolbar.js
  var { BlockControls } = wp.blockEditor;
  var { ToolbarButton } = wp.components;
  var { createHigherOrderComponent: createHigherOrderComponent2 } = wp.compose;
  var { Fragment: Fragment2 } = wp.element;
  var toolbarConfigs = window.baselayerAcfInnerBlocksToolbar || {};
  var getToolbarContext = (blockName, clientId) => {
    if (toolbarConfigs[blockName]) {
      return {
        config: toolbarConfigs[blockName],
        parentClientId: clientId,
        insertAfterClientId: null
      };
    }
    const select = wp.data.select("core/block-editor");
    const parentClientId = select.getBlockRootClientId(clientId);
    if (!parentClientId) {
      return null;
    }
    const parentBlock = select.getBlock(parentClientId);
    if (!parentBlock || !toolbarConfigs[parentBlock.name]) {
      return null;
    }
    return {
      config: toolbarConfigs[parentBlock.name],
      parentClientId,
      insertAfterClientId: clientId
    };
  };
  var insertInnerBlock = ({ config, parentClientId, insertAfterClientId }) => {
    const select = wp.data.select("core/block-editor");
    const dispatch = wp.data.dispatch("core/block-editor");
    const newBlock = wp.blocks.createBlock(config.insertBlock);
    let insertIndex;
    if (insertAfterClientId) {
      insertIndex = select.getBlockIndex(insertAfterClientId) + 1;
    } else {
      insertIndex = select.getBlocks(parentClientId).length;
    }
    dispatch.insertBlocks([newBlock], insertIndex, parentClientId, true);
  };
  var withAcfInnerBlocksToolbar = createHigherOrderComponent2((BlockEdit) => {
    return (props) => {
      const { name, clientId, isSelected } = props;
      const context = getToolbarContext(name, clientId);
      if (!context) {
        return /* @__PURE__ */ wp.element.createElement(BlockEdit, { ...props });
      }
      const { config } = context;
      return /* @__PURE__ */ wp.element.createElement(Fragment2, null, isSelected && /* @__PURE__ */ wp.element.createElement(BlockControls, { group: "other" }, /* @__PURE__ */ wp.element.createElement(
        ToolbarButton,
        {
          icon: "plus-alt2",
          label: config.label,
          onClick: () => insertInnerBlock(context)
        }
      )), /* @__PURE__ */ wp.element.createElement(BlockEdit, { ...props }));
    };
  }, "withAcfInnerBlocksToolbar");
  if (Object.keys(toolbarConfigs).length) {
    wp.hooks.addFilter(
      "editor.BlockEdit",
      "baselayer/acf-inner-blocks-toolbar",
      withAcfInnerBlocksToolbar
    );
  }

  // themes/baselayer/src/js/editor/icons/inline-icon-control.js
  var { useRef: useRef3 } = wp.element;
  var iconL10n4 = typeof window !== "undefined" && window.baselayerIcons || {};
  var uiStrings3 = iconL10n4.ui || {};
  var t3 = (key, fallback) => uiStrings3[key] || fallback;
  function InlineIconControl({ value, onChange, isActive = false }) {
    const placeholderRef = useRef3(null);
    const editRef = useRef3(null);
    const openPicker = (returnFocus) => {
      openIconPicker({
        currentValue: value,
        onSelect: onChange,
        returnFocus
      });
    };
    if (!value) {
      return /* @__PURE__ */ wp.element.createElement("div", { className: "bl-inline-icon-control" + (isActive ? " is-active" : "") }, /* @__PURE__ */ wp.element.createElement(
        "button",
        {
          ref: placeholderRef,
          type: "button",
          className: "bl-inline-icon-control__placeholder",
          onClick: () => openPicker(placeholderRef.current),
          "aria-label": t3("choose", "Choose icon")
        },
        /* @__PURE__ */ wp.element.createElement("span", { className: "bl-inline-icon-control__placeholder-label" }, t3("choose", "Choose icon"))
      ));
    }
    return /* @__PURE__ */ wp.element.createElement("div", { className: "bl-inline-icon-control" + (isActive ? " is-active" : "") }, /* @__PURE__ */ wp.element.createElement("div", { className: "bl-inline-icon-control__selected" }, /* @__PURE__ */ wp.element.createElement("span", { className: "bl-icon -icon-" + value, "aria-hidden": "true" }), /* @__PURE__ */ wp.element.createElement("div", { className: "bl-inline-icon-control__actions" }, /* @__PURE__ */ wp.element.createElement(
      "button",
      {
        ref: editRef,
        type: "button",
        className: "bl-inline-icon-control__action",
        "aria-label": t3("change", "Change icon"),
        onClick: () => openPicker(editRef.current)
      },
      /* @__PURE__ */ wp.element.createElement("span", { className: "bl-icon -icon-edit", "aria-hidden": "true" })
    ), /* @__PURE__ */ wp.element.createElement(
      "button",
      {
        type: "button",
        className: "bl-inline-icon-control__action is-destructive",
        "aria-label": t3("remove", "Remove"),
        onClick: () => onChange("")
      },
      /* @__PURE__ */ wp.element.createElement("span", { className: "bl-icon -icon-close", "aria-hidden": "true" })
    ))));
  }

  // themes/baselayer/src/js/editor/icon-blocks/icon-blocks.js
  var { useBlockProps, InnerBlocks } = wp.blockEditor;
  var { __ } = wp.i18n;
  var ICON_SLUG_ATTRIBUTE = "iconSlug";
  var ICON_TEXT_INNER_TEMPLATE = [
    [
      "core/paragraph",
      {
        content: __("Begleitender Text neben dem Icon.", "baselayer")
      }
    ]
  ];
  var ICON_BLOCKS = {
    "acf/icon": IconBlockEdit,
    "acf/icon-text": IconTextBlockEdit
  };
  function IconBlockEdit({ attributes, setAttributes, isSelected }) {
    const iconSlug = attributes[ICON_SLUG_ATTRIBUTE] || "";
    const hasIcon = Boolean(iconSlug);
    const blockProps = useBlockProps({
      className: ["icon__wrapper", "bl-wp-block", attributes.className].filter(Boolean).join(" ")
    });
    return /* @__PURE__ */ wp.element.createElement("div", { ...blockProps }, /* @__PURE__ */ wp.element.createElement("div", { className: "icon__container" }, /* @__PURE__ */ wp.element.createElement("div", { className: "icon__content" }, /* @__PURE__ */ wp.element.createElement("div", { className: "icon__icon" + (hasIcon ? " -has-icon" : "") }, /* @__PURE__ */ wp.element.createElement(
      InlineIconControl,
      {
        value: iconSlug,
        isActive: isSelected,
        onChange: (next) => setAttributes({ [ICON_SLUG_ATTRIBUTE]: next })
      }
    )))));
  }
  function IconTextBlockEdit({ attributes, setAttributes, isSelected }) {
    const iconSlug = attributes[ICON_SLUG_ATTRIBUTE] || "";
    const blockProps = useBlockProps({
      className: ["icon-text__wrapper", "bl-wp-block", attributes.className].filter(Boolean).join(" ")
    });
    const hasIcon = Boolean(iconSlug);
    return /* @__PURE__ */ wp.element.createElement("div", { ...blockProps }, /* @__PURE__ */ wp.element.createElement("div", { className: "icon-text__container" }, /* @__PURE__ */ wp.element.createElement("div", { className: "icon-text__content" }, /* @__PURE__ */ wp.element.createElement("div", { className: "icon-text__icon icon__icon" + (hasIcon ? " -has-icon" : "") }, /* @__PURE__ */ wp.element.createElement(
      InlineIconControl,
      {
        value: iconSlug,
        isActive: isSelected,
        onChange: (next) => setAttributes({ [ICON_SLUG_ATTRIBUTE]: next })
      }
    )), /* @__PURE__ */ wp.element.createElement("div", { className: "icon-text__text-container" }, /* @__PURE__ */ wp.element.createElement("div", { className: "icon-text__text" }, /* @__PURE__ */ wp.element.createElement(
      InnerBlocks,
      {
        template: ICON_TEXT_INNER_TEMPLATE,
        templateLock: false,
        renderAppender: isSelected ? InnerBlocks.ButtonBlockAppender : InnerBlocks.DefaultBlockAppender
      }
    ))))));
  }
  wp.hooks.addFilter("blocks.registerBlockType", "baselayer/icon-blocks", (settings, name) => {
    if (!ICON_BLOCKS[name]) {
      return settings;
    }
    return {
      ...settings,
      attributes: {
        ...settings.attributes,
        [ICON_SLUG_ATTRIBUTE]: {
          type: "string",
          default: ""
        }
      },
      edit: ICON_BLOCKS[name]
    };
  });

  // themes/baselayer/src/js/editor/expirator.js
  (function() {
    "use strict";
    const wp2 = typeof window !== "undefined" ? window.wp : null;
    if (!wp2 || typeof baselayerFeatures === "undefined" || !baselayerFeatures.post_expirator) {
      return;
    }
    const el2 = wp2.element.createElement;
    const { useState, useMemo } = wp2.element;
    const { registerPlugin } = wp2.plugins;
    const editor = wp2.editor || {};
    const blockEditor = wp2.blockEditor || {};
    const InspectorPopoverHeader = blockEditor.__experimentalInspectorPopoverHeader;
    const PluginPostStatusInfo = editor.PluginPostStatusInfo;
    const { useSelect: useSelect2 } = wp2.data;
    const { useEntityProp } = wp2.coreData;
    const { PanelRow, DateTimePicker, RadioControl, TextControl, Dropdown, Button: Button5 } = wp2.components;
    const wpDate = wp2.date;
    const META_KEY_DATE = "_bl_expiration_date";
    const META_KEY_ENABLED = "_bl_expiration_enabled";
    const META_KEY_ACTION = "_bl_expiration_action";
    const META_KEY_REDIRECT = "_bl_expiration_redirect_url";
    const labels = typeof baselayerExpirator !== "undefined" ? baselayerExpirator : {};
    const timezone = labels.timezone || "";
    const is12Hour = labels.is12Hour !== false && labels.is12Hour !== "0" && labels.is12Hour !== 0;
    const amLabel = labels.amLabel || "am";
    const pmLabel = labels.pmLabel || "pm";
    function storedToParts(stored) {
      if (!stored || typeof stored !== "string") return { date: "", time: "" };
      const trimmed = stored.trim();
      if (trimmed.length < 16) return { date: "", time: "" };
      const datePart = trimmed.substring(0, 10);
      const timePart = trimmed.substring(11, 16);
      return {
        date: /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : "",
        time: /^\d{2}:\d{2}$/.test(timePart) ? timePart : ""
      };
    }
    function time24ToDisplay(time24, am, pm) {
      if (!time24 || !/^\d{2}:\d{2}$/.test(time24)) return "";
      const h = parseInt(time24.substring(0, 2), 10);
      const i = time24.substring(3, 5);
      const hour12 = h % 12 || 12;
      const suffix = h < 12 ? am || "am" : pm || "pm";
      return hour12 + ":" + i + " " + suffix;
    }
    function getTimezoneAbbreviationForDisplay() {
      if (!wpDate || typeof wpDate.getSettings !== "function") {
        return "";
      }
      try {
        var settings = wpDate.getSettings();
        var tz = settings && settings.timezone;
        if (!tz) {
          return "";
        }
        if (tz.abbr && isNaN(Number(tz.abbr))) {
          return String(tz.abbr);
        }
        var symbol = tz.offset < 0 ? "" : "+";
        return "UTC" + symbol + (tz.offsetFormatted || "");
      } catch (e) {
        return "";
      }
    }
    function formatStoredForDisplay(stored) {
      const dateObj = parseStoredDate(stored);
      if (!dateObj) return "";
      const df = labels.dateFormat || "F j, Y";
      const tf = labels.timeFormat || "g:i a";
      const format = df + ", " + tf;
      if (wpDate) {
        try {
          if (typeof wpDate.dateI18n === "function") {
            return wpDate.dateI18n(format, dateObj, timezone || void 0);
          }
          if (typeof wpDate.date === "function") {
            return wpDate.date(format, dateObj, timezone || void 0);
          }
        } catch (e) {
        }
      }
      const { date: datePart, time: timePart } = storedToParts(stored);
      if (!datePart) return "";
      const months = labels.monthNames && Array.isArray(labels.monthNames) ? labels.monthNames : [];
      const [y, m, d] = datePart.split("-").map(Number);
      const monthStr = m >= 1 && m <= 12 && months[m - 1] ? months[m - 1] : String(m);
      const dateStr = monthStr + " " + d + ", " + y;
      const timeStr = timePart ? is12Hour ? time24ToDisplay(timePart, amLabel, pmLabel) : timePart : "";
      return timeStr ? dateStr + ", " + timeStr : dateStr;
    }
    function formatExpirationPreviewLabel(stored) {
      const formattedDate = formatStoredForDisplay(stored);
      if (!formattedDate) {
        return "";
      }
      const abbr = getTimezoneAbbreviationForDisplay();
      if (!abbr) {
        return formattedDate;
      }
      const rtl = wp2.i18n && typeof wp2.i18n.isRTL === "function" && wp2.i18n.isRTL();
      return rtl ? abbr + " " + formattedDate : formattedDate + " " + abbr;
    }
    function parseStoredDate(value) {
      if (!value || typeof value !== "string") return null;
      const trimmed = value.trim();
      if (trimmed.length < 16) return null;
      if (wpDate?.getDate) {
        try {
          return wpDate.getDate(value, timezone || void 0);
        } catch (e) {
        }
      }
      const withT = trimmed.replace(" ", "T").substring(0, 16) + ":00";
      return new Date(withT);
    }
    function formatForStorage(date) {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
      if (wpDate?.date) {
        try {
          return wpDate.date("Y-m-d H:i", date, timezone || void 0);
        } catch (e) {
        }
      }
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const h = String(date.getHours()).padStart(2, "0");
      const i = String(date.getMinutes()).padStart(2, "0");
      return y + "-" + m + "-" + d + " " + h + ":" + i;
    }
    function ExpiratorPanelContent() {
      const postType = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostType?.() || "";
      }, []);
      const postId = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostId?.();
      }, []);
      const allowed = labels.postTypes && Array.isArray(labels.postTypes) ? labels.postTypes : ["post", "page"];
      if (!postType || allowed.indexOf(postType) === -1 || !postId) {
        return null;
      }
      const [meta, setMeta] = useEntityProp("postType", postType, "meta", postId);
      if (!meta || typeof setMeta !== "function") {
        return null;
      }
      const rawValue = meta[META_KEY_DATE] || "";
      const actionValue = meta[META_KEY_ACTION] || "draft";
      const redirectValue = meta[META_KEY_REDIRECT] || "";
      const [rowAnchorEl, setRowAnchorEl] = useState(null);
      const [actionRowAnchorEl, setActionRowAnchorEl] = useState(null);
      const popoverProps = useMemo(
        function() {
          return {
            anchor: rowAnchorEl,
            placement: "left-start",
            offset: 36,
            shift: true
          };
        },
        [rowAnchorEl]
      );
      const popoverPropsAction = useMemo(
        function() {
          return {
            anchor: actionRowAnchorEl,
            placement: "left-start",
            offset: 36,
            shift: true
          };
        },
        [actionRowAnchorEl]
      );
      function handleChange(newDate) {
        if (newDate === null || newDate === void 0) {
          setMeta({ ...meta, [META_KEY_ENABLED]: "", [META_KEY_DATE]: "" });
          return;
        }
        const dateObj = newDate instanceof Date ? newDate : new Date(newDate);
        const normalized = formatForStorage(dateObj);
        setMeta({
          ...meta,
          [META_KEY_ENABLED]: "1",
          [META_KEY_DATE]: normalized
        });
      }
      function handleClear() {
        setMeta({ ...meta, [META_KEY_ENABLED]: "", [META_KEY_DATE]: "" });
      }
      function handleActionChange(value) {
        setMeta({ ...meta, [META_KEY_ACTION]: value || "draft" });
      }
      function handleRedirectChange(value) {
        setMeta({
          ...meta,
          [META_KEY_REDIRECT]: value || ""
        });
      }
      const clearLabel = labels.clearLabel || "Reset";
      const closeLabel = labels.closeLabel || (wp2.i18n && wp2.i18n.__ ? wp2.i18n.__("Close", "baselayer") : "Close");
      const panelTitle = labels.panelTitle || "Expiration";
      const noneLabel = labels.noneLabel || "None";
      const actionLabel = labels.actionLabel || "After expiration";
      const actionDraft = labels.actionDraft || "Set to draft";
      const actionDraftShort = labels.actionDraftShort || "Draft";
      const actionPrivate = labels.actionPrivate || "Set to private";
      const actionPrivateShort = labels.actionPrivateShort || "Private";
      const actionRedirect = labels.actionRedirect || "Redirect to";
      const actionRedirectShort = labels.actionRedirectShort || "Redirection";
      const redirectLabel = labels.redirectLabel || "Redirect URL";
      const redirectPlaceholder = labels.redirectPlaceholder || "/new-path";
      const previewContent = rawValue ? formatExpirationPreviewLabel(rawValue) : noneLabel;
      const actionDraftDesc = labels.actionDraftDesc || "Move this post to drafts so it is not publicly visible.";
      const actionPrivateDesc = labels.actionPrivateDesc || "Only site administrators and editors can view the post.";
      const actionRedirectDesc = labels.actionRedirectDesc || "Send visitors to another URL when they open this post.";
      const actionRadioOptions = [
        {
          value: "draft",
          label: actionDraft,
          description: actionDraftDesc
        },
        {
          value: "private",
          label: actionPrivate,
          description: actionPrivateDesc
        },
        {
          value: "redirect",
          label: actionRedirect,
          description: actionRedirectDesc
        }
      ];
      function getActionTogglePreview() {
        if (actionValue === "draft") {
          return actionDraftShort;
        }
        if (actionValue === "private") {
          return actionPrivateShort;
        }
        if (actionValue === "redirect") {
          return actionRedirectShort;
        }
        return actionDraft;
      }
      function renderActionPopoverHeaderFallback(onClose) {
        return el2(
          "div",
          {
            className: "block-editor-inspector-popover-header baselayer-expirator__inspector-fallback"
          },
          el2(
            "div",
            {
              className: "components-flex components-h-stack",
              style: {
                alignItems: "center",
                width: "100%",
                gap: "8px"
              }
            },
            el2(
              "h2",
              {
                className: "block-editor-inspector-popover-header__heading components-heading",
                style: { fontSize: "13px", margin: 0, flex: "0 1 auto" }
              },
              actionLabel
            ),
            el2("div", {
              className: "components-flex-item",
              style: { flex: "1 1 auto", minWidth: "8px" }
            }),
            el2(
              "button",
              {
                type: "button",
                className: "components-button block-editor-inspector-popover-header__action is-small has-icon",
                "aria-label": closeLabel,
                onClick: onClose
              },
              el2(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 24 24",
                  width: "24",
                  height: "24",
                  "aria-hidden": "true",
                  focusable: "false"
                },
                el2("path", {
                  d: "M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z"
                })
              )
            )
          )
        );
      }
      function renderActionDropdownBody(onClose) {
        var headerEl = InspectorPopoverHeader ? el2(InspectorPopoverHeader, {
          title: actionLabel,
          onClose
        }) : renderActionPopoverHeaderFallback(onClose);
        return el2(
          "div",
          { className: "baselayer-expirator__popover-inner" },
          headerEl,
          el2(
            "div",
            {
              className: "baselayer-expirator__popover-body baselayer-expirator__popover-body--after-expiration baselayer-editor-panel baselayer-expirator-panel baselayer-expirator__dialog"
            },
            el2(
              PanelRow,
              null,
              el2(RadioControl, {
                className: "baselayer-expirator-field-action",
                label: actionLabel,
                hideLabelFromVision: true,
                selected: actionValue,
                options: actionRadioOptions,
                onChange: handleActionChange
              })
            ),
            actionValue === "redirect" ? el2(
              PanelRow,
              null,
              el2(TextControl, {
                className: "baselayer-expirator-field-redirect",
                label: redirectLabel,
                value: redirectValue,
                onChange: handleRedirectChange,
                placeholder: redirectPlaceholder,
                type: "url",
                __nextHasNoMarginBottom: true,
                __next40pxDefaultSize: true
              })
            ) : null
          )
        );
      }
      function renderInspectorPopoverHeaderFallback(onClose) {
        return el2(
          "div",
          {
            className: "block-editor-inspector-popover-header baselayer-expirator__inspector-fallback"
          },
          el2(
            "div",
            {
              className: "components-flex components-h-stack",
              style: {
                alignItems: "center",
                width: "100%",
                gap: "8px"
              }
            },
            el2(
              "h2",
              {
                className: "block-editor-inspector-popover-header__heading components-heading",
                style: { fontSize: "13px", margin: 0, flex: "0 1 auto" }
              },
              panelTitle
            ),
            el2("div", {
              className: "components-flex-item",
              style: { flex: "1 1 auto", minWidth: "8px" }
            }),
            el2(
              "button",
              {
                type: "button",
                className: "components-button block-editor-inspector-popover-header__action is-small is-tertiary",
                onClick: function() {
                  handleClear();
                  if (typeof onClose === "function") {
                    onClose();
                  }
                }
              },
              clearLabel
            ),
            el2(
              "button",
              {
                type: "button",
                className: "components-button block-editor-inspector-popover-header__action is-small has-icon",
                "aria-label": closeLabel,
                onClick: onClose
              },
              el2(
                "svg",
                {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 24 24",
                  width: "24",
                  height: "24",
                  "aria-hidden": "true",
                  focusable: "false"
                },
                el2("path", {
                  d: "M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z"
                })
              )
            )
          )
        );
      }
      function renderDropdownBody(onClose) {
        var headerEl = InspectorPopoverHeader ? el2(InspectorPopoverHeader, {
          title: panelTitle,
          onClose,
          actions: [
            {
              label: clearLabel,
              onClick: function() {
                handleClear();
                if (typeof onClose === "function") {
                  onClose();
                }
              }
            }
          ]
        }) : renderInspectorPopoverHeaderFallback(onClose);
        return el2(
          "div",
          { className: "baselayer-expirator__popover-inner" },
          headerEl,
          el2(
            "div",
            {
              className: "baselayer-expirator__popover-body baselayer-expirator__popover-body--expiration-date baselayer-editor-panel baselayer-expirator-panel baselayer-expirator__dialog"
            },
            el2(
              PanelRow,
              null,
              el2(DateTimePicker, {
                currentDate: parseStoredDate(rawValue) || null,
                onChange: handleChange,
                is12Hour,
                startOfWeek: (function() {
                  var n = parseInt(labels.startOfWeek, 10);
                  return n >= 0 && n <= 6 ? n : 0;
                })()
              })
            )
          )
        );
      }
      const panelRowClass = "components-flex components-h-stack editor-post-panel__row";
      const scheduleLikeRow = el2(
        "div",
        {
          className: panelRowClass + " baselayer-expirator-post-status",
          style: {
            display: "flex"
          },
          ref: function(node) {
            setRowAnchorEl(node);
          }
        },
        el2("div", { className: "editor-post-panel__row-label" }, panelTitle),
        el2(
          "div",
          {
            className: "editor-post-panel__row-control",
            style: {
              display: "flex",
              alignItems: "center",
              gap: "4px",
              justifyContent: "flex-end",
              flex: "1",
              minWidth: 0
            }
          },
          el2(Dropdown, {
            popoverProps,
            focusOnMount: true,
            className: "components-dropdown baselayer-expirator__panel-dropdown editor-post-schedule__panel-dropdown",
            contentClassName: "baselayer-expirator__popover-content baselayer-expirator__popover-content--expiration-date editor-post-schedule__dialog",
            renderToggle: function(toggleProps) {
              var onToggle = toggleProps.onToggle;
              var isOpen = toggleProps.isOpen;
              return el2(
                Button5,
                {
                  variant: "tertiary",
                  size: "compact",
                  className: "baselayer-expirator__toggle editor-post-schedule__dialog-toggle",
                  onClick: onToggle,
                  "aria-expanded": isOpen,
                  "aria-label": panelTitle
                },
                previewContent
              );
            },
            renderContent: function(contentProps) {
              return renderDropdownBody(contentProps.onClose);
            }
          })
        )
      );
      const hasExpirationDate = typeof rawValue === "string" && rawValue.trim() !== "";
      const afterExpirationRow = hasExpirationDate ? el2(
        "div",
        {
          className: panelRowClass + " baselayer-expirator-action-row",
          ref: function(node) {
            setActionRowAnchorEl(node);
          }
        },
        el2("div", { className: "editor-post-panel__row-label" }, actionLabel),
        el2(
          "div",
          {
            className: "editor-post-panel__row-control",
            style: {
              display: "flex",
              alignItems: "center",
              gap: "4px",
              justifyContent: "flex-end",
              flex: "1",
              minWidth: 0
            }
          },
          el2(Dropdown, {
            popoverProps: popoverPropsAction,
            focusOnMount: true,
            className: "components-dropdown baselayer-expirator__panel-dropdown baselayer-expirator__action-panel-dropdown editor-post-url__panel-dropdown",
            contentClassName: "baselayer-expirator__popover-content baselayer-expirator__popover-content--after-expiration editor-post-url__dialog",
            renderToggle: function(toggleProps) {
              var onToggle = toggleProps.onToggle;
              var isOpen = toggleProps.isOpen;
              return el2(
                Button5,
                {
                  variant: "tertiary",
                  size: "compact",
                  className: "baselayer-expirator__action-toggle editor-post-url__panel-toggle",
                  onClick: onToggle,
                  "aria-expanded": isOpen,
                  "aria-label": actionLabel
                },
                getActionTogglePreview()
              );
            },
            renderContent: function(contentProps) {
              return renderActionDropdownBody(contentProps.onClose);
            }
          })
        )
      ) : null;
      return el2("div", { className: "baselayer-expirator-root" }, scheduleLikeRow, afterExpirationRow);
    }
    function ExpiratorPanel() {
      const postType = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostType?.() || "";
      }, []);
      const allowed = labels.postTypes && Array.isArray(labels.postTypes) ? labels.postTypes : ["post", "page"];
      if (!postType || allowed.indexOf(postType) === -1) {
        return null;
      }
      if (!PluginPostStatusInfo) {
        return null;
      }
      return el2(
        PluginPostStatusInfo,
        {
          className: "baselayer-expirator-document-panel"
        },
        el2(ExpiratorPanelContent, null)
      );
    }
    registerPlugin("baselayer-expirator", {
      render: ExpiratorPanel
    });
  })();

  // themes/baselayer/src/js/editor/events.js
  (function() {
    "use strict";
    const wp2 = typeof window !== "undefined" ? window.wp : null;
    if (!wp2 || typeof baselayerEvents === "undefined") {
      return;
    }
    const EVENT_TYPES = baselayerEvents.postTypes && Array.isArray(baselayerEvents.postTypes) ? baselayerEvents.postTypes : baselayerEvents.postType ? [baselayerEvents.postType] : [];
    if (!EVENT_TYPES.length) {
      return;
    }
    const el2 = wp2.element.createElement;
    const { useState, useEffect: useEffect3 } = wp2.element;
    const { useSelect: useSelect2 } = wp2.data;
    const { useEntityProp } = wp2.coreData;
    const { registerPlugin } = wp2.plugins;
    const { PluginDocumentSettingPanel } = wp2.editor;
    const { PanelRow, ToggleControl: ToggleControl2 } = wp2.components;
    const L = baselayerEvents;
    const META_START_DATE = "_bl_event_start_date";
    const META_END_DATE = "_bl_event_end_date";
    const META_START_TIME = "_bl_event_start_time";
    const META_END_TIME = "_bl_event_end_time";
    function EventPanelContent() {
      const postType = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostType?.() || "";
      }, []);
      const postId = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostId?.();
      }, []);
      if (!postType || EVENT_TYPES.indexOf(postType) === -1 || !postId) {
        return null;
      }
      const [meta, setMeta] = useEntityProp("postType", postType, "meta", postId);
      if (!meta || typeof setMeta !== "function") {
        return null;
      }
      const startDate = meta[META_START_DATE] || "";
      const endDate = meta[META_END_DATE] || "";
      const startTime = meta[META_START_TIME] || "";
      const endTime = meta[META_END_TIME] || "";
      const [timesEnabled, setTimesEnabled] = useState(function() {
        return !!(startTime || endTime);
      });
      useEffect3(
        function() {
          setTimesEnabled(!!(startTime || endTime));
        },
        [postId]
      );
      function patch(next) {
        setMeta(Object.assign({}, meta, next));
      }
      function onToggleTimes(on) {
        setTimesEnabled(on);
        if (!on) {
          patch({
            [META_START_TIME]: "",
            [META_END_TIME]: ""
          });
        }
      }
      return el2(
        PluginDocumentSettingPanel,
        {
          name: "baselayer-event",
          title: L.panelTitle || "Event",
          className: "baselayer-event-panel"
        },
        el2(
          "div",
          { className: "baselayer-editor-panel" },
          el2(
            PanelRow,
            null,
            el2(
              "label",
              { className: "components-base-control__label", htmlFor: "bl-event-start-date" },
              L.startDateLabel || "Start date"
            ),
            el2("input", {
              id: "bl-event-start-date",
              type: "date",
              className: "components-text-control__input bl-event-date-input bl-event-date-input--start",
              value: startDate,
              onChange: function(e) {
                var v = e.target.value;
                patch({
                  [META_START_DATE]: v,
                  [META_END_DATE]: endDate && endDate >= v ? endDate : v
                });
              }
            })
          ),
          el2(
            PanelRow,
            null,
            el2(
              "label",
              { className: "components-base-control__label", htmlFor: "bl-event-end-date" },
              L.endDateLabel || "End date"
            ),
            el2("input", {
              id: "bl-event-end-date",
              type: "date",
              className: "components-text-control__input bl-event-date-input bl-event-date-input--end",
              value: endDate || startDate,
              min: startDate || void 0,
              onChange: function(e) {
                patch({ [META_END_DATE]: e.target.value });
              }
            })
          ),
          el2(
            PanelRow,
            { className: "bl-event-include-times" },
            el2(ToggleControl2, {
              key: "toggle",
              className: "bl-event-include-times__control",
              label: L.includeTimesLabel || "Include times",
              checked: timesEnabled,
              onChange: function(on) {
                onToggleTimes(on);
              }
            })
          ),
          timesEnabled ? el2(
            PanelRow,
            { key: "bl-event-start-time-row" },
            el2(
              "label",
              { className: "components-base-control__label", htmlFor: "bl-event-start-time" },
              L.startTimeLabel || "Start time"
            ),
            el2("input", {
              id: "bl-event-start-time",
              type: "time",
              className: "components-text-control__input bl-event-time-input bl-event-time-input--start",
              value: startTime,
              onChange: function(e) {
                patch({ [META_START_TIME]: e.target.value });
              }
            })
          ) : null,
          timesEnabled ? el2(
            PanelRow,
            { key: "bl-event-end-time-row" },
            el2(
              "label",
              { className: "components-base-control__label", htmlFor: "bl-event-end-time" },
              L.endTimeLabel || "End time"
            ),
            el2("input", {
              id: "bl-event-end-time",
              type: "time",
              className: "components-text-control__input bl-event-time-input bl-event-time-input--end",
              value: endTime,
              onChange: function(e) {
                patch({ [META_END_TIME]: e.target.value });
              }
            })
          ) : null
        )
      );
    }
    function EventPanel() {
      return el2(EventPanelContent, null);
    }
    if (PluginDocumentSettingPanel) {
      registerPlugin("baselayer-event", {
        render: EventPanel
      });
    }
  })();

  // themes/baselayer/src/js/editor/page-show-title.js
  (function(wp2) {
    "use strict";
    const el2 = wp2.element.createElement;
    const { useEffect: useEffect3 } = wp2.element;
    const { registerPlugin } = wp2.plugins;
    const { useSelect: useSelect2 } = wp2.data;
    const { useEntityProp } = wp2.coreData;
    const { CheckboxControl } = wp2.components;
    const editor = wp2.editor || {};
    const PluginPostStatusInfo = editor.PluginPostStatusInfo;
    const META_KEY = "_bl_show_page_title";
    const BODY_CLASS_HIDDEN = "bl-page-title-hidden";
    function isShowTitleChecked(value) {
      return value === void 0 || value === null || value === true || value === "1" || value === 1;
    }
    function getEditorCanvasIframe() {
      return document.querySelector('iframe[name="editor-canvas"]');
    }
    function syncPageTitleHiddenClass(hidden) {
      var on = !!hidden;
      document.body.classList.toggle(BODY_CLASS_HIDDEN, on);
      var iframe = getEditorCanvasIframe();
      if (!iframe) {
        return;
      }
      var applyToIframe = function() {
        try {
          var iframeBody = iframe.contentDocument && iframe.contentDocument.body;
          if (iframeBody) {
            iframeBody.classList.toggle(BODY_CLASS_HIDDEN, on);
          }
        } catch (e) {
        }
      };
      applyToIframe();
      iframe.addEventListener("load", applyToIframe, { once: true });
    }
    function ShowPageTitleCheckbox(props) {
      const postType = props.postType;
      const postId = props.postId;
      const cfg = props.cfg || {};
      const [meta, setMeta] = useEntityProp("postType", postType, "meta", postId);
      if (!meta || typeof setMeta !== "function") {
        return null;
      }
      var checked = isShowTitleChecked(meta[META_KEY]);
      var label = cfg.labelShowTitlePage || "Show page title";
      return el2(CheckboxControl, {
        label,
        checked,
        onChange: function(val) {
          setMeta(
            Object.assign({}, meta, {
              [META_KEY]: val ? true : false
            })
          );
        },
        __nextHasNoMarginBottom: true
      });
    }
    function ShowPageTitlePlugin() {
      const postType = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostType?.() || "";
      }, []);
      const postId = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostId?.();
      }, []);
      const showTitleMeta = useSelect2(
        function(select) {
          if (!postId) {
            return true;
          }
          var edited = select("core/editor")?.getEditedPostAttribute?.("meta");
          if (edited && Object.prototype.hasOwnProperty.call(edited, META_KEY)) {
            return edited[META_KEY];
          }
          return select("core/editor")?.getCurrentPostAttribute?.("meta")?.[META_KEY];
        },
        [postId]
      );
      var cfg = typeof baselayerPageSidebarOptions !== "undefined" ? baselayerPageSidebarOptions : {};
      var allowed = cfg.showTitlePostTypes && Array.isArray(cfg.showTitlePostTypes) ? cfg.showTitlePostTypes : ["page"];
      var isAllowed = !!(postType && allowed.indexOf(postType) !== -1 && postId);
      useEffect3(
        function() {
          if (!isAllowed) {
            syncPageTitleHiddenClass(false);
            return function() {
              syncPageTitleHiddenClass(false);
            };
          }
          var hidden = !isShowTitleChecked(showTitleMeta);
          syncPageTitleHiddenClass(hidden);
          var tries = 0;
          var timer = window.setInterval(function() {
            syncPageTitleHiddenClass(hidden);
            tries += 1;
            if (tries >= 20 || getEditorCanvasIframe()?.contentDocument?.body) {
              window.clearInterval(timer);
            }
          }, 250);
          return function() {
            window.clearInterval(timer);
            syncPageTitleHiddenClass(false);
          };
        },
        [isAllowed, showTitleMeta]
      );
      if (!PluginPostStatusInfo || !isAllowed) {
        return null;
      }
      return el2(
        PluginPostStatusInfo,
        { className: "baselayer-page-show-title" },
        el2(ShowPageTitleCheckbox, {
          postType,
          postId,
          cfg
        })
      );
    }
    registerPlugin("baselayer-page-show-title", {
      render: ShowPageTitlePlugin
    });
  })(typeof wp !== "undefined" ? wp : window.wp);

  // themes/baselayer/src/js/editor/exclude-from-search.js
  (function(wp2) {
    "use strict";
    const el2 = wp2.element.createElement;
    const { registerPlugin } = wp2.plugins;
    const { useSelect: useSelect2 } = wp2.data;
    const { useEntityProp } = wp2.coreData;
    const { CheckboxControl } = wp2.components;
    const editor = wp2.editor || {};
    const PluginPostStatusInfo = editor.PluginPostStatusInfo;
    const META_KEY = "_bl_exclude_from_search";
    function ExcludeFromSearchCheckbox(props) {
      const postType = props.postType;
      const postId = props.postId;
      const cfg = props.cfg || {};
      const [meta, setMeta] = useEntityProp("postType", postType, "meta", postId);
      if (!meta || typeof setMeta !== "function") {
        return null;
      }
      var checked = meta[META_KEY] === true || meta[META_KEY] === "1" || meta[META_KEY] === 1;
      return el2(CheckboxControl, {
        label: cfg.label || "Exclude from search",
        help: cfg.help || "",
        checked,
        onChange: function(val) {
          setMeta(
            Object.assign({}, meta, {
              [META_KEY]: val ? true : false
            })
          );
        },
        __nextHasNoMarginBottom: true
      });
    }
    function ExcludeFromSearchPlugin() {
      const postType = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostType?.() || "";
      }, []);
      const postId = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostId?.();
      }, []);
      var cfg = typeof baselayerExcludeFromSearch !== "undefined" ? baselayerExcludeFromSearch : {};
      var allowed = cfg.postTypes && Array.isArray(cfg.postTypes) ? cfg.postTypes : ["post", "page"];
      if (!PluginPostStatusInfo) {
        return null;
      }
      if (!postType || allowed.indexOf(postType) === -1 || !postId) {
        return null;
      }
      return el2(
        PluginPostStatusInfo,
        { className: "baselayer-exclude-from-search" },
        el2(ExcludeFromSearchCheckbox, {
          postType,
          postId,
          cfg
        })
      );
    }
    registerPlugin("baselayer-exclude-from-search", {
      render: ExcludeFromSearchPlugin
    });
  })(typeof wp !== "undefined" ? wp : window.wp);

  // themes/baselayer/src/js/editor/page-pin-dashboard.js
  (function(wp2) {
    "use strict";
    const el2 = wp2.element.createElement;
    const { registerPlugin } = wp2.plugins;
    const { useSelect: useSelect2 } = wp2.data;
    const { useEntityProp } = wp2.coreData;
    const { CheckboxControl } = wp2.components;
    const editor = wp2.editor || {};
    const PluginPostStatusInfo = editor.PluginPostStatusInfo;
    const META_KEY = "_bl_pin_to_dashboard";
    function PinToDashboardCheckbox(props) {
      const postType = props.postType;
      const postId = props.postId;
      const cfg = props.cfg || {};
      const [meta, setMeta] = useEntityProp("postType", postType, "meta", postId);
      if (!meta || typeof setMeta !== "function") {
        return null;
      }
      var v = meta[META_KEY];
      var checked = v === true || v === "1" || v === 1;
      return el2(CheckboxControl, {
        label: cfg.labelPinDashboard || "Pin to dashboard",
        checked,
        onChange: function(val) {
          setMeta(
            Object.assign({}, meta, {
              [META_KEY]: val ? true : false
            })
          );
        },
        __nextHasNoMarginBottom: true
      });
    }
    function PinToDashboardPlugin() {
      const postType = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostType?.() || "";
      }, []);
      const postId = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostId?.();
      }, []);
      var cfg = typeof baselayerPageSidebarOptions !== "undefined" ? baselayerPageSidebarOptions : {};
      var allowed = cfg.pinPostTypes && Array.isArray(cfg.pinPostTypes) ? cfg.pinPostTypes : ["post", "page"];
      if (!PluginPostStatusInfo) {
        return null;
      }
      if (!postType || allowed.indexOf(postType) === -1 || !postId) {
        return null;
      }
      return el2(
        PluginPostStatusInfo,
        { className: "baselayer-page-pin-dashboard" },
        el2(PinToDashboardCheckbox, {
          postType,
          postId,
          cfg
        })
      );
    }
    registerPlugin("baselayer-page-pin-dashboard", {
      render: PinToDashboardPlugin
    });
  })(typeof wp !== "undefined" ? wp : window.wp);

  // themes/baselayer/src/js/editor/seo.js
  (function(wp2) {
    "use strict";
    if (typeof baselayerFeatures === "undefined" || !baselayerFeatures.seo) {
      return;
    }
    const el2 = wp2.element.createElement;
    const { registerPlugin } = wp2.plugins;
    const { PluginDocumentSettingPanel } = wp2.editor;
    const { useSelect: useSelect2 } = wp2.data;
    const { useEntityProp } = wp2.coreData;
    const { TextControl, TextareaControl, PanelRow, CheckboxControl, Button: Button5, DropZone } = wp2.components;
    const { MediaUpload, MediaUploadCheck } = wp2.blockEditor;
    const META_KEYS = {
      title: "_bl_seo_title",
      description: "_bl_seo_description",
      ogImage: "_bl_seo_og_image",
      noindex: "_bl_seo_noindex"
    };
    const labels = typeof baselayerSeo !== "undefined" ? baselayerSeo : {};
    function SeoPanelContent() {
      const postType = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostType?.() || "";
      }, []);
      const postId = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostId?.();
      }, []);
      var allowed = labels.postTypes && Array.isArray(labels.postTypes) ? labels.postTypes : ["post", "page"];
      if (!postType || allowed.indexOf(postType) === -1 || !postId) {
        return null;
      }
      const [meta, setMeta] = useEntityProp("postType", postType, "meta", postId);
      if (!meta || typeof setMeta !== "function") {
        return null;
      }
      const get = function(key) {
        return meta[META_KEYS[key]] || "";
      };
      const set = function(key, value) {
        setMeta({ ...meta, [META_KEYS[key]]: value });
      };
      const ogImageId = parseInt(get("ogImage"), 10) || 0;
      const ogImageUrl = useSelect2(
        function(select) {
          if (!ogImageId) return "";
          const media = select("core").getEntityRecord("postType", "attachment", ogImageId);
          return media && media.source_url ? media.source_url : "";
        },
        [ogImageId]
      );
      const getBlockEditorSettings = useSelect2(function(select) {
        return select("core/block-editor")?.getSettings || null;
      }, []);
      return el2(
        "div",
        { className: "baselayer-editor-panel baselayer-seo-panel" },
        el2(
          PanelRow,
          null,
          el2(TextControl, {
            label: labels.titleLabel || "Title",
            help: labels.titleHelp || "",
            value: get("title"),
            onChange: function(val) {
              set("title", val || "");
            },
            __nextHasNoMarginBottom: true,
            __next40pxDefaultSize: true
          })
        ),
        el2(
          PanelRow,
          null,
          el2(TextareaControl, {
            label: labels.descriptionLabel || "Description",
            help: labels.descriptionHelp || "",
            value: get("description"),
            onChange: function(val) {
              set("description", val || "");
            },
            rows: 3,
            __nextHasNoMarginBottom: true
          })
        ),
        el2(
          PanelRow,
          null,
          el2(CheckboxControl, {
            label: labels.noindexLabel || "No index",
            help: labels.noindexHelp || "",
            checked: (function() {
              var v = get("noindex");
              return v === true || v === "1" || v === 1;
            })(),
            onChange: function(checked) {
              set("noindex", checked ? true : false);
            },
            __nextHasNoMarginBottom: true
          })
        ),
        el2(
          PanelRow,
          { className: "baselayer-seo-og-image" },
          el2(
            "div",
            { className: "baselayer-seo-og-image-wrap" },
            el2(
              "label",
              { className: "baselayer-seo-og-image-label components-base-control__label" },
              labels.ogImageLabel || "OG Image"
            ),
            el2(
              "p",
              {
                className: "components-base-control__help"
              },
              labels.ogImageHelp || "Best size: 1200 \xD7 630 px."
            ),
            el2(
              MediaUploadCheck,
              {
                fallback: el2(
                  "p",
                  { className: "description" },
                  labels.ogImagePermissionHelp || "To set an OG image, you need permission to upload media."
                )
              },
              el2(
                "div",
                { className: "editor-post-featured-image" },
                el2(
                  "div",
                  { className: "editor-post-featured-image__container" },
                  ogImageId ? el2(MediaUpload, {
                    allowedTypes: ["image"],
                    value: ogImageId,
                    onSelect: function(media) {
                      set("ogImage", media.id ? media.id : 0);
                    },
                    render: function(renderProps) {
                      return el2(
                        "div",
                        null,
                        el2(
                          "div",
                          { className: "editor-post-featured-image__preview" },
                          ogImageUrl ? el2("img", {
                            src: ogImageUrl,
                            alt: "",
                            className: "editor-post-featured-image__preview-image"
                          }) : null
                        ),
                        el2(
                          "div",
                          { className: "editor-post-featured-image__actions" },
                          el2(
                            Button5,
                            {
                              className: "editor-post-featured-image__action",
                              onClick: renderProps.open
                            },
                            labels.ogImageReplace || "Replace"
                          ),
                          el2(
                            Button5,
                            {
                              className: "editor-post-featured-image__action",
                              onClick: function() {
                                set("ogImage", 0);
                              }
                            },
                            labels.ogImageRemove || "Remove"
                          )
                        )
                      );
                    }
                  }) : el2(MediaUpload, {
                    allowedTypes: ["image"],
                    value: void 0,
                    onSelect: function(media) {
                      set("ogImage", media.id ? media.id : 0);
                    },
                    render: function(renderProps) {
                      var settings = getBlockEditorSettings ? getBlockEditorSettings() : null;
                      var mediaUpload = settings?.mediaUpload;
                      var toggleButton = el2(
                        Button5,
                        {
                          className: "editor-post-featured-image__toggle",
                          onClick: renderProps.open,
                          style: { width: "100%" }
                        },
                        labels.ogImageButton || "Set OG image"
                      );
                      return el2(
                        "div",
                        { className: "editor-post-featured-image__toggle" },
                        DropZone && mediaUpload && el2(DropZone, {
                          onFilesDrop: function(files) {
                            mediaUpload({
                              allowedTypes: ["image"],
                              filesList: files,
                              onFileChange: function(images) {
                                if (images && images[0] && images[0].id) {
                                  set("ogImage", images[0].id);
                                }
                              },
                              multiple: false
                            });
                          }
                        }),
                        toggleButton
                      );
                    }
                  })
                )
              )
            )
          )
        )
      );
    }
    function SeoPanel() {
      const postType = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostType?.() || "";
      }, []);
      var allowed = labels.postTypes && Array.isArray(labels.postTypes) ? labels.postTypes : ["post", "page"];
      if (!postType || allowed.indexOf(postType) === -1) {
        return null;
      }
      return el2(
        PluginDocumentSettingPanel,
        {
          name: "baselayer-seo",
          title: labels.panelTitle || "SEO",
          className: "baselayer-seo-document-panel",
          order: 20
        },
        el2(SeoPanelContent, null)
      );
    }
    registerPlugin("baselayer-seo", {
      render: SeoPanel
    });
  })(typeof wp !== "undefined" ? wp : window.wp);

  // themes/baselayer/src/js/editor/languages.js
  (function(wp2) {
    "use strict";
    if (typeof baselayerFeatures === "undefined" || !baselayerFeatures.languages) {
      return;
    }
    const el2 = wp2.element.createElement;
    const { registerPlugin } = wp2.plugins;
    const { PluginDocumentSettingPanel } = wp2.editor;
    const { useSelect: useSelect2, useDispatch: useDispatch2 } = wp2.data;
    const { useEntityProp } = wp2.coreData;
    const { PanelRow } = wp2.components;
    const { useEffect: useEffect3 } = wp2.element;
    const TAXONOMY = "bl_language";
    const labels = typeof baselayerLanguages !== "undefined" ? baselayerLanguages : {};
    function LanguagesPanelContent() {
      const postType = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostType?.() || "";
      }, []);
      const postId = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostId?.();
      }, []);
      const postStatus = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostAttribute?.("status") || "";
      }, []);
      const postTypes = labels.postTypes && Array.isArray(labels.postTypes) ? labels.postTypes : ["post", "page"];
      if (!postType || postTypes.indexOf(postType) === -1) {
        return null;
      }
      const languageLocked = postId && postId > 0 && postStatus && postStatus !== "auto-draft";
      const languages = labels.languages && Array.isArray(labels.languages) ? labels.languages : [];
      const slugToTermId = labels.slugToTermId && typeof labels.slugToTermId === "object" ? labels.slugToTermId : {};
      const linked = labels.linked && typeof labels.linked === "object" ? labels.linked : {};
      const createUrls = labels.createTranslationUrls && typeof labels.createTranslationUrls === "object" ? labels.createTranslationUrls : {};
      const defaultLanguage = labels.defaultLanguage && typeof labels.defaultLanguage === "string" ? labels.defaultLanguage : "";
      const [termIds, setTermIds] = useEntityProp("postType", postType, TAXONOMY, postId);
      const currentTermIds = Array.isArray(termIds) ? termIds : [];
      const currentTermId = currentTermIds.length ? parseInt(currentTermIds[0], 10) : 0;
      const termIdToSlug = {};
      Object.keys(slugToTermId || {}).forEach(function(slug) {
        termIdToSlug[String(slugToTermId[slug])] = slug;
      });
      const currentSlug = currentTermId ? termIdToSlug[currentTermId] || "" : "";
      const { editEntityRecord } = useDispatch2("core");
      const setLanguage = function(slug) {
        const termId = slug && slugToTermId[slug] ? parseInt(slugToTermId[slug], 10) : 0;
        const next = termId ? [termId] : [];
        editEntityRecord("postType", postType, postId, { [TAXONOMY]: next });
      };
      useEffect3(
        function() {
          if (!languageLocked && !currentSlug && defaultLanguage && slugToTermId[defaultLanguage]) {
            setLanguage(defaultLanguage);
          }
        },
        [languageLocked, currentSlug, defaultLanguage]
      );
      if (languages.length === 0) {
        return null;
      }
      const options = languages.map(function(lang) {
        const id = lang.id || "";
        const label = lang.name && lang.name !== "" ? lang.name : id;
        return { label, value: id };
      });
      const effectiveSlug = currentSlug || defaultLanguage;
      const currentLanguageLabel = effectiveSlug ? languages.find(function(l) {
        return (l.id || "") === effectiveSlug;
      })?.name || effectiveSlug : "";
      const rows = languages.map(function(lang) {
        const id = lang.id || "";
        const label = lang.name && lang.name !== "" ? lang.name : id;
        if (id === currentSlug) {
          const wordCountStr = labels.currentWordCount !== void 0 ? ", " + labels.currentWordCount + " " + (parseInt(labels.currentWordCount, 10) === 1 ? labels.word || "word" : labels.words || "words") : "";
          return el2(
            "div",
            { key: id, style: { marginBottom: "8px" } },
            el2("span", { style: { fontWeight: "500" } }, label + " "),
            el2(
              "span",
              { style: { color: "#00a32a", fontSize: "12px" } },
              "(" + (labels.current || "current") + wordCountStr + ")"
            )
          );
        }
        const linkInfo = linked[id];
        if (linkInfo && linkInfo.editLink) {
          const wordCountStr = linkInfo.wordCount !== void 0 ? ", " + linkInfo.wordCount + " " + (parseInt(linkInfo.wordCount, 10) === 1 ? labels.word || "word" : labels.words || "words") : "";
          return el2(
            "div",
            { key: id, style: { marginBottom: "8px" } },
            el2("a", { href: linkInfo.editLink }, label),
            " ",
            el2(
              "span",
              { style: { color: "#646970", fontSize: "12px" } },
              "(" + (labels.linkedLabel || "linked") + wordCountStr + ")"
            )
          );
        }
        const createUrl = createUrls[id];
        if (createUrl && postId) {
          const buttonLabel = !currentSlug ? labels.assignLanguage || "Assign" : labels.createTranslation || "Add";
          return el2(
            "div",
            { key: id, className: "baselayer-languages-create-translation" },
            el2("a", { href: createUrl, className: "button button-small" }, buttonLabel),
            " ",
            el2("span", { style: { color: "#646970" } }, label)
          );
        }
        return el2("div", { key: id, style: { marginBottom: "8px" } }, label);
      });
      var languageControl = languageLocked ? el2(
        "div",
        { className: "baselayer-languages-readonly" },
        el2(
          "div",
          { style: { marginBottom: "4px" } },
          el2(
            "span",
            { className: "baselayer-languages-readonly-label" },
            (labels.thisContentIsIn || "This content is in") + ": "
          ),
          el2("span", { className: "baselayer-languages-readonly-value" }, currentLanguageLabel)
        ),
        el2(
          "p",
          {
            className: "components-base-control__help",
            style: { marginTop: "4px", marginBottom: 0 }
          },
          labels.languageSetOnCreate || "Language is set when the content is created and cannot be changed."
        )
      ) : el2(
        "div",
        { className: "baselayer-languages-select-wrap" },
        el2(
          "label",
          {
            className: "components-base-control__label",
            htmlFor: "baselayer-language-select"
          },
          labels.thisContentIsIn || "This content is in"
        ),
        el2(
          "select",
          {
            id: "baselayer-language-select",
            className: "components-select-control__input",
            value: effectiveSlug,
            onChange: function(e) {
              setLanguage(e.target.value);
            },
            style: { width: "100%", minHeight: "30px" }
          },
          options.map(function(opt) {
            return el2("option", { key: opt.value, value: opt.value }, opt.label);
          })
        )
      );
      return el2(
        "div",
        { className: "baselayer-editor-panel baselayer-languages-panel" },
        el2(PanelRow, null, languageControl),
        el2(
          "div",
          { style: { marginTop: "16px" } },
          el2(
            "label",
            {
              className: "components-base-control__label",
              style: { fontWeight: "600" }
            },
            labels.translations || "Translations"
          ),
          el2("div", { style: { marginTop: "8px" } }, rows)
        )
      );
    }
    function LanguagesPanel() {
      const postType = useSelect2(function(select) {
        return select("core/editor")?.getCurrentPostType?.() || "";
      }, []);
      const postTypes = labels.postTypes && Array.isArray(labels.postTypes) ? labels.postTypes : ["post", "page"];
      if (!postType || postTypes.indexOf(postType) === -1) {
        return null;
      }
      return el2(
        PluginDocumentSettingPanel,
        {
          name: "baselayer-languages",
          title: labels.panelTitle || "Language",
          className: "baselayer-languages-document-panel",
          order: 15
        },
        el2(LanguagesPanelContent, null)
      );
    }
    registerPlugin("baselayer-languages", {
      render: LanguagesPanel
    });
  })(typeof wp !== "undefined" ? wp : window.wp);

  // themes/baselayer/src/js/editor/slider.js
  function getSliderClientId(element) {
    const sliderBlock = element.closest(
      '.block-editor-block-list__block[data-type="acf/slider"]'
    );
    return sliderBlock?.dataset?.block || null;
  }
  document.addEventListener(
    "mousedown",
    (event) => {
      const badge = event.target.closest(".slider__editor-badge");
      if (!badge) {
        return;
      }
      const clientId = getSliderClientId(badge);
      if (!clientId) {
        return;
      }
      wp.data.dispatch("core/block-editor").selectBlock(clientId);
    },
    true
  );

  // themes/baselayer/src/js/editor/blocks.js
  wp.hooks.addFilter("blocks.registerBlockType", "baselayer/pullquote-default-background", (settings, name) => {
    if (name !== "core/pullquote") {
      return settings;
    }
    settings.attributes = {
      ...settings.attributes,
      backgroundColor: {
        ...settings.attributes?.backgroundColor || {},
        type: "string",
        default: "gray-200"
      }
    };
    return settings;
  });
  wp.domReady(() => {
    wp.blocks.unregisterBlockStyle("core/image", "rounded");
    wp.blocks.unregisterBlockStyle("core/separator", "default");
    wp.blocks.unregisterBlockStyle("core/separator", "wide");
    wp.blocks.unregisterBlockStyle("core/separator", "dots");
    const richText = wp.richText?.default || wp.richText || {};
    const { unregisterFormatType, unregisterFormatTypeInBlock } = richText;
    const richTextBlocks = ["core/paragraph", "core/heading", "core/list-item", "core/button"];
    const disabledRichTextFormats = [
      "core/image",
      // Inline image
      "core/keyboard"
      // Keyboard input (DE: Tastatureingabe)
    ];
    disabledRichTextFormats.forEach((formatName) => {
      if (typeof unregisterFormatTypeInBlock === "function") {
        richTextBlocks.forEach((blockName) => {
          unregisterFormatTypeInBlock(blockName, formatName);
        });
      } else if (typeof unregisterFormatType === "function") {
        unregisterFormatType(formatName);
      }
    });
  });
})();
//# sourceMappingURL=editor.js.map
