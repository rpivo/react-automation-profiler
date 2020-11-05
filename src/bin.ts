#!/usr/bin/env node --no-warnings
import browserSync from 'browser-sync';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import runAutomation from './automation.js';
import { MessageTypes, printMessage } from './util.js';

const { AUTOMATION_START, AUTOMATION_STOP, ERROR } = MessageTypes;

(async function() {
  console.log(`
  █▀█ ▄▀█ █▀█
  █▀▄ █▀█ █▀▀ \x1b[1;32mreact automation profiler\x1b[37m
  `);

  const options = yargs
    .usage(`Usage: --averageOf <averageOf> --changeInterval <changeInterval> \
      --includeMount <includeMount> --page <page> --port <port> --watch <watch>`)
    .option('averageOf', {
      describe: 'run each flow n number of times and average out the metrics',
      type: 'number',
    })
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
    averageOf = 1,
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
  let isProxyReady = false;
  let isServerReady = false;

  const automationOptions = {
    averageOf,
    cwd,
    includeMount,
    packagePath,
    serverPort: port + 1,
    serverPath,
    url: page,
  };

  async function deleteJsonFiles() {
    try {
      const files = await fs.readdir(packagePath);
      for (const file of files) {
        if (file.includes('.json')) await fs.unlink(path.join(packagePath, file));
      }
    } catch(e) {
      printMessage(ERROR, { e, log: 'An error occurred while deleting JSON files.' });
    }
  }

  function getStopMessage() {
   return `Displaying ${
     versionCount++ ? `${versionCount} versions of `: ''
    }charts at: \x1b[1;32mhttp://localhost:${port}\x1b[37m`;
  }

  async function handleAutomation() {
    for (let automationCount = 1; automationCount <= averageOf; automationCount++) {
      if (!isServerReady && automationCount > 1) isServerReady = true;
      await runAutomation(automationOptions, isServerReady, automationCount);
    }
  }

  function setupProxy() {
    browserSync.init({
      browser: 'google chrome',
      logLevel: 'silent',
      notify: false,
      open: true,
      port,
      proxy: serverPath,
      reloadOnRestart: true,
    });
  }

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
        printMessage(AUTOMATION_START);

        try {
          await handleAutomation();
        } catch {
          process.exit();
        }

        changeCount = 0;

        if (!isProxyReady) {
          setupProxy();
          isProxyReady = true;
        } else {
          browserSync.reload();
        }

        printMessage(AUTOMATION_STOP, { log: getStopMessage() });
      };
    });
    nodemon.on('quit', () => process.exit());
  } else {
    printMessage(AUTOMATION_START);

    try {
      await handleAutomation();
    } catch {
      process.exit();
    }

    setupProxy();
    printMessage(AUTOMATION_STOP, { log: getStopMessage() });

    browserSync.emitter.on('client:connected', () => process.exit());
  }
})();
