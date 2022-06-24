const { expect, describe, test } = require('@jest/globals');
const nock = require('nock');
const github = require('../src/github');

const GITHUB_TOKEN = 'github_token';
const TEMPLATE_NAME = '@test/app-builder-template';
const TEMPLATE_LATEST_VERSION = '1.0.1';
const ISSUE_NUMBER = 1001;

const GITHUB_REPO_OWNER = 'adobe';
const GITHUB_REPO = 'aio-template-submission';
beforeEach(() => {
    process.env = {
        GITHUB_REPO_OWNER: 'adobe',
        GITHUB_REPO: 'aio-template-submission'
    };
});

describe('Verify creation of Github issues and comments', () => {
    test('Verify that "Template Removal Request" issue created', async () => {
        nock('https://api.github.com')
            .post('/repos/adobe/aio-template-submission/issues', {
                'title': `Remove ${TEMPLATE_NAME} as npm/github links are not valid anymore`,
                'labels': ['remove-template', 'template-auto-verification'],
                'body': `### "Name of NPM package"\n${TEMPLATE_NAME}`
            })
            .times(1)
            .reply(200, { 'number': ISSUE_NUMBER });

        await expect(github.createRemoveIssue(GITHUB_TOKEN, TEMPLATE_NAME))
            .resolves.toBe(ISSUE_NUMBER);
    });

    test('Verify that "Template Update Request" issue created', async () => {
        nock('https://api.github.com')
            .post('/repos/adobe/aio-template-submission/issues', {
                'title': `Update ${TEMPLATE_NAME} as there is the newest ${TEMPLATE_LATEST_VERSION} version`,
                'labels': ['update-template', 'template-auto-verification'],
                'body': `### "Name of NPM package"\n${TEMPLATE_NAME}`
            })
            .times(1)
            .reply(200, { 'number': ISSUE_NUMBER });

        await expect(github.createUpdateIssue(GITHUB_TOKEN, TEMPLATE_NAME, TEMPLATE_LATEST_VERSION))
            .resolves.toBe(ISSUE_NUMBER);
    });

    test('Verify that comment to Github issue added', async () => {
        const comment = 'Hello World!';
        const commentId = 100001;
        nock('https://api.github.com')
            .post(`/repos/adobe/aio-template-submission/issues/${ISSUE_NUMBER}/comments`, {
                'body': comment
            })
            .times(1)
            .reply(200, { 'id': commentId });

        await expect(github.createComment(GITHUB_TOKEN, ISSUE_NUMBER, comment))
            .resolves.toBe(commentId);
    });

    test('Verify getting a Github repo name', () => {
        expect(github.getGithubRepo()).toBe(GITHUB_REPO);
    });

    test('Verify getting a Github repo owner', () => {
        expect(github.getGithubRepoOwner()).toBe(GITHUB_REPO_OWNER);
    });

    test('Verify getting a Github repo name throws an exception', () => {
        delete process.env.GITHUB_REPO;
        expect(() => github.getGithubRepo()).toThrow(new Error('GITHUB_REPO env var is not set.'));
    });

    test('Verify getting a Github repo owner throws an exception', () => {
        delete process.env.GITHUB_REPO_OWNER;
        expect(() => github.getGithubRepoOwner()).toThrow(new Error('GITHUB_REPO_OWNER env var is not set.'));
    });
});
