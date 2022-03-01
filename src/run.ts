/* eslint-disable no-console */
import { Context } from '@actions/github/lib/context';
import { backportRun } from 'backport';

export async function run({
  context,
  inputs,
}: {
  context: Context;
  inputs: {
    accessToken: string;
    autoBackportLabelPrefix: string;
    repoForkOwner: string;
  };
}) {
  const { payload, repo } = context;
  const pullRequest = payload.pull_request;

  if (!pullRequest) {
    throw Error('Only pull_request events are supported.');
  }

  const branchLabelMapping =
    inputs.autoBackportLabelPrefix !== ''
      ? { [`^${inputs.autoBackportLabelPrefix}-(.+)$`]: '$1' }
      : undefined;

  const repoForkOwner =
    inputs.repoForkOwner !== '' ? inputs.repoForkOwner : repo.owner;

  // payload params
  const pullNumber = pullRequest.number;
  const assignees = [pullRequest.user.login];

  console.log({
    assignees,
    branchLabelMapping,
    pullNumber,
    repo,
    repoForkOwner,
  });

  const result = await backportRun({
    accessToken: inputs.accessToken,
    assignees,
    branchLabelMapping,
    ci: true,
    pullNumber,
    repoForkOwner,
    repoName: repo.repo,
    repoOwner: repo.owner,
  });

  return result;
}
