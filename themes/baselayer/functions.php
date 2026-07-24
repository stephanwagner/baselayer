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
require_once __DIR__ . '/includes/blocks/blocks.php';
require_once __DIR__ . '/includes/block-settings.php';
require_once __DIR__ . '/includes/editor-icons.php';

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

// Features
require_once __DIR__ . '/includes/login-client-logo.php';
require_once __DIR__ . '/includes/assets.php';
require_once __DIR__ . '/includes/helpers/images.php';
require_once __DIR__ . '/includes/service-worker.php';
require_once __DIR__ . '/includes/custom-post-types.php';
require_once __DIR__ . '/includes/article-list-filters.php';
require_once __DIR__ . '/includes/events.php';
require_once __DIR__ . '/includes/exclude-from-search.php';
require_once __DIR__ . '/includes/page-editor-options.php';

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

// ACF
require_once __DIR__ . '/acf/acf.php';
require_once __DIR__ . '/acf/acf-import-notice.php';
