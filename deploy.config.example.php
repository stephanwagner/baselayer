<?php
$vhost    = '/var/www/vhosts/example.com';
$httpdocs = $vhost . '/httpdocs';

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
     * Same for staging and production. Each slug must exist under themes/
     * in the release and is symlinked into {wp_path}/wp-content/themes/{slug}.
     */

    'themes' => [
        'baselayer',
        // 'my-child',
    ],

    /**
     * Environments
     *
     * Layout (Plesk):
     *   {vhost}/httpdocs/{env}/wordpress  ← WordPress (docroot)
     *   {vhost}/deploy/{env}              ← Deployer releases (outside docroot)
     *   {vhost}/deploy/shared/wp          ← WP-CLI
     */

    'environments' => [
        'production' => [
            'deploy_path' => $vhost . '/deploy/production',
            'wp_path'     => $httpdocs . '/production/wordpress',
        ],
        'staging' => [
            'deploy_path' => $vhost . '/deploy/staging',
            'wp_path'     => $httpdocs . '/staging/wordpress',
        ],
    ],

    /**
     * WordPress config
     */

    // Where to save the WP CLI binary
    'wp_cli_path' => $vhost . '/deploy/shared/wp',

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
