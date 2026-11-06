export interface OpenImageIOImage {
  width: number;
  height: number;
  channels: number;
  pixels: Float32Array;
}

export interface OpenImageIOApi {
  getVersion(): string;
  getLastError(): string;
  readImage(input: Uint8Array | ArrayBuffer, extension: string): OpenImageIOImage;
  encodeImage(pixels: Float32Array, options: {
    width: number;
    height: number;
    channels: number;
    extension: string;
    compression?: string;
  }): Uint8Array;
  reset(): void;
  readonly capabilities: {
    readFormatsVerified: readonly string[];
    writeFormatsVerified: readonly string[];
    unsupportedVerified: readonly string[];
    status: "experimental";
  };
  readonly rawModule: Record<string, any>;
}

export function createOpenImageIO(options?: Record<string, unknown>): Promise<OpenImageIOApi>;
export function loadOpenImageIO(): Promise<OpenImageIOApi>;
