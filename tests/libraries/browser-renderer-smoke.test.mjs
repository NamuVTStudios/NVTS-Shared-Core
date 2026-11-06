import assert from 'node:assert/strict';
import test from 'node:test';
import { mountRendererSmokeTest } from '../../libraries/testing/renderers/index.mjs';

class FakeElement {
    constructor(tagName) {
        this.tagName = tagName;
        this.children = [];
        this.style = {};
        this.attributes = {};
        this.listeners = new Map();
        this.parentNode = null;
        this.textContent = '';
    }

    append(...elements) {
        for (const element of elements) this.appendChild(element);
    }

    appendChild(element) {
        element.parentNode = this;
        this.children.push(element);
        return element;
    }

    replaceChildren(...elements) {
        for (const child of this.children) child.parentNode = null;
        this.children = [];
        this.append(...elements);
    }

    setAttribute(name, value) {
        this.attributes[name] = value;
    }

    addEventListener(name, callback) {
        this.listeners.set(name, callback);
    }

    removeEventListener(name) {
        this.listeners.delete(name);
    }

    remove() {
        if (!this.parentNode) return;
        this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
        this.parentNode = null;
    }
}

function createFakeDocument() {
    return {
        body: new FakeElement('body'),
        createElement: (tagName) => new FakeElement(tagName),
    };
}

function collectText(element) {
    return [element.textContent, ...element.children.map(collectText)].join(' ');
}

function createPixiModule() {
    let initialized = false;
    let destroyed = false;
    const graphics = {
        rect() { return this; },
        roundRect() { return this; },
        circle() { return this; },
        fill() { return this; },
        rotation: 0,
    };
    const app = {
        canvas: new FakeElement('canvas'),
        stage: { addChild() {} },
        ticker: { add() {}, remove() {} },
        async init() { initialized = true; },
        destroy() { destroyed = true; },
    };

    return {
        module: {
            async loadPixiJS() {
                return { Graphics: class { constructor() { return graphics; } } };
            },
            createPixiApplication() {
                return app;
            },
        },
        state: {
            initialized: () => initialized,
            destroyed: () => destroyed,
        },
    };
}

function createBabylonModule() {
    let engineCreated = false;
    let renderStarted = false;
    let engineDisposed = false;
    const scene = {
        registerBeforeRender() {},
        render() {},
        dispose() {},
    };
    const engine = {
        runRenderLoop(callback) {
            renderStarted = true;
            callback();
        },
        stopRenderLoop() {},
        resize() {},
        dispose() { engineDisposed = true; },
    };

    class Vector3 {
        static Zero() { return new Vector3(); }
    }

    return {
        module: {
            async loadBabylonJS() {
                return {
                    Scene: class { constructor() { return scene; } },
                    ArcRotateCamera: class { attachControl() {} },
                    Vector3,
                    HemisphericLight: class {},
                    MeshBuilder: { CreateBox: () => ({ rotation: {} }) },
                    StandardMaterial: class { diffuseColor = null; },
                    Color3: class {},
                };
            },
            createBabylonEngine() {
                engineCreated = true;
                return engine;
            },
        },
        state: {
            engineCreated: () => engineCreated,
            renderStarted: () => renderStarted,
            engineDisposed: () => engineDisposed,
        },
    };
}

test('browser renderer smoke test loads and initializes the Shared Core PixiJS adapter', async () => {
    const documentRef = createFakeDocument();
    const pixi = createPixiModule();
    const handle = await mountRendererSmokeTest({
        pixijs: async () => pixi.module,
    }, { documentRef });

    const text = collectText(documentRef.body);
    assert.match(text, /PixiJS/);
    assert.match(text, /PASS/);
    assert.equal(pixi.state.initialized(), true);
    assert.equal(documentRef.body.children.length, 1);

    handle.dispose();
    assert.equal(pixi.state.destroyed(), true);
    assert.equal(documentRef.body.children.length, 0);
});

test('browser renderer smoke test loads and initializes the Shared Core Babylon.js adapter', async () => {
    const documentRef = createFakeDocument();
    const babylon = createBabylonModule();
    const handle = await mountRendererSmokeTest({
        babylonjs: async () => babylon.module,
    }, {
        documentRef,
        windowRef: {
            addEventListener() {},
            removeEventListener() {},
        },
    });

    const text = collectText(documentRef.body);
    assert.match(text, /Babylon\.js/);
    assert.match(text, /PASS/);
    assert.equal(babylon.state.engineCreated(), true);
    assert.equal(babylon.state.renderStarted(), true);

    handle.dispose();
    assert.equal(babylon.state.engineDisposed(), true);
    assert.equal(documentRef.body.children.length, 0);
});

test('browser renderer smoke test can initialize both assigned renderers together', async () => {
    const documentRef = createFakeDocument();
    const pixi = createPixiModule();
    const babylon = createBabylonModule();
    const handle = await mountRendererSmokeTest({
        pixijs: async () => pixi.module,
        babylonjs: async () => babylon.module,
    }, {
        documentRef,
        windowRef: {
            addEventListener() {},
            removeEventListener() {},
        },
    });

    const text = collectText(documentRef.body);
    assert.match(text, /PixiJS/);
    assert.match(text, /Babylon\.js/);
    assert.equal((text.match(/PASS/g) ?? []).length, 2);

    handle.dispose();
});
