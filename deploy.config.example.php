<?php
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
     * Deploy config
     * 
     * The root path to the folder where the repository is deployed to.
     */

    'environments' => [
        'production' => [
            'deploy_path' => '/var/www/vhosts/__HOST__/httpdocs/baselayer/production/theme',
        ],
        'staging' => [
            'deploy_path' => '/var/www/vhosts/__HOST__/httpdocs/baselayer/staging/theme',
        ],
    ],

    /**
     * WordPress config
     * 
     * You can use the {{deploy_path}} placeholder to reference the current deploy path.
     */

    // The WordPress theme folder name
    'theme_slug' => 'baselayer',

    // The WordPress theme path in current deploy release
    'theme_path' => '{{deploy_path}}/current/theme/baselayer',

    // The path to the root of the WordPress installation
    'wp_path' => '{{deploy_path}}/../wordpress',

    // Where to save the WP CLI binary
    'wp_cli_path' => '/var/www/vhosts/baselayer/httpdocs/baselayer/shared/wp',

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
