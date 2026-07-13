/**
 * Touches main.scss so `sass --watch` rebuilds when files outside
 * its watcher scope change (e.g. acf/blocks partials).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themeDir = path.join(__dirname, '..');
const entry = path.join(themeDir, 'src/scss/main.scss');

const t = new Date();
try {
	fs.utimesSync(entry, t, t);
} catch (err) {
	process.stderr.write(`bump-scss-entries: ${entry}: ${err.message}\n`);
	process.exitCode = 1;
}
