import { cp, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

// Deploys the built bundle to your HA `/config/www/` share so panel_custom
// can serve it. Default targets the author's setup; set REALM_DEPLOY_TARGET
// to override for your own HA install (any path your machine can write to).
const TARGET_DIR = process.env.REALM_DEPLOY_TARGET || '\\\\homeassistant.local\\config\\www\\realm';
const sep = TARGET_DIR.includes('\\') ? '\\' : '/';
const TARGET_FILE = `${TARGET_DIR}${sep}realm.js`;
const SOURCE = resolve('dist', 'realm.js');

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(SOURCE))) {
  console.error(`Build artifact missing: ${SOURCE}`);
  console.error('Run `npm run build` first (or use `npm run deploy` to do both).');
  process.exit(1);
}

await mkdir(TARGET_DIR, { recursive: true });
await cp(SOURCE, TARGET_FILE);

// Also copy the sourcemap so devtools work when poking at the deployed bundle.
const SOURCEMAP = `${SOURCE}.map`;
if (await exists(SOURCEMAP)) {
  await cp(SOURCEMAP, `${TARGET_FILE}.map`);
}

console.log(`Deployed: ${SOURCE} -> ${TARGET_FILE}`);
