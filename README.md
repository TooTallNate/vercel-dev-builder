# Vercel Dev Builder (`vercel-dev-builder`)

This is a "passthrough-Builder" for Vercel that is meant for use _within_ the
repo of your custom Vercel Builder. It makes developing Builders easier by being
able to deploy any change to the Builder without needing to publish the package
to the npm registry.

All the Builder functions are very simple passthrough functions that `require()`
the code at the root of the repository and then execute the Builder's
implementation.

When deploying to Vercel, it runs `npm install` and the `"build"` script
specified in the `package.json` file to build the Builder if necessary. This is
done for compatibility with Git deployments (where the source code is not
built), allowing every commit to the Builder repo to be deployed to Vercel
without needing to publish the changes to the npm registry.

For development with the `vercel dev` command, it is assumed that you have the
npm dependencies installed and have built the Builder if necessary.

## Usage

Specify **`vercel-dev-builder`** in your `vercel.json` file:

```json
{
	"functions": {
		"api/**/*.abc": { "runtime": "vercel-dev-builder@0.0.5" }
	}
}
```

> **Note:** Be sure to place the `vercel.json` file in the _root_ directory of
> your project.

For some real-world usage examples, see
[vercel-deno](https://github.com/vercel-community/deno/blob/master/vercel.json#L5)
or
[vercel-bash](https://github.com/vercel-community/bash/blob/master/vercel.json#L4).
