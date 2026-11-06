export interface PixiApplicationOptions {
  width?: number;
  height?: number;
  background?: number | string;
  antialias?: boolean;
  resolution?: number;
  autoDensity?: boolean;
  [key: string]: unknown;
}

export interface PixiApplication {
  init(options?: PixiApplicationOptions): Promise<void>;
  destroy(options?: unknown, options2?: unknown): void;
  canvas: HTMLCanvasElement;
  renderer: unknown;
  stage: unknown;
}

export interface PixiNamespace {
  Application: new (options?: PixiApplicationOptions) => PixiApplication;
  [key: string]: unknown;
}

export function getPixiGlobal(scope?: typeof globalThis): PixiNamespace;
export function createPixiApplication(options?: PixiApplicationOptions, scope?: typeof globalThis): PixiApplication;
export function loadPixiJS(options?: { src?: string; scope?: typeof globalThis; documentRef?: Document; nonce?: string; crossOrigin?: string }): Promise<PixiNamespace>;
