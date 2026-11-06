export interface PixiSmokeTestModule {
    loadPixiJS(): Promise<any>;
    createPixiApplication(options?: Record<string, unknown>): any;
}

export interface BabylonSmokeTestModule {
    loadBabylonJS(): Promise<any>;
    createBabylonEngine(canvas: HTMLCanvasElement, options?: Record<string, unknown>): any;
}

export interface RendererSmokeTestLoaders {
    pixijs?: () => Promise<PixiSmokeTestModule>;
    babylonjs?: () => Promise<BabylonSmokeTestModule>;
}

export interface RendererSmokeTestOptions {
    documentRef?: Document;
    windowRef?: Window;
}

export interface RendererSmokeTestHandle {
    dispose(): void;
}

export declare function mountRendererSmokeTest(
    loaders: RendererSmokeTestLoaders,
    options?: RendererSmokeTestOptions,
): Promise<RendererSmokeTestHandle>;
