#!/usr/bin/env node
const { exec } = require('child_process');

const copyFiles = exec('sh copyFiles.sh',
  (error: Error, stdout: string, stderr: string) => {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  });

  copyFiles();
