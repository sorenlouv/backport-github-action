import { Octokit } from '@octokit/rest';
import { BackportResponse, ConfigOptions } from 'backport';
import { RequiredOptions } from './getBackportConfig';
import { consoleLog } from './logger';

export async function addPullRequestComment({
  config,
  backportResponse,
}: {
  config: ConfigOptions & RequiredOptions;
  backportResponse: BackportResponse;
}): Promise<unknown> {
  // abort if there are 0 results and an error occurred
  if (backportResponse.results.length === 0) {
    consoleLog(
      `Not posting pull request comment because there are no results to publish`
    );
    return;
  }

  const [repoOwner, repoName] = config.upstream.split('/');
  consoleLog(
    `Posting comment to https://github.com/${repoOwner}/${repoName}/pull/${config.pullNumber}`
  );

  const octokit = new Octokit({
    auth: config.accessToken,
  });

  return octokit.issues.createComment({
    body: getPullRequestBody(backportResponse),
    issue_number: config.pullNumber,
    owner: repoOwner,
    repo: repoName,
  });
}

export function getPullRequestBody(backportResponse: BackportResponse): string {
  const header = backportResponse.success
    ? '## 💚 Backport successful\n'
    : '## 💔 Backport was not successful\n';

  const detailsHeader =
    backportResponse.results.length > 0
      ? backportResponse.success
        ? 'The PR was backported to the following branches:\n'
        : 'The PR was attempted backported to the following branches:\n'
      : '';

  const details = backportResponse.results
    .map((result) => {
      if (result.success) {
        return ` - ✅ [${result.targetBranch}](${result.pullRequestUrl})`;
      }

      return ` - ❌ ${result.targetBranch}: ${result.errorMessage}`;
    })
    .join('\n');

  const generalErrorMessage =
    'errorMessage' in backportResponse
      ? `The backport operation could not be completed due to the following error:\n${backportResponse.errorMessage}`
      : '';

  return `${header}${detailsHeader}${details}\n${generalErrorMessage}`;
}
