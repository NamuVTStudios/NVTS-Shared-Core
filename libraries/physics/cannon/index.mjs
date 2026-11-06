import { loadClassicScript } from "../../runtime/load-classic-script.mjs";

export function loadCannon() {
  return loadClassicScript({
    src: new URL("./vendor/cannon.js", import.meta.url),
    globalName: "CANNON",
  });
}
