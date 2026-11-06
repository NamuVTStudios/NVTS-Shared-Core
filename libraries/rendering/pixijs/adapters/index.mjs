/** NVTS PixiJS adapter boundary. Use loadPixiJS() before creating an application. */
export function getPixiGlobal(scope = globalThis) {
  const engine = scope.PIXI ?? scope.window?.PIXI ?? scope.self?.PIXI;
  if (!engine) throw new Error("PixiJS is not loaded. Call loadPixiJS() first.");
  return engine;
}

export function createPixiApplication(options = {}, scope = globalThis) {
  const PIXI = getPixiGlobal(scope);
  return new PIXI.Application(options);
}
