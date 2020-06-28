const { join } = require('path');
const { spawnSync } = require('child_process');
const { download, runNpmInstall, runPackageJsonScript } = require('@vercel/build-utils');

async function build(opts) {
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

  // TODO: purge the require cache before require()
  const builder = require(workPath);
  return builder.build(opts);
}

async function shouldServe(opts) {
  // TODO: purge the require cache before require()
  const builder = require(opts.workPath);
  if (typeof builder.shouldServe === 'function') {
    return builder.shouldServe(opts);
  }
  return false;
}

async function startDevServer(opts) {
  // TODO: purge the require cache before require()
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
