#!/usr/bin/env node
import browserSync from 'browser-sync';
import fs from 'fs';
import nodemon from 'nodemon';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import runAutomation from './automation.js';

(async () => {
  const options = yargs
    .usage('Usage: --includeMount <includeMount> --page <page> --port <port> --watch <watch>')
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
    includeMount = false,
    page,
    port = 1235,
    watch = '',
  } = options;

  const cwd = path.resolve();
  const scriptPath = fileURLToPath(import.meta.url);
  const packagePath = `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}`;
  const serverPath = `http://localhost:${port}`;

  let isProxyReady = false;

  const automationOptions = {
    cwd,
    includeMount,
    packagePath,
    port: port,
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
    port: port + 1,
    proxy: serverPath,
    reloadOnRestart: true,
  });

  await deleteJsonFiles();

  if (watch) {
    const optionsArray = [];

    for (const [key, value] of Object.entries(automationOptions))
      optionsArray.push(`${key}=${value}`);

    await nodemon({
      args: optionsArray,
      delay: 10000,
      ext: 'js,jsx,ts,tsx',
      script: `${packagePath}/watch.js`,
      watch: [`${cwd}/${watch}`],
    });

    nodemon.on('exit', () => setTimeout(() => browserSync.reload(), 1000));
    nodemon.on('start', () => setTimeout(() => {
      if (!isProxyReady) {
        setupProxy();
        isProxyReady = true;
      }
    }, 1000));
    nodemon.on('quit', () => process.exit());
  } else {
    await runAutomation(automationOptions);
  }
})();
