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
	$previous_system = function_exists('bl_theme_blocks_system') ? bl_theme_blocks_system() : 'none';
	$sanitized = function_exists('bl_sanitize_features') ? bl_sanitize_features($value) : [];
	update_option('baselayer_features', $sanitized);
	if (function_exists('bl_theme_feature_flush_cache')) {
		bl_theme_feature_flush_cache();
	}
	$next_system = function_exists('bl_theme_blocks_system') ? bl_theme_blocks_system() : 'none';
	set_transient('baselayer_features_saved', '1', 30);
	if ($previous_system !== $next_system) {
		set_transient(
			'baselayer_blocks_system_switched',
			['from' => $previous_system, 'to' => $next_system],
			120
		);
	}
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

	$blocks_switched = get_transient('baselayer_blocks_system_switched');
	if (is_array($blocks_switched)) {
		delete_transient('baselayer_blocks_system_switched');
	} else {
		$blocks_switched = null;
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

	$blocks_system = 'none';
	if ((int) $feat('enable_blocks') === 1) {
		$blocks_system = 'baselayer';
	} elseif ((int) $feat('enable_acf') === 1) {
		$blocks_system = 'acf';
	}

	$blocks_systems = [
		'baselayer' => [
			'label'       => __('BaseLayer Blocks', 'baselayer'),
			'badge'       => __('Recommended', 'baselayer'),
			'badge_bg'    => '#2271b1',
			'description' => __('Create and manage custom Gutenberg blocks, content fields, and website fields directly within BaseLayer.', 'baselayer'),
		],
		'acf' => [
			'label'       => __('ACF Pro', 'baselayer'),
			'badge'       => __('Requires ACF Pro Plugin', 'baselayer'),
			'badge_bg'    => '#D97706',
			'description' => __('Use ACF Pro to build custom Gutenberg blocks.', 'baselayer'),
		],
		'none' => [
			'label'       => __('None', 'baselayer'),
			'badge'       => '',
			'badge_bg'    => '',
			'description' => __('Use the default WordPress block editor.', 'baselayer'),
		],
	];
	$current_blocks = $blocks_systems[$blocks_system] ?? $blocks_systems['none'];

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

		<?php if (is_array($blocks_switched)) : ?>
			<div class="notice notice-warning is-dismissible">
				<p><strong><?= esc_html__('Blocks system changed', 'baselayer') ?></strong></p>
				<p><?= esc_html__('Existing pages keep their current block markup—Baselayer and ACF namespaces are not converted. Website and Hero storage also differs by engine, and nothing was imported or seeded automatically. Prefer choosing an engine at install and sticking with it.', 'baselayer') ?></p>
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
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_duplicate_post]" value="1" <?= checked($feat('enable_duplicate_post'), 1, false) ?>> <?= esc_html__('Allow duplication', 'baselayer') ?></label>
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
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_post_expirator]" value="1" <?= checked($feat('enable_post_expirator'), 1, false) ?>> <?= esc_html__('Enable post expirator', 'baselayer') ?></label>
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
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_seo]" value="1" <?= checked($feat('enable_seo'), 1, false) ?>> <?= esc_html__('Enable SEO panel', 'baselayer') ?></label>
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
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_breadcrumbs]" id="baselayer_features_enable_breadcrumbs" value="1" <?= checked($feat('enable_breadcrumbs'), 1, false) ?>> <?= esc_html__('Enable breadcrumbs', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Shows breadcrumb navigation on pages, posts, archives, and search.', 'baselayer') ?></p>
							<p class="description bl-indent-checkbox"><?= wp_kses(
								__('Needs <code class="bl-code-small">bl_breadcrumbs()</code> in templates to show.', 'baselayer'),
								['code' => ['class' => true]]
							) ?></p>
							<div class="bl-feature-sub" id="bl-feature-sub-breadcrumbs" style="margin-top: 12px; <?= $feat('enable_breadcrumbs') !== 1 ? 'display:none;' : '' ?>">
								<input type="hidden" name="baselayer_features[breadcrumbs_hide_first_level]" value="0">
								<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[breadcrumbs_hide_first_level]" value="1" <?= checked($feat('breadcrumbs_hide_first_level'), 1, false) ?>> <?= esc_html__('Hide on first level pages', 'baselayer') ?></label>
								<p class="description bl-indent-checkbox"><?= esc_html__('Only show breadcrumbs when there is a parent page other than the home page.', 'baselayer') ?></p>
							</div>
						</td>
					</tr>
				</table>

				<hr>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('Languages', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_languages]" value="0">
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_languages]" id="baselayer_features_enable_languages" value="1" <?= checked($feat('enable_languages'), 1, false) ?>> <?= esc_html__('Enable languages', 'baselayer') ?> <span style="display:inline-block;margin-left:6px;padding:0 6px;border-radius:3px;background:#BE123C;color:#fff;font-size:11px;font-weight:600;line-height:20px;vertical-align:1px;"><?= esc_html__('Beta', 'baselayer') ?></span></label>
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

			</div>

			<h3 style="margin-top: 32px;"><?= esc_html__('Packages', 'baselayer') ?></h3>

			<div class="bl-feature-group">

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('Forms', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_forms]" value="0">
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_forms]" value="1" <?= checked($feat('enable_forms'), 1, false) ?>> <?= esc_html__('Enable forms', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Adds a form builder, submissions, email notifications, and a Form block.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

				<hr>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><?= esc_html__('Blocks', 'baselayer') ?></th>
						<td>
							<div class="bl-blocks-system" data-bl-blocks-system data-current="<?= esc_attr($blocks_system) ?>">
								<label class="bl-blocks-system__current" style="font-weight: 500;">
									<input type="checkbox" checked disabled>
									<?= esc_html($current_blocks['label']) ?>
								</label>
								<p class="description bl-indent-checkbox"><?= esc_html($current_blocks['description']) ?></p>
								<p class="bl-blocks-system__change-wrap">
									<button type="button" class="button-link bl-blocks-system__change" data-bl-blocks-system-open><?= esc_html__('Change', 'baselayer') ?></button>
								</p>
								<input type="hidden" name="baselayer_features[blocks_system]" value="<?= esc_attr($blocks_system) ?>" data-bl-blocks-system-value>
								<input type="hidden" name="baselayer_features[enable_blocks]" value="0">
								<input type="hidden" name="baselayer_features[enable_acf]" value="0">
							</div>
						</td>
					</tr>
				</table>

				<hr>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('Events', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_events]" value="0">
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_events]" value="1" <?= checked($feat('enable_events'), 1, false) ?>> <?= esc_html__('Enable events', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Adds event types with dates, recurrence, statuses, metadata, and archives. Developers manage each type under its menu → Settings.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

				<hr>

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row" class="form-table-checkbox-label"><?= esc_html__('Editorial', 'baselayer') ?></th>
						<td>
							<input type="hidden" name="baselayer_features[enable_editorial]" value="0">
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_editorial]" value="1" <?= checked($feat('enable_editorial'), 1, false) ?>> <?= esc_html__('Enable editorial rights', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Manage editorial permissions, publishing approvals, page access, and media restrictions. Configure settings under Developer → Editorial and on editor profiles.', 'baselayer') ?></p>
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
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_media_folders]" value="1" <?= checked($feat('enable_media_folders'), 1, false) ?>> <?= esc_html__('Enable media folders', 'baselayer') ?></label>
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
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_svg]" value="1" <?= checked($feat('enable_svg'), 1, false) ?>> <?= esc_html__('Allow SVG uploads', 'baselayer') ?></label>
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
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_webp]" id="baselayer_features_enable_webp" value="1" <?= checked($feat('enable_webp'), 1, false) ?>> <?= esc_html__('Convert images to WebP', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Convert generated JPEG and PNG image to WebP. Requires GD or Imagick with WebP support.', 'baselayer') ?></p>
							<div class="bl-feature-sub" id="bl-feature-sub-webp" style="margin-top: 12px; <?= $feat('enable_webp') !== 1 ? 'display:none;' : '' ?>">
								<input type="hidden" name="baselayer_features[enable_webp_convert_original]" value="0">
								<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_webp_convert_original]" value="1" <?= checked($feat('enable_webp_convert_original'), 1, false) ?>> <?= esc_html__('Also convert the original image', 'baselayer') ?></label>
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
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_blocked_ips]" value="1" <?= checked($feat('enable_blocked_ips'), 1, false) ?>> <?= esc_html__('Enable IP blocking', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Allows blocking specific IP addresses and detects suspicious login attempts.', 'baselayer') ?></p>
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
							<label style="font-weight: 500;"><input type="checkbox" name="baselayer_features[enable_matomo]" value="1" <?= checked($feat('enable_matomo'), 1, false) ?>> <?= esc_html__('Enable Matomo analytics integration', 'baselayer') ?></label>
							<p class="description bl-indent-checkbox"><?= esc_html__('Enables Matomo script loading on the frontend using the settings from Developer › Settings.', 'baselayer') ?></p>
						</td>
					</tr>
				</table>

			</div>

			<div class="bl-submit-row">
				<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
			</div>
		</form>

		<div id="bl-blocks-system-modal" class="bl-blocks-system-modal" aria-hidden="true" hidden>
			<div class="bl-blocks-system-modal__backdrop" data-bl-blocks-system-close></div>
			<div class="bl-blocks-system-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="bl-blocks-system-modal-title">
				<h2 id="bl-blocks-system-modal-title"><?= esc_html__('Change blocks engine', 'baselayer') ?></h2>
				<div class="notice notice-info notice-alt inline bl-blocks-system-modal__warning">
					<p><?= esc_html__('Changing the blocks engine is not recommended once you\'ve started creating content. Existing content is not migrated automatically and may require manual adjustments. Only switch engines if your project is still in its early stages or you understand the implications.', 'baselayer') ?></p>
				</div>
				<fieldset class="bl-blocks-system-modal__choices">
					<?php foreach ($blocks_systems as $value => $option) : ?>
						<label class="bl-blocks-system-modal__choice">
							<span class="bl-blocks-system-modal__choice-label">
								<input type="radio" name="bl_blocks_system_choice" value="<?= esc_attr($value) ?>" <?= checked($blocks_system, $value, false) ?>>
								<span class="bl-blocks-system-modal__choice-text">
									<strong><?= esc_html($option['label']) ?></strong>
									<?php if ($option['badge'] !== '') : ?>
										<span class="bl-blocks-system__badge" style="background:<?= esc_attr($option['badge_bg']) ?>;"><?= esc_html($option['badge']) ?></span>
									<?php endif; ?>
								</span>
							</span>
							<span class="description"><?= esc_html($option['description']) ?></span>
						</label>
					<?php endforeach; ?>
				</fieldset>
				<div class="bl-blocks-system-modal__actions">
					<button type="button" class="button" data-bl-blocks-system-close><?= esc_html__('Cancel') ?></button>
					<button type="button" class="button button-primary" data-bl-blocks-system-switch disabled><?= esc_html__('Switch engine', 'baselayer') ?></button>
				</div>
			</div>
		</div>

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
				bindToggle('baselayer_features_enable_breadcrumbs', 'bl-feature-sub-breadcrumbs');
			})();
		</script>
	</div>
<?php
}
