rm -rf lib;
mkdir lib;
tsc --declaration;
rollup -c;
rm lib/automation.d.ts && rm lib/bin.d.ts && rm lib/charts.d.ts;
cp src/index.html lib/index.html;
