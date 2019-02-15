import fs from 'fs-extra';
import { join, resolve } from 'path';
import { dir as createTempDir, file as createTempFile } from 'temporarily';
import del from 'del';
import execa from 'execa';
import archive from 'ls-archive';
import { name as thisPackageName } from '../../package.json';

const DEFAULT_PKG_JSON = {
  name: 'test-pkg',
  private: true,
  version: '0.0.0-develop',
  scripts: {
    package: 'pack build',
    build: 'next build'
  },
  '@pika/pack': {
    'pipeline': [
      [
        '@pika/plugin-standard-pkg'
      ],
      [
        '@pika/plugin-build-node',
        {
          'minNodeVersion': '8'
        }
      ],
      [
        thisPackageName
      ]
    ]
  },
  'devDependencies': {
    '@pika/pack': '^0.3.1',
    '@pika/plugin-build-node': '^0.3.10',
    '@pika/plugin-standard-pkg': '^0.3.10',
    [thisPackageName]: resolve(__dirname, '../../pkg')
  }
};

describe('@ryaninvents/plugin-bundle-dependencies', () => {
  let createdDirs = [];

  async function initRepo ({ packageJson: pkg = DEFAULT_PKG_JSON, packageManager = 'npm', stdio, sources = [] } = {}) {
    const { filepath: workingDir } = createTempDir(
      { name: 'test-repo-{wwwwdddd}' },
      [createTempDir({ name: 'src' }, [
        createTempFile({ name: 'index.js', data: 'console.log("Hello world");' })
      ]), ...sources]
    );
    let packageJson = pkg;
    if (typeof packageJson === 'function') {
      packageJson = packageJson(workingDir);
    }
    await fs.writeFile(join(workingDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    await execa('npm', ['install'], {
      cwd: workingDir,
      env: { NODE_ENV: 'development' }
    });
    createdDirs.push(workingDir);
    return { workingDir };
  }

  afterEach(async () => {
    await del(createdDirs, { force: true });
    createdDirs = [];
  });

  it('should create a zip file with correct structure', async () => {
    const { workingDir } = await initRepo({
      packageJson: {
        ...DEFAULT_PKG_JSON,
        dependencies: {
          'next': 'latest',
          'react': 'latest',
          'react-dom': 'latest'
        }
      },
      stdio: 'inherit',
      sources: [
        createTempDir({ name: 'pages' }, [
          createTempFile({ name: 'index.js', data: `import React from 'react';
          export default () => <div>Welcome to next.js!</div>;
` })
        ])
      ]
    });
    await execa('npm', ['run', 'package'], {
      env: { NODE_ENV: 'production' },
      cwd: workingDir
    });
    expect(async () => fs.access(`${workingDir}/pkg/package.json`, fs.constants.F_OK))
      .not.toThrow();
    expect(async () => fs.access(`${workingDir}/pkg/dist-next.zip`, fs.constants.F_OK))
      .not.toThrow();
    const archiveEntries = await new Promise((resolve, reject) => {
      archive.list(`${workingDir}/pkg/dist-next.zip`, (err, results) => {
        if (err) return reject(err);
        return resolve(
          results.map(file => file.getPath())
            .filter((path) => path.split('/').length <= 2)
            .sort()
        );
      });
    });
    expect(archiveEntries).toMatchSnapshot();
  }, 60e3);
});
