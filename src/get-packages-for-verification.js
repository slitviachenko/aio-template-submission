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
            packages.packages.push(packageName);
        }
        core.setOutput('list', JSON.stringify(packages));
    } catch (e) {
        core.setOutput('error', `:x: ${e.message}`);
        throw e;
    }
})();
