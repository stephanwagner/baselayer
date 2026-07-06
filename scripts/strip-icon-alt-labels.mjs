import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
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

const ALT_MSGID_RE = /\s*\((?:alt|alternative)\)/gi;
const ALT_MSGSTR_RE = /\s*\((?:alternativ|alternative)\)/gi;

function stripAltText(text) {
  ALT_MSGID_RE.lastIndex = 0;
  ALT_MSGSTR_RE.lastIndex = 0;
  return text
    .replace(ALT_MSGID_RE, '')
    .replace(ALT_MSGSTR_RE, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function stripAltFromPhp(source) {
  return source.replace(
    /(_x\(\s*(['"]))((?:\\.|(?!\2)[^\\])*)\2(\s*,\s*'icon name')/g,
    (match, prefix, quote, label, suffix) => {
      const unescaped = label.replace(/\\'/g, "'").replace(/\\"/g, '"');
      const stripped = stripAltText(unescaped);
      const escaped = quote === "'" ? stripped.replace(/'/g, "\\'") : stripped.replace(/"/g, '\\"');
      return `${prefix}${escaped}${quote}${suffix}`;
    }
  );
}

function getMsgid(block) {
  const match = block.match(/^msgid "((?:\\"|[^"])*)"/m);
  return match ? match[1].replace(/\\"/g, '"') : null;
}

function getMsgstr(block) {
  const match = block.match(/^msgstr "((?:\\"|[^"])*)"/m);
  return match ? match[1].replace(/\\"/g, '"') : null;
}

function setMsgid(block, msgid) {
  const escaped = msgid.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return block.replace(/^msgid "((?:\\"|[^"])*)"/m, `msgid "${escaped}"`);
}

function setMsgstr(block, msgstr) {
  const escaped = msgstr.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return block.replace(/^msgstr "((?:\\"|[^"])*)"/m, `msgstr "${escaped}"`);
}

function isIconNameBlock(block) {
  return block.includes('msgctxt "icon name"');
}

function normalizeIconBlock(block) {
  const msgid = getMsgid(block);
  if (!msgid) return block;

  let updated = setMsgid(block, stripAltText(msgid));
  const msgstr = getMsgstr(updated);
  if (msgstr) {
    updated = setMsgstr(updated, stripAltText(msgstr));
  }
  return updated;
}

function stripAltFromPo(source) {
  const blocks = source.split(/\n\n+/);
  const seen = new Set();
  const result = [];

  const iconIndices = [];
  for (let i = 0; i < blocks.length; i++) {
    if (isIconNameBlock(blocks[i])) iconIndices.push(i);
  }

  iconIndices.sort((a, b) => {
    const aId = getMsgid(blocks[a]) || '';
    const bId = getMsgid(blocks[b]) || '';
    const aAlt = aId !== stripAltText(aId) ? 1 : 0;
    const bAlt = bId !== stripAltText(bId) ? 1 : 0;
    return aAlt - bAlt || a - b;
  });

  const processed = new Map();
  for (const index of iconIndices) {
    const msgid = getMsgid(blocks[index]);
    if (!msgid) {
      processed.set(index, blocks[index]);
      continue;
    }

    const newMsgid = stripAltText(msgid);
    if (seen.has(newMsgid)) {
      processed.set(index, null);
      continue;
    }

    seen.add(newMsgid);
    processed.set(index, normalizeIconBlock(blocks[index]));
  }

  for (let i = 0; i < blocks.length; i++) {
    if (processed.has(i)) {
      if (processed.get(i)) result.push(processed.get(i));
      continue;
    }
    result.push(blocks[i]);
  }

  return result.join('\n\n');
}

function updateRenamesLog(source) {
  const log = JSON.parse(source);
  for (const entry of log) {
    for (const key of ['oldNameEn', 'newNameEn', 'oldNameDe', 'newNameDe']) {
      if (entry[key]) {
        entry[key] = stripAltText(String(entry[key]));
      }
    }
  }
  return JSON.stringify(log, null, 2);
}

writeFileSync(phpPath, stripAltFromPhp(readFileSync(phpPath, 'utf8')), 'utf8');

for (const file of readdirSync(poDir).filter((f) => f.endsWith('.po'))) {
  const filePath = path.join(poDir, file);
  writeFileSync(filePath, stripAltFromPo(readFileSync(filePath, 'utf8')), 'utf8');
}

if (existsSync(renamesPath)) {
  writeFileSync(renamesPath, updateRenamesLog(readFileSync(renamesPath, 'utf8')), 'utf8');
}

console.log('Removed (alt) / (alternative) / (alternativ) from icon labels.');
