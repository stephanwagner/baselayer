<?php

defined('ABSPATH') || exit;

// Foundation
require_once 'inc/bootstrap.php';
require_once 'inc/config.php';
require_once 'inc/language.php';
require_once 'inc/features.php';

// HTTP & Global
require_once 'inc/headers.php';
require_once 'inc/clean-up.php';
require_once 'inc/head.php';

// Core Theme
require_once 'inc/theme-setup.php';
require_once 'inc/menu.php';
require_once 'inc/design.php';
require_once 'inc/redirects.php';
require_once 'inc/search.php';
require_once 'inc/analytics.php';
require_once 'inc/admin-bar.php';
require_once 'inc/admin-theme.php';

// Blocks
require_once 'inc/blocks.php';
require_once 'inc/blocks/blocks.php';
require_once 'inc/block-settings.php';
require_once 'inc/editor-icons.php';

// Theme settings
require_once 'inc/user-rights.php';
require_once 'inc/profile-picture.php';
require_once 'inc/theme-settings.php';
require_once 'inc/admin-notice.php';
require_once 'inc/developer-settings.php';

// Admin-only (dashboard / media sizes). Install wizard is loaded after CPTs below.
if (is_admin()) {
	require_once 'inc/dashboard.php';
	require_once 'inc/media-sizes.php';
	require_once 'inc/admin-post-states.php';
}

// Helpers
require_once 'inc/helpers/page-blocker.php';
require_once 'inc/helpers/templates.php';

// Features
require_once 'inc/login-client-logo.php';
require_once 'inc/assets.php';
require_once 'inc/helpers/images.php';
require_once 'inc/service-worker.php';
require_once 'inc/custom-post-types.php';
require_once 'inc/article-list-filters.php';
require_once 'inc/events.php';
require_once 'inc/exclude-from-search.php';
require_once 'inc/page-editor-options.php';

// Install wizard: must load after custom-post-types.php so CPT registration
// exists when the installer seeds projects/events on form POST.
if (is_admin() && (!bl_setup_completed() || isset($_GET['baselayer_success']))) {
	require_once 'inc/install/install.php';
}

// Mail, Matomo
require_once 'inc/mail.php';
require_once 'inc/matomo.php';
require_once 'inc/weekly-report.php';

// Security
require_once 'inc/security/password-protection.php';
require_once 'inc/security/maintenance-mode.php';
require_once 'inc/security/login-limit.php';
require_once 'inc/security/rest-api.php';

// Optional features
if (bl_theme_feature_enabled('svg')) {
	require_once 'inc/svg-support.php';
}
if (bl_theme_feature_enabled('duplicate_post')) {
	require_once 'inc/duplicate-post.php';
}
if (bl_theme_feature_enabled('seo')) {
	require_once 'inc/seo.php';
}

require_once 'inc/schema.php';

require_once 'inc/social-media.php';

if (bl_theme_feature_enabled('breadcrumbs')) {
	require_once 'inc/helpers/breadcrumbs.php';
}
if (bl_theme_feature_enabled('post_expirator')) {
	require_once 'inc/post-expirator.php';
}
if (bl_theme_feature_enabled('languages')) {
	require_once 'inc/language-flags.php';
	require_once 'inc/language-switcher.php';
	if (function_exists('bl_uses_google_translate') && bl_uses_google_translate()) {
		require_once 'inc/google-translate.php';
	} else {
		require_once 'inc/content-languages.php';
	}
}
if (bl_theme_feature_enabled('blocked_ips')) {
	require_once 'inc/security/ip-blocker.php';
}
if (bl_theme_feature_enabled('webp')) {
	require_once 'inc/image-webp.php';
}
if (bl_theme_feature_enabled('media_folders')) {
	require_once 'inc/media-library-folders.php';
}

if (!function_exists('bl_breadcrumbs')) {
	function bl_breadcrumbs(array $args = []): string
	{
		return '';
	}
}

// ACF
require_once 'acf/acf.php';
require_once 'acf/acf-import-notice.php';
