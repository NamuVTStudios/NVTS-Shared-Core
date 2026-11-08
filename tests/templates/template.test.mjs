import assert from 'node:assert/strict';
import test from 'node:test';
import {
    Template,
    TemplateRegistry,
    createProgramTemplateRegistry,
    getSharedTemplatesForProgram,
    instagramPostTemplate,
    instagramStoryTemplate,
    youtubeThumbTemplate,
    facebookPostTemplate,
    facebookStoryTemplate,
    tiktokPostTemplate,
    tiktokStoryTemplate,
    resolveTemplateInheritance,
} from '../../packages/templates/src/index.mjs';

const baseDefinition = {
    id: 'base-square',
    title: 'Base Square',
    category: 'Test',
    width: 100,
    height: 100,
    icon: '□',
    preview: 'square',
};

test('Template is an immutable metadata-compatible value object, not an AppObject lifecycle instance', () => {
    const template = new Template(baseDefinition);
    assert.equal(template.id, 'base-square');
    assert.equal(template.name, 'Base Square');
    assert.equal(template.kind, 'template');
    assert.equal(template.getAspectRatio(), 1);
    assert.equal(Object.isFrozen(template), true);
    assert.equal(typeof template.initialize, 'undefined');
    assert.equal(typeof template.dispose, 'undefined');
});

test('Template validates identifiers, dimensions, units and preview shapes', () => {
    assert.throws(() => new Template({ ...baseDefinition, id: '' }), /id/);
    assert.throws(() => new Template({ ...baseDefinition, width: 0 }), /positive width/);
    assert.throws(() => new Template({ ...baseDefinition, unit: 'invalid' }), /unsupported unit/);
    assert.throws(() => new Template({ ...baseDefinition, preview: 'circle' }), /preview shape/);
});

test('TemplateRegistry filters catalogues and prevents duplicate identifiers', () => {
    const registry = new TemplateRegistry([
        baseDefinition,
        { ...baseDefinition, id: 'portrait', title: 'Portrait', width: 80, height: 160, preview: 'portrait', category: 'Print' },
    ]);
    assert.equal(registry.list().length, 2);
    assert.equal(registry.list({ category: 'Print' })[0].id, 'portrait');
    assert.equal(registry.list({ search: 'base' })[0].id, 'base-square');
    assert.throws(() => registry.register(baseDefinition), /ya está registrada/);
});

test('template inheritance resolves parent metadata without mutating source definitions', () => {
    const child = {
        ...baseDefinition,
        id: 'child-square',
        extendsId: 'base-square',
        title: 'Child Square',
        tags: ['child'],
    };
    const resolved = resolveTemplateInheritance([baseDefinition, child]);
    assert.equal(resolved[1].title, 'Child Square');
    assert.equal('extendsId' in resolved[1], false);
    assert.equal('extendsId' in child, true);
});

test('shared templates are assigned by product scope rather than copied into every program', () => {
    const photo = getSharedTemplatesForProgram('NVTS-PhotoMania');
    const vector = getSharedTemplatesForProgram('NVTS-Vectorize');
    const unknown = getSharedTemplatesForProgram('NVTS-MixerDAW');
    assert.equal(photo.length, 19);
    assert.equal(vector.length, 10);
    assert.ok(vector.some((item) => item.id === 'instagram-post'));
    assert.ok(vector.some((item) => item.id === 'a4'));
    assert.ok(vector.some((item) => item.id === 'full-hd'));
    assert.equal(unknown.length, 0);
    assert.equal(getSharedTemplatesForProgram('NVTS-Oven').filter((item) => item.category === 'Texturas').length, 4);
    assert.equal(getSharedTemplatesForProgram('NVTS-Symphony').filter((item) => item.category === 'Storyboard').length, 2);
    assert.equal(getSharedTemplatesForProgram('NVTS-MultiEncoder').length, 0);

    const vectorRegistry = createProgramTemplateRegistry('NVTS-Vectorize');
    assert.equal(vectorRegistry.require('instagram-post').width, 1080);
});


test('shared social-media presets are exported as stable Template instances', () => {
    const sharedSocialTemplates = [
        instagramPostTemplate,
        instagramStoryTemplate,
        youtubeThumbTemplate,
        facebookPostTemplate,
        facebookStoryTemplate,
        tiktokPostTemplate,
        tiktokStoryTemplate,
    ];

    assert.equal(sharedSocialTemplates.length, 7);
    assert.ok(sharedSocialTemplates.every((template) => template instanceof Template));
    assert.equal(instagramPostTemplate.width, 1080);
    assert.equal(youtubeThumbTemplate.height, 720);
});


test('standard reusable templates are centralized in Shared Core', async () => {
    const { STANDARD_TEMPLATES, SHARED_TEMPLATES, PROGRAM_TEMPLATE_ASSIGNMENTS } = await import('../../packages/templates/src/index.mjs');
    assert.equal(STANDARD_TEMPLATES.length, 12);
    assert.equal(SHARED_TEMPLATES.length, 19);
    assert.equal(Object.keys(PROGRAM_TEMPLATE_ASSIGNMENTS).length, 25);
    assert.ok(STANDARD_TEMPLATES.some((template) => template.id === 'texture-uv-4k'));
});


test('all 25 program assignments resolve without duplicate or unknown template IDs', async () => {
    const { PROGRAM_TEMPLATE_ASSIGNMENTS, SHARED_TEMPLATE_DEFINITIONS } = await import('../../packages/templates/src/index.mjs');
    const sharedIds = new Set(SHARED_TEMPLATE_DEFINITIONS.map((template) => template.id));
    assert.equal(Object.keys(PROGRAM_TEMPLATE_ASSIGNMENTS).length, 25);

    for (const [programId, assignedIds] of Object.entries(PROGRAM_TEMPLATE_ASSIGNMENTS)) {
        assert.equal(new Set(assignedIds).size, assignedIds.length, `${programId} has duplicate assignments`);
        for (const templateId of assignedIds) {
            assert.ok(sharedIds.has(templateId), `${programId} references missing template ${templateId}`);
        }
        assert.doesNotThrow(() => getSharedTemplatesForProgram(programId));
    }
});
