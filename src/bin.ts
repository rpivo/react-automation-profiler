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
    .argv;

  const {
    includeMount = false,
    page,
    port = 1235,
  } = options;

  console.log('includeMount: ', includeMount);

  const scriptPath = fileURLToPath(import.meta.url);
  const packagePath = `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}`;
  const url = `http://localhost:${port}`;


  const createJsonList = async () => {
    const jsonList: string[] = [];
    await fs.readdir(packagePath, async (err, files) => {
      if (err) throw err;
      for (const file of files) {
        if (file.includes('.json')) jsonList.push(file);
      }
      await fs.writeFile(`${packagePath}/jsonList.dsv`, jsonList.join(' '),  err => {
        if (err) throw err;
      });
    });
  };

  const deleteJsonFiles = async () => {
    await fs.readdir(packagePath, (err, files) => {
      if (err) throw err;
      for (const file of files) {
        if (file.includes('.json') || file.includes('.dsv'))
          fs.unlink(path.join(packagePath, file), err => {
            if (err) throw err;
          });
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
    app.use(express.static(packagePath));
    app.get('/', (_, res) => res.sendFile(`${packagePath}/index.html`));
    app.listen(port, () => console.log(`automation charts displaying at ${url}`));
  };

  await deleteJsonFiles();
  await runAutomation(page, packagePath);
  await createJsonList();
  await startServer();
  await openPage();
})();
