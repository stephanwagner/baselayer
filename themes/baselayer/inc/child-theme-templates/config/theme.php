<?php

/**
 * Theme configuration overrides.
 *
 * Parent defaults:
 *   baselayer/config/theme.php
 *
 * Only specify the settings you want to override.
 */

return [
    /**
     * Menus
     * Registered navigation menus.
     *
     * Each menu: id, title, optional options (checkboxes on menu items).
     * Option: id, className (added to <li> when checked), label, default.
     */
    'menus' => [
        [
            'id' => 'main_menu',
            'title' => 'Main menu',
            'options' => [
                [
                    'id' => 'highlight',
                    'className' => '-highlight',
                    'label' => 'Highlight link',
                    'default' => false,
                ],
            ],
        ],
        [
            'id' => 'footer_menu',
            'title' => 'Footer menu',
        ],
    ],
];
