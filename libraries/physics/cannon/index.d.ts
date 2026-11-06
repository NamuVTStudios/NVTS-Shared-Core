export interface CannonNamespace { World: new (...args: any[]) => any; Body: new (...args: any[]) => any; version?: string; [key: string]: any; }
export function loadCannon(): Promise<CannonNamespace>;
