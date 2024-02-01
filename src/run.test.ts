import * as core from '@actions/core';
import { Context } from '@actions/github/lib/context';
import * as backport from 'backport';
import { getFailureMessage, run } from './run';

describe('run', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls backport with correct arguments', async () => {
    const spy = jest
      .spyOn(backport, 'backportRun')
      // @ts-expect-error
      .mockResolvedValue('backport return value');

    // @ts-expect-error
    jest.spyOn(backport, 'getOptionsFromGithub').mockResolvedValue({});
    jest
      .spyOn(backport, 'getCommits')
      //@ts-expect-error
      .mockResolvedValue([{ suggestedTargetBranches: ['7.x'] }]);

    // disable logs
    jest.spyOn(core, 'info').mockReturnValue();

    await run({
      inputs: {
        accessToken: 'very-secret',
        autoBackportLabelPrefix: 'backport-to-',
        repoForkOwner: '',
        addOriginalReviewers: true,
      },
      context: {
        repo: { owner: 'elastic', repo: 'kibana' },
        payload: {
          pull_request: {
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
        accessToken: 'very-secret',
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

  it('aborts if no targetBranches, branchLabelMappings or autoBackportLabelPrefix are provided', async () => {
    const spy = jest.spyOn(backport, 'backportRun');

    // @ts-expect-error
    jest.spyOn(backport, 'getOptionsFromGithub').mockResolvedValue({});

    // disable logs
    jest.spyOn(core, 'info').mockReturnValue();

    const p = run({
      inputs: {
        accessToken: 'very-secret',
        autoBackportLabelPrefix: '',
        repoForkOwner: '',
        addOriginalReviewers: true,
      },
      context: {
        repo: { owner: 'elastic', repo: 'kibana' },
        payload: {
          pull_request: {
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
    it('should return empty when there are no unhandled errors', () => {
      const res: backport.BackportSuccessResponse = {
        status: 'success',
        commits: [],
        results: [],
      };
      expect(getFailureMessage(res)).toBe(undefined);
    });

    it('ignores handled errors', () => {
      const res: backport.BackportSuccessResponse = {
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
      expect(getFailureMessage(res)).toBe(undefined);
    });

    it('returns unhandled errors', () => {
      const res: backport.BackportSuccessResponse = {
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
      expect(getFailureMessage(res)).toBe(
        'Unhandled errors: My unhandled error, Another unhandled error',
      );
    });
  });

  describe('failure', () => {
    it('should error message', () => {
      const res: backport.BackportFailureResponse = {
        status: 'failure',
        commits: [],
        error: new Error('My failure'),
        errorMessage: 'My failure',
      };
      expect(getFailureMessage(res)).toBe('My failure');
    });
  });

  describe('aborted', () => {
    it('should error message', () => {
      const e = new backport.BackportError({
        code: 'abort-conflict-resolution-exception',
      });
      const res: backport.BackportAbortResponse = {
        status: 'aborted',
        commits: [],
        error: e,
        errorMessage: e.message,
      };
      expect(getFailureMessage(res)).toBe(
        'Conflict resolution was aborted by the user',
      );
    });
  });
});
