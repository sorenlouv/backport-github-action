/* eslint-disable no-console */
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
  },
})
  .then((res) => {
    console.log('Result', JSON.stringify(res, null, 2));

    const failureMessage = getFailureMessage(res);
    if (failureMessage) {
      core.setFailed(failureMessage);
    }
  })
  .catch((error) => {
    console.error('An error occurred while backporting', error);
    core.setFailed(error.message);
  });
