"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFailureMessage = exports.run = void 0;
const core = __importStar(require("@actions/core"));
const backport_1 = require("backport");
async function run({ context, inputs, }) {
    core.info('Initiate backport');
    process.env['NODE_ENV'] = 'production-github-action';
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
    core.info(JSON.stringify({
        assignees,
        branchLabelMapping,
        pullNumber,
        repo,
        repoForkOwner,
        reviewers,
    }));
    // support for Github enterprise
    const gitHostname = context.serverUrl.replace(/^https{0,1}:\/\//, '');
    const result = await (0, backport_1.backportRun)({
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
