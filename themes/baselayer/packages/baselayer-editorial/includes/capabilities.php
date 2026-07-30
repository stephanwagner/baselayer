<?php

defined('ABSPATH') || exit;

/**
 * Meta caps that need per-post Editorial checks (isset map for O(1) reject).
 *
 * @var array<string, true>
 */
const BL_EDITORIAL_META_CAPS = [
	'edit_post'    => true,
	'delete_post'  => true,
	'read_post'    => true,
	'publish_post' => true,
];

/**
 * Thin map_meta_cap: almost all calls exit on the isset check.
 *
 * @param string[] $caps
 * @param string   $cap
 * @param int      $user_id
 * @param array    $args
 * @return string[]
 */
function bl_editorial_map_meta_cap(array $caps, string $cap, int $user_id, array $args): array
{
	if (!isset(BL_EDITORIAL_META_CAPS[$cap]) || $user_id <= 0) {
		return $caps;
	}

	$rights = bl_editorial_get_user_rights($user_id);
	if ($rights === null) {
		return $caps;
	}

	$post_id = isset($args[0]) ? (int) $args[0] : 0;
	if ($post_id <= 0) {
		return $caps;
	}

	$post = get_post($post_id);
	if (!$post instanceof WP_Post) {
		return $caps;
	}

	$post_type = $post->post_type;

	if ($post_type === 'revision') {
		$parent = get_post((int) $post->post_parent);
		if ($parent instanceof WP_Post) {
			$post = $parent;
			$post_type = $parent->post_type;
			$post_id = (int) $parent->ID;
		}
	}

	if ($post_type === 'attachment') {
		if (!empty($rights['media_own_only']) && (int) $post->post_author !== $user_id) {
			return ['do_not_allow'];
		}
		return $caps;
	}

	if (!in_array($post_type, $rights['post_types'], true)) {
		return ['do_not_allow'];
	}

	if ($post_type === 'page' && $rights['page_access'] === 'selected') {
		if (!in_array($post_id, $rights['allowed_page_ids'], true)) {
			return ['do_not_allow'];
		}
	}

	if (
		!empty($rights['own_posts_only'])
		&& (int) $post->post_author !== $user_id
		&& ($cap === 'edit_post' || $cap === 'delete_post' || $cap === 'publish_post')
	) {
		return ['do_not_allow'];
	}

	return $caps;
}

/**
 * Patch denied primitive caps onto the user object once (no user_has_cap filter).
 */
function bl_editorial_patch_user_allcaps(WP_User $user): void
{
	$user_id = (int) $user->ID;
	if ($user_id <= 0) {
		return;
	}

	foreach (bl_editorial_denied_primitive_caps($user_id) as $cap_name) {
		$user->allcaps[$cap_name] = false;
	}
}

/**
 * Enable Editorial capability enforcement only for the current restricted editor.
 *
 * Admins / unrestricted users: attach nothing (zero hot-path cost).
 * Restricted editors: one-time allcaps patch + thin map_meta_cap only.
 */
function bl_editorial_sync_capability_hooks(): void
{
	static $hooks_attached = false;
	static $patched_user_id = 0;

	$user_id = get_current_user_id();

	// Always detach first when user changes or becomes unrestricted.
	if ($hooks_attached) {
		remove_filter('map_meta_cap', 'bl_editorial_map_meta_cap', 10);
		$hooks_attached = false;
	}

	if ($user_id <= 0 || !bl_editorial_user_is_restricted($user_id)) {
		$patched_user_id = 0;
		return;
	}

	$user = wp_get_current_user();
	if (!$user instanceof WP_User || (int) $user->ID !== $user_id) {
		return;
	}

	if ($patched_user_id !== $user_id) {
		bl_editorial_patch_user_allcaps($user);
		$patched_user_id = $user_id;
	}

	add_filter('map_meta_cap', 'bl_editorial_map_meta_cap', 10, 4);
	$hooks_attached = true;
}

add_action('set_current_user', 'bl_editorial_sync_capability_hooks', 20);

// User may already be set when this file loads (plugins_loaded / theme).
if (did_action('set_current_user') || get_current_user_id() > 0) {
	bl_editorial_sync_capability_hooks();
}
