import automate, { Output, OutputType } from '../automation.js';
import { Options } from '../bin.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { deleteJsonFiles } from '../file.util.js';

type APIOptions = Omit<
  Options,
  'headless' | 'output' | 'watch' | 'changeInterval' | 'port'
>;

export class Automation {
  static async run({
    averageOf = 1,
    includeMount = false,
    page,
  }: APIOptions): Promise<Output> {
    let results: Output = {};
    const scriptPath = fileURLToPath(import.meta.url);
    const packagePath = `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}`;

    await deleteJsonFiles(packagePath);

    for (
      let automationCount = 1;
      automationCount <= averageOf;
      automationCount++
    ) {
      const automationResult = await automate({
        automationCount,
        averageOf,
        cwd: path.resolve(),
        includeMount,
        isServerReady: false,
        packagePath,
        serverPort: 0,
        url: page,
        headless: true,
        output: OutputType.JSON,
      });
      if (automationResult) {
        results = automationResult;
      }
    }

    return results;
  }
}
