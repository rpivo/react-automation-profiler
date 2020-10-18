import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/charts.ts',
  output: {
    dir: 'lib',
    format: 'esm',
  },
  plugins: [
    nodeResolve(),
    typescript(),
  ],
};
