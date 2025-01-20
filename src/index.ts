import {
	glob,
	download,
	getNodeVersion,
	getSpawnOptions,
	runNpmInstall,
	runPackageJsonScript,
	type BuildV3,
	type StartDevServer,
	type PrepareCache,
	type ShouldServe,
} from '@vercel/build-utils';

// Special key name for the Set that is stored on
// the `meta` object to determine when the `build()`
// function has been executed.
const VERCEL_DEV_BUILDER_SET = 'VERCEL_DEV_BUILDER_SET';

export const version = 3;

function isSet<T>(v?: unknown): v is Set<T> {
	return !!v && v instanceof Set;
}

export const build: BuildV3 = async (opts) => {
	const { files, workPath, config, meta = {} } = opts;
	await download(files, workPath, meta);

	const _buildSet = meta[VERCEL_DEV_BUILDER_SET];
	let buildSet: Set<string>;
	if (isSet<string>(_buildSet)) {
		buildSet = _buildSet;
	} else {
		buildSet = meta[VERCEL_DEV_BUILDER_SET] = new Set<string>();
	}

	if (!buildSet.has(workPath)) {
		const nodeVersion = await getNodeVersion(
			workPath,
			undefined,
			config,
			meta
		);
		const spawnOpts = getSpawnOptions(meta, nodeVersion);
		await runNpmInstall(workPath, [], spawnOpts, meta, nodeVersion);
		await runPackageJsonScript(workPath, 'build', spawnOpts);
		buildSet.add(workPath);
	}

	// TODO: purge the require cache before require() when `meta.isDev`
	const builder = require(workPath);
	return builder.build(opts);
};

export const prepareCache: PrepareCache = async (opts) => {
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
};

export const shouldServe: ShouldServe = async (opts) => {
	// TODO: purge the require cache before require()
	const builder = require(opts.workPath);
	if (typeof builder.shouldServe === 'function') {
		return builder.shouldServe(opts);
	}
	return false;
};

export const startDevServer: StartDevServer = (opts) => {
	// TODO: purge the require cache before require()
	const builder = require(opts.workPath);
	if (typeof builder.startDevServer === 'function') {
		return builder.startDevServer(opts);
	}
	return null;
};
