rm -rf lib;
mkdir lib;
tsc;
rollup -c;
cp src/index.html lib/index.html;
cp -R src/types/. lib/;
node lib/export.js;
rm lib/charts.util.js;
rm lib/export.js;
