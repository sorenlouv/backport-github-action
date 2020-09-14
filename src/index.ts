import * as core from '@actions/core';
import { context } from '@actions/github';
import { EventPayloads } from '@octokit/webhooks';
import { initAction } from './initAction';
import { exec } from '@actions/exec';
import { consoleLog } from './logger';

export type Inputs = {
  accessToken: string;
  backportByLabel?: string;
  prTitle?: string;
  targetPRLabels?: string;
};

async function init() {
  const payload = context.payload as EventPayloads.WebhookPayloadPullRequest;
  const { actor } = context;

  await exec(`git config --global user.name "${actor}"`);
  await exec(
    `git config --global user.email "github-action-${actor}@users.noreply.github.com"`
  );

  // Inputs
  const accessToken = core.getInput('access_token', { required: true });
  const backportByLabel = core.getInput('backport_by_label', {
    required: false,
  });
  const prTitle = core.getInput('pr_title', {
    required: false,
  });
  const targetPRLabels = core.getInput('target_pr_labels', {
    required: false,
  });
  // TODO:
  // const backportByComment = core.getInput('backport_by_comment', {
  //   required: false,
  // });

  const inputs: Inputs = {
    accessToken,
    backportByLabel,
    prTitle,
    targetPRLabels,
  };

  await initAction({ inputs, payload });
}

init().catch((error) => {
  consoleLog('An error occurred', error);
  core.setFailed(error.message);
});
