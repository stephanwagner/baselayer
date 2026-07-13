<?php

defined('ABSPATH') || exit;

$url = isset($url) ? (string) $url : '';
$label = isset($label) && is_string($label) ? $label : __('Read more', 'baselayer');
$class = isset($class) && is_string($class) ? $class : '';
$link_tag = isset($link_tag) && in_array($link_tag, ['a', 'button', 'div', 'span'], true)
	? $link_tag
	: ($url !== '' ? 'a' : 'span');

$icon = isset($icon) && is_string($icon) ? $icon : 'arrow-right';
$icon = function_exists('bl_sanitize_icon_slug') ? bl_sanitize_icon_slug($icon) : sanitize_key($icon);

if ($icon === '') {
	$icon = 'arrow-right';
}

$classes = ['read-more-link', '-icon-after', '-icon-' . $icon];
if ($class !== '') {
	$classes[] = $class;
}
?>
<<?= $link_tag ?>
	class="<?= esc_attr(implode(' ', $classes)) ?>"
	<?php if ($url !== '') { ?>
	href="<?= esc_url($url) ?>"
	<?php if (!empty($target)) { ?>
	target="<?= esc_attr($target) ?>"
	<?php } ?>
	<?php } ?>><?= esc_html($label) ?></<?= $link_tag ?>>