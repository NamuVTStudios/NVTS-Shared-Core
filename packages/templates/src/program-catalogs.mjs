import { TemplateRegistry } from './TemplateRegistry.mjs';
import { SOCIAL_MEDIA_TEMPLATE_DEFINITIONS } from './catalogs/social-media.mjs';
import { STANDARD_TEMPLATE_DEFINITIONS } from './catalogs/standard-formats.mjs';

export const SHARED_TEMPLATE_DEFINITIONS = Object.freeze([
    ...SOCIAL_MEDIA_TEMPLATE_DEFINITIONS,
    ...STANDARD_TEMPLATE_DEFINITIONS,
]);

const SHARED_TEMPLATE_REGISTRY = new TemplateRegistry(SHARED_TEMPLATE_DEFINITIONS);
export const SHARED_TEMPLATES = Object.freeze(SHARED_TEMPLATE_REGISTRY.list());
const SHARED_TEMPLATE_BY_ID = new Map(SHARED_TEMPLATES.map((template) => [template.id, template]));
const SHARED_TEMPLATE_IDS = Object.freeze(SHARED_TEMPLATES.map((template) => template.id));

const SOCIAL = Object.freeze([
    'instagram-post',
    'instagram-story',
    'youtube-thumb',
    'facebook-post',
    'facebook-story',
    'tiktok-post',
    'tiktok-story',
]);
const SCREEN = Object.freeze(['full-hd', '4k-uhd']);
const PRINT = Object.freeze(['a4']);
const ANIMATION = Object.freeze(['animation-2d', 'animation-vertical', 'animation-web']);
const STORYBOARD = Object.freeze(['storyboard-horizontal', 'storyboard-vertical']);
const TEXTURE = Object.freeze(['texture-2d', 'texture-2d-wide', 'texture-uv', 'texture-uv-4k']);
const TEXTURE_2D = Object.freeze(['texture-2d', 'texture-2d-wide']);
const combine = (...groups) => Object.freeze(groups.flat());

/** Explicit product mapping. Empty arrays mean the product should own domain-specific presets instead. */
export const PROGRAM_TEMPLATE_ASSIGNMENTS = Object.freeze({
    'NVTS-PhotoMania': Object.freeze([...SHARED_TEMPLATE_IDS]),
    'NVTS-MixerDAW': Object.freeze([]),
    'NVTS-PremiereSurprise': combine(SCREEN, ANIMATION.slice(1), STORYBOARD),
    'NVTS-MultiEncoder': Object.freeze([]),
    'NVTS-FusionFX': combine(SCREEN, ANIMATION, STORYBOARD),
    'NVTS-Vectorize': combine(SOCIAL, SCREEN, PRINT),
    'NVTS-Docs': PRINT,
    'NVTS-Sheets': PRINT,
    'NVTS-Deck': SCREEN,
    'NVTS-Pixelize': TEXTURE_2D,
    'NVTS-Designer': combine(SOCIAL, SCREEN, PRINT),
    'NVTS-Oven': TEXTURE,
    'NVTS-FigGUI': SCREEN,
    'NVTS-GameEngine': combine(SCREEN, TEXTURE),
    'NVTS-SimulationEngine': combine(SCREEN, TEXTURE),
    'NVTS-Symphony': combine(SCREEN, ANIMATION, STORYBOARD),
    'NVTS-CAD': PRINT,
    'NVTS-Works': Object.freeze([]),
    'NVTS-PDF': PRINT,
    'NVTS-Light': Object.freeze([]),
    'NVTS-Codex': Object.freeze([]),
    'NVTS-Civil': PRINT,
    'NVTS-BIM': PRINT,
    'NVTS-ProtoType': SCREEN,
    'NVTS-Matrix': PRINT,
});

export function getSharedTemplateDefinitionsForProgram(programId) {
    const assignedIds = PROGRAM_TEMPLATE_ASSIGNMENTS[programId] ?? [];
    return assignedIds.map((id) => {
        const definition = SHARED_TEMPLATE_BY_ID.get(id);
        if (!definition) throw new Error(`Unknown shared template assignment: ${programId} -> ${id}`);
        return definition.toDefinition();
    });
}

export function getSharedTemplatesForProgram(programId) {
    const assignedIds = PROGRAM_TEMPLATE_ASSIGNMENTS[programId] ?? [];
    return assignedIds.map((id) => {
        const template = SHARED_TEMPLATE_BY_ID.get(id);
        if (!template) throw new Error(`Unknown shared template assignment: ${programId} -> ${id}`);
        return template;
    });
}

/** Merge a product's assigned shared presets with its product-specific presets. */
export function createProgramTemplateRegistry(programId, localDefinitions = []) {
    return new TemplateRegistry([
        ...getSharedTemplateDefinitionsForProgram(programId),
        ...localDefinitions,
    ]);
}
