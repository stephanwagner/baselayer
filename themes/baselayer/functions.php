<?php

defined('ABSPATH') || exit;

// Foundation
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/language.php';
require_once __DIR__ . '/includes/features.php';

// HTTP & Global
require_once __DIR__ . '/includes/headers.php';
require_once __DIR__ . '/includes/clean-up.php';
require_once __DIR__ . '/includes/head.php';

// Core Theme
require_once __DIR__ . '/includes/theme-setup.php';
require_once __DIR__ . '/includes/menu.php';
require_once __DIR__ . '/includes/design.php';
require_once __DIR__ . '/includes/redirects.php';
require_once __DIR__ . '/includes/search.php';
require_once __DIR__ . '/includes/analytics.php';
require_once __DIR__ . '/includes/admin-bar.php';
require_once __DIR__ . '/includes/admin-theme.php';

// Blocks
require_once __DIR__ . '/includes/blocks.php';
require_once __DIR__ . '/includes/block-settings.php';
require_once __DIR__ . '/includes/editor-icons.php';

// Block options (package-owned; load even when Blocks CPT feature is off).
if (!defined('BL_BLOCKS_LOADED')) {
	require_once __DIR__ . '/packages/baselayer-blocks/includes/block-options/bootstrap.php';
}

// Theme settings
require_once __DIR__ . '/includes/user-rights.php';
require_once __DIR__ . '/includes/profile-picture.php';
require_once __DIR__ . '/includes/theme-settings.php';
require_once __DIR__ . '/includes/admin-notice.php';
require_once __DIR__ . '/includes/developer-settings.php';

// Admin-only (dashboard / media sizes). Install wizard is loaded after CPTs below.
if (is_admin()) {
	require_once __DIR__ . '/includes/dashboard.php';
	require_once __DIR__ . '/includes/media-sizes.php';
	require_once __DIR__ . '/includes/admin-post-states.php';
}

// Helpers
require_once __DIR__ . '/includes/helpers/page-blocker.php';
require_once __DIR__ . '/includes/helpers/templates.php';
require_once __DIR__ . '/includes/helpers/blocks.php';

// Features
require_once __DIR__ . '/includes/login-client-logo.php';
require_once __DIR__ . '/includes/assets.php';
require_once __DIR__ . '/includes/canvas-builder.php';
require_once __DIR__ . '/includes/form-builder.php';
require_once __DIR__ . '/includes/helpers/images.php';
require_once __DIR__ . '/includes/service-worker.php';
require_once __DIR__ . '/includes/custom-post-types.php';
require_once __DIR__ . '/includes/article-list-filters.php';
require_once __DIR__ . '/includes/exclude-from-search.php';
require_once __DIR__ . '/includes/page-editor-options.php';
require_once __DIR__ . '/includes/page-fields.php';
require_once __DIR__ . '/includes/hero.php';
require_once __DIR__ . '/includes/notices.php';
require_once __DIR__ . '/includes/password-form.php';

// Events package (before install wizard so CPT seeding sees event types).
if (bl_theme_feature_enabled('events')) {
	require_once __DIR__ . '/packages/baselayer-events/baselayer-events.php';
}

// Install wizard: must load after custom-post-types.php so CPT registration
// exists when the installer seeds projects/events on form POST.
if (is_admin() && (!bl_setup_completed() || isset($_GET['baselayer_success']))) {
	require_once __DIR__ . '/includes/install/install.php';
}

// Mail, Matomo
require_once __DIR__ . '/includes/mail.php';
require_once __DIR__ . '/includes/matomo.php';
require_once __DIR__ . '/includes/weekly-report.php';

// Security
require_once __DIR__ . '/includes/security/password-protection.php';
require_once __DIR__ . '/includes/security/maintenance-mode.php';
require_once __DIR__ . '/includes/security/login-limit.php';
require_once __DIR__ . '/includes/security/rest-api.php';

// Optional features
if (bl_theme_feature_enabled('forms')) {
	require_once __DIR__ . '/packages/baselayer-forms/baselayer-forms.php';
}
if (bl_theme_feature_enabled('blocks')) {
	require_once __DIR__ . '/packages/baselayer-blocks/baselayer-blocks.php';
}
require_once __DIR__ . '/includes/website-settings.php';
if (bl_theme_feature_enabled('editorial')) {
	require_once __DIR__ . '/packages/baselayer-editorial/baselayer-editorial.php';
}
if (bl_theme_feature_enabled('svg')) {
	require_once __DIR__ . '/includes/svg-support.php';
}
if (bl_theme_feature_enabled('duplicate_post')) {
	require_once __DIR__ . '/includes/duplicate-post.php';
}
if (bl_theme_feature_enabled('seo')) {
	require_once __DIR__ . '/includes/seo.php';
}

require_once __DIR__ . '/includes/schema.php';

require_once __DIR__ . '/includes/social-media.php';

if (bl_theme_feature_enabled('breadcrumbs')) {
	require_once __DIR__ . '/includes/helpers/breadcrumbs.php';
}
if (bl_theme_feature_enabled('post_expirator')) {
	require_once __DIR__ . '/includes/post-expirator.php';
}
if (bl_theme_feature_enabled('languages')) {
	require_once __DIR__ . '/includes/language-flags.php';
	require_once __DIR__ . '/includes/language-switcher.php';
	if (function_exists('bl_uses_google_translate') && bl_uses_google_translate()) {
		require_once __DIR__ . '/includes/google-translate.php';
	} else {
		require_once __DIR__ . '/includes/content-languages.php';
	}
}
if (bl_theme_feature_enabled('blocked_ips')) {
	require_once __DIR__ . '/includes/security/ip-blocker.php';
}
if (bl_theme_feature_enabled('webp')) {
	require_once __DIR__ . '/includes/image-webp.php';
}
if (bl_theme_feature_enabled('media_folders')) {
	require_once __DIR__ . '/includes/media-library-folders.php';
}

if (!function_exists('bl_breadcrumbs')) {
	function bl_breadcrumbs(array $args = []): string
	{
		return '';
	}
}

// Optional ACF Pro theme integration (gated by Developer → Features / install choice).
if (bl_theme_feature_enabled('acf')) {
	foreach ([get_stylesheet_directory(), get_template_directory()] as $bl_acf_dir) {
		$bl_acf_bootstrap = $bl_acf_dir . '/acf/acf.php';
		if (is_readable($bl_acf_bootstrap)) {
			require_once $bl_acf_bootstrap;
			break;
		}
	}
	unset($bl_acf_dir, $bl_acf_bootstrap);

	// Field-group import notice (parent copy; works with child or parent acf/).
	$bl_acf_import_notice = get_template_directory() . '/acf/includes/acf-import-notice.php';
	if (is_readable($bl_acf_import_notice)) {
		require_once $bl_acf_import_notice;
	}
	unset($bl_acf_import_notice);
}
