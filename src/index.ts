/* eslint-disable no-console */
import * as core from '@actions/core';
import { exec } from '@actions/exec';
import { context } from '@actions/github';
import { graphql } from '@octokit/graphql';
import { backportRun } from 'backport';

async function init() {
  const { payload, repo } = context;
  const accessToken = core.getInput('github_token', { required: true });

  const { repository } = await graphql(
    `
      query getAuthor {
        viewer {
          name
          login
          isEmployee
          repositories(first: 10) {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    `,
    {
      headers: {
        authorization: `token ${accessToken}`,
      },
    }
  );
  console.log('repo', JSON.stringify(repository));

  if (!payload.pull_request) {
    throw Error('Only pull_request events are supported.');
  }

  const pullRequest = payload.pull_request;
  const prAuthor: string = pullRequest.user.login;
  const commitUser = core.getInput('commit_user', { required: false });
  const commitEmail = core.getInput('commit_email', { required: false });
  const username = core.getInput('username', { required: false });

  await exec(`git config --global user.name "${commitUser}"`);
  await exec(`git config --global user.email "${commitEmail}"`);

  await backportRun({
    repoOwner: repo.owner,
    repoName: repo.repo,
    username,
    accessToken,
    ci: true,
    pullNumber: pullRequest.number,
    assignees: [prAuthor],
  });
}

init().catch((error) => {
  console.error('An error occurred', error);
  core.setFailed(error.message);
});
