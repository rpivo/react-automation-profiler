import express from 'express';
import fs from 'fs';
import jsdom from 'jsdom';
import puppeteer, { Page } from 'puppeteer';
import { getFileName } from './util.js';

type StringIndexablePage = Page & {
  [key: string]: (action: string) => void;
};

export default async ({
  averageOf,
  cwd,
  includeMount,
  packagePath,
  serverPort,
  url,
}: AutomationProps,
isServerReady: boolean,
automationCount: number,
) => {
  const MOUNT = 'Mount';

  const browser = await puppeteer.launch();
  const page = await browser.newPage() as StringIndexablePage;

  const appendJsonToHTML = async () => {
    const { JSDOM } = jsdom;
    const contents = await fs.readFileSync(`${packagePath}/index.html`, 'utf8');
    const { document } = new JSDOM(`${contents}`).window;

    document.querySelectorAll('.json')?.forEach(item => item.remove());

    const files = fs.readdirSync(packagePath);
    for (const file of files) {
      if (file.includes('.json')) {
        const jsonContents = await fs.readFileSync(`${packagePath}/${file}`, 'utf8');
        const jsonScript = document.createElement('script');

        const idArr = file.split('-');
        const id = `${idArr[1]}-${idArr[idArr.length - 1].split('.')[0]}`;
        jsonScript.id = averageOf > 1 ? `average-${id}` : id;
        jsonScript.classList.add('json');
        jsonScript.type ='application/json';

        jsonScript.innerHTML = jsonContents;
        document.body.appendChild(jsonScript);
      }
    }

    await fs.writeFile(
      `${packagePath}/index.html`,
      document.documentElement.outerHTML,
      async err => {
        if (err) throw err;
        await generateExport(document);
      }
    );
  };

  const calculateAverage = async () => {
    await fs.readdir(packagePath, async (err, files) => {
      if (err) throw err;

      const flows = new Set(
        files
          .filter(file => file.includes('.json'))
          .map(file => file.split('-')[0])
          .filter(name => name !== 'average')
      );

      for (const [i, flow] of [...flows].entries()) {
        const flowFiles =
          files.filter(file => !file.includes('average-') && file.includes(`${flow}-`));
        let sumNumberOfInteractions = 0;
        const sumLogs: {
          actualDuration: number;
          baseDuration: number;
          commitTime: number;
          id: string;
          interactions: {};
          phase: string;
          startTime: number;
        }[] = [];

        for (const file of flowFiles) {
          const contents = await JSON.parse(fs.readFileSync(`${packagePath}/${file}`, 'utf8'));
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

          await fs.unlink(`${packagePath}/${file}`, err => {
            if (err) throw err;
          });
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
          async err => {
            if (err) throw err;
            if (averageOf === automationCount && i === flows.size - 1) await appendJsonToHTML();
          }
        );
      }
    });
  };

  const collectLogs = async ({ label, numberOfInteractions = 0 }: {
    label: string;
    numberOfInteractions?: number,
  }) => {
    if (label !== MOUNT || (label === MOUNT && includeMount)) {
      const logs = await page.evaluate(() => window.profiler);
      const fileName = getFileName(label);

      if (logs.length === 0) return false;
  
      await fs.writeFile(
        `${packagePath}/${fileName}`,
        JSON.stringify({ logs, numberOfInteractions }), err => {
          if (err) throw err;
        },
      );
    }
    await page.evaluate(() => {
      window.profiler = [];
    });
    return true;
  };

  const generateExport = async (document: Document) => {
    document.querySelector('#export')?.remove();
    await fs.writeFile(
      `${packagePath}/export.html`,
      document.documentElement.outerHTML,
      async err => {
        if (err) throw err;
      }
    );
  };

  const handleActions = async (actions: string[]) => {
    for (let i = 0; i < actions.length; i += 2) await page[actions[i]](actions[i + 1]);
  };

  const runFlows = async () => {
    const file = await import(`${cwd}/react.automation.js`);
    const { default: flows } = file;
    const keys = Object.keys(flows);

    for (let i = 0; i < keys.length; i++) {
      await handleActions(flows[keys[i]]);
      const success = await collectLogs({
        label: keys[i],
        numberOfInteractions: flows[keys[i]].length / 2,
      });
      if (!success) i -= 1;
    }
  };

  const startServer = async () => {
    const app = express();
    app.use(express.static(packagePath));
    app.get('/', (_, res) => res.sendFile(`${packagePath}/index.html`));
    app.listen(serverPort);
  };

  await page.goto(url);
  await page.setViewport({
    deviceScaleFactor: 1,
    height: 1080,
    width: 1920,
  });
  await collectLogs({ label: MOUNT });
  await runFlows();
  await browser.close();

  if (averageOf === automationCount) await calculateAverage();
  if (averageOf === 1) await appendJsonToHTML();

  if (!isServerReady) await startServer();
};
