<?php

defined('ABSPATH') || exit;

/**
 * Inline SVG markup by logical key (form builder + menu icon).
 *
 * @param string                                                    $icon_name Logical key (e.g. text, trash, inbox-text-fill).
 * @param array<string, string|int|float|bool> $attributes Extra attributes merged onto the root <svg>.
 */
function bl_forms_svg_code(string $icon_name, array $attributes = []): string
{
	$icons = bl_forms_builder_icon_svgs();
	$svg = $icons[$icon_name] ?? '';
	if ($svg === '' || stripos($svg, '<svg') === false) {
		return '';
	}

	if ($attributes !== []) {
		$attr_html = '';
		foreach ($attributes as $name => $value) {
			$name = trim((string) $name);
			if ($name === '') {
				continue;
			}
			$attr_html .= ' ' . $name . '="' . esc_attr((string) $value) . '"';
		}
		if ($attr_html !== '') {
			$svg = (string) preg_replace('/<svg\b([^>]*)>/i', '<svg$1' . $attr_html . '>', $svg, 1);
		}
	}

	return $svg;
}

/**
 * Convert inline SVG to a data URI suitable for CPT menu_icon.
 */
function bl_forms_svg_to_menu_icon(string $svg): string
{
	$fill = '#f3f1f1';
	$svg = preg_replace('/\sfill="[^"]*"/i', ' fill="' . $fill . '"', $svg);
	if (is_string($svg) && stripos($svg, '<svg') !== false && stripos($svg, ' fill=') === false) {
		$svg = preg_replace('/<svg\b/i', '<svg fill="' . $fill . '"', $svg, 1);
	}
	if (!is_string($svg) || $svg === '') {
		return 'dashicons-feedback';
	}

	return 'data:image/svg+xml;base64,' . base64_encode($svg);
}
