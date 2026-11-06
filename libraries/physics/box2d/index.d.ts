export interface Box2DModule { b2WorldDef: (...args: any[]) => any; b2CreateWorld: (...args: any[]) => any; [key: string]: any; }
export function loadBox2D(): Promise<Box2DModule>;
