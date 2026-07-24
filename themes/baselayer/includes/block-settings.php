<?php

defined('ABSPATH') || exit;

const BL_BLOCK_SETTINGS_OPTION = 'baselayer_block_settings';
const BL_BLOCK_VARIATION_SETTINGS_OPTION = 'baselayer_block_variation_settings';
const BL_EMBED_VARIATION_SETTINGS_OPTION = 'baselayer_embed_variation_settings';
const BL_BLOCK_SETTINGS_FAVORITES_CATEGORY = 'baselayer-favorites';

/**
 * Load block-settings config from config/block-settings.php.
 *
 * @param string|null $key Optional dot path.
 * @return array|mixed
 */
function bl_config_block_settings(?string $key = null)
{
	static $config = null;

	if ($config === null) {
		$config = function_exists('bl_load_theme_config_file')
			? bl_load_theme_config_file('config/block-settings.php')
			: [];
		if (!is_array($config)) {
			$config = [];
		}
	}

	return function_exists('bl_config_resolve') ? bl_config_resolve($config, $key) : $config;
}

/**
 * Block names hard-disallowed in code (not overridable in UI).
 *
 * @return string[]
 */
function bl_block_settings_hard_disallowed(): array
{
	$list = bl_config_block_settings('hardDisallowed');
	if (!is_array($list)) {
		return [];
	}

	return array_values(array_filter(array_map('strval', $list)));
}

/**
 * Whether a block is hard-disallowed in code.
 */
function bl_block_settings_is_hard_disallowed(string $block_name): bool
{
	return in_array($block_name, bl_block_settings_hard_disallowed(), true);
}

/**
 * Default flags for a block (from config/block-settings.php).
 *
 * @return array{allowed: int, hidden: int, favorite: int}
 */
function bl_block_settings_default_flags(string $block_name): array
{
	if (bl_block_settings_is_hard_disallowed($block_name)) {
		return [
			'allowed'  => 0,
			'hidden'   => 0,
			'favorite' => 0,
		];
	}

	$global = bl_config_block_settings('default');
	if (!is_array($global)) {
		$global = [];
	}

	$blocks = bl_config_block_settings('blocks');
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
function bl_sanitize_block_settings($value): array
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

		if (!bl_block_settings_is_manageable_block($block_name)) {
			continue;
		}

		if (bl_block_settings_is_hard_disallowed($block_name)) {
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
function bl_block_variation_configured_blocks(): array
{
	$config = bl_config_block_settings('blockVariations');
	if (is_array($config) && $config !== []) {
		return array_values(array_filter(array_map('strval', array_keys($config))));
	}

	if (bl_config_block_settings('embedVariations') !== null) {
		return ['core/embed'];
	}

	return [];
}

/**
 * Per-block variation config from block-settings.php.
 *
 * @return array<string, mixed>
 */
function bl_block_variation_block_config(string $block_name): array
{
	$config = bl_config_block_settings('blockVariations');
	if (is_array($config) && isset($config[$block_name]) && is_array($config[$block_name])) {
		return $config[$block_name];
	}

	if ($block_name === 'core/embed') {
		$legacy = bl_config_block_settings('embedVariations');
		return is_array($legacy) ? $legacy : [];
	}

	return [];
}

/**
 * Variation slugs hard-disallowed for a block (code-only, not overridable in UI).
 *
 * @return string[]
 */
function bl_block_variation_hard_disallowed(string $block_name): array
{
	$config = bl_block_variation_block_config($block_name);
	if (!is_array($config) || empty($config['hardDisallowed']) || !is_array($config['hardDisallowed'])) {
		return [];
	}

	return array_values(array_filter(array_map('strval', $config['hardDisallowed'])));
}

/**
 * Whether a block variation is hard-disallowed in code.
 */
function bl_block_variation_is_hard_disallowed(string $block_name, string $slug): bool
{
	return in_array($slug, bl_block_variation_hard_disallowed($block_name), true);
}

/**
 * Whether a parent block is allowed in the editor.
 */
function bl_block_settings_is_block_allowed(string $block_name): bool
{
	$settings = bl_block_settings_get_all();

	return !empty($settings[$block_name]['allowed']);
}

/**
 * Default allowed flag for a block variation slug (from config).
 *
 * @return array{allowed: int}
 */
function bl_block_variation_default_flags(string $block_name, string $slug): array
{
	if (bl_block_variation_is_hard_disallowed($block_name, $slug)) {
		return [
			'allowed' => 0,
		];
	}

	$config = bl_block_variation_block_config($block_name);
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
function bl_block_variation_allow_generic_inserter(string $block_name): bool
{
	unset($block_name);

	return true;
}

/**
 * All variation slugs known from config defaults for a block.
 *
 * @return string[]
 */
function bl_block_variation_config_slugs(string $block_name): array
{
	$config = bl_block_variation_block_config($block_name);
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
function bl_block_variation_settings_get_stored(): array
{
	static $cached = null;

	if ($cached !== null) {
		return $cached;
	}

	$stored = get_option(BL_BLOCK_VARIATION_SETTINGS_OPTION, []);
	if (!is_array($stored)) {
		$stored = [];
	}

	if ($stored === []) {
		$legacy = get_option(BL_EMBED_VARIATION_SETTINGS_OPTION, []);
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
function bl_block_variation_settings_get_for_block(string $block_name): array
{
	$stored = bl_block_variation_settings_get_stored();
	$block_stored = isset($stored[$block_name]) && is_array($stored[$block_name]) ? $stored[$block_name] : [];
	$slugs = array_unique(array_merge(bl_block_variation_config_slugs($block_name), array_keys($block_stored)));
	$out = [];

	foreach ($slugs as $slug) {
		if (!is_string($slug) || $slug === '') {
			continue;
		}

		$defaults = bl_block_variation_default_flags($block_name, $slug);
		$saved = isset($block_stored[$slug]) && is_array($block_stored[$slug]) ? $block_stored[$slug] : [];
		$flags = array_merge($defaults, $saved);

		if (bl_block_variation_is_hard_disallowed($block_name, $slug)) {
			$flags['allowed'] = 0;
		}

		$out[$slug] = [
			'allowed' => !empty($flags['allowed']) ? 1 : 0,
			'hardDisallowed' => bl_block_variation_is_hard_disallowed($block_name, $slug),
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
function bl_block_variation_settings_get_all(): array
{
	$out = [];

	foreach (bl_block_variation_configured_blocks() as $block_name) {
		$out[$block_name] = bl_block_variation_settings_get_for_block($block_name);
	}

	return $out;
}

/**
 * Whether core/embed is allowed in the editor.
 */
function bl_block_settings_is_embed_allowed(): bool
{
	return bl_block_settings_is_block_allowed('core/embed');
}

/**
 * @deprecated Use bl_block_variation_default_flags('core/embed', $slug).
 * @return array{allowed: int}
 */
function bl_embed_variation_default_flags(string $slug): array
{
	return bl_block_variation_default_flags('core/embed', $slug);
}

/**
 * @deprecated Use bl_block_variation_allow_generic_inserter('core/embed').
 */
function bl_embed_variation_allow_generic_embed(): bool
{
	return bl_block_variation_allow_generic_inserter('core/embed');
}

/**
 * @deprecated Use bl_block_variation_settings_get_for_block('core/embed').
 * @return array<string, array{allowed: int}>
 */
function bl_embed_variation_settings_get_all(): array
{
	return bl_block_variation_settings_get_for_block('core/embed');
}

/**
 * Sanitize stored block variation settings.
 *
 * @param mixed $value
 * @return array<string, array<string, array{allowed: int}>>
 */
function bl_sanitize_block_variation_settings($value): array
{
	if (!is_array($value)) {
		return [];
	}

	$out = [];

	foreach ($value as $block_name => $variations) {
		if (!is_string($block_name) || $block_name === '' || !is_array($variations)) {
			continue;
		}

		if (!in_array($block_name, bl_block_variation_configured_blocks(), true)) {
			continue;
		}

		$out[$block_name] = [];

		foreach ($variations as $slug => $flags) {
			if (!is_string($slug) || $slug === '' || !is_array($flags)) {
				continue;
			}

			$out[$block_name][$slug] = [
				'allowed' => bl_block_variation_is_hard_disallowed($block_name, $slug) ? 0 : (!empty($flags['allowed']) ? 1 : 0),
			];
		}
	}

	return $out;
}

/**
 * @deprecated Use bl_sanitize_block_variation_settings().
 * @param mixed $value
 * @return array<string, array{allowed: int}>
 */
function bl_sanitize_embed_variation_settings($value): array
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
function bl_block_variation_settings_parse_posted_settings(): array
{
	$raw = null;

	if (!empty($_POST['baselayer_block_variations_json'])) {
		$raw = wp_unslash((string) $_POST['baselayer_block_variations_json']);
	} elseif (!empty($_POST['baselayer_embed_variations_json'])) {
		$raw = wp_unslash((string) $_POST['baselayer_embed_variations_json']);
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
		return ['core/embed' => bl_sanitize_embed_variation_settings($decoded)];
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
				'allowed' => bl_block_variation_is_hard_disallowed($block_name, $slug) ? 0 : (!empty($flags['allowed']) ? 1 : 0),
			];
		}
	}

	return $out;
}

/**
 * @deprecated Use bl_block_variation_settings_parse_posted_settings().
 * @return array<string, array{allowed: int}>
 */
function bl_embed_variation_settings_parse_posted_settings(): array
{
	$parsed = bl_block_variation_settings_parse_posted_settings();

	return $parsed['core/embed'] ?? [];
}

/**
 * Export block variation settings for JS config.
 *
 * @return array<string, mixed>
 */
function bl_block_variation_admin_export(): array
{
	$settings = [];
	$defaults = [];
	$default_allowed = [];
	$allow_generic_inserter = [];
	$hard_disallowed = [];

	foreach (bl_block_variation_configured_blocks() as $block_name) {
		$config = bl_block_variation_block_config($block_name);
		$global = isset($config['default']) && is_array($config['default']) ? $config['default'] : [];
		$default_allowed[$block_name] = !empty($global['allowed']);
		$allow_generic_inserter[$block_name] = bl_block_variation_allow_generic_inserter($block_name);
		$hard_disallowed[$block_name] = bl_block_variation_hard_disallowed($block_name);

		$settings[$block_name] = [];
		foreach (bl_block_variation_settings_get_for_block($block_name) as $slug => $flags) {
			$settings[$block_name][$slug] = [
				'allowed' => !empty($flags['allowed']),
				'hardDisallowed' => !empty($flags['hardDisallowed']),
			];
		}

		$defaults[$block_name] = [];
		foreach (bl_block_variation_config_slugs($block_name) as $slug) {
			$defaults[$block_name][$slug] = [
				'allowed' => !empty(bl_block_variation_default_flags($block_name, $slug)['allowed']),
			];
		}
	}

	return [
		'blocks'               => bl_block_variation_configured_blocks(),
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
function bl_block_variation_editor_export(): array
{
	$export = bl_block_variation_admin_export();
	$settings = [];
	$block_allowed = [];

	foreach ($export['blocks'] as $block_name) {
		$block_allowed[$block_name] = bl_block_settings_is_block_allowed($block_name);
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
 * Parent and ancestor block names a block may be inserted into.
 *
 * @return string[]
 */
function bl_block_settings_block_parent_names(string $block_name): array
{
	$registry = WP_Block_Type_Registry::get_instance();
	if (!$registry->is_registered($block_name)) {
		return [];
	}

	$block = $registry->get_registered($block_name);
	$parents = [];

	if (isset($block->parent) && is_array($block->parent)) {
		$parents = array_merge($parents, $block->parent);
	}

	if (isset($block->ancestor) && is_array($block->ancestor)) {
		$parents = array_merge($parents, $block->ancestor);
	}

	return array_values(array_unique(array_filter(array_map('strval', $parents))));
}

/**
 * Root-level child block (parent is only core/post-content, e.g. Page Break).
 */
function bl_block_settings_is_root_only_child_block(string $block_name): bool
{
	return bl_block_settings_block_parent_names($block_name) === ['core/post-content'];
}

/**
 * Nested child block (column, list-item, accordion-item, …) — not manageable in Theme → Blocks.
 */
function bl_block_settings_is_internal_child_block(string $block_name): bool
{
	$parents = bl_block_settings_block_parent_names($block_name);

	return $parents !== [] && !bl_block_settings_is_root_only_child_block($block_name);
}

/**
 * Whether a block can appear in Theme → Blocks (top-level or root-only child).
 */
function bl_block_settings_is_manageable_block(string $block_name): bool
{
	return !bl_block_settings_is_internal_child_block($block_name);
}

/**
 * Whether a block is only insertable inside a parent (legacy helper).
 */
function bl_block_settings_is_child_only(string $block_name): bool
{
	return bl_block_settings_block_parent_names($block_name) !== [];
}

/**
 * Merged settings for all configurable top-level blocks.
 *
 * @return array<string, array{allowed: int, hidden: int, favorite: int, hardDisallowed: bool}>
 */
function bl_block_settings_get_all(): array
{
	$registry = WP_Block_Type_Registry::get_instance();
	$stored = get_option(BL_BLOCK_SETTINGS_OPTION, []);
	if (!is_array($stored)) {
		$stored = [];
	}

	$out = [];

	foreach ($registry->get_all_registered() as $block_name => $block) {
		if (!bl_block_settings_is_manageable_block($block_name)) {
			continue;
		}

		$defaults = bl_block_settings_default_flags($block_name);
		$saved = isset($stored[$block_name]) && is_array($stored[$block_name]) ? $stored[$block_name] : [];
		$flags = array_merge($defaults, $saved);

		if (bl_block_settings_is_hard_disallowed($block_name)) {
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

		$flags['hardDisallowed'] = bl_block_settings_is_hard_disallowed($block_name);
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
function bl_block_settings_disallowed_names(): array
{
	$names = [];

	foreach (bl_block_settings_get_all() as $block_name => $flags) {
		if (empty($flags['allowed'])) {
			$names[] = $block_name;
		}
	}

	$hard = bl_block_settings_hard_disallowed();
	$names = array_merge($names, $hard);

	$registry = WP_Block_Type_Registry::get_instance();
	foreach ($registry->get_all_registered() as $block_name => $block) {
		unset($block);

		$parents = bl_block_settings_block_parent_names($block_name);
		if ($parents === []) {
			continue;
		}

		if (array_intersect($parents, $hard) !== []) {
			$names[] = $block_name;
		}
	}

	return array_values(array_unique($names));
}

/**
 * Block names hidden from the default inserter (but allowed).
 *
 * @return string[]
 */
function bl_block_settings_hidden_names(): array
{
	$names = [];

	foreach (bl_block_settings_get_all() as $block_name => $flags) {
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
function bl_block_settings_favorite_names(): array
{
	$names = [];

	foreach (bl_block_settings_get_all() as $block_name => $flags) {
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
function bl_block_settings_registry_by_category(): array
{
	$registry = WP_Block_Type_Registry::get_instance();
	$settings = bl_block_settings_get_all();
	$groups = [];

	foreach ($registry->get_all_registered() as $block_name => $block) {
		if (!bl_block_settings_is_manageable_block($block_name)) {
			continue;
		}

		$category = is_string($block->category) && $block->category !== '' ? $block->category : 'uncategorized';
		$flags = $settings[$block_name] ?? bl_block_settings_default_flags($block_name);

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
		$title_a = bl_block_settings_category_label($a);
		$title_b = bl_block_settings_category_label($b);

		return strcasecmp($title_a, $title_b);
	});

	return $groups;
}

/**
 * Registry rows grouped by category, excluding hard-disallowed blocks.
 *
 * @return array<string, array<int, array<string, mixed>>>
 */
function bl_block_settings_registry_configurable_by_category(): array
{
	$groups = bl_block_settings_registry_by_category();
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
function bl_block_settings_system_blocks(): array
{
	$registry = WP_Block_Type_Registry::get_instance();
	$blocks = [];

	foreach (bl_block_settings_hard_disallowed() as $block_name) {
		if (!$registry->is_registered($block_name)) {
			continue;
		}

		$block = $registry->get_registered($block_name);
		$category = is_string($block->category) && $block->category !== '' ? $block->category : 'uncategorized';

		$blocks[] = [
			'name'           => $block_name,
			'title'          => $block->title,
			'icon'           => $block->icon,
			'category'       => $category,
			'allowed'        => false,
			'hidden'         => false,
			'favorite'       => false,
			'hardDisallowed' => true,
		];
	}

	usort($blocks, static function (array $a, array $b): int {
		return strcasecmp((string) $a['title'], (string) $b['title']);
	});

	return $blocks;
}

/**
 * Contextual help for the system-locked blocks panel (admin vs developer).
 *
 * @return array<string, string>|null
 */
function bl_block_settings_system_blocks_help(): ?array
{
	if (bl_block_settings_hard_disallowed() === []) {
		return null;
	}

	$is_developer = function_exists('bl_is_developer_user') && bl_is_developer_user((int) get_current_user_id());

	if ($is_developer) {
		return [
			'type'       => 'developer',
			'configPath' => 'config/block-settings.php',
			'configKey'  => 'hardDisallowed',
		];
	}

	$email = function_exists('bl_developer_email') ? bl_developer_email() : '';
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
function bl_block_settings_admin_icon_map(): array
{
	static $map = null;

	if ($map !== null) {
		return $map;
	}

	$map = [];
	$blocks = function_exists('bl_get_acf_blocks') ? bl_get_acf_blocks() : [];

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
function bl_block_settings_admin_resolve_icon(string $block_name, $registry_icon): ?string
{
	$acf_icons = bl_block_settings_admin_icon_map();
	if (isset($acf_icons[$block_name])) {
		return $acf_icons[$block_name];
	}

	return bl_block_settings_admin_export_icon($registry_icon);
}

/**
 * Export a block icon for the admin React app (dashicon slug or inline SVG).
 *
 * @param mixed $icon
 */
function bl_block_settings_admin_export_icon($icon): ?string
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
function bl_block_settings_admin_config(): array
{
	$settings = [];

	foreach (bl_block_settings_get_all() as $name => $flags) {
		$settings[$name] = [
			'allowed'         => !empty($flags['allowed']),
			'hidden'          => !empty($flags['hidden']),
			'favorite'        => !empty($flags['favorite']),
			'hardDisallowed'  => !empty($flags['hardDisallowed']),
		];
	}

	$category_labels = [];
	foreach (array_keys(bl_block_settings_registry_by_category()) as $category) {
		$category_labels[$category] = bl_block_settings_category_label($category);
	}

	$hard_disallowed = bl_block_settings_hard_disallowed();

	$configurable_groups = [];
	foreach (bl_block_settings_registry_configurable_by_category() as $category => $blocks) {
		$configurable_groups[] = [
			'category' => $category,
			'label'    => bl_block_settings_category_label($category),
			'blocks'   => array_values(array_map(static function (array $block): array {
				return [
					'name'  => $block['name'],
					'title' => (string) $block['title'],
					'icon'  => bl_block_settings_admin_resolve_icon($block['name'], $block['icon'] ?? null),
				];
			}, $blocks)),
		];
	}

	$system_blocks = array_values(array_map(static function (array $block): array {
		return [
			'name'     => $block['name'],
			'title'    => (string) $block['title'],
			'category' => $block['category'] ?? 'uncategorized',
			'icon'     => bl_block_settings_admin_resolve_icon($block['name'], $block['icon'] ?? null),
		];
	}, bl_block_settings_system_blocks()));

	$block_variation_export = bl_block_variation_admin_export();

	$variation_hard_count = 0;
	foreach (bl_block_variation_configured_blocks() as $block_name) {
		$variation_hard_count += count(bl_block_variation_hard_disallowed($block_name));
	}
	$system_item_count = count($hard_disallowed) + $variation_hard_count;

	return [
		'settings'            => $settings,
		'hardDisallowed'      => $hard_disallowed,
		'categoryLabels'      => $category_labels,
		'configurableGroups'  => $configurable_groups,
		'systemBlocks'        => $system_blocks,
		'systemBlocksHelp'    => bl_block_settings_system_blocks_help(),
		'blockVariationBlocks' => $block_variation_export['blocks'],
		'blockVariationSettings' => $block_variation_export['settings'],
		'blockVariationDefaults' => $block_variation_export['defaults'],
		'blockVariationDefaultAllowed' => $block_variation_export['defaultAllowed'],
		'blockVariationAllowGenericInserter' => $block_variation_export['allowGenericInserter'],
		'blockVariationHardDisallowed' => $block_variation_export['hardDisallowed'],
		'i18n'                => [
			'pageTitle'               => __('Blocks', 'baselayer'),
			'intro'                   => __('Control which blocks are available in the page editor inserter.', 'baselayer'),
			'searchPlaceholder'       => __('Search blocks…', 'baselayer'),
			'hidden'                  => __('Hidden', 'baselayer'),
			'favorite'               => __('Favorite', 'baselayer'),
			'favorites'               => __('Favorites', 'baselayer'),
			'allowedInInserter'       => __('Allowed in inserter', 'baselayer'),
			'inserterVisibility'      => __('Inserter visibility', 'baselayer'),
			'hiddenBySystem'          => __('Hidden by system', 'baselayer'),
			'systemItemsToggle'       => _n('%d item hidden by system', '%d items hidden by system', max(1, $system_item_count), 'baselayer'),
			'systemBlocksToggle'      => _n('%d block hidden by system', '%d blocks hidden by system', count($hard_disallowed), 'baselayer'),
			'systemBlocksDescription' => __('These blocks and block variations are disabled in code and cannot be enabled here.', 'baselayer'),
			'systemBlocksHelpAdmin'   => __('You can ask a developer to unlock these blocks:', 'baselayer'),
			'systemBlocksHelpDeveloper' => __('To change this list, edit <filepath/> (<configkey/>) in the theme.', 'baselayer'),
			'save'                    => __('Save Changes', 'baselayer'),
			'filterAllowed'           => __('Allowed in inserter', 'baselayer'),
			'filterHidden'            => __('Inserter visibility', 'baselayer'),
			'filterFavorite'          => __('Favorites', 'baselayer'),
			'filterAll'               => __('All', 'baselayer'),
			'filtersLabel'            => __('Filters:', 'baselayer'),
			'filterActive'            => __('Active', 'baselayer'),
			'filterInactive'          => __('Inactive', 'baselayer'),
			'filterNotHidden'         => __('Not hidden', 'baselayer'),
			'filterNotFavorite'       => __('Not favorite', 'baselayer'),
			'noResults'               => __('No blocks match the current search or filters.', 'baselayer'),
			'variationOf'             => __('Variation of', 'baselayer'),
			'parentBlockDisabled'     => __('Enable the parent block to manage this variation.', 'baselayer'),
			'variationHiddenBySystem' => __('Variation hidden by system', 'baselayer'),
		],
	];
}

/**
 * Parse posted block settings from the admin React app.
 *
 * @return array<string, array<string, int>>
 */
function bl_block_settings_parse_posted_settings(): array
{
	if (!empty($_POST['baselayer_block_settings_json'])) {
		$decoded = json_decode(wp_unslash((string) $_POST['baselayer_block_settings_json']), true);
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

	$posted = isset($_POST['baselayer_block_settings']) && is_array($_POST['baselayer_block_settings'])
		? wp_unslash($_POST['baselayer_block_settings'])
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
function bl_block_settings_category_label(string $slug): string
{
	$labels = [
		'text'         => __('Text', 'baselayer'),
		'media'        => __('Media', 'baselayer'),
		'design'       => __('Design', 'baselayer'),
		'widgets'      => __('Widgets', 'baselayer'),
		'theme'        => __('Theme', 'baselayer'),
		'embed'        => __('Embeds', 'baselayer'),
		'reusable'     => __('Reusable blocks', 'baselayer'),
		'uncategorized'=> __('Uncategorized', 'baselayer'),
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
function bl_block_settings_editor_config(): array
{
	$block_variation_export = bl_block_variation_editor_export();

	return [
		'hidden'          => bl_block_settings_hidden_names(),
		'favorites'       => bl_block_settings_favorite_names(),
		'hardDisallowed'  => bl_block_settings_hard_disallowed(),
		'blockVariationBlocks' => $block_variation_export['blocks'],
		'blockVariationSettings' => $block_variation_export['settings'],
		'blockVariationDefaultAllowed' => $block_variation_export['defaultAllowed'],
		'blockVariationAllowGenericInserter' => $block_variation_export['allowGenericInserter'],
		'blockVariationHardDisallowed' => $block_variation_export['hardDisallowed'],
		'blockVariationBlockAllowed' => $block_variation_export['blockAllowed'],
		'favoritesCategory' => BL_BLOCK_SETTINGS_FAVORITES_CATEGORY,
		'preferencesScope' => 'baselayer',
		'preferencesKey' => 'showHiddenBlocks',
		'i18n'            => [
			'showAllBlocks' => __('All blocks', 'baselayer'),
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
function bl_block_settings_filter_allowed_block_types($allowed_blocks, $editor_context)
{
	unset($editor_context);

	if ($allowed_blocks === true) {
		$allowed_blocks = array_keys(WP_Block_Type_Registry::get_instance()->get_all_registered());
	}

	if (!is_array($allowed_blocks)) {
		return $allowed_blocks;
	}

	$disallowed = bl_block_settings_disallowed_names();

	return array_values(array_diff($allowed_blocks, $disallowed));
}

add_filter('allowed_block_types_all', 'bl_block_settings_filter_allowed_block_types', 10, 2);

/**
 * Register Favorites category first in the inserter.
 *
 * @param array<int, array<string, mixed>> $categories
 * @return array<int, array<string, mixed>>
 */
function bl_block_settings_register_favorites_category(array $categories, $editor_context = null): array
{
	unset($editor_context);
	if (bl_block_settings_favorite_names() === []) {
		return $categories;
	}

	$favorites = [
		'slug'  => BL_BLOCK_SETTINGS_FAVORITES_CATEGORY,
		'title' => __('Favorites', 'baselayer'),
		'icon'  => 'star-filled',
	];

	return array_merge([$favorites], $categories);
}

add_filter('block_categories_all', 'bl_block_settings_register_favorites_category', 5, 2);
