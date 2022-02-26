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
  const autoBackportLabelPrefixInput = core.getInput(
    'autoBackportLabelPrefix',
    { required: false }
  );
  const branchLabelMapping =
    autoBackportLabelPrefixInput !== ''
      ? { [`^${autoBackportLabelPrefixInput}-(.+)$`]: '$1' }
      : undefined;

  const repoForkOwnerInput = core.getInput('repoForkOwner', {
    required: false,
  });
  const repoForkOwner =
    repoForkOwnerInput !== '' ? repoForkOwnerInput : repo.owner;

  // payload params
  const pullNumber = payload.pull_request.number;
  const assignees = [payload.pull_request.user.login];

  console.log({
    assignees,
    branchLabelMapping,
    pullNumber,
    repo,
    repoForkOwner,
  });

  const result = await backportRun({
    accessToken,
    assignees,
    branchLabelMapping,
    ci: true,
    pullNumber,
    repoForkOwner,
    repoName: repo.repo,
    repoOwner: repo.owner,
  });

  console.log(JSON.stringify(result, null, 2));
}

init().catch((error) => {
  console.error('An error occurred while backporting', error);
  core.setFailed(error.message);
});
