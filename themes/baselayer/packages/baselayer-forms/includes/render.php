<?php

defined('ABSPATH') || exit;

/**
 * Render a published form by ID.
 */
function bl_forms_render(int $form_id, array $args = []): string
{
	$form_id = (int) $form_id;
	if ($form_id <= 0 || get_post_type($form_id) !== BL_FORM_POST_TYPE || get_post_status($form_id) !== 'publish') {
		return '';
	}

	$config = bl_forms_get_config($form_id);
	$settings = $config['settings'];
	$submit_label = bl_forms_resolve_message($settings, 'submit_label');
	$success = bl_forms_resolve_message($settings, 'success_message');
	$error = bl_forms_resolve_message($settings, 'error_message');
	$validation = bl_forms_resolve_message($settings, 'validation_message');
	$after_submit = sanitize_key((string) ($settings['after_submit'] ?? 'message'));
	if (!in_array($after_submit, ['message', 'redirect'], true)) {
		$after_submit = 'message';
	}
	$redirect_url = bl_forms_after_submit_redirect_url($settings);

	$has_uploads = false;
	foreach (bl_forms_iter_fields($config['fields']) as $field) {
		if (!bl_forms_field_is_active($field)) {
			continue;
		}
		if (in_array((string) ($field['type'] ?? ''), ['file', 'image'], true)) {
			$has_uploads = true;
			break;
		}
	}

	$uid = 'bl-form-' . $form_id . '-' . wp_unique_id();
	$nonce = wp_create_nonce('bl_forms_submit_' . $form_id);
	$hp_name = sanitize_key((string) ($settings['honeypot_name'] ?? ''));
	if ($hp_name === '') {
		$hp_name = 'bl_forms_hp';
	}
	$loaded_at = time();
	$loaded_sig = bl_forms_fill_time_signature($form_id, $loaded_at);
	$js_token = bl_forms_js_check_token($form_id, $loaded_at);
	$wrapper_attributes = isset($args['wrapper_attributes']) && is_string($args['wrapper_attributes']) && $args['wrapper_attributes'] !== ''
		? $args['wrapper_attributes']
		: 'class="' . esc_attr('bl-form bl-form--' . $form_id) . '"';
	$wrapper_attributes = bl_forms_ensure_form_wrapper_attributes($form_id, $wrapper_attributes);

	ob_start();
	?>
	<div
		<?= $wrapper_attributes // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- from get_block_wrapper_attributes() or static class. ?>
		data-bl-form
		data-bl-form-id="<?= esc_attr((string) $form_id) ?>"
		data-bl-form-ajax="<?= esc_url(admin_url('admin-ajax.php')) ?>"
		data-bl-form-success="<?= esc_attr($success) ?>"
		data-bl-form-error="<?= esc_attr($error) ?>"
		data-bl-form-validation="<?= esc_attr($validation) ?>"
		data-bl-form-after="<?= esc_attr($after_submit) ?>"
		<?php if ($redirect_url !== '') : ?>
		data-bl-form-redirect="<?= esc_url($redirect_url) ?>"
		<?php endif; ?>
		data-bl-form-js="<?= esc_attr($js_token) ?>"
	>
		<form class="bl-form__form" method="post" action="" novalidate data-bl-form-el id="<?= esc_attr($uid) ?>"<?= $has_uploads ? ' enctype="multipart/form-data"' : '' ?>>
			<input type="hidden" name="action" value="bl_forms_submit">
			<input type="hidden" name="form_id" value="<?= esc_attr((string) $form_id) ?>">
			<input type="hidden" name="nonce" value="<?= esc_attr($nonce) ?>">
			<input type="hidden" name="bl_forms_loaded" value="<?= esc_attr((string) $loaded_at) ?>">
			<input type="hidden" name="bl_forms_loaded_sig" value="<?= esc_attr($loaded_sig) ?>">
			<input type="hidden" name="bl_forms_js" value="" data-bl-form-js-field autocomplete="off">
			<div class="bl-form__honeypot" aria-hidden="true">
				<label for="<?= esc_attr($uid) ?>-hp"><?= esc_html__('Leave blank', 'baselayer-forms') ?></label>
				<input type="text" name="<?= esc_attr($hp_name) ?>" id="<?= esc_attr($uid) ?>-hp" value="" tabindex="-1" autocomplete="off">
			</div>
			<div class="bl-form__fields">
				<?= bl_forms_render_fields($config['fields'], $uid, $settings) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
			<div class="bl-form__actions">
				<div class="bl-form__message" data-bl-form-message hidden role="status" aria-live="polite"></div>
				<div class="bl-form__progress" data-bl-form-progress hidden aria-live="polite">
					<p class="bl-form__progress-status" data-bl-form-progress-status></p>
					<p class="bl-form__progress-detail" data-bl-form-progress-detail hidden></p>
					<div class="bl-form__progress-track" aria-hidden="true">
						<div class="bl-form__progress-bar" data-bl-form-progress-bar></div>
					</div>
				</div>
				<button type="submit" class="button" data-bl-form-submit>
					<span class="bl-form__submit-label"><?= esc_html($submit_label) ?></span>
					<span class="bl-form__spinner" data-bl-form-spinner hidden aria-hidden="true"></span>
				</button>
			</div>
		</form>
	</div>
	<?php

	bl_forms_enqueue_front_assets();

	return (string) ob_get_clean();
}

/**
 * Ensure the form wrapper always has bl-form and a unique bl-form--{id} class.
 */
function bl_forms_ensure_form_wrapper_attributes(int $form_id, string $attrs): string
{
	$form_id = absint($form_id);
	$required = ['bl-form', 'bl-form--' . $form_id];
	if (preg_match('/\bclass=(["\'])(.*?)\1/', $attrs, $matches)) {
		$quote = $matches[1];
		$classes = preg_split('/\s+/', trim($matches[2])) ?: [];
		$classes = array_values(array_filter($classes, static fn($class) => $class !== ''));
		foreach ($required as $class) {
			if (!in_array($class, $classes, true)) {
				$classes[] = $class;
			}
		}
		$replacement = 'class=' . $quote . esc_attr(implode(' ', $classes)) . $quote;

		return (string) preg_replace('/\bclass=(["\'])(.*?)\1/', $replacement, $attrs, 1);
	}

	return trim($attrs . ' class="' . esc_attr(implode(' ', $required)) . '"');
}

/**
 * Enqueue front CSS/JS once per request.
 */
function bl_forms_enqueue_front_assets(): void
{
	static $done = false;
	if ($done) {
		return;
	}
	$done = true;

	bl_forms_enqueue_style('bl-forms', 'forms');
	bl_forms_enqueue_script('bl-forms', 'forms', [], true);
	if (wp_script_is('bl-forms', 'enqueued') || wp_script_is('bl-forms', 'registered')) {
		wp_localize_script('bl-forms', 'blForms', [
			'fileTypes' => bl_forms_file_type_styles(),
			'i18n'      => [
				'uploadingImage'  => __('Uploading image %1$s/%2$s', 'baselayer-forms'),
				'uploadingFile'   => __('Uploading file %1$s/%2$s', 'baselayer-forms'),
				'uploadingFiles'  => __('Uploading %1$s/%2$s', 'baselayer-forms'),
				'sendingMessage'  => __('Sending message…', 'baselayer-forms'),
				'progressOf'      => __('%1$s of %2$s', 'baselayer-forms'),
				'filesSelected'   => __('%s files selected', 'baselayer-forms'),
			],
		]);
	}
}

/**
 * Open tag attributes for width + field classes.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_wrap_attrs(array $field, string $extra_class = '', string $name = ''): string
{
	$classes = trim('bl-form__field-wrap ' . $extra_class);
	if (bl_forms_field_hide_label($field)) {
		$classes .= ' bl-form__field-wrap--hide-label';
	}
	$css_class = trim((string) ($field['css_class'] ?? ''));
	if ($css_class !== '') {
		$classes .= ' ' . $css_class;
	}
	$attrs = 'class="' . esc_attr($classes) . '"';
	if ($name !== '') {
		$attrs .= ' data-bl-form-field="' . esc_attr($name) . '"';
	}
	$attrs .= ' style="' . esc_attr(bl_forms_field_width_style($field)) . '"';

	return $attrs;
}

/**
 * Control attributes: required, readonly, disabled, autocomplete.
 *
 * Disabled fields omit required (invalid HTML combination).
 * Autocomplete is only emitted when explicitly set to off.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_control_attrs(array $field, bool $allow_readonly = true): string
{
	$disabled = !empty($field['disabled']);
	$attrs = '';
	if (!$disabled && !empty($field['required'])) {
		$attrs .= ' required';
	}
	if ($allow_readonly && !$disabled && !empty($field['readonly'])) {
		$attrs .= ' readonly';
	}
	if ($disabled) {
		$attrs .= ' disabled';
	}
	if (($field['autocomplete'] ?? 'auto') === 'off') {
		$attrs .= ' autocomplete="off"';
	}

	return $attrs;
}

/**
 * Options layout for radio / checkboxes.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_options_layout(array $field): string
{
	return (($field['layout'] ?? 'vertical') === 'horizontal') ? 'horizontal' : 'vertical';
}

/**
 * Parsed default value list (comma-separated for multi fields).
 *
 * @param array<string, mixed> $field
 * @return list<string>
 */
function bl_forms_field_default_values(array $field): array
{
	$raw = trim((string) ($field['default_value'] ?? ''));
	if ($raw === '') {
		return [];
	}

	$parts = array_map('trim', explode(',', $raw));
	$parts = array_values(array_filter($parts, static fn($part) => $part !== ''));

	return $parts;
}

/**
 * Whether an option value is among the field defaults.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_default_is(array $field, string $option_value): bool
{
	return in_array($option_value, bl_forms_field_default_values($field), true);
}

/**
 * Whether a checkbox/toggle/terms field should render checked by default.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_default_checked(array $field): bool
{
	$raw = $field['default_value'] ?? '';
	if (is_bool($raw)) {
		return $raw;
	}

	$raw = trim((string) $raw);

	return $raw === '1' || strtolower($raw) === 'true' || strtolower($raw) === 'yes';
}

/**
 * Whether the visible field label should be omitted.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_hide_label(array $field): bool
{
	return !empty($field['hide_label']);
}

/**
 * Visible label / legend markup (empty when hide_label is set).
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_label_html(array $field, string $input_id, string $req_mark, string $tag = 'label'): string
{
	if (bl_forms_field_hide_label($field)) {
		return '';
	}

	$label = (string) ($field['label'] ?? '');
	if ($tag === 'legend') {
		return '<legend class="bl-form__label">' . esc_html($label) . $req_mark . '</legend>';
	}
	if ($tag === 'div') {
		if (trim($label) === '') {
			return '';
		}

		return '<div class="bl-form__label" id="' . esc_attr($input_id) . '-label">' . esc_html($label) . $req_mark . '</div>';
	}

	return '<label class="bl-form__label" for="' . esc_attr($input_id) . '">' . esc_html($label) . $req_mark . '</label>';
}

/**
 * aria-label when the visible label is hidden.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_aria_label_attr(array $field): string
{
	if (!bl_forms_field_hide_label($field)) {
		return '';
	}

	$label = trim((string) ($field['label'] ?? ''));
	if ($label === '') {
		return '';
	}

	return ' aria-label="' . esc_attr($label) . '"';
}

/**
 * Optional field description markup.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_description_html(array $field, string $input_id): string
{
	$description = trim((string) ($field['description'] ?? ''));
	if ($description === '') {
		return '';
	}

	return '<p class="bl-form__description" id="' . esc_attr($input_id) . '-desc">' . esc_html($description) . '</p>';
}

/**
 * aria-describedby when description and/or character counter are present.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_describedby_attr(array $field, string $input_id): string
{
	$ids = [];
	if (trim((string) ($field['description'] ?? '')) !== '') {
		$ids[] = $input_id . '-desc';
	}
	if (bl_forms_field_shows_char_count($field)) {
		$ids[] = $input_id . '-count';
	}
	if ($ids === []) {
		return '';
	}

	return ' aria-describedby="' . esc_attr(implode(' ', $ids)) . '"';
}

/**
 * maxlength HTML attribute when configured.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_maxlength_attr(array $field): string
{
	$max_length = bl_forms_field_max_length($field);
	if ($max_length < 1) {
		return '';
	}

	return ' maxlength="' . esc_attr((string) $max_length) . '"';
}

/**
 * Textarea rows (2–50, default 5).
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_rows(array $field): int
{
	$rows = absint($field['rows'] ?? 5);
	if ($rows < 2) {
		$rows = 2;
	}
	if ($rows > 50) {
		$rows = 50;
	}

	return $rows;
}

/**
 * Live character counter markup (empty when disabled).
 *
 * @param array<string, mixed> $field
 * @param array<string, mixed> $settings
 */
function bl_forms_field_char_count_html(array $field, string $input_id, array $settings = []): string
{
	if (!bl_forms_field_shows_char_count($field)) {
		return '';
	}

	$max = bl_forms_field_max_length($field);
	$count = bl_forms_string_length((string) ($field['default_value'] ?? ''));
	$remaining = max(0, $max - $count);
	$template = bl_forms_resolve_char_count_text($settings);
	$empty = bl_forms_resolve_char_count_empty_text($settings);
	$text = bl_forms_format_char_count_text($template, $remaining, $max, $count, $settings);

	return '<p class="bl-form__char-count" id="' . esc_attr($input_id) . '-count"'
		. ' data-bl-form-char-count'
		. ' data-bl-form-char-count-max="' . esc_attr((string) $max) . '"'
		. ' data-bl-form-char-count-template="' . esc_attr($template) . '"'
		. ' data-bl-form-char-count-empty="' . esc_attr($empty) . '"'
		. '>' . esc_html($text) . '</p>';
}

/**
 * Group fields into flex rows the way percentage widths pack on desktop.
 *
 * @param list<array<string, mixed>> $fields
 * @return list<list<array<string, mixed>>>
 */
function bl_forms_chunk_fields_into_rows(array $fields): array
{
	$rows = [];
	$current = [];
	$sum = 0.0;

	foreach ($fields as $field) {
		if (!is_array($field)) {
			continue;
		}

		$factor = bl_forms_field_pack_factor($field);
		$pack = $factor ?? 1.0;

		// Full-width / unknown units start a fresh row alone.
		if ($factor === null || $pack >= 0.999) {
			if ($current !== []) {
				$rows[] = $current;
				$current = [];
				$sum = 0.0;
			}
			$rows[] = [$field];
			continue;
		}

		if ($sum > 0.0 && ($sum + $pack) > 1.001) {
			$rows[] = $current;
			$current = [];
			$sum = 0.0;
		}

		$current[] = $field;
		$sum += $pack;
	}

	if ($current !== []) {
		$rows[] = $current;
	}

	return $rows;
}

/**
 * Whether a packed row should pair to ~50% columns at breakpoint-m.
 *
 * Rule: 2+ fields and every field is ≤50% (e.g. 25×4, 33×3, 50×2),
 * but not mixed rows like 75|25.
 *
 * @param list<array<string, mixed>> $row
 */
function bl_forms_row_should_pair_at_m(array $row): bool
{
	if (count($row) < 2) {
		return false;
	}

	$max = 0.0;
	foreach ($row as $field) {
		$factor = bl_forms_field_pack_factor($field);
		if ($factor === null) {
			return false;
		}
		$max = max($max, $factor);
	}

	return $max <= 0.5001;
}

/**
 * Render a list of fields wrapped in responsive rows.
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, mixed>       $settings
 */
function bl_forms_render_field_rows(array $fields, string $uid, array $settings = []): string
{
	$html = '';
	foreach (bl_forms_chunk_fields_into_rows($fields) as $row) {
		$inner = '';
		foreach ($row as $field) {
			$inner .= bl_forms_render_field($field, $uid, $settings);
		}
		if ($inner === '') {
			continue;
		}
		$classes = 'bl-form__row';
		if (bl_forms_row_should_pair_at_m($row)) {
			$classes .= ' bl-form__row--pair-m';
		}
		$html .= '<div class="' . esc_attr($classes) . '">' . $inner . '</div>';
	}

	return $html;
}

/**
 * Render root fields, wrapping consecutive columns in a group and other fields in rows.
 *
 * @param list<array<string, mixed>> $fields
 * @param array<string, mixed>       $settings
 */
function bl_forms_render_fields(array $fields, string $uid, array $settings = []): string
{
	$html = '';
	$buffer = [];
	$count = count($fields);
	$i = 0;

	$flush = static function () use (&$html, &$buffer, $uid, $settings): void {
		if ($buffer === []) {
			return;
		}
		$html .= bl_forms_render_field_rows($buffer, $uid, $settings);
		$buffer = [];
	};

	while ($i < $count) {
		$field = $fields[$i];
		if (!is_array($field)) {
			$i++;
			continue;
		}

		if (($field['type'] ?? '') === 'column') {
			$flush();
			$run = [];
			while ($i < $count && is_array($fields[$i]) && ($fields[$i]['type'] ?? '') === 'column') {
				$run[] = $fields[$i];
				$i++;
			}
			$inner = '';
			foreach ($run as $column) {
				$inner .= bl_forms_render_field($column, $uid, $settings);
			}
			if ($inner !== '') {
				$cols = count($run);
				$classes = 'bl-form__group';
				if ($cols >= 4) {
					$classes .= ' bl-form__group--wrap-m';
				}
				$html .= '<div class="' . esc_attr($classes) . '" data-bl-form-cols="' . esc_attr((string) $cols) . '">' . $inner . '</div>';
			}
			continue;
		}

		$buffer[] = $field;
		$i++;
	}

	$flush();

	return $html;
}

/**
 * Render one field.
 *
 * @param array<string, mixed> $field
 * @param array<string, mixed> $settings
 */
function bl_forms_render_field(array $field, string $uid, array $settings = []): string
{
	if (!bl_forms_field_is_active($field)) {
		return '';
	}

	$type = (string) ($field['type'] ?? 'text');
	$id = (string) ($field['id'] ?? '');
	$input_id = $uid . '-' . $id;

	if ($type === 'column') {
		$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
		$inner = bl_forms_render_field_rows($children, $uid, $settings);
		$is_auto = (($field['width'] ?? '') === 'auto');
		$classes = 'bl-form__column' . ($is_auto ? ' bl-form__column--auto' : '');
		$extra = bl_forms_sanitize_css_class((string) ($field['css_class'] ?? ''));
		if ($extra !== '') {
			$classes .= ' ' . $extra;
		}
		$style = $is_auto ? '' : bl_forms_field_width_style($field);
		$attrs = 'class="' . esc_attr($classes) . '"';
		if ($style !== '') {
			$attrs .= ' style="' . esc_attr($style) . '"';
		}

		return '<div ' . $attrs . '>' . $inner . '</div>';
	}

	if ($type === 'section') {
		$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
		$inner = bl_forms_render_field_rows($children, $uid, $settings);
		$label = trim((string) ($field['label'] ?? ''));
		$design = sanitize_key((string) ($field['design'] ?? 'standard'));
		if (!in_array($design, ['standard', 'outline', 'card'], true)) {
			$design = 'standard';
		}
		$is_auto = (($field['width'] ?? '') === 'auto');
		$classes = 'bl-form__section bl-form__section--' . $design;
		if ($is_auto) {
			$classes .= ' bl-form__section--auto';
		}
		$extra = bl_forms_sanitize_css_class((string) ($field['css_class'] ?? ''));
		if ($extra !== '') {
			$classes .= ' ' . $extra;
		}
		$style = $is_auto ? '' : bl_forms_field_width_style($field);
		$attrs = 'class="' . esc_attr($classes) . '"';
		if ($style !== '') {
			$attrs .= ' style="' . esc_attr($style) . '"';
		}
		$html = '<section ' . $attrs . '>';
		if ($label !== '') {
			$html .= '<h3 class="bl-form__section-title">' . esc_html($label) . '</h3>';
		}
		$html .= '<div class="bl-form__section-body">' . $inner . '</div></section>';

		return $html;
	}

	if ($type === 'divider') {
		$margin = sanitize_key((string) ($field['margin'] ?? 'm'));
		$presets = ['xs', 's', 'm', 'l', 'xl'];
		$classes = 'bl-form__divider-wrap';
		$style = '';
		$extra = bl_forms_sanitize_css_class((string) ($field['css_class'] ?? ''));
		if ($extra !== '') {
			$classes .= ' ' . $extra;
		}

		if (in_array($margin, $presets, true)) {
			$classes .= ' bl-form__divider-wrap--' . $margin;
		} else {
			$custom = bl_forms_sanitize_css_length((string) ($field['margin_custom'] ?? ''), '24px');
			if ($custom === '24px' && $margin !== 'custom' && $margin !== '') {
				$maybe = bl_forms_sanitize_css_length((string) ($field['margin'] ?? ''), '');
				if ($maybe !== '') {
					$custom = $maybe;
				}
			}
			$classes .= ' bl-form__divider-wrap--custom';
			$style = '--bl-form-divider-margin:' . $custom;
		}

		$attrs = 'class="' . esc_attr($classes) . '"';
		if ($style !== '') {
			$attrs .= ' style="' . esc_attr($style) . '"';
		}

		return '<div ' . $attrs . '><hr class="bl-form__divider"></div>';
	}

	if ($type === 'spacer') {
		$height = sanitize_key((string) ($field['height'] ?? 'm'));
		$presets = ['xs', 's', 'm', 'l', 'xl'];
		$classes = 'bl-form__spacer-wrap';
		$style = '';
		$extra = bl_forms_sanitize_css_class((string) ($field['css_class'] ?? ''));
		if ($extra !== '') {
			$classes .= ' ' . $extra;
		}

		if (in_array($height, $presets, true)) {
			$classes .= ' bl-form__spacer-wrap--' . $height;
		} else {
			$custom = bl_forms_sanitize_css_length((string) ($field['height_custom'] ?? ''), '24px');
			// Legacy: height stored as a CSS length.
			if ($custom === '24px' && $height !== 'custom' && $height !== '') {
				$maybe = bl_forms_sanitize_css_length((string) ($field['height'] ?? ''), '');
				if ($maybe !== '') {
					$custom = $maybe;
				}
			}
			$classes .= ' bl-form__spacer-wrap--custom';
			$style = '--bl-form-spacer-height:' . $custom;
		}

		$attrs = 'class="' . esc_attr($classes) . '"';
		if ($style !== '') {
			$attrs .= ' style="' . esc_attr($style) . '"';
		}

		return '<div ' . $attrs . ' aria-hidden="true"></div>';
	}

	if ($type === 'captcha') {
		$provider = sanitize_key((string) ($field['captcha_provider'] ?? 'turnstile'));
		if (!in_array($provider, bl_forms_captcha_providers(), true)) {
			$provider = 'turnstile';
		}
		$site_key = trim((string) ($field['captcha_site_key'] ?? ''));

		if ($site_key === '') {
			return '<div ' . bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--captcha') . '>'
				. '<div class="bl-form__captcha-placeholder" role="note">'
				. esc_html__('CAPTCHA is not configured yet.', 'baselayer-forms')
				. '</div></div>';
		}

		bl_forms_enqueue_captcha_script($provider);

		ob_start();
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--captcha') // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?php if ($provider === 'turnstile') : ?>
				<div class="cf-turnstile" data-sitekey="<?= esc_attr($site_key) ?>"></div>
			<?php elseif ($provider === 'hcaptcha') : ?>
				<div class="h-captcha" data-sitekey="<?= esc_attr($site_key) ?>"></div>
			<?php elseif ($provider === 'friendly') : ?>
				<div class="frc-captcha" data-sitekey="<?= esc_attr($site_key) ?>"></div>
			<?php else : ?>
				<div class="g-recaptcha" data-sitekey="<?= esc_attr($site_key) ?>"></div>
			<?php endif; ?>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'heading') {
		$content = (string) ($field['content'] ?? '');
		if ($content === '') {
			return '';
		}
		$level = sanitize_key((string) ($field['level'] ?? 'h2'));
		if (!in_array($level, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], true)) {
			$level = 'h2';
		}

		return '<div ' . bl_forms_field_wrap_attrs($field, 'bl-form__heading') . '><' . $level . ' class="bl-form__title">' . esc_html($content) . '</' . $level . '></div>';
	}

	if ($type === 'text_block') {
		$content = (string) ($field['content'] ?? '');
		if ($content === '') {
			return '';
		}

		return '<div ' . bl_forms_field_wrap_attrs($field, 'bl-form__text') . '>' . nl2br(esc_html($content)) . '</div>';
	}

	if ($type === 'html') {
		$content = (string) ($field['content'] ?? '');
		if (trim($content) === '') {
			return '';
		}

		return '<div ' . bl_forms_field_wrap_attrs($field, 'bl-form__html') . '>' . wp_kses_post($content) . '</div>';
	}

	$name = (string) ($field['name'] ?? $id);
	$label = (string) ($field['label'] ?? '');
	$required = !empty($field['required']) && empty($field['disabled']);
	$placeholder = (string) ($field['placeholder'] ?? '');
	$multiple = !empty($field['multiple']);
	$default_value = (string) ($field['default_value'] ?? '');
	if (in_array($type, ['date', 'time', 'datetime'], true)) {
		$placeholder = '';
		$default_value = bl_forms_resolve_temporal_bound($field, 'default');
	}
	$control_attrs = bl_forms_field_control_attrs($field);
	$choice_attrs = bl_forms_field_control_attrs($field, false);
	$disabled_attr = !empty($field['disabled']) ? ' disabled' : '';
	$req_mark = $required ? ' <span class="bl-form__required" aria-hidden="true">*</span>' : '';
	$field_name = 'fields[' . $name . ']';
	$options = isset($field['options']) && is_array($field['options']) ? $field['options'] : [];

	ob_start();

	if ($type === 'textarea') {
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--textarea', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?= bl_forms_field_label_html($field, $input_id, $req_mark) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<textarea class="bl-form__control" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" rows="<?= esc_attr((string) bl_forms_field_rows($field)) ?>" placeholder="<?= esc_attr($placeholder) ?>"<?= $control_attrs ?><?= bl_forms_field_maxlength_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>><?= esc_textarea($default_value) ?></textarea>
			<?= bl_forms_field_char_count_html($field, $input_id, $settings) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'select') {
		$select_name = $multiple ? $field_name . '[]' : $field_name;
		// <select> has no readonly attribute — lock non-selected options instead.
		$readonly = empty($field['disabled']) && !empty($field['readonly']);
		$readonly_attr = $readonly ? ' aria-readonly="true"' : '';
		$has_defaults = bl_forms_field_default_values($field) !== [];
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--select', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?= bl_forms_field_label_html($field, $input_id, $req_mark) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<select class="bl-form__control" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($select_name) ?>"<?= $multiple ? ' multiple' : '' ?><?= $choice_attrs ?><?= $readonly_attr ?><?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
				<?php if (!$multiple) : ?>
					<option value=""<?= ($readonly && $has_defaults) ? ' disabled' : '' ?>><?= esc_html($placeholder !== '' ? $placeholder : __('Please select…', 'baselayer-forms')) ?></option>
				<?php endif; ?>
				<?php foreach ($options as $opt) :
					$opt_value = (string) ($opt['value'] ?? '');
					$is_selected = bl_forms_field_default_is($field, $opt_value);
					$selected = $is_selected ? ' selected' : '';
					$opt_disabled = ($readonly && !$is_selected) ? ' disabled' : '';
					?>
					<option value="<?= esc_attr($opt_value) ?>"<?= $selected ?><?= $opt_disabled ?>><?= esc_html((string) ($opt['label'] ?? '')) ?></option>
				<?php endforeach; ?>
			</select>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'radio') {
		$options_class = 'bl-form__options bl-form__options--' . bl_forms_field_options_layout($field);
		?>
		<fieldset <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--radio', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?= bl_forms_field_label_html($field, $input_id, $req_mark, 'legend') // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<div class="<?= esc_attr($options_class) ?>">
				<?php foreach ($options as $i => $opt) :
					$oid = $input_id . '-' . $i;
					$opt_value = (string) ($opt['value'] ?? '');
					$checked = bl_forms_field_default_is($field, $opt_value) ? ' checked' : '';
					?>
					<label class="bl-form__option" for="<?= esc_attr($oid) ?>">
						<input type="radio" id="<?= esc_attr($oid) ?>" name="<?= esc_attr($field_name) ?>" value="<?= esc_attr($opt_value) ?>"<?= $choice_attrs ?><?= $checked ?>>
						<span><?= esc_html((string) ($opt['label'] ?? '')) ?></span>
					</label>
				<?php endforeach; ?>
			</div>
		</fieldset>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'checkboxes') {
		$options_class = 'bl-form__options bl-form__options--' . bl_forms_field_options_layout($field);
		?>
		<fieldset <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--checkboxes', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?= bl_forms_field_label_html($field, $input_id, $req_mark, 'legend') // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<div class="<?= esc_attr($options_class) ?>">
				<?php foreach ($options as $i => $opt) :
					$oid = $input_id . '-' . $i;
					$opt_value = (string) ($opt['value'] ?? '');
					$checked = bl_forms_field_default_is($field, $opt_value) ? ' checked' : '';
					?>
					<label class="bl-form__option" for="<?= esc_attr($oid) ?>">
						<input type="checkbox" id="<?= esc_attr($oid) ?>" name="<?= esc_attr($field_name) ?>[]" value="<?= esc_attr($opt_value) ?>"<?= $checked ?><?= $disabled_attr ?>>
						<span><?= esc_html((string) ($opt['label'] ?? '')) ?></span>
					</label>
				<?php endforeach; ?>
			</div>
		</fieldset>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'button_group') {
		$input_type = $multiple ? 'checkbox' : 'radio';
		$input_name = $multiple ? $field_name . '[]' : $field_name;
		?>
		<fieldset <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--button-group', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?= bl_forms_field_label_html($field, $input_id, $req_mark, 'legend') // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<div class="bl-form__button-group" role="group">
				<?php foreach ($options as $i => $opt) :
					$oid = $input_id . '-' . $i;
					$opt_value = (string) ($opt['value'] ?? '');
					$checked = bl_forms_field_default_is($field, $opt_value) ? ' checked' : '';
					?>
					<label class="bl-form__btn-option" for="<?= esc_attr($oid) ?>">
						<input type="<?= esc_attr($input_type) ?>" id="<?= esc_attr($oid) ?>" name="<?= esc_attr($input_name) ?>" value="<?= esc_attr($opt_value) ?>"<?= !$multiple ? $choice_attrs : $disabled_attr ?><?= $checked ?>>
						<span><?= esc_html((string) ($opt['label'] ?? '')) ?></span>
					</label>
				<?php endforeach; ?>
			</div>
		</fieldset>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'terms') {
		$checkbox_text = trim((string) ($field['content'] ?? ''));
		if ($checkbox_text === '') {
			$checkbox_text = __('I agree to the [Privacy Policy](page:privacy).', 'baselayer-forms');
		}
		$show_terms_label = $label !== '' && !bl_forms_field_hide_label($field);
		$checked = bl_forms_field_default_checked($field) ? ' checked' : '';
		$terms_name_attr = $show_terms_label
			? ' aria-labelledby="' . esc_attr($input_id) . '-label"'
			: bl_forms_field_aria_label_attr($field);
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--terms', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?php if ($show_terms_label) : ?>
				<div class="bl-form__label" id="<?= esc_attr($input_id) ?>-label"><?= esc_html($label) ?><?= $req_mark // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
			<?php endif; ?>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<label class="bl-form__option bl-form__option--terms" for="<?= esc_attr($input_id) ?>">
				<input type="checkbox" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" value="1"<?= $choice_attrs ?><?= $checked ?><?= $terms_name_attr // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
				<span><?= bl_forms_format_inline_links($checkbox_text) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped/kses in helper. ?><?= !$show_terms_label ? $req_mark : '' // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
			</label>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'hidden') {
		$default = (string) ($field['default_value'] ?? '');
		?>
		<input type="hidden" name="<?= esc_attr($field_name) ?>" id="<?= esc_attr($input_id) ?>" value="<?= esc_attr($default) ?>" data-bl-form-field="<?= esc_attr($name) ?>">
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'honeypot') {
		?>
		<div class="bl-form__honeypot" aria-hidden="true">
			<label for="<?= esc_attr($input_id) ?>"><?= esc_html($label !== '' ? $label : __('Leave blank', 'baselayer-forms')) ?></label>
			<input type="text" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" value="" tabindex="-1" autocomplete="off">
		</div>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'toggle') {
		$hide_toggle_label = bl_forms_field_hide_label($field);
		$checked = bl_forms_field_default_checked($field) ? ' checked' : '';
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--toggle', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<label class="bl-form__switch" for="<?= esc_attr($input_id) ?>">
				<input type="checkbox" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" value="1"<?= $choice_attrs ?><?= $checked ?><?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
				<span class="bl-form__switch-ui" aria-hidden="true"></span>
				<?php if (!$hide_toggle_label) : ?>
					<span class="bl-form__switch-label"><?= esc_html($label) ?><?= $req_mark // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				<?php endif; ?>
			</label>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'file' || $type === 'image') {
		$file_name = $multiple ? $field_name . '[]' : $field_name;
		$extensions = bl_forms_field_extensions($field);
		$accept = bl_forms_accept_from_extensions($extensions);
		if ($accept === '' && $type === 'image') {
			$accept = 'image/*';
		}
		$upload_style = sanitize_key((string) ($field['upload_style'] ?? 'modern'));
		if ($upload_style !== 'classic') {
			$upload_style = 'modern';
		}
		$preview = $upload_style === 'modern'
			&& (!array_key_exists('preview', $field) || !empty($field['preview']));
		$max_files = bl_forms_field_max_files($field);
		$fallbacks = bl_forms_message_fallbacks();
		$button_text = trim((string) ($field['button_text'] ?? ''));
		if ($button_text === '') {
			$button_text = (string) ($fallbacks['upload_button'] ?? __('Choose file', 'baselayer-forms'));
		}
		$empty_text = (string) ($fallbacks['upload_empty'] ?? __('No file chosen', 'baselayer-forms'));
		$drop_text = (string) ($fallbacks['upload_drop'] ?? __('or drag and drop here', 'baselayer-forms'));
		$remove_text = __('Remove', 'baselayer-forms');
		$ext_hint = $extensions !== []
			? strtoupper(implode(', ', $extensions))
			: '';
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--' . $type, $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?= bl_forms_field_label_html($field, $input_id, $req_mark) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?php if ($upload_style === 'classic') : ?>
				<input
					class="bl-form__control bl-form__control--file"
					type="file"
					id="<?= esc_attr($input_id) ?>"
					name="<?= esc_attr($file_name) ?>"
					<?= $accept !== '' ? 'accept="' . esc_attr($accept) . '"' : '' ?>
					<?= $multiple ? ' multiple' : '' ?>
					<?= $choice_attrs ?>
					<?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					data-bl-form-file-input
					data-bl-form-upload-max="<?= esc_attr((string) $max_files) ?>"
				>
			<?php else : ?>
				<div
					class="bl-form__upload<?= $preview ? ' bl-form__upload--preview' : '' ?>"
					data-bl-form-upload
					data-bl-form-upload-kind="<?= esc_attr($type) ?>"
					data-bl-form-upload-preview="<?= $preview ? '1' : '0' ?>"
					data-bl-form-upload-max="<?= esc_attr((string) $max_files) ?>"
					data-bl-form-upload-remove="<?= esc_attr($remove_text) ?>"
				>
					<input
						class="bl-form__upload-input"
						type="file"
						id="<?= esc_attr($input_id) ?>"
						name="<?= esc_attr($file_name) ?>"
						<?= $accept !== '' ? 'accept="' . esc_attr($accept) . '"' : '' ?>
						<?= $multiple ? ' multiple' : '' ?>
						<?= $choice_attrs ?>
						<?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						data-bl-form-file-input
						hidden
					>
					<div class="bl-form__upload-shell" data-bl-form-upload-shell tabindex="0" role="button" aria-controls="<?= esc_attr($input_id) ?>">
						<div class="bl-form__upload-actions">
							<span class="bl-form__upload-btn" aria-hidden="true"><?= esc_html($button_text) ?></span>
							<span class="bl-form__upload-meta">
								<span class="bl-form__upload-empty" data-bl-form-upload-empty><?= esc_html($empty_text) ?></span>
								<?php if ($drop_text !== '') : ?>
									<span class="bl-form__upload-drop"><?= esc_html($drop_text) ?></span>
								<?php endif; ?>
								<?php if ($ext_hint !== '') : ?>
									<span class="bl-form__upload-types"><?= esc_html($ext_hint) ?></span>
								<?php endif; ?>
							</span>
						</div>
					</div>
					<?php if ($preview) : ?>
						<div class="bl-form__upload-preview" data-bl-form-upload-preview-list hidden></div>
					<?php endif; ?>
				</div>
			<?php endif; ?>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	$input_type = 'text';
	if ($type === 'email') {
		$input_type = 'email';
	} elseif ($type === 'url') {
		$input_type = 'url';
	} elseif ($type === 'phone') {
		$input_type = 'tel';
	} elseif ($type === 'number') {
		$input_type = 'number';
	} elseif ($type === 'date') {
		$input_type = 'date';
	} elseif ($type === 'time') {
		$input_type = 'time';
	} elseif ($type === 'datetime') {
		$input_type = 'datetime-local';
	}

	$number_attrs = '';
	if ($type === 'number') {
		$min = isset($field['min']) ? bl_forms_sanitize_optional_number((string) $field['min']) : '';
		$max = isset($field['max']) ? bl_forms_sanitize_optional_number((string) $field['max']) : '';
		if ($min !== '') {
			$number_attrs .= ' min="' . esc_attr($min) . '"';
		}
		if ($max !== '') {
			$number_attrs .= ' max="' . esc_attr($max) . '"';
		}
		$number_attrs .= ' step="any"';
	} elseif (in_array($type, ['date', 'time', 'datetime'], true)) {
		$min = bl_forms_resolve_temporal_bound($field, 'min');
		$max = bl_forms_resolve_temporal_bound($field, 'max');
		if ($min !== '') {
			$number_attrs .= ' min="' . esc_attr($min) . '"';
		}
		if ($max !== '') {
			$number_attrs .= ' max="' . esc_attr($max) . '"';
		}
	}
	?>
	<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--' . sanitize_html_class($type), $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
		<?= bl_forms_field_label_html($field, $input_id, $req_mark) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<input class="bl-form__control" type="<?= esc_attr($input_type) ?>" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" value="<?= esc_attr($default_value) ?>"<?= $placeholder !== '' ? ' placeholder="' . esc_attr($placeholder) . '"' : '' ?><?= $control_attrs ?><?= $number_attrs // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_maxlength_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
		<?= bl_forms_field_char_count_html($field, $input_id, $settings) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>
	<?php

	return (string) ob_get_clean();
}
