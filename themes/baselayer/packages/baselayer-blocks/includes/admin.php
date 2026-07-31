<?php

defined('ABSPATH') || exit;

/**
 * SVG menu icon for the Website admin page (document + gear).
 * Black fill so WP admin can tint it for the sidebar.
 */
function bl_blocks_website_menu_icon(): string
{
	$svg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="black"><path d="M668.23-202.69q-17-5-29.81-11.85-12.81-6.85-25.34-18.69l-31.85 10.69q-6.23 2-11.85.08-5.61-1.93-9.23-7.54l-14.76-24.62q-4-5.61-2.58-12.23 1.42-6.61 6.42-11.23l24.92-21.31q-4.69-16.23-4.69-33.3 0-17.08 4.69-33.7l-24.92-21.69q-5-4.61-6.61-11.04-1.62-6.42 2.38-12.03l15.15-25q3.62-5.62 9.23-7.54 5.62-1.92 11.85.08l31.85 10.69q12.15-11.46 25.53-18.5 13.39-7.04 29.62-12.04l5.92-32.08q1.62-6.61 5.93-10.92 4.3-4.31 11.53-4.31h29.54q7.23 0 11.54 4.31 4.31 4.31 5.92 10.92l5.93 32.08q16.23 4.61 29.42 11.84 13.19 7.24 25.73 18.7l31.85-10.69q6.23-2 11.84-.08 5.62 1.92 9.23 7.54l15.16 25q4 5.61 2.38 12.03-1.61 6.43-6.61 11.04l-24.93 21.69q5.08 17 4.89 33.89-.19 16.88-5.27 33.11l24.92 21.31q4.23 3.85 6.42 10.46 2.2 6.62-2.19 13L852.61-230q-3.61 5.61-9.23 7.54-5.61 1.92-11.84-.08l-31.85-10.69q-12.54 11.46-25.35 18.5-12.8 7.04-29.8 12.04l-5.93 32.07q-1.61 6.62-5.92 10.93-4.31 4.3-11.54 4.3h-29.54q-7.23 0-11.53-4.3-4.31-4.31-5.93-10.93l-5.92-32.07ZM765-274.46q24.46-24.46 24.46-58.62 0-34.15-24.46-58.61-24.46-24.47-58.62-24.47-34.15 0-58.61 24.47-24.46 24.46-24.46 58.61 0 34.16 24.46 58.62T706.38-250q34.16 0 58.62-24.46ZM212.31-180Q182-180 161-201q-21-21-21-51.31v-535.38Q140-818 161-839q21-21 51.31-21h535.38Q778-860 799-839q21 21 21 51.31v171.77q0 12.77-8.62 20.88-8.61 8.12-21.38 8.12t-21.38-8.62q-8.62-8.61-8.62-21.38v-170.77q0-5.39-3.46-8.85t-8.85-3.46H212.31q-5.39 0-8.85 3.46t-3.46 8.85v360h142.38q13.54 0 21.77 5.11 8.23 5.12 13.23 14.5 11 18.77 25.47 31.54 14.46 12.77 31.38 19.77 5.23 2.62 8.65 7.08 3.43 4.46 3.2 10.31-.54 31.07 5.73 60.46 6.27 29.38 20.34 56.84 7.39 14.23.16 28.16Q465.08-180 449.85-180H212.31Z"/></svg>';

	return 'data:image/svg+xml;base64,' . base64_encode($svg);
}

/**
 * Top-level Website runtime page (Site Settings values).
 * Registered even when Block Creator owns the Blocks menu slug.
 */
function bl_blocks_register_website_menu(): void
{
	if (!bl_blocks_user_can_manage()) {
		return;
	}

	add_menu_page(
		__('Website', 'baselayer-blocks'),
		__('Website', 'baselayer-blocks'),
		'manage_options',
		'bl-blocks-website',
		'bl_blocks_render_website_page',
		bl_blocks_website_menu_icon(),
		82
	);

	// Drop the auto-added duplicate submenu (same slug as parent).
	remove_submenu_page('bl-blocks-website', 'bl-blocks-website');
}
add_action('admin_menu', 'bl_blocks_register_website_menu');

/**
 * Top-level Blocks menu + typed definition submenus.
 */
function bl_blocks_register_admin_menu(): void
{
	if (!bl_blocks_user_can_manage()) {
		return;
	}

	// Theme Block Creator uses the same `bl-blocks` menu slug — avoid collision.
	if (function_exists('bl_block_creator_enabled') && bl_block_creator_enabled()) {
		add_action('admin_notices', 'bl_blocks_block_creator_conflict_notice');

		return;
	}

	$cap = 'manage_options';

	add_menu_page(
		__('Blocks', 'baselayer-blocks'),
		__('Blocks', 'baselayer-blocks'),
		$cap,
		'bl-blocks',
		'bl_blocks_render_menu_redirect',
		'dashicons-block-default',
		81
	);

	add_submenu_page(
		'bl-blocks',
		__('Blocks', 'baselayer-blocks'),
		__('Blocks', 'baselayer-blocks'),
		$cap,
		'edit.php?post_type=' . BL_BLOCK_POST_TYPE . '&bl_block_type=block'
	);

	add_submenu_page(
		'bl-blocks',
		__('Page Settings', 'baselayer-blocks'),
		__('Page Settings', 'baselayer-blocks'),
		$cap,
		'edit.php?post_type=' . BL_BLOCK_POST_TYPE . '&bl_block_type=page_settings'
	);

	add_submenu_page(
		'bl-blocks',
		__('Site Settings', 'baselayer-blocks'),
		__('Site Settings', 'baselayer-blocks'),
		$cap,
		'edit.php?post_type=' . BL_BLOCK_POST_TYPE . '&bl_block_type=site_settings'
	);

	// Remove the duplicate top-level → first item WP inserts.
	remove_submenu_page('bl-blocks', 'bl-blocks');
}
add_action('admin_menu', 'bl_blocks_register_admin_menu');

/**
 * Notice when Blocks package and theme Block Creator are both enabled.
 */
function bl_blocks_block_creator_conflict_notice(): void
{
	if (!bl_blocks_user_can_manage()) {
		return;
	}
	echo '<div class="notice notice-warning"><p>';
	echo esc_html__(
		'BaseLayer Blocks and Block Creator both use the Blocks admin menu. Disable Block Creator (Developer → Features) to use the Blocks package, or disable the Blocks package to keep Block Creator. The Website menu remains available.',
		'baselayer-blocks'
	);
	echo '</p></div>';
}

/**
 * Top-level click → Blocks list.
 */
function bl_blocks_render_menu_redirect(): void
{
	wp_safe_redirect(admin_url('edit.php?post_type=' . BL_BLOCK_POST_TYPE . '&bl_block_type=block'));
	exit;
}

/**
 * Highlight the correct menu for typed list / edit / Website screens.
 *
 * @param string|null $file
 * @return string|null
 */
function bl_blocks_parent_file($file)
{
	if (isset($_GET['page']) && $_GET['page'] === 'bl-blocks-website') {
		return 'bl-blocks-website';
	}

	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if ($screen && $screen->post_type === BL_BLOCK_POST_TYPE) {
		return 'bl-blocks';
	}

	return $file;
}
add_filter('parent_file', 'bl_blocks_parent_file');

/**
 * @param string $submenu_file
 * @param string $parent_file
 * @return string
 */
function bl_blocks_submenu_file($submenu_file, $parent_file)
{
	if (isset($_GET['page']) && $_GET['page'] === 'bl-blocks-website') {
		return 'bl-blocks-website';
	}
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if ($screen && $screen->post_type === BL_BLOCK_POST_TYPE) {
		$type = bl_blocks_current_list_type();

		return 'edit.php?post_type=' . BL_BLOCK_POST_TYPE . '&bl_block_type=' . $type;
	}

	return $submenu_file;
}
add_filter('submenu_file', 'bl_blocks_submenu_file', 10, 2);

/**
 * Relabel list/edit screens per definition type.
 */
function bl_blocks_admin_titles(): void
{
	global $wp_post_types;
	if (!isset($wp_post_types[BL_BLOCK_POST_TYPE])) {
		return;
	}
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || $screen->post_type !== BL_BLOCK_POST_TYPE) {
		return;
	}
	$labels = bl_blocks_type_labels(bl_blocks_current_list_type());
	$obj = $wp_post_types[BL_BLOCK_POST_TYPE];
	$obj->labels->name = $labels['plural'];
	$obj->labels->singular_name = $labels['singular'];
	$obj->labels->add_new_item = $labels['add'];
	$obj->labels->edit_item = sprintf(
		/* translators: %s: definition type singular */
		__('Edit %s', 'baselayer-blocks'),
		$labels['singular']
	);
	$obj->labels->add_new = $labels['add'];
}
add_action('current_screen', 'bl_blocks_admin_titles');

/**
 * Keep “Add New” typed.
 *
 * @param string $url
 * @param string $path
 * @return string
 */
function bl_blocks_add_new_url($url, $path)
{
	if (!is_string($path) || strpos($path, 'post-new.php?post_type=' . BL_BLOCK_POST_TYPE) === false) {
		return $url;
	}
	// Avoid double-adding when already present.
	if (is_string($url) && strpos($url, 'bl_block_type=') !== false) {
		return $url;
	}
	$type = bl_blocks_current_list_type();

	return add_query_arg('bl_block_type', $type, $url);
}
add_filter('admin_url', 'bl_blocks_add_new_url', 10, 2);

/**
 * Save definition config + type.
 */
function bl_blocks_save_post(int $post_id, WP_Post $post): void
{
	if ($post->post_type !== BL_BLOCK_POST_TYPE) {
		return;
	}
	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
		return;
	}
	if (!bl_blocks_user_can_manage()) {
		return;
	}
	if (!isset($_POST['bl_blocks_config_nonce']) || !wp_verify_nonce((string) $_POST['bl_blocks_config_nonce'], 'bl_blocks_save_config')) {
		return;
	}

	$type = bl_blocks_get_definition_type($post_id);
	if (isset($_POST['bl_block_type'])) {
		$type = bl_blocks_sanitize_definition_type(wp_unslash((string) $_POST['bl_block_type']));
		update_post_meta($post_id, BL_BLOCK_TYPE_META, $type);
	}

	$decoded = [];
	if (isset($_POST['bl_blocks_config_json'])) {
		$json = (string) wp_unslash($_POST['bl_blocks_config_json']);
		$parsed = json_decode($json, true);
		if (is_array($parsed)) {
			$decoded = $parsed;
		}
	}

	$config = bl_blocks_sanitize_config($decoded, $type);
	if (($config['settings']['slug'] ?? '') === '') {
		$config['settings']['slug'] = bl_blocks_definition_slug($post_id, $config['settings']);
	}
	update_post_meta($post_id, BL_BLOCK_CONFIG_META, $config);
}
add_action('save_post', 'bl_blocks_save_post', 10, 2);
