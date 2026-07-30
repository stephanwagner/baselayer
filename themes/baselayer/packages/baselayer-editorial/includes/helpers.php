<?php

defined('ABSPATH') || exit;

/**
 * Whether the given user has the editor role (exact slug).
 */
function bl_editorial_user_is_editor(?int $user_id = null): bool
{
	$user_id = $user_id ?? get_current_user_id();
	if ($user_id <= 0) {
		return false;
	}

	$user = get_userdata($user_id);
	if (!$user) {
		return false;
	}

	return in_array('editor', (array) $user->roles, true);
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
	$types = get_post_types(
		[
			'public'  => true,
			'show_ui' => true,
		],
		'objects'
	);

	unset($types['attachment']);

	/**
	 * Filter post types available for per-editor access control.
	 *
	 * @param array<string, WP_Post_Type> $types
	 */
	return apply_filters('bl_editorial_restrictable_post_types', $types);
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
	if ($user_id <= 0 || !bl_editorial_user_is_editor($user_id)) {
		return null;
	}

	$raw = get_user_meta($user_id, BL_EDITORIAL_USER_META, true);
	if (!is_array($raw) || $raw === []) {
		return null;
	}

	return bl_editorial_sanitize_rights($raw);
}

/**
 * Whether editorial restrictions apply to this user.
 */
function bl_editorial_user_is_restricted(int $user_id): bool
{
	return bl_editorial_get_user_rights($user_id) !== null;
}

/**
 * Persist rights for a user (overwrites).
 *
 * @param array<string, mixed> $rights
 */
function bl_editorial_set_user_rights(int $user_id, array $rights): void
{
	update_user_meta($user_id, BL_EDITORIAL_USER_META, bl_editorial_sanitize_rights($rights));
}

/**
 * Clear per-user editorial restrictions (stock editor again).
 */
function bl_editorial_clear_user_rights(int $user_id): void
{
	delete_user_meta($user_id, BL_EDITORIAL_USER_META);
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

	return array_map('intval', $rights['allowed_page_ids']);
}

/**
 * Whether media library is limited to own uploads.
 */
function bl_editorial_user_media_own_only(int $user_id): bool
{
	$rights = bl_editorial_get_user_rights($user_id);
	return $rights !== null && !empty($rights['media_own_only']);
}
