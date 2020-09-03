import * as core from '@actions/core';
import { context } from '@actions/github';
import * as backport from 'backport';
import { EventPayloads } from '@octokit/webhooks';
import { getBackportConfig } from './getConfig';
import { addPullRequestComment } from './addPullRequestComment';
import { exec } from '@actions/exec';

async function init() {
  console.log('hello1');
  await exec(`git config --global user.name "${context.actor}"`);
  await exec(
    `git config --global user.email "github-action-${context.actor}@users.noreply.github.com"`
  );

  const payload = context.payload as EventPayloads.WebhookPayloadPullRequest;

  try {
    // ignore anything but merged PRs
    const isMerged = payload.pull_request.merged;
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

init().catch((e) => {
  console.log('An error occurred', e);
});
