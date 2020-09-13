import { EventPayloads } from '@octokit/webhooks';
import { getTargetBranchForLabel, ConfigOptions } from 'backport';

import got from 'got';
import { consoleLog } from './logger';

async function getProjectConfig(
  payload: EventPayloads.WebhookPayloadPullRequest
) {
  const configUrl = `https://raw.githubusercontent.com/${payload.repository.owner.login}/${payload.repository.name}/${payload.repository.default_branch}/.backportrc.json`;
  consoleLog(`Fetching project config from ${configUrl}`);
  try {
    const response = await got(configUrl);
    return JSON.parse(response.body) as ConfigOptions;
  } catch (e) {
    if (e.response?.statusCode === 404) {
      consoleLog(`No project config found`);
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
    username,
    accessToken,
    ci: true,
    pullNumber: payload.pull_request.number,
    //@ts-expect-error (to be fixed in https://github.com/octokit/webhooks/issues/136)
    assignees: [payload.pull_request.merged_by?.login],
    fork: false,
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
  if (payload.action === 'labeled' && config.branchLabelMapping) {
    const label = payload.label?.name as string;
    const targetBranch = getTargetBranchForLabel({
      label,
      branchLabelMapping: config.branchLabelMapping,
    });

    if (targetBranch) {
      config.targetBranches = [targetBranch];
    }
  }

  return config;
}
