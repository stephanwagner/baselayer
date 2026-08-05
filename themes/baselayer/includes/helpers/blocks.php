<?php

defined('ABSPATH') || exit;

/**
 * Whether the current request is rendering a block for the editor canvas.
 */
function bl_is_block_editor_preview(): bool
{
	if (is_admin()) {
		return true;
	}

	if (function_exists('bl_blocks_is_editor_render') && bl_blocks_is_editor_render()) {
		return true;
	}

	return defined('REST_REQUEST') && REST_REQUEST;
}

/**
 * Editor-only placeholder for blocks without a visual design (anchor, GDPR map, …).
 *
 * Styled like the forms block placeholder. Pass already-escaped HTML.
 *
 * @param string $content Escaped HTML shown inside the preview chip.
 */
function bl_block_admin_preview_html(string $content): string
{
	return '<div class="bl-block-admin-preview admin-block-preview">'
		. '<span class="bl-block-admin-preview__text">' . $content . '</span>'
		. '</div>';
}
