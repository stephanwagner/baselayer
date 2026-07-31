import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { themeDir } = require('./config.cjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const formsPkg = 'themes/baselayer/packages/baselayer-forms';
const eventsPkg = 'themes/baselayer/packages/baselayer-events';
const editorialPkg = 'themes/baselayer/packages/baselayer-editorial';
const blocksPkg = 'themes/baselayer/packages/baselayer-blocks';
const sassBin = path.join(root, 'node_modules/.bin/sass');
const chokidarBin = path.join(root, 'node_modules/.bin/chokidar');
const sassLoadPathArgs = ['--load-path', path.join(root, 'node_modules')];

const entries = [
  { src: `${themeDir}/src/scss/main.scss`, name: 'baselayer', outDir: `${themeDir}/assets/css` },
  { src: `${themeDir}/src/scss/admin.scss`, name: 'admin', outDir: `${themeDir}/assets/css` },
  { src: `${themeDir}/src/scss/admin-bar.scss`, name: 'admin-bar', outDir: `${themeDir}/assets/css` },
  {
    src: `${themeDir}/src/scss/field-builder-admin.scss`,
    name: 'field-builder-admin',
    outDir: `${themeDir}/assets/css`
  },
  {
    src: `${themeDir}/src/scss/canvas-builder-admin.scss`,
    name: 'canvas-builder-admin',
    outDir: `${themeDir}/assets/css`
  },
  { src: `${formsPkg}/src/scss/forms.scss`, name: 'forms', outDir: `${formsPkg}/assets/css` },
  { src: `${formsPkg}/src/scss/forms-admin.scss`, name: 'forms-admin', outDir: `${formsPkg}/assets/css` },
  { src: `${eventsPkg}/src/scss/events.scss`, name: 'events', outDir: `${eventsPkg}/assets/css` },
  { src: `${eventsPkg}/src/scss/events-admin.scss`, name: 'events-admin', outDir: `${eventsPkg}/assets/css` },
  { src: `${editorialPkg}/src/scss/editorial-admin.scss`, name: 'editorial-admin', outDir: `${editorialPkg}/assets/css` },
  { src: `${editorialPkg}/src/scss/editorial-editor.scss`, name: 'editorial-editor', outDir: `${editorialPkg}/assets/css` }
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

/**
 * Snapshot theme field-builder CSS into Events package for standalone plugin use.
 */
async function vendorFieldBuilderCss() {
  const fs = await import('node:fs/promises');
  const vendorDir = path.join(eventsPkg, 'assets/vendor/field-builder');
  await fs.mkdir(vendorDir, { recursive: true });
  for (const name of ['field-builder-admin.css', 'field-builder-admin.min.css']) {
    const src = path.join(themeDir, 'assets/css', name);
    try {
      await fs.copyFile(src, path.join(vendorDir, name));
      console.log(`Vendored ${name} → ${eventsPkg}/assets/vendor/field-builder/`);
    } catch {
      // ignore missing
    }
  }
}

/**
 * Snapshot canvas-builder CSS into Forms + Blocks vendor folders.
 */
async function vendorCanvasBuilderCss() {
  const fs = await import('node:fs/promises');
  const targets = [
    path.join(formsPkg, 'assets/vendor/canvas-builder'),
    path.join(blocksPkg, 'assets/vendor/canvas-builder'),
  ];
  for (const vendorDir of targets) {
    await fs.mkdir(vendorDir, { recursive: true });
    for (const name of ['canvas-builder-admin.css', 'canvas-builder-admin.min.css']) {
      const src = path.join(themeDir, 'assets/css', name);
      try {
        await fs.copyFile(src, path.join(vendorDir, name));
        console.log(`Vendored ${name} → ${vendorDir}/`);
      } catch {
        // ignore missing
      }
    }
  }
  await fs.rm(path.join(formsPkg, 'assets/vendor/builder'), { recursive: true, force: true });
}

const watchMode = process.argv.includes('--watch');

if (watchMode) {
  watch();
} else {
  await buildAll();
  const filter = parseFilter();
  if (!filter || filter.has('field-builder-admin')) {
    await vendorFieldBuilderCss();
  }
  if (!filter || filter.has('canvas-builder-admin') || filter.has('forms-admin')) {
    await vendorCanvasBuilderCss();
  }
}
