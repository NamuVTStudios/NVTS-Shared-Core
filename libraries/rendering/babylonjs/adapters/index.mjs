/** NVTS Babylon.js adapter boundary. Use loadBabylonJS() before creating an engine. */
export function getBabylonGlobal(scope = globalThis) {
  const engine = scope.BABYLON ?? scope.window?.BABYLON ?? scope.self?.BABYLON;
  if (!engine) throw new Error("Babylon.js is not loaded. Call loadBabylonJS() first.");
  return engine;
}

export function createBabylonEngine(canvas, options = {}, scope = globalThis) {
  const BABYLON = getBabylonGlobal(scope);
  return new BABYLON.Engine(canvas, true, options);
}
