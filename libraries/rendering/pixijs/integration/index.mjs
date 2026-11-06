import { loadClassicScript } from "../../../runtime/load-classic-script.mjs";

/** Load the vendored PixiJS global build once and return PIXI. */
export function loadPixiJS(options = {}) {
  return loadClassicScript({
    src: options.src ?? new URL("../vendor/pixi.js", import.meta.url).href,
    globalName: "PIXI",
    ...options,
  });
}
