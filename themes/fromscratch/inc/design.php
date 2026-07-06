<?php

defined('ABSPATH') || exit;

/**
 * SCSS read-only preview for Settings → Theme → CSS, and custom CSS from that tab on the front end.
 * Color/gradient/font-size/layout tokens live in config/theme-design.php (see theme-setup.php), not for PHP :root output.
 */

/**
 * Extract the first `:root { … }` block from SCSS/CSS source (brace matching; skips line and block comments).
 *
 * @param string $scss Raw file contents.
 * @return string Full block including `:root {` … `}`, or empty string.
 */
function fs_extract_scss_root_block(string $scss): string
{
	if (!preg_match('/:root\s*\{/', $scss, $m, PREG_OFFSET_CAPTURE)) {
		return '';
	}
	$start = (int) $m[0][1];
	$openBrace = strpos($scss, '{', $start);
	if ($openBrace === false) {
		return '';
	}
	$depth = 0;
	$len = strlen($scss);
	for ($i = $openBrace; $i < $len; $i++) {
		$c = $scss[$i];
		if ($c === '/' && ($i + 1) < $len && $scss[$i + 1] === '/') {
			$nl = strpos($scss, "\n", $i);
			$i = $nl !== false ? $nl : $len - 1;
			continue;
		}
		if ($c === '/' && ($i + 1) < $len && $scss[$i + 1] === '*') {
			$end = strpos($scss, '*/', $i + 2);
			if ($end === false) {
				break;
			}
			$i = $end + 1;
			continue;
		}
		if ($c === '{') {
			$depth++;
		} elseif ($c === '}') {
			$depth--;
			if ($depth === 0) {
				return substr($scss, $start, $i - $start + 1);
			}
		}
	}
	return '';
}

/**
 * Turn SCSS line-style comments (slash-slash) into CSS block comments for display (strings respected; asterisk-slash in comment text is neutralized).
 *
 * @param string $scss SCSS/CSS fragment.
 * @return string
 */
function fs_scss_line_comments_to_css_block(string $scss): string
{
	$len = strlen($scss);
	$out = '';
	$i = 0;
	while ($i < $len) {
		$c = $scss[$i];
		if ($c === "'") {
			$out .= $c;
			$i++;
			while ($i < $len) {
				$ch = $scss[$i];
				$out .= $ch;
				if ($ch === '\\' && $i + 1 < $len) {
					$i++;
					$out .= $scss[$i];
				} elseif ($ch === "'") {
					break;
				}
				$i++;
			}
			$i++;
			continue;
		}
		if ($c === '"') {
			$out .= $c;
			$i++;
			while ($i < $len) {
				$ch = $scss[$i];
				$out .= $ch;
				if ($ch === '\\' && $i + 1 < $len) {
					$i++;
					$out .= $scss[$i];
				} elseif ($ch === '"') {
					break;
				}
				$i++;
			}
			$i++;
			continue;
		}
		if ($c === '/' && ($i + 1) < $len && $scss[$i + 1] === '/') {
			$i += 2;
			$comment = '';
			while ($i < $len && $scss[$i] !== "\n" && $scss[$i] !== "\r") {
				$comment .= $scss[$i];
				$i++;
			}
			$comment = trim($comment);
			if ($comment !== '') {
				$comment = str_replace('*/', '* /', $comment);
				$out .= '/* ' . $comment . ' */';
			}
			if ($i < $len && $scss[$i] === "\r") {
				$out .= "\r";
				$i++;
			}
			if ($i < $len && $scss[$i] === "\n") {
				$out .= "\n";
				$i++;
			}
			continue;
		}
		$out .= $c;
		$i++;
	}
	return $out;
}

/**
 * Block editor layout sizes for theme.json from config/theme-design.php.
 *
 * @return array{contentSize: string, wideSize: string}
 */
function fs_theme_json_layout_sizes(): array
{
	$layout = fs_config('layout');
	if (!is_array($layout)) {
		$layout = [];
	}

	$content = (int) ($layout['editor_content_width'] ?? 840);
	$bleed = (int) ($layout['wide_bleed'] ?? 64);

	if ($content <= 0) {
		$content = 840;
	}
	if ($bleed < 0) {
		$bleed = 64;
	}

	$wide = $content + ($bleed * 2);
	if ($wide <= $content) {
		$wide = $content + ($bleed * 2);
	}

	return [
		'contentSize' => $content . 'px',
		'wideSize'    => $wide . 'px',
	];
}

/**
 * Root horizontal padding for theme.json (editor + alignfull-aware layout).
 *
 * @return array{useRootPaddingAwareAlignments: bool, padding: array{top: string, bottom: string, left: string, right: string}}
 */
function fs_theme_json_root_spacing(): array
{
	$layout = fs_config('layout');
	if (!is_array($layout)) {
		$layout = [];
	}

	$padding_x = (int) ($layout['editor_padding_x'] ?? 24);
	if ($padding_x < 0) {
		$padding_x = 24;
	}

	$px = $padding_x . 'px';

	return [
		'useRootPaddingAwareAlignments' => true,
		'padding'                       => [
			'top'    => '0',
			'bottom' => '0',
			'left'   => $px,
			'right'  => $px,
		],
	];
}

/**
 * Block editor color picker settings for theme.json from config/theme-design.php.
 *
 * @return array<string, bool>
 */
function fs_theme_json_color_settings(): array
{
	$options = fs_config('color_options');
	if (!is_array($options)) {
		$options = [];
	}

	return [
		'defaultPalette'   => array_key_exists('default_palette', $options) ? (bool) $options['default_palette'] : false,
		'defaultGradients' => array_key_exists('default_gradients', $options) ? (bool) $options['default_gradients'] : false,
		'defaultDuotone'   => array_key_exists('default_duotone', $options) ? (bool) $options['default_duotone'] : false,
		'custom'           => array_key_exists('custom', $options) ? (bool) $options['custom'] : true,
	];
}

/**
 * Contents of `src/scss/_variables.scss` — the `:root { … }` block only (readonly overview in Theme → CSS admin).
 *
 * @return string
 */
function fs_variables_scss_root_block(): string
{
	$path = get_template_directory() . '/src/scss/_variables.scss';
	if (!is_readable($path)) {
		return '';
	}
	$raw = file_get_contents($path);
	if (!is_string($raw) || $raw === '') {
		return '';
	}
	$block = fs_extract_scss_root_block($raw);
	if (!is_string($block) || $block === '') {
		return '';
	}
	$block = trim($block);
	return fs_scss_line_comments_to_css_block($block);
}

/**
 * Output custom CSS from Settings → Theme → CSS (compiled theme CSS remains in assets from SCSS).
 */
function fs_output_custom_css(): void
{
	$css = get_option('fromscratch_custom_css', '');
	if ($css === '') {
		return;
	}
	$css = wp_strip_all_tags($css);
	$css = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $css);
	$css = str_ireplace('</style>', '', $css);
	$css = preg_replace('/[\r\n]+/', ' ', $css);
	$css = preg_replace('/\s+/', ' ', $css);
	if (trim($css) === '') {
		return;
	}
	echo '<style id="fromscratch-custom-css">' . trim($css) . '</style>' . "\n";
}
