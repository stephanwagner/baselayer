<?php

defined('ABSPATH') || exit;

const FS_HTACCESS_MARKER_START = '# BEGIN FromScratch performance';
const FS_HTACCESS_MARKER_END = '# END FromScratch performance';

/** @deprecated Legacy markers overlapped with redirects block; kept for cleanup only. */
const FS_HTACCESS_MARKER_START_LEGACY = '# BEGIN FromScratch ';
const FS_HTACCESS_MARKER_END_LEGACY = '# END FromScratch';

/**
 * Build the recommended performance .htaccess block (with markers).
 */
function fs_build_htaccess_performance_block(): string
{
	$template = __DIR__ . '/install-htaccess.txt';
	if (!is_readable($template)) {
		return '';
	}

	return FS_HTACCESS_MARKER_START . "\n"
		. trim((string) file_get_contents($template)) . "\n"
		. FS_HTACCESS_MARKER_END . "\n";
}

/**
 * Remove a marked .htaccess block by exact start/end marker strings.
 */
function fs_remove_htaccess_marked_block(string $content, string $start_marker, string $end_marker): string
{
	$pattern = '/(?:^|(\r\n|\r|\n))' . preg_quote($start_marker, '/')
		. '.*?' . preg_quote($end_marker, '/') . '(?:\r?\n|$)/s';

	return (string) preg_replace($pattern, '$1', $content, 1);
}

/**
 * Remove legacy performance block without touching the redirects block.
 *
 * Old markers used "# BEGIN FromScratch " which is a prefix of "# BEGIN FromScratch redirects".
 */
function fs_remove_htaccess_legacy_performance_block(string $content): string
{
	$pattern = '/(?:^|(\r\n|\r|\n))# BEGIN FromScratch \r?\n.*?\r?\n# END FromScratch(?:\r?\n|$)(?! redirects)/s';

	return (string) preg_replace($pattern, '$1', $content, 1);
}

/**
 * Remove corruption left when legacy performance markers matched the redirects block.
 */
function fs_htaccess_cleanup_corruption(string $content): string
{
	return (string) preg_replace('/^ redirects\r?\n/m', '', $content);
}

/**
 * Write recommended .htaccess rules to WP root (Apache only).
 * Adds: MIME types, Cache-Control via mod_headers, Brotli/deflate, Vary Accept-Encoding.
 * Safe to call multiple times; replaces existing FromScratch block when present.
 *
 * @return bool True if block was written or already present, false if skipped (Nginx, unwritable, etc.)
 */
function fs_write_htaccess(): bool
{
	$htaccess = ABSPATH . '.htaccess';
	$block = fs_build_htaccess_performance_block();
	if ($block === '') {
		return false;
	}

	if (!file_exists($htaccess)) {
		if (!is_writable(ABSPATH)) {
			return false;
		}
		return file_put_contents($htaccess, $block, LOCK_EX) !== false;
	}

	$content = file_get_contents($htaccess);
	if ($content === false || !is_writable($htaccess)) {
		return false;
	}

	$content = fs_htaccess_cleanup_corruption($content);
	$content = fs_remove_htaccess_legacy_performance_block($content);
	$content = fs_remove_htaccess_marked_block($content, FS_HTACCESS_MARKER_START, FS_HTACCESS_MARKER_END);

	$content = rtrim($content) . "\n\n" . $block;
	$content = trim($content) . "\n";

	return file_put_contents($htaccess, $content, LOCK_EX) !== false;
}

/**
 * Return recommended .htaccess rules for display on the install page (without block markers).
 *
 * @return string Rule body or empty string if template missing.
 */
function fs_get_htaccess_config(): string
{
	$template = __DIR__ . '/install-htaccess.txt';
	if (!is_readable($template)) {
		return '';
	}

	return trim((string) file_get_contents($template));
}

/**
 * Return recommended nginx config snippet (for copy/paste into server block). Nginx config cannot be written from PHP.
 *
 * @return string Nginx config content or empty string if template missing.
 */
function fs_get_nginx_config(): string
{
	$template = __DIR__ . '/install-nginx.conf';
	if (!is_readable($template)) {
		return '';
	}
	return trim(file_get_contents($template));
}
