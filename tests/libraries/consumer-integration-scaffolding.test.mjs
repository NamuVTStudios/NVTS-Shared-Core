import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'NVTS-Shared-Core/libraries/registry/manifest.json'), 'utf8'));

function collectConsumers() {
  const consumers = new Map();
  for (const library of manifest.libraries) {
    for (const consumer of library.consumers ?? []) {
      if (consumer === 'NVTS-PhotoMania') continue;
      const ids = consumers.get(consumer) ?? [];
      ids.push(library.id);
      consumers.set(consumer, ids);
    }
  }
  return consumers;
}

function assertConsumerIntegration(consumer, ids) {
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
  for (const id of ids) {
    const safeId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replaceAll('-', '_');
    assert.match(entry, new RegExp(`\\b${safeId}\\s*:`), `${consumer} is missing ${id}`);
  }
}

test('registered Shared Core consumers declare lazy library integration entrypoints when checked out', async (t) => {
  const consumers = collectConsumers();
  const skipped = [];
  let validated = 0;

  for (const [consumer, ids] of consumers) {
    const packagePath = path.join(root, consumer, 'package.json');
    if (!fs.existsSync(packagePath)) {
      skipped.push(consumer);
      continue;
    }

    await t.test(consumer, () => assertConsumerIntegration(consumer, ids));
    validated += 1;
  }

  if (skipped.length > 0) {
    t.diagnostic(`Validated ${validated} checked-out consumers; skipped ${skipped.length} repositories not present in this workspace: ${skipped.join(', ')}.`);
  }
  assert.ok(validated > 0 || skipped.length === consumers.size, 'Consumer integration check completed for the available workspace.');
});
