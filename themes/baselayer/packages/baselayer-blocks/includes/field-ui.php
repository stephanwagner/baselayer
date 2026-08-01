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
	if (function_exists('bl_forms_palette_icons')) {
		return bl_forms_palette_icons();
	}

	$keys = [
		'text',
		'textarea',
		'email',
		'url',
		'number',
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
		'column',
		'section',
		'repeater',
		'hidden',
		'add',
		'caret',
		'panelCollapse',
		'panelExpand',
		'edit',
		'done',
		'trash',
		'duplicate',
		'drag',
		'design',
		'tune',
		'fullscreen',
		'fullscreenExit',
	];

	$registry = function_exists('bl_blocks_builder_icon_svgs')
		? bl_blocks_builder_icon_svgs()
		: [];
	$icons = [];
	foreach ($keys as $key) {
		$svg = $registry[$key] ?? '';
		if ($svg === '' || stripos($svg, '<svg') === false) {
			continue;
		}
		$attrs = ' width="16" height="16" aria-hidden="true" focusable="false"';
		$icons[$key] = (string) preg_replace('/<svg\b([^>]*)>/i', '<svg$1' . $attrs . '>', $svg, 1);
	}

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
			'text', 'textarea', 'email', 'phone', 'url', 'number',
			'checkboxes', 'radio', 'select', 'toggle', 'button_group',
			'date', 'time', 'datetime', 'file', 'image',
			'heading', 'text_block', 'divider', 'spacer', 'html',
			'column', 'section', 'hidden',
		];
	}

	if (!in_array('repeater', $types, true)) {
		$types[] = 'repeater';
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
 * Page settings post meta key for a definition.
 */
function bl_blocks_page_meta_key(int $definition_id): string
{
	return '_bl_page_settings_' . (int) $definition_id;
}

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
 * Render admin field controls for a definition (Site Settings / modal markup).
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, mixed>       $values
 */
function bl_blocks_render_admin_fields(array $fields, array $values, string $name_prefix = 'bl_blocks_values'): string
{
	ob_start();
	echo '<div class="bl-blocks-fields" data-bl-blocks-fields>';
	bl_blocks_render_admin_fields_walk($fields, $values, $name_prefix);
	echo '</div>';

	return (string) ob_get_clean();
}

/**
 * @param list<array<string, mixed>> $fields
 * @param array<string, mixed>       $values
 */
function bl_blocks_render_admin_fields_walk(array $fields, array $values, string $name_prefix): void
{
	foreach ($fields as $field) {
		if (!is_array($field)) {
			continue;
		}
		if (isset($field['active']) && empty($field['active'])) {
			continue;
		}
		$type = (string) ($field['type'] ?? 'text');
		if (bl_blocks_is_layout_field_type($type)) {
			$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
			$class = 'bl-blocks-fields__layout bl-blocks-fields__layout--' . sanitize_html_class($type);
			echo '<div class="' . esc_attr($class) . '">';
			if ($type === 'section') {
				$label = (string) ($field['label'] ?? '');
				if ($label !== '') {
					echo '<h3 class="bl-blocks-fields__section-title">' . esc_html($label) . '</h3>';
				}
			}
			bl_blocks_render_admin_fields_walk($children, $values, $name_prefix);
			echo '</div>';
			continue;
		}
		if (bl_blocks_is_static_field_type($type) && !in_array($type, ['heading', 'text_block', 'html'], true)) {
			continue;
		}
		if ($type === 'heading') {
			$label = (string) ($field['label'] ?? '');
			if ($label !== '') {
				echo '<h4 class="bl-blocks-fields__heading">' . esc_html($label) . '</h4>';
			}
			continue;
		}
		if ($type === 'text_block' || $type === 'html') {
			$content = (string) ($field['default_value'] ?? $field['content'] ?? $field['label'] ?? '');
			if ($content !== '') {
				echo '<div class="bl-blocks-fields__static">' . wp_kses_post($content) . '</div>';
			}
			continue;
		}

		$name = (string) ($field['name'] ?? '');
		if ($name === '') {
			continue;
		}

		if ($type === 'repeater') {
			bl_blocks_render_admin_repeater($field, $values[$name] ?? [], $name_prefix);
			continue;
		}

		$id = 'bl-blocks-field-' . sanitize_html_class($name);
		$label = (string) ($field['label'] ?? $name);
		$hide_label = !empty($field['hide_label']);
		$required = !empty($field['required']);
		$desc = (string) ($field['description'] ?? '');
		$value = $values[$name] ?? ($field['default_value'] ?? '');
		$input_name = $name_prefix . '[' . $name . ']';
		$width = (string) ($field['width'] ?? '100');
		$width_class = 'bl-blocks-fields__row';
		if ($width !== '' && $width !== '100') {
			$width_class .= ' bl-blocks-fields__row--w' . sanitize_html_class($width);
		}

		echo '<div class="' . esc_attr($width_class) . '" data-field-name="' . esc_attr($name) . '">';
		if (!$hide_label && !in_array($type, ['toggle', 'terms'], true)) {
			echo '<label class="bl-blocks-fields__label" for="' . esc_attr($id) . '">';
			echo esc_html($label);
			if ($required) {
				echo ' <span class="required">*</span>';
			}
			echo '</label>';
		}

		$options = isset($field['options']) && is_array($field['options']) ? $field['options'] : [];
		$placeholder = (string) ($field['placeholder'] ?? '');

		switch ($type) {
			case 'textarea':
				$rows = max(2, (int) ($field['rows'] ?? 4));
				printf(
					'<textarea class="widefat" id="%s" name="%s" rows="%d" placeholder="%s"%s>%s</textarea>',
					esc_attr($id),
					esc_attr($input_name),
					$rows,
					esc_attr($placeholder),
					$required ? ' required' : '',
					esc_textarea(is_scalar($value) ? (string) $value : '')
				);
				break;

			case 'select':
				$multiple = !empty($field['multiple']);
				$selected = $multiple
					? (is_array($value) ? $value : (array) $value)
					: [(string) (is_scalar($value) ? $value : '')];
				printf(
					'<select class="widefat" id="%s" name="%s%s"%s%s>',
					esc_attr($id),
					esc_attr($input_name),
					$multiple ? '[]' : '',
					$multiple ? ' multiple' : '',
					$required ? ' required' : ''
				);
				if (!$multiple) {
					echo '<option value="">' . esc_html__('—', 'baselayer-blocks') . '</option>';
				}
				foreach ($options as $opt) {
					if (!is_array($opt)) {
						continue;
					}
					$ov = (string) ($opt['value'] ?? '');
					$ol = (string) ($opt['label'] ?? $ov);
					printf(
						'<option value="%s"%s>%s</option>',
						esc_attr($ov),
						selected(in_array($ov, array_map('strval', $selected), true), true, false),
						esc_html($ol)
					);
				}
				echo '</select>';
				break;

			case 'radio':
			case 'button_group':
				echo '<div class="bl-blocks-fields__choices">';
				foreach ($options as $i => $opt) {
					if (!is_array($opt)) {
						continue;
					}
					$ov = (string) ($opt['value'] ?? '');
					$ol = (string) ($opt['label'] ?? $ov);
					$oid = $id . '-' . $i;
					printf(
						'<label class="bl-blocks-fields__choice"><input type="radio" name="%s" id="%s" value="%s"%s> %s</label>',
						esc_attr($input_name),
						esc_attr($oid),
						esc_attr($ov),
						checked((string) (is_scalar($value) ? $value : ''), $ov, false),
						esc_html($ol)
					);
				}
				echo '</div>';
				break;

			case 'checkboxes':
				$list = is_array($value) ? $value : [];
				echo '<div class="bl-blocks-fields__choices">';
				foreach ($options as $i => $opt) {
					if (!is_array($opt)) {
						continue;
					}
					$ov = (string) ($opt['value'] ?? '');
					$ol = (string) ($opt['label'] ?? $ov);
					$oid = $id . '-' . $i;
					printf(
						'<label class="bl-blocks-fields__choice"><input type="checkbox" name="%s[]" id="%s" value="%s"%s> %s</label>',
						esc_attr($input_name),
						esc_attr($oid),
						esc_attr($ov),
						checked(in_array($ov, array_map('strval', $list), true), true, false),
						esc_html($ol)
					);
				}
				echo '</div>';
				break;

			case 'toggle':
			case 'terms':
				printf(
					'<label class="bl-blocks-fields__toggle"><input type="checkbox" name="%s" id="%s" value="1"%s> %s</label>',
					esc_attr($input_name),
					esc_attr($id),
					checked(!empty($value), true, false),
					esc_html($label)
				);
				break;

			case 'hidden':
				printf(
					'<input type="hidden" name="%s" value="%s">',
					esc_attr($input_name),
					esc_attr(is_scalar($value) ? (string) $value : '')
				);
				break;

			default:
				$input_type = 'text';
				if ($type === 'phone') {
					$input_type = 'tel';
				} elseif ($type === 'datetime') {
					$input_type = 'datetime-local';
				} elseif (in_array($type, ['email', 'url', 'number', 'date', 'time'], true)) {
					$input_type = $type;
				}
				printf(
					'<input class="widefat" type="%s" id="%s" name="%s" value="%s" placeholder="%s"%s>',
					esc_attr($input_type),
					esc_attr($id),
					esc_attr($input_name),
					esc_attr(is_scalar($value) ? (string) $value : ''),
					esc_attr($placeholder),
					$required ? ' required' : ''
				);
				break;
		}

		if ($desc !== '') {
			echo '<p class="description">' . esc_html($desc) . '</p>';
		}
		echo '</div>';
	}
}

/**
 * Render a repeater control for PHP admin (Website settings).
 *
 * @param array<string, mixed>       $field
 * @param mixed                      $rows
 */
function bl_blocks_render_admin_repeater(array $field, $rows, string $name_prefix): void
{
	$name = (string) ($field['name'] ?? '');
	if ($name === '') {
		return;
	}
	$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
	$label = (string) ($field['label'] ?? $name);
	$button = (string) ($field['button_label'] ?? '');
	if ($button === '') {
		$button = __('Add row', 'baselayer-blocks');
	}
	$min_rows = max(0, (int) ($field['min_rows'] ?? 0));
	$max_rows = max(0, (int) ($field['max_rows'] ?? 0));
	$rows = is_array($rows) ? array_values($rows) : [];
	while (count($rows) < $min_rows) {
		$rows[] = [];
	}
	if ($max_rows > 0 && count($rows) > $max_rows) {
		$rows = array_slice($rows, 0, $max_rows);
	}
	if ($rows === [] && $min_rows === 0) {
		// Keep one empty visual row for easier editing when optional.
		$rows = [[]];
	}

	$input_base = $name_prefix . '[' . $name . ']';
	$design = sanitize_key((string) ($field['design'] ?? 'standard'));
	if (!in_array($design, ['standard', 'outline', 'card'], true)) {
		$design = 'standard';
	}
	$classes = 'bl-blocks-fields__repeater bl-blocks-fields__repeater--' . $design;
	$extra = sanitize_html_class((string) ($field['css_class'] ?? ''));
	if ($extra !== '') {
		$classes .= ' ' . $extra;
	}
	$show_title = !array_key_exists('show_title', $field) || !empty($field['show_title']);
	echo '<div class="' . esc_attr($classes) . '" data-bl-blocks-repeater data-min-rows="' . esc_attr((string) $min_rows) . '" data-max-rows="' . esc_attr((string) $max_rows) . '">';
	if ($label !== '' && $show_title && empty($field['hide_label'])) {
		echo '<div class="bl-blocks-fields__label">' . esc_html($label) . '</div>';
	}
	$desc = (string) ($field['description'] ?? '');
	if ($desc !== '') {
		echo '<p class="description">' . esc_html($desc) . '</p>';
	}
	echo '<div class="bl-blocks-fields__repeater-rows">';
	foreach ($rows as $i => $row_values) {
		$row_values = is_array($row_values) ? $row_values : [];
		echo '<div class="bl-blocks-fields__repeater-row">';
		echo '<div class="bl-blocks-fields__repeater-row-header">';
		echo '<span class="bl-blocks-fields__repeater-row-title">' . esc_html(sprintf(/* translators: %d: row number */ __('Row %d', 'baselayer-blocks'), $i + 1)) . '</span>';
		echo '</div>';
		bl_blocks_render_admin_fields_walk($children, $row_values, $input_base . '[' . $i . ']');
		echo '</div>';
	}
	echo '</div>';
	echo '</div>';
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
 * Shared admin field UI assets (modal + site page).
 */
function bl_blocks_enqueue_field_ui_assets(): void
{
	static $done = false;
	if ($done) {
		return;
	}
	$done = true;

	bl_blocks_enqueue_style('bl-blocks-admin', 'blocks-admin');
	bl_blocks_enqueue_script('bl-blocks-admin', 'blocks-admin', [], true);

	wp_localize_script('bl-blocks-admin', 'blBlocksFieldUi', [
		'i18n' => [
			'edit'        => __('Edit', 'baselayer-blocks'),
			'save'        => __('Save', 'baselayer-blocks'),
			'cancel'      => __('Cancel', 'baselayer-blocks'),
			'close'       => __('Close', 'baselayer-blocks'),
			'addRow'     => __('Add row', 'baselayer-blocks'),
			'removeRow'  => __('Remove row', 'baselayer-blocks'),
			'rowLabel'    => __('Row %d', 'baselayer-blocks'),
			'repeater'    => __('Repeater', 'baselayer-blocks'),
		],
	]);
}
