=== BaseLayer Blocks ===
Contributors: baselayer
Tags: blocks, gutenberg, custom blocks, block builder, page settings, site settings
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 8.0
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Create Blocks, Page Settings, and Site Settings with a shared field builder.

== Description ==

BaseLayer Blocks provides three definition types under one admin menu:

* **Blocks** — custom Gutenberg blocks edited via a modal field UI
* **Page Settings** — document sidebar panels (button → modal) assigned to post types
* **Site Settings** — Website admin page with left tabs (ACF Options–style)

Definitions use a Fields + Settings editor (same canvas model as Forms). Values are stored as block attributes, post meta, or options respectively.

== Conflict with Block Creator ==

The theme’s **Block Creator** feature also registers an admin menu with the `bl-blocks` slug. Do not enable both at once. If both are on, the Blocks package skips its menu and shows an admin warning.

== Installation ==

1. Enable the Blocks package under Developer → Features (or activate as a plugin)
2. Open **Blocks** in the admin menu
3. Create definitions under Blocks, Page Settings, or Site Settings
4. Use **Website** for site-wide fields from Site Settings definitions

== Changelog ==

= 0.1.0 =
* CPT definitions, Fields/Settings editor, Website page, page settings panels, dynamic Gutenberg blocks
