<?php

defined('ABSPATH') || exit;

/**
 * @param array{today: int, yesterday: int} $counts
 * @return array{today: string, yesterday: string}
 */
function bl_dashboard_matomo_stats_format_lines(array $counts): array
{
	return [
		'today'     => bl_format_visit_count((int) $counts['today']),
		'yesterday' => bl_format_visit_count((int) $counts['yesterday']),
	];
}

/**
 * Remove WordPress Events and News panel
 */
add_action('wp_dashboard_setup', function () {
	remove_meta_box('dashboard_primary', 'dashboard', 'side');
	wp_add_dashboard_widget(
		'bl_dashboard_panel_widget',
		__('FromScratch', 'baselayer'),
		'bl_dashboard_panel_widget_render',
		null,
		null,
		'normal',
		'high'
	);
}, 20);

/**
 * Keep custom dashboard panel in first position by default.
 */
add_filter('get_user_option_meta-box-order_dashboard', function ($value, $user_id) {
	if (!is_user_logged_in()) {
		return $value;
	}

	$widget_id = 'bl_dashboard_panel_widget';
	$default_order = [
		'normal' => $widget_id,
		'side'   => '',
	];

	if (is_array($value) && $value !== []) {
		return $value;
	}

	if (is_string($value) && $value !== '') {
		return $value;
	}

	if ($value === false || $value === null || $value === '' || $value === []) {
		return $default_order;
	}

	// Respect each user's saved drag/drop layout once it exists.
	return $value;
}, 10, 2);

/**
 * Add a custom welcome panel
 */
function bl_dashboard_panel()
{
	$is_developer = function_exists('bl_is_developer_user') && bl_is_developer_user((int) get_current_user_id());
	$is_admin = current_user_can('manage_options');
	$can_view_widget_notices = $is_developer;
	$can_view_theme_settings = $is_admin || $is_developer;
	$can_view_stats = function_exists('bl_dashboard_can_access_statistics') && bl_dashboard_can_access_statistics();
	$system_url = admin_url('options-general.php?page=' . bl_developer_settings_page_slug('system') . '#fs-search-visibility');
	$security_url = admin_url('options-general.php?page=fs-developer-security');
	$stats_url = bl_dashboard_statistics_url();
	$dash_placeholder = html_entity_decode('&#8211;', ENT_QUOTES | ENT_HTML5, 'UTF-8');

	$matomo_counts = bl_dashboard_matomo_stats_get_cached_counts();
	$matomo_stats_cached = is_array($matomo_counts);
	if ($matomo_stats_cached) {
		$matomo_lines = bl_dashboard_matomo_stats_format_lines($matomo_counts);
		$matomo_today_html = $matomo_lines['today'];
		$matomo_yesterday_html = $matomo_lines['yesterday'];
	} else {
		$matomo_today_html = $dash_placeholder;
		$matomo_yesterday_html = $dash_placeholder;
	}

	$expect_matomo_refresh = !$matomo_stats_cached
		|| (
			function_exists('bl_dashboard_matomo_dashboard_counts_need_full_refresh')
			&& bl_dashboard_matomo_dashboard_counts_need_full_refresh()
		);

	$scheduled = get_posts([
		'post_type'      => bl_theme_post_types(),
		'post_status'    => 'future',
		'posts_per_page' => 5,
		'orderby'        => 'date',
		'order'          => 'ASC',
	]);

	$expiring_published = [];
	if (
		function_exists('bl_theme_feature_enabled')
		&& bl_theme_feature_enabled('post_expirator')
		&& defined('BL_EXPIRATION_META_KEY')
		&& defined('BL_EXPIRATION_ENABLED_KEY')
	) {
		$expiring_published = get_posts([
			'post_type'      => bl_theme_post_types(),
			'post_status'    => 'publish',
			'posts_per_page' => 5,
			'orderby'        => 'meta_value',
			'meta_key'       => BL_EXPIRATION_META_KEY,
			'order'          => 'ASC',
			'meta_query'     => [
				'relation' => 'AND',
				[
					'key'   => BL_EXPIRATION_ENABLED_KEY,
					'value' => '1',
				],
				[
					'key'     => BL_EXPIRATION_META_KEY,
					'compare' => '!=',
					'value'   => '',
				],
			],
		]);
	}

	$pinned_pages = [];
	if (defined('BL_PIN_TO_DASHBOARD_META') && function_exists('bl_pin_to_dashboard_post_types')) {
		$pin_types = bl_pin_to_dashboard_post_types();
		if ($pin_types !== []) {
			$pinned_pages = get_posts([
				'post_type' => $pin_types,
				'post_status' => 'publish',
				'posts_per_page' => -1,
				'orderby' => 'title',
				'order' => 'ASC',
				'meta_query' => [
					[
						'key' => BL_PIN_TO_DASHBOARD_META,
						'value' => '1',
						'compare' => '=',
					],
				],
			]);
		}
	}
?>
	<div class="fs-dashboard__panel">

		<p class="fs-dashboard__description">
			A developer-first foundation built for flexibility and control.<br>
			Crafted with care by <a href="https://stephanwagner.me" target="_blank" rel="noopener">Stephan Wagner</a> from <a href="https://bytesandstripes.com/en" target="_blank" rel="noopener">bytes and stripes</a>.
		</p>

		<?php
		if ($can_view_widget_notices && bl_theme_feature_enabled('blocked_ips')) {
			$suspicious_ips = function_exists('bl_blocked_ips_suspicious_list') ? bl_blocked_ips_suspicious_list() : [];
			if (!empty($suspicious_ips)) :
		?>
				<div class="notice notice-warning inline" style="margin: 16px 0;">
					<p style="margin-bottom: 6px"><strong><?php esc_html_e('Suspicious login attempts', 'baselayer'); ?></strong></p>
					<p style="margin-top: 0"><?php esc_html_e('The following IPs exceeded the configured threshold.', 'baselayer'); ?></p>
					<ul style="list-style: none; padding-left: 0; margin: 8px 0;">
						<?php foreach ($suspicious_ips as $ip => $row) :
							$attempts = (int) ($row['attempts'] ?? 0);
							$until = (int) ($row['effective_blocked_until'] ?? $row['blocked_until'] ?? 0);
							$block_hint = '';
							if ($until > time()) {
								$mins = (int) ($row['lockout_minutes'] ?? 0);
								if ($mins > 0 && function_exists('bl_blocked_ips_format_lockout_human')) {
									$dur = bl_blocked_ips_format_lockout_human($mins);
									$block_hint = sprintf(
										/* translators: 1: block duration, 2: time until block ends */
										__('blocked %1$s, ends in %2$s', 'baselayer'),
										$dur,
										human_time_diff(time(), $until)
									);
								} else {
									$block_hint = sprintf(
										/* translators: %s: human time until block ends */
										__('site block ends in %s', 'baselayer'),
										human_time_diff(time(), $until)
									);
								}
							}
						?>
							<li style="margin-bottom: 8px">
								<code class="code fs-code-small"><?php echo esc_html($ip); ?></code> – <?php echo esc_html($block_hint); ?>
							</li>
						<?php endforeach; ?>
					</ul>
					<p style="margin-top: 8px;"><a href="<?php echo esc_url($security_url); ?>#fs-security-blocked-ips"><?php esc_html_e('Manage in Developer → Security', 'baselayer'); ?></a></p>
				</div>
		<?php
			endif;
		}
		?>

		<?php if ($can_view_widget_notices && (int) get_option('blog_public', 1) === 0) : ?>
			<div class="notice notice-warning inline" style="margin: 16px 0;">
				<p><strong><?php esc_html_e('Search engines are asked not to index this site.', 'baselayer'); ?></strong></p>
				<p><a href="<?php echo esc_url($system_url); ?>"><?php esc_html_e('Enable search engine indexing in Developer → System', 'baselayer'); ?></a></p>
			</div>
		<?php endif; ?>

		<?php if ($can_view_widget_notices && get_option('baselayer_site_password_protection') === '1') : ?>
			<div class="notice notice-info inline" style="margin: 16px 0;">
				<p><strong><?php esc_html_e('Password protection is active.', 'baselayer'); ?></strong></p>
				<p><a href="<?php echo esc_url($security_url); ?>"><?php esc_html_e('Manage in Developer → Security', 'baselayer'); ?></a></p>
			</div>
		<?php endif; ?>

		<?php if ($can_view_widget_notices && get_option('baselayer_maintenance_mode') === '1') : ?>
			<div class="notice notice-info inline" style="margin: 16px 0;">
				<p><strong><?php esc_html_e('Maintenance mode is active.', 'baselayer'); ?></strong></p>
				<p><a href="<?php echo esc_url($security_url); ?>"><?php esc_html_e('Manage in Developer → Security', 'baselayer'); ?></a></p>
			</div>
		<?php endif; ?>

		<div class="fs-dashboard__sections -flex">

			<div class="fs-dashboard__section -links">
				<div class="fs-dashboard__section-title"><?= esc_html__('Quick links', 'baselayer') ?></div>
				<ul class="fs-dashboard__section-list -limit">
					<?php if ($can_view_theme_settings) : ?>
						<li><a href="<?= esc_url(admin_url('options-general.php?page=fs-theme-settings')) ?>"><?= esc_html__('Theme settings', 'baselayer') ?></a></li>
					<?php endif; ?>
					<?php if ($is_developer) : ?>
						<li><a href="<?= esc_url(admin_url('options-general.php?page=' . bl_developer_settings_page_slug('developer'))) ?>"><?= esc_html__('Developer settings', 'baselayer') ?></a></li>
					<?php endif; ?>
					<?php if (function_exists('bl_content_type_enabled') && bl_content_type_enabled('post') && current_user_can('edit_posts')) : ?>
						<li><a href="<?= esc_url(admin_url('post-new.php?post_type=post')) ?>"><?= esc_html__('Create post', 'baselayer') ?></a></li>
					<?php endif; ?>
					<?php if (current_user_can('edit_pages')) : ?>
						<li><a href="<?= esc_url(admin_url('post-new.php?post_type=page')) ?>"><?= esc_html__('Create page', 'baselayer') ?></a></li>
					<?php endif; ?>
				</ul>
			</div>

			<?php if (bl_theme_feature_enabled('matomo') && $can_view_stats) : ?>
				<div
					class="fs-dashboard__section -stats"
					data-fs-dashboard-stats
					data-fs-stats-cached="<?= $matomo_stats_cached ? '1' : '0' ?>"
					data-fs-expect-matomo-refresh="<?= $expect_matomo_refresh ? '1' : '0' ?>"
					data-fs-stats-loading="<?= $expect_matomo_refresh ? '1' : '0' ?>"
				>
					<div class="fs-dashboard__section-title">
						<?= esc_html__('Analytics', 'baselayer') ?>
						<span class="fs-dashboard__stats-spinner" aria-hidden="true"></span>
					</div>
					<ul class="fs-dashboard__section-list -limit">
						<li>
							<strong><?= esc_html__('Today', 'baselayer') ?>:</strong>
							<span data-fs-stat="today"><?= esc_html($matomo_today_html) ?></span>
						</li>
						<li>
							<strong><?= esc_html__('Yesterday', 'baselayer') ?>:</strong>
							<span data-fs-stat="yesterday"><?= esc_html($matomo_yesterday_html) ?></span>
						</li>
						<li>
							<a href="<?= esc_url($stats_url) ?>"><?= esc_html__('Open analytics', 'baselayer') ?></a>
						</li>
					</ul>
				</div>
			<?php endif; ?>
		</div>

		<?php if (!empty($pinned_pages)) : ?>
			<div class="fs-dashboard__section -pinned -margin">
				<div class="fs-dashboard__section-title"><?= esc_html__('Pinned posts', 'baselayer') ?></div>
				<table class="fs-dashboard__section-table">
					<?php foreach ($pinned_pages as $pinned) : ?>
						<?php
						$pinned_post_type = get_post_type((int) $pinned->ID);
						$pinned_post_type_object = is_string($pinned_post_type) ? get_post_type_object($pinned_post_type) : null;
						if ($pinned_post_type === 'post') {
							$pinned_type_label = __('Post', 'baselayer');
						} elseif ($pinned_post_type === 'page') {
							$pinned_type_label = __('Page', 'baselayer');
						} else {
							$pinned_type_label = $pinned_post_type_object instanceof WP_Post_Type
								? (string) __($pinned_post_type_object->labels->singular_name ?: $pinned_post_type_object->label, 'baselayer')
								: __('Content', 'baselayer');
						}
						?>
						<tr>
							<td class="fs-dashboard__section-cell -type">
								<?= esc_html($pinned_type_label) ?>
							</td>
							<td class="fs-dashboard__section-cell -preview">
								<a href="<?= esc_url(get_permalink($pinned->ID)) ?>" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h560v-240q0-17 11.5-28.5T800-480q17 0 28.5 11.5T840-440v240q0 33-23.5 56.5T760-120H200Zm560-584L416-360q-11 11-28 11t-28-11q-11-11-11-28t11-28l344-344H600q-17 0-28.5-11.5T560-800q0-17 11.5-28.5T600-840h200q17 0 28.5 11.5T840-800v200q0 17-11.5 28.5T800-560q-17 0-28.5-11.5T760-600v-104Z"/></svg></a>
							</td>
							<td class="fs-dashboard__section-cell -title">
								<a href="<?= esc_url(get_edit_post_link($pinned->ID)) ?>"><?= esc_html(get_the_title($pinned->ID) ?: __('(no title)', 'baselayer')) ?></a><br>
							</td>
						</tr>
					<?php endforeach; ?>
				</table>
			</div>
		<?php endif; ?>

		<?php if (!empty($scheduled)) : ?>
			<div class="fs-dashboard__section -margin">
				<div class="fs-dashboard__section-title"><?= esc_html__('Scheduled posts', 'baselayer') ?></div>
				<table class="fs-dashboard__section-table">
					<?php foreach ($scheduled as $item) : ?>
						<tr>
							<td class="fs-dashboard__section-cell -date">
								<?= esc_html(get_date_from_gmt((string) $item->post_date_gmt, get_option('date_format') . ' ' . get_option('time_format'))) ?>
							</td>
							<td class="fs-dashboard__section-cell -preview">
								<a href="<?= esc_url(get_permalink($pinned->ID)) ?>" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h560v-240q0-17 11.5-28.5T800-480q17 0 28.5 11.5T840-440v240q0 33-23.5 56.5T760-120H200Zm560-584L416-360q-11 11-28 11t-28-11q-11-11-11-28t11-28l344-344H600q-17 0-28.5-11.5T560-800q0-17 11.5-28.5T600-840h200q17 0 28.5 11.5T840-800v200q0 17-11.5 28.5T800-560q-17 0-28.5-11.5T760-600v-104Z"/></svg></a>
							</td>
							<td class="fs-dashboard__section-cell -title">
								<a href="<?= esc_url(get_edit_post_link((int) $item->ID)) ?>"><?= esc_html(get_the_title((int) $item->ID) ?: __('(no title)', 'baselayer')) ?></a>
							</td>
						</tr>
					<?php endforeach; ?>
				</table>
			</div>
		<?php endif; ?>

		<?php if (!empty($expiring_published)) : ?>
			<div class="fs-dashboard__section -margin">
				<div class="fs-dashboard__section-title"><?= esc_html__('Expiring posts', 'baselayer') ?></div>
				<table class="fs-dashboard__section-table">
					<?php
					foreach ($expiring_published as $item) :
						$exp_raw = get_post_meta((int) $item->ID, BL_EXPIRATION_META_KEY, true);
						$exp_label = is_string($exp_raw) ? $exp_raw : '';
						if ($exp_raw !== '' && preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $exp_raw)) {
							$tz = function_exists('wp_timezone') ? wp_timezone() : new \DateTimeZone(wp_timezone_string() ?: 'UTC');
							$dt = \DateTimeImmutable::createFromFormat('Y-m-d H:i', $exp_raw, $tz);
							if ($dt instanceof \DateTimeImmutable) {
								$exp_label = wp_date(get_option('date_format') . ' ' . get_option('time_format'), $dt->getTimestamp());
							}
						}
					?>
						<tr>
							<td class="fs-dashboard__section-cell -date">
								<?= $exp_label ?>
							</td>
							<td class="fs-dashboard__section-cell -preview">
								<a href="<?= esc_url(get_permalink($pinned->ID)) ?>" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h560v-240q0-17 11.5-28.5T800-480q17 0 28.5 11.5T840-440v240q0 33-23.5 56.5T760-120H200Zm560-584L416-360q-11 11-28 11t-28-11q-11-11-11-28t11-28l344-344H600q-17 0-28.5-11.5T560-800q0-17 11.5-28.5T600-840h200q17 0 28.5 11.5T840-800v200q0 17-11.5 28.5T800-560q-17 0-28.5-11.5T760-600v-104Z"/></svg></a>
							</td>
							<td class="fs-dashboard__section-cell -title">
								<a href="<?= esc_url(get_edit_post_link((int) $item->ID)) ?>"><?= esc_html(get_the_title((int) $item->ID) ?: __('(no title)', 'baselayer')) ?></a>
							</td>
						</tr>
					<?php endforeach; ?>
				</table>
			</div>
		<?php endif; ?>

	</div>
<?php
}
/**
 * Dashboard widget renderer.
 */
function bl_dashboard_panel_widget_render(): void
{
	echo '<div class="fs-dashboard__widget">';
	bl_dashboard_panel();
	echo '</div>';
}

/**
 * Load Matomo visit counts after dashboard paint (non-blocking).
 */
function bl_dashboard_enqueue_matomo_stats(string $hook_suffix): void
{
	if ($hook_suffix !== 'index.php') {
		return;
	}
	if (!(function_exists('bl_dashboard_can_access_statistics') && bl_dashboard_can_access_statistics())) {
		return;
	}
	wp_register_script('fs-dashboard-matomo', false, [], null, true);
	wp_enqueue_script('fs-dashboard-matomo');
	wp_localize_script('fs-dashboard-matomo', 'fsDashboardMatomo', [
		'ajaxUrl'             => admin_url('admin-ajax.php'),
		'nonce'               => wp_create_nonce('bl_dashboard_matomo_stats'),
		'pollPendingMs'       => 2500,
		'pollPendingMaxPolls' => 48,
	]);
	$inline = <<<'JS'
(function () {
	document.addEventListener('DOMContentLoaded', function () {
		var cfg = typeof fsDashboardMatomo !== 'undefined' ? fsDashboardMatomo : null;
		var wrap = document.querySelector('[data-fs-dashboard-stats]');
		if (!wrap || !cfg) {
			return;
		}
		var pendMs = cfg.pollPendingMs || 2500;
		var pendMax = cfg.pollPendingMaxPolls || 48;
		var pendTimer = null;
		var pendPolls = 0;

		function setStatsLoading(on) {
			wrap.setAttribute('data-fs-stats-loading', on ? '1' : '0');
		}

		function fetchStatsBody() {
			var params = new URLSearchParams();
			params.append('action', 'bl_dashboard_matomo_stats');
			params.append('nonce', cfg.nonce);
			return fetch(cfg.ajaxUrl, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
				body: params.toString()
			}).then(function (r) {
				return r.json();
			});
		}

		function applyStats(res) {
			if (!res || !res.success || !res.data) {
				return false;
			}
			var d = res.data;
			var t = wrap.querySelector('[data-fs-stat="today"]');
			var y = wrap.querySelector('[data-fs-stat="yesterday"]');
			if (d.pending) {
				if (t && d.today != null) {
					t.textContent = d.today;
				}
				if (y && d.yesterday != null) {
					y.textContent = d.yesterday;
				}
				return false;
			}
			if (t && d.today != null) {
				t.textContent = d.today;
			}
			if (y && d.yesterday != null) {
				y.textContent = d.yesterday;
			}
			wrap.setAttribute('data-fs-stats-cached', '1');
			return true;
		}

		function stopPendingPoll() {
			if (pendTimer) {
				clearInterval(pendTimer);
				pendTimer = null;
			}
			pendPolls = 0;
		}

		function startPendingPoll() {
			if (pendTimer) {
				return;
			}
			pendPolls = 0;
			pendTimer = setInterval(function () {
				pendPolls += 1;
				if (pendPolls > pendMax) {
					stopPendingPoll();
					setStatsLoading(false);
					return;
				}
				setStatsLoading(true);
				fetchStatsBody().then(function (res) {
					if (applyStats(res)) {
						stopPendingPoll();
						setStatsLoading(false);
					}
				});
			}, pendMs);
		}

		function fetchStats() {
			var expectRefresh = wrap.getAttribute('data-fs-expect-matomo-refresh') === '1';
			if (expectRefresh) {
				setStatsLoading(true);
			}
			fetchStatsBody().then(function (res) {
				var ok = applyStats(res);
				if (ok) {
					setStatsLoading(false);
					return;
				}
				if (res && res.success && res.data && res.data.pending) {
					setStatsLoading(true);
					startPendingPoll();
					return;
				}
				setStatsLoading(false);
			}).catch(function () {
				setStatsLoading(false);
			});
		}

		fetchStats();
	});
})();
JS;
	wp_add_inline_script('fs-dashboard-matomo', $inline);
}

add_action('admin_enqueue_scripts', 'bl_dashboard_enqueue_matomo_stats', 20);

/**
 * @param mixed $raw Option row with today/yesterday.
 * @return array{today: int, yesterday: int}|null
 */
function bl_dashboard_matomo_stats_normalize_stored_counts($raw): ?array
{
	if (!is_array($raw) || !array_key_exists('today', $raw) || !array_key_exists('yesterday', $raw)) {
		return null;
	}

	return [
		'today'     => (int) $raw['today'],
		'yesterday' => (int) $raw['yesterday'],
	];
}

/**
 * Last known today/yesterday counts for the dashboard widget (persists until Matomo sync updates them).
 *
 * @return array{today: int, yesterday: int}|null Null only when no snapshot exists yet.
 */
function bl_dashboard_matomo_stats_get_cached_counts(): ?array
{
	if (!defined('BL_MATOMO_DASHBOARD_VISITS_OPTION')) {
		return null;
	}

	$opt = get_option(BL_MATOMO_DASHBOARD_VISITS_OPTION, null);
	$norm = bl_dashboard_matomo_stats_normalize_stored_counts($opt);
	if ($norm !== null) {
		return $norm;
	}

	return null;
}

/**
 * When the stored daily series end date is behind site "today", queue a background Matomo refresh (non-blocking).
 */
function bl_dashboard_matomo_stats_maybe_schedule_refresh(): void
{
	if (!defined('BL_MATOMO_DASHBOARD_VISITS_OPTION') || !function_exists('bl_matomo_statistics_refresh_full')) {
		return;
	}

	$opt = get_option(BL_MATOMO_DASHBOARD_VISITS_OPTION, null);
	if (!is_array($opt)) {
		return;
	}

	$site_today = wp_date('Y-m-d');
	$end = isset($opt['series_end_date']) ? (string) $opt['series_end_date'] : '';
	if ($end !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $end) && $end >= $site_today) {
		return;
	}

	bl_dashboard_matomo_stats_schedule_background_refresh();
}

/**
 * Queue a wp-cron run to fetch all Matomo statistics (does not block the current HTTP response).
 */
function bl_dashboard_matomo_stats_schedule_background_refresh(): void
{
	if (!function_exists('bl_matomo_statistics_refresh_full') || !defined('BL_MATOMO_BACKGROUND_REFRESH_LOCK')) {
		return;
	}
	if (get_transient(BL_MATOMO_BACKGROUND_REFRESH_LOCK)) {
		if (function_exists('spawn_cron')) {
			spawn_cron();
		}

		return;
	}
	set_transient(BL_MATOMO_BACKGROUND_REFRESH_LOCK, '1', 90);
	wp_schedule_single_event(time(), 'bl_matomo_background_statistics_refresh');
	if (function_exists('spawn_cron')) {
		spawn_cron();
	}
}

/** Remove obsolete hourly Matomo cron event if present (on-demand refresh replaced it). */
add_action('init', function (): void {
	if (wp_installing()) {
		return;
	}
	while (($t = wp_next_scheduled('bl_dashboard_matomo_stats_hourly')) !== false) {
		wp_unschedule_event((int) $t, 'bl_dashboard_matomo_stats_hourly');
	}
}, 25);

/**
 * AJAX: formatted visit lines for dashboard (Matomo). Uses persistent snapshot; schedules refresh when stale (non-blocking).
 */
function bl_dashboard_ajax_matomo_stats(): void
{
	check_ajax_referer('bl_dashboard_matomo_stats', 'nonce');
	if (!(function_exists('bl_dashboard_can_access_statistics') && bl_dashboard_can_access_statistics())) {
		wp_send_json_error(null, 403);
	}

	$counts = bl_dashboard_matomo_stats_get_cached_counts();
	if ($counts !== null) {
		if (function_exists('bl_dashboard_matomo_dashboard_counts_need_full_refresh') && bl_dashboard_matomo_dashboard_counts_need_full_refresh()) {
			bl_matomo_statistics_refresh_full();
			$after = bl_dashboard_matomo_stats_get_cached_counts();
			if ($after !== null) {
				$counts = $after;
			}
		}
		bl_dashboard_matomo_stats_maybe_schedule_refresh();
		wp_send_json_success(bl_dashboard_matomo_stats_format_lines($counts));

		return;
	}

	// No snapshot yet: fetch in this request so the dashboard works without wp-cron (e.g. DISABLE_WP_CRON).
	if (
		function_exists('bl_dashboard_matomo_settings')
		&& bl_dashboard_matomo_settings() !== null
		&& function_exists('bl_matomo_statistics_refresh_full')
	) {
		bl_matomo_statistics_refresh_full();
		$counts = bl_dashboard_matomo_stats_get_cached_counts();
		if ($counts !== null) {
			wp_send_json_success(bl_dashboard_matomo_stats_format_lines($counts));

			return;
		}
	}

	bl_dashboard_matomo_stats_schedule_background_refresh();
	$dash = html_entity_decode('&#8211;', ENT_QUOTES | ENT_HTML5, 'UTF-8');
	wp_send_json_success([
		'pending' => true,
		'today' => $dash,
		'yesterday' => $dash,
	]);
}

add_action('wp_ajax_bl_dashboard_matomo_stats', 'bl_dashboard_ajax_matomo_stats');
