=== BaseLayer Blocks ===
Contributors: baselayer
Tags: blocks, gutenberg, custom blocks, block builder, content, website
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 8.0
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Create Blocks, Content fields, and Website definitions with a shared field builder.

== Description ==

BaseLayer Blocks provides three definition types under one admin menu:

* **Blocks** — custom Gutenberg blocks edited via a modal field UI
* **Content fields** — document sidebar panels (button → modal) assigned to post types
* **Website** — Website admin page with left tabs (ACF Options–style)

Definitions use a Fields + Settings editor (same canvas model as Forms). Values are stored as block attributes, post meta, or options respectively.

== Installation ==

1. Enable the Blocks package under Developer → Features (or activate as a plugin)
2. Open **Blocks** in the admin menu
3. Create definitions under Blocks, Content fields, or Website
4. Use the top-level **Website** menu for site-wide field values

== Changelog ==

= 0.1.0 =
* CPT definitions, Fields/Settings editor, Website page, Content fields panels, dynamic Gutenberg blocks
