<?php

defined('ABSPATH') || exit;

/**
 * Request caches (direct statics — no copy-out helpers on the hot path).
 *
 * @return array{
 *   editors: array<int, bool>,
 *   rights: array<int, array|false>,
 *   denied: array<int, list<string>>
 * }
 */
function &bl_editorial_request_cache(): array
{
	static $cache = [
		'editors' => [],
		'rights'  => [],
		'denied'  => [],
	];

	return $cache;
}

/**
 * Invalidate request caches for a user (or all users).
 */
function bl_editorial_invalidate_user_cache(?int $user_id = null): void
{
	$cache = &bl_editorial_request_cache();
	if ($user_id === null) {
		$cache['editors'] = [];
		$cache['rights'] = [];
		$cache['denied'] = [];
		return;
	}

	unset($cache['editors'][$user_id], $cache['rights'][$user_id], $cache['denied'][$user_id]);
}

/**
 * Whether the given user has the editor role (exact slug).
 */
function bl_editorial_user_is_editor(?int $user_id = null): bool
{
	$user_id = $user_id ?? get_current_user_id();
	if ($user_id <= 0) {
		return false;
	}

	$cache = &bl_editorial_request_cache();
	if (array_key_exists($user_id, $cache['editors'])) {
		return $cache['editors'][$user_id];
	}

	$user = get_userdata($user_id);
	$is_editor = $user ? in_array('editor', (array) $user->roles, true) : false;
	$cache['editors'][$user_id] = $is_editor;

	return $is_editor;
}

/**
 * Whether the given user is an administrator.
 */
function bl_editorial_user_is_admin(?int $user_id = null): bool
{
	$user_id = $user_id ?? get_current_user_id();
	if ($user_id <= 0) {
		return false;
	}

	$user = get_userdata($user_id);
	if (!$user) {
		return false;
	}

	return in_array('administrator', (array) $user->roles, true);
}

/**
 * Post types that can be toggled in Editorial UI (post, page, and public show_ui CPTs).
 *
 * @return array<string, WP_Post_Type>
 */
function bl_editorial_restrictable_post_types(): array
{
	static $types = null;
	if ($types !== null) {
		return $types;
	}

	$found = get_post_types(
		[
			'public'  => true,
			'show_ui' => true,
		],
		'objects'
	);

	unset($found['attachment']);

	/**
	 * Filter post types available for per-editor access control.
	 *
	 * @param array<string, WP_Post_Type> $found
	 */
	$types = apply_filters('bl_editorial_restrictable_post_types', $found);

	return $types;
}

/**
 * Default rights shape (also used as site-wide defaults for new editors).
 *
 * @return array{
 *   post_types: list<string>,
 *   own_posts_only: bool,
 *   publish_mode: string,
 *   page_access: string,
 *   allowed_page_ids: list<int>,
 *   media_own_only: bool
 * }
 */
function bl_editorial_default_rights(): array
{
	return [
		'post_types'       => ['post', 'page'],
		'own_posts_only'   => false,
		'publish_mode'     => 'direct',
		'page_access'      => 'all',
		'allowed_page_ids' => [],
		'media_own_only'   => false,
	];
}

/**
 * Sanitize a rights array (profile or defaults).
 *
 * @param mixed $raw
 * @return array{
 *   post_types: list<string>,
 *   own_posts_only: bool,
 *   publish_mode: string,
 *   page_access: string,
 *   allowed_page_ids: list<int>,
 *   media_own_only: bool
 * }
 */
function bl_editorial_sanitize_rights($raw): array
{
	$defaults = bl_editorial_default_rights();
	if (!is_array($raw)) {
		return $defaults;
	}

	$allowed_slugs = array_keys(bl_editorial_restrictable_post_types());
	$post_types = [];
	if (isset($raw['post_types']) && is_array($raw['post_types'])) {
		foreach ($raw['post_types'] as $slug) {
			$slug = sanitize_key((string) $slug);
			if ($slug !== '' && in_array($slug, $allowed_slugs, true)) {
				$post_types[] = $slug;
			}
		}
	}
	$post_types = array_values(array_unique($post_types));

	$publish_mode = isset($raw['publish_mode']) ? sanitize_key((string) $raw['publish_mode']) : 'direct';
	if (!in_array($publish_mode, ['direct', 'approval'], true)) {
		$publish_mode = 'direct';
	}

	$page_access = isset($raw['page_access']) ? sanitize_key((string) $raw['page_access']) : 'all';
	if (!in_array($page_access, ['all', 'selected'], true)) {
		$page_access = 'all';
	}

	$page_ids = [];
	if (isset($raw['allowed_page_ids']) && is_array($raw['allowed_page_ids'])) {
		foreach ($raw['allowed_page_ids'] as $id) {
			$id = (int) $id;
			if ($id > 0) {
				$page_ids[] = $id;
			}
		}
	}
	$page_ids = array_values(array_unique($page_ids));

	if ($page_access !== 'selected') {
		$page_ids = [];
	}

	// Page access only applies when pages are editable.
	if (!in_array('page', $post_types, true)) {
		$page_access = 'all';
		$page_ids = [];
	}

	return [
		'post_types'       => $post_types,
		'own_posts_only'   => !empty($raw['own_posts_only']),
		'publish_mode'     => $publish_mode,
		'page_access'      => $page_access,
		'allowed_page_ids' => $page_ids,
		'media_own_only'   => !empty($raw['media_own_only']),
	];
}

/**
 * Effective rights for a user, or null when unrestricted (no meta).
 *
 * @return array{
 *   post_types: list<string>,
 *   own_posts_only: bool,
 *   publish_mode: string,
 *   page_access: string,
 *   allowed_page_ids: list<int>,
 *   media_own_only: bool
 * }|null
 */
function bl_editorial_get_user_rights(int $user_id): ?array
{
	if ($user_id <= 0) {
		return null;
	}

	$cache = &bl_editorial_request_cache();
	if (array_key_exists($user_id, $cache['rights'])) {
		$hit = $cache['rights'][$user_id];
		return $hit === false ? null : $hit;
	}

	if (!bl_editorial_user_is_editor($user_id)) {
		$cache['rights'][$user_id] = false;
		return null;
	}

	$raw = get_user_meta($user_id, BL_EDITORIAL_USER_META, true);
	if (!is_array($raw) || $raw === []) {
		$cache['rights'][$user_id] = false;
		return null;
	}

	$rights = bl_editorial_sanitize_rights($raw);
	$cache['rights'][$user_id] = $rights;

	return $rights;
}

/**
 * Whether editorial restrictions apply to this user.
 */
function bl_editorial_user_is_restricted(int $user_id): bool
{
	return bl_editorial_get_user_rights($user_id) !== null;
}

/**
 * Primitive caps to deny for a restricted editor (built once per request).
 *
 * @return list<string>
 */
function bl_editorial_denied_primitive_caps(int $user_id): array
{
	$cache = &bl_editorial_request_cache();
	if (array_key_exists($user_id, $cache['denied'])) {
		return $cache['denied'][$user_id];
	}

	$rights = bl_editorial_get_user_rights($user_id);
	if ($rights === null) {
		$cache['denied'][$user_id] = [];
		return [];
	}

	$denied = [];
	$allowed_types = $rights['post_types'];

	foreach (bl_editorial_restrictable_post_types() as $slug => $object) {
		$is_allowed = in_array($slug, $allowed_types, true);

		if (!$is_allowed) {
			foreach ([
				$object->cap->edit_posts ?? '',
				$object->cap->edit_others_posts ?? '',
				$object->cap->edit_published_posts ?? '',
				$object->cap->edit_private_posts ?? '',
				$object->cap->publish_posts ?? '',
				$object->cap->delete_posts ?? '',
				$object->cap->delete_others_posts ?? '',
				$object->cap->delete_published_posts ?? '',
				$object->cap->delete_private_posts ?? '',
				$object->cap->create_posts ?? '',
				$object->cap->read_private_posts ?? '',
			] as $cap_name) {
				if ($cap_name !== '') {
					$denied[] = $cap_name;
				}
			}
			continue;
		}

		if (!empty($rights['own_posts_only'])) {
			$edit_others = $object->cap->edit_others_posts ?? '';
			$delete_others = $object->cap->delete_others_posts ?? '';
			if ($edit_others !== '') {
				$denied[] = $edit_others;
			}
			if ($delete_others !== '') {
				$denied[] = $delete_others;
			}
		}

		if ($rights['publish_mode'] === 'approval') {
			$publish = $object->cap->publish_posts ?? '';
			if ($publish !== '') {
				$denied[] = $publish;
			}
		}
	}

	// Do NOT deny create_posts for page allowlists: for pages, create_posts === edit_pages,
	// which would block the entire Pages menu/list. Add New is blocked via menu + admin_init.

	$denied = array_values(array_unique($denied));
	$cache['denied'][$user_id] = $denied;

	return $denied;
}

/**
 * Persist rights for a user (overwrites).
 *
 * @param array<string, mixed> $rights
 */
function bl_editorial_set_user_rights(int $user_id, array $rights): void
{
	update_user_meta($user_id, BL_EDITORIAL_USER_META, bl_editorial_sanitize_rights($rights));
	bl_editorial_invalidate_user_cache($user_id);
}

/**
 * Clear per-user editorial restrictions (stock editor again).
 */
function bl_editorial_clear_user_rights(int $user_id): void
{
	delete_user_meta($user_id, BL_EDITORIAL_USER_META);
	bl_editorial_invalidate_user_cache($user_id);
}

/**
 * Whether the user may edit a given post type under their rights.
 */
function bl_editorial_user_can_edit_post_type(int $user_id, string $post_type): bool
{
	$rights = bl_editorial_get_user_rights($user_id);
	if ($rights === null) {
		return true;
	}

	return in_array($post_type, $rights['post_types'], true);
}

/**
 * Whether the user requires approval before publishing.
 */
function bl_editorial_user_requires_approval(int $user_id): bool
{
	$rights = bl_editorial_get_user_rights($user_id);
	return $rights !== null && $rights['publish_mode'] === 'approval';
}

/**
 * Whether the user may only edit their own posts (for allowed types).
 */
function bl_editorial_user_own_posts_only(int $user_id): bool
{
	$rights = bl_editorial_get_user_rights($user_id);
	return $rights !== null && !empty($rights['own_posts_only']);
}

/**
 * Whether page access is limited to an allowlist.
 *
 * @return list<int>|null null = all pages; list = allowlist (may be empty)
 */
function bl_editorial_user_allowed_page_ids(int $user_id): ?array
{
	$rights = bl_editorial_get_user_rights($user_id);
	if ($rights === null || $rights['page_access'] !== 'selected') {
		return null;
	}

	return $rights['allowed_page_ids'];
}

/**
 * Whether media library is limited to own uploads.
 */
function bl_editorial_user_media_own_only(int $user_id): bool
{
	$rights = bl_editorial_get_user_rights($user_id);
	return $rights !== null && !empty($rights['media_own_only']);
}
