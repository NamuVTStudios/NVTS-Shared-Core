import { loadClassicScript } from "../../runtime/load-classic-script.mjs";

export function loadGSAP() {
  return loadClassicScript({
    src: new URL("./vendor/gsap.js", import.meta.url),
    globalName: "gsap",
  });
}
