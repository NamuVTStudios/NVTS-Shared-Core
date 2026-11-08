import { resolve } from 'node:path';

/**
 * Permit Vite's development server to serve the current app and its sibling
 * Shared Core / Shared UI packages when pnpm links resolve outside the app.
 */
export function getSharedPackageFsAllow(appRoot) {
    const programRoot = resolve(appRoot, '../..');
    const ecosystemRoot = resolve(programRoot, '..');

    return [
        appRoot,
        programRoot,
        resolve(ecosystemRoot, 'NVTS-Shared-Core'),
        resolve(ecosystemRoot, 'NVTS-Shared-UI'),
    ];
}
