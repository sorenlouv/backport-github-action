import { request } from '@octokit/request';
export function addPullRequestComment({ upstream, pullNumber, accessToken, backportResponse, }) {
    // abort if there are 0 results and an error occurred
    if (backportResponse.results.length === 0) {
        console.log(`Not posting pull request comment because there are no results to publish`);
        return;
    }
    const [repoOwner, repoName] = upstream.split('/');
    console.log(`Posting comment to https://github.com/${repoOwner}/${repoName}/pull/${pullNumber}`);
    return request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
        headers: {
            authorization: `token ${accessToken}`,
        },
        owner: repoOwner,
        repo: repoName,
        issue_number: pullNumber,
        body: getPullRequestBody(backportResponse),
    });
}
export function getPullRequestBody(backportResponse) {
    const header = backportResponse.success
        ? '## 💚 Backport successful\n'
        : '## 💔 Backport was not successful\n';
    const detailsHeader = backportResponse.results.length > 0
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
    const generalErrorMessage = 'errorMessage' in backportResponse
        ? `The backport operation could not be completed due to the following error:\n${backportResponse.errorMessage}`
        : '';
    return `${header}${detailsHeader}${details}\n${generalErrorMessage}`;
}
