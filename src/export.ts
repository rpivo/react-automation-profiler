#!/usr/bin/env node --no-warnings
import fs from 'fs';
import jsdom from 'jsdom';

import { fileURLToPath } from 'url';

(async () => {
  const generateExportableHTML = async () => {
    const scriptPath = fileURLToPath(import.meta.url);
    const path = `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}`;
    const { JSDOM } = jsdom;
    const contents = await fs.readFileSync(`${path}/index.html`, 'utf8');
    const { document } = new JSDOM(`${contents}`).window;
    
    const chartScriptContents = await fs.readFileSync(`${path}/charts.js`, 'utf8');
    document.querySelector('#charts')?.remove();
    const chartScript = document.createElement('script');
    chartScript.id = 'charts';
    chartScript.innerHTML = chartScriptContents;
    chartScript.type = 'module';

    document.body.appendChild(chartScript);

    await fs.writeFile(`${path}/export.html`, document.documentElement.outerHTML,  err => {
      if (err) throw err;
    });
  };
  await generateExportableHTML();
})();
