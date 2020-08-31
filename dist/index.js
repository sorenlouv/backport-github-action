"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = require("@actions/github");
const backport_1 = __importDefault(require("backport"));
const getConfig_1 = require("./getConfig");
const addPullRequestComment_1 = require("./addPullRequestComment");
async function init() {
    const payload = github_1.context.payload;
    try {
        // ignore anything but merged PRs
        // const isMerged = payload.action === "closed" && payload.pull_request.merged;
        const isMerged = payload.action === 'closed'; // TODO: replace with real `isMerged`
        if (!isMerged) {
            console.log('PR not merged yet...');
            return;
        }
        const accessToken = core_1.default.getInput('github_token', { required: true });
        const username = payload.pull_request.user.login;
        const config = await getConfig_1.getBackportConfig({ payload, username, accessToken });
        if (!config.upstream) {
            throw new Error('Missing upstream');
        }
        if (!config.pullNumber) {
            throw new Error('Missing pull request number');
        }
        console.log('Config', config);
        const backportResponse = await backport_1.default.run(config);
        await addPullRequestComment_1.addPullRequestComment({
            upstream: config.upstream,
            pullNumber: config.pullNumber,
            accessToken,
            backportResponse,
        });
    }
    catch (error) {
        core_1.default.setFailed(error.message);
    }
}
init();
