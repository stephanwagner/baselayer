<?php

defined('ABSPATH') || exit;

const BL_DEBUG_CONTAINER_WIDTHS_PAGE_OPTION = 'baselayer_debug_container_widths_page_id';

$bl_developer_tab = 'debug';
$bl_developer_page_slug = bl_developer_settings_page_slug($bl_developer_tab);

/**
 * Whether the current user may open Developer → Debug.
 */
function bl_developer_can_access_debug(): bool
{
	if (!current_user_can('manage_options')) {
		return false;
	}
	if (!function_exists('bl_is_developer_user') || !bl_is_developer_user((int) get_current_user_id())) {
		return false;
	}
	if (function_exists('bl_admin_can_access') && !bl_admin_can_access('developer_debug')) {
		return false;
	}

	return true;
}

/**
 * Block markup for the container-widths debug page.
 */
function bl_debug_container_widths_page_content(): string
{
	$path = __DIR__ . '/debug-container-widths-page.html';
	if (!is_readable($path)) {
		return '';
	}

	$html = file_get_contents($path);

	return is_string($html) ? trim($html) : '';
}

/**
 * Create or refresh the container-widths debug page. Returns post ID or 0.
 */
function bl_debug_ensure_container_widths_page(): int
{
	$title = __('Container Spacings', 'baselayer');
	$slug = 'container-spacings';
	$content = bl_debug_container_widths_page_content();
	$existing_id = (int) get_option(BL_DEBUG_CONTAINER_WIDTHS_PAGE_OPTION, 0);

	if ($existing_id > 0) {
		$existing = get_post($existing_id);
		if ($existing instanceof WP_Post && $existing->post_type === 'page' && $existing->post_status !== 'trash') {
			wp_update_post([
				'ID' => $existing_id,
				'post_title' => $title,
				'post_name' => $slug,
				'post_content' => $content,
				'post_status' => 'publish',
			]);
			return $existing_id;
		}
	}

	$post_id = wp_insert_post([
		'post_title' => $title,
		'post_name' => $slug,
		'post_content' => $content,
		'post_status' => 'publish',
		'post_type' => 'page',
		'post_author' => get_current_user_id(),
	], true);

	if (is_wp_error($post_id) || !$post_id) {
		return 0;
	}

	update_option(BL_DEBUG_CONTAINER_WIDTHS_PAGE_OPTION, (int) $post_id, false);

	return (int) $post_id;
}

add_action('admin_menu', function () use ($bl_developer_tab, $bl_developer_page_slug) {
	if (!bl_developer_can_access_debug()) {
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
		'bl_render_developer_debug',
		bl_developer_tab_position($bl_developer_tab)
	);
}, 20);

add_action('admin_init', function () use ($bl_developer_page_slug) {
	global $pagenow;
	if ($pagenow !== 'options-general.php' || (isset($_GET['page']) ? $_GET['page'] : '') !== $bl_developer_page_slug) {
		return;
	}
	if (!bl_developer_can_access_debug()) {
		return;
	}
	$url = admin_url('options-general.php?page=' . $bl_developer_page_slug);

	if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['baselayer_save_debug_container_widths']) && !empty($_POST['_wpnonce']) && wp_verify_nonce((string) $_POST['_wpnonce'], 'baselayer_save_debug_container_widths')) {
		$enabled = !empty($_POST[BL_DEBUG_CONTAINER_WIDTHS_OPTION]) ? '1' : '';
		update_option(BL_DEBUG_CONTAINER_WIDTHS_OPTION, $enabled, false);
		set_transient('baselayer_debug_saved', '1', 30);
		wp_safe_redirect($url);
		exit;
	}

	if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['baselayer_create_debug_container_widths_page']) && !empty($_POST['_wpnonce']) && wp_verify_nonce((string) $_POST['_wpnonce'], 'baselayer_create_debug_container_widths_page')) {
		$page_id = bl_debug_ensure_container_widths_page();
		if ($page_id > 0) {
			set_transient('baselayer_debug_page_created', (string) $page_id, 30);
			wp_safe_redirect(get_edit_post_link($page_id, 'raw') ?: $url);
			exit;
		}
		set_transient('baselayer_debug_page_error', '1', 30);
		wp_safe_redirect($url);
		exit;
	}
}, 1);

/**
 * Hide Debug tab in the nav when the current user cannot access it.
 *
 * @param array<string, array{label: string}> $tabs
 * @return array<string, array{label: string}>
 */
add_filter('bl_developer_settings_available_tabs', function (array $tabs): array {
	if (!isset($tabs['debug'])) {
		return $tabs;
	}
	if (!function_exists('bl_developer_can_access_debug') || !bl_developer_can_access_debug()) {
		unset($tabs['debug']);
	}
	return $tabs;
});

/**
 * Class name with optional overlay color swatch (matches front-end guides).
 */
function bl_debug_admin_class_label(string $class, string $color = ''): string
{
	$swatch = '';
	if ($color !== '') {
		$swatch = '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' . esc_attr($color) . ';margin-right:8px;vertical-align:middle;" aria-hidden="true"></span>';
	}

	return $swatch . '<code>' . esc_html($class) . '</code>';
}

function bl_render_developer_debug(): void
{
	if (!bl_developer_can_access_debug()) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'baselayer'));
	}

	$saved = get_transient('baselayer_debug_saved');
	if ($saved !== false) {
		delete_transient('baselayer_debug_saved');
	}
	$page_error = get_transient('baselayer_debug_page_error');
	if ($page_error !== false) {
		delete_transient('baselayer_debug_page_error');
	}

	$enabled = (string) get_option(BL_DEBUG_CONTAINER_WIDTHS_OPTION, '') === '1';
	$page_id = (int) get_option(BL_DEBUG_CONTAINER_WIDTHS_PAGE_OPTION, 0);
	$page = $page_id > 0 ? get_post($page_id) : null;
	$page_ok = $page instanceof WP_Post && $page->post_type === 'page' && $page->post_status !== 'trash';
	?>
	<div class="wrap">
		<?php bl_developer_settings_screen_heading(); ?>
		<?php if ($saved !== false) : ?>
			<div class="notice notice-success is-dismissible">
				<p><strong><?= esc_html__('Settings saved.', 'baselayer') ?></strong></p>
			</div>
		<?php endif; ?>
		<?php if ($page_error !== false) : ?>
			<div class="notice notice-error is-dismissible">
				<p><strong><?= esc_html__('Could not create the debug page.', 'baselayer') ?></strong></p>
			</div>
		<?php endif; ?>

		<?php bl_developer_settings_render_nav(); ?>

		<div class="bl-page-settings-form bl-admin-form">
			<h2 class="title"><?= esc_html__('Container widths', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('Front-end overlay with vertical guides for .container, .container-wide, .alignwide, and .alignwide.container-wide. Visible only to logged-in users who can edit posts.', 'baselayer') ?></p>

			<form method="post" action="">
				<?php wp_nonce_field('baselayer_save_debug_container_widths'); ?>
				<input type="hidden" name="baselayer_save_debug_container_widths" value="1">
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><?= esc_html__('Show guides', 'baselayer') ?></th>
						<td>
							<label>
								<input type="checkbox" name="<?= esc_attr(BL_DEBUG_CONTAINER_WIDTHS_OPTION) ?>" value="1" <?= checked($enabled, true, false) ?>>
								<?= esc_html__('Enable container width guides on the front end (editors and above)', 'baselayer') ?>
							</label>
						</td>
					</tr>
				</table>
				<div class="bl-submit-row">
					<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
				</div>
			</form>

			<hr style="margin: 28px 0;">

			<h3 class="title"><?= esc_html__('Container Spacings', 'baselayer') ?></h3>
			<p class="description"><?= esc_html__('Creates (or refreshes) a page with sample groups for comparing padding and bleed behaviour.', 'baselayer') ?></p>
			<form method="post" action="" style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
				<?php wp_nonce_field('baselayer_create_debug_container_widths_page'); ?>
				<input type="hidden" name="baselayer_create_debug_container_widths_page" value="1">
				<button type="submit" class="button">
					<?= $page_ok
						? esc_html__('Refresh debug page', 'baselayer')
						: esc_html__('Create debug page', 'baselayer') ?>
				</button>
				<?php if ($page_ok) : ?>
					<a class="button button-link" href="<?= esc_url(get_permalink($page_id) ?: '#') ?>" target="_blank" rel="noopener noreferrer">
						<?= esc_html__('View page', 'baselayer') ?>
					</a>
					<a class="button button-link" href="<?= esc_url(get_edit_post_link($page_id, 'raw') ?: '#') ?>">
						<?= esc_html__('Edit page', 'baselayer') ?>
					</a>
				<?php endif; ?>
			</form>

			<hr style="margin: 28px 0;">

			<h3 class="title"><?= esc_html__('Classes', 'baselayer') ?></h3>
			<p class="description"><?= esc_html__('Width classes bleed the block outward. Negate classes pad content back in (L/R uses !important and overrides inner-padding horizontal tokens). Combo-only negate classes are CSS-only — add them via Additional CSS class.', 'baselayer') ?></p>

			<h4 class="title" style="margin-top: 20px;"><?= esc_html__('Width (bleed out)', 'baselayer') ?></h4>
			<table class="widefat striped bl-table-small-gaps" role="presentation" style="margin-bottom: 0; max-width: 720px;">
				<thead>
					<tr>
						<th scope="col"><?= esc_html__('Class', 'baselayer') ?></th>
						<th scope="col"><?= esc_html__('Effect', 'baselayer') ?></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><?= bl_debug_admin_class_label('.container', '#2563eb') ?></td>
						<td><?= esc_html__('Content column.', 'baselayer') ?></td>
					</tr>
					<tr>
						<td><?= bl_debug_admin_class_label('.container-wide', '#ea580c') ?></td>
						<td><?= esc_html__('Bleed, keep page-padding from the viewport.', 'baselayer') ?></td>
					</tr>
					<tr>
						<td><?= bl_debug_admin_class_label('.alignwide', '#0d9488') ?></td>
						<td><?= esc_html__('Bleed, keep container-edge-spacing from the viewport.', 'baselayer') ?></td>
					</tr>
					<tr>
						<td><?= bl_debug_admin_class_label('.alignwide.container-wide', '#c026d3') ?></td>
						<td><?= esc_html__('Stack both one-side bleeds.', 'baselayer') ?></td>
					</tr>
					<tr>
						<td><?= bl_debug_admin_class_label('.alignfull') ?></td>
						<td><?= esc_html__('Full viewport. Not shown in the overlay.', 'baselayer') ?></td>
					</tr>
				</tbody>
			</table>

			<h4 class="title" style="margin-top: 24px;"><?= esc_html__('Negate (pad inward)', 'baselayer') ?></h4>
			<table class="widefat striped bl-table-small-gaps" role="presentation" style="margin-bottom: 0; max-width: 720px;">
				<thead>
					<tr>
						<th scope="col"><?= esc_html__('Class', 'baselayer') ?></th>
						<th scope="col"><?= esc_html__('Effect', 'baselayer') ?></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><?= bl_debug_admin_class_label('.-content-to-container') ?></td>
						<td><?= esc_html__('Pad back to the content column. Inner-padding toggle on Group and Cover. Alias: .-container-wide-content.', 'baselayer') ?></td>
					</tr>
					<tr>
						<td><?= bl_debug_admin_class_label('.-content-to-container-wide') ?></td>
						<td><?= esc_html__('Combo only. Pad the alignwide extra — content sits at container-wide.', 'baselayer') ?></td>
					</tr>
					<tr>
						<td><?= bl_debug_admin_class_label('.-content-to-alignwide') ?></td>
						<td><?= esc_html__('Combo only. Pad the container-wide extra — content sits at alignwide.', 'baselayer') ?></td>
					</tr>
				</tbody>
			</table>

			<p class="description" style="margin-top: 16px;"><?= esc_html__('Inner padding tokens: -container-padding-auto (A), -container-padding-none (0), -container-padding-xs … xl. Auto applies only with .has-background (combo → L).', 'baselayer') ?></p>
		</div>
	</div>
	<?php
}
