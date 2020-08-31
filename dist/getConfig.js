"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBackportConfig = void 0;
const got_1 = __importDefault(require("got"));
async function getBackportConfig({ payload, username, accessToken, }) {
    var _a, _b;
    const configUrl = `https://raw.githubusercontent.com/${payload.repository.owner.login}/${payload.repository.name}/${payload.repository.default_branch}/.backportrc.json`;
    try {
        const response = await got_1.default(configUrl);
        const projectConfig = JSON.parse(response.body);
        return {
            ...projectConfig,
            username,
            accessToken,
            ci: true,
            pullNumber: payload.pull_request.number,
            //@ts-expect-error (to be fixed in https://github.com/octokit/webhooks/issues/136)
            assignees: [(_a = payload.pull_request.merged_by) === null || _a === void 0 ? void 0 : _a.login],
        };
    }
    catch (e) {
        if (((_b = e.response) === null || _b === void 0 ? void 0 : _b.statusCode) === 404) {
            throw new Error(`No config exists for ${configUrl}`);
        }
        throw e;
    }
}
exports.getBackportConfig = getBackportConfig;
