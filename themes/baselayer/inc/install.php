<?php

defined('ABSPATH') || exit;

require_once __DIR__ . '/install-system.php';
require_once __DIR__ . '/install-content.php';
require_once __DIR__ . '/install-child-theme.php';

/**
 * Redirect to install page only when setup is not completed and user tries to access Theme settings, Tools, Users, or their subpages.
 * On all other admin pages (e.g. Dashboard, Themes list) we do not redirect — the notice is shown only.
 */
add_action('admin_init', function () {
  if (bl_setup_completed()) {
    return;
  }
  if (defined('DOING_AJAX') && DOING_AJAX) {
    return;
  }
  // After theme activation, redirect once to the installer (without fighting core activation redirects).
  if (get_transient('baselayer_redirect_to_installer')) {
    delete_transient('baselayer_redirect_to_installer');
    if (!isset($_GET['page']) || $_GET['page'] !== 'baselayer-install') {
      wp_safe_redirect(admin_url('themes.php?page=baselayer-install'));
      exit;
    }
  }
  if (isset($_GET['page']) && $_GET['page'] === 'baselayer-install') {
    return;
  }
  global $pagenow;
  $redirect_pages = [
    'options-general.php',
    'tools.php',
    'users.php',
    'user-new.php',
    'user-edit.php',
    'profile.php',
    'nav-menus.php',
    'customize.php',
    'theme-editor.php',
    'site-editor.php',
  ];
  if (!in_array($pagenow, $redirect_pages, true)) {
    return;
  }
  wp_safe_redirect(admin_url('themes.php?page=baselayer-install'));
  exit;
}, 5);

/**
 * After switching to BaseLayer (parent or child), schedule a redirect to the installer.
 */
add_action('after_switch_theme', function () {
  if (bl_setup_completed()) {
    return;
  }
  if (get_template() !== 'baselayer') {
    return;
  }
  set_transient('baselayer_redirect_to_installer', '1', 60);
});

/**
 * After install: if user chose "Log in as developer user", switch to the new dev user and redirect to dashboard.
 */
add_action('admin_init', function () {
  $user_id = get_transient('baselayer_login_as_dev');
  if (!$user_id || !isset($_GET['page']) || $_GET['page'] !== 'baselayer-install' || !isset($_GET['baselayer_success'])) {
    return;
  }
  $user = get_userdata($user_id);
  if (!$user) {
    delete_transient('baselayer_login_as_dev');
    return;
  }
  delete_transient('baselayer_login_as_dev');
  wp_logout();
  wp_clear_auth_cookie();
  wp_set_current_user($user_id);
  wp_set_auth_cookie($user_id, true);
  wp_safe_redirect(admin_url());
  exit;
}, 1);

/**
 * Add BaseLayer installer to admin menu (when setup not completed or viewing success page).
 * After setup, the page stays accessible for the success message but the menu link is hidden.
 */
add_action('admin_menu', function () {
  if (bl_setup_completed() && !isset($_GET['baselayer_success'])) {
    return;
  }
  add_theme_page(
    __('Install theme', 'baselayer'),
    __('Install theme', 'baselayer'),
    'manage_options',
    'baselayer-install',
    'bl_render_installer',
    1
  );
}, 10);

add_action('admin_menu', function () {
  if (!bl_setup_completed() || isset($_GET['baselayer_success'])) {
    return;
  }
  remove_submenu_page('themes.php', 'baselayer-install');
}, 20);

/**
 * Show BaseLayer installer notice (when not on the install page; redirect usually sends users there).
 */
add_action('admin_notices', function () {
  if (bl_setup_completed()) {
    return;
  }

  $screen = get_current_screen();
  if ($screen && $screen->id === 'appearance_page_baselayer-install') {
    return;
  }

  echo '<div class="notice notice-warning">';
  echo '<p><strong>' . esc_html__('BaseLayer isn\'t set up yet.', 'baselayer') . '</strong></p>';
  echo '<p>' . esc_html__('A one-time initialization is required to configure core options and activate essential system features.', 'baselayer') . '</p>';
  echo '<p style="margin-top: 12px;">';
  echo '<a href="' . esc_url(admin_url('themes.php?page=baselayer-install')) . '" class="button button-primary">' . esc_html__('Go to installer', 'baselayer') . '</a>';
  echo '</p>';
  echo '</div>';
});


/**
 * Render the BaseLayer installer page (theme setup wizard).
 *
 * @return void
 */
function bl_render_installer(): void
{
  if (!current_user_can('manage_options')) {
    return;
  }

?>
  <div class="wrap">
    <h1><?= esc_html__('Install BaseLayer', 'baselayer') ?></h1>

    <?php if (bl_setup_completed()) { ?>

      <div class="notice notice-success">
        <p><strong><?= esc_html__('BaseLayer is installed.', 'baselayer') ?></strong></p>
        <?php if (is_child_theme()) { ?>
          <p><?= esc_html(
            sprintf(
              /* translators: %s: child theme slug */
              __('Active child theme: %s. Parent BaseLayer stays installed for updates.', 'baselayer'),
              get_stylesheet()
            )
          ) ?></p>
        <?php } ?>
        <p><?= wp_kses(
              sprintf(
                /* translators: %s: link to Theme settings page */
                __('You can change more settings in the <a href="%s">Theme settings</a> page.', 'baselayer'),
                esc_url(admin_url('options-general.php?page=bl-theme-settings'))
              ),
              ['a' => ['href' => true]]
            ) ?></p>
      </div>

      <p>
        <a
          href="<?php echo esc_url(admin_url('options-general.php?page=bl-theme-settings')); ?>"
          class="button button-primary"><?= esc_html__('Edit theme settings', 'baselayer') ?></a>
        <a
          href="<?php echo esc_url(admin_url()); ?>"
          class="button button-secondary"><?= esc_html__('Go to dashboard', 'baselayer') ?></a>
      </p>

    <?php } else { ?>
      <?php
      $install_errors = get_transient('baselayer_install_validation_errors');
      $has_install_errors = is_array($install_errors) && $install_errors !== [];
      if ($has_install_errors) {
        delete_transient('baselayer_install_validation_errors');
        echo '<div class="notice notice-error bl-notice-error"><p><strong>' . esc_html__('The following errors occurred during initialization:', 'baselayer') . '</strong></p><ul>';
        foreach ($install_errors as $item) {
          if (is_string($item)) {
            echo '<li>' . esc_html__($item, 'baselayer') . '</li>';
          }
        }
        echo '</ul></div>';
      }
      if (!$has_install_errors) {
      ?>
        <div class="notice notice-info" style="margin: 1em 0;">
          <p style="margin: 0.5em 0;">
            <?= esc_html__('This theme requires a one-time initialization to activate core functionality and ensure a clean development foundation.', 'baselayer') ?>
          </p>
        </div>
      <?php
      }
      $install_submitted = get_transient('baselayer_install_submitted');
      if (!is_array($install_submitted)) {
        $install_submitted = [];
      } else {
        delete_transient('baselayer_install_submitted');
      }
      /** @param array $key @param mixed $default */
      $bl_install_val = function (array $key, $default = '') use ($install_submitted) {
        $v = $install_submitted;
        foreach ($key as $k) {
          if (!is_array($v) || !array_key_exists($k, $v)) {
            return $default;
          }
          $v = $v[$k];
        }
        return $v;
      };
      ?>

      <form class="baselayer__install-form" data-bl-install-form method="post" autocomplete="off">
        <?php wp_nonce_field('baselayer_install'); ?>

        <h2><?= esc_html__('Theme', 'baselayer') ?></h2>

        <table class="form-table" role="presentation">
          <tr>
            <th scope="row"><?= esc_html__('Child theme', 'baselayer') ?></th>
            <td>
              <label>
                <input type="checkbox" name="install[create_child_theme]" value="1" <?= !empty($bl_install_val(['install', 'create_child_theme'], true)) ? ' checked' : '' ?> data-bl-checkbox-toggle="create-child-theme">
                <?= esc_html__('Create child theme', 'baselayer') ?>
                <span class="bl-install-recommended" style="display:inline-block;margin-left:6px;padding:1px 7px;border-radius:3px;background:#2271b1;color:#fff;font-size:11px;font-weight:600;line-height:1.7;vertical-align:1px;"><?= esc_html__('Recommended', 'baselayer') ?></span>
              </label>
              <p class="description"><?= esc_html__('Creates a project-specific child theme. BaseLayer remains installed for updates, while your custom styles, scripts, and templates live in the child theme.', 'baselayer') ?></p>
            </td>
          </tr>
        </table>

        <div data-bl-checkbox-toggle-content="create-child-theme">
          <table class="form-table" role="presentation">
            <tr>
              <th scope="row">
                <label>
                  <?= esc_html__('Theme name', 'baselayer') ?>
                </label>
              </th>
              <td>
                <input type="text" name="theme[name]" value="<?= esc_attr($bl_install_val(['theme', 'name'], get_bloginfo('name'))) ?>" class="regular-text">
              </td>
            </tr>
            <tr>
              <th scope="row">
                <label>
                  <?= esc_html__('Theme slug', 'baselayer') ?>
                </label>
              </th>
              <td>
                <?php
                $default_theme_slug = bl_install_sanitize_theme_slug(get_bloginfo('name'));
                ?>
                <input type="text" name="theme[slug]" value="<?= esc_attr($bl_install_val(['theme', 'slug'], $default_theme_slug)) ?>" class="regular-text">
                <p class="description"><?= esc_html__('Use only lowercase letters, numbers and hyphens.', 'baselayer') ?></p>
              </td>
            </tr>
            <tr>
              <th scope="row">
                <label>
                  <?= esc_html__('Theme description', 'baselayer') ?>
                </label>
              </th>
              <td>
                <input type="text" name="theme[description]" value="<?= esc_attr($bl_install_val(['theme', 'description'], sprintf(__('Theme of the webpage %s.', 'baselayer'), get_bloginfo('name')))) ?>" class="regular-text">
              </td>
            </tr>
            <tr>
              <th scope="row">
                <label for="theme_author"><?= esc_html__('Theme Author', 'baselayer') ?></label>
              </th>
              <td>
                <input type="text" name="theme[author]" id="theme_author" value="<?= esc_attr($bl_install_val(['theme', 'author'], '')) ?>" class="regular-text">
              </td>
            </tr>
            <tr>
              <th scope="row">
                <label for="theme_author_uri"><?= esc_html__('Author URL', 'baselayer') ?></label>
              </th>
              <td>
                <input type="text" name="theme[author_uri]" id="theme_author_uri" value="<?= esc_attr($bl_install_val(['theme', 'author_uri'], '')) ?>" class="regular-text">
              </td>
            </tr>
          </table>
        </div>

        <hr>

        <h2><?= esc_html__('Media', 'baselayer') ?></h2>

        <table class="form-table" role="presentation">
          <tr>
            <th scope="row"><?= esc_html__('Media sizes', 'baselayer') ?></th>
            <td>
              <p style="margin-top: 0;">
                <label>
                  <input type="checkbox" name="install[media]" value="1" <?= !empty($bl_install_val(['install', 'media'], true)) ? ' checked' : '' ?> data-bl-checkbox-toggle="media">
                  <?= esc_html__('Set media sizes', 'baselayer') ?>
                </label>
              </p>
              <p class="description"><?= esc_html__('Stores the values in WordPress media settings.', 'baselayer') ?></p>
              <div data-bl-checkbox-toggle-content="media" style="margin-top: 12px;">
                <?php
                $install_media_sizes = [
                  'thumbnail' => ['name' => __('Thumbnail'), 'width' => 300, 'height' => 300],
                  'small' => ['name' => _x('Small', 'Image size', 'baselayer'), 'width' => 600, 'height' => 600],
                  'medium' => ['name' => __('Medium'), 'width' => 1200, 'height' => 1200],
                  'large' => ['name' => __('Large'), 'width' => 2400, 'height' => 2400],
                ];
                foreach ($install_media_sizes as $slug => $size) {
                  $media_submitted = $bl_install_val(['media', $slug], []);
                  $m = is_array($media_submitted) ? $media_submitted : [];
                  $w = isset($m['width']) && $m['width'] > 0 ? (int) $m['width'] : (int) $size['width'];
                  $h = isset($m['height']) ? (int) $m['height'] : (int) $size['height'];
                ?>
                  <div style="margin-bottom: 8px;">
                    <label>
                      <span style="display: inline-block; min-width: 120px;"><?= esc_html($size['name']) ?></span>
                      <input type="number" name="media[<?= esc_attr($slug) ?>][width]" value="<?= $w ?>" class="small-text" min="1" style="width: 72px;"> ×
                      <input type="number" name="media[<?= esc_attr($slug) ?>][height]" value="<?= $h ?>" class="small-text" min="0" style="width: 72px;"> px
                    </label>
                    <?php if ($slug === 'thumbnail') { ?>
                      <label style="margin-left: 12px;">
                        <input type="checkbox" name="media[thumbnail][crop]" value="1" <?= !empty($bl_install_val(['media', 'thumbnail', 'crop'])) ? ' checked' : '' ?>>
                        <?= esc_html__('Crop to exact dimensions', 'baselayer') ?>
                      </label>
                    <?php } ?>
                  </div>
                <?php
                }
                ?>
              </div>
            </td>
          </tr>
        </table>

        <hr>

        <h2><?= esc_html__('System', 'baselayer') ?></h2>

        <table class="form-table" role="presentation">
          <tr>
            <th scope="row"><?= esc_html__('Permalinks', 'baselayer') ?></th>
            <td>
              <p style="margin-top: 0;">
                <label>
                  <input type="checkbox" name="install[permalinks]" value="1" <?= !empty($bl_install_val(['install', 'permalinks'], true)) ? ' checked' : '' ?>>
                  <?= esc_html__('Set permalink structure to “Post name”', 'baselayer') ?>
                </label>
              </p>
              <p class="description"><?= esc_html__('Sets the permalink structure to “Post name” (/%postname%/), so URLs look like /about instead of ?p=123.', 'baselayer') ?></p>
            </td>
          </tr>

          <!-- Apache .htaccess -->
          <tr>
            <th scope="row"><?= esc_html__('Apache (.htaccess)', 'baselayer') ?></th>
            <td>
              <p style="margin-top: 0;">
                <label>
                  <input type="checkbox" name="install[htaccess]" value="1" <?= !empty($bl_install_val(['install', 'htaccess'], true)) ? ' checked' : '' ?>>
                  <?= esc_html__('Apply recommended rules to .htaccess', 'baselayer') ?>
                </label>
              </p>
              <p class="description"><?= esc_html__('Writes Expires headers, removes Set-Cookie on static assets, and enables gzip/deflate in the WordPress root .htaccess.', 'baselayer') ?></p>
              <?php
              $htaccess_config = bl_get_htaccess_config();
              if ($htaccess_config !== '') {
              ?>
                <details class="bl-details" style="margin-top: 8px;">
                  <summary style="cursor: pointer;"><?= esc_html__('Show config', 'baselayer') ?></summary>
                  <div style="margin-top: 8px;">
                    <p class="description" style="margin-bottom: 8px;"><?= esc_html__('Be careful when editing this. Incorrect rules can break your site or make it inaccessible.', 'baselayer') ?></p>
                    <textarea id="bl-htaccess-config" class="large-text code" rows="27" style="width: 100%; font-size: 12px; font-family: monospace;"><?= esc_textarea($htaccess_config) ?></textarea>
                  </div>
                </details>
              <?php
              }
              ?>
            </td>
          </tr>
          <!-- Nginx (copy snippet) -->
          <tr>
            <th scope="row"><?= esc_html__('Nginx', 'baselayer') ?></th>
            <td>
              <p class="description"><?= esc_html__('Recommended snippet for Nginx: add to your server block for gzip, long cache on static assets, and Vary Accept-Encoding. Copy and paste into your Nginx config.', 'baselayer') ?></p>
              <?php
              $nginx_config = bl_get_nginx_config();
              if ($nginx_config !== '') {
              ?>
                <details class="bl-details" style="margin-top: 8px;">
                  <summary style="cursor: pointer;"><?= esc_html__('Show config', 'baselayer') ?></summary>
                  <div style="margin-top: 8px;">
                    <textarea id="bl-nginx-config" class="large-text code" rows="27" readonly style="width: 100%; font-size: 12px; font-family: monospace;"><?= esc_textarea($nginx_config) ?></textarea>
                    <div>
                      <button type="button" class="button button-small" data-bl-copy-from-source="bl-nginx-config" data-bl-copy-feedback-text="<?= esc_attr__('Copied', 'baselayer') ?>"><?= esc_html__('Copy', 'baselayer') ?></button>
                    </div>
                  </div>
                </details>
              <?php
              }
              ?>
            </td>
          </tr>
        </table>

        <hr>

        <h2><?= esc_html__('Content', 'baselayer') ?></h2>

        <p class="description"><?= esc_html__('Choose which content types to use. Their config files are always installed, so you can also switch them on or off later.', 'baselayer') ?></p>

        <?php
        $content_post = !empty($bl_install_val(['install', 'content', 'post'], true));
        $content_projects = !empty($bl_install_val(['install', 'content', 'projects'], true));
        $content_event = !empty($bl_install_val(['install', 'content', 'event'], true));
        // Blog examples on by default; projects/events examples off.
        $content_post_examples = !empty($bl_install_val(['install', 'content', 'post_examples'], true));
        $content_projects_examples = !empty($bl_install_val(['install', 'content', 'projects_examples'], false));
        $content_event_examples = !empty($bl_install_val(['install', 'content', 'event_examples'], false));
        ?>

        <table class="form-table" role="presentation">
          <tr>
            <th scope="row"><?= esc_html__('Blog posts', 'baselayer') ?></th>
            <td>
              <fieldset>
                <label>
                  <input type="checkbox" name="install[content][post]" value="1" <?= $content_post ? ' checked' : '' ?> data-bl-checkbox-toggle="content-post">
                  <?= esc_html__('Enable blog posts', 'baselayer') ?>
                </label>
                <div class="bl-indent-checkbox">
                  <p class="description" style="margin-top: 0;"><?= esc_html__('WordPress’s built-in posts – ideal for news, articles, or a classic blog archive.', 'baselayer') ?></p>
                  <div data-bl-checkbox-toggle-content="content-post">
                    <label>
                      <input type="checkbox" name="install[content][post_examples]" value="1" <?= $content_post_examples ? ' checked' : '' ?>>
                      <?= esc_html__('Create example posts', 'baselayer') ?>
                    </label>
                  </div>
                </div>
              </fieldset>
            </td>
          </tr>
          <tr>
            <th scope="row"><?= esc_html__('Projects', 'baselayer') ?></th>
            <td>
              <fieldset>
                <label>
                  <input type="checkbox" name="install[content][projects]" value="1" <?= $content_projects ? ' checked' : '' ?> data-bl-checkbox-toggle="content-projects">
                  <?= esc_html__('Enable custom post type: Projects', 'baselayer') ?>
                </label>
                <div class="bl-indent-checkbox">
                  <p class="description" style="margin-top: 0;"><?= esc_html__('A flexible custom post type you can rename and reshape – for portfolios, case studies, or similar listings.', 'baselayer') ?></p>
                  <div data-bl-checkbox-toggle-content="content-projects">
                    <label>
                      <input type="checkbox" name="install[content][projects_examples]" value="1" <?= $content_projects_examples ? ' checked' : '' ?>>
                      <?= esc_html__('Create example posts', 'baselayer') ?>
                    </label>
                  </div>
                </div>
              </fieldset>
            </td>
          </tr>
          <tr>
            <th scope="row"><?= esc_html__('Events', 'baselayer') ?></th>
            <td>
              <fieldset>
                <label>
                  <input type="checkbox" name="install[content][event]" value="1" <?= $content_event ? ' checked' : '' ?> data-bl-checkbox-toggle="content-event">
                  <?= esc_html__('Enable custom post type: Events', 'baselayer') ?>
                </label>
                <div class="bl-indent-checkbox">
                  <p class="description" style="margin-top: 0;"><?= esc_html__('Items with start and end dates, ordered by date on archives – suited to happenings, workshops, or schedules.', 'baselayer') ?></p>
                  <div data-bl-checkbox-toggle-content="content-event">
                    <label>
                      <input type="checkbox" name="install[content][event_examples]" value="1" <?= $content_event_examples ? ' checked' : '' ?>>
                      <?= esc_html__('Create example posts', 'baselayer') ?>
                    </label>
                  </div>
                </div>
              </fieldset>
            </td>
          </tr>
        </table>

        <hr>

        <h2><?= esc_html__('Advanced Custom Fields', 'baselayer') ?></h2>

        <p class="description"><?= esc_html__('This theme relies heavily on ACF Pro for custom fields, blocks, and flexible content. A valid license keeps updates and Pro features available.', 'baselayer') ?></p>

        <?php
        $acf_license_defined = bl_install_acf_pro_license_is_defined();
        $acf_license_submitted = (string) $bl_install_val(['install', 'acf_pro_key'], '');
        ?>

        <table class="form-table" role="presentation">
          <tr>
            <th scope="row"><label for="install_acf_pro_key"><?= esc_html__('ACF Pro license key', 'baselayer') ?></label></th>
            <td>
              <?php if ($acf_license_defined) : ?>
                <p class="description" style="margin-top: 0;"><?= esc_html__('An ACF Pro license key is already defined in the configuration.', 'baselayer') ?></p>
              <?php else : ?>
                <input type="text" name="install[acf_pro_key]" id="install_acf_pro_key" value="<?= esc_attr($acf_license_submitted) ?>" class="large-text code bl-code-small" autocomplete="off" spellcheck="false" style="max-width: 600px;">
                <p class="description"><?= esc_html__('Optional. If entered and not already present, it will be added to wp-config.php.', 'baselayer') ?></p>
              <?php endif; ?>
            </td>
          </tr>
        </table>

        <hr>

        <h2><?= esc_html__('Administrator email', 'baselayer') ?></h2>

        <div style="margin-bottom: 16px;">
          <p class="description" style="margin-bottom: 12px;"><?= esc_html__('Used for system notifications, updates, and critical error reporting.', 'baselayer') ?></p>
          <input type="email" name="site[admin_email]" id="site_admin_email" value="<?= esc_attr($bl_install_val(['site', 'admin_email'], get_option('admin_email'))) ?>" class="regular-text">
        </div>

        <hr>

        <h2><?= esc_html__('Users', 'baselayer') ?></h2>

        <p class="description"><?= esc_html__('At least one user requires developer privileges to manage technical settings and system-level functionality.', 'baselayer') ?></p>
        <p class="description"><?= esc_html__('The user account you provide to your customer or end user should not have developer rights.', 'baselayer') ?></p>

        <?php
        $current_user = wp_get_current_user();
        ?>
        <table class="form-table" role="presentation" style="margin-top: 16px;">
          <tr>
            <td colspan="2" style="padding: 0; border: none; vertical-align: top;">
              <div style="display: flex; flex-wrap: wrap; gap: 24px;">
                <!-- Current user -->
                <div style="flex: 1; min-width: 280px; padding: 16px; background: #f6f7f7; border: 1px solid #c3c4c7; border-radius: 4px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 14px;"><?= esc_html__('Current user', 'baselayer') ?></h3>
                  <div style="margin-bottom: 12px;">
                    <label class="bl-input-label" for="developer_current_username"><?= esc_html__('Username', 'baselayer') ?></label>
                    <input type="text" id="developer_current_username" value="<?= esc_attr($current_user->user_login) ?>" class="regular-text" style="width: 100%;" readonly>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <label class="bl-input-label" for="developer_current_email"><?= esc_html__('Email', 'baselayer') ?></label>
                    <input type="email" name="developer[current_user][email]" id="developer_current_email" value="<?= esc_attr($bl_install_val(['developer', 'current_user', 'email'], $current_user->user_email)) ?>" class="regular-text" style="width: 100%;" autocomplete="email">
                  </div>
                  <div style="margin-bottom: 12px;">
                    <label class="bl-input-label" for="developer_current_password"><?= esc_html__('Password', 'baselayer') ?></label>
                    <input type="password" name="developer[current_user][password]" id="developer_current_password" value="" class="regular-text" style="width: 100%;" autocomplete="off">
                    <p class="description"><?= esc_html__('Leave empty to keep current password.', 'baselayer') ?></p>
                  </div>
                  <div style="margin-bottom: 0;">
                    <label>
                      <input type="checkbox" name="developer[current_user][has_developer_rights]" value="1" <?= !empty($bl_install_val(['developer', 'current_user', 'has_developer_rights'])) ? ' checked' : '' ?>>
                      <?= esc_html__('Has developer rights', 'baselayer') ?>
                    </label>
                  </div>
                </div>
                <!-- Optional additional user -->
                <div style="flex: 1; min-width: 280px; padding: 16px; background: #f6f7f7; border: 1px solid #c3c4c7; border-radius: 4px;">
                  <h3 style="margin: 0 0 12px 0; font-size: 14px;"><?= esc_html__('Add another admin user', 'baselayer') ?></h3>
                  <div style="margin-bottom: 12px;">
                    <label class="bl-input-label" for="developer_new_username"><?= esc_html__('Username', 'baselayer') ?></label>
                    <input type="text" name="developer[new_user][username]" id="developer_new_username" value="<?= esc_attr($bl_install_val(['developer', 'new_user', 'username'])) ?>" class="regular-text" style="width: 100%;" autocomplete="off">
                  </div>
                  <div style="margin-bottom: 12px;">
                    <label class="bl-input-label" for="developer_new_email"><?= esc_html__('Email', 'baselayer') ?></label>
                    <input type="email" name="developer[new_user][email]" id="developer_new_email" value="<?= esc_attr($bl_install_val(['developer', 'new_user', 'email'])) ?>" class="regular-text" style="width: 100%;" autocomplete="off">
                  </div>
                  <div style="margin-bottom: 12px;">
                    <label class="bl-input-label" for="developer_new_password"><?= esc_html__('Password', 'baselayer') ?></label>
                    <input type="password" name="developer[new_user][password]" id="developer_new_password" value="" class="regular-text" style="width: 100%;" autocomplete="new-password">
                    <p class="description">
                      <a class="bl-description-link -has-icon" href="https://passwordcopy.app" target="_blank" rel="noopener">
                        <span class="bl-description-link-icon"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h560v-240q0-17 11.5-28.5T800-480q17 0 28.5 11.5T840-440v240q0 33-23.5 56.5T760-120H200Zm560-584L416-360q-11 11-28 11t-28-11q-11-11-11-28t11-28l344-344H600q-17 0-28.5-11.5T560-800q0-17 11.5-28.5T600-840h200q17 0 28.5 11.5T840-800v200q0 17-11.5 28.5T800-560q-17 0-28.5-11.5T760-600v-104Z" />
                          </svg></span>
                        <span>passwordcopy.app</span>
                      </a>
                    </p>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <label>
                      <input type="checkbox" name="developer[new_user][has_developer_rights]" value="1" <?= !empty($bl_install_val(['developer', 'new_user', 'has_developer_rights'])) ? ' checked' : '' ?>>
                      <?= esc_html__('Has developer rights', 'baselayer') ?>
                    </label>
                  </div>
                  <div>
                    <label>
                      <input type="checkbox" name="developer[new_user][login_after_setup]" value="1" <?= !empty($bl_install_val(['developer', 'new_user', 'login_after_setup'])) ? ' checked' : '' ?>>
                      <?= esc_html__('Log in as this user after setup', 'baselayer') ?>
                    </label>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </table>

        <p>
          <button class="button button-primary" name="baselayer_run_install">
            <?= esc_html__('Run setup', 'baselayer') ?>
          </button>
        </p>
      </form>

    <?php } ?>
  </div>
<?php
}

/**
 * Run BaseLayer installation on admin_init (after init), not while functions.php loads.
 */
add_action('admin_init', function (): void {
	if (!isset($_POST['baselayer_run_install'])) {
		return;
	}
	if (!current_user_can('manage_options')) {
		return;
	}

	check_admin_referer('baselayer_install');
	baselayer_run_install();
}, 20);

/**
 * Validate install form. Returns array of error message strings; empty array means valid.
 * Strings are translated when displayed on the install page.
 *
 * @return array<int, string>
 */
function baselayer_validate_install(): array
{
  $errors = [];

  // Developer: at least one user must have developer rights
  $current_has_dev = !empty($_POST['developer']['current_user']['has_developer_rights']);
  $new_username = trim((string) ($_POST['developer']['new_user']['username'] ?? ''));
  $new_email = trim((string) ($_POST['developer']['new_user']['email'] ?? ''));
  $new_pass = (string) ($_POST['developer']['new_user']['password'] ?? '');
  $new_has_dev = !empty($_POST['developer']['new_user']['has_developer_rights']);
  $create_new = $new_username !== '' && $new_email !== '' && $new_pass !== '';

  $has_at_least_one_developer = $current_has_dev || ($create_new && $new_has_dev);
  if (!$has_at_least_one_developer) {
    $errors[] = 'At least one user must have developer rights. Either check "Has developer rights" for the current user or add another user and check it there.';
  }

  // Theme name / slug: required when creating a child theme
  $create_child = !empty($_POST['install']['create_child_theme']);
  $theme_name = trim((string) ($_POST['theme']['name'] ?? ''));
  $theme_slug_normalized = bl_install_sanitize_theme_slug((string) ($_POST['theme']['slug'] ?? ''));

  if ($create_child) {
    if ($theme_name === '') {
      $errors[] = 'Theme name is required.';
    }

    if ($theme_slug_normalized === '') {
      $errors[] = 'Theme slug is required.';
    } elseif (!preg_match('/^[a-z][a-z0-9-]*$/', $theme_slug_normalized)) {
      $errors[] = 'Theme slug may only contain lowercase letters (a-z), numbers (0-9), and hyphens, and must start with a letter.';
    } else {
      $themes_dir = WP_CONTENT_DIR . '/themes';
      $target_dir = $themes_dir . '/' . $theme_slug_normalized;
      if (is_dir($target_dir)) {
        $errors[] = 'A theme or folder with that name already exists. Choose a different theme slug.';
      }
    }
  }

  // Administration email: required and valid
  $site_admin_email = sanitize_email($_POST['site']['admin_email'] ?? '');
  $site_admin_email_raw = trim((string) ($_POST['site']['admin_email'] ?? ''));
  if ($site_admin_email_raw === '') {
    $errors[] = 'Administration email address is required.';
  } elseif ($site_admin_email === '') {
    $errors[] = 'Please enter a valid administration email address.';
  }

  // Current user email: required and valid
  $current_user_email_raw = trim((string) ($_POST['developer']['current_user']['email'] ?? ''));
  $current_user_email = sanitize_email($current_user_email_raw);
  if ($current_user_email_raw === '') {
    $errors[] = 'Current user email address is required.';
  } elseif ($current_user_email === '') {
    $errors[] = 'Please enter a valid email address for the current user.';
  }

  // New user: if any field is filled, all three required; email valid; password min length
  if ($new_username !== '' || $new_email !== '' || $new_pass !== '') {
    if ($new_username === '' || $new_email === '' || $new_pass === '') {
      $errors[] = 'To add another user, please fill in username, email, and password.';
    } else {
      if (sanitize_email($new_email) === '') {
        $errors[] = 'Please enter a valid email address for the new user.';
      }
      if (strlen($new_pass) < 8) {
        $errors[] = 'The new user password must be at least 8 characters long.';
      }
      $sanitized_username = sanitize_user($new_username, true);
      if ($sanitized_username === '') {
        $errors[] = 'Please enter a valid username for the new user.';
      }
      if ($sanitized_username !== '' && username_exists($sanitized_username)) {
        $errors[] = 'That username is already in use.';
      }
      if (sanitize_email($new_email) !== '' && email_exists(sanitize_email($new_email))) {
        $errors[] = 'That email address is already in use.';
      }
    }
  }

  return $errors;
}

/**
 * Set validation errors and submitted form data, then redirect to install page. Never returns.
 *
 * @param array<int, string> $errors
 */
function baselayer_install_redirect_with_errors(array $errors): void
{
  set_transient('baselayer_install_validation_errors', $errors, 60);
  $submitted = [
    'theme' => [
      'name' => sanitize_text_field($_POST['theme']['name'] ?? ''),
      'slug' => sanitize_text_field($_POST['theme']['slug'] ?? ''),
      'description' => sanitize_text_field($_POST['theme']['description'] ?? ''),
      'author' => sanitize_text_field($_POST['theme']['author'] ?? ''),
      'author_uri' => esc_url_raw($_POST['theme']['author_uri'] ?? ''),
    ],
    'site' => [
      'admin_email' => sanitize_text_field($_POST['site']['admin_email'] ?? ''),
    ],
    'install' => [
      'create_child_theme' => !empty($_POST['install']['create_child_theme']),
      'media' => !empty($_POST['install']['media']),
      'permalinks' => !empty($_POST['install']['permalinks']),
      'htaccess' => !empty($_POST['install']['htaccess']),
      'acf_pro_key' => bl_install_sanitize_acf_pro_license((string) ($_POST['install']['acf_pro_key'] ?? '')),
      'content' => [
        'post' => !empty($_POST['install']['content']['post']),
        'projects' => !empty($_POST['install']['content']['projects']),
        'event' => !empty($_POST['install']['content']['event']),
        'post_examples' => !empty($_POST['install']['content']['post_examples']),
        'projects_examples' => !empty($_POST['install']['content']['projects_examples']),
        'event_examples' => !empty($_POST['install']['content']['event_examples']),
      ],
    ],
    'developer' => [
      'current_user' => [
        'email' => sanitize_email($_POST['developer']['current_user']['email'] ?? ''),
        'has_developer_rights' => !empty($_POST['developer']['current_user']['has_developer_rights']),
      ],
      'new_user' => [
        'username' => sanitize_text_field($_POST['developer']['new_user']['username'] ?? ''),
        'email' => sanitize_email($_POST['developer']['new_user']['email'] ?? ''),
        'has_developer_rights' => !empty($_POST['developer']['new_user']['has_developer_rights']),
        'login_after_setup' => !empty($_POST['developer']['new_user']['login_after_setup']),
      ],
    ],
    'media' => [],
  ];
  $media = $_POST['media'] ?? [];
  foreach (['thumbnail', 'small', 'medium', 'large'] as $slug) {
    if (isset($media[$slug]) && is_array($media[$slug])) {
      $submitted['media'][$slug] = [
        'width' => isset($media[$slug]['width']) ? (int) $media[$slug]['width'] : 0,
        'height' => isset($media[$slug]['height']) ? (int) $media[$slug]['height'] : 0,
        'crop' => !empty($media[$slug]['crop']),
      ];
    }
  }
  set_transient('baselayer_install_submitted', $submitted, 60);
  wp_safe_redirect(admin_url('themes.php?page=baselayer-install'));
  exit;
}

/**
 * Run the BaseLayer installation: theme info, pages, menus, options.
 *
 * @return void
 */
function baselayer_run_install(): void
{
  if (bl_setup_completed()) {
    wp_die('BaseLayer installation is already complete.');
    return;
  }

  $validation_errors = baselayer_validate_install();
  if ($validation_errors !== []) {
    baselayer_install_redirect_with_errors($validation_errors);
  }

  /**
   * Developer: update current user and create new user FIRST. If new user creation fails, abort install.
   */
  $dev_meta_key = defined('BL_USER_META_DEVELOPER') ? BL_USER_META_DEVELOPER : 'baselayer_developer';
  $current_id = get_current_user_id();
  $cur_has_dev = !empty($_POST['developer']['current_user']['has_developer_rights']);
  if ($current_id) {
    $cur_email = isset($_POST['developer']['current_user']['email']) ? sanitize_email(wp_unslash($_POST['developer']['current_user']['email'])) : '';
    $cur_password = isset($_POST['developer']['current_user']['password']) ? $_POST['developer']['current_user']['password'] : '';
    $cur_password = is_string($cur_password) ? wp_unslash($cur_password) : '';
    $user_data = [
      'ID' => $current_id,
      'user_email' => $cur_email ?: get_userdata($current_id)->user_email,
    ];
    if ($cur_password !== '' && strlen($cur_password) >= 8) {
      $user_data['user_pass'] = $cur_password;
    }
    wp_update_user($user_data);
    if ($cur_has_dev) {
      update_user_meta($current_id, $dev_meta_key, '1');
    } else {
      delete_user_meta($current_id, $dev_meta_key);
    }
  }

  $new_developer_user_id = 0;
  $insert_user_error = '';
  $new_user_username_raw = trim((string) (wp_unslash($_POST['developer']['new_user']['username'] ?? '')));
  $new_user_attempted = $new_user_username_raw !== '';
  $dev_username = $new_user_username_raw !== '' ? sanitize_user($new_user_username_raw, true) : '';
  $dev_email = isset($_POST['developer']['new_user']['email']) ? sanitize_email(wp_unslash($_POST['developer']['new_user']['email'])) : '';
  $dev_password_raw = isset($_POST['developer']['new_user']['password']) ? $_POST['developer']['new_user']['password'] : '';
  $dev_password = is_string($dev_password_raw) ? wp_unslash($dev_password_raw) : '';
  $new_has_dev = !empty($_POST['developer']['new_user']['has_developer_rights']);
  $create_new_user = $dev_username !== '' && $dev_email !== '' && strlen($dev_password) >= 8;
  if ($create_new_user && !username_exists($dev_username) && !email_exists($dev_email)) {
    $user_id = wp_insert_user([
      'user_login' => $dev_username,
      'user_email' => $dev_email,
      'user_pass' => $dev_password,
      'role' => 'administrator',
    ]);
    if (!is_wp_error($user_id)) {
      if ($new_has_dev) {
        update_user_meta($user_id, $dev_meta_key, '1');
      }
      $new_developer_user_id = (int) $user_id;
    } else {
      $insert_user_error = $user_id->get_error_message();
    }
  }
  if ($new_user_attempted && $new_developer_user_id === 0) {
    if ($insert_user_error !== '') {
      $msg = $insert_user_error;
    } elseif ($create_new_user && (username_exists($dev_username) || email_exists($dev_email))) {
      $msg = 'That username or email is already in use.';
    } elseif ($create_new_user) {
      $msg = 'Could not create user. Please try again or add the user later under Users.';
    } else {
      $msg = 'The additional user could not be created. Please fill in username, email and a password of at least 8 characters.';
    }
    baselayer_install_redirect_with_errors([$msg]);
  }

  $login_after_setup = !empty($_POST['developer']['new_user']['login_after_setup']) && $new_developer_user_id > 0;
  if ($login_after_setup) {
    set_transient('baselayer_login_as_dev', $new_developer_user_id, 60);
  }

  $site_admin_email = sanitize_email($_POST['site']['admin_email'] ?? '');
  if ($site_admin_email !== '') {
    update_option('admin_email', $site_admin_email);
  }

  // Auto-fill developer email from first user with developer rights (current or new)
  $first_developer_email = '';
  if ($cur_has_dev && $current_id) {
    $first_developer_email = isset($_POST['developer']['current_user']['email']) ? sanitize_email(wp_unslash($_POST['developer']['current_user']['email'])) : '';
    if ($first_developer_email === '') {
      $u = get_userdata($current_id);
      $first_developer_email = $u ? $u->user_email : '';
    }
  }
  if ($first_developer_email === '' && $new_developer_user_id > 0 && $new_has_dev) {
    $first_developer_email = $dev_email;
  }
  if ($first_developer_email !== '' && is_email($first_developer_email)) {
    update_option('baselayer_developer_email', $first_developer_email);
  }

  $theme_name = sanitize_text_field($_POST['theme']['name'] ?? '');
  $theme_desc = sanitize_text_field($_POST['theme']['description'] ?? '');
  $theme_author = sanitize_text_field($_POST['theme']['author'] ?? '');
  $theme_author_uri = esc_url_raw($_POST['theme']['author_uri'] ?? '');
  $theme_slug = bl_install_sanitize_theme_slug((string) ($_POST['theme']['slug'] ?? ''));

  /**
   * Features: merge central defaults with existing.
   */
  $defaults = function_exists('bl_theme_feature_defaults') ? bl_theme_feature_defaults() : [];
  $features = get_option('baselayer_features', []);
  if (!is_array($features)) {
    $features = [];
  }
  $features = array_merge($defaults, $features);
  update_option('baselayer_features', $features);

  $profile_picture_default = defined('BL_PROFILE_PICTURE_MODE_DEFAULT') ? BL_PROFILE_PICTURE_MODE_DEFAULT : 'upload';
  update_option('baselayer_profile_picture_mode', $profile_picture_default);

  /**
   * Media sizes (built-in only; set during install). Extra sizes are edited on Settings → Media.
   */
  $installMedia = !empty($_POST['install']['media']);

  if ($installMedia) {
    $install_media_defaults = [
      'thumbnail' => ['width' => 300, 'height' => 300],
      'small' => ['width' => 600, 'height' => 600],
      'medium' => ['width' => 1200, 'height' => 0],
      'large' => ['width' => 2400, 'height' => 0],
    ];
    $large_width = 0;
    foreach ($install_media_defaults as $slug => $defaults) {
      $posted_w = isset($_POST['media'][$slug]['width']) ? (int) $_POST['media'][$slug]['width'] : $defaults['width'];
      $posted_h = isset($_POST['media'][$slug]['height']) ? (int) $_POST['media'][$slug]['height'] : $defaults['height'];
      if ($slug === 'thumbnail') {
        update_option('thumbnail_size_w', $posted_w);
        update_option('thumbnail_size_h', $posted_h);
        $thumbnail_crop = !empty($_POST['media']['thumbnail']['crop']) ? 1 : 0;
        update_option('thumbnail_crop', $thumbnail_crop);
      } elseif ($slug === 'small') {
        update_option('small_size_w', $posted_w);
        update_option('small_size_h', $posted_h);
      } elseif ($slug === 'medium') {
        update_option('medium_size_w', $posted_w);
        update_option('medium_size_h', $posted_h);
      } elseif ($slug === 'large') {
        update_option('large_size_w', $posted_w);
        update_option('large_size_h', $posted_h);
        $large_width = $posted_w;
      }
    }
    if ($large_width > 0) {
      update_option('big_image_size_threshold', $large_width);
    }
  }

  /**
   * Permalinks
   */
  $installPermalinks = !empty($_POST['install']['permalinks']);

  if ($installPermalinks) {
    global $wp_rewrite;

    if ($wp_rewrite->permalink_structure !== '/%postname%/') {
      $wp_rewrite->set_permalink_structure('/%postname%/');
      flush_rewrite_rules();
    }
  }

  /**
   * .htaccess (Apache only)
   */
  $installHtaccess = !empty($_POST['install']['htaccess']);
  if ($installHtaccess) {
    bl_write_htaccess();
  }

  /**
   * ACF Pro license in wp-config.php (when provided and not already defined).
   */
  $acf_license_result = bl_install_write_acf_pro_license(
    (string) ($_POST['install']['acf_pro_key'] ?? '')
  );
  if (is_wp_error($acf_license_result)) {
    baselayer_install_redirect_with_errors([$acf_license_result->get_error_message()]);
  }

  /**
   * Activate ACF Pro when present but inactive.
   */
  bl_install_activate_acf_pro();

  /**
   * Standard pages (always). Menus are assigned after content types are registered.
   */
  $page_ids = bl_install_seed_content();

  update_option('default_role', 'editor');

  if ($current_id) {
    update_user_meta($current_id, 'admin_color', 'baselayer');
  }
  if ($new_developer_user_id > 0) {
    update_user_meta($new_developer_user_id, 'admin_color', 'baselayer');
  }

  /**
   * Content types: copy with child theme (or patch parent), set enabled flags, seed examples.
   */
  $content_flags = bl_install_content_flags_from_request();
  $content_types_dir = bl_install_content_types_dir_for_theme(get_template());

  /**
   * Create child theme before marking setup complete (parent folder stays baselayer).
   */
  $child_slug = null;
  if (bl_install_should_create_child_theme()) {
    $child_slug = bl_install_create_child_theme([
      'name' => $theme_name,
      'slug' => $theme_slug,
      'description' => $theme_desc,
      'author' => $theme_author,
      'author_uri' => $theme_author_uri,
    ]);

    if (is_wp_error($child_slug)) {
      baselayer_install_redirect_with_errors([$child_slug->get_error_message()]);
    }

    if (is_string($child_slug) && $child_slug !== '') {
      $content_types_dir = bl_install_content_types_dir_for_theme($child_slug);
    }
  }

  bl_install_apply_content_type_enabled($content_types_dir, [
    'post'     => !empty($content_flags['post']),
    'projects' => !empty($content_flags['projects']),
    'event'    => !empty($content_flags['event']),
  ]);

  update_option('baselayer_install_success', true);

  if (is_string($child_slug) && $child_slug !== '') {
    switch_theme($child_slug);
  }

  // Theme switch mid-request: re-register CPTs from the active theme before menus/seed.
  bl_install_bootstrap_content_types();
  flush_rewrite_rules(false);

  bl_install_assign_menus($page_ids, $content_flags);
  bl_install_seed_content_type_examples($content_flags);

  /**
   * Redirect
   */
  wp_safe_redirect(
    admin_url('themes.php?page=baselayer-install&baselayer_success=1')
  );
  exit;
}

/**
 * Get nav menu term_id by config slug; create menu and assign to location if missing.
 *
 * @param string $menu_slug Key from config menus (e.g. "main_menu", "footer_menu").
 * @return int Nav menu term ID.
 * @throws RuntimeException If menu config is missing for the slug.
 */
function bl_get_or_create_menu_id(string $menu_slug): int
{
  $menu_config = function_exists('bl_theme_menu') ? bl_theme_menu($menu_slug) : null;
  if ($menu_config === null) {
    throw new RuntimeException("Menu config missing for slug: {$menu_slug}");
  }
  $menu_name = $menu_config['title'];

  $menu = wp_get_nav_menu_object($menu_name);

  if ($menu) {
    $menu_id = (int) $menu->term_id;
    // Theme switch clears nav_menu_locations for the new theme; always re-assign.
    bl_assign_menu_to_location($menu_slug, $menu_id);

    return $menu_id;
  }

  // Create menu with name
  $menu_id = wp_create_nav_menu($menu_name);
  bl_assign_menu_to_location($menu_slug, $menu_id);

  return (int) $menu_id;
}

/**
 * Assign a nav menu to a theme location (e.g. main_menu, footer_menu).
 *
 * @param string $location Theme location key from config.
 * @param int    $menu_id  Nav menu term ID.
 * @return void
 */
function bl_assign_menu_to_location(string $location, int $menu_id): void
{
  $locations = get_theme_mod('nav_menu_locations', []);

  // Only update if not already assigned
  if (!isset($locations[$location]) || (int) $locations[$location] !== $menu_id) {
    $locations[$location] = $menu_id;
    set_theme_mod('nav_menu_locations', $locations);
  }
}
