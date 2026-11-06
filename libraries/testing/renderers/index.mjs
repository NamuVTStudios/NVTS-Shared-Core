const PANEL_STYLE = {
    background: 'var(--nvts-surface, #20232c)',
    color: 'var(--nvts-text, #eceef3)',
    border: '1px solid var(--nvts-border, #3b414f)',
    borderRadius: '12px',
    boxShadow: '0 16px 48px rgb(0 0 0 / 32%)',
    fontFamily: 'var(--nvts-font-family, system-ui, sans-serif)',
};

function createElement(documentRef, tagName, styles = {}) {
    const element = documentRef.createElement(tagName);
    Object.assign(element.style, styles);
    return element;
}

function createRendererCard(documentRef, title) {
    const card = createElement(documentRef, 'article', {
        minWidth: '0',
        padding: '16px',
        background: 'var(--nvts-surface-raised, #282c37)',
        border: '1px solid var(--nvts-border, #3b414f)',
        borderRadius: '10px',
    });
    const heading = createElement(documentRef, 'h2', {
        margin: '0 0 8px',
        fontSize: '18px',
        fontWeight: '650',
    });
    const status = createElement(documentRef, 'p', {
        margin: '0 0 12px',
        minHeight: '20px',
        color: 'var(--nvts-text-muted, #a2a9b8)',
        fontSize: '13px',
    });
    const stage = createElement(documentRef, 'div', {
        width: '100%',
        minHeight: '260px',
        overflow: 'hidden',
        background: '#101827',
        borderRadius: '8px',
    });

    heading.textContent = title;
    status.textContent = 'Esperando inicialización…';
    card.append(heading, status, stage);

    return { card, status, stage };
}

function setStatus(status, label, isError = false) {
    status.textContent = label;
    status.style.color = isError ? '#ef7777' : '#36b37e';
}

async function runPixiTest(documentRef, card, loaders, cleanupActions) {
    let application;

    try {
        card.status.textContent = 'Cargando PixiJS desde NVTS-Shared-Core…';
        const library = await loaders.pixijs();
        const PIXI = await library.loadPixiJS();

        application = library.createPixiApplication();
        await application.init({
            width: 640,
            height: 320,
            background: '#101827',
            antialias: true,
            autoDensity: true,
            resolution: Math.min(globalThis.devicePixelRatio || 1, 2),
        });

        const graphics = new PIXI.Graphics();
        graphics
            .roundRect(48, 58, 190, 120, 18)
            .fill({ color: 0x38bdf8 });
        graphics
            .circle(390, 122, 58)
            .fill({ color: 0xf59e0b });
        graphics
            .rect(285, 205, 180, 12)
            .fill({ color: 0x36b37e });
        application.stage.addChild(graphics);

        const animate = (ticker) => {
            graphics.rotation += 0.002 * ticker.deltaTime;
        };
        application.ticker.add(animate);

        application.canvas.style.display = 'block';
        application.canvas.style.width = '100%';
        application.canvas.style.height = 'auto';
        card.stage.replaceChildren(application.canvas);

        cleanupActions.push(() => {
            application?.ticker?.remove(animate);
            application?.destroy();
        });

        setStatus(card.status, 'PASS · PixiJS cargado y renderizando un canvas real.');
    } catch (error) {
        application?.destroy?.();
        setStatus(card.status, `FAIL · ${error instanceof Error ? error.message : String(error)}`, true);
    }
}

async function runBabylonTest(documentRef, windowRef, card, loaders, cleanupActions) {
    let engine;
    let scene;
    let renderScene;
    let handleResize;

    try {
        card.status.textContent = 'Cargando Babylon.js desde NVTS-Shared-Core…';
        const library = await loaders.babylonjs();
        const BABYLON = await library.loadBabylonJS();

        const canvas = createElement(documentRef, 'canvas', {
            display: 'block',
            width: '100%',
            height: '320px',
            touchAction: 'none',
        });
        canvas.width = 640;
        canvas.height = 320;
        card.stage.replaceChildren(canvas);

        engine = library.createBabylonEngine(canvas, {
            preserveDrawingBuffer: true,
            stencil: true,
            adaptToDeviceRatio: true,
        });
        scene = new BABYLON.Scene(engine);

        const camera = new BABYLON.ArcRotateCamera(
            'nvts-smoke-camera',
            -Math.PI / 2,
            Math.PI / 2.5,
            4,
            BABYLON.Vector3.Zero(),
            scene,
        );
        camera.attachControl(canvas, true);

        new BABYLON.HemisphericLight(
            'nvts-smoke-light',
            new BABYLON.Vector3(0, 1, 0),
            scene,
        );

        const cube = BABYLON.MeshBuilder.CreateBox('nvts-smoke-cube', { size: 1 }, scene);
        const material = new BABYLON.StandardMaterial('nvts-smoke-material', scene);
        material.diffuseColor = new BABYLON.Color3(0.2, 0.65, 0.95);
        cube.material = material;

        scene.registerBeforeRender(() => {
            cube.rotation.y += 0.01;
            cube.rotation.x += 0.003;
        });

        renderScene = () => scene.render();
        engine.runRenderLoop(renderScene);
        handleResize = () => engine?.resize();
        windowRef?.addEventListener?.('resize', handleResize);

        cleanupActions.push(() => {
            windowRef?.removeEventListener?.('resize', handleResize);
            engine?.stopRenderLoop(renderScene);
            scene?.dispose();
            engine?.dispose();
        });

        setStatus(card.status, 'PASS · Babylon.js inicializado y renderizando una escena WebGL/WebGPU.');
    } catch (error) {
        scene?.dispose?.();
        engine?.dispose?.();
        setStatus(card.status, `FAIL · ${error instanceof Error ? error.message : String(error)}`, true);
    }
}

/**
 * Opens a diagnostic overlay and tests only the renderers assigned to this program.
 * Each loader must return the public NVTS-Shared-Core adapter module for that library.
 */
export async function mountRendererSmokeTest(loaders, options = {}) {
    const documentRef = options.documentRef ?? globalThis.document;
    const windowRef = options.windowRef ?? globalThis.window;

    if (!documentRef?.body || typeof documentRef.createElement !== 'function') {
        throw new Error('Renderer smoke tests require a browser document.');
    }

    const hasPixi = typeof loaders?.pixijs === 'function';
    const hasBabylon = typeof loaders?.babylonjs === 'function';

    if (!hasPixi && !hasBabylon) {
        throw new Error('No renderer was assigned to this program.');
    }

    const overlay = createElement(documentRef, 'section', {
        position: 'fixed',
        inset: '12px',
        zIndex: '2147483000',
        maxHeight: 'calc(100vh - 24px)',
        overflow: 'auto',
        padding: '20px',
        ...PANEL_STYLE,
    });
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'NVTS renderer smoke tests');

    const header = createElement(documentRef, 'header', {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '8px',
    });
    const titleGroup = createElement(documentRef, 'div');
    const title = createElement(documentRef, 'h1', {
        margin: '0 0 6px',
        fontSize: '22px',
    });
    title.textContent = 'NVTS · Renderer smoke tests';

    const description = createElement(documentRef, 'p', {
        margin: '0',
        color: 'var(--nvts-text-muted, #a2a9b8)',
        fontSize: '13px',
        lineHeight: '1.5',
    });
    description.textContent = 'Prueba de carga del runtime y renderizado real desde NVTS-Shared-Core. Cerrá esta ventana para volver a la aplicación.';
    titleGroup.append(title, description);

    const closeButton = createElement(documentRef, 'button', {
        padding: '8px 12px',
        border: '1px solid var(--nvts-border, #3b414f)',
        borderRadius: '8px',
        background: 'var(--nvts-control-bg, #303542)',
        color: 'inherit',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    });
    closeButton.type = 'button';
    closeButton.textContent = 'Cerrar prueba';
    header.append(titleGroup, closeButton);

    const grid = createElement(documentRef, 'div', {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
        gap: '14px',
        marginTop: '16px',
    });

    const cards = {};
    if (hasPixi) {
        cards.pixijs = createRendererCard(documentRef, 'PixiJS');
        grid.appendChild(cards.pixijs.card);
    }
    if (hasBabylon) {
        cards.babylonjs = createRendererCard(documentRef, 'Babylon.js');
        grid.appendChild(cards.babylonjs.card);
    }

    overlay.append(header, grid);
    documentRef.body.appendChild(overlay);

    const cleanupActions = [];
    const dispose = () => {
        for (const cleanup of cleanupActions.splice(0).reverse()) {
            try {
                cleanup();
            } catch (error) {
                console.error('[NVTS renderer smoke test] Cleanup failed:', error);
            }
        }
        overlay.remove();
    };

    closeButton.addEventListener('click', dispose, { once: true });

    const jobs = [];
    if (hasPixi) jobs.push(runPixiTest(documentRef, cards.pixijs, loaders, cleanupActions));
    if (hasBabylon) jobs.push(runBabylonTest(documentRef, windowRef, cards.babylonjs, loaders, cleanupActions));
    await Promise.all(jobs);

    return { dispose };
}
