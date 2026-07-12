<?php

defined('ABSPATH') || exit;

const FS_BLOCK_CREATOR_BLOCKS_OPTION = 'fs_block_creator_blocks';

/**
 * Load all custom block definitions.
 *
 * @return array<string, array{title: string, slug: string, fields: list<array<string, mixed>>}>
 */
function fs_block_creator_get_blocks(): array
{
	$stored = get_option(FS_BLOCK_CREATOR_BLOCKS_OPTION, []);
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
		$out[$slug] = [
			'title' => sanitize_text_field((string) ($block['title'] ?? $slug)),
			'slug' => $slug,
			'fields' => isset($block['fields']) && is_array($block['fields'])
				? array_values(array_filter($block['fields'], 'is_array'))
				: [],
		];
	}

	return $out;
}

/**
 * Get one block definition by slug.
 *
 * @return array{title: string, slug: string, fields: list<array<string, mixed>>}|null
 */
function fs_block_creator_get_block(string $slug): ?array
{
	$slug = sanitize_key($slug);
	$blocks = fs_block_creator_get_blocks();
	return $blocks[$slug] ?? null;
}

/**
 * Sanitize a field schema row from the Field builder.
 *
 * @param mixed $field
 * @return array<string, mixed>|null
 */
function fs_block_creator_sanitize_field($field): ?array
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

	foreach (['default_value', 'placeholder', 'class_name'] as $key) {
		if (array_key_exists($key, $field)) {
			$out[$key] = $field[$key];
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
 * Sanitize full blocks map for update_option.
 *
 * @param mixed $value
 * @return array<string, array{title: string, slug: string, fields: list<array<string, mixed>>}>
 */
function fs_block_creator_sanitize_blocks($value): array
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
				$clean = fs_block_creator_sanitize_field($field);
				if ($clean !== null) {
					$fields[] = $clean;
				}
			}
		}
		$out[$slug] = [
			'title' => $title,
			'slug' => $slug,
			'fields' => $fields,
		];
	}

	return $out;
}

/**
 * Persist one block (insert or update).
 *
 * @param array{title: string, slug: string, fields?: list<array<string, mixed>>} $block
 * @param string $previous_slug When renaming, remove old key.
 */
function fs_block_creator_save_block(array $block, string $previous_slug = ''): bool
{
	$blocks = fs_block_creator_get_blocks();
	$clean_map = fs_block_creator_sanitize_blocks([$block['slug'] ?? '' => $block]);
	if ($clean_map === []) {
		return false;
	}
	$clean = reset($clean_map);
	$slug = $clean['slug'];

	if ($previous_slug !== '' && $previous_slug !== $slug) {
		unset($blocks[$previous_slug]);
	}

	$blocks[$slug] = $clean;
	return update_option(FS_BLOCK_CREATOR_BLOCKS_OPTION, $blocks, false);
}

/**
 * Delete a block by slug.
 */
function fs_block_creator_delete_block(string $slug): bool
{
	$slug = sanitize_key($slug);
	$blocks = fs_block_creator_get_blocks();
	if (!isset($blocks[$slug])) {
		return false;
	}
	unset($blocks[$slug]);
	return update_option(FS_BLOCK_CREATOR_BLOCKS_OPTION, $blocks, false);
}

/**
 * Map a field definition to a block attribute schema.
 *
 * @param array<string, mixed> $field
 * @return array{type: string, default: mixed}
 */
function fs_block_creator_field_to_attribute(array $field): array
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
 * Build attributes array for register_block_type from field defs.
 *
 * @param list<array<string, mixed>> $fields
 * @return array<string, array{type: string, default: mixed}>
 */
function fs_block_creator_fields_to_attributes(array $fields): array
{
	$attributes = [];
	foreach ($fields as $field) {
		if (!is_array($field)) {
			continue;
		}
		$slug = sanitize_key((string) ($field['slug'] ?? ''));
		if ($slug === '') {
			continue;
		}
		$attributes[$slug] = fs_block_creator_field_to_attribute($field);
	}
	return $attributes;
}

/**
 * Editor/script payload for all custom blocks.
 *
 * @return list<array{name: string, title: string, slug: string, fields: list<array<string, mixed>>, attributes: array<string, mixed>}>
 */
function fs_block_creator_blocks_editor_config(): array
{
	$list = [];
	foreach (fs_block_creator_get_blocks() as $block) {
		$list[] = [
			'name' => 'fromscratch/' . $block['slug'],
			'title' => $block['title'],
			'slug' => $block['slug'],
			'fields' => $block['fields'],
			'attributes' => fs_block_creator_fields_to_attributes($block['fields']),
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
function fs_block_creator_render_custom_block(array $attributes, string $content = '', $block = null): string
{
	$name = is_object($block) && isset($block->name) ? (string) $block->name : '';
	$slug = $name !== '' && str_starts_with($name, 'fromscratch/')
		? substr($name, strlen('fromscratch/'))
		: '';
	$def = $slug !== '' ? fs_block_creator_get_block($slug) : null;
	$title = $def['title'] ?? ($slug !== '' ? $slug : __('Custom block', 'fromscratch'));

	ob_start();
	?>
	<div class="fs-creator-block" data-block="<?= esc_attr($name) ?>">
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
			<p class="fs-creator-block__empty"><?= esc_html__('No fields configured.', 'fromscratch') ?></p>
		<?php endif; ?>
	</div>
	<?php
	return (string) ob_get_clean();
}

/**
 * Register inserter category + all saved custom blocks.
 */
function fs_block_creator_register_custom_blocks(): void
{
	if (!fs_block_creator_enabled()) {
		return;
	}

	add_filter('block_categories_all', static function (array $categories): array {
		foreach ($categories as $cat) {
			if (($cat['slug'] ?? '') === 'fromscratch') {
				return $categories;
			}
		}
		$categories[] = [
			'slug' => 'fromscratch',
			'title' => __('FromScratch', 'fromscratch'),
			'icon' => null,
		];
		return $categories;
	});

	$min = function_exists('fs_is_debug') && fs_is_debug() ? '' : '.min';
	$rel = '/assets/js/creator-blocks' . $min . '.js';
	$path = get_template_directory() . $rel;
	if (!is_readable($path)) {
		$rel = '/assets/js/creator-blocks.js';
		$path = get_template_directory() . $rel;
	}

	$script_handle = 'fromscratch-creator-blocks';
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
		wp_localize_script($script_handle, 'fromscratchCreatorBlocks', [
			'blocks' => fs_block_creator_blocks_editor_config(),
		]);
	}

	foreach (fs_block_creator_get_blocks() as $block) {
		$args = [
			'api_version' => 3,
			'title' => $block['title'],
			'category' => 'fromscratch',
			'icon' => 'block-default',
			'attributes' => fs_block_creator_fields_to_attributes($block['fields']),
			'render_callback' => 'fs_block_creator_render_custom_block',
			'supports' => [
				'html' => false,
				'className' => true,
			],
		];
		if (is_readable($path)) {
			$args['editor_script'] = $script_handle;
		}
		register_block_type('fromscratch/' . $block['slug'], $args);
	}
}
add_action('init', 'fs_block_creator_register_custom_blocks', 20);
