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
const backport = __importStar(require("backport"));
const run_1 = require("./run");
describe('run', () => {
    it('calls backport with correct arguments', async () => {
        const spy = jest
            .spyOn(backport, 'backportRun')
            // @ts-expect-error
            .mockResolvedValue('backport return value');
        await (0, run_1.run)({
            inputs: {
                accessToken: 'very-secret',
                autoBackportLabelPrefix: 'backport-to-',
                repoForkOwner: '',
            },
            context: {
                repo: { owner: 'elastic', repo: 'kibana' },
                payload: {
                    pull_request: {
                        number: 1345,
                        user: { login: 'sqren' },
                    },
                },
            },
        });
        expect(spy).toHaveBeenCalledWith({
            exitCodeOnFailure: false,
            options: {
                accessToken: 'very-secret',
                assignees: ['sqren'],
                branchLabelMapping: {
                    '^backport-to-(.+)$': '$1',
                },
                interactive: false,
                publishStatusCommentOnFailure: true,
                pullNumber: 1345,
                repoForkOwner: 'elastic',
                repoName: 'kibana',
                repoOwner: 'elastic',
            },
        });
    });
});
describe('getFailureMessage', () => {
    describe('success', () => {
        it('should return empty when there are no unhandled errors', () => {
            const res = {
                status: 'success',
                commits: [],
                results: [],
            };
            expect((0, run_1.getFailureMessage)(res)).toBe(undefined);
        });
        it('ignores handled errors', () => {
            const res = {
                status: 'success',
                commits: [],
                results: [
                    {
                        status: 'handled-error',
                        error: new backport.BackportError('Hello'),
                        targetBranch: '7.x',
                    },
                ],
            };
            expect((0, run_1.getFailureMessage)(res)).toBe(undefined);
        });
        it('returns unhandled errors', () => {
            const res = {
                status: 'success',
                commits: [],
                results: [
                    {
                        status: 'unhandled-error',
                        error: new Error('My unhandled error'),
                        targetBranch: '7.x',
                    },
                    {
                        status: 'unhandled-error',
                        error: new Error('Another unhandled error'),
                        targetBranch: '7.x',
                    },
                ],
            };
            expect((0, run_1.getFailureMessage)(res)).toBe('Unhandled errors: My unhandled error, Another unhandled error');
        });
    });
    describe('failure', () => {
        it('should error message', () => {
            const res = {
                status: 'failure',
                commits: [],
                error: new Error('My failure'),
                errorMessage: 'My failure',
            };
            expect((0, run_1.getFailureMessage)(res)).toBe('My failure');
        });
    });
    describe('aborted', () => {
        it('should error message', () => {
            const e = new backport.BackportError({
                code: 'abort-conflict-resolution-exception',
            });
            const res = {
                status: 'aborted',
                commits: [],
                error: e,
                errorMessage: e.message,
            };
            expect((0, run_1.getFailureMessage)(res)).toBe('Conflict resolution was aborted by the user');
        });
    });
});
