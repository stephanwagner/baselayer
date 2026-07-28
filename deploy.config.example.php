<?php
// Site root on the server
$site = '/var/www/vhosts/example.com/httpdocs';

return [
    /**
     * Server config
     */

    // The IP address of the server
    'server_ip'   => '',

    // The remote ssh user
    'remote_user' => '',

    // The repository URL
    'repository_url' => '',

    // The path to the PHP binary
    'php_path'    => '/opt/plesk/php/8.4/bin/php',

    /**
     * Themes
     *
     * Same for every environment. Each slug must exist under themes/
     * in the release and is symlinked into {wp_path}/wp-content/themes/{slug}.
     */

    'themes' => [
        'baselayer',
        // 'my-child',
    ],

    /**
     * Environments
     *
     * Layout per site root:
     *   {site}/wordpress        ← WordPress (Plesk docroot)
     *   {site}/deploy           ← Deployer releases
     *   {site}/deploy/shared/wp ← WP-CLI
     */

    'environments' => [
        'production' => [
            'deploy_path' => $site . '/production/deploy',
            'wp_path'     => $site . '/production/wordpress',
        ],
        'staging' => [
            'deploy_path' => $site . '/staging/deploy',
            'wp_path'     => $site . '/staging/wordpress',
        ],
    ],

    /**
     * WordPress config
     */

    // Where to save the WP CLI binary (shared under the production site)
    'wp_cli_path' => $site . '/shared/wp',

    /**
     * Release config
     */

    // The number of releases to keep
    'keep_releases' => 5,

    // The release name
    'release_name' => date('Y-m-d_H-i-s'),

    /**
     * Cache
     */

    // Nginx proxy cache
    'nginx_proxy_cache' => [
        'enabled' => false,
        'command' => 'sudo /usr/local/bin/purge-nginx-cache.sh 2>&1',
    ],
];
