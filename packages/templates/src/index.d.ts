import type { AppObjectMetadata } from '../../app-object/src/ObjectTypes';

export type TemplatePreview = 'square' | 'portrait' | 'landscape';
export type TemplateUnit = 'px' | 'mm' | 'cm' | 'in' | 'pt' | 'frames' | 'cells';

export interface TemplatePrintProfile {
    finishedWidthMm: number;
    finishedHeightMm: number;
    bleedMm: number;
    safeMarginMm: number;
    innerMarginMm: number;
    outerMarginMm: number;
    topMarginMm: number;
    bottomMarginMm: number;
    readingDirection: 'rtl' | 'ltr' | 'vertical';
    colorMode: 'grayscale' | 'rgb' | 'cmyk-convert';
}

export interface TemplateDefinition {
    id: string;
    extendsId?: string;
    title: string;
    category: string;
    width: number;
    height: number;
    unit?: TemplateUnit;
    icon: string;
    preview: TemplatePreview;
    tags?: string[];
    printProfile?: TemplatePrintProfile;
    metadata?: Record<string, unknown>;
}

export interface TemplateFilter {
    category?: string;
    tag?: string;
    search?: string;
}

/** Immutable preset value object; it intentionally has no AppObject lifecycle. */
export declare class Template implements AppObjectMetadata {
    readonly id: string;
    readonly name: string;
    readonly kind: 'template';
    readonly title: string;
    readonly category: string;
    readonly width: number;
    readonly height: number;
    readonly unit: TemplateUnit;
    readonly icon: string;
    readonly preview: TemplatePreview;
    readonly tags: readonly string[];
    readonly printProfile?: Readonly<TemplatePrintProfile>;
    readonly metadata: Readonly<Record<string, unknown>>;
    constructor(definition: TemplateDefinition);
    getAspectRatio(): number;
    toDefinition(): TemplateDefinition;
    toJSON(): TemplateDefinition;
}

export declare class TemplateRegistry {
    constructor(definitions?: readonly TemplateDefinition[]);
    replace(definitions: readonly TemplateDefinition[]): readonly Template[];
    register(definition: TemplateDefinition): Template;
    registerMany(definitions: readonly TemplateDefinition[]): readonly Template[];
    get(id: string): Template | undefined;
    require(id: string): Template;
    has(id: string): boolean;
    list(filter?: TemplateFilter): Template[];
    categories(): string[];
    serialize(): TemplateDefinition[];
}

export declare function resolveTemplateInheritance(definitions: readonly TemplateDefinition[]): TemplateDefinition[];
export declare const SOCIAL_MEDIA_TEMPLATE_DEFINITIONS: readonly TemplateDefinition[];
export declare const SOCIAL_MEDIA_TEMPLATES: readonly Template[];
export declare const instagramPostTemplate: Template;
export declare const instagramStoryTemplate: Template;
export declare const youtubeThumbTemplate: Template;
export declare const facebookPostTemplate: Template;
export declare const facebookStoryTemplate: Template;
export declare const tiktokPostTemplate: Template;
export declare const tiktokStoryTemplate: Template;
export declare const PROGRAM_TEMPLATE_ASSIGNMENTS: Readonly<Record<string, readonly string[]>>;
export declare function getSharedTemplateDefinitionsForProgram(programId: string): TemplateDefinition[];
export declare function getSharedTemplatesForProgram(programId: string): Template[];
export declare function createProgramTemplateRegistry(programId: string, localDefinitions?: readonly TemplateDefinition[]): TemplateRegistry;

export declare const STANDARD_TEMPLATE_DEFINITIONS: readonly TemplateDefinition[];
export declare const STANDARD_TEMPLATES: readonly Template[];
export declare const SHARED_TEMPLATE_DEFINITIONS: readonly TemplateDefinition[];
export declare const SHARED_TEMPLATES: readonly Template[];
export declare const fullHdTemplate: Template;
export declare const fourKUhdTemplate: Template;
export declare const a4Template: Template;
export declare const animation2DTemplate: Template;
export declare const animationVerticalTemplate: Template;
export declare const animationWebTemplate: Template;
export declare const storyboardHorizontalTemplate: Template;
export declare const storyboardVerticalTemplate: Template;
export declare const texture2DTemplate: Template;
export declare const texture2DWideTemplate: Template;
export declare const textureUvTemplate: Template;
export declare const textureUv4KTemplate: Template;
