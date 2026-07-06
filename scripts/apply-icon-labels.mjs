import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.cjs';

const { themeDir } = config;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const themeRoot = path.join(root, themeDir);
const phpPath = path.join(themeRoot, 'inc/editor-icons.php');
const poDir = path.join(themeRoot, 'languages/icons');
const renamesPath = path.join(themeRoot, 'assets/icon-renames.json');

/** @type {{ to: string, labelEn?: string, oldNameEn: string, newNameEn: string }[]} */
const renames = JSON.parse(readFileSync(renamesPath, 'utf8'));

function escapePo(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function updatePhpLabel(php, slug, labelEn) {
  const re = new RegExp(
    `(\\t\\t'${slug.replace(/-/g, '\\-')}'\\s+=>\\s+_x\\(')((?:\\\\'|[^'])*)(',\\s*'icon name',\\s*'fromscratch-icons'\\))`,
    'm'
  );
  const label = labelEn.replace(/'/g, "\\'");
  return php.replace(re, `$1${label}$3`);
}

function removePoEntry(po, msgid) {
  const re = new RegExp(
    `\\nmsgctxt "icon name"\\nmsgid "${escapePo(msgid)}"\\nmsgstr "((?:\\\\"|[^"])*)"`,
    'g'
  );
  let out = po;
  let first = true;
  out = out.replace(re, (match) => {
    if (first) {
      first = false;
      return match;
    }
    return '';
  });
  return out;
}

function updatePoMsgidSafe(po, oldEn, newEn) {
  if (oldEn === newEn) return po;
  const escapedOld = escapePo(oldEn);
  const escapedNew = escapePo(newEn);
  const existing = new RegExp(`msgctxt "icon name"\\nmsgid "${escapedNew}"\\n`, 'm').test(po);
  if (existing) {
    return removePoEntry(po, oldEn);
  }
  return po.replace(
    new RegExp(`msgctxt "icon name"\\nmsgid "${escapedOld}"`, 'g'),
    `msgctxt "icon name"\nmsgid "${escapedNew}"`
  );
}

let php = readFileSync(phpPath, 'utf8');
const poFiles = readdirSync(poDir).filter((f) => f.endsWith('.po'));
let poContents = Object.fromEntries(
  poFiles.map((f) => [f, readFileSync(path.join(poDir, f), 'utf8')])
);

for (const step of renames) {
  if (step.newNameEn && step.newNameEn !== step.oldNameEn) {
    php = updatePhpLabel(php, step.to, step.newNameEn);
    for (const file of poFiles) {
      poContents[file] = updatePoMsgidSafe(poContents[file], step.oldNameEn, step.newNameEn);
    }
  }
}

// Remove known duplicate msgids left from chain renames (keep first entry).
for (const dup of ['Mountain', 'Click', 'List']) {
  for (const file of poFiles) {
    poContents[file] = removePoEntry(poContents[file], dup);
  }
}

writeFileSync(phpPath, php, 'utf8');
for (const file of poFiles) {
  writeFileSync(path.join(poDir, file), poContents[file], 'utf8');
}

console.log(`Applied ${renames.filter((r) => r.newNameEn !== r.oldNameEn).length} label updates.`);
