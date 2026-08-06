<?php

defined('ABSPATH') || exit;

/**
 * Gutenberg block name for a definition slug.
 */
function bl_blocks_gutenberg_name(string $slug): string
{
	$slug = sanitize_key($slug);
	if ($slug === '') {
		$slug = 'block';
	}

	return 'baselayer/' . $slug;
}

/**
 * Relative theme path for a block render template: blocks/{slug}/{slug}.php
 */
function bl_blocks_template_relative_path(string $slug): string
{
	$slug = sanitize_key($slug);
	if ($slug === '') {
		$slug = 'block';
	}

	return 'blocks/' . $slug . '/' . $slug . '.php';
}

/**
 * Absolute path to an existing block template, or empty string.
 */
function bl_blocks_locate_template(string $slug): string
{
	$relative = bl_blocks_template_relative_path($slug);
	$path = get_theme_file_path('/' . $relative);
	if (is_string($path) && $path !== '' && is_readable($path)) {
		return $path;
	}

	return '';
}

/**
 * Template status for admin UI.
 *
 * @return array{exists: bool, relative: string, absolute: string, display_path: string, create_path: string}
 */
function bl_blocks_template_info(string $slug): array
{
	$relative = bl_blocks_template_relative_path($slug);
	$absolute = bl_blocks_locate_template($slug);
	$exists = $absolute !== '';

	$stylesheet = trailingslashit(get_stylesheet_directory());
	$template = trailingslashit(get_template_directory());
	$create_abs = $stylesheet . $relative;

	$display = $relative;
	if ($exists) {
		if (str_starts_with($absolute, $stylesheet)) {
			$display = ltrim(substr($absolute, strlen($stylesheet)), '/');
		} elseif (str_starts_with($absolute, $template)) {
			$display = ltrim(substr($absolute, strlen($template)), '/');
		} else {
			$display = $absolute;
		}
	}

	return [
		'exists'       => $exists,
		'relative'     => $relative,
		'absolute'     => $exists ? $absolute : $create_abs,
		'display_path' => $display,
		'create_path'  => $relative,
	];
}

/**
 * Payload for one block definition (editor + registration).
 *
 * @return array<string, mixed>|null
 */
function bl_blocks_block_definition_payload(WP_Post $post): ?array
{
	if (bl_blocks_get_definition_type((int) $post->ID) !== 'block') {
		return null;
	}
	$config = bl_blocks_get_config((int) $post->ID);
	if ($post->post_status !== 'publish' || empty($config['settings']['active'])) {
		return null;
	}
	$slug = bl_blocks_definition_slug((int) $post->ID, $config['settings']);
	$title = $post->post_title !== '' ? $post->post_title : $slug;
	$keywords = array_values(array_filter(array_map(
		'trim',
		explode(',', (string) ($config['settings']['block_keywords'] ?? ''))
	)));

	$raw_icon = (string) ($config['settings']['block_icon'] ?? 'block-default');
	$gutenberg_icon = bl_blocks_resolve_gutenberg_icon($raw_icon);

	return [
		'id'              => (int) $post->ID,
		'name'            => bl_blocks_gutenberg_name($slug),
		'slug'            => $slug,
		'title'           => $title,
		'description'     => (string) ($config['settings']['description'] ?? ''),
		'icon'            => $gutenberg_icon,
		'iconRaw'         => $raw_icon,
		'category'        => (string) ($config['settings']['block_category'] ?? 'widgets'),
		'keywords'        => $keywords,
		'fields'               => $config['fields'],
		'sidebarEditing'       => !empty($config['settings']['sidebar_editing']),
		'supportsInnerBlocks'  => !empty($config['settings']['supports_inner_blocks']),
		'innerBlocksAllowed'   => !empty($config['settings']['supports_inner_blocks'])
			? bl_blocks_parse_inner_blocks_allowed((string) ($config['settings']['inner_blocks_allowed'] ?? ''))
			: [],
		'innerBlocksTemplate'  => !empty($config['settings']['supports_inner_blocks'])
			? bl_blocks_parse_inner_blocks_template((string) ($config['settings']['inner_blocks_template'] ?? ''))
			: null,
		'parent'               => bl_blocks_parse_inner_blocks_allowed((string) ($config['settings']['parent'] ?? '')),
		'align'                => bl_blocks_parse_align_supports((string) ($config['settings']['align'] ?? '')),
		'templateExists'       => bl_blocks_locate_template($slug) !== '',
		'createPath'           => bl_blocks_template_info($slug)['create_path'],
	];
}

/**
 * @return list<array<string, mixed>>
 */
function bl_blocks_active_block_payloads(): array
{
	$out = [];
	foreach (bl_blocks_query_definitions('block', true) as $post) {
		$payload = bl_blocks_block_definition_payload($post);
		if ($payload !== null) {
			$out[] = $payload;
		}
	}

	return $out;
}

/**
 * Register dynamic Gutenberg blocks from definitions.
 */
function bl_blocks_register_dynamic_blocks(): void
{
	if (!function_exists('register_block_type')) {
		return;
	}

	$asset = bl_blocks_resolve_asset('blocks-editor', 'js');
	$editor_script = '';
	if ($asset !== null) {
		wp_register_script(
			'bl-blocks-editor',
			$asset['uri'],
			[
				'wp-blocks',
				'wp-element',
				'wp-block-editor',
				'wp-components',
				'wp-i18n',
				'wp-data',
				'wp-plugins',
				'wp-edit-post',
				'wp-compose',
				'wp-api-fetch',
			],
			$asset['ver'],
			true
		);
		$editor_script = 'bl-blocks-editor';
	}

	$css = bl_blocks_resolve_asset('blocks-editor', 'css');
	if ($css !== null) {
		wp_register_style('bl-blocks-editor', $css['uri'], [], $css['ver']);
	}

	foreach (bl_blocks_active_block_payloads() as $def) {
		$args = [
			'api_version'     => 3,
			'title'           => $def['title'],
			'description'     => $def['description'],
			'category'        => $def['category'] !== '' ? $def['category'] : 'widgets',
			'icon'            => !empty($def['icon']) ? $def['icon'] : 'block-default',
			'keywords'        => $def['keywords'],
			'attributes'      => [
				'values' => [
					// object|array: empty {} often arrives as [] over REST.
					'type'                 => ['object', 'array'],
					'default'              => [],
					'additionalProperties' => true,
				],
				// Editor-only UI chrome (e.g. repeater collapsed flags). Not used in render.
				'ui' => [
					'type'                 => ['object', 'array'],
					'default'              => [],
					'additionalProperties' => true,
				],
			],
			'supports'        => [
				'html'      => false,
				'className' => true,
				'anchor'    => true,
			],
			'render_callback' => static function (array $attributes, string $content, $block) use ($def): string {
				return bl_blocks_render_block($def, $attributes, $content);
			},
		];
		if (!empty($def['supportsInnerBlocks'])) {
			// Inner content is saved via InnerBlocks.Content in the editor script.
			$args['supports']['innerBlocks'] = true;
		}
		$parent = isset($def['parent']) && is_array($def['parent']) ? $def['parent'] : [];
		if ($parent !== []) {
			$args['parent'] = array_values($parent);
		}
		$align = isset($def['align']) && is_array($def['align']) ? $def['align'] : [];
		if ($align !== []) {
			$args['supports']['align'] = array_values($align);
		}
		if ($editor_script !== '') {
			$args['editor_script'] = $editor_script;
			$args['editor_style'] = 'bl-blocks-editor';
		}
		register_block_type($def['name'], $args);
	}

	if ($editor_script !== '') {
		wp_localize_script('bl-blocks-editor', 'blBlocksEditor', [
			'blocks'       => bl_blocks_active_block_payloads(),
			'renderPath'   => 'baselayer-blocks/v1/render',
			'pagesRestUrl' => esc_url_raw(rest_url('wp/v2/pages')),
			'pickerPostTypes' => function_exists('bl_page_picker_post_types') ? bl_page_picker_post_types() : [],
			'restNonce'    => wp_create_nonce('wp_rest'),
			'i18n'         => [
				'edit'                   => __('Edit fields', 'baselayer-blocks'),
				'openFieldEditor'        => __('Open field editor', 'baselayer-blocks'),
				'save'                   => __('Apply', 'baselayer-blocks'),
				'cancel'                 => __('Cancel', 'baselayer-blocks'),
				'panelTitle'             => __('Block fields', 'baselayer-blocks'),
				'noEditableFields'       => __('This block has no editable fields. Add fields to the block definition to configure it here.', 'baselayer-blocks'),
				'preview'                => __('Edit fields to configure this block.', 'baselayer-blocks'),
				'previewError'           => __('Error loading preview: %s', 'baselayer-blocks'),
				'previewEmpty'           => __('Block rendered as empty.', 'baselayer-blocks'),
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
				'chooseIcon'             => __('Choose icon', 'baselayer-blocks'),
				'clearIcon'              => __('Remove', 'baselayer-blocks'),
				'changePages'            => __('Change pages', 'baselayer-blocks'),
				'clearPage'              => __('Clear', 'baselayer-blocks'),
				'choosePageHelp'         => __('Select a page.', 'baselayer-blocks'),
				'choosePagesHelp'        => __('Select one or more pages.', 'baselayer-blocks'),
				'selectedPage'           => __('Selected page', 'baselayer-blocks'),
				'pagePickerTitle'        => __('Select a page', 'baselayer-blocks'),
				'pagePickerTitleMulti'   => __('Select pages', 'baselayer-blocks'),
				'pagePickerSearch'       => __('Search pages…', 'baselayer-blocks'),
				'pagePickerEmpty'        => __('No pages found.', 'baselayer-blocks'),
				'pagePickerLoading'      => __('Loading…', 'baselayer-blocks'),
				'pagePickerMore'         => __('More results available. Refine your search to narrow them down.', 'baselayer-blocks'),
				'pagePickerAll'          => __('All', 'baselayer-blocks'),
				'selectPage'             => __('Select', 'baselayer-blocks'),
				'linkTypePage'           => __('Page', 'baselayer-blocks'),
				'linkTypeUrl'            => __('URL', 'baselayer-blocks'),
				'linkTypeEmail'          => __('Email', 'baselayer-blocks'),
				'linkTypePhone'          => __('Phone', 'baselayer-blocks'),
				'linkTypeLabel'          => __('Type', 'baselayer-blocks'),
				'linkDestPage'           => __('Page', 'baselayer-blocks'),
				'linkDestUrl'            => __('URL', 'baselayer-blocks'),
				'linkDestEmail'          => __('Email address', 'baselayer-blocks'),
				'linkDestPhone'          => __('Phone number', 'baselayer-blocks'),
				'linkText'               => __('Link text', 'baselayer-blocks'),
				'linkOpenNewTab'         => __('Open in new tab', 'baselayer-blocks'),
				'selectEmptyOptionPlaceholder' => __('Please select…', 'baselayer-blocks'),
			] + (function_exists('bl_blocks_media_field_i18n') ? bl_blocks_media_field_i18n() : []),
		]);
	}
}
add_action('init', 'bl_blocks_register_dynamic_blocks', 30);

/**
 * Ensure media modal is available when editing Blocks in the block editor.
 */
function bl_blocks_enqueue_block_editor_media(): void
{
	if (!function_exists('bl_blocks_active_block_payloads')) {
		return;
	}
	if (bl_blocks_active_block_payloads() === []) {
		return;
	}
	wp_enqueue_media();
	if (function_exists('bl_enqueue_theme_icons_style')) {
		if (function_exists('bl_load_icons_textdomain')) {
			bl_load_icons_textdomain();
		}
		bl_enqueue_theme_icons_style(['bl-blocks-editor']);
	}
	if (function_exists('bl_icons_localize_payload') && wp_script_is('bl-blocks-editor', 'registered')) {
		wp_localize_script('bl-blocks-editor', 'baselayerIcons', bl_icons_localize_payload());
	}
}
add_action('enqueue_block_editor_assets', 'bl_blocks_enqueue_block_editor_media');

/**
 * Editor preview REST: only name + values (avoids core block-renderer attribute schema fights).
 */
function bl_blocks_register_rest_routes(): void
{
	register_rest_route('baselayer-blocks/v1', '/render', [
		'methods'             => 'POST',
		'callback'            => 'bl_blocks_rest_render_block',
		'permission_callback' => static function (): bool {
			return current_user_can('edit_posts');
		},
		'args'                => [
			'name'   => [
				'required'          => true,
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			],
			'values' => [
				'required'          => false,
				'default'           => [],
				'validate_callback' => static function ($value): bool {
					return $value === null || is_array($value) || is_object($value);
				},
			],
			'className' => [
				'required'          => false,
				'default'           => '',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			],
		],
	]);

	register_rest_route('baselayer-blocks/v1', '/starter-template', [
		'methods'             => 'POST',
		'callback'            => 'bl_blocks_rest_starter_template',
		'permission_callback' => static function (): bool {
			return function_exists('bl_blocks_user_can_manage') && bl_blocks_user_can_manage();
		},
		'args'                => [
			'postId' => [
				'required'          => true,
				'type'              => 'integer',
				'sanitize_callback' => 'absint',
			],
			'write'  => [
				'required' => false,
				'type'     => 'boolean',
				'default'  => false,
			],
			'fromFile' => [
				'required' => false,
				'type'     => 'boolean',
				'default'  => false,
			],
			'fields' => [
				'required' => false,
				'default'  => null,
			],
			'title'  => [
				'required'          => false,
				'type'              => 'string',
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
			],
		],
	]);
}
add_action('rest_api_init', 'bl_blocks_register_rest_routes');

/**
 * Preview or write a starter theme template for a block definition.
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function bl_blocks_rest_starter_template(WP_REST_Request $request)
{
	$post_id = (int) $request->get_param('postId');
	$post = get_post($post_id);
	if (!($post instanceof WP_Post) || $post->post_type !== BL_BLOCK_POST_TYPE) {
		return new WP_Error(
			'bl_blocks_invalid_post',
			__('Invalid block definition.', 'baselayer-blocks'),
			['status' => 404]
		);
	}
	if (bl_blocks_get_definition_type($post_id) !== 'block') {
		return new WP_Error(
			'bl_blocks_not_block',
			__('Starter templates are only available for blocks.', 'baselayer-blocks'),
			['status' => 400]
		);
	}

	$config = bl_blocks_get_config($post_id);
	$slug = bl_blocks_definition_slug($post_id, $config['settings']);
	$from_file = (bool) $request->get_param('fromFile');
	$write = (bool) $request->get_param('write');

	if ($from_file) {
		if ($write) {
			return new WP_Error(
				'bl_blocks_invalid_from_file',
				__('Cannot write when reading an existing template file.', 'baselayer-blocks'),
				['status' => 400]
			);
		}
		$info = bl_blocks_template_info($slug);
		if (!$info['exists'] || $info['absolute'] === '' || !is_readable($info['absolute'])) {
			return new WP_Error(
				'bl_blocks_template_missing',
				__('Could not read the template file.', 'baselayer-blocks'),
				['status' => 404]
			);
		}
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- reading theme template for admin preview.
		$code = file_get_contents($info['absolute']);
		if (!is_string($code)) {
			return new WP_Error(
				'bl_blocks_template_read_failed',
				__('Could not read the template file.', 'baselayer-blocks'),
				['status' => 500]
			);
		}

		return rest_ensure_response([
			'code'     => $code,
			'slug'     => $slug,
			'fromFile' => true,
		]);
	}

	$raw_fields = $request->get_param('fields');
	if (is_array($raw_fields)) {
		$sanitized = bl_blocks_sanitize_config(['fields' => $raw_fields, 'settings' => []], 'block');
		$fields = isset($sanitized['fields']) && is_array($sanitized['fields']) ? $sanitized['fields'] : [];
	} else {
		$fields = isset($config['fields']) && is_array($config['fields']) ? $config['fields'] : [];
	}

	$title = (string) $request->get_param('title');
	if ($title === '') {
		$title = $post->post_title !== '' ? $post->post_title : $slug;
	}

	$supports_inner = !empty($config['settings']['supports_inner_blocks']);
	$code = bl_blocks_build_starter_template($slug, $title, $fields, $supports_inner);

	if (!$write) {
		return rest_ensure_response([
			'code' => $code,
			'slug' => $slug,
		]);
	}

	$result = bl_blocks_write_starter_template($slug, $code);
	if (is_wp_error($result)) {
		$result->add_data(['status' => 400]);

		return $result;
	}

	return rest_ensure_response([
		'code'         => $code,
		'slug'         => $slug,
		'written'      => true,
		'display_path' => $result['display_path'],
	]);
}

/**
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function bl_blocks_rest_render_block(WP_REST_Request $request)
{
	$name = (string) $request->get_param('name');
	$values = $request->get_param('values');
	if (is_object($values)) {
		$values = (array) $values;
	}
	if (!is_array($values)) {
		$values = [];
	}

	$class_name = $request->get_param('className');
	if (!is_string($class_name)) {
		$class_name = '';
	}

	$def = null;
	foreach (bl_blocks_active_block_payloads() as $payload) {
		if (($payload['name'] ?? '') === $name) {
			$def = $payload;
			break;
		}
	}
	if ($def === null) {
		return new WP_Error(
			'bl_blocks_unknown_block',
			__('Unknown block.', 'baselayer-blocks'),
			['status' => 404]
		);
	}

	$attributes = ['values' => $values];
	if ($class_name !== '') {
		$attributes['className'] = $class_name;
	}

	return rest_ensure_response([
		'rendered' => bl_blocks_render_block($def, $attributes),
	]);
}

/**
 * Whether the current render is an editor preview REST request.
 */
function bl_blocks_is_editor_render(): bool
{
	if (!defined('REST_REQUEST') || !REST_REQUEST) {
		return false;
	}

	$route = '';
	if (isset($GLOBALS['wp']) && is_object($GLOBALS['wp']) && isset($GLOBALS['wp']->query_vars['rest_route'])) {
		$route = (string) $GLOBALS['wp']->query_vars['rest_route'];
	}
	if ($route === '' && isset($_SERVER['REQUEST_URI'])) {
		$route = (string) wp_unslash($_SERVER['REQUEST_URI']);
	}

	return str_contains($route, '/baselayer-blocks/v1/render')
		|| str_contains($route, '/block-renderer/');
}

/**
 * Field-value dump used when the theme template is missing (frontend) or empty.
 *
 * @param array<string, mixed> $def
 * @param array<string, mixed> $values
 */
function bl_blocks_render_block_fallback(array $def, array $values): string
{
	$fields = isset($def['fields']) && is_array($def['fields']) ? $def['fields'] : [];
	$slug = (string) ($def['slug'] ?? '');
	$title = esc_html((string) ($def['title'] ?? 'Block'));
	$parts = [];
	foreach (bl_blocks_iter_fields($fields) as $field) {
		$name = (string) ($field['name'] ?? '');
		if ($name === '' || !array_key_exists($name, $values)) {
			continue;
		}
		$val = $values[$name];
		if (is_array($val)) {
			$encoded = wp_json_encode($val);
			$val = is_string($encoded) ? $encoded : '';
		}
		if ((string) $val === '') {
			continue;
		}
		$label = (string) ($field['label'] ?? $name);
		$parts[] = '<li><strong>' . esc_html($label) . ':</strong> ' . esc_html((string) $val) . '</li>';
	}

	$wrapper = get_block_wrapper_attributes([
		'class' => 'bl-blocks-block bl-blocks-block--' . sanitize_html_class($slug),
	]);

	$html = '<div ' . $wrapper . '>';
	$html .= '<p class="bl-blocks-block__title">' . $title . '</p>';
	if ($parts !== []) {
		$html .= '<ul class="bl-blocks-block__values">' . implode('', $parts) . '</ul>';
	}
	$html .= '</div>';

	return $html;
}

/**
 * Editor-only notice when the theme template file is missing.
 *
 * @param array<string, mixed> $def
 */
function bl_blocks_render_missing_template_notice(string $slug, array $def): string
{
	$info = bl_blocks_template_info($slug);
	$title = (string) ($def['title'] ?? $slug);
	$name = bl_blocks_gutenberg_name($slug);

	$html = '<div class="bl-blocks-block-missing-template">';
	$html .= '<p class="bl-blocks-block-missing-template__title"><strong>' . esc_html($title) . '</strong></p>';
	$html .= '<p class="bl-blocks-block-missing-template__name"><code>' . esc_html($name) . '</code></p>';
	$html .= '<p class="bl-blocks-block-missing-template__status">' . esc_html__('Template missing.', 'baselayer-blocks') . '</p>';
	$html .= '<p class="bl-blocks-block-missing-template__help">' . esc_html__('Create this PHP file in your theme:', 'baselayer-blocks') . '</p>';
	$html .= '<p class="bl-blocks-block-missing-template__path"><code>' . esc_html($info['create_path']) . '</code></p>';
	$html .= '</div>';

	return $html;
}

/**
 * Front/editor render: theme template when present, otherwise notice (editor) or field dump.
 *
 * Template path: blocks/{slug}/{slug}.php (child theme preferred).
 * Available in the template: bl_block_field(), bl_block_inner_blocks(), $values, $fields,
 * $block, $attributes, $def, $content. ACF-style <InnerBlocks /> tags are expanded to $content.
 *
 * @param array<string, mixed> $def
 * @param array<string, mixed> $attributes
 */
function bl_blocks_render_block(array $def, array $attributes, string $content = ''): string
{
	$values = isset($attributes['values']) && is_array($attributes['values'])
		? bl_blocks_sanitize_values($def['fields'], $attributes['values'])
		: [];
	if ($values === [] && isset($attributes['values']) && is_object($attributes['values'])) {
		$values = bl_blocks_sanitize_values($def['fields'], (array) $attributes['values']);
	}
	$fields = isset($def['fields']) && is_array($def['fields']) ? $def['fields'] : [];
	$slug = (string) ($def['slug'] ?? '');
	$block = $def;

	$path = bl_blocks_locate_template($slug);
	if ($path === '') {
		if (bl_blocks_is_editor_render()) {
			return bl_blocks_render_missing_template_notice($slug, $def);
		}

		return bl_blocks_render_block_fallback($def, $values);
	}

	bl_blocks_set_field_context($values, $fields, $content);
	ob_start();
	try {
		include $path;
	} finally {
		$html = trim((string) ob_get_clean());
		bl_blocks_reset_field_context();
	}
	if ($html === '') {
		return bl_blocks_render_block_fallback($def, $values);
	}

	// Editor canvas parses <InnerBlocks /> into a live React hole (ACF-style).
	// Front / normal renders expand the tag to saved inner HTML.
	if (bl_blocks_is_editor_render()) {
		return $html;
	}

	return bl_blocks_expand_inner_blocks_tags($html, $content);
}
