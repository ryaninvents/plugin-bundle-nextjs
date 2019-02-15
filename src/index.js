import gulp from 'gulp';
import gulpZip from 'gulp-zip';
import { promiseFromObjectStream } from './p-stream.js';
import fs from 'fs';
import merge from 'merge-stream';
import Vinyl from 'vinyl';
import execa from 'execa';
import { join } from 'path';

import { MessageError } from '@pika/types';

export async function beforeJob ({ out }) {
  const srcDirectory = join(out, 'dist-node/');
  if (!fs.existsSync(srcDirectory)) {
    throw new MessageError('"dist-node/" does not exist, or was not yet created in the pipeline.');
  }
}

export async function build ({ cwd, out, reporter, manifest, options = {} }) {
  const {
    sources: additionalSources = [],
    bundleName = 'next',
    nextBuildScript = 'build',
    distDir = '.next'
  } = options;

  await execa('npm', ['run', '-s', nextBuildScript], { cwd, env: { NODE_ENV: 'production' } });

  const distNode = join(out, 'dist-node');
  const sources = ['next.config.js', 'pages/**', `${distDir}/**`, ...additionalSources];
  const zipName = `dist-${bundleName}.zip`;

  const sourcesStream = merge(
    gulp.src(sources, {
      cwd,
      base: cwd,
      root: cwd,
      dot: true,
      buffer: true,
      allowEmpty: true
    }),
    gulp.src('**', {
      cwd: distNode,
      base: distNode,
      root: distNode,
      buffer: true
    })
  );

  const pkgJson = new Vinyl({
    cwd: cwd,
    base: cwd,
    path: join(cwd, 'package.json'),
    contents: Buffer.from(JSON.stringify({
      ...manifest,
      main: 'index.js'
    }, null, 2))
  });
  sourcesStream.push(pkgJson);

  await promiseFromObjectStream(
    sourcesStream
      .pipe(gulpZip(zipName))
      .pipe(gulp.dest(out))
  );

  reporter.created(join(out, zipName), `zip:${bundleName}`);
}
