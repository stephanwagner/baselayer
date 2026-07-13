<?php

defined('ABSPATH') || exit;

$bl_developer_tab = 'tools';
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
		'bl_render_developer_tools',
		bl_developer_tab_position($bl_developer_tab)
	);
}, 20);

add_action('admin_init', function () use ($bl_developer_page_slug) {
	global $pagenow;
	if ($pagenow !== 'options-general.php' || (isset($_GET['page']) ? $_GET['page'] : '') !== $bl_developer_page_slug) {
		return;
	}
	if (!current_user_can('manage_options') || !function_exists('bl_is_developer_user') || !bl_is_developer_user((int) get_current_user_id())) {
		return;
	}
	$url = admin_url('options-general.php?page=' . $bl_developer_page_slug);

	// Bump asset version (GET with nonce)
	if ($_SERVER['REQUEST_METHOD'] === 'GET' && !empty($_GET['baselayer_bump']) && !empty($_GET['_wpnonce']) && wp_verify_nonce($_GET['_wpnonce'], 'baselayer_bump_asset_version')) {
		$current = get_option('baselayer_asset_version', '1');
		$next = is_numeric($current) ? (string) ((int) $current + 1) : '2';
		update_option('baselayer_asset_version', $next);
		set_transient('baselayer_bump_notice', $next, 30);
		wp_safe_redirect($url);
		exit;
	}

	if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
		return;
	}
	if (!empty($_POST['baselayer_flush_redirect_cache']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_flush_redirect_cache')) {
		flush_rewrite_rules();
		set_transient('baselayer_flush_redirect_cache_notice', '1', 30);
		wp_safe_redirect($url);
		exit;
	}
	if (!empty($_POST['baselayer_clean_revisions']) && !empty($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'baselayer_clean_revisions')) {
		$keep = isset($_POST['baselayer_revisions_keep']) ? max(0, (int) $_POST['baselayer_revisions_keep']) : 5;
		$deleted = bl_clean_revisions($keep);
		set_transient('baselayer_clean_revisions_notice', $deleted, 30);
		wp_safe_redirect($url);
		exit;
	}
}, 1);

function bl_render_developer_tools(): void
{
	if (!current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'baselayer'));
	}

	$bump_notice = get_transient('baselayer_bump_notice');
	if ($bump_notice !== false) {
		delete_transient('baselayer_bump_notice');
	}
	$flush_notice = get_transient('baselayer_flush_redirect_cache_notice');
	if ($flush_notice !== false) {
		delete_transient('baselayer_flush_redirect_cache_notice');
	}
	$revisions_notice = get_transient('baselayer_clean_revisions_notice');
	if ($revisions_notice !== false) {
		delete_transient('baselayer_clean_revisions_notice');
	}

	$notices = [];
	if ($bump_notice !== false) {
		$notices[] = sprintf(__('Asset version increased to %s.', 'baselayer'), $bump_notice);
	}
	if ($flush_notice !== false) {
		$notices[] = __('Permalink rules have been successfully refreshed.', 'baselayer');
	}
	if ($revisions_notice !== false && is_numeric($revisions_notice)) {
		$notices[] = sprintf(_n('%s revision deleted.', '%s revisions deleted.', (int) $revisions_notice, 'baselayer'), number_format_i18n((int) $revisions_notice));
	}

	global $wpdb;
	$revisions_total = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'revision'");
	?>
	<div class="wrap">
		<?php bl_developer_settings_screen_heading(); ?>
		<?php foreach ($notices as $msg) : ?>
			<div class="notice notice-success is-dismissible">
				<p><strong><?= esc_html($msg) ?></strong></p>
			</div>
		<?php endforeach; ?>

		<?php bl_developer_settings_render_nav(); ?>

		<div class="fs-page-settings-form">
			<?php $asset_version = get_option('baselayer_asset_version', '1'); ?>
			<h2 class="title"><?= esc_html__('Asset Cache', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('Bump when static theme files using bl_asset_url have been changed so the cache of the files is updated.', 'baselayer') ?></p>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?= esc_html__('Cache version', 'baselayer') ?></th>
					<td>
						<div style="display: flex; align-items: center;">
							<code style="font-size: 14px; height: 30px; line-height: 30px; padding: 0 8px; min-width: 30px; text-align: center; box-sizing: border-box; border-radius: 3px; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);">
								<?= esc_html($asset_version) ?>
							</code>
							<?php $bump_url = wp_nonce_url(add_query_arg(['page' => bl_developer_settings_page_slug('tools'), 'baselayer_bump' => '1'], admin_url('options-general.php')), 'baselayer_bump_asset_version'); ?>
							<a href="<?= esc_url($bump_url) ?>" class="button" style="margin-left: 8px;"><?= esc_html__('Bump version', 'baselayer') ?></a>
						</div>
					</td>
				</tr>
			</table>

			<hr>

			<h2 class="title" style="margin-top: 28px;"><?= esc_html__('Refresh Permalink Rules', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('Updates the WordPress permalink structure and rewrite rules.', 'baselayer') ?></p>
			<p class="description" style="margin-bottom: 12px;"><?= esc_html__('Run after structural changes.', 'baselayer') ?></p>
			<form method="post" action="">
				<?php wp_nonce_field('baselayer_flush_redirect_cache'); ?>
				<input type="hidden" name="baselayer_flush_redirect_cache" value="1">
				<div class="fs-submit-row"><button type="submit" class="button button-primary"><?= esc_html_x('Refresh Permalink Rules', 'Button text', 'baselayer') ?></button></div>
			</form>

			<hr>

			<h2 class="title" style="margin-top: 28px;"><?= esc_html__('Revision cleaner', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('Delete old revisions for all posts and pages.', 'baselayer') ?></p>
			<p class="description" style="margin-bottom: 12px;"><?= esc_html__('Set how many of the most recent revisions to keep per post, older ones will be removed.', 'baselayer') ?></p>
			<p style="margin-bottom: 16px;"><strong><?= esc_html(sprintf(_n('%s revision in total.', '%s revisions in total.', $revisions_total, 'baselayer'), number_format_i18n($revisions_total))) ?></strong></p>
			<form method="post" action="">
				<?php wp_nonce_field('baselayer_clean_revisions'); ?>
				<input type="hidden" name="baselayer_clean_revisions" value="1">
				<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<label for="baselayer_revisions_keep"><?= esc_html__('Keep per post:', 'baselayer') ?></label>
					<input type="number" name="baselayer_revisions_keep" id="baselayer_revisions_keep" value="5" min="0" max="99" step="1" class="small-text">
					<span><?= esc_html__('revisions (0 = delete all)', 'baselayer') ?></span>
				</div>
				<div class="fs-submit-row"><button type="submit" class="button button-primary"><?= esc_html__('Clean revisions', 'baselayer') ?></button></div>
			</form>
		</div>
	</div>
	<?php
}
