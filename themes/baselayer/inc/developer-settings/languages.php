<?php

defined('ABSPATH') || exit;

$bl_developer_tab = 'languages';
$bl_developer_page_slug = bl_developer_settings_page_slug($bl_developer_tab);

add_action('admin_menu', function () use ($bl_developer_tab, $bl_developer_page_slug) {
	if (!current_user_can('manage_options')) {
		return;
	}
	if (!function_exists('bl_is_developer_user') || !bl_is_developer_user((int) get_current_user_id())) {
		return;
	}
	$tabs = bl_developer_settings_available_tabs();
	if (!isset($tabs[$bl_developer_tab])) {
		return;
	}
	$label = $tabs[$bl_developer_tab]['label'];
	add_submenu_page(
		'options-general.php',
		__('Developer settings', 'baselayer') . ' – ' . $label,
		sprintf(__('Developer › %s', 'baselayer'), $label),
		'manage_options',
		$bl_developer_page_slug,
		'bl_render_developer_languages',
		bl_developer_tab_position($bl_developer_tab)
	);
}, 20);

add_action('admin_init', function () use ($bl_developer_page_slug) {
	global $pagenow;
	if ($pagenow !== 'options-general.php' || $_SERVER['REQUEST_METHOD'] !== 'POST') {
		return;
	}
	if ((isset($_GET['page']) ? $_GET['page'] : '') !== $bl_developer_page_slug) {
		return;
	}
	if (!current_user_can('manage_options') || !function_exists('bl_is_developer_user') || !bl_is_developer_user((int) get_current_user_id())) {
		return;
	}
	if (empty($_POST['option_page']) || $_POST['option_page'] !== BL_THEME_OPTION_GROUP_LANGUAGES || empty($_POST['_wpnonce']) || !wp_verify_nonce($_POST['_wpnonce'], BL_THEME_OPTION_GROUP_LANGUAGES . '-options')) {
		return;
	}
	$value = isset($_POST['bl_theme_languages']) && is_array($_POST['bl_theme_languages']) ? $_POST['bl_theme_languages'] : [];
	$raw_list = isset($value['list']) && is_array($value['list']) ? $value['list'] : [];
	$raw_ids = [];
	foreach ($raw_list as $row) {
		if (is_array($row) && isset($row['id'])) {
			$rid = strtolower(trim((string) $row['id']));
			if ($rid !== '') {
				$raw_ids[] = $rid;
			}
		}
	}
	$counts = array_count_values($raw_ids);
	$duplicate_codes = [];
	foreach ($counts as $code => $count) {
		if ($count > 1) {
			$duplicate_codes[] = $code;
		}
	}
	if (!empty($duplicate_codes)) {
		set_transient('baselayer_languages_duplicate_codes', $duplicate_codes, 60);
		wp_safe_redirect(admin_url('options-general.php?page=fs-developer-languages'));
		exit;
	}
	$sanitized = function_exists('bl_sanitize_theme_languages') ? bl_sanitize_theme_languages($value) : ['list' => [], 'default' => '', 'use_url_prefix' => true, 'prefix_default' => false, 'no_translation' => 'disabled'];
	update_option('bl_theme_languages', $sanitized);
	flush_rewrite_rules(true);
	set_transient('baselayer_languages_saved', '1', 30);
	wp_safe_redirect(admin_url('options-general.php?page=fs-developer-languages'));
	exit;
}, 1);

function bl_render_developer_languages(): void
{
	if (!current_user_can('manage_options')) {
		wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'baselayer'));
	}

	$languages_saved = get_transient('baselayer_languages_saved');
	if ($languages_saved !== false) {
		delete_transient('baselayer_languages_saved');
	}
	$duplicate_codes = get_transient('baselayer_languages_duplicate_codes');
	if ($duplicate_codes !== false && is_array($duplicate_codes)) {
		delete_transient('baselayer_languages_duplicate_codes');
	} else {
		$duplicate_codes = [];
	}

	$lang_data = get_option('bl_theme_languages', ['list' => [], 'default' => '', 'use_url_prefix' => true, 'prefix_default' => false, 'no_translation' => 'disabled']);
	$lang_list = isset($lang_data['list']) && is_array($lang_data['list']) ? $lang_data['list'] : [];
	$lang_default = isset($lang_data['default']) ? (string) $lang_data['default'] : '';
	$lang_use_url_prefix = isset($lang_data['use_url_prefix']) ? (bool) $lang_data['use_url_prefix'] : true;
	$lang_prefix_default = !empty($lang_data['prefix_default']);
	$lang_no_translation = isset($lang_data['no_translation']) && in_array($lang_data['no_translation'], ['hide', 'disabled', 'home'], true) ? $lang_data['no_translation'] : 'disabled';
	if ($lang_default === '' && !empty($lang_list)) {
		$lang_default = $lang_list[0]['id'] ?? '';
	}
	$uses_google_translate = function_exists('bl_uses_google_translate') && bl_uses_google_translate();
	$iso639_catalog = function_exists('bl_iso639_language_catalog') ? bl_iso639_language_catalog() : [];
?>
	<div class="wrap">
		<?php bl_developer_settings_screen_heading(); ?>
		<?php if ($languages_saved !== false) : ?>
			<div class="notice notice-success is-dismissible">
				<p><strong><?= esc_html(__('Settings saved.', 'baselayer')) ?></strong></p>
			</div>
		<?php endif; ?>
		<?php if (!empty($duplicate_codes)) : ?>
			<div class="notice notice-error is-dismissible">
				<p><strong><?= esc_html__('Settings were not saved.', 'baselayer') ?></strong> <?= esc_html__('Each language must have a unique code. Duplicate codes:', 'baselayer') ?> <code><?= esc_html(implode(', ', $duplicate_codes)) ?></code></p>
			</div>
		<?php endif; ?>

		<?php bl_developer_settings_render_nav(); ?>

		<h2 class="title"><?= esc_html__('Languages', 'baselayer') ?></h2>
		<p class="description"><?= esc_html__('Configure the languages available for your content and manage how they are used across the site.', 'baselayer') ?></p>
		<form method="post" action="" class="fs-page-settings-form" id="fs-languages-form">
			<?php settings_fields(BL_THEME_OPTION_GROUP_LANGUAGES); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?= esc_html__('Default language', 'baselayer') ?></th>
					<td>
						<?php if (!empty($lang_list)) : ?>
							<select name="bl_theme_languages[default]" id="bl_theme_languages_default" class="regular-text">
								<?php foreach ($lang_list as $l) : ?>
									<option value="<?= esc_attr($l['id']) ?>" <?= selected($lang_default, $l['id'], false) ?>><?= esc_html($l['name'] !== '' ? $l['name'] : $l['id']) ?></option>
								<?php endforeach; ?>
							</select>
						<?php else : ?>
							<input type="hidden" name="bl_theme_languages[default]" value="">
							<p class="description" style="margin: 0; color: #a7aaad; font-style: italic;"><?= esc_html__('Add at least one language in the list below to set a default language.', 'baselayer') ?></p>
						<?php endif; ?>
					</td>
				</tr>
				<?php if (!$uses_google_translate) : ?>
				<tr>
					<th scope="row"><?= esc_html__('URL prefix', 'baselayer') ?></th>
					<td>
						<input type="hidden" name="bl_theme_languages[use_url_prefix]" value="0">
						<label><input type="checkbox" name="bl_theme_languages[use_url_prefix]" id="bl_use_url_prefix" value="1" <?= checked($lang_use_url_prefix, true, false) ?>> <?= esc_html__('Use language prefix in URL', 'baselayer') ?></label>
						<p class="description fs-indent-checkbox"><?= esc_html__('Adds a language prefix to URLs (e.g. /de/ueber-uns).', 'baselayer') ?></p>
						<div id="fs-prefix-default-wrap" class="fs-url-prefix-sub" style="margin-top: 12px; <?= $lang_use_url_prefix ? '' : 'display:none;' ?>">
							<input type="hidden" name="bl_theme_languages[prefix_default]" value="0">
							<label><input type="checkbox" name="bl_theme_languages[prefix_default]" id="bl_prefix_default" value="1" <?= checked($lang_prefix_default, true, false) ?>> <?= esc_html__('Prefix default language in URL', 'baselayer') ?></label>
							<p class="description fs-indent-checkbox"><?= esc_html__('Controls whether the default language also uses a URL prefix.', 'baselayer') ?></p>
						</div>
					</td>
				</tr>
				<tr>
					<th scope="row"><?= esc_html__('Language switcher', 'baselayer') ?></th>
					<td>
						<div style="margin-bottom: 24px;">
							<div style="display: flex; align-items: center; gap: 8px">
								<input type="text" id="fs-language-toggler-shortcode" readonly class="regular-text code fs-code-small" value="[bl_language_switcher]" />
								<button type="button" class="button" data-fs-copy-from-source="fs-language-toggler-shortcode" data-fs-copy-feedback-text="<?= esc_attr__('Copied', 'baselayer') ?>"><?= esc_html__('Copy', 'baselayer') ?></button>
							</div>
							<p class="description"><?= esc_html__('To display a language switcher in your theme, use the shortcode [bl_language_switcher].', 'baselayer') ?></p>
						</div>
						<select name="bl_theme_languages[no_translation]" id="bl_no_translation" class="regular-text">
							<option value="hide" <?= selected($lang_no_translation, 'hide', false) ?>><?= esc_html__('Language will not be shown in language toggler', 'baselayer') ?></option>
							<option value="disabled" <?= selected($lang_no_translation, 'disabled', false) ?>><?= esc_html__('Language link is disabled', 'baselayer') ?></option>
							<option value="home" <?= selected($lang_no_translation, 'home', false) ?>><?= esc_html__('Language link goes to language homepage', 'baselayer') ?></option>
						</select>
						<p class="description"><?= esc_html__('Defines how the language switcher behaves when the current page is not available in another language.', 'baselayer') ?></p>
					</td>
				</tr>
				<?php else : ?>
				<tr>
					<th scope="row"><?= esc_html__('Language switcher', 'baselayer') ?></th>
					<td>
						<div style="display: flex; align-items: center; gap: 8px">
							<input type="text" id="fs-language-toggler-shortcode" readonly class="regular-text code fs-code-small" value="[bl_language_switcher]" />
							<button type="button" class="button" data-fs-copy-from-source="fs-language-toggler-shortcode" data-fs-copy-feedback-text="<?= esc_attr__('Copied', 'baselayer') ?>"><?= esc_html__('Copy', 'baselayer') ?></button>
						</div>
						<p class="description"><?= esc_html__('To display a language switcher in your theme, use the shortcode [bl_language_switcher].', 'baselayer') ?></p>
					</td>
				</tr>
				<?php endif; ?>
			</table>
			<h3 class="title" style="margin-top: 24px;"><?= esc_html__('Available languages', 'baselayer') ?></h3>
			<p class="description"><?= esc_html__('Add and manage the languages available for your site’s content.', 'baselayer') ?></p>
			<p class="description"><?php
				echo wp_kses(
					sprintf(
						/* translators: %s: link to ISO 639-1 on Wikipedia */
						__('Language codes follow %s (e.g. en, de, fr).', 'baselayer'),
						'<a href="' . esc_url('https://en.wikipedia.org/wiki/ISO_639-1') . '" target="_blank" rel="noopener noreferrer">ISO 639-1</a>'
					),
					['a' => ['href' => true, 'target' => true, 'rel' => true]]
				);
			?></p>
			<?php if ($iso639_catalog !== []) : ?>
				<div class="fs-language-quick-add">
					<label for="fs-language-catalog-select" class="screen-reader-text"><?= esc_html__('Add language from catalog', 'baselayer') ?></label>
					<select id="fs-language-catalog-select" class="regular-text">
						<option value=""><?= esc_html__('Select a language…', 'baselayer') ?></option>
						<?php foreach ($iso639_catalog as $entry) : ?>
							<option value="<?= esc_attr($entry['id']) ?>">
								<?= esc_html($entry['name'] . ' (' . $entry['id'] . ')') ?>
							</option>
						<?php endforeach; ?>
					</select>
					<button type="button" class="button" id="fs-add-language-from-catalog"><?= esc_html__('Add selected', 'baselayer') ?></button>
					<span class="fs-language-quick-add__sep" aria-hidden="true">|</span>
					<button type="button" class="button" id="fs-add-language"><?= esc_html__('Add empty row', 'baselayer') ?></button>
				</div>
			<?php else : ?>
				<p style="margin-top: 12px;">
					<button type="button" class="button" id="fs-add-language"><?= esc_html__('Add language', 'baselayer') ?></button>
				</p>
			<?php endif; ?>
			<?php $lang_count = count($lang_list);
			$show_reorder = $lang_count >= 3; ?>
			<table class="widefat striped fs-languages-table fs-table-small-gaps <?= $show_reorder ? '' : 'fs-hide-reorder' ?>" id="fs-languages-table" style="width: auto; margin-top: 16px;">
				<thead>
					<tr>
						<th class="fs-language-flag-th" style="width: 44px;"><?= esc_html__('Flag', 'baselayer') ?></th>
						<th><?= esc_html__('Code', 'baselayer') ?></th>
						<th><?= esc_html__('Name', 'baselayer') ?></th>
						<th><?= esc_html__('Native name', 'baselayer') ?></th>
						<th class="fs-reorder-th" style="width: 70px;"><?= esc_html__('Order', 'baselayer') ?></th>
						<th></th>
					</tr>
				</thead>
				<tbody id="fs-languages-tbody">
					<?php foreach ($lang_list as $i => $l) : ?>
						<tr class="fs-language-row" data-row-index="<?= (int) $i ?>">
							<?= function_exists('bl_language_flag_admin_cell') ? bl_language_flag_admin_cell((string) ($l['id'] ?? '')) : '<td class="fs-language-flag-cell"></td>' ?>
							<td><input type="text" name="bl_theme_languages[list][<?= (int) $i ?>][id]" value="<?= esc_attr($l['id']) ?>" class="small-text fs-language-code-input" placeholder="en" maxlength="20" required></td>
							<td><input type="text" name="bl_theme_languages[list][<?= (int) $i ?>][name]" value="<?= esc_attr($l['name'] ?? '') ?>" class="regular-text" required style="width: 160px;"></td>
							<td><input type="text" name="bl_theme_languages[list][<?= (int) $i ?>][nameNative]" value="<?= esc_attr($l['nameNative'] ?? '') ?>" class="regular-text" required style="width: 160px;"></td>
							<td class="fs-reorder-cell" style="vertical-align: middle;">
								<?php if ($i === 0) : ?>
									<span class="fs-default-badge" style="color: #646970; font-size: 12px;"><?= esc_html__('Default', 'baselayer') ?></span>
								<?php else : ?>
									<button type="button" class="button button-small fs-move-up" aria-label="<?= esc_attr__('Move up', 'baselayer') ?>" title="<?= esc_attr__('Move up', 'baselayer') ?>" <?= $i === 1 ? ' disabled' : '' ?>>↑</button>
									<button type="button" class="button button-small fs-move-down" aria-label="<?= esc_attr__('Move down', 'baselayer') ?>" title="<?= esc_attr__('Move down', 'baselayer') ?>" <?= $i === $lang_count - 1 ? ' disabled' : '' ?>>↓</button>
								<?php endif; ?>
							</td>
							<td style="vertical-align: middle;"><button type="button" class="button button-small fs-remove-language" aria-label="<?= esc_attr__('Remove', 'baselayer') ?>"><?= esc_html__('Remove', 'baselayer') ?></button></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
			<script>
				(function() {
					var form = document.getElementById('fs-languages-form');
					var tbody = document.getElementById('fs-languages-tbody');
					var addBtn = document.getElementById('fs-add-language');
					var addFromCatalogBtn = document.getElementById('fs-add-language-from-catalog');
					var catalogSelect = document.getElementById('fs-language-catalog-select');
					var usePrefix = document.getElementById('bl_use_url_prefix');
					var prefixWrap = document.getElementById('fs-prefix-default-wrap');
					var prefixDefault = document.getElementById('bl_prefix_default');
					var flagBaseUrl = <?= wp_json_encode(trailingslashit(get_template_directory_uri() . '/assets/flags/iso-639')) ?>;
					var flagAssetVer = <?= wp_json_encode(function_exists('bl_asset_version') ? bl_asset_version() : '1') ?>;
					var languageCatalog = <?= wp_json_encode(array_values(array_map(static function (array $entry): array {
						return [
							'id' => $entry['id'],
							'name' => $entry['name'],
							'nameNative' => $entry['nameNative'] !== '' ? $entry['nameNative'] : $entry['name'],
						];
					}, $iso639_catalog))) ?>;
					var catalogById = {};
					languageCatalog.forEach(function (entry) {
						catalogById[entry.id] = entry;
					});
					var removeLabel = <?= wp_json_encode(__('Remove', 'baselayer')) ?>;

					function escAttr(value) {
						return String(value)
							.replace(/&/g, '&amp;')
							.replace(/"/g, '&quot;')
							.replace(/</g, '&lt;');
					}

					function flagUrlForCode(code) {
						code = String(code || '').toLowerCase().replace(/[^a-z]/g, '');
						if (!code) {
							return '';
						}
						return flagBaseUrl + code + '.svg?ver=' + encodeURIComponent(flagAssetVer);
					}

					function updateRowFlag(row) {
						if (!row) {
							return;
						}
						var input = row.querySelector('.bl-language-code-input');
						var img = row.querySelector('.bl-language-flag-preview__img');
						if (!input || !img) {
							return;
						}
						var url = flagUrlForCode(input.value);
						if (!url) {
							img.hidden = true;
							img.removeAttribute('src');
							return;
						}
						img.onerror = function () {
							img.hidden = true;
						};
						img.onload = function () {
							img.hidden = false;
						};
						img.src = url;
					}

					function bindRowFlags(row) {
						updateRowFlag(row);
					}

					function getUsedCodes() {
						var used = {};
						tbody.querySelectorAll('.bl-language-code-input').forEach(function (input) {
							var code = String(input.value || '').toLowerCase().replace(/[^a-z]/g, '');
							if (code) {
								used[code] = true;
							}
						});
						return used;
					}

					function refreshCatalogSelect() {
						if (!catalogSelect) {
							return;
						}
						var used = getUsedCodes();
						Array.prototype.forEach.call(catalogSelect.options, function (option, index) {
							if (index === 0) {
								option.disabled = false;
								return;
							}
							option.disabled = !!used[option.value];
						});
						if (catalogSelect.value && used[catalogSelect.value]) {
							catalogSelect.value = '';
						}
					}

					function buildRowHtml(index, data) {
						data = data || {};
						var id = data.id || '';
						var name = data.name || '';
						var nameNative = data.nameNative || '';
						var flagUrl = flagUrlForCode(id);
						var flagHidden = flagUrl ? '' : ' hidden';
						return '<td class="fs-language-flag-cell"><span class="fs-language-flag-preview"><img class="fs-language-flag-preview__img" src="' + escAttr(flagUrl) + '" width="28" height="21" alt="" decoding="async"' + flagHidden + ' /></span></td>' +
							'<td><input type="text" name="bl_theme_languages[list][' + index + '][id]" value="' + escAttr(id) + '" class="small-text fs-language-code-input" placeholder="en" maxlength="20" required></td>' +
							'<td><input type="text" name="bl_theme_languages[list][' + index + '][name]" value="' + escAttr(name) + '" class="regular-text" required style="width: 160px;"></td>' +
							'<td><input type="text" name="bl_theme_languages[list][' + index + '][nameNative]" value="' + escAttr(nameNative) + '" class="regular-text" required style="width: 160px;"></td>' +
							'<td class="fs-reorder-cell" style="vertical-align: middle;"><button type="button" class="button button-small fs-move-up">↑</button> <button type="button" class="button button-small fs-move-down">↓</button></td>' +
							'<td style="vertical-align: middle;"><button type="button" class="button button-small fs-remove-language" aria-label="' + escAttr(removeLabel) + '">' + escAttr(removeLabel) + '</button></td>';
					}

					function addLanguageRow(data) {
						var tr = document.createElement('tr');
						tr.className = 'fs-language-row';
						tr.innerHTML = buildRowHtml(rowIndex, data);
						tbody.appendChild(tr);
						bindRowFlags(tr);
						reindexNames();
						refreshCatalogSelect();
						var codeInput = tr.querySelector('.bl-language-code-input');
						if (codeInput) {
							codeInput.focus();
						}
						return tr;
					}

					function togglePrefixDefault() {
						var on = usePrefix && usePrefix.checked;
						if (prefixWrap) prefixWrap.style.display = on ? '' : 'none';
						if (prefixDefault) prefixDefault.disabled = !on;
					}
					if (usePrefix) usePrefix.addEventListener('change', togglePrefixDefault);
					togglePrefixDefault();

					if (!form || !tbody || !addBtn) return;
					var rowIndex = <?= (int) count($lang_list) ?>;

					tbody.querySelectorAll('tr.bl-language-row').forEach(bindRowFlags);

					tbody.addEventListener('input', function (e) {
						if (e.target.classList.contains('fs-language-code-input')) {
							updateRowFlag(e.target.closest('tr'));
							refreshCatalogSelect();
						}
					});

					function reindexNames() {
						var rows = tbody.querySelectorAll('tr.bl-language-row');
						rows.forEach(function(tr, index) {
							tr.setAttribute('data-row-index', index);
							tr.querySelectorAll('input').forEach(function(input) {
								input.name = input.name.replace(/\[list\]\[\d+\]/, '[list][' + index + ']');
							});
						});
						rowIndex = rows.length;
						updateReorderVisibility();
						refreshCatalogSelect();
					}

					function updateReorderVisibility() {
						var rows = tbody.querySelectorAll('tr.bl-language-row');
						var table = document.getElementById('fs-languages-table');
						if (rows.length >= 3) {
							table.classList.remove('fs-hide-reorder');
							rows.forEach(function(tr, i) {
								var cell = tr.querySelector('.bl-reorder-cell');
								if (!cell) return;
								if (i === 0) {
									cell.innerHTML = '<span class="fs-default-badge" style="color: #646970; font-size: 12px;"><?= esc_js(__('Default', 'baselayer')) ?></span>';
								} else {
									var upLabel = '<?= esc_js(__('Move up', 'baselayer')) ?>';
									var downLabel = '<?= esc_js(__('Move down', 'baselayer')) ?>';
									var upDisabled = i === 1 ? ' disabled' : '';
									var downDisabled = i === rows.length - 1 ? ' disabled' : '';
									cell.innerHTML = '<button type="button" class="button button-small fs-move-up" aria-label="' + upLabel + '" title="' + upLabel + '"' + upDisabled + '>↑</button> ' +
										'<button type="button" class="button button-small fs-move-down" aria-label="' + downLabel + '" title="' + downLabel + '"' + downDisabled + '>↓</button>';
								}
							});
						} else {
							table.classList.add('fs-hide-reorder');
						}
					}
					addBtn.addEventListener('click', function() {
						addLanguageRow({});
					});

					if (addFromCatalogBtn && catalogSelect) {
						addFromCatalogBtn.addEventListener('click', function () {
							var id = catalogSelect.value;
							if (!id || !catalogById[id]) {
								catalogSelect.focus();
								return;
							}
							if (getUsedCodes()[id]) {
								catalogSelect.value = '';
								refreshCatalogSelect();
								return;
							}
							var entry = catalogById[id];
							addLanguageRow({
								id: entry.id,
								name: entry.name,
								nameNative: entry.nameNative,
							});
							catalogSelect.value = '';
							refreshCatalogSelect();
						});
					}

					refreshCatalogSelect();
					tbody.addEventListener('click', function(e) {
						if (e.target.classList.contains('fs-remove-language')) {
							e.target.closest('tr').remove();
							reindexNames();
							return;
						}
						var row = e.target.closest('tr.bl-language-row');
						if (!row) return;
						var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr.bl-language-row'));
						var idx = rows.indexOf(row);
						if (e.target.classList.contains('fs-move-up') && idx > 1) {
							tbody.insertBefore(row, rows[idx - 1]);
							reindexNames();
						} else if (e.target.classList.contains('fs-move-down') && idx >= 1 && idx < rows.length - 1) {
							var next = rows[idx + 1];
							tbody.insertBefore(next, row);
							reindexNames();
						}
					});
				})();
			</script>
			<div class="fs-submit-row">
				<button type="submit" class="button button-primary"><?= esc_html__('Save Changes') ?></button>
			</div>
		</form>
	</div>
<?php
}
