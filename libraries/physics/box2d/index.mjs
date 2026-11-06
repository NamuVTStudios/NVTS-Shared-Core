let modulePromise;

export function loadBox2D() {
  modulePromise ??= import("./vendor/box2D.js");
  return modulePromise;
}
