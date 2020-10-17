#!/usr/bin/env node
import { exec } from 'child_process';

exec('sh copyFiles.sh',
  (error, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  });
