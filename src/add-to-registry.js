import { v4 as uuidv4 } from 'uuid';
import * as core from '@actions/core';
import { isAdobeRecommended } from './is-adobe-recommended.js';
import { isInRegistry, addToRegistry, getFromRegistry, updateInRegistry } from './registry.js';
import fs from 'fs';
import YAML from 'yaml';

const OPERATION_ADD = 'add';
const OPERATION_UPDATE = 'update';

// Simple script that collects template metadata and adds/updates it in/to the registry
(async () => {
    try {
        const myArgs = process.argv.slice(2);
        const operation = myArgs[0];
        const packagePath = myArgs[1];
        const gitHubUrl = myArgs[2];
        const npmUrl = myArgs[3];

        const supportedOperations = [
            OPERATION_ADD,
            OPERATION_UPDATE
        ];
        if (!supportedOperations.includes(operation)) {
            const errorMessage = `:x: Unsupported operation.`;
            throw new Error(errorMessage);
        }

        // Grab package.json data
        const packageJson = fs.readFileSync(packagePath + '/package.json', 'utf8');
        const packageJsonData = JSON.parse(packageJson);

        // Grab install.yml data
        const installYml = fs.readFileSync(packagePath + '/install.yml', 'utf8');
        const installYmlData = YAML.parse(installYml);

        const adobeRecommended = await isAdobeRecommended(gitHubUrl);

        const templateData = {
            "author": packageJsonData.author,
            "name": packageJsonData.name,
            "description": packageJsonData.description,
            "latestVersion": packageJsonData.version,
            "extensionPoints": [].concat(installYmlData.extension.name),
            "categories": [].concat(installYmlData.categories),
            "adobeRecommended": adobeRecommended,
            "keywords": [].concat(packageJsonData.keywords),
            "links": {
                "npm": npmUrl,
                "github": gitHubUrl
            }
        };
        if (operation === 'update') {
            const savedTemplate = getFromRegistry(packageJsonData.name);
            const updatedTemplate = { ...savedTemplate, ...templateData };
            updateInRegistry(updatedTemplate);
            console.log('Template was updated.', newTemplate);
        } else if (operation === 'add') {
            // Check for duplicates
            if (isInRegistry(packageJsonData.name)) {
                const errorMessage = ':x: Template with name `' + packageJsonData.name + '` already exists in Template Registry.';
                throw new Error(errorMessage);
            }
            // Create registry item object
            const newTemplate = {
                ...{
                    "id": uuidv4(),
                    "publishDate": new Date(Date.now())
                },
                ...templateData
            };
            addToRegistry(newTemplate);
            console.log('Template was added.', newTemplate);
        }
    } catch (e) {
        core.setOutput('error', e.message);
        throw e;
    }
})();
