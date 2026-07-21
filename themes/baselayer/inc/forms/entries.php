<?php

defined('ABSPATH') || exit;

/**
 * Entries list columns.
 *
 * @param array<string, string> $columns
 * @return array<string, string>
 */
function bl_forms_entry_columns(array $columns): array
{
	$new = [];
	foreach ($columns as $key => $label) {
		if ($key === 'date') {
			$new['bl_form'] = __('Form', 'baselayer');
			$new['bl_mail_admin'] = __('Admin email', 'baselayer');
			$new['bl_mail_user'] = __('User email', 'baselayer');
		}
		$new[$key] = $label;
	}

	return $new;
}
add_filter('manage_' . BL_FORM_ENTRY_POST_TYPE . '_posts_columns', 'bl_forms_entry_columns');

/**
 * Render entry list column values.
 */
function bl_forms_entry_column_content(string $column, int $post_id): void
{
	if ($column === 'bl_form') {
		$form_id = (int) get_post_meta($post_id, BL_FORM_ENTRY_FORM_META, true);
		if ($form_id > 0) {
			$title = get_the_title($form_id);
			$url = get_edit_post_link($form_id);
			if ($url && bl_forms_user_can_manage()) {
				echo '<a href="' . esc_url($url) . '">' . esc_html($title !== '' ? $title : '#' . $form_id) . '</a>';
			} else {
				echo esc_html($title !== '' ? $title : '#' . $form_id);
			}
		} else {
			echo '—';
		}

		return;
	}

	if ($column === 'bl_mail_admin' || $column === 'bl_mail_user') {
		$mail = get_post_meta($post_id, BL_FORM_ENTRY_MAIL_META, true);
		if (!is_array($mail)) {
			echo '—';

			return;
		}
		$key = $column === 'bl_mail_admin' ? 'admin_sent' : 'user_sent';
		$err = $column === 'bl_mail_admin' ? 'admin_error' : 'user_error';
		if (!empty($mail[$key])) {
			echo '<span style="color:#008a20;">' . esc_html__('Sent', 'baselayer') . '</span>';
		} elseif (!empty($mail[$err])) {
			echo '<span style="color:#b32d2e;" title="' . esc_attr((string) $mail[$err]) . '">' . esc_html__('Failed', 'baselayer') . '</span>';
		} else {
			echo '<span style="color:#646970;">' . esc_html__('—', 'baselayer') . '</span>';
		}
	}
}
add_action('manage_' . BL_FORM_ENTRY_POST_TYPE . '_posts_custom_column', 'bl_forms_entry_column_content', 10, 2);

/**
 * Entry detail meta boxes (read-only).
 */
function bl_forms_entry_meta_boxes(): void
{
	remove_meta_box('submitdiv', BL_FORM_ENTRY_POST_TYPE, 'side');
	remove_meta_box('slugdiv', BL_FORM_ENTRY_POST_TYPE, 'normal');

	add_meta_box(
		'bl_forms_entry_data',
		__('Submission', 'baselayer'),
		'bl_forms_render_entry_metabox',
		BL_FORM_ENTRY_POST_TYPE,
		'normal',
		'high'
	);

	add_meta_box(
		'bl_forms_entry_mail',
		__('Email status', 'baselayer'),
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
	$values = get_post_meta((int) $post->ID, BL_FORM_ENTRY_FIELDS_META, true);
	$form_id = (int) get_post_meta((int) $post->ID, BL_FORM_ENTRY_FORM_META, true);
	$config = $form_id > 0 ? bl_forms_get_config($form_id) : bl_forms_default_config();

	if (!is_array($values) || $values === []) {
		echo '<p>' . esc_html__('No field data stored.', 'baselayer') . '</p>';

		return;
	}

	$fields_by_name = [];
	foreach ($config['fields'] as $field) {
		if (!empty($field['name'])) {
			$fields_by_name[(string) $field['name']] = $field;
		}
	}

	echo '<table class="widefat striped"><tbody>';
	foreach ($values as $name => $value) {
		$field = $fields_by_name[$name] ?? ['name' => $name, 'label' => $name, 'type' => ''];
		$label = (string) ($field['label'] ?? $name);
		$type = (string) ($field['type'] ?? '');
		echo '<tr><th style="width:28%;">' . esc_html($label) . '</th><td>';
		if (in_array($type, ['file', 'image'], true) && is_array($value)) {
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
		echo '<p>' . esc_html__('No email status.', 'baselayer') . '</p>';

		return;
	}

	$admin = !empty($mail['admin_sent']) ? __('Sent', 'baselayer') : (!empty($mail['admin_error']) ? __('Failed', 'baselayer') : __('—', 'baselayer'));
	$user = !empty($mail['user_sent']) ? __('Sent', 'baselayer') : (!empty($mail['user_error']) ? __('Failed', 'baselayer') : __('—', 'baselayer'));

	echo '<p><strong>' . esc_html__('Admin', 'baselayer') . ':</strong> ' . esc_html($admin) . '</p>';
	if (!empty($mail['admin_error'])) {
		echo '<p class="description">' . esc_html((string) $mail['admin_error']) . '</p>';
	}
	echo '<p><strong>' . esc_html__('User', 'baselayer') . ':</strong> ' . esc_html($user) . '</p>';
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
 * Hide the list/edit “Add Entry” button (entries are created by form submit only).
 */
function bl_forms_entries_hide_add_button(): void
{
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen instanceof WP_Screen || $screen->post_type !== BL_FORM_ENTRY_POST_TYPE) {
		return;
	}

	echo '<style id="bl-forms-hide-add-entry">.post-type-' . esc_attr(BL_FORM_ENTRY_POST_TYPE) . ' .page-title-action{display:none!important;}</style>';
}
add_action('admin_head', 'bl_forms_entries_hide_add_button');

