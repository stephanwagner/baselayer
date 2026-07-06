import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './config.cjs';

const { themeDir } = config;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const themeRoot = path.join(root, themeDir);
const iconsDir = path.join(themeRoot, 'assets/icons');
const outFile = path.join(themeRoot, 'assets/icon-overview.html');
const renamesFile = path.join(themeRoot, 'assets/icon-renames.json');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseCatalogIcons(source) {
  const icons = new Map();
  const re =
    /\{\s*filename:\s*['"]([^'"]+)['"],\s*(?:label:\s*['"]([^'"]*)['"],\s*)?[^}]*?keywords:\s*\[([^\]]*)\]/g;

  for (const match of source.matchAll(re)) {
    const filename = match[1];
    const inlineLabel = match[2] || '';
    const keywords = match[3]
      .split(',')
      .map((part) => part.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);

    icons.set(filename, { filename, inlineLabel, keywords });
  }

  return icons;
}

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

function parseGermanLabels(poSource) {
  const labels = new Map();
  const blocks = poSource.split(/\n\n+/);

  for (const block of blocks) {
    if (!block.includes('msgctxt "icon name"')) {
      continue;
    }

    const msgid = block.match(/^msgid "((?:\\"|[^"])*)"/m);
    const msgstr = block.match(/^msgstr "((?:\\"|[^"])*)"/m);

    if (!msgid || !msgstr) {
      continue;
    }

    labels.set(
      msgid[1].replace(/\\"/g, '"'),
      msgstr[1].replace(/\\"/g, '"')
    );
  }

  return labels;
}

function collectSvgFiles(dir, prefix = '') {
  const files = [];

  if (!existsSync(dir)) {
    return files;
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...collectSvgFiles(path.join(dir, entry.name), rel));
      continue;
    }

    if (entry.name.endsWith('.svg') && !entry.name.endsWith('-fill.svg')) {
      files.push(rel.replace(/\\/g, '/'));
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function baseIconName(file) {
  if (file === 'theme/logo.svg') {
    return 'theme-logo';
  }

  const name = file.replace(/\.svg$/, '').split('/').pop();
  return name;
}

function svgAssetPath(file) {
  return file === 'theme/logo.svg' ? 'icons/theme/logo.svg' : `icons/${file}`;
}

function loadRenames() {
  if (!existsSync(renamesFile)) {
    return [];
  }
  return JSON.parse(readFileSync(renamesFile, 'utf8'));
}

function buildRows(svgFiles, catalog, labelsEn, labelsDe, renames) {
  const renamedTo = new Set(renames.map((r) => r.to));
  const renameByTo = new Map(renames.map((r) => [r.to, r]));
  const rows = [];

  for (const file of svgFiles) {
    const base = baseIconName(file);
    const catalogEntry = catalog.get(base);
    const nameEn = catalogEntry?.inlineLabel || labelsEn.get(base) || '';
    const nameDe = labelsDe.get(nameEn) || labelsDe.get(base) || '';
    const keywords = catalogEntry?.keywords?.join(', ') || '';
    const inCatalog = catalog.has(base) ? 'yes' : 'no';

    if (renamedTo.has(base)) {
      const rename = renameByTo.get(base);
      rows.push({
        kind: 'renamed-old',
        file: rename.oldFile,
        base: rename.from,
        preview: '',
        nameEn: rename.oldNameEn,
        nameDe: rename.oldNameDe,
        keywords: rename.oldKeywords,
        inCatalog: 'yes',
        note: 'renamed',
      });
      rows.push({
        kind: 'renamed-new',
        file,
        base,
        preview: svgAssetPath(file),
        nameEn: rename.newNameEn || nameEn,
        nameDe: nameDe || rename.newNameDe,
        keywords: rename.newKeywords || keywords,
        inCatalog,
        note: 'renamed',
      });
      continue;
    }

    rows.push({
      kind: 'normal',
      file,
      base,
      preview: svgAssetPath(file),
      nameEn,
      nameDe,
      keywords,
      inCatalog,
      note: '',
    });
  }

  return rows;
}

function renderRow(row) {
  const className =
    row.kind === 'renamed-old'
      ? 'row-renamed-old'
      : row.kind === 'renamed-new'
        ? 'row-renamed-new'
        : '';
  const preview =
    row.preview
      ? `<img src="${escapeHtml(row.preview)}" alt="" width="24" height="24" loading="lazy">`
      : '<span class="preview-missing" aria-hidden="true">—</span>';
  const meta =
    row.kind === 'renamed-old'
      ? '<span class="badge badge-old">old</span>'
      : row.kind === 'renamed-new'
        ? '<span class="badge badge-new">new</span>'
        : row.inCatalog === 'yes'
          ? ''
          : '<span class="badge">not in catalog</span>';

  return `<tr class="${className}" data-search="${escapeHtml(
    [row.file, row.base, row.nameEn, row.nameDe, row.keywords, row.kind].join(' ').toLowerCase()
  )}">
  <td class="preview">${preview}</td>
  <td class="filename"><code>${escapeHtml(row.file)}</code></td>
  <td>${escapeHtml(row.nameEn)}</td>
  <td>${escapeHtml(row.nameDe)}</td>
  <td class="keywords">${escapeHtml(row.keywords)}</td>
  <td class="meta">${meta}</td>
</tr>`;
}

function renderHtml(rows, renameCount) {
  const generatedAt = new Date().toISOString();
  const bodyRows = rows.map(renderRow).join('\n');
  const renameHint =
    renameCount > 0
      ? ` · ${renameCount} renames (gray = old, green = new)`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FromScratch icon overview</title>
  <style>
    :root {
      --border: #d0d0d0;
      --muted: #666;
      --bg: #fff;
      --row-alt: #f7f7f7;
      --sticky: #fafafa;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font: 14px/1.45 system-ui, sans-serif;
      background: var(--bg);
      color: #111;
    }
    h1 { margin: 0 0 8px; font-size: 22px; }
    .intro { margin: 0 0 16px; color: var(--muted); }
    .toolbar {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    input[type="search"] {
      min-width: 280px;
      padding: 8px 10px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font: inherit;
      background: #fff;
      color: #111;
    }
    .count { color: var(--muted); }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--border);
    }
    th, td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
      text-align: left;
    }
    th {
      position: sticky;
      top: 0;
      background: var(--sticky);
      z-index: 1;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    tbody tr:nth-child(even) { background: var(--row-alt); }
    .preview { width: 48px; text-align: center; }
    .preview img { display: block; margin: 0 auto; }
    .filename code { font-size: 13px; white-space: nowrap; }
    .keywords { color: var(--muted); font-size: 13px; }
    .meta { width: 120px; }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 999px;
      background: #f59e0b33;
      color: #b45309;
      font-size: 11px;
      white-space: nowrap;
    }
    tr.hidden { display: none; }
    tr.row-renamed-old { background: #eee; color: #888; }
    tr.row-renamed-old .preview img { opacity: 0.35; }
    tr.row-renamed-old .keywords { color: #999; }
    tr.row-renamed-new { background: #e8f5e9; }
    .preview-missing { color: #bbb; font-size: 18px; }
    .badge-old { background: #d1d5db; color: #4b5563; }
    .badge-new { background: #86efac; color: #166534; }
  </style>
</head>
<body>
  <h1>Icon overview</h1>
  <p class="intro">Generated ${escapeHtml(generatedAt)} · ${rows.filter((r) => r.kind !== 'renamed-old').length} icons${renameHint} · Open this file from the theme <code>assets/</code> folder so previews resolve via <code>icons/</code>.</p>
  <div class="toolbar">
    <input type="search" id="filter" placeholder="Filter by filename, label, keywords…" autofocus>
    <span class="count" id="count">${rows.length} shown</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Preview</th>
        <th>Filename</th>
        <th>Name (EN)</th>
        <th>Name (DE)</th>
        <th>Keywords</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
${bodyRows}
    </tbody>
  </table>
  <script>
    const filter = document.getElementById('filter');
    const count = document.getElementById('count');
    const rows = Array.from(document.querySelectorAll('tbody tr'));

    function updateFilter() {
      const query = filter.value.trim().toLowerCase();
      let visible = 0;

      rows.forEach((row) => {
        const haystack = row.getAttribute('data-search') || '';
        const show = !query || haystack.includes(query);
        row.classList.toggle('hidden', !show);
        if (show) visible++;
      });

      count.textContent = visible + ' shown';
    }

    filter.addEventListener('input', updateFilter);
  </script>
</body>
</html>
`;
}

const catalogSource =
  readFileSync(path.join(themeRoot, 'src/js/editor/icons/icon-catalog.js'), 'utf8') +
  '\n' +
  readFileSync(path.join(themeRoot, 'src/js/editor/icons/icons.generated.js'), 'utf8');
const phpSource = readFileSync(path.join(themeRoot, 'inc/editor-icons.php'), 'utf8');
const poSource = readFileSync(
  path.join(themeRoot, 'languages/icons/fromscratch-icons-de_DE.po'),
  'utf8'
);

const renames = loadRenames();
const catalog = parseCatalogIcons(catalogSource);
const labelsEn = parseEnglishLabels(phpSource);
const labelsDe = parseGermanLabels(poSource);
const svgFiles = collectSvgFiles(iconsDir);
const rows = buildRows(svgFiles, catalog, labelsEn, labelsDe, renames);
const html = renderHtml(rows, renames.length);

writeFileSync(outFile, html, 'utf8');
console.log(`Wrote ${rows.length} rows (${svgFiles.length} icons, ${renames.length} renames) to ${outFile}`);
