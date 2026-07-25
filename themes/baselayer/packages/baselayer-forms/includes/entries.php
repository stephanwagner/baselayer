<?php

defined('ABSPATH') || exit;

/**
 * Entries list columns: Form first, no Title.
 *
 * @param array<string, string> $columns
 * @return array<string, string>
 */
function bl_forms_entry_columns(array $columns): array
{
	$cb = $columns['cb'] ?? '';

	return array_filter([
		'cb'        => $cb,
		'bl_form'   => __('Form', 'baselayer-forms'),
		'bl_fields' => __('Fields', 'baselayer-forms'),
		'bl_status' => __('Status', 'baselayer-forms'),
		'date'      => __('Date', 'baselayer-forms'),
	]);
}
add_filter('manage_' . BL_FORM_ENTRY_POST_TYPE . '_posts_columns', 'bl_forms_entry_columns');

/**
 * Put row actions under the Form column (Title is hidden).
 */
function bl_forms_entry_primary_column(string $default, string $screen_id): string
{
	if ($screen_id === 'edit-' . BL_FORM_ENTRY_POST_TYPE) {
		return 'bl_form';
	}

	return $default;
}
add_filter('list_table_primary_column', 'bl_forms_entry_primary_column', 10, 2);

/**
 * Drop the “Published” / “Veröffentlicht” status label; show datetime only.
 *
 * @param string       $status
 * @param WP_Post|null $post
 */
function bl_forms_entry_date_column_status(string $status, $post = null): string
{
	if ($post instanceof WP_Post && $post->post_type === BL_FORM_ENTRY_POST_TYPE) {
		return '';
	}

	return $status;
}
add_filter('post_date_column_status', 'bl_forms_entry_date_column_status', 10, 2);

/**
 * Default list order: newest submissions first.
 */
function bl_forms_entry_list_order(WP_Query $query): void
{
	if (!is_admin() || !$query->is_main_query()) {
		return;
	}

	$post_type = $query->get('post_type');
	if ($post_type !== BL_FORM_ENTRY_POST_TYPE) {
		return;
	}

	if ($query->get('orderby')) {
		return;
	}

	$query->set('orderby', 'date');
	$query->set('order', 'DESC');
}
add_action('pre_get_posts', 'bl_forms_entry_list_order');

/**
 * Render entry list column values.
 */
function bl_forms_entry_column_content(string $column, int $post_id): void
{
	if ($column === 'bl_form') {
		$form_id = (int) get_post_meta($post_id, BL_FORM_ENTRY_FORM_META, true);
		if ($form_id > 0) {
			$title = get_the_title($form_id);
			$label = $title !== '' ? $title : '#' . $form_id;
			$view = get_edit_post_link($post_id, 'raw');
			if ($view) {
				echo '<strong><a class="row-title" href="' . esc_url($view) . '">' . esc_html($label) . '</a></strong>';
			} else {
				echo '<strong>' . esc_html($label) . '</strong>';
			}
		} else {
			echo '—';
		}

		return;
	}

	if ($column === 'bl_fields') {
		$form_id = (int) get_post_meta($post_id, BL_FORM_ENTRY_FORM_META, true);
		if ($form_id <= 0) {
			echo '—';

			return;
		}
		bl_forms_entry_list_overview_html($post_id, $form_id);

		return;
	}

	if ($column === 'bl_status') {
		$mail = get_post_meta($post_id, BL_FORM_ENTRY_MAIL_META, true);
		if (!is_array($mail)) {
			echo '—';

			return;
		}
		if (!empty($mail['admin_sent'])) {
			echo '<span style="color:#008a20;">' . esc_html__('Sent', 'baselayer-forms') . '</span>';
		} elseif (!empty($mail['admin_error'])) {
			echo '<span style="color:#b32d2e;" title="' . esc_attr((string) $mail['admin_error']) . '">' . esc_html__('Failed', 'baselayer-forms') . '</span>';
		} else {
			echo '<span style="color:#646970;">' . esc_html__('—', 'baselayer-forms') . '</span>';
		}
	}
}
add_action('manage_' . BL_FORM_ENTRY_POST_TYPE . '_posts_custom_column', 'bl_forms_entry_column_content', 10, 2);

/**
 * Load entry field schema snapshot (empty list when missing/invalid).
 *
 * @return list<array<string, mixed>>
 */
function bl_forms_get_entry_schema(int $entry_id): array
{
	$schema = get_post_meta($entry_id, BL_FORM_ENTRY_SCHEMA_META, true);
	if (!is_array($schema)) {
		return [];
	}

	$out = [];
	foreach ($schema as $field) {
		if (!is_array($field) || empty($field['name'])) {
			continue;
		}
		$out[] = $field;
	}

	return $out;
}

/**
 * Resolve display fields for an entry: snapshot first, else live form config.
 *
 * @return list<array<string, mixed>>
 */
function bl_forms_entry_display_fields(int $entry_id, int $form_id): array
{
	$schema = bl_forms_get_entry_schema($entry_id);
	if ($schema !== []) {
		return $schema;
	}

	$config = $form_id > 0 ? bl_forms_get_config($form_id) : bl_forms_default_config();

	return iterator_to_array(bl_forms_iter_fields($config['fields'] ?? []), false);
}

/**
 * Stack up to 3 “show in list” field values (or — when none).
 */
function bl_forms_entry_list_overview_html(int $entry_id, int $form_id): void
{
	$values = get_post_meta($entry_id, BL_FORM_ENTRY_FIELDS_META, true);
	if (!is_array($values)) {
		$values = [];
	}

	$lines = [];
	foreach (bl_forms_entry_display_fields($entry_id, $form_id) as $field) {
		$type = (string) ($field['type'] ?? '');
		if (!in_array($type, ['text', 'email', 'phone'], true) || empty($field['show_in_list'])) {
			continue;
		}
		$name = (string) ($field['name'] ?? '');
		if ($name === '' || !array_key_exists($name, $values)) {
			continue;
		}
		$display = trim(bl_forms_format_field_display_value($field, $values[$name]));
		if ($display === '') {
			continue;
		}
		$lines[] = $display;
		if (count($lines) >= 3) {
			break;
		}
	}

	if ($lines === []) {
		echo '—';

		return;
	}

	echo '<div class="bl-forms-entry-overview">';
	foreach ($lines as $line) {
		echo '<div class="bl-forms-entry-overview__item">' . esc_html($line) . '</div>';
	}
	echo '</div>';
}

/**
 * View-only row actions: View + Trash (no Quick Edit).
 *
 * @param array<string, string> $actions
 * @return array<string, string>
 */
function bl_forms_entry_row_actions(array $actions, WP_Post $post): array
{
	if ($post->post_type !== BL_FORM_ENTRY_POST_TYPE) {
		return $actions;
	}

	unset($actions['inline hide-if-no-js'], $actions['inline']);

	$link = get_edit_post_link($post->ID, 'raw');
	if ($link) {
		$actions['edit'] = sprintf(
			'<a href="%s" aria-label="%s">%s</a>',
			esc_url($link),
			/* translators: %s: entry title */
			esc_attr(sprintf(__('View “%s”', 'baselayer-forms'), get_the_title($post))),
			esc_html__('View', 'baselayer-forms')
		);
	}

	return $actions;
}
add_filter('post_row_actions', 'bl_forms_entry_row_actions', 10, 2);

/**
 * Remove bulk Edit for entries.
 *
 * @param array<string, string> $actions
 * @return array<string, string>
 */
function bl_forms_entry_bulk_actions(array $actions): array
{
	unset($actions['edit']);

	return $actions;
}
add_filter('bulk_actions-edit-' . BL_FORM_ENTRY_POST_TYPE, 'bl_forms_entry_bulk_actions');

/**
 * Entry detail meta boxes (read-only).
 */
function bl_forms_entry_meta_boxes(): void
{
	remove_meta_box('submitdiv', BL_FORM_ENTRY_POST_TYPE, 'side');
	remove_meta_box('slugdiv', BL_FORM_ENTRY_POST_TYPE, 'normal');
	remove_post_type_support(BL_FORM_ENTRY_POST_TYPE, 'editor');
	remove_meta_box('postdivrich', BL_FORM_ENTRY_POST_TYPE, 'normal');
	add_meta_box(
		'bl_forms_entry_data',
		__('Submission', 'baselayer-forms'),
		'bl_forms_render_entry_metabox',
		BL_FORM_ENTRY_POST_TYPE,
		'normal',
		'high'
	);

	add_meta_box(
		'bl_forms_entry_mail',
		__('Email status', 'baselayer-forms'),
		'bl_forms_render_entry_mail_metabox',
		BL_FORM_ENTRY_POST_TYPE,
		'side',
		'default'
	);
}
add_action('add_meta_boxes', 'bl_forms_entry_meta_boxes');

/**
 * Submission fields.
 */
function bl_forms_render_entry_metabox(WP_Post $post): void
{
	$entry_id = (int) $post->ID;
	$values = get_post_meta($entry_id, BL_FORM_ENTRY_FIELDS_META, true);
	$form_id = (int) get_post_meta($entry_id, BL_FORM_ENTRY_FORM_META, true);

	if (!is_array($values) || $values === []) {
		echo '<p>' . esc_html__('No field data stored.', 'baselayer-forms') . '</p>';

		return;
	}

	$fields_by_name = [];
	foreach (bl_forms_entry_display_fields($entry_id, $form_id) as $field) {
		$name = (string) ($field['name'] ?? '');
		if ($name !== '') {
			$fields_by_name[$name] = $field;
		}
	}

	// Live config fills gaps for keys present only in values (renamed fields, etc.).
	if ($form_id > 0) {
		$config = bl_forms_get_config($form_id);
		foreach (bl_forms_iter_fields($config['fields'] ?? []) as $field) {
			$name = (string) ($field['name'] ?? '');
			if ($name !== '' && !isset($fields_by_name[$name])) {
				$fields_by_name[$name] = $field;
			}
		}
	}

	echo '<table class="widefat striped"><tbody>';
	foreach ($values as $name => $value) {
		$name = (string) $name;
		$field = $fields_by_name[$name] ?? ['name' => $name, 'label' => $name, 'type' => ''];
		$label = (string) ($field['label'] ?? $name);
		$type = (string) ($field['type'] ?? '');
		$is_file = in_array($type, ['file', 'image'], true) || bl_forms_value_looks_like_files($value);
		echo '<tr><th style="width:28%;">' . esc_html($label) . '</th><td>';
		if ($is_file && is_array($value)) {
			$links = [];
			foreach ($value as $item) {
				if (!is_array($item)) {
					continue;
				}
				$fname = (string) ($item['name'] ?? '');
				$furl = (string) ($item['url'] ?? '');
				if ($fname !== '' && $furl !== '') {
					$links[] = '<a href="' . esc_url($furl) . '" target="_blank" rel="noopener noreferrer">' . esc_html($fname) . '</a>';
				} elseif ($fname !== '') {
					$links[] = esc_html($fname);
				}
			}
			echo $links !== [] ? implode('<br>', $links) : '—';
		} else {
			$display = bl_forms_format_field_display_value($field, $value);
			echo nl2br(esc_html($display));
		}
		echo '</td></tr>';
	}
	echo '</tbody></table>';
}

/**
 * Mail status box.
 */
function bl_forms_render_entry_mail_metabox(WP_Post $post): void
{
	$mail = get_post_meta((int) $post->ID, BL_FORM_ENTRY_MAIL_META, true);
	if (!is_array($mail)) {
		echo '<p>' . esc_html__('No email status.', 'baselayer-forms') . '</p>';

		return;
	}

	$admin = !empty($mail['admin_sent']) ? __('Sent', 'baselayer-forms') : (!empty($mail['admin_error']) ? __('Failed', 'baselayer-forms') : __('—', 'baselayer-forms'));
	$user = !empty($mail['user_sent']) ? __('Sent', 'baselayer-forms') : (!empty($mail['user_error']) ? __('Failed', 'baselayer-forms') : __('—', 'baselayer-forms'));

	echo '<p><strong>' . esc_html__('Admin', 'baselayer-forms') . ':</strong> ' . esc_html($admin) . '</p>';
	if (!empty($mail['admin_error'])) {
		echo '<p class="description">' . esc_html((string) $mail['admin_error']) . '</p>';
	}
	echo '<p><strong>' . esc_html__('User', 'baselayer-forms') . ':</strong> ' . esc_html($user) . '</p>';
	if (!empty($mail['user_error'])) {
		echo '<p class="description">' . esc_html((string) $mail['user_error']) . '</p>';
	}
}

/**
 * Prevent creating entries manually.
 */
function bl_forms_block_manual_entry_create(): void
{
	global $pagenow;
	if ($pagenow === 'post-new.php' && isset($_GET['post_type']) && $_GET['post_type'] === BL_FORM_ENTRY_POST_TYPE) {
		wp_safe_redirect(admin_url('edit.php?post_type=' . BL_FORM_ENTRY_POST_TYPE));
		exit;
	}
}
add_action('admin_init', 'bl_forms_block_manual_entry_create');

/**
 * Remove “Add New” submenu for entries.
 */
function bl_forms_entries_submenu_cleanup(): void
{
	global $submenu;

	$parent = 'edit.php?post_type=' . BL_FORM_POST_TYPE;
	remove_submenu_page($parent, 'post-new.php?post_type=' . BL_FORM_ENTRY_POST_TYPE);

	if (isset($submenu[$parent]) && is_array($submenu[$parent])) {
		foreach ($submenu[$parent] as $index => $item) {
			if (!is_array($item) || empty($item[2])) {
				continue;
			}
			if ($item[2] === 'post-new.php?post_type=' . BL_FORM_ENTRY_POST_TYPE) {
				unset($submenu[$parent][$index]);
			}
		}
	}
}
add_action('admin_menu', 'bl_forms_entries_submenu_cleanup', 999);

/**
 * Hide Add New + editor; show entry title as read-only.
 */
function bl_forms_entries_admin_css(): void
{
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen instanceof WP_Screen || $screen->post_type !== BL_FORM_ENTRY_POST_TYPE) {
		return;
	}

	$css = '.post-type-' . esc_attr(BL_FORM_ENTRY_POST_TYPE) . ' .page-title-action{display:none!important;}';
	$css .= '.bl-forms-entry-overview{margin:0;line-height:1.45;}';
	$css .= '.bl-forms-entry-overview__item{margin:0;}';
	if ($screen->base === 'post') {
		$css .= '#edit-slug-box,#postdivrich,#wp-content-wrap{display:none!important;}';
		$css .= '#titlediv #title{background:#f6f7f7;color:#2c3338;cursor:default;box-shadow:none;}';
	}
	echo '<style id="bl-forms-entries-view-only">' . $css . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
add_action('admin_head', 'bl_forms_entries_admin_css');

/**
 * Lock the entry title field (display only; no Update box on this screen).
 */
function bl_forms_entries_title_readonly(): void
{
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen instanceof WP_Screen || $screen->post_type !== BL_FORM_ENTRY_POST_TYPE || $screen->base !== 'post') {
		return;
	}

	echo '<script id="bl-forms-entry-title-ro">document.addEventListener("DOMContentLoaded",function(){var t=document.getElementById("title");if(t){t.readOnly=true;t.setAttribute("aria-readonly","true");}});</script>';
}
add_action('admin_footer', 'bl_forms_entries_title_readonly');

/**
 * Absolute path under uploads/baselayer-forms only (rejects path traversal).
 */
function bl_forms_resolve_entry_upload_path(array $item): string
{
	$uploads = wp_upload_dir();
	if (!empty($uploads['error']) || empty($uploads['basedir'])) {
		return '';
	}

	$basedir = wp_normalize_path(trailingslashit((string) $uploads['basedir']));
	$forms_root = $basedir . 'baselayer-forms';
	$forms_real = realpath($forms_root);
	if ($forms_real === false) {
		return '';
	}
	$forms_real = wp_normalize_path($forms_real);

	$candidate = '';
	$rel = isset($item['path']) ? ltrim(str_replace('\\', '/', (string) $item['path']), '/') : '';
	if ($rel !== '' && str_starts_with($rel, 'baselayer-forms/')) {
		$candidate = $basedir . $rel;
	} else {
		$url = (string) ($item['url'] ?? '');
		if ($url === '' || empty($uploads['baseurl'])) {
			return '';
		}
		$baseurl = trailingslashit((string) $uploads['baseurl']);
		$baseurl_http = set_url_scheme($baseurl, 'http');
		$baseurl_https = set_url_scheme($baseurl, 'https');
		foreach ([$baseurl, $baseurl_http, $baseurl_https] as $prefix) {
			if ($prefix !== '' && str_starts_with($url, $prefix)) {
				$candidate = $basedir . ltrim(substr($url, strlen($prefix)), '/');
				break;
			}
		}
	}

	if ($candidate === '') {
		return '';
	}

	$real = realpath($candidate);
	if ($real === false) {
		return '';
	}
	$real = wp_normalize_path($real);
	if ($real !== $forms_real && !str_starts_with($real, $forms_real . '/')) {
		return '';
	}
	if (!is_file($real)) {
		return '';
	}

	return $real;
}

/**
 * Delete stored upload files for a form entry (idempotent).
 */
function bl_forms_delete_entry_uploads(int $post_id): void
{
	if ($post_id <= 0 || get_post_type($post_id) !== BL_FORM_ENTRY_POST_TYPE) {
		return;
	}

	$values = get_post_meta($post_id, BL_FORM_ENTRY_FIELDS_META, true);
	if (!is_array($values)) {
		return;
	}

	foreach ($values as $value) {
		if (!is_array($value)) {
			continue;
		}
		// Single file shape or list of files.
		$items = isset($value[0]) || $value === [] ? $value : [$value];
		foreach ($items as $item) {
			if (!is_array($item)) {
				continue;
			}
			$path = bl_forms_resolve_entry_upload_path($item);
			if ($path === '') {
				continue;
			}
			wp_delete_file($path);
		}
	}
}

/**
 * Remove upload files when an entry is trashed or permanently deleted.
 *
 * @param int $post_id
 */
function bl_forms_on_entry_removed($post_id): void
{
	bl_forms_delete_entry_uploads((int) $post_id);
}
add_action('wp_trash_post', 'bl_forms_on_entry_removed');
add_action('before_delete_post', 'bl_forms_on_entry_removed');
