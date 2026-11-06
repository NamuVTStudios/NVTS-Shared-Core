export interface BabylonEngineOptions {
    [option: string]: unknown;
}

export interface BabylonEngineLike {
    runRenderLoop(callback: () => void): void;
    stopRenderLoop(callback?: () => void): void;
    resize(): void;
    dispose(): void;
}

export interface BabylonNamespace {
    Engine: new (canvas: HTMLCanvasElement, antialias?: boolean, options?: BabylonEngineOptions) => BabylonEngineLike;
    [name: string]: unknown;
}

export interface BabylonLoaderOptions {
    src?: string;
    scope?: typeof globalThis;
    documentRef?: Document;
    nonce?: string;
    crossOrigin?: string;
}

export declare function getBabylonGlobal(scope?: typeof globalThis): BabylonNamespace;
export declare function createBabylonEngine(
    canvas: HTMLCanvasElement,
    options?: BabylonEngineOptions,
    scope?: typeof globalThis,
): BabylonEngineLike;
export declare function loadBabylonJS(options?: BabylonLoaderOptions): Promise<BabylonNamespace>;
