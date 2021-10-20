#!/usr/bin/env node --no-warnings
import fs from 'fs/promises';
import jsdom from 'jsdom';
import { fileURLToPath } from 'url';
import { MessageTypes, printMessage } from './util.js';

(async function () {
  const scriptPath = fileURLToPath(import.meta.url);
  const path = `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}`;
  const { JSDOM } = jsdom;

  try {
    const contents = await fs.readFile(`${path}/index.html`, 'utf8');
    const { document } = new JSDOM(`${contents}`).window;

    const chartScriptContents = await fs.readFile(`${path}/charts.js`, 'utf8');
    const chartScript = document.createElement('script');
    chartScript.id = 'charts';
    chartScript.innerHTML = chartScriptContents;
    chartScript.type = 'module';

    document.body.appendChild(chartScript);

    await fs.writeFile(
      `${path}/index.html`,
      document.documentElement.outerHTML
    );
  } catch (e) {
    printMessage(MessageTypes.ERROR, {
      e: <Error>e,
      log: 'An error occurred while appending charts.js to index.html.',
    });
  }
})();
