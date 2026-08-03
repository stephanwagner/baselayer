/**
 * Touches main/admin SCSS entrypoints so `sass --watch` rebuilds when files outside
 * its watcher scope change (e.g. acf/blocks partials).
 */

const fs = require('fs');
const path = require('path');
const { themeDir } = require('./config.cjs');

const root = path.join(__dirname, '..');
const entries = [
  path.join(root, themeDir, 'src/scss/main.scss'),
  path.join(root, themeDir, 'src/scss/admin.scss'),
  path.join(root, themeDir, 'src/scss/blocks-baselayer.scss'),
  path.join(root, themeDir, 'src/scss/blocks-acf.scss'),
  path.join(root, themeDir, 'src/scss/blocks-baselayer-editor.scss'),
  path.join(root, themeDir, 'src/scss/blocks-acf-editor.scss'),
];

const t = new Date();
for (const file of entries) {
  try {
    fs.utimesSync(file, t, t);
  } catch (err) {
    process.stderr.write(`bump-scss-entries: ${file}: ${err.message}\n`);
    process.exitCode = 1;
  }
}
