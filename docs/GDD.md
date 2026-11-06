# GDD — NVTS-Shared-Core

## 1. Product vision

**Category:** Shared Ecosystem Technology Core  
**Status:** Initial planning and product definition.

Reusable libraries for types, formats, resources, memory, tasks, serialization, validation, and common contracts across NVTS applications.

This document defines the intended product scope. Features are design goals unless their implementation and tests are present in the source code; this document is not a promise of current availability.

## 2. Target audience

Development teams working on official NVTS applications, tools, and ecosystem services.

## 3. Product goals

1. Provide a coherent, professional workflow for the product domain.
2. Keep projects recoverable, portable, and versioned.
3. Integrate with the NVTS ecosystem without unnecessary coupling to other applications.
4. Provide an accessible experience across supported browsers and screen sizes.
5. Keep core workflows local where browser capabilities and device resources allow it.

## 4. Functional scope

- `nvts-types` — provides the product capabilities associated with nvts types.
- `nvts-errors` — provides the product capabilities associated with nvts errors.
- `nvts-serialization` — provides the product capabilities associated with nvts serialization.
- `nvts-formats` — provides the product capabilities associated with nvts formats.
- `nvts-migrations` — provides the product capabilities associated with nvts migrations.
- `nvts-resource` — provides the product capabilities associated with nvts resource.
- `nvts-memory` — provides the product capabilities associated with nvts memory.
- `nvts-tasks` — provides the product capabilities associated with nvts tasks.
- `nvts-compression` — provides the product capabilities associated with nvts compression.
- `nvts-integrity` — provides the product capabilities associated with nvts integrity.
- `nvts-geometry` — provides the product capabilities associated with nvts geometry.
- `nvts-wasm-bindings` — provides the product capabilities associated with nvts wasm bindings.

## 5. Primary workflow

1. Define or extend a shared domain contract.
2. Implement and test the corresponding Rust crate.
3. Expose a minimal versioned API and generated bindings where needed.
4. Publish a compatible package and validate consumers against the contract.

## 6. Project and document model

Each project must have a stable identity, explicit metadata, and a versioned document format. External resources must be locatable or relinkable where the format supports it. Content-changing operations should provide history, recovery, and validation appropriate to the product domain.

## 7. User experience and accessibility

- Keep the application identity and workflow specific to its domain while reusing consistent NVTS interaction patterns.
- Support keyboard navigation, visible focus, clear labels, and sufficient contrast.
- Expose progress, cancellation when safe, and recoverable error messages for long-running operations.
- Avoid hidden state changes; make destructive and irreversible actions explicit.

## 8. Non-goals and constraints

- Reproducing another product's interface or undocumented behavior literally.
- Claiming that planned features are implemented without code and test evidence.
- Requiring unrelated applications or optional ecosystem services for core local workflows.
- Promising full compatibility with proprietary third-party formats unless validated by interoperability tests.

## 9. Acceptance criteria

- Primary workflows can be completed without blocking errors.
- Projects can be saved, opened, and validated against their declared format version.
- Critical operations have automated tests and browser-level functional checks.
- Shared NVTS contracts are consumed through documented, versioned APIs.
- Accessibility, compatibility, and recovery behavior are checked before a stable release.

## 10. Suggested delivery phases

1. Domain model, project format, and working prototype.
2. Core creation and editing workflows.
3. Save, recovery, history, and export.
4. Performance, accessibility, and compatibility.
5. Ecosystem integration where required.
6. Beta validation and stabilization.

## Shared Rendering Backends

NVTS Shared Core exposes optional PixiJS (2D) and Babylon.js (3D) rendering backends through `libraries/rendering/babylonjs/` and `libraries/rendering/pixijs/`. Domain logic and document models remain independent of these engines.

## Shared Application Object Model

NVTS applications may reuse the framework-independent `@nvts/app-object` model from NVTS-Shared-Core. The model provides a minimal lifecycle and metadata base plus specialized application, tool, panel, document, layer, plugin, and command abstractions. Applications must not force every class to inherit from `AppObject`; data records, pure functions, services, adapters, and framework components remain independent when inheritance does not add value.

## Optional Web Runtime Libraries

Shared Core provides optional, independently imported adapters for CanvasKit, Filament, OpenColorIO, OpenImageIO, Cannon.js, Phaser Box2D, Rapier 2D/3D, and GSAP. Existing Babylon.js and PixiJS rendering adapters remain available. Programs opt into only the modules required by their workflows; Shared Core does not eagerly load every vendor runtime.

The registry maps library capabilities to intended NVTS consumers and records validation state. OpenImageIO remains experimental until its runtime memory access and required format plugins are completed.
