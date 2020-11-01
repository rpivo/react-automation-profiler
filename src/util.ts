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

export const getFileName = (label?: string, extension: string = 'json') =>
`${hyphenateString(
  `${label ? formatLabel(label) : ''}${
    extension === 'json' ? `-${Date.now()
    }` : ''}-${new Date().toLocaleString()}`
)}.${extension}`;
