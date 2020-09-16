import { EventPayloads } from '@octokit/webhooks';
import { Inputs } from '.';
import * as backport from 'backport';
import { addPullRequestComment } from './backport/addPullRequestComment';
import { getBackportConfig } from './getBackportConfig';
import {
  setFailedStatus,
  setSuccessStatus,
} from './updateCommitStatus/updateStatus';

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
  let config;
  try {
    config = await getBackportConfig({ payload, inputs, username });
  } catch (e) {
    await setFailedStatus(payload, inputs, e.message);
    throw e;
  }

  const isMerged = payload.pull_request.merged;
  const isStatusAction =
    !isMerged &&
    (payload.action === 'opened' ||
      payload.action === 'unlabeled' ||
      payload.action === 'labeled' ||
      payload.action === 'synchronize');

  const isBackportAction =
    isMerged && (payload.action === 'closed' || payload.action === 'labeled');

  if (isStatusAction) {
    return setSuccessStatus(payload, config);
  } else if (isBackportAction) {
    const backportResponse = await backport.run(config);
    await addPullRequestComment({ config, backportResponse });
  }
}
