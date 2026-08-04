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

	// Blocks-specific glyphs (Forms palette has no `icon` / `extensions` / `plus` / `box` keys).
	$add($icons, $registry, 'icon');
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
			'text', 'textarea', 'email', 'phone', 'url', 'number',
			'checkboxes', 'radio', 'select', 'toggle', 'button_group',
			'date', 'time', 'datetime', 'file', 'image',
			'heading', 'text_block', 'divider', 'spacer', 'html',
			'column', 'section', 'tab', 'hidden', 'page', 'link',
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
	echo '<div class="bl-blocks-fields bl-admin-form" data-bl-blocks-fields>';
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
	$count = count($fields);
	$i = 0;
	while ($i < $count) {
		$field = $fields[$i];
		if (!is_array($field)) {
			$i++;
			continue;
		}
		if (isset($field['active']) && empty($field['active'])) {
			$i++;
			continue;
		}
		$type = (string) ($field['type'] ?? 'text');

		if ($type === 'tab') {
			$run = [];
			while ($i < $count && is_array($fields[$i]) && (($fields[$i]['type'] ?? '') === 'tab')) {
				$run[] = $fields[$i];
				$i++;
			}
			bl_blocks_render_admin_tab_group($run, $values, $name_prefix);
			continue;
		}

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
			$i++;
			continue;
		}
		if (bl_blocks_is_static_field_type($type) && !in_array($type, ['heading', 'text_block', 'html'], true)) {
			$i++;
			continue;
		}
		if ($type === 'heading') {
			$content = trim((string) ($field['content'] ?? $field['label'] ?? ''));
			if ($content !== '') {
				$level_raw = strtolower((string) ($field['level'] ?? 'h4'));
				$tag = in_array($level_raw, ['h2', 'h3', 'h4'], true) ? $level_raw : 'h4';
				echo '<' . $tag . ' class="bl-blocks-fields__heading">' . esc_html($content) . '</' . $tag . '>';
			}
			$i++;
			continue;
		}
		if ($type === 'text_block' || $type === 'html') {
			$content = (string) ($field['default_value'] ?? $field['content'] ?? $field['label'] ?? '');
			if ($content !== '') {
				echo '<div class="bl-blocks-fields__static">' . wp_kses_post($content) . '</div>';
			}
			$i++;
			continue;
		}

		$name = (string) ($field['name'] ?? '');
		if ($name === '') {
			$i++;
			continue;
		}

		if ($type === 'repeater') {
			bl_blocks_render_admin_repeater($field, $values[$name] ?? [], $name_prefix);
			$i++;
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
				foreach ($options as $opt_i => $opt) {
					if (!is_array($opt)) {
						continue;
					}
					$ov = (string) ($opt['value'] ?? '');
					$ol = (string) ($opt['label'] ?? $ov);
					$oid = $id . '-' . $opt_i;
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
				foreach ($options as $opt_i => $opt) {
					if (!is_array($opt)) {
						continue;
					}
					$ov = (string) ($opt['value'] ?? '');
					$ol = (string) ($opt['label'] ?? $ov);
					$oid = $id . '-' . $opt_i;
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

			case 'page':
				bl_blocks_render_admin_page_field($field, $value, $input_name);
				break;

			case 'image':
			case 'file':
				bl_blocks_render_admin_media_field($field, $value, $input_name);
				break;

			case 'link':
				bl_blocks_render_admin_link_field($field, $value, $input_name);
				break;

			default:
				$input_type = 'text';
				if ($type === 'phone') {
					$input_type = 'tel';
				} elseif ($type === 'datetime') {
					$input_type = 'datetime-local';
				} elseif (in_array($type, ['email', 'number', 'date', 'time'], true)) {
					$input_type = $type;
				} elseif ($type === 'url') {
					$input_type = 'text';
				}
				$extra_attrs = '';
				if ($type === 'url') {
					$extra_attrs .= ' data-bl-blocks-https-url';
					if ($placeholder === '') {
						$placeholder = 'https://';
					}
				}
				printf(
					'<input class="widefat" type="%s" id="%s" name="%s" value="%s" placeholder="%s"%s%s>',
					esc_attr($input_type),
					esc_attr($id),
					esc_attr($input_name),
					esc_attr(is_scalar($value) ? (string) $value : ''),
					esc_attr($placeholder),
					$extra_attrs,
					$required ? ' required' : ''
				);
				break;
		}

		if ($desc !== '') {
			echo '<p class="description">' . esc_html($desc) . '</p>';
		}
		echo '</div>';
		$i++;
	}
}

/**
 * @param list<array<string, mixed>> $tabs
 * @param array<string, mixed>       $values
 */
function bl_blocks_render_admin_tab_group(array $tabs, array $values, string $name_prefix): void
{
	$active = [];
	foreach ($tabs as $tab) {
		if (!is_array($tab)) {
			continue;
		}
		if (isset($tab['active']) && empty($tab['active'])) {
			continue;
		}
		$active[] = $tab;
	}
	if ($active === []) {
		return;
	}

	$group_id = 'bl-blocks-tabs-' . sanitize_html_class((string) ($active[0]['id'] ?? wp_unique_id('t')));
	echo '<div class="bl-blocks-fields__tabs" data-bl-blocks-tabs="' . esc_attr($group_id) . '">';
	echo '<div class="bl-blocks-fields__tablist" role="tablist">';
	foreach ($active as $index => $tab) {
		$tab_id = (string) ($tab['id'] ?? ('tab' . $index));
		$panel_id = $group_id . '-panel-' . sanitize_html_class($tab_id);
		$btn_id = $group_id . '-tab-' . sanitize_html_class($tab_id);
		$label = trim((string) ($tab['label'] ?? ''));
		if ($label === '') {
			$label = sprintf(
				/* translators: %d: tab number */
				__('Tab %d', 'baselayer-blocks'),
				$index + 1
			);
		}
		$selected = $index === 0 ? 'true' : 'false';
		echo '<button type="button" class="bl-blocks-fields__tab' . ($index === 0 ? ' is-active' : '') . '"';
		echo ' role="tab" id="' . esc_attr($btn_id) . '"';
		echo ' aria-controls="' . esc_attr($panel_id) . '"';
		echo ' aria-selected="' . esc_attr($selected) . '"';
		echo ' data-bl-blocks-tab tabindex="' . ($index === 0 ? '0' : '-1') . '">';
		echo esc_html($label);
		echo '</button>';
	}
	echo '</div>';

	foreach ($active as $index => $tab) {
		$tab_id = (string) ($tab['id'] ?? ('tab' . $index));
		$panel_id = $group_id . '-panel-' . sanitize_html_class($tab_id);
		$btn_id = $group_id . '-tab-' . sanitize_html_class($tab_id);
		$children = isset($tab['children']) && is_array($tab['children']) ? $tab['children'] : [];
		$hidden = $index === 0 ? '' : ' hidden';
		echo '<div class="bl-blocks-fields__tab-panel" role="tabpanel" id="' . esc_attr($panel_id) . '"';
		echo ' aria-labelledby="' . esc_attr($btn_id) . '"' . $hidden . '>';
		bl_blocks_render_admin_fields_walk($children, $values, $name_prefix);
		echo '</div>';
	}
	echo '</div>';
}

/**
 * Resolve page titles for admin summary (first paint).
 *
 * @param list<int> $ids
 * @return array<int, array{id:int,title:string,url:string}>
 */
function bl_blocks_page_picker_summaries(array $ids): array
{
	$out = [];
	foreach ($ids as $id) {
		$id = (int) $id;
		if ($id <= 0) {
			continue;
		}
		$post = get_post($id);
		if (!$post || $post->post_type !== 'page') {
			$out[$id] = [
				'id'    => $id,
				'title' => sprintf(
					/* translators: %d: page ID */
					__('Selected page #%d', 'baselayer-blocks'),
					$id
				),
				'url'   => '',
			];
			continue;
		}
		$out[$id] = [
			'id'    => $id,
			'title' => get_the_title($post) ?: ('#' . $id),
			'url'   => (string) get_permalink($post),
		];
	}

	return $out;
}

/**
 * Path (+ query/hash) for a page URL, without the host.
 */
function bl_blocks_page_url_path(string $url): string
{
	$url = trim($url);
	if ($url === '') {
		return '';
	}
	$parts = wp_parse_url($url);
	if (!is_array($parts)) {
		return $url;
	}
	$path = (string) ($parts['path'] ?? '/');
	if ($path === '') {
		$path = '/';
	}
	if (!empty($parts['query'])) {
		$path .= '?' . $parts['query'];
	}
	if (!empty($parts['fragment'])) {
		$path .= '#' . $parts['fragment'];
	}

	return $path;
}

/**
 * Render a page picker control for PHP admin (Website settings).
 *
 * @param array<string, mixed> $field
 * @param mixed                $value
 */
function bl_blocks_render_admin_page_field(array $field, $value, string $input_name): void
{
	$multiple = !empty($field['multiple']);
	$ids = [];
	if ($multiple) {
		$list = is_array($value) ? $value : ((is_scalar($value) && (string) $value !== '') ? [$value] : []);
		foreach ($list as $item) {
			$n = absint($item);
			if ($n > 0) {
				$ids[] = $n;
			}
		}
	} else {
		$n = absint(is_array($value) ? ($value[0] ?? 0) : $value);
		if ($n > 0) {
			$ids[] = $n;
		}
	}
	$ids = array_values(array_unique($ids));
	$summaries = bl_blocks_page_picker_summaries($ids);

	$choose_label = $ids !== []
		? ($multiple
			? __('Change pages', 'baselayer-blocks')
			: __('Change page', 'baselayer-blocks'))
		: ($multiple
			? __('Choose pages', 'baselayer-blocks')
			: __('Choose page', 'baselayer-blocks'));

	echo '<div class="bl-blocks-fields__page-picker" data-bl-blocks-page-picker data-multiple="' . esc_attr($multiple ? '1' : '0') . '" data-input-name="' . esc_attr($input_name) . '">';
	echo '<div class="bl-blocks-fields__page-picker-row">';
	echo '<div class="bl-blocks-fields__page-picker-summary" data-bl-page-summary>';
	if ($ids === []) {
		echo '<span class="description">' . esc_html(
			$multiple
				? __('Select one or more pages.', 'baselayer-blocks')
				: __('Select a page.', 'baselayer-blocks')
		) . '</span>';
	} else {
		echo '<div class="bl-blocks-fields__page-preview' . ($multiple ? ' is-multiple' : ' is-single') . '">';
		foreach ($ids as $pid) {
			$meta = $summaries[$pid] ?? ['title' => '#' . $pid, 'url' => ''];
			$title = (string) ($meta['title'] ?? ('#' . $pid));
			$url = (string) ($meta['url'] ?? '');
			$path = bl_blocks_page_url_path($url);
			echo '<div class="bl-blocks-fields__page-card" data-page-id="' . esc_attr((string) $pid) . '">';
			echo '<div class="bl-blocks-fields__page-card-body">';
			echo '<span class="bl-blocks-fields__page-card-title" title="' . esc_attr($title) . '">' . esc_html($title) . '</span>';
			if ($path !== '') {
				echo '<span class="description bl-blocks-fields__page-card-url" title="' . esc_attr($url !== '' ? $url : $path) . '">' . esc_html($path) . '</span>';
			}
			echo '</div>';
			echo '</div>';
		}
		echo '</div>';
	}
	echo '</div>';
	echo '<div class="bl-blocks-fields__page-picker-actions">';
	printf(
		'<button type="button" class="button bl-button" data-bl-page-choose>%s</button>',
		esc_html($choose_label)
	);
	printf(
		'<button type="button" class="button-link" data-bl-page-clear%s>%s</button>',
		$ids === [] ? ' hidden' : '',
		esc_html__('Clear', 'baselayer-blocks')
	);
	echo '</div>';
	echo '</div>';
	echo '<div data-bl-page-inputs>';
	if ($ids === []) {
		if ($multiple) {
			printf('<input type="hidden" name="%s[]" value="">', esc_attr($input_name));
		} else {
			printf('<input type="hidden" name="%s" value="">', esc_attr($input_name));
		}
	} else {
		foreach ($ids as $pid) {
			$name = $multiple ? $input_name . '[]' : $input_name;
			$meta = $summaries[$pid] ?? ['title' => '', 'url' => ''];
			printf(
				'<input type="hidden" name="%s" value="%s" data-title="%s" data-url="%s">',
				esc_attr($name),
				esc_attr((string) $pid),
				esc_attr((string) ($meta['title'] ?? '')),
				esc_attr((string) ($meta['url'] ?? ''))
			);
		}
	}
	echo '</div>';
	echo '</div>';
}

/**
 * Summaries for media library attachment IDs.
 *
 * @param list<int> $ids
 * @return array<int, array{url: string, filename: string, mime: string, type: string, alt: string}>
 */
function bl_blocks_media_picker_summaries(array $ids): array
{
	$out = [];
	foreach ($ids as $id) {
		$id = absint($id);
		if ($id <= 0) {
			continue;
		}
		$url = wp_get_attachment_image_url($id, 'thumbnail');
		if (!$url) {
			$url = (string) wp_get_attachment_url($id);
		}
		$file = get_attached_file($id);
		$filename = $file ? wp_basename($file) : get_the_title($id);
		$mime = (string) get_post_mime_type($id);
		$type = $mime !== '' && strpos($mime, 'image/') === 0 ? 'image' : 'file';
		$out[$id] = [
			'url'      => $url ? (string) $url : '',
			'filename' => $filename !== '' ? (string) $filename : ('#' . $id),
			'mime'     => $mime,
			'type'     => $type,
			'alt'      => (string) get_post_meta($id, '_wp_attachment_image_alt', true),
		];
	}

	return $out;
}

/**
 * Compact media library picker for image/file fields.
 *
 * @param array<string, mixed> $field
 * @param mixed                $value
 */
function bl_blocks_render_admin_media_field(array $field, $value, string $input_name): void
{
	$kind = (($field['type'] ?? '') === 'image') ? 'image' : 'file';
	$multiple = !empty($field['multiple']);
	$max_files = max(1, min(50, (int) ($field['max_files'] ?? 10)));
	$ids = [];
	if ($multiple) {
		$list = is_array($value) ? $value : ((is_scalar($value) && (string) $value !== '') ? [$value] : []);
		foreach ($list as $item) {
			$n = absint($item);
			if ($n > 0) {
				$ids[] = $n;
			}
		}
	} else {
		$n = absint(is_array($value) ? ($value[0] ?? 0) : $value);
		if ($n > 0) {
			$ids[] = $n;
		}
	}
	$ids = array_values(array_unique($ids));
	$summaries = bl_blocks_media_picker_summaries($ids);

	if ($kind === 'image') {
		$choose_label = $ids !== []
			? ($multiple ? __('Change images', 'baselayer-blocks') : __('Change image', 'baselayer-blocks'))
			: ($multiple ? __('Choose images', 'baselayer-blocks') : __('Choose image', 'baselayer-blocks'));
		$empty_help = $multiple
			? __('Select one or more images.', 'baselayer-blocks')
			: __('Select an image.', 'baselayer-blocks');
	} else {
		$choose_label = $ids !== []
			? ($multiple ? __('Change files', 'baselayer-blocks') : __('Change file', 'baselayer-blocks'))
			: ($multiple ? __('Choose files', 'baselayer-blocks') : __('Choose file', 'baselayer-blocks'));
		$empty_help = $multiple
			? __('Select one or more files.', 'baselayer-blocks')
			: __('Select a file.', 'baselayer-blocks');
	}

	printf(
		'<div class="bl-blocks-fields__media-picker" data-bl-blocks-media-picker data-media-kind="%s" data-multiple="%s" data-max-files="%s" data-input-name="%s">',
		esc_attr($kind),
		esc_attr($multiple ? '1' : '0'),
		esc_attr((string) $max_files),
		esc_attr($input_name)
	);
	echo '<div class="bl-blocks-fields__media-preview" data-bl-media-preview>';
	foreach ($ids as $aid) {
		$meta = $summaries[$aid] ?? [
			'url'      => '',
			'filename' => '#' . $aid,
			'mime'     => '',
			'type'     => $kind === 'image' ? 'image' : 'file',
			'alt'      => '',
		];
		$is_image = ($meta['type'] ?? '') === 'image' || $kind === 'image';
		echo '<div class="bl-blocks-fields__media-card' . ($is_image ? ' is-image' : ' is-file') . '">';
		if ($is_image && ($meta['url'] ?? '') !== '') {
			printf(
				'<img class="bl-blocks-fields__media-thumb" src="%s" alt="%s">',
				esc_url($meta['url']),
				esc_attr((string) ($meta['alt'] ?? ''))
			);
		} else {
			$parts = explode('.', (string) ($meta['filename'] ?? ''));
			$ext = count($parts) > 1 ? strtoupper((string) array_pop($parts)) : 'FILE';
			$ext = substr($ext, 0, 4);
			printf(
				'<span class="bl-blocks-fields__media-badge" aria-hidden="true">%s</span>',
				esc_html($ext !== '' ? $ext : 'FILE')
			);
		}
		printf(
			'<span class="bl-blocks-fields__media-name" title="%s">%s</span>',
			esc_attr((string) ($meta['filename'] ?? '')),
			esc_html((string) ($meta['filename'] ?? ''))
		);
		printf(
			'<button type="button" class="button-link bl-blocks-fields__card-remove" data-bl-media-remove="%s" title="%s" aria-label="%s"><span class="bl-icon -icon-close" aria-hidden="true"></span></button>',
			esc_attr((string) $aid),
			esc_attr__('Remove', 'baselayer-blocks'),
			esc_attr__('Remove', 'baselayer-blocks')
		);
		echo '</div>';
	}
	echo '</div>';
	printf(
		'<span class="description bl-blocks-fields__media-empty" data-bl-media-empty%s>%s</span>',
		$ids !== [] ? ' hidden' : '',
		esc_html($empty_help)
	);
	echo '<div class="bl-blocks-fields__media-actions">';
	printf(
		'<button type="button" class="button bl-button" data-bl-media-choose>%s</button>',
		esc_html($choose_label)
	);
	printf(
		'<button type="button" class="button-link" data-bl-media-clear%s>%s</button>',
		$ids === [] ? ' hidden' : '',
		esc_html__('Clear', 'baselayer-blocks')
	);
	echo '</div>';
	echo '<div data-bl-media-inputs>';
	if ($ids === []) {
		if ($multiple) {
			printf('<input type="hidden" name="%s[]" value="">', esc_attr($input_name));
		} else {
			printf('<input type="hidden" name="%s" value="">', esc_attr($input_name));
		}
	} else {
		foreach ($ids as $aid) {
			$name = $multiple ? $input_name . '[]' : $input_name;
			$meta = $summaries[$aid] ?? [
				'url'      => '',
				'filename' => '',
				'mime'     => '',
				'type'     => '',
				'alt'      => '',
			];
			printf(
				'<input type="hidden" name="%s" value="%s" data-url="%s" data-filename="%s" data-mime="%s" data-type="%s" data-alt="%s">',
				esc_attr($name),
				esc_attr((string) $aid),
				esc_attr((string) ($meta['url'] ?? '')),
				esc_attr((string) ($meta['filename'] ?? '')),
				esc_attr((string) ($meta['mime'] ?? '')),
				esc_attr((string) ($meta['type'] ?? '')),
				esc_attr((string) ($meta['alt'] ?? ''))
			);
		}
	}
	echo '</div>';
	echo '</div>';
}

/**
 * Render a link field control for PHP admin (Website settings).
 *
 * @param array<string, mixed> $field
 * @param mixed                $value
 */
function bl_blocks_render_admin_link_field(array $field, $value, string $input_name): void
{
	$allowed = ['page', 'url', 'email', 'phone'];
	$link_types = [];
	if (isset($field['link_types']) && is_array($field['link_types'])) {
		foreach ($field['link_types'] as $lt) {
			$key = sanitize_key((string) $lt);
			if (in_array($key, $allowed, true) && !in_array($key, $link_types, true)) {
				$link_types[] = $key;
			}
		}
	}
	if ($link_types === []) {
		$link_types = $allowed;
	}
	$allow_target = !array_key_exists('allow_target', $field) || !empty($field['allow_target']);
	$clean = function_exists('bl_blocks_sanitize_link_value')
		? bl_blocks_sanitize_link_value($field, $value)
		: [
			'type'  => $link_types[0],
			'url'   => '',
			'title' => '',
		];

	printf(
		'<div class="bl-blocks-fields__link" data-bl-blocks-link-field data-input-name="%s" data-link-types="%s" data-allow-target="%s">',
		esc_attr($input_name),
		esc_attr(implode(',', $link_types)),
		esc_attr($allow_target ? '1' : '0')
	);
	echo '<div data-bl-link-ui></div>';
	echo '<div data-bl-link-inputs>';
	foreach (['type', 'url', 'title', 'page_id'] as $key) {
		$val = $clean[$key] ?? '';
		printf(
			'<input type="hidden" name="%s[%s]" value="%s" data-bl-link-key="%s">',
			esc_attr($input_name),
			esc_attr($key),
			esc_attr((string) $val),
			esc_attr($key)
		);
	}
	if (!empty($clean['target']) && $clean['target'] === '_blank') {
		printf(
			'<input type="hidden" name="%s[target]" value="_blank" data-bl-link-key="target">',
			esc_attr($input_name)
		);
	}
	echo '</div>';
	echo '</div>';
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
		$button = __('Add entry', 'baselayer-blocks');
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
 * Shared admin field UI assets (modal + site page).
 */
function bl_blocks_enqueue_field_ui_assets(): void
{
	static $done = false;
	if ($done) {
		return;
	}
	$done = true;

	wp_enqueue_media();
	bl_blocks_enqueue_style('bl-blocks-admin', 'blocks-admin');
	bl_blocks_enqueue_script('bl-blocks-admin', 'blocks-admin', [], true);
	if (function_exists('bl_enqueue_theme_icons_style')) {
		if (function_exists('bl_load_icons_textdomain')) {
			bl_load_icons_textdomain();
		}
		bl_enqueue_theme_icons_style(['bl-blocks-admin']);
	}

	wp_localize_script('bl-blocks-admin', 'blBlocksFieldUi', [
		'pagesRestUrl' => esc_url_raw(rest_url('wp/v2/pages')),
		'restNonce'    => wp_create_nonce('wp_rest'),
		'i18n'         => [
			'edit'                   => __('Edit', 'baselayer-blocks'),
			'save'                   => __('Save', 'baselayer-blocks'),
			'cancel'                 => __('Cancel', 'baselayer-blocks'),
			'close'                  => __('Close', 'baselayer-blocks'),
			'addRow'                => __('Add entry', 'baselayer-blocks'),
			'chooseEntriesHelp'      => __('Add one or more entries.', 'baselayer-blocks'),
			'removeRow'              => __('Remove row', 'baselayer-blocks'),
			'rowLabel'               => __('Row %d', 'baselayer-blocks'),
			'repeater'               => __('Repeater', 'baselayer-blocks'),
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
			'pagePickerSearch'       => __('Search pages…', 'baselayer-blocks'),
			'pagePickerEmpty'        => __('No pages found.', 'baselayer-blocks'),
			'pagePickerLoading'      => __('Loading…', 'baselayer-blocks'),
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
		] + bl_blocks_media_field_i18n(),
	]);
}
