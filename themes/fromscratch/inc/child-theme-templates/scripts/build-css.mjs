import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themeDir = path.join(__dirname, '..');

function resolveBin(name) {
  let dir = themeDir;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'node_modules', '.bin', name);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return name;
}

const sassBin = resolveBin('sass');

const entries = [{ src: path.join(themeDir, 'src/scss/main.scss'), name: 'main' }];

function sassPairs(prod) {
  const suffix = prod ? '.min' : '';
  const outDir = path.join(themeDir, 'assets/css');

  return entries.map(
    ({ src, name }) => `${src}:${path.join(outDir, `${name}${suffix}.css`)}`
  );
}

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd: themeDir, stdio: 'inherit' });

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
  const child = spawn(bin, args, { cwd: themeDir, stdio: 'inherit' });
  child.on('close', (code) => process.exit(code ?? 1));
  return child;
}

async function build(prod) {
  const label = prod ? 'production' : 'development';
  console.log(`Building CSS (${label})...`);

  if (prod) {
    await run(sassBin, [
      ...sassPairs(true),
      '--style=compressed',
      '--no-source-map'
    ]);
    return;
  }

  await run(sassBin, [
    ...sassPairs(false),
    '--style=expanded',
    '--source-map'
  ]);
}

async function buildAll() {
  fs.mkdirSync(path.join(themeDir, 'assets/css'), { recursive: true });

  if (!fs.existsSync(entries[0].src)) {
    console.log(`Skipping CSS (missing ${path.relative(themeDir, entries[0].src)})`);
    return;
  }

  await build(false);
  await build(true);
}

function watch() {
  if (!fs.existsSync(entries[0].src)) {
    console.error(`Missing ${path.relative(themeDir, entries[0].src)}`);
    process.exit(1);
  }

  fs.mkdirSync(path.join(themeDir, 'assets/css'), { recursive: true });
  console.log('Watching CSS...');

  const child = spawnWatch(sassBin, [
    ...sassPairs(false),
    '--watch',
    '--poll',
    '--source-map'
  ]);

  const shutdown = () => child.kill();
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

const watchMode = process.argv.includes('--watch');

if (watchMode) {
  watch();
} else {
  await buildAll();
}
