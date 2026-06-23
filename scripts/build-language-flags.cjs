/**
 * Build assets/flags/iso-639/ from assets/flags/alpha-2/ using data/languages/flag-map.json.
 *
 * Usage: node scripts/build-language-flags.cjs
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mapPath = path.join(root, 'theme/fromscratch/data/languages/flag-map.json');
const sourceDir = path.join(root, 'theme/fromscratch/assets/flags/alpha-2');
const targetDir = path.join(root, 'theme/fromscratch/assets/flags/iso-639');

const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

function resolveSource(lang) {
	const candidates = [map[lang], lang].filter(Boolean);
	for (const code of candidates) {
		const file = path.join(sourceDir, `${code}.svg`);
		if (fs.existsSync(file)) {
			return code;
		}
	}
	return null;
}

if (!fs.existsSync(targetDir)) {
	fs.mkdirSync(targetDir, { recursive: true });
}

const langs = Object.keys(map).sort();
let copied = 0;
let missing = [];

for (const lang of langs) {
	const sourceCode = resolveSource(lang);
	if (!sourceCode) {
		missing.push(lang);
		continue;
	}
	fs.copyFileSync(
		path.join(sourceDir, `${sourceCode}.svg`),
		path.join(targetDir, `${lang}.svg`)
	);
	copied += 1;
}

console.log(`Copied ${copied} flags to assets/flags/iso-639/`);
if (missing.length) {
	console.warn('Missing source flags for:', missing.join(', '));
	process.exitCode = 1;
}
