export { Template } from './Template.mjs';
export { TemplateRegistry } from './TemplateRegistry.mjs';
export { resolveTemplateInheritance } from './inheritance.mjs';
export {
    SOCIAL_MEDIA_TEMPLATE_DEFINITIONS,
    SOCIAL_MEDIA_TEMPLATES,
    instagramPostTemplate,
    instagramStoryTemplate,
    youtubeThumbTemplate,
    facebookPostTemplate,
    facebookStoryTemplate,
    tiktokPostTemplate,
    tiktokStoryTemplate,
} from './catalogs/social-media.mjs';
export {
    SHARED_TEMPLATE_DEFINITIONS,
    SHARED_TEMPLATES,
    PROGRAM_TEMPLATE_ASSIGNMENTS,
    createProgramTemplateRegistry,
    getSharedTemplateDefinitionsForProgram,
    getSharedTemplatesForProgram,
} from './program-catalogs.mjs';

export {
    STANDARD_TEMPLATE_DEFINITIONS,
    STANDARD_TEMPLATES,
    fullHdTemplate,
    fourKUhdTemplate,
    a4Template,
    animation2DTemplate,
    animationVerticalTemplate,
    animationWebTemplate,
    storyboardHorizontalTemplate,
    storyboardVerticalTemplate,
    texture2DTemplate,
    texture2DWideTemplate,
    textureUvTemplate,
    textureUv4KTemplate,
} from './catalogs/standard-formats.mjs';
