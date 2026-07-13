<?php

defined('ABSPATH') || exit;

$bl_developer_tab = 'security';
$bl_developer_page_slug = bl_developer_settings_page_slug($bl_developer_tab);

add_action('admin_menu', function () use ($bl_developer_tab, $bl_developer_page_slug) {
	if (!current_user_can('manage_options')) {
		return;
	}
	if (!function_exists('bl_is_developer_user') || !bl_is_developer_user((int) get_current_user_id())) {
		return;
	}
	$tabs = bl_developer_settings_available_tabs();
	if (!isset($tabs[$bl_developer_tab])) {
		return;
	}
	$label = $tabs[$bl_developer_tab]['label'];
	add_submenu_page(
		'options-general.php',
		__('Developer settings', 'baselayer') . ' – ' . $label,
		sprintf(__('Developer › %s', 'baselayer'), $label),
		'manage_options',
		$bl_developer_page_slug,
		'bl_render_developer_security',
		bl_developer_tab_position($bl_developer_tab)
	);
}, 20);

add_action('admin_init', function () use ($bl_developer_page_slug) {
	global $pagenow;
	if ($pagenow !== 'options-general.php' || $_SERVER['REQUEST_METHOD'] !== 'POST') {
		return;
	}
	if ((isset($_GET['page']) ? $_GET['page'] : '') !== $bl_developer_page_slug) {
		return;
	}
	if (!current_user_can('manage_options') || !function_exists('bl_is_developer_user') || !bl_is_developer_user((int) get_current_user_id())) {
		return;
	}
	$url = admin_url('options-general.php?page=fs-developer-security');

	// Password protection
	if (!empty($_POST['baselayer_save_password']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_security_password')) {
		$prot = function_exists('bl_sanitize_site_password_protection') ? bl_sanitize_site_password_protection($_POST['baselayer_site_password_protection'] ?? '') : '';
		update_option('baselayer_site_password_protection', $prot);
		set_transient('baselayer_security_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	// Maintenance mode
	if (!empty($_POST['baselayer_save_maintenance']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_security_maintenance')) {
		$mode = function_exists('bl_sanitize_maintenance_mode') ? bl_sanitize_maintenance_mode($_POST['baselayer_maintenance_mode'] ?? '') : '';
		update_option('baselayer_maintenance_mode', $mode);
		$title = function_exists('bl_sanitize_maintenance_title') ? bl_sanitize_maintenance_title($_POST['baselayer_maintenance_title'] ?? '') : '';
		update_option('baselayer_maintenance_title', $title);
		$desc = function_exists('bl_sanitize_maintenance_description') ? bl_sanitize_maintenance_description($_POST['baselayer_maintenance_description'] ?? '') : '';
		update_option('baselayer_maintenance_description', $desc);
		set_transient('baselayer_security_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	// Blocked IPs save
	if (!empty($_POST['baselayer_save_blocked_ips']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_security_blocked_ips')) {
		$raw = isset($_POST['baselayer_blocked_ips']) ? (string) wp_unslash($_POST['baselayer_blocked_ips']) : '';
		$lines = array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $raw, -1, PREG_SPLIT_NO_EMPTY)));
		$unique = array_unique($lines);
		update_option('baselayer_blocked_ips', implode("\n", $unique));
		set_transient('baselayer_security_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	// Clear failed login attempts list
	if (!empty($_POST['baselayer_clear_failed_logins']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_clear_failed_logins')) {
		if (function_exists('bl_blocked_ips_clear_failed')) {
			bl_blocked_ips_clear_failed();
		}
		set_transient('baselayer_security_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	// Clear suspicious auto-block for one IP
	if (!empty($_POST['baselayer_do_clear_auto_block']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_clear_auto_block_ip')) {
		$ip = isset($_POST['baselayer_clear_auto_block_ip']) ? sanitize_text_field(wp_unslash($_POST['baselayer_clear_auto_block_ip'])) : '';
		if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP) && function_exists('bl_blocked_ips_clear_suspicious_auto_block')) {
			bl_blocked_ips_clear_suspicious_auto_block($ip);
		}
		set_transient('baselayer_security_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	// Quick Block IP
	if (!empty($_POST['baselayer_do_block_ip']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_block_ip')) {
		$ip = isset($_POST['baselayer_block_ip']) ? sanitize_text_field(wp_unslash($_POST['baselayer_block_ip'])) : '';
		$current_ip = function_exists('bl_blocked_ips_visitor_ip') ? bl_blocked_ips_visitor_ip() : '';
		if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP) && $current_ip !== '' && $ip === $current_ip) {
			wp_safe_redirect(add_query_arg('bl_blocked_ips_error', 'own_ip', $url));
			exit;
		}
		if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP) && function_exists('bl_blocked_ips_add_blocked') && function_exists('bl_blocked_ips_remove_failed')) {
			bl_blocked_ips_add_blocked($ip);
			bl_blocked_ips_remove_failed($ip);
		}
		set_transient('baselayer_security_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}
}, 1);

function bl_render_developer_security(): void
{
	if (!current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'baselayer'));
	}

	$security_saved = get_transient('baselayer_security_saved');
	if ($security_saved !== false) {
		delete_transient('baselayer_security_saved');
	}

	$site_password_on = get_option('baselayer_site_password_protection') === '1';
	$site_password_hash = get_option('baselayer_site_password_hash', '');
	$maintenance_on = get_option('baselayer_maintenance_mode') === '1';
	?>
	<div class="wrap">
		<?php bl_developer_settings_screen_heading(); ?>
		<?php if ($security_saved !== false) : ?>
			<div class="notice notice-success is-dismissible">
				<p><strong><?= esc_html(__('Settings saved.', 'baselayer')) ?></strong></p>
			</div>
		<?php endif; ?>
		<?php if (isset($_GET['bl_blocked_ips_error']) && $_GET['bl_blocked_ips_error'] === 'own_ip') : ?>
			<div class="notice notice-error is-dismissible">
				<p><strong><?= esc_html(__('You cannot block your own IP address. That would lock you out of the site.', 'baselayer')) ?></strong></p>
			</div>
		<?php endif; ?>

		<?php bl_developer_settings_render_nav(); ?>

		<?php if (($site_password_on || $maintenance_on) && is_user_logged_in() && (current_user_can('edit_posts') || current_user_can('manage_options'))) : ?>
			<div class="notice notice-info inline" style="margin: 16px 0 0;">
				<p><?= esc_html__('Because you are logged in as an administrator or editor, you can still access the frontend. Open the site in a private or incognito window (or log out) to see the maintenance or password page.', 'baselayer') ?></p>
			</div>
		<?php endif; ?>
		<?php if ($site_password_on && $site_password_hash === '') : ?>
			<div class="notice notice-warning inline" style="margin: 16px 0 0;">
				<p><?= esc_html__('No password set. Set a password below to activate protection.', 'baselayer') ?></p>
			</div>
		<?php endif; ?>

		<form method="post" action="" class="fs-page-settings-form">
			<?php wp_nonce_field('baselayer_security_password'); ?>
			<input type="hidden" name="baselayer_save_password" value="1">
			<h2 class="title"><?= esc_html__('Password protection', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('When enabled, visitors must enter a password before viewing any part of the site.', 'baselayer') ?></p>
			<p class="description"><?= esc_html__('Logged-in administrators and editors skip the prompt.', 'baselayer') ?></p>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?= esc_html__('Activate', 'baselayer') ?></th>
					<td>
						<label>
							<input type="hidden" name="baselayer_site_password_protection" value="0">
							<input type="checkbox" name="baselayer_site_password_protection" value="1" <?= checked(get_option('baselayer_site_password_protection'), '1', false) ?>>
							<?= esc_html__('Activate password protection', 'baselayer') ?>
						</label>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="baselayer_site_password_new"><?= esc_html__('Password', 'baselayer') ?></label></th>
					<td>
						<input type="password" name="baselayer_site_password_new" id="baselayer_site_password_new" class="small-text" style="width: 220px;" value="<?= esc_attr(get_option('baselayer_site_password_plain', '')) ?>" autocomplete="new-password">
						<button type="button" class="button" data-fs-copy-from-source="baselayer_site_password_new" data-fs-copy-feedback-text="<?= esc_attr__('Copied!', 'baselayer') ?>"><?= esc_html__('Copy', 'baselayer') ?></button>
						<div style="margin-top: 8px;">
							<a class="fs-description-link -gray -has-icon" href="https://passwordcopy.app" target="_blank">
								<span class="fs-description-link-icon">
									<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
										<path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h560v-240q0-17 11.5-28.5T800-480q17 0 28.5 11.5T840-440v240q0 33-23.5 56.5T760-120H200Zm560-584L416-360q-11 11-28 11t-28-11q-11-11-11-28t11-28l344-344H600q-17 0-28.5-11.5T560-800q0-17 11.5-28.5T600-840h200q17 0 28.5 11.5T840-800v200q0 17-11.5 28.5T800-560q-17 0-28.5-11.5T760-600v-104Z" />
									</svg>
								</span>
								<span>passwordcopy.app</span>
							</a>
						</div>
						<p class="description">
							<?= esc_html__('Set or change the password. Leave blank and save to clear or reset the password.', 'baselayer') ?>
						</p>
					</td>
				</tr>
			</table>
			<div class="fs-submit-row">
				<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
			</div>
		</form>

		<hr class="fs-page-settings-divider">

		<form method="post" action="" class="fs-page-settings-form">
			<?php wp_nonce_field('baselayer_security_maintenance'); ?>
			<input type="hidden" name="baselayer_save_maintenance" value="1">
			<h2 class="title"><?= esc_html__('Maintenance mode', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('When enabled, the entire frontend is blocked with HTTP 503.', 'baselayer') ?></p>
			<p class="description"><?= esc_html__('Logged-in administrators and editors can still view the site.', 'baselayer') ?></p>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?= esc_html__('Activate', 'baselayer') ?></th>
					<td>
						<label>
							<input type="hidden" name="baselayer_maintenance_mode" value="0">
							<input type="checkbox" name="baselayer_maintenance_mode" value="1" <?= checked(get_option('baselayer_maintenance_mode'), '1', false) ?>>
							<?= esc_html__('Enable maintenance mode', 'baselayer') ?>
						</label>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="baselayer_maintenance_title"><?= esc_html__('Title', 'baselayer') ?></label></th>
					<td>
						<input type="text" name="baselayer_maintenance_title" id="baselayer_maintenance_title" value="<?= esc_attr(get_option('baselayer_maintenance_title', '')) ?>" class="regular-text" placeholder="<?= esc_attr__('Maintenance', 'baselayer') ?>">
						<p class="description"><?= esc_html__('Heading shown on the maintenance page. Leave blank for default.', 'baselayer') ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="baselayer_maintenance_description"><?= esc_html__('Description', 'baselayer') ?></label></th>
					<td>
						<textarea name="baselayer_maintenance_description" id="baselayer_maintenance_description" rows="3" class="regular-text" placeholder="<?= esc_attr__('We are currently performing scheduled maintenance. Please check back shortly.', 'baselayer') ?>" style="display: block;"><?= esc_textarea(get_option('baselayer_maintenance_description', '')) ?></textarea>
						<p class="description"><?= esc_html__('Short message shown below the title. Leave blank for default.', 'baselayer') ?></p>
					</td>
				</tr>
			</table>
			<div class="fs-submit-row">
				<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
			</div>
		</form>

		<?php if (function_exists('bl_theme_feature_enabled') && bl_theme_feature_enabled('blocked_ips')) : ?>
			<hr class="fs-page-settings-divider">
			<form id="fs-security-blocked-ips" method="post" action="" class="fs-page-settings-form">
				<?php wp_nonce_field('baselayer_security_blocked_ips'); ?>
				<input type="hidden" name="baselayer_save_blocked_ips" value="1">
				<h2 class="title"><?= esc_html__('Blocked IP addresses', 'baselayer') ?></h2>
				<p class="description"><?= esc_html__('One IP address per line. Supports single IPs, CIDR ranges, or wildcards.', 'baselayer') ?></p>
				<p class="description" style="color: #b32d2e;"><?= esc_html__('Be careful when blocking IP addresses. Incorrect rules may lock you out of your own site.', 'baselayer') ?></p>
				<?php
				$current_ip = function_exists('bl_blocked_ips_visitor_ip') ? bl_blocked_ips_visitor_ip() : '';
				?>
				<?php if ($current_ip !== '' && filter_var($current_ip, FILTER_VALIDATE_IP)) : ?>
					<p class="description" style="margin-top: 8px;">
						<?= esc_html__('Your current IP address:', 'baselayer') ?>
						<code class="fs-code-small"><?= esc_html($current_ip) ?></code>
					</p>
				<?php else : ?>
					<p class="description" style="margin-top: 8px;"><?= esc_html__('Your current IP address could not be detected.', 'baselayer') ?></p>
				<?php endif; ?>
				<div style="display: block; margin-top: 16px; margin-bottom: -8px;">
					<textarea name="baselayer_blocked_ips" id="baselayer_blocked_ips" rows="5" class="regular-text code fs-code-small"><?= esc_textarea(get_option('baselayer_blocked_ips', '')) ?></textarea>
				</div>
				<div class="fs-submit-row">
					<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
				</div>
			</form>

			<hr class="fs-page-settings-divider">

			<h2 class="title" id="fs-security-failed-logins"><?= esc_html__('Failed login attempts', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('Shows recent failed login attempts. IPs that reach the threshold (set in theme config) are temporarily blocked from the whole site.', 'baselayer') ?></p>
			<?php
			$failed = function_exists('bl_blocked_ips_get_failed_attempts') ? bl_blocked_ips_get_failed_attempts(true) : [];
			$suspicious_config = function_exists('bl_blocked_ips_suspicious_config') ? bl_blocked_ips_suspicious_config() : [
				'enabled' => true,
				'attempts' => 10,
				'window_minutes' => 30,
				'lockout_minutes' => 1440,
			];
			$threshold_attempts = (int) $suspicious_config['attempts'];
			$threshold_seconds = (int) $suspicious_config['window_minutes'] * 60;
			?>
			<?php if (empty($failed)) : ?>
				<p class="description" style="font-style: italic; color: #a7aaad; margin-top: 16px;"><?= esc_html__('No failed login attempts recorded.', 'baselayer') ?></p>
			<?php else : ?>
				<table class="widefat striped" style="margin-top: 16px;">
					<thead>
						<tr>
							<th style="white-space: nowrap;"><?= esc_html__('IP address', 'baselayer') ?></th>
							<th style="white-space: nowrap;"><?= esc_html__('Attempts', 'baselayer') ?></th>
							<th style="white-space: nowrap;"><?= esc_html__('Last attempt', 'baselayer') ?></th>
							<th style="white-space: nowrap;"><?= esc_html__('Auto-block', 'baselayer') ?></th>
							<th style="white-space: nowrap;"></th>
						</tr>
					</thead>
					<tbody>
						<?php
						uasort($failed, function ($a, $b) {
							return ($b['last'] ?? 0) - ($a['last'] ?? 0);
						});
						foreach ($failed as $ip => $row) :
							$attempts = (int) ($row['attempts'] ?? 0);
							$last = (int) ($row['last'] ?? 0);
							$within_window = (time() - $last) <= $threshold_seconds;
							$show_block = $attempts >= $threshold_attempts && $within_window;
							$until = (int) ($row['blocked_until'] ?? 0);
							if ($until <= 0 && function_exists('bl_blocked_ips_is_suspicious_locked') && bl_blocked_ips_is_suspicious_locked($ip) && function_exists('bl_blocked_ips_suspicious_lock_key')) {
								$raw = get_transient(bl_blocked_ips_suspicious_lock_key($ip));
								$until = $raw !== false ? (int) $raw : 0;
							}
							$block_note = '';
							if ($until > time()) {
								$mins = (int) ($row['lockout_minutes'] ?? $suspicious_config['lockout_minutes'] ?? 0);
								$total_label = $mins > 0 && function_exists('bl_blocked_ips_format_lockout_human')
									? bl_blocked_ips_format_lockout_human($mins)
									: '';
								$remaining = sprintf(
									/* translators: %s: human time until block ends */
									__('ends in %s', 'baselayer'),
									human_time_diff(time(), $until)
								);
								$block_note = $total_label !== ''
									? sprintf(
										/* translators: 1: total block duration, 2: time until end */
										__('%1$s (%2$s)', 'baselayer'),
										$total_label,
										$remaining
									)
									: $remaining;
							} elseif ($show_block && empty($suspicious_config['enabled'])) {
								$block_note = __('Threshold met. Auto-block is disabled in theme config.', 'baselayer');
							} else {
								$block_note = '–';
							}
							$show_clear_auto = ($until > time())
								|| (function_exists('bl_blocked_ips_is_suspicious_locked') && bl_blocked_ips_is_suspicious_locked($ip));
						?>
							<tr>
								<td style="vertical-align: middle; white-space: nowrap;"><code class="fs-code-small"><?= esc_html($ip) ?></code></td>
								<td style="vertical-align: middle; white-space: nowrap;"><?= (int) $attempts ?> <?= esc_html(_n('attempt', 'attempts', $attempts, 'baselayer')) ?></td>
								<td style="vertical-align: middle; white-space: nowrap;"><?= $last ? esc_html(sprintf(__('%s ago', 'baselayer'), human_time_diff($last, time()))) : '–' ?></td>
								<td style="vertical-align: middle;"><?= $block_note === '–' ? '–' : esc_html($block_note) ?></td>
								<td style="vertical-align: middle;">
									<?php if ($show_clear_auto) : ?>
										<form method="post" action="" style="display: inline-block; margin-right: 6px; margin-bottom: 4px;">
											<?php wp_nonce_field('baselayer_clear_auto_block_ip'); ?>
											<input type="hidden" name="baselayer_clear_auto_block_ip" value="<?= esc_attr($ip) ?>">
											<button type="submit" name="baselayer_do_clear_auto_block" value="1" class="button button-small"><?= esc_html__('Clear auto-block', 'baselayer') ?></button>
										</form>
									<?php endif; ?>
									<?php if ($show_block) : ?>
										<form method="post" action="" style="display: inline-block; margin-bottom: 4px;">
											<?php wp_nonce_field('baselayer_block_ip'); ?>
											<input type="hidden" name="baselayer_block_ip" value="<?= esc_attr($ip) ?>">
											<button type="submit" name="baselayer_do_block_ip" value="1" class="button button-small"><?= esc_html__('Block permanently', 'baselayer') ?></button>
										</form>
									<?php endif; ?>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
				<p style="margin-top: 12px;">
					<form method="post" action="" style="display: inline;">
						<?php wp_nonce_field('baselayer_clear_failed_logins'); ?>
						<button type="submit" name="baselayer_clear_failed_logins" value="1" class="button"><?= esc_html__('Clear list', 'baselayer') ?></button>
					</form>
				</p>
			<?php endif; ?>
		<?php endif; ?>

	</div>
	<?php
}
