import * as core from '@actions/core';
import * as github from '@actions/github';
import { getRegistry } from "./registry.js";

const GITHUB_REPO = 'aio-template-submission';
const GITHUB_REPO_OWNER = 'adobe';

(async () => {
    try {
        const myArgs = process.argv.slice(2);
        const issueNumber = myArgs[0];
        const githubToken = myArgs[1];
        const octokit = new github.getOctokit(githubToken);
        console.log('issueNumber', issueNumber);

        const registry = getRegistry();
        for (const item of registry) {
            const packageName = item.name;
            const gitHubUrl = item.links.npm;
            const npmUrl = item.links.github;
            await octokit.rest.issues.createComment({
                'owner': GITHUB_REPO_OWNER,
                'repo': GITHUB_REPO,
                'issue_number': issueNumber,
                'body': {
                    packageName,
                    npmUrl,
                    gitHubUrl
                }
            });
            console.log('item', item);
        }
    } catch (e) {
        core.setOutput('error', `:x: ${e.message}`);
        throw e;
    }
})();
