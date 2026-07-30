<?php

defined('ABSPATH') || exit;

/**
 * Remove admin menus for disallowed post types.
 */
function bl_editorial_admin_menu_cleanup(): void
{
	$user_id = get_current_user_id();
	if (!bl_editorial_user_is_restricted($user_id)) {
		return;
	}

	$rights = bl_editorial_get_user_rights($user_id);
	if ($rights === null) {
		return;
	}

	foreach (bl_editorial_restrictable_post_types() as $slug => $object) {
		if (in_array($slug, $rights['post_types'], true)) {
			continue;
		}

		if ($slug === 'post') {
			remove_menu_page('edit.php');
			continue;
		}

		if ($slug === 'page') {
			remove_menu_page('edit.php?post_type=page');
			continue;
		}

		$menu_slug = is_string($object->show_in_menu) && $object->show_in_menu !== ''
			? $object->show_in_menu
			: 'edit.php?post_type=' . $slug;

		if ($object->show_in_menu === true || $object->show_in_menu === '1') {
			remove_menu_page('edit.php?post_type=' . $slug);
		} elseif (is_string($object->show_in_menu) && $object->show_in_menu !== '') {
			remove_submenu_page($menu_slug, 'edit.php?post_type=' . $slug);
			remove_submenu_page($menu_slug, 'post-new.php?post_type=' . $slug);
		} else {
			remove_menu_page('edit.php?post_type=' . $slug);
		}
	}

	$allowed_pages = bl_editorial_user_allowed_page_ids($user_id);
	if (is_array($allowed_pages) && in_array('page', $rights['post_types'], true)) {
		remove_submenu_page('edit.php?post_type=page', 'post-new.php?post_type=page');
	}
}
add_action('admin_menu', 'bl_editorial_admin_menu_cleanup', 999);

/**
 * Hide “Add New” for pages when an allowlist is active.
 */
function bl_editorial_admin_head_styles(): void
{
	$user_id = get_current_user_id();
	if (!bl_editorial_user_is_restricted($user_id)) {
		return;
	}

	$allowed = bl_editorial_user_allowed_page_ids($user_id);
	if (!is_array($allowed)) {
		return;
	}

	echo '<style>.post-type-page .page-title-action{display:none!important;}</style>';
}
add_action('admin_head', 'bl_editorial_admin_head_styles');

/**
 * Block direct access to disallowed post type screens.
 */
function bl_editorial_block_disallowed_screens(): void
{
	$user_id = get_current_user_id();
	if (!bl_editorial_user_is_restricted($user_id)) {
		return;
	}

	global $pagenow;
	if (!in_array($pagenow, ['edit.php', 'post-new.php', 'post.php'], true)) {
		return;
	}

	$post_type = 'post';
	if ($pagenow === 'post.php' && isset($_GET['post'])) {
		$post = get_post((int) $_GET['post']);
		if ($post instanceof WP_Post) {
			$post_type = $post->post_type;
		}
	} elseif (isset($_GET['post_type'])) {
		$post_type = sanitize_key((string) $_GET['post_type']);
	}

	if ($post_type === '' || $post_type === 'attachment') {
		return;
	}

	if (!bl_editorial_user_can_edit_post_type($user_id, $post_type)) {
		wp_die(
			esc_html__('You are not allowed to access this content type.', 'baselayer-editorial'),
			esc_html__('Forbidden', 'baselayer-editorial'),
			['response' => 403]
		);
	}

	if ($pagenow === 'post-new.php' && $post_type === 'page') {
		$allowed = bl_editorial_user_allowed_page_ids($user_id);
		if (is_array($allowed)) {
			wp_die(
				esc_html__('You are not allowed to create new pages.', 'baselayer-editorial'),
				esc_html__('Forbidden', 'baselayer-editorial'),
				['response' => 403]
			);
		}
	}
}
add_action('admin_init', 'bl_editorial_block_disallowed_screens');

/**
 * Narrow list tables for own-posts and page allowlists.
 *
 * @param WP_Query $query
 */
function bl_editorial_pre_get_posts(WP_Query $query): void
{
	if (!is_admin() || !$query->is_main_query()) {
		return;
	}

	$user_id = get_current_user_id();
	if (!bl_editorial_user_is_restricted($user_id)) {
		return;
	}

	$post_type = $query->get('post_type');
	if (is_array($post_type)) {
		$post_type = $post_type[0] ?? 'post';
	}
	$post_type = $post_type ? (string) $post_type : 'post';

	if ($post_type === 'page') {
		$allowed = bl_editorial_user_allowed_page_ids($user_id);
		if (is_array($allowed)) {
			$query->set('post__in', $allowed === [] ? [0] : $allowed);
		}
	}

	if (bl_editorial_user_own_posts_only($user_id) && bl_editorial_user_can_edit_post_type($user_id, $post_type)) {
		$query->set('author', $user_id);
	}
}
add_action('pre_get_posts', 'bl_editorial_pre_get_posts');
