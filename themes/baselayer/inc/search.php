<?php

defined('ABSPATH') || exit;

/**
 * Front-end search URL (WordPress `?s=` query).
 */
function bl_search_url(): string
{
	return home_url('/');
}

/**
 * Render the theme search form.
 *
 * @param array<string, mixed> $args {
 *     @type string $placeholder Placeholder for the search field.
 *     @type string $label       Visible label (screen-reader text when empty).
 *     @type string $button      Submit button text.
 *     @type string $value       Pre-filled search query.
 *     @type string $action      Form action URL.
 *     @type string $id          Base id for input/label (suffix added).
 *     @type string $class       Extra class on the form element.
 *     @type bool   $autofocus   Autofocus the input (e.g. search modal).
 * }
 * @return string Markup.
 */
function bl_search_form(array $args = []): string
{
	$defaults = [
		'placeholder' => __('Enter search term…', 'baselayer'),
		'label' => __('Search for:', 'baselayer'),
		'button' => __('Search', 'baselayer'),
		'value' => get_search_query(),
		'action' => bl_search_url(),
		'id' => 'fs-search',
		'class' => '',
		'autofocus' => false,
	];

	$args = wp_parse_args($args, $defaults);
	$args['value'] = is_string($args['value']) ? $args['value'] : '';
	$args['id'] = sanitize_html_class((string) $args['id']);
	if ($args['id'] === '') {
		$args['id'] = 'fs-search';
	}

	ob_start();
	bl_render_template('search-form', $args);
	$html = (string) ob_get_clean();

	/**
	 * @param string $html   Search form markup.
	 * @param array  $args   Arguments passed to {@see bl_search_form()}.
	 */
	return (string) apply_filters('bl_search_form_html', $html, $args);
}

/**
 * Echo {@see bl_search_form()}.
 *
 * @param array<string, mixed> $args
 */
function bl_the_search_form(array $args = []): void
{
	echo bl_search_form($args); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in template.
}

add_filter('get_search_form', function (string $form, array $args): string {
	return bl_search_form($args);
}, 10, 2);

/**
 * Accept `?q=` as an alias for `?s=` (common in site search UIs).
 */
add_action('parse_request', function (\WP $wp): void {
	if (is_admin()) {
		return;
	}
	if (!empty($wp->query_vars['s']) || empty($_GET['q'])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return;
	}
	$q = sanitize_text_field(wp_unslash((string) $_GET['q'])); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ($q === '') {
		return;
	}
	$wp->query_vars['s'] = $q;
}, 5);

/**
 * Hidden modal source + header trigger markup (footer).
 */
function bl_search_modal_markup(): void
{
	?>
	<div class="search-modal__source" hidden>
		<div data-modal-content="search">
			<?php bl_the_search_form([
				'id' => 'fs-search-modal',
				'autofocus' => true,
				'class' => 'search-modal__form',
			]); ?>
			<button
				class="search-modal__close-button"
				data-modal-close="search"
				aria-label="<?php esc_html_e('Cancel search', 'baselayer'); ?>"
			>
				<?php esc_html_e('Cancel', 'baselayer'); ?>
			</button>
		</div>
	</div>
	<?php
}

add_action('wp_footer', 'bl_search_modal_markup', 5);
