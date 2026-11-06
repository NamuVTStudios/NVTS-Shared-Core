import { AppObject } from './AppObject';

export abstract class ApplicationObject extends AppObject {
  protected constructor(id: string, name: string) {
    super(id, name, 'application');
  }
}

export abstract class ToolObject extends AppObject {
  private activeState = false;

  protected constructor(id: string, name: string) {
    super(id, name, 'tool');
  }

  get active(): boolean {
    return this.activeState;
  }

  activate(): void {
    this.assertNotDisposed();
    if (!this.enabled) return;
    this.activeState = true;
  }

  deactivate(): void {
    this.assertNotDisposed();
    this.activeState = false;
  }
}

export abstract class PanelObject extends AppObject {
  private visibleState = true;

  protected constructor(id: string, name: string) {
    super(id, name, 'panel');
  }

  get visible(): boolean {
    return this.visibleState;
  }

  show(): void {
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }

  protected setVisible(visible: boolean): void {
    this.assertNotDisposed();
    if (this.visibleState === visible) return;
    this.visibleState = visible;
    this.onVisibilityChanged(visible);
  }

  protected onVisibilityChanged(_visible: boolean): void {}
}

export abstract class DocumentObject extends AppObject {
  protected constructor(id: string, name: string) {
    super(id, name, 'document');
  }
}

export abstract class LayerObject extends AppObject {
  protected constructor(id: string, name: string) {
    super(id, name, 'layer');
  }
}

export abstract class PluginObject extends AppObject {
  protected constructor(id: string, name: string) {
    super(id, name, 'plugin');
  }
}

export abstract class CommandObject extends AppObject {
  protected constructor(id: string, name: string) {
    super(id, name, 'command');
  }

  abstract execute(): void | Promise<void>;
}
