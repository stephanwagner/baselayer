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
	$style = bl_forms_resolve_asset('forms', 'css');

	$icon = 'feedback';
	$svg = bl_forms_svg_code('inbox-text-fill');
	if ($svg !== '') {
		$icon = $svg;
	}

	if ($style !== null) {
		wp_register_style(
			'bl-forms',
			$style['uri'],
			[],
			$style['ver']
		);
	}

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
			['label' => __('Select a form…', 'baselayer-forms'), 'value' => '0'],
		];
		foreach ($choices as $id => $title) {
			$options[] = [
				'label' => $title,
				'value' => (string) $id,
			];
		}

		wp_localize_script('bl-forms-block', 'blFormsBlock', [
			'options' => $options,
			'icon'    => $icon,
			'i18n'    => [
				'form'       => __('Form', 'baselayer-forms'),
				'selectForm' => __('Select a form in the block settings.', 'baselayer-forms'),
			],
		]);
	}

	register_block_type('baselayer/form', [
		'api_version'     => 3,
		'title'           => __('Form', 'baselayer-forms'),
		'description'     => __('Place a form created under Forms.', 'baselayer-forms'),
		'category'        => 'widgets',
		'icon'            => $icon,
		'keywords'        => ['form', 'contact', 'email'],
		'editor_script'   => $editor !== null ? 'bl-forms-block' : null,
		'editor_style'    => $style !== null ? 'bl-forms' : null,
		'style'           => $style !== null ? 'bl-forms' : null,
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
			return bl_forms_block_placeholder_html(__('Select a form in the block settings.', 'baselayer-forms'));
		}

		return '';
	}

	$wrapper_attributes = get_block_wrapper_attributes([
		'class' => 'bl-form bl-form--' . $form_id,
	]);
	$html = bl_forms_render($form_id, [
		'wrapper_attributes' => $wrapper_attributes,
	]);
	if ($html === '') {
		return is_admin() || (defined('REST_REQUEST') && REST_REQUEST)
			? bl_forms_block_placeholder_html(__('This form is unavailable.', 'baselayer-forms'))
			: '';
	}

	return $html;
}

/**
 * Editor/admin placeholder markup (icon + text).
 */
function bl_forms_block_placeholder_html(string $text): string
{
	$icon = bl_forms_svg_code('inbox-text-fill');
	$html = '<div class="bl-form-block-placeholder">';
	if ($icon !== '') {
		$html .= '<span class="bl-form-block-placeholder__icon" aria-hidden="true">' . $icon . '</span>';
	}
	$html .= '<span class="bl-form-block-placeholder__text">' . esc_html($text) . '</span>';
	$html .= '</div>';

	return $html;
}
