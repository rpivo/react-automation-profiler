import { Automation } from 'react-automation-profiler/lib/api/index.js';

(async () => {
  try {
    const results = await Automation.run({
      averageOf: 3,
      includeMount: false,
      page: 'http://localhost:3000/three-buttons',
    });

    console.log(results);
  } catch (error) {
    console.error(error);
  }
})();
