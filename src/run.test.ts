import { Context } from '@actions/github/lib/context';
import * as backport from 'backport';
import { getFailureMessage, run } from './run';

describe('run', () => {
  it('calls backport with correct arguments', async () => {
    const spy = jest
      .spyOn(backport, 'backportRun')
      // @ts-expect-error
      .mockResolvedValue('backport return value');

    await run({
      inputs: {
        accessToken: 'very-secret',
        autoBackportLabelPrefix: 'backport-to-',
        repoForkOwner: '',
      },
      context: {
        repo: { owner: 'elastic', repo: 'kibana' },
        payload: {
          pull_request: {
            labels: [],
            merged: true,
            number: 1345,
            user: { login: 'sqren' },
          },
        },
      } as unknown as Context,
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

  it('skips if pull request is not merged', async () => {
    const res = await run({
      inputs: {
        accessToken: 'very-secret',
        autoBackportLabelPrefix: 'backport-to-',
        repoForkOwner: '',
      },
      context: {
        repo: { owner: 'elastic', repo: 'kibana' },
        payload: {
          action: 'closed',
          pull_request: {
            labels: [],
            merged: false,
            number: 1345,
            user: { login: 'sqren' },
          },
        },
      } as unknown as Context,
    });

    expect(res).toEqual({
      message: 'Pull request is not merged. Skipping',
      status: 'skipped',
    });
  });

  it('skips if there are no backport labels when merging the issue', async () => {
    const res = await run({
      inputs: {
        accessToken: 'very-secret',
        autoBackportLabelPrefix: 'backport-to-',
        repoForkOwner: '',
      },
      context: {
        repo: { owner: 'elastic', repo: 'kibana' },
        payload: {
          action: 'closed',
          pull_request: {
            labels: [],
            merged: true,
            number: 1345,
            user: { login: 'sqren' },
          },
        },
      } as unknown as Context,
    });

    expect(res).toEqual({
      message: 'The pull request does not have any backport labels. Skipping',
      status: 'skipped',
    });
  });

  it('skips if the added label is not a backport label', async () => {
    const res = await run({
      inputs: {
        accessToken: 'very-secret',
        autoBackportLabelPrefix: 'backport-to-',
        repoForkOwner: '',
      },
      context: {
        repo: { owner: 'elastic', repo: 'kibana' },
        payload: {
          action: 'labeled',
          label: { name: 'foo' },
          pull_request: {
            labels: [],
            merged: true,
            number: 1345,
            user: { login: 'sqren' },
          },
        },
      } as unknown as Context,
    });

    expect(res).toEqual({
      message: 'Applied label "foo" is not a backport label. Skipping',
      status: 'skipped',
    });
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
        'Unhandled errors: My unhandled error, Another unhandled error'
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
        'Conflict resolution was aborted by the user'
      );
    });
  });
});
