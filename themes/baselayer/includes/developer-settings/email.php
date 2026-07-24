<?php

defined('ABSPATH') || exit;

/**
 * Email addresses, mail delivery, and test mail — rendered on Developer › Settings.
 */
function bl_developer_render_email_settings_section(): void
{
	?>
	<form method="post" action="" class="bl-page-settings-form">
		<?php settings_fields(BL_THEME_OPTION_GROUP_DEVELOPER_GENERAL); ?>
		<h2 class="title" style="margin-top: 0;"><?= esc_html__('Email addresses', 'baselayer') ?></h2>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row"><label for="admin_email"><?= esc_html__('Admin email', 'baselayer') ?></label></th>
				<td>
					<input type="email" name="admin_email" id="admin_email" value="<?= esc_attr(get_option('admin_email')) ?>" class="regular-text" autocomplete="email">
					<p class="description"><?= esc_html__('WordPress default admin email used for WordPress core notifications.', 'baselayer') ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row"><label for="baselayer_developer_email"><?= esc_html__('Developer email', 'baselayer') ?></label></th>
				<td>
					<input type="email" name="baselayer_developer_email" id="baselayer_developer_email" value="<?= esc_attr(get_option('baselayer_developer_email', '')) ?>" class="regular-text" autocomplete="email">
					<p class="description"><?= esc_html__('Used for system alerts, error notifications and security warnings.', 'baselayer') ?></p>
				</td>
			</tr>
		</table>
		<div class="bl-submit-row">
			<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
		</div>
	</form>

	<hr class="bl-page-settings-divider">

	<form method="post" action="" class="bl-page-settings-form bl-mail-delivery-form" id="bl-mail-delivery">
		<?php wp_nonce_field('baselayer_system_mail_delivery'); ?>
		<input type="hidden" name="baselayer_save_mail_delivery" value="1">
		<h2 class="title"><?= esc_html__('Mail delivery', 'baselayer') ?></h2>
		<p class="description"><?= esc_html__('From address is used for all outgoing mail.', 'baselayer') ?></p>

		<?php
		$current_mailer = get_option('baselayer_mailer', 'php');
		$bl_mailer_options = [
			'php' => [
				'label' => __('WordPress default', 'baselayer'),
				'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#21759b"><path d="M2.597,7.81l4.91,13.454c-3.434-1.669-5.802-5.19-5.802-9.265,0-1.492.32-2.909.891-4.19ZM18.949,11.48c0-1.272-.457-2.153-.849-2.839-.522-.848-1.011-1.566-1.011-2.414,0-.946.718-1.827,1.729-1.827.046,0,.089.006.133.008-1.831-1.678-4.271-2.702-6.951-2.702-3.596,0-6.76,1.845-8.601,4.64.242.007.469.012.662.012,1.077,0,2.743-.131,2.743-.131.555-.033.62.782.066.848,0,0-.558.066-1.178.098l3.749,11.151,2.253-6.757-1.604-4.394c-.554-.033-1.079-.098-1.079-.098-.555-.033-.49-.881.065-.848,0,0,1.7.131,2.712.131,1.077,0,2.743-.131,2.743-.131.555-.033.621.782.066.848,0,0-.559.066-1.178.098l3.72,11.066,1.027-3.431c.445-1.424.784-2.447.784-3.328ZM12.18,12.9l-3.089,8.975c.922.271,1.897.419,2.908.419,1.199,0,2.348-.207,3.418-.584-.028-.044-.053-.091-.073-.142l-3.165-8.669ZM21.032,7.061c.044.328.069.68.069,1.059,0,1.045-.195,2.219-.783,3.687l-3.144,9.091c3.06-1.785,5.119-5.1,5.119-8.898,0-1.79-.457-3.473-1.261-4.939ZM24,12c0,6.617-5.384,12-12,12S0,18.617,0,12,5.383,0,12,0s12,5.383,12,12ZM23.449,12C23.449,5.686,18.313.55,12,.55S.55,5.686.55,12s5.136,11.45,11.449,11.45,11.449-5.137,11.449-11.45Z"/></svg>',
			],
			'smtp' => [
				'label' => 'SMTP',
				'icon' => '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm330.5-288.5Q496-450 501-453l283-177q8-5 12-12.5t4-16.5q0-20-17-30t-35 1L480-520 212-688q-18-11-35-.5T160-659q0 10 4 17.5t12 11.5l283 177q5 3 10.5 4.5T480-447q5 0 10.5-1.5Z"/></svg>',
			],
			'sendgrid' => [
				'label' => 'SendGrid',
				'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24,0v16h-8v8H0v-8s0,0,0,0V8h8V0h16Z" fill="#9dd6e3"/><polygon points="0 24 8 24 8 16 0 16 0 24" fill="#3f72ab"/><polygon points="16 16 24 16 24 8 16 8 16 16" fill="#00a9d1"/><polygon points="8 8 16 8 16 0 8 0 8 8" fill="#00a9d1"/><polygon points="8 16 16 16 16 8 8 8 8 16" fill="#2191c4"/><polygon points="16 8 24 8 24 0 16 0 16 8" fill="#3f72ab"/></svg>',
			],
		];
		?>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row"><label for="baselayer_email_from"><?= esc_html__('From email', 'baselayer') ?></label></th>
				<td>
					<input type="email" name="baselayer_email_from" id="baselayer_email_from" value="<?= esc_attr(get_option('baselayer_email_from', '')) ?>" class="regular-text" autocomplete="email" placeholder="<?= esc_attr(get_option('admin_email', '')) ?>">
					<p class="description"><?= esc_html__('Leave empty to use the Admin email.', 'baselayer') ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row"><label for="baselayer_email_from_name"><?= esc_html__('From name', 'baselayer') ?></label></th>
				<td>
					<input type="text" name="baselayer_email_from_name" id="baselayer_email_from_name" value="<?= esc_attr(get_option('baselayer_email_from_name', '')) ?>" class="regular-text" placeholder="<?= esc_attr(get_bloginfo('name', 'display')) ?>">
					<p class="description"><?= esc_html__('Leave empty to use the site name.', 'baselayer') ?></p>
				</td>
			</tr>
		</table>

		<h3 class="title" style="margin-top: 20px;"><?= esc_html__('Method', 'baselayer') ?></h3>
		<p class="description"><?= esc_html__('Choose how WordPress sends email.', 'baselayer') ?></p>
		<input type="hidden" name="baselayer_mailer" id="baselayer_mailer_input" value="<?= esc_attr($current_mailer) ?>">
		<div class="bl-tabs -form-table" data-bl-tabs style="margin-top: 20px;">
			<nav class="bl-tabs-nav" data-bl-tabs-nav role="tablist">
				<?php foreach ($bl_mailer_options as $value => $opt) : ?>
					<button type="button" class="button bl-tabs-btn bl-button-can-toggle has-icon <?= $current_mailer === $value ? 'active' : '' ?>" role="tab" aria-selected="<?= $current_mailer === $value ? 'true' : 'false' ?>" aria-controls="bl-mailer-panel-<?= esc_attr($value) ?>" data-bl-tabs-btn data-tab="<?= esc_attr($value) ?>" data-mailer-value="<?= esc_attr($value) ?>">
						<span class="bl-tab-button-icon">
							<?= $opt['icon'] ?>
						</span>
						<?= esc_html($opt['label']) ?>
					</button>
				<?php endforeach; ?>
			</nav>
			<div class="bl-tabs-panels" data-bl-tabs-panels>
				<div id="bl-mailer-panel-php" class="bl-tabs-panel <?= $current_mailer === 'php' ? 'bl-tabs-panel--active' : '' ?>" data-bl-tabs-panel role="tabpanel" data-tab="php" <?= $current_mailer === 'php' ? 'data-bl-tabs-panel-active="1"' : '' ?>>
					<p class="description"><?= esc_html__('Uses the WordPress default mail function (PHP mail()).', 'baselayer') ?></p>
					<p class="description"><?= esc_html__('No mail configuration is applied by the theme, so SMTP or mail plugins can override delivery.', 'baselayer') ?></p>
				</div>
				<div id="bl-mailer-panel-smtp" class="bl-tabs-panel <?= $current_mailer === 'smtp' ? 'bl-tabs-panel--active' : '' ?>" data-bl-tabs-panel role="tabpanel" data-tab="smtp" <?= $current_mailer === 'smtp' ? 'data-bl-tabs-panel-active="1"' : '' ?>>
					<div class="bl-form-row">
						<label for="baselayer_smtp_host" class="bl-input-label"><?= esc_html__('SMTP host', 'baselayer') ?></label>
						<input type="text" name="baselayer_smtp_host" id="baselayer_smtp_host" value="<?= esc_attr(get_option('baselayer_smtp_host', '')) ?>" class="regular-text" placeholder="smtp.example.com" style="width: 100%; max-width: 400px;">
					</div>
					<div class="bl-form-row">
						<label for="baselayer_smtp_port" class="bl-input-label"><?= esc_html__('Port', 'baselayer') ?></label>
						<input type="number" name="baselayer_smtp_port" id="baselayer_smtp_port" value="<?= esc_attr(get_option('baselayer_smtp_port', '587')) ?>" min="1" max="65535" class="small-text">
						<p class="description" style="margin-top: 4px;"><?= esc_html__('Common: 587 (TLS), 465 (SSL), 25 (none).', 'baselayer') ?></p>
					</div>
					<div class="bl-form-row">
						<label for="baselayer_smtp_encryption" class="bl-input-label"><?= esc_html__('Encryption', 'baselayer') ?></label>
						<select name="baselayer_smtp_encryption" id="baselayer_smtp_encryption" style="width: 100%; max-width: 400px;">
							<option value="none" <?= selected(get_option('baselayer_smtp_encryption', 'tls'), 'none', false) ?>><?= esc_html__('None', 'baselayer') ?></option>
							<option value="tls" <?= selected(get_option('baselayer_smtp_encryption', 'tls'), 'tls', false) ?>><?= esc_html__('TLS', 'baselayer') ?></option>
							<option value="ssl" <?= selected(get_option('baselayer_smtp_encryption', 'tls'), 'ssl', false) ?>><?= esc_html__('SSL', 'baselayer') ?></option>
						</select>
					</div>
					<div class="bl-form-row">
						<label for="baselayer_smtp_user" class="bl-input-label"><?= esc_html__('Username', 'baselayer') ?></label>
						<input type="text" name="baselayer_smtp_user" id="baselayer_smtp_user" value="<?= esc_attr(get_option('baselayer_smtp_user', '')) ?>" class="regular-text" autocomplete="username" style="width: 100%; max-width: 400px;">
					</div>
					<div class="bl-form-row">
						<label for="baselayer_smtp_pass" class="bl-input-label"><?= esc_html__('Password', 'baselayer') ?></label>
						<input type="password" name="baselayer_smtp_pass" id="baselayer_smtp_pass" value="" class="regular-text" autocomplete="new-password" placeholder="" style="width: 100%; max-width: 400px;">
						<p class="description"><?= esc_html__('Leave blank to keep current.', 'baselayer') ?></p>
					</div>
				</div>
				<div id="bl-mailer-panel-sendgrid" class="bl-tabs-panel <?= $current_mailer === 'sendgrid' ? 'bl-tabs-panel--active' : '' ?>" data-bl-tabs-panel role="tabpanel" data-tab="sendgrid" <?= $current_mailer === 'sendgrid' ? 'data-bl-tabs-panel-active="1"' : '' ?>>
					<div class="bl-form-row">
						<label for="baselayer_sendgrid_api_key" class="bl-input-label"><?= esc_html__('API key', 'baselayer') ?></label>
						<input type="password" name="baselayer_sendgrid_api_key" id="baselayer_sendgrid_api_key" value="<?= esc_attr(get_option('baselayer_sendgrid_api_key', '')) ?>" class="regular-text" autocomplete="off" style="width: 100%; max-width: 400px;">
						<p class="description" style="margin-top: 4px;"><?= esc_html__('Create an API key in the SendGrid dashboard with send permissions.', 'baselayer') ?></p>
					</div>
				</div>
			</div>
		</div>

		<script>
		(function() {
			var form = document.getElementById('bl-mail-delivery');
			if (!form) return;
			var input = document.getElementById('baselayer_mailer_input');
			var buttons = form.querySelectorAll('[data-mailer-value]');
			buttons.forEach(function(btn) {
				btn.addEventListener('click', function() {
					input.value = btn.getAttribute('data-mailer-value');
				});
			});
		})();
		</script>

		<div class="bl-submit-row">
			<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
		</div>
	</form>

	<hr class="bl-page-settings-divider">

	<form method="post" action="" class="bl-test-mail-form" id="bl-test-mail-form">
		<?php wp_nonce_field('baselayer_system_test_mail'); ?>
		<input type="hidden" name="baselayer_send_test_mail" value="1">
		<h3 class="title"><?= esc_html__('Test email', 'baselayer') ?></h3>
		<table class="form-table" role="presentation">
			<tr>
				<th scope="row"><label for="baselayer_test_mail_to"><?= esc_html__('Send to', 'baselayer') ?></label></th>
				<td>
					<input type="email" name="baselayer_test_mail_to" id="baselayer_test_mail_to" value="<?= esc_attr(function_exists('bl_developer_email') ? bl_developer_email() : get_option('baselayer_developer_email', '')) ?>" placeholder="<?= esc_attr(get_option('baselayer_developer_email', '')) ?>" class="regular-text" autocomplete="off" spellcheck="false">
					<p class="description"><?= esc_html__('Leave empty to use the developer email.', 'baselayer') ?></p>
				</td>
			</tr>
		</table>
		<div class="bl-submit-row">
			<button type="submit" name="baselayer_test_mail" class="button button-primary"><?= esc_html__('Send test email', 'baselayer') ?></button>
		</div>
	</form>
	<?php
}
