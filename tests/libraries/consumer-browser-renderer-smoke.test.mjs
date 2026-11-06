import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const sharedCoreRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ecosystemRoot = resolve(sharedCoreRoot, '..');
const registry = JSON.parse(
    await readFile(resolve(sharedCoreRoot, 'libraries/registry/manifest.json'), 'utf8'),
);

const rendererConsumers = new Map([
    ['pixijs', new Set()],
    ['babylonjs', new Set()],
]);

for (const library of registry.libraries) {
    const consumers = rendererConsumers.get(library.id);
    if (!consumers) continue;

    for (const consumer of library.consumers ?? []) {
        consumers.add(consumer);
    }
}

const allConsumers = new Set([
    ...rendererConsumers.get('pixijs'),
    ...rendererConsumers.get('babylonjs'),
]);

test('every PixiJS and Babylon.js consumer exposes its browser smoke-test route', async () => {
    assert.equal(allConsumers.size, 13);

    for (const program of allConsumers) {
        const runnerPath = resolve(ecosystemRoot, program, 'apps/web/src/renderer-smoke-test.ts');
        const mainPath = resolve(ecosystemRoot, program, 'apps/web/src/main.ts');
        const [runner, main] = await Promise.all([
            readFile(runnerPath, 'utf8'),
            readFile(mainPath, 'utf8'),
        ]);

        assert.match(main, /nvts-renderer-smoke/,
            `${program} should activate the smoke test with the URL flag`);

        if (rendererConsumers.get('pixijs').has(program)) {
            assert.match(runner, /pixijs:/,
                `${program} should load PixiJS through its assigned integration`);
        }

        if (rendererConsumers.get('babylonjs').has(program)) {
            assert.match(runner, /babylonjs:/,
                `${program} should load Babylon.js through its assigned integration`);
        }
    }
});

test('programs outside the renderer registry do not receive renderer smoke-test files', async () => {
    const programsRoot = await import('node:fs/promises');
    const entries = await programsRoot.readdir(ecosystemRoot, { withFileTypes: true });
    const programDirectories = entries
        .filter((entry) => entry.isDirectory() && entry.name.startsWith('NVTS-'))
        .map((entry) => entry.name)
        .filter((name) => !['NVTS-Shared-Core', 'NVTS-Shared-UI', 'NVTS-Platform-API', 'NVTS-Launcher'].includes(name));

    for (const program of programDirectories) {
        if (allConsumers.has(program)) continue;

        await assert.rejects(
            readFile(resolve(ecosystemRoot, program, 'apps/web/src/renderer-smoke-test.ts'), 'utf8'),
            { code: 'ENOENT' },
            `${program} should not receive an unassigned renderer test`,
        );
    }
});
