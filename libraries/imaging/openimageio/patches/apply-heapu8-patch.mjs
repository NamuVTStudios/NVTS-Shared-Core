import { readFile, writeFile } from "node:fs/promises";

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  throw new Error("Usage: node apply-heapu8-patch.mjs <input-bundle.js> <output-bundle.js>");
}

const input = await readFile(inputPath);
const marker = Buffer.from("  HEAPU8 = new Uint8Array(b);");
const patch = Buffer.from('\n  Object.defineProperty(Module, "HEAPU8", { configurable: true, enumerable: true, get: () => HEAPU8 });');
const count = input.toString("latin1").split(marker.toString("latin1")).length - 1;

if (count !== 1) throw new Error(`Expected one HEAPU8 marker; found ${count}. No output written.`);
if (input.toString("latin1").includes('Object.defineProperty(Module, "HEAPU8"')) {
  await writeFile(outputPath, input);
  process.stdout.write("Bundle already contains the HEAPU8 exposure; copied unchanged.\\n");
} else {
  const index = input.indexOf(marker);
  const output = Buffer.concat([input.subarray(0, index + marker.length), patch, input.subarray(index + marker.length)]);
  await writeFile(outputPath, output);
  process.stdout.write("Applied the NVTS HEAPU8 runtime exposure patch.\\n");
}
