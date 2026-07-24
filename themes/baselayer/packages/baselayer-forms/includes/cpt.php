<?php

defined('ABSPATH') || exit;

/**
 * Register Forms and Form Entries post types.
 */
function bl_forms_register_post_types(): void
{
	$labels_form = [
		'name'               => __('Forms', 'baselayer-forms'),
		'singular_name'      => __('Form', 'baselayer-forms'),
		'add_new'            => __('Add Form', 'baselayer-forms'),
		'add_new_item'       => __('Add Form', 'baselayer-forms'),
		'edit_item'          => __('Edit Form', 'baselayer-forms'),
		'new_item'           => __('New Form', 'baselayer-forms'),
		'view_item'          => __('View Form', 'baselayer-forms'),
		'search_items'       => __('Search Forms', 'baselayer-forms'),
		'not_found'          => __('No forms found.', 'baselayer-forms'),
		'not_found_in_trash' => __('No forms found in Trash.', 'baselayer-forms'),
		'menu_name'          => __('Forms', 'baselayer-forms'),
		'all_items'          => __('All Forms', 'baselayer-forms'),
	];

	$menu_icon = 'dashicons-feedback';
	$svg = bl_forms_svg_code('inbox-text-fill');
	if ($svg !== '') {
		$menu_icon = bl_forms_svg_to_menu_icon($svg);
	}

	register_post_type(BL_FORM_POST_TYPE, [
		'labels'              => $labels_form,
		'public'              => false,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'show_in_rest'        => false,
		'menu_position'       => 26,
		'menu_icon'           => $menu_icon,
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

	$labels_entry = [
		'name'               => __('Form Entries', 'baselayer-forms'),
		'singular_name'      => __('Form Entry', 'baselayer-forms'),
		'edit_item'          => __('View Entry', 'baselayer-forms'),
		'search_items'       => __('Search Entries', 'baselayer-forms'),
		'not_found'          => __('No entries found.', 'baselayer-forms'),
		'not_found_in_trash' => __('No entries found in Trash.', 'baselayer-forms'),
		'menu_name'          => __('Entries', 'baselayer-forms'),
		'all_items'          => __('Entries', 'baselayer-forms'),
	];

	register_post_type(BL_FORM_ENTRY_POST_TYPE, [
		'labels'              => $labels_entry,
		'public'              => false,
		'show_ui'             => true,
		'show_in_menu'        => 'edit.php?post_type=' . BL_FORM_POST_TYPE,
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
add_action('init', 'bl_forms_register_post_types');

/**
 * Restrict form definition screens to developers; entries to manage_options.
 */
function bl_forms_admin_access_guards(): void
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

	if (
		$post_type === BL_FORM_POST_TYPE
		&& $pagenow === 'edit.php'
		&& !bl_forms_user_can_manage()
		&& bl_forms_user_can_view_entries()
	) {
		wp_safe_redirect(admin_url('edit.php?post_type=' . BL_FORM_ENTRY_POST_TYPE));
		exit;
	}

	if ($post_type === BL_FORM_POST_TYPE && !bl_forms_user_can_manage()) {
		wp_die(esc_html__('You do not have permission to manage forms.', 'baselayer-forms'), 403);
	}

	if ($post_type === BL_FORM_ENTRY_POST_TYPE && !bl_forms_user_can_view_entries()) {
		wp_die(esc_html__('You do not have permission to view form entries.', 'baselayer-forms'), 403);
	}
}
add_action('admin_init', 'bl_forms_admin_access_guards');

/**
 * Hide Forms menu for users who cannot manage forms or view entries.
 */
function bl_forms_maybe_hide_menu(): void
{
	if (bl_forms_user_can_manage() || bl_forms_user_can_view_entries()) {
		if (!bl_forms_user_can_manage()) {
			remove_submenu_page(
				'edit.php?post_type=' . BL_FORM_POST_TYPE,
				'post-new.php?post_type=' . BL_FORM_POST_TYPE
			);
			remove_submenu_page(
				'edit.php?post_type=' . BL_FORM_POST_TYPE,
				'edit.php?post_type=' . BL_FORM_POST_TYPE
			);
		}

		return;
	}

	remove_menu_page('edit.php?post_type=' . BL_FORM_POST_TYPE);
}
add_action('admin_menu', 'bl_forms_maybe_hide_menu', 999);

/**
 * Published forms for the block picker.
 *
 * @return array<int, string> id => title
 */
function bl_forms_published_choices(): array
{
	$posts = get_posts([
		'post_type'              => BL_FORM_POST_TYPE,
		'post_status'            => 'publish',
		'posts_per_page'         => 200,
		'orderby'                => 'title',
		'order'                  => 'ASC',
		'no_found_rows'          => true,
		'update_post_meta_cache' => false,
		'update_post_term_cache' => false,
	]);

	$out = [];
	foreach ($posts as $post) {
		$out[(int) $post->ID] = $post->post_title !== ''
			? $post->post_title
			: sprintf(__('Form #%d', 'baselayer-forms'), (int) $post->ID);
	}

	return $out;
}
