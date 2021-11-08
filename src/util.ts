import fs from 'fs';
import path from 'path';

enum MessageTypes {
  AUTOMATION_START = 'AUTOMATION_START',
  AUTOMATION_STOP = 'AUTOMATION_STOP',
  ERROR = 'ERROR',
  NOTICE = 'NOTICE',
}

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

function formatLabel(label: string) {
  return label
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function getFileName(label?: string, extension: string = 'json') {
  return `${hyphenateString(
    `${label ? formatLabel(label) : ''}${
      extension === 'json' ? `-${Date.now()}` : ''
    }-${new Date().toLocaleString()}`
  )}.${extension}`;
}

function hyphenateString(str: string) {
  return str
    .replace(/(\/|\s|:|\.)/g, '-')
    .replace(',', '')
    .replace(/-{2,}/g, '-')
    .replace(/-$/, '');
}

function printMessage(
  messageType: string,
  params?: {
    e?: Error;
    log?: string;
  }
) {
  let message: string = '';

  switch (messageType) {
    case MessageTypes.AUTOMATION_START: {
      message = '\n🛠  preparing automation...\n';
      break;
    }
    case MessageTypes.AUTOMATION_STOP: {
      const { log } = params!;
      message = `📡 ${log}\n`;
      break;
    }
    case MessageTypes.ERROR: {
      const { e = null, log } = params!;
      message = `❌ ${log}${e ? `: ${JSON.stringify(e)}` : ''}\n`;
      break;
    }
    case MessageTypes.NOTICE: {
      const { log } = params!;
      message = `🚫 ${log}`;
      break;
    }
  }

  console.log(message);
}

export { deleteJsonFiles, getFileName, MessageTypes, printMessage };
