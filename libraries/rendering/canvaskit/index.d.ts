export interface CanvasKitRuntime {
  MakeSurface(width: number, height: number): unknown;
  MakeCanvas(width: number, height: number): unknown;
  [key: string]: unknown;
}

export function createCanvasKit(options?: Record<string, unknown>): Promise<CanvasKitRuntime>;
export function loadCanvasKit(): Promise<CanvasKitRuntime>;
