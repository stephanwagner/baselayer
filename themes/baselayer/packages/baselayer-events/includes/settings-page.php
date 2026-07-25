<?php

defined('ABSPATH') || exit;

/**
 * Settings page admin URL (works under CPT submenu or Settings).
 */
function bl_events_settings_url(array $args = []): string
{
	$instances = bl_events_get_instances(true);
	if ($instances !== []) {
		$first = (string) array_key_first($instances);
		$base = admin_url('edit.php?post_type=' . rawurlencode($first) . '&page=bl-events-settings');
	} else {
		$base = admin_url('options-general.php?page=bl-events-settings');
	}
	if ($args === []) {
		return $base;
	}

	return add_query_arg($args, $base);
}

/**
 * Register Events settings under the first enabled instance menu (or Settings when none).
 */
function bl_events_register_settings_page(): void
{
	$parent = 'options-general.php';
	$instances = bl_events_get_instances(true);
	if ($instances !== []) {
		$first = array_key_first($instances);
		$parent = 'edit.php?post_type=' . $first;
	}

	add_submenu_page(
		$parent,
		__('Event types', 'baselayer-events'),
		__('Event types', 'baselayer-events'),
		'manage_options',
		'bl-events-settings',
		'bl_events_render_settings_page'
	);
}
add_action('admin_menu', 'bl_events_register_settings_page', 30);

/**
 * Handle POST saves before output.
 */
function bl_events_handle_settings_post(): void
{
	if (!is_admin() || !current_user_can('manage_options')) {
		return;
	}
	if (!isset($_POST['bl_events_settings_action'])) {
		return;
	}
	check_admin_referer('bl_events_settings');

	$action = sanitize_key(wp_unslash((string) $_POST['bl_events_settings_action']));
	$instances = bl_events_get_instances(false);

	if ($action === 'add') {
		$base = isset($_POST['new_slug']) ? sanitize_key(wp_unslash((string) $_POST['new_slug'])) : 'event';
		$slug = bl_events_unique_slug($base !== '' ? $base : 'event');
		$def = bl_events_default_instance_definition();
		$def['type'] = 'event';
		$def['labels'] = [
			'name' => ucfirst(str_replace(['-', '_'], ' ', $slug)) . 's',
			'singular_name' => ucfirst(str_replace(['-', '_'], ' ', $slug)),
			'menu_name' => '',
		];
		$def['labels']['menu_name'] = $def['labels']['name'];
		$def['archive']['slug'] = sanitize_title($slug . 's');
		$def['taxonomies'] = [
			$slug . '_category' => [
				'label' => 'Categories',
				'singular_label' => 'Category',
				'url' => $slug . '-category',
			],
		];
		$instances[$slug] = $def;
		bl_events_save_instances($instances);
		wp_safe_redirect(bl_events_settings_url(['instance' => $slug, 'updated' => '1']));
		exit;
	}

	if ($action === 'delete') {
		$slug = isset($_POST['instance']) ? sanitize_key(wp_unslash((string) $_POST['instance'])) : '';
		if ($slug !== '' && isset($instances[$slug]) && count($instances) > 1) {
			unset($instances[$slug]);
			bl_events_save_instances($instances);
		}
		wp_safe_redirect(bl_events_settings_url(['updated' => '1']));
		exit;
	}

	if ($action === 'save') {
		$slug = isset($_POST['instance']) ? sanitize_key(wp_unslash((string) $_POST['instance'])) : '';
		if ($slug === '' || !isset($instances[$slug])) {
			wp_safe_redirect(bl_events_settings_url());
			exit;
		}
		$tab = isset($_POST['tab']) ? sanitize_key(wp_unslash((string) $_POST['tab'])) : 'general';
		$cfg = $instances[$slug];
		$cfg = bl_events_apply_settings_tab($cfg, $tab, wp_unslash($_POST));
		$instances[$slug] = bl_events_sanitize_instance($cfg, $slug);
		bl_events_save_instances($instances);
		wp_safe_redirect(bl_events_settings_url(['instance' => $slug, 'tab' => $tab, 'updated' => '1']));
		exit;
	}
}
add_action('admin_init', 'bl_events_handle_settings_post');

/**
 * @param array<string, mixed> $cfg
 * @param array<string, mixed> $post
 * @return array<string, mixed>
 */
function bl_events_apply_settings_tab(array $cfg, string $tab, array $post): array
{
	if ($tab === 'general') {
		$cfg['enabled'] = !empty($post['enabled']);
		$cfg['public'] = !empty($post['public']);
		$cfg['hierarchical'] = !empty($post['hierarchical']);
		$cfg['labels'] = [
			'name' => sanitize_text_field((string) ($post['label_name'] ?? '')),
			'singular_name' => sanitize_text_field((string) ($post['label_singular'] ?? '')),
			'menu_name' => sanitize_text_field((string) ($post['label_menu'] ?? '')),
		];
		$supports = isset($post['supports']) && is_array($post['supports']) ? $post['supports'] : [];
		$cfg['supports'] = array_map('sanitize_key', $supports);
		$cfg['admin'] = [
			'menu_icon' => (string) ($post['menu_icon'] ?? ''),
			'menu_position' => (int) ($post['menu_position'] ?? 5),
			'page_title_toggle' => !empty($post['page_title_toggle']),
		];
		$cfg['wp_categories'] = !empty($post['wp_categories']);
		$cfg['wp_tags'] = !empty($post['wp_tags']);
	}

	if ($tab === 'archive') {
		$cfg['archive'] = [
			'enabled' => !empty($post['archive_enabled']),
			'slug' => sanitize_title((string) ($post['archive_slug'] ?? '')),
			'design' => sanitize_key((string) ($post['archive_design'] ?? 'list')),
			'category_filter' => !empty($post['archive_category_filter']),
			'texts' => [
				'heading' => sanitize_text_field((string) ($post['archive_heading'] ?? '')),
				'empty' => sanitize_text_field((string) ($post['archive_empty'] ?? '')),
			],
		];
	}

	if ($tab === 'taxonomies') {
		$ids = isset($post['tax_id']) && is_array($post['tax_id']) ? $post['tax_id'] : [];
		$labels = isset($post['tax_label']) && is_array($post['tax_label']) ? $post['tax_label'] : [];
		$singulars = isset($post['tax_singular']) && is_array($post['tax_singular']) ? $post['tax_singular'] : [];
		$urls = isset($post['tax_url']) && is_array($post['tax_url']) ? $post['tax_url'] : [];
		$tax = [];
		foreach ($ids as $i => $id) {
			$id = sanitize_key((string) $id);
			if ($id === '') {
				continue;
			}
			$tax[$id] = [
				'label' => sanitize_text_field((string) ($labels[$i] ?? $id)),
				'singular_label' => sanitize_text_field((string) ($singulars[$i] ?? '')),
				'url' => sanitize_title((string) ($urls[$i] ?? $id)),
			];
		}
		$cfg['taxonomies'] = $tax;
	}

	if ($tab === 'statuses') {
		$ids = isset($post['status_id']) && is_array($post['status_id']) ? $post['status_id'] : [];
		$labels = isset($post['status_label']) && is_array($post['status_label']) ? $post['status_label'] : [];
		$colors = isset($post['status_color']) && is_array($post['status_color']) ? $post['status_color'] : [];
		$statuses = [];
		foreach ($ids as $i => $id) {
			$id = sanitize_key((string) $id);
			if ($id === '') {
				continue;
			}
			$statuses[$id] = [
				'label' => sanitize_text_field((string) ($labels[$i] ?? $id)),
				'color' => sanitize_text_field((string) ($colors[$i] ?? '')),
			];
		}
		$cfg['statuses'] = $statuses;
	}

	if ($tab === 'meta') {
		$cfg['meta'] = [
			'title' => sanitize_text_field((string) ($post['meta_title'] ?? '')),
			'groups' => bl_events_parse_meta_groups_from_post($post),
		];
	}

	return $cfg;
}

/**
 * @param array<string, mixed> $post
 * @return array<string, array{title: string, fields: array<string, array{type: string, label: string}>}>
 */
function bl_events_parse_meta_groups_from_post(array $post): array
{
	$group_ids = isset($post['meta_group_id']) && is_array($post['meta_group_id']) ? $post['meta_group_id'] : [];
	$group_titles = isset($post['meta_group_title']) && is_array($post['meta_group_title']) ? $post['meta_group_title'] : [];
	$field_group = isset($post['meta_field_group']) && is_array($post['meta_field_group']) ? $post['meta_field_group'] : [];
	$field_ids = isset($post['meta_field_id']) && is_array($post['meta_field_id']) ? $post['meta_field_id'] : [];
	$field_labels = isset($post['meta_field_label']) && is_array($post['meta_field_label']) ? $post['meta_field_label'] : [];
	$field_types = isset($post['meta_field_type']) && is_array($post['meta_field_type']) ? $post['meta_field_type'] : [];

	$groups = [];
	foreach ($group_ids as $i => $gid) {
		$gid = sanitize_key((string) $gid);
		if ($gid === '') {
			continue;
		}
		$groups[$gid] = [
			'title' => sanitize_text_field((string) ($group_titles[$i] ?? $gid)),
			'fields' => [],
		];
	}

	foreach ($field_ids as $i => $fid) {
		$fid = sanitize_key((string) $fid);
		$gid = sanitize_key((string) ($field_group[$i] ?? ''));
		if ($fid === '' || $gid === '' || !isset($groups[$gid])) {
			continue;
		}
		$type = sanitize_key((string) ($field_types[$i] ?? 'text'));
		if (!in_array($type, ['text', 'textarea', 'email', 'url'], true)) {
			$type = 'text';
		}
		$groups[$gid]['fields'][$fid] = [
			'type' => $type,
			'label' => sanitize_text_field((string) ($field_labels[$i] ?? $fid)),
		];
	}

	return $groups;
}

function bl_events_render_settings_page(): void
{
	if (!current_user_can('manage_options')) {
		return;
	}

	$instances = bl_events_get_instances(false);
	$instance = isset($_GET['instance']) ? sanitize_key(wp_unslash((string) $_GET['instance'])) : '';
	if ($instance === '' || !isset($instances[$instance])) {
		$instance = $instances !== [] ? (string) array_key_first($instances) : '';
	}
	$tab = isset($_GET['tab']) ? sanitize_key(wp_unslash((string) $_GET['tab'])) : 'general';
	$tabs = [
		'general' => __('General', 'baselayer-events'),
		'archive' => __('Archive', 'baselayer-events'),
		'taxonomies' => __('Taxonomies', 'baselayer-events'),
		'statuses' => __('Statuses', 'baselayer-events'),
		'meta' => __('Metadata', 'baselayer-events'),
	];
	if (!isset($tabs[$tab])) {
		$tab = 'general';
	}
	$cfg = $instance !== '' ? $instances[$instance] : null;

	echo '<div class="wrap bl-events-settings">';
	echo '<h1>' . esc_html__('Event types', 'baselayer-events') . '</h1>';
	if (!empty($_GET['updated'])) {
		echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Settings saved.', 'baselayer-events') . '</p></div>';
	}

	echo '<p class="description">' . esc_html__('Each event type is its own post type (for example Events, Courses, Workshops), with its own labels, statuses, and metadata.', 'baselayer-events') . '</p>';

	echo '<h2 class="nav-tab-wrapper" style="margin-top:16px">';
	foreach ($instances as $slug => $row) {
		$url = bl_events_settings_url(['instance' => $slug, 'tab' => $tab]);
		$class = $slug === $instance ? ' nav-tab-active' : '';
		$label = !empty($row['labels']['name']) ? (string) $row['labels']['name'] : $slug;
		echo '<a class="nav-tab' . esc_attr($class) . '" href="' . esc_url($url) . '">' . esc_html($label) . '</a>';
	}
	echo '</h2>';

	echo '<form method="post" style="margin:12px 0 24px;display:flex;gap:8px;align-items:center">';
	wp_nonce_field('bl_events_settings');
	echo '<input type="hidden" name="bl_events_settings_action" value="add">';
	echo '<label for="bl-events-new-slug"><strong>' . esc_html__('Add type', 'baselayer-events') . '</strong></label> ';
	echo '<input type="text" class="regular-text" id="bl-events-new-slug" name="new_slug" placeholder="course" pattern="[a-z0-9_\\-]+">';
	submit_button(__('Add', 'baselayer-events'), 'secondary', 'submit', false);
	echo '</form>';

	if (!is_array($cfg) || $instance === '') {
		echo '<p>' . esc_html__('No event types yet.', 'baselayer-events') . '</p></div>';
		return;
	}

	echo '<h2 class="nav-tab-wrapper">';
	foreach ($tabs as $key => $label) {
		$url = bl_events_settings_url(['instance' => $instance, 'tab' => $key]);
		$class = $key === $tab ? ' nav-tab-active' : '';
		echo '<a class="nav-tab' . esc_attr($class) . '" href="' . esc_url($url) . '">' . esc_html($label) . '</a>';
	}
	echo '</h2>';

	echo '<form method="post" class="bl-events-settings__form">';
	wp_nonce_field('bl_events_settings');
	echo '<input type="hidden" name="bl_events_settings_action" value="save">';
	echo '<input type="hidden" name="instance" value="' . esc_attr($instance) . '">';
	echo '<input type="hidden" name="tab" value="' . esc_attr($tab) . '">';

	echo '<table class="form-table" role="presentation"><tbody>';
	if ($tab === 'general') {
		bl_events_settings_general_fields($instance, $cfg);
	} elseif ($tab === 'archive') {
		bl_events_settings_archive_fields($cfg);
	} elseif ($tab === 'taxonomies') {
		bl_events_settings_taxonomies_fields($cfg);
	} elseif ($tab === 'statuses') {
		bl_events_settings_statuses_fields($cfg);
	} else {
		bl_events_settings_meta_fields($cfg);
	}
	echo '</tbody></table>';

	submit_button(__('Save changes', 'baselayer-events'));
	echo '</form>';

	if (count($instances) > 1) {
		echo '<form method="post" style="margin-top:24px" onsubmit="return confirm(\'' . esc_js(__('Delete this event type? Existing posts are not deleted.', 'baselayer-events')) . '\');">';
		wp_nonce_field('bl_events_settings');
		echo '<input type="hidden" name="bl_events_settings_action" value="delete">';
		echo '<input type="hidden" name="instance" value="' . esc_attr($instance) . '">';
		submit_button(__('Delete this event type', 'baselayer-events'), 'delete', 'submit', false);
		echo '</form>';
	}

	echo '</div>';
}

/**
 * @param array<string, mixed> $cfg
 */
function bl_events_settings_general_fields(string $slug, array $cfg): void
{
	$labels = is_array($cfg['labels'] ?? null) ? $cfg['labels'] : [];
	$admin = is_array($cfg['admin'] ?? null) ? $cfg['admin'] : [];
	$supports = is_array($cfg['supports'] ?? null) ? $cfg['supports'] : [];

	echo '<tr><th>' . esc_html__('Slug', 'baselayer-events') . '</th><td><code>' . esc_html($slug) . '</code>';
	echo '<p class="description">' . esc_html__('Immutable after creation (post type key).', 'baselayer-events') . '</p></td></tr>';

	echo '<tr><th>' . esc_html__('Enabled', 'baselayer-events') . '</th><td>';
	echo '<label><input type="checkbox" name="enabled" value="1" ' . checked(!empty($cfg['enabled']), true, false) . '> ' . esc_html__('Register and show this type', 'baselayer-events') . '</label></td></tr>';

	echo '<tr><th>' . esc_html__('Plural name', 'baselayer-events') . '</th><td><input type="text" class="regular-text" name="label_name" value="' . esc_attr((string) ($labels['name'] ?? '')) . '"></td></tr>';
	echo '<tr><th>' . esc_html__('Singular name', 'baselayer-events') . '</th><td><input type="text" class="regular-text" name="label_singular" value="' . esc_attr((string) ($labels['singular_name'] ?? '')) . '"></td></tr>';
	echo '<tr><th>' . esc_html__('Menu name', 'baselayer-events') . '</th><td><input type="text" class="regular-text" name="label_menu" value="' . esc_attr((string) ($labels['menu_name'] ?? '')) . '"></td></tr>';

	echo '<tr><th>' . esc_html__('Public', 'baselayer-events') . '</th><td><label><input type="checkbox" name="public" value="1" ' . checked(!empty($cfg['public']), true, false) . '> ' . esc_html__('Publicly queryable', 'baselayer-events') . '</label></td></tr>';
	echo '<tr><th>' . esc_html__('Hierarchical', 'baselayer-events') . '</th><td><label><input type="checkbox" name="hierarchical" value="1" ' . checked(!empty($cfg['hierarchical']), true, false) . '> ' . esc_html__('Like pages (parent/child)', 'baselayer-events') . '</label></td></tr>';

	$all_supports = ['title', 'editor', 'thumbnail', 'excerpt', 'revisions', 'page-attributes', 'custom-fields', 'author', 'comments'];
	echo '<tr><th>' . esc_html__('Supports', 'baselayer-events') . '</th><td>';
	foreach ($all_supports as $s) {
		echo '<label style="display:inline-block;margin:0 12px 6px 0"><input type="checkbox" name="supports[]" value="' . esc_attr($s) . '" ' . checked(in_array($s, $supports, true), true, false) . '> ' . esc_html($s) . '</label>';
	}
	echo '</td></tr>';

	echo '<tr><th>' . esc_html__('Menu position', 'baselayer-events') . '</th><td><input type="number" name="menu_position" value="' . esc_attr((string) ((int) ($admin['menu_position'] ?? 5))) . '" class="small-text"></td></tr>';
	echo '<tr><th>' . esc_html__('Menu icon', 'baselayer-events') . '</th><td><textarea class="large-text code" rows="3" name="menu_icon">' . esc_textarea((string) ($admin['menu_icon'] ?? '')) . '</textarea>';
	echo '<p class="description">' . esc_html__('Dashicon class, image URL, or inline SVG.', 'baselayer-events') . '</p></td></tr>';
}

/**
 * @param array<string, mixed> $cfg
 */
function bl_events_settings_archive_fields(array $cfg): void
{
	$archive = is_array($cfg['archive'] ?? null) ? $cfg['archive'] : [];
	$texts = is_array($archive['texts'] ?? null) ? $archive['texts'] : [];
	echo '<tr><th>' . esc_html__('Archive', 'baselayer-events') . '</th><td><label><input type="checkbox" name="archive_enabled" value="1" ' . checked(!empty($archive['enabled']), true, false) . '> ' . esc_html__('Enable archive', 'baselayer-events') . '</label></td></tr>';
	echo '<tr><th>' . esc_html__('Archive slug', 'baselayer-events') . '</th><td><input type="text" class="regular-text" name="archive_slug" value="' . esc_attr((string) ($archive['slug'] ?? '')) . '"></td></tr>';
	echo '<tr><th>' . esc_html__('Design', 'baselayer-events') . '</th><td><select name="archive_design">';
	foreach (['list' => __('List', 'baselayer-events'), 'grid' => __('Grid', 'baselayer-events')] as $k => $lab) {
		echo '<option value="' . esc_attr($k) . '" ' . selected(($archive['design'] ?? 'list') === $k, true, false) . '>' . esc_html($lab) . '</option>';
	}
	echo '</select></td></tr>';
	echo '<tr><th>' . esc_html__('Category filter', 'baselayer-events') . '</th><td><label><input type="checkbox" name="archive_category_filter" value="1" ' . checked(!empty($archive['category_filter']), true, false) . '> ' . esc_html__('Show category filter on archive', 'baselayer-events') . '</label></td></tr>';
	echo '<tr><th>' . esc_html__('Heading', 'baselayer-events') . '</th><td><input type="text" class="regular-text" name="archive_heading" value="' . esc_attr((string) ($texts['heading'] ?? '')) . '"></td></tr>';
	echo '<tr><th>' . esc_html__('Empty text', 'baselayer-events') . '</th><td><input type="text" class="regular-text" name="archive_empty" value="' . esc_attr((string) ($texts['empty'] ?? '')) . '"></td></tr>';
}

/**
 * @param array<string, mixed> $cfg
 */
function bl_events_settings_taxonomies_fields(array $cfg): void
{
	$tax = is_array($cfg['taxonomies'] ?? null) ? $cfg['taxonomies'] : [];
	echo '<tr><td colspan="2"><p class="description">' . esc_html__('Custom taxonomies attached to this type. Leave ID empty on a new row to skip it.', 'baselayer-events') . '</p>';
	echo '<table class="widefat striped" style="max-width:900px"><thead><tr>';
	echo '<th>' . esc_html__('ID', 'baselayer-events') . '</th><th>' . esc_html__('Label', 'baselayer-events') . '</th><th>' . esc_html__('Singular', 'baselayer-events') . '</th><th>' . esc_html__('URL', 'baselayer-events') . '</th>';
	echo '</tr></thead><tbody>';
	$rows = $tax;
	$rows[''] = ['label' => '', 'singular_label' => '', 'url' => ''];
	foreach ($rows as $id => $row) {
		$row = is_array($row) ? $row : [];
		echo '<tr>';
		echo '<td><input type="text" name="tax_id[]" value="' . esc_attr((string) $id) . '" class="regular-text"></td>';
		echo '<td><input type="text" name="tax_label[]" value="' . esc_attr((string) ($row['label'] ?? '')) . '" class="regular-text"></td>';
		echo '<td><input type="text" name="tax_singular[]" value="' . esc_attr((string) ($row['singular_label'] ?? '')) . '" class="regular-text"></td>';
		echo '<td><input type="text" name="tax_url[]" value="' . esc_attr((string) ($row['url'] ?? '')) . '" class="regular-text"></td>';
		echo '</tr>';
	}
	echo '</tbody></table></td></tr>';
}

/**
 * @param array<string, mixed> $cfg
 */
function bl_events_settings_statuses_fields(array $cfg): void
{
	$statuses = is_array($cfg['statuses'] ?? null) ? $cfg['statuses'] : [];
	echo '<tr><td colspan="2"><p class="description">' . esc_html__('Extra statuses beyond built-ins (None, Cancelled, Postponed, Custom). Color: token (warning, success, …) or hex.', 'baselayer-events') . '</p>';
	echo '<table class="widefat striped" style="max-width:720px"><thead><tr>';
	echo '<th>' . esc_html__('ID', 'baselayer-events') . '</th><th>' . esc_html__('Label', 'baselayer-events') . '</th><th>' . esc_html__('Color', 'baselayer-events') . '</th>';
	echo '</tr></thead><tbody>';
	$rows = $statuses;
	$rows[''] = ['label' => '', 'color' => ''];
	foreach ($rows as $id => $row) {
		$row = is_array($row) ? $row : [];
		echo '<tr>';
		echo '<td><input type="text" name="status_id[]" value="' . esc_attr((string) $id) . '" class="regular-text"></td>';
		echo '<td><input type="text" name="status_label[]" value="' . esc_attr((string) ($row['label'] ?? '')) . '" class="regular-text"></td>';
		echo '<td><input type="text" name="status_color[]" value="' . esc_attr((string) ($row['color'] ?? '')) . '" class="regular-text"></td>';
		echo '</tr>';
	}
	echo '</tbody></table></td></tr>';
}

/**
 * @param array<string, mixed> $cfg
 */
function bl_events_settings_meta_fields(array $cfg): void
{
	$meta = is_array($cfg['meta'] ?? null) ? $cfg['meta'] : [];
	$groups = is_array($meta['groups'] ?? null) ? $meta['groups'] : [];
	echo '<tr><th>' . esc_html__('Panel title', 'baselayer-events') . '</th><td><input type="text" class="regular-text" name="meta_title" value="' . esc_attr((string) ($meta['title'] ?? '')) . '"></td></tr>';
	echo '<tr><td colspan="2"><p class="description">' . esc_html__('Groups and fields for the editor metadata panel. Field types: text, textarea, email, url.', 'baselayer-events') . '</p>';

	echo '<h3>' . esc_html__('Groups', 'baselayer-events') . '</h3>';
	echo '<table class="widefat striped" style="max-width:720px;margin-bottom:16px"><thead><tr><th>' . esc_html__('Group ID', 'baselayer-events') . '</th><th>' . esc_html__('Title', 'baselayer-events') . '</th></tr></thead><tbody>';
	$group_rows = $groups;
	$group_rows[''] = ['title' => '', 'fields' => []];
	foreach ($group_rows as $gid => $group) {
		$group = is_array($group) ? $group : [];
		echo '<tr><td><input type="text" name="meta_group_id[]" value="' . esc_attr((string) $gid) . '" class="regular-text"></td>';
		echo '<td><input type="text" name="meta_group_title[]" value="' . esc_attr((string) ($group['title'] ?? '')) . '" class="regular-text"></td></tr>';
	}
	echo '</tbody></table>';

	echo '<h3>' . esc_html__('Fields', 'baselayer-events') . '</h3>';
	echo '<table class="widefat striped" style="max-width:960px"><thead><tr>';
	echo '<th>' . esc_html__('Group ID', 'baselayer-events') . '</th><th>' . esc_html__('Field ID', 'baselayer-events') . '</th><th>' . esc_html__('Label', 'baselayer-events') . '</th><th>' . esc_html__('Type', 'baselayer-events') . '</th>';
	echo '</tr></thead><tbody>';
	$field_rows = [];
	foreach ($groups as $gid => $group) {
		$fields = is_array($group['fields'] ?? null) ? $group['fields'] : [];
		foreach ($fields as $fid => $field) {
			$field_rows[] = [$gid, $fid, $field];
		}
	}
	$field_rows[] = ['', '', ['label' => '', 'type' => 'text']];
	foreach ($field_rows as [$gid, $fid, $field]) {
		$field = is_array($field) ? $field : [];
		$type = (string) ($field['type'] ?? 'text');
		echo '<tr>';
		echo '<td><input type="text" name="meta_field_group[]" value="' . esc_attr((string) $gid) . '" class="regular-text"></td>';
		echo '<td><input type="text" name="meta_field_id[]" value="' . esc_attr((string) $fid) . '" class="regular-text"></td>';
		echo '<td><input type="text" name="meta_field_label[]" value="' . esc_attr((string) ($field['label'] ?? '')) . '" class="regular-text"></td>';
		echo '<td><select name="meta_field_type[]">';
		foreach (['text', 'textarea', 'email', 'url'] as $t) {
			echo '<option value="' . esc_attr($t) . '" ' . selected($type === $t, true, false) . '>' . esc_html($t) . '</option>';
		}
		echo '</select></td></tr>';
	}
	echo '</tbody></table></td></tr>';
}
