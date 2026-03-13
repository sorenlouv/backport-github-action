import * as core from '@actions/core';
import { context } from '@actions/github';
import { getFailureMessage, run } from './run';

// set environment for APM
process.env['NODE_ENV'] = 'production-github-action';

run({
  context,
  inputs: {
    accessToken: core.getInput('github_token', {
      required: true,
    }),
    autoBackportLabelPrefix: core.getInput('auto_backport_label_prefix', {
      required: false,
    }),
    repoForkOwner: core.getInput('repo_fork_owner', {
      required: false,
    }),
    addOriginalReviewers: core.getBooleanInput('add_original_reviewers', {
      required: false,
    }),
  },
})
  .then((res) => {
    core.info(`Backport result: ${res.status}`);
    core.setOutput('Result', res);
    const failureMessage = getFailureMessage(res);
    if (failureMessage) {
      // if the failure message includes the string "There are no branches to backport to.", we don't want to fail the action, instead just issue a warning
      if (failureMessage.includes('There are no branches to backport to.')) {
        core.warning(failureMessage);
      } else {
        core.setFailed(failureMessage);
      }
    }
  })
  .catch((error) => {
    core.error(`Backport unable to be completed: ${error.message}`);
    core.setFailed(error.message);
  });
