import { getClosedPRPayload } from './test/mocks/getClosedPRPayload';
import { getLabeledPRPayload } from './test/mocks/getLabeledPRPayload';
import { initAction } from './initAction';
import * as backport from 'backport';
import * as logger from './logger';
import nock from 'nock';
import { Inputs } from '.';

describe('initAction', () => {
  let backportRunSpy: jest.SpyInstance;
  let postCommentCalls: unknown[];

  beforeEach(() => {
    backportRunSpy = jest.spyOn(backport, 'run').mockResolvedValueOnce({
      results: [
        { success: true, pullRequestUrl: 'my url', targetBranch: '7.x' },
      ],
      success: true,
    });

    // silence console.log
    jest.spyOn(logger, 'consoleLog').mockReturnValue();

    // mock comment posting
    const postCommentMock = nock('https://api.github.com')
      .post(/^\/repos\/.*\/.*\/issues\/\d+\/comments$/)
      .reply(200);

    postCommentCalls = getNockCallsForScope(postCommentMock);
  });

  afterEach(() => {
    backportRunSpy.mockClear();
  });

  describe('when a PR is merged', () => {
    describe('and .backportrc.json exists', () => {
      beforeEach(async () => {
        const inputs: Inputs = {
          accessToken: 'myAccessToken',
          backportLabelPattern: 'mybackportLabelPattern',
          prTitle: 'myPrTitle',
          targetPRLabels: 'myTargetPRLabels',
          skipBackportCheck: false,
          skipBackportCheckLabel: 'backport:skip',
        };

        const payload = getClosedPRPayload({
          repoOwner: 'backport-org',
          repoName: 'backport-e2e',
          username: 'sqren',
        });

        await initAction({ payload, inputs });
      });

      it('does not specify `targetBranches`', () => {
        const config = backportRunSpy.mock.calls[0][0];
        expect(config.targetBranches).toBeUndefined();
      });

      it('uses `branchLabelMapping` from .backportrc.json', () => {
        const config = backportRunSpy.mock.calls[0][0];
        expect(config.branchLabelMapping).toEqual({
          mybackportLabelPattern: '$1',
        });
      });

      it('runs backport with correct args', async () => {
        expect(backportRunSpy).toHaveBeenCalledTimes(1);
        expect(backportRunSpy).toHaveBeenCalledWith({
          accessToken: 'myAccessToken',
          assignees: ['sqren'],
          branchLabelMapping: { mybackportLabelPattern: '$1' },
          ci: true,
          fork: false,
          prTitle: 'myPrTitle',
          pullNumber: 34,
          targetBranchChoices: [
            { checked: true, name: 'master' },
            { checked: true, name: '7.x' },
            '7.8',
          ],
          targetPRLabels: ['myTargetPRLabels'],
          upstream: 'backport-org/backport-e2e',
          username: 'sqren',
        });
      });

      it('posts comment to Github', () => {
        expect(postCommentCalls).toMatchInlineSnapshot(`
          Array [
            Object {
              "body": Object {
                "body": "## 💚 Backport successful
          The PR was backported to the following branches:
           - ✅ [7.x](my url)
          ",
              },
              "url": "https://api.github.com/repos/backport-org/backport-e2e/issues/34/comments",
            },
          ]
        `);
      });
    });

    describe('and .backportrc.json does not exist', () => {
      beforeEach(async () => {
        const inputs: Inputs = {
          accessToken: 'myAccessToken',
          backportLabelPattern: 'mybackportLabelPattern',
          prTitle: 'myPrTitle',
          targetPRLabels: 'myTargetPRLabels',
          skipBackportCheck: false,
          skipBackportCheckLabel: 'backport:skip',
        };

        const payload = getClosedPRPayload({
          repoOwner: 'backport-org',
          repoName: 'non-existing-repo',
          username: 'sqren',
        });

        await initAction({ payload, inputs });
      });

      it('does not specify `targetBranches`', () => {
        const config = backportRunSpy.mock.calls[0][0];
        expect(config.targetBranches).toBeUndefined();
      });

      it('does not specify `targetBranchChoices`', () => {
        const config = backportRunSpy.mock.calls[0][0];
        expect(config.targetBranchChoices).toBeUndefined();
      });

      it('uses `branchLabelMapping` from input', () => {
        const config = backportRunSpy.mock.calls[0][0];
        expect(config.branchLabelMapping).toEqual({
          mybackportLabelPattern: '$1',
        });
      });

      it('posts comment to Github', () => {
        expect(postCommentCalls).toMatchInlineSnapshot(`
          Array [
            Object {
              "body": Object {
                "body": "## 💚 Backport successful
          The PR was backported to the following branches:
           - ✅ [7.x](my url)
          ",
              },
              "url": "https://api.github.com/repos/backport-org/non-existing-repo/issues/34/comments",
            },
          ]
        `);
      });
    });
  });

  describe('when a label is added to a merged PR', () => {
    beforeEach(async () => {
      const inputs: Inputs = {
        accessToken: 'myAccessToken',
        backportLabelPattern: 'backport-to-(.*)',
        prTitle: 'myPrTitle',
        targetPRLabels: 'myTargetPRLabels',
        skipBackportCheck: false,
        skipBackportCheckLabel: 'backport:skip',
      };

      const payload = getLabeledPRPayload({
        repoOwner: 'backport-org',
        repoName: 'non-existing-repo',
        username: 'sqren',
        label: 'backport-to-7.8',
        isMerged: true,
      });

      await initAction({ payload, inputs });
    });

    it('backports to 7.8', () => {
      const config = backportRunSpy.mock.calls[0][0];
      expect(config.targetBranches).toEqual(['7.8']);
    });

    it('uses `branchLabelMapping` from input', () => {
      const config = backportRunSpy.mock.calls[0][0];
      expect(config.branchLabelMapping).toEqual({ 'backport-to-(.*)': '$1' });
    });

    it('does not specify `targetBranchChoices`', () => {
      const config = backportRunSpy.mock.calls[0][0];
      expect(config.targetBranchChoices).toBeUndefined();
    });

    it('posts comment to Github', () => {
      expect(postCommentCalls).toMatchInlineSnapshot(`
        Array [
          Object {
            "body": Object {
              "body": "## 💚 Backport successful
        The PR was backported to the following branches:
         - ✅ [7.x](my url)
        ",
            },
            "url": "https://api.github.com/repos/backport-org/non-existing-repo/issues/34/comments",
          },
        ]
      `);
    });
  });

  describe('when a label is added to an open PR', () => {
    let updateStatusMock: nock.Scope;
    let calls: unknown[];
    beforeEach(async () => {
      // mock comment posting
      updateStatusMock = nock('https://api.github.com')
        .post(/^\/repos\/.*\/.*\/statuses\/.*$/)
        .reply(200);

      const inputs: Inputs = {
        accessToken: 'myAccessToken',
        backportLabelPattern: 'backport-to-(.*)',
        prTitle: 'myPrTitle',
        targetPRLabels: 'myTargetPRLabels',
        skipBackportCheck: false,
        skipBackportCheckLabel: 'backport:skip',
      };

      const payload = getLabeledPRPayload({
        repoOwner: 'backport-org',
        repoName: 'non-existing-repo',
        username: 'sqren',
        label: 'backport-to-7.8',
        isMerged: false,
      });

      calls = getNockCallsForScope(updateStatusMock);
      await initAction({ payload, inputs });
    });

    it('does not backport', () => {
      expect(backportRunSpy).not.toHaveBeenCalled();
    });

    it('updates commit status', () => {
      expect(calls).toEqual([
        {
          url:
            'https://api.github.com/repos/backport-org/non-existing-repo/statuses/cffcf17dd96d27854bf99a54d6605f56301b065e',
          body: {
            context: 'Backport',
            description: 'This PR will be backported to: 7.8,7.x',
            state: 'success',
          },
        },
      ]);
      updateStatusMock.done();
    });

    it('does not post comment to Github', () => {
      expect(postCommentCalls).toEqual([]);
    });
  });
});

export function getNockCallsForScope(scope: nock.Scope) {
  const calls: unknown[] = [];
  scope.on('request', (req, interceptor, body) => {
    calls.push({ url: req.options.href, body: JSON.parse(body) });
  });
  return calls;
}
