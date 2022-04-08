import * as core from '@actions/core';
import { getRegistry } from "./registry.js";

(async () => {
    try {
        const packages = {
            packages: []
        };
        const registry = getRegistry();
        for (const item of registry) {
            const packageName = item.name;
            const packageNpmUrl = item.links.npm;
            const packageGithubUrl = item.links.github;
            packages.packages.push({
                packageName,
                packageNpmUrl,
                packageGithubUrl
            });
        }
        core.setOutput('list', JSON.stringify(packages));
    } catch (e) {
        core.setOutput('error', `:x: ${e.message}`);
        throw e;
    }
})();
