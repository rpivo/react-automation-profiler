import express from 'express';
import fs from 'fs/promises';
import { minify } from 'html-minifier-terser';
import jsdom from 'jsdom';
import yaml from 'js-yaml';
import puppeteer, { Page } from 'puppeteer';
import { getFileName, MessageTypes, printMessage } from './util.js';

type Flows = {
  [key: string]: string[];
};

type StringIndexablePage = Page & {
  [key: string]: (action: string) => void;
};

enum Actions {
  click = 'click',
  focus = 'focus',
  hover = 'hover',
}

const { ERROR, NOTICE } = MessageTypes;

export default async function({
  averageOf,
  cwd,
  includeMount,
  packagePath,
  serverPort,
  url,
}: AutomationProps,
isServerReady: boolean,
automationCount: number,
) {
  const MOUNT = 'Mount';

  const browser = await puppeteer.launch();
  const page = await browser.newPage() as StringIndexablePage;

  let errorMessage: string = '';

  async function appendJsonToHTML() {
    const { JSDOM } = jsdom;
    try {
      const contents = await fs.readFile(`${packagePath}/index.html`, 'utf8');
      const { document } = new JSDOM(`${contents}`).window;
      document.querySelectorAll('.json')?.forEach(item => item.remove());

      const files = await fs.readdir(packagePath);
      for (const file of files) {
        if (file.includes('.json')) {
          const jsonContents = await fs.readFile(`${packagePath}/${file}`, 'utf8');
          const jsonScript = document.createElement('script');
  
          const idArr = file.split('-');
          jsonScript.id = averageOf > 1 ? `${idArr[1]}-${idArr[2]}` : `${idArr[0]}-${idArr[1]}`;
          jsonScript.classList.add('json');
          jsonScript.type ='application/json';
  
          jsonScript.innerHTML = jsonContents;
          document.body.appendChild(jsonScript);
        }
      }

      await fs.writeFile(`${packagePath}/index.html`, document.documentElement.outerHTML);
      await generateExport(document);
    } catch(e) {
      errorMessage = 'Could not append JSON data to HTML file.';
      printMessage(ERROR, { e, log: errorMessage });
    }
  }

  async function calculateAverage() {
    try {
      const files = await fs.readdir(packagePath);

      const flows = new Set(
        files
          .filter(file => file.includes('.json'))
          .map(file => file.split('-')[0])
          .filter(name => name !== 'average')
      );

      for (const [i, flow] of [...flows].entries()) {
        const flowFiles = files.filter(
          file => !file.includes('average-') && file.includes(`${flow}-`)
        );

        const sumLogs: {
          actualDuration: number;
          baseDuration: number;
          commitTime: number;
          id: string;
          interactions: {};
          phase: string;
          startTime: number;
        }[] = [];

        let sumNumberOfInteractions = 0;

        for (const file of flowFiles) {
          const contents = JSON.parse(await fs.readFile(`${packagePath}/${file}`, 'utf8'));
          const { logs } = contents;

          for (const [index, log] of logs.entries()) {
            if (typeof sumLogs[index] !== 'object' || sumLogs[index] === null) sumLogs[index] = {
              actualDuration: 0,
              baseDuration: 0,
              commitTime: 0,
              id: '',
              interactions: {},
              phase: '',
              startTime: 0,
            };

            sumLogs[index].actualDuration += log.actualDuration;
            sumLogs[index].baseDuration += log.baseDuration;
            sumLogs[index].commitTime += log.commitTime;
            sumLogs[index].startTime += log.startTime;
            if (!sumLogs[index].id) sumLogs[index].id = log.id;
            if (!sumLogs[index].phase) sumLogs[index].phase = log.phase;
          }

          sumNumberOfInteractions += contents.numberOfInteractions;

          await fs.unlink(`${packagePath}/${file}`);
        }

        const averagedData = {
          logs: sumLogs.map(log => ({
            actualDuration: log.actualDuration / averageOf,
            baseDuration: log.baseDuration / averageOf,
            commitTime: log.commitTime / averageOf,
            id: log.id,
            interactions: log.interactions,
            phase: log.phase,
            startTime: log.startTime / averageOf,
          })),
          numberOfInteractions: sumNumberOfInteractions / averageOf,
        };
        await fs.writeFile(
          `${packagePath}/average-${flow}${getFileName()}`,
          JSON.stringify(averagedData),
        );
        
        if (averageOf === automationCount && i === flows.size - 1) await appendJsonToHTML();
      }
    } catch(e) {
      errorMessage = 'An error occurred while calculating averages.';
      printMessage(ERROR, { e, log: errorMessage });
    }
  }

  async function collectLogs({ label, numberOfInteractions = 0 }: {
    label: string;
    numberOfInteractions?: number,
  }) {
    if (label !== MOUNT || (label === MOUNT && includeMount)) {
      const logs = await page.evaluate(() => window.profiler);
      const fileName = getFileName(label);
      if (logs.length === 0) return false;

      try {
        await fs.writeFile(
          `${packagePath}/${fileName}`,
          JSON.stringify({ logs, numberOfInteractions }),
        );
      } catch(e) {
        errorMessage = 'An error occurred while collecting automation log data.';
        printMessage(ERROR, { e, log: errorMessage });
      }
    }
    await page.evaluate(() => {
      window.profiler = [];
    });
    return true;
  }

  async function generateExport(document: Document) {
    document.querySelector('#export')?.remove();
    try {
      await fs.writeFile(
        `${packagePath}/export.html`,
        minify(document.documentElement.outerHTML, {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
          removeAttributeQuotes: true,
        }),
      );
    } catch(e) {
      errorMessage = 'An error occurred while generating a new export file.';
      printMessage(ERROR, { e, log: errorMessage });
    }
  }

  async function handleActions(actions: string[]) {
    for (const action of actions) {
      const [actionType, ...selector] = action.split(' ');
      if (actionType in Actions) await page[actionType](selector.join(' '));
      else {
        errorMessage = 'One or more action types provided was not valid.';
        throw printMessage(ERROR, { log: errorMessage });
      }
    }
  }

  async function readAutomationFile() {
    let flows;
    try {
      flows = yaml.safeLoad(await fs.readFile(`${cwd}/react.automation.yml`, 'utf8')) as Flows;
      return flows;
    } catch {
      flows = yaml.safeLoad(await fs.readFile(`${cwd}/react.automation.yaml`, 'utf8')) as Flows;
      return flows;
    }
  }

  async function runFlows() {
    try {
      const flows = await readAutomationFile();
      if (flows) {
        const keys = Object.keys(flows);
        let attempts = 0;
        for (let i = 0; i < keys.length; i++) {
          await handleActions(flows[keys[i]]);
          const success = await collectLogs({
            label: keys[i],
            numberOfInteractions: flows[keys[i]].length,
          });
          if (!success) {
            if (attempts++ < 3) i -= 1;
            else printMessage(NOTICE, {
              log: `Automation flow "${keys[i]}" did not produce any renders.\n`,
            });
          }
        }
      }
    } catch(e) {
      const isErrorObjectEmpty = Object.keys(e).length === 0;
      const description = isErrorObjectEmpty &&
        ` This was likely caused by one of these issues:
        - The react.automation YAML file could not be found at the root of your repo.
        - The react.automation file is using a selector that does not exist.`;
      errorMessage = `An error occurred while trying to run automation flows.${
        description ? description : ''
      }`;
      printMessage(ERROR, {
        e: isErrorObjectEmpty ? null : e,
        log: errorMessage,
      });
    }
  }

  async function startServer() {
    const app = express();
    app.use(express.static(packagePath));
    app.get('/', (_, res) => res.sendFile(`${packagePath}/index.html`));
    app.listen(serverPort);
  }

  await page.goto(url);
  await page.setViewport({
    deviceScaleFactor: 1,
    height: 1080,
    width: 1920,
  });
  await collectLogs({ label: MOUNT });
  await runFlows();
  await browser.close();

  if (averageOf > 1 && automationCount === averageOf) await calculateAverage();
  else if (averageOf === 1) await appendJsonToHTML();

  if (!isServerReady && automationCount === averageOf) await startServer();

  if (errorMessage) throw printMessage(ERROR, {
    log: 'Automation could not complete because of the above errors.',
  });
}
