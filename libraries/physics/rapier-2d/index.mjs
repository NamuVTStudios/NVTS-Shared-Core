let modulePromise;

export function loadRapier2D() {
  modulePromise ??= import("./vendor/Rapier2D.bundle.js").then(async (module) => {
    if (typeof module.init !== "function") throw new Error("Rapier 2D bundle does not expose init().");
    const wasmUrl = new URL("./vendor/rapier_wasm2d_bg.wasm", import.meta.url);
    await module.init(wasmUrl);
    return module;
  });
  return modulePromise;
}
