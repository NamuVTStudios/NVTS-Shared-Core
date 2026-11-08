import { TemplateRegistry } from '../TemplateRegistry.mjs';

export const SOCIAL_MEDIA_TEMPLATE_DEFINITIONS = Object.freeze([
    {
        id: 'instagram-post',
        title: 'Instagram Post',
        category: 'Redes sociales',
        width: 1080,
        height: 1080,
        icon: '◎',
        preview: 'square',
        tags: ['social-media', 'instagram', 'post'],
    },
    {
        id: 'instagram-story',
        title: 'Instagram Story',
        category: 'Redes sociales',
        width: 1080,
        height: 1920,
        icon: '▯',
        preview: 'portrait',
        tags: ['social-media', 'instagram', 'story'],
    },
    {
        id: 'youtube-thumb',
        title: 'Miniatura YouTube',
        category: 'Redes sociales',
        width: 1280,
        height: 720,
        icon: '▶',
        preview: 'landscape',
        tags: ['social-media', 'youtube', 'thumbnail'],
    },
    {
        id: 'facebook-post',
        title: 'Facebook Post',
        category: 'Redes sociales',
        width: 1200,
        height: 630,
        icon: 'f',
        preview: 'landscape',
        tags: ['social-media', 'facebook', 'post'],
    },
    {
        id: 'facebook-story',
        title: 'Facebook Story',
        category: 'Redes sociales',
        width: 1080,
        height: 1920,
        icon: 'f',
        preview: 'portrait',
        tags: ['social-media', 'facebook', 'story'],
    },
    {
        id: 'tiktok-post',
        title: 'TikTok Post',
        category: 'Redes sociales',
        width: 1080,
        height: 1920,
        icon: '♪',
        preview: 'portrait',
        tags: ['social-media', 'tiktok', 'post'],
    },
    {
        id: 'tiktok-story',
        title: 'TikTok Story',
        category: 'Redes sociales',
        width: 1080,
        height: 1920,
        icon: '♪',
        preview: 'portrait',
        tags: ['social-media', 'tiktok', 'story'],
    },
]);

export const SOCIAL_MEDIA_TEMPLATES = Object.freeze(
    new TemplateRegistry(SOCIAL_MEDIA_TEMPLATE_DEFINITIONS).list(),
);


const SOCIAL_MEDIA_TEMPLATE_BY_ID = new Map(
    SOCIAL_MEDIA_TEMPLATES.map((template) => [template.id, template]),
);

export const instagramPostTemplate = SOCIAL_MEDIA_TEMPLATE_BY_ID.get('instagram-post');
export const instagramStoryTemplate = SOCIAL_MEDIA_TEMPLATE_BY_ID.get('instagram-story');
export const youtubeThumbTemplate = SOCIAL_MEDIA_TEMPLATE_BY_ID.get('youtube-thumb');
export const facebookPostTemplate = SOCIAL_MEDIA_TEMPLATE_BY_ID.get('facebook-post');
export const facebookStoryTemplate = SOCIAL_MEDIA_TEMPLATE_BY_ID.get('facebook-story');
export const tiktokPostTemplate = SOCIAL_MEDIA_TEMPLATE_BY_ID.get('tiktok-post');
export const tiktokStoryTemplate = SOCIAL_MEDIA_TEMPLATE_BY_ID.get('tiktok-story');
