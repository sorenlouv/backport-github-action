import { EventPayloads } from '@octokit/webhooks';
import { Inputs } from '.';
import * as backport from 'backport';
import { addPullRequestComment } from './backport/addPullRequestComment';
import { getBackportConfig } from './getBackportConfig';
import { updateCommitStatus } from './updateCommitStatus/updateCommitStatus';

export async function initAction({
  inputs,
  payload,
}: {
  inputs: Inputs;
  payload: EventPayloads.WebhookPayloadPullRequest;
}) {
  if (!payload.pull_request) {
    throw new Error('Pull request payload unavailable');
  }

  const username = payload.pull_request.user.login;
  const config = await getBackportConfig({ payload, inputs, username });

  const isMerged = payload.pull_request.merged;
  if (!isMerged) {
    if (
      payload.action === 'opened' ||
      payload.action === 'unlabeled' ||
      payload.action === 'labeled' ||
      payload.action === 'synchronize'
    ) {
      return updateCommitStatus(payload, inputs, config);
    }

    throw new Error('PR not merged yet...');
  }

  // backport
  const backportResponse = await backport.run(config);
  await addPullRequestComment({ config, backportResponse });
}
