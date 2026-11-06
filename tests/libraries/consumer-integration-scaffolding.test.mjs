import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'NVTS-Shared-Core/libraries/registry/manifest.json'), 'utf8'));

test('registered Shared Core consumers declare lazy library integration entrypoints', () => {
  const consumers = new Map();
  for (const library of manifest.libraries) {
    for (const consumer of library.consumers ?? []) {
      if (consumer === 'NVTS-PhotoMania') continue;
      const ids = consumers.get(consumer) ?? [];
      ids.push(library.id);
      consumers.set(consumer, ids);
    }
  }
  for (const [consumer, ids] of consumers) {
    const appRoot = path.join(root, consumer);
    const packageJson = JSON.parse(fs.readFileSync(path.join(appRoot, 'package.json'), 'utf8'));
    assert.equal(packageJson.dependencies?.['@nvts/shared-core'], 'link:../NVTS-Shared-Core', `${consumer} must link Shared Core`);
    const integrationPath = path.join(appRoot, 'packages/integrations/shared-core');
    const integrationPackage = JSON.parse(fs.readFileSync(path.join(integrationPath, 'package.json'), 'utf8'));
    assert.equal(packageJson.dependencies?.[integrationPackage.name], 'link:packages/integrations/shared-core', `${consumer} root must expose its Shared Core adapter package`);
    assert.equal(integrationPackage.dependencies?.['@nvts/shared-core'], 'link:../../../../NVTS-Shared-Core', `${consumer} adapter must resolve the canonical Shared Core package`);
    const webPackage = JSON.parse(fs.readFileSync(path.join(appRoot, 'apps/web/package.json'), 'utf8'));
    assert.equal(webPackage.dependencies?.[integrationPackage.name], 'link:../../packages/integrations/shared-core', `${consumer} web app must link its adapter package`);
    assert.equal(webPackage.dependencies?.['@nvts/shared-core'], 'link:../../../NVTS-Shared-Core', `${consumer} web app must link Shared Core`);
    assert.equal(webPackage.dependencies?.['@nvts/shared-ui'], 'link:../../../NVTS-Shared-UI', `${consumer} web app must link Shared UI`);
    const entry = fs.readFileSync(path.join(integrationPath, 'src/index.ts'), 'utf8');
    for (const id of ids) assert.match(entry, new RegExp(`\\b${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replaceAll('-', '_')}\\s*:`), `${consumer} is missing ${id}`);
  }
});
