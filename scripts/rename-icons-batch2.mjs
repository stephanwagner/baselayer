import {
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
  readdirSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.cjs';

const { themeDir } = config;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const themeRoot = path.join(root, themeDir);
const iconsDir = path.join(themeRoot, 'assets/icons');

const catalogPath = path.join(themeRoot, 'src/js/editor/icons/icon-catalog.js');
const scssPath = path.join(themeRoot, 'src/scss/icons/_icon-names.scss');
const phpPath = path.join(themeRoot, 'inc/editor-icons.php');
const poDir = path.join(themeRoot, 'languages/icons');
const renamesOut = path.join(themeRoot, 'assets/icon-renames.json');

/** @type {{ from: string, to: string, labelEn?: string }[]} */
const RENAMES = [
  { from: 'tooltip', to: 'tooltip-text' },
  { from: 'tooltip-alt', to: 'tooltip', labelEn: 'Tooltip' },
  { from: 'up-down', to: 'arrow-up-down' },
];

const PO_MSGSTR_FIXES = [
  { msgid: 'Email (alt)', msgstr: '@-Zeichen', newMsgid: 'At character' },
  { msgid: 'At character', msgstr: '@-Zeichen' },
  { msgid: 'Bone', msgstr: 'Knochen' },
  { msgid: 'Box', msgstr: 'Box' },
  { msgid: 'Chart line bar', msgstr: 'Linien-Balkendiagramm' },
  { msgid: 'Cogwheels', msgstr: 'Zahnräder' },
  { msgid: 'Extensions', msgstr: 'Erweiterungen' },
  { msgid: 'Moped', msgstr: 'Moped' },
  { msgid: 'Motorbike', msgstr: 'Motorrad' },
  { msgid: 'Paw', msgstr: 'Pfote' },
  { msgid: 'Theater', msgstr: 'Theater' },
  { msgid: 'Traffic light', msgstr: 'Ampel' },
  { msgid: 'Arrow up down', msgstr: 'Pfeil hoch runter' },
];

function parseEnglishLabels(phpSource) {
  const labels = new Map();
  const re =
    /'([a-z0-9-]+)'\s+=>\s+_x\((['"])((?:\\.|(?!\2)[^\\])*)\2,\s*'icon name'/g;
  for (const match of phpSource.matchAll(re)) {
    const quote = match[2];
    let label = match[3];
    label = quote === "'" ? label.replace(/\\'/g, "'") : label.replace(/\\"/g, '"');
    labels.set(match[1], label);
  }
  return labels;
}

function parseKeywords(catalogSource, slug) {
  const re = new RegExp(
    `\\{\\s*filename:\\s*['"]${slug.replace(/-/g, '\\-')}['"][^}]*?keywords:\\s*\\[([^\\]]*)\\]`,
    's'
  );
  const match = catalogSource.match(re);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((p) => p.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function parseGermanForEnglish(poSource, englishLabel) {
  const escaped = englishLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `msgctxt "icon name"\\nmsgid "${escaped}"\\nmsgstr "((?:\\\\"|[^"])*)"`,
    'm'
  );
  const match = poSource.match(re);
  return match ? match[1].replace(/\\"/g, '"') : '';
}

function renameSvg(step) {
  for (const suffix of ['', '-fill']) {
    const from = path.join(iconsDir, `${step.from}${suffix}.svg`);
    const to = path.join(iconsDir, `${step.to}${suffix}.svg`);
    if (existsSync(from)) {
      renameSync(from, to);
    }
  }
}

function replaceSlugInCatalog(text, from, to) {
  return text.replaceAll(`filename: '${from}'`, `filename: '${to}'`);
}

function replaceSlugInScss(text, from, to) {
  let out = text.replace(new RegExp(`^  '${from.replace(/-/g, '\\-')}',$`, 'gm'), `  '${to}',`);
  if (!from.includes('-')) {
    out = out.replace(new RegExp(`^  ${from},$`, 'gm'), `  ${to},`);
  }
  return out;
}

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

function escapePo(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updatePoMsgidSafe(po, oldEn, newEn) {
  if (oldEn === newEn) return po;
  const escapedOld = escapePo(oldEn);
  const escapedNew = escapePo(newEn);
  const existing = new RegExp(`msgctxt "icon name"\\nmsgid "${escapedNew}"\\n`, 'm').test(po);
  if (existing) {
    const re = new RegExp(
      `\\nmsgctxt "icon name"\\nmsgid "${escapedOld}"\\nmsgstr "((?:\\\\"|[^"])*)"`,
      'm'
    );
    return po.replace(re, '');
  }
  return po.replace(
    new RegExp(`msgctxt "icon name"\\nmsgid "${escapedOld}"`, 'g'),
    `msgctxt "icon name"\nmsgid "${escapedNew}"`
  );
}

function humanize(slug) {
  return slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

let catalog = readFileSync(catalogPath, 'utf8');
let scss = readFileSync(scssPath, 'utf8');
let php = readFileSync(phpPath, 'utf8');
const poFiles = readdirSync(poDir).filter((f) => f.endsWith('.po'));
let poContents = Object.fromEntries(
  poFiles.map((f) => [f, readFileSync(path.join(poDir, f), 'utf8')])
);
const poDe = poContents['fromscratch-icons-de_DE.po'];

const existingLog = existsSync(renamesOut)
  ? JSON.parse(readFileSync(renamesOut, 'utf8'))
  : [];
const renameLog = [];

for (const step of RENAMES) {
  const labelsEn = parseEnglishLabels(php);
  const oldLabelEn = labelsEn.get(step.from) || humanize(step.from);
  const oldKeywords = parseKeywords(catalog, step.from);
  const oldLabelDe = parseGermanForEnglish(poDe, oldLabelEn);
  const newLabelEn = step.labelEn ?? labelsEn.get(step.from) ?? humanize(step.to);

  renameSvg(step);
  catalog = replaceSlugInCatalog(catalog, step.from, step.to);
  scss = replaceSlugInScss(scss, step.from, step.to);
  php = rekeyPhpLabel(php, step.from, step.to, step.labelEn);

  for (const file of poFiles) {
    poContents[file] = updatePoMsgidSafe(poContents[file], oldLabelEn, newLabelEn);
  }

  renameLog.push({
    from: step.from,
    to: step.to,
    oldFile: `${step.from}.svg`,
    newFile: `${step.to}.svg`,
    oldNameEn: oldLabelEn,
    newNameEn: newLabelEn,
    oldNameDe: oldLabelDe,
    newNameDe: '',
    oldKeywords: oldKeywords.join(', '),
    newKeywords: parseKeywords(catalog, step.to).join(', '),
  });
}

for (const fix of PO_MSGSTR_FIXES) {
  for (const file of poFiles) {
    if (fix.newMsgid && fix.newMsgid !== fix.msgid) {
      poContents[file] = updatePoMsgidSafe(poContents[file], fix.msgid, fix.newMsgid);
    }
    const msgid = fix.newMsgid || fix.msgid;
    poContents[file] = poContents[file].replace(
      new RegExp(`(msgctxt "icon name"\\nmsgid "${escapePo(msgid)}"\\nmsgstr ")(?:\\\\"|[^"])*(")`, 'm'),
      `$1${escapePo(fix.msgstr)}$2`
    );
  }
}

writeFileSync(catalogPath, catalog, 'utf8');
writeFileSync(scssPath, scss, 'utf8');
writeFileSync(phpPath, php, 'utf8');
for (const file of poFiles) {
  writeFileSync(path.join(poDir, file), poContents[file], 'utf8');
}

for (const file of poFiles) {
  writeFileSync(path.join(poDir, file), poContents[file], 'utf8');
}

const poDeFinal = poContents['fromscratch-icons-de_DE.po'];
const mergedLog = [...existingLog, ...renameLog];
for (const entry of mergedLog) {
  entry.newNameDe = parseGermanForEnglish(poDeFinal, entry.newNameEn) || entry.oldNameDe || '';
}
writeFileSync(renamesOut, JSON.stringify(mergedLog, null, 2), 'utf8');

console.log(`Renamed ${renameLog.length} icons. Log now has ${mergedLog.length} entries.`);
