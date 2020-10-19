import yargs from 'yargs';
import runAutomation from './automation.js';

const { _: stringArray } = yargs.argv;
const options: AutomationProps = {
  cwd: '',
  includeMount: false,
  packagePath: '',
  port: 3000,
  serverPath: '',
  url: '',
};

for (const str of stringArray) {
  let [key, value] = str.split('=');
  switch (key) {
    case 'includeMount':
      options[key] = value === 'true' ? true : false;
      break;
    case 'port':
      options[key] = +value;
      break;
    default:
      options[key] = value;
  }
  if (key === 'includeMount') options[key] = !!value;
  options[key] = value;
}

runAutomation(options);
