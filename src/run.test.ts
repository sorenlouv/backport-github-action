import { Context } from '@actions/github/lib/context';
import * as backport from 'backport';
import { run } from './run';

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
            number: 1345,
            user: { login: 'sqren' },
          },
        },
      } as unknown as Context,
    });

    expect(spy).toHaveBeenCalledWith({
      accessToken: 'very-secret',
      assignees: ['sqren'],
      branchLabelMapping: {
        '^backport-to--(.+)$': '$1',
      },
      ci: true,
      pullNumber: 1345,
      repoForkOwner: 'elastic',
      repoName: 'kibana',
      repoOwner: 'elastic',
    });
  });
});
