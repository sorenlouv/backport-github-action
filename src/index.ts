import * as core from '@actions/core';
import { context } from '@actions/github';
import { getFailureMessage, run } from './run';

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
    core.info(`Backport success: ${res.status}`);
    core.setOutput('Result', res);
    const failureMessage = getFailureMessage(res);
    if (failureMessage) {
      core.setFailed(failureMessage);
    }
  })
  .catch((error) => {
    core.error(`Backport failure: ${error.message}`);
    core.setFailed(error.message);
  });
