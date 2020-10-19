import yargs from 'yargs';
// import runAutomation from './automation.js';

const options = yargs
  .option('foo', {
    describe: 'a test variable',
    type: 'string',
  })
  .argv;

console.log({ options });

// const options = yargs
//   .option('cwd', {
//     describe: 'current working directory',
//     type: 'string',
//   })
//   .option('includeMount', {
//     describe: 'should mount renders be included',
//     type: 'boolean',
//   })
//   .option('packagePath', {
//     describe: 'path to react-automation-profiler package',
//     type: 'string',
//   })
//   .option('port', {
//     describe: 'port to run the server on',
//     type: 'number',
//   })
//   .option('serverPath', {
//     describe: 'path to server',
//     type: 'string',
//   })
//   .option('url', {
//     describe: 'url to run automation against',
//     type: 'string',
//   })
//   .argv;

// const {
//   cwd = '',
//   includeMount = false,
//   packagePath = '',
//   port = 3000,
//   serverPath = '',
//   url = '',
// } = options;

// runAutomation({ cwd, includeMount, packagePath, port, serverPath, url, });
