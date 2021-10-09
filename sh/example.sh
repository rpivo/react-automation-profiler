npm i
cd example && npm i && cd ..
npm run build
cp package.json ./example/node_modules/react-automation-profiler
cp -r lib ./example/node_modules/react-automation-profiler/
cp ./lib/bin.js ./example/node_modules/.bin/rap
chmod +x ./example/node_modules/.bin/rap
cd example && npm run start
