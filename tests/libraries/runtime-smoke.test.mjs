import test from "node:test";
import assert from "node:assert/strict";

import { loadRapier2D } from "../../libraries/physics/rapier-2d/index.mjs";
import { loadRapier3D } from "../../libraries/physics/rapier-3d/index.mjs";
import { loadBox2D } from "../../libraries/physics/box2d/index.mjs";
import { createOpenColorIO } from "../../libraries/imaging/opencolorio/index.mjs";

test("Rapier 2D initializes its WASM and creates a world", async () => {
  const rapier = await loadRapier2D();
  const world = new rapier.World({ x: 0, y: -9.81 });
  assert.equal(typeof rapier.version, "function");
  assert.equal(typeof world.step, "function");
  world.free?.();
});

test("Rapier 3D initializes its WASM and creates a world", async () => {
  const rapier = await loadRapier3D();
  const world = new rapier.World({ x: 0, y: -9.81, z: 0 });
  assert.equal(typeof rapier.version, "function");
  assert.equal(typeof world.step, "function");
  world.free?.();
});

test("Box2D exposes its ESM API", async () => {
  const box2d = await loadBox2D();
  assert.equal(typeof box2d.b2WorldDef, "function");
  assert.equal(typeof box2d.b2CreateWorld, "function");
  assert.ok(Object.keys(box2d).length > 100);
});

test("OpenColorIO loads its embedded WASM and transforms one RGBA pixel", async () => {
  const ocio = await createOpenColorIO();
  assert.equal(ocio.getVersion(), "2.6.0");
  const colorSpaces = ocio.getColorSpaces();
  assert.ok(colorSpaces.includes("Linear Rec.709 (sRGB)"));
  assert.ok(colorSpaces.includes("sRGB Encoded Rec.709 (sRGB)"));
  const result = ocio.transformRGBA(new Float32Array([0.18, 0.18, 0.18, 1]), {
    width: 1,
    height: 1,
    inputColorSpace: "Linear Rec.709 (sRGB)",
    outputColorSpace: "sRGB Encoded Rec.709 (sRGB)",
  });
  assert.equal(result.length, 4);
  assert.ok(result[0] > 0.4 && result[0] < 0.5);
  assert.equal(result[3], 1);
});


test("CanvasKit initializes its embedded WASM in browser mode", async () => {
  const { execFileSync } = await import("node:child_process");
  const moduleUrl = new URL("../../libraries/rendering/canvaskit/index.mjs", import.meta.url).href;
  const script = `
    globalThis.window = {};
    globalThis.process = undefined;
    const { createCanvasKit } = await import(${JSON.stringify(moduleUrl)});
    const canvasKit = await createCanvasKit();
    const surface = canvasKit.MakeSurface(8, 8);
    if (!surface) throw new Error("CanvasKit did not create a surface");
    surface.flush();
    surface.delete?.();
    console.log("CANVASKIT_EMBEDDED_WASM_OK");
  `;
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8" });
  assert.match(output, /CANVASKIT_EMBEDDED_WASM_OK/);
});


test("Filament bootstrap loads its WASM and installs Engine.create", async () => {
  const { execFileSync } = await import("node:child_process");
  const moduleUrl = new URL("../../libraries/rendering/filament/index.mjs", import.meta.url).href;
  const script = `
    import fs from "node:fs";
    import vm from "node:vm";
    import path from "node:path";
    import { createRequire } from "node:module";
    import { fileURLToPath } from "node:url";
    globalThis.require = createRequire(import.meta.url);
    globalThis.document = {
      baseURI: new URL("./", import.meta.url).href,
      createElement() { return { dataset: {} }; },
      head: { appendChild(element) {
        const file = fileURLToPath(element.src);
        globalThis.document.currentScript = element;
        globalThis.__dirname = path.dirname(file);
        vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file });
        globalThis.document.currentScript = null;
        element.onload();
      } }
    };
    const { loadFilament } = await import(${JSON.stringify(moduleUrl)});
    const filament = await loadFilament();
    if (typeof filament.Engine?.create !== "function") throw new Error("Filament Engine.create is missing");
    console.log("FILAMENT_WASM_BOOTSTRAP_OK");
  `;
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8" });
  assert.match(output, /FILAMENT_WASM_BOOTSTRAP_OK/);
});


test("Cannon.js adapter loads the bundled global engine", async () => {
  const { execFileSync } = await import("node:child_process");
  const moduleUrl = new URL("../../libraries/physics/cannon/index.mjs", import.meta.url).href;
  const script = `
    import fs from "node:fs";
    import vm from "node:vm";
    import { fileURLToPath } from "node:url";
    globalThis.document = {
      baseURI: new URL("./", import.meta.url).href,
      createElement() { return { dataset: {} }; },
      head: { appendChild(element) {
        const file = fileURLToPath(element.src);
        vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file });
        element.onload();
      } }
    };
    const { loadCannon } = await import(${JSON.stringify(moduleUrl)});
    const cannon = await loadCannon();
    if (cannon.version !== "0.6.2" || typeof cannon.World !== "function") throw new Error("Unexpected Cannon API");
    console.log("CANNON_ADAPTER_OK");
  `;
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8" });
  assert.match(output, /CANNON_ADAPTER_OK/);
});


test("GSAP adapter exposes the tween and timeline APIs", async () => {
  const { execFileSync } = await import("node:child_process");
  const moduleUrl = new URL("../../libraries/animation/gsap/index.mjs", import.meta.url).href;
  const script = `
    import fs from "node:fs";
    import vm from "node:vm";
    import { fileURLToPath } from "node:url";
    globalThis.window = globalThis;
    globalThis.self = globalThis;
    globalThis.requestAnimationFrame = () => 1;
    globalThis.cancelAnimationFrame = () => {};
    globalThis.document = {
      baseURI: new URL("./", import.meta.url).href,
      createElement() { return { dataset: {}, style: {}, setAttribute() {}, getAttribute() { return null; } }; },
      head: { appendChild(element) {
        const file = fileURLToPath(element.src);
        vm.runInThisContext(fs.readFileSync(file, "utf8"), { filename: file });
        element.onload();
      } }
    };
    const { loadGSAP } = await import(${JSON.stringify(moduleUrl)});
    const gsap = await loadGSAP();
    if (gsap.version !== "3.12.2" || typeof gsap.to !== "function" || typeof gsap.timeline !== "function") {
      throw new Error("Unexpected GSAP API or version");
    }
    console.log("GSAP_ADAPTER_OK");
  `;
  const output = execFileSync(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8" });
  assert.match(output, /GSAP_ADAPTER_OK/);
});
