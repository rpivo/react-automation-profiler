#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';

const options = yargs
  .usage('Usage: -d <depth> -e <endpoints>')
  .option('o', {
    alias: 'output',
    describe: 'destination folder for the generated charts',
    type: 'string',
  })
  .argv;

const {
  output = 'automation',
} = options;

const HTML_FILE = 'automation.html';

const cwd = path.resolve();
const scriptPath = fileURLToPath(import.meta.url);

if (!fs.existsSync(`./${output}`)) fs.mkdirSync(`./${output}`);

fs.copyFile(
  `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}/${HTML_FILE}`,
  `${cwd}/${output}/${HTML_FILE}`,
  (err) => {
    if (err) throw err;
    console.log('copied automation.html to dist');
  });
