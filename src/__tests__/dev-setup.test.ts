// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  BUILDBASE_DEV,
  DEV_PORT,
  MIN_NODE,
  collectSecrets,
  compareVersions,
  credentialsState,
  generateSecret,
  isPlaceholder,
  isStrongSecret,
  parseEnv,
  renderDevEnv,
  requiredNode,
  resolveStudioDir,
  writeFileSafe,
} from '../../scripts/dev/lib.mjs';

/**
 * The helpers behind `npm run setup` and `npm run dev:all`
 * (scripts/dev/): never overwrite a developer's file without --force,
 * generate strong secrets, never invent the secrets a developer must bring,
 * and point local runs at the BuildBase development environment.
 */

describe('secrets', () => {
  it('generates a strong, unique SYSTEM_SECRET', () => {
    const a = generateSecret();
    const b = generateSecret();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(64);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(isStrongSecret(a)).toBe(true);
  });

  it('rejects short, placeholder and low-variety secrets', () => {
    expect(isStrongSecret('')).toBe(false);
    expect(isStrongSecret(undefined)).toBe(false);
    expect(isStrongSecret('short-secret')).toBe(false);
    // The value in .env.example and the CI placeholder.
    expect(isStrongSecret('your-super-secret-key-at-least-32-chars')).toBe(
      false
    );
    expect(isStrongSecret('ci-build-only-not-a-secret-0123456789abcdef')).toBe(
      false
    );
    expect(isStrongSecret('a'.repeat(64))).toBe(false);
    expect(isStrongSecret('abababababababababababababababab')).toBe(false);
  });

  it('treats example values as placeholders', () => {
    expect(isPlaceholder('')).toBe(true);
    expect(isPlaceholder('your-client-secret')).toBe(true);
    expect(isPlaceholder('whsec_xxx')).toBe(true);
    expect(isPlaceholder('kP3vQ9xYz')).toBe(false);
  });
});

describe('renderDevEnv', () => {
  const systemSecret = generateSecret();

  it('points at the BuildBase development environment on localhost:3000', () => {
    const env = parseEnv(renderDevEnv({ systemSecret }));
    expect(DEV_PORT).toBe(3000);
    expect(env.NEXT_PUBLIC_BUILDBASE_ORG_ID).toBe('6b01478bb42d2c444e99fcd8');
    expect(env.NEXT_PUBLIC_BUILDBASE_ENVIRONMENT).toBe('fsyqdskf');
    expect(env.NEXT_PUBLIC_BUILDBASE_CLIENT_ID).toBe(BUILDBASE_DEV.clientId);
    expect(env.NEXT_PUBLIC_BUILDBASE_REDIRECT_URL).toBe(
      'http://localhost:3000'
    );
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000');
    expect(env.SITE_URL).toBe('http://localhost:3000');
    expect(env.SYSTEM_SECRET).toBe(systemSecret);
  });

  it('matches the public values deploy:dev builds dev.renderweld.com with', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
    );
    const deployDev: string = pkg.scripts['deploy:dev'];
    expect(deployDev).toContain(
      `NEXT_PUBLIC_BUILDBASE_ORG_ID=${BUILDBASE_DEV.orgId}`
    );
    expect(deployDev).toContain(
      `NEXT_PUBLIC_BUILDBASE_CLIENT_ID=${BUILDBASE_DEV.clientId}`
    );
    expect(deployDev).toContain(
      `NEXT_PUBLIC_BUILDBASE_ENVIRONMENT=${BUILDBASE_DEV.environment}`
    );
  });

  it('leaves bring-your-own secrets empty and skips validation without a client secret', () => {
    const env = parseEnv(renderDevEnv({ systemSecret }));
    expect(env.BUILDBASE_CLIENT_SECRET).toBe('');
    expect(env.BUILDBASE_WEBHOOK_SECRET).toBe('');
    expect(env.BUILDBASE_API_TOKEN).toBe('');
    expect(env.SKIP_ENV_VALIDATION).toBe('true');
    expect(credentialsState(env)).toEqual({
      clientSecret: false,
      webhookSecret: false,
      apiToken: false,
      systemSecret: true,
    });
  });

  it('writes given secrets and validates env once a client secret is there', () => {
    const env = parseEnv(
      renderDevEnv({
        systemSecret,
        secrets: {
          BUILDBASE_CLIENT_SECRET: 'cs_live_value_123',
          BUILDBASE_WEBHOOK_SECRET: 'your-webhook-secret',
        },
      })
    );
    expect(env.BUILDBASE_CLIENT_SECRET).toBe('cs_live_value_123');
    // A placeholder is never written as if it were real.
    expect(env.BUILDBASE_WEBHOOK_SECRET).toBe('');
    expect(env.SKIP_ENV_VALIDATION).toBeUndefined();
  });

  it('refuses a weak SYSTEM_SECRET', () => {
    expect(() => renderDevEnv({ systemSecret: 'too-short' })).toThrow();
  });
});

describe('collectSecrets', () => {
  it('keeps the previous file’s secrets on --force', () => {
    const old = generateSecret();
    const { systemSecret, secrets } = collectSecrets({
      previous: {
        SYSTEM_SECRET: old,
        BUILDBASE_CLIENT_SECRET: 'kept-client-secret-1',
        BUILDBASE_API_TOKEN: '',
      },
      processEnv: {
        BUILDBASE_CLIENT_SECRET: 'from-env-should-lose',
        BUILDBASE_API_TOKEN: 'org:token-from-env',
      },
    });
    expect(systemSecret).toBe(old);
    expect(secrets.BUILDBASE_CLIENT_SECRET).toBe('kept-client-secret-1');
    expect(secrets.BUILDBASE_API_TOKEN).toBe('org:token-from-env');
  });

  it('replaces a weak SYSTEM_SECRET and never generates the others', () => {
    const { systemSecret, secrets } = collectSecrets({
      previous: { SYSTEM_SECRET: 'your-super-secret-key-at-least-32-chars' },
      processEnv: {},
    });
    expect(isStrongSecret(systemSecret)).toBe(true);
    expect(secrets).toEqual({});
  });
});

describe('writeFileSafe', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rw-setup-'));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('creates a missing file', () => {
    const file = path.join(dir, '.env.development.local');
    expect(writeFileSafe(file, 'A=1\n')).toEqual({ action: 'created' });
    expect(fs.readFileSync(file, 'utf8')).toBe('A=1\n');
  });

  it('never overwrites an existing file without force', () => {
    const file = path.join(dir, '.env.development.local');
    fs.writeFileSync(file, 'MINE=1\n');
    expect(writeFileSafe(file, 'NEW=1\n')).toEqual({ action: 'kept' });
    expect(fs.readFileSync(file, 'utf8')).toBe('MINE=1\n');
    expect(fs.existsSync(`${file}.bak`)).toBe(false);
  });

  it('overwrites with force and keeps a backup', () => {
    const file = path.join(dir, '.env.development.local');
    fs.writeFileSync(file, 'MINE=1\n');
    const r = writeFileSafe(file, 'NEW=1\n', { force: true });
    expect(r.action).toBe('overwritten');
    expect(fs.readFileSync(file, 'utf8')).toBe('NEW=1\n');
    expect(fs.readFileSync(`${file}.bak`, 'utf8')).toBe('MINE=1\n');
  });

  it('writes files only the owner can read', () => {
    if (process.platform === 'win32') return;
    const file = path.join(dir, 'secret.env');
    writeFileSafe(file, 'S=1\n');
    expect(fs.statSync(file).mode & 0o077).toBe(0);
  });
});

describe('parseEnv', () => {
  it('reads comments, quotes, export and inline comments', () => {
    expect(
      parseEnv(
        [
          '# comment',
          'A=1',
          'export B="two words"',
          "C='x=y'",
          'D=value # note',
          'E=',
          'not a line',
        ].join('\n')
      )
    ).toEqual({ A: '1', B: 'two words', C: 'x=y', D: 'value', E: '' });
  });
});

describe('Node version', () => {
  it('compares versions', () => {
    expect(compareVersions('v22.12.0', '22.12.0')).toBe(0);
    expect(compareVersions('22.11.9', '22.12.0')).toBe(-1);
    expect(compareVersions('24.0.0', '22.12.0')).toBe(1);
    expect(compareVersions('20', '22.12.0')).toBe(-1);
  });

  it('needs at least Wrangler’s minimum, or .nvmrc when higher', () => {
    expect(requiredNode('22\n')).toBe(MIN_NODE);
    expect(requiredNode('20')).toBe(MIN_NODE);
    expect(requiredNode('24.1.0')).toBe('24.1.0');
    expect(requiredNode('lts/*')).toBe(MIN_NODE);
  });

  it('.nvmrc names a Node major that satisfies Wrangler', () => {
    const nvmrc = fs.readFileSync(path.join(__dirname, '../../.nvmrc'), 'utf8');
    expect(Number(nvmrc.trim())).toBeGreaterThanOrEqual(22);
  });
});

describe('resolveStudioDir', () => {
  it('defaults to ../reelforge-studio next to the repo', () => {
    expect(resolveStudioDir({ env: {}, repoRoot: '/w/site' })).toEqual({
      dir: path.resolve('/w/reelforge-studio'),
      explicit: false,
    });
  });

  it('honours STUDIO_REPO_DIR, relative to the repo', () => {
    expect(
      resolveStudioDir({
        env: { STUDIO_REPO_DIR: '../studio-wt' },
        repoRoot: '/w/site',
      })
    ).toEqual({ dir: path.resolve('/w/studio-wt'), explicit: true });
  });
});
