import manifest from "./manifest.json" with { type: "json" };

const entries = new Map(manifest.libraries.map((library) => [library.id, Object.freeze(library)]));

export const NVTS_LIBRARY_MANIFEST = manifest;

export function listLibraries() {
  return manifest.libraries.slice();
}

export function getLibrary(id) {
  return entries.get(id) ?? null;
}

export function getLibrariesForProgram(programName) {
  return manifest.libraries.filter((library) => library.consumers.includes(programName));
}
