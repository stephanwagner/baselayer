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
     * Option: id, className (on <li>), linkClassNames (on <a>), label, default.
     * Child themes can override linkClassNames (e.g. 'button -secondary').
     */
    'menus' => [
        [
            'id' => 'main_menu',
            'title' => 'Main menu',
            'options' => [
                [
                    'id' => 'highlight',
                    'className' => '-highlight',
                    'linkClassNames' => 'button',
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

    /**
     * Events — override parent defaults as needed.
     * recurrence_lookahead: how far ahead to create occurrence posts (e.g. '1 year', '6 months').
     */
    // 'events' => [
    //     'recurrence_lookahead' => '1 year',
    // ],
];
