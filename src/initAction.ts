import * as backport from 'backport';
import { EventPayloads } from '@octokit/webhooks';
import { getBackportConfig } from './getBackportConfig';
import { addPullRequestComment } from './addPullRequestComment';
import { consoleLog } from './logger';

export async function initAction({
  inputs,
  payload,
}: {
  inputs: {
    accessToken: string;
    backportByLabel: string;
    prTitle: string;
    targetPRLabels: string;
  };
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
    accessToken: inputs.accessToken,
    backportByLabel: inputs.backportByLabel,
    prTitle: inputs.prTitle,
    targetPRLabels: inputs.targetPRLabels,
  });

  consoleLog('Config', config);

  if (!config.upstream) {
    throw new Error('Missing upstream');
  }

  if (!config.pullNumber) {
    throw new Error('Missing pull request number');
  }

  if (!config.branchLabelMapping) {
    throw new Error('Missing required `branchLabelMapping`');
  }

  const backportResponse = await backport.run(config);

  await addPullRequestComment({
    upstream: config.upstream,
    pullNumber: config.pullNumber,
    accessToken: inputs.accessToken,
    backportResponse,
  });

  return config;
}
