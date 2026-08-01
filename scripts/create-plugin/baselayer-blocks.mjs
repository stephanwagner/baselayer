#!/usr/bin/env node
/**
 * Export a WordPress-plugin-ready copy of BaseLayer Blocks.
 *
 * Output: /plugins/baselayer-blocks/ (gitignored) — copy into wp-content/plugins or SVN.
 *
 * Usage: node scripts/create-plugin/baselayer-blocks.mjs
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');
const pkg = path.join(root, 'themes/baselayer/packages/baselayer-blocks');
const out = path.join(root, 'plugins/baselayer-blocks');

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${bin} exited with code ${code}`));
    });
  });
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyFile(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

async function copyDir(src, dest, { filter } = {}) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (filter && !filter(from, entry)) {
      continue;
    }
    if (entry.isDirectory()) {
      await copyDir(from, to, { filter });
    } else if (entry.isFile()) {
      await copyFile(from, to);
    }
  }
}

async function main() {
  if (!(await exists(pkg))) {
    throw new Error(`Package not found: ${pkg}`);
  }

  console.log('Building blocks + canvas/form builder assets…');
  await run('node', [
    'scripts/build-js.mjs',
    '--filter',
    'canvas-builder-admin,form-builder-admin,blocks-admin,blocks-editor',
  ]);
  await run('node', [
    'scripts/build-css.mjs',
    '--filter',
    'canvas-builder-admin,form-builder-admin,blocks-admin,blocks-editor',
  ]);

  console.log('Compiling translations…');
  await run('bash', ['scripts/compile_po.sh']);

  console.log('Preparing plugin folder…');
  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(out, { recursive: true });

  await copyFile(path.join(pkg, 'baselayer-blocks.php'), path.join(out, 'baselayer-blocks.php'));

  if (await exists(path.join(pkg, 'readme.txt'))) {
    await copyFile(path.join(pkg, 'readme.txt'), path.join(out, 'readme.txt'));
  }

  await copyDir(path.join(pkg, 'includes'), path.join(out, 'includes'));

  if (await exists(path.join(pkg, 'assets'))) {
    await copyDir(path.join(pkg, 'assets'), path.join(out, 'assets'), {
      filter: (_from, entry) => {
        if (entry.isFile() && (entry.name.endsWith('.map') || entry.name === '.gitkeep')) {
          return false;
        }
        return true;
      },
    });
  }

  if (await exists(path.join(pkg, 'languages'))) {
    await copyDir(path.join(pkg, 'languages'), path.join(out, 'languages'));
  }

  console.log(`Done. Plugin files are in:\n  ${out}`);
  console.log('Copy that folder into wp-content/plugins or your WordPress.org SVN trunk.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
