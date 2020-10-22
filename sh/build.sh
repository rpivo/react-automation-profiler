rm -rf lib;
mkdir lib;
tsc --declaration;
rollup -c;
rm lib/charts.util.js;
rm lib/automation.d.ts && rm lib/bin.d.ts && rm lib/charts.d.ts && rm lib/charts.util.d.ts && rm lib/watch.d.ts;
cp src/index.html lib/index.html;
