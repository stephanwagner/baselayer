<?php

defined('ABSPATH') || exit;

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
