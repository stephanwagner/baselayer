<?php

defined('ABSPATH') || exit;

/**
 * Extra guard when saving pages outside the allowlist (covers edge cases map_meta_cap misses).
 *
 * @param array $data
 * @param array $postarr
 * @return array
 */
function bl_editorial_wp_insert_post_data(array $data, array $postarr): array
{
	$user_id = get_current_user_id();
	if (!bl_editorial_user_is_restricted($user_id)) {
		return $data;
	}

	$post_type = isset($data['post_type']) ? (string) $data['post_type'] : 'post';
	if ($post_type !== 'page') {
		return $data;
	}

	$allowed = bl_editorial_user_allowed_page_ids($user_id);
	if (!is_array($allowed)) {
		return $data;
	}

	$post_id = isset($postarr['ID']) ? (int) $postarr['ID'] : 0;
	if ($post_id <= 0) {
		wp_die(
			esc_html__('You are not allowed to create new pages.', 'baselayer-editorial'),
			esc_html__('Forbidden', 'baselayer-editorial'),
			['response' => 403]
		);
	}

	if (!in_array($post_id, $allowed, true)) {
		wp_die(
			esc_html__('You are not allowed to edit this page.', 'baselayer-editorial'),
			esc_html__('Forbidden', 'baselayer-editorial'),
			['response' => 403]
		);
	}

	return $data;
}
add_filter('wp_insert_post_data', 'bl_editorial_wp_insert_post_data', 10, 2);
