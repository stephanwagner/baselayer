<?php

defined('ABSPATH') || exit;

/** User meta key for the developer flag */
const BL_USER_META_DEVELOPER = 'baselayer_developer';

/**
 * Whether a user has the Administrator role.
 *
 * @param int $user_id User ID.
 * @return bool
 */
function bl_user_is_administrator(int $user_id): bool
{
  $user = get_userdata($user_id);
  if (!$user || !isset($user->roles) || !is_array($user->roles)) {
    return false;
  }
  return in_array('administrator', $user->roles, true);
}

/**
 * Whether a user has developer rights (and is an administrator; only admins can be developers).
 *
 * @param int $user_id User ID.
 * @return bool
 */
function bl_is_developer_user(int $user_id): bool
{
  if (!bl_user_is_administrator($user_id)) {
    return false;
  }
  return (string) get_user_meta($user_id, BL_USER_META_DEVELOPER, true) === '1';
}

/**
 * User IDs of all users who have developer rights (only administrators, only existing users).
 *
 * @return int[]
 */
function bl_get_developer_user_ids(): array
{
  global $wpdb;
  $ids = $wpdb->get_col($wpdb->prepare(
    "SELECT um.user_id FROM {$wpdb->usermeta} um
    INNER JOIN {$wpdb->users} u ON u.ID = um.user_id
    WHERE um.meta_key = %s AND um.meta_value = %s",
    BL_USER_META_DEVELOPER,
    '1'
  ));
  $ids = array_map('intval', (array) $ids);
  return array_values(array_filter($ids, 'bl_user_is_administrator'));
}

/**
 * Whether removing developer rights from this user would leave zero developers.
 *
 * @param int $user_id User ID that would lose developer rights.
 * @return bool
 */
function bl_is_last_developer(int $user_id): bool
{
  $developer_ids = bl_get_developer_user_ids();
  return count($developer_ids) === 1 && in_array($user_id, $developer_ids, true);
}

/**
 * Show Developer section only when the current user is a developer (so only they can set developer rights).
 */
add_action('show_user_profile', 'bl_developer_user_profile_section', 12);
add_action('edit_user_profile', 'bl_developer_user_profile_section', 12);

function bl_developer_user_profile_section(WP_User $user): void
{
  if (!current_user_can('edit_users')) {
    return;
  }
  if (!bl_is_developer_user((int) get_current_user_id())) {
    return;
  }
  if (!bl_user_is_administrator((int) $user->ID)) {
    return;
  }
  $edited_id = (int) $user->ID;
  $checked = bl_is_developer_user($edited_id) ? ' checked' : '';
  $is_last = bl_is_last_developer($edited_id);
  $disabled = $is_last ? ' disabled' : '';
  ?>
  <h2><?= esc_html__('Developer', 'baselayer') ?></h2>
  <table class="form-table" role="presentation">
    <tr>
      <th scope="row"><?= esc_html__('Developer rights', 'baselayer') ?></th>
      <td>
        <label>
          <input type="checkbox" name="baselayer_developer" value="1"<?= $checked ?><?= $disabled ?>>
          <?= esc_html__('This user has developer rights', 'baselayer') ?>
        </label>
        <?php if ($is_last) { ?>
          <input type="hidden" name="baselayer_developer" value="1">
          <p class="description"><?= esc_html__('At least one user must have developer rights. Add another developer before removing yours.', 'baselayer') ?></p>
        <?php } ?>
      </td>
    </tr>
  </table>
  <?php
}

/**
 * In the Users list, show "Developer" instead of the role name (e.g. Administrator) when the user has developer rights.
 */
add_filter('get_role_list', function (array $role_list, WP_User $user): array {
  if (!bl_user_is_administrator((int) $user->ID)) {
    return $role_list;
  }
  if ((string) get_user_meta($user->ID, BL_USER_META_DEVELOPER, true) !== '1') {
    return $role_list;
  }
  $developer_label = __('Developer', 'baselayer');
  return array_combine(array_keys($role_list), array_fill(0, count($role_list), $developer_label));
}, 10, 2);

/**
 * Save Developer checkbox. Only developers can change it; never allow removing the last developer.
 */
add_action('personal_options_update', 'bl_developer_user_profile_update');
add_action('edit_user_profile_update', 'bl_developer_user_profile_update');

function bl_developer_user_profile_update(int $user_id): void
{
  if (!current_user_can('edit_users')) {
    return;
  }
  if (!bl_is_developer_user((int) get_current_user_id())) {
    return;
  }
  $user = get_userdata($user_id);
  if (!$user) {
    return;
  }
  if (!bl_user_is_administrator($user_id)) {
    delete_user_meta($user_id, BL_USER_META_DEVELOPER);
    return;
  }
  if (bl_is_last_developer($user_id)) {
    return;
  }
  if (isset($_POST['baselayer_developer']) && $_POST['baselayer_developer'] === '1') {
    update_user_meta($user_id, BL_USER_META_DEVELOPER, '1');
  } else {
    delete_user_meta($user_id, BL_USER_META_DEVELOPER);
  }
}

/**
 * Default admin access: who can see which admin pages. Keys match Settings → Theme → Developer → User rights.
 *
 * @return array<string, array{admin: int, developer: int}>
 */
function bl_admin_access_defaults(): array
{
  return [
    'plugins' => ['admin' => 0, 'developer' => 1],
    'options_general' => ['admin' => 1, 'developer' => 1],
    'options_writing' => ['admin' => 0, 'developer' => 1],
    'options_reading' => ['admin' => 0, 'developer' => 1],
    'options_media' => ['admin' => 0, 'developer' => 1],
    'options_permalink' => ['admin' => 0, 'developer' => 1],
    'options_connectors' => ['admin' => 1, 'developer' => 1],
    'options_privacy' => ['admin' => 1, 'developer' => 1],
    'tools' => ['admin' => 0, 'developer' => 1],
    'themes' => ['admin' => 0, 'developer' => 1],
    'theme_settings_general' => ['admin' => 1, 'developer' => 1],
    'theme_settings_blocks' => ['admin' => 0, 'developer' => 1],
    'theme_settings_css' => ['admin' => 0, 'developer' => 1],
    'theme_settings_redirects' => ['admin' => 1, 'developer' => 1],
  ];
}

/**
 * Whether the current user (admin or developer) is allowed to access the given item.
 *
 * @param string $item Key from bl_admin_access_defaults(), e.g. 'plugins', 'options_reading'.
 * @return bool
 */
function bl_admin_can_access(string $item): bool
{
  if (!function_exists('bl_setup_completed') || !bl_setup_completed()) {
    return true;
  }
  $access = get_option('baselayer_admin_access', bl_admin_access_defaults());
  if (!is_array($access) || !isset($access[$item]) || !is_array($access[$item])) {
    $defaults = bl_admin_access_defaults();
    $access = isset($defaults[$item]) ? $defaults[$item] : ['admin' => 0, 'developer' => 1];
  } else {
    $access = $access[$item];
  }
  $is_dev = bl_is_developer_user((int) get_current_user_id());
  $key = $is_dev ? 'developer' : 'admin';
  return !empty($access[$key]);
}

/**
 * Restrict admin by developer-toggled access. Block direct load when access is disabled.
 */
add_action('admin_init', function () {
  if (!is_user_logged_in() || !function_exists('bl_setup_completed') || !bl_setup_completed()) {
    return;
  }
  if (defined('DOING_AJAX') && DOING_AJAX) {
    return;
  }
  global $pagenow;
  $item = null;
  if ($pagenow === 'plugins.php') {
    $item = 'plugins';
  } elseif ($pagenow === 'tools.php') {
    $item = 'tools';
  } elseif (in_array($pagenow, ['themes.php', 'site-editor.php', 'theme-editor.php'], true)) {
    $item = 'themes';
  } elseif ($pagenow === 'options-general.php') {
    $page = isset($_GET['page']) ? sanitize_text_field(wp_unslash($_GET['page'])) : '';
    $map = [
      '' => 'options_general',
      'options-general.php' => 'options_general',
      'options-writing.php' => 'options_writing',
      'options-reading.php' => 'options_reading',
      'options-media.php' => 'options_media',
      'options-permalink.php' => 'options_permalink',
      'options-connectors.php' => 'options_connectors',
      'options-privacy.php' => 'options_privacy',
    ];
    $item = isset($map[$page]) ? $map[$page] : 'options_general';
  }
  if ($item !== null && !bl_admin_can_access($item)) {
    wp_safe_redirect(admin_url());
    exit;
  }
}, 20);

add_action('admin_menu', function () {
  if (!function_exists('bl_setup_completed') || !bl_setup_completed()) {
    return;
  }

  global $menu, $submenu;

  // Non-admins: hide Settings, Design (themes), Menus, and Tools entirely.
  if (!current_user_can('manage_options')) {
    remove_menu_page('options-general.php');
    if (isset($submenu['options-general.php'])) {
      unset($submenu['options-general.php']);
    }
    remove_submenu_page('themes.php', 'nav-menus.php');
    remove_menu_page('themes.php');
    if (isset($submenu['themes.php'])) {
      unset($submenu['themes.php']);
    }
    remove_menu_page('tools.php');
    if (isset($submenu['tools.php'])) {
      unset($submenu['tools.php']);
    }
    // WordPress may keep parent visible when submenu exists; remove from $menu directly.
    if (is_array($menu)) {
      foreach ($menu as $i => $item) {
        if (isset($item[2]) && in_array($item[2], ['options-general.php', 'themes.php', 'tools.php'], true)) {
          unset($menu[$i]);
        }
      }
    }
    return;
  }

  // Admins only: Menus lives under Settings (not Appearance); order is finalized in bl_reorder_settings_submenu().
  remove_submenu_page('themes.php', 'nav-menus.php');
  add_submenu_page(
    'options-general.php',
    __('Menus'),
    __('Menus'),
    'edit_theme_options',
    'nav-menus.php'
  );

  if (!is_user_logged_in()) {
    return;
  }
  if (!bl_admin_can_access('tools')) {
    remove_menu_page('tools.php');
  }
  if (!bl_admin_can_access('plugins')) {
    remove_menu_page('plugins.php');
  }
  if (!bl_admin_can_access('themes')) {
    remove_menu_page('themes.php');
  }
  if (!bl_admin_can_access('options_general')) {
    remove_submenu_page('options-general.php', 'options-general.php');
  }
  if (!bl_admin_can_access('options_reading')) {
    remove_submenu_page('options-general.php', 'options-reading.php');
  }
  if (!bl_admin_can_access('options_writing')) {
    remove_submenu_page('options-general.php', 'options-writing.php');
  }
  if (!bl_admin_can_access('options_media')) {
    remove_submenu_page('options-general.php', 'options-media.php');
  }
  if (!bl_admin_can_access('options_permalink')) {
    remove_submenu_page('options-general.php', 'options-permalink.php');
  }
  if (!bl_admin_can_access('options_connectors')) {
    remove_submenu_page('options-general.php', 'options-connectors.php');
  }
  if (!bl_admin_can_access('options_privacy')) {
    remove_submenu_page('options-general.php', 'options-privacy.php');
  }
}, 30);

/**
 * Settings submenu order: General → Menus → Theme → Developer → everything else (stable).
 */
add_action('admin_menu', function (): void {
  if (!function_exists('bl_setup_completed') || !bl_setup_completed()) {
    return;
  }
  if (!current_user_can('manage_options')) {
    return;
  }
  global $submenu;
  if (!isset($submenu['options-general.php']) || !is_array($submenu['options-general.php'])) {
    return;
  }
  $items = array_values($submenu['options-general.php']);
  $pick = [
    'general' => null,
    'menus' => null,
    'theme' => null,
    'developer' => null,
  ];
  $rest = [];
  foreach ($items as $item) {
    $slug = isset($item[2]) ? (string) $item[2] : '';
    if ($slug === 'options-general.php') {
      $pick['general'] = $item;
      continue;
    }
    if ($slug === 'nav-menus.php' || str_contains($slug, 'nav-menus.php')) {
      $pick['menus'] = $item;
      continue;
    }
    if ($slug === 'fs-theme-settings') {
      $pick['theme'] = $item;
      continue;
    }
    if ($slug === 'fs-developer-system') {
      $pick['developer'] = $item;
      continue;
    }
    $rest[] = $item;
  }
  $ordered = [];
  foreach (['general', 'menus', 'theme', 'developer'] as $key) {
    if ($pick[$key] !== null) {
      $ordered[] = $pick[$key];
    }
  }
  $submenu['options-general.php'] = array_merge($ordered, $rest);
}, 999);

/**
 * When Design (Themes) menu is disabled for the user, add no-customize-support so
 * elements with class hide-if-no-customize (e.g. "Manage with live preview") are hidden.
 */
add_filter('admin_body_class', function (string $classes): string {
  if (!function_exists('bl_admin_can_access') || bl_admin_can_access('themes')) {
    return $classes;
  }
  $classes .= ' no-customize-support';
  return $classes;
});

add_action('load-nav-menus.php', function () {
  global $parent_file, $submenu_file;
  $parent_file = 'options-general.php';
  $submenu_file = 'nav-menus.php';
});

/**
 * Default role when creating a new user (Add User screen). The Settings field is hidden in admin.
 */
add_filter('pre_option_default_role', static function ($pre) {
  return 'editor';
});

/**
 * On Settings → General, hide specific rows for non-developers (e.g. WordPress Address URL).
 * Also prevent saving those options so they cannot be changed via tampered requests.
 */
add_action('load-options-general.php', function () {
  if (is_multisite() || bl_is_developer_user((int) get_current_user_id())) {
    return;
  }
  $hide_field_ids = ['siteurl', 'home', 'users_can_register', 'default_role'];
  add_action('admin_head', function () use ($hide_field_ids) {
    $selectors = array_map(function ($id) {
      return '.form-table tr:has(#' . esc_attr($id) . ')';
    }, $hide_field_ids);
    echo '<style>', implode(', ', $selectors), ' { display: none !important; }</style>';
  }, 1);
});

add_action('admin_init', function () {
  if (bl_is_developer_user((int) get_current_user_id())) {
    return;
  }
  $protected_options = [
    'siteurl',
    'home',
    'users_can_register',
    'default_role',
  ];
  foreach ($protected_options as $option) {
    add_filter('pre_update_option_' . $option, function ($value, $old_value) {
      return $old_value;
    }, 10, 2);
  }
}, 1);
