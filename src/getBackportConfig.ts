import { EventPayloads } from '@octokit/webhooks';
import { ConfigOptions } from 'backport/dist/options/ConfigOptions';
import got from 'got';

async function getProjectConfig(
  payload: EventPayloads.WebhookPayloadPullRequest
) {
  const configUrl = `https://raw.githubusercontent.com/${payload.repository.owner.login}/${payload.repository.name}/${payload.repository.default_branch}/.backportrc.json`;
  console.log(`Fetching project config from ${configUrl}`);
  try {
    const response = await got(configUrl);
    return JSON.parse(response.body) as ConfigOptions;
  } catch (e) {
    if (e.response?.statusCode === 404) {
      console.log(`No project config found`);
      return null;
    }

    throw e;
  }
}

export async function getBackportConfig({
  payload,
  username,
  accessToken,
  backportByLabel,
  prTitle,
  targetPRLabels,
}: {
  payload: EventPayloads.WebhookPayloadPullRequest;
  username: string;
  accessToken: string;
  backportByLabel?: string;
  prTitle?: string;
  targetPRLabels?: string;
}): Promise<ConfigOptions> {
  const projectConfig = await getProjectConfig(payload);
  const config: ConfigOptions = {
    ...projectConfig,
    upstream: `${payload.repository.owner.login}/${payload.repository.name}`,
    // upstream: 'elastic/kibana',
    username,
    accessToken,
    ci: true,
    pullNumber: payload.pull_request.number,
    // pullNumber: 77139,
    //@ts-expect-error (to be fixed in https://github.com/octokit/webhooks/issues/136)
    assignees: [payload.pull_request.merged_by?.login],
    fork: true,
  };

  if (backportByLabel) {
    config.branchLabelMapping = {
      [backportByLabel]: '$1',
    };
  }

  if (prTitle) {
    config.prTitle = prTitle;
  }

  if (targetPRLabels) {
    config.targetPRLabels = targetPRLabels.split(',');
  }

  return config;
}
