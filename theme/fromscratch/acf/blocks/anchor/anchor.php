<?php
// Fields
$id = get_field('id');
$offset = get_field('offset');
$offset = $offset || $offset === -1 ? $offset : 0;
?>

<?php if (is_admin()) { ?>
    <div class="admin-block-preview">
        <b>Anker:</b> <code>#<?= $id ?></code>
    </div>
<?php } else { ?>
    <div data-anchor-id="<?= $id ?>" data-anchor-offset="<?= $offset ?>"></div>
<?php } ?>
