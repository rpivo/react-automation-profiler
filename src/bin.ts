#!/usr/bin/env node
import { exec } from 'child_process';
import express from 'express';
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
    const app = express();

    app.get('/', (req, res) => {
      res.send('Hello World!')
    })

    app.listen(port, () => {
      console.log(`Example app listening at ${url}`);
    })
  };

  await startServer().then(openPage);
})();
