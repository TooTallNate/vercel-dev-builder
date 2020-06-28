const { join } = require('path');
const { spawnSync } = require('child_process');
const { download, runNpmInstall, runPackageJsonScript } = require('@vercel/build-utils');

async function build(opts) {
  console.log('build', opts);
  const { files, workPath, meta } = opts;
  await download(files, workPath, meta);

  const installTime = Date.now();
  console.log('Installing local runtime dependencies...');
  await runNpmInstall(
    workPath,
    ['--prefer-offline'],
    {},
    meta
  );
  console.log(`Install complete [${Date.now() - installTime}ms]`);

  await runPackageJsonScript(workPath, 'build');

  const builder = require(workPath);
  console.log('builder', builder);
  return builder.build(opts);
}

async function shouldServe(opts) {
  console.log('shouldServe', opts);
  const builder = require(opts.workPath);
  if (typeof builder.shouldServe === 'function') {
    return builder.shouldServe(opts);
  }
  return false;
}

async function startDevServer(opts) {
  console.log('startDevServer', opts);
  const builder = require(opts.workPath);
  if (typeof builder.startDevServer === 'function') {
    return builder.startDevServer(opts);
  }
  return null;
}

module.exports = {
  version: 3,
  build,
  shouldServe,
  startDevServer,
};
