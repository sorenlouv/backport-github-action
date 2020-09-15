import { Octokit } from '@octokit/rest';
import { EventPayloads } from '@octokit/webhooks';
import { Inputs } from '../index';
import { ConfigOptions, getTargetBranchForLabel } from 'backport';
import { RequiredOptions } from '../getBackportConfig';

export async function updateCommitStatus(
  payload: EventPayloads.WebhookPayloadPullRequest,
  inputs: Inputs,
  config: ConfigOptions & RequiredOptions
) {
  const repoName = payload.repository.name;
  const repoOwner = payload.repository.owner.login;
  const octokit = new Octokit({ auth: inputs.accessToken });
  const headSha = payload.pull_request.head.sha;

  const targetBranches = payload.pull_request.labels
    .map((label) => {
      return getTargetBranchForLabel({
        branchLabelMapping: config.branchLabelMapping,
        label: label.name,
      });
    })
    .filter((targetBranch) => !!targetBranch)
    .join(', ');

  await octokit.repos.createCommitStatus({
    owner: repoOwner,
    repo: repoName,
    sha: headSha,
    state: 'success',
    description: `Will be backported to: ${targetBranches}`,
    context: 'Backport',
  });
}
