#!/usr/bin/env node
import { exec } from 'child_process';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import runAutomation from './automation.js';

(async () => {
  const options = yargs
    .usage('Usage: --page <page> --port <port>')
    .option('page', {
      describe: 'page to be tested',
      type: 'string',
      demandOption: true,
    })
    .option('port', {
      describe: 'port to be used for server',
      type: 'number',
    })
    .argv;

  const {
    page,
    port = 1235,
  } = options;

  const scriptPath = fileURLToPath(import.meta.url);
  const packagePath = `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}`;
  const url = `http://localhost:${port}`;

  const deleteJsonFiles = async () => {
    await fs.readdir(scriptPath, (err, files) => {
      if (err) throw err;
      for (const file of files) {
        console.log({ file });
        // fs.unlink(path.join(scriptPath, file), err => {
        //   if (err) throw err;
        // });
      }
    });
  };

  const openPage = () => {
    const startCommand = () => {
      switch (process.platform) {
        case 'darwin':
          return 'open';
        case 'win32':
          return 'start';
        default:
          return 'xdg-open';
      }
    };

    exec(`${startCommand()} ${url}`);
  };

  const startServer = async () => {
    const app = express();
    app.get('/', (_, res) => res.sendFile(`${packagePath}/index.html`));
    app.listen(port, () => console.log(`automation charts displaying at ${url}`));
  };

  await deleteJsonFiles
  await runAutomation(page, packagePath);
  await startServer();
  await openPage();
})();
