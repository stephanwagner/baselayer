<?php

defined('ABSPATH') || exit;

$bl_developer_tab = 'features';
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
		'bl_render_developer_features',
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
	if (empty($_POST['option_page']) || $_POST['option_page'] !== BL_THEME_OPTION_GROUP_FEATURES || empty($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], BL_THEME_OPTION_GROUP_FEATURES . '-options')) {
		return;
	}
	$value = isset($_POST['baselayer_features']) && is_array($_POST['baselayer_features']) ? $_POST['baselayer_features'] : [];
	$sanitized = function_exists('bl_sanitize_features') ? bl_sanitize_features($value) : [];
	update_option('baselayer_features', $sanitized);
	set_transient('baselayer_features_saved', '1', 30);
	wp_safe_redirect(admin_url('options-general.php?page=bl-developer-features'));
	exit;
}, 1);

function bl_render_developer_features(): void
{
	if (!current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'baselayer'));
	}

	$features_saved = get_transient('baselayer_features_saved');
	if ($features_saved !== false) {
		delete_transient('baselayer_features_saved');
	}

	$features = get_option('baselayer_features', []);
	if (!is_array($features)) {
		$features = [];
	}
	$defaults = function_exists('bl_theme_feature_defaults') ? bl_theme_feature_defaults() : [];
	$feat = function ($key) use ($features, $defaults) {
		return isset($features[$key]) ? (int) $features[$key] : (int) ($defaults[$key] ?? 0);
	};
	$language_mode = function_exists('bl_language_mode') ? bl_language_mode() : 'content';

	if (!function_exists('bl_webp_supported')) {
		require_once get_template_directory() . '/includes/image-webp.php';
	}
	$webp_enabled_no_support = ($feat('enable_webp') === 1 && !bl_webp_supported());
?>
	<div class="wrap">
		<?php bl_developer_settings_screen_heading(); ?>

		<?php if ($features_saved !== false) : ?>
			<div class="notice notice-success is-dismissible">
				<p><strong><?= esc_html(__('Settings saved.', 'baselayer')) ?></strong></p>
			</div>
		<?php endif; ?>

		<?php if ($webp_enabled_no_support) : ?>
			<div class="notice notice-warning is-dismissible">
				<p><strong><?= esc_html__('WebP conversion is enabled but no suitable image library was detected.', 'baselayer') ?></strong></p>
				<p><?php
					echo wp_kses(
						sprintf(
							/* translators: 1: link to PHP GD manual, 2: link to PHP Imagick manual */
							__('Convert images to WebP requires the PHP %1$s extension (with WebP support) or the %2$s extension. Neither is available on this server. New uploads will not be converted to WebP until you install one of them.', 'baselayer'),
							'<a href="' . esc_url('https://www.php.net/manual/en/book.image.php') . '" target="_blank" rel="noopener noreferrer">GD</a>',
							'<a href="' . esc_url('https://www.php.net/manual/en/book.imagick.php') . '" target="_blank" rel="noopener noreferrer">ImageMagick</a>'
						),
						['a' => ['href' => true, 'target' => true, 'rel' => true]]
					);
					?></p>
			</div>
		<?php endif; ?>

		<?php bl_developer_settings_render_nav(); ?>

		<form method="post" action="" class="bl-page-settings-form">
			<h2 class="title"><?= esc_html__('Features', 'baselayer') ?></h2>
			<p class="description"><?= esc_html__('Enable the features your project needs.', 'baselayer') ?></p>
			<p class="description"><?= esc_html__('All features are modular and can be toggled at any time to keep the theme lean and maintainable.', 'baselayer') ?></p>
			
			<h3 style="margin-top: 24px;"><?= esc_html__('Content', 'baselayer') ?></h3>

			<div class="bl-feature-group">

				<?php settings_fields(BL_THEME_OPTION_GROUP_FEATURES); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('Duplicate', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_duplicate_post]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_duplicate_post]" value="1" <?= checked($feat('enable_duplicate_post'), 1, false) ?>> <?= esc_html__('Allow duplication', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Shows a "Duplicate" row action for pages and posts.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

				<hr>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('Post expirator', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_post_expirator]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_post_expirator]" value="1" <?= checked($feat('enable_post_expirator'), 1, false) ?>> <?= esc_html__('Enable post expirator', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Adds an expiration date to pages and posts.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

				<hr>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('SEO', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_seo]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_seo]" value="1" <?= checked($feat('enable_seo'), 1, false) ?>> <?= esc_html__('Enable SEO panel', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Adds a section to pages and posts to enter SEO info.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

				<hr>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('Breadcrumbs', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_breadcrumbs]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_breadcrumbs]" value="1" <?= checked($feat('enable_breadcrumbs'), 1, false) ?>> <?= esc_html__('Enable breadcrumbs', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Shows breadcrumb navigation on pages, posts, archives, and search.', 'baselayer') ?></p>
							<p class="description bl-indent-checkbox"><?= wp_kses(
								__('Needs <code class="bl-code-small">bl_breadcrumbs()</code> in templates to show.', 'baselayer'),
								['code' => ['class' => true]]
							) ?></p>
						</td>
					</tr>
				</table>

				<hr>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('Languages', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_languages]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_languages]" id="baselayer_features_enable_languages" value="1" <?= checked($feat('enable_languages'), 1, false) ?>> <?= esc_html__('Enable languages', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Enables built-in support for multiple content languages.', 'baselayer') ?></p>
							<div id="bl-language-mode-wrap" class="bl-language-mode-wrap" style="margin-top: 12px; <?= $feat('enable_languages') ? '' : 'display:none;' ?>">
								<fieldset>
									<legend class="screen-reader-text"><?= esc_html__('Translation method', 'baselayer') ?></legend>
									<label style="display: block; margin-bottom: 8px;">
										<input type="radio" name="baselayer_features[language_mode]" value="content" <?= checked($language_mode, 'content', false) ?>>
										<?= esc_html__('Content translations', 'baselayer') ?>
									</label>
									<p class="description bl-indent-checkbox" style="margin-top: 0; margin-bottom: 12px;"><?= esc_html__('Separate posts or pages per language with URL prefixes and editor translation panels.', 'baselayer') ?></p>
									<label style="display: block;">
										<input type="radio" name="baselayer_features[language_mode]" value="google_translate" <?= checked($language_mode, 'google_translate', false) ?>>
										<?= esc_html__('Google Translate', 'baselayer') ?>
									</label>
									<p class="description bl-indent-checkbox" style="margin-top: 0;"><?= esc_html__('Single-language content with automatic on-page translation via Google Translate. Configure languages under Developer → Languages.', 'baselayer') ?></p>
								</fieldset>
							</div>
						</td>
					</tr>
				</table>
				<script>
					(function () {
						var checkbox = document.getElementById('baselayer_features_enable_languages');
						var wrap = document.getElementById('bl-language-mode-wrap');
						if (!checkbox || !wrap) return;
						function toggle() {
							wrap.style.display = checkbox.checked ? '' : 'none';
						}
						checkbox.addEventListener('change', toggle);
					})();
				</script>

				<hr>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('Forms', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_forms]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_forms]" value="1" <?= checked($feat('enable_forms'), 1, false) ?>> <?= esc_html__('Enable forms', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Adds a form builder, submissions, email notifications, and a Form block.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

			</div>

			<h3 style="margin-top: 32px;"><?= esc_html__('Media', 'baselayer') ?></h3>

			<div class="bl-feature-group">

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('Media folders', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_media_folders]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_media_folders]" value="1" <?= checked($feat('enable_media_folders'), 1, false) ?>> <?= esc_html__('Enable media folders', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Adds folders to the Media Library with a sidebar for organizing.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

				<hr>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('SVG support', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_svg]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_svg]" value="1" <?= checked($feat('enable_svg'), 1, false) ?>> <?= esc_html__('Allow SVG uploads', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Uploaded SVG files are automatically sanitized to remove potentially unsafe code.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

				<hr>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('WebP images', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_webp]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_webp]" id="baselayer_features_enable_webp" value="1" <?= checked($feat('enable_webp'), 1, false) ?>> <?= esc_html__('Convert images to WebP', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Convert generated JPEG and PNG image to WebP. Requires GD or Imagick with WebP support.', 'baselayer') ?></p>
							<div class="bl-feature-sub" id="bl-feature-sub-webp" style="margin-top: 12px; <?= $feat('enable_webp') !== 1 ? 'display:none;' : '' ?>">
								<input type="hidden" name="baselayer_features[enable_webp_convert_original]" value="0">
								<label><input type="checkbox" name="baselayer_features[enable_webp_convert_original]" value="1" <?= checked($feat('enable_webp_convert_original'), 1, false) ?>> <?= esc_html__('Also convert the original image', 'baselayer') ?></label>
								<p class="description bl-indent-checkbox"><?= esc_html__('By default, only resized versions of an image are converted. The original upload remains unchanged.', 'baselayer') ?></p>
							</div>
						</td>
					</tr>
				</table>

			</div>

			<h3 style="margin-top: 32px;"><?= esc_html__('Security', 'baselayer') ?></h3>

			<div class="bl-feature-group">

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('IP Blocking', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_blocked_ips]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_blocked_ips]" value="1" <?= checked($feat('enable_blocked_ips'), 1, false) ?>> <?= esc_html__('Enable IP blocking', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Allows blocking specific IP addresses and detects suspicious login attempts.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

			</div>

			<h3 style="margin-top: 32px;"><?= esc_html__('Blocks', 'baselayer') ?></h3>

			<div class="bl-feature-group">

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label">
							<?= esc_html__('Block Creator', 'baselayer') ?>
							<span class="bl-feature-beta"><?= esc_html__('Beta', 'baselayer') ?></span>
						</th>
						<td>
							<input type="hidden" name="baselayer_features[enable_block_creator]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_block_creator]" value="1" <?= checked($feat('enable_block_creator'), 1, false) ?>> <?= esc_html__('Enable Block Creator UI', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Adds an admin UI to overlay block-option presets and assignments. File config (config/block-options.php) remains the baseline.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

			</div>

			<h3 style="margin-top: 32px;"><?= esc_html__('Analytics', 'baselayer') ?></h3>

			<div class="bl-feature-group">

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label">Matomo</th>
						<td>
							<input type="hidden" name="baselayer_features[enable_matomo]" value="0">
							<label><input type="checkbox" name="baselayer_features[enable_matomo]" value="1" <?= checked($feat('enable_matomo'), 1, false) ?>> <?= esc_html__('Enable Matomo analytics integration', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Enables Matomo script loading on the frontend using the settings from Developer › Settings.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

			</div>

			<div class="bl-submit-row">
				<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
			</div>
		</form>
		<script>
			(function() {
				function bindToggle(mainId, subId) {
					var main = document.getElementById(mainId);
					var sub = document.getElementById(subId);
					if (!main || !sub) return;

					function toggle() {
						sub.style.display = main.checked ? '' : 'none';
					}
					main.addEventListener('change', toggle);
				}
				bindToggle('baselayer_features_enable_webp', 'bl-feature-sub-webp');
			})();
		</script>
	</div>
<?php
}
