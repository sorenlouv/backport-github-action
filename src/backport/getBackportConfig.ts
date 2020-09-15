import { EventPayloads } from '@octokit/webhooks';
import { getTargetBranchForLabel, ConfigOptions } from 'backport';

import got from 'got';
import { Inputs } from '../index';
import { consoleLog } from '../logger';

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

export type RequiredOptions = {
  accessToken: string;
  upstream: string;
  pullNumber: number;
};

export async function getBackportConfig({
  payload,
  inputs,
  username,
}: {
  payload: EventPayloads.WebhookPayloadPullRequest;
  inputs: Inputs;
  username: string;
}): Promise<ConfigOptions & RequiredOptions> {
  const projectConfig = await getProjectConfig(payload);
  const config: ConfigOptions & { accessToken: string } = {
    ...projectConfig,
    upstream: `${payload.repository.owner.login}/${payload.repository.name}`,
    username,
    accessToken: inputs.accessToken,
    ci: true,
    pullNumber: payload.pull_request.number,
    //@ts-expect-error (to be fixed in https://github.com/octokit/webhooks/issues/136)
    assignees: [payload.pull_request.merged_by?.login],
    fork: false,
  };

  if (inputs.backportByLabel) {
    config.branchLabelMapping = {
      [inputs.backportByLabel]: '$1',
    };
  }

  if (inputs.prTitle) {
    config.prTitle = inputs.prTitle;
  }

  if (inputs.targetPRLabels) {
    config.targetPRLabels = inputs.targetPRLabels.split(',');
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

  consoleLog('Config', config);

  const { upstream, pullNumber, branchLabelMapping } = config;
  if (!upstream) {
    throw new Error('Missing upstream');
  }

  if (!pullNumber) {
    throw new Error('Missing pull request number');
  }

  if (!branchLabelMapping) {
    throw new Error('Missing required `branchLabelMapping`');
  }

  return {
    ...config,
    upstream,
    pullNumber,
    branchLabelMapping,
  };
}
