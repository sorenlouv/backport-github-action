import core from '@actions/core';
import { context } from '@actions/github';
import backport from 'backport';
import { EventPayloads } from '@octokit/webhooks';
import { getBackportConfig } from './getConfig';
import { addPullRequestComment } from './addPullRequestComment';

async function init() {
  const payload = context.payload as EventPayloads.WebhookPayloadPullRequest;

  try {
    // ignore anything but merged PRs
    // const isMerged = payload.action === "closed" && payload.pull_request.merged;
    const isMerged = payload.action === 'closed'; // TODO: replace with real `isMerged`
    if (!isMerged) {
      console.log('PR not merged yet...');
      return;
    }

    const accessToken = core.getInput('github_token', { required: true });
    const username = payload.pull_request.user.login;
    const config = await getBackportConfig({ payload, username, accessToken });

    if (!config.upstream) {
      throw new Error('Missing upstream');
    }

    if (!config.pullNumber) {
      throw new Error('Missing pull request number');
    }

    console.log('Config', config);
    const backportResponse = await backport.run(config);

    await addPullRequestComment({
      upstream: config.upstream,
      pullNumber: config.pullNumber,
      accessToken,
      backportResponse,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

init();
