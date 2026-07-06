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

/**
 * @param array<string, mixed> $block
 */
function fs_render_theme_settings_block_card(array $block): void
{
	$name = (string) $block['name'];
	$allowed = !empty($block['allowed']);
	$hidden = !empty($block['hidden']);
	$favorite = !empty($block['favorite']);
	$search_label = strtolower((string) $block['title'] . ' ' . $name);
	$mode = $hidden ? 'hidden' : ($favorite ? 'favorite' : '');
	?>
	<article
		class="fs-block-card<?= $allowed ? ' is-allowed' : ' is-disallowed' ?>"
		data-fs-block-settings-card
		data-search="<?= esc_attr($search_label) ?>"
		data-fs-block-default-allowed="1"
		data-fs-block-default-hidden="0"
		data-fs-block-default-favorite="0"
	>
		<div class="fs-block-card__top">
			<div class="fs-block-card__identity">
				<div class="fs-block-card__block-icon" aria-hidden="true">
					<?= fs_block_settings_render_icon_html($block['icon']) ?>
				</div>
				<div class="fs-block-card__meta">
					<h4 class="fs-block-card__title"><?= esc_html((string) $block['title']) ?></h4>
					<code class="fs-block-card__slug"><?= esc_html($name) ?></code>
				</div>
			</div>
			<label class="fs-block-card__allowed" title="<?= esc_attr__('Allowed in inserter', 'fromscratch') ?>">
				<input type="hidden" name="fromscratch_block_settings[<?= esc_attr($name) ?>][allowed]" value="0">
				<input
					type="checkbox"
					class="screen-reader-text"
					name="fromscratch_block_settings[<?= esc_attr($name) ?>][allowed]"
					value="1"
					<?= checked($allowed, true, false) ?>
					data-fs-block-settings-allowed
				>
				<span class="fs-block-card__allowed-btn" aria-hidden="true">
					<span class="fs-block-card__allowed-icon fs-block-card__allowed-icon--on dashicons dashicons-yes" aria-hidden="true"></span>
					<span class="fs-block-card__allowed-icon fs-block-card__allowed-icon--off dashicons dashicons-no-alt" aria-hidden="true"></span>
				</span>
				<span class="screen-reader-text"><?= esc_html__('Allowed in inserter', 'fromscratch') ?></span>
			</label>
		</div>

		<div
			class="fs-block-card__modes"
			role="group"
			aria-label="<?= esc_attr__('Inserter visibility', 'fromscratch') ?>"
			data-fs-block-settings-modes
		>
			<button
				type="button"
				class="fs-block-card__mode<?= $mode === 'hidden' ? ' is-active' : '' ?>"
				data-fs-block-settings-mode="hidden"
				aria-pressed="<?= $mode === 'hidden' ? 'true' : 'false' ?>"
			>
				<span class="dashicons dashicons-hidden" aria-hidden="true"></span>
				<span><?= esc_html__('Hidden', 'fromscratch') ?></span>
			</button>
			<button
				type="button"
				class="fs-block-card__mode<?= $mode === 'favorite' ? ' is-active' : '' ?>"
				data-fs-block-settings-mode="favorite"
				aria-pressed="<?= $mode === 'favorite' ? 'true' : 'false' ?>"
			>
				<span class="dashicons dashicons-star-filled" aria-hidden="true"></span>
				<span><?= esc_html__('Favorites', 'fromscratch') ?></span>
			</button>
		</div>

		<input type="hidden" name="fromscratch_block_settings[<?= esc_attr($name) ?>][hidden]" value="<?= $hidden ? '1' : '0' ?>" data-fs-block-settings-hidden>
		<input type="hidden" name="fromscratch_block_settings[<?= esc_attr($name) ?>][favorite]" value="<?= $favorite ? '1' : '0' ?>" data-fs-block-settings-favorite>

		<button type="button" class="fs-block-card__reset" data-fs-block-settings-reset>
			<?= esc_html__('Reset', 'fromscratch') ?>
		</button>
	</article>
	<?php
}

function fs_render_theme_settings_blocks_tab(): void
{
	$groups = function_exists('fs_block_settings_registry_configurable_by_category')
		? fs_block_settings_registry_configurable_by_category()
		: [];
	$system_blocks = function_exists('fs_block_settings_system_blocks')
		? fs_block_settings_system_blocks()
		: [];
	$system_count = count($system_blocks);
	?>
	<form method="post" action="<?= esc_url(fs_theme_settings_url_with_tab('blocks')) ?>" class="fs-page-settings-form" id="fs-block-settings-form">
		<?php wp_nonce_field('fromscratch_save_block_settings'); ?>
		<input type="hidden" name="fromscratch_save_block_settings" value="1">
		<h2 class="title"><?= esc_html__('Blocks', 'fromscratch') ?></h2>
		<p class="description fs-block-settings__intro">
			<?= esc_html__('Control which blocks are available in the page editor inserter (+).', 'fromscratch') ?>
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
			<section class="fs-block-settings__group" data-fs-block-settings-group>
				<h3 class="fs-block-settings__category"><?= esc_html(fs_block_settings_category_label($category)) ?></h3>
				<div class="fs-block-settings__grid">
					<?php foreach ($blocks as $block) :
						fs_render_theme_settings_block_card($block);
					endforeach; ?>
				</div>
			</section>
		<?php endforeach; ?>

		<?php if ($system_count > 0) : ?>
			<div class="fs-block-settings__system">
				<button
					type="button"
					class="button button-secondary fs-block-settings__system-toggle"
					data-fs-block-settings-system-toggle
					aria-expanded="false"
					aria-controls="fs-block-settings-system-panel"
				>
					<?= esc_html(sprintf(
						/* translators: %d: number of blocks hidden by the theme */
						_n('%d block hidden by system', '%d blocks hidden by system', $system_count, 'fromscratch'),
						$system_count
					)) ?>
				</button>
				<div id="fs-block-settings-system-panel" class="fs-block-settings__system-panel" hidden data-fs-block-settings-system-panel>
					<p class="description">
						<?= esc_html__('These blocks are disabled in code and cannot be enabled here.', 'fromscratch') ?>
					</p>
					<div class="fs-block-settings__system-grid">
						<?php foreach ($system_blocks as $block) : ?>
							<article class="fs-block-card fs-block-card--system">
								<div class="fs-block-card__top">
									<div class="fs-block-card__identity">
										<div class="fs-block-card__block-icon" aria-hidden="true">
											<?= fs_block_settings_render_icon_html($block['icon']) ?>
										</div>
										<div class="fs-block-card__meta">
											<h4 class="fs-block-card__title"><?= esc_html((string) $block['title']) ?></h4>
											<code class="fs-block-card__slug"><?= esc_html((string) $block['name']) ?></code>
											<p class="fs-block-card__system-note"><?= esc_html__('Hidden by system', 'fromscratch') ?></p>
										</div>
									</div>
								</div>
							</article>
						<?php endforeach; ?>
					</div>
				</div>
			</div>
		<?php endif; ?>

		<div class="fs-submit-row">
			<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
		</div>
	</form>
	<?php
}
