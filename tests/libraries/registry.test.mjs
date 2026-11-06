import test from "node:test";
import assert from "node:assert/strict";
import { getLibrary, getLibrariesForProgram, listLibraries } from "../../libraries/registry/index.mjs";

test("library registry contains the imported engines", () => {
  const ids = listLibraries().map(({ id }) => id);
  for (const id of ["canvaskit", "filament", "opencolorio", "openimageio", "cannon", "box2d", "rapier-2d", "rapier-3d", "gsap", "babylonjs", "pixijs"]) {
    assert.ok(ids.includes(id), `Missing registry entry: ${id}`);
  }
});

test("GameEngine resolves the selected physics and renderer modules", () => {
  const ids = getLibrariesForProgram("NVTS-GameEngine").map(({ id }) => id);
  assert.ok(ids.includes("cannon"));
  assert.ok(ids.includes("box2d"));
  assert.ok(ids.includes("rapier-2d"));
  assert.ok(ids.includes("rapier-3d"));
  assert.ok(ids.includes("babylonjs"));
  assert.ok(ids.includes("pixijs"));
});

test("OpenImageIO is explicitly marked experimental", () => {
  assert.equal(getLibrary("openimageio")?.status, "experimental-memory-view-patch-and-limited-formats");
});
