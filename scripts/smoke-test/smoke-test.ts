import { execSync } from 'node:child_process';
import { Octokit } from '@octokit/rest';
import {
  type TestContext,
  cleanup,
  createBranch,
  createFile,
  createPr,
  findBackportPr,
  getMasterSha,
  mergePr,
  updateWorkflowFile,
  waitForRun,
} from './github-api.js';
import { assert, bold, fail, header, log, pass, sleep } from './logger.js';

const actionRef =
  process.argv[2] ||
  execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

const token =
  process.env.GITHUB_TOKEN ||
  execSync('gh auth token').toString().trim();

const timestamp = Math.floor(Date.now() / 1000);

const ctx: TestContext = {
  octokit: new Octokit({ auth: token }),
  repo: { owner: 'backport-org', repo: 'backport-demo' },
  branchesToDelete: [],
  prsToClose: [],
  originalWorkflowSha: null,
};

// -------------------------------------------------------------------------
// Test 1: Happy path — auto-backport to production
// -------------------------------------------------------------------------
async function testHappyPath(): Promise<number> {
  header('Test 1: Happy path — auto-backport to production');
  let failures = 0;

  const branch = `e2e-${timestamp}`;
  const baseSha = await getMasterSha(ctx);
  log(`Creating branch ${branch} from ${baseSha.slice(0, 7)}`);
  await createBranch(ctx, branch, baseSha);

  log('Committing test file');
  await createFile(
    ctx,
    branch,
    `e2e-${timestamp}.md`,
    `# E2E test ${timestamp}\nThis file validates backport-github-action@${actionRef}\n`,
    `e2e: add test file for ${actionRef}`,
  );

  log('Creating PR with label auto-backport-to-production');
  const prNumber = await createPr(
    ctx,
    branch,
    `e2e: test backport to production (${timestamp})`,
    ['auto-backport-to-production'],
  );
  log(`Created PR #${prNumber}`);

  log(`Merging PR #${prNumber}`);
  const mergedAfter = new Date().toISOString();
  await mergePr(ctx, prNumber);

  const { conclusion, runId } = await waitForRun(ctx, prNumber, mergedAfter);

  failures += assert(
    conclusion === 'success',
    `Workflow run #${runId} succeeded`,
    `Workflow run #${runId} concluded with: ${conclusion}`,
  );

  await sleep(5000);

  const backportPr = await findBackportPr(ctx, 'production', prNumber);

  failures += assert(
    backportPr !== null,
    'Backport PR to production was created',
    'No backport PR targeting production was found',
  );

  if (backportPr) {
    log(`  PR #${backportPr.number} (branch: ${backportPr.headRefName})`);
    ctx.prsToClose.push(backportPr.number);
    ctx.branchesToDelete.push(backportPr.headRefName);
  }

  return failures;
}

// -------------------------------------------------------------------------
// Test 2: No backport labels — should not fail
// -------------------------------------------------------------------------
async function testNoLabels(): Promise<number> {
  header('Test 2: No backport labels — action should succeed (not fail CI)');
  let failures = 0;

  const branch = `e2e-nolabel-${timestamp}`;
  const baseSha = await getMasterSha(ctx);
  log(`Creating branch ${branch} from ${baseSha.slice(0, 7)}`);
  await createBranch(ctx, branch, baseSha);

  log('Committing test file');
  await createFile(
    ctx,
    branch,
    `e2e-nolabel-${timestamp}.md`,
    `# E2E no-label test ${timestamp}\nThis PR has no backport labels.\n`,
    'e2e: add no-label test file',
  );

  log('Creating PR without backport labels');
  const prNumber = await createPr(
    ctx,
    branch,
    `e2e: no-label test (${timestamp})`,
  );
  log(`Created PR #${prNumber}`);

  log(`Merging PR #${prNumber}`);
  const mergedAfter = new Date().toISOString();
  await mergePr(ctx, prNumber);

  const { conclusion, runId } = await waitForRun(ctx, prNumber, mergedAfter);

  failures += assert(
    conclusion === 'success',
    `Workflow run #${runId} succeeded (no-branches-exception was ignored as expected)`,
    `Workflow run #${runId} concluded with: ${conclusion} (expected success)`,
  );

  await sleep(3000);

  const backportPr = await findBackportPr(ctx, 'production', prNumber);

  failures += assert(
    backportPr === null,
    'No backport PR was created (as expected)',
    'A backport PR was unexpectedly created',
  );

  return failures;
}

// -------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------
console.error('');
log(bold('E2E Smoke Test for backport-github-action'));
log(`Action ref: ${bold(actionRef)}`);
log(`Demo repo:  ${ctx.repo.owner}/${ctx.repo.repo}`);
log(`Timestamp:  ${timestamp}`);
console.error('');

let failures = 0;
try {
  await updateWorkflowFile(ctx, actionRef);
  failures += await testHappyPath();
  failures += await testNoLabels();
} finally {
  await cleanup(ctx);
}

console.error('');
if (failures > 0) {
  fail(bold(`${failures} assertion(s) failed`));
  process.exit(1);
} else {
  pass(bold('All tests passed'));
  process.exit(0);
}
