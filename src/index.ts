/* eslint-disable no-console */
import * as core from '@actions/core';
import { context } from '@actions/github';
import { run } from './run';

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
    core.setOutput('Result', res);
    if (res.status === 'failure') {
      core.setFailed(res.errorMessage);
    }
  })
  .catch((error) => {
    console.error('An error occurred while backporting', error);
    core.setFailed(error.message);
  });
