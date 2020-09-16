import { Octokit } from '@octokit/rest';
import { EventPayloads } from '@octokit/webhooks';
import { Inputs } from '../index';
import { ConfigOptions, getTargetBranchForLabel } from 'backport';
import { RequiredOptions } from '../getBackportConfig';

export async function setSuccessStatus(
  payload: EventPayloads.WebhookPayloadPullRequest,
  config: ConfigOptions & RequiredOptions,
  inputs: Inputs
) {
  const repoName = payload.repository.name;
  const repoOwner = payload.repository.owner.login;
  const headSha = payload.pull_request.head.sha;
  const octokit = new Octokit({ auth: config.accessToken });
  const targetBranches = payload.pull_request.labels
    .map((label) => {
      return getTargetBranchForLabel({
        branchLabelMapping: config.branchLabelMapping,
        label: label.name,
      });
    })
    .filter((targetBranch) => !!targetBranch);

  const maySkipBackportCheck =
    inputs.skipBackportCheck ||
    payload.pull_request.labels.some(
      (label) => label.name === inputs.skipBackportCheckLabel
    );

  const state =
    targetBranches.length > 0 || maySkipBackportCheck ? 'success' : 'failure';

  const description = getDescription(
    targetBranches,
    maySkipBackportCheck,
    inputs.skipBackportCheckLabel
  );

  console.log(`Setting success status`, targetBranches, headSha);
  await octokit.repos.createCommitStatus({
    owner: repoOwner,
    repo: repoName,
    sha: headSha,
    state,
    description,
    context: 'Backport',
  });
}

function getDescription(
  targetBranches: (string | undefined)[],
  maySkipBackportCheck: boolean,
  skipBackportCheckLabel: string
) {
  if (targetBranches.length > 0) {
    return `This PR will be backported to: ${targetBranches.join(',')}`;
  }

  if (maySkipBackportCheck) {
    return 'This PR will not be backported';
  }

  return `Please add a version label or add the "${skipBackportCheckLabel}" label`;
}

export async function setErrorStatus(
  payload: EventPayloads.WebhookPayloadPullRequest,
  inputs: Inputs,
  errorMessage: string
) {
  const repoName = payload.repository.name;
  const repoOwner = payload.repository.owner.login;
  const headSha = payload.pull_request.head.sha;

  const octokit = new Octokit({ auth: inputs.accessToken });

  console.log(`Setting error status: ${errorMessage}`);
  await octokit.repos.createCommitStatus({
    owner: repoOwner,
    repo: repoName,
    sha: headSha,
    state: 'error',
    description: `Cannot automatically backport: ${errorMessage}`,
    context: 'Backport',
  });
}
