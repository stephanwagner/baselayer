<?php

defined('ABSPATH') || exit;

/**
 * @return list<string>
 */
function bl_blocks_allowed_statuses(): array
{
	return ['draft', 'publish', 'trash'];
}

/**
 * Hydrate a DB row into a typed block record.
 *
 * @param object|array<string, mixed>|null $row
 * @return array{id: int, slug: string, title: string, status: string, definition: array<string, mixed>, created_at: string, updated_at: string}|null
 */
function bl_blocks_hydrate_row($row): ?array
{
	if (is_array($row)) {
		$row = (object) $row;
	}
	if (!is_object($row) || empty($row->id)) {
		return null;
	}

	$definition = [];
	if (isset($row->definition) && is_string($row->definition) && $row->definition !== '') {
		$decoded = json_decode($row->definition, true);
		$definition = is_array($decoded) ? $decoded : [];
	}

	$status = sanitize_key((string) ($row->status ?? 'draft'));
	if (!in_array($status, bl_blocks_allowed_statuses(), true)) {
		$status = 'draft';
	}

	return [
		'id' => (int) $row->id,
		'slug' => sanitize_key((string) ($row->slug ?? '')),
		'title' => sanitize_text_field((string) ($row->title ?? '')),
		'status' => $status,
		'definition' => bl_blocks_sanitize_definition($definition),
		'created_at' => (string) ($row->created_at ?? ''),
		'updated_at' => (string) ($row->updated_at ?? ''),
	];
}

/**
 * @return array{id: int, slug: string, title: string, status: string, definition: array<string, mixed>, created_at: string, updated_at: string}|null
 */
function bl_blocks_get(int $id): ?array
{
	global $wpdb;

	if ($id <= 0) {
		return null;
	}

	$table = bl_blocks_table_name();
	$row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE id = %d", $id));

	return bl_blocks_hydrate_row($row);
}

/**
 * @return array{id: int, slug: string, title: string, status: string, definition: array<string, mixed>, created_at: string, updated_at: string}|null
 */
function bl_blocks_get_by_slug(string $slug): ?array
{
	global $wpdb;

	$slug = sanitize_key($slug);
	if ($slug === '') {
		return null;
	}

	$table = bl_blocks_table_name();
	$row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE slug = %s", $slug));

	return bl_blocks_hydrate_row($row);
}

/**
 * List blocks (excludes trash by default).
 *
 * @return list<array{id: int, slug: string, title: string, status: string, definition: array<string, mixed>, created_at: string, updated_at: string}>
 */
function bl_blocks_list(): array
{
	global $wpdb;

	$table = bl_blocks_table_name();
	// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is internal.
	$rows = $wpdb->get_results(
		$wpdb->prepare("SELECT * FROM {$table} WHERE status != %s ORDER BY title ASC, id ASC", 'trash')
	);

	$out = [];
	if (!is_array($rows)) {
		return $out;
	}
	foreach ($rows as $row) {
		$hydrated = bl_blocks_hydrate_row($row);
		if ($hydrated !== null) {
			$out[] = $hydrated;
		}
	}

	return $out;
}

/**
 * Unique slug from title; append -2, -3, … on collision (skipping $exclude_id).
 */
function bl_blocks_unique_slug(string $title, int $exclude_id = 0): string
{
	$base = sanitize_key(sanitize_title($title));
	if ($base === '') {
		$base = 'block';
	}

	$slug = $base;
	$n = 2;
	while (true) {
		$existing = bl_blocks_get_by_slug($slug);
		if ($existing === null || (int) $existing['id'] === $exclude_id) {
			return $slug;
		}
		$slug = $base . '-' . $n;
		$n++;
		if ($n > 1000) {
			return $base . '-' . wp_generate_password(6, false, false);
		}
	}
}

/**
 * Insert or update a block.
 *
 * @param array{id?: int, title: string, slug?: string, status?: string, definition?: mixed} $data
 * @return int|\WP_Error
 */
function bl_blocks_save(array $data)
{
	global $wpdb;

	$id = isset($data['id']) ? (int) $data['id'] : 0;
	$title = sanitize_text_field((string) ($data['title'] ?? ''));
	if ($title === '') {
		return new \WP_Error('bl_blocks_title', __('Title is required.', 'baselayer-blocks'));
	}

	// This slice always stores draft; keep status column ready for later.
	$status = 'draft';
	if (isset($data['status'])) {
		$requested = sanitize_key((string) $data['status']);
		if (in_array($requested, bl_blocks_allowed_statuses(), true)) {
			$status = $requested;
		}
	}

	$existing = $id > 0 ? bl_blocks_get($id) : null;
	if ($id > 0 && $existing === null) {
		return new \WP_Error('bl_blocks_missing', __('Block not found.', 'baselayer-blocks'));
	}

	// Keep slug stable on update unless explicitly provided; new rows derive from title.
	if ($existing !== null && $existing['slug'] !== '' && empty($data['slug'])) {
		$slug = $existing['slug'];
	} elseif (!empty($data['slug'])) {
		$slug = bl_blocks_unique_slug((string) $data['slug'], $id);
	} else {
		$slug = bl_blocks_unique_slug($title, $id);
	}

	$definition = bl_blocks_sanitize_definition($data['definition'] ?? ($existing['definition'] ?? []));
	$definition_json = (string) wp_json_encode($definition, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
	$now = gmdate('Y-m-d H:i:s');
	$table = bl_blocks_table_name();

	if ($id > 0) {
		$updated = $wpdb->update(
			$table,
			[
				'slug' => $slug,
				'title' => $title,
				'status' => $status,
				'definition' => $definition_json,
				'updated_at' => $now,
			],
			['id' => $id],
			['%s', '%s', '%s', '%s', '%s'],
			['%d']
		);
		if ($updated === false) {
			return new \WP_Error('bl_blocks_db', __('Could not update block.', 'baselayer-blocks'));
		}

		return $id;
	}

	$inserted = $wpdb->insert(
		$table,
		[
			'slug' => $slug,
			'title' => $title,
			'status' => $status,
			'definition' => $definition_json,
			'created_at' => $now,
			'updated_at' => $now,
		],
		['%s', '%s', '%s', '%s', '%s', '%s']
	);
	if ($inserted === false || !$wpdb->insert_id) {
		return new \WP_Error('bl_blocks_db', __('Could not create block.', 'baselayer-blocks'));
	}

	return (int) $wpdb->insert_id;
}
