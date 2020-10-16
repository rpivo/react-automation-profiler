npm run build;
echo "current published version:";
npm show react-automation-profiler version;
npx publish-diff --filter='{lib,src}/**';
