import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const require = createRequire(import.meta.url);
const { theme: parentTheme } = require('./config.cjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const sassBin = path.join(root, 'node_modules/.bin/sass');

function getChildThemeSlug() {
  const arg = process.argv.find((value) => value.startsWith('--theme='));
  if (arg) {
    return arg.slice('--theme='.length).trim();
  }

  const index = process.argv.indexOf('--theme');
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1].trim();
  }

  return '';
}

function run(bin, args, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd, stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${path.basename(bin)} exited with code ${code}`));
    });
  });
}

const slug = getChildThemeSlug();

if (!slug) {
  console.error('Usage: npm run build:child -- --theme=your-child-slug');
  process.exit(1);
}

if (slug === parentTheme) {
  console.error(`Refusing to build parent theme "${parentTheme}" with build:child. Use npm run build instead.`);
  process.exit(1);
}

const childDir = path.join(root, 'themes', slug);

if (!fs.existsSync(childDir)) {
  console.error(`Child theme not found: themes/${slug}`);
  process.exit(1);
}

const childCssScript = path.join(childDir, 'scripts/build-css.mjs');
const childJsScript = path.join(childDir, 'scripts/build-js.mjs');

if (fs.existsSync(childCssScript) && fs.existsSync(childJsScript)) {
  console.log(`Building child theme via local scripts (${slug})...`);
  await run(process.execPath, [childJsScript], childDir);
  await run(process.execPath, [childCssScript], childDir);
  console.log(`Child theme build complete: themes/${slug}`);
  process.exit(0);
}

// Fallback for older children without local build scripts.
const scssEntry = path.join(childDir, 'src/scss/main.scss');
const jsEntry = path.join(childDir, 'src/js/main.js');
const cssOutDir = path.join(childDir, 'assets/css');
const jsOutDir = path.join(childDir, 'assets/js');

fs.mkdirSync(cssOutDir, { recursive: true });
fs.mkdirSync(jsOutDir, { recursive: true });

async function buildCss() {
  if (!fs.existsSync(scssEntry)) {
    console.log(`Skipping CSS (missing ${path.relative(root, scssEntry)})`);
    return;
  }

  console.log(`Building child CSS (${slug})...`);

  await run(sassBin, [
    `${scssEntry}:${path.join(cssOutDir, 'main.css')}`,
    '--style=expanded',
    '--source-map'
  ]);

  await run(sassBin, [
    `${scssEntry}:${path.join(cssOutDir, 'main.min.css')}`,
    '--style=compressed',
    '--no-source-map'
  ]);
}

async function buildJs() {
  if (!fs.existsSync(jsEntry)) {
    console.log(`Skipping JS (missing ${path.relative(root, jsEntry)})`);
    return;
  }

  console.log(`Building child JavaScript (${slug})...`);

  await esbuild.build({
    entryPoints: [jsEntry],
    outfile: path.join(jsOutDir, 'main.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    sourcemap: true,
    minify: false,
    logLevel: 'info'
  });

  await esbuild.build({
    entryPoints: [jsEntry],
    outfile: path.join(jsOutDir, 'main.min.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    sourcemap: false,
    minify: true,
    logLevel: 'info'
  });
}

await buildCss();
await buildJs();
console.log(`Child theme build complete: themes/${slug}`);
