import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { themeDir } = require('./config.cjs');

const pairs = [
  { src: 'assets/css', dest: 'assets/release/css', match: (name) => name.endsWith('.min.css') || name === 'icons.css' },
  { src: 'assets/js', dest: 'assets/release/js', match: (name) => name.endsWith('.min.js') },
];

function copyReleaseDir(srcRel, destRel, match) {
  const srcDir = path.join(themeDir, srcRel);
  const destDir = path.join(themeDir, destRel);
  fs.mkdirSync(destDir, { recursive: true });

  if (!fs.existsSync(srcDir)) {
    console.warn(`skip ${srcRel}: missing after build`);
    return 0;
  }

  let n = 0;
  for (const name of fs.readdirSync(srcDir)) {
    if (!match(name)) {
      continue;
    }
    const from = path.join(srcDir, name);
    if (!fs.statSync(from).isFile()) {
      continue;
    }
    fs.copyFileSync(from, path.join(destDir, name));
    console.log(`release: ${destRel}/${name}`);
    n += 1;
  }
  return n;
}

let total = 0;
for (const { src, dest, match } of pairs) {
  total += copyReleaseDir(src, dest, match);
}

if (total === 0) {
  console.error('No release assets copied. Run npm run build first.');
  process.exit(1);
}

console.log(`✔ copied ${total} release asset(s)`);
