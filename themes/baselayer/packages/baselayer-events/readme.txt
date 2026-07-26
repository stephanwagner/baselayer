=== BaseLayer Events ===
Contributors: baselayer
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 8.0
Stable tag: 0.1.0
License: GPLv2 or later

Event types with dates, recurrence, statuses, metadata, and archives. Supports multiple event CPTs.

== Description ==

BaseLayer Events lets you create one or more event-like post types (Events, Courses, Workshops, …) with:

* Start/end dates and optional times
* Recurring series with occurrence posts
* Statuses and custom metadata
* Archives and iCal download

Configure each type under its menu → **Settings** (developers only; for example **Events → Settings**).

When bundled with the BaseLayer theme, enable it under Developer → Features.

== Translations ==

Text domain: `baselayer-events` (files in `languages/`).

From the BaseLayer repo root:

* `npm run make-pot:baselayer-events` — refresh the pot
* `npm run compile:po` — replicate German variants from `baselayer-events-de_DE.po` and compile `.mo` files (theme + Forms + Events)
