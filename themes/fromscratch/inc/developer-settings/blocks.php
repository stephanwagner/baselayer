<?php

defined('ABSPATH') || exit;

$fs_developer_tab = 'blocks';
$fs_developer_page_slug = fs_developer_settings_page_slug($fs_developer_tab);

add_action('admin_menu', function () use ($fs_developer_tab, $fs_developer_page_slug) {
	if (!current_user_can('manage_options')) {
		return;
	}
	if (!function_exists('fs_is_developer_user') || !fs_is_developer_user((int) get_current_user_id())) {
		return;
	}
	$tabs = fs_developer_settings_available_tabs();
	if (!isset($tabs[$fs_developer_tab])) {
		return;
	}
	$label = $tabs[$fs_developer_tab]['label'];
	add_submenu_page(
		'options-general.php',
		__('Developer settings', 'fromscratch') . ' – ' . $label,
		sprintf(__('Developer › %s', 'fromscratch'), $label),
		'manage_options',
		$fs_developer_page_slug,
		'fs_render_developer_blocks',
		fs_developer_tab_position($fs_developer_tab)
	);
}, 20);

add_action('admin_init', function () use ($fs_developer_page_slug) {
	global $pagenow;
	if ($pagenow !== 'options-general.php' || $_SERVER['REQUEST_METHOD'] !== 'POST') {
		return;
	}
	if ((isset($_GET['page']) ? $_GET['page'] : '') !== $fs_developer_page_slug) {
		return;
	}
	if (!current_user_can('manage_options') || !function_exists('fs_is_developer_user') || !fs_is_developer_user((int) get_current_user_id())) {
		return;
	}
	if (empty($_POST['option_page']) || $_POST['option_page'] !== FS_THEME_OPTION_GROUP_DEVELOPER || empty($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], FS_THEME_OPTION_GROUP_DEVELOPER . '-options')) {
		return;
	}

	$posted = isset($_POST['fromscratch_block_settings']) && is_array($_POST['fromscratch_block_settings'])
		? wp_unslash($_POST['fromscratch_block_settings'])
		: [];

	$complete = [];
	foreach (array_keys(fs_block_settings_get_all()) as $block_name) {
		$complete[$block_name] = isset($posted[$block_name]) && is_array($posted[$block_name])
			? $posted[$block_name]
			: [];
	}

	$sanitized = function_exists('fs_sanitize_block_settings')
		? fs_sanitize_block_settings($complete)
		: [];

	foreach (fs_block_settings_get_all() as $block_name => $flags) {
		if (!empty($flags['hardDisallowed'])) {
			$sanitized[$block_name] = [
				'allowed'  => 0,
				'hidden'   => 0,
				'favorite' => 0,
			];
		}
	}

	update_option(FS_BLOCK_SETTINGS_OPTION, $sanitized);
	set_transient('fromscratch_blocks_saved', '1', 30);
	wp_safe_redirect(admin_url('options-general.php?page=' . $fs_developer_page_slug));
	exit;
}, 1);

function fs_render_developer_blocks(): void
{
	if (!current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'fromscratch'));
	}

	$blocks_saved = get_transient('fromscratch_blocks_saved');
	if ($blocks_saved !== false) {
		delete_transient('fromscratch_blocks_saved');
	}

	$groups = function_exists('fs_block_settings_registry_by_category')
		? fs_block_settings_registry_by_category()
		: [];
	?>
	<div class="wrap">
		<?php fs_developer_settings_screen_heading(); ?>
		<?php if ($blocks_saved !== false) : ?>
			<div class="notice notice-success is-dismissible">
				<p><strong><?= esc_html(__('Settings saved.', 'fromscratch')) ?></strong></p>
			</div>
		<?php endif; ?>

		<?php fs_developer_settings_render_nav(); ?>

		<form method="post" action="" class="fs-page-settings-form" id="fs-block-settings-form">
			<h2 class="title"><?= esc_html__('Blocks', 'fromscratch') ?></h2>
			<p class="description" style="margin-bottom: 16px;">
				<?= esc_html__('Control which blocks are available in the page editor inserter (+). Hard-disallowed blocks are locked in code and cannot be enabled here.', 'fromscratch') ?>
			</p>

			<p class="fs-block-settings__search-wrap">
				<label class="screen-reader-text" for="fs-block-settings-search"><?= esc_html__('Search blocks', 'fromscratch') ?></label>
				<input
					type="search"
					id="fs-block-settings-search"
					class="regular-text"
					placeholder="<?= esc_attr__('Search blocks…', 'fromscratch') ?>"
					data-fs-block-settings-search
				>
			</p>

			<?php settings_fields(FS_THEME_OPTION_GROUP_DEVELOPER); ?>

			<?php foreach ($groups as $category => $blocks) : ?>
				<div class="fs-admin-group -has-margin fs-block-settings__group" data-fs-block-settings-group>
					<h3 class="title"><?= esc_html(fs_block_settings_category_label($category)) ?></h3>
					<table class="widefat striped fs-table-small-gaps fs-block-settings__table" role="presentation">
						<thead>
							<tr>
								<th scope="col" class="fs-block-settings__col-icon" aria-hidden="true"></th>
								<th scope="col" class="fs-block-settings__col-name"><?= esc_html__('Name', 'fromscratch') ?></th>
								<th scope="col" class="fs-block-settings__col-flag"><?= esc_html__('Allowed', 'fromscratch') ?></th>
								<th scope="col" class="fs-block-settings__col-flag"><?= esc_html__('Hidden', 'fromscratch') ?></th>
								<th scope="col" class="fs-block-settings__col-flag"><?= esc_html__('Favorite', 'fromscratch') ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ($blocks as $block) :
								$name = (string) $block['name'];
								$locked = !empty($block['hardDisallowed']);
								$allowed = !empty($block['allowed']);
								$hidden = !empty($block['hidden']);
								$favorite = !empty($block['favorite']);
								$row_class = $locked ? 'fs-block-settings-row--locked' : '';
								$search_label = strtolower((string) $block['title'] . ' ' . $name);
							?>
								<tr class="<?= esc_attr($row_class) ?>" data-fs-block-settings-row data-search="<?= esc_attr($search_label) ?>">
									<td class="fs-block-settings__col-icon">
										<?= fs_block_settings_render_icon_html($block['icon']) ?>
									</td>
									<td class="fs-block-settings__col-name row-title">
										<?= esc_html((string) $block['title']) ?>
										<?php if ($locked) : ?>
											<span class="fs-block-settings__locked-hint"><?= esc_html__('Locked in code', 'fromscratch') ?></span>
										<?php endif; ?>
										<code class="fs-block-settings__slug"><?= esc_html($name) ?></code>
									</td>
									<td class="fs-block-settings__col-flag">
										<?php if ($locked) : ?>
											<input type="hidden" name="fromscratch_block_settings[<?= esc_attr($name) ?>][allowed]" value="0">
											<input type="checkbox" disabled <?= checked($allowed, true, false) ?>>
										<?php else : ?>
											<input type="hidden" name="fromscratch_block_settings[<?= esc_attr($name) ?>][allowed]" value="0">
											<label>
												<input
													type="checkbox"
													name="fromscratch_block_settings[<?= esc_attr($name) ?>][allowed]"
													value="1"
													<?= checked($allowed, true, false) ?>
													data-fs-block-settings-allowed
												>
											</label>
										<?php endif; ?>
									</td>
									<td class="fs-block-settings__col-flag">
										<?php if ($locked || !$allowed) : ?>
											<span class="fs-block-settings__dash" aria-hidden="true">—</span>
										<?php else : ?>
											<input type="hidden" name="fromscratch_block_settings[<?= esc_attr($name) ?>][hidden]" value="0">
											<label>
												<input
													type="checkbox"
													name="fromscratch_block_settings[<?= esc_attr($name) ?>][hidden]"
													value="1"
													<?= checked($hidden, true, false) ?>
													data-fs-block-settings-hidden
												>
											</label>
										<?php endif; ?>
									</td>
									<td class="fs-block-settings__col-flag">
										<?php if ($locked || !$allowed || $hidden) : ?>
											<span class="fs-block-settings__dash" aria-hidden="true">—</span>
										<?php else : ?>
											<input type="hidden" name="fromscratch_block_settings[<?= esc_attr($name) ?>][favorite]" value="0">
											<label>
												<input
													type="checkbox"
													name="fromscratch_block_settings[<?= esc_attr($name) ?>][favorite]"
													value="1"
													<?= checked($favorite, true, false) ?>
													data-fs-block-settings-favorite
												>
											</label>
										<?php endif; ?>
									</td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				</div>
			<?php endforeach; ?>

			<div class="fs-submit-row">
				<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
			</div>
		</form>
	</div>
	<?php
}
