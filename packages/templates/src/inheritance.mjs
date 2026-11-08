/** Resolve template inheritance without mutating source definitions. */
export function resolveTemplateInheritance(definitions) {
    const byId = new Map();

    for (const definition of definitions) {
        if (byId.has(definition.id)) {
            throw new Error(`Identificador de plantilla duplicado: ${definition.id}`);
        }
        byId.set(definition.id, definition);
    }

    const resolved = new Map();
    const resolving = new Set();

    function resolveOne(definition) {
        const cached = resolved.get(definition.id);
        if (cached) return cached;
        if (resolving.has(definition.id)) {
            throw new Error(`Herencia circular de plantillas: ${definition.id}`);
        }

        resolving.add(definition.id);
        const parent = definition.extendsId ? byId.get(definition.extendsId) : undefined;

        if (definition.extendsId && !parent) {
            throw new Error(`La plantilla ${definition.id} hereda de una plantilla inexistente: ${definition.extendsId}`);
        }

        const base = parent ? resolveOne(parent) : undefined;
        const merged = {
            ...(base ?? {}),
            ...definition,
            ...(base?.printProfile || definition.printProfile ? {
                printProfile: {
                    ...(base?.printProfile ?? {}),
                    ...(definition.printProfile ?? {}),
                },
            } : {}),
            ...(base?.metadata || definition.metadata ? {
                metadata: {
                    ...(base?.metadata ?? {}),
                    ...(definition.metadata ?? {}),
                },
            } : {}),
        };

        delete merged.extendsId;
        resolving.delete(definition.id);
        resolved.set(definition.id, merged);
        return merged;
    }

    return definitions.map(resolveOne);
}
