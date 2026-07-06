<?php

defined('ABSPATH') || exit;

/**
 * Theme settings → Blocks tab: save handler and UI.
 */

add_action('admin_init', function () {
	if (!current_user_can('manage_options') || !fs_theme_settings_is_settings_page_post()) {
		return;
	}
	if (empty($_POST['fromscratch_save_block_settings']) || empty($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], 'fromscratch_save_block_settings')) {
		return;
	}
	if (function_exists('fs_admin_can_access') && !fs_admin_can_access('theme_settings_blocks')) {
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
	wp_safe_redirect(fs_theme_settings_url_with_tab('blocks'));
	exit;
}, 1);

function fs_render_theme_settings_blocks_tab(): void
{
	$groups = function_exists('fs_block_settings_registry_by_category')
		? fs_block_settings_registry_by_category()
		: [];
	?>
	<form method="post" action="<?= esc_url(fs_theme_settings_url_with_tab('blocks')) ?>" class="fs-page-settings-form" id="fs-block-settings-form">
		<?php wp_nonce_field('fromscratch_save_block_settings'); ?>
		<input type="hidden" name="fromscratch_save_block_settings" value="1">
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
	<?php
}
