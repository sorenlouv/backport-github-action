import { Octokit } from '@octokit/rest';
import pRetry from 'p-retry';
import { log, wait } from './logger.js';

export interface TestContext {
  octokit: Octokit;
  repo: { owner: string; repo: string };
  branchesToDelete: string[];
  prsToClose: number[];
  filesToDelete: Array<{ branch: string; path: string }>;
  originalWorkflowSha: string | null;
}

const WORKFLOW_PATH = '.github/workflows/backport.yml';

export async function getMasterSha(ctx: TestContext): Promise<string> {
  const ref = await ctx.octokit.git.getRef({
    ...ctx.repo,
    ref: 'heads/master',
  });
  return ref.data.object.sha;
}

export async function createBranch(
  ctx: TestContext,
  name: string,
  sha: string,
): Promise<void> {
  await ctx.octokit.git.createRef({
    ...ctx.repo,
    ref: `refs/heads/${name}`,
    sha,
  });
  ctx.branchesToDelete.push(name);
}

export async function createFile(
  ctx: TestContext,
  branch: string,
  path: string,
  content: string,
  message: string,
): Promise<void> {
  await ctx.octokit.repos.createOrUpdateFileContents({
    ...ctx.repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    branch,
  });
}

export async function createPr(
  ctx: TestContext,
  head: string,
  title: string,
  labels: string[] = [],
): Promise<number> {
  const pr = await ctx.octokit.pulls.create({
    ...ctx.repo,
    head,
    base: 'master',
    title,
    body: 'Automated e2e test — safe to ignore',
  });

  if (labels.length > 0) {
    await ctx.octokit.issues.addLabels({
      ...ctx.repo,
      issue_number: pr.data.number,
      labels,
    });
  }

  return pr.data.number;
}

export async function mergePr(
  ctx: TestContext,
  prNumber: number,
): Promise<void> {
  await pRetry(
    async () => {
      await ctx.octokit.pulls.merge({
        ...ctx.repo,
        pull_number: prNumber,
        merge_method: 'squash',
      });
    },
    {
      retries: 4,
      minTimeout: 3000,
      onFailedAttempt: (err) => {
        if ((err as unknown as { status?: number }).status !== 405) {
          throw err;
        }
        log(`  Merge attempt ${err.attemptNumber} got 405, retrying...`);
      },
    },
  );
}

/**
 * Wait for the workflow run triggered by merging a PR. For
 * `pull_request_target` events the run's `head_sha` is the base branch
 * HEAD, not the merge commit, so we match by creation time instead.
 *
 * @param mergedAfter  ISO-8601 timestamp recorded just before calling mergePr
 */
export async function waitForRun(
  ctx: TestContext,
  prNumber: number,
  mergedAfter: string,
): Promise<{ conclusion: string; runId: number }> {
  wait(`Waiting for workflow run (PR #${prNumber}, merged after ${mergedAfter})...`);

  // Phase 1: find the run (poll up to ~180s)
  const run = await pRetry(
    async () => {
      const runs = await ctx.octokit.actions.listWorkflowRuns({
        ...ctx.repo,
        workflow_id: 'backport.yml',
        event: 'pull_request_target',
        per_page: 5,
        created: `>=${mergedAfter}`,
      });
      const found = runs.data.workflow_runs[0];
      if (!found) throw new Error('Run not yet available');
      return found;
    },
    { retries: 35, minTimeout: 5000, factor: 1 },
  ).catch(() => null);

  if (!run) return { conclusion: 'not_found', runId: 0 };
  log(`Found run ${run.id}, waiting for completion...`);

  // Phase 2: wait for completion (poll up to ~180s)
  const completed = await pRetry(
    async () => {
      const updated = await ctx.octokit.actions.getWorkflowRun({
        ...ctx.repo,
        run_id: run.id,
      });
      if (updated.data.status !== 'completed') {
        throw new Error('Still running');
      }
      return updated.data;
    },
    { retries: 35, minTimeout: 5000, factor: 1 },
  );

  return {
    conclusion: completed.conclusion ?? 'unknown',
    runId: run.id,
  };
}

function makeWorkflowContent(actionRef: string): string {
  return `on:
  pull_request_target:
    types: ["labeled", "closed"]

jobs:
  backport:
    name: Backport PR
    if: github.event.pull_request.merged == true && !(contains(github.event.pull_request.labels.*.name, 'backport'))
    runs-on: ubuntu-latest
    steps:
      - name: Backport Action
        uses: sorenlouv/backport-github-action@${actionRef}
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          auto_backport_label_prefix: auto-backport-to-

      - name: Info log
        if: \${{ success() }}
        run: cat /home/runner/.backport/backport.info.log

      - name: Debug log
        if: \${{ failure() }}
        run: cat /home/runner/.backport/backport.debug.log
`;
}

export async function updateWorkflowFile(
  ctx: TestContext,
  actionRef: string,
): Promise<void> {
  log(`Updating workflow to use sorenlouv/backport-github-action@${actionRef}`);

  const file = await ctx.octokit.repos.getContent({
    ...ctx.repo,
    path: WORKFLOW_PATH,
  });

  if (!('sha' in file.data)) {
    throw new Error('Unexpected response from getContent');
  }

  ctx.originalWorkflowSha = file.data.sha;

  const newContent = makeWorkflowContent(actionRef);

  await ctx.octokit.repos.createOrUpdateFileContents({
    ...ctx.repo,
    path: WORKFLOW_PATH,
    message: `e2e: update action to @${actionRef}`,
    content: Buffer.from(newContent).toString('base64'),
    sha: file.data.sha,
    branch: 'master',
  });
}

export async function restoreWorkflowFile(ctx: TestContext): Promise<void> {
  log('Restoring workflow to original version (@v11)');

  const file = await ctx.octokit.repos.getContent({
    ...ctx.repo,
    path: WORKFLOW_PATH,
  });

  if (!('sha' in file.data)) {
    throw new Error('Unexpected response from getContent');
  }

  const originalContent = makeWorkflowContent('v11');

  await ctx.octokit.repos.createOrUpdateFileContents({
    ...ctx.repo,
    path: WORKFLOW_PATH,
    message: 'e2e: restore action to @v11',
    content: Buffer.from(originalContent).toString('base64'),
    sha: file.data.sha,
    branch: 'master',
  });

  ctx.originalWorkflowSha = null;
}

/**
 * Find backport PRs by matching the head branch pattern that the backport
 * tool creates: `backport/<targetBranch>/pr-<sourcePrNumber>`.
 */
export async function findBackportPr(
  ctx: TestContext,
  targetBranch: string,
  sourcePrNumber: number,
): Promise<{ number: number; title: string; headRefName: string } | null> {
  const expectedHead = `backport/${targetBranch}/pr-${sourcePrNumber}`;

  const prs = await ctx.octokit.pulls.list({
    ...ctx.repo,
    state: 'all',
    base: targetBranch,
    head: `${ctx.repo.owner}:${expectedHead}`,
    per_page: 5,
  });

  const pr = prs.data[0];
  if (!pr) return null;

  return {
    number: pr.number,
    title: pr.title,
    headRefName: pr.head.ref,
  };
}

export async function findStatusComment(
  ctx: TestContext,
  prNumber: number,
  substring: string,
): Promise<string | null> {
  const comments = await ctx.octokit.issues.listComments({
    ...ctx.repo,
    issue_number: prNumber,
    per_page: 30,
  });
  const match = comments.data.find((c) => c.body?.includes(substring));
  return match?.body ?? null;
}

export async function getPrBody(
  ctx: TestContext,
  prNumber: number,
): Promise<string> {
  const pr = await ctx.octokit.pulls.get({
    ...ctx.repo,
    pull_number: prNumber,
  });
  return pr.data.body ?? '';
}

export async function deleteFile(
  ctx: TestContext,
  branch: string,
  path: string,
  message: string,
): Promise<void> {
  const file = await ctx.octokit.repos.getContent({
    ...ctx.repo,
    path,
    ref: branch,
  });

  if (!('sha' in file.data)) {
    throw new Error('Unexpected response from getContent');
  }

  await ctx.octokit.repos.deleteFile({
    ...ctx.repo,
    path,
    message,
    sha: file.data.sha,
    branch,
  });
}

export async function cleanup(ctx: TestContext): Promise<void> {
  log('Running cleanup...');

  for (const prNumber of ctx.prsToClose) {
    try {
      log(`  Closing PR #${prNumber}`);
      await ctx.octokit.pulls.update({
        ...ctx.repo,
        pull_number: prNumber,
        state: 'closed',
      });
    } catch {
      // PR may already be closed/merged
    }
  }

  for (const { branch, path } of ctx.filesToDelete) {
    try {
      log(`  Deleting file ${path} on ${branch}`);
      await deleteFile(ctx, branch, path, `e2e: clean up ${path}`);
    } catch {
      // File may already be deleted
    }
  }

  for (const branch of ctx.branchesToDelete) {
    try {
      log(`  Deleting branch ${branch}`);
      await ctx.octokit.git.deleteRef({
        ...ctx.repo,
        ref: `heads/${branch}`,
      });
    } catch {
      // Branch may already be deleted
    }
  }

  if (ctx.originalWorkflowSha) {
    try {
      await restoreWorkflowFile(ctx);
    } catch (err) {
      log(`  Warning: failed to restore workflow: ${err}`);
    }
  }
}
