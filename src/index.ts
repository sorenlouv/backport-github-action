/* eslint-disable no-console */
import * as core from '@actions/core';
import { context } from '@actions/github';
import { backportRun } from 'backport';

async function init() {
  const { payload, repo } = context;

  if (!payload.pull_request) {
    throw Error('Only pull_request events are supported.');
  }

  // required params
  const accessToken = core.getInput('github_token', { required: true });

  // optional params
  const repoForkOwner = core.getInput('repoForkOwner', { required: false });

  // payload params
  const pullNumber = payload.pull_request.number;
  const assignees = [payload.pull_request.user.login];

  console.log({ repo, repoForkOwner, pullNumber, assignees });

  await backportRun({
    accessToken,
    assignees,
    ci: true,
    pullNumber,
    repoForkOwner: repoForkOwner !== '' ? repoForkOwner : repo.owner,
    repoName: repo.repo,
    repoOwner: repo.owner,
  });
}

init().catch((error) => {
  console.error('An error occurred', error);
  core.setFailed(error.message);
});
