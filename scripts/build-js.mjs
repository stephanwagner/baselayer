import { createRequire } from 'node:module';
import * as esbuild from 'esbuild';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { themeDir } = require('./config.cjs');

const formsPkg = 'themes/baselayer/packages/baselayer-forms';

const themeBundles = [
  { input: `${themeDir}/src/js/main/main.js`, name: 'baselayer', outDir: `${themeDir}/assets/js` },
  { input: `${themeDir}/src/js/admin/admin.js`, name: 'admin', outDir: `${themeDir}/assets/js` },
  {
    input: `${themeDir}/src/js/editor/editor.js`,
    name: 'editor',
    outDir: `${themeDir}/assets/js`,
    jsx: {
      loader: { '.js': 'jsx' },
      jsx: 'transform',
      jsxFactory: 'wp.element.createElement',
      jsxFragment: 'wp.element.Fragment'
    }
  },
  {
    input: `${themeDir}/src/js/admin/block-settings.js`,
    name: 'block-settings',
    outDir: `${themeDir}/assets/js`,
    jsx: {
      loader: { '.js': 'jsx' },
      jsx: 'transform',
      jsxFactory: 'wp.element.createElement',
      jsxFragment: 'wp.element.Fragment'
    }
  },
  {
    input: `${themeDir}/src/js/admin/field-builder/admin-pages.js`,
    name: 'field-builder-admin',
    outDir: `${themeDir}/assets/js`
  },
  {
    input: `${themeDir}/src/js/editor/creator-blocks.js`,
    name: 'creator-blocks',
    outDir: `${themeDir}/assets/js`
  },
  {
    input: `${themeDir}/src/js/service-worker/index.js`,
    name: 'service-worker',
    outDir: `${themeDir}/assets/js`
  }
];

const formsBundles = [
  { input: `${formsPkg}/src/js/front.js`, name: 'forms', outDir: `${formsPkg}/assets/js` },
  { input: `${formsPkg}/src/js/admin.js`, name: 'forms-admin', outDir: `${formsPkg}/assets/js` },
  { input: `${formsPkg}/src/js/block.js`, name: 'forms-block', outDir: `${formsPkg}/assets/js` }
];

const bundles = [...themeBundles, ...formsBundles];

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

function selectedBundles() {
  const filter = parseFilter();
  if (!filter) {
    return bundles;
  }
  return bundles.filter((b) => filter.has(b.name));
}

function bundleOptions(prod) {
  return selectedBundles().map(({ input, name, outDir, jsx }) => ({
    entryPoints: [input],
    outfile: path.join(outDir, `${name}${prod ? '.min' : ''}.js`),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    sourcemap: !prod,
    minify: prod,
    logLevel: 'info',
    ...jsx
  }));
}

async function build(prod) {
  const label = prod ? 'production' : 'development';
  const options = bundleOptions(prod);
  if (!options.length) {
    console.log(`No JavaScript bundles matched filter (${label}).`);
    return;
  }
  console.log(`Building JavaScript (${label})...`);
  await Promise.all(options.map((opt) => esbuild.build(opt)));
}

async function buildAll() {
  await build(false);
  await build(true);
}

async function watch() {
  console.log('Watching JavaScript (development)...');
  const contexts = await Promise.all(
    bundleOptions(false).map((options) => esbuild.context(options))
  );
  await Promise.all(contexts.map((context) => context.watch()));
}

const watchMode = process.argv.includes('--watch');

if (watchMode) {
  await watch();
} else {
  await buildAll();
}
