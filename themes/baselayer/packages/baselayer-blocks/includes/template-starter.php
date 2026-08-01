<?php

defined('ABSPATH') || exit;

/**
 * Turn a field name into a valid PHP variable name (camelCase).
 */
function bl_blocks_field_php_var(string $name): string
{
	$parts = preg_split('/[^a-zA-Z0-9]+/', $name, -1, PREG_SPLIT_NO_EMPTY);
	if (!is_array($parts) || $parts === []) {
		return 'field';
	}

	$var = '';
	foreach ($parts as $index => $part) {
		$part = strtolower((string) $part);
		if ($part === '') {
			continue;
		}
		if ($var === '') {
			$var = $part;
			continue;
		}
		$var .= ucfirst($part);
	}

	if ($var === '') {
		return 'field';
	}

	// PHP variables cannot start with a digit.
	if (preg_match('/^[0-9]/', $var)) {
		$var = 'field' . ucfirst($var);
	}

	return $var;
}

/**
 * Value-bearing fields for starter templates (excludes layout + static).
 *
 * @param list<array<string, mixed>> $fields
 * @return list<array{name: string, var: string, type: string, label: string, children?: list<array{name: string, var: string, type: string, label: string}>}>
 */
function bl_blocks_starter_template_fields(array $fields): array
{
	$out = [];
	$used = [];

	foreach (bl_blocks_iter_fields($fields) as $field) {
		$type = (string) ($field['type'] ?? '');
		if (bl_blocks_is_static_field_type($type)) {
			continue;
		}
		$name = (string) ($field['name'] ?? '');
		if ($name === '') {
			continue;
		}

		$base = bl_blocks_field_php_var($name);
		$var = $base;
		$n = 2;
		while (isset($used[$var])) {
			$var = $base . (string) $n;
			$n++;
		}
		$used[$var] = true;

		$entry = [
			'name'  => $name,
			'var'   => $var,
			'type'  => $type,
			'label' => (string) ($field['label'] ?? $name),
		];

		if ($type === 'repeater') {
			$child_used = [];
			$children = [];
			$raw_children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
			foreach (bl_blocks_iter_fields($raw_children) as $child) {
				$child_type = (string) ($child['type'] ?? '');
				if (bl_blocks_is_static_field_type($child_type) || $child_type === 'repeater') {
					continue;
				}
				$child_name = (string) ($child['name'] ?? '');
				if ($child_name === '') {
					continue;
				}
				$child_base = bl_blocks_field_php_var($child_name);
				$child_var = $child_base;
				$cn = 2;
				while (isset($child_used[$child_var])) {
					$child_var = $child_base . (string) $cn;
					$cn++;
				}
				$child_used[$child_var] = true;
				$children[] = [
					'name'  => $child_name,
					'var'   => $child_var,
					'type'  => $child_type,
					'label' => (string) ($child['label'] ?? $child_name),
				];
			}
			$entry['children'] = $children;
		}

		$out[] = $entry;
	}

	return $out;
}

/**
 * Build starter PHP template source for a block definition.
 *
 * @param list<array<string, mixed>> $fields
 */
function bl_blocks_build_starter_template(string $slug, string $title, array $fields): string
{
	$slug = sanitize_key($slug);
	if ($slug === '') {
		$slug = 'block';
	}
	$title = trim($title) !== '' ? $title : $slug;
	$class = 'bl-' . $slug;
	$entries = bl_blocks_starter_template_fields($fields);

	$lines = [];
	$lines[] = '<?php';
	$lines[] = '/**';
	$lines[] = ' * ' . str_replace(["\r", "\n", '*/'], '', $title);
	$lines[] = ' */';
	$lines[] = '';

	foreach ($entries as $entry) {
		$name = $entry['name'];
		$var = $entry['var'];
		if ($entry['type'] === 'repeater') {
			$lines[] = '$' . $var . " = \$values['" . $name . "'] ?? [];";
		} else {
			$lines[] = '$' . $var . " = \$values['" . $name . "'] ?? '';";
		}
	}

	if ($entries !== []) {
		$lines[] = '';
	}

	$lines[] = '$wrapper_attributes = get_block_wrapper_attributes([';
	$lines[] = "\t'class' => '" . $class . "',";
	$lines[] = ']);';
	$lines[] = '?>';
	$lines[] = '<div <?php echo $wrapper_attributes; ?>>';

	if ($entries === []) {
		$lines[] = "\t<?php // Add fields in the block definition, then regenerate or extend this template. ?>";
	} else {
		foreach ($entries as $entry) {
			$var = $entry['var'];
			if ($entry['type'] === 'repeater') {
				$lines[] = "\t<?php if (!empty(\$" . $var . ') && is_array($' . $var . ')) : ?>';
				$lines[] = "\t\t<?php foreach ($" . $var . ' as $row) : ?>';
				$lines[] = "\t\t\t<?php if (!is_array(\$row)) { continue; } ?>";
				foreach ($entry['children'] ?? [] as $child) {
					$lines[] = "\t\t\t<?php \$" . $child['var'] . " = \$row['" . $child['name'] . "'] ?? ''; ?>";
				}
				$first_child = ($entry['children'][0]['var'] ?? '');
				if ($first_child !== '') {
					$lines[] = "\t\t\t<?php if ((string) \$" . $first_child . " !== '') : ?>";
					$lines[] = "\t\t\t\t<p><?php echo esc_html((string) \$" . $first_child . '); ?></p>';
					$lines[] = "\t\t\t<?php endif; ?>";
				}
				$lines[] = "\t\t<?php endforeach; ?>";
				$lines[] = "\t<?php endif; ?>";
				continue;
			}
			if (in_array($entry['type'], ['textarea', 'text_block', 'html'], true)) {
				$lines[] = "\t<?php if ((string) \$" . $var . " !== '') : ?>";
				$lines[] = "\t\t<div><?php echo wp_kses_post((string) \$" . $var . '); ?></div>';
				$lines[] = "\t<?php endif; ?>";
				continue;
			}
			$lines[] = "\t<?php if ((string) \$" . $var . " !== '') : ?>";
			$lines[] = "\t\t<p><?php echo esc_html((string) \$" . $var . '); ?></p>';
			$lines[] = "\t<?php endif; ?>";
		}
	}

	$lines[] = '</div>';
	$lines[] = '';

	return implode("\n", $lines);
}

/**
 * Absolute path where a new starter template should be written (child theme preferred).
 */
function bl_blocks_starter_template_target_path(string $slug): string
{
	$relative = bl_blocks_template_relative_path($slug);

	return trailingslashit(get_stylesheet_directory()) . $relative;
}

/**
 * Write starter template PHP into the active (child) theme.
 *
 * @return array{path: string, display_path: string}|WP_Error
 */
function bl_blocks_write_starter_template(string $slug, string $code)
{
	$slug = sanitize_key($slug);
	if ($slug === '') {
		return new WP_Error('bl_blocks_bad_slug', __('Invalid block slug.', 'baselayer-blocks'));
	}

	$existing = bl_blocks_locate_template($slug);
	if ($existing !== '') {
		return new WP_Error(
			'bl_blocks_template_exists',
			__('A template file already exists for this block.', 'baselayer-blocks')
		);
	}

	$target = bl_blocks_starter_template_target_path($slug);
	$stylesheet = wp_normalize_path(trailingslashit(get_stylesheet_directory()));
	$normalized = wp_normalize_path($target);
	if ($normalized === '' || !str_starts_with($normalized, $stylesheet)) {
		return new WP_Error('bl_blocks_bad_path', __('Invalid template path.', 'baselayer-blocks'));
	}

	$dir = dirname($target);
	if (!is_dir($dir) && !wp_mkdir_p($dir)) {
		return new WP_Error(
			'bl_blocks_mkdir_failed',
			__('Could not create the template folder.', 'baselayer-blocks')
		);
	}

	$written = file_put_contents($target, $code);
	if ($written === false) {
		return new WP_Error(
			'bl_blocks_write_failed',
			__('Could not write the template file.', 'baselayer-blocks')
		);
	}

	$info = bl_blocks_template_info($slug);

	return [
		'path'         => $target,
		'display_path' => $info['exists'] ? $info['display_path'] : $info['create_path'],
	];
}
