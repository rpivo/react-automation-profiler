import automate, { OutputType } from '../automation/automation.js';
import { Options } from '../bin.js';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AutomationResultsStorage,
  IResults,
} from '../automation/AutomationResultsStorage.js';

type APIOptions = Omit<
  Options,
  'headless' | 'output' | 'watch' | 'changeInterval' | 'port'
>;

export class Automation {
  static async run({
    averageOf = 1,
    includeMount = false,
    page,
  }: APIOptions): Promise<IResults> {
    let results: IResults = {};
    const scriptPath = fileURLToPath(import.meta.url);
    const packagePath = `${scriptPath.slice(0, scriptPath.lastIndexOf('/'))}`;
    const resultsStorage = new AutomationResultsStorage();

    for (
      let automationCount = 1;
      automationCount <= averageOf;
      automationCount++
    ) {
      const props = {
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
      };

      const automationResult = await automate(props, resultsStorage);

      if (automationResult) {
        results = automationResult;
      }
    }

    return results;
  }
}
