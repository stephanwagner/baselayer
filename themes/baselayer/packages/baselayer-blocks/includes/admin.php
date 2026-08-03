<?php

defined('ABSPATH') || exit;

/**
 * Encode an SVG as an admin menu icon data URI.
 * Uses the light fill (#f3f1f1) baked into CPT icons so they are not briefly black on load.
 */
function bl_blocks_svg_menu_icon(string $svg): string
{
	if (function_exists('bl_cpt_svg_to_data_uri')) {
		return bl_cpt_svg_to_data_uri($svg);
	}

	$fill = '#f3f1f1';
	$svg = preg_replace('/\sfill="[^"]*"/i', ' fill="' . $fill . '"', $svg);
	if (is_string($svg) && stripos($svg, '<svg') !== false && stripos($svg, ' fill=') === false) {
		$svg = preg_replace('/<svg\b/i', '<svg fill="' . $fill . '"', $svg, 1);
	}
	if (!is_string($svg) || $svg === '') {
		return 'dashicons-admin-generic';
	}

	return 'data:image/svg+xml;base64,' . base64_encode($svg);
}

/**
 * SVG menu icon for the Website admin page (document + gear).
 */
function bl_blocks_website_menu_icon(): string
{
	return bl_blocks_svg_menu_icon(
		'<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M668.23-202.69q-17-5-29.81-11.85-12.81-6.85-25.34-18.69l-31.85 10.69q-6.23 2-11.85.08-5.61-1.93-9.23-7.54l-14.76-24.62q-4-5.61-2.58-12.23 1.42-6.61 6.42-11.23l24.92-21.31q-4.69-16.23-4.69-33.3 0-17.08 4.69-33.7l-24.92-21.69q-5-4.61-6.61-11.04-1.62-6.42 2.38-12.03l15.15-25q3.62-5.62 9.23-7.54 5.62-1.92 11.85.08l31.85 10.69q12.15-11.46 25.53-18.5 13.39-7.04 29.62-12.04l5.92-32.08q1.62-6.61 5.93-10.92 4.3-4.31 11.53-4.31h29.54q7.23 0 11.54 4.31 4.31 4.31 5.92 10.92l5.93 32.08q16.23 4.61 29.42 11.84 13.19 7.24 25.73 18.7l31.85-10.69q6.23-2 11.84-.08 5.62 1.92 9.23 7.54l15.16 25q4 5.61 2.38 12.03-1.61 6.43-6.61 11.04l-24.93 21.69q5.08 17 4.89 33.89-.19 16.88-5.27 33.11l24.92 21.31q4.23 3.85 6.42 10.46 2.2 6.62-2.19 13L852.61-230q-3.61 5.61-9.23 7.54-5.61 1.92-11.84-.08l-31.85-10.69q-12.54 11.46-25.35 18.5-12.8 7.04-29.8 12.04l-5.93 32.07q-1.61 6.62-5.92 10.93-4.31 4.3-11.54 4.3h-29.54q-7.23 0-11.53-4.3-4.31-4.31-5.93-10.93l-5.92-32.07ZM765-274.46q24.46-24.46 24.46-58.62 0-34.15-24.46-58.61-24.46-24.47-58.62-24.47-34.15 0-58.61 24.47-24.46 24.46-24.46 58.61 0 34.16 24.46 58.62T706.38-250q34.16 0 58.62-24.46ZM212.31-180Q182-180 161-201q-21-21-21-51.31v-535.38Q140-818 161-839q21-21 51.31-21h535.38Q778-860 799-839q21 21 21 51.31v171.77q0 12.77-8.62 20.88-8.61 8.12-21.38 8.12t-21.38-8.62q-8.62-8.61-8.62-21.38v-170.77q0-5.39-3.46-8.85t-8.85-3.46H212.31q-5.39 0-8.85 3.46t-3.46 8.85v360h142.38q13.54 0 21.77 5.11 8.23 5.12 13.23 14.5 11 18.77 25.47 31.54 14.46 12.77 31.38 19.77 5.23 2.62 8.65 7.08 3.43 4.46 3.2 10.31-.54 31.07 5.73 60.46 6.27 29.38 20.34 56.84 7.39 14.23.16 28.16Q465.08-180 449.85-180H212.31Z"/></svg>'
	);
}

/**
 * SVG menu icon for the Blocks admin menu (shapes / dashboard tiles).
 */
function bl_blocks_menu_icon(): string
{
	return bl_blocks_svg_menu_icon(
		'<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M633.77-486.08 486.85-633q-5.62-5.61-7.93-11.9-2.3-6.28-2.3-13.46 0-7.18 2.3-13.41 2.31-6.23 7.93-11.84l146.92-146.93q5.61-5.61 11.9-7.92 6.28-2.31 13.46-2.31 7.18 0 13.41 2.31t11.84 7.92l146.93 146.93q5.61 5.61 7.92 11.89 2.31 6.28 2.31 13.46 0 7.18-2.31 13.41-2.31 6.24-7.92 11.85L684.38-486.08q-5.61 5.62-11.89 7.92-6.29 2.31-13.46 2.31-7.18 0-13.42-2.31-6.23-2.3-11.84-7.92Zm-481.46-77.77v-207.69q0-15.36 10.39-25.76 10.4-10.39 25.76-10.39h207.69q15.37 0 25.76 10.39 10.4 10.4 10.4 25.76v207.69q0 15.37-10.4 25.76-10.39 10.4-25.76 10.4H188.46q-15.36 0-25.76-10.4-10.39-10.39-10.39-25.76Zm375.38 375.39v-207.69q0-15.37 10.4-25.76 10.39-10.4 25.76-10.4h207.69q15.36 0 25.76 10.4 10.39 10.39 10.39 25.76v207.69q0 15.36-10.39 25.76-10.4 10.39-25.76 10.39H563.85q-15.37 0-25.76-10.39-10.4-10.4-10.4-25.76Zm-375.38 0v-207.69q0-15.37 10.39-25.76 10.4-10.4 25.76-10.4h207.69q15.37 0 25.76 10.4 10.4 10.39 10.4 25.76v207.69q0 15.36-10.4 25.76-10.39 10.39-25.76 10.39H188.46q-15.36 0-25.76-10.39-10.39-10.4-10.39-25.76Zm60-399.23h160v-160h-160v160Zm447.77 43.38 113-113-113-113-113 113 113 113Zm-72.39 332h160v-160h-160v160Zm-375.38 0h160v-160h-160v160Zm160-375.38Zm174.77-69.62Zm-174.77 285Zm215.38 0Z"/></svg>'
	);
}

/**
 * Top-level Website runtime page (Site Settings values).
 * Only registered when at least one active Website definition exists.
 */
function bl_blocks_register_website_menu(): void
{
	if (!bl_blocks_user_can_manage()) {
		return;
	}

	if (bl_blocks_query_definitions('site_settings', true) === []) {
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

	$cap = 'manage_options';

	add_menu_page(
		__('Blocks', 'baselayer-blocks'),
		__('Blocks', 'baselayer-blocks'),
		$cap,
		'bl-blocks',
		'bl_blocks_render_menu_redirect',
		bl_blocks_menu_icon(),
		81
	);

	add_submenu_page(
		'bl-blocks',
		__('Blocks', 'baselayer-blocks'),
		__('Blocks', 'baselayer-blocks'),
		$cap,
		'edit.php?post_type=' . BL_BLOCK_POST_TYPE . '&bl_block_type=block'
	);

	if (defined('BL_BLOCK_OPTIONS_PAGE') && function_exists('bl_block_options_render_admin_page')) {
		add_submenu_page(
			'bl-blocks',
			__('Block Options', 'baselayer-blocks'),
			__('Block Options', 'baselayer-blocks'),
			$cap,
			BL_BLOCK_OPTIONS_PAGE,
			'bl_block_options_render_admin_page'
		);
	}

	add_submenu_page(
		'bl-blocks',
		__('Content Fields', 'baselayer-blocks'),
		__('Content Fields', 'baselayer-blocks'),
		$cap,
		'edit.php?post_type=' . BL_BLOCK_POST_TYPE . '&bl_block_type=page_settings'
	);

	add_submenu_page(
		'bl-blocks',
		__('Website Fields', 'baselayer-blocks'),
		__('Website Fields', 'baselayer-blocks'),
		$cap,
		'edit.php?post_type=' . BL_BLOCK_POST_TYPE . '&bl_block_type=site_settings'
	);

	// Remove the duplicate top-level → first item WP inserts.
	remove_submenu_page('bl-blocks', 'bl-blocks');
}
add_action('admin_menu', 'bl_blocks_register_admin_menu');

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
	if (isset($_GET['page']) && $_GET['page'] === 'bl-blocks-settings') {
		return 'bl-blocks';
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
	if (isset($_GET['page']) && $_GET['page'] === 'bl-blocks-settings') {
		return 'bl-blocks-settings';
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

	$block_options_payload = null;
	if (isset($decoded['blockOptions']) && is_array($decoded['blockOptions'])) {
		$block_options_payload = $decoded['blockOptions'];
		unset($decoded['blockOptions']);
	}

	$config = bl_blocks_sanitize_config($decoded, $type);
	if (($config['settings']['slug'] ?? '') === '') {
		$config['settings']['slug'] = bl_blocks_definition_slug($post_id, $config['settings']);
	}
	update_post_meta($post_id, BL_BLOCK_CONFIG_META, $config);

	if (
		$type === 'block'
		&& $block_options_payload !== null
		&& function_exists('bl_block_options_set_block_items')
		&& function_exists('bl_blocks_gutenberg_name')
	) {
		$slug = (string) ($config['settings']['slug'] ?? '');
		if ($slug !== '') {
			$items = isset($block_options_payload['items']) && is_array($block_options_payload['items'])
				? $block_options_payload['items']
				: [];
			bl_block_options_set_block_items(bl_blocks_gutenberg_name($slug), $items);
		}
	}
}
add_action('save_post', 'bl_blocks_save_post', 10, 2);

/**
 * Disable Quick Edit for definition lists (no useful inline fields).
 */
function bl_blocks_disable_quick_edit(bool $enable, string $post_type): bool
{
	if ($post_type === BL_BLOCK_POST_TYPE) {
		return false;
	}

	return $enable;
}
add_filter('quick_edit_enabled_for_post_type', 'bl_blocks_disable_quick_edit', 10, 2);

/**
 * Type-aware list columns: block name (+ icon) / site settings order / page settings post types.
 *
 * @param array<string, string> $columns
 * @return array<string, string>
 */
function bl_blocks_list_columns(array $columns): array
{
	$type = bl_blocks_current_list_type();
	$out = [];
	foreach ($columns as $key => $label) {
		$out[$key] = $label;
		if ($key !== 'title') {
			continue;
		}
		if ($type === 'block') {
			$out['bl_block_name'] = __('Block name', 'baselayer-blocks');
		} elseif ($type === 'site_settings') {
			$out['bl_menu_order'] = __('Order', 'baselayer-blocks');
		} elseif ($type === 'page_settings') {
			$out['bl_post_types'] = __('Post types', 'baselayer-blocks');
		}
	}

	return $out;
}
add_filter('manage_' . BL_BLOCK_POST_TYPE . '_posts_columns', 'bl_blocks_list_columns');

/**
 * Safe HTML for a block icon in the admin list (SVG, dashicon, or theme icon).
 */
function bl_blocks_list_icon_html(string $icon): string
{
	$icon = bl_blocks_sanitize_block_icon($icon);

	if (stripos($icon, '<svg') !== false) {
		return '<span class="bl-blocks-list-icon__media" aria-hidden="true">' . $icon . '</span>';
	}

	if (strpos($icon, 'dashicons-') === 0) {
		return '<span class="dashicons ' . esc_attr($icon) . '" aria-hidden="true"></span>';
	}

	if ($icon === 'block-default') {
		return '<span class="dashicons dashicons-block-default" aria-hidden="true"></span>';
	}

	$resolved = bl_blocks_resolve_gutenberg_icon($icon);
	if (is_string($resolved) && stripos($resolved, '<svg') !== false) {
		return '<span class="bl-blocks-list-icon__media" aria-hidden="true">' . $resolved . '</span>';
	}

	return '<span class="bl-icon -icon-' . esc_attr(sanitize_key($icon)) . '" aria-hidden="true"></span>';
}

/**
 * Human-readable labels for page settings post types (comma-separated).
 */
function bl_blocks_list_post_types_label(array $post_types): string
{
	$labels = [];
	foreach ($post_types as $pt) {
		$pt = sanitize_key((string) $pt);
		if ($pt === '') {
			continue;
		}
		$obj = get_post_type_object($pt);
		$labels[] = $obj && isset($obj->labels->singular_name) && $obj->labels->singular_name !== ''
			? (string) $obj->labels->singular_name
			: $pt;
	}

	return implode(', ', $labels);
}

/**
 * Render custom list column cells.
 */
function bl_blocks_list_column_content(string $column, int $post_id): void
{
	if ($column === 'bl_menu_order') {
		$config = bl_blocks_get_config($post_id);
		echo esc_html((string) (int) ($config['settings']['menu_order'] ?? 1));

		return;
	}

	if ($column === 'bl_post_types') {
		$config = bl_blocks_get_config($post_id);
		$types = $config['settings']['post_types'] ?? [];
		$label = is_array($types) ? bl_blocks_list_post_types_label($types) : '';
		echo $label !== '' ? esc_html($label) : '—';

		return;
	}

	if ($column !== 'bl_block_name') {
		return;
	}

	$config = bl_blocks_get_config($post_id);
	$slug = bl_blocks_definition_slug($post_id, $config['settings']);
	$name = bl_blocks_gutenberg_name($slug);
	$icon = (string) ($config['settings']['block_icon'] ?? 'block-default');

	echo '<span class="bl-blocks-list-block-name">';
	echo '<span class="bl-blocks-list-icon">' . bl_blocks_list_icon_html($icon) . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted sanitized SVG / escaped classes
	echo '<code>' . esc_html($name) . '</code>';
	echo '</span>';
}
add_action('manage_' . BL_BLOCK_POST_TYPE . '_posts_custom_column', 'bl_blocks_list_column_content', 10, 2);

/**
 * Sort Site Settings list by settings menu_order (ascending).
 *
 * @param list<WP_Post>|array<int, mixed> $posts
 * @param WP_Query                        $query
 * @return list<WP_Post>|array<int, mixed>
 */
function bl_blocks_sort_site_settings_list($posts, $query)
{
	if (!is_admin() || !($query instanceof WP_Query) || !$query->is_main_query()) {
		return $posts;
	}
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || $screen->post_type !== BL_BLOCK_POST_TYPE || $screen->base !== 'edit') {
		return $posts;
	}
	if (bl_blocks_current_list_type() !== 'site_settings' || !is_array($posts) || $posts === []) {
		return $posts;
	}

	usort($posts, static function ($a, $b): int {
		if (!($a instanceof WP_Post) || !($b instanceof WP_Post)) {
			return 0;
		}
		$oa = (int) (bl_blocks_get_config((int) $a->ID)['settings']['menu_order'] ?? 1);
		$ob = (int) (bl_blocks_get_config((int) $b->ID)['settings']['menu_order'] ?? 1);
		if ($oa === $ob) {
			return strcasecmp($a->post_title, $b->post_title);
		}

		return $oa <=> $ob;
	});

	return $posts;
}
add_filter('the_posts', 'bl_blocks_sort_site_settings_list', 10, 2);

/**
 * Whether a definition is inactive (settings.active empty/false).
 * Draft/pending status is separate — those are excluded from runtime, not marked inactive in the list.
 */
function bl_blocks_definition_is_inactive(int $post_id): bool
{
	if ($post_id <= 0 || get_post_type($post_id) !== BL_BLOCK_POST_TYPE) {
		return false;
	}
	$config = bl_blocks_get_config($post_id);

	return empty($config['settings']['active']);
}

/**
 * Mark inactive definition rows in the list table.
 *
 * Icon is drawn with CSS on `.row-title::before` — list titles pass through
 * `_draft_or_post_title()` → `esc_html()`, so markup in `the_title` cannot work.
 *
 * @param list<string> $classes
 * @param list<string> $class
 * @param int          $post_id
 * @return list<string>
 */
function bl_blocks_list_post_class(array $classes, array $class, int $post_id): array
{
	if (bl_blocks_definition_is_inactive($post_id)) {
		$classes[] = 'bl-blocks-is-inactive';
		// Sets --bl-icon (from theme icons CSS); inherited by .row-title::before.
		$classes[] = '-icon-visibility-off';
	}

	return $classes;
}
add_filter('post_class', 'bl_blocks_list_post_class', 10, 3);

/**
 * List table styles (icons + column layout).
 */
function bl_blocks_enqueue_list_assets(string $hook): void
{
	if ($hook !== 'edit.php') {
		return;
	}
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || $screen->post_type !== BL_BLOCK_POST_TYPE) {
		return;
	}
	if (!bl_blocks_user_can_manage()) {
		return;
	}

	bl_blocks_enqueue_style('bl-blocks-admin', 'blocks-admin');

	if (function_exists('bl_enqueue_theme_icons_style')) {
		bl_enqueue_theme_icons_style(['bl-blocks-admin']);
	}
}
add_action('admin_enqueue_scripts', 'bl_blocks_enqueue_list_assets');
