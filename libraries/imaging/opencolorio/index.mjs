let defaultRuntimePromise;

function requireFunction(module, name) {
  const value = module[name];
  if (typeof value !== "function") throw new Error(`OpenColorIO runtime is missing ${name}.`);
  return value.bind(module);
}

export function createOpenColorIOApi(module) {
  const version = requireFunction(module, "_nvts_ocio_version");
  const loadBuiltin = requireFunction(module, "_nvts_ocio_load_builtin_config");
  const count = requireFunction(module, "_nvts_ocio_color_space_count");
  const nameAt = requireFunction(module, "_nvts_ocio_color_space_name");
  const lastError = requireFunction(module, "_nvts_ocio_last_error");
  const processRGBA = requireFunction(module, "_nvts_ocio_process_rgba");
  const malloc = requireFunction(module, "_malloc");
  const free = requireFunction(module, "_free");

  function allocateString(value) {
    if (typeof module.stringToNewUTF8 !== "function") {
      throw new Error("OpenColorIO runtime does not expose stringToNewUTF8.");
    }
    return module.stringToNewUTF8(String(value));
  }

  function readString(pointer) {
    if (!pointer) return "";
    if (typeof module.UTF8ToString !== "function") {
      throw new Error("OpenColorIO runtime does not expose UTF8ToString.");
    }
    return module.UTF8ToString(pointer);
  }

  function getLastError() {
    return readString(lastError());
  }

  function loadBuiltinConfig(configName = "ocio://default") {
    const pointer = allocateString(configName);
    try {
      if (loadBuiltin(pointer) !== 1) throw new Error(getLastError() || "Could not load OpenColorIO built-in config.");
    } finally {
      free(pointer);
    }
  }

  function getColorSpaces() {
    const total = count();
    if (total === 0) {
      const message = getLastError();
      if (message) throw new Error(message);
    }
    return Array.from({ length: total }, (_, index) => readString(nameAt(index)));
  }

  function transformRGBA(pixels, { width, height, inputColorSpace, outputColorSpace }) {
    if (!(pixels instanceof Float32Array)) throw new TypeError("pixels must be a Float32Array.");
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
      throw new RangeError("width and height must be positive integers.");
    }
    if (pixels.length !== width * height * 4) throw new RangeError("RGBA pixel count does not match width × height × 4.");

    const inputPointer = allocateString(inputColorSpace);
    const outputPointer = allocateString(outputColorSpace);
    const pixelPointer = malloc(pixels.byteLength);
    if (!pixelPointer) {
      free(inputPointer);
      free(outputPointer);
      throw new Error("Could not allocate OpenColorIO pixel buffer.");
    }

    try {
      if (!module.HEAPF32) throw new Error("OpenColorIO runtime does not expose HEAPF32.");
      module.HEAPF32.set(pixels, pixelPointer >>> 2);
      const success = processRGBA(pixelPointer, width, height, pixels.length, inputPointer, outputPointer);
      if (success !== 1) throw new Error(getLastError() || "OpenColorIO color transform failed.");
      return module.HEAPF32.slice(pixelPointer >>> 2, (pixelPointer >>> 2) + pixels.length);
    } finally {
      free(pixelPointer);
      free(inputPointer);
      free(outputPointer);
    }
  }

  return Object.freeze({
    getVersion: () => readString(version()),
    loadBuiltinConfig,
    getColorSpaces,
    getLastError,
    transformRGBA,
    rawModule: module,
  });
}

export async function createOpenColorIO(options = {}) {
  const { default: factory } = await import("./vendor/OpenColorIO.bundle.js");
  if (typeof factory !== "function") throw new Error("OpenColorIO bundle does not expose its factory.");
  const module = await factory(options);
  const api = createOpenColorIOApi(module);
  if (options.builtinConfig !== false) api.loadBuiltinConfig(options.builtinConfig || "ocio://default");
  return api;
}

export function loadOpenColorIO() {
  defaultRuntimePromise ??= createOpenColorIO();
  return defaultRuntimePromise;
}
