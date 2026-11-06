let defaultRuntimePromise;

/** Create an independent CanvasKit runtime. Its WASM is embedded in the vendor bundle. */
export async function createCanvasKit(options = {}) {
  const { default: factory } = await import("./vendor/CanvasKit.bundle.js");
  if (typeof factory !== "function") throw new Error("CanvasKit bundle does not expose its factory.");
  return factory(options);
}

/** Load the page-wide CanvasKit singleton. */
export function loadCanvasKit() {
  defaultRuntimePromise ??= createCanvasKit();
  return defaultRuntimePromise;
}
