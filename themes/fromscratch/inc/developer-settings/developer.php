<?php

defined('ABSPATH') || exit;

$fs_developer_tab = 'developer';
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
		__('Developer', 'fromscratch'),
		'manage_options',
		$fs_developer_page_slug,
		'fs_render_developer_cheatsheet',
		fs_developer_tab_position($fs_developer_tab)
	);
}, 20);

function fs_render_developer_cheatsheet(): void
{
	if (!current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'fromscratch'));
	}

?>
	<div class="wrap">
		<?php fs_developer_settings_screen_heading(); ?>
		<?php fs_developer_settings_render_nav(); ?>

		<?php
		if (function_exists('fs_developer_render_system_info_panel')) {
			fs_developer_render_system_info_panel();
		}
		?>
		<hr class="fs-page-settings-divider">

		<div class="fs-page-settings-form" style="margin-top: 0;">

			<h2 class="title" style="margin-top: 0;"><?= esc_html__('Configs', 'fromscratch') ?></h2>
			<p class="description"><?= esc_html__('Optional defines in wp-config.php for local development and testing.', 'fromscratch') ?></p>

			<table class="widefat striped helpers-table__table">
				<tbody>
					<tr>
						<td>
							<strong><?= esc_html__('Simulate client IP', 'fromscratch') ?></strong><br>
							<span class="description"><?= esc_html__('Overrides the client IP with a fixed IP address. Active only when WP_DEBUG is true.', 'fromscratch') ?></span>
						</td>
						<td style="width: 100%;">
							<code class="fs-code-small">define('FS_SIMULATE_CLIENT_IP', '127.0.0.22');</code>
						</td>
					</tr>
				</tbody>
			</table>

			<hr style="margin: 28px 0;">

			<h2 class="title" style="margin-top: 0;"><?= esc_html__('Helpers', 'fromscratch') ?></h2>
			<p class="description"><?= esc_html__('Common helper functions and utilities for templates, theme code, and frontend scripts.', 'fromscratch') ?></p>

			<table class="widefat striped helpers-table__table">
				<tbody>
					<tr>
						<td>
							<strong><?= esc_html__('Asset URL', 'fromscratch') ?></strong><br>
							<span class="description"><?= esc_html__('Builds versioned asset URLs from the theme assets folder.', 'fromscratch') ?></span>
						</td>
						<td>
							<code class="fs-code-text fs-code-small">PHP</code>
						</td>
						<td>
							<code class="fs-code-small"><?= esc_html("fs_asset_url('/img/logo.svg');") ?></code>
							<div class="helpers-table__preview-code">
								<span class="helpers-table__preview-pointer">→</span> <code class="fs-code-text fs-code-small">/assets/img/logo.svg?ver=1</code>
							</div>
						</td>
					</tr>
					<tr>
						<td>
							<strong><?= esc_html__('Inline SVG Code', 'fromscratch') ?></strong><br>
							<span class="description"><?= esc_html__('Reads an SVG file and returns inline markup you can echo in templates.', 'fromscratch') ?></span>
						</td>
						<td>
							<code class="fs-code-text fs-code-small">PHP</code>
						</td>
						<td>
							<code class="fs-code-small"><?= esc_html("fs_svg_code('/img/icon.svg', ['class' => 'my-class']);") ?></code>
							<div class="helpers-table__preview-code">
								<span class="helpers-table__preview-pointer">→</span> <code class="fs-code-text fs-code-small">&lt;svg class="my-class" ...&gt;...&lt;/svg&gt;</code>
							</div>
						</td>
					</tr>
					<tr>
						<td>
							<strong><?= esc_html__('Image HTML', 'fromscratch') ?></strong><br>
							<span class="description"><?= esc_html__('Builds a WordPress image tag from an attachment ID (or WP_Post attachment).', 'fromscratch') ?></span>
						</td>
						<td>
							<code class="fs-code-text fs-code-small">PHP</code>
						</td>
						<td>
							<code class="fs-code-small"><?= esc_html("fs_img(123, 'medium', ['class' => 'my-class', 'loading' => 'eager']);") ?></code>
							<div class="helpers-table__preview-code">
								<span class="helpers-table__preview-pointer">→</span> <code class="fs-code-text fs-code-small">&lt;img src="..." srcset="..." class="my-class" loading="eager" ...&gt;</code>
							</div>
						</td>
					</tr>
					<tr>
						<td>
							<strong><?= esc_html__('Image with placeholder', 'fromscratch') ?></strong><br>
							<span class="description"><?= esc_html__('Builds a WordPress image tag or URL with a placeholder fallback.', 'fromscratch') ?></span>
						</td>
						<td>
							<code class="fs-code-text fs-code-small">PHP</code>
						</td>
						<td>
							<code class="fs-code-small"><?= esc_html("fs_image_with_placeholder(123, 'medium', ['class' => 'my-class', 'loading' => 'eager']);") ?></code><br>
							<code class="fs-code-small"><?= esc_html("fs_image_with_placeholder_url(123, 'medium', [...]);") ?></code>
						</td>
					</tr>
					<tr>
						<td>
							<strong><?= esc_html__('Config Variable', 'fromscratch') ?></strong><br>
							<span class="description"><?= esc_html__('Reads values from config/theme.php and config/theme-design.php via optional dot-path keys.', 'fromscratch') ?></span>
						</td>
						<td>
							<code class="fs-code-text fs-code-small">PHP</code>
						</td>
						<td>
							<code class="fs-code-small"><?= esc_html("fs_config('headers.Cache-Control');") ?></code><br>
							<code class="fs-code-small"><?= esc_html("fs_config_cpt('project');") ?></code>
						</td>
					</tr>
					<tr>
						<td>
							<strong><?= esc_html__('Content Variable', 'fromscratch') ?></strong><br>
							<span class="description"><?= esc_html__('Reads saved Theme Content option values with an optional fallback default.', 'fromscratch') ?></span>
						</td>
						<td>
							<code class="fs-code-text fs-code-small">PHP</code>
						</td>
						<td>
							<code class="fs-code-small"><?= esc_html("fs_content('hero_title', 'Default headline');") ?></code>
						</td>
					</tr>
					<tr>
						<td>
							<strong><?= esc_html__('Breadcrumbs', 'fromscratch') ?></strong><br>
							<span class="description"><?= esc_html__('Renders a breadcrumb trail for the current page, handling pages, posts, archives, and search.', 'fromscratch') ?></span>
						</td>
						<td>
							<code class="fs-code-text fs-code-small">PHP</code>
						</td>
						<td>
							<code class="fs-code-small" style="white-space: pre-wrap;"><?= esc_html('fs_breadcrumbs([
  \'home_label\' => \'Home\',
  \'home_url\' => home_url(\'/\'),
  \'separator\' => \'›\',
  \'separator_html\' => \'<b>→</b>\',
]);') ?></code>
						</td>
					</tr>
					<tr>
						<td>
							<strong><?= esc_html__('Modal', 'fromscratch') ?></strong><br>
							<span class="description"><?= esc_html__('Full-screen overlay. Match IDs between trigger and content. Content is moved into the modal on open.', 'fromscratch') ?></span>
						</td>
						<td>
							<code class="fs-code-text fs-code-small">JavaScript</code>
						</td>
						<td>
							<div class="helpers-table__code-description"><?= esc_html__('Attach modal:', 'fromscratch') ?></div>
							<code class="fs-code-small"><?= esc_html('<button data-modal="my-modal">Open</button>') ?></code>

							<div class="helpers-table__code-description"><?= esc_html__('Open manually:', 'fromscratch') ?></div>
							<code class="fs-code-small"><?= esc_html("openModal('my-modal');") ?></code>

							<div class="helpers-table__code-description"><?= esc_html__('Add content:', 'fromscratch') ?></div>
							<code class="fs-code-small"><?= esc_html('<div data-modal-content="my-modal">…</div>') ?></code>
						</td>
					</tr>
				</tbody>
			</table>

			<hr style="margin: 28px 0;">

			<h2 class="title" style="margin-top: 0;"><?= esc_html__('Icons', 'fromscratch') ?></h2>
			<p class="description"><?= esc_html__('You can add icons by combining an icon class (e.g. -icon-bolt) with a carrier pattern below. Icons render as CSS masks from assets/icons/; size and color inherit from font-size and currentColor.', 'fromscratch') ?></p>

			<?php
			if (function_exists('fs_load_icons_textdomain')) {
				fs_load_icons_textdomain();
			}

			$icon_ui_strings = function_exists('fs_icon_ui_strings') ? fs_icon_ui_strings() : [];
			$button_icon = 'celebration-fill';
			$button_icon_class = '-icon-' . $button_icon;
			$button_left_code = '<a href="/" class="button -has-icon ' . $button_icon_class . '">Button</a>';
			$button_right_code = '<a href="/" class="button -has-icon ' . $button_icon_class . ' -icon-right">Button</a>';
			$demo_icon = 'bolt';
			$demo_icon_class = '-icon-' . $demo_icon;
			$demo_icon_code = '<div class="fs-icon ' . $demo_icon_class . '" style="font-size: 64px;"></div>';
			?>

			<h3 class="helpers-icons__subtitle"><?= esc_html__('Buttons', 'fromscratch') ?></h3>
			<p class="description"><?= wp_kses(
				__('Add <code>-has-icon</code> and an icon class to the button. Use <code>-icon-right</code> to place the icon after the label.', 'fromscratch'),
				['code' => []]
			) ?></p>

			<div
				class="helpers-icons-demo helpers-icons-buttons-demo"
				data-fs-icons-buttons-demo
				data-fs-icons-demo-value="<?= esc_attr($button_icon) ?>"
				data-fs-icons-ui="<?= esc_attr(wp_json_encode($icon_ui_strings)) ?>"
			>
				<div class="helpers-icons-demo__toolbar helpers-icons-demo__toolbar--compact">
					<button type="button" class="button" data-fs-icons-demo-choose>
						<?= esc_html__('Choose icon', 'fromscratch') ?>
					</button>
				</div>
				<div class="helpers-icons-demo__row">
					<a href="#" class="button -has-icon <?= esc_attr($button_icon_class) ?>" data-fs-icons-button-preview data-fs-icons-button-position="left" onclick="return false;"><?= esc_html__('Button', 'fromscratch') ?></a>
					<label class="screen-reader-text" for="fs-icons-button-left-code"><?= esc_html__('Button code (icon left)', 'fromscratch') ?></label>
					<textarea id="fs-icons-button-left-code" class="helpers-icons-demo__textarea helpers-icons-demo__textarea--inline" rows="1" readonly data-fs-icons-button-code="left"><?= esc_textarea($button_left_code) ?></textarea>
					<button
						type="button"
						class="button"
						data-fs-copy-from-source="fs-icons-button-left-code"
						data-fs-copy-feedback-text="<?= esc_attr__('Copied', 'fromscratch') ?>"
					>
						<?= esc_html__('Copy code', 'fromscratch') ?>
					</button>
				</div>
				<div class="helpers-icons-demo__row">
					<a href="#" class="button -has-icon <?= esc_attr($button_icon_class) ?> -icon-right" data-fs-icons-button-preview data-fs-icons-button-position="right" onclick="return false;"><?= esc_html__('Button', 'fromscratch') ?></a>
					<label class="screen-reader-text" for="fs-icons-button-right-code"><?= esc_html__('Button code (icon right)', 'fromscratch') ?></label>
					<textarea id="fs-icons-button-right-code" class="helpers-icons-demo__textarea helpers-icons-demo__textarea--inline" rows="1" readonly data-fs-icons-button-code="right"><?= esc_textarea($button_right_code) ?></textarea>
					<button
						type="button"
						class="button"
						data-fs-copy-from-source="fs-icons-button-right-code"
						data-fs-copy-feedback-text="<?= esc_attr__('Copied', 'fromscratch') ?>"
					>
						<?= esc_html__('Copy code', 'fromscratch') ?>
					</button>
				</div>
			</div>

			<h3 class="helpers-icons__subtitle"><?= esc_html__('Before or after text', 'fromscratch') ?></h3>
			<p class="description"><?= esc_html__('Add -icon-before or -icon-after with an icon class on the same element.', 'fromscratch') ?></p>
			<p>
				<code class="fs-code-small helpers-icons__example-code">&lt;span class="-icon-before -icon-external-link"&gt;Open link&lt;/span&gt;</code>
			</p>

			<h3 class="helpers-icons__subtitle"><?= esc_html__('Standalone icon', 'fromscratch') ?></h3>
			<p class="description"><?= esc_html__('Add .fs-icon and an icon class when the icon is not paired with label text.', 'fromscratch') ?></p>

			<div
				class="helpers-icons-demo"
				data-fs-icons-demo
				data-fs-icons-demo-value="<?= esc_attr($demo_icon) ?>"
				data-fs-icons-ui="<?= esc_attr(wp_json_encode($icon_ui_strings)) ?>"
			>
				<div class="helpers-icons-demo__toolbar">
					<div class="helpers-icons-demo__preview" aria-hidden="true">
						<span class="fs-icon <?= esc_attr($demo_icon_class) ?>" style="font-size: 64px;" data-fs-icons-demo-preview></span>
					</div>
					<button type="button" class="button" data-fs-icons-demo-choose>
						<?= esc_html__('Choose icon', 'fromscratch') ?>
					</button>
					<button
						type="button"
						class="button"
						data-fs-copy-from-source="fs-icons-demo-code"
						data-fs-copy-feedback-text="<?= esc_attr__('Copied', 'fromscratch') ?>"
					>
						<?= esc_html__('Copy code', 'fromscratch') ?>
					</button>
				</div>
				<label class="screen-reader-text" for="fs-icons-demo-code"><?= esc_html__('Icon code', 'fromscratch') ?></label>
				<textarea id="fs-icons-demo-code" class="helpers-icons-demo__textarea" rows="2" readonly data-fs-icons-demo-code><?= esc_textarea($demo_icon_code) ?></textarea>
			</div>
		</div>
	</div>
<?php
}
