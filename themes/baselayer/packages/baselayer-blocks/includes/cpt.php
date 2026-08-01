<?php

defined('ABSPATH') || exit;

/**
 * Register bl_block CPT (definitions for blocks / page / site settings).
 */
function bl_blocks_register_post_types(): void
{
	$labels = [
		'name'               => __('Blocks', 'baselayer-blocks'),
		'singular_name'      => __('Block', 'baselayer-blocks'),
		'add_new'            => __('Add New', 'baselayer-blocks'),
		'add_new_item'       => __('Add New', 'baselayer-blocks'),
		'edit_item'          => __('Edit', 'baselayer-blocks'),
		'new_item'           => __('New', 'baselayer-blocks'),
		'view_item'          => __('View', 'baselayer-blocks'),
		'search_items'       => __('Search', 'baselayer-blocks'),
		'not_found'          => __('Nothing found.', 'baselayer-blocks'),
		'not_found_in_trash' => __('Nothing found in Trash.', 'baselayer-blocks'),
		'menu_name'          => __('Blocks', 'baselayer-blocks'),
		'all_items'          => __('Blocks', 'baselayer-blocks'),
	];

	register_post_type(BL_BLOCK_POST_TYPE, [
		'labels'              => $labels,
		'public'              => false,
		'show_ui'             => true,
		'show_in_menu'        => false,
		'show_in_rest'        => false,
		'capability_type'     => 'post',
		'map_meta_cap'        => true,
		'hierarchical'        => false,
		'supports'            => ['title'],
		'has_archive'         => false,
		'rewrite'             => false,
		'query_var'           => false,
		'exclude_from_search' => true,
		'publicly_queryable'  => false,
	]);
}
add_action('init', 'bl_blocks_register_post_types');

/**
 * Current definition type from request or post meta.
 */
function bl_blocks_current_list_type(): string
{
	if (isset($_GET['bl_block_type'])) {
		return bl_blocks_sanitize_definition_type(wp_unslash((string) $_GET['bl_block_type']));
	}

	$post_id = 0;
	if (isset($_GET['post'])) {
		$post_id = (int) $_GET['post'];
	} elseif (isset($_POST['post_ID'])) {
		$post_id = (int) $_POST['post_ID'];
	}
	if ($post_id > 0 && get_post_type($post_id) === BL_BLOCK_POST_TYPE) {
		return bl_blocks_get_definition_type($post_id);
	}

	return 'block';
}

/**
 * Labels for a definition type.
 *
 * @return array{plural: string, singular: string, add: string}
 */
function bl_blocks_type_labels(string $type): array
{
	$type = bl_blocks_sanitize_definition_type($type);
	switch ($type) {
		case 'page_settings':
			return [
				'plural'   => __('Content fields', 'baselayer-blocks'),
				'singular' => __('Content fields', 'baselayer-blocks'),
				'add'      => __('Add fields', 'baselayer-blocks'),
			];
		case 'site_settings':
			return [
				'plural'   => __('Website', 'baselayer-blocks'),
				'singular' => __('Website', 'baselayer-blocks'),
				'add'      => __('Add fields', 'baselayer-blocks'),
			];
		default:
			return [
				'plural'   => __('Blocks', 'baselayer-blocks'),
				'singular' => __('Block', 'baselayer-blocks'),
				'add'      => __('Add Block', 'baselayer-blocks'),
			];
	}
}

/**
 * Admin access for definition screens.
 */
function bl_blocks_admin_access_guards(): void
{
	global $pagenow;
	if (!is_admin()) {
		return;
	}

	$post_type = '';
	if (isset($_GET['post_type'])) {
		$post_type = sanitize_key((string) wp_unslash($_GET['post_type']));
	} elseif (isset($_GET['post'])) {
		$post_id = (int) $_GET['post'];
		$post_type = $post_id > 0 ? (string) get_post_type($post_id) : '';
	} elseif ($pagenow === 'post.php' && isset($_POST['post_ID'])) {
		$post_id = (int) $_POST['post_ID'];
		$post_type = $post_id > 0 ? (string) get_post_type($post_id) : '';
	}

	if ($post_type === BL_BLOCK_POST_TYPE && !bl_blocks_user_can_manage()) {
		wp_die(esc_html__('You do not have permission to manage blocks.', 'baselayer-blocks'), 403);
	}
}
add_action('admin_init', 'bl_blocks_admin_access_guards');

/**
 * Filter list table by definition type.
 *
 * @param WP_Query $query
 */
function bl_blocks_filter_list_by_type($query): void
{
	if (!is_admin() || !$query->is_main_query()) {
		return;
	}
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || $screen->post_type !== BL_BLOCK_POST_TYPE || $screen->base !== 'edit') {
		return;
	}
	$type = bl_blocks_current_list_type();
	$query->set('meta_key', BL_BLOCK_TYPE_META);
	$query->set('meta_value', $type);
}
add_action('pre_get_posts', 'bl_blocks_filter_list_by_type');

/**
 * Stamp type meta when creating from a typed “Add New” link.
 *
 * @param int     $post_id
 * @param WP_Post $post
 * @param bool    $update
 */
function bl_blocks_stamp_type_on_insert($post_id, $post, $update): void
{
	if ($update || !($post instanceof WP_Post) || $post->post_type !== BL_BLOCK_POST_TYPE) {
		return;
	}
	$existing = get_post_meta($post_id, BL_BLOCK_TYPE_META, true);
	if (is_string($existing) && $existing !== '') {
		return;
	}
	$type = 'block';
	if (isset($_GET['bl_block_type'])) {
		$type = bl_blocks_sanitize_definition_type(wp_unslash((string) $_GET['bl_block_type']));
	} elseif (isset($_POST['bl_block_type'])) {
		$type = bl_blocks_sanitize_definition_type(wp_unslash((string) $_POST['bl_block_type']));
	}
	update_post_meta($post_id, BL_BLOCK_TYPE_META, $type);
}
add_action('wp_insert_post', 'bl_blocks_stamp_type_on_insert', 10, 3);

/**
 * Classic editor for definition screens (canvas builder).
 */
function bl_blocks_use_classic_editor(bool $use_block_editor, string $post_type): bool
{
	if ($post_type === BL_BLOCK_POST_TYPE) {
		return false;
	}

	return $use_block_editor;
}
add_filter('use_block_editor_for_post_type', 'bl_blocks_use_classic_editor', 10, 2);
