import { TemplateRegistry } from '../TemplateRegistry.mjs';

/** Generic presets shared by products with compatible document/canvas workflows. */
export const STANDARD_TEMPLATE_DEFINITIONS = Object.freeze([
    {
        id: 'full-hd',
        title: 'Full HD',
        category: 'Pantallas',
        width: 1920,
        height: 1080,
        icon: '▱',
        preview: 'landscape',
        tags: ['screen', 'video', 'display'],
    },
    {
        id: '4k-uhd',
        title: '4K UHD',
        category: 'Pantallas',
        width: 3840,
        height: 2160,
        icon: '▱',
        preview: 'landscape',
        tags: ['screen', 'video', 'display', 'uhd'],
    },
    {
        id: 'a4',
        title: 'A4 (300 ppp)',
        category: 'Impresión',
        width: 2480,
        height: 3508,
        icon: '▤',
        preview: 'portrait',
        tags: ['print', 'paper', 'document', 'iso-216'],
    },
    {
        id: 'animation-2d',
        title: 'Animación 2D',
        category: 'Animación 2D',
        width: 1920,
        height: 1080,
        icon: '◉',
        preview: 'landscape',
        tags: ['animation', '2d', 'video'],
    },
    {
        id: 'animation-vertical',
        title: 'Animación vertical',
        category: 'Animación 2D',
        width: 1080,
        height: 1920,
        icon: '▷',
        preview: 'portrait',
        tags: ['animation', 'vertical', 'short-form'],
    },
    {
        id: 'animation-web',
        title: 'Animación web',
        category: 'Animación 2D',
        width: 1280,
        height: 720,
        icon: '▷',
        preview: 'landscape',
        tags: ['animation', 'web', 'video'],
    },
    {
        id: 'storyboard-horizontal',
        title: 'Storyboard horizontal',
        category: 'Storyboard',
        width: 1920,
        height: 1080,
        icon: '▤',
        preview: 'landscape',
        tags: ['storyboard', 'previsualization', 'landscape'],
    },
    {
        id: 'storyboard-vertical',
        title: 'Storyboard vertical',
        category: 'Storyboard',
        width: 1080,
        height: 1920,
        icon: '▥',
        preview: 'portrait',
        tags: ['storyboard', 'previsualization', 'portrait'],
    },
    {
        id: 'texture-2d',
        title: 'Textura 2D / Tileable',
        category: 'Texturas',
        width: 1024,
        height: 1024,
        icon: '▦',
        preview: 'square',
        tags: ['texture', '2d', 'tileable'],
    },
    {
        id: 'texture-2d-wide',
        title: 'Textura 2D panorámica',
        category: 'Texturas',
        width: 2048,
        height: 1024,
        icon: '▦',
        preview: 'landscape',
        tags: ['texture', '2d', 'wide'],
    },
    {
        id: 'texture-uv',
        title: 'Textura UV (cuadrada)',
        category: 'Texturas',
        width: 2048,
        height: 2048,
        icon: '▦',
        preview: 'square',
        tags: ['texture', 'uv', '3d'],
    },
    {
        id: 'texture-uv-4k',
        title: 'Textura UV 4K',
        category: 'Texturas',
        width: 4096,
        height: 4096,
        icon: '▦',
        preview: 'square',
        tags: ['texture', 'uv', '3d', 'uhd'],
    },
]);

export const STANDARD_TEMPLATES = Object.freeze(
    new TemplateRegistry(STANDARD_TEMPLATE_DEFINITIONS).list(),
);

const STANDARD_TEMPLATE_BY_ID = new Map(
    STANDARD_TEMPLATES.map((template) => [template.id, template]),
);

export const fullHdTemplate = STANDARD_TEMPLATE_BY_ID.get('full-hd');
export const fourKUhdTemplate = STANDARD_TEMPLATE_BY_ID.get('4k-uhd');
export const a4Template = STANDARD_TEMPLATE_BY_ID.get('a4');
export const animation2DTemplate = STANDARD_TEMPLATE_BY_ID.get('animation-2d');
export const animationVerticalTemplate = STANDARD_TEMPLATE_BY_ID.get('animation-vertical');
export const animationWebTemplate = STANDARD_TEMPLATE_BY_ID.get('animation-web');
export const storyboardHorizontalTemplate = STANDARD_TEMPLATE_BY_ID.get('storyboard-horizontal');
export const storyboardVerticalTemplate = STANDARD_TEMPLATE_BY_ID.get('storyboard-vertical');
export const texture2DTemplate = STANDARD_TEMPLATE_BY_ID.get('texture-2d');
export const texture2DWideTemplate = STANDARD_TEMPLATE_BY_ID.get('texture-2d-wide');
export const textureUvTemplate = STANDARD_TEMPLATE_BY_ID.get('texture-uv');
export const textureUv4KTemplate = STANDARD_TEMPLATE_BY_ID.get('texture-uv-4k');
