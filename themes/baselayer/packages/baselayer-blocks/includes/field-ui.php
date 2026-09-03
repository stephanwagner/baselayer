<?php

defined('ABSPATH') || exit;

/**
 * Palette / UI icons for the definition editor.
 * Prefer Forms when loaded; otherwise use Blocks' vendored SVG registry.
 *
 * @return array<string, string>
 */
function bl_blocks_palette_icons(): array
{
	$icons = function_exists('bl_forms_palette_icons')
		? bl_forms_palette_icons()
		: [];

	$registry = function_exists('bl_blocks_builder_icon_svgs')
		? bl_blocks_builder_icon_svgs()
		: [];

	$add = static function (array &$icons, array $registry, string $key): void {
		if (isset($icons[$key])) {
			return;
		}
		$svg = $registry[$key] ?? '';
		if ($svg === '' || stripos($svg, '<svg') === false) {
			return;
		}
		$attrs = ' width="16" height="16" aria-hidden="true" focusable="false"';
		$icons[$key] = (string) preg_replace('/<svg\b([^>]*)>/i', '<svg$1' . $attrs . '>', $svg, 1);
	};

	if ($icons === []) {
		$keys = [
			'text',
			'textarea',
			'email',
			'url',
			'number',
			'range',
			'phone',
			'checkboxes',
			'radio',
			'select',
			'toggle',
			'button_group',
			'date',
			'time',
			'datetime',
			'file',
			'image',
			'heading',
			'text_block',
			'html',
			'divider',
			'spacer',
			'row_break',
			'column',
			'section',
			'tab',
			'repeater',
			'hidden',
			'page',
			'link',
			'caret',
			'expandContent',
			'collapseContent',
			'edit',
			'done',
			'trash',
			'close',
			'duplicate',
			'drag',
			'design',
			'tune',
			'fullscreen',
			'fullscreenExit',
		];
		foreach ($keys as $key) {
			$add($icons, $registry, $key);
		}
	}

	// Blocks-specific glyphs (Forms palette has no `icon` / `wysiwyg` / `extensions` / `plus` / `box` keys).
	$add($icons, $registry, 'icon');
	$add($icons, $registry, 'wysiwyg');
	$add($icons, $registry, 'range');
	$add($icons, $registry, 'extensions');
	$add($icons, $registry, 'plus');
	$add($icons, $registry, 'box');

	return $icons;
}

/**
 * Field type keys for the builder palette.
 *
 * @return list<string>
 */
function bl_blocks_field_types(): array
{
	if (function_exists('bl_forms_field_types')) {
		$types = bl_forms_field_types();
		// Blocks definitions don't need form-only anti-spam fields.
		$types = array_values(array_filter(
			$types,
			static fn($t) => !in_array($t, ['honeypot', 'captcha', 'terms'], true)
		));
	} else {
		$types = [
			'text', 'textarea', 'email', 'phone', 'url', 'number', 'range',
			'checkboxes', 'radio', 'select', 'toggle', 'button_group',
			'date', 'time', 'datetime', 'file', 'image',
			'heading', 'text_block', 'divider', 'spacer', 'row_break', 'html',
			'column', 'section', 'tab', 'hidden', 'page', 'link', 'icon',
		];
	}

	if (!in_array('page', $types, true)) {
		$types[] = 'page';
	}

	if (!in_array('link', $types, true)) {
		$types[] = 'link';
	}

	if (!in_array('repeater', $types, true)) {
		$types[] = 'repeater';
	}

	if (!in_array('icon', $types, true)) {
		$types[] = 'icon';
	}

	if (!in_array('wysiwyg', $types, true)) {
		$types[] = 'wysiwyg';
	}

	if (!in_array('range', $types, true)) {
		$types[] = 'range';
	}

	return $types;
}

/**
 * Option key for a site settings definition.
 */
function bl_blocks_site_option_key(string $slug): string
{
	$slug = sanitize_key($slug);
	if ($slug === '') {
		$slug = 'default';
	}

	return 'bl_blocks_site_' . $slug;
}

/**
 * Page settings post meta key for a definition slug (portable across site moves).
 */
function bl_blocks_page_meta_key(string $slug): string
{
	$slug = sanitize_key($slug);
	if ($slug === '') {
		$slug = 'default';
	}

	return '_bl_page_settings_' . $slug;
}

/**
 * Legacy page settings meta key (definition post ID). Used only for migration.
 */
function bl_blocks_page_meta_key_legacy(int $definition_id): string
{
	return '_bl_page_settings_' . (int) $definition_id;
}

/**
 * Copy legacy ID-keyed page settings meta to the slug key when needed.
 */
function bl_blocks_maybe_migrate_page_settings_meta(int $post_id, string $slug, int $definition_id): void
{
	if ($post_id <= 0 || $definition_id <= 0) {
		return;
	}

	$slug = sanitize_key($slug);
	if ($slug === '') {
		return;
	}

	$new_key = bl_blocks_page_meta_key($slug);
	$existing = get_post_meta($post_id, $new_key, true);
	if (is_array($existing)) {
		return;
	}

	$legacy_key = bl_blocks_page_meta_key_legacy($definition_id);
	$legacy = get_post_meta($post_id, $legacy_key, true);
	if (!is_array($legacy)) {
		return;
	}

	update_post_meta($post_id, $new_key, $legacy);
	delete_post_meta($post_id, $legacy_key);
}

/**
 * One-time migration: `_bl_page_settings_{id}` → `_bl_page_settings_{slug}`.
 */
function bl_blocks_migrate_page_settings_meta_keys(): void
{
	if (get_option('bl_blocks_page_settings_meta_slug_migrated')) {
		return;
	}
	if (!function_exists('bl_blocks_query_definitions') || !function_exists('bl_blocks_definition_slug')) {
		return;
	}

	global $wpdb;
	if (!$wpdb instanceof wpdb) {
		return;
	}

	$id_to_slug = [];
	foreach (bl_blocks_query_definitions('page_settings', false) as $post) {
		if (!$post instanceof WP_Post) {
			continue;
		}
		$def_id = (int) $post->ID;
		$slug = bl_blocks_definition_slug($def_id);
		if ($slug !== '') {
			$id_to_slug[$def_id] = $slug;
		}
	}

	if ($id_to_slug === []) {
		update_option('bl_blocks_page_settings_meta_slug_migrated', 1, false);

		return;
	}

	foreach ($id_to_slug as $def_id => $slug) {
		$legacy_key = bl_blocks_page_meta_key_legacy((int) $def_id);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one-time meta key migration.
		$post_ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s",
				$legacy_key
			)
		);
		if (!is_array($post_ids)) {
			continue;
		}
		foreach ($post_ids as $post_id) {
			bl_blocks_maybe_migrate_page_settings_meta((int) $post_id, $slug, (int) $def_id);
		}
	}

	update_option('bl_blocks_page_settings_meta_slug_migrated', 1, false);
}
add_action('init', 'bl_blocks_migrate_page_settings_meta_keys', 15);

/**
 * Flatten leaf fields from a definition tree.
 *
 * @param list<array<string, mixed>> $fields
 * @return list<array<string, mixed>>
 */
function bl_blocks_iter_fields(array $fields): array
{
	$out = [];
	$walk = static function (array $list) use (&$walk, &$out): void {
		foreach ($list as $field) {
			if (!is_array($field)) {
				continue;
			}
			$type = (string) ($field['type'] ?? '');
			if (bl_blocks_is_layout_field_type($type)) {
				$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
				$walk($children);
				continue;
			}
			$out[] = $field;
			// Nested subfields live under row values; do not flatten into the root list.
		}
	};
	$walk($fields);

	return $out;
}

/**
 * Read values from a request map for a definition.
 *
 * @param list<array<string, mixed>> $fields
 * @param mixed                      $raw
 * @return array<string, mixed>
 */
function bl_blocks_read_request_values(array $fields, $raw): array
{
	return bl_blocks_sanitize_values($fields, is_array($raw) ? $raw : []);
}

/**
 * Shared i18n strings for media library picker controls.
 *
 * @return array<string, string>
 */
function bl_blocks_media_field_i18n(): array
{
	return [
		'chooseImage'              => __('Choose image', 'baselayer-blocks'),
		'chooseImages'             => __('Choose images', 'baselayer-blocks'),
		'changeImage'              => __('Change image', 'baselayer-blocks'),
		'changeImages'             => __('Change images', 'baselayer-blocks'),
		'chooseFile'               => __('Choose file', 'baselayer-blocks'),
		'chooseFiles'              => __('Choose files', 'baselayer-blocks'),
		'changeFile'               => __('Change file', 'baselayer-blocks'),
		'changeFiles'              => __('Change files', 'baselayer-blocks'),
		'clearMedia'               => __('Clear', 'baselayer-blocks'),
		'chooseImageHelp'          => __('Select an image.', 'baselayer-blocks'),
		'chooseImagesHelp'         => __('Select one or more images.', 'baselayer-blocks'),
		'chooseFileHelp'           => __('Select a file.', 'baselayer-blocks'),
		'chooseFilesHelp'          => __('Select one or more files.', 'baselayer-blocks'),
		'mediaPickerTitleImage'    => __('Select image', 'baselayer-blocks'),
		'mediaPickerTitleImages'   => __('Select images', 'baselayer-blocks'),
		'mediaPickerTitleFile'     => __('Select file', 'baselayer-blocks'),
		'mediaPickerTitleFiles'    => __('Select files', 'baselayer-blocks'),
		'selectMedia'              => __('Select', 'baselayer-blocks'),
		'removeMedia'              => __('Remove', 'baselayer-blocks'),
	];
}

/**
 * Enqueue classic TinyMCE (`wp.editor` / `wp.oldEditor`) for Blocks WYSIWYG fields.
 */
function bl_blocks_enqueue_wysiwyg_editor(): void
{
	if (!function_exists('wp_enqueue_editor')) {
		return;
	}
	wp_enqueue_editor();
}

/**
 * Absolute URL for TinyMCE content CSS (iframe), or empty when the asset is missing.
 * Filterable for packages/plugins that need extra or replacement stylesheets.
 *
 * @return string
 */
function bl_blocks_wysiwyg_content_css_url(): string
{
	$asset = function_exists('bl_blocks_resolve_asset')
		? bl_blocks_resolve_asset('wysiwyg-content', 'css')
		: null;
	$url = is_array($asset) ? (string) ($asset['uri'] ?? '') : '';
	/**
	 * Filter Rich Text TinyMCE content_css URL(s).
	 *
	 * Return a URL string, a comma-separated list, or an array of URLs.
	 *
	 * @param string $url Package default stylesheet URI (may be empty).
	 */
	$filtered = apply_filters('bl_blocks_wysiwyg_content_css', $url);
	if (is_array($filtered)) {
		$urls = array_values(array_filter(array_map('esc_url_raw', $filtered)));
		return implode(',', $urls);
	}
	return esc_url_raw((string) $filtered);
}

/**
 * Shared admin field UI assets (createFieldForm + Website mount).
 */
function bl_blocks_enqueue_field_ui_assets(): void
{
	static $done = false;
	if ($done) {
		return;
	}
	$done = true;

	wp_enqueue_media();
	bl_blocks_enqueue_wysiwyg_editor();
	$builder_handle = function_exists('bl_blocks_enqueue_canvas_builder_kit')
		? bl_blocks_enqueue_canvas_builder_kit()
		: '';
	$script_deps = $builder_handle !== '' ? [$builder_handle] : [];
	bl_blocks_enqueue_style('bl-blocks-admin', 'blocks-admin');
	bl_blocks_enqueue_script('bl-blocks-admin', 'blocks-admin', $script_deps, true);
	if (function_exists('bl_enqueue_theme_icons_style')) {
		if (function_exists('bl_load_icons_textdomain')) {
			bl_load_icons_textdomain();
		}
		bl_enqueue_theme_icons_style(['bl-blocks-admin']);
	}

	wp_localize_script('bl-blocks-admin', 'blBlocksFieldUi', [
		'pagesRestUrl' => esc_url_raw(rest_url('wp/v2/pages')),
		'pickerPostTypes' => function_exists('bl_page_picker_post_types') ? bl_page_picker_post_types() : [],
		'restNonce'    => wp_create_nonce('wp_rest'),
		'wysiwygContentCss' => function_exists('bl_blocks_wysiwyg_content_css_url')
			? bl_blocks_wysiwyg_content_css_url()
			: '',
		'i18n'         => [
			'edit'                   => __('Edit', 'baselayer-blocks'),
			'save'                   => __('Save', 'baselayer-blocks'),
			'cancel'                 => __('Cancel', 'baselayer-blocks'),
			'close'                  => __('Close', 'baselayer-blocks'),
			'addRow'                => __('Add entry', 'baselayer-blocks'),
			'chooseEntriesHelp'      => __('Add one or more entries.', 'baselayer-blocks'),
			'removeRow'              => __('Remove entry', 'baselayer-blocks'),
			'rowLabel'               => __('Entry %d', 'baselayer-blocks'),
			'collapseEntry'          => __('Collapse', 'baselayer-blocks'),
			'expandEntry'            => __('Expand', 'baselayer-blocks'),
			'dragEntry'              => __('Drag to reorder', 'baselayer-blocks'),
			'repeater'               => __('Repeater', 'baselayer-blocks'),
			'rangeFrom'              => __('From', 'baselayer-blocks'),
			'rangeTo'                => __('To', 'baselayer-blocks'),
			'choosePage'             => __('Choose page', 'baselayer-blocks'),
			'choosePages'            => __('Choose pages', 'baselayer-blocks'),
			'changePage'             => __('Change page', 'baselayer-blocks'),
			'changePages'            => __('Change pages', 'baselayer-blocks'),
			'clearPage'              => __('Clear', 'baselayer-blocks'),
			'choosePageHelp'         => __('Select a page.', 'baselayer-blocks'),
			'choosePagesHelp'        => __('Select one or more pages.', 'baselayer-blocks'),
			'selectedPage'           => __('Selected page', 'baselayer-blocks'),
			'pagePickerTitle'        => __('Select a page', 'baselayer-blocks'),
			'pagePickerTitleMulti'   => __('Select pages', 'baselayer-blocks'),
			'pagePickerSearch'       => __('Search…', 'baselayer-blocks'),
			'pagePickerEmpty'        => __('No pages found.', 'baselayer-blocks'),
			'pagePickerLoading'      => __('Loading…', 'baselayer-blocks'),
			'pagePickerMore'         => __('More results available. Refine your search to narrow them down.', 'baselayer-blocks'),
			'pagePickerAll'          => __('All', 'baselayer-blocks'),
			/* translators: Confirm button in the page/relation picker modal. */
			'selectPage'             => _x('Select', 'verb', 'baselayer-blocks'),
			'linkTypePage'           => __('Page', 'baselayer-blocks'),
			'linkTypeUrl'            => __('URL', 'baselayer-blocks'),
			'linkTypeEmail'          => __('Email', 'baselayer-blocks'),
			'linkTypePhone'          => __('Phone', 'baselayer-blocks'),
			'linkTypeFile'           => __('File', 'baselayer-blocks'),
			'linkTypeLabel'          => __('Type', 'baselayer-blocks'),
			'linkDestPage'           => __('Page', 'baselayer-blocks'),
			'linkDestUrl'            => __('URL', 'baselayer-blocks'),
			'linkDestEmail'          => __('Email address', 'baselayer-blocks'),
			'linkDestPhone'          => __('Phone number', 'baselayer-blocks'),
			'linkDestFile'           => __('File', 'baselayer-blocks'),
			'linkText'               => __('Link text', 'baselayer-blocks'),
			'linkOpenNewTab'         => __('Open in new tab', 'baselayer-blocks'),
			'openFieldEditor'        => __('Open field editor', 'baselayer-blocks'),
			'chooseIcon'             => __('Choose icon', 'baselayer-blocks'),
			'clearIcon'              => __('Remove', 'baselayer-blocks'),
			'selectEmptyOptionPlaceholder' => __('Please select…', 'baselayer-blocks'),
		] + bl_blocks_media_field_i18n()
		  + (function_exists('bl_page_picker_field_i18n') ? bl_page_picker_field_i18n('baselayer-blocks') : []),
	]);
}
