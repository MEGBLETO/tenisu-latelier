const { execFileSync, spawnSync } = require('node:child_process');
const { setTimeout } = require('node:timers/promises');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
let containerId;

function docker(...args) {
  return execFileSync('docker', args, { encoding: 'utf8' }).trim();
}

function run(script, args, env) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error('Test command failed.');
}

async function main() {
  try {
    containerId = docker(
      'run',
      '--detach',
      '--publish',
      '127.0.0.1::5432',
      '--env',
      'POSTGRES_USER=tenisu_test',
      '--env',
      'POSTGRES_PASSWORD=test_password',
      '--env',
      'POSTGRES_DB=tenisu_test',
      '--health-cmd',
      'pg_isready -U tenisu_test -d tenisu_test',
      '--health-interval',
      '1s',
      '--health-timeout',
      '3s',
      '--health-retries',
      '30',
      'postgres:17-alpine',
    );

    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      const status = docker(
        'inspect',
        '--format',
        '{{.State.Health.Status}}',
        containerId,
      );
      if (status === 'healthy') {
        ready = true;
        break;
      }
      if (status === 'unhealthy')
        throw new Error('Test database is unhealthy.');
      await setTimeout(1000);
    }
    if (!ready)
      throw new Error('Test database did not start within 60 seconds.');

    const address = docker('port', containerId, '5432/tcp');
    const databaseUrl = `postgresql://tenisu_test:test_password@${address}/tenisu_test`;
    const env = {
      ...process.env,
      NODE_ENV: 'test',
      DATABASE_URL: databaseUrl,
      TEST_DATABASE_URL: databaseUrl,
    };

    run('node_modules/prisma/build/index.js', ['migrate', 'deploy'], env);
    run(
      'node_modules/jest/bin/jest.js',
      [
        '--config',
        'test/jest-e2e.json',
        '--runInBand',
        ...process.argv.slice(2),
      ],
      env,
    );
  } finally {
    if (containerId) docker('rm', '--force', '--volumes', containerId);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
