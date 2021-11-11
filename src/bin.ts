#!/usr/bin/env node --no-warnings
import browserSync from 'browser-sync';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import automate from './automation.js';
import { deleteJsonFiles, MessageTypes, printMessage } from './util.js';

interface Options {
  averageOf: number;
  changeInterval: number;
  config: string;
  includeMount: boolean;
  page: string;
  port: number;
  watch: boolean | string;
}

const { AUTOMATION_START, AUTOMATION_STOP, ERROR } = MessageTypes;

console.log(`
  █▀█ ▄▀█ █▀█
  █▀▄ █▀█ █▀▀ \x1b[1;32mreact automation profiler\x1b[37m
`);

// config
/***********************/

const options = yargs
  .option('averageOf', {
    describe: 'run each flow n number of times and average out the metrics',
    type: 'number',
  })
  .option('changeInterval', {
    describe: 'number of changes before automation is rerun',
    type: 'number',
  })
  .option('config', {
    alias: 'c',
    describe: 'configuration file',
    type: 'string',
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
  config: configStr,
  includeMount = false,
  page,
  port = 1235,
  watch = false,
} = <Options>options;

// context vars
/***********************/

const cwd = path.resolve();
const scriptPath = fileURLToPath(import.meta.url);
const packagePath = `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}`;
const serverPath = `http://localhost:${port + 1}`;

let config = {};
let changeCount = 0;
let versionCount = 0;
let isServerReady = false;
let timer: NodeJS.Timeout;

// methods
/***********************/

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

    await automate({
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

// run
/***********************/

// delete any previously cached json files created during old automation runs
await deleteJsonFiles(packagePath);

if (configStr) {
  config = await fs.readFile(configStr, 'utf8');
}

try {
  // initialize automation
  await handleAutomation();
} catch {
  // automation failed
  process.exit(1);
}

// initialize browser-sync, which opens the automation charts in the browser.
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
    // if a change occurred in the watched directory...
    if (eventType === 'change' && !filename.startsWith('node_modules')) {
      checkShouldAutomate();
    }
  }
}
