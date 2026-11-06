# NVTS-Shared-Core

Reusable libraries for types, formats, resources, memory, tasks, serialization, validation, and common contracts across NVTS applications.

## Integrated third-party libraries

The registry currently contains 11 library runtimes: CanvasKit, Filament, OpenColorIO, OpenImageIO, Cannon.js, Box2D, Rapier 2D, Rapier 3D, GSAP, Babylon.js and PixiJS. This is not the full 22-library ecosystem inventory. Availability is recorded per library in `libraries/registry/manifest.json`; consumers must respect each entry's verification status. An adapter or loader existing does not mean the browser renderer, every codec, or every production workflow has been fully validated.

Applications consume only the libraries declared for them in the registry, through the public `@nvts/shared-core/libraries/*` exports. Libraries not present in this repository are not represented by placeholder exports.

## Status

The current repository includes 11 registered third-party library integrations with public subpath exports and runtime/integration tests. Their individual verification levels are recorded in `libraries/registry/manifest.json`; several integrations are smoke-tested or experimental rather than production-complete. The remaining entries in the 22-library ecosystem inventory are not installed here and are not represented by placeholder packages.

## Target users

Development teams working on official NVTS applications, tools, and ecosystem services.

## Platform

The current library integration surface combines JavaScript/TypeScript adapters with bundled or external WebAssembly runtimes. Native Rust crates and broader platform bindings remain separate roadmap work unless present and validated in a repository module.

## Architecture

Use a Rust workspace with small crates and explicit responsibilities. Expose browser bindings through wasm-bindgen or an equivalent WebAssembly interface, with generated and validated TypeScript bindings. Provide native Rust APIs for Launcher and local services. Avoid mandatory DOM, browser, or backend dependencies.

## Proposed modules

- `nvts-types`
- `nvts-errors`
- `nvts-serialization`
- `nvts-formats`
- `nvts-migrations`
- `nvts-resource`
- `nvts-memory`
- `nvts-tasks`
- `nvts-compression`
- `nvts-integrity`
- `nvts-geometry`
- `nvts-wasm-bindings`

## Main workflow

1. Define or extend a shared domain contract.
2. Implement and test the corresponding Rust crate.
3. Expose a minimal versioned API and generated bindings where needed.
4. Publish a compatible package and validate consumers against the contract.

## Documentation

- [GDD — Game Design Document](docs/GDD.md) — product scope, users, experience, and functional requirements.
- [TDD — Technical Design Document](docs/TDD.md) — architecture, modules, data, integration, and testing.



## License and repository

NVTS-authored source is intended to be distributed under MIT terms. Third-party assets and dependencies retain their own license notices in `libraries/THIRD_PARTY_NOTICES.txt`. This archive intentionally contains no files named `LICENSE`.

## NVTS development principles

- Apply SOLID and DRY where they improve clarity and maintainability; avoid unnecessary abstractions.
- Keep functions and methods small, with clear responsibilities.
- Avoid deeply nested control flow; prefer guard clauses and focused helper functions.
- Work incrementally, with tests and regression review after each meaningful change.
- Do not describe a feature as implemented until verifiable code and tests support that claim.


# Library-owned rendering integrations

Each rendering engine owns its vendor build, NVTS adapter boundary, and browser integration code inside its own `libraries/<library>/` directory. This keeps third-party assets adjacent to the code that loads and adapts them.

## PixiJS

- Vendor build: `libraries/rendering/pixijs/vendor/pixi.js` (PixiJS 8.20.0 as identified in the prior package inventory).
- NVTS adapter: `libraries/rendering/pixijs/adapters/index.mjs`.
- Browser loader: `libraries/rendering/pixijs/integration/index.mjs` (`loadPixiJS()`).
- Package entry: `@nvts/shared-core/libraries/pixijs`.

## Babylon.js

- Vendor build: `libraries/rendering/babylonjs/vendor/babylon.js` (exact upstream version remains unverified from the bundled file).
- NVTS adapter: `libraries/rendering/babylonjs/adapters/index.mjs`.
- Browser loader: `libraries/rendering/babylonjs/integration/index.mjs` (`loadBabylonJS()`).
- Package entry: `@nvts/shared-core/libraries/babylonjs`.

Both engines remain optional. Load the vendor build through the library integration function before creating an engine/application. Generic runtime utilities remain outside individual library folders.

## Shared application object model

The TypeScript package `packages/app-object` provides the framework-independent `@nvts/app-object` base class, lifecycle metadata, optional capability contracts, and specialized application/tool/panel/document/layer/plugin/command abstractions. Consumer applications should depend on this package rather than copying its implementation. The base remains deliberately small; composition and capability interfaces are preferred over deep inheritance.

## Optional Web Runtime Libraries

Shared Core owns the integration boundary and version registry for optional third-party browser libraries. Applications import only the subpaths they need; these modules are not initialized by importing the root package. Vendor assets are kept beside their adapters so external WASM paths remain deterministic.

Available subpaths include `@nvts/shared-core/libraries/canvaskit`, `filament`, `opencolorio`, `openimageio`, `cannon`, `box2d`, `rapier-2d`, `rapier-3d`, `gsap`, `babylonjs`, and `pixijs`. Use `@nvts/shared-core/libraries` to inspect the registry and intended application consumers.

The registry records validation status rather than implying that every adapter is production-ready. OpenImageIO is experimental: this imported build requires the tracked `HEAPU8` exposure patch and currently has verified JPG, TIFF, BMP, TGA, and PPM input plus JPG, TIFF, BMP, and TGA output; PNG support is not present in this build. Filament still requires browser/WebGL rendering validation. CanvasKit was smoke-tested with a browser-like runtime, while OpenColorIO 2.6.0 completed an actual built-in-config RGBA transform.

Third-party vendor code retains its own license; the intended MIT terms apply to NVTS-authored Shared Core code only. See `libraries/THIRD_PARTY_NOTICES.txt` and complete the upstream license-file audit before public redistribution.


Bundler asset resolution: Filament and Rapier 2D/3D now reference their adjacent WASM files through `new URL(..., import.meta.url)`. Filament's vendor glue uses the adapter-supplied `wasmUrl`; Rapier receives the explicit URL in `init()`. This is intended for bundlers such as Vite/Rollup to emit the binary assets instead of relying on generated placeholder paths.
