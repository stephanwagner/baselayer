<?php

defined('ABSPATH') || exit;

const BL_BLOCK_CREATOR_BLOCKS_OPTION = 'bl_block_creator_blocks';

/**
 * Load all custom block definitions.
 *
 * @return array<string, array{title: string, slug: string, fields: list<array<string, mixed>>, options: list<array<string, mixed>>, option_presets: list<string>, options_stack: list<array<string, mixed>>}>
 */
function bl_block_creator_get_blocks(): array
{
	$stored = get_option(BL_BLOCK_CREATOR_BLOCKS_OPTION, []);
	if (!is_array($stored)) {
		return [];
	}

	$out = [];
	foreach ($stored as $slug => $block) {
		if (!is_array($block)) {
			continue;
		}
		$slug = sanitize_key((string) ($block['slug'] ?? $slug));
		if ($slug === '') {
			continue;
		}
		$stack = bl_block_creator_normalize_options_stack($block);
		$derived = bl_block_creator_derive_options_from_stack($stack);
		$out[$slug] = [
			'title' => sanitize_text_field((string) ($block['title'] ?? $slug)),
			'slug' => $slug,
			'fields' => isset($block['fields']) && is_array($block['fields'])
				? array_values(array_filter($block['fields'], 'is_array'))
				: [],
			'options' => $derived['options'],
			'option_presets' => $derived['option_presets'],
			'options_stack' => $stack,
		];
	}

	return $out;
}

/**
 * Get one block definition by slug.
 *
 * @return array{title: string, slug: string, fields: list<array<string, mixed>>, options: list<array<string, mixed>>, option_presets: list<string>, options_stack: list<array<string, mixed>>}|null
 */
function bl_block_creator_get_block(string $slug): ?array
{
	$slug = sanitize_key($slug);
	$blocks = bl_block_creator_get_blocks();
	return $blocks[$slug] ?? null;
}

/**
 * Sanitize ordered list of block-options preset slugs.
 *
 * @param mixed $value
 * @return list<string>
 */
function bl_block_creator_sanitize_option_presets($value): array
{
	if (!is_array($value)) {
		return [];
	}

	$known = function_exists('bl_block_options_preset_choices')
		? bl_block_options_preset_choices()
		: [];

	$out = [];
	$seen = [];
	foreach ($value as $slug) {
		$slug = sanitize_key((string) $slug);
		if ($slug === '' || isset($seen[$slug])) {
			continue;
		}
		if ($known !== [] && !isset($known[$slug])) {
			continue;
		}
		$seen[$slug] = true;
		$out[] = $slug;
	}

	return $out;
}

/**
 * Sanitize one options-stack row (preset or custom).
 *
 * @param mixed $item
 * @return array<string, mixed>|null
 */
function bl_block_creator_sanitize_options_stack_item($item): ?array
{
	if (!is_array($item)) {
		return null;
	}

	$kind = sanitize_key((string) ($item['kind'] ?? ''));
	if ($kind === 'preset') {
		$slug = sanitize_key((string) ($item['slug'] ?? ''));
		if ($slug === '') {
			return null;
		}
		$known = function_exists('bl_block_options_preset_choices')
			? bl_block_options_preset_choices()
			: [];
		if ($known !== [] && !isset($known[$slug])) {
			return null;
		}
		return [
			'kind' => 'preset',
			'slug' => $slug,
		];
	}

	if ($kind === 'custom' || $kind === '') {
		$field = $item;
		unset($field['kind']);
		$clean = bl_block_creator_sanitize_option_field($field);
		if ($clean === null) {
			return null;
		}
		return array_merge(['kind' => 'custom'], $clean);
	}

	return null;
}

/**
 * Sanitize options stack.
 *
 * @param mixed $value
 * @return list<array<string, mixed>>
 */
function bl_block_creator_sanitize_options_stack($value): array
{
	if (!is_array($value)) {
		return [];
	}

	$out = [];
	$seen_presets = [];
	foreach ($value as $item) {
		$clean = bl_block_creator_sanitize_options_stack_item($item);
		if ($clean === null) {
			continue;
		}
		if (($clean['kind'] ?? '') === 'preset') {
			$slug = (string) ($clean['slug'] ?? '');
			if ($slug === '' || isset($seen_presets[$slug])) {
				continue;
			}
			$seen_presets[$slug] = true;
		}
		$out[] = $clean;
	}

	return $out;
}

/**
 * Build options stack from legacy option_presets + options, or sanitize options_stack.
 *
 * @param array<string, mixed> $block
 * @return list<array<string, mixed>>
 */
function bl_block_creator_normalize_options_stack(array $block): array
{
	if (isset($block['options_stack']) && is_array($block['options_stack'])) {
		return bl_block_creator_sanitize_options_stack($block['options_stack']);
	}

	$stack = [];
	foreach (bl_block_creator_sanitize_option_presets($block['option_presets'] ?? []) as $slug) {
		$stack[] = [
			'kind' => 'preset',
			'slug' => $slug,
		];
	}
	if (isset($block['options']) && is_array($block['options'])) {
		foreach ($block['options'] as $field) {
			$clean = bl_block_creator_sanitize_option_field($field);
			if ($clean !== null) {
				$stack[] = array_merge(['kind' => 'custom'], $clean);
			}
		}
	}

	return $stack;
}

/**
 * Split options stack into presets list + custom option field schemas.
 *
 * @param list<array<string, mixed>> $stack
 * @return array{option_presets: list<string>, options: list<array<string, mixed>>}
 */
function bl_block_creator_derive_options_from_stack(array $stack): array
{
	$presets = [];
	$options = [];
	foreach ($stack as $item) {
		if (!is_array($item)) {
			continue;
		}
		if (($item['kind'] ?? '') === 'preset') {
			$slug = sanitize_key((string) ($item['slug'] ?? ''));
			if ($slug !== '') {
				$presets[] = $slug;
			}
			continue;
		}
		$field = $item;
		unset($field['kind']);
		$options[] = $field;
	}

	return [
		'option_presets' => $presets,
		'options' => $options,
	];
}

/**
 * Sanitize a field schema row from the Field builder.
 *
 * @param mixed $field
 * @return array<string, mixed>|null
 */
function bl_block_creator_sanitize_field($field): ?array
{
	if (!is_array($field)) {
		return null;
	}

	$type = sanitize_key((string) ($field['type'] ?? 'text'));
	$slug = sanitize_key((string) ($field['slug'] ?? ''));
	$title = sanitize_text_field((string) ($field['title'] ?? ''));

	if ($slug === '') {
		return null;
	}

	$out = [
		'type' => $type !== '' ? $type : 'text',
		'title' => $title,
		'slug' => $slug,
	];

	foreach (['default_value', 'placeholder'] as $key) {
		if (array_key_exists($key, $field)) {
			$out[$key] = $field[$key];
		}
	}

	if (array_key_exists('class_name', $field)) {
		$class_name = sanitize_html_class((string) $field['class_name']);
		if ($class_name !== '') {
			$out['class_name'] = $class_name;
		}
	}

	if (isset($field['rows'])) {
		$out['rows'] = (int) $field['rows'];
	}

	if (!empty($field['allow_multiple'])) {
		$out['allow_multiple'] = true;
	}

	if (isset($field['options']) && is_array($field['options'])) {
		$options = [];
		foreach ($field['options'] as $opt) {
			if (!is_array($opt)) {
				continue;
			}
			$value = sanitize_text_field((string) ($opt['value'] ?? ''));
			if ($value === '') {
				continue;
			}
			$options[] = [
				'label' => sanitize_text_field((string) ($opt['label'] ?? $value)),
				'value' => $value,
			];
		}
		$out['options'] = $options;
	}

	if (isset($field['presentation']) && is_array($field['presentation'])) {
		$presentation = [];
		if (isset($field['presentation']['width'])) {
			$width = sanitize_text_field((string) $field['presentation']['width']);
			if (in_array($width, ['25', '50', '75', '100', 'custom'], true)) {
				$presentation['width'] = $width;
			}
		}
		if (!empty($field['presentation']['width_custom'])) {
			$presentation['width_custom'] = sanitize_text_field((string) $field['presentation']['width_custom']);
		}
		if (!empty($field['presentation']['description'])) {
			$presentation['description'] = sanitize_textarea_field((string) $field['presentation']['description']);
		}
		if ($presentation !== []) {
			$out['presentation'] = $presentation;
		}
	}

	return $out;
}

/**
 * Sanitize an options-mode field (checkbox / select only).
 *
 * @param mixed $field
 * @return array<string, mixed>|null
 */
function bl_block_creator_sanitize_option_field($field): ?array
{
	$clean = bl_block_creator_sanitize_field($field);
	if ($clean === null) {
		return null;
	}
	$type = (string) ($clean['type'] ?? '');
	if (!in_array($type, ['checkbox', 'select'], true)) {
		return null;
	}
	return $clean;
}

/**
 * Sanitize full blocks map for update_option.
 *
 * @param mixed $value
 * @return array<string, array{title: string, slug: string, fields: list<array<string, mixed>>, options: list<array<string, mixed>>, option_presets: list<string>, options_stack: list<array<string, mixed>>}>
 */
function bl_block_creator_sanitize_blocks($value): array
{
	if (!is_array($value)) {
		return [];
	}

	$out = [];
	foreach ($value as $slug => $block) {
		if (!is_array($block)) {
			continue;
		}
		$slug = sanitize_key((string) ($block['slug'] ?? $slug));
		$title = sanitize_text_field((string) ($block['title'] ?? ''));
		if ($slug === '' || $title === '') {
			continue;
		}
		$fields = [];
		if (isset($block['fields']) && is_array($block['fields'])) {
			foreach ($block['fields'] as $field) {
				$clean = bl_block_creator_sanitize_field($field);
				if ($clean !== null) {
					$fields[] = $clean;
				}
			}
		}
		$stack = bl_block_creator_normalize_options_stack($block);
		$derived = bl_block_creator_derive_options_from_stack($stack);
		$out[$slug] = [
			'title' => $title,
			'slug' => $slug,
			'fields' => $fields,
			'options' => $derived['options'],
			'option_presets' => $derived['option_presets'],
			'options_stack' => $stack,
		];
	}

	return $out;
}

/**
 * Persist one block (insert or update).
 *
 * @param array{title: string, slug: string, fields?: list<array<string, mixed>>, options?: list<array<string, mixed>>, option_presets?: list<string>, options_stack?: list<array<string, mixed>>} $block
 * @param string $previous_slug When renaming, remove old key.
 */
function bl_block_creator_save_block(array $block, string $previous_slug = ''): bool
{
	$blocks = bl_block_creator_get_blocks();
	$clean_map = bl_block_creator_sanitize_blocks([$block['slug'] ?? '' => $block]);
	if ($clean_map === []) {
		return false;
	}
	$clean = reset($clean_map);
	$slug = $clean['slug'];

	if ($previous_slug !== '' && $previous_slug !== $slug) {
		unset($blocks[$previous_slug]);
	}

	$blocks[$slug] = $clean;
	return update_option(BL_BLOCK_CREATOR_BLOCKS_OPTION, $blocks, false);
}

/**
 * Delete a block by slug.
 */
function bl_block_creator_delete_block(string $slug): bool
{
	$slug = sanitize_key($slug);
	$blocks = bl_block_creator_get_blocks();
	if (!isset($blocks[$slug])) {
		return false;
	}
	unset($blocks[$slug]);
	return update_option(BL_BLOCK_CREATOR_BLOCKS_OPTION, $blocks, false);
}

/**
 * Map a field definition to a block attribute schema.
 *
 * @param array<string, mixed> $field
 * @return array{type: string, default: mixed}
 */
function bl_block_creator_field_to_attribute(array $field): array
{
	$type = (string) ($field['type'] ?? 'text');

	if ($type === 'checkbox') {
		return [
			'type' => 'boolean',
			'default' => !empty($field['default_value']),
		];
	}

	if ($type === 'select' && !empty($field['allow_multiple'])) {
		$default = $field['default_value'] ?? [];
		if (!is_array($default)) {
			$default = $default !== '' && $default !== null ? [ (string) $default ] : [];
		}
		return [
			'type' => 'array',
			'default' => array_values(array_map('strval', $default)),
		];
	}

	$default = $field['default_value'] ?? '';
	if (is_bool($default)) {
		$default = $default ? '1' : '';
	}

	return [
		'type' => 'string',
		'default' => is_scalar($default) ? (string) $default : '',
	];
}

/**
 * Build attributes array for register_block_type from field + option defs.
 *
 * @param list<array<string, mixed>> $fields
 * @param list<array<string, mixed>> $options
 * @return array<string, array{type: string, default: mixed}>
 */
function bl_block_creator_schema_to_attributes(array $fields, array $options = []): array
{
	$attributes = [];
	foreach (array_merge($fields, $options) as $field) {
		if (!is_array($field)) {
			continue;
		}
		$slug = sanitize_key((string) ($field['slug'] ?? ''));
		if ($slug === '' || isset($attributes[$slug])) {
			continue;
		}
		$attributes[$slug] = bl_block_creator_field_to_attribute($field);
	}
	return $attributes;
}

/**
 * CSS classes from checked checkbox options that define class_name.
 *
 * @param list<array<string, mixed>> $options
 * @param array<string, mixed>       $attributes
 * @return list<string>
 */
function bl_block_creator_option_classes(array $options, array $attributes): array
{
	$classes = [];
	foreach ($options as $option) {
		if (!is_array($option) || ($option['type'] ?? '') !== 'checkbox') {
			continue;
		}
		$slug = sanitize_key((string) ($option['slug'] ?? ''));
		$class_name = sanitize_html_class((string) ($option['class_name'] ?? ''));
		if ($slug === '' || $class_name === '') {
			continue;
		}
		if (!empty($attributes[$slug])) {
			$classes[] = $class_name;
		}
	}
	return $classes;
}

/**
 * Editor/script payload for all custom blocks.
 *
 * @return list<array{name: string, title: string, slug: string, fields: list<array<string, mixed>>, options: list<array<string, mixed>>, attributes: array<string, mixed>}>
 */
function bl_block_creator_blocks_editor_config(): array
{
	$list = [];
	foreach (bl_block_creator_get_blocks() as $block) {
		$list[] = [
			'name' => 'baselayer/' . $block['slug'],
			'title' => $block['title'],
			'slug' => $block['slug'],
			'fields' => $block['fields'],
			'options' => $block['options'],
			'attributes' => bl_block_creator_schema_to_attributes($block['fields'], $block['options']),
		];
	}
	return $list;
}

/**
 * Render callback for PoC custom blocks.
 *
 * @param array<string, mixed> $attributes
 * @param string               $content
 * @param WP_Block|null        $block
 */
function bl_block_creator_render_custom_block(array $attributes, string $content = '', $block = null): string
{
	$name = is_object($block) && isset($block->name) ? (string) $block->name : '';
	$slug = $name !== '' && str_starts_with($name, 'baselayer/')
		? substr($name, strlen('baselayer/'))
		: '';
	$def = $slug !== '' ? bl_block_creator_get_block($slug) : null;
	$title = $def['title'] ?? ($slug !== '' ? $slug : __('Custom block', 'baselayer'));
	$option_classes = $def
		? bl_block_creator_option_classes($def['options'] ?? [], $attributes)
		: [];
	$extra_class = trim((string) ($attributes['className'] ?? ''));
	$wrapper_class = trim(implode(' ', array_filter([
		'fs-creator-block',
		$extra_class,
		implode(' ', $option_classes),
	])));

	ob_start();
	?>
	<div class="<?= esc_attr($wrapper_class) ?>" data-block="<?= esc_attr($name) ?>">
		<p class="fs-creator-block__title"><strong><?= esc_html($title) ?></strong></p>
		<?php if ($def && !empty($def['fields'])) : ?>
			<ul class="fs-creator-block__fields">
				<?php foreach ($def['fields'] as $field) :
					$field_slug = (string) ($field['slug'] ?? '');
					if ($field_slug === '') {
						continue;
					}
					$value = $attributes[$field_slug] ?? null;
					if (is_array($value)) {
						$value = implode(', ', array_map('strval', $value));
					} elseif (is_bool($value)) {
						$value = $value ? 'true' : 'false';
					} else {
						$value = (string) $value;
					}
					$label = (string) ($field['title'] ?? $field_slug);
					?>
					<li>
						<span class="fs-creator-block__label"><?= esc_html($label) ?>:</span>
						<span class="fs-creator-block__value"><?= esc_html($value) ?></span>
					</li>
				<?php endforeach; ?>
			</ul>
		<?php else : ?>
			<p class="fs-creator-block__empty"><?= esc_html__('No fields configured.', 'baselayer') ?></p>
		<?php endif; ?>
	</div>
	<?php
	return (string) ob_get_clean();
}

/**
 * Register inserter category + all saved custom blocks.
 */
function bl_block_creator_register_custom_blocks(): void
{
	if (!bl_block_creator_enabled()) {
		return;
	}

	add_filter('block_categories_all', static function (array $categories): array {
		foreach ($categories as $cat) {
			if (($cat['slug'] ?? '') === 'baselayer') {
				return $categories;
			}
		}
		$categories[] = [
			'slug' => 'baselayer',
			'title' => __('BaseLayer', 'baselayer'),
			'icon' => null,
		];
		return $categories;
	});

	$min = function_exists('bl_is_debug') && bl_is_debug() ? '' : '.min';
	$rel = '/assets/js/creator-blocks' . $min . '.js';
	$path = get_template_directory() . $rel;
	if (!is_readable($path)) {
		$rel = '/assets/js/creator-blocks.js';
		$path = get_template_directory() . $rel;
	}

	$script_handle = 'baselayer-creator-blocks';
	if (is_readable($path)) {
		wp_register_script(
			$script_handle,
			get_template_directory_uri() . $rel,
			[
				'wp-blocks',
				'wp-element',
				'wp-block-editor',
				'wp-components',
				'wp-i18n',
			],
			(string) filemtime($path),
			true
		);
		wp_localize_script($script_handle, 'baselayerCreatorBlocks', [
			'blocks' => bl_block_creator_blocks_editor_config(),
		]);
	}

	foreach (bl_block_creator_get_blocks() as $block) {
		$args = [
			'api_version' => 3,
			'title' => $block['title'],
			'category' => 'baselayer',
			'icon' => 'block-default',
			'attributes' => bl_block_creator_schema_to_attributes($block['fields'], $block['options']),
			'render_callback' => 'bl_block_creator_render_custom_block',
			'supports' => [
				'html' => false,
				'className' => true,
			],
		];
		if (is_readable($path)) {
			$args['editor_script'] = $script_handle;
		}
		register_block_type('baselayer/' . $block['slug'], $args);
	}
}
add_action('init', 'bl_block_creator_register_custom_blocks', 20);
