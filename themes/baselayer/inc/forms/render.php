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
		<div class="bl-form__message" data-bl-form-message hidden role="status" aria-live="polite"></div>
		<form class="bl-form__form" method="post" action="" novalidate data-bl-form-el id="<?= esc_attr($uid) ?>">
			<input type="hidden" name="action" value="bl_forms_submit">
			<input type="hidden" name="form_id" value="<?= esc_attr((string) $form_id) ?>">
			<input type="hidden" name="nonce" value="<?= esc_attr($nonce) ?>">
			<div class="bl-form__honeypot" aria-hidden="true">
				<label for="<?= esc_attr($uid) ?>-hp"><?= esc_html__('Leave blank', 'baselayer') ?></label>
				<input type="text" name="bl_forms_hp" id="<?= esc_attr($uid) ?>-hp" value="" tabindex="-1" autocomplete="off">
			</div>
			<div class="bl-form__fields">
				<?php foreach ($config['fields'] as $field) : ?>
					<?= bl_forms_render_field($field, $uid) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<?php endforeach; ?>
			</div>
			<div class="bl-form__actions">
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
	$attrs = 'class="' . esc_attr($classes) . '"';
	if ($name !== '') {
		$attrs .= ' data-bl-form-field="' . esc_attr($name) . '"';
	}
	$attrs .= ' style="--bl-form-field-width:' . esc_attr(bl_forms_field_width_css($field)) . '"';

	return $attrs;
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
 * Render one field.
 *
 * @param array<string, mixed> $field
 */
function bl_forms_render_field(array $field, string $uid): string
{
	$type = (string) ($field['type'] ?? 'text');
	$id = (string) ($field['id'] ?? '');
	$input_id = $uid . '-' . $id;

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

	$name = (string) ($field['name'] ?? $id);
	$label = (string) ($field['label'] ?? '');
	$required = !empty($field['required']);
	$placeholder = (string) ($field['placeholder'] ?? '');
	$req_attr = $required ? ' required' : '';
	$req_mark = $required ? ' <span class="bl-form__required" aria-hidden="true">*</span>' : '';
	$field_name = 'fields[' . $name . ']';

	ob_start();

	if ($type === 'textarea') {
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--textarea', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<label class="bl-form__label" for="<?= esc_attr($input_id) ?>"><?= esc_html($label) ?><?= $req_mark // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></label>
			<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<textarea class="bl-form__control" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" rows="5" placeholder="<?= esc_attr($placeholder) ?>"<?= $req_attr ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>></textarea>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'radio') {
		$options = isset($field['options']) && is_array($field['options']) ? $field['options'] : [];
		?>
		<fieldset <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--radio', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<legend class="bl-form__label"><?= esc_html($label) ?><?= $req_mark // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></legend>
			<div class="bl-form__options">
				<?php foreach ($options as $i => $opt) :
					$oid = $input_id . '-' . $i;
					?>
					<label class="bl-form__option" for="<?= esc_attr($oid) ?>">
						<input type="radio" id="<?= esc_attr($oid) ?>" name="<?= esc_attr($field_name) ?>" value="<?= esc_attr((string) ($opt['value'] ?? '')) ?>"<?= $req_attr ?>>
						<span><?= esc_html((string) ($opt['label'] ?? '')) ?></span>
					</label>
				<?php endforeach; ?>
			</div>
		</fieldset>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'checkboxes') {
		$options = isset($field['options']) && is_array($field['options']) ? $field['options'] : [];
		?>
		<fieldset <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--checkboxes', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<legend class="bl-form__label"><?= esc_html($label) ?><?= $req_mark // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></legend>
			<div class="bl-form__options">
				<?php foreach ($options as $i => $opt) :
					$oid = $input_id . '-' . $i;
					?>
					<label class="bl-form__option" for="<?= esc_attr($oid) ?>">
						<input type="checkbox" id="<?= esc_attr($oid) ?>" name="<?= esc_attr($field_name) ?>[]" value="<?= esc_attr((string) ($opt['value'] ?? '')) ?>">
						<span><?= esc_html((string) ($opt['label'] ?? '')) ?></span>
					</label>
				<?php endforeach; ?>
			</div>
		</fieldset>
		<?php
		return (string) ob_get_clean();
	}

	if ($type === 'terms') {
		?>
		<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--terms', $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
			<label class="bl-form__option bl-form__option--terms" for="<?= esc_attr($input_id) ?>">
				<input type="checkbox" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" value="1"<?= $req_attr ?>>
				<span><?= esc_html($label) ?><?= $req_mark // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
			</label>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	$input_type = $type === 'email' ? 'email' : 'text';
	?>
	<div <?= bl_forms_field_wrap_attrs($field, 'bl-form__field bl-form__field--' . $input_type, $name) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
		<label class="bl-form__label" for="<?= esc_attr($input_id) ?>"><?= esc_html($label) ?><?= $req_mark // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></label>
		<?= bl_forms_field_description_html($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		<input class="bl-form__control" type="<?= esc_attr($input_type) ?>" id="<?= esc_attr($input_id) ?>" name="<?= esc_attr($field_name) ?>" value="" placeholder="<?= esc_attr($placeholder) ?>"<?= $req_attr ?><?= bl_forms_field_describedby_attr($field, $input_id) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	</div>
	<?php

	return (string) ob_get_clean();
}
