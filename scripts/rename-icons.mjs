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

/** @type {{ from: string, to: string, labelEn?: string, keywords?: string[] }[]} */
const RENAMES = [
  { from: 'account', to: 'account-circle', labelEn: 'Account circle' },
  { from: 'flag', to: 'flag-waving' },
  { from: 'puzzle', to: 'extensions', labelEn: 'Extensions' },
  { from: 'flower', to: 'flower-tulip' },
  { from: 'mask', to: 'theater', labelEn: 'Theater' },
  { from: 'click', to: 'click-circles' },
  { from: 'mountain', to: 'mountain-flag', keywords: ['mountain', 'hiking', 'nature', 'peak', 'outdoors', 'flag'] },
  { from: 'flag-alt', to: 'flag', labelEn: 'Flag' },
  { from: 'puzzle-alt', to: 'puzzle', labelEn: 'Puzzle' },
  { from: 'flower-alt', to: 'flower', labelEn: 'Flower' },
  { from: 'medical-mask-alt', to: 'mask', labelEn: 'Mask' },
  { from: 'click-action', to: 'click', labelEn: 'Click' },
  { from: 'landscape-alt', to: 'mountain', labelEn: 'Mountain' },
  { from: 'person', to: 'account', labelEn: 'Account' },
  { from: 'accessibility-alt', to: 'wheelchair', labelEn: 'Wheelchair' },
  { from: 'applemusic', to: 'apple-music', labelEn: 'Apple Music' },
  { from: 'applepay', to: 'apple-pay', labelEn: 'Apple Pay' },
  { from: 'arrow-downwards', to: 'arrow-down-right' },
  { from: 'arrow-height', to: 'up-down', labelEn: 'Arrow up down' },
  { from: 'arrow-outward', to: 'arrow-up-right' },
  { from: 'beach', to: 'umbrella', labelEn: 'Umbrella', keywords: ['umbrella', 'beach', 'rain', 'sun', 'vacation'] },
  { from: 'build', to: 'wrench', labelEn: 'Wrench' },
  { from: 'chart-monitoring', to: 'chart-line-bar', labelEn: 'Chart line bar' },
  { from: 'deployed', to: 'box', labelEn: 'Box', keywords: ['box', 'package', 'shipping', 'container', 'delivery', 'parcel'] },
  { from: 'devices-fold', to: 'device-fold' },
  { from: 'devices-wearables', to: 'wearables' },
  { from: 'email-alt', to: 'at-character', labelEn: 'At character' },
  { from: 'esports', to: 'game-controller', labelEn: 'Game controller' },
  { from: 'eyeglasses', to: 'glasses', labelEn: 'Glasses' },
  { from: 'face-alt', to: 'face-male', labelEn: 'Face male' },
  { from: 'family-star', to: 'star-family' },
  { from: 'folder-copy', to: 'folder-stacked' },
  { from: 'head-mounted-device', to: 'vr-headset', labelEn: 'VR headset' },
  { from: 'lists', to: 'list-alt', labelEn: 'List' },
  { from: 'manufacturing', to: 'cogwheels', labelEn: 'Cogwheels' },
  { from: 'navigation', to: 'navigation-circle' },
  { from: 'navigation-alt-me', to: 'navigation-rotated' },
  { from: 'pet-supplies', to: 'bone', labelEn: 'Bone' },
  { from: 'pets', to: 'paw', labelEn: 'Paw' },
  { from: 'sparts-flag', to: 'sports-flag', labelEn: 'Sports flag' },
  { from: 'toys', to: 'toy', labelEn: 'Toy' },
  { from: 'traffic', to: 'traffic-light', labelEn: 'Traffic light' },
  { from: 'motorcycle', to: 'moped', labelEn: 'Moped', keywords: ['moped', 'scooter', 'motorbike', 'motorcycle', 'transport', 'bike'] },
  { from: 'two-wheeler', to: 'motorbike', labelEn: 'Motorbike', keywords: ['motorbike', 'motorcycle', 'scooter', 'moped', 'transport', 'bike'] },
  { from: 'unlicense', to: 'license-off' },
  { from: 'watch-alt', to: 'watch-text' },
  { from: 'water-full', to: 'glass-full' },
  { from: 'youtubeshorts', to: 'youtube-shorts', labelEn: 'YouTube Shorts' },
];

const KEYWORD_ADD = [
  { slug: 'atm', add: ['dollar'] },
  { slug: 'bakery', add: ['croissant'] },
  { slug: 'border-color', add: ['edit'] },
  { slug: 'finance-chip', add: ['dollar'] },
  { slug: 'forum', add: ['chat'] },
  { slug: 'universal-currency', add: ['bill', 'banknote'] },
];

const PO_MSGSTR_FIXES = [
  { msgid: 'Bug', msgstr: 'Käfer' },
  { msgid: 'Pan', msgstr: 'Verschieben' },
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
  const toQuoted = to.includes('-') ? `'${to}'` : to;
  let out = text.replace(new RegExp(`^  '${from.replace(/-/g, '\\-')}',$`, 'gm'), `  ${to.includes('-') ? `'${to}'` : to},`);
  if (!from.includes('-')) {
    out = out.replace(new RegExp(`^  ${from},$`, 'gm'), `  ${toQuoted},`);
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
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function updatePoMsgid(po, oldEn, newEn) {
  if (oldEn === newEn) return po;
  return po.replace(
    new RegExp(`msgctxt "icon name"\\nmsgid "${escapePo(oldEn)}"`, 'g'),
    `msgctxt "icon name"\nmsgid "${escapePo(newEn)}"`
  );
}

function updateCatalogKeywords(catalog, slug, keywords) {
  const re = new RegExp(
    `(\\{\\s*filename:\\s*['"]${slug.replace(/-/g, '\\-')}['"][^}]*?keywords:\\s*)\\[[^\\]]*\\]`,
    's'
  );
  const kw = keywords.map((k) => `'${k.replace(/'/g, "\\'")}'`).join(', ');
  return catalog.replace(re, `$1[${kw}]`);
}

function addKeywords(catalog, slug, toAdd) {
  const existing = parseKeywords(catalog, slug);
  const merged = [...existing];
  for (const k of toAdd) {
    if (!merged.includes(k)) merged.push(k);
  }
  return updateCatalogKeywords(catalog, slug, merged);
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

  if (step.keywords) {
    catalog = updateCatalogKeywords(catalog, step.to, step.keywords);
  }

  for (const file of poFiles) {
    poContents[file] = updatePoMsgid(poContents[file], oldLabelEn, newLabelEn);
  }

  renameLog.push({
    from: step.from,
    to: step.to,
    oldFile: `${step.from}.svg`,
    newFile: `${step.to}.svg`,
    oldNameEn: oldLabelEn,
    newNameEn: newLabelEn,
    oldNameDe: oldLabelDe,
    newNameDe: parseGermanForEnglish(poDe, newLabelEn) || '',
    oldKeywords: oldKeywords.join(', '),
    newKeywords: (step.keywords || parseKeywords(catalog, step.to)).join(', '),
  });
}

for (const { slug, add } of KEYWORD_ADD) {
  catalog = addKeywords(catalog, slug, add);
}

for (const fix of PO_MSGSTR_FIXES) {
  for (const file of poFiles) {
    poContents[file] = poContents[file].replace(
      new RegExp(`(msgctxt "icon name"\\nmsgid "${escapePo(fix.msgid)}"\\nmsgstr ")(?:\\\\"|[^"])*(")`, 'm'),
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
writeFileSync(renamesOut, JSON.stringify(renameLog, null, 2), 'utf8');

console.log(`Renamed ${renameLog.length} icons. Log: ${renamesOut}`);
