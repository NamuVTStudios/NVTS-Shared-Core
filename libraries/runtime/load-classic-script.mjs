const pendingScripts = new Map();

function readGlobal(scope, name) {
  return scope?.[name] ?? scope?.window?.[name] ?? scope?.self?.[name] ?? null;
}

/** Load a classic UMD/global script once and return the requested global export. */
export function loadClassicScript({ src, globalName, scope = globalThis, documentRef = scope.document, nonce, crossOrigin }) {
  const existingGlobal = readGlobal(scope, globalName);
  if (existingGlobal) return Promise.resolve(existingGlobal);

  if (!documentRef?.createElement) {
    return Promise.reject(new Error(`Cannot load ${globalName}: a browser document is required.`));
  }

  const url = new URL(src, documentRef.baseURI).href;
  const cached = pendingScripts.get(url);
  if (cached) return cached;

  const promise = new Promise((resolve, reject) => {
    const script = documentRef.createElement("script");
    script.async = true;
    script.src = url;
    script.dataset.nvtsLibrary = globalName;
    if (nonce) script.nonce = nonce;
    if (crossOrigin) script.crossOrigin = crossOrigin;

    script.onload = () => {
      const library = readGlobal(scope, globalName);
      if (!library) {
        pendingScripts.delete(url);
        reject(new Error(`The script loaded, but global '${globalName}' was not exposed: ${url}`));
        return;
      }
      resolve(library);
    };

    script.onerror = () => {
      pendingScripts.delete(url);
      reject(new Error(`Failed to load library script: ${url}`));
    };

    const parent = documentRef.head ?? documentRef.body ?? documentRef.documentElement;
    if (!parent) {
      pendingScripts.delete(url);
      reject(new Error("The document has no script insertion point."));
      return;
    }
    parent.appendChild(script);
  });

  pendingScripts.set(url, promise);
  return promise;
}
