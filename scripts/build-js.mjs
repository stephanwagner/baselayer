import * as esbuild from 'esbuild';

const theme = 'fromscratch';
const base = `theme/${theme}`;

const bundles = [
  { input: `${base}/src/js/main/main.js`, name: 'main' },
  { input: `${base}/src/js/admin/admin.js`, name: 'admin' },
  {
    input: `${base}/src/js/editor/editor.js`,
    name: 'editor',
    jsx: {
      loader: { '.js': 'jsx' },
      jsx: 'transform',
      jsxFactory: 'wp.element.createElement',
      jsxFragment: 'wp.element.Fragment'
    }
  },
  { input: `${base}/src/js/service-worker/index.js`, name: 'service-worker' }
];

function bundleOptions(prod) {
  return bundles.map(({ input, name, jsx }) => ({
    entryPoints: [input],
    outfile: `${base}/assets/js/${name}${prod ? '.min' : ''}.js`,
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
  console.log(`Building JavaScript (${label})...`);

  await Promise.all(bundleOptions(prod).map((options) => esbuild.build(options)));
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
