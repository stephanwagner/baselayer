<?php

defined('ABSPATH') || exit;

const BL_MEDIA_CLEANUP_TRANSIENT_TTL = HOUR_IN_SECONDS;
const BL_MEDIA_CLEANUP_CHUNK_SIZE = 400;

/**
 * Whether the current user may run Media Cleanup (same gate as Developer → Tools).
 */
function bl_media_cleanup_can_manage(): bool
{
	return current_user_can('manage_options')
		&& function_exists('bl_is_developer_user')
		&& bl_is_developer_user((int) get_current_user_id());
}

function bl_media_cleanup_state_key(): string
{
	return 'bl_media_cleanup_state_' . get_current_user_id();
}

/**
 * Absolute uploads basedir, or empty string on failure.
 */
function bl_media_cleanup_uploads_basedir(): string
{
	$uploads = wp_upload_dir();
	if (!empty($uploads['error']) || empty($uploads['basedir'])) {
		return '';
	}
	$basedir = wp_normalize_path((string) $uploads['basedir']);
	return untrailingslashit($basedir);
}

/**
 * Normalize a path to uploads-relative form with forward slashes.
 */
function bl_media_cleanup_normalize_relative(string $path): string
{
	$path = str_replace('\\', '/', $path);
	$path = ltrim($path, '/');
	return $path;
}

/**
 * Filenames ignored inside scanned media locations.
 */
function bl_media_cleanup_is_skipped_filename(string $filename): bool
{
	$skip = [
		'index.php' => true,
		'.htaccess' => true,
		'.ds_store' => true,
		'thumbs.db' => true,
	];
	return isset($skip[strtolower($filename)]);
}

/**
 * Build a set of uploads-relative paths referenced by attachment meta.
 *
 * @return array<string, true>
 */
function bl_media_cleanup_referenced_paths(): array
{
	global $wpdb;

	$paths = [];

	$attached = $wpdb->get_col(
		$wpdb->prepare(
			"SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value <> ''",
			'_wp_attached_file'
		)
	);
	foreach ((array) $attached as $rel) {
		$rel = bl_media_cleanup_normalize_relative((string) $rel);
		if ($rel !== '') {
			$paths[$rel] = true;
		}
	}

	$meta_rows = $wpdb->get_col(
		$wpdb->prepare(
			"SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value <> ''",
			'_wp_attachment_metadata'
		)
	);
	foreach ((array) $meta_rows as $serialized) {
		$data = maybe_unserialize($serialized);
		if (!is_array($data)) {
			continue;
		}

		$dir = '';
		if (!empty($data['file']) && is_string($data['file'])) {
			$file = bl_media_cleanup_normalize_relative($data['file']);
			if ($file !== '') {
				$paths[$file] = true;
				$dir = dirname($file);
				if ($dir === '.' || $dir === '') {
					$dir = '';
				}
			}
		}

		if (!empty($data['sizes']) && is_array($data['sizes'])) {
			foreach ($data['sizes'] as $size) {
				if (empty($size['file']) || !is_string($size['file'])) {
					continue;
				}
				$name = bl_media_cleanup_normalize_relative($size['file']);
				if ($name === '') {
					continue;
				}
				if (str_contains($name, '/')) {
					$paths[$name] = true;
				} else {
					$paths[bl_media_cleanup_normalize_relative(($dir !== '' ? $dir . '/' : '') . $name)] = true;
				}
			}
		}

		if (!empty($data['original_image'])) {
			$original = $data['original_image'];
			$orig_name = '';
			if (is_string($original)) {
				$orig_name = $original;
			} elseif (is_array($original) && !empty($original['file']) && is_string($original['file'])) {
				$orig_name = $original['file'];
			}
			$orig_name = bl_media_cleanup_normalize_relative($orig_name);
			if ($orig_name !== '') {
				if (str_contains($orig_name, '/')) {
					$paths[$orig_name] = true;
				} else {
					$paths[bl_media_cleanup_normalize_relative(($dir !== '' ? $dir . '/' : '') . $orig_name)] = true;
				}
			}
		}
	}

	return $paths;
}

/**
 * Collect uploads-relative file paths in WP media locations (root files + YYYY trees).
 *
 * @return list<string>
 */
function bl_media_cleanup_collect_candidate_paths(string $basedir): array
{
	$basedir = untrailingslashit(wp_normalize_path($basedir));
	if ($basedir === '' || !is_dir($basedir)) {
		return [];
	}

	$candidates = [];

	$root_entries = @scandir($basedir);
	if (!is_array($root_entries)) {
		return [];
	}

	foreach ($root_entries as $entry) {
		if ($entry === '.' || $entry === '..') {
			continue;
		}
		$absolute = $basedir . '/' . $entry;
		if (is_file($absolute)) {
			if (bl_media_cleanup_is_skipped_filename($entry)) {
				continue;
			}
			$candidates[] = bl_media_cleanup_normalize_relative($entry);
			continue;
		}
		if (!is_dir($absolute) || !preg_match('/^\d{4}$/', $entry)) {
			continue;
		}

		try {
			$dir_iterator = new RecursiveDirectoryIterator(
				$absolute,
				FilesystemIterator::SKIP_DOTS
			);
			$iterator = new RecursiveIteratorIterator($dir_iterator, RecursiveIteratorIterator::LEAVES_ONLY);
			foreach ($iterator as $file_info) {
				/** @var SplFileInfo $file_info */
				if (!$file_info->isFile()) {
					continue;
				}
				if (bl_media_cleanup_is_skipped_filename($file_info->getFilename())) {
					continue;
				}
				$path = wp_normalize_path($file_info->getPathname());
				if (!str_starts_with($path, $basedir . '/')) {
					continue;
				}
				$rel = bl_media_cleanup_normalize_relative(substr($path, strlen($basedir) + 1));
				if ($rel !== '') {
					$candidates[] = $rel;
				}
			}
		} catch (Exception $e) {
			continue;
		}
	}

	sort($candidates, SORT_STRING);
	return $candidates;
}

/**
 * @param array<string, true> $referenced
 * @return array{path: string, name: string, url: string, mime: string, is_image: bool, size: int, size_label: string, modified: int, modified_label: string}|null
 */
function bl_media_cleanup_orphan_payload(string $basedir, string $relative, array $referenced): ?array
{
	$relative = bl_media_cleanup_normalize_relative($relative);
	if ($relative === '' || isset($referenced[$relative])) {
		return null;
	}

	$absolute = $basedir . '/' . $relative;
	if (!is_file($absolute)) {
		return null;
	}

	$uploads = wp_upload_dir();
	$baseurl = !empty($uploads['baseurl']) ? untrailingslashit((string) $uploads['baseurl']) : '';
	$url = '';
	if ($baseurl !== '') {
		$segments = array_map('rawurlencode', explode('/', $relative));
		$url = $baseurl . '/' . implode('/', $segments);
	}

	$mime = (string) (wp_check_filetype($absolute)['type'] ?? '');
	if ($mime === '' && function_exists('mime_content_type')) {
		$detected = @mime_content_type($absolute);
		$mime = is_string($detected) ? $detected : '';
	}
	$is_image = $mime !== '' && str_starts_with($mime, 'image/');

	$size = (int) filesize($absolute);
	$mtime = (int) filemtime($absolute);
	$ago = $mtime > 0
		? sprintf(
			/* translators: %s: human-readable time difference, e.g. "18 months" */
			__('Modified %s ago', 'baselayer'),
			human_time_diff($mtime)
		)
		: '';

	return [
		'path' => $relative,
		'name' => basename($relative),
		'url' => $url,
		'mime' => $mime,
		'is_image' => $is_image,
		'size' => $size,
		'size_label' => (string) size_format($size),
		'modified' => $mtime,
		'modified_label' => $ago,
	];
}

/**
 * Resolve a relative uploads path to an absolute path under basedir, or empty on failure.
 */
function bl_media_cleanup_resolve_safe_path(string $basedir, string $relative): string
{
	$relative = bl_media_cleanup_normalize_relative($relative);
	if ($relative === '' || str_contains($relative, '..')) {
		return '';
	}

	$basedir = untrailingslashit(wp_normalize_path($basedir));
	$absolute = wp_normalize_path($basedir . '/' . $relative);
	if (!str_starts_with($absolute, $basedir . '/') && $absolute !== $basedir) {
		return '';
	}

	$real_base = realpath($basedir);
	if ($real_base === false) {
		return '';
	}
	$real_base = untrailingslashit(wp_normalize_path($real_base));

	if (!file_exists($absolute)) {
		return '';
	}
	$real_file = realpath($absolute);
	if ($real_file === false) {
		return '';
	}
	$real_file = wp_normalize_path($real_file);
	if ($real_file !== $real_base && !str_starts_with($real_file, $real_base . '/')) {
		return '';
	}
	if (!is_file($real_file)) {
		return '';
	}

	return $real_file;
}

/**
 * Run one scan chunk. Empty token starts a new scan.
 *
 * @return array{done: bool, checked: int, orphan_count: int, orphans: list<array>, token: string, message?: string}
 */
function bl_media_cleanup_scan_chunk(string $token = ''): array
{
	$basedir = bl_media_cleanup_uploads_basedir();
	if ($basedir === '') {
		return [
			'done' => true,
			'checked' => 0,
			'orphan_count' => 0,
			'orphans' => [],
			'token' => '',
			'message' => __('Uploads directory is not available.', 'baselayer'),
		];
	}

	$key = bl_media_cleanup_state_key();
	$state = null;

	if ($token !== '') {
		$stored = get_transient($key);
		if (is_array($stored) && isset($stored['token']) && hash_equals((string) $stored['token'], $token)) {
			$state = $stored;
		}
	}

	if ($state === null) {
		$token = wp_generate_password(20, false);
		$state = [
			'token' => $token,
			'referenced' => bl_media_cleanup_referenced_paths(),
			'candidates' => bl_media_cleanup_collect_candidate_paths($basedir),
			'cursor' => 0,
			'checked' => 0,
			'orphans' => [],
			'orphan_paths' => [],
		];
	}

	$referenced = is_array($state['referenced'] ?? null) ? $state['referenced'] : [];
	$candidates = is_array($state['candidates'] ?? null) ? $state['candidates'] : [];
	$cursor = (int) ($state['cursor'] ?? 0);
	$checked = (int) ($state['checked'] ?? 0);
	$orphans = is_array($state['orphans'] ?? null) ? $state['orphans'] : [];
	$orphan_paths = is_array($state['orphan_paths'] ?? null) ? $state['orphan_paths'] : [];

	$total = count($candidates);
	$end = min($total, $cursor + BL_MEDIA_CLEANUP_CHUNK_SIZE);

	for ($i = $cursor; $i < $end; $i++) {
		$rel = isset($candidates[$i]) ? (string) $candidates[$i] : '';
		$checked++;
		if ($rel === '') {
			continue;
		}
		$payload = bl_media_cleanup_orphan_payload($basedir, $rel, $referenced);
		if ($payload === null) {
			continue;
		}
		$orphans[] = $payload;
		$orphan_paths[$payload['path']] = true;
	}

	$done = $end >= $total;
	$state['cursor'] = $end;
	$state['checked'] = $checked;
	$state['orphans'] = $orphans;
	$state['orphan_paths'] = $orphan_paths;
	if ($done) {
		// Keep only what delete needs after the scan finishes.
		unset($state['referenced'], $state['candidates']);
	}
	set_transient($key, $state, BL_MEDIA_CLEANUP_TRANSIENT_TTL);

	return [
		'done' => $done,
		'checked' => $checked,
		'orphan_count' => count($orphans),
		'orphans' => $done ? $orphans : [],
		'token' => (string) $state['token'],
	];
}

/**
 * Delete selected orphan paths from the last completed scan.
 *
 * @param list<string> $paths
 * @return array{deleted: int, bytes: int, remaining: list<array>, orphan_count: int, message?: string}
 */
function bl_media_cleanup_delete_paths(array $paths): array
{
	$basedir = bl_media_cleanup_uploads_basedir();
	$key = bl_media_cleanup_state_key();
	$state = get_transient($key);

	if ($basedir === '' || !is_array($state) || empty($state['orphan_paths']) || !is_array($state['orphan_paths'])) {
		return [
			'deleted' => 0,
			'bytes' => 0,
			'remaining' => [],
			'orphan_count' => 0,
			'message' => __('Scan results expired. Please scan again.', 'baselayer'),
		];
	}

	$allowed = $state['orphan_paths'];
	$deleted = 0;
	$bytes = 0;
	$deleted_set = [];

	foreach ($paths as $path) {
		$rel = bl_media_cleanup_normalize_relative((string) $path);
		if ($rel === '' || empty($allowed[$rel])) {
			continue;
		}
		$absolute = bl_media_cleanup_resolve_safe_path($basedir, $rel);
		if ($absolute === '') {
			continue;
		}
		$size = is_file($absolute) ? (int) filesize($absolute) : 0;
		wp_delete_file($absolute);
		if (!file_exists($absolute)) {
			$deleted++;
			$bytes += $size;
			$deleted_set[$rel] = true;
			unset($allowed[$rel]);
		}
	}

	$remaining = [];
	if (!empty($state['orphans']) && is_array($state['orphans'])) {
		foreach ($state['orphans'] as $orphan) {
			if (!is_array($orphan) || empty($orphan['path'])) {
				continue;
			}
			$path = (string) $orphan['path'];
			if (isset($deleted_set[$path])) {
				continue;
			}
			$remaining[] = $orphan;
		}
	}

	$state['orphan_paths'] = $allowed;
	$state['orphans'] = $remaining;
	$state['checked'] = (int) ($state['checked'] ?? 0);
	set_transient($key, $state, BL_MEDIA_CLEANUP_TRANSIENT_TTL);

	return [
		'deleted' => $deleted,
		'bytes' => $bytes,
		'remaining' => $remaining,
		'orphan_count' => count($remaining),
		'checked' => (int) ($state['checked'] ?? 0),
	];
}

add_action('wp_ajax_bl_media_cleanup_scan', function (): void {
	if (!bl_media_cleanup_can_manage()) {
		wp_send_json_error(['message' => __('You do not have permission to run Media Cleanup.', 'baselayer')], 403);
	}
	check_ajax_referer('bl_media_cleanup', 'nonce');

	$token = isset($_POST['token']) ? sanitize_text_field(wp_unslash((string) $_POST['token'])) : '';
	$result = bl_media_cleanup_scan_chunk($token);
	if (!empty($result['message']) && $result['done'] && $result['checked'] === 0 && $result['orphan_count'] === 0 && $result['token'] === '') {
		wp_send_json_error(['message' => $result['message']], 500);
	}
	wp_send_json_success($result);
});

add_action('wp_ajax_bl_media_cleanup_delete', function (): void {
	if (!bl_media_cleanup_can_manage()) {
		wp_send_json_error(['message' => __('You do not have permission to run Media Cleanup.', 'baselayer')], 403);
	}
	check_ajax_referer('bl_media_cleanup', 'nonce');

	$raw = isset($_POST['paths']) ? wp_unslash($_POST['paths']) : [];
	if (is_string($raw)) {
		$decoded = json_decode($raw, true);
		$raw = is_array($decoded) ? $decoded : [];
	}
	if (!is_array($raw)) {
		$raw = [];
	}
	$paths = array_values(array_filter(array_map('strval', $raw)));

	$result = bl_media_cleanup_delete_paths($paths);
	if (!empty($result['message']) && $result['deleted'] === 0) {
		wp_send_json_error(['message' => $result['message']], 400);
	}
	wp_send_json_success($result);
});
