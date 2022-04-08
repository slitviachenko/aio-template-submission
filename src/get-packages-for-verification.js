import * as core from '@actions/core';
import * as github from '@actions/github';
import { getRegistry } from "./registry.js";

const GITHUB_REPO = 'aio-template-submission';
// const GITHUB_REPO_OWNER = 'adobe';
const GITHUB_REPO_OWNER = 'slitviachenko';

(async () => {
    try {
        const githubToken = process.env.GITHUB_TOKEN;
        const myArgs = process.argv.slice(2);
        const issueNumber = myArgs[0];
        const octokit = new github.getOctokit(githubToken);
        console.log('issueNumber', issueNumber);

        const data = {
            packages: []
        };
        const registry = getRegistry();
        for (const item of registry) {
            const packageName = item.name;
            const packageNpmUrl = item.links.npm;
            const packageGithubUrl = item.links.github;
            data.packages.push({
                'packageName': packageName,
                'packageNpmUrl': packageNpmUrl,
                'packageGithubUrl': packageGithubUrl,
                'action': 'update'
            });
        }
        if (data.packages.length > 0) {
            let comment = 'We are going to:\n';
            for (const item in data.packages) {
                comment += `- ${item.action} "${item.packageName}"`
            }
            await octokit.rest.issues.createComment({
                'owner': GITHUB_REPO_OWNER,
                'repo': GITHUB_REPO,
                'issue_number': issueNumber,
                'body': comment
            });
        } else {
            await octokit.rest.issues.createComment({
                'owner': GITHUB_REPO_OWNER,
                'repo': GITHUB_REPO,
                'issue_number': issueNumber,
                'body': ':white_check_mark: All template packages in Template Registry contain the latest information. Nothing to update.'
            });
        }
        core.setOutput('data', JSON.stringify(data));
    } catch (e) {
        core.setOutput('error', `:x: ${e.message}`);
        throw e;
    }
})();
