export interface OpenColorIOApi {
  getVersion(): string;
  loadBuiltinConfig(configName?: string): void;
  getColorSpaces(): string[];
  getLastError(): string;
  transformRGBA(pixels: Float32Array, options: {
    width: number;
    height: number;
    inputColorSpace: string;
    outputColorSpace: string;
  }): Float32Array;
  readonly rawModule: Record<string, any>;
}

export function createOpenColorIO(options?: Record<string, unknown>): Promise<OpenColorIOApi>;
export function loadOpenColorIO(): Promise<OpenColorIOApi>;
