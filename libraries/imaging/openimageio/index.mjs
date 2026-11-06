import { loadClassicScript } from "../../runtime/load-classic-script.mjs";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function requiredFunction(module, name) {
  const fn = module[name];
  if (typeof fn !== "function") throw new Error(`OpenImageIO runtime is missing ${name}.`);
  return fn.bind(module);
}

export function createOpenImageIOApi(module) {
  if (!(module.HEAPU8 instanceof Uint8Array)) {
    throw new Error("OpenImageIO bundle does not expose HEAPU8. Use the NVTS-patched runtime or rebuild with HEAPU8 exported.");
  }

  const malloc = requiredFunction(module, "_malloc");
  const free = requiredFunction(module, "_free");
  const version = requiredFunction(module, "_nvts_oiio_version");
  const lastError = requiredFunction(module, "_nvts_oiio_last_error");
  const openImage = requiredFunction(module, "_nvts_oiio_open_image_memory");
  const imageWidth = requiredFunction(module, "_nvts_oiio_image_width");
  const imageHeight = requiredFunction(module, "_nvts_oiio_image_height");
  const imageChannels = requiredFunction(module, "_nvts_oiio_image_channels");
  const pixelFloatCount = requiredFunction(module, "_nvts_oiio_pixel_float_count");
  const imagePixels = requiredFunction(module, "_nvts_oiio_image_pixels");
  const encodeFloat = requiredFunction(module, "_nvts_oiio_encode_float_memory");
  const outputData = requiredFunction(module, "_nvts_oiio_output_data");
  const outputSize = requiredFunction(module, "_nvts_oiio_output_size");
  const reset = requiredFunction(module, "_nvts_oiio_reset");

  function heap() {
    const view = module.HEAPU8;
    if (!(view instanceof Uint8Array)) throw new Error("OpenImageIO HEAPU8 view is unavailable after memory growth.");
    return view;
  }

  function readCString(pointer) {
    if (!pointer) return "";
    const memory = heap();
    let end = pointer;
    while (end < memory.length && memory[end] !== 0) end += 1;
    return decoder.decode(memory.subarray(pointer, end));
  }

  function allocateCString(value) {
    const bytes = encoder.encode(`${String(value)}\0`);
    const pointer = malloc(bytes.length);
    if (!pointer) throw new Error("Could not allocate OpenImageIO string.");
    heap().set(bytes, pointer);
    return pointer;
  }

  function getLastError() {
    return readCString(lastError());
  }

  function getVersion() {
    return readCString(version());
  }

  function readImage(input, extension) {
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes.byteLength === 0) throw new RangeError("Image data is empty.");
    const dataPointer = malloc(bytes.byteLength);
    if (!dataPointer) throw new Error("Could not allocate OpenImageIO input buffer.");
    let extensionPointer = 0;

    try {
      extensionPointer = allocateCString(extension.startsWith(".") ? extension : `.${extension}`);
      heap().set(bytes, dataPointer);
      if (openImage(dataPointer, bytes.byteLength, extensionPointer) !== 1) {
        throw new Error(getLastError() || "OpenImageIO could not decode the image.");
      }

      const width = imageWidth();
      const height = imageHeight();
      const channels = imageChannels();
      const count = pixelFloatCount();
      const pointer = imagePixels();
      if (!pointer || count !== width * height * channels) throw new Error("OpenImageIO returned an invalid pixel buffer.");

      const pixelBytes = heap().slice(pointer, pointer + count * Float32Array.BYTES_PER_ELEMENT);
      const pixels = new Float32Array(pixelBytes.buffer, pixelBytes.byteOffset, count).slice();
      return { width, height, channels, pixels };
    } finally {
      reset();
      if (extensionPointer) free(extensionPointer);
      free(dataPointer);
    }
  }

  function encodeImage(pixels, { width, height, channels, extension, compression = "" }) {
    if (!(pixels instanceof Float32Array)) throw new TypeError("pixels must be a Float32Array.");
    if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
      throw new RangeError("width and height must be positive integers.");
    }
    if (!Number.isInteger(channels) || channels <= 0 || pixels.length !== width * height * channels) {
      throw new RangeError("Pixel buffer length does not match dimensions and channel count.");
    }

    const dataPointer = malloc(pixels.byteLength);
    if (!dataPointer) throw new Error("Could not allocate OpenImageIO pixel buffer.");
    let extensionPointer = 0;
    let compressionPointer = 0;

    try {
      extensionPointer = allocateCString(extension.startsWith(".") ? extension : `.${extension}`);
      compressionPointer = compression ? allocateCString(compression) : 0;
      heap().set(new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength), dataPointer);
      if (encodeFloat(dataPointer, width, height, channels, extensionPointer, compressionPointer) !== 1) {
        throw new Error(getLastError() || "OpenImageIO could not encode the image.");
      }
      const size = outputSize();
      const pointer = outputData();
      if (!pointer || size === 0) throw new Error("OpenImageIO returned an empty encoded image.");
      return heap().slice(pointer, pointer + size);
    } finally {
      reset();
      if (compressionPointer) free(compressionPointer);
      if (extensionPointer) free(extensionPointer);
      free(dataPointer);
    }
  }

  return Object.freeze({
    getVersion,
    getLastError,
    readImage,
    encodeImage,
    reset,
    capabilities: Object.freeze({
      readFormatsVerified: ["jpg", "tif", "bmp", "tga", "ppm"],
      writeFormatsVerified: ["jpg", "tif", "bmp", "tga"],
      unsupportedVerified: ["png"],
      status: "experimental",
    }),
    rawModule: module,
  });
}

let defaultRuntimePromise;

export async function createOpenImageIO(options = {}) {
  const scriptUrl = new URL("./vendor/OpenImageIO.bundle.js", import.meta.url);
  const factory = await loadClassicScript({ src: scriptUrl, globalName: "OpenImageIO" });
  if (typeof factory !== "function") throw new Error("OpenImageIO global is not an initialization factory.");
  const module = await factory(options);
  return createOpenImageIOApi(module);
}

export function loadOpenImageIO() {
  defaultRuntimePromise ??= createOpenImageIO();
  return defaultRuntimePromise;
}
