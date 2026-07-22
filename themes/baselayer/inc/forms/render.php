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

	$has_uploads = false;
	foreach (bl_forms_iter_fields($config['fields']) as $field) {
		if (in_array((string) ($field['type'] ?? ''), ['file', 'image'], true)) {
			$has_uploads = true;
			break;
		}
	}

	$uid = 'bl-form-' . $form_id . '-' . wp_unique_id();
	$nonce = wp_create_nonce('bl_forms_submit_' . $form_id);
	$wrapper_attributes = isset($args['wrapper_attributes']) && is_string($args['wrapper_attributes']) && $args['wrapper_attributes'] !== ''
		? $args['wrapper_attributes']
		: 'class="bl-form"';

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
	>
		<form class="bl-form__form" method="post" action="" novalidate data-bl-form-el id="<?= esc_attr($uid) ?>"<?= $has_uploads ? ' enctype="multipart/form-data"' : '' ?>>
			<input type="hidden" name="action" value="bl_forms_submit">
			<input type="hidden" name="form_id" value="<?= esc_attr((string) $form_id) ?>">
			<input type="hidden" name="nonce" value="<?= esc_attr($nonce) ?>">
			<div class="bl-form__honeypot" aria-hidden="true">
				<label for="<?= esc_attr($uid) ?>-hp"><?= esc_html__('Leave blank', 'baselayer') ?></label>
				<input type="text" name="bl_forms_hp" id="<?= esc_attr($uid) ?>-hp" value="" tabindex="-1" autocomplete="off">
			</div>
			<div class="bl-form__fields">
				<?= bl_forms_render_fields($config['fields'], $uid) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
			<div class="bl-form__actions">
				<div class="bl-form__message" data-bl-form-message hidden role="status" aria-live="polite"></div>
				<button type="submit" class="bl-form__submit" data-bl-form-submit>
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
 * aria-describedby when a description is present.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_field_describedby_attr(array $field, string $input_id): string
{
	if (trim((string) ($field['description'] ?? '')) === '') {
		return '';
	}

	return ' aria-describedby="' . esc_attr($input_id) . '-desc"';
}

/**
 * Render root fields, wrapping consecutive columns in a row.
 *
 * @param list<array<string, mixed>> $fields
 */
function bl_forms_render_fields(array $fields, string $uid): string
{
	$html = '';
	$count = count($fields);
	$i = 0;

	while ($i < $count) {
		$field = $fields[$i];
		if (!is_array($field)) {
			$i++;
			continue;
		}

		if (($field['type'] ?? '') === 'column') {
			$run = [];
			while ($i < $count && is_array($fields[$i]) && ($fields[$i]['type'] ?? '') === 'column') {
				$run[] = $fields[$i];
				$i++;
			}
			$inner = '';
			foreach ($run as $column) {
				$inner .= bl_forms_render_field($column, $uid);
			}
			if ($inner !== '') {
				$html .= '<div class="bl-form__group">' . $inner . '</div>';
			}
			continue;
		}

		$html .= bl_forms_render_field($field, $uid);
		$i++;
	}

	return $html;
}

/**
 * Render one field.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_render_field(array $field, string $uid): string
{
	$type = (string) ($field['type'] ?? 'text');
	$id = (string) ($field['id'] ?? '');
	$input_id = $uid . '-' . $id;

	if ($type === 'column') {
		$children = isset($field['children']) && is_array($field['children']) ? $field['children'] : [];
		$inner = '';
		foreach ($children as $child) {
			if (!is_array($child)) {
				continue;
			}
			$inner .= bl_forms_render_field($child, $uid);
		}
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

	if ($type === 'divider') {
		return '<div ' . bl_forms_field_wrap_attrs($field, 'bl-form__divider-wrap') . '><hr class="bl-form__divider"></div>';
	}

	if ($type === 'spacer') {
		$height = trim((string) ($field['height'] ?? '24px'));
		if ($height === '') {
			$height = '24px';
		}
		$classes = 'bl-form__field-wrap bl-form__spacer-wrap';
		$style = bl_forms_field_width_style($field) . ';--bl-form-spacer-height:' . $height;

		return '<div class="' . esc_attr($classes) . '" style="' . esc_attr($style) . '" aria-hidden="true"></div>';
	}

	if ($type === 'captcha') {
		return '<div ' . bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--captcha') . '>'
			. '<div class="bl-form__captcha-placeholder" role="note">'
			. esc_html__('CAPTCHA placeholder — integration coming soon.', 'baselayer')
			. '</div></div>';
	}

	if ($type === 'heading') {
		$content = (string) ($field['content'] ?? '');
		if ($content === '') {
			return '';
		}

		return '<div ' . bl_forms_field_wrap_attrs($field, 'bl-form__heading') . '><h3 class="bl-form__title">' . esc_html($content) . '</h3></div>';
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
	$required = !empty($field['required']);
	$placeholder = (string) ($field['placeholder'] ?? '');
	$multiple = !empty($field['multiple']);
	$default_value = (string) ($field['default_value'] ?? '');
	$req_attr = $required ? ' required' : '';
	$req_mark = $required ? ' <span class="bl-form__required" aria-hidden="true">*</span>' : '';
	$field_name = 'fields[' . $name . ']';
	$options = isset($field['options']) && is_array($field['options']) ? $field['options'] : [];

	ob_start();

	if ($type === 'textarea') {
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--textarea', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?= bl_forms_field_label_html($field, $input_id, $req_mark) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<textarea class="bl-form__control" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" rows="5" placeholder="<?= esc_attr($placeholder) ?>"<?= $req_attr ?><?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>><?= esc_textarea($default_value) ?></textarea>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'select') {
		$select_name = $multiple ? $field_name . '[]' : $field_name;
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--select', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?= bl_forms_field_label_html($field, $input_id, $req_mark) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<select class="bl-form__control" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($select_name) ?>"<?= $multiple ? ' multiple' : '' ?><?= $req_attr ?><?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
				<?php if (!$multiple) : ?>
					<option value=""><?= esc_html($placeholder !== '' ? $placeholder : __('Please select…', 'baselayer')) ?></option>
				<?php endif; ?>
				<?php foreach ($options as $opt) :
					$opt_value = (string) ($opt['value'] ?? '');
					$selected = bl_forms_field_default_is($field, $opt_value) ? ' selected' : '';
					?>
					<option value="<?= esc_attr($opt_value) ?>"<?= $selected ?>><?= esc_html((string) ($opt['label'] ?? '')) ?></option>
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
						<input type="radio" id="<?= esc_attr($oid) ?>" name="<?= esc_attr($field_name) ?>" value="<?= esc_attr($opt_value) ?>"<?= $req_attr ?><?= $checked ?>>
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
						<input type="checkbox" id="<?= esc_attr($oid) ?>" name="<?= esc_attr($field_name) ?>[]" value="<?= esc_attr($opt_value) ?>"<?= $checked ?>>
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
						<input type="<?= esc_attr($input_type) ?>" id="<?= esc_attr($oid) ?>" name="<?= esc_attr($input_name) ?>" value="<?= esc_attr($opt_value) ?>"<?= !$multiple ? $req_attr : '' ?><?= $checked ?>>
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
			$checkbox_text = $label !== '' ? $label : __('I agree to the [Privacy Policy](page:privacy).', 'baselayer');
		}
		$show_terms_label = $label !== '' && !bl_forms_field_hide_label($field);
		$checked = bl_forms_field_default_checked($field) ? ' checked' : '';
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--terms', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?php if ($show_terms_label) : ?>
				<div class="bl-form__label" id="<?= esc_attr($input_id) ?>-label"><?= esc_html($label) ?><?= $req_mark // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
			<?php endif; ?>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<label class="bl-form__option bl-form__option--terms" for="<?= esc_attr($input_id) ?>">
				<input type="checkbox" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" value="1"<?= $req_attr ?><?= $checked ?><?= $show_terms_label ? ' aria-labelledby="' . esc_attr($input_id) . '-label"' : '' ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
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
			<label for="<?= esc_attr($input_id) ?>"><?= esc_html($label !== '' ? $label : __('Leave blank', 'baselayer')) ?></label>
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
				<input type="checkbox" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" value="1"<?= $req_attr ?><?= $checked ?><?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
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
		$accept = $type === 'image' ? 'image/*' : '';
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--' . $type, $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<?= bl_forms_field_label_html($field, $input_id, $req_mark) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<input
				class="bl-form__control bl-form__control--file"
				type="file"
				id="<?= esc_attr($input_id) ?>"
				name="<?= esc_attr($file_name) ?>"
				<?= $accept !== '' ? 'accept="' . esc_attr($accept) . '"' : '' ?>
				<?= $multiple ? ' multiple' : '' ?>
				<?= $req_attr ?>
				<?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?= $type === 'image' ? ' data-bl-form-image-input' : '' ?>
			>
			<?php if ($type === 'image') : ?>
				<div class="bl-form__image-preview" data-bl-form-image-preview hidden></div>
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
	} elseif ($type === 'password') {
		$input_type = 'password';
	} elseif ($type === 'date') {
		$input_type = 'date';
	} elseif ($type === 'time') {
		$input_type = 'time';
	} elseif ($type === 'datetime') {
		$input_type = 'datetime-local';
	}
	$input_default = $type === 'password' ? '' : $default_value;
	?>
	<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--' . sanitize_html_class($type), $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
		<?= bl_forms_field_label_html($field, $input_id, $req_mark) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<input class="bl-form__control" type="<?= esc_attr($input_type) ?>" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" value="<?= esc_attr($input_default) ?>" placeholder="<?= esc_attr($placeholder) ?>"<?= $req_attr ?><?= bl_forms_field_aria_label_attr($field) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	</div>
	<?php

	return (string) ob_get_clean();
}
