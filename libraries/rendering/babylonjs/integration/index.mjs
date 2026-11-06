import { loadClassicScript } from "../../../runtime/load-classic-script.mjs";

/** Load the vendored Babylon.js global build once and return BABYLON. */
export function loadBabylonJS(options = {}) {
  return loadClassicScript({
    src: options.src ?? new URL("../vendor/babylon.js", import.meta.url).href,
    globalName: "BABYLON",
    ...options,
  });
}
