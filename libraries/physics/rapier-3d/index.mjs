let modulePromise;

export function loadRapier3D() {
  modulePromise ??= import("./vendor/Rapier3D.bundle.js").then(async (module) => {
    if (typeof module.init !== "function") throw new Error("Rapier 3D bundle does not expose init().");
    const wasmUrl = new URL("./vendor/rapier_wasm3d_bg.wasm", import.meta.url);
    await module.init(wasmUrl);
    return module;
  });
  return modulePromise;
}
