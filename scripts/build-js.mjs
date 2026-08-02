import { createRequire } from 'node:module';
import * as esbuild from 'esbuild';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { themeDir } = require('./config.cjs');

const formsPkg = 'themes/baselayer/packages/baselayer-forms';
const eventsPkg = 'themes/baselayer/packages/baselayer-events';
const editorialPkg = 'themes/baselayer/packages/baselayer-editorial';
const blocksPkg = 'themes/baselayer/packages/baselayer-blocks';

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
    input: `${themeDir}/src/js/admin/canvas-builder/index.js`,
    name: 'canvas-builder-admin',
    outDir: `${themeDir}/assets/js`
  },
  {
    input: `${themeDir}/src/js/admin/form-builder/index.js`,
    name: 'form-builder-admin',
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

const blocksBundles = [
  { input: `${blocksPkg}/src/js/admin.js`, name: 'blocks-admin', outDir: `${blocksPkg}/assets/js` },
  {
    input: `${blocksPkg}/src/js/editor.js`,
    name: 'blocks-editor',
    outDir: `${blocksPkg}/assets/js`,
    jsx: {
      loader: { '.js': 'jsx' },
      jsx: 'transform',
      jsxFactory: 'wp.element.createElement',
      jsxFragment: 'wp.element.Fragment'
    }
  },
  {
    input: `${blocksPkg}/src/js/block-options/editor.js`,
    name: 'block-options-editor',
    outDir: `${blocksPkg}/assets/js`,
    jsx: {
      loader: { '.js': 'jsx' },
      jsx: 'transform',
      jsxFactory: 'wp.element.createElement',
      jsxFragment: 'wp.element.Fragment'
    }
  },
  {
    input: `${blocksPkg}/src/js/block-options/admin.js`,
    name: 'block-options-admin',
    outDir: `${blocksPkg}/assets/js`
  }
];

const eventsBundles = [
  { input: `${eventsPkg}/src/js/editor.js`, name: 'events-editor', outDir: `${eventsPkg}/assets/js` },
  { input: `${eventsPkg}/src/js/admin.js`, name: 'events-admin', outDir: `${eventsPkg}/assets/js` },
  { input: `${eventsPkg}/src/js/settings.js`, name: 'events-settings', outDir: `${eventsPkg}/assets/js` }
];

const editorialBundles = [
  { input: `${editorialPkg}/src/js/admin.js`, name: 'editorial-admin', outDir: `${editorialPkg}/assets/js` },
  { input: `${editorialPkg}/src/js/editor.js`, name: 'editorial-editor', outDir: `${editorialPkg}/assets/js` }
];

const bundles = [...themeBundles, ...formsBundles, ...blocksBundles, ...eventsBundles, ...editorialBundles];

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

async function generateBlockOptionsCustomsLoader() {
  const fs = await import('node:fs/promises');
  const customsDir = path.join(blocksPkg, 'customs');
  const outFile = path.join(blocksPkg, 'src/js/block-options/load-customs.js');
  let entries = [];
  try {
    entries = await fs.readdir(customsDir, { withFileTypes: true });
  } catch {
    entries = [];
  }
  const folders = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort();
  const lines = [
    '/**',
    ' * Auto-generated by scripts/build-js.mjs — do not edit.',
    ' * Imports every customs/<name>/editor.js so new customs are included automatically.',
    ' */',
  ];
  for (const folder of folders) {
    const editorPath = path.join(customsDir, folder, 'editor.js');
    try {
      await fs.access(editorPath);
      lines.push(`import '../../../customs/${folder}/editor.js';`);
    } catch {
      /* no editor.js */
    }
  }
  lines.push('');
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, lines.join('\n'), 'utf8');
  console.log(`Generated ${outFile} (${folders.length} customs).`);
}

async function build(prod) {
  const label = prod ? 'production' : 'development';
  await generateBlockOptionsCustomsLoader();
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

/**
 * Snapshot theme field-builder kit into Events package for standalone plugin use.
 */
async function vendorFieldBuilderToEvents() {
  const fs = await import('node:fs/promises');
  const themeAssetsJs = path.join(themeDir, 'assets/js');
  const themeAssetsCss = path.join(themeDir, 'assets/css');
  const vendorDir = path.join(eventsPkg, 'assets/vendor/field-builder');
  await fs.mkdir(vendorDir, { recursive: true });

  const files = [
    ['js', 'field-builder-admin.js'],
    ['js', 'field-builder-admin.min.js'],
    ['css', 'field-builder-admin.css'],
    ['css', 'field-builder-admin.min.css'],
  ];

  for (const [kind, name] of files) {
    const src = path.join(kind === 'js' ? themeAssetsJs : themeAssetsCss, name);
    try {
      await fs.copyFile(src, path.join(vendorDir, name));
      console.log(`Vendored ${name} → ${eventsPkg}/assets/vendor/field-builder/`);
    } catch {
      // CSS may not exist yet if only JS was filtered.
    }
  }
}

/**
 * Snapshot canvas-builder kit into Forms + Blocks for standalone plugin use.
 */
async function vendorCanvasBuilderToPackages() {
  const fs = await import('node:fs/promises');
  const themeAssetsJs = path.join(themeDir, 'assets/js');
  const themeAssetsCss = path.join(themeDir, 'assets/css');
  const targets = [
    path.join(formsPkg, 'assets/vendor/canvas-builder'),
    path.join(blocksPkg, 'assets/vendor/canvas-builder'),
  ];

  const files = [
    ['js', 'canvas-builder-admin.js'],
    ['js', 'canvas-builder-admin.min.js'],
    ['css', 'canvas-builder-admin.css'],
    ['css', 'canvas-builder-admin.min.css'],
  ];

  for (const vendorDir of targets) {
    await fs.mkdir(vendorDir, { recursive: true });
    for (const [kind, name] of files) {
      const src = path.join(kind === 'js' ? themeAssetsJs : themeAssetsCss, name);
      try {
        await fs.copyFile(src, path.join(vendorDir, name));
        console.log(`Vendored ${name} → ${vendorDir}/`);
      } catch {
        // ignore missing when filtered builds skip CSS/JS
      }
    }
  }

  // Remove legacy Forms vendor path if present.
  await fs.rm(path.join(formsPkg, 'assets/vendor/builder'), { recursive: true, force: true });
}

/**
 * Snapshot form-builder kit into Forms + Blocks for standalone plugin use.
 */
async function vendorFormBuilderToPackages() {
  const fs = await import('node:fs/promises');
  const themeAssetsJs = path.join(themeDir, 'assets/js');
  const themeAssetsCss = path.join(themeDir, 'assets/css');
  const targets = [
    path.join(formsPkg, 'assets/vendor/form-builder'),
    path.join(blocksPkg, 'assets/vendor/form-builder'),
  ];

  const files = [
    ['js', 'form-builder-admin.js'],
    ['js', 'form-builder-admin.min.js'],
    ['css', 'form-builder-admin.css'],
    ['css', 'form-builder-admin.min.css'],
  ];

  for (const vendorDir of targets) {
    await fs.mkdir(vendorDir, { recursive: true });
    for (const [kind, name] of files) {
      const src = path.join(kind === 'js' ? themeAssetsJs : themeAssetsCss, name);
      try {
        await fs.copyFile(src, path.join(vendorDir, name));
        console.log(`Vendored ${name} → ${vendorDir}/`);
      } catch {
        // ignore missing when filtered builds skip CSS/JS
      }
    }
  }
}

async function watch() {
  console.log('Watching JavaScript (development)...');
  await generateBlockOptionsCustomsLoader();
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
  const filter = parseFilter();
  if (!filter || filter.has('field-builder-admin')) {
    await vendorFieldBuilderToEvents();
  }
  if (!filter || filter.has('canvas-builder-admin') || filter.has('forms-admin')) {
    await vendorCanvasBuilderToPackages();
  }
  if (
    !filter ||
    filter.has('form-builder-admin') ||
    filter.has('forms-admin') ||
    filter.has('blocks-admin')
  ) {
    await vendorFormBuilderToPackages();
  }
}
