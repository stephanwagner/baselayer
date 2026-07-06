import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.cjs';

const { themeDir } = config;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const themeRoot = path.join(root, themeDir);
const phpPath = path.join(themeRoot, 'inc/editor-icons.php');
const renamesPath = path.join(themeRoot, 'assets/icon-renames.json');

/** @type {{ to: string, newNameEn: string }[]} */
const renames = JSON.parse(readFileSync(renamesPath, 'utf8'));

function updatePhpLabel(php, slug, labelEn) {
  const escaped = slug.replace(/-/g, '\\-');
  const label = labelEn.replace(/'/g, "\\'");
  const broken = new RegExp(
    `(\\t\\t'${escaped}'\\s+=>\\s+_x\\(')[^']*(, 'fromscratch-icons'\\))`,
    'm'
  );
  const good = new RegExp(
    `(\\t\\t'${escaped}'\\s+=>\\s+_x\\(')((?:\\\\'|[^'])*)(',\\s*'icon name',\\s*'fromscratch-icons'\\))`,
    'm'
  );
  if (broken.test(php)) {
    return php.replace(broken, `$1${label}', 'icon name'$2`);
  }
  return php.replace(good, `$1${label}$2`);
}

let php = readFileSync(phpPath, 'utf8');

for (const step of renames) {
  if (step.newNameEn) {
    php = updatePhpLabel(php, step.to, step.newNameEn);
  }
}

writeFileSync(phpPath, php, 'utf8');
console.log('Fixed PHP icon labels.');
