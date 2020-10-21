#!/usr/bin/env node --no-warnings
import browserSync from 'browser-sync';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import runAutomation from './automation.js';

(async () => {
  console.log(`
  █▀█ ▄▀█ █▀█
  █▀▄ █▀█ █▀▀ \x1b[1;32mreact automation profiler\x1b[37m
  `);

  const options = yargs
    .usage(`Usage: --changeInterval <changeInterval> --includeMount <includeMount> --page <page> \
      --port <port> --watch <watch>`)
    .option('changeInterval', {
      describe: 'number of changes before automation is rerun',
      type: 'number',
    })
    .option('includeMount', {
      describe: 'includes the initial mount render',
      type: 'boolean',
    })
    .option('page', {
      describe: 'page to be tested',
      type: 'string',
      demandOption: true,
    })
    .option('port', {
      describe: 'port to be used for server',
      type: 'number',
    })
    .option('watch', {
      describe: 'generate charts on every new build',
      type: 'string',
    })
    .argv;

  const {
    changeInterval = 1,
    includeMount = false,
    page,
    port = 1235,
    watch = '',
  } = options;

  const cwd = path.resolve();
  const scriptPath = fileURLToPath(import.meta.url);
  const packagePath = `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}`;
  const serverPath = `http://localhost:${port + 1}`;

  let changeCount = 0;
  let versionCount = 0;
  let isServerReady = false;

  const automationOptions = {
    cwd,
    includeMount,
    packagePath,
    serverPort: port + 1,
    serverPath,
    url: page,
  };

  const deleteJsonFiles = async () => {
    await fs.readdir(packagePath, (err, files) => {
      if (err) throw err;
      for (const file of files) {
        if (file.includes('.json')) fs.unlink(path.join(packagePath, file), err => {
          if (err) throw err;
        });
      }
    });
  };

  const setupProxy = () => browserSync.init({
    browser: 'google chrome',
    logLevel: 'silent',
    notify: false,
    open: true,
    port,
    proxy: serverPath,
    reloadOnRestart: true,
  });

  await deleteJsonFiles();

  if (watch) {
    const nodemon = spawn('npx', [
      'nodemon',
      '--delay', '10000ms',
      '--ext', 'js,ts,jsx,tsx',
      '--on-change-only',
      '--quiet',
      '--watch', `${cwd}/${watch}`,
      `${packagePath}/watch.js`,
    ],  { stdio: ['pipe', 'pipe', 'pipe', 'ipc'], });

    nodemon.on('message', async (event: Event) => {
      if (event.type === 'exit' && (++changeCount === changeInterval || !isServerReady)) {
        console.log('\n🛠  preparing automation...\n');

        await runAutomation(automationOptions, isServerReady);
        changeCount = 0;

        if (!isServerReady) {
          setupProxy();
          isServerReady = true;
        } else {
          browserSync.reload();
        }

        console.log(`📡  displaying ${
            versionCount++ ? `${versionCount} versions of `: ''
          }charts at: \x1b[1;32mhttp://localhost:${port}\x1b[37m
        `);
      };
    });
    nodemon.on('quit', () => process.exit());
  } else {
    await runAutomation(automationOptions, isServerReady);
  }
})();
