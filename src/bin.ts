#!/usr/bin/env node
import { exec } from 'child_process';

const url = 'http://localhost';

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
