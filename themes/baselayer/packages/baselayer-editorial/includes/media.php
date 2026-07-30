<?php

defined('ABSPATH') || exit;

/**
 * Restrict media library queries to the current user’s uploads.
 *
 * @param WP_Query $query
 */
function bl_editorial_media_pre_get_posts(WP_Query $query): void
{
	if (!is_admin()) {
		return;
	}

	$user_id = get_current_user_id();
	if (!bl_editorial_user_media_own_only($user_id)) {
		return;
	}

	$post_type = $query->get('post_type');
	if ($post_type !== 'attachment' && !(is_array($post_type) && in_array('attachment', $post_type, true))) {
		return;
	}

	$query->set('author', $user_id);
}
add_action('pre_get_posts', 'bl_editorial_media_pre_get_posts');

/**
 * Restrict the media modal (query-attachments) to own uploads.
 *
 * @param array<string, mixed> $query
 * @return array<string, mixed>
 */
function bl_editorial_ajax_query_attachments_args(array $query): array
{
	$user_id = get_current_user_id();
	if (!bl_editorial_user_media_own_only($user_id)) {
		return $query;
	}

	$query['author'] = $user_id;

	return $query;
}
add_filter('ajax_query_attachments_args', 'bl_editorial_ajax_query_attachments_args');
