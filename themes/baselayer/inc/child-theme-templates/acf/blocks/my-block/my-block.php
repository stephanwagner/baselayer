<?php

// Class names
$classNames = ['bl-wp-block'];

// ID for specific styling
$classNames[] = $block['id'];

// Add class provided via class_field in WP backend
if (!empty($block['className'])) {
	$classNames[] = $block['className'];
}

// Add wrapper class
$classNames[] = 'my-block__wrapper';

// Fields
$myField = get_field('my_field');
?>

<div class="<?= implode(' ', $classNames) ?>">
	<h4>My block</h4>
	<p>You can add your own content here.</p>
	<?php if (is_admin()) { ?>
		<p>This text is only visible in the editor.</p>
	<?php } ?>
</div>
