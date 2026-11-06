export interface FilamentRuntime {
  Engine: { create(canvas: HTMLCanvasElement, options?: { backend?: number }, config?: Record<string, unknown>): unknown; [key: string]: unknown };
  [key: string]: unknown;
}

export function createFilamentRuntime(options?: {
  assets?: string[];
  preinitializedWebGPUDevice?: object;
}): Promise<FilamentRuntime>;
export function loadFilament(): Promise<FilamentRuntime>;
