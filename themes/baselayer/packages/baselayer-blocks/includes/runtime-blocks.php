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
	$title = (string) ($config['settings']['block_title'] ?? '');
	if ($title === '') {
		$title = $post->post_title !== '' ? $post->post_title : $slug;
	}
	$keywords = array_values(array_filter(array_map(
		'trim',
		explode(',', (string) ($config['settings']['block_keywords'] ?? ''))
	)));

	$raw_icon = (string) ($config['settings']['block_icon'] ?? 'block-default');
	$gutenberg_icon = bl_blocks_resolve_gutenberg_icon($raw_icon);

	return [
		'id'          => (int) $post->ID,
		'name'        => bl_blocks_gutenberg_name($slug),
		'slug'        => $slug,
		'title'       => $title,
		'description' => (string) ($config['settings']['description'] ?? ''),
		'icon'        => $gutenberg_icon,
		'iconRaw'     => $raw_icon,
		'category'    => (string) ($config['settings']['block_category'] ?? 'widgets'),
		'keywords'    => $keywords,
		'fields'      => $config['fields'],
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
			['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n', 'wp-data', 'wp-plugins', 'wp-edit-post', 'wp-compose'],
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
					'type'    => 'object',
					'default' => (object) [],
				],
			],
			'supports'        => [
				'html'      => false,
				'className' => true,
				'anchor'    => true,
			],
			'render_callback' => static function (array $attributes, string $content, $block) use ($def): string {
				return bl_blocks_render_block($def, $attributes);
			},
		];
		if ($editor_script !== '') {
			$args['editor_script'] = $editor_script;
			$args['editor_style'] = 'bl-blocks-editor';
		}
		register_block_type($def['name'], $args);
	}

	if ($editor_script !== '') {
		wp_localize_script('bl-blocks-editor', 'blBlocksEditor', [
			'blocks' => bl_blocks_active_block_payloads(),
			'i18n'   => [
				'edit'       => __('Edit fields', 'baselayer-blocks'),
				'save'       => __('Apply', 'baselayer-blocks'),
				'cancel'     => __('Cancel', 'baselayer-blocks'),
				'panelTitle' => __('Block fields', 'baselayer-blocks'),
				'preview'    => __('Edit fields to configure this block.', 'baselayer-blocks'),
			],
		]);
	}
}
add_action('init', 'bl_blocks_register_dynamic_blocks', 30);

/**
 * Minimal front/editor render.
 *
 * @param array<string, mixed> $def
 * @param array<string, mixed> $attributes
 */
function bl_blocks_render_block(array $def, array $attributes): string
{
	$values = isset($attributes['values']) && is_array($attributes['values'])
		? bl_blocks_sanitize_values($def['fields'], $attributes['values'])
		: [];

	$title = esc_html((string) ($def['title'] ?? 'Block'));
	$parts = [];
	foreach (bl_blocks_iter_fields($def['fields']) as $field) {
		$name = (string) ($field['name'] ?? '');
		if ($name === '' || !array_key_exists($name, $values)) {
			continue;
		}
		$val = $values[$name];
		if (is_array($val)) {
			$val = implode(', ', array_map('strval', $val));
		}
		if ((string) $val === '') {
			continue;
		}
		$label = (string) ($field['label'] ?? $name);
		$parts[] = '<li><strong>' . esc_html($label) . ':</strong> ' . esc_html((string) $val) . '</li>';
	}

	$wrapper = get_block_wrapper_attributes([
		'class' => 'bl-blocks-block bl-blocks-block--' . sanitize_html_class((string) ($def['slug'] ?? '')),
	]);

	$html = '<div ' . $wrapper . '>';
	$html .= '<p class="bl-blocks-block__title">' . $title . '</p>';
	if ($parts !== []) {
		$html .= '<ul class="bl-blocks-block__values">' . implode('', $parts) . '</ul>';
	}
	$html .= '</div>';

	return $html;
}
