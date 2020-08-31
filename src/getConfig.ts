import { EventPayloads } from '@octokit/webhooks';
import { ConfigOptions } from 'backport/dist/options/ConfigOptions';
import got from 'got';

export async function getBackportConfig({
  payload,
  username,
  accessToken,
}: {
  payload: EventPayloads.WebhookPayloadPullRequest;
  username: string;
  accessToken: string;
}): Promise<ConfigOptions> {
  const configUrl = `https://raw.githubusercontent.com/${payload.repository.owner.login}/${payload.repository.name}/${payload.repository.default_branch}/.backportrc.json`;

  try {
    const response = await got(configUrl);
    const projectConfig = JSON.parse(response.body);

    return {
      ...projectConfig,
      username,
      accessToken,
      ci: true,
      pullNumber: payload.pull_request.number,
      //@ts-expect-error (to be fixed in https://github.com/octokit/webhooks/issues/136)
      assignees: [payload.pull_request.merged_by?.login],
    };
  } catch (e) {
    if (e.response?.statusCode === 404) {
      throw new Error(`No config exists for ${configUrl}`);
    }
    throw e;
  }
}
