<?php

defined('ABSPATH') || exit;

/**
 * Icon picker labels.
 *
 * The visible icon names and category labels are translatable and live in their
 * own text domain (`baselayer-icons`), so the short strings sit in
 * languages/icons/ and never bloat the main baselayer-*.mo. Source strings are
 * English (matching the theme convention); German ships in
 * languages/icons/baselayer-icons-de_DE.mo.
 *
 * The structural catalog (file names, variants, search keywords) stays in JS:
 * src/js/editor/icons/icon-catalog.js. Keys here must mirror those file names.
 */

/**
 * Load the icon text domain (editor-only, on demand).
 *
 * @return void
 */
function bl_load_icons_textdomain(): void
{
	if (is_textdomain_loaded('baselayer-icons')) {
		return;
	}

	$mofile = get_template_directory()
		. '/languages/icons/baselayer-icons-' . determine_locale() . '.mo';

	if (file_exists($mofile)) {
		load_textdomain('baselayer-icons', $mofile);
	}
}

/**
 * Translated icon names, keyed by icon file name.
 *
 * Keys must mirror the file names in the JS catalog / assets/icons.
 *
 * @return array<string, string>
 */
function bl_icon_labels(): array
{
	return [
		// Navigation.
		'home'                   => _x('Home', 'icon name', 'baselayer-icons'),
		'menu'                   => _x('Menu', 'icon name', 'baselayer-icons'),
		'more'                   => _x('More', 'icon name', 'baselayer-icons'),
		'more-vertical'          => _x('More (vertical)', 'icon name', 'baselayer-icons'),
		'fullscreen'             => _x('Fullscreen', 'icon name', 'baselayer-icons'),
		'fullscreen-exit'        => _x('Exit fullscreen', 'icon name', 'baselayer-icons'),
		'arrow-left'             => _x('Arrow left', 'icon name', 'baselayer-icons'),
		'arrow-right'            => _x('Arrow right', 'icon name', 'baselayer-icons'),
		'arrow-up'               => _x('Arrow up', 'icon name', 'baselayer-icons'),
		'arrow-down'             => _x('Arrow down', 'icon name', 'baselayer-icons'),
		'chevron-left-large'     => _x('Chevron left (large)', 'icon name', 'baselayer-icons'),
		'chevron-right-large'    => _x('Chevron right (large)', 'icon name', 'baselayer-icons'),
		'chevron-left'           => _x('Chevron left', 'icon name', 'baselayer-icons'),
		'chevron-right'          => _x('Chevron right', 'icon name', 'baselayer-icons'),
		'chevron-up'             => _x('Chevron up', 'icon name', 'baselayer-icons'),
		'chevron-down'           => _x('Chevron down', 'icon name', 'baselayer-icons'),
		'drop-up'                => _x('Drop up', 'icon name', 'baselayer-icons'),
		'drop-down'              => _x('Drop down', 'icon name', 'baselayer-icons'),
		'arrow-up-right'         => _x('Arrow outward', 'icon name', 'baselayer-icons'),
		'arrow-range'            => _x('Arrow range', 'icon name', 'baselayer-icons'),
		'arrow-split'            => _x('Arrow split', 'icon name', 'baselayer-icons'),
		'arrow-split-up'         => _x('Arrow split up', 'icon name', 'baselayer-icons'),
		'subdirectory-arrow'     => _x('Subdirectory arrow', 'icon name', 'baselayer-icons'),
		'compare'                => _x('Compare', 'icon name', 'baselayer-icons'),
		'swap-horizontal'        => _x('Swap horizontal', 'icon name', 'baselayer-icons'),
		'swap-vertical'          => _x('Swap vertical', 'icon name', 'baselayer-icons'),
		'arrows-input'           => _x('Arrows input', 'icon name', 'baselayer-icons'),
		'arrows-output'          => _x('Arrows output', 'icon name', 'baselayer-icons'),
		'expand'                 => _x('Expand', 'icon name', 'baselayer-icons'),
		'collapse'               => _x('Collapse', 'icon name', 'baselayer-icons'),
		'expand-content'         => _x('Expand content', 'icon name', 'baselayer-icons'),
		'collapse-content'       => _x('Collapse content', 'icon name', 'baselayer-icons'),
		'open-in-new'            => _x('Open in new', 'icon name', 'baselayer-icons'),
		'open-in-new-down'       => _x('Open in new (down)', 'icon name', 'baselayer-icons'),
		'arrow-left-alt'         => _x('Arrow left', 'icon name', 'baselayer-icons'),
		'arrow-right-alt'        => _x('Arrow right', 'icon name', 'baselayer-icons'),
		'arrow-up-alt'           => _x('Arrow up', 'icon name', 'baselayer-icons'),
		'shape-up'               => _x('Shape up', 'icon name', 'baselayer-icons'),
		'shape-up-stack'         => _x('Shape up stack', 'icon name', 'baselayer-icons'),
		'arrow-line-start'       => _x('Arrow line start', 'icon name', 'baselayer-icons'),
		'arrow-line-end'         => _x('Arrow line end', 'icon name', 'baselayer-icons'),
		'arrow-down-alt'         => _x('Arrow down', 'icon name', 'baselayer-icons'),
		'drop-left'              => _x('Drop left', 'icon name', 'baselayer-icons'),
		'drop-right'             => _x('Drop right', 'icon name', 'baselayer-icons'),
		'zoom-in-map'            => _x('Zoom in map', 'icon name', 'baselayer-icons'),
		'zoom-out-map'           => _x('Zoom out map', 'icon name', 'baselayer-icons'),
		'content-grid'           => _x('Content grid', 'icon name', 'baselayer-icons'),
		'move-selection-up'      => _x('Move selection up', 'icon name', 'baselayer-icons'),
		'move-selection-down'    => _x('Move selection down', 'icon name', 'baselayer-icons'),
		'move-selection-left'    => _x('Move selection left', 'icon name', 'baselayer-icons'),
		'move-selection-right'   => _x('Move selection right', 'icon name', 'baselayer-icons'),

		// Actions.
		'add'                    => _x('Add', 'icon name', 'baselayer-icons'),
		'minus'                  => _x('Minus', 'icon name', 'baselayer-icons'),
		'add-circle'             => _x('Add circle', 'icon name', 'baselayer-icons'),
		'minus-circle'           => _x('Minus circle', 'icon name', 'baselayer-icons'),
		'checkmark'              => _x('Checkmark', 'icon name', 'baselayer-icons'),
		'check-circle'           => _x('Check circle', 'icon name', 'baselayer-icons'),
		'close'                  => _x('Close', 'icon name', 'baselayer-icons'),
		'cancel'                 => _x('Cancel', 'icon name', 'baselayer-icons'),
		'block'                  => _x('Block', 'icon name', 'baselayer-icons'),
		'delete'                 => _x('Delete', 'icon name', 'baselayer-icons'),
		'delete-forever'         => _x('Delete forever', 'icon name', 'baselayer-icons'),
		'restore'                => _x('Restore', 'icon name', 'baselayer-icons'),
		'copy'                   => _x('Copy', 'icon name', 'baselayer-icons'),
		'save'                   => _x('Save', 'icon name', 'baselayer-icons'),
		'save-as'                => _x('Save as', 'icon name', 'baselayer-icons'),
		'download'               => _x('Download', 'icon name', 'baselayer-icons'),
		'download-alt'           => _x('Download', 'icon name', 'baselayer-icons'),
		'upload'                 => _x('Upload', 'icon name', 'baselayer-icons'),
		'upload-alt'             => _x('Upload', 'icon name', 'baselayer-icons'),
		'upgrade'                => _x('Upgrade', 'icon name', 'baselayer-icons'),
		'print'                  => _x('Print', 'icon name', 'baselayer-icons'),
		'attachment'             => _x('Attachment', 'icon name', 'baselayer-icons'),
		'attachment-alt'         => _x('Attachment', 'icon name', 'baselayer-icons'),
		'search'                 => _x('Search', 'icon name', 'baselayer-icons'),
		'select'                 => _x('Select', 'icon name', 'baselayer-icons'),
		'select-all'             => _x('Select all', 'icon name', 'baselayer-icons'),
		'zoom-in'                => _x('Zoom in', 'icon name', 'baselayer-icons'),
		'zoom-out'               => _x('Zoom out', 'icon name', 'baselayer-icons'),
		'crop'                   => _x('Crop', 'icon name', 'baselayer-icons'),
		'refresh'                => _x('Refresh', 'icon name', 'baselayer-icons'),
		'sync'                   => _x('Sync', 'icon name', 'baselayer-icons'),
		'undo'                   => _x('Undo', 'icon name', 'baselayer-icons'),
		'redo'                   => _x('Redo', 'icon name', 'baselayer-icons'),
		'drag'                   => _x('Drag indicator', 'icon name', 'baselayer-icons'),
		'drag-handle'            => _x('Drag handle', 'icon name', 'baselayer-icons'),
		'compare-text'           => _x('Compare text', 'icon name', 'baselayer-icons'),
		'text-snippet'           => _x('Text snippet', 'icon name', 'baselayer-icons'),
		'resize'                 => _x('Resize', 'icon name', 'baselayer-icons'),
		'swipe-left-right'       => _x('Swipe left/right', 'icon name', 'baselayer-icons'),
		'swipe-up-down'          => _x('Swipe up/down', 'icon name', 'baselayer-icons'),
		'content-cut'            => _x('Cut', 'icon name', 'baselayer-icons'),
		'signature'              => _x('Signature', 'icon name', 'baselayer-icons'),

		// Editing & text.
		'edit'                   => _x('Edit', 'icon name', 'baselayer-icons'),
		'edit-text'              => _x('Edit text', 'icon name', 'baselayer-icons'),
		'edit-document'          => _x('Edit document', 'icon name', 'baselayer-icons'),
		'document'               => _x('Document', 'icon name', 'baselayer-icons'),
		'document-text'          => _x('Text document', 'icon name', 'baselayer-icons'),
		'article'                => _x('Article', 'icon name', 'baselayer-icons'),
		'clipboard'              => _x('Clipboard', 'icon name', 'baselayer-icons'),
		'abc'                    => _x('Letters', 'icon name', 'baselayer-icons'),
		'123'                    => _x('Numbers', 'icon name', 'baselayer-icons'),
		'translate'              => _x('Translate', 'icon name', 'baselayer-icons'),
		'language'               => _x('Language', 'icon name', 'baselayer-icons'),
		'code'                   => _x('Code', 'icon name', 'baselayer-icons'),
		'code-slash'             => _x('Code slash', 'icon name', 'baselayer-icons'),
		'symbols'                => _x('Symbols', 'icon name', 'baselayer-icons'),
		'symbol-sum'             => _x('Sum symbol', 'icon name', 'baselayer-icons'),
		'asterix'                => _x('Asterisk', 'icon name', 'baselayer-icons'),
		'document-person'        => _x('Document person', 'icon name', 'baselayer-icons'),
		'document-scan'          => _x('Document scan', 'icon name', 'baselayer-icons'),
		'two-pager'              => _x('Two pager', 'icon name', 'baselayer-icons'),
		'book'                   => _x('Book', 'icon name', 'baselayer-icons'),
		'book-open'              => _x('Book open', 'icon name', 'baselayer-icons'),
		'web-stories'            => _x('Web stories', 'icon name', 'baselayer-icons'),
		'web-stories-stack'      => _x('Web stories stack', 'icon name', 'baselayer-icons'),
		'edit-square'            => _x('Edit square', 'icon name', 'baselayer-icons'),
		'menu-book'              => _x('Menu book', 'icon name', 'baselayer-icons'),

		// Rich text.
		'text-format'             => _x('Text format', 'icon name', 'baselayer-icons'),
		'bold'                    => _x('Bold', 'icon name', 'baselayer-icons'),
		'italic'                  => _x('Italic', 'icon name', 'baselayer-icons'),
		'underlined'              => _x('Underline', 'icon name', 'baselayer-icons'),
		'strikethrough'           => _x('Strikethrough', 'icon name', 'baselayer-icons'),
		'align-left'              => _x('Align left', 'icon name', 'baselayer-icons'),
		'align-center'            => _x('Align center', 'icon name', 'baselayer-icons'),
		'align-right'             => _x('Align right', 'icon name', 'baselayer-icons'),
		'align-justify'           => _x('Justify', 'icon name', 'baselayer-icons'),
		'align-horizontal-left'   => _x('Align horizontal left', 'icon name', 'baselayer-icons'),
		'align-horizontal-center' => _x('Align horizontal center', 'icon name', 'baselayer-icons'),
		'align-horizontal-right'  => _x('Align horizontal right', 'icon name', 'baselayer-icons'),
		'horizontal-align-left'   => _x('Horizontal align left', 'icon name', 'baselayer-icons'),
		'horizontal-align-right'  => _x('Horizontal align right', 'icon name', 'baselayer-icons'),
		'horizontal-align-center' => _x('Horizontal align center', 'icon name', 'baselayer-icons'),
		'vertical-align-center'   => _x('Vertical align center', 'icon name', 'baselayer-icons'),
		'vertical-align-top'      => _x('Vertical align top', 'icon name', 'baselayer-icons'),
		'vertical-align-bottom'   => _x('Vertical align bottom', 'icon name', 'baselayer-icons'),
		'list-bulleted'           => _x('Bulleted list', 'icon name', 'baselayer-icons'),
		'list-numbered'           => _x('Numbered list', 'icon name', 'baselayer-icons'),
		'list-numbered-rtl'       => _x('Numbered list (RTL)', 'icon name', 'baselayer-icons'),
		'checklist'               => _x('Checklist', 'icon name', 'baselayer-icons'),
		'checklist-rtl'           => _x('Checklist (RTL)', 'icon name', 'baselayer-icons'),
		'horizontal-rule'         => _x('Horizontal rule', 'icon name', 'baselayer-icons'),
		'list-alt'                => _x('List', 'icon name', 'baselayer-icons'),
		'list'                    => _x('List', 'icon name', 'baselayer-icons'),
		'indent-decrease'         => _x('Decrease indent', 'icon name', 'baselayer-icons'),
		'indent-increase'         => _x('Increase indent', 'icon name', 'baselayer-icons'),
		'line-spacing'            => _x('Line spacing', 'icon name', 'baselayer-icons'),
		'arrow-up-down'           => _x('Arrow up down', 'icon name', 'baselayer-icons'),
		'letter-spacing'          => _x('Letter spacing', 'icon name', 'baselayer-icons'),
		'format-size'             => _x('Font size', 'icon name', 'baselayer-icons'),
		'text-decrease'           => _x('Decrease text size', 'icon name', 'baselayer-icons'),
		'text-increase'           => _x('Increase text size', 'icon name', 'baselayer-icons'),
		'text-short'              => _x('Short text', 'icon name', 'baselayer-icons'),
		'color-text'              => _x('Text color', 'icon name', 'baselayer-icons'),
		'color-fill'              => _x('Highlight color', 'icon name', 'baselayer-icons'),
		'highlight'               => _x('Highlight', 'icon name', 'baselayer-icons'),
		'border-color'            => _x('Border color', 'icon name', 'baselayer-icons'),
		'color-reset'             => _x('Clear formatting', 'icon name', 'baselayer-icons'),
		'format-clear'            => _x('Clear format', 'icon name', 'baselayer-icons'),
		'link'                    => _x('Link', 'icon name', 'baselayer-icons'),
		'link-off'                => _x('Unlink', 'icon name', 'baselayer-icons'),
		'image-left-text'         => _x('Image left, text', 'icon name', 'baselayer-icons'),
		'image-right-text'        => _x('Image right, text', 'icon name', 'baselayer-icons'),
		'image-center'            => _x('Image center', 'icon name', 'baselayer-icons'),
		'image-center-text'       => _x('Image center, text', 'icon name', 'baselayer-icons'),
		'quote'                   => _x('Quote', 'icon name', 'baselayer-icons'),
		'paragraph'               => _x('Paragraph', 'icon name', 'baselayer-icons'),
		'code-block'              => _x('Code block', 'icon name', 'baselayer-icons'),
		'table-chart'             => _x('Table chart', 'icon name', 'baselayer-icons'),
		'table-edit'              => _x('Edit table', 'icon name', 'baselayer-icons'),
		'combine-columns'         => _x('Combine columns', 'icon name', 'baselayer-icons'),
		'combine-rows'            => _x('Combine rows', 'icon name', 'baselayer-icons'),
		'add-column-left'         => _x('Add column left', 'icon name', 'baselayer-icons'),
		'add-column-right'        => _x('Add column right', 'icon name', 'baselayer-icons'),
		'add-row-above'           => _x('Add row above', 'icon name', 'baselayer-icons'),
		'add-row-below'           => _x('Add row below', 'icon name', 'baselayer-icons'),
		'text'                    => _x('Text', 'icon name', 'baselayer-icons'),
		'clear-all'               => _x('Clear all', 'icon name', 'baselayer-icons'),

		// Communication.
		'chat'                   => _x('Chat', 'icon name', 'baselayer-icons'),
		'chat-dots'              => _x('Chat (dots)', 'icon name', 'baselayer-icons'),
		'chat-text'              => _x('Chat (text)', 'icon name', 'baselayer-icons'),
		'forum'                  => _x('Forum', 'icon name', 'baselayer-icons'),
		'comic-bubble'           => _x('Comic bubble', 'icon name', 'baselayer-icons'),
		'mail'                   => _x('Email', 'icon name', 'baselayer-icons'),
		'inbox'                  => _x('Inbox', 'icon name', 'baselayer-icons'),
		'inbox-text'             => _x('Inbox text', 'icon name', 'baselayer-icons'),
		'email-open'             => _x('Open email', 'icon name', 'baselayer-icons'),
		'at-character'           => _x('At character', 'icon name', 'baselayer-icons'),
		'email-stacked'          => _x('Stacked email', 'icon name', 'baselayer-icons'),
		'email-unread'           => _x('Unread email', 'icon name', 'baselayer-icons'),
		'phone'                  => _x('Phone', 'icon name', 'baselayer-icons'),
		'voicemail'              => _x('Voicemail', 'icon name', 'baselayer-icons'),
		'send'                   => _x('Send', 'icon name', 'baselayer-icons'),
		'megaphone'              => _x('Megaphone', 'icon name', 'baselayer-icons'),
		'chat-edit'              => _x('Chat edit', 'icon name', 'baselayer-icons'),
		'chat-dashed'            => _x('Chat (dashed)', 'icon name', 'baselayer-icons'),

		// Social & feedback.
		'heart'                  => _x('Heart', 'icon name', 'baselayer-icons'),
		'star'                   => _x('Star', 'icon name', 'baselayer-icons'),
		'star-half'              => _x('Star (half)', 'icon name', 'baselayer-icons'),
		'star-filled'            => _x('Star (filled)', 'icon name', 'baselayer-icons'),
		'stars-sparkle'          => _x('Stars sparkle', 'icon name', 'baselayer-icons'),
		'star-kid'               => _x('Kids star', 'icon name', 'baselayer-icons'),
		'star-award'             => _x('Award star', 'icon name', 'baselayer-icons'),
		'stars'                  => _x('Stars', 'icon name', 'baselayer-icons'),
		'trophy'                 => _x('Trophy', 'icon name', 'baselayer-icons'),
		'thumb-up'               => _x('Thumbs up', 'icon name', 'baselayer-icons'),
		'thumb-down'             => _x('Thumbs down', 'icon name', 'baselayer-icons'),
		'thumb-up-down'          => _x('Thumbs up/down', 'icon name', 'baselayer-icons'),
		'bookmark'               => _x('Bookmark', 'icon name', 'baselayer-icons'),
		'smiley-happy'           => _x('Happy face', 'icon name', 'baselayer-icons'),
		'smiley-neutral'         => _x('Neutral face', 'icon name', 'baselayer-icons'),
		'smiley-sad'             => _x('Sad face', 'icon name', 'baselayer-icons'),
		'share'                  => _x('Share', 'icon name', 'baselayer-icons'),
		'share-social'           => _x('Share (social)', 'icon name', 'baselayer-icons'),
		'rss'                    => _x('RSS', 'icon name', 'baselayer-icons'),
		'flag-waving'            => _x('Flag', 'icon name', 'baselayer-icons'),
		'flag'                   => _x('Flag', 'icon name', 'baselayer-icons'),
		'bookmark-heart'         => _x('Bookmark heart', 'icon name', 'baselayer-icons'),
		'bookmark-stacks'        => _x('Bookmark stacks', 'icon name', 'baselayer-icons'),
		'celebration'            => _x('Celebration', 'icon name', 'baselayer-icons'),
		'cheer'                  => _x('Cheer', 'icon name', 'baselayer-icons'),
		'badge'                  => _x('ID badge', 'icon name', 'baselayer-icons'),
		'smiley'                 => _x('Smiley', 'icon name', 'baselayer-icons'),

		// Media.
		'image'                  => _x('Image', 'icon name', 'baselayer-icons'),
		'image-left'             => _x('Image left', 'icon name', 'baselayer-icons'),
		'image-right'            => _x('Image right', 'icon name', 'baselayer-icons'),
		'images'                 => _x('Images', 'icon name', 'baselayer-icons'),
		'landscape'              => _x('Landscape', 'icon name', 'baselayer-icons'),
		'camera'                 => _x('Camera', 'icon name', 'baselayer-icons'),
		'videocam'               => _x('Video camera', 'icon name', 'baselayer-icons'),
		'carousel'               => _x('Carousel', 'icon name', 'baselayer-icons'),
		'movie'                  => _x('Movie', 'icon name', 'baselayer-icons'),
		'split-scene'            => _x('Split scene', 'icon name', 'baselayer-icons'),
		'split-scene-top'        => _x('Split scene top', 'icon name', 'baselayer-icons'),
		'pan-zoom'               => _x('Pan zoom', 'icon name', 'baselayer-icons'),
		'pinch-zoom-in'          => _x('Pinch zoom in', 'icon name', 'baselayer-icons'),
		'pinch-zoom-out'         => _x('Pinch zoom out', 'icon name', 'baselayer-icons'),
		'play'                   => _x('Play', 'icon name', 'baselayer-icons'),
		'play-circle'            => _x('Play (circle)', 'icon name', 'baselayer-icons'),
		'play-box'               => _x('Play (box)', 'icon name', 'baselayer-icons'),
		'pause'                  => _x('Pause', 'icon name', 'baselayer-icons'),
		'stop'                   => _x('Stop', 'icon name', 'baselayer-icons'),
		'skip-next'              => _x('Skip next', 'icon name', 'baselayer-icons'),
		'skip-prev'              => _x('Skip previous', 'icon name', 'baselayer-icons'),
		'music'                  => _x('Music', 'icon name', 'baselayer-icons'),
		'music-note'             => _x('Music note', 'icon name', 'baselayer-icons'),
		'headphones'             => _x('Headphones', 'icon name', 'baselayer-icons'),
		'volume-mute'            => _x('Volume mute', 'icon name', 'baselayer-icons'),
		'volume-down'            => _x('Volume down', 'icon name', 'baselayer-icons'),
		'volume-up'              => _x('Volume up', 'icon name', 'baselayer-icons'),
		'volume-off'             => _x('Volume off', 'icon name', 'baselayer-icons'),
		'image-broken'           => _x('Broken image', 'icon name', 'baselayer-icons'),
		'colors'                 => _x('Colors', 'icon name', 'baselayer-icons'),

		// Files & storage.
		'folder'                 => _x('Folder', 'icon name', 'baselayer-icons'),
		'folder-open'            => _x('Open folder', 'icon name', 'baselayer-icons'),
		'folder-zip'             => _x('Zip folder', 'icon name', 'baselayer-icons'),
		'file-audio'             => _x('Audio file', 'icon name', 'baselayer-icons'),
		'file-video'             => _x('Video file', 'icon name', 'baselayer-icons'),
		'file-attachment'        => _x('File attachment', 'icon name', 'baselayer-icons'),
		'file-pdf'               => _x('PDF file', 'icon name', 'baselayer-icons'),
		'database'               => _x('Database', 'icon name', 'baselayer-icons'),
		'cloud'                  => _x('Cloud', 'icon name', 'baselayer-icons'),
		'backup'                 => _x('Backup', 'icon name', 'baselayer-icons'),
		'archive'                => _x('Archive', 'icon name', 'baselayer-icons'),
		'folder-stacked'         => _x('Copy folder', 'icon name', 'baselayer-icons'),

		// Analytics & data.
		'chart-pie'              => _x('Pie chart', 'icon name', 'baselayer-icons'),
		'chart-bar'              => _x('Bar chart', 'icon name', 'baselayer-icons'),
		'chart-bar-alt'          => _x('Bar chart', 'icon name', 'baselayer-icons'),
		'chart-line-bar'         => _x('Chart line bar', 'icon name', 'baselayer-icons'),
		'chart-data'             => _x('Data chart', 'icon name', 'baselayer-icons'),
		'chart-stacked'          => _x('Stacked chart', 'icon name', 'baselayer-icons'),
		'trending-up'            => _x('Trending up', 'icon name', 'baselayer-icons'),
		'trending-down'          => _x('Trending down', 'icon name', 'baselayer-icons'),
		'timeline'               => _x('Timeline', 'icon name', 'baselayer-icons'),
		'dashboard'              => _x('Dashboard', 'icon name', 'baselayer-icons'),
		'dashboard-alt'          => _x('Dashboard', 'icon name', 'baselayer-icons'),
		'data-table'             => _x('Data table', 'icon name', 'baselayer-icons'),
		'table'                  => _x('Table', 'icon name', 'baselayer-icons'),
		'analytics'              => _x('Analytics', 'icon name', 'baselayer-icons'),
		'chart-area'             => _x('Area chart', 'icon name', 'baselayer-icons'),
		'chart-bubble'           => _x('Bubble chart', 'icon name', 'baselayer-icons'),
		'chart-line'             => _x('Line chart', 'icon name', 'baselayer-icons'),
		'chart-line-alt'         => _x('Line chart', 'icon name', 'baselayer-icons'),
		'leaderboard'            => _x('Leaderboard', 'icon name', 'baselayer-icons'),
		'scoreboard'             => _x('Scoreboard', 'icon name', 'baselayer-icons'),

		// Layout & blocks.
		'grid'                   => _x('Grid', 'icon name', 'baselayer-icons'),
		'grid-3x3'               => _x('Grid 3×3', 'icon name', 'baselayer-icons'),
		'grid-4x4'               => _x('Grid 4×4', 'icon name', 'baselayer-icons'),
		'list-box'               => _x('List box', 'icon name', 'baselayer-icons'),
		'view-column'            => _x('Column view', 'icon name', 'baselayer-icons'),
		'view-comfy'             => _x('Comfy view', 'icon name', 'baselayer-icons'),
		'view-grid'              => _x('Grid view', 'icon name', 'baselayer-icons'),
		'view-grid-alt'          => _x('Grid view', 'icon name', 'baselayer-icons'),
		'view-list'              => _x('List view', 'icon name', 'baselayer-icons'),
		'layers'                 => _x('Layers', 'icon name', 'baselayer-icons'),
		'layout-section'         => _x('Layout section', 'icon name', 'baselayer-icons'),
		'category'               => _x('Category', 'icon name', 'baselayer-icons'),
		'style'                  => _x('Style', 'icon name', 'baselayer-icons'),
		'brick'                  => _x('Brick', 'icon name', 'baselayer-icons'),
		'widgets'                => _x('Widgets', 'icon name', 'baselayer-icons'),
		'cards'                  => _x('Cards', 'icon name', 'baselayer-icons'),
		'stacks'                 => _x('Stacks', 'icon name', 'baselayer-icons'),
		'aspect-ratio'           => _x('Aspect ratio', 'icon name', 'baselayer-icons'),
		'toolbar'                => _x('Toolbar', 'icon name', 'baselayer-icons'),
		'call-to-action'         => _x('Call to action', 'icon name', 'baselayer-icons'),

		// Commerce, finance & legal.
		'shopping-cart'          => _x('Shopping cart', 'icon name', 'baselayer-icons'),
		'shopping-cart-off'      => _x('Cart off', 'icon name', 'baselayer-icons'),
		'shopping-cart-add'      => _x('Add to cart', 'icon name', 'baselayer-icons'),
		'shopping-cart-remove'   => _x('Remove from cart', 'icon name', 'baselayer-icons'),
		'shopping-basket'        => _x('Shopping basket', 'icon name', 'baselayer-icons'),
		'shopping-bag'           => _x('Shopping bag', 'icon name', 'baselayer-icons'),
		'package'                => _x('Package', 'icon name', 'baselayer-icons'),
		'sell-tag'               => _x('Sell tag', 'icon name', 'baselayer-icons'),
		'contactless'            => _x('Contactless', 'icon name', 'baselayer-icons'),
		'credit-card'            => _x('Credit card', 'icon name', 'baselayer-icons'),
		'payment-card'           => _x('Payment card', 'icon name', 'baselayer-icons'),
		'payments'               => _x('Payments', 'icon name', 'baselayer-icons'),
		'finance-chip'           => _x('Finance chip', 'icon name', 'baselayer-icons'),
		'atm'                    => _x('ATM', 'icon name', 'baselayer-icons'),
		'receipt'                => _x('Receipt', 'icon name', 'baselayer-icons'),
		'checkbook'              => _x('Checkbook', 'icon name', 'baselayer-icons'),
		'wallet'                 => _x('Wallet', 'icon name', 'baselayer-icons'),
		'wallet-alt'             => _x('Wallet', 'icon name', 'baselayer-icons'),
		'money-bag'              => _x('Money bag', 'icon name', 'baselayer-icons'),
		'savings'                => _x('Savings', 'icon name', 'baselayer-icons'),
		'bank'                   => _x('Bank', 'icon name', 'baselayer-icons'),
		'dollar-circle'          => _x('Dollar circle', 'icon name', 'baselayer-icons'),
		'universal-currency'     => _x('Universal currency', 'icon name', 'baselayer-icons'),
		'currency-exchange'      => _x('Currency exchange', 'icon name', 'baselayer-icons'),
		'currency-dollar'        => _x('Dollar', 'icon name', 'baselayer-icons'),
		'currency-euro'          => _x('Euro', 'icon name', 'baselayer-icons'),
		'currency-pound'         => _x('Pound', 'icon name', 'baselayer-icons'),
		'currency-yen'           => _x('Yen', 'icon name', 'baselayer-icons'),
		'currency-franc'         => _x('Franc', 'icon name', 'baselayer-icons'),
		'currency-lira'          => _x('Lira', 'icon name', 'baselayer-icons'),
		'currency-ruble'         => _x('Ruble', 'icon name', 'baselayer-icons'),
		'currency-rupee'         => _x('Rupee', 'icon name', 'baselayer-icons'),
		'currency-yuan'          => _x('Yuan', 'icon name', 'baselayer-icons'),
		'currency-bitcoin'       => _x('Bitcoin', 'icon name', 'baselayer-icons'),
		'handshake'              => _x('Handshake', 'icon name', 'baselayer-icons'),
		'contract'               => _x('Contract', 'icon name', 'baselayer-icons'),
		'contract-sign'          => _x('Sign contract', 'icon name', 'baselayer-icons'),
		'gavel'                  => _x('Gavel', 'icon name', 'baselayer-icons'),
		'balance'                => _x('Balance', 'icon name', 'baselayer-icons'),
		'license'                => _x('License', 'icon name', 'baselayer-icons'),
		'license-off'            => _x('Unlicensed', 'icon name', 'baselayer-icons'),
		'copyright'              => _x('Copyright', 'icon name', 'baselayer-icons'),
		// Payment brands (proper nouns; not translated).
		'visa'                   => _x('Visa', 'icon name', 'baselayer-icons'),
		'mastercard'             => _x('Mastercard', 'icon name', 'baselayer-icons'),
		'paypal'                 => _x('PayPal', 'icon name', 'baselayer-icons'),
		'apple-pay'              => _x('Apple Pay', 'icon name', 'baselayer-icons'),
		'googlepay'              => _x('Google Pay', 'icon name', 'baselayer-icons'),
		'klarna'                 => _x('Klarna', 'icon name', 'baselayer-icons'),

		// People & accounts.
		'account-circle'         => _x('Account circle', 'icon name', 'baselayer-icons'),
		'account'                => _x('Account', 'icon name', 'baselayer-icons'),
		'group'                  => _x('Group', 'icon name', 'baselayer-icons'),
		'face'                   => _x('Face', 'icon name', 'baselayer-icons'),
		'face-male'              => _x('Face male', 'icon name', 'baselayer-icons'),
		'face-female'            => _x('Face (female)', 'icon name', 'baselayer-icons'),
		'id-card'                => _x('ID card', 'icon name', 'baselayer-icons'),
		'gender-male'            => _x('Male', 'icon name', 'baselayer-icons'),
		'gender-female'          => _x('Female', 'icon name', 'baselayer-icons'),
		'man'                    => _x('Man', 'icon name', 'baselayer-icons'),
		'woman'                  => _x('Woman', 'icon name', 'baselayer-icons'),
		'pregnant-woman'         => _x('Pregnant woman', 'icon name', 'baselayer-icons'),
		'accessibility'          => _x('Accessibility', 'icon name', 'baselayer-icons'),
		'wheelchair'             => _x('Wheelchair', 'icon name', 'baselayer-icons'),
		'account-box'            => _x('Account box', 'icon name', 'baselayer-icons'),
		'passport'               => _x('Passport', 'icon name', 'baselayer-icons'),
		'sign-language'          => _x('Sign language', 'icon name', 'baselayer-icons'),

		// Maps & places.
		'map'                    => _x('Map', 'icon name', 'baselayer-icons'),
		'map-search'             => _x('Map search', 'icon name', 'baselayer-icons'),
		'map-pin'                => _x('Location', 'icon name', 'baselayer-icons'),
		'location'               => _x('Locate', 'icon name', 'baselayer-icons'),
		'location-off'           => _x('Locate off', 'icon name', 'baselayer-icons'),
		'pin'                    => _x('Pin', 'icon name', 'baselayer-icons'),
		'map-pin-drop'           => _x('Pin', 'icon name', 'baselayer-icons'),
		'map-pin-circle'         => _x('Pin circle', 'icon name', 'baselayer-icons'),
		'pin-off'                => _x('Pin off', 'icon name', 'baselayer-icons'),
		'map-pin-add'            => _x('Add location', 'icon name', 'baselayer-icons'),
		'map-pin-heart'          => _x('Location heart', 'icon name', 'baselayer-icons'),
		'compass'                => _x('Compass', 'icon name', 'baselayer-icons'),
		'navigation'             => _x('Navigation', 'icon name', 'baselayer-icons'),
		'navigation-circle'      => _x('Navigation', 'icon name', 'baselayer-icons'),
		'navigation-rotated'     => _x('My location', 'icon name', 'baselayer-icons'),
		'my-location'            => _x('My location', 'icon name', 'baselayer-icons'),
		'nearby'                 => _x('Nearby', 'icon name', 'baselayer-icons'),
		'recenter'               => _x('Recenter', 'icon name', 'baselayer-icons'),
		'signpost'               => _x('Signpost', 'icon name', 'baselayer-icons'),
		'globe'                  => _x('Globe', 'icon name', 'baselayer-icons'),
		'globe-america'          => _x('Globe (Americas)', 'icon name', 'baselayer-icons'),
		'globe-asia'             => _x('Globe (Asia)', 'icon name', 'baselayer-icons'),
		'walk'                   => _x('Walk', 'icon name', 'baselayer-icons'),
		'footprint'              => _x('Footprint', 'icon name', 'baselayer-icons'),
		'bicycle'                => _x('Bicycle', 'icon name', 'baselayer-icons'),
		'moped'                  => _x('Moped', 'icon name', 'baselayer-icons'),
		'car'                    => _x('Car', 'icon name', 'baselayer-icons'),
		'parking'                => _x('Parking', 'icon name', 'baselayer-icons'),
		'traffic-light'          => _x('Traffic light', 'icon name', 'baselayer-icons'),
		'train'                  => _x('Train', 'icon name', 'baselayer-icons'),
		'ship'                   => _x('Ship', 'icon name', 'baselayer-icons'),
		'sailing'                => _x('Sailing', 'icon name', 'baselayer-icons'),
		'anchor'                 => _x('Anchor', 'icon name', 'baselayer-icons'),
		'plane'                  => _x('Airplane', 'icon name', 'baselayer-icons'),
		'hotel'                  => _x('Hotel', 'icon name', 'baselayer-icons'),

		// Devices & interaction.
		'devices'                => _x('Devices', 'icon name', 'baselayer-icons'),
		'device-fold'            => _x('Foldable device', 'icon name', 'baselayer-icons'),
		'wearables'              => _x('Wearables', 'icon name', 'baselayer-icons'),
		'mobile'                 => _x('Mobile', 'icon name', 'baselayer-icons'),
		'mobile-alt'             => _x('Mobile', 'icon name', 'baselayer-icons'),
		'mobile-rotate'          => _x('Rotate mobile', 'icon name', 'baselayer-icons'),
		'tablet'                 => _x('Tablet', 'icon name', 'baselayer-icons'),
		'battery-full'           => _x('Battery full', 'icon name', 'baselayer-icons'),
		'battery-half'           => _x('Battery half', 'icon name', 'baselayer-icons'),
		'battery-low'            => _x('Battery low', 'icon name', 'baselayer-icons'),
		'radio'                  => _x('Radio', 'icon name', 'baselayer-icons'),
		'laptop'                 => _x('Laptop', 'icon name', 'baselayer-icons'),
		'laptop-alt'             => _x('Laptop', 'icon name', 'baselayer-icons'),
		'monitor'                => _x('Monitor', 'icon name', 'baselayer-icons'),
		'tv'                     => _x('TV', 'icon name', 'baselayer-icons'),
		'power'                  => _x('Power', 'icon name', 'baselayer-icons'),
		'power-unplugged'        => _x('Power unplugged', 'icon name', 'baselayer-icons'),
		'power-off'              => _x('Power off', 'icon name', 'baselayer-icons'),
		'power-off-circle'       => _x('Power off circle', 'icon name', 'baselayer-icons'),
		'mouse'                  => _x('Mouse', 'icon name', 'baselayer-icons'),
		'pointer'                => _x('Pointer', 'icon name', 'baselayer-icons'),
		'touch'                  => _x('Touch', 'icon name', 'baselayer-icons'),
		'click-circles'          => _x('Click', 'icon name', 'baselayer-icons'),
		'click'                  => _x('Click', 'icon name', 'baselayer-icons'),
		'click-left'             => _x('Click left', 'icon name', 'baselayer-icons'),
		'click-right'            => _x('Click right', 'icon name', 'baselayer-icons'),
		'barcode'                => _x('Barcode', 'icon name', 'baselayer-icons'),
		'barcode-scan'           => _x('Barcode scan', 'icon name', 'baselayer-icons'),
		'qr-code'                => _x('QR code', 'icon name', 'baselayer-icons'),
		'qr-code-alt'            => _x('QR code', 'icon name', 'baselayer-icons'),
		'qr-code-scan'           => _x('QR code scan', 'icon name', 'baselayer-icons'),
		'keyboard'               => _x('Keyboard', 'icon name', 'baselayer-icons'),
		'keyboard-capslock'      => _x('Caps lock', 'icon name', 'baselayer-icons'),
		'trackpad-input'         => _x('Trackpad', 'icon name', 'baselayer-icons'),
		'vr-headset'             => _x('VR headset', 'icon name', 'baselayer-icons'),
		'headset'                => _x('Headset', 'icon name', 'baselayer-icons'),
		'wifi'                   => _x('Wi‑Fi', 'icon name', 'baselayer-icons'),
		'wifi-off'               => _x('Wi‑Fi off', 'icon name', 'baselayer-icons'),
		'dns'                    => _x('DNS', 'icon name', 'baselayer-icons'),
		'videogame'              => _x('Videogame', 'icon name', 'baselayer-icons'),
		'joystick'               => _x('Joystick', 'icon name', 'baselayer-icons'),

		// Security & privacy.
		'lock'                   => _x('Lock', 'icon name', 'baselayer-icons'),
		'lock-open'              => _x('Unlock', 'icon name', 'baselayer-icons'),
		'key'                    => _x('Key', 'icon name', 'baselayer-icons'),
		'cookie'                 => _x('Cookie', 'icon name', 'baselayer-icons'),
		'login'                  => _x('Login', 'icon name', 'baselayer-icons'),
		'logout'                 => _x('Logout', 'icon name', 'baselayer-icons'),
		'shield'                 => _x('Shield', 'icon name', 'baselayer-icons'),
		'shield-check'           => _x('Shield check', 'icon name', 'baselayer-icons'),
		'shield-lock'            => _x('Shield lock', 'icon name', 'baselayer-icons'),
		'shield-security'        => _x('Security shield', 'icon name', 'baselayer-icons'),
		'cctv'                   => _x('CCTV', 'icon name', 'baselayer-icons'),
		'shield-star'            => _x('Shield star', 'icon name', 'baselayer-icons'),
		'siren'                  => _x('Siren', 'icon name', 'baselayer-icons'),
		'emergency'              => _x('Emergency', 'icon name', 'baselayer-icons'),
		'alarm'                  => _x('Alarm', 'icon name', 'baselayer-icons'),
		'verified'               => _x('Verified', 'icon name', 'baselayer-icons'),
		'cookie-off'             => _x('Cookie off', 'icon name', 'baselayer-icons'),
		'fingerprint'            => _x('Fingerprint', 'icon name', 'baselayer-icons'),
		'password'               => _x('Password', 'icon name', 'baselayer-icons'),
		'shield-info'            => _x('Shield info', 'icon name', 'baselayer-icons'),

		// Controls & settings.
		'settings'               => _x('Settings', 'icon name', 'baselayer-icons'),
		'tune'                   => _x('Tune', 'icon name', 'baselayer-icons'),
		'tune-alt'               => _x('Tune', 'icon name', 'baselayer-icons'),
		'wrench'                 => _x('Wrench', 'icon name', 'baselayer-icons'),
		'sort'                   => _x('Sort', 'icon name', 'baselayer-icons'),
		'sort-by-alpha'          => _x('Sort alphabetically', 'icon name', 'baselayer-icons'),
		'filter'                 => _x('Filter', 'icon name', 'baselayer-icons'),
		'filter-off'             => _x('Filter off', 'icon name', 'baselayer-icons'),
		'filter-alt'             => _x('Filter', 'icon name', 'baselayer-icons'),
		'filter-alt-off'         => _x('Filter off', 'icon name', 'baselayer-icons'),
		'checkbox'               => _x('Checkbox', 'icon name', 'baselayer-icons'),
		'checkbox-checked'       => _x('Checkbox checked', 'icon name', 'baselayer-icons'),
		'checkbox-indeterminate' => _x('Checkbox indeterminate', 'icon name', 'baselayer-icons'),
		'radio-button'           => _x('Radio button', 'icon name', 'baselayer-icons'),
		'radio-button-checked'   => _x('Radio button checked', 'icon name', 'baselayer-icons'),
		'radio-button-partial'   => _x('Radio button partial', 'icon name', 'baselayer-icons'),
		'toggle-off'             => _x('Toggle off', 'icon name', 'baselayer-icons'),
		'toggle-on'              => _x('Toggle on', 'icon name', 'baselayer-icons'),
		'dropdown'               => _x('Dropdown', 'icon name', 'baselayer-icons'),
		'visibility'             => _x('Visibility', 'icon name', 'baselayer-icons'),
		'visibility-off'         => _x('Visibility off', 'icon name', 'baselayer-icons'),
		'mode-light'             => _x('Light mode', 'icon name', 'baselayer-icons'),
		'mode-dark'              => _x('Dark mode', 'icon name', 'baselayer-icons'),
		'moon'                   => _x('Moon', 'icon name', 'baselayer-icons'),
		'moon-stars'             => _x('Moon and stars', 'icon name', 'baselayer-icons'),
		'hide'                   => _x('Hide', 'icon name', 'baselayer-icons'),

		// Status & time.
		'info'                     => _x('Info', 'icon name', 'baselayer-icons'),
		'info-alt'                 => _x('Info', 'icon name', 'baselayer-icons'),
		'help'                     => _x('Help', 'icon name', 'baselayer-icons'),
		'warning'                  => _x('Warning', 'icon name', 'baselayer-icons'),
		'error'                    => _x('Error', 'icon name', 'baselayer-icons'),
		'notifications'            => _x('Notifications', 'icon name', 'baselayer-icons'),
		'notification-unread'      => _x('Unread notification', 'icon name', 'baselayer-icons'),
		'clock'                    => _x('Clock', 'icon name', 'baselayer-icons'),
		'clock-alt'                => _x('Clock', 'icon name', 'baselayer-icons'),
		'watch'                    => _x('Watch', 'icon name', 'baselayer-icons'),
		'watch-text'               => _x('Watch', 'icon name', 'baselayer-icons'),
		'history'                  => _x('History', 'icon name', 'baselayer-icons'),
		'hourglass'                => _x('Hourglass', 'icon name', 'baselayer-icons'),
		'calendar'                 => _x('Calendar (blank)', 'icon name', 'baselayer-icons'),
		'calendar-month'           => _x('Calendar', 'icon name', 'baselayer-icons'),
		'calendar-text'            => _x('Calendar (text)', 'icon name', 'baselayer-icons'),
		'calendar-x'               => _x('Calendar (x)', 'icon name', 'baselayer-icons'),
		'timer'                    => _x('Timer', 'icon name', 'baselayer-icons'),
		'speed-high'               => _x('High speed', 'icon name', 'baselayer-icons'),
		'speed-low'                => _x('Low speed', 'icon name', 'baselayer-icons'),

		// Weather.
		'sunny'                    => _x('Sunny', 'icon name', 'baselayer-icons'),
		'rain'                     => _x('Rain', 'icon name', 'baselayer-icons'),
		'thunderstorm'             => _x('Thunderstorm', 'icon name', 'baselayer-icons'),
		'snowy'                    => _x('Snowy', 'icon name', 'baselayer-icons'),
		'snowflake'                => _x('Snowflake', 'icon name', 'baselayer-icons'),
		'mixed-weather'            => _x('Mixed weather', 'icon name', 'baselayer-icons'),
		'partly-cloudy'            => _x('Partly cloudy', 'icon name', 'baselayer-icons'),
		'partly-cloudy-night'      => _x('Partly cloudy night', 'icon name', 'baselayer-icons'),
		'cold'                     => _x('Cold', 'icon name', 'baselayer-icons'),
		'heat'                     => _x('Heat', 'icon name', 'baselayer-icons'),
		'thermometer'              => _x('Thermometer', 'icon name', 'baselayer-icons'),
		'thermometer-alt'          => _x('Thermometer', 'icon name', 'baselayer-icons'),
		'foggy'                    => _x('Foggy', 'icon name', 'baselayer-icons'),
		'wind'                     => _x('Wind', 'icon name', 'baselayer-icons'),
		'fan'                      => _x('Fan', 'icon name', 'baselayer-icons'),

		// Food & drink.
		'beer'                     => _x('Beer', 'icon name', 'baselayer-icons'),
		'cocktail'                 => _x('Cocktail', 'icon name', 'baselayer-icons'),
		'wine'                     => _x('Wine', 'icon name', 'baselayer-icons'),
		'glass-full'               => _x('Water glass', 'icon name', 'baselayer-icons'),
		'no-drinks'                => _x('No drinks', 'icon name', 'baselayer-icons'),
		'burger'                   => _x('Burger', 'icon name', 'baselayer-icons'),
		'chef-hat'                 => _x('Chef hat', 'icon name', 'baselayer-icons'),
		'coffee'                   => _x('Coffee', 'icon name', 'baselayer-icons'),
		'tea'                      => _x('Tea', 'icon name', 'baselayer-icons'),
		'dining'                   => _x('Dining', 'icon name', 'baselayer-icons'),
		'fork-spoon'               => _x('Fork and spoon', 'icon name', 'baselayer-icons'),
		'glass'                    => _x('Glass', 'icon name', 'baselayer-icons'),
		'icecream'                 => _x('Ice cream', 'icon name', 'baselayer-icons'),
		'liquor'                   => _x('Liquor', 'icon name', 'baselayer-icons'),
		'nutrition'                => _x('Nutrition', 'icon name', 'baselayer-icons'),
		'bakery'                   => _x('Bakery', 'icon name', 'baselayer-icons'),
		'cake'                     => _x('Cake', 'icon name', 'baselayer-icons'),
		'fast-food'                => _x('Fast food', 'icon name', 'baselayer-icons'),
		'fork-knife'               => _x('Fork and knife', 'icon name', 'baselayer-icons'),
		'pizza'                    => _x('Pizza', 'icon name', 'baselayer-icons'),
		'water-bottle'             => _x('Water bottle', 'icon name', 'baselayer-icons'),

		// Sports & fitness.
		'game-controller'          => _x('Game controller', 'icon name', 'baselayer-icons'),
		'exercise'                 => _x('Exercise', 'icon name', 'baselayer-icons'),
		'football'                 => _x('Football', 'icon name', 'baselayer-icons'),
		'motorsports'              => _x('Motorsports', 'icon name', 'baselayer-icons'),
		'swimming'                 => _x('Swimming', 'icon name', 'baselayer-icons'),
		'stadium'                  => _x('Stadium', 'icon name', 'baselayer-icons'),
		'tennis'                   => _x('Tennis', 'icon name', 'baselayer-icons'),
		'volleyball'               => _x('Volleyball', 'icon name', 'baselayer-icons'),
		'target'                   => _x('Target', 'icon name', 'baselayer-icons'),
		'american-football'        => _x('American football', 'icon name', 'baselayer-icons'),
		'badminton'                => _x('Badminton', 'icon name', 'baselayer-icons'),
		'baseball'                 => _x('Baseball', 'icon name', 'baselayer-icons'),
		'basketball'               => _x('Basketball', 'icon name', 'baselayer-icons'),
		'cricket'                  => _x('Cricket', 'icon name', 'baselayer-icons'),
		'rugby'                    => _x('Rugby', 'icon name', 'baselayer-icons'),
		'golf'                     => _x('Golf', 'icon name', 'baselayer-icons'),
		'hockey'                   => _x('Hockey', 'icon name', 'baselayer-icons'),
		'whistle'                  => _x('Whistle', 'icon name', 'baselayer-icons'),
		'medal'                    => _x('Medal', 'icon name', 'baselayer-icons'),
		'medals'                   => _x('Medals', 'icon name', 'baselayer-icons'),

		// Health & medical.
		'health-cross'             => _x('Health', 'icon name', 'baselayer-icons'),
		'shield-health'            => _x('Shield health', 'icon name', 'baselayer-icons'),
		'medical-services'         => _x('Medical services', 'icon name', 'baselayer-icons'),
		'healing'                  => _x('Healing', 'icon name', 'baselayer-icons'),
		'vital-signs'              => _x('Vital signs', 'icon name', 'baselayer-icons'),
		'medical-mask'             => _x('Medical mask', 'icon name', 'baselayer-icons'),
		'mask'                     => _x('Mask', 'icon name', 'baselayer-icons'),
		'pill'                     => _x('Pill', 'icon name', 'baselayer-icons'),
		'fluid'                    => _x('Fluid', 'icon name', 'baselayer-icons'),
		'fluid-syringe'            => _x('Syringe', 'icon name', 'baselayer-icons'),
		'cardiology'               => _x('Cardiology', 'icon name', 'baselayer-icons'),
		'allergies'                => _x('Allergies', 'icon name', 'baselayer-icons'),
		'virus'                    => _x('Virus', 'icon name', 'baselayer-icons'),
		'labs'                     => _x('Labs', 'icon name', 'baselayer-icons'),
		'science'                  => _x('Science', 'icon name', 'baselayer-icons'),
		'dna'                      => _x('DNA', 'icon name', 'baselayer-icons'),

		// Nature & environment.
		'forest'                 => _x('Forest', 'icon name', 'baselayer-icons'),
		'nature'                 => _x('Nature', 'icon name', 'baselayer-icons'),
		'nature-people'          => _x('Nature people', 'icon name', 'baselayer-icons'),
		'pine-tree'              => _x('Pine tree', 'icon name', 'baselayer-icons'),
		'flower-tulip'           => _x('Flower', 'icon name', 'baselayer-icons'),
		'flower'                 => _x('Flower', 'icon name', 'baselayer-icons'),
		'recycling'              => _x('Recycling', 'icon name', 'baselayer-icons'),
		'water'                  => _x('Water', 'icon name', 'baselayer-icons'),
		'drop'                   => _x('Drop', 'icon name', 'baselayer-icons'),
		'paw'                    => _x('Paw', 'icon name', 'baselayer-icons'),
		'dog'                    => _x('Dog', 'icon name', 'baselayer-icons'),
		'bone'                   => _x('Bone', 'icon name', 'baselayer-icons'),
		'owl'                    => _x('Owl', 'icon name', 'baselayer-icons'),
		'bird'                   => _x('Bird', 'icon name', 'baselayer-icons'),
		'bug'                    => _x('Bug', 'icon name', 'baselayer-icons'),
		'mountain-flag'          => _x('Mountain', 'icon name', 'baselayer-icons'),
		'mountain'               => _x('Mountain', 'icon name', 'baselayer-icons'),
		'umbrella'               => _x('Umbrella', 'icon name', 'baselayer-icons'),
		'camping'                => _x('Camping', 'icon name', 'baselayer-icons'),

		// Symbols & misc.
		'bolt'                   => _x('Bolt', 'icon name', 'baselayer-icons'),
		'lightbulb'              => _x('Lightbulb', 'icon name', 'baselayer-icons'),
		'wand-shine'             => _x('Magic wand shine', 'icon name', 'baselayer-icons'),
		'wand-stars'             => _x('Magic wand', 'icon name', 'baselayer-icons'),
		'palette'                => _x('Palette', 'icon name', 'baselayer-icons'),
		'paintbrush'             => _x('Paintbrush', 'icon name', 'baselayer-icons'),
		'paintbrush-off'         => _x('Paintbrush off', 'icon name', 'baselayer-icons'),
		'colorize'               => _x('Colorize', 'icon name', 'baselayer-icons'),
		'label'                  => _x('Label', 'icon name', 'baselayer-icons'),
		'sticker'                => _x('Sticker', 'icon name', 'baselayer-icons'),
		'theater'                   => _x('Theater', 'icon name', 'baselayer-icons'),
		'bomb'                   => _x('Bomb', 'icon name', 'baselayer-icons'),
		'skull'                  => _x('Skull', 'icon name', 'baselayer-icons'),
		'wc'                     => _x('Restroom', 'icon name', 'baselayer-icons'),
		'construction'           => _x('Construction', 'icon name', 'baselayer-icons'),
		'factory'                => _x('Factory', 'icon name', 'baselayer-icons'),
		'cogwheels'              => _x('Cogwheels', 'icon name', 'baselayer-icons'),
		'engineering'            => _x('Engineering', 'icon name', 'baselayer-icons'),
		'box'                    => _x('Box', 'icon name', 'baselayer-icons'),
		'editor-choice'          => _x('Editor\'s choice', 'icon name', 'baselayer-icons'),
		'star-shine'             => _x('Star shine', 'icon name', 'baselayer-icons'),
		'rocket'                 => _x('Rocket', 'icon name', 'baselayer-icons'),
		'rocket-launch'          => _x('Rocket launch', 'icon name', 'baselayer-icons'),
		'planet'                 => _x('Planet', 'icon name', 'baselayer-icons'),
		'diamond'                => _x('Diamond', 'icon name', 'baselayer-icons'),
		'crown'                  => _x('Crown', 'icon name', 'baselayer-icons'),
		'school'                 => _x('School', 'icon name', 'baselayer-icons'),
		'interests'              => _x('Interests', 'icon name', 'baselayer-icons'),
		'extensions'             => _x('Extensions', 'icon name', 'baselayer-icons'),
		'puzzle'                 => _x('Puzzle', 'icon name', 'baselayer-icons'),

		'chess'                  => _x('Chess', 'icon name', 'baselayer-icons'),
		'toy'                    => _x('Toy', 'icon name', 'baselayer-icons'),
		'ticket'                 => _x('Ticket', 'icon name', 'baselayer-icons'),
		'castle'                 => _x('Castle', 'icon name', 'baselayer-icons'),
		'shirt'                  => _x('Shirt', 'icon name', 'baselayer-icons'),
		'glasses'                => _x('Glasses', 'icon name', 'baselayer-icons'),
		'suitcase'               => _x('Suitcase', 'icon name', 'baselayer-icons'),
		'ticket-alt'             => _x('Ticket', 'icon name', 'baselayer-icons'),

		'fire-extinguisher'      => _x('Fire extinguisher', 'icon name', 'baselayer-icons'),
		'fire-hydrant'           => _x('Fire hydrant', 'icon name', 'baselayer-icons'),
		// Brands (proper nouns; source strings are the brand names and are not
		// translated — the German .mo intentionally has no entries for these, so
		// gettext falls back to the English name in every locale).
		'facebook'               => _x('Facebook', 'icon name', 'baselayer-icons'),
		'instagram'              => _x('Instagram', 'icon name', 'baselayer-icons'),
		'x'                      => _x('X (Twitter)', 'icon name', 'baselayer-icons'),
		'threads'                => _x('Threads', 'icon name', 'baselayer-icons'),
		'mastodon'               => _x('Mastodon', 'icon name', 'baselayer-icons'),
		'bluesky'                => _x('Bluesky', 'icon name', 'baselayer-icons'),
		'pinterest'              => _x('Pinterest', 'icon name', 'baselayer-icons'),
		'reddit'                 => _x('Reddit', 'icon name', 'baselayer-icons'),
		'tumblr'                 => _x('Tumblr', 'icon name', 'baselayer-icons'),
		'medium'                 => _x('Medium', 'icon name', 'baselayer-icons'),
		'snapchat'               => _x('Snapchat', 'icon name', 'baselayer-icons'),
		'tiktok'                 => _x('TikTok', 'icon name', 'baselayer-icons'),
		'xing'                   => _x('Xing', 'icon name', 'baselayer-icons'),
		'linkedin'               => _x('LinkedIn', 'icon name', 'baselayer-icons'),
		'weibo'                  => _x('Weibo', 'icon name', 'baselayer-icons'),
		'behance'                => _x('Behance', 'icon name', 'baselayer-icons'),
		'dribbble'               => _x('Dribbble', 'icon name', 'baselayer-icons'),
		'whatsapp'               => _x('WhatsApp', 'icon name', 'baselayer-icons'),
		'telegram'               => _x('Telegram', 'icon name', 'baselayer-icons'),
		'signal'                 => _x('Signal', 'icon name', 'baselayer-icons'),
		'imessage'               => _x('iMessage', 'icon name', 'baselayer-icons'),
		'messenger'              => _x('Messenger', 'icon name', 'baselayer-icons'),
		'wechat'                 => _x('WeChat', 'icon name', 'baselayer-icons'),
		'line'                   => _x('LINE', 'icon name', 'baselayer-icons'),
		'discord'                => _x('Discord', 'icon name', 'baselayer-icons'),
		'slack'                  => _x('Slack', 'icon name', 'baselayer-icons'),
		'youtube'                => _x('YouTube', 'icon name', 'baselayer-icons'),
		'youtube-shorts'         => _x('YouTube Shorts', 'icon name', 'baselayer-icons'),
		'vimeo'                  => _x('Vimeo', 'icon name', 'baselayer-icons'),
		'twitch'                 => _x('Twitch', 'icon name', 'baselayer-icons'),
		'spotify'                => _x('Spotify', 'icon name', 'baselayer-icons'),
		'soundcloud'             => _x('SoundCloud', 'icon name', 'baselayer-icons'),
		'apple-music'            => _x('Apple Music', 'icon name', 'baselayer-icons'),
		'github'                 => _x('GitHub', 'icon name', 'baselayer-icons'),
		'gitlab'                 => _x('GitLab', 'icon name', 'baselayer-icons'),
		'wordpress'              => _x('WordPress', 'icon name', 'baselayer-icons'),
		'brand-family'           => _x('Brand family', 'icon name', 'baselayer-icons'),
		'patreon'                => _x('Patreon', 'icon name', 'baselayer-icons'),
		'trello'                 => _x('Trello', 'icon name', 'baselayer-icons'),
		'yelp'                   => _x('Yelp', 'icon name', 'baselayer-icons'),
		'google'                 => _x('Google', 'icon name', 'baselayer-icons'),
		'microsoft'              => _x('Microsoft', 'icon name', 'baselayer-icons'),
		'apple'                  => _x('Apple', 'icon name', 'baselayer-icons'),
		'theme-logo'             => _x('Logo', 'icon name', 'baselayer-icons'),
		'agender'                => _x('Agender', 'icon name', 'baselayer-icons'),
		'airlines'               => _x('Airlines', 'icon name', 'baselayer-icons'),
		'arrow-down-right'       => _x('Arrow downwards', 'icon name', 'baselayer-icons'),
		'arrow-menu-close'       => _x('Arrow menu close', 'icon name', 'baselayer-icons'),
		'arrow-menu-open'        => _x('Arrow menu open', 'icon name', 'baselayer-icons'),
		'arrows-outward'         => _x('Arrows outward', 'icon name', 'baselayer-icons'),
		'bus'                    => _x('Bus', 'icon name', 'baselayer-icons'),
		'compress'               => _x('Compress', 'icon name', 'baselayer-icons'),
		'eco'                    => _x('Eco', 'icon name', 'baselayer-icons'),
		'edit-off'               => _x('Edit off', 'icon name', 'baselayer-icons'),
		'star-family'            => _x('Family star', 'icon name', 'baselayer-icons'),
		'fast-forward'           => _x('Fast forward', 'icon name', 'baselayer-icons'),
		'fast-rewind'            => _x('Fast rewind', 'icon name', 'baselayer-icons'),
		'first-page'             => _x('First page', 'icon name', 'baselayer-icons'),
		'fit-page'               => _x('Fit page', 'icon name', 'baselayer-icons'),
		'folder-edit'            => _x('Folder edit', 'icon name', 'baselayer-icons'),
		'grad-pan'               => _x('Pan', 'icon name', 'baselayer-icons'),
		'groups'                 => _x('Groups', 'icon name', 'baselayer-icons'),
		'last-page'              => _x('Last page', 'icon name', 'baselayer-icons'),
		'line-end-arrow'         => _x('Line end arrow', 'icon name', 'baselayer-icons'),
		'line-start-arrow'       => _x('Line start arrow', 'icon name', 'baselayer-icons'),
		'menu-open'              => _x('Menu open', 'icon name', 'baselayer-icons'),
		'read-more'              => _x('Read more', 'icon name', 'baselayer-icons'),
		'mic'                    => _x('Mic', 'icon name', 'baselayer-icons'),
		'mic-off'                => _x('Mic off', 'icon name', 'baselayer-icons'),
		'military-medal'         => _x('Military medal', 'icon name', 'baselayer-icons'),
		'mobile-vibrate'         => _x('Mobile vibrate', 'icon name', 'baselayer-icons'),
		'monitor-heart'          => _x('Monitor heart', 'icon name', 'baselayer-icons'),
		'news-article'           => _x('News article', 'icon name', 'baselayer-icons'),
		'note'                   => _x('Note', 'icon name', 'baselayer-icons'),
		'note-stack'             => _x('Note stack', 'icon name', 'baselayer-icons'),
		'odometer'               => _x('Odometer', 'icon name', 'baselayer-icons'),
		'pause-circle'           => _x('Pause circle', 'icon name', 'baselayer-icons'),
		'present'                => _x('Present', 'icon name', 'baselayer-icons'),
		'repeat'                 => _x('Repeat', 'icon name', 'baselayer-icons'),
		'replay'                 => _x('Replay', 'icon name', 'baselayer-icons'),
		'scanner'                => _x('Scanner', 'icon name', 'baselayer-icons'),
		'shuffle'                => _x('Shuffle', 'icon name', 'baselayer-icons'),
		'sick'                   => _x('Sick', 'icon name', 'baselayer-icons'),
		'slab-serif'             => _x('Slab serif', 'icon name', 'baselayer-icons'),
		'smart-toy'              => _x('Smart toy', 'icon name', 'baselayer-icons'),
		'toy-fan'                => _x('Toy fan', 'icon name', 'baselayer-icons'),
		'sports-flag'            => _x('Sports flag', 'icon name', 'baselayer-icons'),
		'special-character'      => _x('Special character', 'icon name', 'baselayer-icons'),
		'step'                   => _x('Step', 'icon name', 'baselayer-icons'),
		'stop-circle'            => _x('Stop circle', 'icon name', 'baselayer-icons'),
		'strategy'               => _x('Strategy', 'icon name', 'baselayer-icons'),
		'subtitles'              => _x('Subtitles', 'icon name', 'baselayer-icons'),
		'switch-left'            => _x('Switch left', 'icon name', 'baselayer-icons'),
		'switch-right'           => _x('Switch right', 'icon name', 'baselayer-icons'),
		'swords'                 => _x('Swords', 'icon name', 'baselayer-icons'),
		'syringe'                => _x('Syringe', 'icon name', 'baselayer-icons'),
		'titlecase'              => _x('Title case', 'icon name', 'baselayer-icons'),
		'tooltip-text'           => _x('Tooltip', 'icon name', 'baselayer-icons'),
		'tooltip'            => _x('Tooltip', 'icon name', 'baselayer-icons'),
		'tv-remote'              => _x('TV remote', 'icon name', 'baselayer-icons'),
		'motorbike'            => _x('Motorbike', 'icon name', 'baselayer-icons'),
		'vaccines'               => _x('Vaccines', 'icon name', 'baselayer-icons'),
	];
}

/**
 * Translated category labels, keyed by category slug.
 *
 * @return array<string, string>
 */
function bl_icon_category_labels(): array
{
	return [
		'navigation'     => _x('Arrows & navigation', 'icon category', 'baselayer-icons'),
		'actions'        => _x('Actions', 'icon category', 'baselayer-icons'),
		'editing'        => _x('Editing & text', 'icon category', 'baselayer-icons'),
		'rich-text'      => _x('Rich text', 'icon category', 'baselayer-icons'),
		'communication'  => _x('Communication', 'icon category', 'baselayer-icons'),
		'social'         => _x('Social & feedback', 'icon category', 'baselayer-icons'),
		'media'          => _x('Media', 'icon category', 'baselayer-icons'),
		'files'          => _x('Files & storage', 'icon category', 'baselayer-icons'),
		'analytics'      => _x('Analytics & data', 'icon category', 'baselayer-icons'),
		'layout'         => _x('Layout & blocks', 'icon category', 'baselayer-icons'),
		'commerce'       => _x('Commerce, finance & legal', 'icon category', 'baselayer-icons'),
		'people'         => _x('People & accounts', 'icon category', 'baselayer-icons'),
		'places'         => _x('Maps & places', 'icon category', 'baselayer-icons'),
		'devices'        => _x('Devices & interaction', 'icon category', 'baselayer-icons'),
		'security'       => _x('Security & privacy', 'icon category', 'baselayer-icons'),
		'controls'       => _x('Controls & settings', 'icon category', 'baselayer-icons'),
		'status'         => _x('Status & time', 'icon category', 'baselayer-icons'),
		'weather'        => _x('Weather', 'icon category', 'baselayer-icons'),
		'food-drink'     => _x('Food & drink', 'icon category', 'baselayer-icons'),
		'sports-fitness' => _x('Sports & fitness', 'icon category', 'baselayer-icons'),
		'health-medical' => _x('Health & medical', 'icon category', 'baselayer-icons'),
		'nature'         => _x('Nature & environment', 'icon category', 'baselayer-icons'),
		'misc'           => _x('Symbols & misc', 'icon category', 'baselayer-icons'),
		'brands'         => _x('Brands', 'icon category', 'baselayer-icons'),
		'theme'          => _x('Theme', 'icon category', 'baselayer-icons'),
	];
}

/**
 * Translated picker UI strings.
 *
 * @return array<string, string>
 */
function bl_icon_ui_strings(): array
{
	return [
		'choose'     => _x('Choose icon', 'icon picker', 'baselayer-icons'),
		'change'     => _x('Change icon', 'inline icon control', 'baselayer-icons'),
		'search'     => _x('Search icons…', 'icon picker', 'baselayer-icons'),
		'style'      => _x('Style', 'icon picker', 'baselayer-icons'),
		'outline'    => _x('Outline', 'icon picker', 'baselayer-icons'),
		'filled'     => _x('Filled', 'icon picker', 'baselayer-icons'),
		'remove'     => _x('Remove', 'icon picker', 'baselayer-icons'),
		'close'      => _x('Close', 'icon picker', 'baselayer-icons'),
	];
}

/**
 * Icon file names that ship with a filled variant (parsed from _icon-names.scss).
 *
 * @return string[]
 */
function bl_icon_fill_names(): array
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

	if (!preg_match('/\$bl-icon-fill:\s*\((.*?)\);/s', $content, $matches)) {
		return $cache = [];
	}

	preg_match_all('/[\'"]?([a-z0-9-]+)[\'"]?/i', $matches[1], $names);

	$cache = array_values(array_unique(array_filter($names[1] ?? [])));

	return $cache;
}

/**
 * Sanitize a theme icon slug stored in block/field data.
 *
 * @param mixed $value Raw icon slug (e.g. heart, heart-fill, theme-logo).
 */
function bl_sanitize_icon_slug($value): string
{
	if (!is_string($value)) {
		return '';
	}

	$value = strtolower(trim($value));
	if ($value === '') {
		return '';
	}

	if (!preg_match('/^[a-z0-9][a-z0-9-]*$/', $value)) {
		return '';
	}

	return $value;
}

/**
 * Asset path for bl_svg_code() from an icon catalog name.
 *
 * @param string $icon_name Icon filename without extension (e.g. bolt, theme-logo).
 */
function bl_icon_svg_asset_path(string $icon_name): string
{
	if (str_starts_with($icon_name, 'theme-')) {
		$file = substr($icon_name, strlen('theme-')) . '.svg';

		if (is_child_theme()) {
			$child = trailingslashit(get_stylesheet_directory()) . 'assets/icons/' . $file;
			if (is_file($child)) {
				return '/icons/' . $file;
			}
		}

		return '/icons-theme/' . $file;
	}

	return '/icons/' . $icon_name . '.svg';
}

/**
 * Icon catalog entries for admin UI (developer cheatsheet icon demo).
 *
 * @return array<int, array{name: string, label: string, hasFill: bool}>
 */
function bl_icon_admin_catalog(): array
{
	bl_load_icons_textdomain();

	$labels = bl_icon_labels();
	$fill = array_flip(bl_icon_fill_names());
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
 * Theme icon category for the active stylesheet (child), from icons.generated.json.
 *
 * @return array{slug: string, label: string, icons: list<array<string, mixed>>}|null
 *         Category data when a child theme is active; null when using the parent only.
 */
function bl_stylesheet_theme_icon_category(): ?array
{
	if (!is_child_theme()) {
		return null;
	}

	$path = trailingslashit(get_stylesheet_directory()) . 'assets/icons.generated.json';
	if (!is_readable($path)) {
		return [
			'slug' => 'theme',
			'label' => 'Theme',
			'icons' => [],
		];
	}

	$raw = file_get_contents($path);
	if ($raw === false || $raw === '') {
		return [
			'slug' => 'theme',
			'label' => 'Theme',
			'icons' => [],
		];
	}

	$data = json_decode($raw, true);
	if (!is_array($data)) {
		return [
			'slug' => 'theme',
			'label' => 'Theme',
			'icons' => [],
		];
	}

	$icons = [];
	if (!empty($data['icons']) && is_array($data['icons'])) {
		foreach ($data['icons'] as $icon) {
			if (!is_array($icon) || empty($icon['filename'])) {
				continue;
			}
			$icons[] = [
				'filename' => (string) $icon['filename'],
				'label' => isset($icon['label']) ? (string) $icon['label'] : '',
				'keywords' => isset($icon['keywords']) && is_array($icon['keywords'])
					? array_values(array_map('strval', $icon['keywords']))
					: [],
				'alternatives' => isset($icon['alternatives']) && is_array($icon['alternatives'])
					? array_values(array_map('strval', $icon['alternatives']))
					: [],
			];
		}
	}

	return [
		'slug' => isset($data['slug']) && is_string($data['slug']) && $data['slug'] !== ''
			? $data['slug']
			: 'theme',
		'label' => isset($data['label']) && is_string($data['label']) && $data['label'] !== ''
			? $data['label']
			: 'Theme',
		'icons' => $icons,
	];
}

/**
 * Shared baselayerIcons localize payload for editor + admin.
 *
 * @return array<string, mixed>
 */
function bl_icons_localize_payload(): array
{
	$payload = [
		'labels'     => bl_icon_labels(),
		'categories' => bl_icon_category_labels(),
		'ui'         => bl_icon_ui_strings(),
	];

	$theme_category = bl_stylesheet_theme_icon_category();
	if ($theme_category !== null) {
		$payload['themeCategory'] = $theme_category;
	}

	// Child theme icons live in assets/icons/; parent project icons in assets/icons-theme/.
	if (
		is_child_theme()
		&& is_dir(trailingslashit(get_stylesheet_directory()) . 'assets/icons')
	) {
		$payload['themeIconsBase'] = trailingslashit(get_stylesheet_directory_uri()) . 'assets/icons/';
	} else {
		$payload['themeIconsBase'] = trailingslashit(get_template_directory_uri()) . 'assets/icons-theme/';
	}

	return $payload;
}

/**
 * Expose translated icon labels + UI strings to the editor script (editor.js).
 *
 * Runs after bl_editor_scripts() (priority 10) has registered the handle.
 *
 * @return void
 */
function bl_editor_icons_localize(): void
{
	bl_load_icons_textdomain();

	wp_localize_script('baselayer-editor', 'baselayerIcons', bl_icons_localize_payload());
}
add_action('enqueue_block_editor_assets', 'bl_editor_icons_localize', 11);

/**
 * Expose translated icon labels + UI strings to admin.js on the Developer cheatsheet.
 *
 * @param string $hook_suffix Current admin page hook suffix.
 * @return void
 */
function bl_admin_icons_localize(string $hook_suffix): void
{
	unset($hook_suffix);

	$page = isset($_GET['page']) ? sanitize_key(wp_unslash($_GET['page'])) : '';

	if ($page !== 'bl-developer-system') {
		return;
	}

	bl_load_icons_textdomain();

	wp_localize_script('main-admin-scripts', 'baselayerIcons', bl_icons_localize_payload());
}
add_action('admin_enqueue_scripts', 'bl_admin_icons_localize', 11);
