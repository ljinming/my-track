import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import pkg from '../package.json'
import resolve from 'rollup-plugin-node-resolve';
import ts from 'rollup-plugin-typescript2'


export default {
  input: 'index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
    {
      file: pkg.jsdelivr,
      format: 'umd',
      name: 'webtracing',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
       extensions:['.js', '.ts']
    }),
     ts({
        tsconfig:( 'tsconfig.json')
        }),
    json(),
    babel({
      exclude: 'node_modules/**'
    }),
  ],
};