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

			<table class="widefat -large-padding striped helpers-table__table">
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

			<table class="widefat -large-padding 	striped helpers-table__table">
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
					<?php if (function_exists('fs_theme_feature_enabled') && fs_theme_feature_enabled('breadcrumbs')) : ?>
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
					<?php endif; ?>
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
			<p class="description"><?= wp_kses(
				__('You can add icons by combining an icon class (e.g. <code class="fs-code-small">-icon-bolt</code>) with one of the patterns below. Icons render as CSS masks from <code class="fs-code-small">assets/icons/</code>; size and color inherit from <code class="fs-code-small">font-size</code> and <code class="fs-code-small">currentColor</code>.', 'fromscratch'),
				['code' => ['class' => true]]
			) ?></p>

			<div class="fs-admin-group -has-margin">
				<?php
				if (function_exists('fs_load_icons_textdomain')) {
					fs_load_icons_textdomain();
				}

				$icon_ui_strings = function_exists('fs_icon_ui_strings') ? fs_icon_ui_strings() : [];
				$button_icon = 'medal-fill';
				$button_icon_class = '-icon-' . $button_icon;
				$button_code = '<button type="button" class="button -has-icon ' . $button_icon_class . '">Button</button>';
				$inline_before_icon = 'open-in-new';
				$inline_before_icon_class = '-icon-' . $inline_before_icon;
				$inline_before_label = __('Open link', 'fromscratch');
				$inline_before_code = '<span class="-icon-before ' . $inline_before_icon_class . '">' . $inline_before_label . '</span>';
				$inline_after_icon = 'arrow-right';
				$inline_after_icon_class = '-icon-' . $inline_after_icon;
				$inline_after_label = __('Read more', 'fromscratch');
				$inline_after_code = '<span class="-icon-after ' . $inline_after_icon_class . '">' . $inline_after_label . '</span>';
				$demo_icon = 'rocket-launch-fill';
				$demo_icon_class = '-icon-' . $demo_icon;
				$demo_icon_code = '<div class="fs-icon ' . $demo_icon_class . '"></div>';
				$svg_icon = 'planet-fill';
				$svg_icon_path = function_exists('fs_icon_svg_asset_path')
					? fs_icon_svg_asset_path($svg_icon)
					: '/icons/' . $svg_icon . '.svg';
				$svg_php_code = "fs_svg_code('" . $svg_icon_path . "', ['class' => 'my-class']);";
				$svg_markup = fs_svg_code($svg_icon_path, ['class' => 'my-class']);
				?>

				<h3 class="helpers-icons__subtitle"><?= esc_html__('Buttons', 'fromscratch') ?></h3>
				<p class="description"><?= wp_kses(
											__('Add <code class="fs-code-small">-has-icon</code> and an icon class to the button. Use <code class="fs-code-small">-icon-right</code> to place the icon after the label.', 'fromscratch'),
											['code' => ['class' => true]]
										) ?></p>

				<div
					class="helpers-icons-demo helpers-icons-buttons-demo"
					data-fs-icons-buttons-demo
					data-fs-icons-demo-value="<?= esc_attr($button_icon) ?>"
					data-fs-icons-button-position="left"
					data-fs-icons-button-element="button"
					data-fs-icons-ui="<?= esc_attr(wp_json_encode($icon_ui_strings)) ?>">
					<div class="helpers-icons-demo__toolbar helpers-icons-demo__toolbar--buttons">
						<button type="button" class="button button-small" data-fs-icons-demo-choose>
							<?= esc_html__('Choose icon', 'fromscratch') ?>
						</button>
						<div class="helpers-icons-demo__toolbar-actions">
							<div class="helpers-icons-demo__toggle" role="group" aria-label="<?= esc_attr__('Element', 'fromscratch') ?>">
								<button type="button" class="button button-secondary button-small is-active" data-fs-icons-element-toggle="button" aria-pressed="true">
									<?= esc_html__('Button', 'fromscratch') ?>
								</button>
								<button type="button" class="button button-secondary button-small" data-fs-icons-element-toggle="link" aria-pressed="false">
									<?= esc_html__('Link', 'fromscratch') ?>
								</button>
							</div>
							<div class="helpers-icons-demo__toggle" role="group" aria-label="<?= esc_attr__('Icon position', 'fromscratch') ?>">
								<button type="button" class="button button-secondary button-small is-active" data-fs-icons-position-toggle="left" aria-pressed="true">
									<?= esc_html__('Left', 'fromscratch') ?>
								</button>
								<button type="button" class="button button-secondary button-small" data-fs-icons-position-toggle="right" aria-pressed="false">
									<?= esc_html__('Right', 'fromscratch') ?>
								</button>
							</div>
							<button
								type="button"
								class="button button-small"
								data-fs-copy-from-source="fs-icons-button-code"
								data-fs-copy-feedback-text="<?= esc_attr__('Copied', 'fromscratch') ?>">
								<?= esc_html__('Copy code', 'fromscratch') ?>
							</button>
						</div>
					</div>
					<div class="helpers-icons-demo__panel">
						<div class="helpers-icons-demo__preview helpers-icons-demo__preview--button">
							<a href="#" class="button -has-icon <?= esc_attr($button_icon_class) ?>" data-fs-icons-button-preview onclick="return false;" style="background: #fff;"><?= esc_html__('Button', 'fromscratch') ?></a>
						</div>
						<pre class="helpers-icons-demo__code"><code id="fs-icons-button-code" class="fs-code-small helpers-icons-demo__code-text" data-fs-icons-button-code><?= esc_html($button_code) ?></code></pre>
					</div>
				</div>

				<hr style="margin: 28px 0 24px;">

				<h3 class="helpers-icons__subtitle" style="margin-top: 0;"><?= esc_html__('Before or after text', 'fromscratch') ?></h3>
				<p class="description"><?= wp_kses(
					__('Add <code class="fs-code-small">-icon-before</code> or <code class="fs-code-small">-icon-after</code> with an icon class on the same element.', 'fromscratch'),
					['code' => ['class' => true]]
				) ?></p>

				<div class="helpers-icons-inline-demo">
					<div
						class="helpers-icons-inline-demo__item helpers-icons-demo"
						data-fs-icons-inline-demo
						data-fs-icons-demo-value="<?= esc_attr($inline_before_icon) ?>"
						data-fs-icons-inline-placement="before"
						data-fs-icons-ui="<?= esc_attr(wp_json_encode($icon_ui_strings)) ?>">
						<div class="helpers-icons-demo__toolbar helpers-icons-demo__toolbar--buttons">
							<button type="button" class="button button-small" data-fs-icons-demo-choose>
								<?= esc_html__('Choose icon', 'fromscratch') ?>
							</button>
							<div class="helpers-icons-demo__toolbar-actions">
								<button
									type="button"
									class="button button-small"
									data-fs-copy-from-source="fs-icons-inline-before-code"
									data-fs-copy-feedback-text="<?= esc_attr__('Copied', 'fromscratch') ?>">
									<?= esc_html__('Copy code', 'fromscratch') ?>
								</button>
							</div>
						</div>
						<div class="helpers-icons-demo__panel">
							<div class="helpers-icons-demo__preview helpers-icons-demo__preview--inline">
								<span class="-icon-before <?= esc_attr($inline_before_icon_class) ?>" data-fs-icons-inline-preview><?= esc_html($inline_before_label) ?></span>
							</div>
							<pre class="helpers-icons-demo__code"><code id="fs-icons-inline-before-code" class="fs-code-small helpers-icons-demo__code-text" data-fs-icons-inline-code><?= esc_html($inline_before_code) ?></code></pre>
						</div>
					</div>
					<div
						class="helpers-icons-inline-demo__item helpers-icons-demo"
						data-fs-icons-inline-demo
						data-fs-icons-demo-value="<?= esc_attr($inline_after_icon) ?>"
						data-fs-icons-inline-placement="after"
						data-fs-icons-ui="<?= esc_attr(wp_json_encode($icon_ui_strings)) ?>">
						<div class="helpers-icons-demo__toolbar helpers-icons-demo__toolbar--buttons">
							<button type="button" class="button button-small" data-fs-icons-demo-choose>
								<?= esc_html__('Choose icon', 'fromscratch') ?>
							</button>
							<div class="helpers-icons-demo__toolbar-actions">
								<button
									type="button"
									class="button button-small"
									data-fs-copy-from-source="fs-icons-inline-after-code"
									data-fs-copy-feedback-text="<?= esc_attr__('Copied', 'fromscratch') ?>">
									<?= esc_html__('Copy code', 'fromscratch') ?>
								</button>
							</div>
						</div>
						<div class="helpers-icons-demo__panel">
							<div class="helpers-icons-demo__preview helpers-icons-demo__preview--inline">
								<span class="-icon-after <?= esc_attr($inline_after_icon_class) ?>" data-fs-icons-inline-preview><?= esc_html($inline_after_label) ?></span>
							</div>
							<pre class="helpers-icons-demo__code"><code id="fs-icons-inline-after-code" class="fs-code-small helpers-icons-demo__code-text" data-fs-icons-inline-code><?= esc_html($inline_after_code) ?></code></pre>
						</div>
					</div>
				</div>

				<hr style="margin: 28px 0 24px;">

				<h3 class="helpers-icons__subtitle"><?= esc_html__('Standalone icon', 'fromscratch') ?></h3>
				<p class="description"><?= wp_kses(
					__('Add class <code class="fs-code-small">fs-icon</code> and an icon class to render the icon standalone.', 'fromscratch'),
					['code' => ['class' => true]]
				) ?></p>

				<div
					class="helpers-icons-demo helpers-icons-standalone-demo"
					data-fs-icons-demo
					data-fs-icons-demo-value="<?= esc_attr($demo_icon) ?>"
					data-fs-icons-ui="<?= esc_attr(wp_json_encode($icon_ui_strings)) ?>">
					<div class="helpers-icons-demo__toolbar helpers-icons-demo__toolbar--buttons">
						<button type="button" class="button button-small" data-fs-icons-demo-choose>
							<?= esc_html__('Choose icon', 'fromscratch') ?>
						</button>
						<div class="helpers-icons-demo__toolbar-actions">
							<button
								type="button"
								class="button button-small"
								data-fs-copy-from-source="fs-icons-demo-code"
								data-fs-copy-feedback-text="<?= esc_attr__('Copied', 'fromscratch') ?>">
								<?= esc_html__('Copy code', 'fromscratch') ?>
							</button>
						</div>
					</div>
					<div class="helpers-icons-demo__panel">
						<div class="helpers-icons-demo__preview helpers-icons-demo__preview--standalone" aria-hidden="true">
							<span class="fs-icon <?= esc_attr($demo_icon_class) ?>" data-fs-icons-demo-preview></span>
						</div>
						<pre class="helpers-icons-demo__code"><code id="fs-icons-demo-code" class="fs-code-small helpers-icons-demo__code-text" data-fs-icons-demo-code><?= esc_html($demo_icon_code) ?></code></pre>
					</div>
				</div>

				<hr style="margin: 28px 0 24px;">

				<h3 class="helpers-icons__subtitle"><?= esc_html__('Icon SVG code', 'fromscratch') ?></h3>
				<p class="description"><?= wp_kses(
					__('Use <code class="fs-code-small">fs_svg_code()</code> with an icon path under <code class="fs-code-small">/icons/</code> to output inline SVG markup in templates.', 'fromscratch'),
					['code' => ['class' => true]]
				) ?></p>
				<p class="description"><?= wp_kses(
					sprintf(
						/* translators: %s: linked label for the Material Symbols icon library */
						__('You can find more icons in the %s.', 'fromscratch'),
						'<a href="' . esc_url('https://fonts.google.com/icons?icon.style=Rounded&icon.size=24&icon.color=%23e3e3e3') . '" target="_blank" rel="noopener noreferrer">' . esc_html__('Material Symbols library', 'fromscratch') . '</a>'
					),
					['a' => ['href' => true, 'target' => true, 'rel' => true]]
				) ?></p>

				<div
					class="helpers-icons-demo helpers-icons-svg-demo"
					data-fs-icons-svg-demo
					data-fs-icons-demo-value="<?= esc_attr($svg_icon) ?>"
					data-fs-icons-svg-base="<?= esc_url(get_template_directory_uri() . '/assets/icons/') ?>"
					data-fs-icons-ui="<?= esc_attr(wp_json_encode($icon_ui_strings)) ?>">
					<div class="helpers-icons-demo__toolbar helpers-icons-demo__toolbar--buttons">
						<button type="button" class="button button-small" data-fs-icons-demo-choose>
							<?= esc_html__('Choose icon', 'fromscratch') ?>
						</button>
						<div class="helpers-icons-demo__toolbar-actions">
							<button
								type="button"
								class="button button-small"
								data-fs-copy-from-source="fs-icons-svg-php-code"
								data-fs-copy-feedback-text="<?= esc_attr__('Copied', 'fromscratch') ?>">
								<?= esc_html__('Copy PHP code', 'fromscratch') ?>
							</button>
							<button
								type="button"
								class="button button-small"
								data-fs-copy-from-source="fs-icons-svg-markup-code"
								data-fs-copy-feedback-text="<?= esc_attr__('Copied', 'fromscratch') ?>">
								<?= esc_html__('Copy SVG', 'fromscratch') ?>
							</button>
						</div>
					</div>
					<div class="helpers-icons-demo__panel">
						<div class="helpers-icons-demo__preview helpers-icons-demo__preview--svg" data-fs-icons-svg-preview><?= $svg_markup ?></div>
						<div class="helpers-icons-demo__codes">
							<pre class="helpers-icons-demo__code"><code id="fs-icons-svg-php-code" class="fs-code-small helpers-icons-demo__code-text" data-fs-icons-svg-php-code><?= esc_html($svg_php_code) ?></code></pre>
							<pre class="helpers-icons-demo__code helpers-icons-demo__code--svg"><code id="fs-icons-svg-markup-code" class="fs-code-small helpers-icons-demo__code-text" data-fs-icons-svg-markup-code><?= esc_html($svg_markup) ?></code></pre>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
<?php
}
