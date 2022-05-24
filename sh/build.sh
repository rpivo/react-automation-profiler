rm -rf lib
mkdir lib
tsc
rollup -c
cp src/index.html lib/index.html
cp src/types/{AutomationProfiler.d.ts,index.d.ts} lib/
node lib/export.js
rm lib/charts/charts.js lib/charts/charts.util.js lib/export.js
