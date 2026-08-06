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

		<div class="bl-page-settings-form bl-admin-form">
			<?php $asset_version = get_option('baselayer_asset_version', '1'); ?>
			<h2 class="title"><?= esc_html__('Asset Cache', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('Bump when static theme files using bl_asset_url have been changed so the cache of the files is updated.', 'baselayer') ?></p>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?= esc_html__('Cache version', 'baselayer') ?></th>
					<td>
						<div style="display: flex; align-items: center;">
							<input
								type="text"
								id="bl-asset-cache-version"
								readonly
								class="code"
								value="<?= esc_attr($asset_version) ?>"
								style="width: 36px; text-align: center;"
								aria-label="<?= esc_attr__('Cache version', 'baselayer') ?>"
							>
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
				<div class="bl-submit-row"><button type="submit" class="button button-primary"><?= esc_html_x('Refresh Permalink Rules', 'Button text', 'baselayer') ?></button></div>
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
				<div class="bl-submit-row"><button type="submit" class="button button-primary"><?= esc_html__('Clean revisions', 'baselayer') ?></button></div>
			</form>

			<hr>

			<?php
			$media_cleanup_i18n = [
				'notScanned' => __('Orphaned files: Not scanned yet', 'baselayer'),
				'scanning' => __('Scanning uploads…', 'baselayer'),
				'checkedOne' => __('✓ %s file checked', 'baselayer'),
				'checkedMany' => __('✓ %s files checked', 'baselayer'),
				'orphansFoundOne' => __('⚠ %s orphaned file found', 'baselayer'),
				'orphansFoundMany' => __('⚠ %s orphaned files found', 'baselayer'),
				'orphansNone' => __('✓ No orphaned files found', 'baselayer'),
				'modalIntroOne' => __('%s orphaned file was found.', 'baselayer'),
				'modalIntroMany' => __('%s orphaned files were found.', 'baselayer'),
				'fileOne' => __('%s file', 'baselayer'),
				'fileMany' => __('%s files', 'baselayer'),
				'deleting' => __('Deleting…', 'baselayer'),
				'deleteError' => __('Could not delete the selected files.', 'baselayer'),
				'scanError' => __('Could not scan uploads.', 'baselayer'),
				'confirmDelete' => __('Delete the selected files permanently? This cannot be undone.', 'baselayer'),
				'confirmDeleteTitle' => __('Delete files?', 'baselayer'),
				'confirmDeleteAction' => __('Delete permanently', 'baselayer'),
				'confirmDeleteCountOne' => __('Delete %s selected file permanently? This cannot be undone.', 'baselayer'),
				'confirmDeleteCountMany' => __('Delete %s selected files permanently? This cannot be undone.', 'baselayer'),
				'openFile' => __('Open file in new tab', 'baselayer'),
				'selectAll' => __('Select all', 'baselayer'),
				'selectNone' => __('Select none', 'baselayer'),
			];
			?>
			<div
				id="bl-media-cleanup"
				class="bl-media-cleanup"
				data-ajax-url="<?= esc_url(admin_url('admin-ajax.php')) ?>"
				data-nonce="<?= esc_attr(wp_create_nonce('bl_media_cleanup')) ?>"
				data-i18n="<?= esc_attr(wp_json_encode($media_cleanup_i18n)) ?>"
			>
				<h2 class="title" style="margin-top: 28px;"><?= esc_html__('Media Cleanup', 'baselayer') ?></h2>
				<p class="description"><?= esc_html__('Find files in /uploads that are no longer referenced by WordPress.', 'baselayer') ?></p>
				<div class="bl-media-cleanup__status" data-media-cleanup-status>
					<p class="bl-media-cleanup__status-line" data-media-cleanup-idle><?= esc_html__('Orphaned files: Not scanned yet', 'baselayer') ?></p>
					<div class="bl-media-cleanup__status-results" data-media-cleanup-results hidden>
						<p class="bl-media-cleanup__status-line bl-media-cleanup__status-line--ok" data-media-cleanup-checked></p>
						<p class="bl-media-cleanup__status-line bl-media-cleanup__status-line--warn" data-media-cleanup-orphans></p>
					</div>
				</div>
				<div class="bl-submit-row bl-media-cleanup__actions">
					<button type="button" class="button button-primary" data-media-cleanup-scan><?= esc_html__('Scan Uploads', 'baselayer') ?></button>
					<button type="button" class="button" data-media-cleanup-review hidden disabled><?= esc_html__('Review Files', 'baselayer') ?></button>
				</div>

				<div id="bl-media-cleanup-modal" class="bl-media-cleanup-modal" aria-hidden="true" hidden>
					<div class="bl-media-cleanup-modal__backdrop" data-media-cleanup-close></div>
					<div class="bl-media-cleanup-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="bl-media-cleanup-modal-title">
						<div class="bl-media-cleanup-modal__header">
							<h2 id="bl-media-cleanup-modal-title"><?= esc_html__('Media Cleanup', 'baselayer') ?></h2>
							<p class="bl-media-cleanup-modal__intro" data-media-cleanup-modal-intro></p>
							<p class="description">
								<?= esc_html__('These files exist in uploads but are not referenced by any attachment.', 'baselayer') ?>
							</p>
							<p class="description">
								<?= esc_html__('They may still be used manually from HTML, CSS or another plugin.', 'baselayer') ?>
							</p>
						</div>
						<div class="bl-media-cleanup-modal__toolbar">
							<button type="button" class="button bl-button-small" data-media-cleanup-select-toggle><?= esc_html__('Select all', 'baselayer') ?></button>
						</div>
						<div class="bl-media-cleanup-modal__list" data-media-cleanup-list role="list"></div>
						<div class="bl-media-cleanup-modal__footer">
							<div class="bl-media-cleanup-modal__selection" data-media-cleanup-selection>
								<strong><?= esc_html__('Selected:', 'baselayer') ?></strong>
								<span data-media-cleanup-selected-count><?= esc_html(sprintf(__('%s files', 'baselayer'), '0')) ?></span>
								<span data-media-cleanup-selected-size></span>
							</div>
							<div class="bl-media-cleanup-modal__actions">
								<button type="button" class="button" data-media-cleanup-close><?= esc_html__('Cancel', 'baselayer') ?></button>
								<button type="button" class="button button-primary button-link-delete" data-media-cleanup-delete disabled><?= esc_html__('Delete Selected', 'baselayer') ?></button>
							</div>
						</div>
					</div>
				</div>

				<div id="bl-media-cleanup-confirm" class="bl-media-cleanup-confirm" aria-hidden="true" hidden>
					<div class="bl-media-cleanup-confirm__backdrop" data-media-cleanup-confirm-close></div>
					<div class="bl-media-cleanup-confirm__dialog" role="dialog" aria-modal="true" aria-labelledby="bl-media-cleanup-confirm-title">
						<h2 id="bl-media-cleanup-confirm-title"><?= esc_html__('Delete files?', 'baselayer') ?></h2>
						<p id="bl-media-cleanup-confirm-text" data-media-cleanup-confirm-text></p>
						<div class="bl-media-cleanup-confirm__actions">
							<button type="button" class="button" data-media-cleanup-confirm-close><?= esc_html__('Cancel', 'baselayer') ?></button>
							<button type="button" class="button button-primary button-link-delete" data-media-cleanup-confirm-delete><?= esc_html__('Delete permanently', 'baselayer') ?></button>
						</div>
					</div>
				</div>
			</div>

			<hr>

			<?php
			$google_font_target = function_exists('bl_google_font_install_target') ? bl_google_font_install_target() : null;
			$google_font_i18n = [
				'searchPlaceholder' => __('Search Google Fonts…', 'baselayer'),
				'searching' => __('Searching…', 'baselayer'),
				'noResults' => __('No fonts match your search.', 'baselayer'),
				'searchError' => __('Could not load fonts.', 'baselayer'),
				'selectPrompt' => __('Select a font to preview and install.', 'baselayer'),
				'previewSample' => __('The quick brown fox jumps over the lazy dog. 1234567890', 'baselayer'),
				'installing' => __('Installing…', 'baselayer'),
				'install' => __('Install', 'baselayer'),
				'installError' => __('Could not install the font.', 'baselayer'),
				'installSuccess' => __('Font installed.', 'baselayer'),
				'copy' => __('Copy', 'baselayer'),
				'copied' => __('Copied', 'baselayer'),
				'selected' => __('Selected', 'baselayer'),
			];
			?>
			<div
				id="bl-google-font"
				class="bl-google-font"
				data-ajax-url="<?= esc_url(admin_url('admin-ajax.php')) ?>"
				data-nonce="<?= esc_attr(wp_create_nonce('bl_google_font')) ?>"
				data-target-label="<?= esc_attr($google_font_target['label'] ?? '') ?>"
				data-i18n="<?= esc_attr(wp_json_encode($google_font_i18n)) ?>"
			>
				<h2 class="title" style="margin-top: 28px;"><?= esc_html__('Install Google Font', 'baselayer') ?></h2>
				<p class="description"><?= esc_html__('Download a Google Font into your theme as self-hosted files (same layout as the built-in Baselayer fonts).', 'baselayer') ?></p>
				<?php if (is_array($google_font_target)) : ?>
					<p class="description"><?= esc_html(sprintf(
						/* translators: %s: child or parent theme label */
						__('Files will be saved to: %s', 'baselayer'),
						$google_font_target['label']
					)) ?></p>
				<?php endif; ?>
				<div class="bl-submit-row">
					<button type="button" class="button button-primary" data-bl-google-font-open><?= esc_html__('Choose fonts', 'baselayer') ?></button>
				</div>

				<div id="bl-google-font-modal" class="bl-google-font-modal" aria-hidden="true" hidden>
					<div class="bl-google-font-modal__backdrop" data-bl-google-font-close></div>
					<div class="bl-google-font-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="bl-google-font-modal-title">
						<div class="bl-google-font-modal__header">
							<h2 id="bl-google-font-modal-title"><?= esc_html__('Install Google Font', 'baselayer') ?></h2>
							<button type="button" class="bl-google-font-modal__close" data-bl-google-font-close aria-label="<?= esc_attr__('Close') ?>">
								<span class="bl-icon -icon-close" aria-hidden="true"></span>
							</button>
						</div>
						<div class="bl-google-font-modal__body">
							<label class="screen-reader-text" for="bl-google-font-search"><?= esc_html__('Search Google Fonts…', 'baselayer') ?></label>
							<input
								type="search"
								id="bl-google-font-search"
								class="regular-text bl-google-font-modal__search"
								placeholder="<?= esc_attr__('Search Google Fonts…', 'baselayer') ?>"
								autocomplete="off"
								data-bl-google-font-search
							>
							<div class="bl-google-font-modal__layout">
								<div class="bl-google-font-modal__results" data-bl-google-font-results role="listbox" aria-label="<?= esc_attr__('Search results', 'baselayer') ?>"></div>
								<div class="bl-google-font-modal__preview-pane">
									<p class="description" data-bl-google-font-preview-empty><?= esc_html__('Select a font to preview and install.', 'baselayer') ?></p>
									<div class="bl-google-font-modal__preview" data-bl-google-font-preview hidden>
										<p class="bl-google-font-modal__preview-name" data-bl-google-font-preview-name></p>
										<p class="bl-google-font-modal__preview-sample" data-bl-google-font-preview-sample></p>
									</div>
									<div class="bl-google-font-modal__success notice notice-success notice-alt inline" data-bl-google-font-success hidden>
										<p><strong data-bl-google-font-success-title></strong></p>
										<p data-bl-google-font-success-meta></p>
										<p class="description" data-bl-google-font-success-hint></p>
										<pre class="bl-google-font-modal__snippet" data-bl-google-font-success-snippet></pre>
										<button type="button" class="button bl-button-small" data-bl-google-font-copy><?= esc_html__('Copy', 'baselayer') ?></button>
									</div>
								</div>
							</div>
						</div>
						<div class="bl-google-font-modal__actions">
							<button type="button" class="button" data-bl-google-font-close><?= esc_html__('Cancel') ?></button>
							<button type="button" class="button button-primary" data-bl-google-font-install disabled><?= esc_html__('Install', 'baselayer') ?></button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<?php
}
