/* eslint-disable no-console */
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
  };
}) {
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

  console.log({
    assignees,
    branchLabelMapping,
    pullNumber,
    repo,
    repoForkOwner,
  });

  const result = await backportRun({
    options: {
      gitHostname: context.serverUrl.replace(/^https{0,1}:\/\//, ''),
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
    },
    exitCodeOnFailure: false,
  });

  console.log('Result', JSON.stringify(result, null, 2));

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
