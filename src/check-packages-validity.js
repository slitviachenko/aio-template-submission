import * as core from '@actions/core';
import * as github from '@actions/github';
import { getRegistry, addToRegistry } from "./registry.js";
import { v4 as uuidv4 } from 'uuid';

const GITHUB_REPO = 'aio-template-submission';
// const GITHUB_REPO_OWNER = 'adobe';
const GITHUB_REPO_OWNER = 'slitviachenko';

(async () => {
    try {
        const uuid = uuidv4();
        const registryItem = {
            "id": uuid,
            "author": "Adobe Inc.",
            "name": uuid,
            "description": `Test ${uuid}`,
            "latestVersion": "1.1.0",
            "publishDate": new Date(Date.now()),
            "extensionPoints": [
                "dx-spa",
                "dx-commerce"
            ],
            "categories": [
                "aio-action",
                "aio-graphql"
            ],
            "adobeRecommended": false,
            "keywords": ["test"],
            "links": {
                "npm": `https://www.npmjs.com/package/@adobe/${uuid}`,
                "github": `https://github.com/adobe/${uuid}`
            }
        };
        // addToRegistry(registryItem);

        const githubToken = process.env.GITHUB_TOKEN;
        const myArgs = process.argv.slice(2);
        const issueNumber = myArgs[0];
        const octokit = new github.getOctokit(githubToken);
        console.log('issueNumber', issueNumber);

        const data = {
            'packagesToUpdate': []
        };
        const registry = getRegistry();
        for (const item of registry) {
            const packageName = item.name;
            const packageNpmUrl = item.links.npm;
            const packageGithubUrl = item.links.github;
            data.packagesToUpdate.push({
                'packageName': packageName,
                'packageNpmUrl': packageNpmUrl,
                'packageGithubUrl': packageGithubUrl,
                'action': 'update'
            });
        }
        if (data.packagesToUpdate.length > 0) {
            let comment = 'We are going to:\n';
            for (const item of data.packagesToUpdate) {
                console.log(item)
                comment += `- ${item.action} "${item.packageName}"\n`
            }
            await octokit.rest.issues.createComment({
                'owner': GITHUB_REPO_OWNER,
                'repo': GITHUB_REPO,
                'issue_number': issueNumber,
                'body': comment
            });
            core.setOutput('packages-to-update', JSON.stringify(data));
        } else {
            await octokit.rest.issues.createComment({
                'owner': GITHUB_REPO_OWNER,
                'repo': GITHUB_REPO,
                'issue_number': issueNumber,
                'body': ':white_check_mark: All template packages in Template Registry contain the latest information. Nothing to update.'
            });
            core.setOutput('packages-to-update', '');
        }
    } catch (e) {
        core.setOutput('error', `:x: ${e.message}`);
        throw e;
    }
})();
