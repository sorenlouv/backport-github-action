/* eslint-disable no-console */
import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { context } from '@actions/github';
import { backportRun } from 'backport';

async function init() {
  const { payload, repo } = context;

  if (!payload.pull_request) {
    throw Error('Only pull_request events are supported.');
  }

  // required params
  const accessToken = core.getInput('github_token', { required: true });

  // optional params
  const commitUser = core.getInput('commit_user', { required: false });
  const commitEmail = core.getInput('commit_email', { required: false });
  const username = core.getInput('username', { required: false });

  // payload params
  const pullNumber = payload.pull_request.number;
  const assignees = [payload.pull_request.user.login];

  console.log({
    repo,
    commitUser,
    commitEmail,
    username,
    pullNumber,
    assignees,
  });

  await exec(`git config --global user.name "${commitUser}"`);
  await exec(`git config --global user.email "${commitEmail}"`);

  await backportRun({
    repoOwner: repo.owner,
    repoName: repo.repo,
    username: username !== '' ? username : repo.owner,
    accessToken,
    ci: true,
    pullNumber,
    assignees,
  });
}

init().catch((error) => {
  console.error('An error occurred', error);
  core.setFailed(error.message);
});
