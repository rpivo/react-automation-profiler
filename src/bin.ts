#!/usr/bin/env node
import { exec } from 'child_process';
import express from 'express';
import { fileURLToPath } from 'url';
import yargs from 'yargs';

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

  const url = `http://localhost:${port}`;

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

    console.log('page to be tested: ', page);

    exec(`${startCommand()} ${url}`);
  };

  const startServer = async () => {
    const app = express();
    const scriptPath = fileURLToPath(import.meta.url);

    app.get('/', (_, res) => {
      res.sendFile(`${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}/index.html`);
    });

    app.listen(port, () => {
      console.log(`Example app listening at ${url}`);
    })
  };

  await startServer().then(openPage);
})();
