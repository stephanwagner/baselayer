<?php

defined('ABSPATH') || exit;

/**
 * Meta caps that carry a post ID in $args[0].
 *
 * @return list<string>
 */
function bl_editorial_post_meta_caps(): array
{
	return [
		'edit_post',
		'delete_post',
		'read_post',
		'publish_post',
	];
}

/**
 * Deny meta capabilities for restricted editors.
 *
 * @param string[] $caps
 * @param string   $cap
 * @param int      $user_id
 * @param array    $args
 * @return string[]
 */
function bl_editorial_map_meta_cap(array $caps, string $cap, int $user_id, array $args): array
{
	if ($user_id <= 0 || !bl_editorial_user_is_restricted($user_id)) {
		return $caps;
	}

	$rights = bl_editorial_get_user_rights($user_id);
	if ($rights === null) {
		return $caps;
	}

	if (!in_array($cap, bl_editorial_post_meta_caps(), true)) {
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

	if (!bl_editorial_user_can_edit_post_type($user_id, $post_type)) {
		return ['do_not_allow'];
	}

	if ($post_type === 'page') {
		$allowed = bl_editorial_user_allowed_page_ids($user_id);
		if (is_array($allowed) && !in_array($post_id, $allowed, true)) {
			return ['do_not_allow'];
		}
	}

	if (
		bl_editorial_user_own_posts_only($user_id)
		&& (int) $post->post_author !== $user_id
		&& in_array($cap, ['edit_post', 'delete_post', 'publish_post'], true)
	) {
		return ['do_not_allow'];
	}

	return $caps;
}
add_filter('map_meta_cap', 'bl_editorial_map_meta_cap', 10, 4);

/**
 * Adjust primitive capabilities for restricted editors.
 *
 * @param array<string, bool> $allcaps
 * @param string[]            $caps
 * @param array               $args
 * @param WP_User             $user
 * @return array<string, bool>
 */
function bl_editorial_user_has_cap(array $allcaps, array $caps, array $args, WP_User $user): array
{
	$user_id = (int) $user->ID;
	if ($user_id <= 0 || !bl_editorial_user_is_restricted($user_id)) {
		return $allcaps;
	}

	$rights = bl_editorial_get_user_rights($user_id);
	if ($rights === null) {
		return $allcaps;
	}

	$requested = isset($args[0]) ? (string) $args[0] : '';

	foreach (bl_editorial_restrictable_post_types() as $slug => $object) {
		if (in_array($slug, $rights['post_types'], true)) {
			continue;
		}

		$pto = $object;
		$type_caps = [
			$pto->cap->edit_posts ?? '',
			$pto->cap->edit_others_posts ?? '',
			$pto->cap->edit_published_posts ?? '',
			$pto->cap->edit_private_posts ?? '',
			$pto->cap->publish_posts ?? '',
			$pto->cap->delete_posts ?? '',
			$pto->cap->delete_others_posts ?? '',
			$pto->cap->delete_published_posts ?? '',
			$pto->cap->delete_private_posts ?? '',
			$pto->cap->create_posts ?? '',
			$pto->cap->read_private_posts ?? '',
		];

		foreach ($type_caps as $cap_name) {
			if ($cap_name !== '') {
				$allcaps[$cap_name] = false;
			}
		}
	}

	if (bl_editorial_user_own_posts_only($user_id)) {
		foreach (bl_editorial_restrictable_post_types() as $slug => $object) {
			if (!in_array($slug, $rights['post_types'], true)) {
				continue;
			}
			$edit_others = $object->cap->edit_others_posts ?? '';
			$delete_others = $object->cap->delete_others_posts ?? '';
			if ($edit_others !== '') {
				$allcaps[$edit_others] = false;
			}
			if ($delete_others !== '') {
				$allcaps[$delete_others] = false;
			}
		}
	}

	if (bl_editorial_user_requires_approval($user_id)) {
		foreach (bl_editorial_restrictable_post_types() as $slug => $object) {
			if (!in_array($slug, $rights['post_types'], true)) {
				continue;
			}
			$publish = $object->cap->publish_posts ?? '';
			if ($publish !== '') {
				$allcaps[$publish] = false;
			}
		}
	}

	$allowed_pages = bl_editorial_user_allowed_page_ids($user_id);
	if (is_array($allowed_pages)) {
		$page_obj = get_post_type_object('page');
		if ($page_obj) {
			$create = $page_obj->cap->create_posts ?? 'edit_pages';
			$allcaps[$create] = false;
		}
	}

	// Short-circuit explicit checks that still appear in $caps after map_meta_cap.
	if ($requested === 'do_not_allow') {
		$allcaps['do_not_allow'] = false;
	}

	return $allcaps;
}
add_filter('user_has_cap', 'bl_editorial_user_has_cap', 10, 4);
