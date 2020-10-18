import fs from 'fs';
import path from 'path';
import puppeteer, { Page } from 'puppeteer';

type StringIndexablePage = Page & {
  [key: string]: (action: string) => void;
};

export default async (url: string, packagePath: string, includeMount: boolean) => {
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
    `${hyphenateString(`${formatLabel(label)}-${new Date().toLocaleString()}`)}.json`;

  const collectLogs = async ({ label, numberOfInteractions = 0 }: {
    label: string;
    numberOfInteractions?: number,
  }) => {
    if (label !== MOUNT || (label === MOUNT && includeMount)) {
      const logs = await page.evaluate(() => window.profiler);
      const fileName = getFileName(label);
  
      await fs.writeFile(
        `${packagePath}/${fileName}`,
        JSON.stringify({ logs, numberOfInteractions }), err => {
          if (err) throw err;
          console.log(`\n\x1b[37mReport written as file: \x1b[36m${fileName}\n`);
        });
    }
    await page.evaluate(() => {
      window.profiler = [];
    });
  };

  const handleActions = async (actions: string[]) => {
    for (let i = 0; i < actions.length; i += 2) await page[actions[i]](actions[i + 1]);
  };

  const runFlows = async () => {
    const cwd = path.resolve();
    const file = await import(`${cwd}/react.automation.js`);
    const { default: flows } = file;
    for (const [flow, actions] of Object.entries(flows)) {
      await handleActions(actions as string[])
        .then(() => collectLogs({
          label: flow,
          numberOfInteractions: (actions as string[]).length / 2,
        }));
    }
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
};
