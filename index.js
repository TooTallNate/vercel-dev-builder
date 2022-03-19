const {
	glob,
	download,
	getLatestNodeVersion,
	getSpawnOptions,
	runNpmInstall,
	runPackageJsonScript,
} = require('@vercel/build-utils');

const BUILD_SET_SYMBOL = Symbol('BUILD_SET_SYMBOL');

async function build(opts) {
	const { files, workPath, meta } = opts;
	await download(files, workPath, meta);

	const buildSet = meta[BUILD_SET_SYMBOL] || new Set();
	if (!meta[BUILD_SET_SYMBOL]) {
		meta[BUILD_SET_SYMBOL] = buildSet;
	}

	if (!buildSet.has(workPath)) {
		const installTime = Date.now();
		console.log('Installing local runtime dependencies...');
		await runNpmInstall(workPath, ['--prefer-offline'], {}, meta);
		console.log(`Install complete [${Date.now() - installTime}ms]`);

		const spawnOpts = getSpawnOptions(meta, getLatestNodeVersion());
		await runPackageJsonScript(workPath, 'build', spawnOpts);
		buildSet.add(workPath);
	}

	// TODO: purge the require cache before require() when `meta.isDev`
	const builder = require(workPath);
	return builder.build(opts);
}

async function prepareCache(opts) {
	const builder = require(opts.workPath);
	const ops = [glob('node_modules/**', opts.workPath)];
	if (typeof builder.prepareCache === 'function') {
		ops.push(builder.prepareCache(opts));
	}
	const [builderNodeModules, builderCache] = await Promise.all(ops);
	return {
		...builderNodeModules,
		...builderCache,
	};
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
	prepareCache,
	shouldServe,
	startDevServer,
};
