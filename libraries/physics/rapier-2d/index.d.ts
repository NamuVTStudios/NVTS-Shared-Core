export function loadRapier2D(): Promise<Record<string, any> & { World: new (gravity: {x:number; y:number}) => any; version(): string }>;
