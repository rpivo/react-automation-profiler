#!/usr/bin/env node --no-warnings
import browserSync from 'browser-sync';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import runAutomation from './automation.js';
import { MessageTypes, printMessage } from './util.js';

interface Options {
  averageOf: number;
  changeInterval: number;
  includeMount: boolean;
  page: string;
  port: number;
  watch: boolean | string;
}

const { AUTOMATION_START, AUTOMATION_STOP, ERROR } = MessageTypes;

(async function () {
  console.log(`
  █▀█ ▄▀█ █▀█
  █▀▄ █▀█ █▀▀ \x1b[1;32mreact automation profiler\x1b[37m
  `);

  const options = yargs
    .usage(
      `Usage: --averageOf <averageOf> --changeInterval <changeInterval> \
      --includeMount <includeMount> --page <page> --port <port> --watch <watch>`
    )
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
      type: 'boolean' || 'string',
    }).argv;

  const {
    averageOf = 1,
    changeInterval = 1,
    includeMount = false,
    page,
    port = 1235,
    watch = false,
  } = <Options>options;

  const cwd = path.resolve();
  const scriptPath = fileURLToPath(import.meta.url);
  const packagePath = `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}`;
  const serverPath = `http://localhost:${port + 1}`;

  let changeCount = 0;
  let versionCount = 0;
  let isServerReady = false;
  let timer: NodeJS.Timeout;

  function checkShouldAutomate() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      changeCount++;

      if (changeCount >= changeInterval) {
        changeCount = 0;
        await handleAutomation();
        browserSync.reload();
      }
      // will re-automate after 10 seconds to give time for the host project
      // to rebuild after changes
    }, 10000);
  }

  async function deleteJsonFiles() {
    try {
      const files = await fs.readdir(packagePath);
      for (const file of files) {
        if (file.includes('.json'))
          await fs.unlink(path.join(packagePath, file));
      }
    } catch (e) {
      printMessage(ERROR, {
        e: <Error>e,
        log: 'An error occurred while deleting JSON files.',
      });
    }
  }

  function getStopMessage() {
    return `Displaying ${
      versionCount++ ? `${versionCount} versions of ` : ''
    }charts at: \x1b[1;32mhttp://localhost:${port}\x1b[37m`;
  }

  async function handleAutomation() {
    for (
      let automationCount = 1;
      automationCount <= averageOf;
      automationCount++
    ) {
      printMessage(AUTOMATION_START);

      await runAutomation({
        automationCount,
        averageOf,
        cwd,
        includeMount,
        isServerReady,
        packagePath,
        serverPort: port + 1,
        url: page,
      });

      printMessage(AUTOMATION_STOP, { log: getStopMessage() });

      if (!isServerReady && automationCount === averageOf) isServerReady = true;
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

  try {
    await handleAutomation();
  } catch {
    process.exit();
  }

  setupProxy();

  if (watch) {
    const watchDir = typeof watch === 'string' ? `${cwd}/${watch}` : cwd;

    const events = fs.watch(
      watchDir,
      { recursive: true }
      // node types are saying that fs.watch returns AsyncIterable<string>, but
      // it's actually AsyncIterable<{ eventType: string; filename: string }>. 
      // Have to cast as unknown first to get around this.
    ) as unknown as AsyncIterable<{ eventType: string; filename: string }>;

    for await (const { eventType, filename } of events) {
      if (eventType === 'change' && !filename.startsWith('node_modules')) {
        checkShouldAutomate();
      }
    }
  }
})();
