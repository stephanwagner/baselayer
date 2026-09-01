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
 * Whether a starter field entry stores a list of scalar values.
 *
 * @param array{type: string, multiple?: bool} $entry
 */
function bl_blocks_starter_is_multi_value(array $entry): bool
{
	$type = (string) ($entry['type'] ?? '');
	if ($type === 'checkboxes') {
		return true;
	}

	return in_array($type, ['select', 'button_group'], true) && !empty($entry['multiple']);
}

/**
 * Build one starter field entry (with optional multiple flag / children).
 *
 * @param array<string, mixed> $field
 * @param array<string, true>  $used
 * @return array{name: string, var: string, type: string, label: string, multiple: bool, children?: list<array{name: string, var: string, type: string, label: string, multiple: bool}>}|null
 */
function bl_blocks_starter_make_field_entry(array $field, array &$used): ?array
{
	$type = (string) ($field['type'] ?? '');
	if (bl_blocks_is_static_field_type($type)) {
		return null;
	}
	$name = (string) ($field['name'] ?? '');
	if ($name === '') {
		return null;
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
		'name'     => $name,
		'var'      => $var,
		'type'     => $type,
		'label'    => (string) ($field['label'] ?? $name),
		'multiple' => !empty($field['multiple']),
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
			$child_entry = bl_blocks_starter_make_field_entry($child, $child_used);
			if ($child_entry !== null) {
				$children[] = $child_entry;
			}
		}
		$entry['children'] = $children;
	}

	return $entry;
}

/**
 * Value-bearing fields for starter templates (excludes layout + static).
 *
 * @param list<array<string, mixed>> $fields
 * @return list<array{name: string, var: string, type: string, label: string, multiple: bool, children?: list<array{name: string, var: string, type: string, label: string, multiple: bool}>}>
 */
function bl_blocks_starter_template_fields(array $fields): array
{
	$out = [];
	$used = [];

	foreach (bl_blocks_iter_fields($fields) as $field) {
		$entry = bl_blocks_starter_make_field_entry($field, $used);
		if ($entry !== null) {
			$out[] = $entry;
		}
	}

	return $out;
}

/**
 * Indent a list of lines with tabs.
 *
 * @param list<string> $lines
 * @return list<string>
 */
function bl_blocks_starter_indent_lines(array $lines, int $tabs): array
{
	if ($tabs <= 0) {
		return $lines;
	}
	$prefix = str_repeat("\t", $tabs);

	return array_map(static fn(string $line): string => $line === '' ? '' : $prefix . $line, $lines);
}

/**
 * Type-aware preview markup for a value already loaded via bl_block_field() / row data.
 *
 * @param array{name: string, var: string, type: string, label: string, multiple?: bool} $entry
 * @return list<string>
 */
function bl_blocks_starter_render_lines(array $entry, string $block_class): array
{
	$var = '$' . $entry['var'];
	$type = (string) ($entry['type'] ?? '');
	$name = (string) ($entry['name'] ?? 'field');
	$label = (string) ($entry['label'] ?? $name);
	$mod = $block_class . '__' . sanitize_html_class($name, 'field');
	$label_export = str_replace(["\r", "\n", "'", '\\'], '', $label);
	$multiple = !empty($entry['multiple']);

	switch ($type) {
		case 'image':
			if ($multiple) {
				return [
					'<?php if (' . $var . ') : ?>',
					"\t" . '<div class="' . $mod . '">',
					"\t\t" . '<?php foreach (' . $var . ' as $image) : ?>',
					"\t\t\t" . '<?php',
					"\t\t\t" . 'echo function_exists(\'bl_img\')',
					"\t\t\t\t" . '? bl_img($image[\'ID\'], \'large\', [\'class\' => \'' . $mod . '-item\'])',
					"\t\t\t\t" . ': wp_get_attachment_image($image[\'ID\'], \'large\', false, [\'class\' => \'' . $mod . '-item\']);',
					"\t\t\t" . '?>',
					"\t\t" . '<?php endforeach; ?>',
					"\t" . '</div>',
					'<?php endif; ?>',
				];
			}

			return [
				'<?php if (' . $var . ') : ?>',
				"\t" . '<?php',
				"\t" . 'echo function_exists(\'bl_img\')',
				"\t\t" . '? bl_img(' . $var . '[\'ID\'], \'large\', [\'class\' => \'' . $mod . '\'])',
				"\t\t" . ': wp_get_attachment_image(' . $var . '[\'ID\'], \'large\', false, [\'class\' => \'' . $mod . '\']);',
				"\t" . '?>',
				'<?php endif; ?>',
			];

		case 'file':
			if ($multiple) {
				return [
					'<?php if (' . $var . ') : ?>',
					"\t" . '<ul class="' . $mod . '">',
					"\t\t" . '<?php foreach (' . $var . ' as $file) : ?>',
					"\t\t\t" . '<li><a href="<?php echo esc_url($file[\'url\']); ?>"><?php echo esc_html($file[\'title\'] !== \'\' ? $file[\'title\'] : $file[\'filename\']); ?></a></li>',
					"\t\t" . '<?php endforeach; ?>',
					"\t" . '</ul>',
					'<?php endif; ?>',
				];
			}

			return [
				'<?php if (' . $var . ') : ?>',
				"\t" . '<p class="' . $mod . '"><a href="<?php echo esc_url(' . $var . '[\'url\']); ?>"><?php echo esc_html(' . $var . '[\'title\'] !== \'\' ? ' . $var . '[\'title\'] : ' . $var . '[\'filename\']); ?></a></p>',
				'<?php endif; ?>',
			];

		case 'page':
			if ($multiple) {
				return [
					'<?php if (' . $var . ') : ?>',
					"\t" . '<ul class="' . $mod . '">',
					"\t\t" . '<?php foreach (' . $var . ' as $page) : ?>',
					"\t\t\t" . '<li><a href="<?php echo esc_url($page[\'url\']); ?>"><?php echo esc_html($page[\'title\']); ?></a></li>',
					"\t\t" . '<?php endforeach; ?>',
					"\t" . '</ul>',
					'<?php endif; ?>',
				];
			}

			return [
				'<?php if (' . $var . ') : ?>',
				"\t" . '<p class="' . $mod . '"><a href="<?php echo esc_url(' . $var . '[\'url\']); ?>"><?php echo esc_html(' . $var . '[\'title\']); ?></a></p>',
				'<?php endif; ?>',
			];

		case 'link':
			return [
				'<?php if (' . $var . ') : ?>',
				"\t" . '<p class="' . $mod . '"><a href="<?php echo esc_url(' . $var . '[\'url\']); ?>"<?php echo !empty(' . $var . '[\'target\']) ? \' target="_blank" rel="noopener noreferrer"\' : \'\'; ?>><?php echo esc_html(' . $var . '[\'title\']); ?></a></p>',
				'<?php endif; ?>',
			];

		case 'url':
			return [
				'<?php if (' . $var . ') : ?>',
				"\t" . '<p class="' . $mod . '"><a href="<?php echo esc_url(' . $var . '); ?>"><?php echo esc_html(' . $var . '); ?></a></p>',
				'<?php endif; ?>',
			];

		case 'email':
			return [
				'<?php if (' . $var . ') : ?>',
				"\t" . '<p class="' . $mod . '"><a href="<?php echo esc_url(\'mailto:\' . antispambot(' . $var . ')); ?>"><?php echo esc_html(antispambot(' . $var . ')); ?></a></p>',
				'<?php endif; ?>',
			];

		case 'phone':
			return [
				'<?php if (' . $var . ') : ?>',
				"\t" . '<p class="' . $mod . '"><a href="<?php echo esc_url(\'tel:\' . preg_replace(\'/\\s+/\', \'\', ' . $var . ')); ?>"><?php echo esc_html(' . $var . '); ?></a></p>',
				'<?php endif; ?>',
			];

		case 'textarea':
		case 'text_block':
		case 'html':
		case 'wysiwyg':
			return [
				'<?php if (' . $var . ') : ?>',
				"\t" . '<div class="' . $mod . '"><?php echo wp_kses_post(' . $var . '); ?></div>',
				'<?php endif; ?>',
			];

		case 'toggle':
			return [
				'<?php if (' . $var . ') : ?>',
				"\t" . '<p class="' . $mod . '"><?php echo esc_html(\'' . $label_export . '\'); ?></p>',
				'<?php endif; ?>',
			];

		case 'range':
			$mode = (string) ($entry['mode'] ?? 'range');
			if ($mode === 'single') {
				return [
					'<?php if (' . $var . ' !== \'\' && ' . $var . ' !== null) : ?>',
					"\t" . '<p class="' . $mod . '"><?php echo esc_html(' . $var . '); ?></p>',
					'<?php endif; ?>',
				];
			}

			return [
				'<?php if (is_array(' . $var . ') && ((' . $var . '[\'from\'] ?? \'\') !== \'\' || (' . $var . '[\'to\'] ?? \'\') !== \'\')) : ?>',
				"\t" . '<p class="' . $mod . '"><?php echo esc_html(trim((' . $var . '[\'from\'] ?? \'\') . \'–\' . (' . $var . '[\'to\'] ?? \'\'), \'–\')); ?></p>',
				'<?php endif; ?>',
			];

		default:
			if (bl_blocks_starter_is_multi_value($entry)) {
				return [
					'<?php if (' . $var . ') : ?>',
					"\t" . '<ul class="' . $mod . '">',
					"\t\t" . '<?php foreach (' . $var . ' as $item) : ?>',
					"\t\t\t" . '<li><?php echo esc_html($item); ?></li>',
					"\t\t" . '<?php endforeach; ?>',
					"\t" . '</ul>',
					'<?php endif; ?>',
				];
			}

			return [
				'<?php if (' . $var . ') : ?>',
				"\t" . '<p class="' . $mod . '"><?php echo esc_html(' . $var . '); ?></p>',
				'<?php endif; ?>',
			];
	}
}

/**
 * Build starter PHP template source for a block definition.
 *
 * @param list<array<string, mixed>> $fields
 */
function bl_blocks_build_starter_template(string $slug, string $title, array $fields, bool $supports_inner_blocks = false): string
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
		$lines[] = '$' . $entry['var'] . " = bl_block_field('" . $entry['name'] . "');";
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
			if ($entry['type'] === 'repeater') {
				$var = $entry['var'];
				$lines[] = "\t<?php if (" . '$' . $var . ') : ?>';
				$lines[] = "\t\t<?php foreach ($" . $var . ' as $row) : ?>';
				$children = $entry['children'] ?? [];
				if ($children !== []) {
					$lines[] = "\t\t\t" . '<div class="' . $class . '__' . sanitize_html_class($entry['name'], 'row') . '">';
					foreach ($children as $child) {
						$lines[] = "\t\t\t\t<?php \$" . $child['var'] . " = \$row['" . $child['name'] . "']; ?>";
						foreach (bl_blocks_starter_indent_lines(bl_blocks_starter_render_lines($child, $class), 4) as $render_line) {
							$lines[] = $render_line;
						}
					}
					$lines[] = "\t\t\t" . '</div>';
				}
				$lines[] = "\t\t<?php endforeach; ?>";
				$lines[] = "\t<?php endif; ?>";
				continue;
			}

			foreach (bl_blocks_starter_indent_lines(bl_blocks_starter_render_lines($entry, $class), 1) as $render_line) {
				$lines[] = $render_line;
			}
		}
	}

	if ($supports_inner_blocks) {
		$lines[] = "\t<div class=\"" . $class . '__inner">';
		$lines[] = "\t\t<InnerBlocks />";
		$lines[] = "\t</div>";
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
 * Theme blocks/ directory for the active stylesheet (child preferred).
 */
function bl_blocks_theme_blocks_dir(): string
{
	return trailingslashit(get_stylesheet_directory()) . 'blocks';
}

/**
 * Default contents for the theme blocks/_blocks.scss aggregator.
 */
function bl_blocks_aggregator_blocks_scss_stub(): string
{
	return "// BaseLayer custom block styles — forwarded from src/scss/main.scss\n"
		. "// Starter write appends one @forward per block.\n";
}

/**
 * Default contents for the theme blocks/_blocks-editor.scss aggregator.
 */
function bl_blocks_aggregator_blocks_editor_scss_stub(): string
{
	return "// BaseLayer custom block editor styles — forwarded from src/scss/admin.scss\n"
		. "// Starter write appends one @forward per block.\n";
}

/**
 * Default contents for the theme blocks/blocks.js aggregator.
 */
function bl_blocks_aggregator_blocks_js_stub(): string
{
	return "// BaseLayer custom block scripts — imported from src/js/main/main.js\n"
		. "// Starter write appends one import per block.\n";
}

/**
 * Starter front SCSS for a block (wrapper position: relative).
 */
function bl_blocks_build_starter_scss(string $slug): string
{
	$class = 'bl-' . $slug;

	return "@use '../../src/scss/config' as *;\n"
		. "\n"
		. '.' . $class . " {\n"
		. "  position: relative;\n"
		. "}\n";
}

/**
 * Starter editor-only SCSS stub for a block.
 */
function bl_blocks_build_starter_editor_scss(string $slug): string
{
	$class = 'bl-' . $slug;

	return "@use '../../src/scss/config' as *;\n"
		. "\n"
		. "/**\n"
		. " * Editor-only tweaks for {$slug} (loaded via blocks/_blocks-editor.scss).\n"
		. " */\n"
		. "\n"
		. ".editor-styles-wrapper {\n"
		. "  .{$class} {\n"
		. "    // Add your editor-only styles here\n"
		. "  }\n"
		. "}\n";
}

/**
 * Starter front JS stub for a block.
 */
function bl_blocks_build_starter_js(string $slug): string
{
	return "/**\n"
		. " * Front-end script for {$slug}.\n"
		. " * Runs when the theme main.js bundle loads.\n"
		. " */\n"
		. "\n"
		. "// Start scripting your block here\n";
}

/**
 * Ensure aggregator files exist under the theme blocks/ directory.
 *
 * @return true|WP_Error
 */
function bl_blocks_ensure_theme_aggregators()
{
	$dir = bl_blocks_theme_blocks_dir();
	if (!is_dir($dir) && !wp_mkdir_p($dir)) {
		return new WP_Error(
			'bl_blocks_mkdir_failed',
			__('Could not create the blocks folder.', 'baselayer-blocks')
		);
	}

	$files = [
		$dir . '/_blocks.scss'        => bl_blocks_aggregator_blocks_scss_stub(),
		$dir . '/_blocks-editor.scss' => bl_blocks_aggregator_blocks_editor_scss_stub(),
		$dir . '/blocks.js'           => bl_blocks_aggregator_blocks_js_stub(),
	];

	foreach ($files as $path => $stub) {
		if (file_exists($path)) {
			continue;
		}
		if (file_put_contents($path, $stub) === false) {
			return new WP_Error(
				'bl_blocks_write_failed',
				__('Could not write a blocks aggregator file.', 'baselayer-blocks')
			);
		}
	}

	return true;
}

/**
 * Append a line to a file when it is not already present (idempotent).
 *
 * @return true|WP_Error
 */
function bl_blocks_append_line_once(string $path, string $line)
{
	$line = rtrim($line);
	if ($line === '') {
		return true;
	}

	$existing = is_readable($path) ? (string) file_get_contents($path) : '';
	if ($existing !== '' && str_contains($existing, $line)) {
		return true;
	}

	$prefix = $existing;
	if ($prefix !== '' && !str_ends_with($prefix, "\n")) {
		$prefix .= "\n";
	}

	$written = file_put_contents($path, $prefix . $line . "\n");
	if ($written === false) {
		return new WP_Error(
			'bl_blocks_write_failed',
			__('Could not update a blocks aggregator file.', 'baselayer-blocks')
		);
	}

	return true;
}

/**
 * Write SCSS/JS stubs and register the block in theme aggregators.
 *
 * @return true|WP_Error
 */
function bl_blocks_write_starter_assets(string $slug)
{
	$slug = sanitize_key($slug);
	if ($slug === '') {
		return new WP_Error('bl_blocks_bad_slug', __('Invalid block slug.', 'baselayer-blocks'));
	}

	$ensured = bl_blocks_ensure_theme_aggregators();
	if (is_wp_error($ensured)) {
		return $ensured;
	}

	$blocks_dir = bl_blocks_theme_blocks_dir();
	$block_dir = trailingslashit($blocks_dir) . $slug;
	if (!is_dir($block_dir) && !wp_mkdir_p($block_dir)) {
		return new WP_Error(
			'bl_blocks_mkdir_failed',
			__('Could not create the template folder.', 'baselayer-blocks')
		);
	}

	$assets = [
		$block_dir . '/_' . $slug . '.scss'        => bl_blocks_build_starter_scss($slug),
		$block_dir . '/_' . $slug . '-editor.scss' => bl_blocks_build_starter_editor_scss($slug),
		$block_dir . '/' . $slug . '.js'           => bl_blocks_build_starter_js($slug),
	];

	foreach ($assets as $path => $contents) {
		if (file_exists($path)) {
			continue;
		}
		if (file_put_contents($path, $contents) === false) {
			return new WP_Error(
				'bl_blocks_write_failed',
				__('Could not write block asset files.', 'baselayer-blocks')
			);
		}
	}

	$appends = [
		[$blocks_dir . '/_blocks.scss', "@forward '{$slug}/{$slug}';"],
		[$blocks_dir . '/_blocks-editor.scss', "@forward '{$slug}/{$slug}-editor';"],
		[$blocks_dir . '/blocks.js', "import './{$slug}/{$slug}.js';"],
	];

	foreach ($appends as [$path, $line]) {
		$result = bl_blocks_append_line_once($path, $line);
		if (is_wp_error($result)) {
			return $result;
		}
	}

	return true;
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

	$assets = bl_blocks_write_starter_assets($slug);
	if (is_wp_error($assets)) {
		return $assets;
	}

	$info = bl_blocks_template_info($slug);

	return [
		'path'         => $target,
		'display_path' => $info['exists'] ? $info['display_path'] : $info['create_path'],
	];
}
