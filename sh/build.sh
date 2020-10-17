rm -rf lib;
mkdir lib;
tsc --declaration;
cp src/index.html lib/index.html;
