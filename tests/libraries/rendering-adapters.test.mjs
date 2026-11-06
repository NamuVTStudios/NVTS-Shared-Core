import test from "node:test";
import assert from "node:assert/strict";
import { createPixiApplication, getPixiGlobal } from "../../libraries/rendering/pixijs/adapters/index.mjs";
import { createBabylonEngine, getBabylonGlobal } from "../../libraries/rendering/babylonjs/adapters/index.mjs";
import { loadPixiJS } from "../../libraries/rendering/pixijs/integration/index.mjs";
import { loadBabylonJS } from "../../libraries/rendering/babylonjs/integration/index.mjs";

test("PixiJS adapter resolves its global and creates an application", () => {
  class Application { constructor(options) { this.options = options; } }
  const scope = { PIXI: { Application } };
  assert.equal(getPixiGlobal(scope).Application, Application);
  assert.deepEqual(createPixiApplication({ antialias: true }, scope).options, { antialias: true });
});

test("Babylon.js adapter resolves its global and creates an engine", () => {
  class Engine { constructor(canvas, antialias, options) { Object.assign(this, { canvas, antialias, options }); } }
  const scope = { BABYLON: { Engine } };
  const engine = createBabylonEngine("canvas", { stencil: true }, scope);
  assert.equal(getBabylonGlobal(scope).Engine, Engine);
  assert.equal(engine.canvas, "canvas");
  assert.equal(engine.antialias, true);
  assert.deepEqual(engine.options, { stencil: true });
});

test("integration entry points expose explicit loaders", () => {
  assert.equal(typeof loadPixiJS, "function");
  assert.equal(typeof loadBabylonJS, "function");
});
