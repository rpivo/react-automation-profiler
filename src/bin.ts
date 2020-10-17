#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HTML_FILE = 'automation.html';

const cwd = path.resolve();
const scriptPath = fileURLToPath(import.meta.url);

fs.copyFile(
  `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}/${HTML_FILE}`,
  `${cwd}/${HTML_FILE}`,
  (err) => {
    if (err) throw err;
    console.log('copied automation.html to dist');
  });
