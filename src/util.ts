export enum MessageTypes {
  AUTOMATION_START = 'AUTOMATION_START',
  AUTOMATION_STOP = 'AUTOMATION_STOP',
  ERROR = 'ERROR',
  NOTICE = 'NOTICE',
}

function formatLabel(label: string) {
  return label
  .toLowerCase()
  .split(' ')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');
}

export function getFileName(label?: string, extension: string = 'json') {
  return `${hyphenateString(`${label ? formatLabel(label) : ''}${extension === 'json' ? `-${
    Date.now()}` : ''}-${new Date().toLocaleString()}`)}.${extension}`;
}

function hyphenateString(str: string) {
  return str
    .replace(/(\/|\s|:|\.)/g, '-')
    .replace(',', '')
    .replace(/-{2,}/g, '-')
    .replace(/-$/, '');
}

export function printMessage(messageType: string, params?: {
  e?: Error;
  errorMessage?: string;
  log?: string;
}) {
  let message: string = '';

  switch(messageType) {
    case MessageTypes.AUTOMATION_START: {
      message = '\n🛠  preparing automation...\n';
      break;
    }
    case MessageTypes.AUTOMATION_STOP: {
      const { log } = params!;
      message = `📡  ${log}\n`;
      break;
    }
    case MessageTypes.ERROR: {
      const { e, errorMessage } = params!;
      message = `❌ ${errorMessage}: ${ JSON.stringify(e) }`;
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
