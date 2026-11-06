import { loadClassicScript } from "../../runtime/load-classic-script.mjs";

let defaultRuntimePromise;

export async function createFilamentRuntime({ assets = [], preinitializedWebGPUDevice } = {}) {
  const scriptUrl = new URL("./vendor/filament.js", import.meta.url);
  const factory = await loadClassicScript({ src: scriptUrl, globalName: "Filament" });
  factory.wasmUrl = new URL("./vendor/filament.wasm", import.meta.url).href;
  if (typeof factory.init !== "function") {
    throw new Error("Filament bundle does not expose its init() bootstrap.");
  }

  if (preinitializedWebGPUDevice && !factory.initialized) {
    factory.preinitializedWebGPUDevice = preinitializedWebGPUDevice;
  }

  if (factory.isReady) return globalThis.Filament ?? factory;

  await new Promise((resolve, reject) => {
    try {
      factory.init(assets, resolve);
    } catch (error) {
      reject(error);
    }
  });

  const runtime = globalThis.Filament ?? factory;
  if (typeof runtime.Engine?.create !== "function") {
    throw new Error("Filament initialized without exposing Engine.create(). Check JS/WASM version compatibility.");
  }
  return runtime;
}

export function loadFilament() {
  defaultRuntimePromise ??= createFilamentRuntime();
  return defaultRuntimePromise;
}
