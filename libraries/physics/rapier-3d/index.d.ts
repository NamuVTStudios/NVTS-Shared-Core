export function loadRapier3D(): Promise<Record<string, any> & { World: new (gravity: {x:number; y:number; z:number}) => any; version(): string }>;
