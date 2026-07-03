<?php

// Class names
$classNames = ['fs-wp-block'];

// ID for specific styling
$classNames[] = $block['id'];

// Add class provided via class_field in WP Backend
if (!empty($block['className'])) {
    $classNames[] = $block['className'];
}

// Add wrapper class
$classNames[] = 'map-dsgvo__wrapper';

// Add margin class
$classNames[] = '-content-margin-xs';
?>

<?php if (is_admin()) { ?>
    <div class="admin-block-preview">
        <b>Anfahrts-Karte: DSGVO</b>
    </div>
<?php } else { ?>
    <div class="<?= implode(' ', $classNames) ?>" data-google-maps-dsgvo-container></div>
<?php } ?>