function formatLabel(label: string) {
  return label
  .toLowerCase()
  .split(' ')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');
}

function hyphenateString(str: string) {
  return str
    .replace(/(\/|\s|:|\.)/g, '-')
    .replace(',', '')
    .replace(/-{2,}/g, '-')
    .replace(/-$/, '');
}

export function getFileName(label?: string, extension: string = 'json') {
  return `${hyphenateString(`${label ? formatLabel(label) : ''}${extension === 'json' ? `-${
    Date.now()}` : ''}-${new Date().toLocaleString()}`)}.${extension}`;
}
