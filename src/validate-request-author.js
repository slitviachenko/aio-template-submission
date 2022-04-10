import * as core from '@actions/core';
import fetch from 'node-fetch';

(async () => {
  try {
    const myArgs = process.argv.slice(2);
    const userLogin = myArgs[0];
    const npmLink = 'https://www.npmjs.com/package/' + myArgs[1];

    // todo - revert
    // fetch('https://api.github.com/repos/adobe/aio-template-submission/issues?state=closed&labels=add-template&creator=' + userLogin)
    console.log('https://api.github.com/repos/slitviachenko/aio-template-submission/issues?state=closed&labels=add-template&creator=' + userLogin);
    console.log('npmLink', npmLink);
    fetch('https://api.github.com/repos/slitviachenko/aio-template-submission/issues?state=closed&labels=add-template&creator=' + userLogin)
      .then(response => {
        if (response.status !== 200) {
          let errorMessage = `The response code is ${response.status}`;
          throw new Error(errorMessage);
        }
        return response.json();
      })
      .then(data => {
        if (data.length === 0) {
          let errorMessage = 'No add-template issues submitted by user login found.';
          core.setOutput('error', ':x: ' + errorMessage);
        } else {
          let found = data.find(element => element.body.includes(npmLink));
          if (found === undefined) {
            let errorMessage = 'Matching add-template issue by user login not found.';
            core.setOutput('error', ':x: ' + errorMessage);
          } else {
            console.log('Github add-template issue by user login found: ' + found.url);
            core.setOutput('is-owner', 'true');
          }
        }
      });
  } catch (e) {
    core.setOutput('error', `:x: ${e.message}`);
    throw e;
  }
})();
