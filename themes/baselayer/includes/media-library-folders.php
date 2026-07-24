<?php

defined('ABSPATH') || exit;

const BL_MEDIA_FOLDER_TAXONOMY = 'bl_media_folder';

/**
 * Register the attachment folder taxonomy used by Media Library.
 */
add_action('init', function () {
	register_taxonomy(BL_MEDIA_FOLDER_TAXONOMY, ['attachment'], [
		'hierarchical' => true,
		'labels' => [
			'name' => __('Media folders', 'baselayer'),
			'singular_name' => __('Media folder', 'baselayer'),
			'search_items' => __('Search media folders', 'baselayer'),
			'all_items' => __('All media folders', 'baselayer'),
			'parent_item' => __('Parent media folder', 'baselayer'),
			'parent_item_colon' => __('Parent media folder:', 'baselayer'),
			'edit_item' => __('Edit media folder', 'baselayer'),
			'update_item' => __('Update media folder', 'baselayer'),
			'add_new_item' => __('Add new media folder', 'baselayer'),
			'new_item_name' => __('New media folder name', 'baselayer'),
			'menu_name' => __('Media folders', 'baselayer'),
		],
		'public' => false,
		'show_ui' => false,
		'show_admin_column' => false,
		'show_in_quick_edit' => false,
		'show_in_rest' => true,
		'rewrite' => false,
		'update_count_callback' => 'bl_media_folders_update_term_count',
	]);
}, 10);

/**
 * Keep folder counts accurate for attachments (including inherited/unattached media).
 *
 * WordPress core generic callbacks can undercount attachment taxonomies depending on post status.
 * We count relationships directly against attachment posts and ignore only trashed attachments.
 *
 * @param array<int|string> $tt_ids
 */
function bl_media_folders_update_term_count(array $tt_ids, WP_Taxonomy $taxonomy): void
{
	global $wpdb;
	if (!$wpdb instanceof wpdb || empty($tt_ids)) {
		return;
	}

	$tt_ids = array_values(array_filter(array_map('intval', $tt_ids), static fn(int $id): bool => $id > 0));
	if (empty($tt_ids)) {
		return;
	}

	foreach ($tt_ids as $tt_id) {
		$count = (int) $wpdb->get_var($wpdb->prepare(
			"SELECT COUNT(DISTINCT tr.object_id)
			FROM {$wpdb->term_relationships} tr
			INNER JOIN {$wpdb->posts} p ON p.ID = tr.object_id
			WHERE tr.term_taxonomy_id = %d
			  AND p.post_type = 'attachment'
			  AND p.post_status <> 'trash'",
			$tt_id
		));

		$wpdb->update(
			$wpdb->term_taxonomy,
			['count' => $count],
			['term_taxonomy_id' => $tt_id],
			['%d'],
			['%d']
		);
	}

	clean_term_cache($tt_ids, $taxonomy->name, false);
}

/**
 * Recount all media-folder terms periodically so existing folders recover from stale counts.
 */
add_action('admin_init', function (): void {
	if (!is_admin() || !taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY) || get_transient('bl_media_folder_counts_recounted')) {
		return;
	}
	$tt_ids = get_terms([
		'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
		'hide_empty' => false,
		'fields' => 'tt_ids',
	]);
	if (is_wp_error($tt_ids) || empty($tt_ids) || !is_array($tt_ids)) {
		set_transient('bl_media_folder_counts_recounted', '1', 10 * MINUTE_IN_SECONDS);
		return;
	}
	$tax = get_taxonomy(BL_MEDIA_FOLDER_TAXONOMY);
	if ($tax instanceof WP_Taxonomy) {
		bl_media_folders_update_term_count(array_map('intval', $tt_ids), $tax);
	}
	set_transient('bl_media_folder_counts_recounted', '1', 10 * MINUTE_IN_SECONDS);
});

/**
 * Get active media folder filter from request.
 */
function bl_media_folders_current_id(): int
{
	return isset($_GET['bl_media_folder_id']) ? absint($_GET['bl_media_folder_id']) : 0;
}

/**
 * Whether the library is filtered to attachments with no bl_media_folder term.
 */
function bl_media_folders_is_unassigned_filter(): bool
{
	return isset($_GET['bl_media_folder_unassigned']) && (string) wp_unslash($_GET['bl_media_folder_unassigned']) === '1';
}

/**
 * Active folder for an upload request (query, POST, or Referer from Media Library).
 */
function bl_media_folders_upload_folder_id(): int
{
	if (bl_media_folders_is_unassigned_filter()) {
		return 0;
	}

	$request = wp_unslash($_REQUEST);
	if (isset($request['bl_media_folder_id'])) {
		$id = absint($request['bl_media_folder_id']);
		if ($id > 0) {
			return $id;
		}
	}

	if (!empty($_SERVER['HTTP_REFERER'])) {
		$query = wp_parse_url((string) wp_unslash($_SERVER['HTTP_REFERER']), PHP_URL_QUERY);
		if (is_string($query) && $query !== '') {
			parse_str($query, $ref_args);
			if (!empty($ref_args['bl_media_folder_id'])) {
				$id = absint($ref_args['bl_media_folder_id']);
				if ($id > 0) {
					return $id;
				}
			}
		}
	}

	return bl_media_folders_current_id();
}

/**
 * Assign uploaded files to the folder currently open in the Media Library.
 */
function bl_media_folders_assign_on_upload(int $attachment_id): void
{
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY) || get_post_type($attachment_id) !== 'attachment') {
		return;
	}

	$folder_id = bl_media_folders_upload_folder_id();
	if ($folder_id <= 0) {
		return;
	}

	$term = get_term($folder_id, BL_MEDIA_FOLDER_TAXONOMY);
	if (!$term instanceof WP_Term || is_wp_error($term)) {
		return;
	}

	$existing = wp_get_object_terms($attachment_id, BL_MEDIA_FOLDER_TAXONOMY, ['fields' => 'ids']);
	if (!is_wp_error($existing) && $existing !== []) {
		return;
	}

	bl_media_folders_set_attachment_folder($attachment_id, $folder_id);
}

add_action('add_attachment', 'bl_media_folders_assign_on_upload', 5, 1);

/**
 * Pass active folder into Plupload (drag & drop / multi-upload on upload.php).
 */
add_filter('plupload_init', function (array $config): array {
	if (!is_admin() || !current_user_can('upload_files')) {
		return $config;
	}

	$folder_id = bl_media_folders_upload_folder_id();
	if ($folder_id <= 0) {
		return $config;
	}

	if (!isset($config['multipart_params']) || !is_array($config['multipart_params'])) {
		$config['multipart_params'] = [];
	}
	$config['multipart_params']['bl_media_folder_id'] = $folder_id;

	return $config;
});

/**
 * Count attachments that have no media folder assigned.
 */
function bl_media_folders_count_unassigned(): int
{
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY)) {
		return 0;
	}
	$q = new WP_Query([
		'post_type'              => 'attachment',
		'post_status'            => 'inherit',
		'posts_per_page'         => 1,
		'fields'                 => 'ids',
		'no_found_rows'          => false,
		'update_post_meta_cache' => false,
		'update_post_term_cache' => false,
		'tax_query'              => [
			[
				'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
				'operator' => 'NOT EXISTS',
			],
		],
	]);

	return (int) $q->found_posts;
}

/**
 * Count attachments shown under “All files” (published/inherited media, excluding trash).
 */
function bl_media_folders_count_all_attachments(): int
{
	$counts = wp_count_posts('attachment');
	if (!$counts || !is_object($counts)) {
		return 0;
	}

	return (int) ($counts->inherit ?? 0);
}

/**
 * Assign an attachment to a folder term (or clear it).
 *
 * @param mixed $raw_folder_value
 */
function bl_media_folders_set_attachment_folder(int $attachment_id, $raw_folder_value): void
{
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY) || $attachment_id <= 0) {
		return;
	}
	$before_ids = wp_get_object_terms($attachment_id, BL_MEDIA_FOLDER_TAXONOMY, ['fields' => 'ids']);
	$before_ids = is_wp_error($before_ids) ? [] : array_map('intval', $before_ids);

	if (is_array($raw_folder_value)) {
		$raw_folder_value = reset($raw_folder_value);
	}

	$folder_id = is_scalar($raw_folder_value) ? absint($raw_folder_value) : 0;


	if ($folder_id <= 0) {
		wp_set_object_terms($attachment_id, [], BL_MEDIA_FOLDER_TAXONOMY, false);
		if (!empty($before_ids)) {
			wp_update_term_count_now($before_ids, BL_MEDIA_FOLDER_TAXONOMY);
		}
		return;
	}

	wp_set_object_terms($attachment_id, [$folder_id], BL_MEDIA_FOLDER_TAXONOMY, false);
	$refresh_ids = array_values(array_unique(array_merge($before_ids, [$folder_id])));
	wp_update_term_count_now($refresh_ids, BL_MEDIA_FOLDER_TAXONOMY);
}

/**
 * Extract folder value from media AJAX request payload.
 */
function bl_media_folders_get_ajax_folder_value(int $attachment_id)
{
	$request = wp_unslash($_REQUEST);

	if (isset($request['bl_media_folder_id'])) {
		return $request['bl_media_folder_id'];
	}

	$attachments = isset($request['attachments']) && is_array($request['attachments']) ? $request['attachments'] : [];
	if (isset($attachments[$attachment_id]) && is_array($attachments[$attachment_id])) {
		$row = $attachments[$attachment_id];
		if (array_key_exists('bl_media_folder_id', $row)) {
			return $row['bl_media_folder_id'];
		}
		if (isset($row['compat']) && is_array($row['compat']) && array_key_exists('bl_media_folder_id', $row['compat'])) {
			return $row['compat']['bl_media_folder_id'];
		}
	}
	if (isset($attachments[(string) $attachment_id]) && is_array($attachments[(string) $attachment_id])) {
		$row = $attachments[(string) $attachment_id];
		if (array_key_exists('bl_media_folder_id', $row)) {
			return $row['bl_media_folder_id'];
		}
		if (isset($row['compat']) && is_array($row['compat']) && array_key_exists('bl_media_folder_id', $row['compat'])) {
			return $row['compat']['bl_media_folder_id'];
		}
	}

	if (isset($request['changes']) && is_array($request['changes']) && array_key_exists('bl_media_folder_id', $request['changes'])) {
		return $request['changes']['bl_media_folder_id'];
	}
	if (isset($request['attachment']) && is_array($request['attachment'])) {
		$attachment = $request['attachment'];
		if (array_key_exists('bl_media_folder_id', $attachment)) {
			return $attachment['bl_media_folder_id'];
		}
		if (isset($attachment['compat']) && is_array($attachment['compat']) && array_key_exists('bl_media_folder_id', $attachment['compat'])) {
			return $attachment['compat']['bl_media_folder_id'];
		}
	}

	return null;
}

/**
 * Keep folder filter in the media grid AJAX queries.
 */
add_filter('media_view_settings', function (array $settings): array {
	if (!is_admin()) {
		return $settings;
	}
	$screen = function_exists('get_current_screen') ? get_current_screen() : null;
	if (!$screen || $screen->id !== 'upload') {
		return $settings;
	}

	if (!isset($settings['library']) || !is_array($settings['library'])) {
		$settings['library'] = [];
	}
	if (!isset($settings['query']) || !is_array($settings['query'])) {
		$settings['query'] = [];
	}

	if (bl_media_folders_is_unassigned_filter()) {
		$settings['library']['bl_media_folder_unassigned'] = 1;
		$settings['query']['bl_media_folder_unassigned'] = 1;
		return $settings;
	}

	$folder_id = bl_media_folders_current_id();
	if ($folder_id <= 0) {
		return $settings;
	}

	// Keep both keys for media-grid compatibility across request shapes.
	$settings['library']['bl_media_folder_id'] = $folder_id;
	$settings['query']['bl_media_folder_id'] = $folder_id;

	return $settings;
});

/**
 * JS patch for wp.media.model.Query: observe upload queue in folder-filtered views.
 *
 * Must load after media-models.js (admin_footer runs too early for inline scripts there).
 */
function bl_media_folders_query_patch_script(): string
{
	return <<<'JS'
(function() {
	function blMediaFoldersQueryUsesFolderFilter(props) {
		if (!props || typeof props.get !== 'function') {
			return false;
		}
		var folderId = parseInt(props.get('bl_media_folder_id'), 10) || 0;
		if (folderId > 0) {
			return true;
		}
		var unassigned = props.get('bl_media_folder_unassigned');
		return unassigned === 1 || unassigned === '1' || unassigned === true;
	}

	function blMediaFoldersIsInUploadQueue(attachment) {
		if (!attachment) {
			return false;
		}
		if (attachment.get && attachment.get('uploading')) {
			return true;
		}
		if (!window.wp || !wp.Uploader || !wp.Uploader.queue) {
			return false;
		}
		var queue = wp.Uploader.queue;
		if (typeof queue.contains === 'function') {
			return queue.contains(attachment);
		}
		return _.some(queue.models, function(model) {
			return model.cid === attachment.cid;
		});
	}

	function blMediaFoldersAttachFolderFilter(library) {
		if (!library || library.__blFolderFilterAttached) {
			return;
		}
		library.filters = library.filters || {};
		library.filters.blMediaFolder = function(attachment) {
			var fid = 0;
			if (this.props && typeof this.props.get === 'function') {
				fid = parseInt(this.props.get('bl_media_folder_id'), 10) || 0;
			}
			if (fid < 1) {
				return true;
			}
			var attFid = parseInt(attachment.get('bl_media_folder_id'), 10) || 0;
			if (attFid < 1) {
				return true;
			}
			return attFid === fid;
		};
		library.__blFolderFilterAttached = true;
	}

	function blMediaFoldersPatchOrderFilterForUploads(library) {
		if (!library || !library.filters || !library.filters.order || library.__blOrderFilterPatched) {
			return;
		}
		var orderFilter = library.filters.order;
		library.filters.order = function(attachment) {
			if (blMediaFoldersIsInUploadQueue(attachment)) {
				return true;
			}
			return orderFilter.call(this, attachment);
		};
		library.__blOrderFilterPatched = true;
	}

	function blMediaFoldersObserveUploaderQueue(library) {
		if (!library || !library.observe || library.__blObservesUploaderQueue) {
			return;
		}
		if (!window.wp || !wp.Uploader || !wp.Uploader.queue) {
			return;
		}
		blMediaFoldersAttachFolderFilter(library);
		blMediaFoldersPatchOrderFilterForUploads(library);
		library.observe(wp.Uploader.queue);
		library.__blObservesUploaderQueue = true;
	}

	window.blMediaFoldersQueryUsesFolderFilter = blMediaFoldersQueryUsesFolderFilter;
	window.blMediaFoldersObserveUploaderQueue = blMediaFoldersObserveUploaderQueue;

	var wpRef = window.wp;
	if (!wpRef || !wpRef.media || !wpRef.media.model || !wpRef.media.model.Query) {
		return;
	}
	if (wpRef.media.model.Query.prototype.__blFolderQueryPatched) {
		return;
	}
	var originalInit = wpRef.media.model.Query.prototype.initialize;
	wpRef.media.model.Query.prototype.initialize = function() {
		originalInit.apply(this, arguments);
		if (this.props && typeof this.props.set === 'function') {
			this.props.set({
				bl_media_folder_id: this.props.get('bl_media_folder_id') || 0,
				bl_media_folder_unassigned: this.props.get('bl_media_folder_unassigned') || 0
			});
		}
		if (blMediaFoldersQueryUsesFolderFilter(this.props)) {
			blMediaFoldersObserveUploaderQueue(this);
		}
	};
	var originalSync = wpRef.media.model.Query.prototype.sync;
	wpRef.media.model.Query.prototype.sync = function(method, model, options) {
		options = options || {};
		options.data = options.data || {};
		options.data.query = options.data.query || {};
		var props = (this.props && typeof this.props.toJSON === 'function') ? this.props.toJSON() : {};
		if (props.bl_media_folder_unassigned) {
			options.data.query.bl_media_folder_unassigned = 1;
			options.data.bl_media_folder_unassigned = 1;
		} else {
			delete options.data.query.bl_media_folder_unassigned;
			delete options.data.bl_media_folder_unassigned;
		}
		if (props.bl_media_folder_id) {
			options.data.query.bl_media_folder_id = props.bl_media_folder_id;
			options.data.bl_media_folder_id = props.bl_media_folder_id;
		} else {
			delete options.data.query.bl_media_folder_id;
			delete options.data.bl_media_folder_id;
		}
		return originalSync.call(this, method, model, options);
	};
	wpRef.media.model.Query.prototype.__blFolderQueryPatched = true;
})();
JS;
}

add_action('admin_enqueue_scripts', function (): void {
	if (!is_admin()) {
		return;
	}
	wp_add_inline_script('media-models', bl_media_folders_query_patch_script(), 'after');
}, 20);

/**
 * Shared Media Library / modal: folders panel visibility (one localStorage key for both UIs).
 */
add_action('admin_head', function (): void {
	if (!is_admin()) {
		return;
	}
?>
	<script>
		(function() {
			if (window.blMediaFolderPanel) {
				return;
			}
			var key = 'blMediaFoldersSidebarCollapsed';

			function read() {
				try {
					if (window.localStorage) {
						return window.localStorage.getItem(key) === '1';
					}
				} catch (err) {}
				return false;
			}

			function write(v) {
				try {
					if (window.localStorage) {
						window.localStorage.setItem(key, v ? '1' : '0');
					}
				} catch (err) {}
			}

			function applyToDom(collapsed) {
				var i;
				var layout = document.querySelector('.upload-php .bl-media-folders-layout');
				if (layout) {
					if (collapsed) {
						layout.classList.add('is-collapsed');
					} else {
						layout.classList.remove('is-collapsed');
					}
				}
				var toggles = document.querySelectorAll('.bl-media-folders-toggle');
				for (i = 0; i < toggles.length; i++) {
					var t = toggles[i];
					if (collapsed) {
						t.classList.remove('is-active');
						t.setAttribute('aria-pressed', 'false');
						t.setAttribute('title', '<?= esc_js(__('Show folders panel', 'baselayer')) ?>');
					} else {
						t.classList.add('is-active');
						t.setAttribute('aria-pressed', 'true');
						t.setAttribute('title', '<?= esc_js(__('Hide folders panel', 'baselayer')) ?>');
					}
				}
				var browsers = document.querySelectorAll('.media-modal .attachments-browser.bl-modal-sidebar-layout');
				for (i = 0; i < browsers.length; i++) {
					var b = browsers[i];
					if (collapsed) {
						b.classList.add('is-folders-panel-collapsed');
					} else {
						b.classList.remove('is-folders-panel-collapsed');
					}
				}
			}

			function setCollapsed(v) {
				if (read() === v) {
					applyToDom(v);
					return;
				}
				write(v);
				applyToDom(v);
			}

			function toggle() {
				setCollapsed(!read());
			}
			document.addEventListener('click', function(e) {
				var btn = e.target && e.target.closest && e.target.closest('.bl-media-folders-toggle');
				if (!btn) {
					return;
				}
				e.preventDefault();
				toggle();
			});
			document.addEventListener('storage', function(e) {
				if (e && e.key === key) {
					applyToDom(read());
				}
			});
			window.blMediaFolderPanel = {
				key: key,
				isCollapsed: read,
				setCollapsed: setCollapsed,
				applyFromStorage: function() {
					applyToDom(read());
				}
			};
			if (document.readyState === 'loading') {
				document.addEventListener('DOMContentLoaded', function onReady() {
					document.removeEventListener('DOMContentLoaded', onReady);
					applyToDom(read());
				}, false);
			} else {
				applyToDom(read());
			}
		})();
	</script>
<?php
}, 1);

/**
 * Media modal: folder sidebar + query integration (admin-wide footer; only runs when modal opens).
 */
add_action('admin_footer', function (): void {
	if (!is_admin()) {
		return;
	}
	$terms = get_terms([
		'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
		'hide_empty' => false,
		'orderby' => 'name',
		'order' => 'ASC',
	]);
	if (is_wp_error($terms)) {
		$terms = [];
	}
	$display_counts = bl_media_folders_build_display_counts($terms);
	$by_parent = [];
	foreach ($terms as $term) {
		if (!$term instanceof WP_Term) {
			continue;
		}
		$pid = (int) $term->parent;
		if (!isset($by_parent[$pid])) {
			$by_parent[$pid] = [];
		}
		$by_parent[$pid][] = $term;
	}
	$by_parent_modal = [];
	foreach ($by_parent as $pid => $children) {
		$key = (string) (int) $pid;
		$by_parent_modal[$key] = [];
		foreach ($children as $t) {
			if (!$t instanceof WP_Term) {
				continue;
			}
			$tid = (int) $t->term_id;
			$by_parent_modal[$key][] = [
				'id' => $tid,
				'name' => (string) $t->name,
				'count' => (int) ($display_counts[$tid] ?? $t->count),
			];
		}
	}
	$bl_modal_folders_config = [
		'byParent' => $by_parent_modal,
		'counts' => [
			'allFiles' => bl_media_folders_count_all_attachments(),
			'unassigned' => bl_media_folders_count_unassigned(),
		],
		'uploadLibraryUrl' => admin_url('upload.php'),
		'icons' => [
			'all' => '<span class="bl-media-folders-item-icon bl-media-folders-item-icon--all" aria-hidden="true">' . bl_media_folders_icon_svg('all') . '</span>',
			'unassigned' => '<span class="bl-media-folders-item-icon bl-media-folders-item-icon--unassigned" aria-hidden="true">' . bl_media_folders_icon_svg('unassigned') . '</span>',
			'folderLeaf' => bl_media_folders_folder_icon_markup(false),
			'folderBranch' => bl_media_folders_folder_icon_markup(true),
		],
		'i18n' => [
			'heading' => __('Folders', 'baselayer'),
			'allFiles' => __('All files', 'baselayer'),
			'notInFolder' => __('Not in a folder', 'baselayer'),
			'openMediaLibrary' => __('Open Media Library', 'baselayer'),
			'expandCollapse' => __('Expand or collapse subfolders', 'baselayer'),
		],
	];
?>
	<script>
		(function(cfg) {
			var byParent = cfg.byParent || {};
			var icons = cfg.icons || {};
			var counts = cfg.counts || {};
			var uploadLibraryUrl = cfg.uploadLibraryUrl || '';
			var L = cfg.i18n || {};

			function blModalFmtCount(n) {
				var x = parseInt(n, 10);
				if (isNaN(x) || x < 0) {
					x = 0;
				}
				return String(x);
			}
			var blBranchCollapsedKey = 'baselayer_bl_media_folder_collapsed_branches';

			function blEsc(s) {
				return String(s)
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;');
			}

			function blEscAttr(s) {
				return String(s)
					.replace(/&/g, '&amp;')
					.replace(/"/g, '&quot;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;');
			}

			function blModalReadCollapsedBranches() {
				try {
					if (!window.localStorage) {
						return [];
					}
					var raw = window.localStorage.getItem(blBranchCollapsedKey);
					if (!raw) {
						return [];
					}
					var parsed = JSON.parse(raw);
					if (!Array.isArray(parsed)) {
						return [];
					}
					return parsed.map(function(x) {
						return parseInt(x, 10);
					}).filter(function(n) {
						return !isNaN(n) && n > 0;
					});
				} catch (err) {
					return [];
				}
			}

			function blModalWriteCollapsedBranches(ids) {
				try {
					if (window.localStorage) {
						window.localStorage.setItem(blBranchCollapsedKey, JSON.stringify(ids));
					}
				} catch (err) {}
			}

			function blModalPersistBranchCollapse(termId, collapsed) {
				var ids = blModalReadCollapsedBranches();
				var ix = ids.indexOf(termId);
				if (collapsed && ix === -1) {
					ids.push(termId);
				}
				if (!collapsed && ix !== -1) {
					ids.splice(ix, 1);
				}
				blModalWriteCollapsedBranches(ids);
			}

			function blModalApplyStoredBranchState(root) {
				if (!root) {
					return;
				}
				var collapsed = {};
				blModalReadCollapsedBranches().forEach(function(id) {
					collapsed[id] = true;
				});
				var branches = root.querySelectorAll('.bl-media-folders-tree-item--branch[data-folder-term-id]');
				var i;
				for (i = 0; i < branches.length; i++) {
					var li = branches[i];
					var tid = parseInt(li.getAttribute('data-folder-term-id') || '0', 10);
					if (isNaN(tid) || tid < 1) {
						continue;
					}
					var btn = li.querySelector('.bl-media-folders-folder-toggle');
					if (collapsed[tid]) {
						li.classList.remove('is-expanded');
						if (btn) {
							btn.setAttribute('aria-expanded', 'false');
						}
					} else {
						li.classList.add('is-expanded');
						if (btn) {
							btn.setAttribute('aria-expanded', 'true');
						}
					}
				}
			}

			function blModalRenderFolderTree(parentId) {
				var items = byParent[String(parentId)] || [];
				var out = '';
				var ti;
				for (ti = 0; ti < items.length; ti++) {
					var it = items[ti];
					var id = parseInt(it.id, 10);
					var name = blEsc(it.name);
					var kids = byParent[String(id)] || [];
					var hasChildren = kids.length > 0;
					var liClass = 'bl-media-modal-folders__tree-item bl-media-folders-tree-item';
					if (hasChildren) {
						liClass += ' bl-media-folders-tree-item--branch is-expanded';
					}
					out += '<li class="' + liClass + '"';
					if (hasChildren) {
						out += ' data-folder-term-id="' + id + '"';
					}
					out += '>';
					out += '<div class="bl-media-modal-folders__row bl-media-folders-item bl-media-folders-link">';
					var cnt = typeof it.count !== 'undefined' ? it.count : 0;
					out += '<button type="button" class="bl-media-folder-row" data-folder-id="' + id + '">';
					if (hasChildren) {
						out += '<span class="bl-media-folders-folder-toggle" role="button" tabindex="0" aria-expanded="true" aria-label="' + blEscAttr(L.expandCollapse || '') + '">';
						out += icons.folderBranch || '';
						out += '</span>';
					} else {
						out += '<span class="bl-media-folders-folder-toggle bl-media-folders-folder-toggle--leaf" aria-hidden="true">';
						out += icons.folderLeaf || '';
						out += '</span>';
					}
					out += '<span class="name">' + name + '</span>';
					out += '<span class="bl-media-folders-count">' + blModalFmtCount(cnt) + '</span>';
					out += '</button>';
					out += '</div>';
					if (hasChildren) {
						out += '<div class="bl-media-folders-branch"><ul class="bl-media-folders-branch-list">';
						out += blModalRenderFolderTree(id);
						out += '</ul></div>';
					}
					out += '</li>';
				}
				return out;
			}
			function getActiveProps() {
				if (!window.wp || !wp.media || !wp.media.frame) {
					return null;
				}
				var frame = wp.media.frame;
				if (frame.content && typeof frame.content.get === 'function') {
					var content = frame.content.get();
					if (content && content.collection && content.collection.props) {
						return content.collection.props;
					}
				}
				if (typeof frame.state === 'function') {
					var state = frame.state();
					if (state && typeof state.get === 'function') {
						var lib = state.get('library');
						if (lib && lib.props) {
							return lib.props;
						}
					}
				}
				return null;
			}

			function getActiveState() {
				if (!window.wp || !wp.media || !wp.media.frame || typeof wp.media.frame.state !== 'function') {
					return null;
				}
				var state = wp.media.frame.state();
				if (!state || typeof state.get !== 'function' || typeof state.set !== 'function') {
					return null;
				}
				return state;
			}

			function isUnassignedFilterActive() {
				var props = getActiveProps();
				if (!props || typeof props.get !== 'function') {
					return false;
				}
				var u = props.get('bl_media_folder_unassigned');
				return u === 1 || u === '1' || u === true;
			}

			function selectedFolderId() {
				var props = getActiveProps();
				if (!props || typeof props.get !== 'function') {
					return 0;
				}
				var raw = props.get('bl_media_folder_id');
				var id = parseInt(raw, 10);
				return isNaN(id) || id < 1 ? 0 : id;
			}

			function applyFolder(id, unassignedOnly) {
				var state = getActiveState();
				if (!state || !window.wp || !wp.media || typeof wp.media.query !== 'function') {
					return;
				}
				var folderId = id > 0 ? id : 0;
				var queryArgs = {
					post_type: 'attachment',
					post_status: 'inherit',
					orderby: 'date',
					order: 'DESC',
					per_page: 40,
					paged: 1,
					bl_media_folder_id: folderId
				};
				if (unassignedOnly) {
					queryArgs.bl_media_folder_unassigned = 1;
					queryArgs.bl_media_folder_id = 0;
				}
				var library = wp.media.query(queryArgs);
				state.set('library', library);
				if (window.wp.media.frame && wp.media.frame.content && typeof wp.media.frame.content.render === 'function') {
					wp.media.frame.content.render();
				}
			}

			function ensureModalFoldersToolbarToggle() {
				var i;
				var browsers = document.querySelectorAll('.media-modal .attachments-browser');
				for (i = 0; i < browsers.length; i++) {
					var browser = browsers[i];
					var bar = browser.querySelector('.media-toolbar');
					if (!bar) {
						continue;
					}
					if (bar.querySelector('.bl-media-folders-toggle[data-bl-toggle-context="modal"]')) {
						continue;
					}
					var secondary = bar.querySelector('.media-toolbar-secondary');
					var btn = document.createElement('button');
					btn.type = 'button';
					btn.className = 'button bl-media-folders-toggle';
					btn.setAttribute('data-bl-toggle-context', 'modal');
					btn.setAttribute('aria-pressed', 'true');
					btn.setAttribute('title', '<?= esc_js(__('Hide folders panel', 'baselayer')) ?>');
					btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h207q16 0 30.5 6t25.5 17l57 57h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Z"/></svg>';
					if (secondary && secondary.parentNode === bar) {
						bar.insertBefore(btn, secondary);
					} else {
						bar.appendChild(btn);
					}
				}
				if (window.blMediaFolderPanel && typeof window.blMediaFolderPanel.applyFromStorage === 'function') {
					window.blMediaFolderPanel.applyFromStorage();
				}
			}

			function injectModalFoldersPanel() {
				var browser = document.querySelector('.media-modal .attachments-browser');
				if (!browser) {
					return;
				}
				if (browser.querySelector('#bl-media-modal-folders')) {
					return;
				}
				browser.classList.add('bl-modal-sidebar-layout');
				var panel = document.createElement('div');
				panel.id = 'bl-media-modal-folders';
				panel.className = 'bl-media-modal-folders';
				var html = '<div class="bl-media-modal-folders__heading-row">';
				html += '<span class="bl-media-modal-folders__heading">' + blEsc(L.heading || 'Folders') + '</span>';
				if (uploadLibraryUrl) {
					html += '<a class="components-button is-small is-tertiary bl-media-modal-folders__edit-library" href="' + blEscAttr(uploadLibraryUrl) + '">' + blEsc(L.openMediaLibrary || 'Open Media Library') + '</a>';
				}
				html += '</div>';
				html += '<ul class="bl-media-modal-folders__list">';
				html += '<li class="bl-media-modal-folders__item"><div class="bl-media-modal-folders__row bl-media-folders-item bl-media-folders-item--all bl-media-folders-link">';
				html += '<button type="button" class="bl-media-folder-row bl-media-folder-row--all" data-folder-id="0" data-bl-all="1">';
				html += icons.all || '';
				html += '<span class="bl-media-folders-link-label">' + blEsc(L.allFiles || 'All files') + '</span>';
				html += '<span class="bl-media-folders-count">' + blModalFmtCount(counts.allFiles) + '</span>';
				html += '</button></div></li>';
				html += '<li class="bl-media-modal-folders__item"><div class="bl-media-modal-folders__row bl-media-folders-item bl-media-folders-item--unassigned bl-media-folders-link">';
				html += '<button type="button" class="bl-media-folder-row bl-media-folder-row--unassigned" data-folder-id="0" data-bl-unassigned="1">';
				html += icons.unassigned || '';
				html += '<span class="name">' + blEsc(L.notInFolder || 'Not in a folder') + '</span>';
				html += '<span class="bl-media-folders-count">' + blModalFmtCount(counts.unassigned) + '</span>';
				html += '</button></div></li>';
				html += blModalRenderFolderTree(0);
				html += '</ul>';
				panel.innerHTML = html;
				browser.appendChild(panel);
				blModalApplyStoredBranchState(panel);

				function repaintActive() {
					var active = selectedFolderId();
					var unassigned = isUnassignedFilterActive();
					var rows = panel.querySelectorAll('.bl-media-modal-folders__row.bl-media-folders-link');
					var ri;
					for (ri = 0; ri < rows.length; ri++) {
						var row = rows[ri];
						var b = row.querySelector('.bl-media-folder-row');
						if (!b) {
							continue;
						}
						var isUn = b.getAttribute('data-bl-unassigned') === '1';
						var isAll = b.getAttribute('data-bl-all') === '1';
						var bid = parseInt(b.getAttribute('data-folder-id') || '0', 10);
						var on = false;
						if (isUn) {
							on = unassigned;
						} else if (isAll) {
							on = !unassigned && active === 0;
						} else {
							on = !unassigned && bid === active;
						}
						row.classList.toggle('is-active', on);
						b.classList.toggle('is-active', on);
					}
				}

				panel.addEventListener('click', function(e) {
					var folderToggle = e.target.closest('.bl-media-folders-folder-toggle:not(.bl-media-folders-folder-toggle--leaf)');
					if (folderToggle && panel.contains(folderToggle)) {
						e.preventDefault();
						e.stopPropagation();
						var treeItem = folderToggle.closest('.bl-media-folders-tree-item');
						if (!treeItem || !treeItem.classList.contains('bl-media-folders-tree-item--branch')) {
							return;
						}
						var expanded = treeItem.classList.toggle('is-expanded');
						folderToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
						var tid = parseInt(treeItem.getAttribute('data-folder-term-id') || '0', 10);
						if (!isNaN(tid) && tid > 0) {
							blModalPersistBranchCollapse(tid, !expanded);
						}
						return;
					}
					var btn = e.target.closest('.bl-media-folder-row');
					if (!btn || !panel.contains(btn)) {
						return;
					}
					e.preventDefault();
					if (btn.getAttribute('data-bl-unassigned') === '1') {
						applyFolder(0, true);
					} else {
						var id = parseInt(btn.getAttribute('data-folder-id') || '0', 10);
						if (isNaN(id) || id < 0) {
							id = 0;
						}
						applyFolder(id, false);
					}
					repaintActive();
				});
				repaintActive();
			}
			injectModalFoldersPanel();
			ensureModalFoldersToolbarToggle();
			var obs = new MutationObserver(function() {
				injectModalFoldersPanel();
				ensureModalFoldersToolbarToggle();
			});
			obs.observe(document.body, {
				childList: true,
				subtree: true
			});
		})(<?php echo wp_json_encode($bl_modal_folders_config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>);
	</script>
<?php
});

/**
 * Filter media attachments in list/grid mode by selected folder.
 */
add_filter('ajax_query_attachments_args', function (array $args): array {
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY)) {
		return $args;
	}

	$request = wp_unslash($_REQUEST);
	$unassigned = false;
	$raw_un = null;
	if (isset($request['query']['bl_media_folder_unassigned'])) {
		$raw_un = $request['query']['bl_media_folder_unassigned'];
	} elseif (isset($request['bl_media_folder_unassigned'])) {
		$raw_un = $request['bl_media_folder_unassigned'];
	}
	if ($raw_un === 1 || $raw_un === '1' || $raw_un === true) {
		$unassigned = true;
	}

	if ($unassigned) {
		$args['post_type'] = 'attachment';
		$args['post_status'] = 'inherit';
		$tax_query = isset($args['tax_query']) ? (array) $args['tax_query'] : [];
		$tax_query[] = [
			'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
			'operator' => 'NOT EXISTS',
		];
		$args['tax_query'] = $tax_query;
		return $args;
	}

	$folder_id = 0;
	if (isset($request['query']) && is_array($request['query']) && isset($request['query']['bl_media_folder_id'])) {
		$folder_id = absint($request['query']['bl_media_folder_id']);
	}

	if ($folder_id <= 0) {
		return $args;
	}
	$args['post_type'] = 'attachment';
	$args['post_status'] = 'inherit';

	$tax_query = isset($args['tax_query']) ? (array)$args['tax_query'] : [];

	$tax_query[] = [
		'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
		'field' => 'term_id',
		'terms' => [$folder_id],
		'include_children' => true,
	];

	$args['tax_query'] = $tax_query;

	return $args;
}, 10);

/**
 * Filter Media > Library list table by selected folder.
 */
add_action('pre_get_posts', function (WP_Query $query): void {
	if (!is_admin() || !$query->is_main_query()) {
		return;
	}
	global $pagenow;
	if ($pagenow !== 'upload.php') {
		return;
	}
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY)) {
		return;
	}

	if (bl_media_folders_is_unassigned_filter()) {
		$tax_query = (array) $query->get('tax_query');
		$tax_query[] = [
			'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
			'operator' => 'NOT EXISTS',
		];
		$query->set('tax_query', $tax_query);
		return;
	}

	$folder_id = bl_media_folders_current_id();
	if ($folder_id <= 0) {
		return;
	}

	$tax_query = (array) $query->get('tax_query');
	$tax_query[] = [
		'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
		'field' => 'term_id',
		'terms' => [$folder_id],
		'include_children' => true,
	];
	$query->set('tax_query', $tax_query);
}, 10);

/**
 * Current folder term ID for an attachment (0 = none).
 */
function bl_media_folders_attachment_folder_id(int $attachment_id): int
{
	$terms = wp_get_object_terms($attachment_id, BL_MEDIA_FOLDER_TAXONOMY, ['fields' => 'ids']);
	if (is_wp_error($terms) || $terms === []) {
		return 0;
	}

	return (int) $terms[0];
}

/**
 * Folder field markup aligned with the media modal attachment-details `.setting` pattern.
 */
function bl_media_folders_attachment_folder_setting_html(int $attachment_id, int $current_id = 0): string
{
	$attachment_id = (int) $attachment_id;
	if ($attachment_id <= 0 || !taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY)) {
		return '';
	}

	$id_attr = 'attachment-details-bl-media-folder-id';
	$name = 'attachments[' . $attachment_id . '][bl_media_folder_id]';

	ob_start();
	echo '<span class="setting" data-setting="bl_media_folder_id">';
	echo '<label for="' . esc_attr($id_attr) . '" class="name">' . esc_html__('Folder', 'baselayer') . '</label>';
	wp_dropdown_categories([
		'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
		'name' => $name,
		'id' => $id_attr,
		'orderby' => 'name',
		'hide_empty' => false,
		'hierarchical' => true,
		'show_option_none' => __('No folder', 'baselayer'),
		'option_none_value' => '0',
		'selected' => $current_id,
		'value_field' => 'term_id',
	]);
	echo '</span>';

	return (string) ob_get_clean();
}

/**
 * Legacy upload/compat screens still use attachment_fields_to_edit (table layout).
 * The grid modal uses wp_prepare_attachment_for_js below.
 */
add_filter('attachment_fields_to_edit', function (array $form_fields, WP_Post $post): array {
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY)) {
		return $form_fields;
	}

	$current_id = bl_media_folders_attachment_folder_id((int) $post->ID);

	ob_start();
	wp_dropdown_categories([
		'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
		'name' => 'attachments[' . (int) $post->ID . '][bl_media_folder_id]',
		'orderby' => 'name',
		'hide_empty' => false,
		'hierarchical' => true,
		'show_option_none' => __('No folder', 'baselayer'),
		'option_none_value' => '0',
		'selected' => $current_id,
		'value_field' => 'term_id',
	]);
	$field_html = (string) ob_get_clean();

	$form_fields['bl_media_folder_id'] = [
		'label' => __('Folder', 'baselayer'),
		'input' => 'html',
		'html' => $field_html,
		'show_in_modal' => false,
	];
	return $form_fields;
}, 10, 2);

add_filter('wp_prepare_attachment_for_js', function (array $response, WP_Post $attachment, $meta): array {
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY)) {
		return $response;
	}

	$folder_id = bl_media_folders_attachment_folder_id((int) $attachment->ID);
	$response['bl_media_folder_id'] = $folder_id;

	$setting_html = bl_media_folders_attachment_folder_setting_html((int) $attachment->ID, $folder_id);
	if ($setting_html === '') {
		return $response;
	}

	if (!isset($response['compat']) || !is_array($response['compat'])) {
		$response['compat'] = [];
	}

	$existing = isset($response['compat']['item']) && is_string($response['compat']['item'])
		? $response['compat']['item']
		: '';
	$response['compat']['item'] = $existing === '' ? $setting_html : $setting_html . $existing;

	return $response;
}, 20, 3);

/**
 * Save folder assignment from attachment edit details.
 */
add_filter('attachment_fields_to_save', function (array $post, array $attachment): array {
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY) || empty($post['ID'])) {
		return $post;
	}
	$attachment_id = (int) $post['ID'];
	$raw_folder = null;
	if (array_key_exists('bl_media_folder_id', $attachment)) {
		$raw_folder = $attachment['bl_media_folder_id'];
	} elseif (isset($attachment['compat']) && is_array($attachment['compat']) && array_key_exists('bl_media_folder_id', $attachment['compat'])) {
		$raw_folder = $attachment['compat']['bl_media_folder_id'];
	}
	if ($raw_folder === null) {
		return $post;
	}
	bl_media_folders_set_attachment_folder($attachment_id, $raw_folder);
	return $post;
}, 10, 2);

/**
 * Fallback for media grid/modal save flow where custom compat fields are posted via AJAX.
 */
add_action('wp_ajax_save_attachment_compat', function (): void {
	if (!current_user_can('upload_files') || !taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY)) {
		return;
	}
	$attachment_id = isset($_REQUEST['id']) ? absint($_REQUEST['id']) : 0;
	if ($attachment_id <= 0) {
		return;
	}
	$folder_value = bl_media_folders_get_ajax_folder_value($attachment_id);
	if ($folder_value === null) {
		return;
	}
	bl_media_folders_set_attachment_folder($attachment_id, $folder_value);
}, 1);

/**
 * List view: add a "Folder" row action that opens a modal to assign the file to a folder.
 */
add_filter('media_row_actions', function (array $actions, WP_Post $post): array {
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY) || $post->post_type !== 'attachment') {
		return $actions;
	}
	if (!current_user_can('edit_post', $post->ID)) {
		return $actions;
	}
	$terms = wp_get_object_terms($post->ID, BL_MEDIA_FOLDER_TAXONOMY, ['fields' => 'ids']);
	$current_id = !is_wp_error($terms) && !empty($terms) ? (int) $terms[0] : 0;
	$actions['bl_media_folder'] = sprintf(
		'<a href="#" class="bl-media-assign-folder-link" data-attachment-id="%d" data-current-folder="%d">%s</a>',
		$post->ID,
		$current_id,
		esc_html__('Folder', 'baselayer')
	);
	return $actions;
}, 10, 2);

/**
 * AJAX: assign one attachment to a media folder (or clear folder when folder_id is 0).
 */
add_action('wp_ajax_bl_media_folder_assign', function (): void {
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY) || !check_ajax_referer('bl_media_folder_assign', 'nonce', false)) {
		wp_send_json_error(['message' => __('Something went wrong.', 'baselayer')], 403);
	}
	if (!current_user_can('upload_files')) {
		wp_send_json_error(['message' => __('You do not have permission to change folders.', 'baselayer')], 403);
	}
	$attachment_id = isset($_POST['attachment_id']) ? absint($_POST['attachment_id']) : 0;
	$folder_id = isset($_POST['folder_id']) ? absint($_POST['folder_id']) : 0;
	if ($attachment_id <= 0 || get_post_type($attachment_id) !== 'attachment' || !current_user_can('edit_post', $attachment_id)) {
		wp_send_json_error(['message' => __('You cannot edit this item.', 'baselayer')], 403);
	}
	if ($folder_id > 0) {
		$term = get_term($folder_id, BL_MEDIA_FOLDER_TAXONOMY);
		if (!$term instanceof WP_Term || is_wp_error($term)) {
			wp_send_json_error(['message' => __('Invalid folder.', 'baselayer')], 400);
		}
	}
	bl_media_folders_set_attachment_folder($attachment_id, $folder_id);
	wp_send_json_success([
		'folder_id' => $folder_id,
		'message'   => __('Folder assignment saved.', 'baselayer'),
	]);
});

/**
 * Handle sidebar "create folder" form submission.
 */
add_action('admin_post_bl_media_folder_create', function (): void {
	if (!current_user_can('upload_files')) {
		wp_die(esc_html__('You do not have permission to create media folders.', 'baselayer'));
	}
	check_admin_referer('bl_media_folder_create');

	$redirect_to = isset($_POST['redirect_to']) ? (string) wp_unslash($_POST['redirect_to']) : '';
	$redirect_to = wp_validate_redirect($redirect_to, admin_url('upload.php'));
	if ($redirect_to === '') {
		$redirect_to = admin_url('upload.php');
	}

	$name = isset($_POST['bl_media_folder_name']) ? sanitize_text_field((string) wp_unslash($_POST['bl_media_folder_name'])) : '';
	$parent = isset($_POST['bl_media_folder_parent']) ? absint($_POST['bl_media_folder_parent']) : 0;
	if ($name === '') {
		wp_safe_redirect(add_query_arg('bl_media_folder_error', 'empty', $redirect_to));
		exit;
	}

	$insert = wp_insert_term($name, BL_MEDIA_FOLDER_TAXONOMY, ['parent' => $parent]);
	if (is_wp_error($insert)) {
		$term_exists = $insert->get_error_data('term_exists');
		$term_id = is_numeric($term_exists) ? (int) $term_exists : 0;
		if ($term_id <= 0) {
			wp_safe_redirect(add_query_arg('bl_media_folder_error', 'insert', $redirect_to));
			exit;
		}
	} else {
		$term_id = isset($insert['term_id']) ? (int) $insert['term_id'] : 0;
	}

	$url = add_query_arg('bl_media_folder_id', $term_id, remove_query_arg('bl_media_folder_unassigned', $redirect_to));
	$url = add_query_arg('bl_media_folder_success', '1', $url);
	wp_safe_redirect($url);
	exit;
});

/**
 * Whether a folder term has child folders.
 *
 * @param WP_Term[] $terms
 */
function bl_media_folders_term_has_children(array $terms, int $term_id): bool
{
	foreach ($terms as $term) {
		if (!$term instanceof WP_Term) {
			continue;
		}
		if ((int) $term->parent === $term_id) {
			return true;
		}
	}

	return false;
}

/**
 * Inline SVG icon for folder sidebar (Material-style paths, viewBox 0 -960 960 960).
 */
function bl_media_folders_icon_svg(string $variant): string
{
	$paths = [
		'all' => 'M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h207q16 0 30.5 6t25.5 17l57 57h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm436-202 68 51q6 5 11.5 1t3.5-11l-25-85 70-56q5-5 3-11.5t-9-6.5h-86l-26-82q-2-7-10-7t-10 7l-26 82h-86q-7 0-9 6.5t3 11.5l70 56-25 85q-2 7 3.5 11t11.5-1l68-51Z',
		'unassigned' => 'M812-261 342-731q-19-19-8.5-44t37.5-25q8 0 15.5 3t13.5 9l68 68h332q33 0 56.5 23.5T880-640v350q0 27-24.5 37.5T812-261ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800l80 80H128l-72-72q-11-11-11.5-27.5T56-848q11-11 28-11t28 11l736 736q12 12 11.5 28T847-56q-12 11-28 11.5T791-56L687-160H160Z',
		'folder_leaf' => 'M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h207q16 0 30.5 6t25.5 17l57 57h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160',
		'folder_closed' => 'M120-120q-33 0-56.5-23.5T40-200v-480q0-17 11.5-28.5T80-720q17 0 28.5 11.5T120-680v480h640q17 0 28.5 11.5T800-160q0 17-11.5 28.5T760-120H120Zm160-160q-33 0-56.5-23.5T200-360v-440q0-33 23.5-56.5T280-880h167q16 0 30.5 6t25.5 17l57 57h280q33 0 56.5 23.5T920-720v360q0 33-23.5 56.5T840-280H280Z',
		'folder_open' => 'M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h207q16 0 30.5 6t25.5 17l57 57h360q17 0 28.5 11.5T880-680q0 17-11.5 28.5T840-640H314q-62 0-108 39t-46 99v262l79-263q8-26 29.5-41.5T316-560h516q41 0 64.5 32.5T909-457l-72 240q-8 26-29.5 41.5T760-160H160Z',
	];
	$d = $paths[$variant] ?? $paths['folder_leaf'];

	return '<svg xmlns="http://www.w3.org/2000/svg" class="bl-media-folders-svg" width="20" height="20" viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true"><path d="' . esc_attr($d) . '"/></svg>';
}

/**
 * Folder row icon(s): leaf, or branch with open/closed pair toggled via CSS.
 */
function bl_media_folders_folder_icon_markup(bool $has_children): string
{
	if (!$has_children) {
		return '<span class="bl-media-folders-item-icon bl-media-folders-item-icon--leaf">' . bl_media_folders_icon_svg('folder_leaf') . '</span>';
	}

	return '<span class="bl-media-folders-item-icon bl-media-folders-item-icon--branch">'
		. '<span class="bl-media-folders-item-icon-visual bl-media-folders-item-icon-visual--open">' . bl_media_folders_icon_svg('folder_open') . '</span>'
		. '<span class="bl-media-folders-item-icon-visual bl-media-folders-item-icon-visual--closed">' . bl_media_folders_icon_svg('folder_closed') . '</span>'
		. '</span>';
}

/**
 * Build tree list markup for folder sidebar (nested UL per branch).
 *
 * @param WP_Term[] $terms
 * @param array<int,int> $display_counts
 */
function bl_media_folders_render_list(array $terms, array $display_counts, int $parent_id, int $depth, int $current_id, bool $unassigned_active, string $base_url, string $redirect_url): void
{
	foreach ($terms as $term) {
		if ((int) $term->parent !== $parent_id) {
			continue;
		}
		$term_id = (int) $term->term_id;
		$display_count = isset($display_counts[$term_id]) ? (int) $display_counts[$term_id] : (int) $term->count;
		$url = add_query_arg('bl_media_folder_id', (int) $term->term_id, remove_query_arg('bl_media_folder_unassigned', $base_url));
		$item_classes = ['bl-media-folders-item', 'bl-media-folders-link'];
		if (!$unassigned_active && $term_id === $current_id) {
			$item_classes[] = 'is-active';
		}
		$has_children = bl_media_folders_term_has_children($terms, $term_id);
		$li_classes = ['bl-media-folders-tree-item'];
		if ($has_children) {
			$li_classes[] = 'bl-media-folders-tree-item--branch';
			$li_classes[] = 'is-expanded';
		}
		$delete_url = add_query_arg([
			'action' => 'bl_media_folder_delete',
			'term_id' => $term_id,
			'redirect_to' => $redirect_url,
		], admin_url('admin-post.php'));
		$delete_url = wp_nonce_url($delete_url, 'bl_media_folder_delete_' . $term_id);
		$li_attr = $has_children ? ' data-folder-term-id="' . esc_attr((string) $term_id) . '"' : '';
		echo '<li class="' . esc_attr(implode(' ', $li_classes)) . '"' . $li_attr . '>';
		echo '<div class="' . esc_attr(implode(' ', $item_classes)) . '">';
		echo '<a class="bl-media-folders-link bl-media-folder-row" href="' . esc_url($url) . '">';
		if ($has_children) {
			echo '<span class="bl-media-folders-folder-toggle" role="button" tabindex="0" aria-expanded="true" aria-label="' . esc_attr__('Expand or collapse subfolders', 'baselayer') . '">';
			echo bl_media_folders_folder_icon_markup(true);
			echo '</span>';
		} else {
			echo '<span class="bl-media-folders-folder-toggle bl-media-folders-folder-toggle--leaf" aria-hidden="true">';
			echo bl_media_folders_folder_icon_markup(false);
			echo '</span>';
		}
		echo '<span class="name">' . esc_html($term->name) . '</span>';
		echo '<span class="bl-media-folders-count">' . esc_html((string) $display_count) . '</span>';
		echo '</a>';
		echo '<span class="bl-media-folders-item-toolbar">';
		echo '<button type="button" class="bl-media-folder-edit-btn" aria-label="' . esc_attr__('Rename folder', 'baselayer') . '" data-term-id="' . esc_attr((string) $term_id) . '" data-folder-name="' . esc_attr($term->name) . '"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M160-120q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm544-528 56-56-56-56-56 56 56 56Z"/></svg></button>';
		echo '<button type="button" class="bl-media-folder-delete-btn" aria-label="' . esc_attr__('Delete folder', 'baselayer') . '" data-folder-name="' . esc_attr($term->name) . '" data-folder-count="' . $display_count . '" data-delete-url="' . esc_url($delete_url) . '"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm148.5-171.5Q440-303 440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280q17 0 28.5-11.5Zm160 0Q600-303 600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280q17 0 28.5-11.5Z"/></svg></button>';
		echo '</span>';
		echo '</div>';
		if ($has_children) {
			echo '<div class="bl-media-folders-branch">';
			echo '<ul class="bl-media-folders-branch-list">';
			bl_media_folders_render_list($terms, $display_counts, $term_id, $depth + 1, $current_id, $unassigned_active, $base_url, $redirect_url);
			echo '</ul>';
			echo '</div>';
		}
		echo '</li>';
	}
}

/**
 * Build aggregated folder counts so parents include all descendants.
 *
 * @param WP_Term[] $terms
 * @return array<int,int>
 */
function bl_media_folders_build_display_counts(array $terms): array
{
	$by_parent = [];
	$direct = [];
	foreach ($terms as $term) {
		if (!$term instanceof WP_Term) {
			continue;
		}
		$term_id = (int) $term->term_id;
		$parent_id = (int) $term->parent;
		$direct[$term_id] = (int) $term->count;
		if (!isset($by_parent[$parent_id])) {
			$by_parent[$parent_id] = [];
		}
		$by_parent[$parent_id][] = $term_id;
	}
	$totals = [];
	$walk = static function (int $term_id) use (&$walk, &$totals, $by_parent, $direct): int {
		if (isset($totals[$term_id])) {
			return $totals[$term_id];
		}
		$total = isset($direct[$term_id]) ? (int) $direct[$term_id] : 0;
		if (isset($by_parent[$term_id])) {
			foreach ($by_parent[$term_id] as $child_id) {
				$total += $walk((int) $child_id);
			}
		}
		$totals[$term_id] = $total;
		return $total;
	};
	foreach (array_keys($direct) as $term_id) {
		$walk((int) $term_id);
	}
	return $totals;
}

/**
 * Handle sidebar "delete folder" action.
 */
add_action('admin_post_bl_media_folder_delete', function (): void {
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY)) {
		wp_die(esc_html__('Media folder taxonomy not available.', 'baselayer'));
	}
	$term_id = isset($_GET['term_id']) ? absint($_GET['term_id']) : 0;
	$redirect_to = isset($_GET['redirect_to']) ? (string) wp_unslash($_GET['redirect_to']) : '';
	$redirect_to = wp_validate_redirect($redirect_to, admin_url('upload.php'));
	if ($redirect_to === '') {
		$redirect_to = admin_url('upload.php');
	}
	$redirect_to = remove_query_arg(['bl_media_folder_id', 'bl_media_folder_unassigned', 'bl_media_folder', 'bl_media_folder_error', 'bl_media_folder_success'], $redirect_to);

	$tax = get_taxonomy(BL_MEDIA_FOLDER_TAXONOMY);
	$delete_cap = ($tax && isset($tax->cap->delete_terms)) ? $tax->cap->delete_terms : 'manage_categories';
	if (!current_user_can($delete_cap)) {
		wp_safe_redirect(add_query_arg('bl_media_folder_error', 'delete_cap', $redirect_to));
		exit;
	}
	if ($term_id <= 0) {
		wp_safe_redirect(add_query_arg('bl_media_folder_error', 'delete_invalid', $redirect_to));
		exit;
	}

	check_admin_referer('bl_media_folder_delete_' . $term_id);

	$term = get_term($term_id, BL_MEDIA_FOLDER_TAXONOMY);
	if (!$term || is_wp_error($term)) {
		wp_safe_redirect(add_query_arg('bl_media_folder_error', 'delete_missing', $redirect_to));
		exit;
	}

	$deleted = wp_delete_term($term_id, BL_MEDIA_FOLDER_TAXONOMY);
	if (is_wp_error($deleted) || !$deleted) {
		wp_safe_redirect(add_query_arg('bl_media_folder_error', 'delete_failed', $redirect_to));
		exit;
	}

	wp_safe_redirect(add_query_arg('bl_media_folder_success', 'deleted', $redirect_to));
	exit;
});

/**
 * Handle sidebar "rename folder" form submission.
 */
add_action('admin_post_bl_media_folder_rename', function (): void {
	if (!taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY)) {
		wp_die(esc_html__('Media folder taxonomy not available.', 'baselayer'));
	}
	check_admin_referer('bl_media_folder_rename');

	$term_id = isset($_POST['bl_media_folder_rename_term_id']) ? absint($_POST['bl_media_folder_rename_term_id']) : 0;
	$name = isset($_POST['bl_media_folder_rename_name']) ? sanitize_text_field((string) wp_unslash($_POST['bl_media_folder_rename_name'])) : '';
	$redirect_to = isset($_POST['redirect_to']) ? (string) wp_unslash($_POST['redirect_to']) : '';
	$redirect_to = wp_validate_redirect($redirect_to, admin_url('upload.php'));
	if ($redirect_to === '') {
		$redirect_to = admin_url('upload.php');
	}
	$redirect_to = remove_query_arg(['bl_media_folder_error', 'bl_media_folder_success'], $redirect_to);

	$tax = get_taxonomy(BL_MEDIA_FOLDER_TAXONOMY);
	$edit_cap = ($tax && isset($tax->cap->edit_terms)) ? $tax->cap->edit_terms : 'manage_categories';
	if (!current_user_can($edit_cap)) {
		wp_safe_redirect(add_query_arg('bl_media_folder_error', 'rename_cap', $redirect_to));
		exit;
	}
	if ($term_id <= 0) {
		wp_safe_redirect(add_query_arg('bl_media_folder_error', 'rename_invalid', $redirect_to));
		exit;
	}
	if ($name === '') {
		wp_safe_redirect(add_query_arg('bl_media_folder_error', 'rename_empty', $redirect_to));
		exit;
	}

	$term = get_term($term_id, BL_MEDIA_FOLDER_TAXONOMY);
	if (!$term instanceof WP_Term || is_wp_error($term)) {
		wp_safe_redirect(add_query_arg('bl_media_folder_error', 'rename_missing', $redirect_to));
		exit;
	}

	$updated = wp_update_term($term_id, BL_MEDIA_FOLDER_TAXONOMY, ['name' => $name]);
	if (is_wp_error($updated)) {
		$code = $updated->get_error_code();
		if ($code === 'duplicate_term' || $code === 'term_exists') {
			wp_safe_redirect(add_query_arg('bl_media_folder_error', 'rename_duplicate', $redirect_to));
			exit;
		}
		wp_safe_redirect(add_query_arg('bl_media_folder_error', 'rename_failed', $redirect_to));
		exit;
	}

	$url = add_query_arg('bl_media_folder_id', $term_id, remove_query_arg(['bl_media_folder_unassigned'], $redirect_to));
	wp_safe_redirect(add_query_arg('bl_media_folder_success', 'renamed', $url));
	exit;
});

/**
 * Render the sidebar and attach it left of the media list.
 */
add_action('admin_footer-upload.php', function (): void {
	if (!current_user_can('upload_files') || !taxonomy_exists(BL_MEDIA_FOLDER_TAXONOMY)) {
		return;
	}
	$folder_id = bl_media_folders_current_id();
	$unassigned_active = bl_media_folders_is_unassigned_filter();
	$unassigned_count = bl_media_folders_count_unassigned();
	$all_files_count = bl_media_folders_count_all_attachments();
	$terms = get_terms([
		'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
		'hide_empty' => false,
		'orderby' => 'name',
		'order' => 'ASC',
	]);
	if (is_wp_error($terms)) {
		$terms = [];
	}
	$display_counts = bl_media_folders_build_display_counts($terms);

	$base_args = ['mode', 'post_mime_type', 'detached', 'm', 's'];
	$base_url = admin_url('upload.php');
	foreach ($base_args as $arg) {
		if (!isset($_GET[$arg])) {
			continue;
		}
		$base_url = add_query_arg($arg, sanitize_text_field((string) wp_unslash($_GET[$arg])), $base_url);
	}

	$message = '';
	$message_class = '';
	if (isset($_GET['bl_media_folder_error'])) {
		$message_class = 'is-error';
		$error = sanitize_key((string) $_GET['bl_media_folder_error']);
		if ($error === 'empty' || $error === 'rename_empty') {
			$message = __('Please enter a folder name.', 'baselayer');
		} elseif ($error === 'rename_duplicate') {
			$message = __('A folder with that name already exists.', 'baselayer');
		} elseif (strpos($error, 'delete_') === 0) {
			$message = __('Could not delete this folder.', 'baselayer');
		} elseif (strpos($error, 'rename_') === 0) {
			$message = __('Could not rename this folder.', 'baselayer');
		} else {
			$message = __('Could not create this folder.', 'baselayer');
		}
	} elseif (isset($_GET['bl_media_folder_success'])) {
		$message_class = 'is-success';
		$success = sanitize_key((string) $_GET['bl_media_folder_success']);
		if ($success === 'deleted') {
			$message = __('Folder deleted.', 'baselayer');
		} elseif ($success === 'renamed') {
			$message = __('Folder renamed.', 'baselayer');
		} else {
			$message = __('Folder created.', 'baselayer');
		}
	}
?>
	<aside id="bl-media-folders-sidebar" class="bl-media-folders-sidebar" style="display:none;">
		<div class="bl-media-folders-header">
			<h2 class="bl-media-folders-title" id="bl-media-folders-heading"><?= esc_html__('Folders', 'baselayer') ?></h2>
			<div class="bl-media-folders-header-toolbar">
				<div class="bl-media-folders-header-actions">
					<button type="button" class="components-button is-small is-tertiary bl-media-folders-add-btn" id="bl-media-folders-add-open" aria-expanded="false" aria-haspopup="dialog" aria-controls="bl-media-folder-create-modal">
						<div class="bl-media-folders-add-btn__icon">
							<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
								<path d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z" />
							</svg>
						</div>
						<div class="bl-media-folders-add-btn__text"><?= esc_html__('New folder', 'baselayer') ?></div>
					</button>
					<div class="bl-media-folders-header-mode-toggles">
						<button type="button" class="components-button is-small is-tertiary bl-media-folders-edit-toggle-btn" id="bl-media-folders-edit-toggle" aria-pressed="false" aria-label="<?= esc_attr__('Show folder rename buttons', 'baselayer') ?>" title="<?= esc_attr__('Show folder rename buttons', 'baselayer') ?>">
							<span class="bl-media-folders-edit-toggle-btn__icon" aria-hidden="true">
								<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
									<path d="M160-120q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm544-528 56-56-56-56-56 56 56 56Z" />
								</svg>
							</span>
						</button>
						<button type="button" class="components-button is-small is-tertiary bl-media-folders-delete-toggle-btn" id="bl-media-folders-delete-toggle" aria-pressed="false" aria-label="<?= esc_attr__('Show folder delete buttons', 'baselayer') ?>" title="<?= esc_attr__('Show folder delete buttons', 'baselayer') ?>">
							<span class="bl-media-folders-delete-toggle-btn__icon" aria-hidden="true">
								<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
									<path d="M280-120q-33 0-56.5-23.5T200-200v-520q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800h160q0-17 11.5-28.5T400-840h160q17 0 28.5 11.5T600-800h160q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720v520q0 33-23.5 56.5T680-120H280Zm148.5-171.5Q440-303 440-320v-280q0-17-11.5-28.5T400-640q-17 0-28.5 11.5T360-600v280q0 17 11.5 28.5T400-280q17 0 28.5-11.5Zm160 0Q600-303 600-320v-280q0-17-11.5-28.5T560-640q-17 0-28.5 11.5T520-600v280q0 17 11.5 28.5T560-280q17 0 28.5-11.5Z" />
								</svg>
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
		<?php if ($message !== '') : ?>
			<div class="bl-media-folders-message <?= esc_attr($message_class) ?>"><?= esc_html($message) ?></div>
		<?php endif; ?>
		<ul class="bl-media-folders-list">
			<li>
				<?php
				$strip_folder_q = ['bl_media_folder_id', 'bl_media_folder_unassigned', 'bl_media_folder_error', 'bl_media_folder_success'];
				$all_files_url = remove_query_arg($strip_folder_q, $base_url);
				$all_item_classes = ['bl-media-folders-item', 'bl-media-folders-item--all', 'bl-media-folders-link'];
				if ($folder_id <= 0 && !$unassigned_active) {
					$all_item_classes[] = 'is-active';
				}
				?>
				<div class="<?= esc_attr(implode(' ', $all_item_classes)) ?>">
					<button type="button" class="bl-media-folders-link bl-media-folders-link--all bl-media-folder-row bl-media-folder-row--all" data-bl-all-url="<?= esc_url($all_files_url) ?>">
						<span class="bl-media-folders-item-icon bl-media-folders-item-icon--all" aria-hidden="true"><?php echo bl_media_folders_icon_svg('all'); ?></span>
						<span class="bl-media-folders-link-label"><?= esc_html__('All files', 'baselayer') ?></span>
						<span class="bl-media-folders-count"><?= esc_html((string) (int) $all_files_count) ?></span>
					</button>
				</div>
			</li>
			<li>
				<?php
				$unassigned_url = add_query_arg('bl_media_folder_unassigned', '1', remove_query_arg($strip_folder_q, $base_url));
				$un_item_classes = ['bl-media-folders-item', 'bl-media-folders-item--unassigned', 'bl-media-folders-link'];
				if ($unassigned_active) {
					$un_item_classes[] = 'is-active';
				}
				?>
				<div class="<?= esc_attr(implode(' ', $un_item_classes)) ?>">
					<a class="bl-media-folders-link bl-media-folder-row bl-media-folder-row--unassigned" href="<?= esc_url($unassigned_url) ?>">
						<span class="bl-media-folders-item-icon bl-media-folders-item-icon--unassigned" aria-hidden="true"><?php echo bl_media_folders_icon_svg('unassigned'); ?></span>
						<span class="name"><?= esc_html__('Not in a folder', 'baselayer') ?></span>
						<span class="bl-media-folders-count"><?= esc_html((string) (int) $unassigned_count) ?></span>
					</a>
				</div>
			</li>
			<?php
			$sidebar_redirect_url = remove_query_arg($strip_folder_q, $base_url);
			bl_media_folders_render_list($terms, $display_counts, 0, 0, $folder_id, $unassigned_active, $sidebar_redirect_url, $sidebar_redirect_url);
			?>
		</ul>
	</aside>
	<div id="bl-media-folder-delete-modal" class="bl-media-folder-delete-modal" aria-hidden="true">
		<div class="bl-media-folder-delete-backdrop" data-modal-close></div>
		<div class="bl-media-folder-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="bl-media-folder-delete-title">
			<h2 id="bl-media-folder-delete-title"><?= esc_html__('Delete folder', 'baselayer') ?></h2>
			<p id="bl-media-folder-delete-text"></p>
			<div class="bl-media-folder-delete-actions">
				<button type="button" class="button" data-modal-close><?= esc_html__('Cancel', 'baselayer') ?></button>
				<a href="#" class="button button-primary button-link-delete" id="bl-media-folder-delete-confirm"><?= esc_html__('Delete folder', 'baselayer') ?></a>
			</div>
		</div>
	</div>
	<div id="bl-media-folder-assign-modal" class="bl-media-folder-assign-modal" aria-hidden="true" data-bl-assign-nonce="<?= esc_attr(wp_create_nonce('bl_media_folder_assign')) ?>" data-bl-ajax-url="<?= esc_url(admin_url('admin-ajax.php')) ?>">
		<div class="bl-media-folder-assign-backdrop" data-modal-close></div>
		<div class="bl-media-folder-assign-dialog" role="dialog" aria-modal="true" aria-labelledby="bl-media-folder-assign-title" aria-describedby="bl-media-folder-assign-desc">
			<h2 id="bl-media-folder-assign-title"><?= esc_html__('Add to folder', 'baselayer') ?></h2>
			<p id="bl-media-folder-assign-desc" class="description"><?= esc_html__('Choose a folder for this file. You can clear the folder by selecting “No folder”.', 'baselayer') ?></p>
			<p>
				<label for="bl_media_assign_folder_id" class="screen-reader-text"><?= esc_html__('Folder', 'baselayer') ?></label>
				<?php
				wp_dropdown_categories([
					'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
					'name' => 'bl_media_assign_folder_id',
					'id' => 'bl_media_assign_folder_id',
					'orderby' => 'name',
					'hide_empty' => false,
					'hierarchical' => true,
					'show_option_none' => __('No folder', 'baselayer'),
					'option_none_value' => '0',
					'value_field' => 'term_id',
				]);
				?>
			</p>
			<div class="bl-media-folder-assign-actions">
				<button type="button" class="button" data-modal-close><?= esc_html__('Cancel', 'baselayer') ?></button>
				<button type="button" class="button button-primary" id="bl-media-folder-assign-save"><?= esc_html__('Save', 'baselayer') ?></button>
			</div>
		</div>
	</div>
	<div id="bl-media-folder-create-modal" class="bl-media-folder-create-modal" aria-hidden="true">
		<div class="bl-media-folder-create-backdrop" data-modal-close></div>
		<div class="bl-media-folder-create-dialog" role="dialog" aria-modal="true" aria-labelledby="bl-media-folder-create-title">
			<h2 id="bl-media-folder-create-title"><?= esc_html__('Add folder', 'baselayer') ?></h2>
			<form method="post" action="<?= esc_url(admin_url('admin-post.php')) ?>" class="bl-media-folders-create" id="bl-media-folders-create-form">
				<input type="hidden" name="action" value="bl_media_folder_create">
				<input type="hidden" name="redirect_to" value="<?= esc_attr(remove_query_arg(['bl_media_folder_id', 'bl_media_folder_unassigned', 'bl_media_folder_error', 'bl_media_folder_success'], $base_url)) ?>">
				<?php wp_nonce_field('bl_media_folder_create'); ?>
				<p>
					<label for="bl_media_folder_name" class="screen-reader-text"><?= esc_html__('Folder name', 'baselayer') ?></label>
					<input type="text" name="bl_media_folder_name" id="bl_media_folder_name" class="regular-text" style="width:100%;" placeholder="<?= esc_attr__('New folder name', 'baselayer') ?>" required autocomplete="off">
				</p>
				<p>
					<label for="bl_media_folder_parent" class="screen-reader-text"><?= esc_html__('Parent folder', 'baselayer') ?></label>
					<?php
					wp_dropdown_categories([
						'taxonomy' => BL_MEDIA_FOLDER_TAXONOMY,
						'name' => 'bl_media_folder_parent',
						'id' => 'bl_media_folder_parent',
						'orderby' => 'name',
						'hide_empty' => false,
						'hierarchical' => true,
						'show_option_none' => __('No parent', 'baselayer'),
						'option_none_value' => '0',
					]);
					?>
				</p>
				<div class="bl-media-folder-create-actions">
					<button type="button" class="button" data-modal-close><?= esc_html__('Cancel', 'baselayer') ?></button>
					<button type="submit" class="button button-primary"><?= esc_html__('Create folder', 'baselayer') ?></button>
				</div>
			</form>
		</div>
	</div>
	<div id="bl-media-folder-rename-modal" class="bl-media-folder-rename-modal" aria-hidden="true">
		<div class="bl-media-folder-rename-backdrop" data-modal-close></div>
		<div class="bl-media-folder-rename-dialog" role="dialog" aria-modal="true" aria-labelledby="bl-media-folder-rename-title">
			<h2 id="bl-media-folder-rename-title"><?= esc_html__('Rename folder', 'baselayer') ?></h2>
			<form method="post" action="<?= esc_url(admin_url('admin-post.php')) ?>" class="bl-media-folders-rename" id="bl-media-folders-rename-form">
				<input type="hidden" name="action" value="bl_media_folder_rename">
				<input type="hidden" name="redirect_to" id="bl_media_folder_rename_redirect" value="<?= esc_attr(remove_query_arg(['bl_media_folder_id', 'bl_media_folder_unassigned', 'bl_media_folder_error', 'bl_media_folder_success'], $base_url)) ?>">
				<input type="hidden" name="bl_media_folder_rename_term_id" id="bl_media_folder_rename_term_id" value="">
				<?php wp_nonce_field('bl_media_folder_rename'); ?>
				<p>
					<label for="bl_media_folder_rename_name" class="screen-reader-text"><?= esc_html__('Folder name', 'baselayer') ?></label>
					<input type="text" name="bl_media_folder_rename_name" id="bl_media_folder_rename_name" class="regular-text" style="width:100%;" required autocomplete="off">
				</p>
				<div class="bl-media-folder-rename-actions">
					<button type="button" class="button" data-modal-close><?= esc_html__('Cancel', 'baselayer') ?></button>
					<button type="submit" class="button button-primary"><?= esc_html__('Save', 'baselayer') ?></button>
				</div>
			</form>
		</div>
	</div>
	<script>
		(function() {
			var sidebar = document.getElementById('bl-media-folders-sidebar');
			var wrap = document.querySelector('#wpbody-content .wrap');
			if (!sidebar || !wrap || wrap.dataset.blMediaFoldersReady === '1') {
				return;
			}

			var blBranchCollapsedKey = 'baselayer_bl_media_folder_collapsed_branches';

			function blMediaFoldersReadCollapsedBranches() {
				try {
					if (!window.localStorage) {
						return [];
					}
					var raw = window.localStorage.getItem(blBranchCollapsedKey);
					if (!raw) {
						return [];
					}
					var parsed = JSON.parse(raw);
					if (!Array.isArray(parsed)) {
						return [];
					}
					return parsed.map(function(x) {
						return parseInt(x, 10);
					}).filter(function(n) {
						return !isNaN(n) && n > 0;
					});
				} catch (err) {
					return [];
				}
			}

			function blMediaFoldersWriteCollapsedBranches(ids) {
				try {
					if (window.localStorage) {
						window.localStorage.setItem(blBranchCollapsedKey, JSON.stringify(ids));
					}
				} catch (err) {}
			}

			function blMediaFoldersPersistBranchCollapse(termId, collapsed) {
				var ids = blMediaFoldersReadCollapsedBranches();
				var ix = ids.indexOf(termId);
				if (collapsed && ix === -1) {
					ids.push(termId);
				}
				if (!collapsed && ix !== -1) {
					ids.splice(ix, 1);
				}
				blMediaFoldersWriteCollapsedBranches(ids);
			}

			function blMediaFoldersApplyStoredBranchState(root) {
				if (!root) {
					return;
				}
				var collapsed = {};
				blMediaFoldersReadCollapsedBranches().forEach(function(id) {
					collapsed[id] = true;
				});
				var branches = root.querySelectorAll('.bl-media-folders-tree-item--branch[data-folder-term-id]');
				var i;
				for (i = 0; i < branches.length; i++) {
					var li = branches[i];
					var tid = parseInt(li.getAttribute('data-folder-term-id') || '0', 10);
					if (isNaN(tid) || tid < 1) {
						continue;
					}
					var btn = li.querySelector('.bl-media-folders-folder-toggle');
					if (collapsed[tid]) {
						li.classList.remove('is-expanded');
						if (btn) {
							btn.setAttribute('aria-expanded', 'false');
						}
					} else {
						li.classList.add('is-expanded');
						if (btn) {
							btn.setAttribute('aria-expanded', 'true');
						}
					}
				}
			}

			var heading = wrap.querySelector('h1.wp-heading-inline');
			var addButton = wrap.querySelector('.page-title-action');
			var headerEnd = wrap.querySelector('hr.wp-header-end');

			var layout = document.createElement('div');
			layout.className = 'bl-media-folders-layout';
			var content = document.createElement('div');
			content.className = 'bl-media-folders-content';

			layout.appendChild(sidebar);
			layout.appendChild(content);
			if (headerEnd && headerEnd.nextSibling) {
				wrap.insertBefore(layout, headerEnd.nextSibling);
			} else {
				wrap.appendChild(layout);
			}

			Array.prototype.slice.call(wrap.children).forEach(function(node) {
				if (node === heading || node === addButton || node === headerEnd || node === layout) {
					return;
				}
				content.appendChild(node);
			});

			sidebar.style.display = '';
			blMediaFoldersApplyStoredBranchState(sidebar);
			wrap.dataset.blMediaFoldersReady = '1';

			function blMediaFoldersGetUploadFolderId() {
				try {
					var fromUrl = parseInt(new URLSearchParams(window.location.search).get('bl_media_folder_id') || '0', 10);
					if (!isNaN(fromUrl) && fromUrl > 0) {
						return fromUrl;
					}
				} catch (errUrl) {}
				var activeLink = sidebar.querySelector('.bl-media-folders-item.bl-media-folders-link.is-active a.bl-media-folder-row');
				if (activeLink && activeLink.href) {
					try {
						var u = new URL(activeLink.href, window.location.origin);
						var fromActive = parseInt(u.searchParams.get('bl_media_folder_id') || '0', 10);
						if (!isNaN(fromActive) && fromActive > 0) {
							return fromActive;
						}
					} catch (errActive) {}
				}
				return 0;
			}

			function blMediaFoldersPatchUploadParams() {
				var folderId = blMediaFoldersGetUploadFolderId();
				if (folderId < 1) {
					return;
				}
				if (window.wp && wp.Uploader && wp.Uploader.defaults) {
					wp.Uploader.defaults.multipart_params = wp.Uploader.defaults.multipart_params || {};
					wp.Uploader.defaults.multipart_params.bl_media_folder_id = folderId;
				}
				if (window.plupload && plupload.defaultSettings) {
					plupload.defaultSettings.multipart_params = plupload.defaultSettings.multipart_params || {};
					plupload.defaultSettings.multipart_params.bl_media_folder_id = folderId;
				}
			}

			function blMediaFoldersEnsureGridUploadPreview(frame) {
				if (!frame || typeof frame.state !== 'function' || typeof window.blMediaFoldersObserveUploaderQueue !== 'function') {
					return;
				}
				var state = frame.state();
				if (!state || typeof state.get !== 'function') {
					return;
				}
				var library = state.get('library');
				if (!library || !library.props || typeof window.blMediaFoldersQueryUsesFolderFilter !== 'function') {
					return;
				}
				if (!window.blMediaFoldersQueryUsesFolderFilter(library.props)) {
					return;
				}
				window.blMediaFoldersObserveUploaderQueue(library);
			}

			blMediaFoldersPatchUploadParams();
			if (window.jQuery) {
				window.jQuery(document).on('uploader:ready', blMediaFoldersPatchUploadParams);
				window.jQuery(wrap).on('wp-media-grid-ready', function(e, frame) {
					blMediaFoldersPatchUploadParams();
					blMediaFoldersEnsureGridUploadPreview(frame);
				});
			}
			setTimeout(blMediaFoldersPatchUploadParams, 0);
			setTimeout(blMediaFoldersPatchUploadParams, 500);

			function blMediaFoldersOnUploadSuccess(attachmentData) {
				if (!attachmentData || !attachmentData.id) {
					return;
				}
				var folderId = blMediaFoldersGetUploadFolderId();
				if (folderId < 1 || !window.wp || !wp.media) {
					return;
				}
				attachmentData.bl_media_folder_id = folderId;
				var attachment = wp.media.attachment(attachmentData.id);
				if (attachmentData && typeof attachment.set === 'function') {
					attachment.set(attachmentData);
					attachment.set('bl_media_folder_id', folderId);
				}
				if (wp.media.frame && wp.media.frame.library && typeof wp.media.frame.library.add === 'function') {
					wp.media.frame.library.add(attachment);
				}
			}

			if (window.jQuery) {
				window.jQuery(document).on('uploadsuccess', function(e, attachmentData) {
					blMediaFoldersOnUploadSuccess(attachmentData);
				});
			}

			var toggleButton = document.createElement('button');
			toggleButton.type = 'button';
			toggleButton.className = 'button bl-media-folders-toggle is-active';
			toggleButton.setAttribute('data-bl-toggle-context', 'upload');
			toggleButton.setAttribute('aria-pressed', 'true');
			toggleButton.setAttribute('title', '<?= esc_js(__('Hide folders panel', 'baselayer')) ?>');
			toggleButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h207q16 0 30.5 6t25.5 17l57 57h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Z"/></svg>';

			/*
			 * List view outputs .view-switch in the initial HTML. Grid (#wp-media-grid) does not:
			 * media-grid.js injects it later, so we always need a fallback anchor.
			 */
			function placeUploadFoldersToggleNextToViewSwitch() {
				var vs = wrap.querySelector('.view-switch');
				if (!vs || !vs.parentNode) {
					return false;
				}
				if (toggleButton.nextSibling === vs) {
					return true;
				}
				vs.parentNode.insertBefore(toggleButton, vs);
				return true;
			}
			if (!placeUploadFoldersToggleNextToViewSwitch()) {
				if (headerEnd && headerEnd.parentNode) {
					headerEnd.parentNode.insertBefore(toggleButton, headerEnd);
				} else if (addButton && addButton.parentNode) {
					addButton.parentNode.insertBefore(toggleButton, addButton.nextSibling);
				} else {
					wrap.insertBefore(toggleButton, layout);
				}
			}

			function retryPlaceToggleNearViewSwitch() {
				placeUploadFoldersToggleNextToViewSwitch();
			}
			retryPlaceToggleNearViewSwitch();
			setTimeout(retryPlaceToggleNearViewSwitch, 0);
			setTimeout(retryPlaceToggleNearViewSwitch, 200);
			setTimeout(retryPlaceToggleNearViewSwitch, 800);
			if (window.jQuery) {
				window.jQuery(wrap).on('wp-media-grid-ready', retryPlaceToggleNearViewSwitch);
			}
			if (typeof MutationObserver !== 'undefined') {
				var togglePlaceObserver = new MutationObserver(function() {
					if (placeUploadFoldersToggleNextToViewSwitch()) {
						togglePlaceObserver.disconnect();
					}
				});
				togglePlaceObserver.observe(wrap, {
					childList: true,
					subtree: true
				});
				setTimeout(function() {
					togglePlaceObserver.disconnect();
				}, 15000);
			}
			if (window.blMediaFolderPanel && typeof window.blMediaFolderPanel.applyFromStorage === 'function') {
				var _blOrigApplyFromStorage = window.blMediaFolderPanel.applyFromStorage;
				window.blMediaFolderPanel.applyFromStorage = function() {
					_blOrigApplyFromStorage.call(window.blMediaFolderPanel);
					blMediaFoldersApplyStoredBranchState(sidebar);
				};
				window.blMediaFolderPanel.applyFromStorage();
			}

			/*
			 * Grid view: media-grid.js appends .media-frame as a direct child of #wp-media-grid.
			 * After we insert the flex layout, that frame would sit below the row and cover full width.
			 * Move it into .bl-media-folders-content so folders stay beside the library when selecting items.
			 */
			function blMoveMediaFrameIntoFolderContent() {
				var gridRoot = document.getElementById('wp-media-grid');
				if (!gridRoot) {
					return;
				}
				var contentCol = gridRoot.querySelector('.bl-media-folders-content');
				var frame = null;
				for (var fi = 0; fi < gridRoot.children.length; fi++) {
					var ch = gridRoot.children[fi];
					if (ch.nodeType === 1 && ch.classList && ch.classList.contains('media-frame')) {
						frame = ch;
						break;
					}
				}
				if (!contentCol || !frame || frame.parentNode === contentCol) {
					return;
				}
				contentCol.insertBefore(frame, contentCol.firstChild);
			}
			if (wrap.id === 'wp-media-grid') {
				blMoveMediaFrameIntoFolderContent();
				if (window.jQuery) {
					var $wrap = window.jQuery(wrap);
					$wrap.on('wp-media-grid-ready', blMoveMediaFrameIntoFolderContent);
					window.jQuery(blMoveMediaFrameIntoFolderContent);
				}
				var gridObserver = new MutationObserver(blMoveMediaFrameIntoFolderContent);
				gridObserver.observe(wrap, {
					childList: true
				});
				setTimeout(blMoveMediaFrameIntoFolderContent, 0);
				setTimeout(blMoveMediaFrameIntoFolderContent, 200);
			}

			var modal = document.getElementById('bl-media-folder-delete-modal');
			var modalText = document.getElementById('bl-media-folder-delete-text');
			var modalConfirm = document.getElementById('bl-media-folder-delete-confirm');
			var assignModal = document.getElementById('bl-media-folder-assign-modal');
			var assignFolderSelect = document.getElementById('bl_media_assign_folder_id');
			var assignSaveBtn = document.getElementById('bl-media-folder-assign-save');
			var assignAttachmentId = 0;
			var assignTriggerLink = null;
			var createModal = document.getElementById('bl-media-folder-create-modal');
			var createOpenBtn = document.getElementById('bl-media-folders-add-open');
			var deleteToggleBtn = document.getElementById('bl-media-folders-delete-toggle');
			var editToggleBtn = document.getElementById('bl-media-folders-edit-toggle');
			var renameModal = document.getElementById('bl-media-folder-rename-modal');
			var renameTermInput = document.getElementById('bl_media_folder_rename_term_id');
			var renameNameInput = document.getElementById('bl_media_folder_rename_name');
			var folderNameInput = document.getElementById('bl_media_folder_name');
			var deleteToggleLabels = {
				show: <?= wp_json_encode(__('Show folder delete buttons', 'baselayer'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>,
				hide: <?= wp_json_encode(__('Hide folder delete buttons', 'baselayer'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>
			};
			var editToggleLabels = {
				show: <?= wp_json_encode(__('Show folder rename buttons', 'baselayer'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>,
				hide: <?= wp_json_encode(__('Hide folder rename buttons', 'baselayer'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>
			};
			var renameTriggerBtn = null;

			function closeModal() {
				if (!modal || !modalConfirm) {
					return;
				}
				modal.classList.remove('is-open');
				modal.setAttribute('aria-hidden', 'true');
				modalConfirm.setAttribute('href', '#');
			}

			function closeRenameModal() {
				if (!renameModal) {
					return;
				}
				var wasOpen = renameModal.classList.contains('is-open');
				renameModal.classList.remove('is-open');
				renameModal.setAttribute('aria-hidden', 'true');
				if (renameTermInput) {
					renameTermInput.value = '';
				}
				if (renameNameInput) {
					renameNameInput.value = '';
				}
				if (wasOpen && renameTriggerBtn && typeof renameTriggerBtn.focus === 'function') {
					renameTriggerBtn.focus();
				}
				renameTriggerBtn = null;
			}

			function openRenameModal(editBtn) {
				if (!renameModal || !renameTermInput || !renameNameInput || !editBtn) {
					return;
				}
				closeModal();
				closeAssignModal();
				closeCreateModal();
				renameTriggerBtn = editBtn;
				var tid = editBtn.getAttribute('data-term-id') || '';
				var fname = editBtn.getAttribute('data-folder-name') || '';
				renameTermInput.value = tid;
				renameNameInput.value = fname;
				renameModal.classList.add('is-open');
				renameModal.setAttribute('aria-hidden', 'false');
				renameNameInput.focus();
				renameNameInput.select();
			}

			function openModal(name, count, deleteUrl) {
				if (!modal || !modalText || !modalConfirm) {
					return;
				}
				closeRenameModal();
				closeAssignModal();
				closeCreateModal();
				var countText = '';
				countText += <?= wp_json_encode(__('Delete folder "%s"?', 'baselayer'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>.replace('%s', name);
				countText += ' ';
				countText += parseInt(count, 10) > 0 ?
					<?= wp_json_encode(__('This will also remove folder assignments from the contained files.', 'baselayer'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?> :
					<?= wp_json_encode(__('The folder is empty.', 'baselayer'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
				modalText.textContent = countText;
				modalConfirm.setAttribute('href', deleteUrl);
				modal.classList.add('is-open');
				modal.setAttribute('aria-hidden', 'false');
			}

			function closeCreateModal() {
				if (!createModal) {
					return;
				}
				var wasOpen = createModal.classList.contains('is-open');
				createModal.classList.remove('is-open');
				createModal.setAttribute('aria-hidden', 'true');
				if (createOpenBtn) {
					createOpenBtn.setAttribute('aria-expanded', 'false');
					if (wasOpen) {
						createOpenBtn.focus();
					}
				}
			}

			function openCreateModal() {
				if (!createModal || !createOpenBtn) {
					return;
				}
				closeModal();
				closeRenameModal();
				closeAssignModal();
				createModal.classList.add('is-open');
				createModal.setAttribute('aria-hidden', 'false');
				createOpenBtn.setAttribute('aria-expanded', 'true');
				if (folderNameInput) {
					folderNameInput.value = '';
					folderNameInput.focus();
				}
				var parentSel = document.getElementById('bl_media_folder_parent');
				if (parentSel) {
					parentSel.value = '0';
				}
			}

			function closeAssignModal() {
				if (!assignModal) {
					return;
				}
				var wasOpen = assignModal.classList.contains('is-open');
				assignModal.classList.remove('is-open');
				assignModal.setAttribute('aria-hidden', 'true');
				assignAttachmentId = 0;
				if (wasOpen && assignTriggerLink && typeof assignTriggerLink.focus === 'function') {
					assignTriggerLink.focus();
				}
				assignTriggerLink = null;
			}

			function openAssignModal(linkEl) {
				if (!assignModal || !assignFolderSelect || !linkEl) {
					return;
				}
				closeModal();
				closeRenameModal();
				closeCreateModal();
				assignTriggerLink = linkEl;
				assignAttachmentId = parseInt(linkEl.getAttribute('data-attachment-id') || '0', 10) || 0;
				var cur = parseInt(linkEl.getAttribute('data-current-folder') || '0', 10) || 0;
				assignFolderSelect.value = String(cur);
				assignModal.classList.add('is-open');
				assignModal.setAttribute('aria-hidden', 'false');
				assignFolderSelect.focus();
			}

			sidebar.addEventListener('click', function(e) {
				var folderToggle = e.target.closest('.bl-media-folders-folder-toggle:not(.bl-media-folders-folder-toggle--leaf)');
				if (folderToggle) {
					e.preventDefault();
					e.stopPropagation();
					var treeItem = folderToggle.closest('.bl-media-folders-tree-item');
					if (!treeItem || !treeItem.classList.contains('bl-media-folders-tree-item--branch')) {
						return;
					}
					var expanded = treeItem.classList.toggle('is-expanded');
					folderToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
					var tid = parseInt(treeItem.getAttribute('data-folder-term-id') || '0', 10);
					if (!isNaN(tid) && tid > 0) {
						blMediaFoldersPersistBranchCollapse(tid, !expanded);
					}
					return;
				}
				var allNav = e.target.closest('button.bl-media-folders-link--all[data-bl-all-url]');
				if (allNav) {
					e.preventDefault();
					var allUrl = allNav.getAttribute('data-bl-all-url');
					if (allUrl) {
						window.location.href = allUrl;
					}
					return;
				}
				var editBtn = e.target.closest('.bl-media-folder-edit-btn');
				if (editBtn) {
					e.preventDefault();
					openRenameModal(editBtn);
					return;
				}
				var btn = e.target.closest('.bl-media-folder-delete-btn');
				if (!btn) {
					return;
				}
				e.preventDefault();
				openModal(
					btn.getAttribute('data-folder-name') || '',
					btn.getAttribute('data-folder-count') || '0',
					btn.getAttribute('data-delete-url') || '#'
				);
			});
			if (modal) {
				modal.addEventListener('click', function(e) {
					if (e.target && e.target.hasAttribute('data-modal-close')) {
						closeModal();
					}
				});
			}
			if (createModal) {
				createModal.addEventListener('click', function(e) {
					if (e.target && e.target.hasAttribute('data-modal-close')) {
						closeCreateModal();
					}
				});
			}
			if (renameModal) {
				renameModal.addEventListener('click', function(e) {
					if (e.target && e.target.hasAttribute('data-modal-close')) {
						closeRenameModal();
					}
				});
			}
			if (createOpenBtn) {
				createOpenBtn.addEventListener('click', function() {
					openCreateModal();
				});
			}

			function blSetFolderDeleteMode(on) {
				if (!sidebar || !deleteToggleBtn) {
					return;
				}
				sidebar.classList.toggle('is-delete-mode', !!on);
				deleteToggleBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
				var dlabel = on ? deleteToggleLabels.hide : deleteToggleLabels.show;
				deleteToggleBtn.setAttribute('aria-label', dlabel);
				deleteToggleBtn.setAttribute('title', dlabel);
			}

			function blSetFolderEditMode(on) {
				if (!sidebar || !editToggleBtn) {
					return;
				}
				sidebar.classList.toggle('is-edit-mode', !!on);
				editToggleBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
				var elabel = on ? editToggleLabels.hide : editToggleLabels.show;
				editToggleBtn.setAttribute('aria-label', elabel);
				editToggleBtn.setAttribute('title', elabel);
			}

			if (deleteToggleBtn && sidebar) {
				deleteToggleBtn.addEventListener('click', function() {
					var wasOn = sidebar.classList.contains('is-delete-mode');
					if (wasOn) {
						blSetFolderDeleteMode(false);
					} else {
						blSetFolderEditMode(false);
						blSetFolderDeleteMode(true);
					}
				});
			}
			if (editToggleBtn && sidebar) {
				editToggleBtn.addEventListener('click', function() {
					var wasOn = sidebar.classList.contains('is-edit-mode');
					if (wasOn) {
						blSetFolderEditMode(false);
					} else {
						blSetFolderDeleteMode(false);
						blSetFolderEditMode(true);
					}
				});
			}
			document.addEventListener('click', function(e) {
				var folderLink = e.target && e.target.closest && e.target.closest('a.bl-media-assign-folder-link');
				if (!folderLink) {
					return;
				}
				e.preventDefault();
				openAssignModal(folderLink);
			});
			if (assignModal) {
				assignModal.addEventListener('click', function(e) {
					if (e.target && e.target.hasAttribute('data-modal-close')) {
						closeAssignModal();
					}
				});
			}
			if (assignSaveBtn && assignModal) {
				assignSaveBtn.addEventListener('click', function() {
					if (!assignFolderSelect || assignAttachmentId <= 0) {
						return;
					}
					var nonce = assignModal.getAttribute('data-bl-assign-nonce') || '';
					var ajaxUrl = assignModal.getAttribute('data-bl-ajax-url') || (typeof ajaxurl !== 'undefined' ? ajaxurl : '');
					if (!ajaxUrl || !nonce) {
						return;
					}
					var folderVal = assignFolderSelect.value || '0';
					assignSaveBtn.disabled = true;
					var params = new URLSearchParams();
					params.set('action', 'bl_media_folder_assign');
					params.set('nonce', nonce);
					params.set('attachment_id', String(assignAttachmentId));
					params.set('folder_id', folderVal);
					fetch(ajaxUrl, {
						method: 'POST',
						credentials: 'same-origin',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
						},
						body: params.toString()
					}).then(function(r) {
						return r.json();
					}).then(function(payload) {
						assignSaveBtn.disabled = false;

						function showNotice(t, m) {
							if (typeof window.blAdminNoticeShow === 'function' && m) {
								window.blAdminNoticeShow(t, m);
							}
						}
						if (payload && payload.success) {
							var newId = payload.data && typeof payload.data.folder_id !== 'undefined' ? parseInt(payload.data.folder_id, 10) || 0 : parseInt(folderVal, 10) || 0;
							if (assignTriggerLink) {
								assignTriggerLink.setAttribute('data-current-folder', String(newId));
							}
							var okMsg = (payload.data && payload.data.message) ? String(payload.data.message) : <?= wp_json_encode(__('Folder assignment saved.', 'baselayer'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
							showNotice('success', okMsg);
							closeAssignModal();
						} else {
							var errMsg = <?= wp_json_encode(__('Could not update folder.', 'baselayer'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
							if (payload && payload.data) {
								if (typeof payload.data.message === 'string' && payload.data.message) {
									errMsg = payload.data.message;
								} else if (payload.data[0] && typeof payload.data[0] === 'string') {
									errMsg = payload.data[0];
								}
							}
							showNotice('error', errMsg);
						}
					}).catch(function() {
						assignSaveBtn.disabled = false;
						var fail = <?= wp_json_encode(__('Could not complete the request. Try again.', 'baselayer'), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;
						if (typeof window.blAdminNoticeShow === 'function') {
							window.blAdminNoticeShow('error', fail);
						}
					});
				});
			}
			document.addEventListener('keydown', function(e) {
				if (e.key !== 'Escape') {
					return;
				}
				if (assignModal && assignModal.classList.contains('is-open')) {
					closeAssignModal();
				} else if (createModal && createModal.classList.contains('is-open')) {
					closeCreateModal();
				} else if (modal && modal.classList.contains('is-open')) {
					closeModal();
				}
			});
		})();
	</script>
<?php
});
