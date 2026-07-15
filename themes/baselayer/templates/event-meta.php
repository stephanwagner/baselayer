<?php

defined('ABSPATH') || exit;

/**
 * Event metadata groups + iCal download for singular event templates.
 *
 * @var int|null $post_id
 */

$post_id = isset($post_id) ? (int) $post_id : (int) get_the_ID();
if ($post_id <= 0 || !function_exists('bl_cpt_event_meta_config')) {
	return;
}

$post_type = get_post_type($post_id);
$config = bl_cpt_event_meta_config($post_type);
$values = function_exists('bl_event_get_metadata') ? bl_event_get_metadata($post_id) : [];
$can_ical = function_exists('bl_event_can_download_ical') && bl_event_can_download_ical($post_id);

$groups_out = [];
if ($config['groups'] !== []) {
	foreach ($config['groups'] as $group_id => $group) {
		$row = isset($values[$group_id]) ? $values[$group_id] : [];
		$fields = [];
		foreach ($group['fields'] as $field_id => $field) {
			$value = isset($row[$field_id]) ? trim((string) $row[$field_id]) : '';
			if ($value === '') {
				continue;
			}
			$fields[] = [
				'id' => $field_id,
				'label' => $field['label'],
				'type' => $field['type'],
				'value' => $value,
			];
		}
		if ($fields === []) {
			continue;
		}
		$groups_out[] = [
			'id' => $group_id,
			'title' => $group['title'],
			'fields' => $fields,
		];
	}
}

if ($groups_out === [] && !$can_ical) {
	return;
}

$aria = $config['title'] !== '' ? $config['title'] : __('Event metadata', 'baselayer');
?>
<aside class="event-meta" aria-label="<?= esc_attr($aria) ?>">
	<?php foreach ($groups_out as $group) { ?>
		<section class="event-meta__group event-meta__group--<?= esc_attr($group['id']) ?>">
			<h2 class="event-meta__title"><?= esc_html($group['title']) ?></h2>
			<dl class="event-meta__list">
				<?php foreach ($group['fields'] as $field) { ?>
					<div class="event-meta__row event-meta__row--<?= esc_attr($field['id']) ?>">
						<dt class="event-meta__label"><?= esc_html($field['label']) ?></dt>
						<dd class="event-meta__value">
							<?php
							if ($field['type'] === 'email') {
								echo '<a href="' . esc_url('mailto:' . $field['value']) . '">' . esc_html($field['value']) . '</a>';
							} elseif ($field['type'] === 'url') {
								echo '<a href="' . esc_url($field['value']) . '" rel="noopener noreferrer">' . esc_html($field['value']) . '</a>';
							} elseif ($field['type'] === 'textarea') {
								echo nl2br(esc_html($field['value']));
							} else {
								echo esc_html($field['value']);
							}
							?>
						</dd>
					</div>
				<?php } ?>
			</dl>
		</section>
	<?php } ?>

	<?php if ($can_ical) { ?>
		<p class="event-meta__ical">
			<a class="event-meta__ical-link button -secondary -outline -has-icon -icon-calendar" href="<?= esc_url(bl_event_ical_url($post_id)) ?>">
				<?= esc_html__('Download iCal', 'baselayer') ?>
			</a>
		</p>
	<?php } ?>
</aside>
