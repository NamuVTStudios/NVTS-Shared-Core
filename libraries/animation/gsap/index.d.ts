export interface GSAPNamespace { to(target: object, vars: Record<string, unknown>): any; timeline(vars?: Record<string, unknown>): any; [key: string]: any; }
export function loadGSAP(): Promise<GSAPNamespace>;
