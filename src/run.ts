/* eslint-disable no-console */
import { Context } from '@actions/github/lib/context';
import {
  BackportResponse,
  backportRun,
  UnhandledErrorResult,
  getOptionsFromGithub,
  getTargetBranchFromLabel,
} from 'backport';

type Inputs = {
  accessToken: string;
  autoBackportLabelPrefix: string;
  repoForkOwner: string;
};

export async function run({
  context,
  inputs,
}: {
  context: Context;
  inputs: Inputs;
}): Promise<ActionResult> {
  const pullRequest = context.payload.pull_request;

  if (!pullRequest) {
    throw Error('Only pull_request events are supported.');
  }

  if (!pullRequest.merged) {
    return {
      status: 'skipped',
      message: 'Pull request is not merged. Skipping',
    };
  }

  const branchLabelMapping = await getBranchLabelMapping(context, inputs);

  if (context.payload.action === 'labeled') {
    const label = context.payload.label.name;
    const isBackportLabel = getIsBackportLabel({ label, branchLabelMapping });

    if (!isBackportLabel) {
      return {
        status: 'skipped',
        message: `Applied label "${label}" is not a backport label. Skipping`,
      };
    }
  }

  if (context.payload.action === 'closed') {
    const labels = pullRequest.labels as string[];
    const hasAnyBackportLabels = labels.some((label) =>
      getIsBackportLabel({ label, branchLabelMapping })
    );

    if (!hasAnyBackportLabels) {
      return {
        status: 'skipped',
        message: 'The pull request does not have any backport labels. Skipping',
      };
    }
  }

  const repoForkOwner =
    inputs.repoForkOwner !== '' ? inputs.repoForkOwner : context.repo.owner;

  // payload params
  const pullNumber = pullRequest.number;
  const assignees = [pullRequest.user.login];

  console.log({
    assignees,
    branchLabelMapping,
    pullNumber,
    repo: context.repo,
    repoForkOwner,
  });

  const result = await backportRun({
    options: {
      accessToken: inputs.accessToken,
      assignees,
      branchLabelMapping,
      interactive: false,
      publishStatusCommentOnFailure: true,
      pullNumber,
      repoForkOwner,
      repoName: context.repo.repo,
      repoOwner: context.repo.owner,
    },
    exitCodeOnFailure: false,
  });

  console.log('Result', JSON.stringify(result, null, 2));

  return result;
}

type ActionResult = BackportResponse | { status: 'skipped'; message: string };

async function getBranchLabelMapping(context: Context, inputs: Inputs) {
  if (inputs.autoBackportLabelPrefix !== '') {
    return { [`^${inputs.autoBackportLabelPrefix}(.+)$`]: '$1' };
  }

  const optionsFromGithub = await getOptionsFromGithub({
    accessToken: inputs.accessToken,
    repoName: context.repo.repo,
    repoOwner: context.repo.owner,
  });

  return optionsFromGithub.branchLabelMapping;
}

export function getFailureMessage(res: ActionResult) {
  switch (res.status) {
    case 'failure':
    case 'aborted':
      return res.errorMessage;

    case 'skipped':
      return;

    case 'success': {
      const unhandledErrorResults = res.results.filter(
        (res): res is UnhandledErrorResult => res.status === 'unhandled-error'
      );

      // only return message if there are unhandled errors
      // handled errors should not be output
      if (unhandledErrorResults.length > 0) {
        return `Unhandled errors: ${unhandledErrorResults
          .map((res) => res.error.message)
          .join(', ')}`;
      }
    }
  }
}

function getIsBackportLabel({
  label,
  branchLabelMapping,
}: {
  label: string;
  branchLabelMapping?: Record<string, string>;
}) {
  if (!branchLabelMapping) {
    return false;
  }

  const targetBranch = getTargetBranchFromLabel({ branchLabelMapping, label });
  if (targetBranch) {
    console.log(`Label "${label}" matching target branch "${targetBranch}"`);
  }
  return targetBranch != null;
}
