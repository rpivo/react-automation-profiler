rm -rf lib;
mkdir lib;
tsc --declaration;
rm lib/automation.d.ts && rm lib/bin.d.ts;
cp src/index.html lib/index.html;
