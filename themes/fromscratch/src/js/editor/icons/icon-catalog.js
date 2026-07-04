/**
 * Icon catalog for the reusable icon picker (structure only).
 *
 * Each icon is an object:
 *   {
 *     filename: 'heart',        // assets/icons/<filename>.svg (base/outline)
 *     alternatives: ['fill'],   // extra variants: assets/icons/<filename>-<alt>.svg
 *     keywords: ['like', 'love']// English-only search synonyms
 *   }
 *
 * Human-readable names (per icon) and category labels are translatable and are
 * NOT stored here — they come from PHP via `window.fromscratchIcons`
 * (text domain: fromscratch-icons, see inc/editor-icons.php).
 *
 * The generated class names use the filename (`-icon-heart`, `-icon-heart-fill`)
 * and must stay in sync with the SCSS catalog in src/scss/_icons.scss.
 */
import { themeIconCategory } from './icons.generated';

const builtInCategories = [
  {
    slug: 'navigation',
    icons: [
      { filename: 'home', alternatives: ['fill'], keywords: ['house', 'main', 'start'] },
      { filename: 'menu', alternatives: [], keywords: ['hamburger', 'navigation', 'lines'] },
      { filename: 'more', alternatives: [], keywords: ['ellipsis', 'options', 'dots', 'horizontal'] },
      { filename: 'more-vertical', alternatives: [], keywords: ['ellipsis', 'options', 'kebab', 'dots'] },
      { filename: 'fullscreen', alternatives: [], keywords: ['enlarge', 'maximize', 'expand'] },
      { filename: 'fullscreen-exit', alternatives: [], keywords: ['minimize', 'shrink', 'collapse'] },
      { filename: 'arrow-left', alternatives: [], keywords: ['back', 'previous', 'left'] },
      { filename: 'arrow-right', alternatives: [], keywords: ['next', 'forward', 'right'] },
      { filename: 'arrow-up', alternatives: [], keywords: ['up', 'upward', 'top', 'north'] },
      { filename: 'arrow-down', alternatives: [], keywords: ['down', 'downward', 'bottom', 'south'] },
      { filename: 'chevron-left-large', alternatives: [], keywords: ['back', 'previous', 'left', 'big', 'bold'] },
      { filename: 'chevron-right-large', alternatives: [], keywords: ['next', 'forward', 'right', 'big', 'bold'] },
      { filename: 'chevron-left', alternatives: [], keywords: ['back', 'previous', 'left'] },
      { filename: 'chevron-right', alternatives: [], keywords: ['next', 'forward', 'right'] },
      { filename: 'chevron-up', alternatives: [], keywords: ['up', 'collapse', 'less'] },
      { filename: 'chevron-down', alternatives: [], keywords: ['down', 'expand', 'dropdown', 'more'] },
      { filename: 'drop-up', alternatives: [], keywords: ['caret', 'up', 'collapse'] },
      { filename: 'drop-down', alternatives: [], keywords: ['caret', 'down', 'dropdown'] },
      { filename: 'arrow-outward', alternatives: [], keywords: ['external', 'outward', 'diagonal', 'northeast', 'go to'] },
      { filename: 'arrow-range', alternatives: [], keywords: ['range', 'width', 'distance', 'measure', 'horizontal', 'span'] },
      { filename: 'subdirectory-arrow', alternatives: [], keywords: ['return', 'nested', 'enter', 'branch'] },
      { filename: 'compare', alternatives: [], keywords: ['versus', 'difference', 'split'] },
      { filename: 'swap-horizontal', alternatives: [], keywords: ['exchange', 'switch', 'transfer', 'arrows'] },
      { filename: 'swap-vertical', alternatives: [], keywords: ['exchange', 'switch', 'reorder', 'arrows'] },
      { filename: 'expand', alternatives: [], keywords: ['enlarge', 'maximize', 'arrows'] },
      { filename: 'collapse', alternatives: [], keywords: ['minimize', 'shrink', 'close', 'inward', 'arrows'] },
      { filename: 'expand-content', alternatives: [], keywords: ['unfold', 'more', 'enlarge', 'open', 'arrows'] },
      { filename: 'collapse-content', alternatives: [], keywords: ['fold', 'less', 'hide', 'minimize', 'arrows'] },
      { filename: 'open-in-new', alternatives: [], keywords: ['external', 'link', 'window', 'tab'] },
    ],
  },
  {
    slug: 'actions',
    icons: [
      { filename: 'add', alternatives: [], keywords: ['plus', 'new', 'create'] },
      { filename: 'add-circle', alternatives: ['fill'], keywords: ['plus', 'new', 'create'] },
      { filename: 'minus', alternatives: [], keywords: ['remove', 'subtract', 'less'] },
      { filename: 'minus-circle', alternatives: ['fill'], keywords: ['remove', 'subtract', 'delete', 'do not disturb'] },
      { filename: 'checkmark', alternatives: [], keywords: ['check', 'done', 'ok', 'tick', 'confirm'] },
      { filename: 'check-circle', alternatives: ['fill'], keywords: ['done', 'ok', 'success', 'confirm'] },
      { filename: 'close', alternatives: [], keywords: ['x', 'cancel', 'dismiss', 'remove'] },
      { filename: 'cancel', alternatives: ['fill'], keywords: ['close', 'x', 'dismiss', 'stop'] },
      { filename: 'block', alternatives: ['fill'], keywords: ['forbidden', 'ban', 'disable', 'no'] },
      { filename: 'delete', alternatives: ['fill'], keywords: ['trash', 'remove', 'bin'] },
      { filename: 'copy', alternatives: ['fill'], keywords: ['duplicate', 'clipboard'] },
      { filename: 'save', alternatives: ['fill'], keywords: ['disk', 'store'] },
      { filename: 'download', alternatives: [], keywords: ['save', 'export', 'arrow'] },
      { filename: 'download-alt', alternatives: ['fill'], keywords: ['save', 'export', 'arrow'] },
      { filename: 'upload', alternatives: [], keywords: ['import', 'send', 'arrow'] },
      { filename: 'upload-alt', alternatives: ['fill'], keywords: ['import', 'send', 'arrow'] },
      { filename: 'upgrade', alternatives: [], keywords: ['improve', 'level up', 'arrow'] },
      { filename: 'print', alternatives: ['fill'], keywords: ['printer'] },
      { filename: 'link', alternatives: [], keywords: ['url', 'chain', 'hyperlink'] },
      { filename: 'attachment', alternatives: [], keywords: ['paperclip', 'attach', 'file'] },
      { filename: 'search', alternatives: [], keywords: ['find', 'magnifier', 'lookup'] },
      { filename: 'zoom-in', alternatives: [], keywords: ['magnify', 'plus', 'enlarge'] },
      { filename: 'zoom-out', alternatives: [], keywords: ['magnify', 'minus', 'shrink'] },
      { filename: 'crop', alternatives: [], keywords: ['trim', 'resize', 'image'] },
      { filename: 'refresh', alternatives: [], keywords: ['reload', 'update', 'renew'] },
      { filename: 'sync', alternatives: [], keywords: ['refresh', 'update', 'reload', 'arrows'] },
      { filename: 'undo', alternatives: [], keywords: ['back', 'revert', 'arrow'] },
      { filename: 'redo', alternatives: [], keywords: ['forward', 'repeat', 'arrow'] },
      { filename: 'drag', alternatives: [], keywords: ['move', 'reorder', 'handle', 'grab'] },
      { filename: 'drag-handle', alternatives: [], keywords: ['move', 'reorder', 'handle', 'grab'] },
    ],
  },
  {
    slug: 'editing',
    icons: [
      { filename: 'edit', alternatives: ['fill'], keywords: ['pencil', 'pen', 'modify', 'change'] },
      { filename: 'edit-text', alternatives: ['fill'], keywords: ['pencil', 'write', 'modify'] },
      { filename: 'edit-document', alternatives: ['fill'], keywords: ['pencil', 'write', 'file'] },
      { filename: 'document', alternatives: ['fill'], keywords: ['file', 'page', 'paper'] },
      { filename: 'document-text', alternatives: ['fill'], keywords: ['file', 'page', 'text'] },
      { filename: 'article', alternatives: ['fill'], keywords: ['post', 'document', 'news', 'text'] },
      { filename: 'clipboard', alternatives: [], keywords: ['paste', 'copy', 'board'] },
      { filename: 'list', alternatives: [], keywords: ['lines', 'items', 'menu'] },
      { filename: 'list-bullet', alternatives: [], keywords: ['unordered', 'dots', 'ul'] },
      { filename: 'list-number', alternatives: [], keywords: ['ordered', 'ol', 'numbers'] },
      { filename: 'abc', alternatives: [], keywords: ['letters', 'alphabet', 'text', 'characters', 'spelling'] },
      { filename: '123', alternatives: [], keywords: ['numbers', 'digits', 'numeric', 'count'] },
      { filename: 'format-image-left', alternatives: ['fill'], keywords: ['align', 'wrap', 'float', 'text'] },
      { filename: 'format-image-right', alternatives: ['fill'], keywords: ['align', 'wrap', 'float', 'text'] },
      { filename: 'sort', alternatives: [], keywords: ['order', 'arrange', 'filter'] },
      { filename: 'sort-by-alpha', alternatives: [], keywords: ['order', 'alphabetical', 'az'] },
      { filename: 'translate', alternatives: [], keywords: ['language', 'localize', 'translation'] },
      { filename: 'language', alternatives: [], keywords: ['globe', 'locale', 'translate', 'international'] },
      { filename: 'quote', alternatives: ['fill'], keywords: ['blockquote', 'citation', 'testimonial'] },
    ],
  },
  {
    slug: 'communication',
    icons: [
      { filename: 'chat', alternatives: ['fill'], keywords: ['message', 'bubble', 'comment', 'talk'] },
      { filename: 'chat-dots', alternatives: ['fill'], keywords: ['message', 'typing', 'bubble'] },
      { filename: 'chat-text', alternatives: ['fill'], keywords: ['message', 'comment', 'bubble'] },
      { filename: 'forum', alternatives: ['fill'], keywords: ['discussion', 'comments', 'community'] },
      { filename: 'mail', alternatives: ['fill'], keywords: ['envelope', 'message', 'email', 'contact'] },
      { filename: 'email-open', alternatives: ['fill'], keywords: ['envelope', 'read', 'message'] },
      { filename: 'email-alt', alternatives: [], keywords: ['envelope', 'message', 'contact'] },
      { filename: 'phone', alternatives: ['fill'], keywords: ['call', 'contact', 'telephone'] },
      { filename: 'send', alternatives: ['fill'], keywords: ['paper plane', 'submit', 'message'] },
      { filename: 'megaphone', alternatives: ['fill'], keywords: ['announcement', 'marketing', 'promote', 'loud'] },
    ],
  },
  {
    slug: 'social',
    icons: [
      { filename: 'heart', alternatives: ['fill'], keywords: ['like', 'love', 'favorite'] },
      { filename: 'star', alternatives: [], keywords: ['favorite', 'rating', 'bookmark'] },
      { filename: 'star-half', alternatives: [], keywords: ['rating', 'half', 'review'] },
      { filename: 'star-filled', alternatives: [], keywords: ['rating', 'filled', 'review'] },
      { filename: 'stars', alternatives: ['fill'], keywords: ['rating', 'favorite', 'sparkle', 'review'] },
      { filename: 'star-kid', alternatives: ['fill'], keywords: ['kids', 'child', 'favorite', 'rating', 'fun'] },
      { filename: 'star-award', alternatives: ['fill'], keywords: ['award', 'prize', 'achievement', 'badge', 'quality', 'rating'] },
      { filename: 'trophy', alternatives: ['fill'], keywords: ['award', 'win', 'prize', 'achievement', 'cup', 'winner'] },
      { filename: 'thumb-up', alternatives: ['fill'], keywords: ['like', 'approve', 'good', 'vote'] },
      { filename: 'thumb-down', alternatives: ['fill'], keywords: ['dislike', 'disapprove', 'bad', 'vote'] },
      { filename: 'thumb-up-down', alternatives: ['fill'], keywords: ['vote', 'rating', 'feedback'] },
      { filename: 'bookmark', alternatives: ['fill'], keywords: ['save', 'favorite', 'mark'] },
      { filename: 'smiley-happy', alternatives: ['fill'], keywords: ['emoji', 'smile', 'positive', 'mood'] },
      { filename: 'smiley-neutral', alternatives: ['fill'], keywords: ['emoji', 'meh', 'mood'] },
      { filename: 'smiley-sad', alternatives: ['fill'], keywords: ['emoji', 'frown', 'negative', 'mood'] },
      { filename: 'share', alternatives: [], keywords: ['network', 'nodes', 'send'] },
      { filename: 'share-social', alternatives: [], keywords: ['social', 'network', 'send'] },
      { filename: 'rss', alternatives: [], keywords: ['feed', 'subscribe', 'syndication', 'blog'] },
      { filename: 'flag', alternatives: ['fill'], keywords: ['report', 'mark', 'banner'] },
    ],
  },
  {
    slug: 'media',
    icons: [
      { filename: 'image', alternatives: ['fill'], keywords: ['photo', 'picture', 'graphic'] },
      { filename: 'images', alternatives: ['fill'], keywords: ['photos', 'gallery', 'pictures'] },
      { filename: 'camera', alternatives: ['fill'], keywords: ['photo', 'capture', 'picture'] },
      { filename: 'videocam', alternatives: ['fill'], keywords: ['video', 'record', 'film'] },
      { filename: 'carousel', alternatives: ['fill'], keywords: ['slider', 'gallery', 'slideshow'] },
      { filename: 'play', alternatives: ['fill'], keywords: ['start', 'video', 'media'] },
      { filename: 'play-circle', alternatives: ['fill'], keywords: ['video', 'media', 'start'] },
      { filename: 'play-box', alternatives: ['fill'], keywords: ['video', 'media', 'start'] },
      { filename: 'pause', alternatives: ['fill'], keywords: ['media', 'player', 'controls', 'stop'] },
      { filename: 'stop', alternatives: ['fill'], keywords: ['media', 'player', 'controls', 'square', 'end'] },
      { filename: 'skip-next', alternatives: ['fill'], keywords: ['next', 'forward', 'media', 'player', 'track', 'controls'] },
      { filename: 'skip-prev', alternatives: ['fill'], keywords: ['previous', 'back', 'rewind', 'media', 'player', 'track', 'controls'] },
      { filename: 'music', alternatives: [], keywords: ['note', 'audio', 'song', 'sound'] },
      { filename: 'headphones', alternatives: ['fill'], keywords: ['audio', 'listen', 'sound', 'music'] },
      { filename: 'volume-mute', alternatives: ['fill'], keywords: ['sound', 'silent', 'off', 'speaker'] },
      { filename: 'volume-down', alternatives: ['fill'], keywords: ['sound', 'audio', 'quieter', 'speaker'] },
      { filename: 'volume-up', alternatives: ['fill'], keywords: ['sound', 'audio', 'louder', 'speaker'] },
      { filename: 'volume-off', alternatives: ['fill'], keywords: ['mute', 'silent', 'sound', 'speaker'] },
    ],
  },
  {
    slug: 'files',
    icons: [
      { filename: 'folder', alternatives: ['fill'], keywords: ['directory', 'files'] },
      { filename: 'folder-open', alternatives: ['fill'], keywords: ['directory', 'files', 'open'] },
      { filename: 'folder-zip', alternatives: ['fill'], keywords: ['archive', 'compressed', 'zip'] },
      { filename: 'file-audio', alternatives: ['fill'], keywords: ['sound', 'music', 'mp3'] },
      { filename: 'file-video', alternatives: ['fill'], keywords: ['movie', 'film', 'mp4'] },
      { filename: 'file-attachment', alternatives: ['fill'], keywords: ['attachment', 'attach', 'clip', 'upload', 'document'] },
      { filename: 'file-pdf', alternatives: ['fill'], keywords: ['pdf', 'document', 'acrobat', 'export'] },
      { filename: 'database', alternatives: ['fill'], keywords: ['storage', 'server', 'data', 'sql'] },
      { filename: 'cloud', alternatives: ['fill'], keywords: ['storage', 'upload', 'server'] },
      { filename: 'backup', alternatives: ['fill'], keywords: ['restore', 'cloud', 'save', 'copy'] },
    ],
  },
  {
    slug: 'data',
    icons: [
      { filename: 'chart-pie', alternatives: ['fill'], keywords: ['graph', 'statistics', 'analytics'] },
      { filename: 'chart-bar', alternatives: [], keywords: ['graph', 'statistics', 'analytics', 'columns'] },
      { filename: 'chart-bar-alt', alternatives: [], keywords: ['graph', 'statistics', 'analytics', 'columns', 'bars'] },
      { filename: 'chart-monitoring', alternatives: [], keywords: ['monitoring', 'line', 'analytics', 'graph', 'trend', 'activity'] },
      { filename: 'chart-data', alternatives: ['fill'], keywords: ['graph', 'analytics', 'statistics', 'report', 'insights'] },
      { filename: 'trending-up', alternatives: [], keywords: ['growth', 'increase', 'arrow', 'analytics', 'rise', 'up'] },
      { filename: 'trending-down', alternatives: [], keywords: ['decrease', 'decline', 'arrow', 'analytics', 'fall', 'down'] },
      { filename: 'timeline', alternatives: [], keywords: ['process', 'steps', 'history', 'milestones', 'sequence', 'progress'] },
      { filename: 'dashboard', alternatives: ['fill'], keywords: ['gauge', 'overview', 'panel', 'speedometer'] },
      { filename: 'dashboard-alt', alternatives: ['fill'], keywords: ['overview', 'panel', 'widgets'] },
      { filename: 'data-table', alternatives: ['fill'], keywords: ['grid', 'rows', 'spreadsheet'] },
      { filename: 'table', alternatives: ['fill'], keywords: ['grid', 'rows', 'columns', 'spreadsheet'] },
      { filename: 'grid', alternatives: ['fill'], keywords: ['layout', 'tiles', 'gallery'] },
      { filename: 'grid-3x3', alternatives: [], keywords: ['layout', 'tiles', 'gallery'] },
      { filename: 'grid-4x4', alternatives: [], keywords: ['layout', 'tiles', 'gallery'] },
      { filename: 'list-box', alternatives: ['fill'], keywords: ['list', 'panel', 'items'] },
      { filename: 'view-column', alternatives: ['fill'], keywords: ['layout', 'columns'] },
      { filename: 'view-comfy', alternatives: ['fill'], keywords: ['layout', 'grid', 'tiles'] },
      { filename: 'view-grid', alternatives: ['fill'], keywords: ['layout', 'tiles', 'gallery'] },
      { filename: 'view-grid-alt', alternatives: ['fill'], keywords: ['layout', 'tiles'] },
      { filename: 'view-list', alternatives: ['fill'], keywords: ['layout', 'rows', 'list'] },
      { filename: 'layers', alternatives: ['fill'], keywords: ['stack', 'layout', 'overlay', 'levels', 'z-index'] },
      { filename: 'wp-block', alternatives: ['fill'], keywords: ['wordpress', 'gutenberg', 'brick'] },
    ],
  },
  {
    slug: 'commerce',
    icons: [
      { filename: 'shopping-cart', alternatives: ['fill'], keywords: ['cart', 'buy', 'ecommerce', 'checkout'] },
      { filename: 'shopping-cart-off', alternatives: ['fill'], keywords: ['cart', 'disabled', 'removed', 'empty', 'unavailable', 'no'] },
      { filename: 'shopping-cart-add', alternatives: [], keywords: ['cart', 'buy', 'plus'] },
      { filename: 'shopping-cart-remove', alternatives: [], keywords: ['cart', 'minus', 'remove'] },
      { filename: 'shopping-basket', alternatives: ['fill'], keywords: ['basket', 'buy', 'cart'] },
      { filename: 'package', alternatives: ['fill'], keywords: ['box', 'parcel', 'delivery', 'shipping', 'order'] },
      { filename: 'contactless', alternatives: ['fill'], keywords: ['payment', 'tap', 'nfc', 'wireless', 'pay'] },
      { filename: 'credit-card', alternatives: ['fill'], keywords: ['payment', 'card', 'pay'] },
      { filename: 'payment-card', alternatives: ['fill'], keywords: ['payment', 'card', 'credit card', 'debit', 'pay'] },
      { filename: 'payments', alternatives: ['fill'], keywords: ['money', 'pay', 'cash', 'finance'] },
      { filename: 'sell', alternatives: ['fill'], keywords: ['tag', 'price', 'offer', 'sale'] },
      { filename: 'currency-exchange', alternatives: [], keywords: ['money', 'exchange', 'convert', 'forex', 'rates'] },
      { filename: 'currency-dollar', alternatives: [], keywords: ['money', 'usd', 'price'] },
      { filename: 'currency-euro', alternatives: [], keywords: ['money', 'eur', 'price'] },
      { filename: 'currency-pound', alternatives: [], keywords: ['money', 'gbp', 'price'] },
      { filename: 'currency-yen', alternatives: [], keywords: ['money', 'jpy', 'price'] },
      { filename: 'currency-franc', alternatives: [], keywords: ['money', 'chf', 'franc', 'swiss', 'price'] },
      { filename: 'currency-lira', alternatives: [], keywords: ['money', 'try', 'lira', 'turkish', 'price'] },
      { filename: 'currency-ruble', alternatives: [], keywords: ['money', 'rub', 'ruble', 'russian', 'price'] },
      { filename: 'currency-rupee', alternatives: [], keywords: ['money', 'inr', 'rupee', 'indian', 'price'] },
      { filename: 'currency-yuan', alternatives: [], keywords: ['money', 'cny', 'yuan', 'renminbi', 'chinese', 'price'] },
      { filename: 'currency-bitcoin', alternatives: [], keywords: ['money', 'btc', 'bitcoin', 'crypto', 'cryptocurrency'] },
      // Payment brands (non-Material logos) sit at the end of the category.
      { filename: 'visa', alternatives: [], keywords: ['payment', 'card', 'credit card', 'brand'] },
      { filename: 'mastercard', alternatives: [], keywords: ['payment', 'card', 'credit card', 'brand'] },
      { filename: 'paypal', alternatives: [], keywords: ['payment', 'pay', 'wallet', 'brand'] },
      { filename: 'applepay', alternatives: [], keywords: ['payment', 'apple', 'pay', 'wallet', 'brand'] },
      { filename: 'googlepay', alternatives: [], keywords: ['payment', 'google', 'pay', 'wallet', 'brand'] },
      { filename: 'klarna', alternatives: [], keywords: ['payment', 'pay', 'bnpl', 'buy now pay later', 'brand'] },
    ],
  },
  {
    slug: 'people',
    icons: [
      { filename: 'account', alternatives: ['fill'], keywords: ['user', 'profile', 'person'] },
      { filename: 'person', alternatives: ['fill'], keywords: ['user', 'profile', 'account'] },
      { filename: 'group', alternatives: ['fill'], keywords: ['team', 'people', 'users'] },
      { filename: 'face', alternatives: ['fill'], keywords: ['user', 'avatar', 'profile'] },
      { filename: 'id-card', alternatives: ['fill'], keywords: ['identity', 'badge', 'profile'] },
      { filename: 'gender-male', alternatives: [], keywords: ['man', 'sex', 'symbol'] },
      { filename: 'gender-female', alternatives: [], keywords: ['woman', 'sex', 'symbol'] },
      { filename: 'man', alternatives: [], keywords: ['male', 'person', 'user'] },
      { filename: 'woman', alternatives: [], keywords: ['female', 'person', 'user'] },
      { filename: 'accessibility', alternatives: [], keywords: ['a11y', 'wheelchair', 'disability', 'access'] },
    ],
  },
  {
    slug: 'places',
    icons: [
      { filename: 'location', alternatives: ['fill'], keywords: ['pin', 'map', 'marker', 'place', 'gps'] },
      { filename: 'pin-drop', alternatives: ['fill'], keywords: ['location', 'marker', 'map', 'place'] },
      { filename: 'map', alternatives: ['fill'], keywords: ['location', 'navigation', 'directions'] },
      { filename: 'compass', alternatives: ['fill'], keywords: ['navigation', 'direction', 'explore'] },
      { filename: 'navigation', alternatives: ['fill'], keywords: ['direction', 'gps', 'near me', 'explore', 'arrow', 'maps'] },
      { filename: 'globe', alternatives: [], keywords: ['world', 'earth', 'international', 'web'] },
      { filename: 'car', alternatives: ['fill'], keywords: ['vehicle', 'drive', 'transport', 'auto'] },
      { filename: 'bicycle', alternatives: [], keywords: ['bike', 'cycle', 'transport', 'ride'] },
      { filename: 'train', alternatives: ['fill'], keywords: ['transport', 'rail', 'metro', 'subway', 'travel'] },
      { filename: 'ship', alternatives: ['fill'], keywords: ['boat', 'transport', 'cruise', 'sea', 'ferry', 'travel'] },
      { filename: 'plane', alternatives: [], keywords: ['airplane', 'flight', 'travel', 'fly', 'airport'] },
    ],
  },
  {
    slug: 'devices',
    icons: [
      { filename: 'laptop', alternatives: ['fill'], keywords: ['computer', 'notebook', 'device'] },
      { filename: 'laptop-alt', alternatives: ['fill'], keywords: ['computer', 'notebook'] },
      { filename: 'mobile', alternatives: ['fill'], keywords: ['phone', 'smartphone', 'device'] },
      { filename: 'mobile-alt', alternatives: ['fill'], keywords: ['phone', 'smartphone'] },
      { filename: 'tv', alternatives: ['fill'], keywords: ['television', 'screen', 'monitor', 'display'] },
      { filename: 'power-off', alternatives: [], keywords: ['shutdown', 'standby', 'on', 'off'] },
      { filename: 'mouse', alternatives: ['fill'], keywords: ['click', 'cursor', 'device'] },
      { filename: 'touch', alternatives: ['fill'], keywords: ['tap', 'finger', 'gesture'] },
      { filename: 'click', alternatives: [], keywords: ['tap', 'cursor', 'select'] },
      { filename: 'pointer', alternatives: ['fill'], keywords: ['cursor', 'click', 'select', 'arrow', 'mouse'] },
      { filename: 'barcode', alternatives: [], keywords: ['scan', 'product', 'code'] },
      { filename: 'barcode-scan', alternatives: [], keywords: ['scan', 'product', 'code'] },
      { filename: 'qr-code', alternatives: [], keywords: ['qr', 'code', 'scan', 'barcode', 'link'] },
      { filename: 'qr-code-alt', alternatives: [], keywords: ['qr', 'code', 'scan', 'barcode'] },
      { filename: 'qr-code-scan', alternatives: [], keywords: ['qr', 'code', 'scan', 'camera', 'barcode'] },
    ],
  },
  {
    slug: 'security',
    icons: [
      { filename: 'lock', alternatives: ['fill'], keywords: ['secure', 'locked', 'private', 'password'] },
      { filename: 'lock-open', alternatives: ['fill'], keywords: ['unlocked', 'open', 'access'] },
      { filename: 'key', alternatives: ['fill'], keywords: ['password', 'access', 'login', 'unlock'] },
      { filename: 'cookie', alternatives: ['fill'], keywords: ['consent', 'privacy', 'gdpr'] },
      { filename: 'login', alternatives: [], keywords: ['sign in', 'enter', 'access'] },
      { filename: 'logout', alternatives: [], keywords: ['sign out', 'exit', 'leave'] },
      { filename: 'shield', alternatives: ['fill'], keywords: ['security', 'protection', 'guard'] },
      { filename: 'shield-check', alternatives: ['fill'], keywords: ['security', 'verified', 'protected', 'safe'] },
      { filename: 'shield-lock', alternatives: ['fill'], keywords: ['security', 'protected', 'private'] },
      { filename: 'shield-security', alternatives: [], keywords: ['protection', 'guard', 'safe'] },
      { filename: 'verified', alternatives: ['fill'], keywords: ['check', 'badge', 'trusted', 'approved'] },
    ],
  },
  {
    slug: 'controls',
    icons: [
      { filename: 'settings', alternatives: ['fill'], keywords: ['gear', 'cog', 'preferences', 'options'] },
      { filename: 'tune', alternatives: [], keywords: ['sliders', 'adjust', 'options'] },
      { filename: 'filter', alternatives: [], keywords: ['funnel', 'sort', 'refine'] },
      { filename: 'filter-off', alternatives: [], keywords: ['funnel', 'clear', 'reset'] },
      { filename: 'filter-alt', alternatives: ['fill'], keywords: ['funnel', 'sort', 'refine'] },
      { filename: 'filter-alt-off', alternatives: ['fill'], keywords: ['funnel', 'clear', 'reset'] },
      { filename: 'checkbox', alternatives: [], keywords: ['check', 'box', 'unchecked', 'form'] },
      { filename: 'checkbox-checked', alternatives: ['fill'], keywords: ['check', 'form', 'selected'] },
      { filename: 'checkbox-indeterminate', alternatives: ['fill'], keywords: ['check', 'partial', 'form'] },
      { filename: 'radio-button', alternatives: [], keywords: ['option', 'form', 'circle'] },
      { filename: 'radio-button-checked', alternatives: [], keywords: ['option', 'form', 'selected'] },
      { filename: 'radio-button-partial', alternatives: [], keywords: ['option', 'form', 'partial'] },
      { filename: 'toggle-off', alternatives: ['fill'], keywords: ['switch', 'off', 'disabled'] },
      { filename: 'toggle-on', alternatives: ['fill'], keywords: ['switch', 'on', 'enabled'] },
      { filename: 'visibility', alternatives: ['fill'], keywords: ['eye', 'show', 'view', 'visible'] },
      { filename: 'visibility-off', alternatives: ['fill'], keywords: ['eye', 'hide', 'hidden', 'invisible', 'private', 'password'] },
      { filename: 'mode-dark', alternatives: ['fill'], keywords: ['night', 'theme', 'moon'] },
      { filename: 'mode-light', alternatives: ['fill'], keywords: ['day', 'theme', 'sun', 'brightness'] },
    ],
  },
  {
    slug: 'status',
    icons: [
      { filename: 'info', alternatives: ['fill'], keywords: ['information', 'help', 'details', 'about'] },
      { filename: 'help', alternatives: ['fill'], keywords: ['question', 'support', 'faq'] },
      { filename: 'warning', alternatives: ['fill'], keywords: ['alert', 'caution', 'attention', 'error'] },
      { filename: 'error', alternatives: ['fill'], keywords: ['alert', 'exclamation', 'danger', 'problem', 'fail', 'warning'] },
      { filename: 'notifications', alternatives: ['fill'], keywords: ['bell', 'alert', 'alarm'] },
      { filename: 'clock', alternatives: ['fill'], keywords: ['time', 'schedule', 'hour'] },
      { filename: 'hourglass', alternatives: ['fill'], keywords: ['time', 'wait', 'loading', 'timer'] },
      { filename: 'calendar', alternatives: ['fill'], keywords: ['date', 'schedule', 'event', 'day', 'blank'] },
      { filename: 'calendar-month', alternatives: ['fill'], keywords: ['date', 'month', 'schedule', 'event'] },
      { filename: 'calendar-text', alternatives: ['fill'], keywords: ['date', 'event', 'schedule', 'agenda'] },
    ],
  },
  {
    slug: 'misc',
    icons: [
      { filename: 'rocket', alternatives: ['fill'], keywords: ['launch', 'startup', 'fast', 'boost'] },
      { filename: 'rocket-launch', alternatives: ['fill'], keywords: ['launch', 'startup', 'boost', 'space'] },
      { filename: 'planet', alternatives: [], keywords: ['space', 'world', 'astronomy', 'orbit', 'saturn', 'galaxy'] },
      { filename: 'diamond', alternatives: ['fill'], keywords: ['gem', 'premium', 'jewel', 'quality'] },
      { filename: 'premium', alternatives: ['fill'], keywords: ['crown', 'vip', 'upgrade', 'pro'] },
      { filename: 'crown', alternatives: ['fill'], keywords: ['king', 'queen', 'premium', 'royal', 'vip', 'winner', 'best'] },
      { filename: 'celebration', alternatives: ['fill'], keywords: ['party', 'confetti', 'congrats', 'event', 'success', 'festive'] },
      { filename: 'bolt', alternatives: ['fill'], keywords: ['flash', 'energy', 'power', 'fast', 'lightning'] },
      { filename: 'lightbulb', alternatives: ['fill'], keywords: ['idea', 'tip', 'hint', 'bright'] },
      { filename: 'palette', alternatives: ['fill'], keywords: ['color', 'design', 'art', 'theme', 'paint'] },
      { filename: 'label', alternatives: ['fill'], keywords: ['tag', 'badge', 'category'] },
      { filename: 'pets', alternatives: [], keywords: ['paw', 'animal', 'dog', 'cat', 'pet'] },
      { filename: 'construction', alternatives: [], keywords: ['maintenance', 'work', 'build', 'tools'] },
      { filename: 'puzzle', alternatives: ['fill'], keywords: ['extension', 'plugin', 'addon', 'integration', 'piece'] },
    ],
  },
  {
    slug: 'brands',
    icons: [
      { filename: 'facebook', alternatives: [], keywords: ['social', 'meta', 'fb'] },
      { filename: 'instagram', alternatives: [], keywords: ['social', 'meta', 'ig', 'photos'] },
      { filename: 'x', alternatives: [], keywords: ['twitter', 'tweet', 'social'] },
      { filename: 'threads', alternatives: [], keywords: ['social', 'meta', 'instagram'] },
      { filename: 'mastodon', alternatives: [], keywords: ['social', 'fediverse', 'toot'] },
      { filename: 'bluesky', alternatives: [], keywords: ['social', 'bsky', 'butterfly'] },
      { filename: 'pinterest', alternatives: [], keywords: ['social', 'pin', 'board'] },
      { filename: 'reddit', alternatives: [], keywords: ['social', 'forum', 'community'] },
      { filename: 'tumblr', alternatives: [], keywords: ['social', 'blog'] },
      { filename: 'medium', alternatives: [], keywords: ['blog', 'publishing', 'articles', 'writing'] },
      { filename: 'snapchat', alternatives: [], keywords: ['social', 'snap', 'ghost'] },
      { filename: 'tiktok', alternatives: [], keywords: ['social', 'video', 'short'] },
      { filename: 'xing', alternatives: [], keywords: ['social', 'jobs', 'network', 'professional', 'business'] },
      { filename: 'linkedin', alternatives: [], keywords: ['social', 'jobs', 'network', 'professional', 'business', 'career'] },
      { filename: 'weibo', alternatives: [], keywords: ['social', 'china', 'microblog'] },
      { filename: 'behance', alternatives: [], keywords: ['portfolio', 'design', 'creative', 'adobe'] },
      { filename: 'dribbble', alternatives: [], keywords: ['portfolio', 'design', 'creative', 'shots'] },
      { filename: 'whatsapp', alternatives: [], keywords: ['messaging', 'chat', 'meta', 'message'] },
      { filename: 'telegram', alternatives: [], keywords: ['messaging', 'chat', 'message'] },
      { filename: 'signal', alternatives: [], keywords: ['messaging', 'chat', 'private', 'message'] },
      { filename: 'imessage', alternatives: [], keywords: ['messaging', 'messages', 'apple', 'chat'] },
      { filename: 'messenger', alternatives: [], keywords: ['messaging', 'facebook', 'meta', 'chat', 'message'] },
      { filename: 'wechat', alternatives: [], keywords: ['messaging', 'weixin', 'chat', 'china'] },
      { filename: 'line', alternatives: [], keywords: ['messaging', 'chat', 'japan'] },
      { filename: 'discord', alternatives: [], keywords: ['chat', 'gaming', 'community', 'voice'] },
      { filename: 'slack', alternatives: [], keywords: ['messaging', 'team', 'work', 'chat', 'collaboration'] },
      { filename: 'youtube', alternatives: [], keywords: ['video', 'streaming', 'google'] },
      { filename: 'youtubeshorts', alternatives: [], keywords: ['video', 'youtube', 'shorts', 'short'] },
      { filename: 'vimeo', alternatives: [], keywords: ['video', 'streaming'] },
      { filename: 'twitch', alternatives: [], keywords: ['video', 'streaming', 'gaming', 'live'] },
      { filename: 'spotify', alternatives: [], keywords: ['music', 'audio', 'streaming'] },
      { filename: 'soundcloud', alternatives: [], keywords: ['music', 'audio', 'streaming'] },
      { filename: 'applemusic', alternatives: [], keywords: ['music', 'audio', 'streaming', 'apple'] },
      { filename: 'github', alternatives: [], keywords: ['code', 'git', 'repository', 'developer', 'octocat'] },
      { filename: 'gitlab', alternatives: [], keywords: ['code', 'git', 'repository', 'developer'] },
      { filename: 'wordpress', alternatives: [], keywords: ['blog', 'cms', 'wp', 'website'] },
      { filename: 'patreon', alternatives: [], keywords: ['membership', 'support', 'creator', 'donate'] },
      { filename: 'trello', alternatives: [], keywords: ['board', 'kanban', 'project', 'tasks', 'atlassian'] },
      { filename: 'yelp', alternatives: [], keywords: ['reviews', 'business', 'local', 'ratings'] },
      { filename: 'google', alternatives: [], keywords: ['search', 'brand', 'g'] },
      { filename: 'microsoft', alternatives: [], keywords: ['windows', 'office', 'tech'] },
      { filename: 'apple', alternatives: [], keywords: ['mac', 'ios', 'iphone', 'tech', 'logo'] },
    ],
  },
];

// Project/customer icons (assets/icons/theme/) surface at the top of the picker.
// The list is generated by scripts/build-icons.mjs into ./icons.generated.js.
export const iconCategories = themeIconCategory.icons.length ? [themeIconCategory, ...builtInCategories] : builtInCategories;

/** Flat list of every icon across all categories. */
export const allIcons = iconCategories.reduce((icons, category) => icons.concat(category.icons), []);

/** Whether an icon offers the given variant (e.g. 'fill'). */
export const hasVariant = (icon, variant) => !!icon && !!variant && icon.alternatives.indexOf(variant) !== -1;

/**
 * Resolve an icon to the file name for a variant. Falls back to the base
 * (outline) file name when the requested variant does not exist, so every
 * icon stays selectable regardless of the active variant.
 */
export const resolveIconName = (icon, variant) =>
  variant && variant !== 'outline' && hasVariant(icon, variant) ? `${icon.filename}-${variant}` : icon.filename;

/**
 * Match an icon against a lowercased search query.
 *
 * Searches the file name, the (localized) display name passed in, and the
 * static keywords.
 */
export const iconMatchesQuery = (icon, query, displayName = '') => {
  if (!query) {
    return true;
  }

  const haystack = [icon.filename, displayName].concat(icon.keywords).join(' ').toLowerCase();

  return haystack.indexOf(query) !== -1;
};

/**
 * Find the icon + variant for a stored value (e.g. `heart-fill`).
 * Returns null when the value does not match any catalog icon.
 */
export const findIconByValue = (value) => {
  if (!value) {
    return null;
  }

  for (const icon of allIcons) {
    if (icon.filename === value) {
      return { icon, variant: 'outline' };
    }

    for (const variant of icon.alternatives) {
      if (value === `${icon.filename}-${variant}`) {
        return { icon, variant };
      }
    }
  }

  return null;
};
