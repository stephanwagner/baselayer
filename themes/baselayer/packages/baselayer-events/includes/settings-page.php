<?php

defined('ABSPATH') || exit;

/**
 * Whether the current user may manage event type Settings (developers only).
 */
function bl_events_user_can_manage_settings(): bool
{
	if (!current_user_can('manage_options')) {
		return false;
	}

	if (function_exists('bl_is_developer_user')) {
		return bl_is_developer_user((int) get_current_user_id());
	}

	// Standalone plugin without BaseLayer user-rights: admins may manage.
	return true;
}

/**
 * Settings submenu slug for an event type (or global fallback when empty).
 */
function bl_events_settings_menu_slug(string $instance = ''): string
{
	$instance = sanitize_key($instance);
	if ($instance === '') {
		return 'bl-events-settings';
	}

	return 'bl-events-' . $instance . '-settings';
}

/**
 * Whether the current admin page is an Events settings screen.
 */
function bl_events_is_settings_screen(): bool
{
	$page = isset($_GET['page']) ? sanitize_key(wp_unslash((string) $_GET['page'])) : '';
	if ($page === 'bl-events-settings') {
		return true;
	}

	return (bool) preg_match('/^bl-events-[a-z0-9_-]+-settings$/', $page);
}

/**
 * Settings page admin URL for an event type (under that CPT menu, or Settings when none enabled).
 *
 * @param string|null          $instance Event type slug; null uses args['instance'] or the first available type.
 * @param array<string, mixed> $args     Extra query args (tab, updated, …). `instance` is consumed for the base URL.
 */
function bl_events_settings_url(?string $instance = null, array $args = []): string
{
	$all = bl_events_get_instances(false);
	$enabled = bl_events_get_instances(true);

	if (($instance === null || $instance === '') && isset($args['instance'])) {
		$instance = sanitize_key((string) $args['instance']);
	}
	unset($args['instance']);

	if ($instance === null || $instance === '' || !isset($all[$instance])) {
		$instance = $enabled !== []
			? (string) array_key_first($enabled)
			: ($all !== [] ? (string) array_key_first($all) : '');
	}

	if ($instance !== '' && isset($enabled[$instance])) {
		$base = admin_url(
			'edit.php?post_type=' . rawurlencode($instance)
			. '&page=' . rawurlencode(bl_events_settings_menu_slug($instance))
		);
	} else {
		$base = admin_url('options-general.php?page=bl-events-settings');
		if ($instance !== '') {
			$args['instance'] = $instance;
		}
	}

	if ($args === []) {
		return $base;
	}

	return add_query_arg($args, $base);
}

/**
 * Resolve which event type the current settings screen is for.
 */
function bl_events_current_settings_instance(): string
{
	$all = bl_events_get_instances(false);

	$page = isset($_GET['page']) ? sanitize_key(wp_unslash((string) $_GET['page'])) : '';
	if ($page !== '' && preg_match('/^bl-events-([a-z0-9_-]+)-settings$/', $page, $m)) {
		$from_page = sanitize_key($m[1]);
		if (isset($all[$from_page])) {
			return $from_page;
		}
	}

	$post_type = isset($_GET['post_type']) ? sanitize_key(wp_unslash((string) $_GET['post_type'])) : '';
	if ($post_type !== '' && isset($all[$post_type])) {
		return $post_type;
	}

	$instance = isset($_GET['instance']) ? sanitize_key(wp_unslash((string) $_GET['instance'])) : '';
	if ($instance !== '' && isset($all[$instance])) {
		return $instance;
	}

	return $all !== [] ? (string) array_key_first($all) : '';
}

/**
 * Register Settings under each enabled event type menu (or Settings → Event Settings when none).
 * Visible only to BaseLayer developers.
 */
function bl_events_register_settings_page(): void
{
	if (!bl_events_user_can_manage_settings()) {
		return;
	}

	$enabled = bl_events_get_instances(true);
	if ($enabled === []) {
		add_submenu_page(
			'options-general.php',
			__('Event Settings', 'baselayer-events'),
			__('Event Settings', 'baselayer-events'),
			'manage_options',
			'bl-events-settings',
			'bl_events_render_settings_page'
		);

		return;
	}

	foreach (array_keys($enabled) as $slug) {
		add_submenu_page(
			'edit.php?post_type=' . $slug,
			__('Settings', 'baselayer-events'),
			__('Settings', 'baselayer-events'),
			'manage_options',
			bl_events_settings_menu_slug($slug),
			'bl_events_render_settings_page'
		);
	}
}
add_action('admin_menu', 'bl_events_register_settings_page', 30);

/**
 * Block direct access / POSTs to event type Settings for non-developers.
 */
function bl_events_settings_access_guard(): void
{
	if (!is_admin() || !bl_events_is_settings_screen()) {
		return;
	}

	if (bl_events_user_can_manage_settings()) {
		return;
	}

	wp_die(esc_html__('You do not have permission to manage event type settings.', 'baselayer-events'), 403);
}
add_action('admin_init', 'bl_events_settings_access_guard', 1);

/**
 * Handle POST saves before output.
 */
function bl_events_handle_settings_post(): void
{
	if (!is_admin() || !bl_events_user_can_manage_settings()) {
		return;
	}
	if (!isset($_POST['bl_events_settings_action'])) {
		return;
	}
	check_admin_referer('bl_events_settings');

	$action = sanitize_key(wp_unslash((string) $_POST['bl_events_settings_action']));

	if ($action === 'add') {
		bl_events_process_add_type();
	}

	if ($action === 'delete') {
		bl_events_process_delete_type();
	}

	if ($action === 'save') {
		bl_events_process_save_settings();
	}
}
add_action('admin_init', 'bl_events_handle_settings_post');

/**
 * admin-post.php entry for Add type (dialog forms).
 */
function bl_events_admin_post_add_type(): void
{
	if (!bl_events_user_can_manage_settings()) {
		wp_die(esc_html__('You do not have permission to manage event types.', 'baselayer-events'), 403);
	}
	check_admin_referer('bl_events_settings');
	bl_events_process_add_type();
}
add_action('admin_post_bl_events_add_type', 'bl_events_admin_post_add_type');

/**
 * admin-post.php entry for Delete type (dialog forms).
 */
function bl_events_admin_post_delete_type(): void
{
	if (!bl_events_user_can_manage_settings()) {
		wp_die(esc_html__('You do not have permission to manage event types.', 'baselayer-events'), 403);
	}
	check_admin_referer('bl_events_settings');
	bl_events_process_delete_type();
}
add_action('admin_post_bl_events_delete_type', 'bl_events_admin_post_delete_type');

/**
 * Create a new event type and redirect to its Settings page.
 */
function bl_events_process_add_type(): void
{
	$instances = bl_events_get_instances(false);
	$base = isset($_POST['new_slug']) ? sanitize_key(wp_unslash((string) $_POST['new_slug'])) : 'event';
	$slug = bl_events_unique_slug($base !== '' ? $base : 'event');
	$def = bl_events_default_instance_definition();
	$def['type'] = 'event';
	$def['enabled'] = true;
	$def['labels'] = [
		'name' => ucfirst(str_replace(['-', '_'], ' ', $slug)) . 's',
		'singular_name' => ucfirst(str_replace(['-', '_'], ' ', $slug)),
		'menu_name' => '',
	];
	$def['labels']['menu_name'] = $def['labels']['name'];
	if (!isset($def['archive']) || !is_array($def['archive'])) {
		$def['archive'] = [];
	}
	$def['archive']['slug'] = sanitize_title($slug . 's');
	$instances[$slug] = $def;
	bl_events_save_instances($instances);

	wp_safe_redirect(bl_events_settings_url($slug, ['created' => '1']));
	exit;
}

/**
 * Delete an event type and redirect to another type’s Settings.
 */
function bl_events_process_delete_type(): void
{
	$instances = bl_events_get_instances(false);
	$slug = isset($_POST['instance']) ? sanitize_key(wp_unslash((string) $_POST['instance'])) : '';
	if ($slug !== '' && isset($instances[$slug]) && count($instances) > 1) {
		unset($instances[$slug]);
		bl_events_save_instances($instances);
	}
	$next = $instances !== [] ? (string) array_key_first($instances) : '';
	wp_safe_redirect($next !== '' ? bl_events_settings_url($next, ['updated' => '1']) : bl_events_settings_url(null, ['updated' => '1']));
	exit;
}

/**
 * Save the current type’s settings tab.
 */
function bl_events_process_save_settings(): void
{
	$instances = bl_events_get_instances(false);
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

	// If this type was disabled, its CPT menu is gone — land on another enabled type when possible.
	$target = $slug;
	if (empty($instances[$slug]['enabled'])) {
		$enabled = array_keys(array_filter($instances, static function ($row) {
			return is_array($row) && !empty($row['enabled']);
		}));
		$target = $enabled !== [] ? (string) $enabled[0] : $slug;
	}

	wp_safe_redirect(bl_events_settings_url($target, ['tab' => $tab, 'updated' => '1']));
	exit;
}

/**
 * @param array<string, mixed> $cfg
 * @param array<string, mixed> $post
 * @return array<string, mixed>
 */
function bl_events_apply_settings_tab(array $cfg, string $tab, array $post): array
{
	if ($tab === 'general') {
		$cfg['enabled'] = !empty($post['enabled']);
		$cfg['labels'] = [
			'name' => sanitize_text_field((string) ($post['label_name'] ?? '')),
			'singular_name' => sanitize_text_field((string) ($post['label_singular'] ?? '')),
			'menu_name' => sanitize_text_field((string) ($post['label_menu'] ?? '')),
		];
		$cfg['admin'] = [
			'menu_icon' => (string) ($post['menu_icon'] ?? ''),
			'menu_position' => (int) ($post['menu_position'] ?? 5),
			'page_title_toggle' => !empty($post['page_title_toggle']),
		];
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

	if ($tab === 'statuses') {
		if (!empty($post['statuses_config_json']) && is_string($post['statuses_config_json'])) {
			$decoded = json_decode(wp_unslash($post['statuses_config_json']), true);
			$cfg['statuses'] = bl_events_sanitize_statuses(is_array($decoded) ? $decoded : []);
		} else {
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
			$cfg['statuses'] = bl_events_sanitize_statuses($statuses);
		}
	}

	if ($tab === 'meta') {
		if (!empty($post['meta_config_json']) && is_string($post['meta_config_json'])) {
			$decoded = json_decode(wp_unslash($post['meta_config_json']), true);
			$cfg['meta'] = bl_events_sanitize_meta_config(is_array($decoded) ? $decoded : []);
		} else {
			$cfg['meta'] = bl_events_sanitize_meta_config([
				'title' => sanitize_text_field((string) ($post['meta_title'] ?? '')),
				'groups' => bl_events_parse_meta_groups_from_post($post),
			]);
		}
		$cfg['meta']['enabled'] = !empty($post['meta_enabled']);
	}

	return $cfg;
}

/**
 * Parse metadata groups from settings POST (JSON builder payload preferred).
 *
 * @param array<string, mixed> $post
 * @return array<string, array{title: string, fields: array<string, array<string, mixed>>}>
 */
function bl_events_parse_meta_groups_from_post(array $post): array
{
	if (!empty($post['meta_config_json']) && is_string($post['meta_config_json'])) {
		$decoded = json_decode(wp_unslash($post['meta_config_json']), true);
		if (is_array($decoded)) {
			$sanitized = bl_events_sanitize_meta_config($decoded);

			return $sanitized['groups'];
		}
	}

	// Legacy parallel arrays (pre-builder).
	$group_ids = isset($post['meta_group_id']) && is_array($post['meta_group_id']) ? $post['meta_group_id'] : [];
	$group_titles = isset($post['meta_group_title']) && is_array($post['meta_group_title']) ? $post['meta_group_title'] : [];
	$field_group = isset($post['meta_field_group']) && is_array($post['meta_field_group']) ? $post['meta_field_group'] : [];
	$field_ids = isset($post['meta_field_id']) && is_array($post['meta_field_id']) ? $post['meta_field_id'] : [];
	$field_labels = isset($post['meta_field_label']) && is_array($post['meta_field_label']) ? $post['meta_field_label'] : [];
	$field_types = isset($post['meta_field_type']) && is_array($post['meta_field_type']) ? $post['meta_field_type'] : [];
	$allowed = bl_events_meta_field_types();

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
		if (!in_array($type, $allowed, true)) {
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
	if (!bl_events_user_can_manage_settings()) {
		wp_die(esc_html__('You do not have permission to manage event type settings.', 'baselayer-events'), 403);
	}

	$instances = bl_events_get_instances(false);
	$instance = bl_events_current_settings_instance();
	$tab = isset($_GET['tab']) ? sanitize_key(wp_unslash((string) $_GET['tab'])) : 'general';
	$tabs = [
		'general' => __('General', 'baselayer-events'),
		'archive' => __('Archive', 'baselayer-events'),
		'statuses' => __('Statuses', 'baselayer-events'),
		'meta' => __('Metadata', 'baselayer-events'),
	];
	if (!isset($tabs[$tab])) {
		$tab = 'general';
	}
	$cfg = $instance !== '' && isset($instances[$instance]) ? $instances[$instance] : null;

	echo '<div class="wrap bl-events-settings">';
	echo '<h1>' . esc_html__('Settings', 'baselayer-events') . '</h1>';
	if (!empty($_GET['created'])) {
		echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Event type created.', 'baselayer-events') . '</p></div>';
	} elseif (!empty($_GET['updated'])) {
		echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__('Settings saved.', 'baselayer-events') . '</p></div>';
	}

	$instance_label = '';
	if (is_array($cfg)) {
		$instance_label = !empty($cfg['labels']['name']) ? (string) $cfg['labels']['name'] : $instance;
	}
	$can_delete = count($instances) > 1 && $instance !== '';

	echo '<div class="bl-events-settings__toolbar">';
	echo '<p class="bl-events-settings__toolbar-desc description">' . esc_html__('Labels, archive, statuses, and metadata for this event type. Use Add type to create another post type (for example Courses or Workshops).', 'baselayer-events') . '</p>';
	echo '<div class="bl-events-settings__toolbar-actions">';
	echo '<button type="button" class="button bl-button-small" data-bl-events-dialog-open="bl-events-dialog-add">' . esc_html__('Add type', 'baselayer-events') . '</button>';
	echo '<button type="button" class="button bl-button-small bl-button-danger" data-bl-events-dialog-open="bl-events-dialog-delete"' . ($can_delete ? '' : ' disabled') . '>' . esc_html__('Delete', 'baselayer-events') . '</button>';
	echo '</div>';
	echo '</div>';

	if (!is_array($cfg) || $instance === '') {
		echo '<p>' . esc_html__('No event types yet.', 'baselayer-events') . '</p>';
		bl_events_settings_render_type_dialogs($instance, $instance_label, $can_delete);
		echo '</div>';
		return;
	}

	echo '<h2 class="nav-tab-wrapper">';
	foreach ($tabs as $key => $label) {
		$url = bl_events_settings_url($instance, ['tab' => $key]);
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
	} elseif ($tab === 'statuses') {
		bl_events_settings_statuses_fields($cfg);
	} else {
		bl_events_settings_meta_fields($cfg);
	}
	echo '</tbody></table>';

	submit_button(__('Save changes', 'baselayer-events'));
	echo '</form>';

	bl_events_settings_render_type_dialogs($instance, $instance_label, $can_delete);

	echo '</div>';
}

/**
 * Add / delete event type dialogs + open/close script.
 */
function bl_events_settings_render_type_dialogs(string $instance, string $instance_label, bool $can_delete): void
{
	$post_url = admin_url('admin-post.php');

	echo '<dialog id="bl-events-dialog-add" class="bl-events-settings-dialog">';
	echo '<form method="post" action="' . esc_url($post_url) . '" class="bl-events-settings-dialog__form">';
	wp_nonce_field('bl_events_settings');
	echo '<input type="hidden" name="action" value="bl_events_add_type">';
	echo '<div class="bl-events-settings-dialog__header">';
	echo '<h2 class="bl-events-settings-dialog__title">' . esc_html__('Add event type', 'baselayer-events') . '</h2>';
	echo '</div>';
	echo '<div class="bl-events-settings-dialog__body">';
	echo '<p class="description">' . esc_html__('Creates a new post type with default labels and archive. Each type gets its own categories (separate from Posts). You can rename it after saving.', 'baselayer-events') . '</p>';
	echo '<p><label for="bl-events-new-slug"><strong>' . esc_html__('Slug', 'baselayer-events') . '</strong></label><br>';
	echo '<input type="text" class="regular-text" id="bl-events-new-slug" name="new_slug" placeholder="course" pattern="[a-z0-9_\\-]+" required autocomplete="off">';
	echo '<span class="description">' . esc_html__('Lowercase letters, numbers, hyphens, and underscores. Used as the post type key.', 'baselayer-events') . '</span></p>';
	echo '</div>';
	echo '<div class="bl-events-settings-dialog__footer">';
	echo '<button type="button" class="button" data-bl-events-dialog-close>' . esc_html__('Cancel', 'baselayer-events') . '</button>';
	echo '<button type="submit" class="button button-primary">' . esc_html__('Add type', 'baselayer-events') . '</button>';
	echo '</div>';
	echo '</form>';
	echo '</dialog>';

	echo '<dialog id="bl-events-dialog-delete" class="bl-events-settings-dialog">';
	echo '<form method="post" action="' . esc_url($post_url) . '" class="bl-events-settings-dialog__form">';
	wp_nonce_field('bl_events_settings');
	echo '<input type="hidden" name="action" value="bl_events_delete_type">';
	echo '<input type="hidden" name="instance" value="' . esc_attr($instance) . '">';
	echo '<div class="bl-events-settings-dialog__header">';
	echo '<h2 class="bl-events-settings-dialog__title">' . esc_html__('Delete event type', 'baselayer-events') . '</h2>';
	echo '</div>';
	echo '<div class="bl-events-settings-dialog__body">';
	if ($can_delete) {
		echo '<p>' . esc_html(
			sprintf(
				/* translators: %s: event type name */
				__('Delete “%s”? This removes the post type from Events. Existing posts are not deleted.', 'baselayer-events'),
				$instance_label !== '' ? $instance_label : $instance
			)
		) . '</p>';
	} else {
		echo '<p>' . esc_html__('You need at least one event type. Add another type before deleting this one.', 'baselayer-events') . '</p>';
	}
	echo '</div>';
	echo '<div class="bl-events-settings-dialog__footer">';
	echo '<button type="button" class="button" data-bl-events-dialog-close>' . esc_html__('Cancel', 'baselayer-events') . '</button>';
	if ($can_delete) {
		echo '<button type="submit" class="button bl-button-danger">' . esc_html__('Delete type', 'baselayer-events') . '</button>';
	}
	echo '</div>';
	echo '</form>';
	echo '</dialog>';

	echo '<script>';
	echo '(function(){';
	echo 'document.querySelectorAll("[data-bl-events-dialog-open]").forEach(function(btn){btn.addEventListener("click",function(){var id=btn.getAttribute("data-bl-events-dialog-open");var el=id&&document.getElementById(id);if(el&&typeof el.showModal==="function"){el.showModal();var input=el.querySelector("input[name=new_slug]");if(input){input.focus();}}});});';
	echo 'document.querySelectorAll("[data-bl-events-dialog-close]").forEach(function(btn){btn.addEventListener("click",function(){var d=btn.closest("dialog");if(d&&typeof d.close==="function"){d.close();}});});';
	echo '})();';
	echo '</script>';
}

/**
 * @param array<string, mixed> $cfg
 */
function bl_events_settings_general_fields(string $slug, array $cfg): void
{
	$labels = is_array($cfg['labels'] ?? null) ? $cfg['labels'] : [];
	$admin = is_array($cfg['admin'] ?? null) ? $cfg['admin'] : [];

	echo '<tr><th>' . esc_html__('Slug', 'baselayer-events') . '</th><td><code>' . esc_html($slug) . '</code>';
	echo '<p class="description">' . esc_html__('Immutable after creation (post type key).', 'baselayer-events') . '</p></td></tr>';

	echo '<tr><th>' . esc_html__('Enabled', 'baselayer-events') . '</th><td>';
	echo '<label><input type="checkbox" name="enabled" value="1" ' . checked(!empty($cfg['enabled']), true, false) . '> ' . esc_html__('Register and show this type', 'baselayer-events') . '</label></td></tr>';

	echo '<tr><th>' . esc_html__('Plural name', 'baselayer-events') . '</th><td><input type="text" class="regular-text" name="label_name" value="' . esc_attr((string) ($labels['name'] ?? '')) . '"></td></tr>';
	echo '<tr><th>' . esc_html__('Singular name', 'baselayer-events') . '</th><td><input type="text" class="regular-text" name="label_singular" value="' . esc_attr((string) ($labels['singular_name'] ?? '')) . '"></td></tr>';
	echo '<tr><th>' . esc_html__('Menu name', 'baselayer-events') . '</th><td><input type="text" class="regular-text" name="label_menu" value="' . esc_attr((string) ($labels['menu_name'] ?? '')) . '"></td></tr>';

	echo '<tr><th>' . esc_html__('Menu position', 'baselayer-events') . '</th><td><input type="number" name="menu_position" value="' . esc_attr((string) ((int) ($admin['menu_position'] ?? 5))) . '" class="small-text"></td></tr>';

	$menu_icon = (string) ($admin['menu_icon'] ?? '');
	$is_svg = $menu_icon !== '' && stripos($menu_icon, '<svg') !== false;
	$has_picker = function_exists('bl_events_has_theme_icon_picker') && bl_events_has_theme_icon_picker();
	// Standalone plugin: catalog names are not usable — fall back to default SVG for the editor.
	if (!$has_picker && $menu_icon !== '' && !$is_svg) {
		$menu_icon = function_exists('bl_events_default_menu_icon_svg') ? bl_events_default_menu_icon_svg() : '';
		$is_svg = $menu_icon !== '';
	}
	if (!$has_picker && $menu_icon === '' && function_exists('bl_events_default_menu_icon_svg')) {
		$menu_icon = bl_events_default_menu_icon_svg();
		$is_svg = true;
	}

	echo '<tr><th>' . esc_html__('Menu icon', 'baselayer-events') . '</th><td>';
	echo '<div class="bl-events-menu-icon-field" data-bl-events-menu-icon-field data-bl-events-menu-icon-mode="' . esc_attr($has_picker ? 'picker' : 'svg') . '">';

	if ($has_picker) {
		echo '<input type="hidden" name="menu_icon" value="' . esc_attr($menu_icon) . '" data-bl-events-menu-icon-value>';
		echo '<div class="bl-events-menu-icon-field__row">';
		echo '<div class="bl-events-menu-icon-field__preview" data-bl-events-menu-icon-preview' . ($menu_icon === '' ? ' hidden' : '') . '>';
		if ($is_svg) {
			echo '<span class="bl-events-menu-icon-field__svg">' . $menu_icon . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted admin SVG from settings
		} elseif ($menu_icon !== '') {
			echo '<span class="bl-icon -icon-' . esc_attr(preg_replace('/[^a-z0-9_-]/i', '', $menu_icon) ?: 'calendar-month') . '" aria-hidden="true"></span>';
		}
		echo '</div>';
		echo '<span class="bl-events-menu-icon-field__empty description" data-bl-events-menu-icon-empty' . ($menu_icon !== '' ? ' hidden' : '') . '>' . esc_html__('No icon selected', 'baselayer-events') . '</span>';
		echo '<div class="bl-events-menu-icon-field__actions">';
		echo '<button type="button" class="button bl-button-small" data-bl-events-menu-icon-choose>' . esc_html__('Choose icon', 'baselayer-events') . '</button>';
		echo '<button type="button" class="button bl-button-small" data-bl-events-menu-icon-svg-toggle aria-expanded="' . ($is_svg ? 'true' : 'false') . '">' . esc_html__('SVG code', 'baselayer-events') . '</button>';
		echo '<button type="button" class="button bl-button-small" data-bl-events-menu-icon-clear>' . esc_html__('Clear', 'baselayer-events') . '</button>';
		echo '</div>';
		echo '</div>';
		echo '<div class="bl-events-menu-icon-field__svg-panel" data-bl-events-menu-icon-svg-panel' . ($is_svg ? '' : ' hidden') . '>';
		echo '<label class="screen-reader-text" for="bl-events-menu-icon-svg">' . esc_html__('Custom SVG code', 'baselayer-events') . '</label>';
		echo '<textarea class="large-text code" rows="4" id="bl-events-menu-icon-svg" data-bl-events-menu-icon-svg placeholder="<svg …">' . esc_textarea($is_svg ? $menu_icon : '') . '</textarea>';
		echo '<p class="description">' . esc_html__('Paste inline SVG to use a custom menu icon instead of a catalog icon.', 'baselayer-events') . '</p>';
		echo '</div>';
	} else {
		echo '<div class="bl-events-menu-icon-field__row">';
		echo '<div class="bl-events-menu-icon-field__preview" data-bl-events-menu-icon-preview' . ($menu_icon === '' ? ' hidden' : '') . '>';
		if ($is_svg) {
			echo '<span class="bl-events-menu-icon-field__svg">' . $menu_icon . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- trusted admin SVG from settings
		}
		echo '</div>';
		echo '<span class="bl-events-menu-icon-field__empty description" data-bl-events-menu-icon-empty' . ($menu_icon !== '' ? ' hidden' : '') . '>' . esc_html__('No icon selected', 'baselayer-events') . '</span>';
		echo '<div class="bl-events-menu-icon-field__actions">';
		echo '<button type="button" class="button bl-button-small" data-bl-events-menu-icon-clear>' . esc_html__('Clear', 'baselayer-events') . '</button>';
		echo '</div>';
		echo '</div>';
		echo '<div class="bl-events-menu-icon-field__svg-panel" data-bl-events-menu-icon-svg-panel>';
		echo '<label for="bl-events-menu-icon-svg"><strong>' . esc_html__('SVG code', 'baselayer-events') . '</strong></label><br>';
		echo '<textarea class="large-text code" rows="5" id="bl-events-menu-icon-svg" name="menu_icon" data-bl-events-menu-icon-svg data-bl-events-menu-icon-value placeholder="<svg …">' . esc_textarea($is_svg ? $menu_icon : '') . '</textarea>';
		echo '<p class="description">' . wp_kses(
			sprintf(
				/* translators: %s: Material Icons URL */
				__('Paste inline SVG for the admin menu icon. Browse icons at <a href="%s" target="_blank" rel="noopener noreferrer">Material Icons (Rounded)</a>, open an icon, then copy the SVG.', 'baselayer-events'),
				'https://fonts.google.com/icons?icon.style=Rounded'
			),
			[
				'a' => [
					'href' => true,
					'target' => true,
					'rel' => true,
				],
			]
		) . '</p>';
		echo '</div>';
	}

	echo '</div>';
	echo '</td></tr>';
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
function bl_events_settings_statuses_fields(array $cfg): void
{
	$statuses = is_array($cfg['statuses'] ?? null) ? $cfg['statuses'] : [];
	$json = wp_json_encode($statuses, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
	if (!is_string($json)) {
		$json = '{}';
	}

	echo '<tr><td colspan="2">';
	echo '<p class="description">' . esc_html__('Statuses shown in the event editor (in addition to None and Custom). Drag to reorder. Choose a theme color token or a custom hex color.', 'baselayer-events') . '</p>';
	echo '<div data-bl-events-statuses-builder class="bl-events-statuses-builder"></div>';
	echo '<input type="hidden" name="statuses_config_json" id="bl-events-statuses-config-json" value="' . esc_attr($json) . '">';
	echo '</td></tr>';
}

/**
 * @param array<string, mixed> $cfg
 */
function bl_events_settings_meta_fields(array $cfg): void
{
	$meta = is_array($cfg['meta'] ?? null) ? $cfg['meta'] : [];
	$enabled = !array_key_exists('enabled', $meta) || !empty($meta['enabled']);
	$payload = [
		'title' => (string) ($meta['title'] ?? ''),
		'groups' => is_array($meta['groups'] ?? null) ? $meta['groups'] : [],
	];
	$json = wp_json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
	if (!is_string($json)) {
		$json = '{"title":"","groups":{}}';
	}

	echo '<tr><th>' . esc_html__('Enable metadata', 'baselayer-events') . '</th><td>';
	echo '<label><input type="checkbox" name="meta_enabled" value="1" ' . checked($enabled, true, false) . '> ' . esc_html__('Show the metadata panel in the editor and on the front end', 'baselayer-events') . '</label>';
	echo '<p class="description">' . esc_html__('When off, saved field definitions are kept but the panel is hidden.', 'baselayer-events') . '</p>';
	echo '</td></tr>';

	echo '<tr><td colspan="2">';
	echo '<p class="description">' . esc_html__('Build metadata groups and fields for the editor panel. Drag to reorder. Field types: text, textarea, number, email, phone, url, select.', 'baselayer-events') . '</p>';
	echo '<div data-bl-events-meta-builder class="bl-events-meta-builder"></div>';
	echo '<input type="hidden" name="meta_config_json" id="bl-events-meta-config-json" value="' . esc_attr($json) . '">';
	echo '</td></tr>';
}
