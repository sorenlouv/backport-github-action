import { getClosedPRPayload } from './test/mocks/getClosedPRPayload';
import { getLabeledPRPayload } from './test/mocks/getLabeledPRPayload';
import { initAction } from './initAction';
import * as backport from 'backport';
import * as logger from './logger';
import nock from 'nock';

describe('initAction', () => {
  let spy: jest.SpyInstance;
  let postCommentMock: nock.Scope;

  beforeEach(() => {
    spy = jest.spyOn(backport, 'run').mockResolvedValueOnce({
      results: [
        { success: true, pullRequestUrl: 'my url', targetBranch: '7.x' },
      ],
      success: true,
    });

    // silence console.log
    jest.spyOn(logger, 'consoleLog').mockReturnValue();

    // mock comment posting
    postCommentMock = nock('https://api.github.com')
      .post(/^\/repos\/.*\/.*\/issues\/\d+\/comments$/)
      .reply(200);
  });

  afterEach(() => {
    spy.mockClear();
  });

  describe('when a PR is merged', () => {
    describe('and .backportrc.json exists', () => {
      beforeEach(async () => {
        const inputs = {
          accessToken: 'myAccessToken',
          backportByLabel: 'myBackportByLabel',
          prTitle: 'myPrTitle',
          targetPRLabels: 'myTargetPRLabels',
        };

        const payload = getClosedPRPayload({
          repoOwner: 'backport-org',
          repoName: 'backport-e2e',
          username: 'sqren',
        });

        await initAction({ payload, inputs });
      });

      it('does not specify `targetBranches`', () => {
        const config = spy.mock.calls[0][0];
        expect(config.targetBranches).toBeUndefined();
      });

      it('uses `branchLabelMapping` from .backportrc.json', () => {
        const config = spy.mock.calls[0][0];
        expect(config.branchLabelMapping).toEqual({ myBackportByLabel: '$1' });
      });

      it('runs backport with correct args', async () => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith({
          accessToken: 'myAccessToken',
          assignees: ['sqren'],
          branchLabelMapping: { myBackportByLabel: '$1' },
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

      it('posts status comment to Github', () => {
        postCommentMock.done();
      });
    });

    describe('and .backportrc.json does not exist', () => {
      beforeEach(async () => {
        const inputs = {
          accessToken: 'myAccessToken',
          backportByLabel: 'myBackportByLabel',
          prTitle: 'myPrTitle',
          targetPRLabels: 'myTargetPRLabels',
        };

        const payload = getClosedPRPayload({
          repoOwner: 'backport-org',
          repoName: 'non-existing-repo',
          username: 'sqren',
        });

        await initAction({ payload, inputs });
      });

      it('does not specify `targetBranches`', () => {
        const config = spy.mock.calls[0][0];
        expect(config.targetBranches).toBeUndefined();
      });

      it('does not specify `targetBranchChoices`', () => {
        const config = spy.mock.calls[0][0];
        expect(config.targetBranchChoices).toBeUndefined();
      });

      it('uses `branchLabelMapping` from input', () => {
        const config = spy.mock.calls[0][0];
        expect(config.branchLabelMapping).toEqual({ myBackportByLabel: '$1' });
      });

      it('posts status comment to Github', () => {
        postCommentMock.done();
      });
    });
  });

  describe('when a label is added to an open PR', () => {
    beforeEach(async () => {
      const inputs = {
        accessToken: 'myAccessToken',
        backportByLabel: 'backport-to-(.*)',
        prTitle: 'myPrTitle',
        targetPRLabels: 'myTargetPRLabels',
      };

      const payload = getLabeledPRPayload({
        repoOwner: 'backport-org',
        repoName: 'non-existing-repo',
        username: 'sqren',
        label: 'backport-to-7.8',
      });

      await initAction({ payload, inputs });
    });

    it('backports to 7.8', () => {
      const config = spy.mock.calls[0][0];
      expect(config.targetBranches).toEqual(['7.8']);
    });

    it('uses `branchLabelMapping` from input', () => {
      const config = spy.mock.calls[0][0];
      expect(config.branchLabelMapping).toEqual({ 'backport-to-(.*)': '$1' });
    });

    it('does not specify `targetBranchChoices`', () => {
      const config = spy.mock.calls[0][0];
      expect(config.targetBranchChoices).toBeUndefined();
    });

    it('posts status comment to Github', () => {
      postCommentMock.done();
    });
  });

  // describe('when a label is added to a merged PR', () => {
  //   it('something', () => {
  //     expect(true).toBe(true);
  //   });
  // });
});
