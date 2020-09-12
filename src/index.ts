import * as core from '@actions/core';
import { context } from '@actions/github';
import { EventPayloads } from '@octokit/webhooks';
import { main } from './main';

const payload = context.payload as EventPayloads.WebhookPayloadPullRequest;
const actor = context.actor;

main(payload, actor).catch((error) => {
  console.log('An error occurred', error);
  core.setFailed(error.message);
});
