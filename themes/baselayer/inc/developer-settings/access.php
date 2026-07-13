<?php

defined('ABSPATH') || exit;

$bl_developer_tab = 'access';
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
		'bl_render_developer_access',
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
	// User rights form only
	if (empty($_POST['option_page']) || $_POST['option_page'] !== BL_THEME_OPTION_GROUP_DEVELOPER || empty($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], BL_THEME_OPTION_GROUP_DEVELOPER . '-options')) {
		return;
	}
	$value = isset($_POST['baselayer_admin_access']) && is_array($_POST['baselayer_admin_access']) ? $_POST['baselayer_admin_access'] : [];
	$sanitized = function_exists('bl_sanitize_admin_access') ? bl_sanitize_admin_access($value) : [];
	update_option('baselayer_admin_access', $sanitized);
	set_transient('baselayer_access_saved', '1', 30);
	wp_safe_redirect(admin_url('options-general.php?page=fs-developer-access'));
	exit;
}, 1);

function bl_render_developer_access(): void
{
	if (!current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'baselayer'));
	}

	$access_saved = get_transient('baselayer_access_saved');
	if ($access_saved !== false) {
		delete_transient('baselayer_access_saved');
	}

	$admin_access = get_option('baselayer_admin_access', function_exists('bl_admin_access_defaults') ? bl_admin_access_defaults() : []);
	$admin_access_groups = [
		['title' => null, 'items' => [
			'plugins' => __('Plugins', 'baselayer'),
			'tools' => __('Tools', 'baselayer'),
			'themes' => __('Appearance (Themes)', 'baselayer'),
		]],
		['title' => __('Settings', 'baselayer'), 'items' => [
			'options_general' => __('General', 'baselayer'),
			'options_writing' => __('Writing', 'baselayer'),
			'options_reading' => __('Reading', 'baselayer'),
			'options_media' => __('Media', 'baselayer'),
			'options_permalink' => __('Permalinks', 'baselayer'),
			'options_connectors' => __('Connectors', 'baselayer'),
			'options_privacy' => __('Privacy', 'baselayer'),
		]],
		['title' => __('Theme settings', 'baselayer'), 'items' => [
			'theme_settings_general' => __('Theme', 'baselayer'),
			'theme_settings_blocks' => __('Blocks', 'baselayer'),
			'theme_settings_css' => __('CSS', 'baselayer'),
			'theme_settings_redirects' => __('Redirects', 'baselayer'),
		]],
	];
	?>
	<div class="wrap">
		<?php bl_developer_settings_screen_heading(); ?>
		<?php if ($access_saved !== false) : ?>
			<div class="notice notice-success is-dismissible">
				<p><strong><?= esc_html(__('Settings saved.', 'baselayer')) ?></strong></p>
			</div>
		<?php endif; ?>

		<?php bl_developer_settings_render_nav(); ?>

		<form method="post" action="" class="fs-page-settings-form">
			<h2 class="title"><?= esc_html__('User rights', 'baselayer') ?></h2>
			<p class="description" style="margin-bottom: 16px;"><?= esc_html__('Control which admin pages and Settings sections are visible to Administrators (Admin) and users with developer rights (Developer). Uncheck to hide from that role.', 'baselayer') ?></p>
			<?php settings_fields(BL_THEME_OPTION_GROUP_DEVELOPER); ?>
			<?php foreach ($admin_access_groups as $group) : ?>
				<?php if ($group['title']) : ?>
					<h3 class="title" style="margin-top: 24px; margin-bottom: 12px;"><?= esc_html($group['title']) ?></h3>
				<?php endif; ?>
				<table class="widefat striped fs-table-small-gaps" role="presentation" style="margin-bottom: 0; width: auto;">
					<thead>
						<tr>
							<th scope="col" class="row-title"><?= esc_html__('Section', 'baselayer') ?></th>
							<th scope="col"><?= esc_html__('Admin', 'baselayer') ?></th>
							<th scope="col"><?= esc_html__('Developer', 'baselayer') ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ($group['items'] as $key => $label) :
							$val = isset($admin_access[$key]) ? $admin_access[$key] : ['admin' => 0, 'developer' => 1];
							$admin_checked = !empty($val['admin']);
							$dev_checked = !empty($val['developer']);
						?>
							<tr>
								<td class="row-title" style="width: 180px;"><?= esc_html($label) ?></td>
								<td style="width: auto; min-width: 80px;">
									<input type="hidden" name="baselayer_admin_access[<?= esc_attr($key) ?>][admin]" value="0">
									<label><input type="checkbox" name="baselayer_admin_access[<?= esc_attr($key) ?>][admin]" value="1" <?= checked($admin_checked, true, false) ?>></label>
								</td>
								<td style="width: auto; min-width: 100px;">
									<input type="hidden" name="baselayer_admin_access[<?= esc_attr($key) ?>][developer]" value="0">
									<label><input type="checkbox" name="baselayer_admin_access[<?= esc_attr($key) ?>][developer]" value="1" <?= checked($dev_checked, true, false) ?>></label>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			<?php endforeach; ?>
			<div class="fs-submit-row">
				<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
			</div>
		</form>
	</div>
	<?php
}
