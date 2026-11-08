# TDD — NVTS-Shared-Core

## 1. Technical purpose

Define an incremental, testable, and modular technical architecture for NVTS-Shared-Core. This document describes the target architecture; it does not claim that every module is already implemented.

## 2. Architecture and boundaries

- **Core crates:** small Rust crates with stable public contracts.
- **Bindings:** optional WebAssembly exports and generated TypeScript bindings.
- **Native consumers:** Rust APIs for Launcher and authorized local services.
- **Independence:** no mandatory DOM, browser, UI, or backend dependency.

## 3. Domain modules

- `nvts-types` — owns the corresponding domain contracts, validation, and use cases.
- `nvts-errors` — owns the corresponding domain contracts, validation, and use cases.
- `nvts-serialization` — owns the corresponding domain contracts, validation, and use cases.
- `nvts-formats` — owns the corresponding domain contracts, validation, and use cases.
- `nvts-migrations` — owns the corresponding domain contracts, validation, and use cases.
- `nvts-resource` — owns the corresponding domain contracts, validation, and use cases.
- `nvts-memory` — owns the corresponding domain contracts, validation, and use cases.
- `nvts-tasks` — owns the corresponding domain contracts, validation, and use cases.
- `nvts-compression` — owns the corresponding domain contracts, validation, and use cases.
- `nvts-integrity` — owns the corresponding domain contracts, validation, and use cases.
- `nvts-geometry` — owns the corresponding domain contracts, validation, and use cases.
- `nvts-wasm-bindings` — owns the corresponding domain contracts, validation, and use cases.

## 4. Contracts and ecosystem integration

- Consume `NVTS-Shared-Core` through pinned versions and documented public APIs.
- Consume `NVTS-Shared-UI` only for compatible icons, controls, and visual resources.
- Do not depend on private implementation details of another application.
- Isolate external formats, codecs, providers, and remote services behind adapters.
- Version public contracts and define compatibility rules before publishing them.

## 5. Data and file formats

- Define identifiers, version, metadata, resources, and validation rules for every native format.
- Separate persisted data from transient runtime state.
- Validate input before mutating the active project.
- Use deterministic migrations and fixtures for incompatible format changes.
- Never overwrite the original project until conversion or migration succeeds.

## 6. Performance and resource management

- Load specialized modules and resources on demand.
- Avoid bundling duplicate shared dependencies into application builds.
- Measure latency, peak memory, download size, initialization time, and first interaction.
- Use Workers or OffscreenCanvas when browser support and workload justify them.
- Provide progress and safe cancellation for long-running operations.

## 7. Security and privacy

- Do not store production secrets in client code or source control.
- Validate imported files, dimensions, paths, and external data.
- Limit memory, concurrency, and job duration for untrusted input.
- Keep account, payment, license, and entitlement enforcement in `NVTS-Platform-API`.
- Review dependency licenses, maintenance, and security advisories.

## 8. Testing strategy

- Unit tests for domain rules, pure algorithms, and validation.
- Integration tests for file formats, persistence, and external adapters.
- Migration and compatibility tests using representative fixtures.
- Contract tests for APIs and WebAssembly bindings.
- Regression tests for corrected defects.
- Browser functional tests for critical user workflows.
- Reproducible performance tests with representative project data.

## 9. Code quality and development workflow

- Apply SOLID and DRY without overengineering.
- Keep each function and method focused on a small number of responsibilities.
- Prefer guard clauses, pure functions, and small helpers over deeply nested control flow.
- Separate domain logic, application orchestration, adapters, and UI.
- Refactor incrementally and preserve behavior through regression tests.

## 10. Build and release

- Install dependencies from the committed lockfile.
- Run formatting, linting, type checking, tests, and production builds in CI.
- Build WebAssembly only when the repository contains modules that require it.
- Publish versioned artifacts with checksums and documented compatibility.
- Do not release production artifacts from unprotected branches.

## Renderer Integration Boundary

Vendored PixiJS and Babylon.js builds live under `libraries/rendering/`; thin ES module adapters validate that their global builds are loaded. Keep renderer dependencies outside the Rust workspace crates. Consumers must load the relevant vendor build and adapter explicitly.

## AppObject Architecture

- Keep `AppObject` free of DOM, renderer, persistence, and framework dependencies.
- Use optional capability interfaces (`Updatable`, `Renderable`, `Serializable`, and `Selectable`) instead of adding unrelated methods to the base class.
- Prefer composition and narrow interfaces over deep inheritance.
- Consumer repositories must depend on the versioned `@nvts/app-object` package from NVTS-Shared-Core; do not copy its source into application repositories.
- PhotoMania currently adapts `Panel`, `ToolsBase`, and `AppBase` to `PanelObject`, `ToolObject`, and `ApplicationObject`. Controllers, managers, DTOs, and pure processing functions are not forced into the hierarchy.
- In the combined ecosystem archive, PhotoMania resolves the package through a sibling `link:` dependency. For standalone repository releases, publish the package and replace the local link with its published semver version.

## Optional Third-Party Library Integration

- Keep browser vendor runtimes inside `libraries/` and expose thin adapters through package subpath exports.
- Do not initialize vendor modules as a side effect of importing `@nvts/shared-core` or `@nvts/shared-core/libraries`.
- Load ESM/WASM modules with lazy dynamic imports; load classic UMD/global bundles through the shared script loader.
- Keep external WASM files adjacent to their generated glue code. Filament's loader supplies an explicit WASM URL; Rapier's generated ESM modules resolve their adjacent WASM assets.
- Expose narrow adapters for OpenColorIO and OpenImageIO rather than making Emscripten internals part of consumer application code.
- OpenImageIO's imported glue bundle is patched to expose the current `HEAPU8` view. The patch is tracked under `libraries/imaging/openimageio/patches/`; PNG plugin support is not present in this build. Do not mark OpenImageIO production-ready until format coverage, memory growth, large images, and browser tests pass.
- Cannon.js (0.6.2), Phaser Box2D (1.0.0), and Rapier 0.21.0 are separate opt-in physics adapters. GameEngine and ProtoType may select Cannon for 3D and Box2D for 2D while retaining Rapier as an additional simulation backend; the application chooses an engine per scene/world rather than running all engines for the same bodies.
- The registry under `libraries/registry/` records upstream version, runtime packaging, validation state, and intended consumers.
- Vendor license obligations remain separate from the root MIT license. Retain vendor headers and complete the exact-version license and transitive third-party notice audit before public redistribution. GSAP 3.12.2 is under the GreenSock Standard License, not MIT.

## Library Validation

Run `pnpm test:libraries` from this repository to check the registry, Rapier 2D/3D WASM startup, Box2D ESM exports, and an OpenColorIO built-in-config RGBA transform. Browser-only UMD loaders and Filament rendering require browser integration tests. OpenImageIO's adapter currently has capability-gating tests; its format matrix is limited to the formats recorded in the registry and adapter.

### Bundled WebAssembly asset resolution

Filament resolves its sibling `filament.wasm` through the adapter-provided `wasmUrl`, authored with `new URL(..., import.meta.url)` so web bundlers can emit the asset. The Filament vendor glue includes a narrowly scoped `locateFile` hook for this URL. Rapier 2D and 3D receive their respective WASM URLs explicitly through `init()`, avoiding generated placeholder paths.

The library smoke tests validate module initialization and representative API calls. They do not replace browser-level rendering, GPU, codec/plugin, or end-to-end application tests. OpenImageIO remains experimental: its current adapter requires the tracked `HEAPU8` memory-view patch and the tested build does not include PNG I/O.

## Template Domain Model

- `packages/templates` owns the immutable `Template` value object, public template definition contract, validation, inheritance resolution, and per-program `TemplateRegistry`.
- `Template` is metadata-compatible with `AppObject` through `id`, `name`, and `kind`, but does not extend `AppObject`: templates are reusable catalog definitions and do not require runtime initialization/disposal lifecycle semantics.
- Shared presets are assigned explicitly to all 25 product IDs through `PROGRAM_TEMPLATE_ASSIGNMENTS`. The common catalogs cover social media, screen/video sizes, A4 print, animation, storyboards, and 2D/UV textures. Programs receive only the formats their product workflows need; audio-session, codec, engineering-sheet, and other domain-specific presets remain in their owning product until a genuinely reusable definition is identified.
- Product-specific presets remain in the owning application and are composed with assigned Shared Core presets through `createProgramTemplateRegistry`. PhotoMania currently keeps comic, manga, and manhwa page formats locally; its generic display, print, animation, storyboard, social, and texture presets are defined only in Shared Core.
- Do not duplicate a shared preset in an application package. Prefer adding a shared definition once and assigning its ID to the programs that require it.

