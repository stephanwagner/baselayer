<?php

defined('ABSPATH') || exit;

const FS_BLOCK_SETTINGS_OPTION = 'fromscratch_block_settings';
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

	return [
		'settings'            => $settings,
		'hardDisallowed'      => $hard_disallowed,
		'categoryLabels'      => $category_labels,
		'configurableGroups'  => $configurable_groups,
		'systemBlocks'        => $system_blocks,
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
	return [
		'hidden'          => fs_block_settings_hidden_names(),
		'favorites'       => fs_block_settings_favorite_names(),
		'hardDisallowed'  => fs_block_settings_hard_disallowed(),
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
