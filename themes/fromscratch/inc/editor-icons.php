<?php

defined('ABSPATH') || exit;

/**
 * Icon picker labels.
 *
 * The visible icon names and category labels are translatable and live in their
 * own text domain (`fromscratch-icons`), so the short strings sit in
 * languages/icons/ and never bloat the main fromscratch-*.mo. Source strings are
 * English (matching the theme convention); German ships in
 * languages/icons/fromscratch-icons-de_DE.mo.
 *
 * The structural catalog (file names, variants, search keywords) stays in JS:
 * src/js/editor/icons/icon-catalog.js. Keys here must mirror those file names.
 */

/**
 * Load the icon text domain (editor-only, on demand).
 *
 * @return void
 */
function fs_load_icons_textdomain(): void
{
	if (is_textdomain_loaded('fromscratch-icons')) {
		return;
	}

	$mofile = get_template_directory()
		. '/languages/icons/fromscratch-icons-' . determine_locale() . '.mo';

	if (file_exists($mofile)) {
		load_textdomain('fromscratch-icons', $mofile);
	}
}

/**
 * Translated icon names, keyed by icon file name.
 *
 * Keys must mirror the file names in the JS catalog / assets/icons.
 *
 * @return array<string, string>
 */
function fs_icon_labels(): array
{
	return [
		// Navigation.
		'home'                   => _x('Home', 'icon name', 'fromscratch-icons'),
		'menu'                   => _x('Menu', 'icon name', 'fromscratch-icons'),
		'more'                   => _x('More', 'icon name', 'fromscratch-icons'),
		'more-vertical'          => _x('More (vertical)', 'icon name', 'fromscratch-icons'),
		'fullscreen'             => _x('Fullscreen', 'icon name', 'fromscratch-icons'),
		'fullscreen-exit'        => _x('Exit fullscreen', 'icon name', 'fromscratch-icons'),
		'arrow-left'             => _x('Arrow left', 'icon name', 'fromscratch-icons'),
		'arrow-right'            => _x('Arrow right', 'icon name', 'fromscratch-icons'),
		'arrow-up'               => _x('Arrow up', 'icon name', 'fromscratch-icons'),
		'arrow-down'             => _x('Arrow down', 'icon name', 'fromscratch-icons'),
		'chevron-left-large'     => _x('Chevron left (large)', 'icon name', 'fromscratch-icons'),
		'chevron-right-large'    => _x('Chevron right (large)', 'icon name', 'fromscratch-icons'),
		'chevron-left'           => _x('Chevron left', 'icon name', 'fromscratch-icons'),
		'chevron-right'          => _x('Chevron right', 'icon name', 'fromscratch-icons'),
		'chevron-up'             => _x('Chevron up', 'icon name', 'fromscratch-icons'),
		'chevron-down'           => _x('Chevron down', 'icon name', 'fromscratch-icons'),
		'drop-up'                => _x('Drop up', 'icon name', 'fromscratch-icons'),
		'drop-down'              => _x('Drop down', 'icon name', 'fromscratch-icons'),
		'arrow-outward'          => _x('Arrow outward', 'icon name', 'fromscratch-icons'),
		'arrow-range'            => _x('Arrow range', 'icon name', 'fromscratch-icons'),
		'subdirectory-arrow'     => _x('Subdirectory arrow', 'icon name', 'fromscratch-icons'),
		'compare'                => _x('Compare', 'icon name', 'fromscratch-icons'),
		'swap-horizontal'        => _x('Swap horizontal', 'icon name', 'fromscratch-icons'),
		'swap-vertical'          => _x('Swap vertical', 'icon name', 'fromscratch-icons'),
		'expand'                 => _x('Expand', 'icon name', 'fromscratch-icons'),
		'collapse'               => _x('Collapse', 'icon name', 'fromscratch-icons'),
		'expand-content'         => _x('Expand content', 'icon name', 'fromscratch-icons'),
		'collapse-content'       => _x('Collapse content', 'icon name', 'fromscratch-icons'),
		'open-in-new'            => _x('Open in new', 'icon name', 'fromscratch-icons'),

		// Actions.
		'add'                    => _x('Add', 'icon name', 'fromscratch-icons'),
		'minus'                  => _x('Minus', 'icon name', 'fromscratch-icons'),
		'add-circle'             => _x('Add circle', 'icon name', 'fromscratch-icons'),
		'minus-circle'           => _x('Minus circle', 'icon name', 'fromscratch-icons'),
		'checkmark'              => _x('Checkmark', 'icon name', 'fromscratch-icons'),
		'check-circle'           => _x('Check circle', 'icon name', 'fromscratch-icons'),
		'close'                  => _x('Close', 'icon name', 'fromscratch-icons'),
		'cancel'                 => _x('Cancel', 'icon name', 'fromscratch-icons'),
		'block'                  => _x('Block', 'icon name', 'fromscratch-icons'),
		'delete'                 => _x('Delete', 'icon name', 'fromscratch-icons'),
		'copy'                   => _x('Copy', 'icon name', 'fromscratch-icons'),
		'save'                   => _x('Save', 'icon name', 'fromscratch-icons'),
		'download'               => _x('Download', 'icon name', 'fromscratch-icons'),
		'download-alt'           => _x('Download (alt)', 'icon name', 'fromscratch-icons'),
		'upload'                 => _x('Upload', 'icon name', 'fromscratch-icons'),
		'upload-alt'             => _x('Upload (alt)', 'icon name', 'fromscratch-icons'),
		'upgrade'                => _x('Upgrade', 'icon name', 'fromscratch-icons'),
		'print'                  => _x('Print', 'icon name', 'fromscratch-icons'),
		'link'                   => _x('Link', 'icon name', 'fromscratch-icons'),
		'attachment'             => _x('Attachment', 'icon name', 'fromscratch-icons'),
		'search'                 => _x('Search', 'icon name', 'fromscratch-icons'),
		'zoom-in'                => _x('Zoom in', 'icon name', 'fromscratch-icons'),
		'zoom-out'               => _x('Zoom out', 'icon name', 'fromscratch-icons'),
		'crop'                   => _x('Crop', 'icon name', 'fromscratch-icons'),
		'refresh'                => _x('Refresh', 'icon name', 'fromscratch-icons'),
		'sync'                   => _x('Sync', 'icon name', 'fromscratch-icons'),
		'undo'                   => _x('Undo', 'icon name', 'fromscratch-icons'),
		'redo'                   => _x('Redo', 'icon name', 'fromscratch-icons'),
		'drag'                   => _x('Drag indicator', 'icon name', 'fromscratch-icons'),
		'drag-handle'            => _x('Drag handle', 'icon name', 'fromscratch-icons'),

		// Editing & text.
		'edit'                   => _x('Edit', 'icon name', 'fromscratch-icons'),
		'edit-text'              => _x('Edit text', 'icon name', 'fromscratch-icons'),
		'edit-document'          => _x('Edit document', 'icon name', 'fromscratch-icons'),
		'document'               => _x('Document', 'icon name', 'fromscratch-icons'),
		'document-text'          => _x('Text document', 'icon name', 'fromscratch-icons'),
		'article'                => _x('Article', 'icon name', 'fromscratch-icons'),
		'clipboard'              => _x('Clipboard', 'icon name', 'fromscratch-icons'),
		'list'                   => _x('List', 'icon name', 'fromscratch-icons'),
		'list-bullet'            => _x('Bulleted list', 'icon name', 'fromscratch-icons'),
		'list-number'            => _x('Numbered list', 'icon name', 'fromscratch-icons'),
		'abc'                    => _x('Letters', 'icon name', 'fromscratch-icons'),
		'123'                    => _x('Numbers', 'icon name', 'fromscratch-icons'),
		'format-image-left'      => _x('Image left', 'icon name', 'fromscratch-icons'),
		'format-image-right'     => _x('Image right', 'icon name', 'fromscratch-icons'),
		'sort'                   => _x('Sort', 'icon name', 'fromscratch-icons'),
		'sort-by-alpha'          => _x('Sort alphabetically', 'icon name', 'fromscratch-icons'),
		'translate'              => _x('Translate', 'icon name', 'fromscratch-icons'),
		'language'               => _x('Language', 'icon name', 'fromscratch-icons'),
		'quote'                  => _x('Quote', 'icon name', 'fromscratch-icons'),

		// Communication.
		'chat'                   => _x('Chat', 'icon name', 'fromscratch-icons'),
		'chat-dots'              => _x('Chat (dots)', 'icon name', 'fromscratch-icons'),
		'chat-text'              => _x('Chat (text)', 'icon name', 'fromscratch-icons'),
		'forum'                  => _x('Forum', 'icon name', 'fromscratch-icons'),
		'mail'                   => _x('Email', 'icon name', 'fromscratch-icons'),
		'email-open'             => _x('Open email', 'icon name', 'fromscratch-icons'),
		'email-alt'              => _x('Email (alt)', 'icon name', 'fromscratch-icons'),
		'phone'                  => _x('Phone', 'icon name', 'fromscratch-icons'),
		'send'                   => _x('Send', 'icon name', 'fromscratch-icons'),
		'megaphone'              => _x('Megaphone', 'icon name', 'fromscratch-icons'),

		// Social & feedback.
		'heart'                  => _x('Heart', 'icon name', 'fromscratch-icons'),
		'star'                   => _x('Star', 'icon name', 'fromscratch-icons'),
		'star-half'              => _x('Star (half)', 'icon name', 'fromscratch-icons'),
		'star-filled'            => _x('Star (filled)', 'icon name', 'fromscratch-icons'),
		'stars'                  => _x('Stars', 'icon name', 'fromscratch-icons'),
		'star-kid'               => _x('Kids star', 'icon name', 'fromscratch-icons'),
		'star-award'             => _x('Award star', 'icon name', 'fromscratch-icons'),
		'trophy'                 => _x('Trophy', 'icon name', 'fromscratch-icons'),
		'thumb-up'               => _x('Thumbs up', 'icon name', 'fromscratch-icons'),
		'thumb-down'             => _x('Thumbs down', 'icon name', 'fromscratch-icons'),
		'thumb-up-down'          => _x('Thumbs up/down', 'icon name', 'fromscratch-icons'),
		'bookmark'               => _x('Bookmark', 'icon name', 'fromscratch-icons'),
		'smiley-happy'           => _x('Happy face', 'icon name', 'fromscratch-icons'),
		'smiley-neutral'         => _x('Neutral face', 'icon name', 'fromscratch-icons'),
		'smiley-sad'             => _x('Sad face', 'icon name', 'fromscratch-icons'),
		'share'                  => _x('Share', 'icon name', 'fromscratch-icons'),
		'share-social'           => _x('Share (social)', 'icon name', 'fromscratch-icons'),
		'rss'                    => _x('RSS', 'icon name', 'fromscratch-icons'),
		'flag'                   => _x('Flag', 'icon name', 'fromscratch-icons'),

		// Media.
		'image'                  => _x('Image', 'icon name', 'fromscratch-icons'),
		'images'                 => _x('Images', 'icon name', 'fromscratch-icons'),
		'camera'                 => _x('Camera', 'icon name', 'fromscratch-icons'),
		'videocam'               => _x('Video camera', 'icon name', 'fromscratch-icons'),
		'carousel'               => _x('Carousel', 'icon name', 'fromscratch-icons'),
		'play'                   => _x('Play', 'icon name', 'fromscratch-icons'),
		'play-circle'            => _x('Play (circle)', 'icon name', 'fromscratch-icons'),
		'play-box'               => _x('Play (box)', 'icon name', 'fromscratch-icons'),
		'pause'                  => _x('Pause', 'icon name', 'fromscratch-icons'),
		'stop'                   => _x('Stop', 'icon name', 'fromscratch-icons'),
		'skip-next'              => _x('Skip next', 'icon name', 'fromscratch-icons'),
		'skip-prev'              => _x('Skip previous', 'icon name', 'fromscratch-icons'),
		'music'                  => _x('Music', 'icon name', 'fromscratch-icons'),
		'headphones'             => _x('Headphones', 'icon name', 'fromscratch-icons'),
		'volume-mute'            => _x('Volume mute', 'icon name', 'fromscratch-icons'),
		'volume-down'            => _x('Volume down', 'icon name', 'fromscratch-icons'),
		'volume-up'              => _x('Volume up', 'icon name', 'fromscratch-icons'),
		'volume-off'             => _x('Volume off', 'icon name', 'fromscratch-icons'),

		// Files & storage.
		'folder'                 => _x('Folder', 'icon name', 'fromscratch-icons'),
		'folder-open'            => _x('Open folder', 'icon name', 'fromscratch-icons'),
		'folder-zip'             => _x('Zip folder', 'icon name', 'fromscratch-icons'),
		'file-audio'             => _x('Audio file', 'icon name', 'fromscratch-icons'),
		'file-video'             => _x('Video file', 'icon name', 'fromscratch-icons'),
		'file-attachment'        => _x('File attachment', 'icon name', 'fromscratch-icons'),
		'file-pdf'               => _x('PDF file', 'icon name', 'fromscratch-icons'),
		'database'               => _x('Database', 'icon name', 'fromscratch-icons'),
		'cloud'                  => _x('Cloud', 'icon name', 'fromscratch-icons'),
		'backup'                 => _x('Backup', 'icon name', 'fromscratch-icons'),

		// Data & layout.
		'chart-pie'              => _x('Pie chart', 'icon name', 'fromscratch-icons'),
		'chart-bar'              => _x('Bar chart', 'icon name', 'fromscratch-icons'),
		'chart-bar-alt'          => _x('Bar chart (alt)', 'icon name', 'fromscratch-icons'),
		'chart-monitoring'       => _x('Line chart', 'icon name', 'fromscratch-icons'),
		'chart-data'             => _x('Data chart', 'icon name', 'fromscratch-icons'),
		'trending-up'            => _x('Trending up', 'icon name', 'fromscratch-icons'),
		'trending-down'          => _x('Trending down', 'icon name', 'fromscratch-icons'),
		'timeline'               => _x('Timeline', 'icon name', 'fromscratch-icons'),
		'dashboard'              => _x('Dashboard', 'icon name', 'fromscratch-icons'),
		'dashboard-alt'          => _x('Dashboard (alt)', 'icon name', 'fromscratch-icons'),
		'data-table'             => _x('Data table', 'icon name', 'fromscratch-icons'),
		'table'                  => _x('Table', 'icon name', 'fromscratch-icons'),
		'grid'                   => _x('Grid', 'icon name', 'fromscratch-icons'),
		'grid-3x3'               => _x('Grid 3×3', 'icon name', 'fromscratch-icons'),
		'grid-4x4'               => _x('Grid 4×4', 'icon name', 'fromscratch-icons'),
		'list-box'               => _x('List box', 'icon name', 'fromscratch-icons'),
		'view-column'            => _x('Column view', 'icon name', 'fromscratch-icons'),
		'view-comfy'             => _x('Comfy view', 'icon name', 'fromscratch-icons'),
		'view-grid'              => _x('Grid view', 'icon name', 'fromscratch-icons'),
		'view-grid-alt'          => _x('Grid view (alt)', 'icon name', 'fromscratch-icons'),
		'view-list'              => _x('List view', 'icon name', 'fromscratch-icons'),
		'layers'                 => _x('Layers', 'icon name', 'fromscratch-icons'),
		'wp-block'               => _x('WordPress block', 'icon name', 'fromscratch-icons'),

		// Commerce & finance.
		'shopping-cart'          => _x('Shopping cart', 'icon name', 'fromscratch-icons'),
		'shopping-cart-off'      => _x('Cart off', 'icon name', 'fromscratch-icons'),
		'shopping-cart-add'      => _x('Add to cart', 'icon name', 'fromscratch-icons'),
		'shopping-cart-remove'   => _x('Remove from cart', 'icon name', 'fromscratch-icons'),
		'shopping-basket'        => _x('Shopping basket', 'icon name', 'fromscratch-icons'),
		'package'                => _x('Package', 'icon name', 'fromscratch-icons'),
		'contactless'            => _x('Contactless', 'icon name', 'fromscratch-icons'),
		'credit-card'            => _x('Credit card', 'icon name', 'fromscratch-icons'),
		'payment-card'           => _x('Payment card', 'icon name', 'fromscratch-icons'),
		'payments'               => _x('Payments', 'icon name', 'fromscratch-icons'),
		'sell'                   => _x('Sell', 'icon name', 'fromscratch-icons'),
		'currency-exchange'      => _x('Currency exchange', 'icon name', 'fromscratch-icons'),
		'currency-dollar'        => _x('Dollar', 'icon name', 'fromscratch-icons'),
		'currency-euro'          => _x('Euro', 'icon name', 'fromscratch-icons'),
		'currency-pound'         => _x('Pound', 'icon name', 'fromscratch-icons'),
		'currency-yen'           => _x('Yen', 'icon name', 'fromscratch-icons'),
		'currency-franc'         => _x('Franc', 'icon name', 'fromscratch-icons'),
		'currency-lira'          => _x('Lira', 'icon name', 'fromscratch-icons'),
		'currency-ruble'         => _x('Ruble', 'icon name', 'fromscratch-icons'),
		'currency-rupee'         => _x('Rupee', 'icon name', 'fromscratch-icons'),
		'currency-yuan'          => _x('Yuan', 'icon name', 'fromscratch-icons'),
		'currency-bitcoin'       => _x('Bitcoin', 'icon name', 'fromscratch-icons'),
		// Payment brands (proper nouns; not translated).
		'visa'                   => _x('Visa', 'icon name', 'fromscratch-icons'),
		'mastercard'             => _x('Mastercard', 'icon name', 'fromscratch-icons'),
		'paypal'                 => _x('PayPal', 'icon name', 'fromscratch-icons'),
		'applepay'               => _x('Apple Pay', 'icon name', 'fromscratch-icons'),
		'googlepay'              => _x('Google Pay', 'icon name', 'fromscratch-icons'),
		'klarna'                 => _x('Klarna', 'icon name', 'fromscratch-icons'),

		// People & accounts.
		'account'                => _x('Account', 'icon name', 'fromscratch-icons'),
		'person'                 => _x('Person', 'icon name', 'fromscratch-icons'),
		'group'                  => _x('Group', 'icon name', 'fromscratch-icons'),
		'face'                   => _x('Face', 'icon name', 'fromscratch-icons'),
		'id-card'                => _x('ID card', 'icon name', 'fromscratch-icons'),
		'gender-male'            => _x('Male', 'icon name', 'fromscratch-icons'),
		'gender-female'          => _x('Female', 'icon name', 'fromscratch-icons'),
		'man'                    => _x('Man', 'icon name', 'fromscratch-icons'),
		'woman'                  => _x('Woman', 'icon name', 'fromscratch-icons'),
		'accessibility'          => _x('Accessibility', 'icon name', 'fromscratch-icons'),

		// Maps & places.
		'location'               => _x('Location', 'icon name', 'fromscratch-icons'),
		'pin-drop'               => _x('Pin', 'icon name', 'fromscratch-icons'),
		'map'                    => _x('Map', 'icon name', 'fromscratch-icons'),
		'compass'                => _x('Compass', 'icon name', 'fromscratch-icons'),
		'navigation'             => _x('Navigation', 'icon name', 'fromscratch-icons'),
		'globe'                  => _x('Globe', 'icon name', 'fromscratch-icons'),
		'car'                    => _x('Car', 'icon name', 'fromscratch-icons'),
		'bicycle'                => _x('Bicycle', 'icon name', 'fromscratch-icons'),
		'train'                  => _x('Train', 'icon name', 'fromscratch-icons'),
		'ship'                   => _x('Ship', 'icon name', 'fromscratch-icons'),
		'plane'                  => _x('Airplane', 'icon name', 'fromscratch-icons'),

		// Devices & interaction.
		'laptop'                 => _x('Laptop', 'icon name', 'fromscratch-icons'),
		'laptop-alt'             => _x('Laptop (alt)', 'icon name', 'fromscratch-icons'),
		'mobile'                 => _x('Mobile', 'icon name', 'fromscratch-icons'),
		'mobile-alt'             => _x('Mobile (alt)', 'icon name', 'fromscratch-icons'),
		'tv'                     => _x('TV', 'icon name', 'fromscratch-icons'),
		'power-off'              => _x('Power off', 'icon name', 'fromscratch-icons'),
		'mouse'                  => _x('Mouse', 'icon name', 'fromscratch-icons'),
		'touch'                  => _x('Touch', 'icon name', 'fromscratch-icons'),
		'click'                  => _x('Click', 'icon name', 'fromscratch-icons'),
		'barcode'                => _x('Barcode', 'icon name', 'fromscratch-icons'),
		'barcode-scan'           => _x('Barcode scan', 'icon name', 'fromscratch-icons'),
		'qr-code'                => _x('QR code', 'icon name', 'fromscratch-icons'),
		'qr-code-alt'            => _x('QR code (alt)', 'icon name', 'fromscratch-icons'),
		'qr-code-scan'           => _x('QR code scan', 'icon name', 'fromscratch-icons'),

		// Security & privacy.
		'lock'                   => _x('Lock', 'icon name', 'fromscratch-icons'),
		'lock-open'              => _x('Unlock', 'icon name', 'fromscratch-icons'),
		'key'                    => _x('Key', 'icon name', 'fromscratch-icons'),
		'cookie'                 => _x('Cookie', 'icon name', 'fromscratch-icons'),
		'login'                  => _x('Login', 'icon name', 'fromscratch-icons'),
		'logout'                 => _x('Logout', 'icon name', 'fromscratch-icons'),
		'shield'                 => _x('Shield', 'icon name', 'fromscratch-icons'),
		'shield-check'           => _x('Shield check', 'icon name', 'fromscratch-icons'),
		'shield-lock'            => _x('Shield lock', 'icon name', 'fromscratch-icons'),
		'shield-security'        => _x('Security shield', 'icon name', 'fromscratch-icons'),
		'verified'               => _x('Verified', 'icon name', 'fromscratch-icons'),

		// Controls & settings.
		'settings'               => _x('Settings', 'icon name', 'fromscratch-icons'),
		'tune'                   => _x('Tune', 'icon name', 'fromscratch-icons'),
		'filter'                 => _x('Filter', 'icon name', 'fromscratch-icons'),
		'filter-off'             => _x('Filter off', 'icon name', 'fromscratch-icons'),
		'filter-alt'             => _x('Filter (alt)', 'icon name', 'fromscratch-icons'),
		'filter-alt-off'         => _x('Filter off (alt)', 'icon name', 'fromscratch-icons'),
		'checkbox'               => _x('Checkbox', 'icon name', 'fromscratch-icons'),
		'checkbox-checked'       => _x('Checkbox checked', 'icon name', 'fromscratch-icons'),
		'checkbox-indeterminate' => _x('Checkbox indeterminate', 'icon name', 'fromscratch-icons'),
		'radio-button'           => _x('Radio button', 'icon name', 'fromscratch-icons'),
		'radio-button-checked'   => _x('Radio button checked', 'icon name', 'fromscratch-icons'),
		'radio-button-partial'   => _x('Radio button partial', 'icon name', 'fromscratch-icons'),
		'toggle-off'             => _x('Toggle off', 'icon name', 'fromscratch-icons'),
		'toggle-on'              => _x('Toggle on', 'icon name', 'fromscratch-icons'),
		'visibility'             => _x('Visibility', 'icon name', 'fromscratch-icons'),
		'visibility-off'         => _x('Visibility off', 'icon name', 'fromscratch-icons'),
		'mode-dark'              => _x('Dark mode', 'icon name', 'fromscratch-icons'),
		'mode-light'             => _x('Light mode', 'icon name', 'fromscratch-icons'),

		// Status & time.
		'info'                   => _x('Info', 'icon name', 'fromscratch-icons'),
		'help'                   => _x('Help', 'icon name', 'fromscratch-icons'),
		'warning'                => _x('Warning', 'icon name', 'fromscratch-icons'),
		'error'                  => _x('Error', 'icon name', 'fromscratch-icons'),
		'notifications'          => _x('Notifications', 'icon name', 'fromscratch-icons'),
		'clock'                  => _x('Clock', 'icon name', 'fromscratch-icons'),
		'hourglass'              => _x('Hourglass', 'icon name', 'fromscratch-icons'),
		'calendar'               => _x('Calendar (blank)', 'icon name', 'fromscratch-icons'),
		'calendar-month'         => _x('Calendar', 'icon name', 'fromscratch-icons'),
		'calendar-text'          => _x('Calendar (text)', 'icon name', 'fromscratch-icons'),

		// Symbols & misc.
		'rocket'                 => _x('Rocket', 'icon name', 'fromscratch-icons'),
		'rocket-launch'          => _x('Rocket launch', 'icon name', 'fromscratch-icons'),
		'planet'                 => _x('Planet', 'icon name', 'fromscratch-icons'),
		'diamond'                => _x('Diamond', 'icon name', 'fromscratch-icons'),
		'premium'                => _x('Premium', 'icon name', 'fromscratch-icons'),
		'crown'                  => _x('Crown', 'icon name', 'fromscratch-icons'),
		'celebration'            => _x('Celebration', 'icon name', 'fromscratch-icons'),
		'bolt'                   => _x('Bolt', 'icon name', 'fromscratch-icons'),
		'lightbulb'              => _x('Lightbulb', 'icon name', 'fromscratch-icons'),
		'palette'                => _x('Palette', 'icon name', 'fromscratch-icons'),
		'label'                  => _x('Label', 'icon name', 'fromscratch-icons'),
		'pets'                   => _x('Pets', 'icon name', 'fromscratch-icons'),
		'construction'           => _x('Construction', 'icon name', 'fromscratch-icons'),
		'puzzle'                 => _x('Puzzle', 'icon name', 'fromscratch-icons'),

		// Brands (proper nouns; source strings are the brand names and are not
		// translated — the German .mo intentionally has no entries for these, so
		// gettext falls back to the English name in every locale).
		'facebook'               => _x('Facebook', 'icon name', 'fromscratch-icons'),
		'instagram'              => _x('Instagram', 'icon name', 'fromscratch-icons'),
		'x'                      => _x('X (Twitter)', 'icon name', 'fromscratch-icons'),
		'threads'                => _x('Threads', 'icon name', 'fromscratch-icons'),
		'mastodon'               => _x('Mastodon', 'icon name', 'fromscratch-icons'),
		'bluesky'                => _x('Bluesky', 'icon name', 'fromscratch-icons'),
		'pinterest'              => _x('Pinterest', 'icon name', 'fromscratch-icons'),
		'reddit'                 => _x('Reddit', 'icon name', 'fromscratch-icons'),
		'tumblr'                 => _x('Tumblr', 'icon name', 'fromscratch-icons'),
		'medium'                 => _x('Medium', 'icon name', 'fromscratch-icons'),
		'snapchat'               => _x('Snapchat', 'icon name', 'fromscratch-icons'),
		'tiktok'                 => _x('TikTok', 'icon name', 'fromscratch-icons'),
		'xing'                   => _x('Xing', 'icon name', 'fromscratch-icons'),
		'linkedin'               => _x('LinkedIn', 'icon name', 'fromscratch-icons'),
		'weibo'                  => _x('Weibo', 'icon name', 'fromscratch-icons'),
		'behance'                => _x('Behance', 'icon name', 'fromscratch-icons'),
		'dribbble'               => _x('Dribbble', 'icon name', 'fromscratch-icons'),
		'whatsapp'               => _x('WhatsApp', 'icon name', 'fromscratch-icons'),
		'telegram'               => _x('Telegram', 'icon name', 'fromscratch-icons'),
		'signal'                 => _x('Signal', 'icon name', 'fromscratch-icons'),
		'imessage'               => _x('iMessage', 'icon name', 'fromscratch-icons'),
		'messenger'              => _x('Messenger', 'icon name', 'fromscratch-icons'),
		'wechat'                 => _x('WeChat', 'icon name', 'fromscratch-icons'),
		'line'                   => _x('LINE', 'icon name', 'fromscratch-icons'),
		'discord'                => _x('Discord', 'icon name', 'fromscratch-icons'),
		'slack'                  => _x('Slack', 'icon name', 'fromscratch-icons'),
		'youtube'                => _x('YouTube', 'icon name', 'fromscratch-icons'),
		'youtubeshorts'          => _x('YouTube Shorts', 'icon name', 'fromscratch-icons'),
		'vimeo'                  => _x('Vimeo', 'icon name', 'fromscratch-icons'),
		'twitch'                 => _x('Twitch', 'icon name', 'fromscratch-icons'),
		'spotify'                => _x('Spotify', 'icon name', 'fromscratch-icons'),
		'soundcloud'             => _x('SoundCloud', 'icon name', 'fromscratch-icons'),
		'applemusic'             => _x('Apple Music', 'icon name', 'fromscratch-icons'),
		'github'                 => _x('GitHub', 'icon name', 'fromscratch-icons'),
		'gitlab'                 => _x('GitLab', 'icon name', 'fromscratch-icons'),
		'wordpress'              => _x('WordPress', 'icon name', 'fromscratch-icons'),
		'patreon'                => _x('Patreon', 'icon name', 'fromscratch-icons'),
		'trello'                 => _x('Trello', 'icon name', 'fromscratch-icons'),
		'yelp'                   => _x('Yelp', 'icon name', 'fromscratch-icons'),
		'google'                 => _x('Google', 'icon name', 'fromscratch-icons'),
		'microsoft'              => _x('Microsoft', 'icon name', 'fromscratch-icons'),
		'apple'                  => _x('Apple', 'icon name', 'fromscratch-icons'),
	];
}

/**
 * Translated category labels, keyed by category slug.
 *
 * @return array<string, string>
 */
function fs_icon_category_labels(): array
{
	return [
		'navigation'    => _x('Navigation', 'icon category', 'fromscratch-icons'),
		'actions'       => _x('Actions', 'icon category', 'fromscratch-icons'),
		'editing'       => _x('Editing & text', 'icon category', 'fromscratch-icons'),
		'communication' => _x('Communication', 'icon category', 'fromscratch-icons'),
		'social'        => _x('Social & feedback', 'icon category', 'fromscratch-icons'),
		'media'         => _x('Media', 'icon category', 'fromscratch-icons'),
		'files'         => _x('Files & storage', 'icon category', 'fromscratch-icons'),
		'data'          => _x('Data & layout', 'icon category', 'fromscratch-icons'),
		'commerce'      => _x('Commerce & finance', 'icon category', 'fromscratch-icons'),
		'people'        => _x('People & accounts', 'icon category', 'fromscratch-icons'),
		'places'        => _x('Maps & places', 'icon category', 'fromscratch-icons'),
		'devices'       => _x('Devices & interaction', 'icon category', 'fromscratch-icons'),
		'security'      => _x('Security & privacy', 'icon category', 'fromscratch-icons'),
		'controls'      => _x('Controls & settings', 'icon category', 'fromscratch-icons'),
		'status'        => _x('Status & time', 'icon category', 'fromscratch-icons'),
		'misc'          => _x('Symbols & misc', 'icon category', 'fromscratch-icons'),
		'brands'        => _x('Brands', 'icon category', 'fromscratch-icons'),
	];
}

/**
 * Translated picker UI strings.
 *
 * @return array<string, string>
 */
function fs_icon_ui_strings(): array
{
	return [
		'choose'  => _x('Choose icon', 'icon picker', 'fromscratch-icons'),
		'search'  => _x('Search icons…', 'icon picker', 'fromscratch-icons'),
		'style'   => _x('Style', 'icon picker', 'fromscratch-icons'),
		'outline' => _x('Outline', 'icon picker', 'fromscratch-icons'),
		'filled'  => _x('Filled', 'icon picker', 'fromscratch-icons'),
		'remove'  => _x('Remove', 'icon picker', 'fromscratch-icons'),
		'close'   => _x('Close', 'icon picker', 'fromscratch-icons'),
	];
}

/**
 * Icon file names that ship with a filled variant (parsed from _icon-names.scss).
 *
 * @return string[]
 */
function fs_icon_fill_names(): array
{
	static $cache = null;

	if ($cache !== null) {
		return $cache;
	}

	$path = get_template_directory() . '/src/scss/icons/_icon-names.scss';

	if (!is_readable($path)) {
		return $cache = [];
	}

	$content = (string) file_get_contents($path);

	if (!preg_match('/\$fs-icon-fill:\s*\((.*?)\);/s', $content, $matches)) {
		return $cache = [];
	}

	preg_match_all('/[\'"]?([a-z0-9-]+)[\'"]?/i', $matches[1], $names);

	$cache = array_values(array_unique(array_filter($names[1] ?? [])));

	return $cache;
}

/**
 * Icon catalog entries for admin UI (developer cheatsheet icon demo).
 *
 * @return array<int, array{name: string, label: string, hasFill: bool}>
 */
function fs_icon_admin_catalog(): array
{
	fs_load_icons_textdomain();

	$labels = fs_icon_labels();
	$fill = array_flip(fs_icon_fill_names());
	$catalog = [];

	foreach ($labels as $name => $label) {
		$catalog[] = [
			'name'    => $name,
			'label'   => $label,
			'hasFill' => isset($fill[$name]),
		];
	}

	usort(
		$catalog,
		static function (array $a, array $b): int {
			return strcasecmp($a['label'], $b['label']);
		}
	);

	return $catalog;
}

/**
 * Expose translated icon labels + UI strings to the editor script (editor.js).
 *
 * Runs after fs_editor_scripts() (priority 10) has registered the handle.
 *
 * @return void
 */
function fs_editor_icons_localize(): void
{
	fs_load_icons_textdomain();

	wp_localize_script('fromscratch-editor', 'fromscratchIcons', [
		'labels'     => fs_icon_labels(),
		'categories' => fs_icon_category_labels(),
		'ui'         => fs_icon_ui_strings(),
	]);
}
add_action('enqueue_block_editor_assets', 'fs_editor_icons_localize', 11);

/**
 * Expose translated icon labels + UI strings to admin.js on the Developer cheatsheet.
 *
 * @param string $hook_suffix Current admin page hook suffix.
 * @return void
 */
function fs_admin_icons_localize(string $hook_suffix): void
{
	unset($hook_suffix);

	$page = isset($_GET['page']) ? sanitize_key(wp_unslash($_GET['page'])) : '';

	if ($page !== 'fs-developer-system') {
		return;
	}

	fs_load_icons_textdomain();

	wp_localize_script('main-admin-scripts', 'fromscratchIcons', [
		'labels'     => fs_icon_labels(),
		'categories' => fs_icon_category_labels(),
		'ui'         => fs_icon_ui_strings(),
	]);
}
add_action('admin_enqueue_scripts', 'fs_admin_icons_localize', 11);
