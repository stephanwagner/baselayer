import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { themeDir } = require('./config.cjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const formsPkg = 'themes/baselayer/packages/baselayer-forms';
const sassBin = path.join(root, 'node_modules/.bin/sass');
const chokidarBin = path.join(root, 'node_modules/.bin/chokidar');
const sassLoadPathArgs = ['--load-path', path.join(root, 'node_modules')];

const entries = [
  { src: `${themeDir}/src/scss/main.scss`, name: 'baselayer', outDir: `${themeDir}/assets/css` },
  { src: `${themeDir}/src/scss/admin.scss`, name: 'admin', outDir: `${themeDir}/assets/css` },
  { src: `${themeDir}/src/scss/admin-bar.scss`, name: 'admin-bar', outDir: `${themeDir}/assets/css` },
  { src: `${formsPkg}/src/scss/forms.scss`, name: 'forms', outDir: `${formsPkg}/assets/css` },
  { src: `${formsPkg}/src/scss/forms-admin.scss`, name: 'forms-admin', outDir: `${formsPkg}/assets/css` }
];

function parseFilter() {
  const idx = process.argv.indexOf('--filter');
  if (idx === -1 || !process.argv[idx + 1]) {
    return null;
  }
  return new Set(
    process.argv[idx + 1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function selectedEntries() {
  const filter = parseFilter();
  if (!filter) {
    return entries;
  }
  return entries.filter((e) => filter.has(e.name));
}

function sassPairs(prod) {
  const suffix = prod ? '.min' : '';
  return selectedEntries().map(
    ({ src, name, outDir }) => `${src}:${outDir}/${name}${suffix}.css`
  );
}

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd: root, stdio: 'inherit' });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${path.basename(bin)} exited with code ${code}`));
    });
  });
}

function spawnWatch(bin, args) {
  const child = spawn(bin, args, { cwd: root, stdio: 'inherit' });
  child.on('close', (code) => process.exit(code ?? 1));
  return child;
}

async function build(prod) {
  const label = prod ? 'production' : 'development';
  const pairs = sassPairs(prod);
  if (!pairs.length) {
    console.log(`No CSS entries matched filter (${label}).`);
    return;
  }
  console.log(`Building CSS (${label})...`);

  if (prod) {
    await run(sassBin, [
      ...pairs,
      ...sassLoadPathArgs,
      '--style=compressed',
      '--no-source-map'
    ]);
    return;
  }

  await run(sassBin, [
    ...pairs,
    ...sassLoadPathArgs,
    '--style=expanded',
    '--source-map'
  ]);
}

async function buildAll() {
  await build(false);
  await build(true);
}

function watch() {
  console.log('Watching CSS...');
  const pairs = sassPairs(false);
  if (!pairs.length) {
    console.log('No CSS entries matched filter.');
    return;
  }

  const children = [
    spawnWatch(sassBin, [
      ...pairs,
      ...sassLoadPathArgs,
      '--watch',
      '--poll',
      '--source-map'
    ]),
    spawnWatch(chokidarBin, [
      `${themeDir}/acf/blocks/**/*.scss`,
      '-c',
      'node scripts/bump-scss-entries.cjs'
    ])
  ];

  const shutdown = () => {
    for (const child of children) {
      child.kill();
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

const watchMode = process.argv.includes('--watch');

if (watchMode) {
  watch();
} else {
  await buildAll();
}
