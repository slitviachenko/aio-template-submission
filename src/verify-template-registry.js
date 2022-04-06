import * as core from '@actions/core';
import { getRegistry } from "./registry.js";

const myArgs = process.argv.slice(2);
const issueNumber = myArgs[0];
console.log('issueNumber', issueNumber);

const registry = getRegistry();
for (const item of registry) {
    console.log('item', item);
}
