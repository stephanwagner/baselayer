<?php

namespace Deployer;

require 'recipe/common.php';

// Config

$configFile = __DIR__ . '/deploy.config.php';

if (!file_exists(__DIR__ . '/deploy.config.php')) {
	die('Missing deploy.config.php – copy deploy.config.example.php and adjust it.');
}

$config = require $configFile;

// Server config

set('git_ssh_command', 'ssh');

set('server_ip', $config['server_ip']);

set('remote_user', $config['remote_user']);

set('bin/php', $config['php_path']);

// WordPress config

set('wp_cli_path', $config['wp_cli_path']);

set('themes', $config['themes']);

// Release config

set('keep_releases', $config['keep_releases']);

set('release_name', $config['release_name']);

// Shared files and folders

add('shared_files', []);

add('shared_dirs', []);

// Writable folders

add('writable_dirs', []);

// Hosts

foreach ($config['environments'] as $environment => $envConfig) {
	host($environment)
		->set('stage', $environment)
		->set('hostname', $config['server_ip'])
		->set('repository', $config['repository_url'])
		->set('deploy_path', $envConfig['deploy_path'])
		->set('wp_path', $envConfig['wp_path'])
		->set('themes', $config['themes']);
}

// Task: Create deploy version file

task('deploy:version-file', function () {
	run('echo "' . md5(time()) . '" > {{release_path}}/.deploy-version');
})->desc('Create deploy version file');

// Task: Build assets

task('deploy:build-assets', function () {
	if (has('previous_release')) {
		run('
			if [ -d {{previous_release}}/node_modules ]; then
				cp -R {{previous_release}}/node_modules {{release_path}}/node_modules
			fi
		');
	}
	run('cd {{release_path}} && npm install && npm run build');
})->desc('Build assets');

// Task: Ensure WP CLI is installed

task('deploy:wp-cli', function () {
	if (!test('[ -f {{wp_cli_path}} ]')) {
		writeln('Installing WP-CLI...');
		
		run('mkdir -p $(dirname {{wp_cli_path}})');
		run('curl -sS https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar -o {{wp_cli_path}}');
		run('chmod +x {{wp_cli_path}}');
	}

	run('{{wp_cli_path}} cli update');
})->desc('Ensure WP CLI is installed');

// Task: Clear cache

task('deploy:clear-cache', function () use ($config) {
	// Clear WordPress cache
	if (test('{{wp_cli_path}} core is-installed --path={{wp_path}}')) {
		run('{{wp_cli_path}} cache flush --path={{wp_path}} || true');
	}

	// Clear Nginx site cache on production environment
	if (get('stage') === 'production' && isset($config['nginx_proxy_cache']['enabled']) && $config['nginx_proxy_cache']['enabled']) {
		run($config['nginx_proxy_cache']['command']);
	}
})->desc('Clear cache');

// Task: Link themes into WordPress

task('deploy:link-themes', function () {
	$themes = get('themes');

	if (!is_array($themes) || $themes === []) {
		throw new \Exception('No themes configured');
	}

	run('mkdir -p {{wp_path}}/wp-content/themes');

	foreach ($themes as $slug) {
		$slug = (string) $slug;

		if ($slug === '' || preg_match('/[^a-z0-9_-]/i', $slug)) {
			throw new \Exception('Invalid theme slug: ' . $slug);
		}

		if (!test("[ -d {{release_path}}/themes/{$slug} ]")) {
			throw new \Exception("Theme folder not found in release: themes/{$slug}");
		}

		run("ln -nfs {{release_path}}/themes/{$slug} {{wp_path}}/wp-content/themes/{$slug}");
	}
})->desc('Link themes into WordPress');

// Deploy tasks

task('deploy', [
	'deploy:prepare',
	'deploy:version-file',
	'deploy:build-assets',
	'deploy:publish',
]);

// Hooks

after('deploy:publish', 'deploy:link-themes');
after('deploy:publish', 'deploy:wp-cli');
after('deploy:publish', 'deploy:clear-cache');

after('deploy:failed', 'deploy:unlock');
