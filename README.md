# @ryaninvents/plugin-bundle-nextjs

> Plugin for [@pika/pack](https://github.com/pikapkg/pack) to package a Next.js app for AWS Lambda

[![CircleCI build status](https://img.shields.io/circleci/project/github/ryaninvents/plugin-bundle-nextjs/develop.svg?logo=circleci&style=flat)](https://circleci.com/gh/ryaninvents/plugin-bundle-nextjs)
[![View on npm](https://img.shields.io/npm/v/@ryaninvents/plugin-bundle-nextjs.svg?style=flat)](https://www.npmjs.com/package/@ryaninvents/plugin-bundle-nextjs)
[![GitHub repository](https://img.shields.io/github/stars/ryaninvents/plugin-bundle-nextjs.svg?style=social)](https://github.com/ryaninvents/plugin-bundle-nextjs)
[![License](https://img.shields.io/npm/l/@ryaninvents/plugin-bundle-nextjs.svg?style=flat)](https://www.npmjs.com/package/@ryaninvents/plugin-bundle-nextjs)

## Why would I want this?

This package creates a zip file containing source and built assets for a [Next.js](https://nextjs.org/) app. After the build step runs, the zip file will be available in `./pkg/dist-next.zip`.

I built this package because I wanted to build an AWS Lambda function source zip using Pika Pack.

## Produced bundle

The ZIP file that this builder produces contains the following files:

- `package.json` **after** Pika transformations
- `index.js` -- contents are from `dist-node/index.js`
- `next.config.js` if it exists
- All content under `pages/**`, with no transformation
- Pre-built Next assets from `.next/**`
- Other content specified via [`sources` option](#sources)

> **Note:** Your lambda's entry point will always be `index.js`, irrespective of the original filename.

## Installation

Use the package manager [npm](https://docs.npmjs.com/about-npm/) to install `@ryaninvents/plugin-bundle-nextjs`.

```bash
npm install --save-dev @ryaninvents/plugin-bundle-nextjs
```

Then, modify your `@pika/pack` configuration in your `package.json` to enable:

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@ryaninvents/plugin-bundle-nextjs"]
    ]
  }
}
```

For more details on setting up Pack, refer to the [@pika/pack repository](https://github.com/pikapkg/pack). To learn about options for `plugin-bundle-nextjs`, keep reading.

## Options

### `distDir`

> Default value: `".next"`

If you've set a [custom build directory](https://nextjs.org/docs/#setting-a-custom-build-directory) for your Next.js project, update the value here to match.

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@ryaninvents/plugin-bundle-nextjs", {
        "distDir": "build"
      }]
    ]
  }
}
```

### `sources`

Extra content from your top-level project which must be included as-is in your project.

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@ryaninvents/plugin-bundle-nextjs", {
        "sources": ["components/**", "layouts/**"]
      }]
    ]
  }
}
```

### `nextBuildScript`

> Default value: `"build"`

This package assumes you've [configured your package](https://nextjs.org/docs/#setup) so that `npm run build` will run the `"next build"` step. If this is not true, use this option to point to another npm script.

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@ryaninvents/plugin-bundle-nextjs", {
        "nextBuildScript": ["build:nextjs"]
      }]
    ]
  }
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)