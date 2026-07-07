<?php

defined('ABSPATH') || exit;

const FS_BLOCK_SETTINGS_OPTION = 'fromscratch_block_settings';
const FS_BLOCK_VARIATION_SETTINGS_OPTION = 'fromscratch_block_variation_settings';
const FS_EMBED_VARIATION_SETTINGS_OPTION = 'fromscratch_embed_variation_settings';
const FS_BLOCK_SETTINGS_FAVORITES_CATEGORY = 'fromscratch-favorites';

/**
 * Load block-settings config from config/block-settings.php.
 *
 * @param string|null $key Optional dot path.
 * @return array|mixed
 */
function fs_config_block_settings(?string $key = null)
{
	static $config = null;

	if ($config === null) {
		$config = include get_template_directory() . '/config/block-settings.php';
		if (!is_array($config)) {
			$config = [];
		}
	}

	return function_exists('fs_config_resolve') ? fs_config_resolve($config, $key) : $config;
}

/**
 * Block names hard-disallowed in code (not overridable in UI).
 *
 * @return string[]
 */
function fs_block_settings_hard_disallowed(): array
{
	$list = fs_config_block_settings('hardDisallowed');
	if (!is_array($list)) {
		return [];
	}

	return array_values(array_filter(array_map('strval', $list)));
}

/**
 * Whether a block is hard-disallowed in code.
 */
function fs_block_settings_is_hard_disallowed(string $block_name): bool
{
	return in_array($block_name, fs_block_settings_hard_disallowed(), true);
}

/**
 * Default flags for a block (from config/block-settings.php).
 *
 * @return array{allowed: int, hidden: int, favorite: int}
 */
function fs_block_settings_default_flags(string $block_name): array
{
	if (fs_block_settings_is_hard_disallowed($block_name)) {
		return [
			'allowed'  => 0,
			'hidden'   => 0,
			'favorite' => 0,
		];
	}

	$global = fs_config_block_settings('default');
	if (!is_array($global)) {
		$global = [];
	}

	$blocks = fs_config_block_settings('blocks');
	$per_block = is_array($blocks) && isset($blocks[$block_name]) && is_array($blocks[$block_name])
		? $blocks[$block_name]
		: [];

	$merged = array_merge([
		'allowed'  => true,
		'hidden'   => false,
		'favorite' => false,
	], $global, $per_block);

	$allowed = !empty($merged['allowed']) ? 1 : 0;
	$hidden = $allowed && !empty($merged['hidden']) ? 1 : 0;
	$favorite = $allowed && !$hidden && !empty($merged['favorite']) ? 1 : 0;

	return [
		'allowed'  => $allowed,
		'hidden'   => $hidden,
		'favorite' => $favorite,
	];
}

/**
 * Sanitize stored block settings.
 *
 * @param mixed $value
 * @return array<string, array{allowed: int, hidden: int, favorite: int}>
 */
function fs_sanitize_block_settings($value): array
{
	if (!is_array($value)) {
		return [];
	}

	$registry = WP_Block_Type_Registry::get_instance();
	$out = [];

	foreach ($value as $block_name => $flags) {
		if (!is_string($block_name) || !is_array($flags)) {
			continue;
		}

		if (!$registry->is_registered($block_name)) {
			continue;
		}

		if (fs_block_settings_is_child_only($block_name)) {
			continue;
		}

		if (fs_block_settings_is_hard_disallowed($block_name)) {
			$out[$block_name] = [
				'allowed'  => 0,
				'hidden'   => 0,
				'favorite' => 0,
			];
			continue;
		}

		$allowed = !empty($flags['allowed']) ? 1 : 0;
		$hidden = $allowed && !empty($flags['hidden']) ? 1 : 0;
		$favorite = $allowed && !$hidden && !empty($flags['favorite']) ? 1 : 0;

		$out[$block_name] = [
			'allowed'  => $allowed,
			'hidden'   => $hidden,
			'favorite' => $favorite,
		];
	}

	return $out;
}

/**
 * Block names that have configurable inserter variations (from config).
 *
 * @return string[]
 */
function fs_block_variation_configured_blocks(): array
{
	$config = fs_config_block_settings('blockVariations');
	if (is_array($config) && $config !== []) {
		return array_values(array_filter(array_map('strval', array_keys($config))));
	}

	if (fs_config_block_settings('embedVariations') !== null) {
		return ['core/embed'];
	}

	return [];
}

/**
 * Per-block variation config from block-settings.php.
 *
 * @return array<string, mixed>
 */
function fs_block_variation_block_config(string $block_name): array
{
	$config = fs_config_block_settings('blockVariations');
	if (is_array($config) && isset($config[$block_name]) && is_array($config[$block_name])) {
		return $config[$block_name];
	}

	if ($block_name === 'core/embed') {
		$legacy = fs_config_block_settings('embedVariations');
		return is_array($legacy) ? $legacy : [];
	}

	return [];
}

/**
 * Variation slugs hard-disallowed for a block (code-only, not overridable in UI).
 *
 * @return string[]
 */
function fs_block_variation_hard_disallowed(string $block_name): array
{
	$config = fs_block_variation_block_config($block_name);
	if (!is_array($config) || empty($config['hardDisallowed']) || !is_array($config['hardDisallowed'])) {
		return [];
	}

	return array_values(array_filter(array_map('strval', $config['hardDisallowed'])));
}

/**
 * Whether a block variation is hard-disallowed in code.
 */
function fs_block_variation_is_hard_disallowed(string $block_name, string $slug): bool
{
	return in_array($slug, fs_block_variation_hard_disallowed($block_name), true);
}

/**
 * Whether a parent block is allowed in the editor.
 */
function fs_block_settings_is_block_allowed(string $block_name): bool
{
	$settings = fs_block_settings_get_all();

	return !empty($settings[$block_name]['allowed']);
}

/**
 * Default allowed flag for a block variation slug (from config).
 *
 * @return array{allowed: int}
 */
function fs_block_variation_default_flags(string $block_name, string $slug): array
{
	if (fs_block_variation_is_hard_disallowed($block_name, $slug)) {
		return [
			'allowed' => 0,
		];
	}

	$config = fs_block_variation_block_config($block_name);
	$global = isset($config['default']) && is_array($config['default']) ? $config['default'] : [];
	$variations = isset($config['variations']) && is_array($config['variations']) ? $config['variations'] : [];
	$per_variation = isset($variations[$slug]) && is_array($variations[$slug]) ? $variations[$slug] : [];

	$merged = array_merge([
		'allowed' => true,
	], $global, $per_variation);

	return [
		'allowed' => !empty($merged['allowed']) ? 1 : 0,
	];
}

/**
 * Whether the generic inserter item for a block should show (non-variation parent tile).
 * Variation curation does not hide the parent block — use `blocks` to disable entirely.
 */
function fs_block_variation_allow_generic_inserter(string $block_name): bool
{
	unset($block_name);

	return true;
}

/**
 * All variation slugs known from config defaults for a block.
 *
 * @return string[]
 */
function fs_block_variation_config_slugs(string $block_name): array
{
	$config = fs_block_variation_block_config($block_name);
	if (!is_array($config) || empty($config['variations']) || !is_array($config['variations'])) {
		return [];
	}

	return array_values(array_filter(array_map('strval', array_keys($config['variations']))));
}

/**
 * Stored block variation settings (with legacy embed option migration).
 *
 * @return array<string, array<string, array{allowed: int}>>
 */
function fs_block_variation_settings_get_stored(): array
{
	static $cached = null;

	if ($cached !== null) {
		return $cached;
	}

	$stored = get_option(FS_BLOCK_VARIATION_SETTINGS_OPTION, []);
	if (!is_array($stored)) {
		$stored = [];
	}

	if ($stored === []) {
		$legacy = get_option(FS_EMBED_VARIATION_SETTINGS_OPTION, []);
		if (is_array($legacy) && $legacy !== []) {
			$stored = ['core/embed' => $legacy];
		}
	}

	$cached = $stored;

	return $cached;
}

/**
 * Merged variation settings for one block (config defaults + database).
 *
 * @return array<string, array{allowed: int}>
 */
function fs_block_variation_settings_get_for_block(string $block_name): array
{
	$stored = fs_block_variation_settings_get_stored();
	$block_stored = isset($stored[$block_name]) && is_array($stored[$block_name]) ? $stored[$block_name] : [];
	$slugs = array_unique(array_merge(fs_block_variation_config_slugs($block_name), array_keys($block_stored)));
	$out = [];

	foreach ($slugs as $slug) {
		if (!is_string($slug) || $slug === '') {
			continue;
		}

		$defaults = fs_block_variation_default_flags($block_name, $slug);
		$saved = isset($block_stored[$slug]) && is_array($block_stored[$slug]) ? $block_stored[$slug] : [];
		$flags = array_merge($defaults, $saved);

		if (fs_block_variation_is_hard_disallowed($block_name, $slug)) {
			$flags['allowed'] = 0;
		}

		$out[$slug] = [
			'allowed' => !empty($flags['allowed']) ? 1 : 0,
			'hardDisallowed' => fs_block_variation_is_hard_disallowed($block_name, $slug),
		];
	}

	ksort($out);

	return $out;
}

/**
 * Merged variation settings for all configured blocks.
 *
 * @return array<string, array<string, array{allowed: int}>>
 */
function fs_block_variation_settings_get_all(): array
{
	$out = [];

	foreach (fs_block_variation_configured_blocks() as $block_name) {
		$out[$block_name] = fs_block_variation_settings_get_for_block($block_name);
	}

	return $out;
}

/**
 * Whether core/embed is allowed in the editor.
 */
function fs_block_settings_is_embed_allowed(): bool
{
	return fs_block_settings_is_block_allowed('core/embed');
}

/**
 * @deprecated Use fs_block_variation_default_flags('core/embed', $slug).
 * @return array{allowed: int}
 */
function fs_embed_variation_default_flags(string $slug): array
{
	return fs_block_variation_default_flags('core/embed', $slug);
}

/**
 * @deprecated Use fs_block_variation_allow_generic_inserter('core/embed').
 */
function fs_embed_variation_allow_generic_embed(): bool
{
	return fs_block_variation_allow_generic_inserter('core/embed');
}

/**
 * @deprecated Use fs_block_variation_settings_get_for_block('core/embed').
 * @return array<string, array{allowed: int}>
 */
function fs_embed_variation_settings_get_all(): array
{
	return fs_block_variation_settings_get_for_block('core/embed');
}

/**
 * Sanitize stored block variation settings.
 *
 * @param mixed $value
 * @return array<string, array<string, array{allowed: int}>>
 */
function fs_sanitize_block_variation_settings($value): array
{
	if (!is_array($value)) {
		return [];
	}

	$out = [];

	foreach ($value as $block_name => $variations) {
		if (!is_string($block_name) || $block_name === '' || !is_array($variations)) {
			continue;
		}

		if (!in_array($block_name, fs_block_variation_configured_blocks(), true)) {
			continue;
		}

		$out[$block_name] = [];

		foreach ($variations as $slug => $flags) {
			if (!is_string($slug) || $slug === '' || !is_array($flags)) {
				continue;
			}

			$out[$block_name][$slug] = [
				'allowed' => fs_block_variation_is_hard_disallowed($block_name, $slug) ? 0 : (!empty($flags['allowed']) ? 1 : 0),
			];
		}
	}

	return $out;
}

/**
 * @deprecated Use fs_sanitize_block_variation_settings().
 * @param mixed $value
 * @return array<string, array{allowed: int}>
 */
function fs_sanitize_embed_variation_settings($value): array
{
	if (!is_array($value)) {
		return [];
	}

	$out = [];

	foreach ($value as $slug => $flags) {
		if (!is_string($slug) || $slug === '' || !is_array($flags)) {
			continue;
		}

		$out[$slug] = [
			'allowed' => !empty($flags['allowed']) ? 1 : 0,
		];
	}

	return $out;
}

/**
 * Parse posted block variation settings from the admin React app.
 *
 * @return array<string, array<string, array{allowed: int}>>
 */
function fs_block_variation_settings_parse_posted_settings(): array
{
	$raw = null;

	if (!empty($_POST['fromscratch_block_variations_json'])) {
		$raw = wp_unslash((string) $_POST['fromscratch_block_variations_json']);
	} elseif (!empty($_POST['fromscratch_embed_variations_json'])) {
		$raw = wp_unslash((string) $_POST['fromscratch_embed_variations_json']);
	}

	if ($raw === null) {
		return [];
	}

	$decoded = json_decode($raw, true);
	if (!is_array($decoded)) {
		return [];
	}

	$first_key = array_key_first($decoded);
	if (is_string($first_key) && isset($decoded[$first_key]) && is_array($decoded[$first_key]) && array_key_exists('allowed', $decoded[$first_key])) {
		return ['core/embed' => fs_sanitize_embed_variation_settings($decoded)];
	}

	$out = [];

	foreach ($decoded as $block_name => $variations) {
		if (!is_string($block_name) || $block_name === '' || !is_array($variations)) {
			continue;
		}

		$out[$block_name] = [];

		foreach ($variations as $slug => $flags) {
			if (!is_string($slug) || $slug === '' || !is_array($flags)) {
				continue;
			}

			$out[$block_name][$slug] = [
				'allowed' => fs_block_variation_is_hard_disallowed($block_name, $slug) ? 0 : (!empty($flags['allowed']) ? 1 : 0),
			];
		}
	}

	return $out;
}

/**
 * @deprecated Use fs_block_variation_settings_parse_posted_settings().
 * @return array<string, array{allowed: int}>
 */
function fs_embed_variation_settings_parse_posted_settings(): array
{
	$parsed = fs_block_variation_settings_parse_posted_settings();

	return $parsed['core/embed'] ?? [];
}

/**
 * Contextual help for hard-disallowed block variations (admin vs developer).
 *
 * @return array<string, string>|null
 */
function fs_block_variation_system_help(): ?array
{
	$has_hard_disallowed = false;

	foreach (fs_block_variation_configured_blocks() as $block_name) {
		if (fs_block_variation_hard_disallowed($block_name) !== []) {
			$has_hard_disallowed = true;
			break;
		}
	}

	if (!$has_hard_disallowed) {
		return null;
	}

	$is_developer = function_exists('fs_is_developer_user') && fs_is_developer_user((int) get_current_user_id());

	if ($is_developer) {
		return [
			'type'       => 'developer',
			'configPath' => 'config/block-settings.php',
			'configKey'  => 'blockVariations.*.hardDisallowed',
		];
	}

	$email = function_exists('fs_developer_email') ? fs_developer_email() : '';
	if ($email !== '' && !is_email($email)) {
		$email = '';
	}

	return [
		'type'  => 'admin',
		'email' => $email,
	];
}

/**
 * Export block variation settings for JS config.
 *
 * @return array<string, mixed>
 */
function fs_block_variation_admin_export(): array
{
	$settings = [];
	$defaults = [];
	$default_allowed = [];
	$allow_generic_inserter = [];
	$hard_disallowed = [];

	foreach (fs_block_variation_configured_blocks() as $block_name) {
		$config = fs_block_variation_block_config($block_name);
		$global = isset($config['default']) && is_array($config['default']) ? $config['default'] : [];
		$default_allowed[$block_name] = !empty($global['allowed']);
		$allow_generic_inserter[$block_name] = fs_block_variation_allow_generic_inserter($block_name);
		$hard_disallowed[$block_name] = fs_block_variation_hard_disallowed($block_name);

		$settings[$block_name] = [];
		foreach (fs_block_variation_settings_get_for_block($block_name) as $slug => $flags) {
			$settings[$block_name][$slug] = [
				'allowed' => !empty($flags['allowed']),
				'hardDisallowed' => !empty($flags['hardDisallowed']),
			];
		}

		$defaults[$block_name] = [];
		foreach (fs_block_variation_config_slugs($block_name) as $slug) {
			$defaults[$block_name][$slug] = [
				'allowed' => !empty(fs_block_variation_default_flags($block_name, $slug)['allowed']),
			];
		}
	}

	return [
		'blocks'               => fs_block_variation_configured_blocks(),
		'settings'             => $settings,
		'defaults'             => $defaults,
		'defaultAllowed'       => $default_allowed,
		'allowGenericInserter' => $allow_generic_inserter,
		'hardDisallowed'       => $hard_disallowed,
	];
}

/**
 * Export block variation settings for the block editor.
 *
 * @return array<string, mixed>
 */
function fs_block_variation_editor_export(): array
{
	$export = fs_block_variation_admin_export();
	$settings = [];
	$block_allowed = [];

	foreach ($export['blocks'] as $block_name) {
		$block_allowed[$block_name] = fs_block_settings_is_block_allowed($block_name);
		$settings[$block_name] = [];

		foreach ($export['settings'][$block_name] ?? [] as $slug => $flags) {
			$settings[$block_name][$slug] = !empty($flags['allowed']);
		}
	}

	return [
		'blocks'                 => $export['blocks'],
		'settings'               => $settings,
		'defaultAllowed'         => $export['defaultAllowed'],
		'allowGenericInserter'   => $export['allowGenericInserter'],
		'hardDisallowed'         => $export['hardDisallowed'],
		'blockAllowed'           => $block_allowed,
	];
}

/**
 * Whether a block is only insertable inside a parent (not top-level inserter).
 */
function fs_block_settings_is_child_only(string $block_name): bool
{
	$registry = WP_Block_Type_Registry::get_instance();
	if (!$registry->is_registered($block_name)) {
		return false;
	}

	$block = $registry->get_registered($block_name);
	$parent = isset($block->parent) ? $block->parent : null;

	return is_array($parent) && $parent !== [];
}

/**
 * Merged settings for all configurable top-level blocks.
 *
 * @return array<string, array{allowed: int, hidden: int, favorite: int, hardDisallowed: bool}>
 */
function fs_block_settings_get_all(): array
{
	$registry = WP_Block_Type_Registry::get_instance();
	$stored = get_option(FS_BLOCK_SETTINGS_OPTION, []);
	if (!is_array($stored)) {
		$stored = [];
	}

	$out = [];

	foreach ($registry->get_all_registered() as $block_name => $block) {
		if (fs_block_settings_is_child_only($block_name)) {
			continue;
		}

		$defaults = fs_block_settings_default_flags($block_name);
		$saved = isset($stored[$block_name]) && is_array($stored[$block_name]) ? $stored[$block_name] : [];
		$flags = array_merge($defaults, $saved);

		if (fs_block_settings_is_hard_disallowed($block_name)) {
			$flags = [
				'allowed'  => 0,
				'hidden'   => 0,
				'favorite' => 0,
			];
		} else {
			$allowed = !empty($flags['allowed']) ? 1 : 0;
			$hidden = $allowed && !empty($flags['hidden']) ? 1 : 0;
			$favorite = $allowed && !$hidden && !empty($flags['favorite']) ? 1 : 0;
			$flags = [
				'allowed'  => $allowed,
				'hidden'   => $hidden,
				'favorite' => $favorite,
			];
		}

		$flags['hardDisallowed'] = fs_block_settings_is_hard_disallowed($block_name);
		$out[$block_name] = $flags;
	}

	ksort($out);

	return $out;
}

/**
 * Block names that are not allowed in the editor.
 *
 * @return string[]
 */
function fs_block_settings_disallowed_names(): array
{
	$names = [];

	foreach (fs_block_settings_get_all() as $block_name => $flags) {
		if (empty($flags['allowed'])) {
			$names[] = $block_name;
		}
	}

	return $names;
}

/**
 * Block names hidden from the default inserter (but allowed).
 *
 * @return string[]
 */
function fs_block_settings_hidden_names(): array
{
	$names = [];

	foreach (fs_block_settings_get_all() as $block_name => $flags) {
		if (!empty($flags['allowed']) && !empty($flags['hidden'])) {
			$names[] = $block_name;
		}
	}

	return $names;
}

/**
 * Block names marked as favorites.
 *
 * @return string[]
 */
function fs_block_settings_favorite_names(): array
{
	$names = [];

	foreach (fs_block_settings_get_all() as $block_name => $flags) {
		if (!empty($flags['allowed']) && empty($flags['hidden']) && !empty($flags['favorite'])) {
			$names[] = $block_name;
		}
	}

	return $names;
}

/**
 * Registry rows grouped by category for the admin UI.
 *
 * @return array<string, array<int, array<string, mixed>>>
 */
function fs_block_settings_registry_by_category(): array
{
	$registry = WP_Block_Type_Registry::get_instance();
	$settings = fs_block_settings_get_all();
	$groups = [];

	foreach ($registry->get_all_registered() as $block_name => $block) {
		if (fs_block_settings_is_child_only($block_name)) {
			continue;
		}

		$category = is_string($block->category) && $block->category !== '' ? $block->category : 'uncategorized';
		$flags = $settings[$block_name] ?? fs_block_settings_default_flags($block_name);

		if (!isset($groups[$category])) {
			$groups[$category] = [];
		}

		$groups[$category][] = [
			'name'            => $block_name,
			'title'           => $block->title,
			'icon'            => $block->icon,
			'allowed'         => !empty($flags['allowed']),
			'hidden'          => !empty($flags['hidden']),
			'favorite'        => !empty($flags['favorite']),
			'hardDisallowed'  => !empty($flags['hardDisallowed']),
		];
	}

	foreach ($groups as $category => $blocks) {
		usort($groups[$category], static function ($a, $b) {
			return strcasecmp((string) $a['title'], (string) $b['title']);
		});
	}

	uksort($groups, static function ($a, $b) use ($groups) {
		$title_a = fs_block_settings_category_label($a);
		$title_b = fs_block_settings_category_label($b);

		return strcasecmp($title_a, $title_b);
	});

	return $groups;
}

/**
 * Registry rows grouped by category, excluding hard-disallowed blocks.
 *
 * @return array<string, array<int, array<string, mixed>>>
 */
function fs_block_settings_registry_configurable_by_category(): array
{
	$groups = fs_block_settings_registry_by_category();
	$out = [];

	foreach ($groups as $category => $blocks) {
		$configurable = array_values(array_filter($blocks, static function ($block) {
			return empty($block['hardDisallowed']);
		}));

		if ($configurable !== []) {
			$out[$category] = $configurable;
		}
	}

	return $out;
}

/**
 * Hard-disallowed blocks for the read-only system list.
 *
 * @return array<int, array<string, mixed>>
 */
function fs_block_settings_system_blocks(): array
{
	$blocks = [];

	foreach (fs_block_settings_registry_by_category() as $category => $rows) {
		foreach ($rows as $block) {
			if (empty($block['hardDisallowed'])) {
				continue;
			}

			$blocks[] = array_merge($block, [
				'category' => $category,
			]);
		}
	}

	return $blocks;
}

/**
 * Contextual help for the system-locked blocks panel (admin vs developer).
 *
 * @return array<string, string>|null
 */
function fs_block_settings_system_blocks_help(): ?array
{
	if (fs_block_settings_hard_disallowed() === []) {
		return null;
	}

	$is_developer = function_exists('fs_is_developer_user') && fs_is_developer_user((int) get_current_user_id());

	if ($is_developer) {
		return [
			'type'       => 'developer',
			'configPath' => 'config/block-settings.php',
			'configKey'  => 'hardDisallowed',
		];
	}

	$email = function_exists('fs_developer_email') ? fs_developer_email() : '';
	if ($email !== '' && !is_email($email)) {
		$email = '';
	}

	return [
		'type'  => 'admin',
		'email' => $email,
	];
}

/**
 * Map of ACF block names to icon markup from acf/blocks.php.
 *
 * @return array<string, string>
 */
function fs_block_settings_admin_icon_map(): array
{
	static $map = null;

	if ($map !== null) {
		return $map;
	}

	$map = [];
	$path = get_template_directory() . '/acf/blocks.php';

	if (!is_readable($path)) {
		return $map;
	}

	$blocks = include $path;
	if (!is_array($blocks)) {
		return $map;
	}

	foreach ($blocks as $block) {
		if (!is_array($block) || empty($block['name']) || empty($block['icon']) || !is_string($block['icon'])) {
			continue;
		}

		$name = (string) $block['name'];
		if (!str_starts_with($name, 'acf/')) {
			$name = 'acf/' . $name;
		}

		$map[$name] = $block['icon'];
	}

	return $map;
}

/**
 * Resolve the icon markup for a block in the admin UI.
 *
 * @param mixed $registry_icon
 */
function fs_block_settings_admin_resolve_icon(string $block_name, $registry_icon): ?string
{
	$acf_icons = fs_block_settings_admin_icon_map();
	if (isset($acf_icons[$block_name])) {
		return $acf_icons[$block_name];
	}

	return fs_block_settings_admin_export_icon($registry_icon);
}

/**
 * Export a block icon for the admin React app (dashicon slug or inline SVG).
 *
 * @param mixed $icon
 */
function fs_block_settings_admin_export_icon($icon): ?string
{
	if (!is_string($icon) || $icon === '') {
		return null;
	}

	return $icon;
}

/**
 * Admin UI config for the React block settings app.
 *
 * @return array<string, mixed>
 */
function fs_block_settings_admin_config(): array
{
	$settings = [];

	foreach (fs_block_settings_get_all() as $name => $flags) {
		$settings[$name] = [
			'allowed'         => !empty($flags['allowed']),
			'hidden'          => !empty($flags['hidden']),
			'favorite'        => !empty($flags['favorite']),
			'hardDisallowed'  => !empty($flags['hardDisallowed']),
		];
	}

	$category_labels = [];
	foreach (array_keys(fs_block_settings_registry_by_category()) as $category) {
		$category_labels[$category] = fs_block_settings_category_label($category);
	}

	$hard_disallowed = fs_block_settings_hard_disallowed();

	$configurable_groups = [];
	foreach (fs_block_settings_registry_configurable_by_category() as $category => $blocks) {
		$configurable_groups[] = [
			'category' => $category,
			'label'    => fs_block_settings_category_label($category),
			'blocks'   => array_values(array_map(static function (array $block): array {
				return [
					'name'  => $block['name'],
					'title' => (string) $block['title'],
					'icon'  => fs_block_settings_admin_resolve_icon($block['name'], $block['icon'] ?? null),
				];
			}, $blocks)),
		];
	}

	$system_blocks = array_values(array_map(static function (array $block): array {
		return [
			'name'     => $block['name'],
			'title'    => (string) $block['title'],
			'category' => $block['category'] ?? 'uncategorized',
			'icon'     => fs_block_settings_admin_resolve_icon($block['name'], $block['icon'] ?? null),
		];
	}, fs_block_settings_system_blocks()));

	$block_variation_export = fs_block_variation_admin_export();

	return [
		'settings'            => $settings,
		'hardDisallowed'      => $hard_disallowed,
		'categoryLabels'      => $category_labels,
		'configurableGroups'  => $configurable_groups,
		'systemBlocks'        => $system_blocks,
		'systemBlocksHelp'    => fs_block_settings_system_blocks_help(),
		'blockVariationBlocks' => $block_variation_export['blocks'],
		'blockVariationSettings' => $block_variation_export['settings'],
		'blockVariationDefaults' => $block_variation_export['defaults'],
		'blockVariationDefaultAllowed' => $block_variation_export['defaultAllowed'],
		'blockVariationAllowGenericInserter' => $block_variation_export['allowGenericInserter'],
		'blockVariationHardDisallowed' => $block_variation_export['hardDisallowed'],
		'blockVariationSystemHelp'    => fs_block_variation_system_help(),
		'i18n'                => [
			'intro'                   => __('Control which blocks are available in the page editor inserter (+).', 'fromscratch'),
			'searchPlaceholder'       => __('Search blocks…', 'fromscratch'),
			'hidden'                  => __('Hidden', 'fromscratch'),
			'favorites'               => __('Favorites', 'fromscratch'),
			'allowedInInserter'       => __('Allowed in inserter', 'fromscratch'),
			'inserterVisibility'      => __('Inserter visibility', 'fromscratch'),
			'hiddenBySystem'          => __('Hidden by system', 'fromscratch'),
			'systemBlocksToggle'      => _n('%d block hidden by system', '%d blocks hidden by system', count($hard_disallowed), 'fromscratch'),
			'systemBlocksDescription' => __('These blocks are disabled in code and cannot be enabled here.', 'fromscratch'),
			'systemBlocksHelpAdmin'   => __('You can ask a developer to unlock these blocks:', 'fromscratch'),
			'systemBlocksHelpDeveloperBefore' => __('To change this list, edit', 'fromscratch'),
			'systemBlocksHelpDeveloperAfter'  => __('in the theme.', 'fromscratch'),
			'save'                    => __('Save Changes', 'fromscratch'),
			'filterAllowed'           => __('Allowed in inserter', 'fromscratch'),
			'filterHidden'            => __('Inserter visibility', 'fromscratch'),
			'filterFavorite'          => __('Favorites', 'fromscratch'),
			'filterAll'               => __('All', 'fromscratch'),
			'filtersLabel'            => __('Filters:', 'fromscratch'),
			'filterActive'            => __('Active', 'fromscratch'),
			'filterInactive'          => __('Inactive', 'fromscratch'),
			'filterNotHidden'         => __('Not hidden', 'fromscratch'),
			'filterNotFavorite'       => __('Not favorite', 'fromscratch'),
			'noResults'               => __('No blocks match the current search or filters.', 'fromscratch'),
			'variationOf'             => __('Variation of', 'fromscratch'),
			'parentBlockDisabled'     => __('Enable the parent block to manage this variation.', 'fromscratch'),
			'variationHiddenBySystem' => __('Variation hidden by system', 'fromscratch'),
		],
	];
}

/**
 * Parse posted block settings from the admin React app.
 *
 * @return array<string, array<string, int>>
 */
function fs_block_settings_parse_posted_settings(): array
{
	if (!empty($_POST['fromscratch_block_settings_json'])) {
		$decoded = json_decode(wp_unslash((string) $_POST['fromscratch_block_settings_json']), true);
		if (is_array($decoded)) {
			$out = [];
			foreach ($decoded as $block_name => $flags) {
				if (!is_string($block_name) || !is_array($flags)) {
					continue;
				}
				$out[$block_name] = [
					'allowed'  => !empty($flags['allowed']) ? 1 : 0,
					'hidden'   => !empty($flags['hidden']) ? 1 : 0,
					'favorite' => !empty($flags['favorite']) ? 1 : 0,
				];
			}

			return $out;
		}
	}

	$posted = isset($_POST['fromscratch_block_settings']) && is_array($_POST['fromscratch_block_settings'])
		? wp_unslash($_POST['fromscratch_block_settings'])
		: [];

	$out = [];
	foreach ($posted as $block_name => $flags) {
		if (!is_string($block_name) || !is_array($flags)) {
			continue;
		}
		$out[$block_name] = $flags;
	}

	return $out;
}

/**
 * Human-readable block category label.
 */
function fs_block_settings_category_label(string $slug): string
{
	$labels = [
		'text'         => __('Text', 'fromscratch'),
		'media'        => __('Media', 'fromscratch'),
		'design'       => __('Design', 'fromscratch'),
		'widgets'      => __('Widgets', 'fromscratch'),
		'theme'        => __('Theme', 'fromscratch'),
		'embed'        => __('Embeds', 'fromscratch'),
		'reusable'     => __('Reusable blocks', 'fromscratch'),
		'uncategorized'=> __('Uncategorized', 'fromscratch'),
	];

	if (isset($labels[$slug])) {
		return $labels[$slug];
	}

	return ucwords(str_replace(['-', '_'], ' ', $slug));
}

/**
 * Config passed to the block editor script.
 *
 * @return array<string, mixed>
 */
function fs_block_settings_editor_config(): array
{
	$block_variation_export = fs_block_variation_editor_export();

	return [
		'hidden'          => fs_block_settings_hidden_names(),
		'favorites'       => fs_block_settings_favorite_names(),
		'hardDisallowed'  => fs_block_settings_hard_disallowed(),
		'blockVariationBlocks' => $block_variation_export['blocks'],
		'blockVariationSettings' => $block_variation_export['settings'],
		'blockVariationDefaultAllowed' => $block_variation_export['defaultAllowed'],
		'blockVariationAllowGenericInserter' => $block_variation_export['allowGenericInserter'],
		'blockVariationHardDisallowed' => $block_variation_export['hardDisallowed'],
		'blockVariationBlockAllowed' => $block_variation_export['blockAllowed'],
		'favoritesCategory' => FS_BLOCK_SETTINGS_FAVORITES_CATEGORY,
		'preferencesScope' => 'fromscratch',
		'preferencesKey' => 'showHiddenBlocks',
		'i18n'            => [
			'showHiddenBlocks'  => __('Show all blocks', 'fromscratch'),
			'hideHiddenBlocks'  => __('Show fewer blocks', 'fromscratch'),
			'hiddenBlocksPanel' => __('Hidden blocks', 'fromscratch'),
			'favoritesCategory' => __('Favorites', 'fromscratch'),
		],
	];
}

/**
 * Filter allowed block types for the editor.
 *
 * @param bool|string[] $allowed_blocks
 * @param WP_Block_Editor_Context $editor_context
 * @return bool|string[]
 */
function fs_block_settings_filter_allowed_block_types($allowed_blocks, $editor_context)
{
	unset($editor_context);

	if ($allowed_blocks === true) {
		$allowed_blocks = array_keys(WP_Block_Type_Registry::get_instance()->get_all_registered());
	}

	if (!is_array($allowed_blocks)) {
		return $allowed_blocks;
	}

	$disallowed = fs_block_settings_disallowed_names();

	return array_values(array_diff($allowed_blocks, $disallowed));
}

add_filter('allowed_block_types_all', 'fs_block_settings_filter_allowed_block_types', 10, 2);

/**
 * Register Favorites category first in the inserter.
 *
 * @param array<int, array<string, mixed>> $categories
 * @return array<int, array<string, mixed>>
 */
function fs_block_settings_register_favorites_category(array $categories, $editor_context = null): array
{
	unset($editor_context);
	if (fs_block_settings_favorite_names() === []) {
		return $categories;
	}

	$favorites = [
		'slug'  => FS_BLOCK_SETTINGS_FAVORITES_CATEGORY,
		'title' => __('Favorites', 'fromscratch'),
		'icon'  => 'star-filled',
	];

	return array_merge([$favorites], $categories);
}

add_filter('block_categories_all', 'fs_block_settings_register_favorites_category', 5, 2);
