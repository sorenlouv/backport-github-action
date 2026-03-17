import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock('node:readline', () => ({
  createInterface: vi.fn(() => ({
    question: (_prompt: string, cb: () => void) => cb(),
    close: vi.fn(),
  })),
}));

const mockExecSync = execSync as Mock;
const mockReadFileSync = readFileSync as Mock;
const mockWriteFileSync = writeFileSync as Mock;

class ExitError extends Error {
  code: number;
  constructor(code: number) {
    super(`process.exit(${code})`);
    this.code = code;
  }
}

const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
  throw new ExitError(code as number);
});
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => {});

// Must import after mocks are set up
const { runRelease, ACTION_ROOT, BACKPORT_ROOT } = await import('./release.js');

// ---------------------------------------------------------------------------
// Helpers for configuring mocks
// ---------------------------------------------------------------------------

const FAKE_README = 'Use sorenlouv/backport-github-action@v11 in your workflow';
const FAKE_PKG_JSON = JSON.stringify({
  version: '11.0.0',
  dependencies: { backport: '11.0.0' },
});
const FAKE_SMOKE_TEST = [
  'Restoring workflow to original version (@v11)',
  "makeWorkflowContent('v11')",
  'e2e: restore action to @v11',
].join('\n');

function setupFsMocks(overrides: Record<string, string> = {}) {
  const files: Record<string, string> = {
    README: overrides.README ?? FAKE_README,
    PKG: overrides.PKG ?? FAKE_PKG_JSON,
    SMOKE: overrides.SMOKE ?? FAKE_SMOKE_TEST,
  };

  mockReadFileSync.mockImplementation((filePath: string) => {
    if (filePath.endsWith('README.md')) return files.README;
    if (filePath.endsWith('package.json')) return files.PKG;
    if (filePath.endsWith('github-api.ts')) return files.SMOKE;
    return '';
  });
}

interface ExecSyncOverrides {
  backportStatus?: string;
  backportBranch?: string;
  actionBranch?: string;
  actionBetaBranchExists?: boolean;
  publishedVersion?: string;
}

function setupExecSyncMock(overrides: ExecSyncOverrides = {}) {
  const {
    backportStatus = '',
    backportBranch = 'main',
    actionBranch = 'main',
    actionBetaBranchExists = false,
    publishedVersion,
  } = overrides;

  mockExecSync.mockImplementation((cmd: string, opts: { cwd?: string }) => {
    const cwd = opts?.cwd ?? '';
    const isBackportRepo = cwd === BACKPORT_ROOT;

    if (cmd === 'git status --porcelain' && isBackportRepo) {
      return Buffer.from(backportStatus);
    }

    if (cmd === 'git rev-parse --abbrev-ref HEAD') {
      if (isBackportRepo) return Buffer.from(backportBranch);
      return Buffer.from(actionBranch);
    }

    if (cmd.startsWith('git branch --list')) {
      return Buffer.from(actionBetaBranchExists ? cmd.split(' ').pop()! : '');
    }

    if (cmd.startsWith('npm view backport@')) {
      return Buffer.from(publishedVersion ?? '');
    }

    return Buffer.from('');
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('runRelease', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExit.mockImplementation((code) => {
      throw new ExitError(code as number);
    });
    mockConsoleError.mockImplementation(() => {});
  });

  // -------------------------------------------------------------------------
  // Invalid version / error conditions
  // -------------------------------------------------------------------------

  describe('argument validation', () => {
    it('exits when version is undefined', async () => {
      await expect(runRelease(undefined)).rejects.toThrow(ExitError);

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Usage: npm run release'),
      );
    });

    it('exits when version is empty string', async () => {
      await expect(runRelease('')).rejects.toThrow(ExitError);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('exits when version format is invalid', async () => {
      await expect(runRelease('abc')).rejects.toThrow(ExitError);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('exits when version has only major.minor', async () => {
      await expect(runRelease('11.0')).rejects.toThrow(ExitError);
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('backport repo checks', () => {
    it('exits when backport repo has uncommitted changes', async () => {
      setupFsMocks();
      setupExecSyncMock({ backportStatus: 'M src/index.ts' });

      await expect(runRelease('11.1.0')).rejects.toThrow(ExitError);

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('uncommitted changes'),
      );
    });

    it('exits when backport repo is not on main branch', async () => {
      setupFsMocks();
      setupExecSyncMock({ backportBranch: 'feature-branch' });

      await expect(runRelease('11.1.0')).rejects.toThrow(ExitError);

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('expected "main"'),
      );
    });
  });

  describe('npm publish verification', () => {
    it('exits when npm published version does not match', async () => {
      setupFsMocks();
      setupExecSyncMock({ publishedVersion: '11.0.0' });

      await expect(runRelease('11.1.0')).rejects.toThrow(ExitError);

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('expected backport@11.1.0 on npm'),
      );
    });
  });

  describe('action repo branch checks', () => {
    it('exits when action repo is not on main for stable release', async () => {
      setupFsMocks();
      setupExecSyncMock({
        publishedVersion: '11.1.0',
        actionBranch: 'develop',
      });

      await expect(runRelease('11.1.0')).rejects.toThrow(ExitError);

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('expected "main" for stable release'),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Successful stable release (same major)
  // -------------------------------------------------------------------------

  describe('stable release (same major)', () => {
    beforeEach(async () => {
      setupFsMocks();
      setupExecSyncMock({ publishedVersion: '11.1.0' });

      await runRelease('11.1.0');
    });

    it('builds backport', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm run build',
        expect.objectContaining({ cwd: BACKPORT_ROOT }),
      );
    });

    it('runs npm version', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm version 11.1.0',
        expect.objectContaining({ cwd: BACKPORT_ROOT }),
      );
    });

    it('pushes backport repo tags', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'git push origin main --tags',
        expect.objectContaining({ cwd: BACKPORT_ROOT }),
      );
    });

    it('runs npm install in action repo', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'npm install',
        expect.objectContaining({ cwd: ACTION_ROOT }),
      );
    });

    it('commits the release in action repo', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'git add -A && git commit -m "chore: release v11.1.0"',
        expect.objectContaining({ cwd: ACTION_ROOT }),
      );
    });

    it('creates force-updated major tag and version tag', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'git tag -f v11',
        expect.objectContaining({ cwd: ACTION_ROOT }),
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'git tag v11.1.0',
        expect.objectContaining({ cwd: ACTION_ROOT }),
      );
    });

    it('pushes action repo tags', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'git push origin v11 v11.1.0 --force',
        expect.objectContaining({ cwd: ACTION_ROOT }),
      );
    });

    it('creates GitHub release for backport-github-action', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'gh release create v11.1.0 --title "v11.1.0" --notes "Update backport to 11.1.0" --latest',
        expect.objectContaining({ cwd: ACTION_ROOT }),
      );
    });

    it('creates GitHub release for backport', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'gh release create v11.1.0 --title "v11.1.0" --generate-notes --latest',
        expect.objectContaining({ cwd: BACKPORT_ROOT }),
      );
    });

    it('does not update README or smoke test files', () => {
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Successful stable release (major bump)
  // -------------------------------------------------------------------------

  describe('stable release (major bump)', () => {
    beforeEach(async () => {
      setupFsMocks();
      setupExecSyncMock({ publishedVersion: '12.0.0' });

      await runRelease('12.0.0');
    });

    it('updates README version references via writeFileSync', () => {
      expect(mockWriteFileSync).toHaveBeenCalledWith(
        expect.stringContaining('README.md'),
        expect.stringContaining('backport-github-action@v12'),
      );
    });

    it('updates smoke test file via writeFileSync', () => {
      const smokeWriteCalls = mockWriteFileSync.mock.calls.filter(
        (args: any[]) =>
          typeof args[0] === 'string' && args[0].endsWith('github-api.ts'),
      );
      expect(smokeWriteCalls.length).toBeGreaterThan(0);
    });

    it('creates tags with the new major version', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'git tag -f v12',
        expect.objectContaining({ cwd: ACTION_ROOT }),
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'git tag v12.0.0',
        expect.objectContaining({ cwd: ACTION_ROOT }),
      );
    });

    it('creates GitHub releases for both repos', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'gh release create v12.0.0 --title "v12.0.0" --notes "Update backport to 12.0.0" --latest',
        expect.objectContaining({ cwd: ACTION_ROOT }),
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'gh release create v12.0.0 --title "v12.0.0" --generate-notes --latest',
        expect.objectContaining({ cwd: BACKPORT_ROOT }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Successful beta release
  // -------------------------------------------------------------------------

  describe('beta release', () => {
    beforeEach(async () => {
      setupFsMocks();
      setupExecSyncMock({
        publishedVersion: '12.0.0-beta.0',
        actionBranch: 'v12-beta',
        actionBetaBranchExists: true,
      });

      await runRelease('12.0.0-beta.0');
    });

    it('does not create tags', () => {
      const tagCalls = mockExecSync.mock.calls.filter(
        (args: any[]) =>
          typeof args[0] === 'string' && args[0].startsWith('git tag'),
      );
      expect(tagCalls).toHaveLength(0);
    });

    it('pushes the beta branch instead of main', () => {
      expect(mockExecSync).toHaveBeenCalledWith(
        'git push origin v12-beta',
        expect.objectContaining({ cwd: ACTION_ROOT }),
      );
    });

    it('does not create a GitHub release', () => {
      const releaseCalls = mockExecSync.mock.calls.filter(
        (args: any[]) =>
          typeof args[0] === 'string' && args[0].startsWith('gh release'),
      );
      expect(releaseCalls).toHaveLength(0);
    });

    it('uses --tag beta for npm publish prompt', () => {
      expect(createInterface).toHaveBeenCalled();
    });

    it('does not update README or smoke test files', () => {
      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });
  });

  describe('beta release creates new branch when missing', () => {
    it('creates a new beta branch', async () => {
      setupFsMocks();
      setupExecSyncMock({
        publishedVersion: '12.0.0-beta.0',
        actionBranch: 'main',
        actionBetaBranchExists: false,
      });

      await runRelease('12.0.0-beta.0');

      expect(mockExecSync).toHaveBeenCalledWith(
        'git checkout -b v12-beta',
        expect.objectContaining({ cwd: ACTION_ROOT }),
      );
    });
  });
});
