import { EventPayloads } from '@octokit/webhooks';
import { Inputs } from '.';
import { backportAction } from './backport';
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

  const isMerged = payload.pull_request.merged;
  if (!isMerged) {
    if (
      payload.action === 'unlabeled' ||
      payload.action === 'labeled' ||
      payload.action === 'synchronize'
    ) {
      return updateCommitStatus(payload, inputs);
    }

    throw new Error('PR not merged yet...');
  }

  await backportAction({ payload, inputs });
}
