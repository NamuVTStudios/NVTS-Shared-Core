/** Stable metadata shared by runtime objects across NVTS applications. */
export interface AppObjectMetadata {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
}

export interface AppObjectSnapshot extends AppObjectMetadata {
  readonly enabled: boolean;
}

/** Optional capability contracts. Objects implement only what they support. */
export interface Updatable {
  update(deltaTime: number): void;
}

export interface Renderable<TContext = unknown> {
  render(context: TContext): void;
}

export interface Serializable<TData = unknown> {
  serialize(): TData;
}

export interface Selectable {
  selected: boolean;
}

/**
 * Minimal lifecycle base. It deliberately contains no UI, renderer, storage,
 * or framework dependencies so it can be reused by every NVTS application.
 */
export abstract class AppObject implements AppObjectMetadata {
  private lifecycle: 'created' | 'initialized' | 'disposed' = 'created';
  private enabledState = true;

  protected constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly kind: string,
  ) {
    if (!id.trim()) throw new Error('AppObject requires a non-empty id.');
    if (!name.trim()) throw new Error('AppObject requires a non-empty name.');
    if (!kind.trim()) throw new Error('AppObject requires a non-empty kind.');
  }

  get enabled(): boolean {
    return this.enabledState;
  }

  get isInitialized(): boolean {
    return this.lifecycle === 'initialized';
  }

  get isDisposed(): boolean {
    return this.lifecycle === 'disposed';
  }

  setEnabled(enabled: boolean): void {
    this.assertNotDisposed();
    this.enabledState = enabled;
  }

  initialize(): void {
    this.assertNotDisposed();
    if (this.isInitialized) return;
    this.onInitialize();
    this.lifecycle = 'initialized';
  }

  dispose(): void {
    if (this.isDisposed) return;
    this.onDispose();
    this.lifecycle = 'disposed';
    this.enabledState = false;
  }

  snapshot(): AppObjectSnapshot {
    return {
      id: this.id,
      name: this.name,
      kind: this.kind,
      enabled: this.enabled,
    };
  }

  protected onInitialize(): void {}
  protected onDispose(): void {}

  protected assertNotDisposed(): void {
    if (this.isDisposed) throw new Error(`AppObject "${this.id}" has been disposed.`);
  }
}
