<?php

defined('ABSPATH') || exit;

/**
 * Drop WordPress’s “Protected:” / “Geschützt:” title prefix on the frontend.
 */
add_filter('protected_title_format', static fn (): string => '%s');

/**
 * Themed login-style card for password-protected posts/pages.
 *
 * Markup is built as compact HTML so wpautop (on the_content) does not insert
 * stray <br> tags between elements.
 *
 * @param string       $output           Default WordPress password form HTML.
 * @param WP_Post|null $post             Post object.
 * @param string       $invalid_password Invalid password message (empty when none).
 * @return string
 */
function bl_the_password_form(string $output, $post = null, string $invalid_password = ''): string
{
	$post = get_post($post);
	if (!$post instanceof WP_Post) {
		return $output;
	}

	$field_id = 'pwbox-' . (int) $post->ID;
	$has_error = $invalid_password !== '';
	$form_class = 'post-password-form bl-password-form' . ($has_error ? ' password-form-error' : '');

	$error_html = '';
	$aria = '';
	if ($has_error) {
		$error_id = 'error-' . $field_id;
		$error_html = sprintf(
			'<div class="bl-password-form__error post-password-form-invalid-password" role="alert"><p id="%s">%s</p></div>',
			esc_attr($error_id),
			esc_html($invalid_password)
		);
		$aria = ' aria-describedby="' . esc_attr($error_id) . '"';
	}

	$title = __('Protected content', 'baselayer');
	$description = __('This content is password-protected. Enter the password to view it.', 'baselayer');
	$label = __('Password', 'baselayer');
	$submit = __('Continue', 'baselayer');

	return sprintf(
		'<form action="%1$s" class="%2$s" method="post"><input type="hidden" name="redirect_to" value="%3$s" /><div class="bl-password-form__card"><h2 class="bl-password-form__title">%4$s</h2><p class="bl-password-form__description">%5$s</p>%6$s<div class="bl-password-form__fields"><label class="bl-password-form__label" for="%7$s">%8$s</label><input class="bl-password-form__input" name="post_password" id="%7$s" type="password" spellcheck="false" required autocomplete="current-password"%9$s /><button class="button bl-password-form__submit" type="submit" name="Submit">%10$s</button></div></div></form>',
		esc_url(site_url('wp-login.php?action=postpass', 'login_post')),
		esc_attr($form_class),
		esc_attr(get_permalink($post)),
		esc_html($title),
		esc_html($description),
		$error_html,
		esc_attr($field_id),
		esc_html($label),
		$aria,
		esc_html($submit)
	);
}
add_filter('the_password_form', 'bl_the_password_form', 10, 3);
