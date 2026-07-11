<?php

// Class names
$classNames = ['fs-wp-block'];

// ID for specific styling
$classNames[] = $block['id'];

// Add class provided via class_field in WP backend
if (!empty($block['className'])) {
	$classNames[] = $block['className'];
}

// Add wrapper class
$classNames[] = 'my-block__wrapper';

// Fields
$myField = get_field('my-field');
?>

<?php if (is_admin()) { ?>
	<div class="admin-block-preview">
		<b>My Block</b>
	</div>
<?php } else { ?>
	<div class="<?= implode(' ', $classNames) ?>">
		<h2>This is my block</h2>
		<p>My Field: <?= esc_html((string) $myField) ?></p>
	</div>
<?php } ?>
