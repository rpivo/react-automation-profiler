import fs from 'fs';
import path from 'path';
import { MessageTypes, printMessage } from './util.js';

async function deleteJsonFiles(packagePath: string) {
  try {
    const files = await fs.readdirSync(packagePath);
    for (const file of files) {
      if (file.includes('.json')) {
        fs.unlinkSync(path.join(packagePath, file));
      }
    }
  } catch (e) {
    printMessage(MessageTypes.ERROR, {
      e: <Error>e,
      log: 'An error occurred while deleting JSON files.',
    });
  }
}

export { deleteJsonFiles };
