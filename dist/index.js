"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
/* eslint-disable no-console */
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const backport_1 = require("backport");
async function init() {
    const { payload, repo } = github_1.context;
    if (!payload.pull_request) {
        throw Error('Only pull_request events are supported.');
    }
    // required params
    const accessToken = core.getInput('github_token', { required: true });
    // optional params
    const username = core.getInput('username', { required: false });
    // payload params
    const pullNumber = payload.pull_request.number;
    const assignees = [payload.pull_request.user.login];
    console.log({ repo, username, pullNumber, assignees });
    await (0, backport_1.backportRun)({
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
