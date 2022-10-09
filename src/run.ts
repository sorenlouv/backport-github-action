import * as core from '@actions/core';
import { Context } from '@actions/github/lib/context';
import { BackportResponse, backportRun, UnhandledErrorResult } from 'backport';

export async function run({
  context,
  inputs,
}: {
  context: Context;
  inputs: {
    accessToken: string;
    autoBackportLabelPrefix: string;
    repoForkOwner: string;
    addOriginalReviewers: boolean;
  };
}) {
  core.info('Initiate backport');

  const { payload, repo, runId } = context;
  const pullRequest = payload.pull_request;

  if (!pullRequest) {
    throw Error('Only pull_request events are supported.');
  }

  const branchLabelMapping =
    inputs.autoBackportLabelPrefix !== ''
      ? { [`^${inputs.autoBackportLabelPrefix}(.+)$`]: '$1' }
      : undefined;

  const repoForkOwner =
    inputs.repoForkOwner !== '' ? inputs.repoForkOwner : repo.owner;

  // payload params
  const pullNumber = pullRequest.number;
  const assignees = [pullRequest.user.login];
  const requestedReviewers = pullRequest.requested_reviewers as
    | Array<{ login: string }>
    | undefined;

  const reviewers =
    inputs.addOriginalReviewers && Array.isArray(requestedReviewers)
      ? requestedReviewers.map((reviewer) => reviewer.login)
      : [];

  core.info(
    JSON.stringify({
      assignees,
      branchLabelMapping,
      pullNumber,
      repo,
      repoForkOwner,
      reviewers,
    })
  );

  // support for Github enterprise
  const gitHostname = context.serverUrl.replace(/^https{0,1}:\/\//, '');
  const result = await backportRun({
    options: {
      gitHostname,
      accessToken: inputs.accessToken,
      assignees,
      branchLabelMapping,
      githubActionRunId: runId,
      interactive: false,
      publishStatusCommentOnFailure: true,
      pullNumber,
      repoForkOwner,
      repoName: repo.repo,
      repoOwner: repo.owner,
      githubApiBaseUrlV3: context.apiUrl,
      githubApiBaseUrlV4: context.graphqlUrl,
      reviewers,
    },
    exitCodeOnFailure: false,
  });

  core.info(`Result ${JSON.stringify(result, null, 2)}`);
  return result;
}

export function getFailureMessage(res: BackportResponse) {
  switch (res.status) {
    case 'failure':
    case 'aborted':
      return res.errorMessage;

    case 'success': {
      const unhandledErrorResults = res.results.filter(
        (res): res is UnhandledErrorResult => res.status === 'unhandled-error'
      );

      // only return message if there are unhandled errors
      // handled errors should not be output
      if (unhandledErrorResults.length > 0) {
        return `Unhandled errors: ${unhandledErrorResults
          .map((res) => res.error.message)
          .join(', ')}`;
      }
    }
  }
}
