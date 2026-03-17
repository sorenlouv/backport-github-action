import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const ACTION_ROOT = resolve(__dirname, '../..');
export const BACKPORT_ROOT = resolve(ACTION_ROOT, '../backport');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg: string) {
  console.error(`${chalk.cyan('[release]')} ${msg}`);
}

function step(msg: string) {
  console.error('');
  console.error(`${chalk.cyan.bold('[release]')} ${chalk.bold(msg)}`);
  console.error(`${chalk.cyan('[release]')} ${'='.repeat(60)}`);
}

export function run(cmd: string, cwd: string): string {
  log(`$ ${chalk.dim(cmd)}`);
  return execSync(cmd, { cwd, stdio: ['inherit', 'pipe', 'inherit'] })
    .toString()
    .trim();
}

export function runPassthrough(cmd: string, cwd: string): void {
  log(`$ ${chalk.dim(cmd)}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

export function waitForEnter(prompt: string): Promise<void> {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question(`${chalk.yellow.bold('[ACTION REQUIRED]')} ${prompt}`, () => {
      rl.close();
      resolve();
    });
  });
}

export function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

export function replaceInFile(
  filePath: string,
  search: string | RegExp,
  replacement: string,
): number {
  const content = readFileSync(filePath, 'utf-8');
  const updated = content.replaceAll(search, replacement);
  if (content === updated) return 0;
  writeFileSync(filePath, updated);
  const count =
    typeof search === 'string'
      ? content.split(search).length - 1
      : (content.match(search) ?? []).length;
  return count;
}

// ---------------------------------------------------------------------------
// Main release flow
// ---------------------------------------------------------------------------

export async function runRelease(version: string | undefined) {
  if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
    console.error(
      `Usage: npm run release -- <version>\n\nExamples:\n  npm run release -- 12.0.0        (stable)\n  npm run release -- 12.0.0-beta.0 (beta)`,
    );
    process.exit(1);
  }

  const isBeta = version.includes('-');
  const major = version.split('.')[0]!;
  const mode = isBeta ? 'beta' : 'stable';

  log(`Version: ${chalk.bold(version)}`);
  log(`Mode:    ${chalk.bold(mode)}`);
  log(`Major:   ${chalk.bold(major)}`);

  // Detect current major from README (for stable releases with major bumps)
  const readmePath = resolve(ACTION_ROOT, 'README.md');
  const readmeContent = readFileSync(readmePath, 'utf-8');
  const currentMajorMatch = readmeContent.match(
    /backport-github-action@v(\d+)/,
  );
  const currentMajor = currentMajorMatch?.[1];

  if (!currentMajor) {
    console.error('Could not detect current major version from README.md');
    process.exit(1);
  }

  const isMajorBump = major !== currentMajor;
  log(
    `Current major: ${chalk.bold(currentMajor)} → ${isMajorBump ? chalk.bold(`${major} (major bump)`) : 'same'}`,
  );

  // -------------------------------------------------------------------------
  // Phase 1: Release backport npm package
  // -------------------------------------------------------------------------

  step('Phase 1: Release backport npm package');

  const backportStatus = run('git status --porcelain', BACKPORT_ROOT);
  if (backportStatus) {
    console.error(
      `Error: backport repo has uncommitted changes:\n${backportStatus}`,
    );
    process.exit(1);
  }

  const backportBranch = run(
    'git rev-parse --abbrev-ref HEAD',
    BACKPORT_ROOT,
  );
  if (backportBranch !== 'main') {
    console.error(
      `Error: backport repo is on branch "${backportBranch}", expected "main"`,
    );
    process.exit(1);
  }

  log('Building backport...');
  runPassthrough('npm run build', BACKPORT_ROOT);

  log(`Running npm version ${version}...`);
  run(`npm version ${version}`, BACKPORT_ROOT);

  log('Pushing to origin...');
  runPassthrough('git push origin main --tags', BACKPORT_ROOT);

  const publishCmd = isBeta ? 'npm publish --tag beta' : 'npm publish';
  await waitForEnter(
    `Run ${chalk.bold(publishCmd)} in ${chalk.bold(BACKPORT_ROOT)}\nPress Enter when done...`,
  );

  log('Verifying publish...');
  const publishedVersion = run(
    `npm view backport@${version} version`,
    BACKPORT_ROOT,
  );
  if (publishedVersion !== version) {
    console.error(
      `Error: expected backport@${version} on npm, got "${publishedVersion}"`,
    );
    process.exit(1);
  }
  log(`Verified: backport@${version} is on npm`);

  // -------------------------------------------------------------------------
  // Phase 2: Update backport-github-action
  // -------------------------------------------------------------------------

  step('Phase 2: Update backport-github-action');

  if (isBeta) {
    const betaBranch = `v${major}-beta`;
    const currentBranch = run(
      'git rev-parse --abbrev-ref HEAD',
      ACTION_ROOT,
    );

    if (currentBranch !== betaBranch) {
      const branchExists =
        run('git branch --list ' + betaBranch, ACTION_ROOT) !== '';
      if (branchExists) {
        log(`Switching to existing branch ${betaBranch}`);
        runPassthrough(`git checkout ${betaBranch}`, ACTION_ROOT);
      } else {
        log(`Creating branch ${betaBranch}`);
        runPassthrough(`git checkout -b ${betaBranch}`, ACTION_ROOT);
      }
    } else {
      log(`Already on ${betaBranch}`);
    }
  } else {
    const currentBranch = run(
      'git rev-parse --abbrev-ref HEAD',
      ACTION_ROOT,
    );
    if (currentBranch !== 'main') {
      console.error(
        `Error: action repo is on branch "${currentBranch}", expected "main" for stable release`,
      );
      process.exit(1);
    }
  }

  const pkgPath = resolve(ACTION_ROOT, 'package.json');
  log('Updating package.json...');
  replaceInFile(
    pkgPath,
    `"version": "${readJson(pkgPath).version}"`,
    `"version": "${version}"`,
  );
  const currentBackportDep = (
    readJson(pkgPath) as { dependencies: Record<string, string> }
  ).dependencies.backport;
  replaceInFile(
    pkgPath,
    `"backport": "${currentBackportDep}"`,
    `"backport": "${version}"`,
  );

  if (!isBeta && isMajorBump) {
    log('Updating README.md version references...');
    const readmeCount = replaceInFile(
      readmePath,
      `backport-github-action@v${currentMajor}`,
      `backport-github-action@v${major}`,
    );
    log(`  Updated ${readmeCount} occurrences in README.md`);

    log('Updating smoke test restore target...');
    const smokeTestPath = resolve(
      ACTION_ROOT,
      'scripts/smoke-test/github-api.ts',
    );
    replaceInFile(
      smokeTestPath,
      `Restoring workflow to original version (@v${currentMajor})`,
      `Restoring workflow to original version (@v${major})`,
    );
    replaceInFile(
      smokeTestPath,
      `makeWorkflowContent('v${currentMajor}')`,
      `makeWorkflowContent('v${major}')`,
    );
    replaceInFile(
      smokeTestPath,
      `e2e: restore action to @v${currentMajor}`,
      `e2e: restore action to @v${major}`,
    );
  } else if (!isBeta) {
    log('Same major version — skipping README and smoke test updates');
  }

  log('Running npm install...');
  runPassthrough('npm install', ACTION_ROOT);

  log('Committing...');
  runPassthrough(
    `git add -A && git commit -m "chore: release v${version}"`,
    ACTION_ROOT,
  );

  // -------------------------------------------------------------------------
  // Phase 3: Tag and push
  // -------------------------------------------------------------------------

  step('Phase 3: Tag and push backport-github-action');

  if (isBeta) {
    const betaBranch = `v${major}-beta`;
    log(`Pushing ${betaBranch}...`);
    runPassthrough(`git push origin ${betaBranch}`, ACTION_ROOT);
  } else {
    log('Creating tags...');
    run(`git tag -f v${major}`, ACTION_ROOT);
    run(`git tag v${version}`, ACTION_ROOT);

    log('Pushing...');
    runPassthrough('git push origin main', ACTION_ROOT);
    runPassthrough(
      `git push origin v${major} v${version} --force`,
      ACTION_ROOT,
    );

    log('Creating GitHub Release for backport-github-action...');
    run(
      `gh release create v${version} --title "v${version}" --notes "Update backport to ${version}" --latest`,
      ACTION_ROOT,
    );

    log('Creating GitHub Release for backport...');
    run(
      `gh release create v${version} --title "v${version}" --generate-notes --latest`,
      BACKPORT_ROOT,
    );
  }

  // -------------------------------------------------------------------------
  // Phase 4: Next steps
  // -------------------------------------------------------------------------

  step('Done!');

  if (isBeta) {
    const betaBranch = `v${major}-beta`;
    log(`Beta ${chalk.bold(`v${version}`)} published!`);
    console.error('');
    log('Next steps:');
    log(
      `  1. Run smoke test: ${chalk.bold(`npm run test:e2e -- ${betaBranch}`)}`,
    );
    log(`  2. Verify: https://www.npmjs.com/package/backport/v/${version}`);
  } else {
    log(`Release ${chalk.bold(`v${version}`)} complete!`);
    console.error('');
    log('Next steps:');
    log(
      `  1. Run smoke test: ${chalk.bold(`npm run test:e2e -- v${major}`)}`,
    );
    log(
      `  2. Verify: https://github.com/sorenlouv/backport/releases`,
    );
    log(
      `  3. Verify: https://github.com/sorenlouv/backport-github-action/releases`,
    );
    log(
      `  4. Verify: https://www.npmjs.com/package/backport/v/${version}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Run when executed directly from CLI
// ---------------------------------------------------------------------------

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  await runRelease(process.argv[2]);
}
