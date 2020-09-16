import { Octokit } from '@octokit/rest';
import { EventPayloads } from '@octokit/webhooks';
import { Inputs } from '../index';
import { ConfigOptions, getTargetBranchForLabel } from 'backport';
import { RequiredOptions } from '../getBackportConfig';

export async function setStatus(
  payload: EventPayloads.WebhookPayloadPullRequest,
  config: ConfigOptions & RequiredOptions
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
    .filter((targetBranch) => !!targetBranch)
    .join(', ');

  const state = targetBranches.length > 0 ? 'success' : 'pending';
  const description =
    targetBranches.length > 0
      ? `This PR will be backported automatically to: ${targetBranches}`
      : 'This PR will not be backported since no labels matched';

  console.log(`Setting status`, state, targetBranches, headSha);
  await octokit.repos.createCommitStatus({
    owner: repoOwner,
    repo: repoName,
    sha: headSha,
    state: state,
    description,
    context: 'Backport',
  });
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
