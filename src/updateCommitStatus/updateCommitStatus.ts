import { Octokit } from '@octokit/rest';
import { EventPayloads } from '@octokit/webhooks';
import { Inputs } from '../index';

export async function updateCommitStatus(
  payload: EventPayloads.WebhookPayloadPullRequest,
  inputs: Inputs
) {
  const repoName = payload.repository.name;
  const repoOwner = payload.repository.owner.login;
  const octokit = new Octokit({ auth: inputs.accessToken });
  const mergeCommitSha = payload.pull_request.merge_commit_sha;
  const headSha = payload.pull_request.head.sha;

  console.log({ mergeCommitSha, headSha });

  await octokit.repos.createCommitStatus({
    owner: repoOwner,
    repo: repoName,
    sha: headSha,
    state: 'success',
    description: 'Will be backported to x & y',
  });
}
