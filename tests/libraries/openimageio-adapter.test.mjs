import test from "node:test";
import assert from "node:assert/strict";
import { createOpenImageIOApi } from "../../libraries/imaging/openimageio/index.mjs";

test("OpenImageIO adapter rejects the unpatched runtime clearly", () => {
  assert.throws(
    () => createOpenImageIOApi({}),
    /does not expose HEAPU8/
  );
});

test("OpenImageIO adapter exposes verified format capabilities", () => {
  const memory = new Uint8Array(1024);
  const fn = () => 0;
  const module = {
    HEAPU8: memory,
    _malloc: () => 8,
    _free: fn,
    _nvts_oiio_version: fn,
    _nvts_oiio_last_error: fn,
    _nvts_oiio_open_image_memory: fn,
    _nvts_oiio_image_width: fn,
    _nvts_oiio_image_height: fn,
    _nvts_oiio_image_channels: fn,
    _nvts_oiio_pixel_float_count: fn,
    _nvts_oiio_image_pixels: fn,
    _nvts_oiio_encode_float_memory: fn,
    _nvts_oiio_output_data: fn,
    _nvts_oiio_output_size: fn,
    _nvts_oiio_reset: fn,
  };
  const api = createOpenImageIOApi(module);
  assert.equal(api.capabilities.status, "experimental");
  assert.deepEqual(api.capabilities.unsupportedVerified, ["png"]);
});


test("OpenImageIO patched runtime decodes PPM and encodes TGA", async () => {
  const { readFile, writeFile, mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { createRequire } = await import("node:module");
  const vendorUrl = new URL("../../libraries/imaging/openimageio/vendor/OpenImageIO.bundle.js", import.meta.url);
  const source = await readFile(vendorUrl);
  const directory = await mkdtemp(join(tmpdir(), "nvts-oiio-"));
  const cjsPath = join(directory, "OpenImageIO.bundle.cjs");

  try {
    await writeFile(cjsPath, source);
    const require = createRequire(import.meta.url);
    const factoryModule = require(cjsPath);
    const factory = factoryModule.default || factoryModule;
    const module = await factory();
    const api = createOpenImageIOApi(module);

    assert.equal(api.getVersion(), "3.2.2.0");
    const header = new TextEncoder().encode("P6\n1 1\n255\n");
    const ppm = new Uint8Array(header.length + 3);
    ppm.set(header);
    ppm.set([128, 64, 32], header.length);

    const decoded = api.readImage(ppm, "ppm");
    assert.deepEqual([decoded.width, decoded.height, decoded.channels], [1, 1, 3]);
    assert.ok(Math.abs(decoded.pixels[0] - 128 / 255) < 0.001);

    const tga = api.encodeImage(decoded.pixels, {
      width: 1,
      height: 1,
      channels: 3,
      extension: "tga",
    });
    assert.ok(tga.byteLength > 18);
    assert.deepEqual([...tga.slice(0, 3)], [0, 0, 2]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
