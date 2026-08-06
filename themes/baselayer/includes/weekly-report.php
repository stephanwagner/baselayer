<?php

defined('ABSPATH') || exit;

add_filter('cron_schedules', function (array $schedules): array {
	if (!isset($schedules['weekly'])) {
		$schedules['weekly'] = [
			'interval' => 7 * DAY_IN_SECONDS,
			'display' => __('Once Weekly', 'baselayer'),
		];
	}
	if (!isset($schedules['bl_monthly'])) {
		$schedules['bl_monthly'] = [
			'interval' => MONTH_IN_SECONDS,
			'display' => __('Once Monthly', 'baselayer'),
		];
	}

	return $schedules;
});

/**
 * Whether the site time format uses AM/PM (Settings → General).
 */
function bl_weekly_report_uses_12h_time_format(): bool
{
	$tf = get_option('time_format', 'H:i');

	return is_string($tf) && preg_match('/a|A/', $tf) === 1;
}

/**
 * Report frequency: weekly (default) or monthly.
 */
function bl_weekly_report_frequency(): string
{
	$f = (string) get_option('baselayer_weekly_report_frequency', 'weekly');

	return $f === 'monthly' ? 'monthly' : 'weekly';
}

/**
 * Sanitize frequency option.
 *
 * @param mixed $value Raw option value.
 */
function bl_sanitize_weekly_report_frequency($value): string
{
	return ((string) $value) === 'monthly' ? 'monthly' : 'weekly';
}

/**
 * Sanitize day of month (1–28) for monthly schedule.
 *
 * @param mixed $value Raw option value.
 */
function bl_sanitize_weekly_report_mday($value): string
{
	return (string) max(1, min(28, (int) $value));
}

/**
 * Sanitize weekday (PHP date('w'): 0 Sunday … 6 Saturday).
 *
 * @param mixed $value Raw option value.
 */
function bl_sanitize_weekly_report_wday($value): string
{
	$w = (int) $value;

	return (string) max(0, min(6, $w));
}

/**
 * Sanitize hour (stored 0–23). With 12-hour site time, requires meridian in POST.
 *
 * @param mixed $value Raw option value.
 */
function bl_sanitize_weekly_report_hour($value): string
{
	if (bl_weekly_report_uses_12h_time_format() && isset($_POST['baselayer_weekly_report_meridian'])) {
		$h = max(1, min(12, (int) $value));
		$meridian = strtolower((string) wp_unslash((string) ($_POST['baselayer_weekly_report_meridian'] ?? '')));
		if ($h === 12) {
			$h24 = ($meridian === 'pm') ? 12 : 0;
		} else {
			$h24 = ($meridian === 'pm') ? $h + 12 : $h;
		}

		return (string) max(0, min(23, $h24));
	}

	return (string) max(0, min(23, (int) $value));
}

/**
 * Sanitize minute (steps of 5).
 *
 * @param mixed $value Raw option value.
 */
function bl_sanitize_weekly_report_minute($value): string
{
	$m = (int) $value;
	$allowed = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
	if (in_array($m, $allowed, true)) {
		return (string) $m;
	}
	$rounded = max(0, min(55, (int) round($m / 5) * 5));

	return (string) $rounded;
}

/**
 * Hour/minute from options (0–23 / 0–55 step 5).
 *
 * @return array{0:int,1:int}
 */
function bl_weekly_report_schedule_hour_minute(): array
{
	$hour = max(0, min(23, (int) get_option('baselayer_weekly_report_hour', '8')));
	$minute = (int) get_option('baselayer_weekly_report_minute', '0');
	$minute = max(0, min(55, (int) round($minute / 5) * 5));

	return [$hour, $minute];
}

/**
 * Monthly slot for a given year/month at configured day-of-month + time.
 */
function bl_weekly_report_monthly_slot(\DateTimeImmutable $ref, int $year, int $month): \DateTimeImmutable
{
	$mday = max(1, min(28, (int) get_option('baselayer_weekly_report_mday', '1')));
	[$hour, $minute] = bl_weekly_report_schedule_hour_minute();

	return $ref->setDate($year, $month, $mday)->setTime($hour, $minute, 0);
}

/**
 * Next Unix timestamp for the configured schedule in site timezone (first run > now).
 */
function bl_weekly_report_next_run_timestamp(): int
{
	$tz = function_exists('wp_timezone') ? wp_timezone() : new \DateTimeZone(wp_timezone_string() ?: 'UTC');
	$now = new \DateTimeImmutable('now', $tz);
	[$hour, $minute] = bl_weekly_report_schedule_hour_minute();

	if (bl_weekly_report_frequency() === 'monthly') {
		$year = (int) $now->format('Y');
		$month = (int) $now->format('n');
		$target = bl_weekly_report_monthly_slot($now, $year, $month);
		if ($target <= $now) {
			$next = $now->modify('first day of next month');
			$target = bl_weekly_report_monthly_slot($now, (int) $next->format('Y'), (int) $next->format('n'));
		}

		return $target->getTimestamp();
	}

	$wday = max(0, min(6, (int) get_option('baselayer_weekly_report_wday', '1')));
	$candidate = $now->setTime($hour, $minute, 0);
	$current_w = (int) $candidate->format('w');
	$delta = ($wday - $current_w + 7) % 7;
	$target = $candidate->modify("+{$delta} days");
	if ($target <= $now) {
		$target = $target->modify('+7 days');
	}

	return $target->getTimestamp();
}

/**
 * Most recent scheduled slot in the site timezone that is on or before $now.
 */
function bl_weekly_report_previous_slot_immutable(\DateTimeImmutable $now): \DateTimeImmutable
{
	[$hour, $minute] = bl_weekly_report_schedule_hour_minute();

	if (bl_weekly_report_frequency() === 'monthly') {
		$year = (int) $now->format('Y');
		$month = (int) $now->format('n');
		$target = bl_weekly_report_monthly_slot($now, $year, $month);
		if ($target > $now) {
			$prev = $now->modify('first day of last month');
			$target = bl_weekly_report_monthly_slot($now, (int) $prev->format('Y'), (int) $prev->format('n'));
		}

		return $target;
	}

	$wday = max(0, min(6, (int) get_option('baselayer_weekly_report_wday', '1')));
	$candidate = $now->setTime($hour, $minute, 0);
	$current_w = (int) $candidate->format('w');
	$delta_back = ($current_w - $wday + 7) % 7;
	$target = $candidate->modify(sprintf('-%d days', $delta_back));
	while ($target > $now) {
		$target = $target->modify('-7 days');
	}

	return $target;
}

/**
 * Start of the reporting week (00:00 local) that contains $local_midnight, for weeks that run from schedule weekday through the following 6 days.
 *
 * @param int $schedule_wday PHP date('w'): 0 Sunday … 6 Saturday (same as option baselayer_weekly_report_wday).
 */
function bl_weekly_report_week_period_start_for_date(\DateTimeImmutable $local_midnight, int $schedule_wday): \DateTimeImmutable
{
	$schedule_wday = max(0, min(6, $schedule_wday));
	$d = $local_midnight->setTime(0, 0, 0);
	$current_w = (int) $d->format('w');
	$back = ($current_w - $schedule_wday + 7) % 7;

	return $d->modify(sprintf('-%d days', $back));
}

/**
 * Reporting period for the send implied by $now.
 *
 * Weekly: 7 full local days ending the day before the slot’s calendar day.
 * Monthly: 30 full local days ending the day before the slot’s calendar day.
 *
 * @return array{slot:\DateTimeImmutable, week_start:\DateTimeImmutable, week_after_exclusive:\DateTimeImmutable, period_key:string}
 */
function bl_weekly_report_report_period_for_now(\DateTimeImmutable $now): array
{
	$slot = bl_weekly_report_previous_slot_immutable($now);
	$week_after_exclusive = $slot->setTime(0, 0, 0);
	$days = bl_weekly_report_frequency() === 'monthly' ? 30 : 7;
	$week_start = $week_after_exclusive->modify(sprintf('-%d days', $days));
	$period_key = bl_weekly_report_frequency() === 'monthly'
		? $slot->format('Y-m')
		: $week_start->format('Y-m-d');

	return [
		'slot' => $slot,
		'week_start' => $week_start,
		'week_after_exclusive' => $week_after_exclusive,
		'period_key' => $period_key,
	];
}

/**
 * Email daily + insights window: last N full site-local calendar days ending yesterday (today excluded).
 *
 * @return array{start:\DateTimeImmutable, after_exclusive:\DateTimeImmutable}
 */
function bl_weekly_report_email_daily_window(\DateTimeZone $tz, ?int $days = null): array
{
	if ($days === null) {
		$days = bl_weekly_report_frequency() === 'monthly' ? 30 : 7;
	}
	$days = max(1, $days);
	$today_start = new \DateTimeImmutable('today', $tz);
	$yesterday_start = $today_start->modify('-1 day');

	return [
		'start' => $yesterday_start->modify(sprintf('-%d days', $days - 1))->setTime(0, 0, 0),
		'after_exclusive' => $today_start->setTime(0, 0, 0),
	];
}

/**
 * @deprecated Use bl_weekly_report_email_daily_window().
 * @return array{start:\DateTimeImmutable, after_exclusive:\DateTimeImmutable}
 */
function bl_weekly_report_email_daily_window_seven_through_yesterday(\DateTimeZone $tz): array
{
	return bl_weekly_report_email_daily_window($tz, 7);
}

/**
 * Matomo daily rows for the email chart/table only.
 *
 * @param array<int, array<string, mixed>> $daily_src
 * @return array<int, array<string, mixed>>
 */
function bl_weekly_report_email_filter_daily_series(array $daily_src, \DateTimeZone $tz, ?int $days = null): array
{
	$window = bl_weekly_report_email_daily_window($tz, $days);
	$start = $window['start'];
	$after = $window['after_exclusive'];
	$out = [];
	foreach ($daily_src as $row) {
		$date = isset($row['date']) ? (string) $row['date'] : '';
		if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
			continue;
		}
		$dt = new \DateTimeImmutable($date . ' 00:00:00', $tz);
		if ($dt < $start || $dt >= $after) {
			continue;
		}
		$out[] = $row;
	}
	usort(
		$out,
		static function ($a, $b): int {
			return strcmp((string) ($a['date'] ?? ''), (string) ($b['date'] ?? ''));
		}
	);

	return $out;
}

/**
 * @deprecated Use bl_weekly_report_email_filter_daily_series().
 * @param array<int, array<string, mixed>> $daily_src
 * @return array<int, array<string, mixed>>
 */
function bl_weekly_report_email_filter_daily_series_seven_through_yesterday(array $daily_src, \DateTimeZone $tz): array
{
	return bl_weekly_report_email_filter_daily_series($daily_src, $tz, 7);
}

/**
 * ISO week (Monday start) — Matomo weekly rows match this; ignores WordPress “Week starts on”.
 */
function bl_weekly_report_email_iso_week_monday_from_row_date(string $ymd, \DateTimeZone $tz): ?\DateTimeImmutable
{
	if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $ymd)) {
		return null;
	}

	return (new \DateTimeImmutable($ymd . ' 12:00:00', $tz))->modify('monday this week')->setTime(0, 0, 0);
}

/**
 * Two-line chart/table labels for a Matomo weekly row: ISO week (Mon–Sun); line 1 “Week N”; line 2 long range from Monday.
 *
 * @return array{0:string,1:string}
 */
function bl_weekly_report_email_iso_week_row_labels(array $row): array
{
	$tz = function_exists('wp_timezone') ? wp_timezone() : new \DateTimeZone(wp_timezone_string() ?: 'UTC');
	$d = isset($row['date']) ? (string) $row['date'] : '';
	$monday = bl_weekly_report_email_iso_week_monday_from_row_date($d, $tz);
	if ($monday === null) {
		return ['', ''];
	}
	$week_no = (int) $monday->format('W');
	$week_end_ts = $monday->modify('+6 days')->getTimestamp();
	$line2 = function_exists('bl_dashboard_format_week_date_range')
		? bl_dashboard_format_week_date_range($monday)
		: '<span class="bl-mail__nowrap">' . wp_date('j. M', $monday->getTimestamp()) . '</span> – <span class="bl-mail__nowrap">' . wp_date('j. M Y', $week_end_ts) . '</span>';

	return [
		sprintf(__('Week %d', 'baselayer'), $week_no),
		$line2,
	];
}

/**
 * Compact x-axis labels for the weekly trend chart (email — ISO weeks only).
 *
 * @return array{0:string,1:string}
 */
function bl_weekly_report_weekly_chart_axis_labels(array $row): array
{
	$tz = function_exists('wp_timezone') ? wp_timezone() : new \DateTimeZone(wp_timezone_string() ?: 'UTC');
	$d = isset($row['date']) ? (string) $row['date'] : '';
	$monday = bl_weekly_report_email_iso_week_monday_from_row_date($d, $tz);
	if ($monday === null) {
		return ['', ''];
	}
	$week_no = (int) $monday->format('W');

	return [
		sprintf(__('Week %d', 'baselayer'), $week_no),
		wp_date('d.m.Y', $monday->getTimestamp()),
	];
}

/**
 * Clear and reschedule the website report cron from current options.
 */
function bl_weekly_report_reschedule_cron(): void
{
	if (wp_installing()) {
		return;
	}
	while (($ts = wp_next_scheduled('bl_weekly_report_weekly')) !== false) {
		wp_unschedule_event($ts, 'bl_weekly_report_weekly');
	}
	$recurrence = bl_weekly_report_frequency() === 'monthly' ? 'bl_monthly' : 'weekly';
	wp_schedule_event(bl_weekly_report_next_run_timestamp(), $recurrence, 'bl_weekly_report_weekly');
}

/**
 * General settings: weekday or day-of-month + time (site timezone).
 */
function bl_weekly_report_render_schedule_settings_row(): void
{
	global $wp_locale;
	if (!$wp_locale instanceof \WP_Locale) {
		return;
	}
	$frequency = bl_weekly_report_frequency();
	$wday = (string) get_option('baselayer_weekly_report_wday', '1');
	$mday = (string) get_option('baselayer_weekly_report_mday', '1');
	$hour_stored = (int) get_option('baselayer_weekly_report_hour', '8');
	$minute = (string) get_option('baselayer_weekly_report_minute', '0');
	$use_12h = bl_weekly_report_uses_12h_time_format();
	$start = max(0, min(6, (int) get_option('start_of_week', 1)));
	?>
	<tr>
		<th scope="row"><?= esc_html__('Schedule', 'baselayer') ?></th>
		<td>
			<div style="display:flex; flex-wrap:wrap; align-items:flex-end; gap:12px;">
				<p id="bl-website-report-wday-wrap" style="margin:0;"<?= $frequency === 'monthly' ? ' hidden' : '' ?>>
					<label for="baselayer_weekly_report_wday" style="display: block;margin-bottom: 2px;"><?= esc_html__('Weekday', 'baselayer') ?></label>
					<select name="baselayer_weekly_report_wday" id="baselayer_weekly_report_wday">
						<?php for ($k = 0; $k < 7; $k++) :
							$d = ($start + $k) % 7;
							?>
							<option value="<?= esc_attr((string) $d) ?>" <?= selected($wday, (string) $d, false) ?>><?= esc_html($wp_locale->weekday[$d]) ?></option>
						<?php endfor; ?>
					</select>
				</p>
				<p id="bl-website-report-mday-wrap" style="margin:0;"<?= $frequency !== 'monthly' ? ' hidden' : '' ?>>
					<label for="baselayer_weekly_report_mday" style="display: block;margin-bottom: 2px;"><?= esc_html__('Day of month', 'baselayer') ?></label>
					<select name="baselayer_weekly_report_mday" id="baselayer_weekly_report_mday">
						<?php for ($d = 1; $d <= 28; $d++) : ?>
							<option value="<?= esc_attr((string) $d) ?>" <?= selected($mday, (string) $d, false) ?>><?= esc_html((string) $d) ?></option>
						<?php endfor; ?>
					</select>
				</p>
				<p style="margin:0;">
					<span id="baselayer-weekly-report-time-label" style="display: block;margin-bottom: 2px;"><?= esc_html__('Time', 'baselayer') ?></span>
					<span style="display:inline-flex; flex-wrap:wrap; align-items:center; gap:4px;">
						<?php if ($use_12h) :
							$h12 = $hour_stored % 12;
							if ($h12 === 0) {
								$h12 = 12;
							}
							$meridian = ($hour_stored >= 12) ? 'pm' : 'am';
							?>
							<select name="baselayer_weekly_report_hour" id="baselayer_weekly_report_hour" aria-labelledby="baselayer-weekly-report-time-label">
								<?php for ($h = 1; $h <= 12; $h++) : ?>
									<option value="<?= esc_attr((string) $h) ?>" <?= selected((string) $h12, (string) $h, false) ?>><?= esc_html((string) $h) ?></option>
								<?php endfor; ?>
							</select>
							<select name="baselayer_weekly_report_meridian" id="baselayer_weekly_report_meridian" aria-label="<?= esc_attr__('AM or PM', 'baselayer') ?>">
								<option value="am" <?= selected($meridian, 'am', false) ?>><?= esc_html__('am', 'baselayer') ?></option>
								<option value="pm" <?= selected($meridian, 'pm', false) ?>><?= esc_html__('pm', 'baselayer') ?></option>
							</select>
						<?php else : ?>
							<select name="baselayer_weekly_report_hour" id="baselayer_weekly_report_hour" aria-labelledby="baselayer-weekly-report-time-label">
								<?php for ($h = 0; $h <= 23; $h++) : ?>
									<option value="<?= esc_attr((string) $h) ?>" <?= selected((string) $hour_stored, (string) $h, false) ?>><?= esc_html(sprintf('%02d', $h)) ?></option>
								<?php endfor; ?>
							</select>
						<?php endif; ?>
						<span aria-hidden="true">:</span>
						<select name="baselayer_weekly_report_minute" id="baselayer_weekly_report_minute" aria-label="<?= esc_attr__('Minutes', 'baselayer') ?>">
							<?php for ($m = 0; $m <= 55; $m += 5) :
								$ms = (string) $m;
								?>
								<option value="<?= esc_attr($ms) ?>" <?= selected($minute, $ms, false) ?>><?= esc_html(sprintf('%02d', $m)) ?></option>
							<?php endfor; ?>
						</select>
					</span>
				</p>
			</div>
			<p class="description" id="bl-website-report-schedule-desc-weekly"<?= $frequency === 'monthly' ? ' hidden' : '' ?>><?= esc_html__('Sent once per week on the first visit after your chosen day and time.', 'baselayer') ?></p>
			<p class="description" id="bl-website-report-schedule-desc-monthly"<?= $frequency !== 'monthly' ? ' hidden' : '' ?>><?= esc_html__('Sent once per month on the first visit after your chosen day and time.', 'baselayer') ?></p>
		</td>
	</tr>
	<?php
}

add_action('init', static function (): void {
	if (wp_installing()) {
		return;
	}
	if (get_option('baselayer_weekly_report_schedule_v2', '') === '1') {
		return;
	}
	bl_weekly_report_reschedule_cron();
	update_option('baselayer_weekly_report_schedule_v2', '1', false);
}, 33);

/**
 * Get the post type singular label.
 *
 * @param string $post_type
 * @return string
 */
function bl_weekly_report_get_post_type_singular_label(string $post_type): string
{
	$obj = get_post_type_object($post_type);
	if (!$obj instanceof \WP_Post_Type) {
		return '';
	}

	return (string) __($obj->labels->singular_name, 'baselayer');
}

/**
 * CMS blocks for weekly email — period is arbitrary half-open [ start, after_exclusive ).
 *
 * @return array{went_live_last_week: array<int,array{title:string,url:string,date:string}>, scheduled_upcoming: array<int,array{title:string,url:string,date:string}>, expired_last_week: array<int,array{title:string,url:string,date:string}>, expiring_upcoming: array<int,array{title:string,url:string,date:string}>}
 */
function bl_weekly_report_build_insights(\DateTimeImmutable $period_start, \DateTimeImmutable $period_after_exclusive): array
{
	$insight_date_format = 'd.m.Y H:i';

	$out = [
		'went_live_last_week' => [],
		'scheduled_upcoming' => [],
		'expired_last_week' => [],
		'expiring_upcoming' => [],
	];
	if (!function_exists('bl_theme_post_types')) {
		return $out;
	}
	$post_types = bl_theme_post_types();
	$last_week_start = $period_start->format('Y-m-d H:i:s');
	$last_week_end = $period_after_exclusive->modify('-1 second')->format('Y-m-d H:i:s');

	$scheduled = get_posts([
		'post_type' => $post_types,
		'post_status' => 'future',
		'posts_per_page' => 10,
		'orderby' => 'date',
		'order' => 'ASC',
	]);
	foreach ($scheduled as $p) {
		$out['scheduled_upcoming'][] = [
			'post_type' => bl_weekly_report_get_post_type_singular_label((string) $p->post_type),
			'title' => (string) (get_the_title((int) $p->ID) ?: __('(no title)', 'baselayer')),
			'url' => (string) get_permalink((int) $p->ID),
			'date' => (string) get_date_from_gmt((string) $p->post_date_gmt, $insight_date_format),
		];
	}

	$went_live = get_posts([
		'post_type' => $post_types,
		'post_status' => 'publish',
		'posts_per_page' => 10,
		'orderby' => 'date',
		'order' => 'DESC',
		'date_query' => [
			[
				'after' => $last_week_start,
				'before' => $last_week_end,
				'inclusive' => true,
				'column' => 'post_date',
			],
		],
	]);
	foreach ($went_live as $p) {
		$out['went_live_last_week'][] = [
			'post_type' => bl_weekly_report_get_post_type_singular_label((string) $p->post_type),
			'title' => (string) (get_the_title((int) $p->ID) ?: __('(no title)', 'baselayer')),
			'url' => (string) get_permalink((int) $p->ID),
			'date' => (string) get_the_date($insight_date_format, (int) $p->ID),
		];
	}

	if (
		function_exists('bl_theme_feature_enabled')
		&& bl_theme_feature_enabled('post_expirator')
		&& defined('BL_EXPIRATION_META_KEY')
		&& defined('BL_EXPIRATION_ENABLED_KEY')
	) {
		$expiring = get_posts([
			'post_type' => $post_types,
			'post_status' => ['publish', 'future', 'draft', 'private', 'pending'],
			'posts_per_page' => 200,
			'orderby' => 'meta_value',
			'meta_key' => BL_EXPIRATION_META_KEY,
			'order' => 'ASC',
			'meta_query' => [
				'relation' => 'AND',
				[
					'key' => BL_EXPIRATION_ENABLED_KEY,
					'value' => '1',
				],
				[
					'key' => BL_EXPIRATION_META_KEY,
					'compare' => '!=',
					'value' => '',
				],
			],
		]);
		$last_week_start_ts = $period_start->getTimestamp();
		$week_after_ts = $period_after_exclusive->getTimestamp();
		foreach ($expiring as $p) {
			$raw = (string) get_post_meta((int) $p->ID, BL_EXPIRATION_META_KEY, true);
			$ts = bl_weekly_report_parse_expiration_timestamp($raw);
			if ($ts === null) {
				continue;
			}
			$row = [
				'post_type' => bl_weekly_report_get_post_type_singular_label((string) $p->post_type),
				'title' => (string) (get_the_title((int) $p->ID) ?: __('(no title)', 'baselayer')),
				'url' => (string) get_permalink((int) $p->ID),
				'date' => (string) wp_date($insight_date_format, $ts),
			];
			if ($ts >= $week_after_ts) {
				if (count($out['expiring_upcoming']) < 10) {
					$out['expiring_upcoming'][] = $row;
				}
				continue;
			}
			if ($ts >= $last_week_start_ts && $ts < $week_after_ts) {
				if (count($out['expired_last_week']) < 10) {
					$out['expired_last_week'][] = $row;
				}
			}
		}
	}

	return $out;
}

/**
 * Parse post-expirator `Y-m-d H:i` into timestamp (site timezone).
 */
function bl_weekly_report_parse_expiration_timestamp(string $raw): ?int
{
	if ($raw === '') {
		return null;
	}
	$tz = function_exists('wp_timezone') ? wp_timezone() : new \DateTimeZone(wp_timezone_string() ?: 'UTC');
	$dt = \DateTimeImmutable::createFromFormat('Y-m-d H:i', $raw, $tz);
	if (!$dt instanceof \DateTimeImmutable) {
		return null;
	}

	return $dt->getTimestamp();
}

/**
 * Build the HTML body for website report.
 */
function bl_weekly_report_build_html(): string
{
	$site_name = get_bloginfo('name');
	$site_url = home_url();
	$admin_url = admin_url();
	$stats_url = function_exists('bl_dashboard_statistics_url') ? bl_dashboard_statistics_url() : admin_url();
	$theme_settings_url = admin_url('options-general.php?page=bl-theme-settings');
	$developer_settings_url = admin_url('options-general.php?page=' . bl_developer_settings_page_slug('developer'));
	$developer_email = function_exists('bl_developer_email') ? bl_developer_email() : '';
	$admin_email = get_option('admin_email', '');
	$developer_email_link = (is_string($developer_email) && is_email($developer_email)) ? ('mailto:' . $developer_email) : '';
	$admin_email_link = (is_string($admin_email) && is_email($admin_email)) ? ('mailto:' . $admin_email) : '';
	$date_now = wp_date(get_option('date_format') . ' ' . get_option('time_format'));
	$matomo_on = function_exists('bl_theme_feature_enabled') && bl_theme_feature_enabled('matomo');
	$tz = function_exists('wp_timezone') ? wp_timezone() : new \DateTimeZone(wp_timezone_string() ?: 'UTC');
	$frequency = bl_weekly_report_frequency();
	$is_monthly = $frequency === 'monthly';
	$email_daily = bl_weekly_report_email_daily_window($tz);
	$email_daily_start = $email_daily['start'];
	$email_daily_after_exclusive = $email_daily['after_exclusive'];
	$insights = bl_weekly_report_build_insights($email_daily_start, $email_daily_after_exclusive);

	$daily = [];
	$weekly = [];
	$daily_chart_url = '';
	$weekly_chart_url = '';

	if ($matomo_on && function_exists('bl_matomo_get_statistics')) {
		$series = bl_matomo_get_statistics();
		$daily_src = isset($series['daily']) && is_array($series['daily']) ? $series['daily'] : [];
		$daily = bl_weekly_report_email_filter_daily_series($daily_src, $tz);

		$weekly_src = isset($series['weekly']) && is_array($series['weekly']) ? $series['weekly'] : [];
		$weekly_trend = [];
		foreach ($weekly_src as $wrow) {
			$wdate = isset($wrow['date']) ? (string) $wrow['date'] : '';
			if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $wdate)) {
				continue;
			}
			if (bl_dashboard_analytics_row_is_current_week($wdate)) {
				continue;
			}
			$weekly_trend[] = $wrow;
		}
		if (count($weekly_trend) > 8) {
			$weekly_trend = array_slice($weekly_trend, -8);
		}
		$weekly = $weekly_trend;

		$daily_chart_url = bl_weekly_report_build_chart_url(
			array_map(static function ($row) use ($tz): array {
				$date = isset($row['date']) ? (string) $row['date'] : '';
				if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
					return ['', ''];
				}
				$dt = new \DateTimeImmutable($date . ' 12:00:00', $tz);
				$ts = $dt->getTimestamp();

				return [
					wp_date('l', $ts),
					wp_date('d.m.Y', $ts),
				];
			}, $daily),
			[
				[
					'label' => __('Unique visitors', 'baselayer'),
					'data' => array_map(static fn($r) => (int) ($r['unique'] ?? 0), $daily),
					'color' => '#2284e5',
					'transparent' => '#2284e535',
				],
				[
					'label' => __('Visits', 'baselayer'),
					'data' => array_map(static fn($r) => (int) ($r['visits'] ?? 0), $daily),
					'color' => '#8f70cc',
					'transparent' => '#8f70cc35',
				],
				[
					'label' => __('Page views', 'baselayer'),
					'data' => array_map(static fn($r) => (int) ($r['pageviews'] ?? 0), $daily),
					'color' => '#ff6673',
					'transparent' => '#ff667340',
				],
			],
			'line'
		);
		$weekly_chart_url = bl_weekly_report_build_chart_url(
			array_map(static function ($row): array {
				[$l1, $l2] = bl_weekly_report_weekly_chart_axis_labels($row);

				return [$l1, $l2];
			}, $weekly),
			[
				[
					'label' => __('Unique visitors', 'baselayer'),
					'data' => array_map(static fn($r) => (int) ($r['unique'] ?? 0), $weekly),
					'color' => '#2284e5',
					'transparent' => '#2284e535',
				],
				[
					'label' => __('Visits', 'baselayer'),
					'data' => array_map(static fn($r) => (int) ($r['visits'] ?? 0), $weekly),
					'color' => '#8f70cc',
					'transparent' => '#8f70cc35',
				],
				[
					'label' => __('Page views', 'baselayer'),
					'data' => array_map(static fn($r) => (int) ($r['pageviews'] ?? 0), $weekly),
					'color' => '#ff6673',
					'transparent' => '#ff667340',
				],
			],
			'line'
		);
	}

	$email_page_title = $is_monthly
		? sprintf(
			/* translators: %s: site name */
			__('Monthly website report – %s', 'baselayer'),
			$site_name
		)
		: sprintf(
			/* translators: %s: site name */
			__('Website report – %s', 'baselayer'),
			$site_name
		);

	$template_args = [
		'site_name' => $site_name,
		'date_now' => $date_now,
		'site_url' => $site_url,
		'admin_url' => $admin_url,
		'stats_url' => $stats_url,
		'insights' => $insights,
		'daily' => $daily,
		'weekly' => $weekly,
		'daily_chart_url' => $daily_chart_url,
		'weekly_chart_url' => $weekly_chart_url,
		'matomo_enabled' => $matomo_on,
		'theme_settings_url' => $theme_settings_url,
		'developer_settings_url' => $developer_settings_url,
		'developer_email_link' => $developer_email_link,
		'admin_email_link' => $admin_email_link,
		'report_frequency' => $frequency,
		'email_heading_html' => $is_monthly
			? wp_kses(__('Your monthly<br>website report', 'baselayer'), ['br' => []])
			: wp_kses(__('Your weekly<br>website report', 'baselayer'), ['br' => []]),
		'email_empty_html' => $is_monthly
			? esc_html__('Everything stayed unchanged last month, no content updates to show.', 'baselayer')
			: esc_html__('Everything stayed unchanged last week, no content updates to show.', 'baselayer'),
		'insight_titles' => [
			'went_live_last_week' => $is_monthly
				? __('Published last month', 'baselayer')
				: __('Published last week', 'baselayer'),
			'scheduled_upcoming' => __('Upcoming scheduled pages or posts', 'baselayer'),
			'expired_last_week' => $is_monthly
				? __('Expired last month', 'baselayer')
				: __('Expired last week', 'baselayer'),
			'expiring_upcoming' => __('Upcoming expirations', 'baselayer'),
		],
		'daily_section_title_html' => $is_monthly
			? wp_kses(__('Visitors and page views <div class="bl-mail__small-mobile-inline">of the last month</div>', 'baselayer'), ['br' => [], 'div' => ['class' => []]])
			: wp_kses(__('Visitors and page views <div class="bl-mail__small-mobile-inline">of the last week</div>', 'baselayer'), ['br' => [], 'div' => ['class' => []]]),
		'email_page_title' => $email_page_title,
		'email_html_lang' => str_replace('_', '-', determine_locale()),
		'email_footer_html' => wp_kses(
			sprintf(
				__(
					'If you no longer want to receive these reports, <a href="%1$s">log in to WordPress</a> and disable website reports, or contact the <a href="%2$s">developer</a> or <a href="%3$s">admin</a>.',
					'baselayer'
				),
				esc_url($theme_settings_url),
				esc_url($developer_email_link),
				esc_url($admin_email_link)
			),
			[
				'a' => [
					'href' => [],
				],
			]
		),
	];
	$template_html = bl_compose_email_document('weekly-report', $template_args);
	if ($template_html !== '') {
		return $template_html;
	}

	$fallback_label = $is_monthly ? __('Monthly report', 'baselayer') : __('Weekly report', 'baselayer');

	return '<h2>' . esc_html($site_name) . ' - ' . esc_html($fallback_label) . '</h2>';
}

/**
 * Build chart image URL via QuickChart (Chart.js v4 config).
 *
 * @param array<int, string|array<int,string>> $labels
 * @param array<int, array{label:string,data:array<int,int>,color:string,transparent:string}> $series
 */
function bl_weekly_report_build_chart_url(array $labels, array $series, string $type = 'line'): string
{
	if ($labels === [] || $series === []) {
		return '';
	}
	$datasets = [];
	foreach ($series as $s) {
		$datasets[] = [
			'label' => $s['label'],
			'data' => $s['data'],
			'borderColor' => $s['color'],
			'backgroundColor' => $s['transparent'],
			'fill' => true,
			'tension' => 0.3,
			'pointRadius' => 3,
			'pointHoverRadius' => 4,
			'pointBackgroundColor' => $s['color'],
			'borderWidth' => 2,
		];
	}
	$config = [
		'type' => $type,
		'data' => [
			'labels' => $labels,
			'datasets' => $datasets,
		],
		'options' => [
			'plugins' => [
				'legend' => ['display' => false],
			],
			'scales' => [
				'x' => ['ticks' => ['color' => '#888'], 'grid' => ['color' => '#8888884d']],
				'y' => ['beginAtZero' => true, 'ticks' => ['color' => '#888'], 'grid' => ['color' => '#8888884d']],
			],
		],
	];

	return 'https://quickchart.io/chart?version=4&width=600&height=300&devicePixelRatio=2&c=' . rawurlencode(wp_json_encode($config));
}

/**
 * Send website report to one or many recipients.
 *
 * @param array<int, string> $emails Recipient list.
 */
function bl_weekly_report_send(array $emails): bool
{
	$emails = array_values(array_filter(array_unique(array_map(static function ($email): string {
		return is_string($email) ? sanitize_email($email) : '';
	}, $emails))));
	if ($emails === []) {
		return false;
	}
	$subject = bl_weekly_report_frequency() === 'monthly'
		? sprintf(
			/* translators: %s: site name */
			__('Monthly website report – %s', 'baselayer'),
			get_bloginfo('name')
		)
		: sprintf(
			/* translators: %s: site name */
			__('Website report – %s', 'baselayer'),
			get_bloginfo('name')
		);
	$body = bl_weekly_report_build_html();
	$headers = ['Content-Type: text/html; charset=UTF-8'];

	return (bool) wp_mail($emails, $subject, $body, $headers);
}

/**
 * Scheduled sender callback.
 */
function bl_weekly_report_monday_send(): void
{
	try {
		if (get_option('baselayer_weekly_report_enabled', '0') !== '1') {
			return;
		}
		if (!function_exists('bl_report_emails')) {
			return;
		}
		$emails = bl_report_emails();
		if ($emails === []) {
			return;
		}
		$tz = function_exists('wp_timezone') ? wp_timezone() : new \DateTimeZone(wp_timezone_string() ?: 'UTC');
		$now = new \DateTimeImmutable('now', $tz);
		$period = bl_weekly_report_report_period_for_now($now);
		$period_key = (string) ($period['period_key'] ?? $period['week_start']->format('Y-m-d'));
		$last_sent = (string) get_option('baselayer_weekly_report_last_sent_week', '');
		if ($last_sent === $period_key) {
			return;
		}

		if (bl_weekly_report_send($emails)) {
			update_option('baselayer_weekly_report_last_sent_week', $period_key, false);
		}
	} finally {
		if (!wp_installing()) {
			bl_weekly_report_reschedule_cron();
		}
	}
}
add_action('bl_weekly_report_weekly', 'bl_weekly_report_monday_send');

/**
 * Ensure report cron exists (configured schedule, site timezone).
 */
add_action('init', function (): void {
	if (wp_installing()) {
		return;
	}

	// Migrate from previous daily hook setup.
	$old_daily = wp_next_scheduled('bl_weekly_report_daily');
	if ($old_daily) {
		wp_unschedule_event($old_daily, 'bl_weekly_report_daily');
	}

	if (wp_next_scheduled('bl_weekly_report_weekly') !== false) {
		return;
	}
	$recurrence = bl_weekly_report_frequency() === 'monthly' ? 'bl_monthly' : 'weekly';
	wp_schedule_event(bl_weekly_report_next_run_timestamp(), $recurrence, 'bl_weekly_report_weekly');
}, 35);
