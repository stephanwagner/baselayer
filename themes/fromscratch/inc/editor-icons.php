<?php

defined('ABSPATH') || exit;

/**
 * Icon picker labels.
 *
 * The visible icon names and category labels are translatable and live in their
 * own text domain (`fromscratch-icons`), so the ~30 short strings sit in
 * languages/icons/ and never bloat the main fromscratch-*.mo. Source strings are
 * English (matching the theme convention); German ships in
 * languages/icons/fromscratch-icons-de_DE.mo.
 *
 * The structural catalog (file names, variants, search keywords) stays in JS:
 * src/js/editor/icons/icon-catalog.js.
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
		'arrow-left'     => _x('Arrow left', 'icon name', 'fromscratch-icons'),
		'arrow-right'    => _x('Arrow right', 'icon name', 'fromscratch-icons'),
		'chevron-left'   => _x('Chevron left', 'icon name', 'fromscratch-icons'),
		'chevron-right'  => _x('Chevron right', 'icon name', 'fromscratch-icons'),
		'chevron-up'     => _x('Chevron up', 'icon name', 'fromscratch-icons'),
		'chevron-down'   => _x('Chevron down', 'icon name', 'fromscratch-icons'),
		'add'            => _x('Add', 'icon name', 'fromscratch-icons'),
		'edit'           => _x('Edit', 'icon name', 'fromscratch-icons'),
		'delete'         => _x('Delete', 'icon name', 'fromscratch-icons'),
		'download'       => _x('Download', 'icon name', 'fromscratch-icons'),
		'copy'           => _x('Copy', 'icon name', 'fromscratch-icons'),
		'checkmark'      => _x('Checkmark', 'icon name', 'fromscratch-icons'),
		'chat'           => _x('Chat', 'icon name', 'fromscratch-icons'),
		'mail'           => _x('Email', 'icon name', 'fromscratch-icons'),
		'megaphone'      => _x('Megaphone', 'icon name', 'fromscratch-icons'),
		'camera'         => _x('Camera', 'icon name', 'fromscratch-icons'),
		'image'          => _x('Image', 'icon name', 'fromscratch-icons'),
		'article'        => _x('Article', 'icon name', 'fromscratch-icons'),
		'carousel'       => _x('Carousel', 'icon name', 'fromscratch-icons'),
		'bolt'           => _x('Bolt', 'icon name', 'fromscratch-icons'),
		'bookmark'       => _x('Bookmark', 'icon name', 'fromscratch-icons'),
		'calendar-month' => _x('Calendar', 'icon name', 'fromscratch-icons'),
		'heart'          => _x('Heart', 'icon name', 'fromscratch-icons'),
		'home'           => _x('Home', 'icon name', 'fromscratch-icons'),
		'info'           => _x('Info', 'icon name', 'fromscratch-icons'),
		'location'       => _x('Location', 'icon name', 'fromscratch-icons'),
		'link'           => _x('Link', 'icon name', 'fromscratch-icons'),
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
		'arrows'        => _x('Arrows', 'icon category', 'fromscratch-icons'),
		'actions'       => _x('Actions', 'icon category', 'fromscratch-icons'),
		'communication' => _x('Communication', 'icon category', 'fromscratch-icons'),
		'media'         => _x('Media', 'icon category', 'fromscratch-icons'),
		'general'       => _x('General', 'icon category', 'fromscratch-icons'),
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
		'search'  => _x('Search icons …', 'icon picker', 'fromscratch-icons'),
		'style'   => _x('Style', 'icon picker', 'fromscratch-icons'),
		'outline' => _x('Outline', 'icon picker', 'fromscratch-icons'),
		'filled'  => _x('Filled', 'icon picker', 'fromscratch-icons'),
		'remove'  => _x('Remove', 'icon picker', 'fromscratch-icons'),
	];
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
