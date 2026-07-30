<?php

defined('ABSPATH') || exit;

/**
 * Whether a restricted editor may access a post type in admin (menu / screens).
 */
function bl_editorial_user_may_access_post_type_admin(int $user_id, string $post_type): bool
{
	if ($post_type === '' || $post_type === 'attachment') {
		return true;
	}

	return bl_editorial_user_can_edit_post_type($user_id, $post_type);
}

/**
 * Post type slug from an admin menu/submenu file slug, or null if not a post-type screen.
 */
function bl_editorial_post_type_from_menu_slug(string $slug): ?string
{
	if ($slug === 'edit.php' || $slug === 'post-new.php') {
		return 'post';
	}

	if (preg_match('/^(?:edit|post-new)\.php\?post_type=([a-z0-9_-]+)/i', $slug, $m)) {
		return sanitize_key($m[1]);
	}

	return null;
}

/**
 * Remove admin menus / submenus for post types the editor cannot edit.
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

	global $menu, $submenu;

	// Top-level menus (Posts, Pages, CPTs with show_in_menu => true).
	if (is_array($menu)) {
		foreach ($menu as $index => $item) {
			$slug = isset($item[2]) ? (string) $item[2] : '';
			$post_type = bl_editorial_post_type_from_menu_slug($slug);
			if ($post_type === null) {
				continue;
			}
			if (!bl_editorial_user_may_access_post_type_admin($user_id, $post_type)) {
				unset($menu[$index]);
			}
		}
	}

	// Submenus under CPT parents or nested under another menu (show_in_menu => 'parent.php').
	if (is_array($submenu)) {
		foreach ($submenu as $parent => $items) {
			if (!is_array($items)) {
				continue;
			}
			foreach ($items as $index => $item) {
				$slug = isset($item[2]) ? (string) $item[2] : '';
				$post_type = bl_editorial_post_type_from_menu_slug($slug);
				if ($post_type === null) {
					continue;
				}
				if (!bl_editorial_user_may_access_post_type_admin($user_id, $post_type)) {
					unset($submenu[$parent][$index]);
				}
			}
			if (isset($submenu[$parent]) && $submenu[$parent] === []) {
				unset($submenu[$parent]);
			}
		}
	}

	// Also use WP helpers for common cases (harmless if already removed).
	foreach (bl_editorial_restrictable_post_types() as $slug => $object) {
		if (in_array($slug, $rights['post_types'], true)) {
			continue;
		}

		if ($slug === 'post') {
			remove_menu_page('edit.php');
			continue;
		}

		remove_menu_page('edit.php?post_type=' . $slug);

		if (is_string($object->show_in_menu) && $object->show_in_menu !== '' && $object->show_in_menu !== '1') {
			remove_submenu_page($object->show_in_menu, 'edit.php?post_type=' . $slug);
			remove_submenu_page($object->show_in_menu, 'post-new.php?post_type=' . $slug);
		}
	}

	// Page allowlist: no “Add New”.
	if (in_array('page', $rights['post_types'], true) && is_array(bl_editorial_user_allowed_page_ids($user_id))) {
		remove_submenu_page('edit.php?post_type=page', 'post-new.php?post_type=page');
	}
}
add_action('admin_menu', 'bl_editorial_admin_menu_cleanup', 9999);

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

	if (!bl_editorial_user_may_access_post_type_admin($user_id, $post_type)) {
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
		$post_type = $post_type[0] ?? '';
	}
	$post_type = is_string($post_type) ? $post_type : '';
	if ($post_type === '') {
		global $typenow, $pagenow;
		if (!empty($typenow) && is_string($typenow)) {
			$post_type = $typenow;
		} elseif ($pagenow === 'edit.php' && isset($_GET['post_type'])) {
			$post_type = sanitize_key((string) $_GET['post_type']);
		} else {
			$post_type = 'post';
		}
	}

	if ($post_type === 'page') {
		$allowed = bl_editorial_user_allowed_page_ids($user_id);
		if (is_array($allowed)) {
			// Keep list usable: only allowlisted IDs (empty allowlist → no pages).
			$query->set('post__in', $allowed === [] ? [0] : array_map('intval', $allowed));
			$query->set('orderby', 'post__in');
		}
	}

	if (bl_editorial_user_own_posts_only($user_id) && bl_editorial_user_can_edit_post_type($user_id, $post_type)) {
		$query->set('author', $user_id);
	}
}
add_action('pre_get_posts', 'bl_editorial_pre_get_posts');
