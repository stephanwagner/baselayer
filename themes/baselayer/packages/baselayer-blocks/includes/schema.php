<?php

defined('ABSPATH') || exit;

const BL_BLOCKS_DB_VERSION = '1';
const BL_BLOCKS_DB_VERSION_OPTION = 'bl_blocks_db_version';

/**
 * Prefixed table name for block definitions.
 */
function bl_blocks_table_name(): string
{
	global $wpdb;

	return $wpdb->prefix . 'bl_blocks';
}

/**
 * Create or upgrade the bl_blocks table.
 */
function bl_blocks_install_schema(): void
{
	global $wpdb;

	$table = bl_blocks_table_name();
	$charset = $wpdb->get_charset_collate();

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';

	$sql = "CREATE TABLE {$table} (
		id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
		slug varchar(191) NOT NULL,
		title varchar(255) NOT NULL DEFAULT '',
		status varchar(20) NOT NULL DEFAULT 'draft',
		definition longtext NOT NULL,
		created_at datetime NOT NULL,
		updated_at datetime NOT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY slug (slug),
		KEY status (status)
	) {$charset};";

	dbDelta($sql);
	update_option(BL_BLOCKS_DB_VERSION_OPTION, BL_BLOCKS_DB_VERSION, false);
}

/**
 * Run schema install when the stored version is missing or outdated.
 */
function bl_blocks_maybe_install_schema(): void
{
	$installed = (string) get_option(BL_BLOCKS_DB_VERSION_OPTION, '');
	if ($installed === BL_BLOCKS_DB_VERSION) {
		return;
	}
	bl_blocks_install_schema();
}
add_action('init', 'bl_blocks_maybe_install_schema', 5);
