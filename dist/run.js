"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFailureMessage = exports.run = void 0;
const backport_1 = require("backport");
async function run({ context, inputs, }) {
    const { payload, repo } = context;
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
    console.log({
        assignees,
        branchLabelMapping,
        pullNumber,
        repo,
        repoForkOwner,
    });
    const result = await (0, backport_1.backportRun)({
        options: {
            accessToken: inputs.accessToken,
            assignees,
            branchLabelMapping,
            publishStatusCommentOnFailure: true,
            pullNumber,
            repoForkOwner,
            repoName: repo.repo,
            repoOwner: repo.owner,
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
