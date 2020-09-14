import * as backport from 'backport';
import { EventPayloads } from '@octokit/webhooks';
import { getBackportConfig } from './getBackportConfig';
import { addPullRequestComment } from './addPullRequestComment';
import { Inputs } from '.';

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

  // ignore anything but merged PRs
  const isMerged = payload.pull_request.merged;
  if (!isMerged) {
    throw new Error('PR not merged yet...');
  }

  const username = payload.pull_request.user.login;
  const config = await getBackportConfig({
    payload,
    username,
    inputs,
  });

  const backportResponse = await backport.run(config);

  await addPullRequestComment({
    config,
    backportResponse,
  });

  return config;
}
