import * as core from '@actions/core';
import type { context } from '@actions/github';
import type { BackportResponse } from 'backport';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getFailureMessage, run } from './run.js';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  setFailed: vi.fn(),
  getInput: vi.fn(),
  setOutput: vi.fn(),
}));

vi.mock('backport', () => ({
  backportRun: vi.fn(),
  getOptionsFromGithub: vi.fn(),
  getCommits: vi.fn(),
}));

type Context = typeof context;

describe('run', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls backport with correct arguments', async () => {
    const { backportRun, getOptionsFromGithub, getCommits } = await import('backport');
    const spy = vi.mocked(backportRun).mockResolvedValue(
      'backport return value' as unknown as BackportResponse,
    );
    vi.mocked(getOptionsFromGithub).mockResolvedValue({} as any);
    vi.mocked(getCommits).mockResolvedValue(
      [{ suggestedTargetBranches: ['7.x'] }] as any,
    );

    await run({
      inputs: {
        githubToken: 'very-secret',
        autoBackportLabelPrefix: 'backport-to-',
        repoForkOwner: '',
        copySourcePRReviewers: true,
      },
      context: {
        repo: { owner: 'elastic', repo: 'kibana' },
        payload: {
          pull_request: {
            merged: true,
            number: 1345,
            user: { login: 'sorenlouv' },
            requested_reviewers: [{ login: 'sorenlouv' }],
          },
        },
        serverUrl: 'https://github.my-own-enterprise.com',
        apiUrl: 'https://github.my-own-enterprise.com/api/v3',
        graphqlUrl: 'https://github.my-own-enterprise.com/api/graphql',
      } as unknown as Context,
    });

    expect(spy).toHaveBeenCalledWith({
      exitCodeOnFailure: false,
      options: {
        githubToken: 'very-secret',
        assignees: ['sorenlouv'],
        branchLabelMapping: {
          '^backport-to-(.+)$': '$1',
        },
        interactive: false,
        publishStatusCommentOnFailure: true,
        pullNumber: 1345,
        repoForkOwner: 'elastic',
        repoName: 'kibana',
        repoOwner: 'elastic',
        gitHostname: 'github.my-own-enterprise.com',
        githubActionRunId: undefined,
        githubApiBaseUrlV3: 'https://github.my-own-enterprise.com/api/v3',
        githubApiBaseUrlV4: 'https://github.my-own-enterprise.com/api/graphql',
        reviewers: ['sorenlouv'],
      },
    });
  });

  it('skips backport gracefully when PR is not merged', async () => {
    const { backportRun } = await import('backport');
    const spy = vi.mocked(backportRun);

    const infoSpy = vi.mocked(core.info);

    const result = await run({
      inputs: {
        githubToken: 'very-secret',
        autoBackportLabelPrefix: 'backport-to-',
        repoForkOwner: '',
        copySourcePRReviewers: false,
      },
      context: {
        repo: { owner: 'elastic', repo: 'kibana' },
        payload: {
          pull_request: {
            merged: false,
            number: 1345,
            user: { login: 'sorenlouv' },
          },
        },
        serverUrl: 'https://github.com',
        apiUrl: 'https://api.github.com',
        graphqlUrl: 'https://api.github.com/graphql',
      } as unknown as Context,
    });

    expect(spy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(
      'PR is not merged. Skipping backport.',
    );
    expect(result).toEqual({ commits: [], results: [] });
  });

  it('aborts if no targetBranches, branchLabelMappings or autoBackportLabelPrefix are provided', async () => {
    const { backportRun, getOptionsFromGithub } = await import('backport');
    const spy = vi.mocked(backportRun);
    vi.mocked(getOptionsFromGithub).mockResolvedValue({} as any);

    const p = run({
      inputs: {
        githubToken: 'very-secret',
        autoBackportLabelPrefix: '',
        repoForkOwner: '',
        copySourcePRReviewers: true,
      },
      context: {
        repo: { owner: 'elastic', repo: 'kibana' },
        payload: {
          pull_request: {
            merged: true,
            number: 1345,
            user: { login: 'sorenlouv' },
            requested_reviewers: [{ login: 'sorenlouv' }],
          },
        },
        serverUrl: 'https://github.my-own-enterprise.com',
        apiUrl: 'https://github.my-own-enterprise.com/api/v3',
        graphqlUrl: 'https://github.my-own-enterprise.com/api/graphql',
      } as unknown as Context,
    });

    await expect(p).rejects.toThrow(
      'No target branches configured. Please configure `targetBranches: ["my-target-branch"]` in .backportrc.json or use the `auto_backport_label_prefix` input option.',
    );

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('getFailureMessage', () => {
  describe('success', () => {
    it('should return empty when there are no errors', () => {
      const res: BackportResponse = {
        commits: [],
        results: [],
      };
      expect(getFailureMessage(res)).toBe(undefined);
    });

    it('returns errors as failures by default', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'config-error-exception',
            errorMessage: 'Hello',
            targetBranch: '7.x',
          },
        ],
      };
      expect(getFailureMessage(res)).toBe('Hello');
    });

    it('returns failure when PR creation fails due to permissions', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'pr-creation-exception',
            errorMessage:
              'Could not create pull request: GitHub Actions is not permitted to create or approve pull requests.',
            targetBranch: 'gmpy2-2.3.x',
          },
        ],
      };
      expect(getFailureMessage(res)).toBe(
        'Could not create pull request: GitHub Actions is not permitted to create or approve pull requests.',
      );
    });

    it('ignores errors when their code is in ignoredErrorCodes', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'merge-conflict-exception',
            errorMessage:
              'Commit could not be cherrypicked due to conflicts in: file.ts',
            errorContext: {
              code: 'merge-conflict-exception',
              conflictingFiles: ['file.ts'],
              commitsWithoutBackports: [],
            },
            targetBranch: '7.x',
          },
        ],
      };
      expect(getFailureMessage(res, ['merge-conflict-exception'])).toBe(
        undefined,
      );
    });

    it('only ignores matching error codes, still fails on others', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'merge-conflict-exception',
            errorMessage:
              'Commit could not be cherrypicked due to conflicts in: file.ts',
            errorContext: {
              code: 'merge-conflict-exception',
              conflictingFiles: ['file.ts'],
              commitsWithoutBackports: [],
            },
            targetBranch: '7.x',
          },
          {
            status: 'error',
            errorCode: 'pr-creation-exception',
            errorMessage: 'Could not create pull request',
            targetBranch: '8.x',
          },
        ],
      };
      expect(getFailureMessage(res, ['merge-conflict-exception'])).toBe(
        'Could not create pull request',
      );
    });

    it('returns unhandled errors regardless of ignoredErrorCodes', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'unhandled-exception',
            errorMessage: 'My unhandled error',
            targetBranch: '7.x',
          },
          {
            status: 'error',
            errorCode: 'unhandled-exception',
            errorMessage: 'Another unhandled error',
            targetBranch: '7.x',
          },
        ],
      };
      expect(getFailureMessage(res)).toBe(
        'My unhandled error, Another unhandled error',
      );
    });

    it('only returns error messages, ignoring success results', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'success',
            targetBranch: '7.x',
            pullRequestUrl: 'https://github.com/my-org/my-repo/pull/1',
            pullRequestNumber: 1,
          },
          {
            status: 'error',
            errorCode: 'cherrypick-exception',
            errorMessage: 'Cherry-pick failed',
            targetBranch: '8.x',
          },
        ],
      };
      expect(getFailureMessage(res)).toBe('Cherry-pick failed');
    });

    it('returns undefined when all errors are ignored', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'merge-conflict-exception',
            errorMessage: 'Conflict in file.ts',
            targetBranch: '7.x',
          },
          {
            status: 'error',
            errorCode: 'merge-conflict-exception',
            errorMessage: 'Conflict in other.ts',
            targetBranch: '8.x',
          },
        ],
      };
      expect(getFailureMessage(res, ['merge-conflict-exception'])).toBe(
        undefined,
      );
    });

    it('combines different error messages', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'cherrypick-exception',
            errorMessage: 'Handled failure',
            targetBranch: '7.x',
          },
          {
            status: 'error',
            errorCode: 'unhandled-exception',
            errorMessage: 'Unhandled failure',
            targetBranch: '8.x',
          },
        ],
      };
      expect(getFailureMessage(res)).toBe('Handled failure, Unhandled failure');
    });
  });

  describe('failure', () => {
    it('should return error message', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'unhandled-exception',
            errorMessage: 'My failure',
          },
        ],
      };
      expect(getFailureMessage(res)).toBe('My failure');
    });

    it('ignores failure when errorCode is in ignoredErrorCodes', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'config-error-exception',
            errorMessage: 'My config error',
          },
        ],
      };
      expect(getFailureMessage(res, ['config-error-exception'])).toBe(
        undefined,
      );
    });
  });

  describe('aborted', () => {
    it('should return error message', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'no-branches-exception',
            errorMessage: 'There are no branches to backport to. Aborting.',
          },
        ],
      };
      expect(getFailureMessage(res)).toBe(
        'There are no branches to backport to. Aborting.',
      );
    });

    it('ignores aborted when no-branches-exception is in ignoredErrorCodes', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'no-branches-exception',
            errorMessage: 'There are no branches to backport to. Aborting.',
          },
        ],
      };
      expect(getFailureMessage(res, ['no-branches-exception'])).toBe(undefined);
    });
  });

  describe('with default ignored error codes', () => {
    const DEFAULT_IGNORED = [
      'merge-conflict-exception',
      'no-branches-exception',
    ];

    it('ignores merge-conflict-exception by default', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'merge-conflict-exception',
            errorMessage:
              'Commit could not be cherrypicked due to conflicts in: file.ts',
            errorContext: {
              code: 'merge-conflict-exception',
              conflictingFiles: ['file.ts'],
              commitsWithoutBackports: [],
            },
            targetBranch: '7.x',
          },
        ],
      };
      expect(getFailureMessage(res, DEFAULT_IGNORED)).toBe(undefined);
    });

    it('ignores no-branches-exception by default', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'no-branches-exception',
            errorMessage: 'There are no branches to backport to. Aborting.',
          },
        ],
      };
      expect(getFailureMessage(res, DEFAULT_IGNORED)).toBe(undefined);
    });

    it('still fails on non-ignored errors like pr-creation-exception', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'pr-creation-exception',
            errorMessage:
              'Could not create pull request: GitHub Actions is not permitted to create or approve pull requests.',
            targetBranch: '7.x',
          },
        ],
      };
      expect(getFailureMessage(res, DEFAULT_IGNORED)).toBe(
        'Could not create pull request: GitHub Actions is not permitted to create or approve pull requests.',
      );
    });

    it('fails on non-ignored errors even when mixed with ignored ones', () => {
      const res: BackportResponse = {
        commits: [],
        results: [
          {
            status: 'error',
            errorCode: 'merge-conflict-exception',
            errorMessage:
              'Commit could not be cherrypicked due to conflicts in: file.ts',
            errorContext: {
              code: 'merge-conflict-exception',
              conflictingFiles: ['file.ts'],
              commitsWithoutBackports: [],
            },
            targetBranch: '7.x',
          },
          {
            status: 'error',
            errorCode: 'config-error-exception',
            errorMessage: 'Invalid config',
            targetBranch: '8.x',
          },
        ],
      };
      expect(getFailureMessage(res, DEFAULT_IGNORED)).toBe('Invalid config');
    });
  });
});
