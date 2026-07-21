<?php

defined('ABSPATH') || exit;

/**
 * Register the Form block (native dynamic block, no ACF dependency).
 */
function bl_forms_register_block(): void
{
	if (!function_exists('register_block_type')) {
		return;
	}

	$editor = bl_forms_resolve_asset('forms-block', 'js');
	if ($editor !== null) {
		wp_register_script(
			'bl-forms-block',
			$editor['uri'],
			['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'],
			$editor['ver'],
			true
		);

		$choices = bl_forms_published_choices();
		$options = [
			['label' => __('Select a form…', 'baselayer'), 'value' => '0'],
		];
		foreach ($choices as $id => $title) {
			$options[] = [
				'label' => $title,
				'value' => (string) $id,
			];
		}

		wp_localize_script('bl-forms-block', 'blFormsBlock', [
			'options' => $options,
		]);
	}

	register_block_type('baselayer/form', [
		'api_version'     => 2,
		'title'           => __('Form', 'baselayer'),
		'description'     => __('Place a form created under Forms.', 'baselayer'),
		'category'        => 'widgets',
		'icon'            => 'feedback',
		'keywords'        => ['form', 'contact', 'email'],
		'editor_script'   => $editor !== null ? 'bl-forms-block' : null,
		'render_callback' => 'bl_forms_block_render',
		'attributes'      => [
			'formId' => [
				'type'    => 'number',
				'default' => 0,
			],
		],
		'supports'        => [
			'html'   => false,
			'align'  => ['wide'],
			'anchor' => true,
		],
	]);
}
add_action('init', 'bl_forms_register_block');

/**
 * Server-side block render.
 *
 * @param array<string, mixed> $attributes
 * @param string               $content
 * @param WP_Block|null        $block
 */
function bl_forms_block_render(array $attributes = [], string $content = '', $block = null): string
{
	$form_id = isset($attributes['formId']) ? (int) $attributes['formId'] : 0;
	if ($form_id <= 0) {
		if (is_admin() || (defined('REST_REQUEST') && REST_REQUEST)) {
			return '<p class="bl-form-block-placeholder">' . esc_html__('Select a form in the block settings.', 'baselayer') . '</p>';
		}

		return '';
	}

	$wrapper_attributes = get_block_wrapper_attributes(['class' => 'bl-form']);
	$html = bl_forms_render($form_id, [
		'wrapper_attributes' => $wrapper_attributes,
	]);
	if ($html === '') {
		return is_admin() || (defined('REST_REQUEST') && REST_REQUEST)
			? '<p class="bl-form-block-placeholder">' . esc_html__('This form is unavailable.', 'baselayer') . '</p>'
			: '';
	}

	return $html;
}
