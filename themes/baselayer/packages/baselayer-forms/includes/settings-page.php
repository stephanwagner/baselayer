<?php

defined('ABSPATH') || exit;

/**
 * Available settings page tabs.
 *
 * @return array<string, string> slug => label
 */
function bl_forms_settings_tabs(): array
{
	return [
		'notifications' => __('Notifications', 'baselayer-forms'),
		'messages'      => __('Messages', 'baselayer-forms'),
		'security'      => __('Security', 'baselayer-forms'),
		'captcha'       => __('CAPTCHA', 'baselayer-forms'),
		'uploads'       => __('Uploads', 'baselayer-forms'),
	];
}

/**
 * Current settings tab slug.
 */
function bl_forms_settings_current_tab(): string
{
	$tabs = bl_forms_settings_tabs();
	$tab = isset($_GET['tab']) ? sanitize_key((string) wp_unslash($_GET['tab'])) : '';
	// Legacy Validation tab merged into Messages.
	if ($tab === 'validation') {
		return 'messages';
	}
	if ($tab === '' || !isset($tabs[$tab])) {
		return 'notifications';
	}

	return $tab;
}

/**
 * Settings page URL for a tab.
 */
function bl_forms_settings_url(string $tab = ''): string
{
	$args = [
		'post_type' => BL_FORM_POST_TYPE,
		'page'      => 'bl-forms-settings',
	];
	if ($tab !== '') {
		$args['tab'] = $tab;
	}

	return add_query_arg($args, admin_url('edit.php'));
}

/**
 * Register Forms → Settings submenu.
 */
function bl_forms_register_settings_page(): void
{
	add_submenu_page(
		'edit.php?post_type=' . BL_FORM_POST_TYPE,
		__('Form Settings', 'baselayer-forms'),
		__('Settings', 'baselayer-forms'),
		'manage_options',
		'bl-forms-settings',
		'bl_forms_render_settings_page'
	);
}
add_action('admin_menu', 'bl_forms_register_settings_page', 9);

/**
 * Hide settings for users who cannot manage forms.
 */
function bl_forms_maybe_hide_settings_page(): void
{
	if (bl_forms_user_can_manage()) {
		return;
	}

	remove_submenu_page(
		'edit.php?post_type=' . BL_FORM_POST_TYPE,
		'bl-forms-settings'
	);
}
add_action('admin_menu', 'bl_forms_maybe_hide_settings_page', 999);

/**
 * Handle settings save.
 */
function bl_forms_handle_settings_save(): void
{
	if (!isset($_POST['bl_forms_settings_nonce'])) {
		return;
	}
	if (!wp_verify_nonce((string) $_POST['bl_forms_settings_nonce'], 'bl_forms_save_global_settings')) {
		return;
	}
	if (!bl_forms_user_can_manage()) {
		return;
	}

	$raw = isset($_POST['bl_forms_global']) && is_array($_POST['bl_forms_global'])
		? wp_unslash($_POST['bl_forms_global'])
		: [];
	if (!is_array($raw)) {
		$raw = [];
	}

	$tabs = bl_forms_settings_tabs();
	$tab = isset($_POST['bl_forms_settings_tab'])
		? sanitize_key((string) wp_unslash($_POST['bl_forms_settings_tab']))
		: 'notifications';
	if (!isset($tabs[$tab])) {
		$tab = 'notifications';
	}

	// Tabbed UI only posts the active section — merge onto current globals.
	$merged = bl_forms_get_global_settings();
	$bool_keys_by_tab = [
		'notifications' => ['notify_user'],
		'security'      => ['min_fill_time_enabled', 'rate_limit_enabled'],
		'uploads'       => ['allow_save_uploads', 'save_uploads'],
	];
	foreach ($bool_keys_by_tab[$tab] ?? [] as $bool_key) {
		$raw[$bool_key] = !empty($raw[$bool_key]);
	}
	foreach ($raw as $key => $value) {
		$merged[$key] = $value;
	}

	bl_forms_update_global_settings($merged);

	wp_safe_redirect(add_query_arg('updated', '1', bl_forms_settings_url($tab)));
	exit;
}
add_action('admin_init', 'bl_forms_handle_settings_save');

/**
 * Enqueue styles on the settings screen.
 */
function bl_forms_settings_enqueue(string $hook): void
{
	if ($hook !== 'bl_form_page_bl-forms-settings') {
		return;
	}
	if (!bl_forms_user_can_manage()) {
		return;
	}

	bl_forms_enqueue_style('bl-forms-admin', 'forms-admin');
}
add_action('admin_enqueue_scripts', 'bl_forms_settings_enqueue');

/**
 * Render a labeled text/textarea row (WP form-table).
 *
 * @param array<string, mixed> $settings
 */
function bl_forms_settings_text_row(
	array $settings,
	string $key,
	string $label,
	string $placeholder = '',
	string $help = '',
	string $type = 'text',
	int $rows = 2
): void {
	$value = isset($settings[$key]) ? (string) $settings[$key] : '';
	$name = 'bl_forms_global[' . $key . ']';
	?>
	<tr>
		<th scope="row"><label for="<?= esc_attr('bl-forms-global-' . $key) ?>"><?= esc_html($label) ?></label></th>
		<td>
			<?php if ($type === 'textarea') : ?>
				<textarea
					class="large-text"
					rows="<?= (int) $rows ?>"
					name="<?= esc_attr($name) ?>"
					id="<?= esc_attr('bl-forms-global-' . $key) ?>"
					placeholder="<?= esc_attr($placeholder) ?>"
				><?= esc_textarea($value) ?></textarea>
			<?php else : ?>
				<input
					type="text"
					class="large-text"
					name="<?= esc_attr($name) ?>"
					id="<?= esc_attr('bl-forms-global-' . $key) ?>"
					value="<?= esc_attr($value) ?>"
					placeholder="<?= esc_attr($placeholder) ?>"
				>
			<?php endif; ?>
			<?php if ($help !== '') : ?>
				<p class="description"><?= esc_html($help) ?></p>
			<?php endif; ?>
		</td>
	</tr>
	<?php
}

/**
 * One message field inside a boxed section (matches form builder validation UI).
 *
 * @param array<string, mixed> $settings
 */
function bl_forms_settings_message_field(
	array $settings,
	string $key,
	string $label,
	string $placeholder = '',
	string $help = '',
	string $type = 'text',
	int $rows = 2
): void {
	bl_forms_settings_text_row($settings, $key, $label, $placeholder, $help, $type, $rows);
}

/**
 * Message section: WP h2 + form-table.
 *
 * @param callable():void $render_fields
 */
function bl_forms_settings_message_section(string $title, callable $render_fields): void
{
	?>
	<h2 class="title"><?= esc_html($title) ?></h2>
	<table class="form-table" role="presentation">
		<?php $render_fields(); ?>
	</table>
	<?php
}

/**
 * Help row spanning the form-table value column.
 */
function bl_forms_settings_help_row(string $help): void
{
	?>
	<tr class="bl-forms-settings__help-row">
		<th scope="row"></th>
		<td><p class="description"><?= esc_html($help) ?></p></td>
	</tr>
	<?php
}

/**
 * Toggle switch markup (kept for security settings).
 *
 * @param array{
 *   name?: string,
 *   checked?: bool,
 *   disabled?: bool,
 *   label: string,
 *   badge?: string
 * } $args
 */
function bl_forms_settings_switch(array $args): void
{
	$name = (string) ($args['name'] ?? '');
	$checked = !empty($args['checked']);
	$disabled = !empty($args['disabled']);
	$label = (string) ($args['label'] ?? '');
	$badge = (string) ($args['badge'] ?? '');
	?>
	<div class="bl-forms-settings__switch-setting<?= $disabled ? ' is-disabled' : '' ?>">
		<label class="bl-forms-builder__switch">
			<input
				type="checkbox"
				<?= $name !== '' ? 'name="' . esc_attr($name) . '"' : '' ?>
				value="1"
				<?= checked($checked, true, false) ?>
				<?= disabled($disabled, true, false) ?>
			>
			<span class="bl-forms-builder__switch-ui" aria-hidden="true"></span>
			<span class="bl-forms-builder__switch-label"><?= esc_html($label) ?></span>
			<?php if ($badge !== '') : ?>
				<span class="bl-forms-settings__badge"><?= esc_html($badge) ?></span>
			<?php endif; ?>
		</label>
	</div>
	<?php
}

/**
 * Locked “always on” security option (read-only switch) in a form-table row.
 */
function bl_forms_settings_locked_security_option(string $label, string $help): void
{
	?>
	<tr>
		<th scope="row"><?= esc_html($label) ?></th>
		<td>
			<?php
			bl_forms_settings_switch([
				'checked'  => true,
				'disabled' => true,
				'label'    => __('Always on', 'baselayer-forms'),
			]);
			?>
			<p class="description"><?= esc_html($help) ?></p>
		</td>
	</tr>
	<?php
}

/**
 * Settings page markup.
 */
function bl_forms_render_settings_page(): void
{
	if (!bl_forms_user_can_manage()) {
		wp_die(esc_html__('You do not have permission to manage form settings.', 'baselayer-forms'));
	}

	$settings = bl_forms_get_global_settings();
	$fallbacks = bl_forms_message_fallbacks();
	$admin_email = (string) get_option('admin_email', '');
	$wp_max = size_format(wp_max_upload_size());
	$admin_subject_fb = __('[{site_name}] New submission: {form_title}', 'baselayer-forms');
	$user_subject_fb = __('We received your message – {site_name}', 'baselayer-forms');
	$user_intro_fb = __('Thank you for your message. Here is a copy of what you sent:', 'baselayer-forms');

	$providers = [
		'turnstile'    => __('Cloudflare Turnstile', 'baselayer-forms'),
		'hcaptcha'     => __('hCaptcha', 'baselayer-forms'),
		'friendly'     => __('Friendly Captcha', 'baselayer-forms'),
		'recaptcha_v2' => __('Google reCAPTCHA v2', 'baselayer-forms'),
	];

	$tabs = bl_forms_settings_tabs();
	$tab = bl_forms_settings_current_tab();
	?>
	<div class="wrap bl-forms-settings">
		<h1><?= esc_html__('Form Settings', 'baselayer-forms') ?></h1>
		<?php if (!empty($_GET['updated'])) : ?>
			<div class="notice notice-success is-dismissible"><p><?= esc_html__('Settings saved.', 'baselayer-forms') ?></p></div>
		<?php endif; ?>

		<p class="description">
			<?= esc_html__('These defaults apply to all forms. Empty text fields fall back to the built-in translations. Individual forms can override messages.', 'baselayer-forms') ?>
		</p>

		<nav class="nav-tab-wrapper wp-clearfix" aria-label="<?= esc_attr__('Form settings sections', 'baselayer-forms') ?>">
			<?php foreach ($tabs as $slug => $label) : ?>
				<a
					href="<?= esc_url(bl_forms_settings_url($slug)) ?>"
					class="nav-tab<?= $tab === $slug ? ' nav-tab-active' : '' ?>"
				><?= esc_html($label) ?></a>
			<?php endforeach; ?>
		</nav>

		<form method="post" action="<?= esc_url(bl_forms_settings_url($tab)) ?>" class="bl-forms-settings__form">
			<?php wp_nonce_field('bl_forms_save_global_settings', 'bl_forms_settings_nonce'); ?>
			<input type="hidden" name="bl_forms_settings_tab" value="<?= esc_attr($tab) ?>">

			<?php if ($tab === 'notifications') : ?>
				<table class="form-table" role="presentation">
					<?php
					bl_forms_settings_text_row(
						$settings,
						'recipient',
						__('Recipient', 'baselayer-forms'),
						$admin_email,
						__('One email per line. Leave empty to use the site administrator email.', 'baselayer-forms'),
						'textarea',
						3
					);
					bl_forms_settings_text_row(
						$settings,
						'admin_email_subject',
						__('Email subject', 'baselayer-forms'),
						$admin_subject_fb,
						__('The placeholders {form_title} and {site_name} are replaced by the form title and site name.', 'baselayer-forms')
					);
					?>
					<tr>
						<th scope="row"><?= esc_html__('Confirmation email', 'baselayer-forms') ?></th>
						<td>
							<label>
								<input type="checkbox" name="bl_forms_global[notify_user]" value="1" <?= checked(!empty($settings['notify_user']), true, false) ?>>
								<?= esc_html__('Enable by default on new forms', 'baselayer-forms') ?>
							</label>
							<p class="description"><?= esc_html__('Copied onto new forms when they are created. Existing forms keep their own setting.', 'baselayer-forms') ?></p>
						</td>
					</tr>
					<?php
					bl_forms_settings_text_row(
						$settings,
						'user_email_subject',
						__('Confirmation subject', 'baselayer-forms'),
						$user_subject_fb
					);
					bl_forms_settings_text_row(
						$settings,
						'user_email_intro',
						__('Confirmation intro', 'baselayer-forms'),
						$user_intro_fb,
						__('Placeholders like {field-id} can be used.', 'baselayer-forms'),
						'textarea',
						3
					);
					?>
				</table>
			<?php elseif ($tab === 'messages') : ?>
				<?php
				$range_help = __('The placeholder {limit} is replaced by the limit.', 'baselayer-forms');

				bl_forms_settings_message_section(__('Form messages', 'baselayer-forms'), static function () use ($settings, $fallbacks): void {
					bl_forms_settings_message_field($settings, 'submit_label', __('Submit button label', 'baselayer-forms'), $fallbacks['submit']);
					bl_forms_settings_message_field($settings, 'success_message', __('Success message', 'baselayer-forms'), $fallbacks['success'], '', 'textarea');
					bl_forms_settings_message_field($settings, 'error_message', __('Error message', 'baselayer-forms'), $fallbacks['error'], '', 'textarea');
					bl_forms_settings_message_field($settings, 'validation_message', __('Validation message', 'baselayer-forms'), $fallbacks['validation'], '', 'textarea');
				});

				bl_forms_settings_message_section(__('Required', 'baselayer-forms'), static function () use ($settings, $fallbacks): void {
					bl_forms_settings_message_field($settings, 'required_message', __('Required', 'baselayer-forms'), $fallbacks['required']);
				});

				bl_forms_settings_message_section(__('Character count', 'baselayer-forms'), static function () use ($settings, $fallbacks, $range_help): void {
					bl_forms_settings_message_field(
						$settings,
						'char_count_text',
						__('Character count text', 'baselayer-forms'),
						$fallbacks['char_count'],
						__('The placeholders {remaining}, {count}, and {max} are replaced by the remaining count, current count, and maximum.', 'baselayer-forms')
					);
					bl_forms_settings_message_field($settings, 'char_count_empty_text', __('When limit is reached', 'baselayer-forms'), $fallbacks['char_count_empty']);
					bl_forms_settings_message_field($settings, 'maxlength_message', __('Max length', 'baselayer-forms'), $fallbacks['maxlength'], $range_help);
				});

				bl_forms_settings_message_section(__('Number', 'baselayer-forms'), static function () use ($settings, $fallbacks, $range_help): void {
					bl_forms_settings_message_field($settings, 'number_message', __('Invalid', 'baselayer-forms'), $fallbacks['number']);
					bl_forms_settings_message_field($settings, 'min_message', __('Minimum', 'baselayer-forms'), $fallbacks['min']);
					bl_forms_settings_message_field($settings, 'max_message', __('Maximum', 'baselayer-forms'), $fallbacks['max']);
					bl_forms_settings_help_row($range_help);
				});

				bl_forms_settings_message_section(__('Email', 'baselayer-forms'), static function () use ($settings, $fallbacks): void {
					bl_forms_settings_message_field($settings, 'email_message', __('Invalid', 'baselayer-forms'), $fallbacks['email']);
				});

				bl_forms_settings_message_section(__('URL', 'baselayer-forms'), static function () use ($settings, $fallbacks): void {
					bl_forms_settings_message_field($settings, 'url_message', __('Invalid', 'baselayer-forms'), $fallbacks['url']);
				});

				bl_forms_settings_message_section(__('Phone', 'baselayer-forms'), static function () use ($settings, $fallbacks): void {
					bl_forms_settings_message_field($settings, 'phone_message', __('Invalid', 'baselayer-forms'), $fallbacks['phone']);
				});

				bl_forms_settings_message_section(__('Date', 'baselayer-forms'), static function () use ($settings, $fallbacks, $range_help): void {
					bl_forms_settings_message_field($settings, 'date_message', __('Invalid', 'baselayer-forms'), $fallbacks['date']);
					bl_forms_settings_message_field($settings, 'date_min_message', __('Minimum', 'baselayer-forms'), $fallbacks['date_min']);
					bl_forms_settings_message_field($settings, 'date_max_message', __('Maximum', 'baselayer-forms'), $fallbacks['date_max']);
					bl_forms_settings_help_row($range_help);
					bl_forms_settings_message_field($settings, 'date_before_message', __('Before related field', 'baselayer-forms'), $fallbacks['date_before']);
					bl_forms_settings_message_field($settings, 'date_after_message', __('After related field', 'baselayer-forms'), $fallbacks['date_after']);
					bl_forms_settings_help_row(__('The placeholder {field} is replaced by the related field label.', 'baselayer-forms'));
				});

				bl_forms_settings_message_section(__('Time', 'baselayer-forms'), static function () use ($settings, $fallbacks, $range_help): void {
					bl_forms_settings_message_field($settings, 'time_message', __('Invalid', 'baselayer-forms'), $fallbacks['time']);
					bl_forms_settings_message_field($settings, 'time_min_message', __('Minimum', 'baselayer-forms'), $fallbacks['time_min']);
					bl_forms_settings_message_field($settings, 'time_max_message', __('Maximum', 'baselayer-forms'), $fallbacks['time_max']);
					bl_forms_settings_help_row($range_help);
				});

				bl_forms_settings_message_section(__('Date & time', 'baselayer-forms'), static function () use ($settings, $fallbacks, $range_help): void {
					bl_forms_settings_message_field($settings, 'datetime_message', __('Invalid', 'baselayer-forms'), $fallbacks['datetime']);
					bl_forms_settings_message_field($settings, 'datetime_min_message', __('Minimum', 'baselayer-forms'), $fallbacks['datetime_min']);
					bl_forms_settings_message_field($settings, 'datetime_max_message', __('Maximum', 'baselayer-forms'), $fallbacks['datetime_max']);
					bl_forms_settings_help_row($range_help);
				});

				bl_forms_settings_message_section(__('File', 'baselayer-forms'), static function () use ($settings, $fallbacks): void {
					bl_forms_settings_message_field($settings, 'file_message', __('Invalid', 'baselayer-forms'), $fallbacks['file']);
					bl_forms_settings_message_field(
						$settings,
						'file_type_message',
						__('Wrong file type', 'baselayer-forms'),
						$fallbacks['file_type'],
						__('The placeholder {types} is replaced by the allowed file types.', 'baselayer-forms')
					);
					bl_forms_settings_message_field(
						$settings,
						'file_size_message',
						__('File too large', 'baselayer-forms'),
						$fallbacks['file_size'],
						__('The placeholder {size} is replaced by the maximum size.', 'baselayer-forms')
					);
					bl_forms_settings_message_field(
						$settings,
						'file_max_message',
						__('Too many files', 'baselayer-forms'),
						$fallbacks['file_max'],
						__('The placeholder {max} is replaced by the maximum number of files.', 'baselayer-forms')
					);
				});

				bl_forms_settings_message_section(__('Choice', 'baselayer-forms'), static function () use ($settings, $fallbacks): void {
					bl_forms_settings_message_field($settings, 'option_message', __('Invalid', 'baselayer-forms'), $fallbacks['option']);
				});
				?>
			<?php elseif ($tab === 'security') : ?>
				<table class="form-table" role="presentation">
					<?php
					bl_forms_settings_locked_security_option(
						__('CSRF protection', 'baselayer-forms'),
						__('A WordPress nonce is verified on every submission to block forged requests.', 'baselayer-forms')
					);
					bl_forms_settings_locked_security_option(
						__('JavaScript check', 'baselayer-forms'),
						__('A hidden field is set by JavaScript. If the expected value is missing, the submission is discarded.', 'baselayer-forms')
					);
					bl_forms_settings_locked_security_option(
						__('Honeypot field', 'baselayer-forms'),
						__('A field hidden from visitors detects simple bots. If it is filled, the submission is discarded.', 'baselayer-forms')
					);
					?>
					<tr>
						<th scope="row"><?= esc_html__('Minimum fill time', 'baselayer-forms') ?></th>
						<td>
							<?php
							bl_forms_settings_switch([
								'name'    => 'bl_forms_global[min_fill_time_enabled]',
								'checked' => !empty($settings['min_fill_time_enabled']),
								'label'   => __('Require a minimum time before submit', 'baselayer-forms'),
							]);
							?>
							<p class="description"><?= esc_html__('Submissions are rejected when the form is sent unusually quickly.', 'baselayer-forms') ?></p>
							<p style="margin-top: 12px;">
								<label>
									<?= esc_html__('Min.', 'baselayer-forms') ?>
									<input type="number" class="small-text" name="bl_forms_global[min_fill_time]" min="1" max="300" step="1" value="<?= esc_attr((string) (int) $settings['min_fill_time']) ?>" style="min-height: 32px;">
									<?= esc_html__('seconds', 'baselayer-forms') ?>
								</label>
							</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?= esc_html__('Submission limit', 'baselayer-forms') ?></th>
						<td>
							<?php
							bl_forms_settings_switch([
								'name'    => 'bl_forms_global[rate_limit_enabled]',
								'checked' => !empty($settings['rate_limit_enabled']),
								'label'   => __('Limit submissions per IP', 'baselayer-forms'),
							]);
							?>
							<p class="description"><?= esc_html__('Limits how often the same visitor can submit the form within a time period.', 'baselayer-forms') ?></p>
							<p style="margin-top: 12px;">
								<label>
									<?= esc_html__('Max', 'baselayer-forms') ?>
									<input type="number" class="small-text" name="bl_forms_global[rate_limit_max]" min="1" max="100" step="1" value="<?= esc_attr((string) (int) $settings['rate_limit_max']) ?>" style="min-height: 32px;">
									<?= esc_html__('submissions in', 'baselayer-forms') ?>
									<input type="number" class="small-text" name="bl_forms_global[rate_limit_window]" min="1" max="1440" step="1" value="<?= esc_attr((string) (int) $settings['rate_limit_window']) ?>" style="min-height: 32px;">
									<?= esc_html__('minutes', 'baselayer-forms') ?>
								</label>
							</p>
						</td>
					</tr>
				</table>
			<?php elseif ($tab === 'captcha') : ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="bl-forms-global-captcha_provider"><?= esc_html__('CAPTCHA service', 'baselayer-forms') ?></label></th>
						<td>
							<select name="bl_forms_global[captcha_provider]" id="bl-forms-global-captcha_provider">
								<?php foreach ($providers as $id => $label) : ?>
									<option value="<?= esc_attr($id) ?>" <?= selected($settings['captcha_provider'], $id, false) ?>><?= esc_html($label) ?></option>
								<?php endforeach; ?>
							</select>
							<p class="description"><?= esc_html__('Used by every form that includes a CAPTCHA field.', 'baselayer-forms') ?></p>
						</td>
					</tr>
					<?php
					bl_forms_settings_text_row($settings, 'captcha_site_key', __('Site key', 'baselayer-forms'));
					?>
					<tr>
						<th scope="row"><label for="bl-forms-global-captcha_secret_key"><?= esc_html__('Secret key', 'baselayer-forms') ?></label></th>
						<td>
							<input
								type="password"
								class="large-text"
								name="bl_forms_global[captcha_secret_key]"
								id="bl-forms-global-captcha_secret_key"
								value="<?= esc_attr((string) $settings['captcha_secret_key']) ?>"
								autocomplete="new-password"
							>
						</td>
					</tr>
				</table>
			<?php else : ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="bl-forms-global-upload_max_size_mb"><?= esc_html__('Maximum file size', 'baselayer-forms') ?></label></th>
						<td>
							<input
								type="number"
								class="small-text"
								name="bl_forms_global[upload_max_size_mb]"
								id="bl-forms-global-upload_max_size_mb"
								min="0.1"
								step="0.1"
								value="<?= esc_attr((string) $settings['upload_max_size_mb']) ?>"
							>
							<?= esc_html__('MB', 'baselayer-forms') ?>
							<p class="description">
								<?= $wp_max
									? esc_html(sprintf(
										/* translators: %s: server upload limit */
										__('Default maximum file size for file upload fields. Leave empty to use the server limit (%s). Individual fields can override this.', 'baselayer-forms'),
										$wp_max
									))
									: esc_html__('Default maximum file size for file upload fields. Leave empty to use the server limit. Individual fields can override this.', 'baselayer-forms') ?>
							</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?= esc_html__('Save uploaded files', 'baselayer-forms') ?></th>
						<td>
							<label>
								<input type="checkbox" name="bl_forms_global[allow_save_uploads]" value="1" <?= checked(!empty($settings['allow_save_uploads']), true, false) ?>>
								<?= esc_html__('Allow forms to save uploaded files', 'baselayer-forms') ?>
							</label>
							<p class="description"><?= esc_html__('When disabled, uploaded files are deleted after processing and the per-form option is unavailable.', 'baselayer-forms') ?></p>
							<p style="margin-top: 16px;">
								<label>
									<input type="checkbox" name="bl_forms_global[save_uploads]" value="1" <?= checked(!empty($settings['save_uploads']), true, false) ?>>
									<?= esc_html__('Enable by default on new forms', 'baselayer-forms') ?>
								</label>
							</p>
							<p class="description"><?= esc_html__('Copied onto new forms when they are created. Existing forms keep their own setting.', 'baselayer-forms') ?></p>
							<p class="description"><?= esc_html__('Uploaded files are stored securely outside the Media Library using unguessable filenames.', 'baselayer-forms') ?></p>
						</td>
					</tr>
				</table>
			<?php endif; ?>

			<?php submit_button(__('Save settings', 'baselayer-forms')); ?>
		</form>
	</div>
	<?php
}
