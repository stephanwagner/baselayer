<?php

defined('ABSPATH') || exit;

/**
 * Statuses that must stay live when an approval editor updates content.
 *
 * @return list<string>
 */
function bl_editorial_live_post_statuses(): array
{
	return ['publish', 'future'];
}

/**
 * Keep already-published (or scheduled) content live when approval editors save.
 *
 * Gutenberg often sends pending/draft when publish_* is missing; pin status so
 * the front end does not go offline. New drafts may still become pending.
 *
 * @param array $data
 * @param array $postarr
 * @return array
 */
function bl_editorial_pin_published_status(array $data, array $postarr): array
{
	$user_id = get_current_user_id();
	if ($user_id <= 0 || !bl_editorial_user_requires_approval($user_id)) {
		return $data;
	}

	$post_id = isset($postarr['ID']) ? (int) $postarr['ID'] : 0;
	if ($post_id <= 0) {
		return $data;
	}

	$post_type = isset($data['post_type']) ? (string) $data['post_type'] : '';
	if ($post_type === '' || !bl_editorial_user_can_edit_post_type($user_id, $post_type)) {
		return $data;
	}

	$previous = get_post($post_id);
	if (!$previous instanceof WP_Post) {
		return $data;
	}

	$previous_status = (string) $previous->post_status;
	if (!in_array($previous_status, bl_editorial_live_post_statuses(), true)) {
		return $data;
	}

	$incoming = isset($data['post_status']) ? (string) $data['post_status'] : '';
	if ($incoming !== $previous_status) {
		$data['post_status'] = $previous_status;
	}

	return $data;
}
add_filter('wp_insert_post_data', 'bl_editorial_pin_published_status', 5, 2);

/**
 * Restore REST wp:action-publish for already-live posts so Gutenberg shows Update.
 *
 * @param WP_REST_Response $response
 * @param WP_Post          $post
 * @return WP_REST_Response
 */
function bl_editorial_rest_prepare_action_publish(WP_REST_Response $response, WP_Post $post): WP_REST_Response
{
	$user_id = get_current_user_id();
	if ($user_id <= 0 || !bl_editorial_user_requires_approval($user_id)) {
		return $response;
	}

	if (!in_array((string) $post->post_status, bl_editorial_live_post_statuses(), true)) {
		return $response;
	}

	if (!bl_editorial_user_can_edit_post_type($user_id, $post->post_type)) {
		return $response;
	}

	if (!current_user_can('edit_post', $post->ID)) {
		return $response;
	}

	$links = $response->get_links();
	if (isset($links['https://api.w.org/action-publish'])) {
		return $response;
	}

	$object = get_post_type_object($post->post_type);
	$rest_base = ($object && !empty($object->rest_base)) ? (string) $object->rest_base : $post->post_type;
	$href = rest_url(sprintf('wp/v2/%s/%d', $rest_base, $post->ID));
	$self = $response->get_links()['self'][0]['href'] ?? '';
	if (is_string($self) && $self !== '') {
		$href = $self;
	}

	$response->add_link('https://api.w.org/action-publish', $href, [
		'targetHints' => [
			'allow' => ['PUT'],
		],
	]);

	return $response;
}

/**
 * Register REST prepare filters for restrictable post types.
 */
function bl_editorial_register_rest_action_publish_filters(): void
{
	foreach (array_keys(bl_editorial_restrictable_post_types()) as $slug) {
		add_filter('rest_prepare_' . $slug, 'bl_editorial_rest_prepare_action_publish', 10, 2);
	}
}
add_action('init', 'bl_editorial_register_rest_action_publish_filters', 30);

/**
 * Email approval recipients when an editor submits content for review.
 *
 * @param string  $new_status
 * @param string  $old_status
 * @param WP_Post $post
 */
function bl_editorial_notify_on_pending(string $new_status, string $old_status, WP_Post $post): void
{
	if ($new_status !== 'pending' || $old_status === 'pending') {
		return;
	}

	if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
		return;
	}

	if (wp_is_post_revision($post) || wp_is_post_autosave($post)) {
		return;
	}

	$user_id = get_current_user_id();
	if ($user_id <= 0 || !bl_editorial_user_requires_approval($user_id)) {
		return;
	}

	if (!bl_editorial_user_can_edit_post_type($user_id, $post->post_type)) {
		return;
	}

	$settings = bl_editorial_get_settings();
	$recipients = bl_editorial_parse_recipients($settings['approval_recipients']);
	if ($recipients === []) {
		$admin_email = get_option('admin_email');
		if (is_email((string) $admin_email)) {
			$recipients = [(string) $admin_email];
		}
	}

	if ($recipients === []) {
		return;
	}

	$author = get_userdata($user_id);
	$author_name = $author ? $author->display_name : __('An editor', 'baselayer-editorial');
	$title = get_the_title($post) ?: __('(no title)', 'baselayer-editorial');
	$edit_link = get_edit_post_link($post->ID, 'raw') ?: admin_url('post.php?post=' . $post->ID . '&action=edit');
	$type_object = get_post_type_object($post->post_type);
	$type_label = $type_object ? $type_object->labels->singular_name : $post->post_type;

	$subject = trim((string) $settings['approval_subject']);
	if ($subject === '') {
		$subject = sprintf(
			/* translators: 1: site name, 2: content title */
			__('[%1$s] Approval requested: %2$s', 'baselayer-editorial'),
			wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES),
			$title
		);
	} else {
		$subject = strtr($subject, [
			'{site_name}' => wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES),
			'{title}'     => $title,
			'{author}'    => $author_name,
			'{type}'      => $type_label,
		]);
	}

	$body = sprintf(
		/* translators: 1: author name, 2: content type, 3: title, 4: edit URL */
		__("%1\$s submitted a %2\$s for approval.\n\nTitle: %3\$s\n\nReview and publish:\n%4\$s\n", 'baselayer-editorial'),
		$author_name,
		$type_label,
		$title,
		$edit_link
	);

	$headers = ['Content-Type: text/plain; charset=UTF-8'];

	foreach ($recipients as $email) {
		wp_mail($email, $subject, $body, $headers);
	}
}
add_action('transition_post_status', 'bl_editorial_notify_on_pending', 20, 3);
