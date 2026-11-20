import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
import { spawnSync } from 'node:child_process';
const root = path.resolve(here, '../..');
const build = fs.mkdtempSync(path.join(here, '.build-'));
let result;
try {
  result = spawnSync(process.execPath, [path.join(root,'node_modules/typescript/bin/tsc'), '-p', path.join(here, 'tsconfig.json'), '--outDir', build], { cwd: root, stdio: 'inherit' });
  if (result.status === 0) result = spawnSync(process.execPath, ['--test', path.join(here, 'observations.test.mjs')], {
    cwd: root, stdio: 'inherit', env: { ...process.env, RADAR_TEST_BUILD: build }
  });
} finally { fs.rmSync(build, { recursive: true, force: true }); }
process.exit(result?.status ?? 1);
