<?php

defined('ABSPATH') || exit;

/**
 * @var array{values: array<string, mixed>, fields: list<array<string, mixed>>, field_map: array<string, array<string, mixed>>, content: string}|null
 */
$GLOBALS['bl_blocks_field_context'] = null;

/**
 * Find a value-bearing field definition by name (walks layout wrappers).
 *
 * @param list<array<string, mixed>> $fields
 * @return array<string, mixed>|null
 */
function bl_blocks_find_field_by_name(array $fields, string $name): ?array
{
	$name = (string) $name;
	if ($name === '') {
		return null;
	}

	foreach (bl_blocks_iter_fields($fields) as $field) {
		if ((string) ($field['name'] ?? '') === $name) {
			return $field;
		}
	}

	return null;
}

/**
 * Map field name => definition for the current field tree.
 *
 * @param list<array<string, mixed>> $fields
 * @return array<string, array<string, mixed>>
 */
function bl_blocks_field_map(array $fields): array
{
	$map = [];
	foreach (bl_blocks_iter_fields($fields) as $field) {
		$name = (string) ($field['name'] ?? '');
		if ($name === '' || bl_blocks_is_static_field_type((string) ($field['type'] ?? ''))) {
			continue;
		}
		$map[$name] = $field;
	}

	return $map;
}

/**
 * Push block field context for template rendering (used by bl_block_field()).
 *
 * @param array<string, mixed>       $values Sanitized values.
 * @param list<array<string, mixed>> $fields Field definitions.
 * @param string                     $content Rendered InnerBlocks HTML from WordPress.
 */
function bl_blocks_set_field_context(array $values, array $fields, string $content = ''): void
{
	$GLOBALS['bl_blocks_field_context'] = [
		'values'    => $values,
		'fields'    => $fields,
		'field_map' => bl_blocks_field_map($fields),
		'content'   => $content,
	];
}

/**
 * Clear block field context after template render.
 */
function bl_blocks_reset_field_context(): void
{
	$GLOBALS['bl_blocks_field_context'] = null;
}

/**
 * Rendered InnerBlocks HTML for the current block template (empty when none).
 */
function bl_block_inner_blocks(): string
{
	$ctx = $GLOBALS['bl_blocks_field_context'] ?? null;
	if (!is_array($ctx)) {
		return '';
	}

	$content = $ctx['content'] ?? '';
	return is_string($content) ? $content : '';
}

/**
 * Replace ACF-style <InnerBlocks /> tags in template HTML with rendered inner content.
 */
function bl_blocks_expand_inner_blocks_tags(string $html, string $content): string
{
	if ($html === '' || stripos($html, 'InnerBlocks') === false) {
		return $html;
	}

	$html = (string) preg_replace(
		'/<InnerBlocks\b[^>]*>.*?<\/InnerBlocks>/is',
		$content,
		$html
	);
	$html = (string) preg_replace(
		'/<InnerBlocks\b[^>]*\/?\s*>/i',
		$content,
		$html
	);

	return $html;
}

/**
 * ACF-style field getter for block templates.
 *
 * Always safe to call. Returns:
 * - null for missing/empty complex values (image, file, page, link)
 * - '' for empty scalar text-like fields
 * - false for empty toggles
 * - [] for empty lists (multiple media/page, checkboxes, repeater)
 * - formatted arrays for image/file/page/link (and lists of those when multiple)
 * - HTML string for wysiwyg (stored via wp_kses_post; echo with wp_kses_post())
 *
 * @return mixed
 */
function bl_block_field(string $name)
{
	$ctx = $GLOBALS['bl_blocks_field_context'] ?? null;
	if (!is_array($ctx)) {
		return null;
	}

	$field_map = isset($ctx['field_map']) && is_array($ctx['field_map']) ? $ctx['field_map'] : [];
	$field = $field_map[$name] ?? null;
	if (!is_array($field)) {
		return null;
	}

	$values = isset($ctx['values']) && is_array($ctx['values']) ? $ctx['values'] : [];
	if (array_key_exists($name, $values)) {
		$raw = $values[$name];
	} elseif (function_exists('bl_blocks_default_value_for_field')) {
		$raw = bl_blocks_default_value_for_field($field);
	} else {
		$raw = null;
	}

	return bl_blocks_format_field_value($field, $raw);
}

/**
 * Format a sanitized stored value into a template-friendly shape.
 *
 * @param array<string, mixed> $field
 * @param mixed                $value
 * @return mixed
 */
function bl_blocks_format_field_value(array $field, $value)
{
	$type = (string) ($field['type'] ?? 'text');

	if ($type === 'repeater') {
		$rows_in = is_array($value) ? $value : [];
		$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
		$child_fields = [];
		foreach (bl_blocks_iter_fields($children) as $child) {
			$child_type = (string) ($child['type'] ?? '');
			if (bl_blocks_is_static_field_type($child_type) || $child_type === 'repeater') {
				continue;
			}
			$child_name = (string) ($child['name'] ?? '');
			if ($child_name === '') {
				continue;
			}
			$child_fields[] = $child;
		}

		$out = [];
		foreach ($rows_in as $row) {
			if (!is_array($row)) {
				continue;
			}
			$formatted = [];
			foreach ($child_fields as $child) {
				$child_name = (string) $child['name'];
				$formatted[$child_name] = bl_blocks_format_field_value(
					$child,
					array_key_exists($child_name, $row) ? $row[$child_name] : null
				);
			}
			$out[] = $formatted;
		}

		return $out;
	}

	if ($type === 'toggle' || $type === 'terms') {
		return !empty($value);
	}

	if ($type === 'link') {
		if (!is_array($value)) {
			return null;
		}
		$url = (string) ($value['url'] ?? '');
		if ($url === '') {
			return null;
		}
		$title = (string) ($value['title'] ?? '');
		$target = (string) ($value['target'] ?? '');
		$out = [
			'type'  => (string) ($value['type'] ?? 'url'),
			'url'   => $url,
			'title' => $title !== '' ? $title : $url,
		];
		if ($target === '_blank') {
			$out['target'] = '_blank';
		}
		if (isset($value['page_id'])) {
			$out['page_id'] = absint($value['page_id']);
		}
		if (isset($value['attachment_id'])) {
			$out['attachment_id'] = absint($value['attachment_id']);
		}

		return $out;
	}

	if ($type === 'image' || $type === 'file') {
		$ids = bl_blocks_normalize_id_list($value);
		$items = [];
		foreach ($ids as $id) {
			$item = $type === 'image'
				? bl_blocks_format_image_value($id)
				: bl_blocks_format_file_value($id);
			if ($item !== null) {
				$items[] = $item;
			}
		}
		if (!empty($field['multiple'])) {
			return $items;
		}

		return $items[0] ?? null;
	}

	if ($type === 'page') {
		$ids = bl_blocks_normalize_id_list($value);
		$items = [];
		foreach ($ids as $id) {
			$item = bl_blocks_format_page_value($id);
			if ($item !== null) {
				$items[] = $item;
			}
		}
		if (!empty($field['multiple'])) {
			return $items;
		}

		return $items[0] ?? null;
	}

	$multi = $type === 'checkboxes'
		|| ($type === 'button_group' && !empty($field['multiple']))
		|| ($type === 'select' && !empty($field['multiple']));

	if ($multi) {
		if (!is_array($value)) {
			return [];
		}
		$out = [];
		foreach ($value as $item) {
			if (is_scalar($item) && (string) $item !== '') {
				$out[] = (string) $item;
			}
		}

		return $out;
	}

	if (!is_scalar($value) || (string) $value === '') {
		return '';
	}

	return (string) $value;
}

/**
 * @param mixed $value
 * @return list<int>
 */
function bl_blocks_normalize_id_list($value): array
{
	$ids = [];
	if (is_array($value)) {
		foreach ($value as $item) {
			$n = absint($item);
			if ($n > 0) {
				$ids[] = $n;
			}
		}
	} elseif (is_scalar($value) && (string) $value !== '') {
		$n = absint($value);
		if ($n > 0) {
			$ids[] = $n;
		}
	}

	return array_values(array_unique($ids));
}

/**
 * @return array<string, mixed>|null
 */
function bl_blocks_format_image_value(int $attachment_id): ?array
{
	if ($attachment_id <= 0 || get_post_type($attachment_id) !== 'attachment') {
		return null;
	}
	$mime = (string) get_post_mime_type($attachment_id);
	if ($mime === '' || strpos($mime, 'image/') !== 0) {
		return null;
	}

	$url = wp_get_attachment_url($attachment_id);
	if (!$url) {
		return null;
	}

	$meta = wp_get_attachment_metadata($attachment_id);
	$width = is_array($meta) ? absint($meta['width'] ?? 0) : 0;
	$height = is_array($meta) ? absint($meta['height'] ?? 0) : 0;

	return [
		'ID'          => $attachment_id,
		'id'          => $attachment_id,
		'url'         => $url,
		'alt'         => (string) get_post_meta($attachment_id, '_wp_attachment_image_alt', true),
		'title'       => (string) get_the_title($attachment_id),
		'caption'     => (string) wp_get_attachment_caption($attachment_id),
		'description' => (string) get_post_field('post_content', $attachment_id),
		'filename'    => wp_basename((string) get_attached_file($attachment_id)),
		'mime_type'   => $mime,
		'width'       => $width,
		'height'      => $height,
	];
}

/**
 * @return array<string, mixed>|null
 */
function bl_blocks_format_file_value(int $attachment_id): ?array
{
	if ($attachment_id <= 0 || get_post_type($attachment_id) !== 'attachment') {
		return null;
	}

	$url = wp_get_attachment_url($attachment_id);
	if (!$url) {
		return null;
	}

	$path = (string) get_attached_file($attachment_id);
	$filesize = ($path !== '' && is_readable($path)) ? (int) filesize($path) : null;

	return [
		'ID'        => $attachment_id,
		'id'        => $attachment_id,
		'url'       => $url,
		'title'     => (string) get_the_title($attachment_id),
		'filename'  => wp_basename($path),
		'mime_type' => (string) get_post_mime_type($attachment_id),
		'filesize'  => $filesize,
	];
}

/**
 * @return array<string, mixed>|null
 */
function bl_blocks_format_page_value(int $post_id): ?array
{
	if ($post_id <= 0) {
		return null;
	}
	$post = get_post($post_id);
	if (!$post instanceof WP_Post) {
		return null;
	}
	$url = get_permalink($post_id);
	if (!$url) {
		return null;
	}

	return [
		'ID'        => $post_id,
		'id'        => $post_id,
		'title'     => get_the_title($post),
		'url'       => $url,
		'permalink' => $url,
		'slug'      => (string) $post->post_name,
		'post_type' => (string) $post->post_type,
	];
}
