import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themeDir = path.join(__dirname, '..');

const bundles = [
  {
    input: path.join(themeDir, 'src/js/main.js'),
    name: 'main'
  }
];

function bundleOptions(prod) {
  return bundles.map(({ input, name }) => ({
    entryPoints: [input],
    outfile: path.join(themeDir, 'assets/js', `${name}${prod ? '.min' : ''}.js`),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    sourcemap: !prod,
    minify: prod,
    logLevel: 'info'
  }));
}

async function build(prod) {
  const label = prod ? 'production' : 'development';
  console.log(`Building JavaScript (${label})...`);

  await Promise.all(bundleOptions(prod).map((options) => esbuild.build(options)));
}

async function buildAll() {
  fs.mkdirSync(path.join(themeDir, 'assets/js'), { recursive: true });

  if (!fs.existsSync(bundles[0].input)) {
    console.log(`Skipping JS (missing ${path.relative(themeDir, bundles[0].input)})`);
    return;
  }

  await build(false);
  await build(true);
}

async function watch() {
  if (!fs.existsSync(bundles[0].input)) {
    console.error(`Missing ${path.relative(themeDir, bundles[0].input)}`);
    process.exit(1);
  }

  fs.mkdirSync(path.join(themeDir, 'assets/js'), { recursive: true });
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
