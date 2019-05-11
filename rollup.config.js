import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
    input: 'src/main.js',
    output: {
        file: 'public/bundle.js',
        format: 'iife', // immediately-invoked function expression — suitable for <script> tags
        sourcemap: true
    },
    plugins: [
        resolve({browser: true}), // tells Rollup how to find date-fns in node_modules
        commonjs(), // converts date-fns to ES modules
        copy({
          'src/index.html': 'public/index.html',
          'src/base.css': 'public/base.css',
          'src/layout': 'public/layout'
        }),
        production && terser(), // minify, but only in production
    ]
};
