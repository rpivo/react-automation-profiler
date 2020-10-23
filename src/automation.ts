import express from 'express';
import fs from 'fs';
import puppeteer, { Page } from 'puppeteer';

type StringIndexablePage = Page & {
  [key: string]: (action: string) => void;
};

export default async ({
  cwd,
  includeMount,
  packagePath,
  serverPort,
  url,
}: AutomationProps, isServerReady: boolean) => {
  const MOUNT = 'Mount';

  const browser = await puppeteer.launch();
  const page = await browser.newPage() as StringIndexablePage;

  const formatLabel = (label: string) => label
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const hyphenateString = (str: string) => str
    .replace(/(\/|\s|:|\.)/g, '-')
    .replace(',', '')
    .replace(/-{2,}/g, '-')
    .replace(/-$/, '');

  const getFileName = (label: string) =>
    `${hyphenateString(
      `${formatLabel(label)}-${new Date().toLocaleString()}-${Date.now()}`
    )}.json`;

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

  const createJsonList = async () => {
    const jsonList: string[] = [];
    const jsonListPath = `${packagePath}/jsonList.dsv`;

    if (fs.existsSync(jsonListPath)) await fs.unlink(jsonListPath, err => {
      if (err) throw err;
    });

    await fs.readdir(packagePath, async (err, files) => {
      if (err) throw err;
      for (const file of files) {
        if (file.includes('.json')) jsonList.push(file);
      }
      await fs.writeFile(jsonListPath, jsonList.join(' '),  err => {
        if (err) throw err;
      });
    });
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
  await createJsonList();
  if (!isServerReady) await startServer();
};
