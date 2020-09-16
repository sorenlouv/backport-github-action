import { Octokit } from '@octokit/rest';
import { EventPayloads } from '@octokit/webhooks';
import { Inputs } from '../index';
import { ConfigOptions, getTargetBranchForLabel } from 'backport';
import { RequiredOptions } from '../getBackportConfig';

export async function setSuccessStatus(
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

  console.log('Setting success status', targetBranches, headSha);
  await octokit.repos.createCommitStatus({
    owner: repoOwner,
    repo: repoName,
    sha: headSha,
    state: 'success',
    description: `Will be backported automatically to: ${targetBranches}`,
    context: 'Backport',
  });
}

export async function setFailedStatus(
  payload: EventPayloads.WebhookPayloadPullRequest,
  inputs: Inputs,
  errorMessage: string
) {
  const repoName = payload.repository.name;
  const repoOwner = payload.repository.owner.login;
  const headSha = payload.pull_request.head.sha;

  const octokit = new Octokit({ auth: inputs.accessToken });

  console.log(`Setting failed status: ${errorMessage}`);
  await octokit.repos.createCommitStatus({
    owner: repoOwner,
    repo: repoName,
    sha: headSha,
    state: 'failure',
    description: `Cannot automatically backport: ${errorMessage}`,
    context: 'Backport',
  });
}
