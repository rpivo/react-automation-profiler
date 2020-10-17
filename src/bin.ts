#!/usr/bin/env node
import { exec } from 'child_process';
import express from 'express';
import { fileURLToPath } from 'url';
import yargs from 'yargs';

(async () => {
  const options = yargs
    .usage('Usage: -p <port>')
    .option('p', {
      alias: 'port',
      describe: 'port to be used for server',
      type: 'number',
    })
    .argv;

  const {
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

    exec(`${startCommand()} ${url}`);
  };

  const startServer = async () => {
    const HTML_FILE = 'index.html';
    
    const app = express();
    const scriptPath = fileURLToPath(import.meta.url);

    app.get('/', (_, res) => {
      res.sendFile(`${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}/${HTML_FILE}`);
    });

    app.listen(port, () => {
      console.log(`Example app listening at ${url}`);
    })
  };

  await startServer().then(openPage);
})();
