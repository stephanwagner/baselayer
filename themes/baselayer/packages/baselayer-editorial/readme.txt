=== BaseLayer Editorial ===
Contributors: baselayer
Tags: editorial, editors, capabilities, approval, media
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 8.0
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Per-editor content access, publishing approval, page allowlists, and media restrictions.

== Description ==

BaseLayer Editorial lets administrators configure what each Editor can access:

* Content types (posts, pages, and public CPTs)
* Own posts only
* Publish directly or require approval (native pending + email)
* All pages or a selected allowlist
* Media library limited to own uploads

Site-wide defaults and approval email recipients live under Settings → Editorial. Per-user overrides are on the user profile.

== Installation ==

1. Upload the `baselayer-editorial` folder to `/wp-content/plugins/`
2. Activate the plugin through the Plugins screen
3. Configure Settings → Editorial
4. Edit an editor’s profile to customize rights

== Translations ==

Text domain: `baselayer-editorial` (files in `languages/`).

From the BaseLayer repo root:

* `npm run make-pot:baselayer-editorial` — refresh the pot
* `npm run compile:po` — replicate German variants from `baselayer-editorial-de_DE.po` and compile `.mo` files (theme + Forms + Events + Editorial)

== Changelog ==

= 0.1.0 =
* Initial release.
