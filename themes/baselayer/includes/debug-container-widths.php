<?php

defined('ABSPATH') || exit;

/**
 * Container/bleed width guides (front-end only).
 *
 * Loaded only when enabled in wp-config.php:
 *   define('DEBUG_CONTAINER_WIDTHS', true);
 */

add_filter('body_class', function (array $classes): array {
	if (is_admin()) {
		return $classes;
	}

	$classes[] = 'bl-debug-container-widths';

	return $classes;
});

add_action('wp_head', function (): void {
	if (is_admin()) {
		return;
	}
	?>
<style id="bl-debug-container-widths">
body.bl-debug-container-widths {
	--bl-debug-content-inset: max(
		var(--bl-page-padding),
		calc((100vw - var(--bl-content-width)) * 0.5)
	);
	--bl-debug-cw-bleed: min(
		var(--bl-container-wide-bleed),
		max(0px, calc(var(--bl-debug-content-inset) - var(--bl-page-padding)))
	);
	--bl-debug-aw-bleed: min(
		var(--bl-alignwide-bleed),
		max(0px, calc(var(--bl-debug-content-inset) - var(--bl-container-edge-spacing)))
	);
	/* Stack both one-side bleeds (matches _containers.scss). */
	--bl-debug-aw-cw-bleed: min(
		calc(var(--bl-debug-cw-bleed) + var(--bl-alignwide-bleed)),
		max(0px, calc(var(--bl-debug-content-inset) - var(--bl-container-edge-spacing)))
	);
	--bl-debug-label-top: calc(var(--bl-admin-bar-height, 0px) + 12px);
}
.bl-debug-container-widths__overlay {
	position: fixed;
	inset: 0;
	z-index: 2147483000;
	pointer-events: none;
	overflow: hidden;
}
.bl-debug-container-widths__line {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 0;
}
.bl-debug-container-widths__line::before {
	content: "";
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	border-left: 1px solid var(--bl-debug-line-color);
	opacity: 0.5;
}
.bl-debug-container-widths__line.-content { --bl-debug-line-color: #2563eb; z-index: 1; }
.bl-debug-container-widths__line.-alignwide { --bl-debug-line-color: #0d9488; z-index: 2; }
.bl-debug-container-widths__line.-container-wide { --bl-debug-line-color: #ea580c; z-index: 3; }
.bl-debug-container-widths__line.-alignwide-container-wide { --bl-debug-line-color: #c026d3; z-index: 4; }
.bl-debug-container-widths__line.-content.-left {
	left: var(--bl-debug-content-inset);
}
.bl-debug-container-widths__line.-content.-right {
	left: calc(100vw - var(--bl-debug-content-inset));
}
.bl-debug-container-widths__line.-container-wide.-left {
	left: calc(var(--bl-debug-content-inset) - var(--bl-debug-cw-bleed));
}
.bl-debug-container-widths__line.-container-wide.-right {
	left: calc(100vw - var(--bl-debug-content-inset) + var(--bl-debug-cw-bleed));
}
.bl-debug-container-widths__line.-alignwide.-left {
	left: calc(var(--bl-debug-content-inset) - var(--bl-debug-aw-bleed));
}
.bl-debug-container-widths__line.-alignwide.-right {
	left: calc(100vw - var(--bl-debug-content-inset) + var(--bl-debug-aw-bleed));
}
.bl-debug-container-widths__line.-alignwide-container-wide.-left {
	left: calc(var(--bl-debug-content-inset) - var(--bl-debug-aw-cw-bleed));
}
.bl-debug-container-widths__line.-alignwide-container-wide.-right {
	left: calc(100vw - var(--bl-debug-content-inset) + var(--bl-debug-aw-cw-bleed));
}
/* Labels on left only — full opacity; guides stay at 0.5 */
.bl-debug-container-widths__label {
	position: absolute;
	left: 16px;
	padding: 3px 7px;
	border-radius: 3px;
	background: var(--bl-debug-line-color);
	color: #fff;
	font: 600 11px/1.2 system-ui, sans-serif;
	white-space: nowrap;
	opacity: 1;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.bl-debug-container-widths__label::before {
	content: "";
	position: absolute;
	left: -16px;
	top: 50%;
	width: 16px;
	height: 1px;
	background: var(--bl-debug-line-color);
	opacity: 1;
	transform: translateY(-50%);
}
.bl-debug-container-widths__label::after {
	content: "";
	position: absolute;
	left: -16px;
	top: 50%;
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: var(--bl-debug-line-color);
	opacity: 1;
	box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.85);
	transform: translate(-50%, -50%);
}
.bl-debug-container-widths__line.-alignwide-container-wide.-left .bl-debug-container-widths__label {
	top: var(--bl-debug-label-top);
}
.bl-debug-container-widths__line.-container-wide.-left .bl-debug-container-widths__label {
	top: calc(var(--bl-debug-label-top) + 26px);
}
.bl-debug-container-widths__line.-alignwide.-left .bl-debug-container-widths__label {
	top: calc(var(--bl-debug-label-top) + 52px);
}
.bl-debug-container-widths__line.-content.-left .bl-debug-container-widths__label {
	top: calc(var(--bl-debug-label-top) + 78px);
}
</style>
	<?php
}, 100);

add_action('wp_footer', function (): void {
	if (is_admin()) {
		return;
	}
	?>
	<div class="bl-debug-container-widths__overlay" aria-hidden="true">
		<span class="bl-debug-container-widths__line -alignwide-container-wide -left"><span class="bl-debug-container-widths__label">.alignwide.container-wide</span></span>
		<span class="bl-debug-container-widths__line -alignwide-container-wide -right"></span>
		<span class="bl-debug-container-widths__line -container-wide -left"><span class="bl-debug-container-widths__label">.container-wide</span></span>
		<span class="bl-debug-container-widths__line -container-wide -right"></span>
		<span class="bl-debug-container-widths__line -alignwide -left"><span class="bl-debug-container-widths__label">.alignwide</span></span>
		<span class="bl-debug-container-widths__line -alignwide -right"></span>
		<span class="bl-debug-container-widths__line -content -left"><span class="bl-debug-container-widths__label">.container</span></span>
		<span class="bl-debug-container-widths__line -content -right"></span>
	</div>
	<?php
}, 100);
