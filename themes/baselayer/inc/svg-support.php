<?php

/**
 * Safe SVG support for WordPress (all users).
 * Allows SVG uploads + sanitizes on upload.
 */

defined('ABSPATH') || exit;

/**
 * Allow SVG MIME type
 */
add_filter('upload_mimes', function ($mimes) {
	$mimes['svg']  = 'image/svg+xml';
	$mimes['svgz'] = 'image/svg+xml';
	return $mimes;
});

/**
 * Fix SVG preview in Media Library
 */
add_action('admin_head', function () {
	echo '<style>
		.attachment-preview.subtype-svg\+xml img {
			width: calc(100% - 16px) !important;
			height: calc(100% - 16px) !important;
		}

		table.media .column-title .media-icon img {
			border-radius: 4px;
		}

		table.media .column-title .media-icon img[src$=".svg"],
		table.media .column-title .media-icon img[src*=".svg?"] {
			width: 52px;
			height: 52px;
			padding: 4px;
		}
	</style>';
});

/**
 * Sanitize SVG on upload (DOM-based)
 */
add_filter('wp_handle_upload_prefilter', function ($file) {
	if (
		!isset($file['type'], $file['tmp_name']) ||
		$file['type'] !== 'image/svg+xml'
	) {
		return $file;
	}

	$max_size = bl_config('svg_max_size') ?? 2;

	$size = isset($file['size']) ? (int) $file['size'] : 0;
	if ($size <= 0 || $size / 1024 / 1024 > $max_size) {
		$max_size_formatted = $max_size . ' MB';
		$size_formatted = number_format($size / 1024 / 1024, 2) . ' MB';
		$file['error'] = sprintf(
			__('SVG file must be under %1$s. You tried to upload a file of %2$s.', 'baselayer'),
			$max_size_formatted,
			$size_formatted
		);
		return $file;
	}

	$svg = file_get_contents($file['tmp_name']);
	if (!$svg) {
		$file['error'] = __('SVG file not found.', 'baselayer');
		return $file;
	}

	$sanitized = bl_svg_sanitize($svg);

	if ($sanitized === '') {
		$file['error'] = __('Invalid or unsafe SVG file.', 'baselayer');
		return $file;
	}

	file_put_contents($file['tmp_name'], $sanitized);

	return $file;
});

/**
 * CSS properties we expand into SVG presentation attributes (best-effort).
 *
 * @return array<string, string> CSS property (lowercase) => SVG attribute name
 */
function bl_svg_style_to_attribute_map(): array
{
	return [
		'fill' => 'fill',
		'fill-opacity' => 'fill-opacity',
		'fill-rule' => 'fill-rule',
		'stroke' => 'stroke',
		'stroke-opacity' => 'stroke-opacity',
		'stroke-width' => 'stroke-width',
		'stroke-linecap' => 'stroke-linecap',
		'stroke-linejoin' => 'stroke-linejoin',
		'stroke-miterlimit' => 'stroke-miterlimit',
		'stroke-dasharray' => 'stroke-dasharray',
		'stroke-dashoffset' => 'stroke-dashoffset',
		'opacity' => 'opacity',
		'stop-color' => 'stop-color',
		'stop-opacity' => 'stop-opacity',
		'font-size' => 'font-size',
		'font-family' => 'font-family',
		'font-weight' => 'font-weight',
		'text-anchor' => 'text-anchor',
	];
}

/**
 * Whether a CSS value is safe to copy onto an SVG presentation attribute.
 */
function bl_svg_is_safe_style_value(string $property, string $value): bool
{
	$value = trim($value);
	if ($value === '' || strlen($value) > 200) {
		return false;
	}

	// No expressions, imports, or quoting tricks.
	if (preg_match('/[<>{}]|expression\s*\(|@import|javascript:/i', $value)) {
		return false;
	}

	// External / data URLs disallowed; fragment urls (#id) OK for gradients.
	if (preg_match('/url\s*\(\s*(?!#)[^)]+\)/i', $value)) {
		return false;
	}

	$keywords = ['none', 'currentcolor', 'transparent', 'inherit'];
	$lower = strtolower($value);
	if (in_array($lower, $keywords, true)) {
		return true;
	}

	switch ($property) {
		case 'fill':
		case 'stroke':
		case 'stop-color':
			return (bool) preg_match(
				'/^(?:#[0-9a-f]{3,8}|rgb\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)|rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)|hsl\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)|url\(\s*#[A-Za-z][\w:.-]*\s*\))$/i',
				$value
			);

		case 'fill-opacity':
		case 'stroke-opacity':
		case 'stop-opacity':
		case 'opacity':
			return (bool) preg_match('/^(?:0|1|0?\.\d+|\d{1,3}%)$/', $value);

		case 'stroke-width':
		case 'stroke-miterlimit':
		case 'stroke-dashoffset':
		case 'font-size':
			return (bool) preg_match('/^[\d.]+(?:px|pt|em|ex|%)?$/i', $value);

		case 'stroke-dasharray':
			// SVG/CSS allow space- or comma-separated lengths (e.g. "10 6" or "10, 6").
			return (bool) preg_match('/^(?:none|[\d.]+(?:px|pt|em|ex|%)?(?:(?:\s*,\s*|\s+)[\d.]+(?:px|pt|em|ex|%)?)*)$/i', $value);

		case 'fill-rule':
			return in_array($lower, ['nonzero', 'evenodd'], true);

		case 'stroke-linecap':
			return in_array($lower, ['butt', 'round', 'square'], true);

		case 'stroke-linejoin':
			return in_array($lower, ['miter', 'round', 'bevel'], true);

		case 'text-anchor':
			return in_array($lower, ['start', 'middle', 'end'], true);

		case 'font-weight':
			return (bool) preg_match('/^(?:normal|bold|bolder|lighter|[1-9]00)$/i', $value);

		case 'font-family':
			// Simple family list without quotes/urls.
			return (bool) preg_match('/^[A-Za-z][\w\s,-]*$/', $value);

		default:
			return false;
	}
}

/**
 * Parse simple `.class { prop: value; }` rules from SVG stylesheet text.
 *
 * Ignores nested selectors, @rules, tag/id selectors, and unknown properties.
 *
 * @return list<array{classes: list<string>, declarations: array<string, string>}>
 */
function bl_svg_parse_simple_class_rules(string $css): array
{
	$css = preg_replace('/\/\*.*?\*\//s', '', $css) ?? $css;
	// Drop @rules blocks / lines we cannot handle.
	$css = preg_replace('/@[^{;]+;/', '', $css) ?? $css;
	$css = preg_replace('/@[^{]+\{[^{}]*\}/', '', $css) ?? $css;

	$rules = [];
	if (!preg_match_all('/([^{}]+)\{([^{}]*)\}/', $css, $matches, PREG_SET_ORDER)) {
		return $rules;
	}

	$map = bl_svg_style_to_attribute_map();

	foreach ($matches as $match) {
		$selector = trim($match[1]);
		$body = trim($match[2]);
		if ($selector === '' || $body === '') {
			continue;
		}

		// Only plain class selectors: .a or .a.b (no combinators, tags, ids, pseudos).
		if (!preg_match('/^\.(?:[A-Za-z_][\w-]*)(?:\.[A-Za-z_][\w-]*)*$/', $selector)) {
			continue;
		}

		$classes = [];
		foreach (explode('.', ltrim($selector, '.')) as $class) {
			$class = trim($class);
			if ($class !== '') {
				$classes[] = $class;
			}
		}
		if ($classes === []) {
			continue;
		}

		$declarations = [];
		foreach (explode(';', $body) as $chunk) {
			$chunk = trim($chunk);
			if ($chunk === '' || strpos($chunk, ':') === false) {
				continue;
			}
			[$prop, $value] = array_map('trim', explode(':', $chunk, 2));
			$prop = strtolower($prop);
			if (!isset($map[$prop])) {
				continue;
			}
			if (!bl_svg_is_safe_style_value($prop, $value)) {
				continue;
			}
			$declarations[$map[$prop]] = $value;
		}

		if ($declarations !== []) {
			$rules[] = [
				'classes' => $classes,
				'declarations' => $declarations,
			];
		}
	}

	return $rules;
}

/**
 * Expand simple class-based <style> rules into presentation attributes, then drop <style>.
 *
 * Best-effort for Illustrator/Figma-style SVGs; complex CSS is ignored (styles still removed by sanitize).
 *
 * @param string $svg Raw SVG markup.
 * @return string SVG with attributes applied where possible (unchanged markup on parse failure).
 */
function bl_svg_expand_style_classes(string $svg): string
{
	if ($svg === '' || stripos($svg, '<style') === false) {
		return $svg;
	}

	libxml_use_internal_errors(true);

	$dom = new DOMDocument();
	if (!$dom->loadXML($svg, LIBXML_NONET | LIBXML_COMPACT)) {
		return $svg;
	}

	$root = $dom->documentElement;
	if (!$root || strtolower($root->tagName) !== 'svg') {
		return $svg;
	}

	$xpath = new DOMXPath($dom);
	$style_nodes = [];
	foreach ($xpath->query('//*[local-name()="style"]') as $node) {
		if ($node instanceof DOMElement) {
			$style_nodes[] = $node;
		}
	}

	if ($style_nodes === []) {
		return $svg;
	}

	$css = '';
	foreach ($style_nodes as $style_node) {
		$css .= $style_node->textContent . "\n";
	}

	$rules = bl_svg_parse_simple_class_rules($css);
	if ($rules !== []) {
		foreach ($xpath->query('//*[@class]') as $el) {
			if (!($el instanceof DOMElement)) {
				continue;
			}
			$class_attr = trim($el->getAttribute('class'));
			if ($class_attr === '') {
				continue;
			}
			$el_classes = preg_split('/\s+/', $class_attr) ?: [];
			$el_class_set = array_fill_keys($el_classes, true);

			foreach ($rules as $rule) {
				$matches = true;
				foreach ($rule['classes'] as $needed) {
					if (!isset($el_class_set[$needed])) {
						$matches = false;
						break;
					}
				}
				if (!$matches) {
					continue;
				}
				foreach ($rule['declarations'] as $attr => $value) {
					// Do not override existing presentation attributes on the element.
					if ($el->hasAttribute($attr)) {
						continue;
					}
					$el->setAttribute($attr, $value);
				}
			}
		}
	}

	foreach ($style_nodes as $style_node) {
		if ($style_node->parentNode) {
			$style_node->parentNode->removeChild($style_node);
		}
	}

	$out = $dom->saveXML($dom->documentElement);
	return is_string($out) ? $out : $svg;
}

/**
 * Sanitize SVG markup: strip scripts, event handlers, and disallowed elements/attributes.
 *
 * @param string $svg Raw SVG string (e.g. file contents).
 * @return string Sanitized SVG or empty string on parse failure.
 */
function bl_svg_sanitize(string $svg): string
{
	libxml_use_internal_errors(true);

	// Remove XML/DOCTYPE/comments first
	$svg = preg_replace('/<\?xml.*?\?>/i', '', $svg);
	$svg = preg_replace('/<!DOCTYPE.*?>/i', '', $svg);
	$svg = preg_replace('/<!--.*?-->/s', '', $svg);

	// Expand simple class styles to attributes before <style> is stripped.
	$svg = bl_svg_expand_style_classes($svg);

	$dom = new DOMDocument();
	if (!$dom->loadXML($svg, LIBXML_NONET | LIBXML_COMPACT)) {
		return '';
	}

	$svgEl = $dom->documentElement;
	if (!$svgEl || strtolower($svgEl->tagName) !== 'svg') {
		return '';
	}

	// Allowed tags (safe subset: no script, foreignObject, image, use)
	$allowed_tags = [
		// Structure
		'svg',
		'g',
		'defs',
		'symbol',
		// Shapes & path
		'path',
		'rect',
		'circle',
		'ellipse',
		'line',
		'polyline',
		'polygon',
		// Text
		'text',
		'tspan',
		'textpath',
		// Clipping & masking
		'clippath',
		'mask',
		'pattern',
		'marker',
		// Gradients
		'lineargradient',
		'radialgradient',
		'stop',
		// A11y & metadata
		'title',
		'desc',
		// Removed
		// 'switch', // Increases complexity and can cause memory issues
		// 'metadata', // Can get heavy and cause memory issues
		// 'animate', // Rarely needed, can cause memory issues
		// 'animatetransform', // Rarely needed, can cause memory issues
		// 'animatemotion', // Rarely needed, can cause memory issues
		// 'set', // Rarely needed, can cause memory issues
	];

	// Allowed attributes (lowercase; safe SVG presentation + geometry)
	$allowed_attrs = [
		// Structure & identity
		'xmlns',
		'viewbox',
		'width',
		'height',
		'preserveaspectratio',
		'class',
		'id',
		// Path & shape geometry
		'd',
		'points',
		'cx',
		'cy',
		'r',
		'rx',
		'ry',
		'x',
		'y',
		'x1',
		'y1',
		'x2',
		'y2',
		// Fill & stroke
		'fill',
		'stroke',
		'fill-rule',
		'fill-opacity',
		'stroke-opacity',
		'stroke-width',
		'stroke-linecap',
		'stroke-linejoin',
		'stroke-miterlimit',
		'stroke-dasharray',
		'stroke-dashoffset',
		'opacity',
		// Transforms
		'transform',
		'gradienttransform',
		// Gradients
		'gradientunits',
		'spreadmethod',
		'offset',
		'stop-color',
		'stop-opacity',
		'fx',
		'fy',
		// Clipping & masking
		'clip-path',
		'clip-rule',
		'clippathunits',
		'mask',
		'maskunits',
		'maskcontentunits',
		'patternunits',
		'patterncontentunits',
		'patterntransform',
		'markerunits',
		'markerwidth',
		'markerheight',
		'refx',
		'refy',
		'orient',
		'marker-start',
		'marker-mid',
		'marker-end',
		// Text
		'font-size',
		'font-family',
		'font-weight',
		'text-anchor',
		'dx',
		'dy',
		// SMIL animation
		'attributeName',
		'attributeType',
		'begin',
		'dur',
		'end',
		'repeatCount',
		'from',
		'to',
		'values',
		'keyTimes',
		'keySplines',
		'calcMode',
		'type',
		'additive',
		'accumulate',
		'restart',
		'by',
		// A11y & misc
		'aria-hidden',
		'aria-label',
		'role',
		'focusable',
		'xml:space',
	];

	$xpath = new DOMXPath($dom);

	// Remove forbidden elements
	foreach ($xpath->query('//*') as $node) {
		if (!($node instanceof DOMElement)) {
			continue;
		}

		if (!in_array(strtolower($node->nodeName), $allowed_tags, true)) {
			$node->parentNode->removeChild($node);
			continue;
		}

		// Remove forbidden attributes
		if ($node->hasAttributes()) {
			foreach (iterator_to_array($node->attributes) as $attr) {
				$name  = strtolower($attr->name);
				$value = trim($attr->value);

				// Disallow event handlers
				if (strpos($name, 'on') === 0) {
					$node->removeAttribute($attr->name);
					continue;
				}

				// Disallow href/xlink entirely
				if ($name === 'href' || $name === 'xlink:href') {
					$node->removeAttribute($attr->name);
					continue;
				}

				// Disallow external / data URLs
				if (preg_match('/url\s*\(\s*(?!#)[^)]+\)/i', $value)) {
					$node->removeAttribute($attr->name);
					continue;
				}

				if (!in_array($name, $allowed_attrs, true)) {
					$node->removeAttribute($attr->name);
				}
			}
		}
	}

	return $dom->saveXML($dom->documentElement);
}

/**
 * Get width and height from the root <svg> (attributes or viewBox).
 *
 * @param string $file_path Path to SVG file.
 * @return array{width: int, height: int}|array{} Associative array with width/height, or empty on failure.
 */
function bl_svg_get_dimensions(string $file_path): array
{
	if (!is_readable($file_path) || strtolower(substr($file_path, -4)) !== '.svg') {
		return [];
	}
	$svg = @file_get_contents($file_path);
	if (!$svg) {
		return [];
	}
	libxml_use_internal_errors(true);
	$dom = new DOMDocument();
	if (!$dom->loadXML($svg, LIBXML_NONET | LIBXML_COMPACT)) {
		return [];
	}
	$root = $dom->documentElement;
	if (!$root || strtolower($root->tagName) !== 'svg') {
		return [];
	}
	$w = null;
	$h = null;
	$getNum = function ($val) {
		if ($val === null || $val === '') {
			return null;
		}
		$val = trim($val);
		if (preg_match('/^([0-9]+(?:\.[0-9]+)?)\s*(?:px|pt|em|ex)?\s*$/i', $val, $m)) {
			return (int) round((float) $m[1]);
		}
		if (is_numeric($val)) {
			return (int) round((float) $val);
		}
		return null;
	};
	if ($root->hasAttribute('width')) {
		$w = $getNum($root->getAttribute('width'));
	}
	if ($root->hasAttribute('height')) {
		$h = $getNum($root->getAttribute('height'));
	}
	if (($w === null || $h === null) && $root->hasAttribute('viewBox')) {
		$vb = preg_split('/\s+/', trim($root->getAttribute('viewBox')), 4);
		if (count($vb) >= 4 && is_numeric($vb[2]) && is_numeric($vb[3])) {
			if ($w === null) {
				$w = (int) round((float) $vb[2]);
			}
			if ($h === null) {
				$h = (int) round((float) $vb[3]);
			}
		}
	}
	if ($w !== null && $h !== null && $w > 0 && $h > 0) {
		return ['width' => $w, 'height' => $h];
	}
	return [];
}

/**
 * Set attachment width/height from <svg> so WordPress uses them in img and media UI.
 */
add_filter('wp_update_attachment_metadata', function ($data, $attachment_id) {
	$file = get_attached_file($attachment_id);
	if (!$file || !file_exists($file)) {
		return $data;
	}
	$mime = get_post_mime_type($attachment_id);
	if ($mime !== 'image/svg+xml') {
		return $data;
	}
	$has_size = !empty($data['width']) && !empty($data['height']) && (int) $data['width'] > 0 && (int) $data['height'] > 0;
	if ($has_size) {
		return $data;
	}
	$dim = bl_svg_get_dimensions($file);
	if ($dim !== []) {
		$data['width']  = $dim['width'];
		$data['height'] = $dim['height'];
	}
	return $data;
}, 10, 2);
