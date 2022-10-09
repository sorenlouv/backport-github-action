"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFailureMessage = exports.run = void 0;
const backport_1 = require("backport");
async function run({ context, inputs, }) {
    const { payload, repo, runId } = context;
    const pullRequest = payload.pull_request;
    if (!pullRequest) {
        throw Error('Only pull_request events are supported.');
    }
    const branchLabelMapping = inputs.autoBackportLabelPrefix !== ''
        ? { [`^${inputs.autoBackportLabelPrefix}(.+)$`]: '$1' }
        : undefined;
    const repoForkOwner = inputs.repoForkOwner !== '' ? inputs.repoForkOwner : repo.owner;
    // payload params
    const pullNumber = pullRequest.number;
    const assignees = [pullRequest.user.login];
    const requestedReviewers = pullRequest.requested_reviewers;
    const reviewers = inputs.addOriginalReviewers && Array.isArray(requestedReviewers)
        ? requestedReviewers.map((reviewer) => reviewer.login)
        : [];
    console.log({
        assignees,
        branchLabelMapping,
        pullNumber,
        repo,
        repoForkOwner,
        reviewers,
    });
    const result = await (0, backport_1.backportRun)({
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
            reviewers,
        },
        exitCodeOnFailure: false,
    });
    console.log('Result', JSON.stringify(result, null, 2));
    return result;
}
exports.run = run;
function getFailureMessage(res) {
    switch (res.status) {
        case 'failure':
        case 'aborted':
            return res.errorMessage;
        case 'success': {
            const unhandledErrorResults = res.results.filter((res) => res.status === 'unhandled-error');
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
exports.getFailureMessage = getFailureMessage;
