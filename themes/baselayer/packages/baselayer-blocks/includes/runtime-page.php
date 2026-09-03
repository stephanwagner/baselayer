<?php

defined('ABSPATH') || exit;

/**
 * Register page-settings meta for REST (block editor).
 */
function bl_blocks_register_page_meta(): void
{
	$definitions = bl_blocks_query_definitions('page_settings', false);
	foreach ($definitions as $post) {
		$slug = bl_blocks_definition_slug((int) $post->ID);
		$meta_key = bl_blocks_page_meta_key($slug);
		register_post_meta('', $meta_key, [
			'type'              => 'object',
			'single'            => true,
			'show_in_rest'      => [
				'schema' => [
					'type'                 => 'object',
					'additionalProperties' => true,
				],
			],
			'auth_callback'     => static function (): bool {
				return current_user_can('edit_posts');
			},
			'sanitize_callback' => static function ($value) use ($post) {
				$config = bl_blocks_get_config((int) $post->ID);

				return bl_blocks_sanitize_values($config['fields'], is_array($value) ? $value : []);
			},
		]);
	}
}
add_action('init', 'bl_blocks_register_page_meta', 20);

/**
 * Active page_settings definitions assigned to a post type.
 *
 * @return list<array{id: int, title: string, fields: list<array>, metaKey: string, description: string, sidebarEditing: bool, contentEditing: bool, contentPlacement: string}>
 */
function bl_blocks_page_definitions_for_post_type(string $post_type): array
{
	$out = [];
	foreach (bl_blocks_query_definitions('page_settings', true) as $post) {
		$config = bl_blocks_get_config((int) $post->ID);
		$types = $config['settings']['post_types'] ?? [];
		if (!is_array($types) || !in_array($post_type, $types, true)) {
			continue;
		}
		$slug = bl_blocks_definition_slug((int) $post->ID, $config['settings']);
		$placement = ($config['settings']['content_placement'] ?? 'metabox') === 'after_title'
			? 'after_title'
			: 'metabox';
		$out[] = [
			'id'               => (int) $post->ID,
			'slug'             => $slug,
			'title'            => $post->post_title !== '' ? $post->post_title : __('Content Fields', 'baselayer-blocks'),
			'description'      => (string) ($config['settings']['description'] ?? ''),
			'fields'           => $config['fields'],
			'metaKey'          => bl_blocks_page_meta_key($slug),
			'sidebarEditing'   => !empty($config['settings']['sidebar_editing']),
			'contentEditing'   => !empty($config['settings']['content_editing']),
			'contentPlacement' => $placement,
		];
	}

	return $out;
}

/**
 * Whether this definition uses the content column (not the Gutenberg sidebar).
 *
 * @param array{contentEditing?: bool} $def
 */
function bl_blocks_page_def_location_is_content(array $def): bool
{
	return !empty($def['contentEditing']);
}

/**
 * @param array{contentPlacement?: string} $def
 */
function bl_blocks_page_def_content_placement(array $def): string
{
	return (($def['contentPlacement'] ?? 'metabox') === 'after_title') ? 'after_title' : 'metabox';
}

/**
 * Classic after-title panel (non-postbox). Gutenberg after_title uses a fixed metabox instead.
 *
 * @param array{contentEditing?: bool, contentPlacement?: string} $def
 */
function bl_blocks_page_def_uses_after_title(array $def, bool $is_block_editor): bool
{
	return !$is_block_editor
		&& bl_blocks_page_def_location_is_content($def)
		&& bl_blocks_page_def_content_placement($def) === 'after_title';
}

/**
 * Whether this definition should render as a content-column metabox on this screen.
 *
 * Classic + Sidebar location still gets a metabox (no document sidebar).
 * Gutenberg after_title falls back to a non-collapsible metabox.
 *
 * @param array{contentEditing?: bool, contentPlacement?: string} $def
 */
function bl_blocks_page_def_uses_content_metabox(array $def, bool $is_block_editor): bool
{
	if (bl_blocks_page_def_uses_after_title($def, $is_block_editor)) {
		return false;
	}

	if (bl_blocks_page_def_location_is_content($def)) {
		return true;
	}

	return !$is_block_editor;
}

/**
 * Whether the post form should include this definition's content-column values.
 *
 * @param array{contentEditing?: bool, contentPlacement?: string} $def
 */
function bl_blocks_page_def_uses_content_form(array $def, bool $is_block_editor): bool
{
	return bl_blocks_page_def_uses_content_metabox($def, $is_block_editor)
		|| bl_blocks_page_def_uses_after_title($def, $is_block_editor);
}

/**
 * Enqueue editor script for page settings panels.
 *
 * @param string $hook
 */
function bl_blocks_enqueue_page_editor(string $hook): void
{
	if (!in_array($hook, ['post.php', 'post-new.php'], true)) {
		return;
	}
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || $screen->post_type === BL_BLOCK_POST_TYPE) {
		return;
	}

	$defs = bl_blocks_page_definitions_for_post_type($screen->post_type);
	if ($defs === []) {
		return;
	}

	$is_block_editor = $screen->is_block_editor();
	$needs_content_ui = false;
	foreach ($defs as $def) {
		if (bl_blocks_page_def_uses_content_form($def, $is_block_editor)) {
			$needs_content_ui = true;
			break;
		}
	}

	if ($needs_content_ui && function_exists('bl_blocks_enqueue_field_ui_assets')) {
		bl_blocks_enqueue_field_ui_assets();
	}

	if (!$is_block_editor) {
		return;
	}

	$asset = bl_blocks_resolve_asset('blocks-editor', 'js');
	if ($asset === null) {
		return;
	}

	wp_enqueue_media();
	if (function_exists('bl_blocks_enqueue_wysiwyg_editor')) {
		bl_blocks_enqueue_wysiwyg_editor();
	}
	wp_enqueue_script(
		'bl-blocks-editor',
		$asset['uri'],
		['wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data', 'wp-i18n', 'wp-block-editor', 'wp-blocks', 'wp-compose', 'wp-api-fetch', 'media-editor', 'media-views'],
		$asset['ver'],
		true
	);
	bl_blocks_enqueue_style('bl-blocks-editor', 'blocks-editor');

	wp_localize_script('bl-blocks-editor', 'blBlocksEditor', [
		'blocks'       => function_exists('bl_blocks_active_block_payloads') ? bl_blocks_active_block_payloads() : [],
		'renderPath'   => 'baselayer-blocks/v1/render',
		'pagesRestUrl' => esc_url_raw(rest_url('wp/v2/pages')),
		'pickerPostTypes' => function_exists('bl_page_picker_post_types') ? bl_page_picker_post_types() : [],
		'restNonce'    => wp_create_nonce('wp_rest'),
		'wysiwygContentCss' => function_exists('bl_blocks_wysiwyg_content_css_url')
			? bl_blocks_wysiwyg_content_css_url()
			: '',
		'i18n'         => [
			'edit'                   => __('Edit fields', 'baselayer-blocks'),
			'save'                   => __('Apply', 'baselayer-blocks'),
			'cancel'                 => __('Cancel', 'baselayer-blocks'),
			'panelTitle'             => __('Block fields', 'baselayer-blocks'),
			'noEditableFields'       => __('This block has no editable fields. Add fields to the block definition to configure it here.', 'baselayer-blocks'),
			'preview'                => __('Edit fields to configure this block.', 'baselayer-blocks'),
			'previewError'           => __('Error loading preview: %s', 'baselayer-blocks'),
			'previewEmpty'           => __('Block has no content.', 'baselayer-blocks'),
			'templateMissing'        => __('Template missing.', 'baselayer-blocks'),
			'addRow'                => __('Add entry', 'baselayer-blocks'),
			'chooseEntriesHelp'      => __('Add one or more entries.', 'baselayer-blocks'),
			'removeRow'              => __('Remove entry', 'baselayer-blocks'),
			'rowLabel'               => __('Entry %d', 'baselayer-blocks'),
			'collapseEntry'          => __('Collapse', 'baselayer-blocks'),
			'expandEntry'            => __('Expand', 'baselayer-blocks'),
			'dragEntry'              => __('Drag to reorder', 'baselayer-blocks'),
			'close'                  => __('Close', 'baselayer-blocks'),
			'choosePage'             => __('Choose page', 'baselayer-blocks'),
			'choosePages'            => __('Choose pages', 'baselayer-blocks'),
			'changePage'             => __('Change page', 'baselayer-blocks'),
			'changePages'            => __('Change pages', 'baselayer-blocks'),
			'chooseIcon'             => __('Choose icon', 'baselayer-blocks'),
			'clearIcon'              => __('Remove', 'baselayer-blocks'),
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
			'selectEmptyOptionPlaceholder' => __('Please select…', 'baselayer-blocks'),
		] + (function_exists('bl_blocks_media_field_i18n') ? bl_blocks_media_field_i18n() : [])
		  + (function_exists('bl_page_picker_field_i18n') ? bl_page_picker_field_i18n('baselayer-blocks') : []),
	]);

	$post_id = isset($_GET['post']) ? (int) $_GET['post'] : 0;
	$payload = [];
	foreach ($defs as $def) {
		$values = [];
		if ($post_id > 0) {
			$def_id = (int) ($def['id'] ?? 0);
			$slug = (string) ($def['slug'] ?? '');
			if ($def_id > 0 && $slug !== '') {
				bl_blocks_maybe_migrate_page_settings_meta($post_id, $slug, $def_id);
			}
			$raw = get_post_meta($post_id, (string) ($def['metaKey'] ?? ''), true);
			$values = is_array($raw) ? $raw : [];
		}
		$payload[] = array_merge($def, ['values' => $values]);
	}

	wp_localize_script('bl-blocks-editor', 'blBlocksPage', [
		'definitions' => $payload,
		'postId'      => $post_id,
		'i18n'        => [
			'edit'            => __('Edit', 'baselayer-blocks'),
			'save'            => __('Update', 'baselayer-blocks'),
			'cancel'          => __('Cancel', 'baselayer-blocks'),
			'panelTitle'      => __('Content Fields', 'baselayer-blocks'),
			'openFields'      => __('Edit fields', 'baselayer-blocks'),
			'openFieldEditor' => __('Open field editor', 'baselayer-blocks'),
			'noEditableFields' => __('This block has no editable fields. Add fields to the block definition to configure it here.', 'baselayer-blocks'),
		],
	]);
}
add_action('admin_enqueue_scripts', 'bl_blocks_enqueue_page_editor');

/**
 * Content-column metaboxes for page_settings (classic screens, or content_editing).
 */
function bl_blocks_register_page_content_metaboxes(): void
{
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || $screen->post_type === '' || $screen->post_type === BL_BLOCK_POST_TYPE) {
		return;
	}

	$defs = bl_blocks_page_definitions_for_post_type($screen->post_type);
	if ($defs === []) {
		return;
	}

	$is_block_editor = $screen->is_block_editor();
	foreach ($defs as $def) {
		if (!bl_blocks_page_def_uses_content_metabox($def, $is_block_editor)) {
			continue;
		}
		$box_id = 'bl_blocks_page_content_' . (int) $def['id'];
		$fixed = $is_block_editor
			&& bl_blocks_page_def_location_is_content($def)
			&& bl_blocks_page_def_content_placement($def) === 'after_title';
		add_meta_box(
			$box_id,
			(string) $def['title'],
			'bl_blocks_render_page_content_metabox',
			$screen->post_type,
			'normal',
			'high',
			[
				'def' => $def,
				'__block_editor_compatible_meta_box' => true,
			]
		);
		if ($fixed) {
			$screen_id = (string) $screen->id;
			add_filter(
				'postbox_classes_' . $screen_id . '_' . $box_id,
				static function (array $classes): array {
					$classes[] = 'bl-blocks-postbox--fixed';
					return $classes;
				}
			);
		}
	}
}
add_action('add_meta_boxes', 'bl_blocks_register_page_content_metaboxes');

/**
 * Classic after-title panel for content_placement=after_title.
 */
function bl_blocks_render_page_after_title(WP_Post $post): void
{
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || $screen->post_type === '' || $screen->post_type === BL_BLOCK_POST_TYPE) {
		return;
	}
	if ($screen->is_block_editor()) {
		return;
	}

	$defs = bl_blocks_page_definitions_for_post_type($screen->post_type);
	foreach ($defs as $def) {
		if (!bl_blocks_page_def_uses_after_title($def, false)) {
			continue;
		}
		$title = (string) ($def['title'] ?? '');
		echo '<div class="bl-blocks-after-title" id="bl_blocks_page_content_' . esc_attr((string) (int) ($def['id'] ?? 0)) . '">';
		if ($title !== '') {
			echo '<h2 class="bl-blocks-after-title__title">' . esc_html($title) . '</h2>';
		}
		bl_blocks_render_page_content_metabox($post, ['args' => ['def' => $def]]);
		echo '</div>';
	}
}
add_action('edit_form_after_title', 'bl_blocks_render_page_after_title');

/**
 * @param WP_Post $post
 * @param array{args?: array{def?: array}} $box
 */
function bl_blocks_render_page_content_metabox($post, array $box): void
{
	$def = is_array($box['args']['def'] ?? null) ? $box['args']['def'] : [];
	if ($def === []) {
		return;
	}

	static $nonce_printed = false;
	if (!$nonce_printed) {
		wp_nonce_field('bl_blocks_save_page_fields', 'bl_blocks_page_fields_nonce');
		$nonce_printed = true;
	}

	$post_id = (int) $post->ID;
	$def_id = (int) ($def['id'] ?? 0);
	$slug = (string) ($def['slug'] ?? '');
	$meta_key = (string) ($def['metaKey'] ?? '');
	if ($post_id > 0 && $def_id > 0 && $slug !== '') {
		bl_blocks_maybe_migrate_page_settings_meta($post_id, $slug, $def_id);
	}
	$values = [];
	if ($post_id > 0 && $meta_key !== '') {
		$raw = get_post_meta($post_id, $meta_key, true);
		$values = is_array($raw) ? $raw : [];
	}

	$payload = wp_json_encode(
		[
			'fields' => isset($def['fields']) && is_array($def['fields']) ? $def['fields'] : [],
			'values' => $values,
		],
		JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE
	);
	if (!is_string($payload)) {
		$payload = '{"fields":[],"values":{}}';
	}

	if (!empty($def['description'])) {
		echo '<p class="description bl-blocks-fields__description">' . esc_html((string) $def['description']) . '</p>';
	}

	echo '<div class="bl-blocks-content-fields">';
	echo '<input type="hidden" name="bl_blocks_page_values[' . esc_attr($meta_key) . ']" value="" data-bl-blocks-classic-json>';
	echo '<div data-bl-blocks-classic-fields>';
	echo '<script type="application/json" data-bl-blocks-classic-config>' . $payload . '</script>';
	echo '</div></div>';
}

/**
 * Save content-column page field values from the post form.
 */
function bl_blocks_save_page_content_fields(int $post_id, WP_Post $post): void
{
	if ($post->post_type === BL_BLOCK_POST_TYPE) {
		return;
	}
	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
		return;
	}
	if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
		return;
	}
	if (!isset($_POST['bl_blocks_page_fields_nonce'])
		|| !wp_verify_nonce((string) $_POST['bl_blocks_page_fields_nonce'], 'bl_blocks_save_page_fields')
	) {
		return;
	}
	if (!current_user_can('edit_post', $post_id)) {
		return;
	}

	$raw_map = $_POST['bl_blocks_page_values'] ?? null;
	if (!is_array($raw_map)) {
		return;
	}

	$is_block_editor = function_exists('use_block_editor_for_post')
		? (bool) use_block_editor_for_post($post)
		: false;
	$defs = bl_blocks_page_definitions_for_post_type($post->post_type);
	foreach ($defs as $def) {
		if (!bl_blocks_page_def_uses_content_form($def, $is_block_editor)) {
			continue;
		}
		$meta_key = (string) ($def['metaKey'] ?? '');
		if ($meta_key === '' || !array_key_exists($meta_key, $raw_map)) {
			continue;
		}
		$decoded = json_decode(wp_unslash((string) $raw_map[$meta_key]), true);
		$fields = isset($def['fields']) && is_array($def['fields']) ? $def['fields'] : [];
		$values = bl_blocks_sanitize_values($fields, is_array($decoded) ? $decoded : []);
		update_post_meta($post_id, $meta_key, $values);
	}
}
add_action('save_post', 'bl_blocks_save_page_content_fields', 10, 2);
