# Vercel Dev Runtime (`vercel-dev-runtime`)

This is a "passthrough-runtime" for Vercel that is meant for use _within_ the
repo of your custom Vercel Runtime. It makes developing Runtimes easier by being
able to deploy any change to the Runtime without needing to publish the package to
the npm registry.

All the Runtime functions are very simple passthrough functions that `require()`
the code at the root of the repository and then execute the Runtime's
implementation.

When deploying to Vercel, it runs `npm install` and the `"build"` script specified
in the `package.json` file to build the Runtime if necessary. This is done for
compatibility with Git deployments (where the source code is not built), allowing
every commit to the Runtime repo to be deployed to Vercel without needing to
publish the changes to the npm registry.

For development with the `vercel dev` command, it is assumed that you have the npm
dependencies installed and have built the Runtime if necessary.

## Usage

Specify the **`vercel-dev-runtime`** runtime in your `vercel.json` file:

```json
{
	"version": 2,
	"functions": {
		"api/**/*.abc": { "runtime": "vercel-dev-runtime@0.0.2" }
	}
}
```

> **Note:** Be sure to place the `vercel.json` file in the _root_ directory of
> your project.

For some real-world usage examples, see
[vercel-deno](https://github.com/TooTallNate/vercel-deno/blob/master/vercel.json#L4)
or
[vercel-bash](https://github.com/importpw/vercel-bash/blob/master/vercel.json#L4)
