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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
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
        const accessToken = core.getInput('github_token', { required: true });
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
        core.setFailed(error.message);
    }
}
init().catch((e) => {
    console.log('An error occurred', e);
});
