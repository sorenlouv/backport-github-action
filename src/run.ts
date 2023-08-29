import * as core from '@actions/core';
import { Context } from '@actions/github/lib/context';
import {
  BackportResponse,
  backportRun,
  UnhandledErrorResult,
  getOptionsFromGithub,
  getCommits,
} from 'backport';
import { isEmpty } from 'lodash';

type Inputs = {
  accessToken: string;
  autoBackportLabelPrefix: string;
  repoForkOwner: string;
  addOriginalReviewers: boolean;
};

export async function run({
  context,
  inputs,
}: {
  context: Context;
  inputs: Inputs;
}) {
  core.info('Initiate backport');

  const options = getActionOptions(inputs, context);
  const optionsFromGithub = await getOptionsFromGithub({
    accessToken: options.accessToken,
    repoName: options.repoName,
    repoOwner: options.repoOwner,
    githubApiBaseUrlV4: options.githubApiBaseUrlV4,
  });

  core.info(JSON.stringify({ optionsFromGithub, actionOptions: options }));

  if (
    !optionsFromGithub.targetBranches &&
    !optionsFromGithub.branchLabelMapping &&
    !options.branchLabelMapping
  ) {
    throw new Error(
      'No target branches configured. Please configure `targetBranches: ["my-target-branch"]` in .backportrc.json or use the `auto_backport_label_prefix` input option.',
    );
  }

  // check if there are any target branches for this PR
  const commits = await getCommits({
    accessToken: options.accessToken,
    repoName: options.repoName,
    repoOwner: options.repoOwner,
    pullNumber: options.pullNumber,
    branchLabelMapping: options.branchLabelMapping,
  });

  core.info(JSON.stringify({ commits }));

  const suggestedTargetBranches = commits[0]?.suggestedTargetBranches;
  if (isEmpty(suggestedTargetBranches)) {
    throw new Error('No target branches found for this PR. Aborting.');
  }

  const result = await backportRun({ options, exitCodeOnFailure: false });

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
        (res): res is UnhandledErrorResult => res.status === 'unhandled-error',
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

function getActionOptions(inputs: Inputs, context: Context) {
  const { payload, repo, runId } = context;
  const pullRequest = payload.pull_request;

  if (!pullRequest) {
    throw Error('Only pull_request events are supported.');
  }

  const requestedReviewers = pullRequest.requested_reviewers as
    | Array<{ login: string }>
    | undefined;

  const options = {
    accessToken: inputs.accessToken,
    assignees: [pullRequest.user.login as string],
    branchLabelMapping:
      inputs.autoBackportLabelPrefix !== ''
        ? { [`^${inputs.autoBackportLabelPrefix}(.+)$`]: '$1' }
        : undefined,
    gitHostname: context.serverUrl.replace(/^https{0,1}:\/\//, ''), // support for Github enterprise,
    githubActionRunId: runId,
    githubApiBaseUrlV3: context.apiUrl,
    githubApiBaseUrlV4: context.graphqlUrl,
    interactive: false,
    publishStatusCommentOnFailure: true,
    pullNumber: pullRequest.number,
    repoForkOwner:
      inputs.repoForkOwner !== '' ? inputs.repoForkOwner : repo.owner,
    repoName: repo.repo,
    repoOwner: repo.owner,
    reviewers:
      inputs.addOriginalReviewers && Array.isArray(requestedReviewers)
        ? requestedReviewers.map((reviewer) => reviewer.login)
        : [],
  };

  return options;
}
