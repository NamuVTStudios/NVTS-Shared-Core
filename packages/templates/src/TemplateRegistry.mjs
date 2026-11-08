import { Template } from './Template.mjs';
import { resolveTemplateInheritance } from './inheritance.mjs';

/** A per-program catalog of validated, immutable template definitions. */
export class TemplateRegistry {
    #templates = new Map();
    #definitions = [];

    constructor(definitions = []) {
        this.replace(definitions);
    }

    replace(definitions) {
        const resolved = resolveTemplateInheritance(definitions);
        const nextTemplates = new Map();

        for (const definition of resolved) {
            nextTemplates.set(definition.id, new Template(definition));
        }

        this.#definitions = resolved.map((definition) => ({ ...definition }));
        this.#templates = nextTemplates;
        return this.list();
    }

    register(definition) {
        if (this.#templates.has(definition.id)) {
            throw new Error(`La plantilla ya está registrada: ${definition.id}`);
        }

        this.replace([...this.#definitions, definition]);
        return this.get(definition.id);
    }

    registerMany(definitions) {
        this.replace([...this.#definitions, ...definitions]);
        return this.list();
    }

    get(id) {
        return this.#templates.get(id);
    }

    require(id) {
        const template = this.get(id);
        if (!template) throw new Error(`Plantilla no encontrada: ${id}`);
        return template;
    }

    has(id) {
        return this.#templates.has(id);
    }

    list(filter = {}) {
        const templates = [...this.#templates.values()];
        return templates.filter((template) => {
            if (filter.category && template.category !== filter.category) return false;
            if (filter.tag && !template.tags.includes(filter.tag)) return false;
            if (filter.search) {
                const query = filter.search.trim().toLocaleLowerCase();
                const searchable = `${template.title} ${template.category} ${template.tags.join(' ')}`.toLocaleLowerCase();
                if (!searchable.includes(query)) return false;
            }
            return true;
        });
    }

    categories() {
        return [...new Set(this.list().map((template) => template.category))].sort((a, b) => a.localeCompare(b));
    }

    serialize() {
        return this.list().map((template) => template.toDefinition());
    }
}
