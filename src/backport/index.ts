import * as backport from 'backport';
import { getBackportConfig } from './getBackportConfig';
import { addPullRequestComment } from './addPullRequestComment';
import { EventPayloads } from '@octokit/webhooks';
import { Inputs } from '..';

export async function backportAction({
  payload,
  inputs,
}: {
  payload: EventPayloads.WebhookPayloadPullRequest;
  inputs: Inputs;
}) {
  const username = payload.pull_request.user.login;
  const config = await getBackportConfig({
    payload,
    inputs,
    username,
  });

  const backportResponse = await backport.run(config);

  await addPullRequestComment({
    config,
    backportResponse,
  });

  return config;
}
