import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import config from './config.cjs';

const { themeDir } = config;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const themeRoot = path.join(root, themeDir);
const phpPath = path.join(themeRoot, 'inc/editor-icons.php');
const renamesPath = path.join(themeRoot, 'assets/icon-renames.json');

/** @type {{ from: string, to: string, newNameEn: string, oldNameEn: string }[]} */
const renames = JSON.parse(readFileSync(renamesPath, 'utf8'));

function rekeyPhpLabel(php, from, to, labelEn) {
  const re = new RegExp(
    `(\\t\\t)'${from.replace(/-/g, '\\-')}'(\\s+=>\\s+_x\\(')((?:\\\\'|[^'])*)(',\\s*'icon name',\\s*'fromscratch-icons'\\))`,
    'm'
  );
  const match = php.match(re);
  if (!match) {
    return php.replace(new RegExp(`(\\t\\t)'${from.replace(/-/g, '\\-')}'`), `$1'${to}'`);
  }
  const label = labelEn !== undefined ? labelEn.replace(/'/g, "\\'") : match[3];
  return php.replace(re, `$1'${to}'$2${label}$4`);
}

function updatePhpLabel(php, slug, labelEn) {
  const re = new RegExp(
    `(\\t\\t'${slug.replace(/-/g, '\\-')}'\\s+=>\\s+_x\\(')((?:\\\\'|[^'])*)(',\\s*'icon name',\\s*'fromscratch-icons'\\))`,
    'm'
  );
  const label = labelEn.replace(/'/g, "\\'");
  return php.replace(re, `$1${label}$3`);
}

let php = execSync('git show HEAD:themes/fromscratch/inc/editor-icons.php', {
  cwd: root,
  encoding: 'utf8',
});

for (const step of renames) {
  const labelEn = step.newNameEn !== step.oldNameEn ? step.newNameEn : undefined;
  php = rekeyPhpLabel(php, step.from, step.to, labelEn);
}

for (const step of renames) {
  if (step.newNameEn !== step.oldNameEn) {
    php = updatePhpLabel(php, step.to, step.newNameEn);
  }
}

writeFileSync(phpPath, php, 'utf8');
console.log('Rebuilt editor-icons.php from git HEAD + rename log.');
