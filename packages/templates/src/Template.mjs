const PREVIEW_SHAPES = new Set(['square', 'portrait', 'landscape']);
const TEMPLATE_UNITS = new Set(['px', 'mm', 'cm', 'in', 'pt', 'frames', 'cells']);

function clonePrintProfile(profile) {
    if (!profile) return undefined;
    return Object.freeze({ ...profile });
}

function validateDefinition(definition) {
    if (!definition || typeof definition !== 'object') {
        throw new TypeError('Template requires a definition object.');
    }

    const requiredStrings = ['id', 'title', 'category', 'icon', 'preview'];

    for (const field of requiredStrings) {
        if (typeof definition[field] !== 'string' || !definition[field].trim()) {
            throw new TypeError(`Template requires a non-empty ${field}.`);
        }
    }

    if (!Number.isFinite(definition.width) || definition.width <= 0) {
        throw new RangeError(`Template "${definition.id}" requires a positive width.`);
    }

    if (!Number.isFinite(definition.height) || definition.height <= 0) {
        throw new RangeError(`Template "${definition.id}" requires a positive height.`);
    }

    if (!PREVIEW_SHAPES.has(definition.preview)) {
        throw new TypeError(`Template "${definition.id}" has an unsupported preview shape.`);
    }

    const unit = definition.unit ?? 'px';

    if (!TEMPLATE_UNITS.has(unit)) {
        throw new TypeError(`Template "${definition.id}" has an unsupported unit: ${unit}.`);
    }
}

/**
 * Immutable domain object representing a reusable application preset.
 * It deliberately does not extend AppObject: a template is catalog data,
 * not a live runtime object with initialize/dispose lifecycle semantics.
 */
export class Template {
    constructor(definition) {
        validateDefinition(definition);

        this.id = definition.id.trim();
        this.name = definition.title.trim();
        this.kind = 'template';
        this.title = definition.title.trim();
        this.category = definition.category.trim();
        this.width = definition.width;
        this.height = definition.height;
        this.unit = definition.unit ?? 'px';
        this.icon = definition.icon;
        this.preview = definition.preview;
        this.tags = Object.freeze([...(definition.tags ?? [])]);
        this.printProfile = clonePrintProfile(definition.printProfile);
        this.metadata = Object.freeze({ ...(definition.metadata ?? {}) });

        Object.freeze(this);
    }

    getAspectRatio() {
        return this.width / this.height;
    }

    toDefinition() {
        return {
            id: this.id,
            title: this.title,
            category: this.category,
            width: this.width,
            height: this.height,
            unit: this.unit,
            icon: this.icon,
            preview: this.preview,
            ...(this.tags.length ? { tags: [...this.tags] } : {}),
            ...(this.printProfile ? { printProfile: { ...this.printProfile } } : {}),
            ...(Object.keys(this.metadata).length ? { metadata: { ...this.metadata } } : {}),
        };
    }

    toJSON() {
        return this.toDefinition();
    }
}
